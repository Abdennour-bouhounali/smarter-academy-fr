<?php

namespace App\Domain\Access;

/**
 * Le PALIER d'un contenu : ce qu'il faut posséder pour y accéder.
 *
 * Vit à côté de la publication, pas dedans. « Publié » dit que le contenu a
 * le droit d'être servi ; « palier » dit à qui. Un contenu peut être publié
 * et payant, publié et gratuit, masqué et payant — les quatre combinaisons
 * ont un sens, donc les deux notions ne peuvent pas partager une colonne.
 *
 * Le vocabulaire est volontairement CLOS à deux valeurs. Livre, établissement
 * et partenaire ne sont pas des paliers manquants : ce sont des types de
 * DROIT (côté élève), qui viendront dans entitlements.type sans toucher ici.
 */
final class AccessTier
{
    public const FREE = 'free';

    public const PREMIUM = 'premium';

    public const TIERS = [self::FREE, self::PREMIUM];

    /**
     * Normalise ce que porte la base.
     *
     * Tout ce qui n'est pas EXPLICITEMENT `premium` est gratuit — y compris
     * NULL, la chaîne vide et une valeur inconnue. Le sens est délibéré :
     * une leçon devient payante parce que quelqu'un l'a décidé, jamais parce
     * qu'une donnée manquait. Un palier mal orthographié ouvre l'accès au
     * lieu de fermer une leçon aux élèves qui n'ont aucun moyen de payer.
     */
    public static function normalize(?string $raw): string
    {
        return $raw === self::PREMIUM ? self::PREMIUM : self::FREE;
    }

    public static function isPremium(?string $raw): bool
    {
        return self::normalize($raw) === self::PREMIUM;
    }

    /**
     * Le palier EFFECTIF d'un exercice, sachant celui de sa leçon.
     *
     * Trois cas, et un seul est subtil :
     *
     *   exercice null      → hérite de la leçon        (le défaut)
     *   exercice premium   → payant, même leçon gratuite
     *   exercice free      → gratuit, MÊME si la leçon est payante
     *
     * Le troisième est une exception délibérée, pas un oubli : il donne le
     * moyen d'ouvrir un exercice de démonstration sous une leçon vendue. Il
     * ne peut s'obtenir que si un administrateur a posé `free` explicitement
     * — c'est précisément pourquoi la colonne est NULLABLE et ne vaut pas
     * `'free'` par défaut. Sans cette distinction, rendre une leçon payante
     * laisserait tous ses exercices ouverts et le contenu vendu fuirait par
     * sa pratique.
     *
     * Conséquence voulue dans l'autre sens : repasser une leçon en gratuit
     * ne touche PAS un exercice explicitement payant. L'intention de
     * l'administrateur survit au changement de palier de la leçon.
     */
    public static function effective(?string $exerciseTier, ?string $lessonTier): string
    {
        if ($exerciseTier === null || $exerciseTier === '') {
            return self::normalize($lessonTier);
        }

        return self::normalize($exerciseTier);
    }
}
