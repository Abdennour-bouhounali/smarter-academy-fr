import { describe, it, expect } from 'vitest';
import {
  serie, valeurs, indicateurs, moyenne, moyenneSimple, mediane, medianeDetail,
  etendue, extremes, effectifTotal, nbLignes, comparer, exagerationAxe,
  remplacerValeur, changerPoids, sensibilite, balayerSensibilite, indicateursRobustes,
  ecritureMoyennePonderee, fr, avecUnite, ecart,
  TRAJETS, INDICE_ELOIGNE, DOMAINE_ELOIGNE, AXE_TRAJETS,
  BULLETIN, FRATRIES, GROUPE_ROUGE, GROUPE_BLEU,
  VILLE_ABRITEE, VILLE_EXPOSEE, SONDAGE_TRUQUE,
} from './stats4e';
import { zoneEquilibre } from './PartageLab';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « le repère vert ne bouge
 * pas », « il n'y a qu'une seule position qui équilibre », « les deux nombres
 * coïncident quand tous les coefficients valent 1 », « l'écart paraît 2,15
 * fois plus grand ». Ces affirmations sont du CONTENU PÉDAGOGIQUE : si le
 * comportement réel diffère, la leçon MENT à l'élève, et aucun test d'unité du
 * noyau ne l'attrape — `stats4e.test.js` vérifie que `mediane` est juste, pas
 * qu'un module dit vrai en la citant.
 *
 * Ce fichier teste donc les ÉNONCÉS des modules, sur leurs données exactes, et
 * surtout l'ATTEIGNABILITÉ de chaque cible qu'un élève doit atteindre par un
 * geste sur une grille — c'est ce genre de test qui a attrapé deux étapes
 * impossibles dans la leçon de proportionnalité 4e.
 *
 * PÉRIMÈTRE : aucun test ne mentionne quartile, boîte à moustaches ni écart
 * type. Le noyau ne les exporte pas ; ces tests ne peuvent donc pas les
 * introduire par la bande.
 */

