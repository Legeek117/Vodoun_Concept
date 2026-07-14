import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ALL_PRODUCTS, useCart } from '../store';
import { useCurrency } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import SoundControl from '../components/SoundControl';
import FloatingCart from '../components/FloatingCart';

export default function ProductPage3D() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const product = ALL_PRODUCTS.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || 'Default');
  const [added, setAdded] = useState(false);

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
        <div className="text-center px-4">
          <h1 className="editorial-heading mb-8">Produit introuvable</h1>
          <Link to="/boutique" className="btn-premium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar currentPath="/boutique" />

      {/* Bouton retour fixe — toujours visible en haut à gauche */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-20 left-4 md:left-8 z-[900] flex items-center gap-2 px-4 py-2.5 bg-noir/80 backdrop-blur-md border border-ivoire/20 text-ivoire hover:border-or hover:text-or transition-all duration-300 group"
        aria-label="Retour"
      >
        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold hidden sm:block">Retour</span>
      </button>

      <div className="relative w-full min-h-screen bg-[#1A1410] overflow-x-hidden">
        <div className="flex flex-col md:flex-row w-full min-h-screen">

          {/* Left Panel - Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-[8vw] md:px-12 lg:px-24 py-32 md:py-20 order-2 md:order-1">
            <nav className="flex flex-wrap items-center gap-2 text-[10px] md:text-sm uppercase tracking-widest opacity-60 mb-8 md:mb-12 text-ivoire">
              <Link to="/accueil" className="hover:text-or transition-colors">Accueil</Link>
              <span>/</span>
              <Link to="/boutique" className="hover:text-or transition-colors">Boutique</Link>
              <span>/</span>
              <span className="text-or opacity-100">{product.name}</span>
            </nav>

            <span className="text-or text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              {product.category}
            </span>
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-7xl font-bold text-ivoire mb-6 leading-tight">
              {product.name}
            </h1>

            <p className="text-ivoire/70 text-sm md:text-base lg:text-lg mb-8 leading-relaxed max-w-md">
              {product.story}
            </p>


            {product.hasCertificate && (
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-or/30 rounded-lg bg-or/5 text-or">
                <span>✦</span>
                <span className="text-xs font-bold uppercase tracking-widest">Certificat de symbolique inclus</span>
              </div>
            )}

            {product.isNumbered && (
              <div className="inline-flex items-center gap-2 mb-6 ml-2 px-4 py-2 border border-or/30 rounded-lg bg-or/20 text-or font-bold">
                <span className="text-xs uppercase tracking-widest">Édition Numérotée</span>
              </div>
            )}

            <div className="flex flex-col gap-2 mb-10">
              <p className="font-playfair text-2xl md:text-4xl font-bold text-or">
                {formatPrice(product.price)}
              </p>
              {product.delay && (
                <p className="text-ivoire/60 text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-or"></span> Fabrication : {product.delay}
                </p>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-10">
                <h3 className="font-playfair text-xl md:text-2xl font-bold text-ivoire mb-4">
                  Personnalisation
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${selectedVariant === variant
                          ? 'border-or text-noir bg-or font-bold'
                          : 'border-ivoire/30 text-ivoire/70 hover:border-or hover:text-or'
                        }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-10">
              {!product.isCustomOrder && (
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-ivoire text-xl md:text-2xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                  >
                    +
                  </button>
                </div>
              )}

              {product.isCustomOrder ? (
                <button
                  onClick={() => navigate('/projets-pro')}
                  className="flex-1 min-w-[200px] px-8 py-5 bg-transparent border border-or text-or font-playfair font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-or hover:text-noir transition-all duration-300"
                >
                  Demander un devis
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={`flex-1 min-w-[200px] px-8 py-5 bg-or text-noir font-playfair font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-ivoire hover:text-or transition-all duration-300 shadow-[0_10px_30px_rgba(184,134,11,0.2)] ${!product.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {added ? 'Ajouté ✦' : 'Ajouter au panier'}
                </button>
              )}
            </div>

            <Link to="/boutique" className="text-or/70 hover:text-or text-xs md:text-sm uppercase tracking-widest transition-colors inline-block text-center sm:text-left">
              ← Retour à la boutique
            </Link>
          </div>

          {/* Right Panel - Product Image */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative order-1 md:order-2">
            <div className="absolute inset-0">
              <img
                src={product.image}
                alt=""
                className="w-full h-full object-cover blur-[40px] scale-[1.2] opacity-40"
              />
              <div className="absolute inset-0 bg-[#1A1410]/40" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 lg:p-24">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        </div>
      </div>
      <SoundControl />
      <FloatingCart />
    </>
  );
}