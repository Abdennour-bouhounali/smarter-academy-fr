import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleCheckBig, Target, Dumbbell, Percent, Lock, NotebookPen, Award, HandHelping } from 'lucide-react';
import { ArrowBack } from '../../components/common/DirectionalIcons';
import { useAdminResource } from '../../hooks/useAdminResource';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import StatTile from '../../components/common/StatTile';
import PathProgress from '../../features/progression/components/PathProgress';
import MasteryPill, { ReasonChip, FreshnessMark, ConfidenceBar } from '../../features/teacher/learningPoints/MasteryPill';
import MasteryExplanationPanel from '../../features/teacher/learningPoints/MasteryExplanationPanel';
import { LP_STATUSES } from '../../features/teacher/learningPoints/lpBar';
import StudentSnapshot from '../../features/teacher/snapshot/StudentSnapshot';
import SignalCard from '../../features/teacher/insights/SignalCard';
import InterventionForm from '../../features/teacher/interventions/InterventionForm';
import { InterventionCard } from '../../features/teacher/interventions/InterventionsTab';
import { interventionDefaults, studentName } from '../../features/teacher/insights/insights';
import { fetchClassStudentProgress } from '../../services/teacher/classGroupService';
import StudentSettingsCard from '../../features/teacher/settings/StudentSettingsCard';
import { TeacherPage, Loading, ErrorBox, btnPrimary, btnSecondary, formatDate } from './teacherUi';

/**
 * Le dossier d'UN élève, cadré sur la classe — du plus utile au plus détaillé :
 * l'aperçu (« Aperçu »), ce qui mérite un regard à son sujet et ce qu'on a déjà
 * fait pour lui, puis l'achèvement, la maîtrise point par point et la frise.
 * Le cahier a son propre écran, en lecture seule. Aucun courriel : le
 * serveur ne l'envoie pas à l'enseignant.
 */
