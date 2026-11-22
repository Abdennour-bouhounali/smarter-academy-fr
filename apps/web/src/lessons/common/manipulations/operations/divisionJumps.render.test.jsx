import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import DivisionJumps, { thenOf } from './DivisionJumps';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';

/**
 * division-jumps se rend aux deux niveaux de levels.js (le rang de fleurs ; la droite de نشاط 3) et pour
 * l'exemple de معارف seul (253 ÷ 17, levels={false}), sans clé i18n brute, sans interpolation oubliée,
 * sans prose latine.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<DivisionJumps {...props} />);
/** Le texte visible (hors balises) : aucune prose latine (a, b, q, r isolés sont des lettres de formule). */
const latinWords = (out) => {
  const text = out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return text.match(/[A-Za-z]{2,}/g) ?? [];
};
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const say = (key, o) => i18n.t(`lesson:manipulation.divisionJumps.${key}`, o);

describe('division-jumps — rendu', () => {
  it('beginner (flowers): 47 drawn flowers, the ribbon handle at q = 0, no verdict, no bouquet yet', () => {
    const out = html({ ...LEVELS['division-jumps'].beginner.numbers });
    expect(out).toContain('data-division-jumps');
    expect(out).toContain('data-world="flowers"');
    expect(out).toContain('data-a="47"');
    expect(out).toContain('data-b="6"');
    expect(out).toContain('data-solved="false"');
    expect(out).toContain('data-q="0"');
    expect(out).toContain('data-dj-glance');
    expect(out).toContain('data-dj-scene');
    expect(out).toContain('data-dj-handle');
    expect(out).toContain('role="slider"');
    expect(out).toContain('aria-valuemax="9"');
    expect(attrs(out, 'data-dj-flower')).toHaveLength(47);
    expect(out).not.toContain('data-dj-group=');
    expect(out).toContain('data-dj-left="47"');
    expect(out).toContain('data-dj-less');
    expect(out).toContain('data-dj-more');
    expect(out).toContain('data-dj-verdict=""');
    expect(out).not.toContain('data-dj-refused');
    expect(out).not.toContain('data-dj-ghost');
    expect(out).not.toContain('data-dj-next');
    expect(out).not.toContain('data-dj-formal');
    expect(out).toContain('47 زهرةً');
    expect(out).toContain('6 زهرات');
    expect(out).toContain('data-manipulation-levels-selector');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('advanced (line, نشاط 3): the number line to 308, the 279 mark, the textbook\'s 10؟ 20؟ marks, no flowers', () => {
    const out = html({ ...LEVELS['division-jumps'].advanced.numbers });
    expect(out).toContain('data-world="line"');
    expect(out).toContain('data-a="279"');
    expect(out).toContain('data-b="14"');
    expect(out).toContain('data-dj-target="279"');
    expect(attrs(out, 'data-dj-mark')).toEqual(['10', '20']);
    expect(out).toContain('10 قفزات؟');
    expect(out).toContain('20 قفزةً؟');
    expect(out).toContain('data-dj-landing="0"');
    expect(out).toContain('aria-valuemax="22"');
    expect(out).not.toContain('data-dj-flower');
    // no multiple of 14 written before a jump lands on it (the round graduation numbers only)
    const labels = [...out.matchAll(/<text[^>]*>(\d+)<\/text>/g)].map((m) => Number(m[1]));
    expect(labels.length).toBeGreaterThan(3);
    for (const n of labels) if (n !== 0 && n !== 279) expect(n % 14, `label ${n}`).not.toBe(0);
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('the معارف worked example alone (253 ÷ 17, levels={false}): no level selector, no marks, no contrast', () => {
    const out = html({ world: 'line', a: 253, b: 17, levels: false });
    expect(out).toContain('data-a="253"');
    expect(out).toContain('data-b="17"');
    expect(out).toContain('data-dj-target="253"');
    expect(out).not.toContain('data-dj-mark');
    expect(out).toContain('aria-valuemax="17"');
    expect(out).not.toContain('data-manipulation-levels-selector');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(latinWords(out)).toEqual([]);
  });

  it('inside a workspace: one selector; the lesson\'s 47/6 without `then` gets the contrast 48', () => {
    const out = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <DivisionJumps level="beginner" world="flowers" a={47} b={6} />,
        advanced: () => <DivisionJumps level="advanced" world="line" a={279} b={14} />,
      }} />,
    );
    expect(out).toContain('data-world="flowers"');
    expect(out).toContain('data-world="line"');
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
    expect(thenOf('flowers', 47, 6)).toBe(48);
    expect(thenOf('flowers', 48, 6)).toBeNull();
    expect(thenOf('line', 279, 14)).toBeNull();
  });

  it('every string a verdict, a refusal, the contrast or the discovery can show exists, in Arabic, fully interpolated', () => {
    const o = {
      a: 47, b: 6, q: 7, n: 10, land: 42, left: 5, over: 1, L: 60, need: '48 زهرةً', have: '47 زهرةً', missing: 'زهرة واحدة',
      per: '6 زهرات', flowers: '47 زهرةً', bouquets: '7 باقات', jumps: '7 قفزات', leftF: '5 زهرات', groupsN: '10 باقات', groups: '8 باقات', word: 'كلمة', r: 5,
    };
    const keys = ['explanation', 'mark', 'bracketTitle', 'trial', 'trialsTitle', 'next.title', 'next.text', 'next.button', 'next.back', 'formal.then'];
    for (const w of ['flowers', 'line']) {
      keys.push(`title.${w}`, `context.${w}`, `question.${w}`, `instruction.${w}`, `stepTitle.${w}`, ...(w === 'line' ? ['q', 'land'] : ['q', 'need', 'left']).map((x) => `reading.${w}.${x}`), `handle.${w}`, `handleValue.${w}`, `less.${w}`, `more.${w}`, `sceneAria.${w}`,
        `discovery.prompt.${w}`, `discovery.right.${w}`, `discovery.nothing.${w}`, `discovery.ten.${w}`, `discovery.whyNothing.${w}`,
        `discovery.whyTen.${w}.over`, `discovery.whyTen.${w}.short`, `formal.rule.${w}`, `need.${w}.over`, `need.${w}.short`,
        ...['over', 'short', 'exact'].map((kd) => `kind.${w}.${kd}`), ...['a', 'b', 'q', 'r'].map((r) => `formal.roles.${r}.${w}`));
      for (let i = 0; i < 2; i += 1) keys.push(`hints.${w}.${i}`);
    }
    keys.push(...['overLast', 'over', 'short', 'shortZero', 'exact', 'exactZero'].map((x) => `v.flowers.${x}`));
    keys.push(...['over', 'short', 'shortZero', 'exact', 'exactZero'].map((x) => `v.line.${x}`));
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s), key).toBe(true);
    }
    // the discovery options are labels (the right one carries no number at all)
    for (const w of ['flowers', 'line']) {
      expect(i18n.getResource('ar-DZ', 'lesson', `manipulation.divisionJumps.discovery.right.${w}`)).not.toMatch(/\d|\{\{/);
      expect(i18n.getResource('ar-DZ', 'lesson', `manipulation.divisionJumps.discovery.nothing.${w}`)).not.toMatch(/\d|\{\{/);
    }
    // the hints never give the quotient of the lesson's numbers
    for (const [w, a, b, q] of [['flowers', 47, 6, 7], ['line', 279, 14, 19]]) {
      for (let i = 0; i < 2; i += 1) expect(say(`hints.${w}.${i}`, { a, b })).not.toMatch(new RegExp(`(^|\\D)${q}(\\D|$)`));
    }
  });

  it('says each thing ONCE (MANIPULATION_DNA §17): no shell mission over the prompt card, the gesture told once, hints closed', () => {
    for (const lv of ['beginner', 'advanced']) {
      const out = html({ ...LEVELS['division-jumps'][lv].numbers });
      const w = lv === 'beginner' ? 'flowers' : 'line';
      expect(out).not.toContain('data-manipulation-mission');
      expect(out).not.toContain('data-manipulation-hints');
      expect(out.split(say(`instruction.${w}`)).length - 1).toBe(1);
      expect(out).not.toMatch(/أو استعمل/);
    }
  });

  it('opens on its CONTEXT then ONE question naming the end state — no title banner (MANIPULATION_DNA §17.9)', () => {
    const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const lead = 'عندنا 253 لؤلؤة، وفي كل عقد 17 لؤلؤة: كل قفزة على المستقيم طولها 17، أي عقد.';
    for (const [props, w, context] of [
      [LEVELS['division-jumps'].beginner.numbers, 'flowers', 'عند بائعة الأزهار 47 زهرةً، وفي كل باقة 6 زهرات.'],
      [LEVELS['division-jumps'].advanced.numbers, 'line', 'يقفز الأرنب على المستقيم من 0 نحو 279، وطول كل قفزة 14.'],
      [{ world: 'line', a: 253, b: 17, levels: false, title: 'مثال الكتاب: اللؤلؤ والعقود', lead }, 'line', lead],
    ]) {
      const out = html({ ...props });
      expect(out).toMatch(/<h3 class="sr-only">/);
      expect(out).not.toMatch(/<span class="inline-flex items-center gap-1\.5 rounded-full bg-indigo-50/);
      expect(out).toContain(`data-dj-context="${w}"`);
      const t = text(out);
      const question = say(`question.${w}`, { a: props.a }).replace(/\s+/g, ' ');
      expect(t.indexOf(context), context).toBeGreaterThan(-1);
      expect(t.indexOf(question), question).toBeGreaterThan(t.indexOf(context));
      expect(t.split(question).length - 1).toBe(1);
      expect(question).toMatch(/حتى/);
      // the question never repeats the gesture line nor the stopping rule (§17.4, §17.7)
      expect(question).not.toMatch(/اسحب|تتجاوز|لا تكفي/);
    }
  });

  it('counted nouns agree (six Arabic plural forms)', () => {
    expect([0, 1, 2, 5, 13, 100].map((count) => say('flowers', { count }))).toEqual(['لا زهرة', 'زهرة واحدة', 'زهرتان', '5 زهرات', '13 زهرةً', '100 زهرة']);
    expect([1, 2, 7, 19].map((count) => say('bouquets', { count }))).toEqual(['باقة واحدة', 'باقتان', '7 باقات', '19 باقةً']);
    expect([1, 2, 10, 20].map((count) => say('jumps', { count }))).toEqual(['قفزة واحدة', 'قفزتان', '10 قفزات', '20 قفزةً']);
  });
});

describe('division-jumps — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.divisionJumps.${key}`, o);
  const RAW_KEY = /manipulation\.[a-zA-Z]/;
  const check = (lab, QUESTIONS, chainOf) => {
    for (const qid of chainOf(lab)) {
      if (qid === 'rule') continue;   // la découverte : couverte ailleurs
      const q = QUESTIONS[qid](lab, k);
      const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
      expect(out, qid).not.toMatch(RAW_KEY);
      expect(out, qid).not.toContain('{{');
      expect(q.hints, qid).toHaveLength(2);
      if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), qid).toHaveLength(1);
      else expect(q.expected, qid).toBeTruthy();
    }
  };
  it('مبتدئ : 47 (quotient 7, reste 5, la règle) puis 48 ; متقدم : 279 ÷ 14 avec le حصر', async () => {
    const { chainOf, QUESTIONS } = await import('./DivisionJumps');
    const L = await import('../logic/divisionJumps');
    const lab = L.init(LEVELS['division-jumps'].beginner.numbers);
    expect(chainOf(lab)).toEqual(['quotient', 'remainder', 'rule']);
    expect(QUESTIONS.quotient(lab, k).expected).toBe('7');
    expect(QUESTIONS.remainder(lab, k).expected).toBe('5');
    check(lab, QUESTIONS, chainOf);
    const then = { ...lab, a: lab.then };
    expect(chainOf(then)).toEqual(['thenRemainder', 'thenWhy']);
    expect(QUESTIONS.thenRemainder(then, k).expected).toBe('0');
    check(then, QUESTIONS, chainOf);
    const adv = L.init(LEVELS['division-jumps'].advanced.numbers);
    expect(chainOf(adv)).toContain('bracket');
    expect(QUESTIONS.quotient(adv, k).expected).toBe('19');
    check(adv, QUESTIONS, chainOf);
  });
});

describe('division-jumps — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', async () => {
    const { default: DivisionJumps } = await import('./DivisionJumps');
    const props = { ...LEVELS['division-jumps'].beginner.numbers, level: 'beginner' };
    const g = renderToString(<DivisionJumps {...props} />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = renderToString(<DivisionJumps {...props} checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
