/**
 * DE LA FORME DÉVELOPPÉE À LA FORME CANONIQUE — la complétion du carré,
 * mise en scène frame par frame sur le tableau partagé (`shared/mathBoard`).
 *
 * Logique PURE : aucune chaîne arabe, aucun React. Le moteur reste
 * `conicParser.js` : il a déjà lu l'équation en ses six coefficients et en a
 * tiré la conique. Ce module ne CALCULE rien que l'analyseur n'ait établi ; il
 * écrit les états intermédiaires que l'élève ferait au tableau, et son
 * dernier frame reprend la conique de l'analyseur (la seule source de vérité).
 *
 *     deux carrés   Ax² + Cy² + Dx + Ey + F = 0
 *       1. grouper les x, les y, le constant de l'autre côté
 *       2. mettre A, C en facteur (si ≠ 1)
 *       3. compléter le carré en x : x² + px = (x + p/2)² − (p/2)²
 *       4. … en y
 *       5. substituer et développer
 *       6. porter les constantes à droite (le geste de la balance)
 *       7. diviser (A pour un cercle, la constante pour ellipse/hyperbole)
 *       8. la forme canonique + centre, rayon / demi-axes     ← DERNIER
 *
 *     un seul carré  (parabole) : isoler y (ou x) → facteur → compléter →
 *       substituer → réunir les constantes → forme canonique + sommet
 *
 * Seules les saisies DÉVELOPPÉES sont déroulées (`isExpandedInput`) : une
 * saisie déjà canonique n'a rien à démontrer, et redévelopper ce que l'élève
 * a écrit factorisé pour le refactoriser serait un détour sans objet.
 */

import {
  tok, stateFrame, binaryOperationFrames, bothSidesFrames, resultFrame, rowLatex,
} from '../../shared/mathBoard/frames.js';
import { cleanNumber, orientationOf } from './conicMath.js';

const { abs } = Math;
const ZERO = 1e-9;
const isZero = (v) => abs(v) < ZERO;
const isOne = (v) => abs(v - 1) < ZERO;
const K = 'tools.conics.derivation.steps';

/** Un nombre en LaTeX : 4 décimales au plus (comme `formatCanonical`), virgule protégée. */
export function n(value) {
  const v = cleanNumber(value);
  const rounded = Number(v.toFixed(4));
  const text = abs(rounded) < 1e-12 ? '0' : String(rounded);

  return text.replace('.', '{,}');
}

/** Premier terme : `3x^2`, `x^2`, `-x^2`, `-2{,}5x`. */
function lead(c, sym) {
  if (!sym) return n(c);
  if (isOne(c)) return sym;
  if (isOne(-c)) return `-${sym}`;

  return `${n(c)}${sym}`;
}

/** Terme suivant : `+ 3x`, `- x`, `+ 4`. */
function signed(c, sym = '') {
  const sign = c < 0 ? '-' : '+';
  const m = abs(c);
  if (sym && isOne(m)) return `${sign} ${sym}`;

  return `${sign} ${n(m)}${sym}`;
}

/** `(x - 2)^2`, `(y + 3)^2`, `x^2` quand le décalage est nul. */
function shiftSq(v, h) {
  if (isZero(h)) return `${v}^2`;

  return `(${v} ${h > 0 ? '-' : '+'} ${n(abs(h))})^2`;
}

/** Le coefficient devant une parenthèse : ``, `-`, `4`. */
function prefix(c) {
  if (isOne(c)) return '';
  if (isOne(-c)) return '-';

  return n(c);
}

/** `\div 4`, `\div (-2)`. */
const divideBy = (d) => `\\div ${d < 0 ? `(${n(d)})` : n(d)}`;
const math = (latex) => `$${latex}$`;
const point = (x, y) => math(`(${n(x)}\\,;\\,${n(y)})`);

/**
 * La saisie est-elle DÉVELOPPÉE ? Ni parenthèse (une forme canonique en a),
 * ni quotient (`x²/9 + y²/4 = 1` est déjà canonique).
 */
export function isExpandedInput(text) {
  return typeof text === 'string' && /[xy]/i.test(text) && !/[()/÷]/.test(text);
}

