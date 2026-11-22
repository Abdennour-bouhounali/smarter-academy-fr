<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

class ClassroomJoinCodeTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function classroom(): Classroom
    {
        $this->defaultTeacherPlan();

        return Classroom::factory()->create();
    }

    public function test_rejoindre_par_code_puis_quitter_puis_revenir_reactive_la_meme_ligne(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();
        $token = $this->tokenOf($student);

        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => strtolower($classroom->join_code)])
            ->assertCreated()
            ->assertJsonPath('studyContext.mode', 'classroom')
            ->assertJsonPath('studyContext.primary.id', $classroom->id)
            ->assertJsonPath('studyContext.primary.name', $classroom->name);

        $this->withToken($token)->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")->assertOk()
            ->assertJsonPath('studyContext.mode', 'independent');
        $this->assertDatabaseHas('classroom_memberships', ['classroom_id' => $classroom->id, 'student_id' => $student->id, 'status' => 'left']);

        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->count());
        $this->assertSame('active', ClassroomMembership::where('student_id', $student->id)->first()->status);
    }

    public function test_les_refus_portent_un_motif(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();
        $token = $this->tokenOf($student);

        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => 'ZZZZZZ'])->assertStatus(422)->assertJsonPath('reason', 'invalid');
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true])->assertStatus(422)->assertJsonPath('reason', 'invalid');

        $classroom->update(['join_code_enabled' => false]);
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertStatus(422)->assertJsonPath('reason', 'invalid');

        $classroom->update(['join_code_enabled' => true, 'status' => Classroom::STATUS_ARCHIVED]);
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertStatus(422)->assertJsonPath('reason', 'class_inactive');

        $classroom->update(['status' => Classroom::STATUS_ACTIVE]);
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertStatus(422)->assertJsonPath('reason', 'already_member');
    }

    public function test_un_enseignant_ne_rejoint_pas_une_classe(): void
    {
        $classroom = $this->classroom();
        $this->withToken($this->tokenOf($this->teacher()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'not_a_student');
    }

    public function test_un_code_renouvele_n_ouvre_plus(): void
    {
        $classroom = $this->classroom();
        $old = $classroom->join_code;
        $this->withToken($this->tokenOf($classroom->teacher))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-code/rotate")->assertOk();

        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $old])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid');
    }

    public function test_quitter_une_classe_ou_l_on_n_est_pas_est_refuse(): void
    {
        $classroom = $this->classroom();
        $this->withToken($this->tokenOf($this->student()))->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")
            ->assertStatus(422)->assertJsonPath('reason', 'not_member');
    }
}
