import { useTranslation } from 'react-i18next';
import { formatAxisLabel, formatValue } from '../functionGrapher/grapherFormat.js';
import { regionPoints, sigmaTicks } from './normalDistribution.js';

/**
 * LA CLOCHE — la densité de N(μ, σ²) (échelle X) ou de N(0, 1) (échelle Z),
 * avec la région de la probabilité demandée OMBRÉE (et hachurée : la
 * couleur n'est pas seule), μ en trait plein, les repères μ ± σ, ± 2σ, ± 3σ,
 * et les bornes x (ou a, b) en orange avec leur valeur et leur z.
 *
 * La courbe est échantillonnée UNE fois par (μ, σ, échelle) dans la
 * section (`sampleCurve`) ; ici on ne fait que placer des points. L'aire
 * change en douceur (transition CSS de `d`), sauf en mouvement réduit.
 *
 * Le dessin SUIT le calcul déroulé (NormalSection) : la courbe et les bornes
 * sont la question, toujours là ; la valeur z d'une borne n'est écrite que
 * lorsque `revealZ` la contient, l'aire n'est ombrée que si `showArea`.
 */

const HEIGHT = 300;
const PAD = { top: 34, right: 18, bottom: 64, left: 18 };

export default function NormalCurve({
  curve, params, result, interval, compact, title, revealZ = null, showArea = true,
}) {
  const { t } = useTranslation('mathlab');
  const width = compact ? 440 : 720;
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const { mu, sigma, scale } = params;
  const baseline = PAD.top + plotH;
  const x = (tv) => PAD.left + ((tv - curve.from) / (curve.to - curve.from)) * plotW;
  const y = (density) => baseline - (density / (curve.peak * 1.12)) * plotH;
  const toScale = (value) => (scale === 'z' ? (value - mu) / sigma : value);

  const line = curve.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(2)} ${y(p.y).toFixed(2)}`).join(' ');
  const region = regionPoints(curve, interval, mu, sigma, scale);
  const area = showArea && region.length > 0
    ? `M ${x(region[0].t).toFixed(2)} ${baseline} ${region.map((p) => `L ${x(p.t).toFixed(2)} ${y(p.y).toFixed(2)}`).join(' ')} L ${x(region[region.length - 1].t).toFixed(2)} ${baseline} Z`
    : null;

  const bounds = params.query === 'between'
    ? [{ key: 'a', name: 'a', value: params.a, z: result?.za }, { key: 'b', name: 'b', value: params.b, z: result?.zb }]
    : [{ key: 'x', name: 'x', value: params.x, z: result?.z }];
  const ticks = sigmaTicks(mu, sigma, scale);
  const inFrame = (tv) => tv >= curve.from && tv <= curve.to;

  return (
    <svg
      className="sa-ml-ps__chart sa-ml-ps__chart--normal"
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      dir="ltr"
      data-ml-ps-normal-curve={scale}
    >
      <defs>
        <pattern id="ml-ps-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#008443" strokeWidth="2" strokeOpacity="0.35" />
        </pattern>
      </defs>

      {area && (
        <g data-ml-ps-normal-area>
          <path d={area} className="sa-ml-ps__normal-area" />
          <path d={area} fill="url(#ml-ps-hatch)" className="sa-ml-ps__normal-area-hatch" />
        </g>
      )}

      {/* Les repères μ + kσ, et μ en trait plein. */}
      {ticks.map((tick) => (
        <g key={tick.k} data-ml-ps-normal-tick={tick.k}>
          <line
            x1={x(tick.t)}
            y1={tick.k === 0 ? PAD.top - 8 : baseline - 6}
            x2={x(tick.t)}
            y2={baseline + 6}
            className={tick.k === 0 ? 'sa-ml-ps__normal-mu' : 'sa-ml-ps__normal-tick'}
          />
          <text x={x(tick.t)} y={baseline + 20} textAnchor="middle" className="sa-ml-ps__chart-label">
            {formatAxisLabel(Number(tick.t.toPrecision(6)))}
          </text>
          {/* Sur un téléphone, ± 3σ gardent leur nombre mais pas leur nom : ils se chevaucheraient. */}
          {!(compact && Math.abs(tick.k) === 3) && (
            <text x={x(tick.t)} y={baseline + 36} textAnchor="middle" className="sa-ml-ps__normal-sigma-label">
              {sigmaName(tick.k)}
            </text>
          )}
        </g>
      ))}

      <path d={line} className="sa-ml-ps__normal-line" />
      <line x1={PAD.left} y1={baseline} x2={PAD.left + plotW} y2={baseline} stroke="#475569" strokeWidth="1.5" />

      {bounds.map((bound) => {
        const tv = toScale(bound.value);
        if (!inFrame(tv)) return null;

        return (
          <g key={bound.key} data-ml-ps-normal-bound={bound.key}>
            <line x1={x(tv)} y1={PAD.top - 4} x2={x(tv)} y2={baseline} className="sa-ml-ps__normal-bound" />
            <text
              x={Math.min(width - 70, Math.max(70, x(tv)))}
              y={PAD.top - 10 - (bound.key === 'b' ? 0 : bounds.length > 1 ? 14 : 0)}
              textAnchor="middle"
              className="sa-ml-ps__normal-bound-label"
            >
              {bound.name} = {formatValue(bound.value, 2)}
              {Number.isFinite(bound.z) && (!revealZ || revealZ.has(bound.key)) ? `  (z = ${formatValue(bound.z, 2)})` : ''}
            </text>
          </g>
        );
      })}

      {/* Une phrase ARABE dans un SVG posé en LTR : sans son propre sens,
          le bidi la brouille (« …المطلوبX منحنى كثافة »). Ancrée à droite. */}
      <text x={width - PAD.right} y={HEIGHT - 6} direction="rtl" textAnchor="start" className="sa-ml-ps__chart-legend">
        {t(scale === 'z' ? 'tools.probabilityStats.normal.legendZ' : 'tools.probabilityStats.normal.legendX')}
      </text>
    </svg>
  );
}

/** Le nom du repère : « μ », « μ − 2σ »… — sous le nombre, dans les deux échelles. */
function sigmaName(k) {
  if (k === 0) return 'μ';
  const sign = k < 0 ? '−' : '+';
  const m = Math.abs(k) === 1 ? '' : Math.abs(k);

  return `μ ${sign} ${m}σ`;
}
