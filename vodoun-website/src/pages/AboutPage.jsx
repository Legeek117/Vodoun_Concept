import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  { label: 'Création', text: 'Pièces et collections inspirées de la cosmologie Vodun avec exigence artisanale.' },
  { label: 'Transmission', text: 'Valoriser les savoir-faire béninois. Intégrer les artisans dignement.' },
  { label: 'Rayonnement', text: 'Faire de Ouidah la capitale mondiale du design inspiré du Vodun.' },
  { label: 'Accessibilité', text: 'Permettre à chacun de commander, recevoir et porter l\'identité Vodun.' },
];

const VALUES = [
  { title: 'Authenticité', desc: 'Ancré dans une tradition et une spiritualité vivante.' },
  { title: 'Excellence', desc: 'Beau, solide, durable.' },
  { title: 'Respect', desc: 'Le Vodun est vivant. Toute création le respecte.' },
  { title: 'Fluidité', desc: 'L\'expérience client est aussi soignée que le produit.' },
  { title: 'Rayonnement', desc: 'Chaque vente exporte la beauté béninoise dans le monde.' },
];

const POLES = [
  { name: 'Ouidah', sub: 'Showroom', desc: 'Siège · Exposition · Accueil touristes · Événements culturels', icon: '⬡' },
  { name: 'Cotonou', sub: 'Hub Stock', desc: 'Ateliers · Production · Logistique · Expéditions mondiales', icon: '◈' },
  { name: 'E-commerce', sub: 'Global', desc: 'Commandes 24h/24 · Livraison mondiale · Configurateurs', icon: '◆' },
  { name: 'Événementiel', sub: 'Présence', desc: 'Vodun Days · FInAB · Festival des Masques · MASA', icon: '✦' },
];

const EVENTS = [
  { month: 'Janvier', name: 'Vodun Days', lieu: 'Ouidah', desc: 'Toutes gammes · Vitrine d\'excellence' },
  { month: 'Fév / Mars', name: 'FInAB + Fashion Week', lieu: 'Cotonou', desc: 'Mode & Accessoires' },
  { month: '25–26 Juil.', name: 'Festival des Masques', lieu: 'Porto-Novo', desc: 'Décoration & Mobilier' },
  { month: 'Décembre', name: 'WeLovEya Festival', lieu: 'Cotonou', desc: 'Mode & Lifestyle' },
];

