import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './vanishingPitch';

/**
 * vanishing-pitch — la logique RÉELLE du lab (celle que VanishingPitch.jsx importe),
 * sur les nombres du manuel : نشاط 2 (3(x − 5), (x − 2)(x + 5)), معارف 2 مثال 3
 * ((3x − 4)(−2x + 1), zéros 1/2 et 4/3), دوري الآن 2 ((2x + 1)², un seul zéro).
 */
const at = (s, x) => Math.round(x * s.g);
const walk = (s, xs) => xs.reduce((acc, x) => L.move(acc, at(acc, x)), s);

describe('vanishing-pitch — lecture du produit', () => {
  it('3(x − 5) : un côté constant, un seul zéro, graduation entière', () => {
    const s = L.init({ expr: '3|x-5' });
    expect(s.roots.map(Lin.fracText)).toEqual(['5']);
    expect(s.g).toBe(1);
    expect(L.isConstant(s, 0)).toBe(true);
    expect(L.productTex(s)).toBe('3(x - 5)');
    expect(s.range).toEqual({ min: -2, max: 7 });
  });

  it('(x − 2)(x + 5) : deux zéros, la règle couvre −7 … 4', () => {
    const s = L.init({ expr: 'x-2|x+5' });
    expect(s.roots.map(Lin.fracText)).toEqual(['-5', '2']);
    expect(s.range).toEqual({ min: -7, max: 4 });
    expect(L.productTex(s)).toBe('(x - 2)(x + 5)');
  });

  it('(3x − 4)(−2x + 1) : la graduation vient des dénominateurs des zéros (sixièmes)', () => {
    const s = L.init({ expr: '3x-4|-2x+1' });
    expect(s.roots.map(Lin.fracText)).toEqual(['1/2', '4/3']);
    expect(s.g).toBe(6);
    expect(s.rootUnits).toEqual([3, 8]);
    expect(L.equationsOf(s).map((e) => e.tex)).toEqual(['3x - 4 = 0', '-2x + 1 = 0']);
  });

  it('(2x + 1)² : un seul facteur = son carré, UN zéro', () => {
    const s = L.init({ expr: '2x+1' });
    expect(s.square).toBe(true);
    expect(s.roots.map(Lin.fracText)).toEqual(['-1/2']);
    expect(L.productTex(s)).toBe('(2x + 1)^2');
    expect(L.equationsOf(s)).toHaveLength(1);
    expect(L.zeroSides(s, s.rootUnits[0])).toEqual([0, 1]);
  });

  it('−1,2(3x + 2,7) : décimaux du manuel, zéro −0,9', () => {
    const s = L.init({ expr: '-1,2|3x+2,7' });
    expect(L.productTex(s)).toBe('-1{,}2(3x + 2{,}7)');
    expect(L.labText(s, s.roots[0])).toBe('−0,9');
    expect(L.areaTex(s, 0)).toBe('(-1{,}2) \\times 2{,}7 = -3{,}24');
  });

  it('un produit sans zéro, ou nul pour tout x, est une erreur de contenu', () => {
    expect(() => L.init({ expr: '3|5' })).toThrow();
    expect(() => L.init({ expr: '0|x-1' })).toThrow();
  });
});

