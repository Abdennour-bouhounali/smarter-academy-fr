import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * Le RÉSUMÉ de la série : taille, extrêmes, étendue, moyenne, médiane, mode,
 * quartiles, écart interquartile, variance et écart type (de population).
 * `aria-live` — c'est la représentation textuelle complète de ce que les
 * graphiques montrent (§ 31). Jamais NaN : une case sans valeur affiche « — ».
 *
 * Les symboles (n, x̄, Me, Q₁…) restent en LTR : une notation mathématique ne
 * se renverse pas parce que la page est en arabe (ARABIC_RTL_CONTRACT, § 25).
 */
export default function StatisticsSummary({ stats, shown = null }) {
  const { t } = useTranslation('mathlab');
  const empty = stats.n === 0;
  let modeText = null;
  if (stats.modes.kind === 'values') modeText = stats.modes.values.map((v) => formatValue(v, 2)).join(' ; ');
  if (stats.modes.kind === 'none') modeText = t('tools.probabilityStats.stats.noMode');

  const entries = [
    { key: 'count', symbol: 'n', value: empty ? null : stats.n, decimals: 0 },
    { key: 'min', symbol: 'min', value: stats.min },
    { key: 'max', symbol: 'max', value: stats.max },
    { key: 'range', symbol: 'max − min', value: stats.range },
    { key: 'mean', symbol: 'x̄', value: stats.mean, strong: true },
    { key: 'median', symbol: 'Me', value: stats.median, strong: true },
    { key: 'mode', symbol: 'Mo', text: modeText },
    { key: 'q1', symbol: 'Q₁', value: stats.q1 },
    { key: 'q3', symbol: 'Q₃', value: stats.q3 },
    { key: 'iqr', symbol: 'Q₃ − Q₁', value: stats.iqr },
    { key: 'variance', symbol: 'V', value: stats.variance, decimals: 4 },
    { key: 'sd', symbol: 'σ', value: stats.sd, decimals: 4 },
  // `shown` : les indicateurs de ce مخبر (scope.js) — ni quartiles ni
  // variance au collège.
  ].filter((entry) => !shown || shown.includes(entry.key));

  return (
    <dl className="sa-ml-ps__stats" aria-live="polite" data-ml-ps-summary>
      {entries.map((entry) => (
        <div
          key={entry.key}
          className={`sa-ml-ps__stat ${entry.strong ? 'sa-ml-ps__stat--strong' : ''}`}
          data-ml-ps-stat={entry.key}
        >
          <dt>
            {t(`tools.probabilityStats.stats.${entry.key}`)}
            <span className="sa-ml-ps__stat-symbol" dir="ltr">{entry.symbol}</span>
          </dt>
          {entry.text !== undefined ? (
            <dd dir="auto" data-ml-ps-stat-value={entry.key}>{entry.text ?? '—'}</dd>
          ) : (
            <dd dir="ltr" data-ml-ps-stat-value={entry.key}>
              {entry.value === null || entry.value === undefined ? '—' : formatValue(entry.value, entry.decimals ?? 2)}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
