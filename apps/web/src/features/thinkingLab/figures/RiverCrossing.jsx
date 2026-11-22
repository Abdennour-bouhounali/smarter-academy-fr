import { FIG, ltrText } from './palette';

/**
 * #33 « الراعي والنهر » — figure STATIQUE (la rivière jouable est prévue plus tard) :
 * les deux rives, l'oued, la barque, et quatre étiquettes (الراعي، الذئب، الخروف، البرسيم).
 * Une couche d'ÉTAT place les étiquettes (la dernière de STATE_ORDER présente l'emporte) ;
 * `danger` dessine la chaîne « يأكل » ; `plan` la suite des 7 traversées.
 * Pas de personnage dessiné : le berger est une étiquette (règle des personnages).
 */
export const LAYERS = ['scene', 'start', 'wolfFirst', 'sheepFirst', 'sheepBack', 'end', 'danger', 'plan'];
export const BASE_LAYERS = ['scene', 'start'];

const STATE_ORDER = ['start', 'wolfFirst', 'sheepFirst', 'sheepBack', 'end'];
const NAMES = { wolf: 'الذئب', sheep: 'الخروف', clover: 'البرسيم', shepherd: 'الراعي' };
/** left / right : sur les rives ; boat : 'L' | 'R' et sa cargaison (le berger y est toujours). */
const STATES = {
  start: { left: ['wolf', 'sheep', 'clover'], right: [], boat: 'L', cargo: [] },
  wolfFirst: { left: ['sheep', 'clover'], right: ['wolf'], boat: 'R', cargo: [], alarm: 'left' },
  sheepFirst: { left: ['wolf', 'clover'], right: ['sheep'], boat: 'R', cargo: [] },
  sheepBack: { left: ['clover'], right: ['wolf'], boat: 'L', cargo: ['sheep'] },
  end: { left: [], right: ['wolf', 'sheep', 'clover'], boat: 'R', cargo: [] },
};
const PLAN = [
  ['→', 'sheep'], ['←', null], ['→', 'wolf'], ['←', 'sheep'], ['→', 'clover'], ['←', null], ['→', 'sheep'],
];

const BW = 62;
const BH = 24;
const arabic = { fontFamily: 'Cairo, Tajawal, system-ui, sans-serif' };

function Badge({ x, y, who, stroke = FIG.ink, fill = FIG.paper }) {
  return (
    <g>
      <rect x={x - BW / 2} y={y - BH / 2} width={BW} height={BH} rx="8" fill={fill} stroke={stroke} strokeWidth="1.8" />
      <text x={x} y={y + 1} fill={FIG.label} fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={arabic}>{NAMES[who]}</text>
    </g>
  );
}

export default function RiverCrossing({ layers = BASE_LAYERS, ariaLabel }) {
  const on = new Set(layers);
  const stateName = [...STATE_ORDER].reverse().find((s) => on.has(s));
  const state = stateName ? STATES[stateName] : null;
  const bankY = (i) => 52 + i * 36;
  const boatX = state?.boat === 'R' ? 248 : 172; // centre de la barque
  const sheepFill = (who) => (on.has('danger') && who === 'sheep' ? FIG.observeFill : FIG.paper);

  return (
    <svg viewBox="0 0 420 300" role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[480px]" data-figure="RiverCrossing">
      <rect x="0" y="0" width="420" height="300" fill={FIG.paper} />
      {on.has('scene') && (
        <g>
          <rect x="0" y="22" width="112" height="160" fill={FIG.deadEndFill} />
          <rect x="308" y="22" width="112" height="160" fill={FIG.deadEndFill} />
          <path d="M 112 22 C 104 70 120 130 112 182 L 308 182 C 316 130 300 70 308 22 Z" fill={FIG.soughtFill} />
          {[60, 100, 140].map((y) => (
            <path key={`w${y}`} d={`M 150 ${y} q 12 -6 24 0 t 24 0 M 230 ${y + 14} q 12 -6 24 0 t 24 0`} fill="none" stroke={FIG.sought} strokeWidth="1.4" opacity="0.7" />
          ))}
        </g>
      )}
      {state && (
        <g>
          {state.left.map((who, i) => <Badge key={`l${who}`} x={56} y={bankY(i)} who={who} fill={sheepFill(who)} stroke={state.alarm === 'left' ? FIG.deadEnd : FIG.ink} />)}
          {state.right.map((who, i) => <Badge key={`r${who}`} x={364} y={bankY(i)} who={who} fill={sheepFill(who)} />)}
          {state.alarm === 'left' && (
            <rect x="16" y={bankY(0) - 20} width="80" height="76" rx="10" fill="none" stroke={FIG.deadEnd} strokeWidth="2.2" strokeDasharray="5 4" />
          )}
          <path d={`M ${boatX - 66} 150 L ${boatX + 66} 150 L ${boatX + 50} 172 L ${boatX - 50} 172 Z`} fill={FIG.paper} stroke={FIG.ink} strokeWidth="2.2" strokeLinejoin="round" />
          <Badge x={state.cargo.length ? boatX + 32 : boatX} y={136} who="shepherd" fill={FIG.buildFill} stroke={FIG.build} />
          {state.cargo.map((who) => <Badge key={`c${who}`} x={boatX - 32} y={136} who={who} fill={sheepFill(who)} />)}
        </g>
      )}
      {on.has('danger') && (
        <g>
          <Badge x={340} y={214} who="wolf" />
          <Badge x={210} y={214} who="sheep" fill={FIG.observeFill} stroke={FIG.observe} />
          <Badge x={80} y={214} who="clover" />
          {[[306, 244], [176, 114]].map(([from, to]) => (
            <g key={`d${from}`} stroke={FIG.observe} strokeWidth="2" fill="none">
              <path d={`M ${from} 214 L ${to} 214 M ${to + 7} 209 L ${to} 214 L ${to + 7} 219`} />
              <text x={(from + to) / 2} y="203" fill={FIG.observe} stroke="none" fontSize="11" fontWeight="700" textAnchor="middle" style={arabic}>يأكل</text>
            </g>
          ))}
        </g>
      )}
      {on.has('plan') && (
        <g>
          {PLAN.map(([arrow, who], i) => {
            const x = 386 - i * 58; // de droite à gauche : on lit en arabe
            return (
              <g key={`t${i}`}>
                <rect x={x - 26} y="244" width="52" height="48" rx="7" fill={who === 'sheep' && arrow === '←' ? FIG.observeFill : FIG.buildFill} stroke={FIG.build} strokeWidth="1.4" />
                <text x={x} y="258" fill={FIG.build} fontSize="12" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>{`${i + 1} ${arrow}`}</text>
                <text x={x} y="279" fill={FIG.label} fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={arabic}>{who ? NAMES[who] : 'وحده'}</text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
