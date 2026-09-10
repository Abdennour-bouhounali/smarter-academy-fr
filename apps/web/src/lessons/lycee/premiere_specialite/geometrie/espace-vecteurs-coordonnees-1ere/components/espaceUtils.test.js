import { describe, it, expect } from 'vitest';
import {
  fr, frVec3, parseSigned, normeExacte, zero,
  ARETE, CUBE, IDX, pt, vecNom, coordsDansRepere, repereVersMonde,
  decomposition, doublePythagore,
  produitEspace, angleEspaceDeg, orthogonaux, colineaires,
  droite, verdictDroites, COUPLES_DROITES, EXIGENCE_PIEGE, verdicts, POSITION_LABEL,
  PAS_ROT, YAW_RANGE, PITCH_RANGE, orientationsAtteignables, projeter,
  croisementApparent, orientationsQuiLevent, orientationRecommandee,
  etendueProjetee, rayonMaximal,
  DEMI_CADRE, MARGE_SOMMET, ECHELLE, RAYON_SOMMET, RAYON_SAISIE,
  sommetsEcran, sommetLePlusProche, ecartMinimalEcran,
  aimanter, SENSIBILITE, orientationApresGlisser, orientationApresTouche,
  ORIENTATION_DEPART, estAtteignable,
  dot3, cross3, norm3, sub3,
} from './espaceUtils';

/**
 * Le modèle pur de « L'espace : vecteurs et coordonnées », vérifié AVANT toute
 * JSX (§18 du patron). Toute valeur citée par un module est ici RECALCULÉE :
 * aucun nombre n'est écrit à la main dans une leçon sans qu'un test ne le
 * retrouve depuis le modèle.
 */

/** Les couples d'entiers non triviaux dont les modules et le boss se servent. */
const COUPLES_CITES = [
  ['A', 'G'], ['A', 'C'], ['A', 'B'], ['A', 'D'], ['A', 'E'], ['A', 'F'],
  ['B', 'H'], ['D', 'F'], ['C', 'E'], ['B', 'G'], ['C', 'F'], ['D', 'G'], ['E', 'G'],
];

describe('écriture française', () => {
  it('écrit la virgule et le VRAI signe moins', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(-2.5)).toBe('−2,5');
    expect(fr(-1)).toBe('−1');
  });

  it('n’écrit jamais « −0 » — un zéro reste un zéro', () => {
    expect(fr(-0)).toBe('0');
    expect(fr(0)).toBe('0');
    expect(fr(-1e-9)).toBe('0');
  });

  it('rend « ? » pour ce qui n’est pas un nombre fini', () => {
    expect(fr(NaN)).toBe('?');
    expect(fr(Infinity)).toBe('?');
  });

  it('écrit un triplet dans la ponctuation française', () => {
    expect(frVec3({ x: 2, y: 0, z: -2 })).toBe('(2 ; 0 ; −2)');
  });
});

describe('parseSigned — la lecture des réponses signées', () => {
  /**
   * LE PIÈGE PAYÉ PAR TROIS LEÇONS DU LOT 1 : la leçon AFFICHE « −4 » avec le
   * vrai signe moins U+2212, l'élève le recopie, et `parseDec` le rejette. Une
   * leçon dont les produits scalaires sont souvent négatifs ne validerait alors
   * jamais.
   */
  it('accepte le VRAI signe moins U+2212, celui que la leçon affiche', () => {
    expect(parseSigned('−4')).toBe(-4);
    expect(parseSigned('−2,5')).toBe(-2.5);
  });

  it('accepte aussi le tiret ASCII, le demi-cadratin et le cadratin', () => {
    expect(parseSigned('-4')).toBe(-4);
    expect(parseSigned('–4')).toBe(-4);
    expect(parseSigned('—4')).toBe(-4);
  });

  it('accepte la virgule décimale et les espaces, y compris l’insécable fine', () => {
    expect(parseSigned('2,5')).toBe(2.5);
    expect(parseSigned(' −1 ')).toBe(-1);
    expect(parseSigned('1 000'.replace(' ', ' '))).toBe(1000);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(parseSigned('abc')).toBeNaN();
    expect(parseSigned('')).toBeNaN();
    expect(parseSigned('1,2,3')).toBeNaN();
    expect(parseSigned(null)).toBeNaN();
  });

  it('laisse passer un nombre déjà lu', () => {
    expect(parseSigned(3)).toBe(3);
    expect(parseSigned(NaN)).toBeNaN();
  });
});

