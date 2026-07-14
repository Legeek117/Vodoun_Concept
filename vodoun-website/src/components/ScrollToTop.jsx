import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // La page admin gère son propre scroll — on ne touche à rien
    if (pathname.startsWith('/admin')) return;

    // Nettoie les ScrollTrigger en premier
    ScrollTrigger.getAll().forEach((st) => st.kill(true));

    // Remet le body scrollable au cas où Lenis l'aurait verrouillé
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        try {
          window.lenis.scrollTo(0, { immediate: true });
        } catch (e) {
          console.warn('Erreur lors de la réinitialisation de Lenis:', e);
        }
      }
    };

    resetScroll();

    const timeoutId = setTimeout(() => {
      resetScroll();
      ScrollTrigger.refresh();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
