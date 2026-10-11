-- =====================================================================
--  Vodun Concept Store - Base de donnees MariaDB / MySQL 8
-- =====================================================================
--  Compatible MariaDB 10.11+ / MySQL 8.
--  Import via phpMyAdmin : onglet "Importer" -> choisir ce fichier.
--  En ligne de commande :  mariadb -u USER -p < voduncon_bdd.sql
--
--  Ce script est IDEMPOTENT : CREATE TABLE IF NOT EXISTS / INSERT IGNORE
--  => peut être rejoué sans risque.
--
--  AVANT IMPORT :
--  1. Remplacez le mot de passe admin (cherchez "ChangezMoi-2026!")
--  2. Adaptez le nom de la base si Plesk le préfixe
--  3. Reportez les identifiants dans public/api/config.secret.php
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `voduncon_bdd`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `voduncon_bdd`;


-- =====================================================================
-- 1. TABLES
-- =====================================================================

-- -------------------------------------------------------------------
-- products : catalogue complet
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                VARCHAR(128)   NOT NULL PRIMARY KEY,
  name              VARCHAR(255)   NOT NULL,
  category          VARCHAR(128),
  collection        VARCHAR(128),
  deity             VARCHAR(128),
  story             TEXT,
  description       TEXT,
  price             DECIMAL(12,2)  NOT NULL DEFAULT 0,
  image             VARCHAR(512),
  video             VARCHAR(512),
  delay             VARCHAR(64),
  available         TINYINT(1)     NOT NULL DEFAULT 1,
  is_custom_order   TINYINT(1)     NOT NULL DEFAULT 0,
  is_numbered       TINYINT(1)     NOT NULL DEFAULT 0,
  has_certificate   TINYINT(1)     NOT NULL DEFAULT 0,
  variants          LONGTEXT       NOT NULL DEFAULT '[]',
  created_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_category  (category),
  KEY idx_deity     (deity),
  KEY idx_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- orders : commandes passées sur le site
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref              VARCHAR(32)    UNIQUE,
  customer_name    VARCHAR(255)   NOT NULL,
  customer_email   VARCHAR(255),
  customer_phone   VARCHAR(64),
  address          VARCHAR(512),
  city             VARCHAR(128),
  country          VARCHAR(128),
  currency         VARCHAR(16)    NOT NULL DEFAULT 'XOF',
  total            DECIMAL(12,2)  DEFAULT 0,
  items            LONGTEXT       NOT NULL,
  status           VARCHAR(32)    NOT NULL DEFAULT 'nouvelle',
  payment_method   VARCHAR(64),
  note             TEXT,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status      (status),
  KEY idx_created_at  (created_at),
  KEY idx_email       (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- quotes : demandes de devis B2B
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
  id            INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ref           VARCHAR(32)    UNIQUE,
  client_name   VARCHAR(255)   NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(64),
  domain        VARCHAR(128),
  project_title VARCHAR(255),
  message       TEXT,
  details       LONGTEXT       NOT NULL DEFAULT '{}',
  status        VARCHAR(32)    NOT NULL DEFAULT 'nouvelle',
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_status     (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- contacts : messages du formulaire de contact
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  email       VARCHAR(255)   NOT NULL,
  phone       VARCHAR(64),
  subject     VARCHAR(255),
  message     TEXT           NOT NULL,
  read_at     TIMESTAMP      NULL DEFAULT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  KEY idx_read_at    (read_at),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- users : clients / comptes (suivi commandes)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)   NOT NULL UNIQUE,
  name          VARCHAR(255),
  phone         VARCHAR(64),
  password_hash VARCHAR(128),
  role          VARCHAR(32)    NOT NULL DEFAULT 'customer',
  token         VARCHAR(128)   NULL,
  verified      TINYINT(1)     NOT NULL DEFAULT 0,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role       (role),
  KEY idx_verified   (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- admins : comptes administrateurs du back-office
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(128)   NOT NULL UNIQUE,
  display_name  VARCHAR(128),
  password_hash VARCHAR(128)   NOT NULL,
  role          VARCHAR(32)    NOT NULL DEFAULT 'admin',
  -- Rôles disponibles : 'superadmin' | 'admin' | 'editor'
  token         VARCHAR(128)   NULL,
  last_login    TIMESTAMP      NULL DEFAULT NULL,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- settings : réglages du site (gérés via l'interface admin)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  `key`    VARCHAR(128)  NOT NULL PRIMARY KEY,
  `value`  TEXT,
  updated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================================
-- 2. PRODUITS (catalogue initial)
-- =====================================================================
INSERT IGNORE INTO `products` (`id`,`name`,`category`,`collection`,`deity`,`story`,`description`,`price`,`image`,`video`,`delay`,`available`,`is_custom_order`,`is_numbered`,`has_certificate`,`variants`) VALUES
('5-panel-classic','5-Panel classic','Mode','Tous','Tous','Urbain et identitaire. Logo brodé en or véritable, fermeture arrière avec encoche en laiton lourd gravée au symbole de la marque. Une casquette 5 panneaux à l\'allure résolument premium.','Logo brodé or, fermeture laiton gravé du symbole de la marque.',9000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'["Taille Unique"]'),
('bougeoir-sculpte-bois','Bougeoir sculpté bois','Décoration','Univers Ogou','Ogou','Dans l\'intimité, le feu éclaire la voie. Massif, trapu et élégant, ce bougeoir taillé à même la souche du bois tropical béninois arbore les silhouettes longilignes de nos gardiens tutélaires.','Bois massif béninois, formes symboliques ciselées.',25000.00,'/Led.webp',NULL,'En stock · 2 à 4 jours',1,0,0,0,'["Taille unique"]'),
('bracelet-puissance','Bracelet de Puissance','Accessoires','Par divinité','Tous','Un bracelet Vodun n\'est pas un bijou. C\'est une protection. Perles Asso aux couleurs codées par divinité, ou joncs en bronze coulé à l\'ancienne. Chaque bracelet est livré avec son certificat de symbolique.','Perles Asso couleurs codées ou bronze coulé, avec certificat.',3500.00,'/Bracelets de puissance.webp','/b19e787ca1fc41728cd6725092ba5736.mp4','En stock · 3 à 5 jours',1,0,0,1,'["Perles Asso — Dan","Perles Asso — Legba","Perles Asso — Sakpata","Perles Asso — Mami Wata","Joncs Bronze","Cuir & Métal Legba","Lapis-lazuli Dan"]'),
('bucket-hat-wax','Bucket Hat Wax Premium','Mode','Tous','Tous','La tête se couronne aussi. Bucket hat en wax premium béninois, motifs géométriques Vodun, doublure soie, édition numérotée.','Tissu wax premium, motifs géométriques Vodun, doublure soie.',12000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'["S/M","L/XL"]'),
('bureaux-espaces-commerciaux','Bureaux & Commerces','Mobilier','Tous','Tous','Une marque qui vous ressemble, jusque dans les murs. Du bureau de direction en bois massif noir incrusté d\'or au comptoir d\'accueil gravé.','Aménagement sur mesure B2B.',1200000.00,'/Mobilier Résidentiel.webp',NULL,'Projets professionnels (Sur étude)',1,1,0,0,'["Sur Devis - Projet sur mesure"]'),
('chemises-col-mao','Chemises Col Mao','Mode','Tous','Tous','L\'élégance posée. La chemise col mao réinterprète le vestiaire formel avec des broderies géométriques tirées des vévés et des boutons de bois tournés.','Col mao, broderies géométriques, boutons bois.',35000.00,'/T-shirts sérigraphiés.webp',NULL,'2 à 3 semaines',1,0,0,0,'["S","M","L","XL"]'),
('cristal-de-la-prosperite','Cristal de la Prospérité','Décorations Festives','Univers Sakpata','Sakpata','Petite par la taille, grande par le sens. Le Cristal de la Prospérité enferme de vrais cauris et des vévés dorés dans une sphère de verre transparent.','Sphère décorative en verre et cauris : symbole d\'abondance.',18000.00,'/Cristal de la prospérité.webp',NULL,'1 à 2 semaines',1,0,0,0,'["S","L"]'),
('dad-hat-brode','Dad Hat brodé','Mode','Tous','Tous','La tête se couronne aussi. Coton brossé 6 panneaux, broderie vévé ton-sur-ton.','Coton brossé 6 panneaux, broderie vévé ton-sur-ton.',8000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'["Taille Unique"]'),
('decorations-presences','Présences (Décoration)','Décoration','Tous','Tous','Ces objets ne meublent pas un espace. Ils l\'habitent. Masques contemporains, bas-reliefs peints, sculptures Bocio originales.','Masques, sculptures, textiles muraux. Œuvres d\'art décoratives.',85000.00,'/Mobilier Résidentiel.webp',NULL,'4 à 6 semaines',1,1,0,0,'["Masque contemporain","Bas-relief peint","Sculpture Bocio","Textile mural","Miroir gravé"]'),
('hotels-restaurants-b2b','Hôtels & Restaurants','Mobilier','Tous','Tous','Habiller votre espace d\'une identité africaine d\'exception. Mobilier de salle à motifs vévés, luminaires sur mesure pour lobbies premium.','Aménagement sur mesure B2B pour hôtels et restaurants, signature afro-premium.',1500000.00,'/Mobilier Résidentiel.webp',NULL,'Projets architecturaux (Sur étude)',1,1,0,0,'["Sur Devis - Étude architecturale"]'),
('kufi-premium','Kufi premium','Mode','Tous','Tous','L\'icône des gardiens du rituel. Tissu local wax revisité avec subtilité, doublure en pur satin noir pour préserver le cheveu.','Tissu local wax, doublure satin noir, édition limitée signée.',15000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'["S/M","L/XL"]'),
('la-couronne-de-loracle','La Couronne de l\'Oracle','Décorations Festives','Univers Legba','Legba','Sur une porte, une vitrine ou un mur, la Couronne de l\'Oracle annonce la fête tout en racontant une histoire.','Couronne de cauris : l\'accueil festif du seuil.',42000.00,'/La courone de l\'oracle.webp',NULL,'1 à 2 semaines',1,0,0,0,'["Ø50","Ø80"]'),
('la-pluie-de-cauris','La Pluie de Cauris','Décorations Festives','Univers Mami Wata','Mami Wata','Ni mur, ni vide : un voile. La Pluie de cauris tombe du plafond en rideaux scintillants qui séparent sans cloisonner.','Cloisons de lumière en cauris, fils d\'or et micro-LED. Modulaire et sur mesure.',250000.00,'/La pluie de cauris.webp',NULL,'4 à 6 semaines',1,1,0,0,'["2m — Or","2m — Noir Mat","2m — Bois Naturel","5m — Or","5m — Noir Mat","10m — Or"]'),
('la-voute-celeste','La Voûte Céleste','Décorations Festives','Univers Mami Wata','Mami Wata','Le cauris fut monnaie, parure et oracle. Suspendu par milliers, il devient ici un ciel.','Installations lumineuses grand format en cauris.',550000.00,'/La Voute céleste.webp',NULL,'6 à 8 semaines',1,1,0,0,'["Sur mesure"]'),
('lampe-raphia-tresse','Lampe raphia tressé','Décoration','Tous','Tous','La chaleur des fibres naturelles locales au service de la lumière sacrée. Fabriquée par nos artisans tresseurs.','Abat-jour en fibres naturelles locales, lumière tamisée chaude.',45000.00,'/Led.webp',NULL,'2 à 3 semaines',1,0,0,0,'["S","M","L"]'),
('lanterne-bronze','Lanterne bronze','Décoration','Tous','Tous','L\'art du métal au service de la foi. De lourdes feuilles de bronze soigneusement découpées au laser suivant des motifs géométriques millénaires.','Motifs géométriques découpés au laser, édition artisanale bronze.',110000.00,'/Led.webp',NULL,'4 semaines',1,0,0,0,'["Petit format","Grand format"]'),
('lanternes-ceremoniales','Lanternes Cérémonielles','Décorations Festives','Univers Xevioso','Xevioso','Suspendues en guirlandes au-dessus d\'une place ou d\'un marché, les Lanternes Cérémonielles ravivent l\'esprit de fête.','Lanternes festives multicolores inspirées des masques traditionnels.',25000.00,'/Lanternes Cérémonielles.webp',NULL,'1 semaine',1,0,0,0,'["Set de 3","Set de 6","Set de 12"]'),
('le-nuage-de-cauris','Le Nuage de Cauris','Décorations Festives','Univers Mami Wata','Mami Wata','Imaginez un nuage descendu se poser dans un salon. Le Nuage de cauris est une suspension organique faite de centaines de coquillages nacrés.','Suspensions sculpturales en cauris, en forme de nuages de lumière.',180000.00,'/Le nuage de cauris.webp',NULL,'3 à 4 semaines',1,0,0,0,'["S","M","XL"]'),
('le-rideau-patrimoine','Le Rideau Patrimoine','Décorations Festives','Tous','Tous','Quand une marque ou une nation veut inscrire son identité dans la lumière, le Rideau Patrimoine répond.','Installations sur mesure, symboles Vodun illuminés, grand format.',850000.00,'/Le Rideau Patrimoine.webp',NULL,'Sur devis (projet architectural)',1,1,0,0,'["Sur devis"]'),
('le-sentinelle','Le Sentinelle','Décorations Festives','Univers Legba','Legba','Gardiens de nuit du patrimoine Vodun, les Sentinelles veillaient autrefois sur les passages et les seuils.','Lanternes festives multicolores inspirées des masques traditionnels.',120000.00,'/Le Sentinelle.webp',NULL,'2 à 4 semaines',1,0,0,0,'["1.5m","2m"]'),
('le-trone-de-direction','Le Trône de Direction','Mobilier','Univers Ogou','Ogou','La pièce signature. Bois massif sculpté à la main, laque noire mate et incrustations or, vévés gravés en relief, cuir pleine fleur capitonné.','Bois massif sculpté, laque noire + incrustations or, cuir pleine fleur. Pièce unique signée.',750000.00,'/Le trône de direction.webp',NULL,'4 à 6 semaines · Pièce unique signée',1,1,1,0,'["Finition Or — Cuir Noir","Finition Or — Cuir Brun"]'),
('le-veilleur','Le Veilleur','Décorations Festives','Univers Legba','Legba','Le Veilleur se tient à l\'entrée comme une présence bienveillante. Sa partie haute, en métal perforé au laser, projette des vévés de lumière.','Totems de lumière en métal perforé et raphia naturel. H 1m à 3m, personnalisable.',150000.00,'/Le veilleur.webp',NULL,'3 à 5 semaines',1,1,0,0,'["1m — Dan","1m — Legba","2m — Dan","2m — Legba","3m — Dan","3m — Legba"]'),
('les-perles-de-locean','Les Perles de l\'Océan','Décorations Festives','Univers Dan','Dan','Chaque perle est un océan condensé : des cauris sertis d\'or autour d\'un cœur de lumière.','Boules lumineuses de cauris, suspendues ou sur socle.',35000.00,'/Les perles de l\'océan.webp',NULL,'2 à 3 semaines',1,0,0,0,'["Ø20 (suspendu)","Ø40 (suspendu)","Ø80 (suspendu)","Ø80 (sur socle)","Ø120 (sur socle)"]'),
('maroquinerie-sacoches','Maroquinerie & Sacoches','Accessoires','Tous','Tous','L\'élégance du cuir rencontrant l\'artisanat béninois. Des sacoches et accessoires de maroquinerie conçus pour durer.','Cuir véritable, tannage artisanal, motifs gravés.',45000.00,'/Maroquinerie & sacoches.webp',NULL,'1 à 2 semaines',1,0,0,0,'["Tote bag coton","Pochette cuir","Sacoche bandoulière","Sac cabas raphia","Sacoche Business"]'),
('mobilier-residentiel','Mobilier Résidentiel','Mobilier','Tous','Tous','Du mobilier qui se transmet. Sièges sculptés à la pyrogravure, tables aux pieds de fer forgé symbolique.','Bois massif béninois, pyrogravure, incrustations métal — pièce unique signée.',450000.00,'/Mobilier Résidentiel.webp',NULL,'6 à 10 semaines · Pièce unique signée',1,1,0,0,'["Siège sculpté","Table & Console","Lit & Tête de lit","Rangement"]'),
('montre-artisanale','Montre Artisanale Vodun','Accessoires','Tous','Tous','Le temps, gravé dans le bois du Bénin. Chaque montre est une pièce numérotée : boîtier en bois local ou métal forgé, cadran orné d\'un vévé.','Boîtier bois ou métal forgé, cadran vévé, éditions numérotées.',65000.00,'/Montres Artisanales.webp',NULL,'3 à 4 semaines · Gravure personnalisée incluse',1,1,1,0,'["Bois + Cuir","Bois + Raphia","Métal + Cuir","Métal + Raphia"]'),
('suspension-metal-perfore','Suspension métal perforé','Décoration','Univers Xevioso','Xevioso','Des ombres sacrées sur vos murs. Inspirée des lanternes royales, cette suspension en métal travaillé diffuse la lumière à travers des ornementations percées.','Projette des ombres de vévés, ambiance unique et mémorable.',65000.00,'/Led.webp',NULL,'3 à 5 semaines',1,0,0,0,'["Bronze","Noir mat","Or patiné"]'),
('t-shirt-serigraphie','T-shirt Sérigraphié Vévé','Mode','Tous','Tous','Porter le sacré au quotidien. Chaque t-shirt est une toile : un vévé sérigraphié à l\'or ou en ton-sur-ton, tiré des symboles du panthéon.','Coton 220g/m², motifs vévés, collections par divinités.',8000.00,'/T-shirts sérigraphiés.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'["XS","S","M","L","XL","3XL"]');


-- =====================================================================
-- 3. COMPTE ADMINISTRATEUR INITIAL
-- =====================================================================
--
--  SECURITE : Changez IMPERATIVEMENT 'ChangezMoi-2026!' avant l'import.
--  Le mot de passe est stocké en SHA-256 ici pour bootstrapping ;
--  l'API PHP le migre automatiquement en bcrypt dès le premier login.
--
--  Pour changer le mot de passe après import :
--    UPDATE admins SET password_hash = SHA2('NouveauMotDePasse', 256)
--    WHERE username = 'admin';
--
INSERT IGNORE INTO `admins` (`username`, `display_name`, `password_hash`, `role`, `token`)
VALUES ('admin', 'Administrateur', SHA2('ChangezMoi-2026!', 256), 'superadmin', NULL);


-- =====================================================================
-- 4. REGLAGES PAR DEFAUT
-- =====================================================================
INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
  ('contactEmail',    'contact@vodunconceptstore.bj'),
  ('whatsapp',        '+229 97 00 00 00'),
  ('instagram',       '@vodun.concept'),
  ('facebook',        'vodunconceptstore'),
  ('currency_default','XOF'),
  ('site_name',       'Vodun Concept Store'),
  ('site_url',        'https://vodunconceptstore.bj');


-- =====================================================================
-- Fin du script.
-- =====================================================================
