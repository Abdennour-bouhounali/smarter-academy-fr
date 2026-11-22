import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * Le tableau théorique / expérimental — SECOND par rapport au graphique
 * (§ 14) : on le lit pour vérifier un chiffre, pas pour découvrir la forme
 * de la loi. C'est aussi la représentation TEXTUELLE de la simulation, celle
 * qu'un lecteur d'écran parcourt (§ 31).
 *
 * La probabilité théorique s'écrit en FRACTION autant qu'en pourcentage :
 * un élève du moyen lit 1/6 avant 16,67 %.
 */
export default function TheoreticalComparison({ rows, labelFor, fractionFor, total }) {
  const { t } = useTranslation('mathlab');

  return (
    <div className="sa-ml-ps__table-wrap" data-ml-ps-table>
      <table className="sa-ml-ps__table">
        <caption className="sa-ml-ps__table-caption">
          {t('tools.probabilityStats.tableCaption', { count: total })}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t('tools.probabilityStats.outcome')}</th>
            <th scope="col">{t('tools.probabilityStats.count')}</th>
            <th scope="col">{t('tools.probabilityStats.theoretical')}</th>
            <th scope="col">{t('tools.probabilityStats.experimental')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const fraction = fractionFor(row);

            return (
              <tr key={row.key} data-ml-ps-row={row.key}>
                <th scope="row" dir="ltr">{labelFor(row)}</th>
                <td dir="ltr" data-ml-ps-count={row.key}>{row.count.toLocaleString('en-US')}</td>
                <td dir="ltr">
                  {fraction && (
                    <span className="sa-ml-ps__fraction">
                      {fraction.numerator}/{fraction.denominator}
                    </span>
                  )}
                  <span className="sa-ml-ps__percent">{formatValue(row.probability * 100, 2)} %</span>
                </td>
                <td dir="ltr" data-ml-ps-frequency={row.key}>
                  <span className="sa-ml-ps__percent sa-ml-ps__percent--strong">{formatValue(row.frequency * 100, 2)} %</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
