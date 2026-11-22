import { formatValue } from '../functionGrapher/grapherFormat.js';
import { pieSectors } from './descriptiveStats.js';

/**
 * Le DIAGRAMME CIRCULAIRE — المخطط الدائري. Proposé seulement pour une
 * série discrète d'au plus 8 modalités (descriptiveStats.chartAvailability) :
 * au-delà, un secteur devient une aiguille. L'angle de chaque secteur vaut
 * 360° × f ; il est aussi écrit dans le tableau.
 *
 * La couleur n'est jamais seule : chaque secteur porte sa valeur (dans le
 * secteur, ou à côté par un trait de rappel s'il est étroit), et la légende
 * DOM à côté répète valeur, pourcentage et angle.
 */

const PIE_COLORS = ['#008443', '#F36D21', '#2563eb', '#a21caf', '#0891b2', '#ca8a04', '#be123c', '#475569'];

const polar = (cx, cy, r, degrees) => {
  const a = ((degrees - 90) * Math.PI) / 180;

  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

function sectorPath(cx, cy, r, start, end) {
  if (end - start >= 359.999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

export default function PieChart({ rows, title, highlight, onHighlight, compact = false }) {
  const size = compact ? 300 : 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const sectors = pieSectors(rows);

  return (
    <div className="sa-ml-ps__pie">
      <svg
        className="sa-ml-ps__chart sa-ml-ps__chart--pie"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={title}
        dir="ltr"
        data-ml-ps-pie={sectors.length}
      >
        {sectors.map((sector, index) => {
          const mid = (sector.start + sector.end) / 2;
          const wide = sector.end - sector.start >= 28;
          const lifted = highlight === sector.key;
          const [dx, dy] = lifted ? polar(0, 0, 8, mid) : [0, 0];
          const [lx, ly] = polar(cx, cy, wide ? r * 0.62 : r + 18, mid);
          const [ax, ay] = polar(cx, cy, r, mid);

          return (
            <g
              key={sector.key}
              transform={`translate(${dx} ${dy})`}
              className={lifted ? 'is-highlighted' : undefined}
              onMouseEnter={() => onHighlight?.(sector.key)}
              onMouseLeave={() => onHighlight?.(null)}
              data-ml-ps-sector={sector.key}
            >
              <path d={sectorPath(cx, cy, r, sector.start, sector.end)} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#ffffff" strokeWidth="2" />
              {!wide && <line x1={ax} y1={ay} x2={lx} y2={ly} stroke="#94a3b8" strokeWidth="1" />}
              <text
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                className={wide ? 'sa-ml-ps__pie-label' : 'sa-ml-ps__pie-label sa-ml-ps__pie-label--out'}
              >
                {formatValue(sector.row.value, 2)}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="sa-ml-ps__legend" aria-hidden="true">
        {sectors.map((sector, index) => (
          <li
            key={sector.key}
            className={highlight === sector.key ? 'is-highlighted' : undefined}
            onMouseEnter={() => onHighlight?.(sector.key)}
            onMouseLeave={() => onHighlight?.(null)}
          >
            <span className="sa-ml-ps__swatch" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
            <span dir="ltr" className="sa-ml-ps__legend-value">{formatValue(sector.row.value, 2)}</span>
            <span dir="ltr" className="sa-ml-ps__legend-meta">
              {formatValue(sector.row.frequency * 100, 1)} % · {formatValue(sector.row.angle, 1)}°
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
