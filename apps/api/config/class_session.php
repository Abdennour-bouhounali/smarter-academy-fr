<?php

// « حصّة القسم » (docs/architecture/CLASS_SESSION.md). Les tests PAR DÉFAUT d'une leçon sont des fichiers du dépôt :
// content/class-tests/<année>/<leçon>.json. Sur un serveur où l'API est déployée seule, ce dossier doit y être synchronisé
// (comme content/practice), ou ce chemin ajusté.
return [
    'content_path' => env('CLASS_TESTS_CONTENT_PATH', base_path('../../content/class-tests')),
    // garde-fous d'une copie d'enseignant et d'une séance
    'max_questions' => 20,
    'max_answers' => 80,
    'max_seats' => 80,
    'max_teams' => 16,
    // les tours de parole des 60 derniers jours servent au choix « équitable » du prochain élève
    'turns_days' => 60,
];
