import { describe, it, expect } from 'vitest';
import { planeGeometry } from '../../../../../common/components/CoordPlane.jsx';
import { placeLabels, labelsOverlap, labelInFrame, axisObstacles } from './labelLayout';

/**
 * Balayer, ne pas échantillonner (§17bis) : pour CHAQUE position de C sur la
 * grille du laboratoire d'alignement, aucune étiquette ne chevauche une autre
 * ni ne sort du cadre.
 */
describe('placeLabels — laboratoire d’alignement, toute la grille', () => {
  const R = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
  const geo = planeGeometry(R, 34, { left: 30, right: 30, top: 30, bottom: 30 });
  const A = { x: -3, y: -1 }; const B = { x: 1, y: 1 };
  it('aucune collision, aucune sortie de cadre, pour les 167 positions de C', () => {
    let tested = 0;
    for (let x = R.xMin; x <= R.xMax; x += 1) for (let y = R.yMin; y <= R.yMax; y += 1) {
      if ((x === A.x && y === A.y) || (x === B.x && y === B.y)) continue;
      const pts = [{ id: 'A', name: 'A', ...A }, { id: 'B', name: 'B', ...B }, { id: 'C', name: 'C', x, y, r: 8 }];
      const anchors = pts.map((p) => ({ ...p, ...geo.toSvg(p.x, p.y) }));
      const segs = [{ from: geo.toSvg(A.x, A.y), to: geo.toSvg(B.x, B.y) }];
      const labels = placeLabels(anchors, geo, { segments: segs, obstacles: axisObstacles(geo) });
      for (const l of labels) expect(labelInFrame(l, geo), `${l.name} hors cadre pour C(${x} ; ${y})`).toBe(true);
      for (let i = 0; i < labels.length; i += 1) for (let j = i + 1; j < labels.length; j += 1) {
        expect(labelsOverlap(labels[i], labels[j]), `${labels[i].name} ↔ ${labels[j].name} pour C(${x} ; ${y})`).toBe(false);
      }
      tested += 1;
    }
    expect(tested).toBe(13 * 13 - 2);
  });
  it('un point posé sur un axe ne recouvre aucune graduation', () => {
    const bands = axisObstacles(geo);
    const overlaps = (box, o) => Math.min(box.x1, o.x1) > Math.max(box.x0, o.x0) + 1.5 && Math.min(box.y1, o.y1) > Math.max(box.y0, o.y0) + 1.5;
    for (let t = -6; t <= 6; t += 1) {
      for (const P of [{ x: 0, y: t }, { x: t, y: 0 }]) {
        const [l] = placeLabels([{ id: 'C', name: 'C', ...geo.toSvg(P.x, P.y) }], geo, { obstacles: bands });
        for (const o of bands) expect(overlaps(l.box, o), `C(${P.x} ; ${P.y})`).toBe(false);
        expect(labelInFrame(l, geo)).toBe(true);
      }
    }
  });

  it('un point au bord droit voit son nom basculer à gauche', () => {
    // Marge réduite : à droite, la place manque pour « P » — il bascule à gauche.
    const tight = planeGeometry(R, 34, 4);
    const p = tight.toSvg(6, 6);
    const [l] = placeLabels([{ id: 'P', name: 'P', ...p }], tight);
    expect(l.x).toBeLessThan(p.x);
    expect(labelInFrame(l, tight)).toBe(true);
  });
});
