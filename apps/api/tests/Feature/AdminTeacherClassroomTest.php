<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * L'administration voit tout, et tient les dérogations d'offre.
 */
class AdminTeacherClassroomTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_la_fiche_enseignant_est_la_surface_de_controle(): void
    {
        $this->defaultTeacherPlan();
        $teacher = $this->teacher(['first_name' => 'Karim']);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        ClassroomMembership::factory()->in($classroom)->create();
        $admin = $this->admin();

        $this->withToken($this->tokenOf($admin))->getJson('/api/v1/admin/teachers')->assertOk()
            ->assertJsonPath('counts.all', 1)->assertJsonPath('teachers.data.0.firstName', 'Karim')->assertJsonPath('teachers.data.0.classroomsCount', 1);

        $detail = $this->withToken($this->tokenOf($admin))->getJson("/api/v1/admin/teachers/{$teacher->id}")->assertOk()->json();
        $this->assertSame('teacher-free', $detail['entitlements']['plan']['slug']);
        $this->assertSame(1, $detail['entitlements']['classes']['current']);
        $this->assertSame('plan', collect($detail['entitlementsDetail'])->firstWhere('key', K::CLASSROOMS_MAX)['source']);
        $this->assertCount(1, $detail['classrooms']);
        $this->assertSame(1, $detail['classrooms'][0]['studentsCount']);
        $this->assertSame([], $detail['subscriptions']);
    }

    public function test_une_derogation_releve_la_limite_et_se_retire(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $this->grade4am(0);
        $teacher = $this->teacher();
        $admin = $this->admin();
        $adminToken = $this->tokenOf($admin);

        $overrideId = $this->withToken($adminToken)
            ->postJson("/api/v1/admin/teachers/{$teacher->id}/entitlements/overrides", ['key' => K::CLASSROOMS_MAX, 'value' => 3, 'reason' => 'Partenariat'])
            ->assertCreated()->assertJsonPath('entitlements.classes.maximum', 3)->json('overrideId');

        $this->assertSame('override', collect($this->withToken($adminToken)->getJson("/api/v1/admin/teachers/{$teacher->id}/entitlements")->json('entitlementsDetail'))->firstWhere('key', K::CLASSROOMS_MAX)['source']);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::PLAN_OVERRIDE_GRANTED, 'user_id' => $admin->id]);

        $teacherToken = $this->tokenOf($teacher);
        foreach (['A', 'B', 'C'] as $name) {
            $this->withToken($teacherToken)->postJson('/api/v1/teacher/classrooms', ['name' => $name, 'grade' => '4am'])->assertCreated();
        }

        $this->withToken($adminToken)->deleteJson("/api/v1/admin/teachers/{$teacher->id}/entitlements/overrides/{$overrideId}")->assertOk()
            ->assertJsonPath('entitlements.classes.maximum', 1)->assertJsonPath('entitlements.classes.overLimit', true);
        $this->assertDatabaseHas('plan_entitlement_overrides', ['id' => $overrideId]); // révoquée, jamais supprimée
        $this->assertSame(3, Classroom::ownedBy($teacher)->count());
    }

    public function test_une_cle_inconnue_ou_une_valeur_du_mauvais_type_est_refusee(): void
    {
        $this->defaultTeacherPlan();
        $teacher = $this->teacher();
        $token = $this->tokenOf($this->admin());

        $this->withToken($token)->postJson("/api/v1/admin/teachers/{$teacher->id}/entitlements/overrides", ['key' => 'classes.maximum', 'value' => 3])->assertStatus(422);
        $this->withToken($token)->postJson("/api/v1/admin/teachers/{$teacher->id}/entitlements/overrides", ['key' => K::CLASSROOMS_MAX, 'value' => 'beaucoup'])->assertStatus(422);
        $this->assertDatabaseCount('plan_entitlement_overrides', 0);
    }

    public function test_les_classes_sont_consultables_par_l_administration(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create(['name' => '4AM Z']);
        ClassroomMembership::factory()->in($classroom)->create();
        $token = $this->tokenOf($this->admin());

        $this->withToken($token)->getJson('/api/v1/admin/classrooms?search=4AM%20Z')->assertOk()->assertJsonPath('classrooms.data.0.name', '4AM Z');
        $detail = $this->withToken($token)->getJson("/api/v1/admin/classrooms/{$classroom->id}")->assertOk()->json();
        $this->assertCount(1, $detail['students']);
        $this->assertCount(1, $detail['lessons']['chapters'][0]['lessons']);
    }

    public function test_le_statut_de_compte_d_un_enseignant(): void
    {
        $teacher = $this->teacher();
        $admin = $this->admin();

        $this->withToken($this->tokenOf($admin))->patchJson("/api/v1/admin/teachers/{$teacher->id}/status", ['status' => 'disabled'])->assertOk()
            ->assertJsonPath('teacher.accountStatus', 'disabled');
        $this->assertDatabaseHas('admin_activity_logs', ['action' => ActivityLogger::TEACHER_STATUS, 'entity_type' => 'teacher', 'entity_id' => (string) $teacher->id]);
        $this->assertSame(0, $teacher->tokens()->count());
    }
}
