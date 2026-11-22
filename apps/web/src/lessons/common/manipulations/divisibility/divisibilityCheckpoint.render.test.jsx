import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import TeamBuilder, { CHAINS as TB_CHAINS, QUESTIONS as TB_Q } from './TeamBuilder';
import DivisorExplorerBooks, { CHAINS as BK_CHAINS, QUESTIONS as BK_Q } from './DivisorExplorerBooks';
import CommonDivisors, { CHAINS as CD_CHAINS, QUESTIONS as CD_Q } from './CommonDivisors';
import FactorPairs, { CHAINS as FP_CHAINS, QUESTIONS as FP_Q } from './FactorPairs';
import * as FL from '../logic/factorPairs';
import { wrongEqualities } from './divisionChecks';
import { themeWords } from '../themeWords';
import * as CL from '../logic/commonDivisors';
import * as S from '../logic/bookshelf';

/**
 * Questions pendant le labo (LabCheckpoint, lot 2) sur les labos de la division : chaque question a un texte, DEUX indices, UNE seule
 * bonne réponse, ni clé brute ni `{{` ; les nombres viennent des essais de l'élève ; le mode guidé retire la progression et le bouton d'indice.
 */
const RAW = /manipulation\.[a-zA-Z]|\{\{/;
const html = (C, props) => renderToString(<C {...props} />);
const flat = (q) => renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
function check(q, label) {
  const out = flat(q);
  expect(out, label).not.toMatch(RAW);
  expect(q.hints, label).toHaveLength(2);
  if (q.kind === 'choice') {
    expect(q.options.filter((o) => o.correct), label).toHaveLength(1);
    q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, label).toBeTruthy());
  } else expect(q.expected, label).toBeTruthy();
}
const kt = (key, o) => i18n.t(`lesson:manipulation.teamBuilder.${key}`, o);
const kb = (key, o) => i18n.t(`lesson:manipulation.bookshelf.${key}`, o);
const books = (n) => kb('books', { count: n });