describe('vanishing-pitch — épingler, refuser, conclure', () => {
  it('refuse x = 1 pour (x − 2)(x + 5) avec l’aire lue : (−1) × 6 = −6', () => {
    let s = L.init({ expr: 'x-2|x+5' });
    s = L.pin(s);
    expect(s.last.kind).toBe('noX');
    s = L.pin(L.move(s, 1));
    expect(s.last).toEqual({ kind: 'notZero', v: 1 });
    expect(L.areaTex(s, 1)).toBe('(-1) \\times 6 = -6');
    expect(s.refused).toEqual([1]);
    expect(s.pins).toEqual([]);
  });

  it('épingle 2 puis −5 ; une seule épingle ne suffit pas à « لا حلول أخرى »', () => {
    let s = walk(L.init({ expr: 'x-2|x+5' }), [1, 2]);
    s = L.pin(L.pin(s));
    expect(s.pins).toEqual([2]);
    expect(s.last.kind).toBe('already');
    s = L.claimNoOther(s);
    expect(s.last.kind).toBe('missing');
    expect(s.claimed).toBe(false);
    s = L.pin(L.move(s, -5));
    expect(s.last).toEqual({ kind: 'pinned', v: -5, zero: [1] });
    expect(L.allPinned(s)).toBe(true);
  });

  it('« لا حلول أخرى » exige le balayage des deux côtés des zéros', () => {
    let s = L.init({ expr: 'x-2|x+5' });
    s = L.pin(L.move(s, 2));
    s = L.pin(L.move(s, -5));
    s = L.claimNoOther(s);
    expect(s.last.kind).toBe('notSwept');
    s = L.move(L.move(s, -6), 3);
    s = L.claimNoOther(s);
    expect(s.last.kind).toBe('claimed');
    expect(L.discoveryReady(s)).toBe(false); // aucun refus : pas de contraste
    s = L.pin(L.move(s, 0));
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('3(x − 5) : le côté 3 ne s’écrase jamais — une seule épingle suffit', () => {
    let s = L.init({ expr: '3|x-5' });
    s = L.pin(L.move(s, 3));
    expect(s.last.kind).toBe('notZero');
    expect(L.areaTex(s, 3)).toBe('3 \\times (-2) = -6');
    s = L.pin(L.move(s, 5));
    expect(s.last.zero).toEqual([1]);
    s = L.claimNoOther(L.move(s, 6));
    expect(s.claimed).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('(3x − 4)(−2x + 1) : 1/2 et 4/3 sont des graduations exactes', () => {
    let s = L.init({ expr: '3x-4|-2x+1' });
    s = L.pin(L.move(s, 3));
    s = L.pin(L.move(s, 8));
    expect(s.pins).toEqual([3, 8]);
    expect(L.allPinned(s)).toBe(true);
    expect(L.areaTex(s, 6)).toBe('(-1) \\times (-1) = 1');
  });

  it('move refuse un v hors de la règle ou non entier', () => {
    const s = L.init({ expr: 'x-2|x+5' });
    expect(L.move(s, 99)).toBe(s);
    expect(L.move(s, 0.5)).toBe(s);
  });
});

describe('vanishing-pitch — balayage de toute la règle', () => {
  const EXPRS = ['3|x-5', 'x-2|x+5', '3x-4|-2x+1', '2x+1', '-1,2|3x+2,7', '4x|-x+1', 'x+3|8-4x', 'x-5|x+17', 'x-3|x-7'];

  it.each(EXPRS)('%s : l’aire est nulle EXACTEMENT quand un côté l’est, et seulement aux zéros', (expr) => {
    const s = L.init({ expr });
    for (let v = s.range.min; v <= s.range.max; v += 1) {
      const { A, B, area } = L.sides(s, v);
      const zero = Lin.isZero(area);
      expect(zero).toBe(Lin.isZero(A) || Lin.isZero(B));
      expect(zero).toBe(s.rootUnits.includes(v));
      // le produit du lab est celui de linear.productAt
      expect(Lin.eq(area, Lin.productAt(s.factors, L.xOf(s, v)))).toBe(true);
    }
  });

  it.each(EXPRS)('%s : le terrain reste dans son dessin pour tout x, à cinq largeurs', (expr) => {
    const s = L.init({ expr });
    for (const width of [260, 320, 390, 768, 1200]) {
      for (let v = s.range.min; v <= s.range.max; v += 1) {
        const g = L.geometry(s, v, { width });
        expect(g.svgW).toBeLessThanOrEqual(width + 1e-9);
        expect(g.rect.x).toBeGreaterThanOrEqual(-1e-9);
        expect(g.rect.y).toBeGreaterThanOrEqual(-1e-9);
        expect(g.rect.x + g.rect.w).toBeLessThanOrEqual(g.svgW + 1e-9);
        expect(g.rect.y + g.rect.h).toBeLessThanOrEqual(g.svgH + 1e-9);
        expect(g.collapsed).toBe(g.rect.w < 1e-9 || g.rect.h < 1e-9);
        const { area } = L.sides(s, v);
        expect(g.sign).toBe(Lin.isZero(area) ? 0 : area.n > 0 ? 1 : -1);
      }
    }
  });
});

describe('valeur par défaut (jamais une réponse, jamais une visite)', () => {
  it('le x par défaut ne s\'écrase pas, et rien n\'est écrit dans la mémoire', () => {
    for (const expr of ['x-2|x+5', '3|x-5', '3x-4|-2x+1', '4x|-x+1', '2x+1', 'x|x-1']) {
      const s = L.init({ expr });
      const v = L.defaultV(s);
      expect(Lin.isZero(L.sides(s, v).area)).toBe(false);
      expect(v).toBeGreaterThanOrEqual(s.range.min);
      expect(v).toBeLessThanOrEqual(s.range.max);
      expect(s.visited).toEqual([]);
      expect(s.pins).toEqual([]);
    }
  });
  it('balayer toute la règle donne le même état que la main (move) et permet de conclure', () => {
    let s = L.init({ expr: 'x-2|x+5' });
    for (let v = s.range.min; v <= s.range.max; v += 1) s = L.move(s, v);
    expect(s.visited).toHaveLength(s.range.max - s.range.min + 1);
    expect(L.swept(s)).toBe(true);
  });
});
