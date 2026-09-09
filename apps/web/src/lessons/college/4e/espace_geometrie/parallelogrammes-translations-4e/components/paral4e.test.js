import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  arrondi, fr, TOL_ANGLE, TOL_LONG,
  glissementEntre, glisser, glisserFigure, memeGlissement, ecartGlissements,
  quatriemeSommet, quatriemeSommetParMilieu,
  cotes, ecartDirection, sontParalleles, estParallelogramme, estCroise, etatQuad,
  invariants, unSeulGlissement,
  DEMONSTRATIONS, demonstration, verifierOrdre,
  assertScope4e,
  A_DEFAUT, B_DEFAUT, D_DEFAUT, DEFIS, DRAPEAU, GLISSEMENT_DEFAUT,
  PAS_GRILLE, surLaGrille, CADRE,
} from './paral4e';
import * as mod from './paral4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — le VECTEUR est réservé à la 3e', () => {
  it('ce noyau n’expose AUCUN objet vectoriel de 3e', () => {
    expect(mod.vecteur).toBeUndefined();
    expect(mod.coordonneesVecteur).toBeUndefined();
    expect(mod.chasles).toBeUndefined();
    expect(mod.sommeVecteurs).toBeUndefined();
    expect(mod.composerTranslations).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    for (const s of ['vecteur', 'chasles', 'coordonnees-vecteur', 'composition']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
    expect(assertScope4e('parallelogramme')).toBe(true);
    expect(assertScope4e('glissement')).toBe(true);
  });

  /**
   * LE BALAYAGE DU DISQUE — la garde la plus forte de la leçon.
   *
   * L'audit du lexique lit le flux d'exposition ; il ne verrait pas un mot
   * interdit glissé dans l'option d'une question jamais montrée, ni dans un
   * `aria-label`. Ici, on lit le disque.
   *
   * CE QUI EST RETIRÉ AVANT DE CHERCHER — exactement la convention de
   * `scripts/audit/check-3e-leak.mjs`, et pour la même raison : signaler une
   * DÉCLARATION D'EXCLUSION reviendrait à prendre pour une fuite le
   * mécanisme même qui l'empêche.
   *   · les commentaires, qui EXPLIQUENT ce qui est volontairement exclu ;
   *   · le bloc `exclude:` de `teachingScope`, dont le rôle est de NOMMER
   *     les notions hors programme (il n'est jamais rendu à l'élève) ;
   *   · les clés et messages de `assertScope4e`, la garde elle-même : une
   *     garde muette ne garde rien.
   *
   * Tout le reste — texte de question, option, `explain`, `aria-label`,
   * titre de brique, corps de knowledge.jsx — est du contenu que l'élève
   * peut lire, et n'a droit à aucune exemption.
   */
  const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

  const fichiersDeLaLecon = () => {
    const out = [];
    const parcourir = (d) => {
      for (const nom of readdirSync(d)) {
        const p = join(d, nom);
        if (statSync(p).isDirectory()) parcourir(p);
        else if (/\.(jsx?|mjs)$/.test(nom) && !nom.endsWith('.test.js')) out.push(p);
      }
    };
    parcourir(RACINE);
    return out;
  };

  /** Le code RÉELLEMENT exposable, une fois retirées les déclarations
   *  d'exclusion. Les caractères sont remplacés par des espaces plutôt que
   *  supprimés, pour que le numéro de ligne signalé reste celui du fichier. */
  const codeExposable = (source) => source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/exclude:\s*\[[\s\S]*?\]/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/const interdits = \{[\s\S]*?\n {2}\};/g, (m) => m.replace(/[^\n]/g, ' '));

  const chercher = (motif) => {
    const fautifs = [];
    for (const f of fichiersDeLaLecon()) {
      const nom = f.split('/').pop();
      codeExposable(readFileSync(f, 'utf-8')).split('\n').forEach((ligne, i) => {
        if (motif.test(ligne)) fautifs.push(`${nom}:${i + 1} → ${ligne.trim().slice(0, 60)}`);
      });
    }
    return fautifs;
  };

  it('LE MOT « vecteur » N’ATTEINT AUCUN CONTENU QUE L’ÉLÈVE PEUT LIRE', () => {
    expect(fichiersDeLaLecon().length, 'la leçon doit avoir été écrite').toBeGreaterThan(10);
    const fautifs = chercher(/vecteur/iu);
    expect(fautifs, fautifs.join(' | ')).toEqual([]);
  });

  it('« Chasles » non plus', () => {
    const fautifs = chercher(/chasles/iu);
    expect(fautifs, fautifs.join(' | ')).toEqual([]);
  });

  it('AUCUNE notation fléchée de 3e (flèche suscrite, ou A vers B) dans la leçon', () => {
    // La flèche suscrite U+20D7, et la flèche U+2192 employée comme notation
    // juste après une lettre majuscule.
    const fautifs = chercher(/⃗|[A-Z]{1,2}\s*→(?!\s)/u);
    expect(fautifs, fautifs.join(' | ')).toEqual([]);
  });

  it('la garde `assertScope4e` NOMME bien les quatre objets qu’elle interdit', () => {
    // Le pendant du balayage : le retrait ci-dessus n'est légitime que si la
    // garde existe RÉELLEMENT et couvre les quatre sujets.
    const source = readFileSync(join(RACINE, 'components/paral4e.js'), 'utf-8');
    for (const cle of ['vecteur', 'chasles', 'coordonnees-vecteur', 'composition']) {
      expect(source, cle).toContain(cle);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE GLISSEMENT
   ══════════════════════════════════════════════════════════════════════ */
describe('glissementEntre — un déplacement décrit par ce qui se voit', () => {
  it('donne le trajet, sa longueur et sa direction', () => {
    const g = glissementEntre({ x: 10, y: 20 }, { x: 40, y: 60 });
    expect(g.dx).toBe(30);
    expect(g.dy).toBe(40);
    expect(g.longueur).toBe(50);
    expect(g.directionDeg).toBeCloseTo(53.13, 2);
  });

  it('la DIRECTION est celle d’une droite : deux trajets opposés la partagent', () => {
    const aller = glissementEntre({ x: 0, y: 0 }, { x: 30, y: 40 });
    const retour = glissementEntre({ x: 30, y: 40 }, { x: 0, y: 0 });
    expect(retour.directionDeg).toBeCloseTo(aller.directionDeg, 9);
    // …mais le SENS diffère, et c'est ce qui fait le quadrilatère croisé.
    expect(ecartGlissements(aller, retour).memeSens).toBe(false);
  });

  it('glisser reporte EXACTEMENT le même trajet sur un autre point', () => {
    const g = glissementEntre({ x: 5, y: 5 }, { x: 25, y: -15 });
    const P = { x: 100, y: 100 };
    const image = glisser(P, g);
    expect(image).toEqual({ x: 120, y: 80 });
    expect(glissementEntre(P, image)).toEqual(g);
  });

  it('memeGlissement exige direction, sens ET longueur', () => {
    const g = glissementEntre({ x: 0, y: 0 }, { x: 60, y: 20 });
    expect(memeGlissement(g, { dx: 60, dy: 20, longueur: 0, directionDeg: 0 })).toBe(true);
    // Même longueur, sens opposé : PAS le même glissement.
    expect(memeGlissement(g, { dx: -60, dy: -20, longueur: 0, directionDeg: 0 })).toBe(false);
    // Même direction et sens, longueur double : pas le même non plus.
    expect(memeGlissement(g, { dx: 120, dy: 40, longueur: 0, directionDeg: 0 })).toBe(false);
  });

  it('ecartGlissements nomme ce qui manque', () => {
    const g1 = glissementEntre({ x: 0, y: 0 }, { x: 100, y: 0 });
    const g2 = glissementEntre({ x: 0, y: 0 }, { x: 80, y: 0 });
    const e = ecartGlissements(g1, g2);
    expect(e.longueur).toBeCloseTo(20, 9);
    expect(e.direction).toBeCloseTo(0, 9);
    expect(e.memeSens).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE QUATRIÈME SOMMET — deux chemins, un seul point
   ══════════════════════════════════════════════════════════════════════ */
describe('quatriemeSommet — construit par le glissement', () => {
  const CAS = [
    [A_DEFAUT, B_DEFAUT, D_DEFAUT],
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }],
    [{ x: 40, y: 200 }, { x: 260, y: 320 }, { x: 130, y: 60 }],
    [{ x: 300, y: 300 }, { x: 120, y: 260 }, { x: 380, y: 140 }],
  ];

  it('LE GESTE DE 4e ET CELUI DE 5e DONNENT LE MÊME POINT', () => {
    // C'est la charnière de la leçon : ce n'est pas une nouvelle
    // construction, c'est une nouvelle RAISON.
    for (const [A, B, D] of CAS) {
      const parGlissement = quatriemeSommet(A, B, D);
      const parMilieu = quatriemeSommetParMilieu(A, B, D);
      expect(parGlissement.x, JSON.stringify([A, B, D])).toBeCloseTo(parMilieu.x, 9);
      expect(parGlissement.y).toBeCloseTo(parMilieu.y, 9);
    }
  });

  it('le quadrilatère obtenu EST un parallélogramme, mesuré sur les points', () => {
    for (const [A, B, D] of CAS) {
      const C = quatriemeSommet(A, B, D);
      expect(estParallelogramme([A, B, C, D]), JSON.stringify([A, B, D])).toBe(true);
      expect(estCroise([A, B, C, D])).toBe(false);
    }
  });

  it('les deux trajets [AD] et [BC] sont LE MÊME glissement', () => {
    for (const [A, B, D] of CAS) {
      const C = quatriemeSommet(A, B, D);
      const gAD = glissementEntre(A, D);
      const gBC = glissementEntre(B, C);
      expect(memeGlissement(gAD, gBC, 1e-9), JSON.stringify([A, B, D])).toBe(true);
      expect(gAD.longueur).toBeCloseTo(gBC.longueur, 9);
    }
  });

  it('l’ORDRE compte : ABDC est croisé là où ABCD ne l’est pas', () => {
    const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
    expect(estCroise([A_DEFAUT, B_DEFAUT, C, D_DEFAUT])).toBe(false);
    expect(estCroise([A_DEFAUT, B_DEFAUT, D_DEFAUT, C])).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   L'ÉTAT DU QUADRILATÈRE — tout mesuré, rien affirmé
   ══════════════════════════════════════════════════════════════════════ */
describe('etatQuad — ce que la figure dit d’elle-même', () => {
  const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
  const PARA = [A_DEFAUT, B_DEFAUT, C, D_DEFAUT];

  it('les QUATRE témoins s’allument ensemble sur un parallélogramme', () => {
    const e = etatQuad(PARA);
    expect(e.temoins.parAbDc.ok).toBe(true);
    expect(e.temoins.parAdBc.ok).toBe(true);
    expect(e.temoins.egAbDc.ok).toBe(true);
    expect(e.temoins.egAdBc.ok).toBe(true);
    expect(e.parallelogramme).toBe(true);
  });

  it('les diagonales se coupent en LEUR MILIEU — la propriété de 5e, revérifiée', () => {
    const e = etatQuad(PARA);
    expect(e.diagonales.ecartMilieux).toBeCloseTo(0, 9);
    expect(e.diagonales.commun).toBe(true);
    // …et elles NE SONT PAS de même longueur : la misconception de 5e.
    expect(Math.abs(e.diagonales.AC - e.diagonales.BD)).toBeGreaterThan(TOL_LONG);
  });

  it('DÉPLACER UN SOMMET ÉTEINT les témoins — la figure ne triche pas', () => {
    const casse = [A_DEFAUT, B_DEFAUT, { x: C.x + 60, y: C.y - 45 }, D_DEFAUT];
    const e = etatQuad(casse);
    expect(e.parallelogramme).toBe(false);
    expect(e.temoins.parAbDc.ok && e.temoins.parAdBc.ok).toBe(false);
    // Et l'écart est NOMMÉ, pas seulement signalé.
    expect(e.temoins.parAbDc.ecart + e.temoins.parAdBc.ecart).toBeGreaterThan(TOL_ANGLE);
  });

  it('un quadrilatère dont deux côtés opposés sont ÉGAUX sans être parallèles n’est pas un parallélogramme', () => {
    // C'est le distracteur central du module 5 et du boss : le trapèze
    // isocèle a bien AB = DC, et pourtant.
    const trapeze = [
      { x: 100, y: 300 }, { x: 400, y: 300 }, { x: 340, y: 160 }, { x: 160, y: 160 },
    ];
    const e = etatQuad(trapeze);
    expect(Math.abs(e.longueurs.BC - e.longueurs.DA)).toBeLessThan(TOL_LONG);
    expect(e.temoins.parAdBc.ok).toBe(false);
    expect(e.parallelogramme).toBe(false);
  });

  it('l’aire et les angles sont MESURÉS sur le contour', () => {
    const carre = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
    const e = etatQuad(carre);
    expect(e.aire).toBeCloseTo(10000, 9);
    for (const a of e.angles) expect(a).toBeCloseTo(90, 6);
  });

  it('ecartDirection compare des DROITES, pas des demi-droites', () => {
    // Deux côtés opposés d'un contour sont parcourus en sens contraire :
    // sans cette précaution, on annoncerait 180° là où l'élève voit
    // deux traits parallèles.
    expect(ecartDirection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: -10, y: 5 })).toBeCloseTo(0, 9);
    expect(sontParalleles({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: -10, y: 5 })).toBe(true);
  });

  it('cotes donne les quatre côtés dans l’ordre du contour', () => {
    const q = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
    expect(cotes(q)).toEqual([[q[0], q[1]], [q[1], q[2]], [q[2], q[3]], [q[3], q[0]]]);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES INVARIANTS DU GLISSEMENT
   ══════════════════════════════════════════════════════════════════════ */
describe('invariants — ce que le glissement conserve, mesuré', () => {
  const g = glissementEntre({ x: 0, y: 0 }, { x: GLISSEMENT_DEFAUT.dx, y: GLISSEMENT_DEFAUT.dy });

  it('les longueurs, les angles et l’aire sont INCHANGÉS', () => {
    const inv = invariants(g, DRAPEAU);
    for (const l of inv.longueurs) expect(l.egal, `${l.avant} → ${l.apres}`).toBe(true);
    for (const a of inv.angles) expect(a.egal).toBe(true);
    expect(inv.aire.apres).toBeCloseTo(inv.aire.avant, 9);
  });

  it('la figure n’est PAS retournée par le glissement', () => {
    expect(invariants(g, DRAPEAU).orientationPreservee).toBe(true);
    // …contrairement à une symétrie AXIALE, qui retourne la figure : c'est
    // elle que ce témoin sépare du glissement.
    const miroir = DRAPEAU.map((p) => ({ x: 400 - p.x, y: p.y }));
    const aireSignee = (P) => P.reduce((s, a, i) => {
      const b = P[(i + 1) % P.length];
      return s + a.x * b.y - b.x * a.y;
    }, 0);
    expect(Math.sign(aireSignee(DRAPEAU))).not.toBe(Math.sign(aireSignee(miroir)));
  });

  it('CE QUI SÉPARE LE GLISSEMENT DU DEMI-TOUR DE 5e : un seul trajet, ou tous différents', () => {
    // Un demi-tour préserve l'orientation comme le glissement — l'aire signée
    // ne les distingue donc PAS (une première version du test le croyait).
    // Le vrai discriminant est le trajet : identique pour tous les points
    // dans un glissement, différent pour chacun dans un demi-tour.
    const O = { x: 200, y: 250 };
    const demiTour = DRAPEAU.map((p) => ({ x: 2 * O.x - p.x, y: 2 * O.y - p.y }));
    const aireSignee = (P) => P.reduce((s, a, i) => {
      const b = P[(i + 1) % P.length];
      return s + a.x * b.y - b.x * a.y;
    }, 0);
    expect(Math.sign(aireSignee(demiTour))).toBe(Math.sign(aireSignee(DRAPEAU)));

    expect(unSeulGlissement(DRAPEAU, demiTour)).toBe(false);
    expect(unSeulGlissement(DRAPEAU, glisserFigure(DRAPEAU, g))).toBe(true);

    // …et les trajets du demi-tour passent TOUS par le centre O.
    for (let i = 0; i < DRAPEAU.length; i += 1) {
      const m = { x: (DRAPEAU[i].x + demiTour[i].x) / 2, y: (DRAPEAU[i].y + demiTour[i].y) / 2 };
      expect(m.x).toBeCloseTo(O.x, 9);
      expect(m.y).toBeCloseTo(O.y, 9);
    }
  });

  it('TOUS LES TRAJETS sont le même glissement', () => {
    const inv = invariants(g, DRAPEAU);
    expect(unSeulGlissement(DRAPEAU, inv.images, 1e-9)).toBe(true);
    for (const t of inv.trajets) {
      expect(t.dx).toBeCloseTo(g.dx, 9);
      expect(t.dy).toBeCloseTo(g.dy, 9);
    }
  });

  it('…et un seul point mal placé SUFFIT à ce que ce n’en soit plus un', () => {
    const images = glisserFigure(DRAPEAU, g);
    images[2] = { x: images[2].x + 40, y: images[2].y };
    expect(unSeulGlissement(DRAPEAU, images)).toBe(false);
  });

  it('unSeulGlissement refuse des listes de tailles différentes ou vides', () => {
    expect(unSeulGlissement([], [])).toBe(false);
    expect(unSeulGlissement(DRAPEAU, DRAPEAU.slice(1))).toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA DÉMONSTRATION
   ══════════════════════════════════════════════════════════════════════ */
describe('demonstration — donnée, propriété, conclusion', () => {
  it('chaque situation a EXACTEMENT ces trois rôles, dans cet ordre', () => {
    for (const nom of Object.keys(DEMONSTRATIONS)) {
      const d = demonstration(nom);
      expect(d.maillons.map((m) => m.role), nom).toEqual(['donnee', 'propriete', 'conclusion']);
      expect(new Set(d.maillons.map((m) => m.id)).size).toBe(3);
      for (const m of d.maillons) expect(m.texte.length).toBeGreaterThan(20);
    }
  });

  it('les trois situations couvrent les trois usages du programme', () => {
    expect(Object.keys(DEMONSTRATIONS).sort()).toEqual(['chainee', 'construction', 'reconnaissance']);
  });

  it('verifierOrdre accepte le bon ordre et DÉSIGNE le premier maillon fautif', () => {
    const ids = demonstration('construction').maillons.map((m) => m.id);
    expect(verifierOrdre('construction', ids).juste).toBe(true);

    const inverse = [ids[2], ids[1], ids[0]];
    const v = verifierOrdre('construction', inverse);
    expect(v.juste).toBe(false);
    expect(v.premierFaux).toBe(0);

    // La conclusion mise en deuxième : le premier maillon est bon.
    const presque = [ids[0], ids[2], ids[1]];
    expect(verifierOrdre('construction', presque).premierFaux).toBe(1);
  });

  it('refuse une situation inconnue, en disant lesquelles existent', () => {
    expect(() => demonstration('inexistante')).toThrow(/construction/);
  });

  it('AUCUN maillon ne conclut sans nommer sa propriété', () => {
    // L'erreur visée par le module 6 : conclure « donc c'est un
    // parallélogramme » sans dire POURQUOI. Le maillon `propriete` de chaque
    // démonstration doit contenir un « or » ou nommer la propriété.
    for (const nom of Object.keys(DEMONSTRATIONS)) {
      const prop = demonstration(nom).maillons.find((m) => m.role === 'propriete');
      expect(prop.texte, nom).toMatch(/^Or /);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES DONNÉES DE LA LEÇON — ATTEIGNABILITÉ
   ══════════════════════════════════════════════════════════════════════ */
describe('les configurations du défi sont ATTEIGNABLES', () => {
  it('les trois points donnés sont sur la grille', () => {
    for (const d of DEFIS) {
      for (const nom of ['A', 'B', 'D']) {
        expect(d[nom].x % PAS_GRILLE, `${d.id}.${nom}.x`).toBe(0);
        expect(d[nom].y % PAS_GRILLE, `${d.id}.${nom}.y`).toBe(0);
      }
    }
  });

  it('LE SOMMET CACHÉ TOMBE EXACTEMENT SUR UN NŒUD — sinon le défi est infaisable', () => {
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      expect(C.x % PAS_GRILLE, `${d.id} : C.x = ${C.x}`).toBe(0);
      expect(C.y % PAS_GRILLE, `${d.id} : C.y = ${C.y}`).toBe(0);
      // …et l'aimantation à la grille le RETROUVE, à l'identique.
      expect(surLaGrille(C)).toEqual(C);
    }
  });

  it('le sommet caché reste DANS le cadre, avec sa marge', () => {
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      expect(C.x, d.id).toBeGreaterThanOrEqual(40);
      expect(C.y).toBeGreaterThanOrEqual(40);
      expect(C.x).toBeLessThanOrEqual(CADRE.largeur - 40);
      expect(C.y).toBeLessThanOrEqual(CADRE.hauteur - 40);
    }
  });

  it('les trois défis donnent des parallélogrammes DIFFÉRENTS et non dégénérés', () => {
    const formes = new Set();
    for (const d of DEFIS) {
      const C = quatriemeSommet(d.A, d.B, d.D);
      const e = etatQuad([d.A, d.B, C, d.D]);
      expect(e.parallelogramme, d.id).toBe(true);
      expect(e.croise).toBe(false);
      expect(e.aire).toBeGreaterThan(3000);
      formes.add(`${arrondi(e.longueurs.AB, 1)}|${arrondi(e.longueurs.BC, 1)}`);
    }
    expect(formes.size).toBe(DEFIS.length);
  });

  it('le parallélogramme de départ est franchement OBLIQUE (pas un rectangle déguisé)', () => {
    const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
    const e = etatQuad([A_DEFAUT, B_DEFAUT, C, D_DEFAUT]);
    for (const a of e.angles) expect(Math.abs(a - 90)).toBeGreaterThan(10);
  });

  it('surLaGrille aimante et borne au cadre', () => {
    expect(surLaGrille({ x: 143, y: 209 })).toEqual({ x: 140, y: 200 });
    expect(surLaGrille({ x: -500, y: -500 })).toEqual({ x: 40, y: 40 });
    expect(surLaGrille({ x: 9999, y: 9999 })).toEqual({ x: CADRE.largeur - 40, y: CADRE.hauteur - 40 });
  });

  it('le drapeau du module 4 est DISSYMÉTRIQUE — une rotation s’y verrait', () => {
    expect(DRAPEAU.length).toBe(5); // impair : aucune symétrie centrale possible
    const g = glissementEntre({ x: 0, y: 0 }, { x: GLISSEMENT_DEFAUT.dx, y: GLISSEMENT_DEFAUT.dy });
    const image = glisserFigure(DRAPEAU, g);
    for (const p of image) {
      expect(p.x).toBeLessThanOrEqual(CADRE.largeur);
      expect(p.y).toBeLessThanOrEqual(CADRE.hauteur);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉCRITURES
   ══════════════════════════════════════════════════════════════════════ */
describe('Les écritures', () => {
  it('fr utilise la virgule décimale', () => {
    expect(fr(7.5)).toBe('7,5');
    expect(fr(13)).toBe('13');
    expect(fr(NaN)).toBe('—');
  });

  it('arrondi coupe au centième par défaut', () => {
    expect(arrondi(3.14159)).toBe(3.14);
    expect(arrondi(3.14159, 4)).toBe(3.1416);
  });
});
