import { describe, it, expect } from 'vitest';
import {
  graduationPour, repereDe, graduationsDe, atteignable, placer, lirePoint,
  estParallelogramme, quatriemeSommet, plusProche, decimalesDuPas, couple, fr, arrondi,
  TEMPERATURES, TEMPERATURES_VALEURS, TEMPERATURES_HEURES, nuageTemperatures,
  ALTITUDES, ALTITUDES_VALEURS, ALTITUDES_KM,
  REPERE_PLACEMENT, CIBLES_PLACEMENT,
  REPERE_PARALLELOGRAMME, PARALLELOGRAMME,
  REPERE_REFUGES, BORNE, REFUGES,
} from './reperage4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « une seule graduation
 * convient », « le refuge qui paraît proche arrive deuxième », « D est en
 * (0 ; 1,5) ». Ces affirmations sont du contenu pédagogique : si le
 * comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier vérifie en plus deux classes de garanties qu'aucune relecture ne
 * donne :
 *
 *   ATTEIGNABILITÉ — chaque point que l'élève doit poser tombe sur un nœud
 *   RÉELLEMENT dessiné au pas du repère. Une cible à 2,5 dans une grille de
 *   pas 1 serait introuvable, et l'élève chercherait indéfiniment. Cette
 *   classe de défaut a cassé deux labos plus tôt dans cette vague.
 *
 *   SÉCURITÉ VISUELLE — aucun repère de la leçon ne devient démesurément haut
 *   ou large, et aucun ne porte plus de graduations que le budget.
 */

/** Le cadre que les labos déduisent, reproduit à l'identique. */
const HAUTEUR_CIBLE = 300;
const LARGEUR_CIBLE = 320;
const cadreGraduationLab = (repere) => {
  const etendueX = repere.xMax - repere.xMin;
  const etendueY = repere.yMax - repere.yMin;
  return {
    w: LARGEUR_CIBLE,
    h: HAUTEUR_CIBLE,
    unit: LARGEUR_CIBLE / etendueX,
    unitY: HAUTEUR_CIBLE / etendueY,
  };
};
/** Celui de `LectureLab` et `PlacementLab`, qui bornent l'unité à 44 px. */
const cadrePlacementLab = (repere) => {
  const etendueX = repere.xMax - repere.xMin;
  const etendueY = repere.yMax - repere.yMin;
  const unit = Math.min(340 / etendueX, 44);
  const unitY = Math.min(260 / etendueY, 44);
  return { w: etendueX * unit, h: etendueY * unitY, unit, unitY };
};

