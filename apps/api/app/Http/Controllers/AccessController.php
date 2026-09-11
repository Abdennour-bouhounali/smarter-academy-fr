<?php

namespace App\Http\Controllers;

use App\Domain\Access\EntitlementService;
use Illuminate\Http\Request;

/**
 * « À quoi ai-je droit ? », pour l'élève lui-même.
 *
 * En LECTURE seule, et volontairement pauvre : de quoi afficher un état
 * (« abonnement actif jusqu'au … »), jamais les lignes de droits. Un élève
 * n'a pas besoin de la référence externe d'un abonnement ni de savoir quel
 * administrateur lui a accordé une dérogation (spec §25).
 *
 * Aucun point d'entrée ne permet à un élève de MODIFIER un droit. C'est la
 * raison pour laquelle il n'existe ici ni store, ni update, ni destroy :
 * l'absence est la protection.
 */
class AccessController extends Controller
{
    public function __construct(private EntitlementService $entitlements) {}

    public function show(Request $request)
    {
        return response()->json([
            'success' => true,
            'access' => $this->entitlements->summarize($request->user()),
        ]);
    }
}
