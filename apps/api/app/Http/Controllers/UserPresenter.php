<?php

namespace App\Http\Controllers;

use App\Models\User;

/**
 * La forme de l'utilisateur rendue au frontend — UNE seule définition.
 *
 * Elle était private dans AuthController tant qu'un seul contrôleur en avait
 * besoin. Trois en ont besoin désormais (mot de passe, Google, vérification),
 * et trois copies auraient divergé au premier champ ajouté : un élève connecté
 * par Google aurait reçu un objet différent de celui reçu par mot de passe, et
 * le frontend aurait appris à s'en méfier.
 *
 * ── Ce qui ne sort JAMAIS d'ici ──────────────────────────────────────────
 * Le hachage du mot de passe, le jeton de session, et les identifiants des
 * fournisseurs externes. `hasPassword` dit s'il EXISTE un mot de passe, sans
 * rien en révéler — c'est ce dont l'interface a besoin pour savoir quoi
 * proposer, et c'est tout ce qu'elle obtient.
 */
final class UserPresenter
{
    public static function format(User $user): array
    {
        return [
            'id' => $user->id,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'email' => $user->email,
            'role' => $user->role,
            'grade' => $user->grade,
            'accountStatus' => $user->account_status,
            // Le frontend en a besoin pour router : espace élève, ou écran
            // « vérifiez votre adresse ». La décision reste serveur (le
            // middleware refuse), ceci ne fait qu'éviter un aller-retour.
            'emailVerified' => $user->hasVerifiedEmail(),
            // Un compte Google n'a pas de mot de passe : l'interface ne doit
            // pas lui proposer d'en changer un.
            'hasPassword' => $user->hasPassword(),
            // Le consentement tel qu'il a été donné. `null` pour les comptes
            // antérieurs à sa mise en place — jamais une date fabriquée.
            'legalConsentAt' => optional($user->legal_consent_at)->toIso8601String(),
            'termsAcceptedVersion' => $user->terms_accepted_version,
            'privacyPolicyAcceptedVersion' => $user->privacy_policy_accepted_version,
        ];
    }
}
