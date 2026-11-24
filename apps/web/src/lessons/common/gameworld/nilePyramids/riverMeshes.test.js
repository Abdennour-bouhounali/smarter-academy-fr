/**
 * The felucca's river (`riverMeshes.js`), built WITHOUT a renderer or a page: the meshes the world gives the kit's gate
 * run (K-b) have the sizes the run needs — the three lanes fit on the water, the boat between two lanes' obstacles, Zero
 * on its deck, the crocodile half under the water — and the hooks the run calls (`flow`, `tick`, `dress`) do what they say.
 */
import * as THREE from 'three';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GateRun } from '../kit/GateRun';
import { buoy, crocodile, felucca, riverRun, riverTrack } from './riverMeshes';

const box = (o) => {
  o.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(o);
};

describe('the river', () => {
  it('holds the three lanes between its banks, and passes by: banks, palms and ripples come towards the boat', () => {
    const t = riverTrack();
    const { lanes } = riverRun().skin;
    const half = t.userData.width / 2;
    expect(lanes + 3 / 2 + 1).toBeLessThan(half); // the outer lane, the boat's half-width and a metre to the bank
    for (const b of t.userData.banks) expect(Math.abs(b.position.z) - 30).toBeCloseTo(half, 6);
    const water = t.getObjectByName('water');
    expect(water.position.y).toBe(0);
    const p = t.userData.palms[3];
    const x0 = p.position.x;
    const off = water.material.normalMap.offset.x;
    t.userData.flow(2);
    expect(p.position.x).toBeCloseTo(x0 - 2, 6);
    expect(water.material.normalMap.offset.x).not.toBe(off);
    // a palm that passes behind the boat comes back far ahead: the banks never empty
    for (let k = 0; k < 400; k += 1) t.userData.flow(1);
    for (const q of t.userData.palms) expect(q.position.x).toBeGreaterThanOrEqual(-40);
    expect(water.material.normalMap.image.data.length).toBe(128 * 128 * 4);
  });
});

describe('the felucca', () => {
  it('is built along +z (prow), about 2.5 m wide, its origin where Zero stands at the helm, the mast ahead of him', () => {
    const f = felucca();
    const b = box(f);
    const size = b.getSize(new THREE.Vector3());
    expect(size.x).toBeGreaterThan(2.3);
    expect(size.x).toBeLessThan(riverRun().skin.lanes); // a crocodile in the next lane is passed beside, not touched
    expect(size.z).toBeGreaterThan(size.x * 2);
    expect(b.max.z).toBeGreaterThan(3.5); // the prow far ahead of him
    expect(b.min.z).toBeLessThan(-1); // the stern behind him
    // the mast stands ahead of him, and the sail is lower than the camera's line to the buoys (it never hides them)
    let mastZ = null;
    f.traverse((o) => o.geometry?.type === 'CylinderGeometry' && (mastZ = o.getWorldPosition(new THREE.Vector3()).z));
    expect(mastZ).toBeGreaterThan(1);
    const cam = riverRun().skin.camera;
    const sailTop = box(f.getObjectByName('sail')).max.y + 0.3;
    const sightAt = cam.up + 0.3 - ((cam.up - cam.look) * (cam.back + mastZ)) / (cam.back + 34);
    expect(sailTop).toBeLessThan(sightAt);
    expect(f.userData.deck).toBeGreaterThan(0.5);
    expect(f.userData.deck).toBeLessThan(1);
    const hull = box(f.getObjectByName('hull'));
    expect(hull.min.y).toBeLessThan(0.1); // it sits in the water
    expect(hull.max.y).toBeGreaterThan(f.userData.deck - 0.2);
    const sail = f.getObjectByName('sail');
    const y0 = sail.rotation.y;
    f.userData.tick(0.016, 1);
    expect(Math.abs(sail.rotation.y - y0)).toBeLessThan(0.05);
  });
});

