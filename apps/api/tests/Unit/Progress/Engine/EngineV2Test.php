<?php

namespace Tests\Unit\Progress\Engine;

use App\Domain\Progress\Engine\EngineContext;
use App\Domain\Progress\Engine\EngineV2;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Outcome;
use PHPUnit\Framework\TestCase;

/**
 * Le moteur V2 comme fonction pure : chaque ligne du §14 du plan, et les
 * invariants d'acceptation du §29 du prompt d'implémentation.
 */
class EngineV2Test extends TestCase
{
    private const CONFIG = [
        'starting_confidence' => 0.5,
        'learning_rate' => 0.22,
        'mastered_threshold' => 0.70,
        'gap_threshold' => 0.40,
        'default_difficulty' => 3,
        'weights' => ['partial' => 0.4, 'secondary' => 0.5, 'practice' => 0.9, 'client_evaluated' => 0.5],
        'hint_decay' => [1 => 0.7, 2 => 0.5, 3 => 0.4],
        'hint_floor' => 0.4,
        'demonstration' => ['first' => 1.0, 'variant' => 0.7, 'retry_after_failure' => 0.6, 'repeat_after_success' => 0.1],
        'demonstration_failure' => ['first' => 1.0, 'variant' => 1.0, 'retry_after_failure' => 1.0, 'repeat_after_success' => 0.5],
        'min_distinct_items' => 3,
        'require_assessment' => true,
        'assessment_equivalent_difficulty' => 4,
    ];

    private function engine(array $override = []): EngineV2
    {
        return new EngineV2(array_replace_recursive(self::CONFIG, $override), 5);
    }

    /** Une preuve, avec des valeurs par défaut « test final, première fois, sans indice ». */
    private function event(array $o = []): EvidenceEvent
    {
        $outcome = $o['outcome'] ?? Outcome::Correct;

        return new EvidenceEvent(
            outcome: $outcome,
            isCorrect: $outcome->isSuccess(),
            source: $o['source'] ?? EvidenceEvent::SOURCE_ASSESSMENT,
            role: $o['role'] ?? EvidenceEvent::ROLE_PRIMARY,
            difficulty: $o['difficulty'] ?? 3,
            level: $o['level'] ?? null,
            hintsUsed: $o['hints'] ?? 0,
            demonstrationKind: $o['kind'] ?? EvidenceEvent::KIND_FIRST,
            evaluatedBy: $o['evaluatedBy'] ?? EvidenceEvent::EVALUATED_BY_SERVER,
            priorNonInertOnItem: $o['priorAttempt'] ?? false,
            priorSuccessOnItem: $o['priorSuccess'] ?? false,
            priorSuccessOnTemplate: $o['priorTemplateSuccess'] ?? ($o['priorSuccess'] ?? false),
            submittedAt: $o['at'] ?? '2026-09-24T10:00:00+00:00',
        );
    }

    /** Applique une suite d'événements sur un état neuf. */
    private function replayEvents(array $events, ?EngineContext $ctx = null, ?EngineV2 $engine = null): MasteryState
    {
        $engine ??= $this->engine();
        $ctx ??= EngineContext::unknown();
        $state = $engine->initialState();
        foreach ($events as $e) {
            $state = $engine->apply($state, $e, $ctx);
        }

        return $state;
    }

    public function test_a_first_final_test_success_moves_confidence_by_the_v1_step(): void
    {
        $s = $this->replayEvents([$this->event()]);
        // 0.22 · (0.3 + 0.7 · 3/5) = 0.1584 → 0.658
        $this->assertSame(0.658, $s->confidence);
        $this->assertSame(MasteryState::STATUS_REINFORCE, $s->status);
        $this->assertSame(1, $s->distinctItemsSuccess);
        $this->assertSame(1, $s->assessmentSuccessCount);
    }

    public function test_the_engine_never_mutates_its_input_state(): void
    {
        $engine = $this->engine();
        $initial = $engine->initialState();
        $engine->apply($initial, $this->event(), EngineContext::unknown());
        $this->assertSame(0.5, $initial->confidence);
        $this->assertSame(0, $initial->attempts);
    }

