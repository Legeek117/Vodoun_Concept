// API REST — montée sous /api par app.js
// Pilote MariaDB/MySQL (mysql2). L'API REST (routes + réponses) reste identique
// à la version PostgreSQL pour ne pas toucher le front.
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { pool, rowToProduct, makeRef, verifyHash } from './db.js';

const router = express.Router();

// ── Sécurité admin ──────────────────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise' });
  try {
    const [rows] = await pool.query('SELECT id FROM admins WHERE token = ?', [token]);
    if (rows.length === 0) return res.status(401).json({ error: 'Token invalide' });
    req.adminId = rows[0].id;
    next();
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
}

// ── Produits ────────────────────────────────────────────────────────────────
router.get('/products', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name');
    res.json(rows.map(rowToProduct));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur BDD' }); }
});

router.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(rowToProduct(rows[0]));
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

router.post('/products', requireAdmin, async (req, res) => {
  const p = req.body;
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = p.id || slug(p.name || 'produit');
  try {
    await pool.query(
      `INSERT INTO products (id, name, category, collection, deity, story, description, price, image, video, delay, available, is_custom_order, is_numbered, has_certificate, variants)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, p.name, p.category || null, p.collection || null, p.deity || null, p.story || null,
       p.description || null, Number(p.price) || 0, p.image || null, p.video || null, p.delay || null,
       p.available !== false ? 1 : 0, p.isCustomOrder ? 1 : 0, p.isNumbered ? 1 : 0,
       p.hasCertificate ? 1 : 0, JSON.stringify(p.variants || [])]
    );
    res.status(201).json({ ok: true, id });
  } catch (e) {
    if (e.errno === 1062 || e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Cet identifiant produit existe déjà' });
    console.error(e); res.status(500).json({ error: 'Erreur BDD' });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  const p = req.body;
  try {
    await pool.query(
      `UPDATE products SET name=?, category=?, collection=?, deity=?, story=?, description=?,
        price=?, image=?, video=?, delay=?, available=?, is_custom_order=?, is_numbered=?,
        has_certificate=?, variants=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [p.name, p.category || null, p.collection || null, p.deity || null, p.story || null,
       p.description || null, Number(p.price) || 0, p.image || null, p.video || null, p.delay || null,
       p.available !== false ? 1 : 0, p.isCustomOrder ? 1 : 0, p.isNumbered ? 1 : 0,
       p.hasCertificate ? 1 : 0, JSON.stringify(p.variants || []),
       req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur BDD' }); }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

// ── Commandes ───────────────────────────────────────────────────────────────
router.post('/orders', async (req, res) => {
  const o = req.body;
  if (!o.customer_name) return res.status(400).json({ error: 'Nom du client requis' });
  try {
    const ref = makeRef('CMD');
    const [result] = await pool.query(
      `INSERT INTO orders (ref, customer_name, customer_email, customer_phone, address, city, country, currency, total, items, payment_method, note)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [ref, o.customer_name, o.customer_email || null, o.customer_phone || null, o.address || null,
       o.city || null, o.country || null, o.currency || 'XOF', Number(o.total) || 0,
       JSON.stringify(o.items || []), o.payment_method || null, o.note || null]
    );
    res.status(201).json({ ok: true, id: result.insertId, ref });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur BDD' }); }
});

router.get('/orders', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(rows.map((r) => {
      let items = [];
      try { items = JSON.parse(r.items); } catch (_) {}
      return { ...r, items };
    }));
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    // MySQL convertit un id non numérique vers 0 → affecte 0 ligne → 404 propre
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

// ── Devis B2B ───────────────────────────────────────────────────────────────
router.post('/quotes', async (req, res) => {
  const q = req.body;
  if (!q.client_name || !q.email) return res.status(400).json({ error: 'Nom et email requis' });
  try {
    const ref = makeRef('DEV');
    const [result] = await pool.query(
      `INSERT INTO quotes (ref, client_name, email, phone, domain, project_title, message, details)
       VALUES (?,?,?,?,?,?,?,?)`,
      [ref, q.client_name, q.email, q.phone || null, q.domain || null, q.project_title || null,
       q.message || null, JSON.stringify(q.details || {})]
    );
    res.status(201).json({ ok: true, id: result.insertId, ref });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur BDD' }); }
});

router.get('/quotes', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quotes ORDER BY id DESC');
    res.json(rows.map((r) => {
      let details = {};
      try { details = JSON.parse(r.details); } catch (_) {}
      return { ...r, details };
    }));
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

router.patch('/quotes/:id/status', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE quotes SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Devis introuvable' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

// ── Réglages ────────────────────────────────────────────────────────────────
router.get('/settings', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM settings');
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

router.put('/settings', requireAdmin, async (req, res) => {
  const entries = Object.entries(req.body || {});
  try {
    for (const [k, v] of entries) {
      // MariaDB < 10.5 : pas d'ON CONFLICT → UPDATE puis INSERT si 0 ligne affectée
      const [result] = await pool.query('UPDATE settings SET `value` = ? WHERE `key` = ?', [String(v), k]);
      if (result.affectedRows === 0) {
        await pool.query('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [k, String(v)]);
      }
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Erreur BDD' }); }
});

// ── Auth admin ──────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username || '']);
    if (rows.length === 0 || !verifyHash(password || '', rows[0].password_hash)) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    await pool.query('UPDATE admins SET token = ? WHERE id = ?', [token, rows[0].id]);
    res.json({ ok: true, token, username: rows[0].username });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur BDD' }); }
});

// ── Upload d'image (multipart, comprimée en WebP) ───────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const uploadStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/upload', requireAdmin, uploadStorage.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu (champ "image")' });
  try {
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.webp`;
    const outPath = path.join(uploadDir, filename);
    const img = sharp(req.file.buffer, { failOn: 'none' }).rotate();
    const meta = await img.metadata();
    if (meta.width > 1600) img.resize({ width: 1600 });
    await img.webp({ quality: 82 }).toFile(outPath);
    res.status(201).json({ ok: true, url: `/uploads/${filename}`, width: meta.width, height: meta.height });
  } catch (e) { console.error(e); res.status(500).json({ error: "Conversion d'image impossible" }); }
});

export default router;