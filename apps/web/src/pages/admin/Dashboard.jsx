import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, UserCheck, BookOpen, Layers, Dumbbell, Flag, CreditCard,
  TriangleAlert, Activity, CircleCheckBig,
} from 'lucide-react';
import StatTile from '../../components/common/StatTile';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { EmptyState } from '../../components/admin/ui/states';
import { useAdminResource } from '../../hooks/useAdminResource';
import { fetchDashboard } from '../../services/admin/dashboardService';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { AdminPage, AdminSection, AdminCard, Loading, ErrorBox, Num, formatDate } from './adminUi';
import AdminNotifications from './notifications/AdminNotifications';
import RegistrationCard from '../../components/admin/RegistrationCard';
import PaymentsSwitchCard from '../../components/admin/PaymentsSwitchCard';

/**
 * La phrase d'une alerte, écrite ICI et non par le serveur.
 *
 * Le serveur envoie un `kind` et des `params` ; la phrase est arabe et vient
 * du catalogue. Il renvoie aussi un `label` français, gardé comme FILET : si
 * un jour il invente un `kind` que cette version ne connaît pas, mieux vaut
 * une phrase française qu'une ligne vide. Voir DashboardService::alerts().
 */
function useAlertLabel() {
  const { t } = useTranslation('admin');

  return (alert) => {
    const key = `dashboard.alerts.${alert.kind}`;
    if (!alert.kind || !alert.params) return alert.label;

    // « où » se dit de deux façons : l'exercice quand on le connaît, sinon la
    // vedette du module. Le serveur donne les deux ; la phrase se compose ici.
    // `count` est ce sur quoi i18next choisit la forme du pluriel. Chaque
    // alerte compte quelque chose de différent : le nombre de bulletins pour
    // les unes, le nombre de réponses pour « faible réussite ».
    const params = { ...alert.params };
    if (alert.kind === 'low_success_exercise') params.count = alert.params.total;
    if (alert.kind === 'repeated_reports') {
      params.where = alert.params.exerciseCode
        ? t('dashboard.alerts.whereExercise', { code: alert.params.exerciseCode })
        : (alert.params.moduleNumber != null
          ? t('dashboard.alerts.whereModule', { number: alert.params.moduleNumber })
          : t('dashboard.alerts.whereModuleUnknown'));
    }

    const text = t(key, params);
    // i18next rend la CLÉ quand elle manque : on retombe alors sur le filet.
    return text === key ? alert.label : text;
  };
}

/**
 * L'accueil du panneau — « Tableau de bord ».
 *
 * Les tuiles sont `StatTile`, le MÊME composant que « Ma progression » et l'accueil de
 * l'espace élève : c'est déjà la carte de verre du produit (`.glass-card`), et
 * la réutiliser garantit qu'un indicateur d'administration ne pèse pas plus
 * qu'un indicateur élève. Rien à dupliquer ici.
 *
 * Les quatre cartes du bas ne montrent QUE ce que le serveur renvoie — aucune
 * mesure inventée : ce que l'API ne mesure pas n'apparaît pas.
 */
