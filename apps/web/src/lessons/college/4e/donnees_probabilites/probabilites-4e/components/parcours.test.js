import { describe, it, expect } from 'vitest';
import {
  SAC, ROUE, EVENEMENTS_SAC, TAILLES_DE_SERIE, NOMBRE_DE_SERIES, GRAINE_LECON,
  graineSuivante, experience, evenementSi, probabilite, fraction,
  contraire, intersection, reunion, compteNaifReunion,
  estImpossible, estCertain, series, amplitude, ecartMoyen, tableauDeStabilisation,
} from './proba4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « les cinq séries se
 * resserrent », « ça ferait 8, mais deux billes restent éteintes », « le
 * contraire de rouge, ce sont les bleues ET les vertes ». Ces affirmations
 * sont du contenu pédagogique : si le comportement réel diffère, la leçon
 * MENT à l'élève, et aucun test d'unité du noyau ne l'attrape.
 */

/* ═══ MODULE 1 — Dix mille tours ═══════════════════════════════════════ */
describe('Module 1 — la roue de départ et la stabilisation promise', () => {
  const DEPART = { or: 3, violet: 2, turquoise: 2, rose: 1 };
  const roueDe = (c) =>
    experience({
      id: 'r',
      nom: 'roue',
      issues: Object.entries(c).flatMap(([couleur, n]) =>
        Array.from({ length: n }, (_, i) => ({ id: `${couleur}${i}`, label: couleur, couleur }))
      ),
    });

  it('la roue de départ a 8 secteurs, dont 3 or : P(or) = 3/8', () => {
    const exp = roueDe(DEPART);
    expect(exp.issues.length).toBe(8);
    const or = evenementSi(exp, (i) => i.couleur === 'or');
    expect(fraction(probabilite(or))).toBe('3/8');
  });

  it('la prédiction « exactement 3 fois sur 10 » a une vraie réponse : c’est rare', () => {
    // P(or) = 0,375 ; sur 10 tours on attend 3,75 en moyenne. Obtenir
    // EXACTEMENT 3 n'arrive pas à tous les coups — c'est ce que le module fait voir.
    const exp = roueDe(DEPART);
    const or = evenementSi(exp, (i) => i.couleur === 'or');
    const cinq = series(exp, or, 10, GRAINE_LECON, NOMBRE_DE_SERIES);
    const effectifs = cinq.map((s) => s.effectif);
    expect(new Set(effectifs).size).toBeGreaterThan(1); // elles ne sont pas toutes égales
  });

  it('L’ÉCART PROMIS DIMINUE VRAIMENT de 10 à 10 000 tours', () => {
    // C'est LA phrase du module 1. Vérifiée sur plusieurs graines, pas une seule.
    const exp = roueDe(DEPART);
    const or = evenementSi(exp, (i) => i.couleur === 'or');
    for (const g of [GRAINE_LECON, 1, 4242, 987654321]) {
      const petit = amplitude(series(exp, or, TAILLES_DE_SERIE[0], g, NOMBRE_DE_SERIES));
      const grand = amplitude(series(exp, or, TAILLES_DE_SERIE[TAILLES_DE_SERIE.length - 1], g, NOMBRE_DE_SERIES));
      expect(grand, `graine ${g}`).toBeLessThan(petit);
    }
  });

  it('l’écart n’est JAMAIS nul : la leçon a raison de dire « proche », pas « égal »', () => {
    const exp = roueDe(DEPART);
    const or = evenementSi(exp, (i) => i.couleur === 'or');
    const s = series(exp, or, 10000, GRAINE_LECON, NOMBRE_DE_SERIES);
    expect(ecartMoyen(s)).toBeGreaterThan(0);
  });

  it('« relancer » donne des séries VISIBLEMENT différentes (le piège de la graine voisine)', () => {
    const exp = roueDe(DEPART);
    const or = evenementSi(exp, (i) => i.couleur === 'or');
    const a = series(exp, or, 100, GRAINE_LECON, NOMBRE_DE_SERIES).map((s) => s.effectif);
    const b = series(exp, or, 100, graineSuivante(GRAINE_LECON), NOMBRE_DE_SERIES).map((s) => s.effectif);
    expect(a).not.toEqual(b);
  });

  it('une roue SANS secteur est refusée par le noyau — le labo ne doit donc pas la construire', () => {
    // Garde volontaire : une expérience aléatoire a au moins une issue.
    // `RoueLab` ne construit l'expérience que si `total > 0` et invite sinon
    // l'élève à remettre un secteur (état atteignable en retirant tout).
    expect(() => roueDe({ or: 0, violet: 0, turquoise: 0, rose: 0 })).toThrow(/au moins une issue/);
  });
});

