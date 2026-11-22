import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import * as L from '../logic/bridgePath';
import BridgePath from './BridgePath';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * bridge-path se rend aux deux niveaux de levels.js (la passerelle du Rhummel ; la rue de l'école du manuel), seul et
 * dans un workspace, sans clé i18n brute, sans interpolation oubliée, et sans la longueur minimale écrite au départ.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('bridge-path — rendu', () => {
  it('advanced (وضعية): la rue, le passage, la poignée, la lecture — la réponse nulle part', () => {
    const html = renderToString(<BridgePath theme="crosswalk" {...LEVELS['bridge-path'].advanced.numbers} />);
    expect(html).toContain('data-bridge-path');
    expect(html).toContain('data-world="crosswalk"');
    expect(html).toContain('data-stage="explore"');
    expect(html).toContain('data-bp-glance');
    expect(html).toContain('data-bp-handle="2"');
    expect(html).toContain('data-deco="crosswalk"');
    expect(html).toContain('role="slider"');
    expect(html).not.toContain('data-bp-pin');
    expect(html).not.toContain('data-bp-open');
    expect(html).not.toContain('11,22');
    expect(html).not.toContain('11{,}22');
    expect(html).not.toContain('\\sqrt{85}');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('beginner: la gorge du Rhummel, la passerelle', () => {
    const html = renderToString(<BridgePath theme="bridge" level="beginner" {...LEVELS['bridge-path'].beginner.numbers} />);
    expect(html).toContain('data-world="bridge"');
    expect(html).toContain('data-deco="bridge"');
    expect(html).toContain('data-bp-crossing');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, un seul sélecteur', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <BridgePath level="beginner" theme="bridge" numbers={LEVELS['bridge-path'].beginner.numbers} />,
        advanced: () => <BridgePath level="advanced" theme="crosswalk" numbers={LEVELS['bridge-path'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-bridge-path/g) ?? []).length).toBe(2);
    expect(html).toContain('data-world="bridge"');
    expect(html).toContain('data-world="crosswalk"');
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.bridgePath.${key}`, o);
const PRE = /manipulation\.[a-zA-Z]/;
const CTX = { options: [{ text: 'a', correct: true }, { text: 'b', why: 'w' }], formal: <span>f</span> };
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(PRE);
  expect(out, qid).not.toContain('{{');
  expect(out, qid).not.toContain('undefined');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy()); } else expect(q.expected).toBeTruthy();
};

describe('bridge-path — questions pendant le labo (LabCheckpoint)', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : explore (width · compare) · translate (pinWhy · para) · straight (alignedWhy · minimum · règle)`, async () => {
      const { chainOf, QUESTIONS } = await import('./BridgePath');
      let s = L.init(LEVELS['bridge-path'][level].numbers);
      expect(L.reachedKinds(s)).toEqual([]);
      s = L.cross(s, s.i); s = L.cross(s, s.i + 1);
      expect(L.reachedKinds(s)).toEqual(['explore']);
      for (const qid of chainOf('explore', false)) checkQ(`${level}.${qid}`, QUESTIONS[qid](s, k, CTX));
      expect(QUESTIONS.width(s, k).expected).toBe('2');
      expect(QUESTIONS.compare(s, k).options.filter((o) => o.correct)).toHaveLength(1);
      s = L.openTranslate(s);
      s = L.placePin(s, { x: Number(s.best.Bp.x.n / s.best.Bp.x.d), y: Number(s.best.Bp.y.n / s.best.Bp.y.d) });
      expect(L.reachedKinds(s)).toEqual(['explore', 'translate']);
      for (const qid of chainOf('translate', false)) checkQ(`${level}.${qid}`, QUESTIONS[qid](s, k, CTX));
      s = L.cross(s, s.iStar);
      expect(L.reachedKinds(s)).toEqual(['explore', 'translate', 'straight']);
      for (const qid of chainOf('straight', true)) checkQ(`${level}.${qid}`, QUESTIONS[qid](s, k, CTX));
      expect(L.reachedKinds(L.restartStep(s, 'straight'))).toEqual(['explore', 'translate']);
      expect(L.reachedKinds(L.restartStep(s, 'translate'))).toEqual(['explore']);
      expect(L.reachedKinds(L.restartStep(s, 'explore'))).toEqual([]);
    });
  }
});

describe('bridge-path — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; coupées : ils reviennent', () => {
    const a = renderToString(<BridgePath {...LEVELS['bridge-path'].beginner.numbers} level="beginner" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-bp-step="0"');
    const b = renderToString(<BridgePath {...LEVELS['bridge-path'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
