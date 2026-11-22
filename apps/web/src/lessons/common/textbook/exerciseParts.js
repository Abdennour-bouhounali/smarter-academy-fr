/**
 * « Pas d'aller-retour » (propriétaire, 2026-11-11) — les PARTIES d'un exercice du manuel (`ex-21-1`, `ex-21-2`, …) sont des
 * exercices à part : seule la première porte l'énoncé. Dans le lecteur de mission, chaque partie a son écran ; « 2) B = » ou
 * « 3) الطول LP » se lisaient sans les expressions ni les longueurs de l'énoncé, restées sur l'écran de la partie 1.
 *
 * withContext(parts) : chaque partie SANS énoncé reçoit `context` = l'énoncé de la première (TextbookExercise le montre, dans le
 * lecteur seulement, en tête de sa carte). Pur, sans React : importé PAR CHEMIN depuis le `content/exercises.js` d'une leçon
 * (`partsOf`). Les parties qui ont leur propre énoncé, et un exercice d'une seule partie, sont rendus tels quels.
 */
export function withContext(parts) {
  const first = parts.find((p) => p.statement);
  if (!first || parts.length < 2) return parts;
  return parts.map((p) => (p.statement || p === first ? p : { ...p, context: first.statement }));
}
