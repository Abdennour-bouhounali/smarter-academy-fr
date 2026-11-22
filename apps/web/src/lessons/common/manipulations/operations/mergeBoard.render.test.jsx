import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import MergeBoard, { discoveryOptions, Formal } from './MergeBoard';
import { LEVELS } from '../levels';
import * as L from '../logic/mergeBoard';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<MergeBoard {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.mergeBoard.${key}`, o);
const LV = LEVELS['merge-board'];
const HOOKS = ['data-merge-board', 'data-mb-glance', 'data-mb-stage', 'data-mb-board', 'data-mb-tile', 'data-mb-chip', 'data-mb-pads', 'data-mb-pad', 'data-mb-verdict', 'data-mb-free', 'data-mb-free-input', 'data-mb-kid', 'data-mb-score'];

describe('merge-board — rendu', () => {
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : la vue d'ensemble, la borne, le panneau libre ; ni clé brute ni prose latine`, () => {
      const out = html({ ...LV[level].numbers, level });
      for (const hook of HOOKS) expect(out, hook).toContain(hook);
      expect(out).not.toContain('data-mb-next');
      expect(out).not.toContain('data-mb-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 't', 'd', 'N'].includes(w));
      expect(words).toEqual([]);
    });
  }

  it('مبتدئ : barres signées visibles ; متقدم : barres cachées', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    const a = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(b).toContain('data-mb-bar="neg"');
    expect(b).toContain('data-mb-bar="pos"');
    expect(b).not.toContain('data-mb-bar="hidden"');
    expect(a).toContain('data-mb-bar="hidden"');
    expect(a).not.toContain('data-mb-bar="neg"');
  });

  it('c4 : l\'aimant est dessiné ; a1 : la bulle ; a3 : la barre de fraction', () => {
    const c4 = html({ tasks: [{ id: 'c4', chain: '7/3 - 8/15 ÷ 11/20' }], levels: false });
    expect(c4).toContain('data-mb-magnet');
    const a1 = html({ tasks: [{ id: 'a1', chain: '(2/3 - 5/2) × -6/11' }], levels: false });
    expect(a1).toContain('data-mb-bubble');
    const a3 = html({ tasks: [{ id: 'a3', chain: '(1/2 - 4/3)@(5/6 + -3/4)' }], levels: false });
    expect(a3).toContain('data-mb-bar-rail');
    expect((a3.match(/data-mb-tile/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(text(out)).toContain(k('question.board'));
    expect(text(out)).toContain(k('lead'));
  });

  it('monde signs : paire déjà choisie, pavés actifs, sans bouton de retournement', () => {
    const out = html({ ...L.PRESETS.signs, levels: false });
    expect(out).toContain('data-world="signs"');
    expect(out).not.toContain('data-mb-flip');
    expect(out).not.toMatch(/data-mb-pad="true"[^>]* disabled=""/);
  });
});

describe('merge-board — chaînes de texte', () => {
  it('toutes les clés existent et ne laissent aucune interpolation brute', () => {
    for (const key of ['title', 'lead', 'question.board', 'question.signs', 'question.free', 'idle.pair', 'idle.sign', 'idle.flip', 'free.title', 'free.hint', 'coach.pair', 'coach.sign', 'coach.flip', 'coach.magnet', 'coach.bubble',
      'refuse.noflip', 'refuse.dividend', 'refuse.zero', 'refuse.bubble', 'refuse.order', 'refuse.magnetPlain', 'pads.plus', 'pads.minus', 'flip.label', 'discovery.prompt', 'formal.order']) {
      const v = k(key);
      expect(v, key).not.toMatch(RAW);
      expect(v.length, key).toBeGreaterThan(2);
    }
  });
  it('découverte : trois formulations dont une juste ; règle formelle', () => {
    const opts = discoveryOptions(k);
    expect(opts).toHaveLength(3);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const f = renderToString(<Formal k={k} />);
    expect(f).toContain('data-mb-formal');
    expect(f).not.toMatch(RAW);
  });
});

describe('merge-board — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque tâche : chaque question a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./MergeBoard');
    const tasks = [...LV.beginner.numbers.tasks, ...LV.advanced.numbers.tasks, ...L.PRESETS.signs.tasks];
    const s = L.init({ tasks });
    for (const tk of s.tasks) {
      const chain = CHAINS[tk.id];
      if (!chain) { expect(['s1', 's2', 's3', 's4', 's5'], tk.id).toContain(tk.id); continue; }
      for (const qid of chain) {
        const q = QUESTIONS[qid](s, tk, k);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
        expect(out, `${tk.id}.${qid}`).not.toContain('{{');
        expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
        else expect(q.expected).toBeTruthy();
      }
    }
    const byId = (id) => s.tasks.find((t) => t.id === id);
    expect(QUESTIONS.commonDen(s, byId('c1'), k).expected).toBe('12');
    expect(QUESTIONS.toDen(s, byId('c1'), k).expected).toBe('15');
    expect(QUESTIONS.prodDen(s, byId('c2'), k).expected).toBe('65');
    expect(QUESTIONS.simplify(s, byId('c3'), k).expected).toBe('3');
    expect(QUESTIONS.divResult(s, byId('c4'), k).expected).toBe('32');
    expect(QUESTIONS.lastDen(s, byId('c4'), k).expected).toBe('33');
    expect(QUESTIONS.finalAbs(s, byId('a3'), k).expected).toBe('10');
  });
});

describe('merge-board — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ (questions) : ni la progression ni le bouton d’indice ; les étapes sont un LabStepper', () => {
    const b = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(b).toContain('data-lab-stepper');
    expect(b).toContain('data-mb-step');
  });
});
