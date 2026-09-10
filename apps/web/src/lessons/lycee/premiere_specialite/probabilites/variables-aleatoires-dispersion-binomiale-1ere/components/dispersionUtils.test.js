/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « les deux jeux ont la même
 * espérance », « l'étirement ne la déplace pas », « la variance vaut 0,8 »,
 * « la somme des six probabilités fait 1 ». Ce sont des CONTENUS PÉDAGOGIQUES :
 * si les données réelles disent autre chose, la leçon ment, et binomial.test.js
 * ne l'attrape pas — il vérifie que `binomialPmf` est juste, pas qu'un module
 * dit vrai en la citant.
 *
 * TROIS AFFIRMATIONS SONT VÉRIFIÉES À L'ÉGALITÉ STRICTE, sans tolérance, parce
 * que la leçon les affirme comme des égalités et non comme des approximations :
 * les deux espérances sont le même nombre ; l'étirement ne change PAS
 * l'espérance ; les probabilités somment à 1.
 */
import { describe, it, expect } from 'vitest';
import {
  JEUX, JEU_REGULIER, JEU_JACKPOT, JEU_ETIRABLE, loiDuJeu, esperanceDuJeu, varianceDuJeu,
  ecartTypeDuJeu, varianceDeLaLoi, ecartTypeDeLaLoi, detailVariance,
  CRANS_ETIREMENT, CRAN_DEFAUT, etirer, loiEtiree, ecartTypeEtire, varianceEtiree,
  N_PARTIES, MARGE_SIGMAS, GRAINE_BASE, sessionSeed, serieDeParties, margeAdmise,
  EPREUVE, loiDeBernoulli, N_PRELEVEES, LOI_BINOMIALE, probasBinomiales,
  SITUATIONS, LIVREUR, loiDuLivreur,
  expectation, probabilitySum, makeRng,
  binomialCoeff, binomialPmf, binomialCdf, binomialExpectation,
  binomialVariance, binomialSd,
  parseSigned, euros, fr,
} from './dispersionUtils';
import { weightedVariance } from '../../../../../common/stats';

describe('LE SEL DE LA LEÇON — deux jeux, la MÊME espérance', () => {
  it('les deux espérances sont le MÊME nombre, à l’égalité stricte', () => {
    const a = esperanceDuJeu(JEU_REGULIER);
    const b = esperanceDuJeu(JEU_JACKPOT);
    // Pas de toBeCloseTo : le module 1 affirme « exactement la même », et un
    // écart d'un millième suffirait à rendre l'affirmation fausse.
    expect(a).toBe(b);
    expect(a).toBe(2);
  });

  it('les probabilités somment à 1 EXACTEMENT, pour les deux jeux', () => {
    for (const jeu of JEUX) expect(probabilitySum(loiDuJeu(jeu))).toBe(1);
  });

  it('les deux jeux sont écrits sur le même dénominateur : 10 parties', () => {
    for (const jeu of JEUX) {
      const loi = loiDuJeu(jeu);
      expect(loi[0].total).toBe(10);
      expect(loi.reduce((a, r) => a + r.n, 0)).toBe(10);
    }
  });

  it('les dispersions sont MANIFESTEMENT opposées : un rapport de 45 sur la variance', () => {
    const vReg = varianceDuJeu(JEU_REGULIER);
    const vJack = varianceDuJeu(JEU_JACKPOT);
    expect(vReg).toBeCloseTo(0.8, 12);
    expect(vJack).toBeCloseTo(36, 12);
    expect(vJack / vReg).toBeCloseTo(45, 10);
  });

  it('les écarts types que les modules citent : environ 0,89 € et exactement 6 €', () => {
    expect(ecartTypeDuJeu(JEU_REGULIER)).toBeCloseTo(Math.sqrt(0.8), 12);
    expect(ecartTypeDuJeu(JEU_REGULIER)).toBeCloseTo(0.894, 3);
    expect(ecartTypeDuJeu(JEU_JACKPOT)).toBeCloseTo(6, 12);
  });

  it('le Régulier ne paie JAMAIS rien, le Jackpot paie rien neuf fois sur dix', () => {
    // Le contraste que le module 1 met en scène doit être vrai des données.
    expect(loiDuJeu(JEU_REGULIER).map((r) => r.x)).toEqual([1, 2, 3]);
    expect(Math.min(...loiDuJeu(JEU_REGULIER).map((r) => r.x))).toBeGreaterThan(0);
    const jack = loiDuJeu(JEU_JACKPOT);
    expect(jack.find((r) => r.x === 0).p).toBeCloseTo(0.9, 12);
    expect(jack.find((r) => r.x === 20).p).toBeCloseTo(0.1, 12);
  });

  it('l’espérance N’EST une valeur d’aucun des deux jeux — le Jackpot ne paie jamais 2 €', () => {
    // Ce n'est pas la cible de CETTE leçon (c'est celle d'avant), mais un module
    // qui l'affirmerait à tort mentirait quand même.
    expect(loiDuJeu(JEU_JACKPOT).map((r) => r.x)).not.toContain(2);
  });
});

