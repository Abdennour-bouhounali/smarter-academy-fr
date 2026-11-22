import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * La DISTRIBUTION d'une série saisie — diagramme en bâtons ou histogramme,
 * selon ce que la série est (datasetStatistics.distributionOf), jamais l'un
 * de force pour toutes (§ 10).
 *
 * Sur ce dessin viennent, en option, la MOYENNE et la MÉDIANE : deux
 * repères verticaux à leur place sur l'axe des valeurs. C'est là que la
 * moyenne cesse d'être une formule pour devenir un point d'équilibre, et
 * que la médiane se voit couper l'effectif en deux.
 *
 * Les deux repères se distinguent par leur TRAIT (plein / pointillé) et par
 * leur étiquette (x̄ / Me) autant que par leur couleur — § 13.
 */

const VIEW_HEIGHT = 300;
const PAD = { top: 26, right: 16, bottom: 48, left: 46 };

export default function DistributionChart({
  distribution, summary, showMean, showMedian, title, emptyMessage, compact = false,
  highlight = null, onHighlight = null,
}) {
  const { t } = useTranslation('mathlab');
  const VIEW_WIDTH = compact ? 440 : 720;
  const plotWidth = VIEW_WIDTH - PAD.left - PAD.right;
  const plotHeight = VIEW_HEIGHT - PAD.top - PAD.bottom;
  const bins = distribution?.bins ?? [];

  if (bins.length === 0) {
    return <p className="sa-ml-ps__empty" data-ml-ps-chart-empty>{emptyMessage}</p>;
  }

  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const y = (count) => PAD.top + plotHeight - (count / (maxCount * 1.15)) * plotHeight;
  const slot = plotWidth / bins.length;
  const isHistogram = distribution.kind === 'classes';
  // Un histogramme a des classes JOINTIVES (elles couvrent l'axe sans trou) ;
  // un diagramme en bâtons a des bâtons séparés (les valeurs sont isolées).
  // Ce n'est pas un détail d'esthétique : c'est ce qui distingue une série
  // continue d'une série discrète.
  const barWidth = isHistogram ? slot : Math.max(3, Math.min(slot * 0.6, 70));

  /**
   * La position d'une VALEUR sur l'axe. En bâtons, l'axe est catégoriel :
   * la valeur v tombe au centre de son bâton, et entre deux bâtons on
   * interpole. En classes, l'axe est numérique : on place la valeur dans sa
   * classe. Sans cela, la moyenne se poserait à côté de la série.
   */
  const xOfValue = (value) => {
    if (!Number.isFinite(value)) return null;
    if (isHistogram) {
      const first = bins[0].from;
      const last = bins[bins.length - 1].to;
      if (last === first) return PAD.left + plotWidth / 2;

      return PAD.left + ((value - first) / (last - first)) * plotWidth;
    }
    const exact = bins.findIndex((b) => b.from === value);
    if (exact >= 0) return PAD.left + slot * exact + slot / 2;
    const after = bins.findIndex((b) => b.from > value);
    if (after <= 0) return after === 0 ? PAD.left : PAD.left + plotWidth;
    const before = after - 1;
    const ratio = (value - bins[before].from) / (bins[after].from - bins[before].from);

    return PAD.left + slot * (before + ratio) + slot / 2;
  };

  const meanX = showMean ? xOfValue(summary.mean) : null;
  const medianX = showMedian ? xOfValue(summary.median) : null;
  const maxLabels = compact ? 8 : 14;
  const showCounts = bins.length <= maxLabels;
  const labelStep = Math.ceil(bins.length / maxLabels);

  return (
    <svg
      className="sa-ml-ps__chart"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-distribution={distribution.kind}
    >
      {countTicks(maxCount).map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} y1={y(tick)} x2={PAD.left + plotWidth} y2={y(tick)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="sa-ml-ps__chart-tick">{tick}</text>
        </g>
      ))}

      {bins.map((bin, index) => {
        const left = PAD.left + slot * index + (slot - barWidth) / 2;
        const top = y(bin.count);
        const label = isHistogram ? formatValue(bin.from, 0) : formatValue(bin.from, 2);
        // Une classe [a ; b[ porte sa borne a à son BORD gauche ; une valeur
        // isolée porte son nom sous le CENTRE de son bâton.
        const labelX = isHistogram ? left : left + barWidth / 2;

        // La même clé que la ligne du tableau (descriptiveStats.valueRows / classRows) :
        // survoler l'un éclaire l'autre.
        const key = isHistogram ? `c:${index}` : `v:${bin.from}`;

        return (
          <g
            key={`${bin.from}-${index}`}
            data-ml-ps-bin={index}
            data-ml-ps-bin-key={key}
            className={highlight === key ? 'is-highlighted' : undefined}
            onMouseEnter={onHighlight ? () => onHighlight(key) : undefined}
            onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
          >
            <rect
              x={left}
              y={top}
              width={isHistogram ? Math.max(1, barWidth - 1) : barWidth}
              height={Math.max(0, PAD.top + plotHeight - top)}
              rx={isHistogram ? 0 : Math.min(4, barWidth / 3)}
              className="sa-ml-ps__bar"
            />
            {showCounts && bin.count > 0 && (
              <text x={left + barWidth / 2} y={top - 5} textAnchor="middle" className="sa-ml-ps__chart-value">{bin.count}</text>
            )}
            {index % labelStep === 0 && (
              <text x={labelX} y={PAD.top + plotHeight + 18} textAnchor="middle" className="sa-ml-ps__chart-label">
                {label}
              </text>
            )}
          </g>
        );
      })}

      {/* La dernière borne d'un histogramme : sans elle l'axe s'arrêterait avant la série. */}
      {isHistogram && (
        <text x={PAD.left + plotWidth} y={PAD.top + plotHeight + 18} textAnchor="middle" className="sa-ml-ps__chart-label">
          {formatValue(bins[bins.length - 1].to, 0)}
        </text>
      )}

      <line x1={PAD.left} y1={PAD.top + plotHeight} x2={PAD.left + plotWidth} y2={PAD.top + plotHeight} stroke="#475569" strokeWidth="1.5" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotHeight} stroke="#475569" strokeWidth="1.5" />

      {medianX !== null && (
        <g data-ml-ps-median-line>
          <line x1={medianX} y1={PAD.top - 6} x2={medianX} y2={PAD.top + plotHeight} className="sa-ml-ps__median-line" />
          <text x={medianX} y={PAD.top - 2} textAnchor="middle" className="sa-ml-ps__marker-label sa-ml-ps__marker-label--median">
            Me = {formatValue(summary.median, 2)}
          </text>
        </g>
      )}
      {meanX !== null && (
        <g data-ml-ps-mean-line>
          <line x1={meanX} y1={PAD.top - 6} x2={meanX} y2={PAD.top + plotHeight} className="sa-ml-ps__mean-line" />
          <text x={meanX} y={PAD.top + plotHeight + 36} textAnchor="middle" className="sa-ml-ps__marker-label sa-ml-ps__marker-label--mean">
            x̄ = {formatValue(summary.mean, 2)}
          </text>
        </g>
      )}

      {/* Une phrase arabe dans un SVG LTR : son propre sens, ancrée à droite,
          une ligne AU-DESSUS de l'étiquette « Me = … » qu'elle recouvrait. */}
      <text x={VIEW_WIDTH - PAD.right} y={10} direction="rtl" textAnchor="start" className="sa-ml-ps__chart-legend">
        {t(isHistogram ? 'tools.probabilityStats.histogramLegend' : 'tools.probabilityStats.barsLegend')}
      </text>
    </svg>
  );
}

/** Des graduations d'effectif ENTIÈRES : un demi-individu n'existe pas. */
function countTicks(maxCount) {
  const step = Math.max(1, Math.ceil(maxCount / 4));
  const ticks = [];
  for (let value = 0; value <= maxCount; value += step) ticks.push(value);

  return ticks;
}
