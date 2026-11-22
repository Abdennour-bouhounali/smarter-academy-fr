<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les ÉCRITURES de la pratique appartiennent à l'élève (2026-10-05).
 *
 * L'enseignant — ambassadeur ou non — et l'administrateur parcourent le
 * بنك التمارين dans leur navigateur, sans suivi : le serveur refuse toute
 * séance, tentative, indice ou complétion venant d'eux (403 not_a_learner).
 * Rien n'est écrit, ni pour eux ni pour personne.
 */
class PracticeLearnerGuardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'qasim-mushtarak-akbar',
            'title' => 'القاسم المشترك الأكبر', 'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        PracticeCapability::forget();
    }

    /** @return array<string, array{string, string}> */
    public static function writes(): array
    {
        $uuid = '00000000-0000-4000-8000-000000000000';

        return [
            'ouvrir une séance' => ['POST', '/api/v1/lessons/qasim-mushtarak-akbar/practice/sessions'],
            'ouvrir une question' => ['POST', "/api/v1/practice/sessions/{$uuid}/questions"],
            'répondre' => ['POST', "/api/v1/practice/sessions/{$uuid}/answers"],
            'terminer un exercice' => ['POST', "/api/v1/practice/sessions/{$uuid}/exercise-completions"],
            'terminer la séance' => ['POST', "/api/v1/practice/sessions/{$uuid}/complete"],
            'demander un indice' => ['POST', "/api/v1/practice/question-attempts/{$uuid}/hints"],
        ];
    }

    private function nonLearners(): array
    {
        $ambassador = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $ambassador->forceFill(['is_ambassador' => true])->save();

        return [
            'enseignant' => User::factory()->create(['role' => User::ROLE_TEACHER]),
            'ambassadeur' => $ambassador,
            'administrateur' => User::factory()->create(['role' => User::ROLE_ADMIN]),
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('writes')]
    public function test_aucune_ecriture_de_pratique_hors_eleve(string $method, string $uri): void
    {
        foreach ($this->nonLearners() as $label => $user) {
            $this->actingAs($user, 'sanctum')->json($method, $uri, ['level' => 1])
                ->assertStatus(403)
                ->assertJsonPath('reason', 'not_a_learner');
        }

        $this->assertDatabaseCount('practice_sessions', 0);
        $this->assertDatabaseCount('question_attempts', 0);
        $this->assertDatabaseCount('exercise_attempts', 0);
    }

    public function test_l_eleve_garde_l_acces_a_l_ecriture(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4am']);

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/lessons/qasim-mushtarak-akbar/practice/sessions', ['level' => 1]);
        $this->assertNotSame(403, $response->status(), 'le garde ne doit jamais refuser un élève');
    }

    public function test_l_enseignant_lit_toujours_la_liste_des_exercices(): void
    {
        $this->actingAs(User::factory()->create(['role' => User::ROLE_TEACHER]), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
