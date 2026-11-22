import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Helpers ────────────────────────────────────────────────────────────────
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
/** Solution EXACTE de a·x + b = c·x + d (entiers) : { num, den } réduite, den > 0. */
const solveLinear = (a, b, c, d) => {
  let num = d - b, den = a - c;
  if (den < 0) { num = -num; den = -den; }
  const g = (p, q) => (q ? g(q, p % q) : Math.abs(p));
  const k = g(num, den) || 1;
  return { num: num / k, den: den / k };
};

// ── Évaluateur des formules écrites ($…$) ─────────────────────────────────────
// Nombres (décimaux 8{,}75), + − × ÷, \frac / \dfrac, parenthèses, multiplication
// implicite (3x, 3(16 + x), 80n) ; les lettres x et n prennent la valeur de `vars`.
// Une formule est découpée sur = < > \leq \geq ; chaque membre est évalué ; une
// lettre sans valeur rend le membre « non numérique » (ignoré).
function evalExpr(src, vars = {}) {
  let s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()xn]+$/.test(s)) return null;
  for (const v of ['x', 'n']) if (s.includes(v) && vars[v] == null) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad ( in ${src}`); i++; return v; }
    if (s[i] === 'x' || s[i] === 'n') return vars[s[i++]];
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad token in ${src}`);
    return Number(s.slice(j, i));
  };
  const implicit = () => { let v = atom(); while (s[i] === '(' || s[i] === 'x' || s[i] === 'n') v *= atom(); return v; };
  const prod = () => { let v = implicit(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = implicit(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const EPS = 1e-9;
const REL = {
  '=': (a, b) => Math.abs(a - b) < EPS, '<': (a, b) => a < b - EPS, '>': (a, b) => a > b + EPS,
  '\\leq': (a, b) => a < b + EPS, '\\geq': (a, b) => a > b - EPS,
};
/** Vrai/faux d'une relation complète (tous ses maillons), `null` si un membre n'est pas évaluable. */
function holds(formula, vars) {
  const parts = formula.replace(/^\$|\$$/g, '').split(/(=|<|>|\\leq|\\geq)/);
  let ok = true;
  for (let k = 1; k + 1 < parts.length; k += 2) {
    const [a, b] = [evalExpr(parts[k - 1], vars), evalExpr(parts[k + 1], vars)];
    if (a == null || b == null) return null;
    ok = ok && REL[parts[k]](a, b);
  }
  return ok;
}
/** Vérifie chaque maillon NUMÉRIQUE des formules d'un texte ; renvoie le nombre de maillons vérifiés. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\leq|\\geq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [a, b] = [evalExpr(parts[k - 1]), evalExpr(parts[k + 1])];
      if (a == null || b == null) continue;
      expect(REL[parts[k]](a, b), `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 4 (unité 4) « ترييض مشكلة »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(77);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
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

  it('no bare letter, operator or relation in the Arabic prose — every formula is a $…$ island', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[A-Za-z=<>+×÷√²\\]|\d\s*\/\s*\d/);
      expect(t.split('$').length % 2, `${p.id}: unbalanced $ in ${t}`).toBe(1);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(45);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$12 + 16 + 23 = 52$', 'mutant')).toThrow();
    expect(() => checkText('$\\frac{700}{80} = 8{,}57$', 'mutant')).toThrow();
    expect(() => checkText('$1000 - (400 + 6 \\times 70) = 190$', 'mutant')).toThrow();
    expect(() => checkText('$45 < 45$', 'mutant')).toThrow();
    expect(checkText('$13 + 17 + 24 = 54 > 52$ و $\\frac{940}{160} = 5{,}875$', 'ok')).toBe(3);
    expect(holds('$44 + x = 3(16 + x)$', { x: -2 })).toBe(true);
    expect(holds('$44 + x = 3 \\times 16 + x$', { x: -2 })).toBe(false);
  });

  it('مسألة 1 — the ages are computed, not typed; every wrong translation is really wrong', () => {
    const F = 44, kids = [5, 9, 16], year = 2026, S = kids.reduce((a, b) => a + b, 0);
    expect(S).toBe(30);
    // 1) F + x = S + 3x → x = (F − S) / 2, entier et positif
    const x1 = solveLinear(1, F, 3, S);
    expect(x1).toEqual({ num: 7, den: 1 });
    expect(expectedOf('masala-1', 0)).toEqual([x1.num, F + x1.num]);
    expect(kids.map((k) => k + x1.num).reduce((a, b) => a + b, 0)).toBe(F + x1.num); // 12 + 16 + 23 = 51
    const eq1 = choicesOf('masala-1', 0)[1];
    eq1.options.forEach((o, k) => expect(holds(o, { x: x1.num }), `masala-1 1) option ${k}`).toBe(k === eq1.correct));
    // 2) F + x = 3(16 + x) → x = −2 : solution négative, l'événement est passé (2024)
    const x2 = solveLinear(1, F, 3, 3 * kids[2]);
    expect(x2).toEqual({ num: -2, den: 1 });
    expect(expectedOf('masala-1', 1)).toEqual([x2.num, year + x2.num]);
    expect(F + x2.num).toBe(3 * (kids[2] + x2.num)); // 42 = 3 × 14
    for (let t = 0; t <= 60; t++) expect(F + t).not.toBe(3 * (kids[2] + t)); // jamais dans l'avenir
    const eq2 = choicesOf('masala-1', 1)[0];
    eq2.options.forEach((o, k) => expect(holds(o, { x: x2.num }), `masala-1 2) option ${k}`).toBe(k === eq2.correct));
    // 3) S + 3x > F + x ⇔ x > 7 : le plus petit entier est 8 → 2034
    const ineq = choicesOf('masala-1', 2)[0];
    for (let t = 0; t <= 20; t++) expect(holds(ineq.options[ineq.correct], { x: t }), `x = ${t}`).toBe(t > 7);
    expect(correctOf('masala-1', 2, 1)).toBe('$x > 7$');
    const first = Array.from({ length: 40 }, (_, t) => t).find((t) => S + 3 * t > F + t);
    expect(first).toBe(8);
    expect(expectedOf('masala-1', 2)).toEqual([first, year + first]);
    ineq.options.forEach((o, k) => {
      if (k === ineq.correct) return;
      expect(Array.from({ length: 21 }, (_, t) => holds(o, { x: t }) === (t > 7)).every(Boolean), `masala-1 3) wrong option ${k} is really wrong`).toBe(false);
    });
  });

  it('مسألة 2 — the prices, the bag threshold and the oranges are computed, not typed', () => {
    const tomKg = 3, potKg = 2, paid = 520, gap = 40, bag = 700, bagKg = 10;
    // 1) 3(x + 40) + 2x = 520 ⇔ 5x = 520 − 120
    const pot = solveLinear(tomKg + potKg, tomKg * gap, 0, paid);
    expect(pot).toEqual({ num: 80, den: 1 });
    const tom = pot.num + gap;
    expect(expectedOf('masala-2', 0)).toEqual([pot.num, tom]);
    expect(tomKg * tom + potKg * pot.num).toBe(paid);
    const eq = choicesOf('masala-2', 0)[1];
    eq.options.forEach((o, k) => expect(holds(o, { x: pot.num }), `masala-2 1) option ${k}`).toBe(k === eq.correct));
    // 2) 80n > 700 ⇔ n > 700/80 = 8,75 (exact : 80 × 875 = 700 × 100) → à partir de 9 kg ; 8 kg : 640 < 700
    expect(pot.num * 875).toBe(bag * 100);
    const from = Array.from({ length: bagKg + 1 }, (_, n) => n).find((n) => pot.num * n > bag);
    expect(from).toBe(9);
    expect(expectedOf('masala-2', 1)).toEqual([from, 8 * pot.num]);
    expect(8 * pot.num).toBeLessThan(bag);
    const tr = choicesOf('masala-2', 1)[0];
    for (let n = 0; n <= bagKg; n++) expect(holds(tr.options[tr.correct], { n }), `n = ${n}`).toBe(n >= from);
    // 3) 700 + 3 × 120 + 160x ≤ 2000 ⇔ x ≤ 940/160 = 5,875 → 5 kg, reste 140 DA
    const budget = 2000, orange = 160;
    const fixed = bag + tomKg * tom;
    expect(fixed).toBe(1060);
    expect((budget - fixed) * 1000).toBe(orange * 5875);
    const most = Math.floor((budget - fixed) / orange);
    expect(most).toBe(5);
    expect(expectedOf('masala-2', 2)).toEqual([most, budget - fixed - most * orange]);
    expect(budget - fixed - most * orange).toBe(140);
    const ineq = choicesOf('masala-2', 2)[1];
    for (let x = 0; x <= 15; x++) expect(holds(ineq.options[ineq.correct], { x }), `x = ${x}`).toBe(x <= most);
    expect(correctOf('masala-2', 2, 2)).toBe('$x \\leq 5{,}875$');
  });

  it('مسألة 3 — the tanks are computed, not typed; the 90-minute solution exceeds the capacity', () => {
    const cap = 1000, a0 = 160, ra = 12, b0 = 400, rb = 6, need = 700;
    const start = 17 * 60 + 20, cut = 18 * 60 + 5;
    // 1) 160 + 12x = 400 + 6x → x = 40, 640 L < 1000
    const t1 = solveLinear(ra, a0, rb, b0);
    expect(t1).toEqual({ num: 40, den: 1 });
    expect(expectedOf('masala-3', 0)).toEqual([t1.num, a0 + ra * t1.num]);
    expect(a0 + ra * t1.num).toBe(b0 + rb * t1.num);
    expect(a0 + ra * t1.num).toBeLessThan(cap);
    const eq = choicesOf('masala-3', 0)[1];
    eq.options.forEach((o, k) => expect(holds(o, { x: t1.num }), `masala-3 1) option ${k}`).toBe(k === eq.correct));
    // 2) plein à 70 min ; « 300 L de plus » donne x = 90 > 70 : impossible, l'écart plafonne à 180
    const full = solveLinear(ra, a0, 0, cap);
    expect(full).toEqual({ num: 70, den: 1 });
    const t300 = solveLinear(ra, a0, rb, b0 + 300);
    expect(t300).toEqual({ num: 90, den: 1 });
    expect(expectedOf('masala-3', 1)).toEqual([full.num, t300.num]);
    expect(t300.num).toBeGreaterThan(full.num);
    expect(a0 + ra * t300.num).toBeGreaterThan(cap);
    const level = (x0, r, t) => Math.min(cap, x0 + r * t);
    const gaps = Array.from({ length: 200 }, (_, t) => level(a0, ra, t) - level(b0, rb, t));
    expect(Math.max(...gaps)).toBe(180);
    expect(gaps.indexOf(180)).toBe(full.num);
    const [fullEq, gapEq] = [choicesOf('masala-3', 1)[0], choicesOf('masala-3', 1)[1]];
    fullEq.options.forEach((o, k) => expect(holds(o, { x: full.num }), `masala-3 2) full option ${k}`).toBe(k === fullEq.correct));
    gapEq.options.forEach((o, k) => expect(holds(o, { x: t300.num }), `masala-3 2) gap option ${k}`).toBe(k === gapEq.correct));
    // 3) 400 + 6x ≥ 700 ⇔ x ≥ 50 ; 160 + 12x ≥ 700 ⇔ x ≥ 45 ; ensemble x ≥ 50 ; annoncé 45 min
    const minB = Math.ceil((need - b0) / rb), minA = Math.ceil((need - a0) / ra);
    expect([minB, minA]).toEqual([50, 45]);
    expect((need - b0) % rb).toBe(0);
    expect((need - a0) % ra).toBe(0);
    const both = Math.max(minA, minB), announced = cut - start;
    expect(announced).toBe(45);
    expect(expectedOf('masala-3', 2)).toEqual([minB, minA, both, announced]);
    expect(announced).toBeLessThan(both);
    expect(b0 + rb * announced).toBe(670);
    expect(a0 + ra * announced).toBe(need);
    const tr = choicesOf('masala-3', 2)[0];
    for (let x = 0; x <= 80; x++) expect(holds(tr.options[tr.correct], { x }), `x = ${x}`).toBe(x >= minB);
  });
});
