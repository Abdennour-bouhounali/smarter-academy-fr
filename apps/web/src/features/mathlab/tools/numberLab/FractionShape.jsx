import { useTranslation } from 'react-i18next';
import { fracToText, fracToNumber } from './fraction.js';

/**
 * UNE FRACTION DESSINÉE — barre, disque (§8), et les parts qu'on COUPE (§9).
 *
 * Les trois représentations de §8 vivent ici et lisent la MÊME fraction :
 * elles ne peuvent donc pas se contredire. `highlight` sert à §12 — quand on
 * met au dénominateur commun, les parts nouvellement découpées s'éclairent
 * pour qu'on voie d'où viennent les douzièmes.
 *
 * `grid` (« توحيد المقامات ») : le nombre de parts FINES par unité — le PPCM des
 * dénominateurs. Les coupes de la fraction restent en trait plein ; les
 * nouvelles coupes, en pointillé orange, montrent que chaque part se divise
 * EXACTEMENT en `grid / d` parts fines (le PPCM « tombe juste » sur les deux).
 *
 * `onSplit` fait de la barre un objet MANIPULABLE (§9) : cliquer une part la
 * coupe en deux, et l'élève voit `1/2 = 2/4` sans qu'on le lui dise.
 */

const BAR_HEIGHT = 58;
const CIRCLE_R = 62;

