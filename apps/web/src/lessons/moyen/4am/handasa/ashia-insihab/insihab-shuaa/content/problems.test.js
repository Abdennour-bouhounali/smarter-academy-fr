import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les « مسائل » du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين » : contrat GuidedProblem, place des modules, une réponse
 * par demande, et SURTOUT chaque nombre et chaque égalité recalculés — les déplacements et les égalités de vecteurs
 * sur les points DESSINÉS (vectors.js), les égalités numériques écrites dans les explications, options et rédactions
 * évaluées une à une.
 */
const pt = (fig, n) => V.point(...fig.points[n]);
const vv = (fig, a, b) => V.vec(pt(fig, a), pt(fig, b));
const num = (f) => f.n / f.d;
const comps = (fig, a, b) => { const u = vv(fig, a, b); return [num(u.x), num(u.y)]; };
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const stepsOf = (id, part, kind) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === kind);
const correctOption = (s) => s.options[s.correct];
const F1 = LESSON_CONFIG.lessonProblem.figure;

/** Tous les textes « vrais » d'une مسألة : énoncé, questions, prompts, explications, options CORRECTES, rédactions. */
function trueTexts(p) {
  const out = [p.statement];
  for (const part of p.parts) {
    out.push(part.question);
    for (const s of part.steps) {
      if (s.prompt) out.push(s.prompt);
      if (s.explain) out.push(s.explain);
      if (s.kind === 'choice') out.push(correctOption(s));
      if (s.lines) out.push(...s.lines);
    }
  }
  return out;
}
const islands = (t) => [...String(t).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

/** Une île purement numérique (« 4^2 + 3^2 = 25 », « 540 < 600 ») : chaque membre évalué. */
function evalNumericIsland(src) {
  const s = src.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\^/g, '**');
  if (!/^[\d\s+\-*/().<=]+$/.test(s) || !/[=<]/.test(s)) return null;
  if (s.includes('<')) { const [a, b] = s.split('<'); return Function(`return (${a}) < (${b})`)(); }
  const sides = s.split('=').map((x) => Function(`return (${x})`)());
  return sides.every((v) => Math.abs(v - sides[0]) < 1e-9);
}

/** Une île vectorielle (« \overrightarrow{AE} = \overrightarrow{BF} = … », « … \neq … ») jugée sur les points de la figure. */
function evalVectorIsland(fig, src) {
  if (!src.includes('\\overrightarrow')) return null;
  const rel = src.includes('\\neq') ? 'neq' : src.includes('=') ? 'eq' : null;
  if (!rel) return null;
  const names = [...src.matchAll(/\\overrightarrow\{([A-Z])([A-Z])\}/g)].map((m) => [m[1], m[2]]);
  if (names.length < 2 || names.flat().some((n) => !fig.points[n])) return null;
  const vs = names.map(([a, b]) => vv(fig, a, b));
  return rel === 'eq' ? vs.every((u) => V.vecEq(u, vs[0])) : !V.vecEq(vs[0], vs[1]);
}

