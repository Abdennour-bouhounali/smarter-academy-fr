import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import PolygonForge, { chainOf, QUESTIONS } from './PolygonForge';
import i18n from '../../../../i18n';
import * as L from '../logic/polygonForge';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * polygon-forge se rend à ses DEUX niveaux (l'alvéole de ruche, l'étoile du drapeau), seul et dans un workspace, à plat ou
 * par `numbers`, sans clé i18n brute, sans interpolation oubliée, et SANS la réponse sur le premier écran : ni 60° (la
 * cellule part de 50°), ni 72°, ni 8,51 cm, ni 16,18 cm (l'étoile part de 60°, sur l'étape des sommets).
 */
const RAW = /manipulation\.[a-zA-Z]/;
const clean = (html) => {
  expect(html).not.toMatch(RAW);
  expect(html).not.toContain('{{');
  expect(html).not.toContain('undefined');
  expect(html).not.toContain('NaN');
};

describe('polygon-forge — rendu', () => {
  it('cell (beginner): the hive, A alone on the circle, α = 50°, the dial and « دوّر » — no 60° yet', () => {
    const html = renderToString(<PolygonForge {...LEVELS['polygon-forge'].beginner.numbers} />);
    expect(html).toContain('data-polygon-forge');
    expect(html).toContain('data-mode="cell"');
    expect(html).toContain('data-world="honeycomb"');
    expect(html).toContain('data-pf-glance');
    expect(html).toContain('data-pf-handle="50"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-pf-turn');
    expect(html).toContain('data-pf-verdict="start"');
    expect(html).toContain('data-deco="honeycomb"');
    expect((html.match(/data-pf-vertex="/g) ?? []).length).toBe(1);
    expect(html).not.toContain('data-pf-readings');
    expect(html).not.toContain('60°');
    // le compteur « 0 × 50° = 0° » est UNE île LTR isolée, l'étiquette arabe hors de l'île
    expect(html).toMatch(/<span dir="ltr"[^>]*unicode-bidi:isolate[^>]*data-pf-counter-formula[^>]*>0 × 50° = 0°<\/span>/);
    clean(html);
  });

  it('star (advanced, the تحدّ): the tifo, three stage tabs (only the first open), α = 60° — 72°, 8,51 and 16,18 nowhere', () => {
    const html = renderToString(<PolygonForge numbers={LEVELS['polygon-forge'].advanced.numbers} />);
    expect(html).toContain('data-mode="star"');
    expect(html).toContain('data-world="flag-star"');
    expect(html).toContain('data-stage="forge"');
    expect((html.match(/data-pf-stage-tab="/g) ?? []).length).toBe(3);
    expect(html).toContain('data-pf-handle="60"');
    expect(html).toContain('data-deco="flag-star"');
    expect(html).not.toContain('72°');
    expect(html).not.toContain('8,51');
    expect(html).not.toContain('16,18');
    expect(html).not.toContain('data-pf-next');
    clean(html);
  });

  it('inside a workspace: both levels mounted, the تحدّ by default', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <PolygonForge level="beginner" {...LEVELS['polygon-forge'].beginner.numbers} />,
        advanced: () => <PolygonForge level="advanced" {...LEVELS['polygon-forge'].advanced.numbers} />,
      }} />,
    );
    expect(html).toContain('data-mode="cell"');
    expect(html).toContain('data-mode="star"');
    clean(html);
  });
});

/** Les tours justes : la cellule fermée puis un tour raté ; l'étoile entièrement tracée. */
function played(level) {
  let lab = L.init(LEVELS['polygon-forge'][level].numbers);
  if (lab.mode === 'cell') return L.runAlpha(L.runAlpha(lab, 50), 60);
  lab = L.runAlpha(lab, 72);
  lab = L.openRadius(lab);
  for (let h = 500; h <= 1200 && !lab.radiusOk; h += 1) lab = L.commitRadius(lab, h);
  lab = L.openDraw(lab);
  for (const j of [2, 4, 1, 3, 0]) lab = L.tapTip(lab, j);
  return lab;
}

describe('polygon-forge — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.polygonForge.${key}`, o);
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question de chaque étape a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = played(level);
      const options = [{ text: 'a', correct: true }, { text: 'b', why: 'w' }];
      const steps = L.stepsOf(lab);
      expect(steps.every((st) => st.reached)).toBe(true);
      steps.forEach((st, i) => {
        const chain = chainOf(lab.mode, st.id);
        expect(chain.length, st.id).toBeGreaterThanOrEqual(2);
        expect(chain.includes('rule'), st.id).toBe(i === steps.length - 1);
        for (const qid of chain) {
          const q = QUESTIONS[qid]({ lab, options, formal: 'f' }, k);
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

  it('les réponses attendues viennent des nombres de l\'élève ; les étapes s\'ouvrent dans l\'ordre ; « أعِد التجربة » ne remet que SON étape', () => {
    const c = played('beginner');
    expect(QUESTIONS.count({ lab: c }, k).expected).toBe('12');
    expect(QUESTIONS.open({ lab: c }, k).expected).toBe('7.2');
    const s = played('advanced');
    expect(QUESTIONS.half({ lab: s }, k).expected).toBe('36');
    expect(chainOf('cell', 'contrast')).toEqual(['open', 'rule']);
    expect(chainOf('star', 'draw')).toEqual(['skip', 'rule']);
    expect(L.stepsOf(L.init(LEVELS['polygon-forge'].advanced.numbers)).map((x) => x.reached)).toEqual([false, false, false]);
    const back = L.retryStep(s, 'draw');
    expect(L.starDone(back)).toBe(false);
    expect(L.stepsOf(back).map((x) => x.reached)).toEqual([true, true, false]);
    const cell = L.retryStep(c, 'contrast');
    expect(L.stepsOf(cell).map((x) => x.reached)).toEqual([true, false]);
    expect(L.stepsOf(L.retryStep(c, 'forge')).map((x) => x.reached)).toEqual([false, false]);
  });
});

describe('polygon-forge — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('ni la progression ni le bouton d\'indice ; deux étapes (ruche), trois (étoile) ; questions coupées : tout revient', () => {
    const b = renderToString(<PolygonForge {...LEVELS['polygon-forge'].beginner.numbers} />);
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((b.match(/data-pf-step=/g) || []).length).toBe(2);
    const a = renderToString(<PolygonForge numbers={LEVELS['polygon-forge'].advanced.numbers} />);
    expect((a.match(/data-pf-step=/g) || []).length).toBe(3);
    const off = renderToString(<PolygonForge {...LEVELS['polygon-forge'].beginner.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
