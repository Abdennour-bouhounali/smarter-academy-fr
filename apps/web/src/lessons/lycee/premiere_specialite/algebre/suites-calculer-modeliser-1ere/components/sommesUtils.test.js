/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « u(30) = 95 », « chaque paire
 * a la même hauteur », « S − qS ne laisse que deux termes », « la ville passe
 * sous 10 000 habitants la cinquième année ». Ce sont des CONTENUS
 * PÉDAGOGIQUES : si le comportement réel diffère, la leçon MENT, et
 * `sequences.test.js` ne l'attrape pas — il vérifie que `nthArithmetic` est
 * juste, pas qu'un module dit vrai en la citant.
 *
 * Les formules fermées (Gauss, géométrique) ne sont JAMAIS crues : elles sont
 * comparées par balayage à la somme terme à terme, qui est la référence.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  fr, eur, parseNombre,
  sommeTermes, sommeArithmetique, sommeGeometrique, apparierGauss, telescopage,
  SAUT_U0, SAUT_R, SAUT_CIBLE, SAUT_SEUIL_CLICS, sautTerme, sautGen, etatSaut,
  ESCALIERS, ESCALIER_HAUTEUR_MAX, escalier,
  CAS_ARITHMETIQUES, CAS_GEOMETRIQUES, GEO_PLAFOND, CAS_SOMMES_GEO,
  SITUATIONS, rangDeFranchissement, totalCumule,
  terms, arithmetic, geometric, nthArithmetic, nthGeometric, detectKind,
} from './sommesUtils';

/* ══ Les sommes : la formule fermée est comparée au terme à terme ══════════ */

describe('sommes — la formule fermée n’est jamais crue, elle est BALAYÉE', () => {
  it('Gauss coïncide avec la somme terme à terme, sur toute une plage de (u0, r, n)', () => {
    let cas = 0;
    for (let u0 = -10; u0 <= 10; u0 += 1) {
      for (let r = -6; r <= 6; r += 1) {
        for (let n = 0; n <= 20; n += 1) {
          const brut = sommeTermes(terms(arithmetic(u0, r), n));
          expect(sommeArithmetique(u0, r, n), `u0=${u0} r=${r} n=${n}`).toBeCloseTo(brut, 9);
          cas += 1;
        }
      }
    }
    expect(cas).toBe(21 * 13 * 21);
  });

  it('la somme géométrique coïncide avec le terme à terme, q entier, décimal ET < 1', () => {
    const qs = [-2, -0.5, 0.25, 0.5, 0.96, 1.05, 1.5, 2, 3, 10];
    for (const u0 of [1, 2, 4, 16, 400, -3]) {
      for (const q of qs) {
        for (let n = 0; n <= 12; n += 1) {
          const brut = sommeTermes(terms(geometric(u0, q), n));
          const ferme = sommeGeometrique(u0, q, n);
          // Tolérance RELATIVE : à q = 10 et n = 12 la somme dépasse 10¹².
          expect(Math.abs(ferme - brut) / Math.max(1, Math.abs(brut)), `u0=${u0} q=${q} n=${n}`)
            .toBeLessThan(1e-9);
        }
      }
    }
  });

  it('LE CAS q = 1 : la formule ne divise pas par zéro, elle compte les termes', () => {
    for (const u0 of [1, 7, -4, 0.5]) {
      for (let n = 0; n <= 10; n += 1) {
        expect(sommeGeometrique(u0, 1, n)).toBe((n + 1) * u0);
        expect(Number.isFinite(sommeGeometrique(u0, 1, n))).toBe(true);
      }
    }
    // Et tout près de 1, la branche générale reste finie et juste.
    expect(sommeGeometrique(1, 1.0000001, 5)).toBeCloseTo(sommeTermes(terms(geometric(1, 1.0000001), 5)), 6);
  });

  it('LE COMPTE DES TERMES : de u0 à un il y a n + 1 termes, jamais n', () => {
    for (let n = 0; n <= 15; n += 1) {
      expect(terms(sautGen, n)).toHaveLength(n + 1);
      // La formule de Gauss utilise bien n + 1 : sur une suite constante 1,
      // la somme vaut exactement le nombre de termes.
      expect(sommeArithmetique(1, 0, n)).toBe(n + 1);
      expect(sommeGeometrique(1, 1, n)).toBe(n + 1);
    }
  });
});

