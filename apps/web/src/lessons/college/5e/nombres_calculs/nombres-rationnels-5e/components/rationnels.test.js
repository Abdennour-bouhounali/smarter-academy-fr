import { describe, it, expect } from 'vitest';
import {
  frac, valeur, texte,
  agrandir, reduire, diviseursCommuns, memeNombre, simplifier, estSimplifiee,
  peutAdditionner, denominateurCommun, surGraduationCommune, somme, difference,
  comparer, raisonComparaison, ranger,
  fractionDe, tombeJuste, graduations, memeMarque,
  sommeNaive, sommeNumerateurs, diagnostiquerSomme,
  PAIRE_SIGNATURE, RECETTE, parseEntier,
} from './rationnels';

describe('construction — le périmètre 5e est une garde exécutable', () => {
  it('refuse un dénominateur nul', () => {
    expect(() => frac(1, 0)).toThrow();
  });

  it('refuse une fraction NÉGATIVE — les rationnels relatifs sont de 4e', () => {
    expect(() => frac(-3, 4)).toThrow(/négatif/);
  });

  it('refuse un terme non entier', () => {
    expect(() => frac(1.5, 4)).toThrow();
  });
});

describe('fractions égales — le phénomène du module 1 et 2', () => {
  it('3/4 et 6/8 sont le MÊME nombre', () => {
    const { a, b } = PAIRE_SIGNATURE;
    expect(memeNombre(a, b)).toBe(true);
    expect(memeMarque(a, b)).toBe(true);
    expect(valeur(a)).toBe(valeur(b));
  });

  it('agrandir multiplie les deux termes et ne change pas le nombre', () => {
    const f = frac(3, 4);
    for (let k = 1; k <= 12; k += 1) {
      const g = agrandir(f, k);
      expect(g.num).toBe(3 * k);
      expect(g.den).toBe(4 * k);
      expect(memeNombre(f, g)).toBe(true);
    }
  });

  it('réduire est l’inverse exact d’agrandir', () => {
    const f = frac(2, 5);
    for (let k = 2; k <= 9; k += 1) {
      expect(reduire(agrandir(f, k), k)).toEqual(f);
    }
  });

  it('réduire renvoie null quand le facteur ne divise pas les deux termes', () => {
    expect(reduire(frac(3, 4), 2)).toBeNull();
  });

  it('simplifier donne une fraction qu’on ne peut plus réduire', () => {
    for (let n = 1; n <= 40; n += 1) {
      for (let d = 1; d <= 40; d += 1) {
        const s = simplifier(frac(n, d));
        expect(memeNombre(frac(n, d), s)).toBe(true);
        expect(estSimplifiee(s)).toBe(true);
      }
    }
  });

  it('12/18 se simplifie en 2/3', () => {
    expect(simplifier(frac(12, 18))).toEqual(frac(2, 3));
    expect(diviseursCommuns(frac(12, 18))).toEqual([1, 2, 3, 6]);
  });
});

describe('PÉRIMÈTRE — dénominateurs multiples seulement', () => {
  it('accepte les dénominateurs égaux ou multiples', () => {
    expect(peutAdditionner(frac(1, 4), frac(2, 4))).toBe(true);
    expect(peutAdditionner(frac(1, 4), frac(3, 8))).toBe(true);
    expect(peutAdditionner(frac(1, 3), frac(5, 12))).toBe(true);
  });

  it('REFUSE les dénominateurs quelconques — c’est la frontière du programme', () => {
    expect(peutAdditionner(frac(1, 3), frac(1, 5))).toBe(false);
    expect(() => somme(frac(1, 3), frac(1, 5))).toThrow(/hors périmètre/);
    expect(() => denominateurCommun(frac(2, 3), frac(3, 4))).toThrow(/hors périmètre/);
  });

  it('REFUSE une différence négative — les relatifs rationnels sont de 4e', () => {
    expect(() => difference(frac(1, 4), frac(3, 4))).toThrow(/négative/);
  });
});

describe('addition et soustraction sur une graduation commune', () => {
  it('1/4 + 3/8 = 5/8', () => {
    expect(somme(frac(1, 4), frac(3, 8))).toEqual(frac(5, 8));
  });

  it('re-graduer ne change pas les nombres de départ', () => {
    const a = frac(1, 3);
    const b = frac(5, 12);
    const [x, y] = surGraduationCommune(a, b);
    expect(x.den).toBe(12);
    expect(y.den).toBe(12);
    expect(memeNombre(a, x)).toBe(true);
    expect(memeNombre(b, y)).toBe(true);
  });

  it('la somme est correcte sur TOUT le domaine autorisé — balayage', () => {
    for (let d1 = 1; d1 <= 12; d1 += 1) {
      for (let k = 1; k <= 4; k += 1) {
        const d2 = d1 * k;
        for (let n1 = 1; n1 <= d1; n1 += 1) {
          for (let n2 = 1; n2 <= d2; n2 += 1) {
            const a = frac(n1, d1);
            const b = frac(n2, d2);
            const s = somme(a, b);
            expect(valeur(s)).toBeCloseTo(valeur(a) + valeur(b), 10);
            expect(s.den).toBe(Math.max(d1, d2));
          }
        }
      }
    }
  });

  it('la différence est correcte quand elle est positive — balayage', () => {
    for (let d1 = 1; d1 <= 10; d1 += 1) {
      for (let k = 1; k <= 3; k += 1) {
        const d2 = d1 * k;
        for (let n1 = 1; n1 <= d1 * 2; n1 += 1) {
          for (let n2 = 1; n2 <= d2; n2 += 1) {
            const a = frac(n1, d1);
            const b = frac(n2, d2);
            if (valeur(a) < valeur(b)) continue;
            expect(valeur(difference(a, b))).toBeCloseTo(valeur(a) - valeur(b), 10);
          }
        }
      }
    }
  });
});

