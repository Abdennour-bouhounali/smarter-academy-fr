import { describe, it, expect } from 'vitest';
import { validateFrames, boardProgress } from '../../shared/mathBoard/frames.js';
import { conditionalFrames, eventFrames, multiplyOperands, operandOf, pathFrames, queryFrames } from './treeFrames.js';
import { normalFrames, normalReveal } from './normalFrames.js';
import { STAT_KINDS, statFrames } from './statsFrames.js';
import { treeHighlight } from './treeFormulas.js';
import { normalQuery } from './normalDistribution.js';
import { describeDataset } from './descriptiveStats.js';
import { setProbability, setQuery, validateTree } from './probabilityTree.js';
import { TREE_PRESETS, getTreePreset } from './treePresets.js';
import { NORMAL_PRESETS } from './normalPresets.js';
import { DATASET_PRESETS } from './datasetPresets.js';
import { parseDataset } from './datasetStatistics.js';

/** La ligne « jetons » d'un frame, lisible : `\frac{3}{5}[selected] \times …`. */
const rowText = (frame) => frame.rows[0].map((token) => (token.tone === 'neutral' ? token.latex : `${token.latex}[${token.tone}]`)).join(' ');
const marks = (frame) => (frame.marks ?? []).map((mark) => `${mark.type}:${mark.latex}`);
/** Aucun frame avant le dernier ne porte la ligne du résultat final. */
const finalOnlyAtEnd = (frames) => {
  const last = frames.at(-1).settle;
  return frames.slice(0, -1).every((frame) => frame.settle !== last && frame.tone !== 'result');
};

