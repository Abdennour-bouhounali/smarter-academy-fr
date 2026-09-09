import { describe, it, expect } from 'vitest';
import {
  round2, eur, pct,
  ATELIERS, ENTREES_M1, couples, rapports, alignesAvecOrigine,
  quatriemeProportionnelle, produitsEnCroix, passageEntier, estDecimalFini,
  coefficientMultiplicateur, appliquerEvolution, coefficientSuccessif, tauxSuccessif,
  tauxRetour, valeurInitiale,
} from './prop4e';
import { ratToNumber, ratEq, rat } from '../../../../../common/algebra4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « les deux montent », « il
 * fallait −20 % », « 35 ÷ 3 ne tombe pas juste », « la moitié des crans ne
 * permet pas d'y arriver ». Ces affirmations sont du contenu pédagogique : si
 * le comportement réel diffère, la leçon MENT à l'élève, et aucun test
 * d'unité du noyau ne l'attrape.
 *
 * Ce fichier teste donc les ÉNONCÉS des modules, sur leurs données exactes.
 * (Même intention que `equations-4e/components/parcours.test.js`, qui a
 * corrigé une phrase annonçant « des fractions » là où l'élève voyait 0,8.)
 */

/* ═══ MODULE 1 — La fabrique ═══════════════════════════════════════════ */
describe('Module 1 — « les deux montent, un seul est proportionnel »', () => {
  const C = ATELIERS.aLaCommande;
  const B = ATELIERS.avecMiseEnRoute;

  it('les DEUX ateliers montent : le contraste ne peut pas se jouer là-dessus', () => {
    for (const a of [C, B]) {
      const ys = ENTREES_M1.map((x) => a.apply(x));
      expect(ys.every((y, i) => i === 0 || y > ys[i - 1]), a.id).toBe(true);
    }
  });

  it('la phrase du module 1 est exacte : chez Cléo une affiche coûte toujours 1,50 €', () => {
    expect(eur(C.k)).toBe('1,50 €');
    const rs = rapports(couples(C, ENTREES_M1)).map((c) => c.r);
    expect(new Set(rs).size).toBe(1);
    expect(rs[0]).toBe(1.5);
  });

  it('les deux prix par affiche CITÉS pour Bruno sont ceux que le code produit', () => {
    // Le module affiche « X € pour 2 affiches, Y € pour 10 ».
    expect(round2(B.apply(2) / 2)).toBe(4.5);
    expect(round2(B.apply(10) / 10)).toBe(2.1);
    // et ils sont bien DIFFÉRENTS — sinon la phrase ne prouverait rien.
    expect(round2(B.apply(2) / 2)).not.toBe(round2(B.apply(10) / 10));
  });

  it('la mise en route annoncée (6 €) est bien ce que Bruno facture pour 0 affiche', () => {
    expect(B.apply(0)).toBe(6);
    expect(eur(B.base)).toBe('6 €');
  });

  it('la prédiction du module 1 a une vraie réponse : 10 affiches ≠ le double de 5 chez Bruno', () => {
    expect(C.apply(10)).toBe(2 * C.apply(5));
    expect(B.apply(10)).not.toBe(2 * B.apply(5));
  });

  it('AUCUN prix affiché n’est négatif ni nul-mais-payant : la figure ne ment jamais', () => {
    for (const a of [C, B]) {
      for (const x of ENTREES_M1) expect(a.apply(x)).toBeGreaterThanOrEqual(0);
    }
  });
});

/* ═══ MODULE 2 — La case vide ══════════════════════════════════════════ */
describe('Module 2 — « ici le calcul se fait de tête, là il ne se fait plus »', () => {
  const FACILE = { a: 2, b: 5, c: 6, d: 15 };
  const UTILE = { a: 3, b: 7, c: 5 };
  const FAUX = { a: 4, b: 10, c: 6, d: 14 };

  it('le tableau « facile » est proportionnel ET a un passage entier — les deux à la fois', () => {
    const { gauche, droite } = produitsEnCroix(FACILE.a, FACILE.b, FACILE.c, FACILE.d);
    expect(gauche).toBe(droite);
    expect(passageEntier(FACILE.a, FACILE.c)).toBe(true);
    expect(FACILE.c / FACILE.a).toBe(3); // « de 2 à 6, on multiplie par 3 »
  });

  it('le tableau « utile » n’offre AUCUN raccourci : ni passage entier, ni prix unitaire rond', () => {
    expect(passageEntier(UTILE.a, UTILE.c)).toBe(false);
    // le prix d'une affiche, 7/3, n'est pas un décimal fini non plus
    expect(estDecimalFini(rat(UTILE.b, UTILE.a))).toBe(false);
  });

  it('la valeur cherchée vaut EXACTEMENT 35/3, et le module a raison de le dire', () => {
    const d = quatriemeProportionnelle(UTILE.a, UTILE.b, UTILE.c);
    expect(ratEq(d, rat(35, 3))).toBe(true);
    expect(estDecimalFini(d)).toBe(false);
    // la phrase « environ 11,67 € » doit correspondre à l'affichage réel
    expect(ratToNumber(d).toFixed(2)).toBe('11.67');
  });

  it('la question « combien vaut 7 × 5 » porte bien sur la diagonale CONNUE', () => {
    expect(UTILE.b * UTILE.c).toBe(35);
  });

  it('le tableau « faux » l’est vraiment, et ses deux produits diffèrent visiblement', () => {
    const { gauche, droite } = produitsEnCroix(FAUX.a, FAUX.b, FAUX.c, FAUX.d);
    expect(gauche).toBe(56);
    expect(droite).toBe(60);
    expect(gauche).not.toBe(droite);
  });
});

/* ═══ MODULE 3 — Le prix qui change ════════════════════════════════════ */
describe('Module 3 — les coefficients annoncés', () => {
  it('+20 % vaut ×1,2 et −30 % vaut ×0,7 : les réponses attendues sont exactes', () => {
    expect(coefficientMultiplicateur(0.2)).toBeCloseTo(1.2, 10);
    expect(coefficientMultiplicateur(-0.3)).toBeCloseTo(0.7, 10);
  });

  it('la place de cinéma : 12 € augmentée de 15 % donne bien 13,80 €', () => {
    const r = appliquerEvolution(12, 0.15);
    expect(r).toBe(13.8);
    expect(eur(r)).toBe('13,80 €');
  });

  it('les distracteurs chiffrés du module nomment de VRAIES erreurs', () => {
    // « tu as trouvé la hausse » : 12 × 0,15 = 1,80
    expect(round2(12 * 0.15)).toBe(1.8);
    // « on n’ajoute pas 15 » : 12 + 15 = 27
    expect(12 + 15).toBe(27);
  });

  it('le coefficient franchit 1 exactement au taux nul — ce que le labo fait voir', () => {
    expect(coefficientMultiplicateur(-0.01)).toBeLessThan(1);
    expect(coefficientMultiplicateur(0)).toBe(1);
    expect(coefficientMultiplicateur(0.01)).toBeGreaterThan(1);
  });
});

/* ═══ MODULE 4 — Revenir en arrière ════════════════════════════════════ */
describe('Module 4 — ATTEIGNABILITÉ et exactitude du retour', () => {
  const DEPART = 40;
  const HAUSSE = 0.25;
  const APRES = appliquerEvolution(DEPART, HAUSSE);

  it('le prix après hausse est un nombre rond : 40 € → 50 €', () => {
    expect(APRES).toBe(50);
  });

  it('LE RETOUR EXACT TOMBE SUR UN CRAN DU CURSEUR (pas de 1 point de %)', () => {
    // Sans cela, l'étape 1 serait IMPOSSIBLE à réussir : c'est le défaut
    // qu'aucun test unitaire du noyau n'attrape (mémoire « cible atteignable »).
    const exact = tauxRetour(HAUSSE);
    expect(exact).toBeCloseTo(-0.2, 10);
    expect(Math.abs(exact * 100 - Math.round(exact * 100))).toBeLessThan(1e-9);
    expect(appliquerEvolution(APRES, -0.2)).toBe(DEPART);
  });

  it('le cran choisi est le SEUL qui retombe exactement sur le départ', () => {
    const gagnants = [];
    for (let p = -40; p <= 0; p += 1) {
      if (appliquerEvolution(APRES, p / 100) === DEPART) gagnants.push(p);
    }
    expect(gagnants).toEqual([-20]);
  });

  it('le PIÈGE est bien un piège : −25 % ne ramène pas à 40 €', () => {
    expect(appliquerEvolution(APRES, -HAUSSE)).toBe(37.5);
    expect(appliquerEvolution(APRES, -HAUSSE)).not.toBe(DEPART);
  });

  it('le coefficient des deux évolutions successives est celui que le module affiche', () => {
    expect(coefficientSuccessif([HAUSSE, -HAUSSE])).toBeCloseTo(0.9375, 10);
    expect(tauxSuccessif([HAUSSE, -HAUSSE])).toBeCloseTo(-0.0625, 10);
    // La phrase « il manque … » doit citer CE taux-là.
    expect(pct(tauxSuccessif([HAUSSE, -HAUSSE]))).toBe('−6,3 %');
  });

  it('les chaussures : 48 € après −20 % viennent bien de 60 €', () => {
    expect(valeurInitiale(48, coefficientMultiplicateur(-0.2))).toBe(60);
    expect(appliquerEvolution(60, -0.2)).toBe(48);
    // le distracteur cité (57,60 €) est bien le résultat de l'erreur nommée
    expect(appliquerEvolution(48, -0.2)).toBe(38.4);
    expect(appliquerEvolution(48, 0.2)).toBe(57.6);
  });

  it('la question finale (−30 % puis +30 %) donne le taux annoncé', () => {
    expect(coefficientSuccessif([-0.3, 0.3])).toBeCloseTo(0.91, 10);
    expect(pct(tauxSuccessif([-0.3, 0.3]))).toBe('−9 %');
  });

  it('la borne du curseur contient la solution : −20 % est dans [−40 % ; 0 %]', () => {
    expect(-0.2).toBeGreaterThanOrEqual(-0.4);
    expect(-0.2).toBeLessThanOrEqual(0);
  });
});

/* ═══ MODULE 5 — Le graphique décide ═══════════════════════════════════ */
describe('Module 5 — ATTEIGNABILITÉ des points à poser', () => {
  const XS = [2, 4, 6, 8];
  const Y_STEP = 3;
  const Y_MAX = 21;

  it('CHAQUE point à poser tombe sur un nœud du quadrillage', () => {
    // Sans cela, l'élève ne pourrait pas déposer son point : l'étape serait
    // impossible, exactement comme au module 4 (mémoire « cible atteignable »).
    for (const atelier of Object.values(ATELIERS)) {
      for (const x of XS) {
        const y = atelier.apply(x);
        expect(Math.abs(y / Y_STEP - Math.round(y / Y_STEP)), `${atelier.id} x=${x} y=${y}`)
          .toBeLessThan(1e-9);
      }
    }
  });

  it('aucun point ne sort du cadre', () => {
    for (const atelier of Object.values(ATELIERS)) {
      for (const x of XS) {
        expect(atelier.apply(x), `${atelier.id} x=${x}`).toBeLessThanOrEqual(Y_MAX);
        expect(atelier.apply(x)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('les DEUX séries sont parfaitement alignées — sinon le module ne prouverait rien', () => {
    for (const atelier of Object.values(ATELIERS)) {
      const cs = XS.map((x) => ({ x, y: atelier.apply(x) }));
      const pente = (cs[1].y - cs[0].y) / (cs[1].x - cs[0].x);
      const b = cs[0].y - pente * cs[0].x;
      expect(cs.every((c) => Math.abs(c.y - (pente * c.x + b)) < 1e-9), atelier.id).toBe(true);
    }
  });

  it('…mais une SEULE passe par l’origine : c’est tout le critère', () => {
    const cs = (a) => XS.map((x) => ({ x, y: a.apply(x) }));
    expect(alignesAvecOrigine(cs(ATELIERS.aLaCommande))).toBe(true);
    expect(alignesAvecOrigine(cs(ATELIERS.avecMiseEnRoute))).toBe(false);
  });

  it('l’ordonnée à l’origine citée par le module est bien 6 €', () => {
    expect(ATELIERS.avecMiseEnRoute.apply(0)).toBe(6);
    expect(ATELIERS.aLaCommande.apply(0)).toBe(0);
  });
});
