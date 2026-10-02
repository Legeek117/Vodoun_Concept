-- =====================================================================
--  Ajout des ROLES et du NOM DE PROFIL aux comptes administrateurs
-- =====================================================================
--  A executer une seule fois sur une base existante :
--    phpMyAdmin > onglet SQL > coller > Executer
--    ou en CLI :  mariadb -u USER -p NOM_DE_BASE < migrate-admin-roles.sql
--
--  NB : l'API PHP applique cette migration automatiquement au premier
--  appel. Ce script est fourni pour les installations manuelles.
--
--  Roles possibles :
--    'admin'    -> acces complet (dont la gestion des utilisateurs)
--    'gestion'  -> acces complet SAUF la gestion des utilisateurs
-- =====================================================================

SET NAMES utf8mb4;

ALTER TABLE `admins`
  ADD COLUMN IF NOT EXISTS `display_name` VARCHAR(128) NULL AFTER `username`,
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(32) NOT NULL DEFAULT 'admin' AFTER `password_hash`;

-- Tout compte historique sans role explicite devient administrateur.
UPDATE `admins` SET `role` = 'admin' WHERE `role` IS NULL OR `role` = '';

-- Verification
SELECT `id`, `username`, `display_name`, `role`, `created_at` FROM `admins` ORDER BY `id`;
