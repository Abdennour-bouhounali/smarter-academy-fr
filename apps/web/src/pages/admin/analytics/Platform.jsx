import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALE } from '../../../locale';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { AdminPage, AdminSection, btnSecondary } from '../adminUi';
import { LoadingState, ErrorState, MetricUnavailable } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchPlatformAnalytics, fetchLearningAnalytics } from '../../../services/admin/dashboardService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

/** Les quatre fenêtres d'observation. Le libellé vient du catalogue. */
const RANGES = [0, 7, 30, 90];

const isoDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

/** Deux écrans, une seule mécanique — c'est le chargeur qui change. */
export function PlatformAnalytics() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('analytics.platformMetaTitle'));
  return (
    <AnalyticsScreen
      title={t('analytics.platformTitle')}
      subtitle={t('analytics.platformSubtitle')}
      loaderFor={fetchPlatformAnalytics}
      withSeries
    />
  );
}

export function LearningAnalytics() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('analytics.learningMetaTitle'));
  return (
    <AnalyticsScreen
      title={t('analytics.learningTitle')}
      subtitle={t('analytics.learningSubtitle')}
      loaderFor={fetchLearningAnalytics}
    />
  );
}

function AnalyticsScreen({ title, subtitle, loaderFor, withSeries = false }) {
  const { t } = useTranslation('admin');
  const [days, setDays] = useState(30);
  const loader = useCallback(
    (token) => loaderFor(token, { from: isoDaysAgo(days) }),
    [loaderFor, days],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  /** Le libellé arabe d'une mesure, ou sa clé si l'API en sert une inconnue. */
  const metricLabel = (key) => {
    const translated = t(`analytics.metric.${key}`);
    return translated === `analytics.metric.${key}` ? key : translated;
  };

  const rangeLabel = (d) => (d === 0 ? t('analytics.rangeToday') : t('analytics.rangeDays', { count: d }));

  const available = data ? Object.entries(data.metrics).filter(([, m]) => m.available) : [];
  const unavailable = data ? Object.entries(data.metrics).filter(([, m]) => !m.available) : [];

  return (
    <AdminPage
      eyebrow={t('analytics.platformEyebrow')}
      title={title}
      subtitle={subtitle}
      actions={(
        <div className="flex gap-1">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              aria-pressed={days === range}
              className={`${btnSecondary} px-3 py-1.5 text-xs ${
                days === range ? 'border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-50' : ''
              }`}
            >
              {rangeLabel(range)}
            </button>
          ))}
        </div>
      )}
    >
      {loading && <LoadingState label={t('analytics.computing')} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-8">
          <section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {available.map(([key, metric]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {metricLabel(key)}
                  </p>
                  {/* Le chiffre reste LTR au milieu d'une carte arabe, et se
                      formate en `ar-DZ` (chiffres occidentaux, séparateurs
                      locaux) plutôt qu'en `fr-FR`. */}
                  <p dir="ltr" className="mt-1 font-space text-2xl font-black tabular-nums text-slate-900 text-start">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString(LOCALE) : metric.value}
                    {key === 'successRate' && ' %'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {withSeries && data.series && (
            <section className="space-y-5">
              <SeriesChart title={t('analytics.seriesRegistrations')} data={data.series.registrations} color="#3B82F6" />
              <SeriesChart title={t('analytics.seriesLessonCompletions')} data={data.series.lessonCompletions} color="#10B981" />
              <SeriesChart title={t('analytics.seriesReports')} data={data.series.reports} color="#F59E0B" />
            </section>
          )}

          {unavailable.length > 0 && (
            <AdminSection title={t('analytics.unavailableTitle')}>
              <p className="mb-3 font-inter text-sm text-slate-500">
                {t('analytics.unavailableHint')}
              </p>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {unavailable.map(([key, metric]) => (
                  <MetricUnavailable key={key} label={metricLabel(key)} reason={metric.reason} />
                ))}
              </div>
            </AdminSection>
          )}
        </div>
      )}
    </AdminPage>
  );
}

function SeriesChart({ title, data, color }) {
  const { t } = useTranslation('admin');
  const total = data?.reduce((sum, point) => sum + point.value, 0) ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-space text-sm font-bold text-slate-900">{title}</h3>
        <span className="font-inter text-xs text-slate-500">{t('analytics.totalOf', { total })}</span>
      </div>
      {/*
        Le GRAPHIQUE reste en LTR même dans une page arabe : un axe temporel
        se lit du passé vers le futur, et recharts dessine ses axes dans le
        sens du document. Le renverser ferait lire la courbe à l'envers —
        c'est le même principe que `.sa-math-inline` côté élève, où la
        notation garde son sens de lecture. Les libellés, eux, sont arabes.
      */}
      <div dir="ltr" className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false}
              tickFormatter={(value) => value.slice(5)} minTickGap={24}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
              labelFormatter={(value) => new Date(value).toLocaleDateString(LOCALE)}
              formatter={(value) => [value, title]}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} name={title} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
