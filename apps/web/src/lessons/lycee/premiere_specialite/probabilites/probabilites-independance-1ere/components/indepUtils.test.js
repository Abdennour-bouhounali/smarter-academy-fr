import { describe, it, expect } from 'vitest';
import {
  rat, ratAdd, ratMul, ratEq, ratSum, ratIsOne, ratValue, fr, pct,
  crossFromCounts, conditional, conditionalCounts, pInter, pRow, pCol,
  treeFromCross, pathProbability, totalProbability, inverseFromTree,
  inversionPair, independence, compatibility,
  labTable, twoTrees, labReadings, identicalSecondLevel,
  independentStates, isLabState, dragPath, nABMin, nABMax,
  LAB_TOTAL, LAB_NB, LAB_STEP,
} from './indepUtils';
import {
  LAB_START, LAB_INDEP, LAB_INDEP_2, LAB_INCOMPATIBLE,
  CAS, casTable, STAGE, stageTable, stageTreeByPrepa, stageTreeByRecu,
  desTable, des8Table, cartesCoeurRoi, cartesCoeurPique, atelierTable,
  BOSS_NUMBERS,
} from '../data';

/**
 * LE MODÈLE D'ABORD (patron Première §18). Rien de ce que la leçon affiche
 * n'est écrit à la main : chaque nombre cité par un module est RECALCULÉ ici,
 * et chaque affirmation de la leçon est un test.
 */

describe('arithmétique rationnelle exacte', () => {
  it('réduit, refuse le dénominateur nul et les non-entiers', () => {
    expect(rat(4, 8)).toEqual({ n: 1, d: 2 });
    expect(rat(-2, -4)).toEqual({ n: 1, d: 2 });
    expect(rat(2, -4)).toEqual({ n: -1, d: 2 });
    expect(() => rat(1, 0)).toThrow(/dénominateur nul/);
    expect(() => rat(0.5, 2)).toThrow(/entiers/);
  });

  it('additionne et multiplie sans jamais passer par un flottant', () => {
    // 0,6 × 0,02 + 0,3 × 0,05 + 0,1 × 0,10 rend 0,037000000000000005 en
    // flottant ; la fraction rend 37/1000 exactement.
    const s = ratSum([
      ratMul(rat(6, 10), rat(2, 100)),
      ratMul(rat(3, 10), rat(5, 100)),
      ratMul(rat(1, 10), rat(10, 100)),
    ]);
    expect(s).toEqual({ n: 37, d: 1000 });
    expect(0.6 * 0.02 + 0.3 * 0.05 + 0.1 * 0.1).not.toBe(0.037);
  });

  it('ratEq compare par produit croisé, sans tolérance', () => {
    expect(ratEq(rat(2, 4), rat(50, 100))).toBe(true);
    expect(ratEq(rat(1, 3), rat(33333, 100000))).toBe(false);
    expect(ratEq(null, rat(1, 2))).toBe(false);
  });

  it('formate à la française', () => {
    expect(fr(0.075, 3)).toBe('0,075');
    expect(pct(rat(1, 3), 1)).toBe('33,3 %');
    expect(pct(rat(2, 5), 1)).toBe('40 %');
    expect(pct(null)).toBe('—');
  });
});

describe('tableau croisé : effectifs entiers, sommes exactes', () => {
  it('refuse un effectif non entier ou une somme fausse', () => {
    const spec = { rows: ['a'], cols: ['x', 'y'], cells: { a: { x: 1, y: 2 } }, total: 3 };
    expect(crossFromCounts(spec).rowTotals.a).toBe(3);
    expect(() => crossFromCounts({ ...spec, total: 4 })).toThrow(/somme des effectifs/);
    expect(() => crossFromCounts({ ...spec, cells: { a: { x: 1.5, y: 1.5 } } })).toThrow(/non entier/);
  });

  it('conditional rend null sur un univers vide, jamais 0', () => {
    const t = crossFromCounts({
      rows: ['a', 'b'], cols: ['x', 'y'],
      cells: { a: { x: 0, y: 0 }, b: { x: 3, y: 7 } }, total: 10,
    });
    expect(conditional(t, { axis: 'row', key: 'a' }, 'x')).toBeNull();
    expect(conditional(t, { axis: 'row', key: 'b' }, 'x')).toEqual({ n: 3, d: 10 });
    expect(conditionalCounts(t, { axis: 'row', key: 'b' }, 'x')).toEqual({ numerator: 3, denominator: 10 });
  });
});

