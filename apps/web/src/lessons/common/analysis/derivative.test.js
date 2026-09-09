import { describe, it, expect } from 'vitest';
import {
  secantSlope, riseRun, numericDerivative, tangentLine, tangentAt,
  secantLine, lineEquation, signTable,
} from './derivative';

const sq = (x) => x * x;
const cube = (x) => x ** 3;
const inv = (x) => 1 / x;
const sqrt = (x) => Math.sqrt(x);

describe('secantSlope', () => {
  it('rend la pente EXACTE d’une affine, pour tout h — c’est la vérification de base', () => {
    const f = (x) => 3 * x - 5;
    for (const h of [2, 1, 0.5, 0.1, 0.01, -1, -0.25]) {
      expect(secantSlope(f, 4, h)).toBeCloseTo(3, 12);
    }
  });

  it('sur x², le taux entre a et a+h vaut exactement 2a + h', () => {
    for (const a of [-2, 0, 1, 3.5]) {
      for (const h of [2, 1, 0.5, 0.25, 0.1, 0.05, 0.01]) {
        expect(secantSlope(sq, a, h)).toBeCloseTo(2 * a + h, 10);
      }
    }
  });

  it('h = 0 rend NaN plutôt qu’une Infinity qui atteindrait le SVG', () => {
    expect(Number.isNaN(secantSlope(sq, 1, 0))).toBe(true);
  });
});

describe('riseRun', () => {
  it('sépare montée et avancée — la parade contre « le taux, c’est f(b) − f(a) »', () => {
    const { rise, run, slope } = riseRun(sq, 1, 0.5);
    expect(rise).toBeCloseTo(1.25, 12);   // 2,25 − 1
    expect(run).toBe(0.5);
    expect(slope).toBeCloseTo(2.5, 12);
    // La montée seule N’EST PAS la pente : c’est tout l’enjeu du module 1.
    expect(rise).not.toBeCloseTo(slope, 6);
  });
});

describe('numericDerivative (dessin seulement)', () => {
  it('retrouve les dérivées usuelles avec une précision suffisante pour tracer', () => {
    expect(numericDerivative(sq, 3)).toBeCloseTo(6, 6);
    expect(numericDerivative(cube, 2)).toBeCloseTo(12, 5);
    expect(numericDerivative(inv, 2)).toBeCloseTo(-0.25, 6);
    expect(numericDerivative(sqrt, 4)).toBeCloseTo(0.25, 6);
  });

  it('est exacte sur une affine', () => {
    expect(numericDerivative((x) => -2 * x + 7, 5)).toBeCloseTo(-2, 10);
  });
});

describe('tangentLine', () => {
  it('passe par le point de contact — l’invariant visuel de la leçon', () => {
    for (const [f, a, fp] of [[sq, 1, 2], [sq, -2, -4], [cube, 2, 12], [inv, 2, -0.25]]) {
      const t = tangentLine(f, a, fp);
      expect(t.a * a + t.b).toBeCloseTo(f(a), 10);
      expect(t.a).toBeCloseTo(fp, 10);
    }
  });

  it('sans dérivée exacte, retombe sur l’approximation et passe quand même par le point', () => {
    const t = tangentLine(sq, 3);
    expect(t.a).toBeCloseTo(6, 5);
    expect(t.a * 3 + t.b).toBeCloseTo(9, 5);
  });

  it('tangentAt donne la même droite à partir des seuls nombres', () => {
    expect(tangentAt(2, 1, 1)).toEqual(tangentLine(sq, 1, 2));
  });

  it('une tangente PEUT recouper la courbe — la conception erronée n°3', () => {
    // Tangente au cube en x = 1 : y = 3x − 2. Elle recoupe la courbe en x = −2.
    const t = tangentLine(cube, 1, 3);
    expect(t.a).toBe(3);
    expect(t.b).toBe(-2);
    expect(t.a * -2 + t.b).toBeCloseTo(cube(-2), 10);   // −8 des deux côtés
  });
});

describe('secantLine', () => {
  it('passe par A et par B', () => {
    const [a, h] = [1, 0.5];
    const s = secantLine(sq, a, h);
    expect(s.a * a + s.b).toBeCloseTo(sq(a), 10);
    expect(s.a * (a + h) + s.b).toBeCloseTo(sq(a + h), 10);
  });

  it('quand h rétrécit, la sécante tend vers la tangente — le phénomène du module 1', () => {
    const cible = tangentLine(sq, 1, 2).a;
    const ecarts = [1, 0.5, 0.25, 0.1, 0.05, 0.01].map((h) => Math.abs(secantLine(sq, 1, h).a - cible));
    // Strictement décroissants : la stabilisation est un fait, pas une impression.
    for (let i = 1; i < ecarts.length; i += 1) expect(ecarts[i]).toBeLessThan(ecarts[i - 1]);
    expect(ecarts.at(-1)).toBeLessThan(0.02);
  });
});

describe('lineEquation', () => {
  const fr = (n) => String(n).replace('.', ',').replace('-', '−');
  it('écrit comme au tableau', () => {
    expect(lineEquation({ a: 2, b: -1 }, fr)).toBe('y = 2x − 1');
    expect(lineEquation({ a: 1, b: 3 }, fr)).toBe('y = x + 3');
    expect(lineEquation({ a: -1, b: 0 }, fr)).toBe('y = −x');
    expect(lineEquation({ a: 0, b: 4 }, fr)).toBe('y = 4');
    expect(lineEquation({ a: 0, b: 0 }, fr)).toBe('y = 0');
    expect(lineEquation({ a: 3, b: -2 }, fr)).toBe('y = 3x − 2');
  });
});

describe('signTable', () => {
  it('trouve les deux changements de signe de (x−1)(x+3)', () => {
    const rows = signTable((x) => (x - 1) * (x + 3), { xMin: -5, xMax: 4 });
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.sign)).toEqual([1, -1, 1]);
    expect(rows[0].to).toBeCloseTo(-3, 6);
    expect(rows[1].to).toBeCloseTo(1, 6);
  });

  it('une fonction de signe constant donne une seule ligne', () => {
    const rows = signTable((x) => x * x + 1, { xMin: -3, xMax: 3 });
    expect(rows).toHaveLength(1);
    expect(rows[0].sign).toBe(1);
  });
});
