/**
 * LES PROMESSES DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « fais un triangle rectangle
 * en B » (l'est-ce atteignable ?), « l'angle droit est EXACT, pas arrondi »,
 * « ce triangle a l'air rectangle et ne l'est pas », « (PH) est la hauteur ».
 * Ce sont des CONTENUS PÉDAGOGIQUES : si le comportement réel diffère, la
 * leçon MENT — et `geometry2d` ne l'attrape pas, il vérifie que `dot` est
 * juste, pas qu'un module dit vrai en le citant.
 *
 * PÉRIMÈTRE : aucun test ne mentionne le produit scalaire dans l'espace, le
 * produit vectoriel, ni les lieux géométriques (cercle par une équation) —
 * hors périmètre, laissés à la Terminale et aux leçons voisines.
 */
import { describe, it, expect } from 'vitest';
import {
  RANGE, TRIANGLE_DEPART, SOMMETS, PAS, CIBLES, SCENES,
  dansLeCadre, estUnTriangle, deplacer, cheminVers,
  cotes, angles, estRectangleEn, sommetDroit, paireIsocele, nature, natureTexte,
  cosAngle, angleVecteursDeg, angleEnDeg, carreScalaire, longueurParScalaire, alKashiCarre,
  formeNormale, verifieEquation, distancePointDroite, equationTexte, formeNormaleTexte,
  naturesDesTriangles,
  fr, frVec, parseSigned, dot, vec, norm, cross, areCollinear,
  poser, sommetLePlusProche,
} from './theodoliteUtils';
import { prehensionPx, PLANCHER_PX } from '../../../prehension';

/** Tous les points entiers du cadre : la base de tout balayage exhaustif. */
const GRILLE = [];
for (let x = RANGE.xMin; x <= RANGE.xMax; x += 1) {
  for (let y = RANGE.yMin; y <= RANGE.yMax; y += 1) GRILLE.push({ x, y });
}

describe('LE THÉODOLITE — un état entier, des mesures exactes', () => {
  it('le triangle de départ est QUELCONQUE : la mission a un sens', () => {
    expect(estUnTriangle(TRIANGLE_DEPART)).toBe(true);
    expect(nature(TRIANGLE_DEPART).code).toBe('quelconque');
    for (const s of SOMMETS) expect(dansLeCadre(TRIANGLE_DEPART[s])).toBe(true);
  });

  it('les sommets restent ENTIERS après n’importe quelle suite de crans', () => {
    let t = TRIANGLE_DEPART;
    for (let i = 0; i < 40; i += 1) {
      const s = SOMMETS[i % 3];
      const p = PAS[i % 4];
      t = deplacer(t, s, p.dx, p.dy);
      for (const k of SOMMETS) {
        expect(Number.isInteger(t[k].x)).toBe(true);
        expect(Number.isInteger(t[k].y)).toBe(true);
      }
    }
  });

  it('`deplacer` est PURE : elle ne mute jamais l’état reçu', () => {
    const avant = JSON.parse(JSON.stringify(TRIANGLE_DEPART));
    deplacer(TRIANGLE_DEPART, 'A', 1, 0);
    expect(TRIANGLE_DEPART).toEqual(avant);
  });

  it('un coup hors cadre est REFUSÉ et rend le même état, sans le modifier', () => {
    const t = { A: { x: RANGE.xMax, y: 0 }, B: { x: 0, y: 3 }, C: { x: -2, y: -2 } };
    expect(deplacer(t, 'A', 1, 0)).toBe(t);
    expect(deplacer(t, 'A', -1, 0)).not.toBe(t);
  });

  it('un coup qui APLATIRAIT le triangle est refusé : il n’y a jamais d’état dégénéré', () => {
    // A(0;0) B(2;0) C(1;1) : descendre C d'un cran aligne les trois points.
    const t = { A: { x: 0, y: 0 }, B: { x: 2, y: 0 }, C: { x: 1, y: 1 } };
    expect(deplacer(t, 'C', 0, -1)).toBe(t);
    expect(estUnTriangle(deplacer(t, 'C', 0, 1))).toBe(true);
  });

  it('BALAYAGE : sur 200 marches aléatoires, l’état reste toujours un vrai triangle dans le cadre', () => {
    let graine = 12345;
    const rnd = (n) => {
      graine = (graine * 1103515245 + 12345) % 2147483648;
      return Math.floor((graine / 2147483648) * n);
    };
    let t = TRIANGLE_DEPART;
    for (let i = 0; i < 200; i += 1) {
      const p = PAS[rnd(4)];
      t = deplacer(t, SOMMETS[rnd(3)], p.dx, p.dy);
      expect(estUnTriangle(t)).toBe(true);
      for (const s of SOMMETS) expect(dansLeCadre(t[s])).toBe(true);
      // Et l'instrument reste lisible : trois angles finis, trois longueurs finies.
      for (const a of angles(t)) expect(Number.isFinite(a.deg)).toBe(true);
      for (const c of cotes(t)) expect(c.carre).toBeGreaterThan(0);
    }
  });
});

