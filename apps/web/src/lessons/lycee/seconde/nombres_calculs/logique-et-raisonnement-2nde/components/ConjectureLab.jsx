import React, { useState } from 'react';
import { formatDec, parseDec } from '@smarter-academy/core';
import { NumberField } from '../../../../../common/components/LessonUI';
import { euler, isPrime, smallestFactorization } from './logicUtils';

/**
 * ConjectureLab — la formule qui tombe (manipulation signature, module 1).
 *
 * Activity: tester n² + n + 41 pour n = 0, 1, 2… (puce « suivant », saut à
 *   une valeur, ou saisie libre) et voir chaque résultat déclaré premier —
 *   jusqu'à n = 40, où la factorisation apparaît.
 * Mathematical objective: une affirmation universelle (« pour tout n… »)
 *   n'est jamais prouvée par des exemples, et un SEUL contre-exemple la
 *   réfute définitivement.
 * Student action: toucher « n suivant », un saut, ou taper un n.
 * Controlled variable: n.
 * Mathematical state: `tested` (liste des n essayés) — le module la possède ;
 *   la primalité et la factorisation sont DÉRIVÉES (isPrime,
 *   smallestFactorization), jamais écrites à la main.
 * Visual consequence: une ligne s'ajoute, verte « premier » ou rouge avec
 *   « = 41 × 41 » ; le compteur d'essais consécutifs monte.
 * Expected observation (aha) : 40 essais d'affilée réussissent, et le
 *   41e échoue — la conviction ne vaut pas preuve.
 * Misconception targeted: « ça marche pour beaucoup de valeurs, donc c'est
 *   vrai », « une formule qui marche jusqu'à 40 ne peut pas tomber ».
 *
 * SÉCURITÉ D'AFFICHAGE : les lignes sont une liste DOM (grille à colonnes
 * fixes), la plus longue valeur (1 763) et la plus longue factorisation
 * (41 × 43) tiennent dans leur colonne ; rien en SVG.
 */
export default function ConjectureLab({ tested, onTest, jumps = [], disabled = false, maxRows = 44 }) {
  const [raw, setRaw] = useState('');
  const nextN = tested.length ? Math.max(...tested) + 1 : 0;
  const submit = () => { const v = parseDec(raw); if (Number.isInteger(v) && v >= 0 && v <= 100) { onTest(v); setRaw(''); } };
  const rows = tested.map((n) => { const v = euler(n); const f = smallestFactorization(v); return { n, v, prime: isPrime(v), f }; });
  const streak = (() => { let c = 0; for (const r of rows.slice().sort((a, b) => a.n - b.n)) { if (r.prime) c += 1; else break; } return c; })();
  const fallen = rows.find((r) => !r.prime);

  return (
    <div className="space-y-3" role="group" aria-label="Laboratoire de conjecture">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={disabled || tested.length >= maxRows || nextN > 100} onClick={() => onTest(nextN)} aria-label={`Tester n égale ${nextN}`}
          className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-sm font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          Tester n = {nextN}
        </button>
        {jumps.map((j) => (
          <button key={j} type="button" disabled={disabled || tested.includes(j)} onClick={() => onTest(j)} aria-label={`Sauter à n égale ${j}`}
            className="min-h-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white font-mono text-sm font-bold text-slate-700 hover:border-indigo-400 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            n = {j}
          </button>
        ))}
        <NumberField value={raw} onChange={setRaw} onEnter={submit} ariaLabel="Un n à tester" width="w-24" size="sm" placeholder="40" />
        <button type="button" disabled={disabled || !Number.isInteger(parseDec(raw))} onClick={submit} className="min-h-[44px] px-4 rounded-xl border-2 border-indigo-400 bg-white text-indigo-800 font-mono text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Tester</button>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm font-mono min-w-[300px]">
          <caption className="sr-only">Valeurs de n² + n + 41 testées</caption>
          <thead><tr className="bg-slate-50 text-slate-500 text-[11px] uppercase"><th className="text-left px-3 py-1.5">n</th><th className="text-right px-3">n² + n + 41</th><th className="text-right px-3">premier ?</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={3} className="px-3 py-3 text-center text-xs text-slate-400 italic">Touche « Tester n = 0 » pour commencer.</td></tr>}
            {rows.map((r) => (
              <tr key={r.n} className={`border-t border-slate-100 ${r.prime ? '' : 'bg-rose-50'}`}>
                <td className="px-3 py-1.5 font-bold text-slate-800">{r.n}</td>
                <td className="px-3 text-right tabular-nums text-slate-800">{formatDec(r.v)}</td>
                <td className={`px-3 text-right font-bold ${r.prime ? 'text-emerald-700' : 'text-rose-700'}`}>{r.prime ? 'premier ✓' : `= ${r.f.a} × ${r.f.b} ✗`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl border-2 px-3 py-2 font-mono text-sm ${fallen ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`} role="status" aria-live="polite">
        {fallen
          ? <>La formule est <strong>tombée</strong> en n = {fallen.n} : {formatDec(fallen.v)} = {fallen.f.a} × {fallen.f.b}. Un seul contre-exemple suffit.</>
          : <>{streak} valeur{streak > 1 ? 's' : ''} d’affilée : toujours premier. Est-ce une preuve ?</>}
      </div>
    </div>
  );
}
