import { FIG, ltrText } from './palette';

/**
 * #500 « الدائرة الأخيرة » — n enfants (des jetons numérotés, pas de personnages)
 * sur un cercle, numérotés 1…n dans le sens des aiguilles d'une montre à partir du haut.
 *
 * Couches :
 *   ring      le cercle, le jeton 1 marqué comme départ ;
 *   round1    le premier tour : tous les numéros pairs sortent (grisés) ;
 *   firstOut  seulement les r = n − 2ᵏ premiers sortants 2, 4, …, 2r (il reste 2ᵏ enfants) ;
 *   leader    l'enfant 2r + 1 qui reprend le compte à ce moment, et « 2ᵏ » au centre.
 * Positions et 2ᵏ calculés à partir de n, jamais posés à l'œil.
 */
export const LAYERS = ['ring', 'round1', 'firstOut', 'leader'];
export const BASE_LAYERS = ['ring'];

const SIZE = 360;
const C = SIZE / 2;
const R = 150;

export function powerBelow(n) {
  let p = 1;
  while (p * 2 <= n) p *= 2;
  return p;
}

export default function JosephusCircle({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const raw = Math.round(Number(props.n));
  const n = Number.isFinite(raw) ? Math.min(64, Math.max(2, raw)) : 41;
  const p = powerBelow(n);
  const r = n - p;
  const leader = 2 * r + 1;
  const dot = Math.max(7, Math.min(13, (Math.PI * R) / n - 1.5));
  const font = Math.max(8, Math.min(13, dot * 1.05));

  const out = (i) => (on.has('round1') && i % 2 === 0) || (on.has('firstOut') && i % 2 === 0 && i <= 2 * r);
  const at = (i) => {
    const a = -Math.PI / 2 + ((i - 1) * 2 * Math.PI) / n;
    return [C + R * Math.cos(a), C + R * Math.sin(a)];
  };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[440px]" data-figure="JosephusCircle">
      <rect x="0" y="0" width={SIZE} height={SIZE} fill={FIG.paper} />
      {on.has('ring') && (
        <>
          <circle cx={C} cy={C} r={R} fill="none" stroke={FIG.muted} strokeWidth="1.4" strokeDasharray="3 5" />
          {/* le sens du compte : une flèche courte à droite du jeton 1 */}
          <path
            d={`M ${C + 22} ${C - R - dot - 10} A ${R + dot + 10} ${R + dot + 10} 0 0 1 ${C + 52} ${C - R - dot - 6}`}
            fill="none"
            stroke={FIG.ink}
            strokeWidth="1.6"
          />
          <path d={`M ${C + 52} ${C - R - dot - 6} l -8 -5 l 1 9 z`} fill={FIG.ink} />
          {Array.from({ length: n }, (_, k) => k + 1).map((i) => {
            const [x, y] = at(i);
            const isOut = out(i);
            const isLeader = on.has('leader') && i === leader;
            const isStart = i === 1 && !on.has('leader');
            return (
              <g key={i} opacity={isOut ? 0.45 : 1}>
                <circle
                  cx={x}
                  cy={y}
                  r={dot}
                  fill={isOut ? FIG.deadEndFill : isLeader ? FIG.soughtFill : FIG.paper}
                  stroke={isOut ? FIG.deadEnd : isLeader ? FIG.sought : isStart ? FIG.observe : FIG.ink}
                  strokeWidth={isLeader || isStart ? 2.6 : 1.3}
                />
                <text x={x} y={y + 0.5} fill={isOut ? FIG.deadEnd : FIG.label} fontSize={font} fontWeight="600" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
                  {i}
                </text>
                {isOut && <line x1={x - dot * 0.7} y1={y + dot * 0.7} x2={x + dot * 0.7} y2={y - dot * 0.7} stroke={FIG.deadEnd} strokeWidth="1.4" />}
              </g>
            );
          })}
        </>
      )}
      {on.has('leader') && (
        <g>
          <text x={C} y={C - 8} fill={FIG.sought} fontSize="30" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
            {p}
          </text>
          <text x={C} y={C + 22} fill={FIG.sought} fontSize="13" fontWeight="600" textAnchor="middle" direction="rtl">
            طفلًا باقيًا
          </text>
        </g>
      )}
      {on.has('firstOut') && !on.has('leader') && (
        <text x={C} y={C} fill={FIG.deadEnd} fontSize="24" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={ltrText}>
          {`${n} − ${r} = ${p}`}
        </text>
      )}
    </svg>
  );
}
