import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Send, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { loadExercise } from '../../features/practice/practiceContent';
import RichText from '../../features/practice/RichText';
import { TONE_STYLE, ToneIcon } from '../../features/practice/toneStyle';
import { outcomeTone } from '../../features/practice/questionHistory';
import { formatStudentAnswer } from '../../features/practice/teacherBank';
import RedactionText from '../../features/practice/exam/math/RedactionText';
import SolutionPanel from '../../features/practice/exam/SolutionPanel';
import StepTimer from '../../features/practice/exam/StepTimer';
import { stepMarks, stepSeconds } from '../../features/practice/exam/examSheet';
import AnswerImageGallery from '../../features/practice/exam/images/AnswerImageGallery';
import AnnotationEditor from '../../features/teacher/reviews/AnnotationEditor';
import { REVIEWS_CHANGED } from '../../features/teacher/reviews/useReviewCount';
import {
  decideReview, fetchReviewQueue, fetchTeacherAnswerImage, uploadAnnotation,
} from '../../services/teacher/answerReviewService';
import { TeacherPage, Loading, ErrorBox, btnPrimary, formatDate } from './teacherUi';

const fullName = (s) => [s?.firstName, s?.lastName].filter(Boolean).join(' ') || `#${s?.id}`;

/**
 * « Réponses à corriger » (propriétaire, 2026-10-06) — les copies des élèves que
 * l'enseignant a mis en « Correction par le professeur » : photos de copie, démonstrations
 * « Montrer que », étapes à rédaction exigée. Les plus anciennes d'abord, filtrables
 * par classe.
 *
 * Pour chaque copie : l'énoncé de l'étape (lu dans le contenu, comme le
 * lecteur), ce que l'élève a écrit, ses photos (agrandir, « Corriger sur la photo »
 * au stylo rouge), le corrigé type replié, puis le verdict et un commentaire.
 * Le serveur enregistre (AnswerReviewService) et notifie l'élève.
 */
