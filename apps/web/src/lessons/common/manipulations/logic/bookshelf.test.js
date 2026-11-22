import { describe, it, expect } from 'vitest';
import * as B from './bookshelf';

/* Le LABORATOIRE RÉEL des livres (divisor-explorer-books, leçon 1) : 420
   livres de l'activité 1 (26 ou 28 par rayon ?) et 143 de معارف 1 (11 قاسم
   للعدد 143). Toute la mathématique que la vue lit vient d'ici. */

describe('bookshelf — l’arrangement est la division', () => {
  it('26 par rayon : 16 rayons pleins, 4 livres au sol, il en manque 22 pour un rayon de plus', () => {
    expect(B.arrange(420, 26)).toEqual({ capacity: 26, shelves: 16, leftOver: 4, exact: false, missing: 22 });
  });
  it('28 par rayon : 15 rayons pleins, sol vide', () => {
    expect(B.arrange(420, 28)).toEqual({ capacity: 28, shelves: 15, leftOver: 0, exact: true, missing: 0 });
  });
  it('sur toute la réglette, rayons × b + sol = 420, et le sol est toujours plus petit qu’un rayon', () => {
    const range = B.shelfRange(420, { min: 10, max: 60 });
    for (let b = range.min; b <= range.max; b += 1) {
      const a = B.arrange(420, b);
      expect(a.shelves * b + a.leftOver, `b=${b}`).toBe(420);
      expect(a.leftOver, `b=${b}`).toBeLessThan(b);
      expect(a.exact, `b=${b}`).toBe(420 % b === 0);
      expect(a.shelves, `b=${b}`).toBeLessThanOrEqual(B.MAX_DRAWN_SHELVES);
    }
  });
  it('les longueurs qui vident le sol sont exactement les diviseurs de 420 dans la plage', () => {
    expect(B.exactCapacities(420, { min: 10, max: 60 })).toEqual([10, 12, 14, 15, 20, 21, 28, 30, 35, 42, 60]);
    expect(B.exactCapacities(143, { min: 5, max: 30 })).toEqual([11, 13]);
  });
  it('la plage par défaut reste dessinable', () => {
    expect(B.shelfRange(420)).toEqual({ min: 10, max: 60 });
    expect(B.shelfRange(143)).toEqual({ min: 4, max: 60 });
    expect(B.shelfRange(24, { min: 2, max: 12 })).toEqual({ min: 2, max: 12 });
    expect(B.clampCapacity(8.6, { min: 10, max: 60 })).toBe(10);
    expect(B.clampCapacity(27.6, { min: 10, max: 60 })).toBe(28);
  });
});

describe('bookshelf — un essai est un geste validé, et la découverte se mérite', () => {
  it('un essai se mémorise une fois, avec son verdict', () => {
    let t = B.commit({}, 420, 26);
    t = B.commit(t, 420, 26);
    expect(t).toEqual({ 26: { exact: false, leftOver: 4, shelves: 16 } });
    expect(B.commit(t, 420, null)).toBe(t);
  });
  it('il faut trois longueurs, dont une qui vide le sol ET une qui laisse des livres', () => {
    let t = B.commit({}, 420, 28);
    t = B.commit(t, 420, 26);
    expect(B.remainderDiscoveryReady(t)).toBe(false);          // deux essais seulement
    t = B.commit(t, 420, 30);
    expect(B.remainderDiscoveryReady(t)).toBe(true);
    let same = {};
    for (const b of [10, 12, 14, 15]) same = B.commit(same, 420, b);
    expect(B.remainderDiscoveryReady(same)).toBe(false);       // aucun contraste
  });
  it('la symétrie : 11 PUIS 13 vident le sol et 11 × 13 = 143', () => {
    let t = B.commit({}, 143, 11);
    expect(B.symmetryPair(t, 143)).toBeNull();
    t = B.commit(t, 143, 12);
    expect(B.symmetryPair(t, 143)).toBeNull();
    t = B.commit(t, 143, 13);
    expect(B.symmetryPair(t, 143)).toEqual([11, 13]);
    // Deux diviseurs qui ne sont pas l'un le quotient de l'autre ne suffisent pas.
    let u = B.commit({}, 420, 28);
    u = B.commit(u, 420, 30);
    expect(B.symmetryPair(u, 420)).toBeNull();
    u = B.commit(u, 420, 15);
    expect(B.symmetryPair(u, 420)).toEqual([15, 28]);
  });
  it('les contre-exemples viennent de la plage, les marques du manuel d’abord', () => {
    expect(B.counterExamples(420, { min: 10, max: 60 }, [26, 28])).toEqual({
      even: { b: 26, leftOver: 4 }, small: { b: 11, leftOver: 2 }, big: { b: 60, leftOver: 0 },
    });
    expect(B.counterExamples(143, { min: 5, max: 30 }, [11, 13])).toEqual({
      even: { b: 6, leftOver: 5 }, small: { b: 5, leftOver: 3 }, big: { b: 13, leftOver: 0 },
    });
  });
});

