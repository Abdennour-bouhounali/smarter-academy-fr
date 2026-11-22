<?php

// « التحدّي اليومي » — les VALEURS PAR DÉFAUT du défi quotidien.
//
// Ce fichier n'est pas la configuration effective : l'administration peut
// surcharger chaque valeur (écran « التحدّي اليومي », table
// daily_challenge_policies), et l'enseignant règle sa classe
// (daily_challenge_class_settings). Le seul lecteur est
// App\Domain\DailyChallenge\DailyChallengeConfig — aucun contrôleur, aucun
// composant ne lit ces nombres directement.
//
// Chaque défi FIGE la configuration qui l'a produit (config_snapshot) : un
// changement de barème ne réécrit jamais un score passé.
//
// Contrat : docs/architecture/DAILY_CHALLENGE.md.
return [

    'challenge' => [
        'enabled' => true,
        'default_question_count' => 5,
        'allowed_question_counts' => [3, 5, 7, 10],
        // Minutes allouées à UNE tentative à partir de son ouverture. Au-delà,
        // les questions non répondues sont « abandoned » (0 point, preuve
        // inerte) et la tentative est close comme `expired`.
        'attempt_window_minutes' => 30,
        // Fenêtre quotidienne (heure locale de `timezone`). Hors fenêtre, on
        // ne COMMENCE pas ; une tentative ouverte reste finissable.
        'available_from' => '06:00',
        'available_until' => '23:59',
        'timezone' => 'Africa/Algiers',
        // Jours de défi, ISO-8601 (1 = lundi … 7 = dimanche). Un jour hors de
        // cette liste n'existe pas pour la série : il ne la casse pas, il ne
        // coûte rien. Défaut : vendredi (5) chômé.
        'challenge_weekdays' => [1, 2, 3, 4, 6, 7],
        // Secondes estimées par question, pour « ~4 دقائق ».
        'estimated_seconds_per_question' => 45,
    ],

    'scoring' => [
        // La justesse domine : une réponse fausse vaut 0, jamais négatif.
        'base_points' => 100,
        // Une réponse partiellement juste (multiChoice) : une fraction de la
        // base, sans bonus de vitesse — comme la maîtrise (D3).
        'partial_ratio' => 0.4,
        // Bonus de vitesse PAR PALIERS, sur une réponse JUSTE uniquement.
        // `max_seconds` croissants ; au-delà du dernier : 0.
        'speed_tiers' => [
            ['max_seconds' => 10, 'bonus' => 30],
            ['max_seconds' => 20, 'bonus' => 25],
            ['max_seconds' => 30, 'bonus' => 20],
            ['max_seconds' => 45, 'bonus' => 15],
            ['max_seconds' => 60, 'bonus' => 10],
            ['max_seconds' => 90, 'bonus' => 5],
        ],
        // Plafond du bonus de vitesse (sécurité si les paliers sont mal saisis).
        'max_speed_bonus' => 30,
        // En dessous, la réponse est jugée et compte, mais sans bonus de
        // vitesse : personne ne lit et ne résout une question en moins d'une
        // seconde et demie.
        'min_plausible_ms' => 1500,
        // Série : bonus = min(max, per_day + growth × (série − 1)), versé
        // seulement si la tentative a au moins `min_correct` bonnes réponses
        // (on récompense la régularité, pas la présence au hasard).
        'streak_bonus' => [
            'per_day' => 10,
            'growth' => 2,
            'max' => 30,
            'min_correct' => 1,
        ],
        // Jour de défi manqué : la série retombe à 0 et le score cumulé perd
        // `per_day` points par jour manqué, au plus `max_days_per_gap` jours
        // par absence — une semaine d'absence ne coûte pas un mois de travail.
        // Le score cumulé ne descend jamais sous 0.
        'missed_day_penalty' => [
            'enabled' => true,
            'per_day' => 15,
            'max_days_per_gap' => 3,
        ],
        // Plafond du score d'UNE journée (questions + série). null = sans.
        'max_daily_score' => null,
    ],

    'competition' => [
        // Valeurs par défaut d'une classe qui n'a encore rien réglé.
        'class_challenge_enabled_by_default' => true,
        'class_competition_enabled_by_default' => true,
        'show_top3_by_default' => false,
        'show_results_to_class_by_default' => false,
        // Les élèves voient-ils leur propre rang quand la compétition est
        // active (même si le Top 3 est masqué) ?
        'show_own_rank_to_students' => true,
        // Ordre documenté, non modifiable : score cumulé ↓, bonnes réponses ↓,
        // temps moyen ↑, date d'atteinte du score ↑, identifiant ↑.
        'tie_breaking' => ['cumulative_score', 'total_correct', 'average_response_time', 'score_reached_at', 'user_id'],
    ],

    'selection' => [
        // Un point réussi en défi ces N derniers jours cède sa place (espacement).
        'recently_retrieved_days' => 3,
        // « Récemment appris » : première preuve il y a moins de N jours.
        'recently_learned_days' => 14,
        // Erreurs récentes (défi ou pratique) : fenêtre en jours.
        'recent_mistakes_days' => 7,
    ],
];
