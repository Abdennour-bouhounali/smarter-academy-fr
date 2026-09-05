import React from 'react';
import { formatDec } from '@smarter-academy/core';
import Stepper from './Stepper';
import { packs, addPacks, euclidText } from './arithUtils';

/**
 * PackLab — deux tas de jetons rangés en paquets de p (manipulation
 * signature, module 1).
 *
 * Activity: régler deux nombres a et b et la taille de paquet p ; regarder
 *   les paquets pleins et les jetons SEULS (le reste) ; puis réunir les
 *   deux tas.
 * Mathematical objective: n est multiple de p ⇔ reste nul ; et la somme :
 *   les restes s'ajoutent, et forment un paquet de plus s'ils atteignent p.
 * Student action: steppers a, b, p.
 * Controlled variable: a, b, p.
 * Mathematical state: a, b, p (module) ; paquets, restes, verdicts DÉRIVÉS
 *   (divmod, addPacks).
 * Visual consequence: les paquets (carrés pleins) et les jetons seuls
 *   (ronds) se recomposent ; la ligne « réunion » montre le paquet formé par
 *   les restes, ou le reste qui subsiste.
 * Expected observation (aha) : deux tas sans reste → somme sans reste ;
 *   7 + 9 (deux restes de 1 pour p = 2) → un paquet de plus, reste 0 ; mais
 *   12 + 20 pour p = 7 laisse un reste 4.
 * Misconception targeted: « la somme de deux nombres impairs est impaire »,
 *   « si a n'est pas multiple de p, a + b ne peut pas l'être ».
 *
 * SÉCURITÉ D'AFFICHAGE : les paquets sont des tuiles DOM plafonnées
 * (MAX_TILES puis un badge « ×N ») ; aucun texte SVG ; les nombres ont leur
 * propre colonne.
 */
const MAX_TILES = 12;

function Tas({ label, n, p, tone }) {
  const { packs: q, singles: r } = packs(n, p);
  const shown = Math.min(q, MAX_TILES);
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="font-mono text-sm text-slate-500">{euclidText(n, p)}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5" aria-label={`${label} : ${q} paquets de ${p} et ${r} jetons seuls`}>
        {Array.from({ length: shown }, (_, i) => (
          <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-mono text-xs font-bold ${tone === 'indigo' ? 'bg-indigo-500' : 'bg-sky-500'}`} aria-hidden="true">{p}</span>
        ))}
        {q > MAX_TILES && <span className="px-2 py-1 rounded-lg bg-slate-800 text-white font-mono text-xs font-bold">×{q}</span>}
        {q === 0 && r === 0 && <span className="text-xs text-slate-400 italic">rien</span>}
        {Array.from({ length: Math.min(r, MAX_TILES) }, (_, i) => (
          <span key={`s${i}`} className="inline-block w-6 h-6 rounded-full bg-rose-400 border-2 border-rose-600" aria-hidden="true" />
        ))}
      </div>
      <div className="font-mono text-xs text-slate-600">{q} paquet{q > 1 ? 's' : ''} de {p} · <span className={r === 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>reste {r}</span> {r === 0 ? '→ multiple de ' + p : ''}</div>
    </div>
  );
}

export default function PackLab({ a, b, p, onA, onB, onP, showUnion = true, disabled = false, max = 40 }) {
  const s = addPacks(a, b, p);
  return (
    <div className="space-y-3" role="group" aria-label="Laboratoire des paquets">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Stepper label="tas A" value={a} onChange={onA} min={0} max={max} step={1} disabled={disabled} />
        <Stepper label="tas B" value={b} onChange={onB} min={0} max={max} step={1} tone="emerald" disabled={disabled} />
        <Stepper label="paquets de" value={p} onChange={onP} min={2} max={9} step={1} tone="amber" disabled={disabled} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Tas label={`Tas A = ${formatDec(a)}`} n={a} p={p} tone="indigo" />
        <Tas label={`Tas B = ${formatDec(b)}`} n={b} p={p} tone="sky" />
      </div>
      {showUnion && (
        <div className={`rounded-2xl border-2 p-3 space-y-1 ${s.isMultiple ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`} role="status" aria-live="polite">
          <div className="text-sm font-bold text-slate-700">On réunit les deux tas : {formatDec(a)} + {formatDec(b)} = {formatDec(s.total)}</div>
          <div className="font-mono text-sm text-slate-800">
            Restes : {s.singlesA} + {s.singlesB} = {s.singles}
            {s.extraPack > 0 ? ` → ${s.extraPack} paquet de ${p} de plus, ` : ' → '}
            reste final <strong className={s.remainder === 0 ? 'text-emerald-700' : 'text-rose-700'}>{s.remainder}</strong>
          </div>
          <div className="font-mono text-sm font-bold">{s.total} {s.isMultiple ? '' : 'n’'}est {s.isMultiple ? '' : 'pas '}un multiple de {p} ({s.totalPacks} paquet{s.totalPacks > 1 ? 's' : ''}{s.remainder ? ` et ${s.remainder} seul${s.remainder > 1 ? 's' : ''}` : ' pleins'}).</div>
        </div>
      )}
    </div>
  );
}
