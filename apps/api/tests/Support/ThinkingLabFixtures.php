<?php

namespace Tests\Support;

use App\Domain\ThinkingLab\ChallengeRepository;

/**
 * Un contenu de « مختبر التفكير » FIXE pour les tests : le vrai #318 (lu dans content/) et trois
 * défis synthétiques aux chaînes reconnaissables (SECRET-…), pour que le balayage des fuites sache
 * exactement quoi chercher et que les tests ne bougent pas quand la banque grandit.
 *
 *   tl-first   #5    primaire, entier 4096, erreur 2048, jumeau tl-twin, plafond 8192, une suite (12)
 *   tl-second  #150  collège, entier 7777
 *   four-arcs-area  #318 (le vrai)
 *   tl-twin    #333  collège, entier 33
 */
trait ThinkingLabFixtures
{
    protected string $thinkingLabDir;

    protected function useThinkingLabFixture(): void
    {
        $real = json_decode((string) file_get_contents(base_path('../../content/thinking-lab/challenges/0318-four-arcs-area.json')), true, 512, JSON_THROW_ON_ERROR);
        unset($real['$schema']);

        $challenges = [
            $this->syntheticChallenge('tl-first', 5, 'primary', '4096', [
                'mistakes' => [['value' => '2048', 'reply' => 'SECRET-MISTAKE-REPLY-FIRST']],
                'twin' => 'tl-twin',
                'ceiling' => ['statement' => 'سؤال أصعب على الفكرة نفسها.', 'answer' => ['check' => 'integer', 'value' => '8192']],
                'parts' => [['prompt' => 'سؤال تابع للقمّة.', 'answer' => ['check' => 'integer', 'value' => '12']]],
                'example' => ['statement' => 'مثال محلول.', 'steps' => ['خطوة أولى.'], 'answer' => '11'],
            ]),
            $this->syntheticChallenge('tl-second', 150, 'middle', '7777'),
            $real,
            $this->syntheticChallenge('tl-twin', 333, 'secondary', '33'),
        ];

        $this->thinkingLabDir = storage_path('framework/testing/thinking-lab-'.getmypid());
        if (! is_dir($this->thinkingLabDir)) {
            mkdir($this->thinkingLabDir, 0777, true);
        }
        file_put_contents($this->thinkingLabDir.'/index.generated.json', json_encode(['count' => count($challenges), 'challenges' => $challenges], JSON_UNESCAPED_UNICODE));
        config(['thinking_lab.content_path' => $this->thinkingLabDir]);
        app(ChallengeRepository::class)->forget();
    }

    private function syntheticChallenge(string $id, int $number, string $band, string $answer, array $extra = []): array
    {
        $tag = strtoupper(str_replace('-', '_', $id));

        return array_merge([
            'id' => $id,
            'number' => $number,
            'title' => "SECRET-TITLE-{$tag}",
            'status' => 'published',
            'family' => 'numbers',
            'band' => $band,
            'summit' => false,
            'licence' => 'FOLK',
            'source' => "SECRET-SOURCE-{$tag}",
            'examTag' => null,
            'rating' => 1234,
            'statement' => 'نصّ التحدّي بدون أي رقم من الجواب.',
            'figure' => null,
            'params' => null,
            'answer' => ['check' => 'integer', 'value' => $answer],
            'parts' => null,
            'mistakes' => [],
            'keys' => [
                ['phase' => 'S', 'text' => "SECRET-KEY-1-{$tag}"],
                ['phase' => 'O', 'text' => "SECRET-KEY-2-{$tag}"],
                ['phase' => 'R', 'text' => "SECRET-KEY-3-{$tag}"],
            ],
            'example' => null,
            'replay' => [
                ['phase' => 'S', 'think' => "SECRET-REPLAY-1-{$tag}"],
                ['phase' => 'R', 'think' => "SECRET-REPLAY-2-{$tag}"],
                ['phase' => 'T', 'think' => "SECRET-REPLAY-3-{$tag}"],
            ],
            'keyMoves' => ["SECRET-KEYMOVE-{$tag}"],
            'move' => ['id' => 'move-'.$id, 'title' => "SECRET-MOVE-{$tag}"],
            'twin' => null,
            'ceiling' => null,
        ], $extra);
    }
}
