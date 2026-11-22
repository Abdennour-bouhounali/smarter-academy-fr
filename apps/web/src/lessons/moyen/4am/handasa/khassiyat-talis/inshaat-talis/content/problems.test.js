import { describe, it, expect } from 'vitest';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (fractions de linear.js) ────────────────────────────
const { frac, mul, sub, div, eq, toNumber } = LIN;
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };
const texOf = (f) => `\\dfrac{${f.n}}{${f.d}}`;

// ── Vérificateur des ÉGALITÉS écrites (explain, lines, prompts, bonnes options) ──
// Rationnels exacts [num, den] ; évalue + − × ÷ \dfrac / \frac, parenthèses, décimaux « 5{,}2 ».
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const rAdd = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const rSub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const rMul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const rDiv = (x, y) => R(x[0] * y[1], x[1] * y[0]);
function evalExpr(src) {
  let s = src;
  for (let k = 0; k < 3; k += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\{,\}/g, ',').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\,|\s+/g, '');
  if (!/^[\d,+\-*/()]+$/.test(s)) return null; // une lettre, un \ldots : non vérifiable ici
  let i = 0;
  const num = () => {
    if (s[i] === '(') { i++; const v = sum(); i++; return v; }
    if (s[i] === '-') { i++; const v = num(); return [-v[0], v[1]]; }
    const j = i; while (/[\d,]/.test(s[i])) i++;
    const [int, dec = ''] = s.slice(j, i).split(',');
    return R(Number(int + dec), 10 ** dec.length);
  };
  const prod = () => { let v = num(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = num(); v = op === '*' ? rMul(v, w) : rDiv(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? rAdd(v, w) : rSub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
/** Chaque formule $…$ : ses membres NUMÉRIQUES (sans lettre) séparés par « = » sont égaux. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (/[<>]/.test(f)) continue;
    const sides = f.split('=').map(evalExpr).filter(Boolean);
    if (sides.length < 2) continue;
    for (const v of sides.slice(1)) expect(v, `${where}: ${f}`).toEqual(sides[0]);
    checked++;
  }
  return checked;
}

// ── Géométrie des figures (flottants : la figure est un DESSIN, ses rapports sont vérifiés à 1e-9) ──
const P = (fig, n) => fig.points[n];
const vec = (a, b) => [b[0] - a[0], b[1] - a[1]];
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const parallel = (u, v) => Math.abs(cross(u, v)) < 1e-9 * Math.hypot(...u) * Math.hypot(...v);
const close = (x, y) => expect(Math.abs(x - y)).toBeLessThan(1e-9);

describe('les مسائل du درس 3 « إنشاءات هندسية وتطبيقات خاصية طالس »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
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
      expect(useful, p.id).toBeGreaterThanOrEqual(4);
      expect(useful, p.id).toBeLessThanOrEqual(5);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare « a/b » fraction nor bare √ in the Arabic text', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\d\s*\/\s*\d|√/);
    }
  });

  it('every written equality (explain, prompts, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? []), ...(s.rows ?? []).map((r) => r.correction)].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker catches a wrong number', () => {
    expect(() => checkText('$\\dfrac{4}{7} \\times 35 = 21$', 'mutation')).toThrow();
    expect(() => checkText('$2 \\times 184 + 152 = 530$', 'mutation')).toThrow();
    expect(checkText('$5{,}2 \\times 350 = 1820$', 'decimal')).toBe(1);
  });

  it('every figure is valid and readable (figureQuality)', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('مسألة 1 — the figure is the construction: (AF) // (BE), AF : BE = 4 : 3 on opposite sides, M on (EF) with AM = 40/7', () => {
    const fig = PROBLEM['masala-1'].figure;
    const [A, B, F, E, M] = ['A', 'B', 'F', 'E', 'M'].map((n) => P(fig, n));
    expect(parallel(vec(A, F), vec(B, E))).toBe(true);
    close(dist(A, F) / dist(B, E), 4 / 3);
    expect(cross(vec(A, B), vec(A, F)) * cross(vec(A, B), vec(A, E))).toBeLessThan(0); // F et E de part et d'autre de (AB)
    expect(parallel(vec(F, M), vec(F, E))).toBe(true);
    close(dist(A, B), 10);
    close(dist(A, M), toNumber(mul(TH.ratioPoint(4, 3), 10)));
    // les graduations : AF = 4 pas égaux, BE = 3 pas égaux, même pas
    const step = dist(A, P(fig, 'f1'));
    for (const [a, b] of [['f1', 'f2'], ['f2', 'f3'], ['f3', 'F'], ['B', 'e1'], ['e1', 'e2'], ['e2', 'E']]) close(dist(P(fig, a), P(fig, b)), step);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const am = TH.ratioPoint(4, 3); // 4/7
    expect(eq(am, frac(4, 7))).toBe(true);
    expect(correctOf('masala-1', 0, 1)).toBe(`$${texOf(am)}$`);
    expect(correctOf('masala-1', 0, 2)).toBe(`$${texOf(mul(am, 10))}$ cm`); // 40/7 cm
    // la marque de l'ordre : les 4 étapes dans l'ordre 0, 1, 2, 3
    const batch = PROBLEM['masala-1'].parts[0].steps.find((s) => s.kind === 'batch');
    expect(batch.rows.map((r) => r.correct)).toEqual([0, 1, 2, 3]);
    // question 2 : le point extérieur, NA/NB = 4/3 ⇒ AN = 4·AB/(4 − 3)
    const an = mul(TH.ratioPoint(4, 3, false), 10);
    expect(expectedOf('masala-1', 1)).toEqual([10 / (4 - 3), toNumber(an)]);
    expect(toNumber(an)).toBe(40);
    // question 3 : 35 m réels, mêmes rapports
    const green = mul(am, 35); const red = sub(frac(35), green);
    expect(eq(div(green, red), frac(4, 3))).toBe(true);
    expect(expectedOf('masala-1', 2)).toEqual([toNumber(green), toNumber(red), toNumber(green) * 650, toNumber(red) * 600, toNumber(green) * 650 + toNumber(red) * 600]);
    expect(expectedOf('masala-1', 2).at(-1)).toBe(22000);
  });

  it('مسألة 2 — the figure divides [AB] in three with Thalès, and the numbers are computed', () => {
    const fig = PROBLEM['masala-2'].figure;
    const [A, B, P1, P2, P3, M1, M2] = ['A', 'B', 'P1', 'P2', 'P3', 'M1', 'M2'].map((n) => P(fig, n));
    close(dist(A, P1), dist(P1, P2)); close(dist(P2, P3), dist(P1, P2));
    expect(parallel(vec(A, P1), vec(A, P3))).toBe(true);
    expect(parallel(vec(P1, M1), vec(P3, B))).toBe(true);
    expect(parallel(vec(P2, M2), vec(P3, B))).toBe(true);
    const [t1, t2] = TH.divisionFractions(3);
    close(dist(A, M1) / dist(A, B), toNumber(t1));
    close(dist(A, M2) / dist(A, B), toNumber(t2));
    // question 1 : un tiers de 80, une fraction (pas un entier) — réponse par choix
    expect(80 % 3).not.toBe(0);
    expect(correctOf('masala-2', 0, 1)).toBe(`$${texOf(mul(t1, 80))}$ cm`);
    // question 2 : 2 + 2 + 1 = 5 parts ; marques 2 et 4
    const parts = 2 + 2 + 1; const unit = div(80, parts);
    expect(expectedOf('masala-2', 1)).toEqual([parts, toNumber(mul(unit, 2)), toNumber(unit)]);
    expect(TH.divisionFractions(parts).map(toNumber)).toContain(2 / 5);
    // question 3 : périmètres, longueur en m, prix
    const low = 2 * (60 + 32); const top = 2 * (60 + 16); const total = 2 * low + top;
    expect(expectedOf('masala-2', 2)).toEqual([low, top, total / 100, (total * 350) / 100]);
    expect(expectedOf('masala-2', 2).at(-1)).toBe(1820);
  });

  it('مسألة 3 — the figure is the fourth proportional, and the numbers are computed', () => {
    const fig = PROBLEM['masala-3'].figure;
    const [A, C, D, E, B] = ['A', 'C', 'D', 'E', 'B'].map((n) => P(fig, n));
    close(dist(A, C), 7); close(dist(A, D), 10); close(dist(A, E), 3);
    expect(parallel(vec(A, C), vec(A, D))).toBe(true);
    expect(parallel(vec(C, E), vec(D, B))).toBe(true);
    const ab = TH.constructedLength(7, 10, 3); // 7/10 = 3/AB ⇒ 30/7
    expect(eq(ab, frac(30, 7))).toBe(true);
    close(dist(A, B), toNumber(ab));
    expect(correctOf('masala-3', 0, 2)).toBe(`$${texOf(ab)}$ cm`);
    // l'échelle « 7 m ↔ 3 cm » appliquée à 10 m donne le même AB
    expect(eq(TH.fourthProportional(7, 3, 10), ab)).toBe(true);
    // question 2 : 4 parts, 5 bacs à fleurs, distance sur le plan et réelle
    const step = div(ab, 4);
    expect(correctOf('masala-3', 1, 1)).toBe(`$${texOf(step)}$ cm`); // 15/14
    expect(eq(mul(step, frac(7, 3)), frac(5, 2))).toBe(true);
    expect(expectedOf('masala-3', 1)).toEqual([4 + 1, 10 / 4]);
    // question 3 : bacs et tuyau d'arrosage
    expect(expectedOf('masala-3', 2)).toEqual([5 * 4500, 10 * 180, 5 * 4500 + 10 * 180]);
    expect(expectedOf('masala-3', 2).at(-1)).toBe(24300);
  });
});
