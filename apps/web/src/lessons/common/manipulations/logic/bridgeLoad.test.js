import { describe, it, expect } from 'vitest';
import * as L from './bridgeLoad';

const B = () => L.init(L.PRESETS.beginner);
const A = () => L.init(L.PRESETS.advanced);
const bed = (s, x, y = 0) => L.setBed(s, x, y);
const solvedEvents = (s) => s.trials.filter((e) => e.kind === 'solved');

describe('bridge-load — la pesée est exacte (equation2 E3)', () => {
  it('b1 : 15 → 4750 < 5000 ; 22 → 5100 ; 20 → 5000 n’est PAS « < »', () => {
    const t = L.buildTask(L.PRESETS.beginner.tasks[0]);
    const r15 = L.weighAt(t, 15);
    expect(r15).toMatchObject({ holds: true, left: 4750, right: 5000 });
    expect(r15.lines).toEqual({ a: '4000 + 50 × 15 = 4750', b: '5000 = 5000', cmp: '4750 < 5000' });
    expect(L.weighAt(t, 22)).toMatchObject({ holds: false, left: 5100 });
    expect(L.weighAt(t, 20)).toMatchObject({ holds: false, left: 5000 });
    expect(L.weighAt(t, 20).lines.cmp).toBe('5000 < 5000');
    expect(t.pass).toEqual([true, true, false, false]);
    expect(t.empty).toBe(4000);
    expect(t.kgX).toBe(50);
    expect(t.limit).toBe(5000);
    expect(t.lanes).toBe(false);
  });
  it('b2 : (20,30) 6700 ✓ ; (30,25) 7000 ✗ ; (25,35) 7150 ✗ ; l’ordre des deux compteurs compte', () => {
    const t = L.buildTask(L.PRESETS.beginner.tasks[1]);
    expect(t.twoUnknowns).toBe(true);
    expect(L.weighAt(t, 20, 30)).toMatchObject({ holds: true, left: 6700 });
    expect(L.weighAt(t, 30, 25)).toMatchObject({ holds: false, left: 7000 });
    expect(L.weighAt(t, 30, 25).lines.a).toBe('4500 + 50 × 30 + 40 × 25 = 7000');
    expect(L.weighAt(t, 25, 35)).toMatchObject({ holds: false, left: 7150 });
    expect(L.weighAt(t, 30, 20).lines.a).toBe('4500 + 50 × 30 + 40 × 20 = 6800');   // 20 et 30 échangés : une autre ligne
    expect(t.loadsHold).toEqual([true, false, false]);
  });
  it('b3 : deux voies, UNE charge ; égales seulement pour 30 (5100 = 5100)', () => {
    const t = L.buildTask(L.PRESETS.beginner.tasks[2]);
    expect(t.lanes).toBe(true);
    expect(t.laneInfo.map((l) => [l.empty, l.kg])).toEqual([[3000, 70], [3600, 50]]);
    expect(L.weighAt(t, 20)).toMatchObject({ holds: false, left: 4400, right: 4600 });
    expect(L.weighAt(t, 30)).toMatchObject({ holds: true, left: 5100, right: 5100 });
    expect(L.weighAt(t, 30).lines).toEqual({ a: '3000 + 70 × 30 = 5100', b: '3600 + 50 × 30 = 5100', cmp: '5100 = 5100' });
    expect(L.weighAt(t, 40)).toMatchObject({ holds: false, left: 5800, right: 5600 });
    expect(t.loadsHold).toEqual([false, true, false]);
    for (let x = 0; x <= 60; x += 1) expect(L.weighAt(t, x).holds, `x=${x}`).toBe(x === 30);
  });
  it('a1 : A < B vraie jusqu’à 29, réfutée dès 30 (31 : 5170 > 5150) ; a2 : réfutée partout sauf 10', () => {
    const [a1, a2, a3] = L.PRESETS.advanced.tasks.map(L.buildTask);
    const c1 = L.counterexamples(a1);
    expect(c1).toEqual(Array.from({ length: 31 }, (_, i) => 30 + i));
    expect(L.weighAt(a1, 31)).toMatchObject({ holds: false, left: 5170, right: 5150 });
    expect(L.weighAt(a1, 20).holds).toBe(true);
    const c2 = L.counterexamples(a2);
    expect(c2).toHaveLength(60);
    expect(c2).not.toContain(10);
    expect(L.weighAt(a2, 10)).toMatchObject({ holds: true, left: 3000, right: 3000 });
    expect(L.weighAt(a2, 0)).toMatchObject({ holds: false, left: 2000, right: 2400 });
    expect(a3.rel).toBe('≤');
    expect(a3.pass).toEqual([true, true, false, true]);
    expect(L.weighAt(a3, 30, 25)).toMatchObject({ holds: true, left: 7000 });
    expect(L.weighAt(a3, 40, 15)).toMatchObject({ holds: false, left: 7100 });
    expect(L.weighAt(a3, 10, 40).left).toBe(6600);
    expect(L.weighAt(a3, 25, 30).left).toBe(6950);
  });
  it('K1_TASK : la règle de b1 et une première pesée à x = 12 (4600 < 5000)', () => {
    const t = L.buildTask(L.K1_TASK);
    expect(t.loads).toEqual([{ x: 12, y: 0 }]);
    expect(L.weighAt(t, 12).lines.cmp).toBe('4600 < 5000');
    expect(L.init({ tasks: [L.K1_TASK] }).tasks).toHaveLength(1);
  });
  it('refuse une charge hors 0 … 60 et une affirmation sans contre-exemple', () => {
    expect(() => L.buildTask({ id: 'z', rule: '4000+50x<5000', loads: [61] })).toThrow();
    expect(() => L.buildTask({ id: 'z', rule: '4000+50x<5000' })).toThrow();
    expect(() => L.buildTask({ id: 'z', kind: 'claim', rule: '2x+4=2x+4' })).toThrow();
  });
});