describe('arbres : la somme des branches vaut 1 EXACTEMENT', () => {
  const trees = () => [
    stageTreeByPrepa(), stageTreeByRecu(),
    treeFromCross(atelierTable(), { firstAxis: 'row' }),
    treeFromCross(desTable(), { firstAxis: 'row' }),
    treeFromCross(cartesCoeurRoi(), { firstAxis: 'row' }),
  ];

  it('à chaque niveau de chaque arbre de la leçon', () => {
    for (const tree of trees()) {
      expect(ratIsOne(ratSum(tree.map((b) => b.p)))).toBe(true);
      for (const b of tree) {
        expect(ratIsOne(ratSum(b.children.map((c) => c.p)))).toBe(true);
      }
    }
  });

  it('la somme de TOUS les produits terminaux vaut 1', () => {
    for (const tree of trees()) {
      const leaves = tree.flatMap((b) => b.children.map((c) => ratMul(b.p, c.p)));
      expect(ratIsOne(ratSum(leaves))).toBe(true);
    }
  });

  it('totalProbability refuse une famille qui ne partitionne pas', () => {
    const faux = [
      { id: 'a', p: rat(1, 2), children: [{ id: 'x', p: rat(1, 2) }] },
      { id: 'b', p: rat(1, 4), children: [{ id: 'x', p: rat(1, 2) }] },
    ];
    expect(() => totalProbability(faux, 'x')).toThrow(/ne partitionne pas/);
  });
});

/* ══ P1 — INVERSER LE CONDITIONNEMENT ════════════════════════════════════ */

describe('P1 — inverser un conditionnement', () => {
  const t = stageTable();

  it('les deux sens du stage sont ceux que la leçon affiche : 90 % et 45 %', () => {
    const inv = inversionPair(t, { fromAxis: 'row', fromKey: 'prepa', toKey: 'recu' });
    expect(inv.direct).toEqual({ n: 9, d: 10 });
    expect(inv.inverse).toEqual({ n: 9, d: 20 });
    expect(pct(inv.direct, 0)).toBe('90 %');
    expect(pct(inv.inverse, 0)).toBe('45 %');
    expect(inv.same).toBe(false);
  });

  it('le NUMÉRATEUR est le même dans les deux sens ; seul le dénominateur change', () => {
    const inv = inversionPair(t, { fromAxis: 'row', fromKey: 'prepa', toKey: 'recu' });
    expect(inv.numerator).toBe(90);
    expect(inv.denomDirect).toBe(100);
    expect(inv.denomInverse).toBe(200);
    // Et ces deux dénominateurs sont bien les marges du tableau.
    expect(t.rowTotals.prepa).toBe(100);
    expect(t.colTotals.recu).toBe(200);
  });

  it('l’inversion lue sur l’arbre donne le même nombre que sur le tableau', () => {
    const tree = stageTreeByPrepa();
    const parArbre = inverseFromTree(tree, 'recu', 'prepa');
    const parTableau = conditional(t, { axis: 'col', key: 'recu' }, 'prepa');
    expect(ratEq(parArbre, parTableau)).toBe(true);
    // La probabilité totale au dénominateur : 0,2 × 0,9 + 0,8 × 0,275 = 0,4
    expect(totalProbability(tree, 'recu').total).toEqual({ n: 2, d: 5 });
  });

  it('inverser vers un univers vide rend null, jamais 0', () => {
    const t0 = crossFromCounts({
      rows: ['a', 'b'], cols: ['x', 'y'],
      cells: { a: { x: 0, y: 5 }, b: { x: 0, y: 5 } }, total: 10,
    });
    const inv = inversionPair(t0, { fromAxis: 'row', fromKey: 'a', toKey: 'x' });
    expect(inv.inverse).toBeNull();
    expect(inverseFromTree(treeFromCross(t0), 'x', 'a')).toBeNull();
  });

  it('les deux sens COÏNCIDENT exactement quand les deux univers ont la même taille', () => {
    // Contre-exemple utile : l'inversion n'est pas toujours un renversement.
    const t2 = crossFromCounts({
      rows: ['a', 'b'], cols: ['x', 'y'],
      cells: { a: { x: 30, y: 20 }, b: { x: 20, y: 30 } }, total: 100,
    });
    const inv = inversionPair(t2, { fromAxis: 'row', fromKey: 'a', toKey: 'x' });
    expect(inv.denomDirect).toBe(inv.denomInverse);
    expect(inv.same).toBe(true);
  });
});

