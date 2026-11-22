import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import PythagorasTanks, { Formal, discoveryOptions, numbersFor } from './PythagorasTanks';
import { LEVELS } from '../levels';
import * as L from '../logic/pythagorasTanks';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<PythagorasTanks {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.pythagorasTanks.${key}`, o);
/** Les seuls mots latins permis : les noms de points et de côtés, et l'unité cm / cm². */
const latin = (out) => (text(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !/^(AB|AC|BC|ABC|cm)$/.test(w));

const LV = LEVELS['pythagoras-tanks'];
const cases = {
  'angle (مبتدئ)': { ...LV.beginner.numbers, level: 'beginner' },
  'length (متقدم)': { ...LV.advanced.numbers, level: 'advanced' },
};

describe('pythagoras-tanks — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders, no raw key, no {{, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-pythagoras-tanks');
      expect(out).toContain('data-pt-glance');
      expect(out).toContain('data-pt-handle');
      expect(out).toContain('data-pt-pour');
      expect(out).toContain('data-pt-free');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(latin(out)).toEqual([]);
    });
  }

  it('opens on its CONTEXT then ONE question (MANIPULATION_DNA §17.9), no visible title', () => {
    const out = html(cases['angle (مبتدئ)']);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out.indexOf('data-lab-context')).toBeLessThan(out.indexOf('data-lab-question'));
    expect(text(out)).toContain(say('question.fill'));
  });

  it('angle: three tanks, two full, the slider at 60°, no verdict, no right-angle mark, no formal block', () => {
    const out = html(cases['angle (مبتدئ)']);
    expect(out).toContain('data-mode="angle"');
    expect(out).toContain('data-task="fill"');
    expect([...out.matchAll(/data-pt-tank="(\w+)"/g)].map((m) => m[1])).toEqual(['ab', 'ac', 'bc']);
    expect([...out.matchAll(/data-pt-water="(\w+)"/g)].map((m) => m[1])).toEqual(['ab', 'ac']);
    expect(out).toContain('aria-valuenow="60"');
    expect(text(out)).toContain('AC = 3');
    expect(text(out)).toContain('AB = 4');
    expect(out).toContain('data-pt-label="AB"');
    expect(out).not.toContain('data-pt-verdict');
    expect(out).not.toContain('data-pt-right');
    expect(out).not.toContain('data-pt-formal');
    expect(out).not.toContain('data-pt-calculator');
  });

  it('length: the tape BC is shown, the calculator is locked, the angle is not', () => {
    const out = html(cases['length (متقدم)']);
    expect(out).toContain('data-mode="length"');
    expect(out).toContain('data-pt-bc=');
    expect(out).toContain('data-pt-root-locked');
    expect(out).not.toMatch(/aria-valuetext="\d+°"/);
  });

  it('a girl in hijab presents the machine (KidFigure)', () => {
    const out = html(cases['angle (مبتدئ)']);
    expect(out).toContain('data-pt-kid');
    expect(out).toContain('data-mood="wonder"');
  });

  it('says each thing ONCE: the gesture is not in the question, the question is not in the banner', () => {
    const out = text(html(cases['angle (مبتدئ)']));
    const q = say('question.fill');
    expect(out.split(q).length - 1).toBe(1);
    expect(q).not.toContain('−/+');
  });

  it('numbersFor follows the level presets', () => {
    expect(numbersFor({ level: 'beginner' })).toEqual(LV.beginner.numbers);
    expect(numbersFor({ level: 'advanced' })).toEqual(LV.advanced.numbers);
    expect(numbersFor({ mode: 'angle', b: 6, c: 8 })).toEqual({ mode: 'angle', b: 6, c: 8 });
  });

  it('discovery: the wrong conjectures are refuted with the student’s own pours; formal writes his numbers', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.pour(s);
    s = L.pour(L.setAngle(s, 90));
    s = L.nextTask(s);
    s = L.pour(L.setAngle(s, 115));
    const k = (key, o) => say(key, o);
    const opts = discoveryOptions(s, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    expect(opts[0].why).toContain('60°');
    expect(opts[2].why).toContain('115°');
    const formal = renderToString(<Formal lab={s} k={k} />);
    expect(text(formal)).toContain('5² = 16 + 9 = 25');
    expect(formal).toContain('data-pt-formal-not');

    let t = L.init(LV.advanced.numbers);
    t = L.pour(L.setTenths(t, 130));
    t = L.nextTask(t);
    t = L.pour(L.setTenths(t, 36));
    t = L.pour(L.setTenths(t, 37));
    t = L.pour(L.useRoot(t));
    const f2 = text(renderToString(<Formal lab={t} k={k} />));
    expect(f2).toContain('13² = 144 + 25 = 169');
    expect(f2).toContain('BC = √13 ≈ 3,61');
    expect(discoveryOptions(t, k)[0].why).toContain('13');
  });

  it('coach strings never state the rule', () => {
    for (const id of ['turn', 'stretch', 'pour', 'again', 'next', 'turn2', 'pour2', 'root', 'pourRoot']) {
      const s = say(`coach.${id}`);
      expect(s).not.toMatch(/قائمة|90|²|=/); // « − و + » nomme les boutons, jamais une égalité
    }
  });
});

describe('pythagoras-tanks — questions pendant le labo (LabCheckpoint, lot 6)', () => {
  it('chaque tâche de chaque niveau : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { CHAINS, QUESTIONS } = await import('./PythagorasTanks');
    for (const [tag, numbers] of [['angle', LV.beginner.numbers], ['length', LV.advanced.numbers]]) {
      let s = L.init(numbers);
      if (tag === 'angle') {
        s = L.pour(L.setAngle(s, 90));
        s = L.nextTask(s);
        s = L.pour(L.setAngle(s, 60));
        s = L.pour(L.setAngle(s, 120));
        s = L.pour(L.setAngle(s, 90));
      } else {
        s = L.pour(L.setTenths(s, 130));
        s = L.nextTask(s);
        s = L.pour(L.setTenths(s, 36));
        s = L.pour(L.setTenths(s, 37));
        s = L.pour(L.useRoot(s));
      }
      s.tasks.forEach((tk, i) => {
        const at = { ...s, ti: i };
        expect(CHAINS[tk.id], `${tag}.${tk.id}`).toBeTruthy();
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid](at, say);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tag}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tag}.${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
    }
  });

  it('les réponses attendues viennent des nombres de la tâche : 25, 169, 13', async () => {
    const { QUESTIONS } = await import('./PythagorasTanks');
    const a = L.init(LV.beginner.numbers);
    expect(QUESTIONS.water(a, say).expected).toBe('25');
    const b = L.init(LV.advanced.numbers);
    expect(QUESTIONS.water(b, say).expected).toBe('169');
    expect(QUESTIONS.water({ ...b, ti: 1 }, say).expected).toBe('13');
  });

  it('« أعِد التجربة » efface les versements de la tâche seule et remet la machine au départ', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.pour(L.setAngle(s, 90));       // plein : fill faite
    expect(s.done).toEqual([true, false]);
    s = L.nextTask(s);
    s = L.pour(L.setAngle(s, 60));
    s = L.pour(L.setAngle(s, 120));
    expect(L.taskDone(s)).toBe(true);
    const r = L.restartTask(s);
    expect(L.taskDone(r)).toBe(false);
    expect(r.done[0]).toBe(true);
    expect(r.trials.every((t) => t.task !== 'compare')).toBe(true);
    expect(r.trials.some((t) => t.task === 'fill')).toBe(true);
    expect(r.pour).toBe(null);
    expect(r.angle).toBe(60);
  });

  it('mode guidé : ni la progression ni le bouton d’indice quand les questions sont actives ; deux pastilles LabStepper', () => {
    for (const props of [{ ...LV.beginner.numbers, level: 'beginner' }, { ...LV.advanced.numbers, level: 'advanced' }]) {
      const out = html(props);
      expect(out).not.toContain('data-manipulation-progress');
      expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      expect(out).toContain('data-lab-stepper');
      expect([...out.matchAll(/data-pt-step="/g)]).toHaveLength(2);
    }
  });
});
