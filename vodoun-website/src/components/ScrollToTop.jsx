import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    // Nettoie les ScrollTrigger en premier
    ScrollTrigger.getAll().forEach((st) => st.kill(true));

    // Forcer le scroll disponible — critique sur Netlify
    document.body.style.overflow        = '';
    document.body.style.overflowY       = '';
    document.documentElement.style.overflow  = '';
    document.documentElement.style.overflowY = '';
    document.body.style.height          = '';
    document.documentElement.style.height   = '';
    document.body.style.position        = '';

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        try {
          window.lenis.scrollTo(0, { immediate: true });
        } catch {
          // Lenis peut être détruit entre deux routes, c'est normal
        }
      }
    };

    resetScroll();

    const timeoutId = setTimeout(() => {
      // Double reset — sur Netlify le premier peut être annulé par un re-render
      document.body.style.overflow        = '';
      document.body.style.overflowY       = '';
      document.documentElement.style.overflow  = '';
      resetScroll();
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
