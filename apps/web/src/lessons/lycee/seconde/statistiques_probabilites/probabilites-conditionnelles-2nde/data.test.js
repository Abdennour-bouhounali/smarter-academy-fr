import { describe, it, expect } from 'vitest';
import { conditionalProbability } from '../../../../common/stats';
import { LYCEE, TOTAL, lyceeTable, POPULATION_GROUPS, probabilityUnder, SITUATIONS } from './data';

/**
 * Ces tests verrouillent les VALEURS CITÉES dans les corrections : un
 * effectif modifié sans mettre à jour les explications donnerait une leçon
 * qui se contredit elle-même.
 */

describe('population du lycée', () => {
  it('totalise 800 élèves', () => {
    const t = lyceeTable();
    expect(t.grandTotal).toBe(TOTAL);
    expect(t.rowTotals.interne).toBe(200);
    expect(t.rowTotals.externe).toBe(600);
    expect(t.colTotals.club).toBe(450);
  });

  it('décrit la même population dans POPULATION_GROUPS', () => {
    expect(POPULATION_GROUPS.reduce((a, g) => a + g.count, 0)).toBe(TOTAL);
    const club = POPULATION_GROUPS.filter((g) => g.sport === 'club').reduce((a, g) => a + g.count, 0);
    expect(club).toBe(lyceeTable().colTotals.club);
  });
});

describe('valeurs citées dans les modules', () => {
  it('P(club) ≈ 56,3 % sans condition', () => {
    expect(probabilityUnder('aucune', 'club').value).toBeCloseTo(450 / 800, 10);
  });

  it('P_interne(club) = 0,75 — la surprise du module 1', () => {
    const { numerator, denominator, value } = probabilityUnder('interne', 'club');
    expect([numerator, denominator]).toEqual([150, 200]);
    expect(value).toBeCloseTo(0.75, 10);
  });

  it('P_externe(club) = 0,50', () => {
    expect(probabilityUnder('externe', 'club').value).toBeCloseTo(0.5, 10);
  });

  it('P_club(interne) ≈ 0,333 — l’inversion du module 3', () => {
    const { numerator, denominator, value } = probabilityUnder('club', 'interne');
    expect([numerator, denominator]).toEqual([150, 450]);
    expect(value).toBeCloseTo(1 / 3, 10);
  });

  it('les deux sens du conditionnement diffèrent nettement', () => {
    // Sans un écart franc, le module 3 ne démontrerait rien.
    const ab = probabilityUnder('interne', 'club').value;
    const ba = probabilityUnder('club', 'interne').value;
    expect(Math.abs(ab - ba)).toBeGreaterThan(0.4);
  });

  it('vérifie la formule des probabilités composées', () => {
    const pA = 200 / TOTAL;
    const pAB = probabilityUnder('interne', 'club').value;
    expect(pA * pAB).toBeCloseTo(LYCEE.interne.club / TOTAL, 10);
  });

  it('utilise le même quotient que conditionalProbability (noyau partagé)', () => {
    expect(conditionalProbability(150, 200)).toBeCloseTo(probabilityUnder('interne', 'club').value, 10);
  });
});

describe('situations du module 5', () => {
  it('annonce une réponse cohérente avec son quotient', () => {
    for (const s of SITUATIONS) {
      if (s.id === 's4') continue;   // composition, pas un simple quotient
      expect(s.numerator / s.denominator).toBeCloseTo(s.answer, 10);
    }
  });

  it('oppose bien s2 et s3 : même numérateur, univers différents', () => {
    const s2 = SITUATIONS.find((s) => s.id === 's2');
    const s3 = SITUATIONS.find((s) => s.id === 's3');
    expect(s2.numerator).toBe(s3.numerator);
    expect(s2.denominator).not.toBe(s3.denominator);
    expect(Math.abs(s2.answer - s3.answer)).toBeGreaterThan(0.5);
  });
});
