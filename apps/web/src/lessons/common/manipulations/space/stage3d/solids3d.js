/**
 * Les BRIQUES 3D des labs de l'unité 14 « الهندسة في الفضاء » — des fabriques three.js en coordonnées MATHÉMATIQUES (z vers le
 * haut, voir spaceStage.js › toThree). Chaque fabrique rend un objet prêt à `stage.add(...)` ; un lab ne réécrit jamais une
 * sphère, un pavé ou une ligne pointillée.
 *
 *   sphere(R, { at, color, opacity })          la كرة (surface, verre)       ball(R, …)        la جلّة (pleine, mate)
 *   box([lx, ly, lz], { at })                  pavé, coin en `at`            cylinder(r, h, …)  axe vertical, base en `at`
 *   cone(r, h, …)   frustum(rBottom, rTop, h, { open })   pyramid(baseSide, h, …)  (base carrée centrée sous le sommet)
 *   ring(center, r, { normal, color, tube })   un cercle épais (section, grand cercle)
 *   disc(center, r, { normal })                une section circulaire pleine   polygon(points, …)  une section polygonale
 *   plane(center, { normal, size })            un plan translucide (P)         line(points, { dashed })   segment(a, b, …)
 *   dot(at, { radius, color })                 un point                       handle(at, …)       une poignée (grosse, déplaçable)
 *   edges(mesh, { color })                      les arêtes d'un pavé / d'une pyramide
 *   setAt(obj, [x, y, z])                       place un objet (mathématique)
 * Les couleurs sont celles de la charte des labs (indigo / sky / emerald / amber / rose) ; la transparence est réglée pour
 * que l'intérieur d'une boule reste lisible.
 */
import {
  Mesh, Group, SphereGeometry, BoxGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, CircleGeometry, PlaneGeometry,
  BufferGeometry, Float32BufferAttribute, EdgesGeometry, LineSegments, Line, LineBasicMaterial, LineDashedMaterial,
  MeshStandardMaterial, MeshPhysicalMaterial, DoubleSide, Vector3, Quaternion,
} from 'three';
import { toThree } from './spaceStage';

const COLORS = Object.freeze({
  indigo: '#4f46e5', sky: '#0284c7', emerald: '#059669', amber: '#d97706', rose: '#e11d48', slate: '#334155', violet: '#7c3aed',
  glass: '#93c5fd', water: '#38bdf8', ink: '#0f172a', white: '#ffffff',
});
const col = (c) => COLORS[c] ?? c;

/** Place un objet à une position mathématique. */
export const setAt = (obj, at) => { obj.position.copy(toThree(at)); return obj; };
/** Oriente l'axe Y local (three) d'un objet le long d'une normale MATHÉMATIQUE. */
function alignY(obj, normalMath) {
  const n = toThree(normalMath).normalize();
  obj.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), n));
  return obj;
}
const NORMALS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const asNormal = (n) => (typeof n === 'string' ? NORMALS[n] : n ?? NORMALS.z);

/** Un matériau de verre (surface translucide, les deux faces). */
const glass = (color = 'glass', opacity = 0.28) => new MeshPhysicalMaterial({
  color: col(color), transparent: true, opacity, roughness: 0.15, metalness: 0, side: DoubleSide, depthWrite: false, clearcoat: 0.6,
});
/** Un matériau mat (solide plein). */
export const solidMat = (color = 'indigo', opacity = 1) => new MeshStandardMaterial({
  color: col(color), roughness: 0.55, metalness: 0.05, transparent: opacity < 1, opacity, side: opacity < 1 ? DoubleSide : undefined,
});

