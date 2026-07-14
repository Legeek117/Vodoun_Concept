import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';
import PantheonGalaxy from '../components/PantheonGalaxy';

gsap.registerPlugin(ScrollTrigger);

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

// ── Valeurs fondatrices de la marque ────────────────────────────────────────
const BRAND_VALUES = [
  { title: 'Authenticité', desc: 'Ancré dans une tradition et une spiritualité vivantes. Chaque création respecte la signification profonde des symboles Vodun.' },
  { title: 'Excellence', desc: 'Beau, solide, durable. Des pièces conçues pour traverser les générations et porter la mémoire d\'un symbole.' },
  { title: 'Respect', desc: 'Le Vodun est vivant. Toute création l\'honore. Nous travaillons avec les artisans béninois dans la dignité.' },
  { title: 'Rayonnement', desc: 'Faire de Ouidah la capitale mondiale du design inspiré du Vodun. Chaque vente exporte la beauté béninoise.' },
];

// ── Composant carte divinité (vue grille) ───────────────────────────────────
function DeityCard({ deity, index, onClick, isActive }) {
  return (
    <div
      className={`group cursor-pointer animate-in transition-all duration-500 ${isActive ? 'ring-2 ring-or' : ''}`}
      onClick={() => onClick(index)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: deity.color }}>
        {deity.image && (
          <img
            src={deity.image}
            alt={deity.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 opacity-85"
          />
        )}
        <div className="absolute inset-0 mix-blend-multiply opacity-30" style={{ backgroundColor: deity.color }} />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
        {/* Badge subtitle */}
        <div className="absolute top-4 left-4">
          <span className="text-[0.55rem] uppercase tracking-[0.35em] text-ivoire/60 block">{deity.subtitle}</span>
        </div>
        {/* Name overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <span className="text-[0.6rem] uppercase tracking-[0.4em] text-ivoire/50 block mb-2">{deity.title}</span>
          <h3 className="font-playfair text-3xl md:text-4xl font-black text-ivoire mb-3 drop-shadow-lg">{deity.name}</h3>
          <p className="text-ivoire/70 text-xs leading-relaxed line-clamp-2 mb-3">{deity.intro}</p>
          <p className="text-[0.6rem] text-ivoire/40 uppercase tracking-widest">{deity.description}</p>
        </div>
        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <span className="bg-or/90 text-noir text-[0.6rem] uppercase tracking-[0.3em] font-black px-4 py-2">
            Découvrir →
          </span>
        </div>
      </div>
      {/* Attributes strip */}
      <div className="border border-ivoire/10 divide-y divide-ivoire/10">
        {deity.attributes.slice(0, 3).map((attr, j) => (
          <div key={j} className="flex justify-between items-center px-4 py-2.5">
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivoire/40">{attr.label}</span>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: deity.colorLight }}>{attr.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Modal détail divinité ───────────────────────────────────────────────────
function DeityModal({ deity, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current) return;
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
    );
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-noir/90 backdrop-blur-md" onClick={onClose} />
      {/* Panel */}
      <div ref={modalRef} className="relative z-10 w-full md:max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0D0B08] border border-ivoire/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        {/* Header image */}
        <div className="relative h-56 md:h-72 overflow-hidden" style={{ backgroundColor: deity.color }}>
          {deity.image && (
            <img src={deity.image} alt={deity.name} className="absolute inset-0 w-full h-full object-cover object-top opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B08] via-noir/40 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 text-ivoire/60 hover:text-ivoire text-2xl font-light z-10" aria-label="Fermer">✕</button>
          <div className="absolute bottom-0 left-0 p-6 md:p-8 z-10">
            <span className="text-[0.55rem] uppercase tracking-[0.4em] text-ivoire/50 block mb-1">{deity.title}</span>
            <h2 className="font-playfair text-4xl md:text-6xl font-black text-ivoire">{deity.name}</h2>
            <p className="text-or text-xs uppercase tracking-[0.3em] mt-2">{deity.subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Gauche : textes */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">L'Essence</h3>
              <p className="text-ivoire/80 text-sm leading-relaxed font-playfair italic">{deity.intro}</p>
            </div>
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">L'Histoire</h3>
              <p className="text-ivoire/70 text-sm leading-relaxed">{deity.story}</p>
            </div>
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">Le Vévé</h3>
              <p className="text-ivoire/60 text-xs leading-relaxed italic">« {deity.veve} »</p>
            </div>
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">Offrandes Traditionnelles</h3>
              <p className="text-ivoire/60 text-xs leading-relaxed">{deity.offerings}</p>
            </div>
          </div>

          {/* Droite : attributs + palette + collections */}
          <div className="space-y-6">
            <div className="border border-ivoire/10 divide-y divide-ivoire/10">
              {deity.attributes.map((attr, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-3">
                  <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivoire/40">{attr.label}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-right max-w-[55%]" style={{ color: deity.colorLight }}>{attr.value}</span>
                </div>
              ))}
            </div>

            {/* Palette chromatique */}
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">Palette Sacrée</h3>
              <div className="grid grid-cols-4 gap-2">
                {deity.palette.map((hex, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-full mb-1 rounded-sm" style={{ backgroundColor: hex }} />
                    <span className="text-[0.5rem] text-ivoire/40 uppercase tracking-wider leading-tight block">{deity.paletteLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collections liées */}
            <div>
              <h3 className="text-[0.6rem] uppercase tracking-[0.35em] text-or mb-3">Collections Inspirées</h3>
              <ul className="space-y-1.5">
                {deity.collections.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-ivoire/60">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: deity.colorLight }} />
                    {c}
                  </li>
                ))}
              </ul>
              <Link to="/boutique" onClick={onClose}
                className="inline-block mt-4 text-[0.6rem] uppercase tracking-[0.3em] font-black text-noir px-5 py-2.5 transition-all duration-300"
                style={{ backgroundColor: deity.colorLight }}>
                Explorer la collection →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export default function PantheonPage() {
  const containerRef = useRef(null);
  const [activeDeity, setActiveDeity] = useState(null);
  const { lang } = useLanguage();
  const t = lang === 'fr' ? fr : en;

  const openDeity = (index) => setActiveDeity(DIVINITIES[index]);
  const closeDeity = () => setActiveDeity(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll('.animate-in'),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 75%' } }
    );

    // Animate sections on scroll
    gsap.utils.toArray('.section-reveal').forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true } }
      );
    });
  }, []);

  return (
    <div className="relative min-h-screen text-ivoire" ref={containerRef}>

      {/* ── GALAXIE FIXED — couvre tout le fond de la page ────────────── */}
      <div
        className="pointer-events-none"
        style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#0A0705' }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          gl={{ antialias: false, alpha: true }}
        >
          <PantheonGalaxy />
        </Canvas>
        {/* Voile sombre pour la lisibilité du texte sur toute la page */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,7,5,0.55)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative z-[1] pt-40 pb-24 overflow-hidden">
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
            Chaque divinité du panthéon Vodun inspire une collection — ses couleurs, ses formes, ses matières. 
            Découvrez les six puissances qui fondent l'identité créative de Vodun Concept Store, née à Ouidah, berceau du Vodun.
          </p>

          {/* Séparateur doré */}
          <div className="animate-in flex items-center gap-4 mt-10">
            <div className="h-px flex-1 max-w-[80px] bg-or/40" />
            <span className="text-or text-xs uppercase tracking-[0.4em]">Les Six Puissances</span>
            <div className="h-px flex-1 max-w-[80px] bg-or/40" />
          </div>
        </div>
      </section>

      {/* ── GRILLE DIVINITÉS ──────────────────────────────────────────── */}
      <section className="relative z-[1] py-8 pb-24">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {DIVINITIES.map((deity, i) => (
              <DeityCard
                key={deity.name}
                deity={deity}
                index={i}
                onClick={openDeity}
                isActive={activeDeity?.name === deity.name}
              />
            ))}
          </div>
          <p className="text-center text-ivoire/30 text-xs uppercase tracking-[0.3em] mt-10">
            Cliquez sur une divinité pour découvrir son univers complet
          </p>
        </div>
      </section>

      {/* ── SECTION : VISION FONDATRICE ───────────────────────────────── */}
      <section className="relative z-[1] py-24 md:py-32 border-t border-ivoire/10 section-reveal">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-label text-or">Mission</span>
              <h2 className="editorial-heading text-ivoire mb-6 !text-[clamp(2rem,6vw,4rem)]">
                Vision Fondatrice
              </h2>
              <p className="text-ivoire/70 text-base md:text-lg leading-relaxed font-playfair italic mb-8">
                « Valoriser la richesse symbolique du Vodun en créations contemporaines, conçues au Bénin, pour le monde. »
              </p>
              <p className="text-ivoire/55 text-sm leading-relaxed mb-6">
                Vodun Concept Store est la seule marque ancrée à Ouidah, berceau du Vodun. Notre showroom physique 
                représente l'âme de la marque ; notre boutique digitale en est le cœur — permettant à chacun, 
                partout dans le monde, de commander, recevoir et porter l'identité Vodun.
              </p>
              <Link to="/a-propos" className="btn-premium-outline text-sm px-8 py-4">
                L'Histoire de la Marque →
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

      {/* ── SECTION : TABLEAU RÉCAPITULATIF ───────────────────────────── */}
      <section className="relative z-[1] py-20 md:py-28 border-t border-ivoire/10 section-reveal">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or">Référence</span>
          <h2 className="editorial-heading text-ivoire mb-12 !text-[clamp(2rem,5vw,3.5rem)]">
            Les Six Univers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ivoire/20">
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">Divinité</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">Domaine</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6">Couleurs</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 pr-6 hidden md:table-cell">Formes</th>
                  <th className="text-[0.6rem] uppercase tracking-[0.35em] text-or pb-4 hidden lg:table-cell">Pouvoir</th>
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

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="relative z-[1] py-24 md:py-32 border-t border-ivoire/10 text-center section-reveal">
        <div className="max-w-3xl mx-auto px-[5vw]">
          <span className="section-label text-or">Explorer</span>
          <h2 className="editorial-heading text-ivoire mb-8 !text-[clamp(2.5rem,7vw,5rem)]">
            Portez Votre Divinité
          </h2>
          <p className="text-ivoire/60 text-base md:text-lg font-playfair italic leading-relaxed mb-12">
            Chaque produit porte en lui l'énergie d'une divinité. Découvrez les collections inspirées du panthéon — 
            des décorations festives aux accessoires quotidiens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/boutique" className="btn-premium px-10 py-5">Explorer la Boutique</Link>
            <Link to="/projets-pro" className="btn-premium-outline px-10 py-5">Projets sur Mesure</Link>
          </div>
        </div>
      </section>

      {/* ── MODAL DIVINITÉ ────────────────────────────────────────────── */}
      {activeDeity && <DeityModal deity={activeDeity} onClose={closeDeity} />}
    </div>
  );
}
