import { describe, it, expect } from 'vitest';
import {
  equation, expr, rat, eqAddBoth, eqSubBoth, eqScaleBoth, exprSub,
  texEquation, isSolvedForm, solve, isSolution, ratEq,
} from '../../../../../common/algebra4e';

/**
 * Les PARCOURS que la leçon promet à l'élève, vérifiés.
 *
 * Un module de manipulation affirme des choses — « la balance reste droite »,
 * « tu vas voir apparaître des virgules », « les deux ordres donnent la même
 * solution ». Ces affirmations sont du contenu pédagogique : si le
 * comportement réel diffère, la leçon ment à l'élève, et aucun test d'unité du
 * noyau ne l'attrape. Ce fichier teste donc les ÉNONCÉS des modules, sur leurs
 * données exactes.
 *
 * C'est ce test qui a corrigé le module 4 : la rédaction annonçait des
 * « fractions » là où l'élève voit « 0,8 » et « 2,2 » — deux décimaux.
 */

describe('module 1 — la masse cachée (x + 3 = 8)', () => {
  const EQ = equation(expr(1, 3), expr(0, 8));

  it('se résout en retirant 3 des deux côtés', () => {
    const e = eqSubBoth(EQ, expr(0, 3));
    expect(texEquation(e)).toBe('x = 5');
    expect(isSolvedForm(e)).toBe(true);
  });

  it('le geste TRICHEUR détruit l’égalité — c’est ce que la balance doit montrer', () => {
    const triche = equation(exprSub(EQ.left, expr(0, 3)), EQ.right);
    expect(texEquation(triche)).toBe('x = 8');
    // La solution a changé : l'équation obtenue n'est plus la même.
    expect(ratEq(solve(triche).value, solve(EQ).value)).toBe(false);
    // Et la vraie solution ne vérifie plus l'équation trichée.
    expect(isSolution(triche, solve(EQ).value)).toBe(false);
  });

  it('tout geste LÉGAL conserve la solution', () => {
    const sol = solve(EQ).value;
    for (const e of [
      eqSubBoth(EQ, expr(0, 3)),
      eqSubBoth(EQ, expr(0, 1)),
      eqAddBoth(EQ, expr(0, 1)),
      eqScaleBoth(EQ, rat(1, 2)),
    ]) {
      expect(ratEq(solve(e).value, sol)).toBe(true);
      expect(isSolution(e, sol)).toBe(true);
    }
  });
});

describe('module 3 — un seul geste', () => {
  it('x − 7 = 5 se résout en AJOUTANT 7', () => {
    const e = eqAddBoth(equation(expr(1, -7), expr(0, 5)), expr(0, 7));
    expect(texEquation(e)).toBe('x = 12');
  });

  it('6x = 18 se résout en DIVISANT par 6 — et retirer 6 ne libère rien', () => {
    const EQ = equation(expr(6, 0), expr(0, 18));
    expect(texEquation(eqScaleBoth(EQ, rat(1, 6)))).toBe('x = 3');
    // Le module affirme que « − 6 » ne sert à rien ici : vérifions-le.
    const inutile = eqSubBoth(EQ, expr(0, 6));
    expect(isSolvedForm(inutile)).toBe(false);
    expect(texEquation(inutile)).toBe('6x − 6 = 12');
  });

  it('x + 14 = 9 a une solution NÉGATIVE, comme l’annonce le module', () => {
    const e = eqSubBoth(equation(expr(1, 14), expr(0, 9)), expr(0, 14));
    expect(texEquation(e)).toBe('x = −5');
  });
});

describe('module 4 — deux gestes, et l’effet de l’ordre (5x − 4 = 11)', () => {
  const EQ = equation(expr(5, -4), expr(0, 11));

  it('chemin recommandé : +4 puis ÷5 — tout reste entier', () => {
    let e = eqAddBoth(EQ, expr(0, 4));
    expect(texEquation(e)).toBe('5x = 15');
    e = eqScaleBoth(e, rat(1, 5));
    expect(texEquation(e)).toBe('x = 3');
  });

  it('chemin « division d’abord » : des VIRGULES apparaissent, pas des fractions', () => {
    // Le texte du module promet exactement cet affichage. 4/5 et 11/5 sont
    // des décimaux finis, donc `texRat` les écrit 0,8 et 2,2 — surtout pas
    // \dfrac. Si cela changeait, la rédaction du module deviendrait fausse.
    const e = eqScaleBoth(EQ, rat(1, 5));
    expect(texEquation(e)).toBe('x − 0{,}8 = 2{,}2');
    expect(texEquation(e)).not.toContain('\\dfrac');
  });

  it('les deux ordres mènent à la même solution', () => {
    const parA = eqScaleBoth(eqAddBoth(EQ, expr(0, 4)), rat(1, 5));
    const parB = eqAddBoth(eqScaleBoth(EQ, rat(1, 5)), expr(0, rat(4, 5)));
    expect(texEquation(parA)).toBe(texEquation(parB));
    expect(ratEq(solve(parA).value, rat(3))).toBe(true);
  });

  it('4x + 6 = 26 : l’ordre « ÷4 d’abord » donne bien x + 1,5 = 6,5', () => {
    // Chiffres cités mot pour mot dans l'`explain` de l'étape 2.
    const e = eqScaleBoth(equation(expr(4, 6), expr(0, 26)), rat(1, 4));
    expect(texEquation(e)).toBe('x + 1{,}5 = 6{,}5');
    expect(ratEq(solve(e).value, rat(5))).toBe(true);
  });

  it('3x + 8 = 23 se résout en x = 5', () => {
    const e = eqScaleBoth(eqSubBoth(equation(expr(3, 8), expr(0, 23)), expr(0, 8)), rat(1, 3));
    expect(texEquation(e)).toBe('x = 5');
  });
});
