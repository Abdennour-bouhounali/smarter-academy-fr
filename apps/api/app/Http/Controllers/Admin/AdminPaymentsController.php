<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Billing\PaymentGate;
use App\Domain\Billing\PlanCatalog;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Le paiement en ligne — l'administrateur l'ouvre ou le ferme sans toucher au .env (propriétaire, 2026-11-22). La
 * règle, le refus d'ouvrir sur un fournisseur incomplet et la mémoire sont dans PaymentGate.
 */
class AdminPaymentsController extends Controller
{
    public function __construct(
        private PaymentGate $gate,
        private PlanCatalog $plans,
    ) {}

    public function show(): JsonResponse
    {
        return response()->json(['success' => true, 'payments' => $this->state()]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate(['open' => ['required', 'boolean']]);

        $this->gate->update($request->user(), ['open' => (bool) $validated['open']]);

        return response()->json(['success' => true, 'payments' => $this->state()]);
    }

    /** @return array<string, mixed> */
    private function state(): array
    {
        $provider = $this->gate->providerStatus();

        return [
            'open' => $this->gate->isOpen(),
            // La valeur de l'environnement, que la ligne de l'administrateur surcharge.
            'default' => $this->gate->defaultOpen(),
            'provider' => $provider['provider'],
            'mode' => $this->plans->mode(),
            'configured' => $provider['configured'],
            // Des NOMS de variables, jamais une valeur.
            'missing' => $provider['missing'],
            'lastChange' => $this->gate->lastChange(),
        ];
    }
}
