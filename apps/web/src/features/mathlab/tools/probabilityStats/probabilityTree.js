/**
 * L'ARBRE DE PROBABILITÉS — شجرة الاحتمالات. Logique pure, sans React.
 *
 *     tree   = { stages: 1…3, branches: Branch[], presetId: string | null, query: Query | null }
 *     Branch = { id, label, p, children: Branch[] }
 *
 * `p` garde le TEXTE saisi (« 1/4 », « 0,25 », « 25 % ») — comme la série
 * statistique garde sa saisie : une probabilité fautive se retrouve telle
 * quelle au rechargement, pour être corrigée. Sa valeur est lue EXACTEMENT
 * (`parseProbability` → un rationnel `{ n, d }` de algebra/rational.js) :
 * 0,1 + 0,2 vaut 3/10, pas 0,30000000000000004, et « la somme fait 1 » est
 * une égalité, pas une tolérance.
 *
 * Une branche est désignée par son CHEMIN d'indices ([0, 1] = 2e branche
 * sous la 1re) ; un NŒUD aussi — le nœud [0] est l'extrémité de la
 * branche [0], le nœud [] est la racine. Les feuilles sont toutes à la
 * profondeur `stages` : ajouter ou retirer une étape agit sur tout l'arbre.
 *
 * Tant que l'arbre n'est pas VALIDE (chaque p dans [0 ; 1], chaque groupe
 * de branches issues d'un même nœud de somme exactement 1), aucun résultat
 * n'est calculé — l'interface dit « غير محسوبة » et montre pourquoi. C'est
 * le choix constant du laboratoire : jamais un nombre tiré d'un arbre faux.
 */

import {
  ONE, ZERO, add, divide, equals, makeRational, multiply, subtract, toNumber,
} from '../algebra/rational.js';

export const MAX_STAGES = 3;
export const MAX_BRANCHES = 4;
const MAX_LABEL_LENGTH = 24;
const MAX_PROBABILITY_TEXT = 16;
/** Au-delà de neuf décimales, personne n'écrit une probabilité d'exercice. */
const MAX_DECIMALS = 9;

const STAGE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'K'];
const MACRON = '̄';

// ── Lire une probabilité ─────────────────────────────────────────────────

const ARABIC_DIGITS = /[٠-٩۰-۹]/g;

function normalizeNumberText(text) {
  return String(text)
    .replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf)))
    .replace(/٫/g, '.')
    .replace(/٪/g, '%')
    .replace(/[−–—]/g, '-')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
}

function decimalRational(intPart, fracPart) {
  const digits = fracPart ?? '';
  if (digits.length > MAX_DECIMALS) return null;
  const numerator = Number(`${intPart || '0'}${digits}`);

  return makeRational(numerator, 10 ** digits.length);
}

/**
 * Un texte → `{ ok: true, value: {n, d} }` ou `{ ok: false, error }`.
 * Formes lues : fraction `3/8`, décimal `0,25` / `0.25` / `.5`,
 * pourcentage `25 %` / `12,5%`. Codes d'erreur : `empty`, `syntax`,
 * `zeroDenominator`, `range` (hors de [0 ; 1], négatif compris).
 */
export function parseProbability(text) {
  if (typeof text !== 'string' && typeof text !== 'number') return { ok: false, error: 'empty' };
  const source = normalizeNumberText(text);
  if (source === '') return { ok: false, error: 'empty' };
  const negative = source.startsWith('-');
  const body = negative || source.startsWith('+') ? source.slice(1) : source;
  let value = null;
  try {
    let match = body.match(/^(\d*)(?:\.(\d*))?%$/);
    if (match && (match[1] !== '' || (match[2] ?? '') !== '')) {
      const r = decimalRational(match[1], match[2]);
      value = r && divide(r, makeRational(100));
    } else if ((match = body.match(/^(\d+)\/(\d+)$/))) {
      if (Number(match[2]) === 0) return { ok: false, error: 'zeroDenominator' };
      value = makeRational(Number(match[1]), Number(match[2]));
    } else if ((match = body.match(/^(\d*)(?:\.(\d*))?$/)) && (match[1] !== '' || (match[2] ?? '') !== '')) {
      value = decimalRational(match[1], match[2]);
    }
  } catch {
    value = null;
  }
  if (!value) return { ok: false, error: 'syntax' };
  if (negative && value.n !== 0) return { ok: false, error: 'range' };
  if (value.n < 0 || value.n > value.d) return { ok: false, error: 'range' };

  return { ok: true, value };
}