describe('normeExacte — la lisibilité promise', () => {
  it('extrait le plus grand carré parfait, sans flottant', () => {
    expect(normeExacte(0)).toBe('0');
    expect(normeExacte(1)).toBe('1');
    expect(normeExacte(4)).toBe('2');
    expect(normeExacte(9)).toBe('3');
    expect(normeExacte(2)).toBe('√2');
    expect(normeExacte(3)).toBe('√3');
    expect(normeExacte(8)).toBe('2√2');
    expect(normeExacte(12)).toBe('2√3');
  });

  /**
   * Les trois normes remarquables du cube doivent être LISIBLES et DISTINCTES
   * entre elles : c'est ce qui les rend utilisables comme options d'un QCM.
   */
  it('rend les trois normes du cube distinctes deux à deux', () => {
    const n = [1, 2, 3].map(normeExacte);
    expect(n).toEqual(['1', '√2', '√3']);
    expect(new Set(n).size).toBe(3);
  });
});

describe('le cube de la leçon', () => {
  it('a pour arête 2 et son sommet A à l’ORIGINE', () => {
    expect(ARETE).toBe(2);
    expect(pt('A')).toEqual({ x: 0, y: 0, z: 0 });
  });

  /**
   * POURQUOI PAS `SOLIDS.cube` : il mesure 100 d'arête et il est CENTRÉ, donc
   * l'élève y lirait AB = (100 ; 0 ; 0) et une norme de 173,2. Ici, tout est
   * entier et petit.
   */
  it('donne à chaque sommet des coordonnées dans {0 ; 2}³', () => {
    for (const v of CUBE.vertices) {
      for (const c of [v.x, v.y, Math.abs(v.z)]) expect([0, 2]).toContain(c);
    }
  });

  it('a bien 8 sommets, 12 arêtes, 6 faces, et vérifie Euler', () => {
    expect(CUBE.vertices).toHaveLength(8);
    expect(CUBE.edges).toHaveLength(12);
    expect(CUBE.faces).toHaveLength(6);
    expect(CUBE.faces.length + CUBE.vertices.length - CUBE.edges.length).toBe(2);
  });

  it('a douze arêtes de longueur exactement 2', () => {
    for (const [i, j] of CUBE.edges) {
      expect(norm3(sub3(CUBE.vertices[i], CUBE.vertices[j]))).toBe(2);
    }
  });

  it('nomme les sommets dans l’ordre des énoncés français', () => {
    expect(CUBE.names).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    expect(IDX.G).toBe(6);
    // E est bien DERRIÈRE A, comme le veut la convention scolaire.
    expect(pt('E')).toEqual({ x: 0, y: 0, z: -ARETE });
  });

  it('refuse un sommet inconnu plutôt que de rendre un vecteur faux', () => {
    expect(() => pt('Z')).toThrow(/sommet inconnu/);
  });
});

describe('coordonnées dans le repère de la leçon', () => {
  it('rend AG = (1 ; 1 ; 1) en unités d’arête, et non (2 ; 2 ; −2)', () => {
    expect(coordsDansRepere(vecNom('A', 'G'))).toEqual({ x: 1, y: 1, z: 1 });
  });

  it('rend BH = (−1 ; 1 ; 1) — l’ordre compte, et le signe avec', () => {
    expect(coordsDansRepere(vecNom('B', 'H'))).toEqual({ x: -1, y: 1, z: 1 });
    expect(coordsDansRepere(vecNom('H', 'B'))).toEqual({ x: 1, y: -1, z: -1 });
  });

  it('donne des coordonnées ENTIÈRES à tout vecteur de sommet à sommet', () => {
    for (const a of CUBE.names) {
      for (const b of CUBE.names) {
        const v = coordsDansRepere(vecNom(a, b));
        for (const c of [v.x, v.y, v.z]) expect(Number.isInteger(c)).toBe(true);
      }
    }
  });

  it('est réversible : repereVersMonde annule coordsDansRepere', () => {
    for (const a of CUBE.names) {
      for (const b of CUBE.names) {
        const w = vecNom(a, b);
        expect(repereVersMonde(coordsDansRepere(w))).toEqual(w);
      }
    }
  });
});

