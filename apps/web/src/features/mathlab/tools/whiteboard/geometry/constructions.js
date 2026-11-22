/**
 * Les CONSTRUCTIONS — ce que le قلم الهندسة, le compas et la منقلة laissent
 * sur la سبّورة. Pur : ni DOM, ni Excalidraw.
 *
 * Une construction est un VRAI élément Excalidraw (ligne, ellipse, texte) :
 * il s'efface, s'annule, se sélectionne, s'exporte et s'enregistre comme le
 * reste du dessin. Mais il porte aussi, dans `customData.geo`, CE QU'IL EST :
 *
 *   { kind: 'point',   label }                             une ellipse pleine de 7 unités
 *   { kind: 'label',   of }                                la lettre d'un point (même groupe)
 *   { kind: 'segment' | 'line' | 'ray', ra, rb, from, to } une ligne ; a = (x,y) + ra
 *   { kind: 'circle',  centerId }                          une ellipse
 *   { kind: 'arc',     rc, r, start, sweep, centerId }     une polyligne échantillonnée
 *   { kind: 'measure', of, what, vertex?, arms? }          « AB = 5,2 », « r = 3 », « ∠ABC = 60° »
 *
 * et, pour tout ce qui se construit : `seq` (l'ordre de construction, pour
 * « إعادة البناء ») et `via` (l'instrument et sa pose à cet instant).
 *
 * Le « segment AB » est donc un segment AB, pas un tracé : ses extrémités
 * sont des POINTS (`from`, `to`), et déplacer A redessine AB
 * (`solveDependents`). Voir docs/architecture/MATH_LAB.md §5.8.
 */
import {
  UNITS_PER_CM, add, sub, scale, len, dist, unit, angleOf, arcPoints, rotateAround, formatLength, formatNumber,
  toDegrees, normalizeAngle, isPoint, unitsToCm,
} from './geoMath.js';

const GEO_STROKE = '#1e1e1e';
const POINT_SIZE = 7;
const LABEL_FONT_SIZE = 20;
const MEASURE_FONT_SIZE = 18;
const MEASURE_COLOR = '#1971c2';
/** Excalidraw : FONT_FAMILY.Nunito — une écriture nette, auto-hébergée (public/excalidraw/fonts). */
const GEO_FONT_FAMILY = 6;

const LINEAR_KINDS = new Set(['segment', 'line', 'ray']);
const isLinearKind = (kind) => LINEAR_KINDS.has(kind);

export const geoOf = (el) => (el && !el.isDeleted && el.customData?.geo && typeof el.customData.geo === 'object' ? el.customData.geo : null);

