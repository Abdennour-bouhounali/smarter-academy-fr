<?php

namespace Tests\Unit\ThinkingLab;

use App\Domain\ThinkingLab\ExpressionEvaluator;
use DomainException;
use Tests\TestCase;

/**
 * Équivalence JS ↔ PHP de l'évaluateur d'expressions du « مختبر التفكير »,
 * verrouillée par la fixture partagée content/thinking-lab/_fixtures/expressions.json
 * (packages/core/thinkingLab/expression.test.js côté JS). Quand ce test
 * échoue, on corrige le PHP — on ne touche pas la fixture.
 *
 * Test unitaire pur : aucune base de données.
 */
class ExpressionEvaluatorFixtureTest extends TestCase
{
    private function fixture(): array
    {
        $path = base_path('../../content/thinking-lab/_fixtures/expressions.json');
        $this->assertFileExists($path);

        return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    }

    public function test_the_fixture_is_a_real_corpus(): void
    {
        $f = $this->fixture();
        $this->assertGreaterThanOrEqual(200, count($f['parse']) + count($f['equivalence']));
    }

    public function test_every_parse_case_matches_the_javascript_evaluator(): void
    {
        $failures = [];
        foreach ($this->fixture()['parse'] as $c) {
            $r = ExpressionEvaluator::parse($c['input'], $c['vars']);
            if (! $c['ok']) {
                if ($r['ok'] || $r['error'] !== $c['error']) {
                    $failures[] = "{$c['name']}: attendu l'erreur {$c['error']}, obtenu ".json_encode($r['ok'] ? $r['normalized'] : $r['error']);
                }

                continue;
            }
            if (! $r['ok']) {
                $failures[] = "{$c['name']}: erreur {$r['error']} sur une saisie lisible";

                continue;
            }
            if ($r['normalized'] !== $c['normalized']) {
                $failures[] = "{$c['name']}: écriture « {$r['normalized']} » au lieu de « {$c['normalized']} »";
            }
            $v = ExpressionEvaluator::evaluate($r['ast'], $c['at'] ?? []);
            if ($c['value'] === null) {
                if (! is_nan($v)) {
                    $failures[] = "{$c['name']}: attendu indéfini, obtenu {$v}";
                }
            } elseif (is_nan($v) || abs($v - $c['value']) > 1e-12 * max(1, abs($c['value']))) {
                $failures[] = "{$c['name']}: valeur {$v} au lieu de {$c['value']}";
            }
        }
        $this->assertSame([], $failures, implode("\n", $failures));
    }

    public function test_every_equivalence_case_matches_the_javascript_evaluator(): void
    {
        $failures = [];
        foreach ($this->fixture()['equivalence'] as $c) {
            $opts = array_diff_key($c, array_flip(['name', 'given', 'expected', 'equivalent', 'reason']));
            $r = ExpressionEvaluator::equivalent($c['given'], $c['expected'], $opts);
            if ($r['equivalent'] !== $c['equivalent'] || $r['reason'] !== $c['reason']) {
                $failures[] = sprintf('%s: attendu %s/%s, obtenu %s/%s', $c['name'], json_encode($c['equivalent']), $c['reason'], json_encode($r['equivalent']), $r['reason']);
            }
        }
        $this->assertSame([], $failures, implode("\n", $failures));
    }

    public function test_an_unreadable_expected_expression_is_a_domain_exception(): void
    {
        $this->expectException(DomainException::class);
        ExpressionEvaluator::equivalent('x', 'x+', ['vars' => ['x']]);
    }

    public function test_the_sampler_mirrors_park_miller(): void
    {
        $next = ExpressionEvaluator::sampler(1);
        $this->assertSame(48271 / 2147483647, $next());
        $this->assertSame((48271 * 48271 % 2147483647) / 2147483647, $next());
    }

    public function test_no_eval_in_the_evaluator(): void
    {
        $source = (string) file_get_contents(app_path('Domain/ThinkingLab/ExpressionEvaluator.php'));
        $this->assertDoesNotMatchRegularExpression('/\beval\s*\(/', $source);
    }
}
