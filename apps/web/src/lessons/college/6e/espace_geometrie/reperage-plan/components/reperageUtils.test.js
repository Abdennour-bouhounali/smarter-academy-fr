import { describe, it, expect } from 'vitest';
import {
  makeGrid, gridToSvg, svgToGrid, cellCenterToSvg, clampNode, samePoint,
  swapNode, isOnDiagonal, formatCoords, readCoords, formatCell, cellOf, nodeOfCell,
  displacement, describeDisplacement, runProgram, shortestProgram, sameRow, sameCol,
} from './reperageUtils';

const grid = makeGrid({ cols: 7, rows: 6, step: 40 });

describe('quadrillage et projection SVG', () => {
  it('compte les nœuds, pas les cases : 7×6 intervalles → 8×7 nœuds', () => {
    expect(grid.cols).toBe(7);
    expect(grid.rows).toBe(6);
    expect(grid.width).toBe(grid.padLeft + 7 * 40 + grid.padRight);
  });

  it('inverse l’axe vertical : la 2e coordonnée monte quand y descend', () => {
    const bas = gridToSvg(grid, 0, 0);
    const haut = gridToSvg(grid, 0, 6);
    expect(haut.y).toBeLessThan(bas.y);
    expect(bas.y - haut.y).toBe(6 * 40);
  });

  it('gridToSvg et svgToGrid sont réciproques sur tous les nœuds', () => {
    for (let col = 0; col <= grid.cols; col += 1) {
      for (let row = 0; row <= grid.rows; row += 1) {
        const { x, y } = gridToSvg(grid, col, row);
        expect(svgToGrid(grid, x, y)).toEqual({ col, row });
      }
    }
  });

  it('svgToGrid accroche au nœud le plus proche et reste dans le quadrillage', () => {
    const { x, y } = gridToSvg(grid, 3, 4);
    expect(svgToGrid(grid, x + 9, y - 9)).toEqual({ col: 3, row: 4 });
    expect(svgToGrid(grid, -9999, -9999)).toEqual({ col: 0, row: 6 });
    expect(svgToGrid(grid, 9999, 9999)).toEqual({ col: 7, row: 0 });
  });

  it('le centre d’une case tombe entre ses quatre nœuds', () => {
    const c = cellCenterToSvg(grid, 2, 3);
    const bl = gridToSvg(grid, 2, 3);
    const tr = gridToSvg(grid, 3, 4);
    expect(c.x).toBeGreaterThan(bl.x);
    expect(c.x).toBeLessThan(tr.x);
    expect(c.y).toBeLessThan(bl.y);
    expect(c.y).toBeGreaterThan(tr.y);
  });
});

describe('points', () => {
  it('clampNode interdit toute coordonnée négative (périmètre 6e)', () => {
    expect(clampNode({ col: -4, row: -1 }, grid)).toEqual({ col: 0, row: 0 });
    expect(clampNode({ col: 99, row: 99 }, grid)).toEqual({ col: 7, row: 6 });
    expect(clampNode({ col: 2.4, row: 3.6 }, grid)).toEqual({ col: 2, row: 4 });
  });

  it('samePoint compare les deux coordonnées, pas la référence', () => {
    expect(samePoint({ col: 2, row: 5 }, { col: 2, row: 5 })).toBe(true);
    expect(samePoint({ col: 2, row: 5 }, { col: 5, row: 2 })).toBe(false);
    expect(samePoint(null, { col: 1, row: 1 })).toBe(false);
  });

  it('swapNode échange les rôles — le geste central du module 2', () => {
    expect(swapNode({ col: 2, row: 5 })).toEqual({ col: 5, row: 2 });
    // Échanger deux fois revient au point de départ.
    expect(swapNode(swapNode({ col: 2, row: 5 }))).toEqual({ col: 2, row: 5 });
  });

  it('seuls les points de la diagonale sont invariants par échange', () => {
    expect(isOnDiagonal({ col: 4, row: 4 })).toBe(true);
    expect(isOnDiagonal({ col: 2, row: 5 })).toBe(false);
    for (const n of [{ col: 0, row: 0 }, { col: 3, row: 3 }, { col: 1, row: 6 }]) {
      expect(samePoint(n, swapNode(n))).toBe(isOnDiagonal(n));
    }
  });
});

