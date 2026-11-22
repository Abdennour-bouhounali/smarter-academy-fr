/**
 * Les ARBRES D'EXEMPLE — chacun est une situation de manuel, VALIDE
 * (probabilityTree.test.js le vérifie), et choisie pour montrer une idée :
 * l'indépendance (deux pièces, trois enfants), la dépendance (l'urne sans
 * remise, les lancers francs), la probabilité inverse (le test médical), une
 * loi non uniforme (le dé truqué). Les lettres sont expliquées par une
 * légende (`tools.probabilityStats.tree.presets.<id>.legend`).
 */

const BAR = '̄';

let counter = 0;
function b(label, p, children = []) {
  counter += 1;

  return { id: `b${counter}`, label, p, children };
}

function build(stages, make, query = null, presetId = null) {
  counter = 0;

  return { stages, branches: make(), presetId, query };
}

/** Deux feuilles identiques sous chaque nœud : une étape indépendante. */
function same(pairs, next = () => []) {
  return pairs.map(([label, p]) => b(label, p, next()));
}

export const TREE_PRESETS = Object.freeze([
  {
    id: 'twoCoins',
    level: 'beginner',
    create: () => build(2, () => same([['F', '1/2'], ['P', '1/2']], () => same([['F', '1/2'], ['P', '1/2']])),
      { kind: 'event', event: { stage: 2, label: 'F' } }, 'twoCoins'),
  },
  {
    id: 'unequalDie',
    level: 'beginner',
    create: () => build(1, () => [b('1', '1/10'), b('2', '2/10'), b('3', '3/10'), b('4', '4/10')],
      { kind: 'path', path: [3] }, 'unequalDie'),
  },
  {
    id: 'urn',
    level: 'intermediate',
    create: () => build(2, () => [
      b('R', '3/5', [b('R', '2/4'), b('B', '2/4')]),
      b('B', '2/5', [b('R', '3/4'), b('B', '1/4')]),
    ], { kind: 'path', path: [0, 1] }, 'urn'),
  },
  {
    id: 'threeChildren',
    level: 'intermediate',
    create: () => build(3, () => same([['G', '0,5'], ['F', '0,5']], () => same([['G', '0,5'], ['F', '0,5']], () => same([['G', '0,5'], ['F', '0,5']]))),
      { kind: 'event', event: { stage: 3, label: 'F' } }, 'threeChildren'),
  },
  {
    id: 'freeThrows',
    level: 'advanced',
    create: () => build(3, () => {
      // Après une réussite on réussit plus souvent (80 %) qu'après un échec (60 %).
      const after = (success) => [
        b('S', success ? '80%' : '60%'),
        b(`S${BAR}`, success ? '20%' : '40%'),
      ];
      const second = (success) => [
        b('S', success ? '80%' : '60%', after(true)),
        b(`S${BAR}`, success ? '20%' : '40%', after(false)),
      ];

      return [b('S', '70%', second(true)), b(`S${BAR}`, '30%', second(false))];
    }, { kind: 'event', event: { stage: 3, label: 'S' } }, 'freeThrows'),
  },
  {
    id: 'medicalTest',
    level: 'advanced',
    create: () => build(2, () => [
      b('M', '0,01', [b('T', '0,95'), b(`T${BAR}`, '0,05')]),
      b(`M${BAR}`, '0,99', [b('T', '0,05'), b(`T${BAR}`, '0,95')]),
    ], { kind: 'conditional', target: { stage: 1, label: 'M' }, given: { stage: 2, label: 'T' } }, 'medicalTest'),
  },
]);

export function getTreePreset(id) {
  return TREE_PRESETS.find((preset) => preset.id === id) ?? null;
}
