/**
 * LE CALCUL DE LA LOI NORMALE AU TABLEAU — les FRAMES (shared/mathBoard/frames.js)
 * d'une requête `normalQuery(...)` réussie.
 *
 * Exigence de la propriétaire (2026-09-30) : l'élève VOIT chaque opération.
 * La standardisation se pose comme au tableau :
 *
 *     z = ( x − μ ) ÷ σ                 la formule
 *     z = ( [x] − μ ) ÷ σ   ↓ 170       chaque lettre désignée, sa valeur descend
 *     z = ( 170 − 175 ) ÷ 7             acquis
 *     [170] ⌒− [175] ↓ −5               la différence posée
 *     [−5] ⌒÷ [7] ↓ ≈ −0,7143           le quotient : z (le repère z apparaît sur la courbe)
 *     P(X ≤ 170) = P(Z ≤ z) = Φ(z)      la règle (l'aire apparaît sur la courbe)
 *     [Φ(z)] ↓ ≈ 0,2375                 la lecture de Φ
 *     (≥ : [1] ⌒− [Φ] ↓ …, entre : [Φ(z_b)] ⌒− [Φ(z_a)] ↓ …)
 *     P(X ≤ 170) ≈ 0,2375 ≈ 23,75 %     le résultat, puis sa lecture en phrase
 *
 * Chaque frame peut porter `reveals` : ce que la COURBE montre à partir de
 * ce frame ('x' | 'a' | 'b' → la valeur z de la borne ; 'area' → l'aire
 * ombrée). `normalReveal(frames, cursor)` les cumule.
 *
 * « تدرّب بنفسك » : l'élève désigne le symbole qui reçoit chaque valeur
 * (`practice.substitute`), puis [x] et [μ] avec −, puis [x − μ] et [σ] avec ÷
 * (exercices par défaut des opérations posées), puis 1 et Φ avec −. Logique pure : les
 * nombres viennent de `normalQuery` (normalDistribution.js), seule source de vérité.
 */

import {
  tok, binaryOperationFrames, makeTask, resultFrame, stateFrame,
} from '../../shared/mathBoard/frames.js';
import { latexNumber } from './treeFormulas.js';

const K = 'tools.probabilityStats.normal.frames';
const STEP_TEXT = 'tools.probabilityStats.normal.steps';

const n = (v, d = 4) => latexNumber(v, d);
const exact = (v, d = 4) => Math.abs(Number(v.toFixed(d)) - v) < 1e-12;
const approx = (v, d = 4) => (exact(v, d) ? '=' : '\\approx');
const paren = (v) => (v < 0 ? `(${n(v)})` : n(v));

const MINUS_TEXTS = {
  select: { textKey: `${K}.selectDifference` },
  operate: { operationKey: `${K}.subtract` },
  result: { textKey: `${K}.differenceDone` },
};
const DIVIDE_TEXTS = {
  select: { textKey: `${K}.selectQuotient` },
  operate: { operationKey: `${K}.divide` },
  result: { textKey: `${K}.zDone` },
};

/**
 * La standardisation d'UNE borne, en deux étapes logiques :
 *   `step`     substitution — x, μ, σ désignés tour à tour, leur valeur descend ;
 *   `step + 1` calcul — [x] ⌒− [μ] ↓ x − μ, puis [x − μ] ⌒÷ [σ] ↓ z.
 * `zName` : 'z', 'z_a', 'z_b' ; `letter` : 'x', 'a', 'b' ; `bound` : la clé de la borne.
 */