let idCounter = 0;
/** Un identifiant d'élément : aléatoire, et unique dans la session même à la même milliseconde. */
function newGeoId(prefix = 'geo') {
  idCounter = (idCounter + 1) % 1_000_000;

  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Lire la scène ───────────────────────────────────────────────────────

/** Le centre de rotation d'un élément, tel qu'Excalidraw le calcule (boîte de ses points pour une ligne). */
function elementCenter(el) {
  if (Array.isArray(el.points) && el.points.length > 0) {
    const xs = el.points.map((p) => p[0]);
    const ys = el.points.map((p) => p[1]);

    return { x: el.x + (Math.min(...xs) + Math.max(...xs)) / 2, y: el.y + (Math.min(...ys) + Math.max(...ys)) / 2 };
  }

  return { x: el.x + (el.width ?? 0) / 2, y: el.y + (el.height ?? 0) / 2 };
}

/** Un point relatif à l'élément → la scène, rotation de l'élément comprise. */
function fromElement(el, rel) {
  const p = { x: el.x + rel.x, y: el.y + rel.y };

  return el.angle ? rotateAround(p, elementCenter(el), el.angle) : p;
}

/**
 * La géométrie VRAIE de la scène : les points, les droites (au sens large),
 * les cercles et arcs, lus sur les éléments eux-mêmes — si l'enseignant a
 * déplacé un segment à la main, c'est sa nouvelle position qui compte.
 */
export function readGeoScene(elements) {
  const points = new Map();
  const labels = new Map();
  const linears = [];
  const circles = [];
  const measures = [];
  for (const el of elements ?? []) {
    const geo = geoOf(el);
    if (!geo) continue;
    if (geo.kind === 'point') {
      points.set(el.id, { id: el.id, p: elementCenter(el), el, seq: geo.seq ?? 0 });
    } else if (geo.kind === 'label' && typeof el.text === 'string') {
      labels.set(geo.of, el.text.trim());
    } else if (isLinearKind(geo.kind)) {
      const ra = isPoint(geo.ra) ? geo.ra : { x: el.points?.[0]?.[0] ?? 0, y: el.points?.[0]?.[1] ?? 0 };
      const last = el.points?.[el.points.length - 1] ?? [0, 0];
      const rb = isPoint(geo.rb) ? geo.rb : { x: last[0], y: last[1] };
      const a = fromElement(el, ra);
      const b = fromElement(el, rb);
      if (dist(a, b) > 1e-6) linears.push({ id: el.id, kind: geo.kind, a, b, from: geo.from ?? null, to: geo.to ?? null, el, seq: geo.seq ?? 0 });
    } else if (geo.kind === 'circle' && el.type === 'ellipse') {
      circles.push({
        id: el.id, kind: 'circle', c: { x: el.x + el.width / 2, y: el.y + el.height / 2 }, r: (el.width + el.height) / 4,
        start: 0, sweep: 2 * Math.PI, centerId: geo.centerId ?? null, el, seq: geo.seq ?? 0,
      });
    } else if (geo.kind === 'arc' && isPoint(geo.rc) && Number.isFinite(geo.r)) {
      circles.push({
        id: el.id, kind: 'arc', c: fromElement(el, geo.rc), r: geo.r,
        start: (geo.start ?? 0) + (el.angle ?? 0), sweep: geo.sweep ?? 0, centerId: geo.centerId ?? null, el, seq: geo.seq ?? 0,
      });
    } else if (geo.kind === 'measure') {
      measures.push({ id: el.id, geo, el });
    }
  }
  for (const pt of points.values()) pt.label = labels.get(pt.id) ?? '';

  return { points, labels, linears, circles, measures };
}

// ── Les étiquettes A, B, C… ─────────────────────────────────────────────

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** La première lettre libre : A…Z, puis A1…Z1, etc. */
export function nextLabel(used) {
  const taken = new Set([...used].map((s) => String(s).trim()));
  for (let round = 0; round < 50; round += 1) {
    for (const letter of LETTERS) {
      const candidate = round === 0 ? letter : `${letter}${round}`;
      if (!taken.has(candidate)) return candidate;
    }
  }

  return '?';
}

// ── Les squelettes d'éléments (convertToExcalidrawElements, ids fournis) ─

const strokeOf = (style) => ({
  strokeColor: style?.color ?? GEO_STROKE,
  strokeWidth: style?.width ?? 1.5,
  strokeStyle: style?.style ?? 'solid',
  roughness: 0,
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  opacity: 100,
});

/** Un point (petit disque plein) et, s'il a un nom, sa lettre — groupés : ils bougent ensemble. */
export function pointSkeletons(p, { label = '', seq = 0, via = null } = {}) {
  const id = newGeoId('pt');
  const groupId = newGeoId('grp');
  const dot = {
    id, type: 'ellipse',
    x: p.x - POINT_SIZE / 2, y: p.y - POINT_SIZE / 2, width: POINT_SIZE, height: POINT_SIZE,
    ...strokeOf({ width: 1 }), backgroundColor: GEO_STROKE,
    groupIds: label ? [groupId] : [],
    customData: { geo: { kind: 'point', label, seq, via } },
  };
  if (!label) return { id, skeletons: [dot] };
  const text = {
    id: newGeoId('lbl'), type: 'text',
    x: p.x + 6, y: p.y - LABEL_FONT_SIZE - 8,
    text: label, fontSize: LABEL_FONT_SIZE, fontFamily: GEO_FONT_FAMILY, strokeColor: GEO_STROKE,
    groupIds: [groupId],
    customData: { geo: { kind: 'label', of: id } },
  };

  return { id, skeletons: [dot, text] };
}

/** Le prolongement d'une droite ou d'une demi-droite au-delà de ses points de définition. */
const lineExtension = (a, b) => Math.max(3 * UNITS_PER_CM, 0.5 * dist(a, b));

/** Les deux extrémités DESSINÉES d'un segment, d'une droite ou d'une demi-droite définis par a et b. */
export function drawnEnds(kind, a, b) {
  const l = dist(a, b);
  if (kind === 'segment' || l < 1e-9) return [a, b];
  const u = scale(sub(b, a), 1 / l);
  const e = lineExtension(a, b);
  const p1 = add(b, scale(u, e));

  return kind === 'ray' ? [a, p1] : [sub(a, scale(u, e)), p1];
}

/** La géométrie d'une ligne Excalidraw qui dessine `kind` défini par a et b. */
function linearGeometry(kind, a, b) {
  const [p0, p1] = drawnEnds(kind, a, b);
  const d = sub(p1, p0);

  return {
    x: p0.x, y: p0.y, angle: 0,
    points: [[0, 0], [d.x, d.y]],
    width: Math.abs(d.x), height: Math.abs(d.y),
    ra: sub(a, p0), rb: sub(b, p0),
  };
}

export function linearSkeleton(kind, a, b, style, { from = null, to = null, seq = 0, via = null } = {}) {
  const { ra, rb, ...geometry } = linearGeometry(kind, a, b);

  return {
    id: newGeoId(kind),
    type: 'line',
    ...geometry,
    ...strokeOf(style),
    roundness: null,
    customData: { geo: { kind, ra, rb, from, to, seq, via } },
  };
}

export function circleSkeleton(c, r, style, { centerId = null, seq = 0, via = null } = {}) {
  return {
    id: newGeoId('circle'),
    type: 'ellipse',
    x: c.x - r, y: c.y - r, width: 2 * r, height: 2 * r,
    ...strokeOf(style),
    customData: { geo: { kind: 'circle', centerId, seq, via } },
  };
}

function arcGeometry(c, r, start, sweep) {
  const pts = arcPoints(c, r, start, sweep);
  const o = pts[0];
  const rel = pts.map((p) => [p.x - o.x, p.y - o.y]);
  const xs = rel.map((p) => p[0]);
  const ys = rel.map((p) => p[1]);

  return {
    x: o.x, y: o.y, angle: 0, points: rel,
    width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys),
    rc: sub(c, o),
  };
}

