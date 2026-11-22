<?php

namespace Tests\Unit\Progress\Engine;

use App\Domain\Progress\Engine\EngineContext;
use App\Domain\Progress\Engine\EngineV1;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\Support\MasteryModel;
use PHPUnit\Framework\TestCase;

/**
 * La V1 est GELÉE : le moteur emballe Support\MasteryModel et reproduit
 * exactement l'arithmétique historique de ProgressEngine::updateProgress
 * (booléen enregistré, difficulté 1..4 par le niveau, statut par seuil).
 */
class EngineV1Test extends TestCase
{
    private function engine(): EngineV1
    {
        return new EngineV1([
            'starting_confidence' => 0.5,
            'learning_rate' => 0.22,
            'mastered_threshold' => 0.70,
            'gap_threshold' => 0.40,
            'default_difficulty' => 2,
            'level_to_difficulty' => [1 => 1, 2 => 2, 3 => 2, 4 => 3, 5 => 4],
            'weights' => ['partial' => 0.5, 'secondary' => 0.5, 'practice' => 0.9],
            'hint_decay' => [1 => 0.7, 2 => 0.5, 3 => 0.4],
        ]);
    }

    private function event(Outcome $outcome, bool $isCorrect, string $source = 'assessment', ?int $level = null, int $hints = 0, string $role = 'primary'): EvidenceEvent
    {
        return new EvidenceEvent(
            outcome: $outcome, isCorrect: $isCorrect, source: $source, role: $role,
            difficulty: $level, level: $level, hintsUsed: $hints,
            demonstrationKind: EvidenceEvent::KIND_FIRST, evaluatedBy: EvidenceEvent::EVALUATED_BY_CLIENT_LEGACY,
            priorNonInertOnItem: false, priorSuccessOnItem: false, priorSuccessOnTemplate: false,
        );
    }

    public function test_final_test_evidence_reproduces_the_historical_numbers(): void
    {
        $e = $this->engine();
        $ctx = EngineContext::unknown();
        $s = $e->apply($e->initialState(), $this->event(Outcome::Correct, true), $ctx);
        $this->assertSame(MasteryModel::updateConfidence(0.5, true), $s->confidence);
        $this->assertSame(0.643, $s->confidence);
        $s = $e->apply($s, $this->event(Outcome::Incorrect, false), $ctx);
        $this->assertSame(0.5, $s->confidence);
        $this->assertSame('reinforce', $s->status);
        $this->assertSame(2, $s->attempts);
        $this->assertSame(1, $s->correctCount);
    }

    public function test_practice_evidence_uses_the_level_to_difficulty_table_and_the_recorded_boolean(): void
    {
        $e = $this->engine();
        $ctx = EngineContext::unknown();
        // Un partiel de pratique, niveau 3, tel qu'il était enregistré : is_correct = false.
        $s = $e->apply($e->initialState(), $this->event(Outcome::PartiallyCorrect, false, 'practice_exercise', 3, 0), $ctx);
        $this->assertSame(
            MasteryModel::updateConfidence(0.5, false, 2, 0, MasteryModel::SOURCE_PRACTICE, 'primary', 'partially_correct'),
            $s->confidence,
        );
        $this->assertSame(0.436, $s->confidence);
    }

    public function test_repetition_kinds_are_ignored_by_v1(): void
    {
        $e = $this->engine();
        $ctx = EngineContext::unknown();
        $first = $e->apply($e->initialState(), $this->event(Outcome::Correct, true), $ctx);
        $repeat = new EvidenceEvent(
            outcome: Outcome::Correct, isCorrect: true, source: 'assessment', role: 'primary',
            difficulty: null, level: null, hintsUsed: 0,
            demonstrationKind: EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, evaluatedBy: 'client_legacy',
            priorNonInertOnItem: true, priorSuccessOnItem: true, priorSuccessOnTemplate: true,
        );
        $second = $e->apply($first, $repeat, $ctx);
        $this->assertSame(MasteryModel::updateConfidence(0.643, true), $second->confidence);
        // Les compteurs, eux, sont tenus — ils décrivent la preuve, pas la politique.
        $this->assertSame(1, $second->distinctItemsSuccess);
    }
}
