import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { MATH_LAB_TOOLS } from '../toolRegistry';
import { WORK_LABS, WORK_PERIODS, DEFAULT_WORK_FILTERS } from './workFilters';
import { isLabScope, toolInScope } from '../labScope';

/**
 * Les filtres de « أعمالي ». Le MÊME panneau sert la colonne de bureau et la
 * feuille de téléphone (§11) : un seul jeu de commandes à tenir juste.
 *
 * Les instruments proposés sont ceux du REGISTRE (§8) — jamais une liste
 * écrite à la main, jamais un instrument qui n'existe pas. Chacun porte le
 * nombre de travaux qu'il contient : un filtre qui ne donnerait rien se voit
 * avant d'être cliqué.
 *
 * Le premier filtre est le مخبر (labScope.js) : l'architecture du مختبر
 * elle-même. Un مخبر choisi, seuls ses instruments restent proposés — et
 * celui qu'on avait déjà coché, pour pouvoir le décocher.
 *
 * @param {Record<string, number>} counts     combien de travaux par instrument
 * @param {Record<string, number>} labCounts  combien de travaux par مخبر
 */
export default function WorkFilterPanel({ filters, counts = {}, labCounts = {}, total = 0, onChange, onReset }) {
  const { t } = useTranslation('mathlab');
  const f = (key, opts) => t(`work.filters.${key}`, opts);
  const set = (patch) => onChange?.({ ...filters, ...patch });
  const lab = isLabScope(filters.lab) ? filters.lab : null;
  const tools = lab
    ? MATH_LAB_TOOLS.filter((tool) => toolInScope(tool, lab) || tool.id === filters.tool)
    : MATH_LAB_TOOLS;

  return (
    <div className="sa-mlw-filters" data-ml-work-filters>
      <fieldset className="sa-mlw-fieldset">
        <legend>{f('labLegend')}</legend>
        <div className="sa-mlw-chips">
          {WORK_LABS.map((value) => (
            <button
              key={value}
              type="button"
              className="sa-mlw-chip"
              aria-pressed={(filters.lab ?? 'all') === value}
              onClick={() => set({ lab: value })}
              data-ml-work-lab={value}
            >
              {f(`labs.${value}`)}
              <span className="sa-mlw-chip__count">{value === 'all' ? total : (labCounts[value] ?? 0)}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sa-mlw-fieldset">
        <legend>{f('toolLegend')}</legend>
        <div className="sa-mlw-chips">
          <button
            type="button"
            className="sa-mlw-chip"
            aria-pressed={!filters.tool || filters.tool === 'all'}
            onClick={() => set({ tool: 'all' })}
            data-ml-work-tool="all"
          >
            {f('allTools')} <span className="sa-mlw-chip__count">{total}</span>
          </button>
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <button
                key={tool.id}
                type="button"
                className="sa-mlw-chip"
                aria-pressed={filters.tool === tool.id}
                onClick={() => set({ tool: filters.tool === tool.id ? 'all' : tool.id })}
                data-ml-work-tool={tool.id}
              >
                <Icon size={14} aria-hidden="true" /> {t(tool.labelKey)}
                <span className="sa-mlw-chip__count">{counts[tool.id] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="sa-mlw-fieldset">
        <legend>{f('periodLegend')}</legend>
        <div className="sa-mlw-chips">
          {WORK_PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              className="sa-mlw-chip"
              aria-pressed={(filters.period ?? 'all') === period}
              onClick={() => set({ period })}
              data-ml-work-period={period}
            >
              {f(`periods.${period}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sa-mlw-fieldset">
        <legend>{f('otherLegend')}</legend>
        <button
          type="button"
          className="sa-mlw-chip"
          aria-pressed={filters.favorite === true}
          onClick={() => set({ favorite: !filters.favorite })}
          data-ml-work-favorites
        >
          <Star size={14} aria-hidden="true" fill={filters.favorite ? 'currentColor' : 'none'} /> {f('favorites')}
        </button>
      </fieldset>

      <button type="button" className="sa-mlw-btn sa-mlw-btn--ghost w-full" onClick={() => onReset?.(DEFAULT_WORK_FILTERS)} data-ml-work-reset>
        {f('reset')}
      </button>
    </div>
  );
}
