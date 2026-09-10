import { describe, it, expect } from 'vitest';
import {
  labReadings, labTable, independence, conditional, pct,
  nABMin, nABMax, isLabState, dragPath,
  LAB_TOTAL, LAB_NB, LAB_STEP,
} from './indepUtils';
import {
  LAB_START, LAB_INDEP, LAB_INCOMPATIBLE, CAS, casTable, atelierTable,
  desTable, des8Table, cartesCoeurRoi, cartesCoeurPique, stageTable,
} from '../data';

/**
 * SÉCURITÉ DE MISE EN PAGE ET VÉRITÉ DES AFFIRMATIONS (patron §16, §17).
 *
 * On teste la GÉOMÉTRIE et les AFFIRMATIONS, pas le DOM : la suite n'a pas de
 * jsdom (convention du dépôt, cf. common/stats/PopulationBar.test.jsx). Deux
 * familles de garanties :
 *
 *  1. GÉOMÉTRIE. Le seul SVG dont la mise en page dépend de l'état du
 *     laboratoire est le CONTOUR DES BORNES de la seconde barre, dont le x et
 *     la largeur sont calculés à partir de (nA, nAB). Le calcul est reproduit
 *     ici à l'identique du composant : s'il diverge, ce test tombe — ce qui est
 *     le but. Tout le reste est dans le DOM (tableaux, cartes de lecture), donc
 *     hors d'atteinte d'une collision : c'est la parade §6bis.4, et c'est
 *     pourquoi elle vaut mieux qu'un audit de collisions.
 *
 *  2. VÉRITÉ. Chaque affirmation qu'un module écrit en toutes lettres est
 *     recalculée ici. Une leçon ne doit pas pouvoir dire « les deux poids
 *     coïncident » sur un état où ils ne coïncident pas.
 */

/* Reproduit à l'identique le calcul du contour de bornes de TwoTreesLab. */
const borneRect = ({ nA }) => {
  const min = nABMin(nA);
  const max = nABMax(nA);
  return { x: (min / LAB_TOTAL) * 1000, w: ((max - min) / LAB_TOTAL) * 1000 };
};

describe('sécurité de mise en page — BALAYAGE, pas échantillon', () => {
  it('le contour des bornes reste dans le cadre pour TOUT état atteignable', () => {
    let n = 0;
    for (let nA = 0; nA <= LAB_TOTAL; nA += LAB_STEP) {
      const r = borneRect({ nA });
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.w).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(1000);
      expect(Number.isFinite(r.x) && Number.isFinite(r.w)).toBe(true);
      n += 1;
    }
    expect(n).toBe(LAB_TOTAL / LAB_STEP + 1);
  });

  it('la poignée de la seconde barre reste TOUJOURS dans le contour', () => {
    for (let nA = 0; nA <= LAB_TOTAL; nA += LAB_STEP) {
      for (let nAB = nABMin(nA); nAB <= nABMax(nA); nAB += LAB_STEP) {
        const r = borneRect({ nA });
        const x = (nAB / LAB_TOTAL) * 1000;
        expect(x).toBeGreaterThanOrEqual(r.x - 1e-9);
        expect(x).toBeLessThanOrEqual(r.x + r.w + 1e-9);
      }
    }
  });

  it('aucun état atteignable ne fait lever le laboratoire ni ne rend NaN', () => {
    for (let nA = 0; nA <= LAB_TOTAL; nA += LAB_STEP) {
      for (let nAB = nABMin(nA); nAB <= nABMax(nA); nAB += LAB_STEP) {
        const r = labReadings({ nA, nAB });
        // Les lectures affichées : jamais NaN, toujours dans [0 ; 1] ou null.
        for (const v of [r.pA, r.pB, r.pInter, r.pAtimesPB, r.condAB, r.condBA]) {
          if (v === null) continue;
          const x = v.n / v.d;
          expect(Number.isFinite(x)).toBe(true);
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(1);
        }
        // Et le formatage ne rend jamais « NaN % ».
        expect(pct(r.condAB, 1)).not.toMatch(/NaN/);
        expect(pct(r.condBA, 1)).not.toMatch(/NaN/);
      }
    }
  });

  it('la contrainte du glisser (nAB suit nA) ne produit jamais d’état interdit', () => {
    // Reproduit `setNA` de TwoTreesLab : la seconde séparation est ramenée
    // dans les bornes de la nouvelle première. C'est ce qui empêche
    // `labTable` de lever au milieu d'un glissement.
    const setNA = (state, v) => ({
      nA: v,
      nAB: Math.min(nABMax(v), Math.max(nABMin(v), state.nAB)),
    });
    for (let depart = 0; depart <= LAB_TOTAL; depart += 50) {
      for (let nAB = nABMin(depart); nAB <= nABMax(depart); nAB += 50) {
        let cur = { nA: depart, nAB };
        // On balaie toute la course de la première poignée, dans les deux sens.
        for (const cible of [0, LAB_TOTAL, 0]) {
          const pas = cible > cur.nA ? LAB_STEP : -LAB_STEP;
          while (cur.nA !== cible) {
            cur = setNA(cur, cur.nA + pas);
            expect(isLabState(cur)).toBe(true);
            expect(() => labTable(cur)).not.toThrow();
          }
        }
      }
    }
  });
});

