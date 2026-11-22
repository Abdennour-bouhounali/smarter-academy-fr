import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF, readingOf } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** Every « $a = b \times q + r$ » / « $a = b \times q$ » in a text is true. */
function equalitiesHold(text) {
  for (const [, a, b, q, r] of text.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(b) * Number(q) + Number(r ?? 0), text).toBe(Number(a));
}
const digitSum = (n) =>
  String(n)
    .split('')
    .reduce((t, x) => t + Number(x), 0);

describe('« تدرّب » — the trainer of « قواعد قابلية القسمة »', () => {
  it('every card of the mind map has a plan', () => {
    expect(Object.keys(PLAN_OF).sort()).toEqual([...CARDS].sort());
  });

  it('every question accepts its own solution and refuses a wrong answer with a hint that is not the answer', () => {
    const kinds = new Set();
    for (const card of CARDS) {
      for (let seed = 1; seed <= 25; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 104729), card)) {
          kinds.add(q.kind);
          const right = solution(q);
          const res = check(q, right);
          expect(res.ok, `${card} ${q.kind} ${q.prompt}`).toBe(true);
          expect(res.fix, q.kind).toBeTruthy();
          equalitiesHold(res.fix);
          clean(`${q.prompt} ${res.fix} ${answerLabel(q, right)}`);
          const bad =
            q.kind === 'tap'
              ? q.wave.gates.find((n) => n !== right)
              : q.kind === 'tf'
                ? { truth: !q.truth, reason: 0 }
                : q.kind === 'digit'
                  ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((d) => !q.fits.includes(d))
                  : q.kind === 'judge'
                    ? { ...right, v: right.v === 'yes' ? 'no' : 'yes' }
                    : q.kind === 'rest'
                      ? { ...right, v: right.v === 'yes' ? 'no' : 'yes' }
                      : { yaqbal: String(q.b), mudaaf: String(q.a), yaqsim: String(q.a) };
          const no = check(q, bad);
          expect(no.ok, `${q.kind} wrong`).toBe(false);
          expect(no.hint, q.kind).toBeTruthy();
          clean(no.hint);
          // an exam answer that counts is a claim the server can re-compute, with the same verdict as the trainer
          const ev = trainerEvidence(q, right, FIRST);
          if (['judge', 'digit', 'rest', 'phrase'].includes(q.kind)) {
            expect(ev, q.kind).toBeTruthy();
            expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
            const evBad = trainerEvidence(q, bad, FIRST);
            if (evBad) expect(verifyClaim(evBad.claim), `${q.kind} wrong claim`).toBe(false);
          } else expect(ev).toBe(null);
          expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
        }
      }
    }
    expect([...kinds].sort()).toEqual(['digit', 'judge', 'phrase', 'rest', 'tap', 'tf']);
  });

  it('every true / false is computed: its reason holds, and its verdict is the arithmetic', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const card of ['ahad', 'majmu', 'akhirayn', 'baqi']) {
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card).filter((x) => x.kind === 'tf')) {
          equalitiesHold(q.why);
          // the statement « n يقبل القسمة على b » (or « … إذن n يقبل القسمة على b ») is true exactly when n mod b = 0
          const m = q.statement.match(/(\d+) يقبل القسمة على (\d+)$/);
          if (m && !q.statement.includes('يعني')) expect(q.truth, q.statement).toBe(Number(m[1]) % Number(m[2]) === 0);
          clean(q.statement);
          clean(q.why);
        }
      }
    }
  });

  it('the reading of each key is what the number shows', () => {
    expect(readingOf(3046, 2)).toEqual({ slot: 'u', label: 'رقم الآحاد', value: 6, shown: '6' });
    expect(readingOf(5271, 9)).toEqual({ slot: 's', label: 'مجموع الأرقام', value: 15, shown: '15' });
    expect(readingOf(1724, 4)).toMatchObject({ slot: 't', value: 24, shown: '24' });
    expect(readingOf(3105, 4)).toMatchObject({ value: 5, shown: '05' });
    for (let n = 100; n <= 9999; n += 37)
      for (const b of [2, 3, 4, 5, 9]) {
        const { value, shown } = readingOf(n, b);
        // the reading decides like the division does
        expect(value % b === 0, `${n} ${b}`).toBe(n % b === 0);
        expect(Number(shown)).toBe(value);
        if (b === 3 || b === 9) expect(value).toBe(digitSum(n));
      }
  });

  it('refuses the usual mistakes with their own reason', () => {
    // 5271: digits sum to 15 → 3 yes, 9 no
    const judge = { kind: 'judge', n: 5271, b: 9 };
    expect(check(judge, { s: 15, v: 'no' }).ok).toBe(true);
    expect(check(judge, { s: 15, v: 'yes' }).hint).toContain('15');
    expect(check(judge, { s: 12, v: 'no' }).ok).toBe(false);
    // 1350 = 4 × 337 + 2
    const rest = { kind: 'rest', a: 1350, b: 4, quo: 337, r: 2 };
    expect(check(rest, { q: 337, r: 2, v: 'no' }).ok).toBe(true);
    expect(check(rest, { q: 336, r: 6, v: 'no' }).hint).toContain('ليس أصغر');
    expect(check(rest, { q: 337, r: 2, v: 'yes' }).ok).toBe(false);
    expect(
      verifyClaim(
        trainerEvidence({ ...rest, format: 'exam', key: 'baqi-sifr' }, { q: 337, r: 2, v: 'yes' }, FIRST).claim,
      ),
    ).toBe(false);
    // 47□ for 9: 4 + 7 + 7 = 18 → only 7
    const digit = { kind: 'digit', b: 9, value: 470, place: 10, fits: [7], key: 'majmu-arqam', format: 'exam' };
    expect(check(digit, '7').ok).toBe(true);
    expect(check(digit, '4').ok).toBe(false);
    expect(check(digit, '12').hint).toContain('رقمًا واحدًا');
    expect(trainerEvidence(digit, '12', FIRST)).toBe(null);
    expect(verifyClaim(trainerEvidence(digit, '4', FIRST).claim)).toBe(false);
  });
});