describe('L’ANGLE DROIT EST EXACT — pas un arrondi', () => {
  it('les produits scalaires de l’instrument sont des ENTIERS : `=== 0` a un sens', () => {
    let t = TRIANGLE_DEPART;
    for (let i = 0; i < 30; i += 1) {
      t = deplacer(t, SOMMETS[i % 3], PAS[i % 4].dx, PAS[i % 4].dy);
      for (const a of angles(t)) expect(Number.isInteger(a.produit)).toBe(true);
      for (const c of cotes(t)) expect(Number.isInteger(c.carre)).toBe(true);
    }
  });

  it('quand un produit vaut 0, l’angle affiché vaut 90 AU BIT PRÈS, et non 89,999…', () => {
    // Le piège du lot 1 : cos(90°) rendu par des flottants donne 6 × 10⁻¹⁷,
    // et `fr` afficherait « 90 » tout en laissant `deg !== 90`.
    const droits = [
      { A: { x: 0, y: 0 }, B: { x: 4, y: 0 }, C: { x: 0, y: 3 } },
      { A: { x: -3, y: -2 }, B: { x: 1, y: 1 }, C: { x: -6, y: 2 } },
      { A: { x: -5, y: -3 }, B: { x: 1, y: 3 }, C: { x: 4, y: 0 } },
    ];
    for (const t of droits) {
      const s = sommetDroit(t);
      expect(s).not.toBeNull();
      const a = angles(t).find((x) => x.id === s);
      expect(a.produit).toBe(0);
      expect(a.cos).toBe(0);
      expect(a.deg).toBe(90);
      expect(fr(a.deg)).toBe('90');
    }
  });

  it('BALAYAGE EXHAUSTIF du cadre : `produit === 0` ⟺ l’angle vaut exactement 90°', () => {
    // Un échantillon serait insuffisant : on balaie tous les triangles dont
    // deux sommets sont fixés, le troisième parcourant les 169 points.
    const A = { x: -3, y: -1 };
    const B = { x: 2, y: 1 };
    for (const C of GRILLE) {
      if (cross(vec(A, B), vec(A, C)) === 0) continue;
      const t = { A, B, C };
      for (const a of angles(t)) {
        if (a.produit === 0) expect(a.deg).toBe(90);
        else expect(a.deg).not.toBe(90);
      }
    }
  });
});

describe('AUCUN_EQUILATERAL — la pastille ne promet pas l’impossible', () => {
  it('il n’existe AUCUN triangle équilatéral à sommets entiers dans le cadre', () => {
    // C'est ce qui justifie que `nature` n'ait que quatre valeurs. Le
    // vérifier par balayage plutôt que de le croire : la consigne aurait pu
    // annoncer « fais un équilatéral », cible que rien ne peut atteindre.
    let equilateraux = 0;
    for (const A of GRILLE) {
      for (const B of GRILLE) {
        const ab = carreScalaire(vec(A, B));
        if (ab === 0) continue;
        for (const C of GRILLE) {
          if (carreScalaire(vec(B, C)) !== ab) continue;
          if (carreScalaire(vec(C, A)) !== ab) continue;
          equilateraux += 1;
        }
      }
    }
    expect(equilateraux).toBe(0);
  });

  it('`nature` ne rend jamais autre chose que ses quatre codes déclarés', () => {
    const codes = new Set();
    const A = { x: -2, y: -2 };
    const B = { x: 3, y: -1 };
    for (const C of GRILLE) {
      if (cross(vec(A, B), vec(A, C)) === 0) continue;
      codes.add(nature({ A, B, C }).code);
    }
    for (const c of codes) {
      expect(['rectangle', 'isocele', 'rectangle-isocele', 'quelconque']).toContain(c);
    }
    // Et les quatre sont bien tous ATTEIGNABLES depuis ce balayage :
    expect(codes.size).toBe(4);
  });

  it('le plus « équilatéral » possible reste à plus de 0,7 % d’écart entre ses côtés', () => {
    // Le chiffre que la leçon a le droit de citer : si elle disait « à moins
    // de 0,1 % près », ce serait faux.
    let meilleur = Infinity;
    const A = { x: -5, y: -5 };
    for (const B of GRILLE) {
      for (const C of GRILLE) {
        if (cross(vec(A, B), vec(A, C)) === 0) continue;
        const L = cotes({ A, B, C }).map((c) => c.longueur);
        if (Math.min(...L) < 4) continue;
        meilleur = Math.min(meilleur, Math.max(...L) / Math.min(...L) - 1);
      }
    }
    expect(meilleur).toBeGreaterThan(0.007);
    expect(meilleur).toBeLessThan(0.01);
  });
});

describe('CIBLES ATTEIGNABLES — la mission du module 1 est débloquable', () => {
  it('aucune cible n’est déjà atteinte au départ : la mission demande un GESTE', () => {
    for (const c of CIBLES) expect(c.atteinte(TRIANGLE_DEPART)).toBe(false);
  });

  it('« rectangle en B » est atteint depuis le départ en un nombre FINI de crans — chemin exhibé', () => {
    const chemin = cheminVers(TRIANGLE_DEPART, CIBLES[0].atteinte, 6);
    expect(chemin).not.toBeNull();
    expect(chemin.length).toBeGreaterThan(0);
    expect(chemin.length).toBeLessThanOrEqual(6);
    // On REJOUE le chemin : la preuve d'atteignabilité doit être exécutable.
    let t = TRIANGLE_DEPART;
    for (const coup of chemin) t = deplacer(t, coup.sommet, coup.dx, coup.dy);
    expect(estRectangleEn(t, 'B')).toBe(true);
    expect(angles(t).find((a) => a.id === 'B').deg).toBe(90);
  });

  it('« isocèle NON rectangle » est atteint depuis le départ — chemin exhibé et rejoué', () => {
    const chemin = cheminVers(TRIANGLE_DEPART, CIBLES[1].atteinte, 6);
    expect(chemin).not.toBeNull();
    let t = TRIANGLE_DEPART;
    for (const coup of chemin) t = deplacer(t, coup.sommet, coup.dx, coup.dy);
    expect(paireIsocele(t)).not.toBeNull();
    expect(sommetDroit(t)).toBeNull();
    expect(nature(t).code).toBe('isocele');
  });

  it('la seconde cible EXCLUT le rectangle isocèle : elle ne se valide pas par accident', () => {
    // A(-5;0) B(1;-3) C(4;3) est rectangle en B ET isocèle : sans la clause
    // « aucun angle droit », il satisferait la consigne « isocèle non rectangle ».
    const rectIso = { A: { x: -5, y: 0 }, B: { x: 1, y: -3 }, C: { x: 4, y: 3 } };
    expect(paireIsocele(rectIso)).not.toBeNull();
    expect(CIBLES[1].atteinte(rectIso)).toBe(false);
    expect(nature(rectIso).code).toBe('rectangle-isocele');
  });

  it('`cheminVers` rend `null` — et non un chemin faux — pour une cible impossible', () => {
    const equilateral = (t) => {
      const c = cotes(t);
      return c[0].carre === c[1].carre && c[1].carre === c[2].carre;
    };
    expect(cheminVers(TRIANGLE_DEPART, equilateral, 3)).toBeNull();
  });
});

