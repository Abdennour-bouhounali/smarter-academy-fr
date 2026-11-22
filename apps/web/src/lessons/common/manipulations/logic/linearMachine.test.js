import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as Pr from '@smarter-academy/core/arithmetic/proportional.js';
import * as L from './linearMachine';

/**
 * linear-machine — la logique RÉELLE du lab (celle que LinearMachine.jsx importe), sur les nombres du
 * manuel : نشاط 1 corrigé (remise de 20 % → x ⟼ 0,8x : 50 → 40 … 200 → 160, f(120) = 96,
 * f(x) = 6 → 7,5, f(x) = 1,4 → 1,75), نشاط 2 (x², 2x, 2x − 1 : seule 2x est linéaire), et
 * la طريقة (g(−2) = 6 → a = −3).
 */
const T = (v) => Lin.fracText(v);
const feedAll = (s, xs) => xs.reduce((acc, x) => L.feed(acc, x), s);

describe('linear-machine — la remise de l’Aïd (0,8x)', () => {
  const s0 = L.init({ rules: '0,8x', targets: '6|1,4' });

  it('une machine, monde souk, cartes du نشاط 1 et le 0', () => {
    expect(s0.world).toBe('souk');
    expect(s0.machines).toHaveLength(1);
    expect(s0.deck.map(T)).toEqual(expect.arrayContaining(['50', '100', '150', '200', '1', '0']));
    expect(s0.deck.map(T)).not.toContain('120'); // f(120) reste à CALCULER (س 2)
  });

  it('les cartes du manuel donnent le tableau 40, 80, 120, 160 et f(120) = 96', () => {
    const s = feedAll(s0, ['50', '100', '150', '200', '120']);
    expect(s.machines[0].trials.map((t) => `${T(t.x)}:${T(t.fx)}`)).toEqual(['50:40', '100:80', '120:96', '150:120', '200:160']);
    // une carte déjà essayée ne refait rien
    const again = L.feed(s, '50');
    expect(again.machines[0].trials).toHaveLength(5);
    expect(again.last.kind).toBe('again');
  });

  it('un couple non nul fixe a = 0,8 ; le couple (0 ; 0) ne fixe rien', () => {
    let s = feedAll(s0, ['0', '50']);
    expect(L.canFixFrom(Lin.frac(0))).toBe('zero');
    s = L.fixFrom(s, '0');
    expect(s.last.kind).toBe('zeroFixesNothing');
    expect(s.machines[0].a).toBeNull();
    s = L.fixFrom(s, '50');
    expect(s.last.kind).toBe('fixed');
    expect(T(s.machines[0].a)).toBe('4/5');
  });

  it('l’affirmation f(x) = a·x : refusée avec un témoin de la table, acceptée pour 0,8', () => {
    let s = feedAll(s0, ['50', '100']);
    expect(L.claimLinear(s).last.kind).toBe('needDial');
    s = L.setDial(s, '0,2');
    s = L.claimLinear(s);
    expect(s.last.kind).toBe('refusedLinear');
    expect(s.last.byMachine).toBe(false);
    expect(T(s.last.ax)).toBe('10');
    expect(T(s.last.fx)).toBe('40');
    s = L.setDial(s, '0,8');
    s = L.claimLinear(s);
    expect(s.last.kind).toBe('acceptedLinear');
    expect(s.machines[0].verdict.kind).toBe('linear');
    expect(L.discoveryReady(s)).toBe(true);
  });

  it('seulement 0 dans la table : la machine donne elle-même son témoin', () => {
    let s = L.feed(s0, '0');
    s = L.setDial(s, '1,5');
    s = L.claimLinear(s);
    expect(s.last.kind).toBe('refusedLinear');
    expect(s.last.byMachine).toBe(true);
    expect(s.machines[0].trials.some((t) => t.by === 'machine')).toBe(true);
    expect(L.discoveryReady(s)).toBe(false);
  });

  it('« n’est pas linéaire » est refusé pour la remise', () => {
    const s = L.claimNotLinear(feedAll(s0, ['50', '150']));
    expect(s.last.kind).toBe('refusedNot');
    expect(s.machines[0].verdict).toBeNull();
  });

  it('la marche arrière : la carte vierge 7,5 donne l’étiquette 6, 1,75 donne 1,4', () => {
    let s = L.feed(s0, L.dialValue(L.REVERSE, 29));
    expect(s.last.hit).toBeNull();
    s = L.feed(s, L.dialValue(L.REVERSE, 30));
    expect(T(s.last.x)).toBe('15/2');
    expect(T(s.last.hit)).toBe('6');
    s = L.feed(s, L.dialValue(L.REVERSE, 7));
    expect(T(s.last.x)).toBe('7/4');
    expect(s.reverse.hits.map((h) => T(h.target))).toEqual(['6', '7/5']);
    // déjà atteinte : pas une seconde fois
    expect(L.feed(s, L.dialValue(L.REVERSE, 30)).last.hit).toBeNull();
    expect(T(L.antecedentOf(s, Lin.parseNumber('1,4')))).toBe('7/4');
  });
});

