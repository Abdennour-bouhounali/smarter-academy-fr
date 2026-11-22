<?php

namespace App\Domain\Progress\Engine;

/**
 * L'état CANONIQUE d'un couple (élève, learning point) — la valeur d'une ligne
 * de student_learning_point_progress, sans Eloquent.
 *
 * Une confiance, un statut expliqué, et des COMPTEURS de démonstrations
 * indépendantes. Il n'y a pas de second score : la fiabilité de la
 * confiance se lit dans les compteurs (§16 du plan).
 *
 * Borné par élèves × learning points, jamais par élèves × exercices : aucun
 * champ ne référence un exercice.
 */
final class MasteryState
{
    public const STATUS_UNASSESSED = 'unassessed';

    public const STATUS_GAP = 'gap';

    public const STATUS_REINFORCE = 'reinforce';

    public const STATUS_MASTERED = 'mastered';

    public const REASON_THRESHOLD = 'threshold';

    public const REASON_INSUFFICIENT_EVIDENCE = 'insufficient_evidence';

    public const REASON_NEEDS_ASSESSMENT = 'needs_assessment';

    public function __construct(
        public float $confidence,
        public string $status = self::STATUS_UNASSESSED,
        public string $statusReason = self::REASON_THRESHOLD,
        public int $attempts = 0,
        public int $correctCount = 0,
        public int $partialCount = 0,
        public int $failureCount = 0,
        public int $distinctItemsSuccess = 0,
        public int $distinctItemsAttempted = 0,
        public int $distinctTemplatesSuccess = 0,
        public int $assessmentSuccessCount = 0,
        public int $maxDifficultySuccess = 0,
        public ?string $lastEvidenceAt = null,
        public ?string $lastSuccessAt = null,
        public ?string $lastFailureAt = null,
    ) {}

    public function copy(): self
    {
        return clone $this;
    }

    /**
     * Les compteurs partagés par toutes les versions de moteur : ils décrivent
     * la PREUVE, pas son interprétation, donc ils ne dépendent d'aucune
     * pondération. Un moteur les met à jour par cette méthode, puis décide la
     * confiance et le statut à sa manière.
     */
    public function recordCounters(EvidenceEvent $event): void
    {
        $this->attempts++;
        $this->lastEvidenceAt = $event->submittedAt ?? $this->lastEvidenceAt;

        if (! $event->priorNonInertOnItem) {
            $this->distinctItemsAttempted++;
        }

        if ($event->outcome->isSuccess()) {
            $this->correctCount++;
            $this->lastSuccessAt = $event->submittedAt ?? $this->lastSuccessAt;
            if (! $event->priorSuccessOnItem) {
                $this->distinctItemsSuccess++;
            }
            if (! $event->priorSuccessOnTemplate) {
                $this->distinctTemplatesSuccess++;
            }
            if ($event->isAssessment()) {
                $this->assessmentSuccessCount++;
            }
            if ($event->difficulty !== null && $event->difficulty > $this->maxDifficultySuccess) {
                $this->maxDifficultySuccess = $event->difficulty;
            }
        } elseif ($event->outcome->isPartial()) {
            $this->partialCount++;
        } elseif ($event->outcome->isFailure()) {
            $this->failureCount++;
            $this->lastFailureAt = $event->submittedAt ?? $this->lastFailureAt;
        }
    }

    /** @return array<string, mixed> les colonnes de student_learning_point_progress. */
    public function toColumns(): array
    {
        return [
            'confidence' => $this->confidence,
            'status' => $this->status,
            'status_reason' => $this->statusReason,
            'attempts' => $this->attempts,
            'correct_count' => $this->correctCount,
            'partial_count' => $this->partialCount,
            'failure_count' => $this->failureCount,
            'distinct_items_success' => $this->distinctItemsSuccess,
            'distinct_items_attempted' => $this->distinctItemsAttempted,
            'distinct_templates_success' => $this->distinctTemplatesSuccess,
            'assessment_success_count' => $this->assessmentSuccessCount,
            'max_difficulty_success' => $this->maxDifficultySuccess,
            'last_evidence_at' => $this->lastEvidenceAt,
            'last_success_at' => $this->lastSuccessAt,
            'last_failure_at' => $this->lastFailureAt,
        ];
    }

    /** @param  array<string, mixed>|object  $row  une ligne de student_learning_point_progress */
    public static function fromRow(array|object $row): self
    {
        $get = fn (string $key, mixed $default = null) => is_array($row) ? ($row[$key] ?? $default) : ($row->{$key} ?? $default);
        $at = fn (string $key) => ($v = $get($key)) === null ? null : (is_string($v) ? $v : $v->toIso8601String());

        return new self(
            confidence: (float) $get('confidence', 0.5),
            status: (string) $get('status', self::STATUS_UNASSESSED),
            statusReason: (string) ($get('status_reason') ?? self::REASON_THRESHOLD),
            attempts: (int) $get('attempts', 0),
            correctCount: (int) $get('correct_count', 0),
            partialCount: (int) $get('partial_count', 0),
            failureCount: (int) $get('failure_count', 0),
            distinctItemsSuccess: (int) $get('distinct_items_success', 0),
            distinctItemsAttempted: (int) $get('distinct_items_attempted', 0),
            distinctTemplatesSuccess: (int) $get('distinct_templates_success', 0),
            assessmentSuccessCount: (int) $get('assessment_success_count', 0),
            maxDifficultySuccess: (int) $get('max_difficulty_success', 0),
            lastEvidenceAt: $at('last_evidence_at'),
            lastSuccessAt: $at('last_success_at'),
            lastFailureAt: $at('last_failure_at'),
        );
    }
}
