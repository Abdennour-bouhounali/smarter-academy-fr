import { FIG, ltrText } from './palette';

/**
 * #47 « الكرة الأثقل » — figure STATIQUE (la balance jouable est prévue plus tard) :
 * une balance à deux plateaux et 9 boules numérotées. Une couche de DISPOSITION les place
 * (la dernière de ARRANGEMENTS présente l'emporte) :
 *   row     les 9 boules alignées devant la balance ;
 *   halves  4 contre 4, une de côté (la fausse piste) ;
 *   groups  3 contre 3, 3 de côté (trois groupes colorés) ;
 *   second  la 2ᵉ pesée : 1 contre 1, 1 de côté, dans le groupe suspect.
 * `outcomes` écrit les trois issues d'une pesée.
 */
export const LAYERS = ['balance', 'row', 'halves', 'groups', 'second', 'outcomes'];
export const BASE_LAYERS = ['balance', 'row'];

const ARRANGEMENTS = ['row', 'halves', 'groups', 'second'];
const BR = 11; // rayon d'une boule
const LEFT_PAN = 110;
const RIGHT_PAN = 290;
const PAN_TOP = 168;
const ASIDE_Y = 268;
const arabic = { fontFamily: 'Cairo, Tajawal, system-ui, sans-serif' };

/** Positions d'un tas de k boules posé sur un plateau centré en cx (rangées de 3 au plus). */
function onPan(k, cx) {
  const out = [];
  let left = k;
  let row = 0;
  while (left > 0) {
    const inRow = Math.min(3, left);
    for (let i = 0; i < inRow; i++) out.push([cx + (i - (inRow - 1) / 2) * (2 * BR + 2), PAN_TOP - BR - 1 - row * (2 * BR - 2)]);
    left -= inRow;
    row++;
  }
  return out;
}
/** Une rangée de k boules au sol, centrée en cx. */
const aside = (k, cx = 200, y = ASIDE_Y) => Array.from({ length: k }, (_, i) => [cx + (i - (k - 1) / 2) * (2 * BR + 6), y]);

const GROUP = [
  { fill: FIG.observeFill, stroke: FIG.observe },
  { fill: FIG.buildFill, stroke: FIG.build },
  { fill: FIG.soughtFill, stroke: FIG.sought },
];

/** [x, y, numéro, style] pour la disposition demandée. */
function arrangement(name) {
  const plain = { fill: FIG.paper, stroke: FIG.ink };
  if (name === 'halves') {
    const dead = { fill: FIG.deadEndFill, stroke: FIG.deadEnd };
    return [...onPan(4, LEFT_PAN), ...onPan(4, RIGHT_PAN), ...aside(1)].map(([x, y], i) => [x, y, i + 1, dead]);
  }
  if (name === 'groups') {
    return [...onPan(3, LEFT_PAN), ...onPan(3, RIGHT_PAN), ...aside(3)].map(([x, y], i) => [x, y, i + 1, GROUP[Math.floor(i / 3)]]);
  }
  if (name === 'second') {
    // le groupe suspect (7, 8, 9) : 7 contre 8, 9 de côté
    return [...onPan(1, LEFT_PAN), ...onPan(1, RIGHT_PAN), ...aside(1)].map(([x, y], i) => [x, y, 7 + i, GROUP[2]]);
  }
  return aside(9, 200, ASIDE_Y).map(([x, y], i) => [x, y, i + 1, plain]);
}

export default function BalanceNine({ layers = BASE_LAYERS, ariaLabel }) {
  const on = new Set(layers);
  const which = [...ARRANGEMENTS].reverse().find((a) => on.has(a));
  const balls = which ? arrangement(which) : [];
  return (
    <svg viewBox="0 0 400 290" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[460px]" data-figure="BalanceNine">
      <rect x="0" y="0" width="400" height="290" fill={FIG.paper} />
      {on.has('outcomes') && (
        <g fontSize="12" fontWeight="700" textAnchor="middle" style={arabic}>
          {[[LEFT_PAN, 'تميل يسارًا'], [200, 'تتوازن'], [RIGHT_PAN, 'تميل يمينًا']].map(([x, t]) => (
            <g key={t}>
              <rect x={x - 40} y="14" width="80" height="26" rx="13" fill={FIG.observeFill} stroke={FIG.observe} strokeWidth="1.6" />
              <text x={x} y="28" fill={FIG.label} dominantBaseline="middle">{t}</text>
            </g>
          ))}
        </g>
      )}
      {on.has('balance') && (
        <g stroke={FIG.ink} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M 200 72 L 200 236 M 160 240 L 240 240" />
          <circle cx="200" cy="72" r="5" fill={FIG.ink} />
          <path d={`M ${LEFT_PAN} 80 L ${RIGHT_PAN} 80`} />
          <path d={`M ${LEFT_PAN} 80 L ${LEFT_PAN - 50} ${PAN_TOP} M ${LEFT_PAN} 80 L ${LEFT_PAN + 50} ${PAN_TOP}`} strokeWidth="1.2" />
          <path d={`M ${RIGHT_PAN} 80 L ${RIGHT_PAN - 50} ${PAN_TOP} M ${RIGHT_PAN} 80 L ${RIGHT_PAN + 50} ${PAN_TOP}`} strokeWidth="1.2" />
          <path d={`M ${LEFT_PAN - 56} ${PAN_TOP} Q ${LEFT_PAN} ${PAN_TOP + 22} ${LEFT_PAN + 56} ${PAN_TOP} Z`} fill={FIG.paper} />
          <path d={`M ${RIGHT_PAN - 56} ${PAN_TOP} Q ${RIGHT_PAN} ${PAN_TOP + 22} ${RIGHT_PAN + 56} ${PAN_TOP} Z`} fill={FIG.paper} />
        </g>
      )}
      {balls.map(([x, y, n, s]) => (
        <g key={`b${n}`}>
          <circle cx={x} cy={y} r={BR} fill={s.fill} stroke={s.stroke} strokeWidth="1.8" />
          <text x={x} y={y + 0.5} fill={FIG.label} fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>{n}</text>
        </g>
      ))}
    </svg>
  );
}
