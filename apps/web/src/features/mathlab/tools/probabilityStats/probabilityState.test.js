import { describe, it, expect } from 'vitest';
import {
  DEFAULT_NORMAL, MODES, createProbabilityStatsData, normalizeNormal, normalizeProbabilityStatsData, toStoredData,
} from './probabilityState.js';
import { createSimulation, runBatch, toStoredSimulation } from './simulationEngine.js';
import {
  MAX_BRANCHES, addBranch, addStage, createDefaultTree, leafCount, setLabel, setProbability,
} from './probabilityTree.js';
import { summarizeProbabilityStats } from './summarize.js';

/** Le document V2 : un V1 se rouvre à l'identique, rien ne lève, tout tient sous la limite du serveur. */

/** La limite du serveur (apps/api/app/Domain/MathLab/MathLabTools.php › probabilityStats.maxBytes). */
const SERVER_MAX_BYTES = 60_000;

const V1_DOCUMENT = {
  mode: 'dataset',
  experiment: 'die',
  range: { min: 1, max: 10 },
  draws: 1000,
  simulation: toStoredSimulation(runBatch(createSimulation('die', {}, 7), 250)),
  dataset: '10, 20, 30',
  settings: { compare: false, showMean: true, showMedian: false, watchRolls: true },
};

/** L'arbre le plus lourd possible : 3 étapes × 4 branches, étiquettes et textes au maximum. */
function maximalTree() {
  let tree = addStage(createDefaultTree());
  for (let i = 0; i < 2; i += 1) tree = addBranch(tree, []);
  for (let i = 0; i < MAX_BRANCHES; i += 1) {
    for (let k = 0; k < 2; k += 1) tree = addBranch(tree, [i]);
    for (let j = 0; j < MAX_BRANCHES; j += 1) for (let k = 0; k < 2; k += 1) tree = addBranch(tree, [i, j]);
  }
  const visit = (branches, path) => branches.forEach((b, index) => {
    const p = [...path, index];
    tree = setLabel(tree, p, `حدث طويل جدا ${p.join('')}xxxxxxxxxxxx`);
    tree = setProbability(tree, p, '123456789/9876543');
    visit(b.children, p);
  });
  visit(tree.branches, []);

  return tree;
}

describe('un document V1 se rouvre à l’identique', () => {
  it('garde le mode, l’expérience, la simulation, la série et les réglages', () => {
    const data = normalizeProbabilityStatsData(JSON.parse(JSON.stringify(V1_DOCUMENT)));
    expect(data.mode).toBe('dataset');
    expect(data.experiment).toBe('die');
    expect(data.draws).toBe(1000);
    expect(data.simulation.total).toBe(250);
    expect(data.dataset).toBe('10, 20, 30');
    expect(data.settings).toEqual(V1_DOCUMENT.settings);
    // Ce que V1 ne connaissait pas prend sa valeur par défaut.
    expect(data.chart).toBeNull();
    expect(data.tree).toEqual(createDefaultTree());
    expect(data.normal).toEqual(DEFAULT_NORMAL);
    const stored = toStoredData(data);
    for (const key of Object.keys(V1_DOCUMENT)) {
      expect(stored[key], key).toEqual(V1_DOCUMENT[key]);
    }
  });

  it('un document neuf reste celui d’avant : la pièce, l’expérience, rien de tiré', () => {
    const data = createProbabilityStatsData();
    expect(data.mode).toBe('experiment');
    expect(data.simulation).toBeNull();
    expect(MODES).toEqual(['experiment', 'dataset', 'tree', 'normal']);
  });
});