    public function test_inert_outcomes_change_nothing(): void
    {
        $s = $this->replayEvents([$this->event(['outcome' => Outcome::SyntaxError]), $this->event(['outcome' => Outcome::Abandoned])]);
        $this->assertSame(0.5, $s->confidence);
        $this->assertSame(0, $s->attempts);
        $this->assertSame(MasteryState::STATUS_UNASSESSED, $s->status);
    }

    public function test_repeating_the_same_solved_item_cannot_farm_mastery(): void
    {
        // Q1 juste, puis Q1 juste, Q1 juste… dix fois : un item distinct, des reprises à 0,1.
        $events = [$this->event()];
        for ($i = 0; $i < 9; $i++) {
            $events[] = $this->event(['kind' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, 'priorAttempt' => true, 'priorSuccess' => true]);
        }
        $repeated = $this->replayEvents($events);

        $distinct = [];
        for ($i = 0; $i < 10; $i++) {
            $distinct[] = $this->event();
        }
        $independent = $this->replayEvents($distinct);

        $this->assertSame(1, $repeated->distinctItemsSuccess);
        $this->assertSame(10, $independent->distinctItemsSuccess);
        $this->assertLessThan($independent->confidence, $repeated->confidence);
        $this->assertSame(MasteryState::STATUS_REINFORCE, $repeated->status);
        $this->assertSame(MasteryState::REASON_INSUFFICIENT_EVIDENCE, $repeated->statusReason);
        $this->assertSame(MasteryState::STATUS_MASTERED, $independent->status);
    }

    public function test_three_distinct_successes_are_materially_stronger_than_one_item_three_times(): void
    {
        $same = $this->replayEvents([
            $this->event(),
            $this->event(['kind' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, 'priorAttempt' => true, 'priorSuccess' => true]),
            $this->event(['kind' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, 'priorAttempt' => true, 'priorSuccess' => true]),
        ]);
        $three = $this->replayEvents([$this->event(), $this->event(), $this->event()]);

        $this->assertSame(1, $same->distinctItemsSuccess);
        $this->assertSame(3, $three->distinctItemsSuccess);
        $this->assertGreaterThan($same->confidence + 0.2, $three->confidence);
        $this->assertSame(MasteryState::STATUS_MASTERED, $three->status);
        $this->assertNotSame(MasteryState::STATUS_MASTERED, $same->status);
    }

    public function test_failures_are_real_evidence_and_a_slip_on_a_solved_item_weighs_half(): void
    {
        $e = $this->engine();
        $ctx = EngineContext::unknown();
        $fresh = $e->apply($e->initialState(), $this->event(['outcome' => Outcome::Incorrect]), $ctx);
        $retry = $e->apply($e->initialState(), $this->event(['outcome' => Outcome::Incorrect, 'kind' => EvidenceEvent::KIND_RETRY_AFTER_FAILURE, 'priorAttempt' => true]), $ctx);
        $slip = $e->apply($e->initialState(), $this->event(['outcome' => Outcome::Incorrect, 'kind' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, 'priorAttempt' => true, 'priorSuccess' => true]), $ctx);

        $this->assertLessThan(0.5, $fresh->confidence);
        $this->assertSame($fresh->confidence, $retry->confidence, 'rater encore ce qu\'on a raté compte en plein');
        $this->assertLessThan(0.5, $slip->confidence, 'un faux pas reste une preuve négative');
        $this->assertGreaterThan($fresh->confidence, $slip->confidence, 'mais pèse moitié');
    }

