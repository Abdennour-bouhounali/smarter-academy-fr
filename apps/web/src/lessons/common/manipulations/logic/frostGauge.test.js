import { describe, it, expect } from 'vitest';
import * as L from './frostGauge';

const b = () => L.init({ tasks: L.PRESETS.beginner.tasks });
const a = () => L.init({ tasks: L.PRESETS.advanced.tasks });
/** pose le niveau (en graduations) puis enregistre */
const play = (s, grad) => L.record(L.setGrad(s, grad));

describe('frost-gauge — tâches', () => {
  it('les préréglages se normalisent : jauges, lectures, niveau d\'appartenance', () => {
    const tb = L.normalizeTasks(L.PRESETS.beginner.tasks);
    const ta = L.normalizeTasks(L.PRESETS.advanced.tasks);
    expect(tb.map((t) => t.id)).toEqual(['b1', 'b2', 'b3']);
    expect(ta.map((t) => t.id)).toEqual(['a1', 'a2', 'a3']);
    expect(tb.some((t) => t.advanced)).toBe(false);
    expect(ta.every((t) => t.advanced)).toBe(true);
    expect(tb[0].reads.map((r) => r.v)).toEqual([5, -2, -3, 0, 2]);
    expect(tb[2].reads).toEqual([{ want: 'value', v: -4 }, { want: 'mirror', v: 3 }, { want: 'value', v: 0 }]);
    expect(ta[0].reads).toEqual([{ want: 'distance', v: 6 }, { want: 'distance', v: 6 }]);
  });
  it('refuse une valeur hors graduation, hors jauge ou un genre inconnu', () => {
    const t = (o) => () => L.normalizeTasks([{ id: 'x', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [1], ...o }]);
    expect(t({ reads: [7] })).toThrow();
    expect(t({ step: 2, min: -6, max: 6, reads: [3] })).toThrow();
    expect(t({ kind: 'weird' })).toThrow();
    expect(t({ scene: 'moon' })).toThrow();
    expect(t({ reads: [] })).toThrow();
    expect(t({ reads: [{ dist: 3 }] })).toThrow();
    expect(t({ kind: 'pair', reads: [4] })).toThrow();
  });
});

