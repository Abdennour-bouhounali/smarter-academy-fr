import { describe, it, expect } from 'vitest';
import {
  MAX_BRANCHES, MAX_STAGES, addBranch, addStage, allBranches, ambiguousLabels, autoCompleteNode,
  autoCompletePreview, branchAt, complementLabel, conditionalProbability, createDefaultTree, deleteBranch,
  duplicateBranch, eventProbability, formatProbabilityText, independenceOf, labelLatex, labelParts,
  leafCount, normalizeLabel, normalizeTree, parseProbability, pathResult, pathsOf, removeStage,
  setLabel, setProbability, setQuery, stageLabels, toStoredTree, validateTree,
} from './probabilityTree.js';
import { TREE_PRESETS, getTreePreset } from './treePresets.js';

const r = (n, d = 1) => ({ n, d });

describe('lire une probabilité EXACTEMENT', () => {
  it('lit fraction, décimal (point ou virgule) et pourcentage', () => {
    expect(parseProbability('1/4')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability(' 3 / 8 ')).toEqual({ ok: true, value: r(3, 8) });
    expect(parseProbability('0.25')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability('0,25')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability('.5')).toEqual({ ok: true, value: r(1, 2) });
    expect(parseProbability('25%')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability('12,5 %')).toEqual({ ok: true, value: r(1, 8) });
    expect(parseProbability('1')).toEqual({ ok: true, value: r(1) });
    expect(parseProbability('0')).toEqual({ ok: true, value: r(0) });
    expect(parseProbability('2/10')).toEqual({ ok: true, value: r(1, 5) });
  });

  it('accepte les chiffres arabes-indiens, la virgule arabe et ٪', () => {
    expect(parseProbability('٠٫٢٥')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability('٢٥٪')).toEqual({ ok: true, value: r(1, 4) });
    expect(parseProbability('۱/۳')).toEqual({ ok: true, value: r(1, 3) });
  });

  it('convertit un décimal sans approximation : 0,1 + 0,2 = 3/10', () => {
    expect(parseProbability('0,1').value).toEqual(r(1, 10));
    expect(parseProbability('0,333').value).toEqual(r(333, 1000));
  });

  it('nomme chaque refus', () => {
    expect(parseProbability('')).toEqual({ ok: false, error: 'empty' });
    expect(parseProbability('   ')).toEqual({ ok: false, error: 'empty' });
    expect(parseProbability(undefined)).toEqual({ ok: false, error: 'empty' });
    expect(parseProbability('abc').error).toBe('syntax');
    expect(parseProbability('1/2/3').error).toBe('syntax');
    expect(parseProbability('.').error).toBe('syntax');
    expect(parseProbability('%').error).toBe('syntax');
    expect(parseProbability('0,1234567891').error).toBe('syntax');
    expect(parseProbability('1/0').error).toBe('zeroDenominator');
    expect(parseProbability('5/4').error).toBe('range');
    expect(parseProbability('1,2').error).toBe('range');
    expect(parseProbability('-0,2').error).toBe('range');
    expect(parseProbability('120%').error).toBe('range');
  });

  it('réécrit une valeur dans le style voulu', () => {
    expect(formatProbabilityText(r(3, 4), 'fraction')).toBe('3/4');
    expect(formatProbabilityText(r(3, 4), 'decimal')).toBe('0,75');
    expect(formatProbabilityText(r(3, 4), 'percent')).toBe('75 %');
    // 1/3 n'a pas d'écriture décimale finie : il reste une fraction.
    expect(formatProbabilityText(r(1, 3), 'decimal')).toBe('1/3');
    expect(formatProbabilityText(r(1), 'fraction')).toBe('1');
  });
});

describe('les étiquettes', () => {
  it('ramène les écritures du contraire au macron', () => {
    expect(normalizeLabel('\\bar A')).toBe('A\u0304');
    expect(normalizeLabel('\\bar{B}')).toBe('B\u0304');
    expect(normalizeLabel('\\overline{C}')).toBe('C\u0304');
    expect(normalizeLabel('ليس A')).toBe('A\u0304');
    expect(normalizeLabel('  ولد  ')).toBe('ولد');
    expect(normalizeLabel('a$b{c}^_')).toBe('abc');
    expect(Array.from(normalizeLabel('x'.repeat(80)))).toHaveLength(24);
  });

  it('donne le contraire dans les deux sens', () => {
    expect(complementLabel('A')).toBe('A\u0304');
    expect(complementLabel('A\u0304')).toBe('A');
    expect(complementLabel('ولد')).toBe('ليس ولد');
    expect(complementLabel('ليس ولد')).toBe('ولد');
  });

  it('écrit l’étiquette en LaTeX, avec l’indice d’étape si besoin', () => {
    expect(labelLatex('A')).toBe('A');
    expect(labelLatex('A\u0304')).toBe('\\bar{A}');
    expect(labelLatex('R', 2)).toBe('R_{2}');
    expect(labelLatex('R1')).toBe('\\mathrm{R1}');
    expect(labelLatex('4')).toBe('4');
    expect(labelLatex('ولد')).toBe('\\text{ولد}');
    expect(labelParts('T\u0304')).toEqual({ text: 'T', bar: true });
  });
});