/**
 * L'énoncé en LaTeX, tel que l'élève l'a tapé (après la normalisation du
 * tokeniseur). Rien d'autre qu'une liste blanche de caractères n'y entre.
 */
export function inputToLatex(text) {
  const normalized = String(text)
    .replace(/[−–—]/g, '-')
    .replace(/[×·*]/g, ' \\times ')
    .replace(/²/g, '^2')
    .replace(/[٫]/g, ',')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/X/g, 'x')
    .replace(/Y/g, 'y');
  if (!/^[0-9xy+\-=^.,\s\\times]*$/.test(normalized)) return null;

  return normalized.replace(/(\d)[.,](\d)/g, '$1{,}$2').replace(/\s+/g, ' ').trim();
}

/** La forme canonique en LaTeX, lue sur la conique de l'analyseur. */
export function canonicalLatex(conic) {
  const X = shiftSq('x', conic.h);
  const Y = shiftSq('y', conic.k);
  switch (conic.kind) {
    case 'circle':
      return `${X} + ${Y} = ${n(conic.r * conic.r)}`;
    case 'ellipse':
      return `\\frac{${X}}{${n(conic.a * conic.a)}} + \\frac{${Y}}{${n(conic.b * conic.b)}} = 1`;
    case 'hyperbola': {
      const horizontal = orientationOf(conic) === 'horizontal';
      const [first, second] = horizontal ? [X, Y] : [Y, X];

      return `\\frac{${first}}{${n(conic.a * conic.a)}} - \\frac{${second}}{${n(conic.b * conic.b)}} = 1`;
    }
    case 'parabola': {
      if (orientationOf(conic) === 'vertical') {
        return `x = ${prefix(conic.a)}${Y}${isZero(conic.h) ? '' : ` ${signed(conic.h)}`}`;
      }

      return `y = ${prefix(conic.a)}${X}${isZero(conic.k) ? '' : ` ${signed(conic.k)}`}`;
    }
    default:
      return '';
  }
}

/** Les frames d'une complétion du carré sur `v` (jetons `${v}2` et `${v}p` de `row`). */
function completionFrames(step, row, v, p) {
  const h = -p / 2;
  const half = h * h;

  return binaryOperationFrames({
    step,
    row,
    a: `${v}2`,
    b: `${v}p`,
    symbolLatex: `\\left(\\tfrac{${n(p)}}{2}\\right)^2 = ${n(half)}`,
    resultLatex: `${shiftSq(v, h)} - ${n(half)}`,
    settle: `${v}^2 ${signed(p, v)} = ${shiftSq(v, h)} - ${n(half)}`,
    texts: {
      select: { textKey: `${K}.completeSelect`, textParams: { square: math(`${v}^2`), linear: math(lead(p, v)), v: math(v) } },
      operate: { textKey: `${K}.completeOperate`, textParams: { v: math(v) } },
      result: { textKey: `${K}.completeResult`, textParams: { v: math(v) } },
    },
  });
}

/** Le bloc d'une variable dans la ligne factorisée : `x^2 - 4x`, `4(x^2 - 2x)`, `9y^2`. */
function blockTokens(v, sq, lin, first) {
  const lead0 = (latex) => (first ? latex : (latex.startsWith('-') ? `- ${latex.slice(1)}` : `+ ${latex}`));
  if (isZero(lin)) return [tok(`${v}B`, lead0(lead(sq, `${v}^2`)))];
  const p = lin / sq;
  if (isOne(sq)) return [tok(`${v}2`, lead0(`${v}^2`)), tok(`${v}p`, signed(p, v))];
  const open = first ? `${prefix(sq)}(` : `${sq < 0 ? '-' : '+'} ${isOne(abs(sq)) ? '' : n(abs(sq))}(`;

  return [tok(`${v}o`, open), tok(`${v}2`, `${v}^2`), tok(`${v}p`, signed(p, v)), tok(`${v}c`, ')')];
}