/* ═══ MODULE 1 — L'observatoire ═══════════════════════════════════════ */
describe('Module 1 — « deux gestes, deux réponses opposées »', () => {
  const INDICE_CENTRE = 6;                       // Lise
  const DOMAINE_CENTRE = { min: 6, max: 22, pas: 1 };
  const crans = (d) => {
    const out = [];
    for (let v = d.min; v <= d.max; v += d.pas) out.push(v);
    return out;
  };

  it('les trois nombres de départ sont ceux que le module cite', () => {
    const ind = indicateurs(TRAJETS);
    expect(ind.moyenne).toBe(16);
    expect(ind.mediane).toBe(12.5);
    expect(ind.etendue).toBe(44);
    expect(ind.effectif).toBe(12);
  });

  it('« la moyenne n’est pas le milieu » : HUIT des douze sont en dessous', () => {
    // La question de l'étape 4 propose « 6, forcément la moitié » comme piège
    // et le nombre RÉEL comme bonne réponse. Si ce nombre devenait 6, la
    // question aurait deux bonnes réponses.
    const sous = valeurs(TRAJETS).filter((v) => v < moyenne(TRAJETS)).length;
    expect(sous).toBe(8);
    expect(sous).not.toBe(6);
  });

  it('POIGNÉE ÉLOIGNÉE : sur TOUT le domaine, la médiane ne bouge JAMAIS', () => {
    // C'est l'affirmation centrale du module. Elle est vérifiée sur les 68
    // crans atteignables, pas sur l'exemple choisi par l'auteur.
    const bal = balayerSensibilite(TRAJETS, INDICE_ELOIGNE, crans(DOMAINE_ELOIGNE));
    expect(indicateursRobustes(bal)).toEqual(['mediane']);
    for (const b of bal) expect(b.deltaMediane, `valeur ${b.valeur}`).toBe(0);
  });

  it('POIGNÉE ÉLOIGNÉE : la moyenne ET l’étendue bougent à chaque cran', () => {
    const bal = balayerSensibilite(TRAJETS, INDICE_ELOIGNE, crans(DOMAINE_ELOIGNE));
    const depart = TRAJETS.items[INDICE_ELOIGNE].valeur;
    for (const b of bal.filter((x) => x.valeur !== depart)) {
      expect(b.moyenneABouge, `moyenne à ${b.valeur}`).toBe(true);
      expect(b.etendueABouge, `étendue à ${b.valeur}`).toBe(true);
    }
  });

  it('POIGNÉE DU CENTRE : c’est l’ÉTENDUE qui est immobile — le contraste inverse', () => {
    // Sans cela, le module 1 ne prouverait rien : un indicateur qui ne bouge
    // JAMAIS serait inutile, pas « robuste ».
    const bal = balayerSensibilite(TRAJETS, INDICE_CENTRE, crans(DOMAINE_CENTRE));
    expect(indicateursRobustes(bal)).toEqual(['etendue']);
    expect(bal.some((b) => b.medianeABouge)).toBe(true);
  });

  it('ATTEIGNABILITÉ : les deux domaines contiennent la valeur de départ et sont des entiers', () => {
    // Le domaine doit contenir la valeur initiale, sinon la pastille sauterait
    // à l'ouverture ; et tout cran doit être atteignable au pas de 1.
    expect(TRAJETS.items[INDICE_ELOIGNE].valeur).toBeGreaterThanOrEqual(DOMAINE_ELOIGNE.min);
    expect(TRAJETS.items[INDICE_ELOIGNE].valeur).toBeLessThanOrEqual(DOMAINE_ELOIGNE.max);
    expect(TRAJETS.items[INDICE_CENTRE].valeur).toBeGreaterThanOrEqual(DOMAINE_CENTRE.min);
    expect(TRAJETS.items[INDICE_CENTRE].valeur).toBeLessThanOrEqual(DOMAINE_CENTRE.max);
    for (const d of [DOMAINE_ELOIGNE, DOMAINE_CENTRE]) {
      expect(Number.isInteger(d.pas)).toBe(true);
      expect(Number.isInteger((d.max - d.min) / d.pas)).toBe(true);
    }
  });

  it('ATTEIGNABILITÉ : le seuil de validation de l’étape 1 (≥ 70) est DANS le domaine', () => {
    // L'étape ne se valide qu'après un cran ≥ 70. Si le domaine s'arrêtait
    // avant, l'étape serait littéralement impossible à franchir.
    expect(DOMAINE_ELOIGNE.max).toBeGreaterThanOrEqual(70);
  });

  it('AUCUN état atteignable ne sort de l’axe dessiné', () => {
    // La figure est bornée par AXE_TRAJETS : une valeur hors bornes serait
    // dessinée en dehors du cadre (invariant visuel §17bis).
    for (const d of [DOMAINE_ELOIGNE, DOMAINE_CENTRE]) {
      expect(d.min).toBeGreaterThanOrEqual(AXE_TRAJETS.min);
      expect(d.max).toBeLessThanOrEqual(AXE_TRAJETS.max);
    }
    for (const v of valeurs(TRAJETS)) {
      expect(v).toBeGreaterThanOrEqual(AXE_TRAJETS.min);
      expect(v).toBeLessThanOrEqual(AXE_TRAJETS.max);
    }
  });

  it('les écarts affichés portent bien un SIGNE explicite', () => {
    const s = sensibilite(TRAJETS, INDICE_ELOIGNE, 90);
    expect(ecart(s.deltaMoyenne)).toMatch(/^\+/);
    expect(ecart(s.deltaMediane)).toBe('0');
    expect(ecart(sensibilite(TRAJETS, INDICE_CENTRE, 6).deltaMoyenne)).toMatch(/^−/);
  });
});

