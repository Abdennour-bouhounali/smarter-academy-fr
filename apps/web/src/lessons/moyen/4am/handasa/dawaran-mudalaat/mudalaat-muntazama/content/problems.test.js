import { describe, it, expect } from 'vitest';
import * as Rot from '@smarter-academy/core/arithmetic/rotation.js';
import { validateProblem, SUPPORT_REFERENCE } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « المضلعات المنتظمة وتطبيقاتها » : contrat, câblage, figures, et CHAQUE nombre recalculé —
 * les angles avec rotation.js (centralAngle, interiorAngle), les longueurs avec les valeurs du sinus DONNÉES dans
 * l'énoncé (« نعطي ») en arithmétique rationnelle exacte, et chaque égalité écrite ($a = b \times c$) évaluée.
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
const fromFrac = (f) => Q(Number(f.n), Number(f.d)); // une fraction de linear.js (BigInt ou nombre)

// Les valeurs du sinus que les énoncés DONNENT (« نعطي ») — et elles sont justes au centième.
const SIN = { 36: dec('0.59'), 72: dec('0.95'), '22.5': dec('0.38') };

const numericOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric');
const expectedOf = (id, part) => numericOf(id, part).map((s) => s.expected);
const choiceOf = (id, part, k) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Vérificateur des ÉGALITÉS écrites ────────────────────────────────────────
// Évalue + − × ÷ \frac / \dfrac, parenthèses, décimaux « 0{,}59 », degrés « 72^\circ », et \sin des angles DONNÉS
// (remplacé par la valeur de l'énoncé). « \approx » se lit « = » une fois le sinus remplacé. Un membre avec une lettre
// (AB, \widehat{…}) n'est pas évaluable et n'est pas comparé.
function evalExpr(src) {
  const s = src
    .replace(/\\sin\s*(\d+(?:\{,\}\d+)?)\^\\circ/g, (_, a) => { const k = a.replace('{,}', '.'); if (!SIN[k]) throw new Error(`sin ${a} non donné`); return `(${num(SIN[k])})`; })
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\^\\circ/g, '').replace(/\\,\\mathrm\{cm\}/g, '').replace(/\\,\\mathrm\{m\}/g, '*100') // longueurs en cm
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

