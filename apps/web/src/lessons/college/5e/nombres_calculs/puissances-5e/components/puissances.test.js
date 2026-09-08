import { describe, it, expect } from 'vitest';
import {
  puissance, facteurs, produitEcrit, ecrirePuissance, lirePuissance,
  confusionProduit, confusionEchange, diagnostiquerPuissance,
  aireCarre, volumeCube, CARRES_PARFAITS, estCarreParfait, coteDuCarre,
  dixPuissanceEcrit, NOMS_DIX,
  evaluer, n, pow, mul, add, sub,
  grainsCase, CASES_MAX, GRANDEURS, parseEntier,
} from './puissances';

describe('la notation — définie par la répétition', () => {
  it('coïncide avec Math.pow sur tout le domaine autorisé — balayage', () => {
    for (let b = 0; b <= 12; b += 1) {
      for (let e = 0; e <= 6; e += 1) {
        expect(puissance(b, e)).toBe(Math.pow(b, e));
      }
    }
  });

  it('l’exposant compte les FACTEURS, pas autre chose', () => {
    expect(facteurs(2, 5)).toEqual([2, 2, 2, 2, 2]);
    expect(facteurs(2, 5)).toHaveLength(5);
    expect(produitEcrit(2, 5)).toBe('2 × 2 × 2 × 2 × 2');
  });

  it('un exposant nul donne 1, et le produit écrit vaut 1', () => {
    expect(puissance(7, 0)).toBe(1);
    expect(produitEcrit(7, 0)).toBe('1');
  });

  it('un exposant 1 laisse le nombre inchangé', () => {
    for (let b = 0; b <= 12; b += 1) expect(puissance(b, 1)).toBe(b);
  });

  it('écrit la puissance avec un exposant en exposant', () => {
    expect(ecrirePuissance(2, 5)).toBe('2⁵');
    expect(ecrirePuissance(10, 12)).toBe('10¹²');
  });

  it('lit « au carré » et « au cube » pour 2 et 3', () => {
    expect(lirePuissance(7, 2)).toBe('7 au carré');
    expect(lirePuissance(7, 3)).toBe('7 au cube');
    expect(lirePuissance(2, 5)).toBe('2 puissance 5');
  });
});

describe('PÉRIMÈTRE 5e — une garde exécutable, pas un commentaire', () => {
  it('REFUSE un exposant négatif — objet officiel de 4e', () => {
    expect(() => puissance(2, -1)).toThrow(/négatif/);
    expect(() => facteurs(2, -3)).toThrow(/négatif/);
    expect(() => dixPuissanceEcrit(-2)).toThrow(/négatif/);
  });

  it('REFUSE un exposant non entier', () => {
    expect(() => puissance(2, 1.5)).toThrow(/non entier/);
  });
});

describe('le piège central : 2⁵ n’est ni 2 × 5 ni 5²', () => {
  it('les trois valeurs sont bien distinctes', () => {
    expect(puissance(2, 5)).toBe(32);
    expect(confusionProduit(2, 5)).toBe(10);
    expect(confusionEchange(2, 5)).toBe(25);
    expect(new Set([32, 10, 25]).size).toBe(3);
  });

  it('diagnostique chaque erreur par son nom', () => {
    expect(diagnostiquerPuissance(2, 5, 32)).toBe('ok');
    expect(diagnostiquerPuissance(2, 5, 10)).toBe('multiplie');
    expect(diagnostiquerPuissance(2, 5, 25)).toBe('echange');
    expect(diagnostiquerPuissance(2, 5, 7)).toBe('autre');
  });

  it('3⁴ et 4³ ne sont pas le même nombre', () => {
    expect(puissance(3, 4)).toBe(81);
    expect(puissance(4, 3)).toBe(64);
  });
});