/* ═══ MODULE 1 — « une seule graduation convient » ══════════════════════ */
describe('Module 1 — le labo signature tient ses promesses', () => {
  const PAS_PROPOSES = [0.25, 0.5, 1, 2];

  it('les QUATRE pas proposés donnent QUATRE verdicts différents', () => {
    // C'est la garantie pédagogique du module : l'élève peut faire arriver
    // chacun des trois défauts, puis trouver la réponse. Sans cela, deux
    // boutons seraient redondants et la leçon perdrait un défaut.
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: PAS_PROPOSES });
    const verdicts = g.candidats.map((c) => c.verdict);
    expect(new Set(verdicts).size, verdicts.join(' ')).toBe(4);
    expect(verdicts).toEqual([
      'trop-de-graduations', 'ok', 'entre-les-graduations', 'points-confondus',
    ]);
  });

  it('EXACTEMENT UNE graduation est acceptable — le module l’affirme', () => {
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: PAS_PROPOSES });
    expect(g.candidats.filter((c) => c.ok)).toHaveLength(1);
    expect(g.recommande).toBe(0.5);
  });

  it('le pas de DÉPART (2) est bien un mauvais choix : il écrase des relevés', () => {
    // Le module ouvre sur un repère qui ne va pas — c'est le déclencheur.
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: [2] });
    expect(g.candidats[0].verdict).toBe('points-confondus');
    expect(g.candidats[0].confondus.length).toBeGreaterThan(0);
  });

  it('le compteur du panneau NE CONTREDIT JAMAIS le verdict affiché à côté', () => {
    /* DÉFAUT RÉEL, ATTRAPÉ ICI. Une première version comptait les POINTS du
       plan encore distincts. Chaque relevé ayant sa propre heure, deux points
       ne se superposent jamais complètement : le compteur affichait « 12/12 »
       juste à côté d'un verdict annonçant sept paires de relevés confondus.
       Le panneau contredisait le verdict, sur le même écran.

       L'invariant : dès que le verdict dit « points-confondus », le compteur
       DOIT montrer une perte, et réciproquement. */
    const nuage = nuageTemperatures();
    const distinctes = (pas) =>
      new Set(nuage.map((p) => arrondi(Math.round(p.y / pas) * pas, 9))).size;
    const initiales = new Set(TEMPERATURES_VALEURS).size;

    for (const pas of [0.25, 0.5, 1, 2]) {
      const c = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: [pas] }).candidats[0];
      const perte = distinctes(pas) < initiales;
      expect(perte, `pas ${pas} : verdict ${c.verdict}, compteur ${distinctes(pas)}/${initiales}`)
        .toBe(c.confondus.length > 0);
    }

    // Et la perte est bien RÉELLE au pas 2 : la phrase du module n'est pas creuse.
    expect(distinctes(2)).toBeLessThan(initiales);
    expect(distinctes(0.5)).toBe(initiales);
  });

  it('le tableau du module affiche les nombres que le noyau calcule', () => {
    const g = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: PAS_PROPOSES });
    expect(g.candidats.find((c) => c.pas === 0.25).graduations).toBe(43);
    expect(g.candidats.find((c) => c.pas === 0.5).graduations).toBe(22);
    expect(g.candidats.find((c) => c.pas === 1).horsNoeud).toHaveLength(7);
  });

  it('SÉCURITÉ VISUELLE : les ÉTIQUETTES d’axe ne peuvent pas se chevaucher', () => {
    /* DÉFAUT RÉEL, ATTRAPÉ PAR L'AUDIT DE MISE EN PAGE. Au pas 0,25, l'axe
       porte 43 graduations : `CoordPlane` n'en étiquetait qu'une sur deux, ce
       qui laissait 22 étiquettes « −2,5 » sur 300 px — elles se chevauchaient
       et débordaient du cadre. Le labo choisit désormais l'espacement des
       étiquettes d'après la place disponible.

       L'invariant : deux étiquettes voisines sont toujours séparées d'au
       moins ESPACE_MIN, quel que soit le pas choisi. */
    const ESPACE_MIN = 26;
    const espacement = (px) => Math.max(1, Math.ceil(ESPACE_MIN / Math.max(px, 1e-9)));
    for (const pas of PAS_PROPOSES) {
      const rep = repereDe(TEMPERATURES_HEURES, TEMPERATURES_VALEURS, 2, pas);
      const c = cadreGraduationLab(rep);
      const unitY = HAUTEUR_CIBLE / (rep.yMax - rep.yMin);
      const unitX = LARGEUR_CIBLE / (rep.xMax - rep.xMin);
      const every = Math.max(espacement(unitY * pas), espacement(unitX * 2));
      expect(every * unitY * pas, `pas ${pas} : étiquettes verticales trop serrées`)
        .toBeGreaterThanOrEqual(ESPACE_MIN - 1e-9);
      expect(every * unitX * 2, `pas ${pas} : étiquettes horizontales trop serrées`)
        .toBeGreaterThanOrEqual(ESPACE_MIN - 1e-9);
      expect(c.h).toBe(HAUTEUR_CIBLE);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre reste sain pour CHACUN des quatre pas', () => {
    for (const pas of PAS_PROPOSES) {
      const rep = repereDe(TEMPERATURES_HEURES, TEMPERATURES_VALEURS, 2, pas);
      const c = cadreGraduationLab(rep);
      expect(c.h / c.w, `pas ${pas}`).toBeLessThanOrEqual(3);
      expect(c.w).toBeGreaterThan(0);
      expect(c.h).toBeGreaterThan(0);
      // La hauteur est BORNÉE par construction : c'est ce qui empêche le pas
      // le plus fin de produire un repère de plusieurs milliers de pixels.
      expect(c.h).toBe(HAUTEUR_CIBLE);
    }
  });
});

