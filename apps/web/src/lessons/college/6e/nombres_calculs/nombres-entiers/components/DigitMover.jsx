import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Base10Blocks from './Base10Blocks';
import PredictionChips from './PredictionChips';
import { DigitCard, placeLabels } from './DigitCards';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatFr } from './numberUtils';
import { blockCounts, placeOf } from './cardUtils';

/**
 * DigitMover — un seul chiffre, quatre cases : l'élève le déplace et regarde
 * ce qu'il vaut (Module 4, ouverture).
 *
 * Activity: déplace le chiffre 8
 * Mathematical objective: la valeur d'un chiffre = chiffre × valeur de sa
 *   position ; une case vers la gauche multiplie par 10.
 * Student action: taper une case (ou ← / →) pour y déplacer la carte.
 * Controlled variable: la position du chiffre — la variable même du concept.
 * Mathematical state: `pos` (0 = milliers … 3 = unités) ; tout le reste dérive.
 * Visual consequence: 8 cubes → 8 barres → 8 plaques → 8 blocs ; le nombre lu
 *   passe de 8 à 8 000 ; le parcours des valeurs visitées se remplit.
 * Expected observation: « même chiffre, dix fois plus à chaque case vers la gauche ».
 * Misconception targeted: « le chiffre est la valeur » (un 8 vaut toujours 8).
 * Feedback: la conséquence est le matériel, sans clic ; la prédiction (sans
 *   verdict) est citée quand la case des milliers est atteinte.
 * Formalization: dans l'étape suivante (chasse au chiffre) et « le chiffre
 *   n'est pas la valeur » à l'étape 5 555 — jamais ici.
 * Scaffolding: aucune cible chiffrée ; l'étape se termine quand les quatre cases
 *   ont été visitées, quelles que soient les prédictions.
 * Transfer: le tableau de numération à 7 colonnes (étape 2) reprend le même
 *   geste de lecture sur un grand nombre.
 */

const PRED_OPTIONS = [
  { id: '80', label: '80' },
  { id: '800', label: '800' },
  { id: '8000', label: '8 000' },
  { id: '80000', label: '80 000' },
];

export default function DigitMover({ digit = 8, onAllVisited, react, disabled = false }) {
  const size = 4;
  const labels = placeLabels(size);
  const [pos, setPos] = useState(size - 1); // on part des unités
  const [visited, setVisited] = useState([size - 1]);
  const [prediction, setPrediction] = useState(null);
  const [allDone, setAllDone] = useState(false);

  const slots = Array.from({ length: size }, (_, i) => (i === pos ? digit : null));
  const value = digit * placeOf(pos, size);
  const values = Array.from({ length: size }, (_, i) => digit * placeOf(i, size));

  const moveTo = (i) => {
    if (disabled || i < 0 || i >= size || i === pos) return;
    setPos(i);
    setVisited((v) => (v.includes(i) ? v : [...v, i]));
  };

  // Les quatre cases visitées : l'étape est atteinte. On le signale depuis un
  // effet, jamais depuis l'updater de setVisited (setState d'un parent pendant
  // le rendu d'un enfant = avertissement React).
  useEffect(() => {
    if (visited.length < size || allDone) return;
    setAllDone(true);
    react?.(true);
    onAllVisited?.();
    // react / onAllVisited sont stables côté appelant (setState).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited.length, allDone]);

  const seenTensAndHundreds = visited.includes(2) && visited.includes(1);
  const thousandsVisited = visited.includes(0);
  const askPrediction = seenTensAndHundreds && !thousandsVisited;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => moveTo(pos - 1)}
          disabled={disabled || pos === 0}
          aria-label="Déplacer le chiffre vers la gauche"
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 hover:border-violet-500 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowLeft className="inline w-4 h-4" aria-hidden="true" />
        </button>

        <div className="flex gap-1.5 sm:gap-2" role="group" aria-label="Cases du tableau">
          {slots.map((d, i) => {
            const filled = d !== null;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <DigitCard
                  digit={d}
                  empty={!filled}
                  tone="indigo"
                  selected={filled}
                  disabled={disabled || filled}
                  onClick={() => moveTo(i)}
                  ariaLabel={filled ? `Le ${digit} est dans la case des ${labels[i].long}` : `Déplacer le ${digit} dans la case des ${labels[i].long}`}
                />
                <span className="text-[10px] font-mono text-slate-400 leading-none">
                  <span className="hidden sm:inline">{labels[i].long}</span>
                  <span className="sm:hidden uppercase">{labels[i].short}</span>
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => moveTo(pos + 1)}
          disabled={disabled || pos === size - 1}
          aria-label="Déplacer le chiffre vers la droite"
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-white border-2 border-slate-300 text-slate-700 hover:border-violet-500 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowRight className="inline w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(14rem,18rem)] gap-4 items-start">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 min-h-[96px]">
          <Base10Blocks counts={blockCounts(slots)} max={9} compact wrap unitClass="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-[2px]" />
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Ici, le {digit} vaut</div>
            <div className="font-mono font-extrabold text-3xl text-slate-800 tabular-nums" aria-live="polite">
              {formatFr(value)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Valeurs visitées</div>
            <div className="flex items-center gap-1 flex-wrap font-mono text-sm font-bold tabular-nums">
              {values.map((v, i) => (
                <React.Fragment key={v}>
                  {i > 0 && <span className="text-slate-300">←</span>}
                  <span className={`px-2 py-1 rounded-lg ${visited.includes(i) ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-300'}`}>
                    {visited.includes(i) ? formatFr(v) : '?'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {askPrediction && (
        <PredictionChips
          prompt={`Si tu déplaces le ${digit} dans la case des milliers, il vaudra…`}
          options={PRED_OPTIONS}
          value={prediction}
          onChange={setPrediction}
        />
      )}

      {thousandsVisited && (
        <Feedback tone="info">
          {prediction && (
            <>
              Ta prédiction : <em>{PRED_OPTIONS.find((o) => o.id === prediction)?.label}</em>.{' '}
              {prediction === '8000' ? 'Le matériel te donne raison : ' : 'Le matériel te contredit : '}
            </>
          )}
          8 blocs de mille, c'est <strong className="font-mono">8 000</strong>.
          {allDone && (
            <>
              {' '}
              Tu as tout visité : <strong className="font-mono">8 → 80 → 800 → 8 000</strong>. Le chiffre n'a pas changé — à chaque case vers la
              gauche, il vaut <strong>10 fois plus</strong>.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}
