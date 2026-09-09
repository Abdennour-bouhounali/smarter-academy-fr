import { describe, it, expect } from 'vitest';
import {
  carre, racine, racineEntiere, estCarreParfait, carresParfaits,
  encadrement, verifierEncadrement, entierLePlusProche,
  coteDAire, formeUnCarre, meilleurCarre, resoudreCarreEgal,
  erreurMoitie, diagnostiquerRacine,
  DANS_LE_PERIMETRE_4E, verifierPerimetre,
} from './racines4e';

describe('carré et racine', () => {
  it('la racine défait le carré, et réciproquement', () => {
    for (let k = 0; k <= 15; k += 1) {
      expect(racine(carre(k)), `k=${k}`).toBe(k);
      expect(carre(racine(k * k)), `k=${k}`).toBe(k * k);
    }
  });

  it('REFUSE la racine d’un négatif au lieu de renvoyer NaN', () => {
    expect(() => racine(-4)).toThrow(/négatif/);
    expect(() => racineEntiere(-1)).toThrow();
    // Un NaN silencieux s'afficherait tel quel dans un module.
    expect(Number.isNaN(Math.sqrt(-4))).toBe(true);
  });

  it('donne la racine entière, sans dériver sur les carrés parfaits', () => {
    // Math.sqrt(x)|floor dérive sur certains carrés parfaits ; le +1e-9 corrige.
    for (let k = 0; k <= 100; k += 1) {
      expect(racineEntiere(k * k), `${k}²`).toBe(k);
    }
    expect(racineEntiere(50)).toBe(7);
    expect(racineEntiere(0)).toBe(0);
  });
});

describe('carrés parfaits', () => {
  it('les reconnaît, et rejette le reste', () => {
    for (const n of [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]) {
      expect(estCarreParfait(n), String(n)).toBe(true);
    }
    for (const n of [2, 3, 5, 8, 10, 20, 50, 99, 145]) {
      expect(estCarreParfait(n), String(n)).toBe(false);
    }
  });

  it('rejette les négatifs et les non-entiers', () => {
    expect(estCarreParfait(-4)).toBe(false);
    expect(estCarreParfait(2.25)).toBe(false);
  });

  it('énumère les carrés parfaits attendus au niveau', () => {
    const liste = carresParfaits(144);
    expect(liste).toHaveLength(13);                    // 0² à 12²
    expect(liste[12]).toEqual({ racine: 12, carre: 144 });
    for (const { racine: r, carre: c } of liste) expect(r * r).toBe(c);
  });
});

describe('encadrement — le cœur du niveau', () => {
  it('encadre entre deux entiers CONSÉCUTIFS', () => {
    expect(encadrement(50)).toEqual({ bas: 7, haut: 8, exact: false });
    expect(encadrement(2)).toEqual({ bas: 1, haut: 2, exact: false });
    expect(encadrement(99)).toEqual({ bas: 9, haut: 10, exact: false });
  });

  it('dit « exact » plutôt que d’inventer un encadrement trompeur', () => {
    expect(encadrement(49)).toEqual({ bas: 7, haut: 7, exact: true });
    expect(encadrement(0)).toEqual({ bas: 0, haut: 0, exact: true });
  });

  it('l’encadrement est toujours mathématiquement vrai, balayé sur la plage', () => {
    for (let n = 0; n <= 200; n += 1) {
      const { bas, haut, exact } = encadrement(n);
      expect(bas * bas, `n=${n}`).toBeLessThanOrEqual(n);
      expect(haut * haut, `n=${n}`).toBeGreaterThanOrEqual(n);
      if (!exact) expect(haut - bas, `n=${n}`).toBe(1);
    }
  });

  it('distingue « trop large » de « faux »', () => {
    expect(verifierEncadrement(50, 7, 8)).toBe('ok');
    expect(verifierEncadrement(50, 7, 9)).toBe('trop-large');   // vrai mais pas consécutif
    expect(verifierEncadrement(50, 6, 7)).toBe('faux');          // 7² = 49 < 50
    expect(verifierEncadrement(50, 8, 9)).toBe('faux');
    expect(verifierEncadrement(50, 7.5, 8)).toBe('non-entier');
  });

  it('donne l’entier le plus proche, pour une estimation', () => {
    expect(entierLePlusProche(50)).toBe(7);
    expect(entierLePlusProche(63)).toBe(8);
    expect(entierLePlusProche(2)).toBe(1);
  });
});

