/**
 * LES PROMESSES DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « les deux afficheurs montrent
 * toujours le même nombre », « à l'angle droit ils tombent à 0 exactement »,
 * « l'ombre devient négative en angle obtus », « ces deux vecteurs sont
 * orthogonaux ». Ce sont des CONTENUS PÉDAGOGIQUES : si le comportement réel
 * diffère, la leçon ment — et `geometry2d` ne l'attrape pas, il vérifie que
 * `dot` est juste, pas qu'un module dit vrai en le citant.
 *
 * PÉRIMÈTRE : aucun test ne mentionne le théorème d'Al-Kashi, les formules de
 * polarisation, le cercle ni l'équation normale d'une droite : c'est la leçon
 * « Produit scalaire : mesurer et démontrer ».
 */
import { describe, it, expect } from 'vitest';
import {
  U_LAB, R_LAB, PAS_DEG, CRANS, CRANS_DROITS, RANGE, SCENES,
  vAuCran, angleAuCran, ombreSignee, piedOmbre, produitParOmbre,
  produitCoordonnees, produitParAngle, lesDeuxCoincident, angleVecteursDeg,
  sontOrthogonaux, symetrie, homogeneite, additivite,
  normalDe, equationCartesienne, estSurLaDroite, directeurDeEquation,
  equationTexte, verdictsOrthogonalite,
  fr, frVec, parseSigned, norm, dot, add, scale, dist, kAimante,
} from './scalaireUtils';
import { prehensionPx, PLANCHER_PX } from '../../../prehension';

const TOUS_LES_CRANS = Array.from({ length: CRANS }, (_, k) => k);

describe('le cliquet — CIBLE ATTEIGNABLE', () => {
  it('le pas divise 90° : l’angle droit tombe exactement sur un cran', () => {
    expect(90 % PAS_DEG).toBe(0);
    expect(CRANS).toBe(24);
    expect(CRANS_DROITS).toEqual([6, 18]);
    // Et il est atteint depuis le DÉPART (k = 0) en un nombre entier de crans.
    for (const k of CRANS_DROITS) expect(Number.isInteger(k)).toBe(true);
  });

  it('au cran 0, v est confondu avec u en direction, et l’angle vaut 0°', () => {
    const v = vAuCran(0);
    expect(v.x).toBeCloseTo(U_LAB.x * (R_LAB / norm(U_LAB)), 12);
    expect(v.y).toBeCloseTo(U_LAB.y * (R_LAB / norm(U_LAB)), 12);
    expect(angleAuCran(0)).toBe(0);
  });

  it('v garde une longueur constante à TOUS les crans — balayé', () => {
    for (const k of TOUS_LES_CRANS) expect(norm(vAuCran(k))).toBeCloseTo(R_LAB, 12);
  });

  it('l’angle du cran est exactement k × 15°, replié dans [0 ; 180]', () => {
    for (const k of TOUS_LES_CRANS) {
      expect(angleAuCran(k)).toBeCloseTo(angleVecteursDeg(U_LAB, vAuCran(k)), 9);
    }
    expect(angleAuCran(6)).toBe(90);
    expect(angleAuCran(12)).toBe(180);
    expect(angleAuCran(18)).toBe(90);
  });

  it('le cliquet boucle : le cran 24 ramène exactement au cran 0', () => {
    expect(vAuCran(24)).toEqual(vAuCran(0));
    expect(vAuCran(-1)).toEqual(vAuCran(23));
  });

  it('u = (4 ; 3) a pour norme EXACTEMENT 5 — pas de racine à afficher', () => {
    expect(norm(U_LAB)).toBe(5);
  });
});

