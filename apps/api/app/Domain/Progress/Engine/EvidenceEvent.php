<?php

namespace App\Domain\Progress\Engine;

use App\Domain\Progress\Outcome;

/**
 * UNE preuve, telle que le moteur la voit : ce qui s'est passé, et ce que
 * l'élève avait déjà montré sur le même item / le même gabarit. Rien ici ne
 * vient d'une requête HTTP — tout est résolu par le serveur avant d'entrer.
 *
 * Immuable : le moteur est une fonction pure de (état, événement, contexte).
 */
final readonly class EvidenceEvent
{
    public const SOURCE_ASSESSMENT = 'assessment';

    public const SOURCE_PRACTICE = 'practice_exercise';

    public const ROLE_PRIMARY = 'primary';

    public const ROLE_SECONDARY = 'secondary';

    public const KIND_FIRST = 'first';

    public const KIND_VARIANT = 'variant';

    public const KIND_RETRY_AFTER_FAILURE = 'retry_after_failure';

    public const KIND_REPEAT_AFTER_SUCCESS = 'repeat_after_success';

    public const KINDS = [
        self::KIND_FIRST, self::KIND_VARIANT, self::KIND_RETRY_AFTER_FAILURE, self::KIND_REPEAT_AFTER_SUCCESS,
    ];

    public const EVALUATED_BY_SERVER = 'server';

    public const EVALUATED_BY_CLIENT = 'client';

    public const EVALUATED_BY_CLIENT_VERIFIED = 'client_verified';

    /**
     * Jugée par l'ENSEIGNANT de l'élève (« تصحيح الأستاذ », 2026-10-06) : une
     * démonstration ou une copie en photo. Un juge humain de confiance — pleine
     * valeur, comme le serveur (seul `client` est minoré, EngineV2).
     */
    public const EVALUATED_BY_TEACHER = 'teacher';

    /** Preuve antérieure au registre : un client de confiance, sans vérification possible. */
    public const EVALUATED_BY_CLIENT_LEGACY = 'client_legacy';

    public function __construct(
        public Outcome $outcome,
        /** Le booléen ENREGISTRÉ (`learning_evidence.is_correct`) — la V1 le lit tel quel. */
        public bool $isCorrect,
        /** 'assessment' | 'practice_exercise' */
        public string $source,
        /** 'primary' | 'secondary' — le rôle du learning point CIBLE dans cette question. */
        public string $role,
        /** 1..levels, résolue par le serveur ; null quand le contenu n'en déclare aucune. */
        public ?int $difficulty,
        /** Niveau de pratique 1..5 ; null pour le test final. La V1 en dérive sa difficulté. */
        public ?int $level,
        public int $hintsUsed,
        /** Une des quatre KIND_* (§9 du plan). */
        public string $demonstrationKind,
        /** Une des EVALUATED_BY_*. */
        public string $evaluatedBy,
        /** Ce que l'élève avait déjà montré — calculé par EvidenceClassifier. */
        public bool $priorNonInertOnItem,
        public bool $priorSuccessOnItem,
        public bool $priorSuccessOnTemplate,
        /** ISO-8601 ; informatif (horodatages de l'état). */
        public ?string $submittedAt = null,
    ) {}

    public function isAssessment(): bool
    {
        return $this->source === self::SOURCE_ASSESSMENT;
    }

    public function isPractice(): bool
    {
        return $this->source === self::SOURCE_PRACTICE;
    }
}
