// The world's side of the walkway and of the final mission (walkwayGame.js, installed on DivisorIslesGame): played on a
// stand-in game (no scene). A refused walkway costs no coin and is logged; a paid one stands and the story hears it;
// the mission's posters run out and a new run starts; the story ends on the last island only after the mission.
import { describe, it, expect, vi } from 'vitest';
import { DivisorIslesGame } from './Game';
import { lay } from './walkway';
import { daysFact } from './crews';

const P = DivisorIslesGame.prototype;

function stand(over = {}) {
  const g = Object.create(P);
  Object.assign(g, {
    flags: {},
    log: [],
    built: {},
    convoys: { k1: { purse: 14 } },
    story: { onHold: vi.fn() },
    state: { phase: 'play', stage: 0, overlay: null },
    isl: [{}, {}, {}],
    audio: { play: vi.fn() },
    save: vi.fn(),
    set(patch) {
      this.state = { ...this.state, ...patch };
    },
    input: { clear: vi.fn() },
    markComplete(seg) {
      seg.complete = true;
    },
    refreshObjective: vi.fn(),
    finale: vi.fn(),
    segPoint: () => ({}),
    ...over,
  });
  return g;
}
const SEG = () => ({ id: 'w1', index: 0, kind: 'walkway', crews: [16, 20], ruler: 400, len: 30, convoy: 'k1' });

describe('the walkway on the world', () => {
  it('a refused try is kept and logged, and spends nothing; the paid one stands, sets the gap, and the story hears it', () => {
    const g = stand();
    const seg = SEG();
    expect(P.walkwayPurse.call(g, seg)).toEqual({ of: 14, left: 14 });
    for (const d of [64, 320, 0]) g.walkwayLaid(seg, lay([16, 20], d, 14));
    expect(g.walkwayPurse(seg)).toEqual({ of: 14, left: 14 });
    expect(seg.complete).toBeUndefined();
    expect(g.story.onHold).not.toHaveBeenCalled();
    expect(g.log.map((x) => [x.kind, x.d, x.paid])).toEqual([
      ['walkway', 64, false],
      ['walkway', 320, false],
      ['walkway', 0, false],
    ]);
    const t80 = lay([16, 20], 80, 14);
    g.walkwayLaid(seg, t80);
    expect(seg).toMatchObject({ complete: true, a: 80, cell: 30 / 80, builtWith: 80 });
    expect(g.built.w1).toBe(80);
    expect(g.walkwayPurse(seg)).toEqual({ of: 14, left: 5 });
    expect(g.story.onHold).toHaveBeenCalledWith(g, seg, t80);
    expect(g.flags.walkways.w1.tries).toHaveLength(4);
    expect(g.save).toHaveBeenCalledTimes(4);
    expect(g.audio.play.mock.calls.map((c) => c[0])).toEqual(['crumble', 'fail', 'crumble', 'success']);
  });

  it('a kept try these crews do not make is not trusted; a walkway with no convoy has no purse', () => {
    const g = stand({ flags: { walkways: { w1: { tries: [{ d: 80, holds: false, cost: 3, paid: true }] } } } });
    expect(g.walkwayTries(SEG())).toEqual([]);
    expect(g.walkwayPurse({ ...SEG(), convoy: undefined })).toBe(null);
  });

  it('the post opens the panel only on its own island, while it is to build', () => {
    const g = stand({ T: { walkway: { prompt: '§p' } } });
    const seg = SEG();
    expect(g.walkwayPrompt(seg)).toBe('§p');
    g.openWalkway(seg);
    expect(g.state.overlay).toEqual({ type: 'walkway', seg: 0 });
    g.closeOverlay = function close() {
      this.set({ overlay: null, phase: 'play' });
    };
    g.closeWalkway();
    expect(g.state.overlay).toBe(null);
    seg.complete = true;
    expect(g.walkwayPrompt(seg)).toBe(null);
    g.openWalkway(seg);
    expect(g.state.overlay).toBe(null);
    expect(g.walkwayPrompt({ ...SEG(), index: 1 })).toBe(null);
  });
});

