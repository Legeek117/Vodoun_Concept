// Connexion PostgreSQL + schéma + seed initial
// Compatible PostgreSQL 9.2+ : pas de JSONB, pas de gen_random_uuid() (uuid générés côté Node)
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.PGDATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'voduncon_bdd',
  user: process.env.PGUSER || 'voduncon_admin',
  password: process.env.PGPASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT,
  collection        TEXT,
  deity             TEXT,
  story             TEXT,
  description       TEXT,
  price             NUMERIC NOT NULL DEFAULT 0,
  image             TEXT,
  video             TEXT,
  delay             TEXT,
  available         BOOLEAN NOT NULL DEFAULT true,
  is_custom_order   BOOLEAN NOT NULL DEFAULT false,
  is_numbered       BOOLEAN NOT NULL DEFAULT false,
  has_certificate   BOOLEAN NOT NULL DEFAULT false,
  variants          TEXT NOT NULL DEFAULT '[]',
  created_at        TIMESTAMP DEFAULT now(),
  updated_at        TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  ref           TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  address       TEXT,
  city          TEXT,
  country       TEXT,
  currency      TEXT NOT NULL DEFAULT 'XOF',
  total         NUMERIC DEFAULT 0,
  items         TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'nouvelle',
  payment_method TEXT,
  note          TEXT,
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes (
  id            SERIAL PRIMARY KEY,
  ref           TEXT UNIQUE,
  client_name   TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  domain        TEXT,
  project_title TEXT,
  message       TEXT,
  details       TEXT NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'nouvelle',
  created_at    TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token         TEXT,
  created_at    TIMESTAMP DEFAULT now()
);
`;

// Génération de références type "CMD-20261002-4F2A"
export function makeRef(prefix) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${j}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

export async function init() {
  await pool.query(SCHEMA);
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
    available: r.available,
    isCustomOrder: r.is_custom_order,
    isNumbered: r.is_numbered,
    hasCertificate: r.has_certificate,
    variants,
    createdAt: r.created_at,
  };
}

async function seedProducts() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n > 0) return;
  const file = path.join(__dirname, 'seed-products.json');
  if (!fs.existsSync(file)) return;
  const products = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of products) {
    // Compatible PostgreSQL 9.2 : pas d'ON CONFLICT (dispo depuis 9.5)
    await pool.query(
      `INSERT INTO products
        (id, name, category, collection, deity, story, description, price, image, video, delay, available, is_custom_order, is_numbered, has_certificate, variants)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
       WHERE NOT EXISTS (SELECT 1 FROM products WHERE id = $1)`,
      [
        p.id, p.name, p.category || null, p.collection || null, p.deity || null,
        p.story || null, p.description || null, p.price ?? 0, p.image || null, p.video || null,
        p.delay || null, p.available !== false, !!p.isCustomOrder, !!p.isNumbered,
        !!p.hasCertificate, JSON.stringify(p.variants || []),
      ]
    );
  }
  console.log(`[db] Seed : ${products.length} produits insérés`);
}

async function seedAdmin() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM admins');
  if (rows[0].n > 0) return;
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString('hex');
  const token = crypto.randomBytes(24).toString('hex');
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
  await pool.query(
    'INSERT INTO admins (username, password_hash, token) VALUES ($1, $2, $3)',
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