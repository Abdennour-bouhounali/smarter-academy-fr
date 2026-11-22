import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import FairShare, { chainsOf, QUESTIONS } from './FairShare';
import * as FL from '../logic/fairShare';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<FairShare {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.fairShare.${key}`, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

describe('fair-share — rendu', () => {
  it('beginner (canteen): 3 cakes, 4 kids, the two steppers (split, take), no verdict yet', () => {
    const out = html({ ...LEVELS['fair-share'].beginner.numbers });
    expect(out).toContain('data-fair-share');
    expect(out).toContain('data-scene="canteen"');
    expect(out).toContain('data-order="3/4"');
    expect(attrs(out, 'data-fs-cake')).toHaveLength(3);
    expect(attrs(out, 'data-fs-kid')).toHaveLength(4);
    expect(out).toContain('data-fs-split');
    expect(out).toContain('data-fs-take');
    expect(out).toContain('data-fs-step-value="split">1<');
    expect(out).toContain('data-fs-step-value="take">0<');
    expect(out).not.toContain('role="slider"');
    expect(out).toContain('data-fs-verdict=""');
    expect(out).not.toContain('data-fs-next');
    expect(out).not.toContain('data-fs-formal');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
  });
  it('advanced (family, نشاط 1): 5 cakes for 6 people, the festive family sentence', () => {
    const out = html({ ...LEVELS['fair-share'].advanced.numbers });
    expect(out).toContain('data-order="5/6"');
    expect(attrs(out, 'data-fs-kid')).toHaveLength(6);
    expect(text(out)).toContain('أرادت فاطمة وزميلتها مريم، احتفالًا بالمولد النبوي الشريف، تقسيم 5 كعكات متماثلة على 6 أشخاص بالتساوي.');
    expect(out).not.toMatch(RAW);
  });
  it('« جرّب أعدادك » is always there: two steppers, no free-order state yet, the cut ruler stays locked', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['fair-share'][lv].numbers });
      expect(out).toContain('data-fs-free');
      expect(out).toContain('data-active="false"');
      expect(attrs(out, 'data-fs-free-field')).toEqual(['cakes', 'kids']);
      expect(out).not.toContain('data-fs-free-back');
      expect(out).toContain('data-fs-zero-button');
      expect(out).not.toContain('data-fs-zero=');
      expect(out).toContain(`data-fs-free-value="cakes">${LEVELS['fair-share'][lv].numbers.orders[0][0]}<`);
    }
  });
  it('the table is round cakes, a festive bunting, one plate per kid; no bread left', () => {
    const out = html({ ...LEVELS['fair-share'].beginner.numbers });
    expect(out).toContain('data-fs-bunting');
    expect(out).toContain('data-fs-table');
        expect(out).not.toMatch(/رغيف|أرغفة|خبز/);
    expect(text(out)).toContain('المولد النبوي الشريف');
  });
  it('inside a workspace: one selector', () => {
    const out = renderToString(<ManipulationWorkspace levels={{
      beginner: () => <FairShare level="beginner" {...LEVELS['fair-share'].beginner.numbers} />,
      advanced: () => <FairShare level="advanced" {...LEVELS['fair-share'].advanced.numbers} />,
    }} />);
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });
  it('every string exists in Arabic, fully interpolated', () => {
    const o = { cakes: '3 كعكات', kids: '4 أطفال', per: '4 قطع', pieces: '3 قطع', n: 4, share: 'x', total: 't', have: 'h', gap: 'g', x: '0,66', a: 2, b: 3, dec: '0,75', below: '0,66', above: '0,67', order: '2 ÷ 3', word: 'w', what: 'الكعكات' };
    const keys = ['title', 'question', 'instruction', 'sceneAria', 'next.title', 'next.text', 'next.button', 'back', 'trial', 'trialsTitle', 'explanation',
      'context.canteen', 'context.family', 'discovery.prompt', 'discovery.right', 'discovery.dec', 'discovery.inv', 'discovery.whyDecNone', 'split.label', 'split.less', 'split.more', 'split.of', 'take.label', 'take.less', 'take.more', 'formal.keyTitle', 'formal.keyA', 'formal.keyB', 'formal.caseLine', 'formal.nonZeroTitle', 'formal.nonZero', 'free.zeroButton', 'free.zeroAria', 'free.zero', 'free.title', 'free.hint', 'free.on', 'free.cakes', 'free.kids', 'free.less', 'free.more', 'free.back', 'formal.decimal', 'formal.approx', 'formal.rule',
      'read.share', 'read.total', 'coach.pieces', 'coach.again', 'coach.split', 'coach.next',
      ...['exact', 'short', 'over'].map((kd) => `v.${kd}`),
      ...['short', 'over', 'exact'].flatMap((kd) => [`discovery.whyDec.${kd}`, `discovery.whyInv.${kd}`, `kind.${kd}`]), 'hints.0', 'hints.1', 'hints.2'];
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s), key).toBe(true);
    }
    expect(say('discovery.right')).not.toMatch(/\d|\{\{/);
    for (let i = 0; i < 3; i += 1) expect(say(`hints.${i}`)).not.toMatch(/\d/);
  });
  it('says each thing ONCE and opens on CONTEXT then ONE question, no title banner', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['fair-share'][lv].numbers });
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out.split(say('instruction')).length - 1).toBe(1);
      const t = text(out);
      expect(t.split(say('question')).length - 1).toBe(1);
      expect(say('question')).toMatch(/حتى/);
      expect(say('question')).not.toMatch(/اسحب|كسر|÷/);
    }
  });
  it('counted nouns agree', () => {
    expect([1, 2, 3, 11, 100].map((count) => say('cakes', { count }))).toEqual(['كعكة واحدة', 'كعكتان', '3 كعكات', '11 كعكةً', '100 كعكة']);
    expect([1, 2, 6].map((count) => say('persons', { count }))).toEqual(['شخص واحد', 'شخصان', '6 أشخاص']);
  });
});

describe('fair-share — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.fairShare.${key}`, o);
  const RAW_ = /manipulation\.[a-zA-Z]/;
  for (const level of ['beginner', 'advanced']) {
    it(`${level} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const { scene, orders } = LEVELS['fair-share'][level].numbers;
      const lab = FL.init({ orders });
      const chains = chainsOf(lab);
      expect(Object.keys(chains)).toHaveLength(orders.length);
      for (const [i, chain] of Object.entries(chains)) {
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, Number(i), k, scene);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW_);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${i}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${i}.${qid}`).toBeTruthy();
        }
      }
      expect(chains[orders.length - 1].at(-1)).toBe('rule');
    });
  }
  it('les nombres viennent de la demande : 3 ÷ 4 tombe juste (0,75), 2 ÷ 3 jamais', () => {
    const lab = FL.init({ orders: [[3, 4], [2, 3]] });
    expect(chainsOf(lab)[0]).toEqual(['share', 'check', 'decimal']);
    expect(chainsOf(lab)[1]).toEqual(['share', 'check', 'tenths', 'rule']);
    expect(QUESTIONS.share(lab, 1, k, 'canteen').expected).toBe('2/3');
    expect(renderToString(<span>{QUESTIONS.decimal(lab, 0, k, 'canteen').options[0].text}</span>)).toContain('0,75');
  });
});

describe('fair-share — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<FairShare {...LEVELS['fair-share'].beginner.numbers} />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<FairShare {...LEVELS['fair-share'].beginner.numbers} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
