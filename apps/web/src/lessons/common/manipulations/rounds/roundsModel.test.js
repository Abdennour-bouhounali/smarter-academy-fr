import { describe, it, expect } from 'vitest';
import {
  countedTrials, starCriteria, allPairsSeen, needsHelp, missesOf, emptyLog, logEvent, conditionMet, roundWon, starsFor, roundUnlocked, jumpTarget, resumeRound, readStars, recordStars, totalStars, starsKey,
} from './roundsModel';

const play = (events) => events.reduce((log, [kind, ev]) => logEvent(log, kind, ev), emptyLog());
const verdict = (groups, exact) => ['verdict', { groups, exact }];
const answer = (ok, tries = 1, revealed = false) => ['trial', { tk: 'checkpoint', ok, tries, revealed }];
const done = (id) => ['trial', { tk: 'checkpoint-done', id }];
const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

const R1 = { id: 'r1', goal: [{ checkpoint: 'first' }], stars: { maxTrials: 1 } };
const R3 = { id: 'r3', goal: [{ checkpoint: 'contrast' }], stars: { maxTrials: 3 } };
const CH = { id: 'ch', optional: true, goal: [{ allExact: [2, 3, 6, 7] }], stars: { maxTrials: 6 } };
const FREE = { id: 'free', free: true };

describe('round goals — measured from what the lab reports', () => {
  it('a checkpoint goal waits for the whole question set', () => {
    expect(roundWon(R1, play([verdict(3, true)]))).toBe(false);
    expect(roundWon(R1, play([verdict(3, true), answer(true), done('first')]))).toBe(true);
  });
  it('the challenge needs EVERY divisor seen as an exact split', () => {
    expect(roundWon(CH, play([verdict(2, true), verdict(3, true), verdict(6, true)]))).toBe(false);
    expect(roundWon(CH, play([verdict(2, true), verdict(3, true), verdict(6, true), verdict(5, false), verdict(7, true)]))).toBe(true);
    expect(conditionMet({ exact: 6 }, play([verdict(6, false)]))).toBe(false);
  });
  it('a free round is never "won" and never blocks', () => {
    expect(roundWon(FREE, play([verdict(4, true)]))).toBe(false);
  });
});

describe('stars — 1 for the win, 1 for right predictions, 1 for few trials (pilote 2026-11-07 : le jeu, plus la frappe)', () => {
  const predict = (ok) => ['trial', { tk: 'predict', ok }];
  it('gives 3 stars to a won round with right predictions and few trials', () => {
    expect(starsFor(R1, play([predict(true), verdict(3, true), answer(true), done('first')]))).toBe(3);
  });
  it('a wrong answer to a question no longer costs a star — a wrong prediction does', () => {
    expect(starsFor(R1, play([predict(true), verdict(3, true), answer(false), answer(true, 2), done('first')]))).toBe(3);
    expect(starsFor(R1, play([predict(false), verdict(3, true), answer(true), done('first')]))).toBe(2);
  });
  it('no prediction made: no prediction star; too many trials: one star less', () => {
    expect(starsFor(R1, play([verdict(3, true), done('first')]))).toBe(2);
    expect(starsFor(R1, play([predict(true), verdict(4, false), verdict(3, true), done('first')]))).toBe(2);
  });
  it('a round that cannot hold a prediction keeps the star (stars.predict false)', () => {
    expect(starsFor({ ...R1, stars: { ...R1.stars, predict: false } }, play([verdict(3, true), done('first')]))).toBe(3);
  });
  it('gives no star to a round not won', () => {
    expect(starsFor(R3, play([verdict(5, false)]))).toBe(0);
  });
});

describe('the path — unlocks and where to resume', () => {
  const rounds = [R1, { ...R3, id: 'r2' }, R3, CH, FREE];
  it('opens a round when the previous REQUIRED round is won; the free pitch is always open', () => {
    expect(roundUnlocked(rounds, 0, {})).toBe(true);
    expect(roundUnlocked(rounds, 1, {})).toBe(false);
    expect(roundUnlocked(rounds, 1, { r1: 1 })).toBe(true);
    expect(roundUnlocked(rounds, 4, {})).toBe(true);
  });
  it('resumes at the first required round not won, else the last won', () => {
    expect(resumeRound(rounds, {})).toBe(0);
    expect(resumeRound(rounds, { r1: 2 })).toBe(1);
    expect(resumeRound(rounds, { r1: 2, r2: 1, r3: 3 })).toBe(2);
  });
});