describe('linear-machine — les trois machines du نشاط 2', () => {
  const s0 = L.init({ rules: 'x^2|2x|2x-1' });

  it('trois machines, monde des nombres, cartes des tableaux du manuel', () => {
    expect(s0.world).toBe('numbers');
    expect(s0.machines.map((m) => m.rule.kind)).toEqual(['square', 'linear', 'affine']);
    expect(s0.deck.map(T)).toEqual(expect.arrayContaining(['-3', '-2', '0', '1/2', '3/2', '5/2', '9/2']));
  });

  it('x² : f(0) = 0 mais le double ne double pas — « f(x) = 2x » refusé, « pas linéaire » accepté', () => {
    let s = feedAll(s0, ['0', '1']);
    s = L.fixFrom(s, '1');
    expect(T(s.machines[0].a)).toBe('1');
    s = L.claimLinear(s);
    expect(s.last.kind).toBe('refusedLinear');
    expect(s.last.byMachine).toBe(true); // le témoin : 2 (le double de 1)
    expect(T(s.last.x)).toBe('2');
    expect(T(s.last.fx)).toBe('4');
    s = L.claimNotLinear(s);
    expect(s.last.kind).toBe('acceptedNot');
    expect(s.last.witness.kind).toBe('double');
  });

  it('2x − 1 : sans témoin, « pas linéaire » est refusé ; avec 0, f(0) = −1 suffit', () => {
    let s = L.select(s0, 2);
    s = L.feed(s, '3');
    expect(L.claimNotLinear(s).last.kind).toBe('needWitness');
    s = L.feed(s, '0');
    s = L.claimNotLinear(s);
    expect(s.last.kind).toBe('acceptedNot');
    expect(s.last.witness.kind).toBe('zero');
    expect(T(s.last.witness.fx)).toBe('-1');
  });

  it('2x − 1 affirmé linéaire avec a lu sur un seul couple : la machine produit f(0) = −1', () => {
    let s = L.select(s0, 2);
    s = L.feed(s, '1');
    s = L.fixFrom(s, '1');
    s = L.claimLinear(s);
    expect(s.last.kind).toBe('refusedLinear');
    expect(T(s.last.x)).toBe('0');
    expect(T(s.last.fx)).toBe('-1');
  });

  it('2x : a = 2 lu sur n’importe quel couple non nul ; la découverte demande les trois verdicts', () => {
    let s = L.select(s0, 1);
    s = feedAll(s, ['-2', '2,5']);
    s = L.fixFrom(s, '2,5');
    expect(T(s.machines[1].a)).toBe('2');
    s = L.claimLinear(s);
    expect(s.machines[1].verdict.kind).toBe('linear');
    expect(L.discoveryReady(s)).toBe(false);
    s = L.claimNotLinear(feedAll(L.select(s, 0), ['1', '3']));
    s = L.claimNotLinear(feedAll(L.select(s, 2), ['0']));
    expect(s.machines.map((m) => m.verdict.kind)).toEqual(['notLinear', 'linear', 'notLinear']);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.zeroButNotLinear(s).machine).toBe(0);
    expect(L.zeroNotZero(s).machine).toBe(2);
  });

  it('les tableaux du manuel : seul celui de 2x est de proportionnalité', () => {
    const tables = { 1: ['-2', '1,5', '3', '4,5'], 2: ['-2', '0,5', '2,5', '3'], 3: ['-3', '0', '1', '3'] };
    const s = L.init({ rules: 'x^2|2x|2x-1' });
    // 2x − 1 sur la table 1 : −5, 2, 5, 8 ; 2x sur la table 2 : −4, 1, 5, 6 ; x² sur la table 3 : 9, 0, 1, 9
    expect(tables[1].map((x) => T(s.machines[2].rule.at(Lin.parseNumber(x))))).toEqual(['-5', '2', '5', '8']);
    expect(tables[2].map((x) => T(s.machines[1].rule.at(Lin.parseNumber(x))))).toEqual(['-4', '1', '5', '6']);
    expect(tables[3].map((x) => T(s.machines[0].rule.at(Lin.parseNumber(x))))).toEqual(['9', '0', '1', '9']);
    expect(L.witnessInTrials(tables[2].map((x) => ({ x: Lin.parseNumber(x), fx: s.machines[1].rule.at(Lin.parseNumber(x)) })))).toBeNull();
    expect(L.witnessInTrials(tables[1].map((x) => ({ x: Lin.parseNumber(x), fx: s.machines[2].rule.at(Lin.parseNumber(x)) })))).not.toBeNull();
  });
});

