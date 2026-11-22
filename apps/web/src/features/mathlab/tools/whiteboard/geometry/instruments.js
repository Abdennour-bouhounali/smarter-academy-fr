/**
 * Les INSTRUMENTS du bureau de géométrie — leur état et leur géométrie,
 * purs, sans DOM.
 *
 * Un instrument n'est PAS un élément du dessin. C'est un objet posé sur la
 * سبّورة : l'enseignant le déplace, le tourne, l'ouvre, trace le long de lui,
 * puis le range. Son état vit à part (`desk.instruments`), si bien que le
 * manipuler ne touche jamais au dessin, ni à l'historique d'Excalidraw.
 *
 *   ruler      { visible, x, y, angle, lengthCm }        (x, y) = le ZÉRO, sur le bord gradué
 *   compass    { visible, x, y, angle, radius, locked }  (x, y) = la POINTE sèche ; angle = vers la mine
 *   protractor { visible, x, y, angle, radiusCm, needleDeg, mode }  (x, y) = le CENTRE ; angle = vers 0° ;
 *              mode 'measure' (قياس) | 'construct' (إنشاء زاوية) | 'arc' (رسم قوس)
 *   setSquare  { visible, x, y, angle, kind, sizeCm }    (x, y) = le sommet de l'ANGLE DROIT
 *
 * Tout est en unités de scène (geoMath.UNITS_PER_CM par « cm » du bureau).
 */
import {
  UNITS_PER_CM, add, sub, scale, unit, upNormal, rotateAround, dist, len, toRadians, toDegrees, dot, isPoint,
} from './geoMath.js';

export const INSTRUMENT_KINDS = Object.freeze(['ruler', 'compass', 'protractor', 'setSquare']);

export const RULER_LENGTHS_CM = Object.freeze([10, 15, 20, 30]);
export const RULER_WIDTH = 1.6 * UNITS_PER_CM;
export const RULER_MARGIN = 0.5 * UNITS_PER_CM;

const COMPASS_MIN_RADIUS = 0.2 * UNITS_PER_CM;
const COMPASS_MAX_RADIUS = 25 * UNITS_PER_CM;

/** Le rayon de l'évidement de la منقلة, en fraction de son rayon (le bord courbe intérieur). */
export const PROTRACTOR_INNER = 0.42;

const SET_SQUARE_KINDS = Object.freeze(['45', '3060']);

const DEFAULTS = Object.freeze({
  ruler: { visible: false, x: 0, y: 0, angle: 0, lengthCm: 15 },
  compass: { visible: false, x: 0, y: 0, angle: 0, radius: 3 * UNITS_PER_CM, locked: false },
  protractor: { visible: false, x: 0, y: 0, angle: 0, radiusCm: 6, needleDeg: 60, mode: 'measure' },
  setSquare: { visible: false, x: 0, y: 0, angle: 0, kind: '45', sizeCm: 10 },
});

export const defaultInstrument = (kind) => ({ ...DEFAULTS[kind] });

// ── La géométrie de chaque instrument ───────────────────────────────────

export function rulerGeometry(r) {
  const o = { x: r.x, y: r.y };
  const u = unit(r.angle);
  const n = upNormal(u);
  const L = r.lengthCm * UNITS_PER_CM;
  const start = sub(o, scale(u, RULER_MARGIN));
  const end = add(o, scale(u, L + RULER_MARGIN));

  return {
    o, u, n, L,
    corners: [start, end, add(end, scale(n, RULER_WIDTH)), add(start, scale(n, RULER_WIDTH))],
    edges: [
      { id: 'ruler:graduated', a: start, b: end, graduated: true },
      { id: 'ruler:back', a: add(start, scale(n, RULER_WIDTH)), b: add(end, scale(n, RULER_WIDTH)) },
    ],
    rotateHandle: add(add(o, scale(u, L - 0.2 * UNITS_PER_CM)), scale(n, RULER_WIDTH * 0.62)),
    pivot: o,
    anchor: add(add(o, scale(u, L / 2)), scale(n, RULER_WIDTH / 2)),
  };
}

/**
 * Le compas : deux branches de même longueur articulées au sommet. La
 * longueur des branches grandit avec l'ouverture (un compas de tableau plutôt
 * qu'un compas de trousse) pour que l'articulation reste toujours visible.
 */
