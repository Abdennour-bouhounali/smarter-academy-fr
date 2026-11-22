/**
 * La politique des fichiers du مختبر, côté client — logique pure.
 *
 * COPIE de App\Domain\MathLab\MathLabFilePolicy (le serveur fait foi ;
 * `attachmentPolicy.test.js` vérifie que les deux disent la même chose).
 * Ici on refuse AVANT d'envoyer, pour épargner un aller-retour et parler
 * tout de suite ; là-bas on refuse quoi qu'il arrive.
 *
 * « 1 Mo » est la valeur PRODUIT : 1 000 000 octets — le nombre que l'élève
 * lit dans le message est le nombre que l'on compte.
 */

export const MAX_FILE_BYTES = 1_000_000;
export const MAX_FILES_PER_DOCUMENT = 3;
export const MAX_FILES_PER_USER = 50;

/** Ce qui devient un FICHIER de la سبّورة (une ligne, des octets, un quota). */
export const ATTACHMENT_KINDS = Object.freeze({ png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', svg: 'svg', pdf: 'pdf' });

/** Ce qui se FOND dans la سبّورة (formes, dessin) sans devenir un fichier. */
const IMPORT_KINDS = Object.freeze({ excalidrawlib: 'library', excalidraw: 'scene', json: 'json' });

export const ATTACHMENT_ACCEPT = '.png,.jpg,.jpeg,.webp,.svg,.pdf,.excalidraw,.excalidrawlib,.json';

/** Les codes du serveur → les clés de `files.errors.*` (mathlab.json). */
const SERVER_ERROR_CODES = Object.freeze({
  math_lab_file_too_large: 'tooLarge',
  math_lab_file_unsupported: 'unsupported',
  math_lab_board_file_limit: 'boardLimit',
  math_lab_user_file_limit: 'userLimit',
  math_lab_upload_failed: 'uploadFailed',
  math_lab_file_not_found: 'notFound',
  math_lab_document_not_found: 'notFound',
});

const extensionOf = (name) => {
  const match = /\.([a-z0-9]+)$/i.exec(String(name ?? ''));

  return match ? match[1].toLowerCase() : '';
};

/**
 * @returns {{group: 'attachment'|'import'|'unsupported', kind: string|null, extension: string}}
 */
export function classifyFile(file) {
  const extension = extensionOf(file?.name);
  if (ATTACHMENT_KINDS[extension]) return { group: 'attachment', kind: ATTACHMENT_KINDS[extension], extension };
  if (IMPORT_KINDS[extension]) return { group: 'import', kind: IMPORT_KINDS[extension], extension };

  return { group: 'unsupported', kind: null, extension };
}

/** Ce qui reste à ajouter : le plus serré des deux quotas, jamais négatif. */
export function remainingSlots(quota) {
  const doc = quota?.document ? quota.document.max - quota.document.used : Infinity;
  const user = quota?.user ? quota.user.max - quota.user.used : Infinity;

  return Math.max(0, Math.min(doc, user));
}

export const isDocumentFull = (quota) => Boolean(quota?.document) && quota.document.used >= quota.document.max;
export const isUserFull = (quota) => Boolean(quota?.user) && quota.user.used >= quota.user.max;

/**
 * Le PLAN d'une sélection, décidé avant le premier envoi : tout ou rien.
 * Un seul fichier refusé (type, taille) ou un quota dépassé refuse la
 * sélection entière — on n'envoie pas la moitié pour découvrir ensuite que
 * la place manquait.
 *
 * @param {File[]} files
 * @param {{document?: {used:number,max:number}, user?: {used:number,max:number}}|null} quota
 * @returns {{attachments: File[], imports: {file: File, kind: string}[], error: {code: string, name?: string, count?: number}|null}}
 */
export function planSelection(files, quota) {
  const attachments = [];
  const imports = [];
  for (const file of files) {
    const { group, kind } = classifyFile(file);
    if (group === 'unsupported') return { attachments: [], imports: [], error: { code: 'unsupported', name: file.name } };
    if (group === 'attachment') {
      if (!(file.size > 0)) return { attachments: [], imports: [], error: { code: 'empty', name: file.name } };
      if (file.size > MAX_FILE_BYTES) return { attachments: [], imports: [], error: { code: 'tooLarge', name: file.name } };
      attachments.push(file);
    } else {
      imports.push({ file, kind });
    }
  }

  if (attachments.length > 0) {
    const remaining = remainingSlots(quota);
    if (remaining === 0) {
      return { attachments: [], imports: [], error: { code: isDocumentFull(quota) ? 'boardLimit' : 'userLimit' } };
    }
    if (attachments.length > remaining) {
      return { attachments: [], imports: [], error: { code: 'selectionTooMany', count: remaining } };
    }
  }

  return { attachments, imports, error: null };
}

/** Une erreur d'API → une clé de `files.errors.*`. */
export function errorKeyFrom(error) {
  if (error?.code && SERVER_ERROR_CODES[error.code]) return SERVER_ERROR_CODES[error.code];
  if (error?.type === 'NETWORK_ERROR') return 'network';
  if (error?.status === 404) return 'notFound';
  if (error?.status === 401 || error?.status === 403) return 'unauthorized';

  return 'uploadFailed';
}

/** 245 678 → { value: '246', unit: 'kb' } — en base 1000, comme « 1 Mo ». */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1000) return { value: String(n), unit: 'b' };
  if (n < 1_000_000) return { value: String(Math.round(n / 1000)), unit: 'kb' };

  // Arrondi sur un entier (pas `toFixed`, qui rend 1,45 → « 1.4 » par le flottant).
  const tenths = Math.round(n / 100_000) / 10;

  return { value: String(n < 10_000_000 ? tenths : Math.round(tenths)), unit: 'mb' };
}
