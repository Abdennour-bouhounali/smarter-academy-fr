import { describe, expect, it } from 'vitest';
import {
  UNITS_PER_CM, dist, intersectCircles, intersectLineCircle, intersectLines, angleInSweep, formatNumber, formatLength,
  lineAngleGap, toRadians, arcPoints,
} from './geoMath.js';
import {
  compassGeometry, protractorGeometry, setSquareGeometry, rulerGeometry, measureAngleWithProtractor, sanitizeDesk, createDesk,
  keepReachable, instrumentGeometry, dockSetSquare, snapRulerToPoints, defaultInstrument,
} from './instruments.js';
import {
  readGeoScene, linearSkeleton, pointSkeletons, circleSkeleton, arcSkeleton, solveDependents, nextLabel, nextSeq,
  constructionSteps, measureContent, missingMeasureSkeletons, drawnEnds,
} from './constructions.js';
import { collectSnapTargets, snapPoint, snapDirection, snapToEdge, snapRotation } from './snap.js';

const CM = UNITS_PER_CM;
const close = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

/** Un squelette → un « élément » minimal, comme Excalidraw le rendrait (ce que readGeoScene lit). */
const el = (skeleton) => ({ angle: 0, isDeleted: false, version: 1, ...skeleton });

describe('geoMath', () => {
  it('intersects lines, a line and a circle, two circles', () => {
    const hit = intersectLines({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: -5 }, { x: 5, y: 5 });
    close(hit.point.x, 5); close(hit.point.y, 0);
    expect(intersectLines({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toBeNull();
    expect(intersectLineCircle({ x: -10, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 0 }, 5)).toHaveLength(2);
    // Le triangle équilatéral : les deux arcs de rayon AB se coupent à √3/2·AB au-dessus du milieu.
    const [c1, c2] = intersectCircles({ x: 0, y: 0 }, 100, { x: 100, y: 0 }, 100);
    close(c1.x, 50); close(Math.abs(c1.y), 100 * Math.sqrt(3) / 2);
    close(c2.y, -c1.y);
    expect(intersectCircles({ x: 0, y: 0 }, 10, { x: 100, y: 0 }, 10)).toEqual([]);
  });

  it('knows whether an angle lies in a signed sweep', () => {
    expect(angleInSweep(0.5, 0, 1)).toBe(true);
    expect(angleInSweep(-0.5, 0, 1)).toBe(false);
    expect(angleInSweep(-0.5, 0, -1)).toBe(true);
    expect(angleInSweep(3, 0, 2 * Math.PI)).toBe(true);
  });

  it('formats numbers the Algerian way and lengths in desk centimetres', () => {
    expect(formatNumber(5.24)).toBe('5,2');
    expect(formatNumber(-3)).toBe('−3');
    expect(formatNumber(-0.01)).toBe('0');
    expect(formatLength(5.2 * CM)).toBe('5,2');
  });

  it('measures the gap between undirected lines', () => {
    close(lineAngleGap(0, Math.PI), 0);
    close(lineAngleGap(0, toRadians(95)), toRadians(85));
  });

  it('samples an arc finely but boundedly', () => {
    const pts = arcPoints({ x: 0, y: 0 }, 10, 0, 2 * Math.PI);
    expect(pts.length).toBeLessThanOrEqual(181);
    close(dist(pts[0], pts[pts.length - 1]), 0);
  });
});

describe('instruments', () => {
  it('a compass keeps its pencil at exactly the radius from the needle', () => {
    const c = { ...defaultInstrument('compass'), x: 10, y: 20, radius: 4.2 * CM, angle: 1 };
    const g = compassGeometry(c);
    close(dist(g.pivot, g.tip), 4.2 * CM);
    close(dist(g.apex, g.pivot), dist(g.apex, g.tip));
  });

  it('a ruler has its zero at (x, y) on the graduated edge', () => {
    const g = rulerGeometry({ ...defaultInstrument('ruler'), x: 100, y: 50 });
    const edge = g.edges.find((e) => e.graduated);
    close(edge.a.y, 50); close(edge.b.y, 50);
    // Le corps est AU-DESSUS du bord gradué (y plus petit à l'écran).
    expect(g.anchor.y).toBeLessThan(50);
  });

  it('a 30/60 set square has a right angle and a 30° vertex', () => {
    const g = setSquareGeometry({ ...defaultInstrument('setSquare'), kind: '3060' });
    close(Math.atan2(g.b, g.a), toRadians(30));
    const dA = { x: g.A.x - g.v.x, y: g.A.y - g.v.y };
    const dB = { x: g.B.x - g.v.x, y: g.B.y - g.v.y };
    close(dA.x * dB.x + dA.y * dB.y, 0);
  });

  it('the protractor reads an angle whose vertex it sits on', () => {
    const p = { ...defaultInstrument('protractor'), x: 0, y: 0, angle: 0 };
    // Un côté sur 0°, l'autre à 42° « au-dessus » (y négatif à l'écran).
    const a = toRadians(42);
    const reading = measureAngleWithProtractor(p, { x: 0, y: 0 }, [{ x: 1, y: 0 }, { x: Math.cos(a), y: -Math.sin(a) }], 5);
    close(reading.degrees, 42, 1e-9);
    // Posé ailleurs que sur le sommet : rien.
    expect(measureAngleWithProtractor(p, { x: 100, y: 0 }, [{ x: 1, y: 0 }], 5)).toBeNull();
    // Côté sur 180° : la lecture se fait sur l'autre échelle.
    const flipped = measureAngleWithProtractor(p, { x: 0, y: 0 }, [{ x: -1, y: 0 }, { x: Math.cos(a), y: -Math.sin(a) }], 5);
    close(flipped.degrees, 138, 1e-9);
  });

  it('the protractor needle handle sits on the requested graduation', () => {
    const g = protractorGeometry({ ...defaultInstrument('protractor'), needleDeg: 90 });
    close(g.needleHandle.x, 0);
    expect(g.needleHandle.y).toBeLessThan(0);
  });

  it('keeps a dragged-away instrument reachable', () => {
    const view = { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    const far = { ...defaultInstrument('ruler'), visible: true, x: 5000, y: -3000 };
    const back = keepReachable('ruler', far, view, 40);
    const anchor = instrumentGeometry('ruler', back).anchor;
    expect(anchor.x).toBeLessThanOrEqual(760);
    expect(anchor.y).toBeGreaterThanOrEqual(40);
  });

  it('a ruler rotated near a point snaps its edge through the point', () => {
    const hit = snapRulerToPoints({ x: 0, y: 0 }, toRadians(2), [{ x: 200, y: 0 }], 10, 600);
    close(hit.angle, 0);
    expect(snapRulerToPoints({ x: 0, y: 0 }, toRadians(20), [{ x: 200, y: 0 }], 10, 600)).toBeNull();
  });

  it('a set square slid against a ruler docks flush and parallel', () => {
    const square = { ...defaultInstrument('setSquare'), visible: true, x: 50, y: -4, angle: toRadians(2) };
    const guide = { id: 'ruler:back', a: { x: -100, y: 0 }, b: { x: 600, y: 0 }, source: 'ruler' };
    const docked = dockSetSquare(square, [guide], 12, toRadians(4));
    expect(docked.edgeId).toBe('setSquare:a');
    const g = setSquareGeometry(docked.inst);
    close(g.v.y, 0, 1e-6); close(g.A.y, 0, 1e-6);
    expect(dockSetSquare({ ...square, y: -60 }, [guide], 12, toRadians(4))).toBeNull();
  });

  it('sanitizes a stored desk and refuses nonsense', () => {
    const desk = sanitizeDesk({
      instruments: { ruler: { visible: true, x: 1, y: 2, angle: 0.5, lengthCm: 999 }, compass: { visible: true, radius: 1e9 } },
      settings: { snap: false, measures: 'yes' },
      pencil: { kind: 'hexagon', width: 'thick', style: 'dotted' },
    });
    expect(desk.instruments.ruler).toMatchObject({ visible: true, x: 1, y: 2, lengthCm: 15 });
    expect(desk.instruments.compass.radius).toBe(25 * CM);
    expect(desk.settings.snap).toBe(false);
    expect(desk.settings.measures).toBe(createDesk().settings.measures);
    expect(desk.pencil).toEqual({ kind: 'segment', width: 'thick', style: 'dotted' });
    expect(sanitizeDesk(null)).toEqual(createDesk());
  });
});

describe('constructions', () => {
  const style = { width: 1.5, style: 'solid' };

  /** Le triangle équilatéral du cours : AB, deux arcs de rayon AB, C à l'intersection. */
  function equilateralScene() {
    const A = pointSkeletons({ x: 0, y: 0 }, { label: 'A', seq: 1 });
    const B = pointSkeletons({ x: 5 * CM, y: 0 }, { label: 'B', seq: 2 });
    const AB = linearSkeleton('segment', { x: 0, y: 0 }, { x: 5 * CM, y: 0 }, style, { from: A.id, to: B.id, seq: 3, via: { tool: 'ruler' } });
    const arcA = arcSkeleton({ x: 0, y: 0 }, 5 * CM, 0, -Math.PI / 2, style, { centerId: A.id, seq: 4, via: { tool: 'compass' } });
    const arcB = arcSkeleton({ x: 5 * CM, y: 0 }, 5 * CM, Math.PI, Math.PI / 2, style, { centerId: B.id, seq: 5, via: { tool: 'compass' } });

    return { A, B, AB, elements: [...A.skeletons, ...B.skeletons, AB, arcA, arcB].map(el) };
  }

  it('reads points, labels, segments and arcs back from the elements', () => {
    const { elements, A, B } = equilateralScene();
    const scene = readGeoScene(elements);
    expect(scene.points.size).toBe(2);
    expect(scene.points.get(A.id).label).toBe('A');
    expect(scene.linears[0]).toMatchObject({ kind: 'segment', from: A.id, to: B.id });
    expect(scene.circles).toHaveLength(2);
  });

  it('finds C at the intersection of the two arcs, and snaps to it', () => {
    const scene = readGeoScene(equilateralScene().elements);
    const targets = collectSnapTargets(scene);
    const C = { x: 2.5 * CM, y: -5 * CM * Math.sqrt(3) / 2 };
    const hit = snapPoint({ x: C.x + 4, y: C.y - 3 }, targets, 12);
    expect(hit.kind).toBe('intersection');
    close(hit.point.x, C.x, 1e-6); close(hit.point.y, C.y, 1e-6);
    // A point wins over anything near it.
    expect(snapPoint({ x: 3, y: 2 }, targets, 12).kind).toBe('point');
    // The lower intersection is NOT on the drawn arcs.
    expect(snapPoint({ x: C.x, y: -C.y }, targets, 12)).toBeNull();
  });

  it('moving A redraws AB, moves the arc centred on A, and updates the measure', () => {
    const { elements, A, AB } = equilateralScene();
    const scene0 = readGeoScene(elements);
    const measure = el({ id: 'm1', type: 'text', x: 0, y: 0, text: 'AB = 5', customData: { geo: { kind: 'measure', of: AB.id, what: 'length' } } });
    const moved = [...elements, measure].map((e) => (e.id === A.id ? { ...e, x: e.x - CM, y: e.y } : e));
    const anchors = new Map([['m1', measureContent(scene0, { of: AB.id, what: 'length' }).anchor]]);
    const updates = solveDependents(moved, { anchors });
    const ab = updates.find((u) => u.id === AB.id);
    expect(ab.patch.x).toBeCloseTo(-CM, 6);
    expect(ab.patch.points[1][0]).toBeCloseTo(6 * CM, 6);
    expect(updates.find((u) => u.id === 'm1').patch.text).toBe('AB = 6');
    expect(updates.some((u) => u.patch.x !== undefined && u.id.startsWith('arc'))).toBe(true);
    // Idempotent : une scène cohérente ne demande rien.
    expect(solveDependents(elements)).toEqual([]);
  });

  it('a segment dragged away from its points detaches at the end of the gesture', () => {
    const { elements, AB } = equilateralScene();
    const moved = elements.map((e) => (e.id === AB.id ? { ...e, y: e.y + 50 } : e));
    const selectedIds = new Set([AB.id]);
    expect(solveDependents(moved, { selectedIds, dragging: true })).toEqual([]);
    const [detach] = solveDependents(moved, { selectedIds, dragging: false });
    expect(detach.patch.customData.geo).toMatchObject({ from: null, to: null });
  });

  it('draws a line beyond its points and a ray beyond one end only', () => {
    const [l0, l1] = drawnEnds('line', { x: 0, y: 0 }, { x: 100, y: 0 });
    expect(l0.x).toBeLessThan(0); expect(l1.x).toBeGreaterThan(100);
    const [r0, r1] = drawnEnds('ray', { x: 0, y: 0 }, { x: 100, y: 0 });
    expect(r0.x).toBe(0); expect(r1.x).toBeGreaterThan(100);
  });

  it('names points A, B, C… and never twice', () => {
    expect(nextLabel([])).toBe('A');
    expect(nextLabel(['A', 'B'])).toBe('C');
    expect(nextLabel('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))).toBe('A1');
  });

  it('replays the construction in the order it was made', () => {
    const { elements } = equilateralScene();
    const steps = constructionSteps(elements);
    expect(steps.map((s) => s.kind)).toEqual(['point', 'point', 'segment', 'arc', 'arc']);
    expect(steps[3].via).toEqual({ tool: 'compass' });
    expect(nextSeq(elements)).toBe(6);
  });

  it('measures what is not yet measured, and names the angle it reads', () => {
    const { elements } = equilateralScene();
    const skeletons = missingMeasureSkeletons([...elements, el(circleSkeleton({ x: 0, y: 0 }, 2 * CM, style))]);
    expect(skeletons.map((s) => s.text).sort()).toEqual(['AB = 5', 'r = 2', 'r = 5', 'r = 5']);

    const V = pointSkeletons({ x: 0, y: 0 }, { label: 'B' });
    const P = pointSkeletons({ x: 100, y: 0 }, { label: 'A' });
    const Q = pointSkeletons({ x: 50, y: -50 * Math.sqrt(3) }, { label: 'C' });
    const s1 = linearSkeleton('segment', { x: 0, y: 0 }, { x: 100, y: 0 }, style, { from: V.id, to: P.id });
    const s2 = linearSkeleton('segment', { x: 0, y: 0 }, { x: 50, y: -50 * Math.sqrt(3) }, style, { from: V.id, to: Q.id });
    const scene = readGeoScene([...V.skeletons, ...P.skeletons, ...Q.skeletons, s1, s2].map(el));
    expect(measureContent(scene, { what: 'angle', vertex: V.id, arms: [s1.id, s2.id] }).text).toBe('∠ABC = 60°');
  });
});

describe('snap', () => {
  it('snaps a direction to horizontal, and to perpendicular of a scene line', () => {
    const h = snapDirection({ x: 0, y: 0 }, { x: 100, y: 3 }, []);
    expect(h.kind).toBe('horizontal');
    close(h.end.y, 0); close(dist({ x: 0, y: 0 }, h.end), Math.hypot(100, 3));
    const line = { a: { x: 0, y: 0 }, b: { x: 100, y: 100 } };
    const p = snapDirection({ x: 0, y: 0 }, { x: 100, y: -97 }, [line]);
    expect(p.kind).toBe('perpendicular');
    expect(snapDirection({ x: 0, y: 0 }, { x: 100, y: 30 }, [])).toBeNull();
  });

  it('puts the pencil on an instrument edge within reach only', () => {
    const edges = [{ id: 'e', a: { x: 0, y: 0 }, b: { x: 200, y: 0 } }];
    expect(snapToEdge({ x: 50, y: 8 }, edges, 14).point).toEqual({ x: 50, y: 0 });
    expect(snapToEdge({ x: 50, y: 30 }, edges, 14)).toBeNull();
  });

  it('snaps a rotation to a scene direction before a round angle', () => {
    expect(snapRotation(toRadians(31), { directions: [toRadians(30)] }).kind).toBe('line');
    expect(snapRotation(toRadians(44), {}).angle).toBeCloseTo(toRadians(45), 9);
    expect(snapRotation(toRadians(40), {})).toBeNull();
  });
});
