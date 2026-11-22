<?php

// « مختبر التفكير » (docs/architecture/THINKING_LAB.md). Même poignée de main que
// config/practice.php entre le monorepo et Laravel : le contenu vit dans
// content/thinking-lab/, le serveur ne lit que l'index généré.
//
// Les SEUILS de la porte sont ici, jamais dans le code : ils seront réglés sur les
// données réelles (plan §21). Les valeurs « proposées » des décisions ouvertes du
// plan §17 qui touchent la phase 1 y sont posées et nommées.
return [
    'content_path' => env('THINKING_LAB_CONTENT_PATH', base_path('../../content/thinking-lab')),

    'cache_ttl' => (int) env('THINKING_LAB_CONTENT_CACHE_TTL', 3600),

    // L'édition courante (§17 n° 5, proposé : un trimestre) : elle entre dans le choix
    // des nombres de l'élève (params). La renumérotation est la phase 7.
    'edition' => (int) env('THINKING_LAB_EDITION', 1),

    // Le fuseau des journées de réflexion (le serveur, jamais l'horloge du client).
    'timezone' => 'Africa/Algiers',

    'gate' => [
        // D3 : trois tentatives honnêtes ET au moins un jour de réflexion.
        'attempts_to_unlock' => 3,
        'think_hours' => 24,
        // La tranche primaire (1–120) : exemple d'abord, PAS de verrou d'un jour (plan §5.1).
        'primary_think_hours' => 0,
    ],

    // La tentative honnête (plan §6.1) — seuils proposés, à régler sur les données réelles.
    'honest' => [
        'min_seconds_between' => 120,
        // À partir de la 2ᵉ tentative, une phrase dans le brouillon « ماذا غيّرت هذه المرّة؟ ».
        'min_draft_chars' => 12,
        'max_draft_chars' => 2000,
        'max_answer_chars' => 300,
    ],

    // Au plus 3 défis ouverts à la fois (plan §5.2).
    'max_open' => 3,
];
