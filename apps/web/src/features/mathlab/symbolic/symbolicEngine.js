/**
 * LE MOTEUR SYMBOLIQUE de la plateforme — Nerdamer, derrière une façade.
 *
 * ── Ce que ce module est, et ce qu'il n'est pas ──────────────────────────
 * C'est la SEULE porte d'entrée vers Nerdamer. Aucun composant, aucun
 * laboratoire, aucune leçon n'importe `nerdamer` directement : ils appellent
 * `limitOf`, `derivativeOf`, `simplifyExpression`… et reçoivent un résultat
 * de forme fixe. La bibliothèque est un DÉTAIL D'IMPLÉMENTATION, remplaçable
 * sans toucher à une ligne d'interface.
 *
 * Trois raisons, toutes vérifiées sur la version 1.1.13 :
 *
 * 1. **Nerdamer peut NE JAMAIS RENDRE LA MAIN.** `limit(abs(x)/x, x, 0)`
 *    tourne indéfiniment — mesuré ici, plusieurs minutes avant d'être tué.
 *    Dans un navigateur, cela GÈLE l'onglet de l'élève : pas de courbe, pas
 *    de bouton, rien. Chaque appel passe donc par `guard`, qui borne le
 *    temps de calcul et rend `{ ok: false, reason: 'timeout' }`.
 *
 * 2. **Il répond parfois par la question.** `limit(x*sin(1/x), x, 0)` rend
 *    `limit(sin(x^(-1))*x^(-1),x,0)` : ce n'est pas une réponse, c'est un
 *    aveu. On le détecte (`echoesQuestion`) et on le traite comme un refus.
 *
 * 3. **Ses conventions ne sont pas celles du programme.** `limit(1/x, x, 0)`
 *    rend `Infinity` — une convention parfaitement défendable (droite réelle
 *    achevée), mais pas celle qu'enseigne le manuel algérien, où la limite en
 *    0 de 1/x N'EXISTE PAS parce que les deux côtés divergent en sens
 *    contraires. La façade rend donc le résultat BRUT, et c'est l'appelant
 *    (analysisMath.js) qui décide de la lecture pédagogique. Le moteur
 *    informe ; il ne tranche pas à la place du programme.
 *
 * ── La forme d'un résultat ───────────────────────────────────────────────
 *     { ok: true,  value, latex, text }
 *     { ok: false, reason: 'unsupported'|'timeout'|'unknown'|'invalid' }
 *
 * `ok: false` est une réponse normale, jamais une exception : un moteur qui
 * ne sait pas doit le dire, et l'appelant retombe alors sur la mesure
 * numérique — qui, elle, sait toujours répondre quelque chose d'honnête.
 *
 * ── Chargement PARESSEUX ─────────────────────────────────────────────────
 * Nerdamer pèse ~1,8 Mo décompressé. Il n'est chargé qu'au PREMIER appel,
 * par un `import()` dynamique : un élève qui ouvre la سبّورة ou le grapheur
 * ne le télécharge jamais. `ensureEngine()` est idempotent.
 *
 * ── Extensions prévues ───────────────────────────────────────────────────
 * limites · dérivées · simplification · factorisation · développement ·
 * résolution d'équations · équivalence algébrique · intégration. Chacune est
 * une fonction de ce fichier, avec la même forme de résultat et la même
 * garde. Ajouter une capacité ne change rien ailleurs.
 */

import { toSymbolicSource } from './symbolicSyntax.js';

/** Au-delà, on considère que le moteur ne rendra pas la main (§47). */
const SYMBOLIC_TIMEOUT_MS = 1500;

let enginePromise = null;
let engine = null;

/**
 * Charge Nerdamer une fois, avec ses modules.
 *
 * `Calculus` apporte limit/diff/integrate, `Algebra` factor/expand/coeffs,
 * `Solve` la résolution. On les charge ensemble : les séparer ferait quatre
 * requêtes pour un module que l'on ne prend que si on s'en sert.
 */