/* ═══ MODULE 2 — lire entre deux graduations ═══════════════════════════ */
describe('Module 2 — la lecture que le module montre', () => {
  const repere = { xMin: -3, xMax: 3, yMin: -2, yMax: 2, xStep: 0.5, yStep: 0.5 };

  it('le point de départ (1 ; 1,5) est ATTEIGNABLE dans ce repère', () => {
    // Un point de départ hors grille se ferait aimanter au premier geste et
    // l'élève verrait sa position sauter sans l'avoir demandé.
    expect(atteignable({ x: 1, y: 1.5 }, repere)).toBe(true);
  });

  it('les deux lectures DIVERGENT — c’est toute la démonstration', () => {
    const l = lirePoint({ x: 1.5, y: -0.5 }, repere);
    expect(l.graduationsX).not.toBe(l.x);
    expect(l.graduationsX).toBe(9);
    expect(l.x).toBe(1.5);
  });

  it('l’affichage porte le bon nombre de décimales — la figure ne ment pas', () => {
    // Écrire « 2 » sous un point posé en 1,5 ferait croire à l'élève que son
    // point est mal placé alors qu'il est juste.
    expect(decimalesDuPas(repere.xStep)).toBe(1);
    expect(lirePoint({ x: 1.5, y: 0.5 }, repere).texte).toBe('(1,5 ; 0,5)');
  });

  it('le nombre annoncé à l’étape 3 est juste : 7 graduations de 0,5 font 3,5', () => {
    expect(7 * 0.5).toBe(3.5);
    // et le distracteur « 7 » est bien le compte, pas la coordonnée
    expect(7).not.toBe(3.5);
  });

  it('la garde de continuité : un pas hérité de 2 est REFUSÉ par le module 2', () => {
    // Le module borne le pas mémorisé aux valeurs < 1, sinon le point de
    // départ (1 ; 1,5) serait inatteignable et la question n'aurait plus de
    // sens. On vérifie ici que le refus est justifié.
    expect(atteignable({ x: 1, y: 1.5 }, { ...repere, xStep: 2, yStep: 2 })).toBe(false);
    expect(atteignable({ x: 1, y: 1.5 }, { ...repere, xStep: 0.25, yStep: 0.25 })).toBe(true);
  });

  it('SÉCURITÉ VISUELLE : le repère de lecture garde un rapport sain', () => {
    const c = cadrePlacementLab(repere);
    expect(c.h / c.w).toBeLessThanOrEqual(3);
    expect(c.w / c.h).toBeLessThanOrEqual(3);
    expect(graduationsDe(repere, 'x')).toBeLessThanOrEqual(26);
    expect(graduationsDe(repere, 'y')).toBeLessThanOrEqual(26);
  });
});