describe('best stars — per student, never lost by replaying', () => {
  it('keeps the best score and totals the lesson', () => {
    const s = memory();
    recordStars(s, 'l1', 'm1', 'r1', 2);
    recordStars(s, 'l1', 'm1', 'r1', 1);
    recordStars(s, 'l1', 'm2', 'a', 3);
    expect(readStars(s, 'l1')).toEqual({ m1: { r1: 2 }, m2: { a: 3 } });
    expect(totalStars(readStars(s, 'l1'))).toBe(5);
    s.setItem(starsKey('l2'), '{bad');
    expect(readStars(s, 'l2')).toEqual({});
  });
});

describe('the second chance « لا بأس — جرّب أصغر » (pilot 2026-11-08)', () => {
  const hard = { id: 'r3', goal: [{ checkpoint: 'contrast' }], stars: { maxTrials: 3 }, easier: { goal: [{ inexact: true }, { exact: 6 }] } };
  const plain = { id: 'r1', goal: [{ checkpoint: 'first' }] };
  const ev = (log, kind, e) => logEvent(log, kind, e);
  it('is never offered to a student who succeeds, nor on a round without an easier version', () => {
    let log = emptyLog();
    log = ev(log, 'trial', { tk: 'predict', ok: true });
    log = ev(log, 'trial', { tk: 'checkpoint', ok: true, tries: 1 });
    expect(needsHelp(hard, log)).toBe(false);
    log = ev(ev(log, 'trial', { tk: 'predict', ok: false }), 'trial', { tk: 'predict', ok: false });
    expect(needsHelp(plain, log)).toBe(false);
  });
  it('one miss is noise; two misses (prediction or question) offer the smaller round', () => {
    let log = ev(emptyLog(), 'trial', { tk: 'predict', ok: false });
    expect(missesOf(log)).toBe(1);
    expect(needsHelp(hard, log)).toBe(false);
    log = ev(log, 'trial', { tk: 'checkpoint', ok: true, tries: 2 });
    expect(needsHelp(hard, log)).toBe(true);
  });
  it('a question counts ONCE: its wrong try then its right answer is one miss, not two (synthesis walk, 2026-11-10)', () => {
    let log = ev(emptyLog(), 'trial', { tk: 'checkpoint', ok: false, tries: 1 });
    log = ev(log, 'trial', { tk: 'checkpoint', ok: true, tries: 2 });
    expect(missesOf(log)).toBe(1);
    expect(needsHelp(hard, log)).toBe(false);
    log = ev(log, 'trial', { tk: 'checkpoint', ok: false, tries: 3, revealed: true });
    expect(missesOf(log)).toBe(2);
  });
  it('many trials without winning also offer it, and a won round never does', () => {
    let log = emptyLog();
    for (let k = 0; k < 5; k += 1) log = ev(log, 'verdict', { groups: 5, exact: false });
    expect(needsHelp(hard, log)).toBe(true);
    log = ev(log, 'trial', { tk: 'checkpoint-done', id: 'contrast' });
    expect(needsHelp(hard, log)).toBe(false);
  });
  it('the practice goal « saw someone left out, then an exact split » is judged on the pitch', () => {
    let log = ev(emptyLog(), 'verdict', { groups: 6, exact: true });
    expect(roundWon(hard.easier, log)).toBe(false);
    log = ev(log, 'verdict', { groups: 5, exact: false });
    expect(roundWon(hard.easier, log)).toBe(true);
  });
});

describe('allPairs — the factor-pairs goal « every perfect rectangle of n books seen »', () => {
  const win = (n, ds) => ds.reduce((log, d) => logEvent(log, 'verdict', { groups: d, exact: n % d === 0 }), emptyLog());
  it('one side of each pair is enough (12: 1, 2, 3 — or their partners 12, 6, 4)', () => {
    expect(allPairsSeen(12, new Set([1, 2, 3]))).toBe(true);
    expect(allPairsSeen(12, new Set([12, 6, 4]))).toBe(true);
    expect(allPairsSeen(12, new Set([1, 2]))).toBe(false);
  });
  it('a square counts once (36: 1, 2, 3, 4, 6) and wrong widths never count', () => {
    expect(allPairsSeen(36, new Set([1, 2, 3, 4, 6]))).toBe(true);
    expect(allPairsSeen(36, new Set([1, 2, 3, 4]))).toBe(false);
    expect(roundWon({ goal: [{ allPairs: 36 }] }, win(36, [1, 2, 3, 4, 5, 6]))).toBe(true);
    expect(roundWon({ goal: [{ allPairs: 36 }] }, win(36, [1, 2, 3, 4, 5]))).toBe(false);
  });
  it('a prime has the single pair 1 × p', () => {
    expect(allPairsSeen(17, new Set([1]))).toBe(true);
    expect(allPairsSeen(17, new Set([2, 3]))).toBe(false);
  });
});

