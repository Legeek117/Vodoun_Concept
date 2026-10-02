<?php
// Vodun Concept Store — Configuration de l'API PHP
// Priorité : valeurs par défaut  <  config.secret.php  <  variables d'environnement
//
// Sur Plesk : soit vous renseignez les variables d'env (DB_HOST, DB_USER…),
// soit vous créez api/config.secret.php (copiez config.secret.example.php).
declare(strict_types=1);

function cfg(): array {
    static $c = null;
    if ($c !== null) return $c;

    $c = [
        'db_host'     => 'localhost',
        'db_port'     => 3306,
        'db_user'     => 'voduncon_admin',
        'db_pass'     => '',
        'db_name'     => 'voduncon_bdd',
        'admin_user'  => 'admin',
        'admin_pass'  => '',
        'cors_origin' => '*',
        'max_upload'  => 25 * 1024 * 1024,
    ];

    // 1) Surcharge locale (fichier non versionné : contient le mot de passe)
    $secret = __DIR__ . '/config.secret.php';
    if (is_file($secret)) {
        $s = require $secret;
        if (is_array($s)) {
            foreach ($s as $k => $v) {
                if ($v !== null && array_key_exists($k, $c)) $c[$k] = $v;
            }
        }
    }

    // 2) Variables d'environnement (prioritaires — utiles en test/déploiement)
    $envMap = [
        'DB_HOST'        => 'db_host',
        'DB_PORT'        => 'db_port',
        'DB_USER'        => 'db_user',
        'DB_PASSWORD'    => 'db_pass',
        'DB_NAME'        => 'db_name',
        'ADMIN_USER'     => 'admin_user',
        'ADMIN_PASSWORD' => 'admin_pass',
        'CORS_ORIGIN'    => 'cors_origin',
    ];
    foreach ($envMap as $envKey => $key) {
        $v = getenv($envKey);
        if ($v !== false && $v !== '') $c[$key] = $v;
    }
    $c['db_port'] = (int)$c['db_port'];

    return $c;
}
