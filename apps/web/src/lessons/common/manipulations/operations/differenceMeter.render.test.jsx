import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import DifferenceMeter, { discoveryOptions, Formal, chainOf, QUESTIONS } from './DifferenceMeter';
import { LEVELS } from '../levels';
import * as L from '../logic/differenceMeter';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<DifferenceMeter {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.differenceMeter.${key}`, o);
const LV = LEVELS['difference-meter'];
const HOOKS = ['data-difference-meter', 'data-dm-glance', 'data-dm-stage', 'data-dm-scene', 'data-dm-rail', 'data-dm-bead="a"', 'data-dm-bead="b"', 'data-dm-probe="red"', 'data-dm-probe="black"', 'data-dm-needle', 'data-dm-window',
  'data-dm-swap', 'data-dm-cards', 'data-dm-card="gt"', 'data-dm-card="lt"', 'data-dm-card="eq"', 'data-dm-banner', 'data-dm-free', 'data-dm-kid'];

describe('difference-meter — rendu', () => {
  it('مبتدئ : la paillasse, les deux sondes, les trois cartes, le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of HOOKS) expect(out, hook).toContain(hook);
    expect(out).not.toContain('data-dm-next');
    expect(out).not.toContain('data-dm-formal');
    expect(out).not.toContain('data-dm-shutter-art');
    expect(out).not.toContain('data-dm-card="nojudge"');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['a', 'b', 'c', 'x', 'A', 'B'].includes(w));
    expect(words).toEqual([]);
  });

  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(text(out)).toContain('المقياس يقرأ عدد المجسّ الأحمر ناقص عدد المجسّ الأسود');
    expect(text(out)).toContain('اختر بطاقة الترتيب الصحيحة');
  });

  it('d3 : les deux perles se recouvrent — UNE étiquette fusionnée et la loupe', () => {
    const out = html({ tasks: [LV.beginner.numbers.tasks[2]], levels: false });
    expect(out).toContain('data-dm-tag="merged"');
    expect(out).toContain('data-dm-lens');
    expect((out.match(/data-dm-tag="[ab]"/g) ?? []).length).toBe(0);
    const d1 = html({ tasks: [LV.beginner.numbers.tasks[0]], levels: false });
    expect(d1).not.toContain('data-dm-lens');
    expect((d1.match(/data-dm-tag="[ab]"/g) ?? []).length).toBe(2);
  });

  it('متقدم : d4 — pas de panneau avant le branchement, le volet est dessiné une fois les sondes branchées (état)', () => {
    const out = html({ tasks: [LV.advanced.numbers.tasks[0]], levels: false });
    expect(out).not.toContain('data-dm-write');
    let s = L.init({ tasks: [LV.advanced.numbers.tasks[0]] });
    s = L.plug(L.plug(s, 'red', 'a'), 'black', 'b');
    expect(L.shutterClosed(s)).toBe(true);
  });

  it('متقدم : d6 — le rideau cache les perles, la carte « لا نستطيع الحكم » est là, le contexte donne la différence', () => {
    const out = html({ tasks: [LV.advanced.numbers.tasks[2]], levels: false });
    expect(out).toContain('data-dm-curtain');
    expect(out).toContain('data-dm-card="nojudge"');
    expect(out).not.toContain('data-dm-bead="a"');
    expect(out).toContain('data-reading="-3/10"');
  });

  it('monde race posé seul (sans `tasks`) : les tâches e1–e3 viennent de la logique, pas des paires de la rail', () => {
    const out = html({ world: 'race', levels: false });
    expect(out).toContain('data-world="race"');
    expect(out).toContain('data-reading="-4"');
    expect(out).toContain('data-dm-x');
  });

  it('monde race : x, deux perles A et B, pas de carte a/b ni de bouton « بدّل المجسّين »', () => {
    const out = html({ world: 'race', tasks: L.PRESETS.race.tasks, levels: false });
    expect(out).toContain('data-world="race"');
    expect(out).toContain('data-dm-x');
    expect(out).toContain('data-dm-x-less');
    expect(out).not.toContain('data-dm-swap');
    expect(out).not.toContain('data-dm-cards');
    expect(out).toContain('data-reading="-4"');
    expect(out).not.toMatch(RAW);
  });
});

describe('difference-meter — chaînes de texte', () => {
  it('toutes les clés existent et ne laissent aucune interpolation brute', () => {
    for (const key of ['title', 'context.rail', 'context.write', 'context.curtain', 'context.race', 'question.rail', 'question.write', 'question.curtain', 'question.race', 'question.free', 'swap', 'retry', 'next',
      'cards.nojudge', 'write.title', 'write.check', 'coef.title', 'regions.all', 'idle.plug', 'idle.write', 'idle.swap', 'idle.cards', 'v.solved', 'refuse.same', 'refuse.noJudge', 'free.title', 'free.hintRail', 'free.hintRace',
      'coach.plug', 'coach.plug2', 'coach.verdict', 'coach.swap', 'coach.write', 'coach.x', 'coach.coef', 'coach.cards', 'coach.next', 'coach.free', 'hints.0', 'hints.1', 'hints.2', 'explanation',
      'discovery.side.prompt', 'discovery.need.prompt', 'formal.gt', 'formal.lt', 'formal.eq', 'formal.swap']) {
      const v = k(key);
      expect(v, key).not.toMatch(RAW);
      expect(v.length, key).toBeGreaterThan(2);
    }
  });
  it('le coach couvre chaque étape que coachOf peut rendre', () => {
    for (const id of ['plug', 'plug2', 'verdict', 'swap', 'write', 'x', 'coef', 'cards', 'next', 'free']) expect(k(`coach.${id}`), id).not.toMatch(RAW);
  });
  it('découverte : trois formulations dont une juste, pour chaque niveau ; règle formelle', () => {
    for (const kind of ['side', 'need']) {
      const opts = discoveryOptions(k, kind);
      expect(opts).toHaveLength(3);
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
    }
    const f = renderToString(<Formal k={k} />);
    expect(f).toContain('data-dm-formal');
    expect(f).not.toMatch(RAW);
  });
  it('la prose ne dit pas la règle avant la découverte (consigne, coach, indices)', () => {
    const early = ['context.rail', 'question.rail', 'coach.plug', 'coach.verdict', 'hints.0', 'hints.1', 'hints.2'].map((x) => k(x)).join(' ');
    expect(early).not.toMatch(/موجب|سالب|إشارة الفرق/);
  });
});

describe('difference-meter — questions pendant le labo (LabCheckpoint)', () => {
  const kk = (key, o) => i18n.t(`lesson:manipulation.differenceMeter.${key}`, o);
  const RAWK = /manipulation\.[a-zA-Z]/;
  const cases = [['beginner', LEVELS['difference-meter'].beginner.numbers], ['advanced', LEVELS['difference-meter'].advanced.numbers], ['race', { world: 'race', tasks: L.PRESETS.race.tasks }]];
  for (const [name, numbers] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = { ...L.init(numbers), red: 'a', black: 'b' };
      lab.tasks.forEach((t, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, t.id).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid]({ ...lab, ti: i }, t, kk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${t.id}.${qid}`).not.toMatch(RAWK);
          expect(out, `${t.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${t.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${t.id}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${t.id}.${qid}`).toBeTruthy();
        }
      });
    });
  }
  it('les nombres viennent de la tâche ; la règle clôt la dernière tâche du niveau', () => {
    const b = { ...L.init(LEVELS['difference-meter'].beginner.numbers), red: 'a', black: 'b' };
    expect(chainOf(b, 2).at(-1)).toBe('rule');
    expect(chainOf(b, 0)).not.toContain('rule');
    expect(QUESTIONS.reading(b, b.tasks[0], kk).expected).toBe('1/2');
    expect(QUESTIONS.order(b, b.tasks[2], kk).options.findIndex((o) => o.correct)).toBe(0);
    const r = L.init({ world: 'race', tasks: L.PRESETS.race.tasks });
    expect(chainOf(r, 0)).toEqual(['atZero', 'cross']);
    expect(QUESTIONS.cross(r, r.tasks[0], kk).expected).toBe('4');
    expect(chainOf(r, 1)).toEqual(['atZero', 'never']);
    expect(QUESTIONS.cross(r, r.tasks[2], kk).expected).toBe('3');
  });
});

describe('difference-meter — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<DifferenceMeter {...LEVELS['difference-meter'].beginner.numbers} level="beginner" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<DifferenceMeter {...LEVELS['difference-meter'].beginner.numbers} level="beginner" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
