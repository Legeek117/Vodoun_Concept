import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const aboutRef = useRef(null);
  const artisansRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (aboutRef.current) {
      gsap.fromTo(
        aboutRef.current.querySelectorAll('.animate-in'),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 70%',
          },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-ivoire">
      <div ref={aboutRef}>
        {/* Hero About */}
        <section className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-[5vw]">
            <span className="section-label animate-in">La marque</span>
            <h1 className="editorial-heading text-noir mb-12 animate-in">Notre histoire</h1>
            <p className="editorial-body text-brun max-w-3xl animate-in">
              Vodun Concept Store est née à Ouidah, au Bénin, berceau du Vodun, une tradition spirituelle et artistique millénaire. Notre mission est de faire rayonner ce patrimoine exceptionnel à travers le monde en créant des œuvres d'art contemporaines, accessibles et empreintes de sens.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-noir text-ivoire" data-bg-color="#1A1410">
          <div className="max-w-7xl mx-auto px-[5vw]">
            <span className="section-label animate-in">Nos valeurs</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              <div className="animate-in">
                <h3 className="font-playfair text-3xl font-bold text-or mb-6">Authenticité</h3>
                <p className="text-ivoire/70 text-lg">
                  Chaque pièce est conçue avec respect pour les traditions et les symboles Vodun, en collaboration étroite avec les artisans et les gardiens du savoir.
                </p>
              </div>
              <div className="animate-in">
                <h3 className="font-playfair text-3xl font-bold text-or mb-6">Excellence</h3>
                <p className="text-ivoire/70 text-lg">
                  Nous sélectionnons les matériaux les plus nobles et travaillons avec des artisans experts pour garantir une qualité exceptionnelle dans chaque détail.
                </p>
              </div>
              <div className="animate-in">
                <h3 className="font-playfair text-3xl font-bold text-or mb-6">Partage</h3>
                <p className="text-ivoire/70 text-lg">
                  Au-delà des objets, nous souhaitons partager la richesse de la culture Vodun à travers des histoires, des événements et des rencontres.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Artisans */}
        <section ref={artisansRef} className="py-24">
          <div className="max-w-7xl mx-auto px-[5vw]">
            <span className="section-label animate-in">L'équipe</span>
            <h2 className="editorial-heading text-noir mb-16 animate-in">Nos artisans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { name: "Kossi A.", role: "Sculpteur bois", desc: "25 ans d'expérience dans la sculpture traditionnelle béninoise." },
                { name: "Akouvi M.", role: "Tisserande", desc: "Maître tisserande spécialisée dans les motifs géométriques Vodun." },
                { name: "Mensah T.", role: "Forgeron", desc: "Expert dans le travail du métal et la création de pièces décoratives lumineuses." }
              ].map((artisan, i) => (
                <div key={i} className="animate-in">
                  <div className="aspect-square bg-sable/20 mb-6 rounded-2xl overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-or/20 to-indigo-dan/20">
                      <div className="text-6xl">👤</div>
                    </div>
                  </div>
                  <h3 className="font-playfair text-2xl font-bold text-noir mb-2">{artisan.name}</h3>
                  <p className="text-or font-bold uppercase tracking-widest text-sm mb-4">{artisan.role}</p>
                  <p className="text-brun/70">{artisan.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}