/** Un rationnel de [0 ; 1] → le texte qu'on écrirait dans le champ, dans le style voulu. */
export function formatProbabilityText(r, style = 'fraction') {
  const terminating = isTerminating(r);
  if (style === 'percent' && terminating) {
    return `${decimalText(multiply(r, makeRational(100)))} %`;
  }
  if (style === 'decimal' && terminating) return decimalText(r);
  if (r.d === 1) return String(r.n);

  return `${r.n}/${r.d}`;
}

function isTerminating(r) {
  let d = r.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;

  return d === 1 && r.d <= 10 ** MAX_DECIMALS;
}

function decimalText(r) {
  const value = toNumber(r);

  return String(Number(value.toFixed(MAX_DECIMALS))).replace('.', ',');
}

function styleOf(text) {
  const t = String(text ?? '');
  if (t.includes('%') || t.includes('٪')) return 'percent';
  if (t.includes('/')) return 'fraction';
  if (/[.,٫]/.test(t)) return 'decimal';

  return 'fraction';
}

// ── Les étiquettes ──────────────────────────────────────────────────────

/**
 * Une étiquette saisie → sa forme canonique. Le contraire d'un événement
 * d'une lettre s'écrit avec un MACRON combinant (« Ā ») : lisible tel quel
 * dans le champ, dans le dessin et par un lecteur d'écran, et traduit en
 * `\bar{A}` pour KaTeX. `\bar A`, `\bar{A}`, `\overline{A}` et « ليس A »
 * (une lettre) y sont ramenés. Les caractères qui casseraient une formule
 * (`$ \ { } ^ _ & % # ~`) sont retirés ; longueur bornée.
 */
