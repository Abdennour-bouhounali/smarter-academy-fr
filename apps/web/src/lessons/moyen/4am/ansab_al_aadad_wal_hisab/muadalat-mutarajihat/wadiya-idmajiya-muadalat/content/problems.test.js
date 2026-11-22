import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Les nombres de chaque وضعية, recalculés ici depuis l'énoncé ─────────────
const steps = (id, part) => PROBLEM[id].parts[part].steps;
const numericsOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
/** Le premier entier naturel qui satisfait un prédicat (la lecture « ابتداءً من… » d'une inéquation). */
const firstNatural = (ok) => { for (let n = 0; n < 1000; n += 1) if (ok(n)) return n; return null; };

// ── Toute égalité / inégalité numérique écrite dans un `$…$` est recalculée ─────
// On lit « a = b = c » et « a < b » dont les membres n'ont AUCUNE lettre (les formules en x sont vérifiées plus bas
// par des fonctions) ; un membre qui porte une lettre ou « \ldots » (une case à compléter) est écarté.
const toExpr = (src) => {
  let s = src.replace(/−/g, '-').replace(/\\left|\\right/g, '').replace(/\\times/g, '*').replace(/\^2/g, '**2').replace(/\s+/g, '');
  let prev;
  do { prev = s; s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))'); } while (s !== prev);
  s = s.replace(/\)\(/g, ')*(');
  return s;
};
const numericSide = (side) => {
  if (/[A-Za-z\\…]/.test(side.replace(/\\times|\\d?frac|\\left|\\right/g, ''))) return null;
  const e = toExpr(side);
  if (!/^[0-9.+\-*/()]+$/.test(e)) return null;
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${e});`)();
};
const REL = /(\\leq|\\geq|<|>|=)/;
function islands(text) {
  return [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
}
/** [{ island, values: [n…], rels: [op…] }] for every island that holds ≥ 2 numeric members. */
function numericRelations(text) {
  const out = [];
  for (const isl of islands(text)) {
    const parts = isl.split(REL);
    const sides = parts.filter((_, i) => i % 2 === 0);
    const rels = parts.filter((_, i) => i % 2 === 1);
    const values = sides.map(numericSide);
    // keep consecutive numeric members only (a leading « A = » or « E(…) = » is dropped)
    let k = 0;
    while (k < values.length && values[k] === null) k += 1;
    const run = [];
    for (let i = k; i < values.length && values[i] !== null; i += 1) run.push(values[i]);
    if (run.length >= 2) out.push({ isl, values: run, rels: rels.slice(k, k + run.length - 1) });
  }
  return out;
}
const holds = (a, op, b) => ({ '=': Math.abs(a - b) < 1e-9, '<': a < b, '>': a > b, '\\leq': a <= b, '\\geq': a >= b })[op];

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-muadalat)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6 practice_lab, then the analysis 7 and the test 8, the format of unit 1)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'ahill'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'ahill', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // the مسبح resources follow its module
    for (const r of LESSON_CONFIG.resources.filter((x) => /masbah/.test(x.code))) expect(r.module).toBe(7);
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
  });

  it('every training is titled « الوضعية التدريبية N », is a declared platform addition, and has its tone and drawing', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type).toBe('platform_addition');
      expect(p.source.reason).toBe('exam_style_problem');
      expect(p.illustration || p.figure || p.table, p.id).toBeTruthy();
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6); // six distinct tones
  });

  it('the evaluated مسبح situation (75 / 560 / 5, equality at 8) is never used in a training', () => {
    for (const p of PROBLEMS) {
      const all = JSON.stringify(p);
      expect(all, p.id).not.toMatch(/\b(75|560)\b|مسبح|سباحة/);
      expect(all, p.id).not.toMatch(/75x|560 \+ 5x/);
    }
  });

  it('no sub-step is an assessment and no training only offers a typed answer without a model (mastery comes from module 8 only)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
      expect(part.steps.at(-1).kind, p.id).toBe('solution');
    }
    for (const m of LESSON_CONFIG.modules.filter((x) => x.track === 'problem')) expect(m.stage).toBe('practice_lab');
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('each step relies only on knowledge of the unit lessons (priorKnowledge), never on a brick taught later in the synthesis', () => {
    const allowed = new Set(LESSON_CONFIG.priorKnowledge);
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      for (const id of s.requires ?? []) expect(allowed.has(id), `${p.id}: ${id}`).toBe(true);
    }
  });

  it('every written numeric equality / inequality is true (explain, lines, options, prompts)', () => {
    let checked = 0;
    for (const p of PROBLEMS) {
      // the options of a `choice` are alternatives (some are WRONG on purpose): only the statement, prompts, explains,
      // lines and the CORRECT option are claims
      const trusted = [p.statement];
      for (const part of p.parts) {
        trusted.push(part.question);
        for (const st of part.steps) {
          for (const k of ['prompt', 'explain']) if (st[k]) trusted.push(st[k]);
          for (const l of st.lines ?? []) trusted.push(l);
          // the CORRECT option of a choice is a claim too
          if (st.kind === 'choice') trusted.push(st.options[st.correct]);
        }
      }
      for (const text of trusted) for (const rel of numericRelations(text)) {
        rel.rels.forEach((op, i) => expect(holds(rel.values[i], op, rel.values[i + 1]), `${p.id}: « ${rel.isl} »`).toBe(true));
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(40);
  });

  it('the relation reader really reads (self-check)', () => {
    expect(numericRelations('$450 \\times 12 = 5400$')).toEqual([{ isl: '450 \\times 12 = 5400', values: [5400, 5400], rels: ['='] }]);
    expect(numericRelations('$E(1) = 6 \\times \\dfrac{1}{4} - 2 = -0.5$')[0].values).toEqual([-0.5, -0.5]);
    const bad = numericRelations('$450 \\times 12 = 5300$')[0];
    expect(holds(bad.values[0], '=', bad.values[1])).toBe(false);
    expect(numericRelations('$4x + 16 = 72$')).toEqual([]);
  });

  // ── Chaque nombre attendu, recalculé depuis l'énoncé ─────────────────────
  it('وضعية 1 — library: 450x against 3000 + 300x', () => {
    const A = (x) => 450 * x;
    const B = (x) => 3000 + 300 * x;
    expect(numericsOf('wadiya-1', 0)).toEqual([A(12), B(12)]);
    expect(A(12)).toBeLessThan(B(12));
    // equality at 20 (9000 DA), (ب) strictly cheaper from 21 on, and stays so
    expect(A(20)).toBe(B(20));
    expect(A(20)).toBe(9000);
    const first = firstNatural((n) => B(n) < A(n));
    expect(first).toBe(21);
    for (let n = 21; n < 200; n += 1) expect(B(n)).toBeLessThan(A(n));
    expect(numericsOf('wadiya-1', 1)).toEqual([20, first]);
    expect([A(21), B(21)]).toEqual([9450, 9300]);
  });

  it('وضعية 2 — E = (3x − 1)² − (3x − 1)(x + 5): expansion, factorisation, E = 0, E < B', () => {
    const E = (x) => (3 * x - 1) ** 2 - (3 * x - 1) * (x + 5);
    const B = (x) => 6 * x ** 2 + 4 * x - 6;
    const expanded = (x) => 6 * x ** 2 - 20 * x + 6;
    const factored = (x) => (3 * x - 1) * (2 * x - 6);
    const grid = [-3, -2, -1, 0, 0.5, 1, 2, 3, 4.5];
    for (const x of grid) { expect(E(x)).toBeCloseTo(expanded(x), 9); expect(E(x)).toBeCloseTo(factored(x), 9); }
    expect(numericsOf('wadiya-2', 0)).toEqual([3 * 5 - 1]);
    expect(numericsOf('wadiya-2', 1)).toEqual([factored(0)]);
    expect(factored(0)).toBe(expanded(0));
    expect(E(1 / 3)).toBeCloseTo(0, 12);
    expect(E(3)).toBe(0);
    // the distractors of the expansion and of the factorisation are really different polynomials
    const wrongExpansions = [(x) => 6 * x ** 2 + 8 * x - 4, (x) => 6 * x ** 2 - 20 * x - 4, (x) => 6 * x ** 2 - 14 * x + 6];
    for (const f of wrongExpansions) expect(grid.some((x) => Math.abs(f(x) - E(x)) > 1e-9)).toBe(true);
    const wrongFactors = [(x) => (3 * x - 1) * (4 * x + 4), (x) => (3 * x - 1) * (2 * x + 4), (x) => (3 * x - 1) * (-2 * x + 6)];
    for (const f of wrongFactors) expect(grid.some((x) => Math.abs(f(x) - E(x)) > 1e-9)).toBe(true);
    // E < B ⇔ x > 1/2 ; equality at 1/2 (−2.5)
    expect(E(0.5)).toBeCloseTo(-2.5, 12);
    expect(B(0.5)).toBeCloseTo(-2.5, 12);
    expect(numericsOf('wadiya-2', 2)).toEqual([-12]);
    for (const x of [-5, -1, 0, 0.25, 0.5]) expect(E(x) < B(x)).toBe(false);
    for (const x of [0.51, 1, 2, 10]) expect(E(x) < B(x)).toBe(true);
  });

  it('وضعية 3 — savings: 1200 + 150x and 800 + 250x', () => {
    const S = (x) => 1200 + 150 * x;
    const Y = (x) => 800 + 250 * x;
    const meet = firstNatural((n) => S(n) === Y(n));
    expect(meet).toBe(4);
    expect(numericsOf('wadiya-3', 0)).toEqual([250 - 150, meet, S(meet)]);
    expect(S(meet)).toBe(Y(meet));
    expect(S(meet)).toBe(1800);
    const first = firstNatural((n) => Y(n) > S(n));
    expect(first).toBe(5);
    for (let n = 5; n < 100; n += 1) expect(Y(n)).toBeGreaterThan(S(n));
    expect(numericsOf('wadiya-3', 1)).toEqual([meet, first]);
    // the garment: the sum must reach 4500 (non-strict ≥), 6.25 weeks → 7
    const total = (x) => S(x) + Y(x);
    expect(total(0)).toBe(2000);
    const weeks = firstNatural((n) => total(n) >= 4500);
    expect(weeks).toBe(7);
    expect(total(6)).toBe(4400);
    expect(total(7)).toBe(4800);
    expect(numericsOf('wadiya-3', 2)).toEqual([4500 - 2000, 2500 / 400, weeks]);
  });

  it('وضعية 4 — garden: perimeter 4x + 16, 72 m, then at most 100 m', () => {
    const P = (x) => 2 * (x + (x + 8));
    for (const x of [1, 5, 14, 21]) expect(P(x)).toBe(4 * x + 16);
    expect(numericsOf('wadiya-4', 0)).toEqual([P(0)]);
    const w = (72 - 16) / 4;
    expect(P(w)).toBe(72);
    expect(numericsOf('wadiya-4', 1)).toEqual([72 - 16, w, w + 8, w * (w + 8)]);
    expect(w * (w + 8)).toBe(308);
    expect(numericsOf('wadiya-4', 2)).toEqual([(100 - 16) / 4]);
    expect(P(21)).toBe(100);
    expect(P(22)).toBeGreaterThan(100);
    // « x(x + 8) » (the area) is not the perimeter: the distractor really differs
    expect(3 * (3 + 8)).not.toBe(P(3));
  });

  it('وضعية 5 — trip: C = 4500 + 100x, R = 300x, 22.5 ≤ x ≤ 25', () => {
    const C = (x) => 4500 + 100 * x;
    const R = (x) => 300 * x;
    expect(numericsOf('wadiya-5', 0)).toEqual([C(20)]);
    expect([C(20), R(20)]).toEqual([6500, 6000]);
    const minStudents = firstNatural((n) => R(n) >= C(n));
    expect(minStudents).toBe(23);
    expect(4500 / (300 - 100)).toBe(22.5);
    expect([R(22), C(22)]).toEqual([6600, 6700]);
    expect(numericsOf('wadiya-5', 1)).toEqual([4500, 4500 / 200, minStudents]);
    const maxStudents = (7000 - 4500) / 100;
    expect(maxStudents).toBe(25);
    expect(numericsOf('wadiya-5', 2)).toEqual([maxStudents]);
    const possible = Array.from({ length: 100 }, (_, n) => n).filter((n) => R(n) >= C(n) && C(n) <= 7000);
    expect(possible).toEqual([23, 24, 25]);
    // the statement keeps the sheet's numbers
    for (const n of [4500, 100, 300, 7000]) expect(PROBLEM['wadiya-5'].statement).toContain(String(n));
  });

  it('وضعية 6 — carpets: A = (x + 2)², B = x(x + 6), B − A = 2x − 4 (renumbered 2026-11-12: x > 8 was the 🏆\'s answer)', () => {
    const A = (x) => (x + 2) ** 2;
    const B = (x) => x * (x + 6);
    for (const x of [0, 1, 3, 8, 10, 25]) {
      expect(A(x)).toBe(x ** 2 + 4 * x + 4);
      expect(B(x)).toBe(x ** 2 + 6 * x);
      expect(B(x) - A(x)).toBe(2 * x - 4);
    }
    expect(numericsOf('wadiya-6', 0)).toEqual([6]);
    expect(numericsOf('wadiya-6', 1)).toEqual([4, 4, 2]);
    expect(A(2)).toBe(B(2));
    expect(A(2)).toBe(16);
    for (const x of [0, 1, 2]) expect(B(x) > A(x)).toBe(false);
    for (const x of [2.5, 3, 10, 30]) expect(B(x) > A(x)).toBe(true);
    expect(numericsOf('wadiya-6', 2)).toEqual([A(10), B(10)]);
    expect([A(10), B(10), B(10) - A(10)]).toEqual([144, 160, 16]);
    // the distractors of A are not (x + 2)²
    for (const f of [(x) => x ** 2 + 4, (x) => x ** 2 + 2 * x + 4, (x) => x ** 2 + 4 * x + 2]) expect([1, 2, 3].some((x) => f(x) !== A(x))).toBe(true);
  });

  it('the statements keep their numbers', () => {
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 450, 3000, 300);
    has('wadiya-2', 3, 5, 6, 4);
    has('wadiya-3', 1200, 150, 800, 250, 4500);
    has('wadiya-4', 8);
    has('wadiya-5', 4500, 100, 300, 7000);
    has('wadiya-6', 2, 6);
  });
});
