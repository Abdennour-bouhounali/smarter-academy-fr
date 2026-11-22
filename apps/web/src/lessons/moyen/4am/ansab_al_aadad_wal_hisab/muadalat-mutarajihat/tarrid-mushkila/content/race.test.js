import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS, FREE, R1, R2, R3, CHALLENGE, P1, PREDICT } from './race.js';
import { violations } from './forbidden.js';
import * as G from '../../../../../../common/manipulations/logic/growthRace.js';
import * as P from '../../../../../../common/manipulations/logic/growthRacePlayer.js';
import {
  emptyLog, logEvent, roundWon, starsFor, easierProps, needsHelp,
} from '../../../../../../common/manipulations/rounds/roundsModel.js';

const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const propsList = () => {
  const out = [];
  ALL.forEach((r) => { if (r.props.left) out.push([r.id, r.props]); if (r.easier) out.push([`${r.id}-easy`, easierProps(r)]); });
  FREE.forEach((c) => { const [left, right, maxX] = c.split('|'); out.push([`free ${c}`, { left, right, maxX: Number(maxX) }]); });
  return out;
};

describe('the rounds of tarrid-mushkila — numbers recomputed by the lab\'s own logic', () => {
  const sol = (p) => G.solution(G.parseModel(p.left, p.right));
  it('solutions: r1 5, r2 6, r3 4, star 3, module 2 −3', () => {
    expect(sol(R1).x).toMatchObject({ n: 5, d: 1 });
    expect([R1, R2, R3, CHALLENGE, P1].map((p) => G.toNumber(sol(p).x))).toEqual([5, 6, 4, 3, -3]);
    expect(sol(P1).kind).toBe('negative');
  });
  it('the equation of each round, as the lab writes it', () => {
    expect(G.solvingLines(G.parseModel(R1.left, R1.right)).lines[0]).toBe('x + 52 = 4x + 37'.replace('x + 52', '52 + x'));
    expect(G.solvingLines(G.parseModel(P1.left, P1.right)).lines.slice(0, 2)).toEqual(['2x + 24 = 18', '2x = -6']);
  });
  it('the meeting is a real equality on the ruler and the readouts check', () => {
    [R1, R2, R3, CHALLENGE].forEach((p) => {
      const m = G.parseModel(p.left, p.right);
      expect(G.trialAt(m, G.toNumber(G.solution(m).x)).rel).toBe('=');
    });
    // r1: 57 = 12 + 13 + 15 + 17 ; r3: 17 + 14 = 31 ; module 2, three years ago: 8 + 10 = 18
    expect(G.toNumber(G.trialAt(G.parseModel(R1.left, R1.right), 5).left)).toBe(57);
    expect(P.pastSpec(G.parseModel(P1.left, P1.right))).toMatchObject({ n: 3, ages: [8, 10], target: 18, decoy: 14 });
  });
  it('the easier rounds are really smaller and have their own solutions', () => {
    const e = ALL.filter((r) => r.easier).map((r) => easierProps(r));
    expect(e.map((p) => G.toNumber(sol(p).x))).toEqual([3, 3, 3, -1]);
  });
});

describe('the role scan — nothing the climax uses, in its role, is on any screen before it', () => {
  it('dry-run: every value every round, practice round and free chip can show is clean', () => {
    const all = [];
    propsList().forEach(([id, p]) => { const sv = P.shownValues(p); sv.forEach((s) => all.push(s)); expect(violations(sv, id), id).toEqual([]); });
    expect(all.length).toBeGreaterThan(500);
  });
  it('negative controls: the scan catches the climax itself', () => {
    expect(violations(P.shownValues({ left: '44+x', right: '5+x+9+x+16+x', maxX: 8 }), 'climax').length).toBeGreaterThan(3);
    expect(violations(P.shownValues({ left: '44+x', right: '3(16+x)', maxX: 8 }), 'climax2').length).toBeGreaterThan(0);
    expect(violations([{ role: 'screen', ages: [{ side: 'right', v: 5 }, { side: 'right', v: 9 }] }])).toHaveLength(1);
    expect(violations([{ role: 'screen', ages: [{ side: 'left', v: 42 }, { side: 'right', v: 14 }] }])).toHaveLength(1);
    expect(violations([{ role: 'solution', v: '-2' }, { role: 'first', v: '8' }])).toHaveLength(2);
  });
  it('no round is one person against the sum of exactly three, nor a factor 3', () => {
    propsList().forEach(([id, p]) => expect(P.structureOf(G.parseModel(p.left, p.right)), id).toBe('ok'));
  });
});