describe('frost-gauge — jouer b1 (une semaine à Djelfa)', () => {
  it('le niveau part du zéro ; une lecture juste avance, une fausse ne fait rien avancer', () => {
    let s = b();
    expect(s.grad).toBe(0);
    expect(L.levelValue(s)).toBe(0);
    s = play(s, 5);
    expect(s.last).toMatchObject({ ok: true, value: 5 });
    expect(s.ri).toBe(1);
    s = play(s, 2); // demandé −2 : le signe est faux
    expect(s.last).toMatchObject({ ok: false, model: 'swap' });
    expect(s.ri).toBe(1);
    s = play(s, -2);
    expect(s.last.ok).toBe(true);
    expect(s.ri).toBe(2);
  });
  it('les modèles d\'erreur : swap (bonne distance, mauvais côté), zero, off, other', () => {
    const task = L.normalizeTasks([{ id: 'x', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [-3] }])[0];
    const r = task.reads[0];
    expect(L.judgeRead(task, r, -3)).toEqual({ ok: true, model: 'right' });
    expect(L.judgeRead(task, r, 3).model).toBe('swap');
    expect(L.judgeRead(task, r, 0).model).toBe('zero');
    expect(L.judgeRead(task, r, -2).model).toBe('off');
    expect(L.judgeRead(task, r, -4).model).toBe('off');
    expect(L.judgeRead(task, r, 5).model).toBe('other');
  });
  it('la lecture « 0 » : on la juge sur 0 ; une graduation voisine est « off »', () => {
    const task = L.normalizeTasks([{ id: 'x', scene: 'frost', kind: 'set', step: 1, min: -6, max: 6, reads: [0] }])[0];
    expect(L.judgeRead(task, task.reads[0], 0).ok).toBe(true);
    expect(L.judgeRead(task, task.reads[0], 1).model).toBe('off');
  });
  it('terminer les cinq lectures termine la tâche ; la suivante est ouverte', () => {
    let s = b();
    for (const v of [5, -2, -3, 0, 2]) s = play(s, v);
    expect(L.taskDone(s)).toBe(true);
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('b2');
    expect(s.log).toEqual([]);
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('le niveau est borné par la jauge et le geste est sans effet une fois la tâche finie', () => {
    let s = b();
    expect(L.setGrad(s, 99).grad).toBe(6);
    expect(L.setGrad(s, -99).grad).toBe(-6);
    expect(L.gradBy(s, 2).grad).toBe(2);
    for (const v of [5, -2, -3, 0, 2]) s = play(s, v);
    expect(L.setGrad(s, 1)).toBe(s);
    expect(L.record(s)).toBe(s);
  });
  it('altitude : le pas est 10 m, la valeur lue est en mètres', () => {
    let s = L.nextTask(play(play(play(play(play(b(), 5), -2), -3), 0), 2));
    expect(L.gaugeOf(s).step).toBe(10);
    s = L.setGrad(s, -4);
    expect(L.levelValue(s)).toBe(-40);
    s = L.record(s);
    expect(s.last).toMatchObject({ ok: true, value: -40 });
  });
});

describe('frost-gauge — l\'ombre (b3) et la paire (a1)', () => {
  const toB3 = () => {
    let s = b();
    for (const v of [5, -2, -3, 0, 2]) s = play(s, v);
    s = L.nextTask(s);
    for (const v of [-4, 3, 0]) s = play(s, v);
    return L.nextTask(s);
  };
  it('b3 : { self: -4 } pose le niveau à −4 et l\'ombre lit 4 ; { mirror: 3 } demande le niveau −3', () => {
    let s = toB3();
    expect(L.taskOf(s).id).toBe('b3');
    expect(L.showsShadow(s)).toBe(true);
    s = L.setGrad(s, -4);
    expect(L.shadowValue(s)).toBe(4);
    s = L.record(s);
    expect(s.last.ok).toBe(true);
    s = L.setGrad(s, 3); // l'ombre lit −3 : faux, on a posé le niveau au lieu de son ombre
    s = L.record(s);
    expect(s.last).toMatchObject({ ok: false, model: 'self' });
    s = play(s, -3);
    expect(s.last.ok).toBe(true);
    expect(L.shadowValue(s)).toBe(3);
  });
  it('b3 : la lecture « 0 » démarre d\'une graduation voisine, l\'ombre de 0 est 0', () => {
    let s = toB3();
    s = play(play(s, -4), -3);
    expect(L.readOf(s)).toMatchObject({ want: 'value', v: 0 });
    s = L.setGrad(s, 0);
    expect(L.shadowValue(s)).toBe(0);
    expect(Object.is(L.shadowValue(s), 0)).toBe(true);
    s = L.record(s);
    expect(L.taskDone(s)).toBe(true);
  });
  it('a1 : deux niveaux DIFFÉRENTS à 6 du zéro (pas 2) : 3 graduations de chaque côté', () => {
    let s = a();
    expect(L.showsDistance(s)).toBe(true);
    s = play(s, 2);
    expect(s.last).toMatchObject({ ok: false, model: 'dist' }); // 4 ≠ 6
    s = play(s, 3);
    expect(s.last).toMatchObject({ ok: true, value: 6 });
    s = play(s, 3);
    expect(s.last).toMatchObject({ ok: false, model: 'same' });
    s = play(s, -3);
    expect(s.last).toMatchObject({ ok: true, value: -6 });
    expect(L.taskDone(s)).toBe(true);
  });
});

describe('frost-gauge — états, reprise, jauge libre, onboarding', () => {
  it('« إعادة la tâche » remet la même tâche au départ ; discoveryReady demande toutes les tâches', () => {
    let s = b();
    s = play(s, 5);
    s = L.retryTask(s);
    expect(s.ri).toBe(0);
    expect(s.log).toEqual([]);
    expect(L.taskOf(s).id).toBe('b1');
    expect(L.discoveryReady(s)).toBe(false);
  });
  it('jauge libre : entiers de −10 à 10, côté, distance, opposé', () => {
    expect(L.parseFree('-4')).toBe(-4);
    expect(L.parseFree('−4')).toBe(-4);
    expect(L.parseFree('٣')).toBe(3);
    expect(L.parseFree('+7')).toBe(7);
    expect(L.parseFree('11')).toBeNull();
    expect(L.parseFree('2,5')).toBeNull();
    expect(L.parseFree('')).toBeNull();
    const s = L.setFree(b(), '-4');
    expect(L.isFree(s)).toBe(true);
    expect(L.levelValue(s)).toBe(-4);
    expect(L.freeInfo(s)).toEqual({ v: -4, side: 'below', distance: 4, opposite: 4 });
    expect(L.freeInfo(L.setFree(b(), '0'))).toEqual({ v: 0, side: 'zero', distance: 0, opposite: 0 });
    expect(L.isFree(L.toGuided(s))).toBe(false);
    expect(L.setFree(b(), 'abc')).toEqual(b());
  });
  it('coachOf : le geste utile maintenant', () => {
    let s = b();
    expect(L.coachOf(s).id).toBe('knob');
    s = L.setGrad(s, 2);
    expect(L.coachOf(s).id).toBe('record');
    s = L.record(s);
    expect(L.coachOf(s).id).toBe('again');
    for (const v of [5, -2, -3, 0, 2]) s = play(s, v);
    expect(L.coachOf(s).id).toBe('next');
    expect(L.coachOf(L.setFree(b(), '3'))).toBeNull();
  });
});
