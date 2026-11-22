// La vitrine des livres, SANS cascade (2026-10-17).
//
// Avant : entrée → lot de la page → `/books/:slug` → rendu → image de couverture,
// quatre étapes l'une après l'autre ; et chaque retour à la liste ou à la fiche
// redemandait tout. Mesuré sur tablette (1,6 Mbit/s) : fiche prête à 3,8 s,
// décalage de mise en page 0,44.
//
// Maintenant : la requête de données part EN MÊME TEMPS que le lot de la page
// (App.jsx la lance dans le `lazy()` de la route), la liste précharge la fiche
// d'un livre au survol de sa carte, et une réponse déjà reçue est servie tout de
// suite (gardée 5 minutes ; un échec n'est pas gardé).
//
// Ce module est importé par App.jsx (entrée) : il ne dépend que d'apiClient.
// Voir docs/architecture/BOOKS_STORE.md et BUNDLE_BOUNDARIES.md.
import { apiRequest, ApiError, classifyStatus } from '../../services/apiClient';

const cache = new Map(); // chemin → Promise<data>
const resolved = new Map(); // chemin → data déjà reçue (rendu immédiat, sans état « chargement »)

// Au-delà, on redemande (la fiche déjà reçue reste affichée en attendant) : une
// modification faite dans l'admin atteint la vitrine sans recharger l'onglet.
const FRESH_MS = 5 * 60 * 1000;
const fetchedAt = new Map();

function load(path, fallback) {
  if (cache.has(path) && Date.now() - (fetchedAt.get(path) ?? 0) > FRESH_MS) cache.delete(path);
  if (!cache.has(path)) {
    fetchedAt.set(path, Date.now());
    const promise = apiRequest(path).then(({ ok, status, data }) => {
      if (!ok) throw new ApiError(data?.message || fallback, classifyStatus(status), status);
      resolved.set(path, data);
      return data;
    });
    promise.catch(() => cache.delete(path));
    cache.set(path, promise);
  }
  return cache.get(path);
}

// L'INSTANTANÉ écrit dans le HTML de la page d'un livre au build
// (vite-plugin-share-pages.js) : la fiche s'affiche sans attendre l'API. Il n'est
// PAS mis dans `cache` : le premier `loadBook` relit quand même le serveur, et la
// page se met à jour si le livre a changé depuis le build (prix compris).
if (typeof window !== 'undefined' && window.__SA_BOOK_SNAPSHOT__?.path) {
  resolved.set(window.__SA_BOOK_SNAPSHOT__.path, window.__SA_BOOK_SNAPSHOT__.data);
}

/**
 * Retire le premier écran HTML de la fiche (#sa-static-shell, posé au-dessus de
 * #root par le build) une fois la vraie page affichée dessous.
 */
export function removeStaticBookShell() {
  if (typeof document === 'undefined') return;
  document.getElementById('sa-static-shell')?.remove();
}

/** La réponse déjà reçue, ou undefined. */
export const peekBooks = () => resolved.get('/books');
export const peekBook = (slug) => resolved.get(`/books/${encodeURIComponent(slug)}`);

export const loadBooks = () => load('/books', 'Impossible de charger les livres.');
export const loadBook = (slug) => load(`/books/${encodeURIComponent(slug)}`, 'Livre introuvable.');

/** La fiche d'un livre et le code de sa page, avant le clic. */
export function prefetchBookPage(slug) {
  loadBook(slug).catch(() => {});
  import('./BookDetailPage').catch(() => {});
}

/** Appelé par les `lazy()` des routes : lance les données de l'URL courante avec le lot. */
export function prefetchBooksForLocation() {
  if (typeof window === 'undefined') return;
  const { pathname } = window.location;
  if (pathname === '/books') loadBooks().catch(() => {});
  const match = pathname.match(/^\/books\/([^/]+)\/?$/);
  if (match) loadBook(decodeURIComponent(match[1])).catch(() => {});
}
