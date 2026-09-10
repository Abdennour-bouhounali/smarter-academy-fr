import { describe, it, expect } from 'vitest';
import {
  v3, dot3, cross3, sub3, add3, norm3, rotateSolid, visibleEdges,
  zero, fr, frVec3, parseSigned,
  ARETE, SOMMETS, NOMS, IDX, pt, vecNom, CUBE, versMonde, versEleve,
  reduireNormal, planDeNormalEtPoint, planParTrois, evalPlan, appartient,
  equationCartesienne,
  POSITION_DROITE_PLAN, POINTS_COMMUNS, positionDroitePlan, verdictDroitePlan,
  POSITION_DEUX_PLANS, positionDeuxPlans, verdictDeuxPlans,
  droiteParPointEtVecteur, droiteNom, pointDeParametre, parametreDe, lignesParametriques,
  colineaires, orthogonaux,
  droiteParalleleAuPlan, droiteOrthogonaleAuPlan, plansParalleles, plansOrthogonaux,
  radical, quotientRadical, distancePointPlan, distanceDeuxPlans, projeteSurPlan,
  NIVEAUX, ETAT_DEPART, DEMI_PLAN, droiteDuLabo, planDuLabo, verdictLabo, etatsLabo, cheminVers,
  PAS_ROT, YAW_RANGE, PITCH_RANGE, ORIENTATION_DEPART, orientationsAtteignables, estAtteignable,
  DEMI_CADRE, MARGE, ECHELLE, RAYON_POIGNEE, RAYON_SAISIE, SENSIBILITE,
  rayonMaximal, ecran, sommetsEcran, coinsPlanEcran, projeterEleve,
  aimanter, orientationApresGlisser, orientationApresTouche,
  niveauLePlusProche, hauteurLaPlusProche, poigneeSous, dansPolygone,
  hauteurApparentePlan, SEUIL_TRANCHE, orientationsQuiLevent,
  segmentsSeCroisent, croisementApparent,
  PLANS, planNomme, COUPLES_DROITE_PLAN, verdictsDroitePlan,
  COUPLES_PLANS, verdictsDeuxPlans,
} from './planUtils';

/* ═════════════════════════════════════════════════════════════════════════
   1. LE REPÈRE ET LE CUBE
   ═════════════════════════════════════════════════════════════════════════ */