export default function AdminDashboard() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('dashboard.metaTitle'));

  const { data, loading, error, reload } = useAdminResource(fetchDashboard);
  const alertLabel = useAlertLabel();

  return (
    <AdminPage
      eyebrow={t('dashboard.eyebrow')}
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
    >
      {/* Notifications sur le téléphone : inscriptions, messages, signalements, commandes… (BOOKS_STORE.md §6quater). */}
      <AdminNotifications />
      {/* « Inscriptions » : ouvrir / fermer l'inscription publique — hors des données du tableau de bord, pour rester
          visible et utilisable même quand celles-ci ne chargent pas. */}
      <RegistrationCard />
      {/* « Paiement en ligne » : the payments switch (FRANCE_REBUILD_PLAN.md §4ter), beside the registration switch. */}
      <PaymentsSwitchCard />
      {loading && <Loading label={t('dashboard.loading')} />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-8">
          <section>
            <h2 className="sr-only">{t('dashboard.kpisTitle')}</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile icon={Users} value={data.kpis.totalStudents} label={t('dashboard.totalStudents')} accent="bg-blue-50 text-blue-600" />
              <StatTile icon={UserCheck} value={data.kpis.activeToday} label={t('dashboard.activeToday')} accent="bg-emerald-50 text-emerald-600" />
              <StatTile icon={Activity} value={data.kpis.newRegistrations7d} label={t('dashboard.newRegistrations')} accent="bg-violet-50 text-violet-600" />
              <StatTile icon={Flag} value={data.kpis.pendingReports} label={t('dashboard.pendingReports')} accent="bg-amber-50 text-amber-600" />

              <StatTile
                icon={BookOpen}
                value={data.kpis.publishedLessons}
                label={t('dashboard.publishedLessons')}
                accent="bg-emerald-50 text-emerald-600"
                hint={t('dashboard.lessonsHint', { hidden: data.kpis.hiddenLessons, draft: data.kpis.draftLessons })}
              />
              <StatTile icon={Layers} value={data.kpis.totalModules} label={t('dashboard.totalModules')} accent="bg-blue-50 text-blue-600" />
              <StatTile icon={Dumbbell} value={data.kpis.totalExercises} label={t('dashboard.totalExercises')} accent="bg-slate-100 text-slate-600" />
              <StatTile icon={CircleCheckBig} value={data.kpis.questionsAnswered} label={t('dashboard.questionsAnswered')} accent="bg-violet-50 text-violet-600" />

              <StatTile icon={UserCheck} value={data.kpis.suspendedStudents} label={t('dashboard.suspendedStudents')} accent="bg-amber-50 text-amber-600" />
              <StatTile icon={CreditCard} value={data.kpis.activeSubscriptions} label={t('dashboard.activeSubscriptions')} accent="bg-emerald-50 text-emerald-600" />
              <StatTile icon={CreditCard} value={data.kpis.expiredSubscriptions} label={t('dashboard.expiredSubscriptions')} accent="bg-slate-100 text-slate-600" />
              <StatTile icon={Dumbbell} value={data.kpis.exerciseAttempts} label={t('dashboard.exerciseAttempts')} accent="bg-blue-50 text-blue-600" />
            </div>
          </section>

          <AdminSection title={t('dashboard.alertsTitle')}>
            {data.alerts.length === 0 ? (
              <EmptyState
                icon={CircleCheckBig}
                title={t('dashboard.noAlertsTitle')}
                hint={t('dashboard.noAlertsHint')}
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
                      {/* Icône SÉMANTIQUE (avertissement) : jamais mise en miroir. */}
                      <TriangleAlert
                        size={17}
                        className={alert.severity === 'critical' ? 'mt-0.5 text-rose-600' : 'mt-0.5 text-amber-600'}
                      />
                      <span className={`font-inter text-sm ${alert.severity === 'critical' ? 'text-rose-900' : 'text-amber-900'}`}>
                        {alertLabel(alert)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminSection>

          {/* `[&>*]:min-w-0` : une cellule de grille ne rétrécit pas sous son contenu par défaut —
              un titre long (tronqué) élargissait la page de 21 px sur téléphone et la décalait. */}
          <section className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
            <RecentCard title={t('dashboard.recentReports')} empty={t('dashboard.recentReportsEmpty')}>
              {data.recent.reports.map((report) => (
                <li key={report.id} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/admin/signalements/${report.id}`} className="min-w-0 flex-1 hover:underline">
                    <p className="truncate font-inter text-xs font-semibold text-slate-800">
                      {report.lesson?.title ?? report.lesson_code ?? t('dashboard.unknownContent')}
                    </p>
                    <p className="truncate font-inter text-xs text-slate-500">{report.note || t('dashboard.noMessage')}</p>
                  </Link>
                  <StatusBadge status={report.status} />
                </li>
              ))}
            </RecentCard>

            <RecentCard title={t('dashboard.recentRegistrations')} empty={t('dashboard.recentRegistrationsEmpty')}>
              {data.recent.registrations.map((student) => (
                <li key={student.id} className="flex items-center justify-between gap-3 py-2">
                  <Link to={`/admin/eleves/${student.id}`} className="min-w-0 flex-1 hover:underline">
                    {/* Le courriel est une identité TECHNIQUE : LTR, toujours. */}
                    <p className="truncate font-inter text-xs font-semibold text-slate-800" dir="ltr">{student.email}</p>
                    <p className="font-inter text-xs text-slate-500">{student.grade ?? t('dashboard.noGrade')}</p>
                  </Link>
                  <span className="shrink-0 font-inter text-xs text-slate-400">
                    <Num>{formatDate(student.created_at, { withTime: true })}</Num>
                  </span>
                </li>
              ))}
            </RecentCard>

            <RecentCard title={t('dashboard.recentContentChanges')} empty={t('dashboard.recentContentChangesEmpty')}>
              {data.recent.contentChanges.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-2">
                  {/* `action` et `entity_type` sont des identifiants TECHNIQUES
                      du journal (lesson.published, chapter…) : ils restent tels
                      quels, isolés en LTR, comme PGCD ou CSV ailleurs. */}
                  <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700" dir="ltr">
                    {log.action} · {log.entity_type} #{log.entity_id}
                  </span>
                  <span className="shrink-0 font-inter text-xs text-slate-400">
                    <Num>{formatDate(log.created_at, { withTime: true })}</Num>
                  </span>
                </li>
              ))}
            </RecentCard>

            <RecentCard title={t('dashboard.recentCompletions')} empty={t('dashboard.recentCompletionsEmpty')}>
              {data.recent.completions.map((row) => (
                <li key={`${row.user_id}-${row.lesson_id}`} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">
                    {row.lesson?.title ?? '—'}
                  </span>
                  <span className="shrink-0 font-inter text-xs text-slate-400">
                    <Num>{formatDate(row.completed_at, { withTime: true })}</Num>
                  </span>
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
    <AdminCard title={title}>
      {items.length === 0 ? (
        <p className="py-4 text-center font-inter text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">{items}</ul>
      )}
    </AdminCard>
  );
}