describe('LA PASTILLE dit vrai', () => {
  it('un rectangle isocèle est annoncé comme les DEUX, pas comme l’un seulement', () => {
    const t = { A: { x: -5, y: 0 }, B: { x: 1, y: -3 }, C: { x: 4, y: 3 } };
    expect(nature(t)).toEqual({ code: 'rectangle-isocele', sommet: 'B', cotes: ['AB', 'BC'] });
    expect(natureTexte(t)).toBe('rectangle en B et isocèle (AB = BC)');
  });

  it('l’isocélie se décide sur les CARRÉS entiers, jamais sur l’affichage arrondi', () => {
    // t4 du module 5 : 10,296 et 10,440 s'affichent tous deux « 10,3 » et
    // « 10,44 » — proches à 1,4 %. Les carrés valent 106 et 109 : distincts.
    const t = SCENES.demontrer.triangles[3];
    const c = cotes(t);
    const carres = c.map((x) => x.carre).sort((a, b) => a - b);
    expect(carres).toEqual([61, 106, 109]);
    expect(paireIsocele(t)).toBeNull();
    expect(nature(t).code).toBe('quelconque');
    // Et l'écart des longueurs est bien invisible à l'œil :
    const L = c.map((x) => x.longueur).sort((a, b) => a - b);
    expect((L[2] - L[1]) / L[2]).toBeLessThan(0.015);
  });
});

describe('MODULE 2 — l’angle par le produit scalaire (P1)', () => {
  it('le cas AIGU : cos = 0,6 EXACTEMENT, et l’angle vaut 53,13°', () => {
    const { u, v } = SCENES.angle.aigu;
    expect(dot(u, v)).toBe(15);
    expect(norm(u)).toBe(5);
    expect(norm(v)).toBe(5);
    expect(cosAngle(u, v)).toBe(0.6);
    expect(angleVecteursDeg(u, v)).toBeCloseTo(53.13, 2);
    expect(fr(angleVecteursDeg(u, v))).toBe('53,13');
  });

  it('le cas DROIT : le produit est nul, donc le cosinus aussi, donc 90 exactement', () => {
    const { u, v } = SCENES.angle.droit;
    expect(dot(u, v)).toBe(0);
    expect(cosAngle(u, v)).toBe(0);
    expect(angleVecteursDeg(u, v)).toBe(90);
  });

  it('le cas OBTUS : cos = −0,8, l’angle dépasse 90° — le contre-exemple EXISTE', () => {
    // Sans lui, l'élève croirait que le produit scalaire ne mesure que les
    // angles aigus. La règle du contre-exemple visible : cet état est réel.
    const { u, v } = SCENES.angle.obtus;
    expect(dot(u, v)).toBe(-20);
    expect(cosAngle(u, v)).toBe(-0.8);
    expect(angleVecteursDeg(u, v)).toBeCloseTo(143.13, 2);
    expect(angleVecteursDeg(u, v)).toBeGreaterThan(90);
  });

  it('le signe du produit et la position par rapport à 90° sont toujours d’accord', () => {
    const u = { x: 4, y: 3 };
    for (const v of GRILLE) {
      if (v.x === 0 && v.y === 0) continue;
      const p = dot(u, v);
      const d = angleVecteursDeg(u, v);
      if (p > 0) expect(d).toBeLessThan(90);
      else if (p < 0) expect(d).toBeGreaterThan(90);
      else expect(d).toBe(90);
    }
  });

  it('`cosAngle` reste dans [−1 ; 1] partout : `acos` ne rend jamais NaN', () => {
    const u = { x: 3, y: -4 };
    for (const v of GRILLE) {
      if (v.x === 0 && v.y === 0) continue;
      const c = cosAngle(u, v);
      expect(c).toBeGreaterThanOrEqual(-1);
      expect(c).toBeLessThanOrEqual(1);
      expect(Number.isNaN(angleVecteursDeg(u, v))).toBe(false);
    }
    // Les colinéaires, là où l'arrondi mordrait : ±1 exactement.
    expect(cosAngle({ x: 3, y: -4 }, { x: 6, y: -8 })).toBe(1);
    expect(cosAngle({ x: 3, y: -4 }, { x: -6, y: 8 })).toBe(-1);
  });

  it('`angleEnDeg` mesure bien au SOMMET nommé, et non entre deux côtés au hasard', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 4, y: 0 };
    const C = { x: 0, y: 3 };
    expect(angleEnDeg(B, A, C)).toBe(90);
    expect(angleEnDeg(A, B, C)).toBeCloseTo(36.87, 2);
    expect(angleEnDeg(A, C, B)).toBeCloseTo(53.13, 2);
    // La somme des trois angles vaut 180° — le contrôle qui prouve qu'on ne
    // mesure pas trois fois la même chose.
    expect(angleEnDeg(B, A, C) + angleEnDeg(A, B, C) + angleEnDeg(A, C, B)).toBeCloseTo(180, 9);
  });
});

