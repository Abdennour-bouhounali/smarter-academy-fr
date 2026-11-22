/**
 * LE TABLEAU D'UNE جملة معادلتين — logique pure, sans React.
 *
 * Les méthodes de systems.js (التعويض, الجمع) disent QUOI faire ; ce module
 * le met en scène sur le tableau partagé, geste par geste :
 *
 *   الجمع      x [+ y] = 10 / x [− y] = 2   les deux termes en y désignés
 *              ↓ 0                            y + (−y) = 0
 *              (x + y) + (x − y) = 10 + 2     les deux membres ajoutés
 *              2x = 12                        → ÷2 sous les deux membres → x = 6
 *              [x] + y = 10 → 6 + y = 10      on remplace x (le 6 en vert)
 *              → −6 sous les deux membres → y = 4
 *              (x ; y) = (6 ; 4)              le DERNIER frame
 *
 *   التعويض    isoler (−x sous les deux membres) → remplacer → développer →
 *              résoudre (les mêmes gestes que la section المعادلات) → revenir.
 *
 *   البياني    droite (1), droite (2), le point commun, la lecture : chaque
 *              frame porte `draw` (ce que le plan a le droit de tracer).
 *
 * Les équations à une inconnue sont résolues par walkthrough.js et mises en
 * scène par equationFrames.js : les mêmes gestes partout, jamais une copie.
 */

import { tok, bothSidesFrames, stateFrame, rowLatex, makeTask } from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import { termBody } from './polynomial.js';
import {
  equationLatex, pairLatex, affineLatex, timesValue, classifySystem,
} from './systems.js';
import { buildWalkthrough } from './walkthrough.js';
import { operationFrames } from './equationFrames.js';
import { splitTerms } from './boardTokens.js';

const K = 'tools.algebra.board.sys';
const P = 'tools.algebra.practice';
const math = (latex) => `$${latex}$`;
const coefOf = (eq, v) => (v === 'x' ? eq.a : eq.b);

/** Un terme `k·v`, signé s'il n'est pas en tête : `2x`, `+ y`, `- 3y`. */
function termLatex(k, v, first) {
  const body = termBody(R.isNegative(k) ? R.negate(k) : k, { [v]: 1 });
  if (first) return `${R.isNegative(k) ? '-' : ''}${body}`;

  return `${R.isNegative(k) ? '-' : '+'} ${body}`;
}

/** Les jetons d'une équation `a·x + b·y = c` ; ids `${p}x`, `${p}y`, `${p}eq`, `${p}c`. */
function systemRow(eq, p, tones = {}) {
  const tokens = [];
  for (const v of ['x', 'y']) {
    const k = coefOf(eq, v);
    if (!R.isZero(k)) tokens.push(tok(`${p}${v}`, termLatex(k, v, tokens.length === 0), tones[v]));
  }
  tokens.push(tok(`${p}eq`, '='), tok(`${p}c`, R.toLatex(eq.c), tones.c));

  return tokens;
}

function recolor(row, before) {
  const was = new Map(before.map((token) => [token.id, token.latex]));

  return row.map((token) => (token.tone === 'neutral' && was.get(token.id) !== token.latex ? { ...token, tone: 'result' } : token));
}

function lhsOf(eq) {
  return equationLatex(eq).split(' = ')[0];
}

/** Résoudre `k·v + known = c` (une inconnue) avec les gestes de la section المعادلات. */
function solveOneFrames({ a, b, c }, v, stepBase) {
  const walk = buildWalkthrough({ left: { a, b }, right: { a: R.ZERO, b: c }, relation: '=' }, { variable: v });

  return { frames: operationFrames(walk.steps, { stepBase, variable: v }), steps: walk.steps.length };
}

