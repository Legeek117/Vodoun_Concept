<?php
// Vodun Concept Store — Point d'entrée de l'API PHP 8.3+
// Toutes les routes /api/* arrivent ici (via public/.htaccess).
// Réplique exacte de l'ancienne API Node : mêmes chemins, mêmes réponses.
declare(strict_types=1);
require_once __DIR__ . '/lib.php';

$cfg = cfg();

// ── En-têtes CORS / sécurité ────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . $cfg['cors_origin']);
header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'OPTIONS') { http_response_code(204); exit; }

// ── Calcul de la route (ex. /products/42) ───────────────────────────────────
// Trois sources, par ordre de priorité — pour fonctionner avec OU sans règles
// de réécriture /api/* côté serveur :
//   1) ?r=/products        (appel direct à /api/index.php : aucun rewrite requis)
//   2) PATH_INFO           (/api/index.php/products)
//   3) REQUEST_URI         (rewrite /api/* → /api/index.php)
$route = null;
if (isset($_GET['r']) && is_string($_GET['r']) && $_GET['r'] !== '') {
    $route = '/' . trim($_GET['r'], '/');
} elseif (isset($_SERVER['PATH_INFO']) && $_SERVER['PATH_INFO'] !== '') {
    $route = '/' . trim((string)$_SERVER['PATH_INFO'], '/');
}
if ($route === null) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/api/index.php')), '/');
    $route = $uri;
    if ($scriptDir !== '' && $scriptDir !== '/' && str_starts_with($route, $scriptDir)) {
        $route = substr($route, strlen($scriptDir));
    }
    if (str_starts_with($route, '/index.php')) {
        $route = substr($route, strlen('/index.php'));
    }
    $route = '/' . trim($route, '/');
}

