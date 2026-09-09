import { describe, it, expect } from 'vitest';
import {
  PAS, CADRE, dansLeCadre, estSurNoeud, enCarreaux, fr,
  glissement, translater, translaterPoint, demiTour,
  trajetsConcordants, retrouverGlissement, retrouverCentre, quelGeste,
  invariants, parallelogrammeDe, diagonalesMemeMilieu,
  DRAPEAU, TRIANGLE_M3, QUAD_M4, M_POINT, M_PARA, N_PARA,
  CENTRE_DEMI_TOUR, GLISSEMENTS,
} from './translation4e';
import { sideLengths, interiorAngles, polygonArea, dist } from '../../../../../common/utils/geometry2d';
import { CAS } from '../modules/Module06LAtelierDesTroisGestes';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « le trajet mesure
 * 5 carreaux », « le côté [AB] en mesure 3 », « l'aire vaut 16 », « les traits
 * se croisent tous ». Ces affirmations sont du contenu pédagogique : si le
 * comportement réel diffère, la leçon MENT à l'élève, et aucun test d'unité
 * du noyau ne l'attrape.
 *
 * Ce fichier teste donc les ÉNONCÉS des modules, sur leurs données exactes, et
 * surtout leur ATTEIGNABILITÉ — la classe de défaut qui a rendu deux étapes
 * impossibles dans les leçons de référence : une cible entre deux nœuds, ou
 * une figure qui sort du cadre.
 */

/** Le laboratoire aimante aux nœuds : une cible qui n'en est pas un est
 *  INATTEIGNABLE, et l'étape ne peut jamais se valider. */
const CIBLE_ATTEIGNABLE = (p, quoi) => {
  expect(estSurNoeud(p), `${quoi} n'est pas sur un nœud : ${JSON.stringify(p)}`).toBe(true);
  expect(dansLeCadre([p]), `${quoi} sort du cadre : ${JSON.stringify(p)}`).toBe(true);
};

/* ═══ ATTEIGNABILITÉ — la garde transversale ═══════════════════════════════ */
describe('ATTEIGNABILITÉ : chaque cible tombe sur un nœud et tient dans le cadre', () => {
  it('M2 — l’image du point M est un nœud atteignable', () => {
    CIBLE_ATTEIGNABLE(translaterPoint(M_POINT, GLISSEMENTS.m2), 'M2 : l’image de M');
  });

  it('M2 — LES DEUX PIÈGES sont eux aussi atteignables : sinon on ne peut pas s’y tromper', () => {
    const g = GLISSEMENTS.m2;
    // Le piège du SENS : à la bonne distance, sur la bonne droite, du mauvais côté.
    CIBLE_ATTEIGNABLE({ x: M_POINT.x - g.dx, y: M_POINT.y - g.dy }, 'M2 : le piège du sens');
    // Le piège de la DIRECTION : même longueur, direction tournée d'un quart de tour.
    CIBLE_ATTEIGNABLE({ x: M_POINT.x - g.dy, y: M_POINT.y + g.dx }, 'M2 : le piège de la direction');
  });

  it('M3 — les trois sommets images du triangle sont des nœuds atteignables', () => {
    translater(TRIANGLE_M3, GLISSEMENTS.m3)
      .forEach((p, i) => CIBLE_ATTEIGNABLE(p, `M3 : le sommet image n°${i + 1}`));
  });

  it('M3 — les trois pastilles de DÉPART sont dans le cadre et loin des cibles', () => {
    const depart = [{ x: 600, y: 80 }, { x: 680, y: 80 }, { x: 640, y: 160 }];
    const cibles = translater(TRIANGLE_M3, GLISSEMENTS.m3);
    expect(dansLeCadre(depart)).toBe(true);
    // Aucune pastille ne doit être déjà « presque » à sa place : l'étape
    // serait à moitié gagnée sans que l'élève ait rien fait.
    depart.forEach((p, i) => expect(dist(p, cibles[i]), `pastille ${i}`).toBeGreaterThan(40));
  });

  it('M1, M4, M6 — chaque figure ET sa copie tiennent dans le cadre', () => {
    for (const [nom, fig, img] of [
      ['M1 glissement', DRAPEAU, translater(DRAPEAU, GLISSEMENTS.m1)],
      ['M1 demi-tour', DRAPEAU, demiTour(DRAPEAU, CENTRE_DEMI_TOUR)],
      ['M3', TRIANGLE_M3, translater(TRIANGLE_M3, GLISSEMENTS.m3)],
      ['M4', QUAD_M4, translater(QUAD_M4, GLISSEMENTS.m4)],
    ]) {
      expect(dansLeCadre(fig), `${nom} : la figure`).toBe(true);
      expect(dansLeCadre(img), `${nom} : la copie`).toBe(true);
    }
  });

  it('M5 — le parallélogramme de départ tient tout entier dans le cadre', () => {
    expect(dansLeCadre(parallelogrammeDe(M_PARA, N_PARA, GLISSEMENTS.m5).sommets)).toBe(true);
  });

  it('M6 — les TROIS cas de l’atelier tiennent dans le cadre', () => {
    for (const cas of CAS) {
      expect(dansLeCadre(cas.figure), `${cas.id} : la figure`).toBe(true);
      expect(dansLeCadre(cas.image), `${cas.id} : la copie`).toBe(true);
    }
  });
});

