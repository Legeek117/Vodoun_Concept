import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function ProductCard({ product, index, isDark = false, variant = 'default' }) {
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
          start: 'top 85%',
        },
      }
    );
  }, [index]);

  if (variant === 'immersive') {
    return (
      <Link to={`/boutique/produit/${product.id}`} ref={containerRef} className="group cursor-pointer block max-w-[280px]">
        <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20">
          <div className="w-full h-[65%] overflow-hidden rounded-2xl mb-4">
            {product.video ? (
              <video src={product.video} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            )}
          </div>
          <div>
            <span className="text-[0.5rem] uppercase tracking-[0.2em] text-or font-bold block mb-1">
              {product.category.split('/')[1] || product.category}
            </span>
            <h3 className="font-playfair text-lg font-black text-white group-hover:text-or transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="font-playfair text-sm font-bold text-white/60 mt-1">{product.price}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'square') {
    return (
      <Link to={`/boutique/produit/${product.id}`} ref={containerRef} className="group cursor-pointer block w-full max-w-[380px] relative z-10 transition-transform duration-500 hover:-translate-y-2">
        <div className="relative overflow-hidden aspect-square mb-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6 transition-all duration-700 group-hover:bg-white/15 group-hover:border-or/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div className="w-full h-[65%] overflow-hidden rounded-2xl bg-noir/20">
            {product.video ? (
              <video src={product.video} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            )}
          </div>
          <div className="text-center pb-2">
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-or font-bold block mb-2">
              {product.category.split('/')[1] || product.category}
            </span>
            <h3 className="font-playfair text-lg md:text-xl font-black text-white group-hover:text-or transition-colors duration-300">
              {product.name}
            </h3>
            <p className="font-playfair text-lg text-white/60 mt-2">{product.price.toLocaleString()} FCFA</p>
          </div>
        </div>
      </Link>
    );
  }

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
