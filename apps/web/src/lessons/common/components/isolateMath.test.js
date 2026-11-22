import { describe, it, expect } from 'vitest';
import { isolateMath, stripIsolates } from './isolateMath';

const L = '⁦', P = '⁩';

describe('isolateMath', () => {
  it('isolates a calculation inside an Arabic sentence', () => {
    expect(isolateMath('الباقي: 268 = 54 × 4 + 52 إذن').text).toBe(`الباقي: ${L}268 = 54 × 4 + 52${P} إذن`);
  });

  it('leaves lone numbers alone and is idempotent', () => {
    expect(isolateMath('يلزم 5 حافلات').text).toBe('يلزم 5 حافلات');
    const once = isolateMath('268 = 54 × 5 - 2').text;
    expect(isolateMath(once).text).toBe(once);
    expect(stripIsolates(once)).toBe('268 = 54 × 5 - 2');
  });

  it('keeps the cursor on the same character', () => {
    const raw = 'إذن 268 = 54';
    const at = raw.indexOf('54'); // curseur avant « 54 »
    const { text, cursor } = isolateMath(raw, at);
    expect(text.slice(cursor, cursor + 2)).toBe('54');
    // En fin de calcul, le curseur reste DANS l'isolant : on continue d'y taper.
    const end = isolateMath(raw, raw.length);
    expect(end.cursor).toBe(end.text.length - 1);
    expect(end.text[end.cursor]).toBe(P);
    // Après du texte arabe, il est bien à la fin.
    const prose = isolateMath('إذن 268 = 54 حافلة');
    expect(prose.cursor).toBe(prose.text.length);
  });
});
