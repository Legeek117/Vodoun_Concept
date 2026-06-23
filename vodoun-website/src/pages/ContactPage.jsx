import { useEffect } from 'react';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-ivoire">
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="mb-16">
            <span className="section-label">Contact</span>
            <h1 className="editorial-heading text-noir">Nous contacter</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <div className="mb-12">
                <h3 className="font-playfair text-2xl font-bold text-noir mb-6">Boutique Ouidah</h3>
                <p className="text-brun/80 text-lg mb-4">
                  Rue principale, Ouidah, Bénin
                </p>
                <p className="text-brun/80 text-lg mb-4">
                  <a href="mailto:contact@vodoun-concept.com" className="text-or hover:underline">
                    contact@vodoun-concept.com
                  </a>
                </p>
                <p className="text-brun/80 text-lg">
                  <a href="tel:+22900000000" className="text-or hover:underline">
                    +229 00 00 00 00
                  </a>
                </p>
              </div>

              <div className="mb-12">
                <h3 className="font-playfair text-2xl font-bold text-noir mb-6">Heures d'ouverture</h3>
                <p className="text-brun/80 text-lg mb-2">Lundi - Vendredi: 9h00 - 18h00</p>
                <p className="text-brun/80 text-lg mb-2">Samedi: 10h00 - 17h00</p>
                <p className="text-brun/80 text-lg">Dimanche: Fermé</p>
              </div>

              <div>
                <h3 className="font-playfair text-2xl font-bold text-noir mb-6">Réseaux sociaux</h3>
                <div className="flex gap-6">
                  <a href="#" className="text-brun/80 hover:text-or transition-colors text-lg font-bold uppercase tracking-widest">
                    Instagram
                  </a>
                  <a href="#" className="text-brun/80 hover:text-or transition-colors text-lg font-bold uppercase tracking-widest">
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-noir/5 p-8 rounded-2xl">
              <h3 className="font-playfair text-2xl font-bold text-noir mb-8">Envoyez-nous un message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors"
                    placeholder="Votre nom"
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
                  <label className="block text-brun/80 mb-2 font-bold uppercase tracking-widest text-sm">Message</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-ivoire border-2 border-brun/20 focus:border-or focus:outline-none transition-colors resize-none"
                    placeholder="Votre message"
                  ></textarea>
                </div>
                <button type="submit" className="btn-premium w-full">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}