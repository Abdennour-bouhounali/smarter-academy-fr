<?php

namespace App\Http\Controllers;

use App\Domain\Access\ContentAccess;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\ProgressEngine;
use App\Domain\Progress\StudentActivity;
use App\Models\AssessmentItem;
use App\Models\Lesson;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Enregistre le résultat d'UNE question du test final comme preuve
 * d'apprentissage.
 *
 * Charge utile V2 : `{questionCode, attemptId, answer: {picked}}`. Le serveur
 * retrouve l'item dans le registre (assessment_items), lit sa clé de réponse,
 * décide l'issue, ses learning points, sa difficulté et sa source. Le client
 * ne choisit plus rien de ce qui compte pour la maîtrise.
 *
 * Charge utile HÉRITÉE : `{questionCode, attemptId, isCorrect,
 * learningPointCodes}`. Acceptée tant que `mastery.accept_legacy_evidence_payload`
 * est vrai, et JOURNALISÉE. Quand l'item est au registre, le serveur juge
 * quand même et compare (`evaluated_by = client_verified`) ; sinon il prend
 * la parole du client en le disant (`client`).
 *
 * L'élève est toujours l'utilisateur du jeton. Idempotent par attemptId.
 */
class LearningEvidenceController extends Controller
{
    public function __construct(private ProgressEngine $engine) {}

    public function store(Request $request, string $lessonCode)
    {
        if (! Lesson::where('code', $lessonCode)->exists()) {
            abort(404);
        }

        // Une leçon retirée n'enregistre plus de preuve : sinon un onglet
        // resté ouvert continuerait d'alimenter la maîtrise à partir d'un
        // contenu que l'administration a justement jugé faux.
        try {
            ContentAccess::assertLessonAvailable($lessonCode, $request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $validated = $request->validate([
            'questionCode' => 'required|string|max:255',
            'attemptId' => 'required|string|max:64',
            'answer' => 'nullable|array',
            'answer.picked' => 'nullable|integer|min:0|max:50',
            // Héritage — tolérés, jamais décisifs quand le registre connaît l'item.
            'isCorrect' => 'nullable|boolean',
            'learningPointCodes' => 'nullable|array',
            'learningPointCodes.*' => 'string|max:255',
            'assessmentType' => 'nullable|string|max:32',
        ]);

        // La ROUTE décide de la source : ici, le test final. Un client qui
        // déclare autre chose — une question de module, ou la pratique — se
        // trompe de porte, et il est refusé plutôt que reclassé en silence.
        if (($validated['assessmentType'] ?? ProgressEngine::SOURCE_ASSESSMENT) !== ProgressEngine::SOURCE_ASSESSMENT) {
            return response()->json(['success' => false, 'message' => 'Seules les questions d\'évaluation génèrent une preuve d\'apprentissage.'], 422);
        }

        StudentActivity::touch($request->user());

        $item = $this->engine->itemFor(ProgressEngine::SOURCE_ASSESSMENT, $lessonCode, $validated['questionCode']);
        $legacy = array_key_exists('isCorrect', $validated) && $validated['isCorrect'] !== null;

        try {
            $payload = [
                'questionCode' => $validated['questionCode'],
                'attemptId' => $validated['attemptId'],
                'assessmentType' => ProgressEngine::SOURCE_ASSESSMENT,
                'answer' => $validated['answer'] ?? null,
            ];

            if ($item !== null && $item->evaluation === AssessmentItem::EVALUATION_SERVER) {
                // Le serveur juge : la clé de réponse est la sienne.
                $outcome = $this->judge($item, $validated['answer'] ?? null);
                $payload['outcome'] = $outcome->value;
                $payload['evaluatedBy'] = EvidenceEvent::EVALUATED_BY_SERVER;

                if ($legacy) {
                    $payload['evaluatedBy'] = EvidenceEvent::EVALUATED_BY_CLIENT_VERIFIED;
                    $payload['learningPointCodes'] = $validated['learningPointCodes'] ?? [];
                    if ((bool) $validated['isCorrect'] !== $outcome->isSuccess()) {
                        Log::channel(config('mastery.log_channel', 'mastery'))->warning('evidence.disagreement', [
                            'item_key' => $item->item_key, 'client' => $validated['isCorrect'], 'server' => $outcome->value,
                            'user_id' => $request->user()->id,
                        ]);
                    }
                }
            } elseif ($legacy) {
                if (! config('mastery.accept_legacy_evidence_payload', false)) {
                    return response()->json(['success' => false, 'message' => 'Charge utile de preuve obsolète : envoyez la réponse, pas sa correction.'], 422);
                }
                Log::channel(config('mastery.log_channel', 'mastery'))->info('evidence.legacy_payload', [
                    'lesson' => $lessonCode, 'question' => $validated['questionCode'], 'user_id' => $request->user()->id,
                ]);
                $payload['isCorrect'] = (bool) $validated['isCorrect'];
                $payload['learningPointCodes'] = $validated['learningPointCodes'] ?? [];
                $payload['evaluatedBy'] = EvidenceEvent::EVALUATED_BY_CLIENT;
            } else {
                // Charge V2 sans item au registre : le serveur ne peut pas
                // juger, et il ne devine pas.
                Log::channel(config('mastery.log_channel', 'mastery'))->warning('evidence.rejected', [
                    'lesson' => $lessonCode, 'question' => $validated['questionCode'], 'user_id' => $request->user()->id,
                    'reason' => 'unknown_item',
                ]);

                return response()->json(['success' => false, 'message' => 'Question inconnue du registre d\'évaluation : importez le registre de contenu.'], 422);
            }

            $result = $this->engine->recordEvidence($request->user(), $lessonCode, $payload);
        } catch (DomainException $e) {
            Log::channel(config('mastery.log_channel', 'mastery'))->notice('evidence.rejected', [
                'lesson' => $lessonCode, 'question' => $validated['questionCode'], 'user_id' => $request->user()->id,
                'reason' => $e->getMessage(),
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

    /**
     * Un QCM du test final : `picked` contre la clé du registre. Une question
     * laissée sans réponse (temps écoulé, question sautée) est un ABANDON,
     * pas une erreur (D6) : elle est enregistrée, elle ne pèse pas.
     */
    private function judge(AssessmentItem $item, ?array $answer): Outcome
    {
        $picked = $answer['picked'] ?? null;
        if ($picked === null) {
            return Outcome::Abandoned;
        }
        $correct = $item->answer_key['correct'] ?? null;
        if ($correct === null) {
            throw new DomainException('Cet item ne porte pas de clé de réponse.');
        }

        return (int) $picked === (int) $correct ? Outcome::Correct : Outcome::Incorrect;
    }
}
