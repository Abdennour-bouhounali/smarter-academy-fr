<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Registration\RegistrationGate;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « التسجيل » — l'administrateur ouvre ou ferme les inscriptions publiques, et le chemin du lien de classe, sans
 * toucher au .env (propriétaire, 2026-11-21). La règle et sa mémoire sont dans RegistrationGate.
 */
class AdminRegistrationController extends Controller
{
    public function __construct(private RegistrationGate $gate) {}

    public function show(): JsonResponse
    {
        return response()->json(['success' => true, 'registration' => $this->gate->settings()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'open' => ['required_without:classLinks', 'boolean'],
            'classLinks' => ['required_without:open', 'boolean'],
        ]);

        $changes = [];
        foreach (['open', 'classLinks'] as $field) {
            if (array_key_exists($field, $validated)) {
                $changes[$field] = (bool) $validated[$field];
            }
        }

        return response()->json(['success' => true, 'registration' => $this->gate->update($request->user(), $changes)]);
    }
}
