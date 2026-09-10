import React, { useCallback, useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheckBig, Dumbbell, Target, Percent } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import StatTile from '../../../components/common/StatTile';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import DataTable from '../../../components/admin/ui/DataTable';
import { LoadingState, ErrorState, EmptyState, MetricUnavailable } from '../../../components/admin/ui/states';
import { ConfirmDialog } from '../../../components/admin/ui/Modal';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchStudent, changeStudentStatus } from '../../../services/admin/studentService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');

const MASTERY_LABELS = { mastered: 'Maîtrisé', reinforce: 'À consolider', gap: 'En difficulté', unassessed: 'Non évalué' };

export default function AdminStudentDetail() {
  const { id } = useParams();
  useDocumentMeta(`Élève #${id} — Administration`);

  const { token } = useContext(AuthContext);
  const loader = useCallback((t) => fetchStudent(t, id), [id]);
  const { data: student, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const [pendingStatus, setPendingStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const applyStatus = async () => {
    setBusy(true);
    try {
      const updated = await changeStudentStatus(token, id, pendingStatus);
      setData((current) => ({ ...current, ...updated }));
    } finally {
      setBusy(false);
      setPendingStatus(null);
    }
  };

  const learning = student?.learning;
  const strong = student?.mastery?.filter((m) => m.status === 'mastered') ?? [];
  const weak = student?.mastery?.filter((m) => m.status === 'gap') ?? [];

  return (
    <AdminPage
      eyebrow="Élève"
      title={student ? ([student.firstName, student.lastName].filter(Boolean).join(' ') || student.email) : `Élève #${id}`}
      subtitle={student?.email}
      actions={(
        <Link
          to="/admin/eleves"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Tous les élèves
        </Link>
      )}
    >
      {loading && <LoadingState label="Chargement du dossier…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {student && (
        <div className="space-y-6">
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
              <h2 className="mb-3 font-space text-sm font-bold text-slate-900">Compte</h2>
              <dl className="grid grid-cols-2 gap-3 font-inter text-sm">
                <Info label="Email">{student.email}</Info>
                <Info label="Classe">{student.grade ?? '—'}</Info>
                <Info label="Inscrit le">{formatDate(student.createdAt)}</Info>
                <Info label="Dernière activité">{formatDate(student.lastActivityAt)}</Info>
                <Info label="État"><StatusBadge status={student.accountStatus} /></Info>
                <Info label="Abonnement">
                  {student.subscription
                    ? <StatusBadge status={student.subscription.status} />
                    : <span className="text-slate-400">Aucun</span>}
                </Info>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="font-inter text-xs text-slate-500">Changer l’état du compte :</span>
                {['active', 'suspended', 'disabled']
                  .filter((value) => value !== student.accountStatus)
                  .map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPendingStatus(value)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {value === 'active' ? 'Réactiver' : value === 'suspended' ? 'Suspendre' : 'Désactiver'}
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-space text-sm font-bold text-slate-900">Abonnement</h2>
              {student.subscription ? (
                <dl className="space-y-2 font-inter text-sm">
                  <Info label="Formule">{student.subscription.plan}</Info>
                  <Info label="Début">{formatDate(student.subscription.startedAt)}</Info>
                  <Info label="Fin">{formatDate(student.subscription.endsAt)}</Info>
                  <Info label="Fournisseur">{student.subscription.provider ?? '—'}</Info>
                </dl>
              ) : (
                <p className="font-inter text-xs text-slate-500">
                  Aucun abonnement. Aucun système de paiement n’est intégré pour l’instant :
                  ces informations apparaîtront quand il le sera.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">Apprentissage</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile icon={CircleCheckBig} value={learning.lessonsCompleted} label="Leçons terminées" accent="bg-emerald-50 text-emerald-600" hint={`${learning.lessonsStarted} commencée(s)`} />
              <StatTile icon={Target} value={learning.modulesCompleted} label="Modules terminés" accent="bg-blue-50 text-blue-600" />
              <StatTile icon={Dumbbell} value={learning.questionsAnswered} label="Questions répondues" accent="bg-violet-50 text-violet-600" hint={`${learning.hintsUsed} indice(s)`} />
              {learning.successRate === null ? (
                <MetricUnavailable label="Taux de réussite" reason="no_data" />
              ) : (
                <StatTile icon={Percent} value={`${learning.successRate}%`} label="Taux de réussite" accent="bg-amber-50 text-amber-600" />
              )}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 font-space text-sm font-bold text-slate-900">Points en difficulté</h2>
              <p className="mb-3 font-inter text-xs text-slate-500">Dérivé de la maîtrise déjà calculée, jamais saisi à la main.</p>
              {weak.length === 0 ? (
                <p className="py-3 font-inter text-xs text-slate-400">Aucun point en difficulté identifié.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {weak.slice(0, 10).map((m) => (
                    <li key={m.code} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">{m.title}</span>
                      <span className="shrink-0 font-inter text-xs tabular-nums text-slate-400">{m.correctCount}/{m.attempts}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 font-space text-sm font-bold text-slate-900">Points maîtrisés</h2>
              <p className="mb-3 font-inter text-xs text-slate-500">{strong.length} point(s) au total.</p>
              {strong.length === 0 ? (
                <p className="py-3 font-inter text-xs text-slate-400">Aucun point maîtrisé pour l’instant.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {strong.slice(0, 10).map((m) => (
                    <li key={m.code} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 flex-1 truncate font-inter text-xs text-slate-700">{m.title}</span>
                      <StatusBadge status="published" label={MASTERY_LABELS.mastered} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">Progression par leçon</h2>
            <DataTable
              rows={student.progress ?? []}
              rowKey={(row) => row.lessonCode}
              empty={<EmptyState title="Aucune leçon commencée" />}
              columns={[
                { key: 'lessonTitle', label: 'Leçon', render: (p) => p.lessonTitle ?? p.lessonCode },
                { key: 'status', label: 'État', render: (p) => <StatusBadge status={p.status === 'completed' ? 'resolved' : 'in_review'} label={p.status === 'completed' ? 'Terminée' : 'En cours'} /> },
                { key: 'completedModules', label: 'Modules faits', render: (p) => (p.completedModules?.length ?? 0) },
                { key: 'lastActivityAt', label: 'Dernière activité', render: (p) => formatDate(p.lastActivityAt) },
              ]}
            />
          </section>

          <section>
            <h2 className="mb-3 font-space text-lg font-bold text-slate-900">Chronologie</h2>
            {student.timeline?.length === 0 ? (
              <EmptyState title="Aucun événement" hint="Cet élève n’a pas encore d’activité enregistrée." />
            ) : (
              <ol className="space-y-2">
                {student.timeline.map((event, index) => (
                  <li key={index} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-inter text-xs font-semibold text-slate-800">{event.lesson ?? '—'}</p>
                      <p className="font-inter text-xs text-slate-500">{event.detail}</p>
                    </div>
                    <span className="shrink-0 font-inter text-xs text-slate-400">{formatDate(event.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={applyStatus}
        busy={busy}
        tone={pendingStatus === 'active' ? 'default' : 'danger'}
        title={
          pendingStatus === 'active' ? 'Réactiver ce compte ?'
            : pendingStatus === 'suspended' ? 'Suspendre ce compte ?'
              : 'Désactiver ce compte ?'
        }
        confirmLabel={pendingStatus === 'active' ? 'Réactiver' : pendingStatus === 'suspended' ? 'Suspendre' : 'Désactiver'}
        message={
          pendingStatus === 'active'
            ? <p>L’élève retrouvera immédiatement l’accès à la plateforme.</p>
            : (
              <p>
                L’élève ne pourra plus se connecter{pendingStatus === 'disabled' ? ', et ses sessions en cours seront fermées' : ''}.
                {' '}<strong>Aucune donnée d’apprentissage n’est supprimée</strong> : sa progression, ses tentatives et sa maîtrise
                sont conservées et lui reviendront intactes si le compte est réactivé.
              </p>
            )
        }
      />
    </AdminPage>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <dt className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-800">{children}</dd>
    </div>
  );
}
