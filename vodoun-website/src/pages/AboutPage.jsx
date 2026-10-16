import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import usePageMeta from '../hooks/usePageMeta';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';

gsap.registerPlugin(ScrollTrigger);

const PILLARS_FR = [
  { label: 'Création', text: 'Pièces et collections inspirées de la cosmologie Vodun avec exigence artisanale.' },
  { label: 'Transmission', text: 'Valoriser les savoir-faire béninois. Intégrer les artisans dignement.' },
  { label: 'Rayonnement', text: 'Faire de Ouidah la capitale mondiale du design inspiré du Vodun.' },
  { label: 'Accessibilité', text: 'Permettre à chacun de commander, recevoir et porter l\'identité Vodun.' },
];
const PILLARS_EN = [
  { label: 'Creation', text: 'Pieces and collections inspired by Vodun cosmology with artisanal rigor.' },
  { label: 'Transmission', text: 'Elevating Beninese know-how. Integrating artisans with dignity.' },
  { label: 'Reach', text: 'Making Ouidah the world capital of Vodun-inspired design.' },
  { label: 'Accessibility', text: 'Allowing everyone to order, receive and wear the Vodun identity.' },
];

const VALUES_FR = [
  { title: 'Authenticité', desc: 'Ancré dans une tradition et une spiritualité vivante.' },
  { title: 'Excellence', desc: 'Beau, solide, durable.' },
  { title: 'Respect', desc: 'Le Vodun est vivant. Toute création le respecte.' },
  { title: 'Fluidité', desc: 'L\'expérience client est aussi soignée que le produit.' },
  { title: 'Rayonnement', desc: 'Chaque vente exporte la beauté béninoise dans le monde.' },
];
const VALUES_EN = [
  { title: 'Authenticity', desc: 'Rooted in a living tradition and spirituality.' },
  { title: 'Excellence', desc: 'Beautiful, solid, lasting.' },
  { title: 'Respect', desc: 'Vodun is alive. Every creation honors it.' },
  { title: 'Fluidity', desc: 'The client experience is as refined as the product.' },
  { title: 'Reach', desc: 'Every sale exports Beninese beauty to the world.' },
];

const POLES_FR = [
  { name: 'Ouidah', sub: 'Showroom', desc: 'Siège · Exposition · Accueil touristes · Événements culturels', icon: '⬡' },
  { name: 'Cotonou', sub: 'Hub Stock', desc: 'Ateliers · Production · Logistique · Expéditions mondiales', icon: '◈' },
  { name: 'E-commerce', sub: 'Global', desc: 'Commandes 24h/24 · Livraison mondiale · Configurateurs', icon: '◆' },
  { name: 'Événementiel', sub: 'Présence', desc: 'Vodun Days · FInAB · Festival des Masques · MASA', icon: '✦' },
];
const POLES_EN = [
  { name: 'Ouidah', sub: 'Showroom', desc: 'HQ · Exhibition · Tourist reception · Cultural events', icon: '⬡' },
  { name: 'Cotonou', sub: 'Stock Hub', desc: 'Workshops · Production · Logistics · Global shipments', icon: '◈' },
  { name: 'E-commerce', sub: 'Global', desc: 'Orders 24/7 · Worldwide delivery · Configurators', icon: '◆' },
  { name: 'Events', sub: 'Presence', desc: 'Vodun Days · FInAB · Festival of Masks · MASA', icon: '✦' },
];

const EVENTS_FR = [
  { month: 'Janvier', name: 'Vodun Days', lieu: 'Ouidah', desc: 'Toutes gammes · Vitrine d\'excellence' },
  { month: 'Fév / Mars', name: 'FInAB + Fashion Week', lieu: 'Cotonou', desc: 'Mode & Accessoires' },
  { month: '25–26 Juil.', name: 'Festival des Masques', lieu: 'Porto-Novo', desc: 'Décoration & Mobilier' },
  { month: 'Avril', name: 'Le MASA', lieu: 'Abidjan', desc: 'Spectacle & Exposition' },
];
const EVENTS_EN = [
  { month: 'January', name: 'Vodun Days', lieu: 'Ouidah', desc: 'All ranges · Excellence showcase' },
  { month: 'Feb / Mar', name: 'FInAB + Fashion Week', lieu: 'Cotonou', desc: 'Fashion & Accessories' },
  { month: 'Jul 25–26', name: 'Festival of Masks', lieu: 'Porto-Novo', desc: 'Decoration & Furniture' },
  { month: 'April', name: 'MASA', lieu: 'Abidjan', desc: 'Performance & Exhibition' },
];

