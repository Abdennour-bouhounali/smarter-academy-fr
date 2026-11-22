import { describe, it, expect } from 'vitest';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import * as F from '@smarter-academy/core/arithmetic/fractions2.js';
import * as L from './mooringLines';

const play = (s, qn) => L.lay(L.setQ(s, qn));
const finish = (s) => {
  // joue en cherchant l'encadrement rang par rang (comme un élève méthodique)
  for (let guard = 0; guard < 40 && !L.taskDone(s); guard += 1) {
    if (L.clipLocked(s)) s = L.setUnit(s, 'dm');
    if (L.bracketFound(s)) { s = L.setRank(s, s.w.rank + 1); continue; }
    const t = L.taskOf(s);
    const br = F.decimalQuotientBracket(t.a, t.b, s.w.rank);
    s = play(s, br.lo.n); s = play(s, br.hi.n);
  }
  return s;
};

describe('mooring-lines — les tâches', () => {
  it('r1 : 8 m en 3 — 2|3, 2,6|2,7, 2,66|2,67 ; jamais exact (le reste 0,02 m)', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.dialUnlocked(s, 1)).toBe(false);
    s = play(s, 2); expect(L.measure(s).verdict).toBe('fits');
    s = play(s, 3);
    expect(L.bracketFound(s)).toBe(true);
    expect(s.w.lo).toBe(2); expect(s.w.hi).toBe(3);
    s = L.setRank(s, 1);
    expect(L.window(s)).toEqual({ w0: 20, w1: 30 });
    s = play(s, 26); s = play(s, 27);
    expect(L.bracketFound(s)).toBe(true);
    s = L.setRank(s, 2);
    s = play(s, 266);
    expect(s.last).toMatchObject({ verdict: 'fits', gap: '0,02' });
    s = play(s, 267);
    expect(s.last).toMatchObject({ verdict: 'over', gap: '0,01' });
    expect(L.taskDone(s)).toBe(true);
    expect(L.dialUnlocked(s, 3)).toBe(false);
    expect(s.trials.filter((t) => t.kind === 'solved')[0].exact).toBe(false);
  });
  it('r2 : 9 m en 4 tombe EXACTEMENT sur 2,25 (le rang 0,01 se ferme)', () => {
    let s = L.nextTask(L.nextTask(L.init(L.PRESETS.beginner)));
    s = L.init(L.PRESETS.beginner); s = { ...s, done: { 0: true } }; s = L.nextTask(s);
    expect(L.taskOf(s).id).toBe('r2');
    s = play(s, 2); s = play(s, 3); s = L.setRank(s, 1);
    s = play(s, 22); s = play(s, 23); s = L.setRank(s, 2);
    s = play(s, 225);
    expect(s.last.verdict).toBe('exact');
    expect(L.taskDone(s)).toBe(true);
    expect(L.exactLanded(s)).toBe(true);
  });
  it('le cadran reste fermé tant que l’encadrement n’est pas trouvé', () => {
    let s = L.init(L.PRESETS.beginner);
    s = play(s, 2);
    expect(L.bracketFound(s)).toBe(false);
    expect(L.setRank(s, 1).w.rank).toBe(0);
    expect(L.setRank(s, 2).w.rank).toBe(0);
    s = play(s, 3);
    expect(L.setRank(s, 2).w.rank).toBe(0);   // pas de saut au centimètre
    expect(L.setRank(s, 1).w.rank).toBe(1);
  });
  it('la fenêtre zoome : au rang 1 le curseur reste dans [2,0 ; 3,0]', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setRank(play(play(s, 2), 3), 1);
    expect(L.setQ(s, 99).w.qn).toBe(30);
    expect(L.setQ(s, -5).w.qn).toBe(20);
    expect(L.qText(L.setQ(s, 26))).toBe('2,6');
  });
  it('le reste écrit après la virgule (8 ÷ 3 = 2,2) est nommé et visible : 2,2 laisse 1,4 m', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setRank(play(play(s, 2), 3), 1);
    s = play(s, 22);
    expect(s.last).toMatchObject({ verdict: 'fits', gap: '1,4', model: 'remainderComma' });
  });
  it('« 2,67 = 8/3 » : 3 × 2,67 déborde, le débordement est écrit', () => {
    expect(F.fitsAtRank('8', '3', '2,67')).toMatchObject({ verdict: 'over' });
  });
  it('متقدم : le curseur est verrouillé tant que la corde n’est pas un naturel ; m→dm l’ouvre, q ne change pas', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.clipLocked(s)).toBe(true);
    expect(L.setQ(s, 3).w.qn).toBe(0);
    expect(L.lay(s)).toBe(s);
    s = L.setUnit(s, 'dm');
    expect(L.clipLocked(s)).toBe(false);
    expect(L.tape(s)).toMatchObject({ a: '46', b: '7', unit: 'dm' });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'unit', unit: 'dm', divisorNatural: true });
    s = play(s, 6);
    s = L.setUnit(s, 'cm');
    expect(s.w.qn).toBe(6);
    expect(L.tape(s)).toMatchObject({ a: '460', b: '70' });
    expect(L.clipLocked(s)).toBe(false);
    s = L.setUnit(s, 'm');
    expect(L.clipLocked(s)).toBe(true);
  });
  it('a1 : 4,6 ÷ 0,7 — 6|7, 6,5|6,6, 6,57|6,58 ; a2 : 13,5 ÷ 1,8 = 7,5 exact ; a3 : 5 ÷ 0,6', () => {
    for (const [i, expected] of [[0, ['6,57', '6,58', false]], [1, ['7,5', '7,5', true]], [2, ['8,33', '8,34', false]]]) {
      let s = L.init(L.PRESETS.advanced);
      s = { ...s, ti: i, w: L.init({ tasks: [L.PRESETS.advanced.tasks[i]] }).w };
      s = finish(s);
      expect(L.taskDone(s)).toBe(true);
      const b = s.trials.filter((t) => t.kind === 'bracket').at(-1);
      expect([b.lo, b.hi, b.exact]).toEqual(expected);
    }
  });
  it('balayage : a ∈ {0,1 … 99,9 par pas de 7}, b ∈ 2…12 et décimaux — le verdict suit les produits exacts et l’encadrement est celui du cœur', () => {
    for (let a10 = 1; a10 <= 999; a10 += 7) {
      for (const b of ['2', '3', '5', '7', '12', '0,7', '1,8', '4,5', '9,9']) {
        const kind = b.includes(',') ? 'count' : 'share';
        const a = D.format(D.make(a10, 1));
        let s = L.init({ tasks: [{ id: 'x', kind, a, b, maxRank: 2 }] });
        s = finish(s);
        expect(L.taskDone(s), `${a}/${b}`).toBe(true);
        const br = F.decimalQuotientBracket(a, b, 2);
        const last = s.trials.filter((t) => t.kind === 'bracket').at(-1);
        expect(D.eq(D.parse(last.lo), br.lo), `${a}/${b} ${last.lo}`).toBe(true);
        expect(last.exact).toBe(br.exact || F.decimalQuotientBracket(a, b, 1).exact || F.decimalQuotientBracket(a, b, 0).exact);
      }
    }
  });
});