/* ══ Module 4 : l'appariement de Gauss, PAIR ET IMPAIR ════════════════════ */

describe('module 4 — L’APPARIEMENT EST EXACT, cas pair ET cas impair', () => {
  it('BALAYÉ : chaque paire a la MÊME hauteur totale, sur toute une plage', () => {
    let cas = 0;
    for (let u0 = -8; u0 <= 8; u0 += 1) {
      for (let r = -5; r <= 5; r += 1) {
        for (let n = 1; n <= 15; n += 1) {
          const list = terms(arithmetic(u0, r), n);
          const g = apparierGauss(list);
          for (const p of g.paires) {
            expect(p.total, `u0=${u0} r=${r} n=${n} paire ${p.i}/${p.j}`).toBeCloseTo(g.totalPaire, 9);
          }
          cas += 1;
        }
      }
    }
    expect(cas).toBe(17 * 11 * 15);
  });

  it('CAS PAIR (nombre de termes pair) : aucune colonne centrale, et la somme se retrouve', () => {
    for (let n = 1; n <= 15; n += 2) {          // n impair ⟹ n + 1 termes PAIR
      const list = terms(sautGen, n);
      expect(list.length % 2).toBe(0);
      const g = apparierGauss(list);
      expect(g.centre).toBeNull();
      expect(g.paires).toHaveLength(list.length / 2);
      expect(g.paires.length * g.totalPaire).toBe(g.somme);
      expect(g.somme).toBe(sommeArithmetique(SAUT_U0, SAUT_R, n));
    }
  });

  it('CAS IMPAIR : la colonne centrale EXISTE, et vaut exactement la DEMI-hauteur d’une paire', () => {
    // C'est ce qui rend la division par 2 nécessaire plutôt que suspecte : la
    // colonne seule ne casse pas la formule, elle l'explique.
    for (let n = 0; n <= 14; n += 2) {          // n pair ⟹ n + 1 termes IMPAIR
      const list = terms(sautGen, n);
      expect(list.length % 2).toBe(1);
      const g = apparierGauss(list);
      expect(g.centre).not.toBeNull();
      expect(g.centre.i).toBe((list.length - 1) / 2);
      expect(g.centre.valeur * 2).toBeCloseTo(g.totalPaire, 9);
      expect(g.paires.length * g.totalPaire + g.centre.valeur).toBeCloseTo(g.somme, 9);
      expect(g.somme).toBe(sommeArithmetique(SAUT_U0, SAUT_R, n));
    }
  });

  it('LES DEUX ESCALIERS de la leçon sont bien l’un pair et l’autre impair', () => {
    const parites = ESCALIERS.map((s) => escalier(s));
    expect(parites.map((e) => e.parite)).toEqual(['pair', 'impair']);
    const [pair, impair] = parites;
    expect(pair.nbTermes % 2).toBe(0);
    expect(pair.centre).toBeNull();
    expect(impair.nbTermes % 2).toBe(1);
    expect(impair.centre).not.toBeNull();
  });

  it('SÉCURITÉ DE MISE EN PAGE : au plus neuf colonnes, et aucune plus haute que le plafond', () => {
    // Les colonnes sont dessinées en DOM côte à côte : à 375 px, dix colonnes
    // ne tiennent plus. La hauteur borne l'échelle du dessin.
    for (const spec of ESCALIERS) {
      const e = escalier(spec);
      expect(e.nbTermes).toBeLessThanOrEqual(9);
      expect(e.nbTermes).toBeGreaterThanOrEqual(4);   // moins de 4, pas de paire à apparier
      for (const v of e.list) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThanOrEqual(ESCALIER_HAUTEUR_MAX);
        expect(Number.isInteger(v)).toBe(true);       // aucune décimale dans une colonne
      }
    }
  });

  it('les valeurs que le module 4 cite sont celles-là : 75 pour six colonnes, 98 pour sept', () => {
    const [pair, impair] = ESCALIERS.map(escalier);
    expect(pair.list).toEqual([5, 8, 11, 14, 17, 20]);
    expect(pair.somme).toBe(75);
    expect(pair.totalPaire).toBe(25);
    expect(pair.paires).toHaveLength(3);
    expect(impair.list).toEqual([5, 8, 11, 14, 17, 20, 23]);
    expect(impair.somme).toBe(98);
    expect(impair.totalPaire).toBe(28);
    expect(impair.paires).toHaveLength(3);
    expect(impair.centre.valeur).toBe(14);
  });
});