const POSITIONING_FR = [
  { title: 'Légitimité unique', desc: 'Meilleure marque ancrée à Ouidah, berceau du Vodun.' },
  { title: 'Modèle intégré', desc: 'Création · Exposition · Stock · E-commerce · Événements.' },
  { title: 'Gamme complète', desc: 'De 1 500 FCFA (accessoires) à 2,5 M FCFA (mobilier d\'exception).' },
  { title: 'Accessibilité mondiale', desc: 'Livraison Bénin, Afrique de l\'Ouest et diaspora internationale.' },
];
const POSITIONING_EN = [
  { title: 'Unique legitimacy', desc: 'The finest brand rooted in Ouidah, cradle of Vodun.' },
  { title: 'Integrated model', desc: 'Creation · Exhibition · Stock · E-commerce · Events.' },
  { title: 'Full range', desc: 'From 1,500 FCFA (accessories) to 2.5M FCFA (exceptional furniture).' },
  { title: 'Global accessibility', desc: 'Delivery across Benin, West Africa and the international diaspora.' },
];

const DIGITAL_FR = [
  { title: "Univers multiples", desc: "Découvrir les collections mobilier, mode, décoration et accessoires." },
  { title: "Personnalisation", desc: "Personnaliser certains produits selon la symbolique des divinités." },
  { title: "Livraison globale", desc: "Commander depuis n'importe quel pays, avec suivi en temps réel." },
  { title: "Paiement flexible", desc: "Paiement via Mobile Money ou carte internationale. Prix affichés en FCFA, USD ou EUR." }
];
const DIGITAL_EN = [
  { title: "Multiple universes", desc: "Discover furniture, fashion, decoration and accessories collections." },
  { title: "Customization", desc: "Personalize certain products according to deity symbolism." },
  { title: "Global delivery", desc: "Order from any country, with real-time tracking." },
  { title: "Flexible payment", desc: "Payment via Mobile Money or international card. Prices shown in FCFA, USD or EUR." }
];

export default function AboutPage() {
  const sectionsRef = useRef([]);
  const { lang } = useLanguage();
  const t = lang === 'fr' ? fr : en;

  const PILLARS    = lang === 'fr' ? PILLARS_FR    : PILLARS_EN;
  const VALUES     = lang === 'fr' ? VALUES_FR     : VALUES_EN;
  const POLES      = lang === 'fr' ? POLES_FR      : POLES_EN;
  const EVENTS     = lang === 'fr' ? EVENTS_FR     : EVENTS_EN;
  const POSITIONING = lang === 'fr' ? POSITIONING_FR : POSITIONING_EN;
  const DIGITAL    = lang === 'fr' ? DIGITAL_FR    : DIGITAL_EN;

  usePageMeta({
    title: lang === 'fr' ? 'À propos · Vodun Concept Store' : 'About · Vodun Concept Store',
    description: lang === 'fr'
      ? 'Découvrez Vodun Concept Store, la première marque créée à Ouidah qui transforme la spiritualité Vodun en design contemporain. Artisanat béninois d\'excellence.'
      : 'Discover Vodun Concept Store, the first brand created in Ouidah that transforms Vodun spirituality into contemporary design. Excellence in Beninese craftsmanship.',
  });

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
          <div className="reveal mb-8">
            <img src="/logo_vodoun.webp" alt="Vodun Concept Store"
              style={{ height: 'clamp(88px, 14vw, 160px)', width: 'auto', objectFit: 'contain' }} />
          </div>
          <h1 className="editorial-heading text-noir !text-[clamp(2.5rem,8vw,5.5rem)] max-w-5xl reveal leading-none mb-10">
            {t.about.heroTitle}
          </h1>
          <p className="editorial-body text-brun/70 max-w-2xl reveal text-lg md:text-xl font-playfair leading-relaxed">
            {t.about.heroText}
          </p>
        </div>
      </section>

      {/* ── VISION FONDATRICE (4 PILIERS) ── */}
      <section ref={addSection(1)} className="py-24 bg-noir text-ivoire">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">{t.about.visionTitle}</h2>
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

      {/* ── VALEURS ── */}
      <section ref={addSection(2)} className="py-24 border-b border-brun/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">{t.about.valuesTitle}</h2>
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
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">{t.about.positioningTitle}</h2>
          <p className="text-or/70 font-playfair text-xl italic mb-16 reveal">{t.about.positioningQuote}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {POSITIONING.map((item, i) => (
              <div key={i} className="reveal p-7 rounded-3xl border border-white/8 bg-white/[0.04] hover:border-or/30 hover:bg-white/[0.07] transition-all duration-500">
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
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">{t.about.digitalTitle}</h2>
          <p className="text-or font-playfair text-xl italic mb-12 reveal">{t.about.digitalQuote}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="reveal space-y-6">
              <p className="text-brun/80 text-lg md:text-xl leading-relaxed font-playfair">
                {t.about.digitalText1}
              </p>
              <p className="text-brun/70 leading-relaxed text-sm">
                {t.about.digitalText2}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 reveal">
              {DIGITAL.map((item, i) => (
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
          <h2 className="editorial-heading text-noir !text-[clamp(2rem,6vw,4rem)] mb-4 reveal">{t.about.architectureTitle}</h2>
          <p className="text-brun/50 text-sm uppercase tracking-widest mb-16 reveal">{t.about.architectureSub}</p>
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
          <h2 className="editorial-heading text-ivoire !text-[clamp(2rem,6vw,4rem)] mb-16 reveal">{t.about.eventsTitle}</h2>
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

    </div>
  );
}
