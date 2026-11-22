import { describe, expect, it } from 'vitest';
import { filterOptions, normalizeSearch } from './dzSearch';
import communes from './data/dzCommunes.json';

const W = [
  { code: 1, terms: ['أدرار', 'Adrar'] },
  { code: 6, terms: ['بجاية', 'Béjaïa'] },
  { code: 10, terms: ['البويرة', 'Bouira'] },
  { code: 16, terms: ['الجزائر', 'Alger'] },
  { code: 31, terms: ['وهران', 'Oran'] },
];

describe('normalizeSearch', () => {
  it('folds Arabic spelling variants and Arabic-Indic digits', () => {
    expect(normalizeSearch('أدرار')).toBe(normalizeSearch('ادرار'));
    expect(normalizeSearch('البويرة')).toBe('البويره');
    expect(normalizeSearch('١٦')).toBe('16');
    expect(normalizeSearch('Béjaïa')).toBe('bejaia');
  });
});

describe('filterOptions', () => {
  it('finds a wilaya by its number, the exact code first', () => {
    expect(filterOptions(W, '1').map((o) => o.code)).toEqual([1, 10, 16]);
    expect(filterOptions(W, '16').map((o) => o.code)).toEqual([16]);
    expect(filterOptions(W, '١٦').map((o) => o.code)).toEqual([16]);
  });

  it('finds a wilaya by its Arabic name, with or without the article', () => {
    expect(filterOptions(W, 'جزائر').map((o) => o.code)).toEqual([16]);
    expect(filterOptions(W, 'ادرار').map((o) => o.code)).toEqual([1]);
    expect(filterOptions(W, 'بويره').map((o) => o.code)).toEqual([10]);
  });

  it('finds a wilaya by its Latin name too', () => {
    expect(filterOptions(W, 'oran').map((o) => o.code)).toEqual([31]);
    expect(filterOptions(W, 'bejaia').map((o) => o.code)).toEqual([6]);
  });

  it('returns everything for an empty query', () => {
    expect(filterOptions(W, '  ')).toBe(W);
  });
});

describe('dzCommunes.json', () => {
  it('holds the 1541 communes of the 58 wilayas, with Arabic names', () => {
    const codes = Object.keys(communes).map(Number).sort((a, b) => a - b);
    expect(codes).toEqual(Array.from({ length: 58 }, (_, i) => i + 1));
    expect(Object.values(communes).flat()).toHaveLength(1541);
    for (const [ar] of Object.values(communes).flat()) expect(ar).toMatch(/^[؀-ۿ\s()'-]+$/);
  });

  it('lets a client find Bab Ezzouar in Algiers by name', () => {
    const options = communes['16'].map(([ar, latin]) => ({ terms: [ar, latin] }));
    expect(filterOptions(options, 'باب الزوار')[0].terms[0]).toBe('باب الزوار');
    expect(filterOptions(options, 'زوار')[0].terms[0]).toBe('باب الزوار');
  });
});
