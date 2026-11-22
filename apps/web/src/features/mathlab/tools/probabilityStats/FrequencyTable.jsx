import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * LE TABLEAU DES EFFECTIFS — la représentation textuelle de tous les
 * graphiques (§ 31) : valeur ou classe, التكرار (effectif), التواتر
 * (fréquence, %), التكرار المجمّع الصاعد (effectifs cumulés croissants) et,
 * pour le diagramme circulaire, l'angle 360° × f. Une ligne focalisée ou
 * survolée éclaire sa barre, son secteur, ses valeurs dans la série ordonnée.
 */
export default function FrequencyTable({ rows, grouping, showAngle, n, highlight, onHighlight }) {
  const { t } = useTranslation('mathlab');
  if (rows.length === 0) return null;
  const label = (row) => (grouping === 'classes'
    ? `[${formatValue(row.from, 2)} ; ${formatValue(row.to, 2)}${row.isLast ? ']' : '['}`
    : formatValue(row.value, 4));

  return (
    <div className="sa-ml-ps__table-wrap">
      <table className="sa-ml-ps__table sa-ml-ps__table--freq" data-ml-ps-freq-table={grouping}>
        <caption className="sa-ml-ps__table-caption">
          {t(grouping === 'classes' ? 'tools.probabilityStats.table.captionClasses' : 'tools.probabilityStats.table.captionValues')}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t(grouping === 'classes' ? 'tools.probabilityStats.table.class' : 'tools.probabilityStats.table.value')}</th>
            <th scope="col">{t('tools.probabilityStats.table.count')}</th>
            <th scope="col">{t('tools.probabilityStats.table.frequency')}</th>
            <th scope="col">{t('tools.probabilityStats.table.cumulative')}</th>
            {showAngle && <th scope="col">{t('tools.probabilityStats.table.angle')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              tabIndex={0}
              className={highlight === row.key ? 'is-highlighted' : undefined}
              onMouseEnter={() => onHighlight(row.key)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(row.key)}
              onBlur={() => onHighlight(null)}
              data-ml-ps-freq-row={row.key}
            >
              <th scope="row" dir="ltr">{label(row)}</th>
              <td dir="ltr">{row.count}</td>
              <td dir="ltr">{formatValue(row.frequency * 100, 2)} %</td>
              <td dir="ltr" data-ml-ps-freq-cumulative={row.cumulativeCount}>{row.cumulativeCount}</td>
              {showAngle && <td dir="ltr">{formatValue(row.angle, 1)}°</td>}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{t('tools.probabilityStats.table.total')}</th>
            <td dir="ltr">{n}</td>
            <td dir="ltr">100 %</td>
            <td />
            {showAngle && <td dir="ltr">360°</td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
