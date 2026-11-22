/**
 * PRÉDIRE → TRANSFORMER → VÉRIFIER (§38 – §40) et les PUZZLES (§42).
 *
 * Logique PURE : générer une question, juger une réponse, dire où en est un
 * puzzle. Pas de React, pas de hasard caché — le générateur reçoit son
 * `random`, ce qui rend chaque question reproductible dans un test.
 *
 * ── Le principe qui gouverne tout ce fichier ─────────────────────────────
 * Une réponse fausse ne BLOQUE jamais (c'est la règle du مختبر, déjà tenue
 * par la trigonométrie et les suites) : l'élève prédit, l'instrument ANIME
 * la transformation, et la figure lui montre elle-même où il en était. Rien
 * ici ne rend « faux » sans rendre en même temps la bonne réponse et de quoi
 * la voir.
 */

import * as M from './transformMath.js';
import { matrixFor, resolveCenter, finalFigure } from './transformModel.js';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { vectorColumnText } from '../vectors/vectorFormat.js';

/** Les familles de questions (§38, §39, §40). */
export const CHALLENGE_KINDS = Object.freeze(['predictPoint', 'choosePosition', 'multiStep']);

const randomInt = (random, min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (random, list) => list[Math.floor(random() * list.length)];

/** Les pas que le générateur sait proposer : simples, à coefficients entiers, lisibles. */
function randomStep(random, { allowDilation = true, stepKinds = null } = {}) {
  const kinds = (allowDilation
    ? ['translation', 'rotation', 'reflection', 'dilation']
    : ['translation', 'rotation', 'reflection']).filter((kind) => !stepKinds || stepKinds.includes(kind));
  switch (pick(random, kinds)) {
    case 'rotation':
      return { kind: 'rotation', enabled: true, angle: pick(random, [90, 180, 270]), center: { type: 'origin' } };
    case 'reflection':
      return { kind: 'reflection', enabled: true, axis: { type: pick(random, ['xAxis', 'yAxis', 'origin', 'diagonal']) } };
    case 'dilation':
      return { kind: 'dilation', enabled: true, k: pick(random, [2, -1, 3]), center: { type: 'origin' } };
    case 'translation':
    default:
      return {
        kind: 'translation',
        enabled: true,
        vx: randomInt(random, -5, 5),
        vy: randomInt(random, -5, 5),
      };
  }
}

/**
 * Une question d'entraînement.
 *
 * Elle porte TOUT ce qu'il faut pour être posée, jugée et animée :
 * l'énoncé (`point`, `steps`), la réponse (`answer`), et pour §39 les
 * positions proposées. L'interface n'en calcule aucune.
 */
export function generateChallenge(random = Math.random, options = {}) {
  // `kinds` / `stepKinds` : ce que le مخبر pose (scope.js) — au collège, une
  // seule transformation, jamais de تحاكي.
  const kinds = Array.isArray(options.kinds) && options.kinds.length
    ? CHALLENGE_KINDS.filter((entry) => options.kinds.includes(entry))
    : CHALLENGE_KINDS;
  const stepKinds = Array.isArray(options.stepKinds) && options.stepKinds.length ? options.stepKinds : null;
  const kind = options.kind && kinds.includes(options.kind)
    ? options.kind
    : pick(random, kinds);

  // Une question dont la réponse est le point LUI-MÊME (انسحاب nul, point
  // sur l'axe, centre de rotation…) ne demande rien : on la retire. Le
  // plafond ne sert qu'à un `random` dégénéré (une constante, dans un test) ;
  // il rend alors une question sûre, jamais triviale.
  for (let attempt = 0; attempt < MAX_DRAWS; attempt += 1) {
    const point = { x: randomInt(random, -5, 5), y: randomInt(random, -5, 5) };
    const steps = kind === 'multiStep'
      // Deux pas : assez pour que l'ordre compte, assez peu pour rester suivable.
      ? [randomStep(random, { allowDilation: false, stepKinds }), randomStep(random, { allowDilation: false, stepKinds })]
      : [randomStep(random, { stepKinds })];
    const answer = applySteps(point, steps);
    if (!M.samePoint(answer, point)) return finishChallenge(random, kind, point, steps);
  }

  const fallback = kind === 'multiStep'
    ? [{ kind: 'translation', enabled: true, vx: 2, vy: 1 }, { kind: 'translation', enabled: true, vx: 1, vy: -3 }]
    : [{ kind: 'translation', enabled: true, vx: 2, vy: 1 }];

  return finishChallenge(random, kind, { x: 1, y: 2 }, fallback);
}

/** Le nombre de tirages avant de se rabattre sur une question sûre. */
const MAX_DRAWS = 50;

function finishChallenge(random, kind, point, steps) {
  const answer = applySteps(point, steps);
  const choices = kind === 'choosePosition' ? buildChoices(random, answer, point, steps) : null;

  return { kind, point, steps, answer, choices };
}

// ── L'énoncé : chaque pas DIT toute sa transformation ───────────────────

/**
 * Le texte d'un pas dans l'énoncé, sous forme STRUCTURÉE : la clé i18n
 * (`tools.transformations.practice.stepText.<key>`) et ses paramètres, déjà
 * écrits en notation (virgule décimale, vrai moins).
 *
 * « تناظر » seul ne dit pas QUEL تناظر, « دوران 90° » ne dit ni le centre ni
 * le sens : l'élève ne pouvait pas répondre, il devinait. Chaque pas nomme
 * donc tout ce qui fixe sa matrice — l'axe (ou le centre d'un تناظر مركزي),
 * le centre ET le sens d'un دوران, le centre ET la نسبة d'un تحاكٍ, le شعاع
 * d'un انسحاب. Deux pas de matrices différentes ont toujours deux textes
 * différents (c'est testé).
 *
 * `vertices` résout un centre posé sur un sommet (`center.type = 'vertex'`).
 */
export function describeChallengeStep(step, vertices = []) {
  if (!step || typeof step !== 'object') return null;
  switch (step.kind) {
    case 'translation':
      return { key: 'translation', params: { vector: vectorColumnText({ x: Number(step.vx), y: Number(step.vy) }) } };
    case 'rotation': {
      const angle = Number(step.angle);
      // L'angle orienté : positif = sens direct (contraire des aiguilles d'une montre).
      return {
        key: angle < 0 ? 'rotationNegative' : 'rotationPositive',
        params: { center: centerText(resolveCenter(step.center, vertices)), angle: formatValue(Math.abs(angle)) },
      };
    }
    case 'dilation':
      return {
        key: 'dilation',
        params: { center: centerText(resolveCenter(step.center, vertices)), k: formatValue(Number(step.k)) },
      };
    case 'reflection':
      return describeReflection(step.axis ?? {}, vertices);
    default:
      return null;
  }
}

function describeReflection(axis, vertices) {
  switch (axis.type) {
    case 'xAxis': return { key: 'reflectXAxis', params: {} };
    case 'yAxis': return { key: 'reflectYAxis', params: {} };
    case 'origin': return { key: 'reflectCentral', params: { center: centerText(resolveCenter(axis.center, vertices)) } };
    case 'diagonal': return { key: 'reflectLine', params: { equation: 'y = x' } };
    case 'antidiagonal': return { key: 'reflectLine', params: { equation: 'y = −x' } };
    case 'horizontal': return { key: 'reflectLine', params: { equation: `y = ${formatValue(Number(axis.value) || 0)}` } };
    case 'vertical': return { key: 'reflectLine', params: { equation: `x = ${formatValue(Number(axis.value) || 0)}` } };
    case 'line':
      return { key: 'reflectLine', params: { equation: lineEquation(Number(axis.slope) || 0, Number(axis.intercept) || 0) } };
    case 'twoPoints': {
      const a = M.isPoint(axis.a) ? axis.a : vertices[axis.aIndex];
      const b = M.isPoint(axis.b) ? axis.b : vertices[axis.bIndex];
      if (!M.isPoint(a) || !M.isPoint(b)) return null;

      return { key: 'reflectThrough', params: { a: pointText(a), b: pointText(b) } };
    }
    default:
      return null;
  }
}

/** Le centre : « O » quand c'est l'origine du repère, ses coordonnées sinon. */
function centerText(center) {
  return M.samePoint(center, M.ORIGIN, 1e-9) ? 'O' : pointText(center);
}

function pointText(point) {
  return `(${formatValue(point.x)} ; ${formatValue(point.y)})`;
}

/** `y = ax + b`, écrit comme dans le manuel : ni « 1x », ni « + −3 », ni « + 0 ». */
function lineEquation(slope, intercept) {
  let linear;
  if (slope === 0) linear = '';
  else if (slope === 1) linear = 'x';
  else if (slope === -1) linear = '−x';
  else linear = `${formatValue(slope)}x`;
  if (!linear) return `y = ${formatValue(intercept)}`;
  if (intercept === 0) return `y = ${linear}`;

  return `y = ${linear} ${intercept < 0 ? '−' : '+'} ${formatValue(Math.abs(intercept))}`;
}

// ── Ne pas montrer la réponse avant qu'elle soit donnée ─────────────────

/**
 * La question attend-elle encore sa réponse ?
 *
 * Tant que c'est le cas, l'IMAGE ne doit être ni dessinée ni lue : le plan
 * la calculait et la dessinait dès la pose de la question (avec son
 * étiquette A′), si bien que la réponse était à l'écran avant que l'élève
 * ne réponde. Elle réapparaît au verdict ou à « أرني » — et c'est alors
 * l'animation qui la montre.
 */
export function isImageHidden({ mode, challenge, verdict }) {
  return mode === 'practice' && Boolean(challenge) && !verdict;
}

/**
 * La résolution de la scène, IMAGES RETIRÉES : chaque figure a pour image
 * ses propres sommets et aucun intermédiaire. Le plan et l'inspecteur n'ont
 * alors rien de « déplacé » à dessiner ni à mesurer — pas d'image, pas de
 * A′, pas de fil, pas de trace, pas de table original → image.
 */
export function maskImages(resolved) {
  return {
    ...resolved,
    figures: resolved.figures.map((entry) => ({
      ...entry,
      stages: [],
      image: entry.figure.vertices.map((vertex) => ({ x: vertex.x, y: vertex.y })),
    })),
  };
}

/**
 * Ce que la vue CADRE pour une question.
 *
 * Avant la réponse, le cadrage ne dépend que de l'énoncé (le point et la
 * fenêtre par défaut) : cadrer sur l'image désignerait déjà la zone où elle
 * se trouve. Après le verdict, on cadre sur le point ET son image, pour que
 * les deux soient à l'écran (§22).
 */
export function practiceFrame(challenge, revealed, defaultViewport) {
  if (!challenge) return [];
  const corners = defaultViewport
    ? [{ x: defaultViewport.xMin, y: defaultViewport.yMin }, { x: defaultViewport.xMax, y: defaultViewport.yMax }]
    : [];
  if (!revealed) return [challenge.point, ...corners];

  return [challenge.point, ...finalFigure([challenge.point], challenge.steps), ...corners];
}

/** L'image d'un point par une suite de pas — la réponse attendue. */
export function applySteps(point, steps) {
  if (!M.isPoint(point)) return null;

  return (Array.isArray(steps) ? steps : []).reduce((current, step) => {
    const matrix = matrixFor(step, [current]);

    return matrix ? M.cleanPoint(M.applyMatrix(matrix, current)) : current;
  }, point);
}

/**
 * Les positions proposées de §39 — une juste, trois fausses PLAUSIBLES.
 *
 * Les leurres ne sont pas au hasard : ce sont les erreurs que l'élève commet
 * vraiment — le signe oublié, les coordonnées échangées, la transformation
 * appliquée à l'envers. Un leurre absurde n'apprend rien ; un leurre qui
 * ressemble à sa propre erreur, si.
 */
function buildChoices(random, answer, point, steps) {
  const candidates = [
    { x: -answer.x, y: answer.y },
    { x: answer.x, y: -answer.y },
    { x: answer.y, y: answer.x },
    applySteps(point, steps.map(inverseStepOf).filter(Boolean)),
    { x: answer.x + randomInt(random, 1, 3), y: answer.y },
    { x: answer.x, y: answer.y + randomInt(random, 1, 3) },
  ].filter((candidate) => M.isPoint(candidate) && !M.samePoint(candidate, answer));

  const distractors = [];
  for (const candidate of candidates) {
    if (distractors.length >= 3) break;
    if (!distractors.some((existing) => M.samePoint(existing, candidate))) distractors.push(candidate);
  }
  // Si les leurres se sont effondrés les uns sur les autres, on complète par décalage.
  let offset = 1;
  while (distractors.length < 3) {
    const candidate = { x: answer.x + offset, y: answer.y - offset };
    if (!M.samePoint(candidate, answer) && !distractors.some((existing) => M.samePoint(existing, candidate))) {
      distractors.push(candidate);
    }
    offset += 1;
  }

  return shuffle(random, [answer, ...distractors]);
}

/** Le pas « à l'envers », pour fabriquer un leurre crédible. */
function inverseStepOf(step) {
  switch (step?.kind) {
    case 'translation': return { ...step, vx: -step.vx, vy: -step.vy };
    case 'rotation': return { ...step, angle: M.normalizeAngle(-step.angle) };
    case 'dilation': return step.k !== 0 ? { ...step, k: 1 / step.k } : null;
    default: return null;      // une réflexion est sa propre inverse : pas un leurre.
  }
}

function shuffle(random, list) {
  const items = [...list];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

/**
 * Le jugement d'une réponse.
 *
 * La tolérance est LÂCHE (0,05) parce que la réponse arrive parfois d'un
 * clic sur le plan : l'élève qui vise (3, 2) et clique à (3,01 ; 1,98) a
 * raison, et lui dire le contraire serait juger sa souris, pas sa géométrie.
 * Une réponse TAPÉE, elle, tombe sur des entiers et cette tolérance ne la
 * concerne pas.
 */
export function checkAnswer(challenge, given, tolerance = 0.05) {
  if (!challenge?.answer || !M.isPoint(given)) {
    return { correct: false, expected: challenge?.answer ?? null };
  }

  return {
    correct: M.samePoint(challenge.answer, given, tolerance),
    expected: challenge.answer,
  };
}

// ── Les puzzles (§42) ───────────────────────────────────────────────────

/**
 * Les PUZZLES : « amène le triangle bleu sur le triangle cible ».
 *
 * Chaque puzzle donne une figure de départ et une pile CACHÉE qui fabrique
 * la cible. La solution n'est pas unique et ne doit pas l'être (§42) : le
 * puzzle est résolu quand les figures SE SUPERPOSENT, quelle que soit la
 * route prise — c'est `M.figuresCoincide` qui juge, jamais la comparaison
 * des piles.
 */
export const PUZZLES = Object.freeze([
  {
    id: 'slide',
    titleKey: 'puzzles.slide',
    figure: [{ x: -5, y: 1 }, { x: -2, y: 1 }, { x: -5, y: 3 }],
    solution: [{ kind: 'translation', enabled: true, vx: 7, vy: -2 }],
    hintKey: 'puzzles.slideHint',
  },
  {
    id: 'quarter',
    titleKey: 'puzzles.quarter',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
    solution: [{ kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } }],
    hintKey: 'puzzles.quarterHint',
  },
  {
    id: 'mirror',
    titleKey: 'puzzles.mirror',
    figure: [{ x: 2, y: 1 }, { x: 5, y: 2 }, { x: 3, y: 4 }],
    solution: [{ kind: 'reflection', enabled: true, axis: { type: 'yAxis' } }],
    hintKey: 'puzzles.mirrorHint',
  },
  {
    id: 'grow',
    titleKey: 'puzzles.grow',
    figure: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }],
    solution: [{ kind: 'dilation', enabled: true, k: 2, center: { type: 'origin' } }],
    hintKey: 'puzzles.growHint',
  },
  {
    id: 'twoSteps',
    titleKey: 'puzzles.twoSteps',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
    solution: [
      { kind: 'reflection', enabled: true, axis: { type: 'xAxis' } },
      { kind: 'translation', enabled: true, vx: -3, vy: 0 },
    ],
    hintKey: 'puzzles.twoStepsHint',
  },
]);