/* ══ Module 1 : le laboratoire signature ══════════════════════════════════ */

describe('module 1 — « Sauter au rang 30 » : le coût est réel, la cible atteignable', () => {
  it('CIBLE ATTEIGNABLE et LISIBLE : u(30) est un entier qui tient dans une case', () => {
    expect(sautTerme(SAUT_CIBLE)).toBe(95);
    expect(Number.isInteger(sautTerme(SAUT_CIBLE))).toBe(true);
    expect(sautTerme(SAUT_CIBLE)).toBeLessThan(1000);   // trois chiffres : lisible partout
  });

  it('AUCUN DÉPASSEMENT : tout terme du chemin est entier, positif et borné', () => {
    for (let n = 0; n <= SAUT_CIBLE; n += 1) {
      const v = sautTerme(n);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(sautTerme(SAUT_CIBLE));
    }
  });

  it('le pas-à-pas et la formule explicite donnent EXACTEMENT la même chose', () => {
    // C'est l'aha du module : la marche et le saut arrivent au même endroit.
    let courant = SAUT_U0;
    for (let n = 0; n <= SAUT_CIBLE; n += 1) {
      expect(courant, `rang ${n}`).toBe(nthArithmetic(SAUT_U0, SAUT_R, n));
      courant += SAUT_R;
    }
  });

  it('LE SEUIL D’EXASPÉRATION est bien inférieur à la cible : le raccourci arrive à temps', () => {
    expect(SAUT_SEUIL_CLICS).toBeGreaterThanOrEqual(8);
    expect(SAUT_SEUIL_CLICS).toBeLessThan(SAUT_CIBLE / 2);
    // Après le seuil, il resterait encore au moins vingt pas à faire à la main :
    // le raccourci n'est pas une politesse, il est nécessaire.
    expect(SAUT_CIBLE - SAUT_SEUIL_CLICS).toBeGreaterThanOrEqual(20);
  });

  it('etatSaut : le raccourci ne s’ouvre qu’au seuil, et le rang est borné des deux côtés', () => {
    expect(etatSaut(0, 0).sautOuvert).toBe(false);
    expect(etatSaut(9, SAUT_SEUIL_CLICS - 1).sautOuvert).toBe(false);
    expect(etatSaut(10, SAUT_SEUIL_CLICS).sautOuvert).toBe(true);
    expect(etatSaut(-5, 0).rang).toBe(0);
    expect(etatSaut(999, 40).rang).toBe(SAUT_CIBLE);
    expect(etatSaut(SAUT_CIBLE, 40).atteint).toBe(true);
    expect(etatSaut(12, 12).restants).toBe(SAUT_CIBLE - 12);
    expect(etatSaut(7, 7).marches).toEqual(terms(sautGen, 7));
  });

  it('L’ÉTAT DE DÉPART n’est pas déjà arrivé : il y a bien un chemin à parcourir', () => {
    const depart = etatSaut(0, 0);
    expect(depart.atteint).toBe(false);
    expect(depart.restants).toBe(SAUT_CIBLE);
    expect(depart.terme).toBe(SAUT_U0);
  });
});

/* ══ Module 5 : le télescopage ════════════════════════════════════════════ */

