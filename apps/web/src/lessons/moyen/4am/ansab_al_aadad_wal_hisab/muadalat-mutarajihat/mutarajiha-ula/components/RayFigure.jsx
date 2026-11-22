import MathText from '../../../../../../common/components/MathText';

/**
 * Le dessin du manuel pour les solutions d'une متراجحة (معارف 4, p. 48 ; tableau du
 * نشاط 3, p. 45), DESSINÉ (jamais une image) et paramétré :
 *
 *   • une droite graduée orientée vers la droite (LTR, comme dans le livre) ;
 *   • les solutions en ROUGE (« الجزء الملوّن بالأحمر ») d'un côté de la borne ;
 *   • à la borne, le crochet TOURNÉ vers la partie rouge quand la borne est solution
 *     (≤, ≥ — `closed`), DÉTOURNÉ sinon (<, >) : convention de extraction.json › know-4.
 *
 * L'étiquette « حلول المتراجحة » et la borne fractionnaire sont du texte DOM (MathText) ;
 * le SVG porte un `aria-label` arabe fourni par la leçon (la lecture de la figure).
 *
 * @param from, to   graduations entières extrêmes
 * @param at         la borne (nombre JS, seulement pour la position)
 * @param boundTex   l'étiquette LaTeX de la borne quand elle n'est pas entière (« \dfrac{3}{5} »)
 * @param side       'left' | 'right' — le côté coloré
 * @param closed     la borne est-elle solution ?
 */
const W = 300;
const H = 78;
const Y = 46;
const PAD = 16;

export default function RayFigure({ from, to, at, boundTex, side, closed, label, caption, showLabel = true }) {
  const span = to - from;
  const xOf = (v) => PAD + ((v - from) / span) * (W - 2 * PAD);
  const b = xOf(at);
  const turned = (side === 'left') === closed; // « ] » (ouvre à gauche) : rouge à gauche et fermé, ou rouge à droite et ouvert
  const dir = turned ? -1 : 1;
  const [r0, r1] = side === 'left' ? [PAD - 10, b] : [b, W - 6];
  const ticks = Array.from({ length: span + 1 }, (_, i) => from + i);
  const integerBound = Number.isInteger(at);
  return (
    <figure className="w-full max-w-sm" data-ray-figure data-side={side} data-closed={String(closed)}>
      <div className="relative" dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
          <line x1={r0} x2={r1} y1={Y} y2={Y} stroke="#DC2626" strokeWidth={5} />
          <line x1={PAD - 12} x2={W - 6} y1={Y} y2={Y} stroke="#334155" strokeWidth={1.5} />
          <path d={`M ${W - 4} ${Y} l -9 -5 l 0 10 z`} fill="#334155" />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={xOf(v)} x2={xOf(v)} y1={Y - 5} y2={Y + 5} stroke="#475569" strokeWidth={1.2} />
              {!(integerBound && v === at) && <text x={xOf(v)} y={Y + 20} textAnchor="middle" fontSize={11} fill="#334155" fontFamily="ui-monospace, monospace">{v}</text>}
            </g>
          ))}
          {integerBound && <text x={b} y={Y + 20} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#B91C1C" fontFamily="ui-monospace, monospace">{at}</text>}
          <path d={`M ${b + dir * 9} ${Y - 15} L ${b} ${Y - 15} L ${b} ${Y + 15} L ${b + dir * 9} ${Y + 15}`} fill="none" stroke="#B91C1C" strokeWidth={2.4} data-glyph={turned ? ']' : '['} />
        </svg>
        {!integerBound && boundTex && (
          <span className="absolute -translate-x-1/2 text-[11px] font-bold text-red-700" style={{ left: `${(b / W) * 100}%`, top: `${((Y + 12) / H) * 100}%` }}>
            <MathText>{`$${boundTex}$`}</MathText>
          </span>
        )}
        {showLabel && (
          <span className="absolute text-[11px] font-bold text-red-700" dir="rtl"
            style={side === 'left' ? { left: '4%', top: 0, maxWidth: `${Math.max(20, (b / W) * 100 - 8)}%` } : { left: `${(b / W) * 100 + 5}%`, top: 0 }}>
            حلول المتراجحة
          </span>
        )}
      </div>
      {caption && <figcaption className="text-center text-xs text-slate-600"><MathText>{caption}</MathText></figcaption>}
    </figure>
  );
}
