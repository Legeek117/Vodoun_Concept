import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ALL_PRODUCTS, COLLECTIONS } from '../store';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 168;

export default function ShopPage() {
  const { collectionId } = useParams();
  const [selected, setSelected] = useState(collectionId || 'all');
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [loadProgress, setLoadProgress] = useState(0);

  const filteredProducts = selected === 'all'
    ? ALL_PRODUCTS
    : selected.startsWith('univers-')
    ? ALL_PRODUCTS.filter(p => {
      const deity = selected.replace('univers-', '');
      return p.deity?.toLowerCase() === deity.toLowerCase();
    })
    : ALL_PRODUCTS.filter(p => p.category.toLowerCase().includes(selected.toLowerCase().replace('-', ' ')));

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const frames = [];
    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameIndex = (index + 1).toString().padStart(4, '0');
        img.src = `/frames/shop/frame_${frameIndex}.jpg`;
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
          resolve();
        };
      });
    };

    const firstChunk = Array.from({ length: 40 }, (_, i) => loadFrame(i));
    Promise.all(firstChunk).then(() => {
      framesRef.current = frames;
      const rest = Array.from({ length: FRAME_COUNT - 40 }, (_, i) => loadFrame(i + 40));
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
    if (loadProgress < 100) return;
    drawFrame(0);
    ScrollTrigger.refresh();

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const loopDistance = 3000;
      const progress = (scrollPos % loopDistance) / loopDistance;
      const index = Math.min(Math.floor(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
      if (framesRef.current[index]) {
        requestAnimationFrame(() => drawFrame(index));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.refresh();
    };
  }, [loadProgress]);

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      {/* 1. Header Section (Refined Ivory Background) */}
      <div className="bg-[#F4F0E6] text-noir py-12 pt-28 md:py-16 md:pt-32 relative z-50">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label mb-3 block text-[10px]">Catalogue</span>
          <h1 className="editorial-heading text-noir mb-4 !text-[clamp(2.5rem,8vw,5rem)] leading-[0.9]">
            Boutique<br/><span className="italic text-or">Vodun</span>
          </h1>
          <p className="text-brun/80 text-sm md:text-lg max-w-xl mb-8 font-playfair font-medium leading-relaxed">
            Explorez nos collections sacrées, où chaque pièce raconte une part de l'héritage ancestral. 
          </p>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-8">
            <button
              onClick={() => setSelected('all')}
              className={`px-6 md:px-8 py-2 md:py-3 border-2 text-[8px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500 font-bold ${
                selected === 'all' ? 'bg-noir text-or border-noir' : 'border-noir/10 text-noir/60 hover:border-noir hover:text-noir'
              }`}
            >
              Tous
            </button>
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelected(col.id)}
                className={`px-6 md:px-8 py-2 md:py-3 border-2 text-[8px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all duration-500 font-bold ${
                  selected === col.id ? 'bg-noir text-or border-noir' : 'border-noir/10 text-noir/60 hover:border-noir hover:text-noir'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-noir/10"></div>
      </div>

      {/* 2. Products Section with Background Video */}
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full object-cover opacity-85"
            style={{ filter: 'brightness(1.1) contrast(1.1) saturate(0.9)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-transparent to-noir" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-[5vw] py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 justify-items-center">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index} 
                isDark={true} 
                variant="square" 
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-40 opacity-40 uppercase tracking-[0.4em] text-xs">
              Aucun vestige trouvé
            </div>
          )}
        </div>
      </div>

      <footer className="relative z-20 bg-noir pt-24 pb-12 border-t border-ivoire/10">
        <div className="max-w-7xl mx-auto px-[5vw] text-center">
          <h2 className="font-playfair text-3xl font-black text-or mb-3">VODUN</h2>
          <p className="text-ivoire/30 text-[10px] uppercase tracking-[0.4em]">L'Héritage Immortel</p>
        </div>
      </footer>
    </div>
  );
}