export function arcSkeleton(c, r, start, sweep, style, { centerId = null, seq = 0, via = null } = {}) {
  const { rc, ...geometry } = arcGeometry(c, r, start, sweep);

  return {
    id: newGeoId('arc'),
    type: 'line',
    ...geometry,
    ...strokeOf(style),
    roundness: null,
    customData: { geo: { kind: 'arc', rc, r, start, sweep, centerId, seq, via } },
  };
}

// ── Les mesures ─────────────────────────────────────────────────────────

const nameOf = (scene, id) => (id && scene.points.has(id) ? scene.points.get(id).label : '');

/** Les côtés d'un angle, du sommet vers l'extérieur : l'autre extrémité de chaque bras. */
function armDirection(scene, vertex, armId) {
  const arm = scene.linears.find((l) => l.id === armId);
  if (!arm) return null;
  const far = dist(arm.a, vertex) < dist(arm.b, vertex) ? arm.b : arm.a;
  const d = sub(far, vertex);

  return len(d) > 1e-6 ? { d, far, name: nameOf(scene, far === arm.a ? arm.from : arm.to) } : null;
}

/**
 * Le texte d'une mesure et le point auquel elle s'accroche — ou null si ce
 * qu'elle mesure a disparu.
 */
export function measureContent(scene, geo) {
  if (geo.what === 'angle') {
    const v = scene.points.get(geo.vertex);
    if (!v) return null;
    const [m1, m2] = (geo.arms ?? []).map((id) => armDirection(scene, v.p, id));
    if (!m1 || !m2) return null;
    let gap = Math.abs(normalizeAngle(angleOf(m2.d) - angleOf(m1.d)));
    if (gap > Math.PI) gap = 2 * Math.PI - gap;
    const name = m1.name && v.label && m2.name ? `${m1.name}${v.label}${m2.name}` : '';
    const sum = add(scale(m1.d, 1 / len(m1.d)), scale(m2.d, 1 / len(m2.d)));
    const bis = len(sum) > 1e-6 ? scale(sum, 1 / len(sum)) : { x: m1.d.y / len(m1.d), y: -m1.d.x / len(m1.d) };

    return { text: `∠${name} = ${formatNumber(toDegrees(gap), 0)}°`, anchor: v.p, defaultOffset: scale(bis, 1.3 * UNITS_PER_CM) };
  }
  const target = scene.linears.find((l) => l.id === geo.of) ?? scene.circles.find((c) => c.id === geo.of);
  if (!target) return null;
  if (target.kind === 'segment') {
    const name = nameOf(scene, target.from) + nameOf(scene, target.to);
    const d = sub(target.b, target.a);
    const n = { x: d.y / len(d), y: -d.x / len(d) };
    const up = n.y > 0 ? scale(n, -1) : n;

    return { text: `${name.length === 2 ? name : 'ℓ'} = ${formatLength(len(d))}`, anchor: scale(add(target.a, target.b), 0.5), defaultOffset: scale(up, 0.7 * UNITS_PER_CM) };
  }
  if (target.kind === 'circle' || target.kind === 'arc') {
    const mid = target.kind === 'arc' ? target.start + target.sweep / 2 : -Math.PI / 4;
    const anchor = add(target.c, scale(unit(mid), target.r));
    const value = geo.what === 'arcAngle'
      ? `θ = ${formatNumber(toDegrees(Math.abs(target.sweep)), 0)}°`
      : geo.what === 'diameter' ? `d = ${formatLength(2 * target.r)}` : `r = ${formatLength(target.r)}`;

    return { text: value, anchor, defaultOffset: scale(unit(mid), 0.5 * UNITS_PER_CM) };
  }

  return null;
}

