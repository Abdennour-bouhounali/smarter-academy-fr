import { useTranslation } from 'react-i18next';
import { BarChart3, BarChartBig, CandlestickChart, LineChart, PieChart } from 'lucide-react';
import { CHART_TYPES } from './descriptiveStats.js';

const ICONS = { bars: BarChart3, histogram: BarChartBig, pie: PieChart, box: CandlestickChart, cumulative: LineChart };

/**
 * Le CHOIX DU GRAPHIQUE. Un graphique que la série ne permet pas est
 * DÉSACTIVÉ avec sa raison écrite dessous (descriptiveStats.chartAvailability) —
 * jamais dessiné faux en silence.
 */
export default function ChartTypePicker({ active, availability, fallback, onChange, types = CHART_TYPES }) {
  const { t } = useTranslation('mathlab');
  // `types` : ceux que le مخبر montre (scope.js) — la boîte n'existe pas au collège.
  const refused = types.filter((type) => !availability[type].available && availability[type].reason !== 'empty');

  return (
    <section className="sa-ml-ps__section" aria-labelledby="ml-ps-chart-heading">
      <h3 id="ml-ps-chart-heading" className="sa-ml-ps__heading">{t('tools.probabilityStats.charts.heading')}</h3>
      <div className="sa-ml-ps__chart-types" role="group" aria-labelledby="ml-ps-chart-heading">
        {types.map((type) => {
          const Icon = ICONS[type];
          const { available, reason } = availability[type];

          return (
            <button
              key={type}
              type="button"
              className={`sa-ml-ps__chart-type${active === type ? ' is-active' : ''}`}
              aria-pressed={active === type}
              disabled={!available}
              title={available ? undefined : t(`tools.probabilityStats.charts.reasons.${reason}`)}
              onClick={() => onChange(type)}
              data-ml-ps-chart-type={type}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{t(`tools.probabilityStats.charts.types.${type}`)}</span>
            </button>
          );
        })}
      </div>
      {refused.map((type) => (
        <p key={type} className="sa-ml-ps__hint" data-ml-ps-chart-reason={type}>
          {t('tools.probabilityStats.charts.unavailable', {
            chart: t(`tools.probabilityStats.charts.types.${type}`),
            reason: t(`tools.probabilityStats.charts.reasons.${availability[type].reason}`),
          })}
        </p>
      ))}
      {fallback && <p className="sa-ml-ps__hint" role="status" data-ml-ps-chart-fallback>{t('tools.probabilityStats.charts.fallback')}</p>}
    </section>
  );
}