describe('bridge-load — مبتدئ : charger, peser, répondre AVANT la barrière', () => {
  it('b1 : charger 15, peser, la ligne s’écrit, le verdict juste ouvre la charge suivante', () => {
    let s = B();
    expect(s.w.phase).toBe('bed');
    s = bed(s, 15);
    expect(L.bedOf(s)).toEqual({ x: 15, y: 0 });
    s = L.pressWeigh(s);
    expect(s.w.phase).toBe('ask');
    expect(s.w.screen).toMatchObject({ x: 15, holds: true, on: true });
    expect(s.w.judged).toBe(false);
    s = L.judgeVerdict(s, false);                       // un « non » sur une charge qui passe : refusé, la vérité est DESSINÉE
    expect(s.w.judged).toBe(true);
    expect(s.w.phase).toBe('ask');
    expect(s.trials.at(-1)).toMatchObject({ kind: 'verdict', answer: false, ok: false });
    s = L.judgeVerdict(s, true);
    expect(s.w.phase).toBe('ok');
    expect(s.trials.at(-1)).toMatchObject({ kind: 'verdict', answer: true, ok: true });
    s = L.nextLoad(s);
    expect(s.w).toMatchObject({ k: 1, phase: 'bed', x: 0, screen: null });
  });
  it('peser une autre charge que celle demandée : l’écran dit la vérité mais la question ne s’ouvre pas', () => {
    let s = bed(B(), 16);
    s = L.pressWeigh(s);
    expect(s.w.phase).toBe('bed');
    expect(s.w.screen).toMatchObject({ x: 16, on: false, holds: true });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'weigh', task: 0, x: 16, holds: true });
  });
  it('b1 complet : 15 ✓, 22 ✗, puis les cartes 18, 19, 20, 21 — seules 18 et 19 passent', () => {
    let s = B();
    s = L.judgeVerdict(L.pressWeigh(bed(s, 15)), true);
    s = L.nextLoad(s);
    s = L.pressWeigh(bed(s, 22));
    expect(s.w.screen.holds).toBe(false);
    s = L.judgeVerdict(s, true);                        // « تعبر » avec 5100 : refusé
    expect(s.w).toMatchObject({ judged: true, phase: 'ask' });
    expect(s.w.miss).toMatchObject({ verdict: true });
    s = L.judgeVerdict(s, false);
    expect(s.w.phase).toBe('ok');
    expect(L.afterOk(s)).toBe('cards');
    s = L.nextLoad(s);
    expect(s.w.phase).toBe('cards');
    s = L.dropCard(s, 2);                               // 20 sacs : la ligne écrit 5000 < 5000
    expect(s.w.screen.lines.cmp).toBe('5000 < 5000');
    expect(s.w.phase).toBe('cards');
    s = L.toggleCard(L.toggleCard(L.toggleCard(s, 0), 1), 2);   // 20 coché à tort
    s = L.checkCards(s);
    expect(s.w.phase).toBe('cards');
    expect(s.w.miss.cards).toMatchObject({ ok: false, wrong: [2], missing: [] });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'cards', ticked: [0, 1, 2], ok: false });
    s = L.checkCards(L.toggleCard(s, 2));
    expect(s.trials.at(-2)).toMatchObject({ kind: 'cards', ticked: [0, 1], ok: true });
    expect(s.w.phase).toBe('done');
    expect(L.taskDone(s)).toBe(true);
    expect(solvedEvents(s)).toEqual([{ kind: 'solved', task: 0, free: false }]);
  });
  it('cocher seulement 18 : il manque 19', () => {
    expect(L.judgeCards(L.buildTask(L.PRESETS.beginner.tasks[0]), [0])).toEqual({ ok: false, wrong: [], missing: [1] });
  });
  it('b2 : l’échange (30, 20) au lieu de (20, 30) montre une AUTRE ligne, signalée `swap`', () => {
    let s = { ...B(), ti: 1, w: undefined };
    s = L.nextTask({ ...L.judgeVerdict(L.pressWeigh(bed(B(), 15)), true) });   // sans effet : la tâche n'est pas finie
    expect(s.ti).toBe(0);
    s = L.restartTask({ ...B(), ti: 1, w: { ...L.init(L.PRESETS.beginner).w } });
    s = L.pressWeigh(bed(s, 30, 20));
    expect(s.w.screen).toMatchObject({ swap: true, on: false, left: 6800 });
    s = L.pressWeigh(bed(s, 20, 30));
    expect(s.w.screen).toMatchObject({ swap: false, on: true, left: 6700, holds: true });
    expect(s.w.phase).toBe('ask');
  });
  it('b3 : trois charges, le « oui » à 30 seulement ; la tâche se termine au dernier verdict', () => {
    let s = { ...B(), ti: 2 };
    s = { ...s, w: { x: 0, y: 0, k: 0, phase: 'bed', screen: null, pending: null, judged: false, picked: [], miss: null, cw: 0 } };
    for (const [x, ans] of [[20, false], [30, true], [40, false]]) {
      s = L.judgeVerdict(L.pressWeigh(bed(s, x)), ans);
      if (x !== 40) s = L.nextLoad(s);
    }
    expect(L.taskDone(s)).toBe(true);
    expect(solvedEvents(s)).toEqual([{ kind: 'solved', task: 2, free: false }]);
  });
  it('les sacs : bornes 0 … 60, le sable seulement aux tâches à deux inconnues, pas de geste une fois la tâche faite', () => {
    let s = B();
    s = L.load(s, 'y', 5);
    expect(L.bedOf(s)).toEqual({ x: 0, y: 0 });         // b1 n'a pas de sable
    s = L.load(L.load(s, 'x', -1), 'x', 100);
    expect(L.bedOf(s).x).toBe(60);
    s = L.load(s, 'x', -5);
    expect(L.bedOf(s).x).toBe(55);
    const b2 = { ...L.init(L.PRESETS.beginner), ti: 1 };
    expect(L.bedOf(L.load(b2, 'y', 5)).y).toBe(5);
  });
  it('charger de nouveau efface l’écran : une autre charge, une autre pesée', () => {
    let s = L.pressWeigh(bed(B(), 15));
    expect(s.w.screen).toBeTruthy();
    s = L.load(s, 'x', 1);
    expect(s.w.screen).toBe(null);
    expect(s.w.phase).toBe('bed');
  });
  it('les événements ont les formes promises', () => {
    let s = L.judgeVerdict(L.pressWeigh(bed(B(), 15)), true);
    expect(s.trials).toEqual([
      { kind: 'weigh', task: 0, x: 15, y: 0, holds: true, free: false },
      { kind: 'verdict', task: 0, answer: true, ok: true, free: false },
    ]);
  });
});

