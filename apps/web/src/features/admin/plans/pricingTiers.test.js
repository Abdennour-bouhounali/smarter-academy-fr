import { describe, it, expect } from 'vitest';
import { tiersToRows, rowsToPayload, tierProblems } from './pricingTiers';

const row = (min, max, price, extra = {}) => ({ minStudents: min, maxStudents: max, pricePerStudent: price, currency: 'DZD', isActive: true, ...extra });

describe('grille de prix par élève (éditeur)', () => {
  it('convertit centimes ↔ dinars sans perte', () => {
    const rows = tiersToRows([{ id: 1, minStudents: 6, maxStudents: 20, pricePerStudentCents: 100000, currency: 'DZD', isActive: true, sortOrder: 1 }]);
    expect(rows[0]).toMatchObject({ minStudents: 6, maxStudents: 20, pricePerStudent: 1000 });
    expect(rowsToPayload(rows)[0]).toMatchObject({ minStudents: 6, maxStudents: 20, pricePerStudentCents: 100000, sortOrder: 0 });
    expect(rowsToPayload([row(101, '', 500)])[0].maxStudents).toBeNull();
  });

  // `tierProblems` rend des CODES, pas des phrases : la règle vit dans le
  // module, la phrase dans le catalogue arabe (admin.plans.tier*). Le test
  // porte donc sur le code et ses paramètres — il ne casse plus quand on
  // reformule un message, et il ne fige plus l'éditeur dans une langue.
  it('signale chevauchements, trous et bornes inversées', () => {
    expect(tierProblems([row(1, 20, 0), row(15, 30, 800)]))
      .toEqual([{ code: 'tierOverlap', params: { a: '1–20', b: '15–30' } }]);
    expect(tierProblems([row(1, 5, 0), row(7, 20, 1000)]))
      .toEqual([{ code: 'tierGapOne', params: { n: 6 } }]);
    expect(tierProblems([row(1, 5, 0), row(9, 20, 1000)]))
      .toEqual([{ code: 'tierGapRange', params: { from: 6, to: 8 } }]);
    expect(tierProblems([row(10, 5, 0)])[0]).toMatchObject({ code: 'tierMaxInvalid', params: { n: 1 } });
    expect(tierProblems([row(1, 5, -1)])[0]).toMatchObject({ code: 'tierPriceInvalid', params: { n: 1 } });
    expect(tierProblems([row(0, 5, 0)])[0]).toMatchObject({ code: 'tierMinInvalid', params: { n: 1 } });
    expect(tierProblems([row(1, '', 0), row(6, 20, 1000)])[0]).toMatchObject({ code: 'tierUnbounded', params: { min: 1 } });
  });

  it('un palier sans borne suivi de deux autres ne signale le défaut qu’une fois', () => {
    // Le dédoublonnage porte sur (code, paramètres) : sans lui, chaque palier
    // suivant répéterait le même reproche.
    const problems = tierProblems([row(1, '', 0), row(6, 20, 1000), row(21, 40, 900)]);
    expect(problems.filter((p) => p.code === 'tierUnbounded')).toHaveLength(1);
  });

  it('ignore les paliers inactifs pour la continuité et accepte une grille saine', () => {
    expect(tierProblems([row(1, 5, 0), row(6, 20, 1000, { isActive: false }), row(6, 15, 1200), row(16, '', 900)])).toEqual([]);
    expect(tierProblems([row(1, 5, 0), row(6, 20, 1000), row(21, 30, 800), row(31, 50, 700), row(51, 100, 600), row(101, '', 500)])).toEqual([]);
  });
});
