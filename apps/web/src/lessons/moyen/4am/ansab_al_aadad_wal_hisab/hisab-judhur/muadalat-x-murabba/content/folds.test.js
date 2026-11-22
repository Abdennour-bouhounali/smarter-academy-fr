import { describe, it, expect } from 'vitest';
import * as L from '../../../../../../common/manipulations/logic/squareFold';
import { eqBuildOf } from '../../../../../../common/manipulations/roots/SquareFold';
import { conditionMet, emptyLog, starsFor } from '../../../../../../common/manipulations/rounds/roundsModel';
import { M1_ROUNDS, M2_ROUNDS } from './folds';

/** Joue une manche comme un élève qui ne se trompe pas : chaque carte résolue ; renvoie l'état et le journal (verdicts comptés comme le labo). */
function play(round) {
  const { targets, scale, radius } = round.props;
  let s = L.init({ targets, scale, radius, exactOnly: true });
  const log = emptyLog();
  const answer = (next) => {
    const kind = next.last?.kind;
    if (!(kind === 'nearTick' && next.last.free)) log.verdicts.push({ groups: next.card, exact: L.cardSolved(next, next.card) });
    s = next;
  };
  targets.forEach((_, i) => {
    s = L.setCard(s, i);
    const { r } = L.current(s);
    if (r.num < 0) { answer(L.declareNone(s)); return; }
    if (r.num === 0) { answer(L.pin(L.move(s, 0))); return; }
    const t0 = L.tickRoot(r, s.scale);
    [1, -1].forEach((sign) => {
      if (t0 != null) answer(L.pin(L.move(s, sign * t0)));
      else { answer(L.pin(L.move(s, sign * Math.round(Math.sqrt(r.num / r.den) * s.scale)))); answer(L.pinExact(s, sign)); }
    });
  });
  return { s, log };
}

const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const WITH_EASY = [...ALL, ...ALL.filter((r) => r.easier).map((r) => ({ ...r.easier, id: `${r.id}-easy` }))];
/** Les nombres de la مسألة (module 4) : ses cartes, leurs solutions, la lecture fausse de سلمى, les points, les 42 élèves. */
const CLIMAX = [64, 8, 0.09, 0.3, 11, 3.3, 36, 6, -36, -6, 42, 15];

