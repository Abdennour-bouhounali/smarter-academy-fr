<?php

// Le modèle de maîtrise — TOUS ses nombres, versionnés.
//
// Un moteur (App\Domain\Progress\Engine\EngineV1, EngineV2, …) ne contient
// aucune constante : il lit le jeu de paramètres de SA version ici. Changer
// une pondération, c'est ajouter une version et rejouer la preuve immuable
// (smarter:mastery:replay), jamais éditer les nombres d'une version publiée —
// sinon l'état enregistré d'un élève cesse d'être reproductible.
//
// Contrat : docs/architecture/LEARNING_ARCHITECTURE.md § « Mastery model ».
return [

    // La version du moteur qui ÉCRIT aujourd'hui. Chaque ligne de
    // student_learning_point_progress porte la version qui l'a produite.
    'engine_version' => (int) env('MASTERY_ENGINE_VERSION', 2),

    // Phase 4 : la justesse d'une réponse de pratique est calculée par le
    // serveur (App\Domain\Practice\Support\AnswerEvaluator). À `false`, le
    // serveur reprend l'issue déclarée par le client et la marque comme telle
    // (`evaluated_by = client`) — un repli, pas un mode normal.
    'server_evaluation' => filter_var(env('MASTERY_SERVER_EVALUATION', true), FILTER_VALIDATE_BOOL),

    // Le client peut-il encore envoyer l'ancienne charge utile du test final
    // ({isCorrect, learningPointCodes}) ? Refusé (422) par défaut depuis le
    // 2026-09-29 : accepté, il laissait une requête fabriquée déclarer une
    // réponse juste sur une question que le registre ne connaît pas — le
    // client décidait donc de la maîtrise (LEARNING_ARCHITECTURE « Trust
    // boundary »). Le client web n'envoie plus que la réponse depuis Mastery
    // V2. `MASTERY_ACCEPT_LEGACY_EVIDENCE=true` rouvre la transition si besoin
    // (les tests hérités le font, phpunit.xml).
    'accept_legacy_evidence_payload' => filter_var(env('MASTERY_ACCEPT_LEGACY_EVIDENCE', false), FILTER_VALIDATE_BOOL),

    // Le canal du journal de maîtrise (config/logging.php → `mastery`).
    'log_channel' => env('MASTERY_LOG_CHANNEL', 'mastery'),

    // Répétitions suspectes : plus de N tentatives sur UN item en une heure
    // est journalisé (une mesure, pas une sanction — la sanction, c'est déjà
    // le poids de `repeat_after_success`).
    'suspicious_repetition_per_hour' => 10,

    // Vérification nocturne : N couples (élève, point) tirés au hasard,
    // rejoués et comparés à l'état enregistré (smarter:mastery:verify).
    'verify_sample' => 100,

    // Nombre de niveaux de difficulté du contenu (1..levels). Le moteur n'en
    // énumère aucun : il ne fait que normaliser une difficulté par ce nombre.
    'levels' => 5,

    // Fraîcheur — DÉRIVÉE à la lecture, jamais stockée, et sans effet sur la
    // confiance (D7).
    'freshness' => [
        'fresh_days' => 21,
        'stale_days' => 60,
    ],

    // Nombre de preuves récentes lues pour expliquer un état (§18 du plan).
    'explanation_recent_limit' => 20,

    // Le compte d'items disponibles par learning point borne la règle de
    // preuve minimale (need = min(min_distinct_items, disponibles)). Il se
    // lit dans le registre (assessment_items), une fois par TTL, et
    // l'importateur du registre purge ce cache.
    'available_items_cache_ttl' => (int) env('MASTERY_ITEMS_CACHE_TTL', 3600),

    'engines' => [

        // V1 — l'arithmétique HISTORIQUE (Support\MasteryModel), gelée. Ces
        // nombres ne doivent plus changer : ils servent à reproduire l'état
        // d'avant la V2, et à revenir en arrière si nécessaire.
        1 => [
            'starting_confidence' => 0.5,
            'learning_rate' => 0.22,
            'mastered_threshold' => 0.70,
            'gap_threshold' => 0.40,
            'default_difficulty' => 2, // sur l'échelle 1..4 de la V1
            'level_to_difficulty' => [1 => 1, 2 => 2, 3 => 2, 4 => 3, 5 => 4],
            'weights' => ['partial' => 0.5, 'secondary' => 0.5, 'practice' => 0.9],
            'hint_decay' => [1 => 0.7, 2 => 0.5, 3 => 0.4],
        ],

        // V2 — plan « Learning Point Mastery V2 » (docs/reports/…V2_EXECUTION_PLAN…).
        2 => [
            'starting_confidence' => 0.5,
            'learning_rate' => 0.22,
            'mastered_threshold' => 0.70,
            'gap_threshold' => 0.40,

            // Difficulté 1..levels d'un item quand le contenu n'en déclare
            // aucune : le test final (D-§10) — la pratique porte son niveau.
            'default_difficulty' => 3,

            'weights' => [
                // D3 — une réponse partiellement juste est une preuve
                // POSITIVE faible (jamais un demi-échec).
                'partial' => 0.4,
                // Un point secondaire n'est qu'effleuré par la question.
                'secondary' => 0.5,
                // La pratique se fait avec indices et sans limite de tentatives.
                'practice' => 0.9,
                // Une issue que SEUL le client a jugée (item déclarant
                // `evaluation: client`) vaut moins. Les preuves antérieures
                // au registre sont `client_legacy` et gardent leur poids : les
                // dévaluer réécrirait le passé.
                'client_evaluated' => 0.5,
            ],

            // Un indice réduit la valeur d'une RÉUSSITE, jamais en dessous du
            // plancher ; il n'aggrave jamais un échec.
            'hint_decay' => [1 => 0.7, 2 => 0.5, 3 => 0.4],
            'hint_floor' => 0.4,

            // D4 — la valeur probante d'une réussite selon ce que l'élève a
            // déjà montré sur CET item / CE gabarit. Les échecs comptent
            // toujours en plein.
            'demonstration' => [
                'first' => 1.0,
                'variant' => 0.7,
                'retry_after_failure' => 0.6,
                'repeat_after_success' => 0.1,
            ],

            // …et la valeur probante d'un ÉCHEC selon la même nature. Un échec
            // reste une vraie preuve, mais un faux pas sur un item que l'élève
            // a DÉJÀ réussi pèse moitié : sans cela, s'exercer à 90 % de
            // réussite sur ses items connus faisait BAISSER la confiance
            // (dérive par reprise = 0,9 × 0,1 × pas⁺ − 0,1 × pas⁻ < 0), et
            // l'entraînement devenait une pénalité. Constaté au rejeu du jeu de
            // démonstration (2026-09-24) ; écart documenté au plan, D4.
            'demonstration_failure' => [
                'first' => 1.0,
                'variant' => 1.0,
                'retry_after_failure' => 1.0,
                'repeat_after_success' => 0.5,
            ],

            // D1 — `mastered` exige ce nombre de réussites sur des items
            // DISTINCTS, borné par les items que le contenu offre vraiment.
            'min_distinct_items' => 3,

            // D2 — `mastered` exige une réussite en conditions d'évaluation
            // (test final) OU sur un item d'au moins cette difficulté.
            'require_assessment' => true,
            'assessment_equivalent_difficulty' => 4,
        ],
    ],
];
