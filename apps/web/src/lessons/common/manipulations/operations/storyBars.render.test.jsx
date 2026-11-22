import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import StoryBars, { stretchTape, cardTape, chainsOf, QUESTIONS } from './StoryBars';
import ArcTape from '../../components/ArcTape';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import { STORIES, answerOf } from '../logic/storyBars';

/**
 * story-bars se rend aux deux niveaux de levels.js (la toise ; نشاط 1) et pour la méthode p. 29 seule
 * (levels={false}), sans clé i18n brute, sans interpolation oubliée, sans prose latine.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<StoryBars {...props} />);
/** Le texte visible (hors balises) : aucune prose latine — seuls cm, DA (unités du manuel) passent. */
const latinWords = (out) => {
  const text = out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return (text.match(/[A-Za-z]{2,}/g) ?? []).filter((w) => !['cm', 'DA'].includes(w));
};
/** « <n> cm » hors d'un îlot LTR (isolat U+2066…U+2069, <bdi dir="ltr">, ou le SVG LTR) : le bidi l'inverserait. */
const bareCm = (out) => out
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<bdi dir="ltr"[^>]*>[^<]*<\/bdi>/g, ' ')
  .replace(/\u2066[^\u2069]*\u2069/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .match(/\d\s?cm/g) ?? [];
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);

