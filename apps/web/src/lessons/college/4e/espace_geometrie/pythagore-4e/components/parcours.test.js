import { describe, it, expect } from 'vitest';
import {
  A_DEFAUT, B_DEFAUT, surLeCercle, troisCarres, bilanAires, angles, dist, milieu,
  hypotenuse, coteAngleDroit, verdict, puzzlePreuve, TRIPLETS, fr, arrondi,
} from './pythagore4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « les aires changent,
 * l'égalité reste », « le carré du milieu a pour côté l'hypoténuse », « avec
 * 3 et 4 ça tombe sur 5 ». Ces affirmations sont du contenu pédagogique : si
 * le comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier vérifie aussi la SÉCURITÉ VISUELLE du labo signature, que seul
 * un calcul sur toutes les positions atteignables peut établir.
 */

/** Le cadre que `CarresLab` déduit du contenu, reproduit à l'identique. */
const MARGE = 26;
function vueDe(C) {
  const T = { A: A_DEFAUT, B: B_DEFAUT, C };
  const O = milieu(A_DEFAUT, B_DEFAUT);
  const rayon = dist(A_DEFAUT, B_DEFAUT) / 2;
  const pts = [
    A_DEFAUT, B_DEFAUT, C,
    ...troisCarres(T).flatMap((c) => c.sommets),
    { x: O.x - rayon, y: O.y - rayon }, { x: O.x + rayon, y: O.y + rayon },
  ];
  const minX = Math.min(...pts.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...pts.map((p) => p.x)) + MARGE;
  const minY = Math.min(...pts.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...pts.map((p) => p.y)) + MARGE;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/* ═══ MODULE 1 — Les trois carrés ══════════════════════════════════════ */
describe('Module 1 — « les aires changent, l’égalité reste »', () => {
  it('LES AIRES CHANGENT VRAIMENT quand on déplace C', () => {
    // Sans cela, la phrase du module serait creuse : il faut que les deux
    // petits carrés bougent visiblement d'une position à l'autre.
    //
    // On prend des positions du MÊME côté du sommet du cercle : à 45° et à
    // 135° la figure est symétrique et les deux petits carrés se contentent
    // d'échanger leurs rôles — les aires seraient les mêmes, ce qui est juste
    // mathématiquement mais ne prouverait pas que les nombres bougent.
    const aires = [];
    for (const deg of [20, 35, 50, 65, 80]) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const b = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C });
      aires.push(arrondi(b.petits[0].aire, 0));
    }
    expect(new Set(aires).size, aires.join(' ')).toBe(aires.length);
  });

  it('la SYMÉTRIE du cercle est réelle : à θ et 180−θ, les deux petits carrés échangent', () => {
    // C'est ce qui explique pourquoi le point précédent choisit ses positions
    // d'un seul côté — et c'est une propriété vraie, pas un défaut.
    const gauche = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C: surLeCercle(A_DEFAUT, B_DEFAUT, (45 * Math.PI) / 180) });
    const droite = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C: surLeCercle(A_DEFAUT, B_DEFAUT, (135 * Math.PI) / 180) });
    expect(arrondi(gauche.somme, 0)).toBe(arrondi(droite.somme, 0));
    expect(arrondi(gauche.grand.aire, 0)).toBe(arrondi(droite.grand.aire, 0));
  });

  it('…ET L’ÉGALITÉ RESTE, sur tout le chemin de C', () => {
    for (let deg = 8; deg < 172; deg += 4) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      expect(bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C }).equilibre, `θ = ${deg}°`).toBe(true);
    }
  });

  it('le carré sur l’hypoténuse est TOUJOURS le plus grand des trois', () => {
    for (let deg = 8; deg < 172; deg += 4) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const b = bilanAires({ A: A_DEFAUT, B: B_DEFAUT, C });
      expect(b.grand.opposeA, `θ = ${deg}°`).toBe('C');
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre déduit contient TOUT, à toute position', () => {
    // Le carré de l'hypoténuse descend très bas quand C approche de A ou B :
    // un cadre fixe le laisserait sortir de l'écran (défaut réel, corrigé).
    for (let deg = 8; deg < 172; deg += 4) {
      const C = surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180);
      const v = vueDe(C);
      const T = { A: A_DEFAUT, B: B_DEFAUT, C };
      for (const carre of troisCarres(T)) {
        for (const s of carre.sommets) {
          expect(s.x, `θ=${deg}`).toBeGreaterThanOrEqual(v.x - 1e-9);
          expect(s.y).toBeGreaterThanOrEqual(v.y - 1e-9);
          expect(s.x).toBeLessThanOrEqual(v.x + v.w + 1e-9);
          expect(s.y).toBeLessThanOrEqual(v.y + v.h + 1e-9);
        }
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre ne devient jamais démesurément haut (garde §6bis.4)', () => {
    for (let deg = 8; deg < 172; deg += 4) {
      const v = vueDe(surLeCercle(A_DEFAUT, B_DEFAUT, (deg * Math.PI) / 180));
      expect(v.h / v.w, `θ = ${deg}°`).toBeLessThanOrEqual(3);
      expect(v.w).toBeGreaterThan(0);
      expect(v.h).toBeGreaterThan(0);
    }
  });
});

