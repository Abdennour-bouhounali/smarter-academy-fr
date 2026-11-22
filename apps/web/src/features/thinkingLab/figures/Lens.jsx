import { FIG, ltrText } from './palette';

/**
 * #333 « العدسة » — deux cercles de même rayon r, chaque centre sur le cercle de l'autre,
 * et la lentille commune aux deux disques.
 *
 * Géométrie en unités de r, puis mise à l'échelle : O₁ = (0, 0), O₂ = (1, 0), les points
 * d'intersection P = (½, √3/2) et Q = (½, −√3/2) — calculés, jamais posés à l'œil.
 */
export const LAYERS = ['circles', 'centers', 'region', 'chord', 'points', 'tri', 'angle120', 'sector'];
export const BASE_LAYERS = ['circles', 'centers', 'region'];

const R = 92; // rayon en px
const CX = 124; // abscisse de O₁
const CY = 130; // ordonnée de l'axe O₁O₂
const H = Math.sqrt(3) / 2;
/** (u, v) en unités de r, v vers le haut → coordonnées SVG. */
const P = (u, v) => [CX + u * R, CY - v * R];
const O1 = P(0, 0);
const O2 = P(1, 0);
const TOP = P(0.5, H);
const BOT = P(0.5, -H);
const pt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
/** Arc de rayon R ; sweep 1 = sens horaire à l'écran. */
const arc = (to, sweep, large = 0) => `A ${R} ${R} 0 ${large} ${sweep} ${pt(to)}`;

// La lentille : de P à Q par l'arc du cercle O₁ (côté droit, passe par O₂), puis de Q à P par l'arc du cercle O₂.
const REGION = `M ${pt(TOP)} ${arc(BOT, 1)} ${arc(TOP, 1)} Z`;
// Le secteur de 120° de centre O₁ entre P et Q.
const SECTOR = `M ${pt(O1)} L ${pt(TOP)} ${arc(BOT, 1)} Z`;

function Label({ at, dx = 0, dy = 0, children, color = FIG.label, size = 15 }) {
  return (
    <text x={at[0] + dx} y={at[1] + dy} fill={color} fontSize={size} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

export default function Lens({ layers = BASE_LAYERS, ariaLabel }) {
  const on = new Set(layers);
  const a = 0.5; // rayon de l'arc d'angle, en unités de r
  return (
    <svg viewBox="0 0 340 260" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[460px]" data-figure="Lens">
      <rect x="0" y="0" width="340" height="260" fill={FIG.paper} />
      {on.has('region') && <path d={REGION} fill={FIG.soughtFill} stroke={FIG.sought} strokeWidth="2.5" />}
      {on.has('sector') && <path d={SECTOR} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="2" />}
      {on.has('tri') && (
        <g>
          <path d={`M ${pt(O1)} L ${pt(O2)} L ${pt(TOP)} Z`} fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="2.2" />
          <path d={`M ${pt(O1)} L ${pt(O2)} L ${pt(BOT)} Z`} fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="2.2" />
          <Label at={P(0.25, H / 2)} dx={-15} dy={-9} color={FIG.observe} size={14}>r</Label>
          <Label at={P(0.75, H / 2)} dx={15} dy={-9} color={FIG.observe} size={14}>r</Label>
        </g>
      )}
      {on.has('circles') && (
        <g fill="none" stroke={FIG.ink} strokeWidth="1.8">
          <circle cx={O1[0]} cy={O1[1]} r={R} />
          <circle cx={O2[0]} cy={O2[1]} r={R} />
        </g>
      )}
      {on.has('chord') && <path d={`M ${pt(TOP)} L ${pt(BOT)}`} stroke={FIG.build} strokeWidth="2" strokeDasharray="6 5" />}
      {on.has('angle120') && (
        <g>
          <path d={`M ${pt(P(a * 0.5, a * H))} A ${a * R} ${a * R} 0 0 1 ${pt(P(a * 0.5, -a * H))}`} fill="none" stroke={FIG.observe} strokeWidth="2.2" />
          <Label at={P(0.3, 0)} dy={-10} color={FIG.observe} size={11}>120°</Label>
        </g>
      )}
      {on.has('centers') && (
        <g>
          <path d={`M ${pt(O1)} L ${pt(O2)}`} stroke={FIG.ink} strokeWidth="1.6" />
          <Label at={P(0.5, 0)} dx={-14} dy={11} size={13}>r</Label>
          <circle cx={O1[0]} cy={O1[1]} r="3.5" fill={FIG.ink} />
          <circle cx={O2[0]} cy={O2[1]} r="3.5" fill={FIG.ink} />
          <Label at={O1} dx={-16} dy={0}>O₁</Label>
          <Label at={O2} dx={17} dy={0}>O₂</Label>
        </g>
      )}
      {on.has('points') && (
        <g>
          <circle cx={TOP[0]} cy={TOP[1]} r="4.5" fill={FIG.observe} />
          <circle cx={BOT[0]} cy={BOT[1]} r="4.5" fill={FIG.observe} />
          <Label at={TOP} dy={-14}>M</Label>
          <Label at={BOT} dy={15}>N</Label>
        </g>
      )}
    </svg>
  );
}
