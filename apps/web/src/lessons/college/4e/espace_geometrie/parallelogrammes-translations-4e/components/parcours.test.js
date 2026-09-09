import { describe, it, expect } from 'vitest';
import {
  A_DEFAUT, B_DEFAUT, D_DEFAUT, DEFIS, DRAPEAU, GLISSEMENT_DEFAUT,
  CADRE, PAS_GRILLE, TOL_DEFI, TOL_LONG,
  quatriemeSommet, glissementEntre, glisser, glisserFigure, ecartGlissements,
  etatQuad, estCroise, estParallelogramme, unSeulGlissement, invariants,
  demonstration, verifierOrdre, surLaGrille, dist, arrondi,
} from './paral4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « la figure reste un
 * parallélogramme quoi qu'il arrive », « les deux trajets ne se séparent
 * jamais », « un seul sommet déréglé suffit », « (5 ; 8) », « dix
 * parallélogrammes ». Ces affirmations sont du contenu pédagogique : si le
 * comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier vérifie aussi deux choses qu'aucune lecture du code ne
 * garantit :
 *   — l'ATTEIGNABILITÉ de ce que l'élève doit atteindre à la souris ;
 *   — la SÉCURITÉ VISUELLE du cadre dérivé, sur toutes les positions
 *     atteignables. Un cadre fixe laissait sortir la figure dans
 *     `pythagore-4e` ; ici, on refait le calcul du composant et on vérifie.
 */

/* ═══ Le cadre dérivé, reproduit à l'identique ═════════════════════════ */

/** La vue de `ConstructeurLab`, recopiée à l'identique — même marge, même
 *  taille minimale, même centrage. Si le composant change, ce test doit
 *  changer avec lui : c'est le prix d'une garde qui MESURE au lieu de croire. */
/** LA MARGE VAUT hitR + 6, pas moins : elle doit contenir le disque TACTILE
 *  invisible de chaque poignée, sinon le SVG déborde de la colonne pour un
 *  sommet posé au bord. C'est la suite navigateur qui l'a montré (« déborde :
 *  Sommet A ») — la marge de 40 était dimensionnée sur ce qui SE VOIT. */
