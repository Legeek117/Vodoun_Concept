import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../store';
import gsap from 'gsap';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-ivoire pt-32 pb-24 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <span className="text-6xl mb-6 block">✦</span>
          <h1 className="editorial-heading text-noir mb-6">Votre Panier</h1>
          <p className="text-brun/70 text-lg mb-10">Votre panier est vide. Découvrez nos collections.</p>
          <Link to="/boutique" className="btn-premium inline-block">
            Aller à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivoire pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-[5vw]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2">
            <h1 className="editorial-heading text-noir mb-12">Votre Panier</h1>

            <div className="space-y-10">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-8 pb-10 border-b border-brun/10">
                  <div className="w-40 h-40 flex-shrink-0 bg-sable/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start gap-6 mb-4">
                      <div>
                        <h3 className="font-playfair text-2xl font-bold mb-1">{item.name}</h3>
                        <p className="text-sm opacity-60">{item.category}</p>
                        {item.options?.variant && (
                          <p className="text-xs uppercase tracking-widest text-or mt-1">
                            Options: {item.options.variant}
                          </p>
                        )}
                      </div>
                      <p className="font-playfair text-xl font-bold text-or">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="w-10 h-10 border-2 border-brun flex items-center justify-center text-lg font-bold hover:border-or hover:text-or transition-all duration-300"
                        >
                          -
                        </button>
                        <span className="w-10 text-center text-xl font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="w-10 h-10 border-2 border-brun flex items-center justify-center text-lg font-bold hover:border-or hover:text-or transition-all duration-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-sm opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest hover:text-rouge-rituel"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={clearCart}
              className="mt-10 text-sm opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest hover:text-rouge-rituel"
            >
              Vider le panier
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-noir/5 p-10 sticky top-40">
              <h2 className="font-playfair text-2xl font-bold mb-8">Récapitulatif</h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between pb-4 border-b border-brun/10">
                  <span className="opacity-80">Sous-total</span>
                  <span className="font-bold">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-brun/10">
                  <span className="opacity-80">Livraison</span>
                  <span className="font-bold text-or">Sur demande</span>
                </div>
                <div className="flex justify-between pb-4 text-lg">
                  <span className="font-bold uppercase tracking-widest">Total</span>
                  <span className="font-playfair text-2xl font-bold text-or">
                    {totalPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="btn-premium w-full mb-6 text-center"
              >
                Commander
              </button>

              <p className="text-xs opacity-60 text-center leading-relaxed">
                Livraison disponible au Bénin et à l'international. Paiement par Mobile Money ou carte bancaire.
              </p>
            </div>
          </div>
        </div>

        {isCheckingOut && (
          <div className="fixed inset-0 bg-noir/90 z-[100] flex items-center justify-center p-8">
            <div className="bg-ivoire max-w-2xl w-full p-12">
              <h2 className="editorial-heading text-noir mb-8 text-4xl">Commande en cours</h2>
              <p className="opacity-80 mb-10">
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
      </div>
    </div>
  );
}
