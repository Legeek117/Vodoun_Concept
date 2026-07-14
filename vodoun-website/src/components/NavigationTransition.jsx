import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

/**
 * NavigationTransition
 *
 * Overlay de transition global, monté UNE seule fois au-dessus de toute
 * l'application. Il gère deux scénarios :
 *
 * A) Navigation inter-pages via TransitionLink / navigateTo()
 *    1. Écoute 'vodoun:navigate'  → joue l'animation d'ENTRÉE (overlay visible)
 *    2. Fin d'entrée              → fire 'vodoun:navigate:commit' (React Router navigue)
 *    3. Écoute changement de route (useLocation) → attend que la nouvelle page
 *       soit prête (rAF double + 80 ms) puis joue l'animation de SORTIE
 *
 * B) Liens <Link> natifs React Router / navigation directe (back/forward)
 *    → useLocation détecte le changement APRÈS le rendu ; l'overlay entre
 *      brièvement pour masquer le flash, puis sort immédiatement.
 *
 * Le rendu est null tant que l'overlay est complètement sorti (visible=false)
 * pour ne pas bloquer les events pointer.
 */

const ENTER_DURATION = 0.55;   // secondes — overlay entre
const HOLD_DURATION  = 0.08;   // secondes — pause avant commit (laisse le temps de peindre)
const EXIT_DURATION  = 0.65;   // secondes — overlay sort

// Motif SVG vévé centré, réutilisé depuis GlobalLoader
function VeveSVG({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="28" cy="28" r="26" stroke="#B8860B" strokeWidth="0.8" strokeOpacity="0.45" />
      <circle cx="28" cy="28" r="18" stroke="#B8860B" strokeWidth="0.6" strokeOpacity="0.28" />
      <line x1="28" y1="2"  x2="28" y2="54" stroke="#B8860B" strokeWidth="0.7" strokeOpacity="0.35" />
      <line x1="2"  y1="28" x2="54" y2="28" stroke="#B8860B" strokeWidth="0.7" strokeOpacity="0.35" />
      <line x1="9.4"  y1="9.4"  x2="46.6" y2="46.6" stroke="#B8860B" strokeWidth="0.5" strokeOpacity="0.2" />
      <line x1="46.6" y1="9.4"  x2="9.4"  y2="46.6" stroke="#B8860B" strokeWidth="0.5" strokeOpacity="0.2" />
      <polygon points="28,14 38,28 28,42 18,28"
        stroke="#B8860B" strokeWidth="0.9" strokeOpacity="0.55" fill="none" />
      <rect x="22" y="22" width="12" height="12"
        stroke="#B8860B" strokeWidth="0.8" strokeOpacity="0.45"
        fill="rgba(184,134,11,0.05)" transform="rotate(45 28 28)" />
      <circle cx="28" cy="28" r="2.5" fill="#B8860B" fillOpacity="0.65" />
      <circle cx="28" cy="4"  r="1.2" fill="#B8860B" fillOpacity="0.45" />
      <circle cx="28" cy="52" r="1.2" fill="#B8860B" fillOpacity="0.45" />
      <circle cx="4"  cy="28" r="1.2" fill="#B8860B" fillOpacity="0.45" />
      <circle cx="52" cy="28" r="1.2" fill="#B8860B" fillOpacity="0.45" />
    </svg>
  );
}

