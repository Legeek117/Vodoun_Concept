import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ALL_PRODUCTS } from '../store';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// Helper function to get colors for any product
function getProductColors(product) {
  const colorMap = {
    'le-veilleur': { bg: '#1a1410', accent: '#8E2420' },
    'la-pluie-de-cauris': { bg: '#141a20', accent: '#1C4A66' },
    't-shirt-sérigraphié': { bg: '#2c2420', accent: '#B8860B' },
    'montre-artisanale': { bg: '#1c1c1c', accent: '#20603C' },
    'casquettes-headwear': { bg: '#1a1410', accent: '#B8860B' },
    'bracelet-de-puissance': { bg: '#1c1c1c', accent: '#8E2420' },
    'le-trone-de-direction': { bg: '#1a1410', accent: '#B8860B' },
    'luminaires-sacres-led': { bg: '#141a20', accent: '#1C4A66' }
  };
  const defaultColors = { bg: '#1a1410', accent: '#B8860B' };
  return colorMap[product.id] || defaultColors;
}

const FEATURED_PRODUCTS = ALL_PRODUCTS.filter(p => 
  ['le-veilleur', 'la-pluie-de-cauris', 't-shirt-sérigraphié', 'montre-artisanale', 'bracelet-de-puissance', 'le-trone-de-direction', 'luminaires-sacres-led']
  .includes(p.id)
).map(p => ({
  ...p,
  bgColor: getProductColors(p).bg,
  accentColor: getProductColors(p).accent
}));

export default function ProductScrollShowcase({ products = FEATURED_PRODUCTS }) {
  // Ensure all products have colors
  const productsWithColors = products.map(p => ({
    ...p,
    bgColor: p.bgColor || getProductColors(p).bg,
    accentColor: p.accentColor || getProductColors(p).accent
  }));
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up old triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger?.closest('.product-scroll-container') === containerRef.current) st.kill();
    });

    const sections = containerRef.current.querySelectorAll('.product-slide');
    const allImgs = containerRef.current.querySelectorAll('.product-img');
    const allTexts = containerRef.current.querySelectorAll('.product-text');
    const allBgs = containerRef.current.querySelectorAll('.product-bg');

    // Hide all by default
    allImgs.forEach((img, i) => {
      gsap.set(img, { y: i === 0 ? 0 : 100, opacity: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.1 });
    });
    allTexts.forEach((text, i) => {
      gsap.set(text, { y: i === 0 ? 0 : 50, opacity: i === 0 ? 1 : 0 });
    });

    sections.forEach((section, index) => {
      const img = allImgs[index];
      const text = allTexts[index];
      const bg = allBgs[index];

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          // Hide previous products
          allImgs.forEach((prevImg, i) => {
            if (i < index) {
              gsap.to(prevImg, { y: -100, opacity: 0, scale: 0.9, duration: 1, ease: 'power3.in' });
            }
          });
          allTexts.forEach((prevText, i) => {
            if (i < index) {
              gsap.to(prevText, { y: -50, opacity: 0, duration: 1, ease: 'power3.in' });
            }
          });

          // Show current product
          gsap.to(img, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
          gsap.to(text, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
          gsap.to(containerRef.current, { backgroundColor: bg.style.backgroundColor, duration: 0.8 });
        },
        onLeave: () => {
          gsap.to(img, { y: -100, opacity: 0, scale: 0.9, duration: 1, ease: 'power3.in' });
          gsap.to(text, { y: -50, opacity: 0, duration: 1, ease: 'power3.in' });
        },
        onEnterBack: () => {
          // Hide next products
          allImgs.forEach((nextImg, i) => {
            if (i > index) {
              gsap.to(nextImg, { y: 100, opacity: 0, scale: 1.1, duration: 1, ease: 'power3.in' });
            }
          });
          allTexts.forEach((nextText, i) => {
            if (i > index) {
              gsap.to(nextText, { y: 50, opacity: 0, duration: 1, ease: 'power3.in' });
            }
          });

          // Show current product
          gsap.to(img, { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
          gsap.to(text, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
          gsap.to(containerRef.current, { backgroundColor: bg.style.backgroundColor, duration: 0.8 });
        },
        onLeaveBack: () => {
          gsap.to(img, { y: 100, opacity: 0, scale: 1.1, duration: 1, ease: 'power3.in' });
          gsap.to(text, { y: 50, opacity: 0, duration: 1, ease: 'power3.in' });
        }
      });
    });

  }, [products]);

  return (
    <div ref={containerRef} className="product-scroll-container relative w-full overflow-hidden" style={{ backgroundColor: productsWithColors[0]?.bgColor || '#1a1410', height: `${productsWithColors.length * 100}vh` }}>
      {/* Scroll spacer */}
      <div className="relative z-0">
        {productsWithColors.map((product, i) => (
          <div key={product.id} className="product-slide h-screen w-full flex items-center justify-center">
            {/* Spacer div for scroll height */}
          </div>
        ))}
      </div>

      {/* Fixed content container - PINNED ONLY WITHIN THIS COMPONENT */}
      <div className="sticky top-0 left-0 w-full h-screen z-10 flex items-center justify-center px-[5vw] md:px-[10vw] overflow-hidden">
        {productsWithColors.map((product, index) => (
          <div 
            key={product.id}
            className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-8"
          >
            {/* Hidden background div for color transition */}
            <div 
              className="product-bg absolute inset-0 -z-10 opacity-0"
              style={{ backgroundColor: product.bgColor }}
            />

            {/* Text Content */}
            <div className="product-text flex-1 order-2 md:order-1 text-center md:text-left max-w-md">
              <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4 block">
                {product.category}
              </span>
              <h2 className="text-ivoire font-playfair text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
                {product.name}
              </h2>
              <p className="text-ivoire/60 font-playfair text-base md:text-lg mb-10">
                {product.story}
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-center md:justify-start">
                <p className="text-or font-playfair text-2xl md:text-4xl font-bold">
                  {product.price.toLocaleString('fr-FR')} FCFA
                </p>
                <Link 
                  to={`/boutique/produit/${product.id}`}
                  className="px-10 py-4 border border-or text-or font-playfair text-sm tracking-[0.2em] uppercase hover:bg-or hover:text-noir transition-all duration-500"
                >
                  Découvrir
                </Link>
              </div>
            </div>

            {/* Product Image */}
            <div className="product-img flex-1 order-1 md:order-2 relative w-full aspect-square md:aspect-auto h-[40vh] md:h-[70vh] flex items-center justify-center">
              <div 
                className="absolute inset-0 blur-[100px] opacity-20 rounded-full"
                style={{ backgroundColor: product.accentColor }}
              />
              <img 
                src={product.image} 
                alt={product.name}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        ))}

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
          <div className="w-[1px] h-20 bg-ivoire/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-or origin-top" style={{ animation: 'scroll-line 2s cubic-bezier(0.65,0,0.35,1) infinite' }} />
          </div>
          <span className="text-ivoire/40 font-playfair text-[10px] tracking-[0.3em] uppercase">Scrollez pour explorer</span>
        </div>
      </div>

      {/* Animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          50.1% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}}></style>
    </div>
  );
}