describe('valider un arbre', () => {
  it('accepte l’arbre par défaut et tous les exemples', () => {
    expect(validateTree(createDefaultTree()).valid).toBe(true);
    for (const preset of TREE_PRESETS) {
      const tree = preset.create();
      expect(validateTree(tree).valid, preset.id).toBe(true);
      expect(normalizeTree(tree), preset.id).toEqual(tree);
    }
  });

  it('signale une somme ≠ 1 SUR LE NŒUD, avec la somme et ce qui manque', () => {
    const tree = setProbability(createDefaultTree(), [0, 1], '1/3');
    const v = validateTree(tree);
    expect(v.valid).toBe(false);
    const issue = v.nodeIssues['0'].find((i) => i.code === 'sumNotOne');
    expect(issue.sum).toEqual(r(2, 3));
    expect(issue.missing).toEqual(r(1, 3));
    expect(v.nodeIssues['']).toBeUndefined();
  });

  it('signale une probabilité illisible ou hors de [0 ; 1] SUR LA BRANCHE', () => {
    let tree = setProbability(createDefaultTree(), [0], '1,4');
    expect(validateTree(tree).branchIssues['0']).toEqual({ code: 'range' });
    tree = setProbability(tree, [0], 'x');
    const v = validateTree(tree);
    expect(v.branchIssues['0']).toEqual({ code: 'syntax' });
    expect(v.nodeIssues[''].map((i) => i.code)).toContain('incomplete');
  });

  it('refuse deux branches sœurs de même nom et une étiquette vide', () => {
    let tree = setLabel(createDefaultTree(), [1], 'A');
    expect(validateTree(tree).nodeIssues[''].map((i) => i.code)).toContain('duplicateLabel');
    tree = setLabel(createDefaultTree(), [1], '   ');
    expect(validateTree(tree).branchIssues['1']).toEqual({ code: 'emptyLabel' });
  });

  it('ne calcule RIEN tant que l’arbre est faux', () => {
    const tree = setProbability(createDefaultTree(), [0, 0], '1/2');
    const v = validateTree(tree);
    expect(pathsOf(tree, v).every((p) => p.product === null)).toBe(true);
    expect(eventProbability(tree, { stage: 2, label: 'B' }, v).probability).toBeNull();
    expect(conditionalProbability(tree, { stage: 1, label: 'A' }, { stage: 2, label: 'B' }, v).value).toBeNull();
    expect(independenceOf(tree, v)).toBeNull();
  });
});

