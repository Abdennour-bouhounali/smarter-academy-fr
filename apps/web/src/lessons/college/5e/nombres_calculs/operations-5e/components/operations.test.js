import { describe, it, expect } from 'vitest';
import {
  add, sub, mul, div, fr, decimals,
  entierFactor, equivalentDivision,
  evalFlat, evalExpr, evalGaucheADroite, writeExpr, allParens, traceEval, priority,
  divise, diviseurs, rectangles, multiples, CRITERES, sommeChiffres,
  decoupeProduit, decoupeValide,
  ordreDeGrandeur, vraisemblable,
  TICKET, TRAITEUR, totalCommande, parseDecimalFr,
  labInit, labReduce, labPhase, labHint, rewriteSteps,
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

describe('la machine à états de la pose de parenthèse', () => {
  const tap = (state, i) => labReduce(state, { type: 'tap', index: i });
  const taps = (state, ...is) => is.reduce(tap, state);

  it('un premier tap ouvre une sélection, sans rien poser encore', () => {
    const s = tap(labInit(), 0);
    expect(labPhase(s)).toBe('selecting');
    expect(s.anchor).toBe(0);
    expect(s.paren).toBe(null);
  });

  it('un second tap COMMET le bloc — 2 puis 3 donne (2 + 3) × 4 = 20', () => {
    const s = taps(labInit(), 0, 1);
    expect(labPhase(s)).toBe('committed');
    expect(s.paren).toEqual({ from: 0, to: 1 });
    expect(s.anchor).toBe(null);
    expect(evalExpr(TICKET, s.paren)).toBe(20);
  });

  it('RÉGRESSION — 2 → 3 → 4 ne détruit PAS le bloc commis', () => {
    // Le bug d'origine : le troisième tap écrasait { from:0, to:1 } par une
    // ouverture pendante { from:2, to:null }, le total repassait de 20 à 14, et
    // l'élève voyait sa découverte disparaître sans l'avoir demandé.
    const apresDeux = taps(labInit(), 0, 1);
    const apresTrois = tap(apresDeux, 2);

    expect(apresTrois.paren).toEqual({ from: 0, to: 1 });     // le bloc TIENT
    expect(evalExpr(TICKET, apresTrois.paren)).toBe(20);      // le total TIENT
    expect(labPhase(apresTrois)).toBe('selecting');           // une pose s'amorce
    expect(apresTrois.anchor).toBe(2);
  });

  it('le bloc n’est remplacé qu’au moment où la NOUVELLE pose se ferme', () => {
    // 2 → 3 (bloc 20), puis 4 → 3 : le bloc ne change qu'au tap qui ferme.
    const s = taps(labInit(), 0, 1, 2);
    expect(s.paren).toEqual({ from: 0, to: 1 });
    const fini = tap(s, 1);
    expect(fini.paren).toEqual({ from: 1, to: 2 });
    expect(evalExpr(TICKET, fini.paren)).toBe(14);
    expect(labPhase(fini)).toBe('committed');
  });

  it('l’ordre des deux taps est indifférent — 3 → 2 vaut 2 → 3', () => {
    expect(taps(labInit(), 1, 0).paren).toEqual(taps(labInit(), 0, 1).paren);
  });

  it('re-toucher le terme d’ancrage annule la sélection sans toucher au bloc', () => {
    const commis = taps(labInit(), 0, 1);
    const s = taps(commis, 2, 2);                  // ouvre sur le 4, puis annule
    expect(s.anchor).toBe(null);
    expect(s.paren).toEqual({ from: 0, to: 1 });   // le bloc a survécu
  });

  it('toucher un terme DU bloc l’enlève — le geste est réversible sans bouton', () => {
    const commis = taps(labInit(), 0, 1);
    for (const i of [0, 1]) {
      const s = tap(commis, i);
      expect(s.paren).toBe(null);
      expect(labPhase(s)).toBe('idle');
      expect(evalExpr(TICKET, s.paren)).toBe(14);
    }
  });

  it('« Recommencer » ramène toujours à l’état nu, depuis n’importe quel état', () => {
    const etats = [labInit(), tap(labInit(), 0), taps(labInit(), 0, 1), taps(labInit(), 0, 1, 2)];
    for (const e of etats) {
      expect(labReduce(e, { type: 'reset' })).toEqual({ anchor: null, paren: null });
    }
  });

  it('aucune suite de taps ne produit un état invalide — balayage exhaustif', () => {
    // Toutes les suites de 4 taps sur les 3 termes du ticket : 81 chemins.
    const idx = [0, 1, 2];
    const parcours = (state, profondeur) => {
      expect(state.anchor === null || idx.includes(state.anchor)).toBe(true);
      if (state.paren) {
        expect(state.paren.to).toBeGreaterThan(state.paren.from);
        expect(state.paren.from).toBeGreaterThanOrEqual(0);
        expect(state.paren.to).toBeLessThan(TICKET.nums.length);
        // Un bloc commis n'est JAMAIS à moitié posé : évaluable, fini, positif.
        const v = evalExpr(TICKET, state.paren);
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
      }
      // Un ancrage et un bloc peuvent coexister : c'est justement le correctif.
      if (profondeur === 0) return;
      for (const i of idx) parcours(tap(state, i), profondeur - 1);
    };
    parcours(labInit(), 4);
  });

  it('un bloc pré-posé par le module est un état de départ valide', () => {
    const s = labInit({ from: 1, to: 2 });
    expect(labPhase(s)).toBe('committed');
    expect(evalExpr(TICKET, s.paren)).toBe(14);
    expect(tap(s, 1).paren).toBe(null);            // on peut l'enlever
  });

  it('une seule consigne à la fois, et elle change avec la phase', () => {
    const idle = labHint(labInit(), TICKET);
    const sel = labHint(tap(labInit(), 0), TICKET);
    const com = labHint(taps(labInit(), 0, 1), TICKET);
    expect(new Set([idle, sel, com]).size).toBe(3);
    expect(sel).toContain('2');                    // la consigne nomme le terme touché
  });

  it('la machine marche pour 2, 3 et 4 termes, et pour les quatre opérations', () => {
    const exprs = [
      { nums: [6, 4], ops: ['÷'] },
      { nums: [10, 2, 3], ops: ['−', '×'] },
      { nums: [8, 2, 5, 3], ops: ['+', '×', '−'] },
      { nums: [7.2, 0.4, 2], ops: ['÷', '+'] },
    ];
    for (const expr of exprs) {
      for (const p of allParens(expr)) {
        const s = taps(labInit(), p.from, p.to);
        expect(s.paren).toEqual(p);
        expect(Number.isFinite(evalExpr(expr, s.paren))).toBe(true);
      }
    }
  });
});

describe('la cascade de réécriture — ce que l’élève LIT, pas seulement le total', () => {
  it('montre la structure, pas seulement le résultat', () => {
    expect(rewriteSteps(TICKET, { from: 0, to: 1 })).toEqual(['(2 + 3) × 4', '5 × 4', '20']);
    expect(rewriteSteps(TICKET, null)).toEqual(['2 + 3 × 4', '2 + 12', '14']);
  });

  it('la parenthèse autour du produit se voit, puis s’efface — même total', () => {
    expect(rewriteSteps(TICKET, { from: 1, to: 2 })).toEqual(['2 + (3 × 4)', '2 + 12', '14']);
  });

  it('on n’écrit jamais une parenthèse autour d’un seul terme', () => {
    for (const expr of [TICKET, { nums: [8, 2, 5, 3], ops: ['+', '×', '−'] }]) {
      for (const p of [null, ...allParens(expr)]) {
        for (const ligne of rewriteSteps(expr, p)) {
          expect(ligne).not.toMatch(/\(\s*-?[\d,]+\s*\)/);
        }
      }
    }
  });

  it('la dernière ligne est TOUJOURS le total, pour toute parenthèse posable', () => {
    const exprs = [
      TICKET,
      { nums: [10, 2, 3], ops: ['−', '×'] },
      { nums: [4, 2, 9], ops: ['+', '×'] },
      { nums: [8, 2, 5, 3], ops: ['+', '×', '−'] },
      { nums: [20, 4, 3, 6], ops: ['−', '×', '+'] },
      { nums: [7.2, 0.4, 2], ops: ['÷', '+'] },
      { nums: [6, 4], ops: ['÷'] },
    ];
    for (const expr of exprs) {
      for (const p of [null, ...allParens(expr)]) {
        const lignes = rewriteSteps(expr, p);
        expect(lignes[lignes.length - 1]).toBe(fr(evalExpr(expr, p)));
        expect(lignes[0]).toBe(writeExpr(expr, p));
        expect(lignes.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('aucune ligne ne répète la précédente', () => {
    const expr = { nums: [8, 2, 5, 3], ops: ['+', '×', '−'] };
    for (const p of [null, ...allParens(expr)]) {
      const l = rewriteSteps(expr, p);
      for (let i = 1; i < l.length; i += 1) expect(l[i]).not.toBe(l[i - 1]);
    }
  });
});