describe('comparaison', () => {
  it('à même dénominateur, le numérateur tranche', () => {
    expect(comparer(frac(3, 7), frac(5, 7))).toBe(-1);
    expect(raisonComparaison(frac(3, 7), frac(5, 7))).toBe('meme-denominateur');
  });

  it('à dénominateurs multiples, on re-gradue', () => {
    expect(comparer(frac(2, 3), frac(7, 12))).toBe(1);   // 8/12 > 7/12
    expect(raisonComparaison(frac(2, 3), frac(7, 12))).toBe('denominateurs-multiples');
  });

  it('le PIÈGE : à même numérateur, le plus grand dénominateur donne le PLUS PETIT nombre', () => {
    expect(comparer(frac(1, 3), frac(1, 8))).toBe(1);
    expect(valeur(frac(1, 8))).toBeLessThan(valeur(frac(1, 3)));
  });

  it('ranger suit l’ordre des valeurs', () => {
    const fs = [frac(3, 4), frac(1, 4), frac(5, 8), frac(7, 8)];
    expect(ranger(fs).map(texte)).toEqual(['1/4', '5/8', '3/4', '7/8']);
  });

  it('la comparaison est cohérente avec la valeur — balayage', () => {
    for (let n1 = 1; n1 <= 12; n1 += 1) {
      for (let d1 = 1; d1 <= 12; d1 += 1) {
        for (let n2 = 1; n2 <= 12; n2 += 1) {
          for (let d2 = 1; d2 <= 12; d2 += 1) {
            const a = frac(n1, d1);
            const b = frac(n2, d2);
            const c = comparer(a, b);
            const v = Math.sign(valeur(a) - valeur(b));
            expect(c).toBe(v === 0 ? 0 : v);
          }
        }
      }
    }
  });
});

describe('fraction d’une quantité', () => {
  it('3/4 de 20 vaut 15', () => {
    expect(fractionDe(frac(3, 4), 20)).toBe(15);
    expect(tombeJuste(frac(3, 4), 20)).toBe(true);
  });

  it('signale un partage qui ne tombe pas juste', () => {
    expect(tombeJuste(frac(1, 3), 20)).toBe(false);
  });

  it('la recette se met à l’échelle sans reste — donnée d’auteur vérifiée', () => {
    // Le module 6 fait passer la recette de 4 à 6 personnes, soit × 3/2.
    for (const i of RECETTE.ingredients) {
      expect(tombeJuste(frac(3, 2), i.quantite)).toBe(true);
    }
    expect(RECETTE.ingredients.map((i) => fractionDe(frac(3, 2), i.quantite)))
      .toEqual([450, 180, 30]);
    // Et la moitié d'une recette pour 4 tombe juste aussi.
    for (const i of RECETTE.ingredients) {
      expect(tombeJuste(frac(1, 2), i.quantite)).toBe(true);
    }
  });
});

describe('graduations', () => {
  it('une unité en 4 parts donne 5 marques de 0 à 1', () => {
    expect(graduations(4, 1)).toEqual([0, 1, 2, 3, 4]);
  });

  it('sur [0 ; 2] en huitièmes, il y a 17 marques', () => {
    expect(graduations(8, 2)).toHaveLength(17);
  });
});

describe('diagnostic des erreurs — nommer l’erreur, pas dire « faux »', () => {
  it('reconnaît l’addition des deux termes', () => {
    const a = frac(1, 4);
    const b = frac(3, 8);
    expect(sommeNaive(a, b)).toEqual({ num: 4, den: 12 });
    expect(diagnostiquerSomme(a, b, { num: 4, den: 12 })).toBe('somme-des-deux');
  });

  it('reconnaît l’oubli de re-graduation', () => {
    const a = frac(1, 4);
    const b = frac(3, 8);
    expect(sommeNumerateurs(a, b)).toEqual({ num: 4, den: 8 });
    expect(diagnostiquerSomme(a, b, { num: 4, den: 8 })).toBe('oubli-regraduation');
  });

  it('reconnaît la bonne réponse, même écrite sous une forme équivalente', () => {
    const a = frac(1, 4);
    const b = frac(3, 8);
    expect(diagnostiquerSomme(a, b, frac(5, 8))).toBe('ok');
    expect(diagnostiquerSomme(a, b, frac(10, 16))).toBe('ok');
  });
});

describe('parseEntier', () => {
  it('accepte un entier et les espaces', () => {
    expect(parseEntier('7')).toBe(7);
    expect(parseEntier(' 12 ')).toBe(12);
  });

  it('refuse le reste', () => {
    expect(parseEntier('3/4')).toBeNaN();
    expect(parseEntier('-2')).toBeNaN();
    expect(parseEntier('')).toBeNaN();
  });
});
