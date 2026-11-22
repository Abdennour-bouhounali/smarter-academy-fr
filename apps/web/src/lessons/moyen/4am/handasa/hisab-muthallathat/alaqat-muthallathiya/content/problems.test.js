import { describe, it, expect } from 'vitest';
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
/** La bonne option de la k-ième étape `choice` de la partie. */
const correctOf = (id, part, k) => { const s = stepsOf(id, part).filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };
const tex = (x) => `$${TR.surdLatex(x)}$`;
const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

// ── Évaluateur EXACT des formules à radicaux (Σ c·√r, c rationnel) ─────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const squareFree = (n) => { let k = 1, s = n; for (let p = 2; p * p <= s; p++) while (s % (p * p) === 0) { s /= p * p; k *= p; } return [k, s]; };
const V = (entries) => { const m = new Map(); for (const [r, c] of entries) { if (c[0] === 0) continue; const prev = m.get(r); const v = prev ? rAdd(prev, c) : c; if (v[0] === 0) m.delete(r); else m.set(r, v); } return m; };
const vNum = (q) => V([[1, q]]);
const vAdd = (x, y) => V([...x, ...y]);
const vNeg = (x) => V([...x].map(([r, c]) => [r, [-c[0], c[1]]]));
const vMul = (x, y) => { const out = []; for (const [r1, c1] of x) for (const [r2, c2] of y) { const [k, s] = squareFree(r1 * r2); out.push([s, rMul(rMul(c1, c2), [k, 1])]); } return V(out); };
const vInv = (x) => { if (x.size !== 1) throw new Error('division par une somme'); const [[r, c]] = [...x]; return V([[r, R(c[1], c[0] * r)]]); };
const vSqrt = (x) => {
  if (x.size === 0) return V([]);
  if (x.size !== 1 || !x.has(1)) throw new Error('racine d\'un irrationnel');
  const [n, d] = x.get(1);
  if (n < 0) throw new Error('racine d\'un négatif');
  const [k, s] = squareFree(n * d);
  return V([[s, R(k, d)]]);
};
const vEq = (x, y) => vAdd(x, vNeg(y)).size === 0;
const vFloat = (x) => [...x].reduce((t, [r, c]) => t + (c[0] / c[1]) * Math.sqrt(r), 0);

/** Une expression numérique LaTeX → valeur exacte, ou null (lettres, cos x…). */
function evalSurd(src) {
  const s = src
    .replace(/\\,\\mathrm\{[a-z]+\}/g, '').replace(/\^\{\\circ\}/g, '')
    .replace(/\\left|\\right/g, '').replace(/\\dfrac/g, '\\frac').replace(/\{,\}/g, '.')
    .replace(/\\times|\\cdot/g, '*').replace(/\\div/g, '/').replace(/\s+/g, '');
  let i = 0;
  const peek = (t) => s.startsWith(t, i);
  const eat = (t) => { if (!peek(t)) throw new Error(`attendu ${t}`); i += t.length; };
  const group = () => { eat('{'); const v = sum(); eat('}'); return v; };
  const primary = () => {
    if (peek('(')) { i++; const v = sum(); eat(')'); return v; }
    if (peek('{')) return group();
    if (peek('\\sqrt')) { i += 5; return vSqrt(group()); }
    if (peek('\\frac')) { i += 5; const a = group(); const b = group(); return vMul(a, vInv(b)); }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error('jeton inattendu');
    i += m[0].length;
    const [ip, fp = ''] = m[0].split('.');
    return vNum(R(Number(ip + fp), 10 ** fp.length));
  };
  const power = () => { let v = primary(); while (peek('^')) { i++; const e = peek('{') ? group() : primary(); const [[, [n]]] = [...e]; let p = vNum([1, 1]); for (let k = 0; k < n; k++) p = vMul(p, v); v = p; } return v; };
  const unary = () => (peek('-') ? (i++, vNeg(unary())) : power());
  const startsFactor = () => peek('\\sqrt') || peek('(') || peek('\\frac');
  const prod = () => {
    let v = unary();
    for (;;) {
      if (peek('*')) { i++; v = vMul(v, unary()); } else if (peek('/')) { i++; v = vMul(v, vInv(unary())); } else if (startsFactor()) v = vMul(v, unary()); else break;
    }
    return v;
  };
  function sum() { let v = prod(); while (peek('+') || peek('-')) { const op = s[i++]; const w = prod(); v = op === '+' ? vAdd(v, w) : vAdd(v, vNeg(w)); } return v; }
  try { const v = sum(); return i === s.length ? v : null; } catch { return null; }
}

