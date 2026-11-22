import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure.js';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (unité 11) : contrat, mise en page des modules, une réponse par demande, et
 * SURTOUT chaque nombre et chaque égalité recalculés — les égalités vectorielles sur les coordonnées des figures
 * (packages/core/arithmetic/vectors.js), les égalités numériques en arithmétique, les `expected` à partir des données.
 */
const P = (pts, n) => V.point(...pts[n]);
const num = (x) => LIN.toNumber(x);
/** « BB' » → ['B', "B'"] : les noms de points portent leurs apostrophes. */
const names = (s) => s.match(/[A-Z]'*/g);
const vec = (pts, a, b) => V.vec(P(pts, a), P(pts, b));
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const islands = (t = '') => [...String(t).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

/** Les points de la figure, plus ceux que la figure ne dessine pas encore (la réponse d'une demande, recalculée ici). */
const EXTRA = {
  'wadiya-2': { D: [7, 9] },
  'wadiya-5': { "B'": [5, 0] },
};
const pointsOf = (p) => ({ ...p.figure.points, ...(EXTRA[p.id] ?? {}) });

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
function sideValue(pts, side) {
  const re = /([+-]?)\s*\\overrightarrow\{([^}]*)\}/g;
  const terms = [...side.matchAll(re)];
  if (!terms.length || side.replace(re, '').replace(/[\s()+]/g, '') !== '') return null;
  return terms.reduce((acc, [, sign, name]) => {
    const u = name === '0' ? V.point(0, 0) : vec(pts, ...names(name));
    return V.vecAdd(acc, sign === '-' ? V.vecNeg(u) : u);
  }, V.point(0, 0));
}

/** Toutes les chaînes vectorielles « a = b = c » affirmées : chaque membre égal au premier. Rend le nombre vérifié. */
function checkVectorChains(problem) {
  const pts = pointsOf(problem);
  let n = 0;
  for (const isl of affirmed(problem)) {
    if (!isl.includes('\\overrightarrow') || !isl.includes('=')) continue;
    const sides = isl.split('=').map((s) => sideValue(pts, s.trim()));
    if (sides.some((v) => v === null)) continue;
    sides.slice(1).forEach((v) => expect(V.vecEq(v, sides[0]), `${problem.id}: « ${isl} »`).toBe(true));
    n += 1;
  }
  return n;
}

/** Toutes les égalités / inégalités NUMÉRIQUES affirmées (« $20 + 20 = 40$ », « $64 + 36 = 100$ »). */
function checkArithmetic(problem) {
  let n = 0;
  for (const isl of affirmed(problem)) {
    const e = isl.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\{,\}/g, '.').replace(/\^(\d+)/g, '**$1');
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

describe('wadiya-idmajiya-ashia — les six وضعيات تدريبية', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6 practice_lab, then 7 the textbook situation, 8 the final test)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.slice(7).map((m) => [m.number, m.slug])).toEqual([[7, 'al-wadiya'], [8, 'itqan']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
  });

  it('every training module is titled « الوضعية التدريبية N », has a distinct colour and a distinct tone', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true));
    expect(new Set(problemModules.map((m) => m.color)).size).toBe(6);
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    expect(problemModules.map((m) => m.color)).toEqual(PROBLEMS.map((p) => p.tone));
  });

  it('are platform additions of the exam type, never the textbook', () => {
    for (const p of PROBLEMS) expect(p.source.type, p.id).toBe('platform_addition');
  });

  it('no sub-step is an assessment: mastery comes from the test only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
  });

  it('have 2 parts each, and a written answer last', () => {
    for (const p of PROBLEMS) {
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      for (const part of p.parts) expect(part.steps.at(-1).kind, `${p.id} ${part.label}`).toBe('solution');
    }
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      const proofs = (part.question.match(/برهن/g) ?? []).length;
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question) + proofs);
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is a valid, readable GeoFigure', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('keep the numbers of the textbook situation (module 7) and of the test (module 10) unseen', () => {
    // module 7 : 7 carreaux d'écart, B′ 1 carreau sous la rive, √85 ; test : A(0;5), B(9;−4), route de 3 carreaux, 30 m, Oran
    for (const p of PROBLEMS) {
      expect(JSON.stringify(p), p.id).not.toMatch(/85|113|Oran|وهران|الراجلين/);
    }
  });

  it('every affirmed vector chain is TRUE on the drawn coordinates', () => {
    expect(checkVectorChains(PROBLEM['wadiya-1'])).toBeGreaterThanOrEqual(4);
    expect(checkVectorChains(PROBLEM['wadiya-2'])).toBeGreaterThanOrEqual(1);
    expect(checkVectorChains(PROBLEM['wadiya-3'])).toBeGreaterThanOrEqual(2);
    expect(checkVectorChains(PROBLEM['wadiya-4'])).toBeGreaterThanOrEqual(4);
    expect(checkVectorChains(PROBLEM['wadiya-5'])).toBeGreaterThanOrEqual(2);
    expect(checkVectorChains(PROBLEM['wadiya-6'])).toBeGreaterThanOrEqual(3);
  });

  it('every affirmed numeric equality is TRUE', () => {
    for (const p of PROBLEMS) expect(checkArithmetic(p), p.id).toBeGreaterThanOrEqual(3);
  });

  it('the wrong options are really wrong on the figure (each carries at least one FALSE vector equality)', () => {
    const wrongOptions = (id) => PROBLEM[id].parts.flatMap((part) => part.steps)
      .filter((s) => s.kind === 'choice')
      .flatMap((s) => s.options.filter((_, k) => k !== s.correct))
      // (« على الشكل … » : vraie conclusion, fausse RAISON — la figure ne prouve pas ; elle n'est pas testable ici)
      .filter((opt) => !opt.includes('الشكل'))
      .map((opt) => islands(opt)
        .filter((isl) => isl.includes('=') && isl.includes('\\overrightarrow'))
        .map((isl) => isl.split('=').map((side) => sideValue(pointsOf(PROBLEM[id]), side.trim())))
        .filter((sides) => sides.every((v) => v !== null)))
      .filter((chains) => chains.length > 0);
    // (wadiya-1 : le distracteur « BB′CC′ » garde une égalité vraie ; c'est l'ORDRE des lettres qui est faux)
    for (const id of ['wadiya-4', 'wadiya-5', 'wadiya-6']) {
      const options = wrongOptions(id);
      expect(options.length, id).toBeGreaterThan(0);
      for (const chains of options) {
        expect(chains.some((sides) => !sides.every((v) => V.vecEq(v, sides[0]))), id).toBe(true);
      }
    }
  });

  // ── Chaque nombre attendu, recalculé depuis la figure et l'énoncé ─────────

  it('وضعية 1 — the zellige frieze: the translation, BB′C′C, 20 + 20, 240 ÷ 20', () => {
    const f = PROBLEM['wadiya-1'].figure.points;
    const cm = 5; // un carreau = 5 cm
    for (const [a, b] of [['A', "A'"], ['B', "B'"], ['C', "C'"]]) expect(V.vecEq(vec(f, a, b), vec(f, 'A', "A'")), a).toBe(true);
    expect(V.isParallelogram(P(f, 'B'), P(f, "B'"), P(f, "C'"), P(f, 'C'))).toBe(true);
    expect(V.collinear(P(f, 'B'), P(f, "B'"), P(f, 'C'))).toBe(false);
    // A″ image de A′ : AA″ = AA′ + A′A″ avec A′A″ = AA′
    expect(V.vecEq(vec(f, "A'", "A''"), vec(f, 'A', "A'"))).toBe(true);
    const aa1 = V.distanceNumber(P(f, 'A'), P(f, "A'")) * cm;
    const aa2 = V.distanceNumber(P(f, 'A'), P(f, "A''")) * cm;
    expect([aa1, aa2]).toEqual([20, 40]);
    const wall = 240;
    const width = V.distanceNumber(P(f, 'A'), P(f, 'B')) * cm; // largeur d'un triangle
    expect(width).toBe(15);
    const n = Math.floor(wall / aa1);
    expect(expectedOf('wadiya-1', 1)).toEqual([aa1, aa2, wall / aa1, n]);
    // le n-ième triangle tient dans le mur, le suivant non
    expect((n - 1) * aa1 + width).toBeLessThanOrEqual(wall);
    expect(n * aa1 + width).toBeGreaterThan(wall);
    expect(PROBLEM['wadiya-1'].statement).toContain('240 cm');
  });

  it('وضعية 2 — the garden: D from AD = BC, BC² = 36 + 64, perimeter, cost', () => {
    const p = PROBLEM['wadiya-2'];
    const f = pointsOf(p);
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'C'), P(f, 'D'))).toBe(true);
    expect(V.vecEq(vec(f, 'A', 'D'), vec(f, 'B', 'C'))).toBe(true);
    const bc = vec(f, 'B', 'C');
    // l'abscisse et l'ordonnée de BC en carreaux, puis D = A + BC
    const dx = f.C[0] - f.B[0]; const dy = f.C[1] - f.B[1];
    expect(expectedOf('wadiya-2', 0)).toEqual([dx, dy]);
    expect(V.vecEq(V.vecAdd(P(f, 'A'), bc), P(f, 'D'))).toBe(true);
    const m = 1; // un carreau = 1 m
    const ab = V.distanceNumber(P(f, 'A'), P(f, 'B')) * m;
    const bcLen = V.distanceNumber(P(f, 'B'), P(f, 'C')) * m;
    expect([ab, bcLen]).toEqual([7, 10]);
    expect(dx ** 2 + dy ** 2).toBe(bcLen ** 2);
    const perimeter = 2 * (ab + bcLen);
    expect(expectedOf('wadiya-2', 1)).toEqual([bcLen, perimeter, perimeter * 800]);
    expect(p.statement).toContain('800');
    // le dessin ne montre pas D
    expect(Object.keys(p.figure.points)).not.toContain('D');
  });

  it('وضعية 3 — the scouts: AB + BC = AC, the right angle, 3-4-5, the saving', () => {
    const f = PROBLEM['wadiya-3'].figure.points;
    const m = 100;
    expect(V.vecEq(V.vecAdd(vec(f, 'A', 'B'), vec(f, 'B', 'C')), vec(f, 'A', 'C'))).toBe(true);
    expect(V.isZeroVec(V.vecAdd(vec(f, 'A', 'C'), vec(f, 'C', 'A')))).toBe(true);
    // angle droit en B : AB horizontal, BC vertical
    const ba = vec(f, 'B', 'A'); const bcv = vec(f, 'B', 'C');
    expect(num(ba.x) * num(bcv.x) + num(ba.y) * num(bcv.y)).toBe(0);
    const ab = V.distanceNumber(P(f, 'A'), P(f, 'B')); const bc = V.distanceNumber(P(f, 'B'), P(f, 'C'));
    const ac = V.distanceNumber(P(f, 'A'), P(f, 'C'));
    expect([ab, bc, ac]).toEqual([4, 3, 5]);
    expect(expectedOf('wadiya-3', 0)).toEqual([]);
    expect(expectedOf('wadiya-3', 1)).toEqual([ab ** 2 + bc ** 2, ac * m, (ab + bc) * m, (ab + bc) * m - ac * m]);
    expect(ac).toBeLessThan(ab + bc); // inégalité triangulaire
  });

  it('وضعية 4 — the hall: ABCD متوازي أضلاع, O milieu of both diagonals, lengths, cables', () => {
    const f = PROBLEM['wadiya-4'].figure.points;
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'C'), P(f, 'D'))).toBe(true);
    expect(V.vecEq(vec(f, 'A', 'O'), vec(f, 'O', 'C'))).toBe(true);
    expect(V.vecEq(vec(f, 'D', 'O'), vec(f, 'O', 'B'))).toBe(true);
    // la chaîne de Chasles de la preuve
    expect(V.vecEq(vec(f, 'D', 'O'), V.vecAdd(vec(f, 'D', 'C'), vec(f, 'C', 'O')))).toBe(true);
    expect(V.vecEq(vec(f, 'C', 'O'), vec(f, 'O', 'A'))).toBe(true);
    expect(V.vecEq(vec(f, 'C', 'O'), vec(f, 'A', 'O'))).toBe(false);
    const ac = V.distanceNumber(P(f, 'A'), P(f, 'C')); const bd = V.distanceNumber(P(f, 'B'), P(f, 'D'));
    expect([ac, bd]).toEqual([14, 10]);
    const cable = ac / 2 + bd / 2 + ac / 2 + bd / 2;
    expect(expectedOf('wadiya-4', 1)).toEqual([ac / 2, bd / 2, cable, cable * 150]);
    expect(PROBLEM['wadiya-4'].figure.segments.map((s) => s.label)).toEqual(['14 m', '10 m']);
  });

  it('وضعية 5 — the canal: B′ = B + NM, MB′BN, AB′ = 10, 600 m, 10 min; the bridge is NOT drawn at the optimum', () => {
    const f = { ...PROBLEM['wadiya-5'].figure.points, "B'": [5, 0] };
    const m = 50;
    const width = f.R1[1] - f.R4[1];
    expect(width).toBe(2);
    expect(f.A[1] - f.R1[1]).toBe(4); // A : quatre carreaux au-dessus de la rive haute
    expect(f.R4[1] - f.B[1]).toBe(2); // B : deux carreaux sous la rive basse
    expect(f.B[0] - f.A[0]).toBe(8);
    const nm = vec(f, 'N', 'M');
    const Bp = V.vecAdd(P(f, 'B'), nm);
    expect([num(Bp.x), num(Bp.y)]).toEqual([5, 0]);
    expect(V.isParallelogram(P(f, 'M'), P(f, "B'"), P(f, 'B'), P(f, 'N'))).toBe(true);
    const abp = V.distanceNumber(P(f, 'A'), P(f, "B'"));
    expect(abp).toBe(10);
    expect(f.A[1] - f["B'"][1]).toBe(6);
    expect(expectedOf('wadiya-5', 1)).toEqual([6, abp, (abp + width) * m, ((abp + width) * m) / 60]);
    // le minimum est atteint quand M est sur [AB′] : la passerelle dessinée (x = 0) allonge le chemin
    const drawn = V.distanceNumber(P(f, 'A'), P(f, 'M')) + V.distanceNumber(P(f, 'N'), P(f, 'B')) + width;
    expect(drawn).toBeGreaterThan(abp + width);
    // M optimal : intersection de [AB′] avec la rive haute, x = −3 + 8 × (6 − 2) / 6
    const xOpt = f.A[0] + ((f["B'"][0] - f.A[0]) * (f.A[1] - f.M[1])) / (f.A[1] - f["B'"][1]);
    expect(xOpt).not.toBe(f.M[0]);
    expect(expectedOf('wadiya-5', 0)).toEqual([width]);
    expect(PROBLEM['wadiya-5'].statement).toContain('60 m');
  });

  it('وضعية 6 — the ramp: BC = AD = CE, C midpoint of [BE], 250 + 250 = 500 cm, 5 × 1500', () => {
    const f = PROBLEM['wadiya-6'].figure.points;
    const cm = 50; // un carreau = 50 cm
    expect(V.isParallelogram(P(f, 'A'), P(f, 'B'), P(f, 'C'), P(f, 'D'))).toBe(true);
    expect(V.vecEq(vec(f, 'B', 'C'), vec(f, 'A', 'D'))).toBe(true);
    expect(V.vecEq(vec(f, 'C', 'E'), vec(f, 'A', 'D'))).toBe(true);
    expect(V.vecEq(V.midpoint(P(f, 'B'), P(f, 'E')), P(f, 'C'))).toBe(true);
    const bc = V.distanceNumber(P(f, 'B'), P(f, 'C')) * cm;
    expect(bc).toBe(250); // l'énoncé donne 250 cm : la figure lui est fidèle
    expect(expectedOf('wadiya-6', 1)).toEqual([bc, (2 * bc) / 100, ((2 * bc) / 100) * 1500]);
    expect(PROBLEM['wadiya-6'].statement).toContain('250 cm');
    expect(PROBLEM['wadiya-6'].statement).toContain('1500');
  });

  it('the statements carry their givens and a value (woven in the context, rule 1)', () => {
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 'إتقان', '240');
    has('wadiya-2', 'نظافة', '800');
    has('wadiya-3', 'تعاون', '100 m');
    has('wadiya-4', 'بأمانة', '14', '10', '150');
    has('wadiya-5', 'يحترم الوقت', '50 m', '60 m');
    has('wadiya-6', 'تضامنًا', '250', '1500');
  });
});
