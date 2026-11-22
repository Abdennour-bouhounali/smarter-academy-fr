<?php

namespace App\Http\Controllers;

use App\Domain\Billing\PaymentGate;
use Illuminate\Http\JsonResponse;

/**
 * « Le paiement en ligne est-il ouvert ? » — public, pour que l'interface sache s'il faut montrer une offre, un prix,
 * un cadenas. Rien d'autre : ni offre, ni tarif, ni fournisseur (PaymentGate).
 */
class BillingStatusController extends Controller
{
    public function show(PaymentGate $gate): JsonResponse
    {
        return response()->json(['success' => true, 'open' => $gate->isOpen()]);
    }
}