const HIT_R = 68;
const MARGE = HIT_R + 6;
const MIN = 380;
function vueDe(A, B, D, Cpropose = null) {
  const Cjuste = quatriemeSommet(A, B, D);
  const pts = [A, B, D, Cjuste, ...(Cpropose ? [Cpropose] : [])];
  const minX = Math.min(...pts.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...pts.map((p) => p.x)) + MARGE;
  const minY = Math.min(...pts.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...pts.map((p) => p.y)) + MARGE;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const w = Math.max(MIN, maxX - minX);
  const h = Math.max(MIN, maxY - minY);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Le contenu tient-il dans la vue ? */
const contient = (vue, pts) => pts.every((p) =>
  p.x >= vue.x - 1e-9 && p.x <= vue.x + vue.w + 1e-9
  && p.y >= vue.y - 1e-9 && p.y <= vue.y + vue.h + 1e-9);

/** Les positions atteignables par l'élève : les nœuds de la grille, bornés
 *  au cadre par `surLaGrille`. On balaye tout le domaine, pas trois cas. */
function positionsAtteignables(pas = 60) {
  const out = [];
  for (let x = 40; x <= CADRE.largeur - 40; x += pas) {
    for (let y = 40; y <= CADRE.hauteur - 40; y += pas) {
      out.push(surLaGrille({ x, y }));
    }
  }
  return out;
}

/* ═══ MODULE 1 — le quatrième point arrive tout seul ═══════════════════ */
describe('Module 1 — « la figure reste un parallélogramme, quoi qu’il arrive »', () => {
  it('LA PROMESSE TIENT pour toutes les positions atteignables de D', () => {
    // La phrase du module : « quelles que soient les positions, la figure se
    // referme ». Si elle tombait ne serait-ce qu'une fois, le tableau de
    // relevés afficherait « non » et le module se contredirait.
    for (const D of positionsAtteignables(80)) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const e = etatQuad([A_DEFAUT, B_DEFAUT, C, D]);
      // On écarte les configurations dégénérées (D quasi aligné avec A et B),
      // où le « quadrilatère » est aplati et où aucune leçon ne parle.
      if (e.aire < 500) continue;
      expect(e.parallelogramme, `D = ${D.x},${D.y}`).toBe(true);
      expect(e.croise).toBe(false);
    }
  });

  it('LES QUATRE TÉMOINS s’allument ensemble, jamais l’un sans l’autre', () => {
    for (const D of positionsAtteignables(100)) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const e = etatQuad([A_DEFAUT, B_DEFAUT, C, D]);
      if (e.aire < 500) continue;
      const allumes = Object.values(e.temoins).filter((t) => t.ok).length;
      expect(allumes, `D = ${D.x},${D.y}`).toBe(4);
    }
  });

  it('LES FORMES RELEVÉES SONT VRAIMENT DIFFÉRENTES — la signature du module les distingue', () => {
    // Le module refuse un relevé dont la signature « AB|BC » existe déjà.
    // Si trois positions bien écartées donnaient la même signature, l'élève
    // ne pourrait jamais atteindre les trois relevés exigés.
    const signatures = new Set();
    for (const D of [{ x: 250, y: 160 }, { x: 400, y: 220 }, { x: 180, y: 120 }]) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const e = etatQuad([A_DEFAUT, B_DEFAUT, C, D]);
      signatures.add(`${arrondi(e.longueurs.AB, 0)}|${arrondi(e.longueurs.BC, 0)}`);
    }
    expect(signatures.size).toBe(3);
  });

  it('SÉCURITÉ VISUELLE : le cadre déduit contient TOUT, à toute position', () => {
    for (const D of positionsAtteignables(60)) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const v = vueDe(A_DEFAUT, B_DEFAUT, D);
      expect(contient(v, [A_DEFAUT, B_DEFAUT, D, C]), `D = ${D.x},${D.y}`).toBe(true);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre ne devient jamais démesuré (garde §6bis.4)', () => {
    for (const D of positionsAtteignables(60)) {
      const v = vueDe(A_DEFAUT, B_DEFAUT, D);
      const rapport = Math.max(v.w / v.h, v.h / v.w);
      expect(rapport, `D = ${D.x},${D.y} → ${v.w}×${v.h}`).toBeLessThanOrEqual(3);
      expect(v.w).toBeGreaterThan(0);
      expect(v.h).toBeGreaterThan(0);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre reste assez GRAND pour que la poignée fasse 44 px', () => {
    // Le `hitR` de 68 unités ne vaut 44 px que si le cadre reste dans un
    // ordre de grandeur connu. Un cadre qui doublerait rendrait la cible
    // deux fois plus petite à l'écran — une régression invisible en test
    // unitaire du composant.
    for (const D of positionsAtteignables(80)) {
      const v = vueDe(A_DEFAUT, B_DEFAUT, D);
      // 375 px de large : diamètre en px = 2 * HIT_R * 375 / largeur du cadre
      const diametrePx = (2 * HIT_R * 375) / v.w;
      expect(diametrePx, `D = ${D.x},${D.y} → cadre ${arrondi(v.w, 0)}`).toBeGreaterThanOrEqual(44);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre englobe aussi les DEUX points en mode défi', () => {
    for (const defi of DEFIS) {
      const Cjuste = quatriemeSommet(defi.A, defi.B, defi.D);
      for (const propose of positionsAtteignables(100)) {
        const v = vueDe(defi.A, defi.B, defi.D, propose);
        expect(contient(v, [defi.A, defi.B, defi.D, Cjuste, propose]),
          `${defi.id}, C proposé en ${propose.x},${propose.y}`).toBe(true);
      }
    }
  });
});

