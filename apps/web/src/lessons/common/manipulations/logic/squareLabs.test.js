import { describe, it, expect } from 'vitest';
import * as RS from './squareRootSide';
import * as SF from './squareFold';
import * as ST from './squareTiling';

/* Unité 2 « الحساب على الجذور » — les nombres sont ceux du manuel (pp. 19–30) :
   نشاط 1 (BC² = 5 ; 36, 81, 0,49), نشاط 2 (16/9, 25/13, 6…), نشاط 3 (9 ; 25, 3,
   0,04, 0, −9), معارف 4 (√28 = 2√7), تمرين 18 (288). */

describe('square-root-side — mode refine (leçon 1)', () => {
  it('36 : le côté tombe juste sur 6, la découverte s’ouvre sur « exact »', () => {
    let s = RS.init({ mode: 'refine', areas: [{ num: 36, den: 1 }] });
    s = RS.test(s, 5);
    expect(s.last.cmp).toBe(-1);
    expect(RS.discoveryReady(s)).toBe(false);
    s = RS.test(s, 6);
    expect(s.last.cmp).toBe(0);
    expect(RS.discoveryReady(s)).toBe(true);
    expect(RS.refineOutcome(s)).toBe('exact');
    expect(RS.canRefine(s)).toBe(false);
  });

  it('5 : encadrer à chaque graduation, la loupe se resserre, jamais d’égalité', () => {
    let s = RS.init({ mode: 'refine', areas: [{ num: 5, den: 1 }], maxScale: 1000 });
    expect(RS.canRefine(s)).toBe(false);
    s = RS.test(s, 2);
    expect(RS.canRefine(s)).toBe(false); // un seul côté de l'encadrement
    s = RS.test(s, 3);
    expect(RS.canRefine(s)).toBe(true);
    s = RS.refine(s);
    expect([s.scale, s.window]).toEqual([10, { min: 20, max: 30 }]);
    // un côté hors de la loupe est refusé
    expect(RS.canTest(s, 31)).toBe('outOfRuler');
    for (const [lo, hi] of [[22, 23], [223, 224], [2236, 2237]]) {
      s = RS.test(RS.test(s, lo), hi);
      expect(RS.tight(RS.brackets(s).at(-1))).toBe(true);
      if (s.scale < 1000) s = RS.refine(s);
    }
    expect(s.scale).toBe(1000);
    expect(RS.discoveryReady(s)).toBe(true);
    expect(RS.refineOutcome(s)).toBe('never');
    expect(RS.brackets(s).map((b) => [b.below, b.above])).toEqual([[2, 3], [22, 23], [223, 224], [2236, 2237]]);
    expect(RS.brackets(s).every((b) => b.exact == null)).toBe(true);
  });

  it('0,49 : il faut une loupe, puis le côté tombe juste sur 0,7', () => {
    let s = RS.init({ mode: 'refine', areas: [{ num: 49, den: 100 }] });
    s = RS.refine(RS.test(RS.test(s, 0), 1));
    s = RS.test(s, 7);
    expect(RS.refineOutcome(s)).toBe('exact');
    expect(RS.sideText(7, 10)).toBe('0,7');
    expect(RS.squareTex(7, 10)).toBe('0{,}49');
    expect(RS.areaTex({ num: 49, den: 100 })).toBe('0{,}49');
  });

  it('écrit les carrés exactement : 2,23² = 4,9729', () => {
    expect(RS.squareTex(223, 100)).toBe('4{,}9729');
    expect(RS.sideTex(2236, 1000)).toBe('2{,}236');
  });
});

