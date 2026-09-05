import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import { evaluateRow } from './valueTableUtils';

/**
 * ValueTable — le « testeur de valeurs » partagé (3e nombres & calculs).
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : rendre visible qu'une égalité entre écritures se teste pour
 *    PLUSIEURS valeurs, et qu'une seule valeur commune ne prouve rien ;
 *  - action de l'élève : taper une puce « x = … » ;
 *  - variable contrôlée : la valeur de x ;
 *  - conséquence visuelle : une ligne apparaît, chaque colonne est calculée,
 *    la ligne est verte si toutes les colonnes coïncident, rose sinon ;
 *  - settle-then-number (playbook §10.11) : les nombres s'affichent après un
 *    court délai, jamais en mouvement réduit.
 *
 * Composant CONTRÔLÉ : `tested` (Set des x déjà testés) et `onTest(x)` sont
 * possédés par le module. Aucune logique de progression ici.
 *
 * @param {{id, label: ReactNode, fn: (x)=>number}[]} columns
 * @param {number[]} xs          puces proposées
 * @param {Set<number>} tested   x déjà testés (ordre = ordre d'insertion)
 * @param {(x:number)=>void} onTest
 * @param {string} [variable='x']
 * @param {boolean} [compare=true]  colorer les lignes selon l'accord des colonnes
 * @param {string} [unit]           suffixe d'unité sur les valeurs
 * @param {(n:number)=>string} [format=formatDec]
 * @param {number} [settleMs=350]
 * @param {boolean} [disabled]
 * @param {ReactNode} [caption]
 */
export default function ValueTable({
  columns,
  xs,
  tested,
  onTest,
  variable = 'x',
  compare = true,
  unit = '',
  format = formatDec,
  settleMs = 350,
  disabled = false,
  caption,
  ariaLabel = 'Tableau de valeurs',
}) {
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(() => new Set(tested));
  const timers = useRef([]);

  useEffect(() => {
    const pending = [...tested].filter((x) => !settled.has(x));
    if (pending.length === 0) return undefined;
    if (reduced || settleMs === 0) {
      setSettled((s) => new Set([...s, ...pending]));
      return undefined;
    }
    const t = setTimeout(() => setSettled((s) => new Set([...s, ...pending])), settleMs);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [tested, settled, reduced, settleMs]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const rows = [...tested].map((x) => evaluateRow(columns, x));

  return (
    <div className="space-y-2" role="group" aria-label={ariaLabel}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Valeurs de ${variable} à tester`}>
        {xs.map((x) => {
          const done = tested.has(x);
          return (
            <button
              key={x}
              type="button"
              disabled={disabled || done}
              onClick={() => onTest(x)}
              aria-pressed={done}
              aria-label={`Tester ${variable} = ${format(x)}`}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                done
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-blue-500 disabled:opacity-40'
              }`}
            >
              {variable} = {format(x)}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm font-mono tabular-nums">
          {caption && <caption className="text-xs text-slate-500 py-1.5">{caption}</caption>}
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th scope="col" className="px-3 py-2 text-left font-bold">{variable}</th>
              {columns.map((c) => (
                <th key={c.id} scope="col" className="px-3 py-2 text-center font-bold">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-3 text-center text-xs text-slate-400 italic">
                  Touche une valeur de {variable} pour remplir une ligne.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const isSettled = settled.has(r.x);
              const tone = !compare || !isSettled
                ? ''
                : r.allEqual
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-rose-50 text-rose-800';
              return (
                <tr key={r.x} className={`border-t border-slate-100 ${tone}`}>
                  <th scope="row" className="px-3 py-2 text-left font-bold">{format(r.x)}</th>
                  {r.values.map((v, i) => (
                    <td key={columns[i].id} className="px-3 py-2 text-center">
                      {isSettled ? `${format(v)}${unit ? ` ${unit}` : ''}` : '…'}
                    </td>
                  ))}
                  {compare && (
                    <td className="sr-only">{isSettled ? (r.allEqual ? 'toutes égales' : 'différentes') : ''}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
