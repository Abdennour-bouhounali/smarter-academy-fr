<?php

namespace App\Domain\Classroom;

use App\Models\Classroom;
use DomainException;

/**
 * Le JETON du lien de classe (« رابط الانضمام ») — `/rejoindre/classe/{jeton}`.
 *
 * Une CAPACITÉ : qui tient le lien peut demander à rejoindre la classe. Il est
 * donc tiré au hasard cryptographique (random_int → CSPRNG), 32 symboles
 * base62 ≈ 190 bits, et ne dérive de RIEN : ni de l'identifiant de la classe,
 * ni de l'enseignant, ni du code de classe. Aucun ordre, aucun condensat
 * prévisible.
 *
 * Stocké en clair, comme le code de classe et pour la même raison : il est
 * semi-public par nature (il circule sur WhatsApp entre trente élèves) et
 * l'enseignant doit pouvoir le RELIRE sur la page de sa classe à tout moment.
 * Le hacher obligerait à le régénérer à chaque affichage. Ce qui le protège :
 * sa longueur (aucun tâtonnement), la limite de débit, la fermeture des
 * adhésions (`join_code_enabled`) et son renouvellement d'un clic, qui
 * invalide l'ancien lien.
 */
final class JoinLinkToken
{
    public const LENGTH = 32;

    private const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    public static function generate(): string
    {
        $max = strlen(self::ALPHABET) - 1;
        $token = '';
        for ($i = 0; $i < self::LENGTH; $i++) {
            $token .= self::ALPHABET[random_int(0, $max)];
        }

        return $token;
    }

    /** Un jeton libre en base. Cinq collisions sur 190 bits = générateur en panne. */
    public static function unique(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $token = self::generate();
            if (! Classroom::where('join_link_token', $token)->exists()) {
                return $token;
            }
        }

        throw new DomainException('Impossible de tirer un lien de classe unique.');
    }

    /** 32 symboles alphanumériques, rien d'autre : tout le reste est refusé avant la base. */
    public static function isWellFormed(?string $raw): bool
    {
        return is_string($raw) && preg_match('/^[A-Za-z0-9]{'.self::LENGTH.'}$/', $raw) === 1;
    }
}
