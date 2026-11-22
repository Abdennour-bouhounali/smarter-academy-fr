<?php

namespace App\Domain\Billing;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Un paiement qu'on tente de COMMENCER alors que le paiement en ligne est fermé (PaymentGate) → 403, même forme que
 * `registration_closed`.
 *
 * N'étend PAS DomainException : les contrôleurs de facturation traduisent leurs DomainException en 422, et ce refus
 * n'est pas une offre indisponible, c'est la plateforme qui ne vend pas.
 */
final class PaymentsClosedException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct(PaymentGate::CLOSED_MESSAGE);
    }

    /** Une réponse normale, pas une panne : rien dans le journal d'erreurs. */
    public function report(): void {}

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => PaymentGate::CLOSED_CODE,
            'message' => PaymentGate::CLOSED_MESSAGE,
        ], 403);
    }
}
