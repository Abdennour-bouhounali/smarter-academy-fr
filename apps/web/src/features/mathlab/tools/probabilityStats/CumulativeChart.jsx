import { useTranslation } from 'react-i18next';
import { formatAxisLabel, formatValue } from '../functionGrapher/grapherFormat.js';
import { cumulativeCrossing } from './descriptiveStats.js';

/**
 * LES EFFECTIFS CUMULÉS CROISSANTS — مضلع التكرارات المجمّعة الصاعدة.
 *   - série en classes : un POLYGONE (bornes supérieures, effectifs cumulés),
 *     et la médiane ESTIMÉE lue où il coupe n/2 ;
 *   - série discrète : un ESCALIER (la courbe cumulative saute à chaque
 *     valeur) — joindre les points inventerait des individus entre deux valeurs.
 * Un trait pointillé à la hauteur n/2 dans les deux cas.
 */

const VIEW_HEIGHT = 300;
const PAD = { top: 26, right: 20, bottom: 44, left: 46 };

export default function CumulativeChart({ series, title, highlight, onHighlight, compact = false }) {
  const { t } = useTranslation('mathlab');
  const width = compact ? 440 : 720;
  const plotW = width - PAD.left - PAD.right;
  const plotH = VIEW_HEIGHT - PAD.top - PAD.bottom;
  const { points, n, kind } = series;
  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const span = maxX > minX ? maxX - minX : 2;
  const from = kind === 'steps' ? minX - span * 0.08 : minX;
  const to = kind === 'steps' ? maxX + span * 0.08 : Math.max(maxX, minX + span);
  const x = (value) => PAD.left + ((value - from) / (to - from)) * plotW;
  const y = (count) => PAD.top + plotH - (count / (n * 1.08)) * plotH;
  const baseline = PAD.top + plotH;

  let d;
  if (kind === 'polygon') {
    d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.x)} ${y(p.y)}`).join(' ');
  } else {
    // L'escalier : 0 avant la première valeur, puis un palier par valeur.
    const segments = [`M ${x(from)} ${baseline}`, `L ${x(points[0].x)} ${baseline}`];
    points.forEach((p, i) => {
      segments.push(`L ${x(p.x)} ${y(p.y)}`);
      segments.push(`L ${x(points[i + 1]?.x ?? to)} ${y(p.y)}`);
    });
    d = segments.join(' ');
  }
  const half = n / 2;
  const crossing = cumulativeCrossing(series, half);
  const step = Math.max(1, Math.ceil(n / 5));
  const ticks = [];
  for (let v = 0; v <= n; v += step) ticks.push(v);
  const labelEvery = Math.ceil(points.length / (compact ? 7 : 12));

  return (
    <svg
      className="sa-ml-ps__chart"
      viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-cumulative={kind}
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} y1={y(tick)} x2={PAD.left + plotW} y2={y(tick)} stroke="#f1f5f9" />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="sa-ml-ps__chart-tick">{tick}</text>
        </g>
      ))}
      <line x1={PAD.left} y1={y(half)} x2={PAD.left + plotW} y2={y(half)} className="sa-ml-ps__half-line" />
      <text x={PAD.left + plotW} y={y(half) - 6} textAnchor="end" className="sa-ml-ps__marker-label">n/2 = {formatValue(half, 1)}</text>

      <path d={d} className="sa-ml-ps__cumulative" />
      {points.map((p, i) => {
        const on = p.key && highlight === p.key;

        return (
          <g
            key={`${p.x}-${i}`}
            onMouseEnter={p.key ? () => onHighlight?.(p.key) : undefined}
            onMouseLeave={p.key ? () => onHighlight?.(null) : undefined}
            data-ml-ps-cumulative-point={p.key ?? 'start'}
          >
            <circle cx={x(p.x)} cy={y(p.y)} r={on ? 7 : 4.5} className={on ? 'sa-ml-ps__point is-highlighted' : 'sa-ml-ps__point'} />
            {i % labelEvery === 0 && (
              <text x={x(p.x)} y={baseline + 18} textAnchor="middle" className="sa-ml-ps__chart-label">{formatAxisLabel(p.x)}</text>
            )}
          </g>
        );
      })}

      {crossing !== null && (
        <g data-ml-ps-cumulative-median>
          <line x1={x(crossing)} y1={y(half)} x2={x(crossing)} y2={baseline} className="sa-ml-ps__median-line" />
          <text x={x(crossing)} y={baseline + 36} textAnchor="middle" className="sa-ml-ps__marker-label sa-ml-ps__marker-label--median">
            Me ≈ {formatValue(crossing, 2)}
          </text>
        </g>
      )}

      <line x1={PAD.left} y1={baseline} x2={PAD.left + plotW} y2={baseline} stroke="#475569" strokeWidth="1.5" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={baseline} stroke="#475569" strokeWidth="1.5" />
      {/* Une phrase arabe dans un SVG LTR : son propre sens, ancrée à droite. */}
      <text x={width - PAD.right} y={14} direction="rtl" textAnchor="start" className="sa-ml-ps__chart-legend">
        {t(kind === 'polygon' ? 'tools.probabilityStats.charts.cumulativePolygonLegend' : 'tools.probabilityStats.charts.cumulativeStepsLegend')}
      </text>
    </svg>
  );
}