describe('l’arbre au tableau (treeFrames)', () => {
  const urn = getTreePreset('urn').create();
  const valid = validateTree(urn);

  it('chemin R₁ ∩ B₂ : la règle, chaque facteur lu sur SA branche, [3/5] ⌒× [2/4] ↓ 6/20, puis le résultat', () => {
    const { frames, question, problem } = pathFrames(urn, [0, 1], valid);
    expect(validateFrames(frames)).toEqual([]);
    expect(problem).toBe('P(R_{1} \\cap B_{2}) = \\,?');
    expect(frames.map(rowText)).toEqual([
      'P(R_{1} \\cap B_{2}) = P(R_{1}) \\times P_{R_{1}}(B_{2})',
      'P(R_{1} \\cap B_{2}) = P(R_{1})[selected] \\times P_{R_{1}}(B_{2})',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5}[result] \\times P_{R_{1}}(B_{2})[selected]',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5}[result] \\times \\frac{2}{4}[result]',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5}[selected] \\times \\frac{2}{4}[selected]',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5}[operation] \\times \\frac{2}{4}[operation]',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5}[operation] \\times \\frac{2}{4}[operation]',
      'P(R_{1} \\cap B_{2}) = \\frac{6}{20} = \\frac{3}{10} = 0{,}3 = 30\\,\\%[result]',
    ]);
    expect(marks(frames[1])).toEqual(['under:\\frac{3}{5}']);
    expect(marks(frames[6])).toEqual(['link:\\times', 'result:\\frac{6}{20}']);
    // Le dessin suit le frame : la 1re branche, puis la 2e ; la feuille n'est écrite qu'au dernier.
    expect(frames.map((f) => f.lit.join(' '))).toEqual(['', '0', '0 0.1', '0 0.1', '0 0.1', '0 0.1', '0 0.1', '0 0.1']);
    expect(frames.slice(0, -1).every((f) => !f.leaves?.length)).toBe(true);
    expect(frames.at(-1).leaves).toEqual(['0.1']);
    expect(question).toEqual(['0', '0.1']);
    expect(boardProgress(frames, frames.length)).toEqual({ current: 4, total: 4 });
    expect(finalOnlyAtEnd(frames)).toBe(true);
  });

  it('événement B₂ : un produit par chemin (le chemin s’allume à son tour), [3/10] ⌒+ [1/10] ↓ 2/5, le résultat', () => {
    const { frames } = eventFrames(urn, { stage: 2, label: 'B' }, valid);
    expect(validateFrames(frames)).toEqual([]);
    expect(frames.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      'P(B_{2}) = P(R_{1} \\cap B_{2}) + P(B_{1} \\cap B_{2})',
      'P(R_{1} \\cap B_{2}) = \\frac{3}{5} \\times \\frac{2}{4} = \\frac{6}{20} = \\frac{3}{10}',
      'P(B_{1} \\cap B_{2}) = \\frac{2}{5} \\times \\frac{1}{4} = \\frac{2}{20} = \\frac{1}{10}',
      'P(B_{2}) = \\frac{3}{10} + \\frac{1}{10} = \\frac{2}{5}',
      'P(B_{2}) = \\frac{2}{5} = 0{,}4 = 40\\,\\%',
    ]);
    expect(frames[1].lit).toEqual(['0', '0.1']);
    expect(frames[5].lit).toEqual(['0', '0.1', '1', '1.1']);
    expect(frames.flatMap((f) => f.leaves ?? [])).toEqual(['0.1', '1.1']);
    expect(finalOnlyAtEnd(frames)).toBe(true);
  });

  it('Bayes (test médical) : numérateur, dénominateur (le chemin déjà calculé est réutilisé), [a] ⌒÷ [b], résultat', () => {
    const tree = getTreePreset('medicalTest').create();
    const { frames, question } = conditionalFrames(tree, { stage: 1, label: 'M' }, { stage: 2, label: 'T' }, validateTree(tree));
    expect(validateFrames(frames)).toEqual([]);
    expect(frames.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      'P_{T}(M) = \\frac{P(M \\cap T)}{P(T)}',
      'P(M \\cap T) = 0{,}01 \\times 0{,}95 = 0{,}0095 = \\frac{19}{2000}',
      'P(\\bar{M} \\cap T) = 0{,}99 \\times 0{,}05 = 0{,}0495 = \\frac{99}{2000}',
      'P(T) = \\frac{19}{2000} + \\frac{99}{2000} = \\frac{59}{1000}',
      'P_{T}(M) = \\frac{\\frac{19}{2000}}{\\frac{59}{1000}} = \\frac{19}{118}',
      'P_{T}(M) = \\frac{19}{118} \\approx 0{,}161 \\approx 16{,}1\\,\\%',
    ]);
    expect(question).toEqual(['0', '0.0', '1', '1.0']);
    const quotient = frames.find((f) => marks(f).includes('link:\\div'));
    expect(quotient.lit).toEqual(['0', '0.0']);
    expect(quotient.soft).toEqual(['0', '0.0', '1', '1.0']);
    expect(frames.at(-1).tone).toBe('result');
  });

  it('écrit le produit comme au tableau : fractions non simplifiées, décimaux en décimal', () => {
    expect(multiplyOperands(operandOf('3/5', { n: 3, d: 5 }), operandOf('2/4', { n: 1, d: 2 })).latex).toBe('\\frac{6}{20}');
    expect(multiplyOperands(operandOf('0,8', { n: 4, d: 5 }), operandOf('60%', { n: 3, d: 5 })).latex).toBe('0{,}48');
    expect(multiplyOperands(operandOf('1/2', { n: 1, d: 2 }), operandOf('0,5', { n: 1, d: 2 })).latex).toBe('\\frac{1}{4}');
  });

  it.each(TREE_PRESETS.map((p) => p.id))('%s : toute requête d’un arbre valide se déroule sans défaut', (id) => {
    const tree = getTreePreset(id).create();
    const validation = validateTree(tree);
    const queries = [
      { kind: 'path', path: [0] },
      { kind: 'path', path: new Array(tree.stages).fill(0) },
      { kind: 'event', event: { stage: tree.stages, label: tree.branches[0].children?.[0]?.label ?? tree.branches[0].label } },
      { kind: 'conditional', target: { stage: 1, label: tree.branches[0].label }, given: { stage: tree.stages, label: tree.branches[0].children?.[0]?.label ?? tree.branches[0].label } },
    ];
    for (const query of queries) {
      const board = queryFrames(setQuery(tree, query), validation);
      if (!board) continue;
      expect(validateFrames(board.frames)).toEqual([]);
      expect(board.frames.at(-1).tone).toBe('result');
      expect(board.frames.every((f) => Array.isArray(f.lit))).toBe(true);
      const { leaves } = treeHighlight(board, 0);
      expect(leaves.size).toBe(0);
    }
  });

  it('un arbre faux ne se déroule pas (la formule seule, et le message)', () => {
    const broken = setProbability(urn, [0], '');
    expect(pathFrames(broken, [0, 1], validateTree(broken))).toBeNull();
    expect(eventFrames(broken, { stage: 2, label: 'B' }, validateTree(broken))).toBeNull();
  });
});

