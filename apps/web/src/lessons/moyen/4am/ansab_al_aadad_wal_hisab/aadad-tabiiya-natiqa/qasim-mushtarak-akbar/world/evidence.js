/**
 * The EVIDENCE of lesson `qasim-mushtarak-akbar` — PURE. Which answers count (written format, first try, no help) and what
 * is sent is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the
 * same rule as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`4am_qasim-mushtarak-akbar_P1…P4`), one to one:
 *   P1 « تعيين القواسم المشتركة »            ← 🤝 qawasim-mushtaraka
 *   P2 « التعرّف على PGCD والترميز له »      ← 👑 al-akbar
 *   P3 « تفسير وضعية توزيع في باقات متماثلة » ← 💐 baqat-mutamathila
 *   P4 « القواسم المشتركة هي قواسم PGCD »    ← 🧩 qawasim-al-pgcd
 *
 * THE RULE OF A CLAIM (2026-11-19, as in `khawass-qawasim`): the claim is TRUE exactly when the lesson's `check`
 * (world/trainer.js) accepts the WHOLE answer. An answer in several parts sends the claim of its FIRST wrong part — or,
 * when every part is right, the claim of the part that carries the الكفاءة. `evidence.test.js` enumerates right, wrong
 * and half-wrong answers of every kind: « `check` false ⇔ claim false ». The kit drops, besides, any TRUE claim of an
 * answer `check` refused (`guardEvidence`, Trainer.jsx).
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = { 'qawasim-mushtaraka': 'P1', 'al-akbar': 'P2', 'baqat-mutamathila': 'P3', 'qawasim-al-pgcd': 'P4' };
/** The evidence of this lesson. It has no real-world case yet: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

const SLOTS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
const natural = (x) => Number.isInteger(x) && x >= 0;

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  // an empty box is 0 and a missing one NaN: neither makes a claim true
  const n = (k) => Number(value?.[k]);
  switch (q.kind) {
    case 'commonList':
    case 'nestList': {
      // the list he wrote, the empty boxes left out. A number that does not divide BOTH a and b is claimed as a common
      // divisor of a and b (false: the server re-computes it from a and b). Otherwise the whole list is claimed as the
      // divisors of g = PGCD(a ; b), each once — g is the question's (stated by « nestList »), never the student's.
      const list = SLOTS.map((s) => value?.[s])
        .filter((x) => x !== '' && x != null)
        .map(Number);
      const stray = list.find((d) => natural(d) && d >= 1 && (q.a % d !== 0 || q.b % d !== 0));
      if (stray != null) return { key: q.key, claim: { kind: 'commonDivisor', a: q.a, b: q.b, d: stray } };
      return { key: q.key, claim: { kind: 'divisors', a: q.g, list, b: list.length } };
    }
    case 'pgcd':
      // « PGCD(a ; b) = □ »: one box, the whole answer
      return { key: q.key, claim: { kind: 'pgcd', a: q.a, b: q.b, g: n('g') } };
    case 'bouquets': {
      // three boxes: the most bouquets n, then the roses x and the lilies y of one bouquet. A wrong n is claimed as the
      // PGCD he wrote; once n is right, a wrong x (a = n × x) or y (b = n × y) is claimed as the product he wrote; when all
      // three are right, the claim is the part that is the الكفاءة: the number of bouquets IS PGCD(a ; b).
      const [m, x, y] = [n('n'), n('x'), n('y')];
      const pgcd = { kind: 'pgcd', a: q.a, b: q.b, g: m };
      if (m !== q.g) return { key: q.key, claim: pgcd };
      if (!natural(x) || m * x !== q.a) return { key: q.key, claim: { kind: 'pair', a: q.a, b: m, e: x } };
      if (!natural(y) || m * y !== q.b) return { key: q.key, claim: { kind: 'pair', a: q.b, b: m, e: y } };
      return { key: q.key, claim: pgcd };
    }
    // a tap of the gate dash and « صحيح أم خطأ؟ علّل » are NOT evidence: a choice among three, no number written
    default:
      return null;
  }
}