describe('la variance — construite, pas récitée', () => {
  it('coïncide avec weightedVariance du noyau partagé, poids = probabilités', () => {
    for (const jeu of JEUX) {
      const loi = loiDuJeu(jeu);
      const parPoids = weightedVariance(loi.map((r) => ({ value: r.x, count: r.p })));
      expect(varianceDeLaLoi(loi)).toBeCloseTo(parPoids, 12);
    }
  });

  it('coïncide avec la somme écrite à la main Σ pᵢ (xᵢ − E)²', () => {
    for (const jeu of JEUX) {
      const loi = loiDuJeu(jeu);
      const e = expectation(loi);
      const main = loi.reduce((a, r) => a + r.p * (r.x - e) ** 2, 0);
      expect(varianceDeLaLoi(loi)).toBe(main);
    }
  });

  it('σ² = V, et V ≥ 0 toujours', () => {
    for (const jeu of JEUX) {
      expect(ecartTypeDuJeu(jeu) ** 2).toBeCloseTo(varianceDuJeu(jeu), 10);
      expect(varianceDuJeu(jeu)).toBeGreaterThanOrEqual(0);
    }
  });

  it('LE DÉTAIL du module 2 : les quatre nombres de chaque ligne du Régulier', () => {
    const d = detailVariance(loiDuJeu(JEU_REGULIER));
    expect(d.map((l) => l.x)).toEqual([1, 2, 3]);
    expect(d.map((l) => l.ecart)).toEqual([-1, 0, 1]);
    expect(d.map((l) => l.carre)).toEqual([1, 0, 1]);
    d.forEach((l) => expect(l.contribution).toBeCloseTo(l.p * l.carre, 12));
    expect(d.reduce((a, l) => a + l.contribution, 0)).toBeCloseTo(0.8, 12);
    // Les contributions citées par le module : 0,4 puis 0 puis 0,4.
    expect(d.map((l) => Math.round(l.contribution * 1000) / 1000)).toEqual([0.4, 0, 0.4]);
  });

  it('LE DÉTAIL du Jackpot : l’unique gros écart pèse 32,4 sur 36', () => {
    const d = detailVariance(loiDuJeu(JEU_JACKPOT));
    expect(d.map((l) => l.x)).toEqual([0, 20]);
    expect(d.map((l) => l.ecart)).toEqual([-2, 18]);
    expect(d.map((l) => l.carre)).toEqual([4, 324]);
    expect(d[0].contribution).toBeCloseTo(3.6, 12);
    expect(d[1].contribution).toBeCloseTo(32.4, 12);
    expect(d[0].contribution + d[1].contribution).toBeCloseTo(36, 12);
  });

  it('LA SOMME DES ÉCARTS (sans carré) est NULLE : c’est pourquoi on élève au carré', () => {
    // L'argument central du module 2 : sans le carré, l'indicateur vaudrait 0
    // pour TOUS les jeux, et ne distinguerait rien.
    for (const jeu of JEUX) {
      const loi = loiDuJeu(jeu);
      const e = expectation(loi);
      const somme = loi.reduce((a, r) => a + r.p * (r.x - e), 0);
      expect(Math.abs(somme)).toBeLessThan(1e-12);
    }
  });

  it('LA VARIANCE N’EST PAS EN EUROS : un jeu en centimes a une variance 10 000 fois plus grande', () => {
    // L'argument du module 3 : multiplier les gains par 100 multiplie la
    // variance par 100², et l'écart type par 100 seulement. C'est la racine qui
    // ramène l'indicateur dans l'unité des gains.
    const loi = loiDuJeu(JEU_REGULIER);
    const enCentimes = loi.map((r) => ({ ...r, x: r.x * 100 }));
    expect(varianceDeLaLoi(enCentimes)).toBeCloseTo(varianceDeLaLoi(loi) * 10000, 6);
    expect(ecartTypeDeLaLoi(enCentimes)).toBeCloseTo(ecartTypeDeLaLoi(loi) * 100, 8);
  });
});

