import { describe, it, expect } from 'vitest';
import * as D from '@smarter-academy/core/arithmetic/decimals.js';
import * as L from './rulerCompare';
import { LEVELS } from '../levels';

const B = LEVELS['ruler-compare'].beginner.numbers;
const A = LEVELS['ruler-compare'].advanced.numbers;

const ruler = (s, g) => L.setRuler(s, g);

describe('ruler-compare — compare tasks', () => {
  it('each preset compare task is solvable, and its first deciding graduation is the documented one', () => {
    const want = [1, 1, 1, 0]; // 4,6/4,35 dm · 8,05/8,5 dm · 12,70/12,7 equal from dm · 9,87/10,2 m
    const verdicts = ['>', '<', '=', '<'];
    B.tasks.forEach((raw, i) => {
      const t = L.normalizeTask(raw);
      expect(t.minG, raw.a).toBe(want[i]);
      expect(t.verdict).toBe(verdicts[i]);
      let s = L.init({ tasks: [raw] });
      for (let g = 0; g < t.minG; g += 1) expect(L.decidedNow(ruler(s, g)), `${raw.a}@${g}`).toBe(false);
      s = ruler(s, t.minG);
      expect(L.decidedNow(s)).toBe(true);
      s = L.verdict(s, t.verdict);
      expect(L.taskDone(s)).toBe(true);
      expect(s.solved[0].g).toBe(t.minG);
    });
  });

  it('the verdict is REFUSED while the ruler cannot separate (and never judged), and the refusal is a trial with ok null', () => {
    let s = L.init({ tasks: [{ kind: 'compare', a: '4,6', b: '4,35' }] });
    for (const sym of ['<', '=', '>']) {
      const t = L.verdict(s, sym);
      expect(L.taskDone(t)).toBe(false);
      expect(t.last).toMatchObject({ event: 'verdict', ok: null, decided: false, refused: 'coarse', g: 0 });
    }
    s = L.verdict(s, '>');
    expect(L.guidedTrials(s)).toHaveLength(1);
    expect(L.trialEvidence(s.trials[0])).toMatchObject({ task: 0, kind: 'compare', event: 'verdict', a: '4,6', b: '4,35', verdict: '>', ok: null, decided: false, free: false, refused: 'coarse' });
  });

  it('a wrong verdict on a deciding ruler is refuted with the readings; a right one solves', () => {
    let s = ruler(L.init({ tasks: [{ kind: 'compare', a: '4,6', b: '4,35' }] }), 2);
    s = L.verdict(s, '<');
    expect(s.last).toMatchObject({ ok: false, decided: true, g: 2, counts: [460, 435] });
    expect(L.taskDone(s)).toBe(false);
    s = L.verdict(s, '>');
    expect(s.last).toMatchObject({ ok: true, g: 2 });
    expect(L.taskDone(s)).toBe(true);
    // a solved task stays solved
    expect(L.verdict(s, '<')).toBe(s);
  });

  it('a ruler gesture is a trial only when it changes something; the ruler opens at the metre with no verdict', () => {
    let s = L.init({ tasks: B.tasks });
    expect(L.activeOf(s).g).toBe(0);
    expect(s.trials).toHaveLength(0);
    expect(L.setRuler(s, 0)).toBe(s);
    s = ruler(s, 3);
    expect(s.trials).toHaveLength(1);
    expect(L.trialEvidence(s.trials[0])).toMatchObject({ event: 'ruler', g: 3, decided: true, ok: null, verdict: null });
    expect(L.setRuler(s, 9).trials.length).toBe(1); // clamped to 3: no change
  });

  it('the readings at each graduation match the exact arithmetic (4,35: 4 m, 43 dm, 435 cm, 4350 mm)', () => {
    const s = L.init({ tasks: [{ kind: 'compare', a: '4,6', b: '4,35' }] });
    const counts = [0, 1, 2, 3].map((g) => L.readingsOf(s, g)[1].count);
    expect(counts).toEqual([4, 43, 435, 4350]);
    expect(L.readingsOf(s, 1)[1].restIsZero).toBe(false);
    expect(L.readingsOf(s, 2)[1].restIsZero).toBe(true);
  });

  it('free numbers: parsed with comma or dot, never counted, never finish a task', () => {
    let s = L.init({ tasks: B.tasks });
    expect(L.setFree(s, '4,6', '')).toBe(s);
    expect(L.setFree(s, '123', '4')).toBe(s);
    expect(L.setFree(s, '4,6789', '4')).toBe(s);
    s = L.setFree(s, '4.6', '4,65');
    expect(L.isFree(s)).toBe(true);
    s = ruler(s, 2);
    s = L.verdict(s, '<');
    expect(s.last).toMatchObject({ free: true, ok: true });
    expect(L.guidedTrials(s)).toHaveLength(0);
    expect(L.taskDone(s)).toBe(false);
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.coachOf(s)).toBeNull();
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
  });
});