describe('module 1 — LES DEUX AFFICHEURS MONTRENT LE MÊME NOMBRE', () => {
  it('BALAYÉ, pas échantillonné : à chacun des 24 crans, ombre et coordonnées coïncident', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      expect(lesDeuxCoincident(U_LAB, v, 1e-12)).toBe(true);
      expect(produitParOmbre(U_LAB, v)).toBeCloseTo(produitCoordonnees(U_LAB, v), 12);
    }
  });

  it('l’écart entre les deux recettes reste INVISIBLE à l’affichage (2 décimales)', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      expect(fr(produitParOmbre(U_LAB, v))).toBe(fr(produitCoordonnees(U_LAB, v)));
    }
  });

  it('AUX CRANS DROITS, les DEUX afficheurs valent 0 AU BIT PRÈS — pas « arrondi à 0 »', () => {
    // C'est la promesse littérale du module 1. Une construction naïve par
    // cos/sin donnerait 1,78 × 10⁻¹⁵ ici : le zéro serait un arrondi, et
    // `sontOrthogonaux` un jugement de tolérance au lieu d'un fait.
    for (const k of CRANS_DROITS) {
      const v = vAuCran(k);
      expect(produitCoordonnees(U_LAB, v)).toBe(0);
      expect(produitParOmbre(U_LAB, v)).toBe(0);
      expect(ombreSignee(U_LAB, v)).toBe(0);
      expect(sontOrthogonaux(U_LAB, v)).toBe(true);
    }
  });

  it('aux crans droits, v est à coordonnées ENTIÈRES — le quart de tour est exact', () => {
    expect(vAuCran(6)).toEqual({ x: -3, y: 4 });
    expect(vAuCran(12)).toEqual({ x: -4, y: -3 });
    expect(vAuCran(18)).toEqual({ x: 3, y: -4 });
  });

  it('LE SIGNE DE L’OMBRE est correct : négatif dès que l’angle dépasse 90°', () => {
    // La contrainte critique : une longueur géométrique serait toujours
    // positive et la figure contredirait le second afficheur.
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      const angle = angleAuCran(k);
      const s = ombreSignee(U_LAB, v);
      if (angle < 90 - 1e-9) expect(s).toBeGreaterThan(0);
      else if (angle > 90 + 1e-9) expect(s).toBeLessThan(0);
      else expect(s).toBe(0);
    }
  });

  it('il existe des crans obtus atteignables : l’affirmation « négative à l’opposé » a un état réel', () => {
    const obtus = TOUS_LES_CRANS.filter((k) => angleAuCran(k) > 90);
    expect(obtus.length).toBeGreaterThan(0);
    for (const k of obtus) expect(produitCoordonnees(U_LAB, vAuCran(k))).toBeLessThan(0);
  });

  it('le PIED de l’ombre est bien sur la droite portée par u, et la projection est orthogonale', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      const p = piedOmbre(U_LAB, v);
      // Le pied est aligné avec l'origine et u …
      expect(Math.abs(U_LAB.x * p.y - U_LAB.y * p.x)).toBeLessThan(1e-9);
      // … et (v − pied) est orthogonal à u : c'est la définition du projeté.
      expect(Math.abs(dot(U_LAB, { x: v.x - p.x, y: v.y - p.y }))).toBeLessThan(1e-9);
      // La distance signée du pied à l'origine EST l'ombre signée.
      const signe = dot(U_LAB, p) >= 0 ? 1 : -1;
      expect(signe * dist({ x: 0, y: 0 }, p)).toBeCloseTo(ombreSignee(U_LAB, v), 9);
    }
  });

  it('SÉCURITÉ DE MISE EN PAGE : v et le pied de l’ombre restent DANS le cadre, à tous les crans', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      const p = piedOmbre(U_LAB, v);
      for (const q of [v, p]) {
        expect(q.x).toBeGreaterThanOrEqual(RANGE.xMin - 1e-9);
        expect(q.x).toBeLessThanOrEqual(RANGE.xMax + 1e-9);
        expect(q.y).toBeGreaterThanOrEqual(RANGE.yMin - 1e-9);
        expect(q.y).toBeLessThanOrEqual(RANGE.yMax + 1e-9);
      }
    }
    // u lui-même tient aussi dans le cadre.
    expect(U_LAB.x).toBeLessThanOrEqual(RANGE.xMax);
    expect(U_LAB.y).toBeLessThanOrEqual(RANGE.yMax);
  });

  it('SÉCURITÉ DE MISE EN PAGE : u et v se SUPERPOSENT à certains crans — d’où la légende DOM', () => {
    // C'est la justification exécutable du choix « étiquettes en légende DOM,
    // jamais en <text> SVG » : au cran 0 les deux flèches sont confondues,
    // et deux noms posés à côté d'elles se chevaucheraient nécessairement.
    const v0 = vAuCran(0);
    expect(angleVecteursDeg(U_LAB, v0)).toBeCloseTo(0, 9);
    const proches = TOUS_LES_CRANS.filter((k) => angleAuCran(k) <= PAS_DEG);
    expect(proches.length).toBeGreaterThanOrEqual(3);
  });
});

