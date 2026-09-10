<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Support\MasteryModel;
use App\Models\LearningEvidence;
use App\Models\StudentLearningPointProgress;
use App\Models\User;

/**
 * Rejoue l'historique de preuves d'un couple (élève, learning point) et
 * reconstruit l'état de maîtrise.
 *
 * Pourquoi : « l'état courant doit être explicable à partir de la preuve
 * stockée » est un invariant de l'architecture, mais tant qu'il n'est qu'une
 * phrase, rien ne le vérifie. Ici il devient une assertion — un test compare
 * l'agrégat enregistré au rejeu, et échoue s'ils divergent.
 *
 * Et un filet : la confiance est mise à jour de façon incrémentale, donc une
 * pondération mal calibrée serait irrattrapable sans recalcul. Avec ce
 * rejoueur, on peut ajuster la politique plus tard et reconstruire l'existant
 * au lieu de vivre avec.
 *
 * Le rejeu est exact sur TOUT l'historique, y compris les preuves antérieures
 * au moteur de pratique : leurs colonnes de contexte sont nulles, ce qui est
 * précisément le cas « valeurs par défaut ».
 */
class MasteryRecalculator
{
    /**
     * @return array{confidence: float, status: string, attempts: int, correct_count: int}
     */
    public function replay(User $user, int $learningPointId): array
    {
        $evidence = LearningEvidence::query()
            ->whereHas('learningPoints', fn ($q) => $q->where('learning_points.id', $learningPointId))
            ->where('user_id', $user->id)
            ->with(['learningPoints' => fn ($q) => $q->where('learning_points.id', $learningPointId)])
            ->orderBy('submitted_at')
            ->orderBy('id')
            ->get();

        $confidence = MasteryModel::STARTING_CONFIDENCE;
        $attempts = 0;
        $correct = 0;

        foreach ($evidence as $row) {
            // Même écart que ProgressEngine::updateProgress : une issue inerte
            // ne compte ni comme tentative ni comme mouvement de confiance.
            if (in_array($row->outcome, ['syntax_error', 'abandoned'], true)) {
                continue;
            }

            $confidence = MasteryModel::updateConfidence(
                $confidence,
                (bool) $row->is_correct,
                $this->difficultyFor($row->level),
                (int) ($row->hints_used ?? 0),
                $row->assessment_type ?? MasteryModel::SOURCE_ASSESSMENT,
                $row->learningPoints->first()?->pivot->role ?? 'primary',
                $row->outcome,
            );
            $attempts++;
            $correct += $row->is_correct ? 1 : 0;
        }

        return [
            'confidence' => $confidence,
            'status' => MasteryModel::statusFor($confidence),
            'attempts' => $attempts,
            'correct_count' => $correct,
        ];
    }

    /**
     * Le rejeu correspond-il à l'agrégat enregistré ? La confiance est comparée
     * à 0,001 près : c'est la précision à laquelle MasteryModel arrondit, pas
     * une tolérance de confort.
     */
    public function matchesStored(User $user, int $learningPointId): bool
    {
        $stored = StudentLearningPointProgress::query()
            ->where('user_id', $user->id)
            ->where('learning_point_id', $learningPointId)
            ->first();

        if ($stored === null) {
            return false;
        }

        $replayed = $this->replay($user, $learningPointId);

        return abs((float) $stored->confidence - $replayed['confidence']) < 0.0005
            && $stored->status === $replayed['status']
            && (int) $stored->attempts === $replayed['attempts']
            && (int) $stored->correct_count === $replayed['correct_count'];
    }

    private function difficultyFor(?int $level): int
    {
        return match ($level) {
            1 => 1, 2, 3 => 2, 4 => 3, 5 => 4,
            default => MasteryModel::DEFAULT_DIFFICULTY,
        };
    }
}