describe('bridge-load — متقدم : prédire, puis UNE charge qui réfute', () => {
  it('a1 : l’écran est masqué jusqu’à la prédiction ; une prédiction fausse est confrontée à la vraie ligne', () => {
    let s = A();
    expect(s.w.phase).toBe('bed');
    s = L.pressWeigh(bed(s, 31));
    expect(s.w.phase).toBe('predict');
    expect(s.w.screen).toBe(null);
    expect(L.predict(s, '', '').w.miss).toEqual({ unreadable: true });
    const wrong = L.predict(s, '5170', '5000');
    expect(wrong.trials.at(-1)).toMatchObject({ kind: 'predict', ok: false, a: 5170, b: 5000 });
    expect(wrong.w.screen).toMatchObject({ left: 5170, right: 5150, predicted: { ok: false } });
    s = L.predict(s, '٥١٧٠', '5150');                    // chiffres arabes acceptés
    expect(s.w.screen).toMatchObject({ x: 31, holds: false, predicted: { ok: true } });
    expect(s.w.phase).toBe('bed');
    s = L.pressCounter(s);
    expect(s.trials.at(-2)).toMatchObject({ kind: 'counter', task: 0, x: 31, ok: true });
    expect(s.w.phase).toBe('done');
    expect(solvedEvents(s)).toEqual([{ kind: 'solved', task: 0, free: false }]);
  });
  it('a1 : « une charge qui VÉRIFIE l’affirmation » est refusée (20 : 4400 < 4600)', () => {
    let s = L.predict(L.pressWeigh(bed(A(), 20)), '4400', '4600');
    expect(L.judgeCounter(s)).toEqual({ ok: false, weighed: true });
    s = L.pressCounter(s);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'counter', x: 20, ok: false });
    expect(s.w.miss).toEqual({ agrees: true });
    expect(s.w.phase).toBe('bed');
    expect(L.taskDone(s)).toBe(false);
  });
  it('a1 : sans pesée, rien à juger', () => {
    const s = A();
    expect(L.judgeCounter(s)).toEqual({ ok: false, weighed: false });
    expect(L.pressCounter(s)).toBe(s);
  });
  it('a2 : toute charge ≠ 10 réfute, 10 la confirme ; x = 0 réfute', () => {
    const base = { ...A(), ti: 1 };
    let s = { ...base, w: { x: 0, y: 0, k: 0, phase: 'bed', screen: null, pending: null, judged: false, picked: [], miss: null, cw: 0 } };
    const ten = L.predict(L.pressWeigh(bed(s, 10)), '3000', '3000');
    expect(L.judgeCounter(ten).ok).toBe(false);
    s = L.predict(L.pressWeigh(bed(s, 0)), '2000', '2400');
    expect(L.pressCounter(s).trials.at(-2)).toMatchObject({ kind: 'counter', task: 1, x: 0, ok: true });
  });
  it('a3 : cartes (10,40) (30,25) (40,15) (25,30) ; « ≤ » laisse passer 7000', () => {
    let s = { ...A(), ti: 2 };
    s = { ...s, w: { x: 0, y: 0, k: 0, phase: 'cards', screen: null, pending: null, judged: false, picked: [], miss: null, cw: 0 } };
    s = L.dropCard(s, 1);
    expect(s.w.screen).toMatchObject({ x: 30, y: 25, left: 7000, holds: true });
    s = L.dropCard(s, 2);
    expect(s.w.screen).toMatchObject({ left: 7100, holds: false });
    s = L.checkCards(L.toggleCard(L.toggleCard(s, 0), 1));          // il manque (25, 30)
    expect(s.w.miss.cards).toMatchObject({ ok: false, wrong: [], missing: [3] });
    s = L.checkCards(L.toggleCard(s, 3));
    expect(s.trials.at(-2)).toMatchObject({ kind: 'cards', ticked: [0, 1, 3], ok: true });
    expect(solvedEvents(s)).toEqual([{ kind: 'solved', task: 2, free: false }]);
    expect(L.discoveryReady(s)).toBe(false);
  });
});