export default function AboutPage() {
  const sectionsRef = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    sectionsRef.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll('.reveal'),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );
    });
  }, []);

  const addSection = (i) => (el) => { sectionsRef.current[i] = el; };

  return (
    <div className="min-h-screen bg-ivoire">

      {/* ── HERO ── */}
      <section ref={addSection(0)} className="pt-32 pb-20 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label reveal block mb-3">La Marque</span>
          <h1 className="editorial-heading text-noir !text-[clamp(2.5rem,8vw,5.5rem)] max-w-5xl reveal leading-none mb-10">
            Là où le sacré devient désirable.
          </h1>
          <p className="editorial-body text-brun/70 max-w-2xl reveal text-lg md:text-xl font-playfair leading-relaxed">
            Vodun Concept Store est née à Ouidah, au Bénin, berceau spirituel du Vodun. Notre mission : valoriser la richesse symbolique de cette tradition millénaire en créations contemporaines, conçues au Bénin, pour le monde.
          </p>
        </div>
      </section>

      {/* ── VISION FONDATRICE (4 PILIERS) ── */}
      <section ref={addSection(1)} className="py-24 bg-noir text-ivoire">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or reveal block mb-3">Vision</span>
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">Vision Fondatrice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PILLARS.map((p, i) => (
              <div key={i} className="reveal group p-8 rounded-3xl border border-white/5 hover:border-or/30 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500">
                <h3 className="font-playfair text-2xl font-black text-or mb-4">{p.label}</h3>
                <p className="text-ivoire/60 text-sm leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALEURS (5 officielles) ── */}
      <section ref={addSection(2)} className="py-24 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label reveal block mb-3">Identité</span>
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">Nos Valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="reveal group p-7 rounded-3xl border border-brun/10 bg-white/40 hover:border-or/40 hover:bg-white/60 hover:shadow-lg transition-all duration-500">
                <div className="w-8 h-8 rounded-full border border-or/30 flex items-center justify-center text-or text-xs mb-5 group-hover:bg-or group-hover:text-ivoire transition-all duration-500">✦</div>
                <h3 className="font-playfair text-xl font-black text-noir mb-3">{v.title}</h3>
                <p className="text-brun/60 text-sm leading-relaxed italic">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSITIONNEMENT STRATÉGIQUE ── */}
      <section ref={addSection(3)} className="py-24 bg-noir text-ivoire border-b border-white/5">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or reveal block mb-3">Marché</span>
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">Positionnement</h2>
          <p className="text-or/70 font-playfair text-xl italic mb-16 reveal">« Premium accessible · Artisanal contemporain · Livré partout »</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Légitimité unique', desc: 'Seule marque ancrée à Ouidah, berceau du Vodun.' },
              { title: 'Modèle intégré', desc: 'Création · Exposition · Stock · E-commerce · Événements.' },
              { title: 'Gamme complète', desc: 'De 1 500 FCFA (accessoires) à 2,5 M FCFA (mobilier d\'exception).' },
              { title: 'Accessibilité mondiale', desc: 'Livraison Bénin, Afrique de l\'Ouest et diaspora internationale.' },
            ].map((item, i) => (
              <div key={i} className="reveal p-7 rounded-3xl border border-white/8 bg-white/[0.04] hover:border-or/30 hover:bg-white/[0.07] transition-all duration-500">
                <div className="text-or text-2xl mb-4">◆</div>
                <h3 className="font-playfair text-xl font-bold text-ivoire mb-3">{item.title}</h3>
                <p className="text-ivoire/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOUTIQUE DIGITALE ── */}
      <section ref={addSection(7)} className="py-24 bg-white/20 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label reveal block mb-3">E-commerce</span>
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">Boutique Digitale</h2>
          <p className="text-or font-playfair text-xl italic mb-12 reveal">« Le Vodun accessible partout dans le monde »</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal space-y-6">
              <p className="text-brun/80 text-lg md:text-xl leading-relaxed font-playfair">
                Vodun Concept Store est avant tout une plateforme digitale pensée pour faire rayonner l’esthétique et l’artisanat inspiré de la spiritualité Vodun au-delà des frontières du Bénin.
              </p>
              <p className="text-brun/70 leading-relaxed text-sm">
                Notre showroom physique à Ouidah représente l’âme de la marque, mais le cœur du modèle repose sur une expérience e-commerce. Grâce à notre boutique en ligne, chaque client peut commander en toute sérénité.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 reveal">
              {[
                { title: "Univers multiples", desc: "Découvrir les collections mobilier, mode, décoration et accessoires." },
                { title: "Personnalisation", desc: "Personnaliser certains produits selon la symbolique des divinités." },
                { title: "Livraison globale", desc: "Commander depuis n’importe quel pays, avec suivi en temps réel." },
                { title: "Paiement flexible", desc: "Paiement via Mobile Money ou carte internationale. Prix affichés en FCFA, USD ou EUR." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-brun/10 bg-white/40 hover:border-or/40 transition-colors">
                  <div className="font-playfair font-bold text-noir mb-2">{item.title}</div>
                  <p className="text-brun/60 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE 4 PÔLES ── */}
      <section ref={addSection(4)} className="py-24 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label reveal block mb-3">Géographie</span>
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">Architecture à 4 Pôles</h2>
          <p className="text-brun/50 text-sm uppercase tracking-widest mb-16 reveal">Du showroom d'Ouidah à la livraison mondiale</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POLES.map((pole, i) => (
              <div key={i} className="reveal group p-8 rounded-3xl border border-brun/10 bg-white/40 hover:border-or/40 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-4 right-5 text-or/10 text-5xl pointer-events-none group-hover:text-or/20 transition-colors duration-500">{pole.icon}</div>
                <div className="text-[9px] uppercase tracking-[0.4em] text-or/50 mb-2 font-bold">{pole.sub}</div>
                <h3 className="font-playfair text-2xl font-black text-noir mb-3">{pole.name}</h3>
                <p className="text-brun/60 text-sm leading-relaxed">{pole.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALENDRIER ÉVÉNEMENTIEL ── */}
      <section ref={addSection(5)} className="py-24 bg-noir text-ivoire">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or reveal block mb-3">Événementiel</span>
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">Nos Rendez-vous</h2>
          <div className="space-y-0 border-t border-white/5">
            {EVENTS.map((event, i) => (
              <div key={i} className="reveal group flex flex-col sm:flex-row items-start sm:items-center gap-4 py-8 border-b border-white/5 hover:bg-white/[0.03] px-4 -mx-4 rounded-xl transition-all duration-300">
                <span className="text-[10px] uppercase tracking-[0.4em] text-or/50 font-bold w-28 flex-shrink-0">{event.month}</span>
                <div className="flex-grow">
                  <h3 className="font-playfair text-xl md:text-2xl font-black text-ivoire group-hover:text-or transition-colors duration-300">{event.name}</h3>
                  <p className="text-ivoire/40 text-xs uppercase tracking-widest mt-1">{event.lieu} · {event.desc}</p>
                </div>
                <span className="text-or/30 group-hover:text-or transition-colors duration-300 text-2xl">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTISANS ── */}
      <section ref={addSection(6)} className="py-24 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label reveal block mb-3">Équipe</span>
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">Nos Artisans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Kossi A.', role: 'Sculpteur Bois', desc: '25 ans d\'expérience dans la sculpture traditionnelle béninoise. Bois massif, pyrogravure et incrustations métal.' },
              { name: 'Akouvi M.', role: 'Tisserande', desc: 'Maître tisserande spécialisée dans les motifs géométriques Vodun. Textiles muraux, tapisseries et tentures en fibres naturelles.' },
              { name: 'Mensah T.', role: 'Forgeron', desc: 'Expert dans le travail du métal et la création de pièces lumineuses. Lanternes, luminaires perforés et sculptures Bocio.' },
            ].map((a, i) => (
              <div key={i} className="reveal group">
                <div className="aspect-square rounded-3xl overflow-hidden mb-6 border border-brun/10 group-hover:border-or/30 transition-colors duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.08), rgba(74,49,32,0.05))' }}>
                  <div className="w-full h-full flex items-center justify-center text-or/20 text-7xl group-hover:scale-110 transition-transform duration-700">✦</div>
                </div>
                <h3 className="font-playfair text-2xl font-bold text-noir mb-1">{a.name}</h3>
                <p className="text-or text-[10px] uppercase tracking-[0.35em] font-bold mb-4">{a.role}</p>
                <p className="text-brun/60 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}