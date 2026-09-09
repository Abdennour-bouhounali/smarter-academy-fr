import { describe, it, expect } from 'vitest';
import {
  round2, fr, eur, pct, coefTexte,
  proportionnelle, partFixe, parPaliers, couples, rapports, rapportConstant,
  alignesAvecOrigine, verdict,
  quatriemeProportionnelle, produitsEnCroix, croixEgales, passageEntier, estDecimalFini,
  coefficientMultiplicateur, appliquerEvolution, appliquerCoefficient, tauxEntre,
  valeurInitiale, coefficientSuccessif, tauxSuccessif, tauxRetour, differenceEnPoints,
  assertScope4e, ATELIERS, ENTREES_M1,
} from './prop4e';
import { rat, ratEq, ratToNumber } from '../../../../../common/algebra4e';
import * as prop4e from './prop4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('n’expose AUCUNE fonction linéaire (objet de 3e)', () => {
    expect(prop4e.fonctionLineaire).toBeUndefined();
    expect(prop4e.coefficientDirecteur).toBeUndefined();
  });

  it('n’expose AUCUN effet d’agrandissement sur les aires ou les volumes (k², k³ — 3e)', () => {
    expect(prop4e.aireAgrandie).toBeUndefined();
    expect(prop4e.volumeAgrandi).toBeUndefined();
    expect(prop4e.k2).toBeUndefined();
    expect(prop4e.k3).toBeUndefined();
  });

  it('n’expose AUCUN Thalès (objet de 3e)', () => {
    expect(prop4e.thales).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    for (const sujet of ['aire-agrandie', 'volume-agrandi', 'fonction-lineaire', 'thales']) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/3e/);
    }
    expect(assertScope4e('produit-en-croix')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES SITUATIONS — vérifiées sur TOUT le domaine, pas sur un échantillon
   ══════════════════════════════════════════════════════════════════════ */
describe('Les deux ateliers du module 1', () => {
  it('l’atelier proportionnel double sa sortie quand on double l’entrée — PARTOUT', () => {
    const s = ATELIERS.aLaCommande;
    for (const x of ENTREES_M1) {
      expect(round2(s.apply(2 * x)), `x=${x}`).toBe(round2(2 * s.apply(x)));
    }
  });

  it('l’atelier à mise en route NE double PAS — sur toute entrée non nulle', () => {
    const s = ATELIERS.avecMiseEnRoute;
    for (const x of ENTREES_M1.filter((v) => v > 0)) {
      expect(round2(s.apply(2 * x)), `x=${x}`).not.toBe(round2(2 * s.apply(x)));
    }
  });

  it('AUCUNE des deux sorties n’est négative sur le domaine — la figure ne peut pas mentir', () => {
    for (const s of Object.values(ATELIERS)) {
      for (const x of ENTREES_M1) expect(s.apply(x), `${s.id} x=${x}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('à entrée nulle, l’un rend 0 et l’autre fait quand même payer : le contraste est là dès x = 0', () => {
    expect(ATELIERS.aLaCommande.apply(0)).toBe(0);
    expect(ATELIERS.avecMiseEnRoute.apply(0)).toBe(6);
  });

  it('les deux ateliers ne se départagent PAS au seul « ça monte » : les deux montent', () => {
    for (const s of Object.values(ATELIERS)) {
      const ys = ENTREES_M1.map((x) => s.apply(x));
      expect(ys.every((y, i) => i === 0 || y > ys[i - 1]), s.id).toBe(true);
    }
  });

  it('une part fixe NULLE est refusée : ce serait une situation proportionnelle déguisée', () => {
    expect(() => partFixe({ base: 0, k: 2 })).toThrow(/proportionnelle/);
  });
});

describe('rapports et alignement — les deux lectures du critère', () => {
  const P = ATELIERS.aLaCommande;
  const F = ATELIERS.avecMiseEnRoute;

  it('le rapport est constant pour le proportionnel, et pour lui seul', () => {
    expect(rapportConstant(couples(P, ENTREES_M1))).toBe(true);
    expect(rapportConstant(couples(F, ENTREES_M1))).toBe(false);
  });

  it('le rapport de la part fixe DIMINUE quand l’entrée grandit — c’est ce qu’on voit', () => {
    const rs = rapports(couples(F, [1, 2, 4, 8, 16])).map((c) => c.r);
    expect(rs).toEqual([...rs].sort((a, b) => b - a));
    expect(rs[0]).toBeGreaterThan(rs[rs.length - 1]);
  });

  it('l’entrée nulle est écartée du calcul des rapports (on ne divise pas par zéro)', () => {
    expect(rapports(couples(P, [0, 1, 2]))).toHaveLength(2);
    expect(rapports(couples(P, [0, 1, 2])).every((c) => Number.isFinite(c.r))).toBe(true);
  });

  it('LE PIÈGE DU NIVEAU : la part fixe donne des points parfaitement ALIGNÉS…', () => {
    const cs = couples(F, ENTREES_M1);
    const utiles = cs.filter((c) => c.x !== 0);
    const pente = (utiles[1].y - utiles[0].y) / (utiles[1].x - utiles[0].x);
    expect(utiles.every((c) => Math.abs(c.y - (F.base + pente * c.x)) < 1e-9)).toBe(true);
  });

  it('…mais PAS avec l’origine — et c’est le seul critère qui tranche', () => {
    expect(alignesAvecOrigine(couples(P, ENTREES_M1))).toBe(true);
    expect(alignesAvecOrigine(couples(F, ENTREES_M1))).toBe(false);
  });

  it('les paliers cassent le critère d’une TROISIÈME manière : ni rapport, ni droite', () => {
    const T = parPaliers({
      paliers: [{ jusqua: 5, prix: 10 }, { jusqua: 10, prix: 18 }, { jusqua: 999, prix: 25 }],
    });
    expect(rapportConstant(couples(T, [1, 3, 6, 9, 12]))).toBe(false);
    expect(alignesAvecOrigine(couples(T, [1, 3, 6, 9, 12]))).toBe(false);
    // et le prix ne bouge pas DANS une tranche : c'est la signature du palier
    expect(T.apply(1)).toBe(T.apply(5));
    expect(T.apply(6)).not.toBe(T.apply(5));
  });

  it('verdict ne renvoie jamais un booléen seul : il porte la RAISON', () => {
    expect(verdict(P, ENTREES_M1).raison).toMatch(/rapport/);
    expect(verdict(F, ENTREES_M1).raison).toMatch(/entrée nulle|part/);
    expect(verdict(P, ENTREES_M1).proportionnel).toBe(true);
    expect(verdict(F, ENTREES_M1).proportionnel).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA QUATRIÈME PROPORTIONNELLE — exacte, et utile seulement quand elle l'est
   ══════════════════════════════════════════════════════════════════════ */
describe('quatriemeProportionnelle — un rationnel EXACT, jamais un arrondi', () => {
  it('3 objets pour 7 € : 5 objets coûtent 35/3 €, pas 11,67 €', () => {
    const r = quatriemeProportionnelle(3, 7, 5);
    expect(ratEq(r, rat(35, 3))).toBe(true);
    expect(estDecimalFini(r)).toBe(false);
    expect(ratToNumber(r)).toBeCloseTo(11.666666, 5);
  });

  it('rend un entier quand le résultat est entier', () => {
    expect(ratEq(quatriemeProportionnelle(2, 6, 5), rat(15))).toBe(true);
  });

  it('rend un décimal fini quand il l’est, et le SAIT', () => {
    const r = quatriemeProportionnelle(4, 5, 2); // 2,5
    expect(estDecimalFini(r)).toBe(true);
    expect(ratToNumber(r)).toBe(2.5);
  });

  it('REFUSE une première valeur nulle : sans coefficient, il n’y a rien à trouver', () => {
    expect(() => quatriemeProportionnelle(0, 7, 5)).toThrow(/nulle/);
  });

  it('est cohérente avec le produit en croix, sur une grille exhaustive', () => {
    for (let a = 1; a <= 9; a += 1) {
      for (let b = 1; b <= 9; b += 1) {
        for (let c = 1; c <= 9; c += 1) {
          const d = quatriemeProportionnelle(a, b, c);
          // a × d = b × c, en rationnels exacts
          expect(ratEq(rat(a * d.n, d.d), rat(b * c)), `${a} ${b} ${c}`).toBe(true);
        }
      }
    }
  });
});

describe('produit en croix — il ne sert que quand aucun passage n’est entier', () => {
  it('détecte un tableau proportionnel par l’égalité des deux produits', () => {
    expect(croixEgales(3, 7, 6, 14)).toBe(true);
    expect(croixEgales(3, 7, 6, 15)).toBe(false);
    const { gauche, droite } = produitsEnCroix(3, 7, 6, 14);
    expect(gauche).toBe(droite);
  });

  it('LE CAS OÙ L’OUTIL EST INUTILE : un passage entier se fait de tête', () => {
    expect(passageEntier(2, 6)).toBe(true);   // ×3
    expect(passageEntier(3, 12)).toBe(true);  // ×4
  });

  it('LE CAS OÙ L’OUTIL EST NÉCESSAIRE : ni le passage horizontal ni l’unité ne tombent juste', () => {
    expect(passageEntier(3, 5)).toBe(false);
    const r = quatriemeProportionnelle(3, 7, 5);
    expect(estDecimalFini(r)).toBe(false); // 35/3 : pas de raccourci décimal non plus
  });

  it('une valeur nulle en première colonne n’est jamais un passage entier', () => {
    expect(passageEntier(0, 5)).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉVOLUTIONS
   ══════════════════════════════════════════════════════════════════════ */
describe('coefficient multiplicateur — une évolution est une MULTIPLICATION', () => {
  it('+20 % vaut ×1,2 et −20 % vaut ×0,8', () => {
    expect(coefficientMultiplicateur(0.2)).toBeCloseTo(1.2);
    expect(coefficientMultiplicateur(-0.2)).toBeCloseTo(0.8);
    expect(coefficientMultiplicateur(0)).toBe(1);
  });

  it('appliquer un taux et appliquer son coefficient donnent le même prix', () => {
    for (const t of [-0.5, -0.2, -0.05, 0, 0.05, 0.2, 0.5, 1]) {
      for (const v of [12, 39.9, 250, 4.5]) {
        expect(appliquerEvolution(v, t), `${v} ${t}`).toBe(appliquerCoefficient(v, coefficientMultiplicateur(t)));
      }
    }
  });

  it('le taux entre deux valeurs est bien celui qui les relie', () => {
    expect(tauxEntre(50, 60)).toBeCloseTo(0.2);
    expect(tauxEntre(60, 48)).toBeCloseTo(-0.2);
    expect(appliquerEvolution(50, tauxEntre(50, 60))).toBe(60);
  });
});

describe('LE CŒUR DU MODULE 4 : revenir en arrière n’est pas l’évolution opposée', () => {
  it('+20 % puis −20 % ne ramène PAS au départ : il manque 4 %', () => {
    const k = coefficientSuccessif([0.2, -0.2]);
    expect(k).toBeCloseTo(0.96);
    expect(appliquerCoefficient(100, k)).toBe(96);
    // et le taux global vaut bien −4 %, pas 0 %
    expect(tauxSuccessif([0.2, -0.2])).toBeCloseTo(-0.04);
  });

  it('après +25 %, il faut −20 % pour revenir — et non −25 %', () => {
    expect(tauxRetour(0.25)).toBeCloseTo(-0.2);
    const prix = appliquerEvolution(80, 0.25); // 100
    expect(prix).toBe(100);
    expect(appliquerEvolution(prix, tauxRetour(0.25))).toBe(80);
    expect(appliquerEvolution(prix, -0.25)).toBe(75); // l'erreur visée, chiffrée
  });

  it('valeurInitiale annule exactement l’évolution, sur une grille de cas', () => {
    for (const t of [-0.4, -0.25, -0.1, 0.05, 0.15, 0.3, 0.75]) {
      for (const depart of [20, 45.5, 120, 999]) {
        const final = appliquerEvolution(depart, t);
        expect(valeurInitiale(final, coefficientMultiplicateur(t)), `${depart} ${t}`).toBeCloseTo(depart, 1);
      }
    }
  });

  it('un coefficient nul n’a pas de retour possible : null, pas une division par zéro', () => {
    expect(valeurInitiale(50, 0)).toBeNull();
  });

  it('POINTS et POUR CENT ne se confondent pas : de 20 % à 25 %, c’est +5 points ET +25 %', () => {
    expect(differenceEnPoints(0.2, 0.25)).toBeCloseTo(0.05);
    expect(tauxEntre(0.2, 0.25)).toBeCloseTo(0.25);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉCRITURES — ce que l'élève LIT
   ══════════════════════════════════════════════════════════════════════ */
describe('Les écritures françaises', () => {
  it('un prix garde ses centimes quand il en a, et pas de « 4,5 € »', () => {
    expect(eur(4.5)).toBe('4,50 €');
    expect(eur(12)).toBe('12 €');
    expect(eur(96)).toBe('96 €');
  });

  it('un taux est signé et lisible', () => {
    expect(pct(0.2)).toBe('+20 %');
    expect(pct(-0.2)).toBe('−20 %');
    expect(pct(0)).toBe('0 %');
    // le vrai signe moins (U+2212), pas le tiret du clavier
    expect(pct(-0.2).charCodeAt(0)).toBe(0x2212);
  });

  it('un coefficient s’écrit avec assez de décimales pour ne pas mentir', () => {
    expect(coefTexte(1.2)).toBe('×1,2');
    expect(coefTexte(0.96)).toBe('×0,96');
    expect(coefTexte(1.0025)).toBe('×1,0025');
  });

  it('round2 ne laisse pas passer le bruit binaire', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(1.005 * 100)).toBe(100.5);
  });

  it('fr sépare les milliers (espace fine insécable, U+202F)', () => {
    const s = fr(12500);
    expect(s.replace(/ | /g, ' ')).toBe('12 500');
  });
});