/* ══ P2, P3 — L'INDÉPENDANCE ═════════════════════════════════════════════ */

describe('P2 / P3 — l’indépendance, testée sur les entiers', () => {
  it('le test est un produit croisé d’ENTIERS, sans division', () => {
    const t = casTable(CAS[0]);
    const ind = independence(t, { rowKey: 'A', colKey: 'B' });
    expect(ind.exact).toEqual({ left: 200 * 1000, right: 500 * 400 });
    expect(ind.independent).toBe(true);
  });

  it('chaque cas du module 3 porte RÉELLEMENT le verdict qu’il annonce', () => {
    for (const cas of CAS) {
      const ind = independence(casTable(cas), { rowKey: 'A', colKey: 'B' });
      expect(ind.independent).toBe(cas.expectIndependent);
      expect(ind.degenerate).toBe(false);
    }
  });

  it('LES TROIS ÉCRITURES SONT ÉQUIVALENTES sur tous les cas de la leçon', () => {
    const tables = [
      ...CAS.map((c) => [casTable(c), 'A', 'B']),
      [stageTable(), 'prepa', 'recu'],
      [desTable(), 'pair', 'somme7'],
      [des8Table(), 'pair', 'somme8'],
      [cartesCoeurRoi(), 'coeur', 'roi'],
      [atelierTable(), 'm1', 'defectueuse'],
    ];
    for (const [t, rowKey, colKey] of tables) {
      const ind = independence(t, { rowKey, colKey });
      const parProduit = ratEq(ind.pInter, ind.pAtimesPB);
      const parCondAB = ratEq(ind.condAB, ind.pB);   // P_A(B) = P(B)
      const parCondBA = ratEq(ind.condBA, ind.pA);   // P_B(A) = P(A)
      expect(parProduit).toBe(ind.independent);
      expect(parCondAB).toBe(ind.independent);
      expect(parCondBA).toBe(ind.independent);
    }
  });

  it('le « presque-cas » c4 trompe l’œil et se fait attraper au calcul', () => {
    const cas = CAS.find((c) => c.nearMiss);
    const ind = independence(casTable(cas), { rowKey: 'A', colKey: 'B' });
    expect(ind.independent).toBe(false);
    // Les deux poids de 2ᵉ génération sont proches à moins de 2 points…
    const pA = ratValue(ind.condAB);
    const t = casTable(cas);
    const pNotA = ratValue(conditional(t, { axis: 'row', key: 'nonA' }, 'B'));
    expect(Math.abs(pA - pNotA)).toBeLessThan(0.02);
    // …et pourtant l'égalité d'entiers est fausse, sans ambiguïté possible.
    expect(ind.exact.left).not.toBe(ind.exact.right);
    expect(ind.exact.left).toBe(124000);
    expect(ind.exact.right).toBe(121600);
  });

  it('les deux dés : somme 7 indépendante du premier dé, somme 8 non', () => {
    const i7 = independence(desTable(), { rowKey: 'pair', colKey: 'somme7' });
    expect(i7.independent).toBe(true);
    expect(i7.exact).toEqual({ left: 3 * 36, right: 18 * 6 });
    const i8 = independence(des8Table(), { rowKey: 'pair', colKey: 'somme8' });
    expect(i8.independent).toBe(false);
    expect(i8.exact).toEqual({ left: 3 * 36, right: 18 * 5 });
  });

  it('les cartes : cœur et roi indépendants, cœur et pique non', () => {
    expect(independence(cartesCoeurRoi(), { rowKey: 'coeur', colKey: 'roi' }).independent).toBe(true);
    expect(independence(cartesCoeurPique(), { rowKey: 'coeur', colKey: 'pique' }).independent).toBe(false);
  });

  it('l’atelier : « vient de la machine 1 » et « défectueuse » sont indépendants', () => {
    const ind = independence(atelierTable(), { rowKey: 'm1', colKey: 'defectueuse' });
    expect(ind.independent).toBe(true);
    expect(ind.condAB).toEqual({ n: 1, d: 20 });     // P_M1(déf) = 5 %
    expect(ind.pB).toEqual({ n: 1, d: 20 });         // P(déf)    = 5 %
    expect(ind.condBA).toEqual({ n: 3, d: 5 });      // P_déf(M1) = 60 %
    expect(ind.pA).toEqual({ n: 3, d: 5 });          // P(M1)     = 60 %
  });

  it('signale les cas dégénérés : ∅ et l’univers entier ne prouvent rien', () => {
    const t = crossFromCounts({
      rows: ['A', 'nonA'], cols: ['B', 'nonB'],
      cells: { A: { B: 0, nonB: 0 }, nonA: { B: 4, nonB: 6 } }, total: 10,
    });
    const ind = independence(t, { rowKey: 'A', colKey: 'B' });
    expect(ind.independent).toBe(true);     // vrai… et sans intérêt
    expect(ind.degenerate).toBe(true);      // …et le noyau le dit
  });
});

