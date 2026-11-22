<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * L'AMBASSADEUR (« سفير ») : un enseignant que l'administrateur désigne d'un
 * interrupteur. Le drapeau voyage dans /auth/me (isAmbassador,
 * canReviewContent) ; il ne touche ni le statut de compte, ni l'offre.
 */
class AmbassadorToggleTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_l_admin_designe_puis_retire_un_ambassadeur(): void
    {
        $admin = $this->admin();
        $teacher = $this->teacher();
        $token = $this->tokenOf($admin);

        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => true])
            ->assertOk()
            ->assertJsonPath('teacher.isAmbassador', true);
        $teacher->refresh();
        $this->assertTrue($teacher->is_ambassador);
        $this->assertNotNull($teacher->ambassador_since);
        $this->assertTrue($teacher->isAmbassador());
        $this->assertTrue($teacher->canReviewAllContent());

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $admin->id, 'action' => 'teacher.ambassador_changed', 'entity_id' => (string) $teacher->id,
        ]);

        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => false])
            ->assertOk()
            ->assertJsonPath('teacher.isAmbassador', false);
        $teacher->refresh();
        $this->assertFalse($teacher->is_ambassador);
        $this->assertNull($teacher->ambassador_since);
        $this->assertFalse($teacher->canReviewAllContent());
    }

    public function test_redemander_l_etat_courant_ne_journalise_rien(): void
    {
        $admin = $this->admin();
        $teacher = $this->teacher();

        $this->withToken($this->tokenOf($admin))->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => false])
            ->assertOk();
        $this->assertDatabaseMissing('admin_activity_logs', ['action' => 'teacher.ambassador_changed']);
    }

    public function test_le_drapeau_ne_touche_ni_le_statut_ni_le_role(): void
    {
        $teacher = $this->teacher();
        $this->withToken($this->tokenOf($this->admin()))->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => true])->assertOk();

        $teacher->refresh();
        $this->assertSame(User::ROLE_TEACHER, $teacher->role);
        $this->assertSame(User::STATUS_ACTIVE, $teacher->account_status);
    }

    public function test_seul_un_enseignant_peut_etre_ambassadeur(): void
    {
        $admin = $this->admin();
        $token = $this->tokenOf($admin);

        // La route ne trouve que des enseignants : un élève ou un admin y est introuvable.
        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$this->student()->id}/ambassador", ['ambassador' => true])->assertStatus(422);
        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$admin->id}/ambassador", ['ambassador' => true])->assertStatus(422);
        $this->assertSame(0, User::where('is_ambassador', true)->count());
    }

    public function test_un_drapeau_sur_un_non_enseignant_n_ouvre_rien(): void
    {
        $student = $this->student();
        $student->forceFill(['is_ambassador' => true])->save();

        $this->assertFalse($student->fresh()->isAmbassador());
        $this->assertFalse($student->fresh()->canReviewAllContent());
    }

    public function test_la_valeur_est_validee(): void
    {
        $teacher = $this->teacher();
        $token = $this->tokenOf($this->admin());

        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", [])->assertStatus(422);
        $this->withToken($token)->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => 'peut-être'])->assertStatus(422);
    }

    public function test_seul_l_admin_peut_designer(): void
    {
        $teacher = $this->teacher();
        foreach ([$this->teacher(), $this->student()] as $actor) {
            $this->withToken($this->tokenOf($actor))->patchJson("/api/v1/admin/teachers/{$teacher->id}/ambassador", ['ambassador' => true])
                ->assertStatus(403);
        }
        $this->assertFalse($teacher->fresh()->is_ambassador);
    }

    public function test_la_liste_compte_et_filtre_les_ambassadeurs(): void
    {
        $admin = $this->admin();
        $ambassador = $this->teacher();
        $this->teacher();
        $ambassador->forceFill(['is_ambassador' => true])->save();

        $token = $this->tokenOf($admin);
        $this->withToken($token)->getJson('/api/v1/admin/teachers')->assertOk()
            ->assertJsonPath('counts.ambassadors', 1)
            ->assertJsonPath('counts.all', 2);

        $this->withToken($token)->getJson('/api/v1/admin/teachers?ambassador=1')->assertOk()
            ->assertJsonCount(1, 'teachers.data')
            ->assertJsonPath('teachers.data.0.id', $ambassador->id)
            ->assertJsonPath('teachers.data.0.isAmbassador', true);
    }

    public function test_auth_me_porte_le_drapeau(): void
    {
        $teacher = $this->teacher();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/auth/me')->assertOk()
            ->assertJsonPath('user.isAmbassador', false)
            ->assertJsonPath('user.canReviewContent', false);

        $teacher->forceFill(['is_ambassador' => true])->save();
        $this->forgetAll();
        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/auth/me')->assertOk()
            ->assertJsonPath('user.isAmbassador', true)
            ->assertJsonPath('user.canReviewContent', true);

        $this->withToken($this->tokenOf($this->admin()))->getJson('/api/v1/auth/me')->assertOk()
            ->assertJsonPath('user.isAmbassador', false)
            ->assertJsonPath('user.canReviewContent', true);
        $this->withToken($this->tokenOf($this->student()))->getJson('/api/v1/auth/me')->assertOk()
            ->assertJsonPath('user.canReviewContent', false);
    }
}
