import { describe, it, expect } from 'vitest';
import {
  pow, valeur, facteurs, colonne, valeurExacte, decimalDeDix, zerosDeDix,
  produit, quotient, puissanceDePuissance, inverse, justification,
  scientifique, estScientifique, diagnostiquerScientifique,
  ordreDeGrandeur, rapportEnPuissances,
  erreurProduitBaseExposant, erreurExposantsMultiplies,
  diagnostiquerProduit, diagnostiquerQuotient,
  DANS_LE_PERIMETRE_4E, verifierPerimetre,
} from './puissances4e';

describe('la puissance comme couple, pas comme nombre', () => {
  it('garde base et exposant séparés', () => {
    expect(pow(10, -3)).toEqual({ base: 10, exp: -3 });
    expect(valeur(pow(2, 5))).toBe(32);
    expect(() => pow(2, 1.5)).toThrow(/hors périmètre/);
  });

  it('donne les facteurs qu’une puissance abrège', () => {
    expect(facteurs(pow(2, 3))).toEqual([2, 2, 2]);
    // Exposant 0 : AUCUN facteur — c'est la raison pour laquelle a^0 = 1.
    expect(facteurs(pow(7, 0))).toEqual([]);
    // Exposant négatif : l'écriture « produit de facteurs » ne marche plus,
    // et c'est exactement le problème que le module 1 fait vivre.
    expect(facteurs(pow(10, -2))).toBeNull();
  });
});

describe('la descente des exposants — le déclencheur', () => {
  it('donne des valeurs EXACTES, pas des flottants', () => {
    expect(valeurExacte(10, 2)).toEqual({ n: 100, d: 1 });
    expect(valeurExacte(10, 0)).toEqual({ n: 1, d: 1 });
    expect(valeurExacte(10, -1)).toEqual({ n: 1, d: 10 });
    expect(valeurExacte(10, -3)).toEqual({ n: 1, d: 1000 });
  });

  it('descend en divisant par la base, sans s’arrêter à zéro', () => {
    const col = colonne(10, 3, -2);
    expect(col.map((r) => r.exp)).toEqual([3, 2, 1, 0, -1, -2]);
    // Chaque ligne vaut la précédente divisée par 10 — l'invariant du module.
    for (let i = 1; i < col.length; i += 1) {
      const prev = col[i - 1].n / col[i - 1].d;
      const cur = col[i].n / col[i].d;
      expect(prev / cur, `ligne ${col[i].exp}`).toBeCloseTo(10, 10);
    }
  });

  it('la même descente marche pour une autre base', () => {
    const col = colonne(2, 3, -2);
    expect(col.map((r) => `${r.n}/${r.d}`)).toEqual(['8/1', '4/1', '2/1', '1/1', '1/2', '1/4']);
  });

  it('écrit les puissances de 10 en décimal français', () => {
    expect(decimalDeDix(3)).toBe('1000');
    expect(decimalDeDix(0)).toBe('1');
    expect(decimalDeDix(-1)).toBe('0,1');
    expect(decimalDeDix(-3)).toBe('0,001');
    expect(zerosDeDix(-3)).toBe(3);
    expect(zerosDeDix(4)).toBe(4);
  });
});

describe('règles opératoires', () => {
  it('additionne les exposants d’un produit', () => {
    expect(produit(pow(10, 3), pow(10, 4))).toEqual({ base: 10, exp: 7 });
    expect(produit(pow(10, 5), pow(10, -2))).toEqual({ base: 10, exp: 3 });
    expect(produit(pow(2, -3), pow(2, -4))).toEqual({ base: 2, exp: -7 });
  });

  it('REFUSE un produit de bases différentes — la règle n’existe pas', () => {
    expect(() => produit(pow(2, 3), pow(3, 2))).toThrow(/bases différentes/);
    expect(() => quotient(pow(5, 3), pow(2, 1))).toThrow(/bases différentes/);
  });

  it('soustrait les exposants d’un quotient', () => {
    expect(quotient(pow(10, 7), pow(10, 3))).toEqual({ base: 10, exp: 4 });
    expect(quotient(pow(10, 2), pow(10, 5))).toEqual({ base: 10, exp: -3 });
    expect(quotient(pow(10, 3), pow(10, 3))).toEqual({ base: 10, exp: 0 });
  });

  it('multiplie les exposants d’une puissance de puissance', () => {
    expect(puissanceDePuissance(pow(10, 3), 2)).toEqual({ base: 10, exp: 6 });
    expect(puissanceDePuissance(pow(2, -2), 3)).toEqual({ base: 2, exp: -6 });
  });

  it('l’inverse change le signe de l’exposant', () => {
    expect(inverse(pow(10, 3))).toEqual({ base: 10, exp: -3 });
    expect(inverse(pow(10, -4))).toEqual({ base: 10, exp: 4 });
    // Un nombre fois son inverse fait 10^0, c'est-à-dire 1.
    expect(produit(pow(10, 3), inverse(pow(10, 3)))).toEqual({ base: 10, exp: 0 });
  });

  it('les règles sont cohérentes avec les valeurs, sur toute la plage lisible', () => {
    for (let a = -4; a <= 4; a += 1) {
      for (let b = -4; b <= 4; b += 1) {
        const p = produit(pow(10, a), pow(10, b));
        expect(10 ** p.exp, `10^${a} × 10^${b}`).toBeCloseTo(10 ** a * 10 ** b, 6);
        const qt = quotient(pow(10, a), pow(10, b));
        expect(10 ** qt.exp, `10^${a} ÷ 10^${b}`).toBeCloseTo(10 ** a / 10 ** b, 6);
      }
    }
  });

  it('justifie par le COMPTE des facteurs, et se tait quand c’est impossible', () => {
    expect(justification(pow(2, 3), pow(2, 4), '×')).toEqual({ gauche: 3, droite: 4, total: 7 });
    expect(justification(pow(2, 5), pow(2, 2), '÷')).toEqual({ gauche: 5, droite: 2, restants: 3 });
    // Avec un exposant négatif on ne compte plus des facteurs : null, pas un mensonge.
    expect(justification(pow(2, 3), pow(2, -1), '×')).toBeNull();
  });
});

