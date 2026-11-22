<?php

namespace App\Http\Controllers;

use App\Domain\Madar\MadarException;
use App\Domain\Madar\MadarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « مدار » côté élève (docs/architecture/MADAR_GAME.md). L'élève est toujours
 * `$request->user()` ; une partie ou une question se résout par son uuid ET
 * son propriétaire (404 sinon).
 *
 * Le client annonce un score (borné par la durée réelle) et une réponse
 * brute ; aucun cœur, aucune justesse, aucune durée n'est lue dans une requête.
 */
class MadarController extends Controller
{
    public function __construct(private MadarService $madar) {}

    /** GET /madar — l'écran : cœurs, records, vaisseaux, classement de la semaine. */
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true] + $this->madar->state($request->user()));
    }

    /** POST /madar/runs — {game?: orbit|defense|explorer|sniper, level?} une partie (−1 ❤️, sauf un jeu gratuit). */
    public function start(Request $request): JsonResponse
    {
        $data = $request->validate(['game' => 'sometimes|string|max:16', 'level' => 'sometimes|integer|min:1|max:999']);

        return $this->attempt(fn () => $this->madar->startRun($request->user(), $data['game'] ?? \App\Models\MadarRun::GAME_ORBIT, isset($data['level']) ? (int) $data['level'] : null), 201);
    }

    /** POST /madar/runs/{uuid}/revive — reprendre après un crash (−1 ❤️). */
    public function revive(Request $request, string $uuid): JsonResponse
    {
        return $this->attempt(fn () => $this->madar->revive($request->user(), $this->madar->ownedRun($request->user(), $uuid)));
    }

    /** POST /madar/runs/{uuid}/finish — {score, stars, wave?} (`stars` = ennemis abattus pour « دفاع الكوكب », cibles touchées pour « قنّاص القيم » ; `wave` = vague ou manche). */
    public function finish(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'score' => 'required|integer|min:0|max:100000000',
            'stars' => 'required|integer|min:0|max:1000000',
            'wave' => 'sometimes|integer|min:0|max:10000',
            'completed' => 'sometimes|boolean',
            'position' => 'sometimes|integer|min:0|max:10000',
            'peak' => 'sometimes|integer|min:0|max:10000',
        ]);

        return $this->attempt(fn () => $this->madar->finishRun(
            $request->user(), $this->madar->ownedRun($request->user(), $uuid), (int) $data['score'], (int) $data['stars'], (int) ($data['wave'] ?? 0), (bool) ($data['completed'] ?? false),
            ['position' => isset($data['position']) ? (int) $data['position'] : null, 'peak' => isset($data['peak']) ? (int) $data['peak'] : null],
        ));
    }

    /** PATCH /madar/ship — {ship}. */
    public function ship(Request $request): JsonResponse
    {
        $data = $request->validate(['ship' => 'required|string|max:24']);

        return $this->attempt(fn () => $this->madar->chooseShip($request->user(), $data['ship']));
    }

    /** POST /madar/refuel — la question d'approvisionnement (la même tant qu'elle n'est pas répondue). */
    public function refuel(Request $request): JsonResponse
    {
        return $this->attempt(fn () => $this->madar->refuel($request->user()));
    }

    /** POST /madar/refuel/{uuid}/answer — {answer, left?}. `left` : la page a été quittée (repli si `/left` s'est perdu). */
    public function answer(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['answer' => 'present|nullable|array', 'left' => 'sometimes|boolean']);

        return $this->attempt(function () use ($request, $uuid, $data) {
            return $this->madar->answerRefuel($request->user(), $this->madar->ownedRefuel($request->user(), $uuid), $data['answer'], (bool) ($data['left'] ?? false));
        });
    }

    /** POST /madar/refuel/{uuid}/left — {awayMs} : la page a été quittée pendant la question. */
    public function left(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['awayMs' => 'required|integer|min:0|max:86400000']);

        return $this->attempt(fn () => $this->madar->markLeft($request->user(), $this->madar->ownedRefuel($request->user(), $uuid), (int) $data['awayMs']));
    }

    private function attempt(callable $action, int $status = 200): JsonResponse
    {
        try {
            $result = $action();
        } catch (MadarException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->reason], $e->status());
        }

        return response()->json(['success' => true] + $result, ($result['duplicate'] ?? false) ? 200 : $status);
    }
}
