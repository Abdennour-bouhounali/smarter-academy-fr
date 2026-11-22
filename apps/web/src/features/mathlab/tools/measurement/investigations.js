/**
 * Les ENQUÊTES du مختبر القياس — le catalogue déclaratif.
 *
 * §17 exige une primitive réutilisable plutôt que dix interfaces codées à la
 * main. Une enquête est donc une DONNÉE : l'objet qu'on manipule, ses
 * poignées, ce qu'on peut mesurer dessus, la grandeur cherchée, les indices,
 * et la relation que l'instrument reconnaîtra comme trouvée.
 *
 *     objet manipulable  →  `stage` + `handles` + `build(params)`
 *     ce qu'on mesure    →  `quantities` (clé, symbole, ce qui la calcule)
 *     ce qu'on cherche   →  `target`
 *     comment on aide    →  `hints` (trois paliers, jamais la réponse)
 *     ce qu'on cherchait →  `solution` (la relation, JAMAIS affichée avant §23)
 *
 * Ajouter une onzième enquête = une entrée ici. Aucun composant à écrire
 * tant qu'elle réutilise une scène existante (rectangle, triangle, cercle,
 * pavé, segment).
 *
 * ── Le secret (§23) ─────────────────────────────────────────────────────
 * `solution` vit dans ce fichier parce qu'il faut bien que l'instrument
 * sache reconnaître la règle quand l'élève la construit. Il n'est JAMAIS
 * rendu à l'écran avant que `stage` de l'enquête n'ait atteint `found` —
 * `investigationSecretKeys()` liste ce que l'interface n'a pas le droit de
 * lire, et `investigations.test.js` vérifie qu'aucun libellé i18n d'une
 * enquête non résolue ne contient sa formule.
 */

import * as M from './measureMath.js';
import * as R from './ruleEngine.js';

/** Les familles de scène — chacune a UN composant, réutilisé par plusieurs enquêtes. */
export const STAGES = Object.freeze(['rectangle', 'triangle', 'circle', 'cuboid', 'segment']);

/**
 * Une grandeur mesurable : sa clé (celle des colonnes du tableau et des
 * variables de la règle), son symbole mathématique, son unité, et la
 * fonction qui la MESURE sur l'objet courant.
 *
 * `role` dit ce que l'interface en fait :
 *   - `input`   une dimension que l'élève règle (elle a une poignée) ;
 *   - `derived` une mesure que l'instrument prend pour lui (l'aire comptée) ;
 *   - `target`  la grandeur cherchée — la colonne de droite du tableau.
 *
 * `inRule: false` retire une colonne du constructeur de règles. C'est le
 * cas de toute colonne CALCULÉE À PARTIR DE LA CIBLE : C ÷ d, A ÷ r², le
 * côté c = √(c²). Elle se lit dans le tableau (c'est elle qui montre π
 * stable), mais une règle qui s'en sert est une tautologie —
 * (C ÷ d) × d vaut C sur N'IMPORTE QUEL objet, sans rien avoir découvert.
 */
const quantity = (key, symbol, role, measure, options = {}) => Object.freeze({
  key, symbol, role, measure, decimals: options.decimals ?? 2, unit: options.unit ?? 'length',
  inRule: options.inRule ?? true,
});

/**
 * Le socle commun d'une enquête. `defineInvestigation` valide au CHARGEMENT
 * du module, comme `defineMathLabTool` : une enquête incomplète échoue au
 * démarrage des tests, pas au premier clic d'un élève.
 */
function defineInvestigation(definition) {
  const required = ['id', 'stage', 'params', 'quantities', 'target', 'solution', 'hintCount'];
  for (const key of required) {
    if (definition[key] === undefined) {
      throw new Error(`[measurement] l'enquête « ${definition.id ?? '?'} » n'a pas de « ${key} »`);
    }
  }
  if (!STAGES.includes(definition.stage)) {
    throw new Error(`[measurement] scène inconnue « ${definition.stage} » pour « ${definition.id} »`);
  }
  const keys = definition.quantities.map((q) => q.key);
  if (!keys.includes(definition.target)) {
    throw new Error(`[measurement] la cible « ${definition.target} » de « ${definition.id} » n'est pas mesurée`);
  }
  if (new Set(keys).size !== keys.length) {
    throw new Error(`[measurement] grandeurs en double dans « ${definition.id} »`);
  }

  return Object.freeze({ evidence: DEFAULT_EVIDENCE, ...definition });
}

