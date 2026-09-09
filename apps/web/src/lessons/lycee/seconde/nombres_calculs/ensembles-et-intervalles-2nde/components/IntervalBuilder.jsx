import React from 'react';
import { formatDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { interval, notation, inequality, roundTo } from './intervalUtils';

/**
 * IntervalBuilder — construire un intervalle : deux bornes (curseurs ou
 * puces −/+), deux crochets à retourner, et les bornes infinies.
 *
 * Activity: construire l'intervalle demandé (par sa notation, ou par une
 *   inégalité, ou par une description).
 * Mathematical objective: relier la bande sur la droite, les crochets, la
 *   notation et la double inégalité — quatre lectures d'un même ensemble.
 * Student action: glisser/pousser une borne ; toucher un crochet ; choisir
 *   « −∞ » ou « +∞ ».
 * Controlled variable: from, to, openFrom, openTo (le module les possède).
 * Mathematical state: l'intervalle normalisé (intervalUtils.interval).
 * Visual consequence: la bande et les crochets se redessinent ; les mirroirs
 *   (notation, inégalité) se réécrivent si `showNotation`/`showInequality`.
 * Expected observation: un crochet tourné vers le nombre l'inclut ; une
 *   borne infinie n'a jamais de crochet fermé.
 * Misconception targeted: « ]2 ; 5] contient 2 », « [3 ; +∞] ».
 * Feedback: immédiat par le dessin ; le module ajoute le verdict.
 * Scaffolding: `showNotation`/`showInequality` selon l'étape ; `allowInfinite`.
 *
 * Composant CONTRÔLÉ : `value` = { from, to, openFrom, openTo } (from/to
 * finis ou ±Infinity) appartient au module.
 */
export default function IntervalBuilder({
  value,
  onChange,
  min = -10, max = 10, step = 1, snap,
  variable = 'x',
  showNotation = true,
  showInequality = false,
  allowInfinite = false,
  disabled = false,
  ghost = null,          // intervalle cible à montrer en pointillé (révélation)
  ariaLabel = 'Constructeur d’intervalle',
}) {
  const I = interval(value.from, value.to, value.openFrom, value.openTo);
  const s = snap ?? step;
  const set = (patch) => {
    if (disabled) return;
    const next = { ...value, ...patch };
    onChange?.(interval(next.from, next.to, next.openFrom, next.openTo));
  };
  const finF = Number.isFinite(I.from);
  const finT = Number.isFinite(I.to);

  const handles = [];
  if (finF && !disabled) handles.push({ id: 'from', value: I.from, onChange: (v) => set({ from: Math.min(v, finT ? I.to : max) }), label: formatDec(I.from), tone: 'indigo', ariaLabel: 'Borne de gauche', max: finT ? I.to : max });
  if (finT && !disabled) handles.push({ id: 'to', value: I.to, onChange: (v) => set({ to: Math.max(v, finF ? I.from : min) }), label: formatDec(I.to), tone: 'indigo', ariaLabel: 'Borne de droite', min: finF ? I.from : min });

  const bump = (side, d) => {
    const cur = side === 'from' ? I.from : I.to;
    if (!Number.isFinite(cur)) return;
    // `Math.round(x / s) * s` REFABRIQUE un flottant : au pas 0,1, quatre
    // appuis depuis 1 donnent 1.4000000000000001, que `sameInterval` (comparaison
    // stricte) refuse — l'élève lisait « ta construction : ]1,4 ; 1,9[ » face à
    // « il fallait : ]1,4 ; 1,9[ », les deux identiques, la sienne déclarée fausse.
    // `roundTo` coupe la dérive ; le chemin par glissement y passait déjà.
    // ATTENTION : son second paramètre est un nombre de DÉCIMALES, pas un pas —
    // `roundTo(v, 0.1)` arrondirait à l'entier. On garde la valeur par défaut.
    const v = roundTo(Math.round((cur + d * s) / s) * s);
    if (side === 'from') set({ from: Math.max(min, Math.min(v, finT ? I.to : max)) });
    else set({ to: Math.min(max, Math.max(v, finF ? I.from : min)) });
  };

  const boundControl = (side) => {
    const cur = side === 'from' ? I.from : I.to;
    const open = side === 'from' ? I.openFrom : I.openTo;
    const fin = Number.isFinite(cur);
    const infLabel = side === 'from' ? '−∞' : '+∞';
    return (
      <div className="flex items-center gap-1.5 flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1.5">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase px-1">{side === 'from' ? 'gauche' : 'droite'}</span>
        {fin ? (
          <>
            <button type="button" disabled={disabled} onClick={() => bump(side, -1)} aria-label={`Diminuer la borne ${side === 'from' ? 'de gauche' : 'de droite'}`} className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-bold text-lg disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-blue-500">−</button>
            <span className="px-2 font-mono font-extrabold tabular-nums text-slate-800 min-w-[3.5rem] text-center">{formatDec(cur)}</span>
            <button type="button" disabled={disabled} onClick={() => bump(side, 1)} aria-label={`Augmenter la borne ${side === 'from' ? 'de gauche' : 'de droite'}`} className="w-10 h-10 rounded-lg bg-white border border-slate-300 font-bold text-lg disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-blue-500">+</button>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={!open}
              aria-label={`Borne ${side === 'from' ? 'de gauche' : 'de droite'} : ${open ? 'exclue' : 'incluse'}`}
              onClick={() => set(side === 'from' ? { openFrom: !open } : { openTo: !open })}
              className={`min-h-[40px] px-3 rounded-lg border-2 font-mono text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 ${open ? 'bg-white border-rose-300 text-rose-700' : 'bg-emerald-600 border-emerald-700 text-white'}`}
            >
              {open ? 'exclue' : 'incluse'}
            </button>
          </>
        ) : (
          <span className="px-2 font-mono font-extrabold text-slate-800">{infLabel} (jamais atteint)</span>
        )}
        {allowInfinite && (
          <button
            type="button"
            disabled={disabled}
            aria-pressed={!fin}
            aria-label={fin ? `Étendre vers ${infLabel}` : `Remettre une borne finie à ${side === 'from' ? 'gauche' : 'droite'}`}
            onClick={() => (fin
              ? set(side === 'from' ? { from: -Infinity } : { to: Infinity })
              : set(side === 'from' ? { from: min, openFrom: false } : { to: max, openTo: false }))}
            className={`min-h-[40px] px-3 rounded-lg border-2 font-mono text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-500 ${!fin ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
          >
            {infLabel}
          </button>
        )}
      </div>
    );
  };

  const intervals = [{ id: 'I', from: I.from, to: I.to, openFrom: I.openFrom, openTo: I.openTo, tone: 'indigo' }];
  if (ghost) intervals.push({ id: 'ghost', from: ghost.from, to: ghost.to, openFrom: ghost.openFrom, openTo: ghost.openTo, tone: 'emerald', label: notation(ghost) });

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine min={min} max={max} step={step} snap={s} intervals={intervals} handles={handles} disabled={disabled} ariaLabel="Droite graduée" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {boundControl('from')}
        {boundControl('to')}
      </div>
      {(showNotation || showInequality) && (
        <div className="flex flex-wrap gap-2 items-center">
          {showNotation && (
            <span className="px-3 py-2 rounded-xl bg-slate-900 text-white font-mono font-bold" aria-label={`Écriture : ${notation(I)}`}>{notation(I)}</span>
          )}
          {showInequality && (
            <span className="px-3 py-2 rounded-xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 font-mono font-bold" aria-label={`Inégalité : ${inequality(I, variable)}`}>{inequality(I, variable)}</span>
          )}
        </div>
      )}
    </div>
  );
}
