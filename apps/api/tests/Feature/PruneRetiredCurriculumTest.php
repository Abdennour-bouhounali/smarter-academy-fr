<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\PracticeSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PruneRetiredCurriculumTest extends TestCase
{
    use RefreshDatabase;

    private string $exportPath;

    protected function setUp(): void
    {
        parent::setUp();

        // A post-split export knowing only the new lesson code.
        $this->exportPath = tempnam(sys_get_temp_dir(), 'curriculum-export');
        file_put_contents($this->exportPath, json_encode([
            'grades' => [[
                'code' => '6e', 'name' => '6ème', 'level' => 'college', 'order' => 0,
                'chapters' => [[
                    'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0,
                    'lessons' => [[
                        'code' => 'fractions-1', 'officialObjectCode' => 'fractions',
                        'title' => 'Fractions — Partie 1', 'description' => null,
                        'status' => 'coming_soon', 'durationMinutes' => 45, 'order' => 0,
                        'learningPoints' => [
                            ['code' => '6e_fractions-1_P1', 'title' => 'Construire', 'order' => 1],
                        ],
                    ]],
                ]],
            ]],
        ]));
    }

    protected function tearDown(): void
    {
        @unlink($this->exportPath);
        parent::tearDown();
    }

    private function makeLesson(string $code, array $pointCodes = []): Lesson
    {
        $grade = Grade::firstOrCreate(['code' => '6e'], ['name' => '6ème', 'level' => 'college', 'order' => 0]);
        $chapter = Chapter::firstOrCreate(
            ['grade_id' => $grade->id, 'code' => 'nombres_calculs'],
            ['title' => 'Nombres et calculs', 'order' => 0]
        );
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => $code, 'title' => $code, 'status' => 'coming_soon', 'order' => 0,
        ]);
        foreach ($pointCodes as $i => $pointCode) {
            LearningPoint::create(['lesson_id' => $lesson->id, 'code' => $pointCode, 'title' => $pointCode, 'order' => $i + 1]);
        }

        return $lesson;
    }

    public function test_prunes_orphan_lessons_and_evidence_free_retired_points(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        // Pre-split leftover: gone from the export, no evidence anywhere.
        $this->makeLesson('fractions', ['6e_fractions_P1']);
        // Retired point on a surviving lesson, no evidence.
        LearningPoint::create([
            'lesson_id' => Lesson::where('code', 'fractions-1')->first()->id,
            'code' => '6e_fractions-1_P9', 'title' => 'Ancien point', 'order' => 9, 'retired_at' => now(),
        ]);

        $this->artisan('smarter:prune-retired-learning-points', ['--from-json' => $this->exportPath])
            ->assertSuccessful();

        $this->assertDatabaseMissing('lessons', ['code' => 'fractions']);
        $this->assertDatabaseMissing('learning_points', ['code' => '6e_fractions_P1']);
        $this->assertDatabaseMissing('learning_points', ['code' => '6e_fractions-1_P9']);
        $this->assertDatabaseHas('lessons', ['code' => 'fractions-1']);
        $this->assertDatabaseHas('learning_points', ['code' => '6e_fractions-1_P1']);
    }

    public function test_anything_carrying_evidence_is_kept(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        $old = $this->makeLesson('fractions', ['6e_fractions_P1']);

        $user = User::factory()->create(['role' => 'student', 'grade' => '6e']);
        $evidence = LearningEvidence::create([
            'user_id' => $user->id, 'lesson_id' => $old->id,
            'question_code' => 'fr-q1', 'attempt_id' => 'attempt-1',
            'is_correct' => true, 'assessment_type' => 'assessment', 'submitted_at' => now(),
        ]);
        $evidence->learningPoints()->attach(LearningPoint::where('code', '6e_fractions_P1')->first()->id);

        $this->artisan('smarter:prune-retired-learning-points', ['--from-json' => $this->exportPath])
            ->assertSuccessful();

        $this->assertDatabaseHas('lessons', ['code' => 'fractions']);
        $this->assertDatabaseHas('learning_points', ['code' => '6e_fractions_P1']);
        // Kept for its history — but no longer served: archived, never deleted.
        $this->assertSame(Lesson::PUB_ARCHIVED, Lesson::where('code', 'fractions')->value('publication_status'));
        // The lesson the catalogue still declares is untouched.
        $this->assertSame(Lesson::PUB_PUBLISHED, Lesson::where('code', 'fractions-1')->value('publication_status'));
    }

    /**
     * Cette commande tourne à CHAQUE déploiement de production (deploy.yml),
     * donc « aucun historique » couvre toute trace d'élève — ici une séance de
     * pratique, sans preuve ni progression : la leçon est gardée.
     */
    public function test_a_lesson_a_student_practised_is_kept(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        $lesson = $this->makeLesson('fractions', ['6e_fractions_P1']);
        PracticeSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => User::factory()->create()->id,
            'lesson_id' => $lesson->id,
            'level' => 1,
            'started_at' => now(),
        ]);

        $this->artisan('smarter:prune-retired-learning-points', ['--from-json' => $this->exportPath])
            ->assertSuccessful();

        $this->assertDatabaseHas('lessons', ['code' => 'fractions']);
        $this->assertSame(Lesson::PUB_ARCHIVED, Lesson::where('code', 'fractions')->value('publication_status'));
    }

    /** L'owner supprime une leçon retirée, historique compris — en production aussi. */
    public function test_delete_lesson_removes_a_named_retired_lesson_with_its_history(): void
    {
        $this->app['env'] = 'production';
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        $old = $this->makeLesson('fractions', ['6e_fractions_P1']);
        $other = $this->makeLesson('decimaux');
        PracticeSession::create([
            'session_id' => (string) Str::uuid(), 'user_id' => User::factory()->create()->id,
            'lesson_id' => $old->id, 'level' => 1, 'started_at' => now(),
        ]);

        $args = ['--from-json' => $this->exportPath, '--delete-lesson' => ['fractions']];

        // Sans --force : rien ne bouge.
        $this->artisan('smarter:prune-retired-learning-points', $args)->assertFailed();
        $this->assertDatabaseHas('lessons', ['code' => 'fractions']);

        $this->artisan('smarter:prune-retired-learning-points', $args + ['--force' => true])->assertSuccessful();

        $this->assertDatabaseMissing('lessons', ['code' => 'fractions']);
        $this->assertDatabaseMissing('learning_points', ['code' => '6e_fractions_P1']);
        $this->assertDatabaseMissing('practice_sessions', ['lesson_id' => $old->id]);
        // Only the named lesson: another retired lesson is left to the normal prune.
        $this->assertDatabaseHas('lessons', ['id' => $other->id]);
        $this->assertDatabaseHas('lessons', ['code' => 'fractions-1']);
    }

    public function test_delete_lesson_refuses_a_lesson_the_catalogue_still_declares(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);

        $this->artisan('smarter:prune-retired-learning-points', [
            '--from-json' => $this->exportPath, '--delete-lesson' => ['fractions-1'], '--force' => true,
        ])->assertFailed();

        $this->assertDatabaseHas('lessons', ['code' => 'fractions-1']);
    }

    public function test_dry_run_deletes_nothing(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        $this->makeLesson('fractions', ['6e_fractions_P1']);

        $this->artisan('smarter:prune-retired-learning-points', [
            '--from-json' => $this->exportPath, '--dry-run' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('lessons', ['code' => 'fractions']);
        $this->assertSame(Lesson::PUB_PUBLISHED, Lesson::where('code', 'fractions')->value('publication_status'));
    }
}
