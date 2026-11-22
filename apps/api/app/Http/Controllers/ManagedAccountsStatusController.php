<?php

namespace App\Http\Controllers;

use App\Domain\Registration\ManagedAccountsGate;
use Illuminate\Http\JsonResponse;

/**
 * L'écran de l'enseignant et celui de l'établissement cachent leurs boutons de création de comptes et de cartes
 * quand l'interrupteur est fermé. Cacher n'est jamais la protection : le serveur refuse de toute façon.
 */
class ManagedAccountsStatusController extends Controller
{
    public function __invoke(ManagedAccountsGate $gate): JsonResponse
    {
        return response()->json(['success' => true, 'open' => $gate->isOpen()]);
    }
}
