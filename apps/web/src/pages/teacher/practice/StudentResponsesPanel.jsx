import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Lightbulb, Users } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import RichText from '../../../features/practice/RichText';
import { TONE_STYLE, ToneIcon } from '../../../features/practice/toneStyle';
import { outcomeTone } from '../../../features/practice/questionHistory';
import { formatStudentAnswer } from '../../../features/practice/teacherBank';
import RedactionText from '../../../features/practice/exam/math/RedactionText';
import StepTimer from '../../../features/practice/exam/StepTimer';
import Medal from '../../../features/practice/medals/Medal';
import { medalFor } from '../../../features/practice/exam/medals';
import { stepSeconds } from '../../../features/practice/exam/examSheet';
import { fetchExerciseStudents, fetchStudentResponses } from '../../../services/teacherPracticeService';
import { fetchTeacherAnswerImage } from '../../../services/teacher/answerReviewService';
import AnswerImageGallery from '../../../features/practice/exam/images/AnswerImageGallery';
import ReviewStatus from '../../../features/practice/exam/images/ReviewStatus';

const fullName = (s) => [s.firstName, s.lastName].filter(Boolean).join(' ') || `#${s.id}`;

/**
 * « إجابات تلاميذي » — dans la colonne latérale du lecteur enseignant.
 *
 * Combien de SES élèves (membres actifs de ses classes) ont fait cet
 * exercice ; un clic sur l'un d'eux déplie ses réponses, question par
 * question, chaque tentative avec son issue. Une seule fiche ouverte à la
 * fois : la colonne reste courte.
 */
