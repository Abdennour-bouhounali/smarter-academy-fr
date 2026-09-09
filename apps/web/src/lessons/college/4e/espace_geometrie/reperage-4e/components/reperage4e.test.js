import { describe, it, expect } from 'vitest';
import * as noyau from './reperage4e';
import {
  graduationPour, surUneGraduation, decimalesDuPas, repereDe, graduationsDe,
  lirePoint, placer, atteignable, memePoint,
  estParallelogramme, quatriemeSommet, plusProche,
  assertScope4e, arrondi, fr, couple,
  TEMPERATURES_VALEURS, ALTITUDES_VALEURS,
} from './reperage4e';

/**
 * LE NOYAU, VÉRIFIÉ.
 *
 * Deux familles de garanties :
 *   — les MATHÉMATIQUES sont justes (les verdicts, les milieux, les carrés) ;
 *   — le PÉRIMÈTRE de 4e est tenu, et il l'est de façon EXÉCUTABLE : ce
 *     fichier vérifie l'ABSENCE des fonctions de 3e et de 2nde, pas seulement
 *     la présence d'un commentaire qui les interdit.
 */

/* ═══ Le verdict d'une graduation — le cœur de P2 ═══════════════════════ */
describe('graduationPour — les trois façons dont un pas peut échouer', () => {
  it('un pas TROP FIN est refusé pour le nombre de graduations', () => {
    const g = graduationPour([0, 10], { budget: 26, pas: [0.1, 1] });
    const fin = g.candidats.find((c) => c.pas === 0.1);
    expect(fin.verdict).toBe('trop-de-graduations');
    expect(fin.graduations).toBe(101);
    expect(fin.raison).toMatch(/101 graduations/);
  });

  it('un pas TROP GROS est refusé parce qu’il CONFOND deux relevés distincts', () => {
    // 3 et 4 tombent tous deux sur 5 avec un pas de 5 : deux données
    // différentes deviennent le même point. C'est une destruction, pas un
    // arrondi d'affichage.
    const g = graduationPour([3, 4, 20], { budget: 26, pas: [5] });
    const c = g.candidats[0];
    expect(c.verdict).toBe('points-confondus');
    expect(c.confondus).toEqual([[3, 4]]);
    expect(c.raison).toMatch(/même point/);
  });

  it('un pas de la MAUVAISE FAMILLE laisse des valeurs entre deux traits', () => {
    // Avec un pas de 2, 1 et 3 ne sont sur aucune graduation, mais ils ne se
    // confondent pas non plus : c'est bien un TROISIÈME défaut.
    const g = graduationPour([0, 1, 4, 5, 8], { budget: 26, pas: [2] });
    const c = g.candidats[0];
    expect(c.verdict).toBe('entre-les-graduations');
    expect(c.confondus).toHaveLength(0);
    expect(c.horsNoeud).toEqual([1, 5]);
  });

  it('l’ORDRE des refus est celui que la leçon enseigne', () => {
    // Un axe illisible ne se juge pas sur sa fidélité : « trop de
    // graduations » l'emporte sur tout le reste.
    // Ce pas cumule DEUX défauts : 0,03 et 0,07 tombent entre les traits d'un
    // pas de 0,1, ET l'axe en porterait 101. C'est le premier qui l'emporte.
    const g = graduationPour([0, 0.03, 0.07, 10], { budget: 10, pas: [0.1] });
    expect(g.candidats[0].verdict).toBe('trop-de-graduations');
    expect(g.candidats[0].horsNoeud).toEqual([0.03, 0.07]);
  });

  it('parmi les pas acceptables, le PLUS GRAND est recommandé', () => {
    // Moins de graduations pour la même fidélité : l'axe le plus lisible.
    const g = graduationPour([0, 2, 4, 6], { budget: 26, pas: [0.5, 1, 2] });
    expect(g.recommande).toBe(2);
    expect(g.candidats.filter((c) => c.ok).map((c) => c.pas)).toEqual([0.5, 1, 2]);
  });

  it('refuse un jeu de moins de deux valeurs — il n’y a rien à graduer', () => {
    expect(() => graduationPour([3])).toThrow(/au moins deux/);
  });
});

