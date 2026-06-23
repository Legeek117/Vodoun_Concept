import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Product3DViewer from './Product3DViewer';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturedProduct({ product, index }) {
  const [selectedMotif, setSelectedMotif] = useState('legba');
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      }
    );
  }, []);

  const motifs = [
    { id: 'legba', name: 'Legba', colors: ['#8E2420', '#1A1410'] },
    { id: 'dan', name: 'Dan', colors: ['#1C4A66', '#40E0D0'] },
  ];

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-32 bg-noir text-ivoire"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 3D Viewer */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-or/20 to-indigo-dan/20 rounded-3xl blur-3xl"></div>
              <div className="relative z-10 rounded-3xl overflow-hidden border border-ivoire/10">
                <Product3DViewer product="totem" motif={selectedMotif} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-or text-sm uppercase tracking-widest mb-4 block">Pièce Signature</span>
            <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-6">{product.name}</h2>
            <p className="text-xl opacity-80 mb-8">{product.description}</p>
            
            <div className="mb-8">
              <p className="font-bold mb-4">Choisissez votre motif :</p>
              <div className="flex gap-4">
                {motifs.map((motif) => (
                  <button
                    key={motif.id}
                    onClick={() => setSelectedMotif(motif.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${
                      selectedMotif === motif.id
                        ? 'border-or bg-or/10 text-or'
                        : 'border-ivoire/30 text-ivoire/70 hover:border-ivoire/50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: motif.colors[0] }}
                    ></div>
                    {motif.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 p-6 bg-ivoire/5 rounded-2xl">
              <h4 className="font-bold mb-4">Caractéristiques :</h4>
              <ul className="space-y-3 text-ivoire/80">
                <li className="flex items-center gap-3">
                  <span className="text-or">✦</span>
                  <span>Hauteur : 1m · 2m · 3m</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-or">✦</span>
                  <span>Métal perforé au laser</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-or">✦</span>
                  <span>Raphia naturel</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-or">✦</span>
                  <span>Projection de vévés lumineux</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-4xl font-playfair font-bold text-or">
                {product.price}
              </div>
              <button className="bg-or text-noir font-bold py-4 px-8 rounded-full text-lg hover:bg-or/90 transition-all flex-1 sm:flex-none">
                Commander
              </button>
              <button className="border-2 border-ivoire text-ivoire font-bold py-4 px-8 rounded-full text-lg hover:bg-ivoire hover:text-noir transition-all flex-1 sm:flex-none">
                Demander un devis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
