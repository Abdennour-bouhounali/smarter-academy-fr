import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS, PREDICT, FREE } from './pitches.js';
import { violations, oppositeCross } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/pitchExpansion.js';
import { CHAINS_PLAYER } from '../../../../../../common/manipulations/algebra/PitchExpansion.jsx';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Le terrain découpé de nashr-tabsit (conseil du 2026-11-11, verdict L1). ÉCRIT AVANT les données des manches et lancé d'abord sur leurs nombres :
 * pour chaque manche (et son entraînement, le module 2, la ورشة libre), TOUT ce que son écran peut montrer (`logic › shownValues` : chaque x
 * atteignable, chaque côté, chaque aire, chaque somme de sous-ensemble, chaque terme et chaque forme fausse) ne rencontre jamais la signature de la
 * مسألة (content/forbidden.js), et aucun x atteignable n'est une collision d'aires. Puis chaque manche est JOUÉE jusqu'à son but, comme le labo
 * la joue (un essai = un appui sur « تحقّق »).
 */
const ALL = [...M1_ROUNDS, ...M2_ROUNDS.slice(0, 1)];
const playable = ALL.filter((r) => !r.free);
const simpOf = (p) => p.labels !== 'area';

/**
 * Rejoue une manche. `moves` : ['c', id…] porter des zones, ['m'] réunir les termes semblables, ['v', x] « تحقّق » à x. Chaque essai NOUVEAU est
 * un verdict (le premier refus gratuit), la découverte et les suites sont annoncées quand le labo les atteint.
 */
function play(props, moves, { preds = [], answer = true } = {}) {
  let s = L.init({ expr: props.expr, simplify: simpOf(props) });
  let log = emptyLog();
  let refused = 0; let told = false;
  const done = new Set();
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  const chains = CHAINS_PLAYER[props.chains] ?? [];
  const xs = L.playerXs(props);
  moves.forEach(([m, ...a]) => {
    if (m === 'c') a.forEach((id) => { s = L.collect(s, id); });
    if (m === 'm') {
      [0, 1, 2].forEach((p) => {
        let like = s.tray.filter((c) => c.term.p === p);
        while (like.length > 1) { s = L.merge(s, like[0].id, like[1].id); like = s.tray.filter((c) => c.term.p === p); }
      });
    }
    if (m === 'v') {
      const x = a[0];
      expect(xs, `${props.expr}: x = ${x} reachable`).toContain(x);
      const again = L.sameTrial(s, x);
      if (!again) {
        s = L.verify(s, x);
        const v = L.verdictOf(s.trials.find((t) => t.x === x));
        const free = !v.exact && refused === 0;
        if (!v.exact) refused += 1;
        log = logEvent(log, 'verdict', { ...v, ...(free ? { free: true } : {}) });
      }
      if (L.playerDiscovery(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
    }
    chains.filter((c) => c.reached(s) && !done.has(c.id)).forEach((c) => {
      if (!answer) return;
      done.add(c.id);
      log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: c.id });
    });
  });
  return { s, log, done };
}
const all = (props) => L.init({ expr: props.expr }).cells.map((c) => c.id);

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the climax pitch, its sides at 30, its terms and its expansions — and a clean screen passes', () => {
    expect(violations(L.shownValues({ expr: '2x+10|x-4', span: 30, labels: 'terms' })).length).toBeGreaterThan(0);
    expect(violations([{ role: 'x', v: '30' }])).toHaveLength(1);
    expect(violations([{ role: 'side', v: '26' }])).toHaveLength(1);
    expect(violations([{ role: 'term', v: '-8x' }])).toHaveLength(1);
    expect(violations([{ role: 'expansion', v: '2x^2 - 40' }])).toHaveLength(1);
    expect(violations([{ role: 'factor', v: '(x - 4)' }])).toHaveLength(1);
    expect(violations([{ role: 'sum', v: '1820' }])).toHaveLength(1);
    // 27 is a SIDE in the climax: an AREA of 27 (3x at x = 9) is another role
    expect(violations([{ role: 'area', v: '27' }, { role: 'x', v: '4' }])).toHaveLength(0);
    expect(oppositeCross('2x+10|x-4')).toBe(true);
    expect(oppositeCross('x-2|2x-1')).toBe(false);
  });
});

