// Graphiques SVG maison — aucune dépendance externe (reste léger et 100 % offline).
import { useId, useState } from 'react';

// ── Générateur de courbe lissée (Catmull-Rom → Bézier cubique) ───────────────
function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function niceCeil(v) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

const fmtShort = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1).replace('.0', '')}k`;
  return String(Math.round(v));
};

// ── Sparkline (mini-courbe pour les cartes KPI) ─────────────────────────────
export function Sparkline({ values = [], color = '#B8860B', height = 46 }) {
  const id = useId().replace(/:/g, '');
  const W = 120, H = 40, pad = 4;
  const max = Math.max(1, ...values);
  const n = values.length;
  const pts = values.map((v, i) => ({
    x: n <= 1 ? W / 2 : (i / (n - 1)) * (W - pad * 2) + pad,
    y: H - pad - (v / max) * (H - pad * 2),
  }));
  const line = smoothPath(pts);
  const area = pts.length
    ? `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${H} L ${pts[0].x.toFixed(2)} ${H} Z`
    : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#sp-${id})`} />}
      {line && <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

// ── Courbe(s) lissée(s) avec aire, grille et libellés ────────────────────────
export function LineChart({ series = [], labels = [], height = 280, formatValue = (v) => Math.round(v).toLocaleString('fr-FR') }) {
  const W = 760, H = height;
  const padT = 22, padB = 36, padL = 54, padR = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all);
  const niceMax = niceCeil(max);
  const n = Math.max(0, ...series.map((s) => s.values.length));
  const xAt = (i) => (n <= 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW);
  const yAt = (v) => padT + innerH - (v / niceMax) * innerH;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => niceMax * f);
  const showEvery = n > 14 ? 2 : 1;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`ln-${si}-${s.color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grille + axe Y */}
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? '' : '3 5'} />
              <text x={padL - 10} y={y + 3.5} textAnchor="end" fill="rgba(244,240,230,0.35)" style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {fmtShort(t)}
              </text>
            </g>
          );
        })}

        {/* Aire + ligne de chaque série */}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
          const line = smoothPath(pts);
          const area = pts.length ? `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${padT + innerH} L ${pts[0].x.toFixed(2)} ${padT + innerH} Z` : '';
          return (
            <g key={si}>
              {s.area !== false && area && <path d={area} fill={`url(#ln-${si}-${s.color.slice(1)})`} />}
              {line && <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#080604" stroke={s.color} strokeWidth="2">
                  <title>{`${labels[i] ?? i} — ${s.name ? s.name + ' : ' : ''}${formatValue(s.values[i])}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {/* Axe X */}
        {labels.map((lb, i) => (i % showEvery === 0 ? (
          <text key={i} x={xAt(i)} y={H - 12} textAnchor="middle" fill="rgba(244,240,230,0.35)" style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {lb}
          </text>
        ) : null))}
      </svg>

      {series.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginTop: '10px' }}>
          {series.map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,240,230,0.5)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Donut (répartition) ──────────────────────────────────────────────────────
export function Donut({ data = [], size = 190, thickness = 22, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: size, height: 'auto', display: 'block' }}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          {total > 0 && data.map((d, i) => {
            const frac = d.value / total;
            const dash = `${(frac * c).toFixed(2)} ${c.toFixed(2)}`;
            const offset = -acc * c;
            acc += frac;
            return (
              <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
                strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="butt">
                <title>{`${d.label} : ${d.value}`}</title>
              </circle>
            );
          })}
        </g>
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fill="#F4F0E6" style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 30 }}>
          {centerValue ?? total}
        </text>
        <text x={size / 2} y={size / 2 + 20} textAnchor="middle" fill="rgba(244,240,230,0.4)" style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {centerLabel}
        </text>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'rgba(244,240,230,0.6)' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: d.color }} />
              {d.label}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#F4F0E6' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Barres ───────────────────────────────────────────────────────────────────
export function BarChart({ data = [], color = '#B8860B', height = 240, formatValue = (v) => Math.round(v).toLocaleString('fr-FR') }) {
  const W = 760, H = height;
  const padT = 22, padB = 44, padL = 48, padR = 16;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = niceCeil(max);
  const bw = data.length ? Math.min(64, (innerW / data.length) * 0.6) : 0;
  const step = data.length ? innerW / data.length : innerW;
  const [hover, setHover] = useState(-1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
      {[0, 0.5, 1].map((f, i) => {
        const y = padT + innerH - f * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={f === 0 ? '' : '3 5'} />
            <text x={padL - 10} y={y + 3.5} textAnchor="end" fill="rgba(244,240,230,0.35)" style={{ fontSize: 10 }}>{fmtShort(niceMax * f)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / niceMax) * innerH;
        const x = padL + i * step + (step - bw) / 2;
        const y = padT + innerH - h;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}>
            <rect x={x} y={padT} width={bw} height={innerH} fill="transparent" />
            <rect x={x} y={y} width={bw} height={Math.max(h, d.value > 0 ? 3 : 0)} rx="6"
              fill={hover === i ? color : `${color}CC`} style={{ transition: 'fill 0.15s' }}>
              <title>{`${d.label} : ${formatValue(d.value)}`}</title>
            </rect>
            <text x={x + bw / 2} y={y - 7} textAnchor="middle" fill="rgba(244,240,230,0.7)" style={{ fontSize: 10, fontWeight: 700 }}>
              {d.value > 0 ? fmtShort(d.value) : ''}
            </text>
            <text x={x + bw / 2} y={H - 14} textAnchor="middle" fill="rgba(244,240,230,0.4)" style={{ fontSize: 10 }}>
              {d.label.length > 12 ? `${d.label.slice(0, 11)}…` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