describe('module 5 — LE TÉLESCOPAGE : tout le milieu s’annule, il ne reste que deux termes', () => {
  it('BALAYÉ : S − qS vaut u0 − u0·q^(n+1), pour q entier, décimal, < 1 et négatif', () => {
    for (const u0 of [1, 2, 16, 400, -3]) {
      for (const q of [-2, 0.5, 0.6, 0.96, 1.05, 2, 3, 5]) {
        for (let n = 0; n <= 10; n += 1) {
          const t = telescopage(u0, q, n);
          const attendu = u0 - u0 * q ** (n + 1);
          expect(Math.abs(t.difference - attendu) / Math.max(1, Math.abs(attendu)), `u0=${u0} q=${q} n=${n}`)
            .toBeLessThan(1e-9);
          expect(t.debut).toBe(u0);
          expect(t.fin).toBeCloseTo(-u0 * q ** (n + 1), 6);
        }
      }
    }
  });

  it('le nombre de termes qui s’annulent est bien celui qu’annonce le module', () => {
    for (let n = 0; n <= 8; n += 1) {
      const t = telescopage(1, 2, n);
      expect(t.ligneS).toHaveLength(n + 1);
      expect(t.ligneQS).toHaveLength(n + 1);
      expect(t.annules).toBe(n);
      // Chaque terme de S sauf le premier a son jumeau dans qS.
      for (let k = 1; k <= n; k += 1) expect(t.ligneS[k]).toBeCloseTo(t.ligneQS[k - 1], 9);
    }
  });

  it('et la formule qu’on en déduit est bien celle de sommeGeometrique', () => {
    for (const c of CAS_SOMMES_GEO) {
      const t = telescopage(c.u0, c.q, c.n);
      // S(1 − q) = u0 − u0 q^(n+1)  ⟹  S = (u0 − u0 q^(n+1)) / (1 − q)
      const parTelescopage = t.difference / (1 - c.q);
      expect(parTelescopage).toBeCloseTo(sommeGeometrique(c.u0, c.q, c.n), 9);
      expect(parTelescopage).toBeCloseTo(sommeTermes(terms(geometric(c.u0, c.q), c.n)), 9);
    }
  });

  it('LES LIGNES AFFICHÉES restent lisibles : entières pour q entier, bornées sinon', () => {
    for (const c of CAS_SOMMES_GEO) {
      const t = telescopage(c.u0, c.q, c.n);
      for (const v of [...t.ligneS, ...t.ligneQS]) {
        expect(Math.abs(v)).toBeLessThan(1000);
        if (Number.isInteger(c.q) && Number.isInteger(c.u0)) expect(Number.isInteger(v)).toBe(true);
      }
      expect(t.ligneS.length).toBeLessThanOrEqual(6);   // six colonnes tiennent à 375 px
    }
  });
});

/* ══ Modules 2 et 3 : les termes de rang n ════════════════════════════════ */

describe('modules 2 et 3 — le terme de rang n, RECALCULÉ par déroulé', () => {
  it('arithmétique : u0 + n·r est exactement ce que donne le pas-à-pas', () => {
    for (const c of CAS_ARITHMETIQUES) {
      let courant = c.u0;
      for (let k = 0; k < c.n; k += 1) courant += c.r;
      expect(nthArithmetic(c.u0, c.r, c.n), c.id).toBe(courant);
      expect(Number.isInteger(courant), c.id).toBe(true);
    }
  });

  it('LA RAISON NÉGATIVE ne demande aucune formule différente', () => {
    const c = CAS_ARITHMETIQUES.find((x) => x.r < 0);
    expect(c).toBeDefined();
    expect(nthArithmetic(c.u0, c.r, c.n)).toBe(c.u0 + c.n * c.r);
    expect(nthArithmetic(c.u0, c.r, c.n)).toBe(40);
    // Le piège « on soustrait n fois la valeur absolue » donne la MÊME chose
    // ici — donc il n'est pas un piège : le vrai piège est u0 − n·r.
    expect(c.u0 - c.n * c.r).not.toBe(nthArithmetic(c.u0, c.r, c.n));
  });

  it('géométrique : u0·qⁿ est exactement ce que donne le pas-à-pas, sous le plafond', () => {
    for (const c of CAS_GEOMETRIQUES) {
      let courant = c.u0;
      for (let k = 0; k < c.n; k += 1) courant *= c.q;
      expect(nthGeometric(c.u0, c.q, c.n), c.id).toBeCloseTo(courant, 6);
      expect(Math.abs(nthGeometric(c.u0, c.q, c.n)), c.id).toBeLessThan(GEO_PLAFOND);
    }
  });

  it('AUCUN DÉPASSEMENT sur le chemin d’une géométrique citée', () => {
    for (const c of CAS_GEOMETRIQUES) {
      for (let n = 0; n <= c.n; n += 1) {
        const v = nthGeometric(c.u0, c.q, n);
        expect(Number.isFinite(v), `${c.id} rang ${n}`).toBe(true);
        expect(Math.abs(v)).toBeLessThan(GEO_PLAFOND);
      }
    }
  });

  it('les valeurs citées par les modules 2 et 3 : 95, 86, 40 · 3072, 651,56, 1', () => {
    expect(nthArithmetic(5, 3, 30)).toBe(95);
    expect(nthArithmetic(2, 7, 12)).toBe(86);
    expect(nthArithmetic(100, -4, 15)).toBe(40);
    expect(nthGeometric(3, 2, 10)).toBe(3072);
    expect(Math.round(nthGeometric(400, 1.05, 10) * 100) / 100).toBe(651.56);
    expect(nthGeometric(64, 0.5, 6)).toBe(1);
  });
});

