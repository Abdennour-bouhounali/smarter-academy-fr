<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une réponse en attente de la correction de l'enseignant (« تصحيح الأستاذ »).
 * Voir AnswerReviewService et la migration create_answer_images_and_reviews.
 */
class AnswerReview extends Model
{
    public const KIND_VERDICT = 'verdict';

    public const KIND_FEEDBACK = 'feedback';

    public const PENDING = 'pending';

    public const REVIEWED = 'reviewed';

    /** L'élève a quitté la classe (ou repassé en autonomie) et s'est noté lui-même. */
    public const WITHDRAWN = 'withdrawn';

    protected $fillable = [
        'question_attempt_id', 'student_id', 'kind', 'status', 'verdict', 'comment', 'reviewer_id', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function questionAttempt(): BelongsTo
    {
        return $this->belongsTo(QuestionAttempt::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    /** Ce que l'élève (et le panneau de l'enseignant) lisent de la correction. */
    public function toClient(): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'status' => $this->status,
            'verdict' => $this->verdict,
            'comment' => $this->comment,
            'reviewedAt' => $this->reviewed_at?->toIso8601String(),
        ];
    }
}
