/**
 * LES RÉPONSES GARDÉES POUR L'ÉLÈVE (pilote 2026-11-07, conseil + propriétaire) — logique PURE.
 *   clé d'une question : `m<module>:<empreinte de son texte>` — la même question retrouve sa réponse à chaque visite ; si son texte
 *   change (une leçon corrigée), l'empreinte change et l'ancienne réponse ne s'y accroche pas.
 *   fusion : clé par clé, la plus RÉCENTE (`at`) gagne (deux appareils, un hors ligne).
 */

/** Le texte d'un nœud React (chaînes, nombres, enfants), pour l'empreinte d'une question. */
export function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (typeof node === 'object' && node.props) return textOf(node.props.children);
  return '';
}

/** Une empreinte courte et stable (FNV-1a 32 bits, en base 36). */
export function fingerprint(text) {
  let h = 0x811c9dc5;
  const s = String(text).replace(/\s+/g, ' ').trim();
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

export function answerKey(moduleNumber, parts) {
  return `m${moduleNumber ?? 'x'}:${fingerprint(parts.map(textOf).join('|'))}`;
}

export function mergeAnswers(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b ?? {})) {
    if (!out[k] || (Number(out[k].at) || 0) <= (Number(v?.at) || 0)) out[k] = v;
  }
  return out;
}
