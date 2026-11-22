/**
 * Les FONCTIONS PRÊTES du مختبر التحليل (§37).
 *
 * §37 pose une contrainte qui prime sur la générosité : « Only expose
 * functions appropriate to the user's curriculum/context. » On classe donc
 * chaque préréglage par NIVEAU, et l'interface montre d'abord ceux du
 * programme de 4AM — les fonctions linéaire et affine (LP 3.7, 3.8) — puis,
 * derrière un repli, celles du lycée.
 *
 * `focus` dit sur QUEL laboratoire la fonction s'ouvre le mieux : une
 * fonction avec un pôle est faite pour les limites, une parabole pour la
 * variation, une racine pour l'intégrale. Choisir un préréglage n'est donc
 * pas seulement changer f : c'est entrer dans l'expérience qui lui va.
 */

/** @typedef {{id: string, source: string, level: 'programme'|'beyond', focus: string, view?: object}} AnalysisPreset */

/** @type {ReadonlyArray<AnalysisPreset>} */
export const PRESETS = Object.freeze([
  // ── Le programme de 4AM : la fonction affine et sa pente ────────────────
  {
    id: 'affine', source: '2x+1', level: 'programme', focus: 'secant',
    view: { xMin: -2, xMax: 6, yMin: -2, yMax: 9 },
  },
  {
    id: 'linear', source: '3x', level: 'programme', focus: 'secant',
    view: { xMin: -5, xMax: 5, yMin: -8, yMax: 8 },
  },
  {
    id: 'decreasingAffine', source: '5-2x', level: 'programme', focus: 'secant',
    view: { xMin: -3, xMax: 7, yMin: -6, yMax: 8 },
  },

  // ── Au-delà du programme : elles existent, mais jamais en première page ──
  {
    id: 'square', source: 'x^2', level: 'beyond', focus: 'tangent',
    view: { xMin: -4, xMax: 4, yMin: -1, yMax: 9 },
  },
  {
    id: 'parabola', source: 'x^2-4x+3', level: 'beyond', focus: 'study',
    view: { xMin: -2, xMax: 6, yMin: -3, yMax: 6 },
  },
  {
    id: 'cubic', source: 'x^3-3x', level: 'beyond', focus: 'derivative',
    view: { xMin: -3, xMax: 3, yMin: -4, yMax: 4 },
  },
  {
    id: 'inverse', source: '\\frac{1}{x}', level: 'beyond', focus: 'limit',
    view: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  },
  {
    id: 'hole', source: '\\frac{x^2-1}{x-1}', level: 'beyond', focus: 'limit',
    view: { xMin: -3, xMax: 5, yMin: -2, yMax: 6 },
  },
  {
    id: 'rational', source: '\\frac{2x+1}{x-3}', level: 'beyond', focus: 'limit',
    view: { xMin: -6, xMax: 12, yMin: -8, yMax: 10 },
  },
  {
    id: 'root', source: '\\sqrt{x}', level: 'beyond', focus: 'integral',
    view: { xMin: -1.5, xMax: 9, yMin: -2.5, yMax: 8 },
  },
  {
    id: 'sine', source: '\\sin(x)', level: 'beyond', focus: 'integral',
    /**
     * UNE période, pas trois.
     *
     * Le repère est ORTHONORMÉ : une fenêtre plate (x ∈ [−7 ; 7], y ∈ [−2 ; 2])
     * se fait élargir en y jusqu'à ±6,5, et l'onde n'occupe plus qu'un tiers
     * de la hauteur — la QA visuelle l'a vu sur sin de 0 à 2π. Élargir y ne
     * sert à rien ; c'est x qu'il faut resserrer. Sur [−0,6 ; 7] on voit une
     * période entière, assez grande pour qu'on y pose des bornes.
     */
    view: { xMin: -0.6, xMax: 7, yMin: -3.4, yMax: 3.4 },
  },
  {
    id: 'absolute', source: '\\left|x\\right|', level: 'beyond', focus: 'derivative',
    view: { xMin: -4, xMax: 4, yMin: -2, yMax: 6 },
  },
  {
    id: 'exponential', source: 'e^x', level: 'beyond', focus: 'derivative',
    view: { xMin: -4, xMax: 4, yMin: -1, yMax: 9 },
  },
  {
    id: 'logarithm', source: '\\ln(x)', level: 'beyond', focus: 'study',
    view: { xMin: -1, xMax: 8, yMin: -4, yMax: 4 },
  },
]);

