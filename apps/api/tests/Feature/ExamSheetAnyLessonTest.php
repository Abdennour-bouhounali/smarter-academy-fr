<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * La feuille d'examen BEM ne dépend d'AUCUNE leçon (déploiement à toutes les
 * leçons, 2026-10-06) : le serveur lit `metadata.exam` exercice par exercice.
 * On le prouve sur une leçon qui n'est PAS le prototype (`jidhr-tarbii`), avec
 * un dossier de contenu temporaire : une feuille copiée du prototype, ses
 * codes renommés. Verrouillage d'une étape répondue, « بيّن أن » en attente,
 * étape `counted: false` jamais preuve, médailles servies.
 */
class ExamSheetAnyLessonTest extends TestCase
{
    use RefreshDatabase;

    private const LESSON = 'jidhr-tarbii';

    private const EXERCISE = 'ex-4am-jidhr-tarbii-l2-002';

    private string $content;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2, 'mastery.server_evaluation' => true]);

        $this->content = sys_get_temp_dir().'/exam-any-lesson-'.Str::uuid();
        $source = base_path('../../content/practice/4am/bahth-pgcd/level-2/ex-4am-bahth-pgcd-l2-002.json');
        $exercise = str_replace('bahth-pgcd', self::LESSON, (string) file_get_contents($source));
        File::ensureDirectoryExists($this->content.'/4am/'.self::LESSON.'/level-2');
        File::put($this->content.'/4am/'.self::LESSON.'/level-2/'.self::EXERCISE.'.json', $exercise);
        File::put($this->content.'/index.generated.json', json_encode([self::LESSON => ['2' => [self::EXERCISE]]]));
        File::put($this->content.'/active.json', json_encode([self::LESSON]));
        config(['practice.content_path' => $this->content, 'practice.active_lessons_path' => $this->content.'/active.json']);
        Cache::flush();
        PracticeCapability::forget();

        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان أنساب الأعداد والحساب', 'order' => 0]);
        $lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => self::LESSON, 'title' => 'الجذر التربيعي', 'status' => 'available', 'order' => 0]);
        foreach ([1, 2] as $n) {
            LearningPoint::create(['lesson_id' => $lesson->id, 'code' => '4am_'.self::LESSON."_P{$n}", 'title' => "P{$n}", 'order' => $n]);
        }
        $this->student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->content);
        parent::tearDown();
    }

    private function postApi(string $uri, array $data = [])
    {
        return $this->actingAs($this->student)->postJson('/api/v1'.$uri, $data);
    }

    private function open(string $sessionId, string $questionId): string
    {
        $uuid = (string) Str::uuid();
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => self::EXERCISE, 'questionId' => $questionId, 'attemptUuid' => $uuid,
        ])->assertSuccessful();

        return $uuid;
    }

    public function test_an_exam_sheet_works_in_a_lesson_other_than_the_prototype(): void
    {
        $this->actingAs($this->student)->getJson('/api/v1/lessons/'.self::LESSON.'/practice/overview')
            ->assertOk()->assertJsonPath('lesson.code', self::LESSON);

        $sessionId = (string) Str::uuid();
        $this->postApi('/lessons/'.self::LESSON.'/practice/sessions', ['sessionId' => $sessionId, 'level' => 2])->assertSuccessful();

        // Une étape répondue est verrouillée : la rouvrir rend la même tentative.
        $first = $this->open($sessionId, 'q1');
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $first, 'answer' => ['value' => '25']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'incorrect');
        $this->postApi("/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => self::EXERCISE, 'questionId' => 'q1', 'attemptUuid' => (string) Str::uuid(),
        ])->assertSuccessful()->assertJsonPath('attempt.attemptUuid', $first);

        // « بيّن أن » : enregistrée, verrouillée, en attente de l'auto-évaluation.
        $self = $this->open($sessionId, 'q3');
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => 'لدينا 117 − 91 = 26 وبالتالي']])
            ->assertStatus(201)->assertJsonPath('evaluation.normalized', 'self:pending');
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $self, 'answer' => ['text' => 'نص آخر', 'selfMark' => 'correct']])
            ->assertStatus(422);

        // L'étape d'une autre leçon (`counted: false`) : jugée, jamais preuve.
        $uncounted = $this->open($sessionId, 'q4');
        $this->postApi("/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $uncounted, 'answer' => ['value' => '9/7']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct');
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $uncounted, 'outcome' => 'correct']);
        $this->assertSame(0, LearningEvidence::whereIn('attempt_id', [$self, $uncounted])->count());
        $this->assertSame(3, QuestionAttempt::count());

        $this->actingAs($this->student)->getJson('/api/v1/lessons/'.self::LESSON.'/practice/medals')
            ->assertOk()->assertJsonPath('success', true);
    }
}
