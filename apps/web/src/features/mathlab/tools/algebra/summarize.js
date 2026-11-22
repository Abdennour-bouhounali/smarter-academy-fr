import { equationToText } from './equation.js';
import { latexToText } from './polynomial.js';
import { simplifyExpression } from './simplify.js';
import { factorExpression } from './factor.js';
import { parseLinearEquation, classifySystem } from './systems.js';
import { makeFunction, functionLatex, evaluateNumber, frameFunction } from './functions.js';
import * as R from './rational.js';

/**
 * Le RÉSUMÉ d'un document du مختبر الجبر, pour « أعمالي » (MATH_LAB.md §5i.2).
 *
 * Il suit la SECTION affichée :
 *   المعادلات / المتراجحات   kind « equation » : la relation de départ → celle où l'on en est
 *   الأنظمة                  kind « equation » : les deux équations → le couple solution
 *   تبسيط / تحليل            kind « equation » : l'expression → sa forme simplifiée / factorisée
 *   الدوال                   kind « curve »    : la courbe, échantillonnée (polylines)
 *
 * Pur, minuscule (< 2 Ko), et ne JETTE jamais : un état illisible donne
 * simplement un résumé plus pauvre, ou null.
 *
 * @param {object} data
 * @returns {import('../../toolContract.js').MathLabSummary | null}
 */
export function summarizeAlgebra(data) {
  try {
    switch (data?.section) {
      case 'inequalities': return summarizePath(data.inequalities);
      case 'systems': return summarizeSystems(data.systems);
      case 'simplify': return summarizeExpression(data.simplify?.source, (source) => {
        const result = simplifyExpression(source);

        return result.ok ? result.resultLatex : null;
      });
      case 'factor': return summarizeExpression(data.factor?.source, (source) => {
        const result = factorExpression(source);

        return result.ok && result.status === 'factored' ? result.resultLatex : null;
      });
      case 'functions': return summarizeFunction(data.functions);
      default: return summarizePath(data);
    }
  } catch {
    return null;
  }
}

function clip(text, max = 60) {
  return typeof text === 'string' ? text.slice(0, max) : null;
}

/** Un chemin (équation ou متراجحة) : la relation de départ et celle où l'on en est. */
function summarizePath(path) {
  const steps = Array.isArray(path?.steps) ? path.steps : [];
  if (steps.length === 0) return null;

  const first = safeText(steps[0]?.equation);
  const cursor = Number.isInteger(path?.cursor) ? Math.max(0, Math.min(steps.length - 1, path.cursor)) : steps.length - 1;
  const current = safeText(steps[cursor]?.equation);
  if (!first && !current) return null;

  return {
    kind: 'equation',
    // `source` est ce que l'élève a TAPÉ : on le cherche tel quel.
    text: [clip(path?.source), first, current].filter(Boolean),
    detail: { first, current, steps: steps.length, solved: cursor === steps.length - 1 && steps.length > 1 },
  };
}

function summarizeSystems(systems) {
  const first = clip(systems?.first, 40);
  const second = clip(systems?.second, 40);
  if (!first && !second) return null;
  let current = null;
  const e1 = parseLinearEquation(first);
  const e2 = parseLinearEquation(second);
  if (e1.ok && e2.ok) {
    const verdict = classifySystem(e1.equation, e2.equation);
    if (verdict.kind === 'unique') current = `(${R.toPlainText(verdict.x)} ; ${R.toPlainText(verdict.y)})`;
  }

  return {
    kind: 'equation',
    text: [first, second, current].filter(Boolean),
    detail: { first: clip(`${first ?? ''} ; ${second ?? ''}`), current, steps: 1, solved: Boolean(current) },
  };
}

function summarizeExpression(source, transform) {
  const first = clip(source);
  if (!first) return null;
  const latex = transform(first);
  const current = latex ? clip(latexToText(latex)) : null;

  return {
    kind: 'equation',
    text: [first, current].filter(Boolean),
    detail: { first, current, steps: 1, solved: Boolean(current) },
  };
}

function summarizeFunction(functions) {
  if (!functions || typeof functions !== 'object') return null;
  const fn = makeFunction(functions.family, functions);
  const view = frameFunction(fn);
  const points = [];
  const samples = 24;
  for (let i = 0; i < samples; i += 1) {
    const x = view.xMin + ((view.xMax - view.xMin) * i) / (samples - 1);
    const y = evaluateNumber(fn, x);
    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  }
  const round = (v) => Math.round(v * 100) / 100;

  return {
    kind: 'curve',
    text: [clip(latexToText(functionLatex(fn)))],
    detail: {
      viewport: [view.xMin, view.xMax, view.yMin, view.yMax].map(round),
      polylines: [{ p: points, c: '#008443' }],
    },
  };
}

/** Une équation illisible ne casse pas la carte : elle n'a simplement pas de texte. */
function safeText(equation) {
  if (!equation) return null;
  try {
    return equationToText(equation).slice(0, 60);
  } catch {
    return null;
  }
}
