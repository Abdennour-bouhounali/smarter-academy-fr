import { describe, it, expect } from 'vitest';
import * as L from './kitPacker';

const play = (s, ...fns) => fns.reduce((x, f) => f(x), s);
const dials = (n, m) => (s) => L.setDial(L.setDial(s, 'n', n), 'm', m);

describe('kit-packer — le tapis distribue un par cartable', () => {
  it('deal : parts égales à une unité près, dans l\'ordre', () => {
    expect(L.deal(18, 6)).toEqual([3, 3, 3, 3, 3, 3]);
    expect(L.deal(3, 6)).toEqual([1, 1, 1, 0, 0, 0]);
    expect(L.deal(20, 6)).toEqual([4, 4, 3, 3, 3, 3]);
    expect(L.deal(20, 6).reduce((a, b) => a + b, 0)).toBe(20);
  });
  it('k1 : 18 cahiers et 12 stylos remplissent les 6 cartables ; les deux compteurs s\'allument à 30', () => {
    let s = play(L.init(L.PRESETS.beginner), dials(18, 12), L.dealNow);
    expect(L.taskDone(s)).toBe(true);
    expect(s.flash.ok).toBe(true);
    const c = L.counters(L.taskOf(s), s);
    expect([c.kitValue, c.handValue]).toEqual(['30', '30']);
    expect(c.kit).toBe('6 × (3 + 2)');
    expect(s.trials.map((e) => e.tk)).toEqual(['deal', 'solved']);
  });
  it('trop peu, trop ; k ne divise pas : le refus nomme ce que l\'œil voit', () => {
    const base = L.init(L.PRESETS.beginner);
    const r = (n, m) => L.dealNow(play(base, dials(n, m)));
    expect(r(3, 12).flash.reason).toBe('unequal'); expect(r(3, 12).flash.j.sa.empty).toBe(3);
    expect(r(12, 12).flash.reason).toBe('short');
    expect(r(24, 12).flash.reason).toBe('extra');
    expect(r(20, 10).flash.reason).toBe('unequal');
    expect(L.counters(L.taskOf(r(20, 10)), r(20, 10)).handValue).toBe('30'); // deux compteurs égaux ne suffisent pas
    expect(L.taskDone(r(20, 10))).toBe(false);
    expect(r(20, 10).trials.at(-1)).toMatchObject({ tk: 'refused', reason: 'unequal' });
  });
  it('k3 : 70 paquets − 14 abîmés = 56 ; 2 abîmés seulement donne des cartables inégaux', () => {
    let s = L.nextTask(play(L.nextTask(play(L.init(L.PRESETS.beginner), dials(18, 12), L.dealNow)), dials(32, 40), L.dealNow));
    expect(L.taskOf(s).id).toBe('k3');
    expect(L.dealNow(play(s, dials(70, 2))).flash.reason).toBe('unequal'); // 68 cahiers pour 7 cartables : 9 et 10
    expect(L.dealNow(play(s, dials(70, 0))).flash.reason).toBe('extra'); // 70 pour 7 : 10 chacun, 8 voulus
    expect(L.dealNow(play(s, dials(70, 7))).flash.reason).toBe('extra');
    const ok = L.dealNow(play(s, dials(70, 14)));
    expect(L.taskDone(ok)).toBe(true);
    expect(L.counters(L.taskOf(ok), ok).handValue).toBe('56');
    expect(L.judge(L.taskOf(s), { ...s, n: 56, m: 0 }).reason).toBe('pack');
  });
  it('k4 : distributeurs verrouillés, seul k = 12 convient', () => {
    const s = { ...L.init({ tasks: [L.PRESETS.beginner.tasks[3]] }) };
    const t = L.taskOf(s);
    for (const k of [10, 6, 15, 4]) expect(L.judge(t, { ...s, k }).ok, String(k)).toBe(false);
        expect(L.judge(t, { ...s, k: 10 }).sb.reason).toBe('unequal');
    const done = L.dealNow(L.setBags(s, 12));
    expect(L.taskDone(done)).toBe(true);
    expect(L.counters(t, done).kit).toBe('12 × (5 + 3)');
    expect(L.counters(t, done).kitValue).toBe('96');
    expect(L.setBags(done, 3).k).toBe(12);
  });
  it('متقدم : la prédiction ouvre les distributeurs ; a3 part de la commande du camarade (24 et 3)', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.predictOpen(s)).toBe(true);
    expect(L.canDeal(s)).toBe(false);
    s = L.nextTask({ ...s, done: { 0: true } });
    expect(L.taskOf(s).id).toBe('a2');
    expect(L.predictOpen(s)).toBe(true);
    s = L.lockPredict(L.setPredict(s, '30'));
    expect(s.trials.at(-1)).toMatchObject({ tk: 'predict', ok: true, total: '30' });
    const ok = L.dealNow(play(s, dials(18, 12)));
    expect(L.taskDone(ok)).toBe(true); // rubans en mètres : 18 / 15 = 1,2 par cartable
    expect(L.dealNow(play(s, dials(17, 12))).flash.reason).toBe('short');
    let a3 = L.nextTask({ ...ok });
    expect([a3.n, a3.m]).toEqual([24, 3]);
    a3 = L.lockPredict(L.setPredict(a3, '27'));
    expect(a3.trials.at(-1).ok).toBe(false);
    const bad = L.dealNow(a3);
    expect(bad.flash.reason).toBe('unequal'); expect(bad.flash.j.sb.empty).toBe(3);
    expect(L.taskDone(L.dealNow(L.setDial(bad, 'm', 18)))).toBe(true);
  });
  it('a1 : 48 = 50 − 2 ou 40 + 8, pas 50 − 3', () => {
    let s = L.lockPredict(L.setPredict(L.init(L.PRESETS.advanced), '432'));
    expect(s.trials[0].ok).toBe(true);
    s = L.setSplit(s, { p: 50, q: 3, sop: '−' });
    expect(L.dealNow(s).flash.reason).toBe('split');
    s = L.setSplit(s, { p: 50, q: 2, sop: '−' });
    const d = L.dealNow(s);
    expect(L.taskDone(d)).toBe(true);
    expect(L.counters(L.taskOf(d), d)).toMatchObject({ hand: '450 − 18', handValue: '432' });
    expect(L.taskDone(L.dealNow(L.setSplit(s, { p: 40, q: 8, sop: '+' })))).toBe(true);
  });
  it('« جرّب أعدادك » : limites, différence ordonnée, valeurs de chOps', () => {
    expect(L.freeRead({ k: 5, a: 6, b: 4 })).toMatchObject({ ok: true, kit: '5 × (6 + 4)', split: '5 × 6 + 5 × 4', value: '50' });
    expect(L.freeRead({ k: 13, a: 1, b: 1 }).why).toBe('limit');
    expect(L.freeRead({ k: 3, a: 2, b: 5, op: '−' }).why).toBe('order');
    expect(L.freeRead({ k: 7, a: 9, b: 2, op: '−' }).value).toBe('49');
  });
  it('coach : prédiction, cadran, deuxième cadran, distribuer, puis libre', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.coachOf(s).id).toBe('dial');
    s = L.setDial(s, 'n', 18); expect(L.coachOf(s).id).toBe('dial2');
    s = L.setDial(s, 'm', 12); expect(L.coachOf(s).id).toBe('deal');
    s = L.dealNow(s); expect(L.coachOf(s)).toBeNull();
    expect(L.coachOf(L.init(L.PRESETS.advanced)).id).toBe('predict');
  });
});
