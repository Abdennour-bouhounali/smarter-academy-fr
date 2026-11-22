/**
 * L'ÉCRITURE LIBRE d'une متتالية (§31) — du texte de l'élève vers une
 * fonction sûre.
 *
 * ── On n'écrit PAS un second analyseur (§1, §31) ─────────────────────────
 * §31 : « Use a proper mathematical expression parser already available in
 * the project, or introduce a safe parser if necessary. » Il en existe un,
 * éprouvé, testé, et déjà nourri par MathLive : celui du grapheur
 * (`functionGrapher/expressionParser.js` + `expressionEvaluator.js`). Ce
 * module ne fait que l'APPELER avec d'autres variables — `n` et `u` au lieu
 * de `x` — exactement comme `vectors/` réutilise la caméra du grapheur au
 * lieu d'un second repère (MATH_LAB §3). Une seule grammaire sur la
 * plateforme, un seul jeu de fonctions, un seul comportement hors domaine.
 *
 * Et donc, littéralement : **aucun `eval`, aucun `new Function`**. La saisie
 * d'un élève devient un arbre, puis une composition de fermetures. Rien de
 * ce qu'il tape n'est jamais exécuté comme du JavaScript (§31).
 *
 * ── Les deux formes acceptées ────────────────────────────────────────────
 *
 *   explicite    u(n) = f(n)            variable : n
 *   récurrente   u(n+1) = f(u(n), n)    variables : u, n     — `u` est u(n)
 *   second ordre u(n+2) = f(u(n+1), u(n), n)  variables : u, v, n
 *                                             `u` = u(n+1), `v` = u(n)
 *
 * L'élève écrit `2u + 1`, `u/2 + 3`, `u^2 - 1`, `1/n`, `(-1)^n`, `n^2`. Il
 * peut aussi écrire `u(n)` et `u(n+1)` comme dans son cahier : `normalizeSource`
 * les ramène à `u` et `v` AVANT l'analyse, parce que l'analyseur du grapheur
 * lirait `u(n)` comme « u multiplié par n » — un produit implicite, ce qu'il
 * fait très bien et qui serait ici un contresens silencieux.
 */

import { parseExpression } from '../functionGrapher/expressionParser.js';
import { compileExpression } from '../functionGrapher/expressionEvaluator.js';

/** Les variables offertes selon la forme. `n` est toujours là. */
export const EXPLICIT_VARIABLES = Object.freeze(['n']);
export const RECURRENCE_VARIABLES = Object.freeze(['u', 'n']);
export const SECOND_ORDER_VARIABLES = Object.freeze(['u', 'v', 'n']);

/**
 * Ramène les écritures du cahier à des variables simples.
 *
 * `u(n+1)` → `v`… non : l'ordre compte. Le terme le PLUS RÉCENT est `u`,
 * comme dans « u(n+1) = 2u(n) » où `u` désigne u(n). Au second ordre,
 * `u(n+1)` est le plus récent (`u`) et `u(n)` le précédent (`v`). Les
 * remplacements vont donc du plus spécifique au plus général, sinon
 * `u(n+1)` serait mangé par la règle de `u(n)`.
 *
 * On accepte aussi les indices en toutes lettres — `u_n`, `u_{n+1}`, `uₙ` —
 * parce qu'un élève qui copie son manuel écrit cela, et refuser sa notation
 * ne lui apprendrait rien sur les متتاليات.
 */
export function normalizeSource(source, order = 1) {
  let text = String(source ?? '');

  // Les indices Unicode que MathLive ou un copier-coller peuvent produire.
  text = text
    .replace(/\\left\s*\(/g, '(')
    .replace(/\\right\s*\)/g, ')')
    .replace(/uₙ₊₂/g, 'u(n+2)')
    .replace(/uₙ₊₁/g, 'u(n+1)')
    .replace(/uₙ/g, 'u(n)')
    .replace(/u_\{?\s*n\s*\+\s*2\s*\}?/g, 'u(n+2)')
    .replace(/u_\{?\s*n\s*\+\s*1\s*\}?/g, 'u(n+1)')
    .replace(/u_\{?\s*n\s*\}?/g, 'u(n)');

  if (order >= 2) {
    // Second ordre : u(n+1) est le plus récent, u(n) le précédent.
    text = text
      .replace(/u\s*\(\s*n\s*\+\s*1\s*\)/g, 'u')
      .replace(/u\s*\(\s*n\s*\)/g, 'v');
  } else {
    text = text.replace(/u\s*\(\s*n\s*\)/g, 'u');
  }

  return text.trim();
}

/**
 * Retire le membre de gauche si l'élève l'a écrit.
 *
 * Il tapera souvent la ligne entière de son cahier — `u(n+1) = 2u(n) + 1`.
 * On ne peut pas lui répondre « syntaxe invalide » pour avoir écrit sa
 * définition correctement. Seul ce qui suit le `=` est l'expression.
 */
