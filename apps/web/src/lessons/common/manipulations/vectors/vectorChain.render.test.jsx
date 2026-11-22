import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import VectorChain from './VectorChain';
import ManipulationWorkspace from '../ManipulationWorkspace';
import i18n from '../../../../i18n';
import * as L from '../logic/vectorChain';
import { LEVELS } from '../levels';

/**
 * vector-chain se rend aux deux niveaux de levels.js (le parallélogramme du métro ; l'ex-18) et en mode construct
 * (دوري الآن ص 138), seul et dans le workspace, sans clé i18n brute, sans interpolation oubliée, sans dollar visible.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const NOW138 = {
  mode: 'construct', stations: { A: [0, 0], B: [4, 1], C: [1, 3], E: [6, 4] }, radius: 2,
  builds: [{ terms: ['AB', 'AC'], centre: 'E', name: 'E_1' }, { terms: ['BE', 'CA'], centre: 'E', name: 'E_2' }],
};
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('NaN');
};

describe('vector-chain — rendu', () => {
  it('beginner: four stations as drop zones, the two coupling hooks, the tickets, the givens, the decor', () => {
    const html = renderToString(<VectorChain {...LEVELS['vector-chain'].beginner.numbers} theme="metro" />);
    expect(html).toContain('data-vector-chain');
    expect(html).toContain('data-mode="reduce"');
    expect(html).toContain('data-vc-glance');
    expect((html.match(/data-vc-station="/g) ?? []).length).toBe(4);
    expect(html).toContain('data-vc-zone="head"');
    expect(html).toContain('data-vc-zone="tail"');
    expect(html).toContain('data-vc-card="BC"');
    expect(html).toContain('data-vc-card="AB"');
    expect(html).toContain('data-vc-given="para"');
    expect((html.match(/data-vc-step="/g) ?? []).length).toBe(2);
    expect(html).toContain('data-deco="validator"');
    expect(html).toContain('data-deco="station-name"');
    expect(html).toContain('data-lab-fold="vector-chain.proof"');
    clean(html);
  });

  it('advanced (ex-18): eight stations, six givens, the goal to prove, no station names (decor kept light)', () => {
    const html = renderToString(<VectorChain {...LEVELS['vector-chain'].advanced.numbers} theme="metro" />);
    expect((html.match(/data-vc-station="/g) ?? []).length).toBe(8);
    expect(html).toContain('data-vc-givens="6"');
    expect(html).toContain('data-vc-given="def"');
    expect(html).toContain('data-vc-goal');
    expect(html).not.toContain('data-deco="station-name"');
    clean(html);
  });

  it('construct (دوري الآن ص 138): the stations, the two circles as tabs, the tickets of Γ1', () => {
    const html = renderToString(<VectorChain {...NOW138} levels={false} theme="metro" />);
    expect(html).toContain('data-mode="construct"');
    expect((html.match(/data-vc-step="/g) ?? []).length).toBe(2);
    expect(html).toContain('data-vc-card="AB"');
    expect(html).toContain('data-vc-card="AC"');
    expect(html).not.toContain('data-vc-zone="head"');
    expect(html).not.toContain('data-manipulation-levels-selector');
    clean(html);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <VectorChain level="beginner" {...LEVELS['vector-chain'].beginner.numbers} />,
        advanced: () => <VectorChain level="advanced" {...LEVELS['vector-chain'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-vector-chain/g) ?? []).length).toBe(2);
    clean(html);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.vectorChain.${key}`, o);
const PRE = /manipulation\.[a-zA-Z]/;

describe('vector-chain — questions pendant le labo (LabCheckpoint)', () => {
  const build = async (lab, ctxOf) => {
    const { chainOf, QUESTIONS } = await import('./VectorChain');
    const ids = chainOf(lab);
    return ids.map((qid) => {
      const q = QUESTIONS[qid](lab, k, ctxOf);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, qid).not.toMatch(PRE);
      expect(out, qid).not.toContain('{{');
      expect(out, qid).not.toContain('undefined');
      expect(q.hints, qid).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), qid).toHaveLength(1);
      else expect(q.expected).toBeTruthy();
      if (q.kind === 'choice') for (const o of q.options) if (!o.correct) expect(o.why, `${qid} why`).toBeTruthy();
      return [qid, q];
    });
  };
  const ctxFor = () => ({ prompt: 'dPromptBeginner', options: [{ text: 'a', correct: true }, { text: 'b', why: 'w' }], formal: <span>f</span> });

  it('مبتدئ : la mission 1 (BC + AB) pose couple · final, la mission 2 (AB + AD) couple · swap · final', async () => {
    let s = L.init(LEVELS['vector-chain'].beginner.numbers);
    s = L.couple(s, 'm0c0', 'tail');   // BC sur le train
    s = L.couple(s, 'm0c1', 'head');   // AB devant : AB + BC = AC
    expect(L.current(s).train).toBe('AC');
    const a = await build(s, ctxFor(s));
    expect(a.map(([id]) => id)).toEqual(['couple', 'final']);
    expect(a[1][1].options.find((o) => o.correct).text.props.children).toContain('AC');
    s = L.goTo(s, 1);
    s = L.couple(s, 'm1c0', 'tail');   // AB sur le train
    s = L.translateCard(s, 'm1c1', 'B'); // AD -> BC
    s = L.couple(s, 'm1c1', 'tail');
    const b = await build(s, ctxFor(s));
    expect(b.map(([id]) => id)).toEqual(['couple', 'swap', 'final', 'rule']);
  });

  it('construct : count (nombre de termes) · chain, puis la règle à la dernière', async () => {
    const NOW = {
      mode: 'construct', stations: { A: [0, 0], B: [4, 1], C: [1, 3], E: [6, 4] }, radius: 2,
      builds: [{ terms: ['AB', 'AC'], centre: 'E', name: 'E_1' }, { terms: ['BE', 'CA'], centre: 'E', name: 'E_2' }],
    };
    let s = L.init(NOW);
    s = L.place(s, 'b0c0', 'st:E'); s = L.place(s, 'b0c1', 'tip');
    expect(L.currentBuild(s).found).toBeTruthy();
    const a = await build(s, ctxFor(s));
    expect(a.map(([id]) => id)).toEqual(['count', 'chain']);
    expect(a[0][1].expected).toBe('2');
  });

  it('restartStep remet la même mission au départ et rouvre ses essais', () => {
    let s = L.init(LEVELS['vector-chain'].beginner.numbers);
    s = L.couple(s, 'm0c0', 'tail'); s = L.couple(s, 'm0c1', 'head');
    expect(s.done[0]).toBe(true);
    const r = L.restartStep(s);
    expect(r.done[0]).toBe(false);
    expect(L.current(r).tray).toHaveLength(2);
    expect(L.current(r).train).toBe(null);
  });
});

describe('vector-chain — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice', () => {
    const out = renderToString(<VectorChain {...LEVELS['vector-chain'].beginner.numbers} level="beginner" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<VectorChain {...LEVELS['vector-chain'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
  });
});
