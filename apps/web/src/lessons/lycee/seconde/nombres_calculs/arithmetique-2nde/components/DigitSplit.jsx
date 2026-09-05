import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { nineSplit, digitSum, divisibleBy, hundredSplit } from './arithUtils';

/**
 * DigitSplit — le découpage qui DÉMONTRE les critères.
 *
 * Activity: choisir un nombre ; le voir se découper en « partie multiple de
 *   9 » (999a + 99b + 9c) et « somme des chiffres » ; ou, pour 4, en
 *   « centaines » + « deux derniers chiffres ».
 * Mathematical objective: n = (multiple de 9) + (somme des chiffres) — donc
 *   n est multiple de 9 (ou 3) exactement quand la somme des chiffres l'est.
 * Student action: toucher un nombre proposé.
 * Controlled variable: le nombre.
 * Mathematical state: n (module) ; découpage et verdicts DÉRIVÉS.
 * Visual consequence: chaque chiffre déploie sa ligne « d × (10^k − 1) »,
 *   la colonne des 9 s'additionne, la somme des chiffres reste à part.
 * Misconception targeted: « divisible par 3 ⇔ dernier chiffre 3, 6 ou 9 ».
 */
export default function DigitSplit({ n, numbers, onPick, mode = 'nine', disabled = false }) {
  const s = nineSplit(n);
  const h = hundredSplit(n);
  const by = (d) => divisibleBy(n, d);
  return (
    <div className="space-y-3" role="group" aria-label="Découpage du nombre">
      {numbers && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Nombre à découper">
          {numbers.map((v) => (
            <button key={v} type="button" disabled={disabled} aria-pressed={v === n} aria-label={`Découper ${v}`} onClick={() => onPick(v)}
              className={`min-h-[44px] px-3 rounded-xl border-2 font-mono font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${v === n ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'} disabled:opacity-60`}>
              {formatDec(v)}
            </button>
          ))}
        </div>
      )}
      {mode === 'nine' ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2 overflow-x-auto">
          <table className="w-full text-sm font-mono min-w-[320px]">
            <thead><tr className="text-slate-500 text-[11px] uppercase"><th className="text-left py-1">chiffre</th><th className="text-right">vaut</th><th className="text-right">multiple de 9</th><th className="text-right">reste</th></tr></thead>
            <tbody>
              {s.parts.map((p, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1 font-bold text-slate-800">{p.digit}</td>
                  <td className="text-right text-slate-700">{formatDec(p.digit * p.place)}</td>
                  <td className="text-right text-indigo-700">{p.nines ? `${p.digit} × ${formatDec(p.nines)} = ${formatDec(p.digit * p.nines)}` : '—'}</td>
                  <td className="text-right font-bold text-emerald-700">{p.digit}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-bold">
                <td className="py-1">total</td><td className="text-right">{formatDec(n)}</td>
                <td className="text-right text-indigo-700">{formatDec(s.ninePart)} = 9 × {formatDec(s.nineTimes)}</td>
                <td className="text-right text-emerald-700">{s.digitSum}</td>
              </tr>
            </tbody>
          </table>
          <p className="font-mono text-sm text-slate-800" role="status">
            {formatDec(n)} = <span className="text-indigo-700 font-bold">9 × {formatDec(s.nineTimes)}</span> + <span className="text-emerald-700 font-bold">{s.digitSum}</span> — la première part est multiple de 9 (et de 3) quoi qu’il arrive : tout se joue sur <strong>{s.digitSum}</strong>.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[3, 9].map((d) => (
              <span key={d} className={`px-2.5 py-1 rounded-lg border font-bold ${by(d).ok ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>
                ÷ {d} : {by(d).ok ? 'oui' : 'non'} ({by(d).reason})
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
          <p className="font-mono text-sm text-slate-800">
            {formatDec(n)} = <span className="text-indigo-700 font-bold">100 × {formatDec(h.hundreds)}</span> + <span className="text-emerald-700 font-bold">{String(h.last).padStart(2, '0')}</span>
          </p>
          <p className="text-sm text-slate-600">100 est multiple de 4 : la première part l’est toujours. Tout se joue sur les <strong>deux derniers chiffres</strong>.</p>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[2, 4, 5, 10].map((d) => (
              <span key={d} className={`px-2.5 py-1 rounded-lg border font-bold ${by(d).ok ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'}`}>÷ {d} : {by(d).ok ? 'oui' : 'non'} ({by(d).reason})</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
