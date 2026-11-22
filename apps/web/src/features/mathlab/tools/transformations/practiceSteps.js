/**
 * « أرني » — LA SOLUTION D'UNE QUESTION D'ENTRAÎNEMENT, PAS À PAS (logique pure).
 *
 * Exigence de la propriétaire (2026-09-30) : une solution ne tombe jamais
 * d'un bloc. Quand l'élève demande la réponse (§38 – §40), l'instrument ne
 * pose plus A′ d'un coup : il REFAIT le calcul, transformation après
 * transformation, comme au tableau :
 *
 *     pour chaque pas de l'énoncé
 *       1. la RÈGLE en coordonnées de ce pas     (x ; y) ⟼ (−y ; x)
 *       2. la SUBSTITUTION des coordonnées       (−(2) ; 3)
 *       3. l'IMAGE obtenue                       A₁(−2 ; 3)   … la dernière est A′
 *
 * La dernière image EST la réponse (`challenge.answer`) : c'est le DERNIER
 * pas, jamais le premier. Chaque image est calculée par le moteur
 * (`applySteps`, la même fonction qui juge la réponse) ; la règle écrite
 * n'est employée que si elle redonne EXACTEMENT ce point — sinon la formule
 * affine générale (x′ = ax + cy + e) la remplace. Un texte ne peut donc
 * jamais contredire la figure.
 *
 * Aucune chaîne traduite ici : chaque pas porte une clé
 * (`tools.transformations.practice.solution.<kind>`), ses paramètres et son
 * LaTeX. Le composant habille.
 */

import * as M from './transformMath.js';
import { coordinateFormula, matrixFor } from './transformModel.js';
import { applySteps, describeChallengeStep } from './practice.js';

/** Un nombre en LaTeX : virgule décimale du manuel, `-` que KaTeX transforme en vrai moins. */
export function latexNumber(value) {
  const clean = M.cleanNumber(value, 6);
  const text = String(Math.abs(clean) < 1e-12 ? 0 : clean);

  return text.replace('.', '{,}');
}

/** Un nombre SUBSTITUÉ à une lettre : entre parenthèses s'il est négatif — c'est là que le signe se perd. */
function wrap(value) {
  const text = latexNumber(value);

  return text.startsWith('-') ? `(${text})` : text;
}