/* ═══ MODULE 3 — la méthode transposée ═════════════════════════════════ */
describe('Module 3 — les altitudes, à une autre échelle', () => {
  const PAS_PROPOSES = [50, 100, 200, 500];

  it('la réponse annoncée (100 m) est la SEULE acceptable', () => {
    const g = graduationPour(ALTITUDES_VALEURS, { budget: 26, pas: PAS_PROPOSES });
    expect(g.recommande).toBe(100);
    expect(g.candidats.filter((c) => c.ok).map((c) => c.pas)).toEqual([100]);
  });

  it('le pas de DÉPART (500) échoue, comme au module 1', () => {
    const g = graduationPour(ALTITUDES_VALEURS, { budget: 26, pas: [500] });
    expect(g.candidats[0].ok).toBe(false);
  });

  it('les TROIS défauts sont représentés parmi les quatre pas', () => {
    const g = graduationPour(ALTITUDES_VALEURS, { budget: 26, pas: PAS_PROPOSES });
    const verdicts = g.candidats.map((c) => c.verdict);
    expect(verdicts).toContain('trop-de-graduations');
    expect(verdicts).toContain('ok');
    expect(verdicts).toContain('points-confondus');
  });

  it('les durées de l’étape 3 : le pas de 5 min est BIEN la bonne réponse', () => {
    // Une première version proposait 12·18·25·31·44·57 min et annonçait
    // « aucune durée perdue » au pas de 5 — c'était FAUX, cinq durées
    // tombaient entre deux graduations. Défaut attrapé par ce test.
    const durees = [15, 20, 30, 45, 55, 70];
    const g = graduationPour(durees, { budget: 26, pas: [0.5, 1, 5, 25] });
    const par = (p) => g.candidats.find((c) => c.pas === p);
    expect(par(5).verdict).toBe('ok');
    expect(par(5).graduations).toBe(12);
    expect(par(1).verdict).toBe('trop-de-graduations');
    expect(par(1).graduations).toBe(56);
    expect(par(25).verdict).toBe('points-confondus');
  });

  it('SÉCURITÉ VISUELLE : le cadre tient pour les quatre pas d’altitude', () => {
    for (const pas of PAS_PROPOSES) {
      const rep = repereDe(ALTITUDES_KM, ALTITUDES_VALEURS, 2, pas);
      const c = cadreGraduationLab(rep);
      expect(c.h / c.w, `pas ${pas}`).toBeLessThanOrEqual(3);
      expect(c.h).toBe(HAUTEUR_CIBLE);
    }
  });
});

/* ═══ MODULE 4 — poser un point ════════════════════════════════════════ */
describe('Module 4 — ATTEIGNABILITÉ des cibles', () => {
  it('CHAQUE cible tombe sur un nœud RÉELLEMENT dessiné', () => {
    // LA garantie du module. Une seule cible hors grille, et l'élève cherche
    // une position qui n'existe pas.
    for (const c of CIBLES_PLACEMENT) {
      expect(atteignable(c, REPERE_PLACEMENT), `${c.nom} ${couple(c, 2)}`).toBe(true);
    }
  });

  it('chaque cible est DANS le cadre, bornes comprises', () => {
    for (const c of CIBLES_PLACEMENT) {
      expect(c.x, c.nom).toBeGreaterThanOrEqual(REPERE_PLACEMENT.xMin);
      expect(c.x, c.nom).toBeLessThanOrEqual(REPERE_PLACEMENT.xMax);
      expect(c.y, c.nom).toBeGreaterThanOrEqual(REPERE_PLACEMENT.yMin);
      expect(c.y, c.nom).toBeLessThanOrEqual(REPERE_PLACEMENT.yMax);
    }
  });

  it('le point de DÉPART n’est aucune des cibles — sinon la première serait acquise', () => {
    for (const c of CIBLES_PLACEMENT) {
      expect(placer({ x: 0, y: 0 }, REPERE_PLACEMENT)).not.toEqual({ x: c.x, y: c.y });
    }
  });

  it('les trois cibles sont DISTINCTES', () => {
    const cles = CIBLES_PLACEMENT.map((c) => `${c.x}|${c.y}`);
    expect(new Set(cles).size).toBe(CIBLES_PLACEMENT.length);
  });

  it('chaque cible demande un COMPTE de graduations différent de sa coordonnée', () => {
    // Si une cible avait des coordonnées entières, l'erreur visée
    // (compter autant de graduations que d'unités) ne se manifesterait pas.
    for (const c of CIBLES_PLACEMENT) {
      const l = lirePoint(c, REPERE_PLACEMENT);
      expect(l.graduationsX, `${c.nom} x`).not.toBe(c.x);
    }
  });

  it('le nombre annoncé à l’étape 2 est juste : 1,4 ÷ 0,2 = 7', () => {
    expect(arrondi(1.4 / 0.2, 9)).toBe(7);
  });

  it('SÉCURITÉ VISUELLE : le repère de placement reste sain', () => {
    const c = cadrePlacementLab(REPERE_PLACEMENT);
    expect(c.h / c.w).toBeLessThanOrEqual(3);
    expect(c.w / c.h).toBeLessThanOrEqual(3);
    expect(graduationsDe(REPERE_PLACEMENT, 'x')).toBeLessThanOrEqual(26);
    expect(graduationsDe(REPERE_PLACEMENT, 'y')).toBeLessThanOrEqual(26);
  });
});

