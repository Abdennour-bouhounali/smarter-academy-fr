import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import PercentTag from './PercentTag';
import ManipulationWorkspace from '../ManipulationWorkspace';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './PercentTag.jsx?raw';

/**
 * percent-tag se rend pour ses deux mondes (la vitrine de نشاط 5, le réservoir des طرائق), seul
 * et dans un workspace à deux niveaux, sans clé i18n brute, avec la poignée au bout de la barre,
 * les boutons زيادة / تخفيض, l'essai additif (vitrine) ou le pari et l'ajout d'un pas (réservoir),
 * et le décor.
 */
const CASES = [
  { price: '1200', steps: '+5', theme: 'mall', mode: 'single', words: ['حذاء رياضي', 'قميص المنتخب', 'زيادة بـ 5%', '1200'] },
  { price: '30', steps: '-30|+15', theme: 'tank', mode: 'chain', words: ['خزان ماء مملوء سعته', 'نُفرغ 30% منه', 'نضيف 15% مما فيه', 'رهاني على التغيّر الكلي'] },
];

it('percent-tag se rend pour chaque monde, sans clé brute', () => {
  for (const c of CASES) {
    const html = renderToString(<PercentTag price={c.price} steps={c.steps} theme={c.theme} />);
    expect(html, c.theme).toContain('data-percent-tag');
    expect(html).toContain(`data-world="${c.theme}"`);
    expect(html).toContain(`data-mode="${c.mode}"`);
    expect(html).toContain('data-percent-handle="t"');
    expect(html).toContain('data-percent-dir="up"');
    expect(html).toContain('data-percent-dir="down"');
    expect(html).toContain('data-percent-glance');
    expect(html).toContain('data-deco');
    if (c.mode === 'single') {
      expect(html).toContain('data-percent-try');
      expect((html.match(/data-percent-article=/g) ?? []).length).toBe(3);
    } else {
      expect(html).toContain('data-percent-handle="bet"');
      expect(html).toContain('data-percent-commit');
      expect(html).toContain('data-percent-tank');
    }
    for (const word of c.words) expect(html, `${c.theme}: ${word}`).toContain(word);
    expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
  }
});

it('au départ : aucune variation (0 %), le multiplicateur 1, rien de découvert', () => {
  const html = renderToString(<PercentTag price="1200" steps="+5" theme="mall" levels={false} />);
  expect(html).toContain('data-s="0"');
  expect(html).toContain('data-k="1"');
  expect(html).toContain('data-y="1200"');
  expect(html).toContain('data-solved="false"');
  expect(html).toContain('aria-valuemin="-50"');
  expect(html).toContain('aria-valuemax="50"');
});

it('percent-tag se rend dans un workspace à deux niveaux', () => {
  const html = renderToString(
    <ManipulationWorkspace
      levels={{
        beginner: () => <PercentTag level="beginner" price="1200" steps="+5" theme="mall" />,
        advanced: () => <PercentTag level="advanced" price="30" steps="-30|+15" theme="tank" />,
      }}
    />,
  );
  expect(html).toContain('data-world="mall"');
  expect(html).toContain('data-world="tank"');
});

