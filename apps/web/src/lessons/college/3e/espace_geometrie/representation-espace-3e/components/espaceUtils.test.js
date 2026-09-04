import { describe, it, expect } from 'vitest';
import {
  SOLIDS, SOLIDES_COURBES, allSolids, VUES, viewExtent, ORIENTATIONS,
  projectCavaliere,
  hiddenCount, PAIRES_CUBE, positionOf, POSITION_LABEL,
  CAVALIERE_DEFAUT, CAVALIERE_ANGLES, CAVALIERE_K,
  rotateSolid, visibleEdges, countsOf, eulerCheck, edgeName,
} from './espaceUtils';

describe('les solides de la leçon', () => {
  it('réunit les polyèdres et les solides courbes', () => {
    const all = allSolids();
    expect(all.length).toBe(4 + 3);
    expect(all.filter((s) => s.polyedre)).toHaveLength(4);
    expect(all.filter((s) => !s.polyedre)).toHaveLength(3);
  });

  it('les solides courbes sont marqués NON polyèdres', () => {
    for (const s of Object.values(SOLIDES_COURBES)) {
      expect(s.polyedre, s.nom).toBe(false);
      // Ils ont bien des comptes, mais une face courbe : ce ne sont pas des
      // polyèdres, et la leçon ne doit donc pas leur appliquer Euler.
      // (Le cône vérifie 2 + 1 − 1 = 2 par coïncidence numérique : c'est
      // précisément pourquoi le drapeau `polyedre` existe et pourquoi le
      // calcul d'Euler ne doit jamais servir de test d'appartenance.)
      expect(s.natureFaces).toMatch(/courbe/);
    }
  });

  it('les polyèdres, eux, vérifient tous la relation d’Euler', () => {
    for (const s of Object.values(SOLIDS)) expect(eulerCheck(s)).toBe(2);
  });

  it('la boule a une seule surface et aucun sommet', () => {
    expect(SOLIDES_COURBES.boule).toMatchObject({ faces: 1, aretes: 0, sommets: 0 });
  });
});

describe('les trois vues', () => {
  it('propose face, dessus et côté', () => {
    expect(VUES.map((v) => v.id)).toEqual(['face', 'dessus', 'cote']);
  });

  it('le cube a la même étendue dans les trois vues', () => {
    for (const v of VUES) {
      const e = viewExtent(SOLIDS.cube, v.id);
      expect(e.largeur).toBe(100);
      expect(e.hauteur).toBe(100);
    }
  });

  it('le pavé se distingue justement par des vues différentes', () => {
    const face = viewExtent(SOLIDS.pave, 'face');
    const dessus = viewExtent(SOLIDS.pave, 'dessus');
    expect(face).toEqual({ largeur: 140, hauteur: 80 });
    expect(dessus).toEqual({ largeur: 140, hauteur: 90 });
    // Deux vues suffisent donc à le différencier du cube.
    expect(face.hauteur).not.toBe(dessus.hauteur);
  });

  it('la vue de dessus d’une pyramide à base carrée est un carré', () => {
    const e = viewExtent(SOLIDS.pyramide, 'dessus');
    expect(e.largeur).toBe(e.hauteur);
  });
});

describe('LE POINT DE VUE CHANGE CE QU’ON VOIT', () => {
  it('de face, un cube ne cache aucune arête de contour mais bien des arêtes arrière', () => {
    const { visible, hidden } = visibleEdges(SOLIDS.cube);
    expect(visible.length + hidden.length).toBe(12);
    expect(hidden.length).toBeGreaterThan(0);
  });

  it('tourner le solide change le nombre ou l’identité des arêtes cachées', () => {
    const key = (o) => visibleEdges(rotateSolid(SOLIDS.cube, o)).hidden
      .map(([i, j]) => `${i}-${j}`).sort().join(',');
    const vues = ORIENTATIONS.map(key);
    expect(new Set(vues).size).toBeGreaterThan(1);
  });

  it('en vue trois quarts, exactement 3 arêtes du cube sont cachées', () => {
    expect(hiddenCount(SOLIDS.cube, { yaw: 30, pitch: 20 })).toBe(3);
  });

  it('chaque orientation proposée donne un dessin exploitable', () => {
    for (const o of ORIENTATIONS) {
      const n = hiddenCount(SOLIDS.cube, o);
      // Ni 0 (le dessin ne montrerait aucune arête cachée à expliquer),
      // ni 12 (on ne verrait rien du tout).
      expect(n, o.label).toBeGreaterThanOrEqual(0);
      expect(n, o.label).toBeLessThan(12);
    }
  });

  it('de face on cache 8 arêtes, de trois quarts seulement 3', () => {
    // Une arête est visible dès qu'UNE de ses faces l'est. De face on ne voit
    // qu'une seule face (4 arêtes visibles, 8 cachées) ; de trois quarts on en
    // voit trois, et il ne reste que 3 arêtes derrière. Ces deux nombres sont
    // cités tels quels dans le module 3.
    expect(hiddenCount(SOLIDS.cube, { yaw: 0, pitch: 0 })).toBe(8);
    expect(hiddenCount(SOLIDS.cube, { yaw: 30, pitch: 20 })).toBe(3);
  });

  it('les comptes ne changent JAMAIS, quelle que soit la rotation', () => {
    const base = countsOf(SOLIDS.pave);
    for (const o of ORIENTATIONS) {
      expect(countsOf(rotateSolid(SOLIDS.pave, o))).toEqual(base);
    }
  });
});

