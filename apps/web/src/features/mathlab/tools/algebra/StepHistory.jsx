import { useTranslation } from 'react-i18next';
import { CornerDownLeft } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { equationToLatex, equationToText } from './equation.js';
import { operationLatex } from './equationDisplay.js';

/**
 * L'HISTORIQUE — le raisonnement, pas un journal.
 *
 *     2x + 3 = 11
 *       − 3
 *     2x = 8
 *       ÷ 2
 *     x = 4
 *
 * Chaque pas montre l'opération PUIS ce qu'elle donne, comme un cahier. Le
 * pas courant est mis en avant ; cliquer sur un pas antérieur y revient (le
 * curseur de algebraState), ce qui fait de l'historique la commande de
 * « تراجع » autant que sa trace.
 *
 * V2 : chaque pas montre trois lignes — l'opération, la ligne INTERMÉDIAIRE
 * (l'opération posée aux deux membres, non simplifiée, en orange), puis le
 * résultat. Quand la saisie a demandé un « نشر وتبسيط », le premier pas le
 * rappelle.
 *
 * Un retournement du sens d'une inégalité est SIGNALÉ sur le pas qui l'a
 * provoqué : c'est l'erreur classique du chapitre, elle mérite un mot.
 */

const SYMBOL = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

function operationLabel(operation) {
  const text = operation.value.d === 1
    ? String(operation.value.n).replace('-', '−')
    : `${String(operation.value.n).replace('-', '−')}/${operation.value.d}`;

  if (operation.term === 'x') return `${SYMBOL[operation.kind]} ${text === '1' ? '' : text}x`;

  return `${SYMBOL[operation.kind]} ${text}`;
}

export default function StepHistory({ steps, cursor, onSelect, expanded = false, idPrefix = 'eq' }) {
  const { t } = useTranslation('mathlab');

  return (
    <section className="sa-ml-alg__section sa-ml-alg__history" aria-labelledby={`sa-ml-alg-history-${idPrefix}`}>
      <h3 className="sa-ml-alg__heading" id={`sa-ml-alg-history-${idPrefix}`}>{t('tools.algebra.historyHeading')}</h3>
      <ol className="sa-ml-alg__steps">
        {steps.map((step, index) => {
          const active = index === cursor;
          const ahead = index > cursor;

          return (
            <li
              key={index}
              className={`sa-ml-alg__step${active ? ' sa-ml-alg__step--active' : ''}${ahead ? ' sa-ml-alg__step--ahead' : ''}`}
            >
              {index === 0 && expanded && (
                <span className="sa-ml-alg__step-expanded">{t('tools.algebra.expansion.historyNote')}</span>
              )}
              {step.operation && (
                <span className="sa-ml-alg__step-op" dir="ltr" lang="en">
                  {operationLabel(step.operation)}
                  <span className="sa-ml-alg__step-op-sides">{t('tools.algebra.bothSides')}</span>
                </span>
              )}
              {step.operation && index > 0 && (
                <span className="sa-ml-alg__step-intermediate" dir="ltr" data-ml-alg-history-intermediate>
                  <MathText>{`$${operationLatex(steps[index - 1].equation, step.operation, step.flipped)}$`}</MathText>
                </span>
              )}
              <button
                type="button"
                className="sa-ml-alg__step-equation"
                onClick={() => onSelect(index)}
                aria-current={active ? 'step' : undefined}
                aria-label={t('tools.algebra.goToStep', { equation: equationToText(step.equation) })}
              >
                <MathText>{`$${equationToLatex(step.equation)}$`}</MathText>
                {active && <CornerDownLeft size={14} aria-hidden="true" className="sa-ml-alg__step-cursor" />}
              </button>
              {step.flipped && (
                <p className="sa-ml-alg__flipped" role="note">{t('tools.algebra.flippedNotice')}</p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
