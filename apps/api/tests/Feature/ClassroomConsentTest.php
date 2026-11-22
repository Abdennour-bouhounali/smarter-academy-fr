<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Rejoindre un قسم partage l'apprentissage de l'élève avec son enseignant :
 * ce partage est un geste EXPLICITE, daté, et lié au texte lu. Ni un code
 * tapé, ni un lien de classe ouvert ne suffisent sans lui.
 */
class ClassroomConsentTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_joining_by_code_without_consent_is_refused_and_creates_nothing(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['code' => $classroom->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->assertSame(0, ClassroomMembership::count());
    }

    public function test_a_join_link_without_consent_is_refused(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();

        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['link' => $classroom->join_link_token])
            ->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->assertSame(0, ClassroomMembership::count());
    }

    public function test_consent_is_dated_and_versioned(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();

        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['code' => $classroom->join_code, 'consent' => true])
            ->assertCreated()
            ->assertJsonPath('studyContext.primary.consentRequired', false);

        $m = ClassroomMembership::first();
        $this->assertNotNull($m->consented_at);
        $this->assertSame(config('classroom.consent_version'), $m->consent_version);
    }

    public function test_a_member_from_before_the_text_is_asked_once_and_can_confirm(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->withoutConsent()->create();
        $token = $this->tokenOf($student);

        $this->withToken($token)->getJson('/api/v1/student/study-context')->assertJsonPath('studyContext.primary.consentRequired', true);

        $this->withToken($token)->postJson("/api/v1/student/classrooms/{$classroom->id}/consent")
            ->assertOk()->assertJsonPath('studyContext.primary.consentRequired', false);
        $this->assertNotNull(ClassroomMembership::first()->consented_at);

        // Une classe dont l'élève n'est pas membre : refus.
        $other = Classroom::factory()->create();
        $this->withToken($token)->postJson("/api/v1/student/classrooms/{$other->id}/consent")->assertStatus(422);
    }

    public function test_changing_the_text_asks_again(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        config(['classroom.consent_version' => '2099-01-01']);
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/student/study-context')->assertJsonPath('studyContext.primary.consentRequired', true);
    }
}