export function compassGeometry(c) {
  const pivot = { x: c.x, y: c.y };
  const u = unit(c.angle);
  const n = upNormal(u);
  const r = c.radius;
  const tip = add(pivot, scale(u, r));
  const leg = Math.max(4.5 * UNITS_PER_CM, r * 0.62);
  const h = Math.sqrt(Math.max(leg * leg - (r / 2) * (r / 2), 0));
  const mid = add(pivot, scale(u, r / 2));
  const apex = add(mid, scale(n, h));
  const knob = add(apex, scale(n, 0.9 * UNITS_PER_CM));

  return { pivot, tip, apex, knob, u, n, leg, anchor: add(mid, scale(n, h / 2)) };
}

export function protractorGeometry(p) {
  const center = { x: p.x, y: p.y };
  const u = unit(p.angle);
  const n = upNormal(u);
  const R = p.radiusCm * UNITS_PER_CM;

  return {
    center, u, n, R,
    /** La direction de la graduation `deg` (0 à 180), du côté du demi-disque. */
    directionOf: (deg) => add(scale(u, Math.cos(toRadians(deg))), scale(n, Math.sin(toRadians(deg)))),
    edges: [{ id: 'protractor:base', a: sub(center, scale(u, R + 0.3 * UNITS_PER_CM)), b: add(center, scale(u, R + 0.3 * UNITS_PER_CM)) }],
    rotateHandle: add(center, scale(u, R + 0.9 * UNITS_PER_CM)),
    needleHandle: add(center, scale(add(scale(u, Math.cos(toRadians(p.needleDeg))), scale(n, Math.sin(toRadians(p.needleDeg)))), R * 0.86)),
    pivot: center,
    anchor: add(center, scale(n, R / 2)),
  };
}

export function setSquareGeometry(s) {
  const v = { x: s.x, y: s.y };
  const u = unit(s.angle);
  const n = upNormal(u);
  const a = s.sizeCm * UNITS_PER_CM;
  const b = s.kind === '3060' ? a * Math.tan(toRadians(30)) : a;
  const A = add(v, scale(u, a));
  const B = add(v, scale(n, b));

  return {
    v, u, n, a, b, A, B,
    corners: [v, A, B],
    edges: [
      { id: 'setSquare:a', a: v, b: A, graduated: true },
      { id: 'setSquare:b', a: v, b: B },
      { id: 'setSquare:hyp', a: A, b: B },
    ],
    rotateHandle: add(add(v, scale(u, a * 0.62)), scale(n, b * 0.16)),
    pivot: v,
    anchor: scale(add(add(v, A), B), 1 / 3),
  };
}

export function instrumentGeometry(kind, inst) {
  switch (kind) {
    case 'ruler': return rulerGeometry(inst);
    case 'compass': return compassGeometry(inst);
    case 'protractor': return protractorGeometry(inst);
    case 'setSquare': return setSquareGeometry(inst);
    default: return null;
  }
}

/** Les bords le long desquels le قلم الهندسة peut glisser. Le compas n'en a pas. */
export function instrumentEdges(kind, inst) {
  if (!inst?.visible) return [];

  return instrumentGeometry(kind, inst)?.edges ?? [];
}

/** La boîte (scène) d'un instrument — pour l'export « مع أدوات الهندسة » et le recentrage. */
export function instrumentBounds(kind, inst) {
  const g = instrumentGeometry(kind, inst);
  let pts;
  switch (kind) {
    case 'ruler': pts = g.corners; break;
    case 'compass': pts = [g.pivot, g.tip, g.apex, g.knob]; break;
    case 'protractor': pts = [0, 30, 60, 90, 120, 150, 180].map((d) => add(g.center, scale(g.directionOf(d), g.R))).concat([g.rotateHandle]); break;
    case 'setSquare': pts = g.corners; break;
    default: return null;
  }
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const pad = 0.4 * UNITS_PER_CM;

  return { minX: Math.min(...xs) - pad, minY: Math.min(...ys) - pad, maxX: Math.max(...xs) + pad, maxY: Math.max(...ys) + pad };
}

// ── Les gestes ──────────────────────────────────────────────────────────

export const translateInstrument = (inst, delta) => ({ ...inst, x: inst.x + delta.x, y: inst.y + delta.y });

/** Tourne un instrument autour d'un point quelconque (deux doigts : le milieu des doigts). */
export function rotateInstrumentAround(inst, pivot, dAngle) {
  const ref = rotateAround({ x: inst.x, y: inst.y }, pivot, dAngle);

  return { ...inst, x: ref.x, y: ref.y, angle: inst.angle + dAngle };
}

