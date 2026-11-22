import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as L from '../logic/sectionSlicer';
import SectionSlicer from './SectionSlicer';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * section-slicer se rend à ses DEUX niveaux (la sphère de rayon 5 ; le نشاط 2 puis les solides des نشاطات 3–5), seul et dans
 * un workspace, à plat ou par `numbers`, sans clé i18n brute ni interpolation oubliée, avec TOUTES ses commandes visibles
 * sans WebGL (le rendu serveur voit le repli SpaceFigure à la place de la scène) — et SANS la réponse sur le premier écran :
 * aucune carte, aucun rayon, aucune règle avant la première impression.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('NaN');
};

describe('section-slicer — rendu', () => {
  it('مبتدئ : la sphère R = 5, le plan à h = 2, le rail, « اطبع » — pas de carte, pas de rayon, pas de règle', () => {
    const html = renderToString(<SectionSlicer {...LEVELS['section-slicer'].beginner.numbers} />);
    expect(html).toContain('data-section-slicer');
    expect(html).toContain('data-stage="sphere"');
    expect(html).toContain('data-world="3d-printer"');
    expect(html).toContain('data-sl-glance');
    expect(html).toContain('data-stage3d');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).toContain('data-space-figure');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-sl-rail="2"');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toContain('data-sl-less');
    expect(html).toContain('data-sl-more');
    expect(html).toContain('data-sl-print');
    expect(html).toContain('data-sl-verdict="start"');
    expect(html).toContain('data-deco="3d-printer"');
    expect(html).not.toContain('data-sl-tab=');
    expect(html).not.toContain('data-sl-card');
    expect(html).not.toContain('data-manipulation-discovery');
    expect(html).not.toContain('data-sl-formal');
    expect(html).not.toContain('R^2 - h^2');
    clean(html);
  });

  it('متقدم (نشاط 2 puis les solides) : quatre onglets, x = OI = 1,5 au départ, aucune des cinq valeurs du manuel lue', () => {
    const html = renderToString(<SectionSlicer numbers={LEVELS['section-slicer'].advanced.numbers} />);
    expect(html).toContain('data-stage="sphere"');
    expect((html.match(/data-sl-tab="/g) ?? []).length).toBe(4);
    for (const s of ['sphere', 'cuboid', 'cylinder', 'pyramid']) expect(html).toContain(`data-sl-tab="${s}"`);
    expect(html).toContain('data-sl-rail="1,5"');
    expect(html).toContain('data-sl-value="1,5"');
    expect(html).not.toContain('\\sqrt{119}');
    expect(html).not.toContain('data-sl-next');
    clean(html);
  });

  it('dans un workspace : les deux niveaux montés, le نشاط 2 par défaut, deux scènes indépendantes', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <SectionSlicer level="beginner" {...LEVELS['section-slicer'].beginner.numbers} />,
        advanced: () => <SectionSlicer level="advanced" {...LEVELS['section-slicer'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-section-slicer/g) ?? []).length).toBe(2);
    expect((html.match(/data-stage3d="true"/g) ?? []).length).toBe(2);
    clean(html);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.sectionSlicer.${key}`, o);
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(RAW);
  expect(out, qid).not.toContain('{{');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};
/** L'élève va à un étage, place le plan et prédit juste. */
const printRight = (lab, stage, i) => {
  let s = L.goStage(lab, stage);
  s = L.moveTo(s, i);
  s = L.print(s);
  return L.choose(s, s.pending.cards.find((c) => c.correct).id);
};

describe('section-slicer — questions pendant le labo (LabCheckpoint)', () => {
  it('sphère : le contraste (grand cercle, petit cercle, contact) ouvre sphR2 · sphEdge · règle ; r² attendu = R² − h² de SA couche', async () => {
    const { chainOf, QUESTIONS } = await import('./SectionSlicer');
    let s = L.init(LEVELS['section-slicer'].advanced.numbers);
    expect(L.stepsOf(s)[0].reached).toBe(false);
    s = printRight(s, 'sphere', 0);
    s = printRight(s, 'sphere', 30);   // h = 1,5 : R² − h² = 9 − 2,25 = 6,75
    expect(L.stepsOf(s)[0].reached).toBe(false);
    s = printRight(s, 'sphere', 60);   // h = R : un point
    const st = L.stepsOf(s)[0];
    expect(st.reached).toBe(true);
    expect(chainOf('sphere')).toEqual(['sphR2', 'sphEdge', 'rule']);
    const ctx = { lab: s, step: st, letter: 'x', options: [{ text: 'a', correct: true }], formal: null };
    expect(QUESTIONS.sphR2(ctx, k).expected).toBe('27/4');
    for (const qid of ['sphR2', 'sphEdge']) checkQ(qid, QUESTIONS[qid](ctx, k));
    checkQ('rule', QUESTIONS.rule(ctx, k));
    s = printRight(s, 'sphere', 70);   // h > R : rien
    const none = L.retryStep(s, 'sphere');
    expect(none.trials.filter((x) => x.stage === 'sphere')).toHaveLength(0);
    expect(L.stepsOf(none)[0].reached).toBe(false);
  });

  it('les solides : une suite par étage, des nombres exacts de SA couche', async () => {
    const { chainOf, QUESTIONS } = await import('./SectionSlicer');
    let s = L.init(LEVELS['section-slicer'].advanced.numbers);
    s = printRight(s, 'cuboid-face', 10);
    s = printRight(s, 'cuboid-edge', 8);
    s = printRight(s, 'cylinder-base', 10);
    s = printRight(s, 'cylinder-axis', 10);   // d = 0,5 : r² − d² = 2,89 − 0,25 = 2,64
    s = printRight(s, 'pyramid', 3);          // k = 5/8 : côté = 5/2
    const steps = L.stepsOf(s);
    expect(steps.slice(1).every((x) => x.reached)).toBe(true);
    for (const st of steps.slice(1)) {
      for (const qid of chainOf(st.id)) checkQ(`${st.id}.${qid}`, QUESTIONS[qid]({ lab: s, step: st, letter: 'x' }, k));
    }
    const ax = steps.find((x) => x.id === 'cylinder-axis');
    expect(QUESTIONS.caHalf2({ lab: s, step: ax }, k).expected).toBe('66/25');
    expect(QUESTIONS.pySide({ lab: s, step: steps.find((x) => x.id === 'pyramid') }, k).expected).toBe('5/2');
    const r = L.retryStep(s, 'pyramid');
    expect(L.stepsOf(r).find((x) => x.id === 'pyramid').reached).toBe(false);
  });
});

describe('section-slicer — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, un stepper ; coupées : ils reviennent', () => {
    const a = renderToString(<SectionSlicer {...LEVELS['section-slicer'].advanced.numbers} level="advanced" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-sl-step="0"');
    const b = renderToString(<SectionSlicer {...LEVELS['section-slicer'].advanced.numbers} level="advanced" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
