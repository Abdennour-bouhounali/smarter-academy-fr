import { describe, it, expect } from 'vitest';
import {
  EXPERIENCES, EVENEMENTS_DE, issuesElementaires, nombreIssues,
  probabilite, probaEvenementDe, probaCouleur, qualifier,
  simuler, observer, attendue, cumuler, simInit, ecartMax,
  assertScope5e, fraction, pct, fr,
} from './probabilites';

describe('les expériences aléatoires', () => {
  it('la pièce a 2 issues, le dé 6, le sac 6 billes', () => {
    expect(nombreIssues(EXPERIENCES.piece)).toBe(2);
    expect(nombreIssues(EXPERIENCES.de)).toBe(6);
    expect(nombreIssues(EXPERIENCES.urne)).toBe(6);
  });

  it('les billes du sac sont équiprobables, mais pas les couleurs', () => {
    // 6 billes indiscernables au toucher → 6 issues équiprobables.
    expect(issuesElementaires(EXPERIENCES.urne)).toHaveLength(6);
    // …réparties en 3 couleurs d'effectifs différents.
    expect(EXPERIENCES.urne.equiprobable).toBe(false);
    expect(EXPERIENCES.urne.billes.filter((b) => b === 'rouge')).toHaveLength(3);
    expect(EXPERIENCES.urne.billes.filter((b) => b === 'vert')).toHaveLength(1);
  });

  it('chaque expérience explique POURQUOI ses issues le sont ou non', () => {
    for (const exp of Object.values(EXPERIENCES)) {
      expect(exp.raison).toBeTruthy();
      expect(typeof exp.equiprobable).toBe('boolean');
    }
  });
});