/* ═══ MODULE 2 — Le bulletin ══════════════════════════════════════════ */
describe('Module 2 — « les deux nombres coïncident à un réglage précis »', () => {
  it('le réglage « tous les coefficients à 1 » EXISTE et donne la moyenne simple', () => {
    // C'est la cible de l'étape 2 : si le curseur ne descendait pas à 1, ou si
    // les deux calculs divergeaient, l'étape serait impossible.
    const brut = BULLETIN.items.reduce((s, _, i) => changerPoids(s, i, 1), BULLETIN);
    expect(moyenne(brut)).toBe(moyenneSimple(BULLETIN));
    expect(moyenne(brut)).toBe(12.5);
  });

  it('ATTEIGNABILITÉ : 1 est dans le domaine des curseurs (0 à 6), et 3 et 5 aussi', () => {
    for (const p of [1, 3, 5]) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(6);
      expect(Number.isInteger(p)).toBe(true);
    }
  });

  it('la moyenne officielle vaut 11,2 et l’erreur fait CHANGER DE CÔTÉ de 12', () => {
    expect(moyenne(BULLETIN)).toBeCloseTo(11.2, 10);
    expect(moyenneSimple(BULLETIN)).toBe(12.5);
    expect(moyenne(BULLETIN)).toBeLessThan(12);
    expect(moyenneSimple(BULLETIN)).toBeGreaterThan(12);
  });

  it('les deux MEILLEURES notes portent les plus PETITS coefficients — sans quoi le module ne prouve rien', () => {
    const rangees = [...BULLETIN.items].sort((a, b) => b.valeur - a.valeur);
    expect(rangees[0].poids).toBeLessThanOrEqual(rangees[2].poids);
    expect(rangees[1].poids).toBeLessThanOrEqual(rangees[3].poids);
  });

  it('la ligne de calcul affichée est exactement celle du noyau', () => {
    expect(ecritureMoyennePonderee(BULLETIN))
      .toBe('(1 × 16 + 1 × 14 + 3 × 9 + 5 × 11) ÷ (1 + 1 + 3 + 5) = 11,2');
  });

  it('FRATRIES : 25 individus pour 5 lignes, et l’erreur donne bien 2,2', () => {
    expect(effectifTotal(FRATRIES)).toBe(25);
    expect(nbLignes(FRATRIES)).toBe(5);
    expect(moyenne(FRATRIES)).toBeCloseTo(1.68, 10);
    // Le distracteur nommé par `explainFor` : diviser la somme des VALEURS par
    // le nombre de lignes.
    const sommeValeurs = valeurs(FRATRIES).reduce((a, b) => a + b, 0);
    expect(sommeValeurs / nbLignes(FRATRIES)).toBeCloseTo(2.2, 10);
  });

  it('la réponse attendue 1,68 est un DÉCIMAL fini : elle se saisit exactement', () => {
    // Un résultat comme 1,6833… serait insaisissable dans un champ numérique.
    expect(fr(moyenne(FRATRIES))).toBe('1,68');
    expect(moyenne(FRATRIES) * 100).toBeCloseTo(168, 9);
  });

  it('un coefficient nul ne casse rien : la manipulation reste définie sur tout le domaine', () => {
    for (let i = 0; i < BULLETIN.items.length; i += 1) {
      for (let p = 0; p <= 6; p += 1) {
        const s = changerPoids(BULLETIN, i, p);
        expect(Number.isFinite(moyenne(s)), `ligne ${i}, coefficient ${p}`).toBe(true);
        expect(effectifTotal(s)).toBeGreaterThan(0);
      }
    }
  });
});

/* ═══ MODULE 3 — Couper le groupe en deux ═════════════════════════════ */
describe('Module 3 — ATTEIGNABILITÉ de la coupure, aux deux parités', () => {
  const CLUB = serie({
    id: 'club', nom: 'Âges au club de robotique', unite: 'ans',
    items: [
      { libelle: 'Yanis', valeur: 11 }, { libelle: 'Alba', valeur: 12 },
      { libelle: 'Nour', valeur: 12 }, { libelle: 'Tom', valeur: 13 },
      { libelle: 'Iris', valeur: 14 }, { libelle: 'Léo', valeur: 14 },
      { libelle: 'Zoé', valeur: 15 },
    ],
  });
  const AXE_CLUB = { min: 10, max: 16, pas: 1 };

  it('EFFECTIF PAIR : une SEULE position équilibre, et c’est la médiane', () => {
    // Sans ce test, l'étape 1 pourrait être impossible (aucune position
    // gagnante) ou trompeuse (plusieurs, dont une qui n'est pas la médiane).
    const zone = zoneEquilibre(TRAJETS, AXE_TRAJETS, 0.5);
    expect(zone).toEqual([12.5]);
    expect(zone[0]).toBe(mediane(TRAJETS));
  });

  it('EFFECTIF PAIR : cette position ne tombe sur AUCUNE valeur de la série', () => {
    // C'est le point pédagogique du module : la médiane n'est le trajet de
    // personne. Si elle coïncidait avec une donnée, la leçon tomberait à plat.
    const d = medianeDetail(TRAJETS);
    expect(d.pair).toBe(true);
    expect(d.estUneValeurDeLaSerie).toBe(false);
    expect(valeurs(TRAJETS)).not.toContain(d.valeur);
    expect(d.encadrantes).toEqual([12, 13]);
    expect((12 + 13) / 2).toBe(d.valeur);
  });

  it('EFFECTIF IMPAIR : une SEULE position équilibre, et elle tombe SUR une valeur', () => {
    const zone = zoneEquilibre(CLUB, AXE_CLUB, 0.5);
    expect(zone).toEqual([13]);
    expect(zone[0]).toBe(mediane(CLUB));
    expect(valeurs(CLUB)).toContain(13);
    expect(medianeDetail(CLUB).pair).toBe(false);
  });

  it('ATTEIGNABILITÉ : les deux positions gagnantes tombent sur un cran du curseur', () => {
    // Le pas est de 0,5 : toute position gagnante doit en être un multiple,
    // sinon l'élève ne pourrait jamais l'atteindre (mémoire « cible
    // atteignable sur la grille »).
    for (const [s, axe] of [[TRAJETS, AXE_TRAJETS], [CLUB, AXE_CLUB]]) {
      for (const v of zoneEquilibre(s, axe, 0.5)) {
        expect(Math.abs(v / 0.5 - Math.round(v / 0.5)), `${s.id} : ${v}`).toBeLessThan(1e-9);
        expect(v).toBeGreaterThanOrEqual(axe.min);
        expect(v).toBeLessThanOrEqual(axe.max);
      }
    }
  });

  it('ATTEIGNABILITÉ : la position INITIALE de chaque coupure est un cran valide et n’équilibre PAS', () => {
    // Une coupure qui démarrerait déjà juste validerait l'étape sans geste.
    for (const [depart, s, axe] of [[6, TRAJETS, AXE_TRAJETS], [10.5, CLUB, AXE_CLUB]]) {
      expect(Math.abs(depart / 0.5 - Math.round(depart / 0.5))).toBeLessThan(1e-9);
      expect(zoneEquilibre(s, axe, 0.5)).not.toContain(depart);
    }
  });

  it('les deux valeurs encadrantes citées par l’étape 2 sont celles du noyau', () => {
    const d = medianeDetail(TRAJETS);
    expect(d.rangs).toEqual([6, 7]);        // « la 6ᵉ et la 7ᵉ valeur »
    expect(d.effectif).toBe(12);
  });

  it('l’étape 5 dit vrai : six élèves en dessous, six au-dessus', () => {
    const m = mediane(TRAJETS);
    expect(valeurs(TRAJETS).filter((v) => v < m).length).toBe(6);
    expect(valeurs(TRAJETS).filter((v) => v > m).length).toBe(6);
  });

  it('le CLUB est bien un autre décor : ses trois indicateurs diffèrent de ceux des trajets', () => {
    expect(indicateurs(CLUB)).not.toEqual(indicateurs(TRAJETS));
    expect(mediane(CLUB)).toBe(13);
  });
});

