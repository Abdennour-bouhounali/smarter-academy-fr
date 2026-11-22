import { describe, it, expect } from 'vitest';
import { commonDenominatorStory, multiplesUpTo } from './commonDenominatorStory.js';
import { fineCuts } from './FractionShape.jsx';

describe('توحيد المقامات — le nombre de parts qui convient aux deux découpages', () => {
  it('1/3 et 1/4 : les multiples se rencontrent d\'abord en 12', () => {
    const story = commonDenominatorStory(3, 4);
    expect(story.denominator).toBe(12);
    expect(story.left).toEqual({ d: 3, factor: 4, multiples: [3, 6, 9, 12] });
    expect(story.right).toEqual({ d: 4, factor: 3, multiples: [4, 8, 12] });
  });

  it('un dénominateur qui divise l\'autre ne se redécoupe pas (facteur 1)', () => {
    expect(commonDenominatorStory(2, 4).right).toMatchObject({ factor: 1, multiples: [4] });
  });

  it('une longue liste est abrégée mais finit sur le PPCM', () => {
    const list = multiplesUpTo(3, 63);
    expect(list).toHaveLength(10);
    expect(list.at(-2)).toBe('…');
    expect(list.at(-1)).toBe(63);
  });

  it('les coupes fines : chaque tiers en 4, sans redessiner les coupes du tiers', () => {
    expect(fineCuts(12, 3)).toEqual([1, 2, 3, 5, 6, 7, 9, 10, 11]);
    expect(fineCuts(12, 5)).toEqual([]);   // 12 n'est pas un multiple de 5 : pas un dénominateur commun
    expect(fineCuts(4, 4)).toEqual([]);
  });

  it('refuse l\'illisible', () => {
    expect(commonDenominatorStory(0, 4)).toBeNull();
  });
});