/* ══ Module 6 : modéliser et interpréter ══════════════════════════════════ */

describe('module 6 — LES TROIS SITUATIONS disent vrai, seuils compris', () => {
  it('chaque situation a bien la nature qu’elle annonce', () => {
    for (const s of SITUATIONS) {
      const list = terms(s.gen, 6);
      const d = detectKind(list);
      expect(d.kind, `${s.id} — ${s.titre}`).toBe(s.nature);
      expect(d.raison, s.id).toBeCloseTo(s.raison, 9);
      expect(list[0]).toBeCloseTo(s.u0, 9);
    }
  });

  it('LE SEUIL EST FRANCHI, et à un rang raisonnable — sinon la question serait sans réponse', () => {
    for (const s of SITUATIONS) {
      const f = rangDeFranchissement(s.gen, s.seuil);
      expect(f, `${s.id} : le seuil ${s.seuil} n’est jamais franchi`).not.toBeNull();
      expect(f.rang, s.id).toBeGreaterThan(0);
      expect(f.rang, s.id).toBeLessThanOrEqual(60);
      // Le rang JUSTE AVANT n'a pas franchi : le rang trouvé est bien le PREMIER.
      const avant = s.gen(f.rang - 1);
      if (f.sens === 'decroissante') expect(avant).toBeGreaterThan(s.seuil);
      else expect(avant).toBeLessThan(s.seuil);
    }
  });

  it('les rangs de franchissement cités par le module : 20 mois, 5 ans, 5 jours', () => {
    const [epargne, population, dose] = SITUATIONS;
    expect(rangDeFranchissement(epargne.gen, epargne.seuil).rang).toBe(20);
    expect(rangDeFranchissement(population.gen, population.seuil).rang).toBe(5);
    expect(rangDeFranchissement(dose.gen, dose.seuil).rang).toBe(5);
  });

  it('LE SENS EST LU, jamais présumé : hausse et baisse cohabitent dans la même table', () => {
    const sens = SITUATIONS.map((s) => rangDeFranchissement(s.gen, s.seuil).sens);
    expect(sens).toContain('croissante');
    expect(sens).toContain('decroissante');
  });

  it('le TOTAL CUMULÉ de l’épargne est une SOMME, distincte du solde — les deux nombres diffèrent', () => {
    // Le piège d'interprétation du module 6 : « le compte contient » n'est pas
    // « on a versé ». Si les deux coïncidaient, la question n'aurait pas de sens.
    const s = SITUATIONS[0];
    for (let n = 1; n <= 12; n += 1) {
      expect(totalCumule(s.gen, n)).not.toBe(s.gen(n));
      expect(totalCumule(s.gen, n)).toBeCloseTo(sommeArithmetique(s.u0, s.raison, n), 9);
    }
    expect(totalCumule(s.gen, 11)).toBe(sommeArithmetique(800, 60, 11));
    expect(totalCumule(s.gen, 11)).toBe(13560);
  });

  it('la dose TEND vers 0 sans jamais l’atteindre — l’interprétation que le module affirme', () => {
    const dose = SITUATIONS[2];
    for (let n = 0; n <= 40; n += 1) expect(dose.gen(n)).toBeGreaterThan(0);
    expect(dose.gen(40)).toBeLessThan(0.001);
    // Et la quantité TOTALE reçue reste bornée : c'est la somme géométrique.
    const totalInfini = dose.u0 / (1 - dose.raison);
    expect(sommeGeometrique(dose.u0, dose.raison, 60)).toBeLessThan(totalInfini + 1e-9);
    expect(sommeGeometrique(dose.u0, dose.raison, 60)).toBeCloseTo(totalInfini, 6);
  });
});

