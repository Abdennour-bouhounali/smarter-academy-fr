import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateIllustration } from '../../../../../../common/problems/problemIllustration';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les six وضعيات d'entraînement de أدمج تعلّماتي — الحساب على الجذور. Chaque nombre est recalculé ici, et chaque
 * égalité écrite (explain, lines, correction, bonne option) est relue et vérifiée numériquement (flottants, tolérance 1e-9).
 */

// ── Lecteur d'égalités LaTeX : entiers, décimaux « 2{,}5 », + − × ÷, ( ), ^2, \sqrt{ }, \dfrac{ }{ } ──────────
function evaluate(src) {
  const s = src
    .replace(/\\[,;!]/g, '')
    .replace(/\\times/g, '*')
    .replace(/(?<=[\d}])\s*(?:dm|cm|m)(?![a-zA-Z])/g, '')
    .replace(/\s+/g, '');
  let i = 0;
  const peek = () => s[i];
  const expect1 = (ch) => { if (s[i] !== ch) throw new Error(`« ${ch} » expected in « ${src} »`); i += 1; };
  function number() {
    const m = /^\d+(?:\{,\}\d+)?/.exec(s.slice(i));
    if (!m) throw new Error(`number expected in « ${src} »`);
    i += m[0].length;
    return Number(m[0].replace('{,}', '.'));
  }
  function primary() {
    let v;
    if (s.startsWith('\\sqrt{', i)) { i += 6; v = Math.sqrt(expr()); expect1('}'); }
    else if (s.startsWith('\\dfrac{', i)) { i += 7; const a = expr(); expect1('}'); expect1('{'); const b = expr(); expect1('}'); v = a / b; }
    else if (peek() === '(') { i += 1; v = expr(); expect1(')'); }
    else if (peek() === '-') { i += 1; v = -primary(); }
    else v = number();
    while (peek() === '^') { i += 1; const e = peek() === '{' ? (i += 1, number()) : number(); if (s[i - 1] !== undefined && s[i] === '}') i += 1; v **= e; }
    return v;
  }
  function term() {
    let v = primary();
    for (;;) {
      if (peek() === '*') { i += 1; v *= primary(); }
      else if (s.startsWith('\\sqrt{', i) || s.startsWith('\\dfrac{', i) || peek() === '(') v *= primary();
      else return v;
    }
  }
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') { const op = s[i]; i += 1; const t = term(); v = op === '+' ? v + t : v - t; }
    return v;
  }
  const v = expr();
  if (i !== s.length) throw new Error(`trailing input in « ${src} »`);
  return v;
}

/** Les chaînes « a = b = c » des segments $…$ : seuls les membres lisibles sont comparés (un membre avec une lettre est ignoré). */
function chainsOf(text) {
  const out = [];
  for (const m of text.matchAll(/\$([^$]+)\$/g)) {
    const math = m[1];
    if (/\\(approx|neq|ldots|leq|geq)|[<>]/.test(math)) continue; // pas une égalité pure
    const sides = math.split('=').map((x) => x.trim());
    if (sides.length < 2) continue;
    const values = [];
    for (const side of sides) {
      try { values.push(evaluate(side)); } catch { /* membre avec lettre : ignoré */ }
    }
    if (values.length >= 2) out.push({ math, values });
  }
  return out;
}

