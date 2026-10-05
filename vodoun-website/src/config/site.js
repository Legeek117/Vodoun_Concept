// Configuration SEO centrale — domaine canonique unique du site.
// Un seul domaine de référence : https://vodunconceptstore.bj (sans www).
// La variante www est redirigée en 301 (voir public/.htaccess).

export const SITE_URL = 'https://vodunconceptstore.bj';
export const SITE_NAME = 'Vodoun Concept Store';
export const SITE_TAGLINE = 'Là où le sacré devient désirable';

export const SITE_DESC =
  "Vodoun Concept Store : mobilier d'art, bijoux, décorations festives et mode inspirés de la culture Vodoun. Artisanat béninois d'exception. Ouidah, Bénin.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo_vodoun.webp`;

/** Construit une URL absolue à partir d'un chemin relatif. */
export const absUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * URL canonique d'une route, AVEC le slash final.
 *
 * Chaque route pré-rendue est un dossier physique dans dist/ (par exemple
 * dist/accueil/index.html). Apache impose donc le slash final et répond
 * 301 à /accueil. Un canonical sans slash pointerait vers une URL qui
 * redirige : Google l'ignore et retient l'autre forme. On aligne donc
 * canonical, og:url et sitemap sur la forme réellement servie en 200.
 */
export const canonicalUrl = (path = '/') => {
  const clean = String(path).split('?')[0].split('#')[0].replace(/^\/+/, '').replace(/\/+$/, '');
  return clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`;
};