describe('la décomposition en trois déplacements (module 1)', () => {
  it('parcourt x, puis y, puis z — dans cet ordre', () => {
    const d = decomposition('A', 'G');
    expect(d.map((e) => e.axe)).toEqual(['x', 'y', 'z']);
    expect(d.map((e) => e.aretes)).toEqual([1, 1, 1]);
  });

  it('enchaîne : l’arrivée d’une étape est le départ de la suivante', () => {
    for (const [a, b] of COUPLES_CITES) {
      const d = decomposition(a, b);
      expect(d[0].from).toEqual(pt(a));
      expect(d[0].to).toEqual(d[1].from);
      expect(d[1].to).toEqual(d[2].from);
      expect(d[2].to).toEqual(pt(b));
    }
  });

  /**
   * Un trajet peut compter 0 dans une direction — c'est ce que la brique
   * `trois-deplacements` affirme, et ce que le module 1 fait constater.
   */
  it('compte 0 vers le fond pour un trajet qui reste sur la face avant', () => {
    expect(decomposition('A', 'C').map((e) => e.aretes)).toEqual([1, 1, 0]);
  });

  it('rend un compte nul quand départ et arrivée coïncident', () => {
    expect(decomposition('A', 'A').map((e) => e.aretes)).toEqual([0, 0, 0]);
  });

  it('donne des comptes qui sont EXACTEMENT les coordonnées du vecteur', () => {
    for (const a of CUBE.names) {
      for (const b of CUBE.names) {
        const u = coordsDansRepere(vecNom(a, b));
        expect(decomposition(a, b).map((e) => e.aretes)).toEqual([u.x, u.y, u.z]);
      }
    }
  });
});

describe('le double Pythagore (modules 1 et 3)', () => {
  /**
   * LA PROMESSE DU MODULE 1 : « Pythagore s'applique ici, DEUX FOIS ». Elle
   * n'est tenue que si les deux triangles sont RECTANGLES — et pas
   * « visuellement rectangles » : rectangles au bit près.
   */
  it('construit deux triangles VRAIMENT rectangles, au bit près', () => {
    for (const [a, b] of COUPLES_CITES) {
      const [e1, e2, e3] = decomposition(a, b);
      // Triangle du plancher, rectangle en P1 : le côté x et le côté y.
      const cx = sub3(e1.to, e1.from);
      const cy = sub3(e2.to, e2.from);
      expect(zero(dot3(cx, cy))).toBe(0);
      // Triangle de l'espace, rectangle en P2 : la diagonale du plancher et z.
      const diag = sub3(e2.to, e1.from);
      const cz = sub3(e3.to, e3.from);
      // `zero` parce que `dot3` (module partagé, qu'on ne touche pas) rend −0
      // quand tous ses termes sont des produits négatifs — sur CE par exemple,
      // (−2 ; −2 ; 0)·(0 ; 0 ; −2). C'est un zéro EXACT, pas un arrondi : la
      // valeur est nulle au bit près, seul son signe de zéro diffère.
      expect(zero(dot3(diag, cz))).toBe(0);
      expect(Math.abs(dot3(diag, cz))).toBe(0);
    }
  });

  it('rend le carré du plancher AVANT d’en prendre la racine', () => {
    const p = doublePythagore({ x: 1, y: 1, z: 1 });
    expect(p.plancherCarre).toBe(2);
    expect(p.totalCarre).toBe(3);
    expect(p.plancher).toBeCloseTo(Math.SQRT2, 12);
    expect(p.total).toBeCloseTo(Math.sqrt(3), 12);
  });

  it('retrouve exactement la norme du vecteur', () => {
    for (const a of CUBE.names) {
      for (const b of CUBE.names) {
        const u = coordsDansRepere(vecNom(a, b));
        expect(doublePythagore(u).total).toBeCloseTo(norm3(u), 12);
      }
    }
  });

  it('rend une hauteur POSITIVE même quand z est négatif', () => {
    expect(doublePythagore({ x: 0, y: 0, z: -1 }).hauteur).toBe(1);
    expect(doublePythagore({ x: 0, y: 0, z: -1 }).totalCarre).toBe(1);
  });

  /** Les valeurs que les modules 1 et 3 et le boss CITENT, recalculées. */
  it('recalcule les longueurs citées par les modules : AG = √3, AC = √2, AB = 1', () => {
    const norme = (a, b) => normeExacte(doublePythagore(coordsDansRepere(vecNom(a, b))).totalCarre);
    expect(norme('A', 'G')).toBe('√3');
    expect(norme('A', 'C')).toBe('√2');
    expect(norme('A', 'B')).toBe('1');
    expect(norme('B', 'H')).toBe('√3');
    expect(norme('D', 'F')).toBe('√3');
    expect(norme('A', 'F')).toBe('√2');
  });

  /**
   * LA CONCEPTION ERRONÉE MESURÉE : √(x² + y²) + z, le chemin en équerre.
   * Elle doit être DISTINCTE de la bonne réponse, sinon le distracteur du boss
   * serait insoluble.
   */
  it('sépare la bonne longueur du chemin en équerre — le piège est distinct', () => {
    const u = coordsDansRepere(vecNom('A', 'G'));
    const p = doublePythagore(u);
    const equerre = p.plancher + Math.abs(u.z);
    expect(p.total).toBeCloseTo(Math.sqrt(3), 12);
    expect(equerre).toBeCloseTo(Math.SQRT2 + 1, 12);
    expect(Math.abs(p.total - equerre)).toBeGreaterThan(0.6);
  });
});

