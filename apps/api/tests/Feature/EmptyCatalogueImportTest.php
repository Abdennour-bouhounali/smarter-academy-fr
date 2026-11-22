<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Le catalogue français VIDE (reconstruction, étape 1B) : quatre classes du
 * collège, aucun chapitre, aucune leçon. Les fixtures sont une copie de ce
 * qu'écrit packages/core/curriculum/exportCurriculum.mjs et d'un registre de
 * contenu vide — les commandes doivent les accepter sans échouer.
 */
class EmptyCatalogueImportTest extends TestCase
{
    use RefreshDatabase;

    private function catalogue(): string
    {
        return base_path('tests/Fixtures/curriculum-export-empty.json');
    }

    public function test_the_empty_catalogue_imports_four_active_grades_and_nothing_else(): void
    {
        $this->artisan('smarter:import-curriculum', ['--from-json' => $this->catalogue()])->assertSuccessful();

        $grades = Grade::orderBy('order')->get();
        $this->assertSame(['6e', '5e', '4e', '3e'], $grades->pluck('code')->all());
        $this->assertSame(['college'], $grades->pluck('level')->unique()->values()->all());
        $this->assertTrue($grades->every(fn (Grade $g) => (bool) $g->is_active), 'les quatre classes sont ouvertes');
        $this->assertSame(0, Chapter::count());
        $this->assertSame(0, Unit::count());
        $this->assertSame(0, Lesson::count());
        $this->assertSame(0, LearningPoint::count());

        // Rejouer ne change rien.
        $this->artisan('smarter:import-curriculum', ['--from-json' => $this->catalogue()])->assertSuccessful();
        $this->assertSame(4, Grade::count());
    }

    public function test_validate_reports_no_drift_on_the_imported_empty_catalogue(): void
    {
        $this->artisan('smarter:import-curriculum', ['--from-json' => $this->catalogue()])->assertSuccessful();
        $report = sys_get_temp_dir().'/curriculum-sync-'.Str::random(8).'.md';

        try {
            $this->artisan('smarter:validate-curriculum', ['--from-json' => $this->catalogue(), '--output' => $report, '--strict' => true])
                ->expectsOutputToContain('No drift')
                ->assertSuccessful();
            $this->assertStringContainsString('in sync — no drift', (string) file_get_contents($report));
        } finally {
            @unlink($report);
        }
    }

    public function test_an_empty_content_registry_is_accepted(): void
    {
        $this->artisan('smarter:import-curriculum', ['--from-json' => $this->catalogue()])->assertSuccessful();

        $this->artisan('smarter:import-content-registry', ['--from-json' => base_path('tests/Fixtures/content-registry-export-empty.json')])
            ->expectsOutputToContain('Content registry imported.')
            ->assertSuccessful();

        $this->assertDatabaseCount('lesson_modules', 0);
        $this->assertDatabaseCount('practice_exercises', 0);
        $this->assertDatabaseCount('assessment_items', 0);
    }
}
