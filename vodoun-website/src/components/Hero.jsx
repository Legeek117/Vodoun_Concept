import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import fr from '../i18n/fr';
import en from '../i18n/en';

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const replayRef = useRef(null);
  const gridRef = useRef(null);

  const { lang } = useLanguage();
  const t = lang === 'fr' ? fr : en;

  useEffect(() => {
    const tl = gsap.timeline();

    gsap.set([titleRef.current.children], { y: '100%', opacity: 0 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
    gsap.set(ctaRef.current, { opacity: 0, scale: 0.9 });
    gsap.set(replayRef.current, { opacity: 0, y: 12 });
    gsap.set(gridRef.current, { opacity: 0 });

    tl.to(gridRef.current, { opacity: 0.15, duration: 2, ease: 'power2.inOut' })
      .to(
        titleRef.current.children,
        { y: '0%', opacity: 1, duration: 1.5, stagger: 0.1, ease: 'expo.out' },
        '-=1'
      )
      .to(subtitleRef.current, { opacity: 0.6, y: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
      .to(ctaRef.current, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' }, '-=0.5')
      .to(replayRef.current, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4');

    return () => tl.kill();
  }, []);

  // Titre splitté selon la langue
  const titleLines = lang === 'fr'
    ? ['Là où le', 'sacré', 'devient', 'désirable']
    : ['Where the', 'sacred', 'becomes', 'desirable'];

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-noir overflow-hidden pb-32">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80">
          <source src="/a_Cinematic_macro_anim_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-noir/60 via-transparent to-noir/80 opacity-70" />
        <div className="absolute inset-0 bg-noir/20" />
      </div>

      {/* Background grid */}
      <div ref={gridRef} className="absolute inset-0 pointer-events-none z-1">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#B8860B_1px,transparent_1px),linear-gradient(to_bottom,#B8860B_1px,transparent_1px)] bg-[size:4vw_4vw] opacity-10" />
      </div>

      {/* pt-28 sur mobile pour dégager le header fixe (~72px) + marge confortable */}
      <div className="relative z-10 text-center px-[5vw] pt-28 md:pt-24 lg:pt-32">
        <span className="section-label mb-6 md:mb-10 text-[10px] md:text-sm">
          V O D U N · C O N C E P T · S T O R E
        </span>

        <h1 ref={titleRef} className="editorial-heading text-ivoire mb-6 md:mb-10 overflow-hidden !text-[clamp(3rem,12vw,14rem)]">
          <span className="block">{titleLines[0]}</span>
          <span className="block text-or italic">{titleLines[1]}</span>
          <span className="block">{titleLines[2]}</span>
          <span className="block">{titleLines[3]}</span>
        </h1>

        <p ref={subtitleRef} className="editorial-body text-ivoire/80 max-w-xl mx-auto mb-10 md:mb-20 uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-sm">
          {lang === 'fr'
            ? 'Expérience immersive · Artisanat du Bénin'
            : 'Immersive experience · Beninese craftsmanship'}
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 md:gap-8 justify-center items-center mt-28 md:mt-16">
          <Link
            to="/boutique"
            className="group relative w-full sm:w-auto overflow-hidden
                       text-xs md:text-sm px-10 py-5 font-black uppercase tracking-[0.25em]
                       rounded-2xl transition-all duration-300
                       bg-or text-noir border border-or/80
                       hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(184,134,11,0.55),0_0_8px_rgba(184,134,11,0.35)]
                       hover:border-or active:scale-[0.97]"
          >
            <span aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out
                         bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
            <span className="relative">
              {lang === 'fr' ? 'Collections' : 'Collections'}
            </span>
          </Link>

          <Link
            to="/projets-pro"
            className="group relative w-full sm:w-auto overflow-hidden
                       text-xs md:text-sm px-10 py-5 font-black uppercase tracking-[0.25em]
                       rounded-2xl transition-all duration-300
                       bg-transparent text-ivoire
                       border border-ivoire/40
                       hover:scale-[1.03]
                       hover:border-ivoire/90
                       hover:shadow-[0_0_20px_rgba(244,240,230,0.2),inset_0_0_20px_rgba(244,240,230,0.04)]
                       active:scale-[0.97]"
          >
            <span aria-hidden="true"
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out
                         bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]" />
            <span className="relative">
              {lang === 'fr' ? 'Lancer un projet' : 'Start a project'}
            </span>
          </Link>
        </div>

        {/* Lien revivre l'initiation */}
        <div ref={replayRef} className="mt-8 flex justify-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.35em] text-ivoire/45 hover:text-or transition-colors duration-500 font-bold"
            aria-label={t.home.replay}
          >
            <svg className="w-3.5 h-3.5 transition-transform duration-700 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
            {t.home.replay}
            <span className="w-0 group-hover:w-6 h-px bg-or transition-all duration-500" />
          </Link>
        </div>
      </div>

      {/* Side label */}
      <div className="absolute left-[5vw] bottom-[10vh] hidden lg:block overflow-hidden">
        <span className="block text-[0.6rem] text-or/50 uppercase tracking-[0.5em] origin-left -rotate-90">
          EST. 2025 · OUIDAH · BÉNIN
        </span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="w-[1px] h-20 bg-gradient-to-b from-or to-transparent" />
      </div>
    </section>
  );
}