export default function NavigationTransition() {
  const location   = useLocation();

  // DOM refs
  const overlayRef   = useRef(null);
  const panelRef     = useRef(null);   // panneau sombre qui slide
  const logoRef      = useRef(null);
  const vevuRef      = useRef(null);
  const barFillRef   = useRef(null);
  const shimmerRef   = useRef(null);

  // État machine : 'idle' | 'entering' | 'holding' | 'exiting'
  const stateRef        = useRef('idle');
  const [visible, setVisible] = useState(false);

  // Path vers lequel on navigue (pour le commit)
  const pendingPathRef  = useRef(null);
  // Dernier pathname traité pour éviter les doubles sorties
  const lastPathnameRef = useRef(location.pathname);
  // Flag : la navigation a-t-elle déjà été commitée pour ce cycle ?
  const committedRef    = useRef(false);

  /* ─── GSAP helpers ─────────────────────────────────────── */

  const playEnter = useCallback((onDone) => {
    const overlay = overlayRef.current;
    const panel   = panelRef.current;
    const logo    = logoRef.current;
    const vevu    = vevuRef.current;
    const bar     = barFillRef.current;

    if (!overlay || !panel) return;

    // Reset states
    gsap.killTweensOf([overlay, panel, logo, vevu, bar]);
    gsap.set(overlay, { pointerEvents: 'all' });
    gsap.set(panel,   { yPercent: -100, opacity: 1 });
    gsap.set([logo, vevu], { opacity: 0, y: 10 });
    gsap.set(bar,   { scaleX: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({ onComplete: onDone });

    // Panneau descend depuis le haut (wipe-down)
    tl.to(panel, {
      yPercent: 0,
      duration: ENTER_DURATION,
      ease: 'power4.inOut',
    })
    // Logo + vévé apparaissent
    .to(vevu,  { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, `-=${ENTER_DURATION * 0.3}`)
    .to(logo,  { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '<0.05')
    // Barre de progression démarre
    .to(bar, { scaleX: 0.7, duration: 0.5, ease: 'power2.out' }, '<');
  }, []);

  const playExit = useCallback((onDone) => {
    const overlay = overlayRef.current;
    const panel   = panelRef.current;
    const logo    = logoRef.current;
    const vevu    = vevuRef.current;
    const bar     = barFillRef.current;

    if (!overlay || !panel) return;

    gsap.killTweensOf([overlay, panel, logo, vevu, bar]);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { pointerEvents: 'none' });
        setVisible(false);
        if (onDone) onDone();
      },
    });

    // Barre complète
    tl.to(bar, { scaleX: 1, duration: 0.22, ease: 'power2.in' })
    // Logo + vévé disparaissent
    .to([logo, vevu], { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }, '<0.05')
    // Panneau monte (wipe-up)
    .to(panel, {
      yPercent: 100,
      duration: EXIT_DURATION,
      ease: 'power4.inOut',
    }, '-=0.1');
  }, []);

  /* ─── Rotation continue du vévé ────────────────────────── */
  useEffect(() => {
    if (!visible || !vevuRef.current) return;
    const tween = gsap.to(vevuRef.current, {
      rotation: 360,
      duration: 10,
      ease: 'none',
      repeat: -1,
    });
    return () => tween.kill();
  }, [visible]);

  /* ─── Écoute 'vodoun:navigate' ──────────────────────────── */
  useEffect(() => {
    const handleNavigate = (e) => {
      const path = e.detail?.path;
      if (!path) return;
      // Ignore si déjà en train de naviguer
      if (stateRef.current !== 'idle') return;

      stateRef.current   = 'entering';
      committedRef.current = false;
      pendingPathRef.current = path;
      setVisible(true);

      playEnter(() => {
        // Courte pause pour laisser React vider le render en cours
        stateRef.current = 'holding';
        setTimeout(() => {
          committedRef.current = true;
          window.dispatchEvent(
            new CustomEvent('vodoun:navigate:commit', { detail: { path } })
          );
          // État → 'exiting' géré par le watcher de location ci-dessous
        }, HOLD_DURATION * 1000);
      });
    };

    window.addEventListener('vodoun:navigate', handleNavigate);
    return () => window.removeEventListener('vodoun:navigate', handleNavigate);
  }, [playEnter]);

  /* ─── Surveille les changements de location ─────────────── */
  useEffect(() => {
    const newPath = location.pathname + location.search;
    const oldPath = lastPathnameRef.current;

    if (newPath === oldPath) return;
    lastPathnameRef.current = newPath;

    // Cas A uniquement : transition commitée via vodoun:navigate
    // → on attend que le nouveau rendu soit peint puis on sort
    if (committedRef.current) {
      committedRef.current = false;
      stateRef.current = 'exiting';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            playExit(() => { stateRef.current = 'idle'; });
          }, 60);
        });
      });
    }
    // Cas B supprimé : les <Link> React Router sont instantanés côté client,
    // ils n'ont pas besoin d'un overlay de transition. L'afficher à chaque
    // changement de pathname causait des apparitions non souhaitées.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  /* ─── Rendu ──────────────────────────────────────────────── */
  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        pointerEvents: 'none',      // géré par GSAP
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Panneau principal — wipe de haut en bas */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, #0A0705 0%, #1A1410 55%, #0D0B08 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          willChange: 'transform',
        }}
      >
        {/* Halo doré */}
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(184,134,11,0.07) 0%, rgba(184,134,11,0.02) 45%, transparent 70%)',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Grain */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: 0.025, pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }} />

        {/* Contenu centré */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Vévé rotatif */}
          <div ref={vevuRef} style={{ marginBottom: '20px' }}>
            <VeveSVG size={48} />
          </div>

          {/* Logo */}
          <div
            ref={logoRef}
            style={{ margin: 0, lineHeight: 1 }}
          >
            <img
              src="/logo.jpeg"
              alt="Vodoun Concept Store"
              style={{ height: 'clamp(50px, 10vw, 90px)', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
            <span style={{ width: '24px', height: '1px', background: 'rgba(184,134,11,0.35)', display: 'block' }} />
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#B8860B', display: 'block', opacity: 0.6 }} />
            <span style={{ width: '24px', height: '1px', background: 'rgba(184,134,11,0.35)', display: 'block' }} />
          </div>

          {/* Barre de progression */}
          <div style={{
            width: 'clamp(100px, 16vw, 160px)',
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div
              ref={barFillRef}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, #B8860B 0%, #D2B98E 55%, #B8860B 100%)',
                transformOrigin: 'left center',
                boxShadow: '0 0 10px rgba(184,134,11,0.45)',
              }}
            />
            {/* Shimmer */}
            <div
              ref={shimmerRef}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                animation: 'nt-shimmer 1.6s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyframes shimmer injectées inline — pas de dépendance CSS externe */}
      <style>{`
        @keyframes nt-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
