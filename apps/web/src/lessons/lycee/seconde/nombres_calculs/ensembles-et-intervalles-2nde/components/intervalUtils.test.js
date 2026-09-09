import { describe, it, expect } from 'vitest';
import {
  interval, contains, notation, inequality, typeOf, intersect, union, integersIn, isEmpty,
  sameInterval, smallestSet, vennRegion, divisorsOf, texNotation, roundTo,
} from './intervalUtils';

describe('interval / contains', () => {
  const I = interval(1.2, 1.9, false, true); // [1,2 ; 1,9[
  it('the manège filter accepts 1,20 and refuses 1,90', () => {
    expect(contains(I, 1.2)).toBe(true);
    expect(contains(I, 1.9)).toBe(false);
    expect(contains(I, 1.899)).toBe(true);
    expect(contains(I, 2.05)).toBe(false);
    expect(contains(I, 0.5)).toBe(false);
  });
  it('toggling the brackets flips the verdict on the bound only', () => {
    const J = interval(1.2, 1.9, true, false);
    expect(contains(J, 1.2)).toBe(false);
    expect(contains(J, 1.9)).toBe(true);
    expect(contains(J, 1.5)).toBe(true);
  });
  it('infinite bounds are always open and contain arbitrarily large numbers', () => {
    const H = interval(3, null);
    expect(H.openTo).toBe(true);
    expect(contains(H, 3)).toBe(true);
    expect(contains(H, 1e9)).toBe(true);
    expect(contains(H, Infinity)).toBe(false);
  });
});

describe('notation / inequality / typeOf', () => {
  it('turns the bracket towards a number that belongs', () => {
    expect(notation(interval(-2, 3))).toBe('[−2 ; 3]');
    expect(notation(interval(-2, 3, true, true))).toBe(']−2 ; 3[');
    expect(notation(interval(-2, 3, false, true))).toBe('[−2 ; 3[');
    expect(notation(interval(3, null))).toBe('[3 ; +∞[');
    expect(notation(interval(null, 5, true, true))).toBe(']−∞ ; 5[');
    expect(notation(interval(1.2, 1.9, false, true))).toBe('[1,2 ; 1,9[');
  });
  it('writes the matching inequality', () => {
    expect(inequality(interval(-1, 4, true, false))).toBe('−1 < x ≤ 4');
    expect(inequality(interval(3, null))).toBe('x ≥ 3');
    expect(inequality(interval(null, 5, true, true))).toBe('x < 5');
    expect(inequality(interval(2.5, 4, false, true), 'L')).toBe('2,5 ≤ L < 4');
  });
  it('names the type', () => {
    expect(typeOf(interval(0, 1))).toBe('fermé');
    expect(typeOf(interval(0, 1, true, true))).toBe('ouvert');
    expect(typeOf(interval(0, 1, true, false))).toBe('semi-ouvert');
    expect(typeOf(interval(0, null))).toBe('demi-droite');
  });
  it('tex notation escapes the decimal comma', () => {
    expect(texNotation(interval(1.2, 1.9, false, true))).toBe('[1{,}2\\,;\\,1{,}9[');
    expect(texNotation(interval(null, 5))).toBe(']-\\infty\\,;\\,5]');
  });
});

