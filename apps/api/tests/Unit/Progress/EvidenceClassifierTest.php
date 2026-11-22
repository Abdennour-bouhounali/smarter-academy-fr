<?php

namespace Tests\Unit\Progress;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\EvidenceClassifier;
use App\Domain\Progress\PriorFacts;
use PHPUnit\Framework\TestCase;

class EvidenceClassifierTest extends TestCase
{
    public function test_item_keys_are_source_lesson_exercise_question(): void
    {
        $this->assertSame(
            'practice:qasim-mushtarak-akbar:ex-4am-qasim-mushtarak-akbar-l2-001:q2',
            EvidenceClassifier::itemKey('practice', 'qasim-mushtarak-akbar', 'ex-4am-qasim-mushtarak-akbar-l2-001', 'q2'),
        );
        $this->assertSame(
            'final_test:qasim-mushtarak-akbar:final:E1',
            EvidenceClassifier::itemKey('final_test', 'qasim-mushtarak-akbar', null, 'E1'),
        );
    }

    public function test_legacy_question_codes_resolve_to_the_same_identity(): void
    {
        $final = EvidenceClassifier::identityFromQuestionCode('assessment', 'tayin-pgcd', 'E3');
        $this->assertSame('final_test:tayin-pgcd:final:E3', $final['itemKey']);
        $this->assertNull($final['exerciseCode']);

        $practice = EvidenceClassifier::identityFromQuestionCode('practice_exercise', 'tayin-pgcd', 'ex-4am-tayin-pgcd-l1-001:q1');
        $this->assertSame('practice:tayin-pgcd:ex-4am-tayin-pgcd-l1-001:q1', $practice['itemKey']);
        $this->assertSame('ex-4am-tayin-pgcd-l1-001', $practice['exerciseCode']);
        $this->assertSame('q1', $practice['questionId']);

        // Le jeu de démonstration écrivait deux deux-points.
        $demo = EvidenceClassifier::identityFromQuestionCode('practice_exercise', 'tayin-pgcd', 'ex-4am-tayin-pgcd-l1-001::q1');
        $this->assertSame($practice['itemKey'], $demo['itemKey']);
    }

    public function test_first_demonstration_when_nothing_was_seen(): void
    {
        $c = EvidenceClassifier::classifyFrom(PriorFacts::none());
        $this->assertSame(EvidenceEvent::KIND_FIRST, $c['demonstrationKind']);
        $this->assertSame(1, $c['attemptNumber']);
    }

    public function test_variant_when_only_the_template_was_seen(): void
    {
        $c = EvidenceClassifier::classifyFrom(new PriorFacts(rowsOnItem: 0, nonInertOnItem: 0, successOnItem: false, nonInertOnTemplate: 2, successOnTemplate: true));
        $this->assertSame(EvidenceEvent::KIND_VARIANT, $c['demonstrationKind']);
    }

    public function test_retry_after_failure_when_the_item_was_tried_and_never_succeeded(): void
    {
        $c = EvidenceClassifier::classifyFrom(new PriorFacts(rowsOnItem: 2, nonInertOnItem: 2, successOnItem: false, nonInertOnTemplate: 2, successOnTemplate: false));
        $this->assertSame(EvidenceEvent::KIND_RETRY_AFTER_FAILURE, $c['demonstrationKind']);
        $this->assertSame(3, $c['attemptNumber']);
    }

    public function test_repeat_after_success_once_the_item_was_solved(): void
    {
        $c = EvidenceClassifier::classifyFrom(new PriorFacts(rowsOnItem: 1, nonInertOnItem: 1, successOnItem: true, nonInertOnTemplate: 1, successOnTemplate: true));
        $this->assertSame(EvidenceEvent::KIND_REPEAT_AFTER_SUCCESS, $c['demonstrationKind']);
    }

    public function test_inert_prior_rows_count_for_the_attempt_number_but_not_for_the_kind(): void
    {
        // Deux erreurs de syntaxe avant : troisième tentative, mais toujours une PREMIÈRE démonstration.
        $c = EvidenceClassifier::classifyFrom(new PriorFacts(rowsOnItem: 2, nonInertOnItem: 0, successOnItem: false, nonInertOnTemplate: 0, successOnTemplate: false));
        $this->assertSame(3, $c['attemptNumber']);
        $this->assertSame(EvidenceEvent::KIND_FIRST, $c['demonstrationKind']);
    }
}