function standardizeFrames({ step, zName, letter, value, mu, sigma, z, bound }) {
  const p = `${bound}_`;
  const head = [tok(`${p}z`, zName), tok(`${p}eq`, '=')];
  const symbols = [
    { id: `${p}x`, symbol: letter, value: n(value) },
    { id: `${p}mu`, symbol: '\\mu', value: paren(mu) },
    { id: `${p}s`, symbol: '\\sigma', value: n(sigma) },
  ];
  const rowWith = (count, selected = null) => {
    const shown = symbols.map((s, i) => {
      if (i < count) return tok(s.id, s.value, 'result');
      if (i === selected) return tok(s.id, s.symbol, 'selected');

      return tok(s.id, s.symbol);
    });

    return [...head, tok(`${p}lp`, '('), shown[0], tok(`${p}minus`, '-'), shown[1], tok(`${p}rp`, ')'), tok(`${p}div`, '\\div'), shown[2]];
  };
  const frames = symbols.map((s, i) => stateFrame({
    step,
    rows: [rowWith(i, i)],
    marks: [{ type: 'under', target: s.id, latex: s.value, tone: 'operation' }],
    textKey: `${K}.substitute`,
    operationLatex: `${s.symbol} = ${n(i === 1 ? mu : i === 0 ? value : sigma)}`,
    task: makeTask({
      targets: [s.id],
      kind: 'term',
      promptKey: 'tools.probabilityStats.practice.substitute',
      promptParams: { value: `$${n(i === 1 ? mu : i === 0 ? value : sigma)}$` },
    }),
  }));
  const substituted = `${zName} = \\frac{${n(value)} - ${paren(mu)}}{${n(sigma)}}`;
  frames.push(stateFrame({ step, rows: [rowWith(3)], textKey: `${STEP_TEXT}.standardize`, settle: substituted }));

  // x − μ, posé.
  const difference = value - mu;
  const minusRow = [...head, tok(`${p}lp`, '('), tok(`${p}x`, n(value)), tok(`${p}minus`, '-'), tok(`${p}mu`, paren(mu)), tok(`${p}rp`, ')'), tok(`${p}div`, '\\div'), tok(`${p}s`, n(sigma))];
  frames.push(...binaryOperationFrames({
    step: step + 1, row: minusRow, a: `${p}x`, b: `${p}mu`, symbolLatex: '-', resultLatex: n(difference), texts: MINUS_TEXTS,
  }));
  // (x − μ) ÷ σ, posé : c'est z.
  const divideRow = [...head, tok(`${p}d`, n(difference)), tok(`${p}div`, '\\div'), tok(`${p}s`, n(sigma))];
  const divide = binaryOperationFrames({
    step: step + 1, row: divideRow, a: `${p}d`, b: `${p}s`, symbolLatex: '\\div', resultLatex: `${approx(z)} ${n(z)}`, texts: DIVIDE_TEXTS,
  });
  divide[divide.length - 1].settle = `${zName} = \\frac{${n(difference)}}{${n(sigma)}} ${approx(z)} ${n(z)}`;
  divide[divide.length - 1].reveals = [bound];
  frames.push(...divide);

  return frames;
}

/** La lecture d'une valeur de Φ : [Φ(z)] ↓ ≈ 0,2375. */
function phiFrame({ step, entries, row, settle }) {
  return stateFrame({
    step,
    rows: [row],
    marks: entries.map((entry) => ({ type: 'under', target: entry.id, latex: `\\approx ${n(entry.phi)}`, tone: 'result' })),
    textKey: `${STEP_TEXT}.substitution`,
    settle,
  });
}

/**
 * Les frames d'une requête réussie (`normalQuery(params).ok`), ou `null`.
 * Rend `{ frames, problem, questionLatex }`.
 */
