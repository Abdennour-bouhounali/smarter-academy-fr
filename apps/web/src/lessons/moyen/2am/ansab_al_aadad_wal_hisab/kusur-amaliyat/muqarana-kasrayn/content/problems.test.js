import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** fractions exactes en BigInt : [n, d] ; comparaison par produit en croix (côté test uniquement) */
const cmp = ([a, b], [c, d]) => { const l = BigInt(a) * BigInt(d); const r = BigInt(c) * BigInt(b); return l < r ? -1 : l > r ? 1 : 0; };
const sub = ([a, b], [c, d]) => [BigInt(a) * BigInt(d) - BigInt(c) * BigInt(b), BigInt(b) * BigInt(d)];
const add = ([a, b], [c, d]) => [BigInt(a) * BigInt(d) + BigInt(c) * BigInt(b), BigInt(b) * BigInt(d)];
const eq = (x, y) => cmp(x, y) === 0;
const tex = (s) => [...String(s).matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [BigInt(m[1]), BigInt(m[2])]);
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const keyOf = (c) => c.options[c.correct];
const concl = (id, part) => choices(id, part).find((c) => c.role === 'conclude');
const desc = (xs) => xs.every((x, k) => k === 0 || cmp(xs[k - 1], x) > 0);
const asc = (xs) => xs.every((x, k) => k === 0 || cmp(xs[k - 1], x) < 0);

describe('les مسائل du درس « مقارنة كسرين »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });
  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test)', () => {
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => [q.label, q.text])).toEqual(PROBLEM['masala-1'].parts.map((p) => [p.label, p.question]));
  });
  it('every demand has its own answer', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ${k}`).toBe(true));
    }
  });
  it('مسألة 1 : 1/3 = 4/12 ; 1 − 5/12 − 4/12 = 3/12 = 1/4 ; 5/12 > 4/12 > 3/12 ; 5/12 < 1/2 = 6/12', () => {
    expect(PROBLEM['masala-1'].statement).toContain('\\frac{5}{12}'); expect(PROBLEM['masala-1'].statement).toContain('\\frac{1}{3}');
    const t = choices('masala-1', 0)[0]; expect(eq(tex(keyOf(t))[0], [1, 3])).toBe(true); expect(keyOf(t)).toContain('\\frac{4}{12}');
    t.options.filter((o) => o !== keyOf(t)).forEach((o) => expect(eq(tex(o)[0], [1, 3])).toBe(false));
    const third = sub(sub([1, 1], [5, 12]), [4, 12]);
    expect(eq(third, [3, 12])).toBe(true); expect(eq(third, [1, 4])).toBe(true);
    const c = concl('masala-1', 0); expect(eq(tex(keyOf(c))[0], [1, 4])).toBe(true);
    c.options.filter((o) => o !== keyOf(c)).forEach((o) => expect(eq(tex(o)[0], [1, 4])).toBe(false));
    // la somme des trois parts fait 1
    expect(eq(add(add([5, 12], [4, 12]), third), [1, 1])).toBe(true);
    // ordre décroissant
    const o = concl('masala-1', 1);
    o.options.forEach((opt, k) => expect(desc(tex(opt)), opt).toBe(k === o.correct));
    expect(desc([[5, 12], [4, 12], [3, 12]])).toBe(true);
    // moitié
    expect(expectedOf('masala-1', 2)).toEqual([6]); expect(eq([6, 12], [1, 2])).toBe(true);
    const h = concl('masala-1', 2); expect(keyOf(h)).toContain('<'); expect(cmp([5, 12], [6, 12])).toBe(-1);
    expect(h.options.filter((x) => /5\}\{12\}>/.test(x))).toHaveLength(1);
  });
  it('مسألة 2 : 3/5 > 3/8 ; 3/5 = 6/10 < 7/10 ; plus que la moitié : Yasser et Houda', () => {
    expect(cmp([3, 5], [3, 8])).toBe(1);
    expect(keyOf(concl('masala-2', 0))).toBe('ياسر');
    expect(expectedOf('masala-2', 1)).toEqual([6]); expect(eq([6, 10], [3, 5])).toBe(true);
    expect(cmp([3, 5], [7, 10])).toBe(-1); expect(keyOf(concl('masala-2', 1))).toBe('هدى');
    const half = [1, 2];
    const more = { amina: cmp([3, 8], half) > 0, yasser: cmp([3, 5], half) > 0, houda: cmp([7, 10], half) > 0 };
    expect(more).toEqual({ amina: false, yasser: true, houda: true });
    expect(keyOf(concl('masala-2', 2))).toBe('ياسر وهدى');
    expect(keyOf(choices('masala-2', 2)[0])).toBe('لا');
    expect(cmp([3, 8], [4, 8])).toBe(-1);
  });
  it('مسألة 3 : 3/8 = 6/16, 1/4 = 4/16 ; 4/16 < 5/16 < 6/16 ; 6+4+5 = 15 ; 1 − 15/16 = 1/16 ; 15/16 < 1', () => {
    expect(expectedOf('masala-3', 0)).toEqual([6]); expect(eq([6, 16], [3, 8])).toBe(true); expect(eq([4, 16], [1, 4])).toBe(true);
    const o = concl('masala-3', 0);
    o.options.forEach((opt, k) => expect(asc(tex(opt)), opt).toBe(k === o.correct));
    expect(asc([[1, 4], [5, 16], [3, 8]])).toBe(true);
    expect(expectedOf('masala-3', 1)).toEqual([15]); expect(6 + 4 + 5).toBe(15);
    const rest = sub([1, 1], add(add([3, 8], [1, 4]), [5, 16]));
    expect(eq(rest, [1, 16])).toBe(true);
    const r = concl('masala-3', 1); expect(eq(tex(keyOf(r))[0], [1, 16])).toBe(true);
    r.options.filter((x) => x !== keyOf(r)).forEach((x) => expect(eq(tex(x)[0], [1, 16])).toBe(false));
    expect(cmp([15, 16], [1, 1])).toBe(-1);
    const q = concl('masala-3', 2); expect(keyOf(q)).toContain('<'); expect(keyOf(q)).toContain('\\frac{15}{16}');
    expect(keyOf(choices('masala-3', 2)[0])).toBe('البسط أصغر من المقام');
  });
  it('chaque مسألة : un seul renseignement inutile, aucun mot interdit', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => !d.useful)).toHaveLength(1);
      expect(/خنزير|خمر|قمار|نرد|فوائد|ربا|يانصيب/.test(JSON.stringify(p))).toBe(false);
    }
  });
});