describe('le lien géométrique : aire ↔ côté', () => {
  it('le côté d’un carré d’aire a est √a', () => {
    expect(coteDAire(49)).toBe(7);
    expect(coteDAire(144)).toBe(12);
  });

  it('n carreaux forment un carré plein exactement quand n est un carré parfait', () => {
    for (let n = 0; n <= 150; n += 1) {
      expect(formeUnCarre(n), String(n)).toBe(estCarreParfait(n));
    }
  });

  it('donne le meilleur carré et son reste — le phénomène du module 1', () => {
    expect(meilleurCarre(49)).toEqual({ cote: 7, utilises: 49, reste: 0 });
    expect(meilleurCarre(50)).toEqual({ cote: 7, utilises: 49, reste: 1 });
    expect(meilleurCarre(63)).toEqual({ cote: 7, utilises: 49, reste: 14 });
    expect(meilleurCarre(64)).toEqual({ cote: 8, utilises: 64, reste: 0 });
  });

  it('le reste est nul si et seulement si le carré est parfait', () => {
    for (let n = 1; n <= 200; n += 1) {
      expect(meilleurCarre(n).reste === 0, String(n)).toBe(estCarreParfait(n));
    }
  });
});

describe('x² = a', () => {
  it('donne les DEUX solutions pour a > 0 — la négative n’est pas oubliée', () => {
    expect(resoudreCarreEgal(25)).toEqual({ kind: 'deux', valeurs: [-5, 5] });
    expect(resoudreCarreEgal(1)).toEqual({ kind: 'deux', valeurs: [-1, 1] });
  });

  it('traite les cas 0 et négatif', () => {
    expect(resoudreCarreEgal(0)).toEqual({ kind: 'une', valeurs: [0] });
    expect(resoudreCarreEgal(-9)).toEqual({ kind: 'aucune' });
  });
});

describe('diagnostic des erreurs — on NOMME l’erreur', () => {
  it('reconnaît la confusion racine / moitié', () => {
    expect(erreurMoitie(36)).toBe(18);
    expect(diagnostiquerRacine(36, 18)).toBe('a-pris-la-moitie');
  });

  it('reconnaît « redonner l’aire »', () => {
    expect(diagnostiquerRacine(49, 49)).toBe('a-redonne-l-aire');
  });

  it('reconnaît la bonne réponse, et situe les autres', () => {
    expect(diagnostiquerRacine(49, 7)).toBe('ok');
    expect(diagnostiquerRacine(49, 8)).toBe('trop-grand');
    expect(diagnostiquerRacine(49, 6)).toBe('trop-petit');
    expect(diagnostiquerRacine(49, NaN)).toBe('illisible');
  });
});

describe('périmètre exécutable du niveau — la frontière avec la 3e', () => {
  it('accepte les nombres d’une leçon de 4e', () => {
    expect(DANS_LE_PERIMETRE_4E(50)).toBe(true);
    expect(DANS_LE_PERIMETRE_4E(144)).toBe(true);
    expect(() => verifierPerimetre(80, 'M4')).not.toThrow();
  });

  it('refuse ce qui sort du niveau', () => {
    expect(DANS_LE_PERIMETRE_4E(1000)).toBe(false);
    expect(DANS_LE_PERIMETRE_4E(-4)).toBe(false);
    expect(() => verifierPerimetre(1000, 'M4')).toThrow(/hors périmètre 4e/);
  });

  it('n’expose AUCUNE opération sur les racines — c’est du programme de 3e', async () => {
    // La garde de niveau la plus importante de ce fichier : si quelqu'un
    // ajoutait produitDeRacines ou simplifierRacine, la 4e volerait le contenu
    // de `racines-carrees-3e`. Ce test échouerait alors.
    const mod = await import('./racines4e');
    const interdits = [
      'produitRacines', 'quotientRacines', 'simplifierRacine',
      'extraireCarreParfait', 'comparerParCarres',
    ];
    for (const nom of interdits) {
      expect(mod[nom], `${nom} appartient à la 3e`).toBeUndefined();
    }
  });
});