describe('anyExact — « some perfect split was seen »', () => {
  it('needs one exact verdict, whatever the width', () => {
    const miss = logEvent(emptyLog(), 'verdict', { groups: 5, exact: false });
    expect(conditionMet({ anyExact: true }, miss)).toBe(false);
    expect(conditionMet({ anyExact: true }, logEvent(miss, 'verdict', { groups: 6, exact: true }))).toBe(true);
  });
});

describe('above — the common-divisors goal « the greatest is SEEN: a larger number of groups was tried »', () => {
  it('needs a verdict strictly above g; with { exact: g } it is the lab\'s « greatest group found »', () => {
    const round = { id: 'r', goal: [{ exact: 6 }, { above: 6 }] };
    let log = emptyLog();
    [1, 2, 3, 4, 5, 6].forEach((g) => { log = logEvent(log, 'verdict', { groups: g, exact: 12 % g === 0 && 18 % g === 0 }); });
    expect(conditionMet({ above: 6 }, log)).toBe(false);
    expect(roundWon(round, log)).toBe(false);
    log = logEvent(log, 'verdict', { groups: 7, exact: false });
    expect(roundWon(round, log)).toBe(true);
  });
});

describe('bracketed / resists — the square-root-side goals (2026-11-09)', () => {
  it('bracketed: g needs a tight bracket SEEN at that graduation; a verdict alone is not enough', () => {
    let log = logEvent(emptyLog(), 'verdict', { groups: 1, exact: false });
    expect(conditionMet({ bracketed: 1 }, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'bracket', card: 0, scale: 1, resisting: false });
    expect(conditionMet({ bracketed: 1 }, log)).toBe(true);
    expect(conditionMet({ bracketed: 10 }, log)).toBe(false);
  });
  it('resists needs a bracket event whose card now resists', () => {
    let log = logEvent(emptyLog(), 'trial', { tk: 'bracket', card: 1, scale: 2, resisting: false });
    expect(conditionMet({ resists: true }, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'bracket', card: 1, scale: 5, resisting: true });
    expect(conditionMet({ resists: true }, log)).toBe(true);
  });
});

describe('solvedAll — the square-fold goal (2026-11-10)', () => {
  it('every card 0..n-1 must be seen SOLVED; a refused answer or a half-solved card is not enough', () => {
    let log = logEvent(emptyLog(), 'verdict', { groups: 0, exact: false }); // one root of x² = 4 pinned
    log = logEvent(log, 'verdict', { groups: 0, exact: true });             // both roots
    log = logEvent(log, 'verdict', { groups: 2, exact: false });            // a refused pin on x² = −4
    expect(conditionMet({ solvedAll: 3 }, log)).toBe(false);
    log = logEvent(log, 'verdict', { groups: 1, exact: true });
    log = logEvent(log, 'verdict', { groups: 2, exact: true });             // « لا حل » declared
    expect(conditionMet({ solvedAll: 3 }, log)).toBe(true);
    expect(conditionMet({ solvedAll: 4 }, log)).toBe(false);
  });
});

describe('reset — « إعادة » in the lab empties the round', () => {
  it('a reset event drops the verdicts, predictions, brackets and answers seen before it', () => {
    let log = logEvent(emptyLog(), 'verdict', { groups: 1, exact: false });
    log = logEvent(log, 'trial', { tk: 'predict', ok: false });
    log = logEvent(log, 'trial', { tk: 'bracket', card: 0, scale: 1, resisting: false });
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'rule' });
    expect(conditionMet({ bracketed: 1 }, log)).toBe(true);
    log = logEvent(log, 'trial', { tk: 'reset' });
    expect(log).toEqual(emptyLog());
    expect(conditionMet({ bracketed: 1 }, log)).toBe(false);
    expect(conditionMet({ checkpoint: 'rule' }, log)).toBe(false);
  });
});

describe('the door to a round (jumpTarget, ECC review 2026-11-09)', () => {
  const rounds = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'challenge', optional: true }, { id: 'free', free: true }];
  it('leads to the requested round when it is open', () => {
    expect(jumpTarget(rounds, 1, { r1: 2 })).toBe(1);
    expect(jumpTarget(rounds, 4, {})).toBe(4); // the free round is always open
  });
  it('never skips a closed round: it leads to the first required round not won', () => {
    expect(jumpTarget(rounds, 1, {})).toBe(0);
    expect(jumpTarget(rounds, 2, { r1: 3 })).toBe(1);
    expect(jumpTarget(rounds, 3, {})).toBe(0);
  });
  it('an unknown round is -1', () => {
    expect(jumpTarget(rounds, -1, {})).toBe(-1);
  });
});

