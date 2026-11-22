import { describe, it, expect } from 'vitest';
import * as L from './jumpTape';
import { LEVELS } from '../levels';

const run = (s, ...fns) => fns.reduce((acc, f) => f(acc), s);
const unit = (u) => (s) => L.releaseUnit(L.setUnit(s, u));
const put = (id, tick) => (s) => L.plant(s, id, tick);

describe('jump-tape — logique', () => {
  it('les préréglages de levels.js sont ceux de PRESETS et bien formés', () => {
    expect(LEVELS['jump-tape'].beginner.numbers.tasks).toEqual(L.PRESETS.beginner.tasks);
    expect(LEVELS['jump-tape'].advanced.numbers.tasks).toEqual(L.PRESETS.advanced.tasks);
    for (const lv of ['beginner', 'advanced']) expect(L.init(LEVELS['jump-tape'][lv].numbers).tasks.length).toBe(3);
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'plant', jumps: ['2,45'], unit: 'free' }] })).toThrow();   // pas sur une petite graduation
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'plant', jumps: ['3,1'], unit: 200 }] })).toThrow();      // l'unité donnée ne convient pas
    expect(() => L.init({ tasks: [{ id: 'x', kind: 'read', flags: ['5'], from: '0', step: '1' }] })).toThrow(); // hors fenêtre
  });
  it('la plage de l’unité vient du plus long saut : b1 [100, 145], b2 [100, 193]', () => {
    const s = L.init(LEVELS['jump-tape'].beginner.numbers);
    expect(s.tasks[0].range).toEqual({ min: 100, max: 145, need: 4 });
    expect(s.tasks[1].range).toEqual({ min: 100, max: 193, need: 3 });
    expect(L.fitsUnit(s.tasks[0], 145).ok).toBe(true);
    expect(L.fitsUnit(s.tasks[0], 146)).toEqual({ ok: false, model: 'long' });
    expect(L.fitsUnit(s.tasks[0], 99)).toEqual({ ok: false, model: 'short' });
    expect(L.fitsUnit(s.tasks[1], 190).ok).toBe(true);
  });
  it('b1 : la fenêtre ne montre que O ; une unité trop courte ou trop longue est refusée par le dessin', () => {
    let s = L.init(LEVELS['jump-tape'].beginner.numbers);
    expect(s.phase).toBe('unit');
    expect(L.releaseUnit(s)).toBe(s);                                 // rien n'a bougé : rien à relâcher
    s = run(s, unit(70));
    expect(s.refusal).toBe('short'); expect(s.phase).toBe('unit');
    expect(s.last).toMatchObject({ kind: 'unit', ok: false, model: 'short' });
    s = run(s, unit(200));
    expect(s.refusal).toBe('long');
    s = L.setUnit(s, 120);
    expect(s.refusal).toBeNull();
    s = L.releaseUnit(s);
    expect(s.phase).toBe('plant'); expect(L.unitLocked(s)).toBe(true);
    expect(s.last).toMatchObject({ ok: true, u: 120 });
    expect(L.setUnit(s, 60)).toBe(s);                                 // verrouillée
  });
  it('b1 : planter 2,4 · 3,1 · 1,8 — chaque plantage est jugé, la tâche finit quand les trois sont justes', () => {
    let s = run(L.init(LEVELS['jump-tape'].beginner.numbers), unit(140));
    s = put('A', 24)(s);
    expect(s.last).toMatchObject({ kind: 'plant', ok: true, value: '2,4', want: '2,4' });
    s = run(s, put('B', 31), put('C', 18));
    expect(L.taskDone(s)).toBe(true); expect(s.phase).toBe('done');
    expect(L.canNext(s)).toBe(true);
    s = L.nextTask(s);
    expect(s.ti).toBe(1); expect(s.phase).toBe('unit');
  });
  it('les modèles d’un drapeau mal planté et l’empreinte à la vraie place', () => {
    let s = run(L.init(LEVELS['jump-tape'].beginner.numbers), unit(140));
    s = put('A', 42)(s);                                               // 2,4 planté à 4,2
    expect(s.last).toMatchObject({ ok: false, model: 'swap', value: '4,2', want: '2,4' });
    expect(s.prints).toEqual({ A: 24 });
    s = put('A', 4)(s);                                                // le chiffre décimal compté depuis O : 0,4
    expect(s.last).toMatchObject({ model: 'fromO', value: '0,4' });
    s = put('A', 20)(s);                                               // la marque 2 seule
    expect(s.last).toMatchObject({ model: 'wholeOnly', value: '2' });
    s = put('A', 25)(s);
    expect(s.last).toMatchObject({ model: 'off1' });
    s = put('A', 7)(s);
    expect(s.last).toMatchObject({ model: 'other' });
    expect(L.coachOf(s)).toMatchObject({ id: 'again' });
    s = put('A', 24)(s);
    expect(s.prints).toEqual({});
    expect(L.isRight(s, 'A')).toBe(true);
    s = L.lift(s, 'A');
    expect(s.planted).toEqual({});
  });
  it('le drapeau reste dans la fenêtre : tick maximal et un 2,4 → 4,2 atteignable à u = 140 mais pas à 145', () => {
    expect(L.maxTickAt(140)).toBe(42);
    let s = run(L.init(LEVELS['jump-tape'].beginner.numbers), unit(145));
    s = put('A', 500)(s);
    expect(s.planted.A).toBe(L.maxTickAt(145));
  });
  it('b2 : l’entier 3 se plante sur la grande marque 3 (30 petites graduations) ; b3 : la somme 2 + 6/10 est 2,6', () => {
    const s = run(L.init({ tasks: LEVELS['jump-tape'].beginner.numbers.tasks.slice(1, 2) }), unit(150), put('A', 7), put('B', 29), put('C', 30));
    expect(L.taskDone(s)).toBe(true);
    const b3 = L.init({ tasks: LEVELS['jump-tape'].beginner.numbers.tasks.slice(2) });
    expect(b3.phase).toBe('plant'); expect(b3.u).toBe(140);
    expect(b3.tasks[0].jumps[1]).toMatchObject({ text: '2+6/10', v: 2600, sum: true, tick: 26 });
    const done = run(b3, put('A', 8), put('B', 26), put('C', 33));
    expect(L.taskDone(done)).toBe(true);
  });
  it('read : exact ou encadrement — a1 0,6 · 1,9 · 2,35', () => {
    let s = L.init(LEVELS['jump-tape'].advanced.numbers);
    expect(s.phase).toBe('read');
    expect(s.tasks[0].flags.map((f) => f.exact)).toEqual([true, true, false]);
    expect(L.coachOf(s)).toMatchObject({ id: 'cursor' });
    s = L.moveCursor(s, 5);
    expect(L.coachOf(s)).toMatchObject({ id: 'answer' });
    s = L.answerRead(s, 'bounds');                                     // 0,6 est sur une graduation
    expect(s.last).toMatchObject({ ok: false, model: 'boundsOnTick' });
    s = L.answerRead(s, 'exact');                                      // curseur à 0,5 : mauvaise graduation
    expect(s.last).toMatchObject({ ok: false, model: 'wrongTick' });
    s = run(L.moveCursor(s, 6), (x) => L.answerRead(x, 'exact'));
    expect(s.answered.A).toEqual({ mode: 'exact', lo: 600, hi: null });
    expect(s.sel).toBe('B');
    s = run(s, (x) => L.moveCursor(x, 19), (x) => L.answerRead(x, 'exact'));
    expect(s.sel).toBe('C');
    s = run(s, (x) => L.moveCursor(x, 23), (x) => L.answerRead(x, 'exact'));
    expect(s.last).toMatchObject({ ok: false, model: 'exactOnBetween' });
    expect(s.ghost).toMatchObject({ flag: 'C', tick: 23 });
    s = run(s, (x) => L.moveCursor(x, 24), (x) => L.answerRead(x, 'bounds'));
    expect(s.last).toMatchObject({ ok: false, model: 'wrongTick' });
    s = run(s, (x) => L.moveCursor(x, 23), (x) => L.answerRead(x, 'bounds'));
    expect(s.answered.C).toEqual({ mode: 'bounds', lo: 2300, hi: 2400 });
    expect(L.taskDone(s)).toBe(true);
  });
  it('balayage : pour chaque drapeau de chaque tâche de lecture, exactement UNE graduation et UN mode sont justes', () => {
    const s = L.init(LEVELS['jump-tape'].advanced.numbers);
    for (const task of s.tasks) for (const flag of task.flags) {
      for (const mode of ['exact', 'bounds']) {
        const right = Array.from({ length: task.maxTick + 1 }, (_, i) => i).filter((i) => L.judgeRead(task, flag, i, mode).ok);
        expect(right.length, `${task.id}.${flag.id}.${mode}`).toBe((mode === 'exact') === flag.exact ? 1 : 0);
      }
    }
  });
  it('a2 : une fenêtre sans origine (9 … 12) ; a3 : des centièmes (4 … 4,3), 4,235 est entre 4,23 et 4,24', () => {
    const s = L.init(LEVELS['jump-tape'].advanced.numbers);
    expect(s.tasks[1].w).toEqual({ from: 9000, step: 1000 });
    expect(s.tasks[1].flags[2]).toMatchObject({ v: 11250, lo: 11200, hi: 11300, exact: false });
    expect(s.tasks[2].w).toEqual({ from: 4000, step: 100 });
    expect(s.tasks[2].flags[2]).toMatchObject({ v: 4235, lo: 4230, hi: 4240, exact: false, i: 23 });
  });
  it('« جرّب أعدادك » : la fenêtre fixe, grande marque + petites graduations ou encadrement ; ne compte jamais', () => {
    let s = L.init(LEVELS['jump-tape'].beginner.numbers);
    expect(L.setFree(s, '5')).toBe(s);
    expect(L.setFree(s, 'x')).toBe(s);
    s = L.setFree(s, '2,4');
    expect(L.isFree(s)).toBe(true);
    expect(L.freeInfo(s)).toMatchObject({ whole: 2, smalls: 4, exact: true, text: '2,4' });
    s = L.setFree(s, '2,35');
    expect(L.freeInfo(s)).toMatchObject({ exact: false, loText: '2,3', hiText: '2,4' });
    expect(s.trials).toHaveLength(0);
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false); expect(s.ti).toBe(0);
  });
  it('le coach suit chaque tâche jusqu’au bout sans jamais viser une réponse', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(LEVELS['jump-tape'][lv].numbers);
      const seen = new Set();
      for (let guard = 0; guard < 60 && !L.discoveryReady(s); guard += 1) {
        const c = L.coachOf(s);
        if (c) seen.add(c.id);
        const t = L.taskOf(s);
        if (L.taskDone(s)) { s = L.nextTask(s); continue; }
        if (t.kind === 'plant' && s.phase === 'unit') s = unit(t.range.max)(s);
        else if (t.kind === 'plant') { const j = t.jumps.find((x) => s.planted[x.id] !== x.tick); s = L.plant(s, j.id, j.tick); }
        else { const f = t.flags.find((x) => !s.answered[x.id]); s = L.moveCursor(s, f.exact ? (f.v - t.w.from) / (t.w.step / 10) : f.i); s = L.answerRead(s, f.exact ? 'exact' : 'bounds'); }
      }
      expect(L.discoveryReady(s)).toBe(true);
      expect(L.coachOf(s)).toBeNull();
      expect([...seen].length).toBeGreaterThan(1);
    }
  });
  it('« إعادة » de la tâche : retryTask remet la même tâche au départ', () => {
    let s = run(L.init(LEVELS['jump-tape'].beginner.numbers), unit(140), put('A', 24), put('B', 31), put('C', 18));
    s = L.retryTask(s);
    expect(s.ti).toBe(0); expect(s.phase).toBe('unit'); expect(s.planted).toEqual({});
    expect(s.done[0]).toBeUndefined();
  });
});
