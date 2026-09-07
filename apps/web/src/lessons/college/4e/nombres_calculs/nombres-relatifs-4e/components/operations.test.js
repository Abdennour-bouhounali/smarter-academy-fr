import { describe, it, expect } from 'vitest';
import {
  fmt, fmtParen, parseRelatif, multiplier, diviser, compterNegatifs,
  signeDuProduit, produit, colonne, pasDeLaColonne, evaluer, ecrire,
  evaluerDeGaucheADroite, diagnostiquerProduit, EXPRESSIONS,
} from './operations';

describe('écriture et saisie', () => {
  it('utilise le vrai signe moins (U+2212)', () => {
    expect(fmt(-6)).toBe('−6');
    expect(fmt(-6).charCodeAt(0)).toBe(0x2212);
  });
  it('écrit les décimaux à la française', () => {
    expect(fmt(-3.5)).toBe('−3,5');
    expect(fmt(2.5)).toBe('2,5');
  });
  it('explicite le signe entre parenthèses', () => {
    expect(fmtParen(-5)).toBe('(−5)');
    expect(fmtParen(5)).toBe('(+5)');
  });
  it('relit tout ce que fmt() écrit — entiers et décimaux', () => {
    for (let n = -12; n <= 12; n++) expect(parseRelatif(fmt(n))).toBe(n);
    for (const d of [-3.5, -0.5, 2.5, 7.25]) expect(parseRelatif(fmt(d))).toBe(d);
  });
  it('accepte le trait d’union du clavier et le + explicite', () => {
    expect(parseRelatif('-7')).toBe(-7);
    expect(parseRelatif('+7')).toBe(7);
  });
  it('ne renvoie jamais -0', () => {
    expect(Object.is(parseRelatif('−0'), -0)).toBe(false);
    expect(Object.is(multiplier(-5, 0), -0)).toBe(false);
  });
  it('refuse ce qui n’est pas un nombre', () => {
    for (const bad of ['', 'abc', '--4', '4-']) expect(Number.isNaN(parseRelatif(bad))).toBe(true);
  });
});

describe('la règle des signes — les quatre cas', () => {
  it('+ × + = +', () => expect(multiplier(3, 4)).toBe(12));
  it('+ × − = −', () => expect(multiplier(3, -4)).toBe(-12));
  it('− × + = −', () => expect(multiplier(-3, 4)).toBe(-12));
  it('− × − = +', () => expect(multiplier(-3, -4)).toBe(12));
  it('multiplier par zéro donne zéro, sans signe', () => {
    expect(multiplier(-7, 0)).toBe(0);
    expect(fmt(multiplier(-7, 0))).toBe('0');
  });
});

describe('la régularité de la table — le cœur du module 1', () => {
  // Ce test est l'argument pédagogique de la leçon, rendu exécutable :
  // si le pas n'était pas constant, « − × − = + » ne serait pas forcé.
  it('le pas entre deux cases consécutives d’une colonne est CONSTANT', () => {
    for (const ligne of [-4, -3, -1, 2, 3, 5]) {
      const col = colonne(ligne, 3, -3);
      const pas = [];
      for (let i = 1; i < col.length; i += 1) pas.push(col[i].valeur - col[i - 1].valeur);
      expect(new Set(pas).size).toBe(1);
      expect(pas[0]).toBe(pasDeLaColonne(ligne));
    }
  });
  it('prolonger la colonne de −3 donne bien +3, +6, +9 sous le zéro', () => {
    const col = colonne(-3, 3, -3);
    expect(col.map((c) => c.valeur)).toEqual([-9, -6, -3, 0, 3, 6, 9]);
  });
  it('la seule valeur qui préserve la régularité est celle de la règle des signes', () => {
    const col = colonne(-5, 1, -1);
    const [avant, zero, apres] = col.map((c) => c.valeur);
    expect(zero).toBe(0);
    expect(apres - zero).toBe(zero - avant);   // même pas de part et d'autre
    expect(apres).toBe(multiplier(-5, -1));    // = +5
    expect(apres).toBeGreaterThan(0);
  });
});

describe('signe d’un produit de plusieurs facteurs', () => {
  it('compte les facteurs négatifs', () => {
    expect(compterNegatifs([-1, 2, -3, -4])).toBe(3);
  });
  it('un nombre PAIR de facteurs négatifs donne un produit positif', () => {
    expect(signeDuProduit([-2, -3])).toBe(1);
    expect(signeDuProduit([-2, -3, -4, -5])).toBe(1);
  });
  it('un nombre IMPAIR de facteurs négatifs donne un produit négatif', () => {
    expect(signeDuProduit([-2])).toBe(-1);
    expect(signeDuProduit([-2, -3, -4])).toBe(-1);
  });
  it('un facteur nul annule tout', () => {
    expect(signeDuProduit([-2, 0, -3])).toBe(0);
  });
  // La parité doit prédire le signe du produit RÉELLEMENT calculé.
  it('la parité prédit le signe pour tous les produits de trois facteurs', () => {
    for (const a of [-3, -1, 2, 4]) for (const b of [-2, 3]) for (const c of [-5, 1]) {
      expect(Math.sign(produit([a, b, c]))).toBe(signeDuProduit([a, b, c]));
    }
  });
});

describe('la division suit la même règle', () => {
  it('les quatre cas', () => {
    expect(diviser(12, 4)).toBe(3);
    expect(diviser(12, -4)).toBe(-3);
    expect(diviser(-12, 4)).toBe(-3);
    expect(diviser(-12, -4)).toBe(3);
  });
  it('diviser par zéro n’a pas de résultat', () => {
    expect(Number.isNaN(diviser(5, 0))).toBe(true);
  });
  it('le signe d’un quotient suit la même parité que celui d’un produit', () => {
    for (const a of [-8, 6]) for (const b of [-2, 4]) {
      expect(Math.sign(diviser(a, b))).toBe(signeDuProduit([a, b]));
    }
  });
});

describe('enchaînement des quatre opérations', () => {
  it('× et ÷ passent avant + et −', () => {
    expect(evaluer([-3, '+', 4, '×', -2])).toBe(-11);
    expect(evaluer([5, '−', 12, '÷', -4])).toBe(8);
    expect(evaluer([-8, '+', -3, '×', -4])).toBe(4);
  });
  it('calculer de gauche à droite donne un AUTRE résultat — c’est le piège du module', () => {
    for (const { jetons } of EXPRESSIONS) {
      expect(evaluerDeGaucheADroite(jetons)).not.toBe(evaluer(jetons));
    }
  });
  it('écrit l’expression lisiblement', () => {
    expect(ecrire([-3, '+', 4, '×', -2])).toBe('−3 + (+4) × (−2)');
  });
});

describe('diagnostic d’une erreur de produit', () => {
  it('reconnaît une erreur de signe seule', () => {
    expect(diagnostiquerProduit(-3, 4, 12)).toBe('signe');
  });
  it('reconnaît une addition déguisée', () => {
    expect(diagnostiquerProduit(-3, 4, 1)).toBe('addition');
  });
  it('reconnaît la réponse juste', () => {
    expect(diagnostiquerProduit(-3, 4, -12)).toBe('ok');
  });
});