describe('the folding lines of muadalat-x-murabba (square-fold rounds)', () => {
  it('every goal is reached by playing, and a perfect play wins three stars', () => {
    WITH_EASY.filter((r) => !r.free).forEach((r) => {
      const { log } = play(r);
      r.goal.filter((c) => !c.checkpoint).forEach((c) => expect(conditionMet(c, log), `${r.id} ${JSON.stringify(c)}`).toBe(true));
      const won = { ...log, checkpoints: Object.fromEntries(['rule', ...r.goal.filter((c) => c.checkpoint).map((c) => c.checkpoint)].map((id) => [id, true])), predictions: [{ ok: true }] };
      if (r.stars) expect(starsFor(r, won), r.id).toBe(3);
    });
  });
  it('the goal counts exactly the cards of the round', () => {
    WITH_EASY.filter((r) => !r.free).forEach((r) => expect(r.goal[0].solvedAll, r.id).toBe(r.props.targets.length));
  });
  it('predictions are asked on two cards whose answers DIFFER: always tapping the same answer cannot win the star', () => {
    M1_ROUNDS.filter((r) => r.props.predict).forEach((r) => {
      const s = L.init({ targets: r.props.targets, scale: r.props.scale, exactOnly: true });
      const truths = r.props.predictCards.map((i) => (r.props.predictKind === 'tick'
        ? L.landsOnTick(s.targets[i], r.props.scale) : L.solutionCount(s.targets[i].r)));
      expect(new Set(truths).size, r.id).toBe(r.props.predictCards.length);
    });
    expect(M1_ROUNDS.find((r) => r.id === 'r1').props.predictCards.map((i) => L.solutionCount(L.init({ targets: [4, 0, -4], scale: 2 }).targets[i].r))).toEqual([2, 1]);
  });
  it('a = 0 in r1, r2, the challenge and the free round — never in r3; r3 holds a root that lands on no tick', () => {
    const has0 = (id) => M1_ROUNDS.find((r) => r.id === id).props.targets.includes(0);
    ['r1', 'r2', 'challenge', 'free'].forEach((id) => expect(has0(id), id).toBe(true));
    expect(has0('r3')).toBe(false);
    const r3 = M1_ROUNDS.find((r) => r.id === 'r3').props;
    const s = L.init({ targets: r3.targets, scale: r3.scale });
    expect(s.targets.some((t) => t.r.num > 0 && !L.landsOnTick(t, r3.scale))).toBe(true);
  });
  it('the line is never too short for a card, and r1 holds its table', () => {
    WITH_EASY.forEach((r) => {
      const s = L.init({ targets: r.props.targets, scale: r.props.scale, radius: r.props.radius });
      r.props.targets.forEach((a) => expect(Math.sqrt(Math.abs(a)), `${r.id} ${a}`).toBeLessThanOrEqual(s.R));
    });
    expect(M1_ROUNDS[0].props.table).toBeTruthy();
  });
  it('the easier rounds are really smaller: a coarser line', () => {
    ALL.filter((r) => r.easier).forEach((r) => expect(r.easier.props.scale, r.id).toBeLessThan(r.props.scale));
  });
  it('never uses the climax numbers — neither the cards, their solutions, the nearest ticks nor the built decoys (module 1: neither 5 nor 25)', () => {
    WITH_EASY.forEach((r) => {
      const { s } = play(r);
      const shown = [...r.props.targets, ...r.props.targets.map((a) => (a >= 0 ? Math.sqrt(a) : null)).filter((x) => x != null)];
      s.targets.forEach((tg, i) => {
        if (tg.r.num > 0) {
          const x = eqBuildOf(s, i);
          shown.push(Number(x.decoy.replace(',', '.').replace('−', '-')));
          if (!L.landsOnTick(tg, s.scale)) { const v = Math.round(Math.sqrt(tg.a) * s.scale); shown.push(v / s.scale, (v / s.scale) ** 2); }
        }
      });
      shown.forEach((n) => CLIMAX.forEach((c) => expect(Math.abs(n - c) < 1e-9, `${r.id}: ${n}`).toBe(false)));
    });
    M1_ROUNDS.forEach((r) => r.props.targets.forEach((a) => expect([5, 25].includes(a), `${r.id} ${a}`).toBe(false)));
  });
});

describe('the r1 table is the activity\'s table', () => {
  it('same six values as content/textbook.js', async () => {
    const { ACTIVITY } = await import('./textbook');
    const { TABLE } = await import('./folds');
    expect(TABLE).toEqual(ACTIVITY.numbers.table);
  });
});

describe('the leads are plain Arabic', () => {
  it('no equation inside a plain-text lead (it reorders in an RTL line): the cards carry the equations', () => {
    [...M1_ROUNDS, ...M2_ROUNDS].flatMap((r) => [r, r.easier].filter(Boolean)).forEach((x) => expect(x.props.lead, x.props.lead).not.toMatch(/=|x²/));
  });
  it('every question a round asks is in its goal — solving the cards in another order never wins while a question is open (ECC 2026-11-10)', () => {
    const goalCps = (r) => r.goal.filter((c) => c.checkpoint).map((c) => c.checkpoint).sort();
    expect(goalCps(M1_ROUNDS.find((r) => r.id === 'r1'))).toEqual(['rule']);
    expect(goalCps(M1_ROUNDS.find((r) => r.id === 'r2'))).toEqual(['c0', 'c1']);
    expect(goalCps(M1_ROUNDS.find((r) => r.id === 'r3'))).toEqual(['c0']);
    expect(goalCps(M2_ROUNDS.find((r) => r.id === 'r1'))).toEqual(['c1']);
  });
});
