import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import EquationBalance from './EquationBalance';
import { QUESTIONS } from './EquationBalancePlayer';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as P from '../logic/equationBalancePlayer';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * Le traitement v2 du labo `equation-balance` dans le lecteur de mission (rollout 2026-11-11, unité 4 leçon 1 ; conseil du 2026-11-11, verdict L1).
 * Chaque question dit la MÊME vérité que la logique, aucune clé brute ni `{{` à l'écran, les réponses changent de place ; la page
 * (equationBalance.render.test.jsx) reste inchangée — ici : ce que seul le lecteur montre.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.equationBalance.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.slots}{q.tiles?.map((x) => (q.render ? q.render(x) : x))}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);

const ROUNDS = [['2x+3=11', 'r1'], ['4x+3=-9', 'r2'], ['3x-2=10', 'r3'], ['4x+3=6x', 'm2r1'], ['4x+1=x+8', 'm2r2']];

describe('equation-balance in the mission player — rendering', () => {
  it('the player screen: live region, paged scene block, quantity chips only with handDone, no stepper, no title text of the page', () => {
    const html = inPlayer(<EquationBalance eq="4x+3=-9" levels={false} chains="r2" handDone kinds={['ball', 'balloon']} />);
    expect(html).toContain('data-eb-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-paging-keep');
    expect(html).toContain('data-eb-qty');
    expect(html).not.toContain('data-eb-step');
    expect(html).not.toMatch(rawKey);
    expect(html).not.toContain('ما فعلته بكفّة افعله بالأخرى');
    // only the reserve's kinds are offered
    expect(html).toContain('data-coach="reserve"');
    expect(html).not.toMatch(/r:bag/);
    expect(inPlayer(<EquationBalance eq="2x+3=11" levels={false} chains="r1" />)).not.toContain('data-eb-qty');
    // the page keeps its own title, stepper and the decor ball
    const page = renderToString(<EquationBalance eq="2x+3=11" />);
    expect(page).toContain('data-eb-step');
    expect(page).toContain('data-decor-ball');
    expect(page).not.toContain('data-eb-verdict-live');
  });
  it('the free round offers its equations as choices, the current one pressed', () => {
    const html = inPlayer(<EquationBalance eq="x+5=9" levels={false} checkpoints={false} choices={['x+5=9', '3x+1=10']} />);
    expect((html.match(/data-eb-choice="/g) ?? []).length).toBe(2);
    const pressed = [...html.matchAll(/<button[^>]*data-eb-choice="([^"]+)"[^>]*>/g)].filter((m) => m[0].includes('aria-pressed="true"')).map((m) => m[1]);
    expect(pressed).toEqual(['x+5=9']);
  });
});

describe('equation-balance in the mission player — the questions', () => {
  ROUNDS.forEach(([eq, chains]) => {
    ['bags', 'units'].forEach((order) => {
      it(`${eq} (${order} first): every question renders without raw key, two hints, one right answer`, () => {
        const plan = P.efficientPlan(eq, order);
        const full = P.playPlan(eq, plan, { open: true });
        const first = P.playPlan(eq, { steps: plan.steps.slice(0, 1), k: 1 });
        const reduced = P.playPlan(eq, { steps: plan.steps, k: 1 });
        P.chainsOf(chains).forEach((spec) => {
          const labs = spec.id === 'line' ? (spec.build?.when === 'reduced' ? reduced : first) : full;
          expect(spec.reached(labs.lab), `${eq} ${spec.id}`).toBe(true);
          spec.qs.forEach((qid) => {
            const q = QUESTIONS[qid](labs.lab, k, { spec, moves: labs.moves });
            expect(text(q), `${eq}.${qid}`).not.toMatch(rawKey);
            expect(q.hints, `${eq}.${qid}`).toHaveLength(2);
            if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${eq}.${qid}`).toHaveLength(1);
            if (q.kind === 'build') {
              expect(isCorrect(q, q.expected), `${eq}.${qid}`).toBe(true);
              expect(isCorrect(q, [...q.expected].reverse()), `${eq}.${qid} swapped`).toBe(true);
              const wrong = q.tiles.find((t) => !q.expected.includes(t));
              expect(isCorrect(q, [q.expected[0], wrong]), `${eq}.${qid} decoy`).toBe(false);
            }
          });
        });
      });
    });
  });
  it('the right option does not always sit in the same place', () => {
    const pos = ROUNDS.map(([eq]) => {
      const full = P.playPlan(eq, P.efficientPlan(eq, 'bags'), { open: true });
      return QUESTIONS.ruleBalance(full.lab, k).options.findIndex((o) => o.correct);
    });
    expect(new Set(pos).size).toBeGreaterThan(1);
  });
  it('the rule options: the right one is the lesson\'s rule; ax = b gives b / a', () => {
    const full = P.playPlan('3x-2=10', P.efficientPlan('3x-2=10', 'bags'), { open: true });
    const r = QUESTIONS.ruleBalance(full.lab, k);
    expect(renderToString(<div>{r.options.find((o) => o.correct).text}</div>)).toContain('العملية نفسها على الطرفين');
    const q = QUESTIONS.ruleAxb(full.lab, k);
    expect(renderToString(<div>{q.options.find((o) => o.correct).text}</div>)).toContain('dfrac');
  });
  it('the words: a refusal is « مرفوض », the verdict never states the rule', () => {
    expect(k('player.cueRefused')).toMatch(/مرفوض/);
    ['tipped', 'tippedRefusal', 'balanced'].forEach((id) => expect(k(`player.verdict.${id}`, { side: 'x' })).not.toMatch(/نفسه|الأخرى/));
    ['grab', 'beam', 'parts', 'keep', 'open', 'reserve', 'qty'].forEach((id) => expect(k(`coach.${id}`)).not.toMatch(rawKey));
    P.PREDICT_KEYS.forEach((id) => {
      expect(k(`predict.${id}`)).not.toContain('$');
      expect(k(`predict.${id}`)).not.toMatch(rawKey);
    });
  });
});