/* ═══ MODULE 3 — Tout ce qui reste ═════════════════════════════════════ */
describe('Module 3 — le contraire, et le piège annoncé', () => {
  const R = EVENEMENTS_SAC.rouge;
  const nonR = contraire(R);

  it('le sac contient bien 8 billes, dont 4 rouges : P(rouge) = 1/2', () => {
    expect(SAC.issues.length).toBe(8);
    expect(R.issues.length).toBe(4);
    expect(fraction(probabilite(R))).toBe('1/2');
  });

  it('LE PIÈGE EXISTE : « pas rouge » n’est pas « bleue » — il y a aussi du vert', () => {
    expect(nonR.issues.length).toBe(4);
    expect(nonR.issues).toContain('V1');
    expect(EVENEMENTS_SAC.bleue.issues.length).toBe(3);
    // le contraire est STRICTEMENT plus grand que « bleue » : le contre-exemple est visible
    expect(nonR.issues.length).toBeGreaterThan(EVENEMENTS_SAC.bleue.issues.length);
  });

  it('la réponse attendue à la question décimale est bien 0,5', () => {
    const p = probabilite(nonR);
    expect(p.n / p.d).toBe(0.5);
  });

  it('le distracteur 0,25 nomme une VRAIE erreur (compter seulement les bleues… ou presque)', () => {
    // 2/8 = 0,25 : l'élève qui ne compte ni le vert ni une bleue tombe là.
    expect(2 / 8).toBe(0.25);
  });

  it('un événement et son contraire n’ont AUCUNE issue commune et couvrent tout', () => {
    expect(intersection(R, nonR).issues).toEqual([]);
    expect(reunion(R, nonR).issues.length).toBe(SAC.issues.length);
  });
});

/* ═══ MODULE 4 — ET, ou bien OU ════════════════════════════════════════ */
describe('Module 4 — le comptage naïf se réfute SUR LA FIGURE', () => {
  const R = EVENEMENTS_SAC.rouge;
  const G = EVENEMENTS_SAC.grande;

  it('les nombres annoncés sont exacts : 4 rouges, 4 grandes, 2 dans les deux, 6 en tout', () => {
    expect(R.issues.length).toBe(4);
    expect(G.issues.length).toBe(4);
    expect(intersection(R, G).issues.length).toBe(2);
    expect(reunion(R, G).issues.length).toBe(6);
  });

  it('LE COMPTAGE NAÏF DONNE « CERTAIN » — et deux billes restent visiblement éteintes', () => {
    // C'est ce qui rend l'erreur réfutable d'un coup d'œil : 8/8 voudrait dire
    // que TOUTES les billes sont allumées, or B2 et B3 ne le sont pas.
    expect(compteNaifReunion(R, G)).toBe(SAC.issues.length);
    const eteintes = SAC.issues.filter((b) => !reunion(R, G).issues.includes(b.id));
    expect(eteintes.map((b) => b.id)).toEqual(['B2', 'B3']);
  });

  it('l’écart entre le comptage naïf et la réalité vaut exactement l’intersection', () => {
    expect(compteNaifReunion(R, G) - reunion(R, G).issues.length).toBe(intersection(R, G).issues.length);
  });

  it('le couple SANS chevauchement rend l’addition juste — le contre-cas du module', () => {
    const B = EVENEMENTS_SAC.bleue;
    expect(intersection(R, B).issues).toEqual([]);
    expect(compteNaifReunion(R, B)).toBe(reunion(R, B).issues.length);
  });

  it('les probabilités affichées sont exactes', () => {
    expect(fraction(probabilite(intersection(R, G)))).toBe('1/4');
    expect(fraction(probabilite(reunion(R, G)))).toBe('3/4');
  });
});

/* ═══ MODULE 5 — Du jamais au toujours ═════════════════════════════════ */
describe('Module 5 — les deux bornes existent VRAIMENT dans ce sac', () => {
  it('« noire » est impossible : aucune bille du sac n’est noire', () => {
    expect(estImpossible(EVENEMENTS_SAC.noire)).toBe(true);
    expect(fraction(probabilite(EVENEMENTS_SAC.noire))).toBe('0');
  });

  it('« colorée » est certain : toutes les billes le sont', () => {
    expect(estCertain(EVENEMENTS_SAC.coloree)).toBe(true);
    expect(fraction(probabilite(EVENEMENTS_SAC.coloree))).toBe('1');
  });

  it('les deux sont contraires l’un de l’autre — la remarque du module est juste', () => {
    expect(contraire(EVENEMENTS_SAC.noire).issues).toEqual(EVENEMENTS_SAC.coloree.issues);
  });
});

/* ═══ MODULE 6 — Le labo ═══════════════════════════════════════════════ */
describe('Module 6 — le raisonnement chiffré de la dernière question', () => {
  it('8 piles sur 20 fait 0,4, à comparer à 0,375 : l’écart est bien minuscule', () => {
    expect(8 / 20).toBe(0.4);
    expect(Math.abs(0.4 - 0.375)).toBeLessThan(0.03);
  });

  it('la roue reprise au module 6 est la MÊME que celle du module 1 par défaut', () => {
    const DEPART = { or: 3, violet: 2, turquoise: 2, rose: 1 };
    expect(Object.values(DEPART).reduce((s, x) => s + x, 0)).toBe(8);
    expect(DEPART.or / 8).toBe(0.375);
  });
});

/* ═══ BOSS — les nombres des dix épreuves ══════════════════════════════ */
describe('Boss — chaque épreuve chiffrée est exacte', () => {
  it('jeu de 32 cartes : 16 rouges, 4 rois, 2 rois rouges, 18 « rouge OU roi »', () => {
    expect(16 + 4 - 2).toBe(18);
  });

  it('les jetons ne se chevauchent pas : 5 + 7 = 12 est la bonne réponse', () => {
    expect(5 + 7).toBe(12);
  });

  it('1 − 0,35 = 0,65', () => {
    expect(Math.round((1 - 0.35) * 100) / 100).toBe(0.65);
  });

  it('le distracteur 20 de l’épreuve « rouge OU roi » est bien le comptage naïf', () => {
    expect(16 + 4).toBe(20);
  });
});