/* ══ P4 — INDÉPENDANT ≠ INCOMPATIBLE ═════════════════════════════════════ */

describe('P4 — indépendant n’est pas incompatible', () => {
  it('LE THÉORÈME, par balayage : incompatibles et tous deux possibles ⇒ JAMAIS indépendants', () => {
    // On balaie toutes les répartitions entières d'une population de 60 en
    // deux événements DISJOINTS et non vides. Aucune n'est indépendante.
    let vus = 0;
    for (let nA = 1; nA < 60; nA += 1) {
      for (let nB = 1; nA + nB <= 60; nB += 1) {
        const t = crossFromCounts({
          rows: ['A', 'nonA'], cols: ['B', 'nonB'],
          cells: { A: { B: 0, nonB: nA }, nonA: { B: nB, nonB: 60 - nA - nB } },
          total: 60,
        });
        const c = compatibility(t, { rowKey: 'A', colKey: 'B' });
        expect(c.incompatible).toBe(true);
        expect(c.bothPossible).toBe(true);
        expect(c.independent).toBe(false);
        expect(c.provesNotIndependent).toBe(true);
        vus += 1;
      }
    }
    expect(vus).toBeGreaterThan(1000);
  });

  it('cœur et pique : incompatibles, donc pas indépendants — et les deux nombres le montrent', () => {
    const c = compatibility(cartesCoeurPique(), { rowKey: 'coeur', colKey: 'pique' });
    expect(c.incompatible).toBe(true);
    expect(c.independent).toBe(false);
    expect(c.pInter).toEqual({ n: 0, d: 1 });
    expect(c.pAtimesPB).toEqual({ n: 1, d: 16 });      // 1/4 × 1/4
    expect(ratValue(c.pAtimesPB)).toBeGreaterThan(0);
  });

  it('cœur et roi : compatibles ET indépendants — les deux notions sont bien distinctes', () => {
    const c = compatibility(cartesCoeurRoi(), { rowKey: 'coeur', colKey: 'roi' });
    expect(c.incompatible).toBe(false);
    expect(c.independent).toBe(true);
  });

  it('les quatre combinaisons existent : le tableau à double entrée de P4 est plein', () => {
    // indépendant & compatible, non indépendant & compatible,
    // non indépendant & incompatible ; la quatrième case (indépendant &
    // incompatible) est VIDE dès que les deux événements sont possibles —
    // c'est précisément ce que le module fait constater.
    const cr = compatibility(cartesCoeurRoi(), { rowKey: 'coeur', colKey: 'roi' });
    expect([cr.independent, cr.incompatible]).toEqual([true, false]);
    const st = compatibility(stageTable(), { rowKey: 'prepa', colKey: 'recu' });
    expect([st.independent, st.incompatible]).toEqual([false, false]);
    const cp = compatibility(cartesCoeurPique(), { rowKey: 'coeur', colKey: 'pique' });
    expect([cp.independent, cp.incompatible]).toEqual([false, true]);
  });
});

/* ══ LE LABORATOIRE DU MODULE 1 : LE GLISSER ═════════════════════════════ */