/** Le dernier frame : le couple, ou l'absence de couple, ou la droite entière. */
function systemFinal(outcome, e1, step, degenerate = null) {
  if (outcome.kind === 'unique') {
    const row = [tok('pair', '\\left(x\\,;\\,y\\right) ='), tok('value', pairLatex(outcome.x, outcome.y), 'result')];

    return { step, rows: [row], marks: [], tone: 'result', settle: rowLatex(row), textKey: `${K}.final.unique`, textParams: { pair: math(pairLatex(outcome.x, outcome.y)) } };
  }
  const set = outcome.kind === 'none' ? '\\emptyset' : `\\left\\{\\left(x\\,;\\,y\\right) \\mid ${equationLatex(e1)}\\right\\}`;
  const rows = [];
  if (degenerate) rows.push([tok('deg', degenerate, 'warning')]);
  rows.push([tok('S', 'S ='), tok('set', set, 'result')]);

  return { step, rows, marks: [], tone: 'result', settle: `S = ${set}`, textKey: `${K}.final.${outcome.kind}` };
}

/** Multiplier une équation (fractions, ou coefficients à accorder) : ×k sous les deux membres. */
function scaleFrames(before, after, factor, p, step, textKey, textParams) {
  const row = systemRow(before, p);
  const left = row.filter((token) => token.id !== `${p}eq` && token.id !== `${p}c`);
  const right = row.filter((token) => token.id === `${p}c`);
  const opLatex = `\\times ${factor}`;

  return bothSidesFrames({
    step,
    left,
    relation: row.find((token) => token.id === `${p}eq`),
    right,
    opLatex,
    applied: [
      tok(`${p}w`, `${factor} \\times \\left(${lhsOf(before)}\\right)`, 'operation'),
      tok(`${p}eq`, '='),
      tok(`${p}r`, `${factor} \\times ${R.isNegative(before.c) ? `\\left(${R.toLatex(before.c)}\\right)` : R.toLatex(before.c)}`, 'operation'),
    ],
    after: recolor(systemRow(after, p), row),
    settle: equationLatex(after),
    task: false,
    texts: {
      apply: { textKey, textParams, operationKey: `${K}.chip.multiply`, operationParams: { value: math(String(factor)) } },
      write: { textKey: 'tools.algebra.board.write', operationKey: `${K}.chip.multiply`, operationParams: { value: math(String(factor)) } },
      simplify: { textKey: 'tools.algebra.board.simplify', operationKey: `${K}.chip.multiply`, operationParams: { value: math(String(factor)) } },
    },
  });
}

/** Remplacer une inconnue par sa valeur dans une équation : on désigne, puis la valeur prend sa place (en vert). */
function replaceFrames(eq, p, u, uValue, step, textParams) {
  const row = systemRow(eq, p);
  const id = `${p}${u}`;
  if (!row.some((token) => token.id === id)) return [];
  const k = coefOf(eq, u);
  const first = row[0].id === id;
  let shown = timesValue(k, uValue);
  if (!first) shown = shown.startsWith('-') ? `- ${shown.slice(1)}` : `+ ${shown}`;
  const replaced = row.map((token) => (token.id === id ? tok(id, shown, 'result') : token));

  return [
    stateFrame({
      step, rows: [row.map((token) => (token.id === id ? { ...token, tone: 'selected' } : token))], textKey: `${K}.replace`, textParams,
      task: makeTask({ targets: [id], kind: 'pick', promptKey: `${P}.pickReplace`, promptParams: textParams }),
    }),
    stateFrame({ step, rows: [replaced], textKey: `${K}.replace`, textParams, operationKey: `${K}.chip.replace`, operationParams: textParams, settle: rowLatex(replaced) }),
  ];
}

// ── الجمع ────────────────────────────────────────────────────────────────