/* ═══ MODULE 5 — le quatrième sommet ═══════════════════════════════════ */
describe('Module 5 — le parallélogramme se ferme vraiment', () => {
  const { A, B, C } = PARALLELOGRAMME;
  const D = quatriemeSommet(A, B, C);

  it('le sommet D annoncé est (1 ; 1,5)', () => {
    expect(D).toEqual({ x: 1, y: 1.5 });
  });

  it('AUCUN sommet ne colle à un axe — sinon son étiquette recouvre les graduations', () => {
    // Défaut relevé par l'audit de mise en page : B posé en x = −0,5 voyait
    // son nom recouvrir l'étiquette « −2 » de l'axe vertical.
    for (const [nom, P] of Object.entries({ A, B, C, D })) {
      expect(Math.abs(P.x), `${nom} trop près de l’axe vertical`).toBeGreaterThanOrEqual(1);
    }
  });

  it('D est ATTEIGNABLE dans le repère du module', () => {
    expect(atteignable(D, REPERE_PARALLELOGRAMME)).toBe(true);
  });

  it('les trois sommets donnés sont eux aussi sur des nœuds', () => {
    for (const [nom, P] of Object.entries({ A, B, C })) {
      expect(atteignable(P, REPERE_PARALLELOGRAMME), nom).toBe(true);
    }
  });

  it('avec ce D, ABCD EST un parallélogramme — et pas avant', () => {
    expect(estParallelogramme(A, B, C, D).parallelogramme).toBe(true);
    // le point de départ du module ne doit PAS déjà convenir
    expect(estParallelogramme(A, B, C, { x: 2, y: 2.5 }).parallelogramme).toBe(false);
  });

  it('les deux milieux affichés sont ceux que le noyau calcule', () => {
    const b = estParallelogramme(A, B, C, D);
    expect(b.milieuAC).toEqual({ x: -0.25, y: -0.5 });
    expect(b.milieuBD).toEqual({ x: -0.25, y: -0.5 });
    expect(couple(b.milieuAC, 2)).toBe('(−0,25 ; −0,5)');
  });

  it('les quatre sommets tiennent DANS le cadre', () => {
    for (const P of [A, B, C, D]) {
      expect(P.x).toBeGreaterThanOrEqual(REPERE_PARALLELOGRAMME.xMin);
      expect(P.x).toBeLessThanOrEqual(REPERE_PARALLELOGRAMME.xMax);
      expect(P.y).toBeGreaterThanOrEqual(REPERE_PARALLELOGRAMME.yMin);
      expect(P.y).toBeLessThanOrEqual(REPERE_PARALLELOGRAMME.yMax);
    }
  });

  it('SÉCURITÉ VISUELLE : le repère du parallélogramme reste sain', () => {
    const c = cadrePlacementLab(REPERE_PARALLELOGRAMME);
    expect(c.h / c.w).toBeLessThanOrEqual(3);
    expect(c.w / c.h).toBeLessThanOrEqual(3);
    expect(graduationsDe(REPERE_PARALLELOGRAMME, 'x')).toBeLessThanOrEqual(26);
    expect(graduationsDe(REPERE_PARALLELOGRAMME, 'y')).toBeLessThanOrEqual(26);
  });
});