export default function StudentResponsesPanel({ lessonCode, exerciseId, questions = [] }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState({});
  // Les photos de copie, chargées avec le jeton de l'enseignant.
  const imageLoader = useCallback((id, annotated) => fetchTeacherAnswerImage(token, id, annotated), [token]);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    setOpenId(null);
    setDetail({});
    fetchExerciseStudents(token, lessonCode, exerciseId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token, lessonCode, exerciseId]);

  const toggle = (studentId) => {
    const next = openId === studentId ? null : studentId;
    setOpenId(next);
    if (next != null && !detail[next]) {
      setDetail((d) => ({ ...d, [next]: 'loading' }));
      fetchStudentResponses(token, lessonCode, exerciseId, next)
        .then((res) => setDetail((d) => ({ ...d, [next]: res })))
        .catch(() => setDetail((d) => ({ ...d, [next]: 'error' })));
    }
  };

  const questionIndex = (id) => questions.findIndex((q) => q.id === id);

  return (
    <section
      className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200"
      aria-labelledby="student-responses-title"
      data-student-responses
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 id="student-responses-title" className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Users className="h-4 w-4 text-nav-accent" aria-hidden="true" /> {t('practice.responses.title')}
        </h2>
        {data && (
          <span
            className="rounded-full bg-nav-accent-soft px-2.5 py-0.5 text-xs font-bold text-nav-accent"
            data-responses-count={data.total}
          >
            {t('practice.responses.count', { count: data.total })}
          </span>
        )}
      </header>

      {!data && !error && <div className="h-10 animate-pulse rounded-lg bg-slate-100" />}
      {error && <p className="text-xs text-rose-700">{t('practice.responses.error')}</p>}
      {data && data.total === 0 && (
        <p className="text-xs text-slate-500" data-responses-empty>
          {t('practice.responses.empty')}
        </p>
      )}

      {data && data.total > 0 && (
        <ul className="divide-y divide-slate-100">
          {data.students.map((s) => {
            const open = openId === s.id;
            const d = detail[s.id];
            const allRight = s.questionsAnswered > 0 && s.questionsCorrect === s.questionsAnswered;
            return (
              <li key={s.id} data-response-student={s.id}>
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  aria-expanded={open}
                  className="flex w-full min-h-[44px] items-center justify-between gap-2 py-2 text-start"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{fullName(s)}</span>
                    {s.classrooms?.length > 0 && (
                      <span className="block truncate text-[11px] text-slate-500">
                        {s.classrooms.map((c) => c.name).join(' ، ')}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <bdi
                      dir="ltr"
                      className={`rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ${allRight ? TONE_STYLE.correct.chip : 'bg-slate-100 text-slate-700'}`}
                    >
                      {s.questionsCorrect}
                      {'\u00A0/\u00A0'}
                      {s.questionsAnswered}
                    </bdi>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {open && (
                  <div className="space-y-2 pb-3" data-response-detail>
                    {d === 'loading' && <div className="h-8 animate-pulse rounded bg-slate-100" />}
                    {d === 'error' && <p className="text-xs text-rose-700">{t('practice.responses.error')}</p>}
                    {d &&
                      typeof d === 'object' &&
                      d.questions.map((q) => {
                        const i = questionIndex(q.questionId);
                        const question = questions[i];
                        return (
                          <div key={q.questionId} className="rounded-lg bg-slate-50 px-2.5 py-2">
                            <p className="mb-1 text-[11px] font-bold text-slate-600">
                              {t('practice.responses.question', { n: i >= 0 ? i + 1 : q.questionId })}
                            </p>
                            <ol className="space-y-1">
                              {q.attempts.map((a) => {
                                const tone = outcomeTone(a.outcome);
                                return (
                                  <li
                                    key={`${a.attemptNumber}-${a.submittedAt}`}
                                    className="flex items-start gap-1.5 text-sm"
                                    data-response-attempt={tone}
                                  >
                                    <span
                                      className={`mt-0.5 inline-flex shrink-0 rounded-full p-0.5 ${TONE_STYLE[tone]?.chip ?? 'bg-slate-100 text-slate-600'}`}
                                    >
                                      <ToneIcon tone={tone} className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="min-w-0 flex-1 space-y-1 break-words text-slate-800">
                                      {/* Tout ce que l'élève a ÉCRIT (enregistré en base, 2026-10-06) :
                                        la réponse (formule), la démonstration « بيّن أن » ligne par
                                        ligne et sa note, les « مراحل الحساب », le temps mis. */}
                                      {typeof a.answer?.text === 'string' && a.answer.text.trim() ? (
                                        <RedactionText text={a.answer.text} className="text-sm" />
                                      ) : (
                                        <span className="block" dir="auto">
                                          <RichText>{formatStudentAnswer(question, a.answer, a.normalized)}</RichText>
                                        </span>
                                      )}
                                      {a.answer?.selfMark && (
                                        <span className="block text-[11px] text-slate-600" data-response-selfmark>
                                          {t(`practice.exam.selfCheck.recap.${a.answer.selfMark}`, { ns: 'student' })}
                                        </span>
                                      )}
                                      {typeof a.answer?.work === 'string' && a.answer.work.trim() && (
                                        <span
                                          className="block rounded bg-white px-2 py-1 ring-1 ring-slate-200"
                                          data-response-work
                                        >
                                          <span className="block text-[11px] font-bold text-slate-600">
                                            {t('practice.exam.work.label', { ns: 'student' })}
                                          </span>
                                          <RedactionText text={a.answer.work} className="text-sm" />
                                        </span>
                                      )}
                                      {(Number.isFinite(a.answer?.seconds) ||
                                        medalFor({
                                          outcome: a.outcome,
                                          answerType: question?.answerType,
                                          hintsUsed: a.hintsUsed,
                                          seconds: a.answer?.seconds ?? null,
                                          limit: question ? stepSeconds(question) : null,
                                          evaluatedBy: a.evaluatedBy,
                                        })) && (
                                        <span className="flex flex-wrap items-center gap-1.5" data-response-meta>
                                          {Number.isFinite(a.answer?.seconds) && question && (
                                            <StepTimer
                                              limit={stepSeconds(question)}
                                              stoppedSeconds={a.answer.seconds}
                                            />
                                          )}
                                          {(() => {
                                            const m = medalFor({
                                              outcome: a.outcome,
                                              answerType: question?.answerType,
                                              hintsUsed: a.hintsUsed,
                                              seconds: a.answer?.seconds ?? null,
                                              limit: question ? stepSeconds(question) : null,
                                              evaluatedBy: a.evaluatedBy,
                                            });
                                            return m ? (
                                              <Medal
                                                medal={m}
                                                size={18}
                                                title={t(`practice.medals.name.${m}`, { ns: 'student' })}
                                              />
                                            ) : null;
                                          })()}
                                        </span>
                                      )}
                                      {/* Photos de la copie et correction (« تصحيح الأستاذ », 2026-10-06). */}
                                      {a.images?.length > 0 && (
                                        <AnswerImageGallery images={a.images} loader={imageLoader} size="sm" />
                                      )}
                                      <ReviewStatus review={a.review} pending={a.normalized === 'review:pending'} />
                                    </span>
                                    {a.hintsUsed > 0 && (
                                      <span
                                        className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-amber-700"
                                        title={t('practice.responses.hints', { count: a.hintsUsed })}
                                      >
                                        <Lightbulb className="h-3 w-3" aria-hidden="true" />
                                        {a.hintsUsed}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        );
                      })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
