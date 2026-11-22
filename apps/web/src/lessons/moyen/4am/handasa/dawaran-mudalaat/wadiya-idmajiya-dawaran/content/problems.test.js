import { describe, it, expect } from 'vitest';
import * as Rot from '@smarter-academy/core/arithmetic/rotation.js';
import { validateProblem, demandsOf, SUPPORT_REFERENCE } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les six « وضعيات تدريبية » de أدمج تعلّماتي (unité 13) : contrat, câblage, figures, et CHAQUE nombre recalculé — les angles avec
 * rotation.js, les longueurs avec les valeurs du sinus DONNÉES dans l'énoncé (« نعطي ») en arithmétique rationnelle exacte, le
 * معلم avec rotation.rotate, et chaque égalité écrite ($a = b \times c$) évaluée. Même méthode que les مسائل du درس 4.
 */

// ── Arithmétique EXACTE : rationnels [num, den]. ──
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const qAdd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qSub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qMul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qDiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const qEq = (x, y) => x[0] * y[1] === y[0] * x[1];
const dec = (v) => { const [i, f = ''] = String(v).split('.'); const sign = i.startsWith('-') ? -1 : 1; return Q(sign * Number(i.replace('-', '') + f), 10 ** f.length); };
const num = (x) => x[0] / x[1];
const fromFrac = (f) => Q(Number(f.n), Number(f.d)); // une fraction de rotation.js

