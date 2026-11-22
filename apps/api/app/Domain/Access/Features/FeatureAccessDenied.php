<?php

namespace App\Domain\Access\Features;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Le refus d'une fonctionnalité ou d'un quota, rendu tel quel en 403.
 *
 * N'étend PAS DomainException : les contrôleurs du مختبر et du cahier
 * traduisent leurs DomainException en 404/422, et un refus d'accès ne doit
 * jamais devenir « introuvable ». Laravel appelle `render()` lui-même.
 *
 * Le corps porte le CODE (que le client traduit en arabe) et, pour un quota,
 * used / limit / remaining — l'interface affiche des compteurs justes sans
 * second appel.
 */
final class FeatureAccessDenied extends RuntimeException
{
    public function __construct(public readonly FeatureDecision $decision)
    {
        parent::__construct($decision->reason);
    }

    /**
     * Un refus est une réponse NORMALE (un élève gratuit, un quota atteint),
     * pas une panne : rien n'est écrit dans le journal d'erreurs.
     */
    public function report(): void {}

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code' => $this->decision->reason,
            'message' => $this->decision->reason,
            'access' => $this->decision->toArray(),
        ], 403);
    }
}
