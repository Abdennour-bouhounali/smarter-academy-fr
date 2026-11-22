/**
 * La RÈGLE que l'élève construit, et ce qu'on en fait — logique pure.
 *
 * Une règle n'est PAS une chaîne de caractères qu'on analyserait : c'est un
 * petit arbre que l'élève assemble avec des boutons (§19 : « ne pas exiger
 * une syntaxe symbolique »). L'arbre se lit, s'évalue et se compare aux
 * mesures — jamais on n'exécute le texte de l'élève.
 *
 *     {kind: 'var',  name: 'length'}
 *     {kind: 'num',  value: 2}
 *     {kind: 'const', name: 'pi'}
 *     {kind: 'op',   op: '*', left: …, right: …}
 *     {kind: 'pow',  base: …, exponent: 2}
 *
 * ── Ce que ce module refuse de faire ────────────────────────────────────
 * Il ne dit jamais « faux ». Il rend des FAITS : pour chaque observation, ce
 * que la règle prédit et ce que la mesure donne. C'est l'écran qui met un ✓
 * ou un ✗ à côté, et c'est le CONTRE-EXEMPLE (la ligne où l'écart est le
 * plus net) qui fait le travail pédagogique (§7).
 */

import { cleanNumber, nearlyEqual } from './measureMath.js';

/** Les opérations que la barre d'outils propose (§19). */
export const OPERATORS = Object.freeze(['+', '-', '*', '/']);

/** Les constantes posables : les petits entiers du programme, et π. */
export const RULE_CONSTANTS = Object.freeze([2, 3, 4]);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

// ── Les constructeurs (ce que les boutons posent) ────────────────────────

export const variable = (name) => ({ kind: 'var', name });
export const number = (value) => ({ kind: 'num', value: cleanNumber(value) });
export const constant = (name) => ({ kind: 'const', name });
export const operation = (op, left, right) => ({ kind: 'op', op, left, right });
export const power = (base, exponent) => ({ kind: 'pow', base, exponent: Math.round(exponent) });

/** La valeur d'une constante nommée. */
function constantValue(name) {
  return name === 'pi' ? Math.PI : NaN;
}

// ── La relecture (frontière avec le JSON stocké) ─────────────────────────

/**
 * Un nœud relu depuis un document, ou `null`.
 *
 * La profondeur est bornée : un arbre de mille étages viendrait d'un
 * document trafiqué, pas d'un élève qui a cliqué sur des boutons. Il est
 * rejeté au lieu de faire exploser la pile à l'évaluation.
 */
const MAX_RULE_DEPTH = 8;

export function normalizeRule(raw, depth = 0) {
  if (!isPlainObject(raw) || depth > MAX_RULE_DEPTH) return null;

  if (raw.kind === 'var') {
    return typeof raw.name === 'string' && raw.name.length > 0 && raw.name.length <= 32
      ? variable(raw.name)
      : null;
  }
  if (raw.kind === 'num') {
    return Number.isFinite(Number(raw.value)) ? number(Number(raw.value)) : null;
  }
  if (raw.kind === 'const') {
    return raw.name === 'pi' ? constant('pi') : null;
  }
  if (raw.kind === 'op') {
    if (!OPERATORS.includes(raw.op)) return null;
    const left = normalizeRule(raw.left, depth + 1);
    const right = normalizeRule(raw.right, depth + 1);

    return left && right ? operation(raw.op, left, right) : null;
  }
  if (raw.kind === 'pow') {
    const base = normalizeRule(raw.base, depth + 1);
    const exponent = Math.round(Number(raw.exponent));
    if (!base || !Number.isFinite(exponent) || exponent < 2 || exponent > 3) return null;

    return power(base, exponent);
  }

  return null;
}

// ── L'évaluation ─────────────────────────────────────────────────────────

/**
 * La valeur d'une règle pour une observation donnée.
 *
 * Une variable que l'observation ne contient pas rend NaN — et NaN se
 * propage : une règle incomplète ne prédit rien, elle ne prédit pas zéro.
 * Une division par zéro rend NaN pour la même raison.
 */