describe('module 2 — les deux formules donnent le même produit', () => {
  it('‖u‖ × ‖v‖ × cos(angle) = x_u·x_v + y_u·y_v, à tous les crans', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      expect(produitParAngle(U_LAB, v)).toBeCloseTo(produitCoordonnees(U_LAB, v), 9);
    }
  });

  it('la scène du module 2 : u = (3 ; 1), v = (2 ; 4) donne u·v = 10 par les DEUX voies', () => {
    const { u, v } = SCENES.nommer;
    expect(produitCoordonnees(u, v)).toBe(10);
    expect(produitParAngle(u, v)).toBeCloseTo(10, 9);
    expect(produitParOmbre(u, v)).toBeCloseTo(10, 9);
    // Les normes citées par le module.
    expect(norm(u)).toBeCloseTo(Math.sqrt(10), 12);
    expect(norm(v)).toBeCloseTo(Math.sqrt(20), 12);
    // L'angle cité, arrondi au degré.
    expect(Math.round(angleVecteursDeg(u, v))).toBe(45);
  });

  it('deux vecteurs de même sens donnent un produit égal au produit des normes', () => {
    const u = { x: 3, y: 4 };
    const v = { x: 6, y: 8 };
    expect(produitCoordonnees(u, v)).toBe(norm(u) * norm(v));
    expect(angleVecteursDeg(u, v)).toBeCloseTo(0, 9);
  });

  it('u·u = ‖u‖² — le cas particulier cité par le module 2', () => {
    for (const u of [U_LAB, SCENES.nommer.u, { x: -2, y: 5 }]) {
      expect(produitCoordonnees(u, u)).toBeCloseTo(norm(u) ** 2, 9);
    }
    expect(produitCoordonnees(U_LAB, U_LAB)).toBe(25);
  });
});

describe('module 3 — symétrie et bilinéarité, CONSTATÉES sur les données du module', () => {
  const { u, v, w, k } = SCENES.proprietes;

  it('symétrie : u·v = v·u, sur la scène du module et sur tous les crans', () => {
    const s = symetrie(u, v);
    expect(s.gauche).toBe(s.droite);
    expect(s.gauche).toBe(11); // 3×1 + 2×4
    for (const kk of TOUS_LES_CRANS) {
      const vv = vAuCran(kk);
      const t = symetrie(U_LAB, vv);
      expect(t.gauche).toBe(t.droite);
    }
  });

  it('homogénéité : (k·u)·v = k·(u·v), pour la scène et pour k de −3 à 3', () => {
    const h = homogeneite(k, u, v);
    expect(h.gauche).toBeCloseTo(h.droite, 12);
    expect(k).toBe(2);
    expect(h.droite).toBe(22); // 2 × 11
    for (let kk = -3; kk <= 3; kk += 0.5) {
      const hh = homogeneite(kk, u, v);
      expect(hh.gauche).toBeCloseTo(hh.droite, 12);
    }
  });

  it('additivité : u·(v + w) = u·v + u·w, sur la scène du module', () => {
    const a = additivite(u, v, w);
    expect(a.gauche).toBeCloseTo(a.droite, 12);
    // Les trois nombres que le module affiche côte à côte.
    expect(dot(u, v)).toBe(11);
    expect(dot(u, w)).toBe(4);      // 3×2 + 2×(−1)
    expect(dot(u, add(v, w))).toBe(15);
    expect(add(v, w)).toEqual({ x: 3, y: 3 });
  });

  it('SÉCURITÉ DE MISE EN PAGE : TOUTE flèche du module 3, k·u compris, tient dans le cadre', () => {
    // Ce balayage a attrapé un vrai défaut : avec k = 3, k·u valait (9 ; 6)
    // pour un cadre qui s'arrête à 6 — la flèche de l'homogénéité sortait du
    // repère. k a été ramené à 2, et non le dessin bricolé après coup.
    // Les flèches réellement dessinées par le module 3.
    for (const q of [u, v, w, add(v, w), scale(u, k)]) {
      expect(Math.abs(q.x)).toBeLessThanOrEqual(RANGE.xMax);
      expect(Math.abs(q.y)).toBeLessThanOrEqual(RANGE.yMax);
    }
    // Et la raison pour laquelle c'est u — et non v — que le module étire :
    // 2v = (2 ; 8) sortirait du cadre. Le choix du vecteur étiré n'est donc
    // pas arbitraire, il est CONTRAINT, et ce test l'empêche de dériver.
    expect(Math.abs(scale(v, k).y)).toBeGreaterThan(RANGE.yMax);
  });
});

