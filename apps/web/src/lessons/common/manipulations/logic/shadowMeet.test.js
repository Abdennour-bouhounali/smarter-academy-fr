import { describe, it, expect } from 'vitest';
import * as L from './shadowMeet.js';
import { K25, HOURS } from './shadowWorld.js';

/**
 * shadow-meet — la logique pure (unité 9, leçon 1 dans le lecteur de mission ; conseil du 2026-11-10, verdict L1). Les longueurs sont des
 * centimètres ENTIERS ; chaque nombre attendu est recalculé ici en fractions exactes (k = K25 ÷ 25), jamais recopié.
 */
const k25 = (hour) => K25[HOURS.indexOf(hour)];
/** L'ombre exacte (cm) d'une hauteur (cm) à une heure : H × K25 ÷ 25 — entière, vérifiée. */
const shadow = (H, hour) => { const v = (H * k25(hour)) / 25; expect(Number.isInteger(v)).toBe(true); return v; };
const lab1 = (extra = {}) => L.init({ object: 'lamp', height: '2,75', hour: '14:00', ask: 'tap', ...extra });
/** Amener le bâton à la rencontre et le lâcher. */
const meet = (lab) => L.settle(L.moveStick(lab, L.cur(lab).meetX));

describe('shadow-meet — the world', () => {
  it('a step is exact: OA = H × k, OB = k, the meet at BA = OA − OB, all whole centimetres', () => {
    const s = L.stepOf({ height: '2,75', hour: '14:00' });
    expect(s.H).toBe(275);
    expect(s.OA).toBe(shadow(275, '14:00'));
    expect(s.OB).toBe(shadow(100, '14:00'));
    expect(L.meetOf(s)).toEqual({ OA: 330, OB: 120, BA: 210 });
    // Thales at the meet, in cross products: OB × AM = OA × BE
    expect(s.OB * s.H).toBe(s.OA * L.STICK);
    expect(L.ratioText(s)).toBe('4/11');
    expect(L.ratioText(L.stepOf({ height: '6,5', hour: '16:00' }))).toBe('2/13');   // the ratio does not depend on the hour
    expect(L.ratioText(L.stepOf({ height: '6,5', hour: '14:00' }))).toBe('2/13');
  });

  it('refuses a height that is not a quarter-metre above the stick, and an unknown hour', () => {
    expect(() => L.stepOf({ height: '2,7', hour: '14:00' })).toThrow();
    expect(() => L.stepOf({ height: '1', hour: '14:00' })).toThrow();
    expect(() => L.stepOf({ height: '2,75', hour: '14:15' })).toThrow();
    expect(() => L.stepOf({ height: '2,75', hour: '14:00', task: 'ratio' })).toThrow();   // a « ratio » step asks a height
    expect(L.heightCm(2.75)).toBe(275);
    expect(L.hourIndex('16:00')).toBe(7);
  });

  it('the stick never starts at the meet: it starts in the sun, past the end of the shadow', () => {
    for (const height of ['1,5', '2,75', '6,5', '7,5', '9,25']) for (const hour of ['13:00', '13:30', '14:00', '14:30', '15:30', '16:00']) {
      const lab = L.init({ height, hour });
      const s = L.cur(lab);
      expect(lab.stickX).not.toBe(s.meetX);
      expect(L.sideOf(lab)).toBe('sun');
      expect(lab.stickX).toBeLessThanOrEqual(s.max);
      expect(L.isMet(lab)).toBe(false);
    }
  });

  it('shade / meet / sun is the physics: the stick top is under, on, or above the ray', () => {
    const lab = lab1();
    const s = L.cur(lab);
    for (const x of [s.min, 100, s.meetX - 1, s.meetX, s.meetX + 1, s.max]) {
      // the ray from M (0, H) to O (OA, 0) is at height (OA − x) × H ÷ OA above x ; compared with 1 m without a float: (OA − x) × H vs 100 × OA
      const above = (s.OA - x) * s.H;
      const side = above > L.STICK * s.OA ? 'shade' : above === L.STICK * s.OA ? 'meet' : 'sun';
      expect(L.sideOf(lab, x), String(x)).toBe(side);
    }
  });
});