/* ═══ MODULE 1 — Le tapis roulant ══════════════════════════════════════════ */
describe('Module 1 — « les traits restent parallèles, sauf au demi-tour »', () => {
  const image = translater(DRAPEAU, GLISSEMENTS.m1);
  const retourne = demiTour(DRAPEAU, CENTRE_DEMI_TOUR);

  it('le drapeau a CINQ sommets — la copie annonce « les cinq traits »', () => {
    expect(DRAPEAU).toHaveLength(5);
  });

  it('le drapeau est DISSYMÉTRIQUE : un demi-tour s’y voit vraiment', () => {
    // Si la figure avait un centre de symétrie, le demi-tour la laisserait
    // inchangée et le contraste du module 1 ne montrerait rien.
    const centreG = {
      x: DRAPEAU.reduce((s, p) => s + p.x, 0) / 5,
      y: DRAPEAU.reduce((s, p) => s + p.y, 0) / 5,
    };
    const parElle = demiTour(DRAPEAU, centreG);
    expect(parElle.every((p) => DRAPEAU.some((q) => dist(p, q) < 2))).toBe(false);
  });

  it('les cinq traits du GLISSEMENT sont concordants — l’affirmation du labo', () => {
    expect(trajetsConcordants(DRAPEAU, image)).toBe(true);
    expect(retrouverGlissement(DRAPEAU, image)).not.toBe(null);
  });

  it('les cinq traits du DEMI-TOUR ne le sont pas, et se croisent au centre annoncé', () => {
    expect(trajetsConcordants(DRAPEAU, retourne)).toBe(false);
    expect(retrouverGlissement(DRAPEAU, retourne)).toBe(null);
    expect(retrouverCentre(DRAPEAU, retourne)).toEqual(CENTRE_DEMI_TOUR);
  });

  it('la position de DÉPART de la flèche donne un glissement non nul et lisible', () => {
    // Le module part de (origine + 320, origine + 80) : le labo doit afficher
    // un sens, pas un tiret.
    const g = glissement({ dx: 320, dy: 80 });
    expect(g.estNul).toBe(false);
    expect(g.sens).not.toBe(null);
  });

  it('LA COPIE NE SORT JAMAIS DU CADRE, où qu’on tire la flèche', () => {
    /* DÉFAUT ATTRAPÉ AU NAVIGATEUR. La pointe était bornée au cadre, mais pas
       la COPIE : tirée vers le bas à droite, la figure image partait à
       x = 812 sur un viewBox de 760, et l'élève voyait son drapeau
       disparaître par le bord. Le laboratoire borne désormais la pointe à
       partir de la boîte de la FIGURE ; ce test rejoue le même calcul. */
    const ORIGINE = { x: 360, y: 240 };
    const MARGE = 24;
    const bb = {
      minX: Math.min(...DRAPEAU.map((p) => p.x)), maxX: Math.max(...DRAPEAU.map((p) => p.x)),
      minY: Math.min(...DRAPEAU.map((p) => p.y)), maxY: Math.max(...DRAPEAU.map((p) => p.y)),
    };
    const xlo = Math.max(68, ORIGINE.x + MARGE - bb.minX);
    const xhi = Math.min(CADRE.w - 68, ORIGINE.x + CADRE.w - MARGE - bb.maxX);
    const ylo = Math.max(68, ORIGINE.y + MARGE - bb.minY);
    const yhi = Math.min(CADRE.h - 68, ORIGINE.y + CADRE.h - MARGE - bb.maxY);

    // Aux QUATRE coins de la course autorisée, la copie tient dans le cadre.
    for (const [px, py] of [[xlo, ylo], [xhi, ylo], [xlo, yhi], [xhi, yhi]]) {
      const g = glissement({ dx: px - ORIGINE.x, dy: py - ORIGINE.y });
      const img = translater(DRAPEAU, g);
      const dedans = img.every(
        (p) => p.x >= 0 && p.x <= CADRE.w && p.y >= 0 && p.y <= CADRE.h,
      );
      expect(dedans, `pointe (${px} ; ${py}) → ${JSON.stringify(img)}`).toBe(true);
    }
  });

  it('…et il reste assez de course pour que la manipulation vaille la peine', () => {
    // Une course d'un carreau ferait un laboratoire décoratif : on exige au
    // moins 8 carreaux horizontalement et 5 verticalement.
    const ORIGINE = { x: 360, y: 240 };
    const MARGE = 24;
    const bb = {
      minX: Math.min(...DRAPEAU.map((p) => p.x)), maxX: Math.max(...DRAPEAU.map((p) => p.x)),
      minY: Math.min(...DRAPEAU.map((p) => p.y)), maxY: Math.max(...DRAPEAU.map((p) => p.y)),
    };
    const courseX = Math.min(CADRE.w - 68, ORIGINE.x + CADRE.w - MARGE - bb.maxX)
      - Math.max(68, ORIGINE.x + MARGE - bb.minX);
    const courseY = Math.min(CADRE.h - 68, ORIGINE.y + CADRE.h - MARGE - bb.maxY)
      - Math.max(68, ORIGINE.y + MARGE - bb.minY);
    expect(enCarreaux(courseX), 'course horizontale').toBeGreaterThanOrEqual(8);
    expect(enCarreaux(courseY), 'course verticale').toBeGreaterThanOrEqual(5);
  });

  it('deux glissements opposés ont la MÊME direction — ce que dit l’étape 4', () => {
    const g = GLISSEMENTS.m1;
    expect(g.retour().direction).toBeCloseTo(g.direction, 9);
    expect(g.retour().sens).not.toBe(g.sens);
  });
});