/** @param {object} outcome eliminationSteps(e1, e2) */
export function eliminationFrames(outcome, e1, e2) {
  const frames = [];
  let step = 0;
  const current = [e1, e2];
  let degenerate = null;

  for (const s of outcome.steps) {
    const d = s.data ?? {};
    if (s.kind === 'clearFractions') {
      const p = String(d.index + 1);
      frames.push(...scaleFrames(d.before, d.after, d.factor, p, step, `${K}.clearFractions`, { eq: math(`(${p})`), factor: math(String(d.factor)) }));
      current[d.index] = d.after;
      step += 1;
    } else if (s.kind === 'multiply') {
      const [m1, m2] = d.factors;
      if (m1 === 1 && m2 === 1) continue;
      const rows = current.map((eq, index) => systemRow(eq, String(index + 1), { [d.v]: 'selected' }));
      frames.push(stateFrame({
        step, rows, textKey: `${K}.align`, textParams: { variable: math(d.v) },
        ...(rows[0].some((t) => t.id === `1${d.v}`) && rows[1].some((t) => t.id === `2${d.v}`)
          ? { task: makeTask({ targets: [`1${d.v}`, `2${d.v}`], kind: 'pick', promptKey: `${P}.pickEliminate`, promptParams: { variable: math(d.v) } }) }
          : {}),
      }));
      const marks = [];
      if (m1 !== 1) marks.push({ type: 'under', target: '1c', latex: `\\times ${m1}`, tone: 'operation' });
      if (m2 !== 1) marks.push({ type: 'under', target: '2c', latex: `\\times ${m2}`, tone: 'operation' });
      frames.push(stateFrame({ step, rows, marks, textKey: `tools.algebra.rules.multiplyEquations`, textParams: { m1: math(String(m1)), m2: math(String(m2)), variable: math(d.v) }, operationKey: `${K}.chip.scale` }));
      const after = d.after.map((eq, index) => recolor(systemRow(eq, String(index + 1)), rows[index]));
      frames.push(stateFrame({ step, rows: after, textKey: `${K}.aligned`, textParams: { variable: math(d.v) }, settle: `${equationLatex(d.after[0])} \\qquad ${equationLatex(d.after[1])}` }));
      current.splice(0, 2, ...d.after);
      step += 1;
    } else if (s.kind === 'combine') {
      const [g1, g2] = d.equations;
      const verb = d.subtract ? 'subtract' : 'add';
      const rows = [systemRow(g1, '1', { [d.v]: 'selected' }), systemRow(g2, '2', { [d.v]: 'selected' })];
      const chip = { operationKey: `${K}.chip.${verb}` };
      const hasPair = rows[0].some((t) => t.id === `1${d.v}`) && rows[1].some((t) => t.id === `2${d.v}`);
      frames.push(stateFrame({
        step, rows, textKey: `${K}.${d.subtract ? 'same' : 'opposite'}`, textParams: { variable: math(d.v) },
        // L'exercice : désigner les deux termes en v, puis l'opération qui les fait disparaître (+ ou −).
        ...(hasPair ? { task: makeTask({ targets: [`1${d.v}`, `2${d.v}`], operator: d.subtract ? '-' : '+', kind: 'operation', promptKey: `${P}.eliminate`, promptParams: { variable: math(d.v) } }) } : {}),
      }));
      if (hasPair) {
        frames.push(stateFrame({ step, rows: rows.map((row) => row.map((t) => (t.tone === 'selected' ? { ...t, tone: 'operation' } : t))), marks: [{ type: 'result', from: [`1${d.v}`, `2${d.v}`], latex: '0' }], textKey: `${K}.vanish`, textParams: { variable: math(d.v) }, ...chip }));
      }
      const symbol = d.subtract ? '-' : '+';
      const c2 = R.isNegative(g2.c) ? `\\left(${R.toLatex(g2.c)}\\right)` : R.toLatex(g2.c);
      const sum = [
        tok('s1', `\\left(${lhsOf(g1)}\\right)`), tok('sop', symbol, 'operation'), tok('s2', `\\left(${lhsOf(g2)}\\right)`),
        tok('seq', '='), tok('sc1', R.toLatex(g1.c)), tok('sop2', symbol, 'operation'), tok('sc2', c2),
      ];
      frames.push(stateFrame({ step, rows: [sum], textKey: `tools.algebra.rules.${d.subtract ? 'subtractEquations' : 'addEquations'}`, textParams: { variable: math(d.v) }, ...chip, settle: rowLatex(sum) }));
      const reduced = R.isZero(d.A)
        ? [tok('Lc', '0', 'result'), tok('rel', '='), tok('Rc', R.toLatex(d.C), 'result')]
        : [tok('Lx', termLatex(d.A, d.u, true), 'result'), tok('rel', '='), tok('Rc', R.toLatex(d.C), 'result')];
      frames.push(stateFrame({ step, rows: [reduced], textKey: `${K}.reduced`, textParams: { variable: math(d.v) }, settle: rowLatex(reduced) }));
      if (R.isZero(d.A)) degenerate = rowLatex(reduced);
      step += 1;
    } else if (s.kind === 'solveOne') {
      const solved = solveOneFrames({ a: d.A, b: d.B, c: d.c }, d.u, step);
      frames.push(...solved.frames);
      step += solved.steps;
    } else if (s.kind === 'backSubstitute') {
      const params = { variable: math(d.u), value: math(R.toLatex(d.uValue)), eq: math('(1)') };
      const replaced = replaceFrames(d.equation, '1', d.u, d.uValue, step, params);
      frames.push(...replaced);
      if (replaced.length) step += 1;
      const solved = solveOneFrames({ a: d.kv, b: d.known, c: d.equation.c }, d.v, step);
      frames.push(...solved.frames);
      step += solved.steps;
    } else if (s.kind === 'direct') {
      frames.push(stateFrame({ step, rows: d.equations.map((eq, index) => systemRow(eq, String(index + 1), { x: 'result', y: 'result' })), textKey: 'tools.algebra.rules.direct' }));
      step += 1;
    } else if (s.kind === 'none' || s.kind === 'infinite') {
      if (s.latex) degenerate = s.latex;
    }
  }

  frames.push(systemFinal(outcome, e1, step, degenerate));

  return frames;
}

