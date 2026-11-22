import { Suspense, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Route } from 'react-router-dom';
import { getBuiltLessons, loadLessonRoutesFactory } from './registry';
import { loadLessonRuntimeCore } from './common/lessonRuntimeLoader';
import { loadLessonManipulationStrings } from '../i18n/lessonManipulationStrings';
import { useLearningViewer } from '../features/learning/learningViewer';
import LessonWaiting, { useOpensWorld } from './LessonWaiting';
import { preloadWorld } from './worldPreload';

/**
 * Un chemin de MODULE (pas le sommaire) : la page qui s'ouvrira attend les textes
 * des labs — on les demande tout de suite, en parallèle des routes, au lieu de
 * les découvrir après le rendu (un aller-retour et ≈ 137 Ko plus tard).
 */
function startStringsIfModule(pathname, basePath) {
  if (pathname !== basePath && pathname !== `${basePath}/`) loadLessonManipulationStrings().catch(() => {});
}

/**
 * LA FRONTIÈRE DE ROUTES DES LEÇONS — une seule pour toutes les leçons (2026-10-14).
 *
 * Avant : App.jsx importait STATIQUEMENT le routes.jsx de chaque leçon (74
 * imports), et chacun sa lesson.config.js — chaque leçon publiée coûtait
 * ≈ 4,5 Ko gzip à CHAQUE visiteur, page d'accueil comprise.
 *
 * Maintenant, App.jsx appelle `useLessonRoutes()` et monte ce qu'il rend :
 *
 *   - une leçon PAS ENCORE CHARGÉE → UNE route `<basePath>/*` (son chemin vient
 *     de l'index léger, registry.js) dont l'élément charge son routes.jsx (et
 *     donc sa config) sous un <Suspense>, et lance en parallèle le runtime de
 *     leçon. Les textes des manipulations ne bloquent PLUS (2026-10-17) : les
 *     pages de module les attendent, le sommaire s'affiche sans eux ;
 *   - une leçon CHARGÉE → SES PROPRES routes, exactement celles que son
 *     routes.jsx fabrique (buildLessonRoutes) : coquille du mode classe en
 *     route « layout », sommaire, un module par fichier. La route `/*` d'attente
 *     disparaît.
 *
 * Le passage de l'une à l'autre est un nouveau rendu des routes d'App
 * (useSyncExternalStore) : l'URL ne change pas, la route réelle prend le
 * relais. D'où les garanties d'avant, inchangées : liens profonds, une URL de
 * module inconnue retombe sur `*` (une fois la leçon chargée, plus rien
 * n'attrape `/*`), la coquille du mode classe reste montée d'un module à
 * l'autre, l'ancre du cahier et la carte des connaissances lisent la config
 * déjà chargée. scripts/check-routes.mjs vérifie le montage.
 *
 * Ce fichier est importé par App.jsx : il n'importe rien de lourd (l'index
 * léger, React Router, le chargeur de textes). Voir
 * docs/architecture/BUNDLE_BOUNDARIES.md (§3 « Lesson route boundary »).
 */

/**
 * A STUDENT is looking (not a teacher, whose lesson home is his card): a lesson he points at or opens will be its game
 * world, so the world travels WITH the routes (worldPreload.js) instead of being discovered four downloads later.
 * Written by `useLessonRoutes` at each render — the delegated listener below has no React context to ask.
 */
let viewerPlaysWorlds = false;

const loadedRoutes = new Map(); // id → l'arbre <Route> de la leçon
const pending = new Map(); // id → Promise
const failures = new Map(); // id → Error (rendue une fois, comme un lazy() en échec)
const listeners = new Set();
let version = 0;

function notify() {
  version += 1;
  for (const listener of listeners) listener();
}
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const getVersion = () => version;

/**
 * Charge les routes d'une leçon (et lance le runtime). Idempotent ;
 * utilisable comme préchargement (survol d'une carte de leçon).
 * @returns {Promise<void>}
 */
