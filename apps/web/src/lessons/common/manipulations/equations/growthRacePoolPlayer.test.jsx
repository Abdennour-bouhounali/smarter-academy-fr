import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import GrowthRace, { PQ } from './GrowthRace';
import { InMissionPlayerContext, MissionAreaContext } from '../../mission/missionPlayerContext';
import * as G from '../logic/growthRace';
import * as P from '../logic/growthRacePlayer';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * growth-race dans le lecteur, deux TARIFS « ax » contre « f + bx » — les suites ADDITIVES de la synthèse de l'unité 4
 * (`wadiya-idmajiya-muadalat`, 2026-11-12) : `pool` (bâtir l'inéquation, où le prix s'égale, la première séance meilleure), `poolSaving`
 * (la première séance, la construction NUMÉRIQUE « (a − b) × n = f »). Une course d'âges ne change pas (growthRacePlayer.test.jsx).
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => <b key={o}>{f.render ? f.render(o) : o}</b>)}</span>)}{q.tiles?.map((x) => <span key={x}>{q.render ? q.render(x) : x}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value><MissionAreaContext.Provider value={{ width: 1280, height: 640 }}>{el}</MissionAreaContext.Provider></InMissionPlayerContext.Provider>);
const ctxOf = (left, right, maxX, xs = []) => {
  const model = G.parseModel(left, right);
  const lab = { ...G.init(left, right), trials: xs.map((x) => G.trialAt(model, x)) };
  return { lab, ctx: { sol: G.solution(model), range: G.xRange(model, maxX), titleL: 'الصيغة الأولى', titleR: 'الصيغة الثانية' } };
};

describe('growth-race, two tariffs — the pure logic', () => {
  it('poolOf reads « ax » against « f + bx », nothing else', () => {
    expect(P.poolOf(G.parseModel('60x', '300+10x'))).toEqual({ a: 60, b: 10, f: 300 });
    expect(P.poolOf(G.parseModel('52+x', '7+x+8+x'))).toBeNull();
    expect(P.poolOf(G.parseModel('10x', '300+60x'))).toBeNull();
  });
  it('the inequality build: f + bx < ax, the decoy pays the subscription each session', () => {
    const s = P.ineqSpec(G.parseModel('60x', '300+10x'));
    expect(s.expected).toEqual(['300', '10x', '60x']);
    expect(s.decoy).toBe('300x');
    expect(new Set(s.tiles).size).toBe(4);
  });
  it('the first better session is the one AFTER the equality; the saving pays the subscription back', () => {
    const m = G.parseModel('45x', '150+15x');
    expect(P.firstSpec(m)).toMatchObject({ n: 5, first: 6, equal: 225 });
    const sv = P.savingSpec(m);
    expect(sv.expected).toEqual(['30', '5', '150']);
    expect(sv.d * sv.n).toBe(sv.f);
    expect(sv.decoy).toBe('45');
    expect(new Set(sv.tiles).size).toBe(4);
  });
  it('shownValues names the tariffs by role, and the tiles of the chains the round asks', () => {
    const sv = P.shownValues({ left: '45x', right: '150+15x', maxX: 8, goal: 'greater', chains: 'poolSaving' });
    const roles = (r) => sv.filter((x) => x.role === r).map((x) => x.v);
    expect(roles('rate')).toEqual(['45', '15']);
    expect(roles('fixed')).toEqual(['150']);
    expect(roles('saving')).toEqual(['30']);
    expect(roles('tile')).toEqual(expect.arrayContaining(['45', '150', '30', '5']));
    expect(roles('first')).toEqual(['6']);
    expect(roles('eq')).toEqual(expect.arrayContaining(['x>5']));
    // an ages race is untouched: no tariff role
    expect(P.shownValues({ left: '52+x', right: '7+x+8+x+10+x+12+x', maxX: 9 }).some((x) => ['rate', 'fixed', 'saving'].includes(x.role))).toBe(false);
  });
  it('the chains', () => {
    expect(P.chainsOfPlayer('pool')).toEqual({ build: ['ineqBuild'], race: ['wherePool', 'firstPool'] });
    expect(P.chainsOfPlayer('poolSaving')).toEqual({ build: [], race: ['firstPool', 'savingBuild'] });
  });
});

describe('growth-race, two tariffs — the questions tell the logic\'s truth', () => {
  it('ineqBuild', () => {
    const { lab, ctx } = ctxOf('60x', '300+10x', 9);
    const q = PQ.ineqBuild(lab, null, ctx, t);
    expect(isCorrect(q, ['300', '10x', '60x'])).toBe(true);
    expect(isCorrect(q, ['10x', '300', '60x'])).toBe(true);
    expect(isCorrect(q, ['300x', '10x', '60x'])).toBe(false);
    expect(q.ops).toEqual(['+', '<']);
    expect(text(q)).not.toMatch(rawKey);
  });
  it('wherePool and firstPool: the equality is where they meet, NOT the answer', () => {
    const { lab, ctx } = ctxOf('60x', '300+10x', 9, [2, 6, 8]);
    const w = PQ.wherePool(lab, null, ctx, t);
    expect(w.fields[0].expected).toBe('6');
    expect(w.fields[0].options.map(String).sort()).toEqual(['2', '6', '8']);
    const f = PQ.firstPool(lab, null, ctx, t);
    expect(f.fields[0].expected).toBe('7');
    expect(f.fields[0].options.map(String)).toContain('6');
    expect(text(w)).not.toMatch(rawKey);
    expect(text(f)).not.toMatch(rawKey);
    expect(text(f)).toContain('360');
  });
  it('savingBuild: (a − b) × n = f, order-free product', () => {
    const { lab, ctx } = ctxOf('45x', '150+15x', 8, [3, 5, 7]);
    const q = PQ.savingBuild(lab, null, ctx, t);
    expect(isCorrect(q, ['30', '5', '150'])).toBe(true);
    expect(isCorrect(q, ['5', '30', '150'])).toBe(true);
    expect(isCorrect(q, ['45', '5', '150'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });
});

describe('growth-race, two tariffs — rendering in the player', () => {
  it('tickets and the subscription card, the expression hidden until the inequality is built, the pool coach words, the offers', () => {
    const html = inPlayer(<GrowthRace left="60x" right="300+10x" theme="pool" goal="greater" maxX={9} levels={false} startX={0} chains="pool"
      context={{ leftTitle: 'الصيغة الأولى', rightTitle: 'الصيغة الثانية' }} />);
    expect(html).toContain('data-op="mul"');
    expect(html).toContain('مجهولة بعد');
    expect(html).not.toMatch(rawKey);
    const free = inPlayer(<GrowthRace left="60x" right="300+10x" theme="pool" goal="greater" maxX={9} levels={false} checkpoints={false} choices={['60x|300+10x|9', '45x|150+15x|8']} />);
    expect(free).toContain('عرض 1');
    expect(free).not.toContain('أسرة');
    expect(t('manipulation.growthRace.coach.pool.carry')).toMatch(/حصّة/);
  });
});
