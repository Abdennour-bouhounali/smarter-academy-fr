import { describe, it, expect } from 'vitest';
import { resolveScene, dependentsOf, removeObjects, nextName, nextColor, snap, clampCoord, VECTOR_PALETTE } from './vectorScene.js';
import {
  emptyScene, addFreePoint, addPointsVector, addFreeVector, addCombination, addScaled,
  addMidpoint, addImagePoint, addPolygon, translatePolygon, movePoint, moveVectorTip,
  moveVectorOrigin, setScalar,
} from './vectorState.js';

/**
 * Les DÉPENDANCES (§38) : « Moving A must automatically update dependent
 * objects ». Ici, rien n'est « mis à jour » — un objet dérivé n'a jamais
 * gardé de coordonnées. Ces tests vérifient que la chaîne complète suit,
 * aussi profonde soit-elle.
 */

/** Une scène de travail : A, B, ⃗AB, et ce qu'on empile dessus. */
function baseScene() {
  let scene = emptyScene();
  scene = addFreePoint(scene, { x: 2, y: 3, name: 'A' });
  scene = addFreePoint(scene, { x: 6, y: 5, name: 'B' });
  const [a, b] = scene.points;
  scene = addPointsVector(scene, a.id, b.id);

  return { scene, aId: a.id, bId: b.id, abId: scene.vectors[0].id };
}

describe('résolution : ⃗AB (§5)', () => {
  it('⃗AB a pour composantes B − A, et part de A', () => {
    const { scene, abId } = baseScene();
    const ab = resolveScene(scene).vectors.get(abId);
    expect(ab.components).toEqual({ x: 4, y: 2 });
    expect(ab.origin).toEqual({ x: 2, y: 3 });
    expect(ab.tip).toEqual({ x: 6, y: 5 });
  });

  it('déplacer A change ⃗AB — sans que rien n’ait été « mis à jour »', () => {
    const { scene, aId, abId } = baseScene();
    const moved = movePoint(scene, aId, 0, 0);
    const ab = resolveScene(moved).vectors.get(abId);
    expect(ab.components).toEqual({ x: 6, y: 5 });
    expect(ab.origin).toEqual({ x: 0, y: 0 });
  });

  it('un point tenu par une construction n’est pas glissable', () => {
    const { scene, aId, bId } = baseScene();
    const withMid = addMidpoint(scene, aId, bId);
    const resolved = resolveScene(withMid);
    expect(resolved.points.get(aId).draggable).toBe(true);
    expect([...resolved.points.values()].find((p) => p.kind === 'midpoint').draggable).toBe(false);
  });
});

describe('résolution : le شعاع libre (§6, §7)', () => {
  it('déplacer son ORIGINE ne change pas ses composantes', () => {
    let scene = addFreeVector(emptyScene(), { x: 3, y: 2, origin: { x: 0, y: 0 } });
    const id = scene.vectors[0].id;
    scene = moveVectorOrigin(scene, id, -4, 1);
    const u = resolveScene(scene).vectors.get(id);
    expect(u.components).toEqual({ x: 3, y: 2 });
    expect(u.origin).toEqual({ x: -4, y: 1 });
    expect(u.tip).toEqual({ x: -1, y: 3 });
  });

  it('déplacer son EXTRÉMITÉ change ses composantes : (3,2) → (5,4)', () => {
    let scene = addFreeVector(emptyScene(), { x: 3, y: 2, origin: { x: 0, y: 0 } });
    const id = scene.vectors[0].id;
    scene = moveVectorTip(scene, id, 5, 4);
    expect(resolveScene(scene).vectors.get(id).components).toEqual({ x: 5, y: 4 });
  });

  it('l’extrémité est relative à l’origine : un شعاع posé en (1,1) tiré en (5,4) vaut (4,3)', () => {
    let scene = addFreeVector(emptyScene(), { x: 3, y: 2, origin: { x: 1, y: 1 } });
    const id = scene.vectors[0].id;
    scene = moveVectorTip(scene, id, 5, 4);
    expect(resolveScene(scene).vectors.get(id).components).toEqual({ x: 4, y: 3 });
  });
});

