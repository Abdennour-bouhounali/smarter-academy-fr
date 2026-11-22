import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import KitPacker, { CHAINS, QUESTIONS, labelsOf } from './KitPacker';
import { LEVELS } from '../levels';
import * as L from '../logic/kitPacker';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<KitPacker {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.kitPacker.${key}`, o);
const LV = LEVELS['kit-packer'];
const HOOKS = ['data-kit="true"', 'data-kit-glance', 'data-kit-belt', 'data-kit-deal', 'data-kit-counter="fatima"', 'data-kit-counter="ali"', 'data-kit-free', 'data-kit-verdict', 'data-kit-fatima', 'data-kit-ali'];

describe('kit-packer — rendu', () => {
  it('مبتدئ : deux distributeurs à cadran, six cartables, « وزّع », les compteurs et le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of [...HOOKS, 'data-kit-dial="n"', 'data-kit-dial="m"', 'data-kit-dial-plus="n"', 'data-kit-dial-minus="m"', 'data-kit-bag="5"']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-kit-bag="6"');
    expect(out).not.toContain('data-kit-predict');
    expect(out).not.toContain('data-kit-next');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(prose(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
  });
  it('متقدم : la prédiction d\'abord (a1), puis les distributeurs atténués', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    for (const hook of [...HOOKS.filter((h) => h !== 'data-kit-verdict'), 'data-kit-predict', 'data-kit-predict-input', 'data-kit-predict-lock', 'data-kit-split-p', 'data-kit-split-q']) expect(out, hook).toContain(hook);
    expect(out).not.toMatch(RAW);
  });
  it('k4 : distributeurs verrouillés et le cadran des cartables ; a2 : rubans en mètres', () => {
    const k4 = html({ tasks: LV.beginner.numbers.tasks.slice(3), levels: false });
    expect(k4).toContain('data-locked="true"'); expect(k4).toContain('data-kit-dial="k"');
    const a2 = html({ tasks: LV.advanced.numbers.tasks.slice(1, 2), levels: false });
    expect(text(a2)).toContain(k('dispenser.red'));
  });
  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context'); expect(out).toContain('data-lab-question');
    expect(text(out)).toContain(k('question.k1'));
    expect(out).toMatch(/<h3 class="sr-only">/);
  });
  it('dit chaque chose UNE fois', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.k1'))).toBe(1);
    expect(count(k('free.title'))).toBe(1);
  });
  it('le monde de معارف : un seul chargement', () => {
    const out = html({ ...L.PRESETS.alone, levels: false });
    expect(out).toContain('data-kit-dial="n"');
    expect(text(out)).toContain(k('question.m1'));
  });
  it('chaque tâche des deux niveaux a son histoire, sa question et ses étiquettes', () => {
    for (const lv of ['beginner', 'advanced']) for (const tk of LV[lv].numbers.tasks) {
      for (const key of [`story.${tk.id}`, `question.${tk.id}`]) expect(k(key), key).not.toMatch(RAW);
      if (tk.kind === 'fill') { const lb = labelsOf(L.buildTask(tk)); for (const key of [`dispenser.${lb.a}`, `dispenser.${lb.b}`, `what.${lb.what}`]) expect(k(key), key).not.toMatch(RAW); }
    }
    for (const key of ['v.ready', 'v.short', 'v.extra', 'v.unequal', 'v.unequalEmpty', 'v.pack', 'v.split', 'v.splitOk', 'predict.miss', 'free.why.limit', 'coach.deal', 'dispenser.rolls', 'dispenser.small', 'dispenser.bags']) expect(k(key), key).not.toMatch(RAW);
  });
});

describe('kit-packer — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    const s = L.init(LV.beginner.numbers);
    for (const tid of Object.keys(CHAINS)) for (const qid of CHAINS[tid]) {
      const q = QUESTIONS[qid](s, s.tasks[0], k);
      const out = renderToString(<div>{q.prompt}{q.options.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, qid).not.toMatch(RAW);
      expect(out, qid).not.toContain('{{');
      expect(q.hints, qid).toHaveLength(2);
      expect(q.options.filter((o) => o.correct), qid).toHaveLength(1);
      q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, qid).toBeTruthy());
    }
    expect(Object.keys(CHAINS)).toEqual(['k1', 'k2', 'k3', 'k4', 'a1', 'a3']);
  });
  it('mode guidé : ni la progression ni l\'indice quand une suite existe ; l\'exercice seul garde les deux', () => {
    expect(html({ ...LV.beginner.numbers, level: 'beginner' })).not.toContain('data-manipulation-progress');
    expect(html({ ...L.PRESETS.alone, levels: false })).toContain('data-manipulation-progress');
  });
});