export function measureSkeleton(scene, geo) {
  const content = measureContent(scene, geo);
  if (!content) return null;
  const at = add(content.anchor, content.defaultOffset);

  return {
    id: newGeoId('measure'), type: 'text',
    x: at.x - 0.6 * MEASURE_FONT_SIZE * content.text.length / 2, y: at.y - MEASURE_FONT_SIZE / 2,
    text: content.text, fontSize: MEASURE_FONT_SIZE, fontFamily: GEO_FONT_FAMILY, strokeColor: MEASURE_COLOR,
    customData: { geo: { kind: 'measure', ...geo } },
  };
}

/** Les mesures qui manquent : un segment, un cercle ou un arc sans étiquette de mesure en reçoit une. */
export function missingMeasureSkeletons(elements) {
  const scene = readGeoScene(elements);
  const measured = new Set(scene.measures.map((m) => m.geo.of).filter(Boolean));
  const out = [];
  for (const l of scene.linears) {
    if (l.kind === 'segment' && !measured.has(l.id)) out.push(measureSkeleton(scene, { of: l.id, what: 'length' }));
  }
  for (const c of scene.circles) {
    // Un arc tracé à la منقلة se lit en DEGRÉS (θ = 60°) ; au compas, par son rayon.
    const what = c.kind === 'arc' && geoOf(c.el)?.via?.tool === 'protractor' ? 'arcAngle' : 'radius';
    if (!measured.has(c.id)) out.push(measureSkeleton(scene, { of: c.id, what }));
  }

  return out.filter(Boolean);
}

// ── Les dépendances : déplacer A redessine AB ───────────────────────────

const moved = (p, q) => dist(p, q) > 0.01;

/**
 * Ce qu'il faut changer pour que la scène redevienne COHÉRENTE : les
 * segments suivent leurs points, les cercles et arcs leur centre, les
 * mesures leur objet (et disent la nouvelle valeur).
 *
 * La fonction est idempotente — appliquée à une scène cohérente, elle ne
 * rend rien — et c'est ce qui la rend sûre dans `onChange` : l'annulation
 * d'Excalidraw ramène A, et la passe suivante ramène AB avec lui.
 *
 * Un objet que l'enseignant fait glisser LUI-MÊME (sélectionné pendant un
 * glisser) n'est pas retenu : à la fin du geste, s'il a quitté ses points,
 * il s'en DÉTACHE (`from`/`to` à null) plutôt que d'y être ramené de force.
 *
 * @param {readonly object[]} elements
 * @param {{selectedIds?: Set<string>, dragging?: boolean, anchors?: Map<string, {x:number,y:number}>}} context
 *   `anchors` : la dernière position connue de l'objet de chaque mesure
 *   (tenue par l'appelant) — une mesure que l'enseignant a déplacée garde
 *   sa place tant que son objet ne bouge pas.
 * @returns {Array<{id: string, patch: object}>}
 */
