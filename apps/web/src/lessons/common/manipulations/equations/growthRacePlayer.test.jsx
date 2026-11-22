import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import GrowthRace, { PQ } from './GrowthRace';
import { InMissionPlayerContext, MissionAreaContext } from '../../mission/missionPlayerContext';
import * as G from '../logic/growthRace';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement du labo `growth-race` dans le lecteur de mission (rollout 2026-11-11, unité 4 leçon 4 ; conseil du 2026-11-11, verdict L4.1–L4.9).
 * Chaque question dit la MÊME vérité que la logique, aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page (growthRace.render.test.jsx
 * et la synthèse) reste inchangée — ici : ce que seul le lecteur montre.
 */
const t = (key, o) => i18n.t(`lesson:${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.map((o) => <b key={o}>{f.render ? f.render(o) : o}</b>)}</span>)}{q.tiles?.map((x) => <span key={x}>{q.render ? q.render(x) : x}</span>)}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value><MissionAreaContext.Provider value={{ width: 1280, height: 640 }}>{el}</MissionAreaContext.Provider></InMissionPlayerContext.Provider>);

const ctxOf = (left, right, maxX) => {
  const model = G.parseModel(left, right);
  const lab = { ...G.init(left, right), trials: [] };
  const range = G.xRange(model, maxX);
  return { lab, model, ctx: { sol: G.solution(model), range, titleL: 'الطرف الأول', titleR: 'الطرف الثاني' } };
};
const withTrials = (lab, xs) => ({ ...lab, trials: xs.map((x) => G.trialAt(lab.model, x)) });

describe('growth-race in the mission player — rendering', () => {
  it('the father is the shared KidFigure drawn taller, a girl wears the hijab, the board replaces the cake, no stepper', () => {
    const html = inPlayer(<GrowthRace left="52+x" right="7+x+8+x+10+x+12+x" maxX={9} levels={false} startX={0} decor="board" chains="sum4" cast={{ adults: ['L0'] }} />);
    expect(html).toContain('data-gr-kid="adult"');
    expect(html).toContain('data-decor="board"');
    expect(html).not.toContain('gr-flame');
    expect(html).not.toContain('data-lab-stepper');
    expect(html).toContain('data-gr-verdict-live');
    expect(html).not.toMatch(rawKey);
    const girls = inPlayer(<GrowthRace left="13+x+10+x" right="31" maxX={8} levels={false} cast={{ girls: ['L0', 'L1'] }} />);
    expect((girls.match(/data-gr-kid="girl"/g) ?? []).length).toBe(2);
  });

  it('the page is unchanged: the cake, no player region, the trial chips', () => {
    const page = renderToString(<GrowthRace left="30+x" right="2(6+x)" levels={false} decor="board" />);
    expect(page).not.toContain('data-gr-verdict-live');
    expect(page).not.toContain('data-gr-kid');
    expect(page).not.toContain('data-decor="board"');
  });

  it('the free round offers families as choices; the prediction tray opens before the first gesture', () => {
    const free = inPlayer(<GrowthRace left="52+x" right="7+x+8+x+10+x+12+x" maxX={9} levels={false} checkpoints={false} choices={['52+x|7+x+8+x+10+x+12+x|9', '26+x|4(2+x)|8']} />);
    expect((free.match(/data-gr-choice="/g) ?? []).length).toBe(2);
    const pred = inPlayer(<GrowthRace left="26+x" right="4(2+x)" maxX={8} levels={false} chains="mult" predict={[{ key: 'p', kind: 'cards' }]} />);
    expect(pred).toContain('data-gr-predict');
    expect(pred).not.toMatch(rawKey);
  });

  it('the equation of each side is hidden until the build question is answered', () => {
    const html = inPlayer(<GrowthRace left="26+x" right="4(2+x)" maxX={8} levels={false} chains="mult" />);
    expect(html).toContain('مجهولة بعد');
  });
});

describe('growth-race in the mission player — the questions tell the logic\'s truth', () => {
  it.each([
    ['52+x', '7+x+8+x+10+x+12+x', 9, ['52 + x', '4x', '37'], 'eqSum'],
    ['26+x', '4(2+x)', 8, ['26 + x', '4x', '8'], 'eqSum'],
    ['13+x+10+x', '31', 8, ['13 + x', '10 + x', '31'], 'eqSum2'],
  ])('buildEq %s = %s', (l, r, m, expected, kind) => {
    const { lab, ctx } = ctxOf(l, r, m);
    const q = PQ.buildEq(lab, null, ctx, t);
    expect(q.expected).toEqual(expected);
    expect(isCorrect(q, expected)).toBe(true);
    expect(isCorrect(q, q.accept[0])).toBe(true);
    expect(isCorrect(q, [expected[0], expected[1], q.tiles.find((x) => !expected.includes(x))])).toBe(false);
    expect(q.slots).toHaveLength(3);
    expect(text(q)).not.toMatch(rawKey);
    expect(kind).toBeTruthy();
  });

  it('slopeTap: the chips are 1, the slope and the constant; the right one is the slope', () => {
    const { lab, ctx } = ctxOf('52+x', '7+x+8+x+10+x+12+x', 9);
    const q = PQ.slopeTap(lab, null, ctx, t);
    expect(q.fields[0].options).toEqual([1, 4, 37]);
    expect(isCorrect(q, ['4'])).toBe(true);
    expect(isCorrect(q, ['1'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('whereTap: his own trial before, the meeting, his own trial after', () => {
    const { lab, ctx } = ctxOf('52+x', '7+x+8+x+10+x+12+x', 9);
    const q = PQ.whereTap(withTrials(lab, [2, 5, 8]), null, ctx, t);
    expect([...q.fields[0].options].sort((a, b) => a - b)).toEqual([2, 5, 8]);
    expect(isCorrect(q, ['5'])).toBe(true);
    expect(isCorrect(q, ['8'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });

  it('the negative race: solve, build the past (one decoy), the rule', () => {
    const { lab, ctx } = ctxOf('11+x+13+x', '18', 8);
    const solve = PQ.solveTap(lab, null, ctx, t);
    expect(solve.fields[0].options.map(String).sort()).toEqual(['-3', '18', '3']);
    expect(isCorrect(solve, ['-3'])).toBe(true);
    const past = PQ.buildPast(lab, null, ctx, t);
    expect(past.expected).toEqual(['3', '8', '10']);
    expect(isCorrect(past, ['3', '10', '8'])).toBe(true);
    expect(isCorrect(past, ['14', '8', '10'])).toBe(false);
    const rule = PQ.rulePast(withTrials(lab, [0, 4, 8]), null, ctx, t);
    expect(rule.options.filter((o) => o.correct)).toHaveLength(1);
    [solve, past, rule].forEach((q) => expect(text(q)).not.toMatch(rawKey));
  });

  it('the rule of the first module: exactly one right option, every wrong one carries a reason on his numbers', () => {
    const { lab, ctx } = ctxOf('26+x', '4(2+x)', 8);
    const rule = PQ.ruleP(withTrials(lab, [0, 6, 8]), null, ctx, t);
    expect(rule.options.filter((o) => o.correct)).toHaveLength(1);
    rule.options.filter((o) => !o.correct).forEach((o) => expect(o.why).toBeTruthy());
    expect(text(rule)).not.toMatch(rawKey);
  });
});
