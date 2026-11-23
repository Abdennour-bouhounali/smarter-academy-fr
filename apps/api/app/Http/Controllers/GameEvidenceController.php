<?php

namespace App\Http\Controllers;

use App\Domain\Access\ContentAccess;
use App\Domain\GameWorld\ClaimVerifier;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Models\Lesson;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * Les preuves du MONDE DE JEU d'une leçon (« أرخبيل القواسم », décision du
 * propriétaire du 2026-11-15) — docs/architecture/GAME_WORLD.md § « الكفاءات ».
 *
 * Seule compte une réponse qui ressemble à une réponse d'examen : format
 * écrit, PREMIER essai, mode papier, aucune aide ouverte avant. Ce tri est
 * fait par le client (il est le seul à savoir ce qui a été ouvert) ; le
 * VERDICT, lui, est recalculé ici à partir des nombres (ClaimVerifier) : une
 * réponse fausse envoyée comme juste est enregistrée fausse.
 *
 * Poids : une preuve de pratique, jugée par le serveur, de difficulté 2 (essai
 * guidé de « تدرّب ») ou 3 (calcul d'une situation réelle). Elle ne suffit
 * jamais à déclarer « maîtrisé » : `mastery.require_assessment` exige le test.
 * Idempotent par attemptId. L'élève est toujours l'utilisateur du jeton.
 */
class GameEvidenceController extends Controller
{
    public function __construct(private ProgressEngine $engine) {}

    public function store(Request $request, string $lessonCode)
    {
        if (! Lesson::where('code', $lessonCode)->exists()) {
            abort(404);
        }

        try {
            ContentAccess::assertLessonAvailable($lessonCode, $request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $validated = $request->validate([
            'attemptId' => ['required', 'string', 'max:64'],
            'learningPoint' => ['required', 'string', 'max:120'],
            'context' => ['required', Rule::in(['trainer', 'case'])],
            'claim' => ['required', 'array'],
            'claim.kind' => ['required', Rule::in(ClaimVerifier::KINDS)],
            'claim.a' => ['required', 'integer', 'min:0', 'max:'.ClaimVerifier::MAX],
            // `b` : le second nombre de la question — les genres d'UN seul nombre (ClaimVerifier::SINGLE) n'en ont pas
            'claim.b' => [Rule::requiredIf(fn () => ! in_array($request->input('claim.kind'), ClaimVerifier::SINGLE, true)), 'integer', 'min:0', 'max:'.ClaimVerifier::MAX],
        ]);

        $claim = $request->input('claim');
        $correct = ClaimVerifier::verify($claim);
        $item = ClaimVerifier::itemId($claim);

        try {
            $result = $this->engine->recordEvidence($request->user(), $lessonCode, [
                'questionCode' => "gameworld:{$item}",
                'exerciseCode' => 'gameworld-'.$validated['context'],
                'questionId' => $item,
                'attemptId' => $validated['attemptId'],
                'isCorrect' => $correct,
                'learningPointRefs' => [['code' => $validated['learningPoint'], 'role' => 'primary']],
                'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
                'difficulty' => $validated['context'] === 'case' ? 3 : 2,
                'templateKey' => 'gameworld:'.$claim['kind'],
                'hintsUsed' => 0,
                'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
                'sourceId' => 'gameworld:'.$validated['context'],
                'answer' => $claim,
            ]);
        } catch (DomainException $e) {
            Log::channel(config('mastery.log_channel', 'mastery'))->notice('game_evidence.rejected', [
                'lesson' => $lessonCode, 'user_id' => $request->user()->id, 'reason' => $e->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'duplicate' => $result['duplicate'],
            'evidenceId' => $result['evidence']->id,
            'outcome' => $result['outcome']->value,
        ], $result['duplicate'] ? 200 : 201);
    }
}
