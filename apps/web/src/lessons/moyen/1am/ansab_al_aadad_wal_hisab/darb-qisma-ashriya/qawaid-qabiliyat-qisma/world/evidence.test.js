import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The kinds of trainer answer that are evidence (exam format): every other kind gives none. */
const EVIDENCE_KINDS = ['judge', 'digit', 'rest', 'phrase'];
const flip = (v) => (v === 'yes' ? 'no' : 'yes');

/**
 * Answers a student can really give to an exam question, around its right one: each box wrong alone, each box empty, the
 * verdict wrong, the verdict not chosen, a sentence the wrong way round, a line not chosen, everything wrong.
 */
function variants(q) {
  const right = solution(q);
  switch (q.kind) {
    case 'judge': {
      const slot = Object.keys(right).find((k) => k !== 'v');
      return [
        right,
        { ...right, v: flip(right.v) },
        { ...right, [slot]: right[slot] + 1 },
        { ...right, [slot]: right[slot] + 1, v: flip(right.v) },
        { ...right, [slot]: '' },
        { ...right, [slot]: '', v: flip(right.v) },
        { ...right, v: undefined },
        { [slot]: right[slot] },
        { ...right, [slot]: String(right[slot]) },
        { ...right, [slot]: '1.5' },
        { ...right, [slot]: '-1' },
        {},
        undefined,
      ];
    }
    case 'digit':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '0', '7', '', null, undefined, 10, 12, -1, '1.5', 'x'];
    case 'rest': {
      const { q: quo, r } = right;
      return [
        right,
        { ...right, v: flip(right.v) },
        { ...right, v: undefined },
        { q: quo, r },
        // one plank too few: the sum holds, the remainder is too big — with each verdict
        { q: quo - 1, r: r + q.b, v: 'no' },
        { q: quo - 1, r: r + q.b, v: 'yes' },
        // a sum that does not hold
        { q: quo + 1, r, v: right.v },
        { q: quo, r: r + 1, v: right.v },
        { q: quo, r: r + 1, v: flip(right.v) },
        // a box left empty (never read as 0)
        { q: '', r, v: right.v },
        { q: quo, r: '', v: right.v },
        { q: '', r: '', v: 'no' },
        { q: '', r: '', v: 'yes' },
        { q: String(quo), r: String(r), v: right.v },
        { q: quo, r: '0.5', v: 'no' },
        {},
        undefined,
      ];
    }
    case 'phrase': {
      const [a, b] = [String(q.a), String(q.b)];
      const out = [];
      // every way to choose the three lines: 8 complete answers, one of them right
      for (const yaqbal of [a, b])
        for (const mudaaf of [a, b]) for (const yaqsim of [a, b]) out.push({ yaqbal, mudaaf, yaqsim });
      // a line not chosen, a value that is neither number
      for (const slot of ['yaqbal', 'mudaaf', 'yaqsim']) {
        out.push({ ...right, [slot]: undefined }, { ...right, [slot]: '999' }, { ...right, [slot]: '' });
      }
      return [...out, {}, undefined];
    }
    default:
      return [];
  }
}

