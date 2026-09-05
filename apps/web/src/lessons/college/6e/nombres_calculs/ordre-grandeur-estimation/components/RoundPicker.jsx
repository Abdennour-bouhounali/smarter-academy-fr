import React from 'react';
import NumberLine from '../../../../../common/components/NumberLine';
import { TapQuestion } from '../../../../../common/kit';
import { formatFr, friendlyNeighbours } from './estimationUtils';

/**
 * RoundPicker — « vers quel nombre ami arrondir ? »
 *
 * Le nombre exact est affiché comme repère fixe sur une droite graduée
 * courte ; l'élève choisit, par un simple tap (jamais un glisser fragile
 * sur mobile), lequel des deux nombres amis voisins est le plus proche.
 * La droite rend visible la distance, plutôt que de la faire deviner.
 *
 * Construit sur TapQuestion (lesson kit) : le tap EST la réponse,
 * `onAnswered` est inconditionnel, la correction montre les deux distances.
 * À utiliser uniquement sous <ContentModule>.
 */
export default function RoundPicker({ value, step, solved, onAnswered, label }) {
  const { lower, upper, nearest } = friendlyNeighbours(value, step);
  const correct = nearest === lower ? 0 : 1;
  const dLower = value - lower;
  const dUpper = upper - value;
  const isTie = dLower === dUpper;

  return (
    <TapQuestion
      prompt={label || `${formatFr(value)} est plus proche de quel nombre ami ?`}
      above={
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
          <NumberLine
            min={lower}
            max={upper}
            step={upper - lower}
            labelEvery={1}
            height={150}
            format={formatFr}
            markers={[{ value, label: formatFr(value), color: '#7c3aed' }]}
            ariaLabel={`${formatFr(value)} entre ${formatFr(lower)} et ${formatFr(upper)}`}
          />
        </div>
      }
      options={[formatFr(lower), formatFr(upper)]}
      correct={correct}
      cols={2}
      explain={
        isTie ? (
          <>
            {formatFr(value)} est exactement au milieu : à {formatFr(dLower)} de {formatFr(lower)} comme de{' '}
            {formatFr(upper)}. Dans ce cas, la convention est d'arrondir <strong>au-dessus</strong> :{' '}
            {formatFr(value)} → {formatFr(nearest)}.
          </>
        ) : (
          <>
            {formatFr(value)} est à {formatFr(dLower)} de {formatFr(lower)} et à {formatFr(dUpper)} de{' '}
            {formatFr(upper)} : le nombre ami le plus proche est <strong>{formatFr(nearest)}</strong>, facile à
            calculer mentalement.
          </>
        )
      }
      solved={solved}
      onAnswered={onAnswered}
    />
  );
}
