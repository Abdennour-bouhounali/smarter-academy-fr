/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT : « chaque carte porte SA dérivée au dos », « la règle
 * naïve survit pour + et ×k », « elle échoue ÉCLATANTIQUEMENT pour × », « voici
 * la dérivée de cette fonction ». Si le comportement réel diffère, la leçon
 * ment — et aucun test du noyau partagé ne l'attrape : `derivative.test.js`
 * vérifie que `numericDerivative` est juste, pas qu'un module dit vrai.
 *
 * PÉRIMÈTRE : aucun test ne porte sur le signe de f′ et les variations, ni sur
 * l'optimisation (« Dérivation : variations et optimisation »), ni sur la
 * théorie des limites.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseDec } from '@smarter-academy/core';
import {
  CARTES, carte, OPERATEURS, assemblage, confronter, CONTRE_EXEMPLE, POINTS_LAB,
  tauxUsuel, H_STEPS, tableTaux, quotient, composee, ecartComposee, ATELIER,
  fr, parseSigned, arrondi,
} from './reglesUtils';

/** La dérivée par la définition, au pas symétrique : le juge indépendant. */
const parLaDefinition = (f, x, h = 1e-6) => (f(x + h) - f(x - h)) / (2 * h);

describe('les dérivées au dos des cartes sont EXACTES', () => {
  it('chaque carte tient sa promesse : fPrime redonne la définition', () => {
    for (const c of CARTES) {
      for (const x of [0.5, 1, 2, 3, 4]) {
        if (!c.domaine(x)) continue;
        expect(c.fPrime(x), `${c.id} en ${x}`).toBeCloseTo(parLaDefinition(c.f, x), 4);
      }
    }
  });

  it('la carte constante a une dérivée NULLE partout — pas « presque nulle »', () => {
    const k = carte('constante');
    for (const x of [-3, 0, 2.5, 10]) expect(k.fPrime(x)).toBe(0);
  });

  it('les textes du verso correspondent aux formules, aux points remarquables', () => {
    // Le verso est ce que l'élève LIT : s'il diffère de fPrime, la carte ment.
    expect(carte('carre').derivee).toBe('2x');
    expect(carte('carre').fPrime(3)).toBe(6);
    expect(carte('cube').derivee).toBe('3x²');
    expect(carte('cube').fPrime(2)).toBe(12);
    expect(carte('identite').fPrime(7)).toBe(1);
    expect(carte('inverse').fPrime(2)).toBeCloseTo(-0.25, 12);
    expect(carte('racine').fPrime(4)).toBeCloseTo(0.25, 12);
  });

  it('les domaines interdisent les points où la carte n’existe pas', () => {
    expect(carte('inverse').domaine(0)).toBe(false);
    expect(carte('racine').domaine(0)).toBe(false);
    expect(carte('racine').domaine(-1)).toBe(false);
    // Et donc aucun point du cliquet ne produit NaN, sur AUCUNE carte.
    for (const c of CARTES) {
      for (const x of POINTS_LAB) {
        expect(c.domaine(x), `${c.id} en ${x}`).toBe(true);
        expect(Number.isFinite(c.fPrime(x))).toBe(true);
      }
    }
  });

  it('carte() refuse un id inconnu plutôt que de rendre undefined', () => {
    expect(() => carte('exponentielle')).toThrow(/carte inconnue/);
  });
});

describe('module 1 — la règle naïve SURVIT pour la somme et le produit par un réel', () => {
  it('sur toute paire de cartes, (u + v)′ = u′ + v′ — balayé, pas échantillonné', () => {
    for (const g of CARTES) {
      for (const d of CARTES) {
        const asm = assemblage({ gauche: g.id, droite: d.id, op: 'somme' });
        for (const x of POINTS_LAB) {
          const c = confronter(asm, x);
          expect(c.naifTient, `${g.id} + ${d.id} en ${x}`).toBe(true);
          expect(c.vrai).toBeCloseTo(c.mesure, 4);
        }
      }
    }
  });

  it('le coefficient k traverse la dérivation : (k·u)′ = k·u′', () => {
    for (const k of [2, 3, -4, 0.5]) {
      for (const g of CARTES) {
        const asm = assemblage({ gauche: g.id, droite: 'constante', op: 'somme', k });
        for (const x of POINTS_LAB) {
          expect(asm.fPrime(x)).toBeCloseTo(k * g.fPrime(x), 10);
          expect(asm.fPrime(x)).toBeCloseTo(parLaDefinition(asm.f, x), 4);
        }
      }
    }
  });
});

