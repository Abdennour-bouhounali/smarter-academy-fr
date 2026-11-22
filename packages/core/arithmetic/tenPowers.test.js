import { describe, it, expect } from 'vitest';
import * as T from './tenPowers.js';
import { ratText } from './powers.js';

describe('tenPowers — décimaux exacts', () => {
  it('parseDec lit les écritures du manuel et rejette le reste', () => {
    expect(T.parseDec('1 000 000')).toEqual({ m: 1n, e: 6 });
    expect(T.parseDec('1 000')).toEqual({ m: 1n, e: 3 });
    expect(T.parseDec('0,000001')).toEqual({ m: 1n, e: -6 });
    expect(T.parseDec('0.0001')).toEqual({ m: 1n, e: -4 });
    expect(T.parseDec('45 × 10^3')).toEqual({ m: 45n, e: 3 });
    expect(T.parseDec('3,52 × 10^5')).toEqual({ m: 352n, e: 3 });
    expect(T.parseDec('−6,5 × 10^7')).toEqual({ m: -65n, e: 6 });
    expect(T.parseDec('7 × 10^{-2}')).toEqual({ m: 7n, e: -2 });
    expect(T.parseDec('10^-4')).toEqual({ m: 1n, e: -4 });
    expect(T.parseDec('٠٫٠١')).toEqual({ m: 1n, e: -2 });
    for (const bad of ['', 'abc', '1 0', '1,0 5', '12 34', '× 10^3', '1,2,3', '--3']) expect(T.parseDec(bad), bad).toBeNull();
  });

  it('decText groupe la partie entière seulement (U+00A0), signe typographique', () => {
    expect(T.decText({ m: 1n, e: 6 })).toBe('1 000 000');
    expect(T.decText({ m: 1n, e: 6 }, { group: false })).toBe('1000000');
    expect(T.decText({ m: 1n, e: -6 })).toBe('0,000001');
    expect(T.decText({ m: 45n, e: 3 })).toBe('45 000');
    expect(T.decText({ m: -65n, e: 6 })).toBe('−65 000 000');
    expect(T.decText({ m: 12345n, e: -2 })).toBe('123,45');
    expect(T.decText(T.norm(0n))).toBe('0');
  });

  it('aller-retour parseDec ∘ decText sur toutes les puissances de 10 de −12 à 12 et sur les k × 10^p', () => {
    for (let n = -12; n <= 12; n += 1) {
      expect(T.parseDec(T.pow10Text(n)), String(n)).toEqual(T.pow10(n));
      expect(T.parseDec(T.pow10Text(n, { group: false })), String(n)).toEqual(T.pow10(n));
    }
    for (const k of [1, 2, 7, 25, 36, 999, 12345, 54321]) {
      for (let p = -9; p <= 9; p += 1) {
        const v = T.timesPow10(T.parseDec(String(k)), p);
        expect(T.parseDec(T.decText(v)), `${k}e${p}`).toEqual(v);
        expect(T.parseDec(`${k} × 10^${p}`), `${k} × 10^${p}`).toEqual(v);
      }
    }
  });

  it('norm, compareDec, toRat', () => {
    expect(T.norm(1200n, -2)).toEqual({ m: 12n, e: 0 });
    expect(T.compareDec(T.parseDec('0,001'), T.parseDec('0,01'))).toBe(-1);
    expect(T.compareDec(T.parseDec('1 000'), T.parseDec('10^3'))).toBe(0);
    expect(T.compareDec(T.parseDec('-2'), T.parseDec('-3'))).toBe(1);
    expect(ratText(T.toRat(T.parseDec('0,0001')))).toBe('1/10000');
    expect(ratText(T.toRat(T.parseDec('45 × 10^3')))).toBe('45000');
  });
});

