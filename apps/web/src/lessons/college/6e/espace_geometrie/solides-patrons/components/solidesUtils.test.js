import { describe, it, expect } from 'vitest';
import {
  SOLIDES, SOLIDES_LIST, isPolyhedron, eulerCheck,
  gridFromArt, filledCells, foldsIntoCube, patronHint,
  PATRON_CROIX, PATRON_ESCALIER, PATRON_IMPOSSIBLE, PATRON_BANDE,
} from './solidesUtils';

describe('les solides et leurs comptes', () => {
  it('chaque solide déclare faces, arêtes et sommets', () => {
    for (const s of SOLIDES_LIST) {
      expect(s.nom).toBeTruthy();
      expect(typeof s.faces).toBe('number');
      expect(typeof s.aretes).toBe('number');
      expect(typeof s.sommets).toBe('number');
    }
  });

  it('la relation d’Euler (F + S − A = 2) vaut pour tous les POLYÈDRES', () => {
    for (const s of SOLIDES_LIST.filter(isPolyhedron)) {
      expect(eulerCheck(s)).toBe(2);
    }
  });

  it('le cylindre n’est pas un polyèdre — la relation ne s’y applique pas', () => {
    expect(isPolyhedron(SOLIDES.cylindre)).toBe(false);
    expect(eulerCheck(SOLIDES.cylindre)).toBeNull();
  });

  it('cube et pavé partagent les mêmes comptes, mais pas les mêmes faces', () => {
    expect(SOLIDES.cube.faces).toBe(SOLIDES.pave.faces);
    expect(SOLIDES.cube.aretes).toBe(SOLIDES.pave.aretes);
    expect(SOLIDES.cube.sommets).toBe(SOLIDES.pave.sommets);
    expect(SOLIDES.cube.natureFaces).not.toBe(SOLIDES.pave.natureFaces);
  });

  it('le prisme triangulaire a bien 5 faces, 9 arêtes, 6 sommets', () => {
    expect(SOLIDES.prisme).toMatchObject({ faces: 5, aretes: 9, sommets: 6 });
  });
});

describe('pliage d’un patron de cube — SIMULÉ, jamais mémorisé', () => {
  it('accepte le patron en croix', () => {
    const r = foldsIntoCube(PATRON_CROIX);
    expect(r.ok).toBe(true);
    expect(patronHint(r)).toMatch(/se replie bien/);
  });

  it('accepte un patron en escalier (moins attendu, mais valide)', () => {
    expect(foldsIntoCube(PATRON_ESCALIER).ok).toBe(true);
  });

  it('refuse le bloc 2×3 : deux faces se superposeraient', () => {
    const r = foldsIntoCube(PATRON_IMPOSSIBLE);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('superposition');
    expect(patronHint(r)).toMatch(/même face/);
  });

  it('refuse la bande de 6 cases alignées', () => {
    const r = foldsIntoCube(PATRON_BANDE);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('superposition');
  });

  it('refuse un patron trop petit ou trop grand', () => {
    expect(foldsIntoCube(gridFromArt(['####', '.#..'])).reason).toBe('pas-assez');
    expect(foldsIntoCube(gridFromArt(['####', '####'])).reason).toBe('trop');
  });

  it('refuse un patron en deux morceaux', () => {
    const r = foldsIntoCube(gridFromArt([
      '##..',
      '##..',
      '...#',
      '...#',
    ]));
    expect(r.ok).toBe(false);
    expect(['non-connexe', 'superposition']).toContain(r.reason);
    expect(patronHint(r)).toBeTruthy();
  });

  it('un patron valide utilise les 6 faces du cube, chacune une fois', () => {
    const r = foldsIntoCube(PATRON_CROIX);
    expect(Object.keys(r.used)).toHaveLength(6);
  });

  it('reconnaît plusieurs patrons valides du cube', () => {
    // Il existe 11 patrons du cube ; on en vérifie quelques-uns de familles
    // différentes, pour s'assurer que le simulateur ne connaît pas une liste.
    const valides = [
      ['.#..', '####', '.#..'],
      ['#...', '####', '...#'],
      ['##..', '.###', '...#'],
      ['.#..', '###.', '..##'],
    ];
    for (const art of valides) {
      expect(foldsIntoCube(gridFromArt(art)).ok).toBe(true);
    }
  });

  it('filledCells compte exactement les cases pleines', () => {
    expect(filledCells(PATRON_CROIX)).toHaveLength(6);
    expect(filledCells(PATRON_BANDE)).toHaveLength(6);
  });
});

// Les quatre patrons proposés au module 4 doivent offrir un vrai mélange :
// deux valides, deux impossibles — sinon la prédiction devient triviale.
describe('patrons du module 4', () => {
  it('offre deux patrons valides et deux impossibles', () => {
    const p = [
      PATRON_CROIX,
      PATRON_IMPOSSIBLE,
      gridFromArt(['##..', '.###', '...#']),
      PATRON_BANDE,
    ];
    const verdicts = p.map((g) => foldsIntoCube(g).ok);
    expect(verdicts).toEqual([true, false, true, false]);
  });
});
