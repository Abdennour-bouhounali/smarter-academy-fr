import { describe, it, expect } from 'vitest';
import { placeLabels, boxesOverlap, segmentObstacles, pointObstacle, textWidth } from './labelLayout';

/** Le cadre d'un CoordPlane −6…6 à 34 px/unité, marges 30. */
const UNIT = 34;
const PAD = 30;
const FRAME = { x: 0, y: 0, w: 12 * UNIT + 2 * PAD, h: 12 * UNIT + 2 * PAD };
const toSvg = (p) => ({ x: PAD + (p.x + 6) * UNIT, y: PAD + (6 - p.y) * UNIT });

/** Les bandes des graduations, comme dans VectorScene. */
const O = toSvg({ x: 0, y: 0 });
const AXIS_OBSTACLES = [
  { x: 0, y: O.y + 6, w: FRAME.w, h: 13 },
  { x: O.x - 28, y: 0, w: 22, h: FRAME.h },
];

function scene(A, B, names = ['A', 'B'], vecName = 'u') {
  const a = toSvg(A);
  const b = toSvg(B);
  const obstacles = [...AXIS_OBSTACLES, pointObstacle(a), pointObstacle(b), ...segmentObstacles(a, b)];
  const labels = [
    { id: 'A', text: names[0], size: 14, kind: 'point', anchor: a },
    { id: 'B', text: names[1], size: 14, kind: 'point', anchor: b },
    { id: 'u', text: vecName, size: 14, kind: 'arrow', from: a, to: b, pad: 2 },
  ];
  return { obstacles, labels };
}

const inside = (b) => b.x >= FRAME.x - 1e-6 && b.y >= FRAME.y - 1e-6
  && b.x + b.w <= FRAME.x + FRAME.w + 1e-6 && b.y + b.h <= FRAME.y + FRAME.h + 1e-6;

