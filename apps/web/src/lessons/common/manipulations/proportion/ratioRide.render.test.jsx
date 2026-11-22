import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import RatioRide from './RatioRide';
import ManipulationWorkspace from '../ManipulationWorkspace';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './RatioRide.jsx?raw';

/**
 * ratio-ride se rend à ses deux niveaux (un tarif / deux tarifs), seul et dans un workspace à deux
 * niveaux, sans clé i18n brute, avec la trottinette-poignée, −/+, « سجّل الرحلة », le compteur de chaque
 * tarif, les boutons de jugement et le décor.
 */
it('ratio-ride se rend avec un tarif puis deux, sans clé brute', () => {
  for (const plans of ['15x', '15x|10x+50']) {
    const html = renderToString(<RatioRide plans={plans} />);
    expect(html, plans).toContain('data-ratio-ride');
    expect(html).toContain(`data-plans="${plans}"`);
    expect((html.match(/data-stretch-handle/g) ?? []).length).toBe(1);
    expect(html).toContain('data-ride-handle');
    expect(html).toContain('data-ride-less');
    expect(html).toContain('data-ride-more');
    expect(html).toContain('data-ride-record');
    expect(html).toContain('data-ride-meter="A"');
    expect(html).toContain('data-ride-claim="A:yes"');
    expect(html).toContain('data-ride-claim="A:no"');
    expect(html).toContain('data-deco="scooter"');
    expect(html).toContain('data-deco="palms"');
    // tablette et ordinateur seulement (2026-10-27) : plus de mise en page « téléphone » — sous la largeur « side », la pile
    expect(html).toContain('data-layout="stack"');
    expect(html).toContain('15DA للدقيقة');
    expect(html).not.toMatch(/manipulation\.[a-zA-Z]/);
    if (plans.includes('|')) {
      expect(html).toContain('data-ride-meter="B"');
      expect(html).toContain('data-ride-claim="B:no"');
      expect(html).toContain('data-ride-reveal');
      expect(html).toContain('50DA لفتح القفل + 10DA للدقيقة');
      expect(html).toContain('aria-valuemax="20"');
    } else {
      expect(html).not.toContain('data-ride-reveal');
      expect(html).toContain('aria-valuemax="10"');
    }
  }
});

it('ratio-ride se rend dans un workspace à deux niveaux', () => {
  const html = renderToString(
    <ManipulationWorkspace
      levels={{
        beginner: () => <RatioRide level="beginner" plans="15x" />,
        advanced: () => <RatioRide level="advanced" plans="15x|10x+50" />,
      }}
    />,
  );
  expect(html).toContain('data-plans="15x"');
  expect(html).toContain('data-plans="15x|10x+50"');
});

it('chaque clé que le composant lit existe (aucune clé brute à l’écran)', () => {
  const ns = manipulationAr.ratioRide;
  const own = [...source.matchAll(/\bk\('([a-zA-Z0-9]+)'/g)].map((m) => m[1]);
  const ternary = [...source.matchAll(/\?\s*'([a-zA-Z0-9]+)'\s*:\s*'([a-zA-Z0-9]+)'/g)].flatMap((m) => [m[1], m[2]])
    .filter((key) => /^(planA|planB|missionOne|missionTwo|hint2|hint2Two|claimYes|claimNo|claimYesAria|claimNoAria|judgedYes|judgedNo)$/.test(key));
  expect(own.length).toBeGreaterThan(30);
  for (const key of [...own, ...ternary]) {
    expect(ns[key] ?? ns[`${key}_other`], `manipulation.ratioRide.${key}`).toBeTypeOf('string');
  }
  for (const key of ['vYesRefused', 'vYesRefusedZero', 'vNoOk', 'vNoOkZero']) expect(ns[key]).toBeTypeOf('string');
  for (const key of ['place', 'planLinear', 'planAffine']) expect(ns.worlds.scooter[key]).toBeTypeOf('string');
  for (const form of ['zero', 'one', 'two', 'few', 'many', 'other']) {
    expect(ns[`minutes_${form}`]).toBeTypeOf('string');
    expect(ns[`repNote_${form}`]).toBeTypeOf('string');
  }
});

it('valeurs par défaut : la trottinette s’ouvre sur une durée (1 minute), aucune colonne enregistrée', () => {
  const html = renderToString(<RatioRide plans="15x" levels={false} />);
  expect(html).toContain('data-x="1"');
  expect(html).toMatch(/data-columns=""/);
});

/* ── lot 5 (2026-10-28) : les questions pendant le labo (LabCheckpoint) et le mode guidé ── */
import { describe } from 'vitest';
import i18n from '../../../../i18n';
import * as RL from '../logic/ratioRide';

describe('ratio-ride — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question de chaque suite, aux deux niveaux : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./RatioRide');
    const k = (key, o) => i18n.t(`lesson:manipulation.ratioRide.${key}`, o);
    const RAW = /manipulation\.[a-zA-Z]/;
    for (const plans of ['15x', '15x|10x+50']) {
      let s = RL.init({ plans });
      s = RL.record(RL.record(RL.record(s, 2), 5), 8);
      for (const p of s.plans) s = RL.claim(s, p.id, p.linear ? 'yes' : 'no');
      expect(RL.allJudged(s), plans).toBe(true);
      s = s.two ? RL.formulaTry(s, '15') : RL.ghostTry(s, '180');
      expect(RL.discoveryReady(s), plans).toBe(true);
      const discoveryOptions = [{ text: 'a', why: 'w' }, { text: 'b', correct: true }, { text: 'c', why: 'w' }];
      const chains = [s.two ? CHAINS.judgeTwo : CHAINS.judgeOne, CHAINS.rule];
      for (const chain of chains) {
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, k, { discoveryOptions, formalNode: <p>formal</p> });
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${plans}.${qid}`).not.toMatch(RAW);
          expect(out, `${plans}.${qid}`).not.toContain('{{');
          expect(q.hints, `${plans}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${plans}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${plans}.${qid}`).toBeTruthy();
        }
      }
      expect(QUESTIONS.ratio(s, k).expected).toBe('15');
      expect(QUESTIONS.predict(s, k).expected).toBe(plans === '15x' ? '300' : '600');
      if (s.two) expect(QUESTIONS.zero(s, k).expected).toBe('50');
      else expect(QUESTIONS.double(s, k).expected).toBe('60');   // 2 min = 30 DA → 4 min = 60 DA
    }
  });
});

describe('ratio-ride — mode guidé et étapes', () => {
  it('questions actives : deux étapes, ni la progression ni le bouton d’indice', () => {
    const out = renderToString(<RatioRide plans="15x" levels={false} />);
    expect(out).toContain('data-lab-stepper');
    expect(out).toContain('data-ride-step="1"');
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
