import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CLAIM_KINDS, verifyClaim } from './claims';

const api = (path) => fileURLToPath(new URL(`../../../../../../api/${path}`, import.meta.url));
const FIXTURE = JSON.parse(readFileSync(api('tests/Fixtures/game-claims.json'), 'utf8'));
const SERVER = readFileSync(api('app/Domain/GameWorld/ClaimVerifier.php'), 'utf8');

describe('the claims of a game answer — one rule for the browser and for the server', () => {
  it('knows exactly the kinds the server knows', () => {
    const list = /const KINDS = \[([^\]]+)\]/.exec(SERVER)[1];
    const server = [...list.matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1]);
    expect([...CLAIM_KINDS].sort()).toEqual(server.sort());
  });

  it('gives the SAME verdict as the server on the shared fixture, and every kind has rows of both verdicts', () => {
    expect(FIXTURE.cases.length).toBeGreaterThan(30);
    for (const c of FIXTURE.cases) expect(verifyClaim(c.claim), JSON.stringify(c.claim)).toBe(c.ok);
    for (const kind of CLAIM_KINDS) {
      const rows = FIXTURE.cases.filter((c) => c.claim.kind === kind);
      expect(
        rows.some((c) => c.ok),
        `${kind}: a row that is true`,
      ).toBe(true);
      expect(
        rows.some((c) => !c.ok),
        `${kind}: a row that is false`,
      ).toBe(true);
    }
  });

  it('a common divisor OTHER THAN 1 (`notOne: true`) refuses 1; only the boolean true asks for it, as on the server', () => {
    const c = { kind: 'commonDivisor', a: 85, b: 119 };
    expect(verifyClaim({ ...c, d: 1 })).toBe(true);
    expect(verifyClaim({ ...c, d: 1, notOne: true })).toBe(false);
    expect(verifyClaim({ ...c, d: 17, notOne: true })).toBe(true);
    expect(verifyClaim({ ...c, d: 1, notOne: 1 })).toBe(true);
  });

  it('a fraction with `op` states the calculation: its result a/b is computed from x/y op z/w, never taken as sent', () => {
    const c = { kind: 'fraction', op: '+', x: 5, y: 12, z: 1, w: 12, p: 1, q: 2 };
    expect(verifyClaim({ ...c, a: 6, b: 12 })).toBe(true);
    expect(verifyClaim({ ...c, a: 3, b: 6 })).toBe(true); // a/b may be sent in any equal writing
    // a wrong result sent by the browser, with the student's p/q equal to it: true without `op`, false with it
    expect(verifyClaim({ kind: 'fraction', a: 7, b: 12, p: 7, q: 12 })).toBe(true);
    expect(verifyClaim({ ...c, a: 7, b: 12, p: 7, q: 12 })).toBe(false);
    expect(verifyClaim({ ...c, op: '*', x: 4, y: 9, z: 3, w: 8, a: 12, b: 72, p: 1, q: 6 })).toBe(true);
    expect(verifyClaim({ ...c, op: '-', x: 1, y: 10, z: 7, w: 10, a: 6, b: 10, p: 3, q: 5 })).toBe(false); // negative
    // an op that is not one of the three strings is never right — an array is not '+' (the server reads it strictly)
    expect(verifyClaim({ ...c, a: 6, b: 12, op: ['+'] })).toBe(false);
    expect(verifyClaim({ ...c, a: 6, b: 12, op: 'constructor' })).toBe(false);
  });

  it('never trusts a claim it does not understand', () => {
    expect(verifyClaim(null)).toBe(false);
    expect(verifyClaim({})).toBe(false);
    expect(verifyClaim({ kind: 'toString', a: 1, b: 1 })).toBe(false);
    expect(verifyClaim({ kind: 'division', a: 143, b: 0, q: 0, r: 143, fits: false })).toBe(false);
  });
});
