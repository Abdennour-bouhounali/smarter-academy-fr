/**
 * PRÉDIRE → RÉVÉLER → VÉRIFIER (§36 – §41) — logique PURE.
 *
 * Générer une question, la juger, donner des indices qui découvrent le
 * raisonnement au lieu de livrer la réponse. Pas de React, pas de hasard
 * caché : le générateur reçoit son `random`, ce qui rend chaque question
 * reproductible dans un test.
 *
 * ── Le principe qui gouverne tout ce fichier ─────────────────────────────
 * Une réponse fausse ne BLOQUE jamais — c'est la règle de l'atelier, déjà tenue
 * par la trigonométrie, les suites et les transformations. L'élève prédit, le
 * laboratoire MONTRE la géométrie, et la figure lui dit elle-même où il en
 * était. Rien ici ne rend « faux » sans rendre en même temps la bonne
 * réponse et de quoi la voir.
 *
 * ── Des valeurs propres (§41) ────────────────────────────────────────────
 * Tous les paramètres tirés sont entiers, et les rayons/demi-axes sont
 * choisis pour que les foyers et les sommets tombent juste : une ellipse
 * (5, 3) a ses foyers en ±4, une hyperbole (3, 4) en ±5. Un élève qui
 * cherche « où est le foyer » doit lire un nombre, pas 4,472135955.
 */

import * as C from './conicMath.js';
import { formatCanonical } from './conicParser.js';
import * as I from './intersections.js';

/** Les familles de questions (§36 – §39). */
export const CHALLENGE_KINDS = Object.freeze([
  'centerRadius', // §36 — lire le centre et le rayon d'un cercle
  'vertex', // §36 — le sommet d'une parabole
  'focus', // §36 — un foyer d'une ellipse
  'asymptote', // §36 — les asymptotes d'une hyperbole
  'matchGraph', // §37 — quel graphe correspond à cette équation ?
  'parameter', // §38 — quelle valeur de h amène le centre en x = 4 ?
  'intersectionCount', // §39 — combien de points d'intersection ?
  'pointPosition', // §32 — P est-il dedans, dessus, dehors ?
]);

