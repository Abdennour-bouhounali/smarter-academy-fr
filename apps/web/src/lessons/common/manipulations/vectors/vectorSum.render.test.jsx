import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import * as L from '../logic/vectorSum';
import VectorSum from './VectorSum';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * vector-sum se rend dans ses DEUX modes (la trottinette de علاقة شال, le nageur du تحدّ) seul et dans un workspace, à
 * plat ou par `numbers`, sans clé i18n brute, sans interpolation oubliée, et SANS la réponse sur le premier écran :
 * ni la somme AC (avant la pose), ni 30°, ni 2√3 / 3,46 (avant l'arrivée en B).
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
};

describe('vector-sum — rendu', () => {
  it('chasles (beginner): la carte, AB fait, trois cartes de trajet, quatre stations, pas encore de somme', () => {
    const html = renderToString(<VectorSum {...LEVELS['vector-sum'].beginner.numbers} />);
    expect(html).toContain('data-vector-sum');
    expect(html).toContain('data-mode="chasles"');
    expect(html).toContain('data-world="scooter"');
    expect(html).toContain('data-vs-glance');
    expect(html).toContain('data-vs-first');
    expect((html.match(/data-vs-card="/g) ?? []).length).toBe(3);
    expect((html.match(/data-vs-station="/g) ?? []).length).toBe(4);
    expect(html).toContain('data-vs-verdict="start"');
    expect(html).toContain('data-deco="scooter"');
    expect(html).not.toContain('data-vs-sum');
    expect(html).not.toContain('5,66');
    clean(html);
  });

  it('parallelogram (advanced, the تحدّ): A, B, the current, the swimmer aiming at B — 30° and 2√3 nowhere', () => {
    const html = renderToString(<VectorSum numbers={LEVELS['vector-sum'].advanced.numbers} />);
    expect(html).toContain('data-mode="parallelogram"');
    expect(html).toContain('data-world="swim"');
    expect(html).toContain('data-vs-handle="0"');
    expect(html).toContain('data-vs-current');
    expect(html).toContain('data-vs-swim');
    expect(html).toContain('data-vs-sum="live"');
    expect(html).toContain('data-vs-verdict="start"');
    expect(html).toContain('data-deco="swim"');
    expect(html).not.toContain('30°');
    expect(html).not.toContain('3,46');
    expect(html).not.toContain('\\sqrt{3}');
    clean(html);
  });

  it('inside a workspace: both levels mounted, the تحدّ by default', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <VectorSum level="beginner" {...LEVELS['vector-sum'].beginner.numbers} />,
        advanced: () => <VectorSum level="advanced" {...LEVELS['vector-sum'].advanced.numbers} />,
      }} />,
    );
    expect(html).toContain('data-mode="chasles"');
    expect(html).toContain('data-mode="parallelogram"');
    clean(html);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.vectorSum.${key}`, o);
const m = (mode) => (key, o) => k(`${mode}.${key}`, o);
const PRE = /manipulation\.[a-zA-Z]/;
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(PRE);
  expect(out, qid).not.toContain('{{');
  expect(out, qid).not.toContain('undefined');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('vector-sum — questions pendant le labo (LabCheckpoint)', () => {
  it('chasles : le virage (sumVec · shorter) puis le retour (zeroSum · opposite · règle) ; elles lisent les essais de l’élève', async () => {
    const { chainOf, QUESTIONS } = await import('./VectorSum');
    let s = L.init(LEVELS['vector-sum'].beginner.numbers);
    s = L.attach(s, 0, 'B');
    expect(L.reachedKinds(s)).toEqual(['turn']);
    expect(chainOf(s, 'turn', false)).toEqual(['sumVec', 'shorter']);
    for (const qid of chainOf(s, 'turn', false)) checkQ(qid, QUESTIONS[qid](s, k, { options: [], formal: null, m: m('chasles') }));
    s = L.attach(s, 2, 'B');
    expect(L.reachedKinds(s)).toEqual(['turn', 'zero']);
    expect(chainOf(s, 'zero', true)).toEqual(['zeroSum', 'opposite', 'rule']);
    for (const qid of ['zeroSum', 'opposite']) checkQ(qid, QUESTIONS[qid](s, k, {}));
    const r = L.restartStep(s, 'zero');
    expect(L.reachedKinds(r)).toEqual(['turn']);
    expect(r.placed).toBe(null);
  });

  it('nageur : l’arrivée (angle · real) puis un départ manqué (miss · règle) ; angle attendu = celui de l’élève', async () => {
    const { chainOf, QUESTIONS } = await import('./VectorSum');
    let s = L.init(LEVELS['vector-sum'].advanced.numbers);
    s = L.launch(s, 0);
    expect(L.reachedKinds(s)).toEqual(['miss']);
    checkQ('miss', QUESTIONS.miss(s, k, {}));
    s = L.launch(s, 30);
    expect(L.reachedKinds(s)).toEqual(['target', 'miss']);
    expect(chainOf(s, 'target', true)).toEqual(['angle', 'real', 'rule']);
    expect(QUESTIONS.angle(s, k).expected).toBe('30');
    for (const qid of ['angle', 'real']) checkQ(qid, QUESTIONS[qid](s, k, {}));
    expect(QUESTIONS.real(s, k).options.filter((o) => o.correct)).toHaveLength(1);
  });
});

describe('vector-sum — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; coupées : ils reviennent', () => {
    const a = renderToString(<VectorSum {...LEVELS['vector-sum'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-vs-step="0"');
    const b = renderToString(<VectorSum {...LEVELS['vector-sum'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