/* ═══ MODULE 2 — Le trajet d'un seul point ═════════════════════════════════ */
describe('Module 2 — les nombres cités par la rédaction', () => {
  const g = GLISSEMENTS.m2;

  it('le glissement mesure EXACTEMENT 5 carreaux — c’est la réponse attendue', () => {
    expect(enCarreaux(g.longueur)).toBe(5);
    // …et c'est un entier, ce qui compte : `parseFr` de NumericQuestion est
    // entier, et une réponse décimale ne se validerait jamais sans parseDec.
    expect(Number.isInteger(enCarreaux(g.longueur))).toBe(true);
  });

  it('les deux déplacements cités (4 et 3 carreaux) sont ceux du code', () => {
    expect(enCarreaux(Math.abs(g.dx))).toBe(4);
    expect(enCarreaux(Math.abs(g.dy))).toBe(3);
    // 3-4-5 : la diagonale tombe juste, et l'élève peut la retrouver.
    expect(4 ** 2 + 3 ** 2).toBe(5 ** 2);
  });

  it('les DISTRACTEURS chiffrés nomment de vraies erreurs, toutes distinctes', () => {
    const somme = enCarreaux(Math.abs(g.dx)) + enCarreaux(Math.abs(g.dy)); // 7
    expect(somme).toBe(7);
    expect(somme).not.toBe(enCarreaux(g.longueur));
    expect(enCarreaux(Math.abs(g.dx))).not.toBe(enCarreaux(g.longueur));
    expect(enCarreaux(Math.abs(g.dy))).not.toBe(enCarreaux(g.longueur));
  });

  it('le sens du glissement est bien « vers le haut » — dy est négatif', () => {
    expect(g.dy).toBeLessThan(0);
    expect(g.sens).toMatch(/haut/);
  });

  it('LE PIÈGE DU SENS est un vrai piège : bonne longueur, bonne direction, mauvais point', () => {
    const piege = { x: M_POINT.x - g.dx, y: M_POINT.y - g.dy };
    const trace = glissement({ dx: piege.x - M_POINT.x, dy: piege.y - M_POINT.y });
    expect(trace.longueur).toBeCloseTo(g.longueur, 9);      // même longueur
    expect(trace.direction).toBeCloseTo(g.direction, 9);    // même direction
    expect(trace.sens).not.toBe(g.sens);                    // …mais pas le même sens
    expect(dist(piege, translaterPoint(M_POINT, g))).toBeGreaterThan(50);
  });

  it('le point de DÉPART de l’image est M lui-même : rien n’est suggéré', () => {
    // Le module démarre l'image SUR M ; le trajet tracé est donc nul, et
    // aucune des trois cases n'est verte au premier rendu.
    const trace = glissement({ dx: 0, dy: 0 });
    expect(trace.estNul).toBe(true);
    expect(trace.sens).toBe(null);
  });
});

