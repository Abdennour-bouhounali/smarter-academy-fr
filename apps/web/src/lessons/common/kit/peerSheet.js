/**
 * « ورقة زميل » — la copie d'un camarade (inventé) qui contient UNE erreur (conseil + propriétaire, 2026-11-08, PILOTE).
 * Logique PURE — PeerSheet.jsx l'affiche. Trois temps :
 *   find : l'élève touche la ligne où l'erreur COMMENCE (au plus `tries` essais ; après, la ligne est montrée) ;
 *   fix  : il choisit la correction parmi des options — chaque mauvaise option porte son `why` (l'idée fausse qu'elle trahit) ;
 *   done : la ligne fautive barrée, la ligne corrigée en vert, et pourquoi l'erreur arrive. On finit TOUJOURS sur la bonne ligne.
 *
 * Une feuille : { id, lines: [string], errorLine: index, fixes: [{ text, ok?, why? }], tries?: 2 }
 */
import { checkpointOrder } from '../mission/missionModel.js';

const PEER_TRIES = 2;

/**
 * L'ordre d'AFFICHAGE des corrections : tiré de l'id de la feuille (stable d'un rechargement à l'autre, jamais l'ordre écrit) — la bonne
 * correction était toujours la première de chaque feuille (revue ECC 2026-11-10). Les indices restent ceux de `sheet.fixes`.
 */
export const peerFixOrder = (sheet) => checkpointOrder(sheet.id, sheet.fixes.length);

export const startSheet = () => ({ phase: 'find', misses: 0, wrongLines: [], shown: false, foundFirst: false, wrongFixes: [] });

/** L'élève touche une ligne de la copie. */
export function tapLine(state, index, sheet) {
  if (state.phase !== 'find' || state.wrongLines.includes(index)) return state;
  if (index === sheet.errorLine) return { ...state, phase: 'fix', foundFirst: state.misses === 0 };
  const misses = state.misses + 1;
  const next = { ...state, misses, wrongLines: [...state.wrongLines, index] };
  // épuisé : la ligne est MONTRÉE et l'élève passe quand même à la correction (il ne reste jamais bloqué)
  return misses >= (sheet.tries ?? PEER_TRIES) ? { ...next, phase: 'fix', shown: true } : next;
}

/** L'élève choisit une correction. */
export function pickFix(state, index, sheet) {
  if (state.phase !== 'fix' || state.wrongFixes.includes(index)) return state;
  if (sheet.fixes[index]?.ok) return { ...state, phase: 'done', fixedWith: index };
  return { ...state, wrongFixes: [...state.wrongFixes, index] };
}

/** La correction juste (il en faut exactement une). */
export const rightFix = (sheet) => sheet.fixes.findIndex((f) => f.ok);
