import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * QuantityGroupLab — "fraction of a quantity" manipulation. A reserve of
 * discrete objects must be distributed into `groups` equal buckets (same
 * touch-to-give / reprendre-to-take-back interaction as EqualShareBoard, so
 * the two partage manipulations feel like one family). Once every bucket
 * holds the same count AND the reserve is empty, buckets become selectable:
 * tapping one toggles whether it is "taken" — the fraction (selected buckets
 * / total buckets) and its quantity (selected buckets × items per bucket)
 * both emerge from the manipulation, never from a formula shown first.
 *
 * @param {number} totalItems
 * @param {number} groups
 * @param {string} [itemContent]
 * @param {string} [itemLabel]
 * @param {boolean} [selectable] — allow taking buckets once partitioned equally
 * @param {boolean} [disabled]
 * @param {(state:{counts:number[], remaining:number, isEqual:boolean, isSolved:boolean, selected:number[], perGroup:number}) => void} [onStateChange]
 */
export default function QuantityGroupLab({
  totalItems,
  groups,
  itemContent = '🍕',
  itemLabel = 'part',
  itemLabelPlural,
  selectable = true,
  disabled = false,
  onStateChange,
}) {
  const [counts, setCounts] = useState(() => Array.from({ length: groups }, () => 0));
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setCounts(Array.from({ length: groups }, () => 0));
    setSelected([]);
  }, [groups, totalItems]);

  const plural = itemLabelPlural || `${itemLabel}s`;
  const given = counts.reduce((a, b) => a + b, 0);
  const remaining = totalItems - given;
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const isEqual = max === min;
  const isComplete = remaining === 0;
  const isSolved = isComplete && isEqual && max > 0;
  const perGroup = isSolved ? counts[0] : null;

  const report = (nextCounts, nextSelected) => {
    const g = nextCounts.reduce((a, b) => a + b, 0);
    const r = totalItems - g;
    const mx = Math.max(...nextCounts);
    const mn = Math.min(...nextCounts);
    const solved = r === 0 && mx === mn && mx > 0;
    onStateChange?.({
      counts: nextCounts,
      remaining: r,
      isEqual: mx === mn,
      isSolved: solved,
      selected: solved ? nextSelected : [],
      perGroup: solved ? nextCounts[0] : null,
    });
  };

  const give = (i) => {
    if (disabled || remaining <= 0) return;
    const next = counts.map((c, j) => (j === i ? c + 1 : c));
    setCounts(next);
    report(next, selected);
  };

  const takeBack = (i) => {
    if (disabled || counts[i] <= 0) return;
    const next = counts.map((c, j) => (j === i ? c - 1 : c));
    setCounts(next);
    setSelected([]);
    report(next, []);
  };

  const toggleSelect = (i) => {
    if (disabled || !isSolved || !selectable) return;
    const next = selected.includes(i) ? selected.filter((s) => s !== i) : [...selected, i];
    setSelected(next);
    report(counts, next);
  };

  const bucketLabel = (i) => `Groupe ${i + 1}`;

  const statusLine = isSolved
    ? selectable
      ? selected.length > 0
        ? `Groupes sélectionnés : ${selected.length} / ${groups} — soit ${selected.length * perGroup} ${plural} sur ${totalItems}.`
        : `${groups} groupes égaux de ${perGroup} ${plural} chacun. Touche un ou plusieurs groupes pour les sélectionner.`
      : `${groups} groupes égaux de ${perGroup} ${plural} chacun.`
    : isComplete
    ? `Regarde les groupes : ont-ils tous la même quantité ? Tu peux reprendre des ${plural} et corriger.`
    : `Il reste ${remaining} ${remaining > 1 ? plural : itemLabel} à répartir — touche un groupe pour lui donner un ${itemLabel}.`;

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3 min-h-[64px]"
        role="group"
        aria-label={`Réserve : ${remaining} ${plural} sur ${totalItems}`}
      >
        <div className="text-[11px] font-mono font-bold uppercase tracking-wide text-amber-700 mb-1.5">
          Réserve — {remaining} / {totalItems}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: remaining }, (_, i) => (
            <motion.span key={i} layout className="inline-flex items-center justify-center text-lg min-w-[1.5rem]" aria-hidden="true">
              {itemContent}
            </motion.span>
          ))}
          {remaining === 0 && <span className="text-xs text-amber-600 italic">réserve vide</span>}
        </div>
      </div>

      <div className={`grid gap-2 ${groups <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {counts.map((count, i) => {
          const isSel = selected.includes(i);
          return (
            <div key={i} className="space-y-1">
              <button
                type="button"
                onClick={() => (isSolved && selectable ? toggleSelect(i) : give(i))}
                disabled={disabled || (!isSolved && remaining <= 0)}
                aria-pressed={isSolved && selectable ? isSel : undefined}
                aria-label={
                  isSolved && selectable
                    ? `${bucketLabel(i)} — ${isSel ? 'sélectionné' : 'non sélectionné'} — ${count} ${plural}`
                    : `Donner 1 ${itemLabel} à ${bucketLabel(i)} (a ${count})`
                }
                className={`w-full min-h-[92px] rounded-2xl border-2 p-2.5 text-center transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${isSel
                    ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200'
                    : isSolved
                    ? 'border-slate-300 bg-white'
                    : !isEqual && count === min && isComplete
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-slate-200 bg-white'}
                  ${disabled || (!isSolved && remaining <= 0) ? 'cursor-default' : 'hover:border-blue-400 hover:shadow-sm active:scale-[0.98] cursor-pointer'}`}
              >
                <div className="font-space font-bold text-xs text-slate-700">{bucketLabel(i)}</div>
                <div className="flex flex-wrap justify-center gap-0.5 min-h-[1.5rem] mt-1" aria-hidden="true">
                  {Array.from({ length: count }, (_, k) => (
                    <span key={k} className="text-sm">{itemContent}</span>
                  ))}
                </div>
                <div className="font-mono text-[11px] font-bold text-slate-500 tabular-nums">{count}</div>
                {isSel && <div className="text-[10px] font-mono font-bold text-emerald-600 mt-0.5">✓ pris</div>}
              </button>
              {count > 0 && !disabled && !isSolved && (
                <button
                  type="button"
                  onClick={() => takeBack(i)}
                  aria-label={`Reprendre 1 ${itemLabel} à ${bucketLabel(i)}`}
                  className="w-full min-h-[36px] rounded-lg border border-slate-200 bg-white text-[11px] font-mono font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  ↩️ Reprendre
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p role="status" className={`text-xs leading-relaxed rounded-xl px-3 py-2 border
        ${isSolved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : isComplete ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
      >
        {statusLine}
      </p>

      {isSolved && counts.some((c) => c > 0) && (
        <button
          type="button"
          onClick={() => { setCounts(Array.from({ length: groups }, () => 0)); setSelected([]); report(Array.from({ length: groups }, () => 0), []); }}
          disabled={disabled}
          className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-700 underline decoration-dotted"
        >
          🧹 Recommencer les groupes
        </button>
      )}
    </div>
  );
}
