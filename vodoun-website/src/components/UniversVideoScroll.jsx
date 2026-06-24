import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ProductCard from './ProductCard';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 450;

export default function UniversVideoScroll({ products }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [loadProgress, setLoadProgress] = useState(0);

  // Preload frames (Phase loading)
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

    // Load in chunks for better initial performance
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
    if (loadProgress < 10) return;

    // Drawing the first frame
    drawFrame(0);

    // GSAP ScrollTrigger for video scrubbing
    ScrollTrigger.create({
      trigger: containerRef.current,
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

    // Animate content blocks
    const contentBlocks = gsap.utils.toArray('.univers-content-block');
    contentBlocks.forEach((block, index) => {
      gsap.fromTo(block, 
        { opacity: 0, y: 100 },
        { 
          opacity: 1, 
          y: 0,
          scrollTrigger: {
            trigger: block,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    });

  }, [loadProgress]);

  return (
    <div ref={containerRef} className="relative bg-[#0A0A0A] h-[400vh]">
      {/* Sticky Video Layer */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-cover opacity-80"
          style={{ filter: 'brightness(1.0) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] opacity-60" />
      </div>

      {/* Overlaid Content Sections */}
      <div className="relative z-10">
        {/* Section 1: Festive */}
        <section className="univers-content-block min-h-screen flex flex-col justify-center px-[5vw] py-20">
          <div className="max-w-7xl mx-auto w-full">
            <span className="section-label">01 / Univers</span>
            <h2 className="editorial-heading text-ivoire mb-8 !text-[clamp(2.5rem,8vw,5rem)]">Décorations<br />Festives</h2>
            <p className="editorial-body text-ivoire/70 mb-12 max-w-xl text-sm md:text-base">
              Des installations lumineuses monumentales qui transforment l'espace en théâtre de lumière sacrée.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 justify-items-start">
              {products.decorations.map((p, i) => (
                <ProductCard key={i} product={p} index={i} isDark={true} variant="immersive" />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Mode */}
        <section className="univers-content-block min-h-screen flex flex-col justify-center px-[5vw] py-20">
          <div className="max-w-7xl mx-auto w-full flex flex-col items-end text-right">
            <span className="section-label">02 / Univers</span>
            <h2 className="editorial-heading text-ivoire mb-8 !text-[clamp(2.5rem,8vw,5rem)]">La Mode<br />du Sacré</h2>
            <p className="editorial-body text-ivoire/70 mb-12 max-w-xl text-sm md:text-base">
              Porter le symbole. Chaque t-shirt est une toile, chaque chapeau une couronne.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 justify-items-end">
              {products.mode.map((p, i) => (
                <ProductCard key={i} product={p} index={i} isDark={true} variant="immersive" />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Mobilier */}
        <section className="univers-content-block min-h-screen flex flex-col justify-center px-[5vw] py-20">
          <div className="max-w-7xl mx-auto w-full">
            <span className="section-label">03 / Univers</span>
            <h2 className="editorial-heading text-ivoire mb-8 !text-[clamp(2.5rem,8vw,5rem)]">Le Mobilier<br />de Prestige</h2>
            <p className="editorial-body text-ivoire/70 mb-12 max-w-xl text-sm md:text-base">
              Des pièces uniques sculptées dans le bois massif, alliant prestige royal et confort contemporain.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 justify-items-start">
              {products.mobilier.map((p, i) => (
                <ProductCard key={i} product={p} index={i} isDark={true} variant="immersive" />
              ))}
            </div>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .univers-content-block {
          position: relative;
          z-index: 10;
        }
      `}} />
    </div>
  );
}