describe('ruler-compare — free ordering of up to 6 own numbers', () => {
  const mk = () => L.init({ tasks: [A.tasks[0]] });
  it('needs 2..6 valid numbers, ignores empty fields, refuses invalid ones', () => {
    let s = mk();
    expect(L.setFree(s, ['4,6', '', '', '', '', ''])).toBe(s);
    expect(L.setFree(s, ['4,6', 'x', '', '', '', ''])).toBe(s);
    expect(L.setFree(s, ['4,6789', '4', '', '', '', ''])).toBe(s);
    s = L.setFree(s, ['4,6', '', '4,35', '4,5', '', '']);
    expect(L.isFree(s)).toBe(true);
    expect(L.activeOf(s)).toMatchObject({ free: true, kind: 'order', values: ['4,6', '4,35', '4,5'], slots: [null, null, null] });
    expect(L.activeOf(s).task.dir).toBe('asc');
  });
  it('same activity: refused while coarse, judged when fine, never counted', () => {
    let s = L.setFree(mk(), ['7,4', '7,04', '7,405', '6,98', '7,45', '7,4']);
    expect(L.activeOf(s).vals).toHaveLength(6);
    const f = () => L.activeOf(s);
    const order = [3, 1, 0, 5, 2, 4]; // 6,98 < 7,04 < 7,4 = 7,4 < 7,405 < 7,45
    order.forEach((j, slot) => { s = L.place(s, j, slot); });
    expect(L.slotsFull(s)).toBe(true);
    s = L.check(s);
    expect(s.last).toMatchObject({ event: 'check', refused: 'coarse', free: true });
    s = L.setRuler(s, 3);
    s = L.check(s);
    expect(s.last).toMatchObject({ event: 'check', ok: true, free: true });
    expect(L.taskDone(s)).toBe(false);
    expect(Object.keys(s.solved)).toHaveLength(0);
    expect(L.guidedTrials(s)).toHaveLength(0);
    expect(f().free).toBe(true);
    s = L.toGuided(s);
    expect(L.activeOf(s).free).toBe(false);
    expect(L.activeOf(s).slots.every((x) => x === null)).toBe(true);
  });
  it('a wrong free order shows the first inversion; descending follows the task', () => {
    let s = L.init({ tasks: [{ kind: 'order', values: ['1,2', '1,25', '1,3'], dir: 'desc' }] });
    s = L.setFree(s, ['1,2', '1,25', '1,3']);
    s = L.setRuler(s, 2);
    [0, 1, 2].forEach((j, slot) => { s = L.place(s, j, slot); });
    s = L.check(s);
    expect(s.last).toMatchObject({ ok: false, inversion: 0, free: true });
  });
  it('compare tasks keep the 2-field behaviour', () => {
    const s = L.setFree(L.init({ tasks: B.tasks }), ['4.6', '4,65', '9', '', '', '']);
    expect(L.activeOf(s)).toMatchObject({ kind: 'compare', values: ['4,6', '4,65'] });
  });
});