describe('square-tiling (2026-11-10): the discovered goal, free refusals, help after refusals', () => {
  it('{ discovered: true } is met only once the lab announced its discovery', () => {
    let log = logEvent(emptyLog(), 'verdict', { groups: 2, exact: true });
    expect(conditionMet({ discovered: true }, log)).toBe(false);
    log = logEvent(log, 'trial', { tk: 'discovered' });
    expect(conditionMet({ discovered: true }, log)).toBe(true);
    expect(logEvent(log, 'trial', { tk: 'reset' }).discovered).toBe(false);
  });
  it('a free verdict counts for the goals but never as a trial of the « few trials » star', () => {
    const round = { id: 'r', goal: [{ exact: 3 }], stars: { maxTrials: 1, predict: false } };
    let log = logEvent(emptyLog(), 'verdict', { groups: 2, exact: false, free: true });
    log = logEvent(log, 'verdict', { groups: 3, exact: true });
    expect(log.verdicts[0].free).toBe(true);
    expect(countedTrials(log)).toBe(1);
    expect(starsFor(round, log)).toBe(3);
    log = logEvent(log, 'verdict', { groups: 4, exact: false });
    expect(starsFor(round, log)).toBe(2);
  });
  it('a retry drops what the lab undid: one card\'s verdicts, or every verdict and the discovery — predictions and answers stay', () => {
    let log = logEvent(emptyLog(), 'verdict', { groups: 0, exact: true });
    log = logEvent(log, 'verdict', { groups: 1, exact: true });
    log = logEvent(log, 'trial', { tk: 'predict', ok: true });
    log = logEvent(log, 'trial', { tk: 'discovered' });
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: 'c0' });
    const one = logEvent(log, 'trial', { tk: 'retry', groups: 1 });
    expect(one.verdicts.map((v) => v.groups)).toEqual([0]);
    expect(one.discovered).toBe(true);
    const all = logEvent(log, 'trial', { tk: 'retry' });
    expect(all.verdicts).toEqual([]);
    expect(all.discovered).toBe(false);
    expect(all.predictions).toHaveLength(1);
    expect(all.checkpoints.c0).toBe(true);
  });
  it('the win card\'s criteria are the stars\' own (a free verdict never makes the card say « too many trials »)', () => {
    const round = { id: 'r', goal: [{ exact: 3 }], stars: { maxTrials: 1, predict: false } };
    let log = logEvent(emptyLog(), 'verdict', { groups: 2, exact: false, free: true });
    log = logEvent(log, 'verdict', { groups: 3, exact: true });
    expect(starCriteria(round, log)).toEqual({ clean: true, few: true });
    expect(starsFor(round, log)).toBe(1 + 1 + 1);
    log = logEvent(log, 'verdict', { groups: 4, exact: false });
    expect(starCriteria(round, log).few).toBe(false);
  });
  it('helpAfterRefusals: n refusals (free ones included) offer the easier round; without it, nothing changes', () => {
    const round = { id: 'r', goal: [{ exact: 3 }], easier: { goal: [{ exact: 2 }] }, stars: { maxTrials: 9 }, helpAfterRefusals: 3 };
    let log = logEvent(emptyLog(), 'verdict', { groups: 2, exact: false, free: true });
    log = logEvent(log, 'verdict', { groups: 4, exact: false });
    expect(needsHelp(round, log)).toBe(false);
    log = logEvent(log, 'verdict', { groups: 5, exact: false });
    expect(needsHelp(round, log)).toBe(true);
    expect(needsHelp({ ...round, helpAfterRefusals: undefined }, log)).toBe(false);
  });
});

describe('the easier round of the synthesis (2026-11-10): numbers chosen from what was seen, and a win that releases the round', () => {
  it('easierProps: an object as before, or a function of the main round log', async () => {
    const { easierProps, releasesOnEasyWin, logEvent: ev, emptyLog: empty } = await import('./roundsModel');
    expect(easierProps({ easier: { props: { a: 1 } } })).toEqual({ a: 1 });
    const pick = (log) => ({ lockH: [4, 3, 2, 1].find((i) => !log.verdicts.some((v) => v.exact && v.groups === i)) });
    let log = empty();
    expect(easierProps({ easier: { props: pick } }, log)).toEqual({ lockH: 4 });
    log = ev(log, 'verdict', { groups: 4, exact: true });
    expect(easierProps({ easier: { props: pick } }, log)).toEqual({ lockH: 3 });
    expect(releasesOnEasyWin({ easier: { releases: true } })).toBe(true);
    expect(releasesOnEasyWin({ easier: {} })).toBe(false);
    expect(releasesOnEasyWin({})).toBe(false);
  });
});