describe('placeLabels — balayage de la grille', () => {
  it('deux points + un nom de vecteur : jamais de chevauchement, jamais hors cadre, pour toute paire de la grille', () => {
    let clashes = 0;
    let outside = 0;
    let onObstacle = 0;
    let n = 0;
    for (let ax = -6; ax <= 6; ax += 2) for (let ay = -6; ay <= 6; ay += 2)
    for (let bx = -6; bx <= 6; bx += 2) for (let by = -6; by <= 6; by += 2) {
      const { obstacles, labels } = scene({ x: ax, y: ay }, { x: bx, y: by });
      const placed = placeLabels(labels, obstacles, FRAME);
      n += 1;
      for (const p of placed) if (!inside(p.box)) outside += 1;
      for (let i = 0; i < placed.length; i += 1) for (let j = i + 1; j < placed.length; j += 1) {
        if (boxesOverlap(placed[i].box, placed[j].box, 0)) clashes += 1;
      }
      for (const p of placed) for (const o of obstacles) if (boxesOverlap(p.box, o, 0)) { onObstacle += 1; break; }
    }
    expect(n).toBe(2401);
    expect(outside).toBe(0);
    expect(clashes).toBe(0);
    expect(onObstacle).toBe(0);
  });

  it('points confondus (vecteur nul) : les deux noms sont séparés', () => {
    const { obstacles, labels } = scene({ x: 2, y: -3 }, { x: 2, y: -3 });
    const placed = placeLabels(labels, obstacles, FRAME);
    expect(boxesOverlap(placed[0].box, placed[1].box, 0)).toBe(false);
    expect(boxesOverlap(placed[0].box, placed[2].box, 0)).toBe(false);
  });

  it('un point au coin : son nom bascule à l’intérieur', () => {
    for (const P of [{ x: 6, y: 6 }, { x: -6, y: -6 }, { x: 6, y: -6 }, { x: -6, y: 6 }]) {
      const { obstacles, labels } = scene(P, { x: 0, y: 1 }, ['Nom long', 'B']);
      const placed = placeLabels(labels, obstacles, FRAME);
      expect(inside(placed[0].box)).toBe(true);
    }
  });

  it('une flèche de 12 unités en diagonale : les étiquettes de l’escalier restent lisibles', () => {
    const A = { x: -6, y: -6 };
    const B = { x: 6, y: 6 };
    const a = toSvg(A);
    const b = toSvg(B);
    const corner = toSvg({ x: 6, y: -6 });
    const obstacles = [...AXIS_OBSTACLES, pointObstacle(a), pointObstacle(b), ...segmentObstacles(a, b),
      ...segmentObstacles(a, corner), ...segmentObstacles(corner, b)];
    const labels = [
      { id: 'A', text: 'A', size: 14, kind: 'point', anchor: a },
      { id: 'B', text: 'B', size: 14, kind: 'point', anchor: b },
      { id: 'u', text: 'AB', size: 14, kind: 'arrow', from: a, to: b, pad: 2 },
      { id: 'dx', text: '+12', size: 12, kind: 'arrow', from: a, to: corner },
      { id: 'dy', text: '+12', size: 12, kind: 'arrow', from: corner, to: b },
    ];
    const placed = placeLabels(labels, obstacles, FRAME);
    for (const p of placed) expect(inside(p.box)).toBe(true);
    for (let i = 0; i < placed.length; i += 1) for (let j = i + 1; j < placed.length; j += 1) {
      expect(boxesOverlap(placed[i].box, placed[j].box, 0)).toBe(false);
    }
  });

  it('escalier : pour tout vecteur court depuis tout point, les marches restent lisibles', () => {
    let bad = 0;
    let n = 0;
    for (let ax = -6; ax <= 6; ax += 1) for (let ay = -6; ay <= 6; ay += 1)
    for (let vx = -2; vx <= 2; vx += 1) for (let vy = -2; vy <= 2; vy += 1) {
      const A = { x: ax, y: ay };
      const B = { x: ax + vx, y: ay + vy };
      if (Math.abs(B.x) > 6 || Math.abs(B.y) > 6 || (vx === 0 && vy === 0)) continue;
      const a = toSvg(A); const b = toSvg(B); const corner = toSvg({ x: B.x, y: A.y });
      const obstacles = [...AXIS_OBSTACLES, pointObstacle(a), pointObstacle(b), ...segmentObstacles(a, b),
        ...(vx ? segmentObstacles(a, corner, 6) : []), ...(vy ? segmentObstacles(corner, b, 6) : [])];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const labels = [
        { id: 'A', text: 'A', size: 14, kind: 'point', anchor: a },
        { id: 'B', text: 'B', size: 14, kind: 'point', anchor: b },
        { id: 'u', text: 'u', size: 14, kind: 'arrow', from: a, to: b, pad: 3 },
        ...(vx ? [{ id: 'dx', text: `${vx > 0 ? '+' : '−'}${Math.abs(vx)}`, size: 12, kind: 'arrow', from: a, to: corner, avoid: mid }] : []),
        ...(vy ? [{ id: 'dy', text: `${vy > 0 ? '+' : '−'}${Math.abs(vy)}`, size: 12, kind: 'arrow', from: corner, to: b, avoid: mid }] : []),
      ];
      const placed = placeLabels(labels, obstacles, FRAME);
      n += 1;
      for (const p of placed) if (!inside(p.box)) bad += 1;
      for (let i = 0; i < placed.length; i += 1) for (let j = i + 1; j < placed.length; j += 1) if (boxesOverlap(placed[i].box, placed[j].box, 0)) bad += 1;
      for (const p of placed) for (const o of obstacles) if (boxesOverlap(p.box, o, 0)) { bad += 1; break; }
    }
    expect(n).toBeGreaterThan(3000);
    expect(bad).toBe(0);
  });

  it('textWidth croît avec le texte et compte les emojis larges', () => {
    expect(textWidth('AB', 14)).toBeGreaterThan(textWidth('A', 14));
    expect(textWidth('🤖', 14)).toBeGreaterThan(textWidth('A', 14));
  });
});
