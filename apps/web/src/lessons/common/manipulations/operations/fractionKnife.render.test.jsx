import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import FractionKnife, { chainsOf, QUESTIONS } from './FractionKnife';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/fractionKnife';

/**
 * fraction-knife se rend aux deux niveaux de levels.js (le plateau ; le rectangle du نشاط 4), sans clé i18n brute, sans
 * interpolation oubliée, sans prose latine ; la consigne n'est dite qu'UNE fois (MANIPULATION_DNA §17.7).
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<FractionKnife {...props} />);
const latinWords = (out) => {
  const text = out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return text.match(/[A-Za-z]{2,}/g) ?? [];
};
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const say = (key, o) => i18n.t(`lesson:manipulation.fractionKnife.${key}`, o);
const clean = (out) => {
  expect(out).not.toMatch(RAW);
  expect(out).not.toContain('{{');
  expect(latinWords(out)).toEqual([]);
};

describe('fraction-knife — rendu', () => {
  it('beginner (tray): 5 pieces, 3 in the share, the ribbon at 3/5, 3/5 in the notebook, the knife at 5, no verdict', () => {
    const out = html({ ...LEVELS['fraction-knife'].beginner.numbers });
    expect(out).toContain('data-fraction-knife');
    expect(out).toContain('data-world="tray"');
    expect(out).toContain('data-share="3/5"');
    expect(out).toContain('data-d="5"');
    expect(out).toContain('data-solved="false"');
    expect(out).toContain('data-fk-glance');
    expect(out).toContain('data-fk-knife="5"');
    expect(out).toContain('role="slider"');
    expect(out).toContain('aria-valuenow="5"');
    expect(out).toContain('aria-valuemax="20"');
    expect(attrs(out, 'data-fk-piece')).toEqual(['0', '1', '2', '3', '4']);
    expect(attrs(out, 'data-in')).toEqual(['full', 'full', 'full', 'out', 'out']);
    expect(out).toContain('data-fk-edge="3/5"');
    expect(out).toContain('data-fk-count="3/5"');
    expect(attrs(out, 'data-fk-stamp')).toEqual(['3/5']);
    expect(out).toContain('data-fk-girl');
    expect(out).toContain('data-fk-verdict=""');
    expect(out).toContain('data-fk-less');
    expect(out).toContain('data-fk-more');
    expect(out).not.toContain('data-fk-claim');
    expect(out).not.toContain('data-fk-formal');
    expect(out).toContain('3 قطع من 5');
    expect(out).toContain('data-manipulation-levels-selector');
    clean(out);
  });

  it('advanced (paper, نشاط 4): the textbook rectangle 1, the two targets 6/10 and 12/20 open, no girl, no gift yet', () => {
    const out = html({ ...LEVELS['fraction-knife'].advanced.numbers });
    expect(out).toContain('data-world="paper"');
    expect(out).toContain('data-stage="0"');
    expect(attrs(out, 'data-fk-target')).toEqual(['6/10', '12/20']);
    expect(attrs(out, 'data-done')).toEqual(['false', 'false', 'false', 'false']); // les 2 étapes (LabStepper) puis les 2 cibles
    expect(out).toContain('data-fk-stamp="3/5" data-figure="1"');
    expect(out).not.toContain('data-fk-girl');
    expect(out).not.toContain('data-fk-next');
    expect(out).not.toContain('data-fk-pin=');
    clean(out);
  });

  it('inside a workspace: one selector, both worlds', () => {
    const out = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <FractionKnife level="beginner" {...LEVELS['fraction-knife'].beginner.numbers} />,
        advanced: () => <FractionKnife level="advanced" {...LEVELS['fraction-knife'].advanced.numbers} />,
      }} />,
    );
    expect(out).toContain('data-world="tray"');
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });

  it('every string a verdict, a refusal, the claim, the gift or the discovery can show exists, in Arabic, fully interpolated', () => {
    const o = {
      pieces: '6 قطع', piecesD: '7 قطع', piecesB: '6 قطع', piecesK: '9 قطع', d: 10, q: 5, p: 3, p0: 3, q0: 5, a: 4, b: 6, a2: 3, d2: 5,
      n: 2, k: 9, x: '3,6', piecesQ: '5 قطع', count: '6 قطع من 10', reading: '4 قطع وجزء من قطعة',
    };
    const keys = ['stepTitle', 'stepTitlePin', 'less', 'more', 'knife', 'pencil', 'count.readable', 'count.straddle', 'count.partOnly',
      'v.readable', 'v.readableAgain', 'v.straddle', 'decimal', 'notebook', 'notebookAll', 'figure', 'glue',
      'claim.open', 'claim.who', 'claim.text', 'claim.cut', 'claim.true', 'claim.false', 'claim.ghost', 'claim.right', 'claim.wrong',
      'next.title', 'next.text', 'next.button', 'next.back', 'next.again', 'pin.cursor', 'pin.plant', 'pin.start', 'pin.left', 'pin.remove',
      'same', 'notebookShort', 'targetsLabel', 'context.gift', 'question.gift', 'instruction.predict', 'explanation', 'formal.decimal', 'formal.reduced',
      'discovery.rightTray', 'discovery.add', 'discovery.bigger', 'discovery.whyAdd', 'discovery.whyBigger',
      'discovery.rightPaper', 'discovery.anyDivisor', 'discovery.denOnly', 'discovery.whyAnyDivisor', 'discovery.whyDenOnly'];
    for (const w of ['tray', 'paper']) {
      keys.push(`title.${w}`, `context.${w}`, `question.${w}`, `instruction.${w}`, `sceneAria.${w}`, `discovery.prompt.${w}`, `formal.rule.${w}`);
      for (let i = 0; i < 3; i += 1) keys.push(`hints.${w}.${i}`);
    }
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s), key).toBe(true);
    }
    // the wrong conjectures and the right one are labels without the student's numbers (the right tray one: no number at all)
    expect(i18n.getResource('ar-DZ', 'lesson', 'manipulation.fractionKnife.discovery.rightTray')).not.toMatch(/\d|\{\{/);
    for (const w of ['add', 'bigger', 'anyDivisor', 'denOnly']) {
      expect(i18n.getResource('ar-DZ', 'lesson', `manipulation.fractionKnife.discovery.${w}`)).not.toMatch(/\d|\{\{/);
    }
    // the hints never give a readable d (other than the start 5) nor the glue 9
    for (const w of ['tray', 'paper']) {
      for (let i = 0; i < 3; i += 1) expect(say(`hints.${w}.${i}`)).not.toMatch(/(^|\D)(10|15|20|9|3)(\D|$)/);
    }
  });

  it('says each thing ONCE (MANIPULATION_DNA §17): no shell mission over the prompt card, the gesture told once, hints closed', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['fraction-knife'][lv].numbers });
      const w = lv === 'beginner' ? 'tray' : 'paper';
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).not.toContain('data-manipulation-hints');
      expect(out.split(say(`instruction.${w}`)).length - 1).toBe(1);
      // the rule is never on screen before the discovery (DNA §9)
      expect(out).not.toContain(say('discovery.rightTray'));
      expect(out).not.toContain(say(`formal.rule.${w}`));
    }
  });

  it('opens on its CONTEXT then ONE question naming the end state — no title banner (MANIPULATION_DNA §17.9)', () => {
    const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const [lv, w, context] of [['beginner', 'tray', 'قسمت الجدّة صينية قلب اللوز إلى 5 قطع متساوية، وحصّة الجيران 3 قطع داخل الشريط الأحمر.'],
      ['advanced', 'paper', 'في المستطيل 1 من الكتاب، 3 قطع ملوّنة من 5.']]) {
      const out = html({ ...LEVELS['fraction-knife'][lv].numbers });
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out).not.toMatch(/<span class="inline-flex items-center gap-1\.5 rounded-full bg-indigo-50/);
      expect(out).toContain(`data-fk-context="${w}"`);
      expect([say('notebook'), say('notebookShort')].some((x) => text(out).includes(x))).toBe(true);
      if (w === 'paper') expect(text(out)).toContain(say('targetsLabel'));
      const t = text(out);
      const question = say(`question.${w}`);
      expect(t.indexOf(context), lv).toBeGreaterThan(-1);
      expect(t.indexOf(question), lv).toBeGreaterThan(t.indexOf(context));
      expect(t.split(question).length - 1).toBe(1);
      expect(out.indexOf('data-lab-context')).toBeLessThan(out.indexOf('data-lab-question'));
    }
    for (const w of ['tray', 'paper', 'gift']) {
      expect(say(`question.${w}`), w).toMatch(/حتى/);
      expect(say(`title.${w === 'gift' ? 'paper' : w}`)).not.toMatch(/[:؟]/);
    }
  });

  it('counted nouns agree (six Arabic plural forms)', () => {
    expect([0, 1, 2, 3, 11, 100].map((count) => say('pieces', { count }))).toEqual(['لا قطعة', 'قطعة واحدة', 'قطعتان', '3 قطع', '11 قطعةً', '100 قطعة']);
  });

  it('the logic the scene draws is the lesson\'s: 27/45 reduced to 3/5 by a glue of 9', () => {
    expect(L.glue(27, 45, 45, 5).k).toBe(9);
  });
});

describe('fraction-knife — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.fractionKnife.${key}`, o);
  const RAW_ = /manipulation\.[a-zA-Z]/;
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      let lab = L.init(LEVELS['fraction-knife'][level].numbers);
      for (const d of [10, 15, 20]) lab = L.commitD(lab, d);
      const chains = chainsOf(lab);
      for (const [i, chain] of Object.entries(chains)) {
        expect(chain.length, i).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW_);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${i}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${i}.${qid}`).toBeTruthy();
        }
      }
      expect(Object.values(chains).at(-1).at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent des coupes : 3/5 → 6/10 (k = 2), 27/45 → 3/5 (9 morceaux réunis)', () => {
    const lab = L.commitD(L.init(LEVELS['fraction-knife'].advanced.numbers), 10);
    expect(QUESTIONS.times(lab, k).expected).toBe('2');
    expect(QUESTIONS.glue(lab, k).expected).toBe('9');
    expect(chainsOf(L.init(LEVELS['fraction-knife'].beginner.numbers))[0]).toEqual(['times', 'claim', 'decimal', 'rule']);
  });
});

describe('fraction-knife — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<FractionKnife {...LEVELS['fraction-knife'].beginner.numbers} />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<FractionKnife {...LEVELS['fraction-knife'].beginner.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