describe('MODULE 3 — les distances par le carré scalaire (P2)', () => {
  const { A, B, C } = SCENES.distances;

  it('les trois carrés scalaires sont les ENTIERS annoncés, dont un carré parfait', () => {
    expect(carreScalaire(vec(A, B))).toBe(25);
    expect(carreScalaire(vec(B, C))).toBe(20);
    expect(carreScalaire(vec(C, A))).toBe(37);
    // Au moins une longueur EXACTE, pour que l'élève ne croie pas la méthode
    // condamnée aux décimales.
    expect(longueurParScalaire(A, B)).toBe(5);
  });

  it('la longueur par le produit scalaire redonne EXACTEMENT la distance usuelle', () => {
    for (const P of GRILLE) {
      for (const Q of [A, B, C]) {
        expect(longueurParScalaire(P, Q)).toBeCloseTo(Math.hypot(Q.x - P.x, Q.y - P.y), 12);
      }
    }
  });

  it('Al-Kashi : AB = 7, AC = 5, Â = 60° donnent BC² = 39 exactement', () => {
    const { ab, ac, angleA } = SCENES.alKashi;
    expect(alKashiCarre(ab, ac, angleA)).toBeCloseTo(39, 9);
    // √39 = 6,2449979… : l'affichage à deux décimales rend « 6,24 » et NON
    // « 6,25 ». Un module qui écrirait 6,25 mentirait de deux centièmes par
    // rapport à ce que l'élève lit sous la figure. C'est le carré, 39, qui est
    // la valeur EXACTE — et c'est lui que la question demande.
    expect(fr(Math.sqrt(alKashiCarre(ab, ac, angleA)))).toBe('6,24');
  });

  it('Al-Kashi REDEVIENT Pythagore quand l’angle est droit — le contrôle du cas connu', () => {
    expect(alKashiCarre(3, 4, 90)).toBeCloseTo(25, 9);
    expect(alKashiCarre(5, 12, 90)).toBeCloseTo(169, 9);
  });

  it('Al-Kashi est cohérent avec les coordonnées sur le triangle du module', () => {
    // La promesse : les deux chemins (coordonnées ou théorème) donnent le même
    // nombre. Un écart signifierait que la leçon enseigne deux mathématiques.
    const parCoord = carreScalaire(vec(B, C));
    const parKashi = alKashiCarre(
      longueurParScalaire(A, B),
      longueurParScalaire(A, C),
      angleEnDeg(B, A, C),
    );
    expect(parKashi).toBeCloseTo(parCoord, 9);
  });
});

describe('MODULE 4 — l’équation sous forme normale (P3)', () => {
  const { P0, n, dessus, dehors } = SCENES.normale;
  const EQN = formeNormale(P0, n);

  it('la forme normale se développe en 3x + 4y + 5 = 0', () => {
    expect(EQN).toMatchObject({ a: 3, b: 4, c: 5 });
    expect(equationTexte(EQN)).toBe('3x + 4y + 5 = 0');
  });

  it('l’écriture factorisée est celle que le module montre', () => {
    expect(formeNormaleTexte(EQN)).toBe('3(x − 1) + 4(y + 2) = 0');
  });

  it('le point de base vérifie l’équation, le point de contrôle NON', () => {
    expect(verifieEquation(EQN, P0)).toBe(true);
    expect(verifieEquation(EQN, dessus)).toBe(true);
    expect(verifieEquation(EQN, dehors)).toBe(false);
  });

  it('le normal est bien ORTHOGONAL à la droite, en tout point de celle-ci', () => {
    // La promesse du module : n · P₀M = 0 pour TOUT M de la droite, et pour
    // aucun autre. Balayé sur toute la grille, pas échantillonné.
    for (const M of GRILLE) {
      const surLaDroite = verifieEquation(EQN, M);
      const produit = dot(n, vec(P0, M));
      expect(surLaDroite).toBe(produit === 0);
    }
  });

  it('la distance d’un point à la droite sort du même calcul : d(O, d) = 1', () => {
    expect(distancePointDroite(EQN, dehors)).toBe(1);
    expect(distancePointDroite(EQN, P0)).toBe(0);
    expect(distancePointDroite(EQN, dessus)).toBe(0);
  });

  it('les trois droites de l’étape 4 : bonne réponse et distracteurs vérifiés', () => {
    // e1 — P(2 ; −1), n(5 ; −3).
    const e1 = formeNormale({ x: 2, y: -1 }, { x: 5, y: -3 });
    expect(equationTexte(e1)).toBe('5x − 3y − 13 = 0');
    expect(verifieEquation({ a: 5, b: -3, c: 13 }, { x: 2, y: -1 })).toBe(false);

    // e2 — P(0 ; 4), n(1 ; 2).
    const e2 = formeNormale({ x: 0, y: 4 }, { x: 1, y: 2 });
    expect(equationTexte(e2)).toBe('x + 2y − 8 = 0');
    // Le distracteur « 2x + y − 4 = 0 » a échangé les coordonnées du normal :
    // il passe pourtant par P, ce qui en fait un piège CRÉDIBLE et non absurde.
    expect(verifieEquation({ a: 2, b: 1, c: -4 }, { x: 0, y: 4 })).toBe(true);
    expect(dot({ x: 2, y: 1 }, { x: 1, y: 2 })).not.toBe(0);

    // e3 — P(−3 ; 2), DIRECTEUR w(4 ; 1) : le normal est (−1 ; 4).
    const w = { x: 4, y: 1 };
    const nE3 = { x: -w.y, y: w.x };
    expect(nE3).toEqual({ x: -1, y: 4 });
    expect(dot(nE3, w)).toBe(0);
    const e3 = formeNormale({ x: -3, y: 2 }, nE3);
    expect(e3).toMatchObject({ a: -1, b: 4, c: -11 });
    // Écrite au signe près, comme le module la présente :
    expect(verifieEquation({ a: 1, b: -4, c: 11 }, { x: -3, y: 2 })).toBe(true);
    // Le piège « 4x + y + 10 = 0 » PASSE aussi par P — c'est la droite
    // PERPENDICULAIRE. Le module doit donc le corriger par la direction, pas
    // par le point : le premier jet le décrivait comme « ratant P », ce qui
    // était faux. Défaut attrapé ici.
    expect(verifieEquation({ a: 4, b: 1, c: 10 }, { x: -3, y: 2 })).toBe(true);
    expect(dot({ x: 4, y: 1 }, w)).not.toBe(0);
    // Le troisième distracteur, lui, rate bien le point.
    expect(verifieEquation({ a: 1, b: -4, c: -11 }, { x: -3, y: 2 })).toBe(false);
  });

  it('`equationTexte` n’écrit jamais « 1x », « + −4 » ni « + 0 »', () => {
    expect(equationTexte({ a: 1, b: -1, c: 0 })).toBe('x − y = 0');
    expect(equationTexte({ a: 0, b: 1, c: -4 })).toBe('y − 4 = 0');
    expect(equationTexte({ a: -1, b: 3, c: 2 })).toBe('−x + 3y + 2 = 0');
    expect(equationTexte({ a: 2, b: 0, c: 6 })).toBe('2x + 6 = 0');
  });
});