/* ═══ MODULE 4 — Du plus petit au plus grand ══════════════════════════ */
describe('Module 4 — l’étendue, et le balayage qui prouve ce qu’elle ignore', () => {
  const SEMAINE = serie({
    id: 'semaine', nom: 'Températures de midi', unite: '°C',
    items: [
      { libelle: 'lundi', valeur: 9 }, { libelle: 'mardi', valeur: 14 },
      { libelle: 'mercredi', valeur: 16 }, { libelle: 'jeudi', valeur: 18 },
      { libelle: 'vendredi', valeur: 21 }, { libelle: 'samedi', valeur: 23 },
      { libelle: 'dimanche', valeur: 27 },
    ],
  });
  const AXE_SEMAINE = { min: 0, max: 40, pas: 5 };
  const INTERIEUR = { indice: 2, min: 10, max: 26, pas: 1 };
  const EXTREME = { indice: 6, min: 27, max: 38, pas: 1 };
  const crans = (d) => {
    const out = [];
    for (let v = d.min; v <= d.max; v += d.pas) out.push(v);
    return out;
  };

  it('l’étendue de départ vaut 18 °C, et c’est ce que l’étape 1 affiche', () => {
    expect(etendue(SEMAINE)).toBe(18);
    expect(extremes(SEMAINE)).toEqual({ min: 9, max: 27 });
  });

  it('POIGNÉE INTÉRIEURE : sur TOUT son domaine, l’étendue reste à 18', () => {
    // L'affirmation « la barre ne bouge pas d'un pixel » doit être vraie sur
    // les 17 crans, pas seulement à l'endroit où l'auteur a regardé.
    const bal = balayerSensibilite(SEMAINE, INTERIEUR.indice, crans(INTERIEUR));
    for (const b of bal) expect(b.deltaEtendue, `mercredi à ${b.valeur}`).toBe(0);
    expect(indicateursRobustes(bal)).toContain('etendue');
  });

  it('POIGNÉE INTÉRIEURE : le domaine ne DÉBORDE pas des extrêmes — sinon la promesse tomberait', () => {
    // Si le curseur pouvait dépasser 9 ou 27, mercredi deviendrait un extrême
    // et l'étendue bougerait : le module affirmerait le contraire de ce que
    // l'élève voit.
    expect(INTERIEUR.min).toBeGreaterThan(extremes(SEMAINE).min);
    expect(INTERIEUR.max).toBeLessThan(extremes(SEMAINE).max);
  });

  it('POIGNÉE EXTRÊME : l’étendue bouge à CHAQUE cran au-delà du départ', () => {
    const bal = balayerSensibilite(SEMAINE, EXTREME.indice, crans(EXTREME));
    for (const b of bal.filter((x) => x.valeur !== 27)) {
      expect(b.etendueABouge, `dimanche à ${b.valeur}`).toBe(true);
      expect(b.deltaEtendue).toBe(b.valeur - 27);
    }
  });

  it('ATTEIGNABILITÉ : le seuil de validation de l’étape 2 (≥ 33) est DANS le domaine', () => {
    expect(EXTREME.max).toBeGreaterThanOrEqual(33);
    expect(EXTREME.min).toBe(27); // le départ, donc aucune valeur ne « saute »
  });

  it('AUCUN état atteignable ne sort de l’axe dessiné', () => {
    for (const d of [INTERIEUR, EXTREME]) {
      expect(d.min).toBeGreaterThanOrEqual(AXE_SEMAINE.min);
      expect(d.max).toBeLessThanOrEqual(AXE_SEMAINE.max);
    }
  });

  it('les deux étendues de villes citées à l’étape 5 sont exactes', () => {
    expect(etendue(VILLE_ABRITEE)).toBe(4);
    expect(etendue(VILLE_EXPOSEE)).toBe(19);
    expect(extremes(VILLE_EXPOSEE)).toEqual({ min: 8, max: 27 });
    expect(extremes(VILLE_ABRITEE)).toEqual({ min: 16, max: 20 });
  });

  it('le piège « l’étendue, c’est le maximum » est bien un piège sur cette donnée', () => {
    expect(etendue(VILLE_EXPOSEE)).not.toBe(extremes(VILLE_EXPOSEE).max);
  });
});

