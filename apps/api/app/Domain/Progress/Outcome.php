<?php

namespace App\Domain\Progress;

use DomainException;

/**
 * La taxonomie CANONIQUE des issues d'une réponse — la seule, partagée par la
 * maîtrise, les taux de réussite, le dossier, la classe, l'administration et
 * les bilans de pratique. Miroir exact de `OUTCOMES` dans
 * packages/core/practice/answerEvaluator.js (verrouillé par la fixture
 * packages/core/practice/fixtures/outcomes.json et OutcomeTest).
 *
 * Sémantique (docs/architecture/EXERCISE_CONTRACT.md § 0) :
 *
 *   correct, equivalent_correct   → RÉUSSITE  : preuve positive pleine
 *   partially_correct             → PARTIEL   : preuve positive faible,
 *                                   jamais une réussite, jamais un échec
 *   incorrect                     → ÉCHEC     : preuve négative
 *   syntax_error, abandoned       → INERTE    : aucune information
 *                                   mathématique, exclu des taux
 *
 *   taux de réussite = réussites / (réussites + partiels + échecs)
 */
enum Outcome: string
{
    case Correct = 'correct';
    case EquivalentCorrect = 'equivalent_correct';
    case PartiallyCorrect = 'partially_correct';
    case Incorrect = 'incorrect';
    case SyntaxError = 'syntax_error';
    case Abandoned = 'abandoned';

    /** Une réussite pleine : c'est ce que `is_correct` et `correct_count` comptent. */
    public function isSuccess(): bool
    {
        return $this === self::Correct || $this === self::EquivalentCorrect;
    }

    public function isPartial(): bool
    {
        return $this === self::PartiallyCorrect;
    }

    public function isFailure(): bool
    {
        return $this === self::Incorrect;
    }

    /** Ne dit rien des mathématiques : ni tentative comptée, ni confiance déplacée. */
    public function isInert(): bool
    {
        return $this === self::SyntaxError || $this === self::Abandoned;
    }

    /** Le SIGNE de la preuve : réussite et partiel montent, l'échec descend. */
    public function isPositive(): bool
    {
        return $this->isSuccess() || $this->isPartial();
    }

    /** Compte dans le dénominateur du taux de réussite. */
    public function countsInSuccessRate(): bool
    {
        return ! $this->isInert();
    }

    /**
     * Lit une issue venue de l'extérieur. Une valeur inconnue est une erreur
     * de contrat, jamais un `incorrect` silencieux.
     */
    public static function fromString(string $value): self
    {
        return self::tryFrom($value) ?? throw new DomainException("Issue de réponse inconnue : {$value}");
    }

    /**
     * Les preuves antérieures à la colonne `outcome` n'ont qu'un booléen :
     * on le lit tel qu'il a été enregistré, sans rien inventer.
     */
    public static function fromLegacy(?string $outcome, bool $isCorrect): self
    {
        if ($outcome !== null && $outcome !== '') {
            return self::fromString($outcome);
        }

        return $isCorrect ? self::Correct : self::Incorrect;
    }

    /** @return string[] */
    public static function values(): array
    {
        return array_map(fn (self $o) => $o->value, self::cases());
    }

    /** @return string[] les issues qui valent une réussite, pour un `whereIn`. */
    public static function successValues(): array
    {
        return [self::Correct->value, self::EquivalentCorrect->value];
    }
}
