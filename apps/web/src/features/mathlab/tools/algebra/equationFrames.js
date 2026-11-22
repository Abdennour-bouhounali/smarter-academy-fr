/**
 * LE TABLEAU D'UNE RÉSOLUTION (معادلة / متراجحة) — logique pure, sans React.
 *
 * Met en scène le déroulé de walkthrough.js avec le tableau partagé
 * (shared/mathBoard/frames.js) : chaque opération est un GESTE visible,
 *
 *     2x + [3] = 9          on désigne ce qu'on veut faire disparaître
 *     2x + 3 = 9            ↓ −3 sous CHAQUE membre
 *     2x + 3 − 3 = 9 − 3    l'opération écrite dans l'expression
 *     2x = 6                l'expression simplifiée, ce qui a changé en vert
 *
 * et le résultat est le DERNIER frame (`x = 3`, ou `S = ]−∞ ; 3[`, ou
 * `S = ∅`). Diviser par un négatif : la relation passe en `warning` et porte
 * la marque `< → >`, avec la phrase de la règle.
 *
 * Aucun calcul ici : les nombres viennent de equation.js (via walkthrough.js),
 * de verify.js et de simplify.js. Chaque frame porte aussi `equation` —
 * l'état que la balance peut montrer à ce moment du déroulé.
 */

import {
  tok, bothSidesFrames, stateFrame, rowLatex,
} from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import { RELATION_LATEX, RELATION_TEXT, equationToLatex } from './equation.js';
import { formToLatex } from './linearForm.js';
import { sideWith } from './equationDisplay.js';
import { substitutedLatex } from './verify.js';
import { formTokens } from './boardTokens.js';

const K = 'tools.algebra.board';
const math = (latex) => `$${latex}$`;

function wrap(value) {
  return R.isNegative(value) ? `\\left(${R.toLatex(value)}\\right)` : R.toLatex(value);
}

/** La valeur telle qu'on la lit dans une phrase : `3`, `-2`, `2x`, `\frac{1}{2}`. */
function valueLatex(operation, variable) {
  if (operation.term === 'x') return formToLatex({ a: operation.value, b: R.ZERO }, variable);

  return R.toLatex(operation.value);
}

/** L'opération posée sous un membre : `-3`, `+ 2`, `- 2x`, `\div 2`, `\times \left(-1\right)`. */
export function opLatexOf(operation, variable = 'x') {
  const body = operation.term === 'x'
    ? (R.isNegative(operation.value) ? `\\left(${valueLatex(operation, variable)}\\right)` : valueLatex(operation, variable))
    : wrap(operation.value);
  switch (operation.kind) {
    case 'add': return `+ ${body}`;
    case 'subtract': return `- ${body}`;
    case 'multiply': return `\\times ${wrap(operation.value)}`;
    case 'divide': return `\\div ${wrap(operation.value)}`;
    default: return body;
  }
}

function equationRow(equation, variable, tones = {}) {
  return [
    ...formTokens(equation.left, 'L', variable),
    tok('rel', RELATION_LATEX[equation.relation], tones.rel),
    ...formTokens(equation.right, 'R', variable),
  ];
}

/** Ce qui a changé d'une ligne à l'autre passe en vert (`result`). */
function markChanged(after, before) {
  const was = new Map(before.map((token) => [token.id, token.latex]));

  return after.map((token) => (token.tone === 'neutral' && was.get(token.id) !== token.latex ? { ...token, tone: 'result' } : token));
}

/** Le jeton visé par l'opération : la constante, le terme en x de droite, ou le coefficient. */
function targetOf(operation, row) {
  const has = (id) => row.some((token) => token.id === id);
  if (operation.term === 'x') return has('Rx') ? { id: 'Rx', kind: 'xTerm' } : null;
  if (operation.kind === 'add' || operation.kind === 'subtract') return has('Lc') ? { id: 'Lc', kind: 'constant' } : null;

  return has('Lx') ? { id: 'Lx', kind: 'coefficient' } : null;
}

/**
 * Les frames des opérations d'un déroulé (walkthrough.steps), à partir de
 * l'étape logique `stepBase`. Réutilisé par la section الأنظمة (une équation
 * à une inconnue, `variable` = x ou y).
 */