/* ══ Les distracteurs du boss, VÉRIFIÉS NUMÉRIQUEMENT ═════════════════════ */

describe('boss — chaque distracteur est CALCULÉ, PLAUSIBLE et DISTINCT', () => {
  const distincts = (label, ...vals) => {
    const arrondis = vals.map((v) => Math.round(v * 1e6) / 1e6);
    expect(new Set(arrondis).size, `${label} — deux options identiques rendraient l’épreuve insoluble`)
      .toBe(vals.length);
  };

  it('e1 — u(0) = 4, r = 6, rang 20 : la bonne réponse et les trois pièges diffèrent', () => {
    const bonne = nthArithmetic(4, 6, 20);              // 124
    const piegeRangDecale = nthArithmetic(4, 6, 19);    // 118 — « le 20e terme »
    const piegeSansU0 = 6 * 20;                          // 120 — on oublie u0
    const piegeSomme = sommeArithmetique(4, 6, 20);      // 1344 — le terme confondu avec la somme
    expect(bonne).toBe(124);
    distincts('e1', bonne, piegeRangDecale, piegeSansU0, piegeSomme);
  });

  it('e2 — u(0) = 100, r = −4, rang 15 : le piège du signe est distinct', () => {
    const bonne = nthArithmetic(100, -4, 15);            // 40
    const piegeSigne = 100 + 15 * 4;                      // 160 — on ajoute au lieu de retrancher
    const piegeDecale = nthArithmetic(100, -4, 14);       // 44
    const piegeSansU0 = -4 * 15;                          // −60
    expect(bonne).toBe(40);
    distincts('e2', bonne, piegeSigne, piegeDecale, piegeSansU0);
  });

  it('e3 — u(0) = 3, q = 2, rang 10 : le piège multiplicatif est distinct', () => {
    const bonne = nthGeometric(3, 2, 10);                // 3072
    const piegeProduit = 3 * 2 * 10;                      // 60 — on multiplie au lieu d'élever
    const piegeDecale = nthGeometric(3, 2, 9);            // 1536
    const piegeExposant = 3 * 2 ** 11;                    // 6144 — n + 1 en exposant
    expect(bonne).toBe(3072);
    distincts('e3', bonne, piegeProduit, piegeDecale, piegeExposant);
  });

  it('e4 — 5 000 € à 3 % pendant 8 ans : les quatre montants sont bien distincts', () => {
    const bonne = nthGeometric(5000, 1.03, 8);
    const piegeSimple = 5000 * (1 + 0.03 * 8);            // intérêts simples
    const piegeDecale = nthGeometric(5000, 1.03, 7);
    const piegeExposantSuivant = nthGeometric(5000, 1.03, 9);
    expect(Math.round(bonne * 100) / 100).toBe(6333.85);
    // DÉFAUT ATTRAPÉ ICI : « 5 000 × 1,24 » (« 24 % en tout ») vaut EXACTEMENT
    // 5 000 × (1 + 0,03 × 8) = 6 200 — c'est le même piège écrit deux fois, et
    // deux options identiques rendent l'épreuve insoluble. Un seul est gardé.
    expect(5000 * 1.24).toBe(piegeSimple);
    distincts('e4', bonne, piegeSimple, piegeDecale, piegeExposantSuivant);
  });

  it('e5 — somme 1 + 2 + … + 100 : les pièges de comptage sont distincts', () => {
    const bonne = sommeArithmetique(1, 1, 99);            // 5050 (100 termes, u0 = 1, n = 99)
    const piegeCompte = (99 * 101) / 2;                   // 4999,5 — on prend n au lieu de n + 1
    const piegeSansDemi = 100 * 101;                      // 10100 — on oublie la division par 2
    const piegeProduit = 100 * 100;                       // 10000
    expect(bonne).toBe(5050);
    distincts('e5', bonne, piegeCompte, piegeSansDemi, piegeProduit);
  });

  it('e6 — somme de 5, 8, 11, … jusqu’au rang 20 : les distracteurs sont plausibles', () => {
    const bonne = sommeArithmetique(5, 3, 20);            // 21 × 70 / 2 = 735
    const piegeCompte = (20 * (5 + nthArithmetic(5, 3, 20))) / 2;  // 700 — 20 termes au lieu de 21
    const piegeDernier = nthArithmetic(5, 3, 20);         // 65 — le terme, pas la somme
    const piegeSansDemi = 21 * (5 + nthArithmetic(5, 3, 20));      // 1470
    expect(bonne).toBe(735);
    expect(piegeDernier).toBe(65);
    distincts('e6', bonne, piegeCompte, piegeDernier, piegeSansDemi);
  });

  it('e7 — somme géométrique 1 + 2 + 4 + … + 2^10 : la puissance suivante moins un', () => {
    const bonne = sommeGeometrique(1, 2, 10);             // 2047
    expect(bonne).toBe(2 ** 11 - 1);
    const piegeDernier = nthGeometric(1, 2, 10);          // 1024
    const piegeExposantN = 2 ** 10 - 1;                   // 1023 — n au lieu de n + 1
    const piegeDouble = 2 ** 11;                          // 2048 — on oublie le − 1
    distincts('e7', bonne, piegeDernier, piegeExposantN, piegeDouble);
  });

  it('e8 — somme géométrique de raison 0,5 : le piège « ça fait le double » est distinct', () => {
    const bonne = sommeGeometrique(16, 0.5, 4);           // 31
    expect(bonne).toBe(31);
    const piegeDouble = 2 * 16;                            // 32 — la limite, pas la somme finie
    const piegeDernier = nthGeometric(16, 0.5, 4);         // 1
    const piegeSansDemi = 16 * (1 - 0.5 ** 5);             // 15,5 — on oublie de diviser
    distincts('e8', bonne, piegeDouble, piegeDernier, piegeSansDemi);
  });

  it('e9 — modéliser la baisse de 4 % : les quatre raisons proposées sont distinctes', () => {
    const bonne = 0.96;
    distincts('e9', bonne, 1.04, 0.04, -4);
    // et la valeur qu'elle produit à l'année 5 est bien celle du module.
    expect(Math.round(nthGeometric(12000, 0.96, 5))).toBe(9784);
  });

  it('e10 — interpréter : le solde et le total versé sont deux nombres bien différents', () => {
    const s = SITUATIONS[0];
    const solde = s.gen(12);                              // 1520
    const totalVerse = 60 * 12;                            // 720
    const cumule = totalCumule(s.gen, 12);
    expect(solde).toBe(1520);
    expect(totalVerse).toBe(720);
    expect(cumule).toBe(15080);
    distincts('e10', solde, totalVerse, cumule, s.u0);
  });
});

