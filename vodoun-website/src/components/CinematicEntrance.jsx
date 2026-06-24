import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { useSound } from '../context/SoundContext';

const FRAME_COUNT = 193; 
const FRAME_SPEED = 2.0;

export default function CinematicEntrance() {
  const navigate = useNavigate();
  const { playSound } = useSound();
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const framesRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

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
          setLoadProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
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
          if (p > 0.96) handleTransition();
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
            const opacity = Math.sin(p * Math.PI); 
            gsap.set(section, { 
              opacity: opacity,
              pointerEvents: opacity > 0.5 ? 'auto' : 'none'
            });
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
        ScrollTrigger.getAll().forEach(st => st.kill());
      };
    }
  }, [isLoading, isStarted, navigate]);

  return (
    <div className="relative bg-[#1A1410]">
      {(isLoading || !isStarted) && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0705]">
          <div className="mb-12 relative text-center">
            <span className="text-[#B8860B] font-playfair text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] block opacity-20 blur-xl absolute inset-0">
              VODOUN<br/><span className="text-[0.4em] tracking-[0.4em]">CONCEPT</span>
            </span>
            <span className="text-[#B8860B] font-playfair text-[12vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] block relative z-10 animate-pulse">
              VODOUN<br/><span className="text-[0.4em] tracking-[0.4em]">CONCEPT</span>
            </span>
          </div>

          {loadProgress < 100 ? (
            <div className="flex flex-col items-center">
              <div className="w-64 md:w-80 h-[1px] bg-white/5 relative overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent transition-all duration-300 ease-out" 
                     style={{ width: `${loadProgress}%` }} />
              </div>
              <div className="flex justify-center w-80 text-[10px] uppercase tracking-[0.5em] font-bold text-or/60 font-playfair">
                <span>INITIATION... {loadProgress}%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  playSound();
                  setIsStarted(true);
                  setIsLoading(false);
                }}
                className="group relative px-12 py-6 border border-or/40 overflow-hidden transition-all duration-700 hover:border-or shadow-[0_0_30px_rgba(184,134,11,0.2)]"
              >
                <div className="absolute inset-x-0 inset-y-0 bg-or/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-or text-xs md:text-sm uppercase tracking-[0.6em] font-bold">
                  ENTRER DANS LA BOUTIQUE
                </span>
              </button>
              <button 
                onClick={() => {
                  playSound();
                  handleTransition();
                }}
                className="text-white/40 hover:text-white text-[10px] uppercase tracking-[0.4em] transition-colors duration-300"
              >
                PASSER L'INITIATION
              </button>
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-0 w-full h-full z-10 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full object-cover opacity-100" 
                style={{ filter: 'contrast(1.1) brightness(1.2)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1410]/20 via-transparent to-[#1A1410]/40" />
      </div>

      <div className="transition-overlay fixed inset-0 bg-[#1A1410] opacity-0 pointer-events-none z-[90]" />

      <div ref={scrollContainerRef} className="relative h-[750vh] z-50">
        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="text-center w-full max-w-7xl">
            <span className="section-label mb-8">001 / Bienvenue</span>
            <h1 className="editorial-heading text-white">WELCOME TO<br/><span className="text-[#B8860B]">VODUN CONCEPT</span></h1>
            <p className="font-playfair text-xl mt-10 text-white/40 tracking-[0.3em] uppercase">Découvrez le temple du sacré</p>
          </div>
        </section>

        <section className="scroll-section fixed inset-0 flex flex-col justify-center pointer-events-none px-[8vw] lg:pr-[55vw]">
          <div className="w-full">
            <span className="section-label mb-6">002 / Héritage</span>
            <h2 className="font-playfair text-[clamp(2.5rem,6vw,8rem)] font-black leading-[0.95] text-white uppercase mb-8">
              HÉRITAGE<br/>ANCESTRAL
            </h2>
            <p className="font-playfair text-xl md:text-2xl text-white/60 leading-relaxed max-w-xl">
              Chaque objet raconte une histoire séculaire, portée par le souffle des ancêtres.
            </p>
          </div>
        </section>

        <section className="scroll-section fixed inset-0 flex flex-col justify-center items-end pointer-events-none px-[8vw] lg:pl-[55vw] text-right">
          <div className="w-full text-right">
            <span className="section-label mb-6">003 / Design</span>
            <h2 className="font-playfair text-[clamp(2.5rem,6vw,8rem)] font-black leading-[0.95] text-white uppercase mb-8">
              LUXE<br/><span className="text-[#B8860B]">CONTEMPORAIN</span>
            </h2>
            <p className="font-playfair text-xl md:text-2xl text-white/60 leading-relaxed max-w-xl ml-auto">
              Une vision résolument moderne où le design rencontre la puissance des symboles.
            </p>
          </div>
        </section>

        <section className="scroll-section fixed inset-0 flex items-center justify-center pointer-events-none px-6">
          <div className="text-center w-full max-w-5xl">
            <span className="section-label mb-8">004 / Signature</span>
            <h2 className="font-playfair text-[clamp(2.5rem,5vw,7rem)] font-black leading-none text-white uppercase mb-12">
              L'ÉVEIL DU<br/><span className="text-[#B8860B]">TEMPLE INTÉRIEUR</span>
            </h2>
            <div className="mt-16 flex justify-center items-center flex-col gap-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30">Scrollez pour entrer</span>
              <div className="w-px h-24 bg-gradient-to-b from-[#B8860B] to-transparent animate-pulse" />
            </div>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .editorial-heading { font-size: clamp(3.5rem, 12vw, 16rem); line-height: 0.85; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase; }
        .section-label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5em; font-weight: 800; color: #B8860B; }
      `}} />
    </div>
  );
}