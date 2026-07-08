import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Nettoie les ScrollTrigger en premier
    ScrollTrigger.getAll().forEach((st) => st.kill(true));

    const resetScroll = () => {
      // Réinitialise le scroll natif
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Réinitialise Lenis si disponible
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        try {
          window.lenis.scrollTo(0, { immediate: true });
        } catch (e) {
          console.warn('Erreur lors de la réinitialisation de Lenis:', e);
        }
      }
    };

    // Réinitialise immédiatement
    resetScroll();

    // Réinitialise à nouveau après un court délai pour les composants lazy-loaded
    const timeoutId = setTimeout(() => {
      resetScroll();
      ScrollTrigger.refresh();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