describe('MODULE 5 — démontrer (P4) et trancher la nature (P5)', () => {
  const { alignes, hauteur, triangles } = SCENES.demontrer;

  it('D, E, F sont ALIGNÉS — et le produit scalaire DE·DF ne vaut PAS 0', () => {
    // Le contre-exemple qui empêche de confondre les deux critères. Si DE·DF
    // valait 0, le module ne pourrait pas faire cette distinction.
    const { D, E, F } = alignes;
    expect(cross(vec(D, E), vec(D, F))).toBe(0);
    expect(areCollinear(D, E, F)).toBe(true);
    expect(dot(vec(D, E), vec(D, F))).toBe(26);
    expect(dot(vec(D, E), vec(D, F))).not.toBe(0);
  });

  it('(PH) EST la hauteur issue de P : PH · QR = 0 au bit près, et H est sur (QR)', () => {
    const { P, Q, R, H } = hauteur;
    expect(dot(vec(P, H), vec(Q, R))).toBe(0);
    expect(cross(vec(Q, H), vec(Q, R))).toBe(0);          // H appartient à (QR)
    expect(areCollinear(Q, H, R)).toBe(true);
    // Et H est STRICTEMENT entre Q et R : la hauteur tombe dans le triangle,
    // sans quoi la figure montrerait un pied hors du segment.
    const t = dot(vec(Q, H), vec(Q, R)) / carreScalaire(vec(Q, R));
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(1);
    expect(t).toBe(0.5);
    // P n'est pas sur (QR) : le triangle n'est pas aplati.
    expect(cross(vec(Q, P), vec(Q, R))).not.toBe(0);
  });

  it('les quatre triangles ont les natures annoncées, et elles sont TOUTES DIFFÉRENTES sauf la paire voulue', () => {
    const n = naturesDesTriangles();
    expect(n.map((t) => t.nature.code)).toEqual([
      'rectangle', 'quelconque', 'rectangle-isocele', 'quelconque',
    ]);
    expect(n[0].nature.sommet).toBe('B');
    expect(n[2].nature.sommet).toBe('B');
    expect(n[2].nature.cotes).toEqual(['AB', 'BC']);
  });

  it('LES DEUX TROMPE-L’ŒIL sont réellement indiscernables à l’œil', () => {
    // t2 : un angle à 88,99°, soit 1° d'écart au droit — invisible sur une
    // figure de 300 px. Si l'écart était de 40°, l'élève trancherait à vue et
    // n'aurait aucune raison de calculer.
    const t2 = triangles[1];
    const aC = angles(t2).find((a) => a.id === 'C');
    expect(aC.produit).toBe(1);
    expect(aC.deg).toBeGreaterThan(88);
    expect(aC.deg).toBeLessThan(90);
    expect(Math.abs(aC.deg - 90)).toBeLessThan(1.5);
    expect(sommetDroit(t2)).toBeNull();

    // t4 : deux côtés à 1,4 % l'un de l'autre — l'œil les croit égaux.
    const t4 = triangles[3];
    const L = cotes(t4).map((c) => c.longueur).sort((a, b) => a - b);
    expect(Math.abs(L[2] - L[1]) / L[2]).toBeLessThan(0.015);
    expect(paireIsocele(t4)).toBeNull();
  });

  it('chaque triangle du module tient DANS le cadre : rien n’est dessiné hors champ', () => {
    for (const t of triangles) {
      for (const s of SOMMETS) expect(dansLeCadre(t[s])).toBe(true);
      expect(estUnTriangle(t)).toBe(true);
    }
    for (const p of [...Object.values(alignes), ...Object.values(hauteur)]) {
      expect(dansLeCadre(p)).toBe(true);
    }
  });
});

