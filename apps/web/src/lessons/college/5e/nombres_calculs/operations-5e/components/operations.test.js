import { describe, it, expect } from 'vitest';
import {
  add, sub, mul, div, fr, decimals,
  entierFactor, equivalentDivision,
  evalFlat, evalExpr, evalGaucheADroite, writeExpr, allParens, traceEval, priority,
  divise, diviseurs, rectangles, multiples, CRITERES, sommeChiffres,
  decoupeProduit, decoupeValide,
  ordreDeGrandeur, vraisemblable,
  TICKET, TRAITEUR, totalCommande, parseDecimalFr,
} from './operations';

describe('arithmétique décimale exacte', () => {
  it('ne laisse jamais fuir le bruit flottant', () => {
    expect(add(0.1, 0.2)).toBe(0.3);
    expect(sub(1, 0.9)).toBe(0.1);
    expect(mul(0.1, 3)).toBe(0.3);
    expect(mul(1.1, 1.1)).toBe(1.21);
  });

  it('compte les décimales', () => {
    expect(decimals(3)).toBe(0);
    expect(decimals(3.5)).toBe(1);
    expect(decimals(0.125)).toBe(3);
  });

  it('écrit à la française, sans queue de flottant', () => {
    expect(fr(3.5)).toBe('3,5');
    expect(fr(12)).toBe('12');
    expect(fr(add(0.1, 0.2))).toBe('0,3');
  });
});

describe('division par un décimal — l’invariant du module 5', () => {
  it('multiplier les deux termes par 10 ne change pas le quotient', () => {
    // C'est l'affirmation centrale du module : elle est testée, pas relue.
    for (const [a, b] of [[7.2, 0.4], [1.5, 0.5], [6, 0.25], [0.9, 0.3], [12.5, 2.5]]) {
      const e = equivalentDivision(a, b);
      expect(div(e.a, e.b)).toBeCloseTo(div(a, b), 10);
      expect(Number.isInteger(e.b)).toBe(true);
    }
  });

  it('7,2 ÷ 0,4 = 72 ÷ 4 = 18', () => {
    expect(div(7.2, 0.4)).toBe(18);
    expect(equivalentDivision(7.2, 0.4)).toEqual({ a: 72, b: 4, facteur: 10 });
  });

  it('le facteur est la puissance de dix du DIVISEUR seul', () => {
    expect(entierFactor(0.4)).toBe(10);
    expect(entierFactor(0.25)).toBe(100);
    expect(entierFactor(4)).toBe(1);
  });

  it('diviser par un nombre plus petit que 1 AGRANDIT — le contre-sens visé', () => {
    expect(div(6, 0.5)).toBe(12);
    expect(div(6, 0.5)).toBeGreaterThan(6);
  });
});