describe('shadow-meet — the gestures', () => {
  it('moving never judges; the magnet catches the meet only within its distance; a drop at the meet is the verdict', () => {
    let lab = lab1();
    const s = L.cur(lab);
    lab = L.moveStick(lab, s.meetX + 9, { magnet: 8 });
    expect(lab.stickX).toBe(s.meetX + 9);
    expect(L.settle(lab).last).toEqual({ kind: 'drop', side: 'sun' });
    expect(L.verdictOf(L.settle(lab))).toBe(null);
    lab = L.moveStick(lab, s.meetX - 8, { magnet: 8 });
    expect(lab.stickX).toBe(s.meetX);
    expect(L.isMet(lab)).toBe(false);            // not released yet
    lab = L.settle(lab);
    expect(L.isMet(lab)).toBe(true);
    expect(L.isSolved(lab)).toBe(false);         // the height is asked
    expect(L.verdictOf(lab)).toBe(null);         // the meet of a step that asks a height is not a trial
    // frozen after the meet
    expect(L.moveStick(lab, 50)).toBe(lab);
    // the stick is clamped to its track
    expect(L.moveStick(lab1(), -500).stickX).toBe(s.min);
    expect(L.moveStick(lab1(), 99999).stickX).toBe(s.max);
  });

  it('a step that asks nothing is solved by its meet — a free exact verdict', () => {
    const lab = meet(L.init({ height: '6,5', hour: '16:00' }));
    expect(L.isSolved(lab)).toBe(true);
    expect(L.verdictOf(lab)).toEqual({ groups: 0, exact: true, free: true });
  });

  it('answers: right, each wrong model named, the same wrong answer twice is not a trial, nothing before the meet', () => {
    let lab = lab1();
    expect(L.canAnswer(lab)).toBe(false);
    expect(L.answer(lab, 275)).toBe(lab);
    lab = meet(lab);
    expect(L.canAnswer(lab)).toBe(true);
    const s = L.cur(lab);
    expect(L.judge(s, 275)).toBe('right');
    expect(L.judge(s, 175)).toBe('segment');                // BA ÷ OB = 2,1 ÷ 1,2
    expect((s.meetX * 100) / s.OB).toBe(175);
    expect(L.judge(s, 310)).toBe('additive');               // 3,3 − 0,2
    expect(L.judge(s, 330)).toBe('shadow');
    expect(L.judge(s, 396)).toBe('inverse');                // 3,3 × 1,2
    expect(L.judge(s, 36)).toBe('inverse');                 // 1,2 ÷ 3,3
    expect(L.judge(s, 123)).toBe('other');
    const w1 = L.answer(lab, 175);
    expect(L.verdictOf(w1)).toEqual({ groups: 0, exact: false });
    const w2 = L.answer(w1, 175);
    expect(w2.last.repeat).toBe(true);
    expect(L.verdictOf(w2)).toBe(null);
    expect(w2.wrong[0]).toEqual([175]);
    const ok = L.answer(w2, 275);
    expect(L.isSolved(ok)).toBe(true);
    expect(L.verdictOf(ok)).toEqual({ groups: 0, exact: true });
    expect(L.answer(ok, 275)).toBe(ok);
    expect(L.allSolved(ok)).toBe(true);
  });

  it('the flag: the pole is known, the shadow is typed — exact to the centimetre; the stick stands left of the pole', () => {
    let lab = L.init({ object: 'pole', height: '3,75', hour: '14:30', task: 'flag' });
    const s = L.cur(lab);
    expect(s.OA).toBe(shadow(375, '14:30'));
    expect(s.OA).toBe(495);
    expect(lab.stickX).toBeLessThan(-s.OB);                 // its shadow ends before A: its place says nothing of the answer
    expect(L.canAnswer(lab)).toBe(true);
    expect(L.moveStick(lab, 100)).toBe(lab);                // nothing to drag
    expect(L.judge(s, 284)).toBe('inverse');                // 3,75 ÷ 1,32 = 2,84…
    expect(L.judge(s, 375 + 32)).toBe('additive');
    expect(L.judge(s, 375)).toBe('height');
    lab = L.answer(lab, 494);
    expect(lab.flag).toBe(494);
    expect(L.verdictOf(lab)).toEqual({ groups: 0, exact: false });
    lab = L.answer(lab, 495);
    expect(L.isSolved(lab)).toBe(true);
    expect(lab.flag).toBe(495);
  });

  it('two steps: the sun moves, the stick stays where it was, and is no longer at the meet', () => {
    let lab = L.init({ steps: [{ object: 'tower', height: '6,5', hour: '14:00', ask: 'tap' }, { object: 'tower', height: '6,5', hour: '16:00' }] });
    expect(L.nextStep(lab)).toBe(lab);                      // not before the step is solved
    lab = L.answer(meet(lab), 650);
    expect(L.hasNext(lab)).toBe(true);
    const x = lab.stickX;
    lab = L.nextStep(lab);
    expect(lab.at).toBe(1);
    expect(lab.stickX).toBe(x);
    expect(lab.last).toMatchObject({ kind: 'step', hourChanged: true, objectChanged: false });
    expect(L.sideOf(lab)).toBe('shade');                    // the tower's shadow grew over it
    expect(L.meetOf(L.cur(lab))).toEqual({ OA: 1482, OB: 228, BA: 1254 });
    lab = meet(lab);
    expect(L.allSolved(lab)).toBe(true);
    expect(L.nextStep(lab)).toBe(lab);
    // another object: the stick starts again in the sun
    let two = L.init({ steps: [{ object: 'palm', height: '4,25', hour: '15:30', task: 'ratio', ask: 'type' }, { object: 'tower', height: '7,5', hour: '15:30', ask: 'type' }] });
    two = L.nextStep(L.answer(two, 425));
    expect(two.at).toBe(1);
    expect(L.sideOf(two)).toBe('sun');
  });
});

