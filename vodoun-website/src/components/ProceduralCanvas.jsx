import { useEffect, useRef } from 'react';

/**
 * ProceduralCanvas — Fond animé procédural
 *
 * Couvre tout l'arrière-plan avec :
 * - Fond sombre qui change de couleur selon le scroll
 * - Particules dorées flottantes
 * - Braises qui montent depuis le bas
 * - Motifs géométriques légers inspirés des vévés
 *
 * Props :
 *  scrollProgress : 0→1 (position dans la zone scrollable)
 *  className / style : passés au canvas
 */

// Palette de couleurs selon la progression scroll
const PHASES = [
  { at: 0.00, bg: [10,  7,  5],  ember: [200,  80, 10], gold: [210, 185, 142] },
  { at: 0.25, bg: [22,  6,  2],  ember: [255, 100, 20], gold: [220, 160,  80] },
  { at: 0.50, bg: [18, 12,  4],  ember: [200, 140, 20], gold: [230, 190, 100] },
  { at: 0.75, bg: [10,  8,  5],  ember: [180, 100, 15], gold: [210, 185, 142] },
  { at: 1.00, bg: [ 6,  4,  2],  ember: [150,  60,  5], gold: [180, 140, 100] },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function getPalette(p) {
  let lo = PHASES[0], hi = PHASES[PHASES.length - 1];
  for (let i = 0; i < PHASES.length - 1; i++) {
    if (p >= PHASES[i].at && p <= PHASES[i + 1].at) {
      lo = PHASES[i]; hi = PHASES[i + 1];
      break;
    }
  }
  const t = lo.at === hi.at ? 0 : (p - lo.at) / (hi.at - lo.at);
  return {
    bg:    lo.bg.map((v, i)    => Math.round(lerp(v, hi.bg[i],    t))),
    ember: lo.ember.map((v, i) => Math.round(lerp(v, hi.ember[i], t))),
    gold:  lo.gold.map((v, i)  => Math.round(lerp(v, hi.gold[i],  t))),
  };
}

const PARTICLE_COUNT = 250;
const EMBER_COUNT    = 100;

function createParticles(W, H) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(0.1 + Math.random() * 0.35),
    r: 1 + Math.random() * 2.5,
    life: Math.random(),
    maxLife: 0.5 + Math.random() * 1.0,
    type: Math.random() < 0.65 ? 'gold' : 'ember',
  }));
}

function createEmbers(W, H) {
  return Array.from({ length: EMBER_COUNT }, () => ({
    x: Math.random() * W,
    y: H * (0.5 + Math.random() * 0.5),
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.6 + Math.random() * 1.2),
    r: 0.8 + Math.random() * 1.8,
    life: Math.random(),
    maxLife: 0.7 + Math.random() * 0.8,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05,
  }));
}

export default function ProceduralCanvas({ scrollProgress = 0, className = '', style = {} }) {
  const canvasRef     = useRef(null);
  const stateRef      = useRef(null);
  const progRef       = useRef(scrollProgress);
  const rafRef        = useRef(null);

  // Sync scroll sans re-render
  useEffect(() => { progRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize — le canvas doit couvrir TOUT l'écran
    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!stateRef.current) {
        stateRef.current = {
          particles: createParticles(canvas.width, canvas.height),
          embers:    createEmbers(canvas.width, canvas.height),
        };
      }
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Boucle d'animation
    const animate = (ts) => {
      const W   = canvas.width;
      const H   = canvas.height;
      const p   = progRef.current;
      const pal = getPalette(p);
      const { particles, embers } = stateRef.current;

      // ── Fond avec traîne légère ──────────────────────────────
      ctx.fillStyle = `rgba(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]},0.20)`;
      ctx.fillRect(0, 0, W, H);

      // ── Halo central doré ────────────────────────────────────
      const halo = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.65);
      halo.addColorStop(0,   `rgba(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]},0.09)`);
      halo.addColorStop(0.6, `rgba(${pal.ember[0]},${pal.ember[1]},${pal.ember[2]},0.04)`);
      halo.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      // ── Motifs vévé (apparaissent à partir de 15% scroll) ───
      const vFade = Math.max(0, Math.min(1, (p - 0.15) / 0.35));
      if (vFade > 0) {
        const cx = W / 2, cy = H / 2;
        const vr = Math.min(W, H) * 0.30;
        ctx.save();
        ctx.globalAlpha = vFade * 0.10;
        ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;

        // Cercles
        [0.38, 0.68, 1.0].forEach(f => {
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, vr * f, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Lignes cardinales
        ctx.lineWidth = 0.4;
        [0, 1, 2, 3].forEach(i => {
          const a = (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * vr, cy + Math.sin(a) * vr);
          ctx.stroke();
        });

        // Losange
        const ld = vr * 0.4;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ld); ctx.lineTo(cx + ld, cy);
        ctx.lineTo(cx, cy + ld); ctx.lineTo(cx - ld, cy);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }

      const dt = 0.016;

      // ── Particules dorées ────────────────────────────────────
      particles.forEach(pk => {
        pk.life += dt * 0.3;
        if (pk.life > pk.maxLife) {
          pk.x = Math.random() * W;
          pk.y = H + 5;
          pk.life = 0;
          pk.vx = (Math.random() - 0.5) * 0.25;
          pk.vy = -(0.1 + Math.random() * 0.35);
        }
        pk.x += pk.vx + Math.sin(ts * 0.0008 + pk.life * 3) * 0.12;
        pk.y += pk.vy;

        const t    = pk.life / pk.maxLife;
        const fade = t < 0.2 ? t / 0.2 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
        const col  = pk.type === 'gold' ? pal.gold : pal.ember;

        ctx.beginPath();
        ctx.arc(pk.x, pk.y, pk.r * fade, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${fade * 0.75})`;
        ctx.fill();
      });

      // ── Braises ───────────────────────────────────────────────
      const ei = 0.4 + p * 0.6; // intensité monte avec le scroll
      embers.forEach(e => {
        e.life += dt * 0.45 * ei;
        if (e.life > e.maxLife || e.y < -10) {
          e.x = Math.random() * W;
          e.y = H + 5;
          e.life = 0;
          e.vx = (Math.random() - 0.5) * 0.4;
          e.vy = -(0.6 + Math.random() * 1.2) * ei;
        }
        e.x += e.vx + Math.sin(e.angle) * 0.25;
        e.y += e.vy;
        e.angle += e.spin;

        const t    = e.life / e.maxLife;
        const fade = t < 0.15 ? t / 0.15 : t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
        const heat = Math.max(0, 1 - e.y / H);

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * fade, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pal.ember[0]},${Math.round(pal.ember[1] * (0.4 + heat * 0.6))},${Math.round(pal.ember[2] * heat * 0.5)},${fade * 0.9})`;
        ctx.shadowColor = `rgba(${pal.ember[0]},${pal.ember[1]},0,${fade * 0.35})`;
        ctx.shadowBlur  = 5;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
}
