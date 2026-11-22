<?php

/*
 * « فضاء الوليّ » — réglages de l'espace parent (docs/architecture/PARENT_SPACE.md).
 */
return [
    // Changer le texte « ما يراه وليّك » (student.json › parents.disclosure.*)
    // impose d'incrémenter cette version : les codes et liens portent la
    // version acceptée.
    'consent_version' => env('FAMILY_CONSENT_VERSION', '2026-10-22'),

    // Durée de vie d'un code de liaison (heures).
    'code_ttl_hours' => 72,

    // Bornes : enfants par parent, parents par élève (liens actifs).
    'max_children' => 6,
    'max_parents' => 4,

    // Le jour et la semaine du rapport se comptent à Alger ; la semaine
    // commence le dimanche, comme la semaine scolaire.
    'timezone' => 'Africa/Algiers',

    // Le temps d'étude : un battement couvre au plus `heartbeat_max_seconds`,
    // et une journée d'une surface au plus `day_max_seconds` par compteur.
    'heartbeat_max_seconds' => 180,
    'day_max_seconds' => 16 * 3600,

    // Combien de semaines passées le rapport peut relire.
    'report_weeks_back' => 8,
];
