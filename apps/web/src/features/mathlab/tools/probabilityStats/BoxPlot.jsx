import { formatValue } from '../functionGrapher/grapherFormat.js';

/**
 * LA BOÎTE À MOUSTACHES — مخطط العلبة, dessinée à partir des
 * cinq nombres de statsUtils.fiveNumberSummary (min, Q1, Me, Q3, max) :
 * les MÊMES nombres que le résumé, avec la même convention de quartiles.
 *
 * Chaque repère est NOMMÉ (min, Q1, Me, Q3, max) au-dessus et chiffré
 * au-dessous : la boîte se lit sans légende de couleur. Deux repères trop
 * proches alternent de hauteur pour ne pas se chevaucher. La moyenne, en
 * option, est un losange (x̄) — une forme, pas seulement une couleur.
 */

const VIEW_HEIGHT = 190;
const PAD = { left: 30, right: 30 };

export default function BoxPlot({ numbers, mean = null, showMean = false, title, compact = false }) {
  const width = compact ? 440 : 720;
  const plot = width - PAD.left - PAD.right;
  const span = numbers.max - numbers.min;
  const from = span > 0 ? numbers.min - span * 0.06 : numbers.min - 1;
  const to = span > 0 ? numbers.max + span * 0.06 : numbers.max + 1;
  const x = (value) => PAD.left + ((value - from) / (to - from)) * plot;
  const boxTop = 72;
  const boxBottom = 118;
  const mid = (boxTop + boxBottom) / 2;

  const marks = [
    { key: 'min', label: 'min', value: numbers.min },
    { key: 'q1', label: 'Q₁', value: numbers.q1 },
    { key: 'median', label: 'Me', value: numbers.median },
    { key: 'q3', label: 'Q₃', value: numbers.q3 },
    { key: 'max', label: 'max', value: numbers.max },
  ];
  // Deux repères à moins de 44 unités l'un de l'autre : le second monte d'un cran.
  let previous = -Infinity;
  let level = 0;
  const placed = marks.map((mark) => {
    const px = x(mark.value);
    level = px - previous < 44 ? (level + 1) % 2 : 0;
    previous = px;

    return { ...mark, px, level };
  });

  return (
    <svg
      className="sa-ml-ps__chart sa-ml-ps__chart--box"
      viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-box
    >
      <line x1={x(numbers.min)} y1={mid} x2={x(numbers.q1)} y2={mid} className="sa-ml-ps__box-whisker" />
      <line x1={x(numbers.q3)} y1={mid} x2={x(numbers.max)} y2={mid} className="sa-ml-ps__box-whisker" />
      <line x1={x(numbers.min)} y1={boxTop + 10} x2={x(numbers.min)} y2={boxBottom - 10} className="sa-ml-ps__box-whisker" />
      <line x1={x(numbers.max)} y1={boxTop + 10} x2={x(numbers.max)} y2={boxBottom - 10} className="sa-ml-ps__box-whisker" />
      <rect
        x={x(numbers.q1)}
        y={boxTop}
        width={Math.max(2, x(numbers.q3) - x(numbers.q1))}
        height={boxBottom - boxTop}
        rx="4"
        className="sa-ml-ps__box-body"
      />
      <line x1={x(numbers.median)} y1={boxTop} x2={x(numbers.median)} y2={boxBottom} className="sa-ml-ps__box-median" />

      {showMean && Number.isFinite(mean) && (
        <g data-ml-ps-box-mean>
          <path d={`M ${x(mean)} ${mid - 7} L ${x(mean) + 7} ${mid} L ${x(mean)} ${mid + 7} L ${x(mean) - 7} ${mid} Z`} className="sa-ml-ps__box-mean" />
        </g>
      )}

      {placed.map((mark) => (
        <g key={mark.key} data-ml-ps-box-mark={mark.key}>
          <line x1={mark.px} y1={boxBottom + 4} x2={mark.px} y2={boxBottom + 12} stroke="#94a3b8" />
          <text x={mark.px} y={boxTop - 12 - mark.level * 18} textAnchor="middle" className="sa-ml-ps__box-name">{mark.label}</text>
          <text x={mark.px} y={boxBottom + 28 + mark.level * 18} textAnchor="middle" className="sa-ml-ps__chart-value">
            {formatValue(mark.value, 2)}
          </text>
        </g>
      ))}
      {showMean && Number.isFinite(mean) && (
        <text x={PAD.left} y={VIEW_HEIGHT - 6} className="sa-ml-ps__chart-legend">◆ x̄ = {formatValue(mean, 2)}</text>
      )}
    </svg>
  );
}
