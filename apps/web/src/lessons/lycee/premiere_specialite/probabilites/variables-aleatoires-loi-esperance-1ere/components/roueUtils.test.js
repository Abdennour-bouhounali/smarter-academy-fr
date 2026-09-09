/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « la ligne tombe sur 1,40 € »,
 * « la roue ne paie jamais ce montant-là », « la moyenne des 500 lancers s'en
 * approche », « l'offre au plus gros lot n'est pas la meilleure ». Ce sont des
 * CONTENUS PÉDAGOGIQUES : si les données réelles disent autre chose, la leçon
 * ment, et randomVariable.test.js ne l'attrape pas — il vérifie que
 * `expectation` est juste, pas qu'un module dit vrai en la citant.
 *
 * PÉRIMÈTRE : aucun test ne mentionne la variance, l'écart type d'une variable
 * aléatoire ni la loi binomiale — c'est la leçon suivante. `lawStandardDeviation`
 * n'apparaît ici que comme ÉCHELLE d'un seuil de test, jamais comme contenu.
 */
import { describe, it, expect } from 'vitest';
import { makeRng } from '../../../../../common/stats';
import {
  SECTEURS, NB_SECTEURS, GROS_LOTS, GROS_LOT_DEFAUT, N_SIMULATION, MARGE_SIGMAS,
  GRAINE_BASE, sessionSeed, gainsDeLaRoue, secteursDeLaRoue, loiDeLaRoue,
  esperanceDeLaRoue, margeAdmise, grandLivre, probabilitySum, expectationIsAttainable,
  OFFRES, OFFRE_ECLAIR, OFFRE_REGULIER, loiDeLOffre, esperanceDeLOffre,
  beneficeDeLOffre, meilleureOffre, isFairGame, expectedProfit,
  TOMBOLA, loiDeLaTombola, esperanceDeLaTombola, beneficeDeLaTombola, gainOrganisateur,
  euros, fr,
} from './roueUtils';

describe('la roue — dix secteurs, une loi exacte', () => {
  it('dix secteurs équiprobables, quatre / quatre / deux', () => {
    expect(NB_SECTEURS).toBe(10);
    expect(SECTEURS.map((s) => s.effectif)).toEqual([4, 4, 2]);
  });

  it('les probabilités somment à 1 EXACTEMENT, pour tous les gros lots du cliquet', () => {
    for (const G of GROS_LOTS) {
      expect(probabilitySum(loiDeLaRoue(G))).toBe(1);
    }
  });

  it('la loi est triée par gain croissant et porte les bonnes probabilités', () => {
    const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
    expect(loi.map((r) => r.x)).toEqual([0, 1, 5]);
    expect(loi.map((r) => r.n)).toEqual([4, 4, 2]);
    expect(loi.map((r) => r.p)).toEqual([0.4, 0.4, 0.2]);
  });

  it('avec le gros lot par défaut, l’espérance vaut 1,40 € — le nombre que les modules citent', () => {
    expect(esperanceDeLaRoue(GROS_LOT_DEFAUT)).toBeCloseTo(1.4, 12);
  });
});

describe('LE SEL DE LA LEÇON — l’espérance n’est JAMAIS une valeur de la roue', () => {
  it('balayé sur TOUS les crans du gros lot, pas échantillonné', () => {
    for (const G of GROS_LOTS) {
      const loi = loiDeLaRoue(G);
      expect(expectationIsAttainable(loi)).toBe(false);
      // Redit autrement, pour que l'intention survive à une refonte de la
      // fonction : l'espérance ne figure dans aucune ligne du tableau.
      expect(gainsDeLaRoue(G)).not.toContain(esperanceDeLaRoue(G));
    }
  });

  it('3 € est EXCLU du cliquet, et le test dit pourquoi', () => {
    // Un gros lot de 3 € donnerait E = 1 € exactement, c'est-à-dire le petit
    // lot : le module 1 affirmerait « une valeur que la roue ne donne jamais »
    // en montrant le contraire. C'est le seul cran interdit sous 12 €.
    expect(GROS_LOTS).not.toContain(3);
    const interdite = (4 * 0 + 4 * 1 + 2 * 3) / 10;
    expect(interdite).toBe(1);
    expect(gainsDeLaRoue(3)).toContain(interdite);
  });

  it('les crans sont strictement croissants et le défaut en fait partie', () => {
    for (let i = 1; i < GROS_LOTS.length; i += 1) expect(GROS_LOTS[i]).toBeGreaterThan(GROS_LOTS[i - 1]);
    expect(GROS_LOTS).toContain(GROS_LOT_DEFAUT);
  });

  it('modifier le gros lot DÉPLACE la ligne, et le calcul la suit — l’aha du module 1', () => {
    // E = 0,4 + 0,2 G : strictement croissante en G. Un cran vers le haut
    // déplace la ligne de 0,20 € exactement.
    for (let i = 1; i < GROS_LOTS.length; i += 1) {
      const avant = esperanceDeLaRoue(GROS_LOTS[i - 1]);
      const apres = esperanceDeLaRoue(GROS_LOTS[i]);
      expect(apres).toBeGreaterThan(avant);
      expect(apres - avant).toBeCloseTo(0.2 * (GROS_LOTS[i] - GROS_LOTS[i - 1]), 12);
    }
    // Les deux valeurs que le module 1 cite après modification.
    expect(esperanceDeLaRoue(5)).toBeCloseTo(1.4, 12);
    expect(esperanceDeLaRoue(10)).toBeCloseTo(2.4, 12);
  });

  it('l’espérance est toujours STRICTEMENT comprise entre le plus petit et le plus grand gain', () => {
    for (const G of GROS_LOTS) {
      const gains = gainsDeLaRoue(G);
      const e = esperanceDeLaRoue(G);
      expect(e).toBeGreaterThan(Math.min(...gains));
      expect(e).toBeLessThan(Math.max(...gains));
    }
  });
});

