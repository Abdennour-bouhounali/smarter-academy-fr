<?php

namespace App\Http\Controllers;

use App\Domain\Access\ContentAccess;
use App\Domain\Practice\AttemptPresenter;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\LearningPointPracticeProgress;
use App\Domain\Practice\ExerciseSelector;
use App\Domain\Practice\PracticeCapability;
use App\Domain\Practice\PracticeSessionService;
use App\Domain\Practice\Medals;
use App\Domain\Practice\Support\LevelPolicy;
use App\Domain\Settings\StudentSettingsService;
use App\Domain\Progress\Support\Freshness;
use App\Domain\Progress\Support\OutcomeStats;
use App\Models\LearningPoint;
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
    /** content/practice/active.json n'active pas la pratique de cette leçon (ou le serveur ne le voit pas). */
    public const PRACTICE_UNAVAILABLE = 'practice_unavailable';

    /** La leçon n'est pas ouverte à cet utilisateur (palier, publication, masquée par l'enseignant). */
    public const LESSON_UNAVAILABLE = 'lesson_unavailable';

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

        // Deux refus distincts, deux motifs clos : le client doit pouvoir dire
        // « la pratique n'existe pas (encore) ici » autrement que « cette leçon
        // ne t'est pas ouverte ». Le statut reste 422, comme pour tout refus
        // d'accès au contenu (LearningEvidence, LessonFinalTestAttempt…).
        if (! PracticeCapability::isActive($lessonCode)) {
            return self::refuse(self::PRACTICE_UNAVAILABLE, "La pratique n'est pas encore disponible pour cette leçon.");
        }
        try {
            ContentAccess::assertLessonAvailable($lessonCode, $request->user());
        } catch (DomainException $e) {
            return self::refuse(self::LESSON_UNAVAILABLE, $e->getMessage());
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

        // Les cinq niveaux ouverts d'emblée si l'élève (ou son enseignant) l'a réglé.
        $levels = LevelPolicy::levels(
            $this->exercises->countsByLevel($lessonCode),
            $completedPerLevel,
            app(StudentSettingsService::class)->practiceLevelsOpen($user),
        );

        // TOUS les points de la leçon, évalués ou non : un point sans preuve
        // est « non évalué », pas absent — l'élève doit voir ce qui reste.
        $states = StudentLearningPointProgress::query()
            ->where('user_id', $user->id)
            ->whereHas('learningPoint', fn ($q) => $q->where('lesson_id', $lesson->id))
            ->get()->keyBy('learning_point_id');
        // Ce qui a été FAIT dans la banque de pratique, par point (exercices
        // terminés / total, questions répondues / total) — un compteur
        // d'activité, distinct de l'état de maîtrise ci-dessus.
        $practice = app(LearningPointPracticeProgress::class)->forLesson($user, $lesson);
        $learningPoints = LearningPoint::query()
            ->where('lesson_id', $lesson->id)->whereNull('retired_at')->orderBy('order')
            ->get(['id', 'code', 'title'])
            ->map(function ($lp) use ($states, $practice) {
                $s = $states->get($lp->id);

                return [
                    'code' => $lp->code,
                    'title' => $lp->title,
                    'status' => $s?->status ?? 'unassessed',
                    'statusReason' => $s?->status_reason,
                    'confidence' => $s ? (float) $s->confidence : null,
                    'distinctItemsSuccess' => (int) ($s?->distinct_items_success ?? 0),
                    'freshness' => $s ? Freshness::of($s->last_evidence_at) : null,
                    'practice' => $practice[$lp->code]
                        ?? ['exercises' => 0, 'exercisesCompleted' => 0, 'questions' => 0, 'questionsAnswered' => 0],
                ];
            })->all();

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

        if (! PracticeCapability::isActive($lessonCode)) {
            return self::refuse(self::PRACTICE_UNAVAILABLE, "La pratique n'est pas encore disponible pour cette leçon.");
        }

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

    /**
     * Une séance par son identifiant — ouverte ou close.
     *
     * Le lecteur en a besoin pour connaître son niveau au chargement. Passer
     * par l'aperçu ne suffisait pas : celui-ci ne renvoie que la séance
     * OUVERTE, si bien que rouvrir l'URL d'une séance terminée se lisait
     * comme une erreur au lieu d'une relecture.
     */
    public function show(Request $request, string $sessionId)
    {
        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'session' => $this->serialize($session),
            'summary' => $session->status === 'completed' ? $this->summarize($session) : null,
        ]);
    }

    /**
     * La « خزانة الميداليات » de l'élève pour une leçon (2026-10-06) : ses
     * médailles (or / argent / bronze), déduites de ses réponses enregistrées.
     */
    public function medals(Request $request, string $lessonCode, Medals $medals)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        return response()->json(['success' => true, ...$medals->forStudent($request->user(), $lesson)]);
    }

    /**
     * Les réponses ENREGISTRÉES d'une séance, exercice par exercice (feuille
     * d'examen, 2026-10-06) : « التمرين السابق » relit ce que l'élève a écrit
     * depuis la base — pas depuis la mémoire du navigateur —, donc encore après
     * un rechargement. Lecture seule ; une réponse par question (la première
     * enregistrée : c'est elle que la maîtrise retient).
     */
    public function answers(Request $request, string $sessionId)
    {
        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        $exercises = $session->exerciseAttempts()->with(['questionAttempts.images', 'questionAttempts.review'])->orderBy('id')->get()
            ->map(fn ($exercise) => [
                'exerciseId' => $exercise->exercise_id,
                'status' => $exercise->status,
                'questions' => $exercise->questionAttempts
                    ->whereNotNull('submitted_at')
                    ->sortBy('attempt_number')
                    ->unique('question_id')
                    // Photos et correction de l'enseignant comprises (AttemptPresenter).
                    ->map(fn ($q) => AttemptPresenter::answer($q))->values()->all(),
            ])->values()->all();

        return response()->json(['success' => true, 'exercises' => $exercises]);
    }

    /**
     * Le prochain exercice conseillé (Mastery V2, phase 9) — le sélecteur lit
     * l'état de maîtrise et le registre, il n'écrit rien. `null` quand le
     * niveau est épuisé. Désactivable (`practice.selector_enabled`) : le
     * client reprend alors l'ordre du contenu.
     */
    public function next(Request $request, string $sessionId, ExerciseSelector $selector)
    {
        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        if (! config('practice.selector_enabled', true)) {
            return response()->json(['success' => true, 'exerciseId' => null, 'reason' => 'disabled', 'candidates' => 0]);
        }

        return response()->json(['success' => true, ...$selector->next($session)]);
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

        // OutcomeStats : la même lecture des issues que le dossier de l'élève
        // et la classe de l'enseignant — un bilan ne dit pas un autre chiffre.
        $stats = OutcomeStats::fromOutcomes($questions->whereNotNull('submitted_at')->pluck('outcome'));

        return [
            'exercisesAttempted' => $attempts->count(),
            'questionsAnswered' => $stats['answered'],
            'correctCount' => $stats['successes'],
            'partialCount' => $stats['partials'],
            'incorrectCount' => $stats['failures'],
            'inertCount' => $stats['inert'],
            'successRate' => $stats['successRate'],
            'hintsUsed' => (int) $questions->sum('hints_used'),
            'misconceptions' => $questions->pluck('misconception_id')->filter()->countBy()->all(),
        ];
    }

    /** Un refus 422 avec son motif clos (`code`), que le client traduit en arabe. */
    private static function refuse(string $code, string $message)
    {
        return response()->json(['success' => false, 'code' => $code, 'message' => $message], 422);
    }
}
