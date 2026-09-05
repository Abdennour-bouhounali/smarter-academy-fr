<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonFinalTestAttempt;
use Illuminate\Http\Request;

/**
 * The student's latest final-test attempt for a lesson (score + full
 * per-question review) — so revisiting the evaluation module always shows
 * the last completed attempt instead of a blank quiz, until the student
 * explicitly redoes it. One row per (user, lesson); each submit overwrites
 * the previous attempt.
 */
class LessonFinalTestAttemptController extends Controller
{
    /**
     * The student's latest attempt for this lesson, or null if never attempted.
     */
    public function show(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        $attempt = LessonFinalTestAttempt::query()
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        return response()->json([
            'attempt' => $attempt ? $this->serialize($attempt) : null,
        ]);
    }

    /**
     * Upsert (overwrite) the student's attempt for this lesson.
     */
    public function store(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:999',
            'totalQuestions' => 'required|integer|min:1|max:999',
            'answers' => 'present|array|max:200',
            'submittedAt' => 'required|date',
        ]);

        $attempt = LessonFinalTestAttempt::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            [
                'score' => $validated['score'],
                'total_questions' => $validated['totalQuestions'],
                'answers' => $validated['answers'],
                'submitted_at' => $validated['submittedAt'],
            ]
        );

        return response()->json([
            'success' => true,
            'attempt' => $this->serialize($attempt),
        ]);
    }

    /**
     * Clears the student's saved attempt — the "Redo" action. Deleting
     * (rather than keeping a "redone" flag) is deliberate: no history is
     * kept for this table, so an absent row IS the "not attempted / redoing"
     * state, same meaning on every read path.
     */
    public function destroy(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        LessonFinalTestAttempt::query()
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->delete();

        return response()->json(['success' => true]);
    }

    private function serialize(LessonFinalTestAttempt $attempt): array
    {
        return [
            'score' => $attempt->score,
            'totalQuestions' => $attempt->total_questions,
            'answers' => $attempt->answers,
            'submittedAt' => $attempt->submitted_at->toIso8601String(),
        ];
    }
}
