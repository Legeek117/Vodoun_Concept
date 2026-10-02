<?php
// Vodun Concept Store — Configuration locale de l'API (À NE PAS COMMITER)
//
// Copiez ce fichier en « config.secret.php » et renseignez vos identifiants.
// Ce fichier est ignoré par git (voir .gitignore) et sera copié dans dist/
// par Vite, donc bien présent sur le serveur après upload.
return [
    'db_host'    => 'localhost',
    'db_port'    => 3306,
    'db_name'    => 'voduncon_bdd',
    'db_user'    => 'voduncon_admin',
    'db_pass'    => 'VOTRE_MOT_DE_PASSE',
    'admin_user' => 'admin',
    'admin_pass' => 'VOTRE_MOT_DE_PASSE_ADMIN',
    // Optionnel : restreindre le CORS (vide = toutes origines)
    // 'cors_origin' => 'https://vodunconceptstore.bj',
];
