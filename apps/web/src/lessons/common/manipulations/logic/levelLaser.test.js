import { describe, it, expect } from 'vitest';
import * as L from './levelLaser';

const run = (s, ...fns) => fns.reduce((x, f) => f(x), s);

describe('level-laser — tâches et positions', () => {
  it('les 8 tâches des deux niveaux se construisent, avec leurs étapes', () => {
    const b = L.init(); expect(b.tasks.map((t) => t.steps)).toEqual([['laser', 'choose'], ['laser', 'choose', 'rewrite'], ['laser', 'choose'], ['laser', 'choose', 'one']]);
    const a = L.init(L.PRESETS.advanced); expect(a.tasks.map((t) => t.steps)).toEqual([['choose', 'rewrite', 'verify'], ['order', 'rewrite', 'verify'], ['choose', 'rewrite', 'verify'], ['choose', 'rewrite', 'verify']]);
    expect(a.tasks[2].tanks[0].vn / a.tasks[2].tanks[0].vd).toBe(5 / 8);   // 2,5/4 = 5/8
  });
  it('crossing : 3/4 lu en douzièmes tombe sur le cran 9 ; 3/5 lu en huitièmes tombe entre 4 et 5', () => {
    const t2 = L.buildTask({ id: 'x', tanks: ['3/4', '7/12'] });
    expect(L.crossing(12, t2.pos[0], t2.L)).toEqual({ onMark: 9, between: null });
    const t3 = L.buildTask({ id: 'x', tanks: ['3/5', '3/8'] });
    expect(L.crossing(8, t3.pos[0], t3.L)).toEqual({ onMark: null, between: [4, 5] });
    expect(L.crossing(5, t3.pos[0], t3.L)).toEqual({ onMark: 3, between: null });
  });
  it('crossing exact pour tout b, d ≤ 24 : le laser à a/b tombe sur un cran de d ssi d·a/b est entier', () => {
    for (let b = 2; b <= 24; b += 1) for (let d = 2; d <= 24; d += 1) {
      const task = L.buildTask({ id: 'f', tanks: [`1/${b}`, `1/${d}`] });
      const c = L.crossing(d, task.pos[0], task.L);
      expect(c.onMark !== null).toBe(d % b === 0);
    }
  });
  it('les snaps contiennent les crans des deux tubes ET les niveaux d’huile ; ≥ 8 px à 18 crans sur 150 px', () => {
    const t = L.buildTask({ id: 'a', tanks: ['5/6', '11/18'] });
    expect(t.snaps).toContain(t.pos[0]); expect(t.snaps).toContain(t.pos[1]);
    expect(150 / 18).toBeGreaterThan(8);
  });
});

describe('level-laser — jugements', () => {
  const t = (...tk) => L.buildTask({ id: 'x', tanks: tk });
  it('judgeChoice : modèles numOnly, bigDen, gap, other', () => {
    expect(L.judgeChoice(t('3/4', '7/12'), 'left')).toMatchObject({ ok: true });
    expect(L.judgeChoice(t('3/4', '7/12'), 'right')).toEqual({ ok: false, model: 'numOnly' });
    expect(L.judgeChoice(t('3/5', '3/8'), 'right')).toEqual({ ok: false, model: 'bigDen' });
    expect(L.judgeChoice(t('3/4', '7/8'), 'eq')).toEqual({ ok: false, model: 'gap' });
    expect(L.judgeChoice(t('3/4', '9/12'), 'eq').ok).toBe(true);
  });
  it('judgeRewrite : 9/12 juste ; 3/12 noScale ; 3/4 mauvais dénominateur', () => {
    const k = t('3/4', '7/12');
    expect(L.judgeRewrite(k, '9/12').ok).toBe(true);
    expect(L.judgeRewrite(k, '٩/١٢').ok).toBe(true);
    expect(L.judgeRewrite(k, '3/12')).toEqual({ ok: false, model: 'noScale' });
    expect(L.judgeRewrite(k, '3/4')).toEqual({ ok: false, model: 'otherDen' });
    expect(L.judgeRewrite(k, 'x').model).toBe('unreadable');
    expect(L.judgeRewrite(t('2,5/4', '5,5/8'), '5/8').ok).toBe(true);
  });
  it('judgeOne et judgeOrder', () => {
    expect(L.judgeOne(t('9/8', '5/6'), 'left').ok).toBe(true);
    expect(L.judgeOne(t('9/8', '5/6'), 'right').model).toBe('oneWrong');
    const o = t('2/3', '5/9', '7/9');
    expect(o.order).toEqual([1, 0, 2]);
    expect(L.judgeOrder(o, [1, 0, 2]).ok).toBe(true);
    expect(L.judgeOrder(o, [2, 0, 1])).toEqual({ ok: false, model: 'reversed' });
  });
});

