import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import PairScoreboard from './PairScoreboard';
import { QUESTIONS } from './PairScoreboardPlayer';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as P from '../logic/pairScoreboardPlayer';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './PairScoreboardPlayer.jsx?raw';

/**
 * Le lecteur de pair-scoreboard (rollout 2026-11-12) : le répartiteur monte le lecteur DANS le lecteur de mission et la page ailleurs ; chaque
 * question du lecteur, rendue avec les VRAIS textes, dit la même vérité que la logique (une seule bonne option, des `why` pour les autres), sans
 * clé brute ni `{{` ; chaque clé lue existe.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.pairScoreboard.${key}`, o);
const R = (min, max) => ({ x: { min, max }, y: { min, max } });
const play = (lab0, acts, round = {}) => acts.reduce((lab, a) => P.act(lab, a, round).lab, lab0);
const set = (which, v) => ({ kind: 'set', which, v });
const CLAIM = { kind: 'claim' };
const SWAP = { kind: 'swap' };
const RAW = /manipulation\.[a-zA-Z]/;

function check(q, label) {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, label).not.toMatch(RAW);
  expect(out, label).not.toContain('{{');
  expect(out, label).not.toContain('undefined');
  expect(out, label).not.toContain('NaN');
  expect(q.hints, label).toHaveLength(2);
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct), label).toHaveLength(1);
    q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, `${label} why`).toBeTruthy());
  } else {
    expect(new Set(q.tiles).size, label).toBe(q.tiles.length);
    q.expected.forEach((v) => expect(q.tiles, label).toContain(v));
  }
  return out;
}

describe('pair-scoreboard — the mission player', () => {
  it('the dispatcher mounts the player inside the mission player, the page elsewhere', () => {
    const inP = renderToString(<InMissionPlayerContext.Provider value><PairScoreboard system="x+y=7|3x+y=17" theme="football" start={{ x: 0, y: 0 }} /></InMissionPlayerContext.Provider>);
    expect(inP).toContain('data-player=""');
    expect(inP).toContain('data-pair-claim');
    expect(inP).toContain(k('player.claim'));
    expect(inP).not.toMatch(RAW);
    const page = renderToString(<PairScoreboard system="x+y=7|3x+y=17" theme="football" />);
    expect(page).not.toContain('data-player=""');
  });
  it('a covered round hides gauge 2 behind a lock; coins speak « دج », never « DA »', () => {
    const cov = renderToString(<InMissionPlayerContext.Provider value><PairScoreboard system="x+y=13|3x+y=29" theme="football" covered start={{ x: 0, y: 0 }} ranges={R(0, 13)} /></InMissionPlayerContext.Provider>);
    expect(cov).toContain('data-covered-gauge="true"');
    const coins = renderToString(<InMissionPlayerContext.Provider value><PairScoreboard system="x+y=9|50x+20y=300" theme="coins" start={{ x: 0, y: 0 }} /></InMissionPlayerContext.Provider>);
    expect(coins).toContain('عدد قطع 50 دج');
    expect(coins).not.toContain('DA');
  });
  it('r1 season: which gauge your one-gauge pair lit, then BUILD 17 = 3 × 5 + 2', () => {
    const lab = play(P.initRound({ system: 'x+y=7|3x+y=17', theme: 'football', ranges: R(0, 9), start: { x: 0, y: 0 } }), [set('x', 6), set('y', 1), set('x', 5), set('y', 2), CLAIM]);
    const h = QUESTIONS.halfWhich(lab, k);
    const out = check(h, 'halfWhich');
    expect(out).toContain(k('player.q.halfWhich.only1'));
    expect(renderToString(<span>{h.options.find((o) => o.correct).text}</span>)).toContain('(1)');
    const b = QUESTIONS.buildLine(lab, k);
    check(b, 'buildLine');
    expect(b.expected).toEqual([17, 5, 2]);
  });
  it('r2 coins: BUILD 50x + 20y = 300 (decoy 330), then the rule on the student\'s own pairs', () => {
    const lab = play(P.initRound({ system: 'x+y=9|50x+20y=300', theme: 'coins', ranges: R(0, 11), start: { x: 0, y: 0 } }), [set('x', 9), SWAP, set('x', 4), set('y', 5), CLAIM, SWAP]);
    const b = QUESTIONS.buildEq2(lab, k);
    check(b, 'buildEq2');
    expect(b.tiles).toContain(330);
    const r = QUESTIONS.rule(lab, k);
    const out = check(r, 'rule');
    expect(r.options).toHaveLength(3);
    expect(out).toMatch(/5\s*;\s*4/);
  });
  it('r3 covered: read 29, then why the full season was refused', () => {
    const lab = play(P.initRound({ system: 'x+y=13|3x+y=29', theme: 'football', ranges: R(0, 13), start: { x: 0, y: 0 } }), [set('x', 9), set('y', 4), CLAIM, set('x', 8), set('y', 5), CLAIM], { covered: true });
    const rc = QUESTIONS.readCovered(lab, k);
    check(rc, 'readCovered');
    expect(renderToString(<span>{rc.options.find((o) => o.correct).text}</span>)).toContain('29');
    check(QUESTIONS.coveredWhy(lab, k), 'coveredWhy');
  });
  it('module 2 (owner OQ1): why never / why always, computed from the bag (6 × 50 = 300)', () => {
    const none = P.initRound({ system: 'x+y=6|50x+50y=280', theme: 'coins', ranges: R(0, 8), start: { x: 0, y: 0 } });
    const outN = check(QUESTIONS.whyNever(none, k), 'whyNever');
    expect(outN).toContain('300');
    expect(outN).toContain('280');
    const inf = P.initRound({ system: 'x+y=6|50x+50y=300', theme: 'coins', ranges: R(0, 8), start: { x: 0, y: 0 } });
    const outA = check(QUESTIONS.whyAlways(inf, k), 'whyAlways');
    expect(outA).toContain('350');
  });
  it('every player key the component reads exists', () => {
    const ns = manipulationAr.pairScoreboard;
    const get = (path) => path.split('.').reduce((o, p) => (o == null ? undefined : o[p]), ns);
    const keys = [...source.matchAll(/\bk\('([a-zA-Z0-9.]+)'/g), ...source.matchAll(/Pq\(k, '([a-zA-Z0-9.]+)'/g)].map((m) => m[0].startsWith('Pq') ? `player.q.${m[1]}` : m[1]);
    expect(keys.length).toBeGreaterThan(30);
    keys.forEach((key) => expect(get(key), key).toBeTypeOf('string'));
    ['handleX', 'handleY', 'gauge1', 'claim', 'swap', 'reveal'].forEach((id) => expect(ns.coach[id], id).toBeTypeOf('string'));
    P.PRED_KEYS.forEach((key) => { expect(ns.predict[key]).toBeTypeOf('string'); P.predictOptions(key).forEach((o) => expect(ns.predict[`opt_${o.says}`]).toBeTypeOf('string')); });
    // ✓ / ✗ never inside a translated string
    expect(/[✓✗]/.test(JSON.stringify([ns.player, ns.coach, ns.predict]))).toBe(false);
  });
});
