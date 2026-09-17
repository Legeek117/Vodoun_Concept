import { useEffect, useRef, useCallback } from 'react';

/**
 * GoldenLines + Lightning + Blast — Canvas 2D
 *
 * Phases internes :
 *   0 → 2400ms  : lignes dorées courbées convergent vers le centre
 *   2400→2480ms : ÉCLAIR diagonal (D) — flash blanc traversant l'écran
 *   2480→4000ms : BLAST étendu (H) — implosion + explosion + rayons + fade
 */
export default function GoldenLines({ visible = false, onBlastComplete }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);
  const calledRef  = useRef(false); // évite double appel onBlastComplete

  const drawLightning = useCallback((ctx, W, H, progress) => {
    // Éclair diagonal du coin haut-gauche vers bas-droit
    const alpha = Math.sin(progress * Math.PI) * 0.9;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Tronc principal
    const lGrad = ctx.createLinearGradient(0, 0, W, H);
    lGrad.addColorStop(0,   'rgba(255,255,255,0.0)');
    lGrad.addColorStop(0.3, 'rgba(255,255,255,0.9)');
    lGrad.addColorStop(0.5, 'rgba(255,250,200,1.0)');
    lGrad.addColorStop(0.7, 'rgba(255,255,255,0.9)');
    lGrad.addColorStop(1,   'rgba(255,255,255,0.0)');

    ctx.strokeStyle = lGrad;
    ctx.lineWidth   = 3;
    ctx.shadowColor = 'rgba(255,240,150,1)';
    ctx.shadowBlur  = 30;

    // Tracé en zigzag
    ctx.beginPath();
    const steps = 8;
    ctx.moveTo(0, 0);
    for (let s = 1; s <= steps; s++) {
      const tx = (s / steps) * W;
      const ty = (s / steps) * H + (Math.random() - 0.5) * 40 * (1 - s / steps);
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();

    // Glow large
    ctx.lineWidth = 20;
    ctx.globalAlpha = alpha * 0.2;
    ctx.shadowBlur  = 60;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, H);
    ctx.stroke();

    ctx.restore();
  }, []);

  const draw = useCallback((canvas, ctx, elapsed) => {
    const W  = canvas.width;
    const H  = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const LINES_END    = 2400;
    const LIGHTNING_END = 2480;
    const BLAST_END    = 4000; // H : blast étendu à 1520ms

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(10, 7, 5, 0.16)';
    ctx.fillRect(0, 0, W, H);

    /* ─── Phase lignes ─── */
    if (elapsed < LINES_END) {
      const p = elapsed / LINES_END;

      const origins = [
        { x: 0,  y: 0  }, { x: W,  y: 0  },
        { x: 0,  y: H  }, { x: W,  y: H  },
        { x: cx, y: 0  }, { x: cx, y: H  },
        { x: 0,  y: cy }, { x: W,  y: cy },
      ];
      const controls = [
        { cpx: W*0.22, cpy: H*0.32 }, { cpx: W*0.78, cpy: H*0.22 },
        { cpx: W*0.18, cpy: H*0.72 }, { cpx: W*0.82, cpy: H*0.78 },
        { cpx: W*0.44, cpy: H*0.18 }, { cpx: W*0.56, cpy: H*0.82 },
        { cpx: W*0.18, cpy: H*0.52 }, { cpx: W*0.82, cpy: H*0.48 },
      ];

      origins.forEach((o, idx) => {
        const cp    = controls[idx];
        const delay = idx * 0.075;
        const lp    = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
        if (lp <= 0) return;

        const t1   = 1 - lp;
        const curX = t1*t1*o.x + 2*t1*lp*cp.cpx + lp*lp*cx;
        const curY = t1*t1*o.y + 2*t1*lp*cp.cpy + lp*lp*cy;
        const opacity = Math.min(lp * 2.5, 1);

        const grad = ctx.createLinearGradient(o.x, o.y, curX, curY);
        grad.addColorStop(0,   `rgba(255,100,10,${opacity*0.35})`);
        grad.addColorStop(0.4, `rgba(255,170,50,${opacity*0.7})`);
        grad.addColorStop(0.8, `rgba(210,185,142,${opacity*0.9})`);
        grad.addColorStop(1,   `rgba(255,245,180,${opacity})`);

        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        const steps = Math.max(Math.floor(lp * 70) + 1, 2);
        for (let s = 1; s <= steps; s++) {
          const st = (s / steps) * lp;
          const s1 = 1 - st;
          ctx.lineTo(s1*s1*o.x + 2*s1*st*cp.cpx + st*st*cx,
                     s1*s1*o.y + 2*s1*st*cp.cpy + st*st*cy);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5 + lp * 2.5;
        ctx.shadowColor = 'rgba(210,185,142,0.85)';
        ctx.shadowBlur  = 10 + lp * 14;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Tête brillante
        if (lp > 0.04) {
          const hs   = 4 + lp * 6;
          const hGrd = ctx.createRadialGradient(curX, curY, 0, curX, curY, hs * 2.5);
          hGrd.addColorStop(0,   `rgba(255,255,220,${opacity})`);
          hGrd.addColorStop(0.5, `rgba(210,185,142,${opacity*0.5})`);
          hGrd.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(curX, curY, hs * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hGrd;
          ctx.fill();
        }
      });

      // Halo central croissant
      if (p > 0.45) {
        const hp   = (p - 0.45) / 0.55;
        const hSz  = hp * 100;
        const hGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, hSz);
        hGrd.addColorStop(0,   `rgba(255,240,180,${hp*0.7})`);
        hGrd.addColorStop(0.4, `rgba(210,185,142,${hp*0.35})`);
        hGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, hSz, 0, Math.PI * 2);
        ctx.fillStyle = hGrd;
        ctx.fill();
      }

    /* ─── Phase éclair (D) ─── */
    } else if (elapsed < LIGHTNING_END) {
      const lp = (elapsed - LINES_END) / (LIGHTNING_END - LINES_END);
      // Garder les lignes visibles en fondu
      ctx.globalAlpha = 1 - lp * 0.5;
      drawLightning(ctx, W, H, lp);
      ctx.globalAlpha = 1;

    /* ─── Phase blast (H) ─── */
    } else {
      const bp = Math.min((elapsed - LIGHTNING_END) / (BLAST_END - LIGHTNING_END), 1);

      // Fond en fondu selon progression
      ctx.fillStyle = `rgba(10, 7, 5, ${Math.max(0, 0.4 - bp * 0.5)})`;
      ctx.fillRect(0, 0, W, H);

      const maxR     = Math.max(W, H) * 1.6;
      const blastR   = bp * maxR;
      const innerR   = Math.max(blastR * 0.02, 1);

      const bGrd = ctx.createRadialGradient(cx, cy, innerR, cx, cy, blastR);

      if (bp < 0.2) {
        // Concentré — implosion
        const imp = bp / 0.2;
        bGrd.addColorStop(0,    `rgba(255,255,255,${imp})`);
        bGrd.addColorStop(0.08, `rgba(255,250,200,${imp*0.95})`);
        bGrd.addColorStop(0.25, `rgba(210,185,142,${imp*0.6})`);
        bGrd.addColorStop(1,    'rgba(0,0,0,0)');
      } else if (bp < 0.6) {
        // Explosion franche
        const exp   = (bp - 0.2) / 0.4;
        const alpha = 1 - exp * 0.3;
        bGrd.addColorStop(0,    `rgba(255,255,255,${alpha})`);
        bGrd.addColorStop(0.04, `rgba(255,252,210,${alpha*0.98})`);
        bGrd.addColorStop(0.15, `rgba(210,185,142,${alpha*0.8})`);
        bGrd.addColorStop(0.4,  `rgba(180,130,60,${alpha*0.4})`);
        bGrd.addColorStop(1,    'rgba(0,0,0,0)');
      } else {
        // Dissipation
        const dis   = (bp - 0.6) / 0.4;
        const alpha = Math.max(0, 1 - dis * 1.1);
        bGrd.addColorStop(0,    `rgba(255,255,255,${alpha})`);
        bGrd.addColorStop(0.06, `rgba(255,248,200,${alpha*0.9})`);
        bGrd.addColorStop(0.2,  `rgba(210,185,142,${alpha*0.5})`);
        bGrd.addColorStop(0.5,  `rgba(160,110,40,${alpha*0.2})`);
        bGrd.addColorStop(1,    'rgba(0,0,0,0)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, blastR, 0, Math.PI * 2);
      ctx.fillStyle = bGrd;
      ctx.fill();

      // Rayons émanant du centre
      if (bp > 0.08 && bp < 0.85) {
        const rayCount = 24;
        const rayAlpha = Math.sin(bp * Math.PI) * 0.5;
        for (let r = 0; r < rayCount; r++) {
          const angle  = (r / rayCount) * Math.PI * 2 + bp * 0.3;
          const rayLen = bp * maxR * 0.9;
          const rGrd   = ctx.createLinearGradient(cx, cy,
            cx + Math.cos(angle) * rayLen,
            cy + Math.sin(angle) * rayLen);
          const rw = r % 3 === 0 ? 2.5 : 1.2; // rayons alternés plus épais
          rGrd.addColorStop(0,   `rgba(255,250,200,${rayAlpha})`);
          rGrd.addColorStop(0.15,`rgba(210,185,142,${rayAlpha*0.6})`);
          rGrd.addColorStop(0.5, `rgba(180,130,60,${rayAlpha*0.2})`);
          rGrd.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
          ctx.strokeStyle = rGrd;
          ctx.lineWidth   = rw * (1 - bp * 0.5);
          ctx.shadowColor = 'rgba(255,220,100,0.3)';
          ctx.shadowBlur  = 8;
          ctx.stroke();
          ctx.shadowBlur  = 0;
        }
      }

      // Anneaux concentriques
      if (bp > 0.15 && bp < 0.8) {
        const ringCount = 3;
        for (let rn = 0; rn < ringCount; rn++) {
          const rp    = Math.max(0, bp - rn * 0.12);
          const rr    = rp * maxR * 0.5;
          const ra    = (1 - rp) * 0.3;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,240,180,${ra})`;
          ctx.lineWidth   = (1 - rp) * 4;
          ctx.shadowBlur  = 15;
          ctx.shadowColor = 'rgba(210,185,142,0.6)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      if (bp >= 1 && !calledRef.current) {
        calledRef.current = true;
        if (onBlastComplete) onBlastComplete();
      }
    }
  }, [onBlastComplete, drawLightning]);

  useEffect(() => {
    if (!visible) {
      calledRef.current = false;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    startRef.current = performance.now();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (now) => {
      draw(canvas, ctx, now - startRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [visible, draw]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 18, pointerEvents: 'none',
      }}
    />
  );
}
