import { describe, it, expect } from 'vitest';
import {
  conditionalSteps, eventSteps, factorTex, latexNumber, pathSteps, productRuleTex, resultTex, treeHighlight,
} from './treeFormulas.js';
import { layoutTree, pillWidth } from './treeLayout.js';
import {
  addBranch, addStage, createDefaultTree, leafCount, setProbability, validateTree,
} from './probabilityTree.js';
import { getTreePreset } from './treePresets.js';

describe('les formules de l’arbre', () => {
  it('écrit la règle du produit en notation P_A(B)', () => {
    expect(productRuleTex(['A', 'B'], new Set())).toBe('P(A \\cap B) = P(A) \\times P_{A}(B)');
    expect(productRuleTex(['R', 'B', 'R'], new Set(['R', 'B'])))
      .toBe('P(R_{1} \\cap B_{2} \\cap R_{3}) = P(R_{1}) \\times P_{R_{1}}(B_{2}) \\times P_{R_{1} \\cap B_{2}}(R_{3})');
  });

  it('écrit chaque facteur comme l’élève l’a saisi', () => {
    expect(factorTex('2/4', { n: 1, d: 2 })).toBe('\\frac{2}{4}');
    expect(factorTex('0,95', { n: 19, d: 20 })).toBe('0{,}95');
    expect(factorTex('80%', { n: 4, d: 5 })).toBe('0{,}8');
    expect(factorTex('1', { n: 1, d: 1 })).toBe('1');
    expect(latexNumber(-0.5, 2)).toBe('-0{,}5');
  });

  it('donne le résultat en fraction, décimal et pourcentage, avec ≈ seulement si arrondi', () => {
    expect(resultTex({ n: 3, d: 10 }).latex).toBe('\\frac{3}{10} = 0{,}3 = 30\\,\\%');
    expect(resultTex({ n: 19, d: 118 }).latex).toBe('\\frac{19}{118} \\approx 0{,}161 \\approx 16{,}1\\,\\%');
    expect(resultTex({ n: 1, d: 1 }).latex).toBe('1 = 100\\,\\%');
  });

  it('déroule un chemin : règle → chaque facteur lu → produit effectué → résultat', () => {
    const urn = getTreePreset('urn').create();
    const { steps, computed, question } = pathSteps(urn, [0, 1], validateTree(urn));
    expect(computed).toBe(true);
    expect(steps.map((s) => s.kind)).toEqual(['productRule', 'readFactor', 'readFactor', 'product', 'result']);
    expect(steps[1].latex).toBe('P(R_{1} \\cap B_{2}) = \\frac{3}{5} \\times P_{R_{1}}(B_{2})');
    expect(steps[2].latex).toBe('P(R_{1} \\cap B_{2}) = \\frac{3}{5} \\times \\frac{2}{4}');
    expect(steps[3].latex).toBe('P(R_{1} \\cap B_{2}) = \\frac{3 \\times 2}{5 \\times 4} = \\frac{6}{20}');
    expect(steps.at(-1).latex).toContain('\\frac{3}{10}');
    expect(steps.at(-1).tone).toBe('result');
    // Le dessin suit le pas : la 1re branche, puis les deux ; la feuille au dernier pas seulement.
    expect(steps.map((s) => s.lit)).toEqual([[], ['0'], ['0', '0.1'], ['0', '0.1'], ['0', '0.1']]);
    expect(question).toEqual(['0', '0.1']);
    expect(steps.at(-1).leaves).toEqual(['0.1']);
  });

  it('déroule les probabilités totales, un chemin à la fois, et s’arrête à la règle si l’arbre est faux', () => {
    const urn = getTreePreset('urn').create();
    const { steps } = eventSteps(urn, { stage: 2, label: 'B' }, validateTree(urn));
    expect(steps.map((s) => s.kind)).toEqual(['totalRule', 'pathTerm', 'pathTerm', 'sum', 'result']);
    expect(steps[0].latex).toBe('P(B_{2}) = P(R_{1} \\cap B_{2}) + P(B_{1} \\cap B_{2})');
    expect(steps[1].lit).toEqual(['0', '0.1']);
    expect(steps[2].lit).toEqual(['0', '0.1', '1', '1.1']);
    expect(steps.at(-1).latex).toContain('\\frac{2}{5}');
    const broken = setProbability(urn, [0], '');
    const partial = eventSteps(broken, { stage: 2, label: 'B' }, validateTree(broken));
    expect(partial.computed).toBe(false);
    expect(partial.steps).toHaveLength(1);
  });

  it('déroule Bayes sur le test médical : numérateur, dénominateur, quotient, résultat', () => {
    const tree = getTreePreset('medicalTest').create();
    const { steps, computed } = conditionalSteps(tree, { stage: 1, label: 'M' }, { stage: 2, label: 'T' }, validateTree(tree));
    expect(computed).toBe(true);
    expect(steps.map((s) => s.kind)).toEqual(['bayesRule', 'intersection', 'given', 'quotient', 'result']);
    expect(steps[0].latex).toBe('P_{T}(M) = \\frac{P(M \\cap T)}{P(T)}');
    expect(steps.at(-1).latex).toContain('\\frac{19}{118}');
  });

  it('treeHighlight : la question en retrait avant le 1er pas, puis ce que le pas courant allume', () => {
    const urn = getTreePreset('urn').create();
    const calc = pathSteps(urn, [0, 1], validateTree(urn));
    const ready = treeHighlight(calc, 0);
    expect([...ready.primary]).toEqual([]);
    expect([...ready.secondary]).toEqual(['0', '0.1']);
    expect([...ready.leaves]).toEqual([]);
    const second = treeHighlight(calc, 2);
    expect([...second.primary]).toEqual(['0']);
    expect([...second.secondary]).toEqual(['0.1']);
    expect([...treeHighlight(calc, calc.steps.length).leaves]).toEqual(['0.1']);
    expect([...treeHighlight(null, 3).primary]).toEqual([]);
  });
});

