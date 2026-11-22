import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import * as L from '../logic/parallelogramPin';
import ParallelogramPin from './ParallelogramPin';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * parallelogram-pin se rend aux deux niveaux de levels.js (le foulard et I ; la banderole et D), seul et dans le
 * workspace, sans clé i18n brute, sans interpolation oubliée, sans dollar hors des îlots.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const { beginner, advanced } = LEVELS['parallelogram-pin'];

describe('parallelogram-pin — rendu', () => {
  it('beginner (midpoint): I on the scarf as a slider, the 8 parts, the two arrows, the three criteria, the flip, the decor', () => {
    const html = renderToString(<ParallelogramPin {...beginner.numbers} level="beginner" theme="tifo" />);
    expect(html).toContain('data-parallelogram-pin');
    expect(html).toContain('data-mode="midpoint"');
    expect(html).toContain('data-pp-glance');
    expect(html).toContain('data-pp-handle="I"');
    expect(html).toContain('role="slider"');
    expect((html.match(/data-tick=/g) ?? []).length).toBe(9);
    expect(html).toContain('data-pp-arrow="AI"');
    expect(html).toContain('data-pp-arrow="IB"');
    expect(html).toContain('data-pp-flip');
    expect(html).toContain('data-pp-crit="tul" data-ok="false"');
    expect(html).toContain('data-pp-crit="ittijah" data-ok="true"');
    expect(html).toContain('data-deco="drum"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (طرائق): the banner, the held corner D, the four moves, the two midpoint markers apart', () => {
    const html = renderToString(<ParallelogramPin {...advanced.numbers} level="advanced" theme="tifo" />);
    expect(html).toContain('data-mode="parallelogram"');
    expect(html).toContain('data-stage="D"');
    expect(html).toContain('data-pp-handle="D"');
    expect((html.match(/data-pp-move=/g) ?? []).length).toBe(4);
    expect(html).toContain('data-pp-commit');
    expect(html).toContain('data-pp-banner');
    expect(html).toContain('data-pp-mid="AD"');
    expect(html).toContain('data-pp-mid="BC"');
    expect(html).toContain('data-merged="false"');
    expect(html).not.toContain('data-pp-next-e');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ParallelogramPin level="beginner" numbers={beginner.numbers} />,
        advanced: () => <ParallelogramPin level="advanced" numbers={advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-parallelogram-pin/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.parallelogramPin.${key}`, o);
const PRE = /manipulation\.[a-zA-Z]/;
const CTX = { prompt: 'dPromptMid', options: [{ text: 'a', correct: true }, { text: 'b', why: 'w' }], formal: <span>f</span> };
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(PRE);
  expect(out, qid).not.toContain('{{');
  expect(out, qid).not.toContain('undefined');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('parallelogram-pin — questions pendant le labo (LabCheckpoint)', () => {
  it('midpoint : le milieu (parts · equalWhy) puis une encoche où seules les longueurs diffèrent (partsIB · notEqual · règle)', async () => {
    const { chainOf, QUESTIONS } = await import('./ParallelogramPin');
    let s = L.init(LEVELS['parallelogram-pin'].beginner.numbers);
    s = L.commitI(s, 4);
    expect(L.reachedKinds(s)).toEqual(['equal']);
    expect(chainOf('equal', false)).toEqual(['parts', 'equalWhy']);
    for (const qid of chainOf('equal', false)) checkQ(qid, QUESTIONS[qid](s, k, CTX));
    expect(QUESTIONS.parts(s, k).expected).toBe('4');
    s = L.commitI(s, 3);
    expect(L.reachedKinds(s)).toEqual(['equal', 'length']);
    for (const qid of chainOf('length', true)) checkQ(qid, QUESTIONS[qid](s, k, CTX));
    expect(QUESTIONS.partsIB(s, k).expected).toBe('5');
    const r = L.restartStep(s, 'length');
    expect(L.reachedKinds(r)).toEqual(['equal']);
    expect(r.k).toBe(2);
  });

  it('parallelogram : D (dWhy · dMids) puis E (eWhy · bMid · règle) ; « أعِد التجربة » remet l’étape', async () => {
    const { chainOf, QUESTIONS } = await import('./ParallelogramPin');
    let s = L.init(LEVELS['parallelogram-pin'].advanced.numbers);
    s = L.commitPoint(s, 'D', s.target);
    expect(L.reachedKinds(s)).toEqual(['D']);
    for (const qid of chainOf('D', false)) checkQ(qid, QUESTIONS[qid](s, k, CTX));
    s = L.openE(s);
    s = L.commitPoint(s, 'E', s.targetE);
    expect(L.reachedKinds(s)).toEqual(['D', 'E']);
    for (const qid of chainOf('E', true)) checkQ(qid, QUESTIONS[qid](s, k, { ...CTX, prompt: 'dPromptPara' }));
    const r = L.restartStep(s, 'E');
    expect(L.reachedKinds(r)).toEqual(['D']);
    expect(L.reachedKinds(L.restartStep(s, 'D'))).toEqual([]);
  });
});

describe('parallelogram-pin — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; coupées : ils reviennent', () => {
    const a = renderToString(<ParallelogramPin {...LEVELS['parallelogram-pin'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-pp-step="0"');
    const b = renderToString(<ParallelogramPin {...LEVELS['parallelogram-pin'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