export function getPuzzle(id) {
  return PUZZLES.find((puzzle) => puzzle.id === id) ?? null;
}

/** La figure CIBLE d'un puzzle : l'image de sa figure par sa pile cachée. */
export function puzzleTarget(puzzle) {
  if (!puzzle) return [];

  return puzzle.solution.reduce((vertices, step) => {
    const matrix = matrixFor(step, puzzle.figure);

    return matrix ? vertices.map((vertex) => M.cleanPoint(M.applyMatrix(matrix, vertex))) : vertices;
  }, puzzle.figure);
}

/**
 * Le puzzle est-il résolu ?
 *
 * La tolérance (0,01) est plus serrée que celle de §38 : ici l'élève règle
 * des curseurs et des champs, pas un doigt. Elle reste assez lâche pour
 * qu'une rotation de 90° obtenue en flottant ne soit pas refusée.
 */
export function isPuzzleSolved(puzzle, currentVertices, tolerance = 0.01) {
  if (!puzzle) return false;

  return M.figuresCoincide(puzzleTarget(puzzle), currentVertices, tolerance);
}

// ── Les expériences guidées (§41, §44) ──────────────────────────────────

/**
 * « QU'EST-CE QUI CHANGE ? » — les expériences de §41.
 *
 * Chacune POSE la scène (une figure, une pile) et une question, puis laisse
 * l'élève manipuler. La réponse (`revealKey`) n'est affichée qu'après, et
 * l'instrument, lui, a déjà mesuré : le panneau des invariants dit la même
 * chose, mesurée sur la figure de l'élève. Le texte ne fait que NOMMER ce
 * qu'il a vu — il ne le remplace jamais.
 */
