import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatDec } from '@smarter-academy/core';
import CountBars from './CountBars';
import { BigDie, DIE_STYLE, btnPrimary, btnSecondary } from './DiceLab';
import { SUMS, totalOf, frequencies, formatPct } from './probaUtils';

/**
 * TwoDiceLab — deux dés, et la barre de chaque somme.
 *
 * Activity            lancer deux dés (×1, ×100, ×1 000) et regarder les onze
 *                     barres des sommes 2…12 se construire.
 * Mathematical objective  faire constater qu'une expérience à DEUX épreuves
 *                     n'a pas des résultats équiprobables : 7 domine, 2 et 12
 *                     sont rares — avant que la grille 6 × 6 l'explique.
 * Student action      « Lancer », « ×100 », « ×1 000 », série neuve.
 * Controlled variable le nombre de lancers.
 * Mathematical state  `counts` — onze effectifs (index = somme − 2) —
 *                     appartient au module ; le repère théorique k/36 n'est
 *                     dessiné que si `theory` est passé.
 * Visual consequence  les deux dés roulent, se posent ; la barre de la somme
 *                     grandit ; après 1 000 lancers, une « bosse » sur 7.
 * Expected observation « ce n'est pas plat comme avec un seul dé ».
 * Misconception targeted  « toutes les sommes ont la même chance ».
 *
 * SÉCURITÉ D'AFFICHAGE : CountBars (onze colonnes de 54 unités, étiquettes
 * d'au plus 5 caractères) ; lectures longues dans le DOM.
 */
export default function TwoDiceLab({
  counts,
  lastPair = null,
  rolling = false,
  theory = null,
  predictedSum = null,
  controls = {},          // { single, hundred, thousand, series }
  onThrow,
  onSeries,
  frozen = false,
  showFreq = false,
  caption,
}) {
  const reduce = useReducedMotion();
  const total = totalOf(counts);
  const freqs = frequencies(counts);
  const hasControls = !frozen && Object.values(controls).some(Boolean);
  const reading = `Effectifs par somme : ${SUMS.map((s) => `${s} → ${formatDec(counts[s - 2])}`).join(', ')} ; total ${formatDec(total)}`;

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
      role={frozen ? 'img' : 'group'} aria-label={frozen ? `Deux dés — ${reading}` : 'Laboratoire des deux dés'}>
      <style>{DIE_STYLE}</style>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <BigDie face={lastPair ? lastPair[0] : null} rolling={rolling} reduce={reduce} size={72} />
        <BigDie face={lastPair ? lastPair[1] : null} rolling={rolling} reduce={reduce} size={72} />
        <div className="flex-1 min-w-[140px]" aria-live={frozen ? 'off' : 'polite'}>
          <p className="text-2xl font-space font-bold text-slate-800 tabular-nums">
            {rolling && !reduce ? (
              <span className="text-slate-400">🎲🎲 …</span>
            ) : lastPair ? (
              <>{lastPair[0]} + {lastPair[1]} = <span className="text-emerald-700">{lastPair[0] + lastPair[1]}</span></>
            ) : (
              <span className="text-slate-400">Pas encore lancé</span>
            )}
          </p>
          <p className="text-sm font-mono text-slate-600">
            <strong className="text-slate-800">{formatDec(total)}</strong> lancer{total > 1 ? 's' : ''} de deux dés
          </p>
        </div>
      </div>

      {hasControls && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lancer les deux dés">
          {controls.single && (
            <button type="button" className={btnPrimary} disabled={rolling} onClick={() => onThrow?.(1)}
              aria-label="Lancer les deux dés" style={{ touchAction: 'manipulation' }}>🎲🎲 Lancer</button>
          )}
          {controls.hundred && (
            <button type="button" className={btnSecondary} disabled={rolling} onClick={() => onThrow?.(100)}
              aria-label="Lancer 100 fois les deux dés" style={{ touchAction: 'manipulation' }}>Lancer ×100</button>
          )}
          {controls.thousand && (
            <button type="button" className={btnSecondary} disabled={rolling} onClick={() => onThrow?.(1000)}
              aria-label="Lancer 1 000 fois les deux dés" style={{ touchAction: 'manipulation' }}>Lancer ×1 000</button>
          )}
          {controls.series && (
            <button type="button" className={btnPrimary} disabled={rolling} onClick={() => onSeries?.(controls.series)}
              aria-label={`Nouvelle série de ${formatDec(controls.series)} lancers de deux dés`} style={{ touchAction: 'manipulation' }}>
              ↻ Nouvelle série : {formatDec(controls.series)} lancers
            </button>
          )}
        </div>
      )}

      <CountBars
        counts={counts}
        labels={SUMS}
        theory={theory}
        highlight={(i) => predictedSum === i + 2}
        tone="#34d399"
        reading={reading}
      />

      {showFreq && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums">
            <caption className="sr-only">Fréquence de chaque somme</caption>
            <tbody>
              <tr>
                <th scope="row" className="text-left pr-2 text-slate-500 whitespace-nowrap">somme</th>
                {SUMS.map((s) => <td key={s} className="px-1 text-center font-bold text-slate-700">{s}</td>)}
              </tr>
              <tr>
                <th scope="row" className="text-left pr-2 text-slate-500 whitespace-nowrap">fréq.</th>
                {SUMS.map((s) => <td key={s} className="px-1 text-center text-emerald-700">{formatPct(freqs[s - 2], total, 0)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {theory && (
        <p className="text-xs text-amber-800 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-amber-600" />
          <span>probabilité du modèle : nombre de cases sur 36 (1/36 pour 2, 6/36 pour 7…)</span>
        </p>
      )}
    </div>
  );
}