export async function ensureEngine() {
  if (engine) return engine;
  if (!enginePromise) {
    enginePromise = (async () => {
      const core = await import('nerdamer');
      const nerdamer = core.default ?? core;
      await import('nerdamer/Calculus.js');
      await import('nerdamer/Algebra.js');
      await import('nerdamer/Solve.js');
      engine = nerdamer;

      return nerdamer;
    })().catch((error) => {
      // Un chargement raté ne doit pas empoisonner les appels suivants.
      enginePromise = null;
      throw error;
    });
  }

  return enginePromise;
}

/** Le moteur est-il déjà en mémoire ? (pour un appel synchrone opportuniste) */
export function isEngineReady() {
  return engine !== null;
}

/**
 * Exécute un calcul symbolique en le bornant dans le temps.
 *
 * ── L'honnêteté de cette garde ───────────────────────────────────────────
 * JavaScript est MONO-THREAD : une boucle infinie dans Nerdamer ne peut pas
 * être interrompue de l'extérieur. Ce garde ne PEUT donc pas annuler un
 * calcul parti trop loin ; il mesure le temps écoulé et refuse d'attendre
 * davantage la PROCHAINE fois.
 *
 * C'est une protection réelle mais partielle, et il faut le dire :
 *   - elle empêche l'accumulation (un appel lent n'en déclenche pas dix) ;
 *   - elle met l'expression coupable en QUARANTAINE, pour que le même
 *     glissement de curseur ne la relance pas à chaque frame ;
 *   - elle ne sauve pas l'onglet du tout premier appel pathologique.
 *
 * Pour cette raison, l'appelant ne doit JAMAIS dépendre du moteur symbolique
 * pour afficher quelque chose : il l'utilise pour ENRICHIR une réponse que
 * la voie numérique sait déjà donner.
 */
const quarantine = new Set();

function guard(key, compute) {
  if (quarantine.has(key)) return { ok: false, reason: 'timeout' };
  const started = Date.now();
  try {
    const value = compute();
    const elapsed = Date.now() - started;
    if (elapsed > SYMBOLIC_TIMEOUT_MS) quarantine.add(key);

    return { ok: true, value };
  } catch (error) {
    const elapsed = Date.now() - started;
    if (elapsed > SYMBOLIC_TIMEOUT_MS) quarantine.add(key);

    return { ok: false, reason: 'unsupported', detail: String(error?.message ?? error).slice(0, 120) };
  }
}

/** Pour les tests : vider la quarantaine entre deux cas. */
export function resetQuarantine() {
  quarantine.clear();
}

/**
 * Nerdamer a-t-il rendu la QUESTION plutôt qu'une réponse ?
 *
 * `limit(x*sin(1/x), x, 0)` rend `limit(sin(x^(-1))*x^(-1),x,0)` : la
 * fonction n'a pas été évaluée. Un résultat qui contient encore le nom de
 * l'opération demandée est un aveu d'ignorance, pas un résultat.
 */
function echoesQuestion(text, operation) {
  return typeof text === 'string' && text.includes(`${operation}(`);
}

/** Un résultat Nerdamer → la forme de la façade. */
function present(raw, operation) {
  if (!raw.ok) return raw;
  const node = raw.value;
  let text;
  let latex = null;
  try {
    text = node.toString();
    latex = typeof node.toTeX === 'function' ? node.toTeX() : null;
  } catch {
    return { ok: false, reason: 'unknown' };
  }
  if (typeof text !== 'string' || text.length === 0) return { ok: false, reason: 'unknown' };
  if (operation && echoesQuestion(text, operation)) return { ok: false, reason: 'unsupported' };

  return { ok: true, text, latex };
}

