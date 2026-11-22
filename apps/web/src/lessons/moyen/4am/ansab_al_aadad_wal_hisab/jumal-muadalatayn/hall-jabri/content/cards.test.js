import { describe, it, expect } from 'vitest';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { M1_ROUNDS, SYS, FREE, PREDICT } from './cards.js';
import { violations } from './forbidden.js';
import * as E from '../../../../../../common/manipulations/logic/eliminationCards.js';
import * as P from '../../../../../../common/manipulations/logic/eliminationCardsPlayer.js';
import { emptyLog, logEvent, roundWon, starsFor } from '../../../../../../common/manipulations/rounds/roundsModel.js';

/**
 * Les manches de hall-jabri (verdict L2 + X11) : JOUÉES par la logique réelle du labo, le long du « chemin plus » (règle P) et du chemin des cartes
 * posées ; les étoiles calculées par le modèle des manches (roundsModel) ; le balayage par rôle de chaque écran.
 */
const each = (fn) => M1_ROUNDS.forEach((r) => [r, r.easier].filter(Boolean).forEach((x) => fn(x, r)));
const pairOf = (src) => { const c = LS.classify(LS.system(...src.split('|'))); return [E.numText(c.x), E.numText(c.y)]; };

/** Joue une méthode et renvoie le labo final + les essais (une ligne nouvelle = un essai) ; `how` : un chemin de substitution ou { scales }. */
function playMethod(lab, how) {
  const trials = [];
  let one;
  if (how.path) one = E.substituteInto(E.isolateFrom(lab, how.path.from, how.path.v), how.path.into);
  else { let l = E.setScale(E.setScale(lab, 1, how.scales[1]), 2, how.scales[2]); one = E.stack(l, 1, 2); }
  trials.push(P.trialOf(lab.stage === 'cards' ? { ...lab, stage: 'cards' } : lab, one));
  let l = one; while (l.stage === 'one') l = E.solveStep(l);
  const done = E.backSubstitute(l, 1);
  trials.push(P.trialOf(l, done));
  return { done, trials: trials.filter(Boolean) };
}

/** Joue une manche entière comme un élève efficace : chaque méthode demandée, chaque suite répondue juste du premier coup, chaque prédiction juste. */
function playRound(round) {
  const { system, methods, chains, predict = [] } = round.props;
  let log = emptyLog();
  predict.forEach(() => { log = logEvent(log, 'trial', { tk: 'predict', ok: true }); });
  let lab = E.init(system);
  const plus = P.plusPaths(system)[0];
  const ways = methods >= 2 ? [{ path: plus }, { scales: stackScales(system) }] : [plus ? { path: plus } : { scales: stackScales(system) }];
  ways.forEach((how, i) => {
    if (i > 0) lab = E.restart(lab);
    const { done, trials } = playMethod(lab, how);
    trials.forEach((t, k) => { log = logEvent(log, 'verdict', { groups: k + 1, exact: true }); expect(t.sig).toBeTruthy(); });
    lab = done;
    P.chainsOf(chains).forEach((sp) => {
      const stage = sp.qs.includes('build') ? { stage: 'one', method: lab.method } : lab;
      if (sp.reached(stage) && !log.checkpoints[sp.id]) {
        sp.qs.forEach(() => { log = logEvent(log, 'trial', { tk: 'checkpoint', id: sp.id, ok: true, tries: 1 }); });
        log = logEvent(log, 'trial', { tk: 'checkpoint-done', id: sp.id });
      }
    });
  });
  if (P.discoveredFor(lab, methods)) log = logEvent(log, 'trial', { tk: 'discovered' });
  return { lab, log };
}
/** Les multiplicateurs les plus petits qui font disparaître une inconnue (1 et 1 quand les cartes s'annulent telles quelles). */
function stackScales(src) {
  for (const k1 of [1, -1, 2, -2, 3, -3, 4, -4]) for (const k2 of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) if (P.playStack(src, { 1: k1, 2: k2 })) return { 1: k1, 2: k2 };
  return null;
}