describe('the final mission on the world', () => {
  const C = [8, 17, 20];
  const mission = (over = {}) => ({
    prompt: '§board',
    posters: 3,
    check: ({ day }) => (daysFact(C, Number(day)).kind === 'first' ? 'ok' : `§fact${day}`),
    onSpent: vi.fn(),
    onSolved: vi.fn(),
    ...over,
  });

  it('waits on the last island only, until it is solved', () => {
    const g = stand({ story: { mission: mission() } });
    expect(g.missionOpen()).toBe(false);
    g.state.stage = 2;
    expect(g.missionOpen()).toBe(true);
    g.flags.mission = true;
    expect(g.missionOpen()).toBe(false);
    expect(stand().missionOpen()).toBe(false);
  });

  it('three posters a run: each wrong day spends one and gets its fact; the third ends the run; a new opening refills', () => {
    const g = stand({ story: { mission: mission() } });
    g.state.stage = 2;
    g.openMission();
    expect(g.state.overlay).toEqual({ type: 'mission' });
    expect(g.missionPosters()).toEqual({ of: 3, left: 3 });
    expect(g.missionTry({ day: '2129' })).toEqual({
      ok: false,
      fact: '§fact2129',
      posters: { of: 3, left: 2 },
      over: false,
    });
    expect(g.missionTry({ day: '680' }).posters.left).toBe(1);
    const third = g.missionTry({ day: '41' });
    expect(third).toMatchObject({ over: true, posters: { left: 0 } });
    expect(g.story.mission.onSpent).toHaveBeenCalledTimes(1);
    expect(g.flags.missionRuns).toBe(1);
    g.closeMission();
    expect(g.state.overlay).toBe(null);
    g.openMission();
    expect(g.missionPosters()).toEqual({ of: 3, left: 3 });
    expect(g.flags.missionTries.map((t) => t.values.day)).toEqual(['2129', '680', '41']);
  });

  it('681 solves it: kept, the story hears it, and the story ends', () => {
    const g = stand({ story: { mission: mission() } });
    g.state.stage = 2;
    g.openMission();
    expect(g.missionTry({ day: '681' })).toEqual({ ok: true });
    expect(g.flags.mission).toBe(true);
    expect(g.story.mission.onSolved).toHaveBeenCalledWith(g);
    expect(g.finale).toHaveBeenCalledTimes(1);
    expect(g.state.overlay).toBe(null);
  });

  it('without posters, a wrong try costs nothing but its fact (as in rootCourts)', () => {
    const g = stand({ story: { mission: mission({ posters: undefined }) } });
    g.state.stage = 2;
    expect(g.missionPosters()).toBe(null);
    for (let k = 0; k < 10; k += 1) expect(g.missionTry({ day: '2' })).toEqual({ ok: false, fact: '§fact2' });
  });

  it('arriving on the last island plays the end only once the mission is solved', () => {
    const g = stand({ story: { mission: mission() } });
    Object.assign(g, {
      isl: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
      segs: [{}, {}],
      robot: { setChest: vi.fn() },
      recallOf: () => [],
      convoyTail: () => false,
    });
    g.arrive(2);
    expect(g.finale).not.toHaveBeenCalled();
    g.flags.mission = true;
    g.arrive(2);
    expect(g.finale).toHaveBeenCalledTimes(1);
    const plain = stand({ story: {} });
    Object.assign(plain, { isl: g.isl, segs: g.segs, robot: g.robot, recallOf: () => [], convoyTail: () => false });
    plain.arrive(2);
    expect(plain.finale).toHaveBeenCalledTimes(1);
  });
});

