<?php

namespace Tests\Feature;

use App\Domain\Access\ContentAccess;
use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Chapter;
use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\ClassroomMembership;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\PlanEntitlement;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Le troisième axe : masquer pour UNE classe, sans toucher la publication.
 */
class ClassroomLessonVisibilityTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    /** @return array{classroom: Classroom, student: User, lessons: Collection<int, Lesson>} */
    private function classWithStudent(array $entitlements = []): array
    {
        $this->defaultTeacherPlan($entitlements);
        ['lessons' => $lessons] = $this->grade4am(3);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();

        return ['classroom' => $classroom, 'student' => $student, 'lessons' => $lessons];
    }

    public function test_masquee_pour_la_classe_la_lecon_se_ferme_a_l_eleve_et_reste_publiee(): void
    {
        ['classroom' => $classroom, 'student' => $student, 'lessons' => $lessons] = $this->classWithStudent();
        $lesson = $lessons[0];
        $teacherToken = $this->tokenOf($classroom->teacher);
        $studentToken = $this->tokenOf($student);

        $this->withToken($studentToken)->getJson('/api/v1/content/availability')->assertOk()->assertJsonPath('closed.hiddenByClass', []);

        $this->withToken($teacherToken)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lesson->id}", ['status' => 'hidden'])
            ->assertOk()->assertJsonPath('changed', true)->assertJsonPath('classStatus', 'hidden');

        $this->withToken($studentToken)->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass.0', $lesson->code);
        $this->withToken($studentToken)->getJson("/api/v1/lessons/{$lesson->code}/practice/overview")->assertStatus(422);
        $this->withToken($studentToken)->putJson("/api/v1/lessons/{$lesson->code}/progress", [
            'completedModules' => [], 'currentModule' => 1, 'status' => 'in_progress', 'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(422);

        // La publication GLOBALE n'a pas bougé, et un élève indépendant la lit toujours.
        $this->assertSame(Lesson::PUB_PUBLISHED, $lesson->fresh()->publication_status);
        $this->withToken($this->tokenOf($this->student()))->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass', []);
        ContentAccess::assertLessonAvailable($lesson->code, $this->student());

        // Remontrer rouvre.
        $this->withToken($teacherToken)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lesson->id}", ['status' => 'visible'])->assertOk();
        $this->withToken($studentToken)->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass', []);
    }

    public function test_une_lecon_non_publiee_reste_fermee_meme_visible_pour_la_classe(): void
    {
        ['classroom' => $classroom, 'student' => $student, 'lessons' => $lessons] = $this->classWithStudent();
        $lesson = $lessons[1];
        $lesson->update(['publication_status' => Lesson::PUB_DRAFT]);

        $this->withToken($this->tokenOf($classroom->teacher))
            ->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lesson->id}", ['status' => 'visible'])->assertOk();

        $this->expectException(DomainException::class);
        ContentAccess::assertLessonAvailable($lesson->code, $student);
    }

    public function test_masquer_dans_une_classe_ne_masque_pas_dans_l_autre(): void
    {
        ['classroom' => $a, 'student' => $studentA, 'lessons' => $lessons] = $this->classWithStudent();
        $b = Classroom::factory()->create();
        $studentB = $this->student();
        ClassroomMembership::factory()->in($b)->of($studentB)->create();

        $this->withToken($this->tokenOf($a->teacher))->patchJson("/api/v1/teacher/classrooms/{$a->id}/lessons/{$lessons[0]->id}", ['status' => 'hidden'])->assertOk();

        $this->withToken($this->tokenOf($studentA))->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass.0', $lessons[0]->code);
        $this->withToken($this->tokenOf($studentB))->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass', []);
    }

    public function test_un_eleve_de_deux_classes_voit_une_lecon_si_une_seule_la_montre(): void
    {
        ['classroom' => $a, 'student' => $student, 'lessons' => $lessons] = $this->classWithStudent();
        $b = Classroom::factory()->create();
        ClassroomMembership::factory()->in($b)->of($student)->create();
        $lesson = $lessons[0];

        $this->withToken($this->tokenOf($a->teacher))->patchJson("/api/v1/teacher/classrooms/{$a->id}/lessons/{$lesson->id}", ['status' => 'hidden'])->assertOk();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass', []);

        $this->withToken($this->tokenOf($b->teacher))->patchJson("/api/v1/teacher/classrooms/{$b->id}/lessons/{$lesson->id}", ['status' => 'hidden'])->assertOk();
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/content/availability')->assertJsonPath('closed.hiddenByClass.0', $lesson->code);
    }

    public function test_l_enseignant_a_ne_regle_pas_la_classe_de_b_et_une_lecon_hors_programme_est_refusee(): void
    {
        ['classroom' => $a, 'lessons' => $lessons] = $this->classWithStudent();
        $b = Classroom::factory()->create();

        $this->withToken($this->tokenOf($a->teacher))->patchJson("/api/v1/teacher/classrooms/{$b->id}/lessons/{$lessons[0]->id}", ['status' => 'hidden'])->assertStatus(403);
        $this->assertDatabaseCount('classroom_lessons', 0);

        $otherGrade = Grade::create(['code' => 'terminale_dz', 'name' => 'T', 'level' => 'secondaire', 'order' => 2, 'is_active' => true]);
        $chapter = Chapter::factory()->create(['grade_id' => $otherGrade->id]);
        $foreign = Lesson::factory()->inChapter($chapter)->create();
        $this->withToken($this->tokenOf($a->teacher))->patchJson("/api/v1/teacher/classrooms/{$a->id}/lessons/{$foreign->id}", ['status' => 'hidden'])
            ->assertStatus(422)->assertJsonPath('reason', 'lesson_out_of_scope');
    }

    public function test_le_lot_est_le_geste_unitaire_repete_et_il_depend_de_l_offre(): void
    {
        ['classroom' => $classroom, 'lessons' => $lessons] = $this->classWithStudent([K::LESSONS_BULK_ACTIONS => false]);
        $token = $this->tokenOf($classroom->teacher);
        $ids = $lessons->pluck('id')->all();

        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/bulk", ['lessonIds' => $ids, 'status' => 'hidden'])
            ->assertStatus(422)->assertJsonPath('reason', 'feature_unavailable');

        PlanEntitlement::where('key', K::LESSONS_BULK_ACTIONS)->update(['value' => json_encode(true)]);
        $this->forgetAll();

        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$ids[0]}", ['status' => 'hidden'])->assertOk();
        $result = $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/bulk", ['lessonIds' => [...$ids, 999999], 'status' => 'hidden'])->assertOk()->json();
        $this->assertSame([$ids[1], $ids[2]], $result['applied']);
        $this->assertSame([$ids[0]], $result['unchanged']);
        $this->assertSame(999999, $result['failed'][0]['id']);
        $this->assertSame(3, ClassroomLesson::where('classroom_id', $classroom->id)->where('status', 'hidden')->count());
    }

    public function test_le_programme_de_la_classe_dit_l_etat_effectif(): void
    {
        ['classroom' => $classroom, 'lessons' => $lessons] = $this->classWithStudent();
        $lessons[2]->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $token = $this->tokenOf($classroom->teacher);
        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lessons[0]->id}", ['status' => 'hidden'])->assertOk();

        $rows = collect($this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons")->assertOk()->json('curriculum.chapters.0.lessons'))->keyBy('id');
        $this->assertFalse($rows[$lessons[0]->id]['effectiveForStudents']);
        $this->assertSame('hidden', $rows[$lessons[0]->id]['classStatus']);
        $this->assertTrue($rows[$lessons[1]->id]['effectiveForStudents']);
        $this->assertFalse($rows[$lessons[2]->id]['effectiveForStudents']);
        $this->assertSame('visible', $rows[$lessons[2]->id]['classStatus']);
    }
}
