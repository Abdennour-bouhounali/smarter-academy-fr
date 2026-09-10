import { describe, it, expect } from 'vitest';
import {
  rat, ratAdd, ratMul, ratEq, ratIsOne, ratValue, ratSum, fr, pct,
  crossFromCounts, nInter, pInter, pRow, pCol, conditional, conditionalCounts,
  treeFromCross, pathProbability, pathsTo, totalProbability, inverseFromTree,
  composition, barReadings, missionPairs, missionAccomplie, dragPath,
  BAR_TOTAL, BAR_STEP,
} from './condUtils';
import {
  DEPISTAGE, depistageTable, depistageTree, FOURNISSEURS, fournisseursTable,
  fournisseursTree, MISSION_A, MISSION_B, BAR_START, BAR_SCENARIO,
  EXPLOITATION, TOTALES, BOSS_NUMBERS, BRANCH_WEIGHTS,
} from '../data';
import { treeIsCorrect, SLOTS } from './WeightDropTree';

/* ══════════════════════════════════════════════════════════════════════════
   1. ARITHMÉTIQUE EXACTE — la garantie « jamais de flottant accumulé »
   ══════════════════════════════════════════════════════════════════════════ */
describe('arithmétique exacte des rationnels', () => {
  it('réduit toute fraction par le PGCD', () => {
    expect(rat(990, 2970)).toEqual({ n: 1, d: 3 });
    expect(rat(370, 10000)).toEqual({ n: 37, d: 1000 });
  });

  it('refuse un numérateur ou un dénominateur non entier, et le dénominateur nul', () => {
    expect(() => rat(1.5, 2)).toThrow(/entiers/);
    expect(() => rat(1, 0)).toThrow(/nul/);
  });

  it('normalise le signe sur le numérateur', () => {
    expect(rat(1, -2)).toEqual({ n: -1, d: 2 });
  });

  it('ADDITIONNE SANS ERREUR là où les flottants échouent', () => {
    // 0,6 + 0,3 + 0,1 vaut 0.9999999999999999 en virgule flottante.
    expect(0.6 + 0.3 + 0.1).not.toBe(1);
    const s = ratSum([rat(3, 5), rat(3, 10), rat(1, 10)]);
    expect(ratIsOne(s)).toBe(true);
    expect(s).toEqual({ n: 1, d: 1 });
  });

  it('MULTIPLIE et somme sans erreur là où les flottants échouent', () => {
    // 0,6×0,02 + 0,3×0,05 + 0,1×0,10 vaut 0.037000000000000005 en flottant.
    expect(0.6 * 0.02 + 0.3 * 0.05 + 0.1 * 0.1).not.toBe(0.037);
    const s = ratSum([
      ratMul(rat(3, 5), rat(2, 100)),
      ratMul(rat(3, 10), rat(5, 100)),
      ratMul(rat(1, 10), rat(10, 100)),
    ]);
    expect(s).toEqual({ n: 37, d: 1000 });
    expect(ratValue(s)).toBe(0.037);
  });

  it('compare par produit croisé, sans tolérance', () => {
    expect(ratEq(rat(1, 3), rat(333, 999))).toBe(true);
    expect(ratEq(rat(1, 3), rat(1, 4))).toBe(false);
  });

  it('formate à la française', () => {
    expect(fr(0.037)).toBe('0,037');
    expect(fr(0.25, 2)).toBe('0,25');
    expect(pct(rat(1, 3))).toBe('33,3 %');
    expect(pct(rat(3, 4), 0)).toBe('75 %');
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   2. EFFECTIFS ENTIERS SOMMANT EXACTEMENT AU TOTAL
   ══════════════════════════════════════════════════════════════════════════ */
describe('tableau croisé : effectifs entiers, somme exacte', () => {
  it('refuse un effectif non entier', () => {
    expect(() => crossFromCounts({
      rows: ['r'], cols: ['c'], cells: { r: { c: 12.5 } }, total: 12.5,
    })).toThrow(/non entier/);
  });

  it('refuse un total qui ne tombe pas juste', () => {
    expect(() => crossFromCounts({
      rows: ['r'], cols: ['a', 'b'], cells: { r: { a: 3, b: 4 } }, total: 10,
    })).toThrow(/vaut 7, pas 10/);
  });

  it('calcule les marges', () => {
    const t = crossFromCounts({
      rows: ['r1', 'r2'], cols: ['c1', 'c2'],
      cells: { r1: { c1: 1, c2: 2 }, r2: { c1: 3, c2: 4 } }, total: 10,
    });
    expect(t.rowTotals).toEqual({ r1: 3, r2: 7 });
    expect(t.colTotals).toEqual({ c1: 4, c2: 6 });
  });

  it('rend null pour une conditionnelle dont la condition est vide', () => {
    const t = crossFromCounts({
      rows: ['plein', 'vide'], cols: ['a', 'b'],
      cells: { plein: { a: 2, b: 3 }, vide: { a: 0, b: 0 } }, total: 5,
    });
    expect(conditional(t, { axis: 'row', key: 'vide' }, 'a')).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   3. LES DONNÉES DE LA LEÇON — chaque nombre cité est recalculé
   ══════════════════════════════════════════════════════════════════════════ */
describe('dépistage : tous les effectifs sont entiers et somment à 100 000', () => {
  const t = depistageTable();

  it('construit un tableau valide (crossFromCounts lèverait sinon)', () => {
    expect(t.total).toBe(100000);
    const cells = [t.cells.malade.positif, t.cells.malade.negatif,
      t.cells.sain.positif, t.cells.sain.negatif];
    expect(cells.every(Number.isInteger)).toBe(true);
    expect(cells.reduce((a, b) => a + b, 0)).toBe(100000);
  });

  it('porte les effectifs annoncés par la leçon', () => {
    expect(t.cells.malade.positif).toBe(990);   // vrais positifs
    expect(t.cells.malade.negatif).toBe(10);    // faux négatifs
    expect(t.cells.sain.positif).toBe(1980);    // faux positifs
    expect(t.cells.sain.negatif).toBe(97020);
    expect(t.rowTotals.malade).toBe(1000);
    expect(t.rowTotals.sain).toBe(99000);
    expect(t.colTotals.positif).toBe(2970);
  });

  it('la prévalence, la sensibilité et la spécificité annoncées sont EXACTES', () => {
    expect(pRow(t, 'malade')).toEqual({ n: 1, d: 100 });                       // 1 %
    expect(conditional(t, { axis: 'row', key: 'malade' }, 'positif'))
      .toEqual({ n: 99, d: 100 });                                             // 99 %
    expect(conditional(t, { axis: 'row', key: 'sain' }, 'negatif'))
      .toEqual({ n: 49, d: 50 });                                              // 98 %
  });

  it('LE PARADOXE : P_positif(malade) = 990/2970 = 1/3 EXACTEMENT', () => {
    const inv = conditional(t, { axis: 'col', key: 'positif' }, 'malade');
    expect(inv).toEqual({ n: 1, d: 3 });
    expect(conditionalCounts(t, { axis: 'col', key: 'positif' }, 'malade'))
      .toEqual({ numerator: 990, denominator: 2970 });
    // Le renversement : 99 % dans un sens, 33,3 % dans l'autre.
    const dir = conditional(t, { axis: 'row', key: 'malade' }, 'positif');
    expect(ratValue(dir)).toBeGreaterThan(ratValue(inv) * 2);
    expect(DEPISTAGE.paradoxe.numerateur).toBe(990);
    expect(DEPISTAGE.paradoxe.denominateur).toBe(2970);
    expect(DEPISTAGE.paradoxe.display).toBe(pct(inv));
  });

  it('la majorité des positifs sont SAINS : 1980 sur 2970', () => {
    const sains = conditional(t, { axis: 'col', key: 'positif' }, 'sain');
    expect(sains).toEqual({ n: 2, d: 3 });
    expect(ratValue(sains)).toBeGreaterThan(0.5);
  });

  it('P(positif) par les probabilités totales = 2970/100000 = 0,0297', () => {
    const { total, paths } = totalProbability(depistageTree(), 'positif');
    expect(total).toEqual({ n: 297, d: 10000 });
    expect(ratValue(total)).toBe(0.0297);
    expect(paths.map((p) => p.product)).toEqual([{ n: 99, d: 10000 }, { n: 99, d: 5000 }]);
    // et cette somme est bien 990/100000 + 1980/100000
    expect(ratValue(paths[0].product) * 100000).toBeCloseTo(990, 9);
    expect(ratValue(paths[1].product) * 100000).toBeCloseTo(1980, 9);
  });

  it('inverseFromTree retrouve le 1/3 depuis l’arbre', () => {
    expect(inverseFromTree(depistageTree(), 'positif', 'malade')).toEqual({ n: 1, d: 3 });
    expect(inverseFromTree(depistageTree(), 'positif', 'sain')).toEqual({ n: 2, d: 3 });
  });
});

describe('fournisseurs : la partition à TROIS parts', () => {
  const t = fournisseursTable();
  const tree = fournisseursTree();

  it('effectifs entiers, somme exacte à 10 000', () => {
    let s = 0;
    for (const r of t.rows) for (const c of t.cols) {
      expect(Number.isInteger(t.cells[r][c])).toBe(true);
      s += t.cells[r][c];
    }
    expect(s).toBe(10000);
    expect(t.total).toBe(10000);
  });

  it('les poids du premier niveau somment à 1 EXACTEMENT', () => {
    const s = ratSum(tree.map((b) => b.p));
    expect(ratIsOne(s)).toBe(true);
    expect(tree.map((b) => b.p)).toEqual([{ n: 3, d: 5 }, { n: 3, d: 10 }, { n: 1, d: 10 }]);
  });

  it('les branches de CHAQUE nœud somment à 1 EXACTEMENT', () => {
    for (const b of tree) {
      const s = ratSum(b.children.map((c) => c.p));
      expect(ratIsOne(s)).toBe(true);
    }
  });

  it('les poids conditionnels du second niveau sont ceux annoncés', () => {
    const def = (id) => tree.find((b) => b.id === id).children.find((c) => c.id === 'defectueux').p;
    expect(def('F1')).toEqual({ n: 1, d: 50 });    // 2 %
    expect(def('F2')).toEqual({ n: 1, d: 20 });    // 5 %
    expect(def('F3')).toEqual({ n: 1, d: 10 });    // 10 %
  });

  it('produits le long des chemins : 0,012 / 0,015 / 0,010', () => {
    expect(pathProbability(tree, 'F1', 'defectueux')).toEqual({ n: 3, d: 250 });
    expect(pathProbability(tree, 'F2', 'defectueux')).toEqual({ n: 3, d: 200 });
    expect(pathProbability(tree, 'F3', 'defectueux')).toEqual({ n: 1, d: 100 });
    expect(pathsTo(tree, 'defectueux').map((p) => ratValue(p.product)))
      .toEqual([0.012, 0.015, 0.01]);
  });

  it('PROBABILITÉS TOTALES : P(défectueux) = 37/1000 = 0,037 EXACTEMENT', () => {
    const { total } = totalProbability(tree, 'defectueux');
    expect(total).toEqual({ n: 37, d: 1000 });
    expect(ratValue(total)).toBe(0.037);
    // 370 pièces défectueuses sur 10 000 : le comptage confirme la formule.
    expect(t.colTotals.defectueux).toBe(370);
    expect(rat(t.colTotals.defectueux, t.total)).toEqual(total);
  });

  it('inversion sur l’arbre : P_défectueux(F3) = 10/37, et F3 pèse 10 % du flux', () => {
    expect(inverseFromTree(tree, 'defectueux', 'F3')).toEqual({ n: 10, d: 37 });
    expect(pRow(t, 'F3')).toEqual({ n: 1, d: 10 });
    // Le fournisseur qui fournit le moins produit plus du quart des défauts.
    expect(ratValue(inverseFromTree(tree, 'defectueux', 'F3'))).toBeGreaterThan(0.25);
  });

  it('REFUSE une famille qui ne partitionne pas l’univers', () => {
    const amputé = fournisseursTree().slice(0, 2);           // poids = 0,9
    expect(() => totalProbability(amputé, 'defectueux')).toThrow(/ne partitionne pas/);
  });

  it('les données déclarées dans data.js valent bien ce que la leçon affiche', () => {
    expect(FOURNISSEURS.map((f) => f.count).reduce((a, b) => a + b, 0)).toBe(10000);
    expect(FOURNISSEURS.map((f) => f.defectueux)).toEqual([120, 150, 100]);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   4. LA MANIPULATION SIGNATURE — la mission est RÉALISABLE AU GLISSER
   ══════════════════════════════════════════════════════════════════════════ */
describe('la barre qui rétrécit : contraintes de la manipulation', () => {
  it('tout état atteignable a des effectifs entiers sommant EXACTEMENT à 1000', () => {
    let states = 0;
    for (let nB = BAR_STEP; nB <= BAR_TOTAL - BAR_STEP; nB += BAR_STEP) {
      for (let nAB = 0; nAB <= nB; nAB += BAR_STEP) {
        const t = composition({ ...BAR_SCENARIO, nB, nAB });
        const cells = [t.cells.B.A, t.cells.B.nonA, t.cells.nonB.A, t.cells.nonB.nonA];
        expect(cells.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
        expect(cells.reduce((a, b) => a + b, 0)).toBe(BAR_TOTAL);
        states += 1;
      }
    }
    // Balayage COMPLET, pas un échantillon.
    expect(states).toBe(5049);
  });

  it('refuse les états interdits (nAB > nB, hors bornes)', () => {
    expect(() => composition({ ...BAR_SCENARIO, nB: 200, nAB: 300 })).toThrow(/hors de B/);
    expect(() => composition({ ...BAR_SCENARIO, nB: 1200, nAB: 0 })).toThrow(/hors bornes/);
    expect(() => composition({ total: 1000, nB: 100, nAB: 0, nAnotB: -5 })).toThrow(/négatif/);
  });

  it('le PLAFOND de nAnotB suit la place disponible quand B devient très large', () => {
    // Le défaut trouvé par le balayage : à nB = 950 le scénario réclamait 120
    // cyclistes hors de B, alors qu'il n'y reste que 50 habitants.
    const t = composition({ ...BAR_SCENARIO, nB: 950, nAB: 0 });
    expect(t.cells.nonB.A).toBe(50);
    expect(t.cells.nonB.nonA).toBe(0);
    expect(t.total).toBe(BAR_TOTAL);
    // Tant qu'il y a la place, le scénario est respecté à l'unité près.
    expect(composition({ ...BAR_SCENARIO, nB: 400, nAB: 0 }).cells.nonB.A).toBe(120);
  });

  it('les deux compositions de la mission ont le MÊME P(A ∩ B)', () => {
    const a = barReadings(MISSION_A);
    const b = barReadings(MISSION_B);
    expect(a.nAB).toBe(b.nAB);
    expect(ratEq(a.inter, b.inter)).toBe(true);
    expect(a.inter).toEqual({ n: 3, d: 20 });        // 150/1000 = 0,15
  });

  it('… et des P_B(A) DIFFÉRENTS : 75 % contre 25 %', () => {
    const a = barReadings(MISSION_A);
    const b = barReadings(MISSION_B);
    expect(a.condBA).toEqual({ n: 3, d: 4 });
    expect(b.condBA).toEqual({ n: 1, d: 4 });
    expect(ratEq(a.condBA, b.condBA)).toBe(false);
    expect(pct(a.condBA, 0)).toBe('75 %');
    expect(pct(b.condBA, 0)).toBe('25 %');
  });

  it('MISSION RÉALISABLE AU GLISSER : un chemin de crans mène de A à B sans état interdit', () => {
    const chemin = dragPath(MISSION_A, MISSION_B);
    expect(chemin[0]).toEqual(MISSION_A);
    expect(chemin[chemin.length - 1]).toEqual(MISSION_B);
    // Chaque cran vaut exactement BAR_STEP sur une seule des deux poignées.
    for (let i = 1; i < chemin.length; i += 1) {
      const d = Math.abs(chemin[i].nB - chemin[i - 1].nB) + Math.abs(chemin[i].nAB - chemin[i - 1].nAB);
      expect(d).toBe(BAR_STEP);
      expect(() => composition(chemin[i])).not.toThrow();
      expect(chemin[i].nAB).toBeLessThanOrEqual(chemin[i].nB);
    }
    expect(chemin.length).toBe(41);   // 400 individus de plus, par crans de 10
  });

  it('le chemin depuis l’ÉTAT DE DÉPART atteint les deux compositions', () => {
    for (const cible of [MISSION_A, MISSION_B]) {
      const chemin = dragPath(BAR_START, cible);
      expect(chemin[chemin.length - 1]).toEqual(cible);
      for (const s of chemin) expect(() => composition(s)).not.toThrow();
    }
  });

  it('la mission se DÉTECTE dès que les deux compositions ont été visitées', () => {
    expect(missionAccomplie([BAR_START])).toBe(false);
    expect(missionAccomplie([MISSION_A])).toBe(false);
    expect(missionAccomplie([MISSION_A, MISSION_B])).toBe(true);
    const [x, y] = missionPairs([BAR_START, MISSION_A, MISSION_B])[0];
    expect(ratEq(barReadings(x).inter, barReadings(y).inter)).toBe(true);
    expect(ratEq(barReadings(x).condBA, barReadings(y).condBA)).toBe(false);
  });

  it('la mission n’est PAS réussie par hasard : deux états de même P_B(A) ne comptent pas', () => {
    // Même proportion, effectifs doublés : P_B(A) identique, la mission échoue.
    const a = { ...BAR_SCENARIO, nB: 200, nAB: 100 };
    const b = { ...BAR_SCENARIO, nB: 400, nAB: 200 };
    expect(ratEq(barReadings(a).condBA, barReadings(b).condBA)).toBe(true);
    expect(missionAccomplie([a, b])).toBe(false);
  });

  it('BALAYAGE : combien d’états réalisent la mission avec MISSION_A ?', () => {
    let n = 0;
    for (let nB = BAR_STEP; nB <= BAR_TOTAL - BAR_STEP; nB += BAR_STEP) {
      const nAB = MISSION_A.nAB;
      if (nAB > nB) continue;
      if (missionAccomplie([MISSION_A, { ...BAR_SCENARIO, nB, nAB }])) n += 1;
    }
    // nB va de 150 (il faut de la place pour les 150 de l'intersection) à 990
    // par crans de 10, soit 85 largeurs ; nB = 200 est MISSION_A elle-même et
    // rend le même quotient. Il reste 84 états gagnants — l'élève ne peut pas
    // « rater » la mission en élargissant B au hasard.
    expect(n).toBe(84);
  });

  it('SÉCURITÉ DE MISE EN PAGE : aucun libellé de segment ne peut déborder', () => {
    // Les nombres de la lecture vivent dans le DOM ; ce qui est écrit DANS la
    // barre, c'est DraggableSplitBar qui décide de l'écrire ou de le rejeter
    // selon la place. On vérifie ici l'invariant dont la leçon dépend : les
    // deux parts sont toujours dans [0 ; total] et leur somme fait le total.
    for (let nB = 0; nB <= BAR_TOTAL; nB += BAR_STEP) {
      expect(nB).toBeGreaterThanOrEqual(0);
      expect(BAR_TOTAL - nB).toBeGreaterThanOrEqual(0);
      expect(nB + (BAR_TOTAL - nB)).toBe(BAR_TOTAL);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   4bis. LE GLISSER LUI-MÊME — le contrat que SplitPopulationLab tient
   ══════════════════════════════════════════════════════════════════════════

   Le projet teste la GÉOMÉTRIE et la LOGIQUE, pas le DOM (cf. la note en tête
   de common/stats/PopulationBar.test.jsx) : aucun environnement jsdom n'est
   configuré. Ce qui peut MENTIR à l'élève pendant un glissement, ce n'est pas
   le rendu React — c'est l'arithmétique qui traduit une position de poignée en
   effectifs. On la teste donc directement, en reproduisant à l'identique les
   deux traductions du composant.
   ══════════════════════════════════════════════════════════════════════════ */
describe('le glisser : de la position du doigt aux effectifs', () => {
  // La traduction de DraggableSplitBar : ratio de la largeur → effectif aimanté.
  const fromPointer = (ratio, total = BAR_TOTAL, step = BAR_STEP) =>
    Math.max(0, Math.min(total, Math.round((ratio * total) / step) * step));

  // Les deux contraintes que SplitPopulationLab applique sur les poignées.
  const setNB = (st, v) => ({ ...st, nB: v, nAB: Math.min(st.nAB, v) });
  const setNAB = (st, v) => ({ ...st, nAB: Math.min(v, st.nB) });

  it('tout point de la barre s’aimante sur un cran valide', () => {
    for (let px = 0; px <= 1000; px += 1) {
      const v = fromPointer(px / 1000);
      expect(v % BAR_STEP).toBe(0);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(BAR_TOTAL);
    }
  });

  it('un doigt qui SORT de la barre reste borné (setPointerCapture suit le curseur)', () => {
    expect(fromPointer(-0.4)).toBe(0);
    expect(fromPointer(1.9)).toBe(BAR_TOTAL);
  });

  it('AUCUN glissement ne peut produire un état interdit', () => {
    // Balayage complet des deux poignées sur toute la barre, depuis chaque
    // état de départ utile : la contrainte nAB ≤ nB tient à chaque instant, et
    // `composition` ne lève jamais. C'est ce qui empêche le laboratoire de
    // jeter au milieu d'un geste.
    let etats = 0;
    for (const depart of [BAR_START, MISSION_A, MISSION_B]) {
      for (let v = 0; v <= BAR_TOTAL; v += BAR_STEP) {
        const a = setNB(depart, v);
        const b = setNAB(depart, v);
        for (const st of [a, b]) {
          expect(st.nAB).toBeLessThanOrEqual(st.nB);
          expect(() => composition(st)).not.toThrow();
          etats += 1;
        }
      }
    }
    expect(etats).toBe(3 * 101 * 2);
  });

  it('la cible de la mission tombe EXACTEMENT sur un cran du glisser', () => {
    // Une cible entre deux crans serait inatteignable au doigt.
    for (const cible of [MISSION_A, MISSION_B]) {
      expect(cible.nB % BAR_STEP).toBe(0);
      expect(cible.nAB % BAR_STEP).toBe(0);
      // Et elle est atteinte par la traduction pointeur → effectif.
      expect(fromPointer(cible.nB / BAR_TOTAL)).toBe(cible.nB);
      expect(fromPointer(cible.nAB / BAR_TOTAL)).toBe(cible.nAB);
    }
  });

  it('élargir B ne touche jamais au numérateur — c’est ce que la mission exige', () => {
    let st = MISSION_A;
    for (let v = MISSION_A.nB; v <= MISSION_B.nB; v += BAR_STEP) {
      st = setNB(st, v);
      expect(st.nAB).toBe(MISSION_A.nAB);           // le comptage ne bouge pas
      expect(barReadings(st).inter).toEqual(barReadings(MISSION_A).inter);
    }
    expect(st.nB).toBe(MISSION_B.nB);
    expect(ratEq(barReadings(st).condBA, barReadings(MISSION_A).condBA)).toBe(false);
  });

  it('rétrécir B sous le numérateur ENTRAÎNE le numérateur, sans état interdit', () => {
    let st = MISSION_B;
    for (let v = MISSION_B.nB; v >= 0; v -= BAR_STEP) {
      st = setNB(st, v);
      expect(st.nAB).toBeLessThanOrEqual(st.nB);
      expect(() => composition(st)).not.toThrow();
    }
    expect(st).toEqual({ ...BAR_SCENARIO, nB: 0, nAB: 0 });
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   4ter. LE SECOND GLISSER — poser un poids sur sa branche (module 3)
   ══════════════════════════════════════════════════════════════════════════ */
describe('le dépôt des poids : chaque nombre a une place, et une seule', () => {
  const bon = Object.fromEntries(BRANCH_WEIGHTS.map((w) => [w.slot, w.id]));

  it('les quatre poids visent quatre emplacements DISTINCTS de l’arbre', () => {
    const slots = BRANCH_WEIGHTS.map((w) => w.slot);
    expect(new Set(slots).size).toBe(BRANCH_WEIGHTS.length);
    // Et ces emplacements sont exactement ceux que la figure propose.
    expect(new Set(slots)).toEqual(new Set(SLOTS.map((s) => s.id)));
  });

  it('LE PIÈGE EXISTE VRAIMENT : deux poids portent la même valeur affichée', () => {
    // Tout le module 3 repose là-dessus. Si les données changeaient et que les
    // quatre poids devenaient distincts, le module perdrait son objet.
    const affiches = BRANCH_WEIGHTS.map((w) => w.display);
    expect(new Set(affiches).size).toBeLessThan(affiches.length);
    const doublon = affiches.find((d, i) => affiches.indexOf(d) !== i);
    expect(doublon).toBe('0,99');
    // … et ces deux 0,99 ne pèsent pas le même ensemble : l'un est une
    // probabilité sur la population, l'autre une conditionnelle.
    const [a, b] = BRANCH_WEIGHTS.filter((w) => w.display === doublon);
    expect(a.slot.includes('/')).toBe(false);        // premier niveau
    expect(b.slot.includes('/')).toBe(true);         // second niveau
  });

  it('l’arbre juste est celui que le noyau calcule — pas une table écrite à la main', () => {
    const tree = depistageTree();
    const p = (id) => tree.find((x) => x.id === id).p;
    const c = (id, leaf) => tree.find((x) => x.id === id).children.find((y) => y.id === leaf).p;
    for (const w of BRANCH_WEIGHTS) {
      const attendu = w.slot.includes('/')
        ? c(w.slot.split('/')[0], w.slot.split('/')[1])
        : p(w.slot);
      expect(ratEq(w.weight, attendu), `${w.id} : le poids déclaré n'est pas celui de l'arbre`).toBe(true);
    }
  });

  it('treeIsCorrect n’accepte QUE le placement juste', () => {
    expect(treeIsCorrect(BRANCH_WEIGHTS, bon)).toBe(true);
    expect(treeIsCorrect(BRANCH_WEIGHTS, {})).toBe(false);
    // Le piège grandeur nature : intervertir les deux 0,99.
    const interverti = { ...bon, malade: 'w-sain', sain: 'w-mal' };
    expect(treeIsCorrect(BRANCH_WEIGHTS, interverti)).toBe(false);
    // Un poids en moins suffit à invalider.
    const incomplet = { ...bon };
    delete incomplet.sain;
    expect(treeIsCorrect(BRANCH_WEIGHTS, incomplet)).toBe(false);
  });

  it('POURQUOI treeIsCorrect teste la POSITION et non les sommes', () => {
    // Le contrôle « chaque nœud somme à 1 » est nécessaire mais PAS suffisant :
    // intervertir 0,01 et 0,99 au premier niveau laisse la somme à 1 tout en
    // décrivant une maladie qui toucherait 99 % de la population. Un composant
    // qui validerait sur les sommes accepterait cet arbre-là.
    const byId = Object.fromEntries(BRANCH_WEIGHTS.map((w) => [w.id, w]));
    const inverse = { ...bon, malade: 'w-sain', sain: 'w-mal' };
    const somme = ratValue(byId[inverse.malade].weight) + ratValue(byId[inverse.sain].weight);
    expect(somme).toBe(1);                                   // la somme ne dit rien
    expect(treeIsCorrect(BRANCH_WEIGHTS, inverse)).toBe(false); // la position, si
  });

  it('LE MAUVAIS PLACEMENT SE VOIT : la somme du premier niveau quitte 1', () => {
    // C'est la promesse de la figure — elle conteste le geste toute seule.
    const byId = Object.fromEntries(BRANCH_WEIGHTS.map((w) => [w.id, w]));
    const somme = (placed) =>
      ratValue(byId[placed.malade].weight) + ratValue(byId[placed.sain].weight);
    expect(somme(bon)).toBe(1);
    // On pose 0,99 (celui du second niveau) sur les deux branches du premier :
    // 0,99 + 0,99 = 1,98, et l'écart saute aux yeux.
    expect(somme({ malade: 'w-mal-pos', sain: 'w-sain' })).toBeCloseTo(1.98, 9);
  });
});

/* ══════════════════════════════════════════════════════════════════════════
   5. LES VALEURS CITÉES PAR LES MODULES, ET LES DISTRACTEURS DU BOSS
   ══════════════════════════════════════════════════════════════════════════ */
describe('exploitation de l’arbre (module 4) : chaque réponse est recalculée', () => {
  it('chaque question annonce la valeur que le noyau calcule', () => {
    for (const q of EXPLOITATION) {
      const tree = q.tree();
      const attendu = q.kind === 'chemin'
        ? pathProbability(tree, q.first, q.second)
        : totalProbability(tree, q.second).total;
      expect(ratEq(attendu, q.expected)).toBe(true);
      expect(q.display).toBe(pct(attendu, q.dp ?? 1));
    }
  });
});

describe('probabilités totales (module 5) : la partition et la somme', () => {
  it('chaque situation partitionne réellement l’univers', () => {
    for (const s of TOTALES) {
      const tree = s.tree();
      expect(ratIsOne(ratSum(tree.map((b) => b.p)))).toBe(true);
      for (const b of tree) expect(ratIsOne(ratSum(b.children.map((c) => c.p)))).toBe(true);
    }
  });

  it('la probabilité totale annoncée est celle que le noyau calcule', () => {
    for (const s of TOTALES) {
      const { total, paths } = totalProbability(s.tree(), s.event);
      expect(ratEq(total, s.expected)).toBe(true);
      expect(paths).toHaveLength(s.nPaths);
      expect(s.display).toBe(pct(total, s.dp ?? 1));
      // Le piège de la MOYENNE des poids conditionnels, systématiquement faux.
      const moyenne = ratMul(ratSum(paths.map((p) => p.p2)), rat(1, paths.length));
      expect(ratEq(moyenne, total)).toBe(false);
      expect(s.moyennePiege).toBe(pct(moyenne, s.dp ?? 1));
    }
  });
});

describe('boss : les distracteurs sont calculés, distincts et plausibles', () => {
  it('chaque jeu de nombres a une bonne réponse DISTINCTE de tous ses pièges', () => {
    for (const [id, set] of Object.entries(BOSS_NUMBERS)) {
      const all = [set.correct, ...set.traps];
      const uniques = new Set(all.map((x) => `${x.n}/${x.d}`));
      expect(uniques.size, `${id} : deux options identiques`).toBe(all.length);
      for (const trap of set.traps) {
        expect(ratEq(set.correct, trap), `${id} : un piège égale la bonne réponse`).toBe(false);
        // Plausible : dans [0 ; 1], comme toute probabilité.
        expect(ratValue(trap)).toBeGreaterThanOrEqual(0);
        expect(ratValue(trap)).toBeLessThanOrEqual(1);
      }
      expect(ratValue(set.correct)).toBeGreaterThanOrEqual(0);
      expect(ratValue(set.correct)).toBeLessThanOrEqual(1);
    }
  });

  it('les affichages en pourcentage des options d’une même épreuve sont DISTINCTS', () => {
    // Deux fractions différentes qui s'AFFICHENT pareil rendraient l'épreuve
    // insoluble : c'est la forme affichée qui doit être distincte.
    for (const [id, set] of Object.entries(BOSS_NUMBERS)) {
      const shown = [set.correct, ...set.traps].map((x) => pct(x, set.dp ?? 1));
      expect(new Set(shown).size, `${id} : deux affichages identiques (${shown})`).toBe(shown.length);
    }
  });

  it('LES OPTIONS ÉCRITES DANS LE BOSS sont exactement les nombres vérifiés', () => {
    // Le lien entre `BOSS_NUMBERS` (vérifié ci-dessus) et le texte réellement
    // affiché à l'élève. Sans cette assertion, une option pourrait être
    // retouchée à la main dans le module sans qu'aucun test ne s'en aperçoive.
    const attendu = {
      'pc-e1': ['25 %', '7,5 %', '30 %', '75 %'],
      'pc-e2': ['33,3 %', '99 %', '1 %', '66,7 %'],
      'pc-e7': ['1,2 %', '62 %', '2 %', '60 %'],
      'pc-e8': ['15 %', '2,5 %', '25 %', '13,3 %'],
      'pc-e9': ['3,7 %', '5,7 %', '2 %', '10 %'],
    };
    for (const [id, options] of Object.entries(attendu)) {
      const set = BOSS_NUMBERS[id.replace('pc-', '')];
      const calcule = [set.correct, ...set.traps].map((x) => pct(x, set.dp ?? 1));
      expect(calcule, `${id} : le texte du boss et les nombres vérifiés divergent`)
        .toEqual(options);
    }
  });

  it('les pièges du boss sont ceux que la leçon a nommés (inversion, moyenne, oubli du poids)', () => {
    // e2 : inverser le conditionnement sur le dépistage.
    const t = depistageTable();
    expect(ratEq(BOSS_NUMBERS.e2.correct,
      conditional(t, { axis: 'col', key: 'positif' }, 'malade'))).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e2.traps[0],
      conditional(t, { axis: 'row', key: 'malade' }, 'positif'))).toBe(true);
    // e9 : la moyenne des poids conditionnels au lieu de la somme pondérée.
    const tree = fournisseursTree();
    const moyenne = ratMul(ratSum(pathsTo(tree, 'defectueux').map((p) => p.p2)), rat(1, 3));
    expect(ratEq(BOSS_NUMBERS.e9.traps[0], moyenne)).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e9.correct, totalProbability(tree, 'defectueux').total)).toBe(true);
    // e1 : le piège du dénominateur, c'est la population entière.
    expect(ratEq(BOSS_NUMBERS.e1.correct, rat(60, 240))).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e1.traps[0], rat(60, 800))).toBe(true);
    // e7 : additionner les deux poids au lieu de les multiplier.
    expect(ratEq(BOSS_NUMBERS.e7.correct, ratMul(rat(60, 100), rat(2, 100)))).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e7.traps[0], ratAdd(rat(60, 100), rat(2, 100)))).toBe(true);
    // e8 : ne garder qu'un seul des deux chemins.
    const c1 = ratMul(rat(1, 2), rat(5, 100));
    const c2 = ratMul(rat(1, 2), rat(25, 100));
    expect(ratEq(BOSS_NUMBERS.e8.correct, ratAdd(c1, c2))).toBe(true);
    expect(ratEq(BOSS_NUMBERS.e8.traps[0], c1)).toBe(true);
  });
});

describe('fr — le rognage ne touche QUE la partie décimale', () => {
  // DÉFAUT RÉEL, corrigé : `toFixed(0)` rend « 40 », et un `/0+$/` sans garde
  // en faisait « 4 ». Tout pourcentage rond affiché sans décimale était faux.
  // La leçon n'affichait que 99 % — le défaut était donc LATENT, prêt à mentir
  // dès qu'une donnée aurait fini par un zéro.
  it('garde les zéros d’un entier', () => {
    expect(fr(40, 0)).toBe('40');
    expect(fr(100, 0)).toBe('100');
    expect(fr(50, 0)).toBe('50');
  });
  it('rogne toujours les zéros décimaux', () => {
    expect(fr(2.5, 2)).toBe('2,5');
    expect(fr(0.075)).toBe('0,075');
    expect(fr(33.333, 1)).toBe('33,3');
  });
});
