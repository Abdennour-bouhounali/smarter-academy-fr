/**
 * LA SCÈNE : les objets du plan et leurs DÉPENDANCES — logique pure.
 *
 * Le cahier des charges (§38) demande qu'un objet dépende d'autres objets par
 * leur IDENTIFIANT, et que déplacer A mette à jour tout ce qui en découle.
 * C'est exactement ce que fait ce module, et il le fait d'UNE seule façon :
 *
 *     les objets du document ne portent QUE leur définition ;
 *     `resolveScene` calcule, une fois par rendu, ce qui se voit.
 *
 * Rien n'est « recalculé quand A bouge » : rien n'a jamais été gardé. Un
 * point translaté n'a pas de coordonnées enregistrées, il a un parent et un
 * vecteur ; ses coordonnées n'existent que dans la scène résolue. Il est donc
 * IMPOSSIBLE qu'un objet dérivé se désynchronise de sa source — le bug
 * classique de ce genre d'outil n'a pas d'endroit où se produire.
 *
 * Les objets (`kind`) :
 *
 *   point      free      {x, y}                    un point libre, glissable
 *              midpoint  {of: [idA, idB]}          le milieu M de [AB] (§18)
 *              image     {of: idA, by: idVector}   l'image de A par une translation (§16)
 *   vector     free      {origin:{x,y}, x, y}      un vecteur libre, posé où l'on veut (§6)
 *              points    {from: idA, to: idB}      ⃗AB, tenu par ses deux points (§5)
 *              sum       {of: [idU, idV]}          u + v (§11)
 *              difference{of: [idU, idV]}          u − v (§13)
 *              scaled    {of: idU, k}              k·u (§14)
 *   polygon              {vertices: [id…]}         un triangle, translatable (§17)
 *
 * Un cycle (A image de A) ou une référence morte ne casse pas la scène : la
 * résolution rend l'objet `resolved: false`, l'interface le montre en panne
 * et le reste du plan continue de vivre.
 */

import * as V from './vectorMath.js';

/** Les familles d'objets. */
export const POINT_KINDS = Object.freeze(['free', 'midpoint', 'image']);
export const VECTOR_KINDS = Object.freeze(['free', 'points', 'sum', 'difference', 'scaled']);

/**
 * Les bornes du document. Elles tiennent la scène sous le plafond d'octets du
 * serveur (MathLabTools.php) ET sous le seuil de lisibilité : un plan avec
 * quarante vecteurs n'enseigne plus rien.
 */
export const MAX_POINTS = 26;   // autant que de lettres : A … Z
export const MAX_VECTORS = 12;
export const MAX_POLYGONS = 4;
export const MAX_POLYGON_VERTICES = 8;

/** Les coordonnées vivent dans un carré raisonnable : au-delà, ce n'est plus du collège. */
const COORD_LIMIT = 1e4;

/** Le pas d'aimantation : un glissement s'arrête sur les valeurs du quadrillage. */
export const SNAP_STEP = 0.5;