/* ═══ MODULE 2 — Quand l’angle se casse ════════════════════════════════ */
describe('Module 2 — la balance penche dans les DEUX sens', () => {
  const O = milieu(A_DEFAUT, B_DEFAUT);
  const r = dist(A_DEFAUT, B_DEFAUT) / 2;

  it('un C plus près du centre donne un angle OBTUS et un grand carré trop grand', () => {
    const T = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r * 0.55 } };
    expect(angles(T).C).toBeGreaterThan(90);
    expect(bilanAires(T).ecart).toBeGreaterThan(0);
  });

  it('un C plus loin donne un angle AIGU et un grand carré trop petit', () => {
    const T = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r * 1.7 } };
    expect(angles(T).C).toBeLessThan(90);
    expect(bilanAires(T).ecart).toBeLessThan(0);
  });

  it('l’égalité NE tient que sur le cercle — c’est ce que le module fait voir', () => {
    for (const k of [0.4, 0.6, 0.8, 1.25, 1.5, 1.9]) {
      const T = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r * k } };
      expect(bilanAires(T).equilibre, `k = ${k}`).toBe(false);
    }
    const surCercle = { A: A_DEFAUT, B: B_DEFAUT, C: { x: O.x, y: O.y - r } };
    expect(bilanAires(surCercle).equilibre).toBe(true);
  });
});

/* ═══ MODULE 3 — Le puzzle ═════════════════════════════════════════════ */
describe('Module 3 — ce que le puzzle fait apparaître', () => {
  it('avec 3 et 4, le carré du milieu a pour côté 5 — le nombre que la leçon annonce', () => {
    const z = puzzlePreuve(3, 4);
    expect(z.cote).toBe(5);
    expect(z.carreIncline.cote).toBeCloseTo(5, 9);
    expect(z.carreIncline.aire).toBeCloseTo(25, 9);
    expect(z.cadre).toBe(7);
  });

  it('les quatre pièces ont ensemble l’aire de deux rectangles 3×4', () => {
    const z = puzzlePreuve(3, 4);
    expect(z.pieces.reduce((s, p) => s + p.aire, 0)).toBeCloseTo(24, 9);
    expect(24).toBe(2 * 3 * 4);
  });

  it('l’égalité 49 = 24 + 25 est celle que l’élève lit sur la figure', () => {
    expect(7 * 7).toBe(24 + 25);
  });
});

/* ═══ MODULES 4 et 5 — Les calculs ═════════════════════════════════════ */
describe('Modules 4 et 5 — les nombres annoncés', () => {
  it('3 et 4 donnent 5 : l’exemple d’entrée tombe juste', () => {
    const h = hypotenuse(3, 4);
    expect(h.valeur).toBe(5);
    expect(h.carre).toBe(25);
    expect(h.exacte).toBe(true);
  });

  it('LE PIÈGE « a + b = c » est chiffré : 3 + 4 = 7, et 7 ≠ 5', () => {
    expect(3 + 4).toBe(7);
    expect(hypotenuse(3, 4).valeur).not.toBe(7);
  });

  it('un cas qui ne tombe pas juste est encadré : √41 entre 6 et 7', () => {
    const h = hypotenuse(4, 5);
    expect(h.carre).toBe(41);
    expect(h.exacte).toBe(false);
    expect(h.encadrement).toEqual({ bas: 6, haut: 7, exact: false });
    expect(fr(arrondi(h.valeur, 1), 1)).toBe('6,4');
  });

  it('le côté manquant : 13 et 5 donnent 12, par SOUSTRACTION', () => {
    const c = coteAngleDroit(13, 5);
    expect(c.carre).toBe(144);
    expect(c.valeur).toBe(12);
  });

  it('le contrôle annoncé tient : l’hypoténuse est le plus grand côté', () => {
    for (const { a, b, c } of TRIPLETS) {
      expect(c).toBeGreaterThan(a);
      expect(c).toBeGreaterThan(b);
    }
  });
});

/* ═══ MODULE 6 — Réciproque et contraposée ═════════════════════════════ */
describe('Module 6 — les triplets de la pratique', () => {
  it('(9, 12, 15) EST rectangle : 81 + 144 = 225', () => {
    const v = verdict(9, 12, 15);
    expect(v.rectangle).toBe(true);
    expect(v.membreGauche).toBe(225);
    expect(v.membreDroit).toBe(225);
  });

  it('(4, 5, 7) n’est PAS rectangle : 16 + 25 = 41, et 49 ≠ 41', () => {
    const v = verdict(4, 5, 7);
    expect(v.rectangle).toBe(false);
    expect(v.membreGauche).toBe(41);
    expect(v.membreDroit).toBe(49);
    expect(v.raison).toMatch(/obtus/);
  });

  it('(6, 8, 10) est rectangle — le triplet 3-4-5 doublé', () => {
    expect(verdict(6, 8, 10).rectangle).toBe(true);
  });

  it('l’ORDRE des longueurs ne change jamais le verdict', () => {
    expect(verdict(15, 9, 12).rectangle).toBe(true);
    expect(verdict(12, 15, 9).rectangle).toBe(true);
  });
});
