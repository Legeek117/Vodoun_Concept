import { useEffect } from 'react';

export default function B2BPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-ivoire">
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="mb-16">
            <span className="section-label">Projets professionnels</span>
            <h1 className="editorial-heading text-noir">Pour les professionnels</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div>
              <h3 className="font-playfair text-3xl font-bold text-noir mb-6">Nous collaborons avec vous</h3>
              <p className="text-brun/80 text-lg mb-8">
                Que vous soyez hôtelier, restaurateur, propriétaire de lieux événementiels ou dirigeant d'entreprise, nous créons des installations sur mesure qui apportent une touche unique et authentique à vos espaces.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-or text-2xl">✦</div>
                  <div>
                    <h4 className="font-playfair text-xl font-bold text-noir">Installations lumineuses</h4>
                    <p className="text-brun/70">Décorations monumentales pour vos espaces.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-or text-2xl">✦</div>
                  <div>
                    <h4 className="font-playfair text-xl font-bold text-noir">Collections exclusives</h4>
                    <p className="text-brun/70">Objets décoratifs et mobilier sur mesure.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-or text-2xl">✦</div>
                  <div>
                    <h4 className="font-playfair text-xl font-bold text-noir">Événements & ceremonies</h4>
                    <p className="text-brun/70">Décorations et animations pour vos événements.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Quote Form */}
            <div className="bg-noir/5 p-8 rounded-2xl">
              <h3 className="font-playfair text-2xl font-bold text-noir mb-8">Demandez un devis</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Nom complet</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Entreprise</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors"
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors"
                    placeholder="Votre email"
                  />
                </div>
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Type de projet</label>
                  <select className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors">
                    <option>Hôtel / Hébergement</option>
                    <option>Restaurant / Bar</option>
                    <option>Bureaux / Coworking</option>
                    <option>Événementiel</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Description</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors resize-none"
                    placeholder="Décrivez votre projet..."
                  ></textarea>
                </div>
                <button type="submit" className="btn-premium w-full">
                  Envoyer la demande
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}