/* ═══ Les données de la leçon : les verdicts que les modules AFFICHENT ══ */
describe('les jeux de données ont bien la réponse que la leçon annonce', () => {
  it('MODULE 1 — les températures : 0,5 est la SEULE graduation acceptable', () => {
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26 });
    expect(g.recommande).toBe(0.5);
    expect(g.candidats.filter((c) => c.ok).map((c) => c.pas)).toEqual([0.5]);
  });

  it('MODULE 1 — les QUATRE verdicts sont atteignables sur ce seul jeu', () => {
    // C'est la garantie pédagogique du labo signature : l'élève peut faire
    // arriver chacun des trois défauts, puis trouver la réponse.
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26 });
    const par = (p) => g.candidats.find((c) => c.pas === p).verdict;
    expect(par(0.25)).toBe('trop-de-graduations');
    expect(par(0.5)).toBe('ok');
    expect(par(1)).toBe('entre-les-graduations');
    expect(par(2)).toBe('points-confondus');
  });

  it('MODULE 1 — le pas « naturel » de 1 échoue, et c’est tout l’intérêt', () => {
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: [1] });
    expect(g.candidats[0].verdict).toBe('entre-les-graduations');
    expect(g.candidats[0].horsNoeud).toHaveLength(7);
  });

  it('MODULE 3 — les altitudes : la MÊME méthode donne 100, à une autre échelle', () => {
    const g = graduationPour(ALTITUDES_VALEURS, { budget: 26, pas: [10, 25, 50, 100, 200, 250, 500] });
    expect(g.recommande).toBe(100);
    const par = (p) => g.candidats.find((c) => c.pas === p).verdict;
    expect(par(50)).toBe('trop-de-graduations');
    expect(par(100)).toBe('ok');
    expect(par(200)).toBe('points-confondus');
  });
});

/* ═══ Lire et placer — P1 et P3 ═════════════════════════════════════════ */
describe('lirePoint et placer — quand le pas n’est pas 1', () => {
  const rep = { xMin: -3, xMax: 3, yMin: -2, yMax: 2, xStep: 0.5, yStep: 0.5 };

  it('la lecture distingue le COMPTE de graduations et la VALEUR', () => {
    // C'est précisément ce que la 5e n'avait pas à distinguer : avec un pas de
    // 1 les deux nombres coïncident, avec 0,5 ils divergent.
    const l = lirePoint({ x: 1.5, y: -0.5 }, rep);
    expect(l.x).toBe(1.5);
    expect(l.graduationsX).toBe(9); // 9 graduations depuis −3
    expect(l.graduationsY).toBe(3);
    expect(l.surNoeud).toBe(true);
  });

  it('le nombre de DÉCIMALES affichées est imposé par le pas', () => {
    // Écrire « 3 » sous un point posé en 2,5 serait un mensonge de la figure.
    expect(decimalesDuPas(0.5)).toBe(1);
    expect(decimalesDuPas(1)).toBe(0);
    expect(decimalesDuPas(0.25)).toBe(2);
    expect(lirePoint({ x: 1.5, y: 0.5 }, rep).texte).toBe('(1,5 ; 0,5)');
  });

  it('un point posé ENTRE deux graduations est signalé comme tel', () => {
    expect(lirePoint({ x: 1.25, y: 0 }, rep).surNoeud).toBe(false);
  });

  it('placer aimante sur un nœud RÉELLEMENT dessiné', () => {
    expect(placer({ x: 1.4, y: -0.4 }, rep)).toEqual({ x: 1.5, y: -0.5 });
    expect(placer({ x: 1.1, y: 0.1 }, rep)).toEqual({ x: 1, y: 0 });
  });

  it('placer BORNE au cadre : on ne sort jamais du repère', () => {
    expect(placer({ x: 99, y: -99 }, rep)).toEqual({ x: 3, y: -2 });
  });

  it('atteignable dit si une cible tombe sur un nœud — la garde anti-défaut', () => {
    expect(atteignable({ x: 1.5, y: 0.5 }, rep)).toBe(true);
    // Une cible à 2,5 dans une grille de pas 1 serait INATTEIGNABLE : le
    // geste ne pourrait jamais la satisfaire. C'est la classe de défaut qui a
    // cassé deux labos plus tôt dans cette vague.
    expect(atteignable({ x: 2.5, y: 0 }, { ...rep, xStep: 1, yStep: 1 })).toBe(false);
  });

  it('surUneGraduation ne se laisse pas piéger par les flottants', () => {
    expect(surUneGraduation(0.1 + 0.2, 0.1)).toBe(true);
    expect(surUneGraduation(7.5, 0.5)).toBe(true);
    expect(surUneGraduation(7.5, 1)).toBe(false);
  });
});

describe('repereDe — la grille est celle que le noyau a jugée', () => {
  it('l’étendue est arrondie AUX GRADUATIONS, pas aux données', () => {
    const r = repereDe([0, 22], [-3, 7.5], 2, 0.5);
    expect(r).toEqual({ xMin: 0, xMax: 22, yMin: -3, yMax: 7.5, xStep: 2, yStep: 0.5 });
    expect(graduationsDe(r, 'x')).toBe(12);
    expect(graduationsDe(r, 'y')).toBe(22);
  });
});

