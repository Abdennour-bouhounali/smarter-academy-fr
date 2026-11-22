import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, HandHelping } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchClassLearningPoint } from '../../../services/teacher/classGroupService';
import { Loading, ErrorBox, formatDate, btnSecondary, btnPrimary } from '../../../pages/teacher/teacherUi';
import MasteryPill, { ReasonChip, FreshnessMark, ConfidenceBar } from './MasteryPill';
import MasteryExplanationPanel from './MasteryExplanationPanel';
import InterventionForm from '../interventions/InterventionForm';
import { DIRECTION_TONE, studentName, trajectoryColumns } from '../insights/insights';
import { LP_STATUS_BAR } from './lpBar';

// « Inconnu » : un élève dont l'histoire n'est pas enregistrée — pâle, jamais deviné.
const TRAJECTORY_TONE = { ...LP_STATUS_BAR, unknown: 'bg-slate-200' };

/**
 * UN point d'apprentissage × les élèves de la classe — un panneau dans le
 * même onglet, jamais une route : l'enseignant descend et remonte sans
 * perdre la leçon choisie.
 *
 * COMPRENDRE avant d'agir : les élèves (déjà triés par le serveur, du plus
 * fragile au plus sûr, chacun avec son mouvement sur la période), la classe
 * semaine après semaine, les questions où elle bute, les prérequis où la
 * difficulté peut prendre racine. Puis INTERVENIR, depuis le même endroit.
 */
