import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import * as L from './storyBars';

const txt = (p) => L.dec(p);
const extraction = JSON.parse(readFileSync(new URL('../../../../../../../docs/sources/1am/unit2/extraction.json', import.meta.url), 'utf8'));
const element = (id) => extraction.elements.find((e) => e.id === id);

describe('story-bars — the answers, recomputed exactly', () => {
  it('every STORIES answer is the one the tape structure gives (whole = sum of the parts)', () => {
    for (const id of L.STORY_IDS) {
      L.STORIES[id].items.forEach((_, i) => {
        expect(LIN.eq(L.answerOf(id, i), L.answerFromStructure(id, i)), `${id} #${i}`).toBe(true);
        const tape = L.tapeOf(id, i, L.answerOf(id, i));
        expect(tape.closed, `${id} #${i} closes on its answer`).toBe(true);
      });
    }
  });

  it('checkup: 136, 126, 121, 135 — the two traps are « تزيد » → subtract and « تنقص » → add', () => {
    expect([0, 1, 2, 3].map((i) => txt(L.answerOf('checkup', i)))).toEqual(['136', '126', '121', '135']);
    expect([0, 1, 2, 3].map((i) => L.unknownIsWhole('checkup', i))).toEqual([true, false, false, true]);
    expect(L.STORIES.checkup.items.map((it) => it.trap)).toEqual([false, false, true, true]);
  });

  it('method29 (textbook p. 29): يونس 127, محمد 119 — the textbook answer', () => {
    expect([0, 1].map((i) => txt(L.answerOf('method29', i)))).toEqual(['127', '119']);
    const m = element('method-3');
    expect(m.answer).toMatchObject({ younes: 127, mohamed: 119 });
    expect(L.STORIES.method29.discovery).toBe(false);
  });

  it('act1: the six texts and six cards are the textbook\'s (extraction act-1), answers recomputed', () => {
    const act = element('act-1');
    expect([...L.STORIES.act1.cards]).toEqual(act.cards);
    L.STORIES.act1.items.forEach((it, i) => {
      expect(it.n).toBe(act.texts[i].n);
      expect(txt(L.answerOf('act1', i))).toBe(act.texts[i].answer);
      expect(L.rightCalcOf('act1', i).calc).toBe(act.texts[i].card.replace('-', '−'));
    });
    // structure: ① whole unknown, ② the difference is a part, ③ Younes is a part, ④ the result is the whole,
    // ⑤ the sum is the whole, ⑥ the increase is a part
    expect(L.STORIES.act1.items.map((_, i) => L.unknownIsWhole('act1', i))).toEqual([true, false, false, true, true, false]);
  });
});

