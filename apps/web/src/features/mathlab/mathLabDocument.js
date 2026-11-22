/**
 * Le DOCUMENT de l’atelier de mathématiques, côté client — logique pure, sans React.
 *
 * Un document est l'enveloppe commune à tous les instruments :
 *
 *     { id, tool, title, schemaVersion, data, createdAt, updatedAt }
 *
 * `data` appartient à l'instrument (`tool`) : la coquille et la persistance
 * le transportent sans le lire. Un document NEUF n'a pas d'`id` : il naît sur
 * le serveur à son premier changement (useMathLabDocument), pas à l'ouverture
 * — ouvrir le tableau et repartir ne laisse aucune ligne vide.
 */

import { withLabScope } from './labScope.js';

export const MATH_LAB_BASE_PATH = '/espace/atelier';

/** Le segment de l’atelier dans un espace de travail : `/espace/atelier`, `/enseignant/atelier`. */
const MATH_LAB_SEGMENT = 'atelier';

/**
 * La racine de l’atelier dans l'espace du lecteur — l'élève ET l'enseignant ont
 * le leur, mêmes instruments, mêmes documents (à chacun les siens).
 * @param {string|null|undefined} workspaceBase  `/espace` ou `/enseignant`
 */
export function mathLabBasePath(workspaceBase) {
  return workspaceBase ? `${workspaceBase}/${MATH_LAB_SEGMENT}` : MATH_LAB_BASE_PATH;
}

/** Le délai entre le dernier changement et la sauvegarde automatique. */
export const MATH_LAB_AUTOSAVE_MS = 2500;

/**
 * L'URL d'un instrument, ou d'un document ouvert dans cet instrument.
 *
 * @param {{slug: string}} tool
 * @param {number | string | null} [documentId]
 * @param {string} [root]    la racine de l’atelier dans l'espace du lecteur
 * @param {string|null} [scope]  l’atelier (`?lab=`), pour un instrument partagé
 */
export function mathLabToolPath(tool, documentId = null, root = MATH_LAB_BASE_PATH, scope = null) {
  const base = `${root}/${tool.slug}`;

  return withLabScope(documentId == null ? base : `${base}/${documentId}`, scope);
}

/**
 * Un document neuf, jamais enregistré.
 *
 * @param {import('./toolContract.js').MathLabTool} tool
 * @param {{title: string, seed?: unknown, scope?: string|null, capabilities?: object|null}} options
 *   `scope` / `capabilities` : l’atelier où il naît (labScope.js) — l'instrument
 *   peut y choisir un état d'ouverture à sa portée.
 */
export function newMathLabDocument(tool, { title, seed, scope = null, capabilities = null }) {
  return {
    id: null,
    tool: tool.id,
    title,
    schemaVersion: tool.schemaVersion,
    data: tool.createInitialData(seed, { scope, capabilities }),
    createdAt: null,
    updatedAt: null,
  };
}

/** Un document tel que l'API le rend, ramené à la forme du client. */
export function fromApiDocument(payload) {
  return {
    id: payload.id,
    tool: payload.tool,
    title: payload.title ?? '',
    schemaVersion: payload.schemaVersion ?? 1,
    data: payload.data ?? null,
    dataBytes: payload.dataBytes ?? 0,
    // Le résumé que l'instrument a fait de cet état — ce que « Mes travaux »
    // dessine. Nul pour un document enregistré avant les résumés.
    summary: payload.summary ?? null,
    isFavorite: payload.isFavorite === true,
    createdAt: payload.createdAt ?? null,
    updatedAt: payload.updatedAt ?? null,
  };
}

export function isPersisted(document) {
  return document != null && document.id != null;
}

/** Un identifiant de route (`:documentId`) → nombre, ou null s'il est absent ou invalide. */
export function parseDocumentId(raw) {
  if (raw == null || raw === '') return null;
  const id = Number(raw);

  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Ce que le serveur reçoit : le titre, toujours propre et borné. */
export function cleanTitle(title, fallback) {
  const clean = String(title ?? '').replace(/\s+/g, ' ').trim();

  return (clean === '' ? fallback : clean).slice(0, 160);
}
