<?php

namespace Tests\Feature;

use App\Domain\Classroom\StudentCredentials;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * « بطاقات الدخول » — l'enseignant émet un nouveau mot de passe pour des
 * élèves de SA classe et l'imprime avec leur courriel (StudentCredentials).
 */
class TeacherStudentCredentialsTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    private function url(Classroom $classroom): string
    {
        return "/api/v1/teacher/classrooms/{$classroom->id}/students/credentials";
    }

    public function test_le_mot_de_passe_genere_respecte_les_regles_de_l_inscription(): void
    {
        foreach (range(1, 50) as $_) {
            $this->assertMatchesRegularExpression('/^[a-hjkmnp-z]{4}\d{4}$/', StudentCredentials::generate());
        }
    }

    public function test_l_enseignant_emet_une_carte_qui_ouvre_le_compte(): void
    {
        $this->defaultTeacherPlan();
        $classroom = Classroom::factory()->create();
        // Un compte Google d'avant le 2026-10-22 : aucun mot de passe.
        $google = $this->student(['email' => 'google@gmail.com', 'password' => null]);
        $local = $this->student(['email' => 'local@example.dz']);
        $this->enrol($classroom, [$google, $local]);

        $cards = $this->withToken($this->tokenOf($classroom->teacher))
            ->postJson($this->url($classroom), ['studentIds' => [$google->id, $local->id]])
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->json('credentials');

        $this->assertCount(2, $cards);
        foreach ($cards as $card) {
            $user = User::findOrFail($card['id']);
            $this->assertSame($user->email, $card['email']);
            $this->assertTrue(Hash::check($card['password'], $user->password));
            // Le clair n'est jamais stocké.
            $this->assertNotSame($card['password'], $user->getRawOriginal('password'));
            $this->assertTrue($user->hasPassword());
        }

        // Le geste est tracé, sans le mot de passe.
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'teacher.student_credentials_issued', 'entity_id' => $classroom->id]);
        $logs = json_encode(\Illuminate\Support\Facades\DB::table('admin_activity_logs')->get());
        foreach ($cards as $card) {
            $this->assertStringNotContainsString($card['password'], $logs);
        }
    }

    public function test_un_eleve_hors_de_la_classe_est_refuse_en_bloc(): void
    {
        $this->defaultTeacherPlan();
        $classroom = Classroom::factory()->create();
        $member = $this->student();
        $outsider = $this->student();
        $this->enrol($classroom, [$member]);
        $before = $member->fresh()->password;

        $this->withToken($this->tokenOf($classroom->teacher))
            ->postJson($this->url($classroom), ['studentIds' => [$member->id, $outsider->id]])
            ->assertStatus(422)
            ->assertJsonPath('reason', 'not_member');

        $this->assertSame($before, $member->fresh()->password);
    }

    public function test_un_autre_enseignant_ne_peut_rien_emettre(): void
    {
        $this->defaultTeacherPlan();
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->enrol($classroom, [$student]);
        $stranger = Classroom::factory()->create()->teacher;

        $this->withToken($this->tokenOf($stranger))
            ->postJson($this->url($classroom), ['studentIds' => [$student->id]])
            ->assertForbidden();
    }

    public function test_un_eleve_ne_peut_pas_appeler_la_route(): void
    {
        $this->defaultTeacherPlan();
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->enrol($classroom, [$student]);

        $this->withToken($this->tokenOf($student))
            ->postJson($this->url($classroom), ['studentIds' => [$student->id]])
            ->assertForbidden();
    }
}