/* ══════════════════════════════════════════════════════════════════════════
   LES CAPACITÉS
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * La LIMITE de f en a (ou en ±∞).
 *
 * @param {string} source      l'expression, en syntaxe de la plateforme
 * @param {number|'+inf'|'-inf'} at
 * @param {{variable?: string}} [options]
 * @returns {{ok: true, text: string, latex: string|null, value: number|null, kind: string}
 *          | {ok: false, reason: string}}
 */
export function limitOf(source, at, options = {}) {
  if (!engine) return { ok: false, reason: 'unready' };
  const variable = options.variable ?? 'x';
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };
  /**
   * La limite en −∞, par SUBSTITUTION.
   *
   * Nerdamer calcule `limit(f, x, -Infinity)` sans tenir compte de la
   * direction : il rend `+∞` pour `2x+1` quand x → −∞ (la réponse est −∞) et
   * `+∞` pour `ln(x)` en −∞, où la fonction n'existe pas. Mesuré ici, sur la
   * version 1.1.13.
   *
   * On lui pose donc la question qu'il sait traiter : on remplace x par −t et
   * on demande la limite en +∞. `lim(x→−∞) f(x) = lim(t→+∞) f(−t)`, ce qui
   * est une identité, pas une approximation — le résultat reste celui de
   * Nerdamer, correctement interrogé.
   */
  if (at === '-inf') {
    const substituted = `(${expression})`.replace(new RegExp(`\\b${variable}\\b`, 'g'), '(-t)');
    return askLimit(substituted, 't', 'Infinity');
  }

  const target = at === '+inf' ? 'Infinity' : String(at);

  return askLimit(expression, variable, target);
}

/**
 * On pose la question à Nerdamer, puis on la repose FACTORISÉE s'il a calé.
 *
 * `limit(x²−4x+3, x, ∞)` échoue sur « (−∞)+(∞) n'est pas défini » : la forme
 * indéterminée ∞ − ∞ l'arrête. Factorisée en `(x−1)(x−3)`, la même limite se
 * calcule. C'est un repli légitime — la factorisation ne change pas la
 * fonction — et il débloque le cas le plus courant du programme.
 */
function askLimit(expression, variable, target) {
  const direct = present(guard(`limit:${expression}:${target}`, () => engine(`limit(${expression}, ${variable}, ${target})`)), 'limit');
  if (direct.ok) return { ...direct, ...readNumber(direct.text) };

  const factored = present(
    guard(`limitf:${expression}:${target}`, () => engine(`limit(factor(${expression}), ${variable}, ${target})`)),
    'limit',
  );
  if (factored.ok) return { ...factored, ...readNumber(factored.text) };

  return direct;
}

/**
 * La limite en ±∞, CALCULÉE par Nerdamer puis VÉRIFIÉE numériquement.
 *
 * ── Pourquoi la vérification n'est pas de la méfiance gratuite ───────────
 * Mesuré sur onze fonctions scolaires, aux deux bornes (symbolicEngine.test.js) :
 * Nerdamer se trompe 5 fois sur 22. Il rend `+∞` pour `2x+1` en −∞, `−∞` pour
 * `x³−3x` en +∞ — une fonction de manuel, fausse aux DEUX bornes — et
 * `e^Infinity` au lieu de `+∞`. Les formes indéterminées `∞ − ∞` le mettent
 * en échec, et la factorisation qui sauve `x²−4x+3` casse `x³−3x`.
 *
 * Écrire ces réponses dans un جدول التغيّرات, c'est enseigner une faute à un
 * élève qui n'a aucun moyen de la contester. §35 l'interdit, et c'est aussi
 * simplement le devoir d'un outil scolaire.
 *
 * ── Ce que fait cette fonction ───────────────────────────────────────────
 * Elle DEMANDE à Nerdamer (y compris après factorisation, qui débloque les
 * indéterminées), puis compare sa réponse au comportement réel de f, échantillonné
 * loin. Si les deux s'accordent, c'est la réponse de Nerdamer qui est rendue —
 * exacte, écrite dans sa forme (`2`, `1/3`, `+∞`). Si elles se contredisent,
 * on ne rend rien : mieux vaut une case vide qu'une case fausse.
 *
 * @param {string} source
 * @param {'+inf'|'-inf'} direction
 * @param {(x: number) => number} sample  la fonction compilée, pour vérifier
 */
