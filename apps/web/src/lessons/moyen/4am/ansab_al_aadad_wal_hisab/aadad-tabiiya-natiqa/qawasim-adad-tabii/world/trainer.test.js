import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);

describe('« تدرّب » — the trainer of « قواسم عدد طبيعي »', () => {
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
          expect(`${q.prompt} ${res.fix} ${answerLabel(q, right)}`).not.toMatch(/undefined|NaN/);
          // an empty or broken answer is never accepted
          const bad =
            q.kind === 'tap'
              ? q.wave.gates.find((n) => n !== right)
              : q.kind === 'tf'
                ? { truth: !q.truth, reason: 0 }
                : {};
          const no = check(q, bad);
          expect(no.ok, `${q.kind} wrong`).toBe(false);
          expect(no.hint, q.kind).toBeTruthy();
          // an exam answer that counts is a claim the server can re-compute, with the same verdict
          const ev = trainerEvidence(q, right, FIRST);
          if (ev) expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
          expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
        }
      }
    }
    expect([...kinds].sort()).toEqual(['list', 'pairs', 'rule', 'show', 'stop', 'tap', 'tf']);
  });

  it('refuses the usual mistakes with their own reason', () => {
    const pairs = { kind: 'pairs', a: 12, n: 3 };
    expect(check(pairs, { x0: 1, y0: 12, x1: 2, y1: 6, x2: 6, y2: 2 }).ok).toBe(false); // the same product twice, turned round
    expect(check(pairs, { x0: 1, y0: 12, x1: 2, y1: 6, x2: 3, y2: 5 }).hint).toContain('15');
    const stop = { kind: 'stop', a: 96 };
    expect(check(stop, { d: 48, e: 49 }).ok).toBe(false); // « up to half »
    expect(check(stop, { d: 9, e: 10 }).ok).toBe(true);
    const list = { kind: 'list', a: 18, n: 6 };
    expect(check(list, { d0: 1, d1: 2, d2: 3, d3: 6, d4: 9, d5: 9 }).ok).toBe(false); // 18 forgotten
    const rule = { kind: 'rule', a: 234, b: 9 };
    expect(check(rule, { v: 9, fits: true }).ok).toBe(true);
    expect(check(rule, { v: 4, fits: true }).ok).toBe(false); // a lucky verdict with a wrong reading
    expect(verifyClaim(trainerEvidence({ ...rule, format: 'exam', key: 'k' }, { v: 4, fits: true }, FIRST).claim)).toBe(
      false,
    );
  });
});
