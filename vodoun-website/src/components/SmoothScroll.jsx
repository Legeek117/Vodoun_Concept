import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll — Lenis global monté UNE SEULE FOIS au niveau du routeur.
 * Rend le scroll fluide (wheel desktop lissé) sur TOUTES les pages du site.
 *
 * CRITIQUE : smoothTouch DOIT rester false. En prod mobile, smoothTouch:true
 * interceptait tous les touch events (preventDefault) sans pouvoir scroller →
 * page totalement figée. Avec le tactile natif, le scroll window/body fonctionne
 * et onNativeScroll → ScrollTrigger.update garde la synchro.
 */
export default function SmoothScroll() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'
  const lenisRef = useRef(null);
  const timeoutRef  = useRef(null);
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  useEffect(() => {
    // Bug 4 fix : Lenis inutile sur la page d'initiation (position:fixed, rien à scroller)
    if (pathnameRef.current === '/') return;

    // S'assurer que le scroll natif est possible (jamais bloqué)
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';
    document.body.style.position = '';

    const lenis = new Lenis({
      duration: 0.9,  // réduit de 1.2 → plus réactif
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      infinite: false,
    });
    lenisRef.current = lenis;
    window.lenis = lenis;

    // Synchronisation Lenis ↔ ScrollTrigger via le ticker GSAP
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const handleResize = () => {
      ScrollTrigger.refresh();
      try { lenis.resize(); } catch { /* Lenis peut être détruit */ }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutRef.current);
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', handleResize);
      try { lenis.destroy(); } catch { /* déjà détruit */ }
      delete window.lenis;
      lenisRef.current = null;
    };
  }, []);

  // À chaque navigation : reset du scroll + refresh ScrollTrigger
  useEffect(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // POP = bouton retour/avant du browser → on ne remet PAS en haut,
    // on laisse le browser/Lenis rester là où l'utilisateur était.
    // PUSH/REPLACE = navigation vers une nouvelle page → on remet en haut.
    if (navType === 'POP') {
      timeoutRef.current = setTimeout(() => ScrollTrigger.refresh(), 100);
      return () => clearTimeout(timeoutRef.current);
    }

    const resetLenis = () => {
      try {
        const lenis = lenisRef.current;
        if (lenis) {
          lenis.stop();
          lenis.scrollTo(0, { immediate: true, force: true });
          lenis.start();
        }
      } catch { /* noop */ }
    };

    // Reset natif immédiat
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    resetLenis();

    // Deuxième reset après le paint React (rAF) pour écraser toute restauration tardive
    let rafId;
    rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      resetLenis();

      timeoutRef.current = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        resetLenis();
        ScrollTrigger.refresh();
      }, 100);
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutRef.current);
    };
  }, [pathname, navType]);

  return null;
}
