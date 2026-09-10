<?php

namespace Tests\Feature;

use App\Domain\Admin\StudentService;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le statut de compte : décidé côté serveur, opposable immédiatement, et
 * sans jamais toucher à l'historique d'apprentissage.
 */
class AdminStudentManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => 'Sixième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions',
            'title' => 'Fractions', 'status' => 'available', 'order' => 0,
        ]);

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '6e']);
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_la_liste_des_eleves_se_filtre_et_se_compte(): void
    {
        User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '3e']);

        $this->asAdmin()->getJson('/api/v1/admin/students')
            ->assertStatus(200)
            ->assertJsonPath('counts.all', 2)
            ->assertJsonPath('counts.active', 2);

        $this->asAdmin()->getJson('/api/v1/admin/students?grade=3e')
            ->assertStatus(200)
            ->assertJsonCount(1, 'students.data');
    }

    /** Un admin n'apparaît pas dans la liste des élèves. */
    public function test_la_liste_des_eleves_ne_contient_pas_les_admins(): void
    {
        $this->asAdmin()->getJson('/api/v1/admin/students')
            ->assertStatus(200)
            ->assertJsonPath('counts.all', 1);
    }

    /**
     * Suspendre est immédiat et SERVEUR : le jeton encore en main de l'élève
     * ne lui sert plus à rien.
     */
    /**
     * Suspendre est immédiat et SERVEUR : le jeton encore en main de l'élève
     * ne lui sert plus à rien.
     *
     * L'appel d'administration et l'appel de l'élève sont ici séparés — dans
     * un même cas de test, Laravel mémorise l'utilisateur résolu au premier
     * appel authentifié, et l'élève continuerait d'être vu tel qu'il était
     * avant la suspension. En production ce sont deux requêtes distinctes ;
     * le test reproduit cette séparation en rechargeant l'état depuis la base.
     */
    public function test_suspendre_un_eleve_lui_ferme_l_api_aussitot(): void
    {
        $token = $this->student->createToken('s')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')->assertStatus(200);

        // La décision passe bien par le service d'administration...
        app(StudentService::class)
            ->changeStatus($this->admin, $this->student->id, User::STATUS_SUSPENDED);

        $this->assertSame(User::STATUS_SUSPENDED, $this->student->fresh()->account_status);

        // ...et la requête suivante de l'élève est refusée par le middleware.
        $this->app->forgetInstance('request');
        auth()->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')->assertStatus(403);
    }

    /** Un compte suspendu ne se reconnecte pas non plus. */
    public function test_un_compte_suspendu_ne_peut_plus_se_connecter(): void
    {
        $this->student->update(['password' => 'motdepasse123', 'account_status' => User::STATUS_SUSPENDED]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $this->student->email,
            'password' => 'motdepasse123',
        ])->assertStatus(403);
    }

    /** Désactiver révoque les jetons — état terminal. */
    public function test_desactiver_un_eleve_revoque_ses_jetons(): void
    {
        $this->student->createToken('s');
        $this->assertSame(1, $this->student->tokens()->count());

        $this->asAdmin()
            ->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => User::STATUS_DISABLED])
            ->assertStatus(200);

        $this->assertSame(0, $this->student->fresh()->tokens()->count());
    }

    /**
     * §2.4 : le cycle de vie du compte et la conservation des données sont
     * deux sujets distincts. Désactiver n'efface rien.
     */
    public function test_desactiver_un_compte_ne_supprime_aucune_donnee_d_apprentissage(): void
    {
        StudentLessonProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'status' => StudentLessonProgress::STATUS_COMPLETED,
            'completed_modules' => ['01', '02', '03'],
            'last_activity_at' => now(),
            'completed_at' => now(),
        ]);

        $this->asAdmin()
            ->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => User::STATUS_DISABLED])
            ->assertStatus(200);

        $this->assertDatabaseCount('student_lesson_progress', 1);
        $this->assertDatabaseHas('users', ['id' => $this->student->id]);
    }

    public function test_reactiver_un_compte_efface_la_date_de_suspension(): void
    {
        $this->asAdmin()->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => User::STATUS_SUSPENDED]);
        $this->assertNotNull($this->student->fresh()->suspended_at);

        $this->asAdmin()->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => User::STATUS_ACTIVE])
            ->assertStatus(200);

        $this->assertNull($this->student->fresh()->suspended_at);
    }

    public function test_un_statut_de_compte_inconnu_est_refuse(): void
    {
        $this->asAdmin()
            ->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => 'banni_a_vie'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_un_changement_de_statut_est_journalise(): void
    {
        $this->asAdmin()->patchJson("/api/v1/admin/students/{$this->student->id}/status", ['status' => User::STATUS_SUSPENDED]);

        $this->assertDatabaseHas('admin_activity_logs', [
            'action' => 'student.status_changed',
            'entity_id' => (string) $this->student->id,
        ]);
    }

    /** Le dossier d'un élève dérive de la maîtrise déjà calculée. */
    public function test_le_detail_d_un_eleve_expose_progression_maitrise_et_chronologie(): void
    {
        StudentLessonProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'status' => StudentLessonProgress::STATUS_COMPLETED,
            'completed_modules' => ['01', '02'],
            'last_activity_at' => now(),
            'completed_at' => now(),
        ]);

        $this->asAdmin()->getJson("/api/v1/admin/students/{$this->student->id}")
            ->assertStatus(200)
            ->assertJsonPath('student.learning.lessonsCompleted', 1)
            ->assertJsonPath('student.learning.modulesCompleted', 2)
            // Aucune réponse enregistrée : le taux est nul, pas « 0 % ».
            ->assertJsonPath('student.learning.successRate', null)
            ->assertJsonStructure(['student' => ['timeline', 'mastery', 'progress']]);
    }

    public function test_un_eleve_introuvable_donne_404(): void
    {
        $this->asAdmin()->getJson('/api/v1/admin/students/999999')->assertStatus(404);
    }

    /** Un admin n'est pas un élève : on ne le gère pas par cette porte. */
    public function test_un_admin_n_est_pas_atteignable_via_la_gestion_des_eleves(): void
    {
        $this->asAdmin()->getJson("/api/v1/admin/students/{$this->admin->id}")->assertStatus(404);
    }
}
