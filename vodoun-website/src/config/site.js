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