/* ══ Le format et la lecture des saisies ══════════════════════════════════ */

describe('fr / eur / parseNombre — l’élève recopie ce qu’il voit', () => {
  it('fr écrit le VRAI signe moins, et la virgule française', () => {
    expect(fr(-4)).toBe('−4');
    expect(fr(0.5)).toBe('0,5');
    expect(fr(1.05)).toBe('1,05');
    expect(fr(3072)).toContain('3');
  });

  it('parseNombre relit TOUT ce que fr écrit — c’est le contrat, balayé', () => {
    const valeurs = [
      0, 1, -1, 5, 95, 735, 2047, 3072, -4, 0.5, 1.05, 0.96, 12.5, -0.25, 651.5625,
      ...CAS_ARITHMETIQUES.map((c) => nthArithmetic(c.u0, c.r, c.n)),
      ...CAS_GEOMETRIQUES.map((c) => Math.round(nthGeometric(c.u0, c.q, c.n) * 100) / 100),
    ];
    for (const v of valeurs) {
      expect(parseNombre(fr(v)), `fr(${v}) = ${fr(v)}`).toBeCloseTo(v, 9);
    }
  });

  it('parseNombre accepte les trois tirets et l’espace insécable, et refuse le reste', () => {
    expect(parseNombre('−4')).toBe(-4);       // U+2212, celui de fr()
    expect(parseNombre('–4')).toBe(-4);       // U+2013
    expect(parseNombre('—4')).toBe(-4);       // U+2014
    expect(parseNombre('-4')).toBe(-4);
    expect(parseNombre('1 234')).toBe(1234); // espace insécable étroit
    expect(parseNombre('0,5')).toBe(0.5);
    expect(Number.isNaN(parseNombre('abc'))).toBe(true);
    expect(Number.isNaN(parseNombre('4,,5'))).toBe(true);
    expect(Number.isNaN(parseNombre(''))).toBe(true);
  });

  it('eur arrondit au centime et garde la virgule', () => {
    expect(eur(651.5625)).toBe('651,56');
    expect(eur(-3.456)).toBe('−3,46');
    // Les milliers sont GROUPÉS par une espace fine insécable (U+202F) : c'est
    // exactement ce que l'élève lit, et parseNombre doit savoir la relire.
    expect(eur(1520)).toBe('1\u202f520');
    expect(parseNombre(eur(1520))).toBe(1520);
  });
});

