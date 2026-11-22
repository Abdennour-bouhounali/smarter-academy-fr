import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';
import { SITUATION, TEST } from './textbook';
import * as FIG from './figures';

/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي — الوحدة 12 « الأشعة في معلم » (modules 1 à 6) : le contrat GuidedProblem,
 * l'agencement des modules, et CHAQUE nombre recalculé depuis les coordonnées de l'énoncé (milieux, composantes, distances
 * en entiers puis racines, π r, périmètres, aires, coûts). Même patron que `wadiya-idmajiya-aadad/content/problems.test.js`.
 */

// ── Géométrie EXACTE en entiers : composantes, milieu (×2 pour rester entier), carré de la distance. ──
const comp = ([xa, ya], [xb, yb]) => [xb - xa, yb - ya];
const dist2 = ([xa, ya], [xb, yb]) => (xb - xa) ** 2 + (yb - ya) ** 2;
const mid = (a, b) => { const x = a[0] + b[0]; const y = a[1] + b[1]; expect(x % 2 === 0 && y % 2 === 0).toBe(true); return [x / 2, y / 2]; };
const isqrt = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };
const round = (v, d) => Math.round(v * 10 ** d) / 10 ** d;

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (statement, prompt, explain, options, lines) ──
// Chaque formule $…$ est découpée sur = < > \neq \approx ; chaque membre purement numérique (entiers, décimaux 2{,}24,
// \dfrac, \sqrt, ^2, ×, ÷, +, −, parenthèses, produit implicite 3\sqrt{5}) est évalué, et chaque relation entre deux
// membres numériques VOISINS est vérifiée. Les membres qui contiennent une lettre (x_I, AB, MT…) sont ignorés.
function evalExpr(src) {
  const s = src
    .replace(/\\,/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\\dfrac/g, 'F')
    .replace(/\\sqrt/g, 'R')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()^{}FR]+$/.test(s)) return null;
  let i = 0;
  const fail = () => { throw new Error(`cannot parse « ${src} »`); };
  const group = () => { if (s[i] !== '{') fail(); i += 1; const v = sum(); if (s[i] !== '}') fail(); i += 1; return v; };
  const primary = () => {
    if (s[i] === '(') { i += 1; const v = sum(); if (s[i] !== ')') fail(); i += 1; return v; }
    if (s[i] === 'F') { i += 1; const n = group(); const d = group(); return n / d; }
    if (s[i] === 'R') { i += 1; return Math.sqrt(group()); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
    if (i === j) fail();
    return Number(s.slice(j, i));
  };
  const power = () => {
    let v = primary();
    if (s[i] === '^') { i += 1; const e = s[i] === '{' ? group() : primary(); v **= e; }
    // produit implicite : 3\sqrt{5}, 2(…)
    while (s[i] === 'R' || s[i] === '(' || s[i] === 'F') v *= power();
    return v;
  };
  const unary = () => { if (s[i] === '-') { i += 1; return -unary(); } return power(); };
  const prod = () => { let v = unary(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = unary(); v = op === '*' ? v * w : v / w; } return v; };
  function sum() { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? v + w : v - w; } return v; }
  const v = sum();
  return i === s.length ? v : null;
}
const close = (x, y) => Math.abs(x - y) < 1e-9;
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq|\\approx|\\leq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': close(x, y), '<': x < y, '>': x > y, '\\neq': !close(x, y), '\\leq': x <= y + 1e-9, '\\approx': Math.abs(x - y) <= 0.005 * Math.abs(y) }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked += 1;
    }
  }
  return checked;
}
/** Les textes où un point nommé « $X(a\,;\,b)$ » doit être le VRAI point (jamais les distracteurs). */
const trueTextsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [
  s.prompt, s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null,
])])].filter(Boolean);
const allTextsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
function checkPoints(p, pts) {
  let checked = 0;
  for (const t of trueTextsOf(p)) {
    for (const [, name, x, y] of String(t).matchAll(/\$([A-Z])\((-?\d+)\\,;\\,(-?\d+)\)\$/g)) {
      expect(pts[name], `${p.id}: point ${name} inconnu`).toBeDefined();
      expect([Number(x), Number(y)], `${p.id}: ${name}(${x} ; ${y})`).toEqual(pts[name]);
      checked += 1;
    }
  }
  return checked;
}