// ── التعويض ───────────────────────────────────────────────────────────────

/** @param {object} outcome substitutionSteps(e1, e2) */
export function substitutionFrames(outcome, e1) {
  const frames = [];
  let step = 0;
  let degenerate = null;

  for (const s of outcome.steps) {
    const d = s.data ?? {};
    if (s.kind === 'isolate') {
      const p = String(d.index + 1);
      const row = systemRow(d.equation, p);
      const ku = coefOf(d.equation, d.u);
      const kv = coefOf(d.equation, d.v);
      const params = { variable: math(d.v), eq: math(`(${p})`) };
      let movedRow = row;
      if (!R.isZero(ku)) {
        // Faire passer le terme en u de l'autre côté : −ku·u sous les deux membres.
        const move = `${R.isNegative(ku) ? '+' : '-'} ${termBody(R.isNegative(ku) ? R.negate(ku) : ku, { [d.u]: 1 })}`;
        const rhs = affineLatex(R.negate(ku), d.u, d.equation.c);
        movedRow = [tok(`${p}${d.v}`, termLatex(kv, d.v, true)), tok(`${p}eq`, '='), ...splitTerms(rhs).map((latex, index) => tok(`${p}r${index}`, latex, 'result'))];
        frames.push(...bothSidesFrames({
          step,
          left: row.filter((t) => t.id === `${p}x` || t.id === `${p}y`),
          relation: row.find((t) => t.id === `${p}eq`),
          right: row.filter((t) => t.id === `${p}c`),
          targets: [`${p}${d.u}`],
          opLatex: move,
          applied: [...row.slice(0, -2), tok(`${p}op`, move, 'operation'), row[row.length - 2], row[row.length - 1], tok(`${p}op2`, move, 'operation')],
          after: movedRow,
          settle: rowLatex(movedRow),
          texts: {
            select: { textKey: 'tools.algebra.rules.isolate', textParams: params },
            apply: { textKey: 'tools.algebra.board.bothSides', operationKey: `tools.algebra.board.op.${R.isNegative(ku) ? 'addX' : 'subtractX'}`, operationParams: { value: math(move.slice(2)) } },
            write: { textKey: 'tools.algebra.board.write' },
            simplify: { textKey: 'tools.algebra.board.simplify' },
          },
        }));
        step += 1;
      }
      if (!R.equals(kv, R.ONE)) {
        const isolatedRow = [tok(`${p}${d.v}`, d.v, 'result'), tok(`${p}eq`, '='), ...splitTerms(d.isolated).map((latex, index) => tok(`${p}i${index}`, latex, 'result'))];
        frames.push(...bothSidesFrames({
          step,
          left: [movedRow[0]],
          relation: movedRow[1],
          right: movedRow.slice(2).map((t) => ({ ...t, tone: 'neutral' })),
          targets: [movedRow[0].id],
          opLatex: `\\div ${R.isNegative(kv) ? `\\left(${R.toLatex(kv)}\\right)` : R.toLatex(kv)}`,
          applied: [
            tok('w1', `\\frac{${movedRow[0].latex}}{${R.toLatex(kv)}}`, 'operation'),
            tok(`${p}eq`, '='),
            tok('w2', `\\frac{${rowLatex(movedRow.slice(2))}}{${R.toLatex(kv)}}`, 'operation'),
          ],
          after: isolatedRow,
          settle: rowLatex(isolatedRow),
          texts: {
            select: { textKey: 'tools.algebra.rules.isolate', textParams: params },
            apply: { textKey: 'tools.algebra.board.bothSides', operationKey: 'tools.algebra.board.op.divide', operationParams: { value: math(R.toLatex(kv)) } },
            write: { textKey: 'tools.algebra.board.write' },
            simplify: { textKey: 'tools.algebra.board.simplify' },
          },
        }));
        step += 1;
      }
      if (R.isZero(ku) && R.equals(kv, R.ONE)) {
        frames.push(stateFrame({ step, rows: [row.map((t) => (t.id === `${p}${d.v}` ? { ...t, tone: 'selected' } : t))], textKey: `${K}.alreadyIsolated`, textParams: params }));
        step += 1;
      }
    } else if (s.kind === 'substitute') {
      const p = String(d.index + 1);
      const row = systemRow(d.equation, p);
      const id = `${p}${d.v}`;
      const params = { variable: math(d.v), eq: math(`(${p})`) };
      const tv = coefOf(d.equation, d.v);
      const first = row[0].id === id;
      const abs = R.isNegative(tv) ? R.negate(tv) : tv;
      const body = `${R.equals(abs, R.ONE) ? '' : R.toLatex(abs)}\\left(${d.isolated}\\right)`;
      const shown = first ? `${R.isNegative(tv) ? '-' : ''}${body}` : `${R.isNegative(tv) ? '-' : '+'} ${body}`;
      const replaced = row.map((t) => (t.id === id ? tok(id, shown, 'result') : t));
      frames.push(stateFrame({
        step, rows: [row.map((t) => (t.id === id ? { ...t, tone: 'selected' } : t))], textKey: 'tools.algebra.rules.substitute', textParams: params,
        ...(row.some((t) => t.id === id) ? { task: makeTask({ targets: [id], kind: 'pick', promptKey: `${P}.pickSubstitute`, promptParams: params }) } : {}),
      }));
      frames.push(stateFrame({ step, rows: [replaced], textKey: 'tools.algebra.rules.substitute', textParams: params, operationKey: `${K}.chip.substitute`, settle: rowLatex(replaced) }));
      step += 1;
    } else if (s.kind === 'expand') {
      const reduced = R.isZero(d.A)
        ? [tok('Lc', R.toLatex(d.B), 'result'), tok('rel', '='), tok('Rc', R.toLatex(d.c))]
        : [...splitTerms(affineLatex(d.A, d.u, d.B)).map((latex, index) => tok(`e${index}`, latex, 'result')), tok('rel', '='), tok('Rc', R.toLatex(d.c))];
      frames.push(stateFrame({ step, rows: [reduced], textKey: 'tools.algebra.rules.expandSimplify', operationKey: `${K}.chip.expand`, settle: rowLatex(reduced) }));
      if (R.isZero(d.A)) degenerate = rowLatex(reduced);
      step += 1;
    } else if (s.kind === 'solveOne') {
      const solved = solveOneFrames({ a: d.A, b: d.B, c: d.c }, d.u, step);
      frames.push(...solved.frames);
      step += solved.steps;
    } else if (s.kind === 'backSubstitute') {
      const params = { variable: math(d.u), value: math(R.toLatex(d.uValue)) };
      const isolatedRow = [tok('bv', d.v), tok('beq', '='), ...splitTerms(d.isolated).map((latex, index) => tok(`bi${index}`, latex))];
      const target = isolatedRow.find((t) => t.latex.includes(d.u));
      frames.push(stateFrame({
        step, rows: [isolatedRow.map((t) => (t === target ? { ...t, tone: 'selected' } : t))], textKey: `${K}.back`, textParams: params,
        ...(target ? { task: makeTask({ targets: [target.id], kind: 'pick', promptKey: `${P}.pickReplace`, promptParams: params }) } : {}),
      }));
      const valueLatex = R.toLatex(d.value);
      if (d.back !== valueLatex) {
        const backRow = [tok('bv', d.v), tok('beq', '='), tok('bk', d.back, 'operation')];
        frames.push(stateFrame({ step, rows: [backRow], textKey: `${K}.back`, textParams: params, operationKey: `${K}.chip.replace`, operationParams: params, settle: rowLatex(backRow) }));
      }
      const done = [tok('bv', d.v), tok('beq', '='), tok('bk', valueLatex, 'result')];
      frames.push(stateFrame({ step, rows: [done], textKey: `${K}.compute`, settle: rowLatex(done) }));
      step += 1;
    } else if (s.kind === 'none' || s.kind === 'infinite') {
      degenerate = degenerate ?? s.latex;
    }
  }

  frames.push(systemFinal(outcome, e1, step, degenerate));

  return frames;
}

