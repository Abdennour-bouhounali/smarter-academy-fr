import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM, DOOR_PTS, TURBINE_PTS } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les « مسائل » du درس « خواص الدوران وتوظيفها » disent VRAI : chaque `expected` est RECALCULÉ ici à partir des nombres
 * de l'énoncé et des points des figures (rotation.js, exact sur les quarts de tour), et chaque égalité numérique écrite
 * dans un explain, une option ou une ligne de rédaction est évaluée.
 */
const P = (p) => V.point(p[0], p[1]);
const num = (q) => Lin.toNumber(q);
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const rot = (M, O, alpha, dir = 'direct') => {
  const r = R.rotateApprox({ x: M[0], y: M[1] }, { x: O[0], y: O[1] }, alpha, dir);
  return [Math.round(r.x * 1e9) / 1e9, Math.round(r.y * 1e9) / 1e9];
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const area = (a, b, c) => Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;

describe('les مسائل de khawas-dawaran — contrat', () => {
  it('respectent le contrat GuidedProblem', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('occupent les modules 5, 6, 7 (track problem, practice_lab), le test passe en 8', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual([
      [5, '05', 'masala-1', 'practice_lab'], [6, '06', 'masala-2', 'practice_lab'], [7, '07', 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
  });

  it('chaque demande a sa propre réponse, et chaque « ؟ / impératif » est déclaré', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('les données à trier : 4–5 utiles, 1–2 inutiles dont un nombre, sans $', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful); const useless = p.data.filter((d) => !d.useful);
      expect(useful.length, p.id).toBeGreaterThanOrEqual(4);
      expect(useful.length, p.id).toBeLessThanOrEqual(5);
      expect(useless.length, p.id).toBeGreaterThanOrEqual(1);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), d.id).toBe(false);
    }
  });

  it('chaque figure est valide et lisible (figureQuality vide)', () => {
    for (const p of PROBLEMS) {
      expect(p.figure, p.id).toBeTruthy();
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });
});

describe('مسألة 1 — نجمة الزليج (la طريقة, autres nombres)', () => {
  const F = LESSON_CONFIG.lessonProblem.figure.points;
  const OA = 6; const OC = 8; const gold = 25;
  it('la figure : OAB, OCD rectangles isocèles en O, B ∈ [OC], B = r(A), D = r(C) pour r = (O, 90°, direct) — exact', () => {
    expect(dist(F.O, F.A)).toBe(OA);
    expect(dist(F.O, F.C)).toBe(OC);
    expect(dist(F.O, F.B)).toBe(OA);
    expect(dist(F.O, F.D)).toBe(OC);
    // B sur [OC] : colinéaires et entre O et C
    expect(F.B[0] * F.C[1] - F.B[1] * F.C[0]).toBe(0);
    expect(dist(F.O, F.B) + dist(F.B, F.C)).toBe(dist(F.O, F.C));
    for (const [M, M2] of [['A', 'B'], ['C', 'D']]) {
      expect(V.vecEq(R.rotate(P(F[M]), P(F.O), 90, 'direct'), P(F[M2])), `${M} → ${M2}`).toBe(true);
      expect(R.imageCheck(P(F.O), P(F[M]), P(F[M2]), 90, 'direct').ok).toBe(true);
    }
    // les distracteurs de la question 1 sont faux : pas indirect, pas 180°
    expect(R.imageCheck(P(F.O), P(F.A), P(F.B), 90, 'indirect').ok).toBe(false);
    expect(R.imageCheck(P(F.O), P(F.A), P(F.B), 180).ok).toBe(false);
  });
  it('question 2 : AC² = 100, AC = BD = 10, (AC) ⊥ (BD)', () => {
    const ac2 = OA ** 2 + OC ** 2;
    expect(R.angleAt({ x: F.A[0], y: F.A[1] }, { x: 0, y: 0 }, { x: F.C[0], y: F.C[1] })).toBeCloseTo(90, 9);
    expect(expectedOf('masala-1', 1)).toEqual([ac2, Math.sqrt(ac2), Math.sqrt(ac2)]);
    expect(Math.sqrt(ac2)).toBe(10);
    expect(dist(F.A, F.C)).toBe(10);
    expect(dist(F.B, F.D)).toBe(10);
    expect(R.lineAngle({ x: F.A[0], y: F.A[1] }, { x: F.C[0], y: F.C[1] }, { x: F.B[0], y: F.B[1] }, { x: F.D[0], y: F.D[1] })).toBeCloseTo(90, 9);
    expect(R.lineAngleOfTurn(90)).toBe(90);
  });
  it('question 3 : OBD = r(OAC), aire 24 (pas 18 = OAB) ; 24 × 25 = 600', () => {
    const aOAC = (OA * OC) / 2;
    expect(area(F.O, F.A, F.C)).toBe(aOAC);
    expect(area(F.O, F.B, F.D)).toBe(aOAC);
    expect(num(R.polygonArea([P(F.O), P(F.B), P(F.D)]))).toBe(aOAC);
    expect(area(F.O, F.A, F.B)).toBe(18);
    expect(expectedOf('masala-1', 2)).toEqual([aOAC, aOAC, aOAC * gold]);
    expect(aOAC * gold).toBe(600);
  });
  it('le leurre 120 دج et les nombres de l’énoncé', () => {
    const st = LESSON_CONFIG.lessonProblem.statement;
    for (const n of ['6', '8', '120', '25']) expect(st).toContain(n);
  });
});

describe('مسألة 2 — الباب الدوّار', () => {
  const O = [6, 6]; const unitCm = 20; const height = 2; const price = 6500;
  it('les points de l’énoncé sont ceux de la figure, et chaque prime est l’image par (O, 90°, direct) — exact', () => {
    const st = PROBLEM['masala-2'].statement;
    for (const [n, [x, y]] of Object.entries(DOOR_PTS)) expect(st, n).toContain(`$${n}(${x}\\,;\\,${y})$`);
    for (const n of ['M', 'N', 'P']) {
      const img = R.rotate(P(DOOR_PTS[n]), P(O), 90, 'direct');
      expect(R.imageCheck(P(O), P(DOOR_PTS[n]), img, 90, 'direct').ok).toBe(true);
      expect([num(img.x), num(img.y)], n).toEqual(DOOR_PTS[`${n}'`]);
    }
  });
  it('question 1 : médiatrices de [MM′] et [NN′] confondues (aucun centre), celle de [PP′] donne O(6 ; 6)', () => {
    const D = DOOR_PTS;
    expect(R.rotationCenter(P(D.M), P(D["M'"]), P(D.N), P(D["N'"]))).toBeNull();
    const c = R.rotationCenter(P(D.M), P(D["M'"]), P(D.P), P(D["P'"]));
    expect([num(c.x), num(c.y)]).toEqual(O);
    // les milieux annoncés dans l'explain
    expect([(D.M[0] + D["M'"][0]) / 2, (D.M[1] + D["M'"][1]) / 2]).toEqual([7, 7]);
    expect([(D.N[0] + D["N'"][0]) / 2, (D.N[1] + D["N'"][1]) / 2]).toEqual([8, 8]);
    const mid = [(D.P[0] + D["P'"][0]) / 2, (D.P[1] + D["P'"][1]) / 2];
    expect(expectedOf('masala-2', 0)).toEqual(mid);
    // l'option juste est O, les distracteurs ne sont PAS le centre
    const step = PROBLEM['masala-2'].parts[0].steps.find((s) => s.ask === 1);
    expect(step.options[step.correct]).toBe(`$(${O[0]}\\,;\\,${O[1]})$`);
    for (const wrong of [[7, 7], [3, 9], [0, 0]]) expect(R.onBisector(P(D.P), P(D["P'"]), P(wrong)) && R.onBisector(P(D.M), P(D["M'"]), P(wrong)), `${wrong}`).toBe(false);
    expect(dist(O, D.M)).toBe(2); expect(dist(O, D.P)).toBe(6); expect(dist(O, D["P'"])).toBe(6);
  });
  it('question 2 : M′N′ = MN = 2 unités = 40 cm, (M′N′) ⊥ (MN) ; après ½ tour la poignée est sur (MN), de l’autre côté de O', () => {
    const D = DOOR_PTS;
    const mn = dist(D.M, D.N);
    expect(dist(D["M'"], D["N'"])).toBe(mn);
    expect(expectedOf('masala-2', 1)).toEqual([mn, mn * unitCm]);
    expect(mn * unitCm).toBe(40);
    expect(R.lineAngle({ x: D.M[0], y: D.M[1] }, { x: D.N[0], y: D.N[1] }, { x: D["M'"][0], y: D["M'"][1] }, { x: D["N'"][0], y: D["N'"][1] })).toBeCloseTo(90, 9);
    const m2 = R.rotate(P(D.M), P(O), 180); const n2 = R.rotate(P(D.N), P(O), 180);
    expect([num(m2.x), num(m2.y)]).toEqual([4, 6]);
    expect([num(n2.x), num(n2.y)]).toEqual([2, 6]);
    expect(O[1]).toBe(D.M[1]); // O ∈ (MN) : l'image par 180° est (MN) elle-même
  });
  it('question 3 : OP = 6 unités = 1,2 m ; 4 × 1,2 × 2 = 9,6 m² ; 9,6 × 6500 = 62400 دج (entiers : centimètres)', () => {
    const op = dist(O, DOOR_PTS.P);
    const wingCm = op * unitCm;
    const glassCm2 = 4 * wingCm * height * 100; // cm²
    expect(wingCm).toBe(120);
    expect(glassCm2).toBe(96000);
    const cost = (glassCm2 * price) / 10000;
    expect(cost).toBe(62400);
    expect(expectedOf('masala-2', 2)).toEqual([op, wingCm / 100, glassCm2 / 10000, cost]);
  });
});

describe('مسألة 3 — العنفة الريحية', () => {
  const hub = 55; const blade = 26; const face = 27; const paint = 1200;
  it('la figure : B = r(A), C = r(B) par (O, 120°, direct), OA = 26, H à 55 sous O', () => {
    const F = TURBINE_PTS;
    const b = rot(F.A, F.O, 120); const c = rot(F.B, F.O, 120);
    expect(dist(b, F.B)).toBeLessThan(1e-3);
    expect(dist(c, F.C)).toBeLessThan(1e-3);
    expect(R.imageCheck({ x: 0, y: 0 }, { x: F.A[0], y: F.A[1] }, { x: F.B[0], y: F.B[1] }, 120, 'direct', { tol: 1e-4, tolDeg: 0.01 }).ok).toBe(true);
    expect(dist(F.O, F.A)).toBe(blade);
    expect(dist(F.O, F.H)).toBe(hub);
    expect(F.A[0]).toBe(F.O[0]); expect(F.H[0]).toBe(F.O[0]); // A, O, H alignés (vertical)
  });
  it('question 1 : OB = 26 ; angle AOB = 120 ; droites à 60°', () => {
    const F = TURBINE_PTS;
    expect(dist(F.O, F.B)).toBeCloseTo(blade, 3);
    expect(R.angleAt({ x: F.A[0], y: F.A[1] }, { x: 0, y: 0 }, { x: F.B[0], y: F.B[1] })).toBeCloseTo(120, 2);
    expect(R.lineAngleOfTurn(120)).toBe(60);
    expect(R.lineAngle({ x: 0, y: 0 }, { x: F.A[0], y: F.A[1] }, { x: 0, y: 0 }, { x: F.B[0], y: F.B[1] })).toBeCloseTo(60, 2);
    expect(expectedOf('masala-3', 0)).toEqual([blade, 120, 180 - 120]);
  });
  it('question 2 : A₁ = r½(A) est sur (OH), à 55 − 26 = 29 m du sol', () => {
    const F = TURBINE_PTS;
    const a1 = R.rotate(P(F.A), P(F.O), 180);
    expect([num(a1.x), num(a1.y)]).toEqual([0, -blade]);
    expect(num(a1.x)).toBe(F.H[0]); // sur la verticale (OH)
    const h = num(a1.y) - F.H[1];
    expect(h).toBe(hub - blade);
    expect(blade).toBeLessThan(hub); // A₁ ne touche pas le sol
    expect(expectedOf('masala-3', 1)).toEqual([h]);
  });
  it('question 3 : 3 × 2 = 6 faces ; 6 × 27 = 162 m² ; 162 × 1200 = 194400 دج', () => {
    expect(expectedOf('masala-3', 2)).toEqual([3 * 2, 3 * 2 * face, 3 * 2 * face * paint]);
    expect(3 * 2 * face * paint).toBe(194400);
  });
});

/* ── Toute égalité NUMÉRIQUE écrite ($a = b \times c$, $\dfrac{6 \times 8}{2} = 24$, $9{,}6 \times 6500 = 62400$) est vraie ── */
function evalTex(src) {
  let s = src
    .replace(/\\,\\mathrm\{[^}]*\}(\^2)?/g, '')
    .replace(/\\mathrm\{[^}]*\}/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/\^\\circ/g, '')
    .replace(/\\(?:d)?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'Math.sqrt($1)')
    .replace(/\\times/g, '*')
    .replace(/\^2/g, '**2')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]*(Math\.sqrt\([\d.+\-*/()]*\))?[\d.+\-*/()]*$/.test(s) || s === '') return null;
  // eslint-disable-next-line no-new-func
  return Function(`return (${s});`)();
}
function numericEqualities(text) {
  const out = [];
  for (const m of String(text).matchAll(/\$([^$]+)\$/g)) {
    const island = m[1];
    if (!island.includes('=') || /[<>]|\\(?:perp|parallel|widehat|in)\b/.test(island)) continue;
    const sides = island.split('=').map(evalTex);
    if (sides.every((v) => v != null)) out.push([island, sides]);
  }
  return out;
}
const allTexts = (p) => [
  p.statement,
  ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])]),
].filter(Boolean);

describe('les égalités numériques écrites sont vraies', () => {
  it.each(PROBLEMS.map((p) => [p.id, p]))('%s', (id, p) => {
    const eqs = allTexts(p).flatMap(numericEqualities);
    expect(eqs.length, id).toBeGreaterThan(4);
    for (const [island, sides] of eqs) for (const v of sides) expect(v, island).toBeCloseTo(sides[0], 9);
  });
  it('un nombre muté est détecté (le vérificateur n’est pas aveugle)', () => {
    expect(numericEqualities('$9{,}6 \\times 6500 = 62400$')[0][1]).toEqual([62400, 62400]);
    const [[, bad]] = numericEqualities('$24 \\times 25 = 650$');
    expect(bad[0]).not.toBe(bad[1]);
    const [[, frac]] = numericEqualities('$\\dfrac{6 \\times 8}{2} = 24$');
    expect(frac).toEqual([24, 24]);
  });
});
