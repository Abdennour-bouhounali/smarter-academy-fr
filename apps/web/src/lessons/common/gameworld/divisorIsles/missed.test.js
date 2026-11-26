// A try that does not hold tells the story too (`Game.js › forge` → `missed` → `story.onMiss`): the three ways a plank
// fails on a bridge — cells left open, the post of a marked stretch off a joint, the purse empty — each call the story's
// optional hook once, with the bridge and the plank, after the world has said what happened; a plank that holds does not
// (it calls `onHold`), and a story without the hook plays as before. Played on a stand-in game (no scene).
import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { DivisorIslesGame } from './Game';

const P = DivisorIslesGame.prototype;
const v3 = () => new THREE.Vector3();
const obj = () => ({
  position: v3(),
  scale: { setScalar() {}, z: 1 },
  userData: { setText() {}, home: v3() },
  visible: false,
});

function stand(story, purse = null) {
  const g = Object.create(P);
  Object.assign(g, {
    story,
    flags: {},
    log: [],
    built: {},
    markSigns: {},
    state: { phase: 'play', stage: 1, keys: [], stars: {} },
    T: {
      say: {
        markMiss: () => 'post',
        gap: () => 'gap',
        gapShort: () => 'gap',
        tooLong: () => 'long',
        purseOut: () => 'purse',
        ok: () => 'ok',
      },
    },
    audio: { play() {} },
    robot: { setChest() {}, cheer() {} },
    particles: { burst() {} },
    input: { clear() {} },
    said: [],
    say(x) {
      this.said.push(x);
    },
    set(patch) {
      this.state = { ...this.state, ...patch };
    },
    save() {},
    refreshObjective() {},
    wait: async () => {},
    tween: async () => {},
    crumble: async () => {},
    clearPlanks() {},
    plankMesh: () => ({ ...obj(), material: {} }),
    segPoint: () => v3(),
    convoyTail: () => false,
    purseOf: () => purse,
    markComplete(seg) {
      seg.complete = true;
    },
  });
  return g;
}
const bridge = (over = {}) => ({
  id: 'm78',
  a: 78,
  mark: 69,
  len: 12,
  rx: 0,
  rz: 1,
  dx: 1,
  dz: 0,
  cell: 0.1,
  planks: [],
  stat: { fails: 0 },
  altarWorld: v3(),
  group: { add() {}, remove() {} },
  count: obj(),
  gap: obj(),
  ...over,
});

describe('a try that does not hold calls the story’s `onMiss`', () => {
  it('the post off a joint (13 on 69 of 78), cells left open (5 on 78), the purse empty: once each, after the world spoke', async () => {
    const story = { onMiss: vi.fn(), onHold: vi.fn() };
    const g = stand(story);
    const seg = bridge();
    await P.forge.call(g, seg, 13, null);
    expect(story.onMiss).toHaveBeenLastCalledWith(g, seg, 13);
    expect(g.said.at(-1)).toBe('post');
    await P.forge.call(g, seg, 5, null);
    expect(story.onMiss).toHaveBeenLastCalledWith(g, seg, 5);
    const poor = stand(story, { of: 3, left: 3 });
    await P.forge.call(poor, seg, 2, null);
    expect(story.onMiss).toHaveBeenLastCalledWith(poor, seg, 2);
    expect(poor.said.at(-1)).toBe('purse');
    expect(story.onMiss).toHaveBeenCalledTimes(3);
    expect(story.onHold).not.toHaveBeenCalled();
    // every try is in the log the hook reads: the gap, then the marked stretch
    expect(g.log.map((x) => [x.a, x.b])).toEqual([
      [78, 13],
      [69, 13],
      [78, 5],
      [69, 5],
    ]);
  });

  it('a plank that holds calls `onHold`, not `onMiss`; a story without the hook plays as before', async () => {
    const story = { onMiss: vi.fn(), onHold: vi.fn(() => true) };
    const g = stand(story);
    const seg = bridge();
    await P.forge.call(g, seg, 3, null);
    expect(story.onHold).toHaveBeenCalledWith(g, seg, 3, 26);
    expect(story.onMiss).not.toHaveBeenCalled();
    const plain = stand({});
    await expect(P.forge.call(plain, bridge(), 13, null)).resolves.toBeUndefined();
  });
});
