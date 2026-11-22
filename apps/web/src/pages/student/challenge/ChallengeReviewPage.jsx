import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Dumbbell, X } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchChallengeReview } from '../../../services/dailyChallengeService';
import ExerciseStatement from '../../../features/practice/ExerciseStatement';
import RichText from '../../../features/practice/RichText';
import { correctAnswerText, formatSeconds, reasonKey } from '../../../features/dailyChallenge/challengeModel';
import MathLabel from '../../../lessons/common/components/MathLabel';

/** Ce que l'élève avait répondu, en texte (QCM : le contenu du choix). */
function answerText(question, answer) {
  if (!answer) return null;
  if (answer.choiceId) return question?.choices?.find((c) => c.id === answer.choiceId)?.content ?? null;
  if (answer.choiceIds) return answer.choiceIds.map((id) => question?.choices?.find((c) => c.id === id)?.content).filter(Boolean).join(' ; ');
  return typeof answer.value === 'string' ? answer.value : null;
}

/**
 * La REVUE d'un défi terminé : chaque question, la réponse donnée, la bonne,
 * le temps, les points, le point d'apprentissage — et une porte vers la
 * pratique de ce point. Lecture seule : un défi ne se rejoue pas pour des
 * points.
 */
export default function ChallengeReviewPage() {
  const { t } = useTranslation('challenge');
  useDocumentMeta(t('review.title'));
  const { attemptId } = useParams();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchChallengeReview(token, attemptId)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(t(`reasons.${reasonKey(e?.reason)}`)));
    return () => { cancelled = true; };
  }, [token, attemptId, t]);

  return (
    <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-4" data-challenge-review>
      <Link to="/espace/defi/historique" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-inter text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowBack size={16} aria-hidden="true" /> {t('review.back')}
      </Link>
      {error && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {!data && !error && <p role="status" className="text-sm text-slate-500">{t('loading')}</p>}
      {data && (
        <>
          <header className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="font-space text-2xl font-black text-slate-900">{t('review.title')}</h1>
              <p className="font-inter text-sm text-slate-500">{t('review.date', { date: data.attempt.date })}</p>
            </div>
            <p dir="ltr" className="font-space text-3xl font-black text-slate-900">{data.attempt.score.total}</p>
          </header>
          <p className="rounded-2xl bg-nav-accent-soft p-3 font-inter text-sm text-indigo-900">{t('review.notReplayable')}</p>

          <ol className="space-y-3">
            {data.questions.map((q) => {
              const question = q.content?.question;
              const given = answerText(question, q.answer);
              const right = correctAnswerText(question, q.reveal);
              return (
                <li key={q.position} className="rounded-3xl bg-white p-4 ring-1 ring-slate-200 sm:p-5" data-review-question={q.isCorrect ? 'correct' : 'wrong'}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${q.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {q.isCorrect ? <Check size={16} aria-label={t('session.state.correct')} /> : <X size={16} aria-label={t('session.state.wrong')} />}
                    </span>
                    <span className="font-space font-bold text-slate-900">{q.position}</span>
                    {q.learningPoint?.title && <span className="font-inter text-xs text-nav-accent"><MathLabel>{q.learningPoint.title}</MathLabel></span>}
                    <span dir="ltr" className="ms-auto font-mono-jetbrains text-xs text-slate-500">{formatSeconds(q.responseTimeMs)} s · +{q.score.total}</span>
                  </div>
                  {q.content?.statement?.content && <div className="mt-3 rounded-2xl bg-slate-50 p-3"><ExerciseStatement content={q.content.statement.content} visual={q.content.statement.visual} formulas={q.content.statement.formulas} table={q.content.statement.table} figure={q.content.statement.figure} /></div>}
                  <p className="mt-3 text-lg font-bold text-slate-900"><RichText>{question?.statement ?? ''}</RichText></p>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className={`rounded-2xl p-3 ${q.isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      <dt className="font-inter text-xs text-slate-500">{t('review.yourAnswer')}</dt>
                      <dd className="font-bold text-slate-900">{given ? <RichText>{given}</RichText> : t('review.noAnswer')}</dd>
                    </div>
                    {!q.isCorrect && right && (
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <dt className="font-inter text-xs text-slate-500">{t('feedback.correctAnswer')}</dt>
                        <dd className="font-bold text-slate-900"><RichText>{right}</RichText></dd>
                      </div>
                    )}
                  </dl>
                  {q.reveal?.explanation && <p className="mt-2 text-sm text-slate-600"><RichText>{q.reveal.explanation}</RichText></p>}
                  {!q.isCorrect && q.lesson?.code && (
                    <Link to={`/espace/pratique/${q.lesson.code}`} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-nav-accent px-4 text-sm font-bold text-white hover:bg-[#3350c4]">
                      <Dumbbell size={16} aria-hidden="true" /> {t('review.practice')}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