describe('la loi normale au tableau (normalFrames)', () => {
  it('P(X ≥ 130), N(100, 15²) : substitution, [130] ⌒− [100], [30] ⌒÷ [15] ↓ z = 2, Φ, [1] ⌒− [Φ], résultat', () => {
    const params = { mu: 100, sigma: 15, x: 130, a: 85, b: 115, query: 'ge' };
    const { frames, problem, questionLatex } = normalFrames(params, normalQuery(params));
    expect(validateFrames(frames)).toEqual([]);
    expect(problem).toBe('P(X \\ge 130) = \\,?');
    expect(questionLatex).toBe('P(X \\ge 130)');
    expect(frames.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      'z = \\frac{x - \\mu}{\\sigma}',
      'z = \\frac{130 - 100}{15}',
      'z = \\frac{30}{15} = 2',
      'P(X \\ge 130) = P(Z \\ge 2) = 1 - \\Phi(2)',
      '\\Phi(2) \\approx 0{,}9772',
      'P(X \\ge 130) \\approx 0{,}0228 \\approx 2{,}28\\,\\%',
    ]);
    expect(frames.find((f) => marks(f).includes('link:-'))).toBeTruthy();
    expect(frames.at(-1).textKey).toBe('tools.probabilityStats.normal.frames.interpret.ge');
  });

  it('la courbe suit le calcul : z au frame qui le calcule, l’aire à la règle, rien avant le 1er pas', () => {
    const params = { mu: 175, sigma: 7, x: 170, a: 160, b: 180, query: 'between' };
    const { frames } = normalFrames(params, normalQuery(params));
    expect(validateFrames(frames)).toEqual([]);
    expect(normalReveal(frames, 0)).toEqual({ z: new Set(), area: false });
    const zaAt = frames.findIndex((f) => f.reveals?.includes('a')) + 1;
    const zbAt = frames.findIndex((f) => f.reveals?.includes('b')) + 1;
    const areaAt = frames.findIndex((f) => f.reveals?.includes('area')) + 1;
    expect(zaAt).toBeGreaterThan(0);
    expect(zbAt).toBeGreaterThan(zaAt);
    expect(areaAt).toBeGreaterThan(zbAt);
    expect(normalReveal(frames, zaAt).z.has('a')).toBe(true);
    expect(normalReveal(frames, zaAt).z.has('b')).toBe(false);
    expect(normalReveal(frames, areaAt - 1).area).toBe(false);
    expect(normalReveal(frames, frames.length)).toEqual({ z: new Set(['a', 'b']), area: true });
    expect(frames.at(-1).settle).toMatch(/^P\(160 \\le X \\le 180\) \\approx 0\{,\}/);
  });

  it.each(NORMAL_PRESETS.map((p) => p.id))('%s : chaque type de question se déroule, le dernier frame est Φ', (id) => {
    const preset = NORMAL_PRESETS.find((p) => p.id === id);
    for (const query of ['le', 'ge', 'between']) {
      const params = { ...preset.params, query };
      const result = normalQuery(params);
      const { frames } = normalFrames(params, result);
      expect(validateFrames(frames)).toEqual([]);
      expect(frames.at(-1).tone).toBe('result');
      expect(finalOnlyAtEnd(frames)).toBe(true);
    }
    expect(normalFrames(preset.params, { ok: false })).toBeNull();
  });

  it('un μ négatif s’écrit entre parenthèses', () => {
    const params = { mu: -2, sigma: 1, x: 0, a: 0, b: 0, query: 'le' };
    const { frames } = normalFrames(params, normalQuery(params));
    expect(frames.filter((f) => f.settle)[1].settle).toBe('z = \\frac{0 - (-2)}{1}');
  });
});

