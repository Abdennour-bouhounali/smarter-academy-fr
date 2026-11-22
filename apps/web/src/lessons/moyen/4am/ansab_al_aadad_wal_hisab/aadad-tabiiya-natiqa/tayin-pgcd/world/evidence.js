/**
 * The EVIDENCE of lesson `tayin-pgcd` — PURE. Which answers count (written format, first try, no help) and what is sent
 * is the kit's rule (`gameworld/kit/evidence.js`); the verdict of a claim is the kit's too (`kit/claims.js`, the same rule
 * as the server's). Here: the الكفاءة each key proves, and the CLAIM each kind of trainer answer makes.
 *
 * The keys and the learning points (`4am_tayin-pgcd_P1…P3`), one to one:
 *   P1 « تعيين PGCD بحصر القواسم »          ← 📋 hasr-wa-taqatu
 *   P2 « النتائج المباشرة »                  ← ⚡ nataij-mubashira
 *   P3 « PGCD(a ; b) = b إذا كان b يقسم a »  ← 🎯 b-yaqsim-a
 *
 * THE RULE OF A CLAIM (as in `qasim-mushtarak-akbar`): the claim is TRUE exactly when the lesson's `check`
 * (world/trainer.js) accepts the WHOLE answer. An answer in several parts sends the claim of its FIRST wrong part — or,
 * when every part is right, the claim of the part that carries the الكفاءة (always `pgcd`). `evidence.test.js`
 * enumerates right, wrong and half-wrong answers of every kind: « `check` false ⇔ claim false ». The kit drops, besides,
 * any TRUE claim of an answer `check` refused (`guardEvidence`, Trainer.jsx).
 * (The draft of 2026-11-18 claimed the first list alone and the product alone: a wrong PGCD after a right list earned
 * the الكفاءة — defects.md A6.)
 */
import { counts, createEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { divisorsOf, gcd } from './math';
import { thirdOf, writtenList } from './trainer';

/** The الكفاءة each key proves (the codes of the lesson's `learningPoints`). */
const POINTS = { 'hasr-wa-taqatu': 'P1', 'nataij-mubashira': 'P2', 'b-yaqsim-a': 'P3' };
/** The evidence of this lesson. It has no real-world case: nothing is claimed from one. */
export const evidence = { ...createEvidence({ grade: '4am', points: POINTS }), caseEvidence: () => null };

/** Is the list he wrote ALL the divisors of a, each once? (the boxes are as many as the divisors) */
const allDivisors = (a, list) =>
  list.length === divisorsOf(a).length &&
  new Set(list).size === list.length &&
  list.every((d) => Number.isInteger(d) && d >= 1 && a % d === 0);

/**
 * Evidence of a TRAINER answer, or null when it does not count.
 * ctx = { firstTry, helped } — helped: a model sheet or the rule was opened before this answer.
 */
export function trainerEvidence(q, value, ctx) {
  if (q.format !== 'exam' || !counts(ctx)) return null;
  // an empty box is 0 and a missing one NaN: neither makes a claim true
  const n = (k) => Number(value?.[k]);
  const pgcd = (a, b, g) => ({ key: q.key, claim: { kind: 'pgcd', a, b, g } });
  switch (q.kind) {
    case 'hasr': {
      // the two lists, then the PGCD: the first wrong part is claimed as he wrote it
      const xs = writtenList(q.na, 'x', value);
      const ys = writtenList(q.nb, 'y', value);
      if (!allDivisors(q.a, xs)) return { key: q.key, claim: { kind: 'divisors', a: q.a, list: xs, b: q.na } };
      if (!allDivisors(q.b, ys)) return { key: q.key, claim: { kind: 'divisors', a: q.b, list: ys, b: q.nb } };
      return pgcd(q.a, q.b, n('g'));
    }
    case 'direct': {
      // three lines: (a ; a), (a ; 0), then (a ; 1) or a pair turned round — the first wrong line, else (a ; 0)
      const t = thirdOf(q);
      const lines = [
        [q.a, q.a, n('s')],
        [...q.zero, n('z')],
        [t.x, t.y, n('o')],
      ];
      const wrong = lines.find(([a, b, g]) => g !== gcd(a, b));
      return pgcd(...(wrong ?? lines[1]));
    }
    case 'yaqsim': {
      // « a = b × k », then the PGCD: a wrong k is claimed as the product he wrote
      const k = n('k');
      if (!(Number.isInteger(k) && k > 0 && q.b * k === q.a))
        return { key: q.key, claim: { kind: 'pair', a: q.a, b: q.b, e: k } };
      return pgcd(q.a, q.b, n('g'));
    }
    // a tap of the gate dash and « صحيح أم خطأ؟ علّل » are NOT evidence: a choice among three, no number written
    default:
      return null;
  }
}
