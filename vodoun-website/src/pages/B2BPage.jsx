import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HOTEL_SERVICES = [
  { title: 'Mobilier de salle', desc: 'Chaises, tables avec motifs vévés intégrés.', image: '/Mobilier Résidentiel.png' },
  { title: 'Luminaires sur mesure', desc: 'Pour salles et lobbies premium.', image: '/Led.png' },
  { title: 'Masques et sculptures', desc: 'Pour espaces de réception.', image: '/Mobilier Résidentiel.png' },
  { title: 'Textiles muraux et tentures', desc: 'Pour ambiance identitaire.', image: '/Mobilier Résidentiel.png' },
  { title: 'Vaisselle artisanale', desc: 'Dressage de table premium pour restaurants d\'exception.', image: '/Mobilier Résidentiel.png' }
];

const OFFICE_SERVICES = [
  { title: 'Bureau de direction', desc: 'Bois massif sculpté, laque noire & incrustations or, bibliothèques rétroéclairées — pièce unique signée.', image: '/Le trône de direction.png' },
  { title: 'Salle d\'attente', desc: 'Sièges design identitaire en bois et cuir, textiles muraux vévés et éclairage raphia ambiancé.', image: '/La Voute céleste.png' },
  { title: 'Espace d\'accueil', desc: 'Comptoir sur mesure avec vévé incrusté, signalétique gravée et sculptures de bienvenue.', image: '/Le Rideau Patrimoine.png' },
];

const MONUMENTAL = [
  { name: 'Le Sentinelle', desc: 'Lanternes festives multicolores inspirées des masques traditionnels.', tag: 'Déco Festive', image: '/Le Sentinelle.png' },
  { name: 'La Voûte céleste', desc: 'Installations lumineuses grand format en cauris.', tag: 'Installation', image: '/La Voute céleste.png' },
  { name: 'Le Nuage de cauris', desc: 'Suspensions sculpturales en cauris, en forme de nuages de lumière.', tag: 'Suspension', image: '/Le nuage de cauris.png' },
  { name: 'Le Veilleur', desc: 'Totems de lumière en métal perforé et raphia naturel, H 1m à 3m.', tag: 'Totem', image: '/Le veilleur.png' },
  { name: 'Les Perles de l\'Océan', desc: 'Boules lumineuses de cauris, suspendues ou sur socle.', tag: 'Déco', image: '/Les perles de l\'océan.png' },
  { name: 'Cristal de la Prospérité', desc: 'Sphère décorative en verre et cauris, symbole d\'abondance.', tag: 'Déco', image: '/Cristal de la prospérité.png' },
  { name: 'La Couronne de l\'oracle', desc: 'Couronne de cauris : l\'accueil festif du seuil.', tag: 'Accueil', image: '/La courone de l\'oracle.png' },
  { name: 'La Pluie de cauris', desc: 'Cloisons de lumière en cauris, fils d\'or et micro-LED.', tag: 'Installation', image: '/La pluie de cauris.png' },
  { name: 'Lanternes Cérémonielles', desc: 'Lanternes festives multicolores inspirées des masques traditionnels.', tag: 'Déco Festive', image: '/Lanternes Cérémonielles.png' },
  { name: 'Le Rideau Patrimoine', desc: 'Installations sur mesure, symboles Vodun illuminés, grand format.', tag: 'Sur Mesure', image: '/Le Rideau Patrimoine.png' },
];

const POLES = [
  { name: 'Ouidah', sub: 'Showroom', desc: 'Siège · Exposition · Accueil touristes · Événements culturels', icon: '⬡' },
  { name: 'Cotonou', sub: 'Hub Stock', desc: 'Ateliers · Production · Logistique · Expéditions mondiales', icon: '◈' },
  { name: 'E-commerce', sub: 'Global', desc: 'Commandes 24h/24 · Livraison mondiale · Configurateurs', icon: '◆' },
  { name: 'Événementiel', sub: 'Présence', desc: 'Vodun Days · FInAB · Festival des Masques · MASA', icon: '✦' },
];

export default function B2BPage() {
  const [sent, setSent] = useState(false);
  const glowRef = useRef(null);
  const sectionsRef = useRef([]);
  const cardRef = useRef(null);

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
                <div key={i} className="group p-7 rounded-3xl border border-brun/10 bg-white/40 hover:bg-white/60 hover:border-or/30 hover:shadow-lg transition-all duration-500">
                  <div className="aspect-video mb-5 rounded-2xl overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-noir mb-2">{s.title}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
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
                <div key={i} className="group p-7 rounded-3xl border border-brun/10 bg-white/40 hover:bg-white/60 hover:border-or/30 hover:shadow-lg transition-all duration-500">
                  <div className="aspect-video mb-5 rounded-2xl overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-noir mb-2">{s.title}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
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
                <div key={i} className="group relative p-8 rounded-3xl overflow-hidden border border-brun/10 bg-white/40 hover:border-or/40 hover:shadow-xl transition-all duration-700">
                  <span className="absolute top-4 right-5 text-[9px] uppercase tracking-[0.35em] text-or/50 font-bold z-10">{item.tag}</span>
                  <div className="aspect-video mb-5 rounded-2xl overflow-hidden relative z-10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="font-playfair text-2xl font-black text-noir mb-4 relative z-10">{item.name}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed relative z-10">{item.desc}</p>
                </div>
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
              {[
                { title: 'Masques contemporains', desc: 'Bois sculpté, métal repoussé ou techniques mixtes.', image: '/Le Sentinelle.png' },
                { title: 'Tableaux & bas-reliefs', desc: 'Motifs vévés peints sur bois, fer ou toile.', image: '/Mobilier Résidentiel.png' },
                { title: 'Sculptures Bocio', desc: 'Figurines contemporaines — œuvre de création originale.', image: '/Mobilier Résidentiel.png' },
                { title: 'Textiles muraux', desc: 'Tapisseries, tentures, macramés en fibres naturelles locales.', image: '/Le Rideau Patrimoine.png' },
                { title: 'Miroirs encadrés', desc: 'Cadres bois sculptés ou métal avec motifs symboliques.', image: '/Mobilier Résidentiel.png' }
              ].map((s, i) => (
                <div key={i} className="group p-7 rounded-3xl border border-brun/10 bg-white/40 hover:bg-white/60 hover:border-or/30 hover:shadow-lg transition-all duration-500">
                  <div className="aspect-video mb-5 rounded-2xl overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-noir mb-2">{s.title}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
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
              {[
                { title: 'Suspension métal perforé', desc: 'Projette des ombres de vévés, ambiance unique et mémorable.', image: '/Led.png' },
                { title: 'Lampe raphia tressé', desc: 'Abat-jour en fibres naturelles, lumière tamisée chaude.', image: '/Lanternes Cérémonielles.png' },
                { title: 'Lanterne bronze', desc: 'Motifs géométriques découpés au laser, édition artisanale.', image: '/Lanternes Cérémonielles.png' },
                { title: 'Bougeoir sculpté bois', desc: 'Bois massif béninois, formes symboliques ciselées.', image: '/Le Sentinelle.png' }
              ].map((s, i) => (
                <div key={i} className="group p-7 rounded-3xl border border-brun/10 bg-white/40 hover:bg-white/60 hover:border-or/30 hover:shadow-lg transition-all duration-500">
                  <div className="aspect-video mb-5 rounded-2xl overflow-hidden">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-noir mb-2">{s.title}</h3>
                  <p className="text-brun/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
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
                "Seule marque ancrée à Ouidah, berceau du Vodun, nous créons des espaces habités — du mobilier à l'installation lumineuse monumentale."
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
    </div>
  );
}