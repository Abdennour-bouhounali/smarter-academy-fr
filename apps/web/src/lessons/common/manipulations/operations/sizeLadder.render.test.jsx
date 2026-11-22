import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import SizeLadder, { discoveryOptions, Formal, CHAINS, QUESTIONS } from './SizeLadder';
import * as SL from '../logic/sizeLadder';
import { LEVELS } from '../levels';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<SizeLadder {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.sizeLadder.${key}`, o);
const LV = LEVELS['size-ladder'];
const HOOKS = ['data-size-ladder', 'data-sl-glance', 'data-sl-stage', 'data-sl-window', 'role="slider"', 'data-sl-rung="2"', 'data-sl-rung="-4"', 'data-sl-card="minaret"', 'data-sl-tag', 'data-sl-banner', 'data-sl-free', 'data-sl-free-input', 'data-sl-kid'];

describe('size-ladder — rendu', () => {
  it('مبتدئ : mur, barreaux, carte en attente, bannière, panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of HOOKS) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-sl-typed');
    expect(out).not.toContain('data-sl-next');
    expect(out).not.toContain('data-sl-formal');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(prose(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    // les neuf cases d'un barreau
    expect((out.match(/data-sl-cell="2:/g) ?? []).length).toBe(9);
  });
  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(text(out)).toContain('كل درجة تبدأ عند قوة للعدد 10');
    expect(text(out)).toContain('علّق كل بطاقة على درجتها');
  });
  it('dit chaque chose UNE fois : une carte en attente, une bannière, aucune carte sur le mur avant le geste', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect((out.match(/data-sl-card="minaret"/g) ?? []).length).toBe(1);
    expect((out.match(/data-sl-banner[ =>]/g) ?? []).length).toBe(1);
    expect(text(out).replace(/\s/g, '')).toContain('265م');
  });
  it('متقدم : la saisie de a et n précède la suspension', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-sl-typed');
    expect(out).toContain('data-sl-input="a"');
    expect(out).toContain('data-sl-input="n"');
    expect(text(out).replace(/\s/g, '')).toContain('1200كم');
    expect(out).not.toMatch(RAW);
  });
});

describe('size-ladder — chaînes de texte', () => {
  it('toutes les clés existent et ne laissent aucune interpolation brute', () => {
    const keys = ['title', 'context.first', 'context.again', 'context.typed', 'context.compare', 'context.free', 'question.hang', 'question.typed', 'question.compare', 'scene.aria', 'cards.minaret', 'cards.bus', 'cards.sheet', 'cards.sugar', 'cards.coast', 'cards.hair', 'cards.earth', 'cards.cardA', 'cards.cardB', 'cards.free', 'cards.tray',
      'cardsShort.sugar', 'cardsShort.sheet', 'unitSym.m', 'unitSym.km', 'rung.aria', 'up', 'down', 'cellLeft', 'cellRight', 'dock', 'magnet', 'magnetOff', 'next', 'retry', 'pick', 'input.a', 'input.n', 'input.go', 'input.aria',
      'readout.tray', 'readout.type', 'readout.rung', 'readout.cell', 'readout.cellPick', 'readout.placed', 'readout.magnet', 'readout.pick',
      'refuse.below', 'refuse.above', 'refuse.cellBefore', 'refuse.cellAfter', 'refuse.typedValue', 'refuse.typedForm', 'refuse.typedInvalid', 'refuse.compareSame', 'refuse.compareRungs',
      'v.rung', 'v.dock', 'v.magnet', 'v.magnetCarry', 'v.typedOk', 'v.crown', 'v.solved', 'v.custom', 'v.freeNote', 'free.title', 'free.hint', 'free.on', 'free.add', 'free.back', 'free.refusal.invalid', 'free.refusal.zero', 'free.refusal.neg', 'free.refusal.digits', 'free.refusal.range',
      'coach.card', 'coach.rung', 'coach.cell', 'coach.magnet', 'coach.type', 'coach.pick', 'coach.next', 'coach.free', 'hints.0', 'hints.1', 'hints.2', 'explanation', 'discovery.sci.prompt', 'discovery.order.prompt'];
    for (const key of keys) {
      const v = k(key, { v: '265', b: '100', p: '10^{2}', w: '2{,}65\\times10^{2}', got: '0,48', want: '0,000048', lo: '10^{2}', hi: '10^{3}', c: '2', c1: '3', n: 2, n1: 3, i: 1 });
      expect(v, key).not.toMatch(RAW);
      expect(v, key).not.toContain('{{');
      expect(v.length, key).toBeGreaterThan(0);
    }
  });
  it('découverte : trois formulations dont une juste, pour chaque niveau ; règle formelle', () => {
    for (const kind of ['sci', 'order']) {
      const opts = discoveryOptions(k, kind);
      expect(opts).toHaveLength(3);
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
      const f = renderToString(<Formal k={k} kind={kind} />);
      expect(f).toContain('data-sl-formal');
      expect(f).not.toMatch(RAW);
    }
  });
  it('la prose ne dit pas la règle avant la découverte (consigne, coach, indices)', () => {
    const early = ['context.first', 'context.again', 'context.typed', 'context.compare', 'question.hang', 'question.typed', 'question.compare', 'coach.card', 'coach.rung', 'coach.cell', 'coach.magnet', 'coach.type', 'coach.pick', 'hints.0', 'hints.1', 'hints.2'].map((x) => k(x)).join(' ');
    expect(early).not.toMatch(/أقل من 10|نقرّب|ن حذف|الأسّ يساوي|عدد الأرقام/);
  });
});

describe('size-ladder — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question de chaque tâche des deux niveaux : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{ ni $ brut', () => {
    for (const lv of ['beginner', 'advanced']) {
      const base = SL.init(LV[lv].numbers);
      base.tasks.forEach((tk, i) => {
        expect(CHAINS[tk.id], tk.id).toBeTruthy();
        const lab = { ...base, ti: i };
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid](lab, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(out, `${tk.id}.${qid}`).not.toMatch(/(^|[^\\])\$[^<]*\$/);
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
          expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${tk.id}.${qid} why`).toBe(true);
          expect(new Set(q.options.map((o) => renderToString(<span>{o.text}</span>))).size, `${tk.id}.${qid} distinct`).toBe(q.options.length);
        }
      });
    }
  });
  it('la dernière tâche de chaque niveau finit par la règle ; la place de la bonne réponse varie', () => {
    expect(CHAINS.c4.at(-1)).toBe('rule');
    expect(CHAINS.c8.at(-1)).toBe('rule');
    const base = SL.init(LV.beginner.numbers);
    const slots = new Set(base.tasks.slice(0, 3).map((tk, i) => QUESTIONS.sci({ ...base, ti: i }, tk, k).options.findIndex((o) => o.correct)));
    expect(slots.size).toBeGreaterThan(1);
    // la carte 265 : barreau 2, la bonne option est 10^2 ≤ A < 10^3
    const q = QUESTIONS.rung(base, base.tasks[0], k);
    expect(renderToString(<span>{q.options.find((o) => o.correct).text}</span>)).toContain('10');
  });
  it('« أعِد التجربة » : la même carte repart et son drapeau « fait » tombe', () => {
    let lab = SL.init(LV.beginner.numbers);
    lab = { ...lab, done: [true, false, false, false] };
    const r = SL.retryTask(lab);
    expect(r.done[0]).toBe(false);
    expect(r.ti).toBe(0);
  });
  it('mode guidé : ni la progression ni le bouton d’indice, les étapes et le son sont là', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-sl-step="3"');
    expect(out).toContain('data-manipulation-sound');
    expect(html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false })).toContain('data-manipulation-progress');
  });
});
