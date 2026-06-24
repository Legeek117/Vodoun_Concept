import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ALL_PRODUCTS, COLLECTIONS } from '../store';
import ImmersiveProductShowcase from '../components/ImmersiveProductShowcase';

export default function ShopPage() {
  const { collectionId } = useParams();
  const [selected, setSelected] = useState(collectionId || 'all');

  const filteredProducts = selected === 'all'
    ? ALL_PRODUCTS
    : selected.startsWith('univers-')
    ? ALL_PRODUCTS.filter(p => {
      const deity = selected.replace('univers-', '');
      return p.deity?.toLowerCase() === deity.toLowerCase();
    })
    : ALL_PRODUCTS.filter(p => p.category.toLowerCase().includes(selected.toLowerCase().replace('-', ' ')));

  const GridView = () => (
    <div className="max-w-7xl mx-auto px-[5vw] pb-32 pt-8">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-12 gap-y-8 md:gap-y-20">
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
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivoire text-brun">
      {/* Hero section for shop */}
      <div className="bg-noir text-ivoire py-12 md:py-16 pt-32">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label text-or">Boutique</span>
          <h1 className="editorial-heading text-ivoire mb-4">
            Collections Vodun
          </h1>
          <p className="text-ivoire/70 text-sm md:text-xl max-w-2xl mb-8">
            Découvrez nos créations uniques, artisanales et empreintes de l'héritage vodun.
          </p>
          
          <div className="flex flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => setSelected('all')}
              className={`px-4 md:px-8 py-2 md:py-3 border-2 rounded-none uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                selected === 'all' ? 'border-or bg-or text-noir font-bold' : 'border-ivoire/30 text-ivoire/60 hover:border-or hover:text-or hover:bg-or/10'
              }`}
            >
              Tous
            </button>
            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelected(col.id)}
                className={`px-4 md:px-8 py-2 md:py-3 border-2 rounded-none uppercase tracking-widest text-xs md:text-sm transition-all duration-300 ${
                  selected === col.id ? 'border-or bg-or text-noir font-bold' : 'border-ivoire/30 text-ivoire/60 hover:border-or hover:text-or hover:bg-or/10'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      {selected === 'all' ? (
        <ImmersiveProductShowcase />
      ) : (
        <GridView />
      )}

      {/* Footer - only show in grid view or after immersive (simplified) */}
      {selected !== 'all' && (
        <footer data-bg-color="#1A1410" className="bg-noir text-ivoire pt-20 md:pt-32 pb-8 md:pb-16 border-t border-ivoire/10">
          <div className="max-w-7xl mx-auto px-[5vw]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-12 md:mb-24">
              <div>
                <h2 className="font-playfair text-xl md:text-3xl font-black text-or mb-4 md:mb-8 tracking-tighter">
                  VODUN<br />CONCEPT STORE
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6 md:gap-12">
                <div>
                  <ul className="space-y-2 md:space-y-4">
                    <li><Link to="/boutique" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Boutique</Link></li>
                    <li><Link to="/a-propos" className="text-ivoire text-sm md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] hover:text-or transition-colors">Héritage</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}