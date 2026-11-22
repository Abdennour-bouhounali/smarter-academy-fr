<?php

namespace Tests\Unit\Practice;

use App\Domain\Practice\Support\AnswerEvaluator;
use DomainException;
use Tests\TestCase;
use Throwable;

/**
 * Équivalence sémantique JS ↔ PHP de l'évaluateur de réponses, verrouillée par
 * la fixture partagée packages/core/practice/fixtures/answers.json.
 *
 * La fixture est produite en EXÉCUTANT l'évaluateur JavaScript (jamais écrite à
 * la main) et consommée telle quelle par les deux runtimes. Quand ce test
 * échoue, on corrige le PHP — on ne touche pas la fixture.
 *
 * Test unitaire pur : aucune base de données. Il hérite de Tests\TestCase pour
 * `base_path()` seulement.
 */
class AnswerEvaluatorFixtureTest extends TestCase
{
    private const FIELDS = ['outcome', 'misconceptionId', 'normalized', 'isCorrect', 'feedbackKey'];

    /** @return array<int, array{name: string, question: array, answer: mixed, expected: array}> */
    private function cases(): array
    {
        $path = base_path('../../packages/core/practice/fixtures/answers.json');
        $this->assertFileExists($path, 'La fixture partagée doit exister dans packages/core.');
        $cases = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        $this->assertIsArray($cases);

        return $cases;
    }

    public function test_the_fixture_is_a_real_corpus(): void
    {
        $cases = $this->cases();
        $this->assertGreaterThanOrEqual(60, count($cases));
        $names = array_column($cases, 'name');
        $this->assertSame(count($names), count(array_unique($names)), 'Noms de cas dupliqués.');

        $types = array_unique(array_map(static fn ($c) => $c['question']['answerType'] ?? null, $cases));
        foreach (AnswerEvaluator::SUPPORTED_ANSWER_TYPES as $type) {
            $this->assertContains($type, $types, "Aucun cas pour le type {$type}.");
        }
        $outcomes = array_unique(array_map(static fn ($c) => $c['expected']['outcome'] ?? 'throws', $cases));
        foreach ([...AnswerEvaluator::OUTCOMES, 'throws'] as $outcome) {
            $this->assertContains($outcome, $outcomes, "Aucun cas pour l'issue {$outcome}.");
        }
    }

    public function test_every_fixture_case_matches_the_javascript_evaluator(): void
    {
        $evaluator = new AnswerEvaluator;
        $failures = [];
        $checked = 0;

        foreach ($this->cases() as $case) {
            $name = $case['name'];
            $expected = $case['expected'];
            $checked++;

            if (isset($expected['throws'])) {
                try {
                    $evaluator->evaluate($case['answer'], $case['question']);
                    $failures[] = "{$name}: attendu une DomainException « {$expected['throws']} », rien n'a été levé";
                } catch (DomainException $e) {
                    if (! str_contains($e->getMessage(), $expected['throws'])) {
                        $failures[] = "{$name}: message « {$e->getMessage()} » ne contient pas « {$expected['throws']} »";
                    }
                } catch (Throwable $e) {
                    $failures[] = "{$name}: ".$e::class." levée au lieu de DomainException — {$e->getMessage()}";
                }

                continue;
            }

            try {
                $actual = $evaluator->evaluate($case['answer'], $case['question']);
            } catch (Throwable $e) {
                $failures[] = "{$name}: ".$e::class." — {$e->getMessage()}";

                continue;
            }

            $this->assertSame(self::FIELDS, array_keys($actual), "{$name}: forme du résultat");
            foreach (self::FIELDS as $field) {
                if ($actual[$field] !== $expected[$field]) {
                    $failures[] = sprintf(
                        '%s.%s: attendu %s, obtenu %s',
                        $name,
                        $field,
                        json_encode($expected[$field], JSON_UNESCAPED_UNICODE),
                        json_encode($actual[$field], JSON_UNESCAPED_UNICODE),
                    );
                }
            }
        }

        $this->assertSame([], $failures, count($failures)." divergence(s) sur {$checked} cas :\n  - ".implode("\n  - ", $failures));
        $this->assertGreaterThanOrEqual(60, $checked);
    }

    public function test_unknown_answer_type_is_a_domain_exception_not_a_silent_incorrect(): void
    {
        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('answerType inconnu');

        (new AnswerEvaluator)->evaluate(['value' => '1'], ['id' => 'q', 'answerType' => 'quantique']);
    }

    public function test_unreadable_expected_answer_is_a_domain_exception(): void
    {
        $this->expectException(DomainException::class);
        $this->expectExceptionMessage('expectedAnswer illisible pour q-bad');

        (new AnswerEvaluator)->evaluate(['value' => '1'], ['id' => 'q-bad', 'answerType' => 'rational', 'expectedAnswer' => 'abc']);
    }

    public function test_outcome_helpers_mirror_the_javascript_predicates(): void
    {
        $this->assertTrue(AnswerEvaluator::isSuccessOutcome('correct'));
        $this->assertTrue(AnswerEvaluator::isSuccessOutcome('equivalent_correct'));
        $this->assertFalse(AnswerEvaluator::isSuccessOutcome('partially_correct'));
        $this->assertTrue(AnswerEvaluator::isInertOutcome('syntax_error'));
        $this->assertTrue(AnswerEvaluator::isInertOutcome('abandoned'));
        $this->assertFalse(AnswerEvaluator::isInertOutcome('incorrect'));
        $this->assertFalse(AnswerEvaluator::isSuccessOutcome('quantique'));
    }
}
