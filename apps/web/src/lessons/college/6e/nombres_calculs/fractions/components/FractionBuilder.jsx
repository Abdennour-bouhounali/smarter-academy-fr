import React, { useState } from 'react';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { texFrac } from './fractionUtils';
import FractionBar from './FractionBar';

/**
 * FractionBuilder — construire une fraction EN GLISSANT sur la barre.
 *
 * Jamais de champ texte libre : l'élève fabrique la fraction sur une unité
 * réelle. Le bord colorié donne le nombre de parts prises ; le couloir de
 * découpe donne le nombre de parts égales (ou reste fixe d'une seule option
 * quand le partage est déjà décidé ailleurs à l'écran).
 *
 * Deux règles projet corrigées ici (2026-09-06) :
 *   1. le numérateur était piloté par des boutons + / − de 36 px — un stepper
 *      pour une grandeur qu'on peut saisir, et sous les 44 px réglementaires.
 *      C'est la LONGUEUR prise qu'on tire maintenant ;
 *   2. tous les contrôles se figeaient (`disabled={solved}`) une fois la
 *      fraction validée. La barre reste vivante : c'est en re-découpant après
 *      coup qu'on voit 1/2 devenir 2/4.
 *
 * L'accessibilité ne perd rien : `FractionBar` expose deux `role="slider"`
 * pilotables aux flèches, Début et Fin.
 *
 * @param {number} targetNum
 * @param {number} targetDen
 * @param {number[]} [denOptions]  dénominateurs proposés dans le couloir ; si
 *   absent, la découpe est fixée à `targetDen` et le couloir ne bouge pas.
 * @param {number}  [maxNum]       borne supérieure du nombre de parts prises
 * @param {string}  [hint]
 * @param {(n:number,d:number)=>string} [wrongHint] indice dépendant de la saisie fautive
 */
export default function FractionBuilder({
  targetNum,
  targetDen,
  denOptions = null,
  maxNum = 12,
  hint,
  wrongHint,
  onSolved,
  solved,
  successNote,
}) {
  // La découpe démarre sur la PLUS PETITE option, jamais sur la cible : sinon
  // l'exercice serait à moitié résolu au chargement (piège §6ter.7).
  const [den, setDen] = useState(denOptions ? denOptions[0] : targetDen);
  const [num, setNum] = useState(0);
  const [checked, setChecked] = useState(false);

  const isRight = num === targetNum && den === targetDen;

  const take = (n) => { setChecked(false); setNum(n); };
  const cut = (d) => {
    setChecked(false);
    setDen(d);
    // On ne peut pas garder 5 parts prises sur une unité coupée en 3.
    setNum((n) => Math.min(n, d));
  };

  return (
    <div className="space-y-4">
      <FractionBar
        num={num}
        den={den}
        onNum={take}
        onDen={denOptions ? cut : undefined}
        denOptions={denOptions || [targetDen]}
        maxNum={Math.min(maxNum, den)}
        tone="sky"
        showWriting={false}
      />

      <div className="text-center text-2xl text-slate-800 min-h-[44px] flex items-center justify-center">
        <MathText>{`$${texFrac(num, den)}$`}</MathText>
      </div>

      {/* La validation reste rejouable : « Revalider » après une réussite,
          pour que la barre serve encore à explorer. */}
      <div className="text-center">
        <ValidateButton
          onClick={() => {
            setChecked(true);
            if (isRight) onSolved?.();
          }}
        >
          {solved ? 'Revalider ma fraction' : 'Valider ma fraction'}
        </ValidateButton>
      </div>

      {checked && !isRight && (
        <Feedback tone="hint">
          {wrongHint ? wrongHint(num, den) : hint || "Compte à nouveau les parts, puis compare au partage total."}
        </Feedback>
      )}

      {solved && (!checked || isRight) && (
        <Feedback tone="ok">
          {successNote || (
            <>
              <MathText>{`$${texFrac(targetNum, targetDen)}$`}</MathText> : {targetNum} part
              {targetNum > 1 ? 's' : ''} sur {targetDen}.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}
