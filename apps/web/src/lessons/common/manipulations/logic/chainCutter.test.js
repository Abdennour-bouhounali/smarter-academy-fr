import { describe, it, expect } from 'vitest';
import * as L from './chainCutter';

const run = (s, ...fns) => fns.reduce((a, f) => f(a), s);
const NUM = { tasks: L.PRESETS.beginner.tasks };

describe('chain-cutter — logique', () => {
  it('c1 : sans « ثبّت » on ne coupe pas ; la coupe à + réussit, celle à × mord une agrafe (55 ≠ 27)', () => {
    let s = L.init(NUM);
    expect(L.cut(s, 0)).toBe(s);
    s = L.pin(s);
    expect(L.staplesShown(s)).toBe(true);
    const bad = L.cut(s, 1);
    expect(bad.flash).toMatchObject({ ok: false, reason: 'staple', rebuilt: '55', same: false });
    expect(bad.trials.map((e) => e.tk)).toEqual(['cut', 'refused']);
    const good = L.cut(bad, 0);
    expect(good.flash.ok).toBe(true);
    expect(good.cells[''].cut).toMatchObject({ o: '+', left: '7', right: '4 × 5' });
    expect(L.isNumberCell(good.cells.l)).toBe(true);
  });
  it('le nom : un mauvais autocollant glisse, le bon se colle et termine une tâche `root`', () => {
    let s = run(L.init(NUM), L.pin, (x) => L.cut(x, 0));
    const wrong = L.stick(s, 'جداء');
    expect(wrong.flash).toMatchObject({ ok: false, reason: 'name' });
    expect(L.taskDone(wrong)).toBe(false);
    const ok = L.stick(wrong, 'مجموع');
    expect(L.taskDone(ok)).toBe(true);
    expect(ok.trials.at(-1)).toMatchObject({ tk: 'solved', task: 'c1' });
    expect(L.canNext(ok)).toBe(true);
  });
  it('c6 : la même valeur par hasard est quand même refusée', () => {
    const s = L.pin(L.init({ tasks: NUM.tasks.slice(5) }));
    expect(L.cut(s, 0).flash).toMatchObject({ ok: false, same: true, rebuilt: '22' });
    expect(L.cut(s, 1).flash.ok).toBe(true);
  });
  it('c5 (full) : trois niveaux à couper et nommer, la phrase grandit puis est complète', () => {
    let s = L.pin(L.init({ tasks: NUM.tasks.slice(4) }));
    s = run(s, (x) => L.cut(x, 2), (x) => L.stick(x, 'مجموع'));
    expect(L.taskDone(s)).toBe(false);
    expect(L.sentenceOf(s)).toBe('مجموع …');
    expect(s.focus).toBe('l');
    s = run(s, (x) => L.cut(x, 0), (x) => L.stick(x, 'جداء'));
    expect(s.focus).toBe('lr');
    s = run(s, (x) => L.cut(x, 0), (x) => L.stick(x, 'فرق'));
    expect(L.taskDone(s)).toBe(true);
    expect(L.sentenceOf(s)).toBe('مجموع جداء العدد 6 وفرق العددين 9 و 2 ، والعدد 5');
  });
  it('متقدم a1 : agrafes cachées jusqu\'à la première coupe', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.staplesShown(s)).toBe(false);
    s = L.cut(L.selectOp(s, 1), 1);
    expect(L.staplesShown(s)).toBe(true);
    expect(s.flash.ok).toBe(false);
  });
  it('collage a3 : sans agrafe-parenthèse la chaîne est un « مجموع » et refusée ; avec, elle est acceptée', () => {
    const s = L.init({ tasks: L.PRESETS.advanced.tasks.slice(2) });
    const step = (x, a, b, op, cl = false) => L.glue({ ...x, pick: [a, b], op, clipL: cl });
    let bad = step(step(s, 'n0', 'n1', '+'), 'g1', 'n2', '÷');
    expect(bad.flash).toMatchObject({ ok: false, reason: 'glue', name: 'مجموع', got: '17,25' });
    expect(L.canUndo(bad)).toBe(true);
    let good = step(step(s, 'n0', 'n1', '+'), 'g1', 'n2', '÷', true);
    expect(L.taskDone(good)).toBe(true);
    expect(good.flash.value).toBe('6');
  });
  it('a4 exige deux agrafes', () => {
    let s = L.init({ tasks: L.PRESETS.advanced.tasks.slice(3) });
    const g = (x, a, b, op, l = false, r = false) => L.glue({ ...x, pick: [a, b], op, clipL: l, clipR: r });
    s = g(g(g(s, 'n0', 'n1', '+'), 'n2', 'n3', '−'), 'g1', 'g2', '×', true, true);
    expect(L.taskDone(s)).toBe(true);
  });
  it('freeRead : refuse le vide, le long, la syntaxe, le négatif ; décrit le reste', () => {
    expect(L.freeRead('').why).toBe('empty');
    expect(L.freeRead('1 + 2 + 3 + 4 + 5 + 6 + 7 + 8').why).toBe('long');
    expect(L.freeRead('3 +').why).toBe('syntax');
    expect(L.freeRead('2 × 5 − 12').why).toBe('negative');
    expect(L.freeRead('4 × (9 + 6)')).toMatchObject({ ok: true, name: 'جداء', value: '60', sentence: 'جداء العدد 4 ومجموع العددين 9 و 6' });
  });
  it('coachOf ne montre jamais la racine', () => {
    const s = L.init(NUM);
    expect(L.coachOf(s).id).toBe('pin');
    expect(L.coachOf(L.pin(s))).toMatchObject({ id: 'cut' });
  });
});