/* ═══ MODULE 5 — Deux groupes, une seule moyenne ══════════════════════ */
describe('Module 5 — la paire que SEULE la médiane sépare', () => {
  const cmp = comparer(GROUPE_ROUGE, GROUPE_BLEU);

  it('les TROIS indicateurs sont vérifiés, pas seulement celui que le module met en avant', () => {
    expect(cmp.separent).toEqual(['mediane']);
    expect(cmp.neSeparentPas).toEqual(['moyenne', 'etendue']);
    expect(moyenne(GROUPE_ROUGE)).toBe(moyenne(GROUPE_BLEU));
    expect(etendue(GROUPE_ROUGE)).toBe(etendue(GROUPE_BLEU));
    expect(mediane(GROUPE_ROUGE)).not.toBe(mediane(GROUPE_BLEU));
  });

  it('les nombres CITÉS par le module sont ceux du noyau', () => {
    expect(moyenne(GROUPE_ROUGE)).toBe(12);
    expect(etendue(GROUPE_ROUGE)).toBe(15);
    expect(mediane(GROUPE_ROUGE)).toBe(14);
    expect(mediane(GROUPE_BLEU)).toBe(12);
  });

  it('la bonne réponse de l’étape 3 est la SEULE vraie : Rouge a la médiane la plus HAUTE', () => {
    // Les trois distracteurs affirment des différences qui n'existent pas.
    expect(mediane(GROUPE_ROUGE)).toBeGreaterThan(mediane(GROUPE_BLEU));
    expect(moyenne(GROUPE_ROUGE)).not.toBeGreaterThan(moyenne(GROUPE_BLEU));
    expect(etendue(GROUPE_BLEU)).not.toBeGreaterThan(etendue(GROUPE_ROUGE));
  });

  it('les deux séries ont le MÊME effectif — sinon « même moyenne = même total » serait faux', () => {
    expect(effectifTotal(GROUPE_ROUGE)).toBe(effectifTotal(GROUPE_BLEU));
    expect(effectifTotal(GROUPE_ROUGE)).toBe(9);
  });

  it('le DOMAINE COMMUN des deux nuages contient toutes les valeurs, avec une marge', () => {
    // Le lab dessine les deux séries à la MÊME échelle. Une valeur hors
    // domaine serait une pastille coupée par le bord (invariant visuel).
    const toutes = [...valeurs(GROUPE_ROUGE), ...valeurs(GROUPE_BLEU)];
    const dom = { min: Math.min(...toutes) - 1, max: Math.max(...toutes) + 1 };
    for (const v of toutes) {
      expect(v).toBeGreaterThan(dom.min);
      expect(v).toBeLessThan(dom.max);
    }
  });

  it('le verdict AFFICHÉ est celui que le noyau construit, jamais une phrase saisie', () => {
    expect(cmp.verdict).toContain('mediane');
    expect(cmp.verdict).toContain('ne les distinguent pas');
  });
});

