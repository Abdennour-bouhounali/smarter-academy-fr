import { describe, it, expect } from 'vitest';
import * as SP from '@smarter-academy/core/arithmetic/space.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateSpaceFigure, spaceFigureQuality } from '../../../../../../common/components/spaceFigure';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (wadiya-idmajiya-fada) : contrat GuidedProblem, place dans le parcours (modules 1 à 6,
 * puis la وضعية du seau 7 et le test 8), et SURTOUT chaque nombre recalculé — par space.js (sphère, section,
 * cylindre, cône, `scaled`, exact en fractions) puis par l'arithmétique ci-dessous — et chaque égalité écrite dans les explications,
 * les options justes et les rédactions évaluée en rationnels (voir le vérificateur).
 */
const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const answersOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);
const N = (f) => Lin.toNumber(f);
const piCoef = (k) => N(k.k); // le coefficient de π d'un π-multiple

// ── Vérificateur des formules $…$ (rationnels exacts) ─────────────────────────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const rPow = (x, e) => { let v = R(1); for (let k = 0; k < e; k += 1) v = rMul(v, x); return v; };
const rCmp = (x, y) => Math.sign(x[0] * y[1] - y[0] * x[1]);
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return R(Number(i + f), 10 ** f.length); };
const UNIT = /\\,\\mathrm\{([^}]*)\}(\^\d)?/g;
/** L'unité d'un membre (« cm^3 », « L »…) ou '' : deux membres d'unités DIFFÉRENTES sont une conversion, vérifiée à part
 * (les tests par مسألة recalculent chaque conversion : 4 m = 400 cm, 60 m² = 600000 cm², 0,006 m³ = 6 L…). */
