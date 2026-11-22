import { describe, it, expect } from 'vitest';
import { M1_ROUNDS, M2_ROUNDS, PREDICT, FREE, FREE_M2 } from './squares.js';
import { violations } from './forbidden.js';
import * as L from '../../../../../../common/manipulations/logic/pitchExpansion.js';
import { CHAINS_PLAYER } from '../../../../../../common/manipulations/algebra/PitchExpansion.jsx';
import { evaluate, samePolynomial, reduce } from '@smarter-academy/core/arithmetic/polynomials.js';
import { emptyLog, logEvent, roundWon, starsFor, needsHelp, countedTrials, easierProps } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Les terrains carrés de mutatabiqat-shahira (conseil du 2026-11-11, verdict L2). Pour chaque manche (et son entraînement, le module 2, les défis,
 * les ورشات libres), TOUT ce que son écran peut montrer (`logic › shownValues` : chaque x atteignable, chaque côté, chaque aire, chaque somme de
 * sous-ensemble, chaque terme, chaque forme fausse, chaque option des questions et chaque affirmation prédite) ne rencontre jamais la signature
 * de la مسألة (content/forbidden.js), et aucun x atteignable d'une manche en aires n'est une collision. Puis chaque manche est JOUÉE jusqu'à son
 * but, comme le labo la joue (un essai = un appui sur « تحقّق »), et ★★★ est atteint dans `maxTrials`.
 */
const ALL = [...M1_ROUNDS, ...M2_ROUNDS];
const playable = ALL.filter((r) => !r.free);
const simpOf = (p) => p.labels !== 'area';
const propsOf = (r) => [r.props, r.easier ? easierProps(r) : null].filter(Boolean);