describe('story-bars — stretch: each item closes for exactly ONE height', () => {
  for (const id of ['checkup', 'method29']) {
    it(`${id}: a sweep of 100..150 finds one true height per item, and its right card is the only one accepted`, () => {
      L.STORIES[id].items.forEach((_, i) => {
        const ok = [];
        for (let h = L.GAUGE.min; h <= L.GAUGE.max; h += 1) if (L.judgeHeight(id, i, h).ok) ok.push(h);
        expect(ok, `${id} #${i}`).toEqual([LIN.toNumber(L.answerOf(id, i))]);
        const accepted = [0, 1, 2].filter((ci) => L.judgeCalc(id, i, ci).ok);
        expect(accepted).toEqual([L.rightCalc(id, i)]);
        // the tape closes only on the answer
        for (let h = L.GAUGE.min; h <= L.GAUGE.max; h += 1) expect(L.tapeOf(id, i, LIN.frac(h)).closed).toBe(h === ok[0]);
      });
    });
  }

  it('refusal kinds: equal, mirror (the trap read as its word), side, gap', () => {
    expect(L.judgeHeight('checkup', 0, 130).kind).toBe('equal');
    expect(L.judgeHeight('checkup', 2, 139).kind).toBe('mirror'); // نزيم: « تزيد » read as + 9
    expect(L.judgeHeight('checkup', 3, 125).kind).toBe('mirror'); // ياسين: « تنقص » read as − 5
    expect(L.judgeHeight('checkup', 1, 140)).toMatchObject({ kind: 'side', taller: true, diff: 10 }); // ريم taller
    expect(L.judgeHeight('checkup', 0, 140)).toMatchObject({ kind: 'gap', diff: 10, d: 6 });
    expect(L.judgeHeight('checkup', 0, 136)).toMatchObject({ kind: 'ok', ok: true });
  });

  it('calc cards: the canonical three, a stable shuffled order, and the three verdicts', () => {
    expect(L.calcCards('checkup', 0).map(L.calcText)).toEqual(['130 + 6', '130 − 6', '6 − 130']);
    for (const id of ['checkup', 'method29']) {
      L.STORIES[id].items.forEach((_, i) => {
        const o = L.calcOrder(id, i);
        expect([...o].sort()).toEqual([0, 1, 2]);
        expect(L.calcOrder(id, i)).toEqual(o);
      });
    }
    expect(L.judgeCalc('checkup', 0, 2).kind).toBe('impossible');
    expect(L.judgeCalc('checkup', 0, 1)).toMatchObject({ kind: 'wrong', taller: false });
    expect(txt(L.judgeCalc('checkup', 0, 1).value)).toBe('124');
    expect(L.judgeCalc('checkup', 2, 0)).toMatchObject({ kind: 'wrong', taller: true }); // 130 + 9 for نزيم
    expect(L.judgeCalc('checkup', 2, 1).ok).toBe(true);
  });

  it('a full item: the default is not a trial, refusals are trials, the height locks, then the calc', () => {
    let s = L.init('checkup');
    expect(s.items[0].h).toBe(130);
    expect(s.trials).toEqual([]);
    s = L.setHeight(s, 141);
    expect(s.items[0].h).toBe(141);
    expect(s.trials).toEqual([]); // passing over a value is not a trial
    s = L.chooseCalc(s, 0);
    expect(s.last.kind).toBe('calcFirst');
    s = L.commitHeight(s, 141);
    expect(s.trials.at(-1)).toMatchObject({ kind: 'stretch', value: 141, ok: false, verdict: 'gap' });
    s = L.commitHeight(s, 136);
    expect(s.items[0].stretchOk).toBe(true);
    expect(L.commitHeight(s, 130).last.kind).toBe('locked');
    expect(L.setHeight(s, 120).items[0].h).toBe(136);
    s = L.chooseCalc(s, 1);
    expect(s.items[0].ghost).toEqual({ ci: 1, h: 124, ok: false });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'calc', calc: '130 − 6', value: '124', ok: false });
    s = L.chooseCalc(s, 2);
    expect(s.items[0].ghost.h).toBeNull(); // 6 − 130: no height at all
    s = L.chooseCalc(s, 0);
    expect(L.itemDone(s, 0)).toBe(true);
    expect(L.formalLine('checkup', 0)).toBe('□ = 130 + 6 = 136');
    expect(L.trialEvidence(s, s.trials.at(-1))).toEqual({ story: 'checkup', item: 'amine', kind: 'calc', value: '136', ok: true, calc: '130 + 6' });
    expect(L.trialEvidence(s, s.trials[0])).toEqual({ story: 'checkup', item: 'amine', kind: 'stretch', value: 141, ok: false });
  });

  it('items go in order: the next one opens when the current is done', () => {
    let s = L.init('checkup');
    expect(L.goTo(s, 1).cur).toBe(0);
    s = L.commitHeight(s, 136);
    s = L.chooseCalc(s, 0);
    s = L.next(s);
    expect(s.cur).toBe(1);
    expect(L.goTo(s, 0).cur).toBe(0);
    expect(L.goTo(s, 2).cur).toBe(1);
  });
});

