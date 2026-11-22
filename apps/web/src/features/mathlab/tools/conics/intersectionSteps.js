/**
 * DROITE ∩ CONIQUE, RÉSOLU PAS À PAS — logique PURE (clés i18n + LaTeX).
 *
 * Les points d'intersection restent VIVANTS sur le plan : ils suivent la
 * droite qu'on tire, et le panneau compte 0, 1 ou 2 points sous le doigt
 * (§26, §27). Ce module écrit, sur demande, la RÉSOLUTION algébrique qui
 * justifie ce compte :
 *
 *     le système → substituer la droite → le trinôme → Δ → les racines
 *     → l'autre coordonnée → les points (DERNIER pas)
 *
 * Aucun calcul propre : le trinôme est celui de `lineConicQuadratic`, ses
 * racines celles de `solveQuadratic`, les points ceux de
 * `lineConicIntersection` — le moteur reste la seule source de vérité.
 */

import * as I from './intersections.js';
import { canonicalLatex, n } from './canonicalSteps.js';
import { orientationOf, isValidConic } from './conicMath.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';

const { abs } = Math;
const K = 'tools.conics.solveIntersection.steps';
const isZero = (v) => abs(v) < 1e-9;
const isOne = (v) => abs(v - 1) < 1e-9;

/** Un nombre lu à 2 décimales (comme les points du plan), en LaTeX. */
const r2 = (v) => formatValue(v, 2).replace('−', '-').replace(',', '{,}');
const rel = (v, decimals = 2) => (abs(v - Number(v.toFixed(decimals))) < 1e-9 ? '=' : '\\approx');
const paren = (v) => (v < 0 ? `(${n(v)})` : n(v));

function lead(c, sym) {
  if (!sym) return n(c);
  if (isOne(c)) return sym;
  if (isOne(-c)) return `-${sym}`;

  return `${n(c)}${sym}`;
}

function signed(c, sym = '') {
  const m = abs(c);
  if (sym && isOne(m)) return `${c < 0 ? '-' : '+'} ${sym}`;

  return `${c < 0 ? '-' : '+'} ${n(m)}${sym}`;
}

/** `ax² + bx + c`, sans les termes nuls. */
function trinomial(a, b, c, v) {
  const parts = [];
  if (!isZero(a)) parts.push(lead(a, `${v}^2`));
  if (!isZero(b)) parts.push(parts.length ? signed(b, v) : lead(b, v));
  if (!isZero(c) || parts.length === 0) parts.push(parts.length ? signed(c) : n(c));

  return parts.join(' ');
}

/** L'équation de la droite. */
export function lineLatex(line) {
  if (line.vertical) return `x = ${n(line.x)}`;
  if (isZero(line.slope)) return `y = ${n(line.intercept)}`;

  return `y = ${lead(line.slope, 'x')}${isZero(line.intercept) ? '' : ` ${signed(line.intercept)}`}`;
}

/** `(v − s)` où v est remplacé : `(mx + q)` ou une valeur numérique. */
function shifted(expr, shift) {
  if (isZero(shift)) return expr;

  return `${expr} ${shift > 0 ? '-' : '+'} ${n(abs(shift))}`;
}

/** L'équation de la conique APRÈS substitution de la droite (écrite comme au tableau). */
function substitutedLatex(conic, line) {
  const { h, k } = conic;
  // y − k devient (mx + p − k) ; x − h devient (x₀ − h) pour une verticale.
  let Y;
  if (line.vertical) Y = isZero(k) ? 'y' : `(y ${k > 0 ? '-' : '+'} ${n(abs(k))})`;
  else Y = `(${trinomial(0, line.slope, line.intercept - k, 'x')})`;
  let xMinusH;
  if (line.vertical) xMinusH = `(${shifted(n(line.x), h)})`;
  else xMinusH = isZero(h) ? 'x' : `(x ${h > 0 ? '-' : '+'} ${n(abs(h))})`;
  const sq = (term) => `${term}^2`;
  switch (conic.kind) {
    case 'circle':
      return `${sq(xMinusH)} + ${sq(Y)} = ${n(conic.r * conic.r)}`;
    case 'ellipse':
      return `\\frac{${sq(xMinusH)}}{${n(conic.a * conic.a)}} + \\frac{${sq(Y)}}{${n(conic.b * conic.b)}} = 1`;
    case 'hyperbola': {
      const [first, second] = orientationOf(conic) === 'horizontal' ? [xMinusH, Y] : [Y, xMinusH];

      return `\\frac{${sq(first)}}{${n(conic.a * conic.a)}} - \\frac{${sq(second)}}{${n(conic.b * conic.b)}} = 1`;
    }
    case 'parabola': {
      const coefficient = isOne(conic.a) ? '' : (isOne(-conic.a) ? '-' : n(conic.a));
      if (orientationOf(conic) === 'vertical') {
        return `${line.vertical ? n(line.x) : 'x'} = ${coefficient}${sq(Y)}${isZero(h) ? '' : ` ${signed(h)}`}`;
      }
      const left = line.vertical ? 'y' : trinomial(0, line.slope, line.intercept, 'x');

      return `${left} = ${coefficient}${sq(xMinusH)}${isZero(k) ? '' : ` ${signed(k)}`}`;
    }
    default:
      return '';
  }
}

/**
 * Le déroulé de la résolution de `conic ∩ line`.
 *
 * @returns {{ok: true, steps: object[], key: string} | {ok: false, reason: string}}
 */
