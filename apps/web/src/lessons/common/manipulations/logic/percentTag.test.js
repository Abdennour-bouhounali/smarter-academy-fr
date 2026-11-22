import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './percentTag';

/**
 * percent-tag — la logique RÉELLE du lab (celle que PercentTag.jsx importe), sur les nombres du
 * manuel : نشاط 5 (+5 % sur 1200 DA → 1260 DA, y = 1,05x), طرائق p. 71 (30 m³ − 30 % puis + 15 %
 * → 24,15 m³), le contraste −20 % / +20 % (0,96), et la géométrie des barres balayée.
 */
const T = (p) => LIN.fracText(p);
const ACT5 = { price: '1200', steps: '+5', theme: 'mall' };
const TANK = { price: '30', steps: '-30|+15', theme: 'tank' };

describe('percent-tag — lecture des nombres', () => {
  it('les changements signés du manuel', () => {
    expect(L.parseSteps('+5')).toEqual([5]);
    expect(L.parseSteps('-30|+15')).toEqual([-30, 15]);
    expect(L.parseSteps('−20|+20')).toEqual([-20, 20]);
    expect(() => L.parseSteps('5')).toThrow();
    expect(() => L.parseSteps('+0')).toThrow();
    expect(() => L.parseSteps('+80')).toThrow();
  });

  it('multiplicateurs exacts (proportional.percentMultiplier)', () => {
    expect(T(L.multiplier(5))).toBe('21/20');
    expect(T(L.multiplier(-30))).toBe('7/10');
    expect(T(L.multiplier(0))).toBe('1');
    expect(T(L.chainK([-30, 15]))).toBe('161/200'); // 0,805
    expect(T(L.netPercent(L.chainK([-30, 15])))).toBe('-39/2'); // −19,5 %
    expect(T(L.netPercent(L.chainK([-20, 20])))).toBe('-4');
    expect(T(L.netPercent(L.chainK([3, -2, -1])))).toBe('-347/5000'); // دوري الآن : 0,999306
  });

  it('les deux mondes et leurs formes', () => {
    const a = L.init(ACT5);
    expect(a).toMatchObject({ mode: 'single', world: 'mall', selected: 'sneakers', s: 0 });
    expect(a.articles.map((x) => T(x.x))).toEqual(['1200', '3000', '800']);
    const b = L.init(TANK);
    expect(b).toMatchObject({ mode: 'chain', world: 'tank' });
    expect(T(b.capacity)).toBe('30');
    expect(L.init({ price: '30', steps: '-30|+15' }).world).toBe('tank');
    expect(L.init({ price: '1200', steps: '+5' }).world).toBe('mall');
  });
});

describe('percent-tag — la vitrine (نشاط 5)', () => {
  it('+5 % sur 1200 DA : la barre multipliée vaut 1260, la barre additive 1205', () => {
    const s = L.setS(L.init(ACT5), 5);
    const r = L.reading(s);
    expect(T(r.k)).toBe('21/20');
    expect(T(r.y)).toBe('1260');
    expect(T(r.plus)).toBe('1205');
    expect(L.productTex(r.x, r.k)).toBe('1200 \\times 1{,}05 = 1260');
    expect(L.fnTex(r.k)).toBe('x \\longmapsto 1{,}05x');
    expect(L.multiplierTex(5)).toBe('1 + \\dfrac{5}{100} = 1{,}05');
    expect(L.multiplierTex(-30)).toBe('1 - \\dfrac{30}{100} = 0{,}7');
    expect(L.targetSet(s)).toBe(true);
  });

  it('un essai est une valeur VALIDÉE, retenue une fois par (article, t)', () => {
    let s = L.init(ACT5);
    s = L.setS(s, 5); s = L.setS(s, 5); s = L.setS(s, 0);
    expect(s.trials).toHaveLength(1);
    expect(s.last.kind).toBe('zero');
  });

  it('la barre additive est refusée sans t, et elle ne coïncide jamais avec la barre multipliée', () => {
    let s = L.tryAdditive(L.init(ACT5));
    expect(s.last.kind).toBe('needT');
    for (const a of L.init(ACT5).articles) {
      for (let t = -L.T_MAX; t <= L.T_MAX; t += 1) {
        if (t === 0) continue;
        const r = L.reading(L.select(L.setS(L.init(ACT5), t), a.id), t, a.id);
        expect(LIN.eq(r.y, r.plus), `${T(a.x)} ${t}`).toBe(false);
      }
    }
    s = L.tryAdditive(L.setS(L.init(ACT5), 5));
    expect(s.additive).toEqual({ id: 'sneakers', s: 5 });
    expect(L.setS(s, 6).additive).toBeNull();
  });

  it('le tableau de l’élève : y / x constant = 1,05 sur deux articles', () => {
    let s = L.setS(L.init(ACT5), 5);
    s = L.setS(L.select(s, 'jersey'), 5);
    s = L.setS(L.select(s, 'cap'), 10); // un autre t : pas dans le tableau de la leçon
    const rows = L.table(s);
    expect(rows.map((r) => [T(r.x), T(r.y), T(r.ratio)])).toEqual([['1200', '1260', '21/20'], ['3000', '3150', '21/20']]);
  });

  it('découverte : t de la leçon + deuxième article + barre additive essayée (contraste)', () => {
    let s = L.setS(L.init(ACT5), 5);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.setS(L.select(s, 'jersey'), 5);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.tryAdditive(s);
    expect(L.discoveryReady(s)).toBe(true);
    // un deuxième article à un AUTRE t ne suffit pas
    let u = L.tryAdditive(L.setS(L.init(ACT5), 5));
    u = L.setS(L.select(u, 'cap'), 7);
    expect(L.discoveryReady(u)).toBe(false);
  });
});

