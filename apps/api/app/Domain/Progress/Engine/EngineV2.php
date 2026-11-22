<?php

namespace App\Domain\Progress\Engine;

/**
 * V2 — plan « Learning Point Mastery V2 » §14.
 *
 *   signe    = l'issue (réussite, partiel → +1 ; échec → −1)
 *   pas      = taux · (0,3 + 0,7 · dw)  avec dw = difficulté / niveaux
 *              — un succès difficile monte plus, un échec facile descend plus
 *   poids    = partiel × secondaire × pratique × jugé-par-le-client
 *              × indices (réussite seule)
 *              × démonstration (poids de réussite, ou poids d'échec)
 *   confiance' = clamp(confiance + signe · pas · poids, 0, 1), arrondie à 3
 *
 *   statut   = gap / reinforce par seuil, puis — quand la confiance est
 *              haute — `mastered` SEULEMENT si la preuve suffit : assez
 *              d'items DISTINCTS réussis (borné par ce que le contenu offre)
 *              et, si la configuration l'exige, une réussite d'évaluation ou
 *              un item difficile. Sinon `reinforce` avec la raison.
 *
 * Aucune constante ici : tout vient de config('mastery.engines.2'). Aucun
 * compte d'exercices : le nombre d'items par learning point arrive par le
 * contexte, comme une borne.
 */
final class EngineV2 implements MasteryEngine
{
    /** @param  array<string, mixed>  $config  config('mastery.engines.2') */
    public function __construct(private array $config, private int $levels = 5) {}

    public function version(): int
    {
        return 2;
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
        $next->confidence = $this->nextConfidence($state->confidence, $event);
        [$next->status, $next->statusReason] = $this->statusFor($next, $context);

        return $next;
    }

    private function nextConfidence(float $confidence, EvidenceEvent $event): float
    {
        $c = $this->config;
        $positive = $event->outcome->isPositive();
        $sign = $positive ? 1 : -1;

        $difficulty = $event->difficulty ?? (int) $c['default_difficulty'];
        $dw = max(1, min($this->levels, $difficulty)) / $this->levels;
        $base = (float) $c['learning_rate'] * (0.3 + 0.7 * ($positive ? $dw : 1 - $dw));

        $weight = 1.0;
        if ($event->outcome->isPartial()) {
            $weight *= (float) $c['weights']['partial'];
        }
        if ($event->role === EvidenceEvent::ROLE_SECONDARY) {
            $weight *= (float) $c['weights']['secondary'];
        }
        if ($event->isPractice()) {
            $weight *= (float) $c['weights']['practice'];
        }
        if ($event->evaluatedBy === EvidenceEvent::EVALUATED_BY_CLIENT) {
            $weight *= (float) $c['weights']['client_evaluated'];
        }
        if ($positive) {
            if ($event->hintsUsed > 0) {
                $decay = $c['hint_decay'][min($event->hintsUsed, 3)] ?? $c['hint_floor'];
                $weight *= max((float) $decay, (float) $c['hint_floor']);
            }
            $weight *= (float) ($c['demonstration'][$event->demonstrationKind] ?? $c['demonstration']['first']);
        } else {
            // Les indices n'aggravent jamais un échec ; la NATURE de la
            // démonstration, elle, compte aussi (un faux pas sur un item déjà
            // réussi est une demi-preuve).
            $weight *= (float) ($c['demonstration_failure'][$event->demonstrationKind] ?? 1.0);
        }

        return round(max(0.0, min(1.0, $confidence + $sign * $base * $weight)), 3);
    }

    /** @return array{0: string, 1: string} [statut, raison] */
    public function statusFor(MasteryState $state, EngineContext $context): array
    {
        $c = $this->config;

        if ($state->confidence < (float) $c['gap_threshold']) {
            return [MasteryState::STATUS_GAP, MasteryState::REASON_THRESHOLD];
        }
        if ($state->confidence < (float) $c['mastered_threshold']) {
            return [MasteryState::STATUS_REINFORCE, MasteryState::REASON_THRESHOLD];
        }

        // La confiance est haute — la preuve suffit-elle ?
        $need = (int) $c['min_distinct_items'];
        if ($context->availableItemsForLearningPoint !== null) {
            $need = min($need, $context->availableItemsForLearningPoint);
        }
        if ($state->distinctItemsSuccess < $need) {
            return [MasteryState::STATUS_REINFORCE, MasteryState::REASON_INSUFFICIENT_EVIDENCE];
        }

        if (($c['require_assessment'] ?? false)
            && $state->assessmentSuccessCount === 0
            && $state->maxDifficultySuccess < (int) $c['assessment_equivalent_difficulty']) {
            return [MasteryState::STATUS_REINFORCE, MasteryState::REASON_NEEDS_ASSESSMENT];
        }

        return [MasteryState::STATUS_MASTERED, MasteryState::REASON_THRESHOLD];
    }

    /** Le nombre d'items distincts exigé pour ce contexte — pour l'explication. */
    public function requiredDistinctItems(EngineContext $context): int
    {
        $need = (int) $this->config['min_distinct_items'];

        return $context->availableItemsForLearningPoint === null ? $need : min($need, $context->availableItemsForLearningPoint);
    }
}