export function operationFrames(steps, { stepBase = 0, variable = 'x' } = {}) {
  const frames = [];
  steps.forEach((s, index) => {
    const step = stepBase + index;
    const before = equationRow(s.before, variable);
    const left = before.filter((token) => token.id.startsWith('L'));
    const right = before.filter((token) => token.id.startsWith('R'));
    const relation = before.find((token) => token.id === 'rel');
    const op = opLatexOf(s.operation, variable);
    const target = targetOf(s.operation, before);
    const flippedRel = RELATION_LATEX[s.equation.relation];
    const relAfter = s.flipped ? tok('rel', flippedRel, 'warning') : relation;

    let applied;
    if (s.operation.kind === 'add' || s.operation.kind === 'subtract') {
      applied = [...left, tok('Lop', op, 'operation'), relAfter, ...right, tok('Rop', op, 'operation')];
    } else {
      const side = (form) => sideWith(formToLatex(form, variable), s.operation);
      applied = [tok('Lw', side(s.before.left), 'operation'), relAfter, tok('Rw', side(s.before.right), 'operation')];
    }
    const after = markChanged(equationRow(s.equation, variable, { rel: s.flipped ? 'warning' : 'neutral' }), before);

    const chip = { operationKey: `${K}.op.${s.explanationKey}`, operationParams: { value: math(valueLatex(s.operation, variable)) } };
    const built = bothSidesFrames({
      step,
      left,
      relation,
      right,
      targets: target ? [target.id] : [],
      opLatex: op,
      applied,
      after,
      flipped: s.flipped,
      flipLatex: s.flipped ? `${RELATION_LATEX[s.before.relation]} \\to ${flippedRel}` : null,
      settle: equationToLatex(s.equation, variable),
      texts: {
        select: target ? { textKey: `${K}.select.${target.kind}`, textParams: { term: math(before.find((token) => token.id === target.id).latex) } } : undefined,
        apply: { ...chip, textKey: `${K}.bothSides` },
        write: { ...chip, textKey: `${K}.write` },
        simplify: { ...chip, textKey: `${K}.simplify` },
        flip: { ...chip, textKey: `${K}.flip.${s.operation.kind === 'multiply' ? 'multiply' : 'divide'}` },
      },
    });
    built.forEach((frame, position) => {
      // eslint-disable-next-line no-param-reassign
      frame.equation = position === built.length - 1 ? s.equation : s.before;
    });
    frames.push(...built);
  });

  return frames;
}

/** Le dernier frame : la réponse, et elle seule. */
function finalFrame(final, { step, variable = 'x' } = {}) {
  if (final.kind === 'solved') {
    const row = [tok('fx', variable), tok('frel', RELATION_LATEX[final.relation]), tok('fs', R.toLatex(final.solution), 'result')];
    if (!final.inequality) {
      return {
        step, rows: [row], marks: [], settle: rowLatex(row), tone: 'result', equation: final.equation,
        textKey: `${K}.final.equation`, textParams: { solution: math(final.latex) },
      };
    }
    const setRow = [tok('S', 'S ='), tok('set', final.set.latex, 'result')];

    return {
      step, rows: [row, setRow], marks: [], settle: `${rowLatex(row)} \\qquad ${rowLatex(setRow)}`, tone: 'result', equation: final.equation,
      textKey: `${K}.final.inequality`, textParams: { set: math(`S = ${final.set.latex}`) },
    };
  }

  const setRow = [tok('S', 'S ='), tok('set', final.set.latex, 'result')];

  return {
    step,
    rows: [[tok('fe', final.latex, 'warning')], setRow],
    marks: [],
    settle: rowLatex(setRow),
    tone: 'result',
    equation: final.equation,
    textKey: `${K}.final.${final.kind}${final.inequality ? 'Inequality' : ''}`,
    textParams: { statement: math(final.latex) },
  };
}

/**
 * « نشر وتبسيط كل طرف » d'une saisie à parenthèses ou fractions — les lignes
 * de simplify.js, un membre après l'autre, l'autre membre restant en place.
 * Le dernier frame pose l'équation réduite (celle que la balance porte).
 */
function expansionFrames(expansion, start, { relation = '=' } = {}) {
  if (!expansion) return { frames: [], steps: 0 };
  const frames = [];
  const current = {
    left: expansion.left ? expansion.left.steps[0].latex : formToLatex(start.left),
    right: expansion.right ? expansion.right.steps[0].latex : formToLatex(start.right),
  };
  const rel = tok('rel', RELATION_LATEX[relation]);
  let step = 0;
  for (const side of ['left', 'right']) {
    const result = expansion[side];
    if (!result) continue;
    const id = side === 'left' ? 'L' : 'R';
    const row = (tone, latex) => {
      const tokens = { L: tok('L', current.left), R: tok('R', current.right) };
      tokens[id] = tok(id, latex, tone);

      return [tokens.L, rel, tokens.R];
    };
    frames.push(stateFrame({ step, rows: [row('selected', current[side])], textKey: `${K}.expand.${side}`, equation: start }));
    result.steps.slice(1).forEach((line, index, lines) => {
      const last = index === lines.length - 1;
      current[side] = line.latex;
      const tokens = row(last ? 'result' : 'operation', line.latex);
      frames.push(stateFrame({
        step,
        rows: [tokens],
        textKey: line.rules[0] ? `tools.algebra.rules.${line.rules[0]}` : `${K}.simplify`,
        textParams: line.params?.factor ? { factor: math(line.params.factor) } : undefined,
        operationKey: `${K}.chip.${line.kind === 'group' || line.kind === 'result' ? 'group' : 'distribute'}`,
        settle: last ? rowLatex(tokens) : null,
        equation: start,
      }));
    });
    step += 1;
  }
  // La forme réduite, telle que la balance la porte : `ax + b = cx + d`.
  frames.push(stateFrame({
    step: step - 1,
    rows: [equationRow(start, 'x').map((token) => (token.id === 'rel' ? token : { ...token, tone: 'result' }))],
    textKey: `${K}.expand.done`,
    settle: equationToLatex(start),
    equation: start,
  }));

  return { frames, steps: step };
}

