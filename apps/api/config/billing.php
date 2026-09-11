<?php

/**
 * LE catalogue des offres — côté serveur, et nulle part ailleurs.
 *
 * Pourquoi ce fichier existe : le navigateur ne doit jamais pouvoir choisir un
 * tarif. S'il envoyait un identifiant de prix Stripe, il enverrait celui qui
 * l'arrange — un abonnement à zéro euro est un `price_...` comme un autre. Le
 * client n'envoie donc qu'une CLÉ INTERNE (`annual`), et c'est ce fichier qui
 * décide à quel prix elle correspond.
 *
 *     navigateur : « annual »
 *          ↓
 *     ce catalogue (serveur)
 *          ↓
 *     price_xxx (environnement)
 *
 * Les identifiants de prix viennent de l'ENVIRONNEMENT, jamais du code : ils
 * diffèrent entre le mode test et le mode production, et une valeur écrite ici
 * finirait par être la mauvaise dans l'un des deux.
 *
 * ── Le mode ──────────────────────────────────────────────────────────────
 * `test` tant que rien ne dit le contraire. Encaisser pour de vrai doit être
 * une décision explicite, jamais l'effet d'une variable oubliée.
 */

return [

    /*
     * Le fournisseur utilisé pour l'encaissement. Une seule valeur
     * aujourd'hui ; le registre en accepte plusieurs (voir
     * PaymentProviderRegistry).
     */
    'provider' => env('BILLING_PROVIDER', 'stripe'),

    /*
     * `test` | `live`. Sert à AFFICHER un avertissement sans ambiguïté dans
     * l'administration, et à empêcher qu'on croie encaisser pour de vrai
     * alors qu'on est en test (ou l'inverse, bien plus grave).
     */
    'mode' => env('BILLING_MODE', 'test'),

    /*
     * Où Stripe renvoie l'élève. Le serveur les impose : une URL de retour
     * fournie par le client serait une URL choisie par le client.
     *
     * ATTENTION : ces pages ne prouvent RIEN. Revenir sur l'URL de succès
     * n'ouvre aucun accès — seul le webhook fait foi. Voir CheckoutService.
     */
    'return_urls' => [
        'success' => env('BILLING_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:5173').'/abonnement/retour?statut=succes'),
        'cancel' => env('BILLING_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:5173').'/abonnement/retour?statut=annule'),
    ],

    /*
     * LES OFFRES ACHETABLES.
     *
     * `key` est le vocabulaire du client et de `subscriptions.plan` : stable,
     * interne, sans rapport avec le fournisseur. Le jour où le tarif change
     * chez Stripe, seule la variable d'environnement bouge — les abonnements
     * déjà vendus gardent leur clé, et l'historique reste lisible.
     *
     * `amount_cents` et `currency` sont là pour AFFICHER et pour vérifier, pas
     * pour facturer : c'est Stripe qui facture, d'après son propre prix. Les
     * garder ici permet de détecter une dérive entre ce qu'on annonce et ce
     * qui est réellement débité.
     */
    'plans' => [

        'annual' => [
            'key' => 'annual',
            'name' => 'Premium annuel',
            'description' => "L'intégralité du programme, de la 6e à la Terminale.",
            'price_id' => env('STRIPE_PRICE_ANNUAL'),
            'amount_cents' => 3500,
            'currency' => 'EUR',
            'interval' => 'year',
            // Une offre sans identifiant de prix configuré est INDISPONIBLE,
            // pas cassée : l'API la refuse proprement et l'interface affiche
            // « Indisponible » au lieu d'un bouton qui échouerait.
            'active' => true,
        ],

    ],

];
