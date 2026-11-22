<?php

namespace Database\Seeders\Demo;

/**
 * Le PORTRAIT d'un compte de démonstration — pas une ligne de base, une
 * intention pédagogique.
 *
 * Un persona dit QUI est l'élève (depuis quand il travaille, à quelle
 * fréquence, avec quelle réussite, jusqu'où il est arrivé dans l'unité 1).
 * Le simulateur, lui, ne décide rien : il déroule ce portrait sur le
 * calendrier et écrit les mêmes lignes que produiraient trois mois de
 * navigation réelle.
 *
 * Aucune valeur de maîtrise n'est posée ici : la maîtrise se REJOUE depuis
 * les preuves par App\Domain\Progress\Support\MasteryModel, exactement comme
 * en production. Un portrait ne peut donc pas mentir sur la maîtrise.
 */
final class DemoPersona
{
    /**
     * @param  string  $key            identifiant court, sert de graine déterministe
     * @param  float   $accuracy       probabilité de réussir une question du premier coup
     * @param  float   $persistence    probabilité de retenter après un échec
     * @param  int     $startedDaysAgo ancienneté du compte
     * @param  int     $lastSeenDaysAgo dernier jour d'activité
     * @param  float   $density        proportion de jours travaillés dans la fenêtre
     * @param  float   $reach          part de l'unité 1 parcourue (0..1)
     * @param  int     $noteAppetite   nombre indicatif de notes au cahier
     * @param  int[]   $gapLengths     interruptions volontaires, en jours
     * @param  string[] $weakPoints    codes de points de savoir travaillés en échec
     */
    public function __construct(
        public readonly string $key,
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly string $email,
        public readonly string $scenario,
        public readonly float $accuracy,
        public readonly float $persistence,
        public readonly int $startedDaysAgo,
        public readonly int $lastSeenDaysAgo,
        public readonly float $density,
        public readonly float $reach,
        public readonly int $noteAppetite,
        public readonly array $gapLengths = [],
        public readonly array $weakPoints = [],
        public readonly int $hintAppetite = 1,
    ) {}
}