/**
 * La PREUVE exigée avant qu'une conjecture soit retenue (§25).
 *
 * Trois observations, dont deux au moins qui diffèrent sur chaque dimension
 * réglable, et un essai sur un objet que l'élève n'a pas choisi. C'est ce
 * qui empêche de valider « A = L × l » après avoir mesuré trois fois un
 * carré de côté 2 — où L + l et L × l donnent la même chose.
 */
const DEFAULT_EVIDENCE = Object.freeze({ minObservations: 3, minDistinct: 2, requiresUnseenTest: true });

// ── Les paramètres réglables d'un objet ──────────────────────────────────

/** Une dimension réglable : bornes, pas, valeur d'ouverture. */
const param = (key, min, max, step, initial) => Object.freeze({ key, min, max, step, initial });

// ─────────────────────────────────────────────────────────────────────────
// §5 — L'aire du rectangle
// ─────────────────────────────────────────────────────────────────────────

const rectangleArea = defineInvestigation({
  id: 'rectangle-area',
  stage: 'rectangle',
  concept: 'area',
  params: [param('length', 1, 12, 1, 5), param('width', 1, 9, 1, 3)],
  unitGrid: true,
  quantities: [
    quantity('length', 'L', 'input', (p) => p.length, { decimals: 0 }),
    quantity('width', 'l', 'input', (p) => p.width, { decimals: 0 }),
    quantity('area', 'A', 'target', (p) => M.rectangleArea(p.length, p.width), { decimals: 0, unit: 'area' }),
  ],
  target: 'area',
  hintCount: 3,
  // La relation cherchée. Jamais affichée avant la découverte (§23).
  solution: R.operation('*', R.variable('length'), R.variable('width')),
  // Ce que la manipulation finale explique (§21) : une ligne de L carrés,
  // répétée l sur l fois.
  explanation: 'rows',
});

// ─────────────────────────────────────────────────────────────────────────
// §8 — Le périmètre du rectangle
// ─────────────────────────────────────────────────────────────────────────

const rectanglePerimeter = defineInvestigation({
  id: 'rectangle-perimeter',
  stage: 'rectangle',
  concept: 'perimeter',
  params: [param('length', 1, 12, 1, 6), param('width', 1, 9, 1, 4)],
  unitGrid: true,
  traceBoundary: true,
  quantities: [
    quantity('length', 'L', 'input', (p) => p.length, { decimals: 0 }),
    quantity('width', 'l', 'input', (p) => p.width, { decimals: 0 }),
    quantity('perimeter', 'P', 'target', (p) => M.rectanglePerimeter(p.length, p.width), { decimals: 0 }),
  ],
  target: 'perimeter',
  hintCount: 3,
  solution: R.operation('*', R.number(2), R.operation('+', R.variable('length'), R.variable('width'))),
  // §8 : L + l + L + l est JUSTE aussi. L'élève peut s'arrêter là, et
  // l'instrument le félicite avant de lui proposer de raccourcir.
  alternateSolutions: [
    R.operation('+',
      R.operation('+', R.variable('length'), R.variable('width')),
      R.operation('+', R.variable('length'), R.variable('width'))),
    R.operation('+',
      R.operation('*', R.number(2), R.variable('length')),
      R.operation('*', R.number(2), R.variable('width'))),
  ],
  explanation: 'boundary',
});

// ─────────────────────────────────────────────────────────────────────────
// §9 — L'aire du triangle
// ─────────────────────────────────────────────────────────────────────────

const triangleArea = defineInvestigation({
  id: 'triangle-area',
  stage: 'triangle',
  concept: 'area',
  params: [param('base', 2, 12, 1, 6), param('height', 1, 9, 1, 4), param('apex', -6, 12, 1, 2)],
  unitGrid: true,
  quantities: [
    quantity('base', 'b', 'input', (p) => p.base, { decimals: 0 }),
    quantity('height', 'h', 'input', (p) => p.height, { decimals: 0 }),
    quantity('area', 'A', 'target', (p) => M.cleanNumber((p.base * p.height) / 2), { decimals: 2, unit: 'area' }),
  ],
  target: 'area',
  hintCount: 3,
  solution: R.operation('/', R.operation('*', R.variable('base'), R.variable('height')), R.number(2)),
  // §9 : le ½ ne se raconte pas, il se VOIT — deux triangles identiques
  // font le rectangle. C'est `mirror` qui pose le second.
  explanation: 'mirror',
  // Le sommet glisse le long de la parallèle à la base : l'aire ne bouge
  // pas. C'est l'invariant qui montre que seule la HAUTEUR compte.
  slideInvariant: true,
});