describe('écritures françaises', () => {
  it('formatCoords suit la convention (3 ; 5) avec espaces fines', () => {
    const s = formatCoords({ col: 3, row: 5 });
    expect(s.startsWith('(')).toBe(true);
    expect(s.endsWith(')')).toBe(true);
    expect(s).toContain(';');
    expect(s.replace(/\s/g, '')).toBe('(3;5)');
  });

  it('readCoords nomme les deux rôles pour les lecteurs d’écran', () => {
    expect(readCoords({ col: 3, row: 5 })).toBe('abscisse 3, ordonnée 5');
  });

  it('formatCell utilise lettres et numéros comptés à partir de 1', () => {
    expect(formatCell(0, 0)).toBe('A1');
    expect(formatCell(1, 2)).toBe('B3');
  });

  it('cellOf et nodeOfCell sont réciproques', () => {
    const n = { col: 4, row: 2 };
    const c = cellOf(n);
    expect(nodeOfCell(c.colonne, c.ligne)).toEqual(n);
  });
});

describe('déplacements', () => {
  it('décompose en pas horizontaux et verticaux, sans nombre négatif', () => {
    const d = displacement({ col: 2, row: 5 }, { col: 6, row: 3 });
    expect(d).toMatchObject({
      horizontal: 4, vertical: 2, horizontalDir: 'droite', verticalDir: 'bas', total: 6,
    });
    expect(d.horizontal).toBeGreaterThanOrEqual(0);
    expect(d.vertical).toBeGreaterThanOrEqual(0);
  });

  it('nomme la direction plutôt que d’utiliser un signe', () => {
    expect(describeDisplacement({ col: 0, row: 0 }, { col: 2, row: 3 }))
      .toBe('2 pas vers la droite et 3 pas vers le haut');
    expect(describeDisplacement({ col: 2, row: 5 }, { col: 6, row: 3 }))
      .toBe('4 pas vers la droite et 2 pas vers le bas');
    expect(describeDisplacement({ col: 1, row: 1 }, { col: 1, row: 4 }))
      .toBe('3 pas vers le haut');
    expect(describeDisplacement({ col: 3, row: 3 }, { col: 3, row: 3 }))
      .toBe('aucun déplacement : on y est déjà');
  });

  it('le total est la somme des deux composantes, jamais leur produit', () => {
    // Le distracteur classique du boss : 2 et 3 pas → 5, pas 6.
    expect(displacement({ col: 0, row: 0 }, { col: 2, row: 3 }).total).toBe(5);
  });

  it('runProgram déroule le trajet et reste dans le quadrillage', () => {
    const path = runProgram({ col: 0, row: 0 }, ['R', 'R', 'U'], grid);
    expect(path).toEqual([
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 2, row: 1 },
    ]);
    // Un pas hors quadrillage est borné, pas ignoré : le robot bute au bord.
    const stuck = runProgram({ col: 0, row: 0 }, ['L', 'D'], grid);
    expect(stuck[stuck.length - 1]).toEqual({ col: 0, row: 0 });
  });

  it('shortestProgram atteint la cible, en L, avec le bon nombre de pas', () => {
    const from = { col: 1, row: 4 }; const to = { col: 5, row: 1 };
    const prog = shortestProgram(from, to);
    expect(prog).toHaveLength(displacement(from, to).total);
    const path = runProgram(from, prog, grid);
    expect(path[path.length - 1]).toEqual(to);
    // Horizontale d'abord : le trajet « en L » de référence.
    expect(prog[0]).toBe('R');
    expect(prog[prog.length - 1]).toBe('D');
  });
});

describe('alignements — ce que la leçon suivante reprendra', () => {
  it('détecte une ligne horizontale et une ligne verticale', () => {
    const h = [{ col: 1, row: 2 }, { col: 4, row: 2 }, { col: 7, row: 2 }];
    const v = [{ col: 3, row: 0 }, { col: 3, row: 2 }, { col: 3, row: 6 }];
    expect(sameRow(h)).toBe(true);
    expect(sameCol(h)).toBe(false);
    expect(sameCol(v)).toBe(true);
    expect(sameRow(v)).toBe(false);
    expect(sameRow([{ col: 1, row: 2 }, { col: 4, row: 3 }])).toBe(false);
  });
});
