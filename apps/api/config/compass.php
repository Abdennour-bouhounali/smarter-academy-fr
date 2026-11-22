<?php

// « بوصلتي » — la jauge de départ (docs/architecture/YEAR_COMPASS.md).
return [
    // La banque générée par scripts/generate-compass-index.mjs (références seulement, aucune réponse).
    'index_path' => env('COMPASS_INDEX_PATH', base_path('../../content/compass/index.generated.json')),

    // Les niveaux où la jauge est ouverte (P1 : 4AM seulement).
    'grades' => ['4am'],

    // Une jauge complète refaite au plus tous les 7 jours (décision 7 du propriétaire).
    'retake_days' => 7,

    // Plafond de questions servies par jauge (3 manches de 12 + marge).
    'max_questions' => 40,

    // Plafond de cibles envoyées par le client (règles A + B).
    'max_targets' => 24,
];
