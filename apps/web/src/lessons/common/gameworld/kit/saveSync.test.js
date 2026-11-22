import { describe, it, expect } from 'vitest';
import { toEntries, fromEntries, serverWins } from './saveSync';

/** A save as the world writes it, with French words in it — accents, apostrophes, no-break spaces (the rule a student said in his own words). */
const save = (extra = {}) => ({
  v: 1,
  stage: 7,
  keys: ['a', 'b'],
  rules: {
    a: {
      text: 'Le pont tient quand : le reste de la division du fossé par la planche est égal à 0.',
      words: 'quand il ne reste rien, « zéro »',
    },
  },
  log: Array.from({ length: 16 }, (_, i) => ({ a: 20 + i, b: 3 })),
  at: 1763380000000,
  ...extra,
});

describe('the world save follows the student from one device to the next', () => {
  it('cuts the save into pieces the answers store accepts, and puts it together again unchanged', () => {
    const big = save({ know: { read: Array.from({ length: 400 }, (_, i) => `card-${i}-règle`) } });
    const entries = toEntries(big);
    const count = entries['world:n'].v;
    expect(count).toBeGreaterThan(1);
    expect(Object.keys(entries)).toHaveLength(count + 1);
    for (const [key, e] of Object.entries(entries)) {
      expect(e.at, key).toBe(big.at);
      expect(JSON.stringify(e.v).length, key).toBeLessThan(6000); // the store refuses a longer value
    }
    expect(fromEntries(entries)).toEqual(big);
    expect(fromEntries(JSON.parse(JSON.stringify(entries)))).toEqual(big); // after a trip through the server
  });

  it('ignores a copy that is missing, incomplete or mixed with the pieces of an older push', () => {
    expect(fromEntries({})).toBe(null);
    expect(fromEntries(null)).toBe(null);
    expect(fromEntries({ 'other.answer': { v: 3, at: 5 } })).toBe(null);
    const entries = toEntries(save({ know: Array.from({ length: 900 }, (_, i) => i) }));
    expect(entries['world:n'].v).toBeGreaterThan(1);
    const { 'world:1': gone, ...missing } = entries;
    expect(gone).toBeTruthy();
    expect(fromEntries(missing)).toBe(null);
    expect(fromEntries({ ...entries, 'world:0': { ...entries['world:0'], at: entries['world:0'].at - 1 } })).toBe(null);
    // a shorter save pushed later leaves the old higher pieces behind: they are not read
    const short = toEntries(save({ at: 1763380009999 }));
    expect(fromEntries({ ...entries, ...short })).toEqual(save({ at: 1763380009999 }));
  });

  it('plays from the server copy only when it is strictly newer than the browser copy', () => {
    expect(serverWins(null, save())).toBe(true); // a new device
    expect(serverWins(save({ at: 10 }), save({ at: 11 }))).toBe(true);
    expect(serverWins(save({ at: 11 }), save({ at: 11 }))).toBe(false);
    expect(serverWins(save({ at: 12 }), save({ at: 11 }))).toBe(false);
    expect(serverWins(save(), null)).toBe(false);
    expect(serverWins({ v: 1, stage: 2 }, save())).toBe(true); // a save from before the sync has no time: the server's wins
  });
});