/* ═══ MODULE 2 — un seul glissement, deux trajets ══════════════════════ */
describe('Module 2 — « les deux trajets ne se séparent jamais »', () => {
  it('L’ÉCART EST NUL, à toute position — c’est ce que la case affiche', () => {
    for (const D of positionsAtteignables(80)) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const e = ecartGlissements(glissementEntre(A_DEFAUT, D), glissementEntre(B_DEFAUT, C));
      expect(e.longueur, `D = ${D.x},${D.y}`).toBeCloseTo(0, 9);
      expect(e.direction).toBeCloseTo(0, 6);
      expect(e.memeSens).toBe(true);
    }
  });

  it('LES TROIS RELEVÉS EXIGÉS SONT ATTEIGNABLES : trois signatures distinctes', () => {
    const signatures = new Set();
    for (const D of [{ x: 250, y: 160 }, { x: 380, y: 240 }, { x: 160, y: 100 }]) {
      const g = glissementEntre(A_DEFAUT, D);
      signatures.add(`${arrondi(g.longueur, 0)}|${arrondi(g.directionDeg, 0)}`);
    }
    expect(signatures.size).toBe(3);
  });

  it('LE CONTRE-EXEMPLE DU MODULE EST VRAI : A B D C est croisé, A B C D non', () => {
    const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
    expect(estCroise([A_DEFAUT, B_DEFAUT, C, D_DEFAUT])).toBe(false);
    expect(estCroise([A_DEFAUT, B_DEFAUT, D_DEFAUT, C])).toBe(true);
  });

  it('…et il reste vrai sur toutes les positions non dégénérées', () => {
    // Le module affiche les deux cartes côte à côte, l'une verte et l'autre
    // rouge. Si le croisement disparaissait pour certaines positions, la
    // carte rouge mentirait.
    for (const D of positionsAtteignables(80)) {
      const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D);
      const e = etatQuad([A_DEFAUT, B_DEFAUT, C, D]);
      if (e.aire < 2000) continue;
      expect(estCroise([A_DEFAUT, B_DEFAUT, D, C]), `D = ${D.x},${D.y}`).toBe(true);
    }
  });

  it('LE CERF-VOLANT du distracteur existe vraiment : côtés égaux, pas parallélogramme', () => {
    const cerfVolant = [
      { x: 200, y: 100 }, { x: 300, y: 240 }, { x: 200, y: 400 }, { x: 100, y: 240 },
    ];
    const e = etatQuad(cerfVolant);
    expect(Math.abs(e.longueurs.AB - e.longueurs.DA)).toBeLessThan(TOL_LONG);
    expect(Math.abs(e.longueurs.BC - e.longueurs.CD)).toBeLessThan(TOL_LONG);
    expect(e.parallelogramme).toBe(false);
  });
});

/* ═══ MODULE 3 — le défi ═══════════════════════════════════════════════ */
describe('Module 3 — le défi est FAISABLE, et il ne triche pas', () => {
  it('la cible tombe sur un nœud de grille pour CHAQUE défi', () => {
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      expect(C.x % PAS_GRILLE, `${d.id}`).toBe(0);
      expect(C.y % PAS_GRILLE).toBe(0);
    }
  });

  it('la TOLÉRANCE ne laisse passer aucun nœud VOISIN — sinon le défi serait faux', () => {
    // TOL_DEFI vaut 18 et le pas de grille 20 : un nœud voisin est à 20, donc
    // rejeté. Sans cette marge, un élève à côté de la cible réussirait, et le
    // message « c'est exactement là » serait un mensonge.
    expect(TOL_DEFI).toBeLessThan(PAS_GRILLE);
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      for (const [dx, dy] of [[PAS_GRILLE, 0], [0, PAS_GRILLE], [-PAS_GRILLE, 0], [0, -PAS_GRILLE]]) {
        const voisin = { x: C.x + dx, y: C.y + dy };
        expect(dist(voisin, C), `${d.id}`).toBeGreaterThan(TOL_DEFI);
      }
    }
  });

  it('le point de DÉPART proposé n’est jamais déjà la bonne réponse', () => {
    // Le bouton pose C au centre de gravité de A, B, D. Si ce point tombait
    // sur la cible, le défi se gagnerait sans rien faire.
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      const depart = surLaGrille({ x: (d.A.x + d.B.x + d.D.x) / 3, y: (d.A.y + d.B.y + d.D.y) / 3 });
      expect(dist(depart, C), `${d.id}`).toBeGreaterThan(TOL_DEFI);
    }
  });

  it('la cible est ATTEIGNABLE depuis le point de départ, par pas de grille', () => {
    // Le clavier avance de 20 : la cible doit être sur le même réseau que le
    // point de départ, sinon elle serait inatteignable au clavier.
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      const depart = surLaGrille({ x: (d.A.x + d.B.x + d.D.x) / 3, y: (d.A.y + d.B.y + d.D.y) / 3 });
      // `Math.abs` n'est pas cosmétique : le modulo d'un écart négatif vaut
      // -0 en JavaScript, et Object.is(-0, 0) est faux. Sans lui, le test
      // échouait sur une configuration parfaitement valide.
      expect(Math.abs((C.x - depart.x) % PAS_GRILLE), `${d.id}`).toBe(0);
      expect(Math.abs((C.y - depart.y) % PAS_GRILLE), `${d.id}`).toBe(0);
    }
  });

  it('les trois défis ne se ressemblent pas — sinon « deux réussites » ne prouverait rien', () => {
    const trajets = DEFIS.map((d) => {
      const g = glissementEntre(d.A, d.D);
      return `${arrondi(g.longueur, 0)}|${arrondi(g.directionDeg, 0)}`;
    });
    expect(new Set(trajets).size).toBe(DEFIS.length);
  });
});