export function normalizeLabel(text) {
  // eslint-disable-next-line no-control-regex -- control characters are exactly what is removed from a pasted label
  let label = String(text ?? '').replace(/[\u0000-\u001f]/g, '').trim();
  const bar = label.match(/^\\(?:bar|overline)\s*\{?\s*([A-Za-z])\s*\}?$/) || label.match(/^ليس\s+([A-Za-z])$/);
  if (bar) return `${bar[1]}${MACRON}`;
  label = label.replace(/[$\\{}^_&%#~]/g, '').replace(/\s+/g, ' ');

  return Array.from(label).slice(0, MAX_LABEL_LENGTH).join('');
}

/** Le contraire d'une étiquette : A ↔ Ā ; une étiquette longue devient « ليس … ». */
export function complementLabel(label) {
  const text = normalizeLabel(label);
  if (/^[A-Za-z]̄$/.test(text)) return text[0];
  if (/^[A-Za-z]$/.test(text)) return `${text}${MACRON}`;
  if (text.startsWith('ليس ')) return text.slice(4);

  return normalizeLabel(`ليس ${text}`);
}

/** L'étiquette en LaTeX (pour MathText). `stage` ajoute l'indice d'étape quand l'étiquette est ambiguë. */
export function labelLatex(label, stage = null) {
  const text = normalizeLabel(label);
  let body;
  if (/^[A-Za-z]̄$/.test(text)) body = `\\bar{${text[0]}}`;
  else if (/^[A-Za-z]$/.test(text) || /^\d+$/.test(text)) body = text;
  else if (/^[A-Za-z0-9]+$/.test(text)) body = `\\mathrm{${text}}`;
  else body = `\\text{${text || '?'}}`;

  return stage ? `${body}_{${stage}}` : body;
}

/** Une étiquette pour le dessin : le texte, et si c'est un contraire, la lettre à surligner. */
export function labelParts(label) {
  const text = normalizeLabel(label);
  if (/^[A-Za-z]̄$/.test(text)) return { text: text[0], bar: true };

  return { text, bar: false };
}

// ── Construire, parcourir ───────────────────────────────────────────────

function branchNumber(id) {
  const match = /^b(\d+)$/.exec(String(id));

  return match ? Number(match[1]) : 0;
}

function maxIdIn(branches) {
  let max = 0;
  for (const branch of branches) {
    max = Math.max(max, branchNumber(branch.id), maxIdIn(branch.children));
  }

  return max;
}

/** Un générateur d'identifiants neufs pour un arbre (b1, b2…) — déterministe, jamais une collision. */
function idFactory(tree) {
  let next = maxIdIn(tree.branches) + 1;

  return () => `b${next++}`;
}

/** Deux branches par défaut, X et X̄, chacune 1/2, prolongées jusqu'à la profondeur voulue. */
function defaultChildren(letter, depthLeft, nextId, letters) {
  if (depthLeft <= 0) return [];

  return [letter, `${letter}${MACRON}`].map((label) => ({
    id: nextId(),
    label,
    p: '1/2',
    children: defaultChildren(letters[1] ?? letter, depthLeft - 1, nextId, letters.slice(1)),
  }));
}

/** Un arbre à deux étapes, A / Ā puis B / B̄, prêt à être modifié. */
export function createDefaultTree() {
  let n = 1;
  const nextId = () => `b${n++}`;

  return {
    stages: 2,
    branches: [
      { id: nextId(), label: 'A', p: '3/5', children: [] },
      { id: nextId(), label: `A${MACRON}`, p: '2/5', children: [] },
    ].map((branch, index) => ({
      ...branch,
      children: [
        { id: nextId(), label: 'B', p: index === 0 ? '1/3' : '1/2', children: [] },
        { id: nextId(), label: `B${MACRON}`, p: index === 0 ? '2/3' : '1/2', children: [] },
      ],
    })),
    presetId: null,
    query: null,
  };
}

export function pathKey(path) {
  return path.join('.');
}

export function parsePathKey(key) {
  if (key === '' || key === null || key === undefined) return [];

  return String(key).split('.').map(Number);
}

/** La branche au bout d'un chemin (ou `null`). */
export function branchAt(tree, path) {
  let branches = tree.branches;
  let branch = null;
  for (const index of path) {
    branch = branches?.[index] ?? null;
    if (!branch) return null;
    branches = branch.children;
  }

  return branch;
}

/** Les branches issues d'un nœud (le nœud [] est la racine). */
export function childrenAt(tree, nodePath) {
  if (nodePath.length === 0) return tree.branches;

  return branchAt(tree, nodePath)?.children ?? null;
}

/** Tous les nœuds internes (ceux d'où partent des branches), racine d'abord, en profondeur. */
export function internalNodes(tree) {
  const out = [];
  const visit = (branches, path) => {
    if (branches.length === 0) return;
    out.push({ path, key: pathKey(path), depth: path.length });
    branches.forEach((branch, index) => visit(branch.children, [...path, index]));
  };
  visit(tree.branches, []);

  return out;
}

/** Toutes les branches, en profondeur : `{ path, key, depth (1…), branch }`. */
export function allBranches(tree) {
  const out = [];
  const visit = (branches, parentPath) => {
    branches.forEach((branch, index) => {
      const path = [...parentPath, index];
      out.push({ path, key: pathKey(path), depth: path.length, branch });
      visit(branch.children, path);
    });
  };
  visit(tree.branches, []);

  return out;
}

/** Le nombre de feuilles (= de chemins complets). */
export function leafCount(tree) {
  return allBranches(tree).filter((entry) => entry.depth === tree.stages).length;
}

// ── Valider ─────────────────────────────────────────────────────────────

/**
 * Le diagnostic complet de l'arbre :
 *   - `branchIssues[key]` : la probabilité illisible / hors de [0 ; 1], ou une étiquette vide ;
 *   - `nodeIssues[key]`   : la somme des branches issues du nœud ≠ 1 (avec la somme),
 *                           deux branches sœurs de même nom ;
 *   - `probabilities[key]`: la valeur exacte de chaque branche lisible.
 * `valid` : aucun problème — seul cas où l'on calcule.
 */
export function validateTree(tree) {
  const branchIssues = {};
  const nodeIssues = {};
  const probabilities = {};

  for (const node of internalNodes(tree)) {
    const children = childrenAt(tree, node.path);
    const issues = [];
    let sum = ZERO;
    let allReadable = true;
    const seen = new Set();
    children.forEach((branch, index) => {
      const key = pathKey([...node.path, index]);
      const parsed = parseProbability(branch.p);
      const label = normalizeLabel(branch.label);
      if (!parsed.ok) {
        branchIssues[key] = { code: parsed.error };
        allReadable = false;
      } else {
        probabilities[key] = parsed.value;
        try { sum = add(sum, parsed.value); } catch { allReadable = false; }
      }
      if (label === '') branchIssues[key] = branchIssues[key] ?? { code: 'emptyLabel' };
      if (label !== '' && seen.has(label)) issues.push({ code: 'duplicateLabel', label });
      seen.add(label);
    });
    if (allReadable && !equals(sum, ONE)) {
      let missing = null;
      try { missing = subtract(ONE, sum); } catch { missing = null; }
      issues.push({ code: 'sumNotOne', sum, missing });
    }
    if (!allReadable) issues.push({ code: 'incomplete' });
    if (issues.length > 0) nodeIssues[node.key] = issues;
  }

  const valid = Object.keys(branchIssues).length === 0 && Object.keys(nodeIssues).length === 0;

  return { valid, branchIssues, nodeIssues, probabilities };
}

// ── Calculer ────────────────────────────────────────────────────────────

/** Les étiquettes qui apparaissent à plus d'une étape : elles prennent un indice d'étape dans les formules. */
export function ambiguousLabels(tree) {
  const stagesOf = new Map();
  for (const { branch, depth } of allBranches(tree)) {
    const label = normalizeLabel(branch.label);
    if (!stagesOf.has(label)) stagesOf.set(label, new Set());
    stagesOf.get(label).add(depth);
  }

  return new Set([...stagesOf.entries()].filter(([, stages]) => stages.size > 1).map(([label]) => label));
}

/** Les étiquettes distinctes d'une étape (1…stages), dans l'ordre d'apparition. */
export function stageLabels(tree, stage) {
  const labels = [];
  for (const { branch, depth } of allBranches(tree)) {
    const label = normalizeLabel(branch.label);
    if (depth === stage && label !== '' && !labels.includes(label)) labels.push(label);
  }

  return labels;
}

/**
 * Les CHEMINS jusqu'à une profondeur (par défaut les chemins complets) :
 *   `{ key, path, labels[], factors[], product }` — `product` = le produit
 *   des probabilités le long du chemin (règle du produit), `null` si l'arbre
 *   n'est pas valide.
 */
export function pathsOf(tree, validation = validateTree(tree), depth = tree.stages) {
  const out = [];
  const visit = (branches, path, labels, factors) => {
    branches.forEach((branch, index) => {
      const nextPath = [...path, index];
      const key = pathKey(nextPath);
      const nextLabels = [...labels, normalizeLabel(branch.label)];
      const nextFactors = [...factors, validation.probabilities[key] ?? null];
      if (nextPath.length === depth) {
        out.push({ key, path: nextPath, labels: nextLabels, factors: nextFactors, product: productOf(nextFactors, validation.valid) });
      } else {
        visit(branch.children, nextPath, nextLabels, nextFactors);
      }
    });
  };
  visit(tree.branches, [], [], []);

  return out;
}

function productOf(factors, valid) {
  if (!valid || factors.some((f) => f === null)) return null;
  try {
    return factors.reduce((acc, f) => multiply(acc, f), ONE);
  } catch {
    return null;
  }
}

function sumOf(values) {
  try {
    return values.reduce((acc, v) => add(acc, v), ZERO);
  } catch {
    return null;
  }
}

/** Le chemin (préfixe) qui mène à une branche : `{ labels, factors, product }` — la règle du produit sur un nœud interne. */
export function pathResult(tree, path, validation = validateTree(tree)) {
  const branch = branchAt(tree, path);
  if (!branch || path.length === 0) return null;
  const labels = [];
  const factors = [];
  for (let i = 1; i <= path.length; i += 1) {
    const prefix = path.slice(0, i);
    labels.push(normalizeLabel(branchAt(tree, prefix).label));
    factors.push(validation.probabilities[pathKey(prefix)] ?? null);
  }

  return { key: pathKey(path), path, labels, factors, product: productOf(factors, validation.valid) };
}

/**
 * La probabilité d'un ÉVÉNEMENT « l'étiquette L à l'étape s » — la formule
 * des probabilités totales : la somme des chemins complets qui passent par
 * une branche L à l'étape s.
 */
export function eventProbability(tree, event, validation = validateTree(tree)) {
  // Les chemins s'arrêtent à l'étape de l'événement : la suite de l'arbre
  // somme à 1 sous chaque nœud, l'écrire n'ajouterait que des termes.
  const paths = pathsOf(tree, validation, event.stage).filter((p) => p.labels[event.stage - 1] === normalizeLabel(event.label));
  const probability = validation.valid ? sumOf(paths.map((p) => p.product)) : null;

  return { paths, probability };
}

/**
 * P_B(A) = P(A ∩ B) / P(B) — la probabilité conditionnelle, et la
 * probabilité « inverse » (Bayes) quand A est à une étape antérieure à B.
 * `value` est `null` si l'arbre n'est pas valide ou si P(B) = 0 (`zeroGiven`).
 */
export function conditionalProbability(tree, target, given, validation = validateTree(tree)) {
  const all = pathsOf(tree, validation, Math.max(target.stage, given.stage));
  const matches = (p, e) => p.labels[e.stage - 1] === normalizeLabel(e.label);
  const givenPaths = all.filter((p) => matches(p, given));
  const intersectionPaths = givenPaths.filter((p) => matches(p, target));
  if (!validation.valid) {
    return { givenPaths, intersectionPaths, pGiven: null, pIntersection: null, value: null, zeroGiven: false };
  }
  const pGiven = sumOf(givenPaths.map((p) => p.product));
  const pIntersection = sumOf(intersectionPaths.map((p) => p.product));
  if (!pGiven || !pIntersection) {
    return { givenPaths, intersectionPaths, pGiven, pIntersection, value: null, zeroGiven: false };
  }
  if (pGiven.n === 0) {
    return { givenPaths, intersectionPaths, pGiven, pIntersection, value: null, zeroGiven: true };
  }
  let value = null;
  try { value = divide(pIntersection, pGiven); } catch { value = null; }

  return { givenPaths, intersectionPaths, pGiven, pIntersection, value, zeroGiven: false };
}

/**
 * L'INDÉPENDANCE, déduite — jamais déclarée : l'étape s (≥ 2) est
 * indépendante de ce qui la précède quand CHAQUE nœud de l'étape s − 1
 * porte les mêmes étiquettes avec les mêmes probabilités. Seulement pour un
 * arbre valide (sinon `null`).
 *   → `{ stages: [{ stage, independent }], independent }`
 */
export function independenceOf(tree, validation = validateTree(tree)) {
  if (!validation.valid || tree.stages < 2) return null;
  const stages = [];
  for (let stage = 2; stage <= tree.stages; stage += 1) {
    const nodes = internalNodes(tree).filter((node) => node.depth === stage - 1);
    const signature = (node) => childrenAt(tree, node.path)
      .map((branch, index) => [normalizeLabel(branch.label), validation.probabilities[pathKey([...node.path, index])]])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const reference = signature(nodes[0]);
    const independent = nodes.every((node) => {
      const other = signature(node);

      return other.length === reference.length
        && other.every(([label, p], i) => label === reference[i][0] && equals(p, reference[i][1]));
    });
    stages.push({ stage, independent });
  }

  return { stages, independent: stages.every((s) => s.independent) };
}

// ── Transformer (chaque opération rend un NOUVEL arbre, ou le même si elle est refusée) ─

function mapBranches(branches, path, fn) {
  const [head, ...rest] = path;

  return branches.map((branch, index) => {
    if (index !== head) return branch;
    if (rest.length === 0) return fn(branch);

    return { ...branch, children: mapBranches(branch.children, rest, fn) };
  });
}

function updateChildren(tree, nodePath, fn) {
  if (nodePath.length === 0) return { ...tree, branches: fn(tree.branches) };
  if (!branchAt(tree, nodePath)) return tree;

  return { ...tree, branches: mapBranches(tree.branches, nodePath, (branch) => ({ ...branch, children: fn(branch.children) })) };
}

function cloneBranch(branch, nextId) {
  return { id: nextId(), label: branch.label, p: branch.p, children: branch.children.map((child) => cloneBranch(child, nextId)) };
}

/** Une lettre pas encore utilisée dans l'arbre (pour nommer une branche ou une étape neuve). */
function freshLetter(tree, preferred) {
  const used = new Set(allBranches(tree).map(({ branch }) => normalizeLabel(branch.label).replace(MACRON, '')));
  if (preferred && !used.has(preferred)) return preferred;

  return STAGE_LETTERS.find((letter) => !used.has(letter)) ?? 'X';
}

/** Un nom libre parmi des sœurs : la lettre de la sœur et son contraire, sinon une lettre neuve (ou l'entier suivant). */
function freshSiblingLabel(tree, siblings, depth) {
  const taken = new Set(siblings.map((b) => normalizeLabel(b.label)));
  const base = siblings[0] ? labelParts(siblings[0].label).text : STAGE_LETTERS[depth - 1];
  if (/^\d+$/.test(base)) {
    let n = Number(base);
    while (taken.has(String(n))) n += 1;

    return String(n);
  }
  const candidates = /^[A-Za-z]$/.test(base) ? [base, `${base}${MACRON}`] : [];
  for (const candidate of candidates) {
    if (!taken.has(candidate)) return candidate;
  }

  return freshLetter(tree);
}

/** La requête (chemin, événement…) survit-elle à ce nouvel arbre ? Sinon elle tombe. */
function keepQuery(tree) {
  const { query } = tree;
  if (!query) return tree;
  const eventOk = (e) => e && e.stage >= 1 && e.stage <= tree.stages && stageLabels(tree, e.stage).includes(e.label);
  const ok = (query.kind === 'path' && branchAt(tree, query.path) !== null)
    || (query.kind === 'event' && eventOk(query.event))
    || (query.kind === 'conditional' && eventOk(query.target) && eventOk(query.given));

  return ok ? tree : { ...tree, query: null };
}

/** Ajouter une branche sous un nœud (≤ MAX_BRANCHES). Elle reprend la forme du sous-arbre d'une sœur. */
export function addBranch(tree, nodePath) {
  const siblings = childrenAt(tree, nodePath);
  if (!siblings || siblings.length >= MAX_BRANCHES || nodePath.length >= tree.stages) return tree;
  const nextId = idFactory(tree);
  const depth = nodePath.length + 1;
  const label = freshSiblingLabel(tree, siblings, depth);
  const children = siblings[0]
    ? siblings[0].children.map((child) => cloneBranch(child, nextId))
    : defaultChildren(freshLetter(tree, STAGE_LETTERS[depth]), tree.stages - depth, nextId, STAGE_LETTERS.slice(depth));
  const branch = { id: nextId(), label, p: '', children };

  return { ...updateChildren(tree, nodePath, (list) => [...list, branch]), presetId: null };
}

/** Supprimer une branche (et son sous-arbre). Un nœud garde toujours au moins une branche. */
export function deleteBranch(tree, path) {
  const nodePath = path.slice(0, -1);
  const siblings = childrenAt(tree, nodePath);
  if (!siblings || siblings.length <= 1 || !branchAt(tree, path)) return tree;
  const index = path[path.length - 1];

  return keepQuery({ ...updateChildren(tree, nodePath, (list) => list.filter((_, i) => i !== index)), presetId: null, query: dropPathQuery(tree.query) });
}

function dropPathQuery(query) {
  return query?.kind === 'path' ? null : query;
}

/** Dupliquer une branche AVEC son sous-arbre, juste après elle, sous un nom libre. */
export function duplicateBranch(tree, path) {
  const nodePath = path.slice(0, -1);
  const siblings = childrenAt(tree, nodePath);
  const source = branchAt(tree, path);
  if (!siblings || !source || siblings.length >= MAX_BRANCHES) return tree;
  const nextId = idFactory(tree);
  const copy = { ...cloneBranch(source, nextId), label: freshSiblingLabel(tree, siblings, path.length) };
  const index = path[path.length - 1];

  return keepQuery({
    ...updateChildren(tree, nodePath, (list) => [...list.slice(0, index + 1), copy, ...list.slice(index + 1)]),
    presetId: null,
    query: dropPathQuery(tree.query),
  });
}

/** Modifier le texte d'une probabilité (gardé tel que saisi, borné). */
export function setProbability(tree, path, text) {
  const branch = branchAt(tree, path);
  const value = String(text ?? '').slice(0, MAX_PROBABILITY_TEXT);
  if (!branch || branch.p === value) return tree;

  return { ...tree, branches: mapBranches(tree.branches, path, (b) => ({ ...b, p: value })) };
}

/** Renommer un événement (étiquette normalisée). */
export function setLabel(tree, path, text) {
  const branch = branchAt(tree, path);
  const label = normalizeLabel(text);
  if (!branch || branch.label === label) return tree;

  return keepQuery({ ...tree, branches: mapBranches(tree.branches, path, (b) => ({ ...b, label })), presetId: null });
}

/**
 * « أكمل تلقائيًا » : la DERNIÈRE branche d'un nœud reçoit 1 − (somme des
 * autres), écrite dans le style des autres (fraction, décimal, %). Refusé
 * (arbre inchangé) si une autre branche est illisible ou si leur somme
 * dépasse 1.
 */
export function autoCompleteNode(tree, nodePath) {
  const siblings = childrenAt(tree, nodePath);
  if (!siblings || siblings.length === 0) return tree;
  const others = siblings.slice(0, -1);
  const parsed = others.map((b) => parseProbability(b.p));
  if (parsed.some((p) => !p.ok)) return tree;
  let rest;
  try {
    rest = subtract(ONE, parsed.reduce((acc, p) => add(acc, p.value), ZERO));
  } catch {
    return tree;
  }
  if (rest.n < 0) return tree;
  const styles = others.map((b) => styleOf(b.p));
  const style = styles.length > 0 && styles.every((s) => s === styles[0]) ? styles[0] : 'fraction';

  return setProbability(tree, [...nodePath, siblings.length - 1], formatProbabilityText(rest, style));
}

/** Ce que « أكمل تلقائيًا » écrirait (ou `null` s'il n'y a rien à écrire ou si c'est impossible) — pour activer le bouton honnêtement. */
export function autoCompletePreview(tree, nodePath) {
  const next = autoCompleteNode(tree, nodePath);
  if (next === tree) return null;

  return branchAt(next, [...nodePath, childrenAt(tree, nodePath).length - 1]).p;
}

/** Ajouter une étape : chaque feuille reçoit deux branches X / X̄ (1/2 chacune). */
export function addStage(tree) {
  if (tree.stages >= MAX_STAGES) return tree;
  const nextId = idFactory(tree);
  const letter = freshLetter(tree, STAGE_LETTERS[tree.stages]);
  const grow = (branches, depth) => branches.map((branch) => ({
    ...branch,
    children: depth === tree.stages ? defaultChildren(letter, 1, nextId, [letter]) : grow(branch.children, depth + 1),
  }));

  return { ...tree, stages: tree.stages + 1, branches: grow(tree.branches, 1), presetId: null };
}

/** Retirer la dernière étape (il en reste toujours une). */
export function removeStage(tree) {
  if (tree.stages <= 1) return tree;
  const cut = (branches, depth) => branches.map((branch) => ({
    ...branch,
    children: depth === tree.stages - 1 ? [] : cut(branch.children, depth + 1),
  }));

  return keepQuery({ ...tree, stages: tree.stages - 1, branches: cut(tree.branches, 1), presetId: null });
}

/** Fixer la requête affichée : un chemin, un événement, une probabilité conditionnelle — ou rien. */
export function setQuery(tree, query) {
  return keepQuery({ ...tree, query: query ?? null });
}

// ── Relire un arbre enregistré ──────────────────────────────────────────

function readBranches(raw, depthLeft, used) {
  if (depthLeft <= 0 || !Array.isArray(raw)) return [];

  return raw.slice(0, MAX_BRANCHES).filter((b) => b && typeof b === 'object').map((b) => {
    let id = typeof b.id === 'string' && /^b\d{1,6}$/.test(b.id) ? b.id : null;
    if (!id || used.has(id)) id = null;
    if (id) used.add(id);

    return {
      id,
      label: normalizeLabel(b.label),
      p: typeof b.p === 'string' || typeof b.p === 'number' ? String(b.p).slice(0, MAX_PROBABILITY_TEXT) : '',
      children: readBranches(b.children, depthLeft - 1, used),
    };
  });
}

/** Chaque nœud interne doit porter au moins une branche et chaque feuille être à la profondeur `stages`. */
function isComplete(branches, depthLeft) {
  if (branches.length === 0) return false;

  return depthLeft === 1 ? branches.every((b) => b.children.length === 0) : branches.every((b) => isComplete(b.children, depthLeft - 1));
}

function readEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const stage = Number(raw.stage);
  if (!Number.isInteger(stage) || stage < 1 || stage > MAX_STAGES) return null;

  return { stage, label: normalizeLabel(raw.label) };
}

function readQuery(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.kind === 'path' && Array.isArray(raw.path) && raw.path.length >= 1 && raw.path.length <= MAX_STAGES
    && raw.path.every((i) => Number.isInteger(i) && i >= 0 && i < MAX_BRANCHES)) {
    return { kind: 'path', path: [...raw.path] };
  }
  if (raw.kind === 'event' && readEvent(raw.event)) return { kind: 'event', event: readEvent(raw.event) };
  if (raw.kind === 'conditional' && readEvent(raw.target) && readEvent(raw.given)) {
    return { kind: 'conditional', target: readEvent(raw.target), given: readEvent(raw.given) };
  }

  return null;
}

