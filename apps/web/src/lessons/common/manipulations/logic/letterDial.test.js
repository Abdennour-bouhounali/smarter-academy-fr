import { describe, it, expect } from 'vitest';
import * as L from './letterDial';
import * as R from '@smarter-academy/core/arithmetic/letterRule.js';

const line = (toks) => toks.map((t) => t.v).join(' ');
const turnTo = (s, l, v) => L.release(L.turn(s, l, v));

describe('letter-dial — tâches', () => {
  it('les préréglages : une seule valeur atteint la demande de `find`, un contre-exemple existe pour `claim`, le départ tient', () => {
    const b = L.normalizeTasks(L.PRESETS.beginner.tasks);
    expect(b.map((t) => t.kind)).toEqual(['set', 'find', 'set']);
    expect(b[1].target.n).toBe(15);
    expect(R.text(R.evaluate(b[0].tree, { n: R.Q(12) }))).toBe('80');
    expect(R.slotCount(b[2].tree, 'n')).toBe(2);
    const a = L.normalizeTasks(L.PRESETS.advanced.tasks);
    expect(a[2].kind).toBe('claim');
    expect(R.compare(a[2].left, a[2].right, { a: R.Q(2), b: R.Q(2) }).eq).toBe(true);
  });
  it('refuse une tâche mal formée', () => {
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'zzz', formula: 'n', dials: { n: { max: 5 } } }])).toThrow();
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'set', formula: '5*n', dials: { n: { max: 5 } }, target: { n: 9 } }])).toThrow(); // hors du cadran
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'find', formula: '5*n', dials: { n: { max: 5 } }, out: '7' }])).toThrow(); // jamais atteinte
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'claim', left: 'a+a', right: '2*a', dials: { a: { max: 5, start: 2 } } }])).toThrow(); // règle vraie : pas de contre-exemple
    expect(() => L.normalizeTasks([{ id: 'x', kind: 'claim', left: 'a+b', right: 'a*b', dials: { a: { max: 5, start: 3 }, b: { max: 5, start: 3 } } }])).toThrow(); // le départ ne tient pas
  });
});

