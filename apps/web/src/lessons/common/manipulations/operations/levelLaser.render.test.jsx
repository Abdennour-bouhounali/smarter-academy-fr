import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import LevelLaser, { CHAINS, QUESTIONS, ruleOptions } from './LevelLaser';
import { LEVELS } from '../levels';
import * as L from '../logic/levelLaser';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<LevelLaser {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.levelLaser.${key}`, o);
const LV = LEVELS['level-laser'];

describe('level-laser — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, tubes, laser, pastilles ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-level-laser');
      expect(out).toContain('data-ll-glance');
      for (const hook of ['data-ll-scene', 'data-ll-laser', 'role="slider"', 'data-ll-tube="0"', 'data-ll-tube="1"', 'data-ll-free', 'data-ll-free-a', 'data-ll-free-d', 'data-lab-stepper', 'data-ll-up', 'data-ll-down']) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-ll-next');
      expect(out).not.toContain('data-ll-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : tubes visibles, laser libre, les boutons « على زيت » ne sont pas offerts avant un geste', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-locked="false"');
    expect(out).not.toContain('data-ll-sleeve');
    expect(out).not.toContain('data-ll-snap');
    expect(out).toContain('data-ll-chip="0"');
  });
  it('متقدم : tubes voilés, laser verrouillé, pas de pastille, choix par signe', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-locked="true"');
    expect(out).toContain('data-ll-sleeve="0"');
    expect(out).toContain('data-ll-sleeve="1"');
    expect(out).not.toContain('data-ll-chip');
    expect(out).toContain('data-ll-choice="left"');
  });
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('حرّك الليزر حتى يلمس')).toBeGreaterThan(t.indexOf('في معصرة التعاونية'));
  });
  it('ruleOptions : une seule bonne réponse, des réfutations', () => {
    const o = ruleOptions(L.init(), k);
    expect(o.filter((x) => x.correct)).toHaveLength(1);
    expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
  });
});

describe('level-laser — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') { expect(q.options.filter((o) => o.correct), tag).toHaveLength(1); expect(q.options.filter((o) => !o.correct).every((o) => o.why), tag).toBe(true); } else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    const sets = [LV.beginner.numbers, LV.advanced.numbers, { tasks: [{ id: 'k1', tanks: ['2/3', '5/6'] }] }];
    for (const nums of sets) {
      const s = L.init(nums);
      for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
    }
    const exp = (id, qid, nums = LV.beginner.numbers) => { const s = L.init(nums); const t = s.tasks.find((x) => x.id === id); return QUESTIONS[qid](s, t, k).expected; };
    expect(exp('l1', 'marks')).toBe('8');
    expect(exp('l2', 'at9')).toBe('9');
    expect(exp('k1', 'kmark', { tasks: [{ id: 'k1', tanks: ['2/3', '5/6'] }] })).toBe('4');
  });
});

describe('level-laser — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', tanks: ['1/2', '1/2'] }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