    public function test_practising_a_known_item_at_high_accuracy_never_lowers_confidence(): void
    {
        // Le cas trouvé au rejeu du jeu de démonstration : 3 items réussis,
        // puis la même série reprise encore et encore à 90 % de réussite.
        $events = [$this->event(['difficulty' => 2]), $this->event(['difficulty' => 2]), $this->event(['difficulty' => 2])];
        $after = $this->replayEvents($events)->confidence;
        $repeat = fn (Outcome $o) => $this->event(['outcome' => $o, 'difficulty' => 2, 'source' => EvidenceEvent::SOURCE_PRACTICE, 'kind' => EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, 'priorAttempt' => true, 'priorSuccess' => true]);
        for ($round = 0; $round < 10; $round++) {
            for ($i = 0; $i < 9; $i++) {
                $events[] = $repeat(Outcome::Correct);
            }
            $events[] = $repeat(Outcome::Incorrect);
        }
        $this->assertGreaterThanOrEqual($after - 0.02, $this->replayEvents($events)->confidence, 'l\'entraînement ne doit pas devenir une pénalité');
    }

    public function test_partially_correct_raises_confidence_less_than_a_full_success_and_is_not_a_distinct_success(): void
    {
        $full = $this->replayEvents([$this->event()]);
        $partial = $this->replayEvents([$this->event(['outcome' => Outcome::PartiallyCorrect])]);

        $this->assertGreaterThan(0.5, $partial->confidence);
        $this->assertLessThan($full->confidence, $partial->confidence);
        $this->assertSame(0, $partial->distinctItemsSuccess);
        $this->assertSame(1, $partial->partialCount);
        $this->assertSame(0, $partial->correctCount);
    }

    public function test_a_harder_success_is_worth_more_and_an_easier_failure_costs_more(): void
    {
        $easyOk = $this->replayEvents([$this->event(['difficulty' => 1])])->confidence;
        $hardOk = $this->replayEvents([$this->event(['difficulty' => 5])])->confidence;
        $easyKo = $this->replayEvents([$this->event(['difficulty' => 1, 'outcome' => Outcome::Incorrect])])->confidence;
        $hardKo = $this->replayEvents([$this->event(['difficulty' => 5, 'outcome' => Outcome::Incorrect])])->confidence;

        $this->assertGreaterThan($easyOk, $hardOk);
        $this->assertLessThan($hardKo, $easyKo);
    }

    public function test_hints_reduce_a_success_and_never_worsen_a_failure(): void
    {
        $clean = $this->replayEvents([$this->event()])->confidence;
        $oneHint = $this->replayEvents([$this->event(['hints' => 1])])->confidence;
        $threeHints = $this->replayEvents([$this->event(['hints' => 3])])->confidence;
        $this->assertGreaterThan($oneHint, $clean);
        $this->assertGreaterThan($threeHints, $oneHint);
        $this->assertGreaterThan(0.5, $threeHints, 'réussir après trois indices reste une progression');

        $failNoHint = $this->replayEvents([$this->event(['outcome' => Outcome::Incorrect])])->confidence;
        $failHints = $this->replayEvents([$this->event(['outcome' => Outcome::Incorrect, 'hints' => 3])])->confidence;
        $this->assertSame($failNoHint, $failHints);
    }

    public function test_secondary_and_practice_weigh_less_than_primary_assessment(): void
    {
        $primary = $this->replayEvents([$this->event()])->confidence;
        $secondary = $this->replayEvents([$this->event(['role' => EvidenceEvent::ROLE_SECONDARY])])->confidence;
        $practice = $this->replayEvents([$this->event(['source' => EvidenceEvent::SOURCE_PRACTICE])])->confidence;
        $this->assertLessThan($primary, $secondary);
        $this->assertLessThan($primary, $practice);
    }

    public function test_a_client_evaluated_outcome_is_discounted_but_a_legacy_row_keeps_its_weight(): void
    {
        $server = $this->replayEvents([$this->event()])->confidence;
        $client = $this->replayEvents([$this->event(['evaluatedBy' => EvidenceEvent::EVALUATED_BY_CLIENT])])->confidence;
        $legacy = $this->replayEvents([$this->event(['evaluatedBy' => EvidenceEvent::EVALUATED_BY_CLIENT_LEGACY])])->confidence;
        $this->assertLessThan($server, $client);
        $this->assertSame($server, $legacy);
    }

