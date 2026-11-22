<?php

namespace App\Http\Controllers;

use App\Domain\Access\Features\FeatureAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « Que puis-je utiliser, et combien m'en reste-t-il ? » — en LECTURE seule.
 *
 * Le client s'en sert pour DESSINER (cadenas, « X متبقّية »), jamais pour
 * autoriser : chaque geste protégé repasse par FeatureAccessService côté
 * serveur. Servi à tout compte vérifié (élève, enseignant) : le palier de
 * chacun vient d'EntitlementService.
 */
class FeatureAccessController extends Controller
{
    public function __construct(private FeatureAccessService $access) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true] + $this->access->summaryFor($request->user()));
    }
}