/** Pose l'instrument de sorte que son centre visuel soit en `point` (recentrage, première apparition). */
export function placeAnchorAt(kind, inst, point) {
  const g = instrumentGeometry(kind, inst);

  return translateInstrument(inst, sub(point, g.anchor));
}

/**
 * Un instrument qu'on SORT se met à la taille de la سبّورة visible : sur un
 * téléphone, une règle de 15 cm ou une منقلة de 12 cm dépasseraient l'écran
 * et leur zéro, leur centre, seraient hors d'atteinte. On choisit la plus
 * grande taille qui tient dans 90 % de la largeur (et de la hauteur) vue.
 */
export function fitToView(kind, inst, view) {
  const w = (view.maxX - view.minX) * 0.9;
  const h = (view.maxY - view.minY) * 0.9;
  switch (kind) {
    case 'ruler': {
      const fits = RULER_LENGTHS_CM.filter((cm) => (cm + 1) * UNITS_PER_CM <= w);
      const lengthCm = fits.includes(inst.lengthCm) ? inst.lengthCm : (fits[fits.length - 1] ?? RULER_LENGTHS_CM[0]);

      return { ...inst, lengthCm };
    }
    case 'protractor': {
      const max = Math.min(w / 2, h * 0.8) / UNITS_PER_CM;

      return { ...inst, radiusCm: Math.max(3, Math.min(inst.radiusCm, Math.floor(max * 2) / 2)) };
    }
    case 'setSquare': {
      const max = Math.min(w, h * 0.9) / UNITS_PER_CM;

      return { ...inst, sizeCm: Math.max(4, Math.min(inst.sizeCm, Math.floor(max))) };
    }
    default:
      return inst;
  }
}

export function clampRadius(r) {
  return Math.min(COMPASS_MAX_RADIUS, Math.max(COMPASS_MIN_RADIUS, r));
}

/**
 * Garde un instrument ATTEIGNABLE : si son centre visuel sort du rectangle
 * visible (scène) moins une marge, on le ramène juste assez pour qu'il y
 * rentre. Un instrument n'est donc jamais perdu hors de l'écran.
 */
export function keepReachable(kind, inst, view, margin) {
  const g = instrumentGeometry(kind, inst);
  const minX = view.minX + margin; const maxX = view.maxX - margin;
  const minY = view.minY + margin; const maxY = view.maxY - margin;
  if (minX > maxX || minY > maxY) return placeAnchorAt(kind, inst, { x: (view.minX + view.maxX) / 2, y: (view.minY + view.maxY) / 2 });
  const target = { x: Math.min(maxX, Math.max(minX, g.anchor.x)), y: Math.min(maxY, Math.max(minY, g.anchor.y)) };
  if (target.x === g.anchor.x && target.y === g.anchor.y) return inst;

  return translateInstrument(inst, sub(target, g.anchor));
}

export function isAnchorVisible(kind, inst, view) {
  const g = instrumentGeometry(kind, inst);

  return g.anchor.x >= view.minX && g.anchor.x <= view.maxX && g.anchor.y >= view.minY && g.anchor.y <= view.maxY;
}

// ── La منقلة lit un angle ────────────────────────────────────────────────

/**
 * La graduation (0 à 180, sens scolaire) que la direction `d` croise sur la
 * منقلة — ou null si `d` part du mauvais côté du diamètre.
 */
export function protractorDegreeOf(p, d) {
  const g = protractorGeometry(p);
  const l = len(d);
  if (l < 1e-9) return null;
  const x = dot(d, g.u) / l;
  const y = dot(d, g.n) / l;
  if (y < -1e-6) return null;

  return toDegrees(Math.atan2(Math.max(0, y), x));
}

/**
 * La mesure d'un angle de sommet `vertex` par la منقلة : on cherche, parmi
 * les directions des côtés qui partent du sommet, celle qui est posée sur le
 * diamètre (0° ou 180°), puis l'autre côté du demi-disque le plus proche de
 * l'aiguille. Rend { degrees, from, to } ou null quand la منقلة n'est pas
 * posée sur un angle (centre loin du sommet, pas de côté sur le diamètre).
 *
 * @param {object} p           la منقلة
 * @param {{x:number,y:number}} vertex
 * @param {Array<{x:number,y:number}>} directions   les côtés, du sommet vers l'extérieur
 * @param {number} tolerance   écart toléré entre le centre et le sommet (unités de scène)
 */
