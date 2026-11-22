<?php

namespace App\Domain\Practice;

use App\Models\QuestionAttempt;

/**
 * LA forme d'une réponse enregistrée, partout où elle se relit : « التمرين
 * السابق » (GET /practice/sessions/{id}/answers), une étape rouverte, la
 * correction ouverte depuis la cloche, la file « تصحيح الإجابات » et le
 * panneau « إجابات تلاميذي » de l'enseignant. Photos (identifiants, jamais de
 * chemin) et correction de l'enseignant comprises.
 */
final class AttemptPresenter
{
    /** @return array<string, mixed> */
    public static function answer(QuestionAttempt $attempt): array
    {
        $attempt->loadMissing(['images', 'review']);

        return [
            'questionId' => $attempt->question_id,
            'answer' => $attempt->submitted_answer,
            'outcome' => $attempt->outcome,
            'normalized' => $attempt->normalized_answer,
            'evaluatedBy' => $attempt->evaluated_by,
            'hintsUsed' => (int) $attempt->hints_used,
            'images' => $attempt->images->reject->isExpired()->map->toClient()->values()->all(),
            'review' => $attempt->review?->toClient(),
            'submittedAt' => $attempt->submitted_at?->toIso8601String(),
        ];
    }
}
