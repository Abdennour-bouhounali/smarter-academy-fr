import { describe, it, expect } from 'vitest';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { M1_ROUNDS, M2_ROUNDS, PREDICT, FREE } from './banner.js';
import { violations, BAD_LENGTH, NEVER } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/segmentDivider.js';
import { CHAINS_PLAYER, chainsOfPlayer } from '../../../../../../common/manipulations/geometry/SegmentDivider.jsx';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * L'éventail des parallèles d'inshaat-talis (conseil du 2026-11-10, verdict L3). ÉCRIT AVANT les données des manches et lancé d'abord sur leurs
 * nombres : pour chaque manche, TOUT ce que son écran peut montrer (`logic › shownValues` : les longueurs, chaque paire de rangs atteignable avec
 * son rapport et son t, les pastilles, les leurres, les manches libres) ne rencontre jamais la signature de la مسألة (content/forbidden.js). Puis
 * chaque manche est JOUÉE jusqu'à son but, comme le labo la joue : un essai = une construction FINIE ou une règle posée ; le premier refus est
 * gratuit ; la même construction deux fois ne compte pas.
 */
const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const playable = ALL.filter((r) => !r.free);
const labOf = (p) => L.init({ mode: p.mode, parts: p.parts, p: p.p, q: p.q, marks: p.marks, length: p.length ?? 9, sameUnitOnly: p.sameUnitOnly ?? true, player: true });
const events = (s) => (s.mode === 'ratio' ? s.joins.length : s.trials.length);

/** Les gestes de l'élève. equal : { n, joined?, open? } une construction entière ; ratio : { grad: [[rail, n, open?]…] } puis { ruler: [a, b] } (rangs signés, × l'unité). */
function play(round, moves, { preds = [], answer = true } = {}) {
  const { props } = round;
  let s = labOf(props);
  let log = emptyLog();
  let refused = 0; let told = false; let unit = 10;
  const done = new Set();
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  const chains = chainsOfPlayer(props.mode, props.chains);
  moves.forEach((m) => {
    const before = events(s);
    if (m.fresh) { s = L.fresh(s); return; }
    if (m.grad) {
      m.grad.forEach(([rail, n, open]) => { if (open != null) { unit = open; s = L.setOpening(s, open); } for (let i = 0; i < n; i += 1) s = L.carry(s, rail); });
      return;
    }
    if (m.ruler) s = L.commitRuler(L.setEnd(L.setEnd(s, 'a', m.ruler[0] * (m.unitA ?? unit)), 'b', m.ruler[1] * (m.unitB ?? unit)));
    else {
      if (L.markCount(s) > 0) s = L.fresh(s);
      if (m.open != null) s = L.setOpening(s, m.open);
      for (let i = 0; i < m.n; i += 1) { if (m.changeAt === i) s = L.setOpening(s, s.opening + 4); s = L.carry(s); }
      s = L.join(s, (m.joined ?? m.n) - 1);
      for (let i = 0; i < s.joined; i += 1) s = L.draw(L.setSlide(s, L.rayMarks(s)[i].pos));
    }
    if (events(s) > before) {
      const v = L.verdictOf(s);
      if (!L.repeatedTrial(s)) {
        const free = !v.exact && refused === 0;
        if (!v.exact) refused += 1;
        log = logEvent(log, 'verdict', { ...v, ...(free ? { free: true } : {}) });
      }
      if (L.discoveryReady(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
    }
    chains.filter((c) => c.reached(s) && !done.has(c.id)).forEach((c) => {
      if (!answer) return;
      done.add(c.id);
      log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: c.id });
    });
  });
  return { s, log, done };
}