/* ═══ MODULE 6 — Deux villes, un seul milieu ══════════════════════════ */
describe('Module 6 — la paire MIROIR, et ce qu’elle interdit de conclure', () => {
  const villes = comparer(VILLE_ABRITEE, VILLE_EXPOSEE);
  const groupes = comparer(GROUPE_ROUGE, GROUPE_BLEU);

  it('cette fois, seule l’ÉTENDUE sépare — les deux autres sont muets', () => {
    expect(villes.separent).toEqual(['etendue']);
    expect(villes.neSeparentPas).toEqual(['moyenne', 'mediane']);
    expect(moyenne(VILLE_ABRITEE)).toBe(18);
    expect(mediane(VILLE_ABRITEE)).toBe(18);
    expect(moyenne(VILLE_EXPOSEE)).toBe(18);
    expect(mediane(VILLE_EXPOSEE)).toBe(18);
  });

  it('LES DEUX PAIRES SONT BIEN EN MIROIR : leurs séparateurs sont DISJOINTS', () => {
    // C'est la propriété qui interdit « la médiane est le bon indicateur ». Si
    // les deux paires étaient séparées par le même indicateur, le module 6 ne
    // démontrerait rien et enseignerait une préférence.
    for (const s of groupes.separent) expect(villes.separent).not.toContain(s);
    expect(groupes.separent).toEqual(['mediane']);
    expect(villes.separent).toEqual(['etendue']);
  });

  it('le tableau récapitulatif de l’étape 2 affiche exactement ces deux lignes', () => {
    expect(groupes.neSeparentPas.join(', ')).toBe('moyenne, etendue');
    expect(villes.neSeparentPas.join(', ')).toBe('moyenne, mediane');
  });

  it('l’étape 3 dit vrai : la question de RÉGULARITÉ ne peut être tranchée que par l’étendue', () => {
    const d = villes.details;
    expect(d.find((x) => x.indicateur === 'moyenne').egal).toBe(true);
    expect(d.find((x) => x.indicateur === 'mediane').egal).toBe(true);
    expect(d.find((x) => x.indicateur === 'etendue').egal).toBe(false);
  });

  it('les deux villes ont le même effectif, et leurs deux nuages tiennent dans un domaine commun', () => {
    expect(effectifTotal(VILLE_ABRITEE)).toBe(effectifTotal(VILLE_EXPOSEE));
    const toutes = [...valeurs(VILLE_ABRITEE), ...valeurs(VILLE_EXPOSEE)];
    const dom = { min: Math.min(...toutes) - 1, max: Math.max(...toutes) + 1 };
    for (const v of toutes) {
      expect(v).toBeGreaterThan(dom.min);
      expect(v).toBeLessThan(dom.max);
    }
  });
});

/* ═══ MODULE 7 — Le graphique qui ment ════════════════════════════════ */
describe('Module 7 — l’axe tronqué, et la borne qui empêche la levée', () => {
  const { basse, haute } = SONDAGE_TRUQUE;
  const MAX_DEPART = basse - 1;   // la borne du curseur d'AxeLab

  it('l’axe honnête donne un facteur EXACTEMENT égal à 1', () => {
    const h = exagerationAxe({ basse, haute, depart: 0 });
    expect(h.facteur).toBe(1);
    expect(h.honnete).toBe(true);
  });

  it('la réponse attendue à un départ de 45 vaut bien 2,15 au centième', () => {
    const t = exagerationAxe({ basse, haute, depart: 45 });
    expect(Math.round(t.facteur * 100) / 100).toBe(2.15);
    expect(fr(t.facteur)).toBe('2,15');
    // Le distracteur nommé par `explainFor` : le rapport VU.
    expect(t.rapportVu).toBeCloseTo(2.3333333, 6);
    expect(Math.round(t.rapportVu * 100) / 100).not.toBe(2.15);
  });

  it('SÛRETÉ : sur TOUT le domaine du curseur, le calcul est défini — jamais de levée', () => {
    // La borne du composant (basse − 1) et la garde du noyau (depart < basse)
    // doivent dire la même chose. Un cran de trop et le module planterait.
    for (let d = 0; d <= MAX_DEPART; d += 1) {
      expect(() => exagerationAxe({ basse, haute, depart: d }), `départ ${d}`).not.toThrow();
      const r = exagerationAxe({ basse, haute, depart: d });
      expect(Number.isFinite(r.facteur)).toBe(true);
      expect(r.facteur).toBeGreaterThanOrEqual(1);
    }
    // …et le cran SUIVANT lève : la borne est au bon endroit, pas une de trop.
    expect(() => exagerationAxe({ basse, haute, depart: basse })).toThrow();
  });

  it('le facteur est STRICTEMENT croissant : chaque cran aggrave le mensonge', () => {
    let precedent = 0;
    for (let d = 0; d <= MAX_DEPART; d += 1) {
      const f = exagerationAxe({ basse, haute, depart: d }).facteur;
      expect(f, `départ ${d}`).toBeGreaterThan(precedent);
      precedent = f;
    }
  });

  it('SÛRETÉ VISUELLE : aucune barre dessinée ne dépasse le cadre ni ne disparaît', () => {
    // Hauteur dessinée = (valeur − depart) / (haute − depart), bornée à
    // [3/(H−34) ; 1]. On vérifie l'invariant sur tout le domaine.
    for (let d = 0; d <= MAX_DEPART; d += 1) {
      const plage = haute - d;
      for (const v of [basse, haute]) {
        const part = (v - d) / plage;
        expect(part, `départ ${d}, valeur ${v}`).toBeGreaterThan(0);
        expect(part).toBeLessThanOrEqual(1);
      }
    }
  });

  it('ATTEIGNABILITÉ : le seuil de validation de l’étape 1 (≥ 44) est DANS le domaine', () => {
    expect(MAX_DEPART).toBeGreaterThanOrEqual(44);
  });

  it('l’écart réel est bien PETIT — sans quoi le trucage n’aurait rien de spectaculaire', () => {
    expect(exagerationAxe({ basse, haute, depart: 0 }).ecartReelPct).toBeLessThan(0.1);
    expect(haute - basse).toBe(4);
  });

  it('les SALAIRES de l’étape 4 : la moyenne trompe et la médiane décrit', () => {
    const SALAIRES = serie({
      id: 'salaires', nom: 'Petite entreprise', unite: '€',
      items: [1500, 1550, 1600, 1650, 1700, 9000],
    });
    expect(Math.round(moyenne(SALAIRES))).toBe(2833);
    expect(mediane(SALAIRES)).toBe(1625);
    // Cinq employés sur six gagnent moins que la moyenne : c'est ce que dit
    // l'explication, et c'est ce qui rend la médiane pertinente.
    expect(valeurs(SALAIRES).filter((v) => v < moyenne(SALAIRES)).length).toBe(5);
    expect(etendue(SALAIRES)).toBe(7500);
  });
});