describe('letter-dial — le geste', () => {
  it('b1 : la valeur tombe dans la fente, la carte calcule ; la tâche n\'est faite qu\'au lâcher sur 12', () => {
    let s = L.init();
    expect(line(L.view(s).rows[0])).toBe('5 × 0 + 20');
    s = L.turn(s, 'n', 12);
    expect(L.view(s).rows.map(line)).toEqual(['5 × 12 + 20', '60 + 20', '80']);
    expect(L.taskDone(s)).toBe(false); // pas encore lâché
    s = L.release(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.solved[0].value).toBe('80');
    // figé après la tâche
    expect(L.turn(s, 'n', 3)).toBe(s);
  });
  it('passer par 12 en tournant ne termine pas la tâche', () => {
    let s = L.init();
    s = L.turn(s, 'n', 12);
    s = L.turn(s, 'n', 20);
    s = L.release(s);
    expect(L.taskDone(s)).toBe(false);
    expect(s.last.kind).toBe('rest');
    s = turnTo(s, 'n', 12);
    expect(L.taskDone(s)).toBe(true);
  });
  it('le cadran est borné et entier', () => {
    let s = L.init();
    expect(L.turn(s, 'n', 99).env.n).toBe(30);
    expect(L.turn(s, 'n', -4).env.n).toBe(0);
    expect(L.turn(s, 'n', 7.6).env.n).toBe(8);
    expect(L.turnBy(L.turn(s, 'n', 5), 'n', 1).env.n).toBe(6);
  });
  it('b2 : le client qui a payé 95 : le cadran doit être lâché sur 15', () => {
    let s = L.nextTask(turnTo(L.init(), 'n', 12));
    expect(L.taskOf(s).id).toBe('b2');
    s = turnTo(s, 'n', 14);
    expect(L.view(s).rows.at(-1).map((t) => t.v)).toEqual(['90']);
    expect(L.taskDone(s)).toBe(false);
    s = turnTo(s, 'n', 15);
    expect(L.taskDone(s)).toBe(true);
    expect(s.solved[1].value).toBe('95');
  });
  it('b3 : n tombe dans les DEUX fentes', () => {
    let s = L.init();
    s = L.nextTask(turnTo(s, 'n', 12));
    s = L.nextTask(turnTo(s, 'n', 15));
    s = L.turn(s, 'n', 10);
    expect(L.view(s).rows.map(line)).toEqual(['5 × 10 + 20 − 10', '50 + 20 − 10', '70 − 10', '60']);
    s = L.release(s);
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('a1 : la clôture 2 × (15 + 8) = 46 avec deux cadrans ; a2 : la valeur échangée donne le même périmètre', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.turn(L.turn(s, 'a', 15), 'b', 8);
    expect(L.view(s).rows.map(line)).toEqual(['2 × ( 15 + 8 )', '2 × 23', '46']);
    s = L.nextTask(L.release(s));
    s = L.release(L.turn(L.turn(s, 'a', 8), 'b', 15));
    expect(L.taskDone(s)).toBe(true);
    expect(s.solved[1].value).toBe('46');
  });
  it('a3 : le départ (2, 2) tient (4 = 4) ; un seul contre-exemple termine, avec les deux membres', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.nextTask(L.release(L.turn(L.turn(s, 'a', 15), 'b', 8)));
    s = L.nextTask(L.release(L.turn(L.turn(s, 'a', 8), 'b', 15)));
    expect(L.taskOf(s).id).toBe('a3');
    expect(L.view(s).eq).toBe(true);
    // on bouge mais on retombe sur un cas qui tient : 0 et 0, ou 2 et 2 — pas de contre-exemple
    s = L.release(L.turn(L.turn(s, 'a', 0), 'b', 0));
    expect(L.taskDone(s)).toBe(false);
    expect(s.last.kind).toBe('holds');
    s = L.release(L.turn(L.turn(s, 'a', 3), 'b', 4));
    expect(L.taskDone(s)).toBe(true);
    expect(L.view(s).eq).toBe(false);
    expect(R.text(L.view(s).l)).toBe('7');
    expect(R.text(L.view(s).r)).toBe('12');
    expect(s.solved[2].value).toBe('7|12');
    expect(L.discoveryReady(s)).toBe(true);
  });
  it('« أعد التجربة » rouvre la tâche', () => {
    let s = turnTo(L.init(), 'n', 12);
    s = L.retryTask(s);
    expect(L.taskDone(s)).toBe(false);
    expect(s.env.n).toBe(0);
  });
});

describe('letter-dial — le panneau libre', () => {
  it('« 3n+7 » : la multiplication implicite est lue comme 3 × n', () => {
    let s = L.openFree(L.init());
    expect(L.freeInfo(s).reason).toBe('empty');
    s = L.turn(L.setFree(s, '3n+7'), 'n', 4);
    const i = L.freeInfo(s);
    expect(i.ok).toBe(true);
    expect(line(i.rows[0])).toBe('3 × 4 + 7');
    expect(R.text(i.value)).toBe('19');
    s = L.setFree(s, '2x');
    s = L.turn(s, 'x', 3);
    expect(line(L.freeInfo(s).rows[0])).toBe('2 × 3'); // jamais 23
    expect(R.text(L.freeInfo(s).value)).toBe('6');
  });
  it('refuse ce qui n\'est pas une règle', () => {
    let s = L.openFree(L.init());
    expect(L.freeInfo(L.setFree(s, '')).reason).toBe('empty');
    expect(L.freeInfo(L.setFree(s, '3+')).reason).toBe('unreadable');
    expect(L.freeInfo(L.setFree(s, '3+4')).reason).toBe('noletter');
    expect(L.freeInfo(L.setFree(s, 'a+b+c')).reason).toBe('toomany');
    expect(L.freeInfo(L.setFree(s, 'a / b')).reason).toBe('chars');
  });
  it('« جرّب › العودة » : le retour recommence la tâche', () => {
    const s = L.toGuided(L.openFree(L.init()));
    expect(L.isFree(s)).toBe(false);
  });
});
