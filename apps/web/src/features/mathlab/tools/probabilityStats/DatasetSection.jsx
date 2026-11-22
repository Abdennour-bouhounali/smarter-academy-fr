import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { sorted } from '../../../../lessons/common/stats/statsUtils.js';
import { ExamplePicker } from '../../shared/LabKit.jsx';
import { distributionOf, histogramBins, parseDataset } from './datasetStatistics.js';
import {
  boxPlotNumbers, chartAvailability, classRows, cumulativeSeries, describeDataset, resolveChart,
  rowKeyOfValue, tableGrouping, valueRows,
} from './descriptiveStats.js';
import { DATASET_PRESETS, getDatasetPreset } from './datasetPresets.js';
import SectionFrame from './SectionFrame.jsx';
import DatasetEditor from './DatasetEditor.jsx';
import DatasetChips from './DatasetChips.jsx';
import ChartTypePicker from './ChartTypePicker.jsx';
import DistributionChart from './DistributionChart.jsx';
import PieChart from './PieChart.jsx';
import BoxPlot from './BoxPlot.jsx';
import CumulativeChart from './CumulativeChart.jsx';
import SortedStrip from './SortedStrip.jsx';
import FrequencyTable from './FrequencyTable.jsx';
import StatisticsSummary from './StatisticsSummary.jsx';
import StatisticsExplanations from './StatisticsExplanations.jsx';

/**
 * الإحصاء الوصفي — la série saisie, et TOUT ce qu'elle dit à la fois : le
 * graphique choisi, la série ordonnée avec ses rangs, les indicateurs, le
 * tableau des effectifs. Les quatre vues sont reliées : survoler (ou
 * focaliser) une ligne, une valeur ou une barre éclaire les autres — une
 * seule clé, celle des lignes du tableau (descriptiveStats.valueRows / classRows).
 *
 * Tout ce qui se calcule est mémoïsé sur la série lue ; la saisie ne se relit
 * qu'après 250 ms de calme (dans l'outil).
 */
