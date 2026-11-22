<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomIntervention;
use App\Models\NotebookNote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * DÉTECTER → COMPRENDRE → INTERVENIR → MESURER, de bout en bout, sur de la
 * preuve réelle (ProgressEngine) et par les routes de l'enseignant.
 */
class ClassroomLearningLoopTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    public function test_the_whole_loop(): void
    {
        config(['mastery.engine_version' => 2]);
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $p1 = $this->point($lesson, 1);
        $p2 = $this->point($lesson, 2);
        $classroom = Classroom::factory()->create();
        $token = $this->tokenOf($classroom->teacher);

        $a = $this->student(['first_name' => 'Amine']);
        $b = $this->student(['first_name' => 'Badr']);
        $strong = $this->student(['first_name' => 'Chahd']);
        $silent = $this->student(['first_name' => 'Dounia']);
        $this->enrol($classroom, [$a, $b, $strong, $silent]);

        // Deux élèves butent sur P1 (items faciles ratés) — A depuis trois
        // semaines (avant la fenêtre « récemment »), B cette semaine ; une
        // élève maîtrise.
        $this->answers($a, $lesson, $p1, 'incorrect', 3, 1, now()->subDays(20));
        $this->answers($b, $lesson, $p1, 'incorrect', 3, 1);
        $this->answers($strong, $lesson, $p1, 'correct', 3, 5);
        $this->answers($strong, $lesson, $p2, 'correct', 3, 5);
        NotebookNote::create(['user_id' => $a->id, 'lesson_id' => $lesson->id, 'learning_point_id' => $p1->id, 'content' => 'je confonds', 'note_type' => 'erreur']);

        // ── DÉTECTER ────────────────────────────────────────────────────
        $attention = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/attention")->assertOk();
        $signals = collect($attention->json('signals'))->keyBy('key');
        $shared = $signals["class_difficulty:{$p1->code}"];
        $this->assertSame([$a->id, $b->id], collect($shared['students'])->pluck('id')->sort()->values()->all());
        $this->assertSame(2, $shared['indicator']['gap']);
        $byId = collect($shared['students'])->keyBy('id');
        $this->assertSame(3, $byId[$b->id]['recent']['failures']);
        $this->assertSame(0, $byId[$a->id]['recent']['failures']);
        $this->assertNotNull($shared['lastEvidenceAt']);
        // La silencieuse n'est PAS une difficulté : elle est un fait d'engagement.
        // A, sans activité depuis 20 jours, y figure aussi : un fait daté.
        $inactive = array_column($signals['no_recent_activity']['students'], 'id');
        sort($inactive);
        $this->assertSame([$a->id, $silent->id], $inactive);
        $this->assertFalse($signals->has("repeated_difficulty:{$p1->code}"), 'pas de doublon élève pour un point déjà signalé à la classe');

        // La carte : la distribution, pas une moyenne.
        $map = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points")->assertOk();
        $row = collect($map->json('lessons.0.learningPoints'))->firstWhere('code', $p1->code);
        $this->assertSame(['mastered' => 1, 'reinforce' => 0, 'gap' => 2, 'unassessed' => 1], $row['counts']);
        // 2 élèves en ثغرة sur 3 évalués : toute la classe (≥ 50 % des évalués).
        $this->assertSame('class_wide', $row['difficultyScope']);

        // ── COMPRENDRE ──────────────────────────────────────────────────
        $detail = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/learning-points/{$p1->code}")->assertOk();
        $this->assertNotEmpty($detail->json('trajectory'));
        $this->assertSame(2, collect($detail->json('trajectory'))->last()['counts']['gap']);

        $evidence = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$a->id}/learning-points/{$p1->code}/explanation")->assertOk();
        $this->assertSame('gap', $evidence->json('explanation.status'));
        $this->assertCount(3, $evidence->json('history'));
        $this->assertSame(1, $evidence->json('notebook.total'));

        $dossier = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$a->id}/progress")->assertOk();
        $this->assertSame(1, $dossier->json('snapshot.learning.counts.gap'));
        $this->assertSame('class_difficulty', $dossier->json('signals.0.type'));

        // ── INTERVENIR ──────────────────────────────────────────────────
        // (plus tard que la preuve de départ : elle ne compte pas « depuis »)
        Carbon::setTestNow(now()->addMinute());
        $created = $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'recommend_practice',
            'studentIds' => [$a->id, $b->id],
            'learningPointCode' => $p1->code,
            'note' => 'note privée de l\'enseignant',
            'studentMessage' => 'راجع هذه النقطة',
            'sourceSignal' => 'class_difficulty',
        ])->assertCreated();
        $id = $created->json('intervention.id');
        $this->assertSame('gap', $created->json('intervention.outcome.students.0.before.status'));
        $this->assertSame(2, $created->json('intervention.outcome.summary.noNewEvidence'));

        // L'élève voit la suggestion — jamais la note privée.
        $reco = $this->withToken($this->tokenOf($a))->getJson('/api/v1/student/teacher-recommendations')->assertOk();
        $this->assertSame('راجع هذه النقطة', $reco->json('recommendations.0.message'));
        $this->assertStringNotContainsString('note privée', $reco->getContent());
        $this->assertSame([], $this->withToken($this->tokenOf($strong))->getJson('/api/v1/student/teacher-recommendations')->json('recommendations'));

        // Un élève hors de la classe ne peut pas être visé.
        $outsider = $this->student();
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'observation', 'studentIds' => [$outsider->id],
        ])->assertStatus(422)->assertJsonPath('reason', 'not_member');

        // ── L'élève continue d'apprendre ────────────────────────────────
        Carbon::setTestNow(now()->addMinutes(2));
        $this->answers($a, $lesson, $p1, 'correct', 4, 4);

        // ── MESURER ─────────────────────────────────────────────────────
        $measured = $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions/{$id}")->assertOk();
        $rows = collect($measured->json('intervention.outcome.students'))->keyBy('id');
        $this->assertSame('gap', $rows[$a->id]['before']['status']);
        $this->assertNotSame('gap', $rows[$a->id]['now']['status']);
        $this->assertSame('improved', $rows[$a->id]['direction']);
        $this->assertSame(4, $rows[$a->id]['since']['answered']);
        $this->assertNotEmpty($rows[$a->id]['trail']);
        $this->assertFalse($rows[$b->id]['observed']);
        $this->assertSame(1, $measured->json('intervention.outcome.summary.improved'));
        $this->assertSame(1, $measured->json('intervention.outcome.summary.noNewEvidence'));

        // Le signal suit les faits : A n'est plus en ثغرة, B seul ne fait plus
        // une difficulté de classe — il redevient un cas individuel.
        $after = collect($this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/attention")->json('signals'))->keyBy('key');
        $this->assertFalse($after->has("class_difficulty:{$p1->code}"));
        $this->assertSame([$b->id], array_column($after["repeated_difficulty:{$p1->code}"]['students'], 'id'));
        $this->assertGreaterThanOrEqual(1, $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/attention")->json('recentChanges.improved'));

        // Clore : la suggestion disparaît côté élève.
        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions/{$id}", ['status' => 'closed'])
            ->assertOk()->assertJsonPath('intervention.status', 'closed');
        $this->assertSame([], $this->withToken($this->tokenOf($a))->getJson('/api/v1/student/teacher-recommendations')->json('recommendations'));
        $this->assertSame(ClassroomIntervention::STATUS_CLOSED, ClassroomIntervention::find($id)->status);
        Carbon::setTestNow();
    }

    public function test_a_learning_point_gesture_needs_a_point_in_scope(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $classroom = Classroom::factory()->create();
        $student = $this->student();
        $this->enrol($classroom, [$student]);
        $token = $this->tokenOf($classroom->teacher);

        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'class_reinforcement', 'studentIds' => [$student->id],
        ])->assertStatus(422);
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'recommend_practice', 'studentIds' => [$student->id], 'learningPointCode' => 'nope_P1',
        ])->assertStatus(422);

        // Une observation, elle, peut ne viser aucun point.
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/interventions", [
            'kind' => 'observation', 'studentIds' => [$student->id], 'note' => 'travaille bien en classe',
        ])->assertCreated()->assertJsonPath('intervention.outcome', null);
    }
}