describe('LES AFFIRMATIONS LITTÉRALES DES MODULES', () => {
  it('M1 — le triangle de l’étape 3 est à UN CRAN de l’angle droit, et le cran existe', () => {
    // Le module affirme : « déplace A d'une case vers la droite et la pastille
    // bascule ». Si le coup était refusé ou ne changeait pas la nature, il
    // mentirait — et c'est exactement ce que faisait le premier jet, qui
    // annonçait « remonte C d'une case » : ce coup mène à un produit de −4.
    const presque = { A: { x: -5, y: -3 }, B: { x: 2, y: 5 }, C: { x: 3, y: -2 } };
    const droit = deplacer(presque, 'A', 1, 0);
    expect(droit).not.toBe(presque);
    expect(droit.A).toEqual({ x: -4, y: -3 });
    // Et le coup NAÏF sur C ne donne PAS l'angle droit : c'est le piège évité.
    expect(sommetDroit(deplacer(presque, 'C', 0, 1))).toBeNull();
    expect(nature(presque).code).toBe('quelconque');
    // Ce cran-là rend le triangle rectangle ET isocèle en C — la pastille
    // annonce donc les deux, ce que le module dit désormais mot pour mot.
    expect(nature(droit).code).toBe('rectangle-isocele');
    expect(sommetDroit(droit)).toBe('C');
    expect(natureTexte(droit)).toBe('rectangle en C et isocèle (BC = CA)');
    // Et l'écart d'angle avant / après tient bien dans le degré annoncé.
    const avant = angles(presque).find((a) => a.id === 'C');
    const apres = angles(droit).find((a) => a.id === 'C');
    expect(avant.produit).toBe(1);
    expect(apres.produit).toBe(0);
    expect(Math.abs(avant.deg - 90)).toBeLessThan(1.5);
    expect(apres.deg).toBe(90);
    for (const s of SOMMETS) expect(dansLeCadre(droit[s])).toBe(true);
  });

  it('M1 — l’angle en A du triangle de départ s’affiche sans ambiguïté', () => {
    // La question de l'étape 1 demande de recopier ce nombre : il doit avoir
    // une écriture unique à deux décimales, et ne pas tomber sur un piège
    // d'arrondi (…,995).
    const aA = angles(TRIANGLE_DEPART).find((a) => a.id === 'A');
    expect(fr(aA.deg)).toBe('59,04');
    expect(parseSigned(fr(aA.deg))).toBeCloseTo(aA.deg, 2);
  });

  it('M3 — le côté AB du triangle de départ vaut EXACTEMENT 5, carré 25', () => {
    const ab = cotes(TRIANGLE_DEPART).find((c) => c.id === 'AB');
    expect(ab.carre).toBe(25);
    expect(ab.longueur).toBe(5);
  });

  it('M4 — les positions de M du cliquet restent toutes DANS le cadre', () => {
    // Le module promène M de t = −1 à t = 1 le long de la droite, et l'écarte
    // de −1 à +1 dans la direction du normal. Balayé, pas échantillonné : une
    // seule position hors cadre rendrait la figure fausse.
    // Bornes RÉELLES du module : t ∈ [−0,5 ; 1] et écart ∈ [−0,5 ; 0,5].
    // Le premier jet ouvrait t et l'écart sur [−1 ; 1], et le couple
    // (−1 ; −1) plaçait M en (2 ; −9) — hors du repère, rogné en silence.
    const { P0: p0, n: nn } = SCENES.normale;
    const dir = { x: -nn.y, y: nn.x };
    for (let t = -0.5; t <= 1.0001; t += 0.5) {
      for (let e = -0.5; e <= 0.5001; e += 0.5) {
        const M = {
          x: p0.x + dir.x * t + nn.x * e,
          y: p0.y + dir.y * t + nn.y * e,
        };
        expect(dansLeCadre(M)).toBe(true);
        // Et le produit n · P₀M est nul EXACTEMENT quand e vaut 0.
        const produit = dot(nn, vec(p0, M));
        if (Math.abs(e) < 1e-9) expect(produit).toBe(0);
        else expect(produit).not.toBe(0);
      }
    }
  });

  it('M5 — PQR est isocèle en P, ce que le module annonce en prime', () => {
    const { P, Q, R } = SCENES.demontrer.hauteur;
    expect(carreScalaire(vec(P, Q))).toBe(50);
    expect(carreScalaire(vec(P, R))).toBe(50);
    expect(nature({ A: P, B: Q, C: R }).code).toBe('isocele');
  });

  it('M5 — les quatre figures du tribunal tiennent dans le cadre à l’échelle réduite', () => {
    // Elles sont rendues à unit = 19 px, quatre par grille : chacune doit
    // rester entièrement dans le repère, sans quoi un sommet serait rogné.
    for (const t of SCENES.demontrer.triangles) {
      for (const s of SOMMETS) {
        expect(t[s].x).toBeGreaterThanOrEqual(RANGE.xMin);
        expect(t[s].x).toBeLessThanOrEqual(RANGE.xMax);
        expect(t[s].y).toBeGreaterThanOrEqual(RANGE.yMin);
        expect(t[s].y).toBeLessThanOrEqual(RANGE.yMax);
      }
    }
  });

  it('M5 — les quatre natures couvrent au moins trois cas différents', () => {
    // Quatre figures toutes de même nature ne feraient pas un tribunal.
    const codes = SCENES.demontrer.triangles.map((t) => nature(t).code);
    expect(new Set(codes).size).toBeGreaterThanOrEqual(3);
  });
});