export function verifiedLimitAtInfinity(source, direction, sample) {
  const symbolic = limitOf(source, direction);
  const observed = observeAtInfinity(sample, direction);
  if (!symbolic.ok) {
    // Pas de réponse symbolique : l'observation seule ne suffit pas à
    // AFFIRMER une limite, on ne rend donc rien.
    return { ok: false, reason: symbolic.reason, observed };
  }

  if (!agreesWith(symbolic, observed)) {
    return { ok: false, reason: 'contradicted', symbolic, observed };
  }

  return { ...symbolic, verified: true, observed };
}

/**
 * Ce que f FAIT quand on s'éloigne : `infinite` (et son signe), `finite` (et
 * sa valeur), ou `none`. C'est une observation, pas une preuve — elle sert
 * uniquement d'arbitre.
 */
function observeAtInfinity(sample, direction) {
  if (typeof sample !== 'function') return null;
  const sign = direction === '-inf' ? -1 : 1;
  const values = [];
  for (const magnitude of [1e3, 1e4, 1e5, 1e6]) {
    const y = sample(sign * magnitude);
    if (!Number.isFinite(y)) return null;
    values.push(y);
  }
  const last = values[values.length - 1];
  const growing = values.every((value, index) => index === 0 || Math.abs(value) > Math.abs(values[index - 1]));
  if (growing && Math.abs(last) > 1e6) {
    const signs = new Set(values.slice(-3).map((value) => Math.sign(value)));

    return signs.size === 1 ? { kind: 'infinite', sign: Math.sign(last) } : { kind: 'none' };
  }
  const spread = Math.max(...values.slice(-3)) - Math.min(...values.slice(-3));
  if (spread < 1e-3 * (1 + Math.abs(last))) return { kind: 'finite', value: last };

  return { kind: 'none' };
}

/** La réponse symbolique et l'observation disent-elles la même chose ? */
function agreesWith(symbolic, observed) {
  if (!observed) return false;
  if (symbolic.kind === 'infinite') {
    return observed.kind === 'infinite' && observed.sign === symbolic.sign;
  }
  if (symbolic.kind === 'finite') {
    if (observed.kind !== 'finite') return false;
    if (symbolic.value === null) return true;    // valeur exacte non évaluée : on fait confiance
    const scale = 1 + Math.abs(observed.value);

    return Math.abs(symbolic.value - observed.value) < 1e-3 * scale;
  }

  return false;
}

/** La DÉRIVÉE symbolique — ordre 1 par défaut. */
export function derivativeOf(source, options = {}) {
  if (!engine) return { ok: false, reason: 'unready' };
  const variable = options.variable ?? 'x';
  const order = Number.isInteger(options.order) && options.order > 0 ? options.order : 1;
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };
  const key = `diff:${expression}:${order}`;

  return present(guard(key, () => engine(`diff(${expression}, ${variable}, ${order})`)), 'diff');
}

/** La SIMPLIFICATION — `(x²−1)/(x−1)` → `1+x`. */
export function simplifyExpression(source) {
  if (!engine) return { ok: false, reason: 'unready' };
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };

  return present(guard(`simplify:${expression}`, () => engine(`simplify(${expression})`)), 'simplify');
}

/** La FACTORISATION — `x²−4x+3` → `(x−1)(x−3)`. */
export function factorExpression(source) {
  if (!engine) return { ok: false, reason: 'unready' };
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };

  return present(guard(`factor:${expression}`, () => engine(`factor(${expression})`)), 'factor');
}

