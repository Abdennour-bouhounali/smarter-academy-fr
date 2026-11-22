<?php

namespace App\Domain\MathLab;

/**
 * LA politique des fichiers du مختبر — le seul endroit où les nombres vivent.
 *
 * Le client en a une copie (features/mathlab/attachments/attachmentPolicy.js)
 * pour refuser AVANT d'envoyer ; `attachmentPolicy.test.js` vérifie que les
 * deux disent la même chose. C'est ici qu'on fait foi.
 *
 * « 1 Mo » est la valeur PRODUIT : 1 000 000 octets, pas 1 048 576 — c'est
 * ce que l'élève lit dans le message, et ce que le client compte aussi.
 */
final class MathLabFilePolicy
{
    public const MAX_FILE_BYTES = 1_000_000;

    public const MAX_FILES_PER_DOCUMENT = 3;

    public const MAX_FILES_PER_USER = 50;

    /**
     * Le type RÉEL (lu dans le contenu) → ce qu'on en retient. Rien d'autre
     * n'entre : ni .docx, ni .txt, ni .csv — pas tant que la سبّورة ne sait
     * rien en faire.
     *
     * @var array<string, array{kind: string, extension: string}>
     */
    public const TYPES = [
        'image/png' => ['kind' => 'image', 'extension' => 'png'],
        'image/jpeg' => ['kind' => 'image', 'extension' => 'jpg'],
        'image/webp' => ['kind' => 'image', 'extension' => 'webp'],
        'image/svg+xml' => ['kind' => 'svg', 'extension' => 'svg'],
        'application/pdf' => ['kind' => 'pdf', 'extension' => 'pdf'],
    ];

    /** Les extensions que le nom d'origine peut porter. */
    public const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf'];

    /** @return array{maxFileBytes: int, maxFilesPerDocument: int, maxFilesPerUser: int} */
    public static function limits(): array
    {
        return [
            'maxFileBytes' => self::MAX_FILE_BYTES,
            'maxFilesPerDocument' => self::MAX_FILES_PER_DOCUMENT,
            'maxFilesPerUser' => self::MAX_FILES_PER_USER,
        ];
    }
}
