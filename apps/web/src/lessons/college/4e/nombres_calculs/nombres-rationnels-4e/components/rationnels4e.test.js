import { describe, it, expect } from 'vitest';
import {
  q, estNegatif, oppose, valeur, texte, estEntier,
  brut, produitsEnCroix, memeNombre, ecritures, simplifier, estIrreductible,
  somme, difference, produit, inverse, quotient,
  denominateurCommun, surDenominateurCommun, produitDesDenominateurs, communPlusPetitQueProduit,
  comparer, ranger, raisonComparaison,
  sommeNaive, sommeSansRegraduer, diagnostiquerSomme, diagnostiquerProduit, diagnostiquerQuotient,
  DANS_LE_PERIMETRE_4E, verifierPerimetre,
} from './rationnels4e';

describe('le rationnel relatif — ce que la 5e refusait', () => {
  it('accepte un signe, et le porte au numérateur', () => {
    expect(q(-3, 4)).toEqual({ n: -3, d: 4 });
    expect(q(3, -4)).toEqual({ n: -3, d: 4 });      // 3/(−4) s'écrit −3/4
    expect(q(-3, -4)).toEqual({ n: 3, d: 4 });      // deux négatifs → positif
    expect(estNegatif(q(-3, 4))).toBe(true);
    expect(estNegatif(q(3, 4))).toBe(false);
  });

  it('reconnaît un entier comme un rationnel', () => {
    expect(estEntier(q(6, 3))).toBe(true);
    expect(texte(q(6, 3))).toBe('2');
    expect(estEntier(q(1, 3))).toBe(false);
    expect(texte(q(-3, 4))).toBe('-3/4');
  });

  it('l’opposé change le signe sans changer la distance à zéro', () => {
    expect(oppose(q(3, 4))).toEqual({ n: -3, d: 4 });
    expect(valeur(oppose(q(-2, 5)))).toBe(0.4);
  });
});

describe('égalité par produits en croix', () => {
  it('donne les deux produits, pas seulement le verdict', () => {
    // 3/4 = 9/12 ?  3×12 = 36 et 4×9 = 36.
    expect(produitsEnCroix(brut(3, 4), brut(9, 12))).toEqual({ gauche: 36, droite: 36, egaux: true });
  });

  it('travaille sur l’écriture BRUTE, pas sur la forme réduite', () => {
    // C'est tout l'intérêt : la réduction connaîtrait déjà la réponse.
    // 9/12 réduit vaut 3/4 — mais le produit en croix doit porter sur 9 et 12.
    expect(brut(9, 12)).toEqual({ n: 9, d: 12 });
    expect(q(9, 12)).toEqual({ n: 3, d: 4 });
    expect(produitsEnCroix(brut(6, 8), brut(9, 12)).gauche).toBe(72);
  });

  it('détecte une fausse égalité', () => {
    const p = produitsEnCroix(brut(2, 3), brut(3, 5));
    expect(p.gauche).toBe(10);
    expect(p.droite).toBe(9);
    expect(p.egaux).toBe(false);
  });

  it('fonctionne avec des négatifs', () => {
    expect(produitsEnCroix(brut(-2, 3), brut(4, -6)).egaux).toBe(true);
    expect(memeNombre(q(-2, 3), q(2, -3))).toBe(true);
  });

  it('énumère les écritures d’un même nombre', () => {
    const e = ecritures(q(2, 3), 3);
    expect(e).toEqual([{ n: 2, d: 3 }, { n: 4, d: 6 }, { n: 6, d: 9 }]);
    for (const w of e) expect(memeNombre(w, q(2, 3))).toBe(true);
  });

  it('simplifie et reconnaît une écriture irréductible', () => {
    expect(simplifier({ n: 12, d: 18 })).toEqual({ n: 2, d: 3 });
    expect(estIrreductible(2, 3)).toBe(true);
    expect(estIrreductible(12, 18)).toBe(false);
    expect(estIrreductible(-2, 3)).toBe(true);
  });
});

