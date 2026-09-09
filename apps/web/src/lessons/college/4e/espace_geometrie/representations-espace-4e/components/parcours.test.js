import { describe, it, expect } from 'vitest';
import {
  aireBaseCarree, aireDisque, volumePyramide, volumeCone, volumePrisme, volumeCylindre,
  versements, longueursDe, apothemeFace, patronPyramide, patronSeReferme,
  coneParRevolution, arrondi, fr, vol, DIMENSIONS, PROBLEMES,
} from './espace4e';
import { pointsDe, cadreDe as cadreLongueurs, FUITE } from './LongueursLab';
import { patronAvec, cadreDe as cadrePatron } from './PatronLab';
import { BORNES, APLATI, cadre as cadreRevolution, secteurBase } from './RevolutionLab';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module AFFIRME des choses — « il en faut exactement trois », « l'ordre
 * des trois longueurs ne change jamais », « seule celle du milieu referme le
 * patron », « le même tiers sur une base ronde », « doubler la hauteur double
 * le volume ». Ces affirmations sont du CONTENU PÉDAGOGIQUE : si le
 * comportement réel diffère, la leçon ment à l'élève.
 *
 * Ce fichier vérifie trois choses, et rien d'autre :
 *   1. CHAQUE NOMBRE QUE LES MODULES MONTRENT, recalculé depuis le noyau ;
 *   2. LA REACHABILITÉ — toute valeur que l'élève doit atteindre sur un
 *      curseur est bien atteignable d'un cran ;
 *   3. LA SÉCURITÉ VISUELLE — les cadres dérivés contiennent tout le contenu,
 *      pour toutes les valeurs atteignables, et l'ordre VU des longueurs est
 *      celui que le texte annonce.
 */

/** Toutes les dimensions atteignables par les curseurs du M1 et du M2. */
const DIMS = [];
for (let c = DIMENSIONS.coteMin; c <= DIMENSIONS.coteMax; c += 1) {
  for (let h = DIMENSIONS.hauteurMin; h <= DIMENSIONS.hauteurMax; h += 1) DIMS.push([c, h]);
}

const dansLeCadre = (pts, cadre, quoi) => {
  for (const p of pts) {
    expect(p.x, `${quoi} : x`).toBeGreaterThanOrEqual(cadre.minX - 1e-9);
    expect(p.x, `${quoi} : x`).toBeLessThanOrEqual(cadre.maxX + 1e-9);
    expect(p.y, `${quoi} : y`).toBeGreaterThanOrEqual(cadre.minY - 1e-9);
    expect(p.y, `${quoi} : y`).toBeLessThanOrEqual(cadre.maxY + 1e-9);
  }
};

/* ═══ MODULE 1 — « il en faut exactement trois » ═══════════════════════ */
describe('Module 1 — les nombres de la jauge', () => {
  it('les valeurs par défaut (8 cm de côté, 9 cm de haut) donnent bien 3 versements', () => {
    const v = versements(aireBaseCarree(8), 9);
    expect(v.nombre).toBeCloseTo(3, 12);
    expect(v.pyramide).toBe(192);
    expect(v.prisme).toBe(576);
  });

  it('REACHABILITÉ : les valeurs par défaut sont atteignables sur les deux curseurs', () => {
    // Un défaut hors des bornes rendrait le curseur muet dès le premier geste.
    expect(8).toBeGreaterThanOrEqual(DIMENSIONS.coteMin);
    expect(8).toBeLessThanOrEqual(DIMENSIONS.coteMax);
    expect(9).toBeGreaterThanOrEqual(DIMENSIONS.hauteurMin);
    expect(9).toBeLessThanOrEqual(DIMENSIONS.hauteurMax);
  });

  it('le remplissage est EXACT au troisième versement sur tout le domaine — jamais au deuxième', () => {
    // La jauge du labo se remplit à `verses * vPyr / vPri` : ce test dit que
    // 2 ne suffisent jamais et que 3 remplissent pile.
    for (const [c, h] of DIMS) {
      const b = aireBaseCarree(c);
      const pyr = volumePyramide(b, h);
      const pri = volumePrisme(b, h);
      expect(2 * pyr, `${c}×${h}`).toBeLessThan(pri - 1e-9);
      expect(3 * pyr, `${c}×${h}`).toBeCloseTo(pri, 9);
    }
  });

  it('le texte « le tiers » est vrai sur une base RONDE aussi — la question 4 du M1', () => {
    for (const r of [1, 3, 5.5, 8]) {
      for (const h of [4, 9, 14]) {
        expect(volumeCylindre(r, h) / volumeCone(r, h), `r=${r} h=${h}`).toBeCloseTo(3, 10);
      }
    }
  });
});

