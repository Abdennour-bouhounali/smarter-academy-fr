import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { EXERCISES, NOW_59, EX, partsOf } from './exercises.js';
import { TEXT, RULE_P } from './forbidden.js';

/**
 * Les exercices de hall-jabri, réécrits par la plateforme (rollout 2026-11-12, verdict L2.12 + X11) : chaque couple attendu est RECALCULÉ sur sa jumla
 * (fractions exactes), chaque jumla est bien celle que l'énoncé montre, et aucune ligne écrite (énoncé, `explain`, `method`, `commonError`) ne montre
 * la signature de la مسألة ni un moins devant une parenthèse (règle P : ces lignes sont lues AVANT le module 4).
 */
const SYSTEMS = {
  'now-59-1': ['2x + y = 13', '\\dfrac{1}{2}x - y = -3', '2x+y=13', 'x/2-y=-3'],
  'now-59-2': ['4x - 2y = 6', 'x + 2y = -1'],
  'ex-5-a': ['x + 2y = 9', '3x + 4y = 19'],
  'ex-5-b': ['2a + 3b = 0', '4a + 5b = -4', null, null, ['a', 'b']],
  'ex-6-a': ['3x - 2y = 14', '2x + 5y = 3'],
  'ex-6-b': ['d = 60t', 'd + 40t = 300', null, null, ['d', 't']],
  'ex-7-a': ['-x + 2y = 1', '3x + y = 11'],
  'ex-7-b': ['4x + 3y = 10', '5x + 2y = 9'],
  'ex-8-a': ['3x - y = 1', '2x + 3y = 19'],
  'ex-8-b': ['2x + 5y = 11', '-3x + 4y = 18'],
  'ex-9-a': ['-3x + y = 1', '4x - y = 2'],
  'ex-9-b': ['\\dfrac{x}{4} - y = 0', '2x - 3y = 10', 'x/4-y=0', '2x-3y=10'],
  'ex-10-a': ['3x = 4y', 'y = 2(x - 5)', '3x-4y=0', '2x-y=10'],
  'ex-10-b': ['x = -y', '4x + 3y = 2', 'x+y=0', '4x+3y=2'],
  'ex-11-a': ['x + y = 15', '2x + 3y = 38'],
  'ex-11-b': ['4x - 3y = 2', '10x - y = -8'],
  'ex-11-c': ['5x - 2y = 0', '3x - y = 2'],
  'ex-11-d': ['a - b = 4', '2a - \\dfrac{b}{3} = 13', 'a-b=4', '2a-b/3=13', ['a', 'b']],
  'ex-12-2': ['x + 2y = 9', '4y - 1 = 3(x - 2)', 'x+2y=9', '3x-4y=5'],
  'ex-13-2': ['x - 3y = 2', '2(x - y) = -8', 'x-3y=2', 'x-y=-4'],
  'ex-22': ['6x + 5y = 26{,}5', '4x + 3y = 16{,}5', '6x+5y=26.5', '4x+3y=16.5'],
  'ex-23': ['3x + y = 2', '-3x + 2y = -11'],
};
const shownText = (ex) => [ex.statement, ...(ex.items ?? []), ...partsOf(ex.source.number ?? 0).flatMap((p) => [p.statement, ...(p.items ?? [])]), ex.question?.prompt].filter(Boolean).join(' ');
const lines = (ex) => [ex.statement, ...(ex.items ?? []), ex.question?.prompt, ex.question?.explain, ...(ex.question?.options ?? []), ex.method, ex.commonError].filter(Boolean);

describe('hall-jabri — the exercises, rewritten by the platform', () => {
  it('every pair answer is the exact solution of the system the statement shows', () => {
    Object.entries(SYSTEMS).forEach(([id, [s1, s2, p1, p2, vars]]) => {
      const ex = EX[id];
      expect(ex, id).toBeTruthy();
      const where = id.startsWith('now') ? `${NOW_59[0].statement} ${ex.question.prompt}` : shownText(ex);
      expect(where, `${id} shows ${s1}`).toContain(s1);
      expect(where, `${id} shows ${s2}`).toContain(s2);
      const c = LS.classify(LS.system(p1 ?? s1, p2 ?? s2, vars ?? ['x', 'y']));
      expect(c.kind, id).toBe('unique');
      const want = ex.question.expected;
      expect(Lin.eq(c.x, Lin.parseNumber(want.x)), `${id} x`).toBe(true);
      expect(Lin.eq(c.y, Lin.parseNumber(want.y)), `${id} y`).toBe(true);
    });
  });
  it('the simplify choices: one right option, recomputed', () => {
    // 4y − 1 = 3(x − 2) ⇔ 3x − 4y = 5 ; 2(x − y) = −8 ⇔ x − y = −4
    const same = (a, b) => { const [e, f] = LS.system(a, b); return Lin.isZero(Lin.sub(Lin.mul(e.a, f.b), Lin.mul(e.b, f.a))) && Lin.isZero(Lin.sub(Lin.mul(e.a, f.c), Lin.mul(e.c, f.a))); };
    expect(same('3x-4y=5', '-3x+4y=-5')).toBe(true);
    const q12 = EX['ex-12-1'].question; const q13 = EX['ex-13-1'].question;
    expect(q12.options[q12.correct]).toBe('$3x - 4y = 5$');
    expect(q13.options[q13.correct]).toBe('$x - y = -4$');
    expect(same('3x-4y=1', '3x-4y=5')).toBe(false);
  });
  it('no line written before the climax shows its signature or a minus before a bracket (rule P)', () => {
    [...EXERCISES, ...NOW_59].forEach((ex) => lines(ex).forEach((s) => {
      TEXT.forEach((re) => expect(re.test(s), `${ex.id}: ${re} — ${s}`).toBe(false));
      expect(RULE_P.test(s), `${ex.id} rule P — ${s}`).toBe(false);
      expect(s.includes('الكتاب'), ex.id).toBe(false);
    }));
  });
  it('the rule P scan fires (negative control) and lets a pair through', () => {
    expect(RULE_P.test('$5x - 2(3x - 2) = 0$')).toBe(true);
    expect(RULE_P.test('$x - (x - 2) = 2$')).toBe(true);
    expect(RULE_P.test('الحل $(2 ; -3)$ و $-\\dfrac{3}{2}$')).toBe(false);
    expect(RULE_P.test('$2 \\times (-6) + 3 \\times 4 = 0$')).toBe(false);
  });
  it('all pairs are distinct and none is the climax pair', () => {
    const keys = [...EXERCISES, ...NOW_59].filter((ex) => ex.interaction === 'pair').map((ex) => `${ex.question.expected.x};${ex.question.expected.y}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain('30;25');
  });
});