describe('LE BOSS — chaque bonne réponse recalculée, chaque distracteur DISTINCT', () => {
  const distincts = (...v) => expect(new Set(v).size).toBe(v.length);

  it('e1 — cos de l’angle entre u(3 ; 4) et v(5 ; 0) : 0,6, distinct des pièges', () => {
    const u = { x: 3, y: 4 };
    const v = { x: 5, y: 0 };
    expect(dot(u, v)).toBe(15);
    expect(norm(u) * norm(v)).toBe(25);
    expect(cosAngle(u, v)).toBe(0.6);
    // Pièges : oublier de diviser (15), diviser par une seule norme (3), et
    // le cosinus de l'angle complémentaire (0,8).
    distincts(0.6, 15, 3, 0.8);
  });

  it('e2 — l’angle de cos 0,5 vaut 60° ; les pièges 30, 45 et 120 en diffèrent', () => {
    expect(Math.round((Math.acos(0.5) * 180) / Math.PI)).toBe(60);
    distincts(60, 30, 45, 120);
  });

  it('e3 — u(−2 ; 6) et v(4 ; 1) : produit −2, donc angle OBTUS', () => {
    const p = dot({ x: -2, y: 6 }, { x: 4, y: 1 });
    expect(p).toBe(-2);
    expect(p).toBeLessThan(0);
    expect(angleVecteursDeg({ x: -2, y: 6 }, { x: 4, y: 1 })).toBeGreaterThan(90);
  });

  it('e4 — AB·AB = 61 pour A(−2 ; 1) et B(3 ; −5) ; les pièges valent 11, 1 et 30', () => {
    const AB = vec({ x: -2, y: 1 }, { x: 3, y: -5 });
    expect(AB).toEqual({ x: 5, y: -6 });
    expect(carreScalaire(AB)).toBe(61);
    // 11 = somme des coordonnées mal signée, 1 = 5 + (−6), 30 = 5 × 6.
    distincts(61, 11, 1, 30);
  });

  it('e5 — BC² par Al-Kashi avec AB = 8, AC = 3, Â = 60° vaut 49, donc BC = 7', () => {
    const c2 = alKashiCarre(8, 3, 60);
    expect(c2).toBeCloseTo(49, 9);
    expect(Math.sqrt(c2)).toBeCloseTo(7, 9);
    // Pièges : Pythagore appliqué à tort (73), le double produit oublié (73)
    // et l'oubli de la racine (49 pris pour la longueur).
    expect(8 * 8 + 3 * 3).toBe(73);
    distincts(7, 73, 49, 11);
  });

  it('e6 — la forme normale de P(2 ; −1) et n(5 ; −3) est 5x − 3y − 13 = 0', () => {
    const eqn = formeNormale({ x: 2, y: -1 }, { x: 5, y: -3 });
    expect(eqn).toMatchObject({ a: 5, b: -3, c: -13 });
    expect(equationTexte(eqn)).toBe('5x − 3y − 13 = 0');
    // Le piège du signe de c : + 13 ne passe PAS par P.
    expect(verifieEquation({ a: 5, b: -3, c: 13 }, { x: 2, y: -1 })).toBe(false);
    // Le piège du normal pris pour directeur : −3x − 5y … ne passe pas non plus.
    expect(verifieEquation({ a: -3, b: -5, c: -13 }, { x: 2, y: -1 })).toBe(false);
  });

  it('e7 — la distance de M(1 ; 1) à 3x + 4y − 2 = 0 vaut 1', () => {
    expect(distancePointDroite({ a: 3, b: 4, c: -2 }, { x: 1, y: 1 })).toBe(1);
    // Pièges : oublier la division (5), diviser par a + b (5/7), le signe (−1).
    distincts(1, 5, 5 / 7, -1);
  });

  it('e8 — R, S, T alignés : le déterminant est nul et le produit scalaire ne l’est pas', () => {
    const R = { x: -2, y: -3 };
    const S = { x: 1, y: 1 };
    const T = { x: 4, y: 5 };
    expect(cross(vec(R, S), vec(R, T))).toBe(0);
    expect(dot(vec(R, S), vec(R, T))).toBe(50);
    expect(areCollinear(R, S, T)).toBe(true);
  });

  it('e9 — le triangle K(−4 ; 0) L(−1 ; −3) M(5 ; 3) est rectangle en L, et NON isocèle', () => {
    // Premier jet : K(−1 ; 2) L(3 ; 0) M(1 ; −4), annoncé « rectangle non
    // isocèle ». Il est en fait rectangle ISOCÈLE (KL² = LM² = 20), et la
    // bonne réponse de l'épreuve aurait été fausse. Le défaut vient de la
    // grille : KL = (4 ; −2) n'admet de perpendiculaire entière que le long
    // de (2 ; 4), de même carré 20 — l'isocélie y est forcée dans le cadre.
    const t = { A: { x: -4, y: 0 }, B: { x: -1, y: -3 }, C: { x: 5, y: 3 } };
    expect(dot(vec(t.B, t.A), vec(t.B, t.C))).toBe(0);
    expect(nature(t).code).toBe('rectangle');
    expect(nature(t).sommet).toBe('B');
    const c = cotes(t).map((x) => x.carre).sort((a, b) => a - b);
    expect(c).toEqual([18, 72, 90]);
    expect(new Set(c).size).toBe(3);
    // Et l'angle droit n'est PAS aligné sur les axes : il n'est pas lisible à l'œil.
    expect(vec(t.B, t.A)).toEqual({ x: -3, y: 3 });
    expect(vec(t.B, t.C)).toEqual({ x: 6, y: 6 });
  });

  it('e10 — le triangle U(0 ; 0) V(6 ; 2) W(2 ; 6) est isocèle SANS être rectangle', () => {
    const t = { A: { x: 0, y: 0 }, B: { x: 6, y: 2 }, C: { x: 2, y: 6 } };
    expect(carreScalaire(vec(t.A, t.B))).toBe(40);
    expect(carreScalaire(vec(t.A, t.C))).toBe(40);
    expect(carreScalaire(vec(t.B, t.C))).toBe(32);
    expect(sommetDroit(t)).toBeNull();
    expect(nature(t).code).toBe('isocele');
    expect(dot(vec(t.A, t.B), vec(t.A, t.C))).toBe(24);
  });
});

describe('écriture française et lecture des réponses', () => {
  it('fr utilise la virgule et le vrai signe moins, jamais « −0 »', () => {
    expect(fr(53.1301)).toBe('53,13');
    expect(fr(-0.8)).toBe('−0,8');
    expect(fr(0)).toBe('0');
    expect(fr(-0.001)).toBe('0');
    expect(fr(90)).toBe('90');
    expect(frVec({ x: 5, y: -6 })).toBe('(5 ; −6)');
  });

  it('parseSigned lit les NÉGATIFS et les DÉCIMAUX, avec le vrai signe moins', () => {
    // parseDec du noyau refuse « − » (U+2212) et parseFr refuse la virgule :
    // les réponses « −0,8 » et « 53,13 » ne valideraient jamais sans cette lecture.
    expect(parseSigned('−0,8')).toBe(-0.8);
    expect(parseSigned('-0.8')).toBe(-0.8);
    expect(parseSigned('53,13')).toBe(53.13);
    expect(parseSigned('61')).toBe(61);
    expect(parseSigned('+7')).toBe(7);
    expect(parseSigned(' 0 ')).toBe(0);
    expect(parseSigned('90°')).toBeNaN();
    expect(parseSigned('abc')).toBeNaN();
    expect(parseSigned('')).toBeNaN();
  });

  it('AUCUN nombre affiché par l’instrument n’est « −0 » ni « NaN »', () => {
    let t = TRIANGLE_DEPART;
    for (let i = 0; i < 60; i += 1) {
      t = deplacer(t, SOMMETS[i % 3], PAS[(i * 3) % 4].dx, PAS[(i * 3) % 4].dy);
      for (const a of angles(t)) {
        expect(fr(a.deg)).not.toBe('−0');
        expect(fr(a.deg)).not.toBe('?');
        expect(fr(a.produit)).not.toBe('−0');
      }
      for (const c of cotes(t)) {
        expect(fr(c.longueur)).not.toBe('?');
        expect(c.longueur).toBeGreaterThan(0);
      }
    }
  });
});


