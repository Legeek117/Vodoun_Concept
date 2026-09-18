import { useEffect, useRef, useCallback } from 'react';

/**
 * ProceduralCanvas — Option D
 *
 * Remplace les 461 frames JPG (43 MB) par un canvas 2D procédural.
 * Génère en temps réel :
 *  - Particules dorées flottantes (~200 pts)
 *  - Braises qui montent depuis le bas
 *  - Gradient de fond qui évolue au scroll (noir → rouge sombre → doré → noir)
 *  - Motifs géométriques inspirés des vévés qui apparaissent au scroll
 *
 * Props :
 *  scrollProgress : 0→1  (progression du scroll sur la zone immersive)
 *  className      : classes CSS supplémentaires
 *  style          : styles inline supplémentaires
 */

const PARTICLE_COUNT = 200;
const EMBER_COUNT    = 80;

// Palette par phase de scroll (0→1)
const PHASES = [
  { at: 0.00, bg: [10,  7,  5],  ember: [200, 80,  10], gold: [210, 185, 142] },
  { at: 0.25, bg: [22,  5,  2],  ember: [255, 100, 20], gold: [220, 160,  80] },
  { at: 0.50, bg: [18, 12,  4],  ember: [200, 140, 20], gold: [230, 190, 100] },
  { at: 0.75, bg: [10,  8,  5],  ember: [180, 100, 15], gold: [210, 185, 142] },
  { at: 1.00, bg: [6,   4,  2],  ember: [150,  60,  5], gold: [180, 140, 100] },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function interpolatePhase(progress) {
  let lo = PHASES[0], hi = PHASES[PHASES.length - 1];
  for (let i = 0; i < PHASES.length - 1; i++) {
    if (progress >= PHASES[i].at && progress <= PHASES[i + 1].at) {
      lo = PHASES[i]; hi = PHASES[i + 1];
      break;
    }
  }
  const t = lo.at === hi.at ? 0 : (progress - lo.at) / (hi.at - lo.at);
  return {
    bg:    lo.bg.map((v, i) => Math.round(lerp(v, hi.bg[i],    t))),
    ember: lo.ember.map((v, i) => Math.round(lerp(v, hi.ember[i], t))),
    gold:  lo.gold.map((v, i) => Math.round(lerp(v, hi.gold[i],  t))),
  };
}

export default function ProceduralCanvas({ scrollProgress = 0, className = '', style = {} }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef(null);  // données des particules
  const rafRef     = useRef(null);
  const progRef    = useRef(scrollProgress);

  // Mise à jour de la progression sans re-render
  useEffect(() => { progRef.current = scrollProgress; }, [scrollProgress]);

  // Initialise les particules une seule fois
  const initParticles = useCallback((W, H) => {
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.4),
      r: 1 + Math.random() * 2,
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.8,
      type: Math.random() < 0.6 ? 'gold' : 'ember',
    }));

    const embers = Array.from({ length: EMBER_COUNT }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.8 + Math.random() * 1.5),
      r: 0.8 + Math.random() * 1.5,
      life: Math.random(),
      maxLife: 0.8 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.06,
    }));

    // Motifs vévé — cercles et lignes qui apparaissent au scroll
    const veveLines = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      phaseStart: Math.random() * 0.5,
      length: 0.08 + Math.random() * 0.15,  // fraction de la largeur
    }));

    stateRef.current = { particles, embers, veveLines };
  }, []);

  const draw = useCallback((canvas, ctx, ts) => {
    const W = canvas.width;
    const H = canvas.height;
    const prog = progRef.current;
    const pal  = interpolatePhase(prog);
    const { particles, embers, veveLines } = stateRef.current;

    // ─── Fond avec légère traîne pour l'effet motion blur ───
    ctx.fillStyle = `rgba(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]}, 0.18)`;
    ctx.fillRect(0, 0, W, H);

    // ─── Gradient radial central ───
    const grd = ctx.createRadialGradient(W / 2, H * 0.6, 0, W / 2, H * 0.6, W * 0.55);
    grd.addColorStop(0,   `rgba(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]},0.06)`);
    grd.addColorStop(0.5, `rgba(${pal.ember[0]},${pal.ember[1]},${pal.ember[2]},0.03)`);
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // ─── Motifs vévé au centre ───
    const vEvol = Math.max(0, Math.min(1, (prog - 0.1) / 0.4)); // apparaît à 10% scroll
    if (vEvol > 0) {
      const cx = W / 2, cy = H / 2;
      const vr = Math.min(W, H) * 0.28;

      ctx.save();
      ctx.globalAlpha = vEvol * 0.12;

      // Cercles concentriques
      [0.4, 0.7, 1.0].forEach(factor => {
        ctx.beginPath();
        ctx.arc(cx, cy, vr * factor, 0, Math.PI * 2);
        ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Lignes radiales
      veveLines.forEach(line => {
        const phaseProg = Math.max(0, Math.min(1, (prog - line.phaseStart) / 0.3));
        if (phaseProg <= 0) return;
        const endR = vr * line.length * 3 * phaseProg;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(line.angle) * endR, cy + Math.sin(line.angle) * endR);
        ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      });

      // Losange central
      const ld = vr * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ld); ctx.lineTo(cx + ld, cy);
      ctx.lineTo(cx, cy + ld); ctx.lineTo(cx - ld, cy);
      ctx.closePath();
      ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    const dt = 0.016; // ~60fps

    // ─── Particules dorées flottantes ───
    particles.forEach(p => {
      p.life += dt * 0.35;
      if (p.life > p.maxLife) {
        p.x = Math.random() * W;
        p.y = H + 10;
        p.life = 0;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = -(0.1 + Math.random() * 0.4);
      }
      p.x += p.vx;
      p.y += p.vy;
      p.x += Math.sin(ts * 0.001 + p.life * 3) * 0.15;

      const t = p.life / p.maxLife;
      const fade = t < 0.2 ? t / 0.2 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      const col  = p.type === 'gold' ? pal.gold : pal.ember;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * fade, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${fade * 0.7})`;
      ctx.fill();
    });

    // ─── Braises qui montent depuis le bas ───
    const emberIntensity = 0.3 + prog * 0.7;
    embers.forEach(e => {
      e.life += dt * 0.5 * emberIntensity;
      if (e.life > e.maxLife || e.y < -20) {
        e.x = Math.random() * W;
        e.y = H + 10;
        e.life = 0;
        e.vx = (Math.random() - 0.5) * 0.5;
        e.vy = -(0.8 + Math.random() * 1.5) * emberIntensity;
      }
      e.x += e.vx + Math.sin(e.angle) * 0.3;
      e.y += e.vy;
      e.angle += e.spin;

      const t = e.life / e.maxLife;
      const fade = t < 0.15 ? t / 0.15 : t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      const heat = 1 - e.y / H; // plus chaud en haut

      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * fade, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pal.ember[0]},${Math.round(pal.ember[1] * (0.5 + heat * 0.5))},${Math.round(pal.ember[2] * heat)},${fade * 0.85})`;
      ctx.shadowColor = `rgba(${pal.ember[0]},${pal.ember[1]},0,${fade * 0.4})`;
      ctx.shadowBlur  = 4;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth  * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width  = '100%';
      canvas.style.height = '100%';
      if (!stateRef.current) {
        initParticles(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let animate;
    animate = (ts) => {
      if (stateRef.current) draw(canvas, ctx, ts);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', ...style }}
    />
  );
}
