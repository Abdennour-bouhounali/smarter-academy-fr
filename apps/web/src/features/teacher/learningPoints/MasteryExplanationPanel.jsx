import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotebookPen, HandHelping } from 'lucide-react';
import { useAdminResource } from '../../../hooks/useAdminResource';
import Modal from '../../../components/admin/ui/Modal';
import { fetchStudentLearningPointEvidence } from '../../../services/teacher/classGroupService';
import { Loading, ErrorBox, formatDate, btnPrimary } from '../../../pages/teacher/teacherUi';
import MasteryPill, { ReasonChip, FreshnessMark, ConfidenceBar } from './MasteryPill';
import StatusTrail from '../insights/StatusTrail';
import InterventionForm from '../interventions/InterventionForm';
import { InterventionCard } from '../interventions/InterventionsTab';

/**
 * Les issues CANONIQUES renvoyées par l'explication (App\Domain\Progress\Outcome) :
 * réussite, partiel, échec, inerte — la même taxonomie que la maîtrise.
 */
const OUTCOME_TONE = {
  correct: 'bg-emerald-50 text-emerald-700',
  equivalent_correct: 'bg-emerald-50 text-emerald-700',
  partially_correct: 'bg-amber-50 text-amber-800',
  incorrect: 'bg-rose-50 text-rose-700',
};

/**
 * « لماذا ؟ » — la PREUVE d'un point pour un élève : le statut et son motif,
 * les faits que le moteur a comptés, les derniers indices, le CHEMIN de son
 * état dans le temps, ce que l'élève a écrit dans son كرّاس sur ce point, et
 * les interventions de l'enseignant sur ce point. Rien n'est recalculé ici :
 * l'écran montre ce que le serveur a décidé, pour que l'enseignant puisse le
 * contester en connaissance — puis agir depuis le même endroit.
 *
 * Le cahier reste l'écrit de l'élève : il est MONTRÉ, jamais compté ni mêlé
 * à la maîtrise (NOTEBOOK.md).
 *
 * Boîte de dialogue du kit (rôle `dialog`, Échap, focus rendu), X arabe via
 * `closeLabel` — le motif documenté au §8 du contrat enseignant.
 */
const FACT_KEYS = [
  'attempts', 'successes', 'partials', 'failures',
  'distinctItemsSuccess', 'distinctItemsAttempted', 'availableItems', 'distinctTemplatesSuccess',
  'assessmentSuccesses', 'recentPracticeSuccesses', 'recentSuccessesWithHints', 'maxDifficultySuccess',
];
const DATE_KEYS = ['lastEvidenceAt', 'lastSuccessAt', 'lastFailureAt'];