export default function TeacherReviewsPage() {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  useDocumentMeta(t('reviews.title'), t('reviews.subtitle'));
  const [classroom, setClassroom] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [exercises, setExercises] = useState({});
  const [annotating, setAnnotating] = useState(null);

  const imageLoader = useCallback((id, annotated) => fetchTeacherAnswerImage(token, id, annotated), [token]);

  const load = useCallback(() => {
    if (!token) return;
    setError(false);
    fetchReviewQueue(token, { classroom: classroom || null })
      .then(setData)
      .catch(() => setError(true));
  }, [token, classroom]);
  useEffect(() => { load(); }, [load]);

  // Le contenu de chaque exercice (énoncé, corrigé type), chargé une fois.
  useEffect(() => {
    if (!data) return;
    for (const item of data.items) {
      const key = `${item.lessonCode}:${item.exerciseId}`;
      if (exercises[key] !== undefined) continue;
      setExercises((m) => ({ ...m, [key]: null }));
      loadExercise(item.lessonCode, item.level, item.exerciseId)
        .then((ex) => setExercises((m) => ({ ...m, [key]: ex ?? false })))
        .catch(() => setExercises((m) => ({ ...m, [key]: false })));
    }
  }, [data, exercises]);

  const decided = (reviewId) => {
    setData((d) => d && { ...d, total: Math.max(0, d.total - 1), items: d.items.filter((i) => i.review.id !== reviewId) });
    window.dispatchEvent(new Event(REVIEWS_CHANGED));
  };

  // L'annotation enregistrée : la vignette passe à « corrigée » dans la file.
  const saveAnnotation = async (blob) => {
    const target = annotating;
    const res = await uploadAnnotation(token, target.id, blob);
    setData((d) => d && {
      ...d,
      items: d.items.map((i) => ({ ...i, images: i.images.map((im) => (im.id === target.id ? res.image : im)) })),
    });
  };

  return (
    <TeacherPage
      title={t('reviews.title')}
      subtitle={t('reviews.subtitle')}
      actions={data?.classrooms?.length > 1 ? (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {t('reviews.classFilter')}
          <select
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
            data-review-class-filter
          >
            <option value="">{t('reviews.allClasses')}</option>
            {data.classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      ) : null}
    >
      {error && <ErrorBox message={t('reviews.loadError')} onRetry={load} />}
      {!data && !error && <Loading />}
      {data && (
        <div className="space-y-4" data-review-queue>
          <p className="text-sm font-bold text-slate-700" data-review-total={data.total}>{t('reviews.count', { count: data.total })}</p>
          {data.items.length === 0 && (
            <p className="rounded-xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200" data-review-empty>{t('reviews.empty')}</p>
          )}
          {data.items.map((item) => (
            <ReviewCard
              key={item.review.id}
              item={item}
              exercise={exercises[`${item.lessonCode}:${item.exerciseId}`]}
              imageLoader={imageLoader}
              onAnnotate={setAnnotating}
              onDecided={decided}
            />
          ))}
        </div>
      )}
      {annotating && (
        <AnnotationEditor image={annotating} loader={imageLoader} onSave={saveAnnotation} onClose={() => setAnnotating(null)} />
      )}
    </TeacherPage>
  );
}

function ReviewCard({ item, exercise, imageLoader, onAnnotate, onDecided }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [verdict, setVerdict] = useState(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const questions = exercise?.questions ?? [];
  const index = questions.findIndex((q) => q.id === item.questionId);
  const question = index >= 0 ? questions[index] : null;
  const mark = index >= 0 ? stepMarks(questions)[index] : null;
  const answer = item.answer ?? {};
  const isFeedback = item.review.kind === 'feedback';
  const text = typeof answer.text === 'string' && answer.text.trim() ? answer.text : null;
  const work = typeof answer.work === 'string' && answer.work.trim() ? answer.work : null;
  const typed = !answer.imageOnly && !text ? formatStudentAnswer(question, answer, item.normalized) : null;
  const tone = outcomeTone(item.outcome);

  const send = async () => {
    if (!verdict || sending) return;
    setSending(true);
    setError(null);
    try {
      await decideReview(token, item.review.id, verdict, comment.trim());
      onDecided(item.review.id);
    } catch (e) {
      setError(e?.status === 409 ? t('reviews.alreadyReviewed') : (e?.message || t('common.error')));
      if (e?.status === 409) onDecided(item.review.id);
    } finally {
      setSending(false);
    }
  };

  const choice = (value, Icon, label) => (
    <button
      type="button"
      onClick={() => setVerdict(value)}
      aria-pressed={verdict === value}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-colors ${
        verdict === value
          ? (value === 'correct' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-rose-600 bg-rose-50 text-rose-900')
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
      }`}
      data-review-verdict={value}
    >
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );

  return (
    <article className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5" data-review-item={item.review.id}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{fullName(item.student)}</p>
          <p className="text-xs text-slate-500">
            {item.student?.classrooms?.map((c) => c.name).join(', ')}
            {item.submittedAt && <> · {t('reviews.submittedAt')} {formatDate(item.submittedAt)}</>}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isFeedback ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-900'}`} data-review-kind={item.review.kind}>
          {t(`reviews.kind.${item.review.kind}`)}
        </span>
      </header>

      <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
        <p className="text-xs font-semibold text-slate-500">
          {item.lessonTitle} · {t('reviews.level', { level: item.level })}
          {exercise?.metadata?.exam?.heading && <> · {exercise.metadata.exam.heading}</>}
        </p>
        {question ? (
          <p className="mt-1 text-[15px] leading-relaxed text-slate-900">
            <span className="font-bold">
              {t('reviews.question')} {mark?.step && <bdi dir="ltr">{mark.step}</bdi>}{mark?.sub && <> ({mark.sub})</>}:{' '}
            </span>
            <RichText>{question.statement}</RichText>
          </p>
        ) : exercise === null ? <span className="mt-1 block h-5 w-2/3 animate-pulse rounded bg-slate-200" /> : null}
      </div>

      <div className="space-y-2">
        {isFeedback && (
          <p className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm ${TONE_STYLE[tone]?.chip ?? ''}`} data-review-auto>
            <ToneIcon tone={tone} className="h-4 w-4" /> <span className="font-bold">{t('reviews.autoVerdict')}</span>
          </p>
        )}
        {typed && typed !== '—' && (
          <div>
            <p className="text-xs font-bold text-slate-600">{t('reviews.typedAnswer')}</p>
            <p className="text-base text-slate-900" dir="auto"><RichText>{typed}</RichText></p>
          </div>
        )}
        {text && (
          <div>
            <p className="text-xs font-bold text-slate-600">{t('reviews.proof')}</p>
            <RedactionText text={text} className="sa-exam-ink text-base" />
          </div>
        )}
        {work && (
          <div>
            <p className="text-xs font-bold text-slate-600">{t('reviews.work')}</p>
            <RedactionText text={work} className="sa-exam-ink text-base" />
          </div>
        )}
        {answer.imageOnly && <p className="text-sm text-slate-600">{t('reviews.noTyped')}</p>}
        {item.images?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-600">{t('reviews.photos')}</p>
            <AnswerImageGallery images={item.images} loader={imageLoader} onAnnotate={onAnnotate} />
          </div>
        )}
        {Number.isFinite(answer.seconds) && question && (
          <p className="flex items-center gap-2 text-xs text-slate-600">
            {t('reviews.time')} <StepTimer limit={stepSeconds(question, exercise)} stoppedSeconds={answer.seconds} />
          </p>
        )}
        {question?.solution && <SolutionPanel solution={question.solution} />}
      </div>

      <fieldset className="space-y-2 border-t border-slate-100 pt-3">
        <legend className="mb-1 text-sm font-bold text-slate-800">{t('reviews.verdictLabel')}</legend>
        <div className="flex flex-wrap gap-2">
          {choice('correct', CheckCircle2, isFeedback ? t('reviews.feedbackCorrect') : t('reviews.correct'))}
          {choice('incorrect', XCircle, isFeedback ? t('reviews.feedbackIncorrect') : t('reviews.incorrect'))}
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">{t('reviews.commentLabel')}</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={2}
            dir="auto"
            placeholder={t('reviews.commentPlaceholder')}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-nav-accent focus:outline-none focus:ring-1 focus:ring-nav-accent"
            data-review-comment-input
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={send} disabled={!verdict || sending} className={btnPrimary} data-review-send>
            <Send className="h-4 w-4" aria-hidden="true" /> {t('reviews.send')}
          </button>
          {error && <p className="text-sm font-semibold text-rose-700" role="alert">{error}</p>}
        </div>
      </fieldset>
    </article>
  );
}