describe('la simulation — la moyenne S’APPROCHE, elle n’ÉGALE pas', () => {
  it('la graine est déterministe quand window.__SMARTER_RNG_SEED est fixée', () => {
    const avant = globalThis.window;
    globalThis.window = { __SMARTER_RNG_SEED: 7 };
    expect(sessionSeed()).toBe(GRAINE_BASE + 7);
    expect(sessionSeed(1000)).toBe(1007);
    globalThis.window = avant;
  });

  it('sans graine fixée, elle reste un entier utilisable et non nul', () => {
    const avant = globalThis.window;
    globalThis.window = {};
    const s = sessionSeed();
    expect(Number.isFinite(s)).toBe(true);
    expect(s).toBeGreaterThan(0);
    globalThis.window = avant;
  });

  it('500 tirages : l’écart à l’espérance reste sous la MARGE DÉCLARÉE, tous crans, 200 graines', () => {
    for (const G of GROS_LOTS) {
      const loi = loiDeLaRoue(G);
      const marge = margeAdmise(loi, N_SIMULATION);
      for (let seed = 1; seed <= 200; seed += 1) {
        const livre = grandLivre(loi, N_SIMULATION, makeRng(seed * 104729 + G));
        expect(Math.abs(livre.moyenne - livre.esperance)).toBeLessThan(marge);
      }
    }
  });

  it('la marge est bien une marge, pas une égalité déguisée : elle est STRICTEMENT positive', () => {
    expect(MARGE_SIGMAS).toBe(5);
    for (const G of GROS_LOTS) expect(margeAdmise(loiDeLaRoue(G), N_SIMULATION)).toBeGreaterThan(0);
  });

  it('et la moyenne ne vaut presque jamais l’espérance exactement — on n’affirme pas l’égalité', () => {
    const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
    let exactes = 0;
    for (let seed = 1; seed <= 100; seed += 1) {
      const livre = grandLivre(loi, N_SIMULATION, makeRng(seed * 7919));
      if (livre.moyenne === livre.esperance) exactes += 1;
    }
    expect(exactes).toBeLessThan(10);
  });

  it('le grand livre est complet : effectifs qui somment à 500, fréquences à 1, aucun gain oublié', () => {
    const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
    const livre = grandLivre(loi, N_SIMULATION, makeRng(sessionSeed(GRAINE_BASE)));
    expect(livre.lignes).toHaveLength(3);
    expect(livre.lignes.map((l) => l.x)).toEqual([0, 1, 5]);
    expect(livre.lignes.reduce((a, l) => a + l.count, 0)).toBe(N_SIMULATION);
    expect(livre.lignes.reduce((a, l) => a + l.frequency, 0)).toBeCloseTo(1, 12);
  });

  it('UN seul lancer donne toujours un gain de la roue — jamais l’espérance', () => {
    const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
    for (let seed = 1; seed <= 300; seed += 1) {
      const [v] = grandLivre(loi, 1, makeRng(seed)).tirages;
      expect(gainsDeLaRoue(GROS_LOT_DEFAUT)).toContain(v);
      expect(v).not.toBe(esperanceDeLaRoue(GROS_LOT_DEFAUT));
    }
  });

  it('les fréquences observées sur 500 tirages s’approchent des probabilités', () => {
    const loi = loiDeLaRoue(GROS_LOT_DEFAUT);
    const livre = grandLivre(loi, N_SIMULATION, makeRng(4242));
    for (const l of livre.lignes) expect(Math.abs(l.frequency - l.p)).toBeLessThan(0.12);
  });
});