describe('the evidence of « قواعد قابلية القسمة »', () => {
  it('each key proves one الكفاءة of the lesson, in the order of its skills, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('qawaid-qabiliyat-qisma', key));
    expect(points).toEqual(['P1', 'P2', 'P3', 'P4'].map((p) => `1am_qawaid-qabiliyat-qisma_${p}`));
    expect(LESSON_CONFIG.skills).toHaveLength(4);
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim', () => {
    // 1350 = 4 × 337 + 2: not divisible — said rightly, then wrongly
    const q = { format: 'exam', kind: 'rest', key: KEYS[3], a: 1350, b: 4 };
    const ev = trainerEvidence(q, { q: 337, r: 2, v: 'no' }, FIRST);
    expect(ev).toEqual({ key: KEYS[3], claim: { kind: 'division', a: 1350, b: 4, q: 337, r: 2, fits: false } });
    expect(evidence.payloadOf('qawaid-qabiliyat-qisma', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '1am_qawaid-qabiliyat-qisma_P4',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(evidence.verify(ev.claim)).toBe(true);
    expect(evidence.verify(trainerEvidence(q, { q: 337, r: 2, v: 'yes' }, FIRST).claim)).toBe(false);
    expect(trainerEvidence(q, { q: 337, r: 2, v: 'no' }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence(q, { q: 337, r: 2, v: 'no' }, { firstTry: false, helped: false })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, { q: 337, r: 2, v: 'no' }, FIRST)).toBe(null);
    // 5271: digits sum to 15 — divisible by 3, not by 9
    const judge = { format: 'exam', kind: 'judge', key: KEYS[1], n: 5271, b: 9 };
    expect(evidence.verify(trainerEvidence(judge, { s: 15, v: 'no' }, FIRST).claim)).toBe(true);
    expect(evidence.verify(trainerEvidence(judge, { s: 15, v: 'yes' }, FIRST).claim)).toBe(false);
    // 126 = 9 × 14: « 9 يقسم 126 » writes 9 first
    const phrase = { format: 'exam', kind: 'phrase', key: KEYS[3], a: 126, b: 9 };
    const three = { yaqbal: '126', mudaaf: '126', yaqsim: '9' };
    expect(trainerEvidence(phrase, three, FIRST).claim).toEqual({
      kind: 'phrase',
      phrase: 'yaqsim',
      first: 9,
      a: 126,
      b: 9,
    });
    expect(evidence.verify(trainerEvidence(phrase, { ...three, yaqsim: '126' }, FIRST).claim)).toBe(false);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
  });

  it('a HALF-wrong answer is never a true claim: the part the trainer refused is the part the claim carries', () => {
    // the right verdict over a wrong reading (the sum of 5271 is 15, not 14): no claim about 5271 was made
    const judge = { format: 'exam', kind: 'judge', key: KEYS[1], n: 5271, b: 9 };
    expect(trainerEvidence(judge, { s: 14, v: 'no' }, FIRST)).toBe(null);
    expect(trainerEvidence(judge, { s: '', v: 'no' }, FIRST)).toBe(null);
    // a verdict not chosen is not « no »: 5271 is not divisible by 9, and saying nothing is not saying so
    expect(trainerEvidence(judge, { s: 15 }, FIRST)).toBe(null);
    // the same for a division: 1350 = 4 × 337 + 2 written right, no verdict chosen
    const rest = { format: 'exam', kind: 'rest', key: KEYS[3], a: 1350, b: 4 };
    expect(trainerEvidence(rest, { q: 337, r: 2 }, FIRST)).toBe(null);
    // an empty box is not 0: « 1350 = 4 × ▢ + ▢ » left empty with « لا يقبل » claims nothing
    expect(trainerEvidence(rest, { q: '', r: '', v: 'no' }, FIRST)).toBe(null);
    // one plank too few: the sum holds (4 × 336 + 6), the remainder does not — the server refuses it
    expect(verifyClaim(trainerEvidence(rest, { q: 336, r: 6, v: 'no' }, FIRST).claim)).toBe(false);
    // « يقسم » right, « مضاعف » the wrong way round: the claim is the sentence he got wrong
    const phrase = { format: 'exam', kind: 'phrase', key: KEYS[3], a: 126, b: 9 };
    const half = trainerEvidence(phrase, { yaqbal: '126', mudaaf: '9', yaqsim: '9' }, FIRST);
    expect(half.claim).toEqual({ kind: 'phrase', phrase: 'mudaaf', first: 9, a: 126, b: 9 });
    expect(verifyClaim(half.claim)).toBe(false);
    // a line not chosen: nothing is claimed (the kit reads any number that is not the divisor as « the multiple »)
    expect(trainerEvidence(phrase, { yaqbal: '126', yaqsim: '9' }, FIRST)).toBe(null);
    expect(trainerEvidence(phrase, { yaqbal: '126', mudaaf: '999', yaqsim: '9' }, FIRST)).toBe(null);
    // a digit that does not fit: 47□ by 9 with 5 → 475, not divisible
    const digit = { format: 'exam', kind: 'digit', key: KEYS[1], b: 9, value: 470, place: 10, fits: [7] };
    expect(verifyClaim(trainerEvidence(digit, 5, FIRST).claim)).toBe(false);
    expect(verifyClaim(trainerEvidence(digit, 7, FIRST).claim)).toBe(true);
    expect(trainerEvidence(digit, '', FIRST)).toBe(null);
    expect(trainerEvidence(digit, 17, FIRST)).toBe(null);
  });

  it('EVERY evidence kind, every answer: the trainer refuses it ⇒ no true claim; a true claim ⇒ the trainer accepts it', () => {
    const seen = Object.fromEntries(EVIDENCE_KINDS.map((k) => [k, { asked: 0, refused: 0, falseClaims: 0, none: 0 }]));
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 40; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + card.length), card)) {
          if (q.format !== 'exam') {
            expect(trainerEvidence(q, solution(q), FIRST), `${q.kind} in game format`).toBe(null);
            continue;
          }
          if (!EVIDENCE_KINDS.includes(q.kind)) {
            expect(trainerEvidence(q, solution(q), FIRST), `${q.kind} is not evidence`).toBe(null);
            continue;
          }
          const tally = seen[q.kind];
          for (const v of variants(q)) {
            const ok = check(q, v).ok;
            const ev = trainerEvidence(q, v, FIRST);
            const claimed = ev ? verifyClaim(ev.claim) : false;
            const where = `${q.kind} « ${q.prompt} » answered ${JSON.stringify(v)}`;
            tally.asked += 1;
            if (!ok) {
              tally.refused += 1;
              expect(claimed, `refused by the trainer, yet a TRUE claim: ${where}`).toBe(false);
              if (ev) tally.falseClaims += 1;
              else tally.none += 1;
            } else {
              // an answer the trainer accepts is always sent, and the server agrees
              expect(ev, `accepted by the trainer, no claim: ${where}`).toBeTruthy();
              expect(claimed, `accepted by the trainer, a FALSE claim: ${where}`).toBe(true);
            }
            if (ev) {
              expect(ev.key, where).toBe(q.key);
              expect(JSON.stringify(ev.claim), where).not.toMatch(/null|NaN/);
            }
          }
          // the right answer, helped or at a second try, is never evidence
          expect(trainerEvidence(q, solution(q), { firstTry: false, helped: false })).toBe(null);
          expect(trainerEvidence(q, solution(q), { firstTry: true, helped: true })).toBe(null);
        }
      }
    }
    // the sweep really met each kind, with answers refused both ways: a false claim sent, and nothing sent
    for (const kind of EVIDENCE_KINDS) {
      expect(seen[kind].asked, kind).toBeGreaterThan(100);
      expect(seen[kind].falseClaims, `${kind}: wrong answers sent as false claims`).toBeGreaterThan(0);
      expect(seen[kind].none, `${kind}: incomplete answers that claim nothing`).toBeGreaterThan(0);
    }
  });
});