/* ══ Périmètre : ce que la leçon ne fait pas ══════════════════════════════ */

describe('périmètre — la leçon ne déborde pas sur la Terminale', () => {
  it('AUCUN MODULE ne parle de limite, de convergence ni de raisonnement par récurrence', () => {
    // Le `teachingScope.exclude` de lesson.config.js NOMME ces notions pour les
    // écarter : c'est sa fonction, et il est lu par le validateur, pas par
    // l'élève. Le contrôle porte donc sur ce que l'élève LIT — les modules et
    // les briques.
    const interdits = [
      /raisonnement par r[ée]currence/i,
      /converge(nce|nte|nt)?(?![\p{L}])/iu,
      /\blimite de la suite\b/i,
      /tend vers l['’]infini/i,
    ];
    const dossier = new URL('../modules/', import.meta.url);
    const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.jsx'));
    expect(fichiers.length, 'les huit modules doivent être là').toBe(8);
    for (const f of [...fichiers.map((f) => `../modules/${f}`), '../knowledge.jsx']) {
      const texte = readFileSync(new URL(f, import.meta.url), 'utf-8');
      for (const re of interdits) {
        expect(re.test(texte), `${f} contient ${re}`).toBe(false);
      }
    }
  });

  it('AUCUNE MANIPULATION N’EST GELÉE : pas un seul `disabled={…done}` dans la leçon', () => {
    // La règle §9 du patron, rendue exécutable. Seul `PredictionChips` a le
    // droit de se figer — une prédiction s'enregistre une fois.
    const dossiers = [
      { url: new URL('../modules/', import.meta.url), prefixe: '../modules/' },
      { url: new URL('./', import.meta.url), prefixe: './' },
    ];
    const suspects = [];
    for (const { url, prefixe } of dossiers) {
      for (const f of readdirSync(url).filter((n) => /\.jsx$/.test(n))) {
        const texte = readFileSync(new URL(`${prefixe}${f}`, import.meta.url), 'utf-8');
        texte.split('\n').forEach((ligne, i) => {
          if (!/disabled=\{(?!!)[^}]*done/i.test(ligne)) return;
          // La seule exception permise : la prédiction, qui ne se reprend pas.
          const contexte = texte.split('\n').slice(Math.max(0, i - 12), i + 1).join('\n');
          if (/PredictionChips/.test(contexte)) return;
          suspects.push(`${prefixe}${f}:${i + 1} — ${ligne.trim()}`);
        });
      }
    }
    expect(suspects, 'manipulations gelées après validation').toEqual([]);
  });
});