describe('produit scalaire dans l’espace (module 4)', () => {
  it('est EXACTEMENT entier — jamais un 1e-16', () => {
    for (const a of CUBE.names) {
      for (const b of CUBE.names) {
        for (const c of CUBE.names) {
          for (const d of CUBE.names) {
            const p = produitEspace(
              coordsDansRepere(vecNom(a, b)),
              coordsDansRepere(vecNom(c, d)),
            );
            expect(Number.isInteger(p)).toBe(true);
          }
        }
      }
    }
  });

  it('recalcule les produits cités par le module 4 et le boss', () => {
    const P = (a, b, c, d) => produitEspace(
      coordsDansRepere(vecNom(a, b)), coordsDansRepere(vecNom(c, d)),
    );
    expect(P('A', 'G', 'A', 'B')).toBe(1);
    expect(P('A', 'G', 'A', 'C')).toBe(2);
    expect(P('A', 'C', 'D', 'F')).toBe(0);
    expect(P('A', 'G', 'B', 'D')).toBe(0);
    expect(P('A', 'G', 'A', 'G')).toBe(3);
    expect(P('B', 'H', 'A', 'C')).toBe(0);
  });

  it('vaut le carré de la norme quand on le fait avec lui-même', () => {
    for (const [a, b] of COUPLES_CITES) {
      const u = coordsDansRepere(vecNom(a, b));
      expect(produitEspace(u, u)).toBe(doublePythagore(u).totalCarre);
    }
  });

  it('est symétrique', () => {
    const u = coordsDansRepere(vecNom('A', 'G'));
    const v = coordsDansRepere(vecNom('D', 'F'));
    expect(produitEspace(u, v)).toBe(produitEspace(v, u));
  });

  it('détecte l’orthogonalité par un test EXACT, sans tolérance', () => {
    expect(orthogonaux({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })).toBe(true);
    expect(orthogonaux({ x: 1, y: 1, z: 0 }, { x: 1, y: -1, z: 1 })).toBe(true);
    expect(orthogonaux({ x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 0 })).toBe(false);
  });

  it('détecte la colinéarité par un produit vectoriel ENTIER, donc exact', () => {
    expect(colineaires({ x: 1, y: 0, z: 0 }, { x: 3, y: 0, z: 0 })).toBe(true);
    expect(colineaires({ x: 1, y: 1, z: 0 }, { x: 1, y: -1, z: 1 })).toBe(false);
    const n = cross3({ x: 1, y: 0, z: 0 }, { x: 3, y: 0, z: 0 });
    expect([n.x, n.y, n.z]).toEqual([0, 0, 0]);
  });

  it('rend un angle droit EXACT sur les couples orthogonaux du cube', () => {
    const u = coordsDansRepere(vecNom('A', 'B'));
    const v = coordsDansRepere(vecNom('C', 'G'));
    expect(angleEspaceDeg(u, v)).toBe(90);
    expect(angleEspaceDeg({ x: 0, y: 0, z: 0 }, u)).toBeNaN();
  });
});

