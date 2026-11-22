import { describe, it, expect } from 'vitest';
import * as L from './strideStamp';

const b = () => L.init({ tasks: L.PRESETS.beginner.tasks });
const a = () => L.init({ tasks: L.PRESETS.advanced.tasks });
/** pose la main (dixièmes) puis enregistre */
const play = (s, pos) => L.record(L.setPos(s, pos));

describe('stride-stamp — tâches', () => {
  it('les préréglages se normalisent', () => {
    const tb = L.normalizeTasks(L.PRESETS.beginner.tasks);
    const ta = L.normalizeTasks(L.PRESETS.advanced.tasks);
    expect(tb.map((t) => t.id)).toEqual(['b1', 'b2', 'b3']);
    expect(ta.map((t) => t.id)).toEqual(['a1', 'a2', 'a3']);
    expect(tb.some((t) => t.advanced)).toBe(false);
    expect(ta.every((t) => t.advanced)).toBe(true);
    expect(tb[0].reads).toEqual([{ at: 30 }, { at: -30 }]);
    expect(tb[0].stride).toBe(2);
    expect(tb[1].reads).toEqual([{ of: -30 }, { of: 20 }]);
    expect(tb[2].reads.map((r) => r.x)).toEqual([-30, 27, -15]);
    expect(ta[0].reads).toEqual([{ idx: 5 }]);
    expect(ta[1].reads).toEqual([{ idx: 6 }]);
    expect(ta[2].reads.map((r) => r.x)).toEqual([-15, 27, -4]);
  });
  it('refuse les tâches mal formées', () => {
    const t = (o) => () => L.normalizeTasks([{ id: 'x', kind: 'place', reads: [{ x: 5 }], ...o }]);
    expect(t({ kind: 'weird' })).toThrow();
    expect(t({ reads: [] })).toThrow();
    expect(t({ reads: [{ x: 99 }] })).toThrow();
    expect(t({ reads: [{ x: 41 }] })).toThrow();
    expect(t({ reads: [{ x: -40 }, { x: 40 }] })).not.toThrow(); // les bornes de la droite sont permises pour `place`
    expect(t({ kind: 'bound', reads: [{ x: 39 }] })).not.toThrow();
    expect(t({ kind: 'bound', reads: [{ x: -20 }] })).toThrow(); // sur un tick
    expect(t({ kind: 'stamp', reads: [{ at: 0 }] })).toThrow();
    expect(t({ kind: 'stamp', reads: [{ at: 12 }] })).toThrow(); // hors de la route (11 foulées courtes à l'est)
    expect(t({ kind: 'twin', reads: [{ of: -25 }] })).toThrow();
    expect(t({ kind: 'origin', n: 10, marks: [{ i: 2, v: -3 }, { i: 7, v: 3 }] })).toThrow(); // deux origines différentes
    expect(t({ kind: 'origin', n: 10, marks: [{ i: 2, v: -3 }] })).toThrow();
  });
});