export function stripLeftHandSide(source) {
  const text = String(source ?? '');
  const equals = text.indexOf('=');
  if (equals < 0) return text;
  const left = text.slice(0, equals);

  // On ne coupe que si la gauche RESSEMBLE à un membre gauche de définition
  // (`u(n+1)`, `uₙ₊₁`, `u_n`, `u`) — pas si c'est une équation à résoudre,
  // que cet instrument ne sait pas traiter et ne doit pas faire semblant de lire.
  return /^\s*u\s*(\(|_|ₙ)?[^=]*$/i.test(left) ? text.slice(equals + 1) : text;
}

/**
 * Compile une expression de متتالية.
 *
 * @param {string} source
 * @param {{ order?: 1 | 2, explicit?: boolean }} [options]
 *   `explicit: true` → seule `n` est liée (u(n) = f(n)).
 *   `order: 2`       → `u` et `v` sont liées (u(n+2) = f(u(n+1), u(n), n)).
 * @returns {{ok: true, evaluate: Function, variables: string[], source: string}
 *          | {ok: false, error: {code: string, position?: number, symbol?: string}}}
 *
 * `evaluate` a la signature de la forme demandée :
 *   explicite    (n) => number
 *   ordre 1      (previous, n) => number
 *   ordre 2      (previous, beforePrevious, n) => number
 *
 * Elle ne LÈVE jamais et rend `NaN` hors domaine : c'est déjà le contrat de
 * l'évaluateur du grapheur (`1/0`, `sqrt(-1)`, `ln(0)` → non fini), et
 * `sequenceMath.generate` transforme ce NaN en arrêt propre (§32).
 */
export function compileSequenceExpression(source, options = {}) {
  const explicit = Boolean(options.explicit);
  const order = options.order === 2 ? 2 : 1;
  const variables = explicit
    ? EXPLICIT_VARIABLES
    : (order === 2 ? SECOND_ORDER_VARIABLES : RECURRENCE_VARIABLES);

  const cleaned = normalizeSource(stripLeftHandSide(source), explicit ? 0 : order);
  if (!cleaned) return { ok: false, error: { code: 'empty', position: 0 } };

  const parsed = parseExpression(cleaned, { variables: [...variables] });
  if (!parsed.ok) return { ok: false, error: parsed.error };

  // Une expression explicite qui ne parle pas de `n` est CONSTANTE — c'est
  // licite (u(n) = 5 est une suite), donc on ne la refuse pas. Mais une
  // récurrence qui ne parle pas de `u` n'est pas une récurrence : elle
  // n'itère rien. On la laisse passer quand même — elle donnera une suite
  // constante après le premier terme, ce que l'élève verra tout de suite,
  // et c'est une observation plus instructive qu'un refus.

  let compiled;
  try {
    compiled = compileExpression(parsed.ast);
  } catch {
    // L'évaluateur lève sur un nœud qu'il ne connaît pas. L'analyseur ne
    // devrait jamais en produire, mais on ne laisse pas une exception
    // remonter jusqu'au rendu (§32).
    return { ok: false, error: { code: 'syntax', position: 0 } };
  }

  // `compiled(x, scope)` : le premier argument est la variable `x` du
  // grapheur, que nous n'utilisons pas ; tout passe par `scope`.
  const evaluate = explicit
    ? (n) => safe(compiled, { n })
    : order === 2
      ? (previous, beforePrevious, n) => safe(compiled, { u: previous, v: beforePrevious, n })
      : (previous, n) => safe(compiled, { u: previous, n });

  return { ok: true, evaluate, variables: [...variables], source: cleaned };
}

/** Un appel qui rend toujours un nombre — NaN au pire, jamais une exception. */
function safe(compiled, scope) {
  try {
    const value = compiled(0, scope);

    return typeof value === 'number' ? value : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Un nombre tapé par un élève : `3`, `−2,5`, `1/2`, `٣`.
 *
 * Les champs de paramètres (u₀, r, q, a, b) ne méritent pas l'analyseur
 * complet, mais ils méritent la virgule décimale, le vrai signe moins, les
 * chiffres arabes-indiens et la fraction simple — tout ce qu'un élève
 * algérien a sous les doigts (ARABIC_RTL_CONTRACT). Rendre `NaN` laisse
 * l'appelant garder l'ancienne valeur (`readNumber` de l'état).
 */
export function parseNumberInput(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : NaN;
  if (typeof text !== 'string') return NaN;

  const source = text
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[−–—]/g, '-')
    .replace(/،/g, ',')
    .replace(/\s+/g, '')
    .replace(',', '.');
  if (!source) return NaN;

  const fraction = source.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);

    return denominator === 0 ? NaN : Number(fraction[1]) / denominator;
  }

  return /^-?\d+(?:\.\d+)?$/.test(source) ? Number(source) : NaN;
}
