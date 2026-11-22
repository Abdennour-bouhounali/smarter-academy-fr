<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Les RELECTEURS du contenu : l'administrateur et les ambassadeurs
 * (« سفراء », User::canReviewAllContent).
 *
 * Garde le signalement de problèmes depuis 2026-10-05 : le bouton n'est plus
 * montré qu'à eux, et ce middleware fait respecter la même règle côté
 * serveur (403, motif `not_a_reviewer`).
 */
class EnsureContentReviewer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->canReviewAllContent()) {
            return response()->json([
                'success' => false,
                'reason' => 'not_a_reviewer',
                'message' => 'Seuls les ambassadeurs et l\'administration peuvent signaler un problème.',
            ], 403);
        }

        return $next($request);
    }
}
