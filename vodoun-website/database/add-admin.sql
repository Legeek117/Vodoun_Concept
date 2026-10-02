-- =====================================================================
--  Vodun Concept Store - ajout d'un compte administrateur
-- =====================================================================
--  A executer dans phpMyAdmin (onglet SQL), base du site selectionnee,
--  ou en CLI :  mariadb -u USER -p NOM_DE_BASE < add-admin.sql
--
--  >>> Modifiez le nom d'utilisateur et le mot de passe ci-dessous. <<<
--
--  Le mot de passe est stocke en SHA-256 (fonction MySQL SHA2) : l'API
--  l'accepte et le migre automatiquement en bcrypt (password_hash) des
--  le premier login.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. Creer le nouvel administrateur
--    (ON DUPLICATE KEY UPDATE : si le compte existe deja, son mot de
--     passe est reinitialise au lieu de provoquer une erreur)
-- ---------------------------------------------------------------------
INSERT INTO `admins` (`username`, `password_hash`, `token`)
VALUES ('gestion', SHA2('MotDePasseSolide!2026', 256), NULL)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

-- ---------------------------------------------------------------------
-- 2. Verification : liste des administrateurs
--    - prefixe '$2y$'   = bcrypt (deja migre)
--    - prefixe hex 64   = SHA-256 (sera migre au prochain login)
-- ---------------------------------------------------------------------
SELECT `id`,
       `username`,
       LEFT(`password_hash`, 7) AS `type_hash`,
       `created_at`
FROM `admins`
ORDER BY `id`;


-- =====================================================================
--  ANNEXES (facultatif, a decommenter si besoin)
-- =====================================================================

-- Reinitialiser le mot de passe d'un compte existant :
-- UPDATE `admins` SET `password_hash` = SHA2('NouveauMotDePasse', 256)
-- WHERE `username` = 'gestion';

-- Supprimer un compte administrateur :
-- DELETE FROM `admins` WHERE `username` = 'gestion';

-- Lier un compte a un mot de passe deja hache en bcrypt (plus robuste) :
--   1) generer le hash en ligne de commande :
--      php -r "echo password_hash('MotDePasse', PASSWORD_DEFAULT), PHP_EOL;"
--   2) coller le hash (commencant par $2y$) ci-dessous :
-- INSERT INTO `admins` (`username`, `password_hash`, `token`)
-- VALUES ('gestion', '$2y$10$.........', NULL)
-- ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);
