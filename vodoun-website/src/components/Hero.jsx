import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state
    gsap.set([titleRef.current.children], { y: '100%', opacity: 0 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
    gsap.set(ctaRef.current, { opacity: 0, scale: 0.9 });
    gsap.set(gridRef.current, { opacity: 0 });

    tl.to(gridRef.current, { opacity: 0.15, duration: 2, ease: 'power2.inOut' })
      .to(
        titleRef.current.children,
        {
          y: '0%',
          opacity: 1,
          duration: 1.5,
          stagger: 0.1,
          ease: 'expo.out',
        },
        '-=1'
      )
      .to(
        subtitleRef.current,
        {
          opacity: 0.6,
          y: 0,
          duration: 1,
          ease: 'power3.out',
        },
        '-=0.8'
      )
      .to(
        ctaRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '-=0.5'
      );

    return () => tl.kill();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-noir overflow-hidden pb-32">
      {/* Background grid */}
      <div ref={gridRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#B8860B_1px,transparent_1px),linear-gradient(to_bottom,#B8860B_1px,transparent_1px)] bg-[size:4vw_4vw] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir"></div>
      </div>

      <div className="relative z-10 text-center px-[5vw] pt-20">
        <span className="section-label mb-8">V O D O U N · C O N C E P T · S T O R E</span>
        
        <h1 ref={titleRef} className="editorial-heading text-ivoire mb-8 overflow-hidden">
          <span className="block">Là où le</span>
          <span className="block text-or italic">sacré</span>
          <span className="block">devient</span>
          <span className="block">désirable</span>
        </h1>
        
        <p ref={subtitleRef} className="editorial-body text-ivoire/80 max-w-xl mx-auto mb-16 uppercase tracking-[0.3em] text-sm">
          Expérience immersive · Artisanat de Ouidah
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link to="/accueil" className="btn-premium">
            Entrer dans la boutique
          </Link>
          <Link to="/#pantheon" className="btn-premium bg-transparent text-ivoire border-ivoire hover:bg-ivoire hover:text-noir">
            Notre héritage
          </Link>
        </div>
      </div>

      {/* Side labels */}
      <div className="absolute left-[5vw] bottom-[10vh] hidden lg:block overflow-hidden">
        <span className="block text-[0.6rem] text-or/50 uppercase tracking-[0.5em] origin-left -rotate-90">
          EST. 2025 · OUIDAH · BÉNIN
        </span>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-[0.6rem] text-ivoire/40 uppercase tracking-[0.3em]">Défiler pour explorer</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-or to-transparent"></div>
      </div>
    </section>
  );
}
