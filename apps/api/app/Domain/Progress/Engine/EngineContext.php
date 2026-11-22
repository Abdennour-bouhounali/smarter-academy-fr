<?php

namespace App\Domain\Progress\Engine;

/**
 * Ce que le moteur doit savoir du MONDE sans le lui demander lui-même.
 *
 * Le moteur est pur : il ne compte pas les items en base. Le registre
 * (AssessmentItemRepository) compte, met en cache, et passe le nombre ici.
 * `null` = inconnu (registre vide) : la règle de preuve minimale s'applique
 * alors sans borne.
 */
final readonly class EngineContext
{
    public function __construct(
        /** Items publiés dont ce learning point est le point PRINCIPAL. */
        public ?int $availableItemsForLearningPoint = null,
    ) {}

    public static function unknown(): self
    {
        return new self(null);
    }
}