describe('les indicateurs au tableau (statsFrames)', () => {
  const EXAMPLE = [12, 15, 15, 18, 20, 21, 21, 25];
  const stats = describeDataset(EXAMPLE);

  it('moyenne : la formule, toutes les valeurs ↓ 147, [147] ⌒÷ [8] ↓ 18,375, x̄', () => {
    const { frames, problem } = statFrames('mean', EXAMPLE, stats);
    expect(validateFrames(frames)).toEqual([]);
    expect(problem).toBe('\\bar{x} = \\,?');
    expect(frames.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      '\\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n}',
      '12 + 15 + 15 + 18 + 20 + 21 + 21 + 25 = 147',
      '\\bar{x} = \\frac{147}{8} = 18{,}375',
      '\\bar{x} = 18{,}375',
    ]);
    expect(marks(frames[2])).toEqual(['result:147']);
  });

  it('médiane (n pair) : série ordonnée, rangs 4 et 5, les deux valeurs désignées, [18] ⌒+ [20], ⌒÷ 2, Me', () => {
    const { frames } = statFrames('median', EXAMPLE, stats);
    expect(validateFrames(frames)).toEqual([]);
    expect(frames.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      '12 \\le 15 \\le 15 \\le 18 \\le 20 \\le 21 \\le 21 \\le 25',
      '\\frac{8}{2} = 4 \\qquad \\frac{8}{2} + 1 = 5',
      'x_{4} = 18 \\qquad x_{5} = 20',
      'x_{4} + x_{5} = 18 + 20 = 38',
      'Me = \\frac{38}{2} = 19',
      'Me = 19',
    ]);
    const odd = statFrames('median', [3, 1, 2], describeDataset([3, 1, 2])).frames;
    expect(odd.at(-1).settle).toBe('Me = 2');
    expect(odd.find((f) => f.textKey?.endsWith('readRank')).marks).toEqual([{ type: 'under', target: 's1', latex: 'x_{2}', tone: 'operation' }]);
  });

  it('quartiles, étendue, variance, écart type : chacun finit sur SA valeur', () => {
    expect(statFrames('quartiles', EXAMPLE, stats).frames.at(-1).settle).toBe('Q_3 - Q_1 = 6');
    expect(statFrames('range', [-4, 6], describeDataset([-4, 6])).frames.filter((f) => f.settle).map((f) => f.settle))
      .toEqual(['\\min = -4 \\qquad \\max = 6', '\\max - \\min = 6 - (-4) = 10', '\\max - \\min = 10']);
    const variance = statFrames('variance', [2, 4, 6], describeDataset([2, 4, 6])).frames;
    expect(variance.filter((f) => f.settle).map((f) => f.settle)).toEqual([
      'V = \\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2',
      '\\bar{x} = 4',
      'x_i - \\bar{x} : \\ -2 ;\\ 0 ;\\ 2',
      '(x_i - \\bar{x})^2 : \\ 4 ;\\ 0 ;\\ 4',
      '\\sum (x_i - \\bar{x})^2 = 4 + 0 + 4 = 8',
      'V = \\frac{8}{3} \\approx 2{,}6667',
      'V \\approx 2{,}6667',
    ]);
    expect(statFrames('sd', [2, 4, 6], describeDataset([2, 4, 6])).frames.at(-1).settle).toBe('\\sigma \\approx 1{,}633');
    const long = new Array(20).fill(3);
    expect(statFrames('variance', long, describeDataset(long)).frames.at(-1).settle).toBe('V = 0');
    expect(statFrames('mean', [], describeDataset([]))).toBeNull();
  });

  it.each(DATASET_PRESETS.map((p) => p.id))('%s : chaque indicateur se déroule sans défaut', (id) => {
    const values = parseDataset(DATASET_PRESETS.find((p) => p.id === id).text).values;
    const s = describeDataset(values);
    for (const kind of STAT_KINDS) {
      const { frames } = statFrames(kind, values, s);
      expect(validateFrames(frames)).toEqual([]);
      expect(finalOnlyAtEnd(frames)).toBe(true);
      expect(frames.some((f) => f.rows.flat().some((token) => /NaN|Infinity|undefined/.test(token.latex)))).toBe(false);
    }
  });
});

describe('chaque phrase d’un frame existe en arabe', () => {
  it('textKey / operationKey de tous les déroulés → mathlab.json', async () => {
    const { default: mathlab } = await import('../../../../i18n/locales/ar/mathlab.json');
    const lookup = (key) => key.split('.').reduce((node, part) => node?.[part], mathlab);
    const keys = new Set();
    const collect = (board) => board?.frames.forEach((f) => [f.textKey, f.operationKey, f.task?.promptKey].filter(Boolean).forEach((key) => keys.add(key)));
    for (const preset of TREE_PRESETS) {
      const tree = preset.create();
      const validation = validateTree(tree);
      collect(pathFrames(tree, [0], validation));
      collect(pathFrames(tree, new Array(tree.stages).fill(0), validation));
    }
    const urn = getTreePreset('urn').create();
    collect(eventFrames(urn, { stage: 2, label: 'B' }, validateTree(urn)));
    const med = getTreePreset('medicalTest').create();
    collect(conditionalFrames(med, { stage: 1, label: 'M' }, { stage: 2, label: 'T' }, validateTree(med)));
    collect(conditionalFrames(med, { stage: 2, label: 'T' }, { stage: 1, label: 'M' }, validateTree(med)));
    for (const query of ['le', 'ge', 'between']) {
      const params = { ...NORMAL_PRESETS[0].params, query };
      collect(normalFrames(params, normalQuery(params)));
    }
    for (const values of [[12, 15, 18], [12, 15, 15, 18], new Array(20).fill(0).map((_, i) => i)]) {
      for (const kind of STAT_KINDS) collect(statFrames(kind, values, describeDataset(values)));
    }
    expect([...keys].filter((key) => typeof lookup(key) !== 'string')).toEqual([]);
    expect(keys.size).toBeGreaterThan(30);
  });
});