it('chaque clé que le composant lit existe (aucune clé brute à l’écran)', () => {
  const ns = manipulationAr.percentTag;
  const own = [...source.matchAll(/\bk\('([a-zA-Z0-9.]+)'/g)].map((m) => m[1]);
  const ternary = [...source.matchAll(/\?\s*'([a-zA-Z0-9.]+)'\s*:\s*'([a-zA-Z0-9.]+)'/g)].flatMap((m) => [m[1], m[2]]);
  const arrays = ['hint1Single', 'hint2Single', 'hint3Single', 'hint1Chain', 'hint2Chain', 'hint3Chain', 'up', 'down'];
  const get = (key) => key.split('.').reduce((o, p) => o?.[p], ns);
  expect(own.length).toBeGreaterThan(30);
  for (const key of [...own, ...arrays]) expect(get(key), `manipulation.percentTag.${key}`).toBeTypeOf('string');
  for (const key of ternary.filter((x) => /^(vAdd|vBet|try|change|worlds|dPrompt|dWhy|dOpt|explanation|hint)/.test(x))) expect(get(key), key).toBeTypeOf('string');
  for (const id of ['mall', 'tank']) for (const key of ['name', 'what', 'unit']) expect(ns.worlds[id][key]).toBeTypeOf('string');
  for (const id of ['sneakers', 'jersey', 'cap', 'tank']) expect(ns.articles[id]).toBeTypeOf('string');
});

/* ── lot 5 (2026-10-28) : les questions pendant le labo (LabCheckpoint), les étapes et le mode guidé ── */
import i18n from '../../../../i18n';
import * as PL from '../logic/percentTag';
import * as LINx from '@smarter-academy/core/arithmetic/linear.js';

it('percent-tag — chaque question de chaque étape, aux deux niveaux : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{', async () => {
  const { CHAINS, QUESTIONS } = await import('./PercentTag');
  const k = (key, o) => i18n.t(`lesson:manipulation.percentTag.${key}`, o);
  const RAW = /manipulation\.[a-zA-Z]/;
  const check = (lab, ids, env, tag) => {
    for (const id of ids) {
      for (const qid of CHAINS[id]) {
        const q = QUESTIONS[qid](lab, env);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${tag}.${id}.${qid}`).not.toMatch(RAW);
        expect(out, `${tag}.${id}.${qid}`).not.toContain('{{');
        expect(q.hints, `${tag}.${id}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tag}.${id}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${tag}.${id}.${qid}`).toBeTruthy();
      }
    }
  };
  const common = (lab) => {
    const W = lab.world;
    const unit = k(`worlds.${W}.unit`);
    const changeWord = (s) => k(s > 0 ? 'changeUp' : 'changeDown', { t: Math.abs(s) });
    const stepWord = (s) => k(s > 0 ? 'worlds.tank.stepUp' : 'worlds.tank.stepDown', { t: Math.abs(s) });
    const change = W === 'tank' ? stepWord : changeWord;
    return { k, W, unit, change, changes: lab.target.map(change).join(' '), artName: (id) => k(`articles.${id}`), discoveryOptions: [{ text: 'a', why: 'w' }, { text: 'b', correct: true }], discoveryPrompt: <p>p</p>, formal: <p>f</p> };
  };
  // single : 1200 DA, +5 % sur le 1er article puis un 2e, puis la barre additive
  let a = PL.init({ price: '1200', steps: '+5', theme: 'mall' });
  a = PL.select(a, 'sneakers'); a = PL.setS(a, 5);
  a = PL.select(a, 'jersey'); a = PL.setS(a, 5);
  a = PL.tryAdditive(a);
  expect(PL.targetSet(a) && PL.table(a).length >= 2 && a.additiveTrials.length > 0).toBe(true);
  check(a, ['set', 'table', 'add'], common(a), 'single');
  expect(QUESTIONS.read(a, common(a)).expected).toBe('1260');
  expect(QUESTIONS.mult(a, common(a)).expected).toBe('1,05');
  expect(QUESTIONS.second(a, common(a)).expected).toBe('3150');
  // chain : −30 puis +15, avec un pari faux puis juste, et la chaîne de contraste −20 puis +20
  let b = PL.init({ price: '30', steps: '-30|+15', theme: 'tank' });
  b = PL.setBet(b, -30);
  b = PL.setDraft(b, -30); b = PL.commitStep(b);
  b = PL.setDraft(b, 15); b = PL.commitStep(b);
  expect(PL.betTriedOnTarget(b)).toBe(true);
  b = PL.setBet(b, -39);
  b = PL.newChain(b); b = PL.setDraft(b, -20); b = PL.commitStep(b); b = PL.setDraft(b, 20); b = PL.commitStep(b);
  expect(PL.targetChainDone(b) && PL.betMatched(b) && !!PL.contrastChain(b)).toBe(true);
  check(b, ['chain', 'contrast'], common(b), 'chain');
  expect(QUESTIONS.mult(b, common(b)).expected).toBe('0,7');
  expect(QUESTIONS.volume(b, common(b)).expected).toBe('24,15');
  expect(QUESTIONS.back(b, common(b)).expected).toBe('28,8');
  // « أعِد التجربة » n'efface que l'étape
  expect(PL.retryTask(a, 'add').additiveTrials).toHaveLength(0);
  expect(PL.targetSet(PL.retryTask(a, 'set'))).toBe(false);
  expect(PL.table(PL.retryTask(a, 'table'))).toHaveLength(1);
  expect(PL.targetChainDone(PL.retryTask(b, 'chain'))).toBe(false);
  expect(PL.contrastChain(PL.retryTask(b, 'contrast'))).toBeNull();
  expect(PL.targetChainDone(PL.retryTask(b, 'contrast'))).toBe(true);
  expect(LINx).toBeTruthy();
});

it('percent-tag — mode guidé : les étapes remplacent la progression et le bouton d’indice', () => {
  for (const c of CASES) {
    const out = renderToString(<PercentTag price={c.price} steps={c.steps} theme={c.theme} levels={false} />);
    expect(out).toContain('data-lab-stepper');
    expect(out).toContain('data-pt-step="0"');
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  }
});