const randomInt = (random, min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (random, list) => list[Math.floor(random() * list.length)];
const nonZero = (random, min, max) => {
  const value = randomInt(random, min, max);

  return value === 0 ? max : value;
};

/**
 * Les COUPLES PYTHAGORICIENS du programme — ceux qui donnent des foyers
 * entiers. (3,4,5) et (6,8,10) pour l'hyperbole ; (5,3,4) et (13,5,12) pour
 * l'ellipse, où c² = a² − b².
 */
const ELLIPSE_TRIPLES = Object.freeze([[5, 3, 4], [5, 4, 3], [13, 5, 12], [10, 6, 8], [13, 12, 5]]);
const HYPERBOLA_TRIPLES = Object.freeze([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [12, 5, 13]]);

/**
 * Une question d'entraînement.
 *
 * Elle porte TOUT ce qu'il faut pour être posée, jugée, révélée et
 * expliquée : l'objet (`conic`, parfois `line` ou `point`), la réponse
 * (`answer`), la forme attendue (`answerKind`), les choix de §37/§39, et la
 * suite d'indices de §40. L'interface n'en calcule aucun.
 *
 * @param {() => number} random
 * @param {{kind?: string}} [options]
 */
export function generateChallenge(random = Math.random, options = {}) {
  const kind = options.kind && CHALLENGE_KINDS.includes(options.kind)
    ? options.kind
    : pick(random, CHALLENGE_KINDS);

  switch (kind) {
    case 'centerRadius': return centerRadiusChallenge(random);
    case 'vertex': return vertexChallenge(random);
    case 'focus': return focusChallenge(random);
    case 'asymptote': return asymptoteChallenge(random);
    case 'matchGraph': return matchGraphChallenge(random);
    case 'parameter': return parameterChallenge(random);
    case 'intersectionCount': return intersectionCountChallenge(random);
    case 'pointPosition': return pointPositionChallenge(random);
    default: return centerRadiusChallenge(random);
  }
}

/** §36 — « (x−2)² + (y+3)² = 16 : où est le centre ? » */
function centerRadiusChallenge(random) {
  const conic = {
    kind: 'circle', h: randomInt(random, -5, 5), k: randomInt(random, -5, 5), r: randomInt(random, 1, 6),
  };

  return {
    kind: 'centerRadius',
    conic,
    prompt: 'centerRadius',
    answerKind: 'point',
    answer: { x: conic.h, y: conic.k },
    extra: { radius: conic.r },
    equation: formatCanonical(conic),
    hints: ['compareForm', 'readShift', 'readRadius'],
  };
}

/** §36 — « y = 2(x−1)² − 3 : où est le sommet ? » */
function vertexChallenge(random) {
  const conic = {
    kind: 'parabola',
    h: randomInt(random, -4, 4),
    k: randomInt(random, -4, 4),
    a: pick(random, [-2, -1, -0.5, 0.5, 1, 2]),
    orientation: 'horizontal',
  };

  return {
    kind: 'vertex',
    conic,
    prompt: 'vertex',
    answerKind: 'point',
    answer: { x: conic.h, y: conic.k },
    extra: { opening: C.parabolaFeatures(conic).opening },
    equation: formatCanonical(conic),
    hints: ['compareVertexForm', 'readVertexShift', 'readOpening'],
  };
}

/** §36 — « quel point est un foyer de cette ellipse ? » */
function focusChallenge(random) {
  const [a, b] = pick(random, ELLIPSE_TRIPLES);
  const conic = {
    kind: 'ellipse', h: randomInt(random, -3, 3), k: randomInt(random, -3, 3), a, b,
  };
  const features = C.ellipseFeatures(conic);
  const answer = features.foci[1];

  return {
    kind: 'focus',
    conic,
    prompt: 'focus',
    answerKind: 'choice',
    answer,
    choices: shuffle(random, [
      answer,
      features.foci[0],
      { x: conic.h + a, y: conic.k },
      { x: conic.h, y: conic.k + b },
    ]).map((point, index) => ({ id: `c${index}`, point })),
    // Les DEUX foyers sont justes : le juge l'accepte (§36).
    accepted: features.foci,
    extra: { c: features.c },
    equation: formatCanonical(conic),
    hints: ['focusFormula', 'focusCompute', 'focusAxis'],
  };
}

/** §36 — « quelles sont les asymptotes ? » */
function asymptoteChallenge(random) {
  const [a, b] = pick(random, HYPERBOLA_TRIPLES);
  const conic = {
    kind: 'hyperbola', h: 0, k: 0, a, b, orientation: 'horizontal',
  };
  const [first] = C.hyperbolaFeatures(conic).asymptotes;

  return {
    kind: 'asymptote',
    conic,
    prompt: 'asymptote',
    answerKind: 'choice',
    answer: { slope: first.slope },
    choices: shuffle(random, [
      { slope: b / a }, { slope: a / b }, { slope: 1 }, { slope: (b * b) / (a * a) },
    ]).map((value, index) => ({ id: `c${index}`, slope: value.slope })),
    accepted: [{ slope: b / a }, { slope: -b / a }],
    extra: { a, b },
    equation: formatCanonical(conic),
    hints: ['asymptoteCentre', 'asymptoteSlope', 'asymptoteCompute'],
  };
}

/**
 * §37 — « quel graphe correspond à cette équation ? »
 *
 * Les leurres ne sont pas quelconques : ils portent l'ERREUR que l'élève
 * fait vraiment — le signe du décalage inversé (`h` au lieu de `−h`), et le
 * rayon confondu avec `r²`. Un leurre au hasard n'enseignerait rien.
 */
function matchGraphChallenge(random) {
  const h = nonZero(random, -4, 4);
  const k = nonZero(random, -4, 4);
  const r = randomInt(random, 2, 4);
  const conic = { kind: 'circle', h, k, r };

  const choices = shuffle(random, [
    { conic, correct: true },
    { conic: { kind: 'circle', h: -h, k, r }, correct: false },
    { conic: { kind: 'circle', h, k: -k, r }, correct: false },
    { conic: { kind: 'circle', h, k, r: r * r }, correct: false },
  ]).map((choice, index) => ({ id: `c${index}`, ...choice }));

  return {
    kind: 'matchGraph',
    conic,
    prompt: 'matchGraph',
    answerKind: 'choice',
    answer: choices.find((choice) => choice.correct).id,
    choices,
    equation: formatCanonical(conic),
    hints: ['matchSign', 'matchCenter', 'matchRadius'],
  };
}

/**
 * §38 — « quelle valeur de h amènerait le centre en x = 4 ? »
 *
 * La réponse est un NOMBRE, et la vérification est une manipulation : le
 * laboratoire pose réellement `h` à la valeur donnée et l'élève voit le
 * centre s'y rendre.
 */
function parameterChallenge(random) {
  const conic = {
    kind: 'circle', h: randomInt(random, -5, 5), k: randomInt(random, -4, 4), r: randomInt(random, 1, 4),
  };
  const target = randomInt(random, -5, 5);

  return {
    kind: 'parameter',
    conic,
    prompt: 'parameter',
    answerKind: 'number',
    answer: target,
    extra: { parameter: 'h', target },
    equation: formatCanonical(conic),
    hints: ['parameterMeaning', 'parameterCompare', 'parameterAnswer'],
  };
}

/**
 * §39 — « combien de points d'intersection ? »
 *
 * La droite est tirée de manière à tomber franchement dans l'un des trois
 * cas — sécante, tangente, disjointe — et jamais à un cheveu de la
 * frontière : une question dont la réponse dépend de la septième décimale
 * ne serait pas une question.
 */
function intersectionCountChallenge(random) {
  const r = randomInt(random, 2, 4);
  const conic = {
    kind: 'circle', h: randomInt(random, -3, 3), k: randomInt(random, -3, 3), r,
  };
  const situation = pick(random, ['secant', 'tangent', 'none']);
  // Une droite horizontale à distance choisie du centre : le cas est exact.
  const offset = situation === 'tangent' ? r : situation === 'secant' ? Math.max(0, r - 1) : r + 2;
  const line = I.makeLine(0, conic.k + offset);
  const result = I.lineConicIntersection(conic, line);

  return {
    kind: 'intersectionCount',
    conic,
    line,
    prompt: 'intersectionCount',
    answerKind: 'count',
    answer: result.count,
    choices: [0, 1, 2].map((value) => ({ id: `c${value}`, value })),
    extra: { situation, distance: Math.abs(offset) },
    equation: formatCanonical(conic),
    hints: ['intersectionDistance', 'intersectionCompare', 'intersectionConclude'],
  };
}

/** §32 — « P est-il dedans, dessus ou dehors ? » */
function pointPositionChallenge(random) {
  const conic = {
    kind: 'circle', h: randomInt(random, -3, 3), k: randomInt(random, -3, 3), r: randomInt(random, 2, 5),
  };
  const situation = pick(random, ['inside', 'on', 'outside']);
  const factor = situation === 'inside' ? 0.5 : situation === 'on' ? 1 : 1.6;
  // Sur un rayon horizontal : le point reste à coordonnées entières quand r l'est.
  const point = { x: conic.h + conic.r * factor, y: conic.k };

  return {
    kind: 'pointPosition',
    conic,
    point,
    prompt: 'pointPosition',
    answerKind: 'choice',
    answer: situation,
    choices: ['inside', 'on', 'outside'].map((value) => ({ id: value, value })),
    extra: { distance: C.distance(point, { x: conic.h, y: conic.k }) },
    equation: formatCanonical(conic),
    hints: ['positionSubstitute', 'positionCompare', 'positionConclude'],
  };
}

/** Un mélange reproductible — le `random` fourni, jamais `Math.random` caché. */
function shuffle(random, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}

// ── LE JUGEMENT ──────────────────────────────────────────────────────────

/**
 * La tolérance d'une réponse SAISIE.
 *
 * Un élève qui écrit `2` pour un centre en `2` a raison ; celui qui écrit
 * `2,001` a très probablement cliqué à côté plutôt que compris autre chose.
 * On accepte au centième — assez pour absorber une saisie, trop peu pour
 * valider une confusion.
 */
const ANSWER_TOLERANCE = 0.01;

/**
 * LIRE un nombre saisi : `−2`, `1,5`, `-3/2` (les chiffres arabes-indiens
 * et persans sont encore lus). Rend `NaN`
 * si la saisie est vide ou illisible.
 *
 * ── Pourquoi une fonction, et plus `Number(texte.replace(',', '.'))` ──────
 * `Number('')` vaut 0 : un champ laissé VIDE était jugé « 0 », donc JUSTE
 * dès que la réponse attendue était 0 (un centre sur l'axe). Et le vrai signe
 * moins (U+2212) — celui que le plan AFFICHE — ou les chiffres arabes-indiens
 * rendaient `NaN`, soit un « faux » sur une bonne réponse. Une saisie qu'on
 * n'a pas su lire n'est ni juste ni fausse : l'interface le dit, sans
 * verdict.
 */
export function parseNumberInput(text) {
  if (typeof text === 'number') return Number.isFinite(text) ? text : NaN;
  if (typeof text !== 'string') return NaN;

  const source = text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[−–]/g, '-')
    .replace(/[\u060C\u066B,]/g, '.')
    .replace(/\s+/g, '');
  if (!source) return NaN;

  const number = '[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const fraction = source.match(new RegExp(`^(${number})/(${number})$`));
  if (fraction) {
    const value = Number(fraction[1]) / Number(fraction[2]);

    return Number.isFinite(value) ? value : NaN;
  }

  return new RegExp(`^${number}$`).test(source) ? Number(source) : NaN;
}

