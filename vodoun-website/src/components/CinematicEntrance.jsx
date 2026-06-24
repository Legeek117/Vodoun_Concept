import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Howl } from 'howler';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 217;
const FRAME_PATH = '/frames/entrance/frame_';

export default function CinematicEntrance() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const soundRef = useRef(null);

  // 0. Audio Setup
  useEffect(() => {
    soundRef.current = new Howl({
      src: ['https://assets.mixkit.co/sfx/preview/mixkit-wind-chimes-135.mp3'], // Placeholder sacred sound
      loop: true,
      volume: 0.5,
    });

    return () => {
      if (soundRef.current) soundRef.current.stop();
    };
  }, []);

  // 1. Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const loadedFrames = [];

    const loadFrame = (index) => {
      const img = new Image();
      const paddedIndex = String(index).padStart(4, '0');
      img.src = `${FRAME_PATH}${paddedIndex}.webp`;
      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
        if (loadedCount === FRAME_COUNT) {
          setFrames(loadedFrames);
          setIsLoading(false);
        }
      };
      loadedFrames[index - 1] = img;
    };

    for (let i = 1; i <= FRAME_COUNT; i++) {
      loadFrame(i);
    }
  }, []);

  // 2. Initialize Scroll & Canvas
  useEffect(() => {
    if (isLoading || frames.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(0);
    };

    const renderFrame = (index) => {
      const img = frames[index];
      if (!img) return;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP ScrollTrigger for video frames
    const scrollTrigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1, // Faster scrub for more responsive frames
      onUpdate: (self) => {
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(self.progress * FRAME_COUNT)
        );
        renderFrame(frameIndex);

        // Transition to main site at the end
        if (self.progress > 0.99) { // Trigger slightly later
          gsap.to('.entrance-overlay', {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              if (soundRef.current) soundRef.current.stop();
              navigate('/accueil');
            }
          });
        }
      },
    });

    // Text animations
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => {
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;

      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: () => `${enter * 100}% top`,
        end: () => `${leave * 100}% top`,
        onEnter: () => gsap.to(section, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }),
        onLeave: () => gsap.to(section, { opacity: 0, y: -50, duration: 1, ease: 'power3.in' }),
        onEnterBack: () => gsap.to(section, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }),
        onLeaveBack: () => gsap.to(section, { opacity: 0, y: 50, duration: 1, ease: 'power3.in' }),
      });
    });

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      lenis.destroy();
      scrollTrigger.kill();
    };
  }, [isLoading, frames, navigate]);

  const startGame = (quality) => {
    if (soundRef.current && !soundRef.current.playing()) {
      soundRef.current.play();
    }
    setIsLoading(false);
  };

  return (
    <div className="relative bg-noir overflow-hidden" onClick={() => {
      if (soundRef.current && !soundRef.current.playing()) soundRef.current.play();
    }}>
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-noir">
          <div className="text-or font-playfair text-4xl mb-8 tracking-[0.2em]">VODOUN</div>
          <div className="w-64 h-[1px] bg-ivoire/10 relative">
            <div 
              className="absolute inset-0 bg-or transition-all duration-300" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="text-ivoire/40 font-playfair text-xs mt-4 tracking-widest uppercase">
            Initialisation du Temple... {loadProgress}%
          </div>
          {loadProgress === 100 && (
            <button 
              onClick={() => {
                if (soundRef.current) soundRef.current.play();
                setIsLoading(false);
              }}
              className="mt-12 px-10 py-4 border border-or text-or font-playfair text-sm tracking-[0.3em] uppercase hover:bg-or hover:text-noir transition-all duration-500 animate-pulse"
            >
              Entrer dans l'expérience
            </button>
          )}
        </div>
      )}

      {/* Background Canvas */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-noir/20" /> {/* Slight overlay for readability */}
      </div>

      {/* Transition Overlay */}
      <div className="entrance-overlay fixed inset-0 bg-noir opacity-0 pointer-events-none z-[90]" />

      {/* Scroll Container */}
      <div ref={scrollContainerRef} className="relative h-[800vh]">
        {/* Section 1: Intro */}
        <section 
          className="scroll-section fixed inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none px-6"
          data-enter="5" data-leave="20"
        >
          <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4">L'Entrée du Temple</span>
          <h1 className="text-ivoire font-playfair text-5xl md:text-8xl lg:text-9xl text-center leading-tight">
            VODOUN <br /> <span className="text-or">CONCEPT STORE</span>
          </h1>
        </section>

        {/* Section 2: Opening Doors */}
        <section 
          className="scroll-section fixed inset-0 flex flex-col items-start justify-center opacity-0 pointer-events-none px-[10vw]"
          data-enter="30" data-leave="50"
        >
          <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4">01 / L'Appel</span>
          <h2 className="text-ivoire font-playfair text-4xl md:text-6xl max-w-2xl leading-tight">
            Ouvrez les portes d'un <span className="italic">monde sacré</span>.
          </h2>
          <p className="text-ivoire/60 font-playfair text-lg md:text-xl mt-8 max-w-xl">
            L'héritage Vodoun se révèle à travers l'artisanat d'exception et le design contemporain.
          </p>
        </section>

        {/* Section 3: Interior Reveal */}
        <section 
          className="scroll-section fixed inset-0 flex flex-col items-end justify-center opacity-0 pointer-events-none px-[10vw] text-right"
          data-enter="60" data-leave="80"
        >
          <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4">02 / L'Immersion</span>
          <h2 className="text-ivoire font-playfair text-4xl md:text-6xl max-w-2xl leading-tight">
            Une galerie de <span className="text-or">puissance</span> et de <span className="italic text-or">beauté</span>.
          </h2>
          <p className="text-ivoire/60 font-playfair text-lg md:text-xl mt-8 max-w-xl">
            Bracelets de protection, maroquinerie de luxe et rideaux de cauris : chaque objet porte une âme.
          </p>
        </section>

        {/* Section 4: Final - Towards the Throne */}
        <section 
          className="scroll-section fixed inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none px-6"
          data-enter="85" data-leave="95"
        >
          <span className="text-or font-playfair text-xs md:text-sm tracking-[0.4em] uppercase mb-4">03 / Le Sanctuaire</span>
          <h2 className="text-ivoire font-playfair text-4xl md:text-7xl lg:text-8xl text-center leading-tight">
            Entrez dans le <span className="italic">Cercle</span>.
          </h2>
          <div className="mt-12 flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-or rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-6 h-6 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className="text-or/60 font-playfair text-xs tracking-widest uppercase mt-4">Continuez pour entrer</span>
          </div>
        </section>
      </div>

      {/* Skip Button */}
      {!isLoading && (
        <button 
          onClick={() => navigate('/accueil')}
          className="fixed bottom-10 right-10 z-[100] text-ivoire/40 hover:text-or font-playfair text-xs tracking-[0.3em] uppercase transition-colors"
        >
          Passer l'introduction →
        </button>
      )}
    </div>
  );
}