describe('module 4 — l’orthogonalité est un CALCUL, pas une impression', () => {
  it('les quatre couples ont le verdict que le module annonce', () => {
    const v = verdictsOrthogonalite();
    expect(v.map((c) => c.produit)).toEqual([0, 1, -1, 0]);
    expect(v.map((c) => c.orthogonaux)).toEqual([true, false, false, true]);
  });

  it('LES DEUX IMPOSTEURS SONT INDISCERNABLES À L’ŒIL — sinon le module serait malhonnête', () => {
    // Si les couples non orthogonaux étaient à 42°, l'élève trancherait à vue
    // et n'aurait aucune raison de calculer : la leçon se saborderait.
    const v = verdictsOrthogonalite();
    for (const c of v.filter((x) => !x.orthogonaux)) {
      const a = angleVecteursDeg(c.u, c.v);
      expect(Math.abs(a - 90)).toBeGreaterThan(0);      // vraiment pas droit
      expect(Math.abs(a - 90)).toBeLessThan(5);          // et pourtant invisible
    }
    // Et les deux vrais sont exactement droits, au bit près.
    for (const c of v.filter((x) => x.orthogonaux)) {
      expect(c.produit).toBe(0);
      expect(angleVecteursDeg(c.u, c.v)).toBeCloseTo(90, 12);
    }
  });

  it('les quatre couples tiennent dans le cadre — figure lisible pour chacun', () => {
    for (const c of SCENES.orthogonalite) {
      for (const q of [c.u, c.v]) {
        expect(Math.abs(q.x)).toBeLessThanOrEqual(RANGE.xMax);
        expect(Math.abs(q.y)).toBeLessThanOrEqual(RANGE.yMax);
      }
    }
  });

  it('un vecteur nul n’est déclaré orthogonal à rien : le critère resterait vrai pour tout', () => {
    expect(sontOrthogonaux({ x: 0, y: 0 }, { x: 3, y: 1 })).toBe(false);
    expect(sontOrthogonaux({ x: 3, y: 1 }, { x: 0, y: 0 })).toBe(false);
  });

  it('le critère fonctionne pour une flèche VERTICALE — là où les pentes échouent', () => {
    // Une comparaison de coefficients directeurs donnerait ici Infinity.
    expect(sontOrthogonaux({ x: 0, y: 5 }, { x: 7, y: 0 })).toBe(true);
    expect(dot({ x: 0, y: 5 }, { x: 7, y: 0 })).toBe(0);
  });

  it('orthogonal ⟺ angle de 90°, balayé sur le cliquet', () => {
    for (const k of TOUS_LES_CRANS) {
      const v = vAuCran(k);
      expect(sontOrthogonaux(U_LAB, v)).toBe(Math.abs(angleAuCran(k) - 90) < 1e-9);
    }
  });
});

