import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, BookOpen, Layers, Dumbbell, Flag, CreditCard,
  TriangleAlert, Activity, CircleCheckBig,
} from 'lucide-react';
import AdminPage from '../../components/admin/AdminPage';
import StatTile from '../../components/common/StatTile';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/admin/ui/states';
import { useAdminResource } from '../../hooks/useAdminResource';
import { fetchDashboard } from '../../services/admin/dashboardService';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');

export default function AdminDashboard() {
  useDocumentMeta('Tableau de bord — Administration');

  const { data, loading, error, reload } = useAdminResource(fetchDashboard);

  return (
    <AdminPage
      eyebrow="Vue d'ensemble"
      title="Tableau de bord"
      subtitle="Ce qui se passe sur la plateforme, maintenant."
    >
      {loading && <LoadingState label="Chargement du tableau de bord…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="sr-only">Indicateurs</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile icon={Users} value={data.kpis.totalStudents} label="Élèves inscrits" accent="bg-blue-50 text-blue-600" />
              <StatTile icon={UserCheck} value={data.kpis.activeToday} label="Actifs aujourd’hui" accent="bg-emerald-50 text-emerald-600" />
              <StatTile icon={Activity} value={data.kpis.newRegistrations7d} label="Inscriptions (7 j)" accent="bg-violet-50 text-violet-600" />
              <StatTile icon={Flag} value={data.kpis.pendingReports} label="Signalements à traiter" accent="bg-amber-50 text-amber-600" />

              <StatTile icon={BookOpen} value={data.kpis.publishedLessons} label="Leçons publiées" accent="bg-emerald-50 text-emerald-600" hint={`${data.kpis.hiddenLessons} masquée(s), ${data.kpis.draftLessons} brouillon(s)`} />
              <StatTile icon={Layers} value={data.kpis.totalModules} label="Modules" accent="bg-blue-50 text-blue-600" />
              <StatTile icon={Dumbbell} value={data.kpis.totalExercises} label="Exercices" accent="bg-slate-100 text-slate-600" />
              <StatTile icon={CircleCheckBig} value={data.kpis.questionsAnswered} label="Réponses enregistrées" accent="bg-violet-50 text-violet-600" />

              <StatTile icon={UserCheck} value={data.kpis.suspendedStudents} label="Comptes suspendus" accent="bg-amber-50 text-amber-600" />
              <StatTile icon={CreditCard} value={data.kpis.activeSubscriptions} label="Abonnements actifs" accent="bg-emerald-50 text-emerald-600" />
              <StatTile icon={CreditCard} value={data.kpis.expiredSubscriptions} label="Abonnements expirés" accent="bg-slate-100 text-slate-600" />
              <StatTile icon={Dumbbell} value={data.kpis.exerciseAttempts} label="Tentatives d’exercice" accent="bg-blue-50 text-blue-600" />
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">Alertes</h2>
            {data.alerts.length === 0 ? (
              <EmptyState
                icon={CircleCheckBig}
                title="Rien à signaler"
                hint="Aucun signalement prioritaire, aucun contenu manifestement en difficulté."
              />
            ) : (
              <ul className="space-y-2">
                {data.alerts.map((alert, index) => (
                  <li key={`${alert.kind}-${index}`}>
                    <Link
                      to={alert.link}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                        alert.severity === 'critical'
                          ? 'border-rose-200 bg-rose-50 hover:bg-rose-100'
                          : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      <TriangleAlert
                        size={17}
                        className={alert.severity === 'critical' ? 'mt-0.5 text-rose-600' : 'mt-0.5 text-amber-600'}
                      />
                      <span className={`font-inter text-sm ${alert.severity === 'critical' ? 'text-rose-900' : 'text-amber-900'}`}>
                        {alert.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <RecentCard title="Derniers signalements" empty="Aucun signalement.">
              {data.recent.reports.map((report) => (
                <li key={report.id} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/admin/signalements/${report.id}`} className="min-w-0 flex-1 hover:underline">
                    <p className="truncate font-inter text-xs font-semibold text-slate-800">
                      {report.lesson?.title ?? report.lesson_code ?? 'Contenu inconnu'}
                    </p>
                    <p className="truncate font-inter text-xs text-slate-500">{report.note || 'Sans message'}</p>
                  </Link>
                  <StatusBadge status={report.status} />
                </li>
              ))}
            </RecentCard>

            <RecentCard title="Dernières inscriptions" empty="Aucune inscription.">
              {data.recent.registrations.map((student) => (
                <li key={student.id} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/admin/eleves/${student.id}`} className="min-w-0 flex-1 hover:underline">
                    <p className="truncate font-inter text-xs font-semibold text-slate-800">{student.email}</p>
                    <p className="font-inter text-xs text-slate-500">{student.grade ?? 'Classe non choisie'}</p>
                  </Link>
                  <span className="shrink-0 font-inter text-xs text-slate-400">{formatDate(student.created_at)}</span>
                </li>
              ))}
            </RecentCard>

            <RecentCard title="Derniers changements de contenu" empty="Aucun changement enregistré.">
              {data.recent.contentChanges.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">
                    {log.action} · {log.entity_type} #{log.entity_id}
                  </span>
                  <span className="shrink-0 font-inter text-xs text-slate-400">{formatDate(log.created_at)}</span>
                </li>
              ))}
            </RecentCard>

            <RecentCard title="Dernières leçons terminées" empty="Aucune leçon terminée.">
              {data.recent.completions.map((row) => (
                <li key={`${row.user_id}-${row.lesson_id}`} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">
                    {row.lesson?.title ?? '—'}
                  </span>
                  <span className="shrink-0 font-inter text-xs text-slate-400">{formatDate(row.completed_at)}</span>
                </li>
              ))}
            </RecentCard>
          </section>
        </div>
      )}
    </AdminPage>
  );
}

function RecentCard({ title, empty, children }) {
  const items = React.Children.toArray(children);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 font-space text-sm font-bold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="py-4 text-center font-inter text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">{items}</ul>
      )}
    </div>
  );
}
