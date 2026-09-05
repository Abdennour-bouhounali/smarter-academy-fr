import { describe, it, expect } from 'vitest';
import { makeRng } from './random.js';

describe('makeRng', () => {
  it('deux générateurs de même graine produisent la même suite', () => {
    const a = makeRng(42);
    const b = makeRng(42);
    const sa = Array.from({ length: 20 }, () => a.next());
    const sb = Array.from({ length: 20 }, () => b.next());
    expect(sa).toEqual(sb);
  });

  it('deux graines différentes divergent', () => {
    const a = Array.from({ length: 10 }, makeRng(1).next);
    const b = Array.from({ length: 10 }, makeRng(2).next);
    expect(a).not.toEqual(b);
  });

  it('next() reste dans [0, 1[', () => {
    const rng = makeRng(7);
    for (let i = 0; i < 500; i += 1) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('une graine nulle ne fige pas la suite', () => {
    const rng = makeRng(0);
    const first = rng.next();
    const second = rng.next();
    expect(first).not.toBe(second);
    expect(Number.isFinite(first)).toBe(true);
  });

  it('int(n) reste dans [0, n[ et couvre toutes les valeurs', () => {
    const rng = makeRng(3);
    const seen = new Set();
    for (let i = 0; i < 600; i += 1) {
      const v = rng.int(6);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
      seen.add(v);
    }
    expect(seen.size).toBe(6);
  });

  it('int(0) et int(-1) valent 0 plutôt que NaN', () => {
    const rng = makeRng(5);
    expect(rng.int(0)).toBe(0);
    expect(rng.int(-1)).toBe(0);
  });

  it('un dé équilibré tend vers 1/6 sur 6000 lancers', () => {
    const rng = makeRng(2024);
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6000; i += 1) counts[rng.int(6)] += 1;
    for (const c of counts) expect(Math.abs(c / 6000 - 1 / 6)).toBeLessThan(0.03);
  });

  it('pick renvoie un élément du tableau, et undefined si vide', () => {
    const rng = makeRng(11);
    const arr = ['rouge', 'vert', 'bleu'];
    for (let i = 0; i < 30; i += 1) expect(arr).toContain(rng.pick(arr));
    expect(rng.pick([])).toBeUndefined();
  });

  it('shuffle conserve les éléments sans modifier le tableau d’origine', () => {
    const rng = makeRng(99);
    const src = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = rng.shuffle(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...out].sort((a, b) => a - b)).toEqual(src);
  });

  it('shuffle est reproductible à graine égale', () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(makeRng(8).shuffle(src)).toEqual(makeRng(8).shuffle(src));
  });
});