const unitOf = (src) => [...src.matchAll(UNIT)].map((m) => m[1] + (m[2] ?? '')).join('|');
function evalExpr(src) {
  let s = src
    .replace(UNIT, '').replace(/\{,\}/g, '.')
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  s = s.replace(/(\d)\(/g, '$1*(').replace(/\)\(/g, ')*(');
  if (!s || !/^[\d.+\-*/()^]+$/.test(s)) return null; // une lettre (V, A, k…) : ce membre n'est pas numérique
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '(') { i += 1; v = sum(); i += 1; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = dec(s.slice(j, i));
    }
    if (s[i] === '^') { i += 1; const j = i; while (/\d/.test(s[i] ?? '')) i += 1; v = rPow(v, Number(s.slice(j, i))); }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = atom(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const REL = { '=': (c) => c === 0, '<': (c) => c < 0, '>': (c) => c > 0 };
/** Chaque couple de membres NUMÉRIQUES voisins (même unité) d'une formule vérifie sa relation. Renvoie le nombre vérifié. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text ?? '').matchAll(/\$([^$]+)\$/g)) {
    const tokens = f.split(/(=|<|>)/);
    // un membre sans unité prend celle du premier membre qui en a une À SA DROITE :
    // dans « 60 m² = 60 × 10000 = 600000 cm² », le membre du milieu compte des cm²
    const units = [];
    for (let k = tokens.length - 1; k >= 0; k -= 2) units[k] = unitOf(tokens[k]) || (units[k + 2] ?? '');
    for (let k = 1; k + 1 < tokens.length; k += 2) {
      const [l, r] = [tokens[k - 1], tokens[k + 1]];
      const [lu, ru] = [units[k - 1], units[k + 1]];
      if (lu && ru && lu !== ru) continue;
      const a = evalExpr(l); const b = evalExpr(r);
      if (!a || !b) continue;
      expect(REL[tokens[k]](rCmp(a, b)), f).toBe(true);
      checked += 1;
    }
  }
  return checked;
}

const trueTexts = (p) => p.parts.flatMap((part) => part.steps.flatMap((s) => [s.explain, ...(s.lines ?? []), s.kind === 'choice' ? s.options[s.correct] : null, ...(s.rows ?? []).map((r) => r.correction)])).filter(Boolean);

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-fada)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6 practice_lab/problem, then the seau 7, the test 8) within 90 minutes', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'itqan'],
    ]);
    expect(LESSON_CONFIG.modules.map((m) => m.id)).toEqual(['00', '01', '02', '03', '04', '05', '06', '07', '08']);
    expect(LESSON_CONFIG.modules.find((m) => m.number === 7)).toMatchObject({ stage: 'practice_lab' });
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
  });

  it('every training module is titled « الوضعية التدريبية N », declared as an exam-style platform addition, with its own tone', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    problemModules.forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source).toMatchObject({ type: 'platform_addition', reason: 'exam_style_problem' });
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    expect(PROBLEMS.every((p) => p.parts.length >= 2 && p.parts.length <= 4)).toBe(true);
  });

  it('no sub-step is an assessment: mastery comes from module 8 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every statement shows its figure (« الشكل المقابل »): valid and readable', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).toMatch(/الشكل المقابل/);
      if (p.figure.kind === 'space') {
        expect(validateSpaceFigure(p.figure), p.id).toEqual([]);
        expect(spaceFigureQuality(p.figure), p.id).toEqual([]);
      } else {
        expect(validateGeoFigure(p.figure), p.id).toEqual([]);
        expect(figureQuality(p.figure), p.id).toEqual([]);
      }
    }
    expect(PROBLEMS.map((p) => p.figure.kind ?? 'plane')).toEqual(['space', 'space', 'space', 'space', 'plane', 'plane']);
  });

  it('the figures say what the statements say (lengths recomputed on the drawn points)', () => {
    const d = (P, a, b) => Math.sqrt(SP.lengthNumber(SP.distanceSquared3(P[a], P[b])));
    const P1 = PROBLEM['wadiya-1'].figure.points;
    expect(['A', 'B', 'C'].map((n) => d(P1, 'O', n))).toEqual([9, 7, 11]);
    expect(PROBLEM['wadiya-1'].figure.solids[0].radius).toBe(9);
    // the three verdicts really come from space.ballPosition (exact OM² against R²)
    expect(['A', 'B', 'C'].map((n) => SP.ballPosition(P1.O, 9, P1[n]).where)).toEqual(['surface', 'inside', 'outside']);
    const P2 = PROBLEM['wadiya-2'].figure.points;
    expect([d(P2, 'O', 'H'), d(P2, 'O', 'M'), d(P2, 'H', 'M')]).toEqual([15, 25, 20]);
    expect(PROBLEM['wadiya-2'].figure.solids[0].radius).toBe(25);
    expect((P2.M[0] - P2.H[0]) * (P2.O[0] - P2.H[0]) + (P2.M[2] - P2.H[2]) * (P2.O[2] - P2.H[2])).toBe(0); // OH ⟂ HM
    const f3 = PROBLEM['wadiya-3'].figure; // dessinée en dizaines de cm
    expect(f3.solids[0].radius * 10).toBeCloseTo(17, 9);
    expect(f3.points.O1[2] * 10).toBe(60);
    expect(f3.points.Q1[0] * 10).toBeCloseTo(8, 9); // le plan à 8 cm de l'axe
    expect(Math.hypot(f3.points.Q2[0], f3.points.Q2[1]) * 10).toBeCloseTo(17, 9); // ses bords sont sur la paroi
    expect((f3.points.Q2[1] - f3.points.Q1[1]) * 10).toBeCloseTo(30, 9); // et son demi-largeur est 15
    const f4 = PROBLEM['wadiya-4'].figure;
    expect([f4.solids[0].radius, d(f4.points, 'O', 'M')]).toEqual([6, 6]);
    const P5 = PROBLEM['wadiya-5'].figure.points;
    const plane = (a, b) => Math.hypot(P5[a][0] - P5[b][0], P5[a][1] - P5[b][1]);
    expect([plane('S', 'I'), plane('I', 'B'), plane('S', 'W')]).toEqual([15, 9, 10]);
    expect(plane('W', 'N') / plane('I', 'B')).toBeCloseTo(10 / 15, 9); // (MN) ∥ (AB): la figure est à l'échelle
    const P6 = PROBLEM['wadiya-6'].figure.points;
    expect([P6.B[0] - P6.A[0], P6.C[1] - P6.B[1], P6.C1[1], P6.C2[1] - P6.C1[1]]).toEqual([6, 12, 3, 6]);
    expect(PROBLEM['wadiya-6'].figure.circles.map((c) => c.radius)).toEqual([3, 3]);
    // no figure prints an answer
    const labels = (f) => (f.segments ?? []).map((s) => s.label).filter(Boolean);
    expect(labels(PROBLEM['wadiya-2'].figure)).toEqual(['15 cm', '25 cm']);
    expect(labels(PROBLEM['wadiya-5'].figure)).toEqual(['15 cm', '9 cm']);
  });

  // ── Chaque nombre attendu, recalculé ─────────────────────────────────────
  it('وضعية 1 — the globe: positions, area 324π, volume 972π', () => {
    expect(piCoef(SP.sphereArea(9))).toBe(324);
    expect(piCoef(SP.ballVolume(9))).toBe(972);
    expect(answersOf('wadiya-1', 1)).toEqual([324, 972]);
    const rows = steps('wadiya-1', 0).find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual([0, 1, 2]); // surface, inside, outside — the options' order
  });

  it('وضعية 2 — the stone ball: r = 20, area 400π, d = 20', () => {
    const sec = SP.sphereSection(25, 15);
    expect(sec.kind).toBe('circle');
    expect(N(sec.radius2)).toBe(400);
    expect(SP.lengthNumber(sec.radius)).toBe(20);
    expect(expectedOf('wadiya-2', 0)).toEqual([400, 20]);
    expect(SP.sphereSection(25, 20).kind).toBe('circle');
    expect(N(SP.sphereSection(25, 20).radius2)).toBe(225); // d = 20 ⇒ r = 15 (the other way round)
    expect(expectedOf('wadiya-2', 1)).toEqual([400, 400, 20]); // area coefficient 20², then d² = 25² − 15², then d
    expect(SP.lengthNumber(SP.sectionDistance(25, 15))).toBe(20); // r = 15 ⇒ d = 20
    expect(SP.sphereSection(25, 0).kind).toBe('great-circle'); // the plane through O would be a great circle
    expect(SP.sphereSection(25, 15).kind).not.toBe('great-circle');
  });

  it('وضعية 3 — the bin: capacity 17340π ≈ 54,48 L, window 30 × 60 = 1800', () => {
    const cyl = SP.cylinder(17, 60);
    expect(piCoef(cyl.volume)).toBe(17340);
    expect(SP.piRound(cyl.volume.k, 2)).toBe('54475,22'); // cm³, before the conversion to litres
    const litres = Math.round(17340 * Math.PI / 10) / 100; // 54 475,2166 cm³ → 54,4752 L
    expect(litres).toBe(54.48);
    expect(expectedOf('wadiya-3', 0)).toEqual([17340, 54.48]);
    const sec = SP.cylinderSection(17, 60, { axisDistance: 8 });
    expect(sec.kind).toBe('rectangle');
    expect(Math.sqrt(17 ** 2 - 8 ** 2)).toBe(15);
    expect(expectedOf('wadiya-3', 1)).toEqual([225, 30, 1800]);
    expect(2 * 15 * 60).toBe(1800);
    // the section parallel to the base is the disc of the base itself
    expect(SP.cylinderSection(17, 60, { parallelTo: 'base' }).kind).toBe('circle');
  });

  it('وضعية 4 — the water tower and its model: k = 1/40, 144π m² → 900π cm², 40³ = 64000', () => {
    const k = SP.ratioFrom(600, 15, 1);
    expect(k).toEqual(Lin.frac(1, 40));
    expect(SP.scaleEffect(k).kind).toBe('reduction');
    expect(expectedOf('wadiya-4', 0)).toEqual([600, 40, 144]);
    expect(piCoef(SP.sphereArea(6))).toBe(144);
    const modelArea = SP.scaled(144 * 10000, k, 2); // m² → cm², then × k²
    expect(N(modelArea)).toBe(900);
    expect(piCoef(SP.sphereArea(15))).toBe(900);
    expect(answersOf('wadiya-4', 1)).toEqual([900, 64000]);
    // the volume ratio, recomputed on the two balls
    const ratio = N(SP.ballVolume(600).k) / N(SP.ballVolume(15).k);
    expect(ratio).toBe(64000);
    expect(N(SP.scaled(SP.ballVolume(600).k, k, 3))).toBe(N(SP.ballVolume(15).k));
    // the traps: k² and k
    expect([40 ** 2, 40]).toEqual([1600, 40]);
  });

  it('وضعية 5 — the funnel: k = 2/3, WM = 6, 405π, 120π ≈ 377 cm³', () => {
    const k = SP.ratioFrom(15, 10, 1);
    expect(k).toEqual(Lin.frac(2, 3));
    expect(N(SP.scaled(9, k, 1))).toBe(6);
    const cone = SP.cone(9, 15);
    const small = SP.cone(6, 10);
    expect(piCoef(cone.volume)).toBe(405);
    expect(piCoef(small.volume)).toBe(120);
    expect(N(SP.scaled(cone.volume.k, k, 3))).toBe(120); // (2/3)³ × 405
    expect(N(SP.scaleEffect(k).volume)).toBeCloseTo(8 / 27, 12);
    expect(Math.round(120 * Math.PI)).toBe(377);
    expect(answersOf('wadiya-5', 0)).toEqual([6]);
    expect(answersOf('wadiya-5', 1)).toEqual([405, 120, 377]);
    const kOptions = steps('wadiya-5', 0).find((s) => s.kind === 'choice' && s.ask === 0);
    expect(kOptions.options[kOptions.correct]).toBe('$\\dfrac{2}{3}$');
  });

  it('وضعية 6 — the can of two balls: 36π each, 108π the can, 36π empty, ratio 2/3', () => {
    expect(piCoef(SP.ballVolume(3))).toBe(36);
    expect(piCoef(SP.cylinder(3, 12).volume)).toBe(108);
    expect(expectedOf('wadiya-6', 0)).toEqual([36, 108]);
    expect(expectedOf('wadiya-6', 1)).toEqual([72, 36]);
    expect(2 * 3 * 2).toBe(12); // two balls of diameter 6 stacked fill the height 12
    expect(Lin.eq(Lin.div(Lin.frac(72), Lin.frac(108)), Lin.frac(2, 3))).toBe(true);
    expect(Lin.eq(SP.archimedes(3).volumeRatio, Lin.frac(2, 3))).toBe(true); // the lesson-2 law, here on R = 3
    const o = steps('wadiya-6', 1).find((s) => s.kind === 'choice');
    expect(o.options[o.correct]).toBe('$\\dfrac{2}{3}$');
  });

  it('the answers of the evaluated situations (seau, cornet, verre) appear in none of the six', () => {
    const forbidden = [105, 19, 24388, 25.54, 48013, 7875, 32, 256, 5.5, 819, 643.24, 1331];
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      if (s.kind === 'numeric') for (const f of forbidden) expect(s.expected, `${p.id} ${s.prompt}`).not.toBe(f);
    }
    const text = JSON.stringify(PROBLEMS);
    expect(text).not.toMatch(/24388|643\{,\}24|25\{,\}54|\\dfrac\{819\}|\\dfrac\{8\}\{11\}|\\dfrac\{15\}\{19\}/);
  });

  it('every equality written in explains, correct options and solutions is TRUE', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(50);
  });

  it('the checker catches a wrong number (mutation)', () => {
    expect(() => checkText('$15^2 - 9^2 = 225 - 81 = 145$')).toThrow();
    expect(() => checkText('$\\dfrac{8}{27} \\times 405 = 8 \\times 15 = 121$')).toThrow();
    expect(checkText('$6\\,\\mathrm{m} = 600\\,\\mathrm{cm}$')).toBe(0); // une conversion n'est pas une égalité de nombres
  });

  it('math stays in $…$: no bare fraction, power or root in Arabic prose', () => {
    for (const p of PROBLEMS) {
      const texts = [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])])])].filter(Boolean);
      for (const t of texts) {
        const prose = t.replace(/\$[^$]*\$/g, '');
        expect(prose, t).not.toMatch(/\d\s*\/\s*\d|\^|√|\\/);
      }
    }
  });

  it('values are woven in the statements (one clause each, owner rule 2026-10-10)', () => {
    const marks = [/القراءة/, /يتقن عمله/, /نظافة/, /وطنهم/, /للتكافل/, /يتعاون/];
    PROBLEMS.forEach((p, i) => expect(p.statement, p.id).toMatch(marks[i]));
  });
});
