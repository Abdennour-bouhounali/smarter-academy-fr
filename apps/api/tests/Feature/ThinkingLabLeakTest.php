<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Testing\TestResponse;
use Tests\Support\CommercialFixtures;
use Tests\Support\ThinkingLabFixtures;
use Tests\TestCase;

/**
 * « Le serveur est l'autorité » (THINKING_LAB.md §6) — balayage des FUITES.
 *
 * Un élève parcourt tout ce qui est possible AVANT la porte (l'échelle, chaque défi, des
 * tentatives fausses, illisibles, répétées, des clés ouvertes, des refus) ; le texte brut de
 * CHAQUE réponse est fouillé pour : la réponse attendue, les valeurs des erreurs déclarées, le
 * texte des clés non ouvertes, la relecture, les keyMoves, la carte du mouvement, les réponses du
 * plafond et des suites, la tranche, le titre, la source.
 */
class ThinkingLabLeakTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;
    use ThinkingLabFixtures;

    /** @var list<string> */
    private array $bodies = [];

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-02 09:00:00');
        $this->useThinkingLabFixture();
        $this->student = $this->student();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function hit(string $method, string $uri, array $body = []): TestResponse
    {
        $r = $this->withToken($this->tokenOf($this->student))->json($method, "/api/v1/thinking-lab{$uri}", $body);
        $this->bodies[] = (string) $r->getContent();

        return $r;
    }

    private function later(int $minutes): void
    {
        Carbon::setTestNow(now()->addMinutes($minutes));
    }

    /** @param list<string> $secrets */
    private function assertNoLeak(array $secrets, string $where): void
    {
        foreach ($this->bodies as $i => $body) {
            $decoded = json_encode(json_decode($body, true), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            foreach ($secrets as $secret) {
                $this->assertStringNotContainsString($secret, $decoded, "{$where} : « {$secret} » fuit dans la réponse n° {$i}");
            }
        }
    }

    public function test_nothing_of_the_answer_reaches_the_client_before_the_gate(): void
    {
        // tl-first : tentatives fausses, illisible, répétée, trop tôt ; clé 1 ouverte seulement.
        $this->hit('GET', '');
        $this->hit('GET', '/challenges/tl-first');
        $this->hit('POST', '/challenges/tl-first/attempts', ['answer' => '2048']);
        $this->hit('POST', '/challenges/tl-first/attempts', ['answer' => 'abc']);
        $this->hit('POST', '/challenges/tl-first/attempts', ['answer' => '2048']);
        $this->hit('POST', '/challenges/tl-first/attempts', ['answer' => '5', 'draft' => 'غيّرت طريقتي في الحساب']);
        $this->hit('POST', '/challenges/tl-first/keys/1');
        $this->hit('POST', '/challenges/tl-first/keys/2');
        $this->hit('GET', '/challenges/tl-first/replay')->assertStatus(403);
        $this->hit('POST', '/challenges/tl-first/extra', ['kind' => 'ceiling', 'answer' => '1'])->assertStatus(403);

        // tl-second puis #318 : la vraie vitrine.
        $this->hit('POST', '/challenges/tl-second/attempts', ['answer' => '1']);
        $this->hit('GET', '/challenges/four-arcs-area');
        $this->hit('POST', '/challenges/four-arcs-area/attempts', ['answer' => 'x^2(1-pi/4)']);
        $this->later(3);
        $this->hit('POST', '/challenges/four-arcs-area/attempts', ['answer' => 'x^2', 'draft' => 'جرّبت مساحة المربّع كلّه']);
        $this->hit('POST', '/challenges/four-arcs-area/keys/1');
        $this->hit('POST', '/challenges/four-arcs-area/keys/2');
        $this->later(3);
        $this->hit('POST', '/challenges/four-arcs-area/attempts', ['answer' => 'x²/3', 'draft' => 'ثلث المربّع حسب الرسم']);
        $this->hit('GET', '/challenges/four-arcs-area/replay')->assertStatus(403);
        $this->hit('POST', '/challenges/four-arcs-area/postpone');
        $this->hit('GET', '');
        $this->hit('GET', '/n/318');

        $real = json_decode((string) file_get_contents(base_path('../../content/thinking-lab/challenges/0318-four-arcs-area.json')), true);
        $secrets318 = [
            $real['answer']['value'],
            'sqrt(3)',
            '1+pi/3',
            $real['keys'][2]['text'],
            $real['move']['title'],
            $real['ceiling']['answer']['value'],
            $real['title'],
            $real['source'],
            '"band"',
            '"domain"',
            '"relTol"',
            '"mistakes"',
            // « 1-pi/4 » n'est pas cherché : l'élève l'a TAPÉ (x^2(1-pi/4)), son historique le lui rend.
            'pi/2-1',
            '"scaleWith"',
            '"outside"',
            ...array_map(static fn ($s) => $s['think'], $real['replay']),
            ...$real['keyMoves'],
        ];
        $this->assertNoLeak($secrets318, '#318');

        $this->assertNoLeak([
            '4096', '8192', '"12"', 'SECRET-KEY-2', 'SECRET-KEY-3', 'SECRET-REPLAY', 'SECRET-KEYMOVE', 'SECRET-MOVE',
            'SECRET-TITLE', 'SECRET-SOURCE', '7777', 'primary', 'secondary', '"rating"', '"family"', '"licence"',
        ], 'synthétiques');

        // Contrôle du balayage : ce qui DOIT être visible l'est bien.
        $all = implode("\n", $this->bodies);
        $this->assertStringContainsString('SECRET-KEY-1-TL_FIRST', $all, 'la clé ouverte est visible');
        $this->assertStringContainsString('SECRET-MISTAKE-REPLY-FIRST', $all, 'la réponse « ليس بعد » de l\'erreur déclarée est visible');
    }

    public function test_the_replay_is_served_once_the_gate_is_open_and_only_then(): void
    {
        $this->hit('POST', '/challenges/tl-first/attempts', ['answer' => '4096'])->assertOk();
        $r = $this->hit('GET', '/challenges/tl-first/replay')->assertOk();
        $this->assertStringContainsString('SECRET-REPLAY-1-TL_FIRST', $r->getContent());
        $this->assertStringContainsString('SECRET-KEY-3-TL_FIRST', $r->getContent(), 'porte franchie : toutes les clés se lisent');
    }
}
