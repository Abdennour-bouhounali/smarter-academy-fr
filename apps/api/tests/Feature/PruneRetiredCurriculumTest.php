<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                        'status' => 'coming_soon', 'durationMinutes' => 45, 'tier' => 'premium', 'order' => 0,
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
    }

    public function test_dry_run_deletes_nothing(): void
    {
        $this->makeLesson('fractions-1', ['6e_fractions-1_P1']);
        $this->makeLesson('fractions', ['6e_fractions_P1']);

        $this->artisan('smarter:prune-retired-learning-points', [
            '--from-json' => $this->exportPath, '--dry-run' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('lessons', ['code' => 'fractions']);
    }
}
