import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality } from '../../../../../../common/components/geoFigure.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les « مسائل » du درس 4 : contrat, mise en page des modules, une réponse par demande, et SURTOUT chaque égalité
 * recalculée — les égalités vectorielles sur les coordonnées des figures (packages/core/arithmetic/vectors.js), les
 * égalités numériques en arithmétique, les `expected` à partir des nombres de l'énoncé.
 */
const P = (fig, n) => V.point(...fig.points[n]);
const vec = (fig, a, b) => V.vec(P(fig, a), P(fig, b));
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const islands = (t = '') => [...String(t).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

/** Ce que le modèle AFFIRME : explications, rédactions, et la bonne option de chaque choix. */
function affirmed(problem) {
  const texts = [];
  for (const part of problem.parts) for (const s of part.steps) {
    if (s.explain) texts.push(s.explain);
    if (s.lines) texts.push(...s.lines);
    if (s.kind === 'choice') texts.push(s.options[s.correct]);
  }
  return texts.flatMap(islands);
}

/** La valeur d'un membre « ±\overrightarrow{XY} ± … » sur la figure, ou null si ce n'est pas une somme de vecteurs. */
function sideValue(fig, side) {
  const terms = [...side.matchAll(/([+-]?)\s*\\overrightarrow\{([^}]*)\}/g)];
  if (!terms.length || side.replace(/([+-]?)\s*\\overrightarrow\{([^}]*)\}/g, '').replace(/[\s()+]/g, '') !== '') return null;
  return terms.reduce((acc, [, sign, name]) => {
    const u = name === '0' ? V.point(0, 0) : vec(fig, name[0], name.slice(1));
    return V.vecAdd(acc, sign === '-' ? V.vecNeg(u) : u);
  }, V.point(0, 0));
}

/** Toutes les chaînes vectorielles « a = b = c » affirmées : chaque membre égal au premier. Rend le nombre vérifié. */
function checkVectorChains(problem) {
  let n = 0;
  for (const isl of affirmed(problem)) {
    if (!isl.includes('\\overrightarrow') || !isl.includes('=')) continue;
    const sides = isl.split('=').map((s) => sideValue(problem.figure, s.trim()));
    if (sides.some((v) => v === null)) continue;
    sides.slice(1).forEach((v) => expect(V.vecEq(v, sides[0]), `${problem.id}: « ${isl} »`).toBe(true));
    n += 1;
  }
  return n;
}

/** Toutes les égalités / inégalités NUMÉRIQUES affirmées (« $80 + 2 \times 15 = 110$ », « $550 > 500$ »). */
function checkArithmetic(problem) {
  let n = 0;
  for (const isl of affirmed(problem)) {
    const e = isl.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\{,\}/g, '.');
    if (!/^[\d\s+\-*/().=<>]+$/.test(e) || !/[=<>]/.test(e)) continue;
    // eslint-disable-next-line no-new-func
    const val = (x) => Function(`return (${x});`)();
    if (e.includes('=')) {
      const sides = e.split('=').map(val);
      sides.forEach((v) => expect(v, `${problem.id}: « ${isl} »`).toBeCloseTo(sides[0], 9));
    } else {
      expect(val(e), `${problem.id}: « ${isl} »`).toBe(true);
    }
    n += 1;
  }
  return n;
}