// ── البياني ───────────────────────────────────────────────────────────────

/**
 * Le plan se construit : droite (1), droite (2), le point commun, sa lecture.
 * Chaque frame porte `draw` : 1 = droite (1), 2 = les deux, 3 = + le point, 4 = + son étiquette.
 */
export function graphicalFrames(e1, e2, verdict = classifySystem(e1, e2)) {
  const frames = [
    { ...stateFrame({ step: 0, rows: [systemRow(e1, '1', { x: 'result', y: 'result' })], textKey: `${K}.graph.line1`, settle: equationLatex(e1) }), draw: 1 },
    { ...stateFrame({ step: 1, rows: [systemRow(e2, '2', { x: 'operation', y: 'operation' })], textKey: `${K}.graph.line2`, settle: equationLatex(e2) }), draw: 2 },
  ];
  if (verdict.kind === 'unique') {
    frames.push({ ...stateFrame({ step: 2, rows: [[tok('M', 'M', 'selected')]], textKey: `${K}.graph.meet` }), draw: 3 });
    frames.push({ ...systemFinal(verdict, e1, 3), textKey: `${K}.graph.read`, textParams: { pair: math(pairLatex(verdict.x, verdict.y)) }, draw: 4 });
  } else {
    frames.push({ ...systemFinal(verdict, e1, 2), textKey: `${K}.graph.${verdict.kind}`, draw: 2 });
  }

  return frames;
}