describe('module 5 — le vecteur normal et l’équation de la droite', () => {
  const { A, directeur } = SCENES.normal;

  it('le normal est orthogonal au directeur, au bit près', () => {
    const n = normalDe(directeur);
    expect(n).toEqual({ x: 1, y: 3 });
    expect(dot(n, directeur)).toBe(0);
    expect(sontOrthogonaux(n, directeur)).toBe(true);
  });

  it('l’équation citée par le module est x + 3y − 7 = 0, et A y appartient', () => {
    const n = normalDe(directeur);
    const eqn = equationCartesienne(A, n);
    expect(eqn).toEqual({ a: 1, b: 3, c: -7 });
    expect(equationTexte(eqn)).toBe('x + 3y − 7 = 0');
    expect(estSurLaDroite(eqn, A)).toBe(true);
  });

  it('tout point de la droite reste sur la droite quand on avance selon le directeur', () => {
    const n = normalDe(directeur);
    const eqn = equationCartesienne(A, n);
    for (let t = -3; t <= 3; t += 0.25) {
      const M = add(A, scale(directeur, t));
      expect(estSurLaDroite(eqn, M)).toBe(true);
      // Et AM est bien orthogonal au normal : c'est la caractérisation.
      expect(Math.abs(dot(n, { x: M.x - A.x, y: M.y - A.y }))).toBeLessThan(1e-9);
    }
  });

  it('un point HORS de la droite est rejeté — le critère discrimine vraiment', () => {
    const eqn = equationCartesienne(A, normalDe(directeur));
    for (const M of [{ x: 0, y: 0 }, { x: 1, y: 3 }, { x: -2, y: 2 }]) {
      expect(estSurLaDroite(eqn, M)).toBe(false);
    }
  });

  it('le directeur relu depuis l’équation est orthogonal au normal', () => {
    for (const eqn of [
      { a: 3, b: -2, c: 6 }, { a: 2, b: 5, c: -10 },
      { a: 1, b: 4, c: -9 }, { a: 4, b: -1, c: 3 }, { a: 0, b: 2, c: 8 },
    ]) {
      const w = directeurDeEquation(eqn);
      expect(dot({ x: eqn.a, y: eqn.b }, w)).toBe(0);
    }
  });

  it('SÉCURITÉ DE MISE EN PAGE : les 7 positions de M du module 5 tiennent dans le cadre', () => {
    // BALAYÉ, pas échantillonné : le cliquet va de t = −1,5 à t = 1,5 par pas
    // de 0,5. Une borne trop large enverrait M hors du repère et le module
    // afficherait un point invisible.
    const n = normalDe(directeur);
    const eqn = equationCartesienne(A, n);
    let positions = 0;
    for (let t = -1.5; t <= 1.5 + 1e-9; t += 0.5) {
      const M = add(A, scale(directeur, t));
      positions += 1;
      expect(Math.abs(M.x)).toBeLessThanOrEqual(RANGE.xMax);
      expect(Math.abs(M.y)).toBeLessThanOrEqual(RANGE.yMax);
      // Et LA PROMESSE du module : n · AM reste nul à chaque cran.
      expect(dot(n, { x: M.x - A.x, y: M.y - A.y })).toBe(0);
      expect(estSurLaDroite(eqn, M)).toBe(true);
    }
    expect(positions).toBe(7);
    // Les deux flèches posées en A tiennent aussi dans le cadre.
    for (const q of [add(A, n), add(A, directeur)]) {
      expect(Math.abs(q.x)).toBeLessThanOrEqual(RANGE.xMax);
      expect(Math.abs(q.y)).toBeLessThanOrEqual(RANGE.yMax);
    }
  });

  it('module 4 étape 2 : A(1 ; −2), B(4 ; 2), C(−3 ; 1) — l’angle en A est droit', () => {
    const P = { x: 1, y: -2 };
    const Q = { x: 4, y: 2 };
    const R = { x: -3, y: 1 };
    const PQ = { x: Q.x - P.x, y: Q.y - P.y };
    const PR = { x: R.x - P.x, y: R.y - P.y };
    expect(PQ).toEqual({ x: 3, y: 4 });
    expect(PR).toEqual({ x: -4, y: 3 });
    expect(dot(PQ, PR)).toBe(0);
    expect(sontOrthogonaux(PQ, PR)).toBe(true);
    // Le piège cité par explainFor : multiplier les coordonnées des POINTS.
    expect(dot(Q, R)).toBe(-10);
    expect(dot(Q, R)).not.toBe(0);
    // Les trois points et les deux flèches tiennent dans le cadre.
    for (const q of [P, Q, R]) {
      expect(Math.abs(q.x)).toBeLessThanOrEqual(RANGE.xMax);
      expect(Math.abs(q.y)).toBeLessThanOrEqual(RANGE.yMax);
    }
  });

  it('module 4 étape 3 : les quatre verdicts annoncés sont exacts', () => {
    const paires = [
      [{ x: 2, y: 6 }, { x: -3, y: 1 }, true],
      [{ x: 5, y: 1 }, { x: 1, y: 5 }, false],
      [{ x: 0, y: 4 }, { x: 7, y: 0 }, true],
      [{ x: 3, y: -2 }, { x: 4, y: 6 }, true],
    ];
    for (const [a, b, attendu] of paires) expect(sontOrthogonaux(a, b)).toBe(attendu);
    expect(dot({ x: 5, y: 1 }, { x: 1, y: 5 })).toBe(10);
  });

  it('module 2 étape 4 : les trois énoncés de tri donnent les nombres cités', () => {
    expect(dot({ x: 2, y: 5 }, { x: -1, y: 3 })).toBe(13);
    const P = { x: 1, y: 0 };
    const Q = { x: 4, y: 2 };
    const R = { x: 0, y: 3 };
    const PQ = { x: Q.x - P.x, y: Q.y - P.y };
    const PR = { x: R.x - P.x, y: R.y - P.y };
    expect(PQ).toEqual({ x: 3, y: 2 });
    expect(PR).toEqual({ x: -1, y: 3 });
    expect(dot(PQ, PR)).toBe(3);
  });

  it('module 5 étape 3 : les trois normaux lus dans une équation', () => {
    for (const [eqn, normal] of [
      [{ a: 2, b: 5, c: -10 }, { x: 2, y: 5 }],
      [{ a: 3, b: -2, c: 6 }, { x: 3, y: -2 }],
      [{ a: 0, b: 1, c: -4 }, { x: 0, y: 1 }],
    ]) {
      expect({ x: eqn.a, y: eqn.b }).toEqual(normal);
      expect(dot(normal, directeurDeEquation(eqn))).toBe(0);
    }
    // « y = 4 » réécrite : 0x + 1y − 4 = 0.
    expect(equationTexte({ a: 0, b: 1, c: -4 })).toBe('y − 4 = 0');
  });

  it('la seconde droite du module : n = (−4 ; 2), équation −4x + 2y − 10 = 0', () => {
    const { A: A2, directeur: w2 } = SCENES.normal.autre;
    const n2 = normalDe(w2);
    expect(n2).toEqual({ x: -4, y: 2 });
    const eqn2 = equationCartesienne(A2, n2);
    expect(eqn2).toEqual({ a: -4, b: 2, c: -10 });
    expect(estSurLaDroite(eqn2, A2)).toBe(true);
  });

  it('equationTexte n’écrit jamais « 1x », « + −4 » ni « + 0 »', () => {
    expect(equationTexte({ a: 1, b: 1, c: 0 })).toBe('x + y = 0');
    expect(equationTexte({ a: -1, b: 3, c: 5 })).toBe('−x + 3y + 5 = 0');
    expect(equationTexte({ a: 2, b: 0, c: -6 })).toBe('2x − 6 = 0');
    expect(equationTexte({ a: 0, b: -1, c: 4 })).toBe('−y + 4 = 0');
    expect(equationTexte({ a: 3, b: -2, c: 0 })).toBe('3x − 2y = 0');
  });
});

