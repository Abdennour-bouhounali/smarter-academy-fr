// THE STORY of fraction-irreductible: the shared checks (authoring kit), then what is this road's own — the bridges that
// hold only the planks the design says, the mirrors that stay shut until the planks were fired, the WHOLE instruction of
// every step, the card on the right, the plaque (`story.mission`) and the dash.
import { describe, it, expect } from 'vitest';
import {
  describeStory,
  holdsOn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { writingOf } from '../../../../../../common/gameworld/divisorIsles/plaque';
import { NUMBERS, gcd, markVerdict, signChain } from './math';
import { K, MODULE_KEYS, STORY, TABLETS, didOf } from './story';
import { KEYS } from './journey';

const ID = 'fraction-irreductible';
const T = STORY.text;
const { strike: ST, stays: SY, pgcd: PG, result: RS, mission: MI } = NUMBERS;
const [S1, S2, S3, S4] = STORY.segments;

/** A game the story's hooks read: the segments, the keys held, the world's log, the signs, and the world's commands. */
function fake({ stage = 0, keys = [], held = null, log = [], signs = {}, done = [] } = {}) {
  const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: done.includes(index), builtWith: null }));
  const opened = [];
  const said = [];
  const modules = [];
  return {
    T,
    state: { stage, keys: [...keys], held },
    segs,
    isl: STORY.islands,
    flags: {},
    log,
    markSigns: signs,
    opened,
    said,
    modules,
    purseOf: () => ({ of: PG.purse, left: PG.purse }),
    openForge: (k) => opened.push(k),
    say: (s) => said.push(s),
    onModule: (m) => modules.push(m),
    refreshed: 0,
    refreshObjective() {
      this.refreshed += 1;
    },
    take(b) {
      this.state.held = b;
    },
    save() {},
    missionWalkBack: () => false,
  };
}
const tried = (a, ps) => ps.map((b) => ({ a, b }));

// the plaque is `story.mission`, which the shared `describeStory` does not know yet: it sees the road without it
describeStory({
  id: ID,
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  dashMax: 700,
  pairs: [
    [ST.gap, ST.mark],
    [SY.gap, SY.mark],
    [PG.gap, PG.mark],
    [RS.gap, RS.strokes[0] + RS.strokes[1]],
  ],
  notInBank: [ST.gap, PG.gap],
  sentences: [
    T.say.firstWriting('\\dfrac{138}{246} = \\dfrac{69}{123}'),
    T.say.holdShop(PG.gap, PG.plank, 46, '\\dfrac{722}{1\\,786} = \\dfrac{19}{47}'),
    T.say.holdShop(PG.gap, PG.plank, 0, '\\dfrac{722}{1\\,786}'),
    T.objective.carry(S3, 38, PG.purse),
    T.objective.make(S3, PG.purse),
    T.objective.carry(S4, 3, null),
    T.recall.plank(3, 'holds'),
    T.recall.plank(2, 'post'),
    T.recall.plank(1, 'coins'),
    T.recall.plank(5, 'open'),
    STORY.mission.text.plaques(2, 2),
    STORY.mission.text.plaques(1, 2),
    STORY.mission.text.plaques(0, 2),
  ],
  before: {
    [K.strike]: {
      words: /simplifi|barr|commun|PGCD|irréductible/i,
      lines: [T.say.hello, T.objective.pickA, T.objective.carry(S1, 2, null), T.say.backA],
    },
    [K.stays]: {
      words: /aucun facteur|premiers entre eux|irréductible|PGCD/i,
      lines: [T.say.stays, T.objective.pickB, T.objective.carry(S2, 13, null), T.say.backB, T.objective.backB],
    },
    [K.pgcd]: {
      words: /une seule étape|dernier reste|PGCD|irréductible/i,
      lines: [T.say.pgcd, T.objective.make(S3, PG.purse), T.objective.carry(S3, 38, PG.purse)],
    },
    [K.result]: {
      words: /vérifie le résultat|irréductible|PGCD/i,
      lines: [T.say.result, T.objective.pickD, T.objective.carry(S4, 3, null), T.say.backD, T.objective.backD],
    },
  },
});

