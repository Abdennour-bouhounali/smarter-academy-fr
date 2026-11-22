import { describe, it, expect } from 'vitest';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Rationnels EXACTS en BigInt : 0,45 et 0,46 ne se confondent jamais. ──
const babs = (x) => (x < 0n ? -x : x);
const bgcd = (a, b) => (b === 0n ? babs(a) : bgcd(b, a % b));
const R = (n, d = 1n) => {
  n = BigInt(n); d = BigInt(d);
  if (d < 0n) { n = -n; d = -d; }
  const g = bgcd(n, d) || 1n;
  return [n / g, d / g];
};
const add = (x, y) => R(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const sub = (x, y) => R(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const mul = (x, y) => R(x[0] * y[0], x[1] * y[1]);
const dvd = (x, y) => R(x[0] * y[1], x[1] * y[0]);
const eq = (x, y) => x[0] === y[0] && x[1] === y[1];
const lt = (x, y) => x[0] * y[1] < y[0] * x[1];
/** « 2,4 » → 12/5. */
const dec = (s) => { const [i, f = ''] = String(s).replace('.', ',').split(','); return R(BigInt(i + f), 10n ** BigInt(f.length)); };
const num = (x) => Number(x[0]) / Number(x[1]);

/** Une expression numérique LaTeX (nombres, {,}, \times, \dfrac, parenthèses) → rationnel, sinon null (une lettre). */
function evalExpr(src) {
  const s = src
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, ',')
    .replace(/\\times/g, '*')
    .replace(/\s+/g, '');
  if (!s || !/^[\d,+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i++] !== ')') throw new Error(src); return v; }
    const j = i; while (/[\d,]/.test(s[i] ?? '')) i++;
    if (j === i) throw new Error(src);
    return dec(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : dvd(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
/** Chaque formule $…$ : chaque relation = / ≠ / < / > entre deux membres numériques est VRAIE. Rend le nombre vérifié. */
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.replace(/\\neq/g, '≠').split(/(=|≠|<|>)/);
    for (let k = 1; k < parts.length; k += 2) {
      const a = evalExpr(parts[k - 1]); const b = evalExpr(parts[k + 1]);
      if (!a || !b) continue;
      const op = parts[k];
      const ok = op === '=' ? eq(a, b) : op === '≠' ? !eq(a, b) : op === '<' ? lt(a, b) : lt(b, a);
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
const textsOf = (p) => [
  p.statement,
  ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])]),
].filter(Boolean);

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((x) => x.kind === 'choice')[k]; return s.options[s.correct]; };
const q = (p) => num([BigInt(p.n), BigInt(p.d)]); // fraction de linear.js → nombre (pour toEqual sur des décimaux finis)
const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);

