import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import usePageMeta from '../hooks/usePageMeta';
import ProjectModal from '../components/ProjectModal';

gsap.registerPlugin(ScrollTrigger);

// SEO metadata for B2B page
const SEO_META = {
  title: 'Projets Professionnels B2B · Vodun Concept Store',
  description: 'Aménagements sur mesure pour hôtels, bureaux et espaces culturels. Mobilier, luminaires monumentaux et installations artisanales inspirés de la culture Vodun. Devis personnalisé.',
};

const HOTEL_SERVICES = [
  {
    title: 'Mobilier de salle', desc: 'Chaises, tables avec motifs vévés intégrés.',
    domain: 'Hôtel / Restaurant',
    image: '/Mobilier Résidentiel.png',
    details: 'Chaises, tables, consoles et paravents en bois massif sculpté, avec motifs vévés intégrés et finitions laque noire & or.',
    highlights: ['Bois massif sélectionné sur place à Ouidah', 'Motifs vévés gravés dans la masse', 'Capacité 20 à 200 couverts', 'Délais synchronisés sur vos ouvertures'],
    timeline: 'Délai indicatif : 6 à 10 semaines',
  },
  {
    title: 'Luminaires sur mesure', desc: 'Pour salles et lobbies premium.',
    domain: 'Hôtel / Restaurant',
    image: '/Led.png',
    details: 'Suspensions, lustres et appliques conçus autour de vos volumes : métal perforé, cauris, raphia et micro-LED.',
    highlights: ['Étude lumière offerte avec chaque devis', 'Projections d\'ombres vévés au sol et aux murs', 'IP adaptée aux zones humides (cuisines, spas)', 'Variateur et scénarios d\'éclairage'],
    timeline: 'Délai indicatif : 8 à 12 semaines',
  },
  {
    title: 'Masques et sculptures', desc: 'Pour espaces de réception.',
    domain: 'Hôtel / Restaurant',
    image: '/Mobilier Résidentiel.png',
    details: 'Pièces monumentales ou séries décoratives en bois, métal repoussé et techniques mixtes, pour vos halls, salons et suites.',
    highlights: ['Pièces uniques signées par nos ateliers', 'Adaptation aux dimensions du lieu', 'Accroche et mise en scène fournies'],
    timeline: 'Délai indicatif : 4 à 8 semaines',
  },
  {
    title: 'Textiles muraux et tentures', desc: 'Pour ambiance identitaire.',
    domain: 'Hôtel / Restaurant',
    image: '/Mobilier Résidentiel.png',
    details: 'Tapisseries, tentures et panneaux textiles en fibres naturelles locales, aux motifs vévés sur mesure dans votre palette.',
    highlights: ['Fibres naturelles du Bénin : coton, raphia, sisal', 'Isolement phonique et thermique naturel', 'Traitement ignifuge sur demande', 'Nuancier personnalisé'],
    timeline: 'Délai indicatif : 5 à 9 semaines',
  },
  {
    title: 'Vaisselle artisanale', desc: 'Dressage de table premium pour restaurants d\'exception.',
    domain: 'Hôtel / Restaurant',
    image: '/Mobilier Résidentiel.png',
    details: 'Vaisselle en terre cuite, céramique émaillée et cauris, façonnée à la main pour un dressage unique et racontable.',
    highlights: ['Fabrication 100 % artisanale', 'Émaux aux teintes signature (or, ivoire, brun)', 'Séries de 12 à 500 pièces', 'Assiettes, plats, coupelles, sets'],
    timeline: 'Délai indicatif : 6 à 10 semaines',
  },
];

