<?php

namespace App\Domain\Progress;

use App\Domain\Progress\Engine\MasteryState;
use App\Models\LearningPointStateTransition;
use Illuminate\Support\Carbon;

/**
 * Le seul écrivain de learning_point_state_transitions.
 *
 * Appelé là où l'état canonique change — ProgressEngine::advance (la preuve
 * vivante), ReplayService::recompute (un changement de version du moteur) et
 * la reconstruction après coup. Une ligne par changement RÉEL : si ni le
 * statut, ni la raison, ni la confiance n'ont bougé, rien n'est écrit (une
 * preuve inerte n'arrive jamais jusqu'ici).
 *
 * La trace est EXACTE, pas échantillonnée : chaque preuve qui a bougé l'état
 * laisse sa ligne. Le volume reste borné par celui du pivot
 * learning_evidence_learning_point (une ligne par preuve et par point).
 */
final class TransitionRecorder
{
    /** Le statut ou la confiance ont-ils bougé ? */
    public static function changed(?MasteryState $before, MasteryState $after): bool
    {
        // Pas de ligne avant : il y a changement dès qu'une preuve a compté.
        if ($before === null) {
            return $after->attempts > 0;
        }

        return $before->status !== $after->status
            || $before->statusReason !== $after->statusReason
            || abs($before->confidence - $after->confidence) >= 0.0005;
    }

    public static function record(
        int $userId,
        int $learningPointId,
        ?MasteryState $before,
        MasteryState $after,
        int $engineVersion,
        string $origin,
        Carbon|string|null $occurredAt,
        ?int $evidenceId = null,
    ): ?LearningPointStateTransition {
        if (! self::changed($before, $after)) {
            return null;
        }

        return LearningPointStateTransition::create(
            self::row($userId, $learningPointId, $before, $after, $engineVersion, $origin, $occurredAt, $evidenceId)
        );
    }

    /**
     * La ligne, sans l'écrire — pour les insertions par lots de la
     * reconstruction.
     *
     * @return array<string, mixed>
     */
    public static function row(
        int $userId,
        int $learningPointId,
        ?MasteryState $before,
        MasteryState $after,
        int $engineVersion,
        string $origin,
        Carbon|string|null $occurredAt,
        ?int $evidenceId = null,
    ): array {
        $at = $occurredAt === null ? Carbon::now() : ($occurredAt instanceof Carbon ? $occurredAt : Carbon::parse($occurredAt));

        return [
            'user_id' => $userId,
            'learning_point_id' => $learningPointId,
            'learning_evidence_id' => $evidenceId,
            'status_before' => $before?->status,
            'status_after' => $after->status,
            'reason_after' => $after->status === MasteryState::STATUS_UNASSESSED ? null : $after->statusReason,
            'confidence_before' => $before?->confidence,
            'confidence_after' => $after->confidence,
            'engine_version' => $engineVersion,
            'origin' => $origin,
            'occurred_at' => $at->copy()->utc(),
        ];
    }
}
