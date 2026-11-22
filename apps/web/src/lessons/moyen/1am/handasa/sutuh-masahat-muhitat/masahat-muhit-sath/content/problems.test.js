import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { SHAPES } from './figures';
import { LESSON_CONFIG } from '../lesson.config';

/* Géométrie de contrôle, écrite autrement que celle de la leçon : cases comptées, bord = différence symétrique des côtés. */
const HALF = new Set(['◤', '◥', '◣', '◢']);
const wholes = (rows) => rows.reduce((s, row) => s + [...row].filter((ch) => ch === '#').length, 0);
const halves = (rows) => rows.reduce((s, row) => s + [...row].filter((ch) => HALF.has(ch)).length, 0);
function perimeterOf(rows) {
  const edges = new Set();
  const toggle = (k) => (edges.has(k) ? edges.delete(k) : edges.add(k));
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') { toggle(`h${r},${c}`); toggle(`h${r + 1},${c}`); toggle(`v${r},${c}`); toggle(`v${r},${c + 1}`); } }));
  return edges.size;
}
const rect = (r, c) => Array.from({ length: r }, () => '#'.repeat(c));
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;

describe('les مسائل du درس « مساحة سطح مستو ومحيطه »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
    for (const p of PROBLEMS) expect(p.figure, p.id).toBeTruthy();
  });

  it('مسألة 1 — la figure littérale de la config dessine la ساحة PLAY : 12 dalles, 16 éléments de clôture', () => {
    // le polygone écrit en littéral (a…h) est le contour de PLAY : aire par la formule des lacets (shoelace), périmètre par la somme des côtés
    const f = LESSON_CONFIG.lessonProblem.figure;
    const poly = f.polygons[0].points.map((n) => f.points[n]);
    let twice = 0; let per = 0;
    poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; twice += p[0] * q[1] - q[0] * p[1]; per += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); });
    expect(Math.abs(twice) / 2).toBe(wholes(SHAPES.PLAY));
    expect(per).toBe(perimeterOf(SHAPES.PLAY));
    expect([wholes(SHAPES.PLAY), perimeterOf(SHAPES.PLAY)]).toEqual([12, 16]);
    // les réponses
    expect(answerOf('masala-1', 0, 0)).toBe(12);
    expect(answerOf('masala-1', 0, 1)).toBe(16);
    expect(answerOf('masala-1', 1, 0)).toBe(12 * 40);
    expect(answerOf('masala-1', 1, 1)).toBe(16 * 150);
    // le rectangle proposé : 3 × 4 → 12 dalles aussi, 14 éléments ; le gain
    expect([wholes(rect(3, 4)), perimeterOf(rect(3, 4))]).toEqual([12, 14]);
    expect(numericOf('masala-1', 2)[0]).toBe(perimeterOf(rect(3, 4)));
    expect(answerOf('masala-1', 2, 0)).toBe((perimeterOf(SHAPES.PLAY) - perimeterOf(rect(3, 4))) * 150);
  });

  it('مسألة 2 — le bassin : 14 rectangles entiers et 4 demis = 16 ; 2 × 8 → 20 éléments, 4 × 4 → 16', () => {
    expect([wholes(SHAPES.BED), halves(SHAPES.BED)]).toEqual([14, 4]);
    expect(answerOf('masala-2', 0, 0)).toBe(14);
    expect(answerOf('masala-2', 0, 1)).toBe(4);
    const area = wholes(SHAPES.BED) + halves(SHAPES.BED) / 2;
    expect(area).toBe(16);
    expect(answerOf('masala-2', 1, 0)).toBe(area);
    const choice = PROBLEM['masala-2'].parts[1].steps.find((s) => s.kind === 'choice');
    expect(choice.options[choice.correct]).toBe('8 رقع');
    expect(area / 2).toBe(8);
    const [pRect, pSquare] = numericOf('masala-2', 2);
    expect([pRect, pSquare]).toEqual([perimeterOf(rect(2, 8)), perimeterOf(rect(4, 4))]);
    expect(wholes(rect(2, 8))).toBe(area); expect(wholes(rect(4, 4))).toBe(area);
    expect(answerOf('masala-2', 2, 1)).toBe(pRect - pSquare);
    const shortest = PROBLEM['masala-2'].parts[2].steps.find((s) => s.kind === 'choice' && s.role === 'conclude');
    expect(shortest.options[shortest.correct]).toBe('سياج المربّع');
    expect(pSquare < pRect).toBe(true);
  });

  it('مسألة 3 — 21 petites dalles = 10,5 grandes ; on achète 11 ; 11 × 90 = 990', () => {
    expect(wholes(SHAPES.WALL)).toBe(21);
    expect(answerOf('masala-3', 0, 0)).toBe(21);
    expect(answerOf('masala-3', 1, 0)).toBe(21 / 2);
    expect(answerOf('masala-3', 2, 0)).toBe(Math.ceil(21 / 2));
    expect(answerOf('masala-3', 2, 1)).toBe(Math.ceil(21 / 2) * 90);
    // 10 grandes ne couvrent que 20 petites : il manque 1
    expect(10 * 2 < 21).toBe(true);
    const big = PROBLEM['masala-3'].parts[1].steps.find((s) => s.kind === 'choice');
    expect(big.options[big.correct]).toBe('نصف عدد الصغيرة');
  });
});