    public function test_mastered_requires_distinct_items_bounded_by_the_bank(): void
    {
        // Deux réussites distinctes : confiance haute, preuve insuffisante avec 3 items ou plus…
        $two = [$this->event(), $this->event()];
        $big = $this->replayEvents($two, new EngineContext(200));
        $this->assertSame(MasteryState::STATUS_REINFORCE, $big->status);
        $this->assertSame(MasteryState::REASON_INSUFFICIENT_EVIDENCE, $big->statusReason);

        // …mais suffisante quand la banque n'offre que deux items pour ce point.
        $small = $this->replayEvents($two, new EngineContext(2));
        $this->assertSame(MasteryState::STATUS_MASTERED, $small->status);

        // Registre inconnu : la règle s'applique sans borne.
        $unknown = $this->replayEvents($two, EngineContext::unknown());
        $this->assertSame(MasteryState::REASON_INSUFFICIENT_EVIDENCE, $unknown->statusReason);
    }

    public function test_the_engine_does_not_care_how_many_exercises_the_lesson_has(): void
    {
        $events = [$this->event(), $this->event(), $this->event()];
        $a = $this->replayEvents($events, new EngineContext(11));
        $b = $this->replayEvents($events, new EngineContext(150));
        $c = $this->replayEvents($events, new EngineContext(375));
        $this->assertSame($a->confidence, $b->confidence);
        $this->assertSame($b->confidence, $c->confidence);
        $this->assertSame([$a->status, $b->status, $c->status], array_fill(0, 3, MasteryState::STATUS_MASTERED));
    }

    public function test_practice_alone_needs_an_assessment_or_a_hard_item_when_required(): void
    {
        $practiceOnly = [];
        for ($i = 0; $i < 4; $i++) {
            $practiceOnly[] = $this->event(['source' => EvidenceEvent::SOURCE_PRACTICE, 'difficulty' => 1]);
        }
        $s = $this->replayEvents($practiceOnly);
        $this->assertGreaterThanOrEqual(0.70, $s->confidence);
        $this->assertSame(MasteryState::STATUS_REINFORCE, $s->status);
        $this->assertSame(MasteryState::REASON_NEEDS_ASSESSMENT, $s->statusReason);

        // Une réussite de niveau 4 en pratique vaut l'évaluation.
        $withHard = $this->replayEvents([...$practiceOnly, $this->event(['source' => EvidenceEvent::SOURCE_PRACTICE, 'difficulty' => 4])]);
        $this->assertSame(MasteryState::STATUS_MASTERED, $withHard->status);

        // Ou la configuration ne l'exige pas.
        $relaxed = $this->replayEvents($practiceOnly, null, $this->engine(['require_assessment' => false]));
        $this->assertSame(MasteryState::STATUS_MASTERED, $relaxed->status);
    }

    public function test_status_bands_by_threshold(): void
    {
        $gap = $this->replayEvents([$this->event(['outcome' => Outcome::Incorrect])]);
        $this->assertSame(MasteryState::STATUS_GAP, $gap->status);
        $this->assertSame(MasteryState::REASON_THRESHOLD, $gap->statusReason);
        $this->assertSame(1, $gap->failureCount);
        $this->assertNotNull($gap->lastFailureAt);
    }

    public function test_confidence_is_clamped_and_rounded(): void
    {
        $events = array_fill(0, 12, $this->event(['difficulty' => 5]));
        $this->assertSame(1.0, $this->replayEvents($events)->confidence);
        $fails = array_fill(0, 12, $this->event(['difficulty' => 1, 'outcome' => Outcome::Incorrect]));
        $this->assertSame(0.0, $this->replayEvents($fails)->confidence);
    }

    public function test_determinism_same_events_same_state(): void
    {
        $events = [
            $this->event(), $this->event(['outcome' => Outcome::Incorrect, 'difficulty' => 2]),
            $this->event(['source' => EvidenceEvent::SOURCE_PRACTICE, 'hints' => 2, 'difficulty' => 4]),
            $this->event(['outcome' => Outcome::PartiallyCorrect]),
        ];
        $this->assertEquals($this->replayEvents($events), $this->replayEvents($events));
    }
}