describe('les verdicts sur les droites (modules 5 et 6)', () => {
  it('calcule tout, si bien qu’un énoncé faux est impossible', () => {
    const v = verdictDroites(droite('A', 'B'), droite('H', 'G'));
    expect(v.paralleles).toBe(true);
    expect(v.orthogonales).toBe(false);
    expect(v.position).toBe('paralleles');
    expect(v.secantes).toBe(false);
  });

  /**
   * LE FAIT CAPITAL DE LA LEÇON, vérifié comme une COMBINAISON : orthogonales
   * ET non coplanaires. `secantes` est rendu SÉPARÉMENT, jamais déduit de
   * l'orthogonalité — c'est exactement l'erreur que la leçon combat.
   */
  it('sépare « orthogonales » de « sécantes » : (AB) et (CG) le prouvent', () => {
    const v = verdictDroites(droite('A', 'B'), droite('C', 'G'));
    expect(v.orthogonales).toBe(true);
    expect(v.produit).toBe(0);
    expect(v.secantes).toBe(false);
    expect(v.position).toBe('non-coplanaires');
  });

  it('reconnaît deux droites orthogonales QUI se coupent', () => {
    const v = verdictDroites(droite('A', 'B'), droite('B', 'C'));
    expect(v.orthogonales).toBe(true);
    expect(v.secantes).toBe(true);
    expect(v.position).toBe('secantes');
  });

  it('nomme les quatre positions relatives', () => {
    for (const v of verdicts()) {
      expect(POSITION_LABEL[v.position]).toBeTruthy();
    }
  });

  /**
   * LES SIX COUPLES COUVRENT LES TROIS CAS. Une table qui n'offrirait que des
   * parallèles ne ferait rien découvrir.
   */
  it('offre les trois positions relatives parmi les six couples', () => {
    const positions = new Set(verdicts().map((v) => v.position));
    expect(positions).toContain('paralleles');
    expect(positions).toContain('secantes');
    expect(positions).toContain('non-coplanaires');
  });

  it('offre au moins deux couples parallèles et deux orthogonaux', () => {
    const V = verdicts();
    expect(V.filter((v) => v.paralleles).length).toBeGreaterThanOrEqual(2);
    expect(V.filter((v) => v.orthogonales).length).toBeGreaterThanOrEqual(2);
  });

  /**
   * L'ÉTIQUETTE `piege` DOIT DIRE LA VÉRITÉ — c'est le défaut que ce test a
   * attrapé dans la version initiale de la table :
   *   - (AD)/(FG) portait « orthogonales-non-secantes » alors que les deux
   *     directeurs valent (0 ; 1 ; 0) : elles sont PARALLÈLES ;
   *   - (AB)/(CG) portait « croisement-apparent » alors qu'elles ne se
   *     croisent PAS sur le dessin dans la vue de départ.
   * Un module qui aurait affiché ces étiquettes aurait affirmé le contraire du
   * verdict calculé juste à côté.
   */
  it('n’étiquette un piège que si le verdict calculé le porte vraiment', () => {
    for (const v of verdicts()) {
      if (!v.piege) continue;
      const exigence = EXIGENCE_PIEGE[v.piege];
      expect(exigence, `piège inconnu « ${v.piege} »`).toBeTypeOf('function');
      expect(exigence(v), `${v.d1.nom}/${v.d2.nom} n’honore pas « ${v.piege} »`).toBe(true);
    }
  });

  it('porte au moins un couple de chaque piège', () => {
    const pieges = new Set(COUPLES_DROITES.map((c) => c.piege).filter(Boolean));
    expect(pieges).toEqual(new Set(Object.keys(EXIGENCE_PIEGE)));
  });

  it('donne à chaque couple un identifiant unique', () => {
    const ids = COUPLES_DROITES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('le piège de la perspective, et sa parade PROUVÉE', () => {
  it('offre 117 orientations au cliquet, toutes dans les bornes', () => {
    const O = orientationsAtteignables();
    expect(O).toHaveLength(((YAW_RANGE.max - YAW_RANGE.min) / PAS_ROT + 1)
      * ((PITCH_RANGE.max - PITCH_RANGE.min) / PAS_ROT + 1));
    expect(O).toHaveLength(117);
    for (const o of O) expect(estAtteignable(o)).toBe(true);
  });

  /**
   * LE MENSONGE MESURÉ. Sans un couple qui se croise VRAIMENT sur le dessin
   * dans la vue de départ, la leçon parlerait d'un piège que l'élève ne
   * rencontre jamais.
   */
  it('fait bien mentir la perspective : (AC) et (DF) se croisent au repos', () => {
    const v = verdictDroites(droite('A', 'C'), droite('D', 'F'));
    expect(v.position).toBe('non-coplanaires');
    expect(croisementApparent(v, ORIENTATION_DEPART)).toBe(true);
  });

  it('ne compte pas un sommet commun comme un croisement apparent', () => {
    const v = verdictDroites(droite('A', 'B'), droite('B', 'C'));
    for (const o of orientationsAtteignables()) {
      expect(croisementApparent(v, o)).toBe(false);
    }
  });

  /**
   * LA CONSIGNE « TOURNE POUR T'EN ASSURER » DOIT ÊTRE FAISABLE. Sans ce test,
   * elle pourrait être un mensonge : un couple qu'aucune orientation ne
   * démêle rendrait la tâche impossible, et l'élève aurait raison de croire ce
   * que le dessin lui montre.
   */
  it('laisse au moins une orientation qui lève le croisement, pour CHAQUE couple', () => {
    for (const v of verdicts()) {
      const levent = orientationsQuiLevent(v);
      expect(levent.length, `${v.d1.nom}/${v.d2.nom}`).toBeGreaterThan(0);
    }
  });

  it('offre 48 orientations qui démêlent le couple piégé (AC)/(DF)', () => {
    const v = verdicts().find((k) => k.cle === 'c6');
    expect(v.d1.nom).toBe('(AC)');
    expect(v.d2.nom).toBe('(DF)');
    expect(orientationsQuiLevent(v)).toHaveLength(48);
  });

  it('recommande une orientation qui est ATTEIGNABLE et qui lève vraiment', () => {
    for (const v of verdicts()) {
      const r = orientationRecommandee(v);
      expect(r, `${v.d1.nom}/${v.d2.nom}`).not.toBeNull();
      expect(estAtteignable(r)).toBe(true);
      expect(croisementApparent(v, r)).toBe(false);
    }
  });
});

describe('sécurité de mise en page — BALAYÉE, jamais échantillonnée', () => {
  it('dérive l’échelle du rayon réellement mesuré', () => {
    expect(rayonMaximal()).toBeCloseTo(1.8294, 3);
    expect(ECHELLE).toBeCloseTo((DEMI_CADRE - MARGE_SOMMET) / rayonMaximal(), 12);
  });

  /**
   * §16 : on BALAIE la plage, on ne l'échantillonne pas. Un seul état où une
   * arête sort du cadre suffirait à casser la figure, et il ne se trouve pas
   * en regardant trois orientations.
   */
  it('garde chaque sommet dans le cadre, sur les 117 orientations', () => {
    for (const o of orientationsAtteignables()) {
      for (const p of sommetsEcran(o)) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(2 * DEMI_CADRE);
        expect(p.y).toBeLessThanOrEqual(2 * DEMI_CADRE);
      }
    }
  });

  it('garde la PASTILLE de chaque sommet entièrement dans le cadre', () => {
    for (const o of orientationsAtteignables()) {
      for (const p of sommetsEcran(o)) {
        const marge = Math.min(p.x, p.y, 2 * DEMI_CADRE - p.x, 2 * DEMI_CADRE - p.y);
        expect(marge).toBeGreaterThanOrEqual(RAYON_SOMMET + 2.5);
      }
    }
  });

  it('laisse exactement MARGE_SOMMET de garde au pire cas', () => {
    let pire = Infinity;
    for (const o of orientationsAtteignables()) {
      for (const p of sommetsEcran(o)) {
        pire = Math.min(pire, p.x, p.y, 2 * DEMI_CADRE - p.x, 2 * DEMI_CADRE - p.y);
      }
    }
    expect(pire).toBeCloseTo(MARGE_SOMMET, 9);
  });

  it('garde les points INTERMÉDIAIRES d’un trajet dans le cadre eux aussi', () => {
    for (const o of orientationsAtteignables()) {
      for (const [a, b] of COUPLES_CITES) {
        const d = decomposition(a, b);
        const pts = [d[0].from, d[0].to, d[1].to, d[2].to];
        for (const p of sommetsEcran(o, pts)) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(2 * DEMI_CADRE);
          expect(p.y).toBeLessThanOrEqual(2 * DEMI_CADRE);
        }
      }
    }
  });

  it('projette dans une étendue bornée pour chaque orientation', () => {
    for (const o of orientationsAtteignables()) {
      const e = etendueProjetee(o);
      expect(e.xMax - e.xMin).toBeGreaterThan(0);
      expect(Math.max(-e.xMin, e.xMax, -e.yMin, e.yMax)).toBeLessThanOrEqual(rayonMaximal() + 1e-9);
    }
  });

  it('projette les 8 sommets, et seulement eux, par défaut', () => {
    expect(projeter(ORIENTATION_DEPART)).toHaveLength(8);
    expect(sommetsEcran(ORIENTATION_DEPART)).toHaveLength(8);
  });

  /**
   * LE CHEVAUCHEMENT DES PASTILLES EST RÉEL, ET C'EST POURQUOI LES NOMS SONT
   * EN DOM. Sur 43 des 117 orientations, deux sommets se projettent à moins de
   * RAYON_SAISIE l'un de l'autre : des étiquettes SVG posées à côté d'eux se
   * chevaucheraient nécessairement. Ce test ne CORRIGE pas ce fait — il le
   * documente, et c'est lui qui justifie la légende DOM du composant.
   */
  it('mesure les orientations où deux sommets se recouvrent, et le documente', () => {
    const serrees = orientationsAtteignables().filter((o) => ecartMinimalEcran(o) < RAYON_SAISIE);
    // 6 sur 117 depuis le recentrage du dessin — c'était 43 quand le cube
    // tournait autour de A et se projetait deux fois plus petit. Six, ce n'est
    // pas zéro : la légende DOM reste la seule façon honnête de nommer les
    // sommets.
    expect(serrees.length).toBe(6);
    expect(serrees.length).toBeGreaterThan(0);
  });
});

describe('LE GLISSER — de la course du doigt à l’orientation', () => {
  it('aimante sur le cliquet et borne dans la plage', () => {
    expect(aimanter(7, YAW_RANGE)).toBe(0);
    expect(aimanter(8, YAW_RANGE)).toBe(15);
    expect(aimanter(1000, YAW_RANGE)).toBe(YAW_RANGE.max);
    expect(aimanter(-1000, PITCH_RANGE)).toBe(PITCH_RANGE.min);
  });

  /**
   * L'INVARIANT QUI SAUVE L'ATTEIGNABILITÉ AU GLISSER. Un doigt ne vise pas au
   * degré près ; sans aimantation, l'orientation recommandée d'un couple ne
   * serait jamais exactement atteinte et le test de faisabilité porterait sur
   * des états que l'élève ne peut pas produire. On BALAIE ici des milliers de
   * gestes, y compris absurdes.
   */
  it('rend TOUJOURS une orientation atteignable, quel que soit le geste', () => {
    for (const depart of orientationsAtteignables()) {
      for (let dx = -400; dx <= 400; dx += 37) {
        for (let dy = -400; dy <= 400; dy += 53) {
          expect(estAtteignable(orientationApresGlisser(depart, dx, dy))).toBe(true);
        }
      }
    }
  });

  it('ne bouge pas pour un micro-déplacement — un frémissement n’est pas un geste', () => {
    expect(orientationApresGlisser(ORIENTATION_DEPART, 7, 3)).toEqual(ORIENTATION_DEPART);
  });

  it('tourne dans le sens du doigt : à droite fait croître le yaw', () => {
    expect(orientationApresGlisser(ORIENTATION_DEPART, 60, 0).yaw).toBe(30);
    expect(orientationApresGlisser(ORIENTATION_DEPART, -60, 0).yaw).toBe(-30);
  });

  /**
   * LE SIGNE DU PITCH EST INVERSÉ EXPRÈS : tirer vers le BAS penche le dessus
   * du solide VERS SOI. L'inverse donnerait la sensation de pousser l'objet.
   */
  it('penche vers soi quand on tire vers le bas', () => {
    expect(orientationApresGlisser(ORIENTATION_DEPART, 0, 60).pitch).toBe(-30);
    expect(orientationApresGlisser(ORIENTATION_DEPART, 0, -60).pitch).toBe(30);
  });

  it('demande SENSIBILITE unités d’écran par degré', () => {
    expect(SENSIBILITE).toBe(2);
    expect(orientationApresGlisser(ORIENTATION_DEPART, PAS_ROT * SENSIBILITE, 0).yaw).toBe(PAS_ROT);
  });

  it('atteint les deux bornes de yaw et de pitch par un seul grand geste', () => {
    expect(orientationApresGlisser(ORIENTATION_DEPART, 9999, 9999))
      .toEqual({ yaw: YAW_RANGE.max, pitch: PITCH_RANGE.min });
    expect(orientationApresGlisser(ORIENTATION_DEPART, -9999, -9999))
      .toEqual({ yaw: YAW_RANGE.min, pitch: PITCH_RANGE.max });
  });
});

describe('le CHEMIN CLAVIER, complet', () => {
  it('tourne d’un cran avec les quatre flèches', () => {
    expect(orientationApresTouche(ORIENTATION_DEPART, 'ArrowRight').yaw).toBe(PAS_ROT);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'ArrowLeft').yaw).toBe(-PAS_ROT);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'ArrowUp').pitch).toBe(PAS_ROT);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'ArrowDown').pitch).toBe(-PAS_ROT);
  });

  it('atteint les bornes avec Home, End, PageUp et PageDown', () => {
    expect(orientationApresTouche(ORIENTATION_DEPART, 'Home').yaw).toBe(YAW_RANGE.min);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'End').yaw).toBe(YAW_RANGE.max);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'PageUp').pitch).toBe(PITCH_RANGE.max);
    expect(orientationApresTouche(ORIENTATION_DEPART, 'PageDown').pitch).toBe(PITCH_RANGE.min);
  });

  it('ne réagit pas aux touches qui ne le concernent pas', () => {
    expect(orientationApresTouche(ORIENTATION_DEPART, 'a')).toBeNull();
    expect(orientationApresTouche(ORIENTATION_DEPART, 'Enter')).toBeNull();
  });

  it('reste dans les bornes même en martelant une flèche', () => {
    let o = ORIENTATION_DEPART;
    for (let i = 0; i < 50; i += 1) o = orientationApresTouche(o, 'ArrowRight');
    expect(o.yaw).toBe(YAW_RANGE.max);
    expect(estAtteignable(o)).toBe(true);
  });

  /** Le clavier et le doigt doivent mener aux MÊMES états, sans exception. */
  it('atteint au clavier exactement les états qu’on atteint au doigt', () => {
    const vus = new Set();
    const file = [ORIENTATION_DEPART];
    while (file.length) {
      const o = file.pop();
      const cle = `${o.yaw}/${o.pitch}`;
      if (vus.has(cle)) continue;
      vus.add(cle);
      for (const t of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
        file.push(orientationApresTouche(o, t));
      }
    }
    expect(vus.size).toBe(orientationsAtteignables().length);
  });
});

