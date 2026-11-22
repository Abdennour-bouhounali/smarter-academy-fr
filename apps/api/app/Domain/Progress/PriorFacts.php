<?php

namespace App\Domain\Progress;

/**
 * Ce qu'un élève a déjà fait sur UN item et sur SON gabarit, avant la preuve
 * que l'on classe. Des entiers et des booléens — pas de lignes, pas de
 * requêtes — pour que le cœur d'EvidenceClassifier reste pur et que le rejeu
 * puisse les fabriquer en mémoire.
 */
final readonly class PriorFacts
{
    public function __construct(
        /** Toutes les preuves antérieures sur l'item, inertes comprises → attempt_number. */
        public int $rowsOnItem,
        /** Les preuves antérieures NON inertes sur l'item. */
        public int $nonInertOnItem,
        public bool $successOnItem,
        /** Les preuves antérieures non inertes sur le gabarit (= l'item quand il n'en a pas). */
        public int $nonInertOnTemplate,
        public bool $successOnTemplate,
    ) {}

    public static function none(): self
    {
        return new self(0, 0, false, 0, false);
    }
}
