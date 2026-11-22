import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ZeroProbe, { discoveryOptions, discoveryKey, numbersFor, chainOf, QUESTIONS } from './ZeroProbe';
import { layout, labelBoxes, overlaps, minus } from './zeroProbe/geometry';
import { LEVELS } from '../levels';
import * as L from '../logic/zeroProbe';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<ZeroProbe {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const k = (key, o) => i18n.t(`lesson:manipulation.zeroProbe.${key}`, o);
const LV = LEVELS['zero-probe'];
const cases = {
  beginner: { level: 'beginner' },
  advanced: { level: 'advanced' },
};
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));

describe('zero-probe — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: the glance, the stage, the knob slider, the sides, −/+, the none button; no raw key, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-zero-probe');
      expect(out).toContain('data-world="sea"');
      expect(out).toContain('data-zp-glance');
      expect(out).toContain('data-zp-stage');
      expect(out).toContain('data-zp-svg');
      expect(out).toContain('data-zp-knob');
      expect(out).toContain('role="slider"');
      expect(out).toContain('data-zp-cable');
      expect(out).toContain('data-zp-b=');
      expect(out).toContain('data-zp-side="above"');
      expect(out).toContain('data-zp-side="below"');
      expect(out).toContain('data-zp-less');
      expect(out).toContain('data-zp-more');
      expect(out).toContain('data-zp-d=');
      expect(out).toContain('data-zp-readout');
      expect(out).toContain('data-zp-none');
      expect(out).toContain('data-zp-verdict=""');
      expect(out).toContain('data-zp-kid');
      expect(out).toContain('data-zp-free');
      expect(out).not.toContain('data-zp-next');
      expect(out).not.toContain('data-zp-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []);
      expect(words).toEqual([]);
    });
  }

  it('beginner opens on A, the cable length is d = 0 and the knob is a slider on d', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-zp-a');
    const cable = out.match(/<g data-zp-cable[^>]*>/)[0];
    expect(cable).toContain('data-d="0"');
    expect(out).toMatch(/aria-valuenow="0"/);
    expect(out).toContain('aria-valuemax="10"');
    expect(out).toContain('data-task="0"');
    expect(out).toContain('data-layout=');
  });

  it('opens on its CONTEXT then ONE question that names the goal (§17.9) — no visible title', () => {
    const out = html(cases.beginner);
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    const t = text(out);
    expect(t).toContain(k('question.lower'));
    expect(t.indexOf(k('context.beatBelow', { a: '' }).slice(0, 16))).toBeLessThan(t.indexOf(k('question.lower')));
    expect(out).toContain('class="sr-only"');
    // les nombres de la tâche sont dans le contexte, pas dans la question
    expect(k('question.lower')).not.toMatch(/\d/);
    const adv = text(html(cases.advanced));
    expect(adv).toContain('−4,5');
    expect(adv).toContain('−4,3');
    expect(adv).toContain(k('question.between'));
  });

  it('relative numbers are LTR isolates with the REAL minus sign — never an ASCII hyphen on screen', () => {
    const out = html(cases.beginner);
    const ctx = out.match(/<p[^>]*data-lab-context[^>]*>[\s\S]*?<\/p>/)[0];
    expect(ctx).toContain('⁦−3⁩');
    expect(text(out)).not.toMatch(/\d-\d|[ (]-\d/);
    const adv = html(cases.advanced);
    expect(adv).toContain('⁦−4,5⁩');
    expect(adv.match(/<text[^>]*unicode-bidi:isolate[^>]*>[^<]*−4,5/)).toBeTruthy();
    expect(minus('-4,5')).toBe('−4,5');
    // les pastilles de la scène et la lecture sont dans des îlots
    expect(out).toContain('<bdi dir="ltr"');
  });

  it('says each thing ONCE: the gesture line is the idle verdict, not repeated as a hint', () => {
    const t = text(html(cases.beginner));
    expect(t.split(k('idle')).length - 1).toBe(1);
    for (const h of [0, 1, 2]) expect(k(`hints.${h}`)).not.toContain('اسحب');
    // la question n'est pas répétée dans le contexte
    expect(t.split(k('question.lower')).length - 1).toBe(1);
  });

  it('the coach never states the rule; discovery options refute with the student’s own trials', () => {
    for (const id of ['grab', 'try', 'side', 'decide', 'next']) {
      expect(k(`coach.${id}`)).not.toMatch(/أخفض|أعلى|أصغر|أكبر|سالب|موجب|أبعد|مسافة/);
    }
    const s = L.init(LV.beginner.numbers);
    const opts = discoveryOptions(s, false, k);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    expect(opts[1].correct).toBe(true);
    expect(opts[0].why).toContain('A أبعد');
    expect(discoveryKey(false)).toBe('far');
    expect(discoveryKey(true)).toBe('mix');
    const adv = discoveryOptions(L.init(LV.advanced.numbers), true, k);
    expect(adv.filter((o) => o.correct)).toHaveLength(1);
    expect(adv[0].why).toContain('−0,3');
  });

  it('the textbook-free wording and no rule before the discovery', () => {
    const all = JSON.stringify(i18n.t('lesson:manipulation.zeroProbe', { returnObjects: true }));
    expect(all.length).toBeGreaterThan(500);
    expect(all).not.toMatch(/الكتاب|ص \d/);
    for (const key of ['context.beatBelow', 'context.beatAbove', 'context.beatFree', 'context.between', 'question.lower', 'question.higher', 'idle']) {
      expect(k(key)).not.toMatch(/أكبر مسافة|الأبعد|أصغر هو/);
    }
  });

  it('numbersFor: the level gives the step, the lesson may give its own tasks', () => {
    expect(numbersFor({ level: 'advanced' }).step).toBe('0,1');
    expect(numbersFor({ level: 'beginner' }).step).toBe('1');
    const mine = [{ kind: 'beat', a: '-2', side: 'below', want: 'lower' }];
    expect(numbersFor({ tasks: mine, level: 'beginner' }).tasks).toBe(mine);
  });
});

