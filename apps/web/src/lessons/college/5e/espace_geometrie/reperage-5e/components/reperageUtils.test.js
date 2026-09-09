import { describe, it, expect } from 'vitest';
import {
  point, formatAbscissa, formatCoords, parseSigned, snapAbscissa,
  sharingAbscissa, isAmbiguous, quadrantOf, describeQuadrant, signsOf,
  samePoint, swap, swapLandsElsewhere, lieuById, lieuPoint, inDomaine,
  DOMAINE, LIEUX, CIBLES, AMBIGU,
} from './reperageUtils';

/* ── Le périmètre est exécutable ─────────────────────────────────────── */

describe('périmètre — pas de coordonnées dans l’espace', () => {
  it('accepte deux composantes', () => {
    expect(point(-2, 5)).toEqual({ x: -2, y: 5 });
  });

  it('REFUSE une troisième composante (exclusion du référentiel 2026)', () => {
    expect(() => point(1, 2, 3)).toThrow(/hors périmètre/);
  });

  it('refuse une composante non finie', () => {
    expect(() => point(1, NaN)).toThrow();
    expect(() => point(Infinity, 0)).toThrow();
  });
});

/* ── Écriture et lecture : l'aller-retour doit tenir ─────────────────── */

describe('écriture française', () => {
  it('écrit le moins typographique, pas le tiret ASCII', () => {
    expect(formatAbscissa(-3)).toBe('−3');
    expect(formatAbscissa(-3).charCodeAt(0)).toBe(0x2212);
  });

  it('écrit la virgule décimale', () => {
    expect(formatAbscissa(2.5)).toBe('2,5');
    expect(formatAbscissa(-0.5)).toBe('−0,5');
  });

  it('n’écrit jamais « −0 »', () => {
    expect(formatAbscissa(0)).toBe('0');
    expect(formatAbscissa(-0)).toBe('0');
  });

  it('écrit le couple avec un point-virgule', () => {
    expect(formatCoords({ x: -2, y: 5 })).toContain(';');
    expect(formatCoords({ x: -2, y: 5 })).toMatch(/^\(−2\s?;\s?5\)$/u);
  });
});

describe('parseSigned — l’élève recopie ce qu’il voit', () => {
  it('lit le moins typographique affiché par la leçon', () => {
    expect(parseSigned('−3')).toBe(-3);
    expect(parseSigned('−2,5')).toBe(-2.5);
  });

  it('lit aussi le tiret ASCII et le point décimal', () => {
    expect(parseSigned('-3')).toBe(-3);
    expect(parseSigned('2.5')).toBe(2.5);
  });

  it('tolère les espaces, fines comprises', () => {
    expect(parseSigned(' −4 ')).toBe(-4);
    expect(parseSigned('−4')).toBe(-4);
  });

  it('refuse ce qui n’est pas un nombre', () => {
    expect(parseSigned('')).toBeNaN();
    expect(parseSigned('deux')).toBeNaN();
    expect(parseSigned('3;4')).toBeNaN();
  });

  it('fait l’aller-retour avec formatAbscissa sur toute la fenêtre', () => {
    for (let v = -6; v <= 6; v += 0.5) {
      expect(parseSigned(formatAbscissa(v))).toBe(v === 0 ? 0 : v);
    }
  });
});

/* ── La graduation ───────────────────────────────────────────────────── */

describe('snapAbscissa', () => {
  it('arrondit au pas demandé', () => {
    expect(snapAbscissa(2.3, 1)).toBe(2);
    expect(snapAbscissa(2.3, 0.5)).toBe(2.5);
    expect(snapAbscissa(3, 2)).toBe(4);
  });

  it('ne produit pas de bruit flottant', () => {
    expect(snapAbscissa(0.30000000000004, 0.1)).toBe(0.3);
    expect(String(snapAbscissa(1.5, 0.5))).not.toMatch(/0000/);
  });
});

/* ── Le déclencheur du module 1 ne peut pas mentir ───────────────────── */

describe('ambiguïté — le manque qui ouvre la leçon', () => {
  it('AMBIGU désigne réellement deux lieux de même abscisse', () => {
    const partages = sharingAbscissa(AMBIGU.x);
    expect(partages.length).toBeGreaterThanOrEqual(2);
    expect(partages.map((l) => l.id).sort()).toEqual([...AMBIGU.ids].sort());
  });

  it('ces deux lieux ont des ordonnées DIFFÉRENTES (sinon ce serait le même point)', () => {
    const [a, b] = sharingAbscissa(AMBIGU.x);
    expect(a.y).not.toBe(b.y);
  });

  it('isAmbiguous est vrai là où il faut, faux ailleurs', () => {
    expect(isAmbiguous(AMBIGU.x)).toBe(true);
    expect(isAmbiguous(2)).toBe(false);   // le restaurant est seul sur x = 2
  });
});

