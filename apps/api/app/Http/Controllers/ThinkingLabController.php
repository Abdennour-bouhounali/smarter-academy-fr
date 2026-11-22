<?php

namespace App\Http\Controllers;

use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Domain\ThinkingLab\ChallengePresenter;
use App\Domain\ThinkingLab\ChallengeRepository;
use App\Domain\ThinkingLab\GateService;
use App\Domain\ThinkingLab\LadderService;
use App\Domain\ThinkingLab\ThinkingLabException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « مختبر التفكير » — l'échelle des défis, côté élève (THINKING_LAB.md §6–§8).
 *
 * Le client n'envoie JAMAIS une justesse, un compte ou un temps : une réponse brute et un
 * brouillon. Le serveur juge, compte, ouvre les clés et la porte. Toute réponse passe par
 * ChallengePresenter (aucune réponse, clé fermée ou relecture avant la porte).
 */
class ThinkingLabController extends Controller
{
    public function __construct(
        private GateService $gate,
        private ChallengePresenter $presenter,
        private ChallengeRepository $challenges,
        private LadderService $ladder,
        private FeatureAccessService $access,
    ) {}

    private function allow(Request $request): void
    {
        $this->access->ensure($request->user(), FeatureRegistry::THINKING_LAB_LADDER);
    }

    private static function refuse(ThinkingLabException $e): JsonResponse
    {
        return response()->json(['message' => $e->reason, 'reason' => $e->reason, ...$e->context], $e->status());
    }

    /** L'échelle : la piste des numéros, les défis ouverts, le prochain numéro. */
    public function home(Request $request): JsonResponse
    {
        $this->allow($request);

        return response()->json($this->presenter->home($request->user()));
    }

    /** « التحدّي 318 » → l'id stable (les liens partagés citent le numéro). */
    public function byNumber(Request $request, int $number): JsonResponse
    {
        $this->allow($request);
        $id = $this->challenges->idForNumber($number);

        return $id === null
            ? response()->json(['message' => 'not_found', 'reason' => 'not_found'], 404)
            : response()->json(['id' => $id, 'number' => $number]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $this->allow($request);
        try {
            $challenge = $this->gate->challengeOrFail($id);
            if (! $this->ladder->isReachable($request->user(), $id)) {
                throw new ThinkingLabException(ThinkingLabException::LOCKED);
            }

            return response()->json(['challenge' => $this->presenter->challenge($request->user(), $challenge)]);
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }

    public function attempt(Request $request, string $id): JsonResponse
    {
        $this->allow($request);
        $data = $request->validate([
            'answer' => 'required|string|max:'.(int) config('thinking_lab.honest.max_answer_chars', 300),
            'draft' => 'nullable|string|max:'.(int) config('thinking_lab.honest.max_draft_chars', 2000),
        ]);
        try {
            $result = $this->gate->attempt($request->user(), $id, $data['answer'], $data['draft'] ?? null);
            $challenge = $this->gate->challengeOrFail($id);
            $filled = $this->gate->filled($request->user(), $challenge, $result['progress']);
            $a = $result['attempt'];

            return response()->json([
                'attempt' => [
                    'counted' => $a->counted,
                    'correct' => $a->correct,
                    'outcome' => $result['check']['outcome'],
                    'reason' => $a->reason,
                    'reply' => $this->presenter->reply($filled, $a),
                ],
                'challenge' => $this->presenter->challenge($request->user(), $challenge),
            ]);
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }

    public function openKey(Request $request, string $id, int $k): JsonResponse
    {
        $this->allow($request);
        try {
            $this->gate->openKey($request->user(), $id, $k);

            return response()->json(['challenge' => $this->presenter->challenge($request->user(), $this->gate->challengeOrFail($id))]);
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }

    public function postpone(Request $request, string $id): JsonResponse
    {
        $this->allow($request);
        try {
            $this->gate->postpone($request->user(), $id);

            return response()->json(['home' => $this->presenter->home($request->user())]);
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }

    public function replay(Request $request, string $id): JsonResponse
    {
        $this->allow($request);
        try {
            [$challenge, $progress] = $this->gate->openReplay($request->user(), $id);

            return response()->json(['replay' => $this->presenter->replay($request->user(), $challenge, $progress)]);
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }

    /** « ارفع السقف » (kind = ceiling) ou une suite de sommet (kind = part, index). */
    public function extra(Request $request, string $id): JsonResponse
    {
        $this->allow($request);
        $data = $request->validate([
            'kind' => 'required|in:ceiling,part',
            'index' => 'nullable|integer|min:0|max:9',
            'answer' => 'required|string|max:'.(int) config('thinking_lab.honest.max_answer_chars', 300),
        ]);
        try {
            return response()->json($this->gate->checkExtra($request->user(), $id, $data['kind'], (int) ($data['index'] ?? 0), $data['answer']));
        } catch (ThinkingLabException $e) {
            return self::refuse($e);
        }
    }
}
