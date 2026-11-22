<?php

namespace Tests\Support;

use App\Domain\Practice\ExerciseRepository;
use App\Models\AssessmentItem;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use Illuminate\Support\Carbon;

/**
 * Le défi quotidien sur le VRAI contenu : les leçons de l'unité 4AM, leurs
 * points d'apprentissage et un registre d'items construit depuis les
 * fichiers content/practice — exactement ce que l'import produirait. Les
 * réponses justes sont LUES dans le contenu, jamais écrites à la main.
 */
trait DailyChallengeFixtures
{
    /** @var array<string, Lesson> */
    protected array $dcLessons = [];

    /** @var array<string, LearningPoint> */
    protected array $dcPoints = [];

    /** Mardi 22 septembre 2026, 10 h à Alger : un jour de défi, fenêtre ouverte. */
    protected function onChallengeDay(string $date = '2026-09-22', string $time = '10:00:00'): void
    {
        Carbon::setTestNow(Carbon::parse("{$date} {$time}", 'Africa/Algiers'));
    }

    /** @param  string[]  $lessonCodes */
    protected function challengeCurriculum(array $lessonCodes = ['qasim-adad-tabii', 'bahth-pgcd']): void
    {
        config(['mastery.engine_version' => 2, 'mastery.server_evaluation' => true]);
        $grade = Grade::firstOrCreate(['code' => '4am'], ['name' => 'السنة الرابعة متوسط', 'level' => 'moyen', 'order' => 1, 'is_active' => true]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        $repo = app(ExerciseRepository::class);

        foreach ($lessonCodes as $i => $code) {
            $lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => $code, 'title' => "درس {$code}", 'status' => 'available', 'order' => $i]);
            $this->dcLessons[$code] = $lesson;

            foreach ($repo->indexFor($code) as $level => $ids) {
                foreach ($ids as $exerciseId) {
                    $exercise = $repo->find($code, $exerciseId);
                    foreach ($exercise['questions'] ?? [] as $q) {
                        $refs = [];
                        foreach ($q['learningPoints'] as $lp) {
                            $point = $this->dcPoints[$lp['code']] ??= LearningPoint::create([
                                'lesson_id' => $lesson->id, 'code' => $lp['code'], 'title' => 'نقطة '.$lp['code'],
                                'order' => (int) preg_replace('/\D/', '', substr($lp['code'], -2)),
                            ]);
                            $refs[$point->id] = ['role' => $lp['role']];
                        }
                        $item = AssessmentItem::create([
                            'lesson_id' => $lesson->id,
                            'item_key' => "practice:{$code}:{$exerciseId}:{$q['id']}",
                            'source_kind' => 'practice', 'exercise_code' => $exerciseId, 'question_id' => $q['id'],
                            'template_key' => $q['templateId'] ?? null,
                            'difficulty' => $q['difficulty'] ?? $level,
                            'answer_type' => $q['answerType'],
                            'learning_points' => array_map(fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role']], $q['learningPoints']),
                            'answer_key' => [], 'evaluation' => 'server', 'content_version' => 'v1',
                            'publication_status' => 'published',
                        ]);
                        $item->learningPointRows()->sync($refs);
                    }
                }
            }
        }
    }

    /** La bonne réponse d'une question servie, lue dans le contenu. */
    protected function rightAnswer(string $lessonCode, string $exerciseCode, string $questionId): array
    {
        $q = app(ExerciseRepository::class)->findQuestion($lessonCode, $exerciseCode, $questionId);

        return match ($q['answerType']) {
            'choice' => ['choiceId' => collect($q['choices'])->firstWhere('isCorrect', true)['id']],
            'rational' => ['value' => (string) $q['expectedAnswer']],
            'integerSet' => ['value' => implode(', ', $q['expectedAnswer'])],
        };
    }

    protected function wrongAnswer(string $lessonCode, string $exerciseCode, string $questionId): array
    {
        $q = app(ExerciseRepository::class)->findQuestion($lessonCode, $exerciseCode, $questionId);

        return match ($q['answerType']) {
            'choice' => ['choiceId' => collect($q['choices'])->firstWhere('isCorrect', false)['id']],
            'rational' => ['value' => '99991'],
            'integerSet' => ['value' => '99991'],
        };
    }
}
