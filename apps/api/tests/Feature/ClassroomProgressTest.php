<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\NotebookNote;
use App\Models\StudentLessonProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La progression vue par l'enseignant est une AGRÉGATION des données de
 * l'élève — et ces données lui survivent quand il quitte la classe.
 */
class ClassroomProgressTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_la_liste_des_eleves_lit_la_progression_sur_les_lecons_effectives(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(4);
        $classroom = Classroom::factory()->create();
        $a = $this->student(['last_activity_at' => now()]);
        $b = $this->student(['last_activity_at' => now()]);
        ClassroomMembership::factory()->in($classroom)->of($a)->create();
        ClassroomMembership::factory()->in($classroom)->of($b)->create();
        $teacherToken = $this->tokenOf($classroom->teacher);

        // La 4e leçon est masquée pour la classe : hors périmètre.
        $this->withToken($teacherToken)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lessons[3]->id}", ['status' => 'hidden'])->assertOk();

        foreach ([[$a, $lessons[0], 'completed', 0], [$a, $lessons[1], 'completed', 0], [$a, $lessons[3], 'completed', 0], [$b, $lessons[0], 'in_progress', 30]] as [$student, $lesson, $status, $daysAgo]) {
            StudentLessonProgress::create([
                'user_id' => $student->id, 'lesson_id' => $lesson->id, 'status' => $status,
                'current_module' => 1, 'completed_modules' => ['1', '2'], 'last_activity_at' => now()->subDays($daysAgo),
                'completed_at' => $status === 'completed' ? now() : null,
            ]);
        }

        $rows = collect($this->withToken($teacherToken)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students")->assertOk()->json('students'))->keyBy('id');
        $this->assertSame(2, $rows[$a->id]['lessonsCompleted']); // la leçon masquée ne compte pas
        $this->assertSame(67.0, (float) $rows[$a->id]['progressPercent']);
        $this->assertSame(1, $rows[$b->id]['lessonsStarted']);
        $this->assertNull($rows[$b->id]['successRate']);
        // La dernière activité se lit dans le PÉRIMÈTRE de la classe (ses
        // leçons), pas sur users.last_activity_at.
        $this->assertTrue(now()->subDays(29)->greaterThan($rows[$b->id]['lastActivityAt']));
    }

    /**
     * Le DOSSIER de progression ne porte pas le cahier — et ne le portera
     * pas. Depuis le 2026-09-24, l'enseignant peut lire le cahier d'un élève
     * de sa classe, mais par une route dédiée, en lecture seule et bornée aux
     * leçons du قسم (TeacherClassroomNotebookTest). Les deux lectures restent
     * SÉPARÉES : « où en est-il ? » et « qu'a-t-il noté ? » sont deux
     * questions, deux écrans, deux permissions à faire évoluer séparément.
     */
    public function test_le_dossier_d_un_eleve_est_cadre_sur_la_classe_et_ne_contient_pas_son_cahier(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();
        StudentLessonProgress::create(['user_id' => $student->id, 'lesson_id' => $lessons[0]->id, 'status' => 'completed', 'completed_modules' => ['1'], 'last_activity_at' => now(), 'completed_at' => now()]);
        NotebookNote::create(['user_id' => $student->id, 'lesson_id' => $lessons[0]->id, 'title' => 'privé', 'content' => '<p>secret</p>', 'content_text' => 'secret']);

        $detail = $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/progress")
            ->assertOk()->json();

        $this->assertSame(1, $detail['learning']['lessonsCompleted']);
        $this->assertSame(50.0, (float) $detail['learning']['progressPercent']);
        $this->assertStringNotContainsString('secret', json_encode($detail));
        $this->assertArrayNotHasKey('notes', $detail);
    }

    public function test_quitter_ou_etre_retire_ne_detruit_aucune_donnee_d_apprentissage(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        StudentLessonProgress::create(['user_id' => $student->id, 'lesson_id' => $lessons[0]->id, 'status' => 'completed', 'completed_modules' => ['1'], 'last_activity_at' => now(), 'completed_at' => now()]);
        NotebookNote::create(['user_id' => $student->id, 'lesson_id' => $lessons[0]->id, 'title' => 'n', 'content' => '<p>x</p>', 'content_text' => 'x']);

        $this->withToken($this->tokenOf($student))->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")->assertOk();
        $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        $this->withToken($this->tokenOf($classroom->teacher))->deleteJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}")->assertOk();
        $this->withToken($this->tokenOf($classroom->teacher))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/archive")->assertOk();

        $this->assertDatabaseHas('student_lesson_progress', ['user_id' => $student->id, 'lesson_id' => $lessons[0]->id, 'status' => 'completed']);
        $this->assertDatabaseHas('notebook_notes', ['user_id' => $student->id]);
        $this->withToken($this->tokenOf($student))->getJson('/api/v1/students/me/lesson-progress')->assertOk()->assertJsonPath("progress.{$lessons[0]->code}.status", 'completed');
    }

    public function test_un_eleve_qui_n_est_pas_dans_la_classe_repond_404(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $stranger = $this->student();

        $this->withToken($this->tokenOf($classroom->teacher))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$stranger->id}/progress")
            ->assertStatus(404);
    }
}