describe('shadow-meet — chips, predictions, journal, coach', () => {
  it('the three height chips: the truth, the segment and the constant gap — distinct, and the right one moves with the numbers', () => {
    const s = L.stepOf({ height: '2,75', hour: '14:00', ask: 'tap' });
    const o = L.heightOptions(s);
    expect(o).toHaveLength(3);
    expect(o.filter((x) => x.right).map((x) => x.text)).toEqual(['2,75']);
    expect([...o.map((x) => x.text)].sort()).toEqual(['1,75', '2,75', '3,1']);
    expect(o.filter((x) => !x.right).map((x) => x.why).sort()).toEqual(['additive', 'segment']);
    // chosen decoys: the shadow itself instead of the constant gap
    const e = L.heightOptions(L.stepOf({ height: '1,5', hour: '14:00', ask: { kind: 'tap', decoys: ['segment', 'shadow'] } }));
    expect([...e.map((x) => x.text)].sort()).toEqual(['0,5', '1,5', '1,8']);
    const pos = ['1,5', '2,75', '6,5', '4,25'].map((height) => L.heightOptions(L.stepOf({ height, hour: '14:00', ask: 'tap' })).findIndex((x) => x.right));
    expect(new Set(pos).size).toBeGreaterThan(1);
  });

  it('the three lengths read on the ground are OB, BA and OA', () => {
    const s = L.stepOf({ height: '2,75', hour: '14:00' });
    expect([...L.readOptions(s)].sort()).toEqual(['1,2', '2,1', '3,3']);
  });

  it('predictions are computed: the stick shadow changes with the hour; the tower shadow is less than doubled (×1,9)', () => {
    const lab = L.init({ steps: [{ height: '6,5', hour: '14:00', ask: 'tap' }, { height: '6,5', hour: '16:00' }] });
    expect(L.predictTruth(lab, 'stickSame')).toBe('no');
    expect(L.predictTruth(lab, 'double')).toBe('less');
    expect(lab.steps[1].OA * 10).toBe(lab.steps[0].OA * 19);          // exactly ×1,9
    expect(L.predictOptions('stickSame')).toEqual(['yes', 'no']);
    expect(L.predictOptions('double')).toEqual(['less', 'exact', 'more']);
    expect(L.predictTruth(L.init({ height: '6,5' }), 'double')).toBe(null);
    expect(L.predictionJudged(lab, 0)).toBe(false);
    const done = meet(L.nextStep(L.answer(meet(lab), 650)));
    expect(L.predictionJudged(done, 0)).toBe(true);
  });

  it('the journal lists a step once it is met; the height only once found', () => {
    let lab = lab1();
    expect(L.journalRows(lab)).toEqual([]);
    lab = meet(lab);
    expect(L.journalRows(lab)).toMatchObject([{ hour: '14:00', object: 'lamp', shadow: 330, stick: 120, height: null, solved: false }]);
    lab = L.answer(L.answer(lab, 175), 275);
    expect(L.journalRows(lab)).toMatchObject([{ height: 275, solved: true, tries: 1 }]);
    // a flag step shows its known height at once, its shadow only when found
    const flag = L.init({ object: 'pole', height: '3,75', hour: '14:30', task: 'flag' });
    expect(L.journalRows(flag)).toMatchObject([{ height: 375, shadow: null }]);
    expect(L.journalRows(L.answer(flag, 495))).toMatchObject([{ height: 375, shadow: 495 }]);
  });

  it('the coach: the stick handle, then the question, then the next step — never a place', () => {
    let lab = L.init({ steps: [{ height: '6,5', hour: '14:00', ask: 'tap' }, { height: '6,5', hour: '16:00' }] });
    expect(L.coachOf(lab)).toMatchObject({ id: 'drag', target: '[data-sm-stick]' });
    lab = meet(lab);
    expect(L.coachOf(lab, { asking: true })).toMatchObject({ id: 'tap', target: '[data-sm-ask-zone]', prefer: 'below' });
    lab = L.answer(lab, 650);
    expect(L.coachOf(lab, { canAdvance: true })).toMatchObject({ id: 'next', target: '[data-sm-next]' });
    expect(L.coachOf(lab, { done: true })).toBe(null);
    expect(L.coachOf(L.init({ object: 'pole', height: '3,75', hour: '14:30', task: 'flag' }), { asking: true })).toMatchObject({ id: 'flag' });
    expect(JSON.stringify(L.coachOf(lab1()))).not.toMatch(/\d/);
  });
});