// ─────────────────────────────────────────────────────────────────────────
// §10 — La circonférence du cercle
// ─────────────────────────────────────────────────────────────────────────

const circleCircumference = defineInvestigation({
  id: 'circle-circumference',
  stage: 'circle',
  concept: 'circumference',
  params: [param('radius', 1, 8, 0.5, 2)],
  quantities: [
    quantity('diameter', 'd', 'input', (p) => M.cleanNumber(2 * p.radius), { decimals: 2 }),
    quantity('circumference', 'C', 'target', (p) => M.circleCircumference(p.radius), { decimals: 2 }),
    // La COLONNE qui fait tout le travail (§10) : le quotient reste stable.
    // Elle est `derived` : l'instrument la calcule, l'élève la lit.
    quantity('ratio', 'C ÷ d', 'derived', (p) => M.cleanNumber(M.circleCircumference(p.radius) / (2 * p.radius)), { decimals: 3, unit: 'none', inRule: false }),
  ],
  target: 'circumference',
  hintCount: 3,
  solution: R.operation('*', R.constant('pi'), R.variable('diameter')),
  alternateSolutions: [],
  explanation: 'unroll',
  // La constante à NOMMER une fois qu'on l'a vue stable (§10).
  revealsConstant: 'pi',
});

// ─────────────────────────────────────────────────────────────────────────
// §11 — L'aire du disque
// ─────────────────────────────────────────────────────────────────────────

const circleArea = defineInvestigation({
  id: 'circle-area',
  stage: 'circle',
  concept: 'area',
  params: [param('radius', 1, 8, 0.5, 3), param('sectors', 4, 48, 2, 8)],
  quantities: [
    quantity('radius', 'r', 'input', (p) => p.radius, { decimals: 2 }),
    quantity('area', 'A', 'target', (p) => M.circleArea(p.radius), { decimals: 2, unit: 'area' }),
    quantity('ratio', 'A ÷ r²', 'derived', (p) => M.cleanNumber(M.circleArea(p.radius) / (p.radius * p.radius)), { decimals: 3, unit: 'none', inRule: false }),
  ],
  target: 'area',
  hintCount: 3,
  solution: R.operation('*', R.constant('pi'), R.power(R.variable('radius'), 2)),
  explanation: 'sectors',
  revealsConstant: 'pi',
});

// ─────────────────────────────────────────────────────────────────────────
// §12 — Le volume du cube
// ─────────────────────────────────────────────────────────────────────────

const cubeVolume = defineInvestigation({
  id: 'cube-volume',
  stage: 'cuboid',
  concept: 'volume',
  params: [param('edge', 1, 7, 1, 3)],
  lockedCube: true,
  quantities: [
    quantity('edge', 'a', 'input', (p) => p.edge, { decimals: 0 }),
    quantity('perLayer', '—', 'derived', (p) => p.edge * p.edge, { decimals: 0 }),
    quantity('layers', '—', 'derived', (p) => p.edge, { decimals: 0 }),
    quantity('volume', 'V', 'target', (p) => M.cubeVolume(p.edge), { decimals: 0, unit: 'volume' }),
  ],
  target: 'volume',
  hintCount: 3,
  solution: R.power(R.variable('edge'), 3),
  alternateSolutions: [
    R.operation('*', R.operation('*', R.variable('edge'), R.variable('edge')), R.variable('edge')),
  ],
  explanation: 'layers',
});

// ─────────────────────────────────────────────────────────────────────────
// §13 — Le volume du pavé droit
// ─────────────────────────────────────────────────────────────────────────

const cuboidVolume = defineInvestigation({
  id: 'cuboid-volume',
  stage: 'cuboid',
  concept: 'volume',
  params: [param('length', 1, 7, 1, 4), param('width', 1, 7, 1, 3), param('height', 1, 7, 1, 2)],
  quantities: [
    quantity('length', 'L', 'input', (p) => p.length, { decimals: 0 }),
    quantity('width', 'l', 'input', (p) => p.width, { decimals: 0 }),
    quantity('height', 'h', 'input', (p) => p.height, { decimals: 0 }),
    quantity('perLayer', '—', 'derived', (p) => p.length * p.width, { decimals: 0 }),
    quantity('volume', 'V', 'target', (p) => M.cuboidVolume(p.length, p.width, p.height), { decimals: 0, unit: 'volume' }),
  ],
  target: 'volume',
  hintCount: 3,
  solution: R.operation('*', R.operation('*', R.variable('length'), R.variable('width')), R.variable('height')),
  explanation: 'layers',
});