describe('dénominateur commun — ce que la 4e doit fabriquer', () => {
  it('trouve le PLUS PETIT dénominateur commun, pas le produit', () => {
    expect(denominateurCommun(q(1, 4), q(1, 6))).toBe(12);      // pas 24
    expect(produitDesDenominateurs(q(1, 4), q(1, 6))).toBe(24);
    expect(communPlusPetitQueProduit(q(1, 4), q(1, 6))).toBe(true);
  });

  it('tombe sur le produit quand les dénominateurs sont premiers entre eux', () => {
    expect(denominateurCommun(q(1, 3), q(1, 5))).toBe(15);
    expect(communPlusPetitQueProduit(q(1, 3), q(1, 5))).toBe(false);
  });

  it('reste le plus grand quand l’un est multiple de l’autre (le cas de 5e)', () => {
    expect(denominateurCommun(q(1, 3), q(1, 6))).toBe(6);
  });

  it('donne le facteur de re-graduation, pour pouvoir le MONTRER', () => {
    const [a, b] = surDenominateurCommun(q(1, 4), q(1, 6));
    expect(a).toEqual({ frac: { n: 3, d: 12 }, facteur: 3 });
    expect(b).toEqual({ frac: { n: 2, d: 12 }, facteur: 2 });
  });
});

describe('les quatre opérations', () => {
  it('additionne des dénominateurs quelconques — ce que la 5e ne pouvait pas', () => {
    expect(somme(q(1, 3), q(1, 5))).toEqual({ n: 8, d: 15 });
    expect(somme(q(1, 4), q(1, 6))).toEqual({ n: 5, d: 12 });
    expect(somme(q(2, 3), q(1, 3))).toEqual({ n: 1, d: 1 });   // se simplifie en 1
  });

  it('soustrait, y compris en passant sous zéro', () => {
    expect(difference(q(1, 4), q(1, 2))).toEqual({ n: -1, d: 4 });
    expect(difference(q(1, 3), q(1, 3))).toEqual({ n: 0, d: 1 });
  });

  it('additionne des relatifs', () => {
    expect(somme(q(-1, 2), q(1, 3))).toEqual({ n: -1, d: 6 });
    expect(somme(q(-3, 4), q(-1, 4))).toEqual({ n: -1, d: 1 });
  });

  it('multiplie numérateurs entre eux et dénominateurs entre eux', () => {
    expect(produit(q(2, 3), q(3, 4))).toEqual({ n: 1, d: 2 });
    expect(produit(q(-2, 5), q(3, 4))).toEqual({ n: -3, d: 10 });
    expect(produit(q(-2, 5), q(-3, 4))).toEqual({ n: 3, d: 10 });   // règle des signes de 4e
  });

  it('l’inverse échange les deux termes — et n’existe pas pour zéro', () => {
    expect(inverse(q(2, 3))).toEqual({ n: 3, d: 2 });
    expect(inverse(q(-2, 3))).toEqual({ n: -3, d: 2 });
    expect(inverse(q(5))).toEqual({ n: 1, d: 5 });
    expect(() => inverse(q(0))).toThrow();
  });

  it('un nombre fois son inverse fait toujours 1', () => {
    for (const f of [q(2, 3), q(-5, 7), q(9), q(-1, 8)]) {
      expect(produit(f, inverse(f)), texte(f)).toEqual({ n: 1, d: 1 });
    }
  });

  it('diviser, c’est multiplier par l’inverse', () => {
    expect(quotient(q(2, 3), q(4, 5))).toEqual({ n: 5, d: 6 });
    expect(quotient(q(2, 3), q(4, 5))).toEqual(produit(q(2, 3), inverse(q(4, 5))));
    expect(quotient(q(-1, 2), q(1, 4))).toEqual({ n: -2, d: 1 });
    expect(() => quotient(q(1, 2), q(0))).toThrow();
  });
});

