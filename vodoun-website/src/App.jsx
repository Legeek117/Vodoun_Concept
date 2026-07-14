import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import { ALL_PRODUCTS, COLLECTIONS } from './store';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 470;

function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // Preload frames for global home scroll
  useEffect(() => {
    const frames = [];

    const loadFrame = (index) => {
      return new Promise((resolve) => {
        if (frames[index]) { resolve(); return; }
        const img = new Image();
        const frameIndex = (index + 1).toString().padStart(4, '0');
        img.onload = () => {
          frames[index] = img;
          framesRef.current = frames;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = `/frames/coris/frame_${frameIndex}.jpg`;
      });
    };

    loadFrame(0).then(() => {
      framesRef.current = frames;
      setIsFirstFrameLoaded(true);

      // Charge en 3 phases de priorité :
      // P1 (critique) : toutes les frames 1-131 (sac + transition) en batch de 6
      // P2 (important) : frames 132-470 (coris) en batch de 6 à la suite
      const loadPhased = async () => {
        const BATCH = 6;
        // Phase prioritaire : frames sac + transition (déjà partiellement chargées)
        for (let i = 1; i < 132; i += BATCH) {
          const chunk = [];
          for (let j = i; j < Math.min(i + BATCH, 132); j++) chunk.push(loadFrame(j));
          await Promise.all(chunk);
        }
        // Phase secondaire : frames coris originales
        for (let i = 132; i < FRAME_COUNT; i += BATCH) {
          const chunk = [];
          for (let j = i; j < Math.min(i + BATCH, FRAME_COUNT); j++) chunk.push(loadFrame(j));
          await Promise.all(chunk);
        }
      };
      loadPhased();
    });
  }, []);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cherche la frame la plus proche disponible (vers l'arrière puis vers l'avant)
    let i = index;
    while (i >= 0 && !framesRef.current[i]) i--;
    if (i < 0) {
      // Rien derrière, cherche devant
      i = index + 1;
      while (i < FRAME_COUNT && !framesRef.current[i]) i++;
      if (i >= FRAME_COUNT) return; // Aucune frame disponible
    }

    const ctx = canvas.getContext('2d');
    const img = framesRef.current[i];
    const cw = window.innerWidth * window.devicePixelRatio;
    const ch = window.innerHeight * window.devicePixelRatio;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Resize : redessine la frame courante quand la fenêtre change de taille
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Force le recalcul des dimensions au prochain drawFrame
        canvas.width = 0;
        canvas.height = 0;
      }
      ScrollTrigger.refresh();
    };
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

  useEffect(() => {
    if (!isFirstFrameLoaded) return;
    drawFrame(0);

    const st = ScrollTrigger.create({
      trigger: "#immersive-zone",
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const targetIndex = Math.min(
          Math.floor(self.progress * (FRAME_COUNT - 1)),
          FRAME_COUNT - 1
        );

        // Si la frame exacte est disponible, on la dessine directement
        if (framesRef.current[targetIndex]) {
          requestAnimationFrame(() => drawFrame(targetIndex));
          return;
        }

        // Cherche dans un rayon de ±5 frames autour de la cible
        // Priorité aux frames AVANT (sens du scroll) pour éviter de revenir en arrière
        for (let k = 1; k <= 5; k++) {
          if (framesRef.current[targetIndex - k]) {
            requestAnimationFrame(() => drawFrame(targetIndex - k));
            return;
          }
          if (framesRef.current[targetIndex + k]) {
            requestAnimationFrame(() => drawFrame(targetIndex + k));
            return;
          }
        }
        // Si rien dans le rayon, ne rien faire — conserver la dernière frame affichée
      }
    });

    ScrollTrigger.refresh();

    return () => { st.kill(); };
  }, [isFirstFrameLoaded]);

  const universProducts = {
    decorations: ALL_PRODUCTS.filter(p => p.category === 'Décorations Festives').slice(0, 2),
    mode: ALL_PRODUCTS.filter(p => p.category === 'Mode').slice(0, 2),
    mobilier: ALL_PRODUCTS.filter(p => p.category === 'Mobilier').slice(0, 2),
  };

  const divinities = [
    { name: 'DAN', title: 'Le Serpent', color: '#1C4A66', image: '/Divinités/DAN (1).webp', description: 'Spirales · Indigo · Turquoise' },
    { name: 'LEGBA', title: 'Le Gardien', color: '#8E2420', image: '/Divinités/LEGBA.webp', description: 'Croisements · Rouge · Noir' },
    { name: 'SAKPATA', title: 'La Terre', color: '#20603C', image: '/Divinités/sakpata.webp', description: 'Formes organiques · Brun · Vert' },
    { name: 'OGOU', title: 'Le Fer', color: '#8B0000', image: '/Divinités/OGU2.webp', description: 'Angles · Rouge sang · Or' },
    { name: 'MAMI WATA', title: "L'Eau", color: '#4A1942', image: '/Divinités/mami wata.webp', description: 'Courbes · Violet · Or nacré' },
    { name: 'XEVIOSO', title: 'La Foudre', color: '#B8860B', image: '/Divinités/xeviosso.webp', description: 'Éclairs · Blanc · Noir' },
  ];

  return (
    <div ref={containerRef} className="relative bg-noir">
      <Hero />

      {/* 1. Global Immersive Zone (Includes marquee and all sections) */}
      <div id="immersive-zone" className="relative">

        {/* Sticky Background Player */}
        <div className="sticky top-0 h-screen w-full overflow-hidden z-0 pointer-events-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover opacity-90"
            style={{ filter: 'brightness(1.1) contrast(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/40 via-transparent to-noir/60 opacity-80" />
        </div>

        {/* Content Overlays */}
        <div className="relative z-10 -mt-[100vh]">

          {/* Marquee Separator */}
          <div className="bg-or/90 backdrop-blur-md py-8 md:py-12 overflow-hidden border-y border-noir/20 flex relative z-20">
            <div className="flex whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span key={i} className="text-noir font-playfair text-[6vw] md:text-[5vw] font-black mx-12 uppercase tracking-tighter">
                      LÀ OÙ LE SACRÉ DEVIENT DÉSIRABLE ✦
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Collections Grid (The "Comme Avant" structure) */}
          <section className="py-24 md:py-40 px-[5vw]">
            <div className="max-w-7xl mx-auto">
              <span className="section-label text-or mb-6 block">L'Univers</span>
              <h2 className="editorial-heading text-ivoire mb-16 !text-[clamp(2.5rem,8vw,6rem)]">Les Collections</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
                {/* 1. Décorations */}
                <div className="flex flex-col gap-6 md:gap-8">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Festivités & Rituels</div>
                  {universProducts.decorations.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                {/* 2. Mode */}
                <div className="flex flex-col gap-6 md:gap-8 md:pt-24">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Parures du Quotidien</div>
                  {universProducts.mode.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                {/* 3. Mobilier */}
                <div className="flex flex-col gap-6 md:gap-8 md:pt-48 col-span-2 md:col-span-1">
                  <div className="text-ivoire/80 font-playfair text-sm md:text-xl italic mb-4">Demeures Sacrées</div>
                  {universProducts.mobilier.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Heritage Intro (The "Comme Avant" text section) */}
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

          {/* Section 3: Panthéon (Now fully immersive) */}
          <div id="pantheon" className="py-16 md:py-24 lg:py-52 relative z-10">
            <div className="max-w-7xl mx-auto px-[5vw]">
              <div className="mb-12 md:mb-20">
                <span className="section-label text-or mb-4 block">Panthéon</span>
                <h2 className="editorial-heading text-ivoire !text-[clamp(2.5rem,8vw,5rem)]">Les Puissances</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-l border-b border-ivoire/10">
                {divinities.map((deity, index) => (
                  <Link key={index} to="/pantheon" className="relative aspect-[3/5] overflow-hidden group cursor-pointer border-r border-t border-ivoire/10" style={{ backgroundColor: deity.color + 'CC' }}>
                    {/* Image */}
                    {deity.image && (
                      <img
                        src={deity.image}
                        alt={deity.name}
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110 opacity-80"
                      />
                    )}
                    {/* Color tint overlay */}
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-50"
                      style={{ backgroundColor: deity.color }}
                    />
                    {/* Light effect glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                      style={{
                        background: `radial-gradient(circle at center, ${deity.color}80 0%, transparent 70%)`,
                        boxShadow: `inset 0 0 60px ${deity.color}40`,
                      }}
                    />
                    {/* Bottom gradient for text readability */}
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