describe(`${ID} — its own road`, () => {
  it('the bridges hold exactly the planks the design says, and the keys are in the order of the road', () => {
    expect(KEYS).toEqual(['simplifier-facteurs', 'irreductible', 'diviser-par-le-pgcd', 'resultat-irreductible']);
    const holders = (seg, planks) => planks.filter((b) => holdsOn(seg, b));
    expect(holders(S1, ST.moulds)).toEqual(ST.holders);
    expect(holders(S2, SY.moulds)).toEqual([1]);
    expect(holders(S4, RS.moulds)).toEqual([3]);
    // 5 and 7 do not fill 246 — 246 = 5 × 49 + 1 = 7 × 35 + 1
    expect(markVerdict(246, 138, 5)).toMatchObject({ q: 49, r: 1, fills: false });
    expect(markVerdict(246, 138, 7)).toMatchObject({ q: 35, r: 1, fills: false });
    // 2 and 3 fill 96 and miss the post (65 = 2 × 32 + 1 = 3 × 21 + 2); 5 and 13 do not fill it
    expect(markVerdict(96, 65, 2)).toMatchObject({ fills: true, joint: false, mark: { q: 32, r: 1 } });
    expect(markVerdict(96, 65, 3)).toMatchObject({ fills: true, joint: false, mark: { q: 21, r: 2 } });
    expect(markVerdict(96, 65, 5).fills).toBe(false);
    expect(markVerdict(96, 65, 13).fills).toBe(false);
    // 13 puts a joint at the end of the first stroke and misses the post; 2 and 6 fill 78 and miss it
    expect(markVerdict(78, 69, 13)).toMatchObject({ fills: true, joint: false, mark: { q: 5, r: 4 } });
    expect(markVerdict(78, 69, 2).joint).toBe(false);
    expect(markVerdict(78, 69, 6).joint).toBe(false);
    expect(signChain(246, 138, [2, 3])).toEqual([
      [138, 246],
      [69, 123],
      [46, 82],
    ]);
    expect(gcd(138, 246)).toBe(6);
    expect(S4.strokes).toEqual([65, 4]);
    expect(S4.mark).toBe(69);
  });

  it('the notebook bridge: only 38 builds it with the purse; 19 is ONE coin short; 2 and 1 are far too dear', () => {
    const cost = (b) => PG.gap / b;
    const holding = Array.from({ length: PG.gap }, (_, i) => i + 1).filter((b) => holdsOn(S3, b));
    expect(holding).toEqual([1, 2, 19, 38]);
    expect(holding.filter((b) => cost(b) <= PG.purse)).toEqual([38]);
    expect(cost(38)).toBe(47);
    expect(PG.purse - cost(38)).toBe(46);
    expect(cost(19) - PG.purse).toBe(1);
    expect(S3.workshop).toMatchObject({ min: 1, max: PG.gap, typed: true, open: true });
    expect(STORY.islands[2].feature).toBe('anvil');
    expect(STORY.convoys.carnet.purse).toBe(93);
  });

  it('a mirror opens only when its planks were fired: the sign of A, then 2, 3, 5, 13, then 13 and 3', () => {
    // K1: the sign of A holds one writing, then both
    let g = fake({ stage: 1, signs: { [S1.id]: [2] } });
    STORY.onArrive(g, 1);
    expect(g.opened).toEqual([]);
    expect(g.said.at(-1)).toBe(T.say.backA);
    g = fake({ stage: 1, signs: { [S1.id]: [2, 3] } });
    STORY.onArrive(g, 1);
    expect(g.opened).toEqual([K.strike]);
    // K2: three planks fired is not enough, four are
    g = fake({ stage: 2, keys: [K.strike], log: tried(96, [1, 2, 3]) });
    STORY.onArrive(g, 2);
    expect(g.opened).toEqual([]);
    expect(g.said.at(-1)).toBe(T.say.backB);
    g = fake({ stage: 2, keys: [K.strike], log: tried(96, [1, 2, 3, 5, 13]) });
    STORY.onArrive(g, 2);
    expect(g.opened).toEqual([K.stays]);
    expect(STORY.pendingForge(g)).toBe(K.stays);
    // K3 needs nothing; K4: 13 and 3 both
    g = fake({ stage: 3, keys: [K.strike, K.stays] });
    STORY.onArrive(g, 3);
    expect(g.opened).toEqual([K.pgcd]);
    g = fake({ stage: 4, keys: [K.strike, K.stays, K.pgcd], log: tried(78, [13]) });
    STORY.onArrive(g, 4);
    expect(g.opened).toEqual([]);
    g = fake({ stage: 4, keys: [K.strike, K.stays, K.pgcd], log: tried(78, [13, 3]) });
    STORY.onArrive(g, 4);
    expect(g.opened).toEqual([K.result]);
    // a mirror's tries are not his: a log of the mirror's own planks opens nothing
    g = fake({ stage: 2, keys: [K.strike], log: tried(96, [2, 3, 5, 13]).map((x) => ({ ...x, mirror: true })) });
    STORY.onArrive(g, 2);
    expect(g.opened).toEqual([]);
  });

  it('the instruction says the whole step: the bridge, the planks, the purse, and the way back while a mirror waits', () => {
    const o = T.objective;
    const fresh = fake();
    expect(STORY.objective(fresh, fresh.segs[0])).toBe(o.pickA);
    const holding = fake({ held: 2 });
    expect(STORY.objective(holding, holding.segs[0])).toBe(o.carry(S1, 2, null));
    const done = fake({ done: [0], signs: { [S1.id]: [2] } });
    expect(STORY.objective(done, done.segs[0])).toBe(o.other('\\dfrac{138}{246} = \\dfrac{69}{123}'));
    const both = fake({ done: [0], signs: { [S1.id]: [2, 3] } });
    expect(STORY.objective(both, both.segs[0])).toContain('\\dfrac{46}{82}');
    // B: the way back while A's sign holds one writing; the way back from C while B's planks were not fired
    const back = fake({ done: [0], stage: 1, signs: { [S1.id]: [2] } });
    expect(STORY.objective(back, back.segs[1])).toBe(o.backA);
    const c = fake({ done: [0, 1], stage: 2, keys: [K.strike] });
    expect(STORY.objective(c, c.segs[2])).toBe(o.backB);
    const ok = fake({ done: [0, 1], stage: 2, keys: [K.strike], log: tried(96, [2, 3, 5, 13]) });
    expect(STORY.objective(ok, ok.segs[2])).toBe(o.make(S3, PG.purse));
    // the rail: the way back to D while 13 and 3 were not fired
    const rail = fake({ done: [0, 1, 2, 3], stage: 4, keys: [K.strike, K.stays, K.pgcd] });
    expect(STORY.objective(rail, rail.segs[4])).toBe(o.backD);
    // the plaque's road: the plaque instruction while shut, the crossing once solved
    const road = fake({ stage: 5 });
    expect(STORY.objective(road, road.segs[5])).toBe(o.plaque);
    road.missionWalkBack = () => true;
    expect(STORY.objective(road, road.segs[5])).toBe(o.plaqueBack);
    road.flags.mission = true;
    expect(STORY.objective(road, road.segs[5])).toBe(o.plaqueCross);
  });

  it('the card on the right: the sign of the bridge just crossed and what his last planks did there', () => {
    const g = fake({ stage: 2, signs: { [S2.id]: [1] }, log: tried(96, [13, 2, 1]) });
    const lines = STORY.recall(g, 2);
    expect(lines[0]).toBe(T.recall.sign('\\dfrac{65}{96}'));
    expect(lines).toHaveLength(3);
    expect(didOf(S2, 13)).toBe('open');
    expect(didOf(S2, 2)).toBe('post');
    expect(didOf(S2, 1)).toBe('holds');
    expect(didOf(S3, 19, PG.purse)).toBe('coins');
    expect(STORY.recall(fake({ stage: 1 }), 1)).toHaveLength(1);
  });

  it('the modules: each key completes its own; the plaque solved marks the problem module', () => {
    expect(MODULE_KEYS).toEqual({
      1: [K.strike],
      2: [K.stays],
      3: [K.pgcd],
      4: [K.result],
      5: [...KEYS],
    });
    const g = fake({ keys: [] });
    STORY.afterKey[K.strike](g);
    expect(g.modules).toEqual(['1']);
    const h = fake({ keys: [K.strike, K.stays, K.pgcd] });
    STORY.afterKey[K.result](h);
    expect(h.modules).toEqual(['4']);
    expect(h.flags.key4).toBe(true);
    STORY.mission.onSolved(h);
    expect(h.modules).toEqual(['4', '5']);
  });

  it('after a key forged behind him, the island behind’s planks leave his hands and the instruction is written again', () => {
    // 2026-11-26 walk: K2 opened on B by the last miss (5); his stage was already C, so nothing dropped the 5 nor said the
    // step — on C the instruction still read « Retourne à B » and the workshop saw a plank in hand
    for (const [key, keys, held] of [
      [K.strike, [K.strike], 3],
      [K.stays, [K.strike, K.stays], 5],
      [K.result, [K.strike, K.stays, K.pgcd, K.result], 3],
    ]) {
      const g = fake({ stage: 2, keys, held, log: tried(96, [1, 2, 3, 5, 13]) });
      STORY.afterKey[key](g);
      expect(g.state.held).toBeNull();
      expect(g.refreshed).toBeGreaterThan(0);
    }
    // on C with K2 held and nothing in hand, the instruction is the workshop's — never the way back to B
    const c = fake({ done: [0, 1], stage: 2, keys: [K.strike, K.stays] });
    expect(STORY.objective(c, c.segs[2])).toBe(T.objective.make(S3, PG.purse));
    expect(STORY.objective(c, c.segs[2]).replace(/\s/g, '')).toContain(String(PG.gap));
  });

  it('the plaque: the exact shape the world reads, a refusal that never gives a number, the right writing accepted', () => {
    const M = STORY.mission;
    expect(M).toMatchObject({
      at: 5,
      opens: 'jetee',
      plaques: 2,
      refill: { at: 4 },
      write: { calc: { x: 3, y: 34, op: '*', z: 85, w: 87 }, p: 5, q: 58 },
      jetty: { lanterns: 174, lit: 170, red: 15 },
    });
    expect(STORY.segments[M.at].id).toBe('jetee');
    expect(STORY.segments.find((s) => s.id === M.opens)).toMatchObject({ kind: 'bridge', standing: true, a: 0 });
    expect(STORY.islands[M.at].id).toBe('F');
    expect(STORY.islands[M.refill.at].id).toBe('E');
    expect(MI.calc).toEqual(M.write.calc);
    expect(M.lead.join(' ')).toContain('\\times');
    const say = (v) => M.check(v, writingOf(M.write, v));
    expect(say({ p: '5', q: '58' })).toBe('ok');
    const refusals = [
      say({ p: '255', q: '2958' }),
      say({ p: '85', q: '986' }),
      say({ p: '15', q: '174' }),
      say({ p: '88', q: '121' }),
      say({ p: '', q: '' }),
    ];
    for (const r of refusals) {
      expect(r).not.toBe('ok');
      expect(r, r).not.toMatch(/\d/);
      expect(typographyErrors(r), r).toEqual([]);
    }
    expect(say({ p: '85', q: '986' })).toBe(say({ p: '255', q: '2958' }));
    expect(say({ p: '88', q: '121' })).toBe(M.check({}, { kind: 'other' }));
    expect(M.text.spent).toContain(STORY.islands[4].name);
    // the jetty: 174 lanterns, 170 lit, 15 red = 5/58, and 17 hides in none of them
    expect((174 * 85) / 87).toBe(170);
    expect((170 * 3) / 34).toBe(15);
    for (const x of [174, 15]) expect(x % 17).not.toBe(0);
  });

  it('the dash: six waves, one right gate each, the wrong ones false', () => {
    expect(STORY.dashWaves).toHaveLength(6);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test)).toHaveLength(1);
      for (const g of w.gates.filter((x) => !w.test(x))) expect(w.why.wrong[g], `${w.say} ← ${g}`).toBeTruthy();
    }
    const [w1, w2, w3, w4, w5, w6] = STORY.dashWaves;
    expect(w1.gates.find(w1.test)).toBe(46);
    expect(gcd(39, w2.gates.find(w2.test))).toBe(1);
    expect(w3.gates.find(w3.test)).toBe(289 / gcd(289, 663));
    expect(w4.gates.find(w4.test)).toBe((2 ** 3 * 13 ** 2) / (2 ** 2 * 13));
    expect(w5.gates.find(w5.test)).toBe(460 / gcd(170, 460));
    expect(w6.gates.find(w6.test)).toBe(319 / gcd(319, 551));
  });
});