// Les valeurs du sinus que les énoncés DONNENT (« نعطي ») — et elles sont justes au centième.
const SIN = { 60: dec('0.87'), 35: dec('0.57'), 18: dec('0.31'), 37: dec('0.6'), 15: dec('0.26') };

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => stepsOf(id, part).filter((s) => s.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const E = (id, part) => expectedOf(id, part).map((v) => dec(String(v)));

// ── Vérificateur des ÉGALITÉS écrites ────────────────────────────────────────
// Évalue + − × ÷ \frac / \dfrac, parenthèses, décimaux « 0{,}59 », degrés « 72^\circ », et \sin des angles DONNÉS (remplacé par la
// valeur de l'énoncé). « \approx » se lit « = » une fois le sinus remplacé. Les longueurs sont ramenées au cm (1 m = 100). Un membre
// avec une lettre ou une racine n'est pas évaluable et n'est pas comparé.
function evalExpr(src) {
  const s = src
    .replace(/\\sin\s*(\d+(?:\{,\}\d+)?)\^\\circ/g, (_, a) => { const k = a.replace('{,}', '.'); if (!SIN[k]) throw new Error(`sin ${a} non donné`); return `(${num(SIN[k])})`; })
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\^\\circ/g, '').replace(/\\,\\mathrm\{cm\}/g, '').replace(/\\,\\mathrm\{m\}/g, '*100')
    .replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = add(); i++; return v; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (j === i) throw new Error(`bad number in ${src}`);
    return dec(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? qMul(v, w) : qDiv(v, w); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? qAdd(v, w) : qSub(v, w); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
/** Chaque formule $…$ : ses membres évaluables séparés par « = » ou « \approx » sont égaux. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const sides = f.split(/=|\\approx/).map(evalExpr).filter(Boolean);
    if (sides.length < 2) continue;
    for (const v of sides.slice(1)) expect(qEq(v, sides[0]), f).toBe(true);
    checked++;
  }
  return checked;
}
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angleAt = (P, at, from, to) => {
  const u = [P[from][0] - P[at][0], P[from][1] - P[at][1]]; const v = [P[to][0] - P[at][0], P[to][1] - P[at][1]];
  return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI;
};

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-dawaran)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab, then the analysis 7 and the final test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => [m.number, m.slug])).toEqual([
      [0, 'astaidd'], [1, 'wadiya-1'], [2, 'wadiya-2'], [3, 'wadiya-3'], [4, 'wadiya-4'], [5, 'wadiya-5'], [6, 'wadiya-6'],
      [7, 'al-wadiya'], [8, 'itqan'],
    ]);
    expect(LESSON_CONFIG.modules.find((m) => m.number === 7).stage).toBe('practice_lab');
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    expect(LESSON_CONFIG.resources.find((r) => r.code === 'situation-hadiqa-umumiya').module).toBe(7);
  });

  it('every training is titled « الوضعية التدريبية N », is a platform addition, and the Oran roundabout of the test is NOT trained on', () => {
    LESSON_CONFIG.modules.filter((m) => m.track === 'problem').forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type).toBe('platform_addition');
      expect(p.source.reason).toBe('exam_style_problem');
      expect(JSON.stringify(p), p.id).not.toMatch(/وهران|الدوّار|22\{,\}5|ثمانية أعمدة/);
    });
  });

  it('six different tones, six different figures', () => {
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    expect(new Set(PROBLEMS.map((p) => JSON.stringify(p.figure))).size).toBe(6);
  });

  it('no sub-step is an assessment: mastery comes from module 8 only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
  });

  it('every `requires` is one of the lesson\'s prior knowledge ids', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) for (const r of s.requires ?? []) expect(LESSON_CONFIG.priorKnowledge, `${p.id}: ${r}`).toContain(r);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('no point name, « / », « √ » or « ² » bare in the Arabic prose (math in $…$)', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[A-Z]/);
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\d\s*\/\s*\d|√|²/);
    }
  });

  it('each statement shows its figure: valid GeoFigure, readable (figureQuality), wide enough beyond 6 points', () => {
    for (const p of PROBLEMS) {
      expect(SUPPORT_REFERENCE.test(p.statement), p.id).toBe(true);
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
      if (Object.keys(p.figure.points).length > 6) expect(p.figure.maxWidth, p.id).toBeGreaterThanOrEqual(440);
    }
  });

  it('the given sines are right to the hundredth, and are written in the statements', () => {
    for (const [a, v] of Object.entries(SIN)) expect(Math.abs(Math.sin((Number(a) * Math.PI) / 180) - num(v))).toBeLessThan(0.005);
    expect(PROBLEM['wadiya-1'].statement).toContain('\\sin 60^\\circ \\approx 0{,}87');
    expect(PROBLEM['wadiya-2'].statement).toContain('\\sin 35^\\circ \\approx 0{,}57');
    expect(PROBLEM['wadiya-3'].statement).toContain('\\sin 18^\\circ \\approx 0{,}31');
    expect(PROBLEM['wadiya-5'].statement).toContain('\\sin 37^\\circ \\approx 0{,}6');
    expect(PROBLEM['wadiya-6'].statement).toContain('\\sin 15^\\circ \\approx 0{,}26');
    expect(PROBLEM['wadiya-6'].statement).toContain('\\sin 60^\\circ \\approx 0{,}87');
  });

  it('every written equality (explain, prompt, solution lines, correct options, statements) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) {
      checked += checkText(p.statement);
      p.parts.forEach((part) => part.steps.forEach((s) => {
        for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t);
        if (s.kind === 'choice') checked += checkText(s.options[s.correct]);
      }));
    }
    expect(checked).toBeGreaterThan(60);
  });

  it('the equality checker catches a wrong number', () => {
    expect(() => checkText('$\\frac{180 - 36}{2} = 70$')).toThrow();
    expect(() => checkText('$40 \\times \\sin 60^\\circ \\approx 40 \\times 0{,}87 = 34{,}7$')).toThrow();
    expect(() => checkText('$208{,}8 \\times 150 = 31230$')).toThrow();
    expect(() => checkText('$360 \\div 12 = 20$')).toThrow();
  });

  // ── Les figures sont les situations des énoncés ──
  it('the figures match the statements (points on the circles, the given angle and lengths)', () => {
    const on = (fig, names, r) => names.forEach((n) => expect(Math.hypot(...fig.points[n]), n).toBeCloseTo(r, 2));
    const f1 = PROBLEM['wadiya-1'].figure;
    on(f1, ['A', 'B', 'C'], 4);
    expect(angleAt(f1.points, 'O', 'A', 'B')).toBeCloseTo(120, 1);
    expect(angleAt(f1.points, 'O', 'B', 'C')).toBeCloseTo(120, 1);

    const f2 = PROBLEM['wadiya-2'].figure;
    on(f2, ['A', 'B', 'M', 'N'], 4);
    expect(angleAt(f2.points, 'M', 'A', 'B')).toBeCloseTo(35, 1); // l'angle donné
    expect(angleAt(f2.points, 'N', 'A', 'B')).toBeCloseTo(35, 1); // même arc : la question 1)
    expect(angleAt(f2.points, 'O', 'A', 'B')).toBeCloseTo(70, 1);

    const f3 = PROBLEM['wadiya-3'].figure;
    const V = Rot.regularVertices({ x: 0, y: 0 }, 4, 10, 252);
    'ABCDEFGHIJ'.split('').forEach((n, k) => { expect(f3.points[n][0], n).toBeCloseTo(V[k].x, 3); expect(f3.points[n][1], n).toBeCloseTo(V[k].y, 3); });

    const f4 = PROBLEM['wadiya-4'].figure;
    expect(f4.points.O).toEqual([0, 0]);
    expect(f4.points.A).toEqual([3, 4]);
    expect(f4.grid && f4.axes).toBeTruthy();

    const f5 = PROBLEM['wadiya-5'].figure;
    on(f5, ['A', 'B', 'C'], 5);
    expect(dist(f5.points.A, f5.points.B)).toBeCloseTo(10, 6);
    expect(dist(f5.points.B, f5.points.C)).toBeCloseTo(6, 6);
    expect(dist(f5.points.A, f5.points.E)).toBeCloseTo(4, 6);
    const [E5, F5, B5, C5] = ['E', 'F', 'B', 'C'].map((n) => f5.points[n]);
    expect((F5[0] - E5[0]) * (C5[1] - B5[1]) - (F5[1] - E5[1]) * (C5[0] - B5[0])).toBeCloseTo(0, 6); // (EF) // (BC)
    expect(dist(f5.points.A, F5)).toBeCloseTo(3.2, 6);

    const f6 = PROBLEM['wadiya-6'].figure;
    on(f6, ['12', '1', '3', '5', '9'], 4);
    // le sens des aiguilles est le sens INDIRECT : 3 → 5 par le دوران (O, 60°, indirect)
    const img = Rot.rotateApprox({ x: f6.points['3'][0], y: f6.points['3'][1] }, { x: 0, y: 0 }, 60, Rot.INDIRECT);
    expect(img.x).toBeCloseTo(f6.points['5'][0], 2);
    expect(img.y).toBeCloseTo(f6.points['5'][1], 2);
  });

  // ── Les nombres, recalculés ──
  it('وضعية 1 — three blades: 120°, equilateral, 69,6 m, 208,8 m, 31 320 DA', () => {
    const central = fromFrac(Rot.centralAngle(3));
    const half = qDiv(central, Q(2));
    expect(E('wadiya-1', 0)).toEqual([central]);
    expect(qEq(half, Q(60))).toBe(true);
    expect(correctOf('wadiya-1', 1, 0)).toContain('$60^\\circ$');
    const AH = qMul(Q(40), SIN[60]);
    const AB = qMul(Q(2), AH);
    const cable = qMul(Q(3), AB);
    expect(E('wadiya-1', 1)).toEqual([AH, AB, cable]);
    expect(Math.abs(num(AB) - Rot.sideFromRadius(3, 40).number)).toBeLessThan(0.5);
    expect(Math.abs(num(cable) - Rot.perimeter(3, 40).number)).toBeLessThan(1.5);
    expect(E('wadiya-1', 2)).toEqual([AB, qMul(cable, Q(150))]);
    expect(PROBLEM['wadiya-1'].statement).toContain('150 دج');
    expect(correctOf('wadiya-1', 0, 1)).toMatch(/متقايس الأضلاع/);
  });

  it('وضعية 2 — theatre: 70°, 35°, 22,8 m, 2736 DA', () => {
    const inscribed = Q(35);
    const central = qMul(Q(2), inscribed);
    expect(E('wadiya-2', 0)).toEqual([central]);
    expect(correctOf('wadiya-2', 0, 1)).toMatch(/^\$35\^\\circ\$/); // même arc ⇒ même angle
    expect(Rot.centralFromInscribed(35)).toBeDefined();
    const AH = qMul(Q(20), SIN[35]);
    const AB = qMul(Q(2), AH);
    expect(correctOf('wadiya-2', 1, 0)).toMatch(/^\$35\^\\circ\$/);
    expect(E('wadiya-2', 1)).toEqual([AH, AB, qMul(AB, Q(120))]);
    expect(Math.abs(num(AB) - 2 * 20 * Math.sin((35 * Math.PI) / 180))).toBeLessThan(0.5);
    expect(PROBLEM['wadiya-2'].statement).toContain('120 دج');
  });

  it('وضعية 3 — decagon: 36°, 72°, 144°, 12,4 m (≠ the radius), 124 m, 111 600 DA', () => {
    const n = 10;
    const central = fromFrac(Rot.centralAngle(n));
    const base = qDiv(qSub(Q(180), central), Q(2));
    const interior = fromFrac(Rot.interiorAngle(n));
    expect(qEq(qMul(Q(2), base), interior)).toBe(true);
    expect(E('wadiya-3', 0)).toEqual([central, base, interior]);
    expect(correctOf('wadiya-3', 1, 0)).toBe('$18^\\circ$: نصف الزاوية المركزية');
    const AH = qMul(Q(20), SIN[18]);
    const AB = qMul(Q(2), AH);
    expect(E('wadiya-3', 1)).toEqual([AH, AB]);
    expect(qEq(AB, Q(20))).toBe(false); // le piège : côté ≠ rayon hors hexagone
    expect(Math.abs(num(AB) - Rot.sideFromRadius(n, 20).number)).toBeLessThan(0.1);
    expect(Rot.sidesFromCentral(60)).toBe(6); // côté = rayon seulement pour 360/60 = 6
    const perim = qMul(Q(n), AB);
    expect(E('wadiya-3', 2)).toEqual([perim, qMul(perim, Q(900))]);
    expect(PROBLEM['wadiya-3'].statement).toContain('900 دج');
  });

  it('وضعية 4 — robot: A′(−4 ; 3), OA = OA′ = 5, AA′² = 50, the square of area 50', () => {
    const O = { x: 0, y: 0 };
    const A = { x: 3, y: 4 };
    const img = Rot.rotate(A, O, 90, Rot.DIRECT);
    const [x, y] = [fromFrac(img.x), fromFrac(img.y)];
    expect(E('wadiya-4', 0).slice(0, 2)).toEqual([x, y]);
    expect([num(x), num(y)]).toEqual([-4, 3]);
    const OA2 = 3 * 3 + 4 * 4;
    expect(Math.sqrt(OA2)).toBe(5);
    expect(num(x) ** 2 + num(y) ** 2).toBe(OA2); // la distance à O est conservée
    expect(expectedOf('wadiya-4', 1)).toEqual([5, 5]);
    expect(PROBLEM['wadiya-4'].statement).toContain('A(3\\,;\\,4)');
    // OAA′ rectangle en O : AA′² = OA² + OA′²
    const AA2 = (A.x - num(x)) ** 2 + (A.y - num(y)) ** 2;
    expect(AA2).toBe(2 * OA2);
    expect(expectedOf('wadiya-4', 2)).toEqual([AA2, AA2]);
    // les quatre images successives d'un quart de tour forment un carré dont le côté au carré est la mesure de l'aire
    const four = [0, 90, 180, 270].map((a) => Rot.rotate(A, O, a, Rot.DIRECT)).map((p) => [num(fromFrac(p.x)), num(fromFrac(p.y))]);
    const side2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    for (let k = 0; k < 4; k += 1) expect(side2(four[k], four[(k + 1) % 4])).toBe(AA2);
    expect(side2(four[0], four[2])).toBe(2 * AA2); // diagonale de carré
    expect(Rot.sidesFromCentral(90)).toBe(4);
  });

  it('وضعية 5 — circle: right angle, AC = 8, sin = 0,6 ⇒ 37°, BOC = 74°, Thales AF = 3,2 and EF = 2,4', () => {
    const AB = 10, BC = 6;
    const AC2 = AB * AB - BC * BC;
    expect(AC2).toBe(64);
    expect(E('wadiya-5', 0)).toEqual([Q(AC2), Q(Math.sqrt(AC2))]);
    expect(Rot.centralFromInscribed(90)).toBeDefined();
    const sinBAC = BC / AB;
    expect(sinBAC).toBe(0.6);
    expect(Math.round((Math.asin(sinBAC) * 180) / Math.PI)).toBe(37);
    expect(E('wadiya-5', 1)).toEqual([Q(37), qMul(Q(2), Q(37))]);
    const k = qDiv(Q(4), Q(10));
    expect(E('wadiya-5', 2)).toEqual([qMul(k, Q(8)), qMul(k, Q(BC))]);
    expect(correctOf('wadiya-5', 2, 0)).toContain('AE}{AB}');
    expect(PROBLEM['wadiya-5'].statement).toContain('AE = 4');
  });

  it('وضعية 6 — clock: 30°, 60° indirect, 26 cm, 87 cm, 312 cm, 2496 DA', () => {
    const n = 12;
    const central = fromFrac(Rot.centralAngle(n));
    expect(E('wadiya-6', 0).slice(0, 1)).toEqual([central]);
    expect(E('wadiya-6', 0)[1]).toEqual(qMul(Q(2), central));
    expect(correctOf('wadiya-6', 0, 0)).toMatch(/^غير مباشر/);
    expect(Rot.signOf).toBeDefined();
    const half = qDiv(central, Q(2));
    expect(qEq(half, Q(15))).toBe(true);
    expect(correctOf('wadiya-6', 1, 0)).toContain('$15^\\circ$');
    const halfChord = qMul(Q(50), SIN[15]);
    const chord = qMul(Q(2), halfChord);
    const far = qMul(Q(2), qMul(Q(50), SIN[60])); // 12 → 4 : 4 × 30 = 120°, moitié 60°
    expect(qEq(qMul(Q(4), central), Q(120))).toBe(true);
    expect(E('wadiya-6', 1)).toEqual([halfChord, chord, far]);
    expect(Math.abs(num(chord) - Rot.chord(n, 50, 1))).toBeLessThan(0.5);
    expect(Math.abs(num(far) - Rot.chord(n, 50, 4))).toBeLessThan(0.5);
    const string = qMul(Q(n), chord);
    expect(E('wadiya-6', 2)).toEqual([string, qMul(qDiv(string, Q(100)), Q(800))]);
    expect(PROBLEM['wadiya-6'].statement).toContain('800 دج');
  });
});
