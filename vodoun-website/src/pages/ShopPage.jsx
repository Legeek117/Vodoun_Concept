import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ALL_PRODUCTS, COLLECTIONS } from '../store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ShopPage() {
  const { collectionId } = useParams();
  const [selected, setSelected] = useState(collectionId || 'all');
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      '.product-grid .product-item',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.product-grid',
          start: 'top 70%',
        },
      }
    );
  }, [selected]);

  const filteredProducts = selected === 'all'
    ? ALL_PRODUCTS
    : selected.startsWith('univers-')
    ? ALL_PRODUCTS.filter(p => {
      const deity = selected.replace('univers-', '');
      return p.deity?.toLowerCase() === deity.toLowerCase();
    })
    : ALL_PRODUCTS.filter(p => p.category.toLowerCase().includes(selected.toLowerCase().replace('-', ' ')));

  return (
    <div ref={containerRef} className="min-h-screen bg-ivoire text-brun pt-32">
      <div className="max-w-7xl mx-auto px-[5vw] mb-16">
        <span className="section-label">Boutique</span>
        <h1 className="editorial-heading text-noir mb-8">
          Collections Vodun
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-[5vw] mb-16">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setSelected('all')}
            className={`px-8 py-3 border-b-2 uppercase tracking-widest text-sm transition-all duration-300 ${
              selected === 'all' ? 'border-or text-or font-bold' : 'border-transparent text-brun/60 hover:text-brun'
            }`}
          >
            Tous
          </button>
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelected(col.id)}
              className={`px-8 py-3 border-b-2 uppercase tracking-widest text-sm transition-all duration-300 ${
                selected === col.id ? 'border-or text-or font-bold' : 'border-transparent text-brun/60 hover:text-brun'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-[5vw] pb-32">
        <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {filteredProducts.map((product, index) => (
            <Link key={product.id} to={`/boutique/produit/${product.id}`} className="product-item group block">
              <div className="relative overflow-hidden aspect-[4/5] mb-8 bg-sable/10">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                  <span className="btn-premium translate-y-10 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                    Découvrir
                  </span>
                </div>
                {!product.available && (
                  <div className="absolute top-6 left-6 bg-rouge-rituel text-ivoire px-4 py-1 text-xs uppercase tracking-widest">
                    Epuisé
                  </div>
                )}
              </div>
              <div>
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-or font-bold block mb-2">
                  {product.category}
                </span>
                <h3 className="font-playfair text-3xl font-black mb-3 group-hover:text-or transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-sm opacity-60 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                <p className="font-playfair text-xl font-bold">{product.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </Link>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-32 opacity-60">
            Aucun produit trouvé dans cette collection.
          </div>
        )}
      </div>
    </div>
  );
}
