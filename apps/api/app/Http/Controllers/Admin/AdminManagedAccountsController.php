<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Registration\ManagedAccountsGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * L'administrateur ouvre ou ferme la création de comptes élèves par un établissement ou un enseignant
 * (propriétaire, 2026-11-22). La règle et sa mémoire sont dans ManagedAccountsGate.
 */
class AdminManagedAccountsController extends Controller
{
    public function __construct(private ManagedAccountsGate $gate) {}

    public function show(): JsonResponse
    {
        return response()->json(['success' => true, 'managedAccounts' => $this->state()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate(['open' => ['required', 'boolean']]);

        $this->gate->update($request->user(), ['open' => (bool) $validated['open']]);

        return response()->json(['success' => true, 'managedAccounts' => $this->state()]);
    }

    /** @return array{open: bool, default: bool, lastChange: ?array} */
    private function state(): array
    {
        return [
            'open' => $this->gate->isOpen(),
            // La valeur de l'environnement, que la ligne de l'administrateur surcharge.
            'default' => $this->gate->defaultOpen(),
            'lastChange' => $this->gate->lastChange(),
        ];
    }
}