/* ═══ MODULE 3 — Toute la figure ═══════════════════════════════════════════ */
describe('Module 3 — le triangle et sa longueur déduite', () => {
  const cotes = sideLengths(TRIANGLE_M3);

  it('le triangle a TROIS sommets — « trois fois le même geste »', () => {
    expect(TRIANGLE_M3).toHaveLength(3);
  });

  it('le côté [AB] mesure 3 carreaux ronds — la réponse attendue est un ENTIER', () => {
    expect(enCarreaux(cotes[0])).toBe(3);
    expect(Number.isInteger(enCarreaux(cotes[0]))).toBe(true);
  });

  it('les distracteurs de l’étape 3 sont DIFFÉRENTS de la bonne réponse', () => {
    const bonne = enCarreaux(cotes[0]);
    // « tu as donné le glissement » : la longueur du glissement, et son dx.
    expect(enCarreaux(GLISSEMENTS.m3.longueur)).not.toBe(bonne);
    expect(enCarreaux(Math.abs(GLISSEMENTS.m3.dx))).not.toBe(bonne);
    // « la figure a doublé »
    expect(bonne * 2).not.toBe(bonne);
  });

  it('le côté [A’B’] mesure BIEN la même chose : la promesse du module est vraie', () => {
    const image = translater(TRIANGLE_M3, GLISSEMENTS.m3);
    expect(enCarreaux(sideLengths(image)[0])).toBeCloseTo(enCarreaux(cotes[0]), 9);
  });

  it('les trois sommets images sont DISTINCTS deux à deux : trois cibles, pas deux', () => {
    const cibles = translater(TRIANGLE_M3, GLISSEMENTS.m3);
    for (let i = 0; i < 3; i += 1) {
      for (let j = i + 1; j < 3; j += 1) {
        expect(dist(cibles[i], cibles[j]), `${i}/${j}`).toBeGreaterThan(2 * PAS);
      }
    }
  });
});

/* ═══ MODULE 4 — Ce que le glissement garde ════════════════════════════════ */
describe('Module 4 — le quadrilatère scalène et son tableau', () => {
  const cotes = sideLengths(QUAD_M4);
  const angles = interiorAngles(QUAD_M4);

  it('LA FIGURE EST SCALÈNE : quatre côtés deux à deux différents', () => {
    // Sur un carré, « les longueurs sont conservées » serait vrai par accident
    // à la moindre erreur de code. Ici, rien ne peut marcher par hasard.
    const tries = [...cotes].sort((a, b) => a - b);
    for (let i = 1; i < tries.length; i += 1) {
      expect(tries[i] - tries[i - 1], `côtés ${i - 1}/${i}`).toBeGreaterThan(0.3 * PAS);
    }
  });

  it('AUCUN angle n’est droit : la figure n’a rien de particulier', () => {
    for (const a of angles) expect(Math.abs(a - 90), `angle ${a}`).toBeGreaterThan(8);
  });

  it('l’aire vaut 16 carreaux RONDS — le nombre que le module affiche', () => {
    expect(polygonArea(QUAD_M4) / (PAS * PAS)).toBe(16);
  });

  it('le côté [AB] mesure 3 carreaux ronds — la réponse attendue de l’étape 2', () => {
    expect(enCarreaux(cotes[0])).toBe(3);
  });

  it('les QUATRE invariants tiennent pour TOUT glissement atteignable', () => {
    // Une seule position ne prouverait rien. On balaie tout le cadre, au pas
    // du quadrillage — c'est-à-dire tous les états que l'élève peut atteindre.
    for (let dx = -6 * PAS; dx <= 10 * PAS; dx += PAS) {
      for (let dy = -6 * PAS; dy <= 6 * PAS; dy += PAS) {
        const inv = invariants(QUAD_M4, translater(QUAD_M4, glissement({ dx, dy })));
        expect(inv.tout, `dx=${dx} dy=${dy}`).toBe(true);
      }
    }
  });

  it('le DEMI-TOUR conserve EXACTEMENT les mêmes grandeurs — le piège de l’étape 4', () => {
    // C'est l'affirmation la plus délicate du module : si elle était fausse,
    // la question « peut-on conclure ? » n'aurait plus de sens.
    const inv = invariants(QUAD_M4, demiTour(QUAD_M4, CENTRE_DEMI_TOUR));
    expect(inv.longueurs.conserve).toBe(true);
    expect(inv.angles.conserve).toBe(true);
    expect(inv.aire.conserve).toBe(true);
    expect(inv.parallelisme.conserve).toBe(true);
    // …et pourtant ce n'est pas une translation.
    expect(quelGeste(QUAD_M4, demiTour(QUAD_M4, CENTRE_DEMI_TOUR))).toBe('demi-tour');
  });

  it('l’aire s’affiche en carreaux CARRÉS, jamais en carreaux', () => {
    // Le défaut attrapé pendant la construction : diviser l'aire par PAS au
    // lieu de PAS² affichait « 640 carreaux » pour une figure de 16.
    expect(polygonArea(QUAD_M4) / PAS).not.toBe(16);
    expect(polygonArea(QUAD_M4) / (PAS * PAS)).toBe(16);
  });
});

