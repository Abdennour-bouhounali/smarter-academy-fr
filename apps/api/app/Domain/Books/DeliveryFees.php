<?php

namespace App\Domain\Books;

/**
 * Le tarif du transporteur par wilaya, en « دج », pour deux modes : livraison
 * à domicile (« domicile ») et retrait au bureau du transporteur (« stopdesk »).
 * Tableau donné par le propriétaire le 2026-11-22.
 *
 * Un frais par COMMANDE (un seul colis), quelle que soit la quantité. Le
 * serveur calcule et fige ce frais à la commande : un frais envoyé par le
 * client n'est jamais lu.
 *
 * Les wilayas 50 (Bordj Badji Mokhtar) et 54 (In Guezzam) ne figurent pas dans
 * le tableau du transporteur : pas de tarif, le frais reste NULL et se fixe à
 * l'appel de confirmation, comme avant.
 */
final class DeliveryFees
{
    public const HOME = 'home';

    public const DESK = 'desk';

    public const MODES = [self::HOME, self::DESK];

    /** @return array{home:int, desk:int}|null */
    public static function forWilaya(int $id): ?array
    {
        if (! isset(self::TABLE[$id])) {
            return null;
        }

        return ['home' => self::TABLE[$id][0], 'desk' => self::TABLE[$id][1]];
    }

    /** Le frais d'une commande, par le LIBELLÉ de sa wilaya ; null sans mode ou sans tarif. */
    public static function fee(string $wilayaLabel, ?string $mode): ?int
    {
        if ($mode === null || ! in_array($mode, self::MODES, true)) {
            return null;
        }

        foreach (Wilayas::all() as $wilaya) {
            if ($wilaya['label'] === $wilayaLabel) {
                return self::forWilaya($wilaya['id'])[$mode] ?? null;
            }
        }

        return null;
    }

    /** @return array<int, array{0:int, 1:int}> */
    public static function table(): array
    {
        return self::TABLE;
    }

    /** id de la wilaya => [domicile, bureau]. */
    private const TABLE = [
        1 => [1100, 750],
        2 => [680, 400],
        3 => [800, 500],
        4 => [680, 400],
        5 => [700, 400],
        6 => [700, 400],
        7 => [800, 500],
        8 => [1000, 700],
        9 => [500, 350],
        10 => [600, 400],
        11 => [1500, 1050],
        12 => [720, 450],
        13 => [700, 400],
        14 => [700, 400],
        15 => [600, 400],
        16 => [400, 300],
        17 => [800, 500],
        18 => [700, 400],
        19 => [680, 400],
        20 => [730, 450],
        21 => [700, 400],
        22 => [700, 400],
        23 => [700, 450],
        24 => [700, 400],
        25 => [680, 400],
        26 => [600, 400],
        27 => [700, 400],
        28 => [700, 400],
        29 => [700, 400],
        30 => [900, 550],
        31 => [580, 400],
        32 => [970, 700],
        33 => [1500, 1050],
        34 => [680, 400],
        35 => [530, 350],
        36 => [730, 450],
        37 => [1100, 750],
        38 => [700, 400],
        39 => [900, 550],
        40 => [700, 400],
        41 => [730, 450],
        42 => [530, 350],
        43 => [700, 400],
        44 => [700, 400],
        45 => [930, 550],
        46 => [700, 400],
        47 => [850, 500],
        48 => [700, 400],
        49 => [1100, 750],
        51 => [800, 500],
        52 => [1000, 750],
        53 => [1400, 950],
        55 => [930, 550],
        56 => [2100, 1500],
        57 => [930, 550],
        58 => [850, 500],
    ];
}