const [r1, r2, r3, star, free] = M1_ROUNDS;
const [m2] = M2_ROUNDS;
const INSIDE = (p, q) => [{ grad: [['a-', p, 10], ['a+', p], ['b+', q]] }, { ruler: [-p, q] }];
const BOTH = (p, q) => [...INSIDE(p, q), { ruler: [p, q] }];

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the climax length, ratios, parts of the whole and ranks — in their role only', () => {
    expect(violations(L.shownValues({ mode: 'equal', parts: 3, length: 10 })).length).toBeGreaterThan(0);          // AB = 10
    expect(violations(L.shownValues({ mode: 'ratio', p: 2, q: 3, marks: 4 })).some((x) => x.includes('4/3'))).toBe(true);   // a 4th graduation reaches 4/3
    expect(violations([{ role: 'ratio', v: '4/3' }, { role: 'ratio', v: '3/4' }])).toHaveLength(2);
    expect(violations([{ role: 't', v: '4/7' }, { role: 'decoy-t', v: '3/7' }, { role: 't', v: '4' }])).toHaveLength(3);
    expect(violations([{ role: 'length', v: '40/7' }, { role: 'length', v: '30' }, { role: 'length', v: '10' }])).toHaveLength(3);
    expect(violations([{ role: 'rank', v: '4' }, { role: 'pair', v: '4:3' }])).toHaveLength(2);
    // another role: the 4th mark of an equal division, 3/4 as a part of the whole, an angle of 30 or 40 degrees, a length of 4
    expect(violations([{ role: 'count', v: '4' }, { role: 't', v: '3/4' }, { role: 'angle', v: '30' }, { role: 'angle', v: '40' }, { role: 'length', v: '4' }])).toEqual([]);
  });
});

