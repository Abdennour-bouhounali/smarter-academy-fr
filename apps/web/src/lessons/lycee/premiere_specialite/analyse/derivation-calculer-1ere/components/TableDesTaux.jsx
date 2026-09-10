import React from 'react';
import { CARTES, carte, tableTaux, fr } from './reglesUtils';

/**
 * TableDesTaux — le dos d'une carte se DÉCOUVRE, il ne se récite pas.
 *
 * Activity               l'élève choisit une carte et un point ; le banc
 *                        calcule la suite des taux pour des écarts de plus en
 *                        plus petits, et il LIT vers quoi ils se dirigent.
 * Mathematical objective la dérivée d'une fonction usuelle n'est pas une
 *                        formule tombée du ciel : c'est le nombre sur lequel
 *                        les taux se posent, et ce nombre suit une régularité.
 * Student action         choisir la carte, choisir le point.
 * Controlled variable    (carte, a).
 * Mathematical state     la table des taux ; la valeur exacte en est déduite
 *                        par la formule EXACTE, jamais par la table.
 * Visual consequence     une colonne de nombres qui se tasse.
 * Expected observation   « pour x³ en 2, ça se pose sur 12 — et 3 × 2² = 12 ».
 *
 * Tous les nombres en DOM. Aucun repère : la découverte est numérique.
 *
 * JAMAIS GELÉ : `disabled` ne porte que le verrou d'antériorité.
 */
const btn =
  'min-h-[44px] px-3 py-2 rounded-xl border-2 text-sm font-bold transition ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';
const choisi = 'border-violet-500 bg-violet-50 text-violet-900';
const libre = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300';

export default function TableDesTaux({
  carteId,
  a,
  onChangeCarte,
  onChangeA,
  points = [2, 3, 4],
  cartesDisponibles = CARTES.map((c) => c.id),
  revelerExact = false,
  disabled = false,
}) {
  const c = carte(carteId);
  const table = tableTaux(c, a);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir la carte à retourner">
        <span className="text-[13px] font-semibold text-slate-600">Carte</span>
        {cartesDisponibles.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChangeCarte?.(id)}
            disabled={disabled || !onChangeCarte}
            aria-pressed={id === carteId}
            className={`${btn} ${id === carteId ? choisi : libre} min-w-[64px] font-mono text-[17px]`}
          >
            {carte(id).label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le point">
        <span className="text-[13px] font-semibold text-slate-600">au point a =</span>
        {points.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChangeA?.(v)}
            disabled={disabled || !onChangeA}
            aria-pressed={v === a}
            className={`${btn} ${v === a ? choisi : libre} min-w-[52px] font-mono`}
          >
            {fr(v)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-violet-200 bg-white">
        <table className="w-full text-center text-sm">
          <caption className="sr-only">
            Taux de variation de {c.label} en a = {fr(a)} pour des écarts de plus en plus petits
          </caption>
          <thead className="bg-violet-50 text-violet-900">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">écart h</th>
              {table.lignes.map((l) => (
                <th key={l.h} scope="col" className="px-3 py-2 font-mono tabular-nums">{fr(l.h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-700">taux</th>
              {table.lignes.map((l) => (
                <td key={l.h} className="px-3 py-2 font-mono tabular-nums text-slate-900">{fr(l.taux)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div
        className={`rounded-xl border-2 p-3 text-center ${
          revelerExact ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
        }`}
        aria-live="polite"
      >
        <div className="text-[13px] text-slate-600">
          Les taux se posent sur… (f(x) = {c.label}, a = {fr(a)})
        </div>
        <div className="font-mono font-black text-[19px] tabular-nums text-slate-900">
          {revelerExact ? fr(table.exact) : '?'}
        </div>
        {revelerExact && (
          <div className="text-[13px] text-emerald-800 mt-1">
            et la formule du dos donne <strong className="font-mono">{c.derivee}</strong>, soit{' '}
            <strong className="font-mono">{fr(table.exact)}</strong> en {fr(a)}.
          </div>
        )}
      </div>
    </div>
  );
}
