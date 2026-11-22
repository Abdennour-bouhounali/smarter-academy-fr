<?php

/**
 * Ce que l'espace enseignant DÉRIVE de l'état canonique — fenêtres et règles
 * des signaux « تستحقّ نظرة » (App\Domain\Classroom\Insights).
 *
 * Aucune de ces valeurs ne touche la maîtrise : elle reste celle du moteur
 * (config/mastery.php). Elles disent seulement QUAND un fait devient digne
 * d'être montré à un enseignant. Chaque changement de règle incrémente
 * `rule_version`, que chaque signal porte : on sait sous quelle règle il a
 * été produit. TEACHER_CLASSROOM_ARCHITECTURE.md § « Signaux » documente le
 * pourquoi de chaque seuil.
 */
return [
    'rule_version' => 1,

    // « Récemment » : la fenêtre des signaux et des changements (jours).
    'window_days' => (int) env('TEACHER_INSIGHTS_WINDOW_DAYS', 14),

    // La trajectoire d'un point dans la classe : combien de semaines.
    'trajectory_weeks' => 8,

    'signals' => [
        // Difficulté partagée sur un point : au moins N élèves en « ثغرة ».
        // Un seul élève est une difficulté ISOLÉE : elle vit dans son dossier,
        // pas dans l'alerte de classe.
        'class_difficulty_min_students' => 2,

        // Parmi les élèves ÉVALUÉS sur le point, à partir de quelle part la
        // difficulté est dite « de toute la classe » (et non « d'un groupe »).
        'class_wide_share' => 0.5,
        'class_wide_min_assessed' => 3,

        // Difficulté répétée : en « ثغرة » ET au moins N réponses fausses sur
        // ce point dans la fenêtre. Une seule erreur ne fait pas un signal.
        'repeated_difficulty_min_failures' => 3,

        // Activité sans progrès : au moins N réponses sur le point dans la
        // fenêtre, sans montée de statut, sans maîtrise.
        'stalled_min_attempts' => 5,

        // Engagement (jamais une alerte d'apprentissage) : aucune activité
        // d'apprentissage dans le périmètre depuis N jours.
        'inactive_days' => 14,
    ],
];
