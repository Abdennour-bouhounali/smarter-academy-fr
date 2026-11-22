<?php

namespace Tests\Feature;

use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Classroom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Les sièges : par classe ET au total, tous deux venus de l'offre, vérifiés
 * au moment de rejoindre.
 */
class ClassroomMembershipCapacityTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_la_capacite_par_classe_est_tenue(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 3, K::STUDENTS_PER_CLASSROOM_MAX => 2, K::STUDENTS_TOTAL_MAX => 10]);
        $classroom = Classroom::factory()->create();

        foreach ([1, 2] as $_) {
            $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        }
        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'class_full');
    }

    public function test_le_total_de_sieges_est_tenu_a_travers_les_classes_et_un_retrait_libere_un_siege(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => 3, K::STUDENTS_PER_CLASSROOM_MAX => 10, K::STUDENTS_TOTAL_MAX => 3]);
        $teacher = $this->teacher();
        $a = Classroom::factory()->ownedBy($teacher)->create();
        $b = Classroom::factory()->ownedBy($teacher)->create();

        $s1 = $this->student();
        $s2 = $this->student();
        $s3 = $this->student();
        $this->withToken($this->tokenOf($s1))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $a->join_code])->assertCreated();
        $this->withToken($this->tokenOf($s2))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $a->join_code])->assertCreated();
        $this->withToken($this->tokenOf($s3))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $b->join_code])->assertCreated();

        // Un élève n'a qu'une classe : s1 ne rejoint pas B.
        $this->withToken($this->tokenOf($s1))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $b->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'already_in_class');

        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $b->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'seats_exhausted');

        $this->withToken($this->tokenOf($teacher))->getJson('/api/v1/teacher/entitlements')
            ->assertJsonPath('entitlements.students.current', 3)->assertJsonPath('entitlements.students.canAdd', false);

        // L'enseignant retire s3 de B : un siège se libère.
        $this->withToken($this->tokenOf($teacher))->deleteJson("/api/v1/teacher/classrooms/{$b->id}/students/{$s3->id}")->assertOk();
        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $b->join_code])->assertCreated();
        $this->assertDatabaseHas('classroom_memberships', ['student_id' => $s3->id, 'status' => 'removed', 'removed_by' => $teacher->id]);
    }

    public function test_retirer_un_eleve_d_une_classe_qui_n_est_pas_la_sienne_repond_403(): void
    {
        $this->defaultTeacherPlan();
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();

        $this->withToken($this->tokenOf($this->teacher()))->deleteJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}")->assertStatus(403);
        $this->assertDatabaseHas('classroom_memberships', ['student_id' => $student->id, 'status' => 'active']);
    }
}