describe('L’ÉTIREMENT — la dispersion bouge, l’espérance NE BOUGE PAS', () => {
  it('BALAYÉ sur TOUS les crans : l’espérance reste 2, à l’ÉGALITÉ STRICTE', () => {
    const m = esperanceDuJeu(JEU_REGULIER);
    for (const k of CRANS_ETIREMENT) {
      // Pas de tolérance : le module 3 affirme « elle ne bouge pas », pas
      // « elle bouge un peu ». x ↦ m + k(x − m) le garantit par algèbre.
      expect(expectation(etirer(JEU_REGULIER, k))).toBe(m);
    }
  });

  it('BALAYÉ : Σp reste exactement 1 à tous les crans', () => {
    for (const k of CRANS_ETIREMENT) expect(probabilitySum(loiEtiree(JEU_REGULIER, k))).toBe(1);
  });

  it('BALAYÉ : l’écart type vaut EXACTEMENT k fois celui du jeu d’origine', () => {
    const s = ecartTypeDuJeu(JEU_REGULIER);
    for (const k of CRANS_ETIREMENT) {
      expect(ecartTypeEtire(JEU_REGULIER, k)).toBeCloseTo(k * s, 12);
      expect(varianceEtiree(JEU_REGULIER, k)).toBeCloseTo(k * k * varianceDuJeu(JEU_REGULIER), 12);
    }
  });

  it('l’écart type est STRICTEMENT croissant d’un cran au suivant — donc la manipulation se voit', () => {
    for (let i = 1; i < CRANS_ETIREMENT.length; i += 1) {
      expect(ecartTypeEtire(JEU_REGULIER, CRANS_ETIREMENT[i]))
        .toBeGreaterThan(ecartTypeEtire(JEU_REGULIER, CRANS_ETIREMENT[i - 1]));
    }
  });

  it('LE CRAN DE DÉPART est dans la liste, et rend le jeu tel quel', () => {
    expect(CRANS_ETIREMENT).toContain(CRAN_DEFAUT);
    expect(loiEtiree(JEU_REGULIER, CRAN_DEFAUT).map((r) => r.x))
      .toEqual(loiDuJeu(JEU_REGULIER).map((r) => r.x));
  });

  it('SÉCURITÉ DE LA FIGURE, balayée : aucune valeur négative, aucune collision de valeurs', () => {
    for (const k of CRANS_ETIREMENT) {
      const loi = loiEtiree(JEU_REGULIER, k);
      // Aucun gain négatif : le jeu resterait un jeu à tous les crans.
      expect(Math.min(...loi.map((r) => r.x))).toBeGreaterThanOrEqual(0);
      // Trois valeurs DISTINCTES : lawFromCounts refuserait un doublon, et le
      // nuage de points deviendrait une seule colonne.
      expect(new Set(loi.map((r) => r.x)).size).toBe(3);
      // Toutes les valeurs restent dans le cadre de la règle (0 à 20 €).
      expect(Math.max(...loi.map((r) => r.x))).toBeLessThanOrEqual(20);
    }
  });

  it('les valeurs étirées sont des quarts d’euro EXACTS — affichables sans arrondi', () => {
    for (const k of CRANS_ETIREMENT) {
      for (const r of loiEtiree(JEU_REGULIER, k)) {
        expect(Math.abs(r.x * 4 - Math.round(r.x * 4))).toBeLessThan(1e-12);
      }
    }
  });

  it('AU CRAN MAXIMAL la dispersion du Régulier reste SOUS celle du Jackpot', () => {
    // Le module 3 dit « même en l'étirant à fond, le Régulier reste plus sage
    // que le Jackpot ». Si c'était faux, la phrase serait un mensonge visible.
    const max = Math.max(...CRANS_ETIREMENT);
    expect(ecartTypeEtire(JEU_REGULIER, max)).toBeLessThan(ecartTypeDuJeu(JEU_JACKPOT));
  });

  it('LE JEU ÉTIRÉ EST LE RÉGULIER, et lui seul — c’est ce qui rend l’égalité EXACTE', () => {
    // DÉFAUT ATTRAPÉ PAR CE TEST. Étirer le JACKPOT au cran 1,5 donne les
    // valeurs −1 et 29 avec les poids 9/10 et 1/10, et leur moyenne pondérée
    // vaut 2,000 000 000 000 000 4 : l'algèbre est juste, mais 9/10 et 1/10 ne
    // sont pas représentables en binaire et le résidu remonte. Le Régulier n'a
    // pas ce défaut parce que ses valeurs restent symétriques autour de 2 et
    // que les écarts opposés s'annulent au bit près.
    //
    // Conséquence de conception : SEUL le Régulier est étirable dans
    // l'interface (c'est ce que JEU_ETIRABLE déclare), et l'affirmation
    // « l'espérance ne bouge pas » n'est faite que là où elle est vraie
    // EXACTEMENT. Étendre le réglage au Jackpot demanderait de rendre la phrase
    // approximative — ce serait un recul pédagogique, pas une extension.
    expect(JEU_ETIRABLE).toBe(JEU_REGULIER);
    const m = esperanceDuJeu(JEU_ETIRABLE);
    for (const k of CRANS_ETIREMENT) expect(expectation(etirer(JEU_ETIRABLE, k))).toBe(m);

    // Et la mesure du résidu du Jackpot, pour que l'intention survive : il est
    // NON NUL, mais borné par le bruit d'un flottant.
    const mJ = esperanceDuJeu(JEU_JACKPOT);
    let pire = 0;
    for (const k of CRANS_ETIREMENT) {
      pire = Math.max(pire, Math.abs(expectation(etirer(JEU_JACKPOT, k)) - mJ));
    }
    expect(pire).toBeGreaterThan(0);
    expect(pire).toBeLessThan(1e-12);
  });
});

