import { describe, it, expect } from 'vitest';
import {
  arrondi, fr, dist, milieu, angleEn, aire,
  cotes, angles, sommetLePlusDroit, estRectangle, hypotenuseDe,
  carreSurCote, troisCarres, bilanAires,
  puzzlePreuve, hypotenuse, coteAngleDroit, encadrer, verdict,
  assertScope4e, surLeCercle, A_DEFAUT, B_DEFAUT, TRIPLETS,
} from './pythagore4e';
import * as mod from './pythagore4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('ne connaît AUCUNE géométrie dans l’espace (objet de 3e)', () => {
    expect(mod.dist3).toBeUndefined();
    expect(mod.diagonaleDuPave).toBeUndefined();
  });

  it('n’expose NI Thalès NI trigonométrie (objets de 3e)', () => {
    expect(mod.thales).toBeUndefined();
    expect(mod.cos).toBeUndefined();
    expect(mod.sinus).toBeUndefined();
    expect(mod.tangente).toBeUndefined();
  });

  it('n’expose ni produit ni quotient de racines (objets de 3e)', () => {
    expect(mod.produitRacines).toBeUndefined();
    expect(mod.simplifierRacine).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    for (const s of ['espace', 'thales', 'trigonometrie', 'racine-produit']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
    expect(assertScope4e('reciproque')).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA FIGURE NE MENT JAMAIS
   ══════════════════════════════════════════════════════════════════════ */
describe('Le triangle contraint au cercle EST rectangle, partout', () => {
  it('pour TOUT point du cercle de diamètre [AB], l’angle en C vaut 90°', () => {
    // Balayage complet du cercle, pas trois positions choisies.
    for (let deg = 5; deg < 175; deg += 5) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const T = { A: A_DEFAUT, B: B_DEFAUT, C };
      expect(angles(T).C, `θ = ${deg}°`).toBeCloseTo(90, 6);
      expect(estRectangle(T), `θ = ${deg}°`).toBe(true);
    }
  });

  it('l’hypoténuse est le côté OPPOSÉ à l’angle droit — et c’est [AB]', () => {
    for (const deg of [20, 60, 90, 140]) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const h = hypotenuseDe({ A: A_DEFAUT, B: B_DEFAUT, C });
      expect(h.opposeA, `θ = ${deg}°`).toBe('C');
      expect(h.longueur).toBeCloseTo(dist(A_DEFAUT, B_DEFAUT), 6);
    }
  });

  it('un triangle NON rectangle n’a pas d’hypoténuse — la fonction le dit', () => {
    const T = { A: { x: 0, y: 0 }, B: { x: 10, y: 0 }, C: { x: 5, y: 2 } };
    expect(estRectangle(T)).toBe(false);
    expect(hypotenuseDe(T)).toBeNull();
  });
});

describe('Les trois carrés, mesurés sur les points dessinés', () => {
  it('chaque carré a bien quatre côtés égaux et une aire égale au carré du côté', () => {
    for (const deg of [15, 45, 75, 120, 160]) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      for (const c of troisCarres({ A: A_DEFAUT, B: B_DEFAUT, C })) {
        const [P, Q, R, S] = c.sommets;
        expect(dist(P, Q)).toBeCloseTo(c.longueur, 6);
        expect(dist(Q, R)).toBeCloseTo(c.longueur, 6);
        expect(dist(R, S)).toBeCloseTo(c.longueur, 6);
        expect(dist(S, P)).toBeCloseTo(c.longueur, 6);
        expect(c.aire).toBeCloseTo(c.longueur ** 2, 4);
      }
    }
  });

  it('les carrés sont construits À L’EXTÉRIEUR : aucun ne recouvre le triangle', () => {
    for (const deg of [15, 45, 75, 120, 160]) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const T = { A: A_DEFAUT, B: B_DEFAUT, C };
      const G = { x: (T.A.x + T.B.x + T.C.x) / 3, y: (T.A.y + T.B.y + T.C.y) / 3 };
      for (const c of troisCarres(T)) {
        // Le centre du carré est de l'autre côté du côté par rapport au
        // centre de gravité du triangle.
        const centreCarre = c.sommets.reduce(
          (acc, p) => ({ x: acc.x + p.x / 4, y: acc.y + p.y / 4 }), { x: 0, y: 0 }
        );
        const m = milieu(c.p, c.q);
        const versCarre = { x: centreCarre.x - m.x, y: centreCarre.y - m.y };
        const versTriangle = { x: G.x - m.x, y: G.y - m.y };
        expect(versCarre.x * versTriangle.x + versCarre.y * versTriangle.y, `θ=${deg}`).toBeLessThan(0);
      }
    }
  });

  it('L’ÉGALITÉ DES AIRES TIENT pour toutes les formes du triangle rectangle', () => {
    for (let deg = 10; deg < 170; deg += 5) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const b = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C });
      expect(b.equilibre, `θ = ${deg}°, écart ${b.ecart}`).toBe(true);
      expect(b.grand.aire).toBeCloseTo(b.somme, 4);
    }
  });

  it('…et se ROMPT dès que l’angle n’est plus droit — dans les deux sens', () => {
    const O = milieu(A_DEFAUT, B_DEFAUT);
    const r = dist(A_DEFAUT, B_DEFAUT) / 2;
    // Un C plus proche du centre → angle obtus ; plus loin → angle aigu.
    const obtus = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r * 0.5 } };
    const aigu = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r * 1.6 } };
    expect(angles(obtus).C).toBeGreaterThan(90);
    expect(angles(aigu).C).toBeLessThan(90);
    expect(bilanAires(obtus).equilibre).toBe(false);
    expect(bilanAires(aigu).equilibre).toBe(false);
    // Et les écarts sont de SIGNES opposés : c'est ce que la jauge montre.
    expect(bilanAires(obtus).ecart * bilanAires(aigu).ecart).toBeLessThan(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE DÉCOUPAGE DE PERIGAL — il doit PAVER, pas approcher
   ══════════════════════════════════════════════════════════════════════ */
describe('le puzzle de la preuve : quatre triangles, et c² au milieu', () => {
  const CAS = [[3, 4], [4, 3], [5, 12], [6, 8], [1, 1], [2, 7], [9, 12], [0.5, 3.25]];

  const dansPolygone = (pt, poly) => {
    let dedans = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
      const p = poly[i];
      const q = poly[j];
      if ((p.y > pt.y) !== (q.y > pt.y)
        && pt.x < ((q.x - p.x) * (pt.y - p.y)) / (q.y - p.y) + p.x) dedans = !dedans;
    }
    return dedans;
  };

  it('LE TROU DU MILIEU EST UN CARRÉ DE CÔTÉ c — c’est toute la découverte', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      expect(z.carreIncline.cote, `${a},${b}`).toBeCloseTo(z.cote, 9);
      expect(z.carreIncline.aire).toBeCloseTo(a * a + b * b, 9);
      // et c'est bien un CARRÉ : quatre côtés égaux
      const S = z.carreIncline.sommets;
      const cotes = S.map((p, i) => dist(p, S[(i + 1) % 4]));
      for (const l of cotes) expect(l).toBeCloseTo(z.cote, 9);
    }
  });

  it('les quatre pièces SONT le triangle de départ, à l’identique', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      expect(z.pieces).toHaveLength(4);
      for (const t of z.pieces) {
        expect(t.aire, `${a},${b}`).toBeCloseTo((a * b) / 2, 9);
        const [P, Q, R] = t.sommets;
        const l = [dist(P, Q), dist(Q, R), dist(R, P)].sort((x, y) => x - y);
        const attendu = [a, b, Math.sqrt(a * a + b * b)].sort((x, y) => x - y);
        for (let i = 0; i < 3; i += 1) expect(l[i]).toBeCloseTo(attendu[i], 9);
      }
    }
  });

  it('le cadre a pour côté a + b, et tout y tient exactement', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      expect(z.cadre).toBeCloseTo(a + b, 9);
      expect(z.aireTotale).toBeCloseTo((a + b) ** 2, 9);
    }
  });

  it('AUCUN sommet ne sort du cadre', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      for (const p of [...z.pieces, z.carreIncline]) {
        for (const s of p.sommets) {
          expect(s.x, `${a},${b}`).toBeGreaterThanOrEqual(-1e-9);
          expect(s.y).toBeGreaterThanOrEqual(-1e-9);
          expect(s.x).toBeLessThanOrEqual(z.cadre + 1e-9);
          expect(s.y).toBeLessThanOrEqual(z.cadre + 1e-9);
        }
      }
    }
  });

  it('AUCUNE paire de pièces ne se chevauche — le carré central compris', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      const tout = [...z.pieces, { id: 'centre', sommets: z.carreIncline.sommets }];
      for (let i = 0; i < tout.length; i += 1) {
        const P = tout[i];
        const g = P.sommets.reduce(
          (acc, s) => ({ x: acc.x + s.x / P.sommets.length, y: acc.y + s.y / P.sommets.length }),
          { x: 0, y: 0 }
        );
        const echantillons = [g, ...P.sommets.map((s) => ({ x: g.x + (s.x - g.x) * 0.6, y: g.y + (s.y - g.y) * 0.6 }))];
        for (let j = 0; j < tout.length; j += 1) {
          if (i === j) continue;
          for (const pt of echantillons) {
            expect(dansPolygone(pt, tout[j].sommets), `${a},${b} : ${P.id} déborde dans ${tout[j].id}`).toBe(false);
          }
        }
      }
    }
  });

  it('L’IDENTITÉ SE LIT SUR LA FIGURE : (a+b)² = 4×(ab/2) + c²', () => {
    for (const [a, b] of CAS) {
      const z = puzzlePreuve(a, b);
      const quatreTriangles = z.pieces.reduce((s, p) => s + p.aire, 0);
      expect(quatreTriangles + z.carreIncline.aire, `${a},${b}`).toBeCloseTo((a + b) ** 2, 9);
      expect(quatreTriangles).toBeCloseTo(2 * a * b, 9);
      // d'où a² + b² = c², par simple soustraction de 2ab
      expect((a + b) ** 2 - quatreTriangles).toBeCloseTo(a * a + b * b, 9);
    }
  });

  it('le cas a = b fonctionne aussi (le carré du milieu est simplement tourné de 45°)', () => {
    const z = puzzlePreuve(1, 1);
    expect(z.carreIncline.aire).toBeCloseTo(2, 9);
    expect(z.pieces).toHaveLength(4);
  });

  it('refuse un côté nul ou négatif', () => {
    expect(() => puzzlePreuve(0, 4)).toThrow(/strictement positifs/);
    expect(() => puzzlePreuve(3, -1)).toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES CALCULS DE LONGUEUR
   ══════════════════════════════════════════════════════════════════════ */
describe('hypotenuse et coteAngleDroit', () => {
  it('les triplets pythagoriciens de la leçon tombent JUSTE', () => {
    for (const { a, b, c } of TRIPLETS) {
      const h = hypotenuse(a, b);
      expect(h.valeur, `${a},${b}`).toBe(c);
      expect(h.exacte).toBe(true);
      expect(h.carre).toBe(c * c);
    }
  });

  it('un cas qui ne tombe pas juste est ENCADRÉ, pas arrondi en silence', () => {
    const h = hypotenuse(2, 3); // √13
    expect(h.exacte).toBe(false);
    expect(h.encadrement).toEqual({ bas: 3, haut: 4, exact: false });
    expect(h.valeur).toBeCloseTo(Math.sqrt(13), 10);
  });

  it('le côté de l’angle droit se retrouve par soustraction', () => {
    for (const { a, b, c } of TRIPLETS) {
      expect(coteAngleDroit(c, a).valeur, `${c},${a}`).toBeCloseTo(b, 9);
      expect(coteAngleDroit(c, b).valeur).toBeCloseTo(a, 9);
    }
  });

  it('REFUSE un côté plus grand que l’hypoténuse — mathématiquement impossible', () => {
    expect(() => coteAngleDroit(5, 5)).toThrow(/plus grand côté/);
    expect(() => coteAngleDroit(5, 7)).toThrow();
  });

  it('encadrer donne les deux entiers consécutifs, et signale le cas exact', () => {
    expect(encadrer(49)).toEqual({ bas: 7, haut: 7, exact: true });
    expect(encadrer(50)).toEqual({ bas: 7, haut: 8, exact: false });
    expect(encadrer(0)).toEqual({ bas: 0, haut: 0, exact: true });
    expect(() => encadrer(-1)).toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   RÉCIPROQUE ET CONTRAPOSÉE
   ══════════════════════════════════════════════════════════════════════ */
describe('verdict — décider SANS figure, à partir de trois longueurs', () => {
  it('reconnaît un triangle rectangle, quel que soit l’ORDRE des longueurs', () => {
    for (const { a, b, c } of TRIPLETS) {
      for (const ordre of [[a, b, c], [c, a, b], [b, c, a], [c, b, a]]) {
        const v = verdict(...ordre);
        expect(v.rectangle, ordre.join(',')).toBe(true);
        expect(v.plusGrand).toBe(c);
      }
    }
  });

  it('DÉTECTE un triangle qui n’est pas rectangle, et dit dans quel sens', () => {
    const obtus = verdict(3, 4, 6);   // 9 + 16 = 25 < 36
    expect(obtus.rectangle).toBe(false);
    expect(obtus.raison).toMatch(/obtus/);
    const aigu = verdict(4, 5, 6);    // 16 + 25 = 41 > 36
    expect(aigu.rectangle).toBe(false);
    expect(aigu.raison).toMatch(/aigus/);
  });

  it('LE PIÈGE « a + b = c » ne trompe pas le verdict', () => {
    // 3 + 4 = 7 : l'élève qui additionne les longueurs conclurait « rectangle »
    // pour (3, 4, 7) — or ce triangle n'existe même pas.
    const v = verdict(3, 4, 7);
    expect(v.rectangle).toBe(false);
    expect(v.existe).toBe(false);
  });

  it('signale un triplet qui ne forme AUCUN triangle', () => {
    expect(verdict(1, 2, 10).existe).toBe(false);
    expect(verdict(3, 4, 5).existe).toBe(true);
  });

  it('les deux membres affichés sont ceux que l’élève doit calculer', () => {
    const v = verdict(5, 12, 13);
    expect(v.membreGauche).toBe(169);
    expect(v.membreDroit).toBe(169);
    expect(v.egaux).toBe(true);
  });

  it('refuse une longueur nulle ou négative', () => {
    expect(() => verdict(0, 4, 5)).toThrow(/strictement positives/);
  });
});

describe('Les écritures', () => {
  it('fr utilise la virgule décimale', () => {
    expect(fr(7.5)).toBe('7,5');
    expect(fr(13)).toBe('13');
  });

  it('arrondi coupe au centième par défaut', () => {
    expect(arrondi(3.14159)).toBe(3.14);
    expect(arrondi(3.14159, 4)).toBe(3.1416);
  });
});
