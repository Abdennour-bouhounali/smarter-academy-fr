import { describe, it, expect } from 'vitest';
import * as R from '@smarter-academy/core/arithmetic/rotation.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « الزاوية المحيطية والزاوية المركزية » : contrat, câblage, et SURTOUT les nombres — chaque `expected`
 * est recalculé à partir des données de l'énoncé, chaque angle affirmé est MESURÉ sur la figure dessinée (rotation.js),
 * et chaque égalité numérique écrite dans un explain / une ligne / une option est évaluée exactement.
 */

// ── Arithmétique exacte : rationnels [num, den] ──────────────────────────────────────────
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.abs(n), d) || 1; return [n / g, d / g]; };
const qAdd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qSub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qMul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qDiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const qEq = (x, y) => x[0] * y[1] === y[0] * x[1];
const dec = (v) => { const [i, f = ''] = String(v).split('.'); return Q(Number(i + f), 10 ** f.length); };

/** Une expression numérique LaTeX (+ − × \dfrac, degrés, « 78{,}5 ») → rationnel, ou null si elle contient un nom (angle, point). */
function evalExpr(src) {
  const s = src
    .replace(/\^\\circ/g, '').replace(/\\circ/g, '')
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, '.').replace(/\\times/g, '*').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const num = () => {
    if (s[i] === '(') { i++; const v = add(); i++; return v; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (j === i) throw new Error(`bad number in ${src}`);
    return dec(s.slice(j, i));
  };
  const prod = () => { let v = num(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = num(); v = op === '*' ? qMul(v, w) : qDiv(v, w); } return v; };
  const add = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? qAdd(v, w) : qSub(v, w); } return v; };
  const v = add();
  return i === s.length ? v : null;
}
/** Chaque formule $…$ : ses membres numériques autour de « = » sont égaux ; « < » / « > » est vrai. */
function checkText(text) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    for (const op of ['<', '>']) {
      const parts = f.split(op);
      if (parts.length !== 2) continue;
      const [x, y] = parts.map(evalExpr);
      if (x && y) { const lt = x[0] * y[1] < y[0] * x[1]; expect(op === '<' ? lt : !lt && !qEq(x, y), f).toBe(true); checked++; }
    }
    if (f.includes('<') || f.includes('>')) continue;
    const sides = f.split('=').map(evalExpr).filter(Boolean);
    if (sides.length < 2) continue;
    for (const v of sides.slice(1)) expect(qEq(v, sides[0]), f).toBe(true);
    checked++;
  }
  return checked;
}
const stepTexts = (s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])];
const allTexts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap(stepTexts)])].filter(Boolean);
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const correctOf = (id, part, k) => { const s = PROBLEM[id].parts[part].steps.filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };

// ── La géométrie mesurée sur les figures (rotation.js) ─────────────────────────────────
const pt = (fig, n) => ({ x: fig.points[n][0], y: fig.points[n][1] });
const round = (v) => Math.round(v * 100) / 100;
const at = (fig, a, v, b) => round(R.angleAt(pt(fig, a), pt(fig, v), pt(fig, b)));
const inscribed = (fig, M) => {
  const r = R.arcAngles(pt(fig, 'O'), pt(fig, 'A'), pt(fig, 'B'), pt(fig, M), { tol: 1e-3 });
  expect(r.sameCircle, M).toBe(true);
  return { inscribed: round(r.inscribed), central: round(r.central) };
};
const onCircle = (fig, n) => R.circlePosition(pt(fig, 'O'), fig.circles[0].radius, pt(fig, n), { tol: 1e-3 });
/** Le nombre de degrés écrit dans une donnée de l'énoncé (« $\widehat{AOB} = 76^\circ$ »). */
const degreesIn = (text, name) => Number(new RegExp(`\\\\widehat\\{${name}\\} = (\\d+)\\^\\\\circ`).exec(text)[1]);

