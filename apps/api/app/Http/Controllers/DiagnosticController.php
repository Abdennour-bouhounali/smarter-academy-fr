<?php

namespace App\Http\Controllers;

use App\Domain\Diagnostic\DiagnosticEngine;
use App\Models\DiagnosticSession;
use Closure;
use DomainException;
use Illuminate\Http\Request;

class DiagnosticController extends Controller
{
    public function __construct(private DiagnosticEngine $engine) {}

    /**
     * Starts a new diagnostic session for the given grade, or resumes the
     * student's existing in-progress one — safe to call again after a
     * refresh, never creates a second competing session.
     */
    public function start(Request $request)
    {
        $validated = $request->validate([
            'grade' => ['required', 'string', $this->supportedGradeRule()],
        ], [
            'grade.required' => 'Merci de préciser la classe.',
        ]);

        $session = $this->engine->startOrResume($request->user(), $validated['grade']);
        $question = $this->engine->currentQuestion($session);

        return response()->json([
            'success' => true,
            'session' => $this->formatSession($session),
            'question' => $question,
        ]);
    }

    /**
     * The student's most recent diagnostic for a grade — used on page load
     * to decide whether to resume, show a result, or offer to start.
     * Never creates a session: returns session=null if none exists yet.
     */
    public function current(Request $request)
    {
        $validated = $request->validate([
            'grade' => ['required', 'string', $this->supportedGradeRule()],
        ]);

        $session = $this->engine->latestSessionFor($request->user(), $validated['grade']);
        if (! $session) {
            return response()->json(['success' => true, 'session' => null, 'question' => null]);
        }

        return response()->json([
            'success' => true,
            'session' => $this->formatSession($session),
            'question' => $this->engine->currentQuestion($session),
        ]);
    }

    /**
     * Records one answer and returns either the next question or, once the
     * engine decides enough evidence exists, the completed learning profile.
     * Idempotent by question id — see DiagnosticEngine::submitResponse().
     */
    public function respond(Request $request, int $sessionId)
    {
        $session = $request->user()->diagnosticSessions()->findOrFail($sessionId);

        $validated = $request->validate([
            'questionId' => 'required|string',
            'answer' => 'required|array',
            'responseTimeMs' => 'nullable|integer|min:0',
        ], [
            'questionId.required' => 'Question manquante.',
            'answer.required' => 'Réponse manquante.',
        ]);

        try {
            $result = $this->engine->submitResponse(
                $session,
                $validated['questionId'],
                $validated['answer'],
                $validated['responseTimeMs'] ?? null,
            );
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 409);
        }

        return response()->json([
            'success' => true,
            'isCorrect' => $result['isCorrect'],
            'completed' => $result['completed'],
            'nextQuestion' => $result['nextQuestion'],
            'profile' => $result['profile'],
        ]);
    }

    private function supportedGradeRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if (! DiagnosticEngine::isAvailableFor((string) $value)) {
                $fail('Aucun diagnostic n’est disponible pour cette classe pour le moment.');
            }
        };
    }

    private function formatSession(DiagnosticSession $session): array
    {
        return [
            'id' => $session->id,
            'grade' => $session->grade,
            'status' => $session->status,
            'startedAt' => $session->started_at?->toIso8601String(),
            'completedAt' => $session->completed_at?->toIso8601String(),
            'profile' => $session->profile_summary,
        ];
    }
}