describe('un événement se décrit par les issues qui le réalisent', () => {
  it('« pair » est réalisé par 2, 4 et 6', () => {
    expect(EVENEMENTS_DE.pair.realisent).toEqual([2, 4, 6]);
    expect(probaEvenementDe(EVENEMENTS_DE.pair)).toBeCloseTo(3 / 6, 12);
  });

  it('« obtenir 6 » vaut 1/6', () => {
    expect(probaEvenementDe(EVENEMENTS_DE.six)).toBeCloseTo(1 / 6, 12);
  });

  it('un événement impossible a une probabilité nulle', () => {
    expect(EVENEMENTS_DE.sept.realisent).toEqual([]);
    expect(probaEvenementDe(EVENEMENTS_DE.sept)).toBe(0);
    expect(qualifier(0).mot).toBe('impossible');
  });

  it('un événement certain a une probabilité de 1', () => {
    expect(probaEvenementDe(EVENEMENTS_DE.moinsDe7)).toBe(1);
    expect(qualifier(1).mot).toBe('certain');
  });

  it('toute probabilité reste entre 0 et 1', () => {
    for (const ev of Object.values(EVENEMENTS_DE)) {
      const p = probaEvenementDe(ev);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  it('les issues favorables sont bien des issues de l’expérience', () => {
    const faces = EXPERIENCES.de.issues.map((i) => i.valeur);
    for (const ev of Object.values(EVENEMENTS_DE)) {
      for (const v of ev.realisent) expect(faces).toContain(v);
    }
  });
});

describe('la formule exige l’équiprobabilité', () => {
  it('refuse de calculer quand les issues ne sont pas équiprobables', () => {
    expect(() => probabilite(1, 3, { equiprobable: false })).toThrow(/équiprobables/);
  });

  it('compte les BILLES et non les couleurs pour l’urne', () => {
    expect(probaCouleur('rouge')).toBeCloseTo(3 / 6, 12);
    expect(probaCouleur('bleu')).toBeCloseTo(2 / 6, 12);
    expect(probaCouleur('vert')).toBeCloseTo(1 / 6, 12);
    const somme = ['rouge', 'bleu', 'vert'].reduce((a, c) => a + probaCouleur(c), 0);
    expect(somme).toBeCloseTo(1, 12);
  });

  it('renvoie null plutôt que de diviser par zéro', () => {
    expect(probabilite(0, 0)).toBeNull();
  });
});

describe('l’échelle de 0 à 1', () => {
  it('nomme les deux bornes et le milieu', () => {
    expect(qualifier(0).mot).toBe('impossible');
    expect(qualifier(1).mot).toBe('certain');
    expect(qualifier(0.5).mot).toBe('une chance sur deux');
    expect(qualifier(1 / 6).mot).toBe('peu probable');
    expect(qualifier(5 / 6).mot).toBe('probable');
  });
});

describe('la simulation est reproductible et réelle', () => {
  it('rend exactement la même série à graine égale', () => {
    const a = simuler(EXPERIENCES.de, 200, 42);
    const b = simuler(EXPERIENCES.de, 200, 42);
    expect([...a.entries()]).toEqual([...b.entries()]);
  });

  it('rend une série différente à graine différente', () => {
    const a = simuler(EXPERIENCES.de, 200, 42);
    const b = simuler(EXPERIENCES.de, 200, 43);
    expect([...a.entries()]).not.toEqual([...b.entries()]);
  });

  it('distribue exactement n lancers, sans en perdre ni en inventer', () => {
    for (const n of [1, 10, 500]) {
      const counts = simuler(EXPERIENCES.de, n, 7);
      expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(n);
    }
  });

  it('observe des fréquences qui somment à 1', () => {
    const lignes = observer(EXPERIENCES.urne, 600, 2026);
    expect(lignes.reduce((a, l) => a + l.frequence, 0)).toBeCloseTo(1, 12);
    expect(lignes.reduce((a, l) => a + l.effectif, 0)).toBe(600);
  });

  it('rapproche la fréquence de la probabilité quand on répète', () => {
    // Pas la loi des grands nombres énoncée (4e) : un simple constat
    // numérique, celui que l'élève fera en cliquant.
    const petit = ecartMax(EXPERIENCES.de, cumuler(EXPERIENCES.de, simInit(EXPERIENCES.de), 20));
    const grand = ecartMax(EXPERIENCES.de, cumuler(EXPERIENCES.de, simInit(EXPERIENCES.de), 20000));
    expect(grand).toBeLessThan(petit);
    expect(grand).toBeLessThan(2); // moins de 2 points d'écart sur 20 000 lancers
  });

  it('donne à l’urne les bonnes probabilités attendues', () => {
    const lignes = observer(EXPERIENCES.urne, 60, 1);
    expect(lignes.find((l) => l.id === 'rouge').attendue).toBeCloseTo(0.5, 12);
    expect(lignes.find((l) => l.id === 'vert').attendue).toBeCloseTo(1 / 6, 12);
  });
});

describe('cumuler des salves', () => {
  it('additionne les lancers sans repartir de zéro', () => {
    let sim = simInit(EXPERIENCES.piece);
    sim = cumuler(EXPERIENCES.piece, sim, 50);
    expect(sim.total).toBe(50);
    sim = cumuler(EXPERIENCES.piece, sim, 50);
    expect(sim.total).toBe(100);
    const somme = Object.values(sim.parIssue).reduce((a, b) => a + b, 0);
    expect(somme).toBe(100);
  });

  it('ne rejoue pas la même salve deux fois de suite', () => {
    const s1 = cumuler(EXPERIENCES.de, simInit(EXPERIENCES.de), 100);
    const s2 = cumuler(EXPERIENCES.de, s1, 100);
    // La deuxième salve n'est pas la copie de la première.
    const salve2 = Object.fromEntries(
      Object.entries(s2.parIssue).map(([k, v]) => [k, v - s1.parIssue[k]]),
    );
    expect(salve2).not.toEqual(s1.parIssue);
  });

  it('reste reproductible dans son ensemble', () => {
    const run = () => {
      let s = simInit(EXPERIENCES.de);
      s = cumuler(EXPERIENCES.de, s, 30);
      s = cumuler(EXPERIENCES.de, s, 30);
      return s.parIssue;
    };
    expect(run()).toEqual(run());
  });

  it('n’a pas d’écart à afficher tant que rien n’est lancé', () => {
    expect(ecartMax(EXPERIENCES.de, simInit(EXPERIENCES.de))).toBeNull();
  });
});

describe('le périmètre de 5e est une garde exécutable', () => {
  for (const hors of ['conditionnelle', 'arbre-multi-niveaux', 'evenement-contraire', 'loi-des-grands-nombres']) {
    it(`refuse « ${hors} »`, () => {
      expect(() => assertScope5e(hors)).toThrow(/hors du programme de 5e/);
    });
  }

  it('laisse passer l’équiprobabilité, qui est au programme', () => {
    expect(assertScope5e('equiprobabilite')).toBe('equiprobabilite');
  });
});

describe('formatage français', () => {
  it('écrit les fractions et les pourcentages', () => {
    expect(fraction(3, 6)).toBe('3/6');
    expect(pct(0.5)).toBe('50 %');
    expect(pct(1 / 6)).toBe('16,7 %');
    expect(fr(25 / 12)).toBe('2,08');
  });
});
