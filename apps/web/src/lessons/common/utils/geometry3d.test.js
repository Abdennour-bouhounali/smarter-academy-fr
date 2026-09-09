import { describe, it, expect } from 'vitest';
import {
  v3, sub3, add3, scale3, dot3, cross3, norm3, dist3, normalize3, centroid3,
  rotateX, rotateY, rotateSolid,
  projectCavaliere, projectOrtho, CAVALIERE,
  faceNormal, isFaceVisible, visibleEdges, visibleVertices,
  countsOf, eulerCheck,
  relativePosition, pointOnPlane,
  SOLIDS, SOLIDS_LIST, vertexName, edgeName,
  makePyramide,
  makePrismeCarre,
  makeCone,
  makeCylindre,
} from './geometry3d';

const near = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('vecteurs 3D', () => {
  it('compose les opérations de base', () => {
    expect(sub3(v3(4, 6, 8), v3(1, 2, 3))).toEqual({ x: 3, y: 4, z: 5 });
    expect(add3(v3(1, 2, 3), v3(1, 1, 1))).toEqual({ x: 2, y: 3, z: 4 });
    expect(scale3(v3(1, -2, 3), 2)).toEqual({ x: 2, y: -4, z: 6 });
    expect(dot3(v3(1, 2, 3), v3(4, 5, 6))).toBe(32);
    near(norm3(v3(2, 3, 6)), 7);
    near(dist3(v3(0, 0, 0), v3(2, 3, 6)), 7);
  });

  it('le produit vectoriel est orthogonal à ses deux facteurs', () => {
    const a = v3(3, -1, 2);
    const b = v3(1, 4, -2);
    const n = cross3(a, b);
    near(dot3(n, a), 0, 1e-9);
    near(dot3(n, b), 0, 1e-9);
    expect(cross3(v3(1, 0, 0), v3(0, 1, 0))).toEqual({ x: 0, y: 0, z: 1 });
  });

  it('normalize3 renvoie un vecteur unitaire, et zéro pour le vecteur nul', () => {
    near(norm3(normalize3(v3(2, 3, 6))), 1);
    expect(normalize3(v3(0, 0, 0))).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('centroid3 est le centre du cube', () => {
    const c = centroid3(SOLIDS.cube.vertices);
    near(c.x, 0, 1e-9); near(c.y, 0, 1e-9); near(c.z, 0, 1e-9);
  });
});

describe('rotations', () => {
  it('un quart de tour autour de y envoie +x sur −z', () => {
    const p = rotateY(v3(10, 0, 0), 90);
    near(p.x, 0, 1e-9); near(p.z, -10, 1e-9);
  });

  it('un quart de tour autour de x envoie +y sur +z', () => {
    const p = rotateX(v3(0, 10, 0), 90);
    near(p.y, 0, 1e-9); near(p.z, 10, 1e-9);
  });

  it('un tour complet ramène chaque sommet à sa place', () => {
    const turned = rotateSolid(SOLIDS.pave, { yaw: 360, pitch: 360 });
    turned.vertices.forEach((p, i) => {
      near(dist3(p, SOLIDS.pave.vertices[i]), 0, 1e-9);
    });
  });

  it('la rotation conserve les longueurs des arêtes', () => {
    const s = SOLIDS.cube;
    const turned = rotateSolid(s, { yaw: 37, pitch: -22 });
    for (const [i, j] of s.edges) {
      near(dist3(turned.vertices[i], turned.vertices[j]), dist3(s.vertices[i], s.vertices[j]), 1e-9);
    }
  });
});

describe('projections', () => {
  it('la vue de face d’un cube est un carré', () => {
    const front = SOLIDS.cube.vertices.slice(0, 4).map((p) => projectOrtho(p, 'face'));
    const xs = new Set(front.map((p) => Math.round(p.x)));
    const ys = new Set(front.map((p) => Math.round(p.y)));
    expect([...xs].sort((a, b) => a - b)).toEqual([-50, 50]);
    expect([...ys].sort((a, b) => a - b)).toEqual([-50, 50]);
  });

  it('les trois vues d’un pavé donnent ses trois dimensions', () => {
    const s = SOLIDS.pave; // 140 × 80 × 90
    const spread = (view, axis) => {
      const vals = s.vertices.map((p) => projectOrtho(p, view)[axis]);
      return Math.max(...vals) - Math.min(...vals);
    };
    near(spread('face', 'x'), 140, 1e-9);   // largeur
    near(spread('face', 'y'), 80, 1e-9);    // hauteur
    near(spread('dessus', 'y'), 90, 1e-9);  // profondeur
    near(spread('cote', 'x'), 90, 1e-9);
  });

  it('projectOrtho refuse une vue inconnue', () => {
    expect(() => projectOrtho(v3(0, 0, 0), 'derriere')).toThrow(/vue inconnue/);
  });

  it('la perspective cavalière dessine la face avant en vraie grandeur', () => {
    // Deux points de la face avant (même z) : leur écart est conservé.
    const a = projectCavaliere(v3(-50, -50, 50));
    const b = projectCavaliere(v3(50, -50, 50));
    near(b.x - a.x, 100, 1e-9);
    near(b.y - a.y, 0, 1e-9);
  });

  it('la fuyante suit l’angle et le coefficient annoncés', () => {
    const o = projectCavaliere(v3(0, 0, 0));
    const p = projectCavaliere(v3(0, 0, 100));
    const expected = CAVALIERE.k * 100;
    near(Math.hypot(p.x - o.x, p.y - o.y), expected, 1e-9);
    // 45° : autant de décalage horizontal que vertical.
    near(Math.abs(p.x - o.x), Math.abs(p.y - o.y), 1e-9);
  });

  it('le y renvoyé est un y d’écran (vers le bas)', () => {
    // Un point PLUS HAUT dans le monde a un y d'écran PLUS PETIT.
    expect(projectCavaliere(v3(0, 50, 0)).y).toBeLessThan(projectCavaliere(v3(0, -50, 0)).y);
    expect(projectOrtho(v3(0, 50, 0), 'face').y).toBeLessThan(projectOrtho(v3(0, -50, 0), 'face').y);
  });
});

describe('comptes et relation d’Euler', () => {
  it('les comptes viennent du modèle', () => {
    expect(countsOf(SOLIDS.cube)).toEqual({ faces: 6, aretes: 12, sommets: 8 });
    expect(countsOf(SOLIDS.pave)).toEqual({ faces: 6, aretes: 12, sommets: 8 });
    expect(countsOf(SOLIDS.prisme)).toEqual({ faces: 5, aretes: 9, sommets: 6 });
    expect(countsOf(SOLIDS.pyramide)).toEqual({ faces: 5, aretes: 8, sommets: 5 });
  });

  it('tous les solides vérifient F + S − A = 2', () => {
    for (const s of SOLIDS_LIST) expect(eulerCheck(s)).toBe(2);
  });

  it('chaque arête du modèle est portée par exactement deux faces', () => {
    for (const s of SOLIDS_LIST) {
      const count = new Map();
      for (const f of s.faces) {
        for (let n = 0; n < f.length; n += 1) {
          const i = f[n];
          const j = f[(n + 1) % f.length];
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          count.set(key, (count.get(key) ?? 0) + 1);
        }
      }
      expect(count.size).toBe(s.edges.length);
      for (const [, c] of count) expect(c).toBe(2);
    }
  });
});

describe('orientation des faces et visibilité', () => {
  it('toutes les normales sont SORTANTES (invariant de l’ordre des sommets)', () => {
    for (const s of SOLIDS_LIST) {
      const centre = centroid3(s.vertices);
      for (const f of s.faces) {
        const n = faceNormal(s, f);
        const fromCentre = sub3(centroid3(f.map((i) => s.vertices[i])), centre);
        // Une normale sortante s'éloigne du centre du solide.
        expect(dot3(n, fromCentre)).toBeGreaterThan(0);
      }
    }
  });

  it('de face, on voit la face avant du cube et pas la face arrière', () => {
    const s = SOLIDS.cube;
    expect(isFaceVisible(s, s.faces[0])).toBe(true);  // avant
    expect(isFaceVisible(s, s.faces[1])).toBe(false); // arrière
  });

  it('un solide convexe montre au plus la moitié de ses faces à la fois', () => {
    for (const s of SOLIDS_LIST) {
      const turned = rotateSolid(s, { yaw: 25, pitch: 15 });
      const visible = turned.faces.filter((f) => isFaceVisible(turned, f)).length;
      expect(visible).toBeGreaterThan(0);
      expect(visible).toBeLessThan(turned.faces.length);
    }
  });

  it('INVARIANT : une arête est cachée ⟺ aucune de ses faces n’est visible', () => {
    const turned = rotateSolid(SOLIDS.cube, { yaw: 30, pitch: 20 });
    const { visible, hidden } = visibleEdges(turned);
    const facesOf = ([i, j]) => turned.faces.filter((f) => {
      for (let n = 0; n < f.length; n += 1) {
        const a = f[n];
        const b = f[(n + 1) % f.length];
        if ((a === i && b === j) || (a === j && b === i)) return true;
      }
      return false;
    });
    for (const e of hidden) expect(facesOf(e).some((f) => isFaceVisible(turned, f))).toBe(false);
    for (const e of visible) expect(facesOf(e).some((f) => isFaceVisible(turned, f))).toBe(true);
    expect(visible.length + hidden.length).toBe(turned.edges.length);
  });

  it('vu en biais, un cube cache exactement 3 arêtes et 1 sommet', () => {
    // La position canonique du dessin : le sommet arrière-opposé est caché.
    const turned = rotateSolid(SOLIDS.cube, { yaw: 30, pitch: 20 });
    const { hidden } = visibleEdges(turned);
    expect(hidden).toHaveLength(3);
    expect(8 - visibleVertices(turned).size).toBe(1);
  });

  it('tourner le solide FAIT CHANGER l’arête cachée', () => {
    const key = (edges) => edges.map(([i, j]) => `${i}-${j}`).sort().join(',');
    const a = visibleEdges(rotateSolid(SOLIDS.cube, { yaw: 30, pitch: 20 }));
    const b = visibleEdges(rotateSolid(SOLIDS.cube, { yaw: -30, pitch: 20 }));
    expect(key(a.hidden)).not.toBe(key(b.hidden));
  });
});

describe('positions relatives dans l’espace', () => {
  const s = SOLIDS.cube;
  const P = (i) => s.vertices[i];
  // A=0 B=1 C=2 D=3 (avant), E=4 F=5 G=6 H=7 (arrière)

  it('reconnaît deux arêtes parallèles', () => {
    expect(relativePosition(P(0), P(1), P(3), P(2))).toBe('paralleles'); // (AB) et (DC)
    expect(relativePosition(P(0), P(1), P(4), P(5))).toBe('paralleles'); // (AB) et (EF)
  });

  it('reconnaît deux arêtes sécantes', () => {
    expect(relativePosition(P(0), P(1), P(1), P(2))).toBe('secantes'); // (AB) et (BC) en B
  });

  it('reconnaît deux arêtes NON COPLANAIRES — le cas propre à l’espace', () => {
    // (AB) sur la face avant et (CG) qui part vers l'arrière : ni parallèles,
    // ni sécantes. C'est ce que le plan ne permet pas.
    expect(relativePosition(P(0), P(1), P(2), P(6))).toBe('non-coplanaires');
    expect(relativePosition(P(0), P(1), P(7), P(4))).toBe('non-coplanaires');
  });

  it('reconnaît deux droites confondues', () => {
    expect(relativePosition(P(0), P(1), P(0), P(1))).toBe('confondues');
  });

  it('pointOnPlane décide l’appartenance à un plan du cube', () => {
    // D (indice 3) est sur le plan de la face avant ABC ; E (indice 4) non.
    expect(pointOnPlane(P(0), P(1), P(2), P(3))).toBe(true);
    expect(pointOnPlane(P(0), P(1), P(2), P(4))).toBe(false);
  });
});

describe('noms scolaires', () => {
  it('nomme les sommets et les arêtes comme un énoncé de brevet', () => {
    expect(vertexName(SOLIDS.cube, 0)).toBe('A');
    expect(vertexName(SOLIDS.cube, 6)).toBe('G');
    expect(edgeName(SOLIDS.cube, [0, 4])).toBe('[AE]');
    expect(vertexName(SOLIDS.pyramide, 4)).toBe('S');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   SOLIDES PARAMÉTRIQUES (4e) — pyramide, prisme carré, cône, cylindre
   L'élève CHANGE la base et la hauteur : chaque solide ainsi construit doit
   satisfaire exactement les mêmes invariants que ceux du catalogue, pour
   TOUTES les dimensions atteignables — sinon le dessin finirait par mentir.
   ══════════════════════════════════════════════════════════════════════ */

const DIMENSIONS = [];
for (const cote of [40, 60, 90, 110, 160]) {
  for (const hauteur of [30, 70, 120, 200]) DIMENSIONS.push([cote, hauteur]);
}

describe('pyramide et prisme paramétriques — invariants sur TOUT le domaine', () => {
  it('la pyramide a 5 faces, 8 arêtes, 5 sommets, quelles que soient ses dimensions', () => {
    for (const [c, h] of DIMENSIONS) {
      expect(countsOf(makePyramide(c, h))).toEqual({ faces: 5, aretes: 8, sommets: 5 });
    }
  });

  it('le prisme carré a 6 faces, 12 arêtes, 8 sommets', () => {
    for (const [c, h] of DIMENSIONS) {
      expect(countsOf(makePrismeCarre(c, h))).toEqual({ faces: 6, aretes: 12, sommets: 8 });
    }
  });

  it('F + S − A = 2 pour toutes les dimensions', () => {
    for (const [c, h] of DIMENSIONS) {
      expect(eulerCheck(makePyramide(c, h))).toBe(2);
      expect(eulerCheck(makePrismeCarre(c, h))).toBe(2);
    }
  });

  it('chaque arête est portée par exactement deux faces', () => {
    for (const s of [makePyramide(90, 70), makePrismeCarre(90, 70), makePyramide(160, 200)]) {
      const count = new Map();
      for (const f of s.faces) {
        for (let n = 0; n < f.length; n += 1) {
          const i = f[n];
          const j = f[(n + 1) % f.length];
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          count.set(key, (count.get(key) ?? 0) + 1);
        }
      }
      expect(count.size).toBe(s.edges.length);
      for (const [, c] of count) expect(c).toBe(2);
    }
  });

  it('les normales restent SORTANTES pour toutes les dimensions', () => {
    for (const [c, h] of DIMENSIONS) {
      for (const s of [makePyramide(c, h), makePrismeCarre(c, h)]) {
        const centre = centroid3(s.vertices);
        for (const f of s.faces) {
          const n = faceNormal(s, f);
          const fromCentre = sub3(centroid3(f.map((i) => s.vertices[i])), centre);
          expect(dot3(n, fromCentre)).toBeGreaterThan(0);
        }
      }
    }
  });

  it('sous TOUTE rotation, il reste des arêtes visibles — le solide ne disparaît jamais', () => {
    for (let yaw = -180; yaw < 180; yaw += 15) {
      for (const pitch of [-40, -10, 0, 20, 45]) {
        for (const s of [makePyramide(110, 120), makePrismeCarre(110, 120), makePyramide(40, 200)]) {
          const t = rotateSolid(s, { yaw, pitch });
          const { visible, hidden } = visibleEdges(t);
          expect(visible.length).toBeGreaterThan(0);
          expect(visible.length + hidden.length).toBe(t.edges.length);
        }
      }
    }
  });

  it('la BASE est carrée et la HAUTEUR est la distance base → sommet', () => {
    const p = makePyramide(90, 140);
    const [A, B, C, D, S] = p.vertices;
    // base carrée
    expect(dist3(A, B)).toBeCloseTo(90);
    expect(dist3(B, C)).toBeCloseTo(90);
    expect(dist3(C, D)).toBeCloseTo(90);
    expect(dist3(D, A)).toBeCloseTo(90);
    // les quatre sommets de base sont au même niveau
    expect(new Set([A.y, B.y, C.y, D.y]).size).toBe(1);
    // le sommet est À LA VERTICALE du centre de la base (pyramide DROITE),
    // et la hauteur est bien celle annoncée — pas l'arête latérale.
    const centreBase = centroid3([A, B, C, D]);
    expect(centreBase.x).toBeCloseTo(0);
    expect(centreBase.z).toBeCloseTo(0);
    expect(S.x).toBeCloseTo(centreBase.x);
    expect(S.z).toBeCloseTo(centreBase.z);
    expect(S.y - A.y).toBeCloseTo(140);
    // l'arête latérale est PLUS LONGUE que la hauteur : c'est le piège visé.
    expect(dist3(A, S)).toBeGreaterThan(140);
  });

  it('pyramide et prisme de mêmes dimensions partagent EXACTEMENT la même base', () => {
    const py = makePyramide(90, 140);
    const pr = makePrismeCarre(90, 140);
    expect(py.aireBase).toBe(pr.aireBase);
    const basePy = py.vertices.slice(0, 4).map((v) => [v.x, v.y, v.z]).sort();
    const basePr = pr.vertices.filter((v) => v.y === Math.min(...pr.vertices.map((w) => w.y)))
      .map((v) => [v.x, v.y, v.z]).sort();
    expect(basePy).toEqual(basePr);
  });

  it('les deux solides restent CENTRÉS : une rotation les fait tourner sur place', () => {
    for (const [c, h] of DIMENSIONS) {
      for (const s of [makePyramide(c, h), makePrismeCarre(c, h)]) {
        const g = centroid3(s.vertices);
        expect(Math.abs(g.x)).toBeLessThan(1e-9);
        expect(Math.abs(g.z)).toBeLessThan(1e-9);
        // la hauteur est répartie de part et d'autre de l'origine
        const ys = s.vertices.map((v) => v.y);
        expect(Math.min(...ys)).toBeCloseTo(-h / 2);
        expect(Math.max(...ys)).toBeCloseTo(h / 2);
      }
    }
  });
});

describe('cône et cylindre — décrits par leurs GRANDEURS, pas par des sommets', () => {
  it('n’inventent NI sommets NI arêtes : ce ne sont pas des polyèdres', () => {
    for (const s of [makeCone(50, 120), makeCylindre(50, 120)]) {
      expect(s.estPolyedre).toBe(false);
      expect(s.vertices).toBeUndefined();
      expect(s.edges).toBeUndefined();
      expect(s.faces).toBeUndefined();
    }
  });

  it('portent le rayon, la hauteur et l’aire de base exacte (π r²)', () => {
    const c = makeCone(30, 80);
    expect(c.rayon).toBe(30);
    expect(c.hauteur).toBe(80);
    expect(c.aireBase).toBeCloseTo(Math.PI * 900);
  });

  it('la hauteur du cône est le segment centre de base → sommet, vertical', () => {
    const c = makeCone(40, 150);
    expect(c.apex.x).toBe(c.centreBase.x);
    expect(c.apex.z).toBe(c.centreBase.z);
    expect(dist3(c.apex, c.centreBase)).toBeCloseTo(150);
  });

  it('cône et cylindre de mêmes grandeurs ont la même base', () => {
    expect(makeCone(45, 90).aireBase).toBe(makeCylindre(45, 90).aireBase);
  });
});

describe('les solides du catalogue ne bougent pas', () => {
  it('SOLIDS_LIST contient toujours les quatre solides figés, inchangés', () => {
    expect(SOLIDS_LIST.map((s) => s.id).sort()).toEqual(['cube', 'pave', 'prisme', 'pyramide']);
  });
});