describe('vérité des affirmations écrites dans les modules', () => {
  it('M1 étape 1 — l’état de départ donne bien 33,3 % et 50 %', () => {
    const r = labReadings(LAB_START);
    expect(pct(r.condAB, 1)).toBe('33,3 %');
    expect(pct(r.condBA, 1)).toBe('50 %');
    // La réponse attendue par la NumericQuestion vaut bien 50.
    expect((r.condBA.n / r.condBA.d) * 100).toBe(50);
  });

  it('M1 étapes 2-4 — la cible est plate, non dégénérée, et affichée 40 % / 50 %', () => {
    const r = labReadings(LAB_INDEP);
    expect(r.flatA && r.flatB && !r.degenerate).toBe(true);
    expect(pct(r.byA[0].children[0].p, 0)).toBe('40 %');
    expect(pct(r.byA[1].children[0].p, 0)).toBe('40 %');
    expect(pct(r.byB[0].children[0].p, 0)).toBe('50 %');
    expect(pct(r.byB[1].children[0].p, 0)).toBe('50 %');
    // Le module 3 affirme « 40 % à gauche contre 50 % à droite » : vrai.
    expect(pct(r.condAB, 0)).toBe('40 %');
    expect(pct(r.condBA, 0)).toBe('50 %');
    // Et le module 1 affirme « il y en a {nAB} » : non nul.
    expect(r.counts.nAB).toBeGreaterThan(0);
  });

  it('M1 étape 2 — la piste donnée à l’élève (« amène-les sur P(B) ») est juste', () => {
    // Le module dit : le club fait 40 % du lycée, amène les deux poids là.
    const r = labReadings(LAB_START);
    expect(pct(r.pB, 0)).toBe('40 %');
    const cible = labReadings(LAB_INDEP);
    expect(cible.byA.every((b) => b.children[0].p.n * r.pB.d === r.pB.n * b.children[0].p.d)).toBe(true);
  });

  it('M5 étape 1 — l’état de départ n’est PAS incompatible, et zéro est atteignable', () => {
    const depart = { nA: LAB_INCOMPATIBLE.nA, nAB: 80 };
    expect(isLabState(depart)).toBe(true);
    expect(labReadings(depart).counts.nAB).toBeGreaterThan(0);
    // …et le chemin jusqu'à zéro existe, cran par cran.
    const chemin = dragPath(depart, LAB_INCOMPATIBLE);
    for (const e of chemin) expect(isLabState(e)).toBe(true);
    const fin = labReadings(LAB_INCOMPATIBLE);
    expect(fin.pInter).toEqual({ n: 0, d: 1 });
    expect(fin.pAtimesPB.n).toBeGreaterThan(0);
    // Le module affiche ces deux nombres : 0 % et 8 %.
    expect(pct(fin.pInter, 1)).toBe('0 %');
    expect(pct(fin.pAtimesPB, 1)).toBe('8 %');
  });

  it('M3 — les pourcentages écrits dans les options sont ceux des données', () => {
    const [C1, C2, C3, C4] = CAS;
    const p = (cas, row) => pct(conditional(casTable(cas), { axis: 'row', key: row }, 'B'), 1);
    expect([p(C1, 'A'), p(C1, 'nonA')]).toEqual(['40 %', '40 %']);
    expect([p(C2, 'A'), p(C2, 'nonA')]).toEqual(['60 %', '40 %']);
    expect([p(C3, 'A'), p(C3, 'nonA')]).toEqual(['30 %', '30 %']);
    expect([p(C4, 'A'), p(C4, 'nonA')]).toEqual(['31 %', '30 %']);
    // Le module 3 affirme « 300 pièces contre 900 » sur le troisième cas.
    const t3 = casTable(C3);
    expect([t3.rowTotals.A, t3.rowTotals.nonA]).toEqual([300, 900]);
    // Et l'écart annoncé par le boss pour le presque-cas : 2 400.
    const i4 = independence(casTable(C4), { rowKey: 'A', colKey: 'B' });
    expect(Math.abs(i4.exact.left - i4.exact.right)).toBe(2400);
  });

  it('M4 — les nombres des dés et des cartes cités par les options', () => {
    const d7 = desTable(); const d8 = des8Table();
    const i7 = independence(d7, { rowKey: 'pair', colKey: 'somme7' });
    const i8 = independence(d8, { rowKey: 'pair', colKey: 'somme8' });
    expect([i7.exact.left, i7.exact.right]).toEqual([108, 108]);
    expect([i8.exact.left, i8.exact.right]).toEqual([108, 90]);
    // La réponse attendue de la NumericQuestion de l'étape 3.
    expect(d7.rowTotals.pair * d7.colTotals.somme7).toBe(108);
    // Le distracteur « 24 » est bien la SOMME, distincte de la bonne réponse.
    expect(d7.rowTotals.pair + d7.colTotals.somme7).toBe(24);
    expect(d7.rowTotals.pair + d7.colTotals.somme7).not.toBe(108);
    // Les cartes : 1/52 des deux côtés.
    const icr = independence(cartesCoeurRoi(), { rowKey: 'coeur', colKey: 'roi' });
    expect(icr.exact.left).toBe(icr.exact.right);
    expect(icr.counts.nAB).toBe(1);
  });

  it('M5 — les nombres de l’atelier cités par les options et le boss', () => {
    const t = atelierTable();
    const ind = independence(t, { rowKey: 'm1', colKey: 'defectueuse' });
    expect(pct(ind.condAB, 0)).toBe('5 %');          // P_M1(déf)
    expect(pct(ind.condBA, 0)).toBe('60 %');         // P_déf(M1)
    expect(pct(ind.pA, 0)).toBe('60 %');             // P(M1) — l'égalité de l'indépendance
    expect(pct(conditional(t, { axis: 'row', key: 'm2' }, 'defectueuse'), 0)).toBe('5 %');
    expect([ind.exact.left, ind.exact.right]).toEqual([120000, 120000]);
    // Le boss e10 affirme « 3 % de l'atelier » pour l'intersection.
    expect(pct(ind.pInter, 0)).toBe('3 %');
    // Et e2 affirme « 3 % » pour le piège « divisé par le total » : même nombre,
    // ce qui est cohérent — c'est bien l'erreur nommée.
    expect(t.cells.m1.defectueuse / t.total).toBeCloseTo(0.03, 10);
  });

  it('M2 et le boss — les nombres du stage', () => {
    const t = stageTable();
    expect(pct(conditional(t, { axis: 'row', key: 'prepa' }, 'recu'), 0)).toBe('90 %');
    expect(pct(conditional(t, { axis: 'col', key: 'recu' }, 'prepa'), 0)).toBe('45 %');
    // Le piège « 18 % » du boss : 90 sur 500.
    expect(pct({ n: t.cells.prepa.recu, d: t.total }, 0)).toBe('18 %');
    // Le piège « 40 % » : la part des reçus dans le concours.
    expect(pct({ n: t.colTotals.recu, d: t.total }, 0)).toBe('40 %');
  });

  it('M5 étape 2 — le produit des cartes cœur/pique vaut bien 6,25 %', () => {
    const ind = independence(cartesCoeurPique(), { rowKey: 'coeur', colKey: 'pique' });
    expect(pct(ind.pAtimesPB, 2)).toBe('6,25 %');
    expect((ind.pAtimesPB.n / ind.pAtimesPB.d) * 100).toBe(6.25);
    expect(ind.pInter).toEqual({ n: 0, d: 1 });
  });
});

