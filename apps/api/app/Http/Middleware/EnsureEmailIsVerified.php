<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fait respecter la vérification de l'adresse — CÔTÉ SERVEUR.
 *
 * L'invariant de l'espace élève :
 *
 *     authentifié  ET  compte actif  ET  adresse vérifiée
 *
 * Les deux premiers étaient déjà tenus (auth:sanctum, account.active) ; ce
 * middleware ajoute le troisième. Sans lui, « vérifiez votre adresse » ne
 * serait qu'un écran que l'on contourne en tapant /espace dans la barre
 * d'adresse — ou en appelant l'API directement, ce qu'aucun écran n'empêche.
 *
 * ── Ce qui reste ACCESSIBLE sans vérification ────────────────────────────
 * Le strict nécessaire pour sortir de cet état : lire son propre compte
 * (/auth/me), redemander le courriel, se déconnecter. Ces routes-là ne
 * portent pas ce middleware. Tout le reste de l'espace élève le porte.
 *
 * ── Les ADMINS ───────────────────────────────────────────────────────────
 * Un administrateur n'est pas concerné. Son compte n'est pas créé par le
 * formulaire public mais par la commande `make:admin`, qui ne passe par aucun
 * courriel : lui imposer une vérification l'enfermerait dehors sans aucun
 * gain de sécurité. C'est une exemption explicite, pas un oubli — et elle est
 * couverte par un test de non-régression.
 *
 * Le code 403 porte `emailVerified: false`, pour que le frontend distingue
 * « adresse non vérifiée » (→ /verification-email) de « compte suspendu »
 * (→ message), les deux arrivant en 403.
 */
class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User && ! $user->isAdmin() && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Vérifiez votre adresse e-mail pour accéder à votre espace.',
                'emailVerified' => false,
            ], 403);
        }

        return $next($request);
    }
}