describe('tenPowers — puissances de 10', () => {
  it('exponentOfPow10', () => {
    expect(T.exponentOfPow10('100 000')).toBe(5);
    expect(T.exponentOfPow10('0,0001')).toBe(-4);
    expect(T.exponentOfPow10('1')).toBe(0);
    expect(T.exponentOfPow10('10')).toBe(1);
    expect(T.exponentOfPow10('120')).toBeNull();
    expect(T.exponentOfPow10('6 000 000')).toBeNull();
    expect(T.exponentOfPow10('-100')).toBeNull();
    expect(T.exponentOfPow10('abc')).toBeNull();
    expect(T.exponentOfPow10('0,0000001')).toBe(-7);
  });

  it('les comptes : zéros, rang du 1, zéros avant le 1', () => {
    expect(T.zerosOf(15)).toBe(15);
    expect(T.rankOfOne(-14)).toBe(14);
    expect(T.zerosBeforeOne(-7)).toBe(7);
    expect(T.zerosAfterComma(-7)).toBe(6);
    // contrôle contre l'écriture décimale elle-même
    for (let n = 1; n <= 12; n += 1) expect(T.pow10Text(n, { group: false }).length - 1, String(n)).toBe(T.zerosOf(n));
    for (let n = -12; n <= -1; n += 1) {
      const s = T.pow10Text(n, { group: false });
      expect(s.indexOf('1') - 1 - 1 + 1, String(n)).toBe(T.zerosBeforeOne(n)); // « 0, » + zéros : position du 1 − virgule = rang
      expect(s.length - 2, String(n)).toBe(T.rankOfOne(n));
      expect(s.slice(2).indexOf('1'), String(n)).toBe(T.zerosAfterComma(n));
    }
    expect(() => T.zerosOf(-1)).toThrow();
    expect(() => T.rankOfOne(0)).toThrow();
  });

  it('noms et préfixes', () => {
    expect(T.pow10Name(3)).toBe('ألف');
    expect(T.pow10Name(5)).toBe('مئة ألف');
    expect(T.pow10Name(9)).toBe('مليار');
    expect(T.pow10Name(11)).toBe('مئة مليار');
    expect(T.pow10Name(12)).toBe('ألف مليار');
    expect(T.pow10Name(-3)).toBe('جزء من ألف');
    expect(T.pow10Name(-6)).toBe('جزء من مليون');
    expect(T.pow10Name(-9)).toBe('جزء من مليار');
    expect(T.pow10Name(13)).toBeNull();
    for (let n = -12; n <= 12; n += 1) expect(T.nameToExponent(T.pow10Name(n)), String(n)).toBe(n);
    expect(T.nameToExponent('مائة ألف')).toBe(5);
    expect(T.nameToExponent('عشرين')).toBeNull();
    expect(T.prefixOf(3)).toMatchObject({ symbol: 'k', name: 'كيلو' });
    expect(T.prefixOf(-9).name).toBe('نانو');
    expect(T.prefixOf(12).name).toBe('تيرا');
    expect(T.prefixOf(-12).name).toBe('بيكو');
    expect(T.prefixOf(4)).toBeNull();
    expect(T.PREFIXES).toHaveLength(13);
    expect(T.prefixByName('ميكرو').exp).toBe(-6);
  });
});

describe('tenPowers — le مفكوك', () => {
  it('3985, 0,407, 5 030,07 : rangs vides absents', () => {
    expect(T.expanded(T.parseDec('3985'))).toEqual([{ digit: 3, exp: 3 }, { digit: 9, exp: 2 }, { digit: 8, exp: 1 }, { digit: 5, exp: 0 }]);
    expect(T.expandedTex(T.parseDec('0,407'))).toBe('4\\times10^{-1}+7\\times10^{-3}');
    expect(T.expandedTex(T.parseDec('5030,07'))).toBe('5\\times10^{3}+3\\times10^{1}+7\\times10^{-2}');
    expect(T.expandedTex(T.parseDec('7 040 300'))).toBe('7\\times10^{6}+4\\times10^{4}+3\\times10^{2}');
    expect(() => T.expanded(T.parseDec('-3'))).toThrow();
  });
  it('la somme du développement redonne le nombre (tous les décimaux de 1 à 5 chiffres significatifs testés)', () => {
    for (const s of ['3985', '0,407', '5030,07', '40075', '1207,035', '0,0509', '60 000 000', '0,000304']) {
      const v = T.parseDec(s);
      expect(T.sumExpanded(T.expanded(v)), s).toEqual(v);
    }
  });
  it('timesPow10 : 36 millions, 25 micromètres', () => {
    expect(T.decText(T.timesPow10(T.parseDec('36'), 6))).toBe('36 000 000');
    expect(T.decText(T.timesPow10(T.parseDec('25'), -6))).toBe('0,000025');
  });
});

