import React from 'react';
import { longDivision, expandDigits, reduce, isDecimalFraction } from './realsUtils';

/**
 * FractionExpander — la division posée, chiffre par chiffre, restes visibles.
 *
 * Activity: choisir une fraction, demander « Chiffre suivant » et suivre la
 *   trace des restes.
 * Mathematical objective: le RESTE décide de tout — un reste 0 arrête
 *   l'écriture (décimal) ; un reste déjà vu la fait boucler (période) ; et
 *   comme les restes sont < q, l'un des deux arrive forcément : toute
 *   fraction a une écriture finie ou périodique.
 * Student action: toucher une fraction, puis « Chiffre suivant » (× n).
 * Controlled variable: le nombre de chiffres demandés.
 * Mathematical state: { fractionId, shown } (module) ; tout est dérivé de
 *   longDivision / expandDigits.
 * Visual consequence: un chiffre et un reste de plus apparaissent ; le reste
 *   qui revient est encadré ; le reste 0 arrête la machine.
 * Misconception targeted: « 1/3 = 0,33 », « une fraction est toujours
 *   décimale ».
 */
const MAX = 10;

export default function FractionExpander({ fractions, current, shown, onChoose, onNext, disabled = false }) {
  const f = fractions.find((x) => x.id === current);
  const div = f ? longDivision(f.p, f.q, MAX) : null;
  const full = f ? expandDigits(f.p, f.q, MAX) : null;
  const stop = div ? (div.terminates ? div.digits.length : (div.periodStart + div.periodLength)) : 0;
  const n = Math.min(shown, MAX);
  // Le retour d'un reste est DÉTECTÉ à `stop` chiffres ; on laisse poser deux
  // chiffres de plus pour VOIR la boucle se rejouer avant de fermer la machine.
  const detected = f && (div.terminates ? n >= div.digits.length : n >= stop);
  const finished = f && (div.terminates ? n >= div.digits.length : n >= Math.min(MAX, stop + 2));
  const red = f ? reduce(f.p, f.q) : null;

  const remainderOf = (i) => {
    // reste après le i-ième chiffre (i ≥ 0 : reste initial)
    let r = f.p % f.q;
    for (let j = 0; j < i; j += 1) r = (r * 10) % f.q;
    return r;
  };
  const rems = f ? Array.from({ length: n + 1 }, (_, i) => remainderOf(i)) : [];
  const repeatIdx = (() => {
    const seen = new Map();
    for (let i = 0; i < rems.length; i += 1) {
      if (rems[i] !== 0 && seen.has(rems[i])) return { first: seen.get(rems[i]), again: i };
      seen.set(rems[i], i);
    }
    return null;
  })();

  return (
    <div className="space-y-3" role="group" aria-label="Division posée">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Fraction à développer">
        {fractions.map((x) => (
          <button
            key={x.id}
            type="button"
            disabled={disabled}
            aria-pressed={x.id === current}
            aria-label={`Développer ${x.label}`}
            onClick={() => onChoose?.(x.id)}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              x.id === current ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-800 hover:border-indigo-400'
            } disabled:opacity-60`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {f && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-3">
          <div className="flex items-baseline gap-2 flex-wrap font-mono">
            <span className="text-[11px] font-bold text-slate-500 uppercase">écriture</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {full.intPart},
              {full.digits.slice(0, n).map((d, i) => {
                const inPeriod = repeatIdx && i >= repeatIdx.first && i < repeatIdx.again;
                return (
                  <span key={i} className={`${inPeriod ? 'underline decoration-indigo-500 decoration-4 underline-offset-4' : ''} ${i === n - 1 ? 'text-indigo-600' : ''}`}>{d}</span>
                );
              })}
              {!detected && <span className="text-slate-300">{'_'.repeat(Math.max(1, 3 - n))}</span>}
              {detected && !div.terminates && <span className="text-slate-400">…</span>}
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max" aria-label="Trace des restes">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase mr-1">restes</span>
              {rems.map((r, i) => {
                const isRepeat = repeatIdx && (i === repeatIdx.first || i === repeatIdx.again);
                const isZero = r === 0 && i > 0;
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-slate-300">→</span>}
                    <span className={`min-w-[36px] text-center px-2 py-1 rounded-lg font-mono font-bold text-sm border ${
                      isZero ? 'bg-emerald-600 border-emerald-700 text-white' : isRepeat ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>{r}</span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={disabled || finished || n >= MAX}
              onClick={() => onNext?.(n + 1)}
              aria-label="Chiffre suivant"
              className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-mono text-sm font-bold disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Chiffre suivant
            </button>
            <span className="text-xs text-slate-500 font-mono">
              {n === 0 ? 'Un chiffre = on multiplie le reste par 10 et on divise.' : `${n} chiffre${n > 1 ? 's' : ''} posé${n > 1 ? 's' : ''}`}
            </span>
          </div>

          {detected && (
            <div className={`rounded-xl border px-3 py-2 text-sm ${div.terminates ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-indigo-300 bg-indigo-50 text-indigo-900'}`} role="status">
              {div.terminates ? (
                <>Le reste est <strong>0</strong> : l’écriture <strong>s’arrête</strong>. {f.label} est un nombre <strong>décimal</strong>. (Dénominateur réduit {red.q} = seulement des 2 et des 5.)</>
              ) : (
                <>Le reste <strong>{rems[repeatIdx.again]}</strong> est déjà revenu : la suite des chiffres va <strong>se répéter</strong> pour toujours, période <strong>{full.digits.slice(repeatIdx.first, repeatIdx.again).join('')}</strong>. {f.label} est rationnel mais <strong>pas décimal</strong>. (Dénominateur réduit {red.q}{isDecimalFraction(f.p, f.q) ? '' : ' : un facteur autre que 2 et 5'}.)</>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