describe('percent-tag — le réservoir (طرائق p. 71)', () => {
  it('on parie d’abord ; puis −30 % et +15 % donnent 24,15 m³', () => {
    let s = L.init(TANK);
    s = L.commitStep(L.setDraft(s, -30));
    expect(s.last.kind).toBe('betFirst');
    s = L.setBet(s, -30); // le pari « −15 % » en demi-points
    s = L.commitStep(L.setDraft(s, -30));
    expect(T(L.current(s))).toBe('21');
    s = L.commitStep(L.setDraft(s, 15));
    expect(T(L.current(s))).toBe('483/20'); // 24,15
    expect(L.dec(L.current(s))).toBe('24,15');
    expect(L.chainLinesTex(s)).toEqual(['30 \\times 0{,}7 = 21', '21 \\times 1{,}15 = 24{,}15']);
    expect(L.chainKTex(s.chain)).toBe('0{,}7 \\times 1{,}15 = 0{,}805');
    const v = L.betVerdict(s);
    expect(v.ok).toBe(false);
    expect(L.dec(v.betted)).toBe('25,5');
    expect(T(v.sum)).toBe('-15');
    expect(s.last.kind).toBe('betKo');
    expect(L.betRefuted(s)).toMatchObject({ bet: -30, ok: false });
    expect(L.targetChainDone(s)).toBe(true);
  });

  it('le pari juste (−19,5 %) est accepté par la barre', () => {
    let s = L.setBet(L.init(TANK), -30);
    s = L.commitStep(L.setDraft(s, -30));
    s = L.commitStep(L.setDraft(s, 15));
    s = L.setBet(s, -39);
    expect(s.last.kind).toBe('betOk');
    expect(L.betMatched(s)).toBe(true);
    expect(L.pctTex(L.betPercent(-39))).toBe('-19{,}5\\%');
  });

  it('le réservoir est plein : une hausse qui déborde est refusée (capacité 30 m³)', () => {
    let s = L.setBet(L.init(TANK), -10);
    s = L.commitStep(L.setDraft(s, 20));
    expect(s.last.kind).toBe('overflow');
    expect(s.chain).toEqual([]);
  });

  it('pas nul, chaîne pleine', () => {
    let s = L.setBet(L.init({ price: '30', steps: '-30|+15', theme: 'tank' }), 0);
    expect(L.commitStep(s).last.kind).toBe('needT');
    for (const t of [-10, -10, -10]) s = L.commitStep(L.setDraft(s, t));
    expect(s.chain).toHaveLength(3);
    expect(L.commitStep(L.setDraft(s, -5)).last.kind).toBe('full');
  });

  it('contraste : −20 % puis +20 % ne revient pas (28,8 m³), et la découverte demande les trois', () => {
    let s = L.setBet(L.init(TANK), -30);
    s = L.commitStep(L.setDraft(s, -30));
    s = L.commitStep(L.setDraft(s, 15));
    s = L.setBet(s, -39);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.newChain(s);
    expect(T(L.current(s))).toBe('30');
    s = L.commitStep(L.setDraft(s, -20));
    s = L.commitStep(L.setDraft(s, 20));
    expect(L.dec(L.current(s))).toBe('28,8');
    expect(L.contrastChain(s).steps).toEqual([-20, 20]);
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('l’ordre des multiplications ne change pas le produit (sans débordement)', () => {
    for (let a = -50; a <= 0; a += 5) for (let b = -50; b <= 50; b += 5) {
      expect(LIN.eq(L.chainK([a, b]), L.chainK([b, a]))).toBe(true);
    }
  });
});

describe('percent-tag — géométrie des barres', () => {
  it('la poignée relit le t % qu’elle a posé, à toutes les largeurs (balayage)', () => {
    for (const width of [120, 182, 260, 400, 640]) {
      for (const x of ['1200', '3000', '800', '30']) {
        const top = LIN.mul(LIN.parseNumber(x), LIN.frac(3, 2));
        const sc = L.barScale({ width, top });
        for (let t = -L.T_MAX; t <= L.T_MAX; t += 1) {
          const px = sc.px(LIN.mul(LIN.parseNumber(x), L.multiplier(t)));
          expect(px).toBeGreaterThanOrEqual(sc.edge - 0.001);
          expect(px).toBeLessThanOrEqual(width - sc.edge + 0.001);
          expect(L.sFromPosition(px, sc, x)).toBe(t);
        }
      }
    }
  });

  it('les graduations : 21 marques, étiquettes toutes les 10 % (25 % si étroit)', () => {
    const sc = L.barScale({ width: 300, top: 1800 });
    const ticks = L.percentTicks('1200', sc);
    expect(ticks).toHaveLength(21);
    expect(ticks.filter((t) => t.label).map((t) => t.s)).toEqual([-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]);
    expect(L.percentTicks('1200', sc, true).filter((t) => t.label).map((t) => t.s)).toEqual([-50, -25, 0, 25, 50]);
  });
});