const OFFICE_SERVICES = [
  {
    title: 'Bureau de direction', desc: 'Bois massif sculpté, laque noire & incrustations or, bibliothèques rétroéclairées — pièce unique signée.',
    domain: 'Bureaux / Siège social',
    image: '/Le trône de direction.png',
    details: 'Un poste de commandement à votre image : plateau massif sculpté, rangements intégrés, signalétique discrète et éclairage d\'accent sur les pièces maîtresses.',
    highlights: ['Étude d\'implantation et plans 3D offerts', 'Incrustations or et laque noire', 'Rangements et câblage intégrés', 'Finition patinée main'],
    timeline: 'Délai indicatif : 8 à 12 semaines',
  },
  {
    title: 'Salle d\'attente', desc: 'Sièges design identitaire en bois et cuir, textiles muraux vévés et éclairage raphia ambiancé.',
    domain: 'Bureaux / Siège social',
    image: '/La Voute céleste.png',
    details: 'Concevez la première impression de vos visiteurs : assises signature, cloison textile acoustique et lumière chaude sur motif.',
    highlights: ['Acoustique travaillée (panneaux textiles)', 'Assises bois & cuir sur mesure', 'Ambiance lumière douce', 'Livraison et installation incluses'],
    timeline: 'Délai indicatif : 6 à 10 semaines',
  },
  {
    title: 'Espace d\'accueil', desc: 'Comptoir sur mesure avec vévé incrusté, signalétique gravée et sculptures de bienvenue.',
    domain: 'Bureaux / Siège social',
    image: '/Le Rideau Patrimoine.png',
    details: 'Un comptoir qui incarne votre marque dès le seuil : bois sculpté, vévé incrusté et mise en lumière du logo.',
    highlights: ['Comptoir aux cotes exactes de votre hall', 'Vévé ou logo incrusté', 'Signalétique gravée incluse', 'Éclairage LED intégré'],
    timeline: 'Délai indicatif : 7 à 11 semaines',
  },
];