export default function LearningPointDrilldown({ classGroup, code, onBack }) {
  const { t } = useTranslation('teacher');
  const loader = useCallback((tk) => fetchClassLearningPoint(tk, classGroup.id, code), [classGroup.id, code]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const [explain, setExplain] = useState(null);
  const [acting, setActing] = useState(false);
  const unnamed = t('common.unnamedStudent');
  const gapIds = (data?.students ?? []).filter((s) => s.status === 'gap').map((s) => s.id);

  return (
    <section className="rounded-2xl border border-nav-line bg-white p-4 sm:p-5 space-y-5" data-lp-drilldown={code}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono-jetbrains text-[11px] uppercase tracking-widest text-nav-accent">{data?.lesson?.title ?? ''}</p>
          <h3 className="font-space text-lg font-bold text-slate-900">{data?.learningPoint?.title ?? '…'}</h3>
          <p className="text-xs text-slate-500">{t('learningPoints.drilldownHint')}</p>
          {data?.difficultyScope && data.difficultyScope !== 'none' && (
            <span className="mt-1 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700" data-lp-scope={data.difficultyScope}>{t(`learningPoints.scope.${data.difficultyScope}`)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.students?.length > 0 && (
            <button type="button" onClick={() => setActing(true)} className={btnPrimary} data-lp-act>
              <HandHelping size={14} /> {gapIds.length > 0 ? t('learningPoints.actForGap') : t('learningPoints.act')}
            </button>
          )}
          <button type="button" onClick={onBack} className={btnSecondary} data-lp-back><ArrowBack size={14} /> {t('learningPoints.backToList')}</button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !loading && (
        <>
          {data.students.length === 0
            ? <p className="py-6 text-center text-sm text-slate-500">{t('progress.noStudents')}</p>
            : (
              <ul className="divide-y divide-slate-100">
                {data.students.map((s) => (
                  <li key={s.id} className="py-2.5" data-lp-student={s.id}>
                    <button
                      type="button"
                      onClick={() => setExplain(s)}
                      className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-1 py-1 text-start hover:bg-slate-50"
                      aria-label={t('learningPoints.explainFor', { name: studentName(s, unnamed) })}
                    >
                      <span className="w-40 shrink-0 truncate font-inter text-sm font-semibold text-slate-800">{studentName(s, unnamed)}</span>
                      <MasteryPill status={s.status} />
                      <ReasonChip reason={s.statusReason} />
                      <ConfidenceBar confidence={s.confidence} />
                      {['improved', 'declined', 'first_assessed'].includes(s.recentDirection) && (
                        <span className={`text-[11px] font-semibold ${DIRECTION_TONE[s.recentDirection] ?? ''}`} data-lp-direction={s.recentDirection}>
                          {t(`learningPoints.direction.${s.recentDirection}`)}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">{t('learningPoints.distinctSuccess', { count: Number(s.distinctItemsSuccess) || 0 })}</span>
                      <span className="text-xs text-slate-600">{t('learningPoints.assessmentSuccess', { count: Number(s.assessmentSuccessCount) || 0 })}</span>
                      <FreshnessMark freshness={s.freshness} />
                      <span className="ms-auto inline-flex items-center gap-1.5 text-xs text-slate-400">
                        {s.lastEvidenceAt ? formatDate(s.lastEvidenceAt) : t('students.never')}
                        <HelpCircle size={13} className="text-nav-accent" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Trajectory weeks={data.trajectory} />
            <Items items={data.items} />
          </div>
          <Prerequisites list={data.prerequisites} />
        </>
      )}

      <MasteryExplanationPanel
        open={Boolean(explain)}
        onClose={() => setExplain(null)}
        classGroupId={classGroup.id}
        studentId={explain?.id}
        code={code}
        studentName={explain ? studentName(explain, unnamed) : ''}
      />

      {data && (
        <InterventionForm
          open={acting}
          onClose={() => setActing(false)}
          onCreated={reload}
          classGroupId={classGroup.id}
          candidates={data.students}
          prefill={{ kind: gapIds.length > 1 ? 'class_reinforcement' : 'individual_followup', studentIds: gapIds, sourceSignal: null }}
          point={data.learningPoint}
        />
      )}
    </section>
  );
}

/** La classe sur ce point, semaine après semaine : des colonnes empilées, sans chiffre de moyenne. */
function Trajectory({ weeks }) {
  const { t } = useTranslation('teacher');
  const columns = trajectoryColumns(weeks);
  if (columns.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-100 p-3" data-lp-trajectory>
      <h4 className="text-xs font-semibold text-slate-800">{t('learningPoints.trajectory.title')}</h4>
      <p className="mb-2 text-[11px] text-slate-500">{t('learningPoints.trajectory.hint')}</p>
      <div className="flex h-24 items-end gap-1.5" dir="ltr">
        {columns.map((col) => {
          const label = `${t('learningPoints.trajectory.until', { date: formatDate(col.until) })} — ${col.segments.filter((s) => s.count > 0).map((s) => `${s.key === 'unknown' ? t('learningPoints.trajectory.unknown') : t(`students.masteryStatus.${s.key}`)} ${s.count}`).join(' · ')}`;
          return (
            <div key={col.until} className="flex h-full flex-1 flex-col-reverse overflow-hidden rounded-md bg-slate-50" role="img" aria-label={label} title={label}>
              {col.segments.map((s) => s.percent > 0 && <span key={s.key} className={TRAJECTORY_TONE[s.key]} style={{ height: `${s.percent}%` }} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Les questions de ce point où les élèves se trompent le plus — la preuve derrière la difficulté. */
function Items({ items }) {
  const { t } = useTranslation('teacher');
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-100 p-3" data-lp-items>
      <h4 className="text-xs font-semibold text-slate-800">{t('learningPoints.items.title')}</h4>
      <p className="mb-2 text-[11px] text-slate-500">{t('learningPoints.items.hint')}</p>
      <ul className="space-y-1.5 text-xs">
        {items.map((item) => (
          <li key={item.itemKey} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{t(`learningPoints.items.${item.source}`)}</span>
            <span className="min-w-0 flex-1 truncate text-slate-700" title={item.title ?? item.itemKey}>{item.title ?? t('learningPoints.items.untitled')}</span>
            <span className="text-rose-700">{t('learningPoints.items.answers', { failures: item.failures, answered: item.answered })}</span>
            <span className="w-full text-[10px] text-slate-400">{t('learningPoints.items.students', { failing: item.studentsFailing, students: item.students })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Prerequisites({ list }) {
  const { t } = useTranslation('teacher');
  if (!list || list.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-100 p-3" data-lp-prerequisites>
      <h4 className="mb-1.5 text-xs font-semibold text-slate-800">{t('learningPoints.prerequisites.title')}</h4>
      <ul className="flex flex-wrap gap-2 text-xs">
        {list.map((p) => (
          <li key={p.code} className={`rounded-lg border px-2.5 py-1 ${p.studentsInGap > 0 ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-600'}`}>
            {p.title}{p.studentsInGap > 0 && <span className="ms-1.5 font-semibold">· {t('learningPoints.prerequisites.inGap', { count: p.studentsInGap })}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