/* ═══ MODULE 8 — Les dix épreuves ═════════════════════════════════════ */
describe('Module 8 — chaque épreuve a UNE seule bonne réponse, et elle est exacte', () => {
  it('épreuve 1 — la moyenne pondérée des trois notes vaut 12,5', () => {
    const s = serie({ id: 'e1', items: [
      { valeur: 8, poids: 1 }, { valeur: 12, poids: 1 }, { valeur: 15, poids: 2 },
    ] });
    expect(moyenne(s)).toBe(12.5);
    // et le distracteur « 11,67 » est bien l'erreur nommée : diviser par 3.
    expect(Number(moyenneSimple(s).toFixed(2))).toBe(11.67);
  });

  it('épreuve 2 — LE DÉFAUT ATTRAPÉ : la moyenne vaut 1,3, pas 1,5', () => {
    // Ce test a corrigé une épreuve qui annonçait 1,5 (somme 30) alors que la
    // somme pondérée vaut 26. Sans lui, un élève juste aurait été compté faux.
    const s = serie({ id: 'e2', items: [
      { valeur: 0, poids: 6 }, { valeur: 1, poids: 8 },
      { valeur: 2, poids: 4 }, { valeur: 5, poids: 2 },
    ] });
    expect(effectifTotal(s)).toBe(20);
    expect(moyenne(s)).toBe(1.3);
    expect(moyenne(s)).not.toBe(1.5);
    // Les deux distracteurs sont de VRAIES erreurs.
    expect(valeurs(s).reduce((a, b) => a + b, 0) / nbLignes(s)).toBe(2);
    expect(1.3 * 20 / nbLignes(s)).toBe(6.5);
  });

  it('épreuve 3 — la médiane des sept mesures vaut 8, et la moyenne 9,14', () => {
    const s = serie({ id: 'e3', items: [3, 5, 5, 8, 11, 12, 20] });
    expect(mediane(s)).toBe(8);
    expect(Number(moyenne(s).toFixed(2))).toBe(9.14);
    expect(mediane(s)).not.toBe(moyenne(s));
  });

  it('épreuve 4 — la médiane des six temps vaut 13 s, et les trois distracteurs sont de vraies erreurs', () => {
    const brut = [14, 9, 12, 20, 11, 15];
    const s = serie({ id: 'e4', items: brut });
    expect(mediane(s)).toBe(13);
    expect(medianeDetail(s).estUneValeurDeLaSerie).toBe(false);
    expect((brut[2] + brut[3]) / 2).toBe(16);          // sans ranger
    expect(moyenne(s)).toBe(13.5);                      // la moyenne
    expect([...brut].sort((a, b) => a - b)[2]).toBe(12); // la 3ᵉ rangée
  });

  it('épreuve 6 — l’étendue des tailles vaut 23 cm, et 185 est bien le maximum', () => {
    const s = serie({ id: 'e6', items: [162, 171, 168, 185, 174] });
    expect(etendue(s)).toBe(23);
    expect(extremes(s).max).toBe(185);
    expect(etendue(s)).not.toBe(extremes(s).max);
  });

  it('épreuve 8 — les cotisations : moyenne 136 €, médiane 45 €, étendue 460 €', () => {
    const s = serie({ id: 'e8', items: [40, 45, 45, 50, 500] });
    expect(moyenne(s)).toBe(136);
    expect(mediane(s)).toBe(45);
    expect(etendue(s)).toBe(460);
    expect(valeurs(s).filter((v) => v <= 50).length).toBe(4);
  });

  it('épreuve 10 — 61 et 63 ne peuvent PAS donner une barre trois fois plus haute à l’axe zéro', () => {
    const h = exagerationAxe({ basse: 61, haute: 63, depart: 0 });
    expect(Number(h.rapportReel.toFixed(2))).toBe(1.03);
    expect(h.rapportReel).toBeLessThan(1.1);
    // …et un axe démarrant à 60 donne bien un rapport vu de 3.
    expect(exagerationAxe({ basse: 61, haute: 63, depart: 60 }).rapportVu).toBe(3);
  });

  it('AUCUNE épreuve ne reprend une série d’un module : c’est du TRANSFERT', () => {
    const seriesDesModules = [
      valeurs(TRAJETS), valeurs(BULLETIN), valeurs(FRATRIES),
      valeurs(GROUPE_ROUGE), valeurs(GROUPE_BLEU),
      valeurs(VILLE_ABRITEE), valeurs(VILLE_EXPOSEE),
    ].map((v) => [...v].sort((a, b) => a - b).join(','));
    const seriesDuBoss = [
      [8, 12, 15], [0, 1, 2, 5], [3, 5, 5, 8, 11, 12, 20], [14, 9, 12, 20, 11, 15],
      [162, 171, 168, 185, 174], [40, 45, 45, 50, 500],
    ].map((v) => [...v].sort((a, b) => a - b).join(','));
    for (const b of seriesDuBoss) expect(seriesDesModules).not.toContain(b);
  });
});