describe('the crocodile', () => {
  it('lies half under the water, its snout towards the boat (−x), narrower than a lane', () => {
    const c = crocodile();
    const b = box(c);
    expect(b.min.y).toBeLessThan(-0.2);
    expect(b.max.y).toBeGreaterThan(0.1);
    expect(b.max.y).toBeLessThan(0.5); // the ridges of its back
    const size = b.getSize(new THREE.Vector3());
    expect(size.x).toBeGreaterThan(size.z * 3); // long along the course
    expect(size.z).toBeLessThan(riverRun().skin.lanes - 0.4);
    const eye = c.getObjectByName('eye').getWorldPosition(new THREE.Vector3());
    expect(eye.x).toBeLessThan(-1);
    expect(eye.y).toBeGreaterThan(0); // its eyes over the water
    c.userData.tick(0.016, 2);
    expect(box(c).max.y).toBeLessThan(0.5);
  });
});

describe('the buoy', () => {
  it('is dressed by the run: a green lamp on the right buoy, amber on his, dim on the others', () => {
    const b = buoy();
    const lamp = b.userData.lamp.material;
    b.userData.dress('right');
    expect(lamp.color.getHex()).toBe(0x2fe37a);
    expect(b.userData.state).toBe('right');
    b.userData.dress('picked');
    expect(lamp.color.getHex()).toBe(0xfbbf24);
    b.userData.dress('other');
    expect(lamp.emissiveIntensity).toBeLessThan(0.2);
    b.userData.dress('taken'); // the right one he took: it sinks
    for (let k = 0; k < 40; k += 1) b.userData.tick(0.05, k * 0.05);
    expect(b.userData.lamp.parent.visible).toBe(false);
    b.userData.dress('idle'); // the same buoy, the next gate: up again
    b.userData.tick(0.05, 3);
    expect(b.userData.lamp.parent.visible).toBe(true);
    expect(b.userData.state).toBe('idle');
    // the run's numbers are drawn over the buoy at `labelY`: above its lamp
    expect(riverRun().skin.labelY).toBeGreaterThan(box(b).max.y);
    expect(box(b).max.x - box(b).min.x).toBeLessThan(riverRun().skin.lanes - 0.8);
  });
});

describe("riverRun() in the kit's gate run", () => {
  let saved;
  beforeAll(() => {
    saved = globalThis.document;
    globalThis.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  });
  afterAll(() => {
    globalThis.document = saved;
  });
  it('builds the river, the felucca, six buoys and two crocodiles, and sails them', () => {
    const scene = new THREE.Scene();
    const game = {
      scene,
      hero: { pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0 },
      audio: { unlock() {}, startMusic() {}, play() {} },
      input: { clear() {}, take: () => false },
      particles: { burst() {} },
      robot: { cheer() {} },
      canvas: { clientWidth: 1366, clientHeight: 768 },
      camera: new THREE.PerspectiveCamera(55, 1366 / 768, 0.1, 1200),
      state: {},
      set(p) {
        this.state = { ...this.state, ...p };
      },
    };
    const run = new GateRun(game, { x: 0, y: 0.3, z: 0, ...riverRun() });
    run.build();
    const count = (name) => {
      let n = 0;
      scene.traverse((o) => o.name === name && (n += 1));
      return n;
    };
    expect([count('river'), count('felucca'), count('buoy'), count('crocodile')]).toEqual([1, 1, 6, 2]);
    run.open({
      levels: [{ name: 'L', from: '' }],
      gates: 4,
      total: 4,
      round: () => ({ ask: '', options: [{ t: '1' }, { t: '2' }, { t: '3' }], right: 0, why: ['', '', ''] }),
    });
    run.start();
    for (let f = 0; f < 30; f += 1) run.step(0.05);
    expect(game.hero.pos.y).toBeCloseTo(0.3 + run.board.userData.deck, 0);
    expect(game.state.run).toMatchObject({ stage: 'go', bumps: 0 });
    expect([0, 1, 2]).toContain(game.state.run.hazard);
  });
});