describe('bridge-load — « جرّب أعدادك » (jamais compté) et le reste', () => {
  it('libre : règle et nombres libres, la pesée écrit tout de suite, aucun événement n’est « solved »', () => {
    let s = L.freeTask(B());
    expect(s.trials.at(-1)).toEqual({ kind: 'custom', free: true });
    expect(L.freeRule(s.free)).toBe('4000+50x+40y<7000');
    s = L.setFree(s, { sign: '≤', s: 5000, x: 20, y: 0 });
    expect(L.freeRule(s.free)).toBe('4000+50x+40y<=5000');
    s = L.pressWeigh(s);                                  // x = 20 : 4000 + 1000 = 5000 ≤ 5000
    expect(s.free.screen).toMatchObject({ holds: true, left: 5000 });
    s = L.setFree(s, { sign: '<' });
    expect(s.free.screen).toBe(null);
    expect(L.pressWeigh(s).free.screen.holds).toBe(false);
    expect(s.trials.some((e) => e.kind === 'solved')).toBe(false);
    expect(L.pressWeigh(s).trials.at(-1)).toMatchObject({ kind: 'weigh', task: -1, free: true });
    const back = L.toGuided(s);
    expect(back.free).toBe(null);
    expect(L.setFree(s, { e: 99999, a: 3, s: 1 }).free).toMatchObject({ e: 9000, a: 10, s: 500 });
  });
  it('Formal : les nombres de l’élève, comme dans le cahier', () => {
    const [b1, , b3] = L.PRESETS.beginner.tasks.map(L.buildTask);
    expect(L.formalLines(b1)[0].tex).toBe('4000+50\\times15=4750\\quad 4750<5000');
    expect(L.formalLines(b3)[0]).toMatchObject({ tex: '3000+70\\times30=5100\\quad 3600+50\\times30=5100', x: 30 });
    const a2 = L.buildTask(L.PRESETS.advanced.tasks[1]);
    expect(L.formalLines(a2)[0].tex).toBe('2000+100\\times0=2000\\quad 2400+60\\times0=2400');
    const a3 = L.buildTask(L.PRESETS.advanced.tasks[2]);
    expect(L.formalLines(a3)[0].tex).toBe('4500+50\\times10+40\\times40=6600\\quad 6600\\le7000');
  });
  it('coachOf : charger → peser → lire l’écran ; rien une fois libre', () => {
    let s = B();
    expect(L.coachOf(s).id).toBe('load');
    s = bed(s, 15);
    expect(L.coachOf(s).id).toBe('weigh');
    s = L.pressWeigh(s);
    expect(L.coachOf(s).id).toBe('screen');
    expect(L.coachOf(L.freeTask(s))).toBe(null);
    expect(L.coachOf({ ...A(), ti: 0 }).id).toBe('twin');
  });
  it('un sans-faute : toutes les tâches faites → découverte prête ; « التالي » seulement entre deux tâches', () => {
    const s = { ...B(), done: { 0: true, 1: true, 2: true }, ti: 2 };
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.canNext(s)).toBe(false);
    expect(L.canNext({ ...s, ti: 1 })).toBe(true);
    expect(L.levelOf(B())).toBe('beginner');
    expect(L.levelOf(A())).toBe('advanced');
  });
});
