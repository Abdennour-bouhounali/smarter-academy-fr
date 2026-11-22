import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import TrailOdometer, { CHAINS, QUESTIONS, ruleOptions } from './TrailOdometer';
import { LEVELS } from '../levels';
import * as L from '../logic/trailOdometer';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TrailOdometer {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&(lt|gt|amp);/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.trailOdometer.${key}`, o);
const LV = LEVELS['trail-odometer'];

describe('trail-odometer — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : vue d'ensemble, sentier, compteurs, commandes ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      expect(out).toContain('data-trail-odometer');
      expect(out).toContain('data-to-glance');
      const ctl = level === 'beginner' ? ['data-to-arrive', 'data-to-less', 'data-to-more'] : [];   // متقدم : le sentier est fermé, la zone d'écriture remplace les commandes
      for (const hook of [...ctl, 'data-to-scene', 'data-to-hiker', 'role="slider"', 'data-to-counter="white"', 'data-to-free', 'data-to-free-a', 'data-to-free-d', 'data-lab-stepper', 'data-to-leg="0"', 'data-to-post="1"']) expect(out, hook).toContain(hook);
      if (level === 'beginner') expect(out).toContain('data-to-verdict=""');
      expect(out).not.toContain('data-to-next');
      expect(out).not.toContain('data-to-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['x'].includes(w));
      expect(words).toEqual([]);
    });
  }
  it('مبتدئ : sentier libre, pas de compteur rouge dans g1, pas de zone d’écriture avant la fin des étapes', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-locked="false"');
    expect(out).not.toContain('data-to-counter="red"');
    expect(out).not.toContain('data-to-write');
    expect(out).not.toContain('data-red');
  });
  it('متقدم : le sentier est verrouillé tant que la prédiction n’est pas écrite ; les deux champs sont là', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-locked="true"');
    expect(out).toContain('data-to-input="pos"');
    expect(out).toContain('data-to-input="rest"');
    expect(out).toContain('data-to-counter="red"');
    expect(out).toContain('data-red="true"');
  });
  it('ouvre sur son CONTEXTE puis UNE question (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t.indexOf('امشِ بالكشّافة')).toBeGreaterThan(t.indexOf('خرج الفوج'));
  });
  it('ruleOptions : une seule bonne réponse, des réfutations avec les nombres de l’élève', () => {
    for (const lv of ['beginner', 'advanced']) {
      const o = ruleOptions(L.init(LV[lv].numbers), k);
      expect(o.filter((x) => x.correct)).toHaveLength(1);
      expect(o.filter((x) => !x.correct).every((x) => x.why)).toBe(true);
    }
  });
});

describe('trail-odometer — questions pendant le labo (LabCheckpoint)', () => {
  const check = (q, tag) => {
    const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
    expect(out, tag).not.toMatch(RAW);
    expect(out, tag).not.toContain('{{');
    expect(q.hints, tag).toHaveLength(2);
    if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), tag).toHaveLength(1);
    else expect(q.expected, tag).toBeTruthy();
  };
  it('chaque question de chaque suite : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      for (const task of s.tasks) for (const qid of CHAINS[task.id]) check(QUESTIONS[qid](s, task, k), `${task.id}.${qid}`);
    }
    const exp = (lv, id, qid) => { const s = L.init(LV[lv].numbers); const t = s.tasks.find((x) => x.id === id); return QUESTIONS[qid](s, t, k).expected; };
    expect(exp('beginner', 'g1', 'tot')).toBe('9');
    expect(exp('beginner', 'g2', 'redPosts')).toBe('3');
    expect(exp('advanced', 'a2', 'whiteBack')).toBe('8');
    expect(exp('advanced', 'a4', 'loopCount')).toBe('11');
  });
});

describe('trail-odometer — mode guidé', () => {
  it('ni la progression ni l’indice sur les tâches à questions ; une tâche hors CHAINS les garde', () => {
    for (const level of ['beginner', 'advanced']) {
      const out = html({ ...LV[level].numbers, level });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ tasks: [{ id: 'zz', n: 12, k: 0, legs: ['5/12'] }], levels: false });
    expect(r).toContain('data-manipulation-progress');
  });
});