describe('mooring-lines — jouer librement', () => {
  it('parseA / parseB', () => {
    expect(L.parseA('99,99')).toEqual(D.make(9999, 2));
    expect(L.parseA('0')).toBeNull();
    expect(L.parseA('100')).toBeNull();
    expect(L.parseA('٧٫٥')).toEqual(D.make(75, 1));
    expect(L.parseB('7', 'share')).toEqual(D.make(7, 0));
    expect(L.parseB('1', 'share')).toBeNull();
    expect(L.parseB('13', 'share')).toBeNull();
    expect(L.parseB('0,7', 'count')).toEqual(D.make(7, 1));
    expect(L.parseB('0', 'count')).toBeNull();
    expect(L.parseB('10', 'count')).toBeNull();
    expect(L.parseB('1,8', 'count')).toEqual(D.make(18, 1));
  });
  it('freeTask ouvre une tâche libre (essais `free`), toGuided revient', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.freeTask(s, '10', '7');
    expect(L.isFree(s)).toBe(true);
    s = play(s, 1); expect(s.last.free).toBe(true);
    expect(L.guidedTrials(s)).toHaveLength(0);
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(L.taskOf(s).id).toBe('r1');
  });
});

describe('mooring-lines — coachOf', () => {
  it('suivre le guide mène à la découverte, et ne cible que des commandes', () => {
    for (const lv of ['beginner', 'advanced']) {
      let s = L.init(L.PRESETS[lv]);
      const seen = [];
      for (let i = 0; i < 200; i += 1) {
        const c = L.coachOf(s);
        if (!c) break;
        seen.push(c.id);
        expect(c.target).toMatch(/^\[data-ml-[a-z]+\]$/);
        const t = L.taskOf(s);
        if (c.id === 'unit') s = L.setUnit(s, 'dm');
        else if (c.id === 'clip') s = L.nudge(s, 1);
        else if (c.id === 'dial') s = L.setRank(s, s.w.rank + 1);
        else if (c.id === 'next') s = L.nextTask(s);
        else if (c.id === 'lay') {
          const br = F.decimalQuotientBracket(t.a, t.b, s.w.rank);
          const need = L.bracketFound(s) ? null : (s.w.lo !== br.lo.n && !(s.w.lo === br.lo.n) ? br.lo.n : br.hi.n);
          s = play(s, s.w.lo !== br.lo.n ? br.lo.n : br.hi.n);
          void need;
        } else throw new Error(c.id);
      }
      expect(L.discoveryReady(s), lv).toBe(true);
      expect(L.coachOf(s)).toBeNull();
      expect(seen[0]).toBe(lv === 'advanced' ? 'unit' : 'clip');
    }
  });
});