export function buildIntersectionSteps(conic, line) {
  if (!isValidConic(conic) || !I.isLine(line)) return { ok: false, reason: 'invalid' };
  const quadratic = I.lineConicQuadratic(conic, line);
  const engine = I.lineConicIntersection(conic, line);
  if (!quadratic || !engine) return { ok: false, reason: 'invalid' };
  const { a, b, c, variable: v } = quadratic;
  const other = v === 'x' ? 'y' : 'x';
  const solved = I.solveQuadratic(a, b, c);
  // Une racine écartée par le moteur (branche d'hyperbole) : on ne raconte pas
  // une résolution dont la conclusion différerait des points du plan.
  if (solved.roots.length !== engine.points.length) return { ok: false, reason: 'branch' };

  const steps = [
    {
      kind: 'system',
      textKey: `${K}.system`,
      latex: `\\begin{cases} ${canonicalLatex(conic)} \\\\ ${lineLatex(line)} \\end{cases}`,
    },
    {
      kind: 'substitute',
      textKey: line.vertical ? `${K}.substituteX` : `${K}.substituteY`,
      params: { v: `$${line.vertical ? 'x' : 'y'}$`, expr: `$${line.vertical ? n(line.x) : trinomial(0, line.slope, line.intercept, 'x')}$` },
      latex: substitutedLatex(conic, line),
    },
  ];

  if (solved.degenerate) {
    // Le terme en v² a disparu : une équation du premier degré, une seule solution.
    steps.push({
      kind: 'linear',
      textKey: `${K}.linear`,
      latex: `${trinomial(0, b, c, v)} = 0`,
    });
    steps.push({
      kind: 'roots',
      textKey: `${K}.linearRoot`,
      latex: !solved.roots.length ? '\\varnothing'
        : `${v} = ${isOne(b) ? '' : `\\dfrac{${n(-c)}}{${n(b)}} ${rel(solved.roots[0])} `}${r2(solved.roots[0])}`,
    });
  } else {
    const fractions = conic.kind === 'ellipse' || conic.kind === 'hyperbola';
    steps.push({
      kind: 'quadratic',
      textKey: fractions ? `${K}.expandClear` : `${K}.expand`,
      latex: `${trinomial(a, b, c, v)} = 0`,
    });
    const delta = b * b - 4 * a * c;
    steps.push({
      kind: 'discriminant',
      textKey: `${K}.discriminant`,
      latex: `\\Delta = b^2 - 4ac = ${paren(b)}^2 - 4 \\times ${paren(a)} \\times ${paren(c)} ${rel(delta, 4)} ${n(solved.classification === 'tangent' ? 0 : delta)}`,
    });
    if (solved.classification === 'secant') {
      steps.push({
        kind: 'roots',
        textKey: `${K}.twoRoots`,
        latex: `${v}_1 = \\dfrac{-b - \\sqrt{\\Delta}}{2a} ${rel(solved.roots[0])} ${r2(solved.roots[0])} \\qquad ${v}_2 = \\dfrac{-b + \\sqrt{\\Delta}}{2a} ${rel(solved.roots[1])} ${r2(solved.roots[1])}`,
      });
    } else if (solved.classification === 'tangent') {
      steps.push({
        kind: 'roots',
        textKey: `${K}.doubleRoot`,
        latex: `${v}_0 = \\dfrac{-b}{2a} ${rel(solved.roots[0])} ${r2(solved.roots[0])}`,
      });
    } else {
      steps.push({ kind: 'roots', textKey: `${K}.noRoot`, latex: '\\Delta < 0' });
    }
  }

  if (engine.points.length > 0) {
    const coordinate = (p) => (other === 'y' ? p.y : p.x);
    const rootOf = (p) => (v === 'x' ? p.x : p.y);
    steps.push({
      kind: 'otherCoordinate',
      textKey: line.vertical ? `${K}.otherFromVertical` : `${K}.otherFromLine`,
      params: { v: `$${other}$` },
      latex: engine.points.map((p, index) => {
        const sub = engine.points.length > 1 ? `_${index + 1}` : '_0';
        if (line.vertical) return `${other}${sub} = ${n(line.x)}`;
        const value = coordinate(p);
        const m = line.slope;
        const slopePart = isZero(m) ? '' : `${isOne(m) ? '' : (isOne(-m) ? '-' : `${n(m)} \\times `)}${paren(Number(rootOf(p).toFixed(4)))}`;
        const rhs = slopePart
          ? `${slopePart}${isZero(line.intercept) ? '' : ` ${signed(line.intercept)}`}`
          : n(line.intercept);

        return `${other}${sub} = ${rhs} ${rel(value)} ${r2(value)}`;
      }).join(' \\qquad '),
    });
  }

  steps.push({
    kind: 'result',
    tone: 'result',
    textKey: `tools.conics.lineParameters.intersections.${engine.classification}`,
    params: { n: engine.count },
    latex: engine.points.length
      ? engine.points.map((p) => `(${r2(p.x)}\\,;\\,${r2(p.y)})`).join(' \\qquad ')
      : '\\varnothing',
  });

  return { ok: true, steps, key: intersectionKey(conic, line) };
}

/** La question : la conique et la droite (tout changement de l'une ou l'autre la change). */
export function intersectionKey(conic, line) {
  const c = [conic.kind, conic.h, conic.k, conic.r, conic.a, conic.b, conic.orientation].join(',');
  const l = line.vertical ? `v${line.x}` : `${line.slope},${line.intercept}`;

  return `${c}|${l}`;
}