/** Chaque formule $…$ : membres « = » égaux EXACTEMENT, « \neq » différents, « < » vrai, « \approx » à 1 % près. */
function checkFormula(f, where) {
  let checked = 0;
  const ends = [];
  for (const seg of f.split('\\approx')) {
    if (seg.includes('\\neq')) {
      const [a, b] = seg.split('\\neq').map(evalSurd);
      if (a && b) { expect(vEq(a, b), `${where}: ${f}`).toBe(false); checked++; }
      ends.push([null, null]);
      continue;
    }
    if (seg.split('<').length === 2) {
      const [a, b] = seg.split('<').map(evalSurd);
      if (a && b) { expect(vFloat(a) < vFloat(b), `${where}: ${f}`).toBe(true); checked++; }
      ends.push([null, null]);
      continue;
    }
    const sides = seg.split('=').map(evalSurd).filter(Boolean);
    for (const v of sides.slice(1)) { expect(vEq(v, sides[0]), `${where}: ${f}`).toBe(true); checked++; }
    ends.push([sides[0] ?? null, sides.at(-1) ?? null]);
  }
  for (let k = 0; k + 1 < ends.length; k++) {
    const a = ends[k][1], b = ends[k + 1][0];
    if (a && b) { expect(Math.abs(vFloat(a) - vFloat(b)) / Math.abs(vFloat(b)), `${where}: ${f}`).toBeLessThan(0.01); checked++; }
  }
  return checked;
}
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const allTexts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

