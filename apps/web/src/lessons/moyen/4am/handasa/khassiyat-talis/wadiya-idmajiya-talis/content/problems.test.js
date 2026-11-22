import { describe, it, expect } from 'vitest';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (fractions de linear.js) : rien n'arrondit. ─────────────────────────────
const F = (v) => (typeof v === 'object' ? v : LIN.parseNumber(String(v)));
const same = (p, v) => LIN.eq(F(p), F(v));
const fourth = TH.fourthProportional;

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const answers = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = steps(id, part).filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── Vérificateur des ÉGALITÉS écrites (explain, lines, bonnes options, énoncés) ────────────────
// Évalue + − × \dfrac, puissances entières, parenthèses, décimaux « 4{,}5 », exactement ; un membre avec une lettre
// ou un π est ignoré, les membres numériques d'une même chaîne « = » doivent être égaux.
function evalExpr(src) {
  let s = src.replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\{,\}/g, '.');
  for (let i = 0; i < 3; i += 1) s = s.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))');
  s = s.replace(/\\times/g, '*').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()^]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    let v;
    if (s[i] === '(') { i += 1; v = add(); i += 1; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i += 1;
      if (j === i) throw new Error(`bad number in ${src}`);
      v = F(s.slice(j, i));
    }
    if (s[i] === '^') { i += 1; const j = i; while (/\d/.test(s[i] ?? '')) i += 1; const e = Number(s.slice(j, i)); let r = F(1); for (let k = 0; k < e; k += 1) r = LIN.mul(r, v); v = r; }
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i]; i += 1; const w = atom(); v = op === '*' ? LIN.mul(v, w) : LIN.div(v, w); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i]; i += 1; const w = prod(); v = op === '+' ? LIN.add(v, w) : LIN.sub(v, w); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\neq')) {
      const [x, y] = f.split('\\neq').map(evalExpr);
      if (x && y) { expect(LIN.eq(x, y), f).toBe(false); checked += 1; }
      continue;
    }
    const rel = ['<', '>'].find((op) => f.includes(op));
    if (rel) {
      const [x, y] = f.split(rel).map(evalExpr);
      if (x && y) { expect(LIN.cmp(x, y), f).toBe(rel === '<' ? -1 : 1); checked += 1; }
      continue;
    }
    const sides = f.split('=').map(evalExpr).filter(Boolean);
    if (sides.length < 2) continue;
    for (const v of sides.slice(1)) expect(LIN.eq(v, sides[0]), f).toBe(true);
    checked += 1;
  }
  return checked;
}
/** Ce qui est AFFIRMÉ : énoncé, questions, prompts, explications, lignes, et la BONNE option (les autres sont des erreurs voulues). */
const assertedTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.lines ?? []), s.options?.[s.correct]])])].filter(Boolean);

const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
const cross = (P, Q, R, S) => (Q[0] - P[0]) * (S[1] - R[1]) - (Q[1] - P[1]) * (S[0] - R[0]);
const parallel = (pts, [p, q], [r, s]) => Math.abs(cross(pts[p], pts[q], pts[r], pts[s])) / (dist(pts[p], pts[q]) * dist(pts[r], pts[s])) < 1e-3;
const onSegmentAt = (pts, p, q, r, t) => dist(pts[r], [pts[p][0] + t * (pts[q][0] - pts[p][0]), pts[p][1] + t * (pts[q][1] - pts[p][1])]) < 2e-3;
const collinear = (pts, p, q, r) => Math.abs(cross(pts[p], pts[q], pts[p], pts[r])) / (dist(pts[p], pts[q]) * dist(pts[p], pts[r])) < 1e-3;

