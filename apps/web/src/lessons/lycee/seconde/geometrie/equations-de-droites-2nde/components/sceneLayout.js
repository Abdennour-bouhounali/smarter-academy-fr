/**
 * sceneLayout — où poser chaque étiquette d'une scène « droite » (nom de A,
 * du vecteur u, des points, des marches d'escalier) pour qu'aucune ne touche
 * une autre, un point, une flèche, la droite, une graduation, ni ne sorte du
 * cadre — pour TOUT état atteignable (INTERACTION_PEDAGOGY §17bis).
 *
 * Pur (pixels SVG), testé par un balayage de grille dans sceneLayout.test.js.
 * `LineScene` l'appelle depuis l'`overlay` de CoordPlane et ne décide jamais
 * d'un décalage fixe.
 */
import { placeLabels, pointObstacle, segmentObstacles, textWidth } from './labelLayout';

/** Obstacles reproduisant le décor de CoordPlane : graduations, axes, O, noms d'axes. */
export function planeObstacles(range, toSvg, geo) {
  const O = toSvg(0, 0);
  const out = [];
  for (let v = Math.ceil(range.xMin); v <= range.xMax; v += 1) {
    if (v === 0) continue;
    const p = toSvg(v, 0);
    const w = textWidth(String(v).replace('-', '−'), 10);
    out.push({ x: p.x - w / 2, y: O.y + 8, w, h: 11 });
  }
  for (let v = Math.ceil(range.yMin); v <= range.yMax; v += 1) {
    if (v === 0) continue;
    const p = toSvg(0, v);
    const w = textWidth(String(v).replace('-', '−'), 10);
    out.push({ x: O.x - 8 - w, y: p.y - 5, w, h: 11 });
  }
  // Les deux axes (traits) et leurs noms, le « O ».
  out.push({ x: 0, y: O.y - 3, w: geo.width, h: 6 });
  out.push({ x: O.x - 3, y: 0, w: 6, h: geo.height });
  const xEnd = toSvg(range.xMax, 0);
  const yEnd = toSvg(0, range.yMax);
  out.push({ x: xEnd.x + 8, y: O.y - 6, w: 14, h: 14 });
  out.push({ x: O.x - 6, y: yEnd.y - 22, w: 12, h: 14 });
  out.push({ x: O.x - 16, y: O.y + 6, w: 9, h: 12 });
  return out;
}

/**
 * @param scene { A?, T?, points:[{id,name,x,y}], segments:[{from,to}] (droite, flèches, marches),
 *                labels:[{id,text,size?,kind:'point'|'arrow',anchor|from,to,prefer?}] en coordonnées d'élève }
 * @returns [{ id, text, size, x, y, box }] en pixels SVG
 */
export function layoutScene(scene, range, toSvg, geo) {
  const frame = { x: 2, y: 2, w: geo.width - 4, h: geo.height - 4 };
  const obstacles = planeObstacles(range, toSvg, geo);
  for (const p of scene.points ?? []) obstacles.push(pointObstacle(toSvg(p.x, p.y)));
  for (const s of scene.segments ?? []) {
    obstacles.push(...segmentObstacles(toSvg(s.from.x, s.from.y), toSvg(s.to.x, s.to.y), s.size ?? 7));
  }
  const labels = (scene.labels ?? []).map((l) => (l.kind === 'arrow'
    ? { id: l.id, text: l.text, size: l.size ?? 14, kind: 'arrow', from: toSvg(l.from.x, l.from.y), to: toSvg(l.to.x, l.to.y) }
    : { id: l.id, text: l.text, size: l.size ?? 14, kind: 'point', anchor: toSvg(l.anchor.x, l.anchor.y), prefer: l.prefer ?? 'ne' }));
  return placeLabels(labels, obstacles, frame);
}

/** Vérification (tests) : deux boîtes se chevauchent-elles ? */
export function overlaps(a, b, gap = 0) {
  return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
}