describe('tenPowers — leçon 2 : règles, unités, k × 10ᵖ', () => {
  it('les trois règles et la chaîne', () => {
    expect(T.productExp(3, 3)).toBe(6);
    expect(T.quotientExp(3, -2)).toBe(5);
    expect(T.powerExp(-2, 4)).toBe(-8);
    expect(T.chainExp([{ op: '×', n: 6 }, { op: '÷', n: -3 }, { op: '×', n: -8 }])).toBe(1);
    expect(T.chainExp([{ op: '×', n: 5 }, { op: '×', n: -2 }, { op: '÷', n: 4 }])).toBe(-1);
  });
  it('unitColumns : longueur, aire, volume', () => {
    expect(T.unitColumns('km', 'mm', 1)).toBe(6);
    expect(T.unitColumns('km', 'cm', 1)).toBe(5);
    expect(T.unitColumns('mm', 'um', 1)).toBe(3);
    expect(T.unitColumns('km', 'm', 2)).toBe(6);
    expect(T.unitColumns('m', 'cm', 3)).toBe(6);
    expect(T.unitColumns('mm', 'm', 2)).toBe(-6);
    expect(T.unitColumns('m', 'dm', 3)).toBe(3);
    expect(() => T.unitColumns('km', 'x')).toThrow();
  });
  it('mulSci / divSci non normalisés', () => {
    const p = T.mulSci([{ k: 7, p: 3 }, { k: 3, p: 9 }]);
    expect(T.decText(p.k)).toBe('21'); expect(p.p).toBe(12);
    const q = T.divSci({ k: 9, p: -4 }, { k: 3, p: 2 });
    expect(T.decText(q.k)).toBe('3'); expect(q.p).toBe(-6);
    const r = T.divSci({ k: 1, p: 0 }, { k: 8, p: 0 });
    expect(T.decText(r.k)).toBe('0,125');
    expect(T.divSci({ k: 1, p: 0 }, { k: 3, p: 0 })).toBeNull();
    const m = T.mulSci([{ k: '0,4', p: -3 }, { k: 50, p: 6 }]);
    expect(T.decText(m.k)).toBe('20'); expect(m.p).toBe(3);
    const d = T.divSci({ k: '0,12', p: 0 }, { k: 3, p: 4 });
    expect(T.decText(d.k)).toBe('0,04');
  });

  it('scientific / isScientific / bracketOf / cellOf', () => {
    expect(T.scientific('352 000')).toMatchObject({ a: '3,52', n: 5 });
    expect(T.scientific('0,000608')).toMatchObject({ a: '6,08', n: -4 });
    expect(T.scientific('35,2 × 10^4')).toMatchObject({ a: '3,52', n: 5 });
    expect(T.scientific('0,048 × 10^-3')).toMatchObject({ a: '4,8', n: -5 });
    expect(T.scientific('−65 000 000')).toMatchObject({ a: '−6,5', n: 7 });
    expect(T.scientific('1')).toMatchObject({ a: '1', n: 0 });
    expect(T.scientific('10')).toMatchObject({ a: '1', n: 1 });
    expect(T.scientific('9,99 × 10^8')).toMatchObject({ a: '9,99', n: 8 });
    expect(() => T.scientific('0')).toThrow();
    expect(T.isScientific('2,65', 2)).toBe(true);
    expect(T.isScientific('26,5', 1)).toBe(false);
    expect(T.isScientific('0,72', 5)).toBe(false);
    expect(T.isScientific('10', 3)).toBe(false);
    expect(T.isScientific('9,99', 8)).toBe(true);
    expect(T.isScientific('1', -6)).toBe(true);
    expect(T.bracketOf('265')).toBe(2);
    expect(T.bracketOf('0,0001')).toBe(-4);
    expect(T.bracketOf('1 000')).toBe(3);
    expect(T.bracketOf('999')).toBe(2);
    expect(T.bracketOf('0,00099')).toBe(-4);
    expect(T.cellOf('265')).toBe(2);
    expect(T.cellOf('0,0006')).toBe(6);
  });
  it('orderOfMagnitude : demi vers le haut, retenue 9,7 → 10', () => {
    expect(T.orderOfMagnitude('265')).toEqual({ a1: 3, n1: 2 });
    expect(T.orderOfMagnitude('1 950 000')).toEqual({ a1: 2, n1: 6 });
    expect(T.orderOfMagnitude('0,0001')).toEqual({ a1: 1, n1: -4 });
    expect(T.orderOfMagnitude('0,000786')).toEqual({ a1: 8, n1: -4 });
    expect(T.orderOfMagnitude('9,85 × 10^5')).toEqual({ a1: 1, n1: 6 });
    expect(T.orderOfMagnitude('9,7 × 10^3')).toEqual({ a1: 1, n1: 4 });
    expect(T.orderOfMagnitude('2,5 × 10^-4')).toEqual({ a1: 3, n1: -4 });
    expect(T.orderOfMagnitude('2,49 × 10^-4')).toEqual({ a1: 2, n1: -4 });
    expect(T.orderOfMagnitude('7,62 × 10^9')).toEqual({ a1: 8, n1: 9 });
    expect(T.orderOfMagnitude('4,5 × 10^1')).toEqual({ a1: 5, n1: 1 });
  });
  it('logPos : sur l’échelle des décades, pour le dessin', () => {
    expect(T.logPos('1000')).toBeCloseTo(3, 12);
    expect(T.logPos('265')).toBeCloseTo(Math.log10(265), 12);
    expect(T.logPos('0,0006')).toBeCloseTo(-4 + Math.log10(6), 12);
  });
  it('sciTex', () => {
    expect(T.sciTex('3,52', 5)).toBe('3{,}52\\times10^{5}');
    expect(T.sciTex('-6,5', -7)).toBe('−6{,}5\\times10^{-7}');
  });
});
