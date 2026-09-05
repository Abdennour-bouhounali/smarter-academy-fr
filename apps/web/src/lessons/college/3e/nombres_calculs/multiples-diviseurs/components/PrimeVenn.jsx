import React from 'react';
import {
  factorization, mergeMin, mergeMax, productOf, formatFactors, formatClock,
} from './divisibilityUtils';

/**
 * PrimeVenn — deux décompositions face à face, et les facteurs qu'on met en
 * commun (INTERACTION_PEDAGOGY §24).
 *
 * Activity: taper les facteurs premiers présents dans LES DEUX
 *   décompositions (mode 'common'), ou lire les facteurs réunis (mode
 *   'union').
 * Mathematical objective: rendre visible que les facteurs COMMUNS donnent le
 *   plus grand diviseur commun (le plus grand carreau, la simplification
 *   maximale) et que les facteurs RÉUNIS donnent le plus petit multiple
 *   commun (le prochain rendez-vous des deux bus).
 * Student action: taper une puce dans la rangée du milieu.
 * Controlled variable: l'ensemble `selected` des premiers mis en commun.
 * Mathematical state: factorization(a), factorization(b), selected ; la
 *   lecture (fraction, côté de carreau, minutes) est DÉRIVÉE de
 *   mergeMin/mergeMax — jamais écrite en dur.
 * Visual consequence: la puce tapée s'allume dans les deux colonnes à la
 *   fois, et la lecture du bas change immédiatement.
 * Misconception targeted: #5 (« un multiple commun de 6 et 8, c'est 14 ou
 *   forcément 48 ») et la simplification partielle (42/63 au lieu de 2/3).
 * Feedback: la lecture montre l'état courant, pas un verdict.
 *
 * Composant CONTRÔLÉ : `selected` appartient au module.
 * Nœuds interactifs : ≤ 10 puces.
 */

const chipBase =
  'min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono text-sm font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500';

function Column({ label, value, fz, lit }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2 flex-1 min-w-[130px]">
      <p className="text-xs font-mono text-slate-500">
        {label} · <strong className="text-slate-800">{value}</strong>
      </p>
      <div className="flex gap-1 flex-wrap">
        {fz.flatMap(({ p, e }) =>
          Array.from({ length: e }).map((_, i) => (
            <span
              key={`${p}-${i}`}
              className={`px-2 py-1 rounded-lg border-2 font-mono text-xs font-bold ${
                lit.has(`${p}-${i}`)
                  ? 'bg-rose-500 border-rose-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {p}
            </span>
          )),
        )}
      </div>
      <p className="text-[11px] font-mono text-slate-400">{value} = {formatFactors(fz)}</p>
    </div>
  );
}

export default function PrimeVenn({
  a,
  b,
  selected = new Set(),
  onToggle,
  mode = 'common',
  readout = 'fraction',
  disabled = false,
  labelA = 'Nombre A',
  labelB = 'Nombre B',
}) {
  const fa = factorization(a);
  const fb = factorization(b);
  const common = mergeMin(fa, fb);
  const union = mergeMax(fa, fb);

  // Les puces proposées : un jeton par facteur commun (avec sa multiplicité).
  const chips = common.flatMap(({ p, e }) => Array.from({ length: e }, (_, i) => ({ p, i, key: `${p}-${i}` })));
  const chosen = chips.filter((c) => selected.has(c.key));

  // Ce qui est effectivement mis en commun, sous forme de factorisation.
  const chosenFz = [];
  chosen.forEach(({ p }) => {
    const last = chosenFz.find((f) => f.p === p);
    if (last) last.e += 1;
    else chosenFz.push({ p, e: 1 });
  });
  chosenFz.sort((x, y) => x.p - y.p);
  const chosenProduct = productOf(chosenFz);

  const lit = new Set(chosen.map((c) => c.key));

  const allCommon = chosen.length === chips.length && chips.length > 0;

  return (
    <div className="space-y-3" role="group" aria-label={`Facteurs premiers de ${a} et de ${b}`}>
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <Column label={labelA} value={a} fz={fa} lit={lit} />
        <Column label={labelB} value={b} fz={fb} lit={lit} />
      </div>

      {mode === 'common' && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-slate-500">
            Touche les facteurs présents <strong>dans les deux</strong> :
          </p>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Facteurs communs">
            {chips.map((c) => {
              const on = selected.has(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggle?.(c.key)}
                  aria-pressed={on}
                  aria-label={`Facteur commun ${c.p}${on ? ', sélectionné' : ''}`}
                  className={`${chipBase} ${
                    on
                      ? 'bg-rose-500 border-rose-600 text-white'
                      : 'bg-white border-rose-300 text-rose-700 hover:border-rose-600'
                  }`}
                >
                  {c.p}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── La lecture, dérivée de l'état ───────────────────────── */}
      <div
        className={`rounded-2xl border-2 px-4 py-3 text-center space-y-1 ${
          mode === 'union' || allCommon ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {readout === 'fraction' && (
          <>
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
              La fraction, divisée par ce que tu as mis en commun
            </p>
            <p className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums">
              {a / chosenProduct} / {b / chosenProduct}
            </p>
            <p className="text-xs text-slate-500">
              {chosen.length === 0
                ? `${a} / ${b} — aucun facteur mis en commun pour l’instant`
                : `divisée par ${formatFactors(chosenFz)} = ${chosenProduct}`}
              {allCommon && ' — plus aucun facteur commun : elle est irréductible'}
            </p>
          </>
        )}

        {readout === 'square' && (
          <>
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
              Côté du carreau, en cm
            </p>
            <p className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums">
              {chosenProduct}
            </p>
            <p className="text-xs text-slate-500">
              {a} ÷ {chosenProduct} = {a / chosenProduct} carreaux · {b} ÷ {chosenProduct} ={' '}
              {b / chosenProduct} carreaux
              {allCommon && ' — le plus grand carreau possible'}
            </p>
          </>
        )}

        {readout === 'minutes' && (
          <>
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
              Tous les facteurs réunis
            </p>
            <p className="font-mono text-2xl font-extrabold text-slate-800 tabular-nums">
              {formatFactors(union)} = {productOf(union)} min
            </p>
            <p className="text-xs text-slate-500">
              soit un départ commun à {formatClock(7 * 60 + productOf(union))}, puis toutes les{' '}
              {productOf(union)} minutes
            </p>
          </>
        )}
      </div>
    </div>
  );
}