describe('module 1 — et elle ÉCHOUE ÉCLATANTIQUEMENT pour le produit', () => {
  it('le contre-exemple annoncé (x² × x) : (uv)′ = 3x² alors que u′v′ = 2x', () => {
    const asm = assemblage(CONTRE_EXEMPLE);
    // uv = x³ : la fonction assemblée EST bien le cube.
    for (const x of POINTS_LAB) expect(asm.f(x)).toBeCloseTo(x ** 3, 10);
    for (const x of POINTS_LAB) {
      expect(asm.fPrime(x)).toBeCloseTo(3 * x * x, 10);
      expect(asm.fPrimeNaif(x)).toBeCloseTo(2 * x, 10);
    }
    // Le point cité par le module : 12 contre 4.
    const c = confronter(asm, 2);
    expect(c.vrai).toBeCloseTo(12, 10);
    expect(c.naif).toBeCloseTo(4, 10);
    expect(c.mesure).toBeCloseTo(12, 4);
    expect(c.naifTient).toBe(false);
  });

  it('l’écart est ÉCLATANT sur TOUT le cliquet, pas seulement au point choisi', () => {
    // « Regarde, ça ne colle pas » doit être vrai PARTOUT où l'élève se place.
    const asm = assemblage(CONTRE_EXEMPLE);
    for (const x of POINTS_LAB) {
      const c = confronter(asm, x);
      expect(c.naifTient, `x = ${x}`).toBe(false);
      // Facteur ≥ 2 entre la prédiction et la réalité : lisible à l'œil nu.
      expect(Math.abs(c.vrai) / Math.abs(c.naif), `x = ${x}`).toBeGreaterThanOrEqual(1.5);
      expect(c.ecart, `x = ${x}`).toBeGreaterThan(1);
    }
    // Et l'écart CROÎT : plus l'élève avance, plus la faute saute aux yeux.
    const ecarts = POINTS_LAB.map((x) => confronter(asm, x).ecart);
    for (let i = 1; i < ecarts.length; i += 1) expect(ecarts[i]).toBeGreaterThan(ecarts[i - 1]);
  });

  it('l’échec n’est pas une bizarrerie de CE couple : il est massif sur le banc', () => {
    let echecs = 0;
    let total = 0;
    for (const g of CARTES) {
      for (const d of CARTES) {
        const asm = assemblage({ gauche: g.id, droite: d.id, op: 'produit' });
        const c = confronter(asm, 2);
        total += 1;
        if (!c.naifTient) echecs += 1;
      }
    }
    // Les seuls survivants sont les produits par une CONSTANTE (u′v′ = 0 = …
    // non : même là c'est faux sauf cas dégénéré). On exige une écrasante
    // majorité d'échecs, pour que le banc ne puisse pas rassurer par hasard.
    expect(echecs / total).toBeGreaterThan(0.7);
  });

  it('la vraie règle du produit tient contre la définition, sur tout le banc', () => {
    for (const g of CARTES) {
      for (const d of CARTES) {
        const asm = assemblage({ gauche: g.id, droite: d.id, op: 'produit', k: 3 });
        for (const x of POINTS_LAB) {
          expect(asm.fPrime(x), `${g.id}×${d.id} en ${x}`).toBeCloseTo(parLaDefinition(asm.f, x), 3);
        }
      }
    }
  });

  it('le banc REFUSE structurellement d’emboîter un assemblage dans un autre', () => {
    // Le périmètre se code en throw, il ne se commente pas : la composée
    // multiple est hors programme de Première.
    expect(() => assemblage({ gauche: { u: 'carre' }, droite: 'identite', op: 'somme' }))
      .toThrow(/n’emboîte que des CARTES/);
    expect(() => assemblage({ gauche: 'carre', droite: 'identite', op: 'composition' }))
      .toThrow(/opérateur inconnu/);
  });

  it('confronter() refuse un point hors du domaine plutôt que d’afficher NaN', () => {
    const asm = assemblage({ gauche: 'inverse', droite: 'racine', op: 'produit' });
    expect(() => confronter(asm, 0)).toThrow(/hors du domaine/);
  });
});