export function evaluateRule(node, values) {
  if (!isPlainObject(node)) return NaN;

  switch (node.kind) {
    case 'num':
      return node.value;
    case 'const':
      return constantValue(node.name);
    case 'var': {
      const value = values?.[node.name];

      return Number.isFinite(value) ? value : NaN;
    }
    case 'op': {
      const left = evaluateRule(node.left, values);
      const right = evaluateRule(node.right, values);
      if (!Number.isFinite(left) || !Number.isFinite(right)) return NaN;
      if (node.op === '+') return cleanNumber(left + right);
      if (node.op === '-') return cleanNumber(left - right);
      if (node.op === '*') return cleanNumber(left * right);
      if (node.op === '/') return Math.abs(right) < 1e-12 ? NaN : cleanNumber(left / right);

      return NaN;
    }
    case 'pow': {
      const base = evaluateRule(node.base, values);

      return Number.isFinite(base) ? cleanNumber(base ** node.exponent) : NaN;
    }
    default:
      return NaN;
  }
}

/** La règle est-elle complète (aucun trou) ? Un trou est un nœud manquant. */
export function isComplete(node) {
  if (!isPlainObject(node)) return false;
  if (node.kind === 'num' || node.kind === 'const') return true;
  if (node.kind === 'var') return typeof node.name === 'string' && node.name.length > 0;
  if (node.kind === 'op') return isComplete(node.left) && isComplete(node.right);
  if (node.kind === 'pow') return isComplete(node.base);

  return false;
}

/** Les variables qu'une règle utilise, sans doublon. */
export function ruleVariables(node, found = new Set()) {
  if (!isPlainObject(node)) return found;
  if (node.kind === 'var') found.add(node.name);
  if (node.kind === 'op') {
    ruleVariables(node.left, found);
    ruleVariables(node.right, found);
  }
  if (node.kind === 'pow') ruleVariables(node.base, found);

  return found;
}

// ── L'écriture (ce que l'élève lit de sa propre règle) ───────────────────

const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2 };

/**
 * La règle en texte, avec le symbole de chaque variable (« A = L × l »).
 *
 * Les parenthèses ne sont posées QUE là où elles changent le sens : une
 * règle lue « L × l + 2 » quand l'élève a construit (L × l) + 2 se lit
 * pareil, mais « L × (l + 2) » doit garder les siennes. L'expression reste
 * en LTR même en arabe (§30) — c'est de la mathématique.
 *
 * @param {object} node
 * @param {(name: string) => string} symbolOf   le symbole d'une variable
 */
export function formatRule(node, symbolOf = (name) => name) {
  return write(node, 0, symbolOf);
}

function write(node, parentPrecedence, symbolOf) {
  if (!isPlainObject(node)) return '…';

  switch (node.kind) {
    case 'num':
      return formatNumber(node.value);
    case 'const':
      return node.name === 'pi' ? 'π' : '…';
    case 'var':
      return symbolOf(node.name) ?? node.name;
    case 'pow':
      return `${write(node.base, 3, symbolOf)}${node.exponent === 3 ? '³' : '²'}`;
    case 'op': {
      const precedence = PRECEDENCE[node.op] ?? 0;
      const sign = node.op === '*' ? '×' : node.op === '/' ? '÷' : node.op === '-' ? '−' : '+';
      const text = `${write(node.left, precedence, symbolOf)} ${sign} ${write(node.right, precedence + 1, symbolOf)}`;

      return precedence < parentPrecedence ? `(${text})` : text;
    }
    default:
      return '…';
  }
}

/** Un nombre de règle : virgule décimale et vrai signe moins, comme partout. */
function formatNumber(value) {
  if (!Number.isFinite(value)) return '…';
  const rounded = Number(value.toFixed(4));

  return String(rounded).replace('.', ',').replace('-', '−');
}

// ── L'ÉPREUVE : la règle face aux mesures ────────────────────────────────

/**
 * La tolérance d'une vérification.
 *
 * Elle est RELATIVE, parce que les mesures ne sont pas toutes du même ordre :
 * une circonférence de 31,4 et une aire de 314 ne peuvent pas partager un
 * écart absolu. Une règle juste doit passer même quand l'élève mesure à la
 * graduation près (§27), une règle fausse doit échouer franchement.
 */
const RULE_TOLERANCE = 0.02;

/**
 * Confronte une règle à UNE observation.
 *
 * @returns {{predicted: number, measured: number, matches: boolean, gap: number}}
 */
