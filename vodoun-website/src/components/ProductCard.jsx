import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function ProductCard({ product, index, isDark = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        delay: index * 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
      }
    );
  }, [index]);

  return (
    <Link to={`/boutique/produit/${product.id}`} ref={containerRef} className="group cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/5] md:aspect-[4/5] mb-4 md:mb-8 bg-sable/20 border-2 border-ivoire/10 rounded-lg md:rounded-xl">
        {product.video ? (
          <video
            src={product.video}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-4 md:p-8">
          <button className="btn-premium translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out text-xs md:text-sm px-4 md:px-10 py-2 md:py-5">
            Découvrir
          </button>
        </div>
      </div>
      <div>
        <span className="text-[0.5rem] md:text-[0.65rem] uppercase tracking-[0.2em] md:tracking-[0.3em] text-or font-bold block mb-1 md:mb-2">
          {product.category}
        </span>
        <h3 className={`font-playfair text-lg md:text-3xl font-black mb-2 md:mb-4 group-hover:text-or transition-colors duration-300 ${isDark ? 'text-ivoire' : 'text-noir'}`}>
          {product.name}
        </h3>
        <p className={`text-xs md:text-sm opacity-100 mb-3 md:mb-6 leading-relaxed ${isDark ? 'text-ivoire/80' : 'text-brun'}`}>{product.story}</p>
        <p className={`font-playfair text-sm md:text-xl font-bold ${isDark ? 'text-ivoire' : 'text-noir'}`}>{product.price}</p>
      </div>
    </Link>
  );
}