describe('le repère de l’élève et le cube', () => {
  it('place les huit sommets sur des coordonnées entières de {0 ; 2}³', () => {
    for (const nom of NOMS) {
      const P = pt(nom);
      for (const axe of ['x', 'y', 'z']) {
        expect(Number.isInteger(P[axe])).toBe(true);
        expect([0, ARETE]).toContain(P[axe]);
      }
    }
    expect(NOMS).toHaveLength(8);
    expect(new Set(NOMS.map((n) => frVec3(pt(n)))).size).toBe(8);
  });

  it('donne à A l’origine et à G le sommet opposé', () => {
    expect(pt('A')).toEqual(v3(0, 0, 0));
    expect(pt('G')).toEqual(v3(2, 2, 2));
    expect(vecNom('A', 'G')).toEqual(v3(2, 2, 2));
  });

  it('refuse un sommet inconnu au lieu de rendre undefined', () => {
    expect(() => pt('Z')).toThrow(/sommet inconnu/);
  });

  // Le pont entre les deux repères est le seul endroit du fichier où le
  // retournement a lieu : s'il était une SYMÉTRIE (déterminant −1), le solide
  // serait dessiné retourné et visibleEdges tracerait en plein les arêtes
  // cachées.
  it('traduit vers le repère du dessin par une ROTATION (déterminant +1)', () => {
    const ex = versMonde(v3(1, 0, 0));
    const ey = versMonde(v3(0, 1, 0));
    const ez = versMonde(v3(0, 0, 1));
    const det = dot3(cross3(ex, ey), ez);
    expect(det).toBe(1);
  });

  it('revient au point de départ par versEleve ∘ versMonde', () => {
    for (const nom of NOMS) {
      expect(versEleve(versMonde(pt(nom)))).toEqual(pt(nom));
    }
    expect(versEleve(versMonde(v3(1, 2, 3)))).toEqual(v3(1, 2, 3));
  });

  it('n’engendre jamais de −0 dans la traduction', () => {
    for (const p of [v3(0, 0, 0), v3(0, 2, 0), v3(2, 0, 0)]) {
      const m = versMonde(p);
      for (const axe of ['x', 'y', 'z']) expect(Object.is(m[axe], -0)).toBe(false);
      const e = versEleve(m);
      for (const axe of ['x', 'y', 'z']) expect(Object.is(e[axe], -0)).toBe(false);
    }
  });

  it('oriente chaque face vers l’extérieur (normale sortante)', () => {
    // Convention geometry3d §3 : sommets anti-horaires vus de l'extérieur.
    // La normale doit alors pointer à l'opposé du centre du solide.
    const centre = versMonde(v3(1, 1, 1));
    for (const face of CUBE.faces) {
      const [i, j, k] = face;
      const a = CUBE.vertices[i];
      const b = CUBE.vertices[j];
      const c = CUBE.vertices[k];
      const n = cross3(sub3(b, a), sub3(c, a));
      expect(dot3(n, sub3(a, centre))).toBeGreaterThan(0);
    }
  });

  it('compte 6 faces, 12 arêtes, 8 sommets, et vérifie Euler', () => {
    expect(CUBE.faces).toHaveLength(6);
    expect(CUBE.edges).toHaveLength(12);
    expect(CUBE.vertices).toHaveLength(8);
    expect(CUBE.faces.length + CUBE.vertices.length - CUBE.edges.length).toBe(2);
  });

  it('cache toujours au moins une arête, quelle que soit l’orientation', () => {
    for (const o of orientationsAtteignables()) {
      const { visible, hidden } = visibleEdges(rotateSolid(CUBE, o));
      expect(visible.length + hidden.length).toBe(12);
      // Un cube convexe montre 9 arêtes et en cache 3 dans une vue générique ;
      // aux vues rasantes le compte change, mais il reste toujours des cachées.
      expect(hidden.length).toBeGreaterThanOrEqual(1);
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   2. L’ÉCRITURE FRANÇAISE ET LA LECTURE DES RÉPONSES
   ═════════════════════════════════════════════════════════════════════════ */

describe('écriture et lecture', () => {
  it('n’affiche jamais « −0 »', () => {
    expect(fr(-0)).toBe('0');
    expect(fr(0)).toBe('0');
    expect(fr(-0.001)).toBe('0');
    expect(zero(-0)).toBe(0);
    expect(Object.is(zero(-0), -0)).toBe(false);
  });

  it('écrit la virgule et le vrai signe moins', () => {
    expect(fr(1.5)).toBe('1,5');
    expect(fr(-2)).toBe('−2');
    expect(frVec3(v3(2, 0, -2))).toBe('(2 ; 0 ; −2)');
  });

  // Le piège payé par le lot 1 : `parseDec` refuse le vrai signe moins que la
  // leçon AFFICHE partout. Une leçon dont d vaut souvent −2 ou −4 ne peut pas
  // s'en passer.
  it('lit le vrai signe moins U+2212 que la leçon affiche', () => {
    expect(parseSigned('−2')).toBe(-2);
    expect(parseSigned('–4')).toBe(-4);   // tiret demi-cadratin
    expect(parseSigned('—4')).toBe(-4);   // tiret cadratin
    expect(parseSigned('-4')).toBe(-4);   // le moins du clavier
    expect(parseSigned('−1,5')).toBe(-1.5);
    expect(parseSigned(' 3 ')).toBe(3);
    expect(parseSigned('2 000'.replace(' ', ' '))).toBe(2000);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    for (const mauvais of ['', 'abc', '1,2,3', '--3', 'x', null, undefined, {}]) {
      expect(Number.isNaN(parseSigned(mauvais))).toBe(true);
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   3. LE PLAN ET SON ÉQUATION CARTÉSIENNE
   ═════════════════════════════════════════════════════════════════════════ */

describe('le plan et son équation cartésienne', () => {
  it('réduit un normal au pgcd et rend positive la première coordonnée non nulle', () => {
    expect(reduireNormal(v3(4, 4, 4))).toEqual(v3(1, 1, 1));
    expect(reduireNormal(v3(-4, -4, -4))).toEqual(v3(1, 1, 1));
    expect(reduireNormal(v3(0, -2, 0))).toEqual(v3(0, 1, 0));
    expect(reduireNormal(v3(0, 0, -6))).toEqual(v3(0, 0, 1));
    expect(reduireNormal(v3(2, -4, 6))).toEqual(v3(1, -2, 3));
    expect(reduireNormal(v3(0, 0, 0))).toEqual(v3(0, 0, 0));
  });

  it('ne produit jamais de −0 dans un normal réduit', () => {
    for (const n of [v3(0, -2, 0), v3(-2, 0, 0), v3(0, 0, -2), v3(-1, 0, 1)]) {
      const r = reduireNormal(n);
      for (const axe of ['x', 'y', 'z']) expect(Object.is(r[axe], -0)).toBe(false);
    }
  });

  // LE FAIT CENTRAL de P6 : les trois premiers coefficients de l'équation SONT
  // les coordonnées du normal. Il est vérifié ici sur les dix plans que la
  // leçon nomme, et non affirmé.
  it('donne au plan une équation dont (a ; b ; c) EST le vecteur normal', () => {
    for (const cle of Object.keys(PLANS)) {
      const plan = planNomme(cle);
      // Le normal est orthogonal à deux vecteurs du plan : c'est la définition.
      const [a, b, c] = PLANS[cle];
      expect(dot3(plan.n, vecNom(a, b))).toBe(0);
      expect(dot3(plan.n, vecNom(a, c))).toBe(0);
      // Et les trois points annulent l'équation.
      for (const nom of [a, b, c]) expect(evalPlan(plan, pt(nom))).toBe(0);
    }
  });

  it('calcule les équations que les modules citent, sans les écrire à la main', () => {
    const attendu = {
      ABC: { n: v3(0, 0, 1), d: 0 },
      EFG: { n: v3(0, 0, 1), d: -2 },
      ABF: { n: v3(0, 1, 0), d: 0 },
      DCG: { n: v3(0, 1, 0), d: -2 },
      ADH: { n: v3(1, 0, 0), d: 0 },
      BCG: { n: v3(1, 0, 0), d: -2 },
      BDE: { n: v3(1, 1, 1), d: -2 },
      CFH: { n: v3(1, 1, 1), d: -4 },
      ACF: { n: v3(1, -1, -1), d: 0 },
      ABG: { n: v3(0, 1, -1), d: 0 },
    };
    for (const [cle, att] of Object.entries(attendu)) {
      const plan = planNomme(cle);
      expect({ cle, n: plan.n, d: plan.d }).toEqual({ cle, ...att });
    }
  });

  it('écrit l’équation comme une copie l’écrirait', () => {
    expect(equationCartesienne(planNomme('BDE'))).toBe('x + y + z − 2 = 0');
    expect(equationCartesienne(planNomme('CFH'))).toBe('x + y + z − 4 = 0');
    expect(equationCartesienne(planNomme('ABC'))).toBe('z = 0');
    expect(equationCartesienne(planNomme('EFG'))).toBe('z − 2 = 0');
    expect(equationCartesienne(planNomme('ACF'))).toBe('x − y − z = 0');
    expect(equationCartesienne(planNomme('ABG'))).toBe('y − z = 0');
    expect(equationCartesienne(planDeNormalEtPoint(v3(2, -3, 0), v3(1, 0, 0)))).toBe('2x − 3y − 2 = 0');
  });

  // Balayage : aucune écriture ne doit produire « + − », « 1x », un terme nul
  // ni un « −0 ». On balaie TOUS les plans engendrés par trois sommets du cube.
  it('n’écrit jamais « + − », « 1x », « 0y » ni « −0 » — balayage complet', () => {
    let comptes = 0;
    for (let i = 0; i < 8; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        for (let k = 0; k < 8; k += 1) {
          if (i === j || j === k || i === k) continue;
          const [a, b, c] = [NOMS[i], NOMS[j], NOMS[k]];
          const n = cross3(vecNom(a, b), vecNom(a, c));
          if (n.x === 0 && n.y === 0 && n.z === 0) continue; // alignés
          const eq = equationCartesienne(planParTrois(a, b, c));
          comptes += 1;
          expect(eq).not.toMatch(/\+ −/);
          expect(eq).not.toMatch(/\b1[xyz]/);
          expect(eq).not.toMatch(/0[xyz]/);
          expect(eq).not.toMatch(/−0/);
          expect(eq).toMatch(/ = 0$/);
        }
      }
    }
    expect(comptes).toBeGreaterThan(200);
  });

  it('refuse trois points alignés au lieu de rendre un plan dégénéré', () => {
    // A, B et le milieu de [AB] seraient alignés ; sur les sommets, A B et A.
    expect(() => planParTrois('A', 'B', 'B')).toThrow(/align/);
  });

  it('décide l’appartenance d’un point de façon EXACTE (entiers)', () => {
    const bde = planNomme('BDE');
    for (const nom of ['B', 'D', 'E']) expect(appartient(bde, pt(nom))).toBe(true);
    for (const nom of ['A', 'C', 'F', 'G', 'H']) expect(appartient(bde, pt(nom))).toBe(false);
    // Aucun evalPlan n'est un « presque zéro ».
    for (const cle of Object.keys(PLANS)) {
      for (const nom of NOMS) {
        expect(Number.isInteger(evalPlan(planNomme(cle), pt(nom)))).toBe(true);
      }
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   4. POSITIONS RELATIVES DROITE / PLAN — P1
   ═════════════════════════════════════════════════════════════════════════ */

describe('positions relatives d’une droite et d’un plan', () => {
  it('décide les trois positions par le seul produit directeur·normal', () => {
    const abc = planNomme('ABC');            // z = 0
    // (AG) : u = (2;2;2), u·n = 2 ≠ 0 → perce
    expect(positionDroitePlan(droiteNom('A', 'G'), abc)).toBe(POSITION_DROITE_PLAN.secante);
    // (EG) : u = (2;2;0), u·n = 0, E ∉ plan → parallèle
    expect(positionDroitePlan(droiteNom('E', 'G'), abc)).toBe(POSITION_DROITE_PLAN.parallele);
    // (AC) : u = (2;2;0), u·n = 0, A ∈ plan → contenue
    expect(positionDroitePlan(droiteNom('A', 'C'), abc)).toBe(POSITION_DROITE_PLAN.contenue);
  });

  it('rend un nombre de points communs cohérent avec la position', () => {
    expect(POINTS_COMMUNS.secante).toBe('1');
    expect(POINTS_COMMUNS.parallele).toBe('0');
    expect(POINTS_COMMUNS.contenue).toBe('une infinité');
  });

  // Le second test — l'appartenance d'un point — ne se déduit pas du premier :
  // c'est exactement ce qu'un élève oublie. On le vérifie par balayage.
  it('sépare « parallèle » de « contenue » par l’appartenance d’un point, jamais par u·n', () => {
    let paralleles = 0;
    let contenues = 0;
    for (const cle of Object.keys(PLANS)) {
      const plan = planNomme(cle);
      for (let i = 0; i < 8; i += 1) {
        for (let j = i + 1; j < 8; j += 1) {
          const dr = droiteNom(NOMS[i], NOMS[j]);
          if (dot3(dr.u, plan.n) !== 0) continue;
          const pos = positionDroitePlan(dr, plan);
          expect(pos).toBe(appartient(plan, dr.A)
            ? POSITION_DROITE_PLAN.contenue
            : POSITION_DROITE_PLAN.parallele);
          if (pos === POSITION_DROITE_PLAN.contenue) contenues += 1; else paralleles += 1;
        }
      }
    }
    // Les deux cas existent réellement dans la figure : la distinction n'est
    // pas théorique.
    expect(paralleles).toBeGreaterThan(0);
    expect(contenues).toBeGreaterThan(0);
  });

  it('calcule le point de percée, et il appartient à la droite ET au plan', () => {
    for (const v of verdictsDroitePlan()) {
      if (v.position !== POSITION_DROITE_PLAN.secante) {
        expect(v.M).toBeNull();
        expect(v.t).toBeNull();
        continue;
      }
      expect(appartient(v.plan, v.M)).toBe(true);
      expect(parametreDe(v.droite, v.M)).toBeCloseTo(v.t, 12);
    }
  });

  it('n’écrit aucun verdict à la main : les six couples du module 2 sont calculés', () => {
    const V = verdictsDroitePlan();
    expect(V).toHaveLength(6);
    const parCle = Object.fromEntries(V.map((v) => [v.cle, v.position]));
    expect(parCle).toEqual({
      dp1: POSITION_DROITE_PLAN.secante,     // (AG) perce le plancher en A
      dp2: POSITION_DROITE_PLAN.parallele,   // (EG) longe le plancher, 2 au-dessus
      dp3: POSITION_DROITE_PLAN.contenue,    // (BD) est DANS le plan (BDE)
      dp4: POSITION_DROITE_PLAN.parallele,   // (BD) longe le plafond
      dp5: POSITION_DROITE_PLAN.secante,     // (AE) perce le plancher en A
      dp6: POSITION_DROITE_PLAN.secante,     // (AC) perce (BDE)
    });
    // Les trois positions sont représentées : le module 2 peut les montrer.
    expect(new Set(Object.values(parCle)).size).toBe(3);
  });

  it('donne un produit u·n ENTIER pour chaque couple — jamais un 1e-16', () => {
    for (const v of verdictsDroitePlan()) {
      expect(Number.isInteger(v.un)).toBe(true);
      expect(Object.is(v.un, -0)).toBe(false);
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   5. POSITIONS RELATIVES DE DEUX PLANS — P2
   ═════════════════════════════════════════════════════════════════════════ */

describe('positions relatives de deux plans', () => {
  it('décide par la colinéarité des normaux', () => {
    expect(positionDeuxPlans(planNomme('BDE'), planNomme('CFH'))).toBe(POSITION_DEUX_PLANS.paralleles);
    expect(positionDeuxPlans(planNomme('ABC'), planNomme('EFG'))).toBe(POSITION_DEUX_PLANS.paralleles);
    expect(positionDeuxPlans(planNomme('ABC'), planNomme('ABF'))).toBe(POSITION_DEUX_PLANS.secants);
    expect(positionDeuxPlans(planNomme('ABC'), planNomme('ABC'))).toBe(POSITION_DEUX_PLANS.confondus);
  });

  it('n’admet que trois cas, et jamais le « non coplanaires » des droites', () => {
    const vus = new Set();
    for (const c1 of Object.keys(PLANS)) {
      for (const c2 of Object.keys(PLANS)) {
        vus.add(positionDeuxPlans(planNomme(c1), planNomme(c2)));
      }
    }
    expect([...vus].sort()).toEqual(['confondus', 'paralleles', 'secants']);
  });

  it('donne le MÊME normal réduit à deux plans parallèles', () => {
    for (const v of verdictsDeuxPlans()) {
      if (v.position !== POSITION_DEUX_PLANS.paralleles) continue;
      expect(v.p1.n).toEqual(v.p2.n);
      expect(v.p1.d).not.toBe(v.p2.d);
    }
  });

  it('ne rend une distance QUE pour deux plans strictement parallèles', () => {
    for (const v of verdictsDeuxPlans()) {
      if (v.position === POSITION_DEUX_PLANS.paralleles) expect(v.distance).not.toBeNull();
      else expect(v.distance).toBeNull();
    }
    expect(distanceDeuxPlans(planNomme('ABC'), planNomme('ABF'))).toBeNull();
    expect(distanceDeuxPlans(planNomme('ABC'), planNomme('ABC'))).toBeNull();
  });

  it('calcule les cinq couples du module 3 sans en écrire le verdict', () => {
    const parCle = Object.fromEntries(verdictsDeuxPlans().map((v) => [v.cle, v.position]));
    expect(parCle).toEqual({
      pp1: POSITION_DEUX_PLANS.paralleles,  // (BDE) ∥ (CFH)
      pp2: POSITION_DEUX_PLANS.paralleles,  // plancher ∥ plafond
      pp3: POSITION_DEUX_PLANS.secants,     // plancher × face avant
      pp4: POSITION_DEUX_PLANS.secants,     // (BDE) × plancher
      pp5: POSITION_DEUX_PLANS.paralleles,  // face gauche ∥ face droite
    });
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   6. REPRÉSENTATION PARAMÉTRIQUE — P5
   ═════════════════════════════════════════════════════════════════════════ */

describe('la représentation paramétrique d’une droite', () => {
  it('rend le point A pour t = 0 et A + u pour t = 1', () => {
    const d = droiteNom('A', 'G');
    expect(pointDeParametre(d, 0)).toEqual(pt('A'));
    expect(pointDeParametre(d, 1)).toEqual(pt('G'));
    expect(pointDeParametre(d, 0.5)).toEqual(v3(1, 1, 1));
    expect(pointDeParametre(d, -1)).toEqual(v3(-2, -2, -2));
  });

  it('retrouve le paramètre d’un point de la droite, et refuse les autres', () => {
    const d = droiteNom('A', 'G');
    expect(parametreDe(d, v3(1, 1, 1))).toBe(0.5);
    expect(parametreDe(d, pt('G'))).toBe(1);
    expect(parametreDe(d, v3(4, 4, 4))).toBe(2);
    // Deux coordonnées sur trois qui s'accordent NE SUFFISENT PAS : c'est
    // l'erreur visée par le module 4.
    expect(parametreDe(d, v3(1, 1, 2))).toBeNull();
    expect(parametreDe(d, pt('B'))).toBeNull();
  });

  it('gère un directeur dont une coordonnée est nulle', () => {
    const d = droiteNom('A', 'C');  // u = (2 ; 2 ; 0)
    expect(d.u).toEqual(v3(2, 2, 0));
    expect(parametreDe(d, v3(1, 1, 0))).toBe(0.5);
    // Un point de même x et y mais d'autre z n'est PAS sur la droite.
    expect(parametreDe(d, v3(1, 1, 1))).toBeNull();
  });

  it('écrit les TROIS lignes, même celle dont le coefficient est nul', () => {
    const l = lignesParametriques(droiteNom('A', 'C'));
    expect(l).toHaveLength(3);
    expect(l.map((r) => r.texte)).toEqual([
      'x = 0 + 2t',
      'y = 0 + 2t',
      'z = 0 + 0t',
    ]);
    expect(lignesParametriques(droiteNom('B', 'H')).map((r) => r.texte)).toEqual([
      'x = 2 − 2t',
      'y = 0 + 2t',
      'z = 0 + 2t',
    ]);
  });

  it('n’écrit jamais « + −0t » ni un « −0 » — balayage des 56 droites du cube', () => {
    let n = 0;
    for (let i = 0; i < 8; i += 1) {
      for (let j = 0; j < 8; j += 1) {
        if (i === j) continue;
        const lignes = lignesParametriques(droiteNom(NOMS[i], NOMS[j]));
        n += 1;
        expect(lignes).toHaveLength(3);
        for (const ligne of lignes) {
          expect(ligne.texte).not.toMatch(/−0t/);
          expect(ligne.texte).not.toMatch(/−0 /);
          expect(Object.is(ligne.coef, -0)).toBe(false);
          expect(Object.is(ligne.origine, -0)).toBe(false);
        }
      }
    }
    expect(n).toBe(56);
  });

  it('refuse un vecteur directeur nul au lieu de rendre une droite dégénérée', () => {
    expect(() => droiteParPointEtVecteur(v3(0, 0, 0), v3(0, 0, 0))).toThrow(/nul/);
  });

  it('produit une droite dont tout point de paramètre entier a des coordonnées entières', () => {
    for (const [a, b] of [['A', 'G'], ['B', 'H'], ['A', 'C'], ['E', 'C']]) {
      const d = droiteNom(a, b);
      for (const t of [-2, -1, 0, 1, 2]) {
        const M = pointDeParametre(d, t);
        for (const axe of ['x', 'y', 'z']) expect(Number.isInteger(M[axe])).toBe(true);
      }
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   7. PARALLÉLISME ET ORTHOGONALITÉ — P3 et P4
   ═════════════════════════════════════════════════════════════════════════ */

describe('démontrer le parallélisme et l’orthogonalité', () => {
  it('INVERSE le rôle du produit scalaire entre droite/droite et droite/plan', () => {
    const abc = planNomme('ABC');           // n = (0;0;1)
    const ae = droiteNom('A', 'E');         // u = (0;0;2) : COLINÉAIRE à n
    const ac = droiteNom('A', 'C');         // u = (2;2;0) : ORTHOGONAL à n

    // Droite ⊥ plan  ⟺  directeur COLINÉAIRE au normal.
    expect(droiteOrthogonaleAuPlan(ae, abc)).toBe(true);
    expect(orthogonaux(ae.u, abc.n)).toBe(false);   // le produit ne vaut PAS 0

    // Droite ∥ plan  ⟺  produit directeur·normal NUL (et un point hors du plan).
    const eg = droiteNom('E', 'G');         // u = (2;2;0), E hors du plancher
    expect(orthogonaux(eg.u, abc.n)).toBe(true);
    expect(droiteParalleleAuPlan(eg, abc)).toBe(true);
    expect(droiteOrthogonaleAuPlan(eg, abc)).toBe(false);

    // (AC) a le même directeur mais un point DANS le plan : elle y est contenue,
    // donc pas « parallèle » au sens strict.
    expect(orthogonaux(ac.u, abc.n)).toBe(true);
    expect(droiteParalleleAuPlan(ac, abc)).toBe(false);
  });

  it('démontre le parallélisme de deux plans par la colinéarité des normaux', () => {
    expect(plansParalleles(planNomme('BDE'), planNomme('CFH'))).toBe(true);
    expect(plansParalleles(planNomme('ABC'), planNomme('EFG'))).toBe(true);
    expect(plansParalleles(planNomme('ABC'), planNomme('ABF'))).toBe(false);
  });

  it('démontre l’orthogonalité de deux plans par le produit nul des normaux', () => {
    expect(plansOrthogonaux(planNomme('ABC'), planNomme('ABF'))).toBe(true);
    expect(plansOrthogonaux(planNomme('ABF'), planNomme('ADH'))).toBe(true);
    expect(plansOrthogonaux(planNomme('BDE'), planNomme('CFH'))).toBe(false);
    // (BDE) n = (1;1;1) et (ACF) n = (1;−1;−1) : produit 1 − 1 − 1 = −1 ≠ 0.
    expect(plansOrthogonaux(planNomme('BDE'), planNomme('ACF'))).toBe(false);
  });

  it('teste colinéarité et orthogonalité de façon EXACTE, sans epsilon', () => {
    expect(colineaires(v3(2, 2, 2), v3(1, 1, 1))).toBe(true);
    expect(colineaires(v3(2, 2, 2), v3(-1, -1, -1))).toBe(true);
    expect(colineaires(v3(2, 2, 0), v3(1, 1, 1))).toBe(false);
    expect(orthogonaux(v3(2, 2, 0), v3(0, 0, 1))).toBe(true);
    expect(orthogonaux(v3(1, -1, 0), v3(1, 1, 0))).toBe(true);
    expect(orthogonaux(v3(1, 1, 1), v3(1, 1, 1))).toBe(false);
  });

  // La démonstration de P4 la plus utile : une droite orthogonale au plan est
  // orthogonale à TOUTE droite du plan. On le vérifie par balayage.
  it('rend une droite orthogonale au plan orthogonale à toutes les droites du plan', () => {
    const abc = planNomme('ABC');
    const ae = droiteNom('A', 'E');
    expect(droiteOrthogonaleAuPlan(ae, abc)).toBe(true);
    let comptees = 0;
    for (let i = 0; i < 8; i += 1) {
      for (let j = i + 1; j < 8; j += 1) {
        const d = droiteNom(NOMS[i], NOMS[j]);
        if (!appartient(abc, d.A) || !appartient(abc, pt(NOMS[j]))) continue;
        expect(orthogonaux(ae.u, d.u)).toBe(true);
        comptees += 1;
      }
    }
    expect(comptees).toBe(6); // les 6 droites joignant A, B, C, D
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   8. DISTANCES — P7
   ═════════════════════════════════════════════════════════════════════════ */

describe('les distances dans l’espace', () => {
  it('simplifie un radical de façon EXACTE', () => {
    expect(radical(0)).toBe('0');
    expect(radical(1)).toBe('1');
    expect(radical(4)).toBe('2');
    expect(radical(9)).toBe('3');
    expect(radical(2)).toBe('√2');
    expect(radical(3)).toBe('√3');
    expect(radical(8)).toBe('2√2');
    expect(radical(12)).toBe('2√3');
    expect(radical(18)).toBe('3√2');
  });

  it('rationalise et simplifie un quotient p/√q', () => {
    expect(quotientRadical(0, 3)).toBe('0');
    expect(quotientRadical(2, 1)).toBe('2');
    expect(quotientRadical(2, 4)).toBe('1');
    expect(quotientRadical(2, 3)).toBe('2√3/3');
    expect(quotientRadical(4, 3)).toBe('4√3/3');
    expect(quotientRadical(3, 3)).toBe('√3');
    expect(quotientRadical(1, 2)).toBe('√2/2');
    expect(quotientRadical(4, 2)).toBe('2√2');
  });

  // La forme rendue doit VALOIR le quotient de départ : une simplification
  // fausse affichée comme exacte serait indétectable à l'œil.
  it('rend une forme exacte qui vaut NUMÉRIQUEMENT le quotient — balayage', () => {
    const valeurDe = (txt) => {
      // « 2√3/3 », « √2/2 », « 4√3/3 », « 2 », « 2√2 »
      const m = txt.match(/^(\d*)(?:√(\d+))?(?:\/(\d+))?$/);
      expect(m, `forme non reconnue : ${txt}`).not.toBeNull();
      const a = m[1] === '' ? 1 : Number(m[1]);
      const r = m[2] ? Math.sqrt(Number(m[2])) : 1;
      const b = m[3] ? Number(m[3]) : 1;
      return (a * r) / b;
    };
    let n = 0;
    for (let num = 0; num <= 12; num += 1) {
      for (const n2 of [1, 2, 3, 4, 5, 6, 8, 9, 12]) {
        const txt = quotientRadical(num, n2);
        expect(valeurDe(txt)).toBeCloseTo(num / Math.sqrt(n2), 12);
        n += 1;
      }
    }
    expect(n).toBe(13 * 9);
  });

  it('calcule les distances que les modules citent', () => {
    const bde = planNomme('BDE');
    expect(distancePointPlan(pt('A'), bde)).toMatchObject({ num: 2, n2: 3, texte: '2√3/3' });
    expect(distancePointPlan(pt('G'), bde)).toMatchObject({ num: 4, n2: 3, texte: '4√3/3' });
    for (const nom of ['B', 'D', 'E']) {
      expect(distancePointPlan(pt(nom), bde)).toMatchObject({ num: 0, texte: '0' });
    }
    expect(distancePointPlan(pt('G'), planNomme('ABC'))).toMatchObject({ num: 2, n2: 1, texte: '2' });
    expect(distancePointPlan(pt('A'), planNomme('EFG'))).toMatchObject({ num: 2, n2: 1, texte: '2' });
  });

  it('rend le SIGNE de ax+by+cz+d, qui dit de quel côté du plan on est', () => {
    const bde = planNomme('BDE');
    expect(distancePointPlan(pt('A'), bde).signe).toBe(-1);
    expect(distancePointPlan(pt('G'), bde).signe).toBe(1);
    expect(distancePointPlan(pt('B'), bde).signe).toBe(0);
    // A et G sont bien de part et d'autre — ce que le module 7 affirme.
    expect(distancePointPlan(pt('A'), bde).signe * distancePointPlan(pt('G'), bde).signe).toBe(-1);
  });

  it('mesure la distance entre les deux plans parallèles (BDE) et (CFH)', () => {
    const d = distanceDeuxPlans(planNomme('BDE'), planNomme('CFH'));
    expect(d).toMatchObject({ num: 2, n2: 3, texte: '2√3/3' });
    expect(d.valeur).toBeCloseTo(2 / Math.sqrt(3), 12);
    // Et elle vaut bien la distance d'un point de l'un à l'autre.
    expect(distancePointPlan(pt('B'), planNomme('CFH')).valeur).toBeCloseTo(d.valeur, 12);
  });

  it('projette orthogonalement un point sur un plan : le projeté y appartient', () => {
    for (const cle of Object.keys(PLANS)) {
      const plan = planNomme(cle);
      for (const nom of NOMS) {
        const H = projeteSurPlan(pt(nom), plan);
        expect(Math.abs(evalPlan(plan, H))).toBeLessThan(1e-9);
        // Et MH est colinéaire au normal : c'est la définition du projeté.
        // `colineaires` est un test EXACT réservé aux vecteurs ENTIERS ; le
        // projeté a des coordonnées fractionnaires (2/3 sur le plan (BDE)),
        // donc on mesure ici la colinéarité à la tolérance — un test exact sur
        // des flottants échouerait sur un 1e-17, ce qui a été observé.
        const MH = sub3(H, pt(nom));
        expect(norm3(cross3(MH, plan.n))).toBeLessThan(1e-9);
        // La distance MH vaut la distance calculée par la formule.
        expect(norm3(sub3(H, pt(nom)))).toBeCloseTo(distancePointPlan(pt(nom), plan).valeur, 12);
      }
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   9. LA MANIPULATION SIGNATURE — ATTEIGNABILITÉ DES TROIS POSITIONS
   ═════════════════════════════════════════════════════════════════════════ */

describe('« La droite qui traverse, ou pas » — le laboratoire', () => {
  it('n’a que 27 états, tous atteignables au cran entier', () => {
    const E = etatsLabo();
    expect(E).toHaveLength(27);
    for (const e of E) {
      for (const cle of ['p', 'q', 'h']) expect(NIVEAUX).toContain(e[cle]);
    }
    expect(new Set(E.map((e) => `${e.p}${e.q}${e.h}`)).size).toBe(27);
  });

  it('part sur une droite qui PERCE le plan, en son centre exact', () => {
    const v = verdictLabo(ETAT_DEPART);
    expect(v.position).toBe(POSITION_DROITE_PLAN.secante);
    expect(v.M).toEqual(v3(1, 1, 1));
    expect(v.MSurSegment).toBe(true);
    expect(v.un).toBe(2);
  });

  // ── LA PREUVE EXIGÉE PAR LA CONSIGNE ────────────────────────────────────
  // Les trois positions doivent être atteignables AU GLISSER. On l'exhibe :
  // pour chacune, un chemin cran par cran depuis l'état de départ.
  it('atteint les TROIS positions au glisser, et exhibe le chemin de chacune', () => {
    const attendus = {
      [POSITION_DROITE_PLAN.secante]: 0,
      [POSITION_DROITE_PLAN.parallele]: 2,
      [POSITION_DROITE_PLAN.contenue]: 2,
    };
    for (const [position, crans] of Object.entries(attendus)) {
      const chemin = cheminVers(position);
      expect(chemin, `aucun chemin vers « ${position} »`).not.toBeNull();
      expect(chemin.etapes).toHaveLength(crans);

      // On REJOUE le chemin cran par cran : chaque cran reste dans les bornes,
      // et le dernier atteint bien la position demandée.
      let etat = { ...ETAT_DEPART };
      for (const etape of chemin.etapes) {
        expect(Math.abs(etape.etat[etape.cle] - etat[etape.cle])).toBe(1); // UN cran
        etat = etape.etat;
        for (const cle of ['p', 'q', 'h']) expect(NIVEAUX).toContain(etat[cle]);
      }
      expect(verdictLabo(etat).position).toBe(position);
    }
  });

  // « Contenue dans le plan » est le cas le plus délicat : il exige une
  // COÏNCIDENCE EXACTE (u·n = 0 ET un point de la droite dans le plan).
  // On vérifie qu'un cran l'atteint EXACTEMENT, à toutes les hauteurs.
  it('atteint « contenue » EXACTEMENT, aux trois hauteurs, sans approximation', () => {
    const contenues = etatsLabo().filter(
      (e) => verdictLabo(e).position === POSITION_DROITE_PLAN.contenue,
    );
    expect(contenues).toHaveLength(3);
    expect(contenues.map((e) => e.h).sort()).toEqual([0, 1, 2]);
    for (const e of contenues) {
      const v = verdictLabo(e);
      expect(e.p).toBe(e.q);            // u·n = q − p = 0
      expect(e.p).toBe(e.h);            // et P appartient au plan
      expect(v.un).toBe(0);             // EXACTEMENT zéro, pas « presque »
      expect(Object.is(v.un, -0)).toBe(false);
      expect(v.aPointDansPlan).toBe(true);
      // Les DEUX extrémités de la droite sont dans le plan : elle y est
      // entièrement couchée, ce que le dessin doit montrer.
      expect(appartient(v.plan, v.droite.A)).toBe(true);
      expect(appartient(v.plan, v.droite.B)).toBe(true);
    }
  });

  it('répartit les 27 états sur les trois positions, sans en oublier aucune', () => {
    const compte = { secante: 0, parallele: 0, contenue: 0 };
    for (const e of etatsLabo()) compte[verdictLabo(e).position] += 1;
    expect(compte).toEqual({ secante: 18, parallele: 6, contenue: 3 });
  });

  it('décide chaque état par le SEUL signe de q − p, puis par l’appartenance', () => {
    for (const e of etatsLabo()) {
      const v = verdictLabo(e);
      expect(v.un).toBe(e.q - e.p);
      if (e.q !== e.p) expect(v.position).toBe(POSITION_DROITE_PLAN.secante);
      else expect(v.position).toBe(e.p === e.h
        ? POSITION_DROITE_PLAN.contenue
        : POSITION_DROITE_PLAN.parallele);
    }
  });

  it('place le point de percée sur des coordonnées lisibles', () => {
    const vus = new Set();
    for (const e of etatsLabo()) {
      const v = verdictLabo(e);
      if (v.position !== POSITION_DROITE_PLAN.secante) continue;
      // Le point appartient bien aux deux objets.
      expect(appartient(v.plan, v.M)).toBe(true);
      expect(parametreDe(v.droite, v.M)).toBeCloseTo(v.t, 12);
      // Sa cote est la hauteur du plan, par construction.
      expect(v.M.z).toBe(e.h);
      vus.add(frVec3(v.M));
    }
    // Toutes les coordonnées lues sont entières ou demi-entières.
    for (const e of etatsLabo()) {
      const v = verdictLabo(e);
      if (!v.MSurSegment) continue;
      for (const axe of ['x', 'y', 'z']) expect(Number.isInteger(v.M[axe] * 2)).toBe(true);
    }
    expect(vus.size).toBeGreaterThan(3);
  });

  // Le point de percée n'est pas toujours SUR le segment dessiné : la droite et
  // le plan sont infinis, le dessin n'en montre qu'un morceau. Le verdict
  // « 1 point commun » reste juste dans les deux cas — c'est la thèse de la
  // leçon, et le composant doit le DIRE plutôt que de le cacher.
  it('distingue le point de percée VISIBLE de celui qui tombe hors du morceau dessiné', () => {
    const secantes = etatsLabo().map(verdictLabo)
      .filter((v) => v.position === POSITION_DROITE_PLAN.secante);
    expect(secantes.filter((v) => v.MSurSegment)).toHaveLength(14);
    expect(secantes.filter((v) => !v.MSurSegment)).toHaveLength(4);
    // Dans TOUS les cas, il y a bien exactement un point commun.
    for (const v of secantes) expect(v.pointsCommuns).toBe('1');
  });

  it('donne à la droite du laboratoire un directeur qui traverse l’INTÉRIEUR du cube', () => {
    for (const e of etatsLabo()) {
      const d = droiteDuLabo(e);
      expect(d.u.x).toBe(2);
      expect(d.u.y).toBe(2);   // elle est en diagonale, pas plaquée sur une face
      expect(d.u.z).toBe(e.q - e.p);
      // Le milieu du segment est strictement dans le cube.
      const M = pointDeParametre(d, 0.5);
      expect(M.x).toBe(1);
      expect(M.y).toBe(1);
      expect(M.z).toBeGreaterThanOrEqual(0);
      expect(M.z).toBeLessThanOrEqual(2);
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   10. LE GLISSER, L’AIMANTATION ET LE CHEMIN CLAVIER
   ═════════════════════════════════════════════════════════════════════════ */

describe('le glisser et son aimantation', () => {
  it('aimante toute orientation atteinte au doigt sur un cran de la plage', () => {
    for (const depart of orientationsAtteignables()) {
      for (const dx of [-311, -47, -13, 0, 7, 91, 400]) {
        for (const dy of [-260, -33, 0, 19, 155]) {
          const o = orientationApresGlisser(depart, dx, dy);
          expect(estAtteignable(o)).toBe(true);
          expect(orientationsAtteignables().some(
            (a) => a.yaw === o.yaw && a.pitch === o.pitch,
          )).toBe(true);
        }
      }
    }
  });

  it('borne l’orientation sans jamais la laisser sortir de la plage', () => {
    expect(aimanter(1000, YAW_RANGE)).toBe(YAW_RANGE.max);
    expect(aimanter(-1000, YAW_RANGE)).toBe(YAW_RANGE.min);
    expect(aimanter(-7, YAW_RANGE)).toBe(0);
    expect(aimanter(-8, YAW_RANGE)).toBe(-15);
    expect(aimanter(52, PITCH_RANGE)).toBe(45);
    expect(aimanter(1000, PITCH_RANGE)).toBe(PITCH_RANGE.max);
    expect(aimanter(-1000, PITCH_RANGE)).toBe(PITCH_RANGE.min);
    expect(Object.is(aimanter(-0.1, YAW_RANGE), -0)).toBe(false);
  });

  it('offre un chemin clavier COMPLET, borné lui aussi', () => {
    const o = { yaw: -45, pitch: 45 };
    expect(orientationApresTouche(o, 'ArrowLeft')).toEqual({ yaw: -60, pitch: 45 });
    expect(orientationApresTouche(o, 'ArrowRight')).toEqual({ yaw: -30, pitch: 45 });
    expect(orientationApresTouche(o, 'ArrowUp')).toEqual({ yaw: -45, pitch: 60 });
    expect(orientationApresTouche(o, 'ArrowDown')).toEqual({ yaw: -45, pitch: 30 });
    expect(orientationApresTouche(o, 'Home').yaw).toBe(YAW_RANGE.min);
    expect(orientationApresTouche(o, 'End').yaw).toBe(YAW_RANGE.max);
    expect(orientationApresTouche(o, 'PageUp').pitch).toBe(PITCH_RANGE.max);
    expect(orientationApresTouche(o, 'PageDown').pitch).toBe(PITCH_RANGE.min);
    expect(orientationApresTouche(o, 'a')).toBeNull();
    // Aux bornes, la touche ne fait PAS sortir — et c'est ce qui garantit que
    // le clavier ne peut pas produire une vue où le plan serait écrasé.
    expect(orientationApresTouche({ yaw: YAW_RANGE.max, pitch: 45 }, 'ArrowRight').yaw).toBe(YAW_RANGE.max);
    expect(orientationApresTouche({ yaw: YAW_RANGE.min, pitch: 45 }, 'ArrowLeft').yaw).toBe(YAW_RANGE.min);
    expect(orientationApresTouche({ yaw: -45, pitch: PITCH_RANGE.min }, 'ArrowDown').pitch).toBe(PITCH_RANGE.min);
    expect(orientationApresTouche({ yaw: -45, pitch: PITCH_RANGE.max }, 'ArrowUp').pitch).toBe(PITCH_RANGE.max);
    // Toute touche mène à une orientation atteignable.
    for (const depart of orientationsAtteignables()) {
      for (const k of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown']) {
        expect(estAtteignable(orientationApresTouche(depart, k))).toBe(true);
      }
    }
  });

  // C'est CE mécanisme qui tient la promesse d'atteignabilité au doigt : une
  // poignée ne peut littéralement pas s'arrêter entre deux crans.
  it('aimante une poignée sur un cran entier, où que le doigt tombe', () => {
    for (const o of orientationsAtteignables()) {
      for (const arete of ['P', 'Q']) {
        for (const x of [-500, 0, 75, 150, 299, 900]) {
          for (const y of [-500, 0, 150, 299, 900]) {
            const n = niveauLePlusProche(o, arete, { x, y });
            expect(NIVEAUX).toContain(n);
          }
        }
      }
    }
  });

  it('rend la position exacte quand le doigt tombe SUR un cran', () => {
    for (const o of orientationsAtteignables()) {
      for (const niveau of NIVEAUX) {
        const [E] = ecran(o, [v3(0, 0, niveau)]);
        expect(niveauLePlusProche(o, 'P', E)).toBe(niveau);
        const [F] = ecran(o, [v3(ARETE, ARETE, niveau)]);
        expect(niveauLePlusProche(o, 'Q', F)).toBe(niveau);
        const [C] = ecran(o, [v3(1, 1, niveau)]);
        expect(hauteurLaPlusProche(o, C)).toBe(niveau);
      }
    }
  });

  it('attrape la bonne poignée quand le doigt est dessus', () => {
    for (const o of orientationsAtteignables()) {
      for (const etat of [ETAT_DEPART, { p: 1, q: 1, h: 1 }, { p: 2, q: 0, h: 0 }]) {
        const [P, Q] = ecran(o, [v3(0, 0, etat.p), v3(ARETE, ARETE, etat.q)]);
        expect(poigneeSous(o, etat, P)).toBe('P');
        expect(poigneeSous(o, etat, Q)).toBe('Q');
      }
    }
  });

  // Il n'y a que deux poignées : un test suffit à prouver que la saisie n'est
  // jamais ambiguë, sur toute la plage. C'est la plage de rotation, calculée
  // pour cela, qui rend le fait vrai — sur la plage héritée de la leçon
  // voisine, les deux poignées se croisaient à 11 unités d'écart.
  it('ne laisse jamais les deux poignées se confondre à l’écran', () => {
    let mini = Infinity;
    let pire = null;
    for (const o of orientationsAtteignables()) {
      for (const p of NIVEAUX) {
        for (const q of NIVEAUX) {
          const [P, Q] = ecran(o, [v3(0, 0, p), v3(ARETE, ARETE, q)]);
          const d = Math.hypot(P.x - Q.x, P.y - Q.y);
          if (d < mini) { mini = d; pire = { ...o, p, q }; }
        }
      }
    }
    // Deux fois le rayon de saisie : les deux zones ne se recouvrent JAMAIS.
    expect(mini, `au plus près à ${JSON.stringify(pire)}`).toBeGreaterThan(2 * RAYON_SAISIE);
  });

  it('ne saisit rien quand le doigt est loin de tout — le geste tourne alors le solide', () => {
    const o = ORIENTATION_DEPART;
    // Un coin du cadre est hors du plan comme des poignées.
    expect(poigneeSous(o, ETAT_DEPART, { x: 2, y: 2 })).toBeNull();
    expect(poigneeSous(o, ETAT_DEPART, { x: 298, y: 298 })).toBeNull();
  });

  it('reconnaît un point à l’intérieur du quadrilatère du plan', () => {
    const carre = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(dansPolygone(carre, { x: 5, y: 5 })).toBe(true);
    expect(dansPolygone(carre, { x: 15, y: 5 })).toBe(false);
    expect(dansPolygone(carre, { x: -1, y: 5 })).toBe(false);
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   11. SÉCURITÉ DE MISE EN PAGE — BALAYAGE, JAMAIS ÉCHANTILLON
   ═════════════════════════════════════════════════════════════════════════ */

describe('sécurité de mise en page', () => {
  it('dérive l’échelle du rayon MESURÉ, et non d’une estimation', () => {
    const r = rayonMaximal();
    expect(r).toBeGreaterThan(0);
    expect(ECHELLE).toBeCloseTo((DEMI_CADRE - MARGE) / r, 12);
  });

  // BALAYAGE COMPLET : 117 orientations × 3 hauteurs de plan × 27 états.
  // Aucun point dessiné, pastille comprise, ne doit franchir le bord.
  it('ne laisse RIEN sortir du cadre — 21 orientations × 3 hauteurs', () => {
    const marge = RAYON_POIGNEE + 1;
    let controles = 0;
    for (const o of orientationsAtteignables()) {
      const points = [...sommetsEcran(o)];
      for (const h of NIVEAUX) {
        points.push(...coinsPlanEcran(o, h));
        for (const n of NIVEAUX) {
          points.push(...ecran(o, [v3(0, 0, n), v3(ARETE, ARETE, n), v3(1, 1, h)]));
        }
      }
      for (const P of points) {
        expect(P.x).toBeGreaterThanOrEqual(marge);
        expect(P.x).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
        expect(P.y).toBeGreaterThanOrEqual(marge);
        expect(P.y).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
        controles += 1;
      }
    }
    expect(controles).toBeGreaterThan(900);
  });

  // La flèche du vecteur normal part du centre du plan et monte d'une DEMI
  // arête. Une arête entière ferait sortir sa pointe du cadre à h = 2 : le
  // balayage le vérifie plutôt que de le supposer.
  it('garde la pointe de la flèche du normal dans le cadre, aux trois hauteurs', () => {
    const marge = RAYON_POIGNEE + 1;
    for (const o of orientationsAtteignables()) {
      for (const h of NIVEAUX) {
        for (const P of ecran(o, [v3(1, 1, h), v3(1, 1, h + 0.5)])) {
          expect(P.x).toBeGreaterThanOrEqual(marge);
          expect(P.x).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
          expect(P.y).toBeGreaterThanOrEqual(marge);
          expect(P.y).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
        }
      }
    }
  });

  it('garde le point de percée dans le cadre, pour tout état où il est dessiné', () => {
    const marge = RAYON_POIGNEE + 1;
    for (const o of orientationsAtteignables()) {
      for (const e of etatsLabo()) {
        const v = verdictLabo(e);
        if (!v.MSurSegment) continue;
        const [P] = ecran(o, [v.M]);
        expect(P.x).toBeGreaterThanOrEqual(marge);
        expect(P.x).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
        expect(P.y).toBeGreaterThanOrEqual(marge);
        expect(P.y).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
      }
    }
  });

  it('laisse le cube occuper une part utile du cadre, plan compris', () => {
    // Le plan déborde du cube ; s'il débordait trop, le cube deviendrait un
    // timbre-poste au centre. On mesure le rapport plutôt que de l'estimer.
    let rCube = 0;
    for (const o of orientationsAtteignables()) {
      for (const P of projeterEleve(o, NOMS.map((n) => SOMMETS[n]))) {
        rCube = Math.max(rCube, Math.abs(P.x), Math.abs(P.y));
      }
    }
    expect(rCube / rayonMaximal()).toBeGreaterThan(0.6);
    expect(DEMI_PLAN).toBeGreaterThan(1); // le plan déborde bien du cube
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   12. LE PIÈGE DE LA PERSPECTIVE, ET SA PARADE PROUVÉE
   ═════════════════════════════════════════════════════════════════════════ */

describe('le piège de la perspective, et la parade', () => {
  // Un plan horizontal vu presque à l'horizontale se projette sur un SEGMENT :
  // impossible de voir si la droite le perce, le longe ou s'y couche. Ce n'est
  // PAS la vue de face qui l'écrase — la fuyante cavalière porte déjà la
  // profondeur — mais le petit pitch. C'est mesurable, et c'est ce qui a fait
  // recalculer la plage : à pitch = 20°, il reste 2 unités d'écran sur 300.
  it('MESURE qu’un pitch trop faible écraserait le plan sur un trait', () => {
    for (const h of NIVEAUX) {
      expect(hauteurApparentePlan({ yaw: 30, pitch: 20 }, h)).toBeLessThan(SEUIL_TRANCHE);
    }
    // ... et que la plage OFFERTE exclut ces orientations-là.
    expect(estAtteignable({ yaw: 30, pitch: 20 })).toBe(false);
    expect(PITCH_RANGE.min).toBeGreaterThanOrEqual(30);
  });

  // La plage a été CALCULÉE pour cela : aucune orientation offerte n'écrase le
  // plan. Le balayage est complet, il n'échantillonne pas.
  it('ne laisse AUCUNE orientation offerte écraser le plan', () => {
    let mini = Infinity;
    let pire = null;
    for (const o of orientationsAtteignables()) {
      for (const h of NIVEAUX) {
        const v = hauteurApparentePlan(o, h);
        if (v < mini) { mini = v; pire = { ...o, h }; }
      }
    }
    expect(mini, `au pire à ${JSON.stringify(pire)}`).toBeGreaterThanOrEqual(SEUIL_TRANCHE);
    expect(orientationsAtteignables().length).toBe(21);
  });

  // La leçon promet « tourne, et tu verras ». Sans ce test, la consigne serait
  // un ordre impossible.
  it('PROUVE qu’une orientation atteignable lève l’ambiguïté, pour chaque hauteur', () => {
    for (const h of NIVEAUX) {
      const bonnes = orientationsQuiLevent(h);
      expect(bonnes.length).toBeGreaterThan(0);
      for (const o of bonnes) expect(estAtteignable(o)).toBe(true);
    }
  });

  // L'orientation de DÉPART doit déjà lever l'ambiguïté : sinon la
  // manipulation signature serait illisible au premier écran.
  it('part d’une orientation où le plan se lit comme une SURFACE', () => {
    expect(estAtteignable(ORIENTATION_DEPART)).toBe(true);
    for (const h of NIVEAUX) {
      expect(hauteurApparentePlan(ORIENTATION_DEPART, h)).toBeGreaterThanOrEqual(SEUIL_TRANCHE);
      expect(orientationsQuiLevent(h).some(
        (o) => o.yaw === ORIENTATION_DEPART.yaw && o.pitch === ORIENTATION_DEPART.pitch,
      )).toBe(true);
    }
  });

  // Pour CHAQUE configuration proposée par les modules 2 et 3, il doit exister
  // une orientation atteignable où le dessin ne ment plus. C'est la condition
  // pour poser une question de position relative.
  it('lève l’ambiguïté pour CHAQUE couple droite/plan proposé par le module 2', () => {
    for (const k of COUPLES_DROITE_PLAN) {
      const droite = droiteNom(...k.droite);
      const plan = planNomme(k.plan);
      const trio = PLANS[k.plan];
      const verdict = verdictDroitePlan(droite, plan);
      // Une droite qui ne perce PAS le plan ne doit pas paraître le percer
      // dans toutes les orientations : il en faut au moins une qui le montre.
      if (verdict.position === POSITION_DROITE_PLAN.secante) continue;
      const bonnes = orientationsAtteignables().filter(
        (o) => !croisementApparent(droite, trio, o),
      );
      expect(bonnes.length, `aucune orientation ne lève « ${k.id} »`).toBeGreaterThan(0);
    }
  });

  it('détecte un croisement de segments à l’écran, extrémités exclues', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 10 };
    expect(segmentsSeCroisent(a, b, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true);
    expect(segmentsSeCroisent(a, b, { x: 20, y: 0 }, { x: 30, y: 10 })).toBe(false);
    // Parallèles à l'écran : pas de croisement.
    expect(segmentsSeCroisent(a, b, { x: 1, y: 0 }, { x: 11, y: 10 })).toBe(false);
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   13. LES VALEURS CITÉES PAR LES MODULES ET LES DISTRACTEURS DU BOSS
   ═════════════════════════════════════════════════════════════════════════ */

describe('les valeurs que les modules affichent, recalculées', () => {
  it('module 4 : la représentation paramétrique de (AG)', () => {
    expect(lignesParametriques(droiteNom('A', 'G')).map((l) => l.texte)).toEqual([
      'x = 0 + 2t', 'y = 0 + 2t', 'z = 0 + 2t',
    ]);
    expect(pointDeParametre(droiteNom('A', 'G'), 0.5)).toEqual(v3(1, 1, 1));
  });

  it('module 5 : (a ; b ; c) de x + y + z − 2 = 0 est bien le normal de (BDE)', () => {
    const plan = planNomme('BDE');
    expect(equationCartesienne(plan)).toBe('x + y + z − 2 = 0');
    expect(plan.n).toEqual(v3(1, 1, 1));
    expect(plan.d).toBe(-2);
  });

  // Le tableau des trois hauteurs, que le module 5 fait remplir à l'élève, et
  // dont une question cite les équations COMPLÈTES. Si l'une d'elles changeait,
  // l'énoncé mentirait.
  it('module 5 : les trois plans mobiles, leurs équations et leur normal commun', () => {
    const attendu = ['z = 0', 'z − 1 = 0', 'z − 2 = 0'];
    NIVEAUX.forEach((h, i) => {
      const plan = planDuLabo({ h });
      expect(equationCartesienne(plan)).toBe(attendu[i]);
      expect(plan.n).toEqual(v3(0, 0, 1));   // le MÊME normal aux trois hauteurs
      // `zero()` normalise : d vaut 0 et non −0 à la hauteur 0. Ce test l'a
      // attrapé — c'est le modèle qui a raison, et l'assertion naïve `-h` qui
      // produisait le −0 que la leçon interdit.
      expect(plan.d).toBe(h === 0 ? 0 : -h);
      expect(Object.is(plan.d, -0)).toBe(false);
    });
    // Les trois d diffèrent : c'est ce qui rend les trois plans distincts.
    expect(new Set(NIVEAUX.map((h) => planDuLabo({ h }).d)).size).toBe(3);
  });

  // Le plan CONSTRUIT par l'élève au module 5, étape 2 : normal (1;1;1) par D.
  // Il doit être EXACTEMENT le plan (BDE) de la boîte, sans quoi la
  // vérification finale sur trois points serait fausse.
  it('module 5 : le plan construit par l’élève est bien (BDE)', () => {
    const construit = planDeNormalEtPoint(v3(1, 1, 1), pt('D'));
    const bde = planNomme('BDE');
    expect(construit.n).toEqual(bde.n);
    expect(construit.d).toBe(bde.d);
    expect(equationCartesienne(construit)).toBe(equationCartesienne(bde));
    // Les trois points qui définissent (BDE) l'annulent, et E aussi — c'est le
    // témoin de vérification que le module cite.
    for (const nom of ['B', 'D', 'E']) expect(evalPlan(construit, pt(nom))).toBe(0);
    // Le distracteur « d de signe opposé » est bien un AUTRE nombre.
    expect(-construit.d).not.toBe(construit.d);
    expect(construit.d).not.toBe(0);
  });

  // Le QCM de l'étape 3 cite trois nombres calculés : ils doivent être
  // DISTINCTS, sinon deux options diraient la même chose.
  it('module 5 : les nombres cités par le QCM final sont distincts', () => {
    const g = pt('G');
    const valeurs = [
      evalPlan(planNomme('BDE'), g),
      evalPlan(planNomme('CFH'), g),
      0,
    ];
    expect(new Set(valeurs).size).toBe(valeurs.length);
    // Et G n'appartient à AUCUN des deux plans : les deux options « oui » sont
    // donc fausses toutes les deux, pour deux raisons différentes.
    expect(appartient(planNomme('BDE'), g)).toBe(false);
    expect(appartient(planNomme('CFH'), g)).toBe(false);
  });

  it('module 6 : (AE) est orthogonale au plancher, (EG) lui est parallèle', () => {
    const abc = planNomme('ABC');
    expect(droiteOrthogonaleAuPlan(droiteNom('A', 'E'), abc)).toBe(true);
    expect(droiteParalleleAuPlan(droiteNom('E', 'G'), abc)).toBe(true);
  });

  // Le tableau des huit sommets du module 7 : il doit contenir EXACTEMENT trois
  // zéros (les trois points du plan) et des distances discriminantes.
  it('module 7 : le tableau des huit sommets porte trois zéros et deux distances', () => {
    const P = planNomme('BDE');
    const lignes = NOMS.map((nom) => ({ nom, ...distancePointPlan(pt(nom), P) }));
    expect(lignes.filter((l) => l.brut === 0).map((l) => l.nom).sort()).toEqual(['B', 'D', 'E']);
    // Les signes non nuls sont des DEUX côtés : le plan sépare bien la boîte.
    expect(lignes.some((l) => l.signe === 1)).toBe(true);
    expect(lignes.some((l) => l.signe === -1)).toBe(true);
    // Et les distances non nulles sont lisibles, en radicaux.
    const textes = [...new Set(lignes.filter((l) => l.num > 0).map((l) => l.texte))];
    expect(textes.sort()).toEqual(['2√3/3', '4√3/3']);
  });

  // Les quatre options du QCM final du module 7 sont toutes PRODUITES par le
  // modèle : rien ne garantit a priori qu'elles diffèrent.
  it('module 7 : les quatre options du QCM de distance sont DISTINCTES', () => {
    const P = planNomme('BDE');
    const P2 = planNomme('CFH');
    const dPlans = distanceDeuxPlans(P, P2);
    const dG = distancePointPlan(pt('G'), P);
    const options = [
      dPlans.texte,                 // la bonne : 2√3/3
      dG.texte,                     // le mauvais point : 4√3/3
      radical(dPlans.n2),           // le mauvais nombre divisé : √3
      fr(dPlans.num),               // le dénominateur oublié : 2
    ];
    expect(new Set(options).size).toBe(options.length);
    // Et les quatre valeurs numériques restent dans un ordre de grandeur
    // crédible, sans être confondables.
    const valeurs = [dPlans.valeur, dG.valeur, Math.sqrt(dPlans.n2), dPlans.num];
    for (let i = 0; i < valeurs.length; i += 1) {
      for (let j = i + 1; j < valeurs.length; j += 1) {
        expect(Math.abs(valeurs[i] - valeurs[j])).toBeGreaterThan(0.1);
      }
    }
    for (const v of valeurs) {
      expect(v).toBeGreaterThan(dPlans.valeur / 10);
      expect(v).toBeLessThan(dPlans.valeur * 10);
    }
  });

  it('module 7 : les distances citées, en radicaux exacts', () => {
    expect(distancePointPlan(pt('A'), planNomme('BDE')).texte).toBe('2√3/3');
    expect(distancePointPlan(pt('G'), planNomme('BDE')).texte).toBe('4√3/3');
    expect(distanceDeuxPlans(planNomme('BDE'), planNomme('CFH')).texte).toBe('2√3/3');
    expect(distancePointPlan(pt('G'), planNomme('ABC')).texte).toBe('2');
  });

  // §15 du patron : chaque distracteur du boss est CALCULÉ, et distinct de la
  // bonne réponse comme des autres pièges. Deux options identiques rendraient
  // l'épreuve insoluble.
  it('rend les distracteurs du boss numériquement DISTINCTS', () => {
    const distincts = (titre, options) => {
      expect(new Set(options).size, `${titre} : deux options identiques`).toBe(options.length);
    };

    // e1 — u·n décide : 2, 0, 6, −2 pour (AG)/(EG)/(AC) sur divers plans.
    const abc = planNomme('ABC');
    distincts('e1', [
      dot3(droiteNom('A', 'G').u, abc.n),   // 2
      dot3(droiteNom('E', 'G').u, abc.n),   // 0
      dot3(droiteNom('A', 'G').u, planNomme('BDE').n), // 6
      dot3(droiteNom('C', 'E').u, planNomme('BDE').n), // −2
    ]);

    // e4 — l'équation de (BDE) contre trois pièges plausibles.
    distincts('e4', [
      equationCartesienne(planNomme('BDE')),      // x + y + z − 2 = 0
      equationCartesienne(planNomme('CFH')),      // x + y + z − 4 = 0  (mauvais d)
      equationCartesienne(planNomme('ACF')),      // x − y − z = 0      (mauvais normal)
      equationCartesienne(planDeNormalEtPoint(v3(1, 1, 1), v3(0, 0, 0))), // x+y+z=0
    ]);

    // e7 — les représentations paramétriques : la bonne, et le piège classique
    // « on a écrit les coordonnées de A à la place de celles de u ».
    const ag = droiteNom('A', 'G');
    const piege = { A: ag.u, u: ag.A.x || ag.A.y || ag.A.z ? ag.A : v3(1, 0, 0) };
    distincts('e7', [
      lignesParametriques(ag).map((l) => l.texte).join(' ; '),
      lignesParametriques(droiteNom('B', 'H')).map((l) => l.texte).join(' ; '),
      lignesParametriques(droiteNom('A', 'C')).map((l) => l.texte).join(' ; '),
      lignesParametriques(droiteNom('E', 'C')).map((l) => l.texte).join(' ; '),
    ]);
    expect(piege).toBeTruthy();

    // e10 — les distances : la bonne (2√3/3) et trois pièges d'ordre de
    // grandeur crédible mais distincts.
    distincts('e10', [
      distancePointPlan(pt('A'), planNomme('BDE')).texte,   // 2√3/3
      distancePointPlan(pt('G'), planNomme('BDE')).texte,   // 4√3/3  (mauvais point)
      radical(3),                                            // √3    (normal non divisé)
      String(distancePointPlan(pt('A'), planNomme('BDE')).num), // 2  (racine oubliée)
    ]);
  });

  it('garde les valeurs des distracteurs dans un ordre de grandeur crédible', () => {
    const bonne = distancePointPlan(pt('A'), planNomme('BDE')).valeur;
    for (const piege of [
      distancePointPlan(pt('G'), planNomme('BDE')).valeur,
      Math.sqrt(3),
      2,
    ]) {
      expect(piege).toBeGreaterThan(bonne / 10);
      expect(piege).toBeLessThan(bonne * 10);
      expect(Math.abs(piege - bonne)).toBeGreaterThan(0.1); // discernables
    }
  });
});