describe('the pitch rounds of nashr-tabsit', () => {
  it('the council\'s numbers: 3(x + 5) → (3x − 1)(3 + x) → (x − 2)(2x − 1) → ⭐ → free; practice 2(x + 1), (x − 1)(x + 2), (x − 1)(x − 2); module 2 (2x − 3)(x − 1)', () => {
    expect(M1_ROUNDS.map((r) => [r.props.expr, r.props.labels])).toEqual([
      ['3|x+5', 'area'], ['3x-1|3+x', 'area'], ['x-2|2x-1', 'terms'], ['3x-2|2x-1', 'terms'], ['x+1|2x+3', 'terms']]);
    expect(M1_ROUNDS.slice(0, 3).map((r) => easierProps(r).expr)).toEqual(['2|x+1', 'x-1|x+2', 'x-1|x-2']);
    expect(M2_ROUNDS[0].props.expr).toBe('2x-3|x-1');
    expect(M1_ROUNDS.map((r) => r.props.chains)).toEqual(['dist', 'double', 'restored', 'none', 'none']);
  });

  it('the council\'s ruler settings, recomputed: r1 1..9 without 5 (start 3), r2 1..6 without 3 (start 2), r1e 2..7, r2e 3..7', () => {
    expect(L.playerXs(M1_ROUNDS[0].props)).toEqual([1, 2, 3, 4, 6, 7, 8, 9]);
    expect(L.startXOf(M1_ROUNDS[0].props)).toBe(3);
    expect(L.playerXs(M1_ROUNDS[1].props)).toEqual([1, 2, 4, 5, 6]);
    expect(L.startXOf(M1_ROUNDS[1].props)).toBe(2);
    expect(L.playerXs(easierProps(M1_ROUNDS[0]))).toEqual([2, 3, 4, 5, 6, 7]);
    expect(L.playerXs(easierProps(M1_ROUNDS[1]))).toEqual([3, 4, 5, 6, 7]);
    // r1 keeps x = 9 (module 1 step 1 reads 3 × (9 + 5))
    expect(L.playerXs(M1_ROUNDS[0].props)).toContain(9);
  });

  it('SWEEP: no reachable x of any area-mode round (required, practice) is a collision; the start is never one', () => {
    let n = 0;
    ALL.forEach((r) => [r.props, r.easier ? easierProps(r) : null].filter((p) => p && p.labels === 'area').forEach((p) => {
      L.playerXs(p).forEach((x) => { n += 1; expect(L.areaCollisions(p.expr, x), `${p.expr} @ ${x}`).toEqual([]); });
      expect(L.areaCollisions(p.expr, L.startXOf(p))).toEqual([]);
    }));
    expect(n).toBeGreaterThan(20);
  });

  it('no screen of any round, practice round, module 2 or free pitch meets the climax signature (role-paired, every reachable x, every subset sum)', () => {
    let total = 0;
    ALL.forEach((r) => [r.props, r.easier ? easierProps(r) : null].filter(Boolean).forEach((p) => {
      const shown = L.shownValues(p);
      total += shown.length;
      expect(violations(shown, `${r.id} ${p.expr}`), r.id).toEqual([]);
    }));
    FREE.forEach((e) => expect(violations(L.shownValues({ expr: e, span: 5, labels: 'terms' }), `free ${e}`)).toEqual([]));
    expect(total).toBeGreaterThan(300);
    // every number written in a title, a lead, a mission or a help line
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props ?? x;
      const words = `${r.title ?? ''} ${p.lead} ${p.mission} ${x.helpLine ?? ''}`.match(/\d+/g) ?? [];
      words.forEach((w) => expect(['30', '31', '70', '26', '72', '27', '60', '1820', '1760', '1944', '124', '1500', '350', '40', '36'].includes(w), `${r.id}: ${w}`).toBe(false));
    }));
  });

  it('no round in which the student REDUCES (terms mode) rehearses the climax method: its cross terms have the same sign', () => {
    ALL.forEach((r) => [r.props, r.easier ? easierProps(r) : null].filter((p) => p && p.labels === 'terms').forEach((p) => {
      expect(oppositeCross(p.expr), `${r.id} ${p.expr}`).toBe(false);
    }));
    FREE.forEach((e) => expect(oppositeCross(e), e).toBe(false));
    // module 2's pitch: at least one hatched factor, not in the free choices, not r3's pitch
    expect(M2_ROUNDS[0].props.expr).toMatch(/-/);
    expect(FREE).not.toContain(M2_ROUNDS[0].props.expr);
    expect(M2_ROUNDS[0].props.expr).not.toBe(M1_ROUNDS[2].props.expr);
  });

  it('predictions: at most two per round, their truths differ within a round, the right option moves (2nd, 1st, 2nd)', () => {
    const lab = (p) => L.init({ expr: p.expr, simplify: simpOf(p) });
    const r2 = PREDICT.r2.map((p) => L.predictTruth(lab(M1_ROUNDS[1].props), p.kind));
    expect(r2).toEqual(['no', 'yes']);
    const r3 = PREDICT.r3.map((p) => L.predictTruth(lab(M1_ROUNDS[2].props), p.kind));
    expect(r3).toEqual(['3']);
    const pos = [...PREDICT.r2.map((p, i) => L.predictOptions(lab(M1_ROUNDS[1].props), p.kind).indexOf(r2[i])),
      L.predictOptions(lab(M1_ROUNDS[2].props), 'termsLeft').indexOf(r3[0])];
    expect(pos).toEqual([1, 0, 1]);
    M1_ROUNDS.forEach((r) => expect((r.props.predict ?? []).length, r.id).toBeLessThanOrEqual(2));
  });

  it('every goal is reachable by doing, with three stars inside maxTrials; the first refusal is free', () => {
    const r1 = M1_ROUNDS[0].props; const r2 = M1_ROUNDS[1].props; const r3 = M1_ROUNDS[2].props;
    const plays = {
      r1: play(r1, [['c', '0-0'], ['v', 3], ['c', '0-1'], ['v', 3], ['v', 9]]),
      r2: play(r2, [['c', '0-0', '0-1'], ['v', 2], ['c', '1-0', '1-1'], ['v', 2], ['v', 5]], { preds: [true, true] }),
      r3: play(r3, [['c', ...all(r3)], ['m'], ['v', 5], ['v', 7]], { preds: [true] }),
      challenge: play(M1_ROUNDS[3].props, [['c', ...all(M1_ROUNDS[3].props)], ['m'], ['v', 2], ['v', 4]]),
      m2: play(M2_ROUNDS[0].props, [['c', ...all(M2_ROUNDS[0].props)], ['m'], ['v', 3], ['v', 5]]),
    };
    playable.forEach((r) => {
      const { log } = plays[r.id];
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
    expect(countedTrials(plays.r1.log)).toBe(2);   // the partial first check is the free refusal
    expect(countedTrials(plays.r2.log)).toBe(2);
    // the practice rounds are won too
    M1_ROUNDS.slice(0, 3).forEach((r, i) => {
      const p = easierProps(r);
      const xs = L.playerXs(p);
      const moves = [['c', ...all(p)], ...(simpOf(p) ? [['m']] : []), ['v', xs[0]], ['v', xs[1]]];
      expect(roundWon({ id: `e${i}`, goal: r.easier.goal }, play(p, moves).log), `easier ${r.id}`).toBe(true);
      expect(r.easier.releases).toBe(true);
    });
  });

  it('a round is never won while its question is open: every question asked is in the goal', () => {
    playable.forEach((r) => {
      (CHAINS_PLAYER[r.props.chains] ?? []).forEach((c) => expect(r.goal.some((g) => g.checkpoint === c.id), `${r.id} ${c.id}`).toBe(true));
      if (r.easier) (CHAINS_PLAYER[easierProps(r).chains] ?? []).forEach((c) => expect(r.easier.goal.some((g) => g.checkpoint === c.id), `easier ${r.id} ${c.id}`).toBe(true));
    });
    const r2 = M1_ROUNDS[1].props;
    expect(roundWon(M1_ROUNDS[1], play(r2, [['c', ...all(r2)], ['v', 2], ['v', 5]], { answer: false }).log)).toBe(false);
  });

  it('the same x with the same tray is not a trial; three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const r1 = M1_ROUNDS[0].props;
    const same = play(r1, [['c', '0-0'], ['v', 3], ['v', 3], ['v', 3]]);
    expect(same.log.verdicts).toHaveLength(1);
    const stuck = play(r1, [['c', '0-0'], ['v', 3], ['v', 4], ['v', 6]]);
    expect(needsHelp(M1_ROUNDS[0], stuck.log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], stuck.log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], stuck.log)).toBe(false);
  });
});
