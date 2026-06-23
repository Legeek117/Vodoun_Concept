import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ALL_PRODUCTS } from '../store';

gsap.registerPlugin(ScrollTrigger);

const divinities = [
  {
    name: 'DAN',
    title: 'Le Serpent',
    color: '#1C4A66',
    description: 'Spirales · Indigo · Turquoise',
    story: 'Dan, le serpent, symbolise la fluidité et la protection. Il représente la connexion entre le monde des vivants et des esprits.',
  },
  {
    name: 'LEGBA',
    title: 'Le Gardien',
    color: '#8E2420',
    description: 'Croisements · Rouge · Noir',
    story: 'Legba est le gardien des carrefours et des portes. Il est le messager entre les humains et les divinités.',
  },
  {
    name: 'SAKPATA',
    title: 'La Terre',
    color: '#20603C',
    description: 'Formes organiques · Brun · Vert',
    story: 'Sakpata règne sur la terre, l’abondance et la guérison. Il protège les récoltes et les familles.',
  },
  {
    name: 'OGOU',
    title: 'Le Fer',
    color: '#8B0000',
    description: 'Angles · Rouge sang · Or',
    story: 'Ogou est la divinité du fer, de la force et du travail. Il inspire courage et détermination.',
  },
  {
    name: 'MAMI WATA',
    title: 'L’Eau',
    color: '#4A1942',
    description: 'Courbes · Violet · Or nacré',
    story: 'Mami Wata incarne la beauté, les eaux et la prospérité. Elle apporte chance et harmonie.',
  },
  {
    name: 'XEVIOSO',
    title: 'La Foudre',
    color: '#FFD700',
    description: 'Éclairs · Blanc · Noir',
    story: 'Xevioso est la divinité de la foudre et du tonnerre. Il symbolise la puissance divine.',
  },
];

export default function PantheonPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.animate-in'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          },
        }
      );
    }
  }, []);

  const productsByDeity = (deityName) => {
    return ALL_PRODUCTS.filter(
      (p) => p.deity?.toLowerCase() === deityName.toLowerCase() || p.deity === 'Tous'
    ).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire" ref={containerRef}>
      {/* Hero */}
      <section className="pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <span className="section-label animate-in">Héritage</span>
          <h1 className="editorial-heading mb-12 animate-in">Le Panthéon Vodun</h1>
          <p className="editorial-body text-ivoire/70 max-w-3xl animate-in">
            Découvrez les divinités qui inspirent nos créations. Chaque symbole raconte une histoire millénaire.
          </p>
        </div>
      </section>

      {/* Divinités Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-[5vw]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {divinities.map((deity, i) => (
              <div key={i} className="animate-in">
                <div
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl"
                  style={{ backgroundColor: deity.color }}
                >
                  <div className="absolute inset-0 bg-noir/30" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <span className="text-[0.6rem] uppercase tracking-[0.4em] text-ivoire/70 block mb-4">
                      {deity.title}
                    </span>
                    <h3 className="font-playfair text-4xl font-black text-ivoire mb-6">{deity.name}</h3>
                    <p className="text-ivoire/80 text-sm mb-8">{deity.story}</p>
                    <p className="text-sm text-ivoire/60 mb-8">{deity.description}</p>
                  </div>
                </div>

                {/* Produits liés */}
                <div className="mt-6">
                  <h4 className="font-playfair text-xl font-bold mb-4">
                    Collections {deity.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {productsByDeity(deity.name).map((product, j) => (
                      <Link
                        key={j}
                        to={`/boutique/produit/${product.id}`}
                        className="aspect-square bg-sable/20 overflow-hidden rounded-lg hover:scale-105 transition-transform"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}