describe('intersect / union', () => {
  const I = interval(-1, 4);            // [−1 ; 4]
  const J = interval(2, 7, true, true); // ]2 ; 7[
  it('I ∩ J = ]2 ; 4]', () => {
    expect(notation(intersect(I, J))).toBe(']2 ; 4]');
    expect(notation(intersect(J, I))).toBe(']2 ; 4]');
  });
  it('I ∪ J = [−1 ; 7[', () => {
    expect(notation(union(I, J))).toBe('[−1 ; 7[');
  });
  it('disjoint intervals: empty intersection, union not an interval', () => {
    const A = interval(-5, -2);
    const B = interval(0, 3);
    expect(isEmpty(intersect(A, B))).toBe(true);
    expect(notation(intersect(A, B))).toBe('∅');
    expect(union(A, B)).toBe(null);
  });
  it('touching bounds: [0;2[ ∪ [2;3] is an interval, [0;2[ ∩ [2;3] is empty', () => {
    expect(notation(union(interval(0, 2, false, true), interval(2, 3)))).toBe('[0 ; 3]');
    expect(isEmpty(intersect(interval(0, 2, false, true), interval(2, 3)))).toBe(true);
    expect(union(interval(0, 2, false, true), interval(2, 3, true, false))).toBe(null);
  });
  it('sameInterval compares sets, not objects', () => {
    expect(sameInterval(interval(0, 1, true, true), interval(0, 1, true, true))).toBe(true);
    expect(sameInterval(interval(0, 1), interval(0, 1, true, false))).toBe(false);
    expect(sameInterval(interval(2, 1), interval(5, 5, true, false))).toBe(true);
  });
});

describe('integersIn / sets / venn', () => {
  it('counts the integers of [−2,5 ; 3[ (3 excluded)', () => {
    expect(integersIn(interval(-2.5, 3, false, true))).toEqual([-2, -1, 0, 1, 2]);
    expect(integersIn(interval(2, 8))).toHaveLength(7);
  });
  it('places numbers in the smallest nested set', () => {
    expect(smallestSet(7)).toBe('N');
    expect(smallestSet(0)).toBe('N');
    expect(smallestSet(-3)).toBe('Z');
    expect(smallestSet(2.5)).toBe('R');
    expect(smallestSet(-1.25)).toBe('R');
  });
  it('sorts divisors of 12 and 18 into the Venn regions', () => {
    const A = divisorsOf(12);
    const B = divisorsOf(18);
    expect(A).toEqual([1, 2, 3, 4, 6, 12]);
    expect(vennRegion(6, A, B)).toBe('both');
    expect(vennRegion(4, A, B)).toBe('A');
    expect(vennRegion(9, A, B)).toBe('B');
    expect(vennRegion(5, A, B)).toBe('none');
  });
});

describe('bornes réglées au bouton — pas de dérive flottante', () => {
  // Le module 6 refusait une réponse JUSTE : au pas 0,1, quatre appuis sur « + »
  // depuis 1 donnaient 1.4000000000000001, et `sameInterval` compare en `===`.
  // L'élève lisait « ta construction : ]1,4 ; 1,9[ » et « il fallait :
  // ]1,4 ; 1,9[ » — deux chaînes identiques, la sienne déclarée fausse, parce
  // que `formatDec` masquait la dérive. Le geste de GLISSEMENT arrondissait
  // déjà : seul le chemin par boutons était atteint, donc aucun test qui
  // glisse ne pouvait le voir.
  const bump = (cur, d, s) => roundTo(Math.round((cur + d * s) / s) * s);

  it('quatre pas de +0,1 depuis 1 valent exactement 1,4', () => {
    let v = 1;
    for (let i = 0; i < 4; i += 1) v = bump(v, 1, 0.1);
    expect(v).toBe(1.4);
  });

  it('trois pas de −0,1 depuis 2,2 valent exactement 1,9', () => {
    let v = 2.2;
    for (let i = 0; i < 3; i += 1) v = bump(v, -1, 0.1);
    expect(v).toBe(1.9);
  });

  it('l’intervalle ainsi construit est reconnu égal à sa cible', () => {
    let from = 1;
    for (let i = 0; i < 4; i += 1) from = bump(from, 1, 0.1);
    let to = 2.2;
    for (let i = 0; i < 3; i += 1) to = bump(to, -1, 0.1);
    expect(sameInterval(interval(from, to, true, true), interval(1.4, 1.9, true, true))).toBe(true);
  });

  it('reste exact aux autres pas de la leçon (0,5 et 1)', () => {
    let v = 0;
    for (let i = 0; i < 7; i += 1) v = bump(v, 1, 0.5);
    expect(v).toBe(3.5);
    let w = -3;
    for (let i = 0; i < 5; i += 1) w = bump(w, 1, 1);
    expect(w).toBe(2);
  });
});
