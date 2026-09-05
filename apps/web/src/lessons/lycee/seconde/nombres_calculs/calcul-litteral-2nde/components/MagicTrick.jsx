import React, { useState } from 'react';
import { formatDec, parseDec } from '@smarter-academy/core';
import { NumberField } from '../../../../../common/components/LessonUI';
import { numericChain, symbolicChain, stepLabel, formatPoly } from './litteralUtils';

/**
 * MagicTrick — le programme de calcul (manipulation signature, module 1).
 *
 * Activity: entrer n'importe quel nombre dans une chaîne d'opérations et
 *   lire chaque étape ; puis suivre la même chaîne « avec x ».
 * Mathematical objective: la lettre suit TOUS les nombres à la fois : la
 *   chaîne symbolique explique pourquoi le résultat ne dépend pas du nombre
 *   (ou en dépend d'une façon prévisible).
 * Student action: puce ou saisie libre ; bascule « suivre avec x ».
 * Controlled variable: le nombre de départ.
 * Mathematical state: `trials` (module) ; chaînes dérivées (numericChain,
 *   symbolicChain).
 * Visual consequence: les cartes de la chaîne se remplissent ; sous chaque
 *   carte, l'expression en x si `showX`.
 * Expected observation: ×3, +9, ÷3, − x rend TOUJOURS 3 ; la chaîne en x
 *   montre 3x → 3x + 9 → x + 3 → 3.
 * Misconception targeted: « dix essais qui marchent, c'est une preuve ».
 *
 * SÉCURITÉ D'AFFICHAGE : cartes DOM en grille responsive ; la plus longue
 * expression (« x² + 2x + 1 ») tient dans sa carte ; les valeurs numériques
 * longues (−1 000 000) passent en fonte réduite via tabular-nums et wrap.
 */
export default function MagicTrick({ steps, trials, onTry, chips = [], showX = false, onToggleX, disabled = false, maxTrials = 8 }) {
  const [raw, setRaw] = useState('');
  const last = trials.length ? trials[trials.length - 1] : null;
  const nums = last !== null ? numericChain(steps, last) : null;
  const syms = symbolicChain(steps);
  const submit = () => { const n = parseDec(raw); if (Number.isFinite(n)) { onTry(n); setRaw(''); } };
  // L'OPÉRATION est le titre de la carte, en grand — pas un numéro d'étape :
  // « × 3 », « + 9 », « ÷ 3 », « − le nombre de départ ».
  const cards = [{ label: 'nombre de départ', op: false }, ...steps.map((s) => ({ label: stepLabel(s), op: true }))];

  return (
    <div className="space-y-3" role="group" aria-label="Programme de calcul">
      <div className="flex flex-wrap gap-1.5 items-center">
        {chips.map((c) => (
          <button key={c} type="button" disabled={disabled || trials.length >= maxTrials} onClick={() => onTry(c)} aria-label={`Essayer ${formatDec(c)}`} className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white font-mono font-bold text-slate-800 hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">{formatDec(c)}</button>
        ))}
        <NumberField value={raw} onChange={setRaw} onEnter={submit} ariaLabel="Ton nombre de départ" width="w-28" size="sm" placeholder="−2,5" />
        <button type="button" disabled={disabled || trials.length >= maxTrials || !Number.isFinite(parseDec(raw))} onClick={submit} className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-xs font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Essayer</button>
        {onToggleX && (
          <button type="button" disabled={disabled} aria-pressed={showX} onClick={() => onToggleX(!showX)} className={`min-h-[44px] px-4 rounded-xl border-2 font-mono text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${showX ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-emerald-400 text-emerald-800'}`}>
            {showX ? '𝑥 suivi' : 'Suivre avec 𝑥'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-2xl border-2 p-2.5 min-h-[104px] flex flex-col ${i === cards.length - 1 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
            <div className={`font-mono leading-tight ${c.op ? 'text-xl font-extrabold text-indigo-700' : 'text-[11px] font-bold uppercase text-slate-500'}`}>{c.label}</div>
            <div className="mt-auto font-mono font-extrabold text-lg text-slate-800 tabular-nums break-words" aria-live={i === cards.length - 1 ? 'polite' : undefined}>
              {nums ? formatDec(nums[i], { maxDecimals: 4 }) : '…'}
            </div>
            {showX && <div className="font-mono text-sm font-bold text-emerald-800 break-words">{formatPoly(syms[i])}</div>}
          </div>
        ))}
      </div>

      {trials.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Essais">
          {trials.map((t, i) => <li key={`${i}-${t}`} className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border bg-white border-slate-200 text-slate-700">{formatDec(t)} → {formatDec(numericChain(steps, t).pop(), { maxDecimals: 4 })}</li>)}
        </ul>
      )}
    </div>
  );
}
