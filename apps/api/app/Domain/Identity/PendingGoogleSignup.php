<?php

namespace App\Domain\Identity;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * L'ENTRE-DEUX : Google a dit qui est la personne, mais elle n'a pas encore
 * accepté les documents légaux — et §22 interdit de créer le compte avant.
 *
 * Il faut donc retenir « voici l'identité prouvée » le temps d'un aller-retour
 * par l'écran de consentement. Trois façons de faire, une seule acceptable :
 *
 *   ✗ Créer le compte tout de suite, faire accepter après. C'est exactement
 *     ce que §22 proscrit : le compte existerait sans consentement, et un
 *     élève qui referme l'onglet laisserait derrière lui un compte qu'il n'a
 *     jamais voulu.
 *   ✗ Stocker l'identité en base « en attente ». On conserverait le nom et
 *     l'adresse de quelqu'un qui n'a rien accepté — des données personnelles
 *     détenues sans base légale, et une table à purger.
 *   ✓ Ne rien conserver DU TOUT : l'identité voyage, CHIFFRÉE et DATÉE, dans
 *     un jeton confié au navigateur. Le serveur n'en garde aucune trace.
 *     Rien à purger, rien à fuir.
 *
 * Le jeton est chiffré avec APP_KEY (Crypt, qui authentifie aussi le contenu) :
 * le navigateur ne peut ni le lire, ni le forger, ni y substituer une autre
 * adresse. Sa durée de vie est courte — il ne sert qu'à traverser un écran.
 */
final class PendingGoogleSignup
{
    /**
     * Quinze minutes : le temps de lire une case à cocher, pas davantage.
     */
    public const TTL_SECONDS = 900;

    /**
     * Emballe une identité prouvée en un jeton opaque.
     */
    public static function issue(GoogleIdentity $identity): string
    {
        return Crypt::encryptString(json_encode([
            'sub' => $identity->providerUserId,
            'email' => $identity->email,
            'verified' => $identity->emailVerified,
            'first' => $identity->firstName,
            'last' => $identity->lastName,
            'exp' => now()->addSeconds(self::TTL_SECONDS)->getTimestamp(),
        ], JSON_THROW_ON_ERROR));
    }

    /**
     * Rouvre un jeton. Rend null pour TOUTE anomalie — illisible, altéré,
     * expiré, incomplet : autant de raisons de ne pas créer de compte, et
     * aucune de les distinguer pour l'appelant.
     */
    public static function open(string $token): ?GoogleIdentity
    {
        try {
            $data = json_decode(Crypt::decryptString($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            return null;
        }

        if (! is_array($data) || ! isset($data['sub'], $data['email'], $data['exp'])) {
            return null;
        }

        if (now()->getTimestamp() > (int) $data['exp']) {
            return null;
        }

        // L'adresse non vérifiée chez Google n'arrive normalement jamais
        // jusqu'ici (le point d'entrée refuse avant). Contrôle de ceinture :
        // ce jeton est la SEULE chose que le serveur croira sur parole au
        // retour, donc il vaut mieux qu'il ne puisse pas porter d'exception.
        if (($data['verified'] ?? false) !== true) {
            return null;
        }

        return new GoogleIdentity(
            providerUserId: (string) $data['sub'],
            email: (string) $data['email'],
            emailVerified: true,
            firstName: $data['first'] ?? null,
            lastName: $data['last'] ?? null,
        );
    }
}
