import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { sortedMarks } from './descriptiveStats.js';

/** Au-delà, la bande triée ne se lit plus : on dit où sont Q1, Me, Q3 sans tout écrire. */
const MAX_STRIP = 80;

/**
 * LA SÉRIE ORDONNÉE, rang par rang, avec les rangs qui font les indicateurs :
 * Q1 (⌈n/4⌉), Me (le ou les rangs du milieu), Q3 (⌈3n/4⌉) — la convention de
 * statsUtils, montrée plutôt que récitée. Survoler ou focaliser une valeur
 * éclaire sa ligne du tableau et sa barre.
 */
export default function SortedStrip({ sortedValues, rowKeyOf, highlight, onHighlight, quartiles = true }) {
  const { t } = useTranslation('mathlab');
  const n = sortedValues.length;
  if (n === 0) return null;
  const marks = sortedMarks(n);
  const tagsOf = (rank) => [
    // `quartiles` : faux au collège (scope.js) — la médiane seule est marquée.
    quartiles && rank === marks.q1 && 'Q₁',
    marks.median.includes(rank) && 'Me',
    quartiles && rank === marks.q3 && 'Q₃',
  ].filter(Boolean);

  return (
    <section className="sa-ml-ps__strip-block" aria-labelledby="ml-ps-strip-heading">
      <h3 id="ml-ps-strip-heading" className="sa-ml-ps__heading">{t('tools.probabilityStats.strip.heading')}</h3>
      {n > MAX_STRIP ? (
        <p className="sa-ml-ps__hint" data-ml-ps-strip-hidden>
          {t('tools.probabilityStats.strip.tooLong', { max: MAX_STRIP })}
        </p>
      ) : (
        <ol className="sa-ml-ps__strip" dir="ltr" data-ml-ps-strip={n}>
          {sortedValues.map((value, index) => {
            const rank = index + 1;
            const key = rowKeyOf(value);
            const tags = tagsOf(rank);

            return (
              <li
                // Le rang EST l'identité d'une case de la série ordonnée.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`sa-ml-ps__strip-item${tags.length ? ' is-marked' : ''}${highlight && highlight === key ? ' is-highlighted' : ''}`}
                tabIndex={0}
                onMouseEnter={() => onHighlight(key)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(key)}
                onBlur={() => onHighlight(null)}
                aria-label={t('tools.probabilityStats.strip.item', { rank, value: formatValue(value, 4) })
                  + (tags.length ? ` (${tags.join('، ')})` : '')}
                data-ml-ps-strip-rank={rank}
                data-ml-ps-strip-tags={tags.join(',') || undefined}
              >
                <span className="sa-ml-ps__strip-rank">{rank}</span>
                <span className="sa-ml-ps__strip-value">{formatValue(value, 2)}</span>
                {tags.length > 0 && <span className="sa-ml-ps__strip-tags">{tags.join(' ')}</span>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
