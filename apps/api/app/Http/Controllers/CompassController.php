<?php

namespace App\Http\Controllers;

use App\Domain\Compass\CompassError;
use App\Domain\Compass\CompassService;
use App\Models\CompassProfile;
use App\Models\Lesson;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « بوصلتي » — la jauge de départ (P1). Élève seulement (`learner`).
 * Contrat : docs/architecture/YEAR_COMPASS.md.
 *
 *   GET  /compass                                  état (profil, jauge active, dernière jauge, disponibilité)
 *   PUT  /compass/pointer                          { mode: lesson|not_following, lesson? }
 *   POST /compass/sessions                         { targets[], pointerLesson?, pointerSource, schoolYear }
 *   POST /compass/sessions/{uuid}/questions        { itemId, level } → question publique (sans clé)
 *   POST /compass/sessions/{uuid}/answers          { answerId, answer, unsure } → { correct }
 *   POST /compass/sessions/{uuid}/finish           → bandes recalculées par le serveur
 */
class CompassController extends Controller
{
    public function __construct(private CompassService $compass) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'compass' => $this->compass->state($request->user())]);
    }

    public function pointer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mode' => 'required|in:'.CompassProfile::MODE_LESSON.','.CompassProfile::MODE_NOT_FOLLOWING,
            'lesson' => 'nullable|string|max:80|required_if:mode,'.CompassProfile::MODE_LESSON,
        ]);
        if (($data['mode'] === CompassProfile::MODE_LESSON) && ! Lesson::where('code', $data['lesson'])->exists()) {
            return $this->error(new CompassError('compass_unknown_lesson'));
        }
        $this->compass->setPointer($request->user(), $data['mode'], $data['lesson'] ?? null);

        return $this->show($request);
    }

    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'targets' => 'required|array|min:1|max:'.(int) config('compass.max_targets'),
            'targets.*' => 'string|max:32',
            'pointerLesson' => 'nullable|string|max:80',
            'pointerSource' => 'required|in:student,default',
            'schoolYear' => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
        ]);

        return $this->guard(function () use ($request, $data) {
            $this->compass->start($request->user(), $data['targets'], $data['pointerLesson'] ?? null, $data['pointerSource'], $data['schoolYear']);

            return $this->show($request);
        });
    }

    public function question(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate(['itemId' => 'required|string|max:32', 'level' => 'required|integer|in:1,2']);

        return $this->guard(function () use ($request, $uuid, $data) {
            $session = $this->compass->findOwned($request->user(), $uuid);

            return response()->json(['success' => true, 'question' => $this->compass->serve($session, $data['itemId'], (int) $data['level'])]);
        });
    }

    public function answer(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'answerId' => 'required|integer',
            'answer' => 'present|nullable|array',
            'unsure' => 'sometimes|boolean',
        ]);

        return $this->guard(function () use ($request, $uuid, $data) {
            $session = $this->compass->findOwned($request->user(), $uuid);
            $result = $this->compass->answer($session, (int) $data['answerId'], $data['answer'], (bool) ($data['unsure'] ?? false));

            return response()->json(['success' => true, 'result' => $result]);
        });
    }

    public function finish(Request $request, string $uuid): JsonResponse
    {
        return $this->guard(function () use ($request, $uuid) {
            $session = $this->compass->findOwned($request->user(), $uuid);

            return response()->json(['success' => true, 'result' => $this->compass->finish($session)]);
        });
    }

    private function guard(Closure $fn): JsonResponse
    {
        try {
            return $fn();
        } catch (CompassError $e) {
            return $this->error($e);
        }
    }

    private function error(CompassError $e): JsonResponse
    {
        return response()->json(['success' => false, 'code' => $e->errorCode] + $e->extra, $e->status);
    }
}
