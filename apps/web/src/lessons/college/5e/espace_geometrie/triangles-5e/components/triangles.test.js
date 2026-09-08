import { describe, it, expect } from 'vitest';
import {
  sommeAngles, troisiemeAngle, natureDe, diagnostiquerCotes, triangleDe,
  mediatrice, circumcenter, rayonCirconscrit, ecartRayons, hauteur, mediane,
  airesSepareesParMediane, recollageAngles, polygonArea, dist, midpoint,
  triangleAngles, lineInter,
} from './triangles';

const P = (x, y) => ({ x, y });
const close = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

/** Une brochette de triangles quelconques, y compris obtusangles et plats-ish. */
const ECHANTILLON = [
  [P(100, 300), P(280, 340), P(190, 160)],
  [P(60, 80), P(400, 120), P(150, 330)],
  [P(200, 100), P(210, 400), P(500, 260)],   // très allongé
  [P(120, 200), P(600, 210), P(300, 205)],   // presque plat
  [P(300, 60), P(120, 380), P(480, 380)],    // isocèle
];

describe('le périmètre est exécutable', () => {
  it('REFUSE trois longueurs qui ne ferment pas — l’inégalité triangulaire', () => {
    expect(() => triangleDe(3, 4, 20)).toThrow(/triangle/);
    expect(() => triangleDe(2, 3, 5)).toThrow();      // cas plat : 2 + 3 = 5
  });

  it('REFUSE deux angles qui totalisent 180° ou plus', () => {
    expect(() => troisiemeAngle(120, 60)).toThrow(/180/);
    expect(() => troisiemeAngle(-10, 30)).toThrow();
  });

  it('accepte trois longueurs valables et construit le bon triangle', () => {
    const t = triangleDe(7, 5, 4);
    close(dist(t[1], t[2]), 7, 1e-9);   // BC = a
    close(dist(t[0], t[2]), 5, 1e-9);   // AC = b
    close(dist(t[0], t[1]), 4, 1e-9);   // AB = c
  });
});

describe('l’inégalité triangulaire, et son diagnostic', () => {
  it('dit POURQUOI c’est impossible, pas seulement que ça l’est', () => {
    expect(diagnostiquerCotes(3, 4, 20)).toMatchObject({ possible: false, raison: 'trop-court', plusGrand: 20, sommeAutres: 7 });
    expect(diagnostiquerCotes(2, 3, 5)).toMatchObject({ possible: false, raison: 'plat' });
    expect(diagnostiquerCotes(0, 3, 5)).toMatchObject({ possible: false, raison: 'nul' });
    expect(diagnostiquerCotes(4, 5, 6)).toMatchObject({ possible: true });
  });

  it('le cas limite est bien EXCLU : somme égale au plus grand côté', () => {
    expect(diagnostiquerCotes(6, 4, 10).possible).toBe(false);
    expect(diagnostiquerCotes(6, 4.01, 10).possible).toBe(true);
  });
});

describe('LA SOMME DES ANGLES — vérifiée, jamais affirmée', () => {
  it('vaut 180° sur tous les triangles de l’échantillon', () => {
    for (const t of ECHANTILLON) close(sommeAngles(t), 180, 1e-6);
  });

  it('reste 180° quand on traîne un sommet n’importe où', () => {
    // C'est l'invariant que le module « wow » fait constater : on balaie une
    // grille de positions, et la somme ne bouge pas d'un millième de degré.
    for (let x = 60; x <= 560; x += 50) {
      for (let y = 60; y <= 380; y += 40) {
        const t = [P(x, y), P(120, 400), P(520, 400)];
        const a = triangleAngles(t);
        if (a.some((v) => v < 0.5)) continue;      // sommets alignés : pas un triangle
        close(sommeAngles(t), 180, 1e-6);
      }
    }
  });

  it('le troisième angle se déduit des deux autres', () => {
    close(troisiemeAngle(60, 60), 60);
    close(troisiemeAngle(90, 35), 55);
    close(troisiemeAngle(112.5, 30.25), 37.25);
  });

  it('le recollage des trois coins forme exactement un angle plat', () => {
    for (const t of ECHANTILLON) {
      const r = recollageAngles(t);
      close(r.total, 180, 1e-6);
      expect(r.cumul).toHaveLength(3);
      close(r.cumul[0].debut, 0);
      // Chaque secteur commence là où le précédent finit : le recollage est
      // vraiment bout à bout, sans trou ni chevauchement.
      close(r.cumul[1].debut, r.cumul[0].mesure, 1e-9);
      close(r.cumul[2].debut, r.cumul[0].mesure + r.cumul[1].mesure, 1e-9);
    }
  });
});

describe('la nature d’un triangle est DÉDUITE, pas étiquetée', () => {
  it('reconnaît l’équilatéral', () => {
    const t = triangleDe(120, 120, 120);
    const n = natureDe(t);
    expect(n.equilateral).toBe(true);
    expect(n.isocele).toBe(false);
    for (const a of n.angles) close(a, 60, 1e-6);
  });

  it('reconnaît l’isocèle sans le confondre avec l’équilatéral', () => {
    const n = natureDe(triangleDe(80, 130, 130));
    expect(n.isocele).toBe(true);
    expect(n.equilateral).toBe(false);
  });

  it('reconnaît le rectangle — 3, 4, 5', () => {
    const n = natureDe(triangleDe(50, 30, 40));
    expect(n.rectangle).toBe(true);
    expect(Math.max(...n.angles)).toBeCloseTo(90, 4);
  });

  it('un triangle quelconque n’est rien de tout cela', () => {
    const n = natureDe(triangleDe(70, 95, 130));
    expect(n.equilateral).toBe(false);
    expect(n.isocele).toBe(false);
    expect(n.rectangle).toBe(false);
    expect(n.quelconque).toBe(true);
  });
});