describe('hall-jabri — the rounds of module 1 (lab-cards-m1)', () => {
  it('the systems and pairs of the verdict (§4)', () => {
    expect(pairOf(SYS.r1)).toEqual(['5', '3']);
    expect(pairOf(SYS.r2)).toEqual(['3', '5']);
    expect(pairOf(SYS.r3)).toEqual(['4', '2']);
    expect(pairOf(SYS.star)).toEqual(['2', '-1']);
    expect(pairOf(SYS.r1Easy)).toEqual(['3', '1']);
    expect(pairOf(SYS.r2Easy)).toEqual(['4', '1']);
    expect(pairOf(SYS.r3Easy)).toEqual(['2', '1']);
    expect(FREE.map(pairOf)).toEqual([['7', '4'], ['1', '3'], ['5', '-1'], ['2', '3'], ['1', '1/3']]);
  });
  it('rule P › P2: every required and easier round has a plus path, and the test PLAYS it', () => {
    each((x, r) => {
      if (r.optional || r.free) return;
      const plus = P.plusPaths(x.props.system);
      expect(plus.length, `${r.id} ${x.props.system}`).toBeGreaterThan(0);
      plus.forEach((p) => {
        const done = P.finish(P.playSubstitution(x.props.system, p));
        expect([E.numText(done.result.x), E.numText(done.result.y)]).toEqual(pairOf(x.props.system));
        // la ligne écrite par le labo sur ce chemin n'a pas de moins devant la parenthèse
        expect(P.playSubstitution(x.props.system, p).lines.at(-1).tex, `${r.id} ${p.from}${p.v}`).not.toMatch(/-\s*\d*\(/);
      });
    });
  });
  it('r3 as is: nothing cancels — the hand has to multiply; r1 and r2 cancel as they are', () => {
    expect(P.playStack(SYS.r3)).toBeNull();
    expect(P.playStack(SYS.r1)).not.toBeNull();
    expect(P.playStack(SYS.r2)).not.toBeNull();
    expect(P.playStack(SYS.r3, { 1: 1, 2: 3 })).not.toBeNull(); // le multiplicateur de la prédiction
    expect(P.playStack(SYS.r3, { 1: 1, 2: -2 })).not.toBeNull(); // ou x : − 2 sur la carte (2)
    expect(stackScales(SYS.star)).not.toBeNull();
  });
  it('every required round is won with ★★★ along the efficient path (trials ≤ maxTrials), the ⭐ too', () => {
    M1_ROUNDS.filter((r) => !r.free).forEach((r) => {
      const { log } = playRound(r);
      expect(roundWon(r, log), r.id).toBe(true);
      expect(starsFor(r, log), r.id).toBe(3);
    });
  });
  it('each easier round is smaller, wins with one method, releases its round, and has no question', () => {
    M1_ROUNDS.filter((r) => r.easier).forEach((r) => {
      const big = Math.max(...E.parseSystem(r.props.system).flatMap((e) => [e.a, e.b, e.c].map((f) => Math.abs(E.toNumber(f)))));
      const small = Math.max(...E.parseSystem(r.easier.props.system).flatMap((e) => [e.a, e.b, e.c].map((f) => Math.abs(E.toNumber(f)))));
      expect(small, r.id).toBeLessThan(big);
      expect(r.easier.releases).toBe(true);
      expect(r.easier.props.chains).toBe('none');
      expect(roundWon(r.easier, playRound(r.easier).log)).toBe(true);
    });
  });
  it('predictions: at most two per round, different right answers within a round', () => {
    Object.entries(PREDICT).forEach(([id, keys]) => {
      expect(keys.length).toBeLessThanOrEqual(2);
      const truths = keys.map((k) => P.predictTruth(SYS[id], k));
      expect(new Set(truths).size, id).toBe(truths.length);
      keys.forEach((k) => expect(P.predictOptions(SYS[id], k).map((o) => o.says)).toContain(P.predictTruth(SYS[id], k)));
    });
  });
  it('every round screen (rounds, easier rounds, free choices) is clean by role', () => {
    each((x, r) => expect(violations(P.shownValues(x.props), r.id)).toEqual([]));
  });
  it('the role scan fires (negative control: the climax cards)', () => {
    expect(violations(P.shownValues({ system: '3x+y=115|4x-3y=45', chains: 'r2' })).length).toBeGreaterThan(0);
  });
  it('a right-side BUILD decoy is never a card\'s printed value (its constant term)', () => {
    M1_ROUNDS.filter((r) => ['r1', 'r2', 'r3'].includes(r.props.chains)).forEach((r) => {
      const src = r.props.system;
      const roads = [...P.subPaths(src).map((p) => P.playSubstitution(src, p))];
      const sc = stackScales(src); if (sc) roads.push(P.playStack(src, sc));
      roads.forEach((one) => {
        const b = P.buildSpec(one);
        const printed = [1, 2].flatMap((n) => { const e = E.card(one, n); return [e.c].map((f) => E.numText(f)); });
        if (b.decoySide === 'right') expect(printed, `${r.id} ${b.line}`).not.toContain(b.decoy);
      });
    });
  });
  it('titles name no method before the student has done it (verdict L2.9); leads name only the unit 5 cast', () => {
    M1_ROUNDS.forEach((r) => expect(r.title).not.toMatch(/تعويض|جمع/));
    expect(M1_ROUNDS.map((r) => r.title)).toEqual(['مجهول يختفي', 'طريقان، البطاقتان نفساهما', 'بطاقة عنيدة', 'تحدٍّ: بطاقتان عنيدتان', 'البطاقات الحرّة']);
    expect(M1_ROUNDS[0].props.lead).toContain('إكرام');
    expect(M1_ROUNDS[1].props.lead).toContain('إسحاق');
    expect(M1_ROUNDS[2].props.lead).toContain('إكرام');
    each((x) => expect(`${x.props.lead} ${x.props.mission}`).not.toMatch(/دج|كشك|DA/));
  });
});
