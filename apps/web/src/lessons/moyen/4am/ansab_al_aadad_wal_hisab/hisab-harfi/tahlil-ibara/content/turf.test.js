import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS, PREDICT, FREE } from './turf.js';
import { violations } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/turfFactoring.js';
import { chainsOfPlayer } from '../../../../../../common/manipulations/algebra/TurfFactoring.jsx';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Le gazon de tahlil-ibara (conseil du 2026-11-11, verdict L3). ÉCRIT AVANT les données des manches et lancé d'abord sur leurs nombres : pour
 * chaque manche, TOUT ce que son écran peut montrer (`logic › shownValues` : chaque r de la règle avec ses plaques restées dehors, chaque facteur
 * commun, chaque rangée et chaque égalité, les pastilles, les tuiles et le leurre développé ; chaque répartition du carré avec son coin) ne rencontre
 * jamais la signature de la مسألة (content/forbidden.js). Puis chaque manche est JOUÉE jusqu'à son but, comme le labo la joue : un essai = un r
 * NOUVEAU validé (r = 1 n'en est pas un) ou une répartition NOUVELLE fermée ; le premier refus est gratuit ; le même deux fois ne compte pas.
 */
const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const labOf = (p) => (p.mode === 'square' ? L.initSquare({ b: p.b, c: p.c }) : L.initRows({ expr: p.expr }));
const ready = (s) => (s.mode === 'rows' ? L.rowsDiscoveryReady(s) : L.squareDiscoveryReady(s));

/** Les gestes : rows — une liste de r validés ; square — une liste de « right » (le reste en bas), chacun fermé. */
function play(round, moves, { preds = [] } = {}) {
  const p = round.props;
  let s = labOf(p);
  let log = emptyLog();
  let refused = 0; let told = false;
  const done = new Set();
  preds.forEach((ok) => { log = logEvent(log, 'trial', { tk: 'predict', ok }); });
  const chains = chainsOfPlayer(p.mode, p.chains);
  moves.forEach((m) => {
    let trial; let isNew;
    if (s.mode === 'rows') {
      isNew = L.isNewRows(s, m);
      s = L.setRows(s, m);
      trial = { r: m, valid: L.rowsLayout(s, m).valid };
    } else {
      s = L.reopen(s);
      while (s.right > 0) s = L.place(s, 'right', 'stock');
      while (s.bottom > 0) s = L.place(s, 'bottom', 'stock');
      for (let i = 0; i < m; i += 1) s = L.place(s, 'stock', 'right');
      while (L.stock(s) > 0) s = L.place(s, 'stock', 'bottom');
      isNew = L.isNewSplit(s);
      s = L.close(s);
      trial = s.trials.at(-1);
    }
    const v = L.verdictOf(s, trial);
    if (v && isNew) {
      const free = !v.exact && refused === 0;
      if (!v.exact) refused += 1;
      log = logEvent(log, 'verdict', { ...v, ...(free ? { free: true } : {}) });
    }
    if (ready(s) && !told) { told = true; log = logEvent(log, 'trial', { tk: 'discovered' }); }
    chains.filter((c) => c.reached(s) && !done.has(c.id)).forEach((c) => { done.add(c.id); log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: c.id }); });
  });
  return { s, log, done };
}

const [r1, r2, r3, star, free] = M1_ROUNDS;
const [m2, m2free] = M2_ROUNDS;

describe('the forbidden rule (content/forbidden.js) catches what it must, in its role', () => {
  it('flags the climax common factor, row, counts, equalities and Samir\'s picture', () => {
    expect(violations(L.shownValues({ mode: 'rows', expr: '10x^2+15x', chains: 'full' })).length).toBeGreaterThan(0);
    expect(violations(L.shownValues({ mode: 'rows', expr: '4x^2+6x' })).some((x) => x.includes('pair'))).toBe(true);     // 2 : 3 → 2x + 3
    expect(violations(L.shownValues({ mode: 'rows', expr: '4x^2+2x' })).some((x) => x.includes('3:x2×1'))).toBe(true);  // 3 rows, one big square out
    expect(violations([{ role: 'common', v: '5x' }, { role: 'inner', v: '2x + 3' }, { role: 'eq', v: '5(2x^2 + 3x)' }])).toHaveLength(3);
    // another role: 5 as a count of plates, 3 as the number of rows, 2x + 3 never shown as a count
    expect(violations([{ role: 'count', v: '5' }, { role: 'tick', v: '3' }, { role: 'leftover', v: '3:x×2' }])).toEqual([]);
  });
});

describe('every round screen is clean (shownValues × forbidden), easier rounds and free choices included', () => {
  ALL.forEach((round) => [round, round.easier].filter(Boolean).forEach((x) => {
    it(`${round.id}${x === round ? '' : ' (easier)'}: ${JSON.stringify({ ...x.props, lead: undefined, mission: undefined, choices: undefined })}`, () => {
      expect(violations(L.shownValues(x.props), round.id)).toEqual([]);
    });
  }));
  it('the free choices one by one', () => {
    FREE.forEach((c) => expect(violations(L.shownValues(c), JSON.stringify(c))).toEqual([]));
  });
});

