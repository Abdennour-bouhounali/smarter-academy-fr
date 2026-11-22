<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Mastery V2 — chaque nuit, un échantillon de couples (élève, point) est
// rejoué et comparé à l'état enregistré. Un écart est journalisé
// (`state.verify_mismatch`) ; la commande ne corrige rien.
\Illuminate\Support\Facades\Schedule::command('smarter:mastery:verify')->dailyAt('03:30')->withoutOverlapping();

// Photos de copie (prototype BEM, 2026-10-06) : effacées au bout de 12 mois.
\Illuminate\Support\Facades\Schedule::command('smarter:answer-images:purge')->dailyAt('04:10')->withoutOverlapping();

// « فضاء الوليّ » : le résumé de la semaine écoulée, chaque dimanche matin à Alger
// (PARENT_SPACE.md §5). La commande est idempotente.
\Illuminate\Support\Facades\Schedule::command('smarter:family:weekly-reports')
    ->weeklyOn(0, '08:00')->timezone('Africa/Algiers')->withoutOverlapping();

/*
| Clés VAPID des notifications de commandes de livres (BOOKS_STORE.md §6quater). À lancer UNE
| fois ; copier les trois lignes dans le .env du serveur (le déploiement ne le livre jamais).
| Changer de clés désabonne tous les appareils : chacun devra réactiver ses notifications.
*/
Artisan::command('books:vapid-keys', function () {
    $keys = \Minishlink\WebPush\VAPID::createVapidKeys();
    $this->line('VAPID_PUBLIC_KEY='.$keys['publicKey']);
    $this->line('VAPID_PRIVATE_KEY='.$keys['privateKey']);
    $this->line('VAPID_SUBJECT=mailto:contact@smarter-academy.com');
})->purpose('Generate the Web Push (VAPID) key pair for book-order notifications');
