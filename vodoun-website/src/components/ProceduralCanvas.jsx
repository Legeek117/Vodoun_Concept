import { useEffect, useRef } from 'react';

/**
 * ProceduralCanvas — fond animé procédural
 *
 * Le canvas se redimensionne à la taille de son parent (pas window).
 * Les particules couvrent toute la hauteur du parent.
 *
 * Props :
 *  scrollRef  : React ref dont .current = 0→1 (scroll progress)
 *  style      : styles inline supplémentaires
 */

const PHASES = [
  { at: 0.00, bg: [10,  7,  5], ember: [200,  80, 10], gold: [210, 185, 142], halo: [120, 80, 20] },
  { at: 0.25, bg: [22,  6,  2], ember: [255, 100, 20], gold: [220, 160,  80], halo: [180, 80, 10] },
  { at: 0.50, bg: [16, 10,  3], ember: [210, 150, 25], gold: [235, 195, 110], halo: [160,120, 30] },
  { at: 0.75, bg: [10,  8,  5], ember: [185, 110, 18], gold: [215, 185, 142], halo: [130, 90, 25] },
  { at: 1.00, bg: [ 5,  3,  1], ember: [140,  55,  5], gold: [175, 135,  90], halo: [100, 60, 15] },
];

function lerp(a, b, t) { return a + (b - a) * t; }

function getPalette(p) {
  let lo = PHASES[0], hi = PHASES[PHASES.length - 1];
  for (let i = 0; i < PHASES.length - 1; i++) {
    if (p >= PHASES[i].at && p <= PHASES[i + 1].at) {
      lo = PHASES[i]; hi = PHASES[i + 1]; break;
    }
  }
  const t = lo.at === hi.at ? 0 : (p - lo.at) / (hi.at - lo.at);
  return {
    bg:    lo.bg.map((v, i)    => Math.round(lerp(v, hi.bg[i],    t))),
    ember: lo.ember.map((v, i) => Math.round(lerp(v, hi.ember[i], t))),
    gold:  lo.gold.map((v, i)  => Math.round(lerp(v, hi.gold[i],  t))),
    halo:  lo.halo.map((v, i)  => Math.round(lerp(v, hi.halo[i],  t))),
  };
}

const P_COUNT = 320;
const E_COUNT = 140;

function mkParticles(W, H) {
  return Array.from({ length: P_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,       // réparties sur TOUTE la hauteur
    vx: (Math.random() - 0.5) * 0.22,
    vy: -(0.08 + Math.random() * 0.32),
    r: 0.8 + Math.random() * 2.2,
    life: Math.random(),
    maxLife: 0.6 + Math.random() * 1.2,
    type: Math.random() < 0.6 ? 'gold' : 'ember',
    trail: [],
    trailLen: 3 + Math.floor(Math.random() * 5),
  }));
}

function mkEmbers(W, H) {
  return Array.from({ length: E_COUNT }, () => ({
    x: Math.random() * W,
    y: H * (0.2 + Math.random() * 0.8),  // réparties sur toute la hauteur
    vx: (Math.random() - 0.5) * 0.38,
    vy: -(0.5 + Math.random() * 1.4),
    r: 0.7 + Math.random() * 2.0,
    life: Math.random(),
    maxLife: 0.6 + Math.random() * 1.0,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.055,
  }));
}

const VEVE_LINES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  phaseStart: 0.08 + (i / 16) * 0.18,
  len: 0.28 + Math.random() * 0.08,
}));