describe('the divider rounds of inshaat-talis', () => {
  it('the council\'s numbers: 8 cm in 3 → 11 cm in 5 → ratio 2/3 (3 marks, one unit) → ⭐ 1/3 → free; module 2: ratio 3/2', () => {
    const sig = (p) => (p.mode === 'equal' ? ['equal', p.parts, p.length] : ['ratio', `${p.p}/${p.q}`, p.marks, p.sameUnitOnly]);
    expect(M1_ROUNDS.slice(0, 4).map((r) => sig(r.props))).toEqual([['equal', 3, 8], ['equal', 5, 11], ['ratio', '2/3', 3, true], ['ratio', '1/3', 3, true]]);
    expect(M1_ROUNDS.slice(0, 3).map((r) => sig(r.easier.props))).toEqual([['equal', 2, 6], ['equal', 3, 6], ['ratio', '1/2', 2, true]]);
    expect(sig(m2.props)).toEqual(['ratio', '3/2', 3, true]);
    expect(FREE.map((c) => (c.mode === 'equal' ? c.parts : `${c.p}/${c.q}`))).toEqual([3, 5, '3/2', '2/1', '1/2']);
    expect(FREE.filter((c) => c.mode === 'equal').map((c) => c.length)).toEqual([12, 12]);
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['full', 'build', 'full', 'none', 'none']);
    expect(m2.props.chains).toBe('build');
    expect(r2.props.contrast).toBe(true);
    // L3.4: the contrast (`discovered`) is asked in r2 only
    expect(ALL.filter((r) => (r.goal ?? []).some((g) => g.discovered)).map((r) => r.id)).toEqual(['r2']);
    // never the default length of the page (10): every equal round states its own
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => { if (x.props.mode === 'equal') expect(BAD_LENGTH.includes(String(x.props.length)), r.id).toBe(false); }));
    expect(labOf(r3.props).length).toBe(9);
  });

  it('no screen of any round, practice round or free choice meets the climax signature (role-paired, dry-run over every reachable value)', () => {
    let n = 0;
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const shown = L.shownValues(x.props);
      n += shown.length;
      expect(violations(shown, r.id), r.id).toEqual([]);
    }));
    expect(n).toBeGreaterThan(900);
    // every number written in a title, a lead, a mission or a help line
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const text = `${r.title ?? ''} ${x.props.lead} ${x.props.mission} ${x.helpLine ?? ''}`;
      (text.match(/\d+/g) ?? []).forEach((w) => expect([...BAD_LENGTH, ...NEVER, '4'].includes(w), `${r.id}: ${w}`).toBe(false));
      ['{4}{3}', '{3}{4}', '{4}{7}', '{3}{7}'].forEach((f) => expect(text.includes(f), `${r.id} ${f}`).toBe(false));
      expect(text.includes('الكتاب'), r.id).toBe(false);
    }));
  });

  it('with the cap and one unit, EVERY ruler a student can pose in a ratio round is judged on a clean ratio; mixed units are refused', () => {
    [r3, r3.easier, star, m2, ...FREE.filter((c) => c.mode === 'ratio').map((c) => ({ props: { ...c, sameUnitOnly: true } }))].forEach((x) => {
      const cap = x.props.marks;
      let s = labOf(x.props);
      ['a-', 'a+', 'b-', 'b+'].forEach((rail) => { for (let i = 0; i < cap + 1; i += 1) s = L.carry(s, rail); });
      expect(L.markCount(s)).toBe(4 * cap);                    // the cap holds
      for (const a of L.lineMarks(s, 'a')) for (const b of L.lineMarks(s, 'b')) {
        const j = L.commitRuler(L.setEnd(L.setEnd(s, 'a', a), 'b', b)).last.join;
        if (j.parallel) continue;
        expect(['4/3', '3/4']).not.toContain(LIN.fracText(j.ratio));
        expect(['4/7', '3/7', '4']).not.toContain(LIN.fracText(j.t).replace('-', ''));
      }
    });
    // two openings: refused, in words — never a ratio
    const mixed = play(r3, [{ grad: [['a-', 3, 12], ['b+', 3, 9]] }, { ruler: [-3, 3], unitA: 12, unitB: 9 }]);
    expect(mixed.s.joins.at(-1)).toMatchObject({ kind: 'units', mixed: true });
    expect(mixed.log.verdicts).toEqual([{ groups: 0, exact: false, free: true }]);
  });

  it('predictions: at most two per round, their truths differ within a round, the right option moves (2nd · 1st, 3rd · 2nd, 3rd · 1st)', () => {
    const place = (round) => (round.props.predict ?? []).map((key) => { const lab = labOf(round.props); return L.predictOptions(lab, key).indexOf(L.predictTruth(lab, key)); });
    expect(place(r1)).toEqual([1]);
    expect(place(r2)).toEqual([0, 2]);
    expect(place(r3)).toEqual([1, 2]);
    expect(place(m2)).toEqual([0]);
    ALL.forEach((r) => {
      const keys = r.props.predict ?? [];
      expect(keys.length, r.id).toBeLessThanOrEqual(2);
      const truths = keys.map((key) => String(L.predictTruth(labOf(r.props), key)));
      expect(new Set(truths).size, r.id).toBe(truths.length);
      keys.forEach((key) => expect(L.PREDICT_KEYS[r.props.mode]).toContain(key));
    });
    expect(PREDICT.r2).toEqual(['joinWhich', 'parallels']);
    // L3.7: « same side » — before A in r3 (2 < 3), AFTER B in module 2 (3 > 2)
    expect(L.predictTruth(labOf(r3.props), 'same')).toBe('before');
    expect(L.predictTruth(labOf(m2.props), 'same')).toBe('after');
  });

  it('every goal is reachable by doing, with three stars inside maxTrials; the first refusal is free', () => {
    const plays = {
      'm1:r1': play(r1, [{ n: 3, joined: 2 }, { n: 3 }], { preds: [true] }),                 // a wrong mark first (free), then the right one
      'm1:r2': play(r2, [{ n: 5 }, { n: 5, open: 20 }], { preds: [true, true] }),            // twice, two openings: the contrast
      'm1:r3': play(r3, BOTH(2, 3), { preds: [true, true] }),
      'm1:challenge': play(star, BOTH(1, 3)),
      'm2:r1': play(m2, BOTH(3, 2), { preds: [true] }),
    };
    [['m1', M1_ROUNDS], ['m2', M2_ROUNDS]].forEach(([lab, rounds]) => rounds.filter((r) => !r.free).forEach((r) => {
      const { log } = plays[`${lab}:${r.id}`];
      expect(roundWon(r, log), `${lab} ${r.id}`).toBe(true);
      expect(starsFor(r, log), `${lab} ${r.id}`).toBe(3);
      expect(countedTrials(log), `${lab} ${r.id}`).toBeLessThanOrEqual(r.stars.maxTrials);
    }));
    expect(countedTrials(plays['m1:r1'].log)).toBe(1);
    // r2's contrast can also be a FAILED construction (one opening changed on the way) followed by a right one
    const viaFailure = play(r2, [{ n: 5, changeAt: 3 }, { n: 5 }], { preds: [true, true] });
    expect(viaFailure.s.trials.map((t) => t.kind)).toEqual(['unequal', 'ok']);
    expect(roundWon(r2, viaFailure.log)).toBe(true);
    // the lengths a won round shows: 8/3 and 11/5 (never a climax length)
    expect(L.lengthTex(plays['m1:r1'].s, LIN.frac(1, 3))).toBe('\\dfrac{8}{3} \\approx 2{,}67');
    expect(L.lengthTex(plays['m1:r2'].s, LIN.frac(1, 5))).toBe('2{,}2');
    // the practice rounds are won too
    expect(roundWon({ id: 'e1', goal: r1.easier.goal }, play(r1.easier, [{ n: 2 }]).log)).toBe(true);
    expect(roundWon({ id: 'e2', goal: r2.easier.goal }, play(r2.easier, [{ n: 3 }]).log)).toBe(true);
    expect(roundWon({ id: 'e3', goal: r3.easier.goal }, play(r3.easier, BOTH(1, 2)).log)).toBe(true);
  });

  it('the points the rounds find: 2/3 → M at 2/5, N before A; 3/2 → M at 3/5, N AFTER B; 1/3 → M at 1/4', () => {
    const pts = (round, p, q) => play(round, BOTH(p, q)).s.joins.map((j) => [j.kind, LIN.fracText(j.t)]);
    expect(pts(r3, 2, 3)).toEqual([['inside', '2/5'], ['outside', '-2']]);
    expect(pts(m2, 3, 2)).toEqual([['inside', '3/5'], ['outside', '3']]);
    expect(pts(star, 1, 3)).toEqual([['inside', '1/4'], ['outside', '-1/2']]);
  });

  it('a round is never won while its question is open: every question asked is in the goal', () => {
    playable.forEach((r) => {
      chainsOfPlayer(r.props.mode, r.props.chains).forEach((c) => expect(r.goal.some((g) => g.checkpoint === c.id), `${r.id} ${c.id}`).toBe(true));
    });
    expect(roundWon(r1, play(r1, [{ n: 3 }], { answer: false }).log)).toBe(false);
    expect(roundWon(r2, play(r2, [{ n: 5 }, { n: 5, open: 20 }], { answer: false }).log)).toBe(false);
    expect(roundWon(r3, play(r3, BOTH(2, 3), { answer: false }).log)).toBe(false);
    expect(roundWon(m2, play(m2, BOTH(3, 2), { answer: false }).log)).toBe(false);
    // r2 is not won by its question alone: the contrast must be DONE
    expect(roundWon(r2, play(r2, [{ n: 5 }]).log)).toBe(false);
    // the chains' shape
    expect(CHAINS_PLAYER.equal.full.map((c) => [c.id, c.qs])).toEqual([['rule', ['apFill', 'apBuild', 'rule']]]);
    expect(CHAINS_PLAYER.ratio.full.map((c) => c.id)).toEqual(['ranks', 'rule']);
  });

  it('the same construction again is not a trial; joining mark 1 never is; a ruler posed again is shown, not counted', () => {
    const twice = play(r1, [{ n: 3 }, { n: 3 }]);
    expect(twice.s.trials).toHaveLength(2);
    expect(twice.log.verdicts).toHaveLength(1);
    const s = L.join(L.carry(L.carry(labOf(r1.props))), 0);
    expect(s.last.kind).toBe('joinOne');
    expect(s.trials).toHaveLength(0);
    const again = play(r3, [...BOTH(2, 3), { ruler: [-2, 3] }]);
    expect(again.s.joins).toHaveLength(2);
    expect(again.log.verdicts).toHaveLength(2);
  });

  it('three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const { log } = play(r1, [{ n: 3, joined: 2 }, { n: 4, joined: 4 }, { n: 3, changeAt: 1 }]);
    expect(log.verdicts.filter((v) => !v.exact)).toHaveLength(3);
    expect(needsHelp(r1, log)).toBe(true);
    expect(needsHelp(star, log)).toBe(false);
    expect(needsHelp(free, log)).toBe(false);
    const ratio = play(r3, [{ grad: [['a+', 3, 10], ['b+', 3]] }, { ruler: [1, 2] }, { ruler: [3, 2] }, { ruler: [1, 3] }]);
    expect(needsHelp(r3, ratio.log)).toBe(true);
  });
});