/* ═══ MODULE 4 — la figure entière ═════════════════════════════════════ */
describe('Module 4 — « un seul sommet déréglé suffit »', () => {
  const g = glissementEntre({ x: 0, y: 0 }, { x: GLISSEMENT_DEFAUT.dx, y: GLISSEMENT_DEFAUT.dy });

  it('le drapeau intact PASSE le critère', () => {
    expect(unSeulGlissement(DRAPEAU, glisserFigure(DRAPEAU, g))).toBe(true);
  });

  it('LE DÉRÈGLEMENT DU LABO fait basculer le critère — le décalage est assez grand', () => {
    // Le composant décale l'image du sommet d'indice 2 de (+55 ; −35), soit
    // ~65 unités : bien au-delà de TOL_LONG (6). Un décalage trop faible
    // laisserait le verdict inchangé et le bouton n'enseignerait rien.
    const images = glisserFigure(DRAPEAU, g);
    images[2] = { x: images[2].x + 55, y: images[2].y - 35 };
    expect(unSeulGlissement(DRAPEAU, images)).toBe(false);
    expect(Math.hypot(55, 35)).toBeGreaterThan(TOL_LONG);
  });

  it('LE PARALLÉLOGRAMME M M’ N’ N annoncé par le labo en est bien un', () => {
    const images = glisserFigure(DRAPEAU, g);
    const quad = [DRAPEAU[0], images[0], images[1], DRAPEAU[1]];
    expect(estParallelogramme(quad)).toBe(true);
    expect(estCroise(quad)).toBe(false);
  });

  it('…et il CESSE d’en être un quand on dérègle le sommet concerné', () => {
    // Le sommet déréglé est le n° 2, qui n'entre pas dans M M’ N’ N : le
    // parallélogramme dessiné reste donc valide, et c'est VOULU — le message
    // du labo porte sur le critère, pas sur ce quadrilatère-là. On vérifie
    // ici que dérégler N’ le casserait bien, pour que la logique du composant
    // reste juste si un jour on change l'indice.
    const images = glisserFigure(DRAPEAU, g);
    images[1] = { x: images[1].x + 55, y: images[1].y - 35 };
    const quad = [DRAPEAU[0], images[0], images[1], DRAPEAU[1]];
    expect(estParallelogramme(quad)).toBe(false);
  });

  it('LES DIX PARALLÉLOGRAMMES annoncés à l’épreuve 3 existent tous', () => {
    // Le module affirme « dix, un pour chaque paire de sommets ». C'est un
    // nombre montré à l'élève : il doit être exact, et chaque paire doit
    // vraiment donner un parallélogramme.
    const images = glisserFigure(DRAPEAU, g);
    let compte = 0;
    for (let i = 0; i < DRAPEAU.length; i += 1) {
      for (let j = i + 1; j < DRAPEAU.length; j += 1) {
        const quad = [DRAPEAU[i], images[i], images[j], DRAPEAU[j]];
        expect(estParallelogramme(quad), `paire ${i},${j}`).toBe(true);
        compte += 1;
      }
    }
    expect(compte).toBe(10);
    expect(compte).toBe((5 * 4) / 2); // le nombre de paires de 5 sommets
  });

  it('L’AIRE affichée avant et après est la MÊME — le labo ne peut pas la contredire', () => {
    const inv = invariants(g, DRAPEAU);
    expect(arrondi(inv.aire.apres / 100, 1)).toBe(arrondi(inv.aire.avant / 100, 1));
  });

  it('SÉCURITÉ VISUELLE : la figure et son image tiennent dans le cadre du labo', () => {
    // Le cadre de `FigureGlissanteLab`, reproduit — marge 44, minimum 380.
    const MARGE4 = HIT_R + 6;
    for (let dx = -160; dx <= 260; dx += 60) {
      for (let dy = -140; dy <= 140; dy += 60) {
        const gg = { dx, dy, longueur: Math.hypot(dx, dy), directionDeg: 0 };
        const images = glisserFigure(DRAPEAU, gg);
        const tous = [...DRAPEAU, ...images];
        const minX = Math.min(...tous.map((p) => p.x)) - MARGE4;
        const maxX = Math.max(...tous.map((p) => p.x)) + MARGE4;
        const minY = Math.min(...tous.map((p) => p.y)) - MARGE4;
        const maxY = Math.max(...tous.map((p) => p.y)) + MARGE4;
        const w = Math.max(380, maxX - minX);
        const h = Math.max(380, maxY - minY);
        const v = { x: (minX + maxX) / 2 - w / 2, y: (minY + maxY) / 2 - h / 2, w, h };
        expect(contient(v, tous), `glissement ${dx},${dy}`).toBe(true);
        expect(Math.max(v.w / v.h, v.h / v.w), `glissement ${dx},${dy}`).toBeLessThanOrEqual(3);
      }
    }
  });
});