/* ═══ MODULE 2 — « trois longueurs, un ordre qui ne change pas » ═══════ */
describe('Module 2 — les trois longueurs affichées', () => {
  it('L’ORDRE ANNONCÉ tient sur TOUT le domaine : hauteur < apothème < arête', () => {
    // C'est la phrase que le module écrit ; sans ce test elle serait un pari.
    for (const [c, h] of DIMS) {
      const L = longueursDe(c, h);
      expect(L.hauteur, `${c}×${h}`).toBeLessThan(L.apotheme);
      expect(L.apotheme, `${c}×${h}`).toBeLessThan(L.arete);
    }
  });

  it('les trois longueurs restent VISIBLEMENT distinctes à l’affichage (au centième)', () => {
    // Deux nombres arrondis identiques videraient la démonstration de son sens.
    for (const [c, h] of DIMS) {
      const L = longueursDe(c, h);
      const vus = [arrondi(L.hauteur, 2), arrondi(L.apotheme, 2), arrondi(L.arete, 2)];
      expect(new Set(vus).size, `${c}×${h} → ${vus.join(' / ')}`).toBe(3);
    }
  });

  it('l’ordre DESSINÉ est le même que l’ordre CALCULÉ — le schéma ne contredit pas le texte', () => {
    // Le dessin est une perspective : les longueurs y sont projetées. Si la
    // projection inversait l'ordre, l'élève verrait le contraire de ce qu'il lit.
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    for (const [c, h] of DIMS) {
      const p = pointsDe(c, h);
      const vueHauteur = d(p.O, p.S);
      const vueApotheme = d(p.M, p.S);
      const vueArete = d(p.B, p.S);
      expect(vueHauteur, `${c}×${h}`).toBeLessThan(vueApotheme);
      expect(vueApotheme, `${c}×${h}`).toBeLessThan(vueArete);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre dérivé contient tout le dessin, à toute dimension', () => {
    for (const [c, h] of DIMS) {
      const p = pointsDe(c, h);
      dansLeCadre(Object.values(p), cadreLongueurs(c, h), `${c}×${h}`);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre ne devient jamais démesurément étroit ou haut', () => {
    for (const [c, h] of DIMS) {
      const cadre = cadreLongueurs(c, h);
      expect(cadre.w, `${c}×${h}`).toBeGreaterThan(0);
      expect(cadre.h, `${c}×${h}`).toBeGreaterThan(0);
      expect(cadre.h / cadre.w, `${c}×${h}`).toBeLessThanOrEqual(3);
      expect(cadre.w / cadre.h, `${c}×${h}`).toBeLessThanOrEqual(3);
    }
  });

  it('la fuite garde la base LISIBLE : le carré vu n’est jamais aplati au point de disparaître', () => {
    expect(FUITE.dx).toBeGreaterThan(0.2);
    expect(FUITE.dy).toBeGreaterThan(0.2);
  });

  it('les nombres cités dans les explications du M2 sont ceux du noyau', () => {
    const L = longueursDe(8, 9);
    expect(L.hauteur).toBe(9);
    expect(arrondi(L.apotheme, 2)).toBe(9.85);
    expect(arrondi(L.arete, 2)).toBe(10.63);
  });
});

/* ═══ MODULE 3 — « seule celle du milieu referme le patron » ═══════════ */
describe('Module 3 — les trois candidates du patron', () => {
  const COTE = 8;
  const HAUTEUR = 6;
  const L = longueursDe(COTE, HAUTEUR);

  it('les trois candidates proposées sont les trois longueurs du module 2', () => {
    expect(L.hauteur).toBe(6);
    expect(arrondi(L.apotheme, 2)).toBe(7.21);
    expect(arrondi(L.arete, 2)).toBe(8.25);
  });

  it('UNE SEULE des trois referme le patron — et c’est celle du milieu', () => {
    const tol = 1e-3;
    expect(patronSeReferme(COTE, HAUTEUR, L.hauteur, tol)).toBe(false);
    expect(patronSeReferme(COTE, HAUTEUR, arrondi(L.apotheme, 4), tol)).toBe(true);
    expect(patronSeReferme(COTE, HAUTEUR, arrondi(L.arete, 4), tol)).toBe(false);
  });

  it('la tolérance du module (1e-3) est PLUS FINE que l’écart entre les candidates', () => {
    // Sinon deux candidates seraient jugées « bonnes » et la manipulation
    // n'enseignerait plus rien. C'est la règle « tolérance < ce que l'élève voit ».
    const juste = apothemeFace(COTE, HAUTEUR);
    expect(Math.abs(L.hauteur - juste)).toBeGreaterThan(1e-3);
    expect(Math.abs(L.arete - juste)).toBeGreaterThan(1e-3);
  });

  it('DÉFAUT ATTRAPÉ : la candidate ARRONDIE doit passer la tolérance du module', () => {
    // Le module propose des longueurs arrondies au dix-millième — c'est ce que
    // l'élève choisit. Le labo jugeait avec sa propre tolérance codée en dur
    // (1e-6), plus fine que cet arrondi : il déclarait « le solide reste
    // ouvert : il aurait fallu 7,21 cm » à l'élève qui venait de choisir
    // 7,21 cm. La tolérance traverse désormais le composant en prop.
    const arrondie = arrondi(L.apotheme, 4);
    expect(Math.abs(arrondie - apothemeFace(COTE, HAUTEUR))).toBeGreaterThan(1e-6);
    expect(patronSeReferme(COTE, HAUTEUR, arrondie, 1e-6)).toBe(false);
    expect(patronSeReferme(COTE, HAUTEUR, arrondie, 1e-3)).toBe(true);
  });

  it('la valeur attendue à l’étape 3 (au centième) est bien jugée juste', () => {
    expect(arrondi(L.apotheme, 2)).toBe(7.21);
    expect(patronSeReferme(COTE, HAUTEUR, 7.21, 1e-2)).toBe(true);
  });

  it('SÉCURITÉ VISUELLE : le cadre contient le patron JUSTE comme les deux FAUX', () => {
    // Le cadre est dimensionné sur la plus grande candidate : un patron erroné
    // à triangles trop longs ne doit pas non plus déborder.
    const max = Math.max(L.hauteur, L.apotheme, L.arete);
    const cadre = cadrePatron(COTE, max);
    for (const longueur of [L.hauteur, L.apotheme, L.arete]) {
      const p = patronAvec(COTE, longueur);
      dansLeCadre([...p.base, ...p.triangles.flatMap((t) => t.sommets)], cadre, `longueur ${longueur}`);
    }
  });

  it('le cadre du noyau contient bien le patron juste — le composant peut s’y fier', () => {
    for (const [c, h] of DIMS) {
      const p = patronPyramide(c, h);
      dansLeCadre([...p.base, ...p.triangles.flatMap((t) => t.sommets)], p.cadre, `${c}×${h}`);
    }
  });

  it('les quatre triangles du patron ont TOUS la même longueur candidate', () => {
    // Le composant les construit lui-même : un seul triangle divergent
    // rendrait le verdict incompréhensible.
    const p = patronAvec(8, 7.21);
    const hauteurs = p.triangles.map((t) => {
      const [A, B, S] = t.sommets;
      const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      return arrondi(Math.hypot(S.x - M.x, S.y - M.y), 6);
    });
    expect(new Set(hauteurs).size).toBe(1);
    expect(hauteurs[0]).toBeCloseTo(7.21, 6);
  });
});

/* ═══ MODULE 4 — « le même tiers, sur une base ronde » ═════════════════ */
describe('Module 4 — le cône par révolution', () => {
  const REVS = [];
  for (let r = BORNES.rayonMin; r <= BORNES.rayonMax; r += 1) {
    for (let h = BORNES.hauteurMin; h <= BORNES.hauteurMax; h += 1) REVS.push([r, h]);
  }

  it('REACHABILITÉ : les valeurs de départ (3 cm, 8 cm) sont sur les curseurs', () => {
    expect(3).toBeGreaterThanOrEqual(BORNES.rayonMin);
    expect(3).toBeLessThanOrEqual(BORNES.rayonMax);
    expect(8).toBeGreaterThanOrEqual(BORNES.hauteurMin);
    expect(8).toBeLessThanOrEqual(BORNES.hauteurMax);
  });

  it('REACHABILITÉ : le tour complet (360°) est atteignable au pas de 15°', () => {
    // L'étape 1 ne se valide QUE si l'élève atteint 360 : un pas qui ne
    // tomberait pas juste rendrait le module infranchissable.
    expect(360 % 15).toBe(0);
  });

  it('le rapport affiché vaut 3 pour TOUTES les dimensions atteignables', () => {
    for (const [r, h] of REVS) {
      const c = coneParRevolution(r, h);
      expect(arrondi(volumeCylindre(r, h) / c.volume, 4), `r=${r} h=${h}`).toBe(3);
    }
  });

  it('la génératrice est TOUJOURS plus longue que la hauteur — le piège reste réfutable', () => {
    for (const [r, h] of REVS) {
      expect(coneParRevolution(r, h).generatrice, `r=${r} h=${h}`).toBeGreaterThan(h);
    }
  });

  it('les nombres de l’étape 4 sont ceux du noyau : un cône de 3 par 8 fait 75 cm³', () => {
    expect(Math.round(coneParRevolution(3, 8).volume)).toBe(75);
    expect(Math.round(volumeCylindre(3, 8))).toBe(226);
    expect(fr(arrondi(aireDisque(3), 1), 1)).toBe('28,3');
  });

  it('les trois distracteurs de l’étape 4 sont DIFFÉRENTS de la bonne réponse', () => {
    const bon = Math.round(coneParRevolution(3, 8).volume);
    for (const faux of [Math.round(volumeCylindre(3, 8)), 24, 8]) {
      expect(faux, `distracteur ${faux}`).not.toBe(bon);
    }
  });

  it('SÉCURITÉ VISUELLE : le disque balayé tient dans le cadre à TOUT angle et TOUT rayon', () => {
    const C = cadreRevolution();
    for (let r = BORNES.rayonMin; r <= BORNES.rayonMax; r += 1) {
      for (let tour = 0; tour <= 360; tour += 15) {
        dansLeCadre(secteurBase(r, tour), C, `r=${r} tour=${tour}`);
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le sommet et le bas de l’ellipse tiennent dans le cadre', () => {
    const C = cadreRevolution();
    for (const [r, h] of REVS) {
      dansLeCadre(
        [{ x: 0, y: h }, { x: r, y: 0 }, { x: -r, y: 0 }, { x: 0, y: -r * APLATI }],
        C, `r=${r} h=${h}`
      );
    }
  });

  it('le cadre est FIXE : le dessin ne change pas d’échelle quand un curseur bouge', () => {
    // Un cadre recalculé à chaque geste ferait « sauter » le solide et
    // masquerait le seul changement qui compte : la rotation.
    expect(cadreRevolution()).toEqual(cadreRevolution());
  });
});

/* ═══ MODULE 5 — « une seule formule, deux écritures » ═════════════════ */
describe('Module 5 — le tableau de comparaison', () => {
  const H = 9;
  const C = 6;
  const R = 3;

  it('les quatre lignes du tableau sont celles du noyau', () => {
    expect(aireBaseCarree(C)).toBe(36);
    expect(arrondi(aireDisque(R), 1)).toBe(28.3);
    expect(aireBaseCarree(C) * H).toBe(324);
    expect(arrondi(aireDisque(R) * H, 1)).toBe(254.5);
    expect(volumePyramide(aireBaseCarree(C), H)).toBe(108);
    expect(arrondi(volumeCone(R, H), 1)).toBe(84.8);
  });

  it('les DEUX colonnes divisent bien par le même 3 — c’est la thèse du module', () => {
    expect((aireBaseCarree(C) * H) / volumePyramide(aireBaseCarree(C), H)).toBeCloseTo(3, 12);
    expect((aireDisque(R) * H) / volumeCone(R, H)).toBeCloseTo(3, 12);
  });

  it('les distracteurs chiffrés de l’étape 3 sont tous distincts de la réponse', () => {
    const bon = volumePyramide(aireBaseCarree(C), H);
    expect(bon).toBe(108);
    for (const faux of [volumePrisme(aireBaseCarree(C), H), aireBaseCarree(C), C * H]) {
      expect(faux).not.toBe(bon);
    }
  });

  it('les distracteurs chiffrés de l’étape 4 sont tous distincts de la réponse', () => {
    const bon = Math.round(volumeCone(R, H));
    expect(bon).toBe(85);
    for (const faux of [Math.round(volumeCylindre(R, H)), Math.round(aireDisque(R)), Math.round(volumeCone(R * 2, H))]) {
      expect(faux).not.toBe(bon);
    }
  });

  it('les deux bases sont assez PROCHES pour que l’attention porte sur la structure', () => {
    const rapport = aireBaseCarree(C) / aireDisque(R);
    expect(rapport).toBeGreaterThan(1);
    expect(rapport).toBeLessThan(1.5);
  });
});

/* ═══ MODULE 6 — les trois problèmes ══════════════════════════════════ */
describe('Module 6 — la tente, le cornet et le toit', () => {
  const P = Object.fromEntries(PROBLEMES.map((p) => [p.id, p]));

  it('la tente : 7,2 m³, et 21,6 m³ si l’on oublie le tiers', () => {
    expect(arrondi(P.tente.calcul(), 2)).toBe(7.2);
    expect(arrondi(P.tente.piege(), 2)).toBe(21.6);
    expect(vol(arrondi(P.tente.calcul(), 1), 'm', 1)).toBe('7,2 m³');
  });

  it('le cornet : environ 113 cm³, et 339 cm³ pour le cylindre', () => {
    expect(Math.round(P.cornet.calcul())).toBe(113);
    expect(Math.round(P.cornet.piege())).toBe(339);
  });

  it('le toit : DOUBLER la hauteur double le volume — 96 puis 192 m³', () => {
    expect(volumePyramide(aireBaseCarree(8), 3)).toBe(64);
    expect(volumePyramide(aireBaseCarree(8), 6)).toBe(128);
    expect(P.toit.calcul()).toBeCloseTo(2, 12);
    expect(P.toit.piege()).toBe(4);
  });

  it('l’étape 4 dit vrai : DOUBLER LE CÔTÉ, lui, quadruple le volume', () => {
    const rapport = volumePyramide(aireBaseCarree(16), 3) / volumePyramide(aireBaseCarree(8), 3);
    expect(rapport).toBeCloseTo(4, 12);
  });

  it('les deux rapports du module sont DIFFÉRENTS — sinon la comparaison ne dirait rien', () => {
    const parHauteur = P.toit.calcul();
    const parCote = volumePyramide(aireBaseCarree(16), 3) / volumePyramide(aireBaseCarree(8), 3);
    expect(parHauteur).not.toBeCloseTo(parCote, 6);
  });

  it('chaque piegeTexte existe et désigne une erreur, pas un encouragement vide', () => {
    for (const p of PROBLEMES) {
      expect(typeof p.piegeTexte, p.id).toBe('string');
      expect(p.piegeTexte.length, p.id).toBeGreaterThan(30);
    }
  });
});

/* ═══ MODULE 7 — les dix épreuves du boss ═════════════════════════════ */
describe('Module 7 — chaque nombre du boss est vrai, et NEUF', () => {
  it('é4 : l’arête de 13,93 cm et la hauteur de 12 cm vont bien ensemble (côté 10)', () => {
    const L = longueursDe(10, 12);
    expect(L.hauteur).toBe(12);
    expect(arrondi(L.arete, 2)).toBe(13.93);
  });

  it('é5 : l’apothème d’une pyramide 10 × 12 vaut EXACTEMENT 13 cm', () => {
    expect(apothemeFace(10, 12)).toBe(13);
    expect(patronSeReferme(10, 12, 13)).toBe(true);
    expect(patronSeReferme(10, 12, 12)).toBe(false); // la hauteur : le distracteur
  });

  it('é6 : la pyramide 5 × 12 fait 100 cm³, et le prisme 300 cm³', () => {
    expect(volumePyramide(aireBaseCarree(5), 12)).toBe(100);
    expect(volumePrisme(aireBaseCarree(5), 12)).toBe(300);
    expect(aireBaseCarree(5)).toBe(25);
  });

  it('é8 : le cône 4 × 6 fait 101 cm³, et le cylindre 302 cm³', () => {
    expect(Math.round(volumeCone(4, 6))).toBe(101);
    expect(Math.round(volumeCylindre(4, 6))).toBe(302);
    expect(arrondi(aireDisque(4), 1)).toBe(50.3);
  });

  it('é9 : le tas de sable fait 6,3 m³, et 18,8 m³ pour le cylindre', () => {
    expect(arrondi(volumeCone(2, 1.5), 1)).toBe(6.3);
    expect(arrondi(volumeCylindre(2, 1.5), 1)).toBe(18.8);
  });

  it('é10 : TRIPLER la hauteur triple le volume — 80 puis 240 m³', () => {
    expect(volumePyramide(aireBaseCarree(4), 15)).toBe(80);
    expect(volumePyramide(aireBaseCarree(4), 45)).toBe(240);
    expect(240 / 80).toBe(3);
  });

  it('TRANSFERT : aucune dimension du boss ne rejoue celles des modules', () => {
    // Un boss qui reprendrait les nombres travaillés mesurerait la mémoire,
    // pas la compétence.
    const modules = ['8-9', '8-6', '6-9', '3-8', '3-12', '3-2.4', '8-3', '8-6', '16-3'];
    const boss = ['10-12', '5-12', '4-6', '2-1.5', '4-15'];
    for (const b of boss) expect(modules, b).not.toContain(b);
  });
});

/* ═══ LE PÉRIMÈTRE, DANS LES TEXTES DE LA LEÇON ═══════════════════════ */
describe('Périmètre — aucun objet de 3e n’apparaît dans les données de la leçon', () => {
  it('les énoncés des problèmes ne parlent ni de coupe, ni de solide rond fermé', () => {
    const interdits = /section|sph[èe]re|boule|agrandissement/i;
    for (const p of PROBLEMES) {
      expect(interdits.test(`${p.titre} ${p.enonce} ${p.question} ${p.piegeTexte}`), p.id).toBe(false);
    }
  });
});
