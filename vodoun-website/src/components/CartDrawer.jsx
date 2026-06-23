import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store';
import gsap from 'gsap';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, totalItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.5,
        ease: 'power3.out',
      });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
      });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'power3.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
      });
      document.body.style.overflow = 'auto';
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
        className="fixed inset-0 bg-noir/70 z-[998] opacity-0 pointer-events-none"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-ivoire z-[999] shadow-2xl flex flex-col"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="p-8 border-b border-brun/10 flex items-center justify-between">
          <h2 className="font-playfair text-3xl font-bold text-noir">
            Panier ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-noir/70 hover:text-or transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-grow overflow-y-auto p-8">
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full">
              <span className="text-6xl mb-6">✦</span>
              <h3 className="font-playfair text-2xl text-noir mb-4">Panier vide</h3>
              <p className="text-brun/70 mb-8">Découvrez nos collections</p>
              <Link
                to="/boutique"
                onClick={onClose}
                className="btn-premium"
              >
                Aller à la boutique
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-6 pb-8 border-b border-brun/10">
                  <div className="w-24 h-24 flex-shrink-0 bg-sable/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-playfair text-xl font-bold truncate">{item.name}</h3>
                      <p className="font-playfair font-bold text-or whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <p className="text-sm text-brun/60 mb-3">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-9 h-9 border-2 border-brun flex items-center justify-center text-lg font-bold hover:border-or hover:text-or transition-all duration-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-lg font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-9 h-9 border-2 border-brun flex items-center justify-center text-lg font-bold hover:border-or hover:text-or transition-all duration-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-xs uppercase tracking-widest text-brun/60 hover:text-or transition-colors"
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

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-8 border-t border-brun/10 bg-ivoire">
            <div className="space-y-6 mb-8">
              <div className="flex justify-between pb-4 border-b border-brun/10">
                <span className="text-brun/80">Sous-total</span>
                <span className="font-bold">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-brun/10">
                <span className="text-brun/80">Livraison</span>
                <span className="font-bold text-or">Sur demande</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold uppercase tracking-widest">Total</span>
                <span className="font-playfair text-2xl font-bold text-or">
                  {totalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="btn-premium w-full mb-4"
            >
              Commander
            </button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-brun/60 hover:text-or transition-colors uppercase tracking-widest"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-noir/90 z-[1000] flex items-center justify-center p-8">
          <div className="bg-ivoire max-w-2xl w-full p-12 rounded-xl">
            <h2 className="editorial-heading text-noir mb-8 text-3xl">Commande en cours</h2>
            <p className="text-brun/80 mb-10 text-lg">
              Cette fonctionnalité sera disponible très prochainement. Contactez-nous directement pour toute commande.
            </p>
            <div className="flex gap-6">
              <button onClick={() => setIsCheckingOut(false)} className="btn-premium-outline flex-grow">
                Retour
              </button>
              <a href="mailto:contact@vodoun-concept-store.com" className="btn-premium flex-grow text-center">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
