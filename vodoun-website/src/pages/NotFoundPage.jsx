import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta({ title: 'Page introuvable' });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current.children,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-[5vw]">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />

      <div ref={containerRef} className="text-center relative z-10 max-w-xl">
        {/* Vévé symbol */}
        <div className="mb-8 flex justify-center">
          <svg width="60" height="60" viewBox="0 0 56 56" fill="none" className="opacity-30">
            <circle cx="28" cy="28" r="26" stroke="#B8860B" strokeWidth="0.8" />
            <circle cx="28" cy="28" r="18" stroke="#B8860B" strokeWidth="0.6" />
            <line x1="28" y1="2" x2="28" y2="54" stroke="#B8860B" strokeWidth="0.7" />
            <line x1="2" y1="28" x2="54" y2="28" stroke="#B8860B" strokeWidth="0.7" />
            <polygon points="28,14 38,28 28,42 18,28" stroke="#B8860B" strokeWidth="0.9" fill="none" />
            <circle cx="28" cy="28" r="2.5" fill="#B8860B" fillOpacity="0.65" />
          </svg>
        </div>

        <span className="text-[10px] uppercase tracking-[0.5em] text-or/50 font-bold block mb-4">
          Erreur 404
        </span>

        <h1 className="font-playfair text-4xl md:text-6xl font-black text-ivoire mb-6 leading-tight">
          Ce chemin n'existe pas
        </h1>

        <p className="text-ivoire/50 text-sm md:text-base font-playfair leading-relaxed mb-12">
          La page que vous cherchez s'est perdue dans les méandres du cosmos Vodun.
          Retournez à l'origine.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/accueil" className="btn-premium">
            Retour à l'accueil
          </Link>
          <Link
            to="/boutique"
            className="inline-block px-10 py-5 border border-ivoire/20 text-ivoire/70 font-black uppercase tracking-[0.3em] text-sm hover:border-or hover:text-or transition-all duration-300"
          >
            Explorer la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