/** Tous les textes dont les égalités doivent être vraies : explications, rédaction modèle, corrections, bonne option. */
function textsOf(problem) {
  const out = [];
  for (const part of problem.parts) {
    for (const st of part.steps) {
      if (st.explain) out.push(st.explain);
      for (const l of st.lines ?? []) out.push(l);
      for (const r of st.rows ?? []) { if (r.correction) out.push(r.correction); out.push(r.options[r.correct]); }
      if (st.kind === 'choice') out.push(st.options[st.correct]);
    }
  }
  return out;
}

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const answersOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const squareFree = (n) => { // le plus grand carré a² qui divise n, et le b restant : √n = a√b
  let a = 1;
  for (let k = 2; k * k <= n; k += 1) while (n % (k * k) === 0) { n /= k * k; a *= k; }
  return { a, b: n };
};

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-judhur)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then the analysis 7, the evaluated situation 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'ahill'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'ahill', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.find((m) => m.slug === 'al-wadiya').track).toBeUndefined();
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    expect(LESSON_CONFIG.resources.find((r) => r.code === 'situation-zarbiya-wadi-souf').module).toBe(7);
  });

  it('every training is titled « الوضعية التدريبية N », has its own tone, is a platform addition, and the carpet of the final test is NOT trained on', () => {
    LESSON_CONFIG.modules.filter((m) => m.track === 'problem').forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type, p.id).toBe('platform_addition');
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    for (const p of PROBLEMS) expect(JSON.stringify(p), p.id).not.toMatch(/زربية|12000|346|693|sqrt\{12\}|sqrt\{48\}/);
    for (const p of PROBLEMS) expect(p.statement, p.id).not.toMatch(/24\s*m\^?2|24m/);
  });

  it('no sub-step is an assessment: mastery comes from module 9 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
    for (const m of LESSON_CONFIG.modules.filter((x) => x.track === 'problem')) expect(m.stage).toBe('practice_lab');
  });

  it('every demand has its own answer (owner rule 2026-10-06), and the last step of a part is the written solution', () => {
    for (const p of PROBLEMS) {
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      for (const part of p.parts) {
        expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
        part.asks.forEach((_, k) => {
          expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
        });
        expect(part.steps.at(-1).kind).toBe('solution');
      }
    }
  });

  it('every `requires` is a concept the lesson declares in priorKnowledge', () => {
    const prior = new Set(LESSON_CONFIG.priorKnowledge);
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) for (const id of s.requires ?? []) expect(prior.has(id), `${p.id}: ${id}`).toBe(true);
  });

  it('every situation has a drawn support that is valid, and its numbers are those of the statement', () => {
    for (const p of PROBLEMS) {
      expect(Boolean(p.illustration || p.table || p.figure), p.id).toBe(true);
      if (p.illustration) expect(validateIllustration(p.illustration), p.id).toEqual([]);
    }
    // the table of وضعية 6 holds the four answers of the pupil
    expect(PROBLEM['wadiya-6'].table.rows).toHaveLength(4);
    expect(PROBLEM['wadiya-6'].statement).toMatch(/الجدول المقابل/);
  });

  it('every written equality is true (explain, lines, corrections, right options)', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const text of textsOf(p)) for (const { math, values } of chainsOf(text)) {
      for (const v of values) expect(Math.abs(v - values[0]), `${p.id}: « ${math} »`).toBeLessThan(1e-9);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(60);
  });

  it('the equality reader really reads (self-check)', () => {
    expect(evaluate('\\sqrt{18} \\times \\sqrt{8}')).toBeCloseTo(12, 9);
    expect(evaluate('2 \\times (3\\sqrt{2} + 2\\sqrt{2})')).toBeCloseTo(10 * Math.SQRT2, 9);
    expect(evaluate('\\dfrac{10}{\\sqrt{2}}')).toBeCloseTo(5 * Math.SQRT2, 9);
    expect(evaluate('(9\\sqrt{3})^2')).toBeCloseTo(243, 9);
    expect(evaluate('24 \\times 2{,}236')).toBeCloseTo(53.664, 9);
    expect(evaluate('4{,}5^2')).toBeCloseTo(20.25, 9);
    expect(chainsOf('$\\sqrt{12} = 2\\sqrt{3}$')).toHaveLength(1);
    // a false equality is detected
    const [bad] = chainsOf('$\\sqrt{9 + 16} = \\sqrt{9} + \\sqrt{16}$');
    expect(Math.abs(bad.values[0] - bad.values[1])).toBeGreaterThan(1);
  });

  // ── Chaque nombre attendu, recalculé depuis l'énoncé ─────────────────────
  it('وضعية 1 — the 180 m² square garden: √180 = 6√5, fence 24√5 ≈ 53,7', () => {
    const { a, b } = squareFree(180);
    expect([a, b]).toEqual([6, 5]);
    expect(expectedOf('wadiya-1', 0)).toEqual([a * a]); // the largest square dividing 180
    const perimeter = 4 * Math.sqrt(180);
    expect(perimeter).toBeCloseTo(24 * Math.sqrt(5), 9);
    const r3 = round(Math.sqrt(5), 3);
    expect(expectedOf('wadiya-1', 1)).toEqual([r3, round(perimeter, 1)]);
    expect(r3).toBe(2.236);
    expect(round(24 * r3, 3)).toBe(53.664);
    expect(round(24 * 2.24, 2)).toBe(53.76); // the early-rounding trap of the explanation
    expect(round(24 * 2.24, 1)).toBe(53.8);
    // the three distractors of the exact value are really different numbers
    const c = Math.sqrt(180);
    for (const wrong of [5 * Math.sqrt(6), 18 * Math.sqrt(10), 36 * Math.sqrt(5)]) expect(Math.abs(wrong - c)).toBeGreaterThan(1e-6);
    for (const wrong of [10 * Math.sqrt(5), 4 * Math.sqrt(30), 24 * Math.sqrt(20)]) expect(Math.abs(wrong - perimeter)).toBeGreaterThan(1e-6);
  });

  it('وضعية 2 — the 5 m ladder, 2 m from the wall: h² = 21, h = √21 ≈ 4,58 > 4,5', () => {
    const h2 = 5 ** 2 - 2 ** 2;
    expect(h2).toBe(21);
    expect(expectedOf('wadiya-2', 0)).toEqual([h2, h2]);
    expect(squareFree(21)).toEqual({ a: 1, b: 21 }); // nothing to simplify
    const h = Math.sqrt(21);
    expect(expectedOf('wadiya-2', 1)).toEqual([4.5 ** 2, round(h, 2)]);
    expect(4.5 ** 2).toBe(20.25);
    expect(h).toBeGreaterThan(4.5); // the ladder reaches the window
    expect(round(4.58 ** 2, 4)).toBe(20.9764);
    expect(h ** 2 + 2 ** 2).toBeCloseTo(5 ** 2, 9);
    expect(4 ** 2).toBeLessThan(21); // the false « √21 < 4 » option
  });

  it('وضعية 3 — the √18 × √8 mat: area 12, 3√2 and 2√2, perimeter 10√2 ≈ 14,1', () => {
    expect(Math.sqrt(18) * Math.sqrt(8)).toBeCloseTo(12, 9);
    expect(answersOf('wadiya-3', 0)).toEqual([12]);
    expect(expectedOf('wadiya-3', 0)).toEqual([18 * 8, 12]);
    expect(18 * 8).toBe(144);
    const s18 = squareFree(18), s8 = squareFree(8);
    expect(s18).toEqual({ a: 3, b: 2 });
    expect(s8).toEqual({ a: 2, b: 2 });
    expect(expectedOf('wadiya-3', 1)).toEqual([s18.a ** 2, s8.a ** 2]);
    const perimeter = 2 * (Math.sqrt(18) + Math.sqrt(8));
    expect(perimeter).toBeCloseTo(10 * Math.SQRT2, 9);
    expect(expectedOf('wadiya-3', 2)).toEqual([round(Math.SQRT2, 3), round(perimeter, 1)]);
    expect(round(10 * 1.414, 2)).toBe(14.14);
    // √a + √b ≠ √(a + b), the classic error offered as a distractor
    expect(Math.sqrt(18) + Math.sqrt(8)).not.toBeCloseTo(Math.sqrt(26), 3);
    // 3√2 · 2√2 = 12 — the sides recombine into the area
    expect(3 * Math.SQRT2 * 2 * Math.SQRT2).toBeCloseTo(12, 9);
  });

  it('وضعية 4 — the 20 / 45 / 80 dm² squares: 2√5 + 3√5 + 4√5 = 9√5 ≈ 20,1 < 21 (renumbered 2026-11-12: never 2√3 / 4√3, the 🏆\'s answers)', () => {
    const sides = [20, 45, 80].map(squareFree);
    expect(sides).toEqual([{ a: 2, b: 5 }, { a: 3, b: 5 }, { a: 4, b: 5 }]); // all multiples of √5
    expect(expectedOf('wadiya-4', 0)).toEqual([16]);
    const total = [20, 45, 80].reduce((t, n) => t + Math.sqrt(n), 0);
    expect(total).toBeCloseTo(9 * Math.sqrt(5), 9);
    expect(2 + 3 + 4).toBe(9);
    expect(expectedOf('wadiya-4', 1)).toEqual([9, round(Math.sqrt(5), 3), round(total, 1)]);
    expect(round(9 * 2.236, 3)).toBe(20.124);
    expect(round(9 * 2.236, 1)).toBe(round(total, 1)); // rounding √5 first does not change the tenth here
    expect(expectedOf('wadiya-4', 2)).toEqual([(9 * Math.sqrt(5)) ** 2, 21 ** 2].map((x) => Math.round(x)));
    expect(81 * 5).toBeLessThan(441); // 9√5 < 21: the ribbon is too short
    expect(total).toBeLessThan(21);
    expect(Math.sqrt(20 + 45 + 80)).not.toBeCloseTo(total, 3); // the sqrt-of-sum distractor
    // the batch rows hold the right option
    const rows = steps('wadiya-4', 0).find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.options[r.correct])).toEqual(['$2\\sqrt{5}$', '$3\\sqrt{5}$', '$4\\sqrt{5}$']);
  });

  it('وضعية 5 — the kite of diagonal 10 dm: c² = 50, c = 5√2 = 10/√2, frame 20√2 ≈ 28,28', () => {
    expect(2 * 50).toBe(10 ** 2);
    // part 1: [10², c²]; part 2: [√2·√2, the coefficient a of 5√2]; part 3: [√2 rounded, frame rounded]
    expect(expectedOf('wadiya-5', 0)).toEqual([10 ** 2, 50]);
    expect(expectedOf('wadiya-5', 1)).toEqual([Math.round(Math.SQRT2 ** 2), 10 / 2]);
    const c = Math.sqrt(50);
    expect(squareFree(50)).toEqual({ a: 5, b: 2 });
    expect(c).toBeCloseTo(10 / Math.SQRT2, 9);
    expect(c ** 2 + c ** 2).toBeCloseTo(10 ** 2, 9);
    expect(expectedOf('wadiya-5', 2)).toEqual([round(Math.SQRT2, 4), round(4 * c, 2)]);
    expect(round(4 * c, 2)).toBe(28.28);
    expect(round(20 * 1.4142, 3)).toBe(28.284);
    expect(20 * 1.4).toBe(28);
    expect(5 * Math.sqrt(8)).toBeCloseTo(10 * Math.SQRT2, 9); // the half-perimeter distractor
    expect(Math.abs(10 / 2 - c)).toBeGreaterThan(1); // dividing by 2 instead of √2 is wrong
  });

  it('وضعية 6 — the answer sheet: 1 right answer out of 4 (2,5 points each)', () => {
    // the four answers of the table
    expect(Math.sqrt(9 + 16)).toBe(5);
    expect(Math.sqrt(9) + Math.sqrt(16)).toBe(7); // her answer 1 is wrong
    expect(Math.sqrt(49 / 4)).toBe(7 / 2); // her answer 2 is right
    const verdicts = steps('wadiya-6', 0).find((s) => s.kind === 'batch').rows.map((r) => r.options[r.correct]);
    expect(verdicts).toEqual(['خاطئة', 'صحيحة', 'خاطئة', 'خاطئة']);
    expect(Math.sqrt(200)).toBeCloseTo(10 * Math.SQRT2, 9);
    expect((20 * Math.SQRT2) ** 2).toBeCloseTo(800, 9); // her answer 4 is wrong
    expect(squareFree(200)).toEqual({ a: 10, b: 2 });
    expect(expectedOf('wadiya-6', 0)).toEqual([7, 5]);
    expect(expectedOf('wadiya-6', 1)).toEqual([0, squareFree(200).a ** 2]);
    const right = verdicts.filter((v) => v === 'صحيحة').length;
    expect(expectedOf('wadiya-6', 2)).toEqual([right * 2.5, 4 * 2.5]);
    // x² = −25 has no solution: no real number squares to a negative
    expect([-5, 0, 5].every((x) => x * x !== -25)).toBe(true);
  });

  it('the statements keep their numbers', () => {
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 180);
    has('wadiya-2', 5, 2, '4{,}5');
    has('wadiya-3', 18, 8);
    has('wadiya-4', 20, 45, 80, 21);
    has('wadiya-5', 10);
    has('wadiya-6', '2{,}5');
  });
});
