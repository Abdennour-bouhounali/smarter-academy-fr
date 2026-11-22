import { describe, it, expect } from 'vitest';
import * as L from './rewindBelt';
import * as M from '@smarter-academy/core/arithmetic/missingNumber.js';

const play = (s, kind, p1 = 1, p2 = 0) => L.setPos(L.setPos(L.pickCard(s, kind), p1), p2);

describe('rewind-belt — tâches', () => {
  it('les préréglages : chaque rangée a exactement une carte juste, le manquant n\'est jamais négatif', () => {
    for (const lv of ['beginner', 'advanced']) {
      const tasks = L.normalizeTasks(L.PRESETS[lv].tasks);
      for (const t of tasks) {
        expect(M.isNeg(t.secret), t.id).toBe(false);
        expect(t.rack.filter((k) => M.judgePick(t.card, k, t.out).ok), t.id).toHaveLength(1);
        expect(M.holds(t.card, t.secret, t.out)).toBe(true);
      }
    }
    const b = L.normalizeTasks(L.PRESETS.beginner.tasks);
    expect(b.map((t) => M.text(t.secret))).toEqual(['45', '68', '9', '26']);
    expect(b.map((t) => t.rightKind)).toEqual(['sub', 'add', 'div', 'rsub']);
    const a = L.normalizeTasks(L.PRESETS.advanced.tasks);
    expect(a.map((t) => M.text(t.secret))).toEqual(['28,7', '7,7', '20/7']);
    expect(a[2].fraction).toBe(true);
    expect(a[0].decimal).toBe(true);
  });
  it('refuse une tâche mal formée', () => {
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'zzz', a: '1', out: '2' }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'add', a: '9', out: '5' }])).toThrow(); // manquant négatif
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'add', a: '9', out: '54', rack: ['add', 'sub'] }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'add', a: '9', out: '54', rack: ['add', 'mul', 'div'] }])).toThrow(); // pas de carte juste
  });
});