describe('les مسائل du درس « المضلعات المنتظمة وتطبيقاتها »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful >= 4 && useful <= 5, p.id).toBe(true);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no point name, « / », « √ » or « ² » bare in the Arabic prose (math in $…$)', () => {
    for (const p of PROBLEMS) for (const t of allTexts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[A-Z]/);
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\d\s*\/\s*\d|√|²/);
    }
  });

  it('each statement shows its figure: valid GeoFigure, readable (figureQuality), ≥ 480 px beyond 6 points', () => {
    for (const p of PROBLEMS) {
      expect(SUPPORT_REFERENCE.test(p.statement), p.id).toBe(true);
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
      if (Object.keys(p.figure.points).length > 6) expect(p.figure.maxWidth, p.id).toBeGreaterThanOrEqual(480);
    }
  });

  it('the figures are the regular polygons of the statements (rotation.regularVertices, to the thousandth)', () => {
    const check = (fig, names, r, start) => {
      const V = Rot.regularVertices({ x: 0, y: 0 }, r, names.length, start);
      names.forEach((n, k) => {
        expect(fig.points[n][0], n).toBeCloseTo(V[k].x, 3);
        expect(fig.points[n][1], n).toBeCloseTo(V[k].y, 3);
      });
      expect(fig.points.O).toEqual([0, 0]);
      expect(fig.circles).toEqual([{ center: 'O', radius: r }]);
    };
    check(PROBLEM['masala-1'].figure, ['A', 'B', 'C', 'D', 'E'], 5, 90);
    check(PROBLEM['masala-2'].figure, ['A', 'B', 'C', 'D', 'E', 'F'], 3, 120);
    check(PROBLEM['masala-3'].figure, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 4, 112.5);
    // l'étoile : les cinq branches relient chaque sommet au sommet d'après le suivant
    const branches = PROBLEM['masala-1'].figure.segments.filter((s) => s.tone === 'rose').map((s) => s.from + s.to);
    expect(branches).toEqual(['AC', 'CE', 'EB', 'BD', 'DA']);
  });

  it('the given sines are right to the hundredth', () => {
    for (const [a, v] of Object.entries(SIN)) expect(Math.abs(Math.sin((Number(a) * Math.PI) / 180) - num(v))).toBeLessThan(0.005);
    expect(LESSON_CONFIG.lessonProblem.statement).toContain('\\sin 36^\\circ \\approx 0{,}59');
    expect(LESSON_CONFIG.lessonProblem.statement).toContain('\\sin 72^\\circ \\approx 0{,}95');
    expect(PROBLEM['masala-3'].statement).toContain('\\sin 22{,}5^\\circ \\approx 0{,}38');
  });

  it('every written equality (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s) => {
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct]);
    }));
    expect(checked).toBeGreaterThan(40);
  });

  it('the equality checker catches a wrong number', () => {
    expect(() => checkText('$\\frac{180 - 72}{2} = 56$')).toThrow();
    expect(() => checkText('$5 \\times \\sin 36^\\circ \\approx 5 \\times 0{,}59 = 2{,}9$')).toThrow();
    expect(() => checkText('$243{,}2 \\times 20 = 4846$')).toThrow();
    expect(() => checkText('$360 \\div 8 = 40$')).toThrow();
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const R = Q(5), n = 5;
    const central = fromFrac(Rot.centralAngle(n)); // 72
    const base = qDiv(qSub(Q(180), central), Q(2)); // 54
    const interior = fromFrac(Rot.interiorAngle(n)); // 108
    expect(qEq(qMul(Q(2), base), interior)).toBe(true);
    expect(expectedOf('masala-1', 0).map(dec)).toEqual([central, base, interior]);
    expect(correctOf('masala-1', 0, 0)).toMatch(/المركزية/); // زاوية الدوران = الزاوية المركزية, pas 108°

    const half = qDiv(central, Q(2)); // 36 : le demi-angle au centre
    expect(qEq(half, Q(36))).toBe(true);
    const AH = qMul(R, SIN[36]);
    const AB = qMul(Q(2), AH);
    expect(expectedOf('masala-1', 1).map(dec)).toEqual([AH, AB]);
    expect(qEq(AB, R)).toBe(false); // le piège : côté ≠ rayon (hors hexagone)
    expect(Math.abs(num(AB) - Rot.sideFromRadius(5, 5).number)).toBeLessThan(0.05);
    expect(correctOf('masala-1', 1, 0)).toContain('$36^\\circ$');

    const AOC = qMul(Q(2), central); // 144
    expect(correctOf('masala-1', 2, 0)).toBe(`$${num(AOC)}^\\circ$`);
    const AC = qMul(Q(2), qMul(R, SIN[72])); // 9,5
    expect(Math.abs(num(AC) - Rot.star(5, 5).stroke)).toBeLessThan(0.05);
    const total = qMul(Q(5), AC); // 47,5
    const rolls = Math.ceil(num(total) / 10);
    expect(rolls * 10 >= num(total) && (rolls - 1) * 10 < num(total)).toBe(true);
    expect(Math.ceil(Rot.star(5, 5).stroke * 5 / 10)).toBe(rolls); // même résultat avec les vraies valeurs
    expect(expectedOf('masala-1', 2).map(dec)).toEqual([AC, total, Q(rolls), Q(rolls * 450)]);
    expect(LESSON_CONFIG.lessonProblem.statement).toContain('450 دج');
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const R = 3, n = 6;
    const central = fromFrac(Rot.centralAngle(n)); // 60
    const base = qDiv(qSub(Q(180), central), Q(2)); // 60 : le triangle AOB est équilatéral
    expect(qEq(base, central)).toBe(true);
    const side = Rot.sideFromRadius(n, R);
    expect(side.exact.r).toBe(1); // côté = rayon, pour l'hexagone seulement : 3·√1
    expect(qEq(fromFrac(side.exact.q), Q(R))).toBe(true);
    expect(expectedOf('masala-2', 0).map(dec)).toEqual([central, base, Q(R)]);

    const interior = fromFrac(Rot.interiorAngle(n)); // 120
    expect(qEq(qAdd(base, base), interior)).toBe(true);
    expect(expectedOf('masala-2', 1).map(dec)).toEqual([base, interior]);
    expect(correctOf('masala-2', 1, 1)).toContain('$120^\\circ$');

    const fence = (n - 1) * R; // tous les côtés sauf l'entrée
    expect(expectedOf('masala-2', 2)).toEqual([fence, fence * 2400]);
    expect(PROBLEM['masala-2'].statement).toContain('2400 دج');
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const R = Q(40), n = 8;
    const central = fromFrac(Rot.centralAngle(n)); // 45
    const base = qDiv(qSub(Q(180), central), Q(2)); // 67,5
    const interior = fromFrac(Rot.interiorAngle(n)); // 135
    expect(qEq(qMul(Q(2), base), interior)).toBe(true);
    expect(expectedOf('masala-3', 0).map(dec)).toEqual([central, base, interior]);

    const half = qDiv(central, Q(2)); // 22,5
    expect(correctOf('masala-3', 1, 0)).toBe('$22{,}5^\\circ$');
    expect(qEq(half, dec('22.5'))).toBe(true);
    const AI = qMul(R, SIN['22.5']);
    const AB = qMul(Q(2), AI);
    expect(expectedOf('masala-3', 1).map(dec)).toEqual([AI, AB]);
    expect(Math.abs(num(AB) - Rot.sideFromRadius(8, 40).number)).toBeLessThan(0.5);
    // le compas ouvert au rayon donne l'hexagone : 360 / 60 = 6 cordes, pas 8
    expect(Rot.sidesFromCentral(60)).toBe(6);

    const perim = qMul(Q(n), AB); // 243,2
    const roll = 5000; // 50 m en cm
    const signs = Math.floor(roll / num(perim));
    expect(signs * num(perim) <= roll && (signs + 1) * num(perim) > roll).toBe(true);
    expect(Math.floor(roll / (n * Rot.sideFromRadius(8, 40).number))).toBe(signs); // même résultat avec les vraies valeurs
    expect(expectedOf('masala-3', 2).map(dec)).toEqual([perim, Q(signs), Q(3500 / signs)]);
    expect(3500 % signs).toBe(0);
    expect(correctOf('masala-3', 2, 0)).toContain('5000');
  });
});
