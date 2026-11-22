import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateIllustration } from '../../../../../../common/problems/problemIllustration';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Les fonctions affines de l'unité, exactes (entiers) ──
const affine = (a, b) => (x) => a * x + b;
const slope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);
/** Solution de a1 x + b1 = a2 x + b2 (exacte : doit être un entier ici). */
const crossing = ([a1, b1], [a2, b2]) => {
  expect(a1).not.toBe(a2);
  expect(Math.abs((b2 - b1) % (a1 - a2))).toBe(0);
  return (b2 - b1) / (a1 - a2);
};

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes de rédaction, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \leq \geq \neq ; chaque membre purement numérique (entiers,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué, et chaque relation entre deux membres numériques
// VOISINS est vérifiée. Les membres contenant une lettre (x, b, f(…)) ou un trou (\ldots) sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  const s = src
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/\d/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(\\leq|\\geq|\\neq|=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = {
        '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)),
        '<': x < y - EPS, '>': x > y + EPS, '\\leq': x <= y + EPS, '\\geq': x >= y - EPS, '\\neq': Math.abs(x - y) > EPS,
      }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
const textsOfStep = (s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])].filter(Boolean);
// distractors are false on purpose: only the CORRECT option of a choice / batch row is a statement to verify
const checkableOfStep = (s) => [s.prompt, s.explain, s.kind === 'choice' ? s.options[s.correct] : null, ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, r.options[r.correct]])].filter(Boolean);

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-taalufiya)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then the analysis 7 and the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'itqan'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation', title: 'إختبار أولي' });
    expect(LESSON_CONFIG.modules.find((m) => m.slug === 'al-wadiya').track).toBeUndefined();
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // the textbook-less Tipaza situation moved from module 1 to module 7, with its two laboratories
    for (const r of LESSON_CONFIG.resources.filter((x) => x.code === 'situation-rihla-tipaza' || x.code.startsWith('plan-compare'))) expect(r.module, r.code).toBe(7);
  });

  it('every training module is titled « الوضعية التدريبية N », declared a platform addition, and carries a drawn support and a tone', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type, p.id).toBe('platform_addition');
      expect(p.source.reason, p.id).toBe('exam_style_problem');
      expect(Boolean(p.figure || p.visual || p.table || p.illustration), p.id).toBe(true);
      expect(p.tone, p.id).toBeTruthy();
      if (p.illustration) expect(validateIllustration(p.illustration), p.id).toEqual([]);
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    // 2–4 parts each, and the last step of every part is the written answer
    for (const p of PROBLEMS) {
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      for (const part of p.parts) expect(part.steps.at(-1).kind, `${p.id} ${part.label}`).toBe('solution');
    }
  });

  it('the trainings share no number with the situation of the module 7 nor with the test of the module 8', () => {
    // 36 / 4 participants, 150x + 6000, 200x + 5000, kayak 150x / 50x + 300 / 600 ; Sablettes 40 / 36 / 4, 120x + 6400, 180x + 4000
    const forbidden = [/\b6000\b/, /\b5000\b/, /\b12000\b/, /\b10800\b/, /\b11400\b/, /\b6400\b/, /\b4000\b/, /\b10720\b/, /\b10480\b/, /شاطئ/];
    for (const p of PROBLEMS) for (const re of forbidden) expect(JSON.stringify(p), `${p.id} ${re}`).not.toMatch(re);
  });

  it('no sub-step is an assessment: mastery comes from module 8 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
    for (const m of LESSON_CONFIG.modules.filter((x) => x.track === 'problem')) expect(m.stage).toBe('practice_lab');
  });

  it('every `requires` is a resource of the lesson\'s priorKnowledge', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      for (const r of s.requires ?? []) expect(LESSON_CONFIG.priorKnowledge, `${p.id}: ${r}`).toContain(r);
    }
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('a story carries a value, money is in دج, every formula is a $…$ island', () => {
    for (const p of PROBLEMS) {
      expect(p.statement.length, p.id).toBeGreaterThan(150);
      const all = [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap(textsOfStep)])];
      for (const t of all) {
        const prose = t.replace(/\$[^$]*\$/g, '');
        expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyabhfgvT]\b|\bDA\b|نقاط التعلّم|نقطة التعلّم/);
      }
    }
    // the woven value of each story (rotates inside the lesson)
    const values = {
      'wadiya-1': /يحبّ ياسين القراءة/, 'wadiya-2': /بأمانته/, 'wadiya-3': /تبرّعات السكّان/,
      'wadiya-4': /يتعاون تلاميذ القسم/, 'wadiya-5': /برّ جدّه/, 'wadiya-6': /استغلال وقته/,
    };
    for (const [id, re] of Object.entries(values)) expect(PROBLEM[id].statement, id).toMatch(re);
  });

  it('every written relation (explain, prompt, solution lines, options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      for (const t of checkableOfStep(s)) checked += checkText(t, `${p.id} ${part.label} step ${si + 1}`);
    }));
    expect(checked).toBeGreaterThan(70);
  });

  it('the checker really checks (self-check)', () => {
    expect(evalExpr('\\dfrac{1050-690}{20-12}')).toBe(45);
    expect(evalExpr('-3\\times4+30')).toBe(18);
    expect(() => checkText('$25 \\times 12 + 300 = 601$', 'self')).toThrow();
    expect(evalExpr('25x+300')).toBeNull();
  });

  // ── Chaque nombre attendu, recalculé depuis l'énoncé ─────────────────────
  it('وضعية 1 — library card: f(x) = 25x + 300 against g(x) = 50x', () => {
    const f = affine(25, 300), g = affine(50, 0);
    expect(f(12)).toBe(600);
    expect(expectedOf('wadiya-1', 0)).toEqual([f(12), 1100 - 300, (1100 - 300) / 25]);
    expect(f((1100 - 300) / 25)).toBe(1100);
    const cross = crossing([25, 300], [50, 0]);
    expect(cross).toBe(12);
    expect(expectedOf('wadiya-1', 1)).toEqual([300, cross]);
    expect(correctOf('wadiya-1', 1, 2)).toContain('13'); // cheaper from the 13th book
    expect(f(13)).toBeLessThan(g(13));
    expect(f(12)).toBe(g(12));
    expect(f(4)).toBeGreaterThan(g(4));
    expect(correctOf('wadiya-1', 0, 0)).toBe('$f(x) = 25x + 300$');
  });

  it('وضعية 2 — taxi: the drawn lines (A) 30x + 100 and (B) 40x meet at (10 ; 400)', () => {
    const { functions, range, unit, unitY } = PROBLEM['wadiya-2'].visual;
    const [A, B] = functions;
    expect([A.a, A.b, B.a, B.b]).toEqual([30, 100, 40, 0]);
    const x = crossing([A.a, A.b], [B.a, B.b]);
    expect([x, affine(A.a, A.b)(x)]).toEqual([10, 400]);
    // the grid carries the crossing and the two points read in the prompts
    expect(x % PROBLEM['wadiya-2'].visual.xStep).toBe(0);
    expect(400 % PROBLEM['wadiya-2'].visual.yStep).toBe(0);
    expect(slope([0, 100], [20, 700])).toBe(30);
    expect(affine(30, 100)(20)).toBe(700);
    expect(700).toBeLessThanOrEqual(range.yMax);
    expect((range.xMax - range.xMin) * unit).toBeLessThanOrEqual(460);
    expect((range.yMax - range.yMin) * unitY).toBeLessThanOrEqual(460);
    expect(expectedOf('wadiya-2', 0)).toEqual([100, 30]);
    expect(expectedOf('wadiya-2', 1)).toEqual([x, 100]);
    expect(expectedOf('wadiya-2', 2)).toEqual([affine(30, 100)(15)]);
    expect(affine(30, 100)(15)).toBeLessThan(affine(40, 0)(15));
    expect(affine(40, 0)(15) - affine(30, 100)(15)).toBe(50);
    expect(correctOf('wadiya-2', 0, 0)).toBe('$f(x) = 30x + 100$');
  });

  it('وضعية 3 — water bill: two readings of the table give T(x) = 45x + 150', () => {
    const { head, rows } = PROBLEM['wadiya-3'].table;
    const [x1, x2] = head.slice(1).map(Number);
    const [y1, y2] = rows[0].slice(1).map(Number);
    expect([x1, y1, x2, y2]).toEqual([12, 690, 20, 1050]);
    const a = slope([x1, y1], [x2, y2]);
    const b = y1 - a * x1;
    expect([a, b]).toEqual([45, 150]);
    expect(affine(a, b)(x2)).toBe(y2);
    expect(y2 - y1).not.toBe(a); // the difference without division is the trap
    expect(expectedOf('wadiya-3', 0)).toEqual([a, b]);
    const T = affine(a, b);
    expect(expectedOf('wadiya-3', 1)).toEqual([T(15), 960 - b, (960 - b) / a]);
    expect(T((960 - b) / a)).toBe(960);
  });

  it('وضعية 4 — cooperative: x + y = 15 and 40x + 20y = 480, solution (9 ; 6) read on the drawn lines', () => {
    const { functions, range, unit, unitY, xStep, yStep } = PROBLEM['wadiya-4'].visual;
    const [d1, d2] = functions;
    // y = −x + 15 and 40x + 20y = 480  ⇔  y = −2x + 24
    expect([d1.a, d1.b, d2.a, d2.b]).toEqual([-1, 15, -40 / 20, 480 / 20]);
    const x = crossing([d1.a, d1.b], [d2.a, d2.b]);
    const y = affine(d1.a, d1.b)(x);
    expect([x, y]).toEqual([9, 6]);
    expect([x + y, 40 * x + 20 * y]).toEqual([15, 480]);
    expect(x % xStep).toBe(0);
    expect(y % yStep).toBe(0);
    expect(expectedOf('wadiya-4', 1)).toEqual([x, y, 40 * x + 20 * y]);
    expect(range.yMax).toBeGreaterThanOrEqual(d2.b);
    expect((range.xMax - range.xMin) * unit).toBeLessThanOrEqual(460);
    expect((range.yMax - range.yMin) * unitY).toBeLessThanOrEqual(460);
    // the reversed pair (6 ; 9) breaks the takings, the (10 ; 5) of part 3 breaks them too (500 ≠ 480)
    expect(40 * y + 20 * x).toBe(420);
    expect(expectedOf('wadiya-4', 2)).toEqual([40 * 10 + 20 * 5]);
    expect(10 + 5).toBe(15);
    expect(40 * 10 + 20 * 5).not.toBe(480);
    // the second equation as y = ax + b is the correct option
    expect(correctOf('wadiya-4', 0, 1)).toBe('$y = -2x + 24$');
  });

  it('وضعية 5 — phone offers: g from two bills, equality at 40 min, budget 1300', () => {
    const { head, rows } = PROBLEM['wadiya-5'].table;
    const [x1, x2] = head.slice(1).map(Number);
    const [y1, y2] = rows[0].slice(1).map(Number);
    const a = slope([x1, y1], [x2, y2]);
    const b = y1 - a * x1;
    expect([x1, y1, x2, y2, a, b]).toEqual([30, 800, 50, 1200, 20, 200]);
    expect(expectedOf('wadiya-5', 0)).toEqual([a, b]);
    const f = affine(10, 600), g = affine(a, b);
    const x = crossing([10, 600], [a, b]);
    expect([x, f(x)]).toEqual([40, 1000]);
    expect(expectedOf('wadiya-5', 1)).toEqual([x, g(55) - f(55)]);
    expect([f(55), g(55)]).toEqual([1150, 1300]);
    expect(f(55)).toBeLessThan(g(55));
    const budget = 1300;
    expect(expectedOf('wadiya-5', 2)).toEqual([(budget - 600) / 10, (budget - 200) / a]);
    expect(f(70)).toBe(budget);
    expect(g(55)).toBe(budget);
    expect(f(71)).toBeGreaterThan(budget);
    expect(g(56)).toBeGreaterThan(budget);
  });

  it('وضعية 6 — two candles: f(x) = −3x + 30, g(x) = −2x + 24', () => {
    const chips = Object.fromEntries(PROBLEM['wadiya-6'].illustration.chips.map((c) => [c.label, c.value]));
    expect(Object.values(chips)).toEqual([30, 24, 3, 2]);
    const f = affine(-3, 30), g = affine(-2, 24);
    expect(expectedOf('wadiya-6', 0)).toEqual([f(4), g(4)]);
    expect([f(4), g(4)]).toEqual([18, 16]);
    const stopF = 30 / 3, stopG = 24 / 2;
    expect(expectedOf('wadiya-6', 1)).toEqual([stopF, stopG]);
    expect(f(stopF)).toBe(0);
    expect(g(stopG)).toBe(0);
    expect(stopF).toBeLessThan(stopG);
    const x = crossing([-3, 30], [-2, 24]);
    expect(x).toBe(6);
    expect(expectedOf('wadiya-6', 2)).toEqual([x]);
    expect([f(x), g(x)]).toEqual([12, 12]);
    expect(f(0)).toBeGreaterThan(g(0)); // the first is longer before the crossing
    expect(f(7)).toBeLessThan(g(7)); // the second after
  });
});