describe('story-bars — rendu', () => {
  it('beginner (checkup): the gauge, two children, the handle, the sentence, three calc cards', () => {
    const out = html({ ...LEVELS['story-bars'].beginner.numbers });
    expect(out).toContain('data-story-bars');
    expect(out).toContain('data-story="checkup"');
    expect(out).toContain('data-mode="stretch"');
    expect(out).toContain('data-item="amine"');
    expect(out).toContain('data-solved="false"');
    expect(out).toContain('data-sb-glance');
    expect(out).toContain('data-sb-scene');
    expect(out).toContain('data-sb-handle');
    expect(out).toContain('role="slider"');
    expect(out).toContain('data-sb-person="sara" data-height="130"');
    // the default: the unknown child stands at Sara's height (never an answer, never a trial)
    expect(out).toContain('data-sb-person="amine" data-height="130"');
    expect(out).toContain('data-sb-sentence');
    expect(out).toContain('data-ok="false"');
    expect(out).toContain('أمين أطول من سارة بـ \u20666 cm\u2069');
    expect(attrs(out, 'data-sb-calc').sort()).toEqual(['0', '1', '2']);
    expect(out).toContain('130 + 6');
    expect(out).toContain('6 − 130');
    expect(out).toContain('data-sb-less');
    expect(out).toContain('data-sb-more');
    expect((out.match(/data-sb-step="/g) ?? []).length).toBe(4);
    expect(out).toContain('data-manipulation-levels-selector');
    // no tape, no written line, no difference arc before any gesture
    expect(out).not.toContain('data-arc-tape');
    expect(out).not.toContain('data-sb-formal-line');
    expect(out).not.toContain('data-sb-diff');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
    expect(bareCm(out)).toEqual([]);
  });

  it('advanced (act1): six cards, six textbook texts as drop zones, no gauge and no tape before a card', () => {
    const out = html({ ...LEVELS['story-bars'].advanced.numbers });
    expect(out).toContain('data-mode="cards"');
    expect(attrs(out, 'data-sb-card')).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(attrs(out, 'data-sb-slot')).toEqual(['1', '2', '3', '4', '5', '6']);
    expect((out.match(/data-matched="false"/g) ?? []).length).toBe(6);
    // first render = the narrow layout (one text at a time, the ①–⑥ tabs are the slots)
    expect(out).toContain('data-sb-compact');
    expect((out.match(/<button[^>]*role="tab"[^>]*data-sb-slot=/g) ?? []).length).toBe(6);
    expect(out).toContain('data-sb-panel="1"');
    expect(out).toContain('31,02 − 22,60');
    expect(out).toContain('يملك يونس مبلغا قدره 24,5DA');
    expect(out).not.toContain('data-sb-scene');
    expect(out).not.toContain('data-sb-handle');
    expect(out).not.toContain('data-arc-tape');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
    expect(bareCm(out)).toEqual([]);
  });

  it('method29 alone (levels={false}): Akram 124, Younes first, no level selector', () => {
    const out = html({ story: 'method29', levels: false });
    expect(out).toContain('data-story="method29"');
    expect(out).toContain('data-item="younes"');
    expect(out).toContain('data-sb-person="akram" data-height="124"');
    expect(out).toContain('تزيد قامة يونس عن قامة زميله أكرم بـ \u20663cm\u2069');
    expect((out.match(/data-sb-step="/g) ?? []).length).toBe(2);
    expect(out).not.toContain('data-manipulation-levels-selector');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
    expect(bareCm(out)).toEqual([]);
  });

  it('inside a workspace: no second selector', () => {
    const out = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <StoryBars level="beginner" story="checkup" />,
        advanced: () => <StoryBars level="advanced" story="act1" />,
      }} />,
    );
    expect(out).toContain('data-story="checkup"');
    expect(out).toContain('data-story="act1"');
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });

  it('every string a verdict, a refusal or the discovery can show exists, in Arabic, fully interpolated', () => {
    const say = (key, o) => i18n.t(`lesson:manipulation.storyBars.${key}`, o);
    const o = { name: 'أمين', known: 'سارة', h: 140, d: 6, diff: 10, says: 'جملة', got: 'يكون', calc: '130 − 6', value: '124', a: '6', b: '130', n: 1, k: 130, whole: 'أمين 136', p0: 'سارة 130', p1: 'الفرق 6', count: 6 };
    const keys = ['v.ok', 'v.equal', 'v.side', 'v.mirror', 'v.gap', 'v.locked', 'v.calcFirst', 'v.calcOk', 'v.calcWrong', 'v.calcImpossible', 'v.calcDone', 'v.cardOk',
      'discovery.prompt', 'discovery.optRight', 'discovery.optBig', 'formal.rule', 'formal.lineWhole', 'formal.linePart', 'explanation', 'tapeAria', 'tapeAriaOpen'];
    for (const id of ['checkup', 'act1']) keys.push(`stories.${id}.optWord`, `stories.${id}.whyWord`, `stories.${id}.whyBig`);
    STORIES.act1.items.forEach((_, i) => keys.push(`stories.act1.texts.${i}.text`, `stories.act1.texts.${i}.wrongWhy`, ...['p0', 'p1', 'whole'].map((w) => `stories.act1.texts.${i}.words.${w}`)));
    for (const id of ['checkup', 'method29']) {
      for (const it of STORIES[id].items) keys.push(...['name', 'sentence', 'taller', 'shorter'].map((w) => `stories.${id}.items.${it.id}.${w}`));
    }
    for (const mode of ['stretch', 'cards']) for (let i = 0; i < 3; i += 1) keys.push(`hints.${mode}.${i}`);
    keys.push('itemsLabel', 'calcAsk', 'solvedLabel', 'context.checkup', 'context.method29', 'context.cards', 'question.stretch', 'question.cards', 'trialStretch', 'gaugeAria');
    for (const key of keys) {
      const s = say(key, o);
      expect(bareCm(s), `${key}: « n cm » is one LTR island`).toEqual([]);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s), key).toBe(true);
    }
    // the discovery options are static labels (never a student's number in a button)
    for (const key of ['discovery.optRight', 'discovery.optBig', 'stories.checkup.optWord', 'stories.act1.optWord']) {
      expect(i18n.getResource('ar-DZ', 'lesson', `manipulation.storyBars.${key}`), key).not.toContain('{{');
    }
    // the hints never give the rule before the discovery
    for (const mode of ['stretch', 'cards']) for (let i = 0; i < 3; i += 1) expect(say(`hints.${mode}.${i}`)).not.toContain('نطرح الجزء الآخر');
  });

  it('opens on its CONTEXT then ONE question naming the end state — no title banner, no shell mission (MANIPULATION_DNA §17.9)', () => {
    const say = (key, o) => i18n.t(`lesson:manipulation.storyBars.${key}`, o);
    const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
    for (const [props, context, question] of [
      [LEVELS['story-bars'].beginner.numbers, say('context.checkup', { known: 130 }).replace(/[⁦⁩]/g, '').replace(/\s+/g, ' '), say('question.stretch', { name: 'أمين' })],
      [LEVELS['story-bars'].advanced.numbers, say('context.cards', { count: 6 }), say('question.cards')],
      [{ story: 'method29', levels: false, title: 'طريقة الكتاب: قامات أكرم ويونس ومحمد' }, 'قامة أكرم', say('question.stretch', { name: 'يونس' })],
    ]) {
      const out = html({ ...props });
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).not.toMatch(/<span class="inline-flex items-center gap-1\.5 rounded-full bg-indigo-50/);
      expect(out).toContain('data-sb-context');
      // no bare row (§17.9): the item chips, the calc cards and the progress each carry their label
      if (props.story !== 'act1') expect(out).toContain('data-lab-stepper');
      if (props.story !== 'act1') expect(out.indexOf('data-sb-calc-ask')).toBeLessThan(out.indexOf('data-sb-calcs'));
      if (props.story === 'act1') expect(text(out)).toContain(say('solvedLabel'));
      const t = text(out);
      expect(t.indexOf(context), context).toBeGreaterThan(-1);
      expect(t.indexOf(question), question).toBeGreaterThan(t.indexOf(context));
      expect(t.split(question).length - 1).toBe(1);
      expect(question).toMatch(/حتى/);
      expect(out.indexOf('data-lab-context')).toBeLessThan(out.indexOf('data-lab-question'));
    }
  });

  it('the tapes the lab draws: closed exactly when the exact verdict says so, with the story\'s words', () => {
    const k = (key, o) => i18n.t(`lesson:manipulation.storyBars.${key}`, o);
    const tapeHtml = (fig) => renderToString(<ArcTape {...fig} />);
    // act1: every card on every text — the drawn tape closes iff the card is the text's
    STORIES.act1.items.forEach((it, t) => {
      const words = Object.fromEntries(['p0', 'p1', 'whole'].map((w) => [w, k(`stories.act1.texts.${t}.words.${w}`)]));
      STORIES.act1.cards.forEach((_, c) => {
        const fig = cardTape('act1', t, c, k, words);
        const out = tapeHtml(fig);
        const right = fig.ariaLabel === k('tapeAria', { whole: fig.whole.label, p0: fig.parts[0].label, p1: fig.parts[1].label });
        expect(out, `text ${t + 1} card ${c}`).toContain(`data-tape-closed="${right}"`);
        expect(out).not.toContain('{{');
      });
    });
    const one = cardTape('act1', 0, 0, k, { p0: 'ما يملكه', p1: 'ما ينقصه', whole: 'ثمن الكرّاس' });
    expect(one.whole.label).toBe('ثمن الكرّاس □');
    expect(cardTape('act1', 0, 5, k, { p0: 'ما يملكه', p1: 'ما ينقصه', whole: 'ثمن الكرّاس' }).whole.label).toBe('ثمن الكرّاس 13');
    expect(one.parts.map((p) => p.label)).toEqual(['ما يملكه 24,5', 'ما ينقصه 11,5']);
    // stretch: the whole is the taller child, every height of the gauge drawn, closed only on the answer
    for (const id of ['checkup', 'method29']) {
      STORIES[id].items.forEach((it, i) => {
        for (let h = 100; h <= 150; h += 1) {
          const { fig, closed } = stretchTape(id, i, LIN.frac(h), k, k(`stories.${id}.known`), k(`stories.${id}.items.${it.id}.name`));
          expect(closed).toBe(LIN.eq(LIN.frac(h), answerOf(id, i)));
          expect(tapeHtml(fig)).toContain(`data-tape-closed="${closed}"`);
        }
      });
    }
    const amine = stretchTape('checkup', 0, answerOf('checkup', 0), k, 'سارة', 'أمين');
    expect(amine.fig.whole.label).toBe('أمين □');
    expect(amine.fig.whole.value).toBe('136');
    expect(amine.fig.parts.map((p) => p.label)).toEqual(['سارة 130', 'الفرق 6']);
    const nazim = stretchTape('checkup', 2, answerOf('checkup', 2), k, 'سارة', 'نزيم');
    expect(nazim.fig.whole.label).toBe('سارة 130');
  });
});

describe('story-bars — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.storyBars.${key}`, o);
  for (const story of ['checkup', 'method29', 'act1']) {
    it(`${story} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const chains = chainsOf(story);
      for (const [task, chain] of Object.entries(chains)) {
        expect(chain.length, task).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](story, task === 'all' ? 'all' : Number(task), k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${task}.${qid}`).not.toMatch(RAW);
          expect(out, `${task}.${qid}`).not.toContain('{{');
          expect(q.hints, `${task}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${task}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${task}.${qid}`).toBeTruthy();
        }
      }
    });
  }
  it('les nombres viennent de l’histoire ; la règle clôt le dernier item de la découverte', () => {
    expect(chainsOf('checkup')[2].at(-1)).toBe('rule');
    expect(chainsOf('checkup')[3]).not.toContain('rule');
    expect(chainsOf('method29')[1]).not.toContain('rule');
    expect(QUESTIONS.height('checkup', 0, k).expected).toBe('136');
    expect(QUESTIONS.height('checkup', 2, k).expected).toBe('121');
    expect(QUESTIONS.whole('checkup', 0, k).options[0].correct).toBe(true);
    expect(QUESTIONS.whole('checkup', 1, k).options[1].correct).toBe(true);
    expect(QUESTIONS.plusCount('act1', 'all', k).expected).toBe('3');
  });
});

describe('story-bars — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html({ story: 'checkup' });
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ story: 'checkup', checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
