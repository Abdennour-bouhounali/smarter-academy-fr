<?php

/**
 * La « جولة تعريفية » — la visite guidée de la première visite d'une page
 * (docs/architecture/PAGE_TOURS.md).
 *
 * `eligible_since` (AAAA-MM-JJ, facultatif) : seuls les comptes créés à cette
 * date ou après voient les visites d'eux-mêmes. Vide (le défaut) : tout compte
 * élève ou enseignant les voit, une fois par page. Le bouton « جولة في
 * الصفحة » rejoue une visite pour tous, quelle que soit cette date.
 */
return [
    'eligible_since' => env('TOURS_ELIGIBLE_SINCE'),
];
