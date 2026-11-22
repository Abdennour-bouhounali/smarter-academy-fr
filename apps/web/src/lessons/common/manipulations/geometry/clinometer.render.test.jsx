import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import Clinometer from './Clinometer';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/clinometer';

/**
 * clinometer se rend dans ses TROIS modes (le projecteur, l'échelle du تحدّ, l'alignement de la synthèse sur les nombres
 * du manuel), seul et dans un workspace, à plat ou par `numbers`, sans clé i18n brute, sans interpolation oubliée et
 * sans la réponse écrite sur le premier écran (24 m, 1,9 m, 92,09 m, 43°).
 */
const RAW = /manipulation\.[a-zA-Z]/;
const ALIGN = { mode: 'align', pole: 2.3, poleAt: 95.65, total: 98.1 };
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
};

describe('clinometer — rendu', () => {
  it('height (beginner): the floodlight, the phone on the touchline, the two handles, the shutter, no height written', () => {
    const html = renderToString(<Clinometer {...LEVELS.clinometer.beginner.numbers} />);
    expect(html).toContain('data-clinometer');
    expect(html).toContain('data-cl-glance');
    expect(html).toContain('data-mode="height"');
    expect(html).toContain('data-world="floodlight"');
    expect(html).toContain('data-stage="hand"');
    expect(html).toContain('data-aimed="false"');
    expect(html).toContain('data-cl-hand="15"');
    expect(html).toContain('data-cl-tilt="20"');
    expect(html).toContain('data-cl-shutter');
    expect(html).toContain('data-cl-phone="height"');
    expect(html).toContain('data-deco="floodlight"');
    expect(html).not.toContain('data-cl-plan');
    expect(html).not.toContain('24 m');
    clean(html);
  });

  it('ladder (advanced, the تحدّ): the ladder starts at 1,6 m and reaches 1,37 m; 1,9 nowhere', () => {
    const html = renderToString(<Clinometer {...LEVELS.clinometer.advanced.numbers} />);
    expect(html).toContain('data-mode="ladder"');
    expect(html).toContain('data-world="mural"');
    expect(html).toContain('data-cl-ladder="1,6"');
    expect(html).toContain('data-cl-top="1,37"');
    expect(html).toContain('data-cl-mark="1,6"');
    expect(html).toContain('data-deco="mural"');
    expect(html).not.toContain('1,9 m');
    expect(html).not.toContain('1{,}9');
    expect(html).not.toContain('1,87');
    clean(html);
  });

  it('align (the synthesis, textbook numbers, passed as `numbers`): the zoom, the observer, no H and no x on screen', () => {
    const html = renderToString(<Clinometer numbers={ALIGN} theme="maqam" />);
    expect(html).toContain('data-mode="align"');
    expect(html).toContain('data-world="maqam"');
    expect(html).toContain('data-cl-zoom');
    expect(html).toContain('data-cl-hand=');
    expect(html).toContain('data-deco="maqam"');
    expect(html).toContain('data-cl-phone-angle=""');
    expect(html).not.toContain('92,09');
    expect(html).not.toContain('92{,}09');
    expect(html).not.toContain('43°');
    clean(html);
  });

  it('align: the logic behind it gives the textbook answers H ≈ 92,09 m and x ≈ 43°', () => {
    let s = L.init(ALIGN);
    s = L.moveTo(s, s.iStar + 3);
    s = L.moveTo(s, s.iStar);
    s = L.chooseRatio(s, 'tan');
    expect(L.result(s)).toMatchObject({ H100: '92,09', x: '43' });
  });

  it('inside a workspace: both levels mounted, one selector, the synthesis align on one panel', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <Clinometer level="beginner" {...LEVELS.clinometer.beginner.numbers} />,
        advanced: () => <Clinometer {...LEVELS.clinometer.advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-mode="/g) ?? []).length).toBe(2);
    clean(html);
    const syn = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <Clinometer level="beginner" {...ALIGN} theme="maqam" />,
        advanced: () => <Clinometer {...LEVELS.clinometer.advanced.numbers} />,
      }} />,
    );
    expect(syn).toContain('data-mode="align"');
    expect(syn).toContain('data-mode="ladder"');
    clean(syn);
  });
});