describe('« تدرّب بنفسك » : chaque exercice est le vrai geste', () => {
  /** [indice du frame, cibles, opération] de chaque exercice d'un déroulé. */
  const tasks = (frames) => frames.flatMap((f, i) => (f.task ? [[i, f.task.targets, f.task.operator]] : []));

  it('chemin R₁ ∩ B₂ : désigner P(R₁), puis P_{R₁}(B₂) sur la branche allumée, puis [3/5] et [2/4] avec ×', () => {
    const urn = getTreePreset('urn').create();
    const { frames } = pathFrames(urn, [0, 1], validateTree(urn));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([[1, ['s0'], null], [2, ['s1'], null], [4, ['f0', 'f1'], '\\times']]);
    expect(frames[1].task.promptKey).toBe('tools.probabilityStats.practice.readBranch');
    expect(frames[4].rows[0].filter((t) => ['f0', 'f1'].includes(t.id)).map((t) => t.latex)).toEqual(['\\frac{3}{5}', '\\frac{2}{4}']);
  });

  it('événement B₂ : les facteurs de chaque chemin avec ×, puis les deux produits avec +', () => {
    const urn = getTreePreset('urn').create();
    const { frames } = eventFrames(urn, { stage: 2, label: 'B' }, validateTree(urn));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([[1, ['p0_0', 'p0_1'], '\\times'], [5, ['p1_0', 'p1_1'], '\\times'], [9, ['sum0', 'sum1'], '+']]);
    expect(frames[9].rows[0].filter((t) => ['sum0', 'sum1'].includes(t.id)).map((t) => t.latex)).toEqual(['\\frac{3}{10}', '\\frac{1}{10}']);
  });

  it('Bayes : le quotient se fait en désignant numérateur et dénominateur, avec ÷', () => {
    const tree = getTreePreset('medicalTest').create();
    const { frames } = conditionalFrames(tree, { stage: 1, label: 'M' }, { stage: 2, label: 'T' }, validateTree(tree));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames).at(-1)).toEqual([12, ['d0', 'd1'], '\\div']);
  });

  it('loi normale : x, μ, σ désignés par leur valeur, puis [x] et [μ] avec −, puis [x − μ] et [σ] avec ÷', () => {
    const params = { mu: 175, sigma: 7, x: 170, a: 160, b: 180, query: 'le' };
    const { frames } = normalFrames(params, normalQuery(params));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([
      [1, ['x_x'], null], [2, ['x_mu'], null], [3, ['x_s'], null],
      [5, ['x_x', 'x_mu'], '-'],
      [8, ['x_d', 'x_s'], '\\div'],
    ]);
    expect(frames[2].task.promptParams).toEqual({ value: '$175$' });
    const ge = normalFrames({ ...params, query: 'ge' }, normalQuery({ ...params, query: 'ge' })).frames;
    expect(tasks(ge).at(-1)[1]).toEqual(['one', 'vphi']);
    expect(tasks(ge).at(-1)[2]).toBe('-');
  });

  it('moyenne : toutes les valeurs avec +, puis [somme] et [n] avec ÷ ; une longue série n’a pas d’exercice symbolique', () => {
    const values = [12, 15, 18];
    const { frames } = statFrames('mean', values, describeDataset(values));
    expect(validateFrames(frames)).toEqual([]);
    expect(tasks(frames)).toEqual([[1, ['t0', 't1', 't2'], '+'], [3, ['sum', 'n'], '\\div']]);
    const long = new Array(12).fill(0).map((_, i) => i);
    expect(tasks(statFrames('mean', long, describeDataset(long)).frames)).toEqual([[3, ['sum', 'n'], '\\div']]);
    const median = statFrames('median', [3, 1, 2], describeDataset([3, 1, 2])).frames;
    expect(median.find((f) => f.task?.promptKey?.endsWith('readRank')).task.targets).toEqual(['s1']);
    expect(statFrames('range', [-4, 6], describeDataset([-4, 6])).frames[0].task.targets).toEqual(['s0', 's1']);
  });
});