describe('rewind-belt — le geste', () => {
  it('la caisse ne bouge pas sans carte ; la carte ne se change plus une fois la caisse partie', () => {
    let s = L.init();
    expect(L.canPick(s)).toBe(true);
    s = L.setPos(s, 0.8);
    expect(s.pos).toBe(0);
    expect(s.refusal).toBe('pick');
    s = L.pickCard(s, 'sub');
    s = L.setPos(s, 0.4);
    expect(s.pos).toBe(0.4);
    expect(L.canPick(s)).toBe(false);
    expect(L.pickCard(s, 'add').pick).toBe('sub');
    s = L.setPos(s, 0);
    expect(L.canPick(s)).toBe(true);
  });
  it('la bonne carte : la caisse arrive en entrée avec 45, la contre-épreuve donne 54 et la tâche est faite', () => {
    let s = L.pickCard(L.init(), 'sub');
    expect(M.text(L.crateValue(s))).toBe('54');
    s = L.setPos(s, 0.7);
    expect(M.text(L.crateValue(s))).toBe('45');
    s = L.setPos(s, 1);
    expect(s.phase).toBe('check');
    expect(M.text(s.found)).toBe('45');
    expect(M.text(L.binValue(s))).toBe('45');
    s = L.setPos(s, 0.4);
    expect(M.text(L.crateValue(s))).toBe('54');
    s = L.setPos(s, 0);
    expect(s.phase).toBe('done');
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.map((t) => [t.kind, t.ok])).toEqual([['rewind', true], ['check', true]]);
    expect(L.canNext(s)).toBe(true);
  });
  it('une mauvaise carte n\'est jamais corrigée : la contre-épreuve dit ce qui sort (72 au lieu de 54), puis « جرّب بطاقة أخرى »', () => {
    let s = play(L.init(), 'add', 1, 1);
    expect(s.phase).toBe('check');
    expect(M.text(s.found)).toBe('63');
    s = L.setPos(s, 0);
    expect(s.phase).toBe('miss');
    expect(M.text(s.fwd)).toBe('72');
    expect(s.last).toMatchObject({ kind: 'check', ok: false, model: 'same', found: '63', fwd: '72' });
    expect(L.taskDone(s)).toBe(false);
    expect(L.setPos(s, 1)).toBe(s);
    s = L.retryPick(s);
    expect(s.phase).toBe('rewind');
    expect(s.pick).toBeNull();
    expect(s.tries).toBe(1);
    s = play(s, 'sub');
    expect(L.taskDone(s)).toBe(true);
  });
  it('le piège « a − □ » : « + » donne 134 et −54 (modèle trap) ; « − » bloque le tapis (négatif) ; la bonne carte est « 80 − » ', () => {
    let s = L.init({ tasks: [L.PRESETS.beginner.tasks[3]] });
    let t = L.setPos(L.pickCard(s, 'add'), 1);
    t = L.setPos(t, 0);
    expect(t.last).toMatchObject({ model: 'trap', found: '134', fwd: '-54' });
    const j = L.setPos(L.pickCard(s, 'sub'), 1);
    expect(j.phase).toBe('rewind');
    expect(j.pos).toBeGreaterThan(0.5);
    expect(j.last).toMatchObject({ kind: 'rewind', model: 'neg' });
    expect(L.crateValue(j)).toBeNull();
    s = play(s, 'rsub');
    expect(L.taskDone(s)).toBe(true);
    expect(M.text(s.found)).toBe('26');
  });
  it('un quotient qui ne s\'arrête pas : la caisse porte 20/7 et la contre-épreuve donne 20', () => {
    let s = L.init({ tasks: [L.PRESETS.advanced.tasks[2]] });
    s = L.setPos(L.pickCard(s, 'div'), 1);
    expect(M.text(s.found)).toBe('20/7');
    s = L.setPos(s, 0);
    expect(s.phase).toBe('done');
    expect(M.text(L.taskDone(s) ? s.fwd : null)).toBe('20');
  });
  it('clavier : posBy et finishRun mènent la caisse', () => {
    let s = L.pickCard(L.init(), 'sub');
    s = L.posBy(s, 0.25);
    expect(s.pos).toBe(0.25);
    s = L.finishRun(s);
    expect(s.phase).toBe('check');
    s = L.finishRun(s);
    expect(s.phase).toBe('done');
  });
  it('suite des tâches : next, retry, discoveryReady', () => {
    let s = L.init();
    expect(L.nextTask(s)).toBe(s);
    s = play(s, 'sub');
    s = L.nextTask(s);
    expect(s.ti).toBe(1);
    expect(L.discoveryReady(s)).toBe(false);
    s = L.retryTask(play(s, 'add'));
    expect(L.taskDone(s)).toBe(false);
    let all = L.init();
    for (const k of ['sub', 'add', 'div', 'rsub']) { all = play(all, k); all = L.nextTask(all); }
    expect(L.discoveryReady(all)).toBe(true);
  });
});

describe('rewind-belt — jeu libre et onboarding', () => {
  it('la machine libre : manquant, contre-épreuve, impossible, illisible', () => {
    let s = L.setFree(L.init(), { kind: 'mul', a: '6', b: '54' });
    const info = L.freeInfo(s);
    expect(info.ok).toBe(true);
    expect(M.text(info.x)).toBe('9');
    expect(info.back).toBe('div');
    expect(M.text(info.check)).toBe('54');
    expect(L.freeInfo(L.setFree(s, { kind: 'add', a: '9', b: '5' })).reason).toBe('impossible');
    expect(L.freeInfo(L.setFree(s, { kind: 'mul', a: '0', b: '5' })).reason).toBe('zeroFactor');
    expect(L.freeInfo(L.setFree(s, { a: 'x' })).reason).toBe('unreadable');
    expect(M.text(L.freeInfo(L.setFree(s, { kind: 'mul', a: '7', b: '20' })).x)).toBe('20/7');
    expect(L.freeInfo(L.setFree(s, { kind: 'mul', a: '7', b: '20' })).fraction).toBe(true);
    expect(L.toGuided(s).free).toBeNull();
  });
  it('le coach suit le geste utile', () => {
    let s = L.init();
    expect(L.coachOf(s).id).toBe('card');
    s = L.pickCard(s, 'sub');
    expect(L.coachOf(s).id).toBe('rewind');
    s = L.setPos(s, 1);
    expect(L.coachOf(s).id).toBe('check');
    s = L.setPos(s, 0);
    expect(L.coachOf(s).id).toBe('next');
    const w = L.setPos(L.setPos(L.pickCard(L.init(), 'add'), 1), 0);
    expect(L.coachOf(w).id).toBe('again');
  });
});
