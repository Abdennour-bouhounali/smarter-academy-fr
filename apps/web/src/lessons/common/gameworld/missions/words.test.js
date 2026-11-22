import { describe, expect, it } from 'vitest';
import { CRATES, counted, leftOf } from './words';

const kinds = { a: { name: 'pommes' }, b: { name: 'œufs' } };

describe('the words of a mission — French counts, in French order', () => {
  it('a count is the number, a no-break space, then its noun (0 and 1 singular)', () => {
    expect([0, 1, 2, 12].map((n) => counted(n, CRATES))).toEqual(['0 caisse', '1 caisse', '2 caisses', '12 caisses']);
  });

  it('what is left of two stocks: « 3 caisses de pommes et 6 caisses d’œufs »', () => {
    expect(leftOf({ a: 3, b: 6 }, kinds)).toBe('3 caisses de pommes et 6 caisses d’œufs');
    expect(leftOf({ a: 1, b: 0 }, kinds)).toBe('1 caisse de pommes');
    expect(leftOf({ a: 0, b: 2 }, kinds)).toBe('2 caisses d’œufs');
    expect(leftOf({ a: 0, b: 0 }, kinds)).toBe('');
  });

  it('no Arabic and no direction mark is left in a sentence', () => {
    expect(leftOf({ a: 3, b: 6 }, kinds)).not.toMatch(/[\u0600-\u06ff\u2066-\u2069]/);
  });
});