try {
    // L'installation (schéma + seed) ne doit pas masquer le diagnostic des routes :
    // si elle échoue (BDD injoignable), chaque route renvoie sa propre erreur.
    try { ensure_installed(); } catch (Throwable $e) { /* géré par la route */ }

    // ── Santé ───────────────────────────────────────────────────────────────
    if ($route === '/health' && $method === 'GET') {
        try {
            db()->query('SELECT 1');
            json_out(['ok' => true, 'bdd' => true, 'ts' => (int)round(microtime(true) * 1000)]);
        } catch (Throwable $e) {
            json_out(['ok' => false, 'bdd' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // ── Produits ────────────────────────────────────────────────────────────
    if ($route === '/products' && $method === 'GET') {
        $rows = db()->query('SELECT * FROM products ORDER BY name')->fetchAll();
        json_out(array_map('row_to_product', $rows));
    }

    if (preg_match('#^/products/([^/]+)$#', $route, $m) && $method === 'GET') {
        $st = db()->prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
        $st->execute([rawurldecode($m[1])]);
        $row = $st->fetch();
        if (!$row) json_out(['error' => 'Produit introuvable'], 404);
        json_out(row_to_product($row));
    }

    if ($route === '/products' && $method === 'POST') {
        require_admin();
        $p = body();
        $id = !empty($p['id']) ? (string)$p['id'] : slugify((string)($p['name'] ?? 'produit'));
        try {
            $st = db()->prepare(
                'INSERT INTO products
                   (id, name, category, collection, deity, story, description, price, image, video, delay,
                    available, is_custom_order, is_numbered, has_certificate, variants)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            $st->execute([
                $id,
                $p['name'] ?? null,
                $p['category'] ?? null,
                $p['collection'] ?? null,
                $p['deity'] ?? null,
                $p['story'] ?? null,
                $p['description'] ?? null,
                (float)($p['price'] ?? 0),
                $p['image'] ?? null,
                $p['video'] ?? null,
                $p['delay'] ?? null,
                (($p['available'] ?? true) !== false) ? 1 : 0,
                !empty($p['isCustomOrder']) ? 1 : 0,
                !empty($p['isNumbered']) ? 1 : 0,
                !empty($p['hasCertificate']) ? 1 : 0,
                (string)json_encode($p['variants'] ?? [], JSON_UNESCAPED_UNICODE),
            ]);
            json_out(['ok' => true, 'id' => $id], 201);
        } catch (PDOException $e) {
            if ((int)($e->errorInfo[1] ?? 0) === 1062) {
                json_out(['error' => 'Cet identifiant produit existe déjà'], 409);
            }
            throw $e;
        }
    }

    if (preg_match('#^/products/([^/]+)$#', $route, $m) && $method === 'PUT') {
        require_admin();
        $p = body();
        $st = db()->prepare(
            'UPDATE products SET name=?, category=?, collection=?, deity=?, story=?, description=?,
               price=?, image=?, video=?, delay=?, available=?, is_custom_order=?, is_numbered=?,
               has_certificate=?, variants=?, updated_at=CURRENT_TIMESTAMP
             WHERE id=?'
        );
        $st->execute([
            $p['name'] ?? null,
            $p['category'] ?? null,
            $p['collection'] ?? null,
            $p['deity'] ?? null,
            $p['story'] ?? null,
            $p['description'] ?? null,
            (float)($p['price'] ?? 0),
            $p['image'] ?? null,
            $p['video'] ?? null,
            $p['delay'] ?? null,
            (($p['available'] ?? true) !== false) ? 1 : 0,
            !empty($p['isCustomOrder']) ? 1 : 0,
            !empty($p['isNumbered']) ? 1 : 0,
            !empty($p['hasCertificate']) ? 1 : 0,
            (string)json_encode($p['variants'] ?? [], JSON_UNESCAPED_UNICODE),
            rawurldecode($m[1]),
        ]);
        json_out(['ok' => true]);
    }

    if (preg_match('#^/products/([^/]+)$#', $route, $m) && $method === 'DELETE') {
        require_admin();
        $st = db()->prepare('DELETE FROM products WHERE id = ?');
        $st->execute([rawurldecode($m[1])]);
        json_out(['ok' => true]);
    }

    // ── Commandes ───────────────────────────────────────────────────────────
    if ($route === '/orders' && $method === 'POST') {
        $o = body();
        if (empty($o['customer_name'])) json_out(['error' => 'Nom du client requis'], 400);
        $ref = make_ref('CMD');
        $st = db()->prepare(
            'INSERT INTO orders
               (ref, customer_name, customer_email, customer_phone, address, city, country, currency,
                total, items, payment_method, note)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $st->execute([
            $ref, $o['customer_name'], $o['customer_email'] ?? null, $o['customer_phone'] ?? null,
            $o['address'] ?? null, $o['city'] ?? null, $o['country'] ?? null,
            $o['currency'] ?? 'XOF', (float)($o['total'] ?? 0),
            (string)json_encode($o['items'] ?? [], JSON_UNESCAPED_UNICODE),
            $o['payment_method'] ?? null, $o['note'] ?? null,
        ]);
        json_out(['ok' => true, 'id' => (int)db()->lastInsertId(), 'ref' => $ref], 201);
    }

    if ($route === '/orders' && $method === 'GET') {
        require_admin();
        $rows = db()->query('SELECT * FROM orders ORDER BY id DESC')->fetchAll();
        foreach ($rows as &$r) {
            $d = json_decode((string)($r['items'] ?? '[]'), true);
            $r['items'] = is_array($d) ? $d : [];
        }
        unset($r);
        json_out($rows);
    }

    if (preg_match('#^/orders/([^/]+)/status$#', $route, $m) && $method === 'PATCH') {
        require_admin();
        $b = body();
        $st = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $st->execute([$b['status'] ?? null, rawurldecode($m[1])]);
        if ($st->rowCount() === 0) json_out(['error' => 'Commande introuvable'], 404);
        json_out(['ok' => true]);
    }

    // ── Devis B2B ───────────────────────────────────────────────────────────
    if ($route === '/quotes' && $method === 'POST') {
        $q = body();
        if (empty($q['client_name']) || empty($q['email'])) {
            json_out(['error' => 'Nom et email requis'], 400);
        }
        $ref = make_ref('DEV');
        $st = db()->prepare(
            'INSERT INTO quotes
               (ref, client_name, email, phone, domain, project_title, message, details)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $st->execute([
            $ref, $q['client_name'], $q['email'], $q['phone'] ?? null, $q['domain'] ?? null,
            $q['project_title'] ?? null, $q['message'] ?? null,
            (string)json_encode($q['details'] ?? new stdClass(), JSON_UNESCAPED_UNICODE),
        ]);
        json_out(['ok' => true, 'id' => (int)db()->lastInsertId(), 'ref' => $ref], 201);
    }

    if ($route === '/quotes' && $method === 'GET') {
        require_admin();
        $rows = db()->query('SELECT * FROM quotes ORDER BY id DESC')->fetchAll();
        foreach ($rows as &$r) {
            $d = json_decode((string)($r['details'] ?? '{}'), true);
            $r['details'] = is_array($d) ? $d : new stdClass();
        }
        unset($r);
        json_out($rows);
    }

    if (preg_match('#^/quotes/([^/]+)/status$#', $route, $m) && $method === 'PATCH') {
        require_admin();
        $b = body();
        $st = db()->prepare('UPDATE quotes SET status = ? WHERE id = ?');
        $st->execute([$b['status'] ?? null, rawurldecode($m[1])]);
        if ($st->rowCount() === 0) json_out(['error' => 'Devis introuvable'], 404);
        json_out(['ok' => true]);
    }

    // ── Réglages ────────────────────────────────────────────────────────────
    if ($route === '/settings' && $method === 'GET') {
        $rows = db()->query('SELECT `key`, `value` FROM settings')->fetchAll();
        $out = new stdClass();
        foreach ($rows as $r) $out->{$r['key']} = $r['value'];
        json_out($out);
    }

    if ($route === '/settings' && $method === 'PUT') {
        require_admin();
        $data = body();
        // MariaDB : upsert idempotent (évite le bug UPDATE→INSERT de l'ancien backend)
        $st = db()->prepare(
            'INSERT INTO settings (`key`, `value`) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)'
        );
        foreach ($data as $k => $v) {
            $st->execute([(string)$k, js_string($v)]);
        }
        json_out(['ok' => true]);
    }

    // ── Auth admin ──────────────────────────────────────────────────────────
    if ($route === '/auth/login' && $method === 'POST') {
        $b = body();
        $username = (string)($b['username'] ?? '');
        $password = (string)($b['password'] ?? '');
        $st = db()->prepare('SELECT * FROM admins WHERE username = ? LIMIT 1');
        $st->execute([$username]);
        $row = $st->fetch();
        if (!$row || !verify_password($password, (string)$row['password_hash'])) {
            json_out(['error' => 'Identifiants invalides'], 401);
        }
        // Migration douce : hash sha256 (ancien Node) → password_hash (PHP)
        if (!str_starts_with((string)$row['password_hash'], '$2')) {
            $up = db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?');
            $up->execute([password_hash($password, PASSWORD_DEFAULT), $row['id']]);
        }
        $token = bin2hex(random_bytes(24));
        $up = db()->prepare('UPDATE admins SET token = ? WHERE id = ?');
        $up->execute([$token, $row['id']]);
        json_out(['ok' => true, 'token' => $token, 'username' => $row['username']]);
    }

    // ── Upload d'image (multipart, champ « image ») ─────────────────────────
    if ($route === '/upload' && $method === 'POST') {
        require_admin();
        if (!isset($_FILES['image'])) json_out(['error' => 'Aucun fichier reçu (champ "image")'], 400);
        $f = $_FILES['image'];
        if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            json_out(['error' => 'Aucun fichier reçu (champ "image")'], 400);
        }
        if (($f['size'] ?? 0) > $cfg['max_upload']) json_out(['error' => 'Fichier trop volumineux'], 413);
        if (!is_uploaded_file((string)$f['tmp_name'])) json_out(['error' => 'Upload invalide'], 400);

        $uploadsDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0775, true);
        protect_uploads_dir($uploadsDir);

        $data = (string)file_get_contents((string)$f['tmp_name']);

        // Conversion WebP via GD (équivalent de sharp)
        if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
            $img = @imagecreatefromstring($data);
            if ($img !== false) {
                $img = gd_auto_rotate($img, (string)$f['tmp_name']);
                $w = imagesx($img);
                $h = imagesy($img);
                if ($w > 1600) {
                    $nh = (int)round($h * 1600 / $w);
                    $scaled = imagescale($img, 1600, $nh);
                    if ($scaled !== false) { imagedestroy($img); $img = $scaled; }
                }
                if (function_exists('imagepalettetotruecolor') && function_exists('imageistruecolor') && !imageistruecolor($img)) {
                    @imagepalettetotruecolor($img);
                }
                $filename = time() . '-' . bin2hex(random_bytes(4)) . '.webp';
                $ok = @imagewebp($img, $uploadsDir . '/' . $filename, 82);
                imagedestroy($img);
                if ($ok) {
                    json_out([
                        'ok' => true, 'url' => '/uploads/' . $filename,
                        'width' => $w, 'height' => $h, 'optimized' => true,
                    ], 201);
                }
            }
        }

        // Repli : on conserve l'image d'origine
        $ext = mime_ext((string)($f['type'] ?? ''), (string)($f['name'] ?? ''));
        $filename = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
        if (!move_uploaded_file((string)$f['tmp_name'], $uploadsDir . '/' . $filename)) {
            json_out(['error' => "Traitement d'image impossible"], 500);
        }
        json_out([
            'ok' => true, 'url' => '/uploads/' . $filename, 'optimized' => false,
            'warning' => 'Image non convertie (GD/WebP indisponible sur ce serveur)',
        ], 201);
    }

    json_out(['error' => 'Route inconnue'], 404);

} catch (PDOException $e) {
    json_out(['error' => 'Erreur BDD'], 500);
} catch (Throwable $e) {
    json_out(['error' => 'Erreur serveur'], 500);
}