describe('les sections V2', () => {
  it('font l’aller-retour : arbre, loi normale, type de graphique', () => {
    let tree = setProbability(createDefaultTree(), [0], '0,6');
    tree = { ...tree, query: { kind: 'path', path: [0, 1] } };
    const data = normalizeProbabilityStatsData({
      mode: 'tree', chart: 'pie', tree,
      normal: { mu: 170, sigma: 8, x: 180, a: 160, b: 175, query: 'between', scale: 'z' },
    });
    const back = normalizeProbabilityStatsData(JSON.parse(JSON.stringify(toStoredData(data))));
    expect(back.mode).toBe('tree');
    expect(back.chart).toBe('pie');
    expect(back.tree).toEqual(tree);
    expect(back.normal).toEqual({ mu: 170, sigma: 8, x: 180, a: 160, b: 175, query: 'between', scale: 'z' });
  });

  it('redresse la loi normale : σ > 0, a ≤ b, requête et échelle connues', () => {
    expect(normalizeNormal({ sigma: 0 }).sigma).toBe(1);
    expect(normalizeNormal({ sigma: -4 }).sigma).toBe(1);
    expect(normalizeNormal({ a: 5, b: 2 })).toMatchObject({ a: 2, b: 5 });
    expect(normalizeNormal({ query: 'nawak', scale: 'w' })).toMatchObject({ query: 'le', scale: 'x' });
    expect(normalizeNormal({ mu: Infinity, x: 1e12 })).toMatchObject({ mu: 0, x: 1 });
    expect(normalizeNormal(null)).toEqual(DEFAULT_NORMAL);
  });

  it('ne lève jamais sur un document absurde', () => {
    const garbage = [
      null, undefined, 0, 'texte', [], [1, 2], { mode: 'tree', tree: 'x' }, { mode: 'normal', normal: [] },
      { tree: { stages: 2, branches: [{ children: [{}] }] } }, { chart: 42, normal: { sigma: 'abc' } },
      { tree: { stages: 3, branches: new Array(50).fill({ label: 'A', p: '1', children: [] }) } },
    ];
    for (const raw of garbage) {
      const data = normalizeProbabilityStatsData(raw);
      expect(MODES).toContain(data.mode);
      expect(() => JSON.stringify(toStoredData(data))).not.toThrow();
      expect(() => summarizeProbabilityStats(raw)).not.toThrow();
    }
  });

  it('un arbre maximal (64 feuilles) tient largement sous la limite du serveur', () => {
    const tree = maximalTree();
    expect(leafCount(tree)).toBe(64);
    const data = normalizeProbabilityStatsData({
      mode: 'tree', tree, dataset: '9'.repeat(10) + ' ; '.repeat(1000),
      simulation: toStoredSimulation(runBatch(createSimulation('twoDice', {}, 3), 100000)), experiment: 'twoDice',
    });
    expect(leafCount(data.tree)).toBe(64);
    const bytes = new TextEncoder().encode(JSON.stringify(toStoredData(data))).length;
    expect(bytes).toBeLessThan(SERVER_MAX_BYTES / 2);
  });
});

describe('le résumé de « أعمالي »', () => {
  it('résume l’arbre par la loi de ses chemins, et un arbre faux par un plateau vide', () => {
    const summary = summarizeProbabilityStats({ mode: 'tree', tree: createDefaultTree() });
    expect(summary.kind).toBe('chart');
    expect(summary.detail.bars).toEqual([0.2, 0.4, 0.2, 0.2]);
    const invalid = summarizeProbabilityStats({ mode: 'tree', tree: setProbability(createDefaultTree(), [0], '') });
    expect(invalid.detail.bars).toEqual([]);
  });

  it('résume la loi normale par sa cloche', () => {
    const summary = summarizeProbabilityStats({ mode: 'normal', normal: { mu: 100, sigma: 15 } });
    expect(summary.kind).toBe('chart');
    expect(summary.detail.bars).toHaveLength(17);
    expect(Math.max(...summary.detail.bars)).toBe(summary.detail.bars[8]);
    expect(JSON.stringify(summary).length).toBeLessThan(2048);
  });

  it('garde le résumé V1 des expériences et des séries', () => {
    expect(summarizeProbabilityStats(V1_DOCUMENT).detail.mode).toBe('dataset');
    expect(summarizeProbabilityStats({ ...V1_DOCUMENT, mode: 'experiment' }).detail.draws).toBe(250);
  });
});