const MONUMENTAL = [
  { title: 'Le Sentinelle', desc: 'Lanternes festives multicolores inspirées des masques traditionnels.', tag: 'Déco Festive', domain: 'Installation monumentale', image: '/Le Sentinelle.png',
    details: 'Un gardien de lumière pour vos entrées et événements : lanterne monumentale aux couleurs des masques traditionnels, durable et mobile.', highlights: ['Jusqu\'à 3 m de haut', 'Structure aluminium, éclairage LED', 'Montage / démontage en 2h', 'Intérieur comme extérieur'], timeline: 'Délai indicatif : 4 à 7 semaines' },
  { title: 'La Voûte céleste', desc: 'Installations lumineuses grand format en cauris.', tag: 'Installation', domain: 'Installation monumentale', image: '/La Voute céleste.png',
    details: 'Un ciel de cauris suspendu au-dessus de vos espaces : installation grand format, modulable, sculptée dans la matière symbole du Bénin.', highlights: ['Grand format sur mesure', 'Mille cauris assemblés à la main', 'Accrochage aérien sécurisé', 'Entretien simplifié'], timeline: 'Délai indicatif : 10 à 16 semaines' },
  { title: 'Le Nuage de cauris', desc: 'Suspensions sculpturales en cauris, en forme de nuages de lumière.', tag: 'Suspension', domain: 'Installation monumentale', image: '/Le nuage de cauris.png',
    details: 'Des nuages lumineux suspendus : raffinement et légèreté pour atrium, hall ou salle de réception.', highlights: ['Formes organiques sur mesure', 'Cauris naturels ou dorés', 'Hauteur d\'accroche adaptée', 'Effet « ciel au crépuscule »'], timeline: 'Délai indicatif : 8 à 12 semaines' },
  { title: 'Le Veilleur', desc: 'Totems de lumière en métal perforé et raphia naturel, H 1m à 3m.', tag: 'Totem', domain: 'Installation monumentale', image: '/Le veilleur.png',
    details: 'Totem de lumière signé, du hall d\'entreprise à l\'esplanade : métal perforé, raphia naturel et jeu d\'ombres vévés.', highlights: ['Hauteur 1 à 3 m', 'Métal perforé inoxydable', 'Éclairage LED intérieur', 'Socle scellé ou mobile'], timeline: 'Délai indicatif : 6 à 10 semaines' },
  { title: 'Les Perles de l\'Océan', desc: 'Boules lumineuses de cauris, suspendues ou sur socle.', tag: 'Déco', domain: 'Installation monumentale', image: '/Les perles de l\'océan.png',
    details: 'Sphères de cauris brillantes, posées ou suspendues, qui évoquent les perles de l\'océan et habillent réceptions et lieux de passage.', highlights: ['Sphères Ø 30 à 120 cm', 'Suspendues ou sur socle', 'Éclairage intérieur doux', 'Léger et facile à installer'], timeline: 'Délai indicatif : 5 à 8 semaines' },
  { title: 'Cristal de la Prospérité', desc: 'Sphère décorative en verre et cauris, symbole d\'abondance.', tag: 'Déco', domain: 'Installation monumentale', image: '/Cristal de la prospérité.png',
    details: 'Une sphère précieuse, verre soufflé et cauris, symbole d\'abondance : l\'objet signature de votre espace de réception.', highlights: ['Verre soufflé artisanal', 'Cauris intégrés sous verre', 'Présentoir bois sculpté', 'Édition numérotée'], timeline: 'Délai indicatif : 6 à 9 semaines' },
  { title: 'La Couronne de l\'oracle', desc: 'Couronne de cauris : l\'accueil festif du seuil.', tag: 'Accueil', domain: 'Installation monumentale', image: '/La courone de l\'oracle.png',
    details: 'Signez l\'entrée de vos lieux avec une couronne de cauris festive, suspendue ou murale.', highlights: ['Æ 80 à 200 cm', 'Cauris et raphia assemblés main', 'Aimantée ou fixe', 'Intérieur / extérieur couvert'], timeline: 'Délai indicatif : 3 à 6 semaines' },
  { title: 'La Pluie de cauris', desc: 'Cloisons de lumière en cauris, fils d\'or et micro-LED.', tag: 'Installation', domain: 'Installation monumentale', image: '/La pluie de cauris.png',
    details: 'Cloison semi-transparente en pluie de cauris et fils d\'or : séparez et éclairez vos espaces avec élégance.', highlights: ['Cloison de séparation lumineuse', 'Fils d\'or et micro-LED', 'Semi-transparence préservée', 'Dimensions sur plan'], timeline: 'Délai indicatif : 9 à 14 semaines' },
  { title: 'Lanternes Cérémonielles', desc: 'Lanternes festives multicolores inspirées des masques traditionnels.', tag: 'Déco Festive', domain: 'Installation monumentale', image: '/Lanternes Cérémonielles.png',
    details: 'Série de lanternes festives aux couleurs des cérémonies : éclairez vos allées, terrasses et salles de réception.', highlights: ['Collections coordonnées', 'Format 50 cm à 2 m', 'Résistantes aux intempéries', 'Prise ou batterie'], timeline: 'Délai indicatif : 4 à 7 semaines' },
  { title: 'Le Rideau Patrimoine', desc: 'Installations sur mesure, symboles Vodun illuminés, grand format.', tag: 'Sur Mesure', domain: 'Installation monumentale', image: '/Le Rideau Patrimoine.png',
    details: 'Le grand format de vos murs : rideau textile suspendu avec symboles Vodun illuminés, tissé à vos dimensions.', highlights: ['Grand format jusqu\'à 12 m', 'Tissage artisanal sur métier', 'Symboles illuminés en LED', 'Flammable traité'], timeline: 'Délai indicatif : 10 à 14 semaines' },
];

const POLES = [
  { name: 'Ouidah', sub: 'Showroom', desc: 'Siège · Exposition · Accueil touristes · Événements culturels', icon: '⬡' },
  { name: 'Cotonou', sub: 'Hub Stock', desc: 'Ateliers · Production · Logistique · Expéditions mondiales', icon: '◈' },
  { name: 'E-commerce', sub: 'Global', desc: 'Commandes 24h/24 · Livraison mondiale · Configurateurs', icon: '◆' },
  { name: 'Événementiel', sub: 'Présence', desc: 'Vodun Days · FInAB · Festival des Masques · MASA', icon: '✦' },
];

