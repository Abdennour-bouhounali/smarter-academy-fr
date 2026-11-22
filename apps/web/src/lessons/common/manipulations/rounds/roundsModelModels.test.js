import { describe, it, expect } from 'vitest';
import {
  emptyLog, logEvent, conditionMet, roundWon, starsFor, missesOf, needsHelp, countedTrials, HELP_MISSES,
} from './roundsModel';

// « Une vérification de MODÈLE » (growth-race, 2026-11-11 — verdict L4.3) : la mise en équation d'une situation n'est pas un essai de x.
// Événement onTrial { tk: 'model', ok, key?, free? } ; le journal garde `models` ; but { modelOk: true } ; deux modèles refusés ouvrent « جرّب أصغر ».

const play = (events) => events.reduce((log, [kind, ev]) => logEvent(log, kind, ev), emptyLog());
const model = (ok, key, extra = {}) => ['trial', { tk: 'model', ok, key, ...extra }];
const verdict = (groups, exact) => ['verdict', { groups, exact }];

const R = { id: 'r1', goal: [{ modelOk: true }, { discovered: true }], stars: { maxTrials: 5 }, easier: { props: {} } };

describe('model checks in the round log', () => {
  it('starts with no model and keeps the log shape of the other events untouched', () => {
    expect(emptyLog().models).toEqual([]);
    const log = play([verdict(3, true)]);
    expect(log.verdicts).toEqual([{ groups: 3, exact: true }]);
    expect(log.models).toEqual([]);
  });

  it('records a model check without touching the trials', () => {
    const log = play([model(false, 'a'), model(true, 'b')]);
    expect(log.models).toEqual([{ ok: false, key: 'a' }, { ok: true, key: 'b' }]);
    expect(countedTrials(log)).toBe(0);
    expect(log.verdicts).toEqual([]);
  });

  it('the same card set checked twice is one check, not two', () => {
    const log = play([model(false, 'a'), model(false, 'a'), model(false, 'a')]);
    expect(log.models).toHaveLength(1);
    expect(missesOf(log)).toBe(1);
  });

  it('a check without a key always counts (the lab did not dedupe)', () => {
    expect(play([model(false), model(false)]).models).toHaveLength(2);
  });

  it('modelOk is met by a right model only', () => {
    expect(conditionMet({ modelOk: true }, emptyLog())).toBe(false);
    expect(conditionMet({ modelOk: true }, play([model(false, 'a')]))).toBe(false);
    expect(conditionMet({ modelOk: true }, play([model(false, 'a'), model(true, 'b')]))).toBe(true);
  });

  it('a round whose goal holds modelOk is won only when the model AND the rest are met', () => {
    expect(roundWon(R, play([model(true, 'b')]))).toBe(false);
    expect(roundWon(R, play([model(true, 'b'), ['trial', { tk: 'discovered' }]]))).toBe(true);
  });
});

describe('refused models and the help card', () => {
  it('each refused model counts as a miss, a free one does not, a right one never', () => {
    expect(missesOf(play([model(false, 'a')]))).toBe(1);
    expect(missesOf(play([model(false, 'a', { free: true })]))).toBe(0);
    expect(missesOf(play([model(true, 'a')]))).toBe(0);
  });

  it('two refused models open the easier round, one does not', () => {
    expect(HELP_MISSES).toBe(2);
    expect(needsHelp(R, play([model(false, 'a')]))).toBe(false);
    expect(needsHelp(R, play([model(false, 'a'), model(false, 'b')]))).toBe(true);
  });

  it('misses add up with predictions and answers (same counter)', () => {
    const log = play([model(false, 'a'), ['trial', { tk: 'predict', ok: false }]]);
    expect(missesOf(log)).toBe(2);
  });

  it('a won round never asks for help', () => {
    expect(needsHelp(R, play([model(false, 'a'), model(false, 'b'), model(true, 'c'), ['trial', { tk: 'discovered' }]]))).toBe(false);
  });
});

describe('reset and retry', () => {
  it('« إعادة » forgets the models with the rest', () => {
    expect(logEvent(play([model(true, 'a'), verdict(2, true)]), 'trial', { tk: 'reset' })).toEqual(emptyLog());
  });
  it('« أعِد التجربة » keeps the models unless the lab says it undid them', () => {
    const log = play([model(true, 'a'), verdict(2, true)]);
    expect(logEvent(log, 'trial', { tk: 'retry' }).models).toHaveLength(1);
    expect(logEvent(log, 'trial', { tk: 'retry', models: true }).models).toEqual([]);
  });
});

describe('stars are unchanged by model checks', () => {
  it('few trials counts x-trials only', () => {
    const log = play([model(false, 'a'), model(true, 'b'), ['trial', { tk: 'predict', ok: true }], verdict(3, true), ['trial', { tk: 'discovered' }]]);
    expect(starsFor(R, log)).toBe(3);
  });
});