describe('la simulation — injectée, jamais tirée dans le rendu', () => {
  it('sessionSeed est déterministe quand window.__SMARTER_RNG_SEED est fixée', () => {
    const w = { __SMARTER_RNG_SEED: 7 };
    // eslint-disable-next-line no-undef
    globalThis.window = w;
    expect(sessionSeed()).toBe(GRAINE_BASE + 7);
    delete globalThis.window;
  });

  it('la même graine rend la MÊME série : rejouable', () => {
    const loi = loiDuJeu(JEU_REGULIER);
    const a = serieDeParties(loi, N_PARTIES, makeRng(123));
    const b = serieDeParties(loi, N_PARTIES, makeRng(123));
    expect(a.tirages).toEqual(b.tirages);
  });

  it('BALAYÉ sur 2 000 graines : la moyenne observée reste dans la marge de 5 σ/√n', () => {
    for (const jeu of JEUX) {
      const loi = loiDuJeu(jeu);
      const marge = margeAdmise(loi, N_PARTIES);
      let pire = 0;
      for (let g = 1; g <= 2000; g += 1) {
        const s = serieDeParties(loi, N_PARTIES, makeRng(g * 7919));
        pire = Math.max(pire, Math.abs(s.moyenne - s.esperance));
      }
      expect(pire).toBeLessThan(marge);
    }
    expect(MARGE_SIGMAS).toBe(5);
  });

  it('LA DIFFÉRENCE DE LARGEUR EST VISIBLE : l’étendue du Jackpot dépasse celle du Régulier', () => {
    // C'est l'observation du module 1 : deux nuages, la même ligne centrale,
    // des largeurs manifestement différentes. Balayé sur 500 graines pour que
    // ce ne soit pas vrai « en général » mais vrai à chaque ouverture.
    let contreExemples = 0;
    for (let g = 1; g <= 500; g += 1) {
      const reg = serieDeParties(loiDuJeu(JEU_REGULIER), N_PARTIES, makeRng(g * 104729));
      const jack = serieDeParties(loiDuJeu(JEU_JACKPOT), N_PARTIES, makeRng(g * 104729 + 1));
      if (jack.etendue <= reg.etendue) contreExemples += 1;
    }
    expect(contreExemples).toBe(0);
  });

  it('le Jackpot sort au moins un gros lot sur 200 parties, à chaque graine testée', () => {
    // Sans gros lot, le nuage du Jackpot serait une colonne unique en 0 et le
    // module 1 n'aurait rien à montrer. P(aucun) = 0,9^200 ≈ 7e-10.
    for (let g = 1; g <= 500; g += 1) {
      const s = serieDeParties(loiDuJeu(JEU_JACKPOT), N_PARTIES, makeRng(g * 104729 + 1));
      expect(s.tirages).toContain(20);
    }
  });
});

