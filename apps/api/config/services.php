<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
     * Le fournisseur de paiement.
     *
     * Les secrets viennent de l'ENVIRONNEMENT, et n'en sortent jamais : ni en
     * base, ni dans une réponse d'API, ni dans un journal. Absents, la
     * vérification de signature échoue et TOUS les webhooks sont refusés —
     * c'est le sens sûr : une configuration manquante doit fermer, pas ouvrir.
     */
    'stripe' => [
        /*
         * La clé d'API.
         *
         * `STRIPE_SECRET` est le nom historique du dépôt et reste celui que la
         * configuration lit en premier. `STRIPE_SECRET_KEY` — le nom employé
         * par la documentation de Stripe — est accepté en REPLI, parce que
         * c'est celui qu'un environnement déjà déployé peut porter. Aucun nom
         * n'est renommé : les deux sont lus, un seul suffit.
         */
        'secret' => env('STRIPE_SECRET', env('STRIPE_SECRET_KEY')),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        // Tolérance d'horodatage d'une signature, en secondes. Borne le rejeu
        // d'un corps signé intercepté.
        'webhook_tolerance' => (int) env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],


    /*
    |--------------------------------------------------------------------------
    | Google — « Continuer avec Google »
    |--------------------------------------------------------------------------
    |
    | Les trois valeurs sont STRICTEMENT côté serveur. Le secret ne doit
    | jamais atteindre le navigateur : il n'existe donc aucune variable
    | VITE_GOOGLE_* correspondante, et il ne faut pas en créer. Le frontend
    | n'a rien à savoir d'autre que l'adresse de la route de départ.
    |
    | `redirect` doit correspondre EXACTEMENT à l'URI de redirection
    | autorisée dans la console Google — au caractère près, schéma et port
    | compris, sinon Google refuse l'échange.
    |
    */

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

];