describe('médiatrices et cercle circonscrit', () => {
  it('la médiatrice passe par le milieu et est perpendiculaire au côté', () => {
    const [P1, Q1] = [P(80, 120), P(320, 260)];
    const [m, d] = mediatrice(P1, Q1);
    const mid = midpoint(P1, Q1);
    close(m.x, mid.x); close(m.y, mid.y);
    // produit scalaire nul : la direction est bien perpendiculaire
    const u = { x: d.x - m.x, y: d.y - m.y };
    const v = { x: Q1.x - P1.x, y: Q1.y - P1.y };
    close(u.x * v.x + u.y * v.y, 0, 1e-9);
  });

  it('LES TROIS MÉDIATRICES SE COUPENT EN UN SEUL POINT', () => {
    for (const t of ECHANTILLON.slice(0, 3)) {
      const [A, B, C] = t;
      const [m1, d1] = mediatrice(A, B);
      const [m2, d2] = mediatrice(B, C);
      const [m3, d3] = mediatrice(A, C);
      const i12 = lineInter(m1, d1, m2, d2);
      const i13 = lineInter(m1, d1, m3, d3);
      expect(i12).not.toBeNull();
      expect(i13).not.toBeNull();
      close(i12.x, i13.x, 1e-6);
      close(i12.y, i13.y, 1e-6);
    }
  });

  it('le centre est à ÉGALE distance des trois sommets — c’est ce qui fait le cercle', () => {
    for (const t of ECHANTILLON.slice(0, 3)) {
      expect(ecartRayons(t)).toBeLessThan(1e-6);
      const O = circumcenter(t);
      const r = rayonCirconscrit(t);
      for (const s of t) close(dist(O, s), r, 1e-6);
    }
  });
});

describe('hauteurs et médianes — deux objets qu’on confond', () => {
  it('la hauteur tombe perpendiculairement sur le côté opposé', () => {
    const t = ECHANTILLON[1];
    const h = hauteur(t, 0);
    const u = { x: h.pied.x - h.sommet.x, y: h.pied.y - h.sommet.y };
    const v = { x: h.base[1].x - h.base[0].x, y: h.base[1].y - h.base[0].y };
    close(u.x * v.x + u.y * v.y, 0, 1e-6);
    close(h.longueur, dist(h.sommet, h.pied), 1e-9);
  });

  it('la médiane vise le MILIEU, pas le pied de la hauteur — ils diffèrent', () => {
    const t = ECHANTILLON[1];
    const h = hauteur(t, 0);
    const m = mediane(t, 0);
    // Sur un triangle quelconque, les deux points sont distincts : c'est
    // exactement la confusion que la leçon doit casser.
    expect(dist(h.pied, m.milieu)).toBeGreaterThan(5);
  });

  it('sur un triangle ISOCÈLE, hauteur et médiane issues du sommet COÏNCIDENT', () => {
    const t = [P(300, 60), P(120, 380), P(480, 380)];
    const h = hauteur(t, 0);
    const m = mediane(t, 0);
    close(h.pied.x, m.milieu.x, 1e-6);
    close(h.pied.y, m.milieu.y, 1e-6);
  });
});

describe('LA MÉDIANE PARTAGE LE TRIANGLE EN DEUX AIRES ÉGALES', () => {
  it('les deux moitiés ont la même aire, sur tous les triangles et depuis les trois sommets', () => {
    for (const t of ECHANTILLON) {
      for (let i = 0; i < 3; i += 1) {
        const r = airesSepareesParMediane(t, i);
        close(r.aire1, r.aire2, 1e-6);
        // et leur somme redonne bien le triangle entier
        close(r.aire1 + r.aire2, polygonArea(t), 1e-6);
      }
    }
  });

  it('les DEUX INGRÉDIENTS de la preuve sont vrais : même base, même hauteur', () => {
    // C'est la démonstration exigée par le programme. Si l'un des deux
    // ingrédients tombait, l'égalité des aires ne serait qu'une coïncidence
    // numérique — ce test interdit cela.
    for (const t of ECHANTILLON) {
      for (let i = 0; i < 3; i += 1) {
        const r = airesSepareesParMediane(t, i);
        close(r.base1, r.base2, 1e-9);                    // M est le milieu
        expect(r.hauteurCommune).toBeGreaterThan(0);      // une seule hauteur
        // l'aire vaut bien base × hauteur / 2, des deux côtés
        close(r.aire1, (r.base1 * r.hauteurCommune) / 2, 1e-6);
        close(r.aire2, (r.base2 * r.hauteurCommune) / 2, 1e-6);
      }
    }
  });

  it('une droite qui ne passe PAS par le milieu ne partage pas en deux aires égales', () => {
    // Le contre-exemple : sans le milieu, l'égalité tombe. C'est ce qui rend
    // l'hypothèse « médiane » indispensable, et non décorative.
    const [A, B, C] = ECHANTILLON[0];
    const pasLeMilieu = { x: B.x + (C.x - B.x) * 0.3, y: B.y + (C.y - B.y) * 0.3 };
    const a1 = polygonArea([A, B, pasLeMilieu]);
    const a2 = polygonArea([A, pasLeMilieu, C]);
    expect(Math.abs(a1 - a2)).toBeGreaterThan(1);
  });
});