export const EXPERIMENTS = Object.freeze([
  {
    id: 'rotateSquare',
    titleKey: 'experiments.rotateSquare',
    promptKey: 'experiments.rotateSquarePrompt',
    revealKey: 'experiments.rotateSquareReveal',
    figure: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }],
    steps: [{ kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } }],
    watch: ['distances', 'area', 'coordinates'],
  },
  {
    id: 'dilateLengths',
    titleKey: 'experiments.dilateLengths',
    promptKey: 'experiments.dilateLengthsPrompt',
    revealKey: 'experiments.dilateLengthsReveal',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
    steps: [{ kind: 'dilation', enabled: true, k: 2, center: { type: 'origin' } }],
    watch: ['distances', 'perimeter'],
  },
  {
    id: 'dilateArea',
    titleKey: 'experiments.dilateArea',
    promptKey: 'experiments.dilateAreaPrompt',
    revealKey: 'experiments.dilateAreaReveal',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
    steps: [{ kind: 'dilation', enabled: true, k: 2, center: { type: 'origin' } }],
    watch: ['area'],
  },
  {
    id: 'reflectX',
    titleKey: 'experiments.reflectX',
    promptKey: 'experiments.reflectXPrompt',
    revealKey: 'experiments.reflectXReveal',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 2 }, { x: 2, y: 4 }],
    steps: [{ kind: 'reflection', enabled: true, axis: { type: 'xAxis' } }],
    watch: ['coordinates', 'orientation'],
  },
  {
    id: 'translateAngles',
    titleKey: 'experiments.translateAngles',
    promptKey: 'experiments.translateAnglesPrompt',
    revealKey: 'experiments.translateAnglesReveal',
    figure: [{ x: -4, y: -2 }, { x: -1, y: -2 }, { x: -3, y: 1 }],
    steps: [{ kind: 'translation', enabled: true, vx: 5, vy: 1 }],
    watch: ['angles', 'distances', 'coordinates'],
  },
  {
    id: 'order',
    titleKey: 'experiments.order',
    promptKey: 'experiments.orderPrompt',
    revealKey: 'experiments.orderReveal',
    figure: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
    steps: [
      { kind: 'translation', enabled: true, vx: 3, vy: 0 },
      { kind: 'rotation', enabled: true, angle: 90, center: { type: 'origin' } },
    ],
    watch: ['coordinates'],
  },
]);

