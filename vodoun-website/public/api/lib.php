<?php
// Vodun Concept Store — Bibliothèque de l'API PHP
// Réplique exacte de l'ancien backend Node (server/db.js + server/api.js) :
// mêmes routes, mêmes réponses JSON, même schéma MariaDB.
declare(strict_types=1);
require_once __DIR__ . '/config.php';

// ── Réponses / entrées ──────────────────────────────────────────────────────
function json_out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

// Équivalent de String(v) en JavaScript (pour les réglages)
function js_string($v): string {
    if (is_bool($v)) return $v ? 'true' : 'false';
    if ($v === null) return '';
    if (is_scalar($v)) return (string)$v;
    return (string)json_encode($v, JSON_UNESCAPED_UNICODE);
}

// ── Connexion BDD (PDO / MariaDB) ───────────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $c = cfg();
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['db_host'], $c['db_port'], $c['db_name']);
    $pdo = new PDO($dsn, (string)$c['db_user'], (string)$c['db_pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// ── Authentification admin ──────────────────────────────────────────────────
function bearer_token(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($auth === '' && function_exists('apache_request_headers')) {
        foreach (apache_request_headers() as $k => $v) {
            if (strcasecmp($k, 'Authorization') === 0) { $auth = (string)$v; break; }
        }
    }
    if ($auth !== '' && preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) return trim($m[1]);
    // Repli : certains serveurs (nginx/PHP-FPM) retirent l'en-tête Authorization.
    // Le front envoie alors le même jeton dans X-Admin-Token.
    $alt = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (is_string($alt) && $alt !== '') return trim($alt);
    return null;
}

function require_admin(): array {
    $token = bearer_token();
    if ($token === null) json_out(['error' => 'Authentification requise'], 401);
    $st = db()->prepare('SELECT id, username FROM admins WHERE token = ? LIMIT 1');
    $st->execute([$token]);
    $row = $st->fetch();
    if (!$row) json_out(['error' => 'Token invalide'], 401);
    return $row;
}

// Compatible avec l'ancien hash sha256 (Node) et les nouveaux password_hash()
function verify_password(string $pass, string $hash): bool {
    if (str_starts_with($hash, '$2y$') || str_starts_with($hash, '$2a$') || str_starts_with($hash, '$argon')) {
        return password_verify($pass, $hash);
    }
    return hash_equals($hash, hash('sha256', $pass));
}

// ── Divers ──────────────────────────────────────────────────────────────────
function make_ref(string $prefix): string {
    return sprintf('%s-%s-%s', $prefix, date('Ymd'), strtoupper(bin2hex(random_bytes(2))));
}

function slugify(string $s): string {
    $s = trim($s);
    if (function_exists('transliterator_transliterate')) {
        $t = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $s);
        if ($t !== false && $t !== '') $s = $t;
    } elseif (function_exists('iconv')) {
        $t = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s);
        if ($t !== false) $s = $t;
    }
    $s = strtolower($s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

function row_to_product(array $r): array {
    $variants = [];
    if (isset($r['variants']) && $r['variants'] !== null && $r['variants'] !== '') {
        $d = json_decode((string)$r['variants'], true);
        if (is_array($d)) $variants = $d;
    }
    $price = (float)$r['price'];
    if ($price == (int)$price) $price = (int)$price; // 150000 et non 150000.0 (comme Node)
    return [
        'id'             => $r['id'],
        'name'           => $r['name'],
        'category'       => $r['category'],
        'collection'     => $r['collection'],
        'deity'          => $r['deity'],
        'story'          => $r['story'],
        'description'    => $r['description'],
        'price'          => $price,
        'image'          => $r['image'],
        'video'          => $r['video'],
        'delay'          => $r['delay'],
        'available'      => ((int)$r['available'] === 1),
        'isCustomOrder'  => ((int)$r['is_custom_order'] === 1),
        'isNumbered'     => ((int)$r['is_numbered'] === 1),
        'hasCertificate' => ((int)$r['has_certificate'] === 1),
        'variants'       => $variants,
        'createdAt'      => $r['created_at'],
    ];
}

// ── Schéma MariaDB (identique à server/db.js) ───────────────────────────────
function schema_statements(): array {
    return [
        <<<'SQL'
CREATE TABLE IF NOT EXISTS products (
  id                VARCHAR(128) NOT NULL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  category          VARCHAR(128),
  collection        VARCHAR(128),
  deity             VARCHAR(128),
  story             TEXT,
  description       TEXT,
  price             DECIMAL(12,2) NOT NULL DEFAULT 0,
  image             VARCHAR(512),
  video             VARCHAR(512),
  delay             VARCHAR(64),
  available         TINYINT(1) NOT NULL DEFAULT 1,
  is_custom_order   TINYINT(1) NOT NULL DEFAULT 0,
  is_numbered       TINYINT(1) NOT NULL DEFAULT 0,
  has_certificate   TINYINT(1) NOT NULL DEFAULT 0,
  variants          LONGTEXT NOT NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL,
        <<<'SQL'
CREATE TABLE IF NOT EXISTS orders (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref           VARCHAR(32) UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(64),
  address       VARCHAR(512),
  city          VARCHAR(128),
  country       VARCHAR(128),
  currency      VARCHAR(16) NOT NULL DEFAULT 'XOF',
  total         DECIMAL(12,2) DEFAULT 0,
  items         LONGTEXT NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'nouvelle',
  payment_method VARCHAR(64),
  note          TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL,
        <<<'SQL'
CREATE TABLE IF NOT EXISTS quotes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref           VARCHAR(32) UNIQUE,
  client_name   VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(64),
  domain        VARCHAR(128),
  project_title VARCHAR(255),
  message       TEXT,
  details       LONGTEXT NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'nouvelle',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL,
        <<<'SQL'
CREATE TABLE IF NOT EXISTS settings (
  `key`   VARCHAR(128) NOT NULL PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL,
        <<<'SQL'
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  token         VARCHAR(128),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
SQL,
    ];
}

function seed_products(PDO $pdo): void {
    $n = (int)$pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    if ($n > 0) return;
    $file = __DIR__ . '/seed-products.json';
    if (!is_file($file)) return;
    $items = json_decode((string)file_get_contents($file), true);
    if (!is_array($items)) return;
    $st = $pdo->prepare(
        'INSERT IGNORE INTO products
          (id, name, category, collection, deity, story, description, price, image, video, delay,
           available, is_custom_order, is_numbered, has_certificate, variants)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    foreach ($items as $p) {
        $st->execute([
            $p['id'], $p['name'],
            $p['category'] ?? null, $p['collection'] ?? null, $p['deity'] ?? null,
            $p['story'] ?? null, $p['description'] ?? null,
            (float)($p['price'] ?? 0), $p['image'] ?? null, $p['video'] ?? null,
            $p['delay'] ?? null, (($p['available'] ?? true) !== false) ? 1 : 0,
            !empty($p['isCustomOrder']) ? 1 : 0, !empty($p['isNumbered']) ? 1 : 0,
            !empty($p['hasCertificate']) ? 1 : 0,
            (string)json_encode($p['variants'] ?? [], JSON_UNESCAPED_UNICODE),
        ]);
    }
}

function seed_admin(PDO $pdo): void {
    $n = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if ($n > 0) return;
    $c = cfg();
    $user = (string)$c['admin_user'];
    if ($c['admin_pass'] !== '') {
        $pass = (string)$c['admin_pass'];
    } else {
        $pass = bin2hex(random_bytes(6));
        error_log("[vodun] ADMIN_PASSWORD non défini — mot de passe provisoire : {$pass}");
    }
    $st = $pdo->prepare('INSERT INTO admins (username, password_hash, token) VALUES (?,?,?)');
    $st->execute([$user, password_hash($pass, PASSWORD_DEFAULT), bin2hex(random_bytes(24))]);
}

function install(): void {
    $pdo = db();
    foreach (schema_statements() as $stmt) {
        $pdo->exec($stmt);
    }
    seed_products($pdo);
    seed_admin($pdo);
}

// Crée le schéma + le seed si nécessaire (idempotent, exécuté au premier appel)
function ensure_installed(): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $tables = db()->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $need = ['products', 'orders', 'quotes', 'settings', 'admins'];
    if (array_diff($need, $tables)) install();
}

// ── Upload : helpers image ──────────────────────────────────────────────────
function protect_uploads_dir(string $dir): void {
    $ht = $dir . '/.htaccess';
    if (is_file($ht)) return;
    @file_put_contents(
        $ht,
        "# Interdit toute exécution de script dans les uploads\n" .
        "<FilesMatch \"\\.(php|phtml|phar|php[0-9])$\">\n  Require all denied\n</FilesMatch>\n"
    );
}

function mime_ext(string $mime, string $name): string {
    $map = [
        'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
        'image/gif' => 'gif', 'image/avif' => 'avif', 'image/tiff' => 'tiff',
    ];
    if (isset($map[$mime])) return $map[$mime];
    $e = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    return preg_match('/^[a-z0-9]{1,5}$/', $e) ? $e : 'bin';
}

function gd_auto_rotate($img, string $path) {
    if (!function_exists('exif_read_data')) return $img;
    $info = @getimagesize($path);
    if (!$info || ($info['mime'] ?? '') !== 'image/jpeg') return $img;
    $exif = @exif_read_data($path);
    $o = (int)($exif['Orientation'] ?? 1);
    if (in_array($o, [3, 6, 8], true)) {
        $deg = $o === 3 ? 180 : ($o === 6 ? -90 : 90);
        $r = @imagerotate($img, $deg, 0);
        if ($r !== false) { imagedestroy($img); return $r; }
    }
    return $img;
}
