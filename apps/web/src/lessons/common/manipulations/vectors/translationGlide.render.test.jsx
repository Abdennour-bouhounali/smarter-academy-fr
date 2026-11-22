import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import * as L from '../logic/translationGlide';
import TranslationGlide from './TranslationGlide';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * translation-glide se rend aux deux niveaux de levels.js (le ciel du spectacle ; la figure du نشاط 1), seul et dans
 * le workspace, sans clé i18n brute, sans interpolation oubliée et sans texte latin hors des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const LATIN_WORD = />[^<]*\b(?:Enter|drone|vector|image|leader)\b[^<]*</i;

describe('translation-glide — rendu', () => {
  it('beginner (show): the sky, three drones, the leader and two drones to grab, the beacon, the lamps, the decor', () => {
    const html = renderToString(<TranslationGlide {...LEVELS['translation-glide'].beginner.numbers} theme="drone-show" />);
    expect(html).toContain('data-translation-glide');
    expect(html).toContain('data-scene="show"');
    expect(html).toContain('data-tg-glance');
    expect(html).toContain('data-tg-grab="leader"');
    expect(html).toContain('data-tg-grab="drone:B"');
    expect(html).toContain('data-tg-grab="drone:C"');
    expect((html.match(/data-tg-drone=/g) ?? []).length).toBe(3);
    expect(html).toContain('data-tg-beacon');
    expect(html).toContain('data-tg-lamp="direction"');
    expect(html).toContain('data-deco="sky"');
    expect(html).toContain('data-deco="remote"');
    expect(html).not.toContain('data-tg-tabs');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('advanced (نشاط 1): the textbook figure, four tableaux, the given arrow A ↦ G, no lamps', () => {
    const html = renderToString(<TranslationGlide {...LEVELS['translation-glide'].advanced.numbers} theme="drone-show" />);
    expect(html).toContain('data-scene="act1"');
    expect(html).toContain('data-tableau="G"');
    expect((html.match(/data-tg-tab="/g) ?? []).length).toBe(4);
    expect((html.match(/data-tg-drone=/g) ?? []).length).toBe(4);
    expect(html).toContain('data-tg-arrow="ref"');
    expect(html).toContain('data-tg-carrier');
    expect(html).toContain('data-tg-grab="drone:B"');
    expect(html).toContain('data-tg-grab="drone:C"');
    expect(html).not.toContain('data-tg-grab="leader"');
    expect(html).not.toContain('data-tg-lamps');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <TranslationGlide level="beginner" {...LEVELS['translation-glide'].beginner.numbers} />,
        advanced: () => <TranslationGlide level="advanced" {...LEVELS['translation-glide'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-translation-glide/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.translationGlide.${key}`, o);
const PRE = /manipulation\.[a-zA-Z]/;
const img = (s, f) => [s.drones[f][0] + L.tableau(s).u[0], s.drones[f][1] + L.tableau(s).u[1]];
const CTX = { prompt: 'dPromptShow', options: [{ text: 'a', correct: true }, { text: 'b', why: 'w' }], formal: <span>f</span> };
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(PRE);
  expect(out, qid).not.toContain('{{');
  expect(out, qid).not.toContain('undefined');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('translation-glide — questions pendant le labo (LabCheckpoint)', () => {
  it('show : formation (leaderShift · follower · same) puis drone égaré (rogueWhy · rule), nombres de la tâche', async () => {
    const { chainOf, QUESTIONS } = await import('./TranslationGlide');
    let s = L.init(LEVELS['translation-glide'].beginner.numbers);
    s = L.setVector(s, [4, 2]);       // A(1,1) -> A'(4,2) : u = (3, 1)
    for (const [f] of L.tableau(s, 0).place) s = L.place(s, f, img(s, f));
    expect(L.imagesDone(s, 0)).toBe(true);
    expect(chainOf(s, 'show0')).toEqual(['leaderShift', 'follower', 'same']);
    for (const qid of chainOf(s, 'show0')) checkQ(qid, QUESTIONS[qid](s, k, CTX));
    expect(QUESTIONS.leaderShift(s, k).expected).toBe('3');
    const ra = L.rogueArrow(s);
    s = L.fixRogue(s, [ra.at[0] + L.tableau(s, 0).u[0], ra.at[1] + L.tableau(s, 0).u[1]]);
    expect(L.tableauDone(s, 0)).toBe(true);
    expect(chainOf(s, 'show1')).toEqual(['rogueWhy', 'rule']);
    for (const qid of chainOf(s, 'show1')) checkQ(qid, QUESTIONS[qid](s, k, CTX));
    const r = L.restartStep(s, 1);
    expect(L.tableauDone(r, 0)).toBe(false);
    expect(L.imagesDone(r, 0)).toBe(true);
    expect(L.imagesDone(L.restartStep(s, 0), 0)).toBe(false);
  });

  it('act1 : chaque tableau pose shift puis all3 / vsFirst ; la règle seulement quand tout est fait', async () => {
    const { chainOf, QUESTIONS } = await import('./TranslationGlide');
    let s = L.init(LEVELS['translation-glide'].advanced.numbers);
    for (let t = 0; t < 4; t += 1) {
      s = L.goTo(s, t);
      for (const [f] of L.tableau(s).place) s = L.place(s, f, img(s, f));
      const ids = chainOf(s, `t${t}`);
      expect(ids).toEqual(t === 0 ? ['shift', 'all3'] : t < 3 ? ['shift', 'vsFirst'] : ['shift', 'vsFirst', 'rule']);
      for (const qid of ids) checkQ(`${t}.${qid}`, QUESTIONS[qid](s, k, { ...CTX, prompt: 'dPromptAct1' }));
    }
    s = L.goTo(s, 1);
    expect(QUESTIONS.vsFirst(s, k).options.filter((o) => o.correct)).toHaveLength(1);
    expect(QUESTIONS.shift(L.goTo(s, 0), k).expected).toBe('6');
  });
});

describe('translation-glide — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; coupées : ils reviennent', () => {
    const a = renderToString(<TranslationGlide {...LEVELS['translation-glide'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-tg-step="0"');
    const b = renderToString(<TranslationGlide {...LEVELS['translation-glide'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