describe('module 5 — la tombola, et son interprétation', () => {
  const loi = loiDeLaTombola();

  it('200 billets, probabilités exactes', () => {
    expect(TOMBOLA.counts.reduce((a, c) => a + c.n, 0)).toBe(200);
    expect(probabilitySum(loi)).toBe(1);
    expect(loi.map((r) => r.x)).toEqual([0, 5, 20, 100]);
  });

  it('l’espérance de gain vaut 1,275 €, une somme qu’aucun billet ne paie', () => {
    expect(esperanceDeLaTombola()).toBeCloseTo(1.275, 12);
    expect(expectationIsAttainable(loi)).toBe(false);
  });

  it('à 2 € le billet, le joueur perd 0,725 € par billet à long terme', () => {
    expect(beneficeDeLaTombola()).toBeCloseTo(-0.725, 12);
    expect(beneficeDeLaTombola()).toBeLessThan(0);
    expect(isFairGame(loi, TOMBOLA.prix)).toBe(false);
  });

  it('le prix qui rendrait la tombola équitable est exactement l’espérance', () => {
    expect(isFairGame(loi, esperanceDeLaTombola())).toBe(true);
    expect(expectedProfit(loi, esperanceDeLaTombola())).toBeCloseTo(0, 12);
  });

  it('sur 200 billets vendus, l’organisateur encaisse 145 € — le nombre que le module cite', () => {
    expect(gainOrganisateur(200)).toBeCloseTo(145, 10);
    // Vérification par l'autre chemin : 200 × 2 € encaissés − 300 € de lots.
    const lotsDistribues = TOMBOLA.counts.reduce((a, c) => a + c.x * c.n, 0);
    expect(lotsDistribues).toBe(255);
    expect(200 * TOMBOLA.prix - lotsDistribues).toBeCloseTo(145, 10);
  });
});

describe('module 6 — le plus gros lot n’est PAS la meilleure offre', () => {
  it('les deux offres ont des lois exactes et la même mise', () => {
    for (const o of OFFRES) expect(probabilitySum(loiDeLOffre(o))).toBe(1);
    expect(OFFRE_ECLAIR.mise).toBe(OFFRE_REGULIER.mise);
  });

  it('Éclair a le plus gros lot, Régulier la meilleure espérance — le piège est réel', () => {
    const maxEclair = Math.max(...OFFRE_ECLAIR.counts.map((c) => c.x));
    const maxRegulier = Math.max(...OFFRE_REGULIER.counts.map((c) => c.x));
    expect(maxEclair).toBeGreaterThan(maxRegulier);
    expect(esperanceDeLOffre(OFFRE_REGULIER)).toBeGreaterThan(esperanceDeLOffre(OFFRE_ECLAIR));
  });

  it('les deux espérances valent 2,40 € et 3 € — les nombres que le module cite', () => {
    expect(esperanceDeLOffre(OFFRE_ECLAIR)).toBeCloseTo(2.4, 12);
    expect(esperanceDeLOffre(OFFRE_REGULIER)).toBeCloseTo(3, 12);
  });

  it('Éclair fait perdre 0,60 € par partie ; Régulier est EXACTEMENT équitable', () => {
    expect(beneficeDeLOffre(OFFRE_ECLAIR)).toBeCloseTo(-0.6, 12);
    expect(beneficeDeLOffre(OFFRE_ECLAIR)).toBeLessThan(0);
    expect(beneficeDeLOffre(OFFRE_REGULIER)).toBeCloseTo(0, 12);
    expect(isFairGame(loiDeLOffre(OFFRE_REGULIER), OFFRE_REGULIER.mise)).toBe(true);
  });

  it('la meilleure offre est Régulier, calculée et non écrite à la main', () => {
    expect(meilleureOffre().id).toBe(OFFRE_REGULIER.id);
  });

  it('l’espérance d’Éclair n’est aucun de ses gains — le décor du piège tient aussi', () => {
    expect(expectationIsAttainable(loiDeLOffre(OFFRE_ECLAIR))).toBe(false);
  });
});

