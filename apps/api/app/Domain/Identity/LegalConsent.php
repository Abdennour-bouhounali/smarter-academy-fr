<?php

namespace App\Domain\Identity;

use App\Models\User;

/**
 * LE CONSENTEMENT LÉGAL — enregistré par le serveur, jamais rapporté par le
 * client.
 *
 * Ce petit objet existe pour qu'il n'y ait qu'UN endroit où l'on décide ce
 * qui est écrit dans les trois colonnes de consentement. Deux points d'entrée
 * créent des comptes (inscription classique, première connexion Google) ;
 * sans cette classe, la règle serait recopiée deux fois, et une seule des
 * deux serait corrigée le jour où elle change.
 *
 * ── La règle, en une phrase ──────────────────────────────────────────────
 * Le client envoie un BOOLÉEN (« j'accepte »). Le serveur écrit les VERSIONS
 * (config/legal.php) et l'INSTANT (now()). Aucune version fournie par le
 * client n'est lue, nulle part — il n'existe même pas de chemin de code pour
 * le faire.
 */
final class LegalConsent
{
    public function __construct(
        public readonly string $termsVersion,
        public readonly string $privacyVersion,
    ) {}

    /**
     * Les versions qui ont cours. Seule façon d'obtenir un consentement :
     * il n'y a pas de constructeur public prenant des versions arbitraires
     * depuis une requête.
     */
    public static function current(): self
    {
        return new self(
            termsVersion: (string) config('legal.terms_version'),
            privacyVersion: (string) config('legal.privacy_version'),
        );
    }

    /**
     * Les attributs à écrire sur un utilisateur qui vient de consentir.
     * Rendus comme un tableau plutôt qu'appliqués ici, pour que la création
     * d'un compte reste UN seul INSERT — un compte n'existe pas un instant
     * sans son consentement.
     */
    public function attributes(): array
    {
        return [
            'terms_accepted_version' => $this->termsVersion,
            'privacy_policy_accepted_version' => $this->privacyVersion,
            'legal_consent_at' => now(),
        ];
    }

    /**
     * Enregistre le consentement sur un compte DÉJÀ existant.
     *
     * Utilisé quand un compte est créé par un chemin qui ne peut pas tout
     * écrire d'un coup. Ne rétrograde jamais un consentement : si l'élève a
     * déjà accepté ces mêmes versions, on ne réécrit pas l'horodatage — la
     * date du PREMIER accord est celle qui fait foi.
     */
    public function recordOn(User $user): User
    {
        $alreadyCurrent = $user->terms_accepted_version === $this->termsVersion
            && $user->privacy_policy_accepted_version === $this->privacyVersion
            && $user->legal_consent_at !== null;

        if ($alreadyCurrent) {
            return $user;
        }

        $user->forceFill($this->attributes())->save();

        return $user;
    }
}