describe('module 2 — les dérivées usuelles se DÉCOUVRENT par le taux', () => {
  it('les crans de h sont décroissants et exactement atteignables', () => {
    for (let i = 1; i < H_STEPS.length; i += 1) expect(H_STEPS[i]).toBeLessThan(H_STEPS[i - 1]);
    expect(H_STEPS.at(-1)).toBe(0.001);
  });

  it('sur chaque carte, les taux CONVERGENT vers la dérivée exacte', () => {
    for (const c of CARTES) {
      for (const a of [1, 2, 4]) {
        const ecarts = H_STEPS.map((h) => Math.abs(tauxUsuel(c, a, h) - c.fPrime(a)));
        for (let i = 1; i < ecarts.length; i += 1) {
          expect(ecarts[i], `${c.id} en ${a}`).toBeLessThanOrEqual(ecarts[i - 1] + 1e-12);
        }
        // RELATIF, pas absolu : sur x³ en a = 4, le dernier cran laisse encore
        // 0,012 d'écart pour une dérivée de 48 — soit 0,025 %. Un seuil absolu
        // de 0,01 aurait déclaré la convergence en échec là où la table que
        // l'élève lit affiche 48,01 face à 48. Le test l'a attrapé.
        // Écart RELATIF quand la dérivée n'est pas nulle, ABSOLU sinon : la
        // carte constante a f′ = 0 partout, et un rapport 0/0 rendrait NaN.
        const exact = Math.abs(c.fPrime(a));
        const mesureEcart = exact > 0 ? ecarts.at(-1) / exact : ecarts.at(-1);
        expect(mesureEcart, `${c.id} en ${a}`).toBeLessThan(0.002);
      }
    }
  });

  it('les valeurs citées par le module 2 sont exactes au chiffre près', () => {
    // x³ en a = 2 : le taux vaut 12 + 6h + h², donc 12,601 pour h = 0,1.
    expect(tauxUsuel(carte('cube'), 2, 0.1)).toBeCloseTo(12.61, 10);
    expect(tableTaux(carte('cube'), 2).exact).toBe(12);
    // 1/x en a = 2 : le taux vaut −1/(2(2+h)), donc −0,2381 pour h = 0,1.
    expect(tauxUsuel(carte('inverse'), 2, 0.1)).toBeCloseTo(-0.2381, 4);
    expect(tableTaux(carte('inverse'), 2).exact).toBeCloseTo(-0.25, 12);
    // √x en a = 4 : la dérivée exacte vaut 1/4.
    expect(tableTaux(carte('racine'), 4).exact).toBeCloseTo(0.25, 12);
  });

  it('tableTaux ne rend jamais NaN sur les points employés par le module', () => {
    for (const c of CARTES) {
      for (const l of tableTaux(c, 2).lignes) expect(Number.isNaN(l.taux)).toBe(false);
    }
  });
});