describe('les distracteurs du boss sont DISTINCTS de la bonne réponse', () => {
  // Chaque groupe : [bonne réponse, ...pièges]. Aucun piège ne doit tomber sur
  // la bonne réponse — un QCM dont deux options sont justes est un QCM faux.
  const groupes = {
    'e2 — loi de la roue (probabilité du gros lot)': [
      2 / 10,                       // juste : 2 secteurs sur 10
      2 / 8,                        // piège : rapporté aux 8 autres secteurs
      1 / 10,                       // piège : un seul secteur compté
      4 / 10,                       // piège : la probabilité de « rien »
    ],
    'e4 — espérance de la roue à 5 €': [
      esperanceDeLaRoue(5),         // 1,4
      (0 + 1 + 5) / 3,              // piège : moyenne des gains sans les probabilités (2)
      1,                            // piège : le petit lot lu comme « la moyenne »
      0 * 4 + 1 * 4 + 5 * 2,        // piège : somme gain × EFFECTIF, sans diviser (14)
    ],
    'e5 — espérance de la tombola': [
      esperanceDeLaTombola(),       // 1,275
      TOMBOLA.prix,                 // piège : le prix du billet pris pour l'espérance
      255 / 200 - TOMBOLA.prix,     // piège : le bénéfice (−0,725), pas l'espérance
      100 / 200,                    // piège : le seul gros lot pondéré (0,5)
    ],
    'e7 — bénéfice espéré à 2 € le billet': [
      beneficeDeLaTombola(),        // −0,725
      esperanceDeLaTombola(),       // piège : l'espérance sans retirer la mise
      TOMBOLA.prix - esperanceDeLaTombola(), // piège : soustraction à l'envers
      0,                            // piège : « c'est équitable »
    ],
    'e9 — bénéfice espéré de l’offre Éclair': [
      beneficeDeLOffre(OFFRE_ECLAIR),   // −0,6
      esperanceDeLOffre(OFFRE_ECLAIR),  // piège : l'espérance seule
      beneficeDeLOffre(OFFRE_REGULIER), // piège : l'autre offre
      20 * 0.1,                         // piège : le gros lot pondéré seul
    ],
  };

  for (const [nom, valeurs] of Object.entries(groupes)) {
    it(`${nom} : ${valeurs.length} valeurs, toutes distinctes`, () => {
      const arrondies = valeurs.map((v) => Math.round(v * 1000) / 1000);
      expect(new Set(arrondies).size).toBe(valeurs.length);
    });
  }

  it('et les pièges restent PLAUSIBLES : chacun à moins de 15 € de la bonne réponse', () => {
    // Un distracteur trop loin n'est pas un piège, c'est du décor : personne ne
    // le choisit, et l'épreuve ne mesure plus rien. Un premier jet proposait
    // « la moyenne des quatre lots » (31,25 €) contre une espérance de 1,275 € —
    // trente euros d'écart, écarté par ce test.
    for (const valeurs of Object.values(groupes)) {
      const [juste, ...pieges] = valeurs;
      for (const p of pieges) expect(Math.abs(p - juste)).toBeLessThanOrEqual(15);
    }
  });
});

describe('formatage français', () => {
  it('la virgule décimale et le vrai signe moins', () => {
    expect(fr(1.4)).toBe('1,4');
    expect(fr(1.275)).toBe('1,275');
    expect(fr(-0.725)).toBe('−0,725');
    expect(euros(1.4)).toBe('1,4 €');
    expect(euros(-0.6)).toBe('−0,6 €');
  });

  it('euros arrondit au centime, sans traîne de flottant', () => {
    expect(euros(0.1 + 0.2)).toBe('0,3 €');
    expect(euros(esperanceDeLaRoue(5))).toBe('1,4 €');
  });
});

describe('sécurité de mise en page — la roue reste dessinable à tous les crans', () => {
  it('aucun libellé de secteur ne dépasse 6 caractères, à tous les crans', () => {
    // Les montants sont écrits dans le DOM à côté de la figure, mais le secteur
    // porte son montant court. « 12 € » fait 4 caractères : la borne tient.
    for (const G of GROS_LOTS) {
      for (const s of secteursDeLaRoue(G)) {
        expect(euros(s.gain).length).toBeLessThanOrEqual(6);
      }
    }
  });

  it('les gains restent distincts à tous les crans — deux secteurs ne se confondent jamais', () => {
    for (const G of GROS_LOTS) {
      const gains = gainsDeLaRoue(G);
      expect(new Set(gains).size).toBe(gains.length);
    }
  });

  it('la ligne de l’espérance reste dans l’échelle du graphique des gains', () => {
    // Le repère du labo va de 0 au plus grand gain : la ligne doit y tomber.
    for (const G of GROS_LOTS) {
      const e = esperanceDeLaRoue(G);
      expect(e).toBeGreaterThanOrEqual(0);
      expect(e).toBeLessThanOrEqual(Math.max(...gainsDeLaRoue(G)));
    }
  });
});