export function solveDependents(elements, { selectedIds = new Set(), dragging = false, anchors = new Map() } = {}) {
  const scene = readGeoScene(elements);
  const updates = [];
  const pointAt = (id) => (id && scene.points.has(id) ? scene.points.get(id) : null);

  for (const l of scene.linears) {
    const pa = pointAt(l.from);
    const pb = pointAt(l.to);
    if (!pa && !pb) continue;
    const a = pa ? pa.p : l.a;
    const b = pb ? pb.p : l.b;
    if (!moved(a, l.a) && !moved(b, l.b)) continue;
    const pointsFollow = (!pa || selectedIds.has(pa.id)) && (!pb || selectedIds.has(pb.id));
    if (selectedIds.has(l.id) && !pointsFollow) {
      if (dragging) continue;
      updates.push({ id: l.id, patch: { customData: { ...l.el.customData, geo: { ...l.el.customData.geo, from: null, to: null } } } });
      continue;
    }
    if (dist(a, b) < 1e-6) continue;
    const { ra, rb, ...geometry } = linearGeometry(l.kind, a, b);
    updates.push({ id: l.id, patch: { ...geometry, customData: { ...l.el.customData, geo: { ...l.el.customData.geo, ra, rb } } } });
    l.a = a; l.b = b;
  }

  for (const c of scene.circles) {
    const center = pointAt(c.centerId);
    if (!center || !moved(center.p, c.c)) continue;
    if (selectedIds.has(c.id) && !selectedIds.has(center.id)) {
      if (dragging) continue;
      updates.push({ id: c.id, patch: { customData: { ...c.el.customData, geo: { ...c.el.customData.geo, centerId: null } } } });
      continue;
    }
    const delta = sub(center.p, c.c);
    updates.push({ id: c.id, patch: { x: c.el.x + delta.x, y: c.el.y + delta.y } });
    c.c = center.p;
  }

  for (const m of scene.measures) {
    const content = measureContent(scene, m.geo);
    if (!content) continue;
    const patch = {};
    if (m.el.text !== content.text) {
      patch.text = content.text;
      patch.originalText = content.text;
      const ratio = content.text.length / Math.max(1, (m.el.text ?? '').length);
      patch.width = (m.el.width ?? 0) * ratio;
    }
    const last = anchors.get(m.id);
    if (last && moved(last, content.anchor) && !selectedIds.has(m.id)) {
      const delta = sub(content.anchor, last);
      patch.x = m.el.x + delta.x;
      patch.y = m.el.y + delta.y;
    }
    anchors.set(m.id, content.anchor);
    if (Object.keys(patch).length > 0) updates.push({ id: m.id, patch });
  }

  return updates;
}

// ── L'ordre de construction ─────────────────────────────────────────────

/** Le prochain numéro d'ordre : un de plus que le plus grand de la scène. */
export function nextSeq(elements) {
  let max = 0;
  for (const el of elements ?? []) {
    const seq = geoOf(el)?.seq;
    if (Number.isFinite(seq) && seq > max) max = seq;
  }

  return max + 1;
}

/**
 * Les étapes de « إعادة البناء », dans l'ordre où elles ont été faites :
 * chaque objet construit, avec l'instrument qui l'a tracé. Les étiquettes
 * suivent leur point, les mesures arrivent à la fin.
 */
export function constructionSteps(elements) {
  const scene = readGeoScene(elements);
  const steps = [];
  for (const pt of scene.points.values()) steps.push({ kind: 'point', seq: pt.seq, id: pt.id, p: pt.p, label: pt.label, via: geoOf(pt.el)?.via ?? null });
  for (const l of scene.linears) {
    const [p0, p1] = drawnEnds(l.kind, l.a, l.b);
    steps.push({ kind: l.kind, seq: l.seq, id: l.id, a: l.a, b: l.b, p0, p1, style: styleOf(l.el), via: geoOf(l.el)?.via ?? null });
  }
  for (const c of scene.circles) {
    steps.push({ kind: c.kind, seq: c.seq, id: c.id, c: c.c, r: c.r, start: c.start, sweep: c.sweep, style: styleOf(c.el), via: geoOf(c.el)?.via ?? null });
  }
  steps.sort((x, y) => x.seq - y.seq);
  const measures = scene.measures
    .map((m) => ({ kind: 'measure', id: m.id, text: m.el.text, p: { x: m.el.x, y: m.el.y + (m.el.fontSize ?? MEASURE_FONT_SIZE) * 0.8 } }));

  return [...steps, ...measures];
}

const styleOf = (el) => ({ width: el.strokeWidth ?? 1.5, style: el.strokeStyle ?? 'solid', color: el.strokeColor ?? GEO_STROKE });

/** Une longueur de scène en « cm » du bureau, pour un champ numérique (point décimal : c'est une valeur d'`<input>`). */
export const cmValue = (units) => Math.round(unitsToCm(units) * 10) / 10;
