import { describe, it, expect } from 'vitest';
import { crossTable, sum } from '../../../../common/stats';
import { ELEVES, CLASSES, ACTIVITES, NIVEAUX } from './data';

/**
 * Les effectifs du tableau croisé sont cités dans les énoncés et les
 * corrections : ils sont vérifiés ici plutôt qu'écrits de mémoire.
 */
const T = crossTable(ELEVES, 'activite', 'classe', ACTIVITES, CLASSES);

describe('les 60 fiches', () => {
  it('soixante élèves, tous renseignés', () => {
    expect(ELEVES).toHaveLength(60);
    for (const e of ELEVES) {
      expect(CLASSES).toContain(e.classe);
      expect(ACTIVITES).toContain(e.activite);
      expect(NIVEAUX).toContain(e.niveau);
    }
  });

  it('les prénoms sont uniques (une fiche = un individu)', () => {
    expect(new Set(ELEVES.map((e) => e.prenom)).size).toBe(60);
  });

  it('les douze cases sont toutes occupées — aucun trou dans le tableau', () => {
    for (const a of ACTIVITES) for (const c of CLASSES) expect(T.cells[a][c]).toBeGreaterThan(0);
  });
});

describe('cohérence du tableau croisé', () => {
  it('chaque individu est dans une case et une seule : la somme des cases vaut 60', () => {
    const total = sum(ACTIVITES.flatMap((a) => CLASSES.map((c) => T.cells[a][c])));
    expect(total).toBe(60);
    expect(T.grandTotal).toBe(60);
  });

  it('la somme des marges de lignes égale celle des marges de colonnes', () => {
    expect(sum(Object.values(T.rowTotals))).toBe(60);
    expect(sum(Object.values(T.colTotals))).toBe(60);
  });

  it('chaque marge est bien la somme de sa ligne / de sa colonne', () => {
    for (const a of ACTIVITES) expect(T.rowTotals[a]).toBe(sum(CLASSES.map((c) => T.cells[a][c])));
    for (const c of CLASSES) expect(T.colTotals[c]).toBe(sum(ACTIVITES.map((a) => T.cells[a][c])));
  });
});

describe('filtres logiques (module 4)', () => {
  const count = (fn) => ELEVES.filter(fn).length;

  it('ET est l’intersection : c’est exactement une case du tableau', () => {
    expect(count((e) => e.classe === '2de A' && e.activite === 'judo')).toBe(T.cells.judo['2de A']);
  });

  it('OU est INCLUSIF : on ne compte pas deux fois ceux qui vérifient les deux', () => {
    const a = count((e) => e.classe === '2de A');
    const j = count((e) => e.activite === 'judo');
    const both = count((e) => e.classe === '2de A' && e.activite === 'judo');
    const either = count((e) => e.classe === '2de A' || e.activite === 'judo');
    expect(either).toBe(a + j - both);
    expect(either).toBeLessThan(a + j);        // la double addition serait fausse
  });

  it('NON est le complémentaire : effectif total moins celui du filtre', () => {
    expect(count((e) => e.classe !== '2de B')).toBe(60 - T.colTotals['2de B']);
  });
});
