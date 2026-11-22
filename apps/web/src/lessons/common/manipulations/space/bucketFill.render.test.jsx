import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import * as L from '../logic/bucketFill';
import BucketFill from './BucketFill';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * bucket-fill se rend aux deux niveaux de levels.js (le petit seau plein de la plateforme ; le تحدّ du manuel), seul et dans un
 * workspace : sans WebGL (rendu serveur), la fenêtre 3D montre son repli SpaceFigure et TOUTES les commandes sont là ; aucune
 * clé i18n brute, aucune interpolation oubliée, et aucun résultat écrit avant que l'élève ne l'ait trouvé.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const LEAKS = ['SO = 105', '{105}', '24388', '25\\,539', '25{,}54', '\\dfrac{15}{19}', 'data-bf-card', 'data-bf-to-apex'];

describe('bucket-fill — rendu', () => {
  it('advanced (le تحدّ) : la plage, le seau au repli, phase « مستوى الماء », le curseur et « ثبّت » — la réponse nulle part', () => {
    const html = renderToString(<BucketFill {...LEVELS['bucket-fill'].advanced.numbers} />);
    expect(html).toContain('data-bucket-fill');
    expect(html).toContain('data-world="beach-bucket"');
    expect(html).toContain('data-phase="level"');
    expect(html).toContain('data-bf-glance');
    expect(html).toContain('data-stage3d');
    expect(html).toContain('data-stage3d-fallback');
    expect(html).toContain('data-space-figure');
    expect(html).toContain('data-bf-level-slider');
    expect(html).toContain('data-bf-level-minus');
    expect(html).toContain('data-bf-level-plus');
    expect(html).toContain('data-bf-fix');
    expect(html).toContain('data-deco="beach-bucket"');
    expect(html).toContain('data-bf-depth="14"');
    for (const leak of LEAKS) expect(html).not.toContain(leak);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('beginner : le petit seau (r = 3, R = 4, H = 6) à remplir jusqu’au bord, sans 74π ni 18', () => {
    const html = renderToString(<BucketFill level="beginner" {...LEVELS['bucket-fill'].beginner.numbers} />);
    expect(html).toContain('data-phase="level"');
    expect(html).toContain('max="6"');
    expect(html).not.toContain('74\\pi');
    expect(html).not.toContain('SO = 18');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, des ids SVG distincts', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <BucketFill level="beginner" theme="beach-bucket" numbers={LEVELS['bucket-fill'].beginner.numbers} />,
        advanced: () => <BucketFill level="advanced" theme="beach-bucket" numbers={LEVELS['bucket-fill'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-bucket-fill="true"/g) ?? []).length).toBe(2);
    const ids = [...html.matchAll(/ id="(bf[A-Za-z]+[^"]*)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(6);
    expect(new Set(ids).size).toBe(6);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.bucketFill.${key}`, o);
const checkQ = (qid, q) => {
  const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
  expect(out, qid).not.toMatch(RAW);
  expect(out, qid).not.toContain('{{');
  expect(q.hints, qid).toHaveLength(2);
  if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), qid).toHaveLength(1); else expect(q.expected).toBeTruthy();
};

describe('bucket-fill — questions pendant le labo (LabCheckpoint)', () => {
  it('le niveau, le sommet, le volume : chaque étape pose des questions sur les nombres du seau, la dernière finit par la règle', async () => {
    const { chainOf, QUESTIONS } = await import('./BucketFill');
    const nums = LEVELS['bucket-fill'].advanced.numbers;
    const F = L.facts(nums);
    let s = L.init(nums);
    expect(L.stepsOf(s).map((x) => x.reached)).toEqual([false, false, false]);
    s = L.fixLevel(L.setLevel(s, nums.depth));
    expect(L.stepsOf(s)[0].reached).toBe(true);
    const ctx = { lab: s, nums, F, options: [{ text: 'a', correct: true }], formal: null };
    for (const qid of chainOf('level')) checkQ(qid, QUESTIONS[qid](ctx, k));
    expect(QUESTIONS.lvAbove(ctx, k).expected).toBe('28');
    expect(QUESTIONS.lvRadius(ctx, k).expected).toBe('19');
    s = L.openPhase(s, 'apex');
    s = L.commitApex(L.setApex(s, 105));
    expect(L.stepsOf(s)[1].reached).toBe(true);
    for (const qid of chainOf('apex')) checkQ(qid, QUESTIONS[qid](ctx, k));
    expect(QUESTIONS.apexSO(ctx, k).expected).toBe('105');
    expect(QUESTIONS.apexK(ctx, k).expected).toBe('15/19');   // k = SO / SW = 105 / 133
    s = L.openPhase(s, 'volume');
    s = L.pickCard(s, 'avg');
    expect(L.stepsOf(s)[2].reached).toBe(false);
    s = L.pickCard(s, 'k3');
    expect(L.stepsOf(s)[2].reached).toBe(true);
    for (const qid of chainOf('volume')) checkQ(qid, QUESTIONS[qid](ctx, k));
    for (const qid of ['kCube', 'oneMinus']) {
      const q = QUESTIONS[qid](ctx, k);
      expect(q.options.filter((o) => o.correct)).toHaveLength(1);
      q.options.filter((o) => !o.correct).forEach((o) => expect(o.why).toBeTruthy());
    }
    expect(L.stepsOf(L.retryStep(s, 'volume'))[2].reached).toBe(false);
    expect(L.stepsOf(L.retryStep(s, 'apex'))[1].reached).toBe(false);
  });
});

describe('bucket-fill — mode guidé', () => {
  it('questions actives : ni la progression ni le bouton d’indice, un stepper ; coupées : ils reviennent', () => {
    const a = renderToString(<BucketFill {...LEVELS['bucket-fill'].advanced.numbers} level="advanced" />);
    expect(a).not.toContain('data-manipulation-progress');
    expect(a).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(a).toContain('data-bf-step="0"');
    const b = renderToString(<BucketFill {...LEVELS['bucket-fill'].advanced.numbers} level="advanced" checkpoints={false} />);
    expect(b).toContain('data-manipulation-progress');
  });
});