/* ── Les quadrants, honnêtement ──────────────────────────────────────── */

describe('quadrantOf', () => {
  it('nomme les quatre quadrants dans le sens usuel', () => {
    expect(quadrantOf({ x: 2, y: 3 })).toBe(1);
    expect(quadrantOf({ x: -2, y: 3 })).toBe(2);
    expect(quadrantOf({ x: -2, y: -3 })).toBe(3);
    expect(quadrantOf({ x: 2, y: -3 })).toBe(4);
  });

  it('un point sur un axe n’est dans AUCUN quadrant', () => {
    expect(quadrantOf({ x: 0, y: 3 })).toBe('axe-y');
    expect(quadrantOf({ x: -4, y: 0 })).toBe('axe-x');
    expect(quadrantOf({ x: 0, y: 0 })).toBe('origine');
  });

  it('chaque cas a une phrase française', () => {
    for (const q of [1, 2, 3, 4, 'axe-x', 'axe-y', 'origine']) {
      expect(describeQuadrant(q)).not.toBe('');
    }
  });
});

describe('signsOf', () => {
  it('rend le zéro comme zéro, jamais comme un signe', () => {
    expect(signsOf({ x: 0, y: -2 })).toEqual({ sx: '0', sy: '−' });
    expect(signsOf({ x: 3, y: 0 })).toEqual({ sx: '+', sy: '0' });
  });
});

/* ── Le couple est ordonné ───────────────────────────────────────────── */

describe('swap — le piège du couple échangé', () => {
  it('échanger deux fois revient au point de départ', () => {
    for (const p of [{ x: -2, y: 5 }, { x: 0, y: 3 }, { x: 4, y: 4 }]) {
      expect(swap(swap(p))).toEqual(p);
    }
  });

  it('l’échange déplace le point SAUF sur la diagonale', () => {
    expect(swapLandsElsewhere({ x: -2, y: 5 })).toBe(true);
    expect(swapLandsElsewhere({ x: 3, y: 3 })).toBe(false);
    expect(swapLandsElsewhere({ x: 0, y: 0 })).toBe(false);
  });

  it('quand l’échange ne déplace pas, les deux points sont bien confondus', () => {
    const p = { x: 3, y: 3 };
    expect(swapLandsElsewhere(p)).toBe(false);
    expect(samePoint(p, swap(p))).toBe(true);
  });
});

/* ── Les données de la leçon tiennent leurs promesses ────────────────── */

describe('données du domaine', () => {
  it('tout lieu tient dans la fenêtre du repère', () => {
    for (const l of LIEUX) {
      expect(inDomaine(l), `${l.id} sort du repère`).toBe(true);
    }
  });

  it('toute cible tient dans la fenêtre du repère', () => {
    for (const c of CIBLES) {
      expect(inDomaine(c.p), `${c.id} sort du repère`).toBe(true);
    }
  });

  it('les quatre quadrants sont représentés (sinon le module 3 manque de matière)', () => {
    const quadrants = new Set(LIEUX.map((l) => quadrantOf(l)));
    for (const q of [1, 2, 3, 4]) expect(quadrants.has(q)).toBe(true);
  });

  it('chaque axe porte au moins un lieu (matière du module 5)', () => {
    const quadrants = new Set(LIEUX.map((l) => quadrantOf(l)));
    expect(quadrants.has('axe-x')).toBe(true);
    expect(quadrants.has('axe-y')).toBe(true);
    expect(quadrants.has('origine')).toBe(true);
  });

  it('les identifiants de lieux sont uniques', () => {
    expect(new Set(LIEUX.map((l) => l.id)).size).toBe(LIEUX.length);
  });

  it('une cible au moins est sur la diagonale (le cas honnête du module 4)', () => {
    expect(CIBLES.some((c) => !swapLandsElsewhere(c.p))).toBe(true);
  });

  it('lieuById refuse un id inconnu au lieu de rendre undefined', () => {
    expect(() => lieuById('igloo')).toThrow(/inconnu/);
    expect(lieuPoint('sommet')).toEqual({ x: -3, y: 3 });
  });

  it('le chalet d’accueil est bien l’origine', () => {
    expect(lieuPoint('chalet')).toEqual({ x: 0, y: 0 });
  });

  it('la fenêtre est symétrique autour de l’origine', () => {
    expect(DOMAINE.xMin).toBe(-DOMAINE.xMax);
    expect(DOMAINE.yMin).toBe(-DOMAINE.yMax);
  });
});