/** Deux carrés : cercle, ellipse, hyperbole. */
function twoSquares(general, conic) {
  const {
    A, C, D, E, F,
  } = general;
  const frames = [];
  let step = 0;
  const eq = tok('eq', '=');
  const R = tok('R', n(-F));

  // 1. Grouper.
  const groupX = isZero(D) ? lead(A, 'x^2') : `(${lead(A, 'x^2')} ${signed(D, 'x')})`;
  const groupYInner = isZero(E) ? null : `${lead(C, 'y^2')} ${signed(E, 'y')}`;
  const groupY = groupYInner ? `+ (${groupYInner})` : signed(C, 'y^2');
  frames.push(stateFrame({
    step: step++, rows: [[tok('g', `${groupX} ${groupY} = ${n(-F)}`)]], settle: `${groupX} ${groupY} = ${n(-F)}`, textKey: `${K}.group`,
  }));

  // 2. Facteur.
  const row = [...blockTokens('x', A, D, true), ...blockTokens('y', C, E, false), eq, R];
  const needsFactor = (!isZero(D) && !isOne(A)) || (!isZero(E) && !isOne(C));
  if (needsFactor) {
    frames.push(stateFrame({ step: step++, rows: [row], settle: rowLatex(row), textKey: `${K}.factor` }));
  }

  // 3–4. Compléter les carrés.
  const h = isZero(D) ? 0 : -D / (2 * A);
  const k = isZero(E) ? 0 : -E / (2 * C);
  if (!isZero(D)) frames.push(...completionFrames(step++, row, 'x', D / A));
  if (!isZero(E)) frames.push(...completionFrames(step++, row, 'y', E / C));

  // 5. Substituer et développer.
  const X = tok('X', `${prefix(A)}${shiftSq('x', h)}`);
  const Yl = `${prefix(C)}${shiftSq('y', k)}`;
  const Y = tok('Y', Yl.startsWith('-') ? `- ${Yl.slice(1)}` : `+ ${Yl}`);
  const cxValue = -A * h * h;
  const cyValue = -C * k * k;
  const left = [X];
  if (!isZero(cxValue)) left.push(tok('cx', signed(cxValue)));
  left.push(Y);
  if (!isZero(cyValue)) left.push(tok('cy', signed(cyValue)));
  const completed = !isZero(D) || !isZero(E);
  if (completed) {
    const substituted = [...left, eq, R];
    frames.push(stateFrame({ step: step++, rows: [substituted], settle: rowLatex(substituted), textKey: `${K}.substitute` }));
  }

  // 6. Porter les constantes à droite.
  const S = -(cxValue + cyValue);
  const constant = S - F;
  const Kt = tok('K', n(constant), 'result');
  if (!isZero(S)) {
    const op = signed(S);
    const targets = left.filter((token) => token.id === 'cx' || token.id === 'cy').map((token) => token.id);
    const after = [X, Y, eq, Kt];
    frames.push(...bothSidesFrames({
      step: step++,
      left,
      relation: eq,
      right: [R],
      targets,
      opLatex: op,
      applied: [...left, tok('opl', op, 'operation'), eq, R, tok('opr', op, 'operation')],
      after,
      settle: rowLatex(after),
      texts: {
        select: { textKey: `${K}.moveSelect` },
        apply: { textKey: `${K}.moveApply`, textParams: { op: math(op) } },
        write: { textKey: `${K}.moveWrite` },
        simplify: { textKey: `${K}.moveSimplify` },
      },
    }));
  }

  // 7. Diviser.
  const Xbare = shiftSq('x', h);
  const Ybare = shiftSq('y', k);
  if (conic.kind === 'circle') {
    if (!isOne(A)) {
      const after = [tok('X', Xbare), tok('Y', `+ ${Ybare}`), eq, tok('K', n(constant / A), 'result')];
      frames.push(...bothSidesFrames({
        step: step++,
        left: [X, Y],
        relation: eq,
        right: [Kt],
        opLatex: divideBy(A),
        applied: [tok('X', `\\frac{${X.latex}}{${n(A)}}`), tok('Y', `+ \\frac{${Yl}}{${n(A)}}`), eq, tok('K', `\\frac{${n(constant)}}{${n(A)}}`)],
        after,
        settle: rowLatex(after),
        texts: {
          apply: { textKey: `${K}.divideApply`, textParams: { d: math(n(A)) } },
          write: { textKey: `${K}.divideWrite` },
          simplify: { textKey: `${K}.divideSimplify` },
        },
      }));
    }
  } else if (!isOne(constant)) {
    const qa = constant / A;
    const qc = constant / C;
    const fracTerm = (bare, q, first) => {
      const body = `\\frac{${bare}}{${n(abs(q))}}`;
      if (first) return q < 0 ? `-${body}` : body;

      return `${q < 0 ? '-' : '+'} ${body}`;
    };
    const after = [tok('X', fracTerm(Xbare, qa, true)), tok('Y', fracTerm(Ybare, qc, false)), eq, tok('K', '1', 'result')];
    frames.push(...bothSidesFrames({
      step: step++,
      left: [X, Y],
      relation: eq,
      right: [Kt],
      opLatex: divideBy(constant),
      applied: [
        tok('X', `\\frac{${X.latex}}{${n(constant)}}`),
        tok('Y', `${Yl.startsWith('-') ? '-' : '+'} \\frac{${Yl.replace(/^-/, '')}}{${n(constant)}}`),
        eq,
        tok('K', `\\frac{${n(constant)}}{${n(constant)}}`),
      ],
      after,
      settle: rowLatex(after),
      texts: {
        apply: { textKey: `${K}.divideToOne`, textParams: { d: math(n(constant)) } },
        write: { textKey: `${K}.divideWrite` },
        simplify: { textKey: `${K}.divideSimplify` },
      },
    }));
  }

  return { frames, transforming: frames.length > 1 };
}