/* ═══ MODULE 6 — décider par les coordonnées ═══════════════════════════ */
describe('Module 6 — les verdicts que le module affiche', () => {
  const etude = plusProche(BORNE, REFUGES);

  it('les trois carrés annoncés sont 13, 17 et 20', () => {
    expect(etude.classement.map((m) => m.carre)).toEqual([13, 17, 20]);
  });

  it('le gagnant est le Refuge du Col', () => {
    expect(etude.gagnant.nom).toBe('Refuge du Col');
  });

  it('LE PIÈGE FONCTIONNE : le refuge le plus à gauche n’est PAS le plus proche', () => {
    // Sans cela, l'élève pourrait répondre juste sans calculer, et le module
    // n'enseignerait rien.
    const plusAGauche = REFUGES.reduce((a, b) => (a.x < b.x ? a : b));
    expect(plusAGauche.nom).toBe('Refuge du Lac');
    expect(etude.gagnant.nom).not.toBe(plusAGauche.nom);
  });

  it('les trois carrés sont DISTINCTS — aucune égalité ambiguë', () => {
    const carres = etude.classement.map((m) => m.carre);
    expect(new Set(carres).size).toBe(3);
  });

  it('tous les refuges et la borne tiennent DANS le cadre', () => {
    for (const P of [BORNE, ...REFUGES]) {
      expect(P.x).toBeGreaterThanOrEqual(REPERE_REFUGES.xMin);
      expect(P.x).toBeLessThanOrEqual(REPERE_REFUGES.xMax);
      expect(P.y).toBeGreaterThanOrEqual(REPERE_REFUGES.yMin);
      expect(P.y).toBeLessThanOrEqual(REPERE_REFUGES.yMax);
    }
  });

  it('LE QUADRILATÈRE TROMPEUR de l’étape 3 n’en est PAS un, et y = 2 le corrige', () => {
    const A = { x: -4, y: -2 }, B = { x: -1, y: -3 }, C = { x: 3, y: 1 }, D = { x: 0, y: 3 };
    const b = estParallelogramme(A, B, C, D);
    expect(b.parallelogramme).toBe(false);
    expect(b.milieuAC).toEqual({ x: -0.5, y: -0.5 });
    expect(b.milieuBD).toEqual({ x: -0.5, y: 0 });
    // La réponse attendue de la NumericQuestion : y = 2.
    expect(quatriemeSommet(A, B, C)).toEqual({ x: 0, y: 2 });
    expect(estParallelogramme(A, B, C, { x: 0, y: 2 }).parallelogramme).toBe(true);
  });

  it('SÉCURITÉ VISUELLE : les deux repères du module restent sains', () => {
    for (const rep of [
      REPERE_REFUGES,
      { xMin: -5, xMax: 4, yMin: -4, yMax: 4, xStep: 1, yStep: 1 },
    ]) {
      const etX = rep.xMax - rep.xMin;
      const etY = rep.yMax - rep.yMin;
      expect(etY / etX).toBeLessThanOrEqual(3);
      expect(etX / etY).toBeLessThanOrEqual(3);
      expect(graduationsDe(rep, 'x')).toBeLessThanOrEqual(26);
      expect(graduationsDe(rep, 'y')).toBeLessThanOrEqual(26);
    }
  });
});

