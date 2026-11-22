import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import LineCrossing, { chainOf, QUESTIONS } from './LineCrossing';
import * as L from '../logic/lineCrossing';

/**
 * line-crossing se rend pour chaque monde et chaque point d'entrée, avec les props que la leçon 4
 * (tafsir-bayani-jumla) passe — sans clé i18n brute, avec le bloc « d'un seul regard » mesuré par l'e2e.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const ACT5 = { system: 'x+y=43|100x+200y=5000', cases: 'true', theme: 'coins' };
const BEG = { system: '2x-y=1|x+y=5', theme: 'laser' };
const CASES = { system: 'x+y=3|2x-y=0', startWith: 'cases', theme: 'laser', levels: false };

describe('line-crossing — rendu', () => {
  it('نشاط 5 (coins) : l’équation (1) à écrire, quatre cartes, le monde du manuel, le bloc mesuré', () => {
    const html = renderToString(<LineCrossing {...ACT5} />);
    expect(html).toContain('data-line-crossing');
    expect(html).toContain('data-stage="build"');
    expect(html).toContain('data-theme="coins"');
    expect(html).toContain('data-lc-glance');
    expect(html).toContain('data-lc-plane');
    expect((html.match(/data-lc-card="0:/g) ?? []).length).toBe(4);
    expect(html).toContain('data-lc-build="1"');
    expect(html).not.toContain('data-lc-eq=');
    expect(html).toContain('data-deco="coins"');
    expect(html).toContain('عدد قطع 100DA');
    expect(html).not.toContain('data-lc-line=');
    expect(html).not.toContain('data-lc-pin');
    expect(html).not.toMatch(RAW);
  });

  it('مبتدئ (laser) : le monde du spectacle, pas encore de point', () => {
    const html = renderToString(<LineCrossing {...BEG} />);
    expect(html).toContain('data-theme="laser"');
    expect(html).toContain('data-deco="laser"');
    expect(html).not.toMatch(RAW);
  });

  it('startWith="cases" (معارف) : les deux droites tracées, P, les deux lampes, les pistes p et m', () => {
    const html = renderToString(<LineCrossing {...CASES} />);
    expect(html).toContain('data-stage="cases"');
    expect(html).toContain('data-lc-line="1"');
    expect(html).toContain('data-lc-line="2"');
    expect(html).toContain('data-lc-eq="1"');
    expect(html).toContain('data-lc-eq="2"');
    expect(html).toContain('data-lc-pin');
    expect(html).toContain('data-lc-lamp="1"');
    expect(html).toContain('data-lc-lamp="2"');
    expect(html).toContain('data-lc-strip="p"');
    expect(html).toContain('data-lc-strip="m"');
    expect(html).toContain('data-lc-rel="unique"');
    expect(html).not.toContain('data-lc-back');
    expect(html).not.toMatch(RAW);
  });

  it('un contenu invalide est une erreur', () => {
    expect(() => renderToString(<LineCrossing system="x=3|x+y=2" />)).toThrow();
  });
});

describe('line-crossing — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.lineCrossing.${key}`, o);
  const check = (lab, step) => {
    for (const qid of chainOf(lab, step)) {
      const q = QUESTIONS[qid](lab, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${step}.${qid}`).not.toMatch(RAW);
      expect(out, `${step}.${qid}`).not.toContain('{{');
      expect(q.hints, `${step}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${step}.${qid}`).toHaveLength(1);
      else expect(q.expected).toBeTruthy();
    }
  };
  const build = (lab) => { for (let i = 0; i < 2; i += 1) lab = L.choose(lab, i, lab.cands[i].findIndex((c) => c.ok)); return lab; };
  it('نشاط 5 : tracer · promener P · les trois cas, avec les nombres de l’élève', () => {
    let lab = L.init({ system: 'x+y=43|100x+200y=5000', cases: 'true' });
    expect(L.stepsOf(lab)).toEqual(['build', 'probe', 'cases']);
    lab = build(lab);
    expect(L.stepReached(lab, 'build')).toBe(true);
    check(lab, 'build');
    lab = L.place(L.place(lab, 0, 43), 36, 7);
    expect(chainOf(lab, 'probe')).toEqual(['oneLamp', 'pair', 'check']);
    check(lab, 'probe');
    expect(QUESTIONS.check(lab, k).expected).toBe('3600');
    lab = L.openCases(lab);
    lab = L.hold(L.hold(lab, -1, 10), -1, 43);
    expect(L.stepReached(lab, 'cases')).toBe(true);
    expect(chainOf(lab, 'cases')).toEqual(['para', 'same', 'sameSlope', 'rule']);
    check(lab, 'cases');
  });
  it('مبتدئ : la dernière étape (probe) finit par la règle ; startWith="cases" : une seule étape', () => {
    let lab = build(L.init({ system: '2x-y=1|x+y=5' }));
    lab = L.place(L.place(lab, 0, 5), 2, 3);
    expect(chainOf(lab, 'probe').at(-1)).toBe('rule');
    check(lab, 'probe');
    const c = L.init({ system: 'x+y=3|2x-y=0', startWith: 'cases' });
    expect(L.stepsOf(c)).toEqual(['cases']);
  });
  it('mode guidé : ni la progression ni le bouton d’indice', () => {
    const out = renderToString(<LineCrossing {...BEG} />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
