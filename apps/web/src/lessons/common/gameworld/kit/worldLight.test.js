/**
 * K-f (PYRAMIDS_WORLD_PLAN §2.4): the sun's direction, the shadow box and the fog range are hooks of the runtime. A world
 * that says nothing keeps the light every world had before the hooks: the sun at (+22, 38, +16) from the robot, a shadow
 * box of ±26 from 1 to 120, a fog from 70 to 300 and a far plane at 1200.
 */
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { WorldRuntime } from './WorldRuntime';
import { DivisorIslesGame } from '../divisorIsles/Game';
import { RootCourtsGame } from '../rootCourts/Game';
import { MissionIsleGame } from '../missionIsle/Game';

/** A runtime reduced to what its light touches: the sun, the fog, the camera, the robot. */
function lit(Kind = WorldRuntime, at = new THREE.Vector3(5, 0, -40)) {
  const w = Object.create(Kind.prototype);
  w.scene = new THREE.Scene();
  const [near, far] = w.fogRange();
  w.scene.fog = new THREE.Fog(0xffffff, near, far);
  w.camera = new THREE.PerspectiveCamera(55, 1, 0.1, Math.max(1200, far * 2));
  w.sun = new THREE.DirectionalLight(0xffffff, 1);
  w.hero = { pos: at };
  w.fitShadow(w.shadowBox());
  w.applyLight();
  return w;
}
const HOOKS = ['sunDir', 'shadowBox', 'fogRange', 'applyLight', 'fitShadow'];

describe('the light of the runtime (K-f)', () => {
  it('a world that gives no hook keeps the light of before: the sun at +22, 38, +16 from the robot', () => {
    const w = lit();
    expect(w.sun.position.x).toBeCloseTo(5 + 22, 9);
    expect(w.sun.position.y).toBeCloseTo(38, 9);
    expect(w.sun.position.z).toBeCloseTo(-40 + 16, 9);
    expect(w.sun.target.position.toArray()).toEqual([5, 0, -40]);
    const sc = w.sun.shadow.camera;
    expect([sc.left, sc.right, sc.top, sc.bottom, sc.near, sc.far]).toEqual([-26, 26, 26, -26, 1, 120]);
    expect([w.scene.fog.near, w.scene.fog.far]).toEqual([70, 300]);
    expect(w.camera.far).toBe(1200);
  });

  it('the robot standing higher does not lift the sun (its height was always 38)', () => {
    const w = lit(WorldRuntime, new THREE.Vector3(0, 12, 0));
    expect(w.sun.position.y).toBeCloseTo(38, 9);
  });

  it('none of the worlds before the pyramids overrides a light hook', () => {
    for (const Kind of [DivisorIslesGame, RootCourtsGame, MissionIsleGame])
      for (const h of HOOKS)
        expect(Object.prototype.hasOwnProperty.call(Kind.prototype, h), `${Kind.name}.${h}`).toBe(false);
  });

  it('a world that gives the hooks gets its sun, its box (centred where it says) and its fog; the far plane follows', () => {
    class Desert extends WorldRuntime {
      sunDir() {
        return new THREE.Vector3(3, 2, 0).normalize();
      }
      shadowBox() {
        return { half: 260, near: 10, far: 1400, distance: 600, at: { x: 300, z: -1500 } };
      }
      fogRange() {
        return [700, 4500];
      }
    }
    const w = lit(Desert);
    const d = new THREE.Vector3(3, 2, 0).normalize().multiplyScalar(600);
    expect(w.sun.position.x).toBeCloseTo(300 + d.x, 9);
    expect(w.sun.position.y).toBeCloseTo(d.y, 9);
    expect(w.sun.position.z).toBeCloseTo(-1500, 9);
    const sc = w.sun.shadow.camera;
    expect([sc.left, sc.right, sc.near, sc.far]).toEqual([-260, 260, 10, 1400]);
    expect([w.scene.fog.near, w.scene.fog.far]).toEqual([700, 4500]);
    expect(w.camera.far).toBe(9000);
  });

  it('a change of box re-fits the shadow camera; the same box leaves it alone', () => {
    const w = lit();
    const sc = w.sun.shadow.camera;
    let fits = 0;
    const was = sc.updateProjectionMatrix.bind(sc);
    sc.updateProjectionMatrix = () => {
      fits += 1;
      was();
    };
    w.applyLight();
    expect(fits).toBe(0);
    w.shadowBox = () => ({ half: 60, near: 1, far: 300, distance: 200, at: null });
    w.applyLight();
    expect(fits).toBe(1);
    expect(sc.right).toBe(60);
  });
});