describe('module 4 — le quotient', () => {
  it('(u/v)′ = (u′v − uv′)/v² tient contre la définition', () => {
    const q = quotient({ haut: 'identite', bas: 'carre' });
    for (const x of POINTS_LAB) {
      expect(q.fPrime(x), `x = ${x}`).toBeCloseTo(parLaDefinition(q.f, x), 5);
    }
  });

  it('la règle plausible « u′/v′ » est FAUSSE, et l’écart est visible', () => {
    const q = quotient({ haut: 'identite', bas: 'carre' });   // x/x² = 1/x
    for (const x of POINTS_LAB) {
      expect(Math.abs(q.fPrime(x) - q.fPrimeNaif(x)), `x = ${x}`).toBeGreaterThan(0.05);
    }
    // Le point cité par le module : en x = 2, la vraie pente vaut −0,25 alors
    // que « u′/v′ » prédit 0,25 — signe OPPOSÉ, l'erreur ne peut pas passer.
    expect(q.fPrime(2)).toBeCloseTo(-0.25, 10);
    expect(q.fPrimeNaif(2)).toBeCloseTo(0.25, 10);
    expect(Math.sign(q.fPrime(2))).not.toBe(Math.sign(q.fPrimeNaif(2)));
  });

  it('le domaine du quotient exclut l’annulation du dénominateur ET de v′', () => {
    const q = quotient({ haut: 'identite', bas: 'carre' });
    expect(q.domaine(0)).toBe(false);
    for (const x of POINTS_LAB) expect(q.domaine(x)).toBe(true);
  });
});

describe('module 5 — la composée simple (ax + b)^n', () => {
  it('la dérivée exacte n·a·(ax + b)^(n−1) tient contre la définition', () => {
    for (const [a, b, n] of [[3, -2, 4], [2, 1, 3], [5, 4, 2], [-2, 3, 5]]) {
      const c = composee({ a, b, n });
      for (const x of [-1, 0, 1, 2]) {
        expect(c.fPrime(x), `(${a}x+${b})^${n} en ${x}`).toBeCloseTo(parLaDefinition(c.f, x, 1e-5), 2);
      }
    }
  });

  it('l’oubli du facteur intérieur est VISIBLE : le rapport vaut exactement a', () => {
    // Si a valait 1, l'oubli serait invisible et l'exercice n'enseignerait rien.
    for (const [a, b, n] of [[3, -2, 4], [2, 1, 3], [5, 4, 2]]) {
      const c = composee({ a, b, n });
      for (const x of [0, 1, 2]) {
        if (c.fPrimeNaif(x) === 0) continue;
        expect(c.fPrime(x) / c.fPrimeNaif(x)).toBeCloseTo(a, 10);
        expect(ecartComposee(c, x)).toBeGreaterThan(0);
      }
      expect(Math.abs(a)).toBeGreaterThan(1);
    }
  });

  it('les valeurs citées par le module : (3x − 2)⁴ en x = 1 → 12', () => {
    const c = composee({ a: 3, b: -2, n: 4 });
    expect(c.f(1)).toBe(1);
    expect(c.fPrime(1)).toBe(12);
    expect(c.fPrimeNaif(1)).toBe(4);       // l'oubli du 3
  });

  it('le périmètre est CODÉ : n non entier, n < 1 ou a nul sont refusés', () => {
    expect(() => composee({ a: 3, b: 1, n: 0.5 })).toThrow(/entier/);
    expect(() => composee({ a: 3, b: 1, n: 0 })).toThrow(/entier/);
    expect(() => composee({ a: 0, b: 1, n: 3 })).toThrow(/a nul/);
  });
});

describe('module 6 — chaque dérivée de l’atelier est VRAIE', () => {
  it('les cinq énoncés : la dérivée annoncée redonne la définition', () => {
    for (const item of ATELIER) {
      for (const x of [0.5, 1, 2, 3]) {
        if (item.domaine && !item.domaine(x)) continue;
        expect(item.fPrime(x), `${item.id} en ${x}`).toBeCloseTo(parLaDefinition(item.f, x, 1e-5), 3);
      }
    }
  });

  it('l’atelier couvre les quatre règles, sans trou', () => {
    const regles = new Set(ATELIER.map((a) => a.regle));
    for (const r of ['somme', 'produit', 'quotient', 'composee']) expect(regles.has(r)).toBe(true);
  });

  it('g(x) = (2x + 1)(x² − 3) se développe bien en 2x³ + x² − 6x − 3', () => {
    // Le module PROPOSE de vérifier par développement : il faut que ce soit vrai.
    const g = ATELIER.find((a) => a.id === 'a2');
    for (const x of [-2, 0, 1, 3]) {
      expect(g.f(x)).toBeCloseTo(2 * x ** 3 + x * x - 6 * x - 3, 10);
      expect(g.fPrime(x)).toBeCloseTo(6 * x * x + 2 * x - 6, 10);
    }
  });
});

