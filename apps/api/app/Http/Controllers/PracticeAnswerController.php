<?php

namespace App\Http\Controllers;

use App\Domain\Practice\HintService;
use App\Domain\Practice\PracticeEvidenceRecorder;
use App\Domain\Practice\PracticeSessionService;
use App\Domain\Progress\StudentActivity;
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
                // La réponse ENREGISTRÉE (feuille d'examen : une étape déjà
                // répondue se rouvre verrouillée, avec ce que l'élève avait écrit).
                'answer' => $attempt->isAnswered() ? $attempt->submitted_answer : null,
                'outcome' => $attempt->isAnswered() ? $attempt->outcome : null,
                'normalized' => $attempt->isAnswered() ? $attempt->normalized_answer : null,
                'evaluatedBy' => $attempt->isAnswered() ? $attempt->evaluated_by : null,
                // Les photos jointes — MÊME avant la réponse : un rechargement
                // retrouve celles déjà envoyées (3 au plus par étape).
                'images' => $attempt->images->reject->isExpired()->map->toClient()->values()->all(),
                'review' => $attempt->review?->toClient(),
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
     * Enregistre une réponse. L'issue est calculée par le SERVEUR
     * (AnswerEvaluator, jumeau exact de l'évaluateur du client) à partir de
     * la réponse brute et du contenu ; ce que le client déclare n'est qu'une
     * prévision pour son affichage, comparée et journalisée en cas de
     * désaccord. Le serveur vérifie aussi que la tentative est bien celle du
     * demandeur, que la question existe, et quels points d'apprentissage
     * elle mesure (lus dans le CONTENU et le registre, pas dans la requête).
     * La réponse renvoie l'évaluation du serveur : c'est elle que l'écran
     * affiche.
     */
    public function store(Request $request, string $sessionId)
    {
        $validated = $request->validate([
            'attemptUuid' => 'required|string|size:36',
            // Facultative : la prévision du client. Jamais décisive.
            'outcome' => 'nullable|string|max:32',
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

        // Répondre à une question est le geste d'apprentissage le plus
        // fréquent : c'est ce qui rend la mesure d'activité représentative.
        StudentActivity::touch($request->user());

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
            // false pour « أعِد المحاولة » : la réponse est jugée, pas enregistrée.
            'recorded' => $result['recorded'],
            'attempt' => [
                'attemptUuid' => $result['attempt']->attempt_uuid,
                'outcome' => $result['attempt']->outcome,
                'evaluatedBy' => $result['attempt']->evaluated_by,
                'hintsUsed' => $result['attempt']->hints_used,
            ],
            // « تصحيح الأستاذ » : la demande de correction ouverte par cette
            // réponse (en attente), ou null.
            'review' => $result['attempt']->review?->toClient(),
            // Le verdict du serveur — ce que l'écran montre.
            'evaluation' => [
                'outcome' => $result['evaluation']['outcome'],
                'isCorrect' => $result['evaluation']['isCorrect'],
                'misconceptionId' => $result['evaluation']['misconceptionId'],
                'normalized' => $result['evaluation']['normalized'],
                'feedbackKey' => $result['evaluation']['feedbackKey'],
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
