import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ALL_PRODUCTS, COLLECTIONS } from '../store';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
      {/* Hero section for shop */}
      <div className="bg-noir text-ivoire py-16 md:py-24 mb-12">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or">Boutique</span>
          <h1 className="editorial-heading text-ivoire mb-4">
            Collections Vodun
          </h1>
          <p className="text-ivoire/70 text-sm md:text-xl max-w-2xl">
            Découvrez nos créations uniques, artisanales et empreintes de l'héritage vodun.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-[5vw] mb-12">
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setSelected('all')}
            className={`px-4 md:px-8 py-2 md:py-3 border-2 rounded-none uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
              selected === 'all' ? 'border-or bg-or text-noir font-bold' : 'border-brun/30 text-brun/60 hover:border-or hover:text-or hover:bg-or/10'
            }`}
          >
            Tous
          </button>
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelected(col.id)}
              className={`px-4 md:px-8 py-2 md:py-3 border-2 rounded-none uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                selected === col.id ? 'border-or bg-or text-noir font-bold' : 'border-brun/30 text-brun/60 hover:border-or hover:text-or hover:bg-or/10'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-[5vw] pb-32">
        <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-20">
          {filteredProducts.map((product, index) => (
            <Link key={product.id} to={`/boutique/produit/${product.id}`} className="product-item group block">
              <div className="relative overflow-hidden aspect-[4/5] mb-4 md:mb-8 bg-sable/10 border-2 border-ivoire/50 group-hover:border-or transition-all duration-500">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                  <span className="btn-premium translate-y-10 group-hover:translate-y-0 transition-transform duration-700 ease-out text-xs md:text-sm px-4 md:px-10 py-2 md:py-5">
                    Découvrir
                  </span>
                </div>
                {!product.available && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-rouge-rituel text-ivoire px-3 py-1 md:px-4 md:py-1 text-[0.55rem] md:text-xs uppercase tracking-widest">
                    Epuisé
                  </div>
                )}
              </div>
              <div>
                <span className="text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.2em] md:tracking-[0.3em] text-or font-bold block mb-1 md:mb-2">
                  {product.category}
                </span>
                <h3 className="font-playfair text-lg md:text-3xl font-black mb-2 md:mb-3 group-hover:text-or transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-xs md:text-sm opacity-70 mb-3 md:mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                <p className="font-playfair text-sm md:text-xl font-bold">{product.price.toLocaleString('fr-FR')} FCFA</p>
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

      {/* Footer */}
      <footer data-bg-color="#1A1410" className="bg-noir text-ivoire pt-20 md:pt-32 pb-8 md:pb-16 border-t border-ivoire/10">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-24">
            <div>
              <h2 className="font-playfair text-xl md:text-3xl font-black text-or mb-4 md:mb-8 tracking-tighter">
                VODUN<br />CONCEPT STORE
              </h2>
              <p className="text-ivoire/80 text-sm md:text-xl leading-relaxed mb-4 md:mb-10">
                Ouidah, Bénin
              </p>
              <p className="text-ivoire/60 text-sm md:text-xl leading-relaxed">
                Là où le sacré devient désirable.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-12">
              <div>
                <h4 className="section-label mb-4 md:mb-8 text-ivoire/100 text-[0.55rem] md:text-[0.7rem]">Menu</h4>
                <ul className="space-y-2 md:space-y-4">
                  <li><Link to="/boutique" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Boutique</Link></li>
                  <li><Link to="/a-propos" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Héritage</Link></li>
                  <li><Link to="/pantheon" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Panthéon</Link></li>
                  <li><Link to="/projets-pro" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Projets Pro</Link></li>
                  <li><Link to="/contact" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Contact</Link></li>
                  <li><Link to="/compte" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Mon Compte</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="section-label mb-4 md:mb-8 text-[0.55rem] md:text-[0.7rem]">Réseaux</h4>
                <ul className="space-y-2 md:space-y-4">
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Instagram</li>
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">Facebook</li>
                  <li className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or cursor-pointer transition-colors">LinkedIn</li>
                </ul>
                <div className="mt-6 md:mt-10">
                  <h4 className="section-label mb-4 md:mb-8 text-[0.55rem] md:text-[0.7rem]">Contact</h4>
                  <p className="text-ivoire text-sm md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em]">contact@vodoun-concept.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 md:pt-12 border-t border-ivoire/20 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
            <p className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em]">
              © 2025 Vodoun Concept Store · Ouidah · Bénin
            </p>
            <div className="flex gap-4 md:gap-8">
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                Mentions Légales
              </span>
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                CGV
              </span>
              <span className="text-ivoire/60 text-xs md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-or cursor-pointer transition-colors">
                Politique de Confidentialité
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
