<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ActivityLogger;
use App\Domain\DailyChallenge\DailyChallengeConfig;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « التحدّي اليومي » dans le panneau : le barème et les défauts globaux.
 * Le service valide (clés fermées, bornes, cohérence) ; un envoi invalide est
 * refusé en entier. Chaque défi fige sa configuration : changer le barème ne
 * réécrit aucun score passé.
 */
class AdminDailyChallengeController extends Controller
{
    public function __construct(private DailyChallengeConfig $config) {}

    public function show(): JsonResponse
    {
        return response()->json(['success' => true] + $this->config->adminView());
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate(['values' => 'required|array']);
        $before = $this->config->global();

        try {
            $view = $this->config->updateGlobal($request->user(), $data['values']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        app(ActivityLogger::class)->log(
            $request->user(), ActivityLogger::DAILY_CHALLENGE_CONFIG_UPDATED, 'daily_challenge_policy', 'global',
            ['scoring' => $before['scoring'], 'challenge' => $before['challenge']],
            ['keys' => array_keys($data['values'])],
        );

        return response()->json(['success' => true] + $view);
    }
}
