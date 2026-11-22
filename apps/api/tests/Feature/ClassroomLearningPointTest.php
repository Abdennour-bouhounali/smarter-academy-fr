<?php

namespace Tests\Feature;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPoint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Classe × learning point (Mastery V2, phase 7) : une agrégation de l'état
 * canonique, cadrée sur les leçons effectives, jamais un second stockage.
 */
class ClassroomLearningPointTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function practice(User $u, string $lessonCode, string $lpCode, string $attemptId, string $exercise, string $outcome, int $level = 4): void
    {
        app(ProgressEngine::class)->recordEvidence($u, $lessonCode, [
            'attemptId' => $attemptId, 'exerciseCode' => $exercise, 'questionId' => 'q1',
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'outcome' => $outcome,
            'learningPointRefs' => [['code' => $lpCode, 'role' => 'primary']],
            'level' => $level, 'difficulty' => $level, 'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
        ]);
    }

    public function test_the_class_sees_each_learning_point_of_a_lesson_by_status(): void
    {
        config(['mastery.engine_version' => 2]);
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $lesson = $lessons[0];
        $p1 = LearningPoint::create(['lesson_id' => $lesson->id, 'code' => "4am_{$lesson->code}_P1", 'title' => 'P1', 'order' => 1]);
        $p2 = LearningPoint::create(['lesson_id' => $lesson->id, 'code' => "4am_{$lesson->code}_P2", 'title' => 'P2', 'order' => 2]);

        $classroom = Classroom::factory()->create();
        $mastered = $this->student(['grade' => '4am']);
        $struggling = $this->student(['grade' => '4am']);
        $silent = $this->student(['grade' => '4am']);
        $outsider = $this->student(['grade' => '4am']);
        foreach ([$mastered, $struggling, $silent] as $s) {
            ClassroomMembership::factory()->in($classroom)->of($s)->create();
        }

        foreach ([1, 2, 3] as $i) {
            $this->practice($mastered, $lesson->code, $p1->code, "m{$i}", "ex-l4-00{$i}", 'correct');
        }
        // Échouer un item FACILE est une preuve négative forte (0,5 → 0,33, gap) ;
        // échouer un item difficile ne l'est pas (0,5 → 0,41, reinforce).
        $this->practice($struggling, $lesson->code, $p1->code, 's1', 'ex-l1-001', 'incorrect', 1);
        // Deux réussites distinctes de niveau 5 sur P2 : confiance haute
        // (0,896), mais 2 items distincts sur les 3 exigés → reinforce,
        // raison « preuve insuffisante ».
        $this->practice($struggling, $lesson->code, $p2->code, 's2', 'ex-l5-001', 'correct', 5);
        $this->practice($struggling, $lesson->code, $p2->code, 's3', 'ex-l5-002', 'correct', 5);
        // Un élève HORS classe : ne doit compter nulle part.
        $this->practice($outsider, $lesson->code, $p1->code, 'o1', 'ex-l4-001', 'correct');

        $token = $this->tokenOf($classroom->teacher);
        $r = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points?lesson={$lesson->code}")->assertOk();

        $this->assertSame(3, $r->json('students'));
        $points = collect($r->json('learningPoints'))->keyBy('code');
        $this->assertSame(['mastered' => 1, 'reinforce' => 0, 'gap' => 1, 'unassessed' => 1], $points[$p1->code]['counts']);
        $this->assertSame(['mastered' => 0, 'reinforce' => 1, 'gap' => 0, 'unassessed' => 2], $points[$p2->code]['counts']);
        $this->assertSame(1, $points[$p2->code]['reasons']['insufficientEvidence']);

        // Le détail d'un point : les plus fragiles d'abord, l'extérieur absent.
        $d = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points/{$p1->code}")->assertOk();
        $rows = $d->json('students');
        $this->assertSame([$struggling->id, $silent->id, $mastered->id], array_column($rows, 'id'));
        $this->assertSame(['gap', 'unassessed', 'mastered'], array_column($rows, 'status'));
        $this->assertSame(3, $rows[2]['distinctItemsSuccess']);

        // L'explication d'un élève de la classe.
        $e = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$mastered->id}/learning-points/{$p1->code}/explanation")->assertOk();
        $this->assertSame('mastered', $e->json('explanation.status'));
        $this->assertSame(3, $e->json('explanation.evidence.distinctItemsSuccess'));
        $this->assertCount(3, $e->json('explanation.recent'));

        // Hors classe : 404.
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$outsider->id}/learning-points/{$p1->code}/explanation")->assertNotFound();
    }

    public function test_a_hidden_lesson_is_out_of_scope_including_in_the_whole_scope_map(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $classroom = Classroom::factory()->create();
        $token = $this->tokenOf($classroom->teacher);
        LearningPoint::create(['lesson_id' => $lessons[1]->id, 'code' => "4am_{$lessons[1]->code}_P1", 'title' => 'P1', 'order' => 1]);

        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/{$lessons[1]->id}", ['status' => 'hidden'])->assertOk();

        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points?lesson={$lessons[1]->code}")->assertStatus(422);
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points/4am_{$lessons[1]->code}_P1")->assertStatus(422);

        // Sans `?lesson=`, la carte couvre tout le périmètre — et la leçon
        // masquée n'y figure pas.
        $map = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points")->assertOk();
        $this->assertNotContains($lessons[1]->code, collect($map->json('lessons'))->pluck('code')->all());
    }

    public function test_another_teacher_cannot_read_the_class(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $other = $this->teacher();

        $this->withToken($this->tokenOf($other))
            ->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points?lesson={$lessons[0]->code}")
            ->assertForbidden();
    }
}
