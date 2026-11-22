import { describe, it, expect } from 'vitest';
import { groupInto, groupBy, exactGroupings, fixLeftOver, isExactGrouping } from './equalGrouping.js';

/**
 * Les nombres sont ceux du manuel (420 / 26 / 28, activité 1) et ceux des
 * scènes de la plateforme (15 et 16 joueurs, 3 équipes). Ce que ces tests
 * verrouillent : la MÊME mathématique sert les deux contextes, et le reste
 * est toujours un nombre d'objets à dessiner dehors, jamais une décimale.
 */

describe('groupInto — partition : combien dans chaque groupe ?', () => {
  it('15 joueurs en 3 équipes : 5 par équipe, personne dehors', () => {
    const g = groupInto(15, 3);
    expect([g.perGroup, g.leftOver, g.exact]).toEqual([5, 0, true]);
    expect(g.equality).toEqual({ a: 15, b: 3, q: 5, r: 0 });
    expect(g.sizes).toEqual([5, 5, 5]);
  });

  it('16 joueurs en 3 équipes : 5 par équipe et UN joueur reste dehors — jamais 5,333', () => {
    const g = groupInto(16, 3);
    expect([g.perGroup, g.leftOver, g.exact]).toEqual([5, 1, false]);
    expect(g.equality).toEqual({ a: 16, b: 3, q: 5, r: 1 });
    // Les équipes restent ÉGALES : le reste ne gonfle pas un groupe.
    expect(g.sizes).toEqual([5, 5, 5]);
    expect(g.sizes.reduce((s, n) => s + n, 0) + g.leftOver).toBe(16);
  });

  it('refuse un nombre de groupes nul ou non entier', () => {
    expect(groupInto(15, 0)).toBeNull();
    expect(groupInto(15, 2.5)).toBeNull();
    expect(groupInto(-1, 3)).toBeNull();
  });
});

describe('groupBy — quotition : combien de groupes ? (la lecture du manuel)', () => {
  it('420 livres par 28 : 15 rayons, rien au sol', () => {
    const g = groupBy(420, 28);
    expect([g.groups, g.leftOver, g.exact]).toEqual([15, 0, true]);
    expect(g.equality).toEqual({ a: 420, b: 28, q: 15, r: 0 });
  });

  it('420 livres par 26 : 16 rayons et 4 livres au sol', () => {
    const g = groupBy(420, 26);
    expect([g.groups, g.leftOver, g.exact]).toEqual([16, 4, false]);
    expect(g.equality).toEqual({ a: 420, b: 26, q: 16, r: 4 });
  });

  it('partition et quotition sont la même égalité, lue dans deux sens', () => {
    const part = groupInto(420, 15);
    const quot = groupBy(420, 28);
    expect(part.perGroup).toBe(quot.perGroup);
    expect(part.groups).toBe(quot.groups);
  });
});

describe('exactGroupings — « les nombres qui marchent » sont les diviseurs', () => {
  it('pour 24 joueurs, entre 2 et 8 équipes', () => {
    expect(exactGroupings(24, { min: 2, max: 8 })).toEqual([2, 3, 4, 6, 8]);
  });

  it('pour un nombre premier, seul 1 et lui-même — et la plage les borne', () => {
    expect(exactGroupings(17, { min: 2, max: 8 })).toEqual([]);
    expect(exactGroupings(17, { min: 1, max: 17 })).toEqual([1, 17]);
  });

  it('la plage ne dessine jamais plus de groupes qu’il n’y a d’objets', () => {
    expect(exactGroupings(6, { min: 1, max: 100 })).toEqual([1, 2, 3, 6]);
  });
});

describe('fixLeftOver — ce que l’élève se demande en voyant le joueur sur le banc', () => {
  it('16 joueurs en 3 équipes : +2 (18) ou −1 (15)', () => {
    expect(fixLeftOver(16, 3)).toEqual({ add: 2, remove: 1 });
    expect(isExactGrouping(16 + 2, 3)).toBe(true);
    expect(isExactGrouping(16 - 1, 3)).toBe(true);
  });

  it('quand tout tombe juste, il n’y a rien à corriger', () => {
    expect(fixLeftOver(15, 3)).toEqual({ add: 0, remove: 0 });
  });
});