describe('les distracteurs du boss sont NUMÉRIQUEMENT distincts de la bonne réponse', () => {
  it('e1 — u(5 ; −2) · v(3 ; 4) : les QUATRE options proposées sont deux à deux distinctes', () => {
    const u = { x: 5, y: -2 };
    const v = { x: 3, y: 4 };
    const bonne = dot(u, v);                          // 15 − 8 = 7
    const piegeProduitCroise = u.x * v.y + u.y * v.x; // 20 − 6 = 14
    const piegeMoins = u.x * v.x - u.y * v.y;         // 15 + 8 = 23
    const piegeSomme = u.x + u.y + v.x + v.y;         // 10
    expect([bonne, piegeProduitCroise, piegeMoins, piegeSomme]).toEqual([7, 14, 23, 10]);
    expect(new Set([bonne, piegeProduitCroise, piegeMoins, piegeSomme]).size).toBe(4);
  });

  it('e2 — ‖u‖ = 4, ‖v‖ = 3, angle 60° : le piège est d’oublier le cosinus', () => {
    const bonne = 4 * 3 * Math.cos(Math.PI / 3);   // 6
    const piegeSansCos = 4 * 3;                    // 12
    const piegeSomme = 4 + 3;                      // 7
    const piegeSin = 4 * 3 * Math.sin(Math.PI / 3);
    expect(bonne).toBeCloseTo(6, 12);
    for (const p of [piegeSansCos, piegeSomme, piegeSin]) {
      expect(Math.abs(p - bonne)).toBeGreaterThan(0.5);
    }
  });

  it('e3 — u(2 ; −5) · v(−4 ; 1) : le signe compte', () => {
    const bonne = dot({ x: 2, y: -5 }, { x: -4, y: 1 });  // −8 − 5 = −13
    expect(bonne).toBe(-13);
    const pieges = [13, -3, 3];   // signe inversé, soustraction, les deux
    for (const p of pieges) expect(p).not.toBe(bonne);
  });

  it('e5 — (2u)·v vaut 2(u·v), et le piège 4(u·v) vient de doubler DEUX fois', () => {
    const u = { x: 3, y: 2 };
    const v = { x: 1, y: 4 };
    const base = dot(u, v);            // 11
    const bonne = dot(scale(u, 2), v); // 22
    expect(base).toBe(11);
    expect(bonne).toBe(22);
    expect(new Set([bonne, 4 * base, base, base + 2]).size).toBe(4);
  });

  it('e7 — UN SEUL des quatre couples est orthogonal, et les trois autres sont distincts', () => {
    const u = { x: 6, y: 4 };
    const options = [{ x: -2, y: 3 }, { x: 2, y: 3 }, { x: 3, y: -2 }, { x: 4, y: 6 }];
    const produits = options.map((v) => dot(u, v));
    expect(produits).toEqual([0, 24, 10, 48]);
    // Exactement UNE bonne réponse : sans cela l'épreuve serait ambiguë.
    expect(produits.filter((p) => p === 0)).toHaveLength(1);
    expect(sontOrthogonaux(u, options[0])).toBe(true);
    for (const v of options.slice(1)) expect(sontOrthogonaux(u, v)).toBe(false);
  });

  it('e4 — un produit scalaire NÉGATIF impose un angle obtus, jamais l’inverse', () => {
    // L'affirmation de l'épreuve, vérifiée sur tout le cliquet.
    for (let k = 0; k < CRANS; k += 1) {
      const v = vAuCran(k);
      const p = produitCoordonnees(U_LAB, v);
      if (p < 0) expect(angleAuCran(k)).toBeGreaterThan(90);
      if (p > 0) expect(angleAuCran(k)).toBeLessThan(90);
    }
  });

  it('e6 — A(2 ; 1), B(5 ; 3), C(0 ; 4) : AB(3 ; 2), AC(−2 ; 3), produit nul', () => {
    const P = { x: 2, y: 1 };
    const Q = { x: 5, y: 3 };
    const R = { x: 0, y: 4 };
    const PQ = { x: Q.x - P.x, y: Q.y - P.y };
    const PR = { x: R.x - P.x, y: R.y - P.y };
    expect(PQ).toEqual({ x: 3, y: 2 });
    expect(PR).toEqual({ x: -2, y: 3 });
    expect(dot(PQ, PR)).toBe(0);
  });

  it('e8 — ‖u‖ = 5 donne u·u = 25, distinct de 5, 10 et 0', () => {
    const u = { x: 4, y: 3 };
    expect(norm(u)).toBe(5);
    expect(dot(u, u)).toBe(25);
    expect(new Set([25, 5, 10, 0]).size).toBe(4);
  });

  it('e9 — la droite 2x + 5y − 10 = 0 : le normal est (2 ; 5), pas le directeur', () => {
    const eqn = { a: 2, b: 5, c: -10 };
    const n = { x: eqn.a, y: eqn.b };
    const w = directeurDeEquation(eqn);            // (−5 ; 2)
    expect(w).toEqual({ x: -5, y: 2 });
    expect(dot(n, w)).toBe(0);
    // Le distracteur classique : prendre (−5 ; 2) pour le normal.
    expect(dot(w, w)).not.toBe(0);
    // Un autre : (5 ; 2), ni normal ni directeur.
    expect(dot({ x: 5, y: 2 }, w)).not.toBe(0);
  });

  it('e10 — droite par A(3 ; −1) de normal (4 ; −1) : 4x − y − 13 = 0', () => {
    const eqn = equationCartesienne({ x: 3, y: -1 }, { x: 4, y: -1 });
    expect(eqn).toEqual({ a: 4, b: -1, c: -13 });
    expect(equationTexte(eqn)).toBe('4x − y − 13 = 0');
    // Le piège du signe de c : + 13 ne passe PAS par A.
    expect(estSurLaDroite({ a: 4, b: -1, c: 13 }, { x: 3, y: -1 })).toBe(false);
  });
});