const PRESENCE_ITEMS = [
  {
    title: 'Masques contemporains', desc: 'Bois sculpté, métal repoussé ou techniques mixtes.',
    domain: 'Décoration & Objets', image: '/Le Sentinelle.png',
    details: 'Masques d\'apparat et pièces murales contemporaines : bois sculpté, métal repoussé, techniques mixtes, déclinés dans votre palette.',
    highlights: ['Pièces uniques ou séries limitées', 'Accroche & éclairage fournis', 'Certificat d\'authenticité'],
    timeline: 'Délai indicatif : 4 à 7 semaines',
  },
  {
    title: 'Tableaux & bas-reliefs', desc: 'Motifs vévés peints sur bois, fer ou toile.',
    domain: 'Décoration & Objets', image: '/Mobilier Résidentiel.png',
    details: 'Œuvres murales aux motifs vévés, peintes ou gravées sur bois, fer et toile tendue : la signature Vodun de vos murs.',
    highlights: ['Toile tendue ou panneau bois', 'Relief et dorure main', 'Formats jusqu\'à 4 m'],
    timeline: 'Délai indicatif : 3 à 6 semaines',
  },
  {
    title: 'Sculptures Bocio', desc: 'Figurines contemporaines — œuvre de création originale.',
    domain: 'Décoration & Objets', image: '/Mobilier Résidentiel.png',
    details: 'La tradition Bocio réinterprétée en sculptures contemporaines : des pièces de caractère pour vos espaces d\'autorité et de réception.',
    highlights: ['Création originale signée', 'Bois, métal et assemblages mixtes', 'Pièces de collection'],
    timeline: 'Délai indicatif : 5 à 9 semaines',
  },
  {
    title: 'Textiles muraux', desc: 'Tapisseries, tentures, macramés en fibres naturelles locales.',
    domain: 'Décoration & Objets', image: '/Le Rideau Patrimoine.png',
    details: 'Tapisseries, tentures et macramés tissés en fibres naturelles locales, avec motifs vévés et cotes exactes de vos murs.',
    highlights: ['Tissage artisanal local', 'Nuancier personnalisé', 'Acoustique améliorée'],
    timeline: 'Délai indicatif : 5 à 8 semaines',
  },
  {
    title: 'Miroirs encadrés', desc: 'Cadres bois sculptés ou métal avec motifs symboliques.',
    domain: 'Décoration & Objets', image: '/Mobilier Résidentiel.png',
    details: 'Miroirs d\'exception aux cadres sculptés bois ou métal, motifs symboliques : agrandissez et signez vos espaces.',
    highlights: ['Bois massif ou métal découpé', 'Formats ronds, arcs ou libres', 'Suspension dissimulée'],
    timeline: 'Délai indicatif : 3 à 6 semaines',
  },
];

const LUMINAIRE_ITEMS = [
  {
    title: 'Suspension métal perforé', desc: 'Projette des ombres de vévés, ambiance unique et mémorable.',
    domain: 'Luminaires', image: '/Led.png',
    details: 'Suspension en métal perforé à motifs vévés : la lumière projette des ombres sacrées sur vos murs, pour une ambiance unique.',
    highlights: ['Patrons vévés découpés au laser', 'LED intégrée, variateur', 'Chute personnalisable'],
    timeline: 'Délai indicatif : 5 à 8 semaines',
  },
  {
    title: 'Lampe raphia tressé', desc: 'Abat-jour en fibres naturelles, lumière tamisée chaude.',
    domain: 'Luminaires', image: '/Lanternes Cérémonielles.png',
    details: 'Abat-jour tressé à la main en raphia et fibres naturelles : une lumière chaude et feutrée, artisanalement béninoise.',
    highlights: ['Tressage main, pièce unique', 'Douille standard E27', 'Intérieur comme extérieur couvert'],
    timeline: 'Délai indicatif : 3 à 5 semaines',
  },
  {
    title: 'Lanterne bronze', desc: 'Motifs géométriques découpés au laser, édition artisanale.',
    domain: 'Luminaires', image: '/Lanternes Cérémonielles.png',
    details: 'Lanternes en laiton / bronze aux motifs géométriques découpés au laser : l\'édition artisanale pour terrasses et réceptions.',
    highlights: ['Découpe laser de précision', 'Finitions patinées', 'Format table, mur ou suspendu'],
    timeline: 'Délai indicatif : 4 à 6 semaines',
  },
  {
    title: 'Bougeoir sculpté bois', desc: 'Bois massif béninois, formes symboliques ciselées.',
    domain: 'Luminaires', image: '/Le Sentinelle.png',
    details: 'Bougeoirs et photophores en bois massif béninois, formes symboliques ciselées : une flamme posée sur l\'artisanat local.',
    highlights: ['Bois massif local', 'Ciselures symboliques', 'Ensembles coordonnés'],
    timeline: 'Délai indicatif : 2 à 4 semaines',
  },
];

