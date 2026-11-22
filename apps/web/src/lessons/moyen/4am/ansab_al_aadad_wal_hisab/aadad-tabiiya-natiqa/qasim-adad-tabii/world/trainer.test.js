import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { MENTAL } from './practice';
import { trainer, solution, check, answerLabel, PLAN_OF, PHRASES } from './trainer';
import { sessionStars, SESSION } from '../../../../../../common/gameworld/kit/trainer';

const { makeSession } = trainer;

const NODES = Object.keys(PLAN_OF);

describe('خريطة المعارف — the trainer on a card', () => {
  it('trains each of the 13 cards of the lesson: six questions, game then exam, ending on the exam format', () => {
    expect(NODES).toHaveLength(13);
    expect(SESSION).toEqual(['game', 'game', 'exam', 'game', 'exam', 'exam']);
    for (const id of NODES)
      for (let seed = 1; seed <= 40; seed += 1) {
        const qs = makeSession(rng(seed * 97 + id.length), id);
        expect(qs.map((q) => q.format)).toEqual(SESSION);
        for (const q of qs) expect(q.prompt.length).toBeGreaterThan(3);
      }
  });

  it('accepts the solution of every question and writes its correction', () => {
    for (const id of NODES)
      for (let seed = 1; seed <= 60; seed += 1)
        for (const q of makeSession(rng(seed * 13 + 1), id)) {
          const res = check(q, solution(q));
          expect(res.ok, `${id} ${q.kind} ${q.prompt}`).toBe(true);
          expect(res.fix.length).toBeGreaterThan(8);
          expect(`${q.prompt}${res.fix}`).not.toMatch(/undefined|NaN/);
        }
  });

  it('keeps the game format mental and gives the exam format paper numbers', () => {
    for (let seed = 1; seed <= 60; seed += 1)
      for (const id of NODES)
        for (const q of makeSession(rng(seed), id)) {
          if (q.kind === 'tap') {
            if (q.wave.a != null) expect(q.wave.a).toBeLessThanOrEqual(MENTAL.a);
            if (q.wave.b != null) expect(q.wave.b).toBeLessThanOrEqual(MENTAL.b);
          }
          if (q.kind === 'division') {
            expect(q.a).toBe(q.b * q.q + q.r);
            expect(q.r).toBeLessThan(q.b);
            expect(q.a).toBeGreaterThan(120);
            expect(q.b).toBeGreaterThan(10);
          }
          if (q.kind === 'tf' && q.format === 'exam') expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
          if (q.kind === 'tf' && q.format === 'game') expect(q.reasons).toBe(null);
        }
  });

  it('a wrong answer gets a hint that does not give the answer, then the correction', () => {
    const d = { format: 'exam', kind: 'division', a: 143, b: 11, q: 13, r: 0, prompt: '' };
    expect(check(d, { q: 12, r: 11, fits: false }).hint).toContain('أصغر من 11');
    expect(check(d, { q: 12, r: 10, fits: false }).hint).toContain('= 142');
    const half = check(d, { q: 13, r: 0, fits: false });
    expect(half.ok).toBe(false);
    expect(half.hint).toContain('الباقي');
    expect(half.hint).not.toContain('قاسم للعدد');
    expect(check(d, { q: 13, r: 0, fits: true }).fix).toContain('143 = 11 \\times 13');
    const s = { format: 'exam', kind: 'show', a: 120, b: 6, q: 20, prompt: '' };
    expect(check(s, { q: 20, x: 6 }).ok).toBe(false); // the same divisor is not « another » one
    expect(check(s, { q: 20, x: 7 }).ok).toBe(false);
    expect(check(s, { q: 20, x: 20 }).ok).toBe(true);
    expect(check(s, { q: 20, x: 10 }).ok).toBe(true); // any other divisor of 120 is accepted
    const c = { format: 'exam', kind: 'complete', a: 120, b: 6, k: 20, x: 6, y: 120, smallFirst: true, prompt: '' };
    expect(PHRASES.filter((p) => check(c, p.id).ok).map((p) => p.id)).toEqual(['qasim', 'yaqsim']); // two phrasings are right
    const t = { format: 'exam', kind: 'two', a: 97, prompt: '' };
    expect(check(t, { x: 97, y: 1 }).ok).toBe(true);
    expect(check(t, { x: 1, y: 7 }).ok).toBe(false);
  });

  it('writes any answer back in one line, to be read again later', () => {
    expect(answerLabel({ kind: 'division', a: 143, b: 11 }, { q: 12, r: 11, fits: false })).toBe(
      '$143 = 11 \\times 12 + 11$ — إذن 11 ليس قاسمًا للعدد 143',
    );
    expect(answerLabel({ kind: 'two', a: 97 }, { x: 1, y: 97 })).toBe('1 و 97');
    expect(answerLabel({ kind: 'complete', x: 6, y: 120 }, 'qasim')).toBe('6 قاسم للعدد 120');
    for (const id of NODES)
      for (const q of makeSession(rng(3), id)) expect(answerLabel(q, solution(q))).not.toMatch(/undefined|NaN|…/);
  });

  it('gives stars for the questions right at the first try', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(sessionStars)).toEqual([0, 0, 1, 1, 2, 2, 3]);
  });
});

describe('the shape of every question, as the kit draws it', () => {
  it('is a tap, a true / false, or a form whose boxes are exactly what the solution fills', async () => {
    const { PT } = await import('../../../../../../common/gameworld/kit/Paper');
    for (const card of Object.keys(PLAN_OF))
      for (let seed = 1; seed <= 12; seed += 1)
        for (const q of makeSession(rng(seed * 31), card)) {
          if (q.kind === 'tap') {
            expect(q.options).toEqual(q.wave.gates);
            continue;
          }
          if (q.kind === 'tf') {
            expect(typeof q.statement).toBe('string');
            continue;
          }
          const { form } = q;
          expect(PT[form.tip], `${q.kind}: tip`).toEqual(expect.any(String));
          const slots = form.lines.flatMap((line) => line.tokens.map((t) => t.num ?? t.choice).filter(Boolean));
          const answer = solution(q);
          if (form.single) expect(slots).toEqual([form.single]);
          else expect(slots.sort()).toEqual(Object.keys(answer).sort());
          for (const line of form.lines)
            for (const t of line.tokens) if (t.choice) expect(t.options.map((o) => o.text).every(Boolean)).toBe(true);
          if (form.model) expect(form.model).toEqual({ a: q.a, b: q.b });
        }
  });
});