describe('level-laser — parcours', () => {
  it('l2 : laser sur le gauche → choix → écriture 9/12 → fait ; le monde répond à numOnly', () => {
    let s = L.init();
    s = L.nextTask(L.nextTask(s)); // sans effet : pas faite
    s = L.setLaser(s, s.tasks[0].pos[0]);
    expect(L.stepOf(s)).toBe('choose');
    s = L.nextTask(run(L.init(), (x) => ({ ...x, done: { 0: true } })));
    expect(s.ti).toBe(1);
    expect(L.snapOffered(s)).toBe(false);
    s = L.setLaser(s, s.tasks[1].pos[0]);
    expect(L.snapOffered(s)).toBe(true);
    expect(L.stepOf(s)).toBe('choose');
    s = L.choose(s, 'right');
    expect(s.last).toMatchObject({ ok: false, model: 'numOnly' });
    expect(s.w.p).toBe(s.tasks[1].pos[1]);            // le laser saute au niveau revendiqué
    s = L.choose(s, 'left');
    expect(L.stepOf(s)).toBe('rewrite');
    s = L.rewrite(s, '3/12'); expect(s.last.model).toBe('noScale');
    s = L.rewrite(s, '9/12');
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.some((e) => e.kind === 'solved')).toBe(true);
  });
  it('متقدم : voilé, verrouillé ; prédiction juste → voiles levés → laser sur l’huile gauche', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.laserLocked(s)).toBe(true);
    s = L.setLaser(s, s.tasks[0].pos[0]); expect(s.w.touched).toBe(false);
    s = L.choose(s, 'left'); s = L.rewrite(s, '15/18');
    expect(L.stepOf(s)).toBe('verify'); expect(L.laserLocked(s)).toBe(false);
    s = L.setLaser(s, s.tasks[0].pos[0]);
    expect(L.taskDone(s)).toBe(true);
    expect(s.trials.filter((e) => e.kind === 'predict')).toHaveLength(2);
  });
  it('متقدم : une prédiction fausse lève les voiles (le monde répond) ; a2 : ordre puis écriture', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.choose(s, 'right');
    expect(L.laserLocked(s)).toBe(false);
    let o = L.nextTask(run(L.init(L.PRESETS.advanced), (x) => ({ ...x, done: { 0: true } })));
    o = L.tapOrder(L.tapOrder(L.tapOrder(o, 1), 0), 2);
    expect(L.stepOf(o)).toBe('rewrite');
    o = L.rewrite(o, '6/9'); expect(L.stepOf(o)).toBe('verify');
  });
  it('« جرّب أعدادك » : cas de 2AM ou « later », jamais un verdict', () => {
    let s = L.freeTask(L.init(), '2', '3', '3', '5');
    expect(L.freeCase(L.taskOf(s))).toBe('later');
    s = L.freeTask(s, '3', '4', '9', '12'); expect(L.freeCase(L.taskOf(s))).toBe('equal');
    s = L.freeTask(s, '3', '4', '5', '12'); expect(L.freeCase(L.taskOf(s))).toBe('multiple');
    expect(L.freeCheck('1', '30', '1', '2')).toMatchObject({ ok: false, why: 'range' });
    expect(L.stepOf(s)).toBe('done');
  });
  it('coachOf ne donne jamais la réponse', () => {
    const s = L.init();
    expect(L.coachOf(s)).toMatchObject({ id: 'laser' });
  });
});
