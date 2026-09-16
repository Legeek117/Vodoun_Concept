import { useEffect, useRef, useState, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';

import { useSound } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import usePageMeta from '../hooks/usePageMeta';
import BraiseParticles from './initiation/BraiseParticles';
import MasqueScene from './initiation/MasqueScene';
import VeveTrace from './initiation/VeveTrace';

// Préchargement du chunk /accueil pendant l'intro
const preloadAccueil = () => import('../App');

/**
 * PHASES :
 * 0 — Écran d'accueil  : galaxie + logo + bouton DÉCOUVRIR
 * 1 — Braise           : particules de feu montent du bas (2s)
 * 2 — Vévé             : tracé trait par trait (2.5s)
 * 3 — Masque           : masque africain 3D apparaît, yeux s'allument (3s)
 * 4 — Ondulation       : distorsion Mami Wata (1s)
 * 5 — Déchirure        : split horizontal → page d'accueil révélée
 */

export default function InitiationSequence() {
  const navigate   = useNavigate();
  const { playSound } = useSound();
  const { lang }   = useLanguage();
  const [phase, setPhase]       = useState(0);
  const [eyesOn, setEyesOn]     = useState(false);
  const [ripple, setRipple]     = useState(false);

  // DOM refs
  const containerRef  = useRef(null);
  const topPanelRef   = useRef(null);
  const botPanelRef   = useRef(null);
  const flashRef      = useRef(null);
  const logoRef       = useRef(null);
  const btnRef        = useRef(null);
  const canvasWrapRef = useRef(null);
  const masqueGlowRef = useRef(null);

  usePageMeta({
    title: lang === 'fr' ? 'Initiation — Vodun Concept Store' : 'Initiation — Vodun Concept Store',
    description: lang === 'fr'
      ? 'Entrez dans l\'univers Vodun Concept Store. Une initiation cinématique vous attend.'
      : 'Enter the Vodun Concept Store universe. A cinematic initiation awaits.',
  });

  // Précharger le chunk App dès le montage
  useEffect(() => { preloadAccueil(); }, []);

  /* ─── Textes i18n ─── */
  const t = {
    discover : lang === 'fr' ? 'DÉCOUVRIR' : 'DISCOVER',
    skip     : lang === 'fr' ? 'PASSER L\'INITIATION' : 'SKIP INITIATION',
    ritual   : lang === 'fr' ? 'L\'INITIATION COMMENCE' : 'THE INITIATION BEGINS',
  };

  /* ─── Navigation finale vers /accueil ─── */
  const goToAccueil = useCallback(() => {
    navigate('/accueil');
  }, [navigate]);

  /* ─── Phase 5 — Déchirure ─── */
  const playTearApart = useCallback(() => {
    setPhase(5);
    const top = topPanelRef.current;
    const bot = botPanelRef.current;
    const fl  = flashRef.current;
    if (!top || !bot || !fl) return;

    gsap.timeline()
      // Flash doré
      .to(fl, { opacity: 1, duration: 0.15, ease: 'power4.in' })
      .to(fl, { opacity: 0, duration: 0.35, ease: 'power2.out' })
      // Split : haut monte, bas descend
      .to(top, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=0.2')
      .to(bot, { yPercent:  100, duration: 1.1, ease: 'power4.inOut' }, '<')
      .call(goToAccueil);
  }, [goToAccueil]);

  /* ─── Phase 4 — Ondulation Mami Wata ─── */
  const playRipple = useCallback(() => {
    setPhase(4);
    setRipple(true);
    setTimeout(() => playTearApart(), 1200);
  }, [playTearApart]);

  /* ─── Phase 3 — Masque + yeux ─── */
  const playMasque = useCallback(() => {
    setPhase(3);

    // Fade in du masque
    gsap.fromTo(canvasWrapRef.current,
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }
    );

    // Yeux s'allument après 1.5s
    setTimeout(() => {
      setEyesOn(true);
      if (masqueGlowRef.current) {
        gsap.fromTo(masqueGlowRef.current,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1.4, duration: 0.6, ease: 'power3.out',
            onComplete: () => {
              gsap.to(masqueGlowRef.current, { opacity: 0, scale: 2, duration: 0.5, ease: 'power2.in' });
            }
          }
        );
      }
    }, 1500);

    // Passer à l'ondulation après 3s
    setTimeout(() => playRipple(), 3200);
  }, [playRipple]);

  /* ─── Phase 2 — Vévé tracé ─── */
  const onVeveComplete = useCallback(() => {
    setTimeout(() => playMasque(), 400);
  }, [playMasque]);

  const playVeve = useCallback(() => {
    setPhase(2);
    // Le VeveTrace s'anime seul et appelle onVeveComplete
  }, []);

  /* ─── Phase 1 — Braise ─── */
  const startSequence = useCallback(() => {
    playSound();
    setPhase(1);

    // Faire disparaître le logo/bouton
    gsap.to([logoRef.current, btnRef.current], {
      opacity: 0, y: -20, duration: 0.6, ease: 'power2.in', stagger: 0.1,
    });

    // Après 2s de braise → vévé
    setTimeout(() => playVeve(), 2000);
  }, [playSound, playVeve]);

  /* ─── Skip direct ─── */
  const skipAll = useCallback(() => {
    playSound();
    playTearApart();
  }, [playSound, playTearApart]);

  /* ─── Classes ripple ─── */
  const rippleStyle = ripple ? {
    animation: 'mamiWataRipple 1.2s ease-in-out forwards',
  } : {};

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background: '#0A0705', zIndex: 100 }}
    >
      {/* ═══ PANNEAU HAUT (déchirure) ═══ */}
      <div
        ref={topPanelRef}
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{ height: '50%', background: '#0A0705', zIndex: 20 }}
      />
      {/* ═══ PANNEAU BAS (déchirure) ═══ */}
      <div
        ref={botPanelRef}
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '50%', background: '#0A0705', zIndex: 20 }}
      />

      {/* ═══ FLASH DORÉ (phase 5) ═══ */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(210,185,142,0.95) 0%, rgba(210,185,142,0.0) 70%)',
          opacity: 0,
          zIndex: 30,
        }}
      />

      {/* ═══ CANVAS THREE.JS ═══ */}
      <div
        ref={canvasWrapRef}
        className="absolute inset-0"
        style={{ opacity: phase === 0 ? 1 : phase >= 1 ? 1 : 0 }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            {/* Phase 1 : braise active */}
            <BraiseParticles active={phase >= 1 && phase < 3} intensity={phase === 2 ? 0.5 : 1.0} />

            {/* Phase 0 : galaxie de fond */}
            {phase === 0 && <GalaxyBackground />}

            {/* Phase 3 : masque */}
            <MasqueScene visible={phase === 3 || phase === 4} phase={phase} />
          </Suspense>
        </Canvas>
      </div>

      {/* ═══ VÉVÉ TRACÉ (phase 2) ═══ */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10, pointerEvents: 'none' }}>
        <VeveTrace visible={phase === 2} onComplete={onVeveComplete} />
      </div>

      {/* ═══ YEUX DU MASQUE (phase 3) ═══ */}
      {eyesOn && phase === 3 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 15 }}
        >
          <div style={{ position: 'relative', width: '320px', height: '400px' }}>
            {/* Œil gauche */}
            <div style={{
              position: 'absolute', top: '38%', left: '33%',
              width: '18px', height: '10px',
              background: 'radial-gradient(ellipse, rgba(255,255,220,0.95) 0%, rgba(255,200,80,0.6) 60%, transparent 100%)',
              borderRadius: '50%',
              filter: 'blur(2px)',
              animation: 'eyeGlow 0.8s ease-out forwards',
            }} />
            {/* Œil droit */}
            <div style={{
              position: 'absolute', top: '38%', right: '33%',
              width: '18px', height: '10px',
              background: 'radial-gradient(ellipse, rgba(255,255,220,0.95) 0%, rgba(255,200,80,0.6) 60%, transparent 100%)',
              borderRadius: '50%',
              filter: 'blur(2px)',
              animation: 'eyeGlow 0.8s ease-out forwards',
            }} />
          </div>
        </div>
      )}

      {/* ═══ HALO MASQUE ═══ */}
      <div
        ref={masqueGlowRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 12, opacity: 0 }}
      >
        <div style={{
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(210,185,142,0.5) 0%, transparent 70%)',
        }} />
      </div>

      {/* ═══ CONTENU PHASE 0 — Logo + Boutons ═══ */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ zIndex: 10, pointerEvents: phase === 0 ? 'auto' : 'none' }}
      >
        {/* Logo */}
        <div ref={logoRef} className="mb-8 text-center">
          <div className="relative inline-block px-10 py-8 bg-black/50 backdrop-blur-xl border border-white/5">
            <span
              className="font-playfair font-black uppercase leading-[0.85] block"
              style={{
                fontSize: 'clamp(3rem, 10vw, 7rem)',
                letterSpacing: '-0.04em',
                color: 'white',
                textShadow: '0 0 40px rgba(210,185,142,0.4), 0 4px 12px rgba(0,0,0,1)',
              }}
            >
              VODUN
            </span>
            <span
              className="font-playfair font-bold uppercase block tracking-[0.45em]"
              style={{
                fontSize: 'clamp(0.75rem, 2vw, 1.1rem)',
                color: '#D2B98E',
                textShadow: '0 0 20px rgba(210,185,142,0.6)',
              }}
            >
              CONCEPT STORE
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div ref={btnRef} className="flex flex-col items-center gap-5">
          <button
            onClick={startSequence}
            className="group relative overflow-hidden"
            style={{
              padding: '18px 52px',
              border: '1px solid rgba(210,185,142,0.4)',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.5s, box-shadow 0.5s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#D2B98E';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(210,185,142,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(210,185,142,0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{
              fontSize: '0.75rem',
              letterSpacing: '0.6em',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'white',
              textShadow: '0 2px 8px rgba(0,0,0,1)',
            }}>
              {t.discover}
            </span>
          </button>

          <button
            onClick={skipAll}
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              fontSize: '0.68rem',
              letterSpacing: '0.4em',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s',
              textShadow: '0 0 12px rgba(0,0,0,1)',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#D2B98E'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
          >
            {t.skip}
          </button>
        </div>
      </div>

      {/* ═══ MESSAGE PHASE 1 ═══ */}
      {phase === 1 && (
        <div
          className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none"
          style={{ zIndex: 10 }}
        >
          <span style={{
            fontSize: '0.65rem',
            letterSpacing: '0.5em',
            color: 'rgba(210,185,142,0.5)',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(0,0,0,1)',
            animation: 'fadeInUp 1s ease forwards',
          }}>
            {t.ritual}
          </span>
        </div>
      )}

      {/* ═══ OVERLAY ONDULATION (phase 4) ═══ */}
      {ripple && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 16, ...rippleStyle }}
        />
      )}

      {/* ═══ STYLES ANIMÉS ═══ */}
      <style>{`
        @keyframes eyeGlow {
          0%   { opacity: 0; transform: scale(0.3); }
          50%  { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0.8; transform: scale(1); }
        }

        @keyframes mamiWataRipple {
          0%   { filter: none; }
          20%  { filter: blur(3px) brightness(1.3) hue-rotate(5deg); transform: scale(1.01) skewX(1deg); }
          40%  { filter: blur(6px) brightness(1.6) hue-rotate(-5deg); transform: scale(1.02) skewX(-1.5deg); }
          60%  { filter: blur(4px) brightness(1.4) hue-rotate(3deg); transform: scale(1.01) skewX(0.5deg); }
          80%  { filter: blur(2px) brightness(1.1); transform: scale(1); }
          100% { filter: none; transform: none; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Galaxie de fond pour phase 0 ─── */
import { useRef as useThreeRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GalaxyBackground() {
  const ref = useThreeRef(null);
  const count = 6000;

  const { positions, colors } = (() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 10;
      const branch = ((i % 3) / 3) * Math.PI * 2;
      const spin   = radius * 0.8;
      const rx = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius;
      const ry = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.08 * radius;
      const rz = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.3 * radius;
      pos[i * 3]     = Math.cos(branch + spin) * radius + rx;
      pos[i * 3 + 1] = ry;
      pos[i * 3 + 2] = Math.sin(branch + spin) * radius + rz;
      const t = radius / 10;
      const ci = new THREE.Color('#D2B98E');
      const co = new THREE.Color('#3D2B0A');
      const mc = ci.lerp(co, t);
      col[i * 3]     = mc.r;
      col[i * 3 + 1] = mc.g;
      col[i * 3 + 2] = mc.b;
    }
    return { positions: pos, colors: col };
  })();

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.1;
    }
  });

  return (
    <points ref={ref} position={[0, -1, -6]} rotation={[0.35, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05} sizeAttenuation vertexColors transparent opacity={0.85}
        depthWrite={false} blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
