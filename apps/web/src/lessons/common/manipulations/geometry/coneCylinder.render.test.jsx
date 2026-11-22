import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import ConeCylinder from './ConeCylinder';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import i18n from '../../../../i18n';
import * as L from '../logic/coneCylinder';

/**
 * cone-cylinder se rend aux deux niveaux de levels.js (cornet 12 / 4 ; la وضعية 18 / 6), seul et dans un
 * workspace, sans clé i18n brute ; l'écran de départ ne montre ni r = 4,5 ni 91,125π.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('cone-cylinder — rendu', () => {
  it('beginner: the cone, the cylinder inside (a gap), both handles, the volume line', () => {
    const html = renderToString(<ConeCylinder {...LEVELS['cone-cylinder'].beginner.numbers} />);
    expect(html).toContain('data-cone-cylinder');
    expect(html).toContain('data-cc-glance');
    expect(html).toContain('data-n="20"');
    expect(html).toContain('data-state="gap"');
    expect(html).toContain('data-cc-h-handle="10"');
    expect(html).toContain('data-cc-r-handle="3"');
    expect(html).toContain('data-cc-volume');
    expect(html).toContain('data-deco="cornet"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (وضعية): 24 graduations, starts at h = 9, r = 1, no answer shown', () => {
    const html = renderToString(<ConeCylinder {...LEVELS['cone-cylinder'].advanced.numbers} />);
    expect(html).toContain('data-n="24"');
    expect(html).toContain('data-cc-h-value="9"');
    expect(html).toContain('data-cc-r-value="1"');
    expect(html).not.toContain('91,125');
    expect(html).not.toContain('4{,}5');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ConeCylinder level="beginner" {...LEVELS['cone-cylinder'].beginner.numbers} />,
        advanced: () => <ConeCylinder {...LEVELS['cone-cylinder'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-cone-cylinder/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.coneCylinder.${key}`, o);

describe('cone-cylinder — questions pendant le labo (LabCheckpoint)', () => {
  const nums = LEVELS['cone-cylinder'];
  const run = async (lab, step) => {
    const { chainOf, QUESTIONS } = await import('./ConeCylinder');
    expect(L.stepReached(lab, step), step).toBe(true);
    const chain = chainOf(step);
    expect(chain.length).toBeGreaterThanOrEqual(2);
    for (const qid of chain) {
      const q = QUESTIONS[qid](lab, step, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${step}.${qid}`).not.toMatch(RAW);
      expect(out, `${step}.${qid}`).not.toContain('{{');
      expect(q.hints, `${step}.${qid}`).toHaveLength(2);
      expect(q.options.filter((o) => o.correct), `${step}.${qid}`).toHaveLength(1);
      expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${step}.${qid} why`).toBe(true);
    }
  };

  it('aux deux niveaux : les deux étapes, toutes les questions (avec un jeu, puis avec un refus seul)', async () => {
    for (const lv of [nums.beginner, nums.advanced]) {
      let s = L.init(lv.numbers);
      // un cylindre inscrit : r au cran où le bord touche la génératrice, pour le h de départ
      s = L.setR(s, Math.round(L.touchIndex(s)));
      expect(s.trials.at(-1).inscribed).toBe(true);
      await run(s, 'first');
      expect(L.stepReached(s, 'second')).toBe(false);
      // un jeu (h change, r reste), puis un 2e inscrit de longueur différente, et un refus
      const before = s.hIdx;
      s = L.setH(s, before - 2);
      s = L.setR(s, Math.round(L.touchIndex(s)));
      s = L.setR(s, s.rIdx + 3);               // perce → refusé
      expect(s.refusals).toBeGreaterThan(0);
      await run(s, 'second');
      // sans cylindre « à jeu » (cas d’école) : la question du refus
      const noGap = Object.freeze({ ...s, trials: Object.freeze(s.trials.filter((t) => t.inscribed)) });
      const { QUESTIONS } = await import('./ConeCylinder');
      const q = QUESTIONS.contrast(noGap, 'second', k);
      expect(renderToString(<div>{q.prompt}{q.explain}</div>)).not.toContain('{{');
    }
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; la même étape repart', () => {
    const html = renderToString(<ConeCylinder {...nums.beginner.numbers} level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let s = L.init(nums.advanced.numbers);
    s = L.setR(s, Math.round(L.touchIndex(s)));
    s = L.setH(s, s.hIdx - 2); s = L.setR(s, Math.round(L.touchIndex(s)));
    expect(L.stepReached(s, 'second')).toBe(true);
    const r = L.retryStage(s, 'second');
    expect(L.stepReached(r, 'first') && !L.stepReached(r, 'second')).toBe(true);
    expect(L.retryStage(s, 'first').trials).toHaveLength(0);
  });
});
