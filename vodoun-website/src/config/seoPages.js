// Métadonnées SEO des pages statiques — source unique, partagée entre
// l'application (usePageMeta) et le pré-rendu HTML (scripts/prerender.mjs).
//
// ⚠️ Les balises <meta name="keywords"> sont IGNORÉES par Google depuis 2009.
//    Ce qui compte réellement : un <title> et une <meta description> uniques
//    par page, contenant naturally les termes que votre cible recherche.

export const STATIC_PAGES = {
  '/accueil': {
    title: 'Concept store Vodun à Ouidah (Bénin) — mobilier d’art, bijoux & décorations',
    description:
      'Vodun Concept Store, concept store à Ouidah au Bénin : mobilier d’art, bijoux, lanternes et décorations festives inspirés de la culture Vodun. Artisanat béninois d’exception, expédition France, Belgique et Côte d’Ivoire.',
    jsonLd: 'WebPage',
    priority: 'high',
  },
  '/boutique': {
    title: 'Boutique — mobilier d’art, bijoux, mode & décorations Vodun | Ouidah',
    description:
      'Découvrez nos collections : mobilier d’art et sculptures, bijoux et bracelets, chapeaux et wax, lanternes et décorations festives, luminaires en raphia et bronze. Artisanat concomitant à Ouidah, Bénin.',
    jsonLd: 'CollectionPage',
    priority: 'high',
  },
  '/a-propos': {
    title: 'La Marque — concept store Vodun à Ouidah, artisanat béninois d’exception',
    description:
      'Vodun Concept Store est né à Ouidah, berceau spirituel du Vodun. Découvrez notre vision, nos valeurs et notre savoir-faire : des créations contemporaines conçues au Bénin pour le monde entier.',
    jsonLd: 'AboutPage',
    priority: 'medium',
  },
  '/pantheon': {
    title: 'Panthéon Vodoun — divinités et Forces des Dieux',
    description:
      'Explorez le panthéon vodoun : chaque divinité vodoun, chaque Force du Monde, chaque histoire qui lui est propre. Vodun Concept Store vous invite à découvrir les Collections Inspirées.',
    jsonLd: 'WebPage',
    priority: 'medium',
  },
  '/projets-pro': {
    title: 'Projets Pro — aménagement hôtelier, restaurant et bureau au Vodun | Bénin',
    description:
      'Mobilier d’art sur mesure pour hôtels, restaurants, bureaux et espaces événementiels : séries de lanternes, bornes d’entrée et décoration sur mesure au Bénin. Devis et délais indicatifs.',
    jsonLd: 'WebPage',
    priority: 'medium',
  },
  '/contact': {
    title: 'Contact — Ouidah, Bénin',
    description:
      'Contactez Vodun Concept Store : commande, devis projet professionnel, demande de partnership ou question sur une pièce. Nous vous répondons sous 48 h depuis Ouidah, Bénin.',
    jsonLd: 'ContactPage',
    priority: 'medium',
  },
  '/compte': {
    title: 'Suivi de commande',
    description: 'Suivez votre commande Vodun Concept Store à l’aide de son code de commande.',
    jsonLd: 'WebPage',
    noindex: true,
    priority: 'low',
  },
};

// Termes réellement recherchés, injectés dans les titres/descriptions.
// Sert de garde-fou : on ne publie pas de texte qui ne contient aucun de
// ces termes, pour éviter de produire des pages génériques.
export const KEYWORDS = [
  'concept store Vodun',
  'artisanat béninois',
  'Ouidah',
  'mobilier d’art',
  'décoration Vodoun',
  'bijoux Vodun',
  'objets de décoration africaine',
  'sculpture sur bois Bénin',
  'vannerie raphia',
  'mode wax',
  'lanternes cérémonie vodoun',
];

export const escapeHtml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const absoluteUrl = (path, siteUrl) =>
  `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/+$/, '') || siteUrl;