/**
 * N'importe quelle valeur → un arbre sûr. Un arbre incohérent (profondeurs
 * inégales, nœud vide, trop d'étapes) est remplacé par l'arbre par défaut
 * plutôt que dessiné faux ; les identifiants manquants ou dupliqués sont
 * refaits. Ne lève jamais.
 */
export function normalizeTree(raw) {
  if (!raw || typeof raw !== 'object') return createDefaultTree();
  const stages = Number(raw.stages);
  if (!Number.isInteger(stages) || stages < 1 || stages > MAX_STAGES) return createDefaultTree();
  const used = new Set();
  const branches = readBranches(raw.branches, stages, used);
  if (!isComplete(branches, stages)) return createDefaultTree();
  let tree = { stages, branches, presetId: typeof raw.presetId === 'string' ? raw.presetId.slice(0, 32) : null, query: null };
  const nextId = idFactory(tree);
  const fill = (list) => list.map((b) => ({ ...b, id: b.id ?? nextId(), children: fill(b.children) }));
  tree = { ...tree, branches: fill(tree.branches) };

  return keepQuery({ ...tree, query: readQuery(raw.query) });
}

/** L'arbre → ce qu'on enregistre (le même objet, sans rien de calculé). */
export function toStoredTree(tree) {
  const strip = (branches) => branches.map((b) => ({ id: b.id, label: b.label, p: b.p, children: strip(b.children) }));

  return { stages: tree.stages, branches: strip(tree.branches), presetId: tree.presetId, query: tree.query };
}

export function rationalLatex(r) {
  if (r.d === 1) return String(r.n);

  return `\\frac{${r.n}}{${r.d}}`;
}