export default function ProceduralCanvas({ scrollRef, style = {} }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Taille = taille du parent (pas window) pour couvrir toute la zone
    const setSize = () => {
      const parent = canvas.parentElement;
      const W = parent ? parent.offsetWidth  : window.innerWidth;
      const H = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      // Réinitialise les particules sur la nouvelle taille
      stateRef.current = {
        particles: mkParticles(W, H),
        embers:    mkEmbers(W, H),
        bolts:     [],
        boltTimer: 0,
      };
    };
    setSize();

    // ResizeObserver sur le parent pour détecter les changements de hauteur
    const ro = new ResizeObserver(setSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', setSize);

    const spawnBolt = (W, H) => {
      let cx = Math.random() * W, cy = Math.random() * H * 0.4;
      const segs = [];
      for (let s = 0; s < 6 + Math.floor(Math.random() * 5); s++) {
        const nx = cx + (Math.random() - 0.5) * W * 0.14;
        const ny = cy + (Math.random() + 0.2) * H * 0.07;
        segs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
      }
      return { segs, life: 0, maxLife: 0.1 + Math.random() * 0.2 };
    };

    const animate = (ts) => {
      const W   = canvas.width;
      const H   = canvas.height;
      const p   = scrollRef?.current ?? 0;
      const pal = getPalette(p);
      const st  = stateRef.current;
      if (!st) { rafRef.current = requestAnimationFrame(animate); return; }
      const dt = 0.016;

      // ── Fond ────────────────────────────────────────────────
      if (!st._bgInit) {
        ctx.fillStyle = `rgb(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]})`;
        ctx.fillRect(0, 0, W, H);
        st._bgInit = true;
      }
      ctx.fillStyle = `rgba(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]},0.16)`;
      ctx.fillRect(0, 0, W, H);

      // ── Halo central pulsant ─────────────────────────────────
      const pulse = 0.85 + Math.sin(ts * 0.0012) * 0.15;
      const haloY = H * 0.5;
      const haloR = Math.min(W, H) * (0.55 + p * 0.20) * pulse;
      const hGrd  = ctx.createRadialGradient(W / 2, haloY, 0, W / 2, haloY, haloR);
      hGrd.addColorStop(0,   `rgba(${pal.halo[0]},${pal.halo[1]},${pal.halo[2]},0.13)`);
      hGrd.addColorStop(0.5, `rgba(${pal.ember[0]},${pal.ember[1]},${pal.ember[2]},0.05)`);
      hGrd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = hGrd;
      ctx.fillRect(0, 0, W, H);

      // ── Motifs vévé ──────────────────────────────────────────
      const vFade = Math.max(0, Math.min(1, (p - 0.12) / 0.28));
      if (vFade > 0) {
        const cx = W / 2, cy = H * 0.45;
        const vr = Math.min(W, H) * 0.28;
        ctx.save();
        ctx.globalAlpha = vFade * 0.10;
        ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
        [0.35, 0.65, 1.0].forEach(f => {
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(cx, cy, vr * f, 0, Math.PI * 2); ctx.stroke();
        });
        VEVE_LINES.forEach(ln => {
          const lp = Math.max(0, Math.min(1, (p - ln.phaseStart) / 0.25));
          if (lp <= 0) return;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ln.angle) * vr * ln.len * lp, cy + Math.sin(ln.angle) * vr * ln.len * lp);
          ctx.stroke();
        });
        const ld = vr * 0.4;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ld); ctx.lineTo(cx + ld, cy);
        ctx.lineTo(cx, cy + ld); ctx.lineTo(cx - ld, cy);
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      }

      // ── Éclairs (>50% scroll) ────────────────────────────────
      if (p > 0.50) {
        st.boltTimer -= dt;
        if (st.boltTimer <= 0) {
          st.bolts.push(spawnBolt(W, H));
          st.boltTimer = 0.9 + Math.random() * 1.4;
        }
        st.bolts = st.bolts.filter(b => {
          b.life += dt;
          if (b.life >= b.maxLife) return false;
          const bf = Math.sin((b.life / b.maxLife) * Math.PI);
          ctx.save();
          ctx.globalAlpha = bf * 0.4 * ((p - 0.5) / 0.5);
          ctx.strokeStyle = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
          ctx.lineWidth   = 0.8 + bf * 1.2;
          ctx.shadowColor = `rgb(${pal.gold[0]},${pal.gold[1]},${pal.gold[2]})`;
          ctx.shadowBlur  = 8 + bf * 10;
          b.segs.forEach(s => {
            ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          });
          ctx.restore();
          return true;
        });
      }

      // ── Particules avec traînes ──────────────────────────────
      st.particles.forEach(pk => {
        pk.life += dt * 0.28;
        if (pk.life > pk.maxLife) {
          // Reborn aléatoirement sur toute la hauteur
          pk.x = Math.random() * W;
          pk.y = H + 5;
          pk.life = 0;
          pk.vx = (Math.random() - 0.5) * 0.22;
          pk.vy = -(0.08 + Math.random() * 0.32);
          pk.trail = [];
        }
        pk.trail.push({ x: pk.x, y: pk.y });
        if (pk.trail.length > pk.trailLen) pk.trail.shift();

        pk.x += pk.vx + Math.sin(ts * 0.0007 + pk.life * 2.5) * 0.10;
        pk.y += pk.vy;

        const t    = pk.life / pk.maxLife;
        const fade = t < 0.2 ? t / 0.2 : t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1;
        const col  = pk.type === 'gold' ? pal.gold : pal.ember;

        // Traîne
        for (let ti = 0; ti < pk.trail.length - 1; ti++) {
          const tf = ti / pk.trail.length;
          ctx.beginPath();
          ctx.moveTo(pk.trail[ti].x, pk.trail[ti].y);
          ctx.lineTo(pk.trail[ti + 1].x, pk.trail[ti + 1].y);
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${fade * tf * 0.3})`;
          ctx.lineWidth   = pk.r * fade * tf * 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pk.x, pk.y, pk.r * fade, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${fade * 0.82})`;
        ctx.fill();
      });

      // ── Braises qui montent ───────────────────────────────────
      const ei = 0.35 + p * 0.65;
      st.embers.forEach(e => {
        e.life += dt * 0.42 * ei;
        if (e.life > e.maxLife || e.y < -15) {
          e.x = Math.random() * W;
          e.y = H + 5;
          e.life = 0;
          e.vx = (Math.random() - 0.5) * 0.38;
          e.vy = -(0.5 + Math.random() * 1.4) * ei;
        }
        e.x += e.vx + Math.sin(e.angle) * 0.22;
        e.y += e.vy;
        e.angle += e.spin;

        const t    = e.life / e.maxLife;
        const fade = t < 0.14 ? t / 0.14 : t > 0.62 ? 1 - (t - 0.62) / 0.38 : 1;
        const heat = Math.max(0, 1 - e.y / H);

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * fade, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pal.ember[0]},${Math.round(pal.ember[1] * (0.35 + heat * 0.65))},${Math.round(pal.ember[2] * heat * 0.4)},${fade * 0.92})`;
        ctx.shadowColor = `rgba(${pal.ember[0]},${pal.ember[1]},0,${fade * 0.28})`;
        ctx.shadowBlur  = 4;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('resize', setSize);
    };
  }, [scrollRef]);

  return (
    <canvas
      ref={canvasRef}
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