describe('résolution : les opérations (§11, §13, §14)', () => {
  function twoVectors() {
    let scene = addFreeVector(emptyScene(), { x: 3, y: 2, origin: { x: 0, y: 0 }, name: 'u' });
    scene = addFreeVector(scene, { x: 1, y: 4, origin: { x: 0, y: 0 }, name: 'v' });

    return { scene, uId: scene.vectors[0].id, vId: scene.vectors[1].id };
  }

  it('u + v = (4,6), et la résultante part de l’origine de u', () => {
    const { scene, uId, vId } = twoVectors();
    const withSum = addCombination(scene, 'sum', uId, vId);
    const sum = resolveScene(withSum).vectors.get(withSum.vectors[2].id);
    expect(sum.components).toEqual({ x: 4, y: 6 });
    expect(sum.origin).toEqual({ x: 0, y: 0 });
  });

  it('u − v = (2,−2)', () => {
    const { scene, uId, vId } = twoVectors();
    const withDiff = addCombination(scene, 'difference', uId, vId);
    expect(resolveScene(withDiff).vectors.get(withDiff.vectors[2].id).components).toEqual({ x: 2, y: -2 });
  });

  it('k·u suit le curseur, et k = 0 donne le شعاع nul', () => {
    const { scene, uId } = twoVectors();
    let withScaled = addScaled(scene, uId, 3);
    const id = withScaled.vectors[2].id;
    expect(resolveScene(withScaled).vectors.get(id).components).toEqual({ x: 9, y: 6 });
    withScaled = setScalar(withScaled, id, -1.5);
    expect(resolveScene(withScaled).vectors.get(id).components).toEqual({ x: -4.5, y: -3 });
    withScaled = setScalar(withScaled, id, 0);
    expect(resolveScene(withScaled).vectors.get(id).components).toEqual({ x: 0, y: 0 });
  });

  it('une somme construite sur ⃗AB suit le déplacement de A — la chaîne complète', () => {
    const { scene, aId, abId } = baseScene();
    let next = addFreeVector(scene, { x: 1, y: 1, origin: { x: 0, y: 0 } });
    const freeId = next.vectors[1].id;
    next = addCombination(next, 'sum', abId, freeId);
    const sumId = next.vectors[2].id;
    expect(resolveScene(next).vectors.get(sumId).components).toEqual({ x: 5, y: 3 });
    next = movePoint(next, aId, 0, 0);
    expect(resolveScene(next).vectors.get(sumId).components).toEqual({ x: 7, y: 6 });
  });
});

describe('résolution : milieu et image (§16, §18)', () => {
  it('le milieu de [AB] suit les deux points', () => {
    const { scene, aId, bId } = baseScene();
    let next = addMidpoint(scene, aId, bId);
    const mId = next.points[2].id;
    expect(resolveScene(next).points.get(mId).position).toEqual({ x: 4, y: 4 });
    next = movePoint(next, bId, 0, 0);
    expect(resolveScene(next).points.get(mId).position).toEqual({ x: 1, y: 1.5 });
  });

  it('A′ = A + u : A(2,3) et u(4,−1) → A′(6,2)', () => {
    let scene = addFreePoint(emptyScene(), { x: 2, y: 3, name: 'A' });
    scene = addFreeVector(scene, { x: 4, y: -1, origin: { x: 0, y: 0 } });
    scene = addImagePoint(scene, scene.points[0].id, scene.vectors[0].id);
    expect(resolveScene(scene).points.get(scene.points[1].id).position).toEqual({ x: 6, y: 2 });
  });

  it('changer le شعاع de l’انسحاب déplace l’image, pas l’original', () => {
    let scene = addFreePoint(emptyScene(), { x: 2, y: 3, name: 'A' });
    scene = addFreeVector(scene, { x: 4, y: -1, origin: { x: 0, y: 0 } });
    const aId = scene.points[0].id;
    const uId = scene.vectors[0].id;
    scene = addImagePoint(scene, aId, uId);
    const imageId = scene.points[1].id;
    scene = moveVectorTip(scene, uId, -1, 1);
    const resolved = resolveScene(scene);
    expect(resolved.points.get(aId).position).toEqual({ x: 2, y: 3 });
    expect(resolved.points.get(imageId).position).toEqual({ x: 1, y: 4 });
  });

  it('une image d’image suit toute la chaîne', () => {
    let scene = addFreePoint(emptyScene(), { x: 0, y: 0, name: 'A' });
    scene = addFreeVector(scene, { x: 1, y: 1, origin: { x: 0, y: 0 } });
    const aId = scene.points[0].id;
    const uId = scene.vectors[0].id;
    scene = addImagePoint(scene, aId, uId);
    scene = addImagePoint(scene, scene.points[1].id, uId);
    const lastId = scene.points[2].id;
    expect(resolveScene(scene).points.get(lastId).position).toEqual({ x: 2, y: 2 });
    scene = movePoint(scene, aId, 5, 5);
    expect(resolveScene(scene).points.get(lastId).position).toEqual({ x: 7, y: 7 });
  });
});