export default function FractionShape({
  frac,
  model = 'bar',
  tone = 'primary',
  highlight = null,
  onSplit = null,
  width = 320,
  label = null,
  showLabel = true,
  grid = null,
}) {
  const { t } = useTranslation('mathlab');
  if (!frac || frac.d <= 0) return null;

  const total = frac.d;
  const filled = Math.max(0, Math.min(total, Math.abs(frac.n)));
  // Un kesr supérieur à 1 : on dessine plusieurs unités côte à côte (§8).
  const units = Math.max(1, Math.ceil(Math.abs(frac.n) / frac.d));
  const text = label ?? fracToText(frac);

  const describe = t(
    model === 'circle' ? 'tools.numberLab.fractions.circleLabel' : 'tools.numberLab.fractions.barLabel',
    { total, filled: Math.abs(frac.n) },
  );

  if (model === 'circle') {
    return (
      <figure className="sa-ml-nb__shape sa-ml-nb__shape--circle">
        <svg viewBox="0 0 160 160" width={Math.min(width, 180)} height={Math.min(width, 180)} role="img" aria-label={describe}>
          {Array.from({ length: total }, (_, index) => {
            const start = (index / total) * Math.PI * 2 - Math.PI / 2;
            const end = ((index + 1) / total) * Math.PI * 2 - Math.PI / 2;
            const isFilled = index < filled;
            const isNew = Array.isArray(highlight) && highlight.includes(index);

            return (
              <path
                key={index}
                d={sectorPath(80, 80, CIRCLE_R, start, end)}
                className={`sa-ml-nb__slice${isFilled ? ' is-filled' : ''}${isNew ? ' is-new' : ''} sa-ml-nb__slice--${tone}`}
                onClick={onSplit ? () => onSplit(index) : undefined}
                style={onSplit ? { cursor: 'pointer' } : undefined}
              />
            );
          })}
          {fineCuts(grid, total).map((k) => {
            const angle = (k / grid) * Math.PI * 2 - Math.PI / 2;

            return (
              <line
                key={`g-${k}`}
                x1={80}
                y1={80}
                x2={80 + CIRCLE_R * Math.cos(angle)}
                y2={80 + CIRCLE_R * Math.sin(angle)}
                className="sa-ml-nb__grid-cut"
              />
            );
          })}
        </svg>
        {showLabel && <figcaption className="sa-ml-nb__shape-caption">{text}</figcaption>}
      </figure>
    );
  }

  if (model === 'line') {
    // Le modèle « mostaqim » : la fraction posée sur une unité graduée.
    const value = fracToNumber(frac);

    return (
      <figure className="sa-ml-nb__shape sa-ml-nb__shape--line">
        <svg viewBox={`0 0 ${width} 56`} width="100%" height={56} role="img" aria-label={describe}>
          <line x1={12} x2={width - 12} y1={34} y2={34} className="sa-ml-nb__axis" />
          {Array.from({ length: total * units + 1 }, (_, index) => {
            const x = 12 + (index / (total * units)) * (width - 24);

            return <line key={index} x1={x} x2={x} y1={28} y2={40} className="sa-ml-nb__tick sa-ml-nb__tick--minor" />;
          })}
          {grid && Array.from({ length: units }, (_, unit) => fineCuts(grid, total).map((k) => {
            const x = 12 + ((unit + k / grid) / units) * (width - 24);

            return <line key={`g-${unit}-${k}`} x1={x} x2={x} y1={30} y2={38} className="sa-ml-nb__grid-cut" />;
          }))}
          {Array.from({ length: units + 1 }, (_, index) => {
            const x = 12 + (index / units) * (width - 24);

            return (
              <g key={`u-${index}`}>
                <line x1={x} x2={x} y1={24} y2={44} className="sa-ml-nb__tick" />
                <text x={x} y={54} className="sa-ml-nb__tick-label" textAnchor="middle">{index}</text>
              </g>
            );
          })}
          <circle
            cx={12 + (value / units) * (width - 24)}
            cy={34}
            r={8}
            className={`sa-ml-nb__point-dot sa-ml-nb__point--${tone}`}
          />
          <text x={12 + (value / units) * (width - 24)} y={16} className="sa-ml-nb__point-label" textAnchor="middle">{text}</text>
        </svg>
      </figure>
    );
  }

  // Le modèle « barre » : le plus manipulable, et celui de §12.
  const segmentWidth = (width - 4) / (total * units);

  return (
    <figure className="sa-ml-nb__shape sa-ml-nb__shape--bar">
      <svg viewBox={`0 0 ${width} ${BAR_HEIGHT}`} width="100%" height={BAR_HEIGHT} role="img" aria-label={describe}>
        {Array.from({ length: total * units }, (_, index) => {
          const isFilled = index < Math.abs(frac.n);
          const isNew = Array.isArray(highlight) && highlight.includes(index);

          return (
            <rect
              key={index}
              x={2 + index * segmentWidth}
              y={6}
              width={Math.max(1, segmentWidth - 1.5)}
              height={BAR_HEIGHT - 12}
              rx={3}
              className={`sa-ml-nb__segment${isFilled ? ' is-filled' : ''}${isNew ? ' is-new' : ''} sa-ml-nb__segment--${tone}`}
              onClick={onSplit ? () => onSplit(index) : undefined}
              style={onSplit ? { cursor: 'pointer' } : undefined}
            >
              {onSplit && <title>{t('tools.numberLab.fractions.split')}</title>}
            </rect>
          );
        })}
        {grid && Array.from({ length: units }, (_, unit) => fineCuts(grid, total).map((k) => {
          const x = 2 + ((unit + k / grid) / units) * (width - 4);

          return <line key={`g-${unit}-${k}`} x1={x} x2={x} y1={8} y2={BAR_HEIGHT - 8} className="sa-ml-nb__grid-cut" />;
        }))}
      </svg>
      {showLabel && <figcaption className="sa-ml-nb__shape-caption">{text}</figcaption>}
    </figure>
  );
}

/**
 * Les coupes FINES qui ne sont pas déjà des coupes de la fraction : k/grid pour
 * k = 1 … grid − 1, sauf là où k/grid est un multiple de 1/d. Vide si `grid`
 * n'est pas un multiple de `d` (il ne tomberait pas juste — ce n'est pas un
 * dénominateur commun) ou s'il est trop grand pour être dessiné lisiblement.
 */
export function fineCuts(grid, d) {
  if (!grid || !d || grid % d !== 0 || grid > 120) return [];
  const step = grid / d;
  const cuts = [];
  for (let k = 1; k < grid; k += 1) if (k % step !== 0) cuts.push(k);

  return cuts;
}

/** Un secteur de disque : le chemin SVG d'une part de tarte. */
function sectorPath(cx, cy, r, start, end) {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  // Un seul secteur qui fait le tour complet : un cercle, pas un arc dégénéré.
  if (Math.abs(end - start - Math.PI * 2) < 1e-9) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}
