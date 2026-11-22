import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM, FIG_HELICOPTER, FIG_BAY } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس 3 « مجموع شعاعين » : contrat GuidedProblem, place dans le parcours (5, 6, 7 → test 8), une réponse
 * par demande, figures lisibles et VRAIES (vectors.js), et chaque nombre RECALCULÉ depuis les données de l'énoncé.
 */
const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const P = (fig, n) => V.point(fig.points[n][0], fig.points[n][1]);
const vecOf = (fig, a, b) => V.vec(P(fig, a), P(fig, b));
const len2 = (fig, a, b) => { const [x, y] = V.coords(vecOf(fig, a, b)); return x * x + y * y; };
const close = (a, b) => Math.abs(a - b) < 1e-9;

/**
 * Toutes les égalités NUMÉRIQUES écrites dans les îlots `$…$` (explain, lines, options, prompts) : `0{,}6^2 + 0{,}8^2 = 1`,
 * `\sqrt{2{,}25} = 1{,}5`, `\dfrac{13}{15} \times 60 = 52`… Une égalité qui contient une lettre (un vecteur, $AC^2$) est
 * laissée aux tests de figure ci-dessous.
 */
function numericEqualities(text) {
  const out = [];
  for (const [, island] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (!island.includes('=') && !island.includes('<') && !island.includes('>')) continue;
    let t = island
      .replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '')
      .replace(/(\d)\{,\}(\d)/g, '$1.$2')
      .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '(($1)/($2))')
      .replace(/\\sqrt\{([^}]*)\}/g, 'Math.sqrt($1)')
      .replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/−/g, '-')
      .replace(/\^(\d)/g, '**$1');
    const probe = t.replace(/Math\.sqrt/g, '');
    if (/[A-Za-z\\]/.test(probe)) continue;
    const sides = t.split(/(=|<|>)/);
    const vals = sides.filter((_, i) => i % 2 === 0).map((e) => Function(`return (${e});`)());
    const ops = sides.filter((_, i) => i % 2 === 1);
    out.push({ island, vals, ops });
  }
  return out;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((pt) => [pt.question, ...pt.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('les مسائل du درس 3 « مجموع شعاعين »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage])).toEqual([
      [5, 'masala-1', 'practice_lab'], [6, 'masala-2', 'practice_lab'], [7, 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is valid and readable (figureQuality)', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('every numeric equality written in the texts is TRUE (and the check catches a wrong number)', () => {
    let count = 0;
    for (const p of PROBLEMS) for (const text of allTexts(p)) for (const { island, vals, ops } of numericEqualities(text)) {
      count += 1;
      ops.forEach((op, i) => {
        const [a, b] = [vals[i], vals[i + 1]];
        const ok = op === '=' ? close(a, b) : op === '<' ? a < b : a > b;
        expect(ok, `${p.id}: $${island}$`).toBe(true);
      });
    }
    expect(count).toBeGreaterThan(30);
    // mutation : une égalité fausse est détectée
    const [bad] = numericEqualities('$0{,}6^2 + 0{,}8^2 = 1{,}4$');
    expect(close(bad.vals[0], bad.vals[1])).toBe(false);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const AB = 60, c = 0.8, s = 0.6, w = 1.7;
    const v = Math.sqrt(s ** 2 + c ** 2);
    expect(numericOf('masala-1', 0)).toEqual([s ** 2 + c ** 2, v].map((x) => +x.toFixed(9)));
    expect(v).toBe(1);
    expect(v).not.toBe(s + c); // le piège : 1 et non 1,4
    const t = AB / s;
    const BC = +(c * t).toFixed(9);
    const AC2 = AB ** 2 + BC ** 2;
    expect(numericOf('masala-1', 1)).toEqual([+t.toFixed(9), BC, AC2, Math.sqrt(AC2)]);
    expect(Math.sqrt(AC2)).toBe(v * t); // Chasles sur les déplacements = parallélogramme sur les vitesses
    const real2 = +(w ** 2 - c ** 2).toFixed(9);
    expect(numericOf('masala-1', 2)).toEqual([real2, Math.sqrt(real2), AB / Math.sqrt(real2)]);
    expect(s).toBeLessThan(c); // Anas ne peut pas remonter le courant : l'hypoténuse serait plus courte qu'un côté
    expect(w).toBeGreaterThan(c);
  });

  it('مسألة 2 — read on the map (1 square = 100 m), Chasles and the opposite vectors', () => {
    const f = FIG_HELICOPTER; const sq = 100;
    expect(V.vecEq(V.vecAdd(vecOf(f, 'E', 'K'), vecOf(f, 'K', 'F')), vecOf(f, 'E', 'F'))).toBe(true);
    expect(V.isZeroVec(V.vecAdd(vecOf(f, 'E', 'F'), vecOf(f, 'F', 'E')))).toBe(true);
    const EK = Math.sqrt(len2(f, 'E', 'K')) * sq, KF = Math.sqrt(len2(f, 'K', 'F')) * sq, EF = Math.sqrt(len2(f, 'E', 'F')) * sq;
    expect([EK, KF, EF]).toEqual([600, 1000, 800]);
    expect(numericOf('masala-2', 0)).toEqual([EF, EK, KF, EK + KF]);
    expect(EF).toBeLessThan(EK + KF);
    expect(numericOf('masala-2', 1)).toEqual([EF, EK + KF + EF]);
    const fuelRange = 3000; // le carburant à bord suffit pour 3000 m
    expect(numericOf('masala-2', 2)).toEqual([fuelRange - (EK + KF + EF)]);
    expect(EK + KF + EF).toBeLessThanOrEqual(fuelRange);
    expect(2 * (EK + KF)).toBeGreaterThan(fuelRange); // le retour par K ne passe pas
  });

  it('مسألة 3 — the parallelogram on the map (1 square = 1 km): AB + AC = AH', () => {
    const f = FIG_BAY;
    expect(V.vecEq(V.vecAdd(vecOf(f, 'A', 'B'), vecOf(f, 'A', 'C')), vecOf(f, 'A', 'H'))).toBe(true);
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'H'), P(f, 'C'))).toBe(true);
    expect(V.vecEq(vecOf(f, 'B', 'H'), vecOf(f, 'A', 'C'))).toBe(true);
    const down = -V.coords(vecOf(f, 'A', 'C'))[1];
    const AH2 = len2(f, 'A', 'H'), AB2 = len2(f, 'A', 'B'), AC = Math.sqrt(len2(f, 'A', 'C'));
    expect(numericOf('masala-3', 0)).toEqual([down, -V.coords(vecOf(f, 'B', 'H'))[1], AH2, Math.sqrt(AH2)]);
    const AB = Math.sqrt(AB2), AH = Math.sqrt(AH2);
    expect(numericOf('masala-3', 1)).toEqual([AB2, AB, AH]);
    expect(AH).toBeLessThan(AB); // le courant ralentit : 13 < 15
    expect(AH).not.toBe(AB + AC);
    const noCurrent = (AH / AB) * 60, lost = 60 - noCurrent, litres = 30 * (lost / 60);
    expect(numericOf('masala-3', 2)).toEqual([noCurrent, lost, litres, litres * 45]);
  });
});
