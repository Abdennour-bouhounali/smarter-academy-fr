import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس 4 (unité 12) : le contrat GuidedProblem, la mise en page des modules, une réponse par demande, des
 * figures lisibles et SANS réponse — et chaque nombre RECALCULÉ depuis les coordonnées de l'énoncé (vectors.js).
 */
const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = stepsOf(id, part).filter((x) => x.kind === 'choice')[k]; return s.options[s.correct]; };
const pt = (id, n) => V.point(...PROBLEM[id].figure.points[n]);
const comps = (A, B) => V.coords(V.vec(A, B));
const d2 = (A, B) => { const [x, y] = comps(A, B); return x * x + y * y; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, options, lignes de solution) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique (entiers, décimaux « 0{,}5 »,
// ×, ÷, +, −, puissances ^2, \sqrt{n}, k\sqrt{n}, \dfrac{a}{b}, parenthèses) est évalué, et chaque relation entre deux
// membres numériques VOISINS est vérifiée. Les membres qui contiennent une lettre sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  const s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/(\d)\\sqrt\{(\d+)\}/g, '$1*S$2')
    .replace(/\\sqrt\{(\d+)\}/g, 'S$1')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()^S]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -power(); }
    if (s[i] === 'S') { i++; const v = atom(); return Math.sqrt(v); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const power = () => { const b = atom(); if (s[i] === '^') { i++; return b ** atom(); } return b; };
  const prod = () => { let v = power(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = power(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
const textsOf = (p) => [
  p.statement,
  ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [
    s.prompt, s.explain, ...(s.lines ?? []), ...(s.options && s.kind === 'choice' ? [s.options[s.correct]] : []),
  ])]),
].filter(Boolean);

describe('les مسائل du درس 4 (unité 12) « توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, 'masala-1', 'practice_lab', 8], [6, 'masala-2', 'practice_lab', 8], [7, 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, id: '08', slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06), برهن included', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      const proofs = (part.question.match(/برهن/g) ?? []).length;
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question) + proofs);
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is valid, readable, and never shows an answer (C, I, F′)', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    expect(Object.keys(PROBLEM['masala-1'].figure.points)).not.toContain('C');
    expect(Object.keys(PROBLEM['masala-1'].figure.points)).not.toContain('I');
    expect(Object.keys(PROBLEM['masala-3'].figure.points).some((n) => n.startsWith('F') && n !== 'F')).toBe(false);
  });

  it('every written equality is true (explain, prompts, options, solutions) — and the checker bites', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const t of textsOf(p)) n += checkText(t, p.id);
    expect(n).toBeGreaterThan(40);
    expect(() => checkText('$36 + 64 = 101$', 'mutation')).toThrow();
    expect(() => checkText('$\\sqrt{40} = 2\\sqrt{11}$', 'mutation')).toThrow();
  });

  it('مسألة 1 — y, the square and the circle are computed, not typed', () => {
    const fig = PROBLEM['masala-1'].figure.points;
    const A = V.point(...fig.A); const B = V.point(...fig.B); const D = V.point(...fig.D);
    const xC = fig.d1[0];
    expect(fig.d2[0]).toBe(xC); // (d) : tous ses points ont l'abscisse 1, celle de C(1 ; y)
    // (AB) ⊥ (BC) ⇔ AB² + BC² = AC² : 20 + 4 + (y − 2)² = 4 + (y − 4)², les y² s'en vont.
    const ab2 = d2(A, B);
    const [ax, ay] = V.coords(A); const [bx, by] = V.coords(B);
    // AB² + (xC − xB)² + (y − yB)² = (xC − xA)² + (y − yA)²  ⇒  linéaire en y.
    const lhs = (y) => ab2 + (xC - bx) ** 2 + (y - by) ** 2;
    const rhs = (y) => (xC - ax) ** 2 + (y - ay) ** 2;
    const slope = (lhs(1) - rhs(1)) - (lhs(0) - rhs(0));
    const y = -(lhs(0) - rhs(0)) / slope;
    expect(Number.isInteger(y)).toBe(true);
    const C = V.point(xC, y);
    expect(V.triangleNature(A, B, C).right).toBe('B');
    expect(expectedOf('masala-1', 0)).toEqual([ab2, y]);
    expect([ab2, y]).toEqual([20, -2]);
    expect(lhs(0) - rhs(0)).toBe(28 - 20); // y² − 4y + 28 = y² − 8y + 20 (option correcte)
    expect(correctOf('masala-1', 0, 2)).toBe('$y^2 - 4y + 28 = y^2 - 8y + 20$');
    expect(PROBLEM['masala-1'].parts[0].steps.at(-1).lines.at(-1)).toContain(`C(${xC}\\,;\\,${y})`);
    // 2) ABCD carré : AB = DC, BC², AC², BD².
    expect(V.quadNature(A, B, C, D)).toBe('square');
    expect(comps(A, B)).toEqual([-4, -2]);
    expect(comps(D, C)).toEqual([-4, -2]);
    expect(comps(C, D)).toEqual([4, 2]); // le distracteur « متعاكسان » est bien CD
    expect(expectedOf('masala-1', 1)).toEqual([d2(B, C), d2(A, C), d2(B, D)]);
    expect(d2(B, C)).toBe(ab2);
    expect(d2(A, C)).toBe(d2(B, D));
    // 3) le cercle de diamètre [AC] : I milieu, IA² = IB² = ID² ; corde = √IA².
    const I = V.midpoint(A, C);
    expect(V.coords(I)).toEqual([2, 1]);
    expect(correctOf('masala-1', 2, 1)).toBe('$I(2\\,;\\,1)$');
    expect(expectedOf('masala-1', 2)).toEqual([d2(I, A), d2(I, B), d2(I, D)]);
    expect(new Set([d2(I, A), d2(I, B), d2(I, D)]).size).toBe(1);
    expect(d2(I, A)).toBe(10);
    expect(correctOf('masala-1', 2, 3)).toBe('$\\sqrt{10}$ m');
    expect(d2(A, C)).toBe(4 * d2(I, A)); // AC = 2√10 : le distracteur « القطر »
  });

  it('مسألة 2 — the parcel is a rectangle, not a square; area and income computed', () => {
    const [A, B, C, D] = ['A', 'B', 'C', 'D'].map((n) => pt('masala-2', n));
    expect(comps(A, B)).toEqual([4, -3]);
    expect(comps(D, C)).toEqual([4, -3]);
    expect(expectedOf('masala-2', 0)).toEqual([...comps(A, B), ...comps(D, C)]);
    expect(V.quadNature(A, B, C, D)).toBe('rectangle');
    expect(expectedOf('masala-2', 1)).toEqual([d2(A, C), d2(B, D), d2(A, B), d2(B, C)]);
    expect(d2(A, C)).toBe(d2(B, D));
    expect(d2(A, B)).not.toBe(d2(B, C));
    const unit = 10; // m (énoncé)
    const ab = Math.sqrt(d2(A, B)) * unit; const bc = Math.sqrt(d2(B, C)) * unit;
    const area = ab * bc; const quintals = (area / 10000) * 32; const income = quintals * 6000;
    expect(expectedOf('masala-2', 2)).toEqual([ab, bc, area, quintals, income]);
    expect([ab, bc, area, quintals, income]).toEqual([50, 100, 5000, 16, 96000]);
    expect(PROBLEM['masala-2'].statement).toContain('6000 دج');
    expect(PROBLEM['masala-2'].statement).toContain('32 قنطارا');
  });

  it('مسألة 3 — E on the arc, F inside, F′ found by the unknown coordinate', () => {
    const T = pt('masala-3', 'T'); const E = pt('masala-3', 'E'); const F = pt('masala-3', 'F');
    const r = 10 / 1; // 10 m, unité 1 m
    expect(V.onCircle(T, r, E)).toBe(true);
    expect(V.onCircle(T, r, F)).toBe(false);
    expect(expectedOf('masala-3', 0)).toEqual([d2(T, E)]);
    expect(expectedOf('masala-3', 1)).toEqual([d2(T, F)]);
    expect(d2(T, F)).toBeLessThan(r * r); // à l'intérieur
    // F′(xF ; y), y > yT : (xF − xT)² + (y − yT)² = r².
    const [tx, ty] = V.coords(T); const [fx, fy] = V.coords(F);
    const sq = r * r - (fx - tx) ** 2;
    const root = Math.sqrt(sq);
    expect(Number.isInteger(root)).toBe(true);
    const roots = [ty + root, ty - root];
    const y = roots.find((v) => v > ty);
    expect(V.onCircle(T, r, V.point(fx, y))).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([sq, y, Math.abs(y - fy) * 1]);
    expect([sq, y, Math.abs(y - fy)]).toEqual([36, 3, 1]);
    expect(roots).toEqual([3, -9]);
  });
});