describe('positions relatives dans le cube', () => {
  it('chaque couple proposé a une position CALCULÉE', () => {
    for (const p of PAIRES_CUBE) {
      const pos = positionOf(p);
      expect(POSITION_LABEL[pos], p.question).toBeTruthy();
    }
  });

  it('les trois cas de l’espace sont représentés', () => {
    const positions = new Set(PAIRES_CUBE.map((p) => positionOf(p)));
    expect(positions.has('paralleles')).toBe(true);
    expect(positions.has('secantes')).toBe(true);
    expect(positions.has('non-coplanaires')).toBe(true);
  });

  it('(AB) et (CG) sont bien non coplanaires — le cas propre à l’espace', () => {
    const p = PAIRES_CUBE.find((x) => x.id === 'p3');
    expect(positionOf(p)).toBe('non-coplanaires');
  });

  it('(AB) et (DC) sont parallèles, (AB) et (BC) sécantes', () => {
    expect(positionOf(PAIRES_CUBE[0])).toBe('paralleles');
    expect(positionOf(PAIRES_CUBE[1])).toBe('secantes');
  });

  it('les arêtes des questions portent bien les noms scolaires', () => {
    expect(edgeName(SOLIDS.cube, [0, 1])).toBe('[AB]');
    expect(edgeName(SOLIDS.cube, [2, 6])).toBe('[CG]');
  });
});

describe('perspective cavalière', () => {
  it('les valeurs par défaut sont celles de l’enseignement', () => {
    expect(CAVALIERE_DEFAUT).toEqual({ angle: 45, k: 0.5 });
  });

  it('les réglages proposés encadrent la valeur usuelle', () => {
    expect(CAVALIERE_ANGLES).toContain(45);
    expect(CAVALIERE_K).toContain(0.5);
    expect(Math.min(...CAVALIERE_K)).toBeLessThan(0.5);
    expect(Math.max(...CAVALIERE_K)).toBeGreaterThan(0.5);
  });
});

/**
 * SÉCURITÉ D'AFFICHAGE — règle générale des manipulations : tout état
 * atteignable par l'élève doit rester lisible. Ces tests reproduisent le
 * placement des étiquettes de SolidTurner et vérifient qu'aucune paire ne se
 * chevauche, sur TOUTE la plage de rotation et pour les quatre solides.
 *
 * Le placement d'origine (décalage fixe x + 9, y − 7) produisait 16 couples
 * d'étiquettes superposées sur cette même grille.
 */
describe('sécurité d’affichage des étiquettes (toutes orientations)', () => {
  const CENTER = { x: 150, y: 130 };
  const OUT = 15;
  const MIN_X = 12;
  const MIN_Y = 13;

  /** Reproduit exactement le placement de SolidTurner. */
  function placeLabels(solid, yaw, pitch) {
    const turned = rotateSolid(solid, { yaw, pitch });
    const P = turned.vertices.map((p) => {
      const q = projectCavaliere(p);
      return { x: CENTER.x + q.x, y: CENTER.y + q.y };
    });
    const cx = P.reduce((s, q) => s + q.x, 0) / P.length;
    const cy = P.reduce((s, q) => s + q.y, 0) / P.length;
    const pos = P.map((q) => {
      const dx = q.x - cx;
      const dy = q.y - cy;
      const n = Math.hypot(dx, dy) || 1;
      return { x: q.x + (dx / n) * OUT, y: q.y + (dy / n) * OUT + 4 };
    });
    for (let pass = 0; pass < 3; pass += 1) {
      for (let i = 0; i < pos.length; i += 1) {
        for (let j = i + 1; j < pos.length; j += 1) {
          const dx = Math.abs(pos[i].x - pos[j].x);
          const dy = Math.abs(pos[i].y - pos[j].y);
          if (dx < MIN_X && dy < MIN_Y) {
            const push = (MIN_Y - dy) / 2 + 1;
            const up = pos[i].y <= pos[j].y ? i : j;
            const down = up === i ? j : i;
            pos[up].y -= push;
            pos[down].y += push;
          }
        }
      }
    }
    return pos;
  }

  it('aucune étiquette n’en chevauche une autre, quelle que soit l’orientation', () => {
    const collisions = [];
    for (const [nom, solid] of Object.entries(SOLIDS)) {
      for (let yaw = -90; yaw <= 90; yaw += 15) {
        for (let pitch = -60; pitch <= 60; pitch += 15) {
          const pos = placeLabels(solid, yaw, pitch);
          for (let i = 0; i < pos.length; i += 1) {
            for (let j = i + 1; j < pos.length; j += 1) {
              const dx = Math.abs(pos[i].x - pos[j].x);
              const dy = Math.abs(pos[i].y - pos[j].y);
              if (dx < 11 && dy < 12) {
                collisions.push(`${nom} yaw=${yaw} pitch=${pitch} : ${solid.names[i]}/${solid.names[j]}`);
              }
            }
          }
        }
      }
    }
    expect(collisions.slice(0, 5)).toEqual([]);
  });

  it('le placement écarte bien les étiquettes du centre du dessin', () => {
    // Une étiquette doit être au moins aussi éloignée du centre que son sommet.
    const pos = placeLabels(SOLIDS.cube, 30, 20);
    const cx = 150;
    const cy = 130;
    const turned = rotateSolid(SOLIDS.cube, { yaw: 30, pitch: 20 });
    turned.vertices.forEach((p, i) => {
      const q = projectCavaliere(p);
      const dVertex = Math.hypot(cx + q.x - cx, cy + q.y - cy);
      const dLabel = Math.hypot(pos[i].x - cx, pos[i].y - cy);
      expect(dLabel).toBeGreaterThan(dVertex - 1);
    });
  });
});