describe('les مسائل du درس « الخاصية العكسية لخاصية طالس »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, 'masala-1', 'practice_lab', 8], [6, 'masala-2', 'practice_lab', 8], [7, 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    expect(LESSON_CONFIG.resources.filter((r) => r.kind === 'situation').map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every figure is valid and readable (figureQuality), and drawn to the statement’s scale', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    // مسألة 1 — 1 unité = 10 cm : AB = 80, AC = 100, M et N au 3/10, la base (BC) horizontale, [MN] aussi.
    const P1 = PROBLEM['masala-1'].figure.points;
    expect(Math.abs(dist(P1.A, P1.B) - 8)).toBeLessThan(1e-3); // B arrondi à 4 décimales (√28 = 5,2915…)
    expect(Math.abs(dist(P1.A, P1.C) - 10)).toBeLessThan(1e-9);
    expect(Math.abs(dist(P1.A, P1.M) - 2.4)).toBeLessThan(1e-3);
    expect(Math.abs(dist(P1.A, P1.N) - 3)).toBeLessThan(1e-9);
    expect(P1.B[1]).toBe(P1.C[1]);
    expect(P1.M[1]).toBe(P1.N[1]);
    // M sur [AB], N sur [AC] : colinéaires, du côté de B et de C.
    expect(Math.abs(P1.M[0] * P1.B[1] - P1.M[1] * P1.B[0])).toBeLessThan(1e-9);
    expect(Math.abs(P1.N[0] * P1.C[1] - P1.N[1] * P1.C[0])).toBeLessThan(1e-9);
    // مسألة 2 — 1 unité = 10 cm, angle droit en A.
    const P2 = PROBLEM['masala-2'].figure.points;
    expect([dist(P2.A, P2.B), dist(P2.A, P2.C), dist(P2.B, P2.C), dist(P2.A, P2.M), dist(P2.A, P2.N)].map((x) => Math.round(x * 1e9) / 1e9)).toEqual([3, 4, 5, 1.2, 1.6]);
    // مسألة 3 — en mètres, D au point de la question 1 (HD = 2).
    const P3 = PROBLEM['masala-3'].figure.points;
    expect([dist(P3.H, P3.S), dist(P3.H, P3.B), dist(P3.H, P3.K), dist(P3.H, P3.D), dist(P3.S, P3.B)].map((x) => Math.round(x * 1e9) / 1e9)).toEqual([2.4, 3.2, 1.5, 2, 4]);
  });

  it('every numeric equality / inequality written in $…$ is true (exact rationals)', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const t of textsOf(p)) n += checkText(t, p.id);
    expect(n).toBeGreaterThan(40);
    // le vérificateur attrape une coquille
    expect(() => checkText('$80 \\times 46 = 3600$', 'mutation')).toThrow();
    expect(() => checkText('$\\dfrac{18}{30} \\neq \\dfrac{24}{40}$', 'mutation')).toThrow();
  });

  it('مسألة 1 — the numbers are computed, not typed (signed abscissas: above A < 0)', () => {
    const AB = 80, AC = 100;
    // 1) M, N sous A : rapports égaux, même ordre → parallèles.
    const c1 = TH.converse({ b: AB, bp: 24, c: AC, cp: 30 });
    expect([c1.ratiosEqual, c1.sameOrder, c1.parallel]).toEqual([true, true, true]);
    expect(expectedOf('masala-1', 0)).toEqual([24 * AC, AB * 30]);
    expect(correctOf('masala-1', 0, 2)).toMatch(/\(MN\) \\parallel \(BC\)/);
    // 2) P au-dessus de A, N en dessous : rapports égaux (0,3), ordre différent → pas parallèles.
    const c2 = TH.converse({ b: AB, bp: -24, c: AC, cp: 30 });
    expect([c2.ratiosEqual, c2.sameOrder, c2.parallel, c2.reason]).toEqual([true, false, false, 'order']);
    expect(expectedOf('masala-1', 1)).toEqual([q(c2.ratioB), q(c2.ratioC)]);
    expect(expectedOf('masala-1', 1)).toEqual([0.3, 0.3]);
    // 3) E et F au-dessus : même ordre, 36/80 ≠ 46/100 (3600 ≠ 3680) ; le trou qui convient : AF = 45 AU-DESSUS.
    const c3 = TH.converse({ b: AB, bp: -36, c: AC, cp: -46 });
    expect([c3.ratiosEqual, c3.sameOrder, c3.parallel, c3.reason]).toEqual([false, true, false, 'ratios']);
    expect(TH.crossEqual(36, AB, 46, AC)).toBe(false);
    const af = TH.fourthProportional(AB, 36, AC);
    expect(q(af)).toBe(45);
    expect(expectedOf('masala-1', 2)).toEqual([36 * AC, AB * 46, q(af)]);
    const holes = { 'فوق 44': -44, 'فوق 45': -45, 'فوق 46': -46, 'تحت 30': 30, 'تحت 45': 45 };
    const good = Object.entries(holes).filter(([, cp]) => TH.converse({ b: AB, bp: -36, c: AC, cp }).parallel).map(([k]) => k);
    expect(good).toEqual(['فوق 45']);
    expect(TH.converse({ b: AB, bp: -36, c: AC, cp: 45 }).reason).toBe('order'); // le piège : même rapport, sous A
    expect(correctOf('masala-1', 2, 2)).toBe('الثقب الذي على بعد 45 فوق $A$');
    // les données du tri : les nombres utiles viennent de l'énoncé
    for (const n of ['80', '100', '24', '30', '25', '9']) expect(LESSON_CONFIG.lessonProblem.statement).toContain(n);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const AB = 30, AC = 40, BC = 50;
    expect(AB * AB + AC * AC).toBe(BC * BC); // la كتيفة est bien rectangle en A
    const c1 = TH.converse({ b: AB, bp: 12, c: AC, cp: 16 });
    expect(c1.parallel).toBe(true);
    expect(expectedOf('masala-2', 0)).toEqual([q(TH.ratio(12, AB)), q(TH.ratio(16, AC))]);
    // 2) l'apprenti : 0,6 et 0,625 — « presque » égaux, pas égaux.
    const c2 = TH.converse({ b: AB, bp: 18, c: AC, cp: 25 });
    expect([c2.ratiosEqual, c2.sameOrder, c2.parallel]).toEqual([false, true, false]);
    expect(Math.round(q(c2.ratioC) * 10) / 10).toBe(q(c2.ratioB)); // l'arrondi au dixième les confond : le piège
    expect(expectedOf('masala-2', 1)).toEqual([q(c2.ratioC), 18 * AC, AB * 25]);
    // 3) Thalès directe une fois (MN)//(BC) prouvé : MN = BC × AM/AB ; 36 barres ; 180 دج le mètre.
    const MN = q(TH.fourthProportional(AB, 12, BC));
    expect(MN).toBe(20);
    const meters = q(LIN.div(LIN.mul(LIN.frac(36), LIN.frac(MN)), LIN.frac(100)));
    expect(meters).toBe(7.2);
    const cost = q(LIN.mul(LIN.frac(36 * MN, 100), LIN.frac(180)));
    expect(expectedOf('masala-2', 2)).toEqual([MN, meters, cost]);
    expect(cost).toBe(1296);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const HS = '2,4', HB = '3,2', HK = '1,5';
    // SB = 4 : HS² + HB² = 16
    expect(eq(add(mul(dec(HS), dec(HS)), mul(dec(HB), dec(HB))), R(16))).toBe(true);
    const c1 = TH.converse({ b: HS, bp: HK, c: HB, cp: 2 });
    expect(c1.parallel).toBe(true);
    expect(expectedOf('masala-3', 0)).toEqual([q(LIN.mul(LIN.parseNumber(HK), LIN.parseNumber(HB))), q(LIN.mul(LIN.parseNumber(HS), LIN.frac(2)))]);
    expect(expectedOf('masala-3', 0)).toEqual([4.8, 4.8]);
    // 2) E de l'autre côté de H : 0,625 = 0,625 mais ordre différent.
    const c2 = TH.converse({ b: HS, bp: HK, c: HB, cp: -2 });
    expect([c2.ratiosEqual, c2.sameOrder, c2.parallel, c2.reason]).toEqual([true, false, false, 'order']);
    expect(expectedOf('masala-3', 1)).toEqual([q(c2.ratioB), q(c2.ratioC)]);
    expect(expectedOf('masala-3', 1)).toEqual([0.625, 0.625]);
    // 3) KD = SB × HK/HS ; 5 tentes × 4 cordes ; rouleaux de 20 m (on arrondit AU-DESSUS) ; 900 دج.
    const KD = q(TH.fourthProportional(HS, HK, 4));
    expect(KD).toBe(2.5);
    const total = 5 * 4 * KD;
    const rolls = Math.ceil(total / 20);
    expect([total, rolls]).toEqual([50, 3]);
    expect((rolls - 1) * 20).toBeLessThan(total);
    expect(expectedOf('masala-3', 2)).toEqual([KD, total, rolls, rolls * 900]);
  });

  it('data: 4–5 useful items and a useless NUMBER in every problem', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful).toBeGreaterThanOrEqual(4);
      expect(useful).toBeLessThanOrEqual(5);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text).not.toMatch(/\$/);
    }
  });
});
