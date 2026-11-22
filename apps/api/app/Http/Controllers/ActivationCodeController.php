<?php

namespace App\Http\Controllers;

use App\Domain\Access\ActivationCodes\ActivationCodeException;
use App\Domain\Access\ActivationCodes\ActivationCodeRedemptionService;
use App\Domain\Access\EntitlementService;
use Illuminate\Http\Request;

/**
 * « J'ai acheté une carte, voici mon code. »
 *
 * UN seul geste, et c'est le seul point d'entrée par lequel un élève peut
 * faire changer ses propres droits d'accès. Il n'y a ici ni index, ni show,
 * ni destroy : un élève ne consulte pas la liste des codes, ne vérifie pas un
 * code sans le consommer (ce serait un oracle offert au tâtonnement), et ne
 * retire pas un accès. L'absence est la protection, comme dans
 * AccessController.
 *
 * Ce qui protège cette route :
 *   auth:sanctum      → il faut un compte
 *   account.active    → il ne faut pas être suspendu
 *   email.verified    → il faut une adresse prouvée (le groupe le pose)
 *   throttle:activation-redeem → 5 essais par minute, 30 par heure et par IP
 *
 * Le code est la SEULE donnée acceptée du client. Ni l'élève visé (c'est
 * toujours `$request->user()`), ni la durée, ni le palier : tout le reste
 * vient du lot, donc du serveur.
 */
class ActivationCodeController extends Controller
{
    public function __construct(
        private ActivationCodeRedemptionService $redemption,
        private EntitlementService $entitlements,
    ) {}

    public function redeem(Request $request)
    {
        $validated = $request->validate([
            // 32 : douze symboles, leurs tirets, et de la marge pour les
            // espaces d'un copier-coller. Assez large pour ne rejeter aucune
            // saisie plausible, assez étroit pour qu'on ne hache pas un
            // mégaoctet.
            'code' => 'required|string|max:32',
        ], [
            'code.required' => 'Saisissez votre code d\'activation.',
        ]);

        try {
            $code = $this->redemption->redeem($request->user(), $validated['code']);
        } catch (ActivationCodeException $e) {
            // 422 et non 404 : « ce code ne marche pas » est une réponse
            // métier, et un 404 laisserait croire à une route absente. Le
            // motif voyage pour que l'interface arabe choisisse son message.
            return response()->json([
                'success' => false,
                'reason' => $e->reason,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            // L'état d'accès RECALCULÉ : c'est lui que l'interface affiche,
            // et il vient de la même autorité que toutes les autres décisions
            // d'accès. Le frontend n'en déduit rien par lui-même.
            'access' => $this->entitlements->summarize($request->user()),
            'activatedUntil' => optional($code->entitlement?->expires_at)->toIso8601String(),
        ]);
    }
}
