import { FIG, ltrText } from './palette';

/**
 * #12 « الحلزون في البئر » — une coupe du puits avec sa règle graduée (m) et le trajet du
 * colimaçon jour par jour : montée de jour (trait plein), glissade de nuit (pointillé).
 * Le trajet est SIMULÉ à partir de props { depth, up, down } (jamais dessiné à l'œil) ;
 * l'axe horizontal du puits est le temps (une colonne par jour).
 */
export const LAYERS = ['well', 'ruler', 'snail', 'path', 'lastDay', 'threshold', 'deadEnd'];
export const BASE_LAYERS = ['well', 'ruler', 'snail'];

const W = 380;
const GY = 50; // niveau du sol (bord du puits)
const BY = 300; // fond du puits
const SX0 = 92; // paroi gauche
const SX1 = 318; // paroi droite
const RX = 62; // règle

const num = (v, d) => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : d;
};

/** Le trajet simulé : liste de [jour (0 = départ), hauteur, 'day'|'night'] et le dernier jour. */
export function climb(depth, up, down) {
  const steps = [[0, 0]];
  let h = 0;
  for (let day = 1; day <= 200; day++) {
    const top = h + up;
    if (top >= depth) {
      steps.push([day - 0.5, depth, 'day']);
      return { steps, lastDay: day };
    }
    steps.push([day - 0.5, top, 'day']);
    h = top - down;
    steps.push([day, h, 'night']);
  }
  return { steps, lastDay: 200 };
}

export default function SnailWell({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const depth = num(props.depth, 10);
  const up = num(props.up, 3);
  const down = Math.min(num(props.down, 2), up - 0.5);
  const { steps, lastDay } = climb(depth, up, down);
  const net = up - down;
  const columns = Math.max(lastDay, Math.ceil(depth / net)); // assez de jours pour la fausse piste
  const cw = (SX1 - SX0 - 24) / columns;
  const X = (day) => SX0 + 12 + day * cw;
  const Y = (m) => BY - (m / depth) * (BY - GY);
  const pt = (day, m) => `${X(day).toFixed(2)} ${Y(m).toFixed(2)}`;

  const dayPath = [];
  const nightPath = [];
  for (let i = 1; i < steps.length; i++) {
    const [d0, h0] = steps[i - 1];
    const [d1, h1, kind] = steps[i];
    (kind === 'day' ? dayPath : nightPath).push(`M ${pt(d0, h0)} L ${pt(d1, h1)}`);
  }
  const lastStart = steps[steps.length - 2];
  const tickStep = (BY - GY) / depth >= 18 ? 1 : 2;
  const ticks = [];
  for (let m = 0; m <= depth; m += 1) ticks.push(m);
  const labelled = (m) => m === depth || (m % tickStep === 0 && depth - m >= tickStep);

  return (
    <svg viewBox={`0 0 ${W} 330`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[440px]" data-figure="SnailWell">
      <rect x="0" y="0" width={W} height="330" fill={FIG.paper} />
      {on.has('well') && (
        <g>
          <rect x="74" y={GY} width={SX0 - 74} height={BY - GY + 14} fill={FIG.deadEndFill} />
          <rect x={SX1} y={GY} width={W - 20 - SX1} height={BY - GY + 14} fill={FIG.deadEndFill} />
          <rect x="74" y={BY} width={W - 20 - 74} height="14" fill={FIG.deadEndFill} />
          <path d={`M 74 ${GY} L ${SX0} ${GY} L ${SX0} ${BY} L ${SX1} ${BY} L ${SX1} ${GY} L ${W - 20} ${GY}`} fill="none" stroke={FIG.ink} strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      )}
      {on.has('ruler') && (
        <g>
          <path d={`M ${RX} ${GY} L ${RX} ${BY}`} stroke={FIG.ink} strokeWidth="1.6" />
          {ticks.map((m) => (
            <g key={`t${m}`}>
              <path d={`M ${RX - (labelled(m) ? 7 : 4)} ${Y(m)} L ${RX} ${Y(m)}`} stroke={FIG.ink} strokeWidth="1.3" />
              {labelled(m) && (
                <text x={RX - 11} y={Y(m)} fill={FIG.label} fontSize="11" textAnchor="end" dominantBaseline="middle" style={ltrText}>{m}</text>
              )}
            </g>
          ))}
          <text x={RX} y={GY - 14} fill={FIG.label} fontSize="12" fontWeight="600" textAnchor="middle" style={ltrText}>m</text>
        </g>
      )}
      {on.has('deadEnd') && (
        <path d={`M ${pt(0, 0)} L ${pt(depth / net, depth)}`} stroke={FIG.deadEnd} strokeWidth="2.2" strokeDasharray="3 5" fill="none" />
      )}
      {on.has('threshold') && (
        <g>
          <path d={`M ${SX0} ${Y(depth - up)} L ${SX1} ${Y(depth - up)}`} stroke={FIG.build} strokeWidth="2" strokeDasharray="7 5" />
          <text x={SX1 + 6} y={Y(depth - up)} fill={FIG.build} fontSize="12" fontWeight="700" dominantBaseline="middle" style={ltrText}>{`${depth - up} m`}</text>
        </g>
      )}
      {on.has('path') && (
        <g fill="none" strokeLinecap="round">
          <path d={dayPath.join(' ')} stroke={FIG.sought} strokeWidth="2.4" />
          <path d={nightPath.join(' ')} stroke={FIG.muted} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      )}
      {on.has('lastDay') && (
        <g>
          <path d={`M ${pt(lastStart[0], lastStart[1])} L ${pt(lastDay - 0.5, depth)}`} stroke={FIG.observe} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx={X(lastDay - 0.5)} cy={Y(depth)} r="5" fill={FIG.observe} />
        </g>
      )}
      {on.has('snail') && (
        <g transform={`translate(${SX0 + 22} ${BY - 9})`}>
          <path d="M -14 8 Q -4 2 14 8 L 16 2" fill="none" stroke={FIG.ink} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="0" cy="-1" r="8.5" fill={FIG.observeFill} stroke={FIG.ink} strokeWidth="1.8" />
          <path d="M 0 -1 m 0 -4 a 4 4 0 1 1 -3.5 5.5 a 2 2 0 1 1 2 -2" fill="none" stroke={FIG.ink} strokeWidth="1.2" />
          <path d="M 14 2 L 17 -5 M 15 2 L 20 -3" stroke={FIG.ink} strokeWidth="1.3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
