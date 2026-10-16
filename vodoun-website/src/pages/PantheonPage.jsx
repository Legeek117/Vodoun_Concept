import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';
import PantheonGalaxy from '../components/PantheonGalaxy';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

// SEO metadata for Pantheon page
const SEO_META = {
  title: 'Le Panthéon Vodun · Divinités et Symboles',
  description: 'Découvrez les six divinités du panthéon Vodun : Dan, Legba, Sakpata, Xeviosso, Mami Wata et Ogu. Symboles, couleurs et significations spirituelles de chaque Vodun.',
};

// ── Données complètes tirées du brief et des documents de la marque ─────────
const DIVINITIES = [
  {
    name: 'DAN',
    title: 'Le Serpent',
    subtitle: 'Fluidité · Protection',
    color: '#1C4A66',
    colorLight: '#2a6a8a',
    image: '/Divinités/DAN (1).webp',
    palette: ['#1C4A66', '#0F3A54', '#5B9BB5', '#A8D4E6'],
    paletteLabels: ['Indigo profond', 'Nuit ocean', 'Turquoise', 'Ciel clair'],
    description: 'Spirales · Indigo · Turquoise',
    intro: 'Dan, le serpent cosmique, est l\'une des divinités les plus puissantes du panthéon Vodun. Enroulé sur lui-même, il symbolise l\'éternité, la fluidité de la vie et la connexion entre tous les mondes.',
    story: 'Dan incarne le mouvement perpétuel de l\'univers. Son corps en spirale relie le ciel et la terre, les vivants et les ancêtres. Il est gardien de la prospérité et des chemins de vie — là où Dan passe, la force circule. Dans les créations Vodun Concept Store, son univers se traduit par des lignes fluides, des bleus profonds et des matières qui semblent vivre.',
    attributes: [
      { label: 'Symbole', value: 'Le Serpent en spirale' },
      { label: 'Élément', value: 'Eau · Vent · Mouvement' },
      { label: 'Pouvoir', value: 'Protection · Fluidité · Prospérité' },
      { label: 'Couleurs sacrées', value: 'Indigo · Turquoise · Noir' },
      { label: 'Formes', value: 'Spirales · Courbes · Ondulations' },
    ],
    collections: ['Bracelets Lapis-lazuli Dan', 'T-shirts vévé Dan', 'Les Perles de l\'Océan'],
    veve: 'Spirales concentriques rayonnant depuis un centre vivant',
    offerings: 'Cauris · Eau de source · Huile de palme · Tissu indigo',
  },
  {
    name: 'LEGBA',
    title: 'Le Gardien des Carrefours',
    subtitle: 'Passage · Communication',
    color: '#8E2420',
    colorLight: '#b03530',
    image: '/Divinités/LEGBA.webp',
    palette: ['#8E2420', '#5C1510', '#C0392B', '#E8A090'],
    paletteLabels: ['Rouge rituel', 'Sang sombre', 'Rouge vif', 'Chair sacrée'],
    description: 'Croisements · Rouge · Noir',
    intro: 'Legba est le premier invoqué dans toute cérémonie Vodun. Gardien des seuils et des carrefours, il est le messager entre les humains et les divinités — sans lui, aucune communication avec le divin n\'est possible.',
    story: 'Posté à l\'entrée de chaque temple, au croisement de chaque chemin, Legba est la clé. Il décide qui passe et qui reste. Vieux, rusé, bienveillant pour ceux qui l\'honorent, il porte bâton et pipe, symboles de sagesse et de voyage. Les Veilleurs et Sentinelles de la collection s\'inscrivent directement dans sa tradition : garder les seuils, guider les passages.',
    attributes: [
      { label: 'Symbole', value: 'Le Carrefour · La Porte' },
      { label: 'Élément', value: 'Feu · Terre · Seuil' },
      { label: 'Pouvoir', value: 'Communication · Passage · Protection des entrées' },
      { label: 'Couleurs sacrées', value: 'Rouge · Noir · Or' },
      { label: 'Formes', value: 'Croisements · Angles · Seuils' },
    ],
    collections: ['Le Veilleur', 'Le Sentinelle', 'Bracelets Cuir & Métal Legba', 'La Couronne de l\'Oracle'],
    veve: 'Croix centrale avec extensions vers les quatre directions cardinales',
    offerings: 'Rhum · Tabac · Piment · Huile de palme · Bâton de bois',
  },
  {
    name: 'SAKPATA',
    title: 'La Terre Fertile',
    subtitle: 'Ancrage · Abondance · Guérison',
    color: '#20603C',
    colorLight: '#2d8050',
    image: '/Divinités/sakpata.webp',
    palette: ['#20603C', '#0F3D24', '#3D8C58', '#A8D4B4'],
    paletteLabels: ['Vert sacré', 'Forêt profonde', 'Vert vif', 'Herbe fraîche'],
    description: 'Formes organiques · Brun · Vert',
    intro: 'Sakpata règne sur la terre, les récoltes et la maladie guérie. Il est le maître du sol, de l\'ancrage et de la transformation. Impitoyable envers ceux qui ne l\'honorent pas, infiniment protecteur pour ceux qui le respectent.',
    story: 'La terre nourrit, protège et reprend. Sakpata est cette puissance brute et généreuse. Ses formes sont organiques, rondes comme la terre elle-même, ses couleurs celles de la forêt et de l\'humus. Dans les créations de la marque, son univers inspire le mobilier massif en bois béninois, les formes sculpturales et les matières naturelles qui ancrent l\'espace.',
    attributes: [
      { label: 'Symbole', value: 'La Terre Fertile · Le Sol' },
      { label: 'Élément', value: 'Terre · Bois · Racine' },
      { label: 'Pouvoir', value: 'Guérison · Abondance · Ancrage' },
      { label: 'Couleurs sacrées', value: 'Brun · Vert · Blanc' },
      { label: 'Formes', value: 'Rondeurs · Formes organiques · Texture brute' },
    ],
    collections: ['Mobilier Résidentiel', 'Sculptures Bocio', 'T-shirts vévé Sakpata', 'Textiles muraux'],
    veve: 'Cercles concentriques évoquant les strates de la terre, entourés de croix',
    offerings: 'Maïs blanc · Igname · Eau fraîche · Argile blanche',
  },
  {
    name: 'OGU',
    title: 'Le Fer et la Force',
    subtitle: 'Courage · Travail · Métal',
    color: '#8B0000',
    colorLight: '#a01010',
    image: '/Divinités/OGU2.webp',
    palette: ['#8B0000', '#5A0000', '#C0392B', '#D4A017'],
    paletteLabels: ['Rouge sang', 'Bordeaux sombre', 'Rouge vif', 'Or forgé'],
    description: 'Angles · Rouge sang · Or',
    intro: 'Ogu est la divinité du fer, de la forge et du travail manuel. Patron des forgerons, des guerriers et de tous ceux qui transforment la matière par la force de leurs mains. Il incarne la puissance brute mise au service de la création.',
    story: 'Là où le métal se plie, là où le feu transforme, Ogu est présent. Il est la volonté qui forge l\'outil et la main qui le manie. Ses angles sont tranchants, ses lignes directes, son énergie sans compromis. Dans la collection Vodun Concept Store, il inspire les montres en métal forgé, les incrustations d\'or sur les meubles, les ferronneries symboliques — tout ce qui porte la marque du fer et du geste artisanal.',
    attributes: [
      { label: 'Symbole', value: 'Le Fer · L\'Outil · L\'Épée' },
      { label: 'Élément', value: 'Feu · Métal · Forge' },
      { label: 'Pouvoir', value: 'Force · Courage · Travail · Transformation' },
      { label: 'Couleurs sacrées', value: 'Rouge sang · Or · Gris métal' },
      { label: 'Formes', value: 'Angles · Lignes droites · Géométrie forte' },
    ],
    collections: ['Montres Artisanales métal forgé', 'Mobilier incrustations or', 'Joncs Bronze coulé', 'Le Trône de Direction'],
    veve: 'Étoile à six branches avec outils en fer disposés aux pointes',
    offerings: 'Rhum · Cigare · Fer · Huile de palme · Eau ferrugineuse',
  },
  {
    name: 'MAMI WATA',
    title: 'Les Eaux et la Beauté',
    subtitle: 'Prospérité · Beauté · Mystère',
    color: '#4A1942',
    colorLight: '#6B2A5E',
    image: '/Divinités/mami wata.webp',
    palette: ['#4A1942', '#2D0F28', '#8B4A80', '#D4A8C7'],
    paletteLabels: ['Violet sacré', 'Nuit profonde', 'Mauve', 'Or nacré'],
    description: 'Courbes · Violet · Or nacré',
    intro: 'Mami Wata est l\'esprit des eaux, de la séduction et de la prospérité. Mi-femme, mi-serpent, elle attire ceux qui l\'approchent avec un cœur pur et les comble de richesses. Elle est la beauté absolue et le mystère insondable.',
    story: 'Venue des eaux profondes, Mami Wata apporte fortune et harmonie à ses fidèles. Elle aime les miroirs, les bijoux, les parfums — tout ce qui brille et séduit. Sa présence se ressent dans les espaces où la lumière joue sur les surfaces, où le mouvement évoque les vagues. La Pluie de cauris, Le Nuage de cauris et La Voûte céleste sont ses créations favorites : des installations qui transforment un espace en grotte sous-marine de luxe.',
    attributes: [
      { label: 'Symbole', value: 'Les Eaux · Le Serpent · Le Miroir' },
      { label: 'Élément', value: 'Eau · Lune · Nacre' },
      { label: 'Pouvoir', value: 'Prospérité · Beauté · Harmonie · Chance' },
      { label: 'Couleurs sacrées', value: 'Violet · Or nacré · Blanc · Bleu nuit' },
      { label: 'Formes', value: 'Courbes · Ondulations · Surfaces réfléchissantes' },
    ],
    collections: ['La Pluie de cauris', 'Le Nuage de cauris', 'La Voûte céleste', 'Les Perles de l\'Océan', 'Bracelets Perles Asso Mami Wata'],
    veve: 'Serpent enroulé autour d\'un miroir, entouré de vagues et de cauris',
    offerings: 'Parfum · Miroir · Poudre blanche · Champagne · Fleurs blanches',
  },
  {
    name: 'XEVIOSO',
    title: 'La Foudre et la Justice',
    subtitle: 'Puissance · Justice · Éclat',
    color: '#B8860B',
    colorLight: '#D4A017',
    image: '/Divinités/xeviosso.webp',
    palette: ['#B8860B', '#8B6508', '#D4A017', '#F0D060'],
    paletteLabels: ['Or foudre', 'Or ancien', 'Or vif', 'Éclair doré'],
    description: 'Éclairs · Blanc · Noir · Or',
    intro: 'Xevioso est la divinité de la foudre, du tonnerre et de la pluie. Il est le juge suprême du panthéon Vodun — ses éclairs frappent les menteurs et les injustes, ses pluies fertilisent la terre des honnêtes. Il est à la fois destructeur et nourricier.',
    story: 'Quand le ciel gronde, c\'est Xevioso qui parle. Ses éclairs sont sa signature, ses tonnerres son verdict. On l\'invoque pour obtenir justice, pour purifier un espace ou pour appeler la pluie sur des terres asséchées. Dans les créations de la marque, il inspire tout ce qui brille et frappe : les luminaires en métal perforé qui projettent des éclairs de lumière, les Lanternes Cérémonielles, et les pièces or qui illuminent les espaces comme la foudre illumine la nuit.',
    attributes: [
      { label: 'Symbole', value: 'La Foudre · Le Bélier · La Hache double' },
      { label: 'Élément', value: 'Ciel · Feu céleste · Pluie' },
      { label: 'Pouvoir', value: 'Justice · Puissance · Purification · Fertilité' },
      { label: 'Couleurs sacrées', value: 'Blanc · Noir · Or · Rouge' },
      { label: 'Formes', value: 'Éclairs · Zigzags · Géométrie explosive' },
    ],
    collections: ['Lanternes Cérémonielles', 'Luminaires sacrés métal perforé', 'Cristal de la Prospérité', 'T-shirts vévé Xevioso'],
    veve: 'Hache double (oshe) entourée d\'éclairs rayonnants et de cercles concentriques',
    offerings: 'Bélier · Maïs blanc · Akpan · Bâton de fer · Tabac',
  },
];