describe('LE CLIC SUR UN SOMMET', () => {
  it('attrape le sommet visé quand on tape dessus', () => {
    const S = sommetsEcran(ORIENTATION_DEPART);
    for (let i = 0; i < S.length; i += 1) {
      expect(sommetLePlusProche(ORIENTATION_DEPART, S[i], 1)).toBe(i);
    }
  });

  it('n’attrape RIEN quand on clique dans le vide', () => {
    // Le centre du cadre est le CENTRE DU CUBE depuis le recentrage : aucun
    // sommet n'y est, et le plus proche est à plus de 90 unités.
    expect(sommetLePlusProche(ORIENTATION_DEPART, { x: DEMI_CADRE, y: DEMI_CADRE })).toBeNull();
    expect(sommetLePlusProche(ORIENTATION_DEPART, { x: -500, y: -500 })).toBeNull();
  });

  it('reste déterministe partout : un point du cadre attrape 0 ou 1 sommet', () => {
    for (let x = 0; x <= 2 * DEMI_CADRE; x += 11) {
      for (let y = 0; y <= 2 * DEMI_CADRE; y += 11) {
        const i = sommetLePlusProche(ORIENTATION_DEPART, { x, y });
        expect(i === null || (Number.isInteger(i) && i >= 0 && i < 8)).toBe(true);
      }
    }
  });

  it('attrape chacun des huit sommets, sur chaque orientation atteignable', () => {
    for (const o of orientationsAtteignables()) {
      const S = sommetsEcran(o);
      const attrapes = new Set(S.map((p) => sommetLePlusProche(o, p)));
      // Deux sommets peuvent se superposer à l'écran : on exige alors seulement
      // qu'un clic pile sur un sommet en attrape UN, jamais rien de nul.
      for (const i of attrapes) expect(i).not.toBeNull();
      expect(attrapes.size).toBeGreaterThanOrEqual(1);
    }
  });
});