export default function MasteryExplanationPanel({ open, onClose, classGroupId, studentId, code, studentName }) {
  const { t } = useTranslation('teacher');
  const enabled = Boolean(open && classGroupId && studentId && code);
  const loader = useCallback((tk) => (enabled ? fetchStudentLearningPointEvidence(tk, classGroupId, studentId, code) : Promise.resolve(null)), [enabled, classGroupId, studentId, code]);
  const resource = useAdminResource(loader, [loader]);
  const { loading, error, reload } = resource;
  const data = resource.data?.explanation ?? null;
  const evidence = resource.data;
  const [acting, setActing] = useState(false);

  const codeLabel = (prefix, value) => {
    if (value === null || value === undefined || value === '') return '—';
    const key = `${prefix}.${value}`;
    const label = t(key);
    return label === key ? String(value) : label;
  };

  const title = data?.learningPoint?.title
    ? t('learningPoints.explanation.titleFor', { title: data.learningPoint.title })
    : t('learningPoints.explanation.title');

  return (
    <Modal open={open} onClose={onClose} title={title} size="xl" closeLabel={t('common.close')}>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !loading && (
        <div className="space-y-5" data-mastery-explanation={code}>
          <div className="flex flex-wrap items-center gap-2">
            {studentName && <span className="font-inter text-sm font-semibold text-slate-800">{studentName}</span>}
            <MasteryPill status={data.status} />
            <ReasonChip reason={data.statusReason} />
            <FreshnessMark freshness={data.freshness} />
            <span className="ms-auto inline-flex items-center gap-2 text-[11px] text-slate-500">
              {t('learningPoints.confidence')} <ConfidenceBar confidence={data.confidence} />
            </span>
          </div>

          <section>
            <h3 className="mb-2 font-space text-sm font-bold text-slate-900">{t('learningPoints.explanation.evidenceTitle')}</h3>
            {!data.evidence ? <p className="text-sm text-slate-400">{t('learningPoints.explanation.noEvidence')}</p> : (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
                {FACT_KEYS.map((key) => (
                  <div key={key} className="flex items-baseline justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-slate-500">{t(`learningPoints.explanation.facts.${key}`)}</dt>
                    <dd className="font-mono-jetbrains font-bold tabular-nums text-slate-800" dir="ltr">
                      {key === 'distinctItemsSuccess' && data.evidence.needed !== undefined && data.evidence.needed !== null
                        ? `${data.evidence[key] ?? 0}\u00A0/\u00A0${data.evidence.needed}`
                        : (data.evidence[key] ?? '—')}
                    </dd>
                  </div>
                ))}
                {DATE_KEYS.map((key) => (
                  <div key={key} className="flex items-baseline justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-slate-500">{t(`learningPoints.explanation.facts.${key}`)}</dt>
                    <dd className="font-semibold text-slate-800">{formatDate(data.evidence[key])}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section>
            <h3 className="mb-2 font-space text-sm font-bold text-slate-900">{t('learningPoints.explanation.recentTitle')}</h3>
            {!data.recent || data.recent.length === 0 ? <p className="text-sm text-slate-400">{t('learningPoints.explanation.noRecent')}</p> : (
              <ol className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {data.recent.map((row, index) => (
                  <li key={`${row.at}-${row.itemKey ?? index}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs" data-evidence-kind={row.kind}>
                    <span className="w-24 shrink-0 text-slate-400">{formatDate(row.at)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">{codeLabel('learningPoints.explanation.source', row.source)}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${OUTCOME_TONE[row.outcome] ?? 'bg-slate-100 text-slate-600'}`}>
                      {codeLabel('students.evidenceOutcome', row.outcome)}
                    </span>
                    <span className="text-slate-600">{codeLabel('students.evidenceKind', row.kind)}</span>
                    {row.difficulty !== undefined && row.difficulty !== null && (
                      <span className="text-slate-500">{t('learningPoints.explanation.difficulty')} <span dir="ltr" className="font-mono-jetbrains">{row.difficulty}</span></span>
                    )}
                    {Number(row.hints) > 0 && <span className="text-slate-500">{t('learningPoints.explanation.hints', { count: Number(row.hints) })}</span>}
                    {row.itemTitle && <span className="w-full truncate text-slate-500 sm:w-auto sm:flex-1 sm:text-end" title={row.itemTitle}>{row.itemTitle}</span>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h3 className="mb-2 font-space text-sm font-bold text-slate-900">{t('learningPoints.evidence.historyTitle')}</h3>
            <StatusTrail steps={evidence?.history} />
          </section>

          <section data-evidence-notebook>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-space text-sm font-bold text-slate-900">{t('learningPoints.evidence.notebookTitle')}</h3>
              {evidence?.notebook?.total > 0 && (
                <Link to={`/enseignant/classes/${classGroupId}/eleves/${studentId}/cahier`} className="inline-flex items-center gap-1 text-xs font-semibold text-nav-accent hover:underline">
                  <NotebookPen size={12} /> {t('learningPoints.evidence.openNotebook')}
                </Link>
              )}
            </div>
            {!evidence?.notebook?.notes?.length ? <p className="text-sm text-slate-400">{t('learningPoints.evidence.noNotes')}</p> : (
              <ul className="space-y-2">
                {evidence.notebook.notes.map((note) => (
                  <li key={note.id} className="rounded-xl border border-slate-100 bg-amber-50/30 p-3 text-xs" data-evidence-note={note.id}>
                    <p className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700">{codeLabel('notebook.type', note.noteType)}</span>
                      {note.mistakeType && <span>{codeLabel('notebook.mistakeType', note.mistakeType)}</span>}
                      <span>{formatDate(note.createdAt)}</span>
                    </p>
                    {note.title && <p className="font-semibold text-slate-800">{note.title}</p>}
                    <p className="line-clamp-3 whitespace-pre-line text-slate-700">{note.excerpt}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-space text-sm font-bold text-slate-900">{t('learningPoints.evidence.interventionsTitle')}</h3>
              <button type="button" onClick={() => setActing(true)} className={btnPrimary} data-evidence-act><HandHelping size={14} /> {t('learningPoints.act')}</button>
            </div>
            {!evidence?.interventions?.length ? <p className="text-sm text-slate-400">{t('learningPoints.evidence.noInterventions')}</p> : (
              <ul className="space-y-2">
                {evidence.interventions.map((iv) => <InterventionCard key={iv.id} classGroup={{ id: classGroupId }} intervention={iv} onChanged={reload} />)}
              </ul>
            )}
          </section>

          {data.engineVersion && (
            <p className="text-[10px] text-slate-400">{t('learningPoints.explanation.engine')} <span dir="ltr" className="font-mono-jetbrains">{data.engineVersion}</span></p>
          )}
        </div>
      )}
      {enabled && evidence?.student && (
        <InterventionForm
          open={acting}
          onClose={() => setActing(false)}
          onCreated={reload}
          classGroupId={classGroupId}
          candidates={[evidence.student]}
          prefill={{ kind: 'individual_followup', studentIds: [evidence.student.id], sourceSignal: null }}
          point={data?.learningPoint ?? null}
        />
      )}
    </Modal>
  );
}
