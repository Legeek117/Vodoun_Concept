import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_TAGLINE, SITE_DESC, DEFAULT_OG_IMAGE, absUrl, canonicalUrl } from '../config/site';
import { STATIC_PAGES } from '../config/seoPages';

function upsertMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Gère les balises SEO de la page courante : titre, description, URL canonique,
 * Open Graph, Twitter Card et directive robots.
 *
 * Le canonique est calculé à partir du chemin réel (SITE_URL + pathname), ce qui
 * évite les duplications et garde un domaine unique (sans www).
 */
export default function usePageMeta({
  title,
  description,
  image,
  type = 'website',
  noindex = false,
  canonical: canonicalPath,
} = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Les métadonnées partagées (src/config/seoPages.js) sont la référence :
    // elles sont identiques à celles écrites dans le HTML pré-rendu par
    // scripts/prerender.mjs. Le titre et la description passed par la page
    // ne servent que de repli pour les routes sans métadonnées partagées
    // (pages produit, qui génèrent les leurs à partir du produit).
    const preset = STATIC_PAGES[pathname] || null;

    const finalTitle = preset?.title || title;
    const finalDesc = preset?.description || description;
    const finalNoindex = preset?.noindex || noindex;

    const fullTitle = finalTitle
      ? (finalTitle.includes(SITE_NAME) ? finalTitle : `${finalTitle} — ${SITE_NAME}`)
      : `${SITE_NAME} — ${SITE_TAGLINE}`;
    const desc = finalDesc || SITE_DESC;
    const path = pathname && pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
    // Un canonical explicite permet de consolider plusieurs URL vers une seule
    // (ex. la séquence d'initiation « / » vers la page d'accueil « /accueil »)
    // en conservant les signaux de la racine, contrairement à « noindex ».
    const target = canonicalPath
      ? String(canonicalPath).replace(/\/+$/, '') || '/'
      : path;
    const canonical = canonicalUrl(target);
    const ogImage = image
      ? (image.startsWith('http') ? image : absUrl(image))
      : DEFAULT_OG_IMAGE;

    document.title = fullTitle;

    upsertMeta('name', 'description', desc);
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'fr_FR');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', ogImage);

    upsertMeta('name', 'robots', finalNoindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, image, type, noindex, canonicalPath, pathname]);
}