export default function StudentProgressPage() {
  const { t } = useTranslation('teacher');
  const { id, studentId } = useParams();
  const loader = useCallback((tk) => fetchClassStudentProgress(tk, id, studentId), [id, studentId]);
  const { data, loading, error, reload } = useAdminResource(loader, [loader]);
  const name = data ? studentName(data.student, t('common.unnamedStudent')) : '';
  const [acting, setActing] = useState(null);
  useDocumentMeta(name ? t('students.detailTitle', { name }) : t('students.title'));
  const [explainCode, setExplainCode] = useState(null);

  // La liste complète, groupée par leçon dans l'ordre où le serveur la livre
  // (du plus faible au plus fort) : une leçon apparaît à son premier point.
  const masteryByLesson = useMemo(() => {
    const groups = new Map();
    for (const m of data?.mastery ?? []) {
      const key = m.lessonCode ?? m.lessonTitle ?? '';
      if (!groups.has(key)) groups.set(key, { key, title: m.lessonTitle ?? m.lessonCode ?? '', points: [] });
      groups.get(key).points.push(m);
    }
    return [...groups.values()];
  }, [data]);
  const masteryCounts = data?.learning?.masteryCounts ?? {};
  const masteryTotal = LP_STATUSES.reduce((sum, key) => sum + (Number(masteryCounts[key]) || 0), 0);

  return (
    <TeacherPage
      eyebrow={t('students.title')}
      title={name || '…'}
      subtitle={data?.student?.lastActivityAt ? `${t('snapshot.lastActivity')} : ${formatDate(data.student.lastActivityAt)}` : undefined}
      actions={(
        <>
          {/* Le cahier est une DESTINATION, pas une note de bas de page : il
              était sous la frise d'activité, ce qui obligeait à dérouler tout
              le dossier pour l'atteindre. Ici, il est visible à l'ouverture.
              En `btnPrimary` parce que c'est l'action de la page — « revenir
              à la classe » n'est qu'une sortie. */}
          <Link to={`/enseignant/classes/${id}/eleves/${studentId}/cahier`} className={btnPrimary}>
            <NotebookPen size={14} /> {t('notebook.open')}
          </Link>
          <Link to={`/enseignant/classes/${id}`} className={btnSecondary}>
            <ArrowBack size={14} /> {t('students.backToClass')}
          </Link>
        </>
      )}
    >
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-6" data-student-progress>
          <StudentSnapshot snapshot={data.snapshot} onExplain={setExplainCode} />

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="space-y-3">
              <h2 className="font-space font-bold text-slate-900">{t('snapshot.signals')}</h2>
              {data.signals?.length ? data.signals.map((signal) => (
                <SignalCard key={signal.key} signal={signal} classGroupId={id} onOpenPoint={setExplainCode} onAct={setActing} />
              )) : <p className="rounded-2xl border border-nav-line bg-white p-4 text-sm text-slate-400">{t('snapshot.noSignals')}</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-space font-bold text-slate-900">{t('snapshot.interventions')}</h2>
                <button type="button" onClick={() => setActing({ students: [data.student], actions: ['individual_followup'] })} className={btnSecondary} data-student-act>
                  <HandHelping size={14} /> {t('snapshot.act')}
                </button>
              </div>
              {data.interventions?.length ? (
                <ul className="space-y-3">{data.interventions.map((iv) => <InterventionCard key={iv.id} classGroup={{ id }} intervention={iv} onChanged={reload} onOpenPoint={setExplainCode} />)}</ul>
              ) : <p className="rounded-2xl border border-nav-line bg-white p-4 text-sm text-slate-400">{t('snapshot.noInterventions')}</p>}
            </div>
          </section>

          {/* Deux tuiles distinctes pour deux faits distincts : ACHÈVEMENT
              (des leçons parcourues) et MAÎTRISE (des compétences prouvées).
              Les confondre ferait passer un élève qui a tout lu pour un
              élève qui sait. Le taux de réussite ne compte que les exercices. */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile icon={CircleCheckBig} value={data.learning.lessonsCompleted} label={t('students.lessonsCompleted')} accent="bg-emerald-50 text-emerald-600" hint={`${data.scope.lessonsInScope} ${t('students.lessonsInScope')}`} />
            <StatTile icon={Award} value={Number(masteryCounts.mastered) || 0} label={t('students.masteredPoints')} accent="bg-nav-page text-nav-accent" hint={t('students.ofPoints', { count: masteryTotal })} />
            <StatTile icon={Target} value={data.learning.modulesCompleted} label={t('students.modulesCompleted')} accent="bg-nav-accent-soft text-nav-accent" />
            <StatTile icon={Dumbbell} value={data.learning.questionsAnswered} label={t('students.questionsAnswered')} accent="bg-violet-50 text-violet-600" hint={`${data.learning.hintsUsed} ${t('students.hints')}`} />
            <StatTile icon={Percent} value={data.learning.successRate === null ? '—' : <span dir="ltr">{data.learning.successRate}%</span>} label={t('students.successRate')} accent="bg-amber-50 text-amber-600" hint={t('students.exercisesOnly')} />
          </div>
          <div className="rounded-2xl border border-nav-line bg-white p-4"><PathProgress percent={data.learning.progressPercent ?? 0} /></div>

          {/* Les réglages que l'enseignant décide pour CET élève (2026-10-06). */}
          <StudentSettingsCard classroomId={id} studentId={studentId} />

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
            <div className="rounded-2xl border border-nav-line bg-white p-5">
              <h2 className="font-space font-bold text-slate-900 mb-3">{t('students.progressTitle')}</h2>
              {data.progress.length === 0 ? <p className="text-sm text-slate-400">{t('students.never')}</p> : (
                <ul className="divide-y divide-slate-100">
                  {data.progress.map((p) => (
                    <li key={p.lessonCode} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate text-slate-800">{p.lessonTitle ?? p.lessonCode}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-nav-accent-soft text-nav-accent'}`}>{t(`students.lessonStatus.${p.status}`)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-nav-line bg-white p-5">
              <h2 className="font-space font-bold text-slate-900 mb-1">{t('students.masteryTitle')}</h2>
              {masteryTotal > 0 && (
                <p className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500" data-mastery-counts>
                  {LP_STATUSES.map((key) => (
                    <span key={key} className="inline-flex items-center gap-1">
                      <MasteryPill status={key} />
                      <span className="font-mono-jetbrains font-bold tabular-nums text-slate-700">{Number(masteryCounts[key]) || 0}</span>
                    </span>
                  ))}
                </p>
              )}
              {data.mastery.length === 0 ? <p className="text-sm text-slate-400">{t('common.noData')}</p> : (
                <div className="space-y-4">
                  {masteryByLesson.map((group) => (
                    <div key={group.key} data-mastery-lesson={group.key}>
                      <h3 className="mb-1 font-inter text-xs font-semibold text-nav-accent">{group.title}</h3>
                      <ul className="divide-y divide-slate-100">
                        {group.points.map((m) => (
                          <li key={m.code} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 text-sm" data-mastery-row={m.code}>
                            <span className="min-w-0 flex-1 basis-40 truncate text-slate-800">{m.title}</span>
                            <MasteryPill status={m.status} />
                            <ReasonChip reason={m.statusReason} />
                            <ConfidenceBar confidence={m.confidence} />
                            <FreshnessMark freshness={m.freshness} />
                            <button type="button" onClick={() => setExplainCode(m.code)} className="text-[11px] font-semibold text-nav-accent hover:underline" data-mastery-why={m.code}>{t('students.why')}</button>
                            <span className="w-full text-[11px] text-slate-500">
                              {t('students.masteryFacts', { distinct: Number(m.distinctItemsSuccess) || 0, assessment: Number(m.assessmentSuccessCount) || 0, level: m.maxDifficultySuccess ?? '—' })}
                              {m.lastEvidenceAt && <> · {formatDate(m.lastEvidenceAt)}</>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <InterventionForm
            open={Boolean(acting)}
            onClose={() => setActing(null)}
            onCreated={reload}
            classGroupId={id}
            candidates={[data.student]}
            prefill={acting ? { ...interventionDefaults(acting), studentIds: [data.student.id] } : null}
            point={acting?.learningPoint ? { code: acting.learningPoint.code, title: acting.learningPoint.title } : null}
          />

          <MasteryExplanationPanel
            open={Boolean(explainCode)}
            onClose={() => setExplainCode(null)}
            classGroupId={id}
            studentId={studentId}
            code={explainCode}
            studentName={name}
          />

          <section className="rounded-2xl border border-nav-line bg-white p-5">
            <h2 className="font-space font-bold text-slate-900 mb-3">{t('students.timelineTitle')}</h2>
            {data.timeline.length === 0 ? <p className="text-sm text-slate-400">{t('students.noActivity')}</p> : (
              <ol className="space-y-2">
                {data.timeline.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-nav-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">{e.lesson ?? '—'}</p>
                      <p className="text-xs text-slate-500" dir="auto">{e.type === 'practice_session' && e.answered !== undefined ? <span dir="ltr">{e.correct}/{e.answered}</span> : e.type === 'final_test' ? <span dir="ltr">{e.score}/{e.total}</span> : e.modulesCompleted}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(e.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
          {/* Le cahier n'est pas DANS ce dossier : il a son écran et sa
              propre autorisation (« où en est-il ? » et « qu'a-t-il noté ? »
              sont deux questions). Le bouton est en HAUT, dans les actions
              de la page ; ici il ne reste que le rappel. */}
          <p className="flex items-center gap-2 text-xs text-slate-400"><Lock size={12} /> {t('students.privacy')}</p>
        </div>
      )}
    </TeacherPage>
  );
}
