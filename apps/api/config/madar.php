<?php

/*
|--------------------------------------------------------------------------
| « مدار » — le jeu de l'espace élève
|--------------------------------------------------------------------------
|
| docs/architecture/MADAR_GAME.md. L'enseignant affine `hearts.daily_free`,
| `runs.daily_cap` et la portée des questions pour SA classe
| (madar_class_settings) ; ces valeurs-ci sont les défauts.
|
| `physics` est le MIROIR des constantes du moteur client
| (apps/web/src/features/madar/engine/constants.js). Le serveur ne rejoue pas
| la partie : il borne le score annoncé par ce que la durée réelle rend
| possible (MadarScoring::maxPlausible). Une constante du client qui augmente
| le score possible doit être reportée ici, sinon de vrais scores seraient
| ramenés à la borne.
|
*/

return [
    'enabled' => (bool) env('MADAR_ENABLED', true),

    'timezone' => 'Africa/Algiers',

    'hearts' => [
        'max' => 5,
        // Versés au premier passage du jour (jamais au-delà de ce nombre).
        'daily_free' => 3,
        // Cœurs rendus par une réponse juste à la « محطة التزوّد ».
        'per_correct' => 1,
    ],

    'runs' => [
        // Parties par jour et par élève — la limite de temps d'écran.
        'daily_cap' => 30,
        // Reprises après un crash, par partie (chacune coûte un cœur).
        'max_revives' => 2,
        // Au-delà, une partie ouverte est abandonnée.
        'max_minutes' => 30,
    ],

    'refuel' => [
        // Combien de candidats le sélecteur classe à chaque service.
        'pool' => 8,
        // Un item déjà servi en approvisionnement ces jours-ci attend son tour.
        'cooldown_days' => 3,
        // Une question servie et non répondue reste la même pendant ce temps.
        'open_minutes' => 30,
        // Le temps de réponse (secondes) selon la difficulté de l'item (1–5).
        // L'enseignant l'affine pour sa classe, puis question par question.
        'time_limits' => [1 => 45, 2 => 60, 3 => 90, 4 => 120, 5 => 150],
        'default_time_limit' => 90,
        'time_limit_range' => [15, 600],
        // La latence du réseau : une réponse arrivée dans ce délai en plus compte encore.
        'grace_seconds' => 3,
        // « Trop rapide » : juste, difficulté ≥ min, en moins de max(seconds, ratio × délai).
        'fast' => ['min_difficulty' => 3, 'seconds' => 5, 'ratio' => 0.12],
        // Une absence de la page plus courte n'est pas comptée (notification, clavier).
        'leave_min_ms' => 1500,
    ],

    // Les cœurs que l'enseignant donne ou retire en une fois.
    'adjustments' => ['max_delta' => 5],

    // « دفاع الكوكب » — MIROIR de apps/web/src/features/madar/defense/constants.js
    // › SCHEDULE. Le calendrier des vagues est FIXE (pas d'appel anticipé) :
    // la vague k commence à un instant connu, donc la durée réelle borne la
    // vague atteinte et le score (DefenseScoring).
    'defense' => [
        'first_wave_at' => 4,
        'spawn_base' => 10,
        'spawn_per_wave' => 1,
        'spawn_max' => 22,
        'breather' => 5,
        'enemies_base' => 6,
        'enemies_per_wave' => 2,
        'enemies_cap' => 40,
        'max_enemy_points' => 15,
        'boss_every' => 5,
        'boss_points' => 150,
        'wave_points' => 100,
        'tolerance' => 1.1,
        'slack' => 100,
    ],

    // « المستكشف » : les niveaux, la physique et le barème vivent dans UN
    // fichier commun au moteur web et à l'API (ExplorerLevels).
    'explorer' => [
        'levels_path' => resource_path('games/explorer/levels.json'),
        // Un niveau ne se traverse pas plus vite que distance / vitesse × ce facteur.
        'min_duration_factor' => 0.8,
        'slack' => 50,
    ],

    // « قنّاص القيم » — MIROIR de apps/web/src/features/madar/sniper/constants.js
    // › SCHEDULE et de sniper/levels.js. Les manches suivent un calendrier FIXE ;
    // le niveau s'ADAPTE (50 niveaux × 3 sous-niveaux = 150 positions) et monte
    // d'au plus une position par manche : la durée réelle et la position de
    // départ bornent la manche, la position atteinte et le score (SniperScoring).
    // Le jeu est GRATUIT : aucun cœur, aucune reprise.
    'sniper' => [
        'first_at' => 2.5,
        'cards_per_round' => 8,
        'gap_start' => 1.6,
        'gap_min' => 0.85,
        'gap_step' => 0.05,
        'fall_start' => 7.5,
        'fall_min' => 4,
        'fall_step' => 0.2,
        'breather' => 2.5,
        'points_base' => 10,
        'points_step' => 2,
        'bonus_factor' => 3,
        'max_multiplier' => 4,
        'levels' => 50,
        'sub_levels' => 3,
        // Une mauvaise manche fait descendre d'une position ; deux de suite, d'un niveau.
        'max_drop_per_round' => 3,
        // Le niveau de départ de chaque année : tout ce qui précède est ouvert.
        // On ne commence JAMAIS par du difficile (propriétaire) : l'entrée est dans les acquis des années d'avant.
        'entry' => ['1am' => 1, '2am' => 5, '3am' => 12, '4am' => 19],
        // Chaque partie s'échauffe deux niveaux sous la position de l'élève (sniper/adapt.js › WARMUP_DROP).
        'warmup_drop' => 6,
        'tolerance' => 1.1,
        'slack' => 100,
    ],

    // « الدخيل » — MIROIR de apps/web/src/features/madar/odd/constants.js › SCHEDULE.
    // Ses niveaux, son entrée par année et ses points sont ceux de `sniper`.
    // Une énigme ne se résout pas plus vite que `min_puzzle_ms` (le client montre
    // la réponse `reveal_ms`) ; le niveau s'adapte toutes les `puzzles_per_round`.
    'odd' => [
        'puzzles_per_round' => 5,
        'reveal_ms' => 1200,
        'min_puzzle_ms' => 1000,
        'time_start' => 15,
        'time_min' => 7,
        'time_step' => 0.15,
        'bonus_factor' => 3,
        'max_multiplier' => 4,
        'max_drop_per_round' => 3,
        'tolerance' => 1.1,
        'slack' => 100,
    ],

    // « الحساب الذهني » — MIROIR de apps/web/src/features/madar/mental/constants.js
    // › SCHEDULE. Même borne que « الدخيل » (OddScoring), plus le bonus de vitesse
    // (`speed_factor` × points du niveau au plus, par problème). Ses 50 niveaux
    // sont les siens (mental/levels.js) ; son entrée par année aussi.
    'mental' => [
        'puzzles_per_round' => 5,
        'min_puzzle_ms' => 700,
        'bonus_factor' => 3,
        'max_multiplier' => 4,
        'speed_factor' => 1,
        'max_drop_per_round' => 3,
        'entry' => ['1am' => 3, '2am' => 7, '3am' => 11, '4am' => 15],
        'tolerance' => 1.1,
        'slack' => 100,
    ],

    'physics' => [
        'omega_start' => 1.25,
        'omega_accel' => 0.018,
        'omega_max' => 3.6,
        'points_per_rad' => 8,
        'star_points' => 3,
        'max_multiplier' => 4,
        'star_min_gap_rad' => 0.35,
        'near_miss_points' => 10,
        'obstacle_min_gap_rad' => 0.85,
        // Marge de la borne (latence, arrondis) — ×1,25 puis + slack.
        'tolerance' => 1.25,
        'slack' => 200,
    ],
];
