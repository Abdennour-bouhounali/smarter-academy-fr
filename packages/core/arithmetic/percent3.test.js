import { describe, it, expect } from 'vitest';
import * as P from './percent3.js';
import * as Lin from './linear.js';

const t = (v) => P.text(v);
describe('percent3 — le pourcentage exact', () => {
  it('un paquet vaut x/100 ; t paquets valent t % de x', () => {
    expect(t(P.packet(250))).toBe('2,5');
    expect(t(P.partOf(240, 15))).toBe('36');
    expect(t(P.partOf('75', 70))).toBe('52,5');
    expect(t(P.partOf('12,5', 8))).toBe('1');
  });
  it('le taux, le tout, la variation', () => {
    expect(t(P.rateOf(60, 150))).toBe('40');
    expect(t(P.rateOf(8, 32))).toBe('25');
    expect(t(P.rateOf(3, 8))).toBe('37,5');
    expect(t(P.wholeOf(84, 60))).toBe('140');
    expect(t(P.changed(200, 'up', 15))).toBe('230');
    expect(t(P.changed(250, 'down', 20))).toBe('200');
    expect(t(P.factor('up', 15))).toBe('1,15');
    expect(t(P.factor('down', 20))).toBe('0,8');
    expect(t(P.beforeChange(3875, 'up', 25))).toBe('3100');
    expect(t(P.changeRate(3000, 3060))).toBe('2');
    expect(t(P.changeRate(10500, 8400))).toBe('-20');
  });
  it('une hausse puis une baisse du même t % ne ramène pas au départ ; l\'ordre ne compte pas', () => {
    const c = P.chain(200, [['up', 20], ['down', 20]]);
    expect(c.values.map(t)).toEqual(['200', '240', '192']);
    expect(t(c.factor)).toBe('0,96');
    expect(t(c.rate)).toBe('-4');
    const a = P.chain(20800, [['down', 20], ['down', 10]]);
    const b = P.chain(20800, [['down', 10], ['down', 20]]);
    expect(t(a.values.at(-1))).toBe('14976');
    expect(Lin.eq(a.factor, b.factor)).toBe(true);
    expect(t(a.rate)).toBe('-28');
  });
  it('parseStock', () => {
    expect(P.parseStock('250')).toEqual(Lin.frac(250));
    expect(t(P.parseStock('٧٥٫٥'))).toBe('75,5');
    expect(P.parseStock('0')).toBeNull();
    expect(P.parseStock('-3')).toBeNull();
    expect(P.parseStock('12345')).toBeNull();
    expect(P.parseStock('1,234')).toBeNull();
    expect(P.parseStock('abc')).toBeNull();
  });
  it('refuse un sens inconnu', () => { expect(() => P.factor('left', 3)).toThrow(); });
});