describe('comparaison', () => {
  it('compare par produits en croix, négatifs compris', () => {
    expect(comparer(q(2, 3), q(3, 5))).toBe(1);
    expect(comparer(q(-2, 3), q(-1, 3))).toBe(-1);   // −2/3 < −1/3
    expect(comparer(q(1, 2), q(2, 4))).toBe(0);
  });

  it('range, et sait dire pourquoi', () => {
    const r = ranger([q(3, 4), q(-1, 2), q(2, 3), q(0)]);
    expect(r.map(texte)).toEqual(['-1/2', '0', '2/3', '3/4']);
    expect(raisonComparaison(q(-1, 2), q(1, 3))).toBe('signes-differents');
    expect(raisonComparaison(q(1, 5), q(3, 5))).toBe('meme-denominateur');
    expect(raisonComparaison(q(2, 3), q(3, 5))).toBe('produits-en-croix');
    expect(raisonComparaison(q(1, 2), q(2, 4))).toBe('egaux');
  });
});

describe('diagnostic des erreurs — on NOMME l’erreur', () => {
  it('reconnaît l’addition des deux termes', () => {
    expect(sommeNaive(q(1, 3), q(1, 5))).toEqual({ n: 2, d: 8 });
    expect(diagnostiquerSomme(q(1, 3), q(1, 5), { n: 2, d: 8 })).toBe('somme-des-deux-termes');
  });

  it('reconnaît l’oubli de la re-graduation', () => {
    expect(sommeSansRegraduer(q(1, 3), q(1, 5))).toEqual({ n: 2, d: 5 });
    expect(diagnostiquerSomme(q(1, 3), q(1, 5), { n: 2, d: 5 })).toBe('oubli-regraduation');
  });

  it('reconnaît la bonne réponse sous n’importe quelle écriture', () => {
    expect(diagnostiquerSomme(q(1, 3), q(1, 5), { n: 8, d: 15 })).toBe('ok');
    expect(diagnostiquerSomme(q(1, 3), q(1, 5), { n: 16, d: 30 })).toBe('ok');
  });

  it('distingue produit et somme dans les deux sens', () => {
    expect(diagnostiquerProduit(q(1, 2), q(1, 3), { n: 5, d: 6 })).toBe('a-additionne');
    expect(diagnostiquerProduit(q(1, 2), q(1, 3), { n: 1, d: 6 })).toBe('ok');
    expect(diagnostiquerSomme(q(1, 2), q(1, 3), { n: 1, d: 6 })).toBe('a-multiplie');
  });

  it('reconnaît les deux erreurs de division', () => {
    expect(diagnostiquerQuotient(q(2, 3), q(4, 5), { n: 8, d: 15 })).toBe('a-multiplie-sans-inverser');
    expect(diagnostiquerQuotient(q(2, 3), q(4, 5), { n: 6, d: 5 })).toBe('inverse-le-mauvais');
    expect(diagnostiquerQuotient(q(2, 3), q(4, 5), { n: 5, d: 6 })).toBe('ok');
  });

  it('ne casse pas sur une saisie illisible', () => {
    expect(diagnostiquerSomme(q(1, 2), q(1, 3), { n: 1, d: 0 })).toBe('illisible');
    expect(diagnostiquerSomme(q(1, 2), q(1, 3), null)).toBe('illisible');
    expect(diagnostiquerProduit(q(1, 2), q(1, 3), { n: NaN, d: 2 })).toBe('illisible');
  });
});

describe('périmètre exécutable du niveau', () => {
  it('accepte les nombres d’un calcul de 4e', () => {
    expect(DANS_LE_PERIMETRE_4E(q(7, 12))).toBe(true);
    expect(DANS_LE_PERIMETRE_4E(q(-15, 4))).toBe(true);
    expect(() => verifierPerimetre(q(3, 8), 'M4')).not.toThrow();
  });

  it('refuse un dénominateur qu’aucun élève de 4e ne manipule', () => {
    expect(DANS_LE_PERIMETRE_4E({ n: 1, d: 240 })).toBe(false);
    expect(() => verifierPerimetre({ n: 1, d: 240 }, 'M4')).toThrow(/hors périmètre 4e/);
  });
});