/** Solve item i of a stretch story by the hand's path. */
const solveStretch = (s0, i) => {
  let s = L.goTo(s0, i);
  s = L.commitHeight(s, LIN.toNumber(L.answerOf(s.story, i)));
  return L.chooseCalc(s, L.rightCalc(s.story, i));
};

describe('story-bars — discovery and finish', () => {
  it('checkup: discovery needs items 1–3 (an addition, a subtraction AND a trap); item 4 stays a transfer', () => {
    let s = L.init('checkup');
    s = solveStretch(s, 0);
    expect(L.discoveryReady(s)).toBe(false);
    s = solveStretch(s, 1);
    expect(L.discoveryReady(s)).toBe(false); // no trap yet
    s = solveStretch(s, 2);
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.allDone(s)).toBe(false);
    const { discoveryItems, refute } = L.STORIES.checkup;
    expect(discoveryItems.some((i) => L.unknownIsWhole('checkup', i))).toBe(true);
    expect(discoveryItems.some((i) => !L.unknownIsWhole('checkup', i))).toBe(true);
    expect(discoveryItems.some((i) => L.STORIES.checkup.items[i].trap)).toBe(true);
    // the refutations come from the student's own items: نزيم (word) 130 − 9, أمين (big) 130 + 6
    expect(L.rightCalcOf('checkup', refute.word)).toEqual({ calc: '130 − 9', value: '121' });
    expect(L.rightCalcOf('checkup', refute.big)).toEqual({ calc: '130 + 6', value: '136' });
    s = solveStretch(s, 3);
    expect(L.allDone(s)).toBe(true);
  });

  it('method29: no discovery; all done after both items', () => {
    let s = L.init('method29');
    s = solveStretch(s, 0);
    s = solveStretch(s, 1);
    expect(L.discoveryReady(s)).toBe(false);
    expect(L.allDone(s)).toBe(true);
  });

  it('reset clears the trial memory', () => {
    let s = L.init('checkup');
    s = solveStretch(s, 0);
    expect(s.trials.length).toBeGreaterThan(0);
    s = L.reset(s);
    expect(s).toEqual(L.init('checkup'));
    let c = L.placeCard(L.init('act1'), 0, 1);
    c = L.reset(c);
    expect(c.trials).toEqual([]);
    expect(c.slots.every((sl) => sl.matched == null && sl.tried == null)).toBe(true);
  });
});