describe('notation scientifique', () => {
  it('donne un coefficient dans [1 ; 10[', () => {
    expect(scientifique(45000)).toEqual({ coefficient: 4.5, exposant: 4 });
    expect(scientifique(0.00072)).toEqual({ coefficient: 7.2, exposant: -4 });
    expect(scientifique(1000)).toEqual({ coefficient: 1, exposant: 3 });
    expect(scientifique(9.9)).toEqual({ coefficient: 9.9, exposant: 0 });
    expect(scientifique(-3200)).toEqual({ coefficient: -3.2, exposant: 3 });
  });

  it('reste juste sur les puissances exactes, où log10 dérive', () => {
    for (const e of [-6, -3, -1, 0, 1, 3, 6, 9]) {
      const s = scientifique(10 ** e);
      expect(s.coefficient, `10^${e}`).toBe(1);
      expect(s.exposant, `10^${e}`).toBe(e);
    }
  });

  it('reconstruit le nombre de départ', () => {
    for (const x of [45000, 0.00072, 6.02, 1234, 0.5, -8800]) {
      const { coefficient, exposant } = scientifique(x);
      expect(coefficient * 10 ** exposant, String(x)).toBeCloseTo(x, 8);
    }
  });

  it('refuse zéro, qui n’a pas d’écriture scientifique', () => {
    expect(() => scientifique(0)).toThrow(/zéro/);
  });

  it('nomme ce qui cloche dans une écriture proposée', () => {
    expect(estScientifique(4.5)).toBe(true);
    expect(estScientifique(45)).toBe(false);
    expect(estScientifique(0.45)).toBe(false);
    expect(diagnostiquerScientifique(45)).toBe('coefficient-trop-grand');
    expect(diagnostiquerScientifique(0.45)).toBe('coefficient-trop-petit');
    expect(diagnostiquerScientifique(4.5)).toBe('ok');
    expect(diagnostiquerScientifique(0)).toBe('zero');
  });
});

describe('ordres de grandeur', () => {
  it('arrondit à la puissance de 10 la plus proche', () => {
    expect(ordreDeGrandeur(4300)).toBe(3);     // coefficient 4,3 < 5
    expect(ordreDeGrandeur(7800)).toBe(4);     // coefficient 7,8 ≥ 5
    expect(ordreDeGrandeur(0.00031)).toBe(-4);
    expect(ordreDeGrandeur(0)).toBeNull();
  });

  it('compare deux nombres en puissances de 10', () => {
    // Une bactérie (2×10^-6 m) et un humain (2 m) : 6 ordres d'écart.
    expect(rapportEnPuissances(2, 0.000002)).toBe(6);
  });
});

describe('diagnostic des erreurs — on NOMME l’erreur', () => {
  it('reconnaît le produit base × exposant', () => {
    expect(erreurProduitBaseExposant(pow(2, 3))).toBe(6);   // « 2^3 = 6 »
  });

  it('reconnaît les exposants multipliés au lieu d’être additionnés', () => {
    expect(erreurExposantsMultiplies(pow(10, 3), pow(10, 4))).toEqual({ base: 10, exp: 12 });
    expect(diagnostiquerProduit(pow(10, 3), pow(10, 4), 12)).toBe('exposants-multiplies');
    expect(diagnostiquerProduit(pow(10, 3), pow(10, 4), 7)).toBe('ok');
    expect(diagnostiquerProduit(pow(10, 3), pow(10, 4), -1)).toBe('a-soustrait');
  });

  it('reconnaît les deux erreurs de quotient', () => {
    expect(diagnostiquerQuotient(pow(10, 7), pow(10, 3), 4)).toBe('ok');
    expect(diagnostiquerQuotient(pow(10, 7), pow(10, 3), 10)).toBe('a-additionne');
    expect(diagnostiquerQuotient(pow(10, 3), pow(10, 7), 4)).toBe('sens-inverse');
  });
});

describe('périmètre exécutable du niveau', () => {
  it('accepte les puissances d’une leçon de 4e', () => {
    expect(DANS_LE_PERIMETRE_4E(pow(10, -6))).toBe(true);
    expect(DANS_LE_PERIMETRE_4E(pow(2, 8))).toBe(true);
    expect(() => verifierPerimetre(pow(10, 5), 'M4')).not.toThrow();
  });

  it('refuse ce qu’aucun élève de 4e ne manipule', () => {
    expect(DANS_LE_PERIMETRE_4E(pow(10, 40))).toBe(false);
    expect(DANS_LE_PERIMETRE_4E(pow(37, 2))).toBe(false);
    expect(() => verifierPerimetre(pow(10, 40), 'M4')).toThrow(/hors périmètre 4e/);
  });
});
