import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const batchOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'batch');
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const keyOf = (r) => r.options[r.correct];
/** « $(4\,;\,2)$ » → [4, 2] (entiers). */
const pair = (s) => { const m = /\((-?\d+)\\,;\\,(-?\d+)\)/.exec(s); return [Number(m[1]), Number(m[2])]; };

describe('les مسائل du درس « التعليم في المستوي »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });

  it('مسألة 1 — K(4 ; 2) · G(−3 ; 0) · L(−1 ; −3) · T(0 ; 3) ; deux sur un axe ; 4 + 2 = 6 m ; l\'échange est (2 ; 4)', () => {
    const f = LESSON_CONFIG.lessonProblem.figure.points;
    const want = { K: [4, 2], G: [-3, 0], L: [-1, -3], T: [0, 3] };
    for (const n of Object.keys(want)) expect(f[n], n).toEqual(want[n]);
    const rows = batchOf('masala-1', 0).rows;
    ['K', 'G', 'L', 'T'].forEach((n, i) => {
      expect(pair(keyOf(rows[i])), n).toEqual(want[n]);
      rows[i].options.forEach((o, j) => { if (j !== rows[i].correct) expect(pair(o)).not.toEqual(want[n]); });
    });
    // les deux points d'un axe : G (ordonnée 0) et T (abscisse 0)
    const onAxis = Object.entries(want).filter(([, p]) => p[0] === 0 || p[1] === 0).map(([n]) => n);
    expect(onAxis).toEqual(['G', 'T']);
    expect(choicesOf('masala-1', 0)[0].options[0]).toContain('البوابة');
    expect(choicesOf('masala-1', 0)[0].options[0]).toContain('الشجرة');
    expect(expectedOf('masala-1', 1)).toEqual([Math.abs(want.K[0]), Math.abs(want.K[1]), Math.abs(want.K[0]) + Math.abs(want.K[1])]);
    expect(pair(choicesOf('masala-1', 2)[0].options[0].replace('تحطّ عند ', ''))).toEqual([want.K[1], want.K[0]]);
    expect(PROBLEM['masala-1'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['paint']);
  });

  it('مسألة 2 — couronnes : max(|x|, |y|) ≤ 1 → 10 ; ≤ 2 → 5 ; ≤ 3 → 2 ; sinon 0 ; سلمى 17, أنيس 22, ياسين 10', () => {
    const score = ([x, y]) => { const r = Math.max(Math.abs(x), Math.abs(y)); return r <= 1 ? 10 : r <= 2 ? 5 : r <= 3 ? 2 : 0; };
    const salma = [[1, -1], [-2, 0], [3, 3]];
    const anis = [[0, 1], [-1, -1], [3, -2]];
    const yacine = [[2, 1], [-2, -2], [4, 0]];
    const sum = (l) => l.map(score).reduce((a, b) => a + b, 0);
    expect([sum(salma), sum(anis), sum(yacine)]).toEqual([17, 22, 10]);
    const rows = batchOf('masala-2', 0).rows;
    salma.forEach((p, i) => { expect(Number(keyOf(rows[i])), `salma ${i}`).toBe(score(p)); rows[i].options.slice(1).forEach((o) => expect(Number(o)).not.toBe(score(p))); });
    expect(expectedOf('masala-2', 0)).toEqual([sum(salma)]);
    expect(expectedOf('masala-2', 1)).toEqual([sum(anis)]);
    expect(Math.max(sum(salma), sum(anis), sum(yacine))).toBe(sum(anis));
    expect(choicesOf('masala-2', 1)[0].options[0]).toBe('أنيس');
    // « 5 points » : (−2 ; 1) seulement parmi (−2 ; 1), (0 ; 3), (1 ; 1)
    const cand = [[-2, 1], [0, 3], [1, 1]];
    expect(cand.filter((p) => score(p) === 5)).toEqual([[-2, 1]]);
    expect(choicesOf('masala-2', 2)[0].options[0]).toBe('$(-2\\,;\\,1)$');
    expect(PROBLEM['masala-2'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['bags']);
    // la figure : trois carrés emboîtés de demi-côtés 1, 2, 3
    const fig = PROBLEM['masala-2'].figure;
    expect(fig.polygons.map((p) => p.points.length)).toEqual([4, 4, 4]);
    expect(fig.polygons.map((p) => Math.abs(fig.points[p.points[0]][0]))).toEqual([3, 2, 1]);
  });

  it('مسألة 3 — A(−2 ; −1) : A\'(−2 ; 1) (axe horizontal), B\'(2 ; −1) (axe vertical) ; même quart que C(−3 ; −4)', () => {
    const A = [-2, -1];
    const Ap = [A[0], -A[1]];
    const Bp = [-A[0], A[1]];
    expect(Ap).toEqual([-2, 1]);
    expect(Bp).toEqual([2, -1]);
    expect(PROBLEM['masala-3'].figure.points.A).toEqual(A);
    expect(expectedOf('masala-3', 0)).toEqual([Ap[1]]);
    expect(expectedOf('masala-3', 1)).toEqual([Bp[0]]);
    expect(choicesOf('masala-3', 0)[0].options[0]).toContain('$-2$');
    expect(choicesOf('masala-3', 1)[0].options[0]).toContain('$-1$');
    const quad = ([x, y]) => `${Math.sign(x)}${Math.sign(y)}`;
    const cand = { C: [-3, -4], D: [3, -1], E: [-1, 2] };
    expect(Object.entries(cand).filter(([, p]) => quad(p) === quad(A)).map(([n]) => n)).toEqual(['C']);
    expect(choicesOf('masala-3', 2)[0].options[0]).toContain('C(-3');
    expect(PROBLEM['masala-3'].data.filter((d) => !d.useful).map((d) => d.id)).toEqual(['brooms']);
  });
});
