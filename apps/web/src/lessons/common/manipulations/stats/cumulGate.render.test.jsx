import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import CumulGate, { CHAINS, QUESTIONS } from './CumulGate';
import * as L from '../logic/cumulGate';
import ManipulationWorkspace from '../ManipulationWorkspace';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';
import source from './CumulGate.jsx?raw';

/**
 * cumul-gate se rend à ses deux niveaux (8 enfants du manège ; les 20 élèves du نشاط 1 + le tableau), seul
 * et dans un workspace à deux niveaux, sans clé i18n brute, avec la toise-poignée, −/+, les deux côtés,
 * l'annonce, le bloc quasi carré des personnes et le décor.
 */
const ACT1 = '160|165|154|157|159|154|157|165|160|159|165|159|160|154|160|159|157|160|157|159';

it('cumul-gate se rend : 8 enfants (3 × 3), puis 20 élèves (bloc) avec le tableau du manuel', () => {
  const kids = renderToString(<CumulGate series="120:2|130:3|140:2|150:1" mode="up|down" theme="funpark" />);
  expect(kids).toContain('data-cumul-gate');
  expect(kids).toContain('data-cg-glance');
  expect((kids.match(/data-stretch-handle/g) ?? []).length).toBe(1);
  expect((kids.match(/data-cg-person=/g) ?? []).length).toBe(8);
  expect(kids).toContain('data-cols="3"');
  for (const a of ['data-cg-less', 'data-cg-more', 'data-cg-side="up"', 'data-cg-side="down"', 'data-cg-sort', 'data-cg-input', 'data-cg-check', 'data-deco="lights"', 'data-deco="wheel"']) {
    expect(kids, a).toContain(a);
  }
  expect(kids).not.toContain('data-cg-table');
  expect(kids).toContain('aria-valuemin="117"');
  expect(kids).not.toMatch(/manipulation\.[a-zA-Z]/);

  const cls = renderToString(<CumulGate series={ACT1} mode="up|down|table" given="up:154|up:157|up:165|down:154|down:160|down:165" theme="school" />);
  expect((cls.match(/data-cg-person=/g) ?? []).length).toBe(20);
  expect(cls).toContain('data-cg-table');
  expect(cls).toContain('data-cg-cell="up:157"');
  expect(cls).toMatch(/data-cg-cell="down:160"[^>]*>8</);
  expect(cls).toContain('data-deco="bunting"');
  expect(cls).toContain('data-lab-fold="cumul-gate.table"');
  expect(cls).not.toMatch(/manipulation\.[a-zA-Z]/);
});

it('cumul-gate se rend dans un workspace à deux niveaux', () => {
  const html = renderToString(
    <ManipulationWorkspace
      defaultLevel="advanced"
      levels={{
        beginner: () => <CumulGate level="beginner" series="120:2|130:3|140:2|150:1" theme="funpark" />,
        advanced: () => <CumulGate level="advanced" series={ACT1} mode="up|down|table" theme="school" />,
      }}
    />,
  );
  expect(html).toContain('data-series="120:2|130:3|140:2|150:1"');
  expect(html).toContain(`data-series="${ACT1}"`);
});

it('chaque clé que le composant lit existe (aucune clé brute à l’écran)', () => {
  const ns = manipulationAr.cumulGate;
  const own = [...source.matchAll(/\bk\('([a-zA-Z0-9]+)'/g)].map((m) => m[1]);
  const quoted = [...source.matchAll(/'((?:v|side|rel|row|rep)[A-Z][a-zA-Z]*)'/g)].map((m) => m[1]);
  expect(own.length).toBeGreaterThan(20);
  for (const key of [...own, ...quoted]) expect(ns[key], `manipulation.cumulGate.${key}`).toBeTypeOf('string');
  const worldKeys = [...source.matchAll(/\bw\('([a-zA-Z0-9]+)'/g)].map((m) => m[1]).concat(['askUp', 'askDown']);
  for (const theme of ['funpark', 'school']) {
    for (const key of worldKeys) expect(ns.worlds[theme][key], `${theme}.${key}`).toBeTypeOf('string');
  }
});

it('valeurs par défaut : le seuil s’ouvre sous la plus petite taille (117), personne n’est allumé', () => {
  const html = renderToString(<CumulGate series="120:2|130:3|140:2|150:1" mode="up|down" theme="funpark" />);
  expect(html).toContain('data-t="117"');
  expect(html).not.toContain('data-lit="true"');
});

describe('cumul-gate — questions pendant le labo (LabCheckpoint)', () => {
  const RAW = /manipulation\.[a-zA-Z]/;
  const k = (key, o) => i18n.t(`lesson:manipulation.cumulGate.${key}`, o);
  const build = (series, claims) => {
    let s = L.init({ series, mode: 'up|down' });
    for (const [t, side, n] of claims) s = L.claim(s, t, side, n);
    return s;
  };
  const check = (s, chain, label) => {
    for (const qid of chain) {
      const q = QUESTIONS[qid](s, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${label}.${qid}`).not.toMatch(RAW);
      expect(out, `${label}.${qid}`).not.toContain('{{');
      expect(q.hints, `${label}.${qid}`).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${label}.${qid}`).toHaveLength(1);
      else expect(q.expected).toBeTruthy();
    }
  };

  it('s1 (un compte sur une valeur, puis hors série) et s2 (deux côtés) : textes, 2 indices, une bonne réponse', () => {
    const SER = '120:2|130:3|140:2|150:1';
    check(build(SER, [[130, 'up', '5']]), CHAINS.s1, 's1-valeur');
    check(build(SER, [[125, 'up', '2']]), CHAINS.s1, 's1-horsserie');
    const both = build(SER, [[130, 'up', '5'], [130, 'down', '6']]);
    check(both, CHAINS.s2, 's2');
    expect(QUESTIONS.other(build(SER, [[130, 'up', '5']]), k).expected).toBe('3');   // 8 − 5
    expect(QUESTIONS.sum(both, k).expected).toBe('11');
    expect(QUESTIONS.extra(both, k).expected).toBe('3');                                // 11 − 8 = f(130)
    expect(QUESTIONS.incl(build(SER, [[125, 'up', '2']]), k).kind).toBe('number');
  });

  it('mode guidé : ni la progression جرّب › اكتشف ni « تلميح » ; deux étapes et l’interrupteur enseignant sont montés', () => {
    const out = renderToString(<CumulGate series="120:2|130:3|140:2|150:1" mode="up|down" theme="funpark" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect((out.match(/data-cg-step=/g) ?? []).length).toBe(2);
    const off = renderToString(<CumulGate series="120:2|130:3|140:2|150:1" mode="up|down" theme="funpark" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
  });
});
