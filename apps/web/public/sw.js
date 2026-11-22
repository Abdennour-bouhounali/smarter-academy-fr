/*
 * Service worker de Smarter Academy — UNIQUEMENT les notifications du tableau de bord
 * (commandes, inscriptions, messages, بلاغات… — BOOKS_STORE.md §6quater). Il n'est enregistré
 * que sur l'appareil d'un administrateur ou d'un « مسيّر المكتبة » qui active les notifications,
 * jamais chez un élève.
 *
 * Volontairement SANS gestionnaire `fetch` : il ne met rien en cache et ne touche à aucune
 * page (le site reste servi exactement comme sans lui).
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: 'طلب جديد', body: event.data && event.data.text() }; }
  const title = data.title || 'طلب جديد';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    tag: data.tag || 'book-order',
    renotify: true,
    dir: 'rtl',
    lang: 'ar',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/admin' },
  }));
});

// Toucher la notification ouvre la commande (dans un onglet déjà ouvert du site si possible).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/admin', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin && 'navigate' in client) {
        await client.focus();
        return client.navigate(url);
      }
    }
    return self.clients.openWindow(url);
  })());
});
