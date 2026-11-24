import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { onStep, steerAngle, turnStep } from './steer';
import { GameInput } from '../engine/input';
import { TURN } from '../nilePyramids/logic';

const RAD = Math.PI / 180;
const dirOf = (a) => ({ x: Math.sin(a), z: Math.cos(a) });
/** The ground direction that is « right » on screen for a camera looking along `a` (three.js, y up). */
const screenRight = (a) => ({ x: -Math.cos(a), z: Math.sin(a) });
const dot = (a, b) => a.x * b.x + a.z * b.z;
const deg = (a) => a / RAD;

describe('the world clock (default — the `rootCourts` world unchanged)', () => {
  it('→ walks towards three o’clock of the world, whatever he faced', () => {
    for (const twelve of [0, Math.PI, 2]) {
      expect(dot(dirOf(steerAngle(twelve, { x: 1, y: 0 })), screenRight(twelve))).toBeCloseTo(1);
      expect(dot(dirOf(steerAngle(twelve, { x: 0, y: 1 })), dirOf(twelve))).toBeCloseTo(1);
    }
  });

  it('screenRight is the right of a three.js camera looking along the angle', () => {
    for (const a of [0, 1, Math.PI, -2]) {
      const cam = new THREE.PerspectiveCamera();
      cam.lookAt(Math.sin(a), 0, Math.cos(a));
      cam.updateMatrixWorld();
      const r = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
      expect(r.x).toBeCloseTo(screenRight(a).x);
      expect(r.z).toBeCloseTo(screenRight(a).z);
    }
  });
});

describe('his own facing (the pyramids world, owner 2026-11-24): one press turns him 5°', () => {
  const start = { view: Math.PI, way: 0, held: 0 };
  const press = (t, x, frames = 1, dt = 1 / 60) => {
    let s = t;
    for (let i = 0; i < frames; i += 1) s = turnStep(s, x, dt, TURN);
    return turnStep(s, 0, dt, TURN); // let go
  };

  it('the step is 5°, in the world’s one constant', () => {
    expect(TURN.step).toBe(5);
  });

  for (const [name, x] of [
    ['→ (a key, or the stick pushed right)', 1],
    ['← (a key, or the stick pushed left)', -1],
  ])
    it(`${name}: one tap turns him by exactly 5°, towards that side of the screen`, () => {
      const t = press(start, x, 3);
      expect(deg(start.view - t.view)).toBeCloseTo(5 * x, 6);
      // the new facing leans towards the side of the screen he pressed (the lens looked along his old facing)
      expect(Math.sign(dot(dirOf(t.view), screenRight(start.view)))).toBe(x);
      // a second tap: 10°
      expect(deg(start.view - press(t, x, 2).view)).toBeCloseTo(10 * x, 6);
    });

  it('held, he keeps turning smoothly, and let go he rests on a 5° step — a tap never overshoots', () => {
    let t = start;
    for (let i = 0; i < 18; i += 1) t = turnStep(t, 1, 1 / 60, TURN); // 0,3 s: the delay — still one step
    expect(deg(start.view - t.view)).toBeCloseTo(5, 6);
    for (let i = 0; i < 60; i += 1) t = turnStep(t, 1, 1 / 60, TURN); // one more second at 90°/s
    expect(deg(start.view - t.view)).toBeGreaterThan(80);
    t = turnStep(t, 0, 1 / 60, TURN);
    const d = deg(start.view - t.view);
    expect(Math.abs(d / 5 - Math.round(d / 5))).toBeLessThan(1e-9);
    expect(onStep(t.view, 5)).toBeCloseTo(t.view, 12);
  });

  it('the keys and the on-screen stick feed the same left-right (`GameInput.axis`)', () => {
    const stub = typeof window === 'undefined';
    if (stub) globalThis.window = { addEventListener() {}, removeEventListener() {} };
    const input = new GameInput();
    input.setStick(1, 0);
    expect(deg(start.view - press(start, input.axis().x).view)).toBeCloseTo(5, 6);
    input.setStick(-1, 0);
    expect(deg(start.view - press(start, input.axis().x).view)).toBeCloseTo(-5, 6);
    input.dispose();
    if (stub) delete globalThis.window;
  });
});