describe('écriture française et lecture des réponses', () => {
  it('fr utilise la virgule et le vrai signe moins, jamais « −0 »', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(-13)).toBe('−13');
    expect(fr(0)).toBe('0');
    expect(fr(-0.001)).toBe('0');
    expect(frVec({ x: 4, y: -3 })).toBe('(4 ; −3)');
  });

  it('parseSigned lit les NÉGATIFS, avec le vrai signe moins comme avec le tiret', () => {
    // parseDec du noyau refuse « − » (U+2212) : la moitié des réponses de
    // cette leçon ne validerait jamais sans cette lecture maison.
    expect(parseSigned('−13')).toBe(-13);
    expect(parseSigned('-13')).toBe(-13);
    expect(parseSigned('−2,5')).toBe(-2.5);
    expect(parseSigned('7')).toBe(7);
    expect(parseSigned('+7')).toBe(7);
    expect(parseSigned(' 0 ')).toBe(0);
    expect(parseSigned('abc')).toBeNaN();
    expect(parseSigned('')).toBeNaN();
  });
});


/**
 * ─────────────────────────────────────────────────────────────────────────
 * LE GLISSER (règle utilisateur du 2026-09-10)
 *
 * L'extrémité de v se SAISIT et tourne autour de l'origine. L'enjeu propre à
 * ce laboratoire : le glisser ne doit PAS détruire l'exactitude au bit près du
 * produit scalaire à l'angle droit, qui est sa promesse centrale.
 * ─────────────────────────────────────────────────────────────────────────
 */
