import React, { useCallback, useContext, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Users } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import StatusBadge from '../../../components/admin/ui/StatusBadge';
import { LoadingState, ErrorState } from '../../../components/admin/ui/states';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchReport, updateReport, addReportNote } from '../../../services/admin/reportService';
import { SOURCE_LABELS, categoryLabel } from './reportLabels';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : '—');

export default function AdminReportDetail() {
  const { id } = useParams();
  useDocumentMeta(`Signalement #${id} — Administration`);

  const { token } = useContext(AuthContext);
  const loader = useCallback((t) => fetchReport(t, id), [id]);
  const { data: report, loading, error, reload, setData } = useAdminResource(loader, [loader]);

  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const mutate = async (changes) => {
    setBusy(true);
    setActionError(null);
    try {
      const updated = await updateReport(token, id, changes);
      setData((current) => ({ ...current, ...updated }));
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  const submitNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      const created = await addReportNote(token, id, note.trim());
      setData((current) => ({ ...current, notes: [...(current.notes ?? []), created] }));
      setNote('');
    } catch (caught) {
      setActionError(caught.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Signalement"
      title={`Signalement #${id}`}
      actions={(
        <Link
          to="/admin/signalements"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft size={14} /> Tous les signalements
        </Link>
      )}
    >
      {loading && <LoadingState label="Chargement du signalement…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {report && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card title="Ce que l’élève a signalé">
              <Field label="Type">
                {report.detailsCompleted
                  ? categoryLabel(report.category)
                  : (
                    <span className="text-slate-500">
                      <span className="italic">Sans description</span>
                      <span className="mt-0.5 block font-inter text-xs text-slate-400">
                        L’élève a ouvert le signalement sans le compléter. Le signal reste
                        exploitable : quelqu’un a bien buté ici.
                      </span>
                    </span>
                  )}
              </Field>
              <Field label="Origine">{SOURCE_LABELS[report.source] ?? report.source}</Field>
              <Field label="Complétude">
                {report.detailsCompleted
                  ? <StatusBadge status="resolved" label="Décrit par l’élève" />
                  : <StatusBadge status="draft" label="Signal seul" />}
              </Field>
              <Field label="Message">
                {report.note
                  ? <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-700">{report.note}</p>
                  : <span className="text-slate-400">L’élève n’a pas laissé de message (c’est facultatif).</span>}
              </Field>
              <Field label="Envoyé le">{formatDate(report.createdAt)}</Field>
            </Card>

            <Card title="Où, exactement">
              <Field label="Leçon">
                {report.context.lessonCode ? (
                  <Link to={`/admin/contenu/lecons/${encodeURIComponent(report.context.lessonCode)}`} className="text-blue-600 hover:underline">
                    {report.context.lessonTitle ?? report.context.lessonCode}
                  </Link>
                ) : '—'}
              </Field>
              <Field label="Module">
                {report.context.isLessonLevel
                  // Signalement parti du SOMMAIRE : il n'y a pas de module, et
                  // le dire vaut mieux qu'un tiret qu'on lirait comme perdu.
                  ? <span className="text-slate-500">Signalement au niveau de la leçon</span>
                  : report.context.moduleTitle
                    ?? (report.context.moduleNumber != null ? `Module ${report.context.moduleNumber}` : '—')}
              </Field>
              {report.context.step && <Field label="Étape">{report.context.step}</Field>}
              {report.context.exerciseCode && <Field label="Exercice"><code className="font-mono-jetbrains text-xs">{report.context.exerciseCode}</code></Field>}
              {report.context.questionId && <Field label="Question"><code className="font-mono-jetbrains text-xs">{report.context.questionId}</code></Field>}
              {report.context.route && <Field label="Page"><code className="font-mono-jetbrains text-xs text-slate-500">{report.context.route}</code></Field>}
            </Card>

            {report.attempt && (
              <Card title="La tentative de l’élève">
                <p className="mb-3 font-inter text-xs text-slate-500">
                  Ce que l’élève a réellement répondu au moment du signalement — de quoi trancher entre « le contenu est faux »
                  et « l’élève s’est trompé ».
                </p>
                <Field label="Réponse donnée">
                  <code className="rounded bg-slate-100 px-2 py-1 font-mono-jetbrains text-xs">
                    {JSON.stringify(report.attempt.submittedAnswer)}
                  </code>
                </Field>
                <Field label="Interprétée comme">{report.attempt.normalizedAnswer ?? '—'}</Field>
                <Field label="Résultat"><StatusBadge status={report.attempt.outcome === 'correct' ? 'resolved' : 'new'} label={report.attempt.outcome ?? '—'} /></Field>
                <Field label="Essai n°">{report.attempt.attemptNumber}</Field>
                <Field label="Indices utilisés">{report.attempt.hintsUsed}</Field>
                {report.attempt.misconceptionId && <Field label="Erreur-type"><code className="font-mono-jetbrains text-xs">{report.attempt.misconceptionId}</code></Field>}
              </Card>
            )}

            {report.diagnostics && (
              <Card title="Contexte technique">
                <p className="mb-3 font-inter text-xs text-slate-500">
                  Conservé uniquement pour les signalements décrivant une panne.
                </p>
                <Field label="Navigateur">{report.diagnostics.browser ?? '—'}</Field>
                <Field label="Système">{report.diagnostics.os ?? '—'}</Field>
                <Field label="Écran">{report.diagnostics.screen ?? '—'}</Field>
              </Card>
            )}

            <Card title={<span className="flex items-center gap-1.5"><Lock size={14} /> Notes internes</span>}>
              <p className="mb-3 font-inter text-xs text-slate-500">
                Jamais visibles par l’élève. Aucun point d’entrée élève ne les sert.
              </p>

              {report.notes?.length > 0 ? (
                <ul className="mb-3 space-y-2">
                  {report.notes.map((entry) => (
                    <li key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="whitespace-pre-wrap text-slate-700">{entry.body}</p>
                      <p className="mt-1 font-inter text-xs text-slate-400">{entry.author} · {formatDate(entry.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3 font-inter text-xs text-slate-400">Aucune note pour l’instant.</p>
              )}

              <form onSubmit={submitNote} className="space-y-2">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Ce que vous avez vérifié, ce qui a été corrigé…"
                  aria-label="Nouvelle note interne"
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-inter text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={busy || !note.trim()}
                  className="rounded-lg bg-slate-900 px-4 py-2 font-inter text-xs font-semibold text-white disabled:opacity-40"
                >
                  Ajouter la note
                </button>
              </form>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Traitement">
              {actionError && <p className="mb-2 rounded-lg bg-rose-50 p-2 font-inter text-xs text-rose-700">{actionError}</p>}

              <Field label="Statut">
                <select
                  value={report.status}
                  disabled={busy}
                  onChange={(event) => mutate({ status: event.target.value })}
                  aria-label="Statut du signalement"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 font-inter text-xs"
                >
                  <option value="new">Nouveau</option>
                  <option value="in_review">En cours d’examen</option>
                  <option value="resolved">Résolu</option>
                  <option value="dismissed">Rejeté</option>
                  <option value="duplicate">Doublon</option>
                </select>
              </Field>

              <Field label="Priorité">
                <select
                  value={report.priority}
                  disabled={busy}
                  onChange={(event) => mutate({ priority: event.target.value })}
                  aria-label="Priorité du signalement"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 font-inter text-xs"
                >
                  <option value="critical">Critique</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </Field>

              {report.resolvedAt && (
                <p className="font-inter text-xs text-slate-500">Traité le {formatDate(report.resolvedAt)}</p>
              )}
            </Card>

            <Card title="L’élève">
              <Field label="Compte">
                <Link to={`/admin/eleves/${report.student.id}`} className="text-blue-600 hover:underline">
                  {report.student.email}
                </Link>
              </Field>
              <Field label="Classe">{report.student.grade ?? '—'}</Field>
              <Field label="État du compte"><StatusBadge status={report.student.accountStatus} /></Field>
            </Card>

            {report.related.total > 1 && (
              <Card title={<span className="flex items-center gap-1.5"><Users size={14} /> Même problème</span>}>
                <p className="font-inter text-sm text-slate-700">
                  <strong className="text-lg tabular-nums">{report.related.total}</strong> signalements
                  concernent exactement ce contenu et ce type de problème.
                </p>
                <ul className="mt-2 space-y-1">
                  {report.related.reports.slice(0, 8).map((sibling) => (
                    <li key={sibling.id}>
                      <Link to={`/admin/signalements/${sibling.id}`} className="font-inter text-xs text-blue-600 hover:underline">
                        #{sibling.id} — {formatDate(sibling.createdAt)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 font-space text-sm font-bold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 font-inter text-sm text-slate-800">{children}</div>
    </div>
  );
}
