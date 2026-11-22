<?php

namespace App\Domain\Progress\Engine;

use App\Domain\Progress\Support\MasteryModel;

/**
 * V1 — l'arithmétique HISTORIQUE, gelée.
 *
 * Reproduit exactement ProgressEngine::updateProgress d'avant la V2 : la
 * confiance passe par Support\MasteryModel::updateConfidence avec le booléen
 * `is_correct` tel qu'il a été ENREGISTRÉ (donc `partially_correct` y compte
 * comme un échec pondéré — c'était le comportement, on le reproduit, on ne le
 * corrige pas ici), la difficulté vient du niveau par la table 1..5 → 1..4,
 * et le statut n'a qu'une raison : le seuil.
 *
 * Les compteurs de la V2 sont tout de même tenus (ils décrivent la preuve,
 * pas la politique) : ils n'influencent ni la confiance ni le statut V1.
 *
 * Elle existe pour deux choses : vérifier qu'un rejeu V1 redonne l'état
 * enregistré, et revenir en arrière. Ne pas la modifier.
 */
final class EngineV1 implements MasteryEngine
{
    /** @param  array<string, mixed>  $config  config('mastery.engines.1') */
    public function __construct(private array $config) {}

    public function version(): int
    {
        return 1;
    }

    public function initialState(): MasteryState
    {
        return new MasteryState(confidence: (float) $this->config['starting_confidence']);
    }

    public function apply(MasteryState $state, EvidenceEvent $event, EngineContext $context): MasteryState
    {
        if ($event->outcome->isInert()) {
            return $state->copy();
        }

        $next = $state->copy();
        $next->recordCounters($event);

        $difficulty = $event->level !== null
            ? ($this->config['level_to_difficulty'][$event->level] ?? $this->config['default_difficulty'])
            : $this->config['default_difficulty'];

        $next->confidence = MasteryModel::updateConfidence(
            $state->confidence,
            $event->isCorrect,
            (int) $difficulty,
            $event->hintsUsed,
            $event->source,
            $event->role,
            $event->outcome->value,
        );
        $next->status = MasteryModel::statusFor($next->confidence);
        $next->statusReason = MasteryState::REASON_THRESHOLD;

        return $next;
    }
}
