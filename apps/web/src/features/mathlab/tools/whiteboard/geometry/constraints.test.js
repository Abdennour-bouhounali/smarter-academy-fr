import { describe, expect, it } from 'vitest';
import { UNITS_PER_CM, dist, toRadians, angleOf, sub } from './geoMath.js';
import { defaultInstrument, placeAnchorAt } from './instruments.js';
import { constraintsFor, pickConstraint, snapToGraduation, cmTolerance } from './constraints.js';

const CM = UNITS_PER_CM;
const close = (a, b, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);
const opts = { graduations: true, cmTolerance: cmTolerance(1), detachDistance: 90 };

/** La mine qui tremble : un geste réel n'est jamais droit. */
const wobble = (p, i) => ({ x: p.x + Math.sin(i * 1.7) * 6, y: p.y + Math.cos(i * 2.3) * 6 });

function drawAlong(c, from, to, steps = 40) {
  const state0 = c.attach(from, opts);
  let state = { ...state0, s0: state0.s };
  for (let i = 1; i <= steps; i += 1) {
    const p = wobble({ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }, i);
    state = { ...state, ...c.constrain(p, state, opts) };
  }

  return { start: state0.point, end: state.point, state };
}

describe('the ruler constrains the ordinary pen', () => {
  const ruler = { ...defaultInstrument('ruler'), visible: true, x: 100, y: 200, angle: 0 };

  it('0 → 5 cm, drawn by a shaky hand, gives a straight 5 cm segment on the edge', () => {
    const [edge] = constraintsFor({ ruler });
    const { start, end, state } = drawAlong(edge, { x: 101, y: 205 }, { x: 100 + 5 * CM + 3, y: 196 });
    close(start.x, 100); close(start.y, 200);
    close(end.y, 200);
    close(dist(start, end), 5 * CM);
    close(edge.measure(state).length, 5 * CM);
  });

  it('follows a rotated ruler: 3 cm at 45°', () => {
    const r45 = { ...ruler, angle: toRadians(-45) };
    const [edge] = constraintsFor({ ruler: r45 });
    const u = { x: Math.cos(r45.angle), y: Math.sin(r45.angle) };
    const { start, end } = drawAlong(edge, { x: 100, y: 200 }, { x: 100 + u.x * 3 * CM + 4, y: 200 + u.y * 3 * CM - 2 });
    close(dist(start, end), 3 * CM);
    close(angleOf(sub(end, start)), toRadians(-45));
  });

  it('snaps to the millimetre, and to the whole centimetre when close', () => {
    close(snapToGraduation(4.97 * CM, cmTolerance(1)), 5 * CM);
    close(snapToGraduation(4.72 * CM, cmTolerance(1)), 4.7 * CM);
  });

  it('lets go when the pen moves far from the edge', () => {
    const [edge] = constraintsFor({ ruler });
    expect(edge.constrain({ x: 150, y: 400 }, {}, opts).away).toBe(true);
    expect(edge.constrain({ x: 150, y: 230 }, {}, opts).away).toBe(false);
  });

  it('is only reachable near the edge and within its length', () => {
    const [edge] = constraintsFor({ ruler });
    expect(edge.distance({ x: 150, y: 210 })).toBeLessThan(16);
    expect(edge.distance({ x: 100 + 40 * CM, y: 200 })).toBe(Infinity);
  });
});

describe('the compass, the protractor and the set square constrain too', () => {
  it('the compass pen keeps the radius exactly and sweeps continuously', () => {
    const compass = { ...defaultInstrument('compass'), visible: true, x: 0, y: 0, radius: 4 * CM, angle: 0 };
    const [arc] = constraintsFor({ compass });
    let state = arc.attach();
    for (let i = 1; i <= 36; i += 1) {
      const a = toRadians(-10 * i);
      state = { ...state, ...arc.constrain({ x: 300 * Math.cos(a), y: 300 * Math.sin(a) }, state) };
      close(dist(state.point, { x: 0, y: 0 }), 4 * CM);
    }
    close(state.sweep, -2 * Math.PI, 1e-9);
  });

  it('the protractor in construction draws a ray at exactly the chosen angle', () => {
    const protractor = { ...defaultInstrument('protractor'), visible: true, x: 0, y: 0, angle: 0, needleDeg: 60, mode: 'construct' };
    const [ray] = constraintsFor({ protractor });
    expect(ray.family).toBe('ray');
    const { start, end } = drawAlong(ray, { x: 2, y: 1 }, { x: 150, y: -230 });
    close(start.x, 0); close(start.y, 0);
    // 60° « scolaire » = vers le haut de l'écran.
    close(angleOf(sub(end, start)), toRadians(-60));
    // En mode « قياس », pas de demi-droite : le diamètre seulement.
    expect(constraintsFor({ protractor: { ...protractor, mode: 'measure' } }).map((c) => c.family)).toEqual(['straight']);
  });

  it('the set square offers its perpendicular leg', () => {
    const setSquare = { ...defaultInstrument('setSquare'), visible: true, x: 0, y: 0, angle: 0 };
    const legs = constraintsFor({ setSquare });
    const b = legs.find((c) => c.id === 'setSquare:b');
    const { start, end } = drawAlong(b, { x: 1, y: -10 }, { x: -3, y: -200 });
    close(end.x - start.x, 0);
  });

  it('with several instruments in reach, the closest holds the pen', () => {
    const ruler = { ...defaultInstrument('ruler'), visible: true, x: 0, y: 0, angle: 0 };
    const setSquare = { ...defaultInstrument('setSquare'), visible: true, x: 0, y: 10, angle: 0 };
    const all = constraintsFor({ ruler, setSquare });
    expect(pickConstraint({ x: 50, y: 8 }, all, 16).instrument).toBe('setSquare');
    expect(pickConstraint({ x: 50, y: 2 }, all, 16).instrument).toBe('ruler');
    expect(pickConstraint({ x: 50, y: 300 }, all, 16)).toBeNull();
    // Rien de posé : aucune contrainte, le crayon est libre.
    expect(constraintsFor({ ruler: { ...ruler, visible: false } })).toEqual([]);
  });

  it('keeps working after the ruler moves (the constraint follows the instrument)', () => {
    const ruler = placeAnchorAt('ruler', { ...defaultInstrument('ruler'), visible: true }, { x: 500, y: 500 });
    const [edge] = constraintsFor({ ruler });
    close(edge.origin.x, ruler.x); close(edge.origin.y, ruler.y);
  });
});