export function measureAngleWithProtractor(p, vertex, directions, tolerance) {
  if (!isPoint(vertex) || dist(vertex, { x: p.x, y: p.y }) > tolerance) return null;
  const readings = directions.map((d) => ({ d, deg: protractorDegreeOf(p, d) })).filter((r) => r.deg !== null);
  const base = readings.find((r) => r.deg < 4 || r.deg > 176);
  if (!base) return null;
  const others = readings.filter((r) => r !== base && Math.abs(r.deg - base.deg) > 0.5);
  if (others.length === 0) return null;
  const onZero = base.deg < 90;
  const measured = others.map((r) => ({ ...r, value: onZero ? r.deg - base.deg : base.deg - r.deg }));
  measured.sort((x, y) => Math.abs(x.deg - p.needleDeg) - Math.abs(y.deg - p.needleDeg));
  const best = measured[0];

  return { degrees: Math.abs(best.value), from: base.d, to: best.d, fromZero: onZero };
}

// ── La persistance ──────────────────────────────────────────────────────

const finite = (v, fallback) => (Number.isFinite(v) ? v : fallback);
const bounded = (v, min, max, fallback) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);
const COORD = 1e6;

/** Un instrument venu du document — nombres vérifiés, bornes respectées ; le reste retombe sur le défaut. */
function sanitizeInstrument(kind, raw) {
  const base = defaultInstrument(kind);
  if (!raw || typeof raw !== 'object') return base;
  const out = {
    ...base,
    visible: raw.visible === true,
    x: bounded(raw.x, -COORD, COORD, base.x),
    y: bounded(raw.y, -COORD, COORD, base.y),
    angle: finite(raw.angle, base.angle) % (2 * Math.PI),
  };
  switch (kind) {
    case 'ruler': out.lengthCm = RULER_LENGTHS_CM.includes(raw.lengthCm) ? raw.lengthCm : base.lengthCm; break;
    case 'compass':
      out.radius = clampRadius(finite(raw.radius, base.radius));
      out.locked = raw.locked === true;
      break;
    case 'protractor':
      out.radiusCm = bounded(raw.radiusCm, 3, 12, base.radiusCm);
      out.needleDeg = bounded(raw.needleDeg, 0, 180, base.needleDeg);
      out.mode = ['construct', 'arc'].includes(raw.mode) ? raw.mode : 'measure';
      break;
    case 'setSquare':
      out.kind = SET_SQUARE_KINDS.includes(raw.kind) ? raw.kind : base.kind;
      out.sizeCm = bounded(raw.sizeCm, 4, 20, base.sizeCm);
      break;
    default: break;
  }

  return out;
}

export const PENCIL_KINDS = Object.freeze(['point', 'segment', 'line', 'ray', 'circle']);
export const PENCIL_WIDTHS = Object.freeze({ thin: 1.5, medium: 2.5, thick: 4 });
export const PENCIL_STYLES = Object.freeze(['solid', 'dashed', 'dotted']);

/**
 * « التثبيت الذكي » est l'interrupteur général ; chaque aimant a le sien,
 * et ne marche que si l'interrupteur général est ouvert (`snapOn`).
 */
const DEFAULT_SETTINGS = Object.freeze({
  snap: true, // التثبيت الذكي — l'interrupteur général
  attach: true, // التثبيت على الأداة : le crayon s'accroche au bord, à la pointe, au sommet
  graduations: true, // التثبيت على التدريج : le mm toujours, le cm quand on en passe près
  points: true, // التثبيت على النقاط : points nommés, intersections, extrémités
  angles: true, // التثبيت على الزوايا : horizontale, verticale, parallèle, perpendiculaire, rotations
  perpSnap: true, // تثبيت عمودي : le كوس se cale sur une droite
  measures: false, // إظهار القياسات
  autoLabels: true, // A, B, C… aux extrémités
  exportInstruments: false, // تصدير مع أدوات الهندسة
});

/** Un aimant est-il actif ? L'interrupteur général ET le sien. */
export const snapOn = (settings, key) => Boolean(settings?.snap) && Boolean(settings?.[key]);

const DESK_SCHEMA_VERSION = 1;

export function createDesk() {
  return {
    v: DESK_SCHEMA_VERSION,
    instruments: Object.fromEntries(INSTRUMENT_KINDS.map((k) => [k, defaultInstrument(k)])),
    settings: { ...DEFAULT_SETTINGS },
    pencil: { kind: 'segment', width: 'thin', style: 'solid' },
  };
}