export function getExperiment(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}

// ── Les préréglages (§35) ───────────────────────────────────────────────

/** Les transformations remarquables, prêtes à poser dans la pile. */
export const PRESETS = Object.freeze([
  { id: 'translate', labelKey: 'presets.translate', step: { kind: 'translation', vx: 3, vy: 2 } },
  { id: 'rotate90', labelKey: 'presets.rotate90', step: { kind: 'rotation', angle: 90, center: { type: 'origin' } } },
  { id: 'rotate180', labelKey: 'presets.rotate180', step: { kind: 'rotation', angle: 180, center: { type: 'origin' } } },
  { id: 'rotate270', labelKey: 'presets.rotate270', step: { kind: 'rotation', angle: 270, center: { type: 'origin' } } },
  { id: 'reflectX', labelKey: 'presets.reflectX', step: { kind: 'reflection', axis: { type: 'xAxis' } } },
  { id: 'reflectY', labelKey: 'presets.reflectY', step: { kind: 'reflection', axis: { type: 'yAxis' } } },
  { id: 'reflectOrigin', labelKey: 'presets.reflectOrigin', step: { kind: 'reflection', axis: { type: 'origin' } } },
  { id: 'reflectDiagonal', labelKey: 'presets.reflectDiagonal', step: { kind: 'reflection', axis: { type: 'diagonal' } } },
  { id: 'dilate2', labelKey: 'presets.dilate2', step: { kind: 'dilation', k: 2, center: { type: 'origin' } } },
  { id: 'dilateHalf', labelKey: 'presets.dilateHalf', step: { kind: 'dilation', k: 0.5, center: { type: 'origin' } } },
]);

// ── Les motifs (§37) ────────────────────────────────────────────────────

/**
 * Un MOTIF : la même transformation répétée n fois (§37).
 *
 * Rend les n copies successives de la figure — la première est l'image par
 * un pas, la dernière par n pas. C'est délibérément le même `matrixFor` que
 * la pile : répéter une transformation n'est pas un mode à part, c'est la
 * composer avec elle-même, et l'élève qui a compris §20 a déjà compris §37.
 *
 * Le nombre de copies est BORNÉ (24) : au-delà le motif devient illisible et
 * le rendu coûte sans rien apprendre.
 */
export const MAX_PATTERN_COPIES = 24;

export function patternCopies(figure, step, count) {
  const source = Array.isArray(figure) ? figure : [];
  const repetitions = Math.min(MAX_PATTERN_COPIES, Math.max(0, Math.floor(Number(count) || 0)));
  const matrix = matrixFor(step, source);
  if (!matrix || source.length === 0 || repetitions === 0) return [];

  const copies = [];
  let current = source;
  for (let i = 0; i < repetitions; i += 1) {
    current = current.map((vertex) => M.cleanPoint(M.applyMatrix(matrix, vertex)));
    copies.push(current);
  }

  return copies;
}