// ─────────────────────────────────────────────────────────────────────────
// §14 — Les conversions d'unités
// ─────────────────────────────────────────────────────────────────────────

/**
 * L'enquête porte sur l'AIRE — « pourquoi 1 m² = 10 000 cm² » — et non sur
 * les trois dimensions à la fois.
 *
 * C'est une contrainte du constructeur de règles, et elle est SAINE : une
 * règle y est une relation FIXE entre des grandeurs, et « F = k^n » avec un
 * exposant variable n'en est pas une — l'élève ne peut pas poser un exposant
 * qui change. Vouloir couvrir n = 1, 2 et 3 dans une seule enquête
 * reviendrait à lui faire conjecturer trois relations sous un seul énoncé,
 * et l'instrument accepterait « k² » pour une observation en dimension 1 où
 * la mesure dit k. La découverte de §14 est bien celle du CARRÉ ; le cube
 * est la même idée d'un cran plus loin, et la manipulation `nesting` la
 * montre en volume une fois le carré trouvé.
 *
 * Le côté du carré varie (du dm au km) : c'est ce qui rend la relation
 * observable plutôt que récitée, puisque le facteur change avec lui.
 */
const unitConversion = defineInvestigation({
  id: 'unit-conversion',
  stage: 'segment',
  concept: 'conversion',
  // Le rang de l'unité de départ parmi m, dm, cm… : il FAIT varier le
  // facteur de longueur, donc le tableau a quelque chose à montrer.
  params: [param('scale', 1, 4, 1, 2)],
  quantities: [
    // k : combien de fois la petite unité entre dans la grande, en LONGUEUR.
    quantity('lengthFactor', 'k', 'input', (p) => scaleFactor(p.scale), { decimals: 0, unit: 'none' }),
    // Ce que l'élève COMPTE : les carrés unités qui pavent le grand carré.
    quantity('factor', 'F', 'target', (p) => {
      const k = scaleFactor(p.scale);

      return M.cleanNumber(k * k);
    }, { decimals: 0, unit: 'none' }),
  ],
  target: 'factor',
  hintCount: 3,
  // 1 m² = 100² cm² : le facteur des LONGUEURS, élevé au carré.
  solution: R.power(R.variable('lengthFactor'), 2),
  alternateSolutions: [
    R.operation('*', R.variable('lengthFactor'), R.variable('lengthFactor')),
  ],
  explanation: 'nesting',
  evidence: Object.freeze({ minObservations: 3, minDistinct: 3, requiresUnseenTest: true }),
});

/**
 * Les conversions explorables, cran par cran : dm→cm, m→cm, m→mm, km→dm.
 *
 * Leurs facteurs sont TOUS DIFFÉRENTS (10, 100, 1 000, 10 000), et c'est une
 * exigence, pas un choix de goût. Le quatrième cran était km→m, soit 1 000
 * comme m→mm : deux crans, un seul objet. L'élève qui avait mesuré le cran 3
 * se voyait proposer le cran 4 comme objet « jamais vu », alors que son
 * tableau contenait déjà exactement ces mesures — l'épreuve ne prouvait rien.
 *
 * Le facteur est lu dans le moteur de conversion (`lengthFactor`), pas
 * recopié : la scène, le tableau et le moteur disent le même nombre.
 */
const SCALE_UNITS = Object.freeze({
  1: Object.freeze(['dm', 'cm']),
  2: Object.freeze(['m', 'cm']),
  3: Object.freeze(['m', 'mm']),
  4: Object.freeze(['km', 'dm']),
});

/** Le facteur de longueur du cran `scale` (m→cm par défaut). */
export function scaleFactor(scale) {
  const units = SCALE_UNITS[Math.round(Number(scale))] ?? SCALE_UNITS[2];

  return M.lengthFactor(units[0], units[1]);
}

// ─────────────────────────────────────────────────────────────────────────
// §15 — La relation de Pythagore
// ─────────────────────────────────────────────────────────────────────────