/**
 * ─────────────────────────────────────────────────────────────────────────
 * LE GLISSER (règle utilisateur du 2026-09-10)
 *
 * Ce laboratoire portait le patron EXACT que la règle proscrit : choisir un
 * sommet avec un bouton, puis le pousser aux flèches. Les sommets se
 * saisissent désormais. Ce qui suit verrouille les gardes de la pose absolue —
 * elles ne sont PAS celles du cliquet, parce qu'un doigt saute là où un cran
 * passait par les positions intermédiaires.
 * ─────────────────────────────────────────────────────────────────────────
 */
describe('le glisser — saisir un sommet et le poser', () => {
  const T = TRIANGLE_DEPART;

  it('poser AIMANTE sur la grille ENTIÈRE — condition de l’angle droit EXACT', () => {
    // C'est une condition de VÉRITÉ : le produit scalaire de deux vecteurs
    // entiers est un entier, donc nul au bit près ou pas nul. Un sommet posé
    // en 2,4 rendrait « rectangle » indécidable.
    for (let x = -3; x <= 3; x += 0.1) {
      for (let y = -3; y <= 3; y += 0.5) {
        const u = poser(T, 'A', x, y);
        if (u === T) continue;
        expect(Number.isInteger(u.A.x)).toBe(true);
        expect(Number.isInteger(u.A.y)).toBe(true);
      }
    }
  });

  it('poser REFUSE le hors-cadre, et rend le MÊME objet — jamais un changement silencieux', () => {
    for (const [x, y] of [[99, 0], [0, 99], [-99, 0], [0, -99], [7, 7]]) {
      expect(poser(T, 'A', x, y)).toBe(T);
    }
  });

  it('poser REFUSE le triangle APLATI — la garde propre au glisser', () => {
    // UN DOIGT SAUTE, LÀ OÙ UN CRAN PASSAIT. Le cliquet ne pouvait atteindre
    // un alignement qu'en s'y arrêtant ; le glisser peut viser directement un
    // point de la droite (BC). Sans cette garde, la figure dégénérerait en
    // segment et les trois angles perdraient leur sens.
    const surBC = { x: (T.B.x + T.C.x) / 2, y: (T.B.y + T.C.y) / 2 };
    if (Number.isInteger(surBC.x) && Number.isInteger(surBC.y)) {
      expect(poser(T, 'A', surBC.x, surBC.y)).toBe(T);
    }
    // Et par balayage : aucune pose acceptée ne rend un triangle aplati.
    for (let x = RANGE.xMin; x <= RANGE.xMax; x += 1) {
      for (let y = RANGE.yMin; y <= RANGE.yMax; y += 1) {
        for (const s of SOMMETS) {
          const u = poser(T, s, x, y);
          if (u !== T) expect(estUnTriangle(u)).toBe(true);
        }
      }
    }
  });

  it('poser est PURE : elle ne mute jamais le triangle reçu', () => {
    const avant = JSON.stringify(T);
    poser(T, 'A', 0, 0);
    poser(T, 'B', 3, 3);
    expect(JSON.stringify(T)).toBe(avant);
  });

  it('poser un sommet SUR LUI-MÊME ne change rien', () => {
    for (const s of SOMMETS) expect(poser(T, s, T[s].x, T[s].y)).toBe(T);
  });

  it('sommetLePlusProche attrape bien le sommet visé, et il est DÉTERMINISTE', () => {
    // Saisir un sommet, c'est le choisir : c'est ce qui remplace l'onglet.
    for (const s of SOMMETS) {
      expect(sommetLePlusProche(T, T[s].x, T[s].y)).toBe(s);
      // Et à un quart de case du sommet, on l'attrape encore.
      expect(sommetLePlusProche(T, T[s].x + 0.25, T[s].y - 0.25)).toBe(s);
    }
    // En cas d'égalité parfaite, l'ordre de SOMMETS tranche — pas le hasard.
    const milieu = { x: (T.A.x + T.B.x) / 2, y: (T.A.y + T.B.y) / 2 };
    const r1 = sommetLePlusProche(T, milieu.x, milieu.y);
    const r2 = sommetLePlusProche(T, milieu.x, milieu.y);
    expect(r1).toBe(r2);
  });

  it('LES CIBLES DU MODULE restent atteignables au doigt, en une seule pose', () => {
    // L'invariant d'atteignabilité : chaque triangle visé par le module doit
    // pouvoir être ATTEINT, et le glisser ne doit pas le rendre plus difficile
    // que le cliquet. On vérifie qu'on y va sommet par sommet, en posant.
    for (const cible of CIBLES) {
      const but = cible.triangle ?? cible.but;
      if (!but) continue;
      let t = TRIANGLE_DEPART;
      for (const s of SOMMETS) {
        const suivant = poser(t, s, but[s].x, but[s].y);
        // Une pose peut être refusée si elle aplatit TEMPORAIREMENT la figure ;
        // dans ce cas l'ordre des sommets suffit à l'éviter.
        if (suivant !== t) t = suivant;
      }
      // Au moins un ordre de pose mène au but : on l'atteint en deux passes.
      for (const s of SOMMETS) {
        const suivant = poser(t, s, but[s].x, but[s].y);
        if (suivant !== t) t = suivant;
      }
      for (const s of SOMMETS) {
        expect(t[s]).toEqual({ x: but[s].x, y: but[s].y });
      }
    }
  });

  it('la ZONE DE PRÉHENSION d’un sommet tient LARGEMENT le plancher de 14 px', () => {
    const repere = { range: RANGE, unit: 26, xStep: 1, yStep: 1, labelEvery: 2 };
    const px = prehensionPx(repere, 1, 'x');
    expect(px).toBeGreaterThanOrEqual(PLANCHER_PX);
    expect(px).toBeCloseTo(24.5, 1);
  });
});
