import { describe, it, expect } from 'vitest';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { validateGeoFigure, figureQuality } from '../../../../../../common/components/geoFigure';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les مسائل du درس « قراءة مركبتي شعاع وتمثيلهما في معلم » disent VRAI : chaque composante, chaque point d'arrivée,
 * chaque total est RECALCULÉ ici avec vectors.js (arithmétique exacte) à partir des points DESSINÉS dans les figures
 * et des nombres de l'énoncé ; chaque égalité numérique écrite ($a + b = c$, $a \times b = c$, $a > b$) est réévaluée.
 */
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };

const P = (xy) => V.point(...xy);
const fig = (id) => PROBLEM[id].figure;
const at = (id, n) => P(fig(id).points[n]);
const comps = (A, B) => V.coords(V.vec(A, B));
const end = (A, u) => V.coords(V.translate(A, P(u)));
/** Le nombre de rues (carreaux) d'un trajet horizontal puis vertical : la longueur « en escalier ». */
const steps = (u) => Math.abs(u[0]) + Math.abs(u[1]);
const colTex = ([a, b]) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;
const pairTex = (name, [x, y]) => `$${name}(${x}\\,;\\,${y})$`;

// ── Vérificateur des RELATIONS écrites : chaque formule $…$ est découpée sur = < > ; chaque membre purement numérique
//    (entiers, \times, +, −, parenthèses) est évalué, et chaque relation entre deux membres voisins est vérifiée. ──
function evalExpr(src) {
  const s = src.replace(/\\times/g, '*').replace(/\s+/g, '');
  if (!/^[\d+\-*()]+$/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i++] !== ')') throw new Error(`parenthèses : ${src}`); return v; }
    const j = i; while (/\d/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`nombre attendu : ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*') { i++; v *= atom(); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      expect({ '=': x === y, '<': x < y, '>': x > y }[op], `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
const allTexts = (p) => [
  [p.statement, `${p.id} statement`],
  ...p.parts.flatMap((part) => [
    [part.question, `${p.id} ${part.label} question`],
    ...part.steps.flatMap((s, i) => [
      [s.prompt, `${p.id} ${part.label} step ${i + 1} prompt`],
      [s.explain, `${p.id} ${part.label} step ${i + 1} explain`],
      ...(s.lines ?? []).map((l, k) => [l, `${p.id} ${part.label} line ${k + 1}`]),
    ]),
  ]),
].filter(([t]) => t);

describe('les مسائل du درس « قراءة مركبتي شعاع وتمثيلهما »', () => {
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

  it('every demand has its own answer, and asks cover every ؟ / imperative', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('the data hold a useless NUMBER (the decoy)', () => {
    for (const p of PROBLEMS) expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
  });

  it('every figure is valid and readable (figureQuality = [])', () => {
    for (const p of PROBLEMS) {
      expect(validateGeoFigure(p.figure), p.id).toEqual([]);
      expect(figureQuality(p.figure), p.id).toEqual([]);
      expect(p.figure.grid && p.figure.axes, p.id).toBeTruthy();
      // aucun point de la figure n'est une réponse à placer (les points dessinés sont des données)
      for (const xy of Object.values(p.figure.points)) expect(xy.every(Number.isInteger)).toBe(true);
    }
  });

  it('every equality / inequality written between numbers is true', () => {
    let n = 0;
    for (const p of PROBLEMS) for (const [t, where] of allTexts(p)) n += checkText(t, where);
    expect(n).toBeGreaterThan(25);
  });

  it('a mutated number is caught by the relation checker', () => {
    expect(() => checkText('$7 + 3 = 11$', 'mutation')).toThrow();
    expect(() => checkText('$18 \\times 40 = 702$', 'mutation')).toThrow();
  });

  it('مسألة 1 — the delivery: computed from the drawn R, K and the codes', () => {
    const O = at('masala-1', 'O'); const R = at('masala-1', 'R'); const K = at('masala-1', 'K');
    expect(V.coords(O)).toEqual([0, 0]);
    const RK = comps(R, K);
    expect(RK).toEqual([7, -3]);
    expect(expectedOf('masala-1', 0)).toEqual(RK);
    expect(correctOf('masala-1', 0, 1)).toBe(colTex(RK));
    // les distracteurs sont faux : signe oublié, ordre échangé, coordonnées de K
    expect(choicesOf('masala-1', 0)[1].options.slice(1)).toEqual([colTex([7, 3]), colTex([-3, 7]), colTex(V.coords(K))]);

    const OL = [-2, -4];
    const L = end(O, OL);
    expect(correctOf('masala-1', 1, 1)).toBe(pairTex('L', L));
    const fromK = end(K, OL);
    expect(expectedOf('masala-1', 1)).toEqual(fromK);
    expect(fromK).not.toEqual(L); // le piège : le même code depuis K ne mène pas à L
    expect(correctOf('masala-1', 1, 2)).toContain(`$(${fromK[0]}\\,;\\,${fromK[1]})$`);

    const KN = [-5, 3];
    const N = end(K, KN);
    const fare = 40;
    const units = steps(RK) + steps(KN);
    expect(expectedOf('masala-1', 2)).toEqual([...N, steps(RK), steps(KN), units * fare]);
    expect(correctOf('masala-1', 2, 0)).toBe(pairTex('N', N));
    expect(choicesOf('masala-1', 2)[0].options.slice(1)).toEqual([
      pairTex('N', KN), pairTex('N', end(K, [5, -3])), pairTex('N', end(K, [KN[1], KN[0]])),
    ]);
    // le piège de la traduction : la somme avec les signes donne un autre nombre
    expect(RK[0] + RK[1]).not.toBe(steps(RK));
    expect(PROBLEM['masala-1'].statement).toContain(`${fare} دج`);
  });

  it('مسألة 2 — the robot vacuum: computed from the drawn room, A, B and OE', () => {
    const f = fig('masala-2');
    const A = at('masala-2', 'A'); const B = at('masala-2', 'B');
    const [W, H] = f.points.Q; // la pièce : 9 × 7 carreaux
    expect([W, H]).toEqual([9, 7]);
    expect(PROBLEM['masala-2'].statement).toContain(`${W} بلاطات`);
    expect(PROBLEM['masala-2'].statement).toContain(`${H} بلاطات`);
    const tile = 40; const speed = 20;
    const AB = comps(A, B);
    expect(AB).toEqual([5, 3]);
    expect(expectedOf('masala-2', 0)).toEqual([...AB, AB[0] * tile]);
    expect(correctOf('masala-2', 0, 0)).toBe(colTex(AB));
    expect(choicesOf('masala-2', 0)[0].options.slice(1)).toEqual([colTex([3, 5]), colTex(V.coords(B)), colTex(comps(B, A))]);

    const C = end(B, AB);
    expect(expectedOf('masala-2', 1)).toEqual(C);
    expect(correctOf('masala-2', 1, 1)).toBe(pairTex('C', C));
    expect(choicesOf('masala-2', 1)[1].options.slice(1)).toEqual([
      pairTex('C', AB), pairTex('C', end(B, [AB[1], AB[0]])), pairTex('C', V.coords(A)),
    ]);
    const inside = ([x, y]) => x >= 0 && x <= W && y >= 0 && y <= H;
    expect(inside(V.coords(A)) && inside(V.coords(B))).toBe(true);
    expect(inside(C)).toBe(false); // le cas qui échoue
    expect(C[0] > W && C[1] > H).toBe(true);

    const OE = [8, 1];
    const E = end(V.point(0, 0), OE);
    expect(inside(E)).toBe(true);
    expect(correctOf('masala-2', 2, 0)).toBe(pairTex('E', E));
    expect(choicesOf('masala-2', 2)[0].options[3]).toBe(pairTex('E', end(B, OE)));
    const BE = comps(B, P(E));
    expect(BE).toEqual([2, -4]);
    expect(correctOf('masala-2', 2, 1)).toBe(colTex(BE));
    const tiles = steps(AB) + steps(BE);
    const cm = tiles * tile;
    expect(cm % speed).toBe(0);
    expect(expectedOf('masala-2', 2)).toEqual([...BE, tiles, cm, cm / speed]);
  });

  it('مسألة 3 — the treasure hunt: computed from the drawn map and the three clues', () => {
    const O = at('masala-3', 'O');
    const pts = fig('masala-3').points;
    const OT1 = [-3, 4];
    const T1 = end(O, OT1);
    expect(correctOf('masala-3', 0, 1)).toBe(pairTex('T_1', T1));
    // T₁ est la SEULE place de la carte en ces coordonnées : A ; l'erreur de signe mène à B
    const placeAt = (xy) => Object.keys(pts).filter((n) => n !== 'O' && pts[n][0] === xy[0] && pts[n][1] === xy[1]);
    expect(placeAt(T1)).toEqual(['A']);
    expect(correctOf('masala-3', 0, 2).startsWith('A:')).toBe(true);
    expect(placeAt([-T1[0], T1[1]])).toEqual(['B']);

    const A = at('masala-3', 'A'); const C = at('masala-3', 'C');
    const AC = comps(A, C);
    expect(AC).toEqual([7, -6]);
    const wrongCode = V.coords(C); // le code de l'élève : les coordonnées de C
    const reached = end(A, wrongCode);
    expect(expectedOf('masala-3', 1)).toEqual([...AC, ...reached]);
    expect(correctOf('masala-3', 1, 0)).toBe(colTex(AC));
    expect(placeAt(reached)).toEqual([]); // ni le puits ni aucun lieu de la carte
    expect(correctOf('masala-3', 1, 2)).toContain(`$(${reached[0]}\\,;\\,${reached[1]})$`);
    expect(PROBLEM['masala-3'].parts[1].question).toContain(colTex(wrongCode));

    const CT = [-6, 5];
    const T = end(C, CT);
    const unit = 5;
    const total = steps(OT1) + steps(AC) + steps(CT);
    expect(expectedOf('masala-3', 2)).toEqual([...T, total, total * unit]);
    expect(correctOf('masala-3', 2, 0)).toBe(pairTex('T', T));
    expect(choicesOf('masala-3', 2)[0].options.slice(1)).toEqual([
      pairTex('T', CT), pairTex('T', end(C, [6, -5])), pairTex('T', end(C, [CT[1], CT[0]])),
    ]);
    expect(PROBLEM['masala-3'].statement).toContain(`${unit} m`);
  });
});
