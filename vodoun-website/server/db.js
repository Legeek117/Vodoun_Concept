// Connexion MariaDB/MySQL + schéma + seed initial
// Compatible MariaDB 10.x : AUTO_INCREMENT, pas de RETURNING (avant 10.5), pas d'ON CONFLICT.
// UUID/refs générés côté Node (crypto), JSON stocké en LONGTEXT.
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Options de connexion — DATABASE_URL (mysql://...) ou variables DB_* séparées
const dbOptions = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL, ...{ charset: 'utf8mb4', connectionLimit: 10, namedPlaceholders: false } }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'voduncon_admin',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'voduncon_bdd',
      charset: 'utf8mb4',
      connectionLimit: 10,
    };

export const pool = mysql.createPool(dbOptions);

// Helper : une requête = un appel `query()`, résultat promisifié par mysql2/promise
// SELECT → rows ; INSERT/UPDATE/DELETE → ResultSetHeader { affectedRows, insertId }

const SCHEMA = `
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
  \`key\`   VARCHAR(128) NOT NULL PRIMARY KEY,
  \`value\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,
  token         VARCHAR(128),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Découpe en requêtes individuelles (pas de multipleStatements : surface d'attaque minimale)
const SCHEMA_STATEMENTS = SCHEMA.split(';').map((s) => s.trim()).filter(Boolean);

// Génération de références type "CMD-20261002-4F2A"
export function makeRef(prefix) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${j}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

export async function init() {
  for (const stmt of SCHEMA_STATEMENTS) {
    await pool.query(stmt);
  }
  await seedProducts();
  await seedAdmin();
}

export function rowToProduct(r) {
  let variants = [];
  try { variants = JSON.parse(r.variants || '[]'); } catch (_) {}
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    collection: r.collection,
    deity: r.deity,
    story: r.story,
    description: r.description,
    price: Number(r.price),
    image: r.image,
    video: r.video,
    delay: r.delay,
    available: r.available === 1 || r.available === true,
    isCustomOrder: r.is_custom_order === 1,
    isNumbered: r.is_numbered === 1,
    hasCertificate: r.has_certificate === 1,
    variants,
    createdAt: r.created_at,
  };
}

async function seedProducts() {
  const [rows] = await pool.query('SELECT COUNT(*) AS n FROM products');
  if (rows[0].n > 0) return;
  const file = path.join(__dirname, 'seed-products.json');
  if (!fs.existsSync(file)) return;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of products) {
    // MariaDB < 10.5 : pas d'ON CONFLICT → INSERT ... SELECT ... WHERE NOT EXISTS
    await pool.query(
      `INSERT INTO products
        (id, name, category, collection, deity, story, description, price, image, video, delay, available, is_custom_order, is_numbered, has_certificate, variants)
       SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
       WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = ?)`,
      [
        p.id, p.name, p.category || null, p.collection || null, p.deity || null,
        p.story || null, p.description || null, p.price ?? 0, p.image || null, p.video || null,
        p.delay || null, p.available !== false ? 1 : 0, p.isCustomOrder ? 1 : 0,
        p.isNumbered ? 1 : 0, p.hasCertificate ? 1 : 0, JSON.stringify(p.variants || []),
        p.id, // 17e paramètre : WHERE NOT EXISTS (id = ?)
      ]
    );
  }
  console.log(`[db] Seed : ${products.length} produits insérés`);
}

async function seedAdmin() {
  const [rows] = await pool.query('SELECT COUNT(*) AS n FROM admins');
  if (rows[0].n > 0) return;
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString('hex');
  const token = crypto.randomBytes(24).toString('hex');
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
  await pool.query(
    'INSERT INTO admins (username, password_hash, token) VALUES (?, ?, ?)',
    [username, sha(password), token]
  );
  console.log(`[db] Admin créé : ${username}`);
  if (process.env.ADMIN_PASSWORD) {
    console.log('[db] Mot de passe admin : fourni via ADMIN_PASSWORD');
  } else {
    console.log(`⚠️  [db] Définissez ADMIN_PASSWORD (variable Plesk). Mot de passe provisoire : ${password}`);
  }
}

export function verifyHash(password, hash) {
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
  return sha(password) === hash;
}