function loadLessonRoutes(lessonId) {
  if (loadedRoutes.has(lessonId)) return Promise.resolve();
  if (!pending.has(lessonId)) {
    // Le runtime part EN MÊME TEMPS que les routes (sinon : routes → runtime →
    // page, un aller-retour de plus). Les textes des labs ne bloquent plus : les
    // pages de module les attendent elles-mêmes (et partent dès maintenant pour
    // une URL de module), le sommaire s'en passe et les précharge une fois
    // affiché (LessonIndex › prefetchLessonStringsWhenIdle) (2026-10-17).
    loadLessonRuntimeCore().catch(() => {});
    if (viewerPlaysWorlds) preloadWorld(lessonId);
    const promise = loadLessonRoutesFactory(lessonId)
      .then((factory) => {
        if (typeof factory !== 'function') throw new Error(`Lesson routes not found: ${lessonId}`);
        loadedRoutes.set(lessonId, factory());
        notify();
      })
      .catch((error) => { failures.set(lessonId, error); })
      .finally(() => pending.delete(lessonId));
    pending.set(lessonId, promise);
  }
  return pending.get(lessonId);
}

/**
 * L'id de la leçon qu'ouvre ce chemin (sommaire ou module), ou null.
 * @param {string} pathname
 */
function lessonIdForPath(pathname) {
  for (const { id, basePath } of getBuiltLessons()) {
    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return id;
  }
  return null;
}

let intentPrefetchInstalled = false;

/**
 * PRÉCHARGEMENT À L'INTENTION (2026-10-17) : survoler, viser au doigt ou
 * atteindre au clavier N'IMPORTE QUEL lien vers une leçon (carte d'unité,
 * « واصل », « دروسي », lien de prérequis…) lance le chargement de ses routes et
 * du runtime. Le clic, ≈ 100–300 ms plus tard, trouve le code déjà en route.
 * Un seul écouteur délégué sur le document, posé une fois ; rien n'est chargé
 * pour un lien qui ne mène pas à une leçon.
 */
function installIntentPrefetch() {
  if (intentPrefetchInstalled || typeof document === 'undefined') return;
  intentPrefetchInstalled = true;
  const seen = new WeakSet();
  const onIntent = (event) => {
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor || seen.has(anchor)) return;
    seen.add(anchor);
    let url;
    try { url = new URL(anchor.href, window.location.href); } catch { return; }
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/courses/')) return;
    const id = lessonIdForPath(url.pathname);
    if (!id) return;
    loadLessonRoutes(id);
    startStringsIfModule(url.pathname, getBuiltLessons().find((l) => l.id === id)?.basePath);
  };
  document.addEventListener('pointerover', onIntent, { passive: true });
  document.addEventListener('touchstart', onIntent, { passive: true });
  document.addEventListener('focusin', onIntent);
}

/** L'élément de la route d'attente : suspend jusqu'à l'arrivée des routes réelles. */
function LessonRoutesLoader({ lessonId, basePath }) {
  // « جرّب كتلميذ » : l'enseignant ouvre le monde lui aussi — même préchargement (idempotent).
  if (useOpensWorld(lessonId)) preloadWorld(lessonId);
  if (loadedRoutes.has(lessonId)) return <LessonWaiting lessonId={lessonId} />; // App remonte les routes réelles
  if (typeof window !== 'undefined') startStringsIfModule(window.location.pathname, basePath);
  if (failures.has(lessonId)) {
    const error = failures.get(lessonId);
    failures.delete(lessonId);
    throw error; // comme un lazy() dont le lot n'arrive pas
  }
  throw loadLessonRoutes(lessonId);
}

/**
 * Les <Route> de toutes les leçons construites, à placer dans <Routes> là où
 * étaient les 74 appels `{xxxRoutes()}` (sous CourseLayout › RequireAccount).
 * @returns {JSX.Element[]}
 */
export function useLessonRoutes() {
  const current = useSyncExternalStore(subscribe, getVersion, getVersion);
  viewerPlaysWorlds = !useLearningViewer().freeNavigation;
  useEffect(installIntentPrefetch, []);
  return useMemo(
    () => getBuiltLessons().map(({ id, basePath }) => loadedRoutes.get(id) ?? (
      <Route
        key={`${id}-lazy`}
        path={`${basePath}/*`}
        element={<Suspense fallback={<LessonWaiting lessonId={id} />}><LessonRoutesLoader lessonId={id} basePath={basePath} /></Suspense>}
      />
    )),
    // `current` : un nouveau tableau à chaque leçon chargée.
    [current],
  );
}