describe('shadow-meet — what a screen can show, and the scene', () => {
  it('shownValues lists every hour, length, height, decoy and ratio — and every pair of a free round', () => {
    const v = L.shownValues({ object: 'lamp', height: '2,75', hour: '14:00', ask: 'tap', chains: 'same' });
    // the ratio is listed only when a chain WRITES it (« same »)
    expect(L.shownValues({ object: 'lamp', height: '2,75', hour: '14:00', ask: 'tap', chains: 'read' }).some((x) => x.role === 'ratio')).toBe(false);
    const of = (role) => v.filter((x) => x.role === role).map((x) => x.v).sort();
    expect(of('hour')).toEqual(['14:00']);
    expect(of('length')).toEqual(['1,2', '2,1', '3,3']);
    expect(of('height')).toEqual(['1', '2,75']);
    expect(of('decoy-height')).toEqual(['1,75', '3,1']);
    expect(of('ratio')).toEqual(['4/11']);
    const free = L.shownValues({ height: '5,75', hour: '14:00', choices: { heights: ['5,75', '6,75'], hours: ['13:00', '16:00'] } });
    expect(free.filter((x) => x.role === 'hour').map((x) => x.v)).toEqual(expect.arrayContaining(['13:00', '16:00']));
    expect(free.some((x) => x.role === 'length' && x.v === L.m((675 * 57) / 25))).toBe(true);
  });

  it('one scale for the whole round; the pointer maps back to centimetres', () => {
    const lab = L.init({ steps: [{ height: '6,5', hour: '14:00', ask: 'tap' }, { height: '6,5', hour: '16:00' }] });
    const g = L.layout(lab, { width: 700, height: 340 });
    expect(g.x(1482 + 40 + 228)).toBeLessThanOrEqual(700);
    expect(g.y(650)).toBeGreaterThanOrEqual(0);
    expect(Math.round(g.cmAt(g.x(660)))).toBe(660);
    expect(g.y(0)).toBe(g.groundY);
    // a flag step leaves room for the stick on the left of the pole
    const flag = L.init({ object: 'pole', height: '3,75', hour: '14:30', task: 'flag' });
    const f = L.layout(flag, { width: 700, height: 340 });
    expect(f.x(flag.stickX)).toBeGreaterThan(0);
    expect(f.x(Math.round(495 * 1.25))).toBeLessThanOrEqual(700);
  });
});

describe('shadow-meet — hideHeight (the synthesis round, 2026-11-10)', () => {
  // the unit's minaret at 15:00: the meet shows BA, OB and OA; the height (module 7's own answer) is never written
  const MINARET = { object: 'minaret', height: '7,25', hour: '15:00', hideHeight: true };
  it('the meet solves the step, but the journal never writes the height', () => {
    const lab = meet(L.init(MINARET));
    expect(L.isSolved(lab)).toBe(true);
    expect(L.journalRows(lab, { hideHeight: true })).toMatchObject([{ height: null, solved: true, shadow: shadow(725, '15:00') }]);
    expect(L.journalRows(lab)).toMatchObject([{ height: 725 }]);           // without the flag (lesson 1): unchanged
  });
  it('shownValues lists the ground lengths and the 1 m stick — never the height', () => {
    const v = L.shownValues(MINARET);
    const of = (role) => v.filter((x) => x.role === role).map((x) => x.v).sort();
    const OA = shadow(725, '15:00'); const OB = shadow(100, '15:00');
    expect(of('height')).toEqual(['1']);
    expect(of('length')).toEqual([L.m(OB), L.m(OA - OB), L.m(OA)].sort());
    expect(v.some((x) => x.v === '7,25')).toBe(false);
    expect(L.shownValues({ ...MINARET, hideHeight: false }).some((x) => x.role === 'height' && x.v === '7,25')).toBe(true);
  });
});