/**
 * Un seul carré : parabole. `u` est la variable au carré, `w` celle qu'on isole.
 *   Aq·u² + Du·u + Ew·w + F = 0  →  w = a·u² + b·u + c
 */
function oneSquare(general, conic) {
  const squaredIsX = orientationOf(conic) === 'horizontal';
  const u = squaredIsX ? 'x' : 'y';
  const w = squaredIsX ? 'y' : 'x';
  const Aq = squaredIsX ? general.A : general.C;
  const Du = squaredIsX ? general.D : general.E;
  const Ew = squaredIsX ? general.E : general.D;
  const { F } = general;
  const a = -Aq / Ew;
  const b = -Du / Ew;
  const c = -F / Ew;
  const frames = [];
  let step = 0;
  const eq = tok('eq', '=');
  const W = tok('W', w);
  const poly = (qa, qb, qc) => [lead(qa, `${u}^2`), isZero(qb) ? '' : signed(qb, u), isZero(qc) ? '' : signed(qc)].filter(Boolean).join(' ');

  // 1. Isoler w.
  let transforming = false;
  if (isOne(Ew)) {
    frames.push(stateFrame({
      step: step++, rows: [[W, eq, tok('rhs', poly(a, b, c))]], settle: `${w} = ${poly(a, b, c)}`, textKey: `${K}.isolate`, textParams: { v: math(w) },
    }));
  } else {
    const Ewt = tok('Ew', lead(Ew, w));
    const rhs = tok('rhs', poly(-Aq, -Du, -F));
    frames.push(stateFrame({
      step: step++, rows: [[Ewt, eq, rhs]], settle: rowLatex([Ewt, eq, rhs]), textKey: `${K}.isolate`, textParams: { v: math(w) },
    }));
    const after = [W, eq, tok('rhs', poly(a, b, c), 'result')];
    frames.push(...bothSidesFrames({
      step: step++,
      left: [Ewt],
      relation: eq,
      right: [rhs],
      opLatex: divideBy(Ew),
      applied: [tok('Ew', `\\frac{${Ewt.latex}}{${n(Ew)}}`), eq, tok('rhs', `\\frac{${poly(-Aq, -Du, -F)}}{${n(Ew)}}`)],
      after,
      settle: rowLatex(after),
      texts: {
        apply: { textKey: `${K}.divideApply`, textParams: { d: math(n(Ew)) } },
        write: { textKey: `${K}.divideWrite` },
        simplify: { textKey: `${K}.divideSimplify` },
      },
    }));
    transforming = true;
  }

  if (isZero(b)) return { frames, transforming };
  transforming = true;

  // 2. Facteur.
  const p = b / a;
  const open = isOne(a) ? [] : [tok('uo', `${prefix(a)}(`)];
  const close = isOne(a) ? [] : [tok('uc', ')')];
  const cTok = isZero(c) ? [] : [tok('c', signed(c))];
  const row = [W, eq, ...open, tok(`${u}2`, `${u}^2`), tok(`${u}p`, signed(p, u)), ...close, ...cTok];
  if (!isOne(a)) frames.push(stateFrame({ step: step++, rows: [row], settle: rowLatex(row), textKey: `${K}.factorOne` }));

  // 3. Compléter.
  frames.push(...completionFrames(step++, row, u, p));

  // 4. Substituer et développer.
  const h = -p / 2;
  const cuValue = -a * h * h;
  const Ut = tok('U', `${prefix(a)}${shiftSq(u, h)}`);
  const substituted = [W, eq, Ut, tok('cu', signed(cuValue)), ...cTok];
  frames.push(stateFrame({ step: step++, rows: [substituted], settle: rowLatex(substituted), textKey: `${K}.substitute` }));

  // 5. Réunir les constantes.
  if (!isZero(c)) {
    const k = cuValue + c;
    const settled = isZero(k) ? `${w} = ${Ut.latex}` : `${w} = ${Ut.latex} ${signed(k)}`;
    frames.push(...binaryOperationFrames({
      step: step++,
      row: substituted,
      a: 'cu',
      b: 'c',
      symbolLatex: '+',
      resultLatex: signed(k),
      settle: settled,
      texts: {
        select: { textKey: `${K}.combineSelect` },
        operate: { textKey: `${K}.combineOperate` },
        result: { textKey: `${K}.combineResult` },
      },
    }));
  }

  return { frames, transforming };
}

