import { FIG, ltrText } from './palette';

/**
 * #318 « المساحة بين الأقواس الأربعة » — le carré ABCD, les quatre quarts de cercle
 * de rayon x centrés aux sommets, et la région commune aux QUATRE disques (pas une
 * lentille : la publication d'origine ombrait une lentille, c'était faux).
 *
 * Géométrie en unités de x (côté 1), puis mise à l'échelle : les points d'intersection
 * sont à (½, √3/2), (½, 1 − √3/2), (1 − √3/2, ½), (√3/2, ½) — calculés, jamais dessinés à l'œil.
 */
export const LAYERS = ['square', 'arcs', 'region', 'outside', 'tri', 'pts', 'height', 'innerSquare', 'segments', 'diagonal', 'angle30'];
export const BASE_LAYERS = ['square', 'arcs', 'region'];

const S = 240; // côté en px
const O = 40; // marge
const H = Math.sqrt(3) / 2;
/** (u, v) en unités de x, origine en A (bas gauche), v vers le haut → coordonnées SVG. */
const P = (u, v) => [O + u * S, O + S - v * S];
const A = P(0, 0);
const B = P(1, 0);
const C = P(1, 1);
const D = P(0, 1);
const TOP = P(0.5, H);
const BOT = P(0.5, 1 - H);
const LEFT = P(1 - H, 0.5);
const RIGHT = P(H, 0.5);
const pt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
const arc = (to) => `A ${S} ${S} 0 0 1 ${pt(to)}`;

/** La région : quatre arcs, chacun centré au sommet OPPOSÉ (le plus loin). */
const REGION = `M ${pt(TOP)} ${arc(RIGHT)} ${arc(BOT)} ${arc(LEFT)} ${arc(TOP)} Z`;
const SQUARE = `M ${pt(A)} L ${pt(B)} L ${pt(C)} L ${pt(D)} Z`;

function Label({ at, dx = 0, dy = 0, children, color = FIG.label, size = 15 }) {
  return (
    <text x={at[0] + dx} y={at[1] + dy} fill={color} fontSize={size} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

export default function FourArcs({ layers = BASE_LAYERS, ariaLabel }) {
  const on = new Set(layers);
  return (
    <svg viewBox="0 0 320 320" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[420px]" data-figure="FourArcs">
      <rect x="0" y="0" width="320" height="320" fill={FIG.paper} />
      {on.has('outside') && <path d={`${SQUARE} ${REGION}`} fill={FIG.deadEndFill} fillRule="evenodd" stroke="none" />}
      {on.has('region') && <path d={REGION} fill={FIG.soughtFill} stroke={FIG.sought} strokeWidth="2.5" />}
      {on.has('segments') && (
        <>
          <path d={REGION} fill={FIG.observeFill} stroke="none" />
          <path d={`M ${pt(TOP)} L ${pt(RIGHT)} L ${pt(BOT)} L ${pt(LEFT)} Z`} fill={FIG.paper} stroke="none" />
        </>
      )}
      {on.has('innerSquare') && (
        <path d={`M ${pt(TOP)} L ${pt(RIGHT)} L ${pt(BOT)} L ${pt(LEFT)} Z`} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="2" />
      )}
      {on.has('arcs') && (
        <g fill="none" stroke={FIG.ink} strokeWidth="1.6">
          <path d={`M ${pt(D)} ${arc(B)}`} />
          <path d={`M ${pt(A)} ${arc(C)}`} />
          <path d={`M ${pt(B)} ${arc(D)}`} />
          <path d={`M ${pt(C)} ${arc(A)}`} />
        </g>
      )}
      {on.has('square') && (
        <g>
          <path d={SQUARE} fill="none" stroke={FIG.ink} strokeWidth="2.2" />
          <Label at={A} dx={-14} dy={12}>A</Label>
          <Label at={B} dx={14} dy={12}>B</Label>
          <Label at={C} dx={14} dy={-12}>C</Label>
          <Label at={D} dx={-14} dy={-12}>D</Label>
          <Label at={P(0.5, 0)} dy={18}>x</Label>
        </g>
      )}
      {on.has('tri') && (
        <g>
          <path d={`M ${pt(A)} L ${pt(B)} L ${pt(TOP)} Z`} fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="2.4" />
          <Label at={P(0.25, H / 2)} dx={-16} dy={-6} color={FIG.observe}>x</Label>
          <Label at={P(0.75, H / 2)} dx={16} dy={-6} color={FIG.observe}>x</Label>
        </g>
      )}
      {on.has('height') && (
        <g>
          <path d={`M ${pt(TOP)} L ${pt(P(0.5, 0))}`} stroke={FIG.build} strokeWidth="2" strokeDasharray="6 5" />
          <Label at={P(0.5, 0.18)} dx={12} color={FIG.build}>h</Label>
        </g>
      )}
      {on.has('diagonal') && (
        <g>
          <path d={`M ${pt(TOP)} L ${pt(BOT)}`} stroke={FIG.build} strokeWidth="2.2" strokeDasharray="6 5" />
          <Label at={P(0.5, 0.5)} dx={12} color={FIG.build}>d</Label>
        </g>
      )}
      {on.has('angle30') && (
        <g>
          <path d={`M ${pt(A)} L ${pt(TOP)} M ${pt(A)} L ${pt(RIGHT)}`} stroke={FIG.observe} strokeWidth="1.8" />
          <path d={`M ${pt(P(0.3 * Math.cos(Math.PI / 6), 0.3 * Math.sin(Math.PI / 6)))} A ${0.3 * S} ${0.3 * S} 0 0 0 ${pt(P(0.3 * 0.5, 0.3 * H))}`} fill="none" stroke={FIG.observe} strokeWidth="2" />
          <Label at={P(0.36, 0.29)} color={FIG.observe} size={13}>30°</Label>
        </g>
      )}
      {on.has('pts') && (
        <g fill={FIG.observe}>
          {[TOP, RIGHT, BOT, LEFT].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" />)}
        </g>
      )}
    </svg>
  );
}
