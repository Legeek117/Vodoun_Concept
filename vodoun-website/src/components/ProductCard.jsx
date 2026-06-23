import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ProductCard({ product, index }) {
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
    <div ref={containerRef} className="group cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/5] mb-8 bg-sable/10">
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
        <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-8">
          <button className="btn-premium translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
            Découvrir
          </button>
        </div>
      </div>
      <div>
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-or font-bold block mb-2">
          {product.category}
        </span>
        <h3 className="font-playfair text-3xl font-black mb-4 group-hover:text-or transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-sm opacity-60 mb-6 leading-relaxed">{product.story}</p>
        <p className="font-playfair text-xl font-bold">{product.price}</p>
      </div>
    </div>
  );
}
