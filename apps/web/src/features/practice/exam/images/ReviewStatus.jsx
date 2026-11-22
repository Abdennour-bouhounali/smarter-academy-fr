import { useTranslation } from 'react-i18next';
import { CheckCircle2, Hourglass, MessageSquareText, XCircle } from 'lucide-react';

/**
 * La correction de l'enseignant d'une étape (« تصحيح الأستاذ ») : en attente,
 * ou son verdict et son commentaire. `review` = { kind, status, verdict,
 * comment } (AnswerReview::toClient). Une demande retirée (l'élève a quitté la
 * classe et s'est noté) ne s'affiche pas.
 */
export default function ReviewStatus({ review, pending = false }) {
  const { t } = useTranslation('student');
  if (!review && !pending) return null;
  if (review?.status === 'withdrawn') return null;

  if (pending || review?.status === 'pending') {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900 ring-1 ring-sky-200" role="status" data-review-status="pending">
        <Hourglass className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t(review?.kind === 'feedback' ? 'practice.exam.review.pendingFeedback' : 'practice.exam.review.pending')}</span>
      </p>
    );
  }

  const correct = review.verdict === 'correct';
  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <div className={`space-y-1 rounded-lg px-3 py-2 text-sm ring-1 ${correct ? 'bg-emerald-50 text-emerald-950 ring-emerald-200' : 'bg-rose-50 text-rose-950 ring-rose-200'}`} data-review-status={review.verdict}>
      <p className="flex items-center gap-2 font-bold">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t(`practice.exam.review.verdict.${review.kind === 'feedback' ? 'feedback' : 'verdict'}.${correct ? 'correct' : 'incorrect'}`)}
      </p>
      {review.comment && (
        <p className="flex items-start gap-2 whitespace-pre-line" data-review-comment>
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
          <span><span className="font-semibold">{t('practice.exam.review.comment')}: </span>{review.comment}</span>
        </p>
      )}
    </div>
  );
}