describe('linear-machine — la طريقة et l’écriture', () => {
  it('g(−2) = 6 → a = −3 (طرائق ص 69)', () => {
    let s = L.init({ rules: '-3x', cards: '-2|0|1' });
    s = L.fixFrom(L.feed(s, '-2'), '-2');
    expect(T(s.machines[0].a)).toBe('-3');
    expect(L.claimLinear(s).last.kind).toBe('acceptedLinear');
  });

  it('écriture : 0{,}8 ; -\\dfrac{5}{3} ; règles ; facteurs négatifs entre parenthèses', () => {
    expect(L.numTex(Lin.parseNumber('0,8'))).toBe('0{,}8');
    expect(L.numTex(Lin.frac(-5, 3))).toBe('-\\dfrac{5}{3}');
    expect(L.numText(Lin.frac(-3))).toBe('−3');
    expect(L.factorTex(Lin.frac(-2))).toBe('(-2)');
    const s = L.init({ rules: 'x^2|2x|2x-1' });
    expect(s.machines.map((m) => L.ruleTex(m.rule))).toEqual(['x^2', '2x', '2x - 1']);
    expect(L.axTex(Lin.parseNumber('0,8'))).toBe('0{,}8x');
  });

  it('le cadran : graduations exactes, valeur hors graduation bornée', () => {
    expect(T(L.dialValue(L.DIALS.souk, 8))).toBe('4/5');
    expect(L.dialIndex(L.DIALS.souk, Lin.parseNumber('0,8'))).toBe(8);
    expect(L.dialIndex(L.DIALS.numbers, Lin.frac(5, 3))).toBe(3);
    expect(L.dialIndex(L.DIALS.numbers, Lin.frac(99))).toBe(10);
  });

  it('les cartes en bloc quasi carré qui garde 44 px', () => {
    expect(L.deckGrid(9, 300)).toMatchObject({ cols: 3, rows: 3 });
    expect(L.deckGrid(12, 300)).toMatchObject({ cols: 4, rows: 3 });
    for (const w of [150, 182, 220, 300, 600]) {
      for (const n of [9, 12]) {
        const g = L.deckGrid(n, w);
        expect(g.cell).toBeGreaterThanOrEqual(44);
        expect(Math.abs(g.rows - g.cols)).toBeLessThanOrEqual(n === 12 && w < 200 ? 2 : 1);
      }
    }
  });
});

describe('valeurs par défaut (jamais une réponse)', () => {
  it('le cadran par défaut n’est jamais le coefficient caché ; la carte vierge n’atteint jamais une cible', () => {
    for (const [rules, targets] of [['0,8x', '6|1,4'], ['0,8x', undefined], ['x^2|2x|2x-1', undefined], ['x|2x|-x', undefined]]) {
      let s = L.init({ rules, targets });
      for (let c = 0; c < s.machines.length; c += 1) {
        s = L.select(s, c);
        const m = s.machines[c];
        const i = L.defaultDialIndex(s);
        if (Pr.isLinear(m.rule)) expect(Lin.eq(L.dialValue(s.dial, i), m.rule.a)).toBe(false);
        const b = L.defaultBlankIndex(s);
        expect(s.targets.some((g) => Lin.eq(g, m.rule.at(L.dialValue(L.BLANKS[s.world], b))))).toBe(false);
        expect(m.trials).toHaveLength(0);
      }
    }
  });
});
