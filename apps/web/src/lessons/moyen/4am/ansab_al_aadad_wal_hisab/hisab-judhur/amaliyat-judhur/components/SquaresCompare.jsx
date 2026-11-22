import MathText from '../../../../../../common/components/MathText';

/**
 * L'argument de l'activité 4 (مجموع جذرين وفرقهما, p. 21) DESSINÉ : des
 * carrés quadrillés dont l'AIRE est le nombre sous la racine (16 petits
 * carreaux, 9, 25) et, dessous, les CÔTÉS posés bout à bout. Le côté du
 * carré d'aire 16 + 9 = 25 mesure 5 ; les côtés 4 et 3 mis bout à bout
 * mesurent 7. Pour la différence : 100 − 36 = 64, côté 8 ; 10 − 6 = 4.
 *
 * Tout est calculé à partir des nombres reçus (des carrés parfaits du
 * manuel) ; les étiquettes sont du DOM, les nombres des îlots LTR.
 * Rendu APRÈS la réponse de l'élève (révélation conditionnée) : il montre
 * ce qu'il vient de calculer, il ne le lui donne pas.
 */
const side = (n) => Math.round(Math.sqrt(n));

function Square({ area, unit, tone }) {
  const s = side(area);
  const px = s * unit;
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg width={px + 2} height={px + 2} viewBox={`-1 -1 ${px + 2} ${px + 2}`} aria-hidden="true">
        <rect x={0} y={0} width={px} height={px} className={tone.fill} />
        {Array.from({ length: s - 1 }, (_, i) => (
          <g key={i} className="stroke-white" strokeWidth={1}>
            <line x1={(i + 1) * unit} y1={0} x2={(i + 1) * unit} y2={px} />
            <line x1={0} y1={(i + 1) * unit} x2={px} y2={(i + 1) * unit} />
          </g>
        ))}
        <rect x={0} y={0} width={px} height={px} fill="none" className={tone.stroke} strokeWidth={2} />
      </svg>
      <figcaption className="text-center text-xs text-slate-700">
        المساحة <MathText>{`$${area}$`}</MathText> ، الضلع <MathText>{`$\\sqrt{${area}} = ${s}$`}</MathText>
      </figcaption>
    </figure>
  );
}

const TONES = [
  { fill: 'fill-sky-400', stroke: 'stroke-sky-700', bar: 'bg-sky-400' },
  { fill: 'fill-amber-400', stroke: 'stroke-amber-700', bar: 'bg-amber-400' },
  { fill: 'fill-emerald-400', stroke: 'stroke-emerald-700', bar: 'bg-emerald-400' },
];

/**
 * @param {number} a  premier nombre (carré parfait) — 16 ou 100
 * @param {number} b  second nombre (carré parfait) — 9 ou 36
 * @param {'+'|'-'} op la somme ou la différence
 */
export default function SquaresCompare({ a, b, op = '+' }) {
  const whole = op === '+' ? a + b : a - b;
  const [sa, sb, sw] = [side(a), side(b), side(whole)];
  const unit = Math.max(6, Math.floor(84 / Math.max(sa, sb, sw)));
  const combined = op === '+' ? sa + sb : sa - sb;
  const scale = 100 / Math.max(sa + (op === '+' ? sb : 0), sw);
  const opTex = op === '+' ? '+' : '-';
  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3" data-squares-compare={op}>
      <div className="flex flex-wrap items-end justify-center gap-4" dir="ltr">
        <Square area={a} unit={unit} tone={TONES[0]} />
        <Square area={b} unit={unit} tone={TONES[1]} />
        <Square area={whole} unit={unit} tone={TONES[2]} />
      </div>
      {/* Les côtés, bout à bout : c'est ici que √a ± √b se compare à √(a ± b). */}
      <div className="space-y-1.5" dir="ltr">
        <div className="flex h-4 w-full items-stretch">
          {op === '+' ? (
            <>
              <div className={`${TONES[0].bar} rounded-s`} style={{ width: `${sa * scale}%` }} />
              <div className={`${TONES[1].bar} rounded-e`} style={{ width: `${sb * scale}%` }} />
            </>
          ) : (
            <>
              <div className={`${TONES[0].bar} rounded-s`} style={{ width: `${(sa - sb) * scale}%` }} />
              <div className="rounded-e border-2 border-dashed border-amber-600" style={{ width: `${sb * scale}%` }} />
            </>
          )}
        </div>
        <div className="flex h-4 w-full"><div className={`${TONES[2].bar} rounded`} style={{ width: `${sw * scale}%` }} /></div>
      </div>
      <p className="text-center text-sm text-slate-800">
        <MathText>{`$\\sqrt{${a}} ${opTex} \\sqrt{${b}} = ${sa} ${opTex} ${sb} = ${combined}$`}</MathText>
        {' '}أما{' '}
        <MathText>{`$\\sqrt{${a} ${opTex} ${b}} = \\sqrt{${whole}} = ${sw}$`}</MathText>
      </p>
    </div>
  );
}
