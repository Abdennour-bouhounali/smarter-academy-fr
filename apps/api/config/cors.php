<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Les origines autorisées à appeler cette API : celles du site français
     * (en production « https://smarter-academy.fr »), et elles seules — le
     * produit algérien est un autre produit, sans aucune dépendance runtime
     * avec celui-ci. La liste vient de l'environnement (CORS_ALLOWED_ORIGINS),
     * avec pour défaut les ports de développement local (Vite en mode dev,
     * et son aperçu de production sur 4173 — celui qu'utilise la QA navigateur).
     */
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env(
            'CORS_ALLOWED_ORIGINS',
            'http://localhost:5173,http://localhost:5174,http://localhost:4173'
        ))
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Le navigateur garde la réponse au « preflight » (OPTIONS) au lieu de la
    // redemander avant CHAQUE appel portant un jeton (Chrome plafonne à 2 h).
    // Sans effet quand le SPA et l'API partagent l'origine (production).
    'max_age' => 7200,

    'supports_credentials' => true,

];
