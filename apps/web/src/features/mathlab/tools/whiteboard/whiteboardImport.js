/**
 * L'IMPORT d'un fichier sur la سبّورة — logique pure, sans Excalidraw ni DOM.
 *
 * Ce que la سبّورة importe : une BIBLIOTHÈQUE D'ANIMATIONS/FORMES d'Excalidraw
 * (`.excalidrawlib`, du JSON `{ type: "excalidrawlib", version: 1 | 2,
 * libraryItems: [...] }`). C'est le seul format de fichier que l'outil
 * acceptait déjà (le menu « فتح » de sa bibliothèque) ; rien d'autre n'est
 * ajouté ici, on le rend seulement fiable.
 *
 * Pourquoi ce module existe : le menu d'Excalidraw ouvre un sélecteur SANS
 * filtre et ramène TOUT échec — image choisie, JSON invalide, sélecteur
 * indisponible — au même « تعذر تحميل المكتبة », sans rien journaliser. Ici
 * chaque refus a un CODE (`WhiteboardImportError.code`) que la coquille
 * traduit (`shell.importErrors.<code>` dans mathlab.json), et la cause
 * technique reste attachée (`cause`) pour la console.
 */

/** Ce que le sélecteur de fichiers propose : la bibliothèque, et le JSON qui la porte. */
export const WHITEBOARD_IMPORT_ACCEPT = '.excalidrawlib,application/json';

/** Même borne que le document côté serveur (MathLabTools::maxBytes). */
export const WHITEBOARD_IMPORT_MAX_BYTES = 2_000_000;

export const IMPORT_ERROR_CODES = Object.freeze([
  'empty', 'tooLarge', 'image', 'scene', 'invalidJson', 'notLibrary', 'noItems', 'unreadable', 'failed',
]);

export class WhiteboardImportError extends Error {
  constructor(code, cause = undefined) {
    super(`whiteboard import: ${code}`);
    this.name = 'WhiteboardImportError';
    this.code = code;
    this.cause = cause;
  }
}

const extensionOf = (name) => {
  const match = /\.([a-z0-9]+)$/i.exec(String(name ?? ''));

  return match ? match[1].toLowerCase() : '';
};

/**
 * Ce qu'un fichier EST, d'après son nom et son type MIME :
 * 'library' | 'scene' | 'image' | 'unknown'.
 */
export function classifyImportFile(file) {
  const ext = extensionOf(file?.name);
  const type = String(file?.type ?? '');
  if (ext === 'excalidrawlib') return 'library';
  if (ext === 'excalidraw') return 'scene';
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(ext)) return 'image';

  return 'unknown';
}

/**
 * Les refus qu'on peut prononcer AVANT de lire le fichier : vide, trop
 * lourd, une image, un dessin. Un fichier inconnu (`.json`, `.txt`…) passe :
 * c'est son contenu qui décidera.
 *
 * @throws {WhiteboardImportError}
 */
export function checkImportFile(file) {
  if (!file || !(file.size > 0)) throw new WhiteboardImportError('empty');
  if (file.size > WHITEBOARD_IMPORT_MAX_BYTES) throw new WhiteboardImportError('tooLarge');
  const kind = classifyImportFile(file);
  if (kind === 'image') throw new WhiteboardImportError('image');
  if (kind === 'scene') throw new WhiteboardImportError('scene');

  return kind;
}

/**
 * Le texte d'un fichier → les éléments de bibliothèque qu'il contient.
 * Même règle qu'Excalidraw (`isValidLibrary`) : type `excalidrawlib`,
 * version 1 ou 2, `libraryItems` (v2) ou `library` (v1).
 *
 * @returns {unknown[]} les éléments, à restaurer par Excalidraw
 * @throws {WhiteboardImportError}
 */
export function parseLibraryText(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (cause) {
    throw new WhiteboardImportError('invalidJson', cause);
  }
  if (!data || typeof data !== 'object' || data.type !== 'excalidrawlib' || !(data.version === 1 || data.version === 2)) {
    throw new WhiteboardImportError('notLibrary');
  }
  const items = data.libraryItems ?? data.library;
  if (!Array.isArray(items)) throw new WhiteboardImportError('notLibrary');
  if (items.length === 0) throw new WhiteboardImportError('noItems');

  return items;
}