describe('priorités opératoires', () => {
  it('× et ÷ passent avant + et −', () => {
    expect(priority('×')).toBeGreaterThan(priority('+'));
    expect(priority('÷')).toBeGreaterThan(priority('−'));
  });

  it('le ticket du module 1 se lit vraiment de deux façons', () => {
    expect(evalFlat(TICKET)).toBe(14);              // priorités
    expect(evalGaucheADroite(TICKET)).toBe(20);     // lecture naïve
    expect(evalFlat(TICKET)).not.toBe(evalGaucheADroite(TICKET));
  });

  it('la parenthèse (2 + 3) × 4 donne 20', () => {
    expect(evalExpr(TICKET, { from: 0, to: 1 })).toBe(20);
  });

  it('une parenthèse autour du produit ne change rien — elle rend visible', () => {
    expect(evalExpr(TICKET, { from: 1, to: 2 })).toBe(14);
  });

  it('les mêmes priorités s’appliquent DANS la parenthèse', () => {
    // Dans (2 + 3 × 4), le produit passe d'abord : la parenthèse vaut 14.
    const f = { nums: [30, 2, 3, 4], ops: ['−', '+', '×'] };
    expect(evalExpr(f, { from: 1, to: 3 })).toBe(16);   // 30 − 14
    expect(evalFlat({ nums: [2, 3, 4], ops: ['+', '×'] })).toBe(14);
  });

  it('à gauche à droite pour une même priorité', () => {
    expect(evalFlat({ nums: [20, 4, 2], ops: ['÷', '÷'] })).toBe(2.5);
    expect(evalFlat({ nums: [10, 3, 2], ops: ['−', '−'] })).toBe(5);
  });

  it('PÉRIMÈTRE : aucune expression de la leçon ne produit un négatif', () => {
    // Les relatifs dans les enchaînements sont hors périmètre de 5e
    // (teachingScope.exclude). Balayage EXHAUSTIF du ticket, pas échantillon.
    for (const p of [null, ...allParens(TICKET)]) {
      expect(evalExpr(TICKET, p)).toBeGreaterThanOrEqual(0);
    }
  });

  it('toute parenthèse posable donne un résultat fini — balayage exhaustif', () => {
    const expr = { nums: [8, 2, 5, 3], ops: ['+', '×', '−'] };
    for (const p of [null, ...allParens(expr)]) {
      const v = evalExpr(expr, p);
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('le second ticket du module 1 donne exactement DEUX totaux, tous positifs', () => {
    // L'étape 3 promet à l'élève qu'il peut trouver deux totaux différents, et
    // deux seulement. C'est une affirmation de la leçon : elle est testée.
    const LONG = { nums: [10, 2, 3], ops: ['−', '×'] };
    const vals = new Set([evalExpr(LONG, null), ...allParens(LONG).map((p) => evalExpr(LONG, p))]);
    expect([...vals].sort((a, b) => a - b)).toEqual([4, 24]);
    expect([...vals].every((v) => v >= 0)).toBe(true);
  });

  it('l’écriture reflète la parenthèse posée', () => {
    expect(writeExpr(TICKET, null)).toBe('2 + 3 × 4');
    expect(writeExpr(TICKET, { from: 0, to: 1 })).toBe('(2 + 3) × 4');
  });
});

describe('trace d’évaluation — ce que le module 3 montre étape par étape', () => {
  it('la dernière étape donne le résultat de l’expression', () => {
    const cases = [
      [{ nums: [2, 3, 4], ops: ['+', '×'] }, null],
      [{ nums: [2, 3, 4], ops: ['+', '×'] }, { from: 0, to: 1 }],
      [{ nums: [20, 4, 2, 6], ops: ['−', '×', '+'] }, null],
      [{ nums: [5, 3, 2, 4], ops: ['+', '×', '÷'] }, null],
    ];
    for (const [expr, paren] of cases) {
      const steps = traceEval(expr, paren);
      expect(steps.length).toBe(expr.ops.length);
      expect(steps[steps.length - 1].res).toBe(evalExpr(expr, paren));
    }
  });

  it('la première étape est bien le produit, pas la somme', () => {
    const [first] = traceEval(TICKET);
    expect(first.op).toBe('×');
    expect(first.res).toBe(12);
  });

  it('avec la parenthèse, la première étape est la somme', () => {
    const [first] = traceEval(TICKET, { from: 0, to: 1 });
    expect(first.op).toBe('+');
    expect(first.res).toBe(5);
  });
});

describe('multiples et diviseurs', () => {
  it('divise() et la table des diviseurs disent la même chose', () => {
    for (let n = 1; n <= 60; n += 1) {
      for (let d = 1; d <= n; d += 1) {
        expect(divise(d, n)).toBe(diviseurs(n).includes(d));
      }
    }
  });

  it('chaque rectangle a bien l’aire annoncée', () => {
    for (const n of [12, 24, 36, 30]) {
      for (const r of rectangles(n)) expect(r.largeur * r.hauteur).toBe(n);
    }
  });

  it('un diviseur de n donne n comme multiple', () => {
    expect(multiples(4, 6)).toEqual([4, 8, 12, 16, 20, 24]);
    expect(multiples(4, 6)).toContain(24);
    expect(divise(4, 24)).toBe(true);
  });

  it('les critères de divisibilité sont exacts sur 1..500', () => {
    for (const c of CRITERES) {
      for (let n = 1; n <= 500; n += 1) expect(c.test(n)).toBe(n % c.d === 0);
    }
  });

  it('le critère de 3 et celui de 9 reposent bien sur la somme des chiffres', () => {
    for (let n = 1; n <= 500; n += 1) {
      expect(n % 3 === 0).toBe(sommeChiffres(n) % 3 === 0);
      expect(n % 9 === 0).toBe(sommeChiffres(n) % 9 === 0);
    }
  });
});

describe('calcul malin — découper un produit', () => {
  it('découper ne change jamais le produit — balayage', () => {
    for (const a of [7, 12, 17, 25]) {
      for (const b of [6, 8, 12, 37]) {
        for (let b1 = 1; b1 < b; b1 += 1) expect(decoupeValide(a, b, b1)).toBe(true);
      }
    }
  });

  it('17 × 6 = 17 × 5 + 17 × 1', () => {
    const d = decoupeProduit(17, 6, 5);
    expect(d.gauche).toBe(102);
    expect(d.droite).toBe(102);
    expect(d.b2).toBe(1);
  });
});

describe('ordre de grandeur et vraisemblance', () => {
  it('arrondit à un chiffre significatif', () => {
    expect(ordreDeGrandeur(3.84)).toBe(4);
    expect(ordreDeGrandeur(187)).toBe(200);
    expect(ordreDeGrandeur(0.062)).toBe(0.06);
  });

  it('repère une virgule déplacée', () => {
    expect(vraisemblable(50, 48.5)).toBe(true);
    expect(vraisemblable(50, 485)).toBe(false);
    expect(vraisemblable(50, 4.85)).toBe(false);
  });
});

describe('données des modules', () => {
  it('la commande du traiteur a le total annoncé', () => {
    // 12 × 2,5 = 30 ; 8 × 3,2 = 25,6 ; 6 × 1,75 = 10,5
    expect(totalCommande()).toBe(66.1);
    expect(TRAITEUR).toHaveLength(3);
  });

  it('chaque ligne du traiteur a un prix décimal réaliste', () => {
    for (const l of TRAITEUR) {
      expect(l.quantite).toBeGreaterThan(0);
      expect(l.prixUnitaire).toBeGreaterThan(0);
      expect(decimals(l.prixUnitaire)).toBeLessThanOrEqual(2);
    }
  });
});

describe('parseDecimalFr', () => {
  it('accepte la virgule, le point et les espaces', () => {
    expect(parseDecimalFr('3,5')).toBe(3.5);
    expect(parseDecimalFr('3.5')).toBe(3.5);
    expect(parseDecimalFr(' 18 ')).toBe(18);
  });

  it('refuse ce qui n’est pas un décimal positif', () => {
    expect(parseDecimalFr('abc')).toBeNaN();
    expect(parseDecimalFr('')).toBeNaN();
    expect(parseDecimalFr('-3')).toBeNaN();
  });
});
