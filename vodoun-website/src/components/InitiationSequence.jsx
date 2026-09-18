import { useEffect, useRef, useState, Suspense, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

import { useSound } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import usePageMeta from '../hooks/usePageMeta';
import BraiseParticles from './initiation/BraiseParticles';
import VeveTrace from './initiation/VeveTrace';
import GoldenLines from './initiation/GoldenLines';
import ShockWave from './initiation/ShockWave';
import TunnelEffect from './initiation/TunnelEffect';
import MasqueScene, { MasqueErrorBoundary } from './initiation/MasqueScene';

const preloadAccueil = () => import('../App');

/* ─────────────────────────────────────────────────────
   Fond par phase
   0 : noir galaxie  1 : rouge sombre  2 : noir doré
   3 : noir (lignes) 3.5 : noir tunnel 4 : violet-nuit
───────────────────────────────────────────────────── */
const PHASE_BG = {
  0: '#0A0705', 1: '#160600', 2: '#0A0A05',
  3: '#0A0705', 3.5: '#050308', 4: '#07050D',
};

/* ─────────────────────────────────────────────────────
   Galaxie de fond — phase 0
   - 18 000 particules fines (size 0.022) sur 3 branches
   - Couleurs : or chaud centre → argent → or sombre bords
   - speedRef : accélération au clic DÉCOUVRIR
   - opacityRef : fondu pendant transition braises
───────────────────────────────────────────────────── */
function GalaxyBackground({ speedRef, opacityRef }) {
  const ref = useRef(null);

  const { positions, colors } = useMemo(() => {
    const COUNT    = 18000;
    const RADIUS   = 8;    // rayon réduit pour rester dans le champ fov=65 z=7
    const BRANCHES = 3;
    const SPIN     = 1.0;
    const RAND_PWR = 3;
    const RAND     = 0.4;

    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    // Couleurs 100% dorées — dégradé or vif → or Vodun → or sombre
    const cCore  = new THREE.Color('#FFD060'); // or vif au centre
    const cMid   = new THREE.Color('#D2B98E'); // or Vodun signature
    const cOuter = new THREE.Color('#8B6020'); // or sombre aux bords

    for (let i = 0; i < COUNT; i++) {
      const i3  = i * 3;
      const r   = Math.random() * RADIUS;
      const br  = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const sp  = r * SPIN;
      const rnd = (x) => Math.pow(Math.random(), RAND_PWR) * (Math.random() < 0.5 ? 1 : -1) * RAND * x;

      pos[i3]     = Math.cos(br + sp) * r + rnd(r);
      pos[i3 + 1] = rnd(r) * 0.25; // aplatie
      pos[i3 + 2] = Math.sin(br + sp) * r + rnd(r);

      // Gradient : or vif → or Vodun → argent
      const t = r / RADIUS;
      let mc;
      if (t < 0.5) {
        mc = cCore.clone().lerp(cMid, t * 2);
      } else {
        mc = cMid.clone().lerp(cOuter, (t - 0.5) * 2);
      }
      col[i3] = mc.r; col[i3 + 1] = mc.g; col[i3 + 2] = mc.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const speed   = speedRef?.current   ?? 1;
    const opacity = opacityRef?.current ?? 1;

    // Rotation Y uniquement — pas d'oscillation X pour éviter les trous
    ref.current.rotation.y += delta * 0.03 * speed;

    // Zoom in pendant l'accélération
    if (speed > 1) {
      ref.current.position.z = Math.min(ref.current.position.z + delta * (speed - 1) * 0.8, 4);
    }

    if (ref.current.material) {
      ref.current.material.opacity = Math.max(0, opacity * 0.92);
    }
  });

  return (
    // Inclinaison fixe légère — pas d'oscillation, pas de trous
    <points ref={ref} position={[0, 0, 0]} rotation={[0.15, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={colors.length / 3}    array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────
   PhaseText — position et style adaptatifs par phase
   Tous en position fixe pour éviter tout chevauchement
───────────────────────────────────────────────────── */
function PhaseText({ text, visible, phaseKey }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (visible) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: phaseKey === 'heritage' ? -16 : 16 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }
      );
    } else {
      gsap.to(ref.current, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    }
  }, [visible, phaseKey]);

  // Configs par phase
  const cfg = {
    heritage: {
      // Haut de l'écran — texte dramatique feu
      top: 'clamp(32px, 6vh, 64px)',
      bottom: 'auto',
      left: '50%',
      xform: 'translateX(-50%)',
      bg: 'transparent',
      border: 'none',
      blur: 'none',
      pad: '0',
      fontSize: 'clamp(1rem, 5vw, 2rem)',
      weight: 900,
      color: '#FFFFFF',
      shadow: '0 0 28px rgba(255,110,10,0.9), 0 0 55px rgba(255,60,0,0.4)',
      tracking: 'clamp(0.12em, 1vw, 0.3em)',
      upper: true,
      maxW: '92vw',
    },
    veve: {
      // Bas de l'écran, centré (pas gauche — risque de coupure mobile)
      top: 'auto',
      bottom: 'clamp(80px, 14vh, 120px)',
      left: '50%',
      xform: 'translateX(-50%)',
      bg: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(210,185,142,0.15)',
      blur: 'blur(12px)',
      pad: 'clamp(8px,1.5vh,12px) clamp(14px,4vw,24px)',
      fontSize: 'clamp(0.7rem, 2.5vw, 0.95rem)',
      weight: 400,
      color: '#D2B98E',
      shadow: '0 0 18px rgba(210,185,142,0.4)',
      tracking: '0.1em',
      upper: false,
      maxW: '88vw',
      italic: true,
    },
    tunnel: {
      // Bas centré
      top: 'auto',
      bottom: 'clamp(60px, 10vh, 100px)',
      left: '50%',
      xform: 'translateX(-50%)',
      bg: 'rgba(0,0,0,0.65)',
      border: '1px solid rgba(210,185,142,0.2)',
      blur: 'blur(16px)',
      pad: 'clamp(8px,1.5vh,14px) clamp(18px,5vw,40px)',
      fontSize: 'clamp(0.65rem, 2.5vw, 1rem)',
      weight: 600,
      color: '#D2B98E',
      shadow: '0 0 18px rgba(210,185,142,0.5)',
      tracking: 'clamp(0.2em, 1.2vw, 0.5em)',
      upper: true,
      maxW: '88vw',
    },
    masque: {
      // Bas centré — assez grand pour être visible sur mobile
      top: 'auto',
      bottom: 'clamp(10px, 2vh, 24px)',
      left: '50%',
      xform: 'translateX(-50%)',
      bg: 'rgba(0,0,0,0.65)',
      border: '1px solid rgba(210,185,142,0.2)',
      blur: 'blur(14px)',
      pad: 'clamp(8px,1.5vh,14px) clamp(20px,5vw,40px)',
      fontSize: 'clamp(0.65rem, 2.2vw, 0.9rem)',
      weight: 600,
      color: '#D2B98E',
      shadow: '0 0 16px rgba(210,185,142,0.5)',
      tracking: 'clamp(0.2em, 1.2vw, 0.5em)',
      upper: true,
      maxW: '90vw',
    },
  };

  const c = cfg[phaseKey] || cfg.tunnel;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: c.top,
        bottom: c.bottom,
        left: c.left,
        transform: c.xform,
        zIndex: 20,
        pointerEvents: 'none',
        opacity: 0,
        textAlign: 'center',
        maxWidth: c.maxW,
        width: c.maxW,
      }}
    >
      <div style={{
        display: 'inline-block',
        background: c.bg,
        backdropFilter: c.blur,
        WebkitBackdropFilter: c.blur,
        border: c.border,
        padding: c.pad,
        maxWidth: '100%',
      }}>
        <span style={{
          display: 'block',
          fontFamily: c.italic ? 'serif' : "'Playfair Display', serif",
          fontSize: c.fontSize,
          fontWeight: c.weight,
          fontStyle: c.italic ? 'italic' : 'normal',
          letterSpacing: c.tracking,
          color: c.color,
          textTransform: c.upper ? 'uppercase' : 'none',
          textShadow: c.shadow,
          lineHeight: 1.35,
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}>
          {text}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   TypeWriter — citation lettre par lettre
───────────────────────────────────────────────────── */
function TypeWriter({ text, visible, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!visible) { setDisplayed(''); setDone(false); return; }
    let i = 0; let timer;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(timer); setDone(true); }
      }, 60);
    }, delay);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [visible, text, delay]);

  if (!visible && !displayed) return null;
  return (
    <span style={{
      fontFamily: 'serif', fontStyle: 'italic',
      fontSize: 'clamp(1rem, 2.4vw, 1.35rem)',
      color: done ? 'rgba(210,185,142,0.95)' : 'rgba(210,185,142,0.75)',
      letterSpacing: '0.08em', lineHeight: 1.7,
      textShadow: '0 0 28px rgba(210,185,142,0.6), 0 2px 10px rgba(0,0,0,1)',
      transition: 'color 0.5s',
    }}>
      {displayed}
      {!done && <span style={{ animation: 'blink 0.7s step-end infinite', opacity: 0.7 }}>|</span>}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   PhaseProgress — 5 points dorés haut droite
───────────────────────────────────────────────────── */
function PhaseProgress({ phase }) {
  const dot = Math.floor(phase);
  return (
    <div style={{
      position: 'absolute', top: '24px', right: '28px',
      display: 'flex', gap: '8px', alignItems: 'center',
      zIndex: 30, pointerEvents: 'none',
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          width: i <= dot ? '8px' : '5px',
          height: i <= dot ? '8px' : '5px',
          borderRadius: '50%',
          background: i <= dot ? '#D2B98E' : 'rgba(210,185,142,0.2)',
          boxShadow: i <= dot ? '0 0 8px rgba(210,185,142,0.7), 0 0 16px rgba(210,185,142,0.3)' : 'none',
          border: i <= dot ? 'none' : '1px solid rgba(210,185,142,0.25)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CameraCenter — force la caméra à regarder exactement
   vers (0, offsetY, 0) pour un centrage parfait du masque
───────────────────────────────────────────────────── */
function CameraCenter({ offsetY = 0, offsetX = 0 }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(offsetX, offsetY, 0);
    camera.updateProjectionMatrix();
  }, [camera, offsetY, offsetX]);
  return null;
}

/* ─────────────────────────────────────────────────────
   MasqueReveal — GLB 3D + textes séquentiels + 10s + zoom
───────────────────────────────────────────────────── */
const MASQUE_STEPS = [
  { fr: 'Un masque Gueledé', en: 'A Gueledé mask', delay: 1200 },
  { fr: 'Gardien des secrets ancestraux', en: 'Guardian of ancestral secrets', delay: 3500 },
  { fr: 'Taillé dans le bois sacré du Bénin', en: 'Carved from the sacred wood of Benin', delay: 6000 },
];

function MasqueReveal({ visible, onZoomComplete, lang }) {
  const wrapRef    = useRef(null);
  const glowRef    = useRef(null);
  const overlayRef = useRef(null);
  const [stepIdx, setStepIdx] = useState(-1);

  useEffect(() => {
    if (!visible) { setStepIdx(-1); return; }

    // Fade in du masque
    gsap.fromTo(wrapRef.current,
      { opacity: 0, scale: 0.75 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out' }
    );
    gsap.fromTo(glowRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', delay: 0.4 }
    );

    // Textes séquentiels
    const timers = MASQUE_STEPS.map((_, i) =>
      setTimeout(() => setStepIdx(i), MASQUE_STEPS[i].delay)
    );

    // Après 10s → zoom + fade noir
    const zoomTimer = setTimeout(() => {
      gsap.to(wrapRef.current, { scale: 2.4, opacity: 0.5, duration: 2.0, ease: 'power3.in' });
      gsap.to(overlayRef.current, {
        opacity: 1, duration: 1.5, ease: 'power2.in', delay: 0.6,
        onComplete: () => { if (onZoomComplete) onZoomComplete(); },
      });
    }, 10000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(zoomTimer);
    };
  }, [visible, onZoomComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0" style={{ zIndex: 20 }}>

      {/* Halo doré — centré sur la zone masque (haut 78% de l'écran) */}
      <div ref={glowRef} style={{
        position: 'absolute',
        top: '39%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(70vw, 55vh, 700px)', height: 'min(70vw, 55vh, 700px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(210,185,142,0.28) 0%, rgba(255,140,20,0.07) 45%, transparent 70%)',
        opacity: 0, pointerEvents: 'none',
      }} />

      {/* Canvas GLB — PLEIN ÉCRAN, caméra pointée pour centrer dans les 78% hauts */}
      <div ref={wrapRef} style={{
        position: 'absolute',
        inset: 0,
        opacity: 0,
      }}>
        <Canvas
          camera={{ position: [0, 1.4, 6.8], fov: 42 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            <CameraCenter offsetY={0} offsetX={0} />
            <MasqueErrorBoundary>
              <MasqueScene visible={true} />
            </MasqueErrorBoundary>
          </Suspense>
        </Canvas>
      </div>

      {/* Panneau latéral droit — textes à côté du masque */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: 'clamp(140px, 32vw, 280px)',
        height: '78%',  // même hauteur que la zone masque
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 40px) clamp(16px, 3vw, 32px)',
        zIndex: 25,
        pointerEvents: 'none',
        gap: '24px',
      }}>
        {/* Ligne décorative verticale */}
        <div style={{
          position: 'absolute',
          left: 0, top: '15%', bottom: '15%',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(210,185,142,0.4) 30%, rgba(210,185,142,0.4) 70%, transparent)',
        }} />

        {/* Toutes les étapes affichées — s'illuminent une à une */}
        {MASQUE_STEPS.map((step, i) => {
          const isActive   = stepIdx >= i;
          const isCurrent  = stepIdx === i;
          const label = lang === 'fr' ? step.fr : step.en;
          return (
            <div key={i} style={{
              opacity: isActive ? 1 : 0.18,
              transition: 'opacity 0.8s ease',
              paddingLeft: 'clamp(12px, 2vw, 20px)',
            }}>
              {/* Numéro */}
              <span style={{
                display: 'block',
                fontSize: 'clamp(0.45rem, 1vw, 0.55rem)',
                letterSpacing: '0.4em',
                color: isActive ? '#D2B98E' : 'rgba(210,185,142,0.4)',
                textTransform: 'uppercase',
                marginBottom: '4px',
                fontFamily: 'monospace',
              }}>
                0{i + 1}
              </span>
              {/* Texte */}
              <span style={{
                display: 'block',
                fontFamily: isCurrent ? 'serif' : "'Playfair Display', serif",
                fontStyle: isCurrent ? 'italic' : 'normal',
                fontSize: isCurrent
                  ? 'clamp(0.75rem, 1.8vw, 1rem)'
                  : 'clamp(0.6rem, 1.4vw, 0.8rem)',
                fontWeight: isCurrent ? 400 : 300,
                color: isCurrent ? '#FFFFFF' : 'rgba(210,185,142,0.65)',
                textShadow: isCurrent
                  ? '0 0 20px rgba(210,185,142,0.5), 0 2px 8px rgba(0,0,0,1)'
                  : 'none',
                lineHeight: 1.4,
                transition: 'all 0.6s ease',
                wordBreak: 'break-word',
              }}>
                {label}
              </span>
              {/* Petite barre sous l'étape active */}
              {isCurrent && (
                <div style={{
                  width: 'clamp(20px, 3vw, 32px)',
                  height: '1px',
                  background: '#D2B98E',
                  marginTop: '6px',
                  animation: 'fadeInUp 0.5s ease forwards',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bas de l'écran — juste le label "LE GARDIEN SE RÉVÈLE" */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '22%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 25,
        pointerEvents: 'none',
        borderTop: '1px solid rgba(210,185,142,0.08)',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(210,185,142,0.15)',
          padding: 'clamp(8px,1.5vh,12px) clamp(20px,5vw,48px)',
        }}>
          <span style={{
            fontSize: 'clamp(0.55rem, 1.6vw, 0.75rem)',
            letterSpacing: 'clamp(0.25em, 1.2vw, 0.5em)',
            color: '#D2B98E',
            textTransform: 'uppercase',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            textShadow: '0 0 16px rgba(210,185,142,0.4)',
          }}>
            {lang === 'fr' ? 'Le Gardien se Révèle' : 'The Guardian is Revealed'}
          </span>
        </div>
      </div>

      {/* Fade noir final */}
      <div ref={overlayRef} style={{
        position: 'fixed', inset: 0, background: '#000',
        opacity: 0, zIndex: 50, pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   INITIATION SEQUENCE
   0  → Accueil  : galaxie + logo + DÉCOUVRIR
   1  → Braise   : feu plein écran (3.5s)
   2  → Vévé     : tracé SVG + citation (durée auto)
   3  → Lignes   : lignes dorées + éclair + blast
   3.5→ Tunnel   : anneaux 3D vers l'infini (2s)
   4  → Masque   : photo + zoom + fade → /accueil
═════════════════════════════════════════════════════ */
export default function InitiationSequence() {
  const navigate      = useNavigate();
  const { playSound } = useSound();
  const { lang }      = useLanguage();

  const [phase,       setPhase]       = useState(0);
  const [shockwave,   setShockwave]   = useState(false);
  const [bgColor,     setBgColor]     = useState(PHASE_BG[0]);
  const [vortex,      setVortex]      = useState(0);
  const [showGalaxy,  setShowGalaxy]  = useState(true); // reste true pendant la transition
  const galaxySpeedRef   = useRef(1);
  const galaxyOpacityRef = useRef(1);

  const logoRef = useRef(null);
  const btnRef  = useRef(null);
  const bgRef   = useRef(null);

  usePageMeta({
    title: 'Initiation — Vodun Concept Store',
    description: lang === 'fr'
      ? 'Entrez dans l\'univers Vodun Concept Store.'
      : 'Enter the Vodun Concept Store universe.',
  });

  useEffect(() => { preloadAccueil(); }, []);

  useEffect(() => {
    const key = phase in PHASE_BG ? phase : 0;
    const target = PHASE_BG[key];
    if (bgRef.current) {
      gsap.to(bgRef.current, { backgroundColor: target, duration: 1.1, ease: 'power2.inOut' });
    }
    setBgColor(target);
  }, [phase]);

  const t = {
    discover : lang === 'fr' ? 'DÉCOUVRIR'            : 'DISCOVER',
    skip     : lang === 'fr' ? 'PASSER L\'INITIATION' : 'SKIP INITIATION',
    heritage : lang === 'fr' ? 'LE FEU ANCESTRAL S\'ÉVEILLE' : 'THE ANCESTRAL FIRE AWAKENS',
    veve     : lang === 'fr' ? 'LE SYMBOLE SE TRACE'         : 'THE SYMBOL IS DRAWN',
    tunnel   : lang === 'fr' ? 'ENTREZ DANS LE TEMPLE'       : 'ENTER THE TEMPLE',
    masque   : lang === 'fr' ? 'LE GARDIEN SE RÉVÈLE'        : 'THE GUARDIAN IS REVEALED',
    citation : lang === 'fr'
      ? '"Là où le sacré devient désirable..."'
      : '"Where the sacred becomes desirable..."',
  };

  const goToAccueil = useCallback(() => navigate('/accueil'), [navigate]);

  /* ═══ blast → tunnel → masque ═══ */
  const onBlastComplete = useCallback(() => {
    setShockwave(true);
    setPhase(3.5);
    setTimeout(() => setPhase(4), 3500); // tunnel 3.5s (vs 2.2s) pour profiter de l'effet
  }, []);

  /* ═══ vévé → lignes ═══ */
  const onVeveComplete = useCallback(() => {
    setTimeout(() => setPhase(3), 600); // un peu plus de temps pour lire la citation
  }, []);

  /* ═══ braise (phase 1) ═══ */
  const startSequence = useCallback(() => {
    playSound();

    // Logo/boutons disparaissent immédiatement
    gsap.to([logoRef.current, btnRef.current], {
      opacity: 0, y: -24, scale: 0.94,
      duration: 0.5, ease: 'power2.in', stagger: 0.06,
    });

    // ─── Phase 0 → 1 : transition continue sans coupure ───
    // Les deux (galaxie + braises) sont actifs en même temps

    // 1. Galaxie accélère immédiatement
    galaxySpeedRef.current = 1;
    const speedObj = { v: 1 };
    gsap.to(speedObj, {
      v: 12, duration: 0.9, ease: 'power3.in',
      onUpdate: () => { galaxySpeedRef.current = speedObj.v; },
    });

    // 2. Phase 1 démarre TOUT DE SUITE (braises apparaissent)
    //    Vortex à 0 → les braises montent normalement d'abord
    setPhase(1);
    setVortex(0);
    setShowGalaxy(true); // galaxie reste visible

    // 3. Galaxie s'efface progressivement après 0.4s — fondu long et doux
    setTimeout(() => {
      const opacityObj = { v: 1 };
      gsap.to(opacityObj, {
        v: 0,
        duration: 2.5,   // 2.5s de fondu doux (vs 1.4s avant)
        ease: 'power1.inOut',  // ease linéaire pour éviter la coupure brusque
        onUpdate: () => { galaxyOpacityRef.current = opacityObj.v; },
        onComplete: () => {
          // Attendre 300ms supplémentaires pour que le dernier frame soit rendu
          setTimeout(() => setShowGalaxy(false), 300);
        },
      });
    }, 400);

    // 4. Vortex commence à mi-chemin de la phase braise
    const vortexObj = { v: 0 };
    setTimeout(() => {
      gsap.to(vortexObj, {
        v: 1, duration: 2.2, ease: 'power2.inOut',
        onUpdate: () => setVortex(vortexObj.v),
      });
    }, 2000);

    // 5. Passage au vévé
    setTimeout(() => setPhase(2), 4500);
  }, [playSound]);

  const skipAll = useCallback(() => {
    playSound();
    setPhase(3);
  }, [playSound]);

  return (
    <div ref={bgRef} className="fixed inset-0 overflow-hidden"
      style={{ background: bgColor, zIndex: 100 }}>

      {/* Compteur de phases */}
      <PhaseProgress phase={phase} />

      {/* ═══ CANVAS THREE.JS ═══ */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 7], fov: 65 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}>
          <Suspense fallback={null}>
            {/* Galaxie — phase 0 + pendant transition (showGalaxy) */}
            {(phase === 0 || showGalaxy) && (
              <GalaxyBackground speedRef={galaxySpeedRef} opacityRef={galaxyOpacityRef} />
            )}
            <BraiseParticles
              active={phase >= 1}
              intensity={phase === 1 ? 1.0 : phase === 3.5 ? 1.15 : 1.0}
              vortex={phase === 1 ? vortex : 1.0}
            />
            {/* Tunnel — phase 3.5 */}
            <TunnelEffect active={phase === 3.5} speed={1.4} />
          </Suspense>
        </Canvas>
      </div>

      {/* ═══ VÉVÉ — phase 2 ═══ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <VeveTrace visible={phase === 2} onComplete={onVeveComplete} />
      </div>

      {/* ═══ TEXTES DE PHASE — position et style unique par phase ═══ */}
      <PhaseText text={t.heritage} visible={phase === 1}   phaseKey="heritage" />
      <PhaseText text={t.veve}     visible={phase === 2}   phaseKey="veve" />
      <PhaseText text={t.tunnel}   visible={phase === 3.5} phaseKey="tunnel" />
      <PhaseText text={t.masque}   visible={phase === 4}   phaseKey="masque" />

      {/* ═══ CITATION — phase 2, sous le vévé ═══ */}
      {phase === 2 && (
        <div className="absolute inset-x-0 flex justify-center pointer-events-none px-4"
          style={{ bottom: 'clamp(40px, 10vh, 80px)', zIndex: 15 }}>
          <div style={{
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(210,185,142,0.15)',
            padding: 'clamp(12px, 3vw, 18px) clamp(16px, 5vw, 36px)',
            maxWidth: 'min(580px, 90vw)',
            width: '100%',
            textAlign: 'center',
            animation: 'fadeInUp 1s ease forwards',
          }}>
            <TypeWriter text={t.citation} visible={phase === 2} delay={800} />
          </div>
        </div>
      )}

      {/* ═══ LIGNES DORÉES + BLAST — phase 3 ═══ */}
      <GoldenLines visible={phase === 3} onBlastComplete={onBlastComplete} />

      {/* Onde de choc blast → tunnel */}
      <ShockWave trigger={shockwave} />

      {/* ═══ MASQUE RÉVÉLÉ — phase 4 ═══ */}
      <MasqueReveal visible={phase === 4} onZoomComplete={goToAccueil} lang={lang} />

      {/* ═══ LOGO + BOUTONS — phase 0 ═══ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4"
        style={{ zIndex: 10, pointerEvents: phase === 0 ? 'auto' : 'none' }}>
        <div ref={logoRef} className="mb-6 text-center w-full">
          <div className="relative inline-block"
            style={{
              padding: 'clamp(20px, 5vw, 32px) clamp(24px, 7vw, 40px)',
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(210,185,142,0.08)',
              maxWidth: '90vw',
            }}>
            <span aria-hidden="true" className="font-playfair font-black uppercase leading-[0.85] block absolute inset-x-0 top-0"
              style={{ fontSize: 'clamp(2.2rem, 12vw, 7rem)', letterSpacing: '-0.04em',
                color: '#D2B98E', opacity: 0.22, filter: 'blur(20px)', pointerEvents: 'none',
                top: 'clamp(20px, 5vw, 32px)' }}>
              VODUN
            </span>
            <span className="font-playfair font-black uppercase leading-[0.85] block relative"
              style={{ fontSize: 'clamp(2.2rem, 12vw, 7rem)', letterSpacing: '-0.04em', color: 'white',
                textShadow: '0 0 50px rgba(210,185,142,0.35), 0 4px 15px rgba(0,0,0,1)' }}>
              VODUN
            </span>
            <span className="font-playfair font-bold uppercase block relative"
              style={{
                fontSize: 'clamp(0.55rem, 2.5vw, 1rem)',
                letterSpacing: 'clamp(0.2em, 1.5vw, 0.45em)',
                color: '#D2B98E',
                textShadow: '0 0 25px rgba(210,185,142,0.7)',
                marginTop: '4px',
              }}>
              CONCEPT STORE
            </span>
          </div>
        </div>

        <div ref={btnRef} className="flex flex-col items-center gap-4 w-full" style={{ maxWidth: '320px' }}>
          {/* DÉCOUVRIR */}
          <button onClick={startSequence} style={{
            width: '100%',
            padding: 'clamp(14px, 3.5vw, 20px) clamp(28px, 8vw, 56px)',
            border: '1px solid rgba(210,185,142,0.45)',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(14px)',
            cursor: 'pointer', transition: 'border-color 0.4s, box-shadow 0.4s, transform 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#D2B98E'; e.currentTarget.style.boxShadow = '0 0 35px rgba(210,185,142,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(210,185,142,0.45)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 2vw, 0.75rem)',
              letterSpacing: 'clamp(0.3em, 1.5vw, 0.65em)',
              fontWeight: 700, textTransform: 'uppercase',
              color: 'white', textShadow: '0 2px 10px rgba(0,0,0,1)',
            }}>
              {t.discover}
            </span>
          </button>

          {/* PASSER */}
          <button onClick={skipAll} style={{
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            padding: 'clamp(5px, 1.5vw, 7px) clamp(12px, 4vw, 20px)',
            border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)',
            letterSpacing: 'clamp(0.2em, 1vw, 0.42em)',
            fontWeight: 600, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', transition: 'color 0.3s, border-color 0.3s',
            textShadow: '0 0 12px rgba(0,0,0,1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D2B98E'; e.currentTarget.style.borderColor = 'rgba(210,185,142,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
            {t.skip}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes masqueStepIn {
          0%   { opacity: 0; transform: translateY(20px); }
          60%  { opacity: 1; transform: translateY(-3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
