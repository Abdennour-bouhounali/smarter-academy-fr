import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { declutter, topFrame, TOP_FOV } from './topView';

const project = (shot, p) => {
  const cam = new THREE.PerspectiveCamera(shot.fov, 16 / 9, 1, 50000);
  cam.position.copy(shot.pos);
  cam.lookAt(shot.look);
  cam.updateMatrixWorld();
  return new THREE.Vector3(p.x, p.y ?? 0, p.z).project(cam);
};

describe('the top view of a stage', () => {
  const river = [
    { x: -2, z: -338 },
    { x: -2, z: -410 },
    { x: -2, z: -419 },
    { x: 50, z: -419 },
    { x: -418, z: -338 },
  ];
  for (const dir of [
    { x: 0, z: -1 },
    { x: 1, z: 0 },
    { x: -0.6, z: 0.8 },
  ])
    it(`frames every point of the stage, the screen's top along ${JSON.stringify(dir)}`, () => {
      const shot = topFrame({ points: river, dir });
      // inside the part of the screen the HUD leaves clear: under the instruction (30 %), over the buttons (12 %)
      for (const p of river) {
        const v = project(shot, p);
        expect(Math.abs(v.x)).toBeLessThan(0.81);
        expect(v.y).toBeLessThan(1 - 2 * 0.3 + 1e-9);
        expect(v.y).toBeGreaterThan(-1 + 2 * 0.12 - 1e-9);
      }
      // straight down, as near a plan as a lens gives: a narrow lens, high over the figure, a hair off the vertical
      expect(shot.fov).toBe(TOP_FOV);
      expect(TOP_FOV).toBeLessThanOrEqual(20);
      expect(shot.pos.y).toBeGreaterThan(800);
      expect(Math.hypot(shot.pos.x - shot.look.x, shot.pos.z - shot.look.z) / shot.pos.y).toBeLessThan(0.01);
      // the screen's top is the shot's dir — the way the lens looked, or a quarter turn of it (a long figure lies across)
      expect(
        Math.abs(shot.dir.x * dir.z - shot.dir.z * dir.x) < 1e-9 ||
          Math.abs(shot.dir.x * dir.x + shot.dir.z * dir.z) < 1e-9,
      ).toBe(true);
      const c = shot.look;
      const up = project(shot, { x: c.x + shot.dir.x * 30, z: c.z + shot.dir.z * 30 });
      const down = project(shot, { x: c.x - shot.dir.x * 30, z: c.z - shot.dir.z * 30 });
      expect(up.y).toBeGreaterThan(down.y);
    });

  it('moves a label off another one, and puts it back from its home', () => {
    const shot = topFrame({ points: river, dir: { x: 0, z: -1 } });
    const label = (x, z) => {
      const s = new THREE.Sprite();
      s.position.set(x, 2, z);
      s.scale.set(0.06, 0.03, 1);
      s.userData.set = () => {};
      return s;
    };
    const S = label(-2, -410);
    const E = label(-2, -419);
    const far = label(50, -338);
    const moved = declutter([S, E, far], shot);
    expect(moved.length).toBe(1);
    expect(far.position.z).toBe(-338);
    // apart on the screen by a label's height or a label's width at least (it may go up, sideways or down)
    const a = project(shot, S.getWorldPosition(new THREE.Vector3()));
    const b = project(shot, E.getWorldPosition(new THREE.Vector3()));
    const k = 384 / Math.tan(((TOP_FOV / 2) * Math.PI) / 180);
    const apart = Math.abs(a.y - b.y) * 384 >= 0.03 * k - 0.5 || Math.abs(a.x - b.x) * 384 * (16 / 9) >= 0.06 * k - 0.5;
    expect(apart).toBe(true);
    // run again: from the homes, the same places
    const z = moved[0].position.z;
    declutter([S, E, far], shot);
    expect(moved[0].position.z).toBeCloseTo(z);
  });

  it("keeps a label off what the page draws over the world (Zero's bubble, a card)", () => {
    const shot = topFrame({ points: river, dir: { x: 0, z: -1 } });
    const s = new THREE.Sprite();
    s.position.set(-2, 2, -410);
    s.scale.set(0.01, 0.005, 1);
    const cam = project(shot, s.position);
    const at = { x: ((cam.x + 1) / 2) * 768 * (16 / 9), y: ((1 - cam.y) / 2) * 768 };
    const moved = declutter([s], shot, { keepOut: [{ ...at, w: 200, h: 40 }] });
    expect(moved).toEqual([s]);
    const v = project(shot, s.getWorldPosition(new THREE.Vector3()));
    expect(at.y - ((1 - v.y) / 2) * 768).toBeGreaterThan(20);
  });
});