/** Un point saisi champ par champ, ou `null` si l'une des coordonnées est illisible. */
export function parsePointInput(draft) {
  const x = parseNumberInput(draft?.x);
  const y = parseNumberInput(draft?.y);

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/**
 * Juger une réponse. Rend TOUJOURS de quoi continuer : ce qui était attendu,
 * et — c'est le point — jamais un blocage.
 *
 * @returns {{correct: boolean, expected: *, given: *}}
 */
export function judge(challenge, given) {
  if (!challenge) return { correct: false, expected: null, given };
  const expected = challenge.answer;

  switch (challenge.answerKind) {
    case 'point': {
      const correct = C.isPoint(given)
        && Math.abs(given.x - expected.x) <= ANSWER_TOLERANCE
        && Math.abs(given.y - expected.y) <= ANSWER_TOLERANCE;

      return { correct, expected, given };
    }
    case 'number': {
      // `Number('')` vaudrait 0 : on relit avec la même règle que la saisie.
      const value = parseNumberInput(given);

      return {
        correct: Number.isFinite(value) && Math.abs(value - expected) <= ANSWER_TOLERANCE,
        expected,
        given,
      };
    }
    case 'count':
      return { correct: Number(given) === expected, expected, given };
    case 'choice': {
      // Certaines questions ont PLUSIEURS bonnes réponses (les deux foyers,
      // les deux asymptotes) : `accepted` les porte toutes.
      if (Array.isArray(challenge.accepted) && challenge.accepted.length > 0) {
        const correct = challenge.accepted.some((candidate) => sameAnswer(candidate, given));

        return { correct, expected, given };
      }

      return { correct: sameAnswer(expected, given), expected, given };
    }
    default:
      return { correct: false, expected, given };
  }
}

function sameAnswer(expected, given) {
  if (expected == null || given == null) return false;
  if (typeof expected === 'string' || typeof given === 'string') return String(expected) === String(given);
  if (C.isPoint(expected) && C.isPoint(given)) {
    return Math.abs(expected.x - given.x) <= ANSWER_TOLERANCE && Math.abs(expected.y - given.y) <= ANSWER_TOLERANCE;
  }
  if (Number.isFinite(expected?.slope) && Number.isFinite(given?.slope)) {
    return Math.abs(expected.slope - given.slope) <= ANSWER_TOLERANCE;
  }

  return false;
}

/**
 * §40 — LES INDICES, dévoilés un par un.
 *
 * Aucun ne donne la réponse : le premier dit OÙ REGARDER, le deuxième QUOI
 * COMPARER, le troisième CE QU'IL RESTE À LIRE. Le quatrième n'existe pas —
 * après trois indices, la vérification montre la géométrie, et c'est elle
 * qui enseigne.
 *
 * Les clés rendues sont celles de `mathlab.json`
 * (`tools.conics.practice.hints.<clé>`), avec les paramètres que le texte
 * interpole.
 */
export function hintAt(challenge, index) {
  if (!challenge || !Array.isArray(challenge.hints)) return null;
  if (!Number.isInteger(index) || index < 0 || index >= challenge.hints.length) return null;

  return { key: challenge.hints[index], params: hintParams(challenge, index) };
}

export function hintCount(challenge) {
  return Array.isArray(challenge?.hints) ? challenge.hints.length : 0;
}

/**
 * Ce que le texte d'un indice interpole.
 *
 * Le DERNIER indice de chaque suite peut porter une valeur intermédiaire —
 * `c = 4` pour un foyer, la distance au centre pour une intersection : la
 * donnée qui reste à combiner, jamais la conclusion.
 */
function hintParams(challenge, index) {
  const last = index === challenge.hints.length - 1;
  switch (challenge.kind) {
    case 'focus':
      return last ? { c: round2(challenge.extra.c) } : {};
    case 'asymptote':
      return last ? { a: challenge.extra.a, b: challenge.extra.b } : {};
    case 'intersectionCount':
      return last ? { d: round2(challenge.extra.distance), r: round2(challenge.conic.r) } : {};
    case 'pointPosition':
      return last ? { d: round2(challenge.extra.distance), r: round2(challenge.conic.r) } : {};
    case 'parameter':
      return last ? { target: challenge.extra.target } : {};
    default:
      return {};
  }
}

const round2 = (value) => (Number.isFinite(value) ? Math.round(value * 100) / 100 : value);

/**
 * §36 — ce que la RÉVÉLATION doit montrer : les éléments à mettre en
 * évidence sur le plan quand l'élève a répondu.
 *
 * C'est l'interface qui dessine, mais c'est ici qu'on décide QUOI — pour que
 * la même décision serve le test et l'écran.
 */
export function revealFor(challenge) {
  if (!challenge) return null;
  switch (challenge.kind) {
    case 'centerRadius':
      return { highlight: ['center', 'radius'], point: challenge.answer };
    case 'vertex':
      return { highlight: ['vertex', 'axis'], point: challenge.answer };
    case 'focus':
      return { highlight: ['foci', 'majorAxis'], point: challenge.answer };
    case 'asymptote':
      return { highlight: ['asymptotes', 'vertices'], point: null };
    case 'matchGraph':
      return { highlight: ['center', 'radius'], point: { x: challenge.conic.h, y: challenge.conic.k } };
    case 'parameter':
      return { highlight: ['center'], point: { x: challenge.extra.target, y: challenge.conic.k } };
    case 'intersectionCount':
      return { highlight: ['intersections'], point: null };
    case 'pointPosition':
      return { highlight: ['probe', 'radius'], point: challenge.point };
    default:
      return null;
  }
}
