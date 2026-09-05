import React, { useState } from 'react';
import { formatDec, parseDec } from '@smarter-academy/core';
import RealLine from '../../../../../common/components/RealLine';
import { NumberField } from '../../../../../common/components/LessonUI';
import { contains, notation } from './intervalUtils';

/**
 * IntervalFilter — le filtre du manège (manipulation signature, module 1).
 *
 * Activity: tester des nombres contre une plage à deux bornes, chacune
 *   « incluse » ou « exclue ».
 * Mathematical objective: faire vivre « un intervalle contient TOUS les
 *   nombres entre ses bornes, et le crochet décide du sort de la borne ».
 * Student action: taper une taille (puce ou saisie libre) ; retourner un
 *   crochet ; déplacer une borne.
 * Controlled variable: le nombre testé ; puis les crochets ; puis les bornes.
 * Mathematical state: { lo, hi, openLo, openHi } et la liste `tests` —
 *   possédés par le module. Chaque verdict est DÉRIVÉ par `contains`.
 * Visual consequence: le nombre testé se pose sur la droite, plein et vert
 *   s'il passe, creux et rouge sinon ; un crochet retourné recolore tous
 *   les points de la borne d'un coup.
 * Expected observation: 1,899 passe, 1,90 non ; « à partir de » = borne
 *   incluse ; il y a toujours une taille entre deux tailles.
 * Misconception targeted: « la borne appartient toujours », « il n'y a que
 *   les tailles au centimètre ».
 * Feedback: le point lui-même, plus la liste des verdicts en clair (DOM).
 * Formalization: la notation [1,2 ; 1,9[ n'apparaît que si `showNotation`.
 * Scaffolding: `editable` ouvre progressivement crochets puis bornes.
 *
 * SÉCURITÉ D'AFFICHAGE : les verdicts sont dans le DOM ; les étiquettes de
 * points sont réparties par RealLine (rangées sans chevauchement).
 */
export default function IntervalFilter({
  value,               // { lo, hi, openLo, openHi }
  onChange,            // (next) => void
  tests = [],          // number[] déjà testés (ordre d'insertion)
  onTest,              // (n) => void
  chips = [],          // number[] valeurs proposées
  min, max, step, snap,
  unit = '',
  editable = { brackets: false, bounds: false },
  showNotation = false,
  disabled = false,
  labelPoints = true,
  ariaLabel = 'Filtre à nombres',
}) {
  const [raw, setRaw] = useState('');
  const I = { from: value.lo, to: value.hi, openFrom: value.openLo, openTo: value.openHi };
  const set = (patch) => !disabled && onChange?.({ ...value, ...patch });

  const submit = () => {
    const n = parseDec(raw);
    if (!Number.isFinite(n)) return;
    onTest?.(n);
    setRaw('');
  };

  const points = tests.map((t, i) => {
    const ok = contains(I, t);
    return {
      id: `t${i}-${t}`,
      value: Math.min(max, Math.max(min, t)),
      label: labelPoints ? formatDec(t) : undefined,
      tone: ok ? 'emerald' : 'rose',
      open: !ok,
    };
  });

  const handles = editable.bounds && !disabled
    ? [
        { id: 'lo', value: value.lo, onChange: (v) => set({ lo: Math.min(v, value.hi) }), label: formatDec(value.lo), tone: 'indigo', ariaLabel: 'Borne de gauche' },
        { id: 'hi', value: value.hi, onChange: (v) => set({ hi: Math.max(v, value.lo) }), label: formatDec(value.hi), tone: 'indigo', ariaLabel: 'Borne de droite' },
      ]
    : [];

  const toggle = (side) => (
    <button
      type="button"
      disabled={disabled || !editable.brackets}
      aria-pressed={side === 'lo' ? !value.openLo : !value.openHi}
      aria-label={`Borne ${side === 'lo' ? 'de gauche' : 'de droite'} ${formatDec(side === 'lo' ? value.lo : value.hi)} : ${(side === 'lo' ? value.openLo : value.openHi) ? 'exclue' : 'incluse'}`}
      onClick={() => set(side === 'lo' ? { openLo: !value.openLo } : { openHi: !value.openHi })}
      className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default ${
        (side === 'lo' ? value.openLo : value.openHi)
          ? 'bg-white border-rose-300 text-rose-700'
          : 'bg-emerald-600 border-emerald-700 text-white'
      }`}
    >
      {formatDec(side === 'lo' ? value.lo : value.hi)}{unit && ` ${unit}`} : {(side === 'lo' ? value.openLo : value.openHi) ? 'exclu' : 'inclus'}
    </button>
  );

  return (
    <div className="space-y-3" role="group" aria-label={ariaLabel}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <RealLine
          min={min} max={max} step={step} snap={snap ?? step}
          intervals={[{ id: 'I', from: value.lo, to: value.hi, openFrom: value.openLo, openTo: value.openHi, tone: 'indigo' }]}
          points={points}
          handles={handles}
          disabled={disabled}
          ariaLabel="Droite des tailles"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-500 uppercase">Bornes</span>
        {toggle('lo')}
        {toggle('hi')}
        {showNotation && (
          <span className="ml-auto px-3 py-2 rounded-xl bg-slate-900 text-white font-mono font-bold text-base" aria-label={`Écriture : ${notation(I)}`}>
            {notation(I)}
          </span>
        )}
      </div>

      {onTest && !disabled && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Valeurs à tester">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onTest(c)}
                aria-label={`Tester ${formatDec(c)}${unit ? ` ${unit}` : ''}`}
                className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white font-mono text-sm font-bold text-slate-700 hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {formatDec(c)}{unit && ` ${unit}`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <NumberField value={raw} onChange={setRaw} onEnter={submit} ariaLabel="Une valeur à tester" width="w-32" size="sm" placeholder="1,85" />
            {unit && <span className="text-sm font-mono text-slate-500">{unit}</span>}
            <button
              type="button"
              onClick={submit}
              disabled={!Number.isFinite(parseDec(raw))}
              className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Tester
            </button>
          </div>
        </div>
      )}

      {tests.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Verdicts">
          {tests.map((t, i) => {
            const ok = contains(I, t);
            return (
              <li
                key={`${i}-${t}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${ok ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}
              >
                {formatDec(t)}{unit && ` ${unit}`} : {ok ? 'passe ✓' : 'refusé ✗'}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
