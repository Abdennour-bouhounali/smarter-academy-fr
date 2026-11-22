import { FIG, ltrText } from './palette';

/**
 * #200 « السلّم المنزلق » — un mur vertical, le sol, et l'échelle de longueur L dans ses deux
 * positions : pied à f₁ puis à f₂ du mur. Les hauteurs du sommet sont CALCULÉES
 * (√(L² − f²)), jamais posées à l'œil. Figure statique (l'échelle déplaçable viendra plus tard).
 */
export const LAYERS = ['ground', 'wall', 'before', 'after', 'triBefore', 'triAfter', 'labels', 'drop'];
export const BASE_LAYERS = ['ground', 'wall', 'before', 'after', 'labels'];

const K = 52; // px par mètre
const X0 = 70; // pied du mur
const Y0 = 300; // niveau du sol

function Label({ x, y, children, color = FIG.label, size = 15, anchor = 'middle' }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight="600" textAnchor={anchor} dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

/** L'échelle : deux montants parallèles et des barreaux, du pied (fx, 0) au sommet (0, hy). */
function Ladder({ foot, top, color, dashed = false }) {
  const [ax, ay] = [X0 + foot * K, Y0];
  const [bx, by] = [X0, Y0 - top * K];
  const len = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
  const [nx, ny] = [-uy * 5, ux * 5];
  const rungs = [];
  for (let t = 18; t < len - 8; t += 22) rungs.push(t);
  const dash = dashed ? '7 5' : undefined;
  return (
    <g stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeDasharray={dash}>
      <path d={`M ${ax + nx} ${ay + ny} L ${bx + nx} ${by + ny}`} />
      <path d={`M ${ax - nx} ${ay - ny} L ${bx - nx} ${by - ny}`} />
      {rungs.map((t) => (
        <path key={t} strokeWidth="1.6" d={`M ${ax + ux * t + nx} ${ay + uy * t + ny} L ${ax + ux * t - nx} ${ay + uy * t - ny}`} />
      ))}
    </g>
  );
}

export default function SlidingLadder({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const L = Number(props.L) || 5;
  const f1 = Number(props.f1) || 3;
  const f2 = Number(props.f2) || 4;
  const h1 = Math.sqrt(L * L - f1 * f1);
  const h2 = Math.sqrt(L * L - f2 * f2);
  const fmt = (x) => String(Math.round(x * 100) / 100);
  const tri = (f, h) => `M ${X0} ${Y0} L ${X0 + f * K} ${Y0} L ${X0} ${Y0 - h * K} Z`;

  return (
    <svg viewBox="0 0 360 340" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[420px]" data-figure="SlidingLadder">
      <rect x="0" y="0" width="360" height="340" fill={FIG.paper} />
      {on.has('triBefore') && <path d={tri(f1, h1)} fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="1.6" />}
      {on.has('triAfter') && <path d={tri(f2, h2)} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="1.6" />}
      {on.has('wall') && (
        <g>
          <rect x={X0 - 22} y={20} width="22" height={Y0 - 20} fill={FIG.deadEndFill} stroke={FIG.ink} strokeWidth="1.6" />
          {Array.from({ length: 13 }, (_, i) => (
            <path key={i} d={`M ${X0 - 22} ${40 + i * 21} L ${X0} ${28 + i * 21}`} stroke={FIG.muted} strokeWidth="1" />
          ))}
          <path d={`M ${X0} ${Y0} l 12 0 l 0 -12 l -12 0`} fill="none" stroke={FIG.ink} strokeWidth="1.2" />
        </g>
      )}
      {on.has('ground') && (
        <g>
          <path d={`M 20 ${Y0} L 345 ${Y0}`} stroke={FIG.ink} strokeWidth="2.2" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${30 + i * 20} ${Y0} l -8 10`} stroke={FIG.muted} strokeWidth="1" />
          ))}
        </g>
      )}
      {on.has('before') && <Ladder foot={f1} top={h1} color={FIG.muted} dashed />}
      {on.has('after') && <Ladder foot={f2} top={h2} color={FIG.ink} />}
      {on.has('labels') && (
        <g>
          <Label x={X0 + (f1 * K) / 2} y={Y0 + 22}>{fmt(f1)}</Label>
          <Label x={X0 + f1 * K + ((f2 - f1) * K) / 2} y={Y0 + 22} color={FIG.observe}>+{fmt(f2 - f1)}</Label>
          <path d={`M ${X0 + f1 * K} ${Y0 + 8} L ${X0 + f1 * K} ${Y0 + 34}`} stroke={FIG.muted} strokeWidth="1.2" />
          <Label x={X0 + (f2 * K) / 2 + 26} y={Y0 - (h2 * K) / 2 - 10}>{fmt(L)}</Label>
        </g>
      )}
      {on.has('drop') && (
        <g>
          <path d={`M ${X0 + 14} ${Y0 - h1 * K} L ${X0 + 14} ${Y0 - h2 * K}`} stroke={FIG.sought} strokeWidth="3" />
          <path d={`M ${X0 + 8} ${Y0 - h1 * K} l 12 0 M ${X0 + 8} ${Y0 - h2 * K} l 12 0`} stroke={FIG.sought} strokeWidth="2" />
          <Label x={X0 + 32} y={Y0 - ((h1 + h2) / 2) * K} color={FIG.sought} size={17}>?</Label>
        </g>
      )}
      {(on.has('before') || on.has('triBefore')) && <circle cx={X0} cy={Y0 - h1 * K} r="4" fill={FIG.muted} />}
      {(on.has('after') || on.has('triAfter')) && <circle cx={X0} cy={Y0 - h2 * K} r="4" fill={FIG.ink} />}
    </svg>
  );
}
