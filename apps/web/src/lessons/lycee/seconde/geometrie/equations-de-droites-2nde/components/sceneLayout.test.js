import { describe, it, expect } from 'vitest';
import { planeGeometry } from '../../../../../common/components/CoordPlane';
import { layoutScene, overlaps, planeObstacles } from './sceneLayout';
import { pointObstacle } from './labelLayout';
import { addVec, clipLine, RANGE, pointAt } from './lineUtils';

/** Même géométrie que CoordPlane pour un cadre −6…6 (marges mesurées ≈ 30 px). */
const geo = planeGeometry(RANGE, 34, { left: 30, right: 32, top: 30, bottom: 30 });
const frame = { x: 2, y: 2, w: geo.width - 4, h: geo.height - 4 };
const inFrame = (b) => b.x >= frame.x && b.y >= frame.y && b.x + b.w <= frame.x + frame.w && b.y + b.h <= frame.y + frame.h;

function sceneFor(A, u, extra = []) {
  const T = addVec(A, u);
  const chord = clipLine({ A, u }, RANGE);
  const points = [{ id: 'A', ...A }, { id: 'T', ...T }, ...extra];
  return {
    points,
    segments: [{ from: chord[0], to: chord[1], size: 7 }, { from: A, to: T, size: 8 }],
    labels: [
      { id: 'A', text: 'A', kind: 'point', anchor: A, prefer: 'nw' },
      { id: 'u', text: 'u', kind: 'arrow', from: A, to: T },
      ...extra.map((p) => ({ id: p.id, text: p.name, kind: 'point', anchor: p, prefer: 'ne' })),
    ],
  };
}

describe('sceneLayout — balayage de toute la grille du laboratoire', () => {
  it('A et u partout dans le cadre : aucune étiquette ne chevauche une autre, un point, ni ne sort', () => {
    const clashes = [];
    let states = 0;
    for (let ax = -6; ax <= 6; ax += 2) for (let ay = -6; ay <= 6; ay += 2) {
      for (let ux = -6; ux <= 6; ux += 1) for (let uy = -6; uy <= 6; uy += 1) {
        if (ux === 0 && uy === 0) continue;
        const A = { x: ax, y: ay }; const T = { x: ax + ux, y: ay + uy };
        if (T.x < -6 || T.x > 6 || T.y < -6 || T.y > 6) continue;
        states += 1;
        const scene = sceneFor(A, { x: ux, y: uy });
        const placed = layoutScene(scene, RANGE, geo.toSvg, geo);
        const pts = scene.points.map((p) => pointObstacle(geo.toSvg(p.x, p.y), 6));
        for (let i = 0; i < placed.length; i += 1) {
          if (!inFrame(placed[i].box)) clashes.push(`hors cadre ${placed[i].id} A${ax},${ay} u${ux},${uy}`);
          for (const p of pts) if (overlaps(placed[i].box, p)) clashes.push(`sur un point ${placed[i].id} A${ax},${ay} u${ux},${uy}`);
          for (let j = i + 1; j < placed.length; j += 1) {
            if (overlaps(placed[i].box, placed[j].box)) clashes.push(`${placed[i].id}↔${placed[j].id} A${ax},${ay} u${ux},${uy}`);
          }
        }
      }
    }
    expect(states).toBeGreaterThan(3000);
    expect(clashes.slice(0, 10)).toEqual([]);
  });

  it('un point M mobile partout, avec A et u fixes (module 3)', () => {
    const A = { x: 1, y: 3 }; const u = { x: 1, y: 2 };
    const clashes = [];
    for (let mx = -6; mx <= 6; mx += 1) for (let my = -6; my <= 6; my += 1) {
      if ((mx === A.x && my === A.y) || (mx === A.x + u.x && my === A.y + u.y)) continue;
      const scene = sceneFor(A, u, [{ id: 'M', name: 'M', x: mx, y: my }]);
      const placed = layoutScene(scene, RANGE, geo.toSvg, geo);
      for (let i = 0; i < placed.length; i += 1) {
        if (!inFrame(placed[i].box)) clashes.push(`hors cadre ${placed[i].id} M${mx},${my}`);
        for (let j = i + 1; j < placed.length; j += 1) if (overlaps(placed[i].box, placed[j].box)) clashes.push(`${placed[i].id}↔${placed[j].id} M${mx},${my}`);
      }
    }
    expect(clashes.slice(0, 10)).toEqual([]);
  });

  it('le marcheur : M = A + t·u et ses deux marches étiquetées, pour tout t', () => {
    const A = { x: -2, y: -1 }; const u = { x: 2, y: 1 };
    const clashes = [];
    for (let t = -2; t <= 3; t += 1) {
      if (t === 0 || t === 1) continue; // M confondu avec A ou avec la pointe : la scène n'a pas de M
      const M = pointAt(A, u, t);
      const corner = { x: M.x, y: A.y };
      const scene = sceneFor(A, u, [{ id: 'M', name: 'M', ...M }]);
      scene.segments.push({ from: A, to: corner, size: 6 }, { from: corner, to: M, size: 6 });
      scene.labels.push({ id: 'dx', text: `${t * u.x >= 0 ? '+' : '−'}${Math.abs(t * u.x)}`, kind: 'arrow', from: A, to: corner, size: 12 });
      scene.labels.push({ id: 'dy', text: `${t * u.y >= 0 ? '+' : '−'}${Math.abs(t * u.y)}`, kind: 'arrow', from: corner, to: M, size: 12 });
      const placed = layoutScene(scene, RANGE, geo.toSvg, geo);
      for (let i = 0; i < placed.length; i += 1) {
        if (!inFrame(placed[i].box)) clashes.push(`hors cadre ${placed[i].id} t=${t}`);
        for (let j = i + 1; j < placed.length; j += 1) if (overlaps(placed[i].box, placed[j].box)) clashes.push(`${placed[i].id}↔${placed[j].id} t=${t}`);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('les obstacles du décor couvrent les graduations des deux axes', () => {
    const obs = planeObstacles(RANGE, geo.toSvg, geo);
    expect(obs.length).toBeGreaterThan(24);
  });
});