// ── Les points des six situations, posés UNE fois ; tout le reste en est déduit ──
const P1 = { A: [-4, 1], B: [-1, 3], C: [1, -2] }; // bibliothèque itinérante, 1 carreau = 1 km
P1.D = [P1.C[0] - comp(P1.A, P1.B)[0], P1.C[1] - comp(P1.A, P1.B)[1]]; // AB = DC
const P2 = { A: [-4, -1], B: [4, 3], C: [2, -3] }; // puits commun
P2.I = mid(P2.A, P2.B);
const P3 = { A: [-3, 1], B: [3, 1], C: [1, 5] }; // cour, 1 carreau = 1 m
const P4 = { A: [-3, 0], B: [1, -2], C: [2, 0], D: [-2, 2] }; // fresque
const P5 = { F: [1, 2], P: [4, 6], T: [6, 5] }; // phare, portée 5 km
const U5 = [-1, -1];
P5.S = [P5.T[0] + U5[0], P5.T[1] + U5[1]];
const P6 = { A: [-2, -1], B: [1, 3], C: [4, -1], D: [1, -5] }; // champ, 1 carreau = 10 m

describe('les six وضعيات تدريبية de أدمج تعلّماتي (الوحدة 12 « الأشعة في معلم »)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('match their modules (1 to 6 practice_lab, then the analysis of the final situation 7, the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.slice(7).map((m) => [m.id, m.slug, m.stage])).toEqual([
      ['07', 'al-wadiya', 'practice_lab'], ['08', 'itqan', 'evaluation'],
    ]);
    expect(LESSON_CONFIG.modules.some((m) => m.stage === 'trigger')).toBe(false);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation' && r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    // the lab and the book's situation moved with module 7
    expect(LESSON_CONFIG.resources.filter((r) => r.kind === 'manipulation').every((r) => r.module === 7)).toBe(true);
    expect(LESSON_CONFIG.resources.find((r) => r.code === 'situation-addaan').module).toBe(7);
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
  });

  it('every training module is titled « الوضعية التدريبية N », declared a platform addition, with its own tone and drawn figure', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type, p.id).toBe('platform_addition');
      expect(p.figure, p.id).toBeTruthy();
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    expect(new Set(problemModules.map((m) => m.color)).size).toBe(6);
  });

  it('none of the trainings reuses the numbers of the book situation (p. 148) or of the final test', () => {
    // the book's runners: A(−2;0) … N(4;−2), √13 + √5 + √17 ; the test: C(−3;0), K(1;0), D(5;0), E(−3;7), F(0;3), G(3;6), H(5;4)
    const forbidden = [/\$A\(-2\\,;\\,0\)\$/, /\$M\(-2\\,;\\,3\)\$/, /\$N\(4\\,;\\,-2\)\$/, /\$C\(-3\\,;\\,0\)\$/, /\$E\(-3\\,;\\,7\)\$/, /\$H\(5\\,;\\,4\)\$/, /\\sqrt\{13\} \+ \\sqrt\{5\} \+ \\sqrt\{17\}/, /جبل الوحش/];
    for (const p of PROBLEMS) for (const re of forbidden) expect(JSON.stringify(p), `${p.id} ${re}`).not.toMatch(re);
    expect(SITUATION.text).toBeTruthy();
    expect(TEST.title).toMatch(/جبل الوحش/);
  });

  it('no sub-step is an assessment: mastery comes from module 10 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
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

  it('the figures are valid, readable, drawn on the statement coordinates — and never show the point to find', () => {
    const cases = [['wadiya-1', P1, ['D']], ['wadiya-2', P2, ['I']], ['wadiya-3', P3, []], ['wadiya-4', P4, []], ['wadiya-5', P5, ['S']], ['wadiya-6', P6, []]];
    for (const [id, pts, absent] of cases) {
      const fig = PROBLEM[id].figure;
      expect(validateGeoFigure(fig), id).toEqual([]);
      expect(figureQuality(fig), id).toEqual([]);
      expect(fig.grid && fig.axes, id).toBeTruthy();
      for (const [n, xy] of Object.entries(fig.points)) expect(xy, `${id} ${n}`).toEqual(pts[n]);
      for (const n of absent) expect(fig.points[n], `${id} ${n}`).toBeUndefined();
    }
    expect(Object.keys(FIG).filter((k) => k.startsWith('TRAIN'))).toEqual(['TRAIN1', 'TRAIN2', 'TRAIN3', 'TRAIN4', 'TRAIN5', 'TRAIN6']);
  });

  it('every named point written in the texts is the true point', () => {
    expect(checkPoints(PROBLEM['wadiya-1'], P1)).toBeGreaterThanOrEqual(4);
    expect(checkPoints(PROBLEM['wadiya-2'], P2)).toBeGreaterThanOrEqual(5);
    expect(checkPoints(PROBLEM['wadiya-3'], P3)).toBeGreaterThanOrEqual(3);
    expect(checkPoints(PROBLEM['wadiya-4'], P4)).toBeGreaterThanOrEqual(4);
    expect(checkPoints(PROBLEM['wadiya-5'], P5)).toBeGreaterThanOrEqual(3);
    expect(checkPoints(PROBLEM['wadiya-6'], P6)).toBeGreaterThanOrEqual(4);
  });

  it('every written equality / inequality evaluates true', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const [k, t] of allTextsOf(p).entries()) n += checkText(t, `${p.id} #${k}`);
    expect(n).toBeGreaterThan(60);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$\\sqrt{45} = \\sqrt{9 \\times 5} = 3\\sqrt{6}$', 'mutant')).toThrow();
    expect(() => checkText('$3^2 + 2^2 = 14$', 'mutant')).toThrow();
    expect(() => checkText('$2\\sqrt{13} + 2\\sqrt{29} \\approx 18{,}50$', 'mutant')).toThrow();
  });

  it('وضعية 1 — the 4th station D, then the tour', () => {
    const { A, B, C, D } = P1;
    const ab = comp(A, B); const bc = comp(B, C);
    expect(expectedOf('wadiya-1', 0)).toEqual(ab);
    expect(expectedOf('wadiya-1', 1)).toEqual(D);
    expect(comp(D, C)).toEqual(ab); // AB = DC : ABCD is a parallelogram in this order
    expect(comp(A, D)).toEqual(comp(B, C)); // and AD = BC
    expect(expectedOf('wadiya-1', 2).slice(0, 2)).toEqual([dist2(A, B), dist2(B, C)]);
    const tour = 2 * (Math.sqrt(dist2(A, B)) + Math.sqrt(dist2(B, C)));
    expect(expectedOf('wadiya-1', 2)[2]).toBe(round(tour, 2));
    // rounding the roots first gives another answer: the trap of the explanation
    expect(round(2 * (round(Math.sqrt(dist2(A, B)), 2) + round(Math.sqrt(dist2(B, C)), 2)), 2)).not.toBe(round(tour, 2));
    expect(bc).toEqual([2, -5]);
  });

  it('وضعية 2 — the well, the distances, the right isosceles school', () => {
    const { A, B, C, I } = P2;
    expect(expectedOf('wadiya-2', 0).slice(0, 2)).toEqual(I);
    expect(correctOf('wadiya-2', 0, 0)).toMatch(/dfrac\{x_A \+ x_B\}\{2\}/);
    expect(expectedOf('wadiya-2', 1)[0]).toBe(dist2(A, B));
    expect(dist2(A, B)).toBe(80); // 4√5
    expect(expectedOf('wadiya-2', 1)[1]).toBe(round(Math.sqrt(dist2(A, I)), 2));
    expect(dist2(A, I)).toBe(dist2(A, B) / 4);
    expect(dist2(I, B)).toBe(dist2(A, I));
    expect(expectedOf('wadiya-2', 2)).toEqual([dist2(C, A), dist2(C, B), dist2(C, A) + dist2(C, B)]);
    expect(dist2(C, A)).toBe(dist2(C, B));
    expect(dist2(C, A) + dist2(C, B)).toBe(dist2(A, B)); // converse of Pythagoras: right at C
    expect(isqrt(dist2(A, B))).toBeNull(); // the exact value stays a root
  });

  it('وضعية 3 — half circle against the broken line, rounding at the end', () => {
    const { A, B, C } = P3;
    const diameter = B[0] - A[0];
    expect(A[1]).toBe(B[1]);
    const r = diameter / 2;
    const arc = Math.PI * r;
    expect(expectedOf('wadiya-3', 0)).toEqual([diameter, r, round(arc, 2)]);
    expect(expectedOf('wadiya-3', 1).slice(0, 2)).toEqual([dist2(A, C), dist2(C, B)]);
    const line = Math.sqrt(dist2(A, C)) + Math.sqrt(dist2(C, B));
    expect(expectedOf('wadiya-3', 1)[2]).toBe(round(line, 2));
    // the arc passes below C (its top is at y = 1 + r), so the two routes really are different
    expect(A[1] + r).toBeLessThan(C[1]);
    expect(dist2([ (A[0] + B[0]) / 2, A[1] ], C)).toBeGreaterThan(r * r);
    // the arc is shorter; the difference rounds to 0,7 from exact values (0,71 from rounded values)
    expect(arc).toBeLessThan(line);
    expect(expectedOf('wadiya-3', 2)).toEqual([round(line - arc, 1)]);
    expect(round(round(line, 2) - round(arc, 2), 2)).toBe(0.71);
    expect(correctOf('wadiya-3', 0, 0)).toBe('$\\pi r$');
  });

  it('وضعية 4 — the fresco: parallelogram, right angle, rectangle, area, cost', () => {
    const { A, B, C, D } = P4;
    expect(comp(A, B)).toEqual(comp(D, C));
    expect(correctOf('wadiya-4', 0, 0)).toBe('$\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ و $\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$');
    expect(expectedOf('wadiya-4', 1)).toEqual([dist2(A, B), dist2(A, D), dist2(B, D)]);
    expect(dist2(A, B) + dist2(A, D)).toBe(dist2(B, D)); // right angle at A
    expect(dist2(A, C)).toBe(dist2(B, D)); // equal diagonals, the rectangle's signature
    const area2 = dist2(A, B) * dist2(A, D); // (AB × AD)² = 100
    expect(isqrt(area2)).toBe(10);
    expect(expectedOf('wadiya-4', 2)).toEqual([isqrt(area2), isqrt(area2) * 800]);
    expect(PROBLEM['wadiya-4'].statement).toContain('800');
  });

  it('وضعية 5 — the lighthouse: distances, the boundary case, the translation', () => {
    const { F, P, T, S } = P5;
    expect(expectedOf('wadiya-5', 0)).toEqual([dist2(F, P), isqrt(dist2(F, P))]);
    expect(isqrt(dist2(F, P))).toBe(5); // exactly on the limit: lit
    expect(expectedOf('wadiya-5', 1)).toEqual([dist2(F, T), round(Math.sqrt(dist2(F, T)), 2)]);
    expect(dist2(F, T)).toBeGreaterThan(25); // out of range
    expect(expectedOf('wadiya-5', 2)).toEqual([S[0], S[1], dist2(F, S)]);
    expect(comp(T, S)).toEqual(U5);
    expect(dist2(F, S)).toBeLessThan(25); // inside after one hour
    expect(PROBLEM['wadiya-5'].statement).toContain('\\begin{pmatrix} -1 \\\\ -1 \\end{pmatrix}');
  });

  it('وضعية 6 — the olive field: midpoints, rhombus, area in m²', () => {
    const { A, B, C, D } = P6;
    expect(mid(A, C)).toEqual([1, -1]);
    expect(mid(B, D)).toEqual([1, -1]);
    expect(correctOf('wadiya-6', 0, 0)).toBe('$(1\\,;\\,-1)$');
    expect(correctOf('wadiya-6', 0, 1)).toBe('$(1\\,;\\,-1)$');
    expect(expectedOf('wadiya-6', 1)).toEqual([dist2(A, B), dist2(B, C)]);
    expect(dist2(A, B)).toBe(dist2(B, C));
    expect(dist2(A, B)).toBe(dist2(C, D));
    expect(dist2(A, B)).toBe(dist2(D, A));
    expect(dist2(A, C)).not.toBe(dist2(B, D)); // not a rectangle: the diagonals differ
    const ac = isqrt(dist2(A, C)); const bd = isqrt(dist2(B, D));
    expect([ac, bd]).toEqual([6, 8]);
    const units = (ac * bd) / 2;
    expect(expectedOf('wadiya-6', 2)).toEqual([ac, bd, units * 10 * 10]); // 1 square = 10 m
    expect(PROBLEM['wadiya-6'].statement).toContain('$10\\,\\mathrm{m}$');
  });

  it('the values are woven into the stories, the numbers untouched', () => {
    const joined = PROBLEMS.map((p) => p.statement).join(' ');
    for (const word of ['القراءة', 'تتكافلان', 'إتقان', 'متعاونين|يتعاون', 'شواطئ الوطن', 'برًّا']) expect(joined).toMatch(new RegExp(word));
  });
});
