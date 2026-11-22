import { describe, expect, it } from 'vitest';
import { qrMatrix, qrPath } from './QrCode';

const URL = 'https://smarter-academy.com/w/AbCdEfGhIjKlMnOpQrStUvWxYz012345';

describe('QR du رابط الوليّ', () => {
  it('encodes a parent link into a square matrix with the three finder patterns', () => {
    const m = qrMatrix(URL);
    const n = m.length;
    expect(n).toBeGreaterThanOrEqual(25);
    expect(m.every((row) => row.length === n)).toBe(true);
    // Les trois carrés de repérage : coins sombres, anneau clair, cœur sombre.
    for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      expect(m[r][c]).toBe(true);
      expect(m[r + 6][c + 6]).toBe(true);
      expect(m[r + 1][c + 1]).toBe(false);
      expect(m[r + 3][c + 3]).toBe(true);
    }
  });

  it('is deterministic and draws one path segment per dark run', () => {
    expect(qrMatrix(URL)).toEqual(qrMatrix(URL));
    expect(qrPath([[true, true, false, true]])).toBe('M0 0h2v1h-2zM3 0h1v1h-1z');
  });
});