/* ══════════ Questions pendant le labo (primitives/LabCheckpoint) et mode guidé ══════════ */
import i18n from '../../../../i18n';

const kc = (key, o) => i18n.t(`lesson:manipulation.clinometer.${key}`, o);

/** Atteint chaque étape avec la logique pure (aucun clic) : height (2 mesures éloignées), ladder (encadré + plan), align (aligné + plan). */
function reach(mode) {
  if (mode === 'height') {
    let s = L.init(LEVELS.clinometer.beginner.numbers);
    s = L.chooseOp(L.chooseRatio(L.shoot(L.tiltTo(L.moveTo(s, 15), L.readAngle(s, 15))), 'tan'), 'mul');
    s = L.shoot(L.tiltTo(L.moveTo(s, 35), L.readAngle(s, 35)));
    return s;
  }
  if (mode === 'ladder') {
    let s = L.init(LEVELS.clinometer.advanced.numbers);
    for (let i = s.iMin; i <= s.iMax; i += 1) s = L.moveTo(s, i);
    return L.chooseOp(L.chooseRatio(s, 'sin'), 'div');
  }
  let s = L.init({ mode: 'align', pole: 2.3, poleAt: 95.65, total: 98.1 });
  s = L.moveTo(L.moveTo(s, s.iStar + 6), s.iStar);
  return L.chooseRatio(s, 'tan');
}

describe('clinometer — questions pendant le labo (LabCheckpoint)', () => {
  it('every question of every stage of the three modes has text, 2 hints, one right answer, no raw key', async () => {
    const { CHAINS, REACHED, QUESTIONS } = await import('./Clinometer');
    const ctx = { prompt: 'p', options: [{ text: 'a', correct: true }, { text: 'b', why: 'w' }, { text: 'c', why: 'w' }], formal: 'f' };
    for (const mode of ['height', 'ladder', 'align']) {
      const s = reach(mode);
      for (const [sid, qids] of Object.entries(CHAINS[mode])) {
        expect(REACHED[sid](s), `${sid} reached`).toBe(true);
        for (const qid of qids) {
          const q = QUESTIONS[qid](s, kc, ctx);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${mode}.${qid}`).not.toMatch(RAW);
          expect(out, `${mode}.${qid}`).not.toContain('{{');
          expect(q.hints, `${mode}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${mode}.${qid}`).toHaveLength(1);
            for (const o of q.options.filter((x) => !x.correct)) expect(o.why, `${mode}.${qid} why`).toBeTruthy();
          } else expect(q.expected, `${mode}.${qid}`).toBeTruthy();
        }
      }
    }
  });

  it('the numeric answers are built from the student\'s own numbers', async () => {
    const { QUESTIONS } = await import('./Clinometer');
    const ctx = {};
    const h = reach('height');
    expect(QUESTIONS.farther(h, kc, ctx).expected).toBe('20');
    expect(QUESTIONS.heightValue(h, kc, ctx).expected).toBe(String(Math.round(L.measures(h)[0].h)));
    expect(QUESTIONS.lengthValue(reach('ladder'), kc, ctx).expected).toBe('1,9');
    const a = reach('align');
    expect(QUESTIONS.total(a, kc, ctx).expected).toBe('98,1');
    expect(QUESTIONS.angleX(a, kc, ctx).expected).toBe('43');
    expect(QUESTIONS.heightMonument(a, kc, ctx).expected).toBe('92');
  });
});

describe('clinometer — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('shows the steps and no progression / hint button; the teacher switch is mounted', () => {
    const html = renderToString(<Clinometer {...LEVELS.clinometer.advanced.numbers} />);
    expect(html).toContain('data-lab-stepper');
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
