import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * Le DIAGRAMME des fréquences — dessiné en SVG, comme tout ce que la
 * plateforme montre à un élève (CLAUDE.md : le dessin se LIT).
 *
 * Une barre pleine par issue : la fréquence expérimentale. Et, quand la
 * comparaison est active, un TRAIT à la hauteur de la probabilité
 * théorique, qui ne bouge jamais — c'est la fréquence qui vient à lui.
 * Le trait est plein et épais, la barre est une surface : les deux se
 * distinguent sans la couleur (§ 13), pour un daltonien comme à l'impression.
 *
 *     ███████████  fréquence expérimentale
 *     ───────────  probabilité théorique
 *
 * Le graphique est LTR : un axe de valeurs croissantes se lit de gauche à
 * droite en mathématiques, que la page soit en arabe ou non
 * (ARABIC_RTL_CONTRACT). Les étiquettes restent du texte DOM.
 */

const VIEW_HEIGHT = 322;
// Le bas réserve deux rangées : les étiquettes de l'axe, puis la légende.
const PAD = { top: 18, right: 14, bottom: 68, left: 46 };

export default function FrequencyBars({
  rows, compare, total, labelFor, title, emptyMessage, compact = false,
}) {
  const { t } = useTranslation('mathlab');
  const VIEW_WIDTH = compact ? 440 : 720;
  const plotWidth = VIEW_WIDTH - PAD.left - PAD.right;
  const plotHeight = VIEW_HEIGHT - PAD.top - PAD.bottom;

  if (!rows || rows.length === 0) {
    return <p className="sa-ml-ps__empty" data-ml-ps-chart-empty>{emptyMessage}</p>;
  }

  // L'échelle : le maximum de ce qu'on montre, avec un peu d'air au-dessus,
  // jamais moins que la plus grande probabilité théorique — sinon le trait
  // théorique sortirait du cadre sur une série encore très courte.
  const observedMax = Math.max(...rows.map((r) => r.frequency), 0);
  const theoreticalMax = compare ? Math.max(...rows.map((r) => r.probability), 0) : 0;
  const scaleMax = Math.max(0.1, Math.min(1, Math.max(observedMax, theoreticalMax) * 1.18));
  const y = (frequency) => PAD.top + plotHeight - (frequency / scaleMax) * plotHeight;

  const slot = plotWidth / rows.length;
  // Une barre large mais jamais collée à sa voisine, et jamais démesurée
  // quand il n'y a que deux issues (pile ou face).
  const barWidth = Math.max(3, Math.min(slot * 0.62, 84));
  const ticks = tickValues(scaleMax);
  // Une valeur au-dessus de chaque barre, tant qu'elles ne se chevauchent pas.
  const showValues = rows.length <= (compact ? 6 : 13);

  return (
    <svg
      className="sa-ml-ps__chart"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-chart
    >
      {/* Les graduations : discrètes, en pourcentage — l'unité dans laquelle on lit une fréquence. */}
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} y1={y(tick)} x2={PAD.left + plotWidth} y2={y(tick)} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="sa-ml-ps__chart-tick">
            {formatValue(tick * 100, tick * 100 < 10 ? 1 : 0)} %
          </text>
        </g>
      ))}

      {rows.map((row, index) => {
        const center = PAD.left + slot * index + slot / 2;
        const top = y(row.frequency);
        const theoreticalY = y(row.probability);

        return (
          <g key={row.key} data-ml-ps-bar={row.key}>
            <rect
              x={center - barWidth / 2}
              y={top}
              width={barWidth}
              height={Math.max(0, PAD.top + plotHeight - top)}
              rx={Math.min(4, barWidth / 3)}
              className="sa-ml-ps__bar"
            />
            {showValues && row.frequency > 0 && (
              <text x={center} y={top - 5} textAnchor="middle" className="sa-ml-ps__chart-value" data-ml-ps-bar-value={row.key}>
                {formatValue(row.frequency * 100, 1)} %
              </text>
            )}
            {compare && (
              <line
                x1={center - barWidth / 2 - 5}
                y1={theoreticalY}
                x2={center + barWidth / 2 + 5}
                y2={theoreticalY}
                className="sa-ml-ps__theoretical"
                data-ml-ps-theoretical={row.key}
              />
            )}
            <text x={center} y={PAD.top + plotHeight + 18} textAnchor="middle" className="sa-ml-ps__chart-label">
              {labelFor(row)}
            </text>
          </g>
        );
      })}

      <line x1={PAD.left} y1={PAD.top + plotHeight} x2={PAD.left + plotWidth} y2={PAD.top + plotHeight} stroke="#475569" strokeWidth="1.5" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotHeight} stroke="#475569" strokeWidth="1.5" />

      {/* La légende, dans le graphique : deux traits et leurs noms, pour
          qu'on sache ce qu'on regarde sans quitter le dessin des yeux. */}
      <g transform={`translate(${PAD.left}, ${VIEW_HEIGHT - 10})`}>
        <rect x={0} y={-9} width={18} height={10} rx={2} className="sa-ml-ps__bar" />
        <text x={24} y={0} className="sa-ml-ps__chart-legend">{t('tools.probabilityStats.experimental')}</text>
        {compare && (
          <>
            <line x1={150} y1={-4} x2={176} y2={-4} className="sa-ml-ps__theoretical" />
            <text x={182} y={0} className="sa-ml-ps__chart-legend">{t('tools.probabilityStats.theoretical')}</text>
          </>
        )}
        <text x={plotWidth} y={0} textAnchor="end" className="sa-ml-ps__chart-legend" data-ml-ps-chart-total data-ml-ps-total={total}>
          {t('tools.probabilityStats.drawsDone', { count: total })}
        </text>
      </g>
    </svg>
  );
}

/** Quatre graduations rondes au plus, sur une échelle qui va de 0 à `max`. */
function tickValues(max) {
  const candidates = [0.02, 0.05, 0.1, 0.2, 0.25, 0.5];
  const step = candidates.find((c) => max / c <= 5) ?? 0.5;
  const ticks = [];
  for (let value = 0; value <= max + 1e-9; value += step) ticks.push(Math.round(value * 1000) / 1000);

  return ticks;
}
