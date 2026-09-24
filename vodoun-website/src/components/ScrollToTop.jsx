import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollTrigger from 'gsap/ScrollTrigger';

/**
 * ScrollToTop — à chaque changement de route :
 * - libère le scroll s'il était bloqué par une page précédente (modal, etc.)
 * - détruit les ScrollTriggers orphelins des anciennes pages
 *
 * Le reset de position du scroll (top:0) est géré par SmoothScroll (Lenis global),
 * qui tourne sur toutes les routes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Admin : layout autonome, ne pas toucher au scroll
    if (pathname.startsWith('/admin')) return;

    // Nettoyer les ScrollTriggers orphelins
    ScrollTrigger.getAll().forEach((st) => st.kill(true));

    // Débloquer le scroll (jamais de blocage résiduel)
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';
    document.body.style.height = '';
    document.documentElement.style.height = '';

    // Refresh après un court délai pour laisser les pages monter leurs sections
    const timeoutId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}