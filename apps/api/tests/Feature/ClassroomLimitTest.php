<?php

namespace Tests\Feature;

use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Classroom;
use App\Models\Grade;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La limite de classes vient de l'OFFRE, jamais d'un nombre dans le code.
 * Les classes archivées ne comptent pas ; en ranimer une recompte.
 */
class ClassroomLimitTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_creer_sous_la_limite_puis_refus_a_la_limite(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 2]);
        $this->grade3e(0);
        $token = $this->tokenOf($this->teacher());

        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'A', 'grade' => '3e'])->assertCreated()
            ->assertJsonPath('classroom.status', 'active')->assertJsonPath('entitlements.classes.current', 1);
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'B', 'grade' => '3e'])->assertCreated()
            ->assertJsonPath('entitlements.classes.canCreate', false);
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'C', 'grade' => '3e'])
            ->assertStatus(422)->assertJsonPath('reason', 'limit_reached');
        $this->assertDatabaseCount('classrooms', 2);
    }

    public function test_une_classe_archivee_ne_compte_plus_et_la_ranimer_recompte(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 1]);
        $this->grade3e(0);
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $first = $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'A', 'grade' => '3e'])->json('classroom.id');
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$first}/archive")->assertOk()->assertJsonPath('classroom.status', 'archived');

        // Archiver a libéré la place : B se crée. Ranimer A dépasserait : refus.
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'B', 'grade' => '3e'])->assertCreated();
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$first}/restore")->assertStatus(422)->assertJsonPath('reason', 'limit_reached');

        // Rien n'a été supprimé.
        $this->assertSame(2, Classroom::ownedBy($teacher)->count());
        $this->assertSame('archived', Classroom::find($first)->status);
    }

    public function test_les_classes_scolaires_autorisees_viennent_de_l_offre(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 5, K::CONTENT_ALLOWED_GRADES => ['3e']]);
        $this->grade3e(0);
        Grade::create(['code' => '4e', 'name' => 'Quatrième', 'level' => 'college', 'order' => 2, 'is_active' => true]);
        $token = $this->tokenOf($this->teacher());

        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'T', 'grade' => '4e'])
            ->assertStatus(422)->assertJsonPath('reason', 'grade_not_allowed');
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'X', 'grade' => 'nope'])
            ->assertStatus(422)->assertJsonPath('reason', 'grade_not_allowed');
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'OK', 'grade' => '3e'])->assertCreated();
    }

    public function test_une_liste_vide_de_classes_autorisees_n_impose_rien(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 5, K::CONTENT_ALLOWED_GRADES => []]);
        $this->grade3e(0);
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/teacher/classrooms', ['name' => 'OK', 'grade' => '3e'])->assertCreated();
    }

    public function test_le_code_de_classe_est_unique_et_se_renouvelle(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 5]);
        $this->grade3e(0);
        $token = $this->tokenOf($this->teacher());

        $a = $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'A', 'grade' => '3e'])->json('classroom');
        $b = $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => 'B', 'grade' => '3e'])->json('classroom');
        $this->assertNotSame($a['joinCode'], $b['joinCode']);
        $this->assertMatchesRegularExpression('/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/', $a['joinCode']);

        $rotated = $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$a['id']}/join-code/rotate")->assertOk()->json('classroom.joinCode');
        $this->assertNotSame($a['joinCode'], $rotated);
    }
}