describe('les six وضعيات تدريبية de « أدمج تعلّماتي » — خاصية طالس', () => {
  it('respect the GuidedProblem contract', () => {
    expect(PROBLEMS).toHaveLength(6);
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6 — track problem, practice_lab, before the analysis 7 and the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((n) => [n, `0${n}`, `wadiya-${n}`, 'practice_lab']),
    );
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules[7]).toMatchObject({ slug: 'al-wadiya', stage: 'practice_lab' });
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation' && /^wadiya-/.test(r.code));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [`wadiya-${n}`, n]));
  });

  it('are platform additions (exam style), never the textbook; each has its own tone and a drawn support', () => {
    for (const p of PROBLEMS) {
      expect(p.source).toMatchObject({ type: 'platform_addition' });
      expect(Boolean(p.figure || p.table || p.illustration), p.id).toBe(true);
    }
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the data to sort are PLAIN text — InfoSorter writes them as they are (a « $ » showed raw on screen, walk of 2026-11-10)', () => {
    for (const p of PROBLEMS) for (const d of p.data ?? []) expect(d.text, `${p.id} ${d.id}`).not.toMatch(/\$|\\/);
  });

  it('a problem that sorts its data has a useless datum, one of them a number', () => {
    for (const p of PROBLEMS.filter((q) => q.parts[0].steps.some((s) => s.kind === 'sort'))) {
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.length, p.id).toBeGreaterThanOrEqual(1);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
    }
  });

  it('the numbers of the textbook challenge / situation / test / exercises are not reused', () => {
    const text = PROBLEMS.map((p) => JSON.stringify(p)).join(' ');
    for (const forbidden of ['11{,}6', '7{,}25', '91{,}125', '10{,}5', '"146"']) expect(text, forbidden).not.toContain(forbidden);
  });

  it('every figure is valid, readable (figureQuality) and says the truth', () => {
    for (const p of PROBLEMS.filter((q) => q.figure)) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    // وضعية 1 (renumérotée le 2026-11-10 : le bâton 1,5 m et son ombre 2 m sont ceux du défi 🏆) : OB = 1,8, OA = 11,7, BE = 1,2, AM = 7,8 ;
    // O, E, M alignés ; (BE) // (AM).
    const a = PROBLEM['wadiya-1'].figure.points;
    expect([dist(a.O, a.B), dist(a.O, a.A), dist(a.B, a.E), dist(a.A, a.M)].map((x) => Number(x.toFixed(6)))).toEqual([1.8, 11.7, 1.2, 7.8]);
    expect(collinear(a, 'O', 'E', 'M') && parallel(a, ['B', 'E'], ['A', 'M'])).toBe(true);
    // وضعية 2 : AB = 10, AC = 6,5, BC = 10,5 (×10 cm) ; AM = 6, AN = 4 ; (MN) non parallèle à (BC).
    const b = PROBLEM['wadiya-2'].figure.points;
    expect([dist(b.A, b.B), dist(b.A, b.C), dist(b.B, b.C)].map((x) => Number(x.toFixed(3)))).toEqual([10, 6.5, 10.5]);
    expect(Math.abs(dist(b.A, b.M) - 6) < 2e-3 && Math.abs(dist(b.A, b.N) - 4) < 2e-3).toBe(true);
    expect(onSegmentAt(b, 'A', 'B', 'M', 0.6) && onSegmentAt(b, 'A', 'C', 'N', 4 / 6.5)).toBe(true);
    expect(parallel(b, ['M', 'N'], ['B', 'C'])).toBe(false);
    // وضعية 3 : AB = 11 ; G_k équidistants ; les parallèles à (G5B) donnent P_k à k/5 de A.
    const c = PROBLEM['wadiya-3'].figure.points;
    expect(dist(c.A, c.B)).toBe(11);
    ['G1', 'G2', 'G3', 'G4', 'G5'].forEach((g, k) => expect(onSegmentAt(c, 'A', 'G5', g, (k + 1) / 5)).toBe(true));
    [['G1', 'P1', 0.2], ['G2', 'P2', 0.4], ['G3', 'M', 0.6], ['G4', 'P4', 0.8]].forEach(([g, p, t]) => {
      expect(onSegmentAt(c, 'A', 'B', p, t), p).toBe(true);
      expect(parallel(c, [g, p], ['G5', 'B']), g).toBe(true);
    });
    // وضعية 4 : SK = 12, SO = 20 ; C sur [OK] ; T sur [SO].
    const d = PROBLEM['wadiya-4'].figure.points;
    expect([dist(d.S, d.K), dist(d.S, d.O)]).toEqual([12, 20]);
    expect(onSegmentAt(d, 'K', 'O', 'C', d.C[0] / 20)).toBe(true);
    expect(d.T[1]).toBe(0);
    expect(dist(d.T, d.C)).toBeCloseTo(12 * (20 - d.T[0]) / 20, 3);
    // وضعية 5 : OA = 3, OC = 1,2, OB = 3,5, OD = 1,4, CD = 1,8 (×10 m) ; O entre A, C et B, D ; (AB) // (CD).
    const e = PROBLEM['wadiya-5'].figure.points;
    const near = (x, y) => Math.abs(x - y) < 2e-3;
    expect(near(dist(e.O, e.A), 3) && near(dist(e.O, e.C), 1.2) && near(dist(e.O, e.B), 3.5) && near(dist(e.O, e.D), 1.4) && near(dist(e.C, e.D), 1.8)).toBe(true);
    expect(onSegmentAt(e, 'A', 'C', 'O', 3 / 4.2) && onSegmentAt(e, 'B', 'D', 'O', 3.5 / 4.9)).toBe(true);
    expect(parallel(e, ['A', 'B'], ['C', 'D'])).toBe(true);
    expect(near(dist(e.A, e.B), 4.5)).toBe(true);
  });

  it('وضعية 1 — the numbers are computed, not typed', () => {
    // le bâton BE = 1,2 m planté à OB = 1,8 m de O, l'ombre du mât OA = 11,7 m (stickAt = OA − OB)
    const AM = TH.heightFromShadow({ stick: '1,2', stickAt: '9,9', tip: '11,7' });
    expect(same(AM, '7,8')).toBe(true);
    const ratio = LIN.div(F('11,7'), F('1,8'));
    expect(answers('wadiya-1', 0)).toEqual([LIN.toNumber(ratio), LIN.toNumber(AM)]);
    expect(same(ratio, '6,5')).toBe(true);
    const price = LIN.mul(AM, F(1000));
    const s = fourth('1,2', '1,8', '1,7'); // 1,7 / s = 1,2 / 1,8 ⇒ s = 1,7 × 1,8 ÷ 1,2
    expect(answers('wadiya-1', 1)).toEqual([LIN.toNumber(price), LIN.toNumber(s)]);
    expect(LIN.toNumber(s)).toBe(2.55);
  });

  it('وضعية 2 — the cross products differ (60×65 ≠ 100×40) then AN, MN and the price', () => {
    expect(answers('wadiya-2', 0)).toEqual([60 * 65, 100 * 40]);
    expect(TH.crossEqual(60, 100, 40, 65)).toBe(false);
    expect(TH.thalesRatios({ AM: 60, AB: 100, AN: 40, AC: 65 }).equal).toBe(false);
    const AN = fourth(100, 65, 60);
    expect(same(AN, 39)).toBe(true);
    expect(TH.thalesRatios({ AM: 60, AB: 100, AN: 39, AC: 65 }).equal).toBe(true);
    const MN = fourth(100, 105, 60);
    expect(same(MN, 63)).toBe(true);
    const price = LIN.mul(LIN.div(MN, F(100)), F(800));
    expect(answers('wadiya-2', 1)).toEqual([39, 63, LIN.toNumber(price)]);
    expect(LIN.toNumber(price)).toBe(504);
    // le triangle est constructible : 100 + 65 > 105
    expect(100 + 65).toBeGreaterThan(105);
  });

  it('وضعية 3 — 11 m in five equal parts, M the third division', () => {
    const part = LIN.div(F(11), F(5));
    expect(same(part, '2,2')).toBe(true);
    expect(TH.divisionFractions(5).map((f) => LIN.fracText(f))).toEqual(['1/5', '2/5', '3/5', '4/5']);
    expect(answers('wadiya-3', 0)).toEqual([LIN.toNumber(part)]);
    const AM = LIN.mul(TH.divisionFractions(5)[2], F(11));
    expect(same(AM, '6,6')).toBe(true);
    const MB = LIN.sub(F(11), AM);
    expect(answers('wadiya-3', 1)).toEqual([LIN.toNumber(AM), LIN.toNumber(MB)]);
    expect(same(MB, LIN.mul(part, F(2)))).toBe(true);
    expect(correctOf('wadiya-3', 1, 0)).toContain('\\dfrac{3}{5}');
  });

  it('وضعية 4 — cylinder in the cone (H = 20, R = 12): h = 5 for r = 9, V = 405π ≈ 1272, r = 13 refused', () => {
    const cone = TH.cylinderInCone({ H: 20, R: 12 });
    const h = cone.heightFor(9);
    expect(same(h, 5)).toBe(true);
    expect(same(cone.radiusFor(5), 9)).toBe(true);
    expect(answers('wadiya-4', 0)).toEqual([15, 5]);
    expect(same(LIN.sub(F(20), h), 15)).toBe(true);
    const vOverPi = cone.volumeOverPi(9, h);
    expect(same(vOverPi, 405)).toBe(true);
    expect(answers('wadiya-4', 1)).toEqual([81, 405, Math.round(LIN.toNumber(vOverPi) * Math.PI)]);
    expect((405 * Math.PI).toFixed(1)).toBe('1272.3');
    // r = 13 > R = 12 : la hauteur serait négative.
    expect(LIN.cmp(cone.heightFor(13), F(0))).toBe(-1);
    expect(correctOf('wadiya-4', 2, 1)).toContain('13 > 12');
  });

  it('وضعية 5 — converse (0,4 = 0,4, O between) then AB = 45 and the rope 95', () => {
    expect(TH.thalesRatios({ AM: 12, AB: 30, AN: 14, AC: 35 }).equal).toBe(true);
    const conv = TH.converse({ b: -30, bp: 12, c: -35, cp: 14 });
    expect(conv.parallel).toBe(true);
    expect(answers('wadiya-5', 0)).toEqual([0.4, 0.4]);
    const AB = fourth(12, 30, 18);
    expect(same(AB, 45)).toBe(true);
    expect(TH.thalesRatios({ AM: 14, AB: 35, MN: 18, BC: 45 }).equal).toBe(true);
    expect(answers('wadiya-5', 1)).toEqual([45, 2 * 45 + 5]);
  });

  it('وضعية 6 — k = 2/3, AN = 4, MN = 5 (a 3-4-5 triangle), perimeters 18 and 12, fringe 1800', () => {
    const s = TH.scale('4,5', 3);
    expect(s.kind).toBe('reduction');
    expect(LIN.fracText(s.k)).toBe('2/3');
    expect(correctOf('wadiya-6', 0, 1)).toContain('\\dfrac{2}{3}');
    const [AN, MN] = TH.imageLengths(s.k, [6, '7,5']);
    expect(same(AN, 4) && same(MN, 5)).toBe(true);
    expect(answers('wadiya-6', 0)).toEqual([LIN.toNumber(AN), LIN.toNumber(MN)]);
    const P = LIN.add(LIN.add(F('4,5'), F(6)), F('7,5'));
    const p = LIN.mul(s.k, P);
    expect(answers('wadiya-6', 1)).toEqual([LIN.toNumber(P), LIN.toNumber(p), LIN.toNumber(LIN.mul(p, F(150)))]);
    expect(same(p, LIN.add(LIN.add(F(3), F(4)), F(5)))).toBe(true);
    // la table dit les mêmes nombres que l'énoncé
    const rows = PROBLEM['wadiya-6'].table.rows.map((r) => r.join(' '));
    expect(rows).toEqual(['AB 4,5 m AM = 3 m', 'AC 6 m AN = ؟', 'BC 7,5 m MN = ؟']);
  });

  it('every equality written in statements, prompts, explains, lines and correct options is true', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of assertedTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(40);
  });

  it('the checker fails on a wrong number (mutation)', () => {
    expect(() => checkText('$\\dfrac{12 \\times 4}{10} = 4{,}9$')).toThrow();
    expect(() => checkText('$\\dfrac{4{,}5}{10} \\neq \\dfrac{4{,}5}{10}$')).toThrow();
    expect(() => checkText('$18 < 16$')).toThrow();
  });
});