let counter = 0;
/** Un identifiant local au document, stable une fois enregistré. */
export function newId(prefix) {
  counter += 1;

  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** Les noms de points, dans l'ordre du manuel. */
export const POINT_NAMES = Object.freeze('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
/** Les noms de vecteurs : les lettres usuelles (u, v, w…). */
export const VECTOR_NAMES = Object.freeze(['u', 'v', 'w', 'a', 'b', 'c', 'd', 'e', 's', 't', 'p', 'q']);

/**
 * La palette : les mêmes teintes que le grapheur (grapherState.FUNCTION_PALETTE),
 * pour que les deux instruments se ressemblent — un élève qui passe de l'un à
 * l'autre retrouve ses couleurs.
 */
export const VECTOR_PALETTE = Object.freeze([
  '#2563eb', // blue-600
  '#e11d48', // rose-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
]);

/** Les objets CONSTRUITS (somme, image, milieu) portent une teinte neutre : ils ne sont pas des données mais des résultats. */
export const CONSTRUCTION_COLOR = '#334155'; // slate-700
export const POINT_COLOR = '#0f172a';        // slate-900

/** Le premier nom libre de la liste ; au-delà, on suffixe (A₁, u₁…). */
export function nextName(used, names) {
  const taken = new Set(used);
  const free = names.find((name) => !taken.has(name));
  if (free) return free;
  for (let suffix = 1; suffix < 100; suffix += 1) {
    for (const name of names) {
      const candidate = `${name}${suffix}`;
      if (!taken.has(candidate)) return candidate;
    }
  }

  return `x${taken.size}`;
}

/** La première couleur que ne porte aucun vecteur — deux vecteurs voisins ne se confondent pas. */
export function nextColor(used) {
  const taken = new Set(used.map((c) => String(c).toLowerCase()));

  return VECTOR_PALETTE.find((c) => !taken.has(c)) ?? VECTOR_PALETTE[used.length % VECTOR_PALETTE.length];
}

/** Une coordonnée bornée et propre — ce qui entre dans le document, jamais un flottant sale. */
export function clampCoord(value) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(-COORD_LIMIT, Math.min(COORD_LIMIT, Math.round(value * 1e6) / 1e6));
}

/** L'aimantation d'un glissement : au pas, sauf si l'élève tient une touche (l'appelant décide). */
export function snap(value, step = SNAP_STEP) {
  if (!Number.isFinite(value)) return 0;
  if (!(step > 0)) return clampCoord(value);

  return clampCoord(Math.round(value / step) * step);
}

// ── La résolution ─────────────────────────────────────────────────────────

/**
 * Les objets du document → ce qui se DESSINE.
 *
 * Un seul parcours, en profondeur, avec mémoïsation : chaque objet est
 * résolu une fois même si dix autres en dépendent. Les objets en cours de
 * résolution sont marqués, ce qui détecte les cycles sans pile infinie.
 *
 * @param {{points: object[], vectors: object[], polygons: object[]}} scene
 * @returns {{
 *   points: Map<string, {id, name, kind, position: {x,y}|null, resolved: boolean, draggable: boolean, source: object}>,
 *   vectors: Map<string, {id, name, kind, components: {x,y}|null, origin: {x,y}|null, tip: {x,y}|null, resolved: boolean, source: object}>,
 *   polygons: Map<string, {id, name, vertices: ({x,y}|null)[], resolved: boolean, source: object}>,
 * }}
 */
export function resolveScene(scene) {
  const points = new Map();
  const vectors = new Map();
  const polygons = new Map();

  const pointDefs = new Map((scene.points ?? []).map((p) => [p.id, p]));
  const vectorDefs = new Map((scene.vectors ?? []).map((v) => [v.id, v]));
  const visiting = new Set();

  function resolvePoint(id) {
    if (points.has(id)) return points.get(id);
    const def = pointDefs.get(id);
    if (!def) return null;
    if (visiting.has(id)) {
      const broken = { id, name: def.name, kind: def.kind, position: null, resolved: false, draggable: false, source: def };
      points.set(id, broken);

      return broken;
    }
    visiting.add(id);
    let position = null;

    if (def.kind === 'free') {
      position = V.makeVector(def.x, def.y);
    } else if (def.kind === 'midpoint') {
      const [aId, bId] = def.of ?? [];
      const a = resolvePoint(aId);
      const b = resolvePoint(bId);
      position = a?.position && b?.position ? V.midpoint(a.position, b.position) : null;
    } else if (def.kind === 'image') {
      const parent = resolvePoint(def.of);
      const by = resolveVector(def.by);
      position = parent?.position && by?.components ? V.translatePoint(parent.position, by.components) : null;
    }

    visiting.delete(id);
    const resolved = {
      id,
      name: def.name,
      kind: def.kind,
      position,
      resolved: position !== null,
      // Seul un point LIBRE se glisse : un milieu ou une image se déplacent
      // en déplaçant ce dont ils dépendent — c'est ce que l'élève doit
      // comprendre, et l'interface le lui impose plutôt que de le lui dire.
      draggable: def.kind === 'free',
      source: def,
    };
    points.set(id, resolved);

    return resolved;
  }

  function resolveVector(id) {
    if (vectors.has(id)) return vectors.get(id);
    const def = vectorDefs.get(id);
    if (!def) return null;
    if (visiting.has(id)) {
      const broken = { id, name: def.name, kind: def.kind, components: null, origin: null, tip: null, resolved: false, source: def };
      vectors.set(id, broken);

      return broken;
    }
    visiting.add(id);
    let components = null;
    let origin = null;

    if (def.kind === 'free') {
      components = V.makeVector(def.x, def.y);
      origin = V.makeVector(def.origin?.x, def.origin?.y);
    } else if (def.kind === 'points') {
      const from = resolvePoint(def.from);
      const to = resolvePoint(def.to);
      if (from?.position && to?.position) {
        components = V.fromPoints(from.position, to.position);
        // ⃗AB est ATTACHÉ à A : ce n'est pas un choix d'affichage, c'est ce
        // qui distingue §5 de §6.
        origin = from.position;
      }
    } else if (def.kind === 'sum' || def.kind === 'difference') {
      const [uId, vId] = def.of ?? [];
      const u = resolveVector(uId);
      const v = resolveVector(vId);
      if (u?.components && v?.components) {
        components = def.kind === 'sum' ? V.add(u.components, v.components) : V.subtract(u.components, v.components);
        // La résultante part de l'origine du PREMIER terme : c'est ce qui
        // fait que le dessin de §11 (bout à bout) se referme vraiment.
        origin = u.origin ?? { x: 0, y: 0 };
      }
    } else if (def.kind === 'scaled') {
      const u = resolveVector(def.of);
      if (u?.components && Number.isFinite(def.k)) {
        components = V.scale(u.components, def.k);
        origin = u.origin ?? { x: 0, y: 0 };
      }
    }

    // Un vecteur posé nulle part part de l'origine du repère.
    if (components && !origin) origin = { x: 0, y: 0 };

    visiting.delete(id);
    const resolved = {
      id,
      name: def.name,
      kind: def.kind,
      components,
      origin,
      tip: components && origin ? V.translatePoint(origin, components) : null,
      resolved: components !== null,
      source: def,
    };
    vectors.set(id, resolved);

    return resolved;
  }

  for (const def of scene.points ?? []) resolvePoint(def.id);
  for (const def of scene.vectors ?? []) resolveVector(def.id);

  for (const def of scene.polygons ?? []) {
    const vertices = (def.vertices ?? []).map((pid) => resolvePoint(pid)?.position ?? null);
    polygons.set(def.id, {
      id: def.id,
      name: def.name,
      vertices,
      resolved: vertices.length >= 3 && vertices.every(Boolean),
      source: def,
    });
  }

  return { points, vectors, polygons };
}

// ── Les dépendances (suppression) ─────────────────────────────────────────

/**
 * Tout ce qui s'effondrerait si l'on supprimait ces objets — la fermeture
 * TRANSITIVE : supprimer A supprime ⃗AB, donc la somme qui l'utilisait, donc
 * l'image construite avec cette somme. L'interface le dit AVANT de supprimer
 * (« ceci supprimera aussi… »), elle ne laisse jamais un objet orphelin
 * pointer dans le vide.
 *
 * @returns {{points: Set<string>, vectors: Set<string>, polygons: Set<string>}}
 */
export function dependentsOf(scene, { points = [], vectors = [] } = {}) {
  const deadPoints = new Set(points);
  const deadVectors = new Set(vectors);
  const deadPolygons = new Set();

  let changed = true;
  while (changed) {
    changed = false;

    for (const p of scene.points ?? []) {
      if (deadPoints.has(p.id)) continue;
      const dies = (p.kind === 'midpoint' && (p.of ?? []).some((id) => deadPoints.has(id)))
        || (p.kind === 'image' && (deadPoints.has(p.of) || deadVectors.has(p.by)));
      if (dies) { deadPoints.add(p.id); changed = true; }
    }

    for (const v of scene.vectors ?? []) {
      if (deadVectors.has(v.id)) continue;
      const dies = (v.kind === 'points' && (deadPoints.has(v.from) || deadPoints.has(v.to)))
        || ((v.kind === 'sum' || v.kind === 'difference') && (v.of ?? []).some((id) => deadVectors.has(id)))
        || (v.kind === 'scaled' && deadVectors.has(v.of));
      if (dies) { deadVectors.add(v.id); changed = true; }
    }
  }

  for (const poly of scene.polygons ?? []) {
    if ((poly.vertices ?? []).some((id) => deadPoints.has(id))) deadPolygons.add(poly.id);
  }

  return { points: deadPoints, vectors: deadVectors, polygons: deadPolygons };
}

/** Applique une suppression : les objets visés ET tout ce qui en dépendait. */
export function removeObjects(scene, selection) {
  const dead = dependentsOf(scene, selection);

  return {
    ...scene,
    points: (scene.points ?? []).filter((p) => !dead.points.has(p.id)),
    vectors: (scene.vectors ?? []).filter((v) => !dead.vectors.has(v.id)),
    polygons: (scene.polygons ?? []).filter((p) => !dead.polygons.has(p.id)),
  };
}
