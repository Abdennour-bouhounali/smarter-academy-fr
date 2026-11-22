<?php

namespace App\Domain\Classroom;

use App\Domain\Access\ActivationCodes\ActivationCodeFormat;
use App\Models\Classroom;
use DomainException;

/**
 * Le CODE DE CLASSE (« رمز الانضمام ») — ce que l'enseignant écrit au tableau.
 *
 * Semi-public par nature : il circule entre trente élèves. Il n'est donc pas
 * un secret et se stocke en clair (contrairement au code d'activation, qui
 * vaut de l'argent). Il reste UNIQUE en base et se remplace d'un clic.
 *
 * Même alphabet que les codes d'activation (pas de 0/O ni 1/I) : la même
 * raison — il se lit à voix haute et se recopie au tableau.
 */
final class JoinCode
{
    public const LENGTH = 6;

    public static function generate(): string
    {
        $alphabet = ActivationCodeFormat::ALPHABET;
        $max = strlen($alphabet) - 1;
        $code = '';
        for ($i = 0; $i < self::LENGTH; $i++) {
            $code .= $alphabet[random_int(0, $max)];
        }

        return $code;
    }

    /** Un code libre en base. Cinq tirages ratés = générateur en panne. */
    public static function unique(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $code = self::generate();
            if (! Classroom::where('join_code', $code)->exists()) {
                return $code;
            }
        }

        throw new DomainException('Impossible de tirer un code de classe unique.');
    }

    /** Ce que l'élève a tapé → six symboles canoniques, ou null. */
    public static function normalize(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $upper = strtoupper(trim($raw));
        $kept = '';
        $length = strlen($upper);
        for ($i = 0; $i < $length; $i++) {
            if (str_contains(ActivationCodeFormat::ALPHABET, $upper[$i])) {
                $kept .= $upper[$i];
            }
        }

        return strlen($kept) === self::LENGTH ? $kept : null;
    }
}