/** Le bureau lu depuis le document : tout ce qui n'est pas au format retombe sur le défaut. */
export function sanitizeDesk(raw) {
  const desk = createDesk();
  if (!raw || typeof raw !== 'object') return desk;
  for (const kind of INSTRUMENT_KINDS) desk.instruments[kind] = sanitizeInstrument(kind, raw.instruments?.[kind]);
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (typeof raw.settings?.[key] === 'boolean') desk.settings[key] = raw.settings[key];
  }
  if (PENCIL_KINDS.includes(raw.pencil?.kind)) desk.pencil.kind = raw.pencil.kind;
  if (Object.hasOwn(PENCIL_WIDTHS, raw.pencil?.width ?? '')) desk.pencil.width = raw.pencil.width;
  if (PENCIL_STYLES.includes(raw.pencil?.style)) desk.pencil.style = raw.pencil.style;

  return desk;
}

// ── Caler un instrument ─────────────────────────────────────────────────

/**
 * Tourne une règle (autour de son zéro) pour que son bord passe EXACTEMENT
 * par un point de la scène, quand il passe déjà tout près. C'est le geste
 * « zéro sur A, je tourne jusqu'à B ».
 *
 * @returns {{angle: number, point: {x:number,y:number}} | null}
 */
export function snapRulerToPoints(origin, angle, points, tolerance, maxLength) {
  let best = null;
  for (const p of points) {
    const d = sub(p, origin);
    const l = len(d);
    if (l < UNITS_PER_CM || l > maxLength) continue;
    const target = Math.atan2(d.y, d.x);
    const gap = Math.atan2(Math.sin(angle - target), Math.cos(angle - target));
    if (Math.abs(gap) > Math.PI / 2) continue;
    const off = Math.abs(l * Math.sin(gap));
    if (off <= tolerance && (!best || off < best.off)) best = { angle: angle - gap, point: p, off };
  }

  return best ? { angle: best.angle, point: best.point } : null;
}

/**
 * Plaque un كوس contre une droite-guide : quand l'un de ses bords est
 * presque parallèle et tout près d'une droite (le bord d'une règle, une
 * droite de la construction), il tourne autour de son angle droit pour s'y
 * aligner exactement, puis glisse jusqu'à la toucher.
 *
 * Contre la RÈGLE, c'est le glissement du parallélisme (« نحافظ على الاتجاه
 * نفسه ») ; contre une DROITE par l'un de ses côtés de l'angle droit, c'est
 * l'équerrage (l'autre côté est perpendiculaire).
 *
 * @param {object} square  l'état du كوس
 * @param {Array<{id: string, a: object, b: object, source: 'ruler'|'line'}>} guides
 * @returns {{inst: object, edgeId: string, guide: object} | null}
 */
export function dockSetSquare(square, guides, tolerance, angleTolerance) {
  const g = setSquareGeometry(square);
  let best = null;
  for (const edge of g.edges) {
    const ed = sub(edge.b, edge.a);
    const edgeAngle = Math.atan2(ed.y, ed.x);
    for (const guide of guides) {
      const gd = sub(guide.b, guide.a);
      const gl = len(gd);
      if (gl < 1e-6) continue;
      const guideAngle = Math.atan2(gd.y, gd.x);
      // L'écart signé modulo π : une droite n'a pas de sens.
      let gap = guideAngle - edgeAngle;
      gap = Math.atan2(Math.sin(gap), Math.cos(gap));
      if (gap > Math.PI / 2) gap -= Math.PI;
      if (gap < -Math.PI / 2) gap += Math.PI;
      if (Math.abs(gap) > angleTolerance) continue;
      const rotated = rotateInstrumentAround(square, g.v, gap);
      const rg = setSquareGeometry(rotated);
      const redge = rg.edges.find((e) => e.id === edge.id);
      const mid = scale(add(redge.a, redge.b), 0.5);
      const gu = scale(gd, 1 / gl);
      const n = { x: -gu.y, y: gu.x };
      const offset = dot(sub(mid, guide.a), n);
      if (Math.abs(offset) > tolerance) continue;
      // Le bord doit rester EN FACE de la droite-guide (pas à son prolongement lointain).
      const t1 = dot(sub(redge.a, guide.a), gu);
      const t2 = dot(sub(redge.b, guide.a), gu);
      if (Math.max(t1, t2) < -tolerance || Math.min(t1, t2) > gl + tolerance) continue;
      const score = Math.abs(offset) + Math.abs(gap) * 100;
      if (!best || score < best.score) best = { inst: translateInstrument(rotated, scale(n, -offset)), edgeId: edge.id, guide, score };
    }
  }

  return best ? { inst: best.inst, edgeId: best.edgeId, guide: best.guide } : null;
}
