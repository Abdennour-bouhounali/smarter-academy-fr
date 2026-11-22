/**
 * Meta Pixel — LIMITÉ aux pages de la librairie (`/books/:slug`, 2026-11-13).
 *
 * Pourquoi seulement là : c'est la page où arrivent les publicités Facebook. Le reste de la
 * plateforme (espace élève, espace parent, administration) ne charge JAMAIS ce script :
 * la promesse faite aux parents est qu'aucun site tiers n'observe un élève (PARENT_SPACE.md,
 * « jardin clos »). Aucune donnée personnelle (nom, téléphone, adresse) n'est envoyée :
 * seulement le nom de l'événement, le titre du livre, la valeur et la devise.
 *
 * Événements : PageView + ViewContent (arrivée sur la fiche), InitiateCheckout (premier
 * champ du formulaire touché), Lead (commande envoyée — « Lead » et non « Purchase » :
 * la vente n'est définitive qu'après l'appel et la livraison).
 *
 * En local (localhost) rien n'est envoyé, sauf avec `?pixel=1` dans l'URL (test).
 */
const META_PIXEL_ID = '29440028942323985';

function allowed() {
  if (typeof window === 'undefined') return false;
  const { hostname, search } = window.location;
  const local = hostname === 'localhost' || hostname === '127.0.0.1';
  return !local || /[?&]pixel=1\b/.test(search);
}

/** Le code officiel de Meta (init sans PageView : la fiche envoie ses événements elle-même). */
function loadMetaPixel() {
  if (!allowed() || window.fbq) return;
  // eslint-disable-next-line
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));
  window.fbq('init', META_PIXEL_ID);
}

export function trackPixel(event, params) {
  if (!allowed()) return;
  loadMetaPixel();
  if (window.fbq) window.fbq('track', event, params);
}