/* ═══ MODULE 5 — la justification ══════════════════════════════════════ */
describe('Module 5 — les phrases proposées disent vrai ou faux, comme annoncé', () => {
  it('la justification complète contient bien les TROIS rôles', () => {
    // Les trois morceaux justes du module, dans l'ordre — ils doivent
    // reconstituer une phrase qui a une donnée, une propriété et une
    // conclusion, exactement comme la chaîne du noyau.
    const phrase = [
      'Le glissement qui mène A en D mène aussi B en C.',
      'Donc [AD] et [BC] sont parallèles et de même longueur.',
      'Donc ABCD est un parallélogramme.',
    ].join(' ');
    expect(phrase).toMatch(/glissement/);
    expect(phrase).toMatch(/parallèles et de même longueur/);
    expect(phrase).toMatch(/parallélogramme/);
  });

  it('LE DISTRACTEUR « même longueur seulement » est bien insuffisant, en chiffres', () => {
    // Le module affirme qu'une longueur égale ne suffit pas. On le prouve.
    const contreExemple = [
      { x: 100, y: 300 }, { x: 400, y: 300 }, { x: 340, y: 160 }, { x: 160, y: 160 },
    ];
    const e = etatQuad(contreExemple);
    expect(e.temoins.egAdBc.ok).toBe(true);   // AD = BC
    expect(e.temoins.parAdBc.ok).toBe(false); // mais pas parallèles
    expect(e.parallelogramme).toBe(false);
  });
});