describe('square-root-side — mode graduation (leçon 2)', () => {
  const areas = [{ num: 16, den: 9 }, { num: 6, den: 1 }];
  it('16/9 tombe sur la graduation des tiers : 4/3', () => {
    let s = RS.init({ mode: 'graduation', areas, maxScale: 12 });
    s = RS.setScale(s, 3);
    s = RS.test(s, 4);
    expect(RS.cardStatus(s, 0)).toBe('exact');
    expect(RS.foundSide(s, 0)).toEqual({ v: 4, scale: 3 });
    expect(RS.sideText(4, 3)).toBe('4/3');
  });
  it('6 résiste à trois graduations ; le contraste ouvre la découverte', () => {
    let s = RS.init({ mode: 'graduation', areas, maxScale: 12 });
    s = RS.test(RS.setScale(s, 3), 4);
    s = RS.setCard(s, 1);
    for (const g of [1, 2, 7]) {
      s = RS.setScale(s, g);
      const lo = Math.floor(g * Math.sqrt(6));
      s = RS.test(RS.test(s, lo), lo + 1);
    }
    expect(RS.cardStatus(s, 1)).toBe('resisting');
    expect(RS.discoveryReady(s)).toBe(true);
  });
  it('aucune graduation de 1 à 12 n’atteint √6, √7, √13 ni √(25/13) (balayage)', () => {
    for (const area of [{ num: 6, den: 1 }, { num: 7, den: 1 }, { num: 13, den: 1 }, { num: 25, den: 13 }]) {
      let s = RS.init({ mode: 'graduation', areas: [area], maxScale: 12 });
      for (let g = 1; g <= 12; g += 1) {
        s = RS.setScale(s, g);
        const r = RS.range(s);
        for (let v = r.min; v <= r.max; v += 1) s = RS.test(s, v);
      }
      expect(RS.cardStatus(s, 0)).toBe('resisting');
    }
  });
  it('les rationnels du manuel tombent sur une graduation : 100, 9, 16/9, 0,25', () => {
    for (const area of [{ num: 100, den: 1 }, { num: 9, den: 1 }, { num: 16, den: 9 }, { num: 25, den: 100 }]) {
      let s = RS.init({ mode: 'graduation', areas: [area], maxScale: 12 });
      for (let g = 1; g <= 12 && RS.cardStatus(s, 0) !== 'exact'; g += 1) {
        s = RS.setScale(s, g);
        const r = RS.range(s);
        for (let v = r.min; v <= r.max; v += 1) s = RS.test(s, v);
      }
      expect(RS.cardStatus(s, 0), JSON.stringify(area)).toBe('exact');
    }
  });
});

describe('square-fold (leçon 3)', () => {
  it('x² = 9 : 3 puis −3 (مراد نسي حلا آخر)', () => {
    let s = SF.init({ targets: [9, 0, -9], scale: 2 });
    s = SF.pin(SF.move(s, 6));
    expect(s.last.kind).toBe('pinned');
    expect(SF.cardSolved(s, 0)).toBe(false);
    s = SF.pin(SF.move(s, -6));
    expect(SF.cardSolved(s, 0)).toBe(true);
    // épingler deux fois le même est dit
    expect(SF.pin(s).last.kind).toBe('alreadyPinned');
  });
  it('refuse une mauvaise valeur avec son carré exact', () => {
    const s = SF.pin(SF.move(SF.init({ targets: [9], scale: 2 }), 5));
    expect(s.last).toEqual({ kind: 'notSolution', v: 5 });
    expect(SF.squareText(5, 2)).toBe('25/4');
    expect(SF.xText(-3, 2)).toBe('−3/2');
  });
  it('x² = 0 : une seule solution ; x² = −9 : épingler est refusé, « لا حل » accepté', () => {
    let s = SF.init({ targets: [9, 0, -9], scale: 2 });
    s = SF.setCard(s, 1);
    s = SF.pin(SF.move(s, 0));
    expect(SF.cardSolved(s, 1)).toBe(true);
    s = SF.setCard(s, 2);
    expect(SF.pin(SF.move(s, 6)).last.kind).toBe('negativeTarget');
    expect(SF.declareNone(SF.setCard(s, 0)).last.kind).toBe('hasSolution');
    s = SF.declareNone(s);
    expect(SF.cardSolved(s, 2)).toBe(true);
    expect(SF.discoveryReady(s)).toBe(false); // 9 pas encore résolu
    s = SF.pin(SF.move(SF.setCard(s, 0), 6));
    s = SF.pin(SF.move(s, -6));
    expect(SF.discoveryReady(s)).toBe(true);
  });
  it('x² = 3 au pas de 0,1 : 1,7 est à moins d’une demi-graduation de √3, et c’est √3 qui est épinglé', () => {
    let s = SF.init({ targets: [25, 3, 0.04, 0, -9], scale: 10 });
    s = SF.setCard(s, 1);
    expect(SF.pin(SF.move(s, 18)).last.kind).toBe('notSolution'); // |1,8 − 1,732| > 0,05
    s = SF.pin(SF.move(s, 17));
    expect(s.last).toEqual({ kind: 'pinned', sign: 1 });
    expect(SF.solutionTex(SF.current(s), 1)).toBe('\\sqrt{3}');
    expect(SF.solutionText(SF.current(s), -1)).toBe('−√3');
    // 0,04 : ±0,2 exactement
    s = SF.setCard(s, 2);
    s = SF.pin(SF.move(s, 2));
    expect(s.last.kind).toBe('pinned');
    expect(SF.solutionTex(SF.current(s), -1)).toBe('-0{,}2');
    expect(SF.toRational(0.04)).toEqual({ num: 1, den: 25 });
  });
  it('les cibles du manuel ont 2, 1 ou 0 solutions selon le signe', () => {
    expect([25, 3, 0.04, 0, -9].map((a) => SF.solutionCount(SF.toRational(a)))).toEqual([2, 2, 2, 1, 0]);
  });
});