/** La كرة : une SURFACE (verre). */
export function sphere(R, { at = [0, 0, 0], color = 'glass', opacity = 0.28, segments = 64 } = {}) {
  return setAt(new Mesh(new SphereGeometry(R, segments, Math.round(segments * 0.66)), glass(color, opacity)), at);
}
/** La جلّة : un SOLIDE plein (mat). */
export function ball(R, { at = [0, 0, 0], color = 'indigo', opacity = 1, segments = 64 } = {}) {
  return setAt(new Mesh(new SphereGeometry(R, segments, Math.round(segments * 0.66)), solidMat(color, opacity)), at);
}
/** Un pavé lx × ly × lz (le long de x, y, z mathématiques), coin minimal en `at`. */
export function box([lx, ly, lz], { at = [0, 0, 0], color = 'sky', opacity = 0.3, material } = {}) {
  const g = new BoxGeometry(lx, lz, ly).translate(lx / 2, lz / 2, -ly / 2);
  return setAt(new Mesh(g, material ?? (opacity < 1 ? glass(color, opacity) : solidMat(color))), at);
}
/** Un cylindre d'axe vertical, base (centre) en `at`. */
export function cylinder(r, h, { at = [0, 0, 0], color = 'sky', opacity = 0.3, open = false, segments = 72 } = {}) {
  const g = new CylinderGeometry(r, r, h, segments, 1, open).translate(0, h / 2, 0);
  return setAt(new Mesh(g, opacity < 1 ? glass(color, opacity) : solidMat(color)), at);
}
/** Un cône d'axe vertical, base (centre) en `at`, sommet au-dessus. */
export function cone(r, h, { at = [0, 0, 0], color = 'amber', opacity = 0.3, segments = 72 } = {}) {
  const g = new ConeGeometry(r, h, segments, 1).translate(0, h / 2, 0);
  return setAt(new Mesh(g, opacity < 1 ? glass(color, opacity) : solidMat(color)), at);
}
/** Un tronc de cône d'axe vertical (rayon du bas, rayon du haut), base en `at` ; `open` = sans couvercle (un seau). */
export function frustum(rBottom, rTop, h, { at = [0, 0, 0], color = 'slate', opacity = 0.3, open = true, segments = 72 } = {}) {
  const g = new CylinderGeometry(rTop, rBottom, h, segments, 1, open).translate(0, h / 2, 0);
  return setAt(new Mesh(g, opacity < 1 ? glass(color, opacity) : solidMat(color)), at);
}
/** Une pyramide régulière à base carrée de côté `side` (centrée en `at`, posée sur z = at.z), sommet à la hauteur h. */
export function pyramid(side, h, { at = [0, 0, 0], color = 'amber', opacity = 0.3 } = {}) {
  const g = new ConeGeometry(side / Math.SQRT2, h, 4, 1).rotateY(Math.PI / 4).translate(0, h / 2, 0);
  return setAt(new Mesh(g, opacity < 1 ? glass(color, opacity) : solidMat(color)), at);
}
/** Les arêtes vives d'un maillage (pavé, pyramide, cylindre : les bords). */
export function edges(mesh, { color = 'slate', opacity = 0.9, threshold = 20 } = {}) {
  const l = new LineSegments(new EdgesGeometry(mesh.geometry, threshold), new LineBasicMaterial({ color: col(color), transparent: true, opacity }));
  l.position.copy(mesh.position); l.quaternion.copy(mesh.quaternion); l.scale.copy(mesh.scale);
  return l;
}
/** Une ligne brisée (points mathématiques), pleine ou pointillée. */
export function line(points, { color = 'slate', dashed = false, dash = 0.18, gap = 0.12, opacity = 1 } = {}) {
  const g = new BufferGeometry().setFromPoints(points.map(toThree));
  const m = dashed
    ? new LineDashedMaterial({ color: col(color), dashSize: dash, gapSize: gap, transparent: opacity < 1, opacity })
    : new LineBasicMaterial({ color: col(color), transparent: opacity < 1, opacity });
  const l = new Line(g, m);
  if (dashed) l.computeLineDistances();
  return l;
}
export const segment = (a, b, opts) => line([a, b], opts);
/** Un cercle ÉPAIS (tore fin) de centre `center`, de rayon r, dans le plan de normale `normal`. */
export function ring(center, r, { normal = 'z', color = 'rose', tube = 0.035, opacity = 1 } = {}) {
  const t = new Mesh(new TorusGeometry(r, tube, 10, 120).rotateX(Math.PI / 2), solidMat(color, opacity));
  return alignY(setAt(t, center), asNormal(normal));
}
/** Un disque plein (section circulaire). */
export function disc(center, r, { normal = 'z', color = 'emerald', opacity = 0.55 } = {}) {
  const d = new Mesh(new CircleGeometry(r, 96).rotateX(-Math.PI / 2), solidMat(color, opacity));
  d.material.side = DoubleSide; d.material.depthWrite = false;
  return alignY(setAt(d, center), asNormal(normal));
}
/** Un polygone plein (section) de sommets mathématiques (convexe : triangulation en éventail). */
export function polygon(points, { color = 'emerald', opacity = 0.55 } = {}) {
  const v = points.map(toThree);
  const pos = [];
  for (let i = 1; i < v.length - 1; i += 1) pos.push(...v[0].toArray(), ...v[i].toArray(), ...v[i + 1].toArray());
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  const m = solidMat(color, opacity); m.side = DoubleSide; m.depthWrite = false;
  return new Mesh(g, m);
}
/** Un plan translucide carré de côté `size` centré en `center`, de normale `normal`. */
export function plane(center, { normal = 'z', size = 6, color = 'sky', opacity = 0.18 } = {}) {
  const p = new Mesh(new PlaneGeometry(size, size).rotateX(-Math.PI / 2), glass(color, opacity));
  return alignY(setAt(p, center), asNormal(normal));
}
/** Un point (petite bille). */
export const dot = (at, { radius = 0.07, color = 'ink' } = {}) => setAt(new Mesh(new SphereGeometry(radius, 18, 12), solidMat(color)), at);
/** Une poignée déplaçable (grosse bille vive) — la cible ≥ 44 px reste à la charge du lab (taille de scène). */
export const handle = (at, { radius = 0.16, color = 'amber' } = {}) => {
  const g = new Group();
  g.add(new Mesh(new SphereGeometry(radius, 24, 16), solidMat(color)));
  g.add(new Mesh(new SphereGeometry(radius * 1.9, 16, 12), glass(color, 0.18)));
  return setAt(g, at);
};
