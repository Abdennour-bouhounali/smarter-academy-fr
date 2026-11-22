<?php

namespace App\Domain\Access\ActivationCodes;

use RuntimeException;

/**
 * La FORME d'un code d'activation : comment il est tiré, comment il est lu,
 * comment il est haché. Un seul endroit, parce que les trois doivent être
 * d'accord — un code tiré dans un alphabet et normalisé dans un autre serait
 * invalide à la saisie, et la panne n'apparaîtrait qu'en production, sur des
 * cartes déjà imprimées.
 *
 * ── L'alphabet ───────────────────────────────────────────────────────────
 * 32 symboles : les 26 lettres majuscules moins I et O, plus les chiffres 2
 * à 9. Sont exclus, délibérément :
 *
 *   0 et O, 1 et I  → indiscernables sur une carte imprimée, et la première
 *                     chose qu'un élève saisit de travers au téléphone.
 *
 * Il reste 32 symboles, soit exactement 5 bits chacun : 12 symboles font
 * 60 bits. L'espace de recherche est de 2^60 ≈ 1,15 × 10^18 — pour 100 000
 * codes vendus, une saisie au hasard a environ une chance sur 10^13 de tomber
 * juste. La limite de débit (5 essais par minute) rend l'attaque par
 * tâtonnement sans objet : il faudrait des milliards d'années.
 *
 * ── Le groupage ──────────────────────────────────────────────────────────
 * Rendu en XXXX-XXXX-XXXX pour l'impression et la lecture à voix haute. Les
 * tirets sont de la PRÉSENTATION : normalize() les retire, et le hachage ne
 * porte que sur les 12 symboles. Un élève qui les omet, en met trop, ou tape
 * en minuscules est donc accepté — l'exigence de saisie exacte est une
 * exigence qu'on s'impose à soi, pas à lui.
 */
final class ActivationCodeFormat
{
    /** 32 symboles, sans 0/O/1/I. Voir le docblock. */
    public const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    /** 12 symboles × 5 bits = 60 bits d'entropie. */
    public const LENGTH = 12;

    /** La taille d'un groupe à l'affichage : XXXX-XXXX-XXXX. */
    private const GROUP = 4;

    /**
     * Tire un code neuf, en clair, groupé pour l'impression.
     *
     * `random_int` et non `rand`/`mt_rand` : le générateur doit être
     * cryptographiquement sûr, sans quoi connaître quelques codes d'un lot
     * permettrait de prédire les suivants — et un lot entier se déduirait
     * d'une seule carte achetée.
     */
    public static function generate(): string
    {
        $max = strlen(self::ALPHABET) - 1;
        $symbols = '';

        for ($i = 0; $i < self::LENGTH; $i++) {
            $symbols .= self::ALPHABET[random_int(0, $max)];
        }

        return self::group($symbols);
    }

    /** Pose les tirets : ABCD1234EFGH → ABCD-1234-EFGH. */
    public static function group(string $symbols): string
    {
        return implode('-', str_split($symbols, self::GROUP));
    }

    /**
     * Ce que l'élève a tapé → les 12 symboles canoniques, ou null.
     *
     * Tolérant à l'ENTRÉE, strict sur le RÉSULTAT : espaces, tirets,
     * minuscules et caractères invisibles collés par un copier-coller sont
     * retirés ; ce qui reste doit être exactement 12 symboles de l'alphabet,
     * sinon null.
     *
     * Retourne null plutôt que de lever : une saisie invalide est un cas
     * NORMAL du parcours élève, pas une anomalie. L'appelant la traite comme
     * « code invalide », exactement comme un code bien formé mais inconnu —
     * et c'est voulu : distinguer les deux dirait à qui tâtonne s'il a trouvé
     * la bonne forme.
     */
    public static function normalize(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }

        // Les minuscules sont remontées AVANT le filtrage : « abcd-1234-efgh »
        // est la même carte, tapée sans majuscules.
        $upper = strtoupper(trim($raw));

        $kept = '';
        $length = strlen($upper);
        for ($i = 0; $i < $length; $i++) {
            if (str_contains(self::ALPHABET, $upper[$i])) {
                $kept .= $upper[$i];
            }
        }

        return strlen($kept) === self::LENGTH ? $kept : null;
    }

    /**
     * L'empreinte stockée en base.
     *
     * HMAC-SHA256 clé par une valeur dérivée d'APP_KEY. Le choix est
     * expliqué dans la migration ; en deux mots : la vérification doit être
     * une RECHERCHE INDEXÉE (« ce hachage existe-t-il ? »), ce qu'un hachage
     * salé par ligne interdit, et la lenteur d'un bcrypt ne protégerait rien
     * face à 60 bits d'entropie non choisie par un humain.
     *
     * La clé est dérivée plutôt qu'égale à APP_KEY : cette même clé chiffre
     * les sessions et les cookies, et réutiliser un secret pour deux usages
     * est ce qui transforme une faiblesse de l'un en faiblesse de l'autre.
     */
    public static function hash(string $normalized): string
    {
        return hash_hmac('sha256', $normalized, self::key());
    }

    /** Les 4 derniers symboles, gardés en clair pour l'administration. */
    public static function hint(string $normalized): string
    {
        return substr($normalized, -self::GROUP);
    }

    /**
     * La clé HMAC, dérivée d'APP_KEY.
     *
     * Lève si APP_KEY manque : mieux vaut refuser de générer un lot que d'en
     * produire un haché avec une chaîne vide — ces codes-là deviendraient
     * tous inutilisables au premier déploiement correctement configuré, et
     * personne ne s'en apercevrait avant qu'un élève ne se plaigne.
     */
    private static function key(): string
    {
        $appKey = (string) config('app.key');

        if ($appKey === '') {
            throw new RuntimeException(
                'APP_KEY est vide : impossible de hacher un code d\'activation.'
            );
        }

        if (str_starts_with($appKey, 'base64:')) {
            $decoded = base64_decode(substr($appKey, 7), true);
            if ($decoded !== false) {
                $appKey = $decoded;
            }
        }

        // La dérivation : même secret d'origine, matière à clé distincte de
        // celle qui sert au chiffrement applicatif.
        return hash_hmac('sha256', 'activation-code-v1', $appKey, true);
    }
}