describe('square-tiling (leçons 4 et 5)', () => {
  it('28 : k = 2 donne des dalles de 7, √28 = 2√7 ; k = 3 est refusé (28 ÷ 9)', () => {
    let s = ST.init({ n: 28, mode: 'product' });
    expect(ST.range(s)).toEqual({ min: 1, max: 5 });
    s = ST.tile(s, 2);
    expect(s.tried.at(-1)).toMatchObject({ valid: true, b: 7 });
    expect(ST.equationTex(28, s.tried.at(-1))).toBe('\\sqrt{28} = \\sqrt{2^2 \\times 7} = \\sqrt{2^2} \\times \\sqrt{7} = 2\\sqrt{7}');
    expect(ST.discoveryReady(s)).toBe(false);
    s = ST.tile(s, 3);
    expect(s.tried.find((t) => t.k === 3).valid).toBe(false);
    expect(ST.refusedTex(28, 3)).toBe('28 \\div 3^2 = \\dfrac{28}{9}');
    expect(ST.discoveryReady(s)).toBe(true);
  });
  it('144 (نشاط 4 : 4 × 36) : le côté est 12 quel que soit le pavage', () => {
    for (const k of [2, 3, 4, 6, 12]) {
      const t = ST.tiling(144, k);
      expect(t.valid).toBe(true);
      expect(ST.equationTex(144, t).endsWith('= 12')).toBe(true);
    }
    expect(ST.refusedTex(72, 5)).toBe('72 \\div 5^2 = \\dfrac{72}{25} = 2{,}88');
  });
  it('288 (تمرين 18) : la découverte exige le plus grand k ET un autre pavage juste', () => {
    let s = ST.init({ n: 288, mode: 'simplest' });
    expect(ST.validKs(s)).toEqual([1, 2, 3, 4, 6, 12]);
    s = ST.tile(s, 2);
    expect(ST.discoveryReady(s)).toBe(false);
    s = ST.tile(s, 12);
    expect(ST.discoveryReady(s)).toBe(true);
    expect(s.tried.find((t) => t.k === 12).b).toBe(2);
    expect(ST.simplestText(288)).toBe('12√2');
  });
  it('18 (طريقة p. 25) : un seul pavage non trivial — la découverte demande k = 3 puis un k plus grand refusé', () => {
    let s = ST.init({ n: 18, mode: 'simplest' });
    s = ST.tile(s, 3);
    expect(ST.discoveryReady(s)).toBe(false);
    s = ST.tile(s, 4);
    expect(s.tried.find((t) => t.k === 4).valid).toBe(false);
    expect(ST.discoveryReady(s)).toBe(true);
  });
  it('balayage : tout pavage juste vérifie k² × b = n, tout refus a n ÷ k² non entier', () => {
    for (const n of [8, 18, 28, 50, 63, 72, 75, 144, 288, 300, 363]) {
      for (let k = 1; k * k <= n; k += 1) {
        const t = ST.tiling(n, k);
        if (t.valid) expect(k * k * t.b).toBe(n);
        else expect(t.frac.den).toBeGreaterThan(1);
      }
    }
  });
});

describe('valeurs par défaut (jamais une réponse)', () => {
  it('square-tiling : le k par défaut n\'est pas le plus grand k', () => {
    for (const n of [2, 7, 8, 18, 28, 50, 63, 72, 75, 144, 288, 300, 363]) {
      const s = ST.init({ n, mode: 'simplest' });
      const k = ST.defaultK(s);
      expect(k).toBeGreaterThanOrEqual(1);
      expect(k).toBeLessThanOrEqual(ST.range(s).max);
      if (ST.kmax(s) > 1) expect(k).not.toBe(ST.kmax(s));
      else if (ST.range(s).max > 1) expect(ST.tiling(n, k).valid).toBe(false);
      expect(s.tried).toEqual([]);
    }
  });
  it('square-fold : le x par défaut n\'est solution d\'aucune carte', () => {
    for (const [targets, scale] of [[[9, 0, -9], 2], [[25, 3, 0.04, 0, -9], 10], [[9, 0, -9], 1], [[0], 1]]) {
      const s = SF.init({ targets, scale });
      const v = SF.defaultX(s);
      targets.forEach((_, i) => expect(SF.pin({ ...s, x: v, card: i }).last.kind).not.toBe('pinned'));
      expect(s.visited).toEqual([]);
    }
  });
});
