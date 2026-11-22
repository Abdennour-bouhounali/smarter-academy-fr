import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './ratioRide';

/**
 * ratio-ride — la logique RÉELLE du lab (celle que RatioRide.jsx importe), sur les tarifs des deux
 * niveaux (levels.js) : 15x (15 DA la minute) et 10x + 50 (50 DA de déverrouillage + 10 DA la minute).
 */
const rec = (s, ...xs) => xs.reduce((acc, x) => L.record(acc, x), s);
const txt = (p) => Lin.fracText(p);

describe('ratio-ride — tarifs et tableau', () => {
  it('lit les tarifs comme le manuel (rule) : 15x linéaire, 10x + 50 affine', () => {
    const s = L.init({ plans: '15x|10x+50' });
    expect(s.plans.map((p) => [p.id, p.linear])).toEqual([['A', true], ['B', false]]);
    expect(s.range).toEqual({ min: 0, max: 20 });
    expect(L.init({ plans: '15x' }).range).toEqual({ min: 0, max: 10 });
    expect(txt(L.price(s, 'A', 7))).toBe('105');
    expect(txt(L.price(s, 'B', 0))).toBe('50');
    expect(L.planTex(s.plans[0])).toBe('y = 15 \\times x');
    expect(L.planTex(s.plans[1])).toBe('y = 10 \\times x + 50');
    expect(() => L.init({ plans: 'x^2' })).toThrow();
    expect(() => L.init({ plans: '1x|2x|3x' })).toThrow();
  });

  it('enregistre des colonnes triées, refuse un doublon et un tableau plein', () => {
    let s = rec(L.init({ plans: '15x' }), 4, 2, 4);
    expect(s.columns).toEqual([2, 4]);
    expect(s.last.kind).toBe('dup');
    s = rec(s, 6, 8, 10, 1);
    expect(s.columns).toHaveLength(L.MAX_COLUMNS);
    expect(s.last.kind).toBe('full');
    expect(L.clear(s).columns).toEqual([]);
  });

  it('les quotients sont exacts : 15 partout pour 15x ; 10 + 50/x pour le forfait', () => {
    const s = rec(L.init({ plans: '15x|10x+50' }), 1, 3, 4);
    const a = L.table(s, 'A');
    expect(a.ratios.map(txt)).toEqual(['15', '15', '15']);
    expect(a.proportional).toBe(true);
    const b = L.table(s, 'B');
    expect(b.ratios.map(txt)).toEqual(['60', '80/3', '45/2']);
    expect(b.proportional).toBe(false);
    expect(L.numTex(b.ratios[1])).toBe('\\dfrac{80}{3}');
    expect(L.numTex(b.ratios[2])).toBe('22{,}5');
  });
});