/* ═══ ÉCRITURES FRANÇAISES ════════════════════════════════════════════ */
describe('Écritures affichées — virgule décimale et vrai signe moins', () => {
  it('la médiane des trajets s’écrit « 12,5 min », jamais « 12.5 »', () => {
    expect(avecUnite(mediane(TRAJETS), TRAJETS.unite)).toBe('12,5 min');
    expect(avecUnite(mediane(TRAJETS), TRAJETS.unite)).not.toContain('.');
  });

  it('un écart négatif emploie le vrai signe moins U+2212, jamais le trait d’union', () => {
    const s = sensibilite(TRAJETS, 6, 6);
    expect(ecart(s.deltaMoyenne)).toContain('−');
    expect(ecart(s.deltaMoyenne)).not.toContain('-');
  });

  it('les moyennes citées par les modules s’écrivent avec une virgule', () => {
    expect(fr(moyenne(BULLETIN))).toBe('11,2');
    expect(fr(moyenneSimple(BULLETIN))).toBe('12,5');
    expect(fr(moyenne(FRATRIES))).toBe('1,68');
  });
});

/* ═══ PÉRIMÈTRE 4e — la frontière avec la 3e, en test ═════════════════ */
describe('Périmètre — rien de la 3e ne peut atteindre l’élève par ces composants', () => {
  it('les séries d’étape que les modules déclarent restent des données de 4e', () => {
    // Le noyau garde déjà l'API ; ce test garde les DONNÉES : aucune série de
    // la leçon ne réclame un indicateur hors programme pour être comprise.
    for (const s of [TRAJETS, BULLETIN, FRATRIES, GROUPE_ROUGE, GROUPE_BLEU, VILLE_ABRITEE, VILLE_EXPOSEE]) {
      const ind = indicateurs(s);
      expect(Object.keys(ind).sort()).toEqual(['effectif', 'etendue', 'mediane', 'moyenne']);
    }
  });

  it('remplacerValeur et changerPoids rendent des séries NEUVES — sinon le labo paraîtrait gelé', () => {
    const apres = remplacerValeur(TRAJETS, 0, 99);
    expect(apres).not.toBe(TRAJETS);
    expect(apres.items).not.toBe(TRAJETS.items);
    expect(TRAJETS.items[0].valeur).toBe(6);       // l'original est intact
    const pond = changerPoids(BULLETIN, 0, 4);
    expect(pond).not.toBe(BULLETIN);
    expect(BULLETIN.items[0].poids).toBe(1);
  });
});
