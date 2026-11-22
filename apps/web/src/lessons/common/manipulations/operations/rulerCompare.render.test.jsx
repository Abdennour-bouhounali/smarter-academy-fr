import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import RulerCompare, { Formal, discoveryOptions, highlightParts } from './RulerCompare';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/rulerCompare';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<RulerCompare {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.rulerCompare.${key}`, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const count = (out, needle) => out.split(needle).length - 1;

const LV = LEVELS['ruler-compare'];
const cases = {
  'compare beginner': { ...LV.beginner.numbers, level: 'beginner' },
  'order advanced': { ...LV.advanced.numbers, level: 'advanced' },
};

describe('ruler-compare — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders the ruler, the readings, the free panel; no raw key, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-ruler-compare');
      expect(out).toContain('data-world="jump"');
      expect(out).toContain('data-rc-glance');
      expect(out).toContain('data-rc-knob');
      expect(attrs(out, 'data-rc-grad')).toEqual(['0', '1', '2', '3']);
      expect(out).toContain('data-rc-lamp');
      expect(out).toContain('data-rc-free');
      expect(out).toContain('data-active="false"');
      expect(out).not.toContain('data-rc-next');
      expect(out).not.toContain('data-rc-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
    });
  }

  it('compare: two lanes with their readings at the metre (4,6 and 4,35 both read 4 + a leftover), the verdict buttons, the lamp undecided', () => {
    const out = html(cases['compare beginner']);
    expect(attrs(out, 'data-rc-reading')).toEqual(['0', '1']);
    expect(attrs(out, 'data-count')).toContain('4');
    expect(out).toContain('data-rc-verdicts');
    expect(attrs(out, 'data-rc-verdict')).toEqual(['lt', 'eq', 'gt']);
    expect(out).toContain('data-decided="false"');
    expect(out).toContain('data-rc-kid="rim"'); // a girl in hijab (KidFigure)
    expect(out).toContain('data-kid-hijab');
    expect(out).toContain('data-frac="35/100"'); // the exact leftover of 4,35 on the metre ruler
    expect(out).toContain('data-frac="6/10"');
    expect(attrs(out, 'data-rc-step')).toEqual(['0', '1', '2', '3']);
  });

  it('order: five jumps on the sand, five slots, the check button disabled until the slots are full', () => {
    const out = html(cases['order advanced']);
    expect(attrs(out, 'data-rc-jump')).toHaveLength(5);
    expect(attrs(out, 'data-rc-slot')).toEqual(['0', '1', '2', '3', '4']);
    expect(out).toContain('data-rc-tray');
    expect(out).toMatch(/<button[^>]*data-rc-check[^>]*disabled/);
  });

  it('a standalone use with its own tasks and levels={false}', () => {
    const out = html({ tasks: [{ kind: 'compare', a: '3,14', b: '3,2' }], levels: false });
    expect(out).toContain('data-task="0"');
    expect(out).not.toContain('data-rc-step=');
    expect(out).toContain('3,14');
    const o2 = html({ tasks: { kind: 'order', values: ['0,5', '0,25', '0,75'], dir: 'desc' }, levels: false });
    expect(attrs(o2, 'data-rc-jump')).toHaveLength(3);
  });

  it('inside a workspace: one selector', () => {
    const out = renderToString(<ManipulationWorkspace levels={{
      beginner: () => <RulerCompare level="beginner" {...LV.beginner.numbers} />,
      advanced: () => <RulerCompare level="advanced" {...LV.advanced.numbers} />,
    }} />);
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });
});

