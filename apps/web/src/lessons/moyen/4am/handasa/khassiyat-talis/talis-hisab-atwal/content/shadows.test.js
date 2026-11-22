import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, PREDICT, FREE, R1, R1_EASY, R2, R3, R3_EASY, CHALLENGE } from './shadows.js';
import { violations, NEVER, BAD_LENGTH, BAD_RATIO } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/shadowMeet.js';
import { K25, HOURS } from '../../../../../../common/manipulations/logic/shadowWorld.js';
import { CHAINS } from '../../../../../../common/manipulations/geometry/ShadowMeet.jsx';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Les deux ombres de talis-hisab-atwal (conseil du 2026-11-10, verdict L1). Les nombres du verdict sont RECALCULÉS ici en fractions exactes
 * (k = K25 ÷ 25, en centimètres entiers) ; pour chaque manche, TOUT ce que son écran peut montrer (`logic › shownValues`) ne rencontre jamais
 * la signature de la مسألة ni le تحدّ de la synthèse (content/forbidden.js). Puis chaque manche est JOUÉE jusqu'à son but, comme le labo la joue
 * (un essai = une réponse ; la rencontre d'une étape qui ne demande rien est gratuite).
 */
const playable = M1_ROUNDS.filter((r) => !r.free);
const cm = (text) => Math.round(Number(String(text).replace(',', '.')) * 100);
/** L'ombre exacte (cm) : H × K25 ÷ 25 — un entier, sinon le test échoue. */
const shadow = (H, hour) => { const v = (H * K25[HOURS.indexOf(hour)]) / 25; if (!Number.isInteger(v)) throw new Error(`ombre non entière ${H} ${hour}`); return v; };

/**
 * Rejoue une manche. `answers` : par étape, la liste des réponses (cm) données ; une étape « meet » est d'abord amenée à la rencontre.
 * Les suites de questions sont annoncées quand le labo les atteint (`answer: false` : l'élève n'y répond pas).
 */
function play(props, answers, { preds = [], answer = true } = {}) {
  let s = L.init(props);
  let log = emptyLog();
  const done = new Set();
  const chains = CHAINS[props.chains] ?? [];
  const emit = () => { const v = L.verdictOf(s); if (v) log = logEvent(log, 'verdict', v); };
  const ask = () => chains.filter((c) => c.reached(s) && !done.has(c.id)).forEach((c) => {
    if (!answer) return;
    done.add(c.id);
    log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: c.id });
  });
  s.steps.forEach((step, i) => {
    if (step.task === 'meet') {
      s = L.settle(L.moveStick(s, step.meetX));
      expect(L.isMet(s)).toBe(true);
      emit();
      ask();
    }
    (answers[i] ?? []).forEach((a) => { s = L.answer(s, a); emit(); });
    ask();
    if (i === 0 && s.steps.length > 1) preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
    if (L.hasNext(s)) { expect(L.isSolved(s), `step ${i} solved`).toBe(true); s = L.nextStep(s); }
  });
  return { s, log, done };
}