describe('calculer', () => {
  it('multiplie le long d’un chemin : P(R₁ ∩ B₂) = 3/5 × 2/4 = 3/10', () => {
    const urn = getTreePreset('urn').create();
    const path = pathResult(urn, [0, 1]);
    expect(path.labels).toEqual(['R', 'B']);
    expect(path.factors).toEqual([r(3, 5), r(1, 2)]);
    expect(path.product).toEqual(r(3, 10));
    // Un préfixe aussi : P(R₁) = 3/5.
    expect(pathResult(urn, [0]).product).toEqual(r(3, 5));
    expect(pathResult(urn, [])).toBeNull();
    expect(pathResult(urn, [5, 0])).toBeNull();
  });

  it('les chemins complets somment à 1', () => {
    for (const preset of TREE_PRESETS) {
      const tree = preset.create();
      const total = pathsOf(tree).reduce((acc, p) => acc + p.product.n / p.product.d, 0);
      expect(total, preset.id).toBeCloseTo(1, 12);
    }
  });

  it('probabilités totales : P(B₂) dans l’urne = 3/10 + 1/10 = 2/5', () => {
    const urn = getTreePreset('urn').create();
    const result = eventProbability(urn, { stage: 2, label: 'B' });
    expect(result.paths.map((p) => p.key)).toEqual(['0.1', '1.1']);
    expect(result.probability).toEqual(r(2, 5));
  });

  it('trois enfants : P(au 3e rang une fille) = 1/2, P(chemin) = 1/8', () => {
    const tree = getTreePreset('threeChildren').create();
    expect(leafCount(tree)).toBe(8);
    expect(eventProbability(tree, { stage: 3, label: 'F' }).probability).toEqual(r(1, 2));
    expect(pathsOf(tree)[0].product).toEqual(r(1, 8));
  });

  it('Bayes : le test médical — P_T(M) = 0,0095 / 0,059 = 19/118', () => {
    const tree = getTreePreset('medicalTest').create();
    const result = conditionalProbability(tree, { stage: 1, label: 'M' }, { stage: 2, label: 'T' });
    expect(result.pIntersection).toEqual(r(19, 2000));
    expect(result.pGiven).toEqual(r(59, 1000));
    expect(result.value).toEqual(r(19, 118));
    expect(result.intersectionPaths.map((p) => p.key)).toEqual(['0.0']);
    expect(result.givenPaths.map((p) => p.key)).toEqual(['0.0', '1.0']);
  });

  it('refuse de diviser par P(B) = 0', () => {
    let tree = setProbability(createDefaultTree(), [0, 0], '0');
    tree = setProbability(tree, [0, 1], '1');
    tree = setProbability(tree, [1, 0], '0');
    tree = setProbability(tree, [1, 1], '1');
    const result = conditionalProbability(tree, { stage: 1, label: 'A' }, { stage: 2, label: 'B' });
    expect(result.zeroGiven).toBe(true);
    expect(result.value).toBeNull();
  });

  it('DÉDUIT l’indépendance : deux pièces oui, l’urne sans remise non', () => {
    expect(independenceOf(getTreePreset('twoCoins').create())).toEqual({ stages: [{ stage: 2, independent: true }], independent: true });
    expect(independenceOf(getTreePreset('urn').create()).independent).toBe(false);
    expect(independenceOf(getTreePreset('threeChildren').create()).independent).toBe(true);
    const throws = independenceOf(getTreePreset('freeThrows').create());
    expect(throws.stages).toEqual([{ stage: 2, independent: false }, { stage: 3, independent: false }]);
    // Des écritures différentes d'un même nombre restent la même probabilité.
    let coins = getTreePreset('twoCoins').create();
    coins = setProbability(coins, [1, 0], '0,5');
    coins = setProbability(coins, [1, 1], '50%');
    expect(independenceOf(coins).independent).toBe(true);
    // Une seule étape : la question ne se pose pas.
    expect(independenceOf(getTreePreset('unequalDie').create())).toBeNull();
  });

  it('repère les étiquettes répétées d’une étape à l’autre', () => {
    expect([...ambiguousLabels(getTreePreset('urn').create())].sort()).toEqual(['B', 'R']);
    expect(ambiguousLabels(createDefaultTree()).size).toBe(0);
    expect(stageLabels(getTreePreset('medicalTest').create(), 2)).toEqual(['T', 'T\u0304']);
  });
});

