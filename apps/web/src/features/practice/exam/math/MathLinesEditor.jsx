import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Sigma, Type, X } from 'lucide-react';
import ExamMathField from './ExamMathField';
import { parseLines, serializeLines } from './linesModel';

/**
 * La RÉDACTION en lignes (propriétaire, 2026-10-06 : « l'arabe de droite à
 * gauche, les maths de gauche à droite ») — « مراحل الحساب » et la démonstration
 * « بيّن أن ». Chaque ligne est soit du TEXTE (champ RTL), soit une FORMULE
 * (MathLive, LTR). Entrée ajoute une ligne du même genre ; ✕ en retire une.
 * Ce qui est enregistré reste une chaîne (`serializeLines`) : `$…$` par formule.
 */
export default function MathLinesEditor({ value, onChange, startWith = 'math', ariaLabel, placeholder }) {
  const { t } = useTranslation('student');
  const [lines, setLines] = useState(() => parseLines(value, startWith));
  const [focusIndex, setFocusIndex] = useState(null);
  // La VÉRITÉ courante des lignes, hors du cycle de rendu : « Entrée » arrive
  // souvent avant que la dernière frappe ait été rendue — partir de l'état
  // rendu perdait alors la ligne qu'on venait d'écrire (vu le 2026-10-06).
  const linesRef = useRef(lines);

  const commit = (next) => {
    linesRef.current = next;
    setLines(next);
    onChange(serializeLines(next));
  };
  const update = (i, v) => commit(linesRef.current.map((l, k) => (k === i ? { ...l, value: v } : l)));
  const insertAfter = (i, kind) => {
    const cur = linesRef.current;
    setFocusIndex(i + 1);
    commit([...cur.slice(0, i + 1), { kind, value: '' }, ...cur.slice(i + 1)]);
  };
  const remove = (i) => {
    const cur = linesRef.current;
    commit(cur.length > 1 ? cur.filter((_, k) => k !== i) : [{ kind: cur[0].kind, value: '' }]);
  };

  return (
    <div className="sa-exam-lines" aria-label={ariaLabel} data-lines-editor>
      <ol className="space-y-0">
        {lines.map((line, i) => (
          <li key={i} className="group flex items-center gap-2 border-b border-slate-300/70" data-line-kind={line.kind}>
            {line.kind === 'math' ? (
              // Un clic n'importe où sur la ligne donne le focus à SA formule (le
              // premier clic sur un <math-field> tout juste chargé pouvait se perdre).
              <div className="min-w-0 flex-1 cursor-text py-0.5" dir="ltr" onMouseUp={(e) => { const f = e.currentTarget.querySelector('math-field'); if (f && document.activeElement !== f) f.focus(); }}>
                <ExamMathField
                  value={line.value}
                  onChange={(latex) => update(i, latex)}
                  onEnter={() => insertAfter(i, 'math')}
                  ariaLabel={t('practice.exam.lines.mathLine', { n: i + 1 })}
                  autoFocus={focusIndex === i}
                  className="w-full"
                />
              </div>
            ) : (
              <input
                type="text"
                dir="rtl"
                value={line.value}
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertAfter(i, 'text'); } }}
                placeholder={i === 0 ? placeholder : ''}
                aria-label={t('practice.exam.lines.textLine', { n: i + 1 })}
                autoFocus={focusIndex === i}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-right focus:outline-none"
                data-line-text
              />
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={t('practice.exam.lines.remove')}
              className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-300 opacity-0 transition-opacity hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 pt-1.5">
        <button type="button" onClick={() => insertAfter(lines.length - 1, 'math')} className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 text-xs font-bold text-[#1f5c4c] hover:bg-emerald-50" data-add-line="math">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /><Sigma className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.exam.lines.addMath')}
        </button>
        <button type="button" onClick={() => insertAfter(lines.length - 1, 'text')} className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 text-xs font-bold text-slate-600 hover:bg-slate-100" data-add-line="text">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /><Type className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.exam.lines.addText')}
        </button>
      </div>
    </div>
  );
}
