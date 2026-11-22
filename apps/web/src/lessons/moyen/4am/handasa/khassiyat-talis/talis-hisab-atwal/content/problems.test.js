import { describe, it, expect } from 'vitest';
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { figureQuality, validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (fractions de linear.js) : 4,5 reste 9/2, rien n'arrondit. ──────────────
const F = (v) => (typeof v === 'object' ? v : LIN.parseNumber(String(v)));
const num = (p) => LIN.toNumber(p);
const same = (p, v) => LIN.eq(F(p), F(v));
/** a/b = c/x ⇒ x : le جداء متصالب de la leçon (thales.js). */
const fourth = TH.fourthProportional;

const steps = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => steps(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = steps(id, part).filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── Vérificateur des ÉGALITÉS écrites (explain, lines, bonnes options, énoncés) ───────────────────
// Évalue + − × \dfrac, puissances entières, parenthèses, décimaux « 4{,}5 », exactement ; un membre
// avec une lettre (AC', k…) est ignoré, les membres numériques d'une même chaîne « = » doivent être égaux.
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
/** Les droites (PQ) et (RS) sont parallèles sur la figure (coordonnées arrondies au millième). */
const parallel = (pts, [p, q], [r, s]) => Math.abs(cross(pts[p], pts[q], pts[r], pts[s])) / (dist(pts[p], pts[q]) * dist(pts[r], pts[s])) < 1e-3;
/** R est sur [PQ] à la fraction t de P. */
const onSegmentAt = (pts, p, q, r, t) => dist(pts[r], [pts[p][0] + t * (pts[q][0] - pts[p][0]), pts[p][1] + t * (pts[q][1] - pts[p][1])]) < 2e-3;

describe('les مسائل du درس « خاصية طالس وحساب الأطوال »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBe(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the decoys: at least one useless datum, one of them a number', () => {
    for (const p of PROBLEMS) {
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.length).toBeGreaterThanOrEqual(1);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
    }
  });

  it('every figure is valid, readable (figureQuality) and says the truth', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    // مسألة 1 : AB = 10, AC = 12, BC = 6 ; B′ = 0,4·B, C′ = 0,4·C (AB′ = 4) ; D = 1,5·B, E = 1,5·C (AD = 15).
    const a = PROBLEM['masala-1'].figure.points;
    expect(dist(a.A, a.B)).toBeCloseTo(10, 2);
    expect(dist(a.A, a.C)).toBeCloseTo(12, 2);
    expect(dist(a.B, a.C)).toBeCloseTo(6, 2);
    expect(onSegmentAt(a, 'A', 'B', "B'", 0.4) && onSegmentAt(a, 'A', 'C', "C'", 0.4)).toBe(true);
    expect(onSegmentAt(a, 'A', 'B', 'D', 1.5) && onSegmentAt(a, 'A', 'C', 'E', 1.5)).toBe(true);
    expect(parallel(a, ["B'", "C'"], ['B', 'C']) && parallel(a, ['D', 'E'], ['B', 'C'])).toBe(true);
    // مسألة 2 : SP = 3, PH = 9, PL = 4, HT = 16 ; S, L, T alignés ; les deux verticales.
    const b = PROBLEM['masala-2'].figure.points;
    expect([dist(b.S, b.P), dist(b.P, b.H), dist(b.P, b.L), dist(b.H, b.T)]).toEqual([3, 9, 4, 16]);
    expect(onSegmentAt(b, 'S', 'T', 'L', 0.25)).toBe(true);
    expect(parallel(b, ['P', 'L'], ['H', 'T'])).toBe(true);
    // مسألة 3 : AB = AC = 5, BC = 6 ; M, N à 1,5/5 = 0,3 ; P, Q à 3/5 = 0,6.
    const c = PROBLEM['masala-3'].figure.points;
    expect([dist(c.A, c.B), dist(c.A, c.C), dist(c.B, c.C)]).toEqual([5, 5, 6]);
    expect(['M', 'P'].every((n, i) => onSegmentAt(c, 'A', 'B', n, [0.3, 0.6][i]))).toBe(true);
    expect(['N', 'Q'].every((n, i) => onSegmentAt(c, 'A', 'C', n, [0.3, 0.6][i]))).toBe(true);
    expect(parallel(c, ['M', 'N'], ['B', 'C']) && parallel(c, ['P', 'Q'], ['B', 'C'])).toBe(true);
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const AB = 10; const AC = 12; const BC = 6; const ABp = 4;
    // 1) AC′ et B′C′ : AB′/AB = AC′/AC = B′C′/BC.
    const ACp = fourth(AB, AC, ABp); const BpCp = fourth(AB, BC, ABp);
    expect(expectedOf('masala-1', 0).map(F).every((v, i) => same(v, [ACp, BpCp][i]))).toBe(true);
    expect(TH.thalesRatios({ AM: ABp, AB, AN: ACp, AC, MN: BpCp, BC }).equal).toBe(true);
    // 2) AB′ = 4,5 et AC′ = 5,6 : rapports INÉGAUX (produits en croix 54 ≠ 56) ⇒ non parallèles ; puis B′C′ = 3.
    expect(expectedOf('masala-1', 1).slice(0, 2)).toEqual([num(LIN.mul(F('4,5'), F(AC))), num(LIN.mul(F(AB), F('5,6')))]);
    expect(TH.crossEqual('4,5', AB, '5,6', AC)).toBe(false);
    expect(TH.thalesRatios({ AM: '4,5', AB, AN: '5,6', AC }).equal).toBe(false);
    const ABfill = fourth(BC, AB, 3);
    expect(same(F(expectedOf('masala-1', 1)[2]), ABfill)).toBe(true);
    expect(LIN.cmp(ABfill, F(AB))).toBe(-1); // la toile reste entre A et l'écran
    // 3) AD = 15 : k = 3/2 (agrandissement), DE = 9 > 8.
    const s = TH.scale(AB, 15);
    expect(s.kind).toBe('enlargement');
    expect(correctOf('masala-1', 2, 0)).toContain(`\\dfrac{${s.k.n}}{${s.k.d}}`);
    const DE = LIN.mul(s.k, F(BC));
    expect(same(F(expectedOf('masala-1', 2)[0]), DE)).toBe(true);
    expect(LIN.cmp(DE, F(8))).toBe(1);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    const SP = 3; const PH = 9; const PL = 4;
    const SH = SP + PH;
    const HT = fourth(SP, SH, PL);
    expect(expectedOf('masala-2', 0).map(F).every((v, i) => same(v, [F(SH), HT][i]))).toBe(true);
    const SL = Math.sqrt(SP ** 2 + PL ** 2);
    expect(Number.isInteger(SL)).toBe(true);
    const ST = fourth(SP, SL, SH);
    expect(expectedOf('masala-2', 1).map(F).every((v, i) => same(v, [F(SL), ST][i]))).toBe(true);
    expect(LIN.cmp(F(18), ST)).toBe(-1); // la corde de 18 m ne suffit pas
    expect(LIN.cmp(F(18), HT)).toBe(1); // … alors qu'elle dépasse la hauteur : le piège
    const LT = LIN.sub(ST, F(SL));
    expect(expectedOf('masala-2', 2).map(F).every((v, i) => same(v, [LT, LIN.mul(LT, F(350))][i]))).toBe(true);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    const AB = 5; const BC = 6;
    const MN = fourth(AB, BC, '1,5');
    expect(same(F(expectedOf('masala-3', 0)[0]), MN)).toBe(true);
    const s = TH.scale(BC, '3,6');
    expect(s.kind).toBe('reduction');
    expect(correctOf('masala-3', 1, 0)).toContain(`\\dfrac{${s.k.n}}{${s.k.d}}`);
    const AP = LIN.mul(s.k, F(AB)); const BP = LIN.sub(F(AB), AP);
    expect(expectedOf('masala-3', 1).map(F).every((v, i) => same(v, [AP, BP][i]))).toBe(true);
    const one = [AB, AB, BC, MN, '3,6'].map(F).reduce(LIN.add);
    const four = LIN.mul(one, F(4));
    expect(expectedOf('masala-3', 2).map(F).every((v, i) => same(v, [one, four, LIN.mul(four, F(650))][i]))).toBe(true);
  });

  it('every equality written in statements, prompts, explains, lines and correct options is true', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of assertedTexts(p)) checked += checkText(t);
    expect(checked).toBeGreaterThan(30);
  });

  it('the checker fails on a wrong number (mutation)', () => {
    expect(() => checkText('$\\dfrac{12 \\times 4}{10} = 4{,}9$')).toThrow();
    expect(() => checkText('$\\dfrac{4{,}5}{10} \\neq \\dfrac{5{,}4}{12}$')).toThrow();
    expect(() => checkText('$18 < 16$')).toThrow();
  });
});
