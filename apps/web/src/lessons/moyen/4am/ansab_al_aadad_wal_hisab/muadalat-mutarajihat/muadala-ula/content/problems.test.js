import { describe, it, expect } from 'vitest';
import * as L from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (fractions de packages/core/arithmetic/linear.js) ──
const { frac, add, sub, mul, div, eq, linear, solveEquation, holds, linAt, toNumber } = L;
/** La solution unique de l'équation L = R, en nombre (exact : la fraction doit être entière). */
const solve = (l, r) => {
  const s = solveEquation(linear(l), linear(r));
  expect(s.kind).toBe('unique');
  return s.x;
};
const at = (expr, x) => linAt(linear(expr), x);
const int = (f) => { expect(f.d).toBe(1); return f.n; };

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, solution lines, bonne option) ──
// Chaque formule $…$ est découpée sur = \neq < > ; chaque membre purement numérique
// (entiers, décimaux 2{,}5, ×, +, −, parenthèses, \dfrac{a}{b}) est évalué EN FRACTIONS
// EXACTES, et chaque relation entre deux membres numériques VOISINS est vérifiée. Les
// membres contenant une lettre (x, p, a, b) ou \ldots sont ignorés.
// La seule égalité fausse VOULUE : « 120 = 150 », à quoi se réduit l'équation sans solution.
const DELIBERATELY_FALSE = new Set(['120 = 150']);
function evalExpr(src) {
  const s = src
    .replace(/\\left|\\right/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\times/g, '*')
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return mul(atom(), -1); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad ) in ${src}`); i++; return v; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return L.parseNumber(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : div(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (DELIBERATELY_FALSE.has(f.trim())) continue;
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const c = L.cmp(x, y);
      const ok = { '=': c === 0, '<': c < 0, '>': c > 0, '\\neq': c !== 0 }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 1 (unité 4) « حل معادلة من الدرجة الأولى بمجهول واحد »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(76);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare x, p, a/b or « DA » in the Arabic text — every formula is a $…$ island', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xpab]\b|\bDA\b|[=×]/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(60);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$7 \\times 6 - 4 = 39$', 'mutant')).toThrow();
    expect(() => checkText('$x = \\dfrac{495}{45} = 12$', 'mutant')).toThrow();
    expect(() => checkText('$5 \\times (-5) + 2 = -27$', 'mutant')).toThrow();
    expect(() => checkText('$1200 \\neq 1200$', 'mutant')).toThrow();
    expect(() => checkText('$121 = 150$', 'mutant')).toThrow(); // seule « 120 = 150 » est permise
    expect(checkText('$7 \\times 6 - 4 = 38 = 2 \\times 6 + 26$ و $x = \\dfrac{-15}{3} = -5$ و $80 \\times (36 - 5) = 2480$', 'ok')).toBe(4);
  });

  it('مسألة 1 — the balance, the bags of balloons and the price are computed, not typed', () => {
    // 1) 7 sacs et 4 baudruches = 2 sacs et 26 ballons
    const x1 = solve('7x-4', '2x+26');
    expect(eq(x1, 6)).toBe(true);
    expect(holds(linear('7x-4'), linear('2x+26'), x1)).toBe(true);
    const a1 = sub(7, 2), b1 = add(26, 4);
    expect(eq(div(b1, a1), x1)).toBe(true);
    expect(expectedOf('masala-1', 0)).toEqual([toNumber(a1), toNumber(b1), int(x1)]);
    expect(correctOf('masala-1', 0, 0)).toBe('$7x - 4 = 2x + 26$');
    // les distracteurs donnent d'AUTRES solutions (le piège est réel)
    expect(eq(solve('7x+4', '2x+26'), x1)).toBe(false);
    expect(eq(solve('9x-4', '26'), x1)).toBe(false);
    // 2) 5 sacs et 2 ballons = 2 sacs et 13 baudruches : solution NÉGATIVE (5 baudruches par sac)
    const x2 = solve('5x+2', '2x-13');
    expect(eq(x2, -5)).toBe(true);
    expect(eq(at('5x+2', x2), at('2x-13', x2))).toBe(true);
    expect(expectedOf('masala-1', 1)).toEqual([-13 - 2, int(x2), toNumber(at('5x+2', x2))]);
    expect(toNumber(at('5x+2', x2))).toBe(-23);
    expect(correctOf('masala-1', 1, 0)).toBe(`${-int(x2)} بالونات`);
    // 3) les 9 sacs (7 + 2) : 54 ballons pour 70200 دج → 54p = 70200
    const balls = (7 + 2) * int(x1);
    const p = solve(`${balls}x`, '70200');
    expect(expectedOf('masala-1', 2)).toEqual([balls, int(p), 26 * int(p)]);
    expect([balls, int(p), 26 * int(p)]).toEqual([54, 1300, 33800]);
    expect(correctOf('masala-1', 2, 0)).toBe(`$${balls}p = 70200$`);
  });

  it('مسألة 2 — the taxi fares, the equal fare and the impossible equation are computed, not typed', () => {
    const A = '45x+120', B = '40x+200', C = '45x+150';
    // 1) 120 + 45x = 615
    const d1 = solve(A, '615');
    expect(expectedOf('masala-2', 0)).toEqual([615 - 120, int(d1)]);
    expect(int(d1)).toBe(11);
    expect(toNumber(at(A, d1))).toBe(615);
    expect(eq(solve('120x+45', '615'), d1)).toBe(false); // distracteur 45 + 120x
    // 2) A = B : 5x = 80, x = 16, 840 دج des deux côtés
    const d2 = solve(A, B);
    expect(expectedOf('masala-2', 1)).toEqual([200 - 120, int(d2), toNumber(at(A, d2))]);
    expect([int(d2), toNumber(at(A, d2)), toNumber(at(B, d2))]).toEqual([16, 840, 840]);
    // 3) A = C n'a AUCUNE solution (0x = 30) ; 22 km : B est la moins chère
    expect(solveEquation(linear(A), linear(C)).kind).toBe('none');
    const km = frac(22);
    const fares = [A, B, C].map((f) => toNumber(at(f, km)));
    expect(fares).toEqual([1110, 1080, 1140]);
    expect(Math.min(...fares)).toBe(fares[1]);
    expect(expectedOf('masala-2', 2)).toEqual([...fares, fares[1]]);
    expect(correctOf('masala-2', 2, 2)).toBe('الشركة «ب»');
    expect(fares[2] - fares[0]).toBe(150 - 120);
  });

  it('مسألة 3 — the claim, the break-even hours and the brothers are computed, not typed', () => {
    const NO = '80x', CARD = '55x+500';
    // 1) 15 h : 1200 ≠ 1325, Yassine a tort ; égalité à 20 h
    const claim = frac(15);
    expect(holds(linear(NO), linear(CARD), claim)).toBe(false);
    const h1 = solve(NO, CARD);
    expect(expectedOf('masala-3', 0)).toEqual([toNumber(at(NO, claim)), toNumber(at(CARD, claim)), int(h1)]);
    expect([toNumber(at(NO, claim)), toNumber(at(CARD, claim)), int(h1)]).toEqual([1200, 1325, 20]);
    expect(correctOf('masala-3', 0, 1)).toBe(`نطرح $55x$ من الطرفين: $${80 - 55}x = 500$`);
    // 2) mai : 55x + 500 = 1820 → 24 h ; sans carte 1920 ; économie 100 = 25 × (24 − 20)
    const h2 = solve(CARD, '1820');
    const without = toNumber(at(NO, h2));
    expect(expectedOf('masala-3', 1)).toEqual([1820 - 500, int(h2), without, without - 1820]);
    expect([int(h2), without, without - 1820]).toEqual([24, 1920, 100]);
    expect(without - 1820).toBe((80 - 55) * (int(h2) - int(h1)));
    // 3) juin : 55x + 500 = 80(x − 5) → 55x + 500 = 80x − 400 → 25x = 900 → 36 h et 31 h, 2480 دج chacun
    const h3 = solve(CARD, '80x-400');
    const sofiane = sub(h3, 5);
    expect(expectedOf('masala-3', 2)).toEqual([80 * 5, 500 + 400, int(h3), int(sofiane), toNumber(at(CARD, h3))]);
    expect([int(h3), int(sofiane), toNumber(at(CARD, h3)), toNumber(at(NO, sofiane))]).toEqual([36, 31, 2480, 2480]);
    expect(eq(solve(CARD, '80x-5'), h3)).toBe(false); // distracteur 80x − 5
  });
});
