<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Madar\MadarException;
use App\Domain\Madar\MadarService;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\MadarRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « نافس أستاذك » : l'ENSEIGNANT joue à « فضاء الألعاب » dans UNE de ses
 * classes (docs/architecture/MADAR_GAME.md §18). Ses parties comptent dans le
 * classement de cette classe, son nom y figure avec « الأستاذ ». Il joue sans
 * cœur, sans محطة التزوّد, et rien de ce qu'il joue n'est une preuve
 * d'apprentissage. Mêmes réponses que MadarController ; la classe est
 * vérifiée (ClassroomPolicy) à chaque appel, et une partie ne se clôt que dans
 * la classe où elle a commencé.
 */
class TeacherMadarPlayController extends Controller
{
    public function __construct(private MadarService $madar) {}

    private function service(Request $request, int $id): array
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return [$classroom, $this->madar->asTeacherIn($classroom)];
    }

    private function runIn(Request $request, MadarService $madar, Classroom $classroom, string $uuid): MadarRun
    {
        $run = $madar->ownedRun($request->user(), $uuid);
        if ((int) $run->classroom_id !== (int) $classroom->id) {
            throw new MadarException(MadarException::NOT_FOUND);
        }

        return $run;
    }

    /** GET …/madar/play — l'écran des jeux, dans cette classe. */
    public function show(Request $request, int $id): JsonResponse
    {
        [$classroom, $madar] = $this->service($request, $id);

        return response()->json(['success' => true] + $madar->state($request->user()) + ['classroom' => ['id' => $classroom->id, 'name' => $classroom->name]]);
    }

    /** POST …/madar/play/runs — {game, level?} une partie, sans cœur. */
    public function start(Request $request, int $id): JsonResponse
    {
        [, $madar] = $this->service($request, $id);
        $data = $request->validate(['game' => 'sometimes|string|max:16', 'level' => 'sometimes|integer|min:1|max:999']);

        return $this->attempt(fn () => $madar->startRun($request->user(), $data['game'] ?? MadarRun::GAME_ORBIT, isset($data['level']) ? (int) $data['level'] : null), 201);
    }

    /** POST …/madar/play/runs/{uuid}/revive — reprendre, sans cœur. */
    public function revive(Request $request, int $id, string $uuid): JsonResponse
    {
        [$classroom, $madar] = $this->service($request, $id);

        return $this->attempt(fn () => $madar->revive($request->user(), $this->runIn($request, $madar, $classroom, $uuid)));
    }

    /** POST …/madar/play/runs/{uuid}/finish — {score, stars, wave?, completed?, position?, peak?}. */
    public function finish(Request $request, int $id, string $uuid): JsonResponse
    {
        [$classroom, $madar] = $this->service($request, $id);
        $data = $request->validate([
            'score' => 'required|integer|min:0|max:100000000',
            'stars' => 'required|integer|min:0|max:1000000',
            'wave' => 'sometimes|integer|min:0|max:10000',
            'completed' => 'sometimes|boolean',
            'position' => 'sometimes|integer|min:0|max:10000',
            'peak' => 'sometimes|integer|min:0|max:10000',
        ]);

        return $this->attempt(fn () => $madar->finishRun(
            $request->user(), $this->runIn($request, $madar, $classroom, $uuid), (int) $data['score'], (int) $data['stars'], (int) ($data['wave'] ?? 0), (bool) ($data['completed'] ?? false),
            ['position' => isset($data['position']) ? (int) $data['position'] : null, 'peak' => isset($data['peak']) ? (int) $data['peak'] : null],
        ));
    }

    /** PATCH …/madar/play/ship — {ship}. */
    public function ship(Request $request, int $id): JsonResponse
    {
        [, $madar] = $this->service($request, $id);
        $data = $request->validate(['ship' => 'required|string|max:24']);

        return $this->attempt(fn () => $madar->chooseShip($request->user(), $data['ship']));
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
