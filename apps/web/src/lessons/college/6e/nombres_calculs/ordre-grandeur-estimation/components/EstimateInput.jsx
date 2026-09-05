import React from 'react';
import { NumericQuestion } from '../../../../../common/kit';
import { formatFr } from './estimationUtils';

/**
 * EstimateInput — saisie libre d'une estimation, tolérante par nature.
 *
 * Contrairement à un calcul exact, plusieurs arrondis valables donnent des
 * estimations légèrement différentes (350+250=600, 300+300=600, mais aussi
 * 340+250=590...). On accepte donc une PLAGE de valeurs, pas un nombre
 * unique — la marge est passée par le module appelant, qui la choisit selon
 * les arrondis raisonnables pour ce calcul précis.
 *
 * Construit sur NumericQuestion (lesson kit) avec un `expected` prédicat :
 * jamais bloquant, la correction montre la plage acceptée, le résultat exact
 * et le rappel de méthode (`hint`). À utiliser sous <ContentModule>.
 */
export default function EstimateInput({
  prompt,
  acceptMin,
  acceptMax,
  exact,
  exactLabel = 'Résultat exact',
  hint,
  solved,
  onAnswered,
}) {
  return (
    <NumericQuestion
      prompt={prompt}
      prefix="≈"
      expected={(n) => Number.isFinite(n) && n >= acceptMin && n <= acceptMax}
      display={`une valeur entre ${formatFr(acceptMin)} et ${formatFr(acceptMax)}`}
      explain={
        <>
          {exactLabel} : <strong className="font-mono">{formatFr(exact)}</strong> — une estimation dans cette
          plage est dans le bon ordre de grandeur.
        </>
      }
      explainFor={() => (
        <>
          {hint} {exactLabel} : <strong className="font-mono">{formatFr(exact)}</strong>.
        </>
      )}
      solved={solved}
      onAnswered={onAnswered}
    />
  );
}
