import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import ParallelLevel from './ParallelLevel';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import i18n from '../../../../i18n';
import * as L from '../logic/parallelLevel';

/**
 * parallel-level se rend aux deux niveaux de levels.js (l'échelle double ; le tréteau en X de نشاط 2), seul et
 * dans le workspace, sans clé i18n brute, sans interpolation oubliée et sans texte latin hors des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('parallel-level — rendu', () => {
  it('beginner (ladder): the two handles, the arrows, the bubble, the ratios line, the decor', () => {
    const html = renderToString(<ParallelLevel {...LEVELS['parallel-level'].beginner.numbers} theme="mural" />);
    expect(html).toContain('data-parallel-level');
    expect(html).toContain('data-mode="ladder"');
    expect(html).toContain('data-pl-glance');
    expect(html).toContain('data-pl-handle="B"');
    expect(html).toContain('data-pl-handle="C"');
    expect(html).toContain('role="slider"');
    expect(html).toContain('data-pl-up="C"');
    expect(html).toContain('data-pl-bubble');
    expect(html).toContain('data-parallel="false"');
    expect(html).toContain('data-bp="5"');
    expect(html).toContain('data-cp="8"');
    expect(html).toContain('data-deco="spray"');
    expect(html).not.toContain('data-pl-figures');
    expect((html.match(/data-notch=/g) ?? []).length).toBe(5 + 8);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 2): the X-trestle graduated on both sides of A, the three figure chips, the teacher\'s 1/3', () => {
    const html = renderToString(<ParallelLevel {...LEVELS['parallel-level'].advanced.numbers} theme="mural" />);
    expect(html).toContain('data-mode="crossing"');
    expect(html).toContain('data-pl-figures="0"');
    expect((html.match(/data-pl-figure="/g) ?? []).length).toBe(3);
    // (d) : 8 sous A + 6 au-delà ; (d′) : 11 + 8
    expect((html.match(/data-notch=/g) ?? []).length).toBe(14 + 19);
    expect(html).toContain('data-notch="-6"');
    expect(html).toContain('data-pl-side="same"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ParallelLevel level="beginner" AB={6} AC={9} mode="ladder" />,
        advanced: () => <ParallelLevel AB={9} AC={12} ratio="1/3" mode="crossing" />,
      }} />,
    );
    expect((html.match(/data-parallel-level/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.parallelLevel.${key}`, o);
const put = (s, bp, cp) => L.commit(L.commit(s, 'B', L.slotOf(bp)), 'C', L.slotOf(cp));

describe('parallel-level — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque suite, aux deux niveaux : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./ParallelLevel');
    const { beginner, advanced } = LEVELS['parallel-level'];
    // ladder : 2/6 = 3/9 et 4/6 ≠ 3/9 (la planche penchée), puis 4/6 = 6/9
    let a = L.init({ ...beginner.numbers });
    a = put(a, 2, 3); a = put(a, 5, 5); a = put(a, 4, 6);
    // crossing : 3 et 4 (figure 2) ; −3 et −4 (figure 1) ; 3 et −4 (figure 3)
    let c = L.init({ ...advanced.numbers });
    c = put(c, 3, 4); c = put(c, -3, -4); c = put(c, 3, -4);
    expect(L.stageOneReached(a) && L.stageTwoReached(a)).toBe(true);
    expect(L.stageOneReached(c) && L.stageTwoReached(c)).toBe(true);
    for (const lab of [a, c]) {
      for (const step of ['one', 'two']) {
        const chain = chainOf(step, lab.mode);
        expect(chain.length).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, step, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${lab.mode}.${qid}`).not.toMatch(RAW);
          expect(out, `${lab.mode}.${qid}`).not.toContain('{{');
          expect(q.hints, `${lab.mode}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${lab.mode}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${lab.mode}.${qid} why`).toBe(true);
          } else expect(q.expected, `${lab.mode}.${qid}`).toMatch(/^\d+$/);
        }
      }
    }
    expect(QUESTIONS.crB(c, 'one', k).expected).toBe('3');
    expect(QUESTIONS.crC(c, 'one', k).expected).toBe('4');
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; la même étape repart', () => {
    const { beginner, advanced } = LEVELS['parallel-level'];
    const html = renderToString(<ParallelLevel {...beginner.numbers} level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let a = put(put(L.init(beginner.numbers), 2, 3), 5, 5);
    a = put(a, 4, 6);
    expect(L.stageTwoReached(a)).toBe(true);
    const b = L.retryStage(a, 'two');
    expect(L.stageOneReached(b)).toBe(true);
    expect(L.stageTwoReached(b)).toBe(false);
    expect(L.retryStage(a, 'one').trials).toHaveLength(0);
    let c = put(put(put(L.init(advanced.numbers), 3, 4), -3, -4), 3, -4);
    expect(L.stageTwoReached(c)).toBe(true);
    c = L.retryStage(c, 'two');
    expect(L.stageOneReached(c) && !L.stageTwoReached(c)).toBe(true);
  });
});