export default function DatasetSection({
  title, draft, chart, settings, compact, onType, onReplace, onChart, onToggle, features = null,
}) {
  const { t } = useTranslation('mathlab');
  const [highlight, setHighlight] = useState(null);

  const parsed = useMemo(() => parseDataset(draft), [draft]);
  const values = parsed.values;
  const stats = useMemo(() => describeDataset(values), [values]);
  const sortedValues = useMemo(() => sorted(values), [values]);
  const availability = useMemo(() => chartAvailability(values), [values]);
  // Un graphique que le مخبر ne montre pas (la boîte au collège) n'est
  // jamais dessiné : on revient au choix automatique, toujours permis.
  const allowedCharts = features?.charts ?? null;
  const resolved = useMemo(
    () => resolveChart(allowedCharts && chart !== null && !allowedCharts.includes(chart) ? null : chart, values),
    [chart, values, allowedCharts],
  );
  const grouping = tableGrouping(resolved.chart, values);
  const rows = useMemo(() => (grouping === 'classes' ? classRows(values) : valueRows(values)), [grouping, values]);
  const distribution = useMemo(() => {
    if (resolved.chart === 'histogram') return { kind: 'classes', bins: histogramBins(values) };

    return distributionOf(values);
  }, [resolved.chart, values]);
  const cumulative = useMemo(() => cumulativeSeries(values, grouping), [values, grouping]);
  const box = useMemo(() => boxPlotNumbers(values), [values]);
  const pieRows = useMemo(() => (resolved.chart === 'pie' ? valueRows(values) : []), [resolved.chart, values]);

  const rowKeyOf = useCallback((value) => rowKeyOfValue(rows, value), [rows]);
  const highlightValue = useCallback((value) => setHighlight(value === null ? null : rowKeyOfValue(rows, value)), [rows]);
  const activePreset = DATASET_PRESETS.find((preset) => preset.text === draft)?.id ?? null;

  const chartTitle = t(`tools.probabilityStats.charts.aria.${resolved.chart}`, { n: stats.n });
  let chartNode = null;
  if (stats.n === 0) {
    chartNode = <p className="sa-ml-ps__empty" data-ml-ps-chart-empty>{t('tools.probabilityStats.datasetEmpty')}</p>;
  } else if (resolved.chart === 'pie') {
    chartNode = <PieChart rows={pieRows} title={chartTitle} highlight={highlight} onHighlight={setHighlight} compact={compact} />;
  } else if (resolved.chart === 'box') {
    chartNode = <BoxPlot numbers={box} mean={stats.mean} showMean={settings.showMean} title={chartTitle} compact={compact} />;
  } else if (resolved.chart === 'cumulative') {
    chartNode = <CumulativeChart series={cumulative} title={chartTitle} highlight={highlight} onHighlight={setHighlight} compact={compact} />;
  } else {
    chartNode = (
      <DistributionChart
        distribution={distribution}
        summary={stats}
        showMean={settings.showMean}
        showMedian={settings.showMedian}
        title={chartTitle}
        emptyMessage={t('tools.probabilityStats.datasetEmpty')}
        compact={compact}
        highlight={highlight}
        onHighlight={setHighlight}
      />
    );
  }

  const panel = (
    <>
      <ExamplePicker
        examples={DATASET_PRESETS.map((preset) => ({ id: preset.id, level: preset.level, label: t(`tools.probabilityStats.datasetPresets.${preset.id}`) }))}
        activeId={activePreset}
        onPick={(id) => { const preset = getDatasetPreset(id); if (preset) onReplace(preset.text); }}
        dataAttr="data-ml-ps-dataset-example"
      />
      <DatasetEditor
        text={draft}
        invalid={parsed.invalid}
        truncated={parsed.truncated}
        count={values.length}
        onChange={onType}
      />
      <DatasetChips text={draft} onReplace={onReplace} onHighlightValue={highlightValue} />
      <ChartTypePicker active={stats.n > 0 ? resolved.chart : null} availability={availability} fallback={resolved.fallback} onChange={onChart} types={allowedCharts ?? undefined} />
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-markers">
        <h3 id="ml-ps-markers" className="sa-ml-ps__heading">{t('tools.probabilityStats.optionsHeading')}</h3>
        <div className="sa-ml-ps__options">
          <label className="sa-ml-ps__toggle">
            <input type="checkbox" checked={settings.showMean} onChange={() => onToggle('showMean')} data-ml-ps-option="showMean" />
            <span>{t('tools.probabilityStats.showMean')}</span>
          </label>
          <label className="sa-ml-ps__toggle">
            <input type="checkbox" checked={settings.showMedian} onChange={() => onToggle('showMedian')} data-ml-ps-option="showMedian" />
            <span>{t('tools.probabilityStats.showMedian')}</span>
          </label>
        </div>
      </section>
    </>
  );

  const stage = (
    <>
      <h2 className="sa-ml-ps__stage-title">{t('tools.probabilityStats.datasetHeading')}</h2>
      <div className="sa-ml-ps__chart-block" data-ml-ps-chart-kind={stats.n > 0 ? resolved.chart : 'empty'}>{chartNode}</div>
      {stats.n > 0 && (
        <p className="sa-ml-ps__prompt" data-ml-ps-dataset-reading>
          {t('tools.probabilityStats.datasetReading', {
            n: stats.n,
            mean: formatValue(stats.mean, 2),
            median: formatValue(stats.median, 2),
          })}
        </p>
      )}
      <SortedStrip sortedValues={sortedValues} rowKeyOf={rowKeyOf} highlight={highlight} onHighlight={setHighlight} quartiles={!features || features.stats.includes('q1')} />
      <section className="sa-ml-ps__section" aria-labelledby="ml-ps-stats-heading">
        <h3 id="ml-ps-stats-heading" className="sa-ml-ps__heading">{t('tools.probabilityStats.statsHeading')}</h3>
        <StatisticsSummary stats={stats} shown={features?.stats} />
      </section>
      <FrequencyTable
        rows={rows}
        grouping={grouping}
        showAngle={resolved.chart === 'pie'}
        n={stats.n}
        highlight={highlight}
        onHighlight={setHighlight}
      />
      <StatisticsExplanations values={values} stats={stats} shown={features?.explanations} />
    </>
  );

  return <SectionFrame title={title} panel={panel} stage={stage} />;
}