describe('builds: one decoy, never a copy of another number on the screen', () => {
  it('the equation tiles come from the model', () => {
    expect(P.buildSpec(G.parseModel(R1.left, R1.right))).toMatchObject({ expected: ['52 + x', '4x', '37'], decoy: 'x' });
    expect(P.buildSpec(G.parseModel(R2.left, R2.right))).toMatchObject({ expected: ['26 + x', '4x', '8'], decoy: 'x' });
    expect(P.buildSpec(G.parseModel(R3.left, R3.right))).toMatchObject({ expected: ['13 + x', '10 + x', '31'], decoy: '31 + x' });
  });
  it('each right answer is true: the sides are equal at the solution', () => {
    const m = G.parseModel(R1.left, R1.right);
    const s = P.buildSpec(m);
    expect(s.expected[1]).toBe(`${G.toNumber(G.storyLin(m, 'right').a)}x`);
    s.tiles.forEach((t) => expect(s.tiles.filter((u) => u === t)).toHaveLength(1));
    expect(s.tiles).toContain(s.decoy);
  });
});

describe('predictions: calculated, their answers differ, the right place varies', () => {
  it('r2: two cards, the multiple ahead at the end of the ruler', () => {
    const m = G.parseModel(R2.left, R2.right); const range = G.xRange(m, R2.maxX);
    expect(P.predictTruth(m, 'cards', range)).toBe(2);
    expect(P.predictTruth(m, 'ahead', range)).toBe('right');
    expect(P.predictOptions(m, 'cards', 0)).toHaveLength(3);
    expect(P.predictOptions(m, 'cards', 0)[0]).not.toBe(P.predictOptions(m, 'cards', 1)[0]);
  });
  it('r3 and module 2', () => {
    const m3 = G.parseModel(R3.left, R3.right);
    expect(P.predictTruth(m3, 'cards', G.xRange(m3, R3.maxX))).toBe(2);
    const mp = G.parseModel(P1.left, P1.right);
    expect(P.predictTruth(mp, 'meets', G.xRange(mp, P1.maxX))).toBe('no');
    expect(PREDICT.r2.map((p) => p.kind)).toEqual(['cards', 'ahead']);
  });
});

describe('every required round can be won to three stars', () => {
  const play = (round, props) => {
    const m = G.parseModel(props.left, props.right);
    const s = G.toNumber(G.solution(m).x);
    let log = emptyLog();
    const ev = (kind, e) => { log = logEvent(log, kind, e); };
    (round.predict ?? props.predict ?? []).forEach(() => ev('trial', { tk: 'predict', ok: true }));
    ev('trial', { tk: 'model', ok: true, key: 'a' });
    const xs = s >= 1 ? [s - 1, s, s + 1] : [0, 1, 2];
    xs.forEach((x) => ev('verdict', { groups: x, exact: G.trialAt(m, x).rel === '=' }));
    ev('trial', { tk: 'discovered' });
    ['build', 'race'].forEach((id) => ev('trial', { tk: 'checkpoint-done', id }));
    return log;
  };
  it.each(ALL.filter((r) => r.props.left && !r.free))('%s', (r) => {
    const log = play(r, r.props);
    expect(roundWon(r, log)).toBe(true);
    expect(starsFor(r, log)).toBe(3);
  });
  it('two refused models open the help card on r1', () => {
    const r = M1_ROUNDS[0];
    let log = emptyLog();
    log = logEvent(log, 'trial', { tk: 'model', ok: false, key: 'a', free: true });
    expect(needsHelp(r, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'model', ok: false, key: 'b' });
    log = logEvent(log, 'trial', { tk: 'model', ok: false, key: 'c' });
    expect(needsHelp(r, log)).toBe(true);
  });
});