describe('the plaque — a final mission on an island before the last (lesson 3 `fraction-irreductible`)', () => {
  const WRITE = { calc: { x: 3, y: 34, op: '*', z: 85, w: 87 }, p: 5, q: 58 };
  const plaque = (over = {}) => ({
    prompt: '§plaque',
    at: 1,
    opens: 'jetty',
    plaques: 2,
    refill: { at: 0 },
    write: WRITE,
    jetty: { lanterns: 174, lit: 170, red: 15 },
    objective: (g) => (g.missionWalkBack() ? '§walkBack' : '§engrave'),
    check: vi.fn((values, w) => (w.kind === 'ok' ? 'ok' : `§${w.kind}`)),
    onSolved: vi.fn(),
    ...over,
  });
  const world = (m = plaque()) => {
    const jetty = { id: 'jetty', standing: true, len: 12, complete: true, builtLen: 12.7, deck: { visible: true } };
    const g = stand({ story: { mission: m }, segs: [{ id: 'dash', kind: 'rail', complete: true }, jetty] });
    g.segPoint = () => ({ x: 0, y: 0, z: 0 });
    g.state.stage = 1;
    g.hero = { island: 1 };
    return { g, jetty };
  };

  it('its road stays shut, lanterns dark, until it is solved; the board waits on its own island', () => {
    const { g, jetty } = world();
    g.shutMissionRoad();
    expect(jetty).toMatchObject({ complete: false, builtLen: 0, deck: { visible: false } });
    expect(jetty.lanterns).toHaveLength(174);
    expect(g.missionAt()).toBe(1);
    expect(g.missionOpen()).toBe(true);
    g.state.stage = 2;
    expect(g.missionOpen()).toBe(false);
    // a road that is not a standing bridge cannot be the mission's
    const bad = world();
    bad.jetty.standing = false;
    expect(() => bad.g.shutMissionRoad()).toThrow(/standing bridge/);
  });

  it('the story’s check gets what the fraction IS; an empty box spends no plaque; two refused plaques end the run', () => {
    const { g } = world();
    g.shutMissionRoad();
    expect(g.missionPosters()).toEqual({ of: 2, left: 2 });
    expect(g.missionTry({ p: '', q: '58' })).toMatchObject({ ok: false, fact: '§empty', posters: { left: 2 } });
    expect(g.missionTry({ p: '85', q: '986' })).toMatchObject({
      fact: '§notReduced',
      posters: { of: 2, left: 1 },
      over: false,
    });
    expect(g.story.mission.check).toHaveBeenLastCalledWith(
      { p: '85', q: '986' },
      { kind: 'notReduced', P: 85, Q: 986 },
    );
    expect(g.missionTry({ p: '88', q: '121' })).toMatchObject({ fact: '§other', over: true, posters: { left: 0 } });
    expect(g.flags.missionRuns).toBe(1);
  });

  it('the walk back: the board stays shut until he stands on the island `refill.at`; then two new plaques', () => {
    const { g } = world();
    g.shutMissionRoad();
    g.missionTry({ p: '85', q: '986' });
    g.missionTry({ p: '15', q: '174' });
    expect(g.missionOpen()).toBe(false);
    expect(g.missionWalkBack()).toBe(true);
    expect(g.missionObjective()).toBe('§walkBack');
    g.openMission();
    expect(g.state.overlay).toBe(null);
    g.stepMission(0, 'play'); // still on the plaque's island: nothing
    expect(g.missionWalkBack()).toBe(true);
    g.hero.island = 0;
    g.stepMission(0, 'play');
    expect(g.missionWalkBack()).toBe(false);
    expect(g.missionPosters()).toEqual({ of: 2, left: 2 });
    expect(g.missionOpen()).toBe(true);
    expect(g.missionObjective()).toBe('§engrave');
  });

  it('the rail of the dash is walkable once ridden — only when the mission sends him back over it', () => {
    const { g } = world();
    const rail = { kind: 'rail', complete: true };
    expect(g.walkableSeg(rail)).toBe(true);
    expect(g.walkableSeg({ kind: 'rail', complete: false })).toBe(false);
    const plain = stand({ story: {} });
    expect(plain.walkableSeg(rail)).toBe(false);
    expect(plain.walkableSeg({ kind: 'bridge' })).toBe(true);
  });

  it('5/58 solves it: the road stands, 170 lanterns lit of 174 (15 red), and no end yet — he crosses to the last island', () => {
    const { g, jetty } = world();
    g.shutMissionRoad();
    expect(g.missionTry({ p: '5', q: '58' })).toEqual({ ok: true });
    expect(jetty.complete).toBe(true);
    expect(jetty.deck.visible).toBe(true);
    const mats = jetty.lanterns.map((m) => m.material);
    const lit = mats.filter((x) => x !== mats[173]);
    expect(lit).toHaveLength(170);
    expect(new Set(lit).size).toBe(2);
    const red = lit.filter((x) => x.color.getHex() === 0xff4d4d);
    expect(red).toHaveLength(15);
    expect(g.finale).not.toHaveBeenCalled();
    expect(g.story.mission.onSolved).toHaveBeenCalledWith(g);
    // a save made after it: the road stands again, lit
    const again = world();
    again.g.flags.mission = true;
    again.g.shutMissionRoad();
    expect(again.jetty.complete).toBe(true);
  });

  it('a plaque whose p/q is not the product’s irreducible form is refused at build', () => {
    const { g } = world(plaque({ write: { ...WRITE, p: 85, q: 986 } }));
    const isl = { group: { add: () => {} }, x: 0, z: 0 };
    Object.assign(g, { colliders: [], addInteract: () => ({}) });
    expect(() => g.buildMissionBoard(isl, () => ({ x: 0, z: 0 }), [])).toThrow(/is not 5\/58/);
  });
});
