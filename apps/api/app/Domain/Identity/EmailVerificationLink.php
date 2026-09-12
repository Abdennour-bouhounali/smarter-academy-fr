<?php

namespace App\Domain\Identity;

use App\Models\User;
use Illuminate\Support\Facades\URL;

/**
 * LE LIEN DE VÉRIFICATION — signé, daté, et lié au courriel qu'il vérifie.
 *
 * Le piège que cette classe évite : un lien du genre
 * `/verifier?user=42` est DEVINABLE. Quiconque sait compter vérifie le compte
 * du voisin. L'identifiant seul ne prouve donc rien.
 *
 * Trois protections, et chacune répond à une attaque précise :
 *
 *   1. SIGNATURE (URL::temporarySignedRoute) — le lien porte un condensat
 *      calculé avec APP_KEY. Changer un seul caractère de l'URL, y compris
 *      l'identifiant, invalide la signature. C'est ce qui rend impossible de
 *      fabriquer le lien de quelqu'un d'autre.
 *
 *   2. EXPIRATION — la date limite est DANS la partie signée, donc elle n'est
 *      pas modifiable. Un lien oublié dans une boîte mail ne reste pas une
 *      clé valable indéfiniment.
 *
 *   3. CONDENSAT DU COURRIEL — le lien porte un hachage du courriel visé, et
 *      la vérification le recompare. Conséquence : si l'élève change d'adresse
 *      après l'envoi, les anciens liens meurent. Sans cela, un lien émis pour
 *      `ancienne@...` validerait `nouvelle@...` — c'est-à-dire qu'il
 *      certifierait une adresse que personne n'a jamais prouvé posséder.
 *      (C'est la protection qu'emploie Laravel lui-même ; elle est reprise
 *      ici parce qu'elle est le cœur du problème, pas un détail.)
 *
 * Le lien pointe vers l'API (la signature est vérifiable seulement là), qui
 * redirige ensuite le navigateur vers le frontend. L'élève, lui, ne voit
 * qu'un aller-retour.
 */
final class EmailVerificationLink
{
    /**
     * Durée de validité. Assez long pour survivre à « je relèverai mes mails
     * ce soir », assez court pour qu'un lien ne traîne pas.
     */
    public const EXPIRES_AFTER_MINUTES = 60 * 24; // 24 h

    /**
     * Fabrique l'URL signée envoyée par courriel.
     */
    public static function for(User $user): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(self::EXPIRES_AFTER_MINUTES),
            [
                'id' => $user->getKey(),
                'hash' => self::hashFor($user),
            ],
        );
    }

    /**
     * Le condensat du courriel porté par le lien.
     *
     * sha1 ici n'est pas un choix de sécurité : ce n'est pas ce qui protège
     * le lien (c'est la signature qui le fait). Il sert à DÉTECTER un
     * changement d'adresse, et il est comparé en temps constant côté
     * vérification.
     */
    public static function hashFor(User $user): string
    {
        return sha1((string) $user->getEmailForVerification());
    }

    /**
     * Le condensat du lien correspond-il encore à l'adresse actuelle ?
     *
     * Comparaison en temps constant : la valeur vient de l'URL, donc de
     * l'extérieur.
     */
    public static function hashMatches(User $user, string $hash): bool
    {
        return hash_equals(self::hashFor($user), $hash);
    }
}