describe('module 1 — les deux arbres, et le glisser qui les recalcule', () => {
  it('les quatre cases sont entières et somment au total pour TOUT état atteignable', () => {
    let n = 0;
    for (let nA = 0; nA <= LAB_TOTAL; nA += LAB_STEP) {
      for (let nAB = nABMin(nA); nAB <= nABMax(nA); nAB += LAB_STEP) {
        const t = labTable({ nA, nAB });
        const somme = t.rows.reduce((a, r) => a + t.cols.reduce((b, c) => b + t.cells[r][c], 0), 0);
        expect(somme).toBe(LAB_TOTAL);
        for (const r of t.rows) for (const c of t.cols) expect(Number.isInteger(t.cells[r][c])).toBe(true);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(2000);
  });

  it('les DEUX arbres décrivent la même population et somment à 1, partout', () => {
    for (let nA = 0; nA <= LAB_TOTAL; nA += 50) {
      for (let nAB = nABMin(nA); nAB <= nABMax(nA); nAB += 20) {
        const { byA, byB, table } = twoTrees({ nA, nAB });
        expect(ratIsOne(ratSum(byA.map((b) => b.p)))).toBe(true);
        expect(ratIsOne(ratSum(byB.map((b) => b.p)))).toBe(true);
        for (const tree of [byA, byB]) {
          for (const b of tree) {
            if (b.children.some((c) => c.p === null)) { expect(b.count).toBe(0); continue; }
            expect(ratIsOne(ratSum(b.children.map((c) => c.p)))).toBe(true);
          }
        }
        // Même population : le chemin A∩B pèse la même chose dans les deux arbres.
        if (byA[0].count > 0 && byB[0].count > 0) {
          expect(ratEq(pathProbability(byA, 'A', 'B'), pathProbability(byB, 'B', 'A'))).toBe(true);
          expect(ratEq(pathProbability(byA, 'A', 'B'), pInter(table, 'A', 'B'))).toBe(true);
        }
      }
    }
  });

  it('CONSTAT 1 — à l’état de départ, les deux sens diffèrent nettement', () => {
    const r = labReadings(LAB_START);
    expect(r.condAB).toEqual({ n: 1, d: 3 });    // P_A(B) = 200/600
    expect(r.condBA).toEqual({ n: 1, d: 2 });    // P_B(A) = 200/400
    expect(r.sensesDiffer).toBe(true);
    expect(r.independent).toBe(false);
  });

  it('CONSTAT 2 — la cible d’indépendance rend les poids de 2ᵉ génération IDENTIQUES', () => {
    const r = labReadings(LAB_INDEP);
    expect(r.independent).toBe(true);
    expect(r.degenerate).toBe(false);
    expect(r.flatA).toBe(true);
    expect(r.flatB).toBe(true);
    // Dans l'arbre par A : les deux poids valent 2/5 = P(B).
    expect(r.byA.map((b) => b.children.find((c) => c.id === 'B').p)).toEqual([{ n: 2, d: 5 }, { n: 2, d: 5 }]);
    // Dans l'arbre par B : les deux poids valent 1/2 = P(A).
    expect(r.byB.map((b) => b.children.find((c) => c.id === 'A').p)).toEqual([{ n: 1, d: 2 }, { n: 1, d: 2 }]);
    // Et les deux arbres restent DIFFÉRENTS l'un de l'autre : 2/5 ≠ 1/2.
    expect(ratEq(r.condAB, r.condBA)).toBe(false);
  });

  it('« poids identiques dans chaque arbre » ⟺ indépendance, sur TOUT l’espace du glisser', () => {
    for (let nA = 0; nA <= LAB_TOTAL; nA += LAB_STEP) {
      for (let nAB = nABMin(nA); nAB <= nABMax(nA); nAB += LAB_STEP) {
        const r = labReadings({ nA, nAB });
        if (r.degenerate) continue;
        expect(r.flatA).toBe(r.independent);
        expect(r.flatB).toBe(r.independent);
      }
    }
  });

  it('ATTEIGNABILITÉ — l’indépendance a 19 réglages NON DÉGÉNÉRÉS atteignables au pas de 10', () => {
    const etats = independentStates();
    expect(etats.length).toBe(19);
    // (50, 20) … (950, 380). Le vingtième multiple, (1000, 400), est DÉGÉNÉRÉ —
    // A y est l'univers entier — et le noyau l'écarte : il satisfait l'égalité
    // sans rien montrer. Bornes exhibées pour que le test dise le domaine.
    expect(etats[0]).toEqual({ nA: 50, nAB: 20 });
    expect(etats[etats.length - 1]).toEqual({ nA: 950, nAB: 380 });
    expect(etats).toContainEqual(LAB_INDEP);
    expect(etats).toContainEqual(LAB_INDEP_2);
    for (const e of etats) {
      expect(isLabState(e)).toBe(true);
      expect(e.nA % LAB_STEP).toBe(0);
      expect(e.nAB % LAB_STEP).toBe(0);
      // Le critère exact, revérifié sur chacun.
      expect(e.nAB * LAB_TOTAL).toBe(e.nA * LAB_NB);
    }
  });

  it('ATTEIGNABILITÉ — le CHEMIN du départ à la cible ne passe par aucun état interdit', () => {
    const chemin = dragPath(LAB_START, LAB_INDEP);
    expect(chemin[0]).toEqual(LAB_START);
    expect(chemin[chemin.length - 1]).toEqual(LAB_INDEP);
    for (const etat of chemin) expect(isLabState(etat)).toBe(true);
    // Le chemin est court : 10 crans sur nA, aucun sur nAB (200 est déjà bon).
    expect(chemin.length).toBe(11);
    // Un seul de ces états est indépendant : c'est bien une CIBLE, pas un plateau.
    const indeps = chemin.filter((e) => labReadings(e).independent && !labReadings(e).degenerate);
    expect(indeps).toEqual([LAB_INDEP]);
  });

  it('le chemin vers le second réglage d’indépendance est lui aussi praticable', () => {
    for (const cible of [LAB_INDEP_2, LAB_INCOMPATIBLE]) {
      const chemin = dragPath(LAB_START, cible);
      for (const etat of chemin) expect(isLabState(etat)).toBe(true);
      expect(chemin[chemin.length - 1]).toEqual(cible);
    }
  });

  it('l’état INCOMPATIBLE est atteignable, et il n’est PAS indépendant', () => {
    const r = labReadings(LAB_INCOMPATIBLE);
    expect(isLabState(LAB_INCOMPATIBLE)).toBe(true);
    expect(r.counts.nAB).toBe(0);
    expect(r.independent).toBe(false);
    expect(r.pInter).toEqual({ n: 0, d: 1 });
    expect(r.pAtimesPB).toEqual({ n: 2, d: 25 });        // 0,2 × 0,4 = 0,08
    expect(ratValue(r.pAtimesPB)).toBeGreaterThan(0);
    const c = compatibility(r.table, { rowKey: 'A', colKey: 'B' });
    expect(c.provesNotIndependent).toBe(true);
  });

  it('isLabState refuse ce que le glisser ne peut pas produire', () => {
    expect(isLabState({ nA: 500, nAB: 205 })).toBe(false);   // hors cran
    expect(isLabState({ nA: 300, nAB: 400 })).toBe(false);   // nAB > nA
    expect(isLabState({ nA: 900, nAB: 200 })).toBe(false);   // 4ᵉ case négative
    expect(isLabState({ nA: 900, nAB: 300 })).toBe(true);    // la borne basse
    expect(nABMin(900)).toBe(300);
    expect(nABMax(900)).toBe(400);
  });

  it('identicalSecondLevel refuse un arbre dont une branche n’existe pas', () => {
    const { byA } = twoTrees({ nA: 0, nAB: 0 });
    expect(identicalSecondLevel(byA, 'B')).toBe(false);
  });
});

/* ══ LES NOMBRES DES MODULES ET DU BOSS ══════════════════════════════════ */

describe('les valeurs citées par les modules sont recalculées, pas recopiées', () => {
  it('le stage : les marges et les deux quotients', () => {
    const t = stageTable();
    expect(t.rowTotals.prepa).toBe(100);
    expect(t.rowTotals.sansPrepa).toBe(400);
    expect(t.colTotals.recu).toBe(200);
    expect(t.colTotals.echoue).toBe(300);
    expect(t.total).toBe(STAGE.population);
    expect(pct(pRow(t, 'prepa'), 0)).toBe('20 %');
    expect(pct(pCol(t, 'recu'), 0)).toBe('40 %');
    expect(pct(pInter(t, 'prepa', 'recu'), 0)).toBe('18 %');
  });

  it('les cas du module 3 : les pourcentages affichés dans les explications', () => {
    const lire = (cas, row) => pct(conditional(casTable(cas), { axis: 'row', key: row }, 'B'), 0);
    expect(lire(CAS[0], 'A')).toBe('40 %');
    expect(lire(CAS[0], 'nonA')).toBe('40 %');
    expect(lire(CAS[1], 'A')).toBe('60 %');
    expect(lire(CAS[1], 'nonA')).toBe('40 %');
    expect(lire(CAS[2], 'A')).toBe('30 %');
    expect(lire(CAS[2], 'nonA')).toBe('30 %');
    expect(lire(CAS[3], 'A')).toBe('31 %');
    expect(lire(CAS[3], 'nonA')).toBe('30 %');
  });

  it('les dés : les effectifs annoncés correspondent aux 36 issues', () => {
    // A ∩ B pour la somme 7 : (2,5), (4,3), (6,1) — trois couples.
    const paires7 = [];
    const paires8 = [];
    for (let d1 = 1; d1 <= 6; d1 += 1) {
      for (let d2 = 1; d2 <= 6; d2 += 1) {
        if (d1 % 2 === 0 && d1 + d2 === 7) paires7.push([d1, d2]);
        if (d1 % 2 === 0 && d1 + d2 === 8) paires8.push([d1, d2]);
      }
    }
    expect(paires7.length).toBe(desTable().cells.pair.somme7);
    expect(paires8.length).toBe(des8Table().cells.pair.somme8);
    // Les marges aussi : 18 premiers dés pairs, 6 sommes égales à 7, 5 à 8.
    expect(desTable().rowTotals.pair).toBe(18);
    expect(desTable().colTotals.somme7).toBe(6);
    expect(des8Table().colTotals.somme8).toBe(5);
  });

  it('l’atelier : les taux de défaut coïncident, d’où l’indépendance', () => {
    const t = atelierTable();
    expect(conditional(t, { axis: 'row', key: 'm1' }, 'defectueuse')).toEqual({ n: 1, d: 20 });
    expect(conditional(t, { axis: 'row', key: 'm2' }, 'defectueuse')).toEqual({ n: 1, d: 20 });
    expect(t.colTotals.defectueuse).toBe(100);
  });
});

describe('boss — distracteurs calculés, distincts, et dans [0 ; 1]', () => {
  it('chaque épreuve numérique a quatre valeurs deux à deux distinctes', () => {
    for (const [id, e] of Object.entries(BOSS_NUMBERS)) {
      const toutes = [e.correct, ...e.traps];
      expect(toutes.length).toBe(4);
      for (const v of toutes) {
        expect(ratValue(v)).toBeGreaterThanOrEqual(0);
        expect(ratValue(v)).toBeLessThanOrEqual(1);
      }
      // Distincts en FRACTION…
      for (let i = 0; i < toutes.length; i += 1) {
        for (let j = i + 1; j < toutes.length; j += 1) {
          expect(ratEq(toutes[i], toutes[j])).toBe(false);
        }
      }
      // …ET après mise en forme : deux options affichées à l'identique
      // rendraient l'épreuve `${id}` insoluble.
      const affichees = toutes.map((v) => pct(v, e.dp));
      expect(new Set(affichees).size, `épreuve ${id}`).toBe(4);
    }
  });

  it('les bonnes réponses sont bien celles des situations de la leçon', () => {
    // e1 : P_reçu(prépa) sur le stage
    expect(ratEq(BOSS_NUMBERS.e1.correct,
      conditional(stageTable(), { axis: 'col', key: 'recu' }, 'prepa'))).toBe(true);
    // e1 piège 1 : l'autre sens, P_prépa(reçu)
    expect(ratEq(BOSS_NUMBERS.e1.traps[0],
      conditional(stageTable(), { axis: 'row', key: 'prepa' }, 'recu'))).toBe(true);
    // e2 : P_M1(défectueuse) sur l'atelier
    expect(ratEq(BOSS_NUMBERS.e2.correct,
      conditional(atelierTable(), { axis: 'row', key: 'm1' }, 'defectueuse'))).toBe(true);
    // e4 : P(A ∩ B) = P(A) × P(B) pour deux indépendants de 0,25 et 0,4
    expect(ratEq(BOSS_NUMBERS.e4.correct, ratMul(rat(1, 4), rat(2, 5)))).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e4.traps[0], ratAdd(rat(1, 4), rat(2, 5)))).toBe(true);
    // e8 : deux incompatibles — l'intersection est vide
    expect(BOSS_NUMBERS.e8.correct).toEqual({ n: 0, d: 1 });
    expect(ratEq(BOSS_NUMBERS.e8.traps[0], ratMul(rat(3, 10), rat(1, 5)))).toBe(true);
  });
});
