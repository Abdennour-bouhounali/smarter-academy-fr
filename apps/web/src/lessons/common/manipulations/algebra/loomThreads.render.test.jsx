import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import LoomThreads, { discoveryOptions, opText } from './LoomThreads';
import { LEVELS } from '../levels';
import * as L from '../logic/loomThreads';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<LoomThreads {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.loomThreads.${key}`, o);
const LV = LEVELS['loom-threads'];

describe('loom-threads — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, les deux fils, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-loom-threads');
      expect(out).toContain('data-lt-glance');
      for (const hook of ['data-lt-tools', 'data-lt-knob', 'role="slider"', 'data-lt-tie', 'data-lt-undo', 'data-lt-orders', 'data-lt-free', 'data-lt-beam="0"', 'data-lt-beam="1"']) expect(out, hook).toContain(hook);
      expect(out.match(/data-lt-tool="/g)?.length).toBe(2);
      expect(out).toContain('data-lt-verdict=""');
      expect(out).not.toContain('data-lt-next');
      expect(out).not.toContain('data-lt-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : deux fils (rouge et bleu) et aucun croisement au départ ; متقدم T1 : le même', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out.match(/data-lt-thread="/g)?.length).toBe(2);
    expect(out).not.toContain('data-lt-cross');
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('الخيط الأحمر ينزل')).toBeGreaterThan(t.indexOf('على النول خيطان'));
  });

  it('dit chaque chose UNE fois : le geste n\'est écrit que dans la ligne d\'attente', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    expect(t.split('اربط').length - 1).toBeLessThanOrEqual(3);
  });

  it('une tâche bande se dessine : la bande peinte, la bascule, aucun fil rouge', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced', tasks: [LV.advanced.numbers.tasks[1]] });
    expect(out).toContain('data-lt-band');
    expect(out).not.toContain('data-lt-thread="red"');
  });

  it('« × (−1/2) » dit aussi la division', () => {
    const kk = (key) => i18n.t(`lesson:manipulation.loomThreads.${key}`);
    expect(opText('nail', Lin.frac(-1, 2), kk)).toContain('÷');
    expect(opText('nail', Lin.frac(-3), kk)).not.toContain('÷');
    expect(opText('comb', Lin.frac(-4), kk)).toBe('+ (-4)'.replace('-', '−'));
  });

  it('les réfutations de la découverte citent SES essais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.tie(L.dragKnot(L.setTool(s, 'comb'), -4));
    s = L.tie(L.dragKnot(L.setTool(s, 'nail'), 2));
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>)).join(' ');
    expect(text(wrong)).toContain('أزحتَ بـ −4');
    expect(text(wrong)).toContain('مدّدتَ بـ 2');
  });
});

describe('loom-threads — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question des suites des deux niveaux : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./LoomThreads');
    const Lin = await import('@smarter-academy/core/arithmetic/linear.js');
    const tieWith = (s, tool, c) => L.tie({ ...L.setTool(s, tool), v: Lin.frac(...c) });
    const plans = {
      beginner: [(s) => tieWith(tieWith(s, 'nail', [2]), 'nail', [-1]), (s) => tieWith(s, 'nail', [-3]), (s) => tieWith(s, 'nail', [0])],
      advanced: [
        (s) => { let t = tieWith(s, 'comb', [-4]); t = { ...L.setTool(t, 'comb'), v: Lin.frac(-1) }; t = L.addStage(t); return tieWith(t, 'nail', [-2]); },
        (s) => tieWith(s, 'nail', [-2]),
        (s) => tieWith(s, 'nail', [-1, 2]),
      ],
    };
    for (const level of ['beginner', 'advanced']) {
      let s = L.init(LV[level].numbers);
      plans[level].forEach((play, i) => {
        s = play(s);
        expect(L.taskDone(s), `${level} ${i}`).toBe(true);
        for (const qid of CHAINS[level][i]) {
          const q = QUESTIONS[qid](s, L.taskOf(s), k);
          expect(q, `${level}.${i}.${qid}`).toBeTruthy();
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${level}.${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${level}.${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${level}.${i}.${qid}`).toHaveLength(2);
          expect(q.options.filter((o) => o.correct), `${level}.${i}.${qid}`).toHaveLength(1);
          expect(q.options, `${level}.${i}.${qid}`).toHaveLength(3);
        }
        if (i < s.tasks.length - 1) s = L.nextTask(s);
      });
    }
  });
});

describe('loom-threads — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ et متقدم : ni la progression ni le bouton d’indice, un LabStepper ; une seule tâche : les deux restent', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
    }
    const r = html({ step: '1', tasks: [{ id: 'z1', kind: 'swap', a: '1', b: '3' }], levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
