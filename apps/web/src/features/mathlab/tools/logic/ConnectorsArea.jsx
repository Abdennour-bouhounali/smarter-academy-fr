import { useTranslation } from 'react-i18next';
import { Notation, TruthBadge, VerdictPill, TruthTable } from './LogicPieces.jsx';
import { CONNECTORS, evalConnector } from './logicMath.js';
import { connectorExpression, boolText } from './logicFormat.js';
import { setConnector, setOperand } from './logicState.js';

/**
 * §11-12 — LES ROBINETS DE LA LOGIQUE.
 *
 * Deux interrupteurs, une expression, une table. L'élève bascule P, et la
 * ligne correspondante de la table s'allume en même temps que la valeur de
 * l'expression change : la table cesse d'être un tableau à recopier pour
 * devenir la carte de ce qu'il vient de faire.
 *
 * Les interrupteurs sont des `aria-pressed` (pas des cases à cocher) parce
 * que ce sont des BASCULES de valeur, et chacun porte sa lettre arabe (ص/خ)
 * en plus de sa couleur (§45).
 */
export default function ConnectorsArea({ data, onChange }) {
  const { t } = useTranslation('mathlab');
  const state = data.connectors;
  const { connector, p, q } = state;
  const result = evalConnector(connector, p, q);
  const unary = connector === 'not';

  const columnLabels = Object.fromEntries(CONNECTORS.map((id) => [id, connectorExpression(id)]));

  return (
    <>
      <section className="sa-ml-lg__card" data-ml-lg-area="connectors">
        <h2 className="sa-ml-lg__title">{t('tools.logic.connectors.heading')}</h2>
        <p className="sa-ml-lg__lead">{t('tools.logic.connectors.lead')}</p>

        <div className="sa-ml-lg__actions" role="group" aria-label={t('tools.logic.connectors.heading')}>
          {CONNECTORS.map((id) => (
            <button
              key={id}
              type="button"
              className="sa-ml-lg__btn"
              aria-pressed={connector === id}
              onClick={() => onChange((current) => setConnector(current, id))}
              data-ml-lg-connector={id}
            >
              <Notation>{connectorExpression(id)}</Notation>
            </button>
          ))}
        </div>

        <p className="sa-ml-lg__note">{t(`tools.logic.connectors.readings.${connector}`)}</p>
      </section>

      <section className="sa-ml-lg__card" data-ml-lg-switches>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.connectors.resultLabel')}</h3>

        <div className="sa-ml-lg__actions">
          <button
            type="button"
            className="sa-ml-lg__btn sa-ml-lg__btn--choice"
            aria-pressed={p}
            aria-label={t('tools.logic.connectors.toggleP')}
            onClick={() => onChange((current) => setOperand(current, 'p', !p))}
            data-ml-lg-operand="p"
            data-ml-lg-value={String(p)}
          >
            <Notation>P</Notation>
            <TruthBadge value={p} />
          </button>

          {!unary && (
            <button
              type="button"
              className="sa-ml-lg__btn sa-ml-lg__btn--choice"
              aria-pressed={q}
              aria-label={t('tools.logic.connectors.toggleQ')}
              onClick={() => onChange((current) => setOperand(current, 'q', !q))}
              data-ml-lg-operand="q"
              data-ml-lg-value={String(q)}
            >
              <Notation>Q</Notation>
              <TruthBadge value={q} />
            </button>
          )}
        </div>

        <p className="sa-ml-lg__math sa-ml-lg__math--block" dir="ltr" data-ml-lg-expression>
          {unary
            ? `¬${boolText(p)}`
            : `${boolText(p)} ${columnLabels[connector].replace(/P|Q/g, '').trim()} ${boolText(q)}`}
        </p>

        <p role="status" aria-live="polite" data-ml-lg-result={String(result)}>
          <VerdictPill value={result} />
        </p>
      </section>

      <section className="sa-ml-lg__card" data-ml-lg-truthtable>
        <h3 className="sa-ml-lg__sectionTitle">{t('tools.logic.connectors.tableCaption')}</h3>
        <TruthTable
          connector={connector}
          current={{ p, q }}
          caption={t('tools.logic.connectors.tableCaption')}
          columnLabels={columnLabels}
        />
        <p className="sa-ml-lg__tableNote">{t('tools.logic.connectors.currentRow')}</p>
      </section>
    </>
  );
}
