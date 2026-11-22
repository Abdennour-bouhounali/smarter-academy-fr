import { apiRequest, ApiError, classifyStatus } from './apiClient';
import { apiMessage } from './apiMessage';

/**
 * Transport du مختبر الرياضيات (Math Lab) — même forme que practiceService.js.
 *
 * Un document = { id, tool, title, schemaVersion, dataBytes, createdAt,
 * updatedAt, data? }. `data` est l'état sérialisé de l'INSTRUMENT (la سبّورة
 * aujourd'hui) : le serveur le stocke sans le lire, le client le confie à
 * l'outil qui l'a produit. La liste ne porte pas `data` ; la lecture d'un
 * document, si.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function call(path, options, messageKey) {
  const { ok, status, data } = await apiRequest(path, options);
  if (!ok) {
    throw refusal(data, status, messageKey);
  }

  return data;
}

/**
 * Un refus du serveur, avec son CODE : c'est lui que le client lit pour
 * choisir sa phrase (attachmentPolicy.errorKeyFrom), jamais `message`. Le
 * corps entier reste attaché (`data`) — les quotas y sont, à jour.
 */
function refusal(data, status, messageKey) {
  const error = new ApiError(apiMessage(messageKey, data, status), classifyStatus(status), status);
  error.code = typeof data?.code === 'string' ? data.code : null;
  error.data = data ?? null;

  return error;
}

const headers = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

const withBody = (token, method, body) => ({ method, headers: headers(token), body: JSON.stringify(body) });

/** « Mes travaux » : mes documents, tous instruments ou un seul, sans leur état. */
export function fetchMathLabDocuments(token, tool = null) {
  const query = tool ? `?tool=${encodeURIComponent(tool)}` : '';

  return call(`/math-lab/documents${query}`, { headers: headers(token) }, 'mathLabLoad');
}

/** Un document avec son état — 404 s'il n'est pas à moi. */
export function fetchMathLabDocument(token, id) {
  return call(`/math-lab/documents/${encodeURIComponent(id)}`, { headers: headers(token) }, 'mathLabLoad');
}

/** @param {{tool: string, title: string, schemaVersion: number, data: object}} document */
export function createMathLabDocument(token, document) {
  return call('/math-lab/documents', withBody(token, 'POST', document), 'mathLabSave');
}

/** @param {{title?: string, schemaVersion?: number, data?: object}} patch */
export function updateMathLabDocument(token, id, patch) {
  return call(`/math-lab/documents/${encodeURIComponent(id)}`, withBody(token, 'PATCH', patch), 'mathLabSave');
}

export function deleteMathLabDocument(token, id) {
  return call(`/math-lab/documents/${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers(token) }, 'mathLabDelete');
}

/** Une COPIE d'un de mes documents — même instrument, même état, titre neuf. */
export function duplicateMathLabDocument(token, id, title) {
  return call(
    `/math-lab/documents/${encodeURIComponent(id)}/duplicate`,
    withBody(token, 'POST', title ? { title } : {}),
    'mathLabSave',
  );
}

/**
 * Le même geste sur une SÉLECTION : `delete`, `favorite`, `unfavorite`.
 * La propriété est tenue par le serveur, jamais par cette liste.
 */
export function bulkMathLabDocuments(token, ids, action) {
  return call('/math-lab/documents/bulk', withBody(token, 'POST', { ids, action }), action === 'delete' ? 'mathLabDelete' : 'mathLabSave');
}

// ── Les fichiers d'une سبّورة ─────────────────────────────────────────────
// Un fichier = { id, documentId, kind, name, mimeType, size, createdAt } ;
// chaque réponse porte `quota` = { document: {used, max} | null, user: {used, max}, limits }.

/** Les fichiers d'un document et les compteurs du moment. */
export function fetchMathLabFiles(token, documentId) {
  return call(`/math-lab/documents/${encodeURIComponent(documentId)}/files`, { headers: headers(token) }, 'mathLabFiles');
}

/** Les compteurs de l'élève seul — pour une سبّورة pas encore enregistrée. */
export function fetchMathLabQuota(token) {
  return call('/math-lab/quota', { headers: headers(token) }, 'mathLabFiles');
}

/**
 * UN fichier vers un document. `multipart/form-data`, sans en-tête
 * Content-Type : le navigateur pose la frontière lui-même.
 */
export function uploadMathLabFile(token, documentId, file) {
  const body = new FormData();
  body.append('file', file, file.name);

  return call(
    `/math-lab/documents/${encodeURIComponent(documentId)}/files`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body },
    'mathLabFiles',
  );
}

export function deleteMathLabFile(token, id) {
  return call(`/math-lab/files/${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers(token) }, 'mathLabFiles');
}

/** Les octets d'un fichier, au propriétaire — un Blob, pas du JSON. */
export async function fetchMathLabFileBlob(token, id) {
  let response;
  try {
    response = await fetch(`${API_URL}/math-lab/files/${encodeURIComponent(id)}/content`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new ApiError(apiMessage('network'), 'NETWORK_ERROR');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw refusal(data, response.status, 'mathLabFiles');
  }

  return response.blob();
}