describe('ratio-ride — juger un tableau (la résistance)', () => {
  it('« تناسبي » sur le forfait est refusé en montrant deux quotients différents', () => {
    const s = L.claim(rec(L.init({ plans: '15x|10x+50' }), 1, 5), 'B', 'yes');
    expect(s.last.kind).toBe('yesRefused');
    expect(s.last.witness.kind).toBe('differ');
    expect(L.quotientTex(s.last.witness.c1.x, s.last.witness.c1.y, s.last.witness.c1.r)).toBe('\\dfrac{60}{1} = 60');
    expect(L.quotientTex(s.last.witness.c2.x, s.last.witness.c2.y, s.last.witness.c2.r)).toBe('\\dfrac{100}{5} = 20');
    expect(s.verdicts.B).toBeUndefined();
  });

  it('la colonne x = 0 du forfait est un témoin : 0 minute coûte déjà 50 DA', () => {
    const s = L.claim(rec(L.init({ plans: '15x|10x+50' }), 0, 6), 'B', 'no');
    expect(s.last.kind).toBe('noOk');
    expect(s.last.witness).toMatchObject({ kind: 'zero', x: 0 });
    expect(txt(s.last.witness.y)).toBe('50');
    expect(s.verdicts.B).toBe('no');
    // (0 ; 0) est compatible avec 15x
    expect(L.table(s, 'A').proportional).toBe(true);
  });

  it('« غير تناسبي » sur 15x est refusé : tous les quotients valent 15', () => {
    const s = L.claim(rec(L.init({ plans: '15x' }), 2, 6), 'A', 'no');
    expect(s.last.kind).toBe('noRefused');
    expect(txt(s.last.a)).toBe('15');
  });

  it('une seule colonne ne prouve rien : « سجّل رحلة أخرى »', () => {
    expect(L.claim(rec(L.init({ plans: '15x' }), 3), 'A', 'yes').last.kind).toBe('few');
    expect(L.claim(rec(L.init({ plans: '15x' }), 0, 3), 'A', 'yes').last.kind).toBe('few');
    expect(L.claim(rec(L.init({ plans: '15x|10x+50' }), 3), 'B', 'no').last.kind).toBe('few');
  });

  it('balayage : sur toute paire de durées distinctes 1…20, le forfait se trahit, 15x jamais', () => {
    for (let x1 = 0; x1 <= 20; x1 += 1) {
      for (let x2 = x1 + 1; x2 <= 20; x2 += 1) {
        const s = rec(L.init({ plans: '15x|10x+50' }), x1, x2);
        expect(L.witness(s, 'B'), `${x1},${x2}`).not.toBeNull();
        expect(L.witness(s, 'A'), `${x1},${x2}`).toBeNull();
      }
    }
  });
});

describe('ratio-ride — الرابع المتناسب, y = a × x et la découverte', () => {
  it('مبتدئ : la colonne fantôme 12 se complète par × 15 = 180 ; 170 est refusé avec son quotient', () => {
    let s = rec(L.init({ plans: '15x' }), 2, 5);
    expect(L.ghostTry(s, '180').last.kind).toBe('ghostLocked');
    s = L.claim(s, 'A', 'yes');
    expect(s.last.kind).toBe('yesOk');
    expect(s.ghost.x).toBe(12);
    expect(L.discoveryReady(s)).toBe(false);
    const w = L.ghostTry(s, '170');
    expect(w.last.kind).toBe('ghostWrong');
    expect(txt(w.last.r)).toBe('85/6');
    expect(L.ghostTry(s, 'abc').last.kind).toBe('syntax');
    s = L.ghostTry(s, '١٨٠');
    expect(s.ghost.done).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('متقدم : les deux jugements ET y = 15 × x ouvrent la découverte ; 10 est refusé en rejouant une colonne', () => {
    let s = rec(L.init({ plans: '15x|10x+50' }), 2, 4);
    expect(s.showRatios).toBe(false);
    s = L.claim(L.claim(s, 'A', 'yes'), 'B', 'no');
    expect(L.allJudged(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
    const w = L.formulaTry(s, '10');
    expect(w.last).toMatchObject({ kind: 'formulaWrong', x: 2 });
    expect(txt(w.last.got)).toBe('20');
    expect(txt(w.last.want)).toBe('30');
    s = L.formulaTry(s, '15');
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.equalRatiosTex(s, 'A')).toBe('\\dfrac{30}{2} = \\dfrac{60}{4} = 15');
  });

  it('lit les décimaux à virgule et les chiffres arabes', () => {
    expect(txt(L.readNumber('٢,٥'))).toBe('5/2');
    expect(L.readNumber('')).toBeNull();
  });
});

describe('durée par défaut (jamais une réponse, jamais une colonne)', () => {
  it('ni 0, ni la durée fantôme, rien d’enregistré', () => {
    for (const plans of ['15x', '15x|10x+50']) {
      const s = L.init({ plans });
      const x = L.defaultX(s);
      expect(x).toBeGreaterThan(0);
      expect(x).not.toBe(s.ghost.x);
      expect(x).toBeLessThanOrEqual(s.range.max);
      expect(s.columns).toHaveLength(0);
    }
  });
});
