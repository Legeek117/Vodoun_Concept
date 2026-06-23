import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Hero from './components/Hero';
import Section from './components/Section';
import ProductCard from './components/ProductCard';
import { ALL_PRODUCTS } from './store';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Background color transitions
    const sections = document.querySelectorAll('[data-bg-color]');
    sections.forEach((section) => {
      const bgColor = section.getAttribute('data-bg-color');
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => gsap.to('body', { backgroundColor: bgColor, duration: 1.5, ease: 'power2.out' }),
        onEnterBack: () => gsap.to('body', { backgroundColor: bgColor, duration: 1.5, ease: 'power2.out' }),
      });
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const decorationsFestives = ALL_PRODUCTS
    .filter(p => p.category === 'Décorations Festives')
    .slice(0, 4)
    .map((p, index) => ({
      ...p,
      category: `0${index + 1} / Décorations Festives`,
      price: `À partir de ${p.price.toLocaleString('fr-FR')} FCFA`
    }));

  const mode = ALL_PRODUCTS
    .filter(p => p.category === 'Mode')
    .slice(0, 4)
    .map((p, index) => ({
      ...p,
      category: `0${index + 1} / Mode`,
      price: `${p.price.toLocaleString('fr-FR')} FCFA`
    }));

  const mobilier = ALL_PRODUCTS
    .filter(p => p.category === 'Mobilier')
    .slice(0, 4)
    .map((p, index) => ({
      ...p,
      category: `0${index + 1} / Mobilier`,
      price: `À partir de ${p.price.toLocaleString('fr-FR')} FCFA`
    }));

  const divinities = [
    {
      name: 'DAN',
      title: 'Le Serpent',
      color: '#1C4A66',
      description: 'Spirales · Indigo · Turquoise',
    },
    {
      name: 'LEGBA',
      title: 'Le Gardien',
      color: '#8E2420',
      description: 'Croisements · Rouge · Noir',
    },
    {
      name: 'SAKPATA',
      title: 'La Terre',
      color: '#20603C',
      description: 'Formes organiques · Brun · Vert',
    },
    {
      name: 'MAMI WATA',
      title: 'L’Eau',
      color: '#4A1942',
      description: 'Courbes · Violet · Or nacré',
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <Hero />

      {/* Marquee separator */}
      <div className="bg-or py-10 overflow-hidden border-y border-noir/20 flex">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex} className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="text-noir font-playfair text-[8vw] font-black mx-16 uppercase tracking-tighter"
                >
                  LÀ OÙ LE SACRÉ DEVIENT DÉSIRABLE ✦
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Décorations Festives Section */}
      <Section id="decorations" data-bg-color="#1A1410" align="left">
        <span className="section-label">01 / Univers</span>
        <h2 className="editorial-heading text-ivoire mb-8">Décorations<br />Festives</h2>
        <p className="editorial-body text-ivoire/70 mb-16">
          Des installations lumineuses monumentales qui transforment l'espace en théâtre de lumière sacrée.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-16">
          {decorationsFestives.map((product, index) => (
            <ProductCard key={index} product={product} index={index} isDark={true} />
          ))}
        </div>
      </Section>

      {/* Mode Section */}
      <Section id="mode" data-bg-color="#F4F0E6" align="right">
        <span className="section-label">02 / Univers</span>
        <h2 className="editorial-heading mb-8">La Mode<br />du Sacré</h2>
        <p className="editorial-body mb-16">
          Porter le symbole. Chaque t-shirt est une toile, chaque chapeau une couronne.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-16">
          {mode.map((product, index) => (
            <ProductCard key={index} product={product} index={index} />
          ))}
        </div>
      </Section>

      {/* Mobilier Section */}
      <Section id="mobilier" data-bg-color="#1A1410" align="left">
        <span className="section-label">03 / Univers</span>
        <h2 className="editorial-heading text-ivoire mb-8">Le Mobilier<br />de Prestige</h2>
        <p className="editorial-body text-ivoire/70 mb-16">
          Des pièces uniques sculptées dans le bois massif, alliant prestige royal et confort contemporain.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-16">
          {mobilier.map((product, index) => (
            <ProductCard key={index} product={product} index={index} isDark={true} />
          ))}
        </div>
      </Section>

      {/* Panthéon Vodun Section */}
      <div id="pantheon" data-bg-color="#1A1410" className="py-32">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="mb-20">
            <span className="section-label">04 / Héritage</span>
            <h2 className="editorial-heading text-ivoire">Le Panthéon</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {divinities.map((deity, index) => (
              <div
                key={index}
                className="relative aspect-[3/5] overflow-hidden group cursor-pointer border-r border-t border-ivoire/10"
                style={{ backgroundColor: deity.color }}
              >
                <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/0 transition-all duration-700" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-10">
                  <div className="transform translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                    <span className="text-[0.45rem] md:text-[0.6rem] uppercase tracking-[0.2em] md:tracking-[0.4em] text-ivoire/70 block mb-2 md:mb-4">
                      {deity.title}
                    </span>
                    <h3 className="font-playfair text-2xl md:text-5xl font-black text-ivoire mb-3 md:mb-6">{deity.name}</h3>
                    <p className="text-ivoire/80 text-xs md:text-sm mb-4 md:mb-8">{deity.description}</p>
                    <div className="w-0 h-[1px] bg-or group-hover:w-full transition-all duration-1000 ease-out" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer data-bg-color="#1A1410" className="bg-noir text-ivoire pt-20 md:pt-32 pb-8 md:pb-16 border-t border-ivoire/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-24">
            <div>
              <h2 className="font-playfair text-xl md:text-3xl font-black text-or mb-4 md:mb-8 tracking-tighter">
                VODUN<br />CONCEPT STORE
              </h2>
              <p className="text-ivoire/80 text-sm md:text-xl leading-relaxed mb-4 md:mb-10">
                Ouidah, Bénin
              </p>
              <p className="text-ivoire/60 text-sm md:text-xl leading-relaxed">
                Là où le sacré devient désirable.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-12">
              <div>
                <h4 className="section-label mb-4 md:mb-8 text-ivoire/100 text-[0.55rem] md:text-[0.7rem]">Menu</h4>
                <ul className="space-y-2 md:space-y-4">
                  <li><Link to="/boutique" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Boutique</Link></li>
                  <li><Link to="/a-propos" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Héritage</Link></li>
                  <li><Link to="/pantheon" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Panthéon</Link></li>
                  <li><Link to="/projets-pro" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Projets Pro</Link></li>
                  <li><Link to="/contact" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Contact</Link></li>
                  <li><Link to="/compte" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Mon Compte</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="section-label mb-4 md:mb-8 text-[0.55rem] md:text-[0.7rem]">Réseaux</h4>
                <ul className="space-y-2 md:space-y-4">
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Instagram</li>
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Facebook</li>
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">LinkedIn</li>
                </ul>
                <div className="mt-6 md:mt-10">
                  <h4 className="section-label mb-4 md:mb-8 text-[0.55rem] md:text-[0.7rem]">Contact</h4>
                  <p className="text-ivoire text-sm md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em]">contact@vodoun-concept.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 md:pt-12 border-t border-ivoire/20 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
            <p className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em]">
              © 2025 Vodoun Concept Store · Ouidah · Bénin
            </p>
            <div className="flex gap-4 md:gap-8">
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                Mentions Légales
              </span>
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                CGV
              </span>
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                Politique de Confidentialité
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
