<?php

// Chemins et activation du moteur d'exercices. Même poignée de main que
// config/curriculum.php entre le monorepo et Laravel : `base_path('../../…')`
// par défaut, surchargeable par variable d'environnement pour les
// déploiements dont l'arborescence diffère (sur Hostinger, l'API est déployée
// seule — le dossier content/ doit y être synchronisé, ou ce chemin ajusté).
return [
    'content_path' => env('PRACTICE_CONTENT_PATH', base_path('../../content/practice')),

    // La liste des leçons activées vit dans le CONTENU
    // (content/practice/active.json), pas ici : le frontend et le validateur
    // la lisent aussi, et trois copies dériveraient. Ce chemin dit seulement
    // où la trouver.
    'active_lessons_path' => env('PRACTICE_ACTIVE_PATH', base_path('../../content/practice/active.json')),

    // Le contenu est un fichier versionné : il ne change qu'au déploiement.
    'cache_ttl' => (int) env('PRACTICE_CONTENT_CACHE_TTL', 3600),
];