describe('barahin-ashia — les مسائل', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, 'masala-1', 'practice_lab', 8], [6, 'masala-2', 'practice_lab', 8], [7, 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, id: '08', slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer — « برهن » counted too (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      const proofs = (part.question.match(/برهن/g) ?? []).length;
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question) + proofs);
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: useful items and at least one useless NUMBER', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.length).toBeGreaterThanOrEqual(1);
      expect(useless.some((d) => /\d/.test(d.text))).toBe(true);
      for (const d of p.data) expect(d.text).not.toContain('$');
    }
  });

  it('every figure reads (figureQuality empty)', () => {
    for (const p of PROBLEMS) expect(figureQuality(p.figure), p.id).toEqual([]);
  });

  it('every affirmed vector chain is TRUE on the drawn coordinates', () => {
    expect(checkVectorChains(PROBLEM['masala-1'])).toBeGreaterThanOrEqual(8);
    expect(checkVectorChains(PROBLEM['masala-2'])).toBeGreaterThanOrEqual(5);
    expect(checkVectorChains(PROBLEM['masala-3'])).toBeGreaterThanOrEqual(1);
  });

  it('every affirmed numeric equality is TRUE', () => {
    for (const p of PROBLEMS) checkArithmetic(p);
    expect(checkArithmetic(PROBLEM['masala-2'])).toBeGreaterThanOrEqual(5);
    expect(checkArithmetic(PROBLEM['masala-3'])).toBeGreaterThanOrEqual(5);
  });

  it('the wrong proof chains are really wrong on the figure', () => {
    const wrongChains = (id) => PROBLEM[id].parts.flatMap((part) => part.steps)
      .filter((s) => s.kind === 'choice' && s.ask != null)
      .flatMap((s) => s.options.filter((_, k) => k !== s.correct))
      .flatMap(islands)
      .filter((isl) => isl.includes('=') && isl.includes('\\overrightarrow'))
      .map((isl) => isl.split('=').map((side) => sideValue(PROBLEM[id].figure, side.trim())))
      .filter((sides) => sides.every((v) => v !== null) && sides.length >= 3);
    for (const id of ['masala-1', 'masala-2']) {
      const chains = wrongChains(id);
      expect(chains.length, id).toBeGreaterThan(0);
      // chaque chaîne d'un distracteur contient une égalité FAUSSE (le signe, l'ordre des points)
      for (const sides of chains) expect(sides.every((v) => V.vecEq(v, sides[0])), id).toBe(false);
    }
  });

  it('مسألة 1 — the metro: the givens hold on the figure and the numbers are computed', () => {
    const f = PROBLEM['masala-1'].figure;
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'C'), P(f, 'D'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'A'), P(f, 'C')), P(f, 'O'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'B'), P(f, 'D')), P(f, 'O'))).toBe(true);
    expect(V.vecEq(vec(f, 'B', 'E'), vec(f, 'A', 'O'))).toBe(true);
    expect(V.vecEq(vec(f, 'D', 'F'), vec(f, 'O', 'C'))).toBe(true);
    // les conclusions
    expect(V.vecEq(vec(f, 'O', 'E'), vec(f, 'A', 'B'))).toBe(true);
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'E'), P(f, 'O'))).toBe(true);
    expect(V.collinear(P(f, 'A'), P(f, 'B'), P(f, 'O'))).toBe(false);
    expect(V.vecEq(vec(f, 'E', 'F'), vec(f, 'B', 'D'))).toBe(true);
    expect(V.isParallelogram(P(f, 'B'), P(f, 'D'), P(f, 'F'), P(f, 'E'))).toBe(true);
    expect(V.collinear(P(f, 'B'), P(f, 'D'), P(f, 'E'))).toBe(false);
    // les nombres : EF = BD = 3 km, 250 m par semaine
    const bd = 3 * 1000;
    expect(expectedOf('masala-1', 2)).toEqual([bd, bd / 250]);
    expect(bd % 250).toBe(0);
  });

  it('مسألة 2 — the folding table: the givens hold on the figure and the numbers are computed', () => {
    const f = PROBLEM['masala-2'].figure;
    const cm = 10; // 1 unité de la figure = 10 cm
    expect(V.vecEq(V.midpoint(P(f, 'A'), P(f, 'C')), P(f, 'O'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'B'), P(f, 'D')), P(f, 'O'))).toBe(true);
    expect(V.distanceNumber(P(f, 'A'), P(f, 'C')) * cm).toBe(100);
    expect(V.distanceNumber(P(f, 'B'), P(f, 'D')) * cm).toBe(100);
    expect(V.distanceNumber(P(f, 'A'), P(f, 'B')) * cm).toBe(80);
    expect(V.vecEq(vec(f, 'A', 'B'), vec(f, 'D', 'C'))).toBe(true);
    const top = 80 + 2 * 15;
    const perPlank = Math.floor(220 / top);
    expect(220 % top).toBe(0);
    const planks = Math.ceil(12 / perPlank);
    expect(expectedOf('masala-2', 2)).toEqual([top, perPlank, planks, planks * 1200]);
  });

  it('مسألة 3 — the scissor lift: the givens hold on the figure and the numbers are computed', () => {
    const f = PROBLEM['masala-3'].figure;
    const cm = 50; // 1 carreau = 50 cm
    expect(V.vecEq(V.midpoint(P(f, 'A'), P(f, 'D')), P(f, 'I'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'B'), P(f, 'C')), P(f, 'I'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'C'), P(f, 'F')), P(f, 'J'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'D'), P(f, 'E')), P(f, 'J'))).toBe(true);
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'D'), P(f, 'C'))).toBe(true);
    expect(V.isParallelogram(P(f, 'C'), P(f, 'D'), P(f, 'F'), P(f, 'E'))).toBe(true);
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'F'), P(f, 'E'))).toBe(true);
    expect(V.vecEq(vec(f, 'A', 'B'), vec(f, 'E', 'F'))).toBe(true);
    // A, C, E alignés dans cet ordre (C sur [AE]), AC = CE = 150 cm
    expect(V.collinear(P(f, 'A'), P(f, 'C'), P(f, 'E'))).toBe(true);
    expect(V.vecEq(vec(f, 'A', 'C'), vec(f, 'C', 'E'))).toBe(true);
    expect(V.distanceNumber(P(f, 'A'), P(f, 'C')) * cm).toBe(150);
    const ae = 150 + 150; const platform = 60 + ae; const hand = platform + 190;
    expect(expectedOf('masala-3', 2)).toEqual([ae, platform, hand]);
    expect(hand).toBeGreaterThan(5 * 100);
    expect(ae + 190).toBeLessThan(5 * 100); // le piège : oublier le chariot fait conclure « non »
    const reach = PROBLEM['masala-3'].parts[2].steps.find((s) => s.ask === 2);
    expect(reach.options[reach.correct]).toContain(String(hand));
  });
});