describe('les مسائل du درس 3 « العلاقات بين النسب المثلثية »', () => {
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

  it('every figure is valid and readable (figureQuality = [])', () => {
    for (const p of PROBLEMS) {
      expect(p.figure, p.id).toBeTruthy();
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('the figures are drawn on the problems\' own numbers', () => {
    // مسألة 1 : la corde YT est l'hypoténuse, TH / YT = sin x = 3/7 (au centième près : H = (√40 ; 0) arrondi).
    const k = PROBLEM['masala-1'].figure.points;
    const yt = Math.hypot(k.T[0] - k.Y[0], k.T[1] - k.Y[1]);
    expect(k.H[1]).toBe(k.Y[1]); expect(k.H[0]).toBe(k.T[0]);
    expect(Math.abs((k.T[1] - k.H[1]) / yt - 3 / 7)).toBeLessThan(0.001);
    // مسألة 3 : PR = 21, RQ = 20, PQ = 29 (Pythagore) : cos x = 21/29.
    const s = PROBLEM['masala-3'].figure.points;
    const pr = s.R[0] - s.P[0], rq = s.Q[1] - s.R[1];
    expect([pr, rq, Math.hypot(pr, rq)]).toEqual([21, 20, 29]);
    // مسألة 2 : figure NON à l'échelle (la légende le dit) — la pente est exagérée, ses étiquettes sont les mesures.
    const r = PROBLEM['masala-2'].figure;
    expect(r.caption).toMatch(/غير مرسوم بالسلّم/);
    expect(r.segments.map((g) => g.label).filter(Boolean)).toEqual(['75 m', '21 m']);
  });

  it('every written equality evaluates exactly (formulas in statements, prompts, options, explains, solutions)', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of allTexts(p)) for (const f of formulas(t)) checked += checkFormula(f, p.id);
    expect(checked).toBeGreaterThan(60);
  });

  it('the evaluator catches a wrong number (mutation)', () => {
    expect(() => checkFormula('\\dfrac{3}{7} \\div \\dfrac{2\\sqrt{10}}{7} = \\dfrac{3\\sqrt{10}}{21}', 'mutation')).toThrow();
    expect(() => checkFormula('1 - 0{,}28^2 = 0{,}9206', 'mutation')).toThrow();
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const { cos, sin, tan } = TR.fromRatio('sin', '3/7');
    // 1) la construction : OA = 3 (le côté opposé), le rayon = 7 (l'hypoténuse), le sommet = B.
    expect(expectedOf('masala-1', 0)).toEqual([3, 7]);
    // 2) cos² x = 40/49, cos x = 2√10/7, tan x = 3√10/20 ≈ 0,47.
    expect(correctOf('masala-1', 1, 1)).toBe('$\\dfrac{40}{49}$');
    expect(TR.square(cos)).toEqual({ n: 40, d: 49 });
    expect(correctOf('masala-1', 1, 2)).toBe(tex(cos));
    expect(correctOf('masala-1', 1, 3)).toBe(tex(tan));
    expect(TR.pythagoreanIdentity(cos, sin)).toBe(true);
    expect(expectedOf('masala-1', 1)).toEqual([round(TR.surdNumber(tan), 2)]);
    // 3) cos y = 3/7 → sin y = 2√10/7 ≈ 0,90 ≠ sin x ; sin y > sin x : le cerf-volant d'أمين est plus haut.
    const y = TR.fromRatio('cos', '3/7');
    expect(correctOf('masala-1', 2, 1)).toBe(tex(y.sin));
    expect(expectedOf('masala-1', 2)).toEqual([round(TR.surdNumber(y.sin), 2)]);
    expect(TR.surdEq(y.sin, sin)).toBe(false);
    expect(TR.surdCmp(y.sin, sin)).toBe(1);
    expect(TR.surdEq(y.sin, cos)).toBe(true); // y est l'AUTRE angle aigu du triangle de يونس
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const sinX = 21 / 75;
    const { cos, tan } = TR.fromRatio('sin', '21/75');
    expect(expectedOf('masala-2', 0)).toEqual([sinX, round(1 - sinX ** 2, 4), TR.surdNumber(cos)]);
    expect(TR.isRational(cos)).toBe(true); // 0,96 : la valeur exacte est décimale
    expect(correctOf('masala-2', 1, 0)).toBe(tex(tan));
    const slope = Math.round(TR.surdNumber(tan) * 100);
    expect(expectedOf('masala-2', 1)).toEqual([slope]);
    expect(slope).toBe(29);
    expect(Math.round(sinX * 100)).toBe(28); // la pancarte fausse : le sinus, pas la tangente
    expect(TR.surdCmp(tan, '1/4')).toBe(1); // > 25 % : interdit aux camions
    // 3) la déviation : sin y = 0,2.
    const y = TR.fromRatio('sin', '0,2');
    expect(expectedOf('masala-2', 2)).toEqual([round(1 - 0.2 ** 2, 2), Math.round(TR.surdNumber(y.tan) * 100)]);
    expect(correctOf('masala-2', 2, 0)).toBe(tex(y.cos));
    expect(correctOf('masala-2', 2, 1)).toBe(tex(y.tan));
    expect(TR.surdCmp(y.tan, '1/4')).toBe(-1); // < 25 % : permis
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const { sin, tan } = TR.fromRatio('cos', '21/29');
    expect(expectedOf('masala-3', 0)).toEqual([29 ** 2 - 21 ** 2]);
    expect(correctOf('masala-3', 0, 1)).toBe(tex(sin));
    expect(correctOf('masala-3', 0, 2)).toBe(tex(tan));
    // 2) le rapport impossible : 0,8² + 0,5² = 0,89 ≠ 1 ; avec cos y = 0,8 : sin² y = 0,36, sin y = 0,6.
    expect(TR.pythagoreanIdentity('0,8', '0,5')).toBe(false);
    const y = TR.fromRatio('cos', '0,8');
    expect(expectedOf('masala-3', 1)).toEqual([round(0.8 ** 2 + 0.5 ** 2, 2), round(1 - 0.8 ** 2, 2), TR.surdNumber(y.sin)]);
    // 3) le gabarit : tan x = 20/21 → 20 cm (opposé), 21 cm (adjacent) ; vérification ≈ 44°.
    expect(TR.surdLatex(tan)).toBe('\\dfrac{20}{21}');
    expect(expectedOf('masala-3', 2)).toEqual([20, 21, Math.round(TR.atanDeg(20 / 21))]);
  });
});
