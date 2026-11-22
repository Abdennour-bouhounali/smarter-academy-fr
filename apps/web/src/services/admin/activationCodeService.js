import { call, get, send, query } from './adminClient';

/**
 * Les codes d'activation, côté administration.
 *
 * Le jeton est toujours le PREMIER argument et n'est jamais lu depuis un
 * contexte React : c'est ce qui garde ces fonctions testables sans monter
 * l'application, comme le reste de services/admin/.
 */

export function fetchActivationCodes(token, filters = {}) {
  return call(
    `/admin/activation-codes${query(filters)}`,
    get(token),
    'Impossible de charger les codes d’activation.',
  );
}

export function fetchActivationBatches(token, filters = {}) {
  return call(
    `/admin/activation-codes/batches${query(filters)}`,
    get(token),
    'Impossible de charger les lots.',
  );
}

export function fetchActivationCode(token, id) {
  return call(
    `/admin/activation-codes/${encodeURIComponent(id)}`,
    get(token),
    'Impossible de charger ce code.',
  );
}

/**
 * Produit un lot, et rend ses codes EN CLAIR — la seule et unique fois.
 *
 * La réponse porte `codesShownOnce: true` : la base ne garde qu'une empreinte,
 * donc ces codes ne pourront plus jamais être relus. L'appelant DOIT les
 * montrer et proposer de les enregistrer avant de fermer sa fenêtre.
 */
export function generateActivationBatch(token, payload) {
  return call(
    '/admin/activation-codes/batches',
    send('POST', token, payload),
    'Impossible de générer le lot.',
  );
}

export function revokeActivationCode(token, id, reason) {
  return call(
    `/admin/activation-codes/${encodeURIComponent(id)}/revoke`,
    send('POST', token, { reason }),
    'Impossible de révoquer ce code.',
  );
}

export function revokeActivationBatch(token, id, reason) {
  return call(
    `/admin/activation-codes/batches/${encodeURIComponent(id)}/revoke`,
    send('POST', token, { reason }),
    'Impossible de révoquer ce lot.',
  );
}

/**
 * Télécharge l'export CSV — des MÉTADONNÉES, jamais des codes.
 *
 * Passe par `fetch` plutôt que par une balise <a> : le point d'entrée exige
 * un en-tête Authorization, qu'une navigation ordinaire n'enverrait pas.
 * Le fichier est reconstruit côté navigateur depuis le flux reçu.
 */
export async function downloadActivationCodesCsv(token, filters = {}) {
  // Même résolution que apiClient.js — une seule définition de l'URL
  // de base serait mieux, mais apiClient n'expose pas la sienne et cette
  // requête ne peut pas passer par lui (elle rend un flux, pas du JSON).
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const response = await fetch(`${base}/admin/activation-codes/export${query(filters)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Impossible d’exporter les codes.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `codes-activation-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Le CSV des codes tout juste produits, construit DANS LE NAVIGATEUR.
 *
 * Volontairement pas un appel au serveur : celui-ci n'a plus les codes en
 * clair, et une route qui les rendrait à nouveau détruirait la garantie
 * centrale du modèle. Le seul endroit au monde où ces codes existent en clair
 * est la réponse de génération, en mémoire dans cet onglet.
 */
export function downloadGeneratedCodesCsv(batch, codes) {
  const header = ['lot', 'code', 'indice'];
  const rows = codes.map((code) => [batch?.label ?? '', code.code, code.hint]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Le BOM : sans lui, Excel lit l'UTF-8 comme du latin-1.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const slug = (batch?.label ?? 'lot').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  link.download = `codes-${slug}-${batch?.id ?? ''}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