/** L'opposé d'une lettre ou d'un nombre substitué : « −y », « −(−3) », « −(2) ». */
function neg(term) {
  return /^[a-z(]/.test(term) ? `-${term}` : `-(${term})`;
}

/** `term + v` / `term - |v|` : jamais « + −3 ». */
function plus(term, value) {
  if (M.cleanNumber(value, 6) === 0) return term;

  return value < 0 ? `${term} - ${latexNumber(-value)}` : `${term} + ${latexNumber(value)}`;
}

/**
 * Les règles EXACTES du manuel, par clé de `coordinateFormula`. Chacune dit
 * les deux coordonnées de l'image en fonction de lettres (`X`, `Y`) qui
 * valent `x`/`y` pour la règle et les nombres substitués ensuite, et sait
 * les calculer (`at`) pour être confrontée au moteur.
 */
const RULES = {
  translation: ({ a, b }) => ({
    x: (X) => plus(X, a), y: (X, Y) => plus(Y, b), at: (p) => ({ x: p.x + a, y: p.y + b }),
  }),
  rotation0: () => ({ x: (X) => X, y: (X, Y) => Y, at: (p) => ({ x: p.x, y: p.y }) }),
  rotation90: () => ({ x: (X, Y) => neg(Y), y: (X) => X, at: (p) => ({ x: -p.y, y: p.x }) }),
  rotation180: () => ({ x: (X) => neg(X), y: (X, Y) => neg(Y), at: (p) => ({ x: -p.x, y: -p.y }) }),
  rotation270: () => ({ x: (X, Y) => Y, y: (X) => neg(X), at: (p) => ({ x: p.y, y: -p.x }) }),
  reflectX: () => ({ x: (X) => X, y: (X, Y) => neg(Y), at: (p) => ({ x: p.x, y: -p.y }) }),
  reflectY: () => ({ x: (X) => neg(X), y: (X, Y) => Y, at: (p) => ({ x: -p.x, y: p.y }) }),
  reflectOrigin: () => ({ x: (X) => neg(X), y: (X, Y) => neg(Y), at: (p) => ({ x: -p.x, y: -p.y }) }),
  reflectDiagonal: () => ({ x: (X, Y) => Y, y: (X) => X, at: (p) => ({ x: p.y, y: p.x }) }),
  reflectAntidiagonal: () => ({ x: (X, Y) => neg(Y), y: (X) => neg(X), at: (p) => ({ x: -p.y, y: -p.x }) }),
  reflectHorizontal: ({ c }) => ({
    x: (X) => X, y: (X, Y) => `2 \\times ${wrap(c)} - ${Y}`, at: (p) => ({ x: p.x, y: 2 * c - p.y }),
  }),
  reflectVertical: ({ c }) => ({
    x: (X) => `2 \\times ${wrap(c)} - ${X}`, y: (X, Y) => Y, at: (p) => ({ x: 2 * c - p.x, y: p.y }),
  }),
  dilationOrigin: ({ k }) => ({
    x: (X) => `${wrap(k)} \\times ${X}`, y: (X, Y) => `${wrap(k)} \\times ${Y}`, at: (p) => ({ x: k * p.x, y: k * p.y }),
  }),
  dilationCenter: ({ k, cx, cy }) => ({
    x: (X) => `${latexNumber(cx)} + ${wrap(k)} \\times (${plus(X, -cx)})`,
    y: (X, Y) => `${latexNumber(cy)} + ${wrap(k)} \\times (${plus(Y, -cy)})`,
    at: (p) => ({ x: cx + k * (p.x - cx), y: cy + k * (p.y - cy) }),
  }),
};

/** La formule affine générale, pour tout pas sans règle de manuel (rotation d'angle quelconque…). */
function affineRule(matrix) {
  const term = (coefficient, letter) => {
    const c = M.cleanNumber(coefficient, 6);
    if (c === 0) return null;
    if (c === 1) return letter;
    if (c === -1) return `-${letter}`;

    return `${latexNumber(c)} \\times ${letter}`;
  };
  const line = (p, q, r) => (X, Y) => {
    const parts = [term(p, X), term(q, Y)].filter(Boolean);
    const head = parts.length ? parts.join(' + ').replace(/\+ -/g, '- ') : '0';

    return parts.length ? plus(head, r) : latexNumber(r);
  };

  return {
    x: line(matrix.a, matrix.c, matrix.e),
    y: line(matrix.b, matrix.d, matrix.f),
    at: (p) => M.applyMatrix(matrix, p),
  };
}

/** Le nom de la i-ème image : A → A₁ → A₂ … et la dernière A′. */
export function imageName(index, count, base = 'A') {
  return index === count - 1 ? `${base}'` : `${base}_{${index + 1}}`;
}

/** Le même nom, en texte (pour une phrase arabe, où il sera isolé). */
function plainName(index, count, base = 'A') {
  return index === count - 1 ? `${base}′` : `${base}${String(index + 1).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d])}`;
}

const pointLatex = (name, p) => `${name}(${latexNumber(p.x)} \\;;\\; ${latexNumber(p.y)})`;

/**
 * La solution de `challenge` ({ point, steps, answer }) en pas révélables.
 *
 * @returns {{ ok: boolean, steps: Array<{
 *   kind: 'rule'|'substitute'|'image'|'result', textKey: string, params: object,
 *   describe?: {key: string, params: object}|null, latex: string, point?: {x,y}
 * }> }}
 *   Trois pas par transformation ; le dernier (`kind: 'result'`) est A′,
 *   égal à `challenge.answer`.
 */
export function buildRevealSteps(challenge) {
  const transformations = Array.isArray(challenge?.steps) ? challenge.steps.filter((step) => step && step.enabled !== false) : [];
  if (!M.isPoint(challenge?.point) || transformations.length === 0) return { ok: false, steps: [] };

  const steps = [];
  let current = { x: challenge.point.x, y: challenge.point.y };
  let currentLatexName = 'A';
  let currentPlainName = 'A';
  const count = transformations.length;

  transformations.forEach((step, index) => {
    const matrix = matrixFor(step, [current]);
    const image = applySteps(current, [step]);
    if (!matrix || !M.isPoint(image)) return;

    const formula = coordinateFormula(step, [current]);
    const textbook = formula && RULES[formula.key] ? RULES[formula.key](formula.params) : null;
    // La règle du manuel n'est gardée que si elle REDONNE l'image du moteur.
    const rule = textbook && M.samePoint(textbook.at(current), image, 1e-6) ? textbook : affineRule(matrix);

    const name = imageName(index, count);
    const plain = plainName(index, count);
    const last = index === count - 1;
    const X = wrap(current.x);
    const Y = wrap(current.y);

    steps.push({
      kind: 'rule',
      textKey: count > 1 ? 'practice.solution.ruleOf' : 'practice.solution.rule',
      params: { index: index + 1, count },
      describe: describeChallengeStep(step, [current]),
      latex: `(x \\;;\\; y) \\longmapsto (${rule.x('x', 'y')} \\;;\\; ${rule.y('x', 'y')})`,
    });
    steps.push({
      kind: 'substitute',
      textKey: 'practice.solution.substitute',
      params: { point: `${currentPlainName}(${plainNumber(current.x)} ; ${plainNumber(current.y)})` },
      latex: `${pointLatex(currentLatexName, current)} \\longmapsto (${rule.x(X, Y)} \\;;\\; ${rule.y(X, Y)})`,
    });
    steps.push({
      kind: last ? 'result' : 'image',
      textKey: last ? 'practice.solution.result' : 'practice.solution.image',
      params: { from: currentPlainName, to: plain },
      latex: pointLatex(name, image),
      point: image,
    });

    current = image;
    currentLatexName = name;
    currentPlainName = plain;
  });

  return { ok: steps.length > 0, steps };
}

/** Un nombre pour une phrase (virgule, vrai moins) — il sera isolé en LTR par le composant. */
function plainNumber(value) {
  return latexNumber(value).replace('{,}', ',').replace(/^-/, '−');
}
