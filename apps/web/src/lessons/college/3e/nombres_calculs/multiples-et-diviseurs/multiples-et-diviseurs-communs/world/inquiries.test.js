// THE EXPERIMENTS of multiples-et-diviseurs-communs: the shared checks (authoring kit) — no two keys share a (kind, mode),
// no sentence names a key or states its rule — over EVERY sentence each experiment and the bench can say on its own
// numbers, then what is this lesson's own: the specs play on the world's logic, the chips are translation errors only,
// no fact writes a result, the sheet keeps its state, and no sentence holds both « PGCD » and « produit » (lesson 5's).
import { describe, it, expect } from 'vitest';
import {
  describeExperiments,
  said,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lay } from '../../../../../../common/gameworld/divisorIsles/walkway';
import { allButOne, daysNow, initDays, mapJudge } from '../../../../../../common/gameworld/divisorIsles/crews';
import { sheetOf, zerosOf } from '../../../../../../common/gameworld/divisorIsles/sheet';
import { primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { DAYS_INQUIRY, SHEET_BENCH, STORY_INQUIRY } from './inquiries';
import { NUMBERS, lcm } from './math';
import { K } from './story';

const { factors: FC, story: ST } = NUMBERS;

// ───────────────────────── every sentence each spec can say ─────────────────────────

/** Every number a sheet can show: n and its quotients by its primes. */
const sheetsOf = (n) => {
  const out = new Set([n]);
  for (let changed = true; changed; ) {
    changed = false;
    for (const x of [...out])
      for (const p of primeFactors(x))
        if (x / p > 1 && !out.has(x / p)) {
          out.add(x / p);
          changed = true;
        }
  }
  return [...out];
};
/** What the bench's card keeps, along the two rounds: one round half-way, one finished, both. */
const keptAlong = () => {
  const [a, b] = FC.crews;
  const done = (n) => ({ n, factors: primeFactors(n) });
  return [
    SHEET_BENCH.text.kept({ rounds: [], ri: 0, stage: 'ask', factors: [2], n: a / 2 }),
    SHEET_BENCH.text.kept({ rounds: [done(a)], ri: 1, stage: 'ask', factors: [2, 2], n: b / 4 }),
    SHEET_BENCH.text.kept({ rounds: [done(a), done(b)], ri: 1, stage: 'seen', factors: [], n: 1 }),
  ];
};
function sheetLines(spec) {
  const T = spec.text;
  const out = [T.primeHead, T.prime, T.notebook, T.next, T.done];
  for (const { n } of spec.rounds) {
    out.push(T.lead(n), T.goal(n));
    const factors = primeFactors(n);
    out.push(T.end({ n, factors, attempts: [] }), T.foundLine({ n, factors, attempts: [] }));
    for (const x of sheetsOf(n)) {
      const lines = sheetOf(x, spec.stop);
      const zeros = zerosOf(lines);
      out.push(T.ask({ n: x, lines: lines.length }));
      if (zeros.length) out.push(T.notPrime({ n: x, zeros }), T.notPrime({ n: x, zeros: zeros.slice(0, 1) }));
      for (const l of lines) {
        const a = { type: 'line', before: x, p: l.p, r: l.r, held: l.r === 0, after: l.r ? x : x / l.p };
        out.push(a.held ? T.held(a) : T.miss(a));
      }
    }
  }
  return [...out, ...keptAlong().flat()];
}

/** The pillars a story can lay on its ruler, with any crews of its chips: the walkway's words for each. */
function storyLines(spec) {
  const T = spec.text;
  const P = T.pillar;
  const out = [
    T.translate,
    T.unitAsk,
    T.toStory,
    T.hour,
    T.minute,
    T.check,
    T.next,
    T.done,
    T.crewAsk(0),
    T.crewAsk(1),
  ];
  out.push(P.before, P.after, P.plant, P.lay, P.take, P.shore, ...stringsIn(P.error), P.error.range(spec.ruler));
  spec.rounds.forEach((round, ri) => {
    out.push(...[round.text].flat(), T.lead(round, ri), T.goal(round, ri), round.unit.options.join(' · '));
    out.push(...round.ask.flatMap((q) => [q.label, q.after ?? '']).filter(Boolean));
    for (const value of round.unit.options) out.push(T.mapFact({ slot: 'unit', value, right: false, round, ri }));
    for (const slot of ['A', 'B'])
      for (const value of round.numbers) out.push(T.mapFact({ slot, value, right: false, round, ri }));
    for (const d of [0, 4, 64, 160, 230, 460, 640, spec.ruler]) {
      const t = lay(round.crews, d, null);
      out.push(
        P.verdict(t),
        P.pillar(d),
        ...t.lanes.flatMap((l, i) => [P.lane(l, i, t), P.short(l.short), P.crew(i, l.b), P.band(l.planks, l.b)]),
      );
    }
    for (const q of round.ask) {
      const tries = q.clock
        ? [
            { h: '3', min: '50' },
            { h: '13', min: '50' },
            { h: '6', min: '12' },
            { h: '7', min: '00' },
            { h: '6', min: '56' },
            { h: '5', min: '00' },
            { h: '', min: '' },
            { h: '7', min: '70' },
          ]
        : ['', '0', '1', '4', '8', '5', '32', '64', '100', '640', '256'];
      for (const x of tries) out.push(T.backFact({ id: q.id, said: x, ask: q, round }));
    }
    const r = { d: lcm(...round.crews), said: [], pillars: [] };
    out.push(T.end(r, round), T.foundLine(r, round), T.foundLine({ ...r, d: null }, round));
  });
  return out;
}

function daysLines(spec) {
  const T = spec.text;
  const out = [T.zeroAsk, T.dayBefore, T.say, T.step, T.fast, T.pause, T.next, T.done];
  out.push(T.zeroFact({ said: 0, right: true }), T.zeroFact({ said: 1, right: false }));
  spec.teams.forEach((_, i) => out.push(T.rows.team(i), T.rows.since(i)));
  spec.stages.forEach((st, si) => {
    out.push(T.lead(st, si), T.goal(st, si));
    if (st.ask === 'zero') return;
    const now = daysNow(spec, { ...initDays(), si });
    out.push(T.sayAsk(st));
    for (const said of [2, now.meet - 1, now.meet, now.meet + 1, 721, 1065]) {
      out.push(T.saidLine(said), T.met({ day: now.meet, said, teams: st.teams, sleepers: [] }));
    }
    for (const stop of now.stops) out.push(T.stopFact(stop));
    out.push(T.foundLine({ teams: st.teams, said: now.meet, day: now.meet, sleepers: [] }));
  });
  return out;
}

const OF_KEY = { [K.facteurs]: SHEET_BENCH, [K.rendezvous]: STORY_INQUIRY, [K.equipes]: DAYS_INQUIRY };
const LINES = { [K.facteurs]: sheetLines, [K.rendezvous]: storyLines, [K.equipes]: daysLines };
const linesOf = (key, spec) => LINES[key](spec);

describeExperiments({
  ofKey: OF_KEY,
  linesOf,
  // the names of the lesson and the words of its rules: no experiment says them (« cycle » first appears on K4's tablet)
  never: /PPCM|multiple|commun|cycle|exposant|plus petit/i,
  own: {
    [K.facteurs]: /plus grand|tous les facteurs/i,
    [K.rendezvous]: /rendez-vous|divisé par|PGCD/i,
    [K.equipes]: /\+ ?1|cycle|rythme/i,
  },
});

describe('multiples-et-diviseurs-communs — its own experiments', () => {
  const all = Object.entries(OF_KEY).flatMap(([key, spec]) => linesOf(key, spec));

  it('every sentence is French: typography, no « PPCM », never « PGCD » and « produit » in one sentence', () => {
    for (const s of all) {
      said(s);
      expect(typographyErrors(s), s).toEqual([]);
      for (const sentence of String(s).split(/[.?!]\s/))
        expect(/PGCD/.test(sentence) && /produit/.test(sentence), s).toBe(false);
    }
  });

  it('the bench is lesson 1’s sheet on the chantier’s planks, 414 then 192, and keeps both decompositions', () => {
    expect(SHEET_BENCH).toMatchObject({ kind: 'sheet', stop: 'square', rounds: [{ n: 414 }, { n: 192 }] });
    const [half, one, both] = keptAlong();
    expect(half).toEqual(['$414 = 2 \\times 207$']);
    // with powers (gate B 2026-11-26): the tiles of forge 2 speak of « exposant »
    expect(one).toEqual(['$414 = 2 \\times 3^{2} \\times 23$', '$192 = 2 \\times 2 \\times 48$']);
    expect(both).toEqual(['$414 = 2 \\times 3^{2} \\times 23$', '$192 = 2^{6} \\times 3$']);
  });

  it('the stories: words only, chips that are translation errors, never a result (5, 8, 160; 23, 5, 230)', () => {
    const [gears, bus] = STORY_INQUIRY.rounds;
    expect(STORY_INQUIRY).toMatchObject({ kind: 'crews', mode: 'story', ruler: ST.ruler });
    expect(gears.numbers).toEqual([32, 20, 52, 12, 2]);
    expect(bus.numbers).toEqual([10, 46, 6, 2, 3]);
    expect(gears.ask.map((q) => q.value)).toEqual([160, 5, 8]);
    expect(bus.ask[0]).toMatchObject({ clock: true, value: [10, 0] });
    for (const r of [gears, bus]) {
      const L = lcm(...r.crews);
      for (const n of [L, L / r.crews[0], L / r.crews[1]]) expect(r.numbers, String(n)).not.toContain(n);
      for (const v of r.numbers.filter((x) => !r.crews.includes(x)))
        expect(mapJudge(r, { unit: null, A: null, B: null }, 'A', v)).toBe(false);
      // a chip's fact never writes a result of the story
      for (const slot of ['A', 'B', 'unit'])
        for (const v of slot === 'unit' ? r.unit.options : r.numbers)
          expect(STORY_INQUIRY.text.mapFact({ slot, value: v, round: r })).not.toMatch(
            new RegExp(`\\b(${L}|${L / r.crews[0]}|${L / r.crews[1]})\\b`),
          );
    }
    // no story text holds the result, and nothing is a gear drawing: the wheels are words
    expect([gears.text, bus.text].flat().join(' ')).not.toMatch(/\b(160|230|10 h 00)\b/);
  });

  it('the mirror’s pillar: each lane’s fact is ONE line of the facts column (≤ 64 characters), the shortfall written', () => {
    // walk 2026-11-26 (forge3-story at 160 and 230): the panel left the window — a lane's fact on two lines is part of it
    const P = STORY_INQUIRY.text.pillar;
    for (const round of STORY_INQUIRY.rounds)
      for (let d = 1; d <= STORY_INQUIRY.ruler; d += 1)
        lay(round.crews, d, null).lanes.forEach((l, i, all) => {
          const f = P.lane(l, i, { lanes: all });
          expect(f.length, `${round.crews} at ${d}: ${f}`).toBeLessThanOrEqual(64);
          if (l.short) expect(f.replace(/[\s  ]/g, ''), f).toContain(`${l.short}case`);
        });
  });

  it('a read-back wrong gets its fact, never the answer: 8 turns are 256 teeth; 3 h 50 is the duration', () => {
    const [gears, bus] = STORY_INQUIRY.rounds;
    const T = STORY_INQUIRY.text;
    expect(T.backFact({ id: 'turnsA', said: '8', round: gears })).toMatch(/8 \\times 32 = 256/);
    expect(T.backFact({ id: 'teeth', said: '640', round: gears })).toMatch(/déjà avant/);
    expect(T.backFact({ id: 'teeth', said: '4', round: gears })).toMatch(/aucune des deux marques/);
    expect(T.backFact({ id: 'at', said: { h: '3', min: '50' }, round: bus })).toMatch(/c’est la durée depuis 6 h 10/);
    expect(T.backFact({ id: 'at', said: { h: '13', min: '50' }, round: bus })).toMatch(/déjà fait avant/);
    for (const x of [
      { h: '3', min: '50' },
      { h: '13', min: '50' },
      { h: '7', min: '00' },
    ])
      expect(T.backFact({ id: 'at', said: x, round: bus })).not.toMatch(/10 h 00/);
  });

  it('the five teams: 62 days, day 61 met by the four and by the five; the run stops on 13, 25, 31, 37, 49', () => {
    expect(DAYS_INQUIRY).toMatchObject({ kind: 'crews', mode: 'days', days: 62 });
    const at = (si) => daysNow(DAYS_INQUIRY, { ...initDays(), si });
    expect([1, 2, 3, 4].map((si) => at(si).meet)).toEqual([7, 13, 61, 61]);
    expect(at(3).stops).toEqual([
      { day: 13, team: 4 },
      { day: 25, team: 4 },
      { day: 31, team: 3 },
      { day: 37, team: 4 },
      { day: 49, team: 4 },
    ]);
    expect(allButOne([2, 3, 4, 5, 6], 61)).toHaveLength(5);
    const met5 = DAYS_INQUIRY.text.met({ day: 61, said: 721, teams: [1, 2, 3, 4, 5], sleepers: [] });
    expect(met5).toMatch(/Bien avant le jour 721/);
    expect(met5).toMatch(/6 \\times 10/);
  });
});
