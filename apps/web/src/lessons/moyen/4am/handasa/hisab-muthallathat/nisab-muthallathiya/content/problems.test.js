import { describe, it, expect } from 'vitest';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Les nombres des trois énoncés (le test les connaît ; chaque `expected` en est RECALCULÉ) ──
const P1 = { BC: 3, AC: 1.8, B2C2: 2, angleN: 40, stock: [1.8, 2] };
const P2 = { steps: 3, stepCm: 15, angle: 5, space: 5.15, railPrice: 2800 };
const P3 = { RS: 8, angle: 42, length: 10, tilePrice: 1200 };

const near = (x, y, eps = 1e-9) => Math.abs(x - y) < eps * Math.max(1, Math.abs(x));
/** L'arrondi du manuel, rendu en nombre : roundTo(1,8668…, 2) = « 1,87 » → 1.87. */
const round = (x, d = 2) => Number(TR.roundTo(x, d).replace(',', '.'));
const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'choice');
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const angleAt = (v, a, b) => {
  const u = [a[0] - v[0], a[1] - v[1]]; const w = [b[0] - v[0], b[1] - v[1]];
  return (Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w))) * 180) / Math.PI;
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes de solution, bonne option) ──
// Chaque formule $…$ est découpée sur = ≈ < > ; chaque membre purement numérique (décimaux « 1{,}8 », ×, ÷, +, −,
// carrés « 3^2 », \dfrac{…}{…}, et \sin / \cos / \tan d'un angle en degrés) est évalué ; chaque relation entre deux
// membres numériques VOISINS est vérifiée — « ≈ » au sens de l'arrondi au nombre de décimales écrit à droite.
const TRIG = { sin: TR.sinDeg, cos: TR.cosDeg, tan: TR.tanDeg };
function evalExpr(src) {
  let s = src
    .replace(/(\d)\{,\}(\d)/g, '$1.$2')
    .replace(/\\(sin|cos|tan)\s*(\d+(?:\.\d+)?)\^\{\\circ\}/g, (_, f, d) => `(${TRIG[f](Number(d)).toFixed(15)})`)
    .replace(/(\d+(?:\.\d+)?)\^2/g, '($1*$1)');
  for (let k = 0; k < 3; k += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const decimalsOf = (raw) => { const m = raw.match(/\{,\}(\d+)\s*$/); return m ? m[1].length : 0; };
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|\\approx|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = {
        '=': near(x, y),
        '\\approx': Math.abs(x - y) <= 0.5 * 10 ** -decimalsOf(parts[k + 1]) + 1e-9,
        '<': x < y - 1e-9,
        '>': x > y + 1e-9,
      }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
const textsOf = (p) => p.parts.flatMap((part) => [
  [`${p.id} ${part.label} question`, part.question],
  ...part.steps.flatMap((s, i) => [
    [`${p.id} ${part.label} step ${i + 1} prompt`, s.prompt ?? ''],
    [`${p.id} ${part.label} step ${i + 1} explain`, s.explain ?? ''],
    ...(s.kind === 'choice' ? [[`${p.id} ${part.label} step ${i + 1} correct`, s.options[s.correct]]] : []),
    ...(s.lines ?? []).map((l, j) => [`${p.id} ${part.label} line ${j + 1}`, l]),
  ]),
]);

describe('les مسائل du درس 1 (unité 10) « النسب المثلثية لزاوية حادة »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.resources.filter((r) => r.kind === 'situation').map((r) => [r.code, r.module])).toEqual([
      ['masala-1', 5], ['masala-2', 6], ['masala-3', 7],
    ]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the figures are drawn true and readable (figureQuality = [])', () => {
    for (const p of PROBLEMS.filter((q) => q.figure)) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    expect(PROBLEM['masala-2'].figure).toBeUndefined(); // a 5° ramp is an 11 : 1 strip — the statement names no شكل
    const { A, B, C } = PROBLEM['masala-1'].figure.points;
    expect(near(dist(B, C), P1.BC)).toBe(true);
    expect(near(dist(A, C), P1.AC)).toBe(true);
    expect(near(angleAt(A, B, C), 90)).toBe(true);
    const { R, S, H, T } = PROBLEM['masala-3'].figure.points;
    expect(near(dist(R, S), P3.RS)).toBe(true);
    expect(near(dist(R, H), dist(H, S))).toBe(true);
    expect(near(angleAt(H, T, S), 90)).toBe(true);
    expect(Math.abs(angleAt(R, H, T) - P3.angle)).toBeLessThan(0.01);
    expect(near(dist(R, T), dist(S, T))).toBe(true);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const AB = Math.sqrt(P1.BC ** 2 - P1.AC ** 2);
    const sinB = P1.AC / P1.BC; const tanB = P1.AC / AB; const cosB = AB / P1.BC;
    expect(near(AB, 2.4)).toBe(true);
    expect(expectedOf('masala-1', 0).every((v, k) => near(v, [AB, sinB, tanB][k]))).toBe(true);
    const A2C2 = P1.B2C2 * sinB; const A2B2 = P1.B2C2 * cosB;
    expect(expectedOf('masala-1', 1).every((v, k) => near(v, [A2C2, cosB, A2B2][k]))).toBe(true);
    expect(near(A2C2 / A2B2, tanB)).toBe(true); // même angle : même ظل
    const NP = A2C2 / TR.sinDeg(P1.angleN);
    expect(expectedOf('masala-1', 2)).toEqual([round(NP)]);
    // le piège : la bonne planche est 2 m ; l'erreur « cos » (1,57) ferait choisir 1,8 m
    expect(NP > P1.stock[0] && NP <= P1.stock[1]).toBe(true);
    expect(A2C2 / TR.cosDeg(P1.angleN)).toBeLessThan(P1.stock[0]);
    const [, , pick] = choices('masala-1', 2);
    expect(pick.options[pick.correct]).toContain('2 m');
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const EF = (P2.steps * P2.stepCm) / 100;
    const DF = EF / TR.sinDeg(P2.angle); const DE = EF / TR.tanDeg(P2.angle);
    expect(expectedOf('masala-2', 0).every((v, k) => near(v, [EF, round(DF)][k]))).toBe(true);
    expect(expectedOf('masala-2', 1)).toEqual([round(DE)]);
    // le piège : le plan horizontal tient (5,14 < 5,15), la planche inclinée ne « tiendrait » pas (5,16 > 5,15)
    expect(DE).toBeLessThan(P2.space);
    expect(DF).toBeGreaterThan(P2.space);
    const rail = 2 * round(DF);
    expect(expectedOf('masala-2', 2).every((v, k) => near(v, [rail, rail * P2.railPrice][k]))).toBe(true);
    expect(near(rail * P2.railPrice, 28896)).toBe(true);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const RH = P3.RS / 2;
    const TH = RH * TR.tanDeg(P3.angle); const RT = RH / TR.cosDeg(P3.angle);
    expect(expectedOf('masala-3', 0).every((v, k) => near(v, [RH, round(TH)][k]))).toBe(true);
    expect(near(PROBLEM['masala-3'].figure.points.T[1], TH, 1e-3)).toBe(true);
    expect(expectedOf('masala-3', 1)).toEqual([round(RT)]);
    expect(RH * TR.cosDeg(P3.angle)).toBeLessThan(RH); // le عامل : un « وتر » plus court qu'un côté
    const area = 2 * round(RT) * P3.length;
    expect(expectedOf('masala-3', 2).every((v, k) => near(v, [area, area * P3.tilePrice][k]))).toBe(true);
    expect(near(area * P3.tilePrice, 129120)).toBe(true);
  });

  it('the calculator screens quoted in the explains are the real ones (10 significant digits)', () => {
    const screens = PROBLEMS.flatMap((p) => p.parts.flatMap((part) => part.steps.flatMap((st) => [...String(st.explain ?? '').matchAll(/الشاشة ([\d,]+)/g)].map((m) => m[1]))));
    expect(screens).toEqual([
      TR.screen((P1.B2C2 * (P1.AC / P1.BC)) / TR.sinDeg(P1.angleN)),
      TR.screen(0.45 / TR.sinDeg(P2.angle)),
      TR.screen(0.45 / TR.tanDeg(P2.angle)),
      TR.screen((P3.RS / 2) * TR.tanDeg(P3.angle)),
      TR.screen((P3.RS / 2) / TR.cosDeg(P3.angle)),
    ]);
  });

  it('every written relation ($a = b$, $x \\approx y$, $a < b$) is true', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const [where, text] of textsOf(p)) checked += checkText(text, where);
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker catches a wrong number', () => {
    expect(() => checkText('$\\dfrac{1{,}2}{\\sin 40^{\\circ}} \\approx 1{,}86$', 'mutation')).toThrow();
    expect(() => checkText('$10{,}32 \\times 2800 = 28886$', 'mutation')).toThrow();
  });
});