/**
 * ProjectCard — carte de projet cliquable → ouvre la modal de détail + devis.
 */
function ProjectCard({ item, variant = 'default', onClick }) {
  const monumental = variant === 'monumental';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Voir le projet ${item.title}`}
      className={`group relative text-left rounded-3xl border border-brun/10 bg-white/40 hover:bg-white/60 hover:border-or/40 hover:shadow-xl transition-all duration-500 w-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 ring-or/50 ${monumental ? 'p-8' : 'p-7'}`}
    >
      {monumental && item.tag && (
        <span className="absolute top-4 right-5 text-[9px] uppercase tracking-[0.35em] text-or/50 font-bold z-10">{item.tag}</span>
      )}
      <div className="aspect-video mb-5 rounded-2xl overflow-hidden relative">
        <img src={item.image} alt={item.title} loading="lazy" decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Hover overlay "Voir le projet" */}
        <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/25 transition-colors duration-500 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="text-[10px] uppercase tracking-[0.3em] text-ivoire font-bold bg-noir/60 backdrop-blur px-4 py-2 rounded-full">
            Voir le projet
          </span>
        </div>
      </div>
      <h3 className={`font-playfair ${monumental ? 'text-2xl font-black' : 'text-xl font-bold'} text-noir mb-2`}>{item.title}</h3>
      <p className="text-brun/60 text-sm leading-relaxed">{item.desc}</p>
      <span className="inline-flex items-center gap-2 mt-4 text-[10px] uppercase tracking-[0.3em] text-or font-bold group-hover:gap-3 transition-all duration-300">
        Demander un devis <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}

export default function B2BPage() {
  const [sent, setSent] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const glowRef = useRef(null);
  const sectionsRef = useRef([]);
  const cardRef = useRef(null);

  usePageMeta(SEO_META);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Scroll reveal for sections
    sectionsRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });
  }, []);

  const handleMouseMove = (e) => {
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    gsap.to(cardRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => setSent(true) });
  };

  const addSection = (i) => (el) => { sectionsRef.current[i] = el; };

  return (
    <div className="min-h-screen bg-ivoire relative overflow-hidden" onMouseMove={handleMouseMove}>

      {/* Subtle cursor glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-[700px] h-[700px] pointer-events-none rounded-full z-0"
        style={{
          background: 'radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 65%)',
          transform: 'translate(-50%,-50%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-[5vw] space-y-28">

          {/* ── HERO HEADER ── */}
          <div ref={addSection(0)}>
            <span className="section-label block mb-3">Projets Pro</span>
            <h1 className="editorial-heading text-noir !text-[clamp(2.5rem,8vw,5rem)] max-w-4xl leading-none">
              Habiller vos espaces d'une identité africaine d'exception.
            </h1>
            <p className="mt-8 text-brun/80 text-lg md:text-xl font-playfair max-w-2xl leading-relaxed">
              Vodun Concept Store accompagne hôteliers, restaurateurs, architectes et entreprises dans la création d'environnements habités, où chaque objet porte un sens sacré.
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-or/60 font-bold">
              Projets B2B sur devis · Livraison + installation incluses
            </p>
          </div>

          {/* ── SECTION 1 : HÉBERGEMENT & RESTAURATION ── */}
          <div ref={addSection(1)}>
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Domaine</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Hôtels & Restaurants</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {HOTEL_SERVICES.map((s, i) => (
                <ProjectCard key={i} item={s} onClick={() => setSelectedProject(s)} />
              ))}
            </div>
          </div>

          {/* ── SECTION 2 : BUREAUX & ESPACES COMMERCIAUX ── */}
          <div ref={addSection(2)}>
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Domaine</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Bureaux & Espaces Commerciaux</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {OFFICE_SERVICES.map((s, i) => (
                <ProjectCard key={i} item={s} onClick={() => setSelectedProject(s)} />
              ))}
            </div>
          </div>

          {/* ── SECTION 3 : INSTALLATIONS MONUMENTALES ── */}
          <div ref={addSection(3)}>
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Domaine</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Installations Monumentales</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MONUMENTAL.map((item, i) => (
                <ProjectCard key={i} item={item} variant="monumental" onClick={() => setSelectedProject(item)} />
              ))}
            </div>
          </div>

          {/* ── SECTION 4 : PRÉSENCES (DÉCORATION) ── */}
          <div ref={addSection(6)}>
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Décoration</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Présences</h2>
              </div>
              <p className="text-brun/40 text-xs uppercase tracking-widest text-right hidden md:block max-w-xs">Ces objets l'habitent.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRESENCE_ITEMS.map((s, i) => (
                <ProjectCard key={i} item={s} onClick={() => setSelectedProject(s)} />
              ))}
            </div>
          </div>

          {/* ── SECTION 5 : LUMINAIRES SACRÉS ── */}
          <div ref={addSection(7)}>
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Lumière</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Luminaires sacrés</h2>
              </div>
              <p className="text-brun/40 text-xs uppercase tracking-widest text-right hidden md:block max-w-xs">Des ombres sacrées sur vos murs</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LUMINAIRE_ITEMS.map((s, i) => (
                <ProjectCard key={i} item={s} onClick={() => setSelectedProject(s)} />
              ))}
            </div>
          </div>

          {/* ── ARCHITECTURE 4 PÔLES ── */}
          <div ref={addSection(4)} className="py-12">
            <div className="mb-10 flex items-end justify-between gap-4 border-b border-brun/10 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-2">Logistique</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir">Architecture à 4 Pôles</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {POLES.map((pole, i) => (
                <div key={i} className="group p-8 rounded-3xl border border-brun/10 bg-white/40 hover:border-or/40 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-4 right-5 text-or/10 text-5xl pointer-events-none group-hover:text-or/20 transition-colors duration-500">{pole.icon}</div>
                  <div className="text-[9px] uppercase tracking-[0.4em] text-or/50 mb-2 font-bold">{pole.sub}</div>
                  <h3 className="font-playfair text-2xl font-black text-noir mb-3">{pole.name}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed">{pole.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORM ── */}
          <div ref={addSection(5)} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-or font-bold block mb-4">Travaillons ensemble</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-black text-noir leading-tight">Partagez votre vision, nous la concrétisons.</h2>
              </div>
              <p className="text-brun/60 text-base leading-relaxed font-playfair italic">
                "Meilleure marque ancrée à Ouidah, berceau du Vodun, nous créons des espaces habités — du mobilier à l'installation lumineuse monumentale."
              </p>
            </div>

            <div ref={cardRef} className="rounded-[32px] p-8 md:p-12 border border-brun/10 bg-white/50 shadow-xl">
              {sent ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-or/10 rounded-full flex items-center justify-center mx-auto mb-6 text-or text-2xl">✓</div>
                  <h3 className="font-playfair text-3xl font-bold text-noir mb-3">Demande Reçue</h3>
                  <p className="text-brun/50 text-sm">Notre équipe vous contactera dans les 48h.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-playfair text-2xl font-bold text-noir mb-1">Demander un Devis</h3>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-brun/40 mb-8">Projets professionnels · sur mesure</p>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Nom complet</label>
                        <input required type="text" placeholder="Jean Dupont" className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Entreprise</label>
                        <input required type="text" placeholder="Nom de l'entreprise" className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Email professionnel</label>
                      <input required type="email" placeholder="contact@entreprise.com" className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Type de projet</label>
                      <select required className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun">
                        <option value="">Choisir un domaine...</option>
                        <option>Hôtel / Restaurant</option>
                        <option>Bureaux / Siège social</option>
                        <option>Installation monumentale</option>
                        <option>Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.3em] text-brun/50 block mb-1.5">Description du projet</label>
                      <textarea required rows={4} placeholder="Décrivez votre espace, vos besoins..." className="w-full px-4 py-3 bg-white border border-brun/15 rounded-xl focus:border-or focus:outline-none transition-all duration-300 text-sm text-brun resize-none" />
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl font-bold uppercase tracking-[0.4em] text-sm mt-2 shadow-lg hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #B8860B, #8a6208)', color: '#F4F0E6' }}>Initier le Projet</button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL DÉTAIL PROJET + DEVIS ── */}
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
