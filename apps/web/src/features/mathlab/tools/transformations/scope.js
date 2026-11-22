import { TRANSFORM_KINDS } from './transformModel.js';
import { MAX_STEPS } from './transformState.js';
import { CHALLENGE_KINDS, EXPERIMENTS, PRESETS, PUZZLES } from './practice.js';

/**
 * L'atelier des transformations dans les deux labos (labScope.js, MATH_LAB.md
 * §2.1).
 *
 * Au collège : les symétries axiale et centrale, la translation, la rotation
 * et l'homothétie — UNE transformation à la fois.
 * La composition (la pile de plusieurs transformations, l'expérience de
 * l'ordre, les figures intermédiaires) et la lecture matricielle sont
 * l'approfondissement du lycée. Au lycée : tout.
 */
export const TRANSFORMATIONS_SCOPES = Object.freeze(['moyen', 'secondaire']);

export const TRANSFORMATIONS_CAPABILITIES = Object.freeze({
  moyen: Object.freeze({
    descriptionKey: 'tools.transformations.descriptionMoyen',
    kinds: Object.freeze(['translation', 'rotation', 'reflection', 'dilation']),
    maxSteps: 1,
    matrix: false,
    // Tous les préréglages sont d'UN pas ; les expériences et puzzles à deux
    // pas (l'ordre, « twoSteps ») sont la composition, donc du lycée.
    experiments: Object.freeze(['rotateSquare', 'dilateLengths', 'dilateArea', 'reflectX', 'translateAngles']),
    puzzles: Object.freeze(['slide', 'quarter', 'mirror', 'grow']),
    challenges: Object.freeze(['predictPoint', 'choosePosition']),
  }),
  secondaire: null,
});

const only = (list, ids) => (ids ? list.filter((entry) => ids.includes(entry.id)) : list);

/** Ce que le laboratoire montre, capacités résolues (`null` = tout). */
export function transformationsFeatures(capabilities) {
  return {
    kinds: capabilities?.kinds ?? TRANSFORM_KINDS,
    maxSteps: capabilities?.maxSteps ?? MAX_STEPS,
    matrix: capabilities?.matrix !== false,
    presets: only(PRESETS, capabilities?.presets),
    experiments: only(EXPERIMENTS, capabilities?.experiments),
    puzzles: only(PUZZLES, capabilities?.puzzles),
    challenges: capabilities?.challenges ?? CHALLENGE_KINDS,
  };
}

/** Les réglages d'affichage qui n'ont de sens qu'avec ce que le labo montre. */
export function displayToggles(features) {
  return [
    'grid', 'snap', 'showOriginal',
    ...(features.maxSteps > 1 ? ['showIntermediate'] : []),
    'trails', 'showMeasures', 'showAngles', 'labels', 'showInvariants',
    ...(features.matrix ? ['showMatrix'] : []),
  ];
}

/**
 * Un état ramené à ce que le labo montre : la matrice et les figures
 * intermédiaires éteintes, un puzzle absent fermé. Les pas d'un document
 * plus ancien sont GARDÉS — on ne détruit pas le travail d'un élève.
 */
export function clampToFeatures(data, features) {
  let next = data;
  const settings = { ...next.settings };
  let changed = false;
  if (!features.matrix && settings.showMatrix) { settings.showMatrix = false; changed = true; }
  if (features.maxSteps <= 1 && settings.showIntermediate) { settings.showIntermediate = false; changed = true; }
  if (changed) next = { ...next, settings };
  if (next.puzzle?.id && !features.puzzles.some((puzzle) => puzzle.id === next.puzzle.id)) {
    next = { ...next, mode: 'free', puzzle: null };
  }

  return next;
}