const pythagoras = defineInvestigation({
  id: 'pythagoras',
  stage: 'triangle',
  concept: 'pythagoras',
  rightAngled: true,
  params: [param('side1', 1, 10, 1, 3), param('side2', 1, 10, 1, 4)],
  showSquares: true,
  quantities: [
    quantity('square1', 'a²', 'derived', (p) => M.cleanNumber(p.side1 * p.side1), { decimals: 2, unit: 'area' }),
    quantity('square2', 'b²', 'derived', (p) => M.cleanNumber(p.side2 * p.side2), { decimals: 2, unit: 'area' }),
    quantity('squareHyp', 'c²', 'target', (p) => M.cleanNumber(p.side1 * p.side1 + p.side2 * p.side2), { decimals: 2, unit: 'area' }),
    quantity('side1', 'a', 'input', (p) => p.side1, { decimals: 2 }),
    quantity('side2', 'b', 'input', (p) => p.side2, { decimals: 2 }),
    // c se LIT (c'est le côté qu'on mesure à la règle), mais il est tiré de c² :
    // « c² » comme règle serait la définition de la cible, pas Pythagore.
    quantity('hypotenuse', 'c', 'derived', (p) => M.cleanNumber(Math.hypot(p.side1, p.side2)), { decimals: 3, inRule: false }),
  ],
  target: 'squareHyp',
  hintCount: 3,
  // C'est bien la relation entre les AIRES des carrés que l'élève cherche —
  // et « a² + b² » écrit avec les CÔTÉS est la même découverte : les deux se
  // jugent sur des objets réels, où a² vaut toujours a × a (`matchesSolution`).
  solution: R.operation('+', R.variable('square1'), R.variable('square2')),
  explanation: 'squares',
  // Le nom du théorème n'arrive qu'APRÈS (§15).
  namesTheorem: true,
});

// ─────────────────────────────────────────────────────────────────────────
// §16 — La somme des angles d'un triangle
// ─────────────────────────────────────────────────────────────────────────

const angleSum = defineInvestigation({
  id: 'triangle-angle-sum',
  stage: 'triangle',
  concept: 'angles',
  freeVertices: true,
  params: [param('base', 3, 12, 1, 7), param('height', 1, 9, 1, 4), param('apex', -6, 12, 1, 3)],
  showAngles: true,
  quantities: [
    quantity('angleA', 'Â', 'derived', (p) => triangleAnglesOf(p)[0], { decimals: 1, unit: 'angle' }),
    quantity('angleB', 'B̂', 'derived', (p) => triangleAnglesOf(p)[1], { decimals: 1, unit: 'angle' }),
    quantity('angleC', 'Ĉ', 'derived', (p) => triangleAnglesOf(p)[2], { decimals: 1, unit: 'angle' }),
    quantity('sum', 'S', 'target', (p) => {
      const [a, b, c] = triangleAnglesOf(p);

      return M.cleanNumber(a + b + c);
    }, { decimals: 1, unit: 'angle' }),
  ],
  target: 'sum',
  hintCount: 3,
  /**
   * La découverte est la CONSTANTE : S = 180°, quel que soit le triangle.
   *
   * La solution était `Â + B̂ + Ĉ` — la DÉFINITION de S, vraie de n'importe
   * quels trois nombres, qui n'apprend rien sur les triangles. Et 180 ne
   * pouvait pas s'écrire (les nombres posables étaient 2, 3, 4). L'enquête
   * propose donc trois angles remarquables (`ruleNumbers` : 90, 180, 360) —
   * trois, pour que la puce ne souffle pas la réponse — et juge « trouvé »
   * la règle qui prédit 180 sur tout triangle.
   */
  solution: R.number(180),
  ruleNumbers: Object.freeze([90, 180, 360]),
  // `Â + B̂ + Ĉ` tient sur chaque ligne, mais par définition : ce n'est pas
  // une découverte, et `matchesSolution` la refuse (voir `definition`).
  definition: R.operation('+', R.operation('+', R.variable('angleA'), R.variable('angleB')), R.variable('angleC')),
  // L'invariant : la somme ne dépend d'AUCUNE dimension. C'est une constante,
  // et c'est cela qui est remarquable.
  invariantValue: 180,
  explanation: 'tear',
  evidence: Object.freeze({ minObservations: 4, minDistinct: 3, requiresUnseenTest: true }),
});