/** Rejoue une manche. `moves` : ['c', id…] porter des zones, ['m'] réunir les termes semblables, ['v', x] « تحقّق » à x. */
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
      if (!L.sameTrial(s, x)) {
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
const diag = (props) => L.init({ expr: props.expr }).cells.filter((c) => c.i === c.j).map((c) => c.id);

describe('the forbidden rule (content/forbidden.js) catches what it must', () => {
  it('flags the climax field, its x, its terms and its expansions — the role-allowed values pass', () => {
    expect(violations(L.shownValues({ expr: 'x-3', span: 30, labels: 'terms' })).length).toBeGreaterThan(0);
    expect(violations([{ role: 'x', v: '30' }])).toHaveLength(1);
    expect(violations([{ role: 'side', v: '30' }])).toHaveLength(1);
    expect(violations([{ role: 'term', v: '-6x' }, { role: 'term', v: '+9' }])).toHaveLength(2);
    expect(violations([{ role: 'expansion', v: 'x^2 - 6x + 9' }, { role: 'expansion', v: '6x - 9' }])).toHaveLength(2);
    expect(violations([{ role: 'factor', v: '(x - 3)' }])).toHaveLength(1);
    expect(violations([{ role: 'sum', v: '729' }, { role: 'decoy', v: '171' }])).toHaveLength(2);
    // role-allowed (verdict L2.7): 9 as the area of a field or a zone, 30 as the area of a zone, a side of 3
    expect(violations([{ role: 'sum', v: '9' }, { role: 'area', v: '9' }, { role: 'area', v: '-30' }, { role: 'side', v: '3' }])).toHaveLength(0);
  });
});

describe('the square rounds of mutatabiqat-shahira', () => {
  it('the council\'s numbers: (x + 4)² in areas → (x − 5)² → (2x − 1)² → ⭐ (2x + 5)² → free; module 2 (x + 4)(x − 4)', () => {
    expect(M1_ROUNDS.map((r) => [r.props.expr, r.props.labels, r.props.chains])).toEqual([
      ['x+4', 'area', 'square'], ['x-5', 'terms', 'squareDiff'], ['2x-1', 'terms', 'coef'], ['2x+5', 'terms', 'none'], ['x+4', 'terms', 'none']]);
    expect(M1_ROUNDS.slice(0, 3).map((r) => easierProps(r).expr)).toEqual(['x+2', 'x-2', '2x+1']);
    expect(M2_ROUNDS.map((r) => r.props.expr)).toEqual(['x+4|x-4', '3x+4|3x-4', 'x+4|x-4']);
    expect(easierProps(M2_ROUNDS[0]).expr).toBe('x+2|x-2');
    // kinds: squares in module 1, the sum × difference in module 2 (L2.5)
    expect(M1_ROUNDS.slice(0, 4).map((r) => L.init(r.props).kind)).toEqual(['square-sum', 'square-diff', 'square-diff', 'square-sum']);
    expect(L.init(M2_ROUNDS[0].props).kind).toBe('sum-diff');
  });

  it('the ruler, recomputed: r1 1..6 without 4 (start 3), r1e without 2, r2 6..11 start 9 (side 4, never side 3 at the start), m2 5..10 start 7', () => {
    expect(L.playerXs(M1_ROUNDS[0].props)).toEqual([1, 2, 3, 5, 6]);
    expect(L.startXOf(M1_ROUNDS[0].props)).toBe(3);
    expect(L.playerXs(easierProps(M1_ROUNDS[0]))).not.toContain(2);
    expect(L.playerXs(M1_ROUNDS[1].props)).toEqual([6, 7, 8, 9, 10, 11]);
    expect(L.startXOf(M1_ROUNDS[1].props)).toBe(9);
    expect(9 - 5).toBe(4);
    expect(L.startXOf(M2_ROUNDS[0].props)).toBe(7);
    // the start of a (x − b)² is never a side-3 field (the climax's picture)
    propsOf(M1_ROUNDS[1]).forEach((p) => {
      const s = L.init(p);
      expect(evaluate(s.factors[0], L.startXOf(p)), p.expr).not.toBe(3);
    });
  });

  it('SWEEP: no reachable x of any area-mode round (required, practice) is a collision; the start is never one; the two strips are twins', () => {
    let n = 0;
    ALL.forEach((r) => propsOf(r).filter((p) => p.labels === 'area').forEach((p) => {
      L.playerXs(p).forEach((x) => {
        n += 1;
        expect(L.areaCollisions(p.expr, x), `${p.expr} @ ${x}`).toEqual([]);
        // same-kind twins are allowed by the rule itself: the two bx strips show the same number
        const z = L.zones(L.init(p), x).zones.filter((c) => c.term.p === 1);
        expect(z[0].area).toBe(z[1].area);
      });
      expect(L.areaCollisions(p.expr, L.startXOf(p))).toEqual([]);
    }));
    expect(n).toBeGreaterThan(8);
  });

  it('no screen of any round, practice round, challenge or free field meets the climax signature (role-paired, every reachable x, every subset sum)', () => {
    let total = 0;
    ALL.forEach((r) => propsOf(r).forEach((p) => {
      const shown = L.shownValues(p);
      total += shown.length;
      expect(violations(shown, `${r.id} ${p.expr}`), `${r.id} ${p.expr}`).toEqual([]);
    }));
    [...FREE, ...FREE_M2].forEach((e) => expect(violations(L.shownValues({ expr: e, span: 5, labels: 'terms' }), `free ${e}`)).toEqual([]));
    expect(total).toBeGreaterThan(400);
    // every number written in a title, a lead, a mission or a help line
    ALL.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => {
      const p = x.props ?? x;
      const words = `${r.title ?? ''} ${p.lead} ${p.mission} ${x.helpLine ?? ''}`.match(/\d+/g) ?? [];
      words.forEach((w) => expect(['27', '30', '729', '720', '711', '171', '900', '180', '1200'].includes(w), `${r.id}: ${w}`).toBe(false));
    }));
  });

  it('the question options are the truth, recomputed: 2 strips of 4x; the 25-corner cut 2 times, +25; +4x and −4x give 0; (2x − 1)² = 4x² − 4x + 1', () => {
    const s1 = L.init(M1_ROUNDS[0].props);
    expect(L.stripFillParts(s1).map((f) => f.expected)).toEqual(['2', '4x']);
    const s2 = L.init(M1_ROUNDS[1].props);
    expect(L.cornerFillParts(s2).map((f) => f.expected)).toEqual(['2', '+25']);
    expect(L.restoredCell(s2).term).toEqual({ c: 25, p: 0 });
    const s3 = L.init(M2_ROUNDS[0].props);
    expect(L.cancelFillParts(s3)[0].expected).toBe('0');
    expect(L.cancelFillParts(s3)[0].options).toEqual(expect.arrayContaining(['0', '8x', '-8x']));
    const c = L.coefParts(L.init(M1_ROUNDS[2].props));
    expect(c.expected).toEqual(['4x^2', '-4x', '+1']);   // the signs live IN the tiles (a11y review)
    expect(c.decoy).toBe('2x^2');
    expect(c.ops).toEqual(['', '']);
    expect(samePolynomial([{ c: 4, p: 2 }, { c: -4, p: 1 }, { c: 1, p: 0 }], L.init(M1_ROUNDS[2].props).cells.map((u) => u.term))).toBe(true);
    // every fill and every build has exactly one right answer among its options, distinct options
    [s1, s2].forEach((s) => (s.kind === 'square-sum' ? L.stripFillParts(s) : L.cornerFillParts(s)).forEach((f) => {
      expect(new Set(f.options).size).toBe(f.options.length);
      expect(f.options.filter((o) => o === f.expected)).toHaveLength(1);
    }));
  });

  it('the letter identities are TRUE for any a, b, and each decoy is FALSE (one decoy per kind: ab, −b², +b²)', () => {
    const val = (tile, a, b) => {
      const m = tile.match(/^([+-]?)(\d*)(a\^2|b\^2|ab)$/);
      const k = (m[1] === '-' ? -1 : 1) * (m[2] ? Number(m[2]) : 1);
      return k * ({ 'a^2': a * a, 'b^2': b * b, ab: a * b })[m[3]];
    };
    const lhs = { 'square-sum': (a, b) => (a + b) ** 2, 'square-diff': (a, b) => (a - b) ** 2, 'sum-diff': (a, b) => (a + b) * (a - b) };
    const decoys = {};
    ['x+4', 'x-5', 'x+4|x-4'].forEach((expr) => {
      const s = L.init({ expr });
      const parts = L.identityParts(s);
      decoys[s.kind] = parts.decoy;
      [[3, 2], [7, 5], [10, 1]].forEach(([a, b]) => {
        const sum = (tiles) => tiles.reduce((t, x) => t + val(x, a, b), 0);
        expect(sum(parts.expected), `${s.kind} ${a} ${b}`).toBe(lhs[s.kind](a, b));
        parts.accept.forEach((alt) => expect(sum(alt)).toBe(lhs[s.kind](a, b)));
        // the decoy in place of any expected tile gives a wrong value
        parts.expected.forEach((_, i) => {
          const wrong = parts.expected.map((x, j) => (j === i ? parts.decoy : x));
          expect(sum(wrong), `${s.kind} decoy at ${i}`).not.toBe(lhs[s.kind](a, b));
        });
      });
    });
    expect(decoys).toEqual({ 'square-sum': 'ab', 'square-diff': '-b^2', 'sum-diff': '+b^2' });
  });

  it('predictions: at most two per round, truths computed and different within r2 (no, yes); module 2 « a term in x remains? » no', () => {
    const lab = (p) => L.init({ expr: p.expr, simplify: simpOf(p) });
    expect(PREDICT.r2.map((p) => L.predictTruth(lab(M1_ROUNDS[1].props), p.kind, p))).toEqual(['no', 'yes']);
    expect(PREDICT.m2.map((p) => L.predictTruth(lab(M2_ROUNDS[0].props), p.kind, p))).toEqual(['no']);
    // the claim x² − 25 differs from (x − 5)² at EVERY reachable x (50 − 10x ≠ 0 off x = 5)
    const claim = L.parsePoly(PREDICT.r2[0].claim);
    L.playerXs(M1_ROUNDS[1].props).forEach((x) => expect(evaluate(claim, x)).not.toBe((x - 5) ** 2));
    ALL.forEach((r) => expect((r.props.predict ?? []).length, r.id).toBeLessThanOrEqual(2));
  });

  it('every goal is reachable by doing, with three stars inside maxTrials; the first refusal (the two squares alone) is free', () => {
    const [r1, r2, r3, ch] = M1_ROUNDS.map((r) => r.props);
    const plays = {
      r1: play(r1, [['c', ...diag(r1)], ['v', 3], ['c', ...all(r1)], ['v', 3], ['v', 5]]),
      r2: play(r2, [['c', ...all(r2)], ['m'], ['v', 9], ['v', 7]], { preds: [true, true] }),
      r3: play(r3, [['c', ...all(r3)], ['m'], ['v', 3], ['v', 5]]),
      challenge: play(ch, [['c', ...all(ch)], ['m'], ['v', 2], ['v', 4]]),
      m2: play(M2_ROUNDS[0].props, [['c', ...all(M2_ROUNDS[0].props)], ['m'], ['v', 7], ['v', 9]], { preds: [true] }),
    };
    const ids = { r1: M1_ROUNDS[0], r2: M1_ROUNDS[1], r3: M1_ROUNDS[2], challenge: M1_ROUNDS[3], m2: M2_ROUNDS[0] };
    Object.entries(plays).forEach(([id, { log }]) => {
      expect(roundWon(ids[id], log), id).toBe(true);
      expect(starsFor(ids[id], log), id).toBe(3);
    });
    expect(countedTrials(plays.r1.log)).toBe(2);   // the two-squares check is the free refusal
    expect(plays.r1.s.trials.find((t) => t.x === 3).ok).toBe(true);
    // the module-2 challenge too
    const c2 = M2_ROUNDS[1].props;
    const p2 = play(c2, [['c', ...all(c2)], ['m'], ['v', 3], ['v', 5]]);
    expect(roundWon(M2_ROUNDS[1], p2.log)).toBe(true);
    // every practice round is won and releases its round
    [...M1_ROUNDS.slice(0, 3), M2_ROUNDS[0]].forEach((r) => {
      const p = easierProps(r);
      const xs = L.playerXs(p);
      const moves = [['c', ...all(p)], ...(simpOf(p) ? [['m']] : []), ['v', xs[0]], ['v', xs[1]]];
      expect(roundWon({ id: `e-${r.id}`, goal: r.easier.goal }, play(p, moves).log), `easier ${r.id}`).toBe(true);
      expect(r.easier.releases).toBe(true);
    });
  });

  it('a round is never won while its question is open: every question asked is in the goal', () => {
    playable.forEach((r) => {
      (CHAINS_PLAYER[r.props.chains] ?? []).forEach((c) => expect(r.goal.some((g) => g.checkpoint === c.id), `${r.id} ${c.id}`).toBe(true));
      if (r.easier) (CHAINS_PLAYER[easierProps(r).chains] ?? []).forEach((c) => expect(r.easier.goal.some((g) => g.checkpoint === c.id), `easier ${r.id} ${c.id}`).toBe(true));
    });
    const r1 = M1_ROUNDS[0].props;
    expect(roundWon(M1_ROUNDS[0], play(r1, [['c', ...all(r1)], ['v', 3], ['v', 5]], { answer: false }).log)).toBe(false);
  });

  it('the same x with the same tray is not a trial; three refusals offer « جرّب أصغر »; the challenge and the free round never do', () => {
    const r1 = M1_ROUNDS[0].props;
    const same = play(r1, [['c', '0-0'], ['v', 3], ['v', 3], ['v', 3]]);
    expect(same.log.verdicts).toHaveLength(1);
    const stuck = play(r1, [['c', '0-0'], ['v', 3], ['v', 5], ['v', 6]]);
    expect(needsHelp(M1_ROUNDS[0], stuck.log)).toBe(true);
    expect(needsHelp(M1_ROUNDS[3], stuck.log)).toBe(false);
    expect(needsHelp(M1_ROUNDS[4], stuck.log)).toBe(false);
  });

  it('module 2: merging +4x and −4x empties the x term (the cut); the reduced expansion is x² − 16', () => {
    let s = L.init(M2_ROUNDS[0].props);
    all(M2_ROUNDS[0].props).forEach((id) => { s = L.collect(s, id); });
    const xs = s.tray.filter((c) => c.term.p === 1);
    expect(xs.map((c) => c.term.c).sort((a, b) => a - b)).toEqual([-4, 4]);
    s = L.merge(s, xs[0].id, xs[1].id);
    expect(s.tray.some((c) => c.term.p === 1)).toBe(false);
    expect(samePolynomial(s.tray.map((c) => c.term), reduce([{ c: 1, p: 2 }, { c: -16, p: 0 }]))).toBe(true);
  });
});
