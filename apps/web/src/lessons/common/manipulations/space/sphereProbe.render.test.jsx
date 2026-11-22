import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as L from '../logic/sphereProbe';
import SphereProbe from './SphereProbe';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * sphere-probe se rend aux deux niveaux de levels.js, seul et dans un workspace, sans WebGL (le repli SpaceFigure occupe la
 * fenêtre 3D), avec TOUTES ses commandes HTML, sans clé i18n brute ni interpolation oubliée — et sans aucun verdict écrit avant
 * que l'élève n'ait jugé.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('sphere-probe — rendu', () => {
  it('مبتدئ : la lampe-globe, la sonde M, les sondes A, B, C, trois déclarations, OM² lu, aucun verdict', () => {
    const html = renderToString(<SphereProbe level="beginner" {...LEVELS['sphere-probe'].beginner.numbers} />);
    expect(html).toContain('data-sphere-probe');
    expect(html).toContain('data-world="glass-globe"');
    expect(html).toContain('data-mode="classify"');
    expect(html).toContain('data-sp-glance');
    expect(html).toContain('data-stage3d');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).toContain('data-space-figure');
    for (const c of ['surface', 'inside', 'outside']) expect(html).toContain(`data-sp-claim="${c}"`);
    expect((html.match(/data-sp-coord="/g) ?? []).length).toBe(3);
    expect((html.match(/role="spinbutton"/g) ?? []).length).toBe(3);
    expect(html).toContain('data-sp-object="sphere"');
    expect(html).toContain('data-sp-object="ball"');
    expect(html).toContain('data-sp-reading');
    expect(html).toContain('data-sp-verdict="start"');
    expect((html.match(/data-sp-chip="/g) ?? []).length).toBe(3);
    expect(html).toContain('data-deco="glass-globe"');
    // aucun verdict avant la déclaration de l'élève
    for (const leak of ['صحيح', 'data-done="true"', 'data-sp-formal']) expect(html).not.toContain(leak);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('متقدم : le stade, la tâche « M sur la كرة », OM jamais écrite pendant le geste', () => {
    // Les indices (formule générale) sont affichés d'emblée : « OM jamais écrite » se mesure hors d'eux.
    const html = renderToString(<SphereProbe {...LEVELS['sphere-probe'].advanced.numbers} />).replace(/<ol[^>]*data-manipulation-hints[\s\S]*?<\/ol>/, '');
    expect(html).toContain('data-world="shot-put"');
    expect(html).toContain('data-mode="tasks"');
    expect(html).toContain('data-task="surface"');
    expect(html).toContain('data-sp-place');
    expect(html).not.toContain('data-sp-claim');
    expect(html).not.toContain('data-sp-to-circles');
    expect(html).not.toContain('OM^2 =');
    expect((html.match(/data-sp-chip="/g) ?? []).length).toBe(6);
    expect(html).toContain('data-deco="shot-put"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, des ids SVG distincts', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <SphereProbe level="beginner" theme="glass-globe" numbers={LEVELS['sphere-probe'].beginner.numbers} />,
        advanced: () => <SphereProbe level="advanced" theme="shot-put" numbers={LEVELS['sphere-probe'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-sphere-probe="true"|data-sphere-probe=""/g) ?? []).length).toBe(2);
    const ids = [...html.matchAll(/ id="(sp[A-Za-z]+[^"]*)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(3);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.sphereProbe.${key}`, o);
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(RAW);
  expect(out, qid).not.toContain('{{');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('sphere-probe — questions pendant le labo (LabCheckpoint)', () => {
  it('مبتدئ : chaque position jugée juste ouvre sa suite, construite sur SES nombres ; la dernière finit par la règle', async () => {
    const { chainOf, QUESTIONS } = await import('./SphereProbe');
    let s = L.init(LEVELS['sphere-probe'].beginner.numbers);
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([false, false, false]);
    s = L.classify(L.moveM(s, [1, 2, 2]), 'surface');
    s = L.classify(L.moveM(s, [1, 1, 1]), 'inside');
    s = L.classify(L.moveM(s, [2, 2, 2]), 'outside');
    const steps = L.stepsOf(s);
    expect(steps.map((x) => x.reached)).toEqual([true, true, true]);
    expect(chainOf('outside')).toEqual(['om2', 'cmp', 'ball', 'rule']);
    for (const st of steps) {
      for (const qid of chainOf(st.id).filter((q) => q !== 'rule')) checkQ(`${st.id}.${qid}`, QUESTIONS[qid]({ lab: s, step: st }, k));
    }
    checkQ('rule', QUESTIONS.rule({ options: [{ text: 'a', correct: true }], formal: null }, k));
    expect(QUESTIONS.om2({ lab: s, step: steps[1] }, k).expected).toBe('3');
    expect(QUESTIONS.cmp({ lab: s, step: steps[2] }, k).options[2].correct).toBe(true);   // OM² = 12 > 9
    const r = L.retryStep(s, 'inside');
    expect(L.stepsOf(r).map((x) => x.reached)).toEqual([true, false, true]);
  });

  it('متقدم : le قطر, la دائرة كبرى, la دائرة صغرى ; « أعِد التجربة » remet la tâche', async () => {
    const { chainOf, QUESTIONS } = await import('./SphereProbe');
    let s = L.init(LEVELS['sphere-probe'].advanced.numbers);
    s = L.place(L.moveM(s, [0, 0, 4]));
    s = L.place(L.moveM(s, [1, 1, 1]));
    s = L.place(L.moveM(s, [4, 4, 4]));
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([true, true, true, false, false, false]);
    s = L.openCircles(s);
    s = L.claimDiameter(L.movePrime(s, [0, 0, -4]));
    s = L.claimSection(L.setPlane(s, 0));
    s = L.claimSection(L.setPlane(s, 2));
    const steps = L.stepsOf(s);
    expect(steps.every((x) => x.reached)).toBe(true);
    for (const st of steps.slice(3)) for (const qid of chainOf(st.id)) checkQ(`${st.id}.${qid}`, QUESTIONS[qid]({ lab: s, step: st }, k));
    expect(QUESTIONS.diamLen({ lab: s, step: steps[3] }, k).expected).toBe('8');
    expect(QUESTIONS.scRadius2({ lab: s, step: steps[5] }, k).expected).toBe('12');
    const r = L.retryStep(s, 'diameter');
    expect(r.taskIndex).toBe(3);
    expect(L.stepsOf(r).slice(3).map((x) => x.reached)).toEqual([false, false, false]);
  });
});

describe('sphere-probe — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, un stepper ; coupées : ils reviennent', () => {
    const a = renderToString(<SphereProbe {...LEVELS['sphere-probe'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-sp-step="0"');
    const b = renderToString(<SphereProbe {...LEVELS['sphere-probe'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
