import { describe, expect, it } from 'vitest';
import { keyOf, makeRound, plain, rat, surd, valueTokens } from './cards.js';
import { LEVELS, SUB_LEVELS } from './levels.js';

/**
 * Un évaluateur INDÉPENDANT de ce qui est AFFICHÉ : l'écriture d'une carte est
 * relue comme une expression (× ÷ − , % fractions √ exposants x sin cos tan
 * PGCD PPCM, et « = » pour une équation) et calculée en flottants. Le paquet ne
 * peut donc pas déclarer « égale » une carte qui ne l'est pas à l'écran.
 */
function raw(tokens) {
  return tokens.map((t) => {
    if (typeof t === 'string') return t;
    if (t.frac) return `((${t.frac[0]})/(${t.frac[1]}))`;
    if (t.sqrt) return `Math.sqrt(${t.sqrt})`;
    return `**(${t.sup})`;
  }).join('');
}

function toJs(tokens) {
  return raw(tokens)
    .replace(/PGCD\(/g, 'G(').replace(/PPCM\(/g, 'L(').replace(/ ; /g, '#')
    .replace(/(sin|cos|tan) (\d+)°/g, 'Math.$1($2*Math.PI/180)')
    .replace(/√(\d+)/g, 'Math.sqrt($1)')
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/#/g, ',')
    .replace(/%/g, '/100')
    .replace(/(\d|\)|x)\s*(?=\(|x|M|G|L)/g, '$1*');
}

const G = (a, b) => { let x = a; let y = b; while (y) [x, y] = [y, x % y]; return x; };
const L = (a, b) => (a * b) / G(a, b);

function fn(js) {
  // eslint-disable-next-line no-new-func
  return new Function('x', 'G', 'L', `return (${js});`);
}
const at = (tokens, x) => fn(toJs(tokens))(x, G, L);

function solve(tokens) {
  const [lhs, rhs] = toJs(tokens).split('=');
  const f = (x) => fn(lhs)(x, G, L) - fn(rhs)(x, G, L);
  const f0 = f(0);
  const slope = f(1) - f0;
  expect(Math.abs(slope), `${plain(tokens)} n'est pas une équation du premier degré`).toBeGreaterThan(1e-12);
  expect(Math.abs(f(2) - f0 - 2 * slope)).toBeLessThan(1e-9);
  return -f0 / slope;
}

const close = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
const sameValue = (a, b) => [2, 5].every((x) => close(at(a, x), at(b, x)));

/** La valeur LUE d'une carte, selon le mode de la manche, comparée à la cible. */
function readsAs(round, tokens) {
  if (round.mode === 'solution') return close(solve(tokens), at(round.target.tokens, 0));
  if (round.mode === 'at') return close(at(tokens, round.at), at(round.target.tokens, 0));
  return sameValue(tokens, round.target.tokens);
}
function keepsItsValue(round, c) {
  const v = valueTokens(c.value);
  if (round.mode === 'solution') return close(solve(c.tokens), at(v, 0));
  if (round.mode === 'at') return close(at(c.tokens, round.at), at(v, 0));
  return sameValue(c.tokens, v);
}

const SEEDS = Array.from({ length: 10 }, (_, i) => 1000 + i * 7919);
const ROUNDS = [0, 1, 2, 3];

describe('sniper card deck — 50 levels × 3 sub-levels', () => {
  it('simplifies exact values', () => {
    expect(keyOf(surd(1, 50))).toBe(keyOf(surd(5, 2)));
    expect(keyOf(surd(2, 9))).toBe(keyOf(rat(6)));
    expect(keyOf(rat(6, 8))).toBe(keyOf(rat(3, 4)));
    expect(plain(valueTokens(surd(1, 12)))).toBe('2√3');
    expect(plain(valueTokens(surd(rat(1, 2), 3)))).toBe('√3/2');
  });

  it('has 50 levels, each in three sub-levels', () => {
    expect(LEVELS).toHaveLength(50);
    expect(SUB_LEVELS).toBe(3);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(50);
  });

  for (const level of LEVELS) {
    it(`level ${level.n} « ${level.id} »: every card reads as what it SHOWS, 8 distinct cards, 3–4 equal`, () => {
      for (let sub = 1; sub <= SUB_LEVELS; sub += 1) {
        for (const seed of SEEDS) {
          for (const k of ROUNDS) {
            const round = makeRound(seed, k, { level: level.n, sub });
            const where = `(level ${level.n}${'ابج'[sub - 1]}, seed ${seed}, round ${k}, target ${plain(round.target.tokens)})`;
            expect(round.cards, where).toHaveLength(8);
            expect(new Set(round.cards.map((c) => c.text)).size, where).toBe(8);
            const equal = round.cards.filter((c) => c.equal).length;
            expect(equal, where).toBeGreaterThanOrEqual(3);
            expect(equal, where).toBeLessThanOrEqual(4);
            expect(round.cards.map((c) => c.text), where).not.toContain(plain(round.target.tokens));
            for (const c of round.cards) {
              expect(readsAs(round, c.tokens), `${plain(c.tokens)} ${where}`).toBe(c.equal);
              expect(keepsItsValue(round, c), `${plain(c.tokens)} ≠ ${plain(valueTokens(c.value))} ${where}`).toBe(true);
            }
          }
        }
      }
    });
  }

  it('is the same round for the same seed, round and level', () => {
    expect(makeRound(7, 5, { level: 33, sub: 2 })).toEqual(makeRound(7, 5, { level: 33, sub: 2 }));
    expect(makeRound(7, 5, { level: 33, sub: 2 }).target.key).not.toBe(undefined);
  });
});
