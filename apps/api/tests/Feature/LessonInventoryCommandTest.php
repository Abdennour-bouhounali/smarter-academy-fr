<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `smarter:lesson-inventory` — ce que le déploiement lit de la base de
 * production : la liste des leçons, et le format « classe/code palier »
 * qu'il compare avant et après la synchronisation du curriculum.
 */
class LessonInventoryCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_tiers_only_prints_one_comparable_line_per_lesson(): void
    {
        $grade = Grade::create(['code' => '4am', 'name' => '4am', 'level' => 'moyen', 'order' => 0, 'is_active' => true]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'midan', 'title' => 'ميدان', 'order' => 0]);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'lecon-a', 'title' => 'أ', 'status' => 'available', 'order' => 0, 'tier' => 'free']);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'lecon-b', 'title' => 'ب', 'status' => 'available', 'order' => 1, 'tier' => 'premium']);

        $this->artisan('smarter:lesson-inventory', ['--tiers-only' => true])
            ->expectsOutput('4am/lecon-a free')
            ->expectsOutput('4am/lecon-b premium')
            ->assertSuccessful();

        $this->artisan('smarter:lesson-inventory')
            ->expectsOutputToContain('2 leçon(s) en base')
            ->assertSuccessful();
    }
}
