import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart, useProducts } from '../store';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';
import Navbar from '../components/Navbar';
import SoundControl from '../components/SoundControl';
import FloatingCart from '../components/FloatingCart';
import usePageMeta from '../hooks/usePageMeta';
import { absUrl, canonicalUrl } from '../config/site';

// Traduction des catégories FR → EN (même logique que ProductCard)
const CATEGORY_EN = {
  'Décorations Festives': 'Festive Decorations',
  'Décorations festives': 'Festive Decorations',
  'Mode': 'Fashion',
  'Mobilier': 'Furniture',
  'Bijoux': 'Jewelry',
  'Accessoires': 'Accessories',
  'Luminaires': 'Lighting',
  'Maroquinerie': 'Leather Goods',
  'Montres': 'Watches',
  'Casquettes': 'Headwear',
};

export default function ProductPage3D() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const products = useProducts();
  const { formatPrice, currency } = useCurrency();
  const { lang } = useLanguage();
  const t = lang === 'fr' ? fr : en;
  const product = products.find((p) => p.id === productId);

  const translateCategory = (cat) => {
    if (!cat) return cat;
    if (lang === 'en') {
      const key = Object.keys(CATEGORY_EN).find(k => cat.toLowerCase().includes(k.toLowerCase()));
      return key ? CATEGORY_EN[key] : cat;
    }
    return cat;
  };

  // Traduit le délai "X à Y semaines" → "X to Y weeks"
  const translateDelay = (delay) => {
    if (!delay || lang === 'fr') return delay;
    return delay
      .replace(/ à /g, ' to ')
      .replace(/semaines?/g, 'weeks')
      .replace(/semaine/g, 'week');
  };
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || 'Default');
  const [added, setAdded] = useState(false);

  usePageMeta({
    title: product ? product.name : t.product.notFound,
    description: product
      ? `${product.story.substring(0, 160)}${product.story.length > 160 ? '…' : ''}`
      : lang === 'fr' ? 'Découvrez nos pièces artisanales Vodun Concept Store.' : 'Discover our Vodun Concept Store artisan pieces.',
  });

  useEffect(() => {
    if (!product) return;

    const priceCurrency = currency === 'XOF' ? 'XOF' : 'EUR';

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.story,
      image: absUrl(encodeURI(product.image)),
      sku: product.id,
      brand: { '@type': 'Brand', name: 'Vodun Concept Store' },
      category: product.category,
      offers: {
        '@type': 'Offer',
        priceCurrency,
        price: product.price,
        availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: canonicalUrl(`/boutique/produit/${product.id}`),
        itemCondition: 'https://schema.org/NewCondition',
      },
    };

    if (product.variants && product.variants.length > 0) {
      jsonLd.hasVariant = product.variants.map((v) => ({
        '@type': 'ProductVariant',
        name: v,
        sku: `${product.id}-${v.replace(/\s+/g, '-').toLowerCase()}`,
        offers: {
          '@type': 'Offer',
          priceCurrency,
          price: product.price,
          availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }));
    }

    if (product.isNumbered) {
      jsonLd.additionalProperty = { '@type': 'PropertyValue', name: 'Édition', value: 'Numérotée' };
    }

    const existing = document.getElementById('vodun-jsonld-product');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'vodun-jsonld-product';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById('vodun-jsonld-product');
      if (s) s.remove();
    };
  }, [product, currency]);

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
          <h1 className="editorial-heading mb-8">{t.product.notFound}</h1>
          <Link to="/boutique" className="btn-premium">{t.product.backBtn}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar currentPath="/boutique" />

      {/* Bouton retour — cercle parfait */}
      <button
        onClick={() => navigate(-1)}
        style={{ borderRadius: '50%' }}
        className="fixed top-20 left-4 md:left-8 z-[900] w-11 h-11 flex items-center justify-center bg-noir/80 backdrop-blur-md border border-ivoire/20 text-ivoire hover:border-or hover:text-or hover:scale-105 transition-all duration-300"
        aria-label={t.product.backBtn}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative w-full min-h-screen bg-[#1A1410] overflow-x-hidden">
        <div className="flex flex-col md:flex-row w-full min-h-screen">

          {/* Left Panel - Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-[8vw] md:px-12 lg:px-24 py-32 md:py-20 order-2 md:order-1">
            <nav className="flex flex-wrap items-center gap-2 text-[10px] md:text-sm uppercase tracking-widest opacity-60 mb-8 md:mb-12 text-ivoire">
              <Link to="/accueil" className="hover:text-or transition-colors">{t.nav.home}</Link>
              <span>/</span>
              <Link to="/boutique" className="hover:text-or transition-colors">{t.nav.collections}</Link>
              <span>/</span>
              <span className="text-or opacity-100">{product.name}</span>
            </nav>

            <span className="text-or text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4 block">
              {translateCategory(product.category)}
            </span>
            <h1 className="font-playfair text-3xl md:text-5xl lg:text-7xl font-bold text-ivoire mb-6 leading-tight">
              {product.name}
            </h1>

            <p className="text-ivoire/70 text-sm md:text-base lg:text-lg mb-8 leading-relaxed max-w-md">
              {lang === 'en' && product.story_en ? product.story_en : product.story}
            </p>

            {product.hasCertificate && (
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-or/30 rounded-lg bg-or/5 text-or">
                <span>✦</span>
                <span className="text-xs font-bold uppercase tracking-widest">{t.product.certificate}</span>
              </div>
            )}

            {product.isNumbered && (
              <div className="inline-flex items-center gap-2 mb-6 ml-2 px-4 py-2 border border-or/30 rounded-lg bg-or/20 text-or font-bold">
                <span className="text-xs uppercase tracking-widest">{t.product.numbered}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 mb-10">
              <p className="font-playfair text-2xl md:text-4xl font-bold text-or">
                {formatPrice(product.price)}
              </p>
              {product.delay && (
                <p className="text-ivoire/60 text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-or" />
                  {t.product.fabrication} : {translateDelay(product.delay)}
                </p>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-10">
                <h3 className="font-playfair text-xl md:text-2xl font-bold text-ivoire mb-4">
                  {t.product.customization}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-xl border text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${selectedVariant === variant
                        ? 'border-or text-noir bg-or font-bold'
                        : 'border-ivoire/30 text-ivoire/70 hover:border-or hover:text-or'}`}
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
                    className="w-12 h-12 rounded-xl border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-ivoire text-xl md:text-2xl font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl border border-ivoire/30 flex items-center justify-center text-ivoire text-xl font-bold hover:border-or hover:text-or transition-all duration-300"
                  >
                    +
                  </button>
                </div>
              )}

              {product.isCustomOrder ? (
                <button
                  onClick={() => navigate('/projets-pro')}
                  className="flex-1 min-w-[200px] px-8 py-5 rounded-2xl bg-transparent border border-or text-or font-playfair font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-or hover:text-noir transition-all duration-300"
                >
                  {t.product.customOrder}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!product.available}
                  className={`flex-1 min-w-[200px] px-8 py-5 rounded-2xl bg-or text-noir font-playfair font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-ivoire hover:text-or transition-all duration-300 shadow-[0_10px_30px_rgba(184,134,11,0.2)] ${!product.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {added ? t.product.added : t.product.addToCart}
                </button>
              )}
            </div>

            <Link to="/boutique" className="text-or/70 hover:text-or text-xs md:text-sm uppercase tracking-widest transition-colors inline-block text-center sm:text-left">
              {t.product.backToShop}
            </Link>
          </div>

          {/* Right Panel - Product Image */}
          <div className="w-full md:w-1/2 h-[55vh] md:h-screen relative order-1 md:order-2">
            <div className="absolute inset-0 top-[72px] md:top-0">
              <img src={product.image} alt="" className="w-full h-full object-cover blur-[40px] scale-[1.2] opacity-40" />
              <div className="absolute inset-0 bg-[#1A1410]/40" />
            </div>
            <div className="absolute inset-0 top-[72px] md:top-0 flex items-center justify-center p-6 md:p-12 lg:p-24">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
        </div>
      </div>
      <SoundControl />
      <FloatingCart />
    </>
  );
}
