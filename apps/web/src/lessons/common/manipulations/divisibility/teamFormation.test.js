import { describe, it, expect } from 'vitest';
import { formationRows, formationPositions, playerScale } from './teamFormation';

/**
 * L'INVARIANT VISUEL de la formation (INTERACTION_PEDAGOGY §17bis) : pour
 * TOUT effectif atteignable, deux joueurs ne se chevauchent jamais et aucun
 * ne sort du terrain. On balaie la plage entière au lieu d'échantillonner —
 * c'est la leçon de `SolidTurner`, dont le décalage d'étiquette était juste
 * à la valeur par défaut et faux à seize orientations.
 */

// La plage atteignable : le registre borne l'effectif à 60 et les équipes à
// 12, donc une équipe compte au plus 30 joueurs.
const REACHABLE = Array.from({ length: 31 }, (_, i) => i);

describe('formationRows — une composition, pas une grille', () => {
  it('place exactement l’effectif demandé, à chaque taille atteignable', () => {
    for (const n of REACHABLE) {
      expect(formationRows(n).reduce((s, k) => s + k, 0), `effectif ${n}`).toBe(n);
    }
  });

  it('un effectif nul ou négatif ne dessine rien', () => {
    expect(formationRows(0)).toEqual([]);
    expect(formationRows(-3)).toEqual([]);
  });

  it('commence par le gardien : la ligne du fond ne contient qu’un joueur', () => {
    for (const n of [2, 3, 5, 7, 11]) expect(formationRows(n)[0]).toBe(1);
  });

  it('une équipe réglementaire de 11 se lit comme une vraie composition', () => {
    expect(formationRows(11)).toEqual([1, 4, 4, 2]);
  });
});

describe('formationPositions — aucun chevauchement, rien hors du terrain', () => {
  it('rend une position par joueur', () => {
    for (const n of REACHABLE) expect(formationPositions(n)).toHaveLength(n);
  });

  it('garde tout le monde DANS la zone, à chaque effectif', () => {
    for (const n of REACHABLE) {
      for (const p of formationPositions(n)) {
        expect(p.x, `x à ${n}`).toBeGreaterThan(0);
        expect(p.x, `x à ${n}`).toBeLessThan(100);
        expect(p.y, `y à ${n}`).toBeGreaterThanOrEqual(0);
        expect(p.y, `y à ${n}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('ne superpose JAMAIS deux joueurs — balayage de toute la plage', () => {
    for (const n of REACHABLE) {
      const pts = formationPositions(n);
      for (let i = 0; i < pts.length; i += 1) {
        for (let j = i + 1; j < pts.length; j += 1) {
          const same = pts[i].x === pts[j].x && pts[i].y === pts[j].y;
          expect(same, `effectif ${n} : joueurs ${i} et ${j} au même point`).toBe(false);
        }
      }
    }
  });

  it('laisse un blanc entre deux voisins d’une même ligne', () => {
    for (const n of REACHABLE.filter((k) => k > 1)) {
      const pts = formationPositions(n);
      const scale = playerScale(n);
      const byRow = new Map();
      for (const p of pts) { if (!byRow.has(p.y)) byRow.set(p.y, []); byRow.get(p.y).push(p.x); }
      for (const [y, xs] of byRow) {
        xs.sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i += 1) {
          expect(xs[i] - xs[i - 1], `effectif ${n}, ligne ${y}`).toBeGreaterThanOrEqual(scale);
        }
      }
    }
  });

  it('centre une ligne unique au lieu de la coller en haut', () => {
    const [only] = formationPositions(1);
    expect(only.x).toBe(50);
    expect(only.y).toBeGreaterThan(16);
  });
});

describe('playerScale — la taille suit la ligne la plus chargée', () => {
  it('rétrécit quand la ligne s’allonge, et reste positive', () => {
    expect(playerScale(11)).toBeLessThan(playerScale(3));
    for (const n of REACHABLE.filter((k) => k > 0)) expect(playerScale(n)).toBeGreaterThan(0);
  });

  it('ne dépasse jamais un quart de la largeur, même à un seul joueur', () => {
    expect(playerScale(1)).toBeLessThanOrEqual(26);
  });
});