describe('les مسائل du درس « الزاوية المحيطية والزاوية المركزية »', () => {
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

  it('every demand has its own answer, and asks cover every demand of the question (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBe(demandsOf(part.question));
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

  it('every statement shows its figure: valid GeoFigure, figureQuality = []', () => {
    for (const p of PROBLEMS) {
      expect(p.statement, p.id).toMatch(/الشكل/);
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
  });

  it('every numeric equality / inequality written in the problems is true', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const t of allTexts(p)) n += checkText(t);
    expect(n).toBeGreaterThan(30);
  });

  it('مسألة 1 — the figure says what the statement says, and the numbers are computed', () => {
    const p = PROBLEM['masala-1']; const F = p.figure;
    const aob = degreesIn(p.statement, 'AOB'); // 76
    const target = Number(/قيسها \$(\d+)\^\\circ\$ على الأقل/.exec(p.statement)[1]); // 42
    expect(target).toBe(42);
    expect(at(F, 'A', 'O', 'B')).toBe(aob);
    for (const n of ['A', 'B', 'S', 'Y']) expect(onCircle(F, n), n).toBe('on');
    // S et Y sur le grand arc : chacun intercepte le PETIT arc AB, avec AOB.
    expect(R.sameArc(pt(F, 'A'), pt(F, 'B'), pt(F, 'S'), pt(F, 'Y'))).toBe(true);
    expect(inscribed(F, 'S')).toEqual({ inscribed: aob / 2, central: aob });
    expect(inscribed(F, 'Y')).toEqual({ inscribed: aob / 2, central: aob });
    // [AY] diamètre : O milieu de [AY], ABY droit.
    expect(round(F.points.A[0] + F.points.Y[0])).toBe(0);
    expect(round(F.points.A[1] + F.points.Y[1])).toBe(0);
    expect(at(F, 'A', 'B', 'Y')).toBe(90);

    expect(expectedOf('masala-1', 0)).toEqual([aob / 2]);
    expect(expectedOf('masala-1', 1)).toEqual([aob / 2, 180 / 2]);
    expect(expectedOf('masala-1', 2)).toEqual([2 * target]);
    expect(aob / 2 < target).toBe(true);           // (𝒞) ne convient pas aux débutants
    expect(correctOf('masala-1', 2, 0)).toContain(`$${aob / 2}^\\circ < ${target}^\\circ$`);
    // Le piège : doubler au lieu de diviser (152), diviser au lieu de doubler (20) — annoncés dans les explains.
    expect(p.parts[0].steps.find((s) => s.ask === 1).explain).toContain(`${2 * aob}^\\circ`);
    expect(p.parts[2].steps.find((s) => s.ask === 1).explain).toContain(`${target / 2}^\\circ`);
  });

  it('مسألة 2 — the figure says what the statement says, and the numbers are computed', () => {
    const p = PROBLEM['masala-2']; const F = p.figure;
    const amb = degreesIn(p.statement, 'AMB'); // 32
    const beam = 25; const lampPrice = 14500;
    expect(p.statement).toContain(`$${beam}^\\circ$`);
    expect(p.statement).toContain(`${lampPrice} دج`);
    for (const n of ['A', 'B', 'M', 'L']) expect(onCircle(F, n), n).toBe('on');
    expect(inscribed(F, 'M')).toEqual({ inscribed: amb, central: 2 * amb });
    expect(inscribed(F, 'L')).toEqual({ inscribed: amb, central: 2 * amb });
    expect(at(F, 'A', 'O', 'B')).toBe(2 * amb);
    // Le photographe : P intérieur, son angle n'est pas l'inscrit — il est plus grand (« على الشكل هي أكبر »).
    expect(onCircle(F, 'P')).toBe('inside');
    expect(at(F, 'A', 'P', 'B')).toBeGreaterThan(amb);

    const aob = 2 * amb;
    expect(expectedOf('masala-2', 0)).toEqual([aob]);
    expect(expectedOf('masala-2', 1)).toEqual([amb]);
    const lamps = Math.ceil(aob / beam);
    expect((lamps - 1) * beam < aob && lamps * beam >= aob).toBe(true);
    expect(Math.ceil(amb / beam)).not.toBe(lamps); // le piège : l'angle des spectateurs donne 2 lampes
    expect(expectedOf('masala-2', 2)).toEqual([2 * beam, lamps, lamps * lampPrice]);
  });

  it('مسألة 3 — the figure says what the statement says, and the numbers are computed', () => {
    const p = PROBLEM['masala-3']; const F = p.figure;
    const acb = degreesIn(p.statement, 'ACB'); // 36
    const r = 10; const pi = dec('3.14'); const price = 400;
    expect(p.statement).toContain(`نصف قطره ${r} أمتار`);
    expect(p.statement).toContain(`بثمن ${price} دج`);
    for (const n of ['A', 'B', 'C', 'D']) expect(onCircle(F, n), n).toBe('on');
    expect(R.sameArc(pt(F, 'A'), pt(F, 'B'), pt(F, 'C'), pt(F, 'D'))).toBe(true);
    expect(inscribed(F, 'C')).toEqual({ inscribed: acb, central: 2 * acb });
    expect(inscribed(F, 'D')).toEqual({ inscribed: acb, central: 2 * acb });
    expect(round(F.points.B[0] + F.points.D[0])).toBe(0); // [BD] diamètre
    expect(round(F.points.B[1] + F.points.D[1])).toBe(0);
    expect(at(F, 'B', 'A', 'D')).toBe(90);
    expect(at(F, 'A', 'B', 'D')).toBe(180 - 90 - acb);

    const aob = 2 * acb;
    expect(expectedOf('masala-3', 0)).toEqual([aob, acb]);
    expect(expectedOf('masala-3', 1)).toEqual([180 - 180 / 2 - acb]);
    expect(at(F, 'A', 'B', 'D')).not.toBe(acb); // ABD n'intercepte pas l'arc AB : le distracteur « التقايس » est faux
    const disc = qMul(pi, Q(r * r));
    const bed = qMul(disc, Q(aob, 360));
    const cost = qMul(bed, Q(price));
    expect(qEq(Q(aob, 360), Q(1, 5))).toBe(true);
    expect(expectedOf('masala-3', 2).map((v) => dec(v))).toEqual([disc, bed, cost]);
    expect(qEq(qMul(disc, Q(acb, 360)), dec('31.4'))).toBe(true); // le piège annoncé : le dixième
  });
});
