import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * usePageTransition
 *
 * Intercepts React Router navigations so a transition overlay can play
 * BEFORE the route changes (not after). Works by:
 *
 * 1. Exposing `navigateTo(path)` — callers use this instead of <Link> or
 *    useNavigate() directly when they want the overlay animation.
 * 2. Emitting a custom DOM event `vodoun:navigate` that NavigationTransition
 *    picks up to start its enter animation. When the animation finishes it
 *    fires `vodoun:navigate:commit` which triggers the actual React Router
 *    navigation.
 * 3. Listening to location changes so NavigationTransition knows when the
 *    new page has mounted and it can start its exit animation.
 *
 * For lazy-loaded routes, Suspense still shows GlobalLoader as fallback,
 * but since the overlay is already visible the user never sees a flash.
 */
export function usePageTransition() {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingPathRef = useRef(null);

  // Listen for the commit signal (overlay enter-done) → actually navigate
  useEffect(() => {
    const handleCommit = (e) => {
      const path = e.detail?.path;
      if (path) {
        navigate(path);
        pendingPathRef.current = null;
      }
    };

    window.addEventListener('vodoun:navigate:commit', handleCommit);
    return () => window.removeEventListener('vodoun:navigate:commit', handleCommit);
  }, [navigate]);

  /**
   * navigateTo — use instead of <Link> / navigate() when you want the
   * transition overlay.  Safe to call multiple times; ignores if already
   * navigating to the same path or transition is in progress.
   */
  const navigateTo = useCallback(
    (path) => {
      if (path === location.pathname) return;
      if (pendingPathRef.current === path) return;
      pendingPathRef.current = path;

      window.dispatchEvent(
        new CustomEvent('vodoun:navigate', { detail: { path } })
      );
    },
    [location.pathname]
  );

  return { navigateTo, currentPath: location.pathname };
}

/**
 * TransitionLink — drop-in replacement for React Router <Link> that uses
 * the transition overlay.  Import and use exactly like <Link>.
 *
 * Usage:
 *   import { TransitionLink } from '../hooks/usePageTransition';
 *   <TransitionLink to="/boutique">Boutique</TransitionLink>
 */
export function TransitionLink({ to, children, className, style, onClick, ...rest }) {
  const { navigateTo } = usePageTransition();

  const handleClick = (e) => {
    // Let the browser handle external links, modifier keys, etc.
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === '_blank'
    ) {
      return;
    }
    e.preventDefault();
    if (onClick) onClick(e);
    navigateTo(to);
  };

  return (
    <a href={to} className={className} style={style} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