export function normalFrames(params, result) {
  if (!result?.ok) return null;
  const { mu, sigma, x, a, b } = params;
  const percent = `${approx(result.probability * 100, 2)} ${n(result.probability * 100, 2)}\\,\\%`;
  const rule = stateFrame({
    step: 0,
    rows: [[tok('z', 'z'), tok('eq', '='), tok('frac', '\\frac{x - \\mu}{\\sigma}')]],
    textKey: `${STEP_TEXT}.zRule`,
    settle: 'z = \\frac{x - \\mu}{\\sigma}',
  });

  if (result.query === 'between') {
    const questionLatex = `P(${n(a)} \\le X \\le ${n(b)})`;
    const frames = [
      rule,
      ...standardizeFrames({ step: 1, zName: 'z_a', letter: 'a', value: a, mu, sigma, z: result.za, bound: 'a' }),
      ...standardizeFrames({ step: 3, zName: 'z_b', letter: 'b', value: b, mu, sigma, z: result.zb, bound: 'b' }),
      {
        ...stateFrame({
          step: 5,
          rows: [[tok('q', questionLatex), tok('eq', '='), tok('pb', `\\Phi(${n(result.zb)})`), tok('m', '-'), tok('pa', `\\Phi(${n(result.za)})`)]],
          textKey: `${STEP_TEXT}.betweenRule`,
          settle: `${questionLatex} = \\Phi(z_b) - \\Phi(z_a) = \\Phi(${n(result.zb)}) - \\Phi(${n(result.za)})`,
        }),
        reveals: ['area'],
      },
      phiFrame({
        step: 6,
        entries: [{ id: 'pb', phi: result.phiB }, { id: 'pa', phi: result.phiA }],
        row: [tok('q', questionLatex), tok('eq', '='), tok('pb', `\\Phi(${n(result.zb)})`, 'selected'), tok('m', '-'), tok('pa', `\\Phi(${n(result.za)})`, 'selected')],
        settle: `\\Phi(${n(result.zb)}) \\approx ${n(result.phiB)} \\qquad \\Phi(${n(result.za)}) \\approx ${n(result.phiA)}`,
      }),
    ];
    const difference = binaryOperationFrames({
      step: 6,
      row: [tok('q', questionLatex), tok('eq', '\\approx'), tok('vb', n(result.phiB)), tok('m', '-'), tok('va', n(result.phiA))],
      a: 'vb',
      b: 'va',
      symbolLatex: '-',
      resultLatex: `\\approx ${n(result.probability)}`,
      texts: MINUS_TEXTS,
    });
    frames.push(...difference);
    frames.push(finalFrame({ step: 7, questionLatex, result, percent, params }));

    return { frames, problem: `${questionLatex} = \\,?`, questionLatex };
  }

  const symbol = result.query === 'ge' ? '\\ge' : '\\le';
  const questionLatex = `P(X ${symbol} ${n(x)})`;
  const phiTex = `\\Phi(${n(result.z)})`;
  const frames = [
    rule,
    ...standardizeFrames({ step: 1, zName: 'z', letter: 'x', value: x, mu, sigma, z: result.z, bound: 'x' }),
    {
      ...stateFrame({
        step: 3,
        rows: [[tok('q', questionLatex), tok('eq', '='), tok('pz', `P(Z ${symbol} ${n(result.z)})`), tok('eq2', '='), ...(result.query === 'ge' ? [tok('one', '1'), tok('m', '-')] : []), tok('phi', phiTex)]],
        textKey: `${STEP_TEXT}.${result.query === 'ge' ? 'geRule' : 'leRule'}`,
        settle: `${questionLatex} = P(Z ${symbol} ${n(result.z)}) = ${result.query === 'ge' ? '1 - ' : ''}${phiTex}`,
      }),
      reveals: ['area'],
    },
    phiFrame({
      step: 4,
      entries: [{ id: 'phi', phi: result.phi }],
      row: [tok('q', questionLatex), tok('eq', '='), ...(result.query === 'ge' ? [tok('one', '1'), tok('m', '-')] : []), tok('phi', phiTex, 'selected')],
      settle: `${phiTex} \\approx ${n(result.phi)}`,
    }),
  ];
  let step = 5;
  if (result.query === 'ge') {
    frames.push(...binaryOperationFrames({
      step,
      row: [tok('q', questionLatex), tok('eq', '\\approx'), tok('one', '1'), tok('m', '-'), tok('vphi', n(result.phi))],
      a: 'one',
      b: 'vphi',
      symbolLatex: '-',
      resultLatex: `\\approx ${n(result.probability)}`,
      texts: MINUS_TEXTS,
    }));
    step += 1;
  }
  frames.push(finalFrame({ step, questionLatex, result, percent, params }));

  return { frames, problem: `${questionLatex} = \\,?`, questionLatex };
}

/** Le résultat, et sa lecture en une phrase (la formule reste une île LaTeX). */
function finalFrame({ step, questionLatex, result, percent, params }) {
  const value = `${approx(result.probability)} ${n(result.probability)} ${percent}`;
  const textParams = {
    percent: `$${n(result.probability * 100, 2)}\\,\\%$`,
    x: `$${n(params.x)}$`,
    a: `$${n(params.a)}$`,
    b: `$${n(params.b)}$`,
  };

  return resultFrame({
    step,
    row: [tok('q', questionLatex), tok('r', value, 'result')],
    textKey: `${K}.interpret.${result.query}`,
    textParams,
    settle: `${questionLatex} ${value}`,
  });
}

/** Ce que la courbe montre après `cursor` frames : les z des bornes, l'aire. */
export function normalReveal(frames, cursor) {
  const shown = (frames ?? []).slice(0, Math.max(0, cursor)).flatMap((frame) => frame.reveals ?? []);

  return { z: new Set(shown.filter((key) => key !== 'area')), area: shown.includes('area') };
}
