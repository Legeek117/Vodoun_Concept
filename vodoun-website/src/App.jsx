import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProceduralCanvas from './components/ProceduralCanvas';
import { ALL_PRODUCTS } from './store';
import usePageMeta from './hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef    = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  usePageMeta({
    title: 'Accueil',
    description: 'Vodoun Concept Store — mobilier d\'art, bijoux, décorations festives et mode inspirés de la culture Vodoun. Artisanat béninois d\'exception à Ouidah, Bénin.',
  });

  // Lenis smooth scroll
  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      normalizeWheel: false,
    });
    window.lenis = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.scrollTo(0, { immediate: true });
    }, 500);

    return () => {
      lenis.destroy();
      delete window.lenis;
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // ScrollTrigger → scrollProgress 0→1 pour ProceduralCanvas
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#immersive-zone',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => setScrollProgress(self.progress),
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, []);

  const universProducts = {
    decorations: ALL_PRODUCTS.filter(p => p.category === 'Décorations Festives').slice(0, 2),
    mode:        ALL_PRODUCTS.filter(p => p.category === 'Mode').slice(0, 2),
    mobilier:    ALL_PRODUCTS.filter(p => p.category === 'Mobilier').slice(0, 2),
  };

  const divinities = [
    { name: 'DAN',      title: 'Le Serpent', color: '#1C4A66', image: '/Divinités/DAN (1).webp',   description: 'Spirales · Indigo · Turquoise' },
    { name: 'LEGBA',    title: 'Le Gardien', color: '#8E2420', image: '/Divinités/LEGBA.webp',       description: 'Croisements · Rouge · Noir' },
    { name: 'SAKPATA',  title: 'La Terre',   color: '#20603C', image: '/Divinités/sakpata.webp',     description: 'Formes organiques · Brun · Vert' },
    { name: 'OGOU',     title: 'Le Fer',     color: '#8B0000', image: '/Divinités/OGU2.webp',        description: 'Angles · Rouge sang · Or' },
    { name: 'MAMI WATA',title: "L'Eau",      color: '#4A1942', image: '/Divinités/mami wata.webp',   description: 'Courbes · Violet · Or nacré' },
    { name: 'XEVIOSO',  title: 'La Foudre',  color: '#B8860B', image: '/Divinités/xeviosso.webp',    description: 'Éclairs · Blanc · Noir' },
  ];

  return (
    <div ref={containerRef} className="relative bg-noir">
      <Hero />

      {/* Zone immersive scrollable */}
      <div id="immersive-zone" className="relative">

        {/* Canvas procédural en fond sticky */}
        <div className="sticky top-0 h-screen w-full overflow-hidden z-0 pointer-events-none">
          <ProceduralCanvas
            scrollProgress={scrollProgress}
            className="w-full h-full"
            style={{ filter: 'brightness(1.1) contrast(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/40 via-transparent to-noir/60 opacity-80" />
        </div>

        {/* Contenu par-dessus */}
        <div className="relative z-10 -mt-[100vh]">

          {/* Marquee */}
          <div className="bg-or/90 backdrop-blur-md py-8 md:py-12 overflow-hidden border-y border-noir/20 flex relative z-20">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="text-ivoire font-playfair text-[6vw] md:text-[5vw] font-black mx-12 uppercase tracking-tighter">
                      LÀ OÙ LE SACRÉ DEVIENT DÉSIRABLE ✦
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Section 1 : Collections */}
          <section className="py-24 md:py-40 px-[5vw]">
            <div className="max-w-7xl mx-auto">
              <span className="section-label text-or mb-6 block">L'Univers</span>
              <h2 className="editorial-heading text-ivoire mb-16 !text-[clamp(2.5rem,8vw,6rem)]">Les Collections</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                <div className="flex flex-col gap-6 md:gap-8">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Festivités &amp; Rituels</div>
                  {universProducts.decorations.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                <div className="flex flex-col gap-6 md:gap-8 md:pt-24">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Parures du Quotidien</div>
                  {universProducts.mode.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                <div className="flex flex-col gap-6 md:gap-8 md:pt-48 col-span-2 md:col-span-1">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Demeures Sacrées</div>
                  {universProducts.mobilier.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 : Héritage */}
          <section className="py-32 md:py-60 px-[5vw] bg-noir/40 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto text-center">
              <span className="section-label text-or mb-8 block">L'Héritage</span>
              <h2 className="editorial-heading text-ivoire mb-12 !text-[clamp(2rem,6vw,4rem)]">Né du souffle de Ouidah</h2>
              <p className="text-ivoire/70 text-lg md:text-2xl font-playfair leading-relaxed">
                Plus qu'un store, Vodun Concept est un pont entre les mondes. Chaque pièce porte en elle l'énergie d'un savoir-faire ancestral, magnifié par un design contemporain d'exception.
              </p>
              <div className="mt-16">
                <Link to="/boutique" className="btn-premium px-12 py-5">Explorer l'intégralité</Link>
              </div>
            </div>
          </section>

          {/* Section 3 : Panthéon */}
          <div id="pantheon" className="py-16 md:py-24 lg:py-52 relative z-10">
            <div className="max-w-7xl mx-auto px-[5vw]">
              <div className="mb-12 md:mb-20">
                <span className="section-label text-or mb-4 block">Panthéon</span>
                <h2 className="editorial-heading text-ivoire !text-[clamp(2.5rem,8vw,5rem)]">Les Puissances</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-l border-b border-ivoire/10">
                {divinities.map((deity, index) => (
                  <Link key={index} to="/pantheon"
                    className="relative aspect-[3/5] overflow-hidden group cursor-pointer border-r border-t border-ivoire/10"
                    style={{ backgroundColor: deity.color + 'CC' }}>
                    {deity.image && (
                      <img src={deity.image} alt={deity.name} loading="lazy" decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 opacity-80" />
                    )}
                    <div className="absolute inset-0 mix-blend-multiply opacity-50" style={{ backgroundColor: deity.color }} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                      style={{ background: `radial-gradient(circle at center, ${deity.color}80 0%, transparent 70%)`, boxShadow: `inset 0 0 60px ${deity.color}40` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8">
                      <div className="transform translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                        <span className="text-[0.45rem] md:text-[0.6rem] uppercase tracking-[0.2em] md:tracking-[0.3em] text-ivoire/70 block mb-1 md:mb-2">{deity.title}</span>
                        <h3 className="text-ivoire font-playfair text-xl md:text-2xl lg:text-3xl font-black drop-shadow-lg">{deity.name}</h3>
                        <p className="text-ivoire/70 text-xs mt-2 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">{deity.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
