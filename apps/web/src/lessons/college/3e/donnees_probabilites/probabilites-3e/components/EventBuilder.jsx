import React from 'react';
import { formatDec } from '@smarter-academy/core';
import MathText from '../../../../../common/components/MathText';
import CountBars from './CountBars';
import { DieIcon, faceIcon } from './DiceLab';
import { FACES, totalOf, eventCount, eventFrequency, formatPct, fracLatex } from './probaUtils';

/**
 * EventBuilder — composer un événement en touchant les faces qui le réalisent.
 *
 * Activity            touche les faces qui réalisent « obtenir un nombre pair »,
 *                     « obtenir plus de 4 », « obtenir 7 »…
 * Mathematical objective  faire construire l'idée qu'un ÉVÉNEMENT est un
 *                     ENSEMBLE D'ISSUES, et que sa chance se lit sur le nombre
 *                     de faces favorables — puis sur les barres d'une série.
 * Student action      toucher une face pour l'ajouter / la retirer.
 * Controlled variable l'ensemble des faces retenues.
 * Mathematical state  `selected` (Set de faces) appartient au module ; le
 *                     nombre de faces favorables, la fraction, l'effectif et la
 *                     fréquence de l'événement sur la série `counts` sont
 *                     DÉRIVÉS ici (eventCount / eventFrequency).
 * Visual consequence  les barres des faces retenues passent en indigo ; la
 *                     lecture « k faces sur 6 » et, si demandé, « x fois sur
 *                     1 000 → y % » se mettent à jour à chaque touche.
 * Expected observation « plus je retiens de faces, plus la part grandit ;
 *                     aucune face → 0 ; six faces → tout ».
 * Misconception targeted  confondre issue et événement ; croire qu'un
 *                     événement est UNE face.
 * Feedback            la lecture dérivée ; le module quantifie l'écart avec
 *                     l'événement visé.
 * Formalization       la fraction k/6 n'apparaît que si `showFraction`.
 * Scaffolding         événement dicté → fréquence révélée → événements
 *                     impossible / certain → sans manipulation.
 *
 * SÉCURITÉ D'AFFICHAGE : les faces sont des boutons DOM ≥ 48 px ; le graphique
 * est CountBars (échelle calculée) ; les lectures vivent dans le DOM.
 */
export default function EventBuilder({
  selected,            // Set<number>
  onToggle,            // (face) => void
  counts = null,       // série figée pour lire la fréquence de l'événement
  showFraction = false,
  showFrequency = false,
  label = 'Retenir la face',
  disabled = false,
  caption,
}) {
  const k = selected.size;
  const total = counts ? totalOf(counts) : 0;
  const c = counts ? eventCount(counts, selected) : 0;
  const f = counts ? eventFrequency(counts, selected) : 0;

  return (
    <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3"
      role="group" aria-label={`Composer un événement — ${k} face${k > 1 ? 's' : ''} retenue${k > 1 ? 's' : ''} sur 6`}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}

      <div className="flex flex-wrap gap-1.5 justify-center" role="group" aria-label={label}>
        {FACES.map((face) => {
          const on = selected.has(face);
          return (
            <button
              key={face}
              type="button"
              disabled={disabled}
              onClick={() => onToggle?.(face)}
              aria-pressed={on}
              aria-label={`${label} ${face}${on ? ' (retenue)' : ''}`}
              className={`min-w-[48px] min-h-[48px] px-1.5 rounded-xl border-2 flex items-center justify-center transition
                focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60
                ${on ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 hover:border-indigo-400'}`}
              style={{ touchAction: 'manipulation' }}
            >
              <DieIcon face={face} size={34} tone={on ? 'indigo' : 'slate'} title={`Face ${face}`} />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-slate-700" aria-live="polite">
        <strong className="font-mono tabular-nums">{k}</strong> face{k > 1 ? 's' : ''} favorable{k > 1 ? 's' : ''} sur{' '}
        <strong className="font-mono">6</strong> faces possibles
        {showFraction && (
          <>
            {' '}<span className="text-slate-400" aria-hidden="true">→</span>{' '}
            <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800">
              <MathText>{`$P = ${fracLatex(k, 6)}$`}</MathText>
            </span>
          </>
        )}
      </p>

      {counts && (
        <>
          <CountBars
            counts={counts}
            labels={FACES}
            highlight={(i) => selected.has(i + 1)}
            renderIcon={faceIcon(() => false)}
            ariaLabel={`Série de ${formatDec(total)} lancers, faces de l'événement en indigo`}
          />
          {showFrequency && (
            <p className="text-center text-sm text-slate-700">
              Sur cette série de <strong className="font-mono tabular-nums">{formatDec(total)}</strong> lancers, l’événement est arrivé{' '}
              <strong className="font-mono tabular-nums">{formatDec(c)}</strong> fois → fréquence{' '}
              <strong className="font-mono tabular-nums text-indigo-700">{formatPct(f, total)}</strong>
            </p>
          )}
        </>
      )}
    </div>
  );
}
