import { describe, it, expect } from 'vitest';
import { stepReducer, initialStepState, stepPhase } from './stepPlayerModel.js';

const run = (state, ...types) => types.reduce((s, action) => stepReducer(s, typeof action === 'string' ? { type: action } : action), state);

describe('le déroulé d\'une solution — jamais d\'un bloc', () => {
  it('s\'ouvre sur l\'énoncé seul, puis ne montre que le PREMIER pas', () => {
    const s = initialStepState(5);
    expect(s.cursor).toBe(0);
    expect(stepPhase(s)).toBe('ready');
    const started = run(s, 'start');
    expect(started.cursor).toBe(1);
    expect(stepPhase(started)).toBe('stepping');
  });

  it('manuel : un pas par clic, un pas en arrière, jamais au-delà', () => {
    const s = run(initialStepState(3), 'start', 'next', 'next', 'next');
    expect(s.cursor).toBe(3);
    expect(stepPhase(s)).toBe('completed');
    expect(run(s, 'previous').cursor).toBe(2);
    expect(run(initialStepState(3), 'start', 'previous').cursor).toBe(1);
  });

  it('automatique : démarre en lecture, avance au tic, s\'arrête sur le résultat', () => {
    let s = run(initialStepState(3, { mode: 'auto' }), 'start');
    expect(s.playing).toBe(true);
    s = run(s, 'tick');
    expect(s.cursor).toBe(2);
    s = run(s, 'tick');
    expect(s.cursor).toBe(3);
    expect(s.playing).toBe(false);
    expect(run(s, 'tick').cursor).toBe(3);
  });

  it('pause et reprise gardent le pas ; un tic en pause ne fait rien', () => {
    const paused = run(initialStepState(5, { mode: 'auto' }), 'start', 'tick', 'pause');
    expect(stepPhase(paused)).toBe('paused');
    expect(run(paused, 'tick').cursor).toBe(2);
    expect(run(paused, 'resume')).toMatchObject({ cursor: 2, playing: true });
  });

  it('changer de mode GARDE le pas courant', () => {
    const auto = run(initialStepState(6, { mode: 'auto' }), 'start', 'tick', 'tick');
    const manual = run(auto, { type: 'setMode', mode: 'manual' });
    expect(manual).toMatchObject({ cursor: 3, playing: false, mode: 'manual' });
    const back = run(manual, { type: 'setMode', mode: 'auto' });
    expect(back).toMatchObject({ cursor: 3, playing: true });
    expect(run(auto, { type: 'setSpeed', speed: 'fast' })).toMatchObject({ cursor: 3, speed: 'fast', playing: true });
  });

  it('une nouvelle question revient à l\'énoncé — sauf si le bouton d\'action vient d\'être pressé', () => {
    const midway = run(initialStepState(4), 'start', 'next');
    expect(run(midway, { type: 'reset', total: 7, key: 'b' })).toMatchObject({ cursor: 0, total: 7, key: 'b' });
    const begun = run(midway, 'begin', { type: 'reset', total: 7, key: 'b' });
    expect(begun).toMatchObject({ cursor: 1, total: 7 });
    expect(run(begun, 'clearAutostart', { type: 'reset', total: 2, key: 'c' }).cursor).toBe(0);
  });

  it('« عرض الحل كاملاً » est un geste délibéré ; recommencer repart du premier pas', () => {
    const all = run(initialStepState(4), 'revealAll');
    expect(all.cursor).toBe(4);
    expect(run(all, 'restart').cursor).toBe(1);
  });

  it('bords : aucune étape, une seule étape, dix étapes et plus', () => {
    expect(stepPhase(initialStepState(0))).toBe('empty');
    expect(run(initialStepState(0), 'start').cursor).toBe(0);
    const one = run(initialStepState(1, { mode: 'auto' }), 'start');
    expect(one).toMatchObject({ cursor: 1, playing: false });
    let long = run(initialStepState(14, { mode: 'auto' }), 'start');
    for (let i = 0; i < 20; i += 1) long = run(long, 'tick');
    expect(long).toMatchObject({ cursor: 14, playing: false });
  });

  it('ignore des préférences illisibles', () => {
    expect(initialStepState(3, { mode: 'x', speed: 'turbo' })).toMatchObject({ mode: 'manual', speed: 'normal' });
  });
});