describe('ruler-compare — les textes', () => {
  it('every string exists in Arabic, fully interpolated', () => {
    const o = { x: 'ريم', y: 'سامي', a: '4,6', b: '4,35', ca: '46', cb: '43', jumps: '5 قفزات', ruler: 'الديسيمتر', reading: '46 ديسيمترًا', rest: 'باقٍ', word: 'أصغر من', i: 1, j: 2, list: '1، 2', name: 'ريم',
      text: '4,6', sym: '<', what: 'ما', small: '4,35', big: '4,6', sn: '35', bn: '6', sd: 'رقمان', bd: 'رقم واحد', count: 3, rank: 'الأعشار' };
    const keys = ['title', 'comma', 'metre', 'context.compare', 'context.order', 'context.free', 'context.freeOrder', 'question.freeOrder_asc', 'question.freeOrder_desc', 'free.hintOrder', 'free.n', 'free.nAria', 'question.compare', 'question.order_asc', 'question.order_desc', 'question.free', 'stepsLabel', 'stepsAria', 'stepAria',
      'next', 'stamp', 'check', 'tapeAria', 'readAria', 'rest.none', 'rest.some', 'lamp.yes', 'lamp.no', 'verdictAria', 'shownAria', 'word.lt', 'word.eq', 'word.gt', 'idle.compare', 'idle.order',
      'v.coarse', 'v.wrong', 'v.right', 'v.rightEq', 'v.coarseOrder', 'v.inversion', 'v.orderRight', 'sand.title', 'sand.empty', 'jumpAria', 'podium.title', 'podium.shortest', 'podium.farthest', 'podium.slotAria',
      'free.title', 'free.hint', 'free.bad', 'free.on', 'free.a', 'free.b', 'free.aAria', 'free.bAria', 'free.back', 'trialsTitle', 'trial.line', 'trial.free', 'trial.ruler', 'trial.place', 'trial.checkRefused',
      'trial.checkRight', 'trial.checkWrong', 'trial.verdictRefused', 'trial.verdictRight', 'trial.verdictWrong', 'explanation', 'hints.0', 'hints.1', 'hints.2',
      'coach.hide', 'coach.show', 'coach.ok', 'coach.stop', 'coach.ruler', 'coach.verdict', 'coach.place', 'coach.check', 'coach.next',
      'discovery.prompt', 'discovery.right', 'discovery.digits', 'discovery.whyDigits', 'discovery.longer', 'discovery.whyLonger',
      'formal.rank', 'formal.rankWhole', 'formal.equal', 'formal.rule', 'formal.notLonger', 'formal.chainAsc', 'formal.chainDesc',
      'ruler.m', 'ruler.dm', 'ruler.cm', 'ruler.mm', 'ruler.title', 'ruler.stopAria', 'ruler.knob', 'unit.m', 'unit.dm', 'unit.cm', 'unit.mm'];
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s) || key === 'comma' || key === 'metre', key).toBe(true);
    }
  });

  it('counted nouns agree (zero, one, two, few, many, other)', () => {
    const all = [0, 1, 2, 3, 10, 11, 99, 100];
    expect(all.map((count) => say('count.m', { count }))).toEqual(['لا متر', 'متر واحد', 'مترين', '3 أمتار', '10 أمتار', '11 مترًا', '99 مترًا', '100 متر']);
    expect([1, 2, 5, 46, 460].map((count) => say('count.dm', { count }))).toEqual(['ديسيمتر واحد', 'ديسيمترين', '5 ديسيمترات', '46 ديسيمترًا', '460 ديسيمترًا']);
    expect([1, 2, 5, 435].map((count) => say('count.cm', { count }))).toEqual(['سنتيمتر واحد', 'سنتيمترين', '5 سنتيمترات', '435 سنتيمترًا']);
    expect([1, 2, 5, 4350].map((count) => say('count.mm', { count }))).toEqual(['ميليمتر واحد', 'ميليمترين', '5 ميليمترات', '4350 ميليمترًا']);
    expect([1, 2, 5, 30].map((count) => say('jump', { count }))).toEqual(['قفزة واحدة', 'قفزتان', '5 قفزات', '30 قفزةً']);
  });

  it('opens on CONTEXT then ONE question, no title banner; says each thing ONCE', () => {
    for (const [name, props] of Object.entries(cases)) {
      const out = html(props);
      expect(out, name).not.toContain('data-manipulation-mission');
      expect(out, name).toMatch(/<h3 class="sr-only">/);
      expect(out, name).toContain('data-lab-context');
      expect(out, name).toContain('data-lab-question');
      const t = text(out);
      const q = props.tasks[0].kind === 'order' ? say(`question.order_${props.tasks[0].dir}`) : say('question.compare');
      expect(count(t, q), name).toBe(1);
      expect(count(out, say(props.tasks[0].kind === 'order' ? 'idle.order' : 'idle.compare')), name).toBe(1);
      expect(out, name).not.toContain(say('hints.0'));
    }
    const t = text(html(cases['compare beginner']));
    expect(t).toContain('4,6');
    expect(t).toContain('4,35');
    expect(t).toContain('ريم');
  });

  it('no prompt, question, hint, idle line, coach text or verdict leaks the rule it hides', () => {
    const strings = [say('discovery.prompt'), say('idle.compare'), say('idle.order'), say('explanation'), ...[0, 1, 2].map((i) => say(`hints.${i}`)),
      ...['compare', 'order_asc', 'order_desc', 'free', 'freeOrder_asc', 'freeOrder_desc'].map((x) => say(`question.${x}`)),
      say('context.compare', { x: 'ريم', a: '4,6', y: 'سامي', b: '4,35' }), say('context.order', { jumps: '5' }),
      ...['ruler', 'verdict', 'place', 'check', 'next'].map((x) => say(`coach.${x}`)),
      say('lamp.no'), say('lamp.yes')];
    for (const s of strings) {
      expect(s).not.toMatch(/أول رتبة|أول مرتبة|رتبة بعد رتبة|أصفار غير ضرورية|عددين طبيعيين|أرقام أكثر|الأرقام بعد الفاصلة/);
    }
    // the verdict lines state READINGS only, never which graduation would be enough
    for (const key of ['v.coarse', 'v.coarseOrder']) expect(say(key, { reading: '46', a: '1', b: '2' })).not.toMatch(/أدق|أصغر تدريج|السنتيمتر|الميليمتر/);
    expect(say('discovery.right')).not.toMatch(/\d/);
  });
});

