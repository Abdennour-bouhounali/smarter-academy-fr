/**
 * The EVIDENCE of lesson `natiqa-ghayr-natiqa` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * ONE الكفاءة A KEY: `createEvidence` maps a key to ONE point (and `bankSitting.keysOfPoints` back), so each key proves ONE of the
 * lesson's THREE الكفاءات (the catalogue's: P1, P2, P3 — `lesson:brief` once printed a fourth, « bracketing and
 * rounding », that the catalogue does not hold: `validate:lessons` refuses it):
 *   🧩 → P2  the roots of squares of rational numbers (what its trainer answers compute);
 *   ♾️ → P1  saying of a root whether it is rational: what this key makes him able to decide (its trainer answer — the
 *            square of the calculator's display cut to 0,01 is NOT the area — is the fact a classification stands on);
 *   🎯 → P3  the approximate values of a root that is not rational (by default, by excess, rounded).
 * The trainer's true / false « ناطق / غير ناطق » with its reason states no claim: the bank's sitting proves it too.
 *
 * No claim kind was added: a root is stated with the kinds that exist, on natural numbers ≤ 10^6 —
 *   `pair` a = b × b: « his number times itself is the radicand » — a decimal on numbers scaled by 10^k (1,8 typed for
 *          √3,24 is 18 × 18 = 324); the square of a calculator's display (4,35² typed 18,9225: 435 × 435 = 189225);
 *   `fraction` p² / q² = the area: « the square of his fraction is the area » (his p and q squared, `reduced: false`);
 *   `stop` b² ≤ a < (b + 1)²: the value by default to 10^-k (b = it × 10^k, a = the radicand × 10^2k); the value by
 *          excess claimed as « it − 10^-k is the value by default »;
 *   `stop` on a × 4 × 10^2k with b = (rounded + by default) × 10^k: ⌊2 √a × 10^k⌋ is 2L or 2L + 1 (L the value by
 *          default in units of 10^-k) — 2L when the rounded value is L, 2L + 1 when it is L + 1; any other rounded value
 *          gives a b that is neither: the claim is TRUE exactly when the rounded value is right.
 * THE RULE OF A CLAIM (defects.md A6): the claim is TRUE exactly when the lesson's `check` (world/trainer.js) accepts the
 * WHOLE answer. An answer in several parts sends the claim of its FIRST part that is not right, else of its last.
 * Never evidence: a tap, a true / false, a second try, an answer after help.
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { K1, K2, K3, above, cut, read, scaled, typedDecimal, typedWhole } from './math';
import { inUnits } from './trainer';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`): one per key — see the header. */
const POINTS = { [K1]: 'P2', [K2]: 'P1', [K3]: 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/** « x × x = a »: x is the root of a. */
const root = (a, x) => ({ kind: 'pair', a, b: x, e: x });
/** A decimal he typed in two boxes, × 10^k (an integer when it has at most k decimals). */
const typedScaled = (v, i, d, k) => scaled(typedDecimal(v[i], v[d]), k);
/** A decimal he typed, in units of 10^-k — or null (an empty box, more decimals than k). */
const typedUnits = (v, i, d, k) => inUnits(typedDecimal(v[i], v[d]), k);
/** « L is the value by default of √a to 10^-k »: L² ≤ a × 10^2k < (L + 1)². */
const byDefault = (a, k, L) => ({ kind: 'stop', a: scaled(a, 2 * k), b: L });
/** The rounded value R (units of 10^-k) of √a, the value by default being L: ⌊2 √a × 10^k⌋ = R + L. */
const roundedClaim = (a, k, L, R) => ({
  kind: 'stop',
  a: scaled(a, 2 * k) * 4,
  b: R == null || L == null ? null : R + L,
});
/** Units of 10^-k of a number written by the lesson. */
const units = (x, k) => inUnits(read(x), k);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  const v = value ?? {};
  switch (q.kind) {
    case 'jidhr':
    case 'dil': {
      if (q.shape === 'frac') {
        const a = read(q.a);
        const [p, d] = [typedWhole(v.n), typedWhole(v.d)];
        return {
          key: q.key,
          claim: {
            kind: 'fraction',
            a: Number(a.n),
            b: Number(a.d),
            p: p == null ? null : p * p,
            q: d == null ? null : d * d,
            reduced: false,
          },
        };
      }
      // a decimal of k decimals: √a × 10^k, on a × 10^2k
      const k = (q.r.split(',')[1] ?? '').length;
      return { key: q.key, claim: root(scaled(q.a, 2 * k), typedScaled(v, 'i', 'd', k)) };
    }
    case 'murabbaQima': {
      // the display cut to 0,01 is x: his square × 10^4 must be (x × 100)²
      const X = units(q.x, 2);
      return { key: q.key, claim: { kind: 'pair', a: typedScaled(v, 'i', 'd', 4), b: X, e: X } };
    }
    case 'tadwir': {
      const a = String(q.a);
      const L = typedUnits(v, 'i1', 'd1', 1);
      if (L !== units(cut(a, 1), 1)) return { key: q.key, claim: byDefault(a, 1, L) };
      return { key: q.key, claim: roundedClaim(a, 1, L, typedUnits(v, 'i2', 'd2', 1)) };
    }
    case 'qiyam': {
      const a = String(q.a);
      const L = typedUnits(v, 'i1', 'd1', 2);
      if (L !== units(cut(a, 2), 2)) return { key: q.key, claim: byDefault(a, 2, L) };
      const H = typedUnits(v, 'i2', 'd2', 2);
      if (H !== units(above(a, 2), 2)) return { key: q.key, claim: byDefault(a, 2, H == null ? null : H - 1) };
      return { key: q.key, claim: roundedClaim(a, 2, L, typedUnits(v, 'i3', 'd3', 2)) };
    }
    default:
      return null;
  }
}