describe('transformer l’arbre', () => {
  it('ajoute une branche qui reprend la forme du sous-arbre voisin, jusqu’à 4', () => {
    let tree = createDefaultTree();
    tree = addBranch(tree, []);
    expect(tree.branches).toHaveLength(3);
    expect(tree.branches[2].p).toBe('');
    expect(tree.branches[2].children).toHaveLength(2);
    expect(tree.branches[2].label).not.toBe('A');
    tree = addBranch(tree, []);
    expect(tree.branches).toHaveLength(MAX_BRANCHES);
    expect(addBranch(tree, [])).toBe(tree);
    // Une feuille ne porte pas de branche.
    expect(addBranch(tree, [0, 0])).toBe(tree);
    const ids = allBranches(tree).map((b) => b.branch.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('supprime une branche mais jamais la dernière d’un nœud', () => {
    let tree = deleteBranch(createDefaultTree(), [0, 1]);
    expect(branchAt(tree, [0]).children).toHaveLength(1);
    expect(deleteBranch(tree, [0, 0])).toBe(tree);
    expect(deleteBranch(tree, [9])).toBe(tree);
  });

  it('duplique une branche AVEC son sous-arbre, sous un nom libre et des identifiants neufs', () => {
    const tree = duplicateBranch(createDefaultTree(), [0]);
    expect(tree.branches).toHaveLength(3);
    const [original, copy] = tree.branches;
    expect(copy.label).not.toBe(original.label);
    expect(copy.p).toBe(original.p);
    expect(copy.children.map((c) => [c.label, c.p])).toEqual(original.children.map((c) => [c.label, c.p]));
    expect(copy.children[0].id).not.toBe(original.children[0].id);
  });

  it('complète automatiquement la dernière branche dans le style des autres', () => {
    let tree = setProbability(createDefaultTree(), [1], '');
    expect(autoCompletePreview(tree, [])).toBe('2/5');
    tree = autoCompleteNode(tree, []);
    expect(tree.branches[1].p).toBe('2/5');
    // Décimaux : la réponse est décimale ; pourcentages : en %.
    let decimals = setProbability(getTreePreset('medicalTest').create(), [0, 1], '');
    decimals = autoCompleteNode(decimals, [0]);
    expect(branchAt(decimals, [0, 1]).p).toBe('0,05');
    let percent = setProbability(getTreePreset('freeThrows').create(), [1], '');
    percent = autoCompleteNode(percent, []);
    expect(branchAt(percent, [1]).p).toBe('30 %');
    // Impossible quand les autres dépassent 1 ou sont illisibles.
    const over = setProbability(createDefaultTree(), [0], '6/5');
    expect(autoCompleteNode(over, [])).toBe(over);
    expect(autoCompletePreview(over, [])).toBeNull();
    // Déjà juste : rien à écrire.
    expect(autoCompletePreview(createDefaultTree(), [])).toBeNull();
  });

  it('ajoute et retire une étape, dans les limites 1…3', () => {
    let tree = addStage(createDefaultTree());
    expect(tree.stages).toBe(3);
    expect(leafCount(tree)).toBe(8);
    expect(validateTree(tree).valid).toBe(true);
    expect(stageLabels(tree, 3)).toEqual(['C', 'C\u0304']);
    expect(addStage(tree)).toBe(tree);
    expect(tree.stages).toBe(MAX_STAGES);
    tree = removeStage(removeStage(tree));
    expect(tree.stages).toBe(1);
    expect(leafCount(tree)).toBe(2);
    expect(removeStage(tree)).toBe(tree);
  });

  it('renomme et fait tomber une requête devenue sans objet', () => {
    let tree = setQuery(getTreePreset('urn').create(), { kind: 'event', event: { stage: 2, label: 'B' } });
    expect(tree.query).not.toBeNull();
    tree = setLabel(tree, [0, 1], 'X');
    expect(tree.query).not.toBeNull();
    tree = setLabel(tree, [1, 1], 'Y');
    expect(tree.query).toBeNull();
    const withPath = setQuery(createDefaultTree(), { kind: 'path', path: [1, 1] });
    expect(removeStage(withPath).query).toBeNull();
  });

  it('tient 64 feuilles (3 étapes × 4 branches), et pas une de plus', () => {
    let tree = { ...createDefaultTree(), branches: createDefaultTree().branches };
    tree = addStage(tree);
    tree = addBranch(addBranch(tree, []), []);
    for (const node of [[0], [1], [2], [3]]) tree = addBranch(addBranch(tree, node), node);
    for (let i = 0; i < 4; i += 1) for (let j = 0; j < 4; j += 1) tree = addBranch(addBranch(tree, [i, j]), [i, j]);
    expect(leafCount(tree)).toBe(64);
    expect(addBranch(tree, [0, 0])).toBe(tree);
  });
});

describe('relire un arbre enregistré', () => {
  it('fait l’aller-retour sans rien perdre', () => {
    const tree = setQuery(getTreePreset('medicalTest').create(), { kind: 'conditional', target: { stage: 1, label: 'M' }, given: { stage: 2, label: 'T' } });
    expect(normalizeTree(JSON.parse(JSON.stringify(toStoredTree(tree))))).toEqual(tree);
  });

  it('ne lève jamais, et remplace un arbre incohérent par l’arbre par défaut', () => {
    for (const garbage of [null, 42, 'arbre', [], { stages: 9 }, { stages: 2, branches: 'x' },
      { stages: 2, branches: [{ label: 'A', p: '1', children: [] }] },
      { stages: 1, branches: [] }]) {
      expect(normalizeTree(garbage)).toEqual(createDefaultTree());
    }
  });

  it('refait les identifiants manquants ou dupliqués, borne étiquettes et textes', () => {
    const tree = normalizeTree({
      stages: 1,
      branches: [
        { id: 'b1', label: 'A'.repeat(100), p: '1/2'.repeat(20), children: [] },
        { id: 'b1', label: 'B', p: 0.5, children: [] },
        { label: 'C', p: '0', children: [] },
        { id: 'b3', label: 'D', p: '0', children: [] },
        { id: 'b9', label: 'E', p: '0', children: [] },
      ],
      query: { kind: 'path', path: [2] },
    });
    expect(tree.branches).toHaveLength(4);
    const ids = tree.branches.map((b) => b.id);
    expect(new Set(ids).size).toBe(4);
    expect(Array.from(tree.branches[0].label)).toHaveLength(24);
    expect(tree.branches[0].p.length).toBeLessThanOrEqual(16);
    expect(tree.branches[1].p).toBe('0.5');
    expect(tree.query).toEqual({ kind: 'path', path: [2] });
  });

  it('écarte une requête qui ne tient pas', () => {
    expect(normalizeTree({ ...createDefaultTree(), query: { kind: 'path', path: [7] } }).query).toBeNull();
    expect(normalizeTree({ ...createDefaultTree(), query: { kind: 'event', event: { stage: 3, label: 'A' } } }).query).toBeNull();
    expect(normalizeTree({ ...createDefaultTree(), query: { kind: 'nawak' } }).query).toBeNull();
  });
});
