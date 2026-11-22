<?php

/**
 * LES DOCUMENTS LÉGAUX — leur version fait autorité ICI, et nulle part ailleurs.
 *
 * Pourquoi ce fichier existe : un consentement n'a de valeur que s'il désigne
 * un TEXTE PRÉCIS. « L'élève a accepté les CGU » ne prouve rien ; « l'élève a
 * accepté les CGU version 2026-09-12 » se vérifie.
 *
 * La version est donc une donnée du SERVEUR. Le navigateur ne l'envoie jamais :
 * il coche une case, le serveur écrit la version qui a cours. Un client qui
 * enverrait `terms_version: "1999-01-01"` n'obtiendrait rien d'autre que la
 * version courante — voir LegalConsent::current().
 *
 *     navigateur : « j'accepte »  (un booléen, rien de plus)
 *          ↓
 *     ce fichier (serveur)
 *          ↓
 *     users.terms_accepted_version / privacy_policy_accepted_version
 *
 * ── Faire évoluer un document ────────────────────────────────────────────
 * Changer le texte d'une page SANS changer la version ici, c'est modifier ce
 * que les élèves sont réputés avoir accepté. Toute modification de fond des
 * pages /cgu ou /confidentialite doit donc s'accompagner d'une nouvelle date
 * ici. Les consentements déjà enregistrés gardent leur ancienne version — ils
 * deviennent lisibles comme « a accepté une version antérieure », ce qui est
 * exactement l'information utile.
 *
 * Le format est une DATE (AAAA-MM-JJ), pas un numéro : elle se compare, elle
 * se lit, et elle correspond à ce qui est affiché en tête des pages.
 */

return [

    /*
     * Conditions Générales d'Utilisation — page /cgu.
     */
    'terms_version' => env('LEGAL_TERMS_VERSION', '2026-09-12'),

    /*
     * Politique de confidentialité — page /confidentialite.
     */
    'privacy_version' => env('LEGAL_PRIVACY_VERSION', '2026-09-12'),

    /*
     * L'ÉDITEUR. Repris tel quel par les mentions légales : une seule
     * source pour l'identité, afin que le nom affiché sur trois pages ne
     * puisse pas diverger.
     */
    'publisher' => [
        'name' => 'Abdennour Abdennour',
        'legal_form' => 'Entrepreneur individuel',
        'siren' => '937795003',
        'ape' => '85.59B',
        'registered_at' => '2026-08-31',
        'address' => '54 rue des Roseaux, 31400 Toulouse, France',
        'email' => 'contact@smarter-academy.fr',
    ],

];