/** Les sommets du triangle d'une enquête, depuis ses paramètres. */
export function triangleVertices(params) {
  const base = Number(params?.base) || 0;
  const height = Number(params?.height) || 0;
  const apex = Number.isFinite(Number(params?.apex)) ? Number(params.apex) : base / 2;

  return [{ x: 0, y: 0 }, { x: base, y: 0 }, { x: apex, y: height }];
}

function triangleAnglesOf(params) {
  const [a, b, c] = triangleVertices(params);

  return M.triangleAngles(a, b, c).map((angle) => (Number.isFinite(angle) ? angle : 0));
}

// ── Le catalogue ─────────────────────────────────────────────────────────

/** Les dix enquêtes, dans l'ordre du cahier (§5 → §16). */
export const INVESTIGATIONS = Object.freeze([
  rectangleArea,
  rectanglePerimeter,
  triangleArea,
  circleCircumference,
  circleArea,
  cubeVolume,
  cuboidVolume,
  unitConversion,
  pythagoras,
  angleSum,
]);

export const INVESTIGATION_IDS = Object.freeze(INVESTIGATIONS.map((investigation) => investigation.id));

/** L'enquête derrière un identifiant, ou `null`. */
export function getInvestigation(id) {
  return INVESTIGATIONS.find((investigation) => investigation.id === id) ?? null;
}

/** L'enquête d'ouverture : l'aire du rectangle, la plus élémentaire. */
export const DEFAULT_INVESTIGATION = 'rectangle-area';

/** Les paramètres d'ouverture d'une enquête. */
export function initialParams(investigation) {
  const params = {};
  for (const entry of investigation?.params ?? []) params[entry.key] = entry.initial;

  return params;
}

/**
 * MESURE toutes les grandeurs d'une enquête sur un objet donné.
 *
 * C'est la seule porte entre les paramètres de l'objet et les nombres que
 * l'élève lit : le tableau, la règle et la vérification lisent tous ceci.
 *
 * @param {object} investigation
 * @param {object} params        les dimensions courantes
 * @param {number} precision     la graduation de l'instrument (0 = exact)
 */
export function measureAll(investigation, params, precision = 0) {
  const values = {};
  for (const entry of investigation?.quantities ?? []) {
    const raw = entry.measure(params);
    // Les grandeurs SANS unité (un quotient, un facteur, une dimension) ne
    // passent pas par la graduation d'une règle : arrondir C ÷ d au
    // millimètre n'aurait aucun sens.
    values[entry.key] = entry.unit === 'none' || entry.unit === 'angle'
      ? M.cleanNumber(raw)
      : M.readWithPrecision(raw, precision);
  }

  return values;
}

/** Les grandeurs qu'une enquête montre en colonnes, dans l'ordre du tableau. */
export function tableColumns(investigation) {
  const order = { input: 0, derived: 1, target: 2 };

  return [...(investigation?.quantities ?? [])]
    .filter((entry) => entry.symbol !== '—')
    .sort((a, b) => (order[a.role] ?? 1) - (order[b.role] ?? 1));
}

/**
 * Les variables que le constructeur de règles propose pour une enquête :
 * tout sauf la cible, les colonnes muettes (—) et celles tirées de la cible
 * (`inRule: false`).
 */
export function ruleVariablesFor(investigation) {
  return (investigation?.quantities ?? [])
    .filter((entry) => entry.key !== investigation.target && entry.symbol !== '—' && entry.inRule !== false)
    .map((entry) => ({ key: entry.key, symbol: entry.symbol }));
}

/** Les nombres que le constructeur propose : ceux du programme, et ceux de l'enquête. */
export function ruleNumbersFor(investigation) {
  return [...R.RULE_CONSTANTS, ...(investigation?.ruleNumbers ?? [])];
}

/**
 * Les configurations de l'objet, dans l'ordre de la grille (le premier
 * paramètre varie le plus vite). Rend `null` si la grille dépasse `limit`.
 */
export function parameterGrid(investigation, limit = Infinity) {
  const axes = (investigation?.params ?? []).map((entry) => {
    const span = Math.max(0, Math.round((entry.max - entry.min) / entry.step));
    const values = [];
    for (let i = 0; i <= span; i += 1) values.push(M.cleanNumber(Math.min(entry.max, entry.min + i * entry.step)));

    return { key: entry.key, values };
  });
  const size = axes.reduce((product, axis) => product * axis.values.length, 1);
  if (size > limit) return null;

  const grid = [];
  for (let index = 0; index < size; index += 1) {
    const params = {};
    let rest = index;
    for (const axis of axes) {
      params[axis.key] = axis.values[rest % axis.values.length];
      rest = Math.floor(rest / axis.values.length);
    }
    grid.push(params);
  }

  return grid;
}

