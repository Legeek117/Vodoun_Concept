/**
 * Pré-rendu HTML — génère un fichier index.html statique pour chaque route.
 *
 * POURQUOI : l'application est une SPA React. Sans JavaScript, le HTML
 * servi est identique pour toutes les URL : Google (et les réponses
 * générées par IA) n'y lisent qu'un titre générique et aucun contenu.
 * Ce script écrit donc, pour chaque route, un HTML autonome contenant :
 *   - un <title> et une <meta description> uniques, riches en mots-clés
 *   - le canonical, les balises Open Graph et Twitter propres à la route
 *   - les données structurées JSON-LD (page + fil d'Ariane, ou produit)
 *   - un court contenu textuel en <noscript>, lisible sans JavaScript
 *
 * L'application React se monte ensuite normalement sur ce même HTML : le
 * comportement du site est inchangé, seule la partie indexable est figée.
 *
 * Lancement : npm run build  (appelé automatiquement après vite build)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STATIC_PAGES, escapeHtml, absoluteUrl } from '../src/config/seoPages.js';
import { SITE_URL, SITE_NAME } from '../src/config/site.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const OG_DEFAULT = `${SITE_URL}/icon-512.png`;
const ORGANISATION_ID = `${SITE_URL}/#organisation`;

/**
 * Remplace le contenu d'une balise par `value`.
 * Le motif doit capturer trois groupes : (ouverture) (contenu) (fermeture).
 * On reconstruit la balise entière, sinon l'ancien contenu resterait collé
 * au nouveau (String.replace ne remplace que la sous-chaîne correspondante).
 */
const setTag = (html, pattern, value) =>
  html.replace(pattern, (_m, open, _old, close) => `${open}${value}${close}`);

/** Construit le HTML statique d'une route. */
function buildPage({ route, title, description, ld, noindex = false, image = OG_DEFAULT, noscript }) {
  const canonical = absoluteUrl(route, SITE_URL);
  const urlTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  let html = readFileSync(join(DIST, 'index.html'), 'utf8');

  html = setTag(html, /(<title>)([^<]*)(<\/title>)/, escapeHtml(urlTitle));
  html = setTag(html, /(<meta name="description" content=")([^"]*)("\s*\/?>)/, escapeHtml(description));
  html = setTag(html, /(<meta name="robots" content=")([^"]*)("\s*\/?>)/, noindex ? 'noindex, nofollow' : 'index, follow');
  html = setTag(html, /(<link rel="canonical" href=")([^"]*)("\s*\/?>)/, escapeHtml(canonical));
  html = setTag(html, /(<meta property="og:title" content=")([^"]*)("\s*\/?>)/, escapeHtml(urlTitle));
  html = setTag(html, /(<meta property="og:description" content=")([^"]*)("\s*\/?>)/, escapeHtml(description));
  html = setTag(html, /(<meta property="og:url" content=")([^"]*)("\s*\/?>)/, escapeHtml(canonical));
  html = setTag(html, /(<meta property="og:image" content=")([^"]*)("\s*\/?>)/, escapeHtml(image));
  html = setTag(html, /(<meta property="og:type" content=")([^"]*)("\s*\/?>)/, ld['@type'] === 'Product' ? 'product' : 'website');
  html = setTag(html, /(<meta name="twitter:title" content=")([^"]*)("\s*\/?>)/, escapeHtml(urlTitle));
  html = setTag(html, /(<meta name="twitter:description" content=")([^"]*)("\s*\/?>)/, escapeHtml(description));
  html = setTag(html, /(<meta name="twitter:image" content=")([^"]*)("\s*\/?>)/, escapeHtml(image));

  const extra = `
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>
    <noscript>
      <section style="max-width:760px;margin:0 auto;padding:2rem 1rem;font-family:Georgia,serif;color:#1A1410;background:#F4F0E6">
        <h1 style="font-size:1.6rem;margin:0 0 1rem">${escapeHtml(title)}</h1>
        <p style="line-height:1.7">${escapeHtml(description)}</p>
        <p style="line-height:1.7">${escapeHtml(noscript || `${SITE_NAME} — ${SITE_URL}`)}</p>
      </section>
    </noscript>`;

  html = html.replace('</head>', `${extra}\n</head>`);
  return html;
}

function write(route, html) {
  const target = join(DIST, route.replace(/^\/+/, ''), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  return target;
}

const breadcrumb = (route, name) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/accueil` },
    { '@type': 'ListItem', position: 2, name, item: absoluteUrl(route, SITE_URL) },
  ],
});

// ── 1. Pages statiques ────────────────────────────────────────────────
let count = 0;
for (const [route, cfg] of Object.entries(STATIC_PAGES)) {
  const { title, description, jsonLd, noindex, priority } = cfg;
  const ld = {
    '@context': 'https://schema.org',
    '@type': jsonLd,
    name: title,
    headline: title,
    description,
    url: absoluteUrl(route, SITE_URL),
    inLanguage: 'fr-BJ',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': ORGANISATION_ID },
    breadcrumb: breadcrumb(route, title.split('—')[0].trim()),
  };
  if (priority) ld['vocab:customField'] = undefined;
  delete ld['vocab:customField'];

  write(route, buildPage({ route, title, description, ld, noindex, noscript: description }));
  count++;
  console.log(`  ✓ ${route}`);
}

// ── 2. Produits ───────────────────────────────────────────────────────
const seedPath = join(ROOT, 'public', 'api', 'seed-products.json');
if (existsSync(seedPath)) {
  const products = JSON.parse(readFileSync(seedPath, 'utf8'));
  for (const p of products) {
    const route = `/boutique/produit/${encodeURIComponent(p.id)}`;
    const title = `${p.name} — ${p.category}`;
    const description =
      p.description ||
      (p.story ? `${p.story.substring(0, 150)}…` : `${p.name}, ${p.category}.`);
    const image = `${SITE_URL}${encodeURI(p.image || '/icon-512.png')}`;

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description,
      image,
      sku: p.id,
      category: p.category,
      brand: { '@type': 'Brand', name: SITE_NAME },
      url: absoluteUrl(route, SITE_URL),
      offers: {
        '@type': 'Offer',
        url: absoluteUrl(route, SITE_URL),
        priceCurrency: 'XOF',
        price: p.price,
        availability: p.available === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': ORGANISATION_ID },
        areaServed: ['BJ', 'FR', 'BE', 'CI'],
      },
      isPartOf: { '@id': `${SITE_URL}/boutique` },
    };
    if (p.story) ld.description = `${p.description ? `${p.description} ` : ''}${p.story.substring(0, 300)}`;

    write(route, buildPage({ route, title, description, ld, image, noscript: p.story || description }));
    count++;
  }
  console.log(`  ✓ ${products.length} produits`);
}

console.log(`\nPré-rendu : ${count} pages HTML statiques générées dans dist/`);