import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import CoprimeExplorer, { CHAINS as COPRIME_CHAINS, QUESTIONS as COPRIME_Q } from './CoprimeExplorer';
import DifferenceAlgorithm, { CHAINS as DIFF_CHAINS, QUESTIONS as DIFF_Q } from './DifferenceAlgorithm';
import EuclidAlgorithm, { CHAINS as EUCLID_CHAINS, QUESTIONS as EUCLID_Q } from './EuclidAlgorithm';
import FractionReduction, { CHAINS as FRAC_CHAINS, QUESTIONS as FRAC_Q } from './FractionReduction';
import DivisorProperties, { CHAINS as PROPS_CHAINS, QUESTIONS as PROPS_Q } from './DivisorProperties';
import * as coprime from '../logic/coprime';
import * as alg from '../logic/algorithms';
import * as fraction from '../logic/fraction';
import * as props from '../logic/divisorProperties';
import { themeWords } from '../themeWords';

/**
 * Déploiement du prototype (docs/reports/LAB_PROTOTYPE_ROLLOUT.md, lot 2, leçons 4AM « الأعداد الطبيعية والناطقة ») : les cinq labos de la divisibilité
 * posent leurs questions PAR-DESSUS la scène (L8) — chaque question a un texte, DEUX indices, une seule bonne réponse (ou un `expected`), ni clé brute
 * ni `{{` ; le mode guidé ne rend ni la progression « جرّب › اكتشف › صِغ » ni « تلميح » ; `checkpoints={false}` les rend.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const tr = (key, o) => i18n.t(`lesson:${key}`, o);
const html = (C, p) => renderToString(<C {...p} />);

function checkQuestions(label, chains, questions, ctx, k) {
  for (const [chain, ids] of Object.entries(chains)) {
    for (const qid of ids) {
      const q = questions[qid](ctx, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}{q.answer}</div>);
      const where = `${label}.${chain}.${qid}`;
      expect(out, where).not.toMatch(RAW);
      expect(out, where).not.toContain('{{');
      expect(out.replace(/<[^>]+>/g, '').trim().length, where).toBeGreaterThan(5);
      expect(q.hints, where).toHaveLength(2);
      if (q.kind === 'choice') {
        expect(q.options.filter((o) => o.correct), where).toHaveLength(1);
        for (const o of q.options.filter((x) => !x.correct)) expect(o.why, `${where} why`).toBeTruthy();
      } else expect(q.expected, where).toBeTruthy();
    }
  }
}

describe('lot 2 — pgcd-differences', () => {
  it('chaque question : texte, deux indices, une bonne réponse, ni clé brute ni {{', () => {
    for (const [a, b] of [[252, 140], [91, 26], [45, 18]]) {
      let lab = alg.completeDifferences(alg.initDifferences({ a, b }));
      lab = { ...lab, pgcdPlaced: true };
      checkQuestions(`diff ${a},${b}`, DIFF_CHAINS, DIFF_Q, { a, b, lab }, (key, o) => tr(`manipulation.diff.${key}`, o));
      expect(DIFF_Q.count({ a, b, lab }, (key, o) => tr(`manipulation.diff.${key}`, o)).expected).toBe(String(lab.steps.length));
    }
  });
  it('mode guidé', () => {
    const g = html(DifferenceAlgorithm, { a: 252, b: 140 });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(tr('manipulation.hint.show'));
    expect(g).toContain('data-da-step');
    const free = html(DifferenceAlgorithm, { a: 252, b: 140, checkpoints: false });
    expect(free).toContain('data-manipulation-progress');
  });
});

describe('lot 2 — euclidean-algorithm', () => {
  it('chaque question : texte, deux indices, une bonne réponse, ni clé brute ni {{', () => {
    for (const [a, b] of [[765, 135], [91, 26], [252, 140]]) {
      const lab = { ...alg.completeEuclid(alg.initEuclid({ a, b })), pgcdPlaced: true };
      checkQuestions(`euclid ${a},${b}`, EUCLID_CHAINS, EUCLID_Q, { a, b, lab }, (key, o) => tr(`manipulation.euclid.${key}`, o));
    }
  });
  it('mode guidé', () => {
    const g = html(EuclidAlgorithm, { a: 765, b: 135 });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(tr('manipulation.hint.show'));
    expect(g).toContain('data-ea-step');
    expect(html(EuclidAlgorithm, { a: 765, b: 135, checkpoints: false })).toContain('data-manipulation-progress');
  });
});

describe('lot 2 — fraction-reduction', () => {
  it('chaque question : texte, deux indices, une bonne réponse, ni clé brute ni {{', () => {
    for (const [n, d, path] of [[84, 48, [4, 3]], [84, 48, [12]], [252, 140, [2, 2, 7]]]) {
      let lab = fraction.init({ n, d });
      for (const x of path) lab = fraction.reduceA(lab, x);
      lab = fraction.reduceB(fraction.claimIrreducible(lab), lab.gcd);
      expect(lab.pathB).not.toBeNull();
      checkQuestions(`reduce ${n}/${d}`, FRAC_CHAINS, FRAC_Q, { n, d, lab }, (key, o) => tr(`manipulation.reduce.${key}`, o));
    }
  });
  it('mode guidé', () => {
    const g = html(FractionReduction, { n: 84, d: 48 });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(tr('manipulation.hint.show'));
    expect(g).toContain('data-fr-step');
    expect(html(FractionReduction, { n: 84, d: 48, checkpoints: false })).toContain('data-manipulation-progress');
  });
});

describe('lot 2 — divisor-properties', () => {
  it('chaque question : texte, deux indices, une bonne réponse, ni clé brute ni {{', () => {
    for (const [n, a, b] of [[5, 35, 15], [7, 56, 21], [9, 900, 90]]) {
      const lab = props.TARGETS.reduce((acc, x) => props.build(acc, x), props.init({ n, a, b }));
      checkQuestions(`props ${n},${a},${b}`, PROPS_CHAINS, PROPS_Q, { n, a, b, lab }, (key, o) => tr(`manipulation.props.${key}`, o));
    }
  });
  it('mode guidé', () => {
    const g = html(DivisorProperties, { n: 5, a: 35, b: 15 });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(tr('manipulation.hint.show'));
    expect(g).toContain('data-dp-step');
    expect(html(DivisorProperties, { n: 5, a: 35, b: 15, checkpoints: false })).toContain('data-manipulation-progress');
  });
});

describe('lot 2 — coprime-explorer', () => {
  const kk = (key, o) => tr(`manipulation.coprime.${key}`, o);
  it('trousses : 17 et 18 (premiers entre eux) puis 27 et 36 (pas premiers entre eux)', () => {
    for (const [a, b] of [[17, 18], [27, 36]]) {
      let groups = coprime.initGroups({ a, b });
      for (let i = 0; i < Math.min(a, b) && !coprime.groupsInsightReady(groups); i += 1) groups = coprime.addGroupTo(groups);
      expect(coprime.groupsInsightReady(groups)).toBe(true);
      const lab = coprime.init({ a, b });
      checkQuestions(`coprime groups ${a},${b}`, { groups: COPRIME_CHAINS.groups }, COPRIME_Q, { a, b, lab, groups, words: themeWords(tr, 'school'), mode: 'groups' }, kk);
    }
  });
  it('listes : 22 et 35, 27 et 36', () => {
    for (const [a, b] of [[22, 35], [27, 36]]) {
      let lab = coprime.init({ a, b });
      const small = a <= b ? lab.da : lab.db;
      const side = a <= b ? 'a' : 'b';
      const todo = lab.g === 1 ? small : small.filter((d) => lab.common.includes(d));
      for (const d of todo) lab = coprime.share(lab, coprime.chipId(side, d));
      lab = coprime.check(lab);
      expect(coprime.listsConclusive(lab)).toBe(true);
      checkQuestions(`coprime lists ${a},${b}`, { lists: COPRIME_CHAINS.lists }, COPRIME_Q, { a, b, lab, groups: coprime.initGroups({ a, b }), words: themeWords(tr, 'school'), mode: 'lists' }, kk);
    }
  });
  it('mode guidé', () => {
    const g = html(CoprimeExplorer, { a: 22, b: 35 });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(tr('manipulation.hint.show'));
    expect(g).toContain('data-cp-step');
    expect(html(CoprimeExplorer, { a: 22, b: 35, checkpoints: false })).toContain('data-manipulation-progress');
  });
});
