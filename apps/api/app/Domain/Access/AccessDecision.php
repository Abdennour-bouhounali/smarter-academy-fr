<?php

namespace App\Domain\Access;

use App\Models\Entitlement;

/**
 * Une décision d'accès, AVEC son motif.
 *
 * Un booléen seul suffirait à fermer la porte, mais pas à répondre à la
 * question que pose réellement l'administration : « pourquoi cet élève
 * a-t-il accès ? » (spec §52). Le motif voyage donc avec la décision, depuis
 * l'endroit qui la prend jusqu'à l'endroit qui l'affiche, plutôt que d'être
 * reconstitué après coup par déduction.
 */
final class AccessDecision
{
    /**
     * Le motif d'une décision — vocabulaire clos, pour que l'administration
     * et les tests parlent la même langue que le service.
     */

    /** L'accès vient de la règle du gratuit, pas d'une ligne en base. */
    public const VIA_FREE = 'free';

    /** L'accès vient d'un abonnement synchronisé. */
    public const VIA_SUBSCRIPTION = 'subscription_entitlement';

    /** L'accès vient d'une dérogation d'administration. */
    public const VIA_ADMIN_OVERRIDE = 'admin_override';

    /** Refus : contenu payant, aucun droit valide. */
    public const PREMIUM_REQUIRED = 'premium_required';

    /** Refus : compte suspendu ou désactivé. */
    public const ACCOUNT_INACTIVE = 'account_inactive';

    /** Refus : contenu payant et visiteur anonyme. */
    public const AUTHENTICATION_REQUIRED = 'authentication_required';

    private function __construct(
        public readonly bool $allowed,
        public readonly string $reason,
        public readonly ?Entitlement $entitlement = null,
    ) {}

    public static function allow(string $reason, ?Entitlement $entitlement = null): self
    {
        return new self(true, $reason, $entitlement);
    }

    public static function deny(string $reason): self
    {
        return new self(false, $reason);
    }

    /**
     * Le message montré à l'élève.
     *
     * Ne révèle jamais pourquoi PRÉCISÉMENT c'est fermé au-delà du nécessaire :
     * « il faut un accès premium » est actionnable, « votre dérogation a été
     * révoquée le 3 » ne l'est pas et expose de l'interne.
     */
    public function studentMessage(): string
    {
        return match ($this->reason) {
            self::ACCOUNT_INACTIVE => "Votre compte n'est pas actif.",
            self::AUTHENTICATION_REQUIRED => 'Cette leçon nécessite un compte.',
            default => 'Cette leçon nécessite un accès premium.',
        };
    }
}
