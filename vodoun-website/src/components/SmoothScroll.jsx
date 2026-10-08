import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  const lenisRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // S'assurer que le scroll natif est possible (jamais bloqué)
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';
    document.body.style.position = '';

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // CRITIQUE : smoothTouch DOIT rester false (voir commentaire ci-dessus)
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
    window.scrollTo(0, 0);
    try { lenisRef.current?.scrollTo(0, { immediate: true }); } catch { /* noop */ }
    timeoutRef.current = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(timeoutRef.current);
  }, [pathname]);

  return null;
}