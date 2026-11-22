<?php

namespace Tests\Unit\ThinkingLab;

use App\Domain\ThinkingLab\AnswerChecker;
use App\Domain\ThinkingLab\Params;
use DomainException;
use Tests\TestCase;

/**
 * Le juge des défis (AnswerChecker) et les nombres de l'élève (Params) ont un miroir JS
 * (packages/core/thinkingLab/{checkAnswer,params}.js) ; les deux consomment les mêmes fixtures
 * content/thinking-lab/_fixtures/{answers,params}.json. Quand ce test échoue, on corrige le PHP.
 */
class AnswerCheckerFixtureTest extends TestCase
{
    private function fixture(string $name): array
    {
        $path = base_path("../../content/thinking-lab/_fixtures/{$name}.json");
        $this->assertFileExists($path);

        return json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    }

    public function test_every_answer_case_matches_the_javascript_checker(): void
    {
        $checker = new AnswerChecker;
        $failures = [];
        $cases = $this->fixture('answers')['cases'];
        $this->assertGreaterThanOrEqual(50, count($cases));
        foreach ($cases as $c) {
            $actual = $checker->check($c['spec'], $c['raw'], $c['mistakes']);
            if ($actual !== $c['expected']) {
                $failures[] = "{$c['name']}: attendu ".json_encode($c['expected'], JSON_UNESCAPED_UNICODE).', obtenu '.json_encode($actual, JSON_UNESCAPED_UNICODE);
            }
        }
        $this->assertSame([], $failures, implode("\n", $failures));
    }

    public function test_the_five_checks_are_covered(): void
    {
        $checks = array_values(array_unique(array_map(static fn ($c) => $c['spec']['check'], $this->fixture('answers')['cases'])));
        sort($checks);
        $expected = AnswerChecker::CHECKS;
        sort($expected);
        $this->assertSame($expected, $checks);
    }

    public function test_an_unreadable_expected_answer_throws(): void
    {
        $this->expectException(DomainException::class);
        (new AnswerChecker)->check(['check' => 'expression', 'value' => 'x+', 'vars' => ['x']], 'x');
    }

    public function test_params_hashes_and_picks_match_the_javascript(): void
    {
        $f = $this->fixture('params');
        foreach ($f['hashes'] as $h) {
            $this->assertSame($h['hash'], Params::fnv1a32($h['text']), "fnv1a32 « {$h['text']} »");
        }
        foreach ($f['picks'] as $p) {
            $got = Params::pick($p['params'], $p['userId'], $p['challengeId'], $p['edition']);
            $expected = $p['values'];
            ksort($expected, SORT_STRING);
            $this->assertSame($p['index'], $got['index'], "index {$p['userId']}:{$p['challengeId']}:{$p['edition']}");
            $this->assertSame($expected, $got['values']);
        }
    }

    public function test_fill_challenge_parenthesises_expressions_and_keeps_params(): void
    {
        $c = [
            'statement' => 'كم {a}؟',
            'params' => ['vars' => ['a' => [2, 3]]],
            'answer' => ['check' => 'integer', 'value' => '{a}*{a}'],
            'mistakes' => [['value' => '2*{a}', 'reply' => 'x']],
            'keys' => [['phase' => 'S', 'text' => 'ابدأ بـ {a}']],
        ];
        $f = Params::fillChallenge($c, ['a' => -3]);
        $this->assertSame('كم -3؟', $f['statement']);
        $this->assertSame('(-3)*(-3)', $f['answer']['value']);
        $this->assertSame('2*(-3)', $f['mistakes'][0]['value']);
        $this->assertSame('ابدأ بـ -3', $f['keys'][0]['text']);
        $this->assertSame($c['params'], $f['params']);
    }
}