/* ═══ MODULE 5 — Le parallélogramme ════════════════════════════════════════ */
describe('Module 5 — les deux ordres, et le verdict', () => {
  const q = parallelogrammeDe(M_PARA, N_PARA, GLISSEMENTS.m5);

  it('la configuration de départ EST un parallélogramme non aplati', () => {
    expect(q.aplati).toBe(false);
    expect(q.estParallelogramme).toBe(true);
    expect(diagonalesMemeMilieu(q)).toBe(true);
  });

  it('…et ce n’est NI un carré NI un rectangle : les distracteurs sont vrais', () => {
    const angles = interiorAngles(q.sommets);
    for (const a of angles) expect(Math.abs(a - 90), `angle ${a}`).toBeGreaterThan(8);
  });

  it('l’ordre CROISÉ n’est PAS un parallélogramme, et son aire s’annule', () => {
    /* DÉFAUT ATTRAPÉ ICI. On attendait « une aire plus petite » ; la formule
       du lacet renvoie EXACTEMENT zéro. Ce n'est pas un bug : les deux lobes
       du nœud papillon sont superposables et de sens opposés, donc ils
       s'annulent. Le fait est plus fort que celui qu'on croyait tester — et
       la rédaction du module devait donc dire « il se replie sur lui-même »,
       jamais « son aire est plus petite ». */
    expect(polygonArea(q.sommetsCroises)).toBe(0);
    expect(polygonArea(q.sommets)).toBeGreaterThan(0);
    // Le dessin, lui, reste bien visible : les quatre sommets sont distincts.
    for (let i = 0; i < 4; i += 1) {
      for (let j = i + 1; j < 4; j += 1) {
        expect(dist(q.sommetsCroises[i], q.sommetsCroises[j]), `${i}/${j}`).toBeGreaterThan(PAS);
      }
    }
  });

  it('les deux côtés [M M’] et [N N’] ont la MÊME longueur — l’argument du module', () => {
    expect(dist(q.M, q.Mprime)).toBeCloseTo(GLISSEMENTS.m5.longueur, 9);
    expect(dist(q.N, q.Nprime)).toBeCloseTo(GLISSEMENTS.m5.longueur, 9);
  });

  it('LE CAS APLATI EST ATTEIGNABLE : l’élève peut le fabriquer, et le labo le dit', () => {
    // N amené sur la droite portant le glissement depuis M — un état valide,
    // annoncé par le composant, et non un bug masqué.
    const g = GLISSEMENTS.m5;
    const N = { x: M_PARA.x + 2 * g.dx, y: M_PARA.y + 2 * g.dy };
    const plat = parallelogrammeDe(M_PARA, N, g);
    expect(plat.aplati).toBe(true);
    expect(plat.estParallelogramme).toBe(false);
  });

  it('le verdict tient pour TOUTE position de M et N que l’élève peut atteindre', () => {
    const g = GLISSEMENTS.m5;
    let vus = 0;
    for (let x = 2 * PAS; x <= 8 * PAS; x += PAS) {
      for (let y = 2 * PAS; y <= 8 * PAS; y += PAS) {
        const N = { x, y };
        const p = parallelogrammeDe(M_PARA, N, g);
        if (p.aplati) continue;
        // Hors du cas aplati, c'est TOUJOURS un parallélogramme : la règle du
        // module n'a aucune exception atteignable.
        expect(p.estParallelogramme, `N=(${x},${y})`).toBe(true);
        vus += 1;
      }
    }
    expect(vus).toBeGreaterThan(20);
  });
});

