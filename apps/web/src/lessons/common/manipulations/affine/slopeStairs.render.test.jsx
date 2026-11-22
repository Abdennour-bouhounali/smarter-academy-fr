import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import SlopeStairs, { chainOf, QUESTIONS } from './SlopeStairs';
import * as L from '../logic/slopeStairs';

/**
 * slope-stairs se rend avec les props EXACTES de la leçon 3 (tanasub-taghayyurat) : l'escalier du
 * manuel (نشاط 4, stade), le préréglage مبتدئ (50x + 100), et le تحدّ (deux couples, thermomètre) —
 * sans clé i18n brute, avec le bloc « glance » que l'e2e de l'unité mesure.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('slope-stairs — les props de la leçon', () => {
  it('نشاط 4 (متقدم) : la droite, six marches dont deux imprimées, les deux poignées, la carte d\'abonnement', () => {
    const html = renderToString(<SlopeStairs rule="200x+2000" marks="0|1|4|6|10|12|15" shown={2} theme="stadium" />);
    expect(html).toContain('data-slope-stairs');
    expect(html).toContain('data-mode="rule"');
    expect(html).toContain('data-ss-glance');
    expect(html).toContain('data-ss-line="f(x) = 200x + 2000"');
    expect((html.match(/data-ss-ghost=/g) ?? []).length).toBe(6);
    expect((html.match(/data-printed="true"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-ss-handle="1"');
    expect(html).toContain('data-ss-handle="2"');
    expect(html).toContain('data-ss-less="1"');
    expect(html).toContain('data-ss-more="2"');
    expect(html).toContain('data-ss-fill');
    expect(html).toContain('data-total="4"');
    expect(html).toContain('data-deco="stadium"');
    expect(html).toContain('data-q="200"');
    expect(html).toContain('عدد المقابلات x');
    expect(html).not.toMatch(RAW);
  });

  it('مبتدئ (plateforme) : 50x + 100, deux marches à compléter', () => {
    const html = renderToString(<SlopeStairs rule="50x+100" marks="0|2|4" theme="stadium" />);
    expect((html.match(/data-ss-ghost=/g) ?? []).length).toBe(2);
    expect(html).toContain('data-q="50"');
    expect(html).not.toMatch(RAW);
  });

  it('le تحدّ (deux couples) : f inconnue, pas de droite, les deux points donnés, le thermomètre', () => {
    const html = renderToString(<SlopeStairs points="10:50|30:86" theme="thermo" />);
    expect(html).toContain('data-mode="points"');
    expect(html).toContain('data-found="false"');
    expect(html).not.toContain('data-ss-line=');
    expect(html).toContain('data-ss-given="10:50"');
    expect(html).toContain('data-ss-given="30:86"');
    expect(html).toContain('data-deco="thermo"');
    expect(html).toContain('بالسلسيوس');
    // aucune graduation °F ne donne b
    expect(html).not.toContain('°F');
    expect(html).not.toMatch(RAW);
  });

  it('un contrat incomplet est une erreur de contenu', () => {
    expect(() => renderToString(<SlopeStairs points="10:50" />)).toThrow();
  });
});

describe('slope-stairs — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.slopeStairs.${key}`, o);
  const check = (lab, step) => {
    for (const qid of chainOf(lab, step)) {
      const q = QUESTIONS[qid](lab, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, `${step}.${qid}`).not.toMatch(RAW);
      expect(out, `${step}.${qid}`).not.toContain('{{');
      expect(out, `${step}.${qid}`).not.toContain('$');
      expect(q.hints, `${step}.${qid}`).toHaveLength(2);
      expect(q.options.filter((o) => o.correct), `${step}.${qid}`).toHaveLength(1);
      expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${step}.${qid} why`).toBe(true);
    }
  };
  const go = (lab, a, b) => L.commit({ ...lab, m: [L.indexOf(a, lab.snap), L.indexOf(b, lab.snap)] });
  it('rule : deux étapes (première marche · contraste), la dernière finit par la règle', () => {
    let lab = L.init({ rule: '200x+2000', marks: '0|1|4|6|10|12|15', shown: 2 });
    expect(L.stepsOf(lab)).toEqual(['stair', 'contrast']);
    expect(L.stepReached(lab, 'stair')).toBe(false);
    lab = go(lab, 4, 1);
    expect(L.stepReached(lab, 'stair')).toBe(true);
    expect(chainOf(lab, 'stair')).toEqual(['rise', 'quot']);
    check(lab, 'stair');
    lab = go(go(lab, 10, 6), 12, 4);
    expect(L.stepReached(lab, 'contrast')).toBe(true);
    expect(chainOf(lab, 'contrast')).toEqual(['sameQ', 'rule']);
    check(lab, 'contrast');
    expect(L.restartStep(lab, 'contrast', L.init({ rule: '200x+2000', marks: '0|1|4|6|10|12|15' })).trials).toHaveLength(1);
  });
  it('rule à coefficient négatif : options distinctes, une seule bonne', () => {
    let lab = L.init({ rule: '-3x+12' });
    lab = go(go(go(lab, 1, 3), 2, 5), 0, 4);
    check(lab, 'stair');
    check(lab, 'contrast');
  });
  it('points : a puis b', () => {
    let lab = L.init({ points: '10:50|30:86' });
    expect(L.stepsOf(lab)).toEqual(['find', 'b']);
    lab = go(lab, 30, 10);
    expect(L.stepReached(lab, 'find')).toBe(true);
    check(lab, 'find');
    lab = go(lab, 0, 10);
    expect(L.stepReached(lab, 'b')).toBe(true);
    expect(chainOf(lab, 'b')).toEqual(['b', 'rule']);
    check(lab, 'b');
    expect(L.restartStep(lab, 'b', null).bRead).toBeNull();
  });
  it('mode guidé : ni la progression ni le bouton d’indice (questions actives), le son est là', () => {
    const out = renderToString(<SlopeStairs rule="50x+100" marks="0|2|4" theme="stadium" />);
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-manipulation-sound');
    expect(out).toContain('data-ss-step="1"');
  });
});
