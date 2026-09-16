import { useEffect, useRef, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import Lenis from '@studio-freight/lenis';
import { Canvas } from '@react-three/fiber';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { useSound } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import usePageMeta from '../hooks/usePageMeta';
import EntranceGalaxy from './EntranceGalaxy';

const FRAME_COUNT = 193;
const FRAME_SPEED = 2.0;

export default function CinematicEntrance() {
  const navigate = useNavigate();
  const { playSound } = useSound();
  const { lang } = useLanguage();
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const framesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  usePageMeta({
    title: lang === 'fr' ? 'Initiation' : 'Initiation',
    description: lang === 'fr' 
      ? 'Entrez dans l\'univers Vodun Concept Store. Une expérience cinématique vous attend : héritage ancestral, luxe contemporain et éveil du temple intérieur.'
      : 'Enter the Vodun Concept Store universe. A cinematic experience awaits you: ancestral heritage, contemporary luxury and awakening of the inner temple.',
  });

  const t = {
    initiation: lang === 'fr' ? 'INITIATION' : 'INITIATION',
    discover: lang === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER',
    skip: lang === 'fr' ? 'PASSER L\'INITIATION' : 'SKIP INITIATION',
    welcome: lang === 'fr' ? 'Bienvenue' : 'Welcome',
    welcomeTitle: lang === 'fr' ? 'BIENVENUE AU' : 'WELCOME TO',
    storeTitle: 'VODUN CONCEPT STORE',
    subtitle: lang === 'fr' ? 'Découvrez le temple du sacré' : 'Discover the temple of the sacred',
    heritage: lang === 'fr' ? 'Héritage' : 'Heritage',
    heritageTitle: lang === 'fr' ? 'HÉRITAGE\nANCESTRAL' : 'ANCESTRAL\nHERITAGE',
    heritageText: lang === 'fr' 
      ? 'Chaque objet raconte une histoire séculaire, portée par le souffle des ancêtres.'
      : 'Each object tells a centuries-old story, carried by the breath of the ancestors.',
    design: lang === 'fr' ? 'Design' : 'Design',
    luxuryTitle: lang === 'fr' ? 'LUXE' : 'LUXURY',
    contemporary: lang === 'fr' ? 'CONTEMPORAIN' : 'CONTEMPORARY',
    luxuryText: lang === 'fr'
      ? 'Une vision résolument moderne où le design rencontre la puissance des symboles.'
      : 'A resolutely modern vision where design meets the power of symbols.',
    signature: lang === 'fr' ? 'Signature' : 'Signature',
    awakeningTitle: lang === 'fr' ? 'L\'ÉVEIL DU' : 'AWAKENING OF THE',
    innerTemple: lang === 'fr' ? 'TEMPLE INTÉRIEUR' : 'INNER TEMPLE',
    scrollToEnter: lang === 'fr' ? 'Scrollez pour entrer' : 'Scroll to enter',
  };

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const frames = [];
    const loadFrame = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameIndex = (index + 1).toString().padStart(4, '0');
        img.src = `/frames/entrance/frame_${frameIndex}.webp`;
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / FRAME_COUNT) * 10));
          resolve();
        };
      });
    };

    const phase1 = Array.from({ length: 20 }, (_, i) => loadFrame(i));
    Promise.all(phase1).then(() => {
      framesRef.current = frames;
      const phase2 = Array.from({ length: FRAME_COUNT - 20 }, (_, i) => loadFrame(i + 20));
      Promise.all(phase2);
    });
  }, []);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || !framesRef.current[index]) return;
    const ctx = canvas.getContext('2d');
    const img = framesRef.current[index];
    const cw = window.innerWidth * window.devicePixelRatio;
    const ch = window.innerHeight * window.devicePixelRatio;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  const handleTransition = () => {
    gsap.killTweensOf(window);
    gsap.to('.transition-overlay', {
      opacity: 1,
      duration: 1.0,
      ease: 'power4.inOut',
      onComplete: () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        ScrollTrigger.getAll().forEach(st => st.kill());
        navigate('/accueil');
      },
    });
  };

  useEffect(() => {
    if (isLoading || !isStarted) return;

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Sauvegarde lenis sur window pour que ScrollToTop.jsx puisse le réinitialiser
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (isStarted) {
      const timer = setTimeout(() => {
        gsap.to(window, {
          scrollTo: { y: document.body.scrollHeight, autoKill: false },
          duration: 22,
          ease: 'none',
          onComplete: () => handleTransition()
        });
      }, 500);

      // 1. Initial draw
      drawFrame(0);

      // 2. Frame Scrubbing
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const accelerated = Math.min(p * (FRAME_SPEED * 1.2), 1);
          const index = Math.min(Math.floor(accelerated * (FRAME_COUNT - 1)), FRAME_COUNT - 1);
          if (index !== currentFrame) {
            setCurrentFrame(index);
            requestAnimationFrame(() => drawFrame(index));
          }
          if (p > 0.99) handleTransition();
        }
      });

      // 3. Section Animations
      const sections = gsap.utils.toArray('.scroll-section');
      sections.forEach((section, index) => {
        const children = section.querySelectorAll('.anim-item');
        gsap.set(section, { opacity: 0 });
        ScrollTrigger.create({
          trigger: scrollContainerRef.current,
          start: `${2 + index * 25}% top`,
          end: `${28 + index * 25}% top`,
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            let opacity = Math.sin(p * Math.PI);

            // Keep the last section visible at the end of the scroll
            if (index === sections.length - 1 && p > 0.5) opacity = 1;

            gsap.set(section, {
              opacity: opacity,
              pointerEvents: opacity > 0.5 ? 'auto' : 'none'
            });
            if (p > 0.05 && opacity > 0.1) {
              if (!section.classList.contains('scrolled-in')) section.classList.add('scrolled-in');
            } else if (p < 0.05) {
              if (section.classList.contains('scrolled-in')) section.classList.remove('scrolled-in');
            }
            gsap.set(children, {
              y: 15 * (1 - p),
              opacity: p > 0.1 && p < 0.9 ? 1 : 0
            });
          }
        });
      });

      return () => {
        clearTimeout(timer);
        lenis.destroy();
        delete window.lenis; // Nettoie la référence
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    }
  // currentFrame et handleTransition sont intentionnellement exclus des deps :
  // les inclure re-créerait tous les ScrollTriggers à chaque frame scrollée,
  // causant un jank visuel. handleTransition est stable dans ce contexte.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isStarted, navigate]);

  return (
    <div className="relative bg-[#1A1410]">
      {(isLoading || !isStarted) && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0705]">

          {/* Galaxie en fond de l'écran de chargement */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              style={{ background: 'transparent' }}
            >
              <Suspense fallback={null}>
                <EntranceGalaxy />
              </Suspense>
            </Canvas>
          </div>

          <div className="mb-6 relative text-center flex flex-col items-center z-10">
            <div className="px-12 py-10 bg-black/40 backdrop-blur-xl border border-white/5 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <span className="text-[#D2B98E] font-playfair text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] block opacity-30 blur-xl absolute inset-0">
                VODUN<br /><span className="text-[0.4em] tracking-[0.4em]">CONCEPT STORE</span>
              </span>
              <span className="text-white font-playfair text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] block relative z-10 animate-pulse drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
                VODUN<br /><span className="text-[0.4em] tracking-[0.4em] text-[#D2B98E]">CONCEPT STORE</span>
              </span>
            </div>
          </div>

          {loadProgress < 10 ? (
            <div className="flex flex-col items-center z-10 relative">
              <div className="w-64 md:w-80 h-[1px] bg-white/5 relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D2B98E] to-transparent transition-all duration-300 ease-out"
                  style={{ width: `${loadProgress * 10}%` }} />
              </div>
              <div className="flex justify-center w-80 text-[10px] uppercase tracking-[0.5em] font-bold text-[#D2B98E]/60 font-playfair">
                <span>{t.initiation}... {loadProgress}/10</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 z-10 relative">
              <button
                onClick={() => {
                  playSound();
                  setIsStarted(true);
                  setIsLoading(false);
                }}
                className="group relative px-12 py-6 border border-white/30 overflow-hidden transition-all duration-700 hover:border-[#D2B98E] shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black/70 backdrop-blur-md"
              >
                <div className="absolute inset-x-0 inset-y-0 bg-[#D2B98E]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-white text-xs md:text-sm uppercase tracking-[0.6em] font-bold transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                  {t.discover}
                </span>
              </button>
              <button
                onClick={() => {
                  playSound();
                  handleTransition();
                }}
                className="relative text-white/70 hover:text-[#D2B98E] text-[11px] uppercase tracking-[0.45em] font-semibold transition-colors duration-300 px-4 py-2"
                style={{ textShadow: '0 0 12px rgba(0,0,0,1), 0 0 24px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,1)' }}
              >
                <span className="relative z-10">{t.skip}</span>
                {/* Fond sombre derrière le texte pour lisibilité garantie */}
                <span className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-sm -z-0" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-0 w-full h-full z-10 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full object-cover opacity-100"
          style={{ filter: 'contrast(1.1) brightness(0.8)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1410]/20 via-transparent to-[#1A1410]/60" />
      </div>

      <div className="transition-overlay fixed inset-0 bg-[#0A0705] opacity-0 pointer-events-none z-[90]" />

      <div ref={scrollContainerRef} className="relative h-[900vh] z-50">
        {/* Section 1 - Welcome - Centrée */}
        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="text-center w-full max-w-7xl flex flex-col items-center">
            <div className="bg-[#1A1410]/60 backdrop-blur-md border border-white/10 py-12 px-8 md:px-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <span className="section-label mb-8">{t.welcome}</span>
              <h1 className="editorial-heading text-white">{t.welcomeTitle}<br /><span className="text-[#D2B98E]">{t.storeTitle}</span></h1>
              <p className="font-playfair text-xl mt-10 text-white/60 tracking-[0.3em] uppercase">{t.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Section 2 - Héritage Ancestral - Centrée */}
        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="bg-[#1A1410]/60 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full">
              <span className="section-label mb-6 text-center block">{t.heritage}</span>
              <h2 className="font-playfair text-[clamp(2.5rem,6vw,8rem)] font-black leading-[0.95] text-white uppercase mb-8 text-center whitespace-pre-line">
                {t.heritageTitle}
              </h2>
              <p className="font-playfair text-xl md:text-2xl text-white/80 leading-relaxed text-center mx-auto max-w-2xl">
                {t.heritageText}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - Luxe Contemporain - Centrée */}
        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="bg-[#1A1410]/60 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full">
              <span className="section-label mb-6 text-center block">{t.design}</span>
              <h2 className="font-playfair text-[clamp(2.5rem,6vw,8rem)] font-black leading-[0.95] text-white uppercase mb-8 text-center">
                {t.luxuryTitle}<br /><span className="text-[#D2B98E]">{t.contemporary}</span>
              </h2>
              <p className="font-playfair text-xl md:text-2xl text-white/80 leading-relaxed text-center mx-auto max-w-2xl">
                {t.luxuryText}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 - Temple Intérieur - Centrée */}
        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="text-center w-full max-w-5xl flex flex-col items-center">
            <div className="bg-[#1A1410]/60 backdrop-blur-md border border-white/10 py-12 px-8 md:px-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <span className="section-label mb-8">{t.signature}</span>
              <h2 className="font-playfair text-[clamp(2.5rem,5vw,7rem)] font-black leading-none text-white uppercase mb-12 whitespace-pre-line">
                {t.awakeningTitle}<br /><span className="text-[#D2B98E]">{t.innerTemple}</span>
              </h2>
              <div className="mt-12 flex justify-center items-center flex-col gap-4">
                <span className="text-[10px] uppercase tracking-[0.5em] text-white/40">{t.scrollToEnter}</span>
                <div className="w-px h-16 bg-gradient-to-b from-[#D2B98E] to-transparent animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .editorial-heading { font-size: clamp(3rem, 11vw, 9rem); line-height: 0.85; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase; word-break: break-word; }
        .section-label { display: block; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5em; font-weight: 800; color: #D2B98E; }
      `}} />
    </div>
  );
}