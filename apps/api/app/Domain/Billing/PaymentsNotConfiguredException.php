<?php

namespace App\Domain\Billing;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * L'administrateur veut ouvrir le paiement alors que le fournisseur ne peut pas encaisser → 422. Le corps nomme ce
 * qui manque (des NOMS de variables, jamais une valeur).
 */
final class PaymentsNotConfiguredException extends RuntimeException
{
    /** @param  string[]  $missing */
    public function __construct(public readonly array $missing)
    {
        parent::__construct(PaymentGate::NOT_CONFIGURED_MESSAGE);
    }

    public function report(): void {}

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => PaymentGate::NOT_CONFIGURED_CODE,
            'message' => PaymentGate::NOT_CONFIGURED_MESSAGE,
            'missing' => $this->missing,
        ], 422);
    }
}