function testAgainstObservation(node, observation, targetKey) {
  const values = observation?.values ?? {};
  const predicted = evaluateRule(node, values);
  const measured = Number.isFinite(values[targetKey]) ? values[targetKey] : NaN;
  if (!Number.isFinite(predicted) || !Number.isFinite(measured)) {
    return { predicted, measured, matches: false, gap: NaN };
  }
  const gap = cleanNumber(Math.abs(predicted - measured));
  const scale = Math.max(1, Math.abs(measured));

  return { predicted, measured, matches: gap / scale <= RULE_TOLERANCE, gap };
}

/**
 * Confronte une règle à TOUTES les observations, et rend ce qu'il faut pour
 * en parler à l'élève (§20, §7).
 *
 * Le champ qui compte est `counterexample` : la ligne où la règle s'écarte
 * le PLUS de la mesure. C'est elle qu'on montre, parce que « ta règle donne 7
 * là où j'ai mesuré 12 » enseigne quelque chose, là où « incorrect »
 * n'enseigne rien.
 *
 * `verdict` :
 *   - `empty`      — rien à confronter, il faut d'abord mesurer
 *   - `incomplete` — la règle a encore un trou
 *   - `holds`      — elle tient sur toutes les observations connues
 *   - `fails`      — au moins une observation la contredit
 *
 * `holds` ne dit PAS « c'est vrai » : il dit « elle tient sur ce que tu as
 * mesuré » (§21). Le mot « démontré » n'apparaît nulle part.
 */
export function testRule(node, observations, targetKey) {
  const rows = Array.isArray(observations) ? observations : [];
  if (!isComplete(node)) {
    return { verdict: 'incomplete', results: [], passed: 0, failed: 0, counterexample: null };
  }
  if (rows.length === 0) {
    return { verdict: 'empty', results: [], passed: 0, failed: 0, counterexample: null };
  }

  const results = rows.map((observation) => ({
    id: observation?.id ?? null,
    values: observation?.values ?? {},
    ...testAgainstObservation(node, observation, targetKey),
  }));

  const failures = results.filter((result) => !result.matches);
  // Le contre-exemple le plus PARLANT : le plus grand écart relatif, et à
  // égalité le premier rencontré — pour que le même état montre toujours la
  // même ligne (aucun hasard dans cet instrument).
  const counterexample = failures.length === 0 ? null : failures.reduce((worst, candidate) => {
    const scale = (row) => Math.max(1, Math.abs(row.measured));
    const relative = (row) => (Number.isFinite(row.gap) ? row.gap / scale(row) : Infinity);

    return relative(candidate) > relative(worst) ? candidate : worst;
  });

  return {
    verdict: failures.length === 0 ? 'holds' : 'fails',
    results,
    passed: results.length - failures.length,
    failed: failures.length,
    counterexample,
  };
}

/**
 * Deux règles sont-elles la MÊME relation ?
 *
 * On ne compare pas les arbres : `2 × L + 2 × l` et `2 × (L + l)` sont deux
 * arbres différents et une seule règle, et un élève qui trouve la seconde
 * après la première a bien simplifié (§8). On les compare donc sur des
 * VALEURS — un échantillon déterministe de jeux de variables, choisi sans
 * hasard pour que le résultat soit reproductible.
 */
export function sameRelation(a, b, variables) {
  if (!isComplete(a) || !isComplete(b)) return false;
  const names = Array.isArray(variables) ? variables : [...ruleVariables(a), ...ruleVariables(b)];
  if (names.length === 0) return nearlyEqual(evaluateRule(a, {}), evaluateRule(b, {}), 1e-9);

  // Des échantillons premiers entre eux : ils séparent L × l de L + l, et
  // aussi 2L + 2l de L + 3l, ce qu'un échantillon symétrique ne ferait pas.
  const samples = [2, 3, 5, 7, 11, 13];
  for (let shift = 0; shift < 4; shift += 1) {
    const values = {};
    names.forEach((name, index) => {
      values[name] = samples[(index + shift) % samples.length] + shift;
    });
    const left = evaluateRule(a, values);
    const right = evaluateRule(b, values);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (!nearlyEqual(left, right, 1e-9)) return false;
  }

  return true;
}