describe('les مسائل du درس « مفهوم الانسحاب والشعاع وتساوي شعاعين »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([]);
  });

  it('show a valid, readable figure (validateGeoFigure, figureQuality)', () => {
    for (const p of PROBLEMS) {
      expect(p.figure, p.id).toBeTruthy();
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
    }
    expect(PROBLEM['masala-1'].figure).toBe(LESSON_CONFIG.lessonProblem.figure); // une seule source (la carte la dessine)
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual([
      [5, '05', 'masala-1', 'practice_lab'], [6, '06', 'masala-2', 'practice_lab'], [7, '07', 'masala-3', 'practice_lab'],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.resources.filter((r) => r.kind === 'situation').map((r) => [r.code, r.module])).toEqual([
      ['masala-1', 5], ['masala-2', 6], ['masala-3', 7],
    ]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every numeric equality written in the problems is true', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) for (const isl of islands(t)) {
      const ok = evalNumericIsland(isl);
      if (ok === null) continue;
      checked += 1;
      expect(ok, `${p.id}: $${isl}$`).toBe(true);
    }
    expect(checked).toBeGreaterThanOrEqual(25);
  });

  it('every vector equality written in the problems holds on the drawn points', () => {
    let checked = 0;
    for (const p of PROBLEMS) for (const t of trueTexts(p)) for (const isl of islands(t)) {
      const ok = evalVectorIsland(p.figure, isl);
      if (ok === null) continue;
      checked += 1;
      expect(ok, `${p.id}: $${isl}$`).toBe(true);
    }
    expect(checked).toBeGreaterThanOrEqual(15);
  });

  it('مسألة 1 — the drone show: images, the stray drone, distance and time are computed', () => {
    const u = comps(F1, 'A', 'E');
    expect(expectedOf('masala-1', 0)).toEqual(u); // 4 نحو اليمين، 3 نحو الأعلى
    const img = (n) => V.translate(pt(F1, n), vv(F1, 'A', 'E'));
    // the correct images are the drawn points; the distractors are not
    expect(V.vecEq(img('B'), pt(F1, 'F'))).toBe(true);
    expect(V.vecEq(img('C'), pt(F1, 'G'))).toBe(true);
    expect(V.vecEq(img('D'), pt(F1, 'M'))).toBe(true);
    for (const n of ['K', 'E']) expect(V.vecEq(img('B'), pt(F1, n))).toBe(false);
    for (const n of ['F', 'E']) expect(V.vecEq(img('C'), pt(F1, n))).toBe(false);
    for (const n of ['L', 'K']) expect(V.vecEq(img('D'), pt(F1, n))).toBe(false);
    const [b, c] = stepsOf('masala-1', 0, 'choice').filter((s) => s.role === 'conclude');
    expect([correctOption(b), correctOption(c)]).toEqual(['النقطة $F$', 'النقطة $G$']);
    expect(correctOption(stepsOf('masala-1', 1, 'choice').find((s) => s.ask === 1))).toBe('النقطة $M$');
    // the stray drone: same length, other direction (منحى)
    const dl = comps(F1, 'D', 'L');
    expect(expectedOf('masala-1', 1)).toEqual(dl);
    const rel = V.relation(vv(F1, 'D', 'L'), vv(F1, 'A', 'E'));
    expect([rel.direction, rel.length, rel.equal]).toEqual([false, true, false]);
    // distance and time
    const side = Math.sqrt(num(V.normSquared(vv(F1, 'A', 'E'))));
    expect(side).toBe(5);
    const metres = side * 10;
    expect(expectedOf('masala-1', 2)).toEqual([side, metres, metres / 2]);
    for (const [a, b2] of [['B', 'F'], ['C', 'G'], ['D', 'M']]) expect(V.vecEq(vv(F1, a, b2), vv(F1, 'A', 'E'))).toBe(true);
  });

  it('مسألة 2 — the sliding gate: images, the parallelogram AEDC, the rail are computed', () => {
    const G = PROBLEM['masala-2'].figure;
    const u = vv(G, 'B', 'A');
    expect(expectedOf('masala-2', 0)).toEqual([-num(u.x)]); // 4 نحو اليسار
    expect(num(u.y)).toBe(0);
    expect(V.vecEq(V.translate(pt(G, 'A'), u), pt(G, 'E'))).toBe(true);
    expect(V.vecEq(V.translate(pt(G, 'C'), u), pt(G, 'D'))).toBe(true);
    for (const n of ['B', 'F']) expect(V.vecEq(V.translate(pt(G, 'A'), u), pt(G, n))).toBe(false);
    for (const n of ['F', 'B']) expect(V.vecEq(V.translate(pt(G, 'C'), u), pt(G, n))).toBe(false);
    // AEDC: no three aligned, AE = CD, hence a parallelogram, and AC = ED (not DE, not EF)
    const quad = ['A', 'E', 'D', 'C'];
    for (let i = 0; i < 4; i += 1) {
      const [p, q, r] = [quad[i], quad[(i + 1) % 4], quad[(i + 2) % 4]];
      expect(V.collinear(pt(G, p), pt(G, q), pt(G, r)), `${p}${q}${r}`).toBe(false);
    }
    expect(V.vecEq(vv(G, 'A', 'E'), vv(G, 'C', 'D'))).toBe(true);
    expect(V.vecEq(vv(G, 'A', 'E'), vv(G, 'D', 'C'))).toBe(false); // the wrong letter order
    expect(V.isParallelogram(...quad.map((n) => pt(G, n)))).toBeTruthy();
    expect(V.vecEq(vv(G, 'A', 'C'), vv(G, 'E', 'D'))).toBe(true);
    for (const [a, b] of [['D', 'E'], ['E', 'F']]) expect(V.vecEq(vv(G, 'A', 'C'), vv(G, a, b))).toBe(false);
    // rail: from E (open) to B (closed), 1 carreau = 1 m
    const rail = num(V.normSquared(vv(G, 'E', 'B'))) ** 0.5;
    expect(rail).toBe(num(V.normSquared(vv(G, 'E', 'A'))) ** 0.5 + num(V.normSquared(vv(G, 'A', 'B'))) ** 0.5);
    expect(expectedOf('masala-2', 2)).toEqual([rail, rail * 3200]);
  });

  it('مسألة 3 — the survey drone: the faulty point, the common midpoint, the battery are computed', () => {
    const S = PROBLEM['masala-3'].figure;
    const u = vv(S, 'P', 'Q');
    expect(expectedOf('masala-3', 0)).toEqual([num(u.x), num(u.y)]);
    expect(V.vecEq(vv(S, 'Q', 'R'), u)).toBe(true); // R image de Q
    const rs = V.relation(vv(S, 'R', 'S'), u);
    expect([rs.direction, rs.sense, rs.length, rs.equal]).toEqual([true, true, false, false]); // S : demi-pas
    expect(V.vecEq(V.translate(pt(S, 'R'), u), pt(S, 'T'))).toBe(true); // T image de R
    // aligned: no quadrilateral, yet [PT] and [QR] share their midpoint; R and Q are not that midpoint
    for (const n of ['R', 'S', 'T']) expect(V.collinear(pt(S, 'P'), pt(S, 'Q'), pt(S, n))).toBe(true);
    const mid = V.midpoint(pt(S, 'P'), pt(S, 'T'));
    expect(V.vecEq(mid, V.midpoint(pt(S, 'Q'), pt(S, 'R')))).toBe(true);
    expect(V.vecEq(mid, V.midpoint(pt(S, 'P'), pt(S, 'R')))).toBe(false);
    for (const n of ['R', 'Q']) expect(V.vecEq(mid, pt(S, n))).toBe(false);
    expect([num(mid.x), num(mid.y)]).toEqual([6, 3]); // « 6 مربعات نحو اليمين و 3 نحو الأعلى »
    // the battery: PQ = 90 m, three equal legs, back to P
    const legs = num(V.normSquared(vv(S, 'P', 'T'))) / num(V.normSquared(u));
    expect(legs).toBe(9); // PT = 3 PQ
    const pt3 = 3 * 90;
    expect(expectedOf('masala-3', 2)).toEqual([pt3, 2 * pt3]);
    expect(2 * pt3).toBeLessThan(600);
    expect(600 - 2 * pt3).toBe(60);
  });
});
