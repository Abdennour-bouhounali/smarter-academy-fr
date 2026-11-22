import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import SolutionRay, { CHAINS_PLAYER, QUESTIONS_P } from './SolutionRay';
import { InMissionPlayerContext } from '../../mission/missionPlayerContext';
import * as L from '../logic/solutionRay';
import { isCorrect } from '../primitives/labCheckpoint';

/**
 * solution-ray dans le lecteur de mission (rollout 2026-11-11, unité 4 leçon 3 ; verdict L3) : chaque question dit la MÊME vérité que la logique,
 * aucune clé brute ni `{{` à l'écran ; la page (solutionRay.render.test.jsx) reste inchangée.
 */
const k = (key, o) => i18n.t(`lesson:manipulation.solutionRay.${key}`, o);
const rawKey = /manipulation\.[a-zA-Z]|\{\{/;
const text = (q) => renderToString(<div>{q.prompt}{q.hints}{q.explain}{q.fields?.map((f, i) => <span key={i}>{f.label}{f.options.join(' ')}</span>)}{q.slots}{q.tiles}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}</div>);
const inPlayer = (el) => renderToString(<InMissionPlayerContext.Provider value>{el}</InMissionPlayerContext.Provider>);
const traced = (ineq, o, ...ks) => ks.reduce((l, kk) => L.addTrace(l, kk), L.initLab({ ineq, ...o }));
const WHOLE = { whole: true, min: 0, max: 18 };

describe('solution-ray in the mission player — rendering', () => {
  it('the live region, the kept line block, the ends buttons; no stepper, no tried chips; the page is unchanged', () => {
    const html = inPlayer(<SolutionRay ineq="6x+20<=80" whole min={0} max={18} start={16} bracket={false} levels={false} chains="cost" sides={{ left: 'الكلفة', right: 'الرصيد' }} />);
    expect(html).toContain('data-ray-verdict-live');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-paging-keep');
    expect(html).toContain('data-ray-nudge="less"');
    expect(html).not.toContain('data-sr-step');
    expect(html).not.toContain('data-ray-tried');
    expect(html).not.toContain('data-ray-bracket');
    expect(html).not.toMatch(rawKey);
    // the inequality the student must BUILD is not printed
    expect(html).not.toContain('6x + 20');
    const page = renderToString(<SolutionRay ineq="6x+20<=80" whole bracket={false} levels={false} />);
    expect(page).not.toContain('data-ray-verdict-live');
    expect(page).not.toContain('data-ray-nudge');
    expect(page).toContain('data-sr-step');
  });
  it('the verdict is hidden at rest on an untraced start: neutral probe, no colour word, no computed line', () => {
    const html = inPlayer(<SolutionRay ineq="6x+20<=80" whole min={0} max={18} start={16} bracket={false} levels={false} />);
    expect(html).toContain('data-ray-verdict-state=""');
    expect(html).not.toContain('bg-red-600');
    expect(html).not.toContain('data-trace=');
  });
  it('the bracket rounds show the sections and the coach anchors', () => {
    const html = inPlayer(<SolutionRay ineq="2x+7<=9" min={-6} max={6} start={5} transform divide="coef" levels={false} chains="pos" />);
    expect(html).toContain('data-mode="flip"');
    expect(html).not.toMatch(rawKey);
  });
  it('the sequence round starts on its first case', () => {
    const html = inPlayer(<SolutionRay sequence={['x<4', 'x<=4']} min={-2} max={10} start={8} levels={false} chains="bracket" />);
    expect(html).toContain('data-mode="bracket"');
    expect(html).not.toMatch(rawKey);
  });
});

describe('solution-ray chains — every question tells the logic\'s truth', () => {
  const idx = (q, pred) => q.options.findIndex(pred);
  it('costFill / edgeFill / buildIneq (M1)', () => {
    const l1 = traced('6x+20<=80', WHOLE, 16, 10, 11);
    const q = QUESTIONS_P.costFill(l1, k);
    expect(isCorrect(q, ['80'])).toBe(true); expect(isCorrect(q, ['86'])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
    const b = QUESTIONS_P.buildIneq(l1, k);
    expect(isCorrect(b, ['6', '20', '≤', '80'])).toBe(true);
    expect(isCorrect(b, ['6', '20', '<', '80'])).toBe(false);
    expect(new Set(b.tiles).size).toBe(b.tiles.length);
    expect(text(b)).not.toMatch(rawKey);
    expect(renderToString(<div>{b.hints[0]}</div>)).toContain('حمراء');          // refuted by HIS red point at 10
    const l2 = traced('15x+25>100', { whole: true, min: 0, max: 14 }, 1, 6, 5);
    expect(isCorrect(QUESTIONS_P.edgeFill(l2, k), ['6'])).toBe(true);
    const b2 = QUESTIONS_P.buildIneq(l2, k);
    expect(isCorrect(b2, ['15', '25', '>', '100'])).toBe(true);
    expect(renderToString(<div>{b2.hints[0]}</div>)).toContain('رمادية');          // refuted by HIS grey point at 5
    expect(text(QUESTIONS_P.ruleRegion(l2, k))).not.toMatch(rawKey);
    const r = QUESTIONS_P.ruleRegion(l2, k);
    expect(r.options.filter((o) => o.correct)).toHaveLength(1);
    expect(idx(r, (o) => o.correct)).toBe(1);
  });
  it('boundFill (M2 r1): the bound is a solution only where the sign allows it', () => {
    const l = L.initLab({ ineq: 'x<=4', min: -2, max: 10 });
    const q = QUESTIONS_P.boundFill(l, k, { cases: ['x<4', 'x<=4'] });
    expect(isCorrect(q, [k('player.notSol'), k('player.isSol')])).toBe(true);
    expect(isCorrect(q, [k('player.isSol'), k('player.isSol')])).toBe(false);
    expect(text(q)).not.toMatch(rawKey);
  });
  it('divFill / buildDiv (M2 r3): the sign flips, the number is 1, the kept direction is refused with his point', () => {
    let lab = traced('-2x+7<=5', { min: -6, max: 6 }, -5, 0, 3, 1);
    lab = L.placeBracket(lab, { k: 1, side: 'right', toward: true });
    const card = L.cardsFor(L.current(lab), 'coef')[0];
    lab = L.chooseStep(lab, card, L.candidates(lab, card).rel).lab;
    const f = QUESTIONS_P.divFill(lab, k);
    expect(isCorrect(f, ['1'])).toBe(true);
    const b = QUESTIONS_P.buildDiv(lab, k);
    expect(isCorrect(b, ['≥', '1'])).toBe(true);
    expect(isCorrect(b, ['≤', '1'])).toBe(false);
    expect(text(b)).not.toMatch(rawKey);
    expect(renderToString(<div>{b.hints[0]}</div>)).toMatch(/نقطتك|العدد/);
    expect(QUESTIONS_P.ruleDir(lab, k).options.filter((o) => o.correct)).toHaveLength(1);
  });
  it('the chain table names only supported questions', () => {
    Object.values(CHAINS_PLAYER).flat().forEach((c) => c.qs.forEach((q) => expect(QUESTIONS_P[q], q).toBeTypeOf('function')));
  });
});
