-- =====================================================================
--  Vodun Concept Store - creation de la base de donnees MariaDB
-- =====================================================================
--  Compatible MariaDB 10.11+ / MySQL 8.
--  Import via phpMyAdmin : onglet "Importer" -> choisir ce fichier.
--  En ligne de commande :  mariadb -u USER -p < voduncon_bdd.sql
--
--  Ce script est IDEMPOTENT : il ne supprime rien et n'ecrase pas les
--  lignes deja presentes (CREATE TABLE IF NOT EXISTS / INSERT IGNORE).
--  On peut donc le rejouer sans danger.
--
--  IMPORTANT - sur Plesk, la base et l'utilisateur sont souvent prefixes
--  par le nom de l'abonnement. Adaptez le nom de base ci-dessous a la
--  base reellement creee, puis reportez ces identifiants dans
--  public/api/config.secret.php (champs db_name / db_user / db_pass).
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `voduncon_bdd`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `voduncon_bdd`;


-- ---------------------------------------------------------------------
-- 1. Structure des tables
-- ---------------------------------------------------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  `key`   VARCHAR(128) NOT NULL PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(128) NOT NULL UNIQUE,
  display_name  VARCHAR(128),
  password_hash VARCHAR(128) NOT NULL,
  role          VARCHAR(32) NOT NULL DEFAULT 'admin',
  token         VARCHAR(128),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('5-panel-classic','5-Panel classic','Mode','Tous','Tous','Urbain et identitaire. Logo brodé en or véritable, fermeture arrière avec encoche en laiton lourd gravée au symbole de la marque. Une casquette 5 panneaux à l\'allure résolument premium.','Logo brodé or, fermeture laiton gravé du symbole de la marque.',9000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'[\"Taille Unique\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('bougeoir-sculpte-bois','Bougeoir sculpté bois','Décoration','Univers Ogou','Ogou','Dans l\'intimité, le feu éclaire la voie. Massif, trapu et élégant, ce bougeoir taillé à même la souche du bois tropical béninois arbore les silhouettes longilignes de nos gardiens tutélaires. Idéal pour accueillir un cierge rituel.','Bois massif béninois, formes symboliques ciselées par la main de l\'homme.',25000.00,'/Led.webp',NULL,'En stock · 2 à 4 jours',1,0,0,0,'[\"Taille unique\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('bracelet-puissance','Bracelet de Puissance','Accessoires','Par divinité','Tous','Un bracelet Vodun n\'est pas un bijou. C\'est une protection. Perles Asso aux couleurs codées par divinité, ou joncs en bronze coulé à l\'ancienne. Chaque bracelet est livré avec son certificat de symbolique.','Perles Asso couleurs codées ou bronze coulé, avec certificat.',3500.00,'/Bracelets de puissance.webp','/b19e787ca1fc41728cd6725092ba5736.mp4','En stock · 3 à 5 jours',1,0,0,1,'[\"Perles Asso — Dan\",\"Perles Asso — Legba\",\"Perles Asso — Sakpata\",\"Perles Asso — Mami Wata\",\"Joncs Bronze\",\"Cuir & Métal Legba\",\"Lapis-lazuli Dan\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('bucket-hat-wax','Bucket Hat Wax Premium','Mode','Tous','Tous','La tête se couronne aussi. Bucket hat en wax premium béninois, motifs géométriques Vodun, doublure soie, édition numérotée. Un vestiaire de tête qui passe du street au cérémoniel sans changer d\'âme.','Tissu wax premium, motifs géométriques Vodun, doublure soie.',12000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'[\"S\\/M\",\"L\\/XL\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('bureaux-espaces-commerciaux','Bureaux & Commerces','Mobilier','Tous','Tous','Une marque qui vous ressemble, jusque dans les murs. Du bureau de direction en bois massif noir incrusté d\'or au comptoir d\'accueil gravé, en passant par la signalétique, nous équipons vos espaces de bureau d\'une identité Vodun cohérente.','Aménagement sur mesure B2B (Bureau direction, salle d\'attente, accueil).',1200000.00,'/Mobilier Résidentiel.webp',NULL,'Projets professionnels (Sur étude)',1,1,0,0,'[\"Sur Devis - Projet sur mesure\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('chemises-col-mao','Chemises Col Mao','Mode','Tous','Tous','L’élégance posée. La chemise col mao réinterprète le vestiaire formel avec des broderies géométriques tirées des vévés et des boutons de bois tournés. À porter au bureau comme en cérémonie : l’identité Vodun, dans sa version habillée.','Col mao, broderies géométriques, boutons bois.',35000.00,'/T-shirts sérigraphiés.webp',NULL,'2 à 3 semaines',1,0,0,0,'[\"S\",\"M\",\"L\",\"XL\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('cristal-de-la-prosperite','Cristal de la Prospérité','Décorations Festives','Univers Sakpata','Sakpata','Petite par la taille, grande par le sens. Le Cristal de la Prospérité enferme de vrais cauris et des vévés dorés dans une sphère de verre transparent : un vœu d\'abondance que l\'on suspend au sapin, à une vitrine, ou que l\'on offre. Le cadeau d\'entreprise qui porte une intention.','Sphère décorative en verre et cauris : symbole d\'abondance.',18000.00,'/Cristal de la prospérité.webp',NULL,'1 à 2 semaines',1,0,0,0,'[\"S\",\"L\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('dad-hat-brode','Dad Hat brodé','Mode','Tous','Tous','La tête se couronne aussi. Coton brossé 6 panneaux, broderie vévé ton-sur-ton. Un vêtement discret qui porte subtilement les valeurs et le signe de votre divinité.','Coton brossé 6 panneaux, broderie vévé ton-sur-ton.',8000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'[\"Taille Unique\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('decorations-presences','Présences (Décoration)','Décoration','Tous','Tous','Ces objets ne meublent pas un espace. Ils l’habitent. Masques contemporains, bas-reliefs peints, sculptures Bocio originales, textiles muraux en fibres locales, miroirs encadrés de symboles : chaque objet décoratif porte le geste de l’artisan et la charge du symbole. Des œuvres à vivre, pas seulement à regarder.','Masques, sculptures, textiles muraux. Œuvres d’art décoratives.',85000.00,'/Mobilier Résidentiel.webp',NULL,'4 à 6 semaines',1,1,0,0,'[\"Masque contemporain\",\"Bas-relief peint\",\"Sculpture Bocio\",\"Textile mural\",\"Miroir gravé\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('hotels-restaurants-b2b','Hôtels & Restaurants','Mobilier','Tous','Tous','Habiller votre espace d\'une identité africaine d\'exception. Un projet d\'ambiance complet. Mobilier de salle à motifs vévés, luminaires sur mesure pour lobbies premium, masques de réception, et vaisselle artisanale : un accompagnement design et sourcing de bout en bout pour donner à votre établissement une forte identité culturelle.','Aménagement sur mesure B2B pour hôtels et restaurants, signature afro-premium.',1500000.00,'/Mobilier Résidentiel.webp',NULL,'Projets architecturaux (Sur étude)',1,1,0,0,'[\"Sur Devis - Étude architecturale\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('kufi-premium','Kufi premium','Mode','Tous','Tous','L\'icône des gardiens du rituel. Tissu local wax revisité avec subtilité, doublure en pur satin noir pour préserver le cheveu, ce couvre-chef traditionnel se porte fier. Édition limitée signée.','Tissu local wax, doublure satin noir, édition limitée signée.',15000.00,'/Casquettes & Headwear.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'[\"S\\/M\",\"L\\/XL\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('la-couronne-de-loracle','La Couronne de l\'Oracle','Décorations Festives','Univers Legba','Legba','Sur une porte, une vitrine ou un mur, la Couronne de l\'Oracle annonce la fête tout en racontant une histoire. Cercle de cauris serrés, symbole de prospérité et de protection, elle remplace la couronne de houx par un emblème né du golfe de Guinée. Un cercle qui dit : ici, l\'abondance est bienvenue.','Couronne de cauris : l\'accueil festif du seuil.',42000.00,'/La courone de l\'oracle.webp',NULL,'1 à 2 semaines',1,0,0,0,'[\"Ø50\",\"Ø80\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('la-pluie-de-cauris','La Pluie de Cauris','Décorations Festives','Univers Mami Wata','Mami Wata','Ni mur, ni vide : un voile. La Pluie de cauris tombe du plafond en rideaux scintillants qui séparent sans cloisonner. Modulaire, elle s\'étire en ligne ou tourne à l\'angle pour dessiner des espaces : un salon dans un hall, une scène dans une salle, une vitrine dans la ville.','Cloisons de lumière en cauris, fils d\'or et micro- LED.Modulaire et sur mesure.',250000.00,'/La pluie de cauris.webp',NULL,'4 à 6 semaines',1,1,0,0,'[\"2m — Or\",\"2m — Noir Mat\",\"2m — Bois Naturel\",\"5m — Or\",\"5m — Noir Mat\",\"10m — Or\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('la-voute-celeste','La Voûte Céleste','Décorations Festives','Univers Mami Wata','Mami Wata','Le cauris fut monnaie, parure et oracle. Suspendu par milliers, il devient ici un ciel. La Voûte céleste tapisse un plafond entier de fils de cauris lumineux et compose une canopée scintillante au-dessus des halls et des réceptions. On ne traverse pas cet espace : on entre sous une voûte d\'abondance.','Installations lumineuses grand format en cauris.',550000.00,'/La Voute céleste.webp',NULL,'6 à 8 semaines',1,1,0,0,'[\"Sur mesure\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('lampe-raphia-tresse','Lampe raphia tressé','Décoration','Tous','Tous','La chaleur des fibres naturelles locales au service de la lumière sacrée. Fabriquée par nos artisans tresseurs, cet abat-jour enveloppe l\'ampoule pour créer une lueur ambrée et très chaleureuse, qui rappelle le couchant de Ouidah.','Abat-jour en fibres naturelles locales, lumière tamisée chaude.',45000.00,'/Led.webp',NULL,'2 à 3 semaines',1,0,0,0,'[\"S\",\"M\",\"L\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('lanterne-bronze','Lanterne bronze','Décoration','Tous','Tous','L\'art du métal au service de la foi. De lourdes feuilles de bronze soigneusement découpées au laser suivant des motifs géométriques millénaires. Une édition artisanale de pur prestige pour magnifier vos bougies ou ampoules.','Motifs géométriques découpés au laser, édition artisanale bronze.',110000.00,'/Led.webp',NULL,'4 semaines',1,0,0,0,'[\"Petit format\",\"Grand format\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('lanternes-ceremoniales','Lanternes Cérémonielles','Décorations Festives','Univers Xevioso','Xevioso','Suspendues en guirlandes au-dessus d\'une place ou d\'un marché, les Lanternes Cérémonielles ravivent l\'esprit de fête. Chaque lanterne porte un visage : masque stylisé percé de lumière, dans des coloris vifs rouge, vert, indigo, or, blanc. La nuit, elles dessinent un ciel de visages bienveillants au-dessus de la foule.','Lanternes festives multicolores inspirées des masques traditionnels.',25000.00,'/Lanternes Cérémonielles.webp',NULL,'1 semaine',1,0,0,0,'[\"Set de 3\",\"Set de 6\",\"Set de 12\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('le-nuage-de-cauris','Le Nuage de Cauris','Décorations Festives','Univers Mami Wata','Mami Wata','Imaginez un nuage descendu se poser dans un salon. Le Nuage de cauris est une suspension organique faite de centaines de coquillages nacrés qui captent et diffusent une lumière douce. Seul, il devient pièce maîtresse ; en archipel, il dessine un ciel intérieur suspendu au-dessus de vos invités.','Suspensions sculpturales en cauris, en forme de nuages de lumière.',180000.00,'/Le nuage de cauris.webp',NULL,'3 à 4 semaines',1,0,0,0,'[\"S\",\"M\",\"XL\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('le-rideau-patrimoine','Le Rideau Patrimoine','Décorations Festives','Tous','Tous','Quand une marque ou une nation veut inscrire son identité dans la lumière, le Rideau Patrimoine répond. Façades de cauris et de fils d\'or, vévés monumentaux dessinés en LED, symboles qui s\'allument à la nuit : c\'est une œuvre architecturale autant qu\'une décoration. Une signature de prestige pour sièges sociaux, hôtels et ambassades culturelles.','Installations sur mesure, symboles Vodun illuminés, grand format.',850000.00,'/Le Rideau Patrimoine.webp',NULL,'Sur devis (projet architectural)',1,1,0,0,'[\"Sur devis\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('le-sentinelle','Le Sentinelle','Décorations Festives','Univers Legba','Legba','Gardiens de nuit du patrimoine Vodun, les Sentinelles veillaient autrefois sur les passages et les seuils. La collection les réimagine en sculptures lumineuses monumentales : des cascades de fils teints rouge, or, indigo, turquoise qui s\'embrasent à la tombée du jour. Posées en allée ou en duo, elles transforment une place ou une galerie marchande en théâtre de lumière.','Lanternes festives multicolores inspirées des masques traditionnels.',120000.00,'/Le Sentinelle.webp',NULL,'2 à 4 semaines',1,0,0,0,'[\"1.5m\",\"2m\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('le-trone-de-direction','Le Trône de Direction','Mobilier','Univers Ogou','Ogou','La pièce signature. Bois massif sculpté à la main, laque noire mate et incrustations or, vévés gravés en relief, cuir pleine fleur capitonné : Le Trône de Direction est un fauteuil de pouvoir, pivotant et réglable, fabriqué en pièce unique signée pour durer une génération.','Bois massif sculpté, laque noire + incrustations or, cuir pleine fleur. Pièce unique signée.',750000.00,'/Le trône de direction.webp',NULL,'4 à 6 semaines · Pièce unique signée',1,1,1,0,'[\"Finition Or — Cuir Noir\",\"Finition Or — Cuir Brun\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('le-veilleur','Le Veilleur','Décorations Festives','Univers Legba','Legba','Le Veilleur se tient à l\'entrée comme une présence bienveillante. Sa partie haute, en métal perforé au laser, projette des vévés de lumière ; sa base de raphia tressé diffuse une lueur chaude et vivante. Aligné le long d\'une allée ou posté à un seuil, il accueille, oriente et protège.','Totems de lumière en métal perforé et raphia naturel. H 1m à 3m, personnalisable.',150000.00,'/Le veilleur.webp',NULL,'3 à 5 semaines',1,1,0,0,'[\"1m — Dan\",\"1m — Legba\",\"2m — Dan\",\"2m — Legba\",\"3m — Dan\",\"3m — Legba\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('les-perles-de-locean','Les Perles de l\'Océan','Décorations Festives','Univers Dan','Dan','Chaque perle est un océan condensé : des cauris sertis d\'or autour d\'un cœur de lumière. Déclinées du diamètre d\'un fruit à celui d\'une lune, Les Perles de l\'Océan se suspendent en grappes ou se posent en majesté sur socle, pour signer halls, vitrines et salons d\'une élégance rituelle.','Boules lumineuses de cauris, suspendues ou sur socle.',35000.00,'/Les perles de l\'océan.webp',NULL,'2 à 3 semaines',1,0,0,0,'[\"Ø20 (suspendu)\",\"Ø40 (suspendu)\",\"Ø80 (suspendu)\",\"Ø80 (sur socle)\",\"Ø120 (sur socle)\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('maroquinerie-sacoches','Maroquinerie & Sacoches','Accessoires','Tous','Tous','L\'élégance du cuir rencontrant l\'artisanat béninois. Des sacoches et accessoires de maroquinerie conçus pour durer, marqués de l\'empreinte Vodun pour une identité forte au quotidien.','Cuir véritable, tannage artisanal, motifs gravés.',45000.00,'/Maroquinerie & sacoches.webp',NULL,'1 à 2 semaines',1,0,0,0,'[\"Tote bag coton\",\"Pochette cuir\",\"Sacoche bandoulière\",\"Sac cabas raphia\",\"Sacoche Business\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('mobilier-residentiel','Mobilier Résidentiel','Mobilier','Tous','Tous','Du mobilier qui se transmet. Sièges sculptés à la pyrogravure, tables aux pieds de fer forgé symbolique, lits à baldaquin forgé, rangements à panneaux sacrés : chaque pièce est en bois massif béninois, pensée pour durer une génération et porter, gravée, la mémoire d\'un symbole.','Bois massif béninois, pyrogravure, incrustations métal — pièce unique signée.',450000.00,'/Mobilier Résidentiel.webp',NULL,'6 à 10 semaines · Pièce unique signée',1,1,0,0,'[\"Siège sculpté\",\"Table & Console\",\"Lit & Tête de lit\",\"Rangement\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('montre-artisanale','Montre Artisanale Vodun','Accessoires','Tous','Tous','Le temps, gravé dans le bois du Bénin. Chaque montre est une pièce numérotée : boîtier en bois local ou métal forgé, cadran orné d\'un vévé, bracelet en cuir tanné ou raphia tressé. Au dos, votre gravure. Un objet qui se transmet.','Boîtier bois ou métal forgé, cadran vévé, éditions numérotées.',65000.00,'/Montres Artisanales.webp',NULL,'3 à 4 semaines · Gravure personnalisée incluse',1,1,1,0,'[\"Bois + Cuir\",\"Bois + Raphia\",\"Métal + Cuir\",\"Métal + Raphia\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('suspension-metal-perfore','Suspension métal perforé','Décoration','Univers Xevioso','Xevioso','Des ombres sacrées sur vos murs. Inspirée des lanternes royales, cette suspension en métal travaillé diffuse la lumière à travers des ornementations percées, tissant des vévés d\'ombres et de reflets sur votre intérieur.','Projette des ombres de vévés, ambiance unique et mémorable.',65000.00,'/Led.webp',NULL,'3 à 5 semaines',1,0,0,0,'[\"Bronze\",\"Noir mat\",\"Or patiné\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `collection`, `deity`, `story`, `description`, `price`, `image`, `video`, `delay`, `available`, `is_custom_order`, `is_numbered`, `has_certificate`, `variants`, `created_at`, `updated_at`) VALUES ('t-shirt-sérigraphié','T-shirt Sérigraphié Vévé','Mode','Tous','Tous','Porter le sacré au quotidien. Chaque t-shirt est une toile : un vévé sérigraphié à l\'or ou en ton-sur-ton, tiré des symboles du panthéon. Coupe contemporaine, coton lourd 220g/m², et une collection par divinité pour choisir son signe autant que son style.','Coton 220g/m², motifs vévés, collections par divinités.',8000.00,'/T-shirts sérigraphiés.webp',NULL,'En stock · 3 à 5 jours',1,0,0,0,'[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"3XL\"]','2026-10-02 08:38:19','2026-10-02 08:38:19');


-- ---------------------------------------------------------------------
-- 3. Compte administrateur (identifiants de la page /admin)
-- ---------------------------------------------------------------------
--  Le mot de passe est stocke ici en SHA-256 (fonction MySQL SHA2) :
--  l'API PHP l'accepte et le migre automatiquement en bcrypt
--  (password_hash) des le premier login.
--
--  >>> Remplacez 'ChangezMoi-2026!' par votre mot de passe AVANT import. <<<
--
--  Pour changer un mot de passe plus tard, sans toucher a PHP :
--    UPDATE `admins` SET `password_hash` = SHA2('NouveauMotDePasse', 256)
--    WHERE `username` = 'admin';
INSERT IGNORE INTO `admins` (`username`, `password_hash`, `token`)
VALUES ('admin', SHA2('YVeT6TFm', 256), NULL);


-- ---------------------------------------------------------------------
-- 4. Reglages du site (facultatif)
-- ---------------------------------------------------------------------
--  Laisses vides : l'interface d'administration les cree et les modifie.
--  Pour les pre-remplir, decommentez et adaptez ces lignes :
--
-- INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
--   ('contactEmail', 'contact@vodunconceptstore.bj'),
--   ('whatsapp',     '+229 97 00 00 00'),
--   ('instagram',    '@vodun.concept');

-- =====================================================================
--  Fin du script.
-- =====================================================================
