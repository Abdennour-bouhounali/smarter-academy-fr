/**
 * LE PGCD QUI SE CONSTRUIT AU TABLEAU — les frames (shared/mathBoard/frames.js)
 * des deux algorithmes du manuel, logique pure, sans React.
 *
 * Aucun calcul ici : la trace vient de `differences.js` (le core, celle des
 * leçons) et de `numberTheory.euclideanAlgorithm`. Ce module ne fait que la
 * METTRE EN SCÈNE, élément par élément :
 *
 *   soustractions successives, pour chaque soustraction (une étape = trois frames) :
 *     (48 ; 18)          on désigne les deux nombres du couple
 *     (48 ⌒− 18)         l'arc « − » les relie
 *     (48 ; 18) ↓ 30      le résultat tombe — ligne acquise « 48 − 18 = 30 ⇒ (30 ; 18) »
 *   puis la dernière étape : PGCD(48 ; 18) = 6.
 *
 *   algorithme d'Euclide, pour chaque division :
 *     [84] ÷ [36]  →  arc « ÷ »  →  ↓ q = 2, r = 12 — ligne acquise « 84 = 36 × 2 + 12 »
 *   puis PGCD(84 ; 36) = 12.
 *
 * Chaque frame porte `meta` (sa soustraction / division, sa phase) : le
 * composant y lit ce que le DESSIN doit montrer (rubans coupés, carrés posés)
 * — le dessin suit le curseur, jamais en avance sur lui.
 */

import { tok, binaryOperationFrames, resultFrame, makeTask } from '../../shared/mathBoard/frames.js';
import { differencesRun } from './differences.js';
import { euclideanAlgorithm } from './numberTheory.js';

const K = 'tools.numberLab.steps';
const PRACTICE = 'tools.numberLab.practice.board';
const PHASES = Object.freeze(['select', 'operate', 'result']);

const pairLatex = (x, y) => `(${x}\\ ;\\ ${y})`;
const pgcdLatex = (a, b) => `\\mathrm{PGCD}(${a}\\ ;\\ ${b})`;

/** L'énoncé posé au tableau avant le premier pas. */
export const pgcdProblem = (a, b) => `${pgcdLatex(a, b)} = \\ ?`;

/**
 * @returns {null | { run, frames }}
 *   `run` est celui de `differencesRun` ; si la trace est BORNÉE (`run.truncated`),
 *   il n'y a pas de frame de résultat — le PGCD n'est pas lisible sur les pas montrés.
 */
export function differencesFrames(a, b) {
  const run = differencesRun(a, b);
  if (!run) return null;
  const frames = [];
  run.steps.forEach((s, index) => {
    const [x, y] = s.diff === 0 ? [s.small, 0] : s.next;
    const row = [tok('open', '('), tok('big', s.big), tok('sep', '\\ ;\\ '), tok('small', s.small), tok('close', ')')];
    binaryOperationFrames({
      step: index,
      row,
      a: 'big',
      b: 'small',
      symbolLatex: '-',
      resultLatex: String(s.diff),
      // « Entraîne-toi » : l'élève touche les deux nombres du couple, puis choisit « − ».
      task: makeTask({ targets: ['big', 'small'], operator: '-', promptKey: `${PRACTICE}.differences` }),
      settle: `${s.big} - ${s.small} = ${s.diff} \\quad\\Rightarrow\\quad ${pairLatex(x, y)}`,
      texts: {
        select: { textKey: `${K}.diff.select`, textParams: { big: s.big, small: s.small } },
        operate: { textKey: `${K}.diff.operate`, textParams: { big: s.big, small: s.small } },
        result: s.diff === 0
          ? { textKey: `${K}.diff.zero`, textParams: { small: s.small } }
          : { textKey: `${K}.diff.result`, textParams: { diff: s.diff, x, y } },
      },
    }).forEach((frame, phase) => frames.push({ ...frame, meta: { kind: 'subtract', index, phase: PHASES[phase] } }));
  });
  if (!run.truncated) {
    frames.push({
      ...resultFrame({
        step: run.steps.length,
        row: [tok('pgcd', pgcdLatex(a, b)), tok('eq', '='), tok('value', run.gcd, 'result')],
        textKey: `${K}.diff.final`,
        textParams: { gcd: run.gcd },
      }),
      meta: { kind: 'result' },
    });
  }

  return { run, frames };
}

/**
 * Ce que les RUBANS montrent au frame `cursor` : la soustraction courante,
 * coupée seulement quand son résultat tombe (on la désigne et on la relie avant). `null` = le
 * couple de départ, entier.
 */
export function differencesDrawing(frames, cursor) {
  if (!frames || cursor <= 0) return null;
  const meta = frames[Math.min(cursor, frames.length) - 1]?.meta;
  if (!meta) return null;
  if (meta.kind === 'result') {
    const last = [...frames].reverse().find((frame) => frame.meta?.kind === 'subtract');

    return last ? { index: last.meta.index, cut: true } : null;
  }

  return { index: meta.index, cut: meta.phase === 'result' };
}

/** @returns {null | { euclid, frames }} */
export function euclidFrames(a, b) {
  const euclid = euclideanAlgorithm(a, b);
  if (!euclid) return null;
  const frames = [];
  euclid.steps.forEach((s, index) => {
    const row = [tok('dividend', s.dividend), tok('div', '\\div'), tok('divisor', s.divisor)];
    binaryOperationFrames({
      step: index,
      row,
      a: 'dividend',
      b: 'divisor',
      symbolLatex: '\\div',
      resultLatex: `q = ${s.quotient},\\ r = ${s.remainder}`,
      task: makeTask({ targets: ['dividend', 'divisor'], operator: '\\div', promptKey: `${PRACTICE}.euclid` }),
      settle: `${s.dividend} = ${s.divisor} \\times ${s.quotient} + ${s.remainder}`,
      texts: {
        select: { textKey: `${K}.euclid.select`, textParams: { dividend: s.dividend, divisor: s.divisor } },
        operate: { textKey: `${K}.euclid.operate`, textParams: { dividend: s.dividend, divisor: s.divisor } },
        result: s.remainder === 0
          ? { textKey: `${K}.euclid.zero`, textParams: { q: s.quotient } }
          : { textKey: `${K}.euclid.result`, textParams: { q: s.quotient, r: s.remainder, divisor: s.divisor } },
      },
    }).forEach((frame, phase) => frames.push({ ...frame, meta: { kind: 'division', index, phase: PHASES[phase] } }));
  });
  frames.push({
    ...resultFrame({
      step: euclid.steps.length,
      row: [tok('pgcd', pgcdLatex(a, b)), tok('eq', '='), tok('value', euclid.gcd, 'result')],
      textKey: `${K}.euclid.final`,
      textParams: { gcd: euclid.gcd },
    }),
    meta: { kind: 'result' },
  });

  return { euclid, frames };
}

/**
 * Combien de divisions ont leurs CARRÉS posés au frame `cursor` : une
 * division se dessine quand son résultat tombe.
 */
export function euclidDrawnCount(frames, cursor) {
  if (!frames || cursor <= 0) return 0;
  const meta = frames[Math.min(cursor, frames.length) - 1]?.meta;
  if (!meta) return 0;
  if (meta.kind === 'result') return frames.filter((frame) => frame.meta?.kind === 'division' && frame.meta.phase === 'result').length;

  return meta.index + (meta.phase === 'result' ? 1 : 0);
}