// ── Valeurs fondatrices de la marque ───────────────────────────────────────
const BRAND_VALUES = [
  { title: 'Authenticité', desc: 'Ancré dans une tradition et une spiritualité vivantes. Chaque création respecte la signification profonde des symboles Vodun.' },
  { title: 'Excellence', desc: 'Beau, solide, durable. Des pièces conçues pour traverser les générations et porter la mémoire d\'un symbole.' },
  { title: 'Respect', desc: 'Le Vodun est vivant. Toute création l\'honore. Nous travaillons avec les artisans béninois dans la dignité.' },
  { title: 'Rayonnement', desc: 'Faire de Ouidah la capitale mondiale du design inspiré du Vodun. Chaque vente exporte la beauté béninoise.' },
];

// ── Composant carte divinité (vue grille) ──────────────────────────────────
function DeityCard({ deity, index, onClick, isActive, lang }) {
  return (
    <div
      className={`group cursor-pointer animate-in transition-all duration-500 hover:-translate-y-1 ${isActive ? 'ring-2 ring-or ring-offset-2 ring-offset-noir' : ''}`}
      onClick={() => onClick(index)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* ── IMAGE ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: deity.color }}>

        {/* Photo */}
        {deity.image && (
          <img
            src={deity.image}
            alt={deity.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 opacity-85"
          />
        )}

        {/* Overlay couleur divinité */}
        <div className="absolute inset-0 mix-blend-multiply opacity-20" style={{ backgroundColor: deity.color }} />

        {/* Gradient bas — utilise la vraie couleur */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${deity.color}F0 0%, ${deity.color}50 35%, transparent 65%)` }}
        />

        {/* Halo hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${deity.color}50 0%, transparent 60%)` }}
        />

        {/* Numéro discret */}
        <span className="absolute top-3 right-3 z-10 text-[0.5rem] font-black text-ivoire/20 tabular-nums">
          0{index + 1}
        </span>

        {/* Badge subtitle */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className="text-[0.45rem] uppercase tracking-[0.35em] font-bold px-2 py-1 rounded-full backdrop-blur-sm"
            style={{ background: `${deity.color}60`, color: deity.colorLight, border: `1px solid ${deity.colorLight}35` }}
          >
            {deity.subtitle}
          </span>
        </div>

        {/* Texte bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
          <span className="text-[0.5rem] uppercase tracking-[0.4em] text-ivoire/50 block mb-1">{deity.title}</span>
          <h3
            className="font-playfair text-3xl md:text-4xl font-black text-ivoire leading-none mb-2"
            style={{ textShadow: `0 2px 16px ${deity.color}70` }}
          >
            {deity.name}
          </h3>
          <p className="text-ivoire/60 text-[0.6rem] uppercase tracking-widest">{deity.description}</p>
        </div>

        {/* Hover CTA centré */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <span
            className="text-[0.6rem] uppercase tracking-[0.35em] font-black px-5 py-2.5 rounded-full backdrop-blur-md"
            style={{ background: `${deity.colorLight}DD`, color: '#0A0705' }}
          >
            {lang === 'fr' ? 'Découvrir →' : 'Discover →'}
          </span>
        </div>
      </div>

      {/* ── ATTRIBUTS STRIP ── */}
      <div style={{ borderLeft: `2px solid ${deity.color}60`, borderRight: `1px solid ${deity.color}25`, borderBottom: `1px solid ${deity.color}25` }}>
        {deity.attributes.slice(0, 3).map((attr, j) => (
          <div
            key={j}
            className="flex justify-between items-center px-3 py-2.5 transition-colors duration-200 group-hover:brightness-125"
            style={{
              background: j % 2 === 0 ? `${deity.color}12` : `${deity.color}06`,
              borderBottom: j < 2 ? `1px solid ${deity.color}18` : 'none',
            }}
          >
            <span className="text-[0.5rem] uppercase tracking-[0.25em] text-ivoire/35">{attr.label}</span>
            <span className="text-[0.55rem] font-black uppercase tracking-wider" style={{ color: deity.colorLight }}>{attr.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Modal détail divinité ───────────────────────────────────────────────────
function DeityModal({ deity, onClose, t, lang }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current) return;
    // On ne stoppe PAS Lenis globalement — ça bloquerait le scroll interne.
    // data-lenis-prevent sur le panel gère déjà l'isolation.
    // On bloque juste le scroll de la page derrière via pointer-events.
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: 40, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
      {/* Backdrop avec couleur de la divinité */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: `linear-gradient(135deg, ${deity.color}40 0%, rgba(10,7,5,0.92) 60%)` }}
        onClick={onClose}
      />

      {/* Bouton fermer */}
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{ borderRadius: '50%' }}
        className="fixed top-4 right-4 z-[9999] w-11 h-11 flex items-center justify-center bg-noir/70 backdrop-blur-md border border-ivoire/20 text-ivoire text-base hover:bg-or hover:text-noir hover:border-or transition-all duration-300 shadow-lg"
      >
        ✕
      </button>

      {/* Panel */}
      <div
        ref={modalRef}
        data-lenis-prevent
        className="relative z-10 w-full md:max-w-4xl h-[92vh] md:max-h-[92vh] overflow-y-auto md:rounded-3xl shadow-2xl"
        style={{
          background: `linear-gradient(160deg, ${deity.color}18 0%, #0D0B08 35%, #0A0705 100%)`,
          border: `1px solid ${deity.color}35`,
          boxShadow: `0 0 100px ${deity.color}25, 0 40px 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* ── HEADER IMAGE ── */}
        <div className="relative h-64 md:h-80 overflow-hidden flex-shrink-0 md:rounded-t-3xl" style={{ backgroundColor: deity.color }}>
          {deity.image && (
            <img src={deity.image} alt={deity.name} loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-75 scale-105"
            />
          )}
          {/* Gradient riche avec couleur */}
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to top, #0A0705 0%, ${deity.color}60 50%, transparent 100%)` }}
          />
          {/* Halo coloré */}
          <div className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 30% 60%, ${deity.color}30 0%, transparent 65%)` }}
          />

          {/* Nom en grand */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-[0.55rem] uppercase tracking-[0.5em] text-ivoire/50 block mb-2">{deity.title}</span>
                <h2 className="font-playfair text-5xl md:text-7xl font-black text-ivoire leading-none drop-shadow-2xl"
                  style={{ textShadow: `0 0 40px ${deity.color}80` }}>
                  {deity.name}
                </h2>
              </div>
              {/* Badge subtitle */}
              <div className="flex-shrink-0 pb-1">
                <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `${deity.color}50`, color: deity.colorLight, border: `1px solid ${deity.color}60` }}>
                  {deity.subtitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="p-6 md:p-8 pb-16">

          {/* Ligne de séparation décorative */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${deity.color}60, transparent)` }} />
            <span className="text-[0.55rem] uppercase tracking-[0.4em] font-bold" style={{ color: deity.colorLight }}>
              {lang === 'fr' ? 'Univers' : 'Universe'} · {deity.name}
            </span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${deity.color}60, transparent)` }} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* ── COLONNE GAUCHE : textes ── */}
            <div className="space-y-6">

              {/* L'Essence */}
              <div className="rounded-2xl p-5"
                style={{ background: `${deity.color}12`, border: `1px solid ${deity.color}25` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: deity.colorLight }} />
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] font-black" style={{ color: deity.colorLight }}>
                    {lang === 'fr' ? 'L\'Essence' : 'The Essence'}
                  </h3>
                </div>
                <p className="text-ivoire/90 text-sm leading-relaxed font-playfair italic">{deity.intro}</p>
              </div>

              {/* L'Histoire */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: deity.colorLight }} />
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] font-black" style={{ color: deity.colorLight }}>
                    {lang === 'fr' ? 'L\'Histoire' : 'The Story'}
                  </h3>
                </div>
                <p className="text-ivoire/70 text-sm leading-relaxed">{deity.story}</p>
              </div>

              {/* Le Vévé */}
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-or text-xs">✦</span>
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] text-or/70 font-black">
                    {lang === 'fr' ? 'Le Vévé' : 'The Vévé'}
                  </h3>
                </div>
                <p className="text-ivoire/50 text-xs leading-relaxed italic">« {deity.veve} »</p>
              </div>

              {/* Offrandes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-or text-xs">✦</span>
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] text-or/70 font-black">
                    {lang === 'fr' ? 'Offrandes' : 'Offerings'}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deity.offerings.split(' · ').map((item, i) => (
                    <span key={i} className="text-[0.6rem] uppercase tracking-wider px-2.5 py-1 rounded-full text-ivoire/50"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── COLONNE DROITE : attributs + palette + collections ── */}
            <div className="space-y-6">

              {/* Attributs */}
              <div className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${deity.color}30` }}>
                {deity.attributes.map((attr, i) => (
                  <div key={i}
                    className="flex justify-between items-center px-4 py-3 transition-colors duration-200"
                    style={{
                      background: i % 2 === 0 ? `${deity.color}10` : 'transparent',
                      borderBottom: i < deity.attributes.length - 1 ? `1px solid ${deity.color}20` : 'none',
                    }}>
                    <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivoire/40">{attr.label}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-right max-w-[55%]"
                      style={{ color: deity.colorLight }}>{attr.value}</span>
                  </div>
                ))}
              </div>

              {/* Palette chromatique */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-or text-xs">✦</span>
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] text-or/70 font-black">{t.pantheon.sacredPalette}</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {deity.palette.map((hex, i) => (
                    <div key={i} className="text-center">
                      <div className="h-10 w-full mb-1.5 rounded-lg shadow-inner" style={{ backgroundColor: hex }} />
                      <span className="text-[0.5rem] text-ivoire/35 uppercase tracking-wider leading-tight block">{deity.paletteLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collections liées */}
              <div className="rounded-2xl p-5"
                style={{ background: `${deity.color}10`, border: `1px solid ${deity.color}25` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: deity.colorLight }} />
                  <h3 className="text-[0.6rem] uppercase tracking-[0.4em] font-black" style={{ color: deity.colorLight }}>
                    {t.pantheon.inspiredCollections}
                  </h3>
                </div>
                <ul className="space-y-2 mb-5">
                  {deity.collections.map((c, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-ivoire/65 hover:text-ivoire/90 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: deity.colorLight }} />
                      {c}
                    </li>
                  ))}
                </ul>
                <Link to="/boutique" onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[0.65rem] uppercase tracking-[0.3em] font-black text-noir transition-all duration-300 hover:opacity-90 hover:scale-[0.98] active:scale-[0.96]"
                  style={{ background: `linear-gradient(135deg, ${deity.colorLight} 0%, ${deity.color} 100%)` }}>
                  {t.pantheon.exploreCollection}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function PantheonPage() {
  const containerRef = useRef(null);
  const [activeDeity, setActiveDeity] = useState(null);
  const { lang } = useLanguage();
  const t = lang === 'fr' ? fr : en;

  usePageMeta(SEO_META);

  const openDeity = (index) => setActiveDeity(DIVINITIES[index]);
  const closeDeity = () => setActiveDeity(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!containerRef.current) return;

    // Délai pour laisser Lenis s'initialiser avant de créer les ScrollTriggers
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current.querySelectorAll('.animate-in'),
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'expo.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 75%' } }
      );

      gsap.utils.toArray('.section-reveal').forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true } }
        );
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen text-ivoire" ref={containerRef}>

      {/* ── GALAXIE FIXED — derrière tout, z-index sous la Navbar (z-[100]) ── */}
      <div
        className="pointer-events-none"
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#0A0705' }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          gl={{ antialias: false, alpha: true }}
        >
          <PantheonGalaxy />
        </Canvas>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,7,5,0.55)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative z-[2] pt-40 pb-24 overflow-hidden">
        {/* Halo or */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(184,134,11,0.1) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-[5vw]" style={{ zIndex: 2 }}>
          <span className="section-label animate-in text-or">{t.pantheon.label}</span>
          <h1 className="editorial-heading animate-in mb-8 !text-[clamp(3rem,10vw,8rem)]">
            {t.pantheon.title}
          </h1>
          <p className="animate-in text-ivoire/60 text-lg md:text-xl font-playfair italic max-w-2xl leading-relaxed mb-6">
            {t.pantheon.subtitle}
          </p>
          <p className="animate-in text-ivoire/50 text-sm max-w-3xl leading-relaxed">
            {lang === 'fr'
              ? 'Chaque divinité du panthéon Vodun inspire une collection — ses couleurs, ses formes, ses matières. Découvrez les six puissances qui fondent l\'identité créative de Vodun Concept Store, née à Ouidah, berceau du Vodun.'
              : 'Each deity of the Vodun pantheon inspires a collection — its colors, shapes, materials. Discover the six powers that form the creative identity of Vodun Concept Store, born in Ouidah, cradle of Vodun.'}
          </p>

          {/* Séparateur doré */}
          <div className="animate-in flex items-center gap-4 mt-10">
            <div className="h-px flex-1 max-w-[80px] bg-or/40" />
            <span className="text-or text-xs uppercase tracking-[0.4em]">{t.pantheon.sixUniverses || 'Les Six Puissances'}</span>
            <div className="h-px flex-1 max-w-[80px] bg-or/40" />
          </div>
        </div>
      </section>

      {/* ── GRILLE DIVINITÉS ─────────────────────────────────────────────── */}
      <section className="relative z-[2] py-8 pb-32">
        <div className="max-w-7xl mx-auto px-[5vw]">

          {/* Grille 2 colonnes mobile (dents de scie) / 3 colonnes desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-6 items-start">
            {DIVINITIES.map((deity, i) => (
              <div
                key={deity.name}
                className={
                  // Sur sm (2 col) : cartes impaires décalées → dents de scie
                  // Sur mobile 1 col / desktop 3 col : pas de décalage
                  i % 2 === 1 ? 'sm:mt-16 md:mt-0' : ''
                }
              >
                <DeityCard
                  deity={deity}
                  index={i}
                  onClick={openDeity}
                  isActive={activeDeity?.name === deity.name}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          <p className="text-center text-ivoire/20 text-[0.6rem] uppercase tracking-[0.4em] mt-16">
            {lang === 'fr' ? '— Cliquez pour entrer dans l\'univers —' : '— Click to enter the universe —'}
          </p>
        </div>
      </section>

      {/* ── SECTION : VISION FONDATRICE ────────────────────────────────── */}
      <section className="relative z-[2] py-24 md:py-32 border-t border-ivoire/10 section-reveal">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-label text-or">Mission</span>
              <h2 className="editorial-heading text-ivoire mb-6 !text-[clamp(2rem,6vw,4rem)]">
                {t.pantheon.visionLabel}
              </h2>
              <p className="text-ivoire/70 text-base md:text-lg leading-relaxed font-playfair italic mb-8">
                {lang === 'fr'
                  ? '« Valoriser la richesse symbolique du Vodun en créations contemporaines, conçues au Bénin, pour le monde. »'
                  : '« Elevate the symbolic richness of Vodun into contemporary creations, made in Benin, for the world. »'}
              </p>
              <p className="text-ivoire/55 text-sm leading-relaxed mb-6">
                {lang === 'fr'
                  ? 'Vodun Concept Store est la meilleure marque ancrée à Ouidah, berceau du Vodun. Notre showroom physique représente l\'âme de la marque ; notre boutique digitale en est le cœur — permettant à chacun, partout dans le monde, de commander, recevoir et porter l\'identité Vodun.'
                  : 'Vodun Concept Store is the finest brand rooted in Ouidah, cradle of Vodun. Our physical showroom represents the soul of the brand; our digital boutique is its heart — allowing everyone, everywhere in the world, to order, receive and wear the Vodun identity.'}
              </p>
              <Link to="/a-propos" className="btn-premium-outline text-sm px-8 py-4">
                {lang === 'fr' ? 'L\'Histoire de la Marque →' : 'The Brand Story →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {BRAND_VALUES.map((v, i) => (
                <div key={i} className="border border-ivoire/10 p-5 hover:border-or/30 transition-colors duration-300">
                  <h4 className="text-or text-xs uppercase tracking-[0.3em] font-black mb-2">{v.title}</h4>
                  <p className="text-ivoire/55 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION : TABLEAU RÉCAPITULATIF ──────────────────────────── */}
      <section className="relative z-[2] py-20 md:py-28 border-t border-ivoire/10 section-reveal">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or">{lang === 'fr' ? 'Référence' : 'Reference'}</span>
          <h2 className="editorial-heading text-ivoire mb-12 !text-[clamp(2rem,5vw,3.5rem)]">
            {t.pantheon.sixUniverses}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ivoire/20">
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">{lang === 'fr' ? 'Divinité' : 'Deity'}</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">{lang === 'fr' ? 'Domaine' : 'Domain'}</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">{lang === 'fr' ? 'Couleurs' : 'Colors'}</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6 hidden md:table-cell">{lang === 'fr' ? 'Formes' : 'Shapes'}</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 hidden lg:table-cell">{t.pantheon.power}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivoire/10">
                {DIVINITIES.map((d, i) => (
                  <tr key={i} className="group cursor-pointer hover:bg-ivoire/5 transition-colors duration-200"
                    onClick={() => openDeity(i)}>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <div>
                          <span className="text-ivoire font-black text-sm block">{d.name}</span>
                          <span className="text-ivoire/40 text-[0.6rem] uppercase tracking-wider">{d.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-ivoire/60 text-xs">{d.subtitle}</td>
                    <td className="py-4 pr-6">
                      <div className="flex gap-1">
                        {d.palette.slice(0, 3).map((hex, j) => (
                          <div key={j} className="w-4 h-4 rounded-sm" style={{ backgroundColor: hex }} title={d.paletteLabels[j]} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-ivoire/50 text-xs hidden md:table-cell">{d.attributes[4]?.value}</td>
                    <td className="py-4 text-ivoire/40 text-xs hidden lg:table-cell">{d.attributes[2]?.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section className="relative z-[2] py-24 md:py-32 border-t border-ivoire/10 text-center section-reveal">
        <div className="max-w-3xl mx-auto px-[5vw]">
          <span className="section-label text-or">{lang === 'fr' ? 'Explorer' : 'Explore'}</span>
          <h2 className="editorial-heading text-ivoire mb-8 !text-[clamp(2.5rem,7vw,5rem)]">
            {lang === 'fr' ? 'Portez Votre Divinité' : 'Wear Your Deity'}
          </h2>
          <p className="text-ivoire/60 text-base md:text-lg font-playfair italic leading-relaxed mb-12">
            {lang === 'fr'
              ? 'Chaque produit porte en lui l\'énergie d\'une divinité. Découvrez les collections inspirées du panthéon — des décorations festives aux accessoires quotidiens.'
              : 'Each product carries within it the energy of a deity. Discover the collections inspired by the pantheon — from festive decorations to everyday accessories.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/boutique" className="btn-premium px-10 py-5">
              {lang === 'fr' ? 'Explorer la Boutique' : 'Explore the Boutique'}
            </Link>
            <Link to="/projets-pro" className="btn-premium-outline px-10 py-5">
              {lang === 'fr' ? 'Projets sur Mesure' : 'Custom Projects'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── MODAL DIVINITÉ ──────────────────────────────────────────────── */}
      {activeDeity && <DeityModal deity={activeDeity} onClose={closeDeity} t={t} lang={lang} />}
    </div>
  );
}
