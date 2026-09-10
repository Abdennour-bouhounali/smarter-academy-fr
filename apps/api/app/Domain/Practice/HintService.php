<?php

namespace App\Domain\Practice;

use App\Models\HintEvent;
use App\Models\QuestionAttempt;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Révèle les indices un par un, et les trace.
 *
 * Le client ne connaît que le NOMBRE d'indices d'une question ; leur contenu
 * ne descend qu'ici, un à la fois. Il ne peut donc pas sauter au troisième —
 * ce qui préserve la progressivité voulue par la cible §12, plutôt que de
 * compter sur la retenue de l'interface.
 */
class HintService
{
    public function __construct(private ExerciseRepository $exercises) {}

    /**
     * @return array{index: int, type: string, content: string, remaining: int}
     */
    public function reveal(QuestionAttempt $attempt, string $lessonCode, string $exerciseId): array
    {
        $question = $this->exercises->findQuestion($lessonCode, $exerciseId, $attempt->question_id);
        if ($question === null) {
            throw new DomainException('Question inconnue.');
        }

        $hints = $question['hints'] ?? [];
        $next = $attempt->hints_used + 1;
        if ($next > count($hints)) {
            throw new DomainException('Il n\'y a plus d\'indice pour cette question.');
        }

        $hint = $hints[$next - 1];

        DB::transaction(function () use ($attempt, $next, $hint) {
            HintEvent::firstOrCreate(
                ['question_attempt_id' => $attempt->id, 'hint_index' => $next],
                ['hint_type' => $hint['type'] ?? 'look', 'requested_at' => now()],
            );
            $attempt->update(['hints_used' => $next]);
        });

        return [
            'index' => $next,
            'type' => $hint['type'] ?? 'look',
            'content' => $hint['content'] ?? '',
            'remaining' => count($hints) - $next,
        ];
    }
}
