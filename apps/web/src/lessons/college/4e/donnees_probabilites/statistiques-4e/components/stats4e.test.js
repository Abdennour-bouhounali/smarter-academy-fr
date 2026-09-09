import { describe, it, expect } from 'vitest';
import {
  serie, valeurs, poids, estPonderee, effectifTotal, nbLignes, developpee,
  remplacerValeur, changerPoids, ajouterValeur, retirerValeur,
  moyenne, moyenneSimple, mediane, medianeDetail, etendue, extremes, indicateurs,
  tableauEffectifs,
  sensibilite, balayerSensibilite, indicateursRobustes,
  comparer, QUESTIONS_INDICATEUR,
  exagerationAxe,
  fr, avecUnite, ecart, ecritureMoyennePonderee,
  assertScope4e,
  TRAJETS, INDICE_ELOIGNE, DOMAINE_ELOIGNE, AXE_TRAJETS,
  BULLETIN, FRATRIES,
  GROUPE_ROUGE, GROUPE_BLEU, VILLE_ABRITEE, VILLE_EXPOSEE,
  SONDAGE_TRUQUE,
} from './stats4e';
import * as stats4e from './stats4e';

/** Tous les crans que la poignée du module 1 peut atteindre. */
const CRANS_ELOIGNE = [];
for (let v = DOMAINE_ELOIGNE.min; v <= DOMAINE_ELOIGNE.max; v += DOMAINE_ELOIGNE.pas) CRANS_ELOIGNE.push(v);

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('n’expose AUCUN quartile, alors que common/stats en contient', () => {
    expect(stats4e.quartile).toBeUndefined();
    expect(stats4e.q1).toBeUndefined();
    expect(stats4e.q3).toBeUndefined();
    expect(stats4e.interquartileRange).toBeUndefined();
    expect(stats4e.ecartInterquartile).toBeUndefined();
  });

  it('n’expose AUCUNE boîte à moustaches (objet de 3e)', () => {
    expect(stats4e.boiteAMoustaches).toBeUndefined();
    expect(stats4e.fiveNumberSummary).toBeUndefined();
    expect(stats4e.resumeCinqNombres).toBeUndefined();
  });

  it('n’expose NI écart type NI variance (objets de 3e)', () => {
    expect(stats4e.ecartType).toBeUndefined();
    expect(stats4e.standardDeviation).toBeUndefined();
    expect(stats4e.variance).toBeUndefined();
    expect(stats4e.weightedVariance).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    for (const sujet of ['quartile', 'q1', 'q3', 'ecart-interquartile', 'boite-a-moustaches', 'ecart-type', 'variance']) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/3e/);
    }
  });

  it('assertScope4e LAISSE PASSER les quatre objets du programme de 4e', () => {
    for (const sujet of ['moyenne', 'moyenne-ponderee', 'mediane', 'etendue', 'comparer-series']) {
      expect(assertScope4e(sujet), sujet).toBe(true);
    }
  });

  it('un `export *` accidentel de common/stats serait attrapé ici', () => {
    // Ces noms existent dans common/stats et NE DOIVENT PAS ressortir d'ici.
    for (const nom of ['groupIntoClasses', 'medianClass', 'interpolatedMedian', 'crossTable', 'conditionalFrequency']) {
      expect(stats4e[nom], nom).toBeUndefined();
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA SÉRIE, OBJET DE PREMIÈRE CLASSE
   ══════════════════════════════════════════════════════════════════════ */
describe('La série — valeurs, poids, et les gestes de l’Observatoire', () => {
  it('accepte des nombres nus comme des objets, et pose un poids 1 par défaut', () => {
    const s = serie({ id: 't', nom: 'T', items: [3, 5, 7] });
    expect(valeurs(s)).toEqual([3, 5, 7]);
    expect(poids(s)).toEqual([1, 1, 1]);
    expect(estPonderee(s)).toBe(false);
    expect(effectifTotal(s)).toBe(3);
  });

  it('DISTINGUE l’effectif total du nombre de lignes — l’erreur du niveau', () => {
    expect(nbLignes(FRATRIES)).toBe(5);
    expect(effectifTotal(FRATRIES)).toBe(25);
    expect(estPonderee(FRATRIES)).toBe(true);
  });

  it('développer une série pondérée rend bien un individu par unité de poids', () => {
    const dev = developpee(FRATRIES);
    expect(dev).toHaveLength(25);
    expect(dev.filter((v) => v === 1)).toHaveLength(9);
    expect(dev.filter((v) => v === 5)).toHaveLength(2);
  });

  it('REFUSE de développer des poids non entiers : « 2,5 élèves » n’existe pas', () => {
    const s = serie({ id: 'x', nom: 'X', items: [{ valeur: 10, poids: 2.5 }] });
    expect(() => developpee(s)).toThrow(/entiers/);
  });

  it('les trois gestes rendent une série NEUVE — jamais la même mutée', () => {
    const avant = TRAJETS;
    const apres = remplacerValeur(avant, 0, 99);
    expect(apres).not.toBe(avant);
    expect(apres.items).not.toBe(avant.items);
    expect(valeurs(avant)[0]).toBe(6); // l’originale est intacte
    expect(valeurs(apres)[0]).toBe(99);

    const plus = ajouterValeur(avant, 30, { libelle: 'Zoé' });
    expect(nbLignes(plus)).toBe(nbLignes(avant) + 1);
    expect(nbLignes(avant)).toBe(12);

    const moins = retirerValeur(avant, 0);
    expect(nbLignes(moins)).toBe(11);
    expect(nbLignes(avant)).toBe(12);

    const repondere = changerPoids(BULLETIN, 0, 4);
    expect(poids(repondere)[0]).toBe(4);
    expect(poids(BULLETIN)[0]).toBe(1);
  });

  it('un indice hors série lève, sur les quatre gestes', () => {
    for (const f of [
      () => remplacerValeur(TRAJETS, 12, 5),
      () => remplacerValeur(TRAJETS, -1, 5),
      () => retirerValeur(TRAJETS, 99),
      () => changerPoids(TRAJETS, 99, 2),
    ]) expect(f).toThrow(/hors série/);
  });

  it('une série vide rend null partout — jamais NaN, jamais 0', () => {
    const vide = serie({ id: 'v', nom: 'V', items: [] });
    expect(moyenne(vide)).toBeNull();
    expect(mediane(vide)).toBeNull();
    expect(etendue(vide)).toBeNull();
    expect(medianeDetail(vide)).toBeNull();
    expect(extremes(vide)).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA MOYENNE PONDÉRÉE — P1
   ══════════════════════════════════════════════════════════════════════ */
describe('moyenne pondérée — la moyenne simple en est le cas particulier', () => {
  it('sur une série à poids tous égaux à 1, pondérée = simple (balayage)', () => {
    for (const items of [[3], [1, 2], [4, 4, 4], [1, 2, 3, 4, 5], [0, 10, 20, 7], valeurs(TRAJETS)]) {
      const s = serie({ id: 'k', nom: 'K', items });
      expect(moyenne(s), JSON.stringify(items)).toBeCloseTo(moyenneSimple(s), 12);
    }
  });

  it('dupliquer une valeur ou doubler son poids donnent la MÊME moyenne', () => {
    const parPoids = serie({ id: 'a', nom: 'A', items: [{ valeur: 8, poids: 3 }, { valeur: 14, poids: 1 }] });
    const parRepetition = serie({ id: 'b', nom: 'B', items: [8, 8, 8, 14] });
    expect(moyenne(parPoids)).toBeCloseTo(moyenne(parRepetition), 12);
  });

  it('LE BULLETIN démontre son point : pondérer CHANGE la moyenne, et de beaucoup', () => {
    expect(moyenneSimple(BULLETIN)).toBe(12.5);
    expect(moyenne(BULLETIN)).toBeCloseTo(11.2, 10);
    // L'écart n'est pas cosmétique : plus d'un point, et il fait changer de côté de 12.
    expect(Math.abs(moyenneSimple(BULLETIN) - moyenne(BULLETIN))).toBeGreaterThan(1);
    expect(moyenneSimple(BULLETIN)).toBeGreaterThan(12);
    expect(moyenne(BULLETIN)).toBeLessThan(12);
  });

  it('LE BULLETIN est vérifiable de tête : la somme des coefficients vaut 10', () => {
    expect(effectifTotal(BULLETIN)).toBe(10);
  });

  it('LE BULLETIN met les gros coefficients sur les PETITES notes — sinon il ne montrerait rien', () => {
    const tri = [...BULLETIN.items].sort((a, b) => b.poids - a.poids);
    // les deux plus gros coefficients portent les deux notes les plus basses
    const notesLourdes = tri.slice(0, 2).map((it) => it.valeur).sort((a, b) => a - b);
    const toutesNotes = valeurs(BULLETIN).sort((a, b) => a - b);
    expect(notesLourdes).toEqual(toutesNotes.slice(0, 2));
  });

  it('LES FRATRIES : diviser par 5 lignes au lieu de 25 individus donne un nombre absurde', () => {
    expect(moyenne(FRATRIES)).toBeCloseTo(1.68, 10);
    expect(moyenneSimple(FRATRIES)).toBeCloseTo(2.2, 10); // l'erreur visée, chiffrée
    expect(moyenne(FRATRIES)).not.toBeCloseTo(moyenneSimple(FRATRIES), 2);
  });

  it('l’écriture au tableau est celle qu’on refait à la main', () => {
    expect(ecritureMoyennePonderee(BULLETIN)).toBe(
      '(1 × 16 + 1 × 14 + 3 × 9 + 5 × 11) ÷ (1 + 1 + 3 + 5) = 11,2',
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA MÉDIANE — P2, P3, et le cas PAIR
   ══════════════════════════════════════════════════════════════════════ */
describe('médiane — effectif impair, et surtout effectif PAIR', () => {
  it('effectif IMPAIR : c’est la valeur centrale de la série triée', () => {
    const s = serie({ id: 'i', nom: 'I', items: [7, 1, 5, 3, 9] });
    const d = medianeDetail(s);
    expect(d.valeur).toBe(5);
    expect(d.pair).toBe(false);
    expect(d.rangs).toEqual([3]);
    expect(d.estUneValeurDeLaSerie).toBe(true);
  });

  it('effectif PAIR : c’est la DEMI-SOMME des deux valeurs centrales', () => {
    const s = serie({ id: 'p', nom: 'P', items: [1, 3, 4, 10] });
    const d = medianeDetail(s);
    expect(d.valeur).toBe(3.5);
    expect(d.pair).toBe(true);
    expect(d.rangs).toEqual([2, 3]);
    expect(d.encadrantes).toEqual([3, 4]);
  });

  it('LE POINT DE LA LEÇON : la médiane peut n’être AUCUNE valeur de la série', () => {
    const d = medianeDetail(TRAJETS);
    expect(d.valeur).toBe(12.5);
    expect(d.pair).toBe(true);
    expect(d.encadrantes).toEqual([12, 13]);
    expect(d.estUneValeurDeLaSerie).toBe(false);
    expect(valeurs(TRAJETS)).not.toContain(12.5);
  });

  it('la médiane PARTAGE bien l’effectif en deux moitiés de même taille (balayage)', () => {
    const cas = [
      valeurs(TRAJETS),
      [1, 2, 3, 4, 5, 6],
      [10, 10, 10, 10],
      [5, 5, 5, 5, 5, 5, 5],
      [0, 100],
      developpee(FRATRIES),
      valeurs(GROUPE_ROUGE),
      valeurs(VILLE_EXPOSEE),
    ];
    for (const items of cas) {
      const s = serie({ id: 'c', nom: 'C', items });
      const m = mediane(s);
      const n = items.length;
      const enDessous = items.filter((v) => v < m).length;
      const auDessus = items.filter((v) => v > m).length;
      expect(enDessous, JSON.stringify(items)).toBeLessThanOrEqual(Math.floor(n / 2));
      expect(auDessus, JSON.stringify(items)).toBeLessThanOrEqual(Math.floor(n / 2));
    }
  });

  it('la médiane d’un tableau d’effectifs est celle de la série développée', () => {
    expect(mediane(FRATRIES)).toBe(1);
    expect(medianeDetail(FRATRIES).effectif).toBe(25);
    expect(medianeDetail(FRATRIES).pair).toBe(false);
  });

  it('l’ordre de saisie ne change RIEN à la médiane (balayage sur des mélanges)', () => {
    const base = valeurs(TRAJETS);
    const attendu = mediane(TRAJETS);
    for (let k = 0; k < base.length; k += 1) {
      const melange = [...base.slice(k), ...base.slice(0, k)];
      expect(mediane(serie({ id: 'm', nom: 'M', items: melange })), `rotation ${k}`).toBe(attendu);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   L'ÉTENDUE — P4
   ══════════════════════════════════════════════════════════════════════ */
describe('étendue — l’écart des extrêmes, et rien d’autre', () => {
  it('vaut max − min, et 0 sur une série constante', () => {
    expect(etendue(TRAJETS)).toBe(44);
    expect(extremes(TRAJETS)).toEqual({ min: 6, max: 50 });
    expect(etendue(serie({ id: 'k', nom: 'K', items: [7, 7, 7] }))).toBe(0);
  });

  it('n’est JAMAIS négative, sur tout le domaine de la manipulation', () => {
    for (const v of CRANS_ELOIGNE) {
      expect(etendue(remplacerValeur(TRAJETS, INDICE_ELOIGNE, v)), `v=${v}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('ne dépend QUE des extrêmes : bouger une valeur intérieure ne la change pas', () => {
    // Awa (12 min) est strictement entre le min (6) et le max (50).
    for (const v of [7, 10, 13, 20, 30, 49]) {
      expect(etendue(remplacerValeur(TRAJETS, 5, v)), `v=${v}`).toBe(44);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA DÉCOUVERTE CENTRALE — sensible / robuste, CALCULÉE
   ══════════════════════════════════════════════════════════════════════ */
describe('sensibilite — la moyenne bouge, la médiane non : DÉMONTRÉ, pas affirmé', () => {
  it('déplacer l’élève éloigné laisse la médiane EXACTEMENT immobile — sur TOUT le domaine', () => {
    const b = balayerSensibilite(TRAJETS, INDICE_ELOIGNE, CRANS_ELOIGNE);
    expect(b).toHaveLength(CRANS_ELOIGNE.length);
    for (const r of b) {
      expect(r.deltaMediane, `v=${r.valeur}`).toBe(0);
      expect(r.medianeABouge, `v=${r.valeur}`).toBe(false);
    }
    expect(indicateursRobustes(b)).toEqual(['mediane']);
  });

  it('…alors que la moyenne bouge à CHAQUE cran, sauf celui de la valeur d’origine', () => {
    const b = balayerSensibilite(TRAJETS, INDICE_ELOIGNE, CRANS_ELOIGNE);
    for (const r of b) {
      if (r.valeur === r.ancienneValeur) expect(r.deltaMoyenne).toBe(0);
      else expect(r.moyenneABouge, `v=${r.valeur}`).toBe(true);
    }
  });

  it('deltaMoyenne vaut EXACTEMENT (nouvelle − ancienne) / N — c’est ce qui la rend prévisible', () => {
    const n = effectifTotal(TRAJETS);
    for (const v of CRANS_ELOIGNE) {
      const r = sensibilite(TRAJETS, INDICE_ELOIGNE, v);
      expect(r.deltaMoyenne, `v=${v}`).toBeCloseTo((v - r.ancienneValeur) / n, 10);
    }
  });

  it('l’étendue ne réagit qu’au MAXIMUM, la médiane qu’au CENTRE — les rôles ne se recouvrent pas', () => {
    // On touche l'extrême : étendue oui, médiane non.
    const surExtreme = sensibilite(TRAJETS, INDICE_ELOIGNE, 70);
    expect(surExtreme.etendueABouge).toBe(true);
    expect(surExtreme.medianeABouge).toBe(false);
    // On touche une valeur centrale : médiane oui, étendue non.
    const surCentre = sensibilite(TRAJETS, 6, 20); // Lise (13 min) → 20
    expect(surCentre.medianeABouge).toBe(true);
    expect(surCentre.etendueABouge).toBe(false);
  });

  it('LA SÉRIE TRAJETS démontre bien son point : moyenne (16) et médiane (12,5) diffèrent nettement', () => {
    const ind = indicateurs(TRAJETS);
    expect(ind.moyenne).toBe(16);
    expect(ind.mediane).toBe(12.5);
    expect(Math.abs(ind.moyenne - ind.mediane)).toBeGreaterThan(3);
  });

  it('LA VALEUR EXTRÊME tire la moyenne au-dessus de HUIT des douze élèves', () => {
    // Ce test a corrigé la rédaction : « dix » avait été écrit de mémoire, le
    // compte réel est huit (17, 20, 22 et 50 sont au-dessus de 16). Le point
    // pédagogique tient — la moyenne n'est PAS au milieu — mais il tient sur
    // le vrai chiffre.
    const m = moyenne(TRAJETS);
    const enDessous = valeurs(TRAJETS).filter((v) => v < m).length;
    expect(enDessous).toBe(8);
    // « la moyenne, c'est le milieu » est démenti par la donnée elle-même
    expect(enDessous).toBeGreaterThan(valeurs(TRAJETS).length / 2);
    // et la moyenne est nettement au-dessus de la médiane
    expect(m - mediane(TRAJETS)).toBe(3.5);
  });

  it('le domaine de la poignée garde bien l’élève éloigné en position de MAXIMUM', () => {
    const autres = valeurs(TRAJETS).filter((_, i) => i !== INDICE_ELOIGNE);
    expect(DOMAINE_ELOIGNE.min).toBeGreaterThan(Math.max(...autres));
    expect(AXE_TRAJETS.max).toBeGreaterThanOrEqual(DOMAINE_ELOIGNE.max);
    expect(AXE_TRAJETS.min).toBe(0);
  });

  it('sensibilite rend AVANT et APRÈS, pas seulement des écarts', () => {
    const r = sensibilite(TRAJETS, INDICE_ELOIGNE, 24);
    expect(r.avant.moyenne).toBe(16);
    expect(r.apres.moyenne).toBeCloseTo(fromSum(24), 10);
    expect(r.ancienneValeur).toBe(50);
    expect(r.nouvelleValeur).toBe(24);
    function fromSum(v) {
      const s = valeurs(TRAJETS).filter((_, i) => i !== INDICE_ELOIGNE).reduce((a, b) => a + b, 0);
      return (s + v) / 12;
    }
  });

  it('un indice hors série lève', () => {
    expect(() => sensibilite(TRAJETS, 99, 10)).toThrow(/hors série/);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   COMPARER DEUX SÉRIES — P5, P6
   ══════════════════════════════════════════════════════════════════════ */
describe('comparer — quel indicateur SÉPARE, lequel est aveugle', () => {
  it('PAIRE 1 : la moyenne ET l’étendue sont aveugles, seule la médiane sépare', () => {
    const c = comparer(GROUPE_ROUGE, GROUPE_BLEU);
    expect(c.a.moyenne).toBe(12);
    expect(c.b.moyenne).toBe(12);
    expect(c.a.etendue).toBe(15);
    expect(c.b.etendue).toBe(15);
    expect(c.a.mediane).toBe(14);
    expect(c.b.mediane).toBe(12);
    // L'affirmation de la leçon, vérifiée EXACTEMENT et dans les deux sens :
    expect(c.separent).toEqual(['mediane']);
    expect(c.neSeparentPas.sort()).toEqual(['etendue', 'moyenne']);
    expect(c.verdict).toMatch(/mediane/);
  });

  it('PAIRE 2 : la moyenne ET la médiane sont aveugles, seule l’étendue sépare', () => {
    const c = comparer(VILLE_ABRITEE, VILLE_EXPOSEE);
    expect(c.a.moyenne).toBe(18);
    expect(c.b.moyenne).toBe(18);
    expect(c.a.mediane).toBe(18);
    expect(c.b.mediane).toBe(18);
    expect(c.a.etendue).toBe(4);
    expect(c.b.etendue).toBe(19);
    expect(c.separent).toEqual(['etendue']);
    expect(c.neSeparentPas.sort()).toEqual(['mediane', 'moyenne']);
  });

  it('LES DEUX PAIRES ENSEMBLE interdisent « la médiane est le bon indicateur »', () => {
    // Dans la paire 1, la médiane sauve la comparaison ; dans la paire 2, elle est aveugle.
    expect(comparer(GROUPE_ROUGE, GROUPE_BLEU).separent).toEqual(['mediane']);
    expect(comparer(VILLE_ABRITEE, VILLE_EXPOSEE).neSeparentPas).toContain('mediane');
  });

  it('les deux séries d’une paire ont bien le MÊME effectif — sinon on comparerait autre chose', () => {
    expect(effectifTotal(GROUPE_ROUGE)).toBe(effectifTotal(GROUPE_BLEU));
    expect(effectifTotal(VILLE_ABRITEE)).toBe(effectifTotal(VILLE_EXPOSEE));
  });

  it('comparer ne rend JAMAIS un « meilleur » : il rend deux listes et un écart signé', () => {
    const c = comparer(GROUPE_ROUGE, GROUPE_BLEU);
    expect(c.meilleure).toBeUndefined();
    const med = c.details.find((d) => d.indicateur === 'mediane');
    expect(med.ecart).toBe(-2); // b − a
    expect(med.plusGrande).toBe('a');
    const moy = c.details.find((d) => d.indicateur === 'moyenne');
    expect(moy.plusGrande).toBeNull();
    expect(moy.ecart).toBe(0);
  });

  it('deux séries identiques ne sont séparées par aucun indicateur', () => {
    const c = comparer(GROUPE_ROUGE, GROUPE_ROUGE);
    expect(c.separent).toEqual([]);
    expect(c.verdict).toMatch(/aucun/);
  });

  it('à chaque QUESTION son indicateur — et deux questions différentes peuvent partager le même', () => {
    expect(QUESTIONS_INDICATEUR['total-partage'].indicateur).toBe('moyenne');
    expect(QUESTIONS_INDICATEUR['valeur-typique'].indicateur).toBe('mediane');
    expect(QUESTIONS_INDICATEUR.regularite.indicateur).toBe('etendue');
    for (const q of Object.values(QUESTIONS_INDICATEUR)) {
      expect(['moyenne', 'mediane', 'etendue']).toContain(q.indicateur);
      expect(q.question).toMatch(/\?$/);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE GRAPHIQUE QUI MENT
   ══════════════════════════════════════════════════════════════════════ */
describe('exagerationAxe — le mensonge devient un NOMBRE', () => {
  it('un axe qui part de zéro ne ment pas : facteur EXACTEMENT 1', () => {
    const r = exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: 0 });
    expect(r.facteur).toBe(1);
    expect(r.honnete).toBe(true);
    expect(r.rapportVu).toBeCloseTo(r.rapportReel, 12);
  });

  it('LE SONDAGE : un axe à 45 fait voir une barre plus de DEUX fois plus haute', () => {
    const r = exagerationAxe({ basse: 48, haute: 52, depart: 45 });
    expect(r.rapportReel).toBeCloseTo(52 / 48, 10);
    expect(r.rapportVu).toBeCloseTo(7 / 3, 10);
    expect(r.facteur).toBeGreaterThan(2);
    expect(r.honnete).toBe(false);
    expect(r.ecartReelPct).toBeCloseTo(4 / 48, 10);
  });

  it('le facteur CROÎT strictement quand le départ remonte — sur tout le domaine de la poignée', () => {
    const f = SONDAGE_TRUQUE.departs.map((d) =>
      exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: d }).facteur);
    for (let i = 1; i < f.length; i += 1) {
      expect(f[i], `depart ${SONDAGE_TRUQUE.departs[i]}`).toBeGreaterThan(f[i - 1]);
    }
    expect(f[0]).toBe(1);
  });

  it('TOUS les départs du domaine restent strictement sous la barre basse — aucun ne lève', () => {
    for (const d of SONDAGE_TRUQUE.departs) {
      expect(d, `depart ${d}`).toBeLessThan(SONDAGE_TRUQUE.basse);
      expect(() => exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: d })).not.toThrow();
    }
  });

  it('un départ qui coupe la barre basse LÈVE — plutôt que de rendre un ∞ dessiné en pixels', () => {
    expect(() => exagerationAxe({ basse: 48, haute: 52, depart: 48 })).toThrow(/coupe la barre basse/);
    expect(() => exagerationAxe({ basse: 48, haute: 52, depart: 50 })).toThrow(/coupe la barre basse/);
  });

  it('des grandeurs négatives ou nulles sont refusées', () => {
    expect(() => exagerationAxe({ basse: 0, haute: 10, depart: -1 })).toThrow(/positives/);
    expect(() => exagerationAxe({ basse: -5, haute: 10, depart: -8 })).toThrow(/positives/);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉCRITURES — ce que l'élève LIT
   ══════════════════════════════════════════════════════════════════════ */
describe('Les écritures françaises', () => {
  it('la virgule décimale, et le VRAI signe moins (U+2212)', () => {
    expect(fr(12.5)).toBe('12,5');
    expect(fr(16)).toBe('16');
    expect(fr(-2.5).charCodeAt(0)).toBe(0x2212);
  });

  it('un écart est SIGNÉ — « 2,5 » ne dirait pas dans quel sens', () => {
    expect(ecart(2.5)).toBe('+2,5');
    expect(ecart(-1)).toBe('−1');
    expect(ecart(0)).toBe('0');
    expect(ecart(1e-12)).toBe('0'); // le bruit binaire n'est pas un écart
    expect(ecart(null)).toBe('—');
    expect(ecart(-1).charCodeAt(0)).toBe(0x2212);
  });

  it('une valeur porte son unité', () => {
    expect(avecUnite(12.5, 'min')).toBe('12,5 min');
    expect(avecUnite(18, '°C')).toBe('18 °C');
    expect(avecUnite(null, 'min')).toBe('—');
  });

  it('le tableau d’effectifs est trié par valeur croissante', () => {
    const t = tableauEffectifs(FRATRIES);
    expect(t.map((l) => l.value)).toEqual([0, 1, 2, 3, 5]);
    expect(t.map((l) => l.count)).toEqual([4, 9, 7, 3, 2]);
    expect(t.reduce((a, l) => a + l.count, 0)).toBe(25);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES CHIFFRES QUE LA RÉDACTION ANNONCE
   docs/lessons/4E_STATISTIQUES_SPEC.md — chaque nombre du §9 est ici.
   ══════════════════════════════════════════════════════════════════════ */
describe('Le SPEC ne peut pas mentir : ses chiffres sont vérifiés', () => {
  it('la poignée du module 1 offre bien 68 crans', () => {
    expect(CRANS_ELOIGNE).toHaveLength(68);
    expect(CRANS_ELOIGNE[0]).toBe(23);
    expect(CRANS_ELOIGNE[67]).toBe(90);
  });

  it('les six jeux de données annoncés existent et sont non vides', () => {
    for (const s of [TRAJETS, BULLETIN, FRATRIES, GROUPE_ROUGE, GROUPE_BLEU, VILLE_ABRITEE, VILLE_EXPOSEE]) {
      expect(nbLignes(s), s.nom).toBeGreaterThan(0);
      expect(s.nom, s.id).toBeTruthy();
    }
    expect(nbLignes(TRAJETS)).toBe(12);
    expect(nbLignes(BULLETIN)).toBe(4);
    expect(SONDAGE_TRUQUE.basse).toBe(48);
    expect(SONDAGE_TRUQUE.haute).toBe(52);
  });

  it('chaque trajet porte un prénom : l’élève voit des données, pas des nombres', () => {
    expect(TRAJETS.items.every((it) => typeof it.libelle === 'string')).toBe(true);
    expect(BULLETIN.items.every((it) => typeof it.libelle === 'string')).toBe(true);
  });

  it('le tableau du §9, ligne par ligne', () => {
    expect(indicateurs(TRAJETS)).toEqual({ moyenne: 16, mediane: 12.5, etendue: 44, effectif: 12 });
    expect(moyenne(BULLETIN)).toBeCloseTo(11.2, 10);
    expect(moyenneSimple(BULLETIN)).toBe(12.5);
    expect(moyenne(FRATRIES)).toBeCloseTo(1.68, 10);
    expect(moyenneSimple(FRATRIES)).toBeCloseTo(2.2, 10);
    expect(comparer(GROUPE_ROUGE, GROUPE_BLEU).separent).toEqual(['mediane']);
    expect(comparer(VILLE_ABRITEE, VILLE_EXPOSEE).separent).toEqual(['etendue']);
    expect(exagerationAxe({ basse: 48, haute: 52, depart: 45 }).facteur).toBeGreaterThan(2);
  });
});