describe('bookshelf — la géométrie dessine CHAQUE livre, une fois, sans chevauchement', () => {
  const cases = [
    { total: 420, range: { min: 10, max: 60 } },
    { total: 143, range: { min: 5, max: 30 } },
    { total: 24, range: { min: 2, max: 12 } },
  ];
  for (const { total, range } of cases) {
    for (const width of [230, 300, 420, 700, 1100]) {
      it(`${total} livres, ${width} px : toute la réglette`, () => {
        const unit = B.unitFor(width, range.max);
        expect(unit).toBeGreaterThanOrEqual(2);
        for (let b = range.min; b <= range.max; b += 1) {
          const L = B.bookcaseLayout({ total, b, width, unit });
          const a = B.arrange(total, b);
          const ids = [...L.shelves.flatMap((s) => s.books.map((k) => k.id)), ...(L.ghost?.books ?? []).map((k) => k.id)];
          // Chaque livre, une fois.
          expect(ids.length, `b=${b}`).toBe(total);
          expect(new Set(ids).size, `b=${b}`).toBe(total);
          // Rayons pleins et fantôme = la division.
          expect(L.shelves.length, `b=${b}`).toBe(a.shelves);
          for (const s of L.shelves) expect(s.books.length).toBe(b);
          expect(L.ghost?.books.length ?? 0, `b=${b}`).toBe(a.leftOver);
          expect(L.ghost?.slots.length ?? 0, `b=${b}`).toBe(a.missing);
          // Tout tient dans la largeur, et deux rayons ne se touchent pas.
          const rects = L.shelves.map((s) => ({ x: s.x, y: s.y, w: L.shelfW }));
          if (L.ghost) rects.push({ x: L.ghost.x, y: L.ghost.y, w: L.ghost.w });
          for (const r of rects) {
            expect(r.x, `b=${b}`).toBeGreaterThanOrEqual(-0.001);
            expect(r.x + r.w, `b=${b}`).toBeLessThanOrEqual(width + 0.001);
          }
          for (let i = 0; i < rects.length; i += 1) {
            for (let j = i + 1; j < rects.length; j += 1) {
              const p = rects[i]; const q = rects[j];
              const overlap = p.y === q.y && p.x < q.x + q.w && q.x < p.x + p.w;
              expect(overlap, `b=${b} rayons ${i}/${j}`).toBe(false);
            }
          }
          // Les livres d'un rayon restent DANS le rayon.
          for (const s of L.shelves) {
            for (const k of s.books) {
              expect(k.x).toBeGreaterThanOrEqual(s.x);
              expect(k.x + unit).toBeLessThanOrEqual(s.x + L.shelfW + 0.001);
            }
          }
        }
      });
    }
  }

  it('avant le geste, les 420 livres sont TOUS dessinés au sol', () => {
    const L = B.bookcaseLayout({ total: 420, b: null, width: 300, unit: B.unitFor(300, 60) });
    expect(L.pile.books).toHaveLength(420);
    expect(L.shelves).toHaveLength(0);
    for (const k of L.pile.books) expect(k.x).toBeGreaterThanOrEqual(0);
  });

  it('RTL : le premier rayon est en haut à droite, le premier livre contre le montant droit', () => {
    const unit = 5;
    const L = B.bookcaseLayout({ total: 420, b: 28, width: 600, unit });
    const first = L.shelves[0];
    expect(first.y).toBe(0);
    expect(first.x + L.shelfW).toBe(600);
    expect(first.books[0].x).toBeGreaterThan(first.books[1].x);
  });
});

describe('bookshelf — le rayon par défaut n’est jamais une réponse (2026-10-09)', () => {
  it('première longueur qui laisse des livres au sol', () => {
    expect(B.defaultShelf(24, { min: 2, max: 12 })).toBe(5);
    expect(B.defaultShelf(420, { min: 10, max: 60 })).toBe(11);
    for (const [t, r] of [[24, { min: 2, max: 12 }], [420, { min: 10, max: 60 }], [143, { min: 2, max: 20 }]]) {
      expect(t % B.defaultShelf(t, r), String(t)).not.toBe(0);
    }
  });
});