/* ── la découverte et la phase formelle, rendues depuis des états réels ── */
const kk = (key, o) => i18n.t(`lesson:manipulation.rulerCompare.${key}`, o);
const solveBeginner = () => {
  let s = L.init({ tasks: LV.beginner.numbers.tasks });
  LV.beginner.numbers.tasks.forEach((raw, i) => {
    const t = L.normalizeTask(raw);
    s = L.setRuler(s, t.minG);
    s = L.verdict(s, t.verdict);
    if (i < 3) s = L.nextTask(s);
  });
  return s;
};
const solveAdvanced = () => {
  let s = L.init({ tasks: LV.advanced.numbers.tasks });
  LV.advanced.numbers.tasks.forEach((raw, i) => {
    const t = L.normalizeTask(raw);
    s = L.setRuler(s, t.rowG);
    L.rightOrder(t).forEach((jump, slot) => { s = L.place(s, jump, slot); });
    s = L.check(s);
    if (i < 1) s = L.nextTask(s);
  });
  return s;
};

describe('ruler-compare — découverte et règle, avec SES nombres', () => {
  it('the right option states no number; the wrong ones are refuted with his own pairs', () => {
    const s = solveBeginner();
    expect(L.discoveryReady(s)).toBe(true);
    const opts = discoveryOptions(s, kk);
    expect(opts).toHaveLength(3);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    expect(opts.find((o) => o.correct).text).not.toMatch(/\d/);
    const [digits, , longer] = opts;
    expect(digits.why).toContain('35');
    expect(digits.why).toContain('4,35');
    expect(longer.why).toContain('4,35');
    expect(longer.why).toContain('4,6');
    expect(`${digits.why}${longer.why}`).not.toContain('{{');
  });

  it('formal (compare): the written numbers with the first differing rank highlighted and the zero completion, then the rule once', () => {
    const out = renderToString(<Formal lab={solveBeginner()} k={kk} />);
    expect(out).toContain('data-rc-formal="compare"');
    expect(count(out, 'data-rc-formal-card=')).toBe(4);
    expect(out).toContain('data-hl="true"');
    expect(out).toContain('data-ghost="true"');
    expect(count(out, 'data-rc-formal-equal')).toBe(1); // 12,70 = 12,7
    const t = text(out);
    expect(t).toContain('4,60 > 4,35');
    expect(t).toContain('460 > 435');
    expect(t).toContain('8,05 < 8,50');
    expect(t).toContain('12,70 = 12,70');
    expect(count(t, kk('formal.rule'))).toBe(1);
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
  });

  it('formal (order): the chain with its symbols and the readings', () => {
    const out = renderToString(<Formal lab={solveAdvanced()} k={kk} />);
    expect(out).toContain('data-rc-formal-chain');
    const t = text(out);
    expect(t).toContain('3 > 2,5 = 2,500 > 2,05 > 0,75');
    expect(t).toContain('30 > 25 = 25 > 20 > 7');
    expect(out).not.toMatch(RAW);
  });

  it('highlightParts: ghost zeros complete the shorter number; the whole part is highlighted when it differs', () => {
    expect(highlightParts('4,6', 1, 2).map((p) => p.t).join('')).toBe('4,60');
    expect(highlightParts('4,6', 1, 2).filter((p) => p.hl).map((p) => p.t)).toEqual(['6']);
    expect(highlightParts('4,6', 1, 2).filter((p) => p.ghost)).toHaveLength(1);
    expect(highlightParts('9,87', 0, 2).filter((p) => p.hl).map((p) => p.t)).toEqual(['9']);
    expect(highlightParts('12', 0, 0).map((p) => p.t).join('')).toBe('12');
  });
});

describe('ruler-compare — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.rulerCompare.${key}`, o);
  for (const [name, props] of Object.entries(cases)) {
    it(`${name} : chaque question de chaque tâche a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{`, async () => {
      const { chainOf, QUESTIONS } = await import('./RulerCompare');
      const lab = L.init(props);
      lab.tasks.forEach((_, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          if (qid === 'rule') continue;   // la découverte : couverte ailleurs
          const q = QUESTIONS[qid](lab, i, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${i}.${qid}`).toHaveLength(1);
            expect(new Set(q.options.map((o) => renderToString(<>{o.text}</>))).size, `${i}.${qid} distinctes`).toBe(q.options.length);
          } else expect(q.expected, `${i}.${qid}`).toBeTruthy();
        }
      });
    });
  }
  it('les nombres viennent des sauts : 46 décimètres pour 4,6 ; le décimètre sépare 4,6 et 4,35 ; = pour 12,70', async () => {
    const { chainOf, QUESTIONS } = await import('./RulerCompare');
    const lab = L.init(cases[Object.keys(cases)[0]]);
    expect(chainOf(lab, 0)).toEqual(['read', 'grad']);
    expect(QUESTIONS.read(lab, 0, k).expected).toBe('46');
    expect(chainOf(lab, 2)).toEqual(['read', 'equal']);
    expect(chainOf(lab, lab.tasks.length - 1).at(-1)).toBe('rule');
  });
});

describe('ruler-compare — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const props = cases[Object.keys(cases)[0]];
    const g = html(props);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...props, checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