export function getPreset(id) {
  return PRESETS.find((preset) => preset.id === id) ?? null;
}

/**
 * Les fonctions À PARAMÈTRES (§24) : l'élève tire a, b, c et regarde la
 * courbe se transformer. Les bornes sont choisies pour que le curseur
 * traverse un CHANGEMENT DE NATURE (a qui passe par 0, un discriminant qui
 * change de signe), jamais pour couvrir un intervalle par symétrie.
 */
export const PARAMETRIC_PRESETS = Object.freeze([
  {
    id: 'affineParam', source: 'ax+b', level: 'programme',
    parameters: [
      { name: 'a', value: 1, min: -4, max: 4, step: 0.1 },
      { name: 'b', value: 0, min: -5, max: 5, step: 0.1 },
    ],
    view: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
  },
  {
    id: 'quadraticParam', source: 'ax^2+bx+c', level: 'beyond',
    parameters: [
      { name: 'a', value: 1, min: -3, max: 3, step: 0.1 },
      { name: 'b', value: 0, min: -6, max: 6, step: 0.1 },
      { name: 'c', value: 0, min: -6, max: 6, step: 0.1 },
    ],
    view: { xMin: -6, xMax: 6, yMin: -6, yMax: 8 },
  },
  {
    id: 'sineParam', source: 'a\\sin(bx)+c', level: 'beyond',
    parameters: [
      { name: 'a', value: 1, min: -3, max: 3, step: 0.1 },
      { name: 'b', value: 1, min: -3, max: 3, step: 0.1 },
      { name: 'c', value: 0, min: -4, max: 4, step: 0.1 },
    ],
    view: { xMin: -7, xMax: 7, yMin: -6, yMax: 6 },
  },
]);

/**
 * Les TRANSFORMATIONS de §25 : f(x) + k, f(x − k), a·f(x), f(ax), −f(x), f(−x).
 *
 * Chacune est une réécriture de la SOURCE de l'élève, pas une fonction
 * nouvelle : c'est ce qui permet à l'original de rester visible à côté de son
 * image, comme §25 l'exige.
 */
export const TRANSFORMATIONS = Object.freeze([
  { id: 'verticalShift', apply: (source, k) => `(${source})+(${k})`, defaultValue: 1 },
  { id: 'horizontalShift', apply: (source, k) => substituteX(source, `(x-(${k}))`), defaultValue: 1 },
  { id: 'verticalScale', apply: (source, k) => `(${k})*(${source})`, defaultValue: 2 },
  { id: 'horizontalScale', apply: (source, k) => substituteX(source, `((${k})*x)`), defaultValue: 2 },
  { id: 'reflectX', apply: (source) => `-(${source})`, defaultValue: 1 },
  { id: 'reflectY', apply: (source) => substituteX(source, '(-x)'), defaultValue: 1 },
]);

export function getTransformation(id) {
  return TRANSFORMATIONS.find((entry) => entry.id === id) ?? null;
}

/**
 * Remplace la variable `x` par une expression, SANS toucher aux lettres des
 * noms de fonctions (`\exp`, `\max`) ni aux commandes LaTeX.
 *
 * On ne peut pas faire un simple `replaceAll('x', …)` : `\exp(x)` deviendrait
 * `\e(-x)p(-x)`. On saute donc toute commande `\mot`, et on ne remplace un
 * `x` que s'il n'est pas collé à une autre lettre — c'est exactement la règle
 * que le lexeur du grapheur applique pour distinguer `x` de `exp`.
 */
export function substituteX(source, replacement) {
  const text = String(source ?? '');
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\') {
      // Une commande LaTeX : on la recopie entière, sans y toucher.
      let j = i + 1;
      while (j < text.length && /[a-zA-Z]/.test(text[j])) j += 1;
      out += text.slice(i, Math.max(j, i + 2));
      i = Math.max(j, i + 2);
      continue;
    }
    if (ch === 'x') {
      const before = text[i - 1] ?? '';
      const after = text[i + 1] ?? '';
      const glued = /[a-zA-Z]/.test(before) || /[a-zA-Z]/.test(after);
      out += glued ? ch : replacement;
      i += 1;
      continue;
    }
    out += ch;
    i += 1;
  }

  return out;
}
