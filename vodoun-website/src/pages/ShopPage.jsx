import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ALL_PRODUCTS, COLLECTIONS } from '../store';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 313;

export default function ShopPage() {
  const { collectionId } = useParams();
  const [selected, setSelected] = useState(collectionId || 'all');
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);
  const heroRef = useRef(null);
  const filtersRef = useRef(null);

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

        img.onload = () => {
          frames[index] = img;
          resolve();
        };
        img.onerror = () => {
          resolve();
        };

        img.src = `/frames/shop/frame_${frameIndex}.jpg`;
      });
    };

    // Load first frame ASAP to unblock FCP
    loadFrame(0).then(() => {
      framesRef.current = frames;
      setIsFirstFrameLoaded(true); // Unblock the drawFrame effect

      const loadRestSequence = async () => {
        for (let i = 1; i < FRAME_COUNT; i += 20) {
          const chunk = [];
          for (let j = i; j < Math.min(i + 20, FRAME_COUNT); j++) {
            chunk.push(loadFrame(j));
          }
          await Promise.all(chunk);
        }
      };
      loadRestSequence();
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
    if (!isFirstFrameLoaded) return;
    drawFrame(0);
    ScrollTrigger.refresh();

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const loopDistance = 3000;
      const progress = (scrollPos % loopDistance) / loopDistance;
      const targetIndex = Math.min(Math.floor(progress * (FRAME_COUNT - 1)), FRAME_COUNT - 1);

      let i = targetIndex;
      while (i >= 0 && !framesRef.current[i]) i--;

      if (i >= 0) {
        requestAnimationFrame(() => drawFrame(i));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.refresh();
    };
  }, [isFirstFrameLoaded]);

  // Hero animations
  useEffect(() => {
    const heroElements = heroRef.current?.querySelectorAll('.animate-hero');
    if (heroElements && heroElements.length > 0) {
      gsap.fromTo(
        heroElements,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  // Filter animations
  useEffect(() => {
    const filterButtons = filtersRef.current?.querySelectorAll('.filter-btn');
    if (filterButtons && filterButtons.length > 0) {
      gsap.fromTo(
        filterButtons,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-noir text-ivoire">
      {/* 1. Header Section (Refined Ivory Background) */}
      <div ref={heroRef} className="bg-[#F4F0E6] text-noir py-12 pt-28 md:py-16 md:pt-32 relative z-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-5 w-20 h-20 border border-or/10 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-10 right-5 w-32 h-32 border border-or/10 rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/4 w-1 h-20 bg-or/10" />
        <div className="absolute top-1/3 right-1/4 w-1 h-16 bg-or/10" />

        <div className="max-w-7xl mx-auto px-[5vw] relative">
          <span className="section-label mb-3 block text-[10px] animate-hero">Catalogue</span>
          <h1 className="editorial-heading text-noir mb-4 !text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] animate-hero">
            Boutique<br /><span className="italic text-or relative inline-block">
              Vodun
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-or scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </span>
          </h1>
          <p className="text-brun/80 text-sm md:text-lg max-w-xl mb-8 font-playfair font-medium leading-relaxed animate-hero">
            Explorez nos collections sacrées, où chaque pièce raconte une part de l'héritage ancestral.
          </p>
          <div ref={filtersRef} className="relative mt-8">
            {/* Desktop: Horizontal Scroll Liquid Glass */}
            <div className="hidden md:block">
              <div
                className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center px-3 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(244, 240, 230, 0.7)',
                    backdropFilter: 'blur(50px) saturate(200%)',
                    boxShadow: `
                      0 20px 40px -15px rgba(0, 0, 0, 0.15),
                      0 5px 15px -5px rgba(0, 0, 0, 0.1),
                      inset 0 1px 2px -1px rgba(255, 255, 255, 0.8),
                      inset 0 -1px 2px -1px rgba(0, 0, 0, 0.05),
                      inset 0 0 0 1px rgba(184, 134, 11, 0.2)
                    `,
                  }}
                >
                  <button
                    onClick={() => setSelected('all')}
                    className={`snap-start flex-shrink-0 px-5 py-2.5 rounded-xl transition-all duration-500 font-bold uppercase tracking-[0.25em] text-[0.6rem] ${selected === 'all'
                      ? 'text-ivoire bg-noir shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                      : 'text-noir/70 hover:text-noir hover:bg-noir/5'
                      }`}
                  >
                    Tous
                  </button>
                  {COLLECTIONS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelected(col.id)}
                      className={`snap-start flex-shrink-0 px-5 py-2.5 rounded-xl transition-all duration-500 font-bold uppercase tracking-[0.25em] text-[0.6rem] ${selected === col.id
                        ? 'text-ivoire bg-noir shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                        : 'text-noir/70 hover:text-noir hover:bg-noir/5'
                        }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile: 3 Rows with Liquid Glass */}
            <div className="md:hidden">
              <div
                className="flex flex-wrap gap-2 px-3 py-3 rounded-2xl"
                style={{
                  background: 'rgba(244, 240, 230, 0.7)',
                  backdropFilter: 'blur(50px) saturate(200%)',
                  boxShadow: `
                    0 20px 40px -15px rgba(0, 0, 0, 0.15),
                    0 5px 15px -5px rgba(0, 0, 0, 0.1),
                    inset 0 1px 2px -1px rgba(255, 255, 255, 0.8),
                    inset 0 -1px 2px -1px rgba(0, 0, 0, 0.05),
                    inset 0 0 0 1px rgba(184, 134, 11, 0.2)
                  `,
                }}
              >
                <button
                  onClick={() => setSelected('all')}
                  className={`flex-1 min-w-[30%] px-3 py-2 rounded-xl transition-all duration-500 font-bold uppercase tracking-[0.2em] text-[0.55rem] ${selected === 'all'
                    ? 'text-ivoire bg-noir shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                    : 'text-noir/70 hover:text-noir hover:bg-noir/5'
                    }`}
                >
                  Tous
                </button>
                {COLLECTIONS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelected(col.id)}
                    className={`flex-1 min-w-[30%] px-3 py-2 rounded-xl transition-all duration-500 font-bold uppercase tracking-[0.2em] text-[0.55rem] ${selected === col.id
                      ? 'text-ivoire bg-noir shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                      : 'text-noir/70 hover:text-noir hover:bg-noir/5'
                      }`}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-noir/20 to-transparent"></div>
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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 lg:gap-24">
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

      <footer className="relative z-20 bg-noir pt-32 md:pt-48 pb-16 md:pb-24 border-t border-ivoire/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Logo & Brand */}
            <div className="lg:col-span-1">
              <a href="/accueil" aria-label="Vodoun Concept Store — Accueil">
                <img
                  src="/logo.jpeg"
                  alt="Vodoun Concept Store"
                  style={{ height: 'clamp(50px, 8vw, 80px)', width: 'auto', objectFit: 'contain', marginBottom: '1.5rem' }}
                />
              </a>
              <p className="text-ivoire/60 text-sm leading-relaxed mb-6">Ouidah, Bénin</p>
              <p className="text-ivoire/40 text-xs uppercase tracking-[0.5em]">L'Héritage Immortel</p>
            </div>

            {/* Navigation Links */}
            <div>
              <h3 className="section-label text-or mb-6 block">Navigation</h3>
              <ul className="space-y-3">
                <li><Link to="/accueil" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Accueil</Link></li>
                <li><Link to="/boutique" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Boutique</Link></li>
                <li><Link to="/a-propos" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">À Propos</Link></li>
                <li><Link to="/pantheon" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Panthéon</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="section-label text-or mb-6 block">Services</h3>
              <ul className="space-y-3">
                <li><Link to="/projets-pro" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Projets Pro</Link></li>
                <li><Link to="/contact" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Contact</Link></li>
                <li><Link to="/compte" className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or transition-colors">Suivi de Commande</Link></li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="section-label text-or mb-6 block">Nous Suivre</h3>
              <div className="flex flex-col gap-4 mb-8">
                <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Instagram</span>
                <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Facebook</span>
                <span className="text-ivoire/80 text-sm uppercase tracking-[0.3em] hover:text-or cursor-pointer transition-colors">LinkedIn</span>
              </div>
              <h4 className="section-label text-or mb-4 block">Contact</h4>
              <p className="text-ivoire/80 text-sm">contact@VODUN-concept.com</p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-ivoire/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-ivoire/40 text-xs uppercase tracking-[0.3em]">© 2025 Vodun Concept Store · Ouidah · Bénin</p>
            <div className="flex gap-8">
              <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors">Mentions Légales</span>
              <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors">CGV</span>
              <span className="text-ivoire/40 text-xs uppercase tracking-[0.2em] hover:text-or cursor-pointer transition-colors">Politique de Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}