/**
 * Tout le tableau d'une résolution : [نشر وتبسيط] → opérations → résultat.
 * @param {{steps: object[], final: object}} walkthrough  buildWalkthrough()
 * @param {{expansion?: object|null, start?: object}} [options]
 */
export function resolutionFrames(walkthrough, { expansion = null, start = null, variable = 'x' } = {}) {
  const expanded = expansion && start ? expansionFrames(expansion, start, { relation: start.relation }) : { frames: [], steps: 0 };
  const operations = operationFrames(walkthrough.steps, { stepBase: expanded.steps, variable });
  const final = finalFrame(walkthrough.final, { step: expanded.steps + walkthrough.steps.length, variable });

  return [...expanded.frames, ...operations, final];
}

// ── التحقق ────────────────────────────────────────────────────────────────

function substitutionRow(start, value, relation, tone) {
  return [
    tok('L', substitutedLatex(start.left, value), tone),
    tok('rel', RELATION_LATEX[relation]),
    tok('R', substitutedLatex(start.right, value), tone),
  ];
}

function evaluatedRow(check, relation, holds = null) {
  const row = [tok('L', R.toLatex(check.left), 'result'), tok('rel', RELATION_LATEX[relation]), tok('R', R.toLatex(check.right), 'result')];
  if (holds !== null) row.push(tok('ok', holds ? '\\checkmark' : '\\times', holds ? 'result' : 'warning'));

  return row;
}

/** La phrase de la borne d'une متراجحة (même logique que l'ancien affichage). */
function boundaryText(verification) {
  const { boundary } = verification;
  const params = { value: R.toPlainText(boundary.value), symbol: RELATION_TEXT[verification.startRelation] };
  if (!boundary.equal) return { textKey: 'tools.algebra.verificationBoundaryFalse' };
  if (boundary.included !== boundary.claimedIncluded) return { textKey: 'tools.algebra.verificationBoundaryMismatch', textParams: params };

  return { textKey: boundary.included ? 'tools.algebra.verificationBoundaryIncluded' : 'tools.algebra.verificationBoundaryExcluded', textParams: params };
}

/**
 * « التحقق » qui se déroule aussi : substitution → calcul → verdict (et, pour
 * une متراجحة, une valeur de l'ensemble PUIS la borne). verify.js a tout calculé.
 * @param {object} start          l'équation de départ
 * @param {object} verification   verifyResolution()
 */
export function verificationFrames(start, verification) {
  if (verification.kind === 'equation') {
    const { check, value } = verification;
    const plain = { value: R.toPlainText(value) };

    return [
      stateFrame({ step: 0, rows: [substitutionRow(start, value, '=', 'operation')], textKey: 'tools.algebra.verificationTitle', textParams: plain, settle: check.lines.substituted }),
      stateFrame({ step: 1, rows: [evaluatedRow(check, '=')], textKey: `${K}.verify.compute`, settle: check.lines.evaluated }),
      {
        step: 2, rows: [evaluatedRow(check, '=', check.holds)], marks: [], tone: 'result', settle: check.lines.evaluated,
        textKey: check.holds ? 'tools.algebra.verificationTrue' : 'tools.algebra.verificationFalse',
      },
    ];
  }

  const { inside, boundary, sample } = verification;
  const plain = { value: R.toPlainText(sample) };

  return [
    stateFrame({ step: 0, rows: [substitutionRow(start, sample, start.relation, 'operation')], textKey: 'tools.algebra.verificationInequalityTitle', textParams: plain, settle: inside.lines.substituted }),
    stateFrame({
      step: 1,
      rows: [evaluatedRow(inside, start.relation, inside.holds)],
      textKey: inside.holds ? 'tools.algebra.verificationInequalityTrue' : 'tools.algebra.verificationInequalityFalse',
      textParams: plain,
      settle: inside.lines.evaluated,
    }),
    stateFrame({
      step: 2,
      rows: [substitutionRow(start, boundary.value, '=', 'operation')],
      textKey: 'tools.algebra.verificationBoundaryTitle',
      textParams: { value: R.toPlainText(boundary.value) },
      settle: boundary.check.lines.substituted,
    }),
    {
      step: 3, rows: [evaluatedRow(boundary.check, '=', boundary.equal)], marks: [], tone: 'result', settle: boundary.check.lines.evaluated,
      ...boundaryText(verification),
    },
  ];
}