describe('ruler-compare — order tasks', () => {
  const [t1, t2] = A.tasks.map(L.normalizeTask);

  it('documented orders and ties', () => {
    expect(L.rightOrder(t1).map((i) => t1.values[i])).toEqual(['6,98', '7,04', '7,4', '7,405', '7,45']);
    expect(L.rightOrder(t2).map((i) => t2.values[i])).toEqual(['3', '2,5', '2,500', '2,05', '0,75']);
    expect(t1.rowG).toBe(3);
    expect(t2.rowG).toBe(1);
  });

  const fill = (s, order) => order.reduce((acc, jump, slot) => L.place(acc, jump, slot), s);

  it('check is refused while the ruler does not separate every pair (it names the first undecided pair)', () => {
    let s = L.init({ tasks: [A.tasks[0]] });
    s = ruler(s, 2);
    s = fill(s, L.rightOrder(t1));
    expect(L.slotsFull(s)).toBe(true);
    s = L.check(s);
    expect(s.last).toMatchObject({ event: 'check', ok: null, refused: 'coarse', decided: false, g: 2 });
    expect(s.last.pair).toEqual([0, 4]); // 7,4 and 7,405 both read 740 cm
    expect(L.taskDone(s)).toBe(false);
  });

  it('a wrong order shows the FIRST inversion; the right order (ties in any order) solves', () => {
    let s = ruler(L.init({ tasks: [A.tasks[0]] }), 3);
    s = fill(s, [0, 1, 2, 3, 4]);
    s = L.check(s);
    expect(s.last).toMatchObject({ ok: false, inversion: 0, a: '7,4', b: '7,04', decided: true });
    s = L.init({ tasks: [A.tasks[0]] });
    s = ruler(s, 3);
    s = fill(s, L.rightOrder(t1));
    s = L.check(s);
    expect(L.taskDone(s)).toBe(true);
    expect(s.solved[0].counts).toEqual([6980, 7040, 7400, 7405, 7450]);
    expect(L.trialEvidence(s.last)).toMatchObject({ kind: 'order', event: 'check', ok: true });
    // ties: 2,5 and 2,500 swapped
    let u = ruler(L.init({ tasks: [A.tasks[1]] }), 1);
    const right = L.rightOrder(t2); // 4 (3), 0 (2,5), 3 (2,500), 1, 2 ... positions of the tie
    const swapped = right.slice();
    [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
    u = L.check(fill(u, swapped));
    expect(L.taskDone(u)).toBe(true);
  });

  it('place: a jump moves between slots (swap) and back to the sand; each is a trial', () => {
    let s = L.init({ tasks: [A.tasks[0]] });
    s = L.place(s, 0, 2);
    expect(L.activeOf(s).slots).toEqual([null, null, 0, null, null]);
    s = L.place(s, 1, 2); // occupant goes back to the sand
    expect(L.activeOf(s).slots).toEqual([null, null, 1, null, null]);
    expect(L.trayOf(s)).toEqual([0, 2, 3, 4]);
    s = L.place(s, 3, 4);
    s = L.place(s, 3, 2); // moved onto the occupied slot: swap into the vacated one
    expect(L.activeOf(s).slots).toEqual([null, null, 3, null, 1]);
    s = L.place(s, 3, null);
    expect(L.activeOf(s).slots).toEqual([null, null, null, null, 1]);
    expect(L.trialEvidence(s.trials.at(-1))).toMatchObject({ kind: 'order', event: 'place', jump: 3, slot: null, ok: null });
    expect(L.place(s, 1, 4)).toBe(s);
  });
});

describe('ruler-compare — the coach, followed to the end', () => {
  it('compare tasks: ruler → verdict → next, never the answer', () => {
    let s = L.init({ tasks: B.tasks });
    const seen = [];
    for (let guard = 0; guard < 40 && !L.discoveryReady(s); guard += 1) {
      const c = L.coachOf(s);
      expect(c, `step ${guard}`).not.toBeNull();
      expect(c.target).toMatch(/^\[data-rc-(knob|verdicts|next)\]$/);
      seen.push(c.id);
      const t = L.taskOf(s);
      if (c.id === 'ruler') s = ruler(s, Math.min(3, L.activeOf(s).g + 1));
      else if (c.id === 'verdict') s = L.verdict(s, t.verdict);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
    expect(new Set(seen)).toEqual(new Set(['ruler', 'verdict', 'next']));
  });

  it('order tasks: ruler → place → check → next', () => {
    let s = L.init({ tasks: A.tasks });
    const seen = [];
    for (let guard = 0; guard < 80 && !L.discoveryReady(s); guard += 1) {
      const c = L.coachOf(s);
      expect(c, `step ${guard}`).not.toBeNull();
      seen.push(c.id);
      const t = L.taskOf(s);
      if (c.id === 'ruler') s = ruler(s, L.activeOf(s).g + 1);
      else if (c.id === 'place') { const tray = L.trayOf(s); const slot = L.activeOf(s).slots.indexOf(null); s = L.place(s, L.rightOrder(t)[slot], slot); expect(tray.length).toBeGreaterThan(0); }
      else if (c.id === 'check') s = L.check(s);
      else if (c.id === 'next') s = L.nextTask(s);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(new Set(seen)).toEqual(new Set(['ruler', 'place', 'check', 'next']));
  });
});

describe('ruler-compare — discovery witnesses come from the student’s own numbers', () => {
  it('beginner: 4,35 is longer yet smaller; 35 > 6 yet 4,35 < 4,6', () => {
    const w = L.witnesses(L.init({ tasks: B.tasks }));
    expect(w.longer).toMatchObject({ small: '4,35', big: '4,6', smallDecimals: 2, bigDecimals: 1 });
    expect(w.digits).toMatchObject({ small: '4,35', big: '4,6', smallNatural: 35, bigNatural: 6 });
  });
  it('advanced: found among the pairs of the rows', () => {
    const w = L.witnesses(L.init({ tasks: A.tasks }));
    expect(D.cmp(D.parse(w.longer.small), D.parse(w.longer.big))).toBe(-1);
    expect(D.parse(w.longer.small).k).toBeGreaterThan(D.parse(w.longer.big).k);
    expect(D.cmp(D.parse(w.digits.small), D.parse(w.digits.big))).toBe(-1);
    expect(w.digits.smallNatural).toBeGreaterThan(w.digits.bigNatural);
  });
});

describe('ruler-compare — the tape geometry at the five widths', () => {
  it('always fits its width, keeps the flag on its cell, breaks on the left when too long', () => {
    for (const width of [280, 378, 460, 600, 900]) {
      for (const count of [0, 1, 4, 46, 460, 4350, 9999]) {
        for (const frac of [0, 0.35, 0.999]) {
          const T = L.tapeLayout({ width, count, frac });
          expect(T.total, `${width}/${count}`).toBeLessThanOrEqual(width + 1);
          expect(T.cw).toBeGreaterThanOrEqual(30);
          expect(T.shown).toBeLessThanOrEqual(Math.min(count, 9));
          expect(T.flagX).toBeGreaterThanOrEqual(T.restX);
          expect(T.flagX).toBeLessThanOrEqual(T.restX + T.cw);
          expect(T.broken).toBe(count > T.shown);
          expect(T.firstLabel + T.shown - 1).toBe(count);
        }
      }
    }
  });
  it('parseJump accepts 0–99 with ≤ 3 decimals and refuses the rest', () => {
    expect(L.parseJump('4,6')).toEqual({ n: 46, k: 1 });
    expect(L.parseJump('12.70')).toEqual({ n: 1270, k: 2 });
    expect(L.parseJump('99,999')).toEqual({ n: 99999, k: 3 });
    for (const bad of ['', '100', '4,6789', ',5', '4,', 'x', '-3', '4,6,1']) expect(L.parseJump(bad), bad).toBeNull();
  });
});