/* ═══ Décider par les coordonnées — P4 ══════════════════════════════════ */
describe('estParallelogramme — par les milieux des diagonales', () => {
  it('reconnaît un parallélogramme, et rend les DEUX milieux égaux', () => {
    const r = estParallelogramme(
      { x: 0, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 3 }
    );
    expect(r.parallelogramme).toBe(true);
    expect(r.milieuAC).toEqual({ x: 2, y: 2 });
    expect(r.milieuBD).toEqual({ x: 2, y: 2 });
    expect(r.ecart).toBe(0);
  });

  it('refuse un quadrilatère qui n’en est pas un, et dit de combien', () => {
    const r = estParallelogramme(
      { x: 0, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 2 }
    );
    expect(r.parallelogramme).toBe(false);
    expect(r.milieuAC).toEqual({ x: 2, y: 2 });
    expect(r.milieuBD).toEqual({ x: 2, y: 1.5 });
    expect(r.ecart).toBe(0.5);
  });

  it('quatriemeSommet ferme TOUJOURS le parallélogramme', () => {
    // Pas un cas particulier : la propriété doit tenir pour n'importe quels
    // A, B, C — c'est ce qui autorise la leçon à le faire chercher.
    for (const [A, B, C] of [
      [{ x: 0, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 4 }],
      [{ x: -3, y: -1.5 }, { x: -0.5, y: -2.5 }, { x: 2.5, y: 0.5 }],
      [{ x: -2, y: 3 }, { x: 1, y: -1 }, { x: 0, y: 0 }],
    ]) {
      const D = quatriemeSommet(A, B, C);
      expect(estParallelogramme(A, B, C, D).parallelogramme, JSON.stringify(D)).toBe(true);
    }
  });
});

describe('plusProche — comparer sans jamais écrire de racine', () => {
  const P = { x: -1, y: 1 };
  const liste = [
    { x: -5, y: 2, nom: 'Lac' }, { x: 2, y: -1, nom: 'Col' }, { x: 3, y: 3, nom: 'Pins' },
  ];

  it('classe par le CARRÉ de la distance — la racine est hors programme', () => {
    const r = plusProche(P, liste);
    expect(r.gagnant.nom).toBe('Col');
    expect(r.gagnant.carre).toBe(13);
    expect(r.classement.map((m) => m.carre)).toEqual([13, 17, 20]);
  });

  it('le gagnant N’EST PAS le plus évident à l’œil', () => {
    // Le Lac a la plus petite abscisse et « paraît » proche ; il est 2e.
    // Sans cela, l'élève pourrait répondre juste sans calculer.
    const r = plusProche(P, liste);
    expect(r.classement[0].nom).not.toBe('Lac');
    expect(r.classement[1].nom).toBe('Lac');
  });

  it('refuse une liste vide', () => {
    expect(() => plusProche(P, [])).toThrow(/vide/);
  });
});

/* ═══ Le périmètre de 4e, EXÉCUTABLE ════════════════════════════════════ */
describe('périmètre : ce que la 4e ne fait JAMAIS', () => {
  it('assertScope4e lève sur les quatre sujets réservés', () => {
    for (const sujet of ['sphere', 'latitude-longitude', 'coordonnees-espace', 'vecteur']) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/Hors programme de 4e/);
    }
  });

  it('assertScope4e laisse passer ce qui est au programme', () => {
    expect(assertScope4e('graduation')).toBe(true);
  });

  it('le noyau n’EXPOSE aucune fonction de 3e ou de 2nde', () => {
    // La frontière n'est pas une intention : elle est une absence vérifiée.
    for (const interdit of [
      'longueurAB', 'distanceFormule', 'milieuFormule', 'latitude', 'longitude',
      'coordonneesEspace', 'vecteur', 'colineaires', 'norme',
    ]) {
      expect(noyau[interdit], interdit).toBeUndefined();
    }
  });
});

/* ═══ Formats ══════════════════════════════════════════════════════════ */
describe('écriture française', () => {
  it('fr utilise la virgule ET le vrai signe moins', () => {
    expect(fr(-3.5, 1)).toBe('−3,5');
    expect(fr(1200, 0)).toMatch(/^1\s?200$/);
  });

  it('couple écrit le point à la française, avec point-virgule', () => {
    expect(couple({ x: -2.5, y: 1.5 }, 1)).toBe('(−2,5 ; 1,5)');
    expect(couple({ x: 3, y: -1 }, 0)).toBe('(3 ; −1)');
  });

  it('memePoint et arrondi sont sûrs sur les flottants', () => {
    expect(memePoint({ x: 0.1 + 0.2, y: 0 }, { x: 0.3, y: 0 }, 1e-9)).toBe(true);
    expect(arrondi(2.675, 2)).toBeCloseTo(2.68, 9);
  });
});
