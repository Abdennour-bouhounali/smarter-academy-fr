<?php

namespace App\Domain\Progress\Engine;

/**
 * Le contrat d'un moteur de maîtrise : une fonction PURE.
 *
 *   (état courant, une preuve, contexte) → état suivant
 *
 * Il ne lit pas la base, ne parcourt aucun exercice, ne choisit rien, n'écrit
 * rien. Il ne connaît pas le nombre d'exercices d'une leçon — seulement, par
 * le contexte, combien d'items mesurent un learning point, pour BORNER la
 * règle de preuve minimale.
 *
 * Chaque version est gelée après publication : changer la politique, c'est
 * une nouvelle classe, une nouvelle clé de configuration, et un rejeu.
 */
interface MasteryEngine
{
    public function version(): int;

    /** L'état d'un couple (élève, learning point) avant toute preuve. */
    public function initialState(): MasteryState;

    /** Un nouvel état — jamais l'état d'entrée muté. */
    public function apply(MasteryState $state, EvidenceEvent $event, EngineContext $context): MasteryState;
}
