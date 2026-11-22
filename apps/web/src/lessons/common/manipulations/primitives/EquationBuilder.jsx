import DropZone from './DropZone';
import NumberTile from './NumberTile';

/**
 * Une égalité À TROUS que l'élève complète en y posant des tuiles :
 *
 *     1938 = 836 × [ q ] + [ r ]
 *
 * `parts` est la suite des morceaux, LTR : { text } pour un symbole ou un
 * nombre connu, { slot: 'q', value, tone } pour un trou (vide : `value` nul).
 * Chaque trou est une DropZone qui accepte selon le type (via `drag.accepts`).
 * L'égalité n'est jamais écrite d'avance : elle se construit sous les yeux.
 */
export default function EquationBuilder({ parts, drag, slotLabel, size = 'md', className = '' }) {
  const text = size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <div dir="ltr" className={`flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 font-mono ${text} ${className}`}>
      {parts.map((p, i) => {
        if (p.slot) {
          const filled = p.value !== null && p.value !== undefined;
          return (
            <DropZone key={p.slot} drag={drag} id={`slot:${p.slot}`} label={slotLabel?.(p.slot)} tone={p.tone ?? 'indigo'} minHeight="min-h-[48px]" className="flex min-w-[56px] items-center justify-center px-1" disabled={filled && !p.replaceable}>
              {filled ? <NumberTile value={p.value} tone={p.tileTone ?? 'quotient'} size="sm" /> : <span className="text-slate-300">?</span>}
            </DropZone>
          );
        }
        return <span key={i} className={`font-extrabold ${p.muted ? 'text-slate-400' : 'text-slate-800'}`}>{p.text}</span>;
      })}
    </div>
  );
}