describe('carré et cube — la lecture géométrique', () => {
  it('l’aire d’un carré de côté n vaut n²', () => {
    for (let c = 0; c <= 12; c += 1) expect(aireCarre(c)).toBe(c * c);
  });

  it('le volume d’un cube d’arête n vaut n³', () => {
    for (let c = 0; c <= 10; c += 1) expect(volumeCube(c)).toBe(c * c * c);
  });

  it('les carrés parfaits vont de 0 à 144, treize valeurs', () => {
    expect(CARRES_PARFAITS).toHaveLength(13);
    expect(CARRES_PARFAITS[0]).toEqual({ n: 0, carre: 0 });
    expect(CARRES_PARFAITS[12]).toEqual({ n: 12, carre: 144 });
  });

  it('reconnaît un carré parfait et retrouve son côté', () => {
    expect(estCarreParfait(49)).toBe(true);
    expect(coteDuCarre(49)).toBe(7);
    expect(estCarreParfait(50)).toBe(false);
    expect(coteDuCarre(50)).toBeNull();
  });

  it('estCarreParfait et coteDuCarre disent la même chose — balayage', () => {
    for (let x = 0; x <= 200; x += 1) {
      expect(estCarreParfait(x)).toBe(coteDuCarre(x) !== null);
    }
  });
});

describe('puissances de 10', () => {
  it('10ⁿ s’écrit bien « 1 suivi de n zéros » — l’affirmation de la leçon', () => {
    for (let e = 0; e <= 12; e += 1) {
      expect(dixPuissanceEcrit(e)).toBe(String(puissance(10, e)));
      expect(dixPuissanceEcrit(e).slice(1)).toBe('0'.repeat(e));
    }
  });

  it('les noms courants correspondent aux bonnes valeurs', () => {
    expect(puissance(10, 2)).toBe(100);
    expect(puissance(10, 3)).toBe(1000);
    expect(puissance(10, 6)).toBe(1000000);
    expect(Object.keys(NOMS_DIX).map(Number)).toEqual([2, 3, 6, 9]);
  });
});

describe('calculs contenant une puissance', () => {
  it('la puissance passe avant la multiplication', () => {
    // 3 × 2³ = 3 × 8 = 24, et non (3 × 2)³ = 216.
    expect(evaluer(mul(n(3), pow(2, 3)))).toBe(24);
  });

  it('la puissance passe avant l’addition', () => {
    // 5 + 3² = 5 + 9 = 14, et non (5 + 3)² = 64.
    expect(evaluer(add(n(5), pow(3, 2)))).toBe(14);
  });

  it('évalue une expression à plusieurs niveaux', () => {
    // 2 × 5² − 10 = 2 × 25 − 10 = 40
    expect(evaluer(sub(mul(n(2), pow(5, 2)), n(10)))).toBe(40);
  });
});

describe('données des modules', () => {
  it('l’échiquier double bien à chaque case', () => {
    expect(grainsCase(1)).toBe(1);
    expect(grainsCase(2)).toBe(2);
    expect(grainsCase(5)).toBe(16);
    for (let k = 2; k <= CASES_MAX; k += 1) {
      expect(grainsCase(k)).toBe(grainsCase(k - 1) * 2);
    }
  });

  it('la dernière case du laboratoire reste un nombre lisible', () => {
    expect(grainsCase(CASES_MAX)).toBe(32768);
    expect(String(grainsCase(CASES_MAX)).length).toBeLessThanOrEqual(6);
  });

  it('chaque grandeur du module 5 a l’exposant annoncé', () => {
    for (const g of GRANDEURS) {
      expect(g.valeur).toBe(puissance(10, g.exposant));
    }
  });
});

describe('parseEntier', () => {
  it('accepte un entier et les espaces', () => {
    expect(parseEntier('32')).toBe(32);
    expect(parseEntier(' 1000 ')).toBe(1000);
  });

  it('refuse le reste', () => {
    expect(parseEntier('2^5')).toBeNaN();
    expect(parseEntier('-4')).toBeNaN();
    expect(parseEntier('')).toBeNaN();
  });
});
