import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * GlobalLoader — fallback Suspense
 * Affiché lors du chargement initial des chunks lazy et lors des navigations
 * vers des pages dont le bundle n'est pas encore chargé.
 *
 * Design : fond noir Vodoun, logotype animé, barre de progression organique,
 * vévé SVG rotatif, slogan en fade. Animation d'entrée séquencée + sortie fluide.
 */
export default function GlobalLoader({ isExiting = false, onExitComplete }) {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const logoRef = useRef(null);
  const sloganRef = useRef(null);
  const vevuRef = useRef(null);
  const separatorRef = useRef(null);
  const progressRef = useRef(null);
  const tlRef = useRef(null);

  /* ─── Animation d'ENTRÉE ─────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // État initial
    gsap.set([logoRef.current, sloganRef.current, separatorRef.current, vevuRef.current], {
      opacity: 0,
      y: 20,
    });
    gsap.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(root, { opacity: 0 });

    const tl = gsap.timeline();
    tlRef.current = tl;

    // 1. Fade-in du fond
    tl.to(root, { opacity: 1, duration: 0.35, ease: 'power2.out' })

      // 2. Logo
      .to(logoRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.1')

      // 3. Séparateur doré
      .to(separatorRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.25')

      // 4. Slogan
      .to(sloganRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.2')

      // 5. Vévé
      .to(vevuRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

      // 6. Barre de progression — simulation organique (0→60 vite, puis ralentit)
      .to(barRef.current, { scaleX: 0.6, duration: 0.8, ease: 'power2.out' }, '-=0.3')
      .to(barRef.current, { scaleX: 0.85, duration: 1.2, ease: 'power1.inOut' })
      .to(barRef.current, { scaleX: 0.93, duration: 1.5, ease: 'power0.5' });

    // Rotation continue du vévé
    gsap.to(vevuRef.current, {
      rotation: 360,
      duration: 12,
      ease: 'none',
      repeat: -1,
    });

    // Respiration du logo
    gsap.to(logoRef.current, {
      filter: 'drop-shadow(0 0 18px rgba(184,134,11,0.55))',
      duration: 1.8,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => {
      tl.kill();
      gsap.killTweensOf([
        logoRef.current,
        vevuRef.current,
        barRef.current,
        sloganRef.current,
        separatorRef.current,
      ]);
    };
  }, []);

  /* ─── Animation de SORTIE ────────────────────────────────── */
  useEffect(() => {
    if (!isExiting || !rootRef.current) return;

    // Complète la barre à 100% puis fade-out
    const tl = gsap.timeline({
      onComplete: () => {
        if (onExitComplete) onExitComplete();
      },
    });

    tl.to(barRef.current, { scaleX: 1, duration: 0.3, ease: 'power2.in' })
      .to(
        rootRef.current,
        {
          opacity: 0,
          y: -16,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        '-=0.05'
      );

    return () => tl.kill();
  }, [isExiting]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0A0705 0%, #1A1410 60%, #0D0B08 100%)' }}
      aria-label="Chargement en cours"
      role="status"
    >
      {/* Grain de texture léger */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Halo doré central */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(184,134,11,0.08) 0%, rgba(184,134,11,0.03) 40%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Contenu central */}
      <div className="relative z-10 flex flex-col items-center gap-0 select-none">
        {/* Vévé SVG rotatif */}
        <div ref={vevuRef} className="mb-10" style={{ opacity: 0 }}>
          <VeveSVG />
        </div>

        {/* Logotype */}
        <div
          ref={logoRef}
          className="flex items-center justify-center"
          style={{ opacity: 0 }}
        >
          <img
            src="/logo.jpeg"
            alt="Vodoun Concept Store"
            style={{ height: 'clamp(60px, 12vw, 100px)', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Séparateur */}
        <div
          ref={separatorRef}
          className="flex items-center gap-3 my-5"
          style={{ opacity: 0 }}
        >
          <span style={{ width: '28px', height: '1px', background: 'rgba(184,134,11,0.4)', display: 'block' }} />
          <span
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#B8860B',
              display: 'block',
            }}
          />
          <span style={{ width: '28px', height: '1px', background: 'rgba(184,134,11,0.4)', display: 'block' }} />
        </div>

        {/* Slogan */}
        <p
          ref={sloganRef}
          className="font-playfair italic text-center"
          style={{
            opacity: 0,
            color: 'rgba(212,185,142,0.55)',
            fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}
        >
          Là où le sacré devient désirable
        </p>

        {/* Barre de progression */}
        <div className="mt-10 relative" style={{ width: 'clamp(120px, 20vw, 180px)' }}>
          {/* Track */}
          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.06)',
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Barre */}
            <div
              ref={barRef}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, #B8860B 0%, #D2B98E 60%, #B8860B 100%)',
                transformOrigin: 'left center',
                boxShadow: '0 0 12px rgba(184,134,11,0.5)',
              }}
            />
          </div>
          {/* Reflet mobile */}
          <div
            ref={progressRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
              animation: 'shimmer 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Vévé SVG (motif géométrique inspiré des vévés Vodun) ── */
function VeveSVG() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cercle externe */}
      <circle cx="28" cy="28" r="26" stroke="#B8860B" strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Cercle interne */}
      <circle cx="28" cy="28" r="18" stroke="#B8860B" strokeWidth="0.6" strokeOpacity="0.3" />
      {/* Croix cardinale */}
      <line x1="28" y1="2" x2="28" y2="54" stroke="#B8860B" strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="2" y1="28" x2="54" y2="28" stroke="#B8860B" strokeWidth="0.7" strokeOpacity="0.4" />
      {/* Diagonales */}
      <line x1="9.4" y1="9.4" x2="46.6" y2="46.6" stroke="#B8860B" strokeWidth="0.5" strokeOpacity="0.25" />
      <line x1="46.6" y1="9.4" x2="9.4" y2="46.6" stroke="#B8860B" strokeWidth="0.5" strokeOpacity="0.25" />
      {/* Losange central */}
      <polygon
        points="28,14 38,28 28,42 18,28"
        stroke="#B8860B"
        strokeWidth="0.9"
        strokeOpacity="0.6"
        fill="none"
      />
      {/* Carré intérieur tourné */}
      <rect
        x="22"
        y="22"
        width="12"
        height="12"
        stroke="#B8860B"
        strokeWidth="0.8"
        strokeOpacity="0.5"
        fill="rgba(184,134,11,0.06)"
        transform="rotate(45 28 28)"
      />
      {/* Centre */}
      <circle cx="28" cy="28" r="2.5" fill="#B8860B" fillOpacity="0.7" />
      {/* Points cardinaux */}
      <circle cx="28" cy="4" r="1.2" fill="#B8860B" fillOpacity="0.5" />
      <circle cx="28" cy="52" r="1.2" fill="#B8860B" fillOpacity="0.5" />
      <circle cx="4" cy="28" r="1.2" fill="#B8860B" fillOpacity="0.5" />
      <circle cx="52" cy="28" r="1.2" fill="#B8860B" fillOpacity="0.5" />
    </svg>
  );
}
