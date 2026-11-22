<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * « الإعدادات » (2026-10-06) : les cinq niveaux de l'espace d'exercices ouverts
 * d'emblée. Un élève indépendant le règle lui-même ; un élève de classe, c'est
 * son enseignant — élève par élève.
 */
class StudentSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        PracticeCapability::forget();
        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان أنساب الأعداد والحساب', 'order' => 0]);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'bahth-pgcd', 'title' => 'البحث عن PGCD', 'status' => 'available', 'order' => 0]);
    }

    private function student(): User
    {
        return User::factory()->create(['role' => 'student', 'grade' => '4am']);
    }

    /** @return array<int, bool> niveau → ouvert */
    private function levels(User $student): array
    {
        $levels = $this->actingAs($student)->getJson('/api/v1/lessons/bahth-pgcd/practice/overview')->assertOk()->json('levels');

        return collect($levels)->mapWithKeys(fn ($l) => [$l['level'] => (bool) $l['unlocked']])->all();
    }

    public function test_by_default_levels_open_one_after_another(): void
    {
        $this->assertSame([1 => true, 2 => false, 3 => false, 4 => false, 5 => false], $this->levels($this->student()));
    }

    public function test_an_independent_student_opens_all_five_levels_in_settings(): void
    {
        $student = $this->student();
        $this->actingAs($student)->getJson('/api/v1/me/settings')
            ->assertOk()->assertJsonPath('settings.practiceLevelsOpen', false)->assertJsonPath('managedByTeacher', false);

        $this->actingAs($student)->patchJson('/api/v1/me/settings', ['practiceLevelsOpen' => true])
            ->assertOk()->assertJsonPath('settings.practiceLevelsOpen', true);

        $this->assertSame([1 => true, 2 => true, 3 => true, 4 => true, 5 => true], $this->levels($student));
    }

    public function test_a_class_member_cannot_change_it_but_his_teacher_can(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        $this->actingAs($student)->getJson('/api/v1/me/settings')->assertJsonPath('managedByTeacher', true);
        $this->actingAs($student)->patchJson('/api/v1/me/settings', ['practiceLevelsOpen' => true])
            ->assertStatus(422)->assertJsonPath('reason', 'managed_by_teacher');

        $this->actingAs($teacher)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/settings", ['practiceLevelsOpen' => true])
            ->assertOk()->assertJsonPath('settings.practiceLevelsOpen', true);
        $this->actingAs($teacher)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/settings")
            ->assertOk()->assertJsonPath('settings.practiceLevelsOpen', true);

        $this->assertSame([1 => true, 2 => true, 3 => true, 4 => true, 5 => true], $this->levels($student));
    }

    public function test_another_teacher_cannot_touch_a_student_who_is_not_in_his_class(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $other = User::factory()->create(['role' => 'teacher']);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        $foreign = Classroom::factory()->ownedBy($other)->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        // La classe d'un autre : refusée ; sa propre classe sans cet élève : introuvable.
        $this->actingAs($other)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/settings", ['practiceLevelsOpen' => true])
            ->assertForbidden();
        $this->actingAs($other)->patchJson("/api/v1/teacher/classrooms/{$foreign->id}/students/{$student->id}/settings", ['practiceLevelsOpen' => true])
            ->assertNotFound();
        $this->assertDatabaseMissing('student_settings', ['user_id' => $student->id]);
    }
}