describe('the council\'s numbers, recomputed with exact fractions', () => {
  it('r1 2,75 @14:00 → OA 3,3 · OB 1,2 · BA 2,1 ; the segment error is 1,75', () => {
    const s = L.stepOf(R1);
    expect([s.OA, s.OB, s.meetX]).toEqual([shadow(275, '14:00'), shadow(100, '14:00'), shadow(275, '14:00') - shadow(100, '14:00')]);
    expect([s.OA, s.OB, s.meetX]).toEqual([330, 120, 210]);
    expect((s.meetX * 100) / s.OB).toBe(175);
    expect(L.heightOptions(s).map((o) => o.text).sort()).toEqual(['1,75', '2,75', '3,1']);
  });
  it('r1 easier 1,5 @14:00 → 1,8 · 1,2 · 0,6 ; segment error 0,5 ; never the constant-gap chip (it would be 1,6)', () => {
    const s = L.stepOf(R1_EASY);
    expect([s.OA, s.OB, s.meetX]).toEqual([180, 120, 60]);
    expect((s.meetX * 100) / s.OB).toBe(50);
    expect(s.OA - (s.OB - 100)).toBe(160);
    expect(L.heightOptions(s).map((o) => o.text).sort()).toEqual(['0,5', '1,5', '1,8']);
  });
  it('r2 6,5 @14:00 → 7,8 · 1,2 · 6,6 then @16:00 → 14,82 · 2,28 · 12,54 ; OB/OA = 2/13 both times ; ×1,9', () => {
    const [a, b] = L.stepsOf(R2);
    expect([a.OA, a.OB, a.meetX]).toEqual([780, 120, 660]);
    expect([b.OA, b.OB, b.meetX]).toEqual([1482, 228, 1254]);
    expect(b.OA).toBe(shadow(650, '16:00'));
    expect(a.OB * 13).toBe(a.OA * 2);
    expect(b.OB * 13).toBe(b.OA * 2);
    expect(L.ratioText(a)).toBe('2/13');
    expect(b.OA * 10).toBe(a.OA * 19);
    expect(L.heightOptions(a).map((o) => o.text).sort()).toEqual(['5,5', '6,5', '7,6']);
    expect(b.ask).toBe(null);                    // 16:00 is observed, not computed
  });
  it('r3 pole 3,75 @14:30 → 4,95 (stick shadow 1,32) ; easier 2,25 @14:00 → 2,7', () => {
    const s = L.stepOf(R3);
    expect([s.OB, s.OA]).toEqual([132, 495]);
    expect(s.OA * 100).toBe(375 * s.OB);
    const e = L.stepOf(R3_EASY);
    expect([e.OB, e.OA]).toEqual([120, 270]);
  });
  it('⭐ 15:30 → palm 7,82 → 4,25 ; tower 13,8 · 1,84 · 11,96 → 7,5', () => {
    const [p, t] = L.stepsOf(CHALLENGE);
    expect([p.task, p.OA, p.OB, p.H]).toEqual(['ratio', 782, 184, 425]);
    expect(p.OA * 100).toBe(p.H * p.OB);
    expect([t.OA, t.OB, t.meetX, t.H]).toEqual([1380, 184, 1196, 750]);
    expect([p.ask.kind, t.ask.kind]).toEqual(['type', 'type']);
  });
  it('the free round: 5,75 / 6,75 / 9,25 at six hours — never 12:30, never 15:00', () => {
    expect(FREE.heights).toEqual(['5,75', '6,75', '9,25']);
    expect(FREE.hours).toEqual(['13:00', '13:30', '14:00', '14:30', '15:30', '16:00']);
    FREE.heights.forEach((height) => FREE.hours.forEach((hour) => expect(() => L.stepOf({ height, hour })).not.toThrow()));
    expect(M1_ROUNDS.at(-1).props.hour).toBe('14:00');
  });
  it('every hour of every round is one of the six allowed', () => {
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => L.stepsOf(x.props).forEach((s) => expect(FREE.hours).toContain(HOURS[s.hour]))));
  });
});

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the climax lengths and ratios in THEIR role, the synthesis challenge everywhere — and nothing of a clean screen', () => {
    expect(violations([{ role: 'length', v: '4,8' }])).toHaveLength(1);
    expect(violations([{ role: 'height', v: '4,5' }])).toHaveLength(1);
    expect(violations([{ role: 'decoy-height', v: '3' }])).toHaveLength(1);
    expect(violations([{ role: 'ratio', v: '2/5' }])).toHaveLength(1);
    expect(violations([{ role: 'hour', v: '15:00' }]).length).toBeGreaterThan(0);
    expect(violations([{ role: 'length', v: '1,6' }])).toHaveLength(1);            // the stick shadow of the synthesis hour
    expect(violations([{ role: 'height', v: '7,25' }])).toHaveLength(1);
    expect(violations([{ role: 'decoy-height', v: '3,96' }])).toHaveLength(1);
    // role-paired: 1,5 is a HEIGHT here (a ratio in the climax), 0,5 a height chip
    expect(violations([{ role: 'height', v: '1,5' }, { role: 'decoy-height', v: '0,5' }])).toEqual([]);
    expect(violations([{ role: 'ratio', v: '1,5' }])).toHaveLength(1);
    // the synthesis challenge itself, as a round, would be refused
    expect(violations(L.shownValues({ height: '7,25', hour: '15:00' })).length).toBeGreaterThan(2);
    expect(violations(L.shownValues({ height: '4,5', hour: '14:00' })).length).toBeGreaterThan(0);
  });
});

