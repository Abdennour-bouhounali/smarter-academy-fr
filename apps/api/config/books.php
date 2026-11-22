<?php

/*
 * LA LIBRAIRIE (livres papier, docs/architecture/BOOKS_STORE.md) — fermée en
 * France tant qu'il n'y a pas de livre français (le propriétaire, 2026-11-22).
 *
 * Fermée, CHAQUE route de la librairie répond 404 — la vitrine publique
 * (/books/*) comme l'administration (/admin/books*, /admin/book-orders*,
 * /admin/book-order-payments*, /admin/book-messages*, /admin/book-managers*) —
 * et DatabaseSeeder ne sème pas BookSeeder. Le code, les tables et les
 * migrations restent : on l'ouvre plus tard avec BOOKS_ENABLED=true.
 */
return [
    'enabled' => (bool) env('BOOKS_ENABLED', false),
];