describe('every round is played to its goal; ★★★ within maxTrials', () => {
  it('r1 8x + 6: refuse 3 (free), see 2, then the chain → won ★★★ (no prediction asked)', () => {
    const { log } = play(r1, [3, 2]);
    expect(roundWon(r1, log)).toBe(true);
    expect(countedTrials(log)).toBe(1);
    expect(starsFor(r1, log)).toBe(3);
  });
  it('r1: r = 1 is not a trial, the same r twice is not a trial — a repeated refusal never opens « جرّب أصغر »', () => {
    const { log } = play(r1, [1, 3, 3, 3, 3]);
    expect(countedTrials(log)).toBe(0);
    expect(needsHelp(r1, log)).toBe(false);
    const many = play(r1, [3, 4, 5, 6]).log;
    expect(needsHelp(r1, many)).toBe(true);
  });
  it('r2 6x² + 2x: two right predictions, refuse 3, see 2 → ★★★; the gcd is the largest valid r', () => {
    const lab = labOf(r2.props);
    expect(L.rowsGcd(lab)).toBe(2);
    expect(PREDICT.r2.map((k) => L.predictTruth(lab, k))).toEqual(['x', 2]);
    const { log } = play(r2, [3, 2], { preds: [true, true] });
    expect(roundWon(r2, log)).toBe(true);
    expect(starsFor(r2, log)).toBe(3);
    expect(roundWon(r2, play(r2, [2]).log)).toBe(false);   // { above: 2 } — the largest is SEEN, never guessed
  });
  it('r3 x² + 6x + 9: refuse 2|4 (free), close 3|3 → ★★★; only 3|3 closes', () => {
    const lab = labOf(r3.props);
    expect(Array.from({ length: 7 }, (_, p) => p * (6 - p)).filter((n) => n === 9)).toHaveLength(1);
    expect(L.predictTruth(lab, 'sideStrips')).toBe(3);
    const { log } = play(r3, [2, 3], { preds: [true] });
    expect(roundWon(r3, log)).toBe(true);
    expect(starsFor(r3, log)).toBe(3);
    // closed first, then a refusal: the goal still asks for the contrast
    expect(roundWon(r3, play(r3, [3]).log)).toBe(false);
    expect(roundWon(r3, play(r3, [3, 1]).log)).toBe(true);
  });
  it('⭐ x² + 8x + 16: 4|4 in at most two closes', () => {
    expect(roundWon(star, play(star, [4]).log)).toBe(true);
    expect(starsFor(star, play(star, [3, 4]).log)).toBe(3);
  });
  it('the easier rounds are won by doing', () => {
    expect(roundWon(r1.easier, play(r1.easier, [3, 2]).log)).toBe(true);
    expect(roundWon(r2.easier, play(r2.easier, [3, 2]).log)).toBe(true);
    expect(roundWon(r3.easier, play(r3.easier, [0, 1]).log)).toBe(true);
  });
  it('M2 x² + 25: the only close is refused (free) and the chain follows', () => {
    const lab = labOf(m2.props);
    expect(L.closable(lab)).toBe(false);
    expect(L.predictTruth(lab, 'closes')).toBe('no');
    const { log } = play(m2, [0], { preds: [true] });
    expect(roundWon(m2, log)).toBe(true);
    expect(starsFor(m2, log)).toBe(3);
  });
  it('every question a round asks is in its goal (the win card never covers an open question)', () => {
    ALL.filter((r) => !r.free).forEach((r) => {
      const ids = chainsOfPlayer(r.props.mode, r.props.chains).map((c) => c.id);
      ids.forEach((id) => expect(r.goal, `${r.id} ${id}`).toContainEqual({ checkpoint: id }));
    });
  });
  it('predictions: ≤ 2 per round, different right answers within a round, the right position varies', () => {
    const pos = [];
    ALL.forEach((r) => {
      const keys = r.props.predict ?? [];
      expect(keys.length).toBeLessThanOrEqual(2);
      const lab = labOf(r.props);
      const truths = keys.map((k) => String(L.predictTruth(lab, k)));
      expect(new Set(truths).size).toBe(truths.length);
      keys.forEach((k) => pos.push(L.predictOptions(lab, k).map(String).indexOf(String(L.predictTruth(lab, k)))));
    });
    expect(pos.every((i) => i >= 0)).toBe(true);
    expect(new Set(pos).size).toBeGreaterThanOrEqual(3);
  });
  it('every round that BUILDS has a decoy distinct from the right tiles', () => {
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props;
      if (!p.chains || p.chains === 'none') return;
      const lab = labOf(p);
      const bp = p.mode === 'square' ? L.buildSquareParts(lab) : L.buildFactorParts(lab);
      expect(bp.expected, r.id).not.toContain(bp.decoyTex);
    }));
  });
  it('the free rounds have no goal and the free choices are real labs', () => {
    expect(free.free && m2free.free).toBe(true);
    FREE.forEach((c) => expect(() => labOf(c)).not.toThrow());
  });
});