describe('translation d’une forme (§17)', () => {
  it('le triangle image conserve les longueurs et le nombre de sommets', () => {
    let scene = emptyScene();
    scene = addFreePoint(scene, { x: 0, y: 0 });
    scene = addFreePoint(scene, { x: 3, y: 0 });
    scene = addFreePoint(scene, { x: 0, y: 4 });
    scene = addFreeVector(scene, { x: -2, y: 5, origin: { x: 0, y: 0 } });
    scene = addPolygon(scene, scene.points.map((p) => p.id));
    scene = translatePolygon(scene, scene.polygons[0].id, scene.vectors[0].id);

    const resolved = resolveScene(scene);
    const [original, image] = [...resolved.polygons.values()];
    expect(image.resolved).toBe(true);
    expect(image.vertices).toHaveLength(3);
    const side = (poly, i, j) => Math.hypot(poly.vertices[j].x - poly.vertices[i].x, poly.vertices[j].y - poly.vertices[i].y);
    for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) {
      expect(side(image, i, j)).toBeCloseTo(side(original, i, j), 9);
    }
    expect(image.vertices[0]).toEqual({ x: -2, y: 5 });
  });

  it('déplacer un sommet de l’original déplace le sommet correspondant de l’image', () => {
    let scene = emptyScene();
    scene = addFreePoint(scene, { x: 0, y: 0 });
    scene = addFreePoint(scene, { x: 3, y: 0 });
    scene = addFreePoint(scene, { x: 0, y: 4 });
    scene = addFreeVector(scene, { x: 1, y: 1, origin: { x: 0, y: 0 } });
    const firstVertex = scene.points[0].id;
    scene = addPolygon(scene, scene.points.map((p) => p.id));
    scene = translatePolygon(scene, scene.polygons[0].id, scene.vectors[0].id);
    scene = movePoint(scene, firstVertex, -5, -5);
    const image = [...resolveScene(scene).polygons.values()][1];
    expect(image.vertices[0]).toEqual({ x: -4, y: -4 });
  });
});

describe('suppression en cascade', () => {
  it('supprimer A emporte ⃗AB, puis la somme qui l’utilisait', () => {
    const { scene, aId, abId } = baseScene();
    let next = addFreeVector(scene, { x: 1, y: 1, origin: { x: 0, y: 0 } });
    next = addCombination(next, 'sum', abId, next.vectors[1].id);
    const dead = dependentsOf(next, { points: [aId] });
    expect(dead.vectors.has(abId)).toBe(true);
    expect(dead.vectors.size).toBe(2);

    const after = removeObjects(next, { points: [aId] });
    expect(after.points.map((p) => p.id)).not.toContain(aId);
    expect(after.vectors).toHaveLength(1);
  });

  it('supprimer un sommet emporte le polygone', () => {
    let scene = emptyScene();
    scene = addFreePoint(scene, { x: 0, y: 0 });
    scene = addFreePoint(scene, { x: 1, y: 0 });
    scene = addFreePoint(scene, { x: 0, y: 1 });
    scene = addPolygon(scene, scene.points.map((p) => p.id));
    expect(removeObjects(scene, { points: [scene.points[1].id] }).polygons).toHaveLength(0);
  });
});

describe('robustesse de la résolution', () => {
  it('une référence morte ne casse pas le reste du plan', () => {
    const scene = {
      points: [{ id: 'a', kind: 'free', name: 'A', x: 1, y: 1 }],
      vectors: [{ id: 'v', kind: 'points', name: 'u', from: 'a', to: 'fantome', color: '#000000' }],
      polygons: [],
    };
    const resolved = resolveScene(scene);
    expect(resolved.points.get('a').resolved).toBe(true);
    expect(resolved.vectors.get('v').resolved).toBe(false);
    expect(resolved.vectors.get('v').components).toBeNull();
  });

  it('un cycle ne fait pas exploser la pile', () => {
    const scene = {
      points: [
        { id: 'a', kind: 'image', name: 'A', of: 'b', by: 'v' },
        { id: 'b', kind: 'image', name: 'B', of: 'a', by: 'v' },
      ],
      vectors: [{ id: 'v', kind: 'free', name: 'u', x: 1, y: 1, origin: { x: 0, y: 0 }, color: '#000000' }],
      polygons: [],
    };
    const resolved = resolveScene(scene);
    expect(resolved.points.get('a').resolved).toBe(false);
    expect(resolved.points.get('b').resolved).toBe(false);
    expect(resolved.vectors.get('v').resolved).toBe(true);
  });
});

describe('nommage, couleurs, aimantation', () => {
  it('donne le premier nom libre, puis suffixe', () => {
    expect(nextName(['A', 'B'], ['A', 'B', 'C'])).toBe('C');
    expect(nextName(['A', 'B', 'C'], ['A', 'B', 'C'])).toBe('A1');
  });

  it('donne une couleur que personne ne porte', () => {
    expect(nextColor([VECTOR_PALETTE[0]])).toBe(VECTOR_PALETTE[1]);
  });

  it('aimante au demi-carreau et borne les coordonnées', () => {
    expect(snap(2.26)).toBe(2.5);
    expect(snap(2.2, 1)).toBe(2);
    expect(clampCoord(1e9)).toBe(1e4);
    expect(clampCoord(Number.NaN)).toBe(0);
  });
});
