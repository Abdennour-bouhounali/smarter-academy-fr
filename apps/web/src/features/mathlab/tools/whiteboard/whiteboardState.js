/**
 * L'ÉTAT de la سبّورة — logique pure, sans Excalidraw ni DOM.
 *
 * Ce que la سبّورة enregistre est le format « database » d'Excalidraw
 * (`serializeAsJSON(…, 'database')`) : les éléments non supprimés, le
 * sous-ensemble persistant de l'état (fond, grille…), les fichiers. On n'en
 * garde que ces trois clés — ni `type`, ni `source`, ni version d'Excalidraw,
 * qui n'appartiennent pas au document de l'élève.
 *
 *     data = { elements: [...], appState: { viewBackgroundColor, gridSize, gridModeEnabled … }, files: {} }
 *
 * S'y ajoute, FACULTATIVE, la clé `geometry` : l'état du bureau de
 * géométrie (où sont la règle, le compas, la منقلة, le كوس, et les réglages —
 * geometry/instruments.js `sanitizeDesk`). Elle n'existe que si l'élève ou
 * l'enseignant a touché au bureau ; un document plus ancien s'ouvre donc tel
 * quel, et un lecteur qui l'ignore ne perd que la place des instruments —
 * les CONSTRUCTIONS, elles, sont des éléments Excalidraw ordinaires.
 *
 * `WHITEBOARD_SCHEMA_VERSION` est la version de CE format ; Excalidraw
 * garde ses propres versions par élément et sait rouvrir un dessin ancien
 * (`restore`), c'est pour cela qu'une seule version suffit aujourd'hui.
 */

import { sanitizeDesk } from './geometry/instruments.js';

export const WHITEBOARD_SCHEMA_VERSION = 1;

/** Le fond de la سبّورة : blanc, calme — le contenu mathématique est ce qu'on regarde. */
export const WHITEBOARD_BACKGROUND = '#ffffff';

/** L'état neuf. `seed.elements` : des éléments-squelettes fournis par une leçon (openMathLab.js). */
export function createWhiteboardData(seed = undefined) {
  return {
    elements: Array.isArray(seed?.elements) ? seed.elements : [],
    appState: { viewBackgroundColor: WHITEBOARD_BACKGROUND, gridModeEnabled: false },
    files: {},
    // Une amorce n'est pas encore un dessin Excalidraw : la سبّورة la convertit
    // à l'ouverture (convertToExcalidrawElements), puis la marque convertie.
    seeded: Array.isArray(seed?.elements) && seed.elements.length > 0,
  };
}

/**
 * Le JSON « database » d'Excalidraw (déjà parsé) → l'état du document.
 * Ne garde que ce qui est au format ; refuse silencieusement le reste.
 */
export function toWhiteboardData(serialized) {
  const appState = serialized?.appState && typeof serialized.appState === 'object' ? serialized.appState : {};
  const geometry = serialized?.geometry && typeof serialized.geometry === 'object' ? { geometry: sanitizeDesk(serialized.geometry) } : {};

  return {
    elements: Array.isArray(serialized?.elements) ? serialized.elements : [],
    appState: {
      ...appState,
      viewBackgroundColor: typeof appState.viewBackgroundColor === 'string' ? appState.viewBackgroundColor : WHITEBOARD_BACKGROUND,
    },
    // Les octets d'une image ne vivent JAMAIS dans le document : ils sont
    // des fichiers du serveur (attachments), sous quota, et la سبّورة les
    // recharge à l'ouverture. Un dessin qui en porterait (collage, ancien
    // document) les perd ici — c'est voulu, et le canevas le dit.
    files: {},
    ...geometry,
  };
}

/** L'état du document → ce qu'Excalidraw attend dans `initialData`. */
export function toExcalidrawInitialData(data) {
  const safe = toWhiteboardData(data);

  return {
    elements: safe.elements,
    appState: {
      ...safe.appState,
      // Jamais persistés, toujours réinitialisés : la vue s'ouvre sur le dessin.
      collaborators: new Map(),
    },
    files: safe.files,
    scrollToContent: safe.elements.length > 0,
  };
}

/** Une سبّورة sans un seul trait. */
export function isWhiteboardEmpty(data) {
  return !Array.isArray(data?.elements) || data.elements.filter((el) => !el?.isDeleted).length === 0;
}

/**
 * Une signature légère de ce qui compte pour la sauvegarde : la version de
 * scène (bougée par tout changement d'élément) + les réglages persistants.
 * Deux appels d'`onChange` avec la même signature ne déclenchent rien —
 * Excalidraw notifie AUSSI chaque déplacement de la vue, qu'on ne sauve pas.
 *
 * N'entre ici QUE ce que l'on met soi-même dans l'état initial : Excalidraw
 * complète le reste à l'ouverture (`gridSize: 20`, par exemple), et un champ
 * qu'il normalise ferait naître un document « modifié » — donc créé sur le
 * serveur — sans que l'élève ait tracé quoi que ce soit.
 */
export function whiteboardChangeSignature(sceneVersion, appState) {
  return `${sceneVersion}|${appState?.viewBackgroundColor ?? ''}|${appState?.gridModeEnabled ? 1 : 0}`;
}
