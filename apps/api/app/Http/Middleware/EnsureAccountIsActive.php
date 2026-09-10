<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fait respecter le statut de compte — CÔTÉ SERVEUR.
 *
 * C'est ce qui distingue « suspendu » d'un bouton grisé. Sans ce middleware,
 * users.account_status ne serait qu'une décoration : un compte suspendu
 * garderait un jeton valide et continuerait d'appeler l'API directement.
 *
 * Placé sur TOUTES les routes authentifiées, élève comme admin — un admin
 * désactivé doit l'être aussi.
 *
 * Un compte désactivé voit ses jetons révoqués au passage : c'est un état
 * terminal, inutile de laisser traîner de quoi revenir. Un compte suspendu
 * les garde — la suspension est temporaire, et la lever ne doit pas obliger
 * l'élève à se reconnecter partout.
 *
 * Ce qui n'est JAMAIS fait ici : toucher aux données d'apprentissage. Le
 * cycle de vie d'un compte et la conservation de son historique sont deux
 * sujets distincts (spec §2.4).
 */
class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->hasActiveAccount()) {
            if ($user->account_status === User::STATUS_DISABLED) {
                $user->tokens()->delete();
            }

            return response()->json([
                'success' => false,
                'message' => $user->account_status === User::STATUS_SUSPENDED
                    ? 'Votre compte est temporairement suspendu.'
                    : 'Votre compte a été désactivé.',
                'accountStatus' => $user->account_status,
            ], 403);
        }

        return $next($request);
    }
}
