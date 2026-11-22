<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * UNE CLASSE PAR ÉLÈVE (propriétaire, 2026-10-24) : un élève membre actif
 * d'une classe active n'en rejoint pas une seconde — ni par code, ni par
 * lien, ni chez un autre enseignant. Il quitte d'abord la sienne. Voir
 * TEACHER_CLASSROOM_ARCHITECTURE.md § « One class per student ».
 */
class ClassroomOneClassTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->defaultTeacherPlan();
        $this->grade4am(1);
    }

    private function join(User $student, array $door)
    {
        return $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true] + $door);
    }

    public function test_un_eleve_dans_une_classe_n_en_rejoint_pas_une_autre_ni_par_code_ni_par_lien(): void
    {
        $a = Classroom::factory()->create();
        $b = Classroom::factory()->create(); // un autre enseignant
        $student = $this->student();

        $this->join($student, ['code' => $a->join_code])->assertCreated();
        $this->join($student, ['code' => $b->join_code])->assertStatus(422)->assertJsonPath('reason', 'already_in_class');
        $this->join($student, ['link' => $b->join_link_token])->assertStatus(422)->assertJsonPath('reason', 'already_in_class');

        $this->assertDatabaseMissing('classroom_memberships', ['classroom_id' => $b->id, 'student_id' => $student->id]);
        // Rouvrir le lien de SA classe reste idempotent.
        $this->join($student, ['link' => $a->join_link_token])->assertOk()->assertJsonPath('alreadyMember', true);
    }

    public function test_apres_avoir_quitte_il_rejoint_une_autre_classe(): void
    {
        $a = Classroom::factory()->create();
        $b = Classroom::factory()->create();
        $student = $this->student();

        $this->join($student, ['code' => $a->join_code])->assertCreated();
        $this->withToken($this->tokenOf($student))->postJson("/api/v1/student/classrooms/{$a->id}/leave")->assertOk();
        $this->join($student, ['code' => $b->join_code])->assertCreated()
            ->assertJsonPath('studyContext.primary.id', $b->id);
        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->active()->count());
    }

    public function test_une_classe_archivee_ne_retient_pas_l_eleve(): void
    {
        $archived = Classroom::factory()->archived()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($archived)->of($student)->create();

        $b = Classroom::factory()->create();
        $this->join($student, ['code' => $b->join_code])->assertCreated();
    }

    public function test_l_apercu_du_lien_nomme_la_classe_actuelle_de_l_eleve(): void
    {
        $a = Classroom::factory()->create(['name' => 'رياضيات 4م1']);
        $b = Classroom::factory()->create();
        $student = $this->student();
        $this->join($student, ['code' => $a->join_code])->assertCreated();

        $this->withToken($this->tokenOf($student))->getJson("/api/v1/join-links/{$b->join_link_token}")->assertOk()
            ->assertJsonPath('joinLink.alreadyMember', false)
            ->assertJsonPath('joinLink.currentClassroomName', 'رياضيات 4م1');
        // Sur le lien de SA classe : déjà membre, aucun autre nom.
        $this->withToken($this->tokenOf($student))->getJson("/api/v1/join-links/{$a->join_link_token}")->assertOk()
            ->assertJsonPath('joinLink.alreadyMember', true)
            ->assertJsonPath('joinLink.currentClassroomName', null);
        // Sans session : rien.
        $this->app['auth']->forgetGuards();
        $this->withoutToken()->getJson("/api/v1/join-links/{$b->join_link_token}")->assertOk()->assertJsonPath('joinLink.currentClassroomName', null);
    }
}
