import { useEffect, useState } from 'react';
import { useCart } from '../store';

export default function ComptePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cart, totalItems, totalPrice } = useCart();

  // Mock user data
  const user = {
    name: 'Akouvi',
    email: 'akouvi@example.com',
    phone: '+229 01 23 45 67',
    address: 'Rue principale, Ouidah, Bénin',
  };

  const orders = [
    {
      id: '#VC-00123',
      date: '15 Juin 2026',
      status: 'Livré',
      total: 85000,
    },
    {
      id: '#VC-00118',
      date: '02 Juin 2026',
      status: 'En cours',
      total: 180000,
    },
  ];

  return (
    <div className="min-h-screen bg-ivoire pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-[5vw]">
        <span className="section-label">Espace client</span>
        <h1 className="editorial-heading text-noir mb-12">Mon Compte</h1>

        {isLoggedIn ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info Profile */}
            <div className="lg:col-span-1">
              <div className="bg-noir/5 p-8 rounded-2xl">
                <h3 className="font-playfair text-2xl font-bold text-noir mb-8">
                  Mes informations
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-brun/60 uppercase tracking-widest mb-1">
                      Nom
                    </p>
                    <p className="text-brun font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brun/60 uppercase tracking-widest mb-1">
                      Email
                    </p>
                    <p className="text-brun font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brun/60 uppercase tracking-widest mb-1">
                      Téléphone
                    </p>
                    <p className="text-brun font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brun/60 uppercase tracking-widest mb-1">
                      Adresse
                    </p>
                    <p className="text-brun font-medium">{user.address}</p>
                  </div>
                </div>
                <button className="btn-premium-outline w-full mt-8">
                  Modifier mes informations
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full mt-4 text-sm text-brun/60 uppercase tracking-widest hover:text-brun transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>

            {/* Commandes */}
            <div className="lg:col-span-2">
              <div className="bg-noir/5 p-8 rounded-2xl">
                <h3 className="font-playfair text-2xl font-bold text-noir mb-8">
                  Mes commandes
                </h3>
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-ivoire border border-brun/10 rounded-xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <p className="font-bold text-brun">{order.id}</p>
                            <span
                              className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full ${
                                order.status === 'Livré'
                                  ? 'bg-vert-sakpata/20 text-vert-sakpata'
                                  : 'bg-or/20 text-or'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-brun/60">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-playfair text-2xl font-bold text-or">
                            {order.total.toLocaleString('fr-FR')} FCFA
                          </p>
                          <button className="text-sm text-brun/60 uppercase tracking-widest hover:text-or transition-colors mt-2">
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-noir/5 p-12 rounded-2xl">
            <h2 className="font-playfair text-2xl font-bold text-noir mb-8 text-center">
              Se connecter
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-ivoire border border-brun/20 focus:border-or focus:outline-none transition-colors"
                  placeholder="Votre email"
                />
              </div>
              <div>
                <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-ivoire border border-brun/20 focus:border-or focus:outline-none transition-colors"
                  placeholder="Votre mot de passe"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsLoggedIn(true)}
                className="btn-premium w-full"
              >
                Se connecter
              </button>
            </form>
            <p className="text-center text-brun/60 text-sm mt-8">
              Pas encore de compte ?{' '}
              <button className="text-or font-medium hover:underline">
                S'inscrire
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}