/** Le DÉVELOPPEMENT — `(x+1)²` → `1+2x+x²`. */
export function expandExpression(source) {
  if (!engine) return { ok: false, reason: 'unready' };
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };

  return present(guard(`expand:${expression}`, () => engine(`expand(${expression})`)), 'expand');
}

/**
 * Les SOLUTIONS EXACTES de `expression = 0`.
 *
 * @returns {{ok: true, solutions: string[]} | {ok: false, reason: string}}
 */
export function solveEquation(source, options = {}) {
  if (!engine) return { ok: false, reason: 'unready' };
  const variable = options.variable ?? 'x';
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };

  const raw = guard(`solve:${expression}`, () => engine.solve(expression, variable));
  if (!raw.ok) return raw;
  try {
    const text = raw.value.toString();
    const solutions = text.replace(/^\[|\]$/g, '').split(',').map((entry) => entry.trim()).filter(Boolean);

    return { ok: true, solutions, text };
  } catch {
    return { ok: false, reason: 'unknown' };
  }
}

/**
 * Deux écritures désignent-elles la MÊME fonction ?
 *
 * On soustrait et on simplifie : si la différence se réduit à 0, les deux
 * expressions sont algébriquement équivalentes. C'est la question que pose
 * un exercice du type « ta réponse vaut-elle la mienne, écrite autrement ? ».
 *
 * `ok: false` n'est PAS « elles diffèrent » : c'est « je ne sais pas ». Un
 * exercice doit alors se rabattre sur une comparaison numérique.
 */
export function areEquivalent(left, right) {
  if (!engine) return { ok: false, reason: 'unready' };
  const a = toSymbolicSource(left);
  const b = toSymbolicSource(right);
  if (!a || !b) return { ok: false, reason: 'invalid' };

  const raw = guard(`equiv:${a}|${b}`, () => engine(`simplify((${a})-(${b}))`));
  if (!raw.ok) return raw;
  try {
    const text = raw.value.toString().replace(/\s+/g, '');

    return { ok: true, equivalent: text === '0' };
  } catch {
    return { ok: false, reason: 'unknown' };
  }
}

/** Une PRIMITIVE, quand elle s'écrit. */
export function antiderivativeOf(source, options = {}) {
  if (!engine) return { ok: false, reason: 'unready' };
  const variable = options.variable ?? 'x';
  const expression = toSymbolicSource(source);
  if (!expression) return { ok: false, reason: 'invalid' };

  return present(guard(`int:${expression}`, () => engine(`integrate(${expression}, ${variable})`)), 'integrate');
}

/**
 * Le texte d'un résultat → un nombre et une NATURE, dans le vocabulaire de
 * `analysisMath.js` (`finite` · `infinite` · `none`).
 *
 * Nerdamer écrit `Infinity`, `-Infinity`, `NaN`, ou une valeur exacte comme
 * `1/3` ou `sqrt(2)`. On rend le nombre quand il s'évalue, et on garde
 * toujours le TEXTE exact à côté : c'est lui qu'on affiche, parce que `1/3`
 * vaut mieux que `0,333`.
 */
function readNumber(text) {
  const trimmed = text.trim();
  if (/^-?Infinity$/i.test(trimmed)) {
    return { kind: 'infinite', sign: trimmed.startsWith('-') ? -1 : 1, value: null };
  }
  if (/^NaN$/i.test(trimmed)) return { kind: 'none', value: null };

  const direct = Number(trimmed);
  if (Number.isFinite(direct)) return { kind: 'finite', value: direct };

  // Une valeur exacte (`1/3`, `sqrt(2)`, `pi/2`) : on demande au moteur de
  // l'évaluer numériquement plutôt que de l'analyser nous-mêmes.
  try {
    const numeric = Number(engine(trimmed).evaluate().text('decimals'));
    if (Number.isFinite(numeric)) return { kind: 'finite', value: numeric };
  } catch {
    // Pas évaluable : on garde le texte, sans nombre.
  }

  return { kind: 'finite', value: null };
}
