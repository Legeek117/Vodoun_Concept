// Vodun Concept Store — serveur de production
// Démarré par Plesk (/httpdocs/app.js) — sert le build statique + API + uploads
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try { (await import('dotenv')).config(); } catch (_) { /* dotenv optionnel */ }

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));

// CORS : même origine en production ; ouvert en dev pour le serveur Vite
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Santé (utile pour vérifier le bon démarrage chez l'hébergeur)
app.get('/api/health', async (_req, res) => {
  try {
    const { pool } = await import('./server/db.js');
    await pool.query('SELECT 1');
    res.json({ ok: true, bdd: true, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, bdd: false, error: e.message });
  }
});

// API
app.use('/api', (await import('./server/api.js')).default);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Build statique (dist/) — monté après /api pour ne pas masquer les routes API
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// Fallback SPA : toute route inconnue sert index.html (React Router)
app.get('*', (req, res, next) => {
  const index = path.join(distDir, 'index.html');
  res.sendFile(index, (err) => {
    if (err) next();
  });
});

// Démarrage
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const { init } = await import('./server/db.js');
// La BDD peut être temporairement indisponible au boot : on réessaie 5 fois
for (let i = 1; i <= 5; i++) {
  try {
    await init();
    break;
  } catch (e) {
    console.error(`[db] Échec init (tentative ${i}/5) :`, e.message);
    await new Promise((r) => setTimeout(r, 3000));
  }
}
app.listen(PORT, HOST, () => {
  console.log(`Vodun Concept Store en écoute sur http://${HOST}:${PORT}`);
});