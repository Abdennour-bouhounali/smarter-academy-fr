import HighlightedNumber from './HighlightedNumber';

/**
 * Un ensemble de diviseurs en pastilles, croissant, LTR. Trois lectures :
 *  - `highlight` (Set) : les éléments à souligner (les communs, le plus grand) ;
 *  - `selected` + `onToggle` : l'élève DÉSIGNE lui-même des éléments ;
 *  - `revealedCount` : combien de pastilles sont déjà connues (révélation progressive).
 */
export default function DivisorSet({
  title, values, highlight, selected, onToggle, revealedCount, disabled = false, emptyLabel = '—', ariaLabel,
}) {
  const shown = typeof revealedCount === 'number' ? values.slice(0, revealedCount) : values;
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      {title && <div className="text-sm font-bold text-slate-800">{title}</div>}
      <div dir="ltr" className="flex flex-wrap gap-1.5" role={onToggle ? 'group' : undefined} aria-label={ariaLabel}>
        {shown.length === 0 && <span className="text-slate-400 text-sm">{emptyLabel}</span>}
        {shown.map((v) => {
          const isSel = selected?.has?.(v);
          const isHi = highlight?.has?.(v);
          if (onToggle) {
            return (
              <button
                key={v}
                type="button"
                disabled={disabled}
                aria-pressed={!!isSel}
                onClick={() => onToggle(v)}
                className={`rounded-lg border-2 px-2.5 py-1 font-mono font-bold tabular-nums text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isHi ? 'bg-emerald-600 border-emerald-700 text-white'
                    : isSel ? 'bg-blue-600 border-blue-700 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                }`}
              >
                {v}
              </button>
            );
          }
          return <HighlightedNumber key={v} value={v} tone={isHi ? 'common' : 'neutral'} />;
        })}
      </div>
    </div>
  );
}