describe('Bernoulli et binomiale — les nombres que les modules 4 et 5 citent', () => {
  it('l’épreuve a DEUX issues et une probabilité de succès de 0,4', () => {
    expect(EPREUVE.p).toBe(0.4);
    const loi = loiDeBernoulli();
    expect(loi.map((r) => r.x)).toEqual([0, 1]);
    expect(probabilitySum(loi)).toBe(1);
    expect(expectation(loi)).toBeCloseTo(0.4, 12);
    expect(varianceDeLaLoi(loi)).toBeCloseTo(0.24, 12);
  });

  it('les six probabilités de la loi binomiale sont les décimaux EXACTS cités', () => {
    const attendu = [0.07776, 0.2592, 0.3456, 0.2304, 0.0768, 0.01024];
    const obtenu = probasBinomiales();
    expect(obtenu).toHaveLength(6);
    obtenu.forEach((v, k) => expect(v).toBeCloseTo(attendu[k], 12));
    expect(obtenu.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
    expect(probabilitySum(LOI_BINOMIALE())).toBeCloseTo(1, 12);
  });

  it('les coefficients binomiaux de la ligne n = 5 : 1, 5, 10, 10, 5, 1', () => {
    expect(Array.from({ length: 6 }, (_, k) => binomialCoeff(5, k))).toEqual([1, 5, 10, 10, 5, 1]);
  });

  it('E = 2 et V = 1,2 : le même 2 que les deux jeux, une variance DIFFÉRENTE de 0,8', () => {
    expect(binomialExpectation(N_PRELEVEES, EPREUVE.p)).toBeCloseTo(2, 12);
    expect(binomialVariance(N_PRELEVEES, EPREUVE.p)).toBeCloseTo(1.2, 12);
    // Pas de coïncidence numérique avec la variance du Régulier : un élève qui
    // verrait deux fois 0,8 chercherait un lien qui n'existe pas.
    expect(binomialVariance(N_PRELEVEES, EPREUVE.p)).not.toBeCloseTo(varianceDuJeu(JEU_REGULIER), 6);
  });

  it('P(X ≥ 1) = 1 − P(X = 0) = 0,92224 — le complémentaire du module 5', () => {
    expect(1 - binomialPmf(N_PRELEVEES, 0, EPREUVE.p)).toBeCloseTo(0.92224, 12);
    expect(1 - binomialCdf(N_PRELEVEES, 0, EPREUVE.p)).toBeCloseTo(0.92224, 12);
  });

  it('P(X ≤ 1) = 0,33696', () => {
    expect(binomialCdf(N_PRELEVEES, 1, EPREUVE.p)).toBeCloseTo(0.33696, 12);
  });

  it('l’écart type binomial vaut √1,2 ≈ 1,0954 — cité au module 5', () => {
    expect(binomialSd(N_PRELEVEES, EPREUVE.p)).toBeCloseTo(Math.sqrt(1.2), 14);
    expect(binomialSd(N_PRELEVEES, EPREUVE.p)).toBeCloseTo(1.095, 3);
  });

  it('les quatre situations à trier : une seule est binomiale, et chacune casse UNE condition', () => {
    expect(SITUATIONS.filter((s) => s.binomiale)).toHaveLength(1);
    const cassees = SITUATIONS.filter((s) => !s.binomiale).map((s) => s.condition);
    expect(new Set(cassees).size).toBe(cassees.length);
    expect(new Set(cassees)).toEqual(new Set(['indépendance', 'nombre de répétitions fixé', 'deux issues']));
  });

  it('LE LIVREUR du module 6 : n = 4, p = 0,25, E = 1 retard', () => {
    expect(binomialExpectation(LIVREUR.n, LIVREUR.p)).toBe(1);
    const loi = loiDuLivreur();
    expect(loi).toHaveLength(5);
    expect(probabilitySum(loi)).toBeCloseTo(1, 12);
    expect(binomialPmf(LIVREUR.n, 0, LIVREUR.p)).toBeCloseTo(0.31640625, 12);
    expect(1 - binomialPmf(LIVREUR.n, 0, LIVREUR.p)).toBeCloseTo(0.68359375, 12);
  });
});

describe('LES DISTRACTEURS DU BOSS — calculés, distincts, plausibles', () => {
  const distincts = (label, vals) => {
    it(label, () => {
      const arrondis = vals.map((v) => Math.round(v * 1e9) / 1e9);
      expect(new Set(arrondis).size).toBe(arrondis.length);
    });
  };

  // e1 — la variance du Régulier : 0,8. Pièges : l'écart type (√0,8), la somme
  // des écarts non pondérée (2), la somme des carrés sans probabilité (2).
  distincts('e1 : 0,8 · √0,8 · 2 · 0,4', [
    varianceDuJeu(JEU_REGULIER), ecartTypeDuJeu(JEU_REGULIER), 2, 0.4,
  ]);

  // e2 — l'écart type du Jackpot : 6. Pièges : la variance 36, l'espérance 2,
  // la moitié de l'écart 20 − 0.
  distincts('e2 : 6 · 36 · 2 · 10', [ecartTypeDuJeu(JEU_JACKPOT), varianceDuJeu(JEU_JACKPOT), 2, 10]);

  // e5 — P(X = 2) pour n = 5, p = 0,4 : 0,3456. Pièges : sans coefficient
  // (0,03456), le coefficient seul rapporté à 1 (10 × 0,16 = 1,6, invalide donc
  // remplacé par 0,4 la probabilité brute), et P(X = 3) = 0,2304.
  distincts('e5 : 0,3456 · 0,03456 · 0,4 · 0,2304', [
    binomialPmf(5, 2, 0.4), 0.4 ** 2 * 0.6 ** 3, 0.4, binomialPmf(5, 3, 0.4),
  ]);

  // e6 — P(X ≥ 1) : 0,92224. Pièges : P(X = 1) = 0,2592, P(X = 0) = 0,07776,
  // 1 − P(X = 1) = 0,7408.
  distincts('e6 : 0,92224 · 0,2592 · 0,07776 · 0,7408', [
    1 - binomialPmf(5, 0, 0.4), binomialPmf(5, 1, 0.4), binomialPmf(5, 0, 0.4),
    1 - binomialPmf(5, 1, 0.4),
  ]);

  it('e5 : le piège « sans coefficient » vaut exactement le dixième de la réponse — plausible', () => {
    const bon = binomialPmf(5, 2, 0.4);
    const piege = 0.4 ** 2 * 0.6 ** 3;
    expect(piege).toBeCloseTo(bon / binomialCoeff(5, 2), 12);
    // Même ordre de grandeur (un facteur 10) : un élève peut s'y tromper.
    expect(piege).toBeGreaterThan(bon / 100);
    expect(piege).toBeLessThan(bon);
  });

  it('e2 : la variance et l’écart type du Jackpot ne se confondent JAMAIS (36 ≠ 6)', () => {
    expect(varianceDuJeu(JEU_JACKPOT)).not.toBeCloseTo(ecartTypeDuJeu(JEU_JACKPOT), 6);
  });

  it('AUCUNE variance de la leçon n’est égale à son écart type', () => {
    // V = σ n'a lieu que pour V ∈ {0 ; 1}. Si une donnée tombait dessus, tout
    // le module 3 (« pourquoi la racine ») deviendrait invisible.
    for (const v of [varianceDuJeu(JEU_REGULIER), varianceDuJeu(JEU_JACKPOT),
      binomialVariance(5, 0.4), binomialVariance(4, 0.25)]) {
      expect(Math.abs(v - Math.sqrt(v))).toBeGreaterThan(0.05);
    }
  });
});

describe('parseSigned — le vrai signe moins ne fait pas échouer une bonne réponse', () => {
  it('accepte le trait d’union ASCII, U+2212, U+2013 et U+2014', () => {
    expect(parseSigned('-1,5')).toBe(-1.5);
    expect(parseSigned('−1,5')).toBe(-1.5);   // U+2212, celui que formatDec écrit
    expect(parseSigned('–1,5')).toBe(-1.5);   // U+2013
    expect(parseSigned('—1,5')).toBe(-1.5);   // U+2014
  });

  it('lit ce que la leçon AFFICHE, dans les deux sens', () => {
    for (const v of [-2, -1.5, -0.75, 0, 0.8, 1.2, 6, 36]) {
      expect(parseSigned(fr(v))).toBeCloseTo(v, 12);
    }
  });

  it('accepte la virgule ET le point, refuse le reste', () => {
    expect(parseSigned('0,8')).toBe(0.8);
    expect(parseSigned('0.8')).toBe(0.8);
    expect(Number.isNaN(parseSigned('huit'))).toBe(true);
    expect(Number.isNaN(parseSigned(''))).toBe(true);
  });
});

describe('euros — l’affichage des sommes de la leçon', () => {
  it('n’arrondit pas les quarts d’euro produits par l’étirement', () => {
    expect(euros(2.25)).toBe('2,25 €');
    expect(euros(0.75)).toBe('0,75 €');
    expect(euros(2)).toBe('2 €');
  });
});

/**
 * SÉCURITÉ DE MISE EN PAGE DU LABORATOIRE (DeuxJeuxLab).
 *
 * La géométrie de la piste est déclarée en constantes dans le composant ; on la
 * REDIT ici et l'on BALAIE la plage entière plutôt que de l'échantillonner. Un
 * point hors cadre ou une pile qui déborde n'est pas un défaut esthétique : la
 * figure cesserait de dire ce que le module affirme.
 */
describe('SÉCURITÉ DE MISE EN PAGE — balayée, jamais échantillonnée', () => {
  const X_MIN = 0;
  const X_MAX = 20;
  const H_PISTE = 118;
  const Y_BASE = 96;
  const PAS_PILE = 5;
  const PILE_MAX = 16;
  const toX = (v) => 24 + ((v - X_MIN) / (X_MAX - X_MIN)) * 452;

  it('toutes les valeurs de TOUS les crans tombent dans le cadre horizontal', () => {
    const lois = [
      loiDuJeu(JEU_JACKPOT),
      ...CRANS_ETIREMENT.map((k) => loiEtiree(JEU_ETIRABLE, k)),
    ];
    for (const loi of lois) {
      for (const r of loi) {
        expect(r.x).toBeGreaterThanOrEqual(X_MIN);
        expect(r.x).toBeLessThanOrEqual(X_MAX);
        expect(toX(r.x)).toBeGreaterThanOrEqual(24);
        expect(toX(r.x)).toBeLessThanOrEqual(476);
      }
    }
  });

  it('la ligne centrale tombe à la MÊME abscisse sur les deux pistes, au pixel près', () => {
    expect(toX(esperanceDuJeu(JEU_REGULIER))).toBe(toX(esperanceDuJeu(JEU_JACKPOT)));
  });

  it('une pile pleine reste DANS le cadre vertical, plafond compris', () => {
    const sommet = Y_BASE - 5 - (PILE_MAX - 1) * PAS_PILE;
    expect(sommet).toBeGreaterThan(0);
    // La ligne centrale démarre à y = 8 : le sommet des piles doit rester
    // sous elle, sinon les points passeraient par-dessus le trait.
    expect(sommet).toBeGreaterThanOrEqual(8);
    expect(Y_BASE + 10).toBeLessThanOrEqual(H_PISTE);
  });

  it('BALAYÉ sur 300 graines : aucune pile ne dépasse le plafond dessiné', () => {
    for (const jeu of JEUX) {
      for (let g = 1; g <= 300; g += 1) {
        const s = serieDeParties(loiDuJeu(jeu), N_PARTIES, makeRng(g * 7919));
        const parValeur = new Map();
        for (const v of s.tirages) parValeur.set(v, (parValeur.get(v) ?? 0) + 1);
        const plusHaute = Math.max(1, ...[...parValeur.values()]);
        for (const c of parValeur.values()) {
          const hauteur = Math.max(1, Math.min(PILE_MAX, Math.round((c / plusHaute) * PILE_MAX)));
          expect(hauteur).toBeGreaterThanOrEqual(1);
          expect(hauteur).toBeLessThanOrEqual(PILE_MAX);
        }
      }
    }
  });

  it('AU CRAN LE PLUS SERRÉ les trois valeurs sont trop proches pour des étiquettes SVG', () => {
    // C'est la JUSTIFICATION du choix « nombres dans le DOM » : à k = 0,25, les
    // trois repères tiennent dans une douzaine de pixels. Trois étiquettes
    // posées là se chevaucheraient nécessairement — la légende DOM n'est pas
    // une préférence de style, c'est la seule mise en page qui tienne.
    const loi = loiEtiree(JEU_ETIRABLE, Math.min(...CRANS_ETIREMENT));
    const xs = loi.map((r) => toX(r.x)).sort((a, b) => a - b);
    expect(xs[xs.length - 1] - xs[0]).toBeLessThan(16);
  });

  it('AU CRAN LE PLUS LARGE les trois valeurs restent distinctes à l’écran', () => {
    const loi = loiEtiree(JEU_ETIRABLE, Math.max(...CRANS_ETIREMENT));
    const xs = loi.map((r) => toX(r.x)).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i += 1) expect(xs[i] - xs[i - 1]).toBeGreaterThan(4);
  });
});

