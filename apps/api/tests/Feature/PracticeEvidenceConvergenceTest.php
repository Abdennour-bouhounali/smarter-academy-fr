<?php

namespace Tests\Feature;

use App\Domain\Progress\MasteryRecalculator;
use App\Domain\Progress\ProgressEngine;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * L'invariant central du moteur d'exercices : le test final et la pratique
 * nourrissent UNE SEULE évaluation par (élève, learning point).
 *
 * S'il n'y avait qu'un test à garder dans tout ce chantier, ce serait
 * testFinalTestAndPracticeConvergeOnOneRow. Deux systèmes de maîtrise
 * parallèles seraient le défaut le plus coûteux possible — invisible à
 * l'usage, et corrupteur du profil de l'élève.
 */
class PracticeEvidenceConvergenceTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LearningPoint $p9;

    private LearningPoint $p5;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Fonction affine', 'status' => 'available', 'order' => 0,
        ]);
        $this->p9 = LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => 'seconde_fonction-affine-2nde_P9',
            'title' => "Étudier le signe d'une fonction affine", 'order' => 9,
        ]);
        $this->p5 = LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => 'seconde_fonction-affine-2nde_P5',
            'title' => 'Relier le signe du coefficient directeur aux variations', 'order' => 5,
        ]);
    }

    private function engine(): ProgressEngine
    {
        return app(ProgressEngine::class);
    }

    public function test_final_test_and_practice_converge_on_one_learning_point_row(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);

        // 1. Le test final : une réponse fausse sur P9.
        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'fa-e8',
            'attemptId' => 'final-0001',
            'isCorrect' => false,
            'learningPointCodes' => ['seconde_fonction-affine-2nde_P9'],
        ]);

        $afterFinalTest = (float) StudentLearningPointProgress::where('user_id', $user->id)
            ->where('learning_point_id', $this->p9->id)->value('confidence');
        $this->assertLessThan(0.5, $afterFinalTest, 'une erreur au test final doit faire baisser la confiance');

        // 2. La pratique : une réponse juste sur LE MÊME point.
        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'ex-2de-fonction-affine-l3-002:q1',
            'attemptId' => 'practice-0001',
            'isCorrect' => true,
            'outcome' => 'correct',
            'learningPointRefs' => [['code' => 'seconde_fonction-affine-2nde_P9', 'role' => 'primary']],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'level' => 3,
            'hintsUsed' => 0,
            'sourceId' => 'session-abc',
        ]);

        // ── L'assertion qui compte plus que toutes les autres ──────────
        $this->assertSame(1, StudentLearningPointProgress::where('user_id', $user->id)
            ->where('learning_point_id', $this->p9->id)->count(),
            'il ne doit exister QU’UNE ligne de maîtrise, quelles que soient les sources');

        $rollup = StudentLearningPointProgress::where('user_id', $user->id)
            ->where('learning_point_id', $this->p9->id)->first();

        $this->assertSame(2, (int) $rollup->attempts, 'les deux sources comptent dans le même total');
        $this->assertSame(1, (int) $rollup->correct_count);
        $this->assertGreaterThan($afterFinalTest, (float) $rollup->confidence,
            'la pratique doit faire remonter la MÊME confiance');

        // L'historique est intact : deux preuves, deux sources distinctes.
        $evidence = LearningEvidence::where('user_id', $user->id)->orderBy('id')->get();
        $this->assertCount(2, $evidence);
        $this->assertEqualsCanonicalizing(
            [ProgressEngine::SOURCE_ASSESSMENT, ProgressEngine::SOURCE_PRACTICE],
            $evidence->pluck('assessment_type')->all()
        );
        // …et les deux pointent bien sur le même learning point.
        foreach ($evidence as $row) {
            $this->assertSame([$this->p9->id], $row->learningPoints->pluck('id')->all());
        }

        // L'état est explicable depuis l'historique (invariant 15).
        $this->assertTrue(app(MasteryRecalculator::class)->matchesStored($user, $this->p9->id),
            'le rejeu des preuves doit reproduire exactement l’agrégat enregistré');
    }

    public function test_there_is_no_second_mastery_table(): void
    {
        // Une garde bon marché contre l'ajout futur d'un `practice_mastery`.
        $tables = collect(\DB::select('SHOW TABLES'))
            ->map(fn ($r) => array_values((array) $r)[0])
            ->filter(fn ($t) => str_contains($t, 'mastery') || str_contains($t, 'maitrise'))
            ->values()->all();

        $this->assertSame([], $tables, 'la maîtrise vit dans student_learning_point_progress, et nulle part ailleurs');
    }

    public function test_practice_exercise_is_accepted_but_module_question_types_are_not(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);

        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'ex:q1', 'attemptId' => 'ok-1', 'isCorrect' => true,
            'learningPointCodes' => ['seconde_fonction-affine-2nde_P9'],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
        ]);
        $this->assertDatabaseCount('learning_evidence', 1);

        // 'practice' est le type des questions d'ENTRAÎNEMENT d'une leçon :
        // il ne doit jamais produire de preuve. C'est pourquoi la source du
        // moteur d'exercices s'appelle 'practice_exercise'.
        foreach (['practice', 'discovery', 'practice_lab', 'teacher'] as $forbidden) {
            try {
                $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
                    'questionCode' => 'ex:q1', 'attemptId' => "nope-{$forbidden}", 'isCorrect' => true,
                    'learningPointCodes' => ['seconde_fonction-affine-2nde_P9'],
                    'assessmentType' => $forbidden,
                ]);
                $this->fail("le type « {$forbidden} » aurait dû être refusé");
            } catch (DomainException) {
                // attendu
            }
        }

        // Toujours une seule preuve : aucune question de module n'en a écrit.
        $this->assertDatabaseCount('learning_evidence', 1);
    }

    public function test_a_secondary_learning_point_moves_less_than_a_primary_one(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);

        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'ex:q1', 'attemptId' => 'roles-1', 'isCorrect' => true,
            'outcome' => 'correct',
            'learningPointRefs' => [
                ['code' => 'seconde_fonction-affine-2nde_P9', 'role' => 'primary'],
                ['code' => 'seconde_fonction-affine-2nde_P5', 'role' => 'secondary'],
            ],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'level' => 4,
        ]);

        $primary = (float) StudentLearningPointProgress::where('learning_point_id', $this->p9->id)->value('confidence');
        $secondary = (float) StudentLearningPointProgress::where('learning_point_id', $this->p5->id)->value('confidence');

        $this->assertGreaterThan($secondary, $primary,
            'une question qui ne fait qu’effleurer un point ne doit pas le créditer autant');

        // Le rôle est écrit dans le pivot, pas déduit.
        $this->assertDatabaseHas('learning_evidence_learning_point', [
            'learning_point_id' => $this->p9->id, 'role' => 'primary',
        ]);
        $this->assertDatabaseHas('learning_evidence_learning_point', [
            'learning_point_id' => $this->p5->id, 'role' => 'secondary',
        ]);
    }

    public function test_a_syntax_error_records_evidence_but_does_not_move_mastery(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);

        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'ex:q1', 'attemptId' => 'syntax-1', 'isCorrect' => false,
            'outcome' => 'syntax_error',
            'learningPointRefs' => [['code' => 'seconde_fonction-affine-2nde_P9', 'role' => 'primary']],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'level' => 2,
        ]);

        // La trace existe — on saura que l'élève a buté sur la saisie…
        $this->assertDatabaseCount('learning_evidence', 1);
        // …mais ne pas savoir écrire un nombre n'est pas se tromper de nombre.
        $this->assertDatabaseCount('student_learning_point_progress', 0);
    }

    public function test_a_hint_assisted_success_still_progresses(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);

        $this->engine()->recordEvidence($user, 'fonction-affine-2nde', [
            'questionCode' => 'ex:q1', 'attemptId' => 'hint-1', 'isCorrect' => true,
            'outcome' => 'correct',
            'learningPointRefs' => [['code' => 'seconde_fonction-affine-2nde_P9', 'role' => 'primary']],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'level' => 3, 'hintsUsed' => 3,
        ]);

        $confidence = (float) StudentLearningPointProgress::where('learning_point_id', $this->p9->id)->value('confidence');

        // « Using a hint is not itself a failure » — la progression est petite,
        // mais elle est positive.
        $this->assertGreaterThan(0.5, $confidence);
    }

    public function test_practice_evidence_is_idempotent_by_attempt_id(): void
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => 'seconde']);
        $payload = [
            'questionCode' => 'ex:q1', 'attemptId' => 'replay-1', 'isCorrect' => true,
            'outcome' => 'correct',
            'learningPointRefs' => [['code' => 'seconde_fonction-affine-2nde_P9', 'role' => 'primary']],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'level' => 3,
        ];

        $first = $this->engine()->recordEvidence($user, 'fonction-affine-2nde', $payload);
        $second = $this->engine()->recordEvidence($user, 'fonction-affine-2nde', $payload);

        $this->assertFalse($first['duplicate']);
        $this->assertTrue($second['duplicate']);
        $this->assertDatabaseCount('learning_evidence', 1);
        $this->assertSame(1, (int) StudentLearningPointProgress::where('learning_point_id', $this->p9->id)->value('attempts'));
    }
}
