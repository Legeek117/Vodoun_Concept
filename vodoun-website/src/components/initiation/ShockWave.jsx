import { useEffect, useRef } from 'react';

/**
 * ShockWave — Canvas 2D
 * Onde de choc concentrique qui part du centre du masque
 * vers les bords de l'écran au moment où les yeux s'allument.
 */
export default function ShockWave({ trigger = false }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    const cx  = W / 2;
    const cy  = H / 2;

    startRef.current = performance.now();
    const DURATION = 900; // ms

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const p       = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, W, H);

      // 3 anneaux décalés
      const rings = [
        { delay: 0,    speed: 1.0, thickness: 4, alpha: 0.8 },
        { delay: 0.08, speed: 1.3, thickness: 2, alpha: 0.5 },
        { delay: 0.16, speed: 1.6, thickness: 1, alpha: 0.3 },
      ];

      rings.forEach(({ delay, speed, thickness, alpha }) => {
        const rp = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
        if (rp <= 0) return;

        const maxR  = Math.max(W, H) * 0.65 * speed;
        const r     = rp * maxR;
        const fade  = rp < 0.4 ? rp / 0.4 : 1 - (rp - 0.4) / 0.6;

        // Dégradé radial — brillant intérieur, transparent extérieur
        const grd = ctx.createRadialGradient(cx, cy, Math.max(r - thickness * 6, 0), cx, cy, r + thickness * 3);
        grd.addColorStop(0,   'rgba(0,0,0,0)');
        grd.addColorStop(0.4, `rgba(210,185,142,${alpha * fade * 0.3})`);
        grd.addColorStop(0.7, `rgba(255,230,150,${alpha * fade})`);
        grd.addColorStop(0.85,`rgba(255,255,200,${alpha * fade * 0.8})`);
        grd.addColorStop(1,   'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,235,160,${alpha * fade * 0.9})`;
        ctx.lineWidth   = thickness * 2;
        ctx.shadowColor = `rgba(210,185,142,${fade * 0.7})`;
        ctx.shadowBlur  = 18;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Remplissage anneau lumineux
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Légère distorsion visuelle au centre au moment du pic
      if (p > 0.05 && p < 0.3) {
        const distort = Math.sin(p * Math.PI / 0.3) * 0.06;
        const dGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        dGrd.addColorStop(0,   `rgba(255,240,180,${distort})`);
        dGrd.addColorStop(0.5, `rgba(210,185,142,${distort * 0.3})`);
        dGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.fillStyle = dGrd;
        ctx.fill();
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        zIndex: 16, pointerEvents: 'none',
      }}
    />
  );
}