describe('écriture française et saisie', () => {
  it('fr utilise la virgule et le VRAI signe moins', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(-3)).toBe('−3');
    expect(fr(-0.25)).toBe('−0,25');
    expect(arrondi(2.09999999)).toBe(2.1);
  });

  it('parseSigned accepte le moins que la leçon AFFICHE, pas seulement le tiret ASCII', () => {
    const p = parseSigned(parseDec);
    expect(p('−4')).toBe(-4);        // U+2212, celui que fr() produit
    expect(p('–4')).toBe(-4);        // demi-cadratin
    expect(p('—4')).toBe(-4);        // cadratin
    expect(p('-4')).toBe(-4);
    expect(p('−0,25')).toBeCloseTo(-0.25, 12);
    expect(p('12')).toBe(12);
    // Le piège exact : parseDec seul REFUSE le moins affiché par la leçon.
    expect(parseDec('−4')).not.toBe(-4);
  });
});

describe('mission finale — les distracteurs sont NUMÉRIQUEMENT distincts', () => {
  it('e1 — dérivée de x⁵ en 2 : 80, et aucun piège ne vaut 80', () => {
    const bonne = 5 * 2 ** 4;                 // 80
    const pieges = [2 ** 5, 5 * 2 ** 5, 4 * 2 ** 3];   // 32, 160, 32 … distincts de 80
    expect(bonne).toBe(80);
    for (const p of pieges) expect(p).not.toBe(bonne);
    expect(new Set([bonne, 32, 160, 20]).size).toBe(4);
  });

  it('e4 — (uv)′ pour u = x², v = x + 1 en x = 1 : 5, contre le piège naïf 2', () => {
    const u = { f: (x) => x * x, fp: (x) => 2 * x };
    const v = { f: (x) => x + 1, fp: () => 1 };
    const vrai = u.fp(1) * v.f(1) + u.f(1) * v.fp(1);   // 2×2 + 1×1 = 5
    const naif = u.fp(1) * v.fp(1);                     // 2
    expect(vrai).toBe(5);
    expect(naif).toBe(2);
    expect(new Set([5, 2, 4, 3]).size).toBe(4);
    // Et la vraie valeur tient contre la définition.
    expect(vrai).toBeCloseTo(parLaDefinition((x) => x * x * (x + 1), 1), 4);
  });

  it('e6 — (x/(x+1))′ en x = 1 : 1/4, et les pièges en diffèrent', () => {
    const q = ATELIER.find((a) => a.id === 'a3');
    expect(q.fPrime(1)).toBeCloseTo(0.25, 12);
    expect(new Set([0.25, 1, -0.25, 0.5]).size).toBe(4);
  });

  it('e8 — ((3x − 2)⁴)′ en x = 1 : 12, contre l’oubli du 3 qui donne 4', () => {
    const c = composee({ a: 3, b: -2, n: 4 });
    expect(c.fPrime(1)).toBe(12);
    expect(c.fPrimeNaif(1)).toBe(4);
    expect(new Set([12, 4, 36, 3]).size).toBe(4);
  });

  it('les cinq LP sont couverts par au moins une épreuve QUI LEUR EST PROPRE', () => {
    // Lu en TEXTE, comme le validateur : c'est ce qu'il voit réellement.
    const src = readFileSync(
      new URL('../modules/Module07MissionFinaleLUsine.jsx', import.meta.url),
      'utf8'
    );
    const listes = [...src.matchAll(/learningPointIds: \[([^\]]+)\]/g)].map((m) =>
      m[1].split(',').map((s) => s.trim().replace(/'/g, ''))
    );
    expect(listes).toHaveLength(10);
    const prefixe = 'premiere_specialite_derivation-calculer-1ere_P';
    for (const n of [1, 2, 3, 4, 5]) {
      const seule = listes.some((l) => l.length === 1 && l[0] === `${prefixe}${n}`);
      expect(seule, `P${n} doit avoir une épreuve dédiée`).toBe(true);
    }
  });
});
