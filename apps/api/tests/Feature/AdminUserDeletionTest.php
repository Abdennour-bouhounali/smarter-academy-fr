<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La SUPPRESSION DÉFINITIVE d'un compte (UserDeletionService) : rien ne reste
 * de l'utilisateur, ni en base ni sur le disque ; jamais un administrateur ;
 * jamais sans l'e-mail retapé.
 */
class AdminUserDeletionTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_l_admin_supprime_un_eleve_et_tout_ce_qui_lui_appartient(): void
    {
        $admin = $this->admin();
        $student = $this->student(['email' => 'eleve@example.test']);
        $student->createToken('t');
        DB::table('sessions')->insert(['id' => 's1', 'user_id' => $student->id, 'payload' => '', 'last_activity' => time()]);

        Storage::disk('local')->put('reports/9/capture.png', 'png');
        StudentReport::factory()->create(['user_id' => $student->id, 'screenshot_path' => 'reports/9/capture.png']);

        $this->withToken($this->tokenOf($admin))
            ->deleteJson("/api/v1/admin/users/{$student->id}", ['confirmEmail' => 'ELEVE@example.test '])
            ->assertOk()
            ->assertJsonPath('id', $student->id)
            ->assertJsonPath('role', 'student')
            ->assertJsonPath('filesDeleted', 1);

        $this->assertDatabaseMissing('users', ['id' => $student->id]);
        $this->assertDatabaseMissing('student_reports', ['user_id' => $student->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $student->id, 'tokenable_type' => User::class]);
        $this->assertDatabaseMissing('sessions', ['user_id' => $student->id]);
        Storage::disk('local')->assertMissing('reports/9/capture.png');

        // L'audit garde l'identifiant et le rôle — aucune donnée personnelle.
        $log = DB::table('admin_activity_logs')->where('action', 'user.deleted')->first();
        $this->assertSame((string) $student->id, $log->entity_id);
        $this->assertStringNotContainsString('eleve@example.test', (string) $log->before.(string) $log->after);
    }

    public function test_supprimer_un_enseignant_emporte_ses_classes_mais_pas_ses_eleves(): void
    {
        $admin = $this->admin();
        $teacher = $this->teacher();
        $student = $this->student();
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        $this->withToken($this->tokenOf($admin))
            ->getJson("/api/v1/admin/users/{$teacher->id}/deletion-preview")
            ->assertOk()
            ->assertJsonPath('summary.classrooms', 1)
            ->assertJsonPath('summary.studentsInClassrooms', 1);

        $this->withToken($this->tokenOf($admin))
            ->deleteJson("/api/v1/admin/users/{$teacher->id}", ['confirmEmail' => $teacher->email])
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $teacher->id]);
        $this->assertDatabaseMissing('classrooms', ['id' => $classroom->id]);
        $this->assertDatabaseMissing('classroom_memberships', ['classroom_id' => $classroom->id]);
        $this->assertDatabaseHas('users', ['id' => $student->id]);
    }

    public function test_sans_le_bon_e_mail_rien_n_est_supprime(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $this->withToken($this->tokenOf($admin))
            ->deleteJson("/api/v1/admin/users/{$student->id}", ['confirmEmail' => 'autre@example.test'])
            ->assertStatus(422);
        $this->withToken($this->tokenOf($admin))
            ->deleteJson("/api/v1/admin/users/{$student->id}", [])
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $student->id]);
        $this->assertDatabaseMissing('admin_activity_logs', ['action' => 'user.deleted']);
    }

    public function test_un_administrateur_ne_se_supprime_jamais(): void
    {
        $admin = $this->admin();
        $other = $this->admin();
        $token = $this->tokenOf($admin);

        $this->withToken($token)->deleteJson("/api/v1/admin/users/{$admin->id}", ['confirmEmail' => $admin->email])
            ->assertStatus(422);
        $this->withToken($token)->deleteJson("/api/v1/admin/users/{$other->id}", ['confirmEmail' => $other->email])
            ->assertStatus(422);
        $this->withToken($token)->getJson("/api/v1/admin/users/{$other->id}/deletion-preview")
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        $this->assertDatabaseHas('users', ['id' => $other->id]);
    }

    public function test_seul_l_admin_peut_supprimer(): void
    {
        $teacher = $this->teacher();
        $student = $this->student();

        $this->withToken($this->tokenOf($teacher))
            ->deleteJson("/api/v1/admin/users/{$student->id}", ['confirmEmail' => $student->email])
            ->assertStatus(403);

        $this->assertDatabaseHas('users', ['id' => $student->id]);
    }

    public function test_un_visiteur_anonyme_ne_peut_pas_supprimer(): void
    {
        $student = $this->student();

        $this->deleteJson("/api/v1/admin/users/{$student->id}", ['confirmEmail' => $student->email])
            ->assertStatus(401);

        $this->assertDatabaseHas('users', ['id' => $student->id]);
    }
}
