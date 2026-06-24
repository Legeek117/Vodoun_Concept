import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { ALL_PRODUCTS } from '../store';

const Wheel3DCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('immersive');
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const lenisRef = useRef(null);

  const products = ALL_PRODUCTS.slice(0, 8);
  const totalItems = products.length;
  // Significantly increased radius to prevent overlap and create a cleaner "slot machine" feel
  const radius = 1200; 
  const angleStep = 360 / totalItems;

  useEffect(() => {
    if (viewMode !== 'immersive') return;

    gsap.registerPlugin(ScrollTrigger);

    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      if (lenisRef.current) {
        lenisRef.current.raf(time);
        requestAnimationFrame(raf);
      }
    }
    requestAnimationFrame(raf);

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        id: 'wheel-scroll',
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalItems * 150}%`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const rawProgress = self.progress * (totalItems - 1);
          const currentItem = Math.round(rawProgress);
          setActiveIndex(currentItem);
          
          const targetRotation = rawProgress * angleStep;
          // Compensate for radius to keep active slide at Z=0
          if (wheelRef.current) {
            gsap.set(wheelRef.current, {
              transform: `translateZ(${-radius}px) rotateX(${-targetRotation}deg)`
            });
          }
        }
      }
    });

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.id === 'wheel-scroll') st.kill();
      });
    };
  }, [viewMode, totalItems, angleStep, radius]);

  if (viewMode === 'grid') {
    return (
      <div className="max-w-7xl mx-auto px-[5vw] pb-32 pt-32 min-h-screen bg-[#F4F0E6]">
        {/* Toggle back to immersive */}
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100]">
          <button
            onClick={() => setViewMode('immersive')}
            className="px-6 py-2 border border-[#1A1410] text-[#1A1410] font-inter text-[10px] uppercase tracking-[0.2em] hover:bg-[#1A1410] hover:text-[#F4F0E6] transition-all duration-300 bg-transparent"
          >
            Vue Immersive
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-20">
          {products.map((product) => (
            <a key={product.id} href={`/boutique/produit/${product.id}`} className="product-item group block">
              <div className="relative overflow-hidden aspect-[4/5] mb-4 md:mb-8 bg-sable/10 border-2 border-ivoire/50 group-hover:border-or transition-all duration-500">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-playfair text-lg md:text-3xl font-black mb-2">{product.name}</h3>
              <p className="font-playfair text-sm md:text-xl font-bold">{product.price.toLocaleString('fr-FR')} FCFA</p>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#F4F0E6]">
      {/* 3D Wheel Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[2000px] z-10">
        <div
          ref={wheelRef}
          className="relative w-full h-full preserve-3d"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-radius}px)`
          }}
        >
          {products.map((product, index) => {
            const angle = index * angleStep;
            const distance = Math.abs(activeIndex - index);
            const isVisible = distance <= 1 || distance >= totalItems - 1;
            
            return (
              <div
                key={product.id}
                className="absolute left-0 top-0 w-full h-full preserve-3d"
                style={{
                  transform: `rotateX(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  opacity: isVisible ? 1 : 0,
                  visibility: isVisible ? 'visible' : 'hidden',
                  transition: 'opacity 0.4s ease, visibility 0.4s ease'
                }}
              >
                {/* Strict 50/50 Split Screen Slide */}
                <div className="flex w-full h-full overflow-hidden">
                  
                  {/* LEFT HALF: Content (Centered) */}
                  <div className="w-1/2 h-full flex flex-col justify-center pl-20 pr-12 bg-[#F4F0E6]">
                    <div className="w-full">
                      <span className="text-[#B8860B] text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
                        {product.category}
                      </span>
                      <h2 className="font-cormorant text-[64px] md:text-[80px] font-bold text-[#1A1410] mb-4 leading-[1] max-w-[15ch] line-clamp-2">
                        {product.name}
                      </h2>
                      <p className="font-inter text-sm text-[#1A1410]/60 mb-8 max-w-md leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-col items-start gap-8">
                        <p className="font-inter text-[28px] font-bold text-[#1A1410]">
                          {product.price.toLocaleString('fr-FR')} FCFA
                        </p>
                        <button className="px-8 py-[14px] bg-[#B8860B] text-[#1A1410] font-bold uppercase tracking-widest text-xs md:text-sm hover:brightness-110 transition-all duration-300">
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT HALF: Visual (Blur + Sharp) */}
                  <div className="w-1/2 h-full relative overflow-hidden">
                    {/* Blurred background filling the right half */}
                    <div className="absolute inset-0">
                      <img 
                        src={product.image} 
                        alt="" 
                        className="w-full h-full object-cover blur-[24px] scale-[1.25] opacity-90"
                      />
                    </div>
                    
                    {/* Sharp centered product image */}
                    <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-auto h-auto max-w-[85%] max-h-[75vh] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UI Controls */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100]">
        <button
          onClick={() => setViewMode('grid')}
          className="px-6 py-2 border border-[#1A1410] text-[#1A1410] font-inter text-[10px] uppercase tracking-[0.2em] hover:bg-[#1A1410] hover:text-[#F4F0E6] transition-all duration-300 bg-transparent"
        >
          Vue grille
        </button>
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] text-[#1A1410] font-inter text-[10px] tracking-[0.3em] uppercase opacity-40">
        Scrollez pour faire tourner la roue
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .preserve-3d { transform-style: preserve-3d; }
      `}} />
    </div>
  );
};

export default Wheel3DCarousel;