describe('story-bars — act1 cards', () => {
  it('the six cards have six distinct values and each text accepts exactly one card', () => {
    const vals = L.cardsOf('act1').map((c) => txt(L.calcValue(c)));
    expect(new Set(vals).size).toBe(6);
    const s = L.init('act1');
    L.STORIES.act1.items.forEach((_, t) => {
      const ok = L.STORIES.act1.cards.map((_, c) => c).filter((c) => L.canPlace(s, c, t) === true);
      expect(ok, `text ${t + 1}`).toHaveLength(1);
      expect(ok[0]).toBe(L.rightCalcOf('act1', t).card);
    });
  });

  it('refusal kinds: the same two numbers with the other operation, or another text\'s numbers', () => {
    const s = L.init('act1');
    expect(L.canPlace(s, 5, 0)).toBe('operation'); // 24,5 − 11,5 on ① (« ينقصه »)
    expect(L.canPlace(s, 1, 2)).toBe('operation'); // 17,5 + 1,5 on ③ (« زادت »)
    expect(L.canPlace(s, 3, 0)).toBe('numbers');
  });

  it('a refused card is a trial and leaves an UNclosed tape with its value in the unknown\'s role', () => {
    let s = L.init('act1');
    s = L.placeCard(s, 5, 0); // 24,5 − 11,5 = 13 on ①
    expect(s.slots[0]).toEqual({ matched: null, tried: 5 });
    expect(s.trials.at(-1)).toMatchObject({ kind: 'card', ok: false, verdict: 'operation', value: '13', calc: '24,5 − 11,5' });
    const tape = L.tapeOf('act1', 0, L.cardValue('act1', 5));
    expect(tape.closed).toBe(false);
    expect(tape.whole).toMatchObject({ value: '13', unknown: true });
    s = L.placeCard(s, 0, 0);
    expect(s.slots[0]).toEqual({ matched: 0, tried: null });
    expect(L.canPlace(s, 0, 3)).toBe(''); // a placed card cannot be placed again
    expect(L.canPlace(s, 1, 0)).toBe(''); // a solved text takes nothing more
    expect(L.placeCard(s, 1, 0)).toBe(s);
  });

  it('act1: discovery after all six texts; the refutations are texts ③ and ①', () => {
    let s = L.init('act1');
    for (let t = 0; t < 6; t += 1) {
      expect(L.discoveryReady(s)).toBe(false);
      s = L.placeCard(s, L.rightCalcOf('act1', t).card, t);
    }
    expect(L.discoveryReady(s)).toBe(true);
    expect(L.allDone(s)).toBe(true);
    expect(L.rightCalcOf('act1', L.STORIES.act1.refute.word)).toMatchObject({ calc: '17,5 − 1,5', value: '16' });
    expect(L.rightCalcOf('act1', L.STORIES.act1.refute.big)).toMatchObject({ calc: '24,5 + 11,5', value: '36' });
    expect(L.trialEvidence(s, s.trials[0])).toEqual({ story: 'act1', item: 't1', kind: 'card', value: '36', ok: true, calc: '24,5 + 11,5' });
  });

  it('decimal values stay exact: 31,02 − 22,60 = 8,42 and 31,02 + 22,60 = 53,62', () => {
    expect(txt(L.cardValue('act1', 3))).toBe('8,42');
    expect(txt(L.cardValue('act1', 4))).toBe('53,62');
    expect(L.tapeOf('act1', 5, L.cardValue('act1', 3)).closed).toBe(true);
    expect(L.tapeOf('act1', 5, L.cardValue('act1', 4)).closed).toBe(false);
  });
});

describe('story-bars — gauge geometry', () => {
  it('heightFromY(yOf(h)) = h for every height, at several scene heights; monotone; inside the scene', () => {
    for (const H of [180, 220, 301, 380, 457]) {
      const g = L.gaugeScale(H);
      let prev = Infinity;
      for (let h = L.GAUGE.min; h <= L.GAUGE.max; h += 1) {
        const y = g.yOf(h);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(H);
        expect(y).toBeLessThan(prev);
        prev = y;
        expect(L.heightFromY(y, H)).toBe(h);
        expect(L.heightFromY(y + g.k * 0.4, H)).toBe(h);
      }
      expect(L.heightFromY(-50, H)).toBe(L.GAUGE.max);
      expect(L.heightFromY(H + 50, H)).toBe(L.GAUGE.min);
    }
    const ticks = L.gaugeTicks();
    expect(ticks).toHaveLength(51);
    expect(ticks.filter((t) => t.major).map((t) => t.cm)).toEqual([100, 110, 120, 130, 140, 150]);
  });

  it('the children stand on the floor: 0 cm is the floor, 150 cm leaves the pill margin, pads are pixels', () => {
    for (const H of [220, 301, 457]) {
      const g = L.gaugeScale(H);
      expect(g.yOf(0)).toBe(H - L.GAUGE_PAD.bottom);
      expect(g.yOf(L.VIEW.hi)).toBeCloseTo(L.GAUGE_PAD.top, 6);
      expect(g.yOf(136) - g.yOf(130)).toBeCloseTo(-6 * g.k, 6);
    }
  });

  it('rulerTicks: one tick per cm when there is room, labels every 10 cm (or 20 when cramped)', () => {
    const fine = L.rulerTicks(3.2);
    expect(fine).toHaveLength(151);
    expect(fine.filter((t) => t.label).map((t) => t.cm)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]);
    const coarse = L.rulerTicks(1.5);
    expect(coarse).toHaveLength(31);
    expect(coarse.filter((t) => t.label).map((t) => t.cm)).toEqual([0, 20, 40, 60, 80, 100, 120, 140]);
  });
});
