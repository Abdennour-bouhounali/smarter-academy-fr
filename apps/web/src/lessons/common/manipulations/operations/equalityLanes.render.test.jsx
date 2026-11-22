import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import EqualityLanes, { discoveryOptions } from './EqualityLanes';
import { LEVELS } from '../levels';
import * as L from '../logic/equalityLanes';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<EqualityLanes {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.equalityLanes.${key}`, o);
const LV = LEVELS['equality-lanes'];

describe('equality-lanes — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, les deux coureurs, les commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-equality-lanes');
      expect(out).toContain('data-el-glance');
      expect(out.match(/data-el-runner="/g)?.length).toBe(2);
      for (const hook of ['data-el-ops', 'data-el-knob', 'role="slider"', 'data-el-whos', 'data-el-apply', 'data-el-undo', 'data-el-readout', 'data-el-free', 'data-el-guide']) expect(out, hook).toContain(hook);
      expect(out.match(/data-el-op="/g)?.length).toBe(4);
      expect(out.match(/data-el-who="/g)?.length).toBe(3);
      expect(out).toContain('data-el-verdict=""');
      expect(out).not.toContain('data-el-next');
      expect(out).not.toContain('data-el-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf(k('legend.left'))).toBeGreaterThan(t.indexOf('خفيّ'));
  });

  it('dit chaque chose UNE fois : le geste n\'est écrit que dans la ligne d\'attente', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    expect(t.split('نفّذ').length - 1).toBeLessThanOrEqual(3);
  });

  it('les réfutations de la découverte citent SES essais', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.apply(L.setC(s, -2));
    s = L.apply(L.setWho(L.setC(L.nextTask(s), 4), 'left'));
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const wrong = opts.filter((o) => !o.correct).map((o) => renderToString(<span>{o.why}</span>));
    expect(wrong.join(' ')).toContain('سلمى وحدها');
  });
});

describe('equality-lanes — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question des suites des deux niveaux : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./EqualityLanes');
    for (const level of ['beginner', 'advanced']) {
      let s = L.init(LV[level].numbers);
      s.tasks.forEach((tk, i) => {
        for (const [op, c] of tk.ops) s = L.apply({ ...s, op, c, who: 'both' });
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

describe('equality-lanes — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ et متقدم : ni la progression ni le bouton d’indice, un LabStepper ; une seule tâche libre : les deux restent', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
    }
    const r = html({ ...LV.beginner.numbers, tasks: [[['add', -2]]], levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
