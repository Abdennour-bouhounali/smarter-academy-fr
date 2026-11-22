<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\StudentLessonAnswers;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les réponses de l'élève pendant une leçon (pilote 2026-11-07) : gardées POUR LUI, fusionnées « la plus récente gagne »,
 * jamais lisibles par un autre compte.
 */
class StudentLessonAnswersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $grade = Grade::create(['code' => '6e', 'name' => '6ème', 'level' => 'college', 'order' => 0]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0]);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'fractions-1', 'title' => 'Fractions', 'status' => 'available',
            'duration_minutes' => 45, 'tier' => 'free', 'order' => 0]);
    }

    private function account(string $role): array
    {
        $user = User::factory()->create(['role' => $role, 'grade' => '6e']);

        return [$user, $user->createToken('t')->plainTextToken];
    }

    private function saveAnswers(string $token, array $answers)
    {
        return $this->withHeader('Authorization', "Bearer {$token}")->putJson('/api/v1/lessons/fractions-1/answers', ['answers' => $answers]);
    }

    public function test_a_student_saves_and_reads_back_their_answers(): void
    {
        [, $token] = $this->account('student');
        $this->saveAnswers($token, ['m1:q1' => ['v' => 2, 'at' => 100], 'm4:sol' => ['v' => 'a = b × q + r', 'at' => 100]])->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/v1/lessons/fractions-1/answers')
            ->assertOk()->assertJsonPath('answers.m1:q1.v', 2)->assertJsonPath('answers.m4:sol.v', 'a = b × q + r');
    }

    public function test_the_most_recent_answer_wins_key_by_key(): void
    {
        [, $token] = $this->account('student');
        $this->saveAnswers($token, ['m1:q1' => ['v' => 2, 'at' => 200]]);
        // un appareil en retard renvoie une réponse plus ANCIENNE : elle n'écrase pas
        $this->saveAnswers($token, ['m1:q1' => ['v' => 0, 'at' => 150], 'm1:q2' => ['v' => 1, 'at' => 150]])
            ->assertJsonPath('answers.m1:q1.v', 2)->assertJsonPath('answers.m1:q2.v', 1);
    }

    /**
     * Le monde de jeu y garde le PARCOURS de l'élève, coupé en morceaux (apps/web …/gameworld/kit/saveSync.js) :
     * `world:n` = leur nombre, `world:0`… = des tranches de base64 de 3 600 caractères, toutes à la même heure.
     */
    public function test_a_game_world_save_cut_into_pieces_comes_back_intact(): void
    {
        [, $token] = $this->account('student');
        $save = base64_encode(json_encode(['v' => 1, 'stage' => 7, 'words' => 'إذا لم يبقَ شيء', 'log' => range(1, 2500)]));
        $pieces = str_split($save, 3600);
        $this->assertGreaterThan(1, count($pieces));
        $answers = ['world:n' => ['v' => count($pieces), 'at' => 500]];
        foreach ($pieces as $i => $piece) {
            $answers["world:{$i}"] = ['v' => $piece, 'at' => 500];
        }
        $this->saveAnswers($token, $answers)->assertOk();

        $back = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/v1/lessons/fractions-1/answers')->assertOk()->json('answers');
        $this->assertSame(count($pieces), $back['world:n']['v']);
        $joined = '';
        foreach (array_keys($pieces) as $i) {
            $this->assertSame(500, $back["world:{$i}"]['at']);
            $joined .= $back["world:{$i}"]['v'];
        }
        $this->assertSame($save, $joined);
        // un appareil en retard (heure plus ancienne) ne remplace aucun morceau
        $this->saveAnswers($token, ['world:n' => ['v' => 1, 'at' => 400], 'world:0' => ['v' => 'old', 'at' => 400]])
            ->assertJsonPath('answers.world:n.v', count($pieces))->assertJsonPath('answers.world:0.v', $pieces[0]);
    }

    public function test_answers_are_private_to_the_student(): void
    {
        [, $token] = $this->account('student');
        $this->saveAnswers($token, ['m1:q1' => ['v' => 2, 'at' => 100]]);

        // un autre élève voit SES réponses (aucune), jamais celles d'un camarade
        $this->app['auth']->forgetGuards(); // chaque requête s'authentifie à neuf (Sanctum garde sinon le premier élève)
        [, $other] = $this->account('student');
        $res = $this->withHeader('Authorization', "Bearer {$other}")->getJson('/api/v1/lessons/fractions-1/answers')->assertOk();
        $this->assertCount(0, (array) $res->json('answers'));

        // un enseignant n'a pas de porte vers cette table
        $this->app['auth']->forgetGuards();
        [, $teacher] = $this->account('teacher');
        $this->withHeader('Authorization', "Bearer {$teacher}")->getJson('/api/v1/lessons/fractions-1/answers')->assertForbidden();

        // et le modèle ne se sérialise jamais avec les réponses
        $this->assertArrayNotHasKey('answers', StudentLessonAnswers::first()->toArray());
    }
}