/**
 * Les MESURES exactes d'un échantillon d'objets réels de l'enquête : toute
 * la grille si elle est petite, sinon un sous-ensemble déterministe qui la
 * parcourt d'un bout à l'autre. Mis en cache : l'écran le relit à chaque rendu.
 */
const SAMPLE_CACHE = new WeakMap();
const MAX_SAMPLES = 240;

function consistentSamples(investigation) {
  if (SAMPLE_CACHE.has(investigation)) return SAMPLE_CACHE.get(investigation);
  const full = parameterGrid(investigation);
  let chosen = full;
  if (full.length > MAX_SAMPLES) {
    // Un pas premier avec la taille de la grille visite des configurations
    // bien réparties, et jamais deux fois la même.
    let stride = Math.floor(full.length / MAX_SAMPLES) + 1;
    while (gcd(stride, full.length) !== 1) stride += 1;
    chosen = [];
    for (let i = 0; i < MAX_SAMPLES; i += 1) chosen.push(full[(i * stride) % full.length]);
  }
  const samples = chosen.map((params) => measureAll(investigation, params, 0));
  SAMPLE_CACHE.set(investigation, samples);

  return samples;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/** La règle n'utilise-t-elle que des colonnes que le constructeur propose ? */
function usesOnlyRuleVariables(investigation, rule) {
  const allowed = new Set(ruleVariablesFor(investigation).map((entry) => entry.key));

  return [...R.ruleVariables(rule)].every((name) => allowed.has(name));
}

/**
 * La règle proposée est-elle CELLE qu'on cherchait ?
 *
 * On compare par les valeurs, jamais par la forme de l'arbre : un élève qui
 * écrit `l × L` a trouvé la même règle que `L × l`, et un élève qui écrit
 * `2 × (L + l)` a trouvé la même que `L + l + L + l`.
 *
 * Les valeurs sont celles d'OBJETS RÉELS de l'enquête (`consistentSamples`),
 * pas des nombres tirés indépendamment pour chaque colonne. Tirées
 * indépendamment, a² et a ne se connaissaient plus : `a² + b²` écrit avec
 * les côtés ne rejoignait jamais la solution écrite avec les aires des
 * carrés, et Pythagore, énoncé comme au manuel, n'était jamais « trouvé » —
 * alors qu'il tenait sur chaque observation et chaque épreuve.
 *
 * Deux gardes empêchent que ces valeurs cohérentes ne récompensent une
 * TAUTOLOGIE :
 *   · une règle ne peut se servir que des colonnes du constructeur (pas de
 *     C ÷ d, ni de c tiré de c²) ;
 *   · une règle qui n'est que la DÉFINITION de la cible (`definition` :
 *     Â + B̂ + Ĉ pour la somme S), jugée sur des valeurs libres, ne compte pas.
 */
export function matchesSolution(investigation, rule) {
  if (!investigation || !R.isComplete(rule)) return false;
  if (!usesOnlyRuleVariables(investigation, rule)) return false;
  if (isDefinitionOf(investigation, rule)) return false;
  const candidates = [investigation.solution, ...(investigation.alternateSolutions ?? [])];
  const samples = consistentSamples(investigation);

  return candidates.some((candidate) => samples.every((values) => {
    const expected = R.evaluateRule(candidate, values);
    const predicted = R.evaluateRule(rule, values);

    return Number.isFinite(expected) && Number.isFinite(predicted)
      && M.nearlyEqual(expected, predicted, 1e-9);
  }));
}

/**
 * La règle n'est-elle que la DÉFINITION de la cible ? (Â + B̂ + Ĉ pour S)
 *
 * Jugée sur des valeurs LIBRES (`sameRelation`) : c'est l'identité des
 * écritures qui compte, pas la coïncidence sur les triangles. L'écran s'en
 * sert pour dire pourquoi une règle qui tient n'est pas encore la découverte.
 */
export function isDefinitionOf(investigation, rule) {
  if (!investigation?.definition || !R.isComplete(rule)) return false;
  const names = (investigation.quantities ?? []).map((entry) => entry.key);

  return R.sameRelation(investigation.definition, rule, names);
}