describe('le glisser — faire tourner v par son extrémité', () => {
  it('kAimante rend TOUJOURS un cran entier de [0 ; CRANS[', () => {
    for (let a = -720; a <= 720; a += 3) {
      const t = (a * Math.PI) / 180;
      const k = kAimante(Math.cos(t) * R_LAB, Math.sin(t) * R_LAB);
      expect(Number.isInteger(k)).toBe(true);
      expect(k).toBeGreaterThanOrEqual(0);
      expect(k).toBeLessThan(CRANS);
    }
  });

  it('chaque cran est ATTEIGNABLE : un doigt posé sur le bout de v rend son cran', () => {
    for (let k = 0; k < CRANS; k += 1) {
      const v = vAuCran(k);
      expect(kAimante(v.x, v.y, k)).toBe(k);
    }
  });

  it('L’ANGLE DROIT RESTE EXACT AU BIT PRÈS après un glisser', () => {
    // LA PROMESSE CENTRALE DU LABORATOIRE. Le doigt ne tombe jamais pile sur
    // le cran : on le pose donc À CÔTÉ (± 6°, moins d'un demi-cran) et l'on
    // exige que le produit scalaire vaille 0 EXACTEMENT, et non « à peu près ».
    // C'est ce que garantit le fait de rendre un CRAN et non des coordonnées.
    for (const kDroit of CRANS_DROITS) {
      const vDroit = vAuCran(kDroit);
      for (const derive of [-6, -3, 0, 3, 6]) {
        const t = (derive * Math.PI) / 180;
        // On fait dériver le doigt autour du bout exact.
        const x = vDroit.x * Math.cos(t) - vDroit.y * Math.sin(t);
        const y = vDroit.x * Math.sin(t) + vDroit.y * Math.cos(t);
        const k = kAimante(x, y, kDroit);
        expect(k).toBe(kDroit);
        // 0 au bit près : `toBe`, pas `toBeCloseTo`.
        expect(produitCoordonnees(U_LAB, vAuCran(k))).toBe(0);
        expect(angleAuCran(k)).toBe(90);
      }
    }
  });

  it('un doigt lâché sur l’origine GARDE le cran courant, au lieu de sauter', () => {
    // À l'origine la direction n'est pas définie : sauter au cran 0 ferait
    // bondir la flèche sans que l'élève l'ait demandé.
    for (const k of [0, 5, 6, 17]) expect(kAimante(0, 0, k)).toBe(k);
  });

  it('l’aimantation est STABLE : réaimanter un cran ne le déplace pas', () => {
    for (let k = 0; k < CRANS; k += 1) {
      const v = vAuCran(kAimante(vAuCran(k).x, vAuCran(k).y, k));
      expect(kAimante(v.x, v.y, k)).toBe(k);
    }
  });

  it('la ZONE DE PRÉHENSION angulaire tient LARGEMENT le plancher de 14 px', () => {
    // Ici le cran n'est pas une largeur mais un ARC : deux crans voisins
    // écartent le bout de v de la corde d'un angle de 15° sur un rayon de 5.
    const repere = { range: RANGE, unit: 28, xStep: 1, yStep: 1, labelEvery: 2 };
    const corde = 2 * R_LAB * Math.sin((PAS_DEG * Math.PI) / 360);
    const px = prehensionPx(repere, corde, 'x');
    expect(px).toBeGreaterThanOrEqual(PLANCHER_PX);
    expect(px).toBeCloseTo(32.3, 1);
  });
});