describe('stride-stamp — b1 : porter la foulée des deux côtés', () => {
  it('la main part de O avec la foulée longue ; les ticks se tamponnent en passant', () => {
    let s = b();
    expect(s.pos).toBe(0);
    expect(s.stride).toBe(2);
    expect(L.strideOf(s)).toBe(90);
    expect(L.reachOf(s)).toEqual({ west: 2, east: 5 });
    s = L.setPos(s, 30);
    expect(s.stamped).toEqual({ west: 0, east: 3 });
    s = L.setPos(s, -20);
    expect(s.stamped).toEqual({ west: 2, east: 3 });
    expect(L.setPos(s, 99).pos).toBe(50);  // la route finit : 5 foulées longues à l'est
    expect(L.setPos(s, -99).pos).toBe(-20); // deux seulement à l'ouest
  });
  it('lecture juste : avance ; fausse : jugée sans corriger', () => {
    let s = b();
    s = play(s, 30);
    expect(s.last).toMatchObject({ ok: true, model: 'right' });
    expect(s.ri).toBe(1);
    // −3 avec la foulée longue : la route s'arrête à −2, l'enregistrement dit « edge » (jamais la bonne foulée)
    s = play(s, -99);
    expect(s.last).toMatchObject({ ok: false, model: 'edge' });
    expect(s.ri).toBe(1);
  });
  it('changer de foulée EFFACE les ticks et ramène la main en O ; la foulée moyenne atteint −3', () => {
    let s = L.setPos(b(), 30);
    s = L.setStride(s, 1);
    expect(s.stride).toBe(1);
    expect(s.pos).toBe(0);
    expect(s.stamped).toEqual({ west: 0, east: 0 });
    expect(s.strideChanges).toBe(1);
    expect(s.last).toBeNull(); // une autre foulée est une autre situation : l'ancien verdict est effacé
    expect(L.reachOf(s)).toEqual({ west: 4, east: 7 });
    s = play(s, 30);
    s = play(s, -30);
    expect(L.taskDone(s)).toBe(true);
    expect(s.stamped.west).toBe(3);
    expect(L.setStride(s, 0)).toBe(s); // plus de changement une fois la tâche finie
  });
  it('les modèles d\'erreur : side, zero, off, other', () => {
    const task = L.normalizeTasks([{ id: 'x', kind: 'stamp', stride: 1, reads: [{ at: -3 }] }])[0];
    const r = task.reads[0];
    expect(L.judge(task, r, -30, 1)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, r, 30, 1).model).toBe('side');
    expect(L.judge(task, r, 0, 1).model).toBe('zero');
    expect(L.judge(task, r, -20, 1).model).toBe('off');
    expect(L.judge(task, r, -40, 1).model).toBe('off');
    expect(L.judge(task, r, 50, 1).model).toBe('other');
    expect(L.judge(task, r, -30, 2).model).toBe('edge');
    expect(L.judge(task, r, -30, 0)).toEqual({ ok: true, model: 'right' });
  });
});

describe('stride-stamp — b2 jumeau, b3 placer', () => {
  it('twin : le jumeau de −3 est en 3 ; le même point, O ou la case voisine sont jugés', () => {
    const task = L.normalizeTasks([{ id: 'x', kind: 'twin', reads: [{ of: -30 }] }])[0];
    const r = task.reads[0];
    expect(L.judge(task, r, 30)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, r, -30).model).toBe('same');
    expect(L.judge(task, r, 0).model).toBe('zero');
    expect(L.judge(task, r, 20).model).toBe('off');
    expect(L.judge(task, r, 40).model).toBe('off');
    expect(L.judge(task, r, -10).model).toBe('other');
  });
  it('place : la main va au dixième ; side, unit, tenth, other', () => {
    const task = L.normalizeTasks([{ id: 'x', kind: 'place', reads: [{ x: -15 }] }])[0];
    const r = task.reads[0];
    expect(L.judge(task, r, -15)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, r, 15).model).toBe('side');
    expect(L.judge(task, r, -5).model).toBe('unit');   // −0,5 : une unité de trop à droite
    expect(L.judge(task, r, -25).model).toBe('unit');
    expect(L.judge(task, r, -14).model).toBe('tenth');
    expect(L.judge(task, r, -16).model).toBe('tenth');
    expect(L.judge(task, r, 30).model).toBe('other');
  });
  it('place : grain d\'un dixième, borné à ±4,0 ; une tâche entière se joue', () => {
    let s = L.setStride(b(), 1);
    s = play(s, 30); s = play(s, -30);
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('b2');
    s = play(s, 30); s = play(s, -20);
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('b3');
    expect(L.grainOf(s)).toBe(1);
    expect(L.setPos(s, 99).pos).toBe(40);
    expect(L.setPos(s, -27).pos).toBe(-27);
    s = play(s, -30); s = play(s, 27); s = play(s, -15);
    expect(L.taskDone(s)).toBe(true);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.canNext(s)).toBe(false);
  });
});

