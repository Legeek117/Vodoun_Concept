import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import { ALL_PRODUCTS, COLLECTIONS } from './store';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 450;

function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [loadProgress, setLoadProgress] = useState(0);

  // Preload frames for global home scroll
  useEffect(() => {
    let loadedCount = 0;
    const frames = [];
    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameIndex = (index + 1).toString().padStart(4, '0');
        img.src = `/frames/coris/frame_${frameIndex}.jpg`;
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
          resolve();
        };
      });
    };

    const firstChunk = Array.from({ length: 50 }, (_, i) => loadFrame(i));
    Promise.all(firstChunk).then(() => {
      framesRef.current = frames;
      const rest = Array.from({ length: FRAME_COUNT - 50 }, (_, i) => loadFrame(i + 50));
      Promise.all(rest);
    });
  }, []);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || !framesRef.current[index]) return;
    const ctx = canvas.getContext('2d');
    const img = framesRef.current[index];
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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    setTimeout(() => {
      ScrollTrigger.refresh();
      lenis.scrollTo(0, { immediate: true });
    }, 500);

    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (loadProgress < 10) return;
    drawFrame(0);

    ScrollTrigger.create({
      trigger: "#immersive-zone",
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(Math.floor(self.progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
        if (framesRef.current[index]) {
          requestAnimationFrame(() => drawFrame(index));
        }
      }
    });

    ScrollTrigger.refresh();
  }, [loadProgress]);

  const universProducts = {
    decorations: ALL_PRODUCTS.filter(p => p.category === 'Décorations Festives').slice(0, 2),
    mode: ALL_PRODUCTS.filter(p => p.category === 'Mode').slice(0, 2),
    mobilier: ALL_PRODUCTS.filter(p => p.category === 'Mobilier').slice(0, 2),
  };

  const divinities = [
    { name: 'DAN', title: 'Le Serpent', color: '#1C4A66', description: 'Spirales · Indigo · Turquoise' },
    { name: 'LEGBA', title: 'Le Gardien', color: '#8E2420', description: 'Croisements · Rouge · Noir' },
    { name: 'SAKPATA', title: 'La Terre', color: '#20603C', description: 'Formes organiques · Brun · Vert' },
    { name: 'MAMI WATA', title: "L'Eau", color: '#4A1942', description: 'Courbes · Violet · Or nacré' },
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
              <span className="section-label text-or mb-6 block">01 / L'Univers</span>
              <h2 className="editorial-heading text-ivoire mb-16 !text-[clamp(2.5rem,8vw,6rem)]">Les Collections</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {/* 1. Décorations */}
                <div className="flex flex-col gap-8">
                  <div className="text-ivoire/80 font-playfair text-xl italic mb-4">Festivités & Rituels</div>
                  {universProducts.decorations.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                {/* 2. Mode */}
                <div className="flex flex-col gap-8 md:pt-24">
                  <div className="text-ivoire/80 font-playfair text-xl italic mb-4">Parures du Quotidien</div>
                  {universProducts.mode.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} isDark={true} variant="immersive" />
                  ))}
                </div>
                {/* 3. Mobilier */}
                <div className="flex flex-col gap-8 md:pt-48">
                  <div className="text-ivoire/80 font-playfair text-xl italic mb-4">Demeures Sacrées</div>
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
                Plus qu'un store, Vodoun Concept est un pont entre les mondes. Chaque pièce porte en elle l'énergie d'un savoir-faire ancestral, magnifié par un design contemporain d'exception.
              </p>
              <div className="mt-16">
                <Link to="/boutique" className="btn-premium px-12 py-5">Explorer l'intégralité</Link>
              </div>
            </div>
          </section>

          {/* Section 3: Panthéon (Now fully immersive) */}
          <div id="pantheon" className="py-24 md:py-52 relative z-10">
            <div className="max-w-7xl mx-auto px-[5vw]">
              <div className="mb-20">
                <span className="section-label text-or mb-4 block">02 / Panthéon</span>
                <h2 className="editorial-heading text-ivoire !text-[clamp(2.5rem,8vw,5rem)]">Les Puissances</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-b border-ivoire/10">
                {divinities.map((deity, index) => (
                  <div key={index} className="relative aspect-[4/5] sm:aspect-[3/5] overflow-hidden group cursor-pointer border-r border-t border-ivoire/10" style={{ backgroundColor: deity.color + 'CC' }}>
                    <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/0 transition-all duration-700" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ivoire/70 block mb-2">{deity.title}</span>
                        <h3 className="text-ivoire font-playfair text-2xl md:text-3xl font-black">{deity.name}</h3>
                        <p className="text-ivoire/70 text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">{deity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-noir text-ivoire pt-40 pb-20 border-t border-ivoire/10 relative z-20">
        <div className="max-w-7xl mx-auto px-[5vw] text-center">
          <h2 className="font-playfair text-4xl font-black text-or mb-6">VODUN</h2>
          <p className="text-ivoire/40 text-xs uppercase tracking-[0.5em] mb-12">L'Héritage Immortel</p>
          <div className="flex justify-center gap-12 text-[10px] uppercase tracking-widest text-ivoire/60">
            <Link to="/boutique" className="hover:text-or transition-colors">Boutique</Link>
            <Link to="/contact" className="hover:text-or transition-colors">Contact</Link>
            <span className="hover:text-or cursor-pointer transition-colors">Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;