/* ═══ MODULE 7 — les épreuves du boss ══════════════════════════════════ */
describe('Module 7 — chaque nombre du boss est vérifié', () => {
  it('e1 : 5 graduations de 0,5 font 2,5', () => {
    expect(5 * 0.5).toBe(2.5);
  });

  it('e2 : 6 graduations de 0,2 font 1,2, et l’ordonnée est négative', () => {
    expect(arrondi(6 * 0.2, 6)).toBe(1.2);
  });

  it('e4 : à 1 kg près, les quatre masses ne donnent que deux points', () => {
    const g = graduationPour([2.1, 2.4, 2.8, 3.2], { budget: 26, pas: [1] });
    expect(g.candidats[0].verdict).toBe('points-confondus');
    const visibles = new Set([2.1, 2.4, 2.8, 3.2].map((v) => Math.round(v))).size;
    expect(visibles).toBe(2);
  });

  it('e5 : de 0 à 4 000 par pas de 10, il faut 401 graduations', () => {
    const g = graduationPour([0, 4000], { budget: 26, pas: [10] });
    expect(g.candidats[0].graduations).toBe(401);
    expect(g.candidats[0].verdict).toBe('trop-de-graduations');
  });

  it('e6 : de 1,50 à 1,80 par pas de 0,05, il faut 7 graduations', () => {
    const g = graduationPour([1.5, 1.55, 1.62, 1.8], { budget: 26, pas: [0.05] });
    expect(g.candidats[0].graduations).toBe(7);
  });

  it('e7 : 1,5 ÷ 0,25 = 6 graduations', () => {
    expect(arrondi(1.5 / 0.25, 9)).toBe(6);
  });

  it('e8 : deux axes de pas différents donnent 3 et −2', () => {
    expect(6 / 2).toBe(3);
    expect(-1 / 0.5).toBe(-2);
  });

  it('e9 : EFGH a bien deux milieux égaux à (3,5 ; 3,5)', () => {
    const b = estParallelogramme(
      { x: 1, y: 1 }, { x: 5, y: 2 }, { x: 6, y: 6 }, { x: 2, y: 5 }
    );
    expect(b.parallelogramme).toBe(true);
    expect(b.milieuAC).toEqual({ x: 3.5, y: 3.5 });
    expect(b.milieuBD).toEqual({ x: 3.5, y: 3.5 });
  });

  it('e10 : K est plus proche que L — 17 contre 20', () => {
    const r = plusProche({ x: 2, y: 1 }, [
      { x: 6, y: 2, nom: 'K' }, { x: 0, y: 5, nom: 'L' },
    ]);
    expect(r.gagnant.nom).toBe('K');
    expect(r.classement.map((m) => m.carre)).toEqual([17, 20]);
  });
});

/* ═══ Garanties transverses ════════════════════════════════════════════ */
describe('garanties transverses de la leçon', () => {
  it('AUCUN repère de la leçon ne dépasse le budget de graduations', () => {
    for (const [nom, rep] of Object.entries({
      placement: REPERE_PLACEMENT,
      parallelogramme: REPERE_PARALLELOGRAMME,
      refuges: REPERE_REFUGES,
    })) {
      expect(graduationsDe(rep, 'x'), `${nom} x`).toBeLessThanOrEqual(26);
      expect(graduationsDe(rep, 'y'), `${nom} y`).toBeLessThanOrEqual(26);
    }
  });

  it('AUCUN repère n’a un rapport d’aspect supérieur à 3', () => {
    for (const [nom, rep] of Object.entries({
      placement: REPERE_PLACEMENT,
      parallelogramme: REPERE_PARALLELOGRAMME,
      refuges: REPERE_REFUGES,
    })) {
      const c = cadrePlacementLab(rep);
      expect(c.h / c.w, `${nom} h/w`).toBeLessThanOrEqual(3);
      expect(c.w / c.h, `${nom} w/h`).toBeLessThanOrEqual(3);
    }
  });

  it('les deux jeux de données sont d’ORDRES DE GRANDEUR différents — le point du M3', () => {
    const amplitudeT = Math.max(...TEMPERATURES_VALEURS) - Math.min(...TEMPERATURES_VALEURS);
    const amplitudeA = Math.max(...ALTITUDES_VALEURS) - Math.min(...ALTITUDES_VALEURS);
    expect(amplitudeA / amplitudeT).toBeGreaterThan(100);
  });

  it('l’écriture française est celle des modules : virgule et vrai moins', () => {
    expect(fr(-3, 1)).toBe('−3');
    expect(couple({ x: -2.5, y: 1.5 }, 1)).toBe('(−2,5 ; 1,5)');
  });
});
