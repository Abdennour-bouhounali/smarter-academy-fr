import { describe, it, expect } from 'vitest';
import { frac, fracText } from './linear.js';
import { eq2 } from './linearSystem.js';
import {
  affine, affineLatex, kindOf, classifyRule, imageOf, antecedentOf, onLine, direction, yIntercept, xIntercept,
  rateOfChange, fromTwoPoints, interceptFrom, lineFromEquation, intersect, comparePlans, cheapestAt, stepFrom,
} from './affine.js';

const T = (p) => fracText(p);

describe('affine — lire et nommer (unité 7, docs/sources/4am/unit7/extraction.json)', () => {
  it('lit les écritures du manuel', () => {
    expect(affineLatex(affine('3/2x+1'))).toBe('\\dfrac{3}{2}x + 1');
    expect(affineLatex(affine('2+3x'))).toBe('3x + 2');
    expect(affineLatex(affine('-x/2+25'))).toBe('-\\dfrac{1}{2}x + 25');
    expect(affineLatex(affine('f(x)=185x+35000'))).toBe('185x + 35000');
    expect(affineLatex(affine(-2, 1))).toBe('-2x + 1');
  });
  it('نشاط 2 : quatre fonctions affines, deux qui ne le sont pas', () => {
    expect(['3x^2+1', '-2x+1', '5x', 'x/2-1', '2+3x', '1/x-3'].map(classifyRule))
      .toEqual(['other', 'affine', 'linear', 'affine', 'affine', 'other']);
    expect(classifyRule('7')).toBe('constant');
  });
  it('une linéaire est aussi affine ; une constante aussi', () => {
    expect(kindOf(affine('5x'))).toEqual({ affine: true, linear: true, constant: false });
    expect(kindOf(affine('-4'))).toEqual({ affine: true, linear: false, constant: true });
    expect(kindOf(affine('0'))).toEqual({ affine: true, linear: true, constant: true });
  });
  it('أستعدّ 4 : 1/3 x + 1 + x + 2 = 4/3 x + 3 n’est pas linéaire', () => {
    expect(classifyRule('1/3x+1+x+2')).toBe('affine');
  });
});

describe('affine — image et antécédent', () => {
  const S = affine('185x+35000'); // نشاط 1
  it('نشاط 1 : le tableau des salaires', () => {
    expect([5, 8, 10, 12, 15].map((h) => T(imageOf(S, h)))).toEqual(['35925', '36480', '36850', '37220', '37775']);
  });
  it('نشاط 4 : 7 matchs → 3400 DA ; 4800 DA → 14 matchs ; 2000 → 0', () => {
    const f = affine('200x+2000');
    expect(T(imageOf(f, 7))).toBe('3400');
    expect(T(antecedentOf(f, 4800).x)).toBe('14');
    expect(T(antecedentOf(f, 2000).x)).toBe('0');
    expect([1, 4, 6, 9, 11, 15].map((v) => T(imageOf(f, v)))).toEqual(['2200', '2800', '3200', '3800', '4200', '5000']);
  });
  it('تحدّ : 10 °C → 50 °F', () => {
    expect(T(imageOf(affine('1,8x+32'), 10))).toBe('50');
  });
  it('une constante n’a pas d’antécédent unique', () => {
    expect(antecedentOf(affine('3'), 5)).toEqual({ kind: 'none' });
    expect(antecedentOf(affine('3'), 3)).toEqual({ kind: 'all' });
    expect(T(antecedentOf(affine('-2x+1'), 4).x)).toBe('-3/2');
  });
});

describe('affine — la droite', () => {
  it('نشاط 3 : (d′) est (d) montée de 1 ; (0 ; 1) est sur (d′)', () => {
    const g = affine('3/2x'); const f = affine('3/2x+1');
    expect(T(imageOf(g, 2))).toBe('3');
    expect(T(imageOf(f, 2))).toBe('4');
    expect(onLine(f, 0, 1)).toBe(true);
    expect(T(yIntercept(f).y)).toBe('1');
  });
  it('sens et intersection avec l’axe des abscisses', () => {
    expect(direction(affine('-x+43'))).toBe('down');
    expect(direction(affine('2'))).toBe('flat');
    expect(T(xIntercept(affine('43-x')).x)).toBe('43');
    expect(T(xIntercept(affine('25-x/2')).x)).toBe('50');
    expect(xIntercept(affine('2'))).toBe(null);
  });
  it('l’escalier : 1 à droite, a en haut', () => {
    const s = stepFrom(affine('3/2x+1'), 0);
    expect([T(s.to.x), T(s.to.y), T(s.dy)]).toEqual(['1', '5/2', '3/2']);
  });
});

describe('affine — تناسب التغيّرات et deux points', () => {
  it('نشاط 4 : les trois quotients valent 200', () => {
    const f = affine('200x+2000');
    expect([[4, 1], [1, 0], [6, 4]].map(([p, q]) => T(rateOfChange(f, p, q)))).toEqual(['200', '200', '200']);
  });
  it('retrouve f depuis deux nombres et leurs images', () => {
    const f = fromTwoPoints(1, 2200, 4, 2800);
    expect([T(f.a), T(f.b)]).toEqual(['200', '2000']);
    const c = fromTwoPoints(10, 50, 30, 86); // تحدّ
    expect([T(c.a), T(c.b)]).toEqual(['9/5', '32']);
    expect(T(interceptFrom('3/2', 2, 4))).toBe('1');
    expect(() => fromTwoPoints(2, 1, 2, 5)).toThrow();
    expect(() => rateOfChange(affine('x'), 3, 3)).toThrow();
  });
});

describe('affine — deux droites (نشاط 5) et deux tarifs', () => {
  it('écrit chaque équation y = ax + b et lit le point commun (36 ; 7)', () => {
    const f = lineFromEquation(eq2('x+y=43'));
    const g = lineFromEquation(eq2('100x+200y=5000'));
    expect([affineLatex(f), affineLatex(g)]).toEqual(['-x + 43', '-\\dfrac{1}{2}x + 25']);
    const r = intersect(f, g);
    expect([r.kind, T(r.x), T(r.y)]).toEqual(['unique', '36', '7']);
    expect(lineFromEquation(eq2('2x=6'))).toBe(null);
  });
  it('parallèles : aucune solution ; confondues : une infinité', () => {
    expect(intersect(affine('2x+1'), affine('2x-3')).kind).toBe('parallel');
    expect(intersect(affine('2x+1'), affine('1+2x')).kind).toBe('same');
  });
  it('compare deux tarifs : avant 10 séances le ticket, après la carte', () => {
    const carte = affine('1500+100x'); const ticket = affine('250x');
    const c = comparePlans(carte, ticket);
    expect([c.kind, T(c.x), T(c.y), c.cheaperBefore, c.cheaperAfter]).toEqual(['cross', '10', '2500', 'g', 'f']);
    expect(comparePlans(affine('2x+5'), affine('2x+1'))).toEqual({ kind: 'parallel', cheaper: 'g' });
    expect(cheapestAt([carte, ticket], 4)).toEqual([1]);
    expect(cheapestAt([carte, ticket], 10)).toEqual([0, 1]);
    expect(cheapestAt([carte, ticket], frac(12))).toEqual([0]);
  });
});
