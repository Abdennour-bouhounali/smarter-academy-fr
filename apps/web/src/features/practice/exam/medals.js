export const MEDAL_POINTS = Object.freeze({ gold: 3, silver: 2, bronze: 1 });

const SUCCESS = new Set(['correct', 'equivalent_correct']);

/**
 * @param {{outcome: string, answerType?: string, hintsUsed?: number, seconds?: ?number, limit?: ?number, evaluatedBy?: ?string}} a
 * @returns {'gold'|'silver'|'bronze'|null}
 */
export function medalFor({ outcome, answerType, hintsUsed = 0, seconds = null, limit = null, evaluatedBy = null }) {
  if (evaluatedBy === 'self' || (answerType === 'selfCheck' && evaluatedBy !== 'teacher')) return null;
  if (!SUCCESS.has(outcome)) return null;
  const late = Number.isFinite(seconds) && Number.isFinite(limit) && seconds > limit;
  const faults = Math.max(0, hintsUsed | 0) + (late ? 1 : 0);
  return faults === 0 ? 'gold' : faults === 1 ? 'silver' : 'bronze';
}

/** POURQUOI cette médaille — la clé du petit mot de la célébration. */
export function medalReason({ hintsUsed = 0, seconds = null, limit = null }) {
  const late = Number.isFinite(seconds) && Number.isFinite(limit) && seconds > limit;
  const hints = Math.max(0, hintsUsed | 0);
  if (hints === 0 && !late) return 'perfect';
  if (hints === 1 && !late) return 'hint';
  if (hints === 0 && late) return 'late';
  return 'many';
}

/** Les rangs, par total de points (or 3 / argent 2 / bronze 1). */
const RANKS = Object.freeze([
  { key: 'novice', min: 0 },
  { key: 'diligent', min: 15 },
  { key: 'excellent', min: 40 },
  { key: 'champion', min: 80 },
]);

/** Le rang atteint et la marche suivante (`next` null au sommet). */
export function rankFor(points) {
  const p = Math.max(0, points | 0);
  let i = 0;
  while (i + 1 < RANKS.length && p >= RANKS[i + 1].min) i += 1;
  const next = RANKS[i + 1] ?? null;
  const span = next ? next.min - RANKS[i].min : 1;
  return { rank: RANKS[i].key, next: next?.key ?? null, toNext: next ? next.min - p : 0, progress: next ? (p - RANKS[i].min) / span : 1 };
}

/** Compte des médailles (+ points) d'une liste de médailles (null ignoré). */
export function tally(medals) {
  const out = { gold: 0, silver: 0, bronze: 0, points: 0 };
  for (const m of medals) if (m) { out[m] += 1; out.points += MEDAL_POINTS[m]; }
  return out;
}