describe('la mise en page de l’arbre', () => {
  it('place les feuilles en rangées, les nœuds au milieu de leurs enfants, de gauche à droite', () => {
    const layout = layoutTree(createDefaultTree(), { width: 720 });
    const leaves = layout.nodes.filter((n) => n.leaf);
    expect(leaves).toHaveLength(4);
    expect(new Set(leaves.map((n) => n.y)).size).toBe(4);
    const a = layout.nodes.find((n) => n.key === '0');
    expect(a.y).toBe((layout.nodes.find((n) => n.key === '0.0').y + layout.nodes.find((n) => n.key === '0.1').y) / 2);
    expect(a.x).toBeGreaterThan(layout.root.x);
    expect(leaves[0].x).toBeGreaterThan(a.x);
    expect(layout.resultX).toBeGreaterThan(leaves[0].x);
  });

  it('tient 64 feuilles dans les deux largeurs', () => {
    let tree = addStage(createDefaultTree());
    tree = addBranch(addBranch(tree, []), []);
    for (let i = 0; i < 4; i += 1) tree = addBranch(addBranch(tree, [i]), [i]);
    for (let i = 0; i < 4; i += 1) for (let j = 0; j < 4; j += 1) tree = addBranch(addBranch(tree, [i, j]), [i, j]);
    expect(leafCount(tree)).toBe(64);
    for (const compact of [false, true]) {
      const layout = layoutTree(tree, { width: compact ? 440 : 720, compact });
      expect(layout.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y))).toBe(true);
      expect(Math.max(...layout.nodes.map((n) => n.y))).toBeLessThan(layout.height);
    }
    expect(pillWidth('A')).toBe(30);
    expect(pillWidth('x'.repeat(40))).toBe(120);
  });
});