describe('LES AFFIRMATIONS TEXTUELLES DES MODULES, recalculées', () => {
  it('M1 étape 4 : « au cran × 0,25 le Régulier plafonne à 2,25 € » — et ce cran EXISTE', () => {
    const k = 0.25;
    expect(CRANS_ETIREMENT).toContain(k);
    const loi = loiEtiree(JEU_ETIRABLE, k);
    expect(Math.max(...loi.map((r) => r.x))).toBe(2.25);
    expect(loi.map((r) => r.x)).toEqual([1.75, 2, 2.25]);
  });

  it('M1 étape 4 : « le nombre de gains différents vaut 3 à TOUS les crans »', () => {
    for (const k of CRANS_ETIREMENT) expect(loiEtiree(JEU_ETIRABLE, k)).toHaveLength(3);
  });

  it('M1 étape 1 : les deux calculs cités, terme à terme', () => {
    // Régulier : 1×0,4 + 2×0,2 + 3×0,4 = 0,4 + 0,4 + 1,2 = 2.
    expect(0.4 + 0.4 + 1.2).toBeCloseTo(2, 12);
    // Jackpot : 0×0,9 + 20×0,1 = 2.
    expect(20 * 0.1).toBeCloseTo(2, 12);
    expect(esperanceDuJeu(JEU_REGULIER)).toBe(2);
    expect(esperanceDuJeu(JEU_JACKPOT)).toBe(2);
  });

  it('M1 étape 2 : « entre 1 € et 3 € » décrit bien le Régulier NON ÉTIRÉ', () => {
    const loi = loiDuJeu(JEU_REGULIER);
    expect(Math.min(...loi.map((r) => r.x))).toBe(1);
    expect(Math.max(...loi.map((r) => r.x))).toBe(3);
  });

  it('M3 : « le nombre en euros carrés redevient un nombre en euros » — √0,8 et √36', () => {
    expect(Math.sqrt(varianceDuJeu(JEU_REGULIER))).toBeCloseTo(0.8944271909999159, 12);
    expect(Math.sqrt(varianceDuJeu(JEU_JACKPOT))).toBe(6);
  });

  it('M6 : « 5 × 0,4 = 2 défauts attendus, V = 5 × 0,4 × 0,6 = 1,2 »', () => {
    expect(5 * 0.4).toBe(2);
    expect(binomialVariance(5, 0.4)).toBeCloseTo(1.2, 12);
  });
});