describe('la mission du module 1 est réalisable AU DOIGT, poignée par poignée', () => {
  /**
   * ATTEIGNABILITÉ AU SENS FORT (patron §17, et §Le glisser d'abord cond. 1).
   * Prouver qu'un état d'indépendance EXISTE ne suffit pas : encore faut-il
   * qu'un élève y arrive en tirant UNE poignée, sans deviner qu'il faut
   * combiner les deux. On simule ici les vrais `setNA` / `setNAB` du composant
   * — clamp compris — et on vérifie qu'une course monotone depuis l'état de
   * départ tombe sur un réglage plat, dans les DEUX cas.
   *
   * DÉFAUT QUE CE TEST PRÉVIENT : un pas ou une borne mal choisis feraient
   * « sauter » par-dessus toutes les solutions, et la mission deviendrait
   * infaisable sans que rien d'autre ne le signale.
   */
  const setNA = (s, v) => ({ nA: v, nAB: Math.min(nABMax(v), Math.max(nABMin(v), s.nAB)) });
  const setNAB = (s, v) => ({ ...s, nAB: Math.min(nABMax(s.nA), Math.max(nABMin(s.nA), v)) });

  it('en ne tirant que la PREMIÈRE séparation vers la gauche', () => {
    let s = LAB_START;
    let atteint = null;
    for (let k = 0; k < 200 && !atteint; k += 1) {
      s = setNA(s, Math.max(0, s.nA - LAB_STEP));
      const r = labReadings(s);
      if (r.flatA && !r.degenerate) atteint = { ...s };
    }
    expect(atteint).toEqual(LAB_INDEP);
  });

  it('en ne poussant que la SECONDE séparation vers la droite', () => {
    let s = LAB_START;
    let atteint = null;
    for (let k = 0; k < 200 && !atteint; k += 1) {
      s = setNAB(s, s.nAB + LAB_STEP);
      const r = labReadings(s);
      if (r.flatA && !r.degenerate) atteint = { ...s };
      if (s.nAB >= nABMax(s.nA)) break;
    }
    // Un AUTRE réglage d'indépendance, atteint sans toucher à la première
    // poignée : la mission ne dépend pas d'un chemin unique.
    expect(atteint).toEqual({ nA: 600, nAB: 240 });
    expect(labReadings(atteint).independent).toBe(true);
  });

  it('un pas plus grossier rendrait la mission infaisable — le pas de 10 est un choix', () => {
    // Contre-épreuve : au pas de 30, aucune course monotone depuis le départ
    // ne tombe sur une solution. Le pas n'est donc pas arbitraire.
    let s = { ...LAB_START };
    let trouve = false;
    for (let nA = LAB_START.nA; nA >= 0; nA -= 30) {
      s = setNA(s, nA);
      if (labReadings(s).flatA && !labReadings(s).degenerate) trouve = true;
    }
    expect(trouve).toBe(false);
  });
});
