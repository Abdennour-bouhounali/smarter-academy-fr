import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as RT from '@smarter-academy/core/arithmetic/rotation.js';
import RotationDial, { chainOf, QUESTIONS } from './RotationDial';
import * as L from '../logic/rotationDial';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * rotation-dial se rend aux deux niveaux de levels.js (la grande roue de Ben Aknoun ; la feuille du نشاط 2 / 3), seul
 * et dans le workspace, sans clé i18n brute, sans interpolation oubliée, sans mot latin hors des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const LATIN_WORD = />[^<]*\b(?:Enter|wheel|gondola|compass|image|direct|indirect)\b[^<]*</i;

describe('rotation-dial — rendu', () => {
  it('beginner (wheel): the dusk, six gondolas, 24 nodes, the image handle, four task tabs, the lamps, the décor', () => {
    const html = renderToString(<RotationDial {...LEVELS['rotation-dial'].beginner.numbers} theme="ferris-wheel" />);
    expect(html).toContain('data-rotation-dial');
    expect(html).toContain('data-scene="wheel"');
    expect(html).toContain('data-rd-glance');
    expect((html.match(/data-rd-gondola=/g) ?? []).length).toBe(6);
    expect((html.match(/data-rd-node=/g) ?? []).length).toBe(24);
    expect(html).toContain('data-rd-handle="image"');
    expect(html).not.toContain('data-rd-handle="compass"');
    expect((html.match(/data-rd-tab=/g) ?? []).length).toBe(4);
    expect(html).toContain('data-rd-lamp="sense"');
    expect(html).toContain('data-deco="sky"');
    expect(html).toContain('data-deco="tickets"');
    expect(html).toContain('data-task="t1"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('advanced (plane, نشاط 2 puis 3): three missions, the compass and the ruler knob, no lamps, no circle before the compass', () => {
    const html = renderToString(<RotationDial {...LEVELS['rotation-dial'].advanced.numbers} theme="ferris-wheel" />);
    expect(html).toContain('data-scene="plane"');
    expect(html).toContain('data-mission="point"');
    expect((html.match(/data-rd-tab=/g) ?? []).length).toBe(3);
    expect(html).toContain('data-rd-handle="compass"');
    expect(html).toContain('data-rd-handle="ray"');
    expect(html).toContain('data-rd-handle="image"');
    expect(html).not.toContain('data-rd-protractor'); // la منقلة apparaît après le compas (étape 2)
    expect(html).not.toContain('data-rd-circle');
    expect(html).not.toContain('data-rd-lamps');
    expect(html).toContain('data-rd-steps');
    expect(html).toContain('data-deco="sticker"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <RotationDial level="beginner" {...LEVELS['rotation-dial'].beginner.numbers} />,
        advanced: () => <RotationDial level="advanced" {...LEVELS['rotation-dial'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-rotation-dial/g) ?? []).length).toBe(2);
    expect((html.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
    expect(html).not.toMatch(RAW);
  });
});

/** Toutes les images posées justement : la roue (chaque tâche sur le bon nœud) ou la feuille (chaque point à son image exacte). */
function played(level) {
  let lab = L.init(LEVELS['rotation-dial'][level].numbers);
  if (lab.scene === 'wheel') {
    for (const tk of lab.tasks) {
      const nd = L.nodes(lab).find((n) => L.judge(L.gondolaPoint(lab, tk.from), n, tk.alpha, tk.direction).ok);
      lab = L.placeWheel(L.goToTask(lab, lab.tasks.indexOf(tk)), nd);
    }
    return lab;
  }
  lab.missions.forEach((ms, i) => {
    lab = L.goToMission(lab, i);
    for (const nm of ms.order) lab = L.placePlane(lab, RT.rotateApprox(ms.pts[nm], { x: 0, y: 0 }, ms.alpha, ms.direction));
  });
  return lab;
}

describe('rotation-dial — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.rotationDial.${key}`, o);
  for (const [level, wheel] of [['beginner', true], ['advanced', false]]) {
    it(`${level} : chaque question de chaque étape a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = played(level);
      const options = [{ text: 'a', correct: true }, { text: 'b', why: 'w' }];
      const steps = L.stepsOf(lab);
      expect(steps.every((st) => st.reached)).toBe(true);
      steps.forEach((st, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, st.id).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), st.id).toBe(i === steps.length - 1);
        for (const qid of chain) {
          const q = QUESTIONS[qid]({ lab, step: st, options, formal: 'f', wheel }, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${st.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${st.id}.${qid}`).not.toContain('{{');
          expect(out, `${st.id}.${qid}`).not.toMatch(/\b(undefined|NaN)\b/);
          expect(q.hints, `${st.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${st.id}.${qid}`).toHaveLength(1);
            if (qid !== 'rule') for (const o of q.options.filter((x) => !x.correct)) expect(o.why, `${st.id}.${qid}`).toBeTruthy();
          } else expect(q.expected).toBeTruthy();
        }
      });
    });
  }

  it('les réponses attendues viennent des nombres de l\'élève', () => {
    const w = played('beginner');
    const ids = w.tasks.map((x) => x.id);
    expect(QUESTIONS.angle({ lab: w, step: { id: ids[0] }, wheel: true }, k).expected).toBe('60');
    expect(QUESTIONS.angle({ lab: w, step: { id: ids[2] }, wheel: true }, k).expected).toBe('120');
    expect(QUESTIONS.steps({ lab: w, step: { id: ids[2] } }, k).expected).toBe('2');
    expect(chainOf(w, 0)).toEqual(['angle', 'dist']);
    expect(chainOf(w, 1)).toEqual(['angle', 'twin']);
    expect(chainOf(w, 2)).toEqual(['steps', 'angle']);
    expect(chainOf(w, 3)).toEqual(['twin', 'rule']);
    const p = played('advanced');
    expect(QUESTIONS.angle({ lab: p, step: { id: 'point' }, wheel: false }, k).expected).toBe('70');
    expect(QUESTIONS.length({ lab: p, step: { id: 'segment' } }, k).expected).toBe('4');
    expect(QUESTIONS.radius({ lab: p, step: { id: 'circle' } }, k).expected).toBe('1,5');
  });

  it('les étapes s\'ouvrent dans l\'ordre ; « أعِد التجربة » ne remet que SON étape', () => {
    const lab = played('beginner');
    let part = L.init(LEVELS['rotation-dial'].beginner.numbers);
    expect(L.stepsOf(part).map((s) => s.reached)).toEqual([false, false, false, false]);
    const back = L.retryStep(lab, 't2');
    expect(back.t).toBe(1);
    expect(L.taskDone(back, 0)).toBe(true);
    expect(L.taskDone(back, 1)).toBe(false);
    expect(L.stepsOf(back).map((s) => s.reached)).toEqual([true, false, false, false]);
    const adv = L.retryStep(played('advanced'), 'segment');
    expect(L.missionDone(adv, 0)).toBe(true);
    expect(L.missionDone(adv, 1)).toBe(false);
    expect(adv.m).toBe(1);
  });
});

describe('rotation-dial — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('ni la progression ni le bouton d\'indice ; quatre étapes pour la roue, trois pour la feuille ; questions coupées : tout revient', () => {
    const b = renderToString(<RotationDial {...LEVELS['rotation-dial'].beginner.numbers} />);
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((b.match(/data-rd-step=/g) || []).length).toBe(4);
    const a = renderToString(<RotationDial {...LEVELS['rotation-dial'].advanced.numbers} />);
    expect((a.match(/data-rd-step=/g) || []).length).toBe(3);
    const off = renderToString(<RotationDial {...LEVELS['rotation-dial'].beginner.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
