<?php

namespace App\Notifications;

use App\Models\AnswerReview;
use Illuminate\Notifications\Notification;

/**
 * « صحّح أستاذك إجابتك » — la cloche de l'élève (canal `database` SEULEMENT :
 * pas de courriel, décision du propriétaire 2026-10-06). Le contenu ne porte
 * ni la photo ni le commentaire : seulement de quoi ouvrir la correction
 * (`reviewId`) et la titrer. La correction elle-même se relit par
 * GET /practice/reviews/{id}, qui revérifie que l'élève en est le propriétaire.
 */
class AnswerReviewedNotification extends Notification
{
    public const TYPE = 'answer_reviewed';

    public function __construct(private AnswerReview $review, private string $lessonCode, private string $exerciseId) {}

    /** @return string[] */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return self::TYPE;
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'reviewId' => $this->review->id,
            'verdict' => $this->review->verdict,
            'lessonCode' => $this->lessonCode,
            'exerciseId' => $this->exerciseId,
            'questionId' => $this->review->questionAttempt?->question_id,
        ];
    }
}