/* ═══ MODULE 6 — L'atelier des trois gestes ════════════════════════════════ */
describe('Module 6 — les trois cas portent bien le geste annoncé', () => {
  it('chaque cas a EXACTEMENT le geste que sa bonne réponse dit', () => {
    const attendu = { cas1: 'glissement', cas2: 'demi-tour', cas3: 'aucun' };
    for (const cas of CAS) {
      expect(quelGeste(cas.figure, cas.image), cas.id).toBe(attendu[cas.id]);
    }
  });

  it('les trois options de chaque cas décrivent les trois gestes possibles', () => {
    for (const cas of CAS) {
      expect(cas.options, cas.id).toHaveLength(3);
      expect(cas.correct).toBeGreaterThanOrEqual(0);
      expect(cas.correct).toBeLessThan(3);
    }
  });

  it('la BONNE RÉPONSE change de place d’un cas à l’autre', () => {
    const places = new Set(CAS.map((c) => c.correct));
    expect(places.size).toBe(3);
  });

  it('cas 3 — la copie est bien PLUS GRANDE : c’est ce que dit sa correction', () => {
    const cas3 = CAS.find((c) => c.id === 'cas3');
    expect(polygonArea(cas3.image)).toBeGreaterThan(1.5 * polygonArea(cas3.figure));
    // …et ses angles, eux, sont conservés : c'est ce qui en fait un
    // agrandissement et non une déformation.
    expect(invariants(cas3.figure, cas3.image).angles.conserve).toBe(true);
    expect(invariants(cas3.figure, cas3.image).longueurs.conserve).toBe(false);
  });

  it('cas 2 — le centre du demi-tour est retrouvable, et c’est celui de la leçon', () => {
    const cas2 = CAS.find((c) => c.id === 'cas2');
    expect(retrouverCentre(cas2.figure, cas2.image)).toEqual(CENTRE_DEMI_TOUR);
  });
});

/* ═══ LA CONFIGURATION ELLE-MÊME ═══════════════════════════════════════════ */
describe('lesson.config — les promesses du catalogue', () => {
  it('la somme des estimatedMin vaut la durée annoncée, et ne dépasse pas 90', () => {
    const somme = LESSON_CONFIG.modules.reduce((s, m) => s + m.estimatedMin, 0);
    expect(somme).toBe(LESSON_CONFIG.estimatedDurationMin);
    expect(somme).toBeLessThanOrEqual(90);
  });

  it('les huit modules sont numérotés de 0 à 7, dans l’ordre du parcours', () => {
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('les stages suivent l’arc pédagogique, du diagnostic à l’évaluation', () => {
    expect(LESSON_CONFIG.modules.map((m) => m.stage)).toEqual([
      'prerequisite_check', 'trigger', 'discovery',
      'manipulation', 'manipulation', 'manipulation',
      'practice_lab', 'evaluation',
    ]);
  });

  it('les CINQ Learning Points du catalogue sont tous enseignés', () => {
    const enseignes = new Set(
      LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []),
    );
    for (let i = 1; i <= 5; i += 1) {
      expect(enseignes.has(`4e_transformations-4e_P${i}`), `P${i}`).toBe(true);
    }
    expect(enseignes.size).toBe(5);
  });

  it('le périmètre EXCLUT explicitement les quatre objets de 3e', () => {
    const exclus = LESSON_CONFIG.teachingScope.exclude.join(' ').toLowerCase();
    for (const mot of ['notation fléchée', 'coordonnées', 'compose deux glissements', 'agrandissement']) {
      expect(exclus, mot).toContain(mot);
    }
  });

  it('la continuité est déclarée nulle, et le fichier en donne la raison', () => {
    expect(LESSON_CONFIG.continuity).toBe(null);
  });
});
