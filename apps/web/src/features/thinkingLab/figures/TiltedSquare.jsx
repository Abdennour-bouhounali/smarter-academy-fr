import { FIG, ltrText } from './palette';

/**
 * #182 « المربّع المائل » — un carré de côté s, et le carré intérieur dont chaque sommet est
 * sur un côté, à d du coin (sens direct). Sommets intérieurs (repère : origine au coin bas
 * gauche, y vers le haut) : (d, 0), (s, d), (s − d, s), (0, s − d) — CALCULÉS depuis props.
 * Les quatre triangles des coins ont les côtés de l'angle droit d et s − d.
 */
export const LAYERS = ['outer', 'inner', 'triangles', 'oneTri', 'legs', 'hyp'];
export const BASE_LAYERS = ['outer', 'inner', 'legs'];

const SIZE = 240; // côté en px
const M = 44; // marge

function Label({ x, y, children, color = FIG.label, size = 15 }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

export default function TiltedSquare({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const s = Number(props.s) || 10;
  const d = Number(props.d) || 3;
  const k = SIZE / s;
  const P = (u, v) => [M + u * k, M + SIZE - v * k];
  const pt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const poly = (pts) => `M ${pts.map(pt).join(' L ')} Z`;

  const corners = [P(0, 0), P(s, 0), P(s, s), P(0, s)];
  const inner = [P(d, 0), P(s, d), P(s - d, s), P(0, s - d)];
  // Triangle de chaque coin : coin, sommet intérieur sur le côté qui part du coin, sommet intérieur précédent.
  const tris = [
    [P(0, 0), P(d, 0), P(0, s - d)],
    [P(s, 0), P(s, d), P(d, 0)],
    [P(s, s), P(s - d, s), P(s, d)],
    [P(0, s), P(0, s - d), P(s - d, s)],
  ];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const hypMid = mid(P(d, 0), P(0, s - d));
  const fmt = (x) => String(Math.round(x * 100) / 100);

  return (
    <svg viewBox="0 0 328 328" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[420px]" data-figure="TiltedSquare">
      <rect x="0" y="0" width="328" height="328" fill={FIG.paper} />
      {on.has('triangles') && tris.map((t) => (
        <path key={pt(t[0])} d={poly(t)} fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="1.6" />
      ))}
      {on.has('oneTri') && <path d={poly(tris[0])} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="2.4" />}
      {on.has('inner') && <path d={poly(inner)} fill={FIG.soughtFill} stroke={FIG.sought} strokeWidth="2.5" />}
      {on.has('hyp') && (
        <g>
          <path d={`M ${pt(P(d, 0))} L ${pt(P(0, s - d))}`} stroke={FIG.build} strokeWidth="4" strokeLinecap="round" />
          <Label x={hypMid[0] + 14} y={hypMid[1] - 12} color={FIG.build}>?</Label>
        </g>
      )}
      {on.has('outer') && (
        <g>
          <path d={poly(corners)} fill="none" stroke={FIG.ink} strokeWidth="2.2" />
          <Label x={M + SIZE / 2} y={M - 16}>{fmt(s)}</Label>
        </g>
      )}
      {on.has('legs') && (
        <g>
          {/* côté du bas : d puis s − d */}
          <Label x={(P(0, 0)[0] + P(d, 0)[0]) / 2} y={M + SIZE + 18} color={FIG.observe}>{fmt(d)}</Label>
          <Label x={(P(d, 0)[0] + P(s, 0)[0]) / 2} y={M + SIZE + 18} color={FIG.observe}>{fmt(s - d)}</Label>
          {/* côté gauche : s − d puis d */}
          <Label x={M - 20} y={(P(0, 0)[1] + P(0, s - d)[1]) / 2} color={FIG.observe}>{fmt(s - d)}</Label>
          <Label x={M - 20} y={(P(0, s - d)[1] + P(0, s)[1]) / 2} color={FIG.observe}>{fmt(d)}</Label>
          {[...inner].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={FIG.sought} />)}
          {[P(d, 0), P(0, s - d)].map(([x, y]) => (
            <path key={`t${x}-${y}`} d={y > M + SIZE - 1 ? `M ${x} ${y - 6} L ${x} ${y + 6}` : `M ${x - 6} ${y} L ${x + 6} ${y}`} stroke={FIG.ink} strokeWidth="1.6" />
          ))}
        </g>
      )}
    </svg>
  );
}