describe('the protractor draws ARCS along its curved edge (polar projection)', () => {
  const base = { ...defaultInstrument('protractor'), visible: true, x: 0, y: 0, angle: 0, mode: 'arc' };
  const R = base.radiusCm * CM;
  const at = (deg, r) => ({ x: r * Math.cos(toRadians(deg)), y: -r * Math.sin(toRadians(deg)) });
  const opts2 = { angles: true };
  const draw = (c, from, to, r = R + 7) => {
    let state = c.attach(at(from, r), opts2);
    for (let d = from; from < to ? d <= to : d >= to; d += from < to ? 3 : -3) state = { ...state, ...c.constrain(at(d + 0.4, r + Math.sin(d) * 6), state, opts2) };
    state = { ...state, ...c.constrain(at(to + 0.6, r - 5), state, opts2) };

    return state;
  };

  it('offers the rim and the inner edge, and no straight line, in arc mode', () => {
    const cs = constraintsFor({ protractor: base });
    expect(cs.map((c) => c.id)).toEqual(['protractor:rim', 'protractor:inner']);
    expect(cs.every((c) => c.family === 'arc')).toBe(true);
  });

  it('0° → 90° gives an exact quarter circle of the protractor radius', () => {
    const [rim] = constraintsFor({ protractor: base });
    const state = draw(rim, 0, 90);
    close(Math.abs(state.sweep), Math.PI / 2, 1e-9);
    close(dist(state.point, { x: 0, y: 0 }), R);
    close(state.startAngle, 0);
    expect(rim.measure(state).degrees).toBe(90);
  });

  it('30° → 120° is a 90° arc, whatever the hand does', () => {
    const [rim] = constraintsFor({ protractor: base });
    const state = draw(rim, 30, 120);
    expect(rim.measure(state).degrees).toBe(90);
    close(state.startAngle, toRadians(-30));
  });

  it('follows the protractor when it is rotated, and never leaves the semicircle', () => {
    const turned = { ...base, angle: toRadians(-40) };
    const [rim] = constraintsFor({ protractor: turned });
    let state = rim.attach({ x: R * Math.cos(toRadians(-40)), y: R * Math.sin(toRadians(-40)) }, opts2);
    close(state.startAngle, toRadians(-40));
    // Sous le diamètre : butée sur 0°, pas de cercle entier.
    state = { ...state, ...rim.constrain({ x: 0, y: 3 * R }, state, opts2) };
    expect(Math.abs(state.sweep)).toBeLessThanOrEqual(Math.PI + 1e-9);
  });

  it('snaps to the round angles unless angle snapping is off', () => {
    const [rim] = constraintsFor({ protractor: base });
    const s0 = rim.attach(at(0, R), opts2);
    expect(rim.constrain(at(58.4, R), s0, { angles: true }).deg).toBe(60);
    expect(rim.constrain(at(58.4, R), s0, { angles: false }).deg).toBe(58);
  });

  it('attaches only near a curved edge, on the scale side', () => {
    const [rim, inner] = constraintsFor({ protractor: base });
    expect(rim.distance(at(45, R + 5))).toBeLessThan(16);
    expect(rim.distance(at(45, R * 0.7))).toBeGreaterThan(16);
    expect(inner.distance(at(45, R * 0.42))).toBeLessThan(1);
    expect(rim.distance({ x: 0, y: R })).toBe(Infinity);
  });
});
