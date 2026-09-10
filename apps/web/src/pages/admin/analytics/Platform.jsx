import React, { useCallback, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import AdminPage from '../../../components/admin/AdminPage';
import { LoadingState, ErrorState, MetricUnavailable } from '../../../components/admin/ui/states';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchPlatformAnalytics, fetchLearningAnalytics } from '../../../services/admin/dashboardService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const RANGES = [
  { days: 0, label: "Aujourd'hui" },
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
];

const isoDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const LABELS = {
  registrations: 'Inscriptions', totalStudents: 'Élèves inscrits',
  activeToday: "Actifs aujourd'hui", dau: 'Actifs (24 h)', wau: 'Actifs (7 j)', mau: 'Actifs (30 j)',
  lessonStarts: 'Leçons commencées', lessonCompletions: 'Leçons terminées',
  moduleCompletions: 'Modules terminés', practiceSessions: "Séances d'entraînement",
  exerciseAttempts: "Tentatives d'exercice", questionsAnswered: 'Réponses',
  reports: 'Signalements', activeSubscriptions: 'Abonnements actifs',
  expiredSubscriptions: 'Abonnements expirés', sessions: 'Sessions',
  pageViews: 'Pages vues', averageSessionDuration: 'Durée moyenne de session',
  lessonsStarted: 'Leçons commencées', lessonsCompleted: 'Leçons terminées',
  modulesCompleted: 'Modules terminés', exercisesStarted: 'Exercices commencés',
  exercisesCompleted: 'Exercices terminés', correctAnswers: 'Bonnes réponses',
  incorrectAnswers: 'Réponses fausses', successRate: 'Taux de réussite',
  hints: 'Indices demandés', diagnosticsCompleted: 'Diagnostics terminés',
  finalAssessments: 'Tests finaux', evidenceRecorded: 'Preuves enregistrées',
  timeSpent: 'Temps passé', skips: 'Questions passées', abandonment: 'Abandons',
};

/** Deux écrans, une seule mécanique — c'est le chargeur qui change. */
export function PlatformAnalytics() {
  useDocumentMeta('Statistiques plateforme — Administration');
  return <AnalyticsScreen title="Plateforme" subtitle="Inscriptions, activité et volume d’usage." loaderFor={fetchPlatformAnalytics} withSeries />;
}

export function LearningAnalytics() {
  useDocumentMeta('Statistiques apprentissage — Administration');
  return <AnalyticsScreen title="Apprentissage" subtitle="Ce que les élèves font réellement, et comment ils s’en sortent." loaderFor={fetchLearningAnalytics} />;
}

function AnalyticsScreen({ title, subtitle, loaderFor, withSeries = false }) {
  const [days, setDays] = useState(30);
  const loader = useCallback(
    (token) => loaderFor(token, { from: isoDaysAgo(days) }),
    [loaderFor, days],
  );
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);

  const available = data ? Object.entries(data.metrics).filter(([, m]) => m.available) : [];
  const unavailable = data ? Object.entries(data.metrics).filter(([, m]) => !m.available) : [];

  return (
    <AdminPage
      eyebrow="Statistiques"
      title={title}
      subtitle={subtitle}
      actions={(
        <div className="flex gap-1">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              className={`rounded-lg border px-3 py-1.5 font-inter text-xs font-semibold ${
                days === range.days
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    >
      {loading && <LoadingState label="Calcul des statistiques…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-8">
          <section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {available.map(([key, metric]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {LABELS[key] ?? key}
                  </p>
                  <p className="mt-1 font-space text-2xl font-black tabular-nums text-slate-900">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString('fr-FR') : metric.value}
                    {key === 'successRate' && ' %'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {withSeries && data.series && (
            <section className="space-y-5">
              <SeriesChart title="Inscriptions par jour" data={data.series.registrations} color="#3B82F6" />
              <SeriesChart title="Leçons terminées par jour" data={data.series.lessonCompletions} color="#10B981" />
              <SeriesChart title="Signalements par jour" data={data.series.reports} color="#F59E0B" />
            </section>
          )}

          {unavailable.length > 0 && (
            <section>
              <h2 className="mb-1 font-space text-lg font-bold text-slate-900">Mesures non disponibles</h2>
              <p className="mb-3 font-inter text-sm text-slate-500">
                Ces mesures ne sont pas affichées à zéro, parce qu’elles ne valent pas zéro : rien ne les
                enregistre encore. Il n’existe pas de table d’événements dans la plateforme.
              </p>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {unavailable.map(([key, metric]) => (
                  <MetricUnavailable key={key} label={LABELS[key] ?? key} reason={metric.reason} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AdminPage>
  );
}

function SeriesChart({ title, data, color }) {
  const total = data?.reduce((sum, point) => sum + point.value, 0) ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-space text-sm font-bold text-slate-900">{title}</h3>
        <span className="font-inter text-xs text-slate-500">{total} au total</span>
      </div>
      <div className="h-52">
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
              labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} name="" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