describe('the shadow rounds of talis-hisab-atwal', () => {
  it('five rounds: r1 → r2 → r3 (required) → ⭐ → free ; practice rounds for r1 and r3 only', () => {
    expect(M1_ROUNDS.map((r) => r.id)).toEqual(['r1', 'r2', 'r3', 'challenge', 'free']);
    expect(M1_ROUNDS.map((r) => r.props.type)).toEqual(Array(5).fill('shadow-meet'));
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['readFigure', 'same', 'flag', 'none', 'none']);
    expect(M1_ROUNDS.map((r) => Boolean(r.easier))).toEqual([true, false, true, false, false]);
    expect(M1_ROUNDS[3].optional).toBe(true);
    expect(M1_ROUNDS[4].free).toBe(true);
    expect(M1_ROUNDS.map((r) => r.stars?.maxTrials ?? null)).toEqual([2, 2, 2, 3, null]);
  });

  it('no screen of any round, practice round or free pair meets the climax signature (role-paired dry-run)', () => {
    const all = [];
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const shown = L.shownValues(x.props);
      expect(violations(shown, r.id), r.id).toEqual([]);
      all.push(...shown);
    }));
    expect(all.length).toBeGreaterThan(150);
    // every number written in a title, a lead, a mission or a help line
    M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const words = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`.match(/\d+(?:[,:]\d+)?/g) ?? [];
      words.forEach((w) => {
        expect(NEVER.includes(w), `${r.id}: ${w}`).toBe(false);
        expect(BAD_LENGTH.includes(w), `${r.id}: ${w}`).toBe(false);
        expect(BAD_RATIO.filter((x2) => x2 !== '2').includes(w), `${r.id}: ${w}`).toBe(false);
      });
    }));
  });

  it('predictions: two in r2 only, their truths differ, the right option is 2nd then 1st', () => {
    expect(Object.keys(PREDICT)).toEqual(['r2']);
    const lab = L.init(R2);
    const truths = PREDICT.r2.map((key) => L.predictTruth(lab, key));
    expect(truths).toEqual(['no', 'less']);
    expect(new Set(truths).size).toBe(2);
    expect(PREDICT.r2.map((key, i) => L.predictOptions(key).indexOf(truths[i]))).toEqual([1, 0]);
    M1_ROUNDS.forEach((r) => expect((r.props.predict ?? []).length, r.id).toBeLessThanOrEqual(2));
  });

  it('every goal is reachable by doing, with three stars inside maxTrials', () => {
    const plays = {
      r1: play(M1_ROUNDS[0].props, [[275]]),
      r2: play(M1_ROUNDS[1].props, [[650], []], { preds: [true, true] }),
      r3: play(M1_ROUNDS[2].props, [[495]]),
      challenge: play(M1_ROUNDS[3].props, [[425], [750]]),
    };
    playable.forEach((r) => {
      const { log } = plays[r.id];
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
    expect(countedTrials(plays.r2.log)).toBe(1);          // the 16:00 meet is free: one trial, the height
    // one wrong answer first still leaves three stars in r1 (maxTrials 2) ; two wrong ones do not
    expect(starsFor(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [[175, 275]]).log)).toBe(3);
    expect(starsFor(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [[175, 310, 275]]).log)).toBe(2);
    // a wrong prediction costs the second star in r2
    expect(starsFor(M1_ROUNDS[1], play(M1_ROUNDS[1].props, [[650], []], { preds: [true, false] }).log)).toBe(2);
    // the practice rounds are won too
    expect(roundWon({ id: 'e1', goal: M1_ROUNDS[0].easier.goal }, play(M1_ROUNDS[0].easier.props, [[150]]).log)).toBe(true);
    expect(roundWon({ id: 'e3', goal: M1_ROUNDS[2].easier.goal }, play(M1_ROUNDS[2].easier.props, [[270]]).log)).toBe(true);
  });

  it('a round is never won while its question is open: every question asked is in the goal', () => {
    playable.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      (CHAINS[x.props.chains] ?? []).forEach((c) => expect(x.goal.some((g) => g.checkpoint === c.id), `${r.id} ${c.id}`).toBe(true));
    }));
    expect(roundWon(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [[275]], { answer: false }).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[1], play(M1_ROUNDS[1].props, [[650], []], { answer: false }).log)).toBe(false);
    expect(roundWon(M1_ROUNDS[2], play(M1_ROUNDS[2].props, [[495]], { answer: false }).log)).toBe(false);
    // and never before the height is found: the meet alone does not win r1
    expect(roundWon(M1_ROUNDS[0], play(M1_ROUNDS[0].props, [[]]).log)).toBe(false);
  });

  it('the same answer twice is one trial; the meet of a step that asks a height is none', () => {
    const { log } = play(M1_ROUNDS[0].props, [[175, 175, 275]]);
    expect(log.verdicts).toHaveLength(2);
    expect(countedTrials(log)).toBe(2);
  });

  it('« جرّب أصغر » : two refused heights in r1, three refused flags in r3 ; never in r2, the challenge or the free round', () => {
    const lab1 = L.answer(L.answer(L.settle(L.moveStick(L.init(R1), 210)), 175), 310);
    let log = emptyLog();
    [175, 310].forEach((v, i) => { log = logEvent(log, 'verdict', { groups: 0, exact: false }); expect(lab1.wrong[0][i]).toBe(v); });
    expect(needsHelp(M1_ROUNDS[0], log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[1], log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[2], log)).toBe(false);     // r3 waits for a third refusal
    expect(needsHelp(M1_ROUNDS[2], logEvent(log, 'verdict', { groups: 0, exact: false }))).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], logEvent(log, 'verdict', { groups: 0, exact: false }))).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], log)).toBe(false);
    // the practice rounds are really smaller
    expect(cm(M1_ROUNDS[0].easier.props.height)).toBeLessThan(cm(M1_ROUNDS[0].props.height));
    expect(cm(M1_ROUNDS[2].easier.props.height)).toBeLessThan(cm(M1_ROUNDS[2].props.height));
  });

  it('a retry in the lab empties the round\'s verdicts; « إعادة » empties everything', () => {
    const { log } = play(M1_ROUNDS[0].props, [[275]]);
    expect(roundWon(M1_ROUNDS[0], logEvent(log, 'trial', { tk: 'retry' }))).toBe(false);
    expect(logEvent(log, 'trial', { tk: 'reset' })).toEqual(emptyLog());
  });
});
