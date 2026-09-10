<?php

namespace App\Http\Controllers;

use App\Domain\Practice\HintService;
use App\Domain\Practice\PracticeEvidenceRecorder;
use App\Domain\Practice\PracticeSessionService;
use App\Models\ExerciseAttempt;
use App\Models\QuestionAttempt;
use DomainException;
use Illuminate\Http\Request;

/**
 * Ouvrir une question, demander un indice, envoyer une réponse.
 *
 * L'ouverture précède tout : c'est elle qui crée la tentative à laquelle un
 * indice pourra se rattacher, puisqu'un indice se demande avant de répondre.
 */
class PracticeAnswerController extends Controller
{
    public function __construct(
        private PracticeSessionService $sessions,
        private PracticeEvidenceRecorder $recorder,
        private HintService $hints,
    ) {}

    public function openQuestion(Request $request, string $sessionId)
    {
        $validated = $request->validate([
            'exerciseId' => 'required|string|max:120',
            'questionId' => 'required|string|max:40',
            'attemptUuid' => 'required|string|size:36',
        ]);

        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
            $attempt = $this->sessions->openQuestion(
                $request->user(), $session,
                $validated['exerciseId'], $validated['questionId'], $validated['attemptUuid'],
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'attempt' => [
                'attemptUuid' => $attempt->attempt_uuid,
                'questionId' => $attempt->question_id,
                'attemptNumber' => $attempt->attempt_number,
                'hintsUsed' => $attempt->hints_used,
                'answered' => $attempt->isAnswered(),
            ],
        ]);
    }

    public function storeHint(Request $request, string $attemptUuid)
    {
        $attempt = QuestionAttempt::where('attempt_uuid', $attemptUuid)->first();
        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            abort(404);
        }

        $exerciseAttempt = $attempt->exerciseAttempt;
        $session = $exerciseAttempt->practiceSession;

        try {
            $hint = $this->hints->reveal($attempt, $session->lesson->code, $exerciseAttempt->exercise_id);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 409);
        }

        return response()->json(['success' => true, 'hint' => $hint]);
    }

    /**
     * Enregistre une réponse. L'issue est calculée par le client — même
     * frontière de confiance que le test final. Ce que le serveur vérifie :
     * que la tentative est bien celle du demandeur, que la question existe,
     * et quels points d'apprentissage elle mesure (lus dans le CONTENU, pas
     * dans la requête).
     */
    public function store(Request $request, string $sessionId)
    {
        $validated = $request->validate([
            'attemptUuid' => 'required|string|size:36',
            'outcome' => 'required|string|max:32',
            'answer' => 'nullable|array',
            'normalizedAnswer' => 'nullable|string|max:255',
            'misconceptionId' => 'nullable|string|max:120',
        ]);

        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        $attempt = QuestionAttempt::where('attempt_uuid', $validated['attemptUuid'])->first();
        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            abort(404);
        }

        try {
            $result = $this->recorder->record(
                $request->user(), $session, $attempt,
                $attempt->exerciseAttempt->exercise_id, $validated,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'duplicate' => $result['duplicate'],
            'attempt' => [
                'attemptUuid' => $result['attempt']->attempt_uuid,
                'outcome' => $result['attempt']->outcome,
                'hintsUsed' => $result['attempt']->hints_used,
            ],
        ], $result['duplicate'] ? 200 : 201);
    }

    /** Marque un exercice terminé — ce qui fait avancer le déverrouillage. */
    public function completeExercise(Request $request, string $sessionId)
    {
        $validated = $request->validate(['exerciseId' => 'required|string|max:120']);

        try {
            $session = $this->sessions->ownedBy($request->user(), $sessionId);
        } catch (DomainException) {
            abort(404);
        }

        $attempt = ExerciseAttempt::where('practice_session_id', $session->id)
            ->where('exercise_id', $validated['exerciseId'])->first();
        if ($attempt === null) {
            abort(404);
        }

        if ($attempt->status !== 'completed') {
            $attempt->update(['status' => 'completed', 'completed_at' => now()]);
            $session->increment('exercises_completed');
        }

        return response()->json(['success' => true]);
    }
}
