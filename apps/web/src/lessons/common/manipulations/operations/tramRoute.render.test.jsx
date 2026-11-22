import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import TramRoute, { CHAINS, QUESTIONS } from './TramRoute';
import { LEVELS } from '../levels';
import * as L from '../logic/tramRoute';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TramRoute {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, (m) => m.replace(/<(?!\/?text)[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.tramRoute.${key}`, o);
const LV = LEVELS['tram-route'];
const HOOKS = ['data-tram-route', 'data-tr-glance', 'data-tr-stage', 'data-tr-world', 'data-tr-counter', 'data-tr-plan', 'data-tr-verdict', 'data-tr-free', 'data-tr-free-start', 'data-tr-free-add'];

describe('tram-route — rendu', () => {
  it('مبتدئ : la scène, le ruban de la chaîne avec ses puces, les compteurs, « انطلق » et le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of [...HOOKS, 'data-tr-strip', 'data-tr-op="0"', 'data-tr-op="1"', 'data-tr-go', 'data-tr-clear']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-tr-next');
    expect(out).not.toContain('data-tr-builder');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['DA', 'km', 'a', 'b', 'c', 'x', 't'].includes(w));
    expect(words).toEqual([]);
  });

  it('متقدم : on écrit d\'abord la chaîne (plaques et puces), le ruban n\'existe pas encore', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    for (const hook of [...HOOKS, 'data-tr-builder', 'data-tr-bank', 'data-tr-check', 'data-tr-slot="0"']) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-tr-strip');
    expect(out).not.toContain('data-tr-go');
    expect(out).not.toMatch(RAW);
  });

  it('ouvre sur son CONTEXTE puis UNE question qui nomme le but (§17.9), sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain('في العربة 26 تلميذًا. في محطة السوق نزل 9، وفي محطة الجامعة صعد 4.');
    expect(t).toContain(k('question.stamp'));
    expect(out).toMatch(/<h3 class="sr-only">/);
  });

  it('dit chaque chose UNE fois : la consigne, la question, le titre du panneau libre', () => {
    const t = text(html({ ...LV.beginner.numbers, level: 'beginner' }));
    const count = (s) => t.split(s).length - 1;
    expect(count(k('question.stamp'))).toBe(1);
    expect(count('في العربة 26 تلميذًا')).toBe(1);
    expect(count(k('free.title'))).toBe(1);
    expect(count(k('idle.stamp'))).toBe(1);
  });

  it('le kiosque (t3) dessine le carnet de six tickets', () => {
    const out = html({ tasks: [L.PRESETS.beginner.tasks[2]], levels: false });
    expect(out).toContain('data-tr-kiosk');
    expect(out).toContain(k('story.t3').slice(0, 20));
    expect(out).not.toMatch(RAW);
  });

  it('le monde « mixed » de معارف : une seule tâche, 50 − 4 × 6 + 30 ÷ 5, quatre puces', () => {
    const out = html({ ...L.PRESETS.alone, levels: false });
    expect(out).toContain('data-world="mixed"');
    for (const i of [0, 1, 2, 3]) expect(out).toContain(`data-tr-op="${i}"`);
    expect(text(out)).toContain('30 تلميذًا ينتظرون');
  });

  it('chaque tâche des deux niveaux a une histoire écrite (aucune clé brute)', () => {
    for (const lv of ['beginner', 'advanced']) for (const tk of LV[lv].numbers.tasks) expect(k(`story.${tk.id}`), tk.id).not.toMatch(RAW);
  });
});

describe('tram-route — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question de chaque tâche : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const lv of ['beginner', 'advanced']) {
      const s = L.init(LV[lv].numbers);
      s.tasks.forEach((tk, i) => {
        expect(CHAINS[tk.id], tk.id).toBeTruthy();
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid]({ ...s, ti: i }, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
            q.options.filter((o) => !o.correct).forEach((o) => expect(o.why, `${tk.id}.${qid}`).toBeTruthy());
          } else expect(q.expected, `${tk.id}.${qid}`).toBeTruthy();
        }
      });
    }
  });

  it('les clés des questions sont exactes : t1 → 9 · t3 → 25 · t4 → 12 ; a1 → 20 · a2 → 3,2 · a3 → 15', () => {
    const b = L.init(LV.beginner.numbers); const a = L.init(LV.advanced.numbers);
    expect(QUESTIONS.realStop(b, b.tasks[0], k).expected).toBe('9');
    expect(QUESTIONS.unitPrice(b, b.tasks[2], k).expected).toBe('25');
    expect(QUESTIONS.groupsTotal(b, b.tasks[3], k).expected).toBe('12');
    expect(QUESTIONS.groupsTotal(a, a.tasks[0], k).expected).toBe('20');
    expect(QUESTIONS.groupsTotal(a, a.tasks[1], k).expected).toBe('3,2');
    expect(QUESTIONS.carShare(a, a.tasks[2], k).expected).toBe('15');
    expect(QUESTIONS.groupsTotal(a, a.tasks[2], k).expected).toBe('18');
  });

  it('le texte des mauvais plans est dit avec SES nombres (13 · 43 · 6,25 · 72)', () => {
    const b = L.init(LV.beginner.numbers);
    const flat = (q) => renderToString(<div>{q.options.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}</div>).replace(/[⁦⁩]/g, '');
    expect(flat(QUESTIONS.rule1(b, b.tasks[1], k))).toContain('13');
    expect(flat(QUESTIONS.absurdPrice(b, b.tasks[2], k))).toContain('6,25');
    expect(flat(QUESTIONS.rule3(b, b.tasks[3], k))).toContain('72');
  });
});

describe('tram-route — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('مبتدئ et متقدم : ni la progression ni le bouton d\'indice ; une tâche hors `CHAINS` : les deux restent', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LV[lv].numbers, level: lv });
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    }
    const r = html({ ...L.PRESETS.alone, levels: false });
    expect(r).toContain('data-manipulation-progress');
    expect(r).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
