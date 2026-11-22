import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import * as practice from '@smarter-academy/core/practice/index.js';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchAnswerImage, fetchAnswerReview } from '../../../services/practiceService';
import { loadExercise } from '../../../features/practice/practiceContent';
import { historyEntry, formatAnswer } from '../../../features/practice/questionHistory';
import { StudentAnswer } from '../../../features/practice/QuestionHistory';
import ExamSheet from '../../../features/practice/exam/ExamSheet';
import SolutionPanel from '../../../features/practice/exam/SolutionPanel';
import RedactionText from '../../../features/practice/exam/math/RedactionText';
import AnswerImageGallery from '../../../features/practice/exam/images/AnswerImageGallery';
import ReviewStatus from '../../../features/practice/exam/images/ReviewStatus';

const { isSuccessOutcome } = practice;

/**
 * LA CORRECTION DE L'ENSEIGNANT, ouverte depuis la cloche (2026-10-06) —
 * EXACTEMENT l'exercice et l'étape corrigés, en LECTURE SEULE : la feuille
 * d'examen jusqu'à cette étape (les précédentes avec leurs réponses), puis la
 * réponse enregistrée de l'élève, ses photos (annotées au stylo rouge le cas
 * échéant), le verdict et le commentaire du professeur, et le corrigé type.
 * Rien ne s'y écrit.
 */
export default function AnswerReviewPage() {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const { reviewId } = useParams();
  useDocumentMeta(t('practice.exam.review.page.title'));
  const [state, setState] = useState({ status: 'loading' });

  const imageLoader = useCallback((id, annotated) => fetchAnswerImage(token, id, annotated), [token]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAnswerReview(token, reviewId);
        const exercise = await loadExercise(data.lessonCode, data.level, data.exerciseId);
        if (!exercise) throw new Error('exercise');
        if (!cancelled) setState({ status: 'ready', data, exercise });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => { cancelled = true; };
  }, [token, reviewId]);

  if (state.status === 'loading') {
    return <div className="sa-surface-plain sa-page sa-page--flush py-6"><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }
  if (state.status === 'error') {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush space-y-4 py-6">
        <p className="rounded-xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-200" role="alert">{t('practice.exam.review.page.notFound')}</p>
        <Link to="/espace" className="text-sm font-bold text-slate-600 hover:text-slate-900">← {t('practice.exam.review.page.back')}</Link>
      </div>
    );
  }

  const { data, exercise } = state;
  const index = Math.max(0, exercise.questions.findIndex((q) => q.id === data.questionId));
  const question = exercise.questions[index];
  const entryOf = (q, i) => {
    const a = data.questions.find((x) => x.questionId === q.id);
    if (!a) return null;
    return historyEntry({
      question: q,
      index: i,
      answer: a.answer,
      evaluation: { outcome: a.outcome, normalized: a.normalized ?? '', isCorrect: isSuccessOutcome(a.outcome), misconceptionId: null },
      hintsUsed: a.hintsUsed ?? 0,
      images: a.images ?? [],
      review: a.review ?? null,
      evaluatedBy: a.evaluatedBy ?? null,
    });
  };
  const history = exercise.questions.slice(0, index).map(entryOf).filter(Boolean);
  const current = data.questions.find((x) => x.questionId === data.questionId) ?? {};
  const answer = current.answer ?? {};
  const formatted = answer.imageOnly ? null : formatAnswer(question, answer);
  const typed = formatted?.kind === 'self' && current.evaluatedBy === 'teacher' ? { ...formatted, mark: null } : formatted;

  return (
    <div className="sa-surface-plain sa-page sa-page--flush space-y-3 py-3 sm:py-4" data-answer-review-page={data.review.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
          <Lock className="h-4 w-4" aria-hidden="true" /> {t('practice.exam.review.page.banner')}
        </p>
        <Link to={`/espace/pratique/${encodeURIComponent(data.lessonCode)}`} className="text-sm font-bold text-slate-600 hover:text-slate-900" data-review-back>
          ← {t('practice.exam.review.page.back')}
        </Link>
      </div>
      <ExamSheet exercise={exercise} questionIndex={index} history={history} imageLoader={imageLoader}>
        <div className="space-y-3" data-reviewed-step={data.questionId}>
          <div className="space-y-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
            <p className="text-xs font-bold text-slate-600">{t('practice.exam.yourAnswer')}</p>
            {typed && <StudentAnswer answer={typed} />}
            {answer.imageOnly && !answer.text && <p className="text-sm text-slate-600">{t('practice.exam.images.imageOnlyAnswer')}</p>}
            {typeof answer.work === 'string' && answer.work.trim() && (
              <div>
                <p className="text-xs font-bold text-slate-600">{t('practice.exam.work.label')}</p>
                <RedactionText text={answer.work} className="sa-exam-ink" />
              </div>
            )}
            {current.images?.length > 0 && <AnswerImageGallery images={current.images} loader={imageLoader} />}
          </div>
          <ReviewStatus review={data.review} />
          <SolutionPanel solution={question?.solution} open />
        </div>
      </ExamSheet>
    </div>
  );
}
