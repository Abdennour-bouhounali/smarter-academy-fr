import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import RankExchange, { numbersFor, discoveryKindOf, chainsOf, QUESTIONS } from './RankExchange';
import * as L from '../logic/rankExchange';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * rank-exchange se rend aux deux niveaux de levels.js (l'atelier des crayons ; les jetons à 7 colonnes) et pour
 * l'échange d'argent seul (1345 DA, تمرين 2, levels={false}), sans clé i18n brute, sans interpolation oubliée,
 * sans prose latine ; rien de ce qui se lit avant la règle ne la donne.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<RankExchange {...props} />);
const textOf = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
const latinWords = (out) => textOf(out).match(/[A-Za-z]{2,}/g) ?? [];
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const say = (key, o) => i18n.t(`lesson:manipulation.rankExchange.${key}`, o);
const res = (key) => i18n.getResource('ar-DZ', 'lesson', `manipulation.rankExchange.${key}`);
/** La règle : « عشرة » et « واحدة » ensemble (ou « 10 … تساوي … 1 »). */
const statesRule = (s) => (/عشرة/.test(s) && /واحدة/.test(s)) || /(^|\D)10(?!\d)[^.؟]*تساوي[^.؟]*(واحدة|1)/.test(s);

describe('rank-exchange — rendu', () => {
  it('beginner (pencils): four columns, highest on the LEFT, 1 · 13 · 24 · 37 drawn, the prediction cards first, nothing written', () => {
    const out = html({ ...LEVELS['rank-exchange'].beginner.numbers });
    expect(out).toContain('data-rank-exchange');
    expect(out).toContain('data-world="pencils"');
    expect(out).toContain('data-task="pack"');
    expect(out).toContain('data-solved="false"');
    expect(out).toContain('data-rx-glance');
    expect(attrs(out, 'data-rx-col')).toEqual(['3', '2', '1', '0']);
    expect(attrs(out, 'data-count')).toEqual(['1', '13', '24', '37']);
    expect(attrs(out, 'data-overflow')).toEqual(['false', 'true', 'true', 'true']);
    // §17.9 no ambiguity: the count lives once, in the labelled row of boxes; the cards sit under their question
    expect(attrs(out, 'data-rx-badge')).toEqual([]);
    expect(out).toContain('data-rx-digit-caption');
    expect(out).toContain(say('predictAsk.pack.pencils'));
    expect(out.indexOf('data-rx-predict-ask')).toBeLessThan(out.indexOf('data-rx-cards'));
    expect(out).toContain('data-lab-stepper');
    expect(attrs(out, 'data-rx-predict')).toEqual(['75', '2577', '1132437']);
    expect(out).toMatch(/data-rx-written[^>]*><\/bdi>/);
    expect(out).not.toContain('data-rx-tie'); // no gesture before the prediction
    expect(out).not.toContain('data-rx-tray');
    expect(out).not.toContain('data-rx-formal');
    expect(out).not.toContain('data-rx-counter');
    expect(attrs(out, 'data-rx-step')).toEqual(['0', '1']);
    expect(out).toContain('data-manipulation-levels-selector');
    // the items drawn: one per object up to the column's room, each once
    const items = attrs(out, 'data-rx-item');
    expect(new Set(items).size).toBe(items.length);
    expect(items.filter((x) => x.startsWith('3-'))).toHaveLength(1);
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('advanced (tokens): seven columns grouped by class, the board 999, the +1 stepper on the units', () => {
    const out = html({ ...LEVELS['rank-exchange'].advanced.numbers });
    expect(out).toContain('data-world="tokens"');
    expect(out).toContain('data-task="next"');
    expect(attrs(out, 'data-rx-col')).toEqual(['6', '5', '4', '3', '2', '1', '0']);
    expect(attrs(out, 'data-count')).toEqual(['0', '0', '0', '0', '9', '9', '9']);
    expect(out).toContain('data-rx-classes');
    expect(out).toContain('الملايين');
    expect(out).toContain('الآلاف');
    expect(out).toContain('الوحدات');
    expect(out).toContain('data-rx-plusminus="0"');
    expect(out).toMatch(/data-rx-written[^>]*>999<\/bdi>/);
    expect(out).toContain('تسعمائة وتسعة وتسعون');
    expect(attrs(out, 'data-rx-step')).toEqual(['0', '1', '2', '3']);
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('money alone (تمرين 2: 1345 DA, levels={false}): generic notes and coins, no selector, no discovery', () => {
    const out = html({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2, levels: false });
    expect(out).toContain('data-world="money"');
    expect(out).toContain('data-task="unpack"');
    expect(attrs(out, 'data-count')).toEqual(['1', '3', '4', '5']);
    expect(attrs(out, 'data-rx-predict')).toEqual(['1', '3', '13']);
    expect(out).toContain('أوراق');
    expect(out).toContain('دج');
    expect(out).not.toContain('data-manipulation-levels-selector');
    expect(out).not.toContain('data-manipulation-discovery');
    expect(discoveryKindOf(['unpack'])).toBeNull();
    expect(discoveryKindOf(['pack', 'unpack'])).toBe('rank');
    expect(discoveryKindOf(['next', 'dictation'])).toBe('zero');
    expect(numbersFor({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2 })).toEqual({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2 });
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('the lesson\'s own numbers keep the level\'s references (the level is recognised)', () => {
    const b = LEVELS['rank-exchange'].beginner.numbers;
    const got = numbersFor({ world: 'pencils', tasks: ['pack', 'unpack'], start: { 3: 1, 2: 13, 1: 24, 0: 37 }, n: 2017, rank: 1 });
    for (const key of Object.keys(b)) expect(got[key], key).toBe(b[key]);
    const a = numbersFor({ level: 'advanced' });
    for (const key of Object.keys(LEVELS['rank-exchange'].advanced.numbers)) expect(a[key], key).toBe(LEVELS['rank-exchange'].advanced.numbers[key]);
  });

  it('inside a workspace: one selector for both levels', () => {
    const out = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <RankExchange level="beginner" {...LEVELS['rank-exchange'].beginner.numbers} />,
        advanced: () => <RankExchange level="advanced" {...LEVELS['rank-exchange'].advanced.numbers} />,
      }} />,
    );
    expect(out).toContain('data-world="pencils"');
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });

  it('every string a verdict, a refusal, a task or the discovery can show exists, in Arabic, fully interpolated', () => {
    const o = {
      obj: 'الحزمة', col: 'الحزم', ten: '10 أقلام', have: '7 أقلام', one: 'حزمة', value: '2 577', p: '75', board: '765', words: 'سبعمائة', count: '13 علبةً',
      n: '2017', rank: 'العشرات', digit: 1, start: '1 · 13 · 24 · 37', concat: '1 132 437', without: '765', d: 7, lower: 'المئات', big: '4 908 732', zeros: 'صفر واحد',
      empty: 'المئات', i: 1, name: 'x', v: '100', what: 'x', word: 'صحيح', from: 'x', to: 'x', rest: '7 أقلام',
    };
    const keys = ['explanation', 'trialsTitle', 'predicted', 'predictAria', 'counter', 'writtenTitle', 'pmTitle', 'minusAria', 'plusAria', 'check', 'carry',
      'openAll', 'nextTask', 'colAria', 'pickCol', 'grabAria', 'trayAria', 'tie', 'tieAria', 'open', 'openAria', 'stepsAria', 'stepAria', 'dinar',
      'context.pack.pencils', 'context.pack.other', 'context.unpack.pencils', 'context.unpack.money', 'context.unpack.tokens', 'context.next', 'context.previous', 'context.borrow', 'context.dictation',
      'predictAsk.pack.pencils', 'predictAsk.pack.other', 'predictAsk.unpack.pencils', 'predictAsk.unpack.money', 'predictAsk.unpack.tokens', 'digitCaption', 'stepsLabel',
      'question.pack.pencils', 'question.pack.other', 'question.unpack.pencils', 'question.unpack.money', 'question.unpack.tokens', 'question.next', 'question.previous', 'question.borrow', 'question.dictation',
      'pill.digit', 'pill.count', 'classes.0', 'classes.1', 'classes.2',
      'discovery.prompt.rank', 'discovery.prompt.zero', 'discovery.right.rank', 'discovery.right.zero', 'discovery.asArrived', 'discovery.whyAsArrived',
      'discovery.allUnits', 'discovery.whyAllUnits', 'discovery.dropZero', 'discovery.whyDropZero', 'discovery.zeroAfterEach', 'discovery.whyZeroAfterEach',
      'formal.tableTitle', 'formal.digit', 'formal.count', 'formal.rule.rank', 'formal.rule.zero', 'formal.classesTitle'];
    for (const w of ['pencils', 'tokens', 'money']) keys.push(`title.${w}`);
    for (const tk of ['pack', 'unpack', 'next', 'previous', 'borrow', 'dictation']) keys.push(`chip.${tk}`, `idle.${tk}`);
    keys.push('idle.predict');
    for (const x of ['tie', 'carry', 'carryWritable', 'open', 'board', 'overflowNow', 'short', 'wrongColumn', 'wrongOpen', 'noUnit', 'overflow', 'wrongBoard', 'answer', 'answerLast', 'packRight', 'packWrong', 'unpackRight', 'unpackWrong', 'reached']) keys.push(`v.${x}`);
    for (const x of ['predict', 'answer', 'refused', 'pack', 'unpack', 'add', 'remove']) keys.push(`trial.${x}`);
    for (const x of ['short-pack', 'wrong-column', 'overflow', 'no-unit', 'wrong-board']) keys.push(`refusedName.${x}`);
    for (const r of [0, 1, 2, 3]) keys.push(`the.pencils.${r}`, `one.pencils.${r}`, `col.pencils.${r}`, `head.pencils.${r}`);
    for (const x of ['note', 'coin']) keys.push(`the.money.${x}`, `one.money.${x}`, `col.money.${x}`, `head.money.${x}`);
    keys.push('the.tokens', 'one.tokens');
    for (const h of ['pack', 'unpack', 'unpackMoney', 'next', 'previous', 'borrow', 'dictation']) for (let i = 0; i < 3; i += 1) keys.push(`hints.${h}.${i}`);
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s), key).toBe(true);
    }
  });

  it('nothing read BEFORE the rule states it: cards, prompts, gestures, verdicts, hints, the discovery prompt and its wrong options', () => {
    const before = [];
    const walk = (node, path) => {
      if (typeof node === 'string') before.push([path, node]);
      else if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${path}.${i}`));
      else if (node && typeof node === 'object') for (const [key, v] of Object.entries(node)) walk(v, `${path}.${key}`);
    };
    for (const part of ['context', 'question', 'predictAsk', 'digitCaption', 'idle', 'v', 'hints', 'chip', 'pill', 'trial']) walk(res(part), part);
    for (const key of ['discovery.prompt', 'discovery.asArrived', 'discovery.whyAsArrived', 'discovery.allUnits', 'discovery.whyAllUnits', 'discovery.dropZero', 'discovery.whyDropZero', 'discovery.zeroAfterEach', 'discovery.whyZeroAfterEach']) walk(res(key), key);
    expect(before.length).toBeGreaterThan(50);
    for (const [path, s] of before) {
      expect(statesRule(s), path).toBe(false);
      expect(s, path).not.toMatch(/(^|\D)201(\D|$)/);
    }
    // the right option IS the student's formulation (chosen, never shown as a hint); the rule itself lives in the formal phase
    expect(statesRule(res('formal.rule.rank'))).toBe(true);
    // the initial render of both levels never shows 201 (the unpacking answer) nor the formal
    for (const lv of ['beginner', 'advanced']) {
      const out = textOf(html({ ...LEVELS['rank-exchange'][lv].numbers }));
      expect(out).not.toMatch(/(^|\D)201(\D|$)/);
      expect(statesRule(out)).toBe(false);
    }
  });

  it('says each thing ONCE (MANIPULATION_DNA §17.7): no shell mission, the gesture told once, hints closed', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['rank-exchange'][lv].numbers });
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).not.toContain('data-manipulation-hints');
      const idle = lv === 'beginner' ? say('idle.predict') : say('idle.next');
      expect(out.split(idle).length - 1, lv).toBe(1);
      const prompt = lv === 'beginner' ? say('question.pack.pencils') : say('question.next');
      expect(out.split(prompt).length - 1, lv).toBe(1);
      // the title does not repeat the question
      expect(say(`title.${lv === 'beginner' ? 'pencils' : 'tokens'}`)).not.toContain('؟');
    }
  });

  it('opens on its CONTEXT then ONE question naming the end state — no title banner (MANIPULATION_DNA §17.9)', () => {
    const cases = [
      [{ ...LEVELS['rank-exchange'].beginner.numbers }, 'في الورشة صندوق واحد و13 علبةً و24 حزمةً و37 قلمًا.', say('question.pack.pencils')],
      [{ ...LEVELS['rank-exchange'].advanced.numbers }, 'على اللوحة العدد « تسعمائة وتسعة وتسعون ».', say('question.next')],
      [{ world: 'money', tasks: ['unpack'], n: 1345, rank: 2, levels: false }, 'في حصّالة يونس ورقة واحدة من', say('question.unpack.money')],
    ];
    for (const [props, context, question] of cases) {
      const out = html(props);
      // the shell heading is for screen readers only, and no chip names the lab
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out).not.toMatch(/<span class="inline-flex items-center gap-1\.5 rounded-full bg-indigo-50/);
      const txt = textOf(out).replace(/\s+/g, ' ');
      const c = txt.indexOf(context.replace(/[⁦⁩]/g, ''));
      const q = txt.indexOf(question);
      expect(c, context).toBeGreaterThan(-1);
      expect(q, question).toBeGreaterThan(c);
      expect(out.indexOf('data-lab-context')).toBeLessThan(out.indexOf('data-lab-question'));
      // the question is a verb with its end state (« … حتى … »), never a riddle about a concept
      expect(question).toMatch(/حتى/);
      expect(question).not.toMatch(/^ما (هو|هي|العدد)/);
    }
  });

  it('counted nouns agree (six Arabic plural forms)', () => {
    expect([0, 1, 2, 7, 37, 100].map((count) => say('noun.pencils.r0', { count }))).toEqual(['لا قلم', 'قلم واحد', 'قلمان', '7 أقلام', '37 قلمًا', '100 قلم']);
    expect([1, 2, 10, 201].map((count) => say('noun.pencils.r1', { count }))).toEqual(['حزمة واحدة', 'حزمتان', '10 حزم', '201 حزمة']);
    expect([1, 13].map((count) => say('noun.pencils.r2', { count }))).toEqual(['علبة واحدة', '13 علبةً']);
    expect([2, 3].map((count) => say('noun.pencils.r3', { count }))).toEqual(['صندوقان', '3 صناديق']);
    expect(say('noun.money.note', { count: 13, v: '100' })).toBe('13 ورقةً من 100 دج');
    expect(say('zeros', { count: 1 })).toBe('صفر واحد');
  });
});

describe('rank-exchange — onboarding (prop `coach`, prototype)', () => {
  const base = { ...LEVELS['rank-exchange'].beginner.numbers };
  it('est PRÉSENT par défaut et s\u2019éteint avec coach={false} : aucun interrupteur, aucune couche', () => {
    expect(html(base)).toContain('data-lab-coach-toggle');
    const out = html({ ...base, coach: false });
    expect(out).not.toContain('data-lab-coach-toggle');
    expect(out).not.toContain('data-lab-coach-layer');
  });
  it('avec `coach` : l’interrupteur est sous la consigne, avant la scène, et la couche est dans le cadre', () => {
    const out = html({ ...base, coach: true });
    expect(out).toContain('data-lab-coach-toggle');
    expect(out).toContain('data-lab-coach-layer');
    expect(out).toContain(say('coach.hide'));
    expect(out.indexOf('data-rx-prompt')).toBeLessThan(out.indexOf('data-lab-coach-toggle'));
    expect(out.indexOf('data-lab-coach-toggle')).toBeLessThan(out.indexOf('data-rx-stage'));
    expect(out).not.toMatch(RAW);
  });
  it('chaque astuce existe, sans clé brute ni interpolation oubliée, et ne donne JAMAIS la règle', () => {
    const vars = { ten: '10 أقلام', obj: 'حزمة', col: 'الحزم' };
    for (const key of ['predict', 'tie', 'carry', 'open', 'plus', 'minus', 'pick', 'check', 'nextTask', 'hide', 'show', 'ok', 'stop']) {
      const text = say(`coach.${key}`, vars);
      expect(text, key).toBeTruthy();
      expect(text, key).not.toMatch(/manipulation\.|\{\{/);
      expect(statesRule(text), key).toBe(false);
    }
  });
});

describe('rank-exchange — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.rankExchange.${key}`, o);
  const nm = () => [0, 1, 2, 3, 4, 5, 6].map((r) => ({
    count: (c) => `${c}`, the: `r${r}`, one: `واحد${r}`, col: `عمود${r}`,
  }));
  const cases = [
    ['beginner', LEVELS['rank-exchange'].beginner.numbers],
    ['advanced', LEVELS['rank-exchange'].advanced.numbers],
    ['money', { world: 'money', tasks: ['unpack'], n: 1345, rank: 2 }],
    ['dictation', { world: 'tokens', tasks: ['dictation'], dictation: [7065, 4908732] }],
  ];
  for (const [name, numbers] of cases) {
    it(`${name} : chaque question a un texte, une seule bonne réponse, deux indices, et ni clé brute ni {{`, () => {
      const lab = L.init(numbers);
      const dk = discoveryKindOf(lab.tasks);
      const chains = chainsOf(lab, dk);
      for (const tk of lab.tasks) {
        expect(chains[tk].length, tk).toBeGreaterThanOrEqual(2);
        for (const qid of chains[tk]) {
          const q = QUESTIONS[qid](lab, tk, k, nm(lab.world), dk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, i) => <span key={i}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk}.${qid}`).not.toMatch(RAW);
          expect(out, `${tk}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${tk}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${tk}.${qid}`).toBeTruthy();
        }
      }
    });
  }
  it('les nombres viennent de la tâche ; la règle clôt la dernière tâche de la découverte', () => {
    const lab = L.init(LEVELS['rank-exchange'].beginner.numbers);
    const chains = chainsOf(lab);
    expect(chains.unpack.at(-1)).toBe('rule');
    expect(chains.pack).not.toContain('rule');
    expect(QUESTIONS.count(lab, 'unpack', k, nm('pencils')).expected).toBe('201');
    const adv = L.init(LEVELS['rank-exchange'].advanced.numbers);
    expect(QUESTIONS.value(adv, 'next', k, nm('tokens')).expected).toBe('1000');
    expect(QUESTIONS.links(adv, 'next', k, nm('tokens')).expected).toBe('3');
    expect(QUESTIONS.opens(adv, 'borrow', k, nm('tokens')).expected).toBe('3');
    expect(chainsOf(L.init({ world: 'money', tasks: ['unpack'], n: 1345, rank: 2 })).unpack).toEqual(['count', 'digitCount']);
    expect(chainsOf(adv).dictation.at(-1)).toBe('rule');
  });
});

describe('rank-exchange — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    for (const numbers of [LEVELS['rank-exchange'].beginner.numbers, { world: 'money', tasks: ['unpack'], n: 1345, rank: 2, levels: false }]) {
      const g = html(numbers);
      expect(g).not.toContain('data-manipulation-progress');
      expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
      const off = html({ ...numbers, checkpoints: false });
      expect(off).toContain('data-manipulation-progress');
      expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
    }
  });
});
