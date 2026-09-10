<?php

namespace App\Http\Controllers;

use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\PracticeCapability;
use App\Domain\Practice\PracticeSessionService;
use App\Domain\Practice\Support\LevelPolicy;
use App\Models\ExerciseAttempt;
use App\Models\Lesson;
use App\Models\PracticeSession;
use App\Models\StudentLearningPointProgress;
use DomainException;
use Illuminate\Http\Request;

/**
 * Aperçu du Hub, ouverture et clôture d'une séance de pratique.
 *
 * Les deux seuls points d'entrée qui vérifient l'activation : tout le reste
 * exige une séance déjà ouverte, donc en hérite.
 */
class PracticeSessionController extends Controller
{
    public function __construct(
        private PracticeSessionService $sessions,
        private ExerciseRepository $exercises,
    ) {}

    /** Ce qu'affiche le Hub : niveaux, progression, état des points travaillés. */
    public function overview(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        try {
            PracticeCapability::assertActive($lessonCode);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $user = $request->user();

        $completedPerLevel = ExerciseAttempt::query()
            ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
            ->where('practice_sessions.user_id', $user->id)
            ->where('practice_sessions.lesson_id', $lesson->id)
            ->where('exercise_attempts.status', 'completed')
            ->selectRaw('exercise_attempts.level as level, COUNT(DISTINCT exercise_attempts.exercise_id) as done')
            ->groupBy('exercise_attempts.level')
            ->pluck('done', 'level')
            ->map(fn ($n) => (int) $n)
            ->all();

        $levels = LevelPolicy::levels($this->exercises->countsByLevel($lessonCode), $completedPerLevel);

        $learningPoints = StudentLearningPointProgress::query()
            ->where('student_learning_point_progress.user_id', $user->id)
            ->join('learning_points', 'learning_points.id', '=', 'student_learning_point_progress.learning_point_id')
            ->where('learning_points.lesson_id', $lesson->id)
            ->orderBy('learning_points.order')
            ->get(['learning_points.code', 'learning_points.title', 'student_learning_point_progress.status', 'student_learning_point_progress.confidence'])
            ->map(fn ($row) => [
                'code' => $row->code,
                'title' => $row->title,
                'status' => $row->status,
                'confidence' => (float) $row->confidence,
            ])->all();

        $open = PracticeSession::where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->where('status', 'open')
            ->latest('started_at')->first();

        return response()->json([
            'success' => true,
            'lesson' => ['code' => $lesson->code, 'title' => $lesson->title],
            'levels' => $levels,
            'recommendedLevel' => LevelPolicy::recommendedLevel($levels),
            'learningPoints' => $learningPoints,
            'openSession' => $open ? $this->serialize($open) : null,
        ]);
    }

    public function store(Request $request, string $lessonCode)
    {
        if (! Lesson::where('code', $lessonCode)->exists()) {
            abort(404);
        }

        $validated = $request->validate([
            'sessionId' => 'required|string|size:36',
            'level' => 'required|integer|min:1|max:5',
        ]);

        try {
            $result = $this->sessions->startOrResume(
                $request->user(), $lessonCode, $validated['sessionId'], $validated['level'],
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'resumed' => $result['resumed'],
            'session' => $this->serialize($result['session']),
        ], $result['resumed'] ? 200 : 201);
    }

    public function complete(Request $request, string $sessionId)
    {
        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        $completed = $this->sessions->complete($session);

        return response()->json([
            'success' => true,
            'session' => $this->serialize($completed),
            'summary' => $this->summarize($completed),
        ]);
    }

    private function serialize(PracticeSession $session): array
    {
        return [
            'sessionId' => $session->session_id,
            'lessonCode' => $session->lesson->code,
            'level' => $session->level,
            'status' => $session->status,
            'exercisesCompleted' => $session->exercises_completed,
            'questionsAnswered' => $session->questions_answered,
            'correctCount' => $session->correct_count,
            'startedAt' => $session->started_at?->toIso8601String(),
            'completedAt' => $session->completed_at?->toIso8601String(),
        ];
    }

    /** Le bilan de fin de séance : ce qui a été fait, et ce qui a résisté. */
    private function summarize(PracticeSession $session): array
    {
        $attempts = $session->exerciseAttempts()->with('questionAttempts')->get();
        $questions = $attempts->flatMap->questionAttempts;

        return [
            'exercisesAttempted' => $attempts->count(),
            'questionsAnswered' => $questions->whereNotNull('submitted_at')->count(),
            'correctCount' => $questions->whereIn('outcome', ['correct', 'equivalent_correct'])->count(),
            'hintsUsed' => (int) $questions->sum('hints_used'),
            'misconceptions' => $questions->pluck('misconception_id')->filter()->countBy()->all(),
        ];
    }
}
