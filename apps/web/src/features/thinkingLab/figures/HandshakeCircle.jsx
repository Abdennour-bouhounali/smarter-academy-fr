import { FIG, ltrText } from './palette';

/**
 * #5 « المصافحات الأولى » — n amis = n points sur un cercle, une poignée de main = un segment.
 * Les points sont placés à angles égaux (calculés), le premier en haut, puis dans le sens des aiguilles.
 * `props.n` : le nombre d'amis de l'élève (3 à 10).
 */
export const LAYERS = ['people', 'allEdges', 'firstFans', 'nextFans', 'doubleCount'];
export const BASE_LAYERS = ['people'];

const CX = 160;
const CY = 150;
const R = 104;

const position = (i, n) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
};
const seg = ([x1, y1], [x2, y2]) => `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;

export default function HandshakeCircle({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const n = Math.max(3, Math.min(10, Math.round(Number(props.n) || 5)));
  const pts = Array.from({ length: n }, (_, i) => position(i, n));
  const pairs = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
  const mid = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];
  // la normale extérieure au milieu de la corde 1–2 (pour poser « ×2 » hors des segments)
  const out = [mid[0] - CX, mid[1] - CY];
  const len = Math.hypot(out[0], out[1]) || 1;
  const tag = [mid[0] + (out[0] / len) * 20, mid[1] + (out[1] / len) * 20];

  return (
    <svg viewBox="0 0 320 300" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[420px]" data-figure="HandshakeCircle">
      <rect x="0" y="0" width="320" height="300" fill={FIG.paper} />
      {on.has('allEdges') && (
        <g stroke={FIG.sought} strokeWidth="1.6" opacity="0.75">
          {pairs.map(([i, j]) => <path key={`a${i}-${j}`} d={seg(pts[i], pts[j])} />)}
        </g>
      )}
      {on.has('nextFans') && (
        <g stroke={FIG.build} strokeWidth="2.4" strokeDasharray="6 4">
          {pts.slice(2).map((p, k) => <path key={`n${k}`} d={seg(pts[1], p)} />)}
        </g>
      )}
      {on.has('firstFans') && (
        <g stroke={FIG.observe} strokeWidth="2.6">
          {pts.slice(1).map((p, k) => <path key={`f${k}`} d={seg(pts[0], p)} />)}
        </g>
      )}
      {on.has('doubleCount') && (
        <g>
          <path d={seg(pts[0], pts[1])} stroke={FIG.observe} strokeWidth="5" strokeLinecap="round" />
          <text x={tag[0]} y={tag[1]} fill={FIG.observe} fontSize="15" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>×2</text>
        </g>
      )}
      {on.has('people') && (
        <g>
          {pts.map(([x, y], i) => (
            <g key={`p${i}`}>
              <circle cx={x} cy={y} r="14" fill={FIG.paper} stroke={FIG.ink} strokeWidth="2.2" />
              <text x={x} y={y + 0.5} fill={FIG.label} fontSize="13" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>{i + 1}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