describe('stride-stamp — متقدم', () => {
  it('origin : l\'origine est le tick qui rend les deux nombres écrits vrais ; la main part du bout gauche', () => {
    let s = a();
    expect(s.pos).toBe(0);
    expect(L.limitsOf(s)).toEqual({ min: 0, max: 100 });
    expect(L.judge(L.taskOf(s), L.taskOf(s).reads[0], 50)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(L.taskOf(s), L.taskOf(s).reads[0], 20).model).toBe('label'); // une graduation écrite prise pour l'origine
    expect(L.judge(L.taskOf(s), L.taskOf(s).reads[0], 80).model).toBe('label');
    expect(L.judge(L.taskOf(s), L.taskOf(s).reads[0], 40).model).toBe('off');
    expect(L.judge(L.taskOf(s), L.taskOf(s).reads[0], 100).model).toBe('other');
    s = play(s, 50);
    expect(L.taskDone(s)).toBe(true);
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('a2');
    s = play(s, 60);
    expect(L.taskDone(s)).toBe(true);
  });
  it('bound : le cadre d\'une foulée ; −1,5 entre −2 et −1, pas entre −1 et 0 (« trunc »)', () => {
    const task = L.normalizeTasks([{ id: 'x', kind: 'bound', reads: [{ x: -15 }, { x: 27 }, { x: -4 }] }])[0];
    expect(L.judge(task, task.reads[0], -20)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, task.reads[0], -10).model).toBe('trunc');
    expect(L.judge(task, task.reads[0], -30).model).toBe('near');
    expect(L.judge(task, task.reads[0], 20).model).toBe('other');
    expect(L.judge(task, task.reads[1], 20)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, task.reads[1], 30).model).toBe('near');
    expect(L.judge(task, task.reads[2], -10)).toEqual({ ok: true, model: 'right' });
    expect(L.judge(task, task.reads[2], 0).model).toBe('trunc');
    const s = L.init({ tasks: [{ id: 'a3', kind: 'bound', reads: [{ x: -15 }] }] });
    expect(L.limitsOf(s)).toEqual({ min: -40, max: 30 });
    expect(L.setPos(s, -99).pos).toBe(-40);
  });
  it('un jeu complet avance puis termine ; retryTask recommence la tâche', () => {
    let s = a();
    s = play(s, 50); s = L.nextTask(s);
    s = play(s, 60); s = L.nextTask(s);
    s = play(s, -20); s = play(s, 20); s = play(s, -10);
    expect(L.discoveryReady(s)).toBe(true);
    const r = L.retryTask(s);
    expect(L.taskDone(r)).toBe(false);
    expect(r.log).toEqual([]);
  });
});

describe('stride-stamp — essai libre et accompagnement', () => {
  it('parseFree : décimaux à un chiffre entre −5 et 5, chiffres arabes, virgule', () => {
    expect(L.parseFree('-1,5')).toBe(-15);
    expect(L.parseFree('2.7')).toBe(27);
    expect(L.parseFree('٣')).toBe(30);
    expect(L.parseFree('−٢٫٥')).toBe(-25);
    expect(L.parseFree('0')).toBe(0);
    expect(Object.is(L.parseFree('-0'), 0)).toBe(true);
    expect(L.parseFree('5')).toBe(50);
    expect(L.parseFree('5,1')).toBeNull();
    expect(L.parseFree('1,25')).toBeNull();
    expect(L.parseFree('abc')).toBeNull();
  });
  it('freeInfo : côté, distance, symétrique, encadrement ; jamais compté', () => {
    let s = L.setFree(b(), '-1,5');
    expect(L.isFree(s)).toBe(true);
    expect(L.freeInfo(s)).toEqual({ t: -15, side: 'west', distance: 15, symmetric: 15, bounds: [-2, -1] });
    expect(s.trials).toEqual([]);
    expect(L.record(s)).toBe(s);
    expect(L.setPos(s, 10)).toBe(s);
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(L.setFree(b(), 'zzz').free).toBeNull();
  });
  it('coachOf : le geste utile maintenant', () => {
    let s = b();
    expect(L.coachOf(s)).toMatchObject({ id: 'stick', target: '[data-ss-knob]' });
    s = L.setPos(s, 30);
    expect(L.coachOf(s)).toMatchObject({ id: 'record' });
    s = L.record(L.setPos(s, 20));
    expect(L.coachOf(s)).toMatchObject({ id: 'again' });
    expect(L.coachOf(a())).toMatchObject({ id: 'flag' });
    expect(L.coachOf(L.setFree(s, '1'))).toBeNull();
  });
});
