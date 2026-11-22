<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * `smarter:publish-available-content` — publie ce que le catalogue déclare
 * prêt, sans jamais toucher une leçon archivée, une leçon coming_soon, une
 * ligne retirée ni le palier.
 */
class PublishAvailableContentTest extends TestCase
{
    use RefreshDatabase;

    private function lesson(string $code, string $status, string $pub, string $tier = 'free'): Lesson
    {
        $grade = Grade::firstOrCreate(['code' => '4am'], ['name' => '4am', 'level' => 'moyen', 'order' => 0, 'is_active' => true]);
        $chapter = Chapter::firstOrCreate(['grade_id' => $grade->id, 'code' => 'midan'], ['title' => 'ميدان', 'order' => 0]);
        $lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => $code, 'title' => $code, 'status' => $status, 'order' => 0, 'tier' => $tier]);
        $lesson->forceFill(['publication_status' => $pub])->save();

        LessonModule::create(['lesson_id' => $lesson->id, 'code' => 'm1', 'number' => 1, 'title' => 'م', 'publication_status' => 'draft']);
        LessonModule::create(['lesson_id' => $lesson->id, 'code' => 'old', 'number' => 2, 'title' => 'ق', 'publication_status' => 'draft', 'retired_at' => now()]);
        PracticeExercise::create(['lesson_id' => $lesson->id, 'exercise_code' => $code.'-e1', 'level' => 1, 'publication_status' => 'draft']);

        return $lesson;
    }

    public function test_publishes_available_lessons_and_their_draft_content_only(): void
    {
        $ready = $this->lesson('ready', 'available', 'draft', 'premium');
        $already = $this->lesson('already', 'available', 'published');
        $soon = $this->lesson('soon', 'coming_soon', 'draft');
        $archived = $this->lesson('archived', 'available', 'archived');

        $this->artisan('smarter:publish-available-content', ['--dry-run' => true])
            ->expectsOutputToContain('Leçons à publier : 1')
            ->expectsOutputToContain('Modules à publier : 2')
            ->assertSuccessful();
        $this->assertSame('draft', $ready->fresh()->publication_status);

        $this->artisan('smarter:publish-available-content')
            ->expectsOutputToContain('Leçons publié(e)s : 1')
            ->expectsOutputToContain('Modules publié(e)s : 2')
            ->expectsOutputToContain('Exercices publié(e)s : 2')
            ->assertSuccessful();

        $this->assertSame('published', $ready->fresh()->publication_status);
        $this->assertSame('premium', $ready->fresh()->tier);
        foreach ([$ready, $already] as $l) {
            $this->assertSame('published', LessonModule::where('lesson_id', $l->id)->where('code', 'm1')->value('publication_status'));
            $this->assertSame('draft', LessonModule::where('lesson_id', $l->id)->where('code', 'old')->value('publication_status'));
            $this->assertSame('published', PracticeExercise::where('lesson_id', $l->id)->value('publication_status'));
        }
        foreach ([$soon, $archived] as $l) {
            $this->assertNotSame('published', $l->fresh()->publication_status);
            $this->assertSame('draft', LessonModule::where('lesson_id', $l->id)->where('code', 'm1')->value('publication_status'));
            $this->assertSame('draft', PracticeExercise::where('lesson_id', $l->id)->value('publication_status'));
        }

        // Idempotent.
        $this->artisan('smarter:publish-available-content')
            ->expectsOutputToContain('Leçons publié(e)s : 0')
            ->assertSuccessful();
    }
}
