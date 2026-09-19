import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sur la page d'accueil, ne pas toucher à Lenis — laisser App le gérer
    if (pathname === '/accueil') {
      // Juste refresh ScrollTrigger pour les nouvelles sections
      ScrollTrigger.refresh();
      return;
    }

    // Pour les autres pages, nettoyer Lenis
    if (window.lenis) {
      try {
        window.lenis.destroy();
      } catch (e) {
        // Lenis peut être déjà détruit
      }
      delete window.lenis;
    }

    // Admin : ne pas toucher au scroll
    if (pathname.startsWith('/admin')) return;

    // Nettoyer les ScrollTriggers
    ScrollTrigger.getAll().forEach((st) => st.kill(true));

    // Débloquer le scroll
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';

    // Reset du scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Refresh après un court délai
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
