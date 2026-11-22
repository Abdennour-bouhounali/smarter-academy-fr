import { describe, it, expect } from 'vitest';
import { describeTrainer } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { answerLabel, check, solution, trainer, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { gcd } from './math';

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);

describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['tap', 'marahil', 'hukm', 'mukhtazal', 'hisab'],
});

/** Every question of every card, a few sessions each. */
const all = (seeds = 30) =>
  CARDS.flatMap((card) =>
    Array.from({ length: seeds }, (_, s) => trainer.makeSession(rng((s + 1) * 7907 + card.length), card)).flat(),
  );
/** A token that is a fraction template of the kit, and whether a part of it is a box to type. */
const isFrac = (t) => Boolean(t?.frac && typeof t.frac === 'object');
const isBox = (x) => Boolean(x && typeof x === 'object' && x.num);

describe('« تدرّب » of « اختزال كسر » — the lesson’s own', () => {
  it('every fraction of a sheet is the kit’s template: typed (two boxes) or given (two numbers) — never « a/b » text', () => {
    let typed = 0;
    let shown = 0;
    for (const q of all())
      for (const l of q.form?.lines ?? []) {
        const fr = l.tokens.filter(isFrac);
        for (const t of fr) {
          const { n, d } = t.frac;
          if (isBox(n) || isBox(d)) {
            typed += 1;
            expect(isBox(n) && isBox(d), q.prompt).toBe(true);
            expect(n.label, q.prompt).toMatch(/^البسط/);
            expect(d.label, q.prompt).toMatch(/^المقام/);
          } else {
            shown += 1;
            expect(Number.isInteger(n) && Number.isInteger(d) && d > 0, q.prompt).toBe(true);
          }
        }
        // one typed fraction a line at most; no fraction written as plain text « a/b »
        expect(fr.filter((t) => isBox(t.frac.n)).length, q.prompt).toBeLessThanOrEqual(1);
        for (const t of l.tokens) if (typeof t === 'string') expect(t, q.prompt).not.toMatch(/\d\s*\/\s*\d|^\/$/);
      }
    expect(typed).toBeGreaterThan(500);
    expect(shown).toBeGreaterThan(300);
  });

  it('the numbers of each kind: the stages divide exactly, the fractions to reduce do reduce, the results are not whole', () => {
    for (const q of all()) {
      if (q.kind === 'marahil') {
        expect(q.a % (q.d * q.e), q.prompt).toBe(0);
        expect(q.b % (q.d * q.e), q.prompt).toBe(0);
        expect(q.a).toBeLessThan(q.b);
      }
      if (q.kind === 'mukhtazal') expect(gcd(q.a, q.b), q.prompt).toBeGreaterThan(1);
      if (q.kind === 'hisab') {
        expect(gcd(q.A, q.B), q.prompt).toBeGreaterThan(1);
        expect(q.A % q.B, q.prompt).not.toBe(0);
        const value =
          q.op === '+' ? q.x / q.y + q.z / q.w : q.op === '-' ? q.x / q.y - q.z / q.w : (q.x * q.z) / (q.y * q.w);
        expect(q.A / q.B).toBeCloseTo(value, 10);
      }
      if (q.kind === 'hukm' && gcd(q.a, q.b) > 1)
        for (const r of [2, 3, 5]) expect(q.a % r === 0 && q.b % r === 0, q.prompt).toBe(false);
      expect(q.prompt).not.toMatch(/undefined|NaN/);
    }
  });

  it('the hints say what the answer gives, never the answer: a writing that still reduces, the denominators added', () => {
    const q = all().find((x) => x.kind === 'mukhtazal' && gcd(x.a, x.b) % 2 === 0);
    const right = solution(q);
    const half = check(q, { ...right, p: right.p * 2, q: right.q * 2 });
    expect(half.ok).toBe(false);
    expect(half.hint).toContain('يُختزل بعد');
    expect(half.hint).not.toContain(`\\frac{${right.p}}{${right.q}}`);
    const h = all().find((x) => x.kind === 'hisab' && x.op === '+');
    const added = check(h, { ...solution(h), t: h.B * 2 });
    expect(added.ok).toBe(false);
    expect(added.hint).toContain(`والمقام يبقى ${h.B}`);
  });

  it('the game format is a gate of the practice ladder; its key is the card’s', () => {
    for (const q of all(5).filter((x) => x.kind === 'tap')) {
      expect(q.format).toBe('game');
      expect(q.options).toHaveLength(3);
      expect(q.options.filter((o) => check(q, o).ok)).toHaveLength(1);
    }
  });
});
