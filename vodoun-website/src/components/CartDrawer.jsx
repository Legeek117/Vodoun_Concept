import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store';
import gsap from 'gsap';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, totalItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const itemsContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Unlock body scroll and animate drawer in
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();

      // Overlay fade
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0);

      // Drawer 3D opening
      tl.fromTo(drawerRef.current,
        {
          x: '100%',
          rotateY: 25,
          transformPerspective: 1200,
          opacity: 0.9
        },
        {
          x: '0%',
          rotateY: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power4.out'
        }, 0);

      // Stagger items entrance
      const itemCards = itemsContainerRef.current?.querySelectorAll('.cart-item-card');
      if (itemCards?.length > 0) {
        tl.fromTo(itemCards,
          { y: 30, opacity: 0, rotateX: 10 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out'
          }, "-=0.4"
        );
      }
    } else {
      // Animate out
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = 'auto';
        }
      });

      tl.to(drawerRef.current, {
        x: '100%',
        rotateY: 15,
        opacity: 0.8,
        duration: 0.5,
        ease: 'power3.in'
      });

      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4
      }, 0.1);
    }
  }, [isOpen]);

  const handleOverlayClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-noir/80 z-[998] opacity-0 backdrop-blur-[2px]"
        style={{ pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.4s' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-[480px] lg:w-[540px] bg-[#1A1410] z-[999] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col border-l border-or/20 overflow-hidden"
        style={{ transform: 'translateX(100%)', transformOrigin: 'right center' }}
      >
        {/* Header with Glass Gradient */}
        <div className="relative p-6 md:p-8 border-b border-or/20 flex items-center justify-between z-10 bg-gradient-to-b from-noir to-transparent">
          <div>
            <span className="text-[9px] uppercase tracking-[0.4em] text-or/50 mb-1 block">Votre Sélection</span>
            <h2 className="font-playfair text-2xl md:text-3xl font-bold text-ivoire flex items-center gap-3">
              <span className="text-or">✦</span> Panier <span className="text-or/40">({totalItems})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-or/20 flex items-center justify-center text-ivoire hover:bg-or hover:text-noir transition-all duration-500 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 scrollbar-hide" ref={itemsContainerRef}>
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full py-12">
              <div className="w-24 h-24 rounded-full bg-or/5 flex items-center justify-center mb-6 border border-or/10">
                <span className="text-4xl text-or/30">✦</span>
              </div>
              <h3 className="font-playfair text-2xl text-ivoire mb-3">Votre panier est vide</h3>
              <p className="text-ivoire/40 text-sm uppercase tracking-widest mb-8 max-w-[200px] leading-relaxed italic">
                L'héritage attend d'être emporté...
              </p>
              <Link
                to="/boutique"
                onClick={onClose}
                className="btn-premium w-full max-w-[200px]"
              >
                Explorer
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="cart-item-card group flex flex-col sm:flex-row gap-4 md:gap-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-or/30 transition-all duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Image with Glow */}
                  <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 bg-noir rounded-xl overflow-hidden relative border border-white/10 group-hover:border-or/50 transition-colors duration-500">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/40 to-transparent" />
                  </div>

                  {/* Details */}
                  <div className="flex-grow flex flex-col justify-between min-w-0 py-1">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-playfair text-lg md:text-xl font-bold text-ivoire truncate pr-2">{item.name}</h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-or/60 mt-0.5">{item.category}</p>
                      </div>
                      <p className="font-playfair font-black text-or whitespace-nowrap text-right">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} <span className="text-[10px] ml-0.5">FCFA</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-noir/40 rounded-lg border border-white/5 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-ivoire/40 hover:text-or transition-colors font-bold text-xl"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-black text-ivoire">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-ivoire/40 hover:text-or transition-colors font-bold text-lg"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-[9px] uppercase tracking-[0.3em] text-ivoire/20 hover:text-rouge-rituel hover:tracking-[0.4em] transition-all duration-300"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Liquid Glass Feel */}
        {cart.length > 0 && (
          <div className="p-6 md:p-8 bg-noir/80 backdrop-blur-xl border-t border-or/20 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] uppercase tracking-[0.3em] text-ivoire">Sous-total</span>
                <span className="text-sm font-bold text-ivoire">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] uppercase tracking-[0.3em] text-ivoire">Livraison</span>
                <span className="text-[10px] uppercase font-black text-or">Sur demande</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-white/5">
                <span className="text-xs uppercase tracking-[0.4em] font-black text-or">Total</span>
                <div className="text-right leading-none">
                  <span className="font-playfair text-3xl md:text-4xl font-black text-or">
                    {totalPrice.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[10px] text-or font-bold ml-1 tracking-widest">FCFA</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="group relative w-full py-4 rounded-xl font-bold uppercase tracking-[0.4em] text-sm overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #B8860B 0%, #8a6208 100%)',
                color: '#F4F0E6',
                boxShadow: '0 10px 40px rgba(184,134,11,0.3)',
              }}
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative">Passer la commande</span>
            </button>

            <button
              onClick={clearCart}
              className="w-full text-[9px] text-ivoire/30 hover:text-or transition-colors uppercase tracking-[0.5em] mt-6"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal (Enhanced) */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-noir/95 z-[1000] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1A1410] border border-or/30 max-w-xl w-full p-8 md:p-12 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Glow decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-or/5 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full border border-or/20 flex items-center justify-center mb-8 mx-auto">
                <span className="text-2xl text-or animate-pulse">✦</span>
              </div>
              <h2 className="editorial-heading text-ivoire mb-6 text-2xl md:text-4xl text-center">Rituel en attente</h2>
              <p className="text-ivoire/60 mb-10 text-center text-sm md:text-lg leading-relaxed font-playfair italic">
                Notre système de paiement est en cours de consécration. Pour finaliser votre acquisition dès maintenant, notre équipe vous accompagne personnellement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setIsCheckingOut(false)} className="px-8 py-4 rounded-xl border border-ivoire/10 text-ivoire text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ivoire hover:text-noir transition-all duration-500 order-2 sm:order-1 flex-grow">
                  Retour
                </button>
                <a href="mailto:contact@VODUN-concept.com" className="btn-premium flex-grow text-center order-1 sm:order-2">
                  Nous Contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
