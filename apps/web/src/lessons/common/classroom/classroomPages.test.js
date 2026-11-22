import { describe, it, expect } from 'vitest';
import { MIN_PAGE_FIT, pageBudget, planPages, clampPage, pageOfBlock, planOnePerPage, SMALL_BLOCK } from './classroomPages';

describe('pageBudget', () => {
  it('rend la hauteur utile divisée par l’échelle choisie et la tolérance', () => {
    expect(pageBudget({ areaHeight: 900, userScale: 1 })).toBeCloseTo(900 / MIN_PAGE_FIT);
    expect(pageBudget({ areaHeight: 900, userScale: 1.25 })).toBeCloseTo(900 / (1.25 * MIN_PAGE_FIT));
  });
  it('sans zone mesurée, ne découpe rien', () => {
    expect(pageBudget({ areaHeight: 0 })).toBe(Infinity);
  });
});

describe('planPages', () => {
  it('une page quand tout tient', () => {
    expect(planPages({ heights: [100, 200], budget: 500, overhead: 50, gap: 10 })).toEqual([[0, 1]]);
  });

  it('découpe dans l’ordre, par blocs entiers (les deux cartes, puis la question)', () => {
    const pages = planPages({ heights: [320, 270, 430], budget: 800, overhead: 90, gap: 16 });
    expect(pages).toEqual([[0, 1], [2]]);
  });

  it('n’abandonne jamais un bloc : chaque index apparaît une fois, dans l’ordre', () => {
    const pages = planPages({ heights: [300, 300, 300, 300, 300], budget: 700, overhead: 60, gap: 12 });
    expect(pages.flat()).toEqual([0, 1, 2, 3, 4]);
    expect(pages.length).toBeGreaterThan(1);
  });

  it('un bloc plus haut que le budget occupe sa page', () => {
    expect(planPages({ heights: [100, 2000, 100], budget: 500 })).toEqual([[0], [1], [2]]);
  });

  it('sans bloc : une page vide, jamais zéro', () => {
    expect(planPages({ heights: [], budget: 500 })).toEqual([[]]);
  });

  it('budget inconnu : une seule page', () => {
    expect(planPages({ heights: [900, 900], budget: Infinity })).toEqual([[0, 1]]);
  });
});

describe('clampPage / pageOfBlock', () => {
  it('reste dans les bornes', () => {
    expect(clampPage(5, 2)).toBe(1);
    expect(clampPage(-1, 2)).toBe(0);
    expect(clampPage(NaN, 2)).toBe(0);
    expect(clampPage(1, 0)).toBe(0);
  });
  it('retrouve la page d’un bloc', () => {
    expect(pageOfBlock([[0, 1], [2]], 2)).toBe(1);
    expect(pageOfBlock([[0, 1], [2]], 9)).toBe(0);
  });
});

describe('planOnePerPage — one item per screen (mission player)', () => {
  it('gives every substantial block its own page', () => {
    expect(planOnePerPage([200, 150, 300])).toEqual([[0], [1], [2]]);
  });
  it('lets small blocks ride with the item that follows them', () => {
    // un titre (40) et un compteur (20) avant la première question
    expect(planOnePerPage([40, 20, 200, 180])).toEqual([[0, 1, 2], [3]]);
  });
  it('puts trailing small blocks on the last page, and never returns no page', () => {
    expect(planOnePerPage([200, 30])).toEqual([[0, 1]]);
    expect(planOnePerPage([30, 20])).toEqual([[0, 1]]);
    expect(planOnePerPage([])).toEqual([[]]);
  });
  it('never leaves a heading alone: a glued block rides with the next item, whatever its height', () => {
    expect(planOnePerPage([130, 200, 200], SMALL_BLOCK, [true, false, false])).toEqual([[0, 1], [2]]);
  });
  it('uses SMALL_BLOCK as the default threshold', () => {
    expect(planOnePerPage([SMALL_BLOCK - 1, SMALL_BLOCK])).toEqual([[0, 1]]);
  });
});
