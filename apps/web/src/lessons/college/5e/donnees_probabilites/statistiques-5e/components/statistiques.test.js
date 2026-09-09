import { describe, it, expect } from 'vitest';
import {
  ENQUETE, datasetInit, makeObs, tableau, effectifTotal, moyenne,
  partageEquitable, controle, TRIS, assertScope5e, fracEtPct, unite,
} from './statistiques';

describe('le jeu de données de départ', () => {
  it('compte 12 élèves', () => {
    expect(datasetInit()).toHaveLength(12);
    expect(effectifTotal(datasetInit())).toBe(12);
  });

  it('donne à chaque observation un identifiant unique', () => {
    const ids = datasetInit().map((o) => o.id);
    expect(new Set(ids).size).toBe(12);
  });

  it('ne contient que des valeurs entières positives (des livres lus)', () => {
    for (const [, v] of ENQUETE.bruts) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('tableau des effectifs et des fréquences', () => {
  const lignes = tableau(datasetInit());

  it('a une ligne par valeur rencontrée, triée par valeur croissante', () => {
    expect(lignes.map((l) => l.valeur)).toEqual([0, 1, 2, 3, 5]);
  });

  it('donne les effectifs récoltés', () => {
    expect(lignes.map((l) => l.effectif)).toEqual([1, 3, 4, 3, 1]);
  });

  it('n’invente aucune ligne d’effectif nul', () => {
    // Personne n'a lu 4 livres : la valeur 4 n'a pas de ligne.
    expect(lignes.find((l) => l.valeur === 4)).toBeUndefined();
    expect(lignes.every((l) => l.effectif > 0)).toBe(true);
  });

  it('calcule des fréquences qui somment à 1 et des angles qui somment à 360°', () => {
    const sf = lignes.reduce((a, l) => a + l.frequence, 0);
    const sa = lignes.reduce((a, l) => a + l.angle, 0);
    expect(sf).toBeCloseTo(1, 12);
    expect(sa).toBeCloseTo(360, 10);
  });

  it('relie fréquence, pourcentage et angle par la même proportion', () => {
    for (const l of lignes) {
      expect(l.pourcentage).toBeCloseTo(l.frequence * 100, 12);
      expect(l.angle).toBeCloseTo(l.frequence * 360, 12);
    }
  });

  it('sur une série vide, ne divise pas par zéro', () => {
    expect(tableau([])).toEqual([]);
    expect(controle([]).frequencesOk).toBe(true);
  });
});

describe('la moyenne', () => {
  it('vaut le total des livres divisé par le nombre d’élèves', () => {
    const { totalLivres, nb, part } = partageEquitable(datasetInit());
    expect(totalLivres).toBe(25);
    expect(nb).toBe(12);
    expect(part).toBeCloseTo(25 / 12, 12);
    // Le partage équitable ET la moyenne sont le MÊME nombre : c'est
    // l'égalité que la découverte du module fait vivre avant de la nommer.
    expect(moyenne(datasetInit())).toBeCloseTo(part, 12);
  });

  it('est null sur une série vide, jamais NaN ni 0', () => {
    expect(moyenne([])).toBeNull();
    expect(partageEquitable([]).part).toBeNull();
  });

  it('n’est pas forcément une valeur de la série', () => {
    // 25/12 ≈ 2,08 : aucun élève n'a lu 2,08 livre. C'est le point
    // d'interprétation que le module final fait travailler.
    const m = moyenne(datasetInit());
    expect(datasetInit().some((o) => o.valeur === m)).toBe(false);
  });

  it('bouge dans le sens attendu quand on ajoute une donnée', () => {
    const base = datasetInit();
    const avant = moyenne(base);
    expect(moyenne([...base, makeObs('Zoé', 12)])).toBeGreaterThan(avant);
    expect(moyenne([...base, makeObs('Zoé', 0)])).toBeLessThan(avant);
  });
});

describe('trier ne change aucun indicateur', () => {
  const base = datasetInit();
  for (const tri of Object.values(TRIS)) {
    it(`« ${tri.label} » conserve effectif, tableau et moyenne`, () => {
      const trie = tri.apply(base);
      expect(trie).toHaveLength(base.length);
      expect(effectifTotal(trie)).toBe(effectifTotal(base));
      expect(tableau(trie)).toEqual(tableau(base));
      expect(moyenne(trie)).toBeCloseTo(moyenne(base), 12);
    });
  }

  it('ne mute jamais le tableau d’entrée', () => {
    const base2 = datasetInit();
    const copie = base2.map((o) => o.id);
    TRIS.valeur.apply(base2);
    expect(base2.map((o) => o.id)).toEqual(copie);
  });
});

describe('le contrôle affiché à l’élève', () => {
  it('confirme que les effectifs et les fréquences tombent juste', () => {
    const c = controle(datasetInit());
    expect(c.effectifsOk).toBe(true);
    expect(c.sommeEffectifs).toBe(12);
    expect(c.frequencesOk).toBe(true);
  });

  it('reste vrai sur une série où les fréquences sont des tiers', () => {
    // 1/3 + 1/3 + 1/3 ≠ 1 exactement en binaire : la tolérance existe pour
    // que l'élève ne voie jamais « faux » à cause du flottant.
    const trois = [makeObs('A', 1), makeObs('B', 2), makeObs('C', 3)];
    expect(controle(trois).frequencesOk).toBe(true);
  });
});

describe('le périmètre de 5e est une garde exécutable', () => {
  for (const hors of ['mediane', 'quartile', 'ecart-type', 'variance']) {
    it(`refuse « ${hors} »`, () => {
      expect(() => assertScope5e(hors)).toThrow(/hors du programme de 5e/);
    });
  }

  it('laisse passer la moyenne, qui est au programme', () => {
    expect(assertScope5e('moyenne')).toBe('moyenne');
  });
});

describe('formatage français', () => {
  it('écrit une fréquence comme fraction ET pourcentage', () => {
    expect(fracEtPct(4, 12)).toBe('4/12 = 33,3 %');
    expect(fracEtPct(0, 0)).toBe('—');
  });

  it('accorde l’unité', () => {
    expect(unite(1)).toBe('livre');
    expect(unite(0)).toBe('livre');
    expect(unite(3)).toBe('livres');
  });
});