/** La phrase du résultat : nature et éléments, lus sur la conique de l'analyseur. */
function resultText(conic) {
  const center = point(conic.h, conic.k);
  switch (conic.kind) {
    case 'circle':
      return { textKey: `${K}.resultCircle`, textParams: { center, r: math(`r = ${n(conic.r)}`) } };
    case 'ellipse':
      return { textKey: `${K}.resultEllipse`, textParams: { center, a: math(`a = ${n(conic.a)}`), b: math(`b = ${n(conic.b)}`) } };
    case 'hyperbola':
      return { textKey: `${K}.resultHyperbola`, textParams: { center, a: math(`a = ${n(conic.a)}`), b: math(`b = ${n(conic.b)}`) } };
    default:
      return { textKey: `${K}.resultParabola`, textParams: { vertex: center } };
  }
}

/**
 * Les frames du passage développée → canonique.
 *
 * @param {string} source  ce que l'élève a tapé
 * @param {{ok: boolean, general: object, conic: object}} parsed  le résultat de `parseConicEquation(source)`
 * @returns {{ok: true, frames: object[], problem: string} | {ok: false, reason: string}}
 */
export function buildCanonicalFrames(source, parsed) {
  if (!parsed?.ok || !parsed.general || !parsed.conic) return { ok: false, reason: 'unparsed' };
  if (!isExpandedInput(source)) return { ok: false, reason: 'notExpanded' };
  const problem = inputToLatex(source);
  if (!problem) return { ok: false, reason: 'notExpanded' };

  const { conic, general } = parsed;
  const built = conic.kind === 'parabola' ? oneSquare(general, conic) : twoSquares(general, conic);
  // Rien à transformer (`x² + y² = 9`, `y = x²`) : la saisie EST déjà la forme canonique.
  if (!built.transforming) return { ok: false, reason: 'alreadyCanonical' };

  const lastStep = built.frames.length ? built.frames[built.frames.length - 1].step + 1 : 0;
  const final = canonicalLatex(conic);
  const frames = [
    ...built.frames,
    resultFrame({ step: lastStep, row: [tok('canon', final, 'result')], settle: final, ...resultText(conic) }),
  ];

  return { ok: true, frames, problem };
}
