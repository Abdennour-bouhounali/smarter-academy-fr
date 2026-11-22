<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

class StudyContextTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_independant_sans_classe(): void
    {
        $this->withToken($this->tokenOf($this->student()))->getJson('/api/v1/student/study-context')
            ->assertOk()->assertJsonPath('studyContext.mode', 'independent')->assertJsonPath('studyContext.primary', null)->assertJsonPath('studyContext.classrooms', []);
    }

    public function test_la_classe_principale_est_la_plus_recente_et_une_classe_archivee_ne_compte_plus(): void
    {
        $this->defaultTeacherPlan();
        $student = $this->student();
        $old = Classroom::factory()->create(['name' => 'Ancienne']);
        $new = Classroom::factory()->create(['name' => 'Nouvelle']);
        ClassroomMembership::factory()->in($old)->of($student)->create(['joined_at' => now()->subMonth()]);
        ClassroomMembership::factory()->in($new)->of($student)->create(['joined_at' => now()]);

        $this->withToken($this->tokenOf($student))->getJson('/api/v1/student/study-context')
            ->assertJsonPath('studyContext.mode', 'classroom')->assertJsonPath('studyContext.primary.name', 'Nouvelle')->assertJsonCount(2, 'studyContext.classrooms');

        $new->update(['status' => Classroom::STATUS_ARCHIVED]);
        $this->forgetAll();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/student/study-context')->assertJsonPath('studyContext.primary.name', 'Ancienne');

        $old->update(['status' => Classroom::STATUS_ARCHIVED]);
        $this->forgetAll();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/student/study-context')->assertJsonPath('studyContext.mode', 'independent');
    }

    public function test_le_contexte_porte_le_nom_de_l_enseignant_et_jamais_le_code_de_classe(): void
    {
        $this->defaultTeacherPlan();
        $teacher = $this->teacher(['first_name' => 'Amina', 'last_name' => 'B.']);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        $context = $this->withToken($this->tokenOf($student))->getJson('/api/v1/student/study-context')->json('studyContext.primary');
        $this->assertSame('Amina B.', $context['teacherName']);
        $this->assertArrayNotHasKey('joinCode', $context);
    }
}
