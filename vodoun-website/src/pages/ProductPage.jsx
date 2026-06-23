import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ALL_PRODUCTS, useCart } from '../store';
import gsap from 'gsap';

export default function ProductPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0] || '');
  const [added, setAdded] = useState(false);

  const heroRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(
      heroRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    );
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, { variant: selectedVariant });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-ivoire flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="editorial-heading mb-8">Produit introuvable</h1>
          <Link to="/boutique" className="btn-premium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivoire pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-[5vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div ref={heroRef} className="relative">
            <div className="sticky top-32">
              <div className="bg-sable/20 aspect-[4/5] overflow-hidden">
                {product.video ? (
                  <video
                    src={product.video}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="mt-6 flex gap-4">
                <div className="w-20 h-20 bg-sable/20 border-2 border-or">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-20 bg-sable/20 opacity-60"></div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <nav className="flex items-center gap-2 text-sm uppercase tracking-widest opacity-60 mb-8">
              <Link to="/" className="hover:text-or transition-colors">Accueil</Link>
              <span>/</span>
              <Link to="/boutique" className="hover:text-or transition-colors">Boutique</Link>
              <span>/</span>
              <span className="text-or opacity-100">{product.name}</span>
            </nav>

            <span className="section-label">{product.category} · {product.collection}</span>
            <h1 className="editorial-heading text-noir mb-6">{product.name}</h1>
            <p className="font-playfair text-3xl font-bold text-or mb-8">
              {product.price.toLocaleString('fr-FR')} FCFA
            </p>

            <div className="mb-12">
              <h3 className="font-playfair text-xl font-bold mb-4">Son Histoire</h3>
              <p className="text-lg leading-relaxed opacity-80">{product.story}</p>
            </div>

            <div className="mb-12">
              <h3 className="font-playfair text-xl font-bold mb-4">Détails</h3>
              <p className="opacity-80">{product.description}</p>
            </div>

            {product.variants && (
              <div className="mb-10">
                <h3 className="font-playfair text-xl font-bold mb-4">Options</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 border-2 uppercase tracking-widest text-sm transition-all duration-300 ${
                        selectedVariant === variant ? 'border-or text-or font-bold' : 'border-brun/30 text-brun/70 hover:border-brun'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-12">
              <h3 className="font-playfair text-xl font-bold mb-4">Quantité</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-brun flex items-center justify-center text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                >
                  -
                </button>
                <span className="w-16 text-center text-2xl font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-brun flex items-center justify-center text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.available}
                className={`btn-premium text-center w-full py-5 text-base ${!product.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {added ? 'Ajouté au panier ✦' : product.available ? 'Ajouter au panier' : 'Indisponible'}
              </button>
              <Link to="/boutique" className="btn-premium-outline text-center w-full py-5 text-base bg-transparent">
                Continuer mes achats
              </Link>
            </div>

            {product.deity && (
              <div className="mt-16 pt-12 border-t border-brun/10">
                <span className="section-label">Univers</span>
                <h3 className="font-playfair text-2xl font-bold mt-2">
                  {product.deity === 'Tous' ? 'Toutes les divinités' : product.deity}
                </h3>
                <Link to="/boutique/univers-legba" className="text-or hover:underline mt-2 inline-block">
                  Découvrir la collection {product.deity} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
