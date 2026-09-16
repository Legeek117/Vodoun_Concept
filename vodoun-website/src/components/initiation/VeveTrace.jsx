import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * VeveTrace — Vévé dessiné trait par trait via stroke-dashoffset
 * Chaque path a une longueur calculée et une animation séquencée
 */
export default function VeveTrace({ visible = false, onComplete }) {
  const svgRef  = useRef(null);
  const haloRef = useRef(null);
  const tlRef   = useRef(null);

  useEffect(() => {
    if (!visible || !svgRef.current) return;

    const paths = svgRef.current.querySelectorAll('path, circle, line, polygon, rect');

    // Initialiser chaque path pour le tracé
    paths.forEach((p) => {
      try {
        const len = p.getTotalLength ? p.getTotalLength() : 100;
        p.style.strokeDasharray  = len;
        p.style.strokeDashoffset = len;
        p.style.opacity = '1';
      } catch {
        p.style.opacity = '0';
      }
    });

    gsap.set(haloRef.current, { scale: 0, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
    tlRef.current = tl;

    // Tracer chaque path séquentiellement
    paths.forEach((p, i) => {
      tl.to(p, {
        strokeDashoffset: 0,
        duration: 0.18,
        ease: 'power1.inOut',
      }, i * 0.08);
    });

    // Pulse halo doré quand le tracé est complet
    tl.to(haloRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, '-=0.1')
    .to(haloRef.current, {
      scale: 2.5,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    return () => tl.kill();
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Halo pulsant */}
      <div
        ref={haloRef}
        className="absolute"
        style={{
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(210,185,142,0.35) 0%, rgba(210,185,142,0.0) 70%)',
          transformOrigin: 'center',
        }}
      />

      {/* SVG Vévé */}
      <svg
        ref={svgRef}
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(210,185,142,0.8))' }}
      >
        {/* Cercle extérieur */}
        <circle cx="140" cy="140" r="130"
          stroke="#D2B98E" strokeWidth="1.5" strokeOpacity="0.9" />

        {/* Cercle intermédiaire */}
        <circle cx="140" cy="140" r="100"
          stroke="#D2B98E" strokeWidth="1" strokeOpacity="0.6" />

        {/* Cercle intérieur */}
        <circle cx="140" cy="140" r="65"
          stroke="#D2B98E" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* Croix cardinale */}
        <line x1="140" y1="10" x2="140" y2="270"
          stroke="#D2B98E" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="10" y1="140" x2="270" y2="140"
          stroke="#D2B98E" strokeWidth="1.2" strokeOpacity="0.8" />

        {/* Diagonales */}
        <line x1="48" y1="48" x2="232" y2="232"
          stroke="#D2B98E" strokeWidth="0.8" strokeOpacity="0.5" />
        <line x1="232" y1="48" x2="48" y2="232"
          stroke="#D2B98E" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* Grand losange */}
        <polygon points="140,30 230,140 140,250 50,140"
          stroke="#D2B98E" strokeWidth="1.5" strokeOpacity="0.85" fill="none" />

        {/* Losange intérieur */}
        <polygon points="140,80 185,140 140,200 95,140"
          stroke="#D2B98E" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />

        {/* Carré tourné */}
        <rect x="115" y="115" width="50" height="50"
          stroke="#D2B98E" strokeWidth="1" strokeOpacity="0.7"
          fill="rgba(210,185,142,0.06)" transform="rotate(45 140 140)" />

        {/* Spirale gauche */}
        <path d="M140 140 Q120 100 90 105 Q60 110 70 140 Q80 170 110 160 Q130 155 125 140"
          stroke="#D2B98E" strokeWidth="1" strokeOpacity="0.6" fill="none" />

        {/* Spirale droite */}
        <path d="M140 140 Q160 100 190 105 Q220 110 210 140 Q200 170 170 160 Q150 155 155 140"
          stroke="#D2B98E" strokeWidth="1" strokeOpacity="0.6" fill="none" />

        {/* Motif serpent bas */}
        <path d="M80 210 Q100 195 120 210 Q140 225 160 210 Q180 195 200 210"
          stroke="#D2B98E" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />

        {/* Motif serpent haut */}
        <path d="M80 70 Q100 85 120 70 Q140 55 160 70 Q180 85 200 70"
          stroke="#D2B98E" strokeWidth="1.2" strokeOpacity="0.7" fill="none" />

        {/* Points cardinaux */}
        <circle cx="140" cy="12" r="3" fill="#D2B98E" fillOpacity="0.9" />
        <circle cx="140" cy="268" r="3" fill="#D2B98E" fillOpacity="0.9" />
        <circle cx="12" cy="140" r="3" fill="#D2B98E" fillOpacity="0.9" />
        <circle cx="268" cy="140" r="3" fill="#D2B98E" fillOpacity="0.9" />

        {/* Points diagonaux */}
        <circle cx="50" cy="50" r="2.5" fill="#D2B98E" fillOpacity="0.7" />
        <circle cx="230" cy="50" r="2.5" fill="#D2B98E" fillOpacity="0.7" />
        <circle cx="50" cy="230" r="2.5" fill="#D2B98E" fillOpacity="0.7" />
        <circle cx="230" cy="230" r="2.5" fill="#D2B98E" fillOpacity="0.7" />

        {/* Centre lumineux */}
        <circle cx="140" cy="140" r="5"
          fill="#D2B98E" fillOpacity="0.95"
          style={{ filter: 'blur(1px)' }} />
        <circle cx="140" cy="140" r="2.5"
          fill="white" fillOpacity="0.9" />
      </svg>
    </div>
  );
}