describe('zero-probe — la scène : aucune étiquette ne se chevauche', () => {
  /** Les largeurs de scène aux cinq tailles : colonne de leçon ≈ 414 px à 1024×768, jusqu’à un grand écran. */
  const WIDTHS = [340, 378, 520, 640, 760, 900, 1100];
  const HEIGHTS = [290, 322, 360, 440];
  const taskSets = [...L.PRESETS.beginner, ...L.PRESETS.advanced, { kind: 'beat', a: '9,9', side: null, want: 'lower' }, { kind: 'beat', a: '-9,9', side: null, want: 'lower' }];

  it('A, B, d, les bornes et les graduations ne se touchent jamais : tous d, les deux côtés, 7 largeurs, 4 hauteurs', () => {
    let checked = 0;
    const problems = [];
    for (const W of WIDTHS) {
      for (const H of HEIGHTS) {
        const geo = layout(W, H);
        for (const task of taskSets) {
          const marks = task.kind === 'between' ? [{ id: 'lo', text: task.lo }, { id: 'hi', text: task.hi }] : [{ id: 'a', text: task.a }];
          for (let dh = 0; dh <= 1000; dh += 10) {
            for (const side of ['above', 'below']) {
              const d = dh / 100;
              const dText = String(d).replace('.', ',');
              const value = side === 'below' && dh > 0 ? `-${dText}` : dText;
              const boxes = labelBoxes(geo, { marks, value, dText, d, side });
              const where = `W${W} H${H} ${JSON.stringify(task)} d${d} ${side}`;
              for (const pair of overlaps(boxes)) problems.push(`${where}: ${pair.join('×')}`);
              for (const b of boxes) {
                if (b.box.x0 < 0 || b.box.x1 > W || b.box.y0 < 0 || b.box.y1 > H) problems.push(`${where}: ${b.id} hors de la scène`);
              }
              checked += 1;
            }
          }
        }
      }
    }
    expect(problems.slice(0, 5)).toEqual([]);
    expect(checked).toBeGreaterThan(10000);
  }, 30000);

  it('B reste à gauche de l’axe : la pastille de B n’atteint jamais les graduations', () => {
    for (const W of WIDTHS) {
      const geo = layout(W, 330);
      const boxes = labelBoxes(geo, { marks: [{ id: 'a', text: '-3' }], value: '-10', dText: '10', d: 10, side: 'below' });
      expect(boxes.find((b) => b.id === 'b').box.x1).toBeLessThan(geo.axisX - 4);
    }
  });
});

describe('zero-probe — questions pendant le labo (LabCheckpoint)', () => {
  const insert = { world: 'sea', step: '1', tasks: [{ kind: 'between', lo: '-7', hi: '-5', side: null }, { kind: 'between', lo: '3', hi: '6', side: null }] };
  for (const [name, numbers, adv] of [['beginner', LV.beginner.numbers, false], ['advanced', LV.advanced.numbers, true], ['insert', insert, false]]) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(numbers);
      lab.tasks.forEach((tk, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, tk.id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, i, k, adv);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          else expect(q.expected).toBeTruthy();
        }
      });
      expect(chainOf(lab, lab.tasks.length - 1).at(-1)).toBe('rule');
    });
  }
  it('les réponses suivent SES essais : −5 sous −3 → « < » et un câble plus long', () => {
    let s = L.init(LV.beginner.numbers);
    s = L.release(s, 500);
    expect(L.taskDone(s)).toBe(true);
    expect(QUESTIONS.compare(s, 0, k).options[0].correct).toBe(true);
    expect(QUESTIONS.cable(s, 0, k).options[0].correct).toBe(true);
    expect(chainOf(s, 3)).toEqual(['whyNone', 'zeroOrder', 'rule']);
    const r = L.retryTask(s);
    expect(L.taskDone(r)).toBe(false);
    expect(r.ti).toBe(0);
  });
});

describe('zero-probe — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