describe('team-builder — questions pendant le labo', () => {
  const tried = { '15:3': true, '16:3': false };
  it.each([['first', ['15:3', '16:3']], ['contrast', ['15:3', '16:3']], ['first', ['16:3', '15:3']], ['first', ['12:4', '20:6']]])('chaîne %s sur %j', (chain, keys) => {
    const t2 = Object.fromEntries(keys.map((x) => [x, x === '16:3' || x === '20:6' ? false : true]));
    for (const id of TB_CHAINS[chain]) check(TB_Q[id]({ tried: t2, keys }, kt), `${chain}.${id}`);
  });
  it('les nombres viennent des essais ; la règle clôt la dernière suite', () => {
    const ctx = { tried, keys: ['16:3', '15:3'] };
    expect(TB_Q.perTeam(ctx, kt).expected).toBe('5');
    expect(TB_Q.left(ctx, kt).expected).toBe('1');
    expect(TB_Q.fix({ tried, keys: ['15:3', '16:3'] }, kt).expected).toBe('2');
    expect(TB_CHAINS.contrast.at(-1)).toBe('rule');
  });
  it('les fausses égalités ne valent jamais le total', () => {
    for (let n = 2; n <= 40; n += 1) for (let g = 2; g <= 7; g += 1) {
      const q = Math.floor(n / g); const r = n % g;
      const w = wrongEqualities({ n, g, q, r });
      expect(w).toHaveLength(2);
      w.forEach((x) => expect(x.v).not.toBe(n));
    }
  });
  it('mode guidé : ni progression ni indice ; checkpoints={false} : ils reviennent', () => {
    const g = html(TeamBuilder, {});
    expect(g).toContain('data-lab-stepper');
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});

describe('divisor-explorer-books — questions pendant le labo', () => {
  const total = 420;
  const range = S.shelfRange(total, { min: 10, max: 60 });
  const tried = S.commit(S.commit(S.commit({}, total, 26), total, 28), total, 30);
  const ctx = { total, tried, order: [26, 28, 30], range, marks: [26, 28] };
  it('remainder : chaque question est complète', () => {
    for (const chain of ['first', 'contrast']) for (const id of BK_CHAINS[chain]) check(BK_Q[id](ctx, kb, books), `${chain}.${id}`);
  });
  it('symmetry : chaque question est complète', () => {
    const t2 = S.commit(S.commit({}, 143, 11), 143, 13);
    const c2 = { total: 143, tried: t2, order: [11, 13], pair: [11, 13], range: S.shelfRange(143, { min: 5, max: 30 }), marks: [11, 13] };
    for (const id of [...BK_CHAINS.first, ...BK_CHAINS.symmetry]) check(BK_Q[id](c2, kb, books), `sym.${id}`);
    expect(BK_Q.symShelves(c2, kb, books).expected).toBe('11');
  });
  it('les nombres viennent des essais', () => {
    expect(BK_Q.shelves(ctx, kb, books).expected).toBe('16');
    expect(BK_Q.floor(ctx, kb, books).expected).toBe('4');
    expect(BK_Q.missing(ctx, kb, books).expected).toBe('22');
    expect(BK_CHAINS.contrast.at(-1)).toBe('rule');
  });
  it('mode guidé : ni progression ni indice', () => {
    const g = html(DivisorExplorerBooks, { total: 420, min: 10, max: 60 });
    expect(g).toContain('data-lab-stepper');
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});

describe('common-divisors — questions pendant le labo', () => {
  const kc = (key, o) => i18n.t(`lesson:manipulation.common.${key}`, o);
  const t = (key, o) => i18n.t(`lesson:${key}`, o);
  const pairs = [[12, 18, 'football', [1, 2, 3, 4, 6, 9]], [90, 54, 'garden', [1, 9, 18, 20]], [8, 12, 'school', [1, 2, 4, 5]]];
  it.each(pairs)('%i et %i : chaque question est complète et vient des essais', (a, b, theme, ks) => {
    const bq = ks.reduce((st, k) => CL.choose(st, k), CL.initBouquets({ a, b }));
    expect(CL.greatestGroupFound(bq)).toBe(true);
    const lists = { ...CL.initLists({ a, b }) };
    lists.placed = lists.common; lists.pgcd = lists.g;
    const ctx = { a, b, bouquets: bq, lists, words: themeWords(t, theme) };
    for (const id of [...CD_CHAINS.groupsOnly, ...CD_CHAINS.lists]) check(CD_Q[id](ctx, kc), `${a}.${id}`);
    expect(CD_Q.greatest(ctx, kc).expected).toBe(String(lists.g));
    expect(CD_Q.listCommon(ctx, kc).expected).toBe(String(lists.common.length));
    expect(CD_CHAINS.groupsOnly.at(-1)).toBe('rule');
    expect(CD_CHAINS.lists.at(-1)).toBe('rule');
  });
  it('mode guidé : ni progression ni indice', () => {
    for (const props of [{ a: 12, b: 18 }, { a: 28, b: 42, startWith: 'lists' }]) {
      const g = html(CommonDivisors, props);
      expect(g).toContain('data-lab-stepper');
      expect(g).not.toContain('data-manipulation-progress');
      expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
  });
});

describe('factor-pairs — questions pendant le labo', () => {
  const kf = (key, o) => i18n.t(`lesson:manipulation.factorPairs.${key}`, o);
  const cases = [[24, [1, 2, 3, 4, 6]], [60, [1, 2, 3, 4, 5, 6, 7, 10]], [48, [1, 2, 3, 4, 5, 6, 8]], [105, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15]]];
  it.each(cases)('n = %i : chaque question est complète et vient des essais', (n, ds) => {
    const lab = ds.reduce((st, d) => FL.test(st, d), FL.init({ n }));
    expect(FL.discoveryReady(lab)).toBe(true);
    for (const d of [1, 3, 4, 7]) {
      const l1 = FL.test(FL.init({ n }), d);
      const first = l1.tested[0];
      for (const id of FP_CHAINS.first) check(FP_Q[id]({ n, lab: l1, first }, kf), `${n}.first.${id}.d${d}`);
      expect(FP_Q.rest({ n, lab: l1, first }, kf).expected).toBe(String(n % d));
    }
    for (const id of FP_CHAINS.rule) check(FP_Q[id]({ n, lab, first: lab.tested[0] }, kf), `${n}.rule.${id}`);
    expect(FP_Q.pairsCount({ n, lab }, kf).expected).toBe(String(lab.pairs.length));
    expect(FP_CHAINS.rule.at(-1)).toBe('rule');
  });
  it('mode guidé : ni progression ni indice', () => {
    const g = html(FactorPairs, { n: 24 });
    expect(g).toContain('data-lab-stepper');
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
