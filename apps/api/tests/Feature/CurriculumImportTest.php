<?php

namespace Tests\Feature;

use App\Domain\Curriculum\CurriculumImporter;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurriculumImportTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A minimal but structurally complete export — the same shape
     * exportCurriculum.mjs produces, so what the importer is tested against
     * is what it really receives.
     */
    private function sampleExport(): array
    {
        return [
            'grades' => [
                [
                    'code' => '6e',
                    'name' => '6ème',
                    'level' => 'college',
                    'order' => 0,
                    'chapters' => [
                        [
                            'code' => 'nombres_calculs',
                            'title' => 'Nombres et calculs',
                            'order' => 0,
                            'lessons' => [
                                [
                                    'code' => 'resolution-problemes',
                                    'officialObjectCode' => 'resolution_problemes',
                                    'title' => 'Résolution de problèmes',
                                    'description' => 'Démarche complète de résolution.',
                                    'status' => 'available',
                                    'durationMinutes' => 45,
                                    'tier' => 'free',
                                    'order' => 0,
                                    'learningPoints' => [
                                        ['code' => '6e_resolution-problemes_P1', 'title' => 'Comprendre une situation', 'order' => 1],
                                        ['code' => '6e_resolution-problemes_P2', 'title' => 'Extraire les informations', 'order' => 2],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public function test_import_creates_the_full_hierarchy_with_correct_relationships(): void
    {
        (new CurriculumImporter)->import($this->sampleExport());

        $grade = Grade::where('code', '6e')->firstOrFail();
        $chapter = Chapter::where('code', 'nombres_calculs')->firstOrFail();
        $lesson = Lesson::where('code', 'resolution-problemes')->firstOrFail();
        $point = LearningPoint::where('code', '6e_resolution-problemes_P1')->firstOrFail();

        $this->assertSame($grade->id, $chapter->grade_id);
        $this->assertSame($chapter->id, $lesson->chapter_id);
        $this->assertSame($lesson->id, $point->lesson_id);
        $this->assertNull($point->retired_at);
    }

    public function test_import_carries_catalogue_fields(): void
    {
        (new CurriculumImporter)->import($this->sampleExport());

        $this->assertDatabaseHas('grades', ['code' => '6e', 'order' => 0]);
        $this->assertDatabaseHas('lessons', [
            'code' => 'resolution-problemes',
            'duration_minutes' => 45,
            'tier' => 'free',
        ]);
    }

    public function test_missing_catalogue_fields_fall_back_to_null_duration_and_premium(): void
    {
        $export = $this->sampleExport();
        unset(
            $export['grades'][0]['chapters'][0]['lessons'][0]['durationMinutes'],
            $export['grades'][0]['chapters'][0]['lessons'][0]['tier']
        );
        (new CurriculumImporter)->import($export);

        $this->assertDatabaseHas('lessons', [
            'code' => 'resolution-problemes',
            'duration_minutes' => null,
            'tier' => 'premium',
        ]);
    }

    public function test_a_lesson_code_rename_creates_the_new_lesson_and_leaves_the_old_row_for_pruning(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->sampleExport());

        // Simulate the 45-min split: the lesson code and its learning point
        // codes change together.
        $export = $this->sampleExport();
        $lesson = &$export['grades'][0]['chapters'][0]['lessons'][0];
        $lesson['code'] = 'resolution-problemes-1';
        $lesson['learningPoints'] = [
            ['code' => '6e_resolution-problemes-1_P1', 'title' => 'Comprendre une situation', 'order' => 1],
            ['code' => '6e_resolution-problemes-1_P2', 'title' => 'Extraire les informations', 'order' => 2],
        ];
        $importer->import($export);

        $this->assertDatabaseHas('lessons', ['code' => 'resolution-problemes-1']);
        $this->assertDatabaseHas('learning_points', ['code' => '6e_resolution-problemes-1_P1', 'retired_at' => null]);
        // The importer only walks lessons present in the export, so the old
        // lesson row and its points linger untouched — cleaning them up is
        // smarter:prune-retired-learning-points' job.
        $this->assertDatabaseHas('lessons', ['code' => 'resolution-problemes']);
        $this->assertDatabaseHas('learning_points', ['code' => '6e_resolution-problemes_P1']);
    }

    public function test_import_is_idempotent(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->sampleExport());
        $summary = $importer->import($this->sampleExport());

        $this->assertDatabaseCount('grades', 1);
        $this->assertDatabaseCount('chapters', 1);
        $this->assertDatabaseCount('lessons', 1);
        $this->assertDatabaseCount('learning_points', 2);

        $this->assertSame([], $summary['learningPoints']['created']);
        $this->assertSame([], $summary['learningPoints']['updated']);
        $this->assertCount(2, $summary['learningPoints']['unchanged']);
    }

    public function test_a_changed_title_is_updated_in_place_not_duplicated(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->sampleExport());

        $export = $this->sampleExport();
        $export['grades'][0]['chapters'][0]['lessons'][0]['learningPoints'][0]['title'] = 'Titre révisé';
        $summary = $importer->import($export);

        $this->assertSame(['6e_resolution-problemes_P1'], $summary['learningPoints']['updated']);
        $this->assertDatabaseCount('learning_points', 2);
        $this->assertDatabaseHas('learning_points', ['code' => '6e_resolution-problemes_P1', 'title' => 'Titre révisé']);
    }

    public function test_a_learning_point_removed_from_source_is_retired_never_deleted(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->sampleExport());

        $export = $this->sampleExport();
        array_pop($export['grades'][0]['chapters'][0]['lessons'][0]['learningPoints']); // drop P2
        $summary = $importer->import($export);

        $this->assertSame(['6e_resolution-problemes_P2'], $summary['learningPoints']['retired']);
        // Still present in the table — retired, not deleted.
        $this->assertDatabaseHas('learning_points', ['code' => '6e_resolution-problemes_P2']);
        $this->assertNotNull(LearningPoint::where('code', '6e_resolution-problemes_P2')->first()->retired_at);
    }

    public function test_a_retired_learning_point_reappearing_in_source_is_unretired(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->sampleExport());

        $without = $this->sampleExport();
        array_pop($without['grades'][0]['chapters'][0]['lessons'][0]['learningPoints']);
        $importer->import($without);

        $importer->import($this->sampleExport()); // P2 comes back

        $this->assertNull(LearningPoint::where('code', '6e_resolution-problemes_P2')->first()->retired_at);
    }

    public function test_dry_run_computes_the_diff_but_writes_nothing(): void
    {
        $summary = (new CurriculumImporter)->import($this->sampleExport(), dryRun: true);

        $this->assertSame(['6e'], $summary['grades']['created']);
        $this->assertCount(2, $summary['learningPoints']['created']);

        $this->assertDatabaseCount('grades', 0);
        $this->assertDatabaseCount('chapters', 0);
        $this->assertDatabaseCount('lessons', 0);
        $this->assertDatabaseCount('learning_points', 0);
    }
}
