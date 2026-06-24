import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { ALL_PRODUCTS } from '../store';

const ImmersiveProductShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('immersive'); // 'immersive' or 'grid'
  const containerRef = useRef(null);
  const sectionsRef = useRef([]);
  const lenisRef = useRef(null);

  const products = ALL_PRODUCTS.slice(0, 8);

  useEffect(() => {
    if (viewMode !== 'immersive') return;

    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenisRef.current.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    // Cleanup existing triggers first
    ScrollTrigger.getAll().forEach(st => st.kill());

    sectionsRef.current.forEach((section, index) => {
      const content = section.querySelector('.slide-content');
      const img = section.querySelector('.product-img-sharp');
      const blurredBg = section.querySelector('.product-img-blurred');
      const text = section.querySelector('.text-content');

      // Initial state setup - first slide visible, others hidden
      if (index === 0) {
        gsap.set(content, { autoAlpha: 1, y: 0 });
        gsap.set(img, { autoAlpha: 1, scale: 1 });
        gsap.set(blurredBg, { autoAlpha: 1, scale: 1.1 });
        gsap.set(text, { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(content, { autoAlpha: 0, y: 50 });
        gsap.set(img, { autoAlpha: 0, scale: 1.1 });
        gsap.set(blurredBg, { autoAlpha: 0, scale: 1.2 });
        gsap.set(text, { autoAlpha: 0, y: 30 });
      }

      // MAIN PINNING TRIGGER
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onEnter: () => {
          setActiveIndex(index);
          if (index > 0) {
            gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
            gsap.to(img, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out' });
            gsap.to(blurredBg, { autoAlpha: 1, scale: 1.1, duration: 1, ease: 'power3.out', delay: 0.1 });
            gsap.to(text, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
          }
        },
        onEnterBack: () => {
          setActiveIndex(index);
          gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
          gsap.to(img, { autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out' });
          gsap.to(blurredBg, { autoAlpha: 1, scale: 1.1, duration: 1, ease: 'power3.out', delay: 0.1 });
          gsap.to(text, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
        },
        onLeave: () => {
          gsap.to(content, { autoAlpha: 0, y: -50, duration: 0.6, ease: 'power3.in' });
          gsap.to(img, { autoAlpha: 0, scale: 0.9, duration: 0.8, ease: 'power3.in' });
          gsap.to(blurredBg, { autoAlpha: 0, scale: 1, duration: 0.8, ease: 'power3.in' });
          gsap.to(text, { autoAlpha: 0, y: -30, duration: 0.6, ease: 'power3.in' });
        },
        onLeaveBack: () => {
          gsap.to(content, { autoAlpha: 0, y: 50, duration: 0.6, ease: 'power3.in' });
          gsap.to(img, { autoAlpha: 0, scale: 1.2, duration: 0.8, ease: 'power3.in' });
          gsap.to(blurredBg, { autoAlpha: 0, scale: 1.3, duration: 0.8, ease: 'power3.in' });
          gsap.to(text, { autoAlpha: 0, y: 30, duration: 0.6, ease: 'power3.in' });
        },
      });
    });

    return () => {
      if (lenisRef.current) lenisRef.current.destroy();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [viewMode]);

  const GridFallback = () => (
    <div className="max-w-7xl mx-auto px-[5vw] pb-32 pt-8">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-20">
        {products.map((product) => (
          <a key={product.id} href={`/boutique/produit/${product.id}`} className="product-item group block">
            <div className="relative overflow-hidden aspect-[4/5] mb-4 md:mb-8 bg-sable/10 border-2 border-ivoire/50 group-hover:border-or transition-all duration-500">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            </div>
            <div>
              <span className="text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.2em] md:tracking-[0.3em] text-or font-bold block mb-1 md:mb-2">
                {product.category}
              </span>
              <h3 className="font-playfair text-lg md:text-3xl font-black mb-2 md:mb-3 group-hover:text-or transition-colors duration-300">
                {product.name}
              </h3>
              <p className="font-playfair text-sm md:text-xl font-bold">{product.price.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  if (viewMode === 'grid') return <GridFallback />;

  return (
    <div ref={containerRef} className="relative">
      {/* Toggle button */}
      <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setViewMode('grid')}
          className="px-6 py-3 border-2 border-or text-or font-playfair text-xs md:text-sm uppercase tracking-widest hover:bg-or hover:text-noir transition-all duration-300 backdrop-blur-sm bg-ivoire/90"
        >
          Vue grille
        </button>
      </div>

      {/* Progress indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
        {products.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'bg-or scale-150' : 'bg-ivoire/40'
            }`}
          />
        ))}
      </div>

      {/* Slides container */}
      <div>
        {products.map((product, index) => (
          <section
            key={product.id}
            ref={(el) => sectionsRef.current[index] = el}
            className="relative w-full h-screen bg-ivoire"
          >
            <div className="slide-content absolute inset-0 flex flex-col lg:flex-row items-center justify-center w-full h-full px-6 lg:px-12 gap-12">
              
              {/* LEFT: Text content */}
              <div className="text-content w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4 block">
                  {product.category}
                </span>
                <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-noir mb-6 leading-tight">
                  {product.name}
                </h2>
                <p className="text-noir/70 font-inter text-base md:text-lg mb-10 max-w-lg">
                  {product.description}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-center lg:justify-start">
                  <p className="font-playfair text-2xl md:text-4xl font-bold text-noir">
                    {product.price.toLocaleString('fr-FR')} FCFA
                  </p>
                  <button className="px-10 py-4 border-2 border-or bg-or text-noir font-playfair font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-transparent hover:text-or transition-all duration-300">
                    Ajouter au panier
                  </button>
                </div>
              </div>

              {/* RIGHT: Image area */}
              <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative flex items-center justify-center">
                {/* Blurred background image */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt=""
                    className="product-img-blurred w-full h-full object-cover scale-110 opacity-50"
                    style={{ filter: 'blur(20px)' }}
                  />
                </div>
                
                {/* Sharp product image */}
                <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img-sharp w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ImmersiveProductShowcase;