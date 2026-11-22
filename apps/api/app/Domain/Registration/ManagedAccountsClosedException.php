<?php

namespace App\Domain\Registration;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Un compte élève qu'un établissement ou un enseignant tente de créer, ou un mot de passe qu'il tente d'émettre,
 * alors que l'interrupteur est fermé (ManagedAccountsGate) → 403, même forme que `registration_closed`.
 */
final class ManagedAccountsClosedException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct(ManagedAccountsGate::CLOSED_MESSAGE);
    }

    /** Une réponse normale, pas une panne : rien dans le journal d'erreurs. */
    public function report(): void {}

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => ManagedAccountsGate::CLOSED_CODE,
            'message' => ManagedAccountsGate::CLOSED_MESSAGE,
        ], 403);
    }
}