/* ═══ MODULE 6 — les démonstrations ════════════════════════════════════ */
describe('Module 6 — le désordre proposé n’est JAMAIS déjà le bon ordre', () => {
  const DESORDRE = {
    construction: [2, 0, 1],
    reconnaissance: [1, 2, 0],
    chainee: [2, 1, 0],
  };

  it('chaque situation est proposée dans un ordre FAUX — sinon l’exercice serait vide', () => {
    for (const [nom, perm] of Object.entries(DESORDRE)) {
      const d = demonstration(nom);
      const propose = perm.map((i) => d.maillons[i].id);
      expect(verifierOrdre(nom, propose).juste, nom).toBe(false);
    }
  });

  it('chaque permutation est bien une permutation des TROIS maillons', () => {
    for (const [nom, perm] of Object.entries(DESORDRE)) {
      expect([...perm].sort(), nom).toEqual([0, 1, 2]);
      const d = demonstration(nom);
      expect(new Set(perm.map((i) => d.maillons[i].id)).size).toBe(3);
    }
  });

  it('le bon ordre EST atteignable depuis chaque désordre proposé', () => {
    for (const nom of Object.keys(DESORDRE)) {
      const attendu = demonstration(nom).maillons.map((m) => m.id);
      expect(verifierOrdre(nom, attendu).juste, nom).toBe(true);
    }
  });

  it('LE MESSAGE D’ERREUR désigne un rôle qui existe', () => {
    // Le module écrit « à cet endroit, il faut la donnée / la propriété /
    // la conclusion » à partir de `premierFaux`. L'index doit toujours
    // désigner un maillon réel.
    for (const [nom, perm] of Object.entries(DESORDRE)) {
      const d = demonstration(nom);
      const propose = perm.map((i) => d.maillons[i].id);
      const v = verifierOrdre(nom, propose);
      expect(v.premierFaux, nom).toBeGreaterThanOrEqual(0);
      expect(v.premierFaux).toBeLessThan(3);
      expect(d.maillons[v.premierFaux].role).toBeTruthy();
    }
  });
});

/* ═══ BOSS — les nombres des épreuves ══════════════════════════════════ */
describe('Boss — les nombres annoncés dans les épreuves', () => {
  it('épreuve 5 : le glissement (2 ; 1) → (7 ; 4) mène bien (0 ; 5) en (5 ; 8)', () => {
    // La seule épreuve chiffrée du boss. Le repère y est celui de l'élève
    // (y vers le haut), mais la translation étant une addition composante à
    // composante, le résultat est identique quel que soit le sens de l'axe.
    const g = glissementEntre({ x: 2, y: 1 }, { x: 7, y: 4 });
    expect(g.dx).toBe(5);
    expect(g.dy).toBe(3);
    expect(glisser({ x: 0, y: 5 }, g)).toEqual({ x: 5, y: 8 });
  });

  it('…et les trois distracteurs de cette épreuve sont bien FAUX', () => {
    const g = glissementEntre({ x: 2, y: 1 }, { x: 7, y: 4 });
    const juste = glisser({ x: 0, y: 5 }, g);
    for (const faux of [{ x: 7, y: 9 }, { x: 2, y: 4 }, { x: 5, y: 2 }]) {
      expect(faux, JSON.stringify(faux)).not.toEqual(juste);
    }
  });

  it('épreuve 4 : dans EFCG, [EG] et [FC] sont bien deux côtés OPPOSÉS', () => {
    // L'énoncé nomme les sommets E, F, C, G dans l'ordre du contour. Les
    // côtés opposés sont donc [EF]/[CG] et [FC]/[GE] : le glissement qui
    // mène E en G, appliqué à F, pose C. On le vérifie sur des points.
    const E = { x: 100, y: 300 };
    const F = { x: 260, y: 320 };
    const G = { x: 180, y: 140 };
    const C = quatriemeSommet(E, F, G);
    expect(estParallelogramme([E, F, C, G])).toBe(true);
    const gEG = glissementEntre(E, G);
    const gFC = glissementEntre(F, C);
    expect(gFC.dx).toBeCloseTo(gEG.dx, 9);
    expect(gFC.dy).toBeCloseTo(gEG.dy, 9);
  });

  it('épreuve 10 : H I K J est bien le parallélogramme, et HJ = IK en découle', () => {
    const H = { x: 120, y: 320 };
    const J = { x: 300, y: 280 };
    const g = glissementEntre({ x: 0, y: 0 }, { x: 160, y: -120 });
    const I = glisser(H, g);
    const K = glisser(J, g);
    // Le contour est H, I, K, J : [HI] et [JK] sont les deux trajets.
    expect(estParallelogramme([H, I, K, J])).toBe(true);
    expect(estCroise([H, I, K, J])).toBe(false);
    // …d'où l'égalité annoncée, sur les côtés opposés restants.
    expect(dist(H, J)).toBeCloseTo(dist(I, K), 9);
  });
});
