import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Crosshair, MonitorPlay, Trophy } from 'lucide-react';
import InterventionForm from '../interventions/InterventionForm';
import { studentName } from '../insights/insights';
import { formatSeconds, percent } from '../../dailyChallenge/challengeModel';
import { btnSecondary } from '../../../pages/teacher/teacherUi';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { LOCALE } from '../../../locale.js';

function Tile({ label, value, hint, testId }) {
  return (
    <div className="rounded-2xl border border-nav-line bg-white p-4" data-tile={testId}>
      <p className="font-inter text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-space text-2xl font-black text-slate-900" dir="ltr">{value}</p>
      {hint && <p className="font-inter text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

/** Une barre de réussite — le pourcentage est écrit, la barre ne fait que l'illustrer. */
function RateBar({ rate, flagged }) {
  const width = rate === null || rate === undefined ? 0 : Math.round(rate * 100);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
      <div className={`h-full rounded-full ${flagged ? 'bg-amber-500' : 'bg-nav-accent'}`} style={{ width: `${width}%` }} />
    </div>
  );
}

/**
 * Le tableau de bord d'un jour de défi — ce qui AIDE à agir : la
 * participation, la justesse, le temps, la série ; les questions qui ont
 * résisté (⚠ sous 60 %) ; les points d'apprentissage en cause, avec les
 * élèves concernés et deux gestes — ouvrir le point (la carte existante),
 * proposer une pratique ciblée (le formulaire d'intervention existant).
 */
export default function ClassChallengeResults({ classGroupId, data, onOpenPoint, onDate }) {
  const { t } = useTranslation('challenge');
  const [intervene, setIntervene] = useState(null);
  const summary = data.summary;
  const candidates = data.students.map((s) => s.student);
  const byId = new Map(candidates.map((s) => [s.id, s]));

  return (
    <div className="space-y-5" data-challenge-results>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-space text-lg font-bold text-slate-900">{t('teacher.results.title')}</h3>
        {data.dates?.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only">{t('teacher.results.date')}</span>
            <select value={data.date} onChange={(e) => onDate(e.target.value)} dir="ltr" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
              {[...new Set([data.date, ...data.dates])].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        )}
        <Link to={`/enseignant/classes/${classGroupId}/defi/affichage${data.date ? `?date=${data.date}` : ''}`} className={`${btnSecondary} ms-auto`} data-display-link>
          <MonitorPlay size={16} aria-hidden="true" /> {t('teacher.results.display')}
        </Link>
      </div>

      {!summary ? (
        <p className="rounded-2xl border border-nav-line bg-white p-6 text-center text-sm text-slate-500">{t('teacher.results.noChallenge')}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Tile testId="participation" label={t('teacher.results.participation')} value={t('teacher.results.participationValue', { completed: summary.completed, members: data.members })} hint={percent(summary.participationRate)} />
            <Tile testId="averageScore" label={t('teacher.results.averageScore')} value={percent(summary.averageScoreRate)} />
            <Tile testId="averageTime" label={t('teacher.results.averageTime')} value={t('teacher.results.seconds', { value: formatSeconds(summary.averageResponseMs) })} />
            <Tile testId="accuracy" label={t('teacher.results.accuracy')} value={percent(summary.accuracy)} />
            <Tile testId="streak" label={t('teacher.results.streak')} value={percent(summary.streakContinuationRate)} />
          </div>

          <section className="rounded-2xl border border-nav-line bg-white p-5" aria-labelledby="dc-q-analysis">
            <h4 id="dc-q-analysis" className="font-space text-base font-bold text-slate-900">{t('teacher.results.questions')}</h4>
            <ol className="mt-3 space-y-2.5">
              {data.questions.map((q) => (
                <li key={q.position} className="grid grid-cols-[3rem_minmax(0,1fr)_4rem] items-center gap-3" data-question-row={q.position}>
                  <span className="font-mono-jetbrains text-sm font-bold text-slate-700">{t('teacher.results.questionN', { n: q.position })}</span>
                  <div className="min-w-0">
                    <RateBar rate={q.correctRate} flagged={q.flagged} />
                    <p className="mt-1 truncate font-inter text-[11px] text-slate-500">{q.learningPoint?.title && <MathLabel>{q.learningPoint.title}</MathLabel>} · {t('teacher.results.answered', { count: q.answered })}</p>
                  </div>
                  <span className={`text-end font-mono-jetbrains text-sm font-bold ${q.flagged ? 'text-amber-700' : 'text-slate-800'}`} dir="ltr">
                    {percent(q.correctRate)} {q.flagged && <AlertTriangle size={13} className="inline" aria-label={t('teacher.results.flagged')} />}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {data.learningPoints.some((p) => p.flagged) && (
            <section className="space-y-3" aria-label={t('teacher.results.points')}>
              {data.learningPoints.filter((p) => p.flagged).map((p) => (
                <div key={p.code} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4" data-struggling-point={p.code}>
                  <p className="font-inter text-sm text-amber-900">⚠ {t('teacher.results.struggling', { count: p.strugglingStudentIds.length })}</p>
                  <p className="mt-1 font-space text-base font-bold text-slate-900"><MathLabel>{p.title}</MathLabel></p>
                  <p className="font-inter text-xs text-slate-600"><MathLabel>{p.lessonTitle}</MathLabel> · {t('teacher.results.correctRate', { rate: percent(p.correctRate) })}</p>
                  <p className="mt-1 font-inter text-xs text-slate-500">{p.strugglingStudentIds.map((id) => studentName(byId.get(id))).join(', ')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onOpenPoint(p.code)} className={btnSecondary}><Crosshair size={14} aria-hidden="true" /> {t('teacher.results.openPoint')}</button>
                    <button type="button" onClick={() => setIntervene(p)} className={btnSecondary} data-assign-practice>{t('teacher.results.assignPractice')}</button>
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      <section className="rounded-2xl border border-nav-line bg-white p-5" aria-labelledby="dc-ranking">
        <h4 id="dc-ranking" className="flex items-center gap-2 font-space text-base font-bold text-slate-900"><Trophy size={16} className="text-amber-500" aria-hidden="true" /> {t('teacher.results.ranking')}</h4>
        {data.ranking === null ? (
          <p className="mt-2 text-sm text-slate-500">{t('teacher.results.rankingOff')}</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-slate-500">{t('teacher.results.rankingHint')}</p>
            <ol className="mt-3 divide-y divide-slate-100" data-teacher-ranking>
              {data.ranking.map((r) => (
                <li key={r.userId} className="flex items-center gap-3 py-2">
                  <span className="w-8 font-mono-jetbrains text-sm font-bold text-slate-500" dir="ltr">{r.rank}</span>
                  <Link to={`/enseignant/classes/${classGroupId}/eleves/${r.userId}`} className="min-w-0 flex-1 truncate font-inter text-sm font-semibold text-slate-900 hover:text-nav-accent">{studentName(r.student, t('teacher.title'))}</Link>
                  <span className="font-mono-jetbrains text-xs text-slate-500" dir="ltr">{r.totalCorrect} ✓</span>
                  <span className="w-20 text-end font-space font-black text-slate-900" dir="ltr">{r.score.toLocaleString(LOCALE)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      {summary && (
        <section className="rounded-2xl border border-nav-line bg-white overflow-x-auto p-5" aria-labelledby="dc-students">
          <h4 id="dc-students" className="font-space text-base font-bold text-slate-900">{t('teacher.results.students')}</h4>
          <table className="mt-3 w-full min-w-[32rem] text-sm">
            <thead><tr className="text-start text-xs text-slate-500">
              <th scope="col" className="py-1 text-start font-medium">{t('teacher.results.students')}</th>
              <th scope="col" className="text-start font-medium">{t('teacher.results.score')}</th>
              <th scope="col" className="text-start font-medium">{t('teacher.results.correctCol')}</th>
              <th scope="col" className="text-start font-medium">{t('teacher.results.timeCol')}</th>
              <th scope="col" className="text-start font-medium">{t('teacher.results.streakCol')}</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((s) => (
                <tr key={s.student.id} data-student-row={s.status}>
                  <td className="py-2 font-semibold text-slate-800">{studentName(s.student)} <span className="ms-1 text-xs font-normal text-slate-400">{t(`teacher.results.status.${s.status}`)}</span></td>
                  <td dir="ltr" className="text-start font-mono-jetbrains">{s.score ?? '—'}</td>
                  <td dir="ltr" className="text-start font-mono-jetbrains">{s.correct !== null ? `${s.correct}/${s.questionCount}` : '—'}</td>
                  <td dir="ltr" className="text-start font-mono-jetbrains">{s.averageResponseMs ? formatSeconds(s.averageResponseMs) : '—'}</td>
                  <td dir="ltr" className="text-start font-mono-jetbrains">{s.streak ? `🔥 ${s.streak}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <InterventionForm
        open={Boolean(intervene)}
        onClose={() => setIntervene(null)}
        classGroupId={classGroupId}
        candidates={candidates}
        prefill={intervene ? { kind: 'recommend_practice', studentIds: intervene.strugglingStudentIds, learningPointCode: intervene.code, sourceSignal: 'daily_challenge' } : null}
        point={intervene ? { code: intervene.code, title: intervene.title } : null}
      />
    </div>
  );
}
