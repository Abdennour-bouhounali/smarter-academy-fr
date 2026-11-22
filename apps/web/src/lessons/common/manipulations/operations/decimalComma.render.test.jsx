import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import DecimalComma from './DecimalComma';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import { MACHINE_PRESETS } from '../logic/decimalComma';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<DecimalComma {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[\u2066\u2069]/g, '').replace(/\s+/g, ' ');
const say = (key, o) => i18n.t(`lesson:manipulation.decimalComma.${key}`, o);
const attrs = (out, name) => [...out.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const count = (out, needle) => out.split(needle).length - 1;

const LV = LEVELS['decimal-comma'];
const cases = {
  'mosaic beginner': { ...LV.beginner.numbers, level: 'beginner' },
  'mosaic advanced': { ...LV.advanced.numbers, level: 'advanced' },
  'machine beginner': { world: 'machine', tasks: MACHINE_PRESETS.beginner, level: 'beginner' },
  'machine advanced': { world: 'machine', tasks: MACHINE_PRESETS.advanced, level: 'advanced' },
};

describe('decimal-comma — rendu', () => {
  for (const [name, props] of Object.entries(cases)) {
    it(`${name}: renders the slip, the comma, the readouts; no raw key, no Latin prose`, () => {
      const out = html(props);
      expect(out).toContain('data-decimal-comma');
      expect(out).toContain(`data-world="${props.world}"`);
      expect(out).toContain('data-dc-glance');
      expect(out).toContain('data-dc-comma');
      expect(out).toContain('data-dc-written');
      expect(out).toContain('data-dc-fraction');
      expect(out).toContain('data-dc-slip="output"');
      expect(out).toContain('data-dc-free');
      expect(out).toContain('data-active="false"');
      expect(out).toContain('data-dc-free-digits');
      expect(out).toContain('data-dc-verdict=""');
      expect(out).not.toContain('data-dc-next');
      expect(out).not.toContain('data-dc-formal');
      expect(out).not.toMatch(RAW);
      expect(out).not.toContain('{{');
      expect(text(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
      const task0 = props.tasks[0];
      const digits = task0.kind === 'shift' ? task0.start.replace(',', '') : task0.digits;
      expect(attrs(out, 'data-dc-digit').length).toBeGreaterThanOrEqual(digits.length);
      expect(out).toContain(`aria-valuemax="${digits.length}"`);
    });
  }

  it('mosaic: the client table and the tray (blocks) are there; fraction tasks show the order instead of a table of blocks', () => {
    const b = html(cases['mosaic beginner']);
    expect(b).toContain('data-dc-table="target"');
    expect(b).toContain('data-dc-table="tray"');
    expect(attrs(b, 'data-dc-block').filter((x) => x === 'panel').length).toBeGreaterThan(0);
    expect(attrs(b, 'data-dc-block')).toContain('strip');
    expect(attrs(b, 'data-dc-block')).toContain('tile');
    const a = html(cases['mosaic advanced']);
    expect(a).toContain('data-dc-order');
    expect(a).toContain('data-num="3125"');
    expect(a).toContain('data-zeros="3"');
    expect(a).toContain('data-dc-table="tray"');
  });

  it('mosaic: the slip is printed with the comma at the far right; the fraction is the number over 1', () => {
    const out = html(cases['mosaic beginner']);
    expect(out).toContain('data-dc-fraction="235/1"');
    expect(text(out)).toContain('235');
    expect(out).toContain('data-point="0"');
  });

  it('machine: the machine with its operator, the input slip and the output slip, and two zero buttons', () => {
    const out = html(cases['machine beginner']);
    expect(out).toContain('data-dc-machine');
    expect(out).toContain('data-dc-op="×10"');
    expect(out).toContain('data-dc-slip="input"');
    expect(out).toContain('data-dc-slip="output"');
    expect(out).toContain('data-dc-zero="left"');
    expect(out).toContain('data-dc-zero="right"');
    expect(out).toContain('data-dc-fraction="35/10"');
    expect(out).not.toContain('data-dc-table');
    const adv = html(cases['machine advanced']);
    expect(adv).toContain('data-dc-op="×1000"');
    expect(adv).toContain('data-dc-fraction="14375/100"');
  });

  it('the free panel is always open, in both worlds (the machine one has the nine operators)', () => {
    const m = html(cases['mosaic beginner']);
    expect(m).toContain('data-dc-free');
    expect(m).not.toContain('data-dc-free-op=');
    const x = html(cases['machine beginner']);
    expect((x.match(/data-dc-free-op-button="/g) ?? []).length).toBe(9);
    expect(x).not.toContain('data-dc-free-back');
  });

  it('a single task object is tolerated (module standalone)', () => {
    const out = html({ world: 'machine', tasks: { kind: 'shift', start: '3,5', op: '÷100' }, levels: false });
    expect(out).toContain('data-dc-op="÷100"');
    expect(out).not.toContain('data-dc-step=');
  });

  it('the first task is the current one, with the task steps when there are several', () => {
    const out = html(cases['mosaic beginner']);
    expect(attrs(out, 'data-dc-step')).toEqual(['0', '1', '2']);
    expect(out).toContain('data-task="0"');
  });

  it('inside a workspace: one selector', () => {
    const out = renderToString(<ManipulationWorkspace levels={{
      beginner: () => <DecimalComma level="beginner" {...LV.beginner.numbers} />,
      advanced: () => <DecimalComma level="advanced" {...LV.advanced.numbers} />,
    }} />);
    expect((out.match(/data-manipulation-levels-selector/g) ?? []).length).toBe(1);
  });
});

describe('decimal-comma — les textes', () => {
  it('every string exists in Arabic, fully interpolated', () => {
    const o = { digits: '235', start: '3,5', op: '×10', pieces: 'لوحتان', shown: '2,35', value: '2,35', big: '235', small: '0,235', wide: '0,235', narrow: '23,5', pw: '3 أرقام', pn: 'رقم واحد', result: '35', eq: '3,5 ×10 = 35', words: 'w', rank: 'الأعشار', count: 3, long: '2,50', short: '2,5', places: 'مرتبتين', dir: 'اليسار', num: 3, den: 100, i: 1, word: 'أكثر' };
    const keys = ['title.mosaic', 'title.machine', 'and', 'tinier', 'context.match', 'context.fraction', 'context.shift', 'context.free', 'question.match', 'question.fraction', 'question.shift',
      'question.freeMosaic', 'question.freeMachine', 'zone.table', 'zone.order', 'zone.tray', 'zone.input', 'zone.output', 'read.written', 'read.fraction', 'idle.mosaic', 'idle.machine',
      'v.exactMatch', 'v.exactFraction', 'v.exactMachine', 'v.more', 'v.less', 'v.moreMachine', 'v.lessMachine', 'v.nodigit', 'v.tray', 'v.empty', 'v.freeMachine', 'stamp.match', 'stamp.machine',
      'next', 'stepsLabel', 'stepsAria', 'stepAria', 'slip.comma', 'slip.gap', 'slip.removeZero', 'slip.addLeft', 'slip.addRight', 'slip.aria', 'order.aria', 'trialsTitle', 'trial',
      'kind.exact', 'kind.more', 'kind.less', 'kind.nodigit', 'kind.free', 'explanation',
      'coach.hide', 'coach.show', 'coach.ok', 'coach.stop', 'coach.grab', 'coach.moveMosaic', 'coach.moveMachine', 'coach.zero', 'coach.next',
      'free.title', 'free.hintMosaic', 'free.hintMachine', 'free.on', 'free.digits', 'free.digitsAria', 'free.op', 'free.back',
      'discovery.mosaic.prompt', 'discovery.mosaic.right', 'discovery.mosaic.same', 'discovery.mosaic.whySame', 'discovery.mosaic.longer', 'discovery.mosaic.whyLonger',
      'discovery.machine.prompt', 'discovery.machine.right', 'discovery.machine.digits', 'discovery.machine.whyDigits', 'discovery.machine.zeros', 'discovery.machine.whyZeros', 'discovery.machine.whyZerosSome',
      'formal.tableTitle', 'formal.fraction', 'formal.reads', 'formal.count', 'formal.trailing', 'formal.zeroKeeper', 'formal.rule', 'formal.machineTitle', 'formal.before', 'formal.after', 'formal.moved', 'formal.dirLeft', 'formal.dirRight', 'formal.clean', 'formal.ruleMachine',
      ...[0, 1, 2].flatMap((i) => [`hints.mosaic.${i}`, `hints.machine.${i}`])];
    for (const key of keys) {
      const s = say(key, o);
      expect(s, key).not.toMatch(RAW);
      expect(s, key).not.toContain('{{');
      expect(/[؀-ۿ]/.test(s) || key === 'and', key).toBe(true);
    }
  });

  it('counted nouns agree (zero, one, two, few, many, other)', () => {
    const all = [0, 1, 2, 3, 10, 11, 99, 100];
    expect(all.map((count) => say('panel', { count }))).toEqual(['لا لوحة', 'لوحة واحدة', 'لوحتان', '3 لوحات', '10 لوحات', '11 لوحةً', '99 لوحةً', '100 لوحة']);
    expect([1, 2, 3, 5, 11].map((count) => say('strip', { count }))).toEqual(['عمود واحد', 'عمودان', '3 أعمدة', '5 أعمدة', '11 عمودًا']);
    expect([1, 2, 5].map((count) => say('tile', { count }))).toEqual(['بلاطة واحدة', 'بلاطتان', '5 بلاطات']);
    expect([1, 2, 5].map((count) => say('shard', { count }))).toEqual(['شظية واحدة', 'شظيتان', '5 شظايا']);
    expect([1, 2, 3].map((count) => say('digit', { count }))).toEqual(['رقم واحد', 'رقمان', '3 أرقام']);
    expect([1, 2, 3].map((count) => say('places', { count }))).toEqual(['مرتبة واحدة', 'مرتبتين', '3 مراتب']);
  });

  it('opens on CONTEXT then ONE question, no title banner; says each thing ONCE', () => {
    for (const [name, props] of Object.entries(cases)) {
      const out = html(props);
      expect(out, name).not.toContain('data-manipulation-mission');
      expect(out, name).toMatch(/<h3 class="sr-only">/);
      expect(out, name).toContain('data-lab-context');
      expect(out, name).toContain('data-lab-question');
      const t = text(out);
      const kind = props.tasks[0].kind;
      expect(count(t, say(`question.${kind}`)), name).toBe(1);
      expect(count(out, say(`idle.${props.world}`)), name).toBe(1);
      expect(say(`question.${kind}`)).toMatch(/حتى/);
      // the hint strings are closed by default
      expect(out, name).not.toContain(say(`hints.${props.world}.0`));
    }
    // the mosaic context gives the client's order in pieces (every number the student needs)
    const t = text(html(cases['mosaic beginner']));
    expect(t).toContain('الأرقام 235');
    expect(t).toContain('لوحتان و3 أعمدة و5 بلاطات');
  });

  it('no prompt, question, hint or idle line leaks the rule it hides', () => {
    const strings = [];
    for (const w of ['mosaic', 'machine']) {
      strings.push(say(`discovery.${w}.prompt`), say(`idle.${w}`), ...[0, 1, 2].map((i) => say(`hints.${w}.${i}`)));
    }
    strings.push(...['match', 'fraction', 'shift', 'freeMosaic', 'freeMachine'].map((x) => say(`question.${x}`)));
    strings.push(say('context.match', { digits: '235', pieces: 'لوحتان' }), say('context.fraction', { digits: '3125' }), say('explanation'));
    for (const s of strings) {
      expect(s).not.toMatch(/عشر مرّات|أصغر بعشر|أصفار المقام|يمين|يسار|يضرب|تقسم|ينقص/);
      expect(s).not.toMatch(/\d+,\d+|\d+\/\d+/);
    }
    // the right discovery answers carry no number either
    expect(say('discovery.mosaic.right')).not.toMatch(/\d/);
    expect(say('discovery.machine.right')).not.toMatch(/\d/);
    // and the verdicts never name where the comma should be
    for (const key of ['v.more', 'v.less', 'v.moreMachine', 'v.lessMachine', 'v.nodigit']) expect(say(key, { pieces: 'p', shown: 's' })).not.toMatch(/يمين|يسار|خطوة|مرتبة/);
    for (const key of ['coach.grab', 'coach.moveMosaic', 'coach.moveMachine', 'coach.zero', 'coach.next']) expect(say(key)).not.toMatch(/\d|يمين|يسار/);
  });
});

/* ── la découverte et la phase formelle, rendues depuis des états réels ── */
import * as L from '../logic/decimalComma';
import { Formal, discoveryOptions } from './DecimalComma';

const kk = (key, o) => i18n.t(`lesson:manipulation.decimalComma.${key}`, o);
const solveAll = (world, tasks, moves) => {
  let s = L.init({ world, tasks });
  moves.forEach((m, i) => {
    (m.z ?? []).forEach((side) => { s = L.addZero(s, side); });
    (m.wrong ?? []).forEach((p) => { s = L.release(s, p); });
    s = L.release(s, m.pos);
    if (i < tasks.length - 1) s = L.nextTask(s);
  });
  return s;
};

describe('decimal-comma — découverte et règle, avec SES planches', () => {
  const beginner = solveAll('mosaic', LV.beginner.numbers.tasks, [{ wrong: [0, 3], pos: 1 }, { pos: 0 }, { wrong: [1], pos: 0 }]);
  const advanced = solveAll('mosaic', LV.advanced.numbers.tasks, [{ pos: 1 }, { pos: 1 }, { pos: 1 }]);
  const machineB = solveAll('machine', MACHINE_PRESETS.beginner, [{ pos: 2 }, { z: ['right'], pos: 3 }, { pos: 0 }, { z: ['left'], pos: 0 }]);

  it('mosaic discovery: the right answer states no number; the wrong ones are refuted with his own boards', () => {
    expect(L.discoveryReady(beginner)).toBe(true);
    const opts = discoveryOptions(beginner, kk);
    expect(opts).toHaveLength(3);
    expect(opts.filter((o) => o.correct)).toHaveLength(1);
    const right = opts.find((o) => o.correct);
    expect(right.text).not.toMatch(/\d/);
    const [same, , longer] = opts;
    // his boards 0,235 and 235 (trials on the digits 235)
    expect(same.why).toContain('235');
    expect(same.why).toContain('0,235');
    expect(longer.why).toContain('0,235');
    expect(longer.why).toMatch(/3 أرقام/);
    expect(longer.why).not.toMatch(/\{\{/);
  });

  it('mosaic formal: rank table of the last task, the fraction and its reading, the decomposition, the count ONCE, the zero that keeps a place', () => {
    const out = renderToString(<Formal lab={beginner} k={kk} />);
    expect(out).toContain('data-dc-formal="mosaic"');
    expect(out).toContain('data-dc-formal-table');
    expect(out).toContain('data-dc-formal-keeper');
    expect(out).not.toContain('data-dc-formal-trailing');
    const t = text(out);
    expect(t).toContain('مائتان وخمسة وثلاثون جزءًا من مائة');
    expect(t).toContain('2 + 3/10 + 5/100');
    expect(t).toContain('2 + 3 × 0,1 + 5 × 0,01');
    expect(count(out, 'data-dc-formal-count')).toBe(1);
    expect(t).toContain('عدد الأجزاء من مائة في 0,05 هو 5');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    // zero ranks are greyed in the table (0,05: units and tenths empty)
    expect((out.match(/data-zero="true"/g) ?? []).length).toBe(2);
  });

  it('mosaic formal after 250 → 2,5 states 2,50 = 2,5', () => {
    const out = renderToString(<Formal lab={advanced} k={kk} />);
    expect(out).toContain('data-dc-formal-trailing');
    expect(text(out)).toContain('2,50 = 2,5');
    expect(text(out)).toContain('3,125 = 3125'); // the numerator, drawn stacked
    expect(out).toContain('data-zeros="3"');
  });

  it('machine discovery and formal: the digits did not change; the comma slid n places, in his own boards', () => {
    const opts = discoveryOptions(machineB, kk);
    expect(opts.find((o) => o.correct).text).not.toMatch(/\d/);
    expect(opts[0].why).toContain('35');
    expect(opts[2].why).toContain('×10'); // the task that needed no zero
    const out = renderToString(<Formal lab={machineB} k={kk} />);
    expect(out).toContain('data-dc-formal="machine"');
    expect(out).toContain('data-dc-formal-moved');
    const t = text(out);
    expect(t).toContain('÷100: انتقلت الفاصلة مرتبتين إلى اليسار');
    expect(t).toContain('3,5 ÷100 = 0,035');
    expect(out).not.toMatch(RAW);
  });
});

describe('decimal-comma — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.decimalComma.${key}`, o);
  for (const [name, props] of Object.entries(cases)) {
    it(`${name} : chaque question de chaque tâche a un texte, une seule bonne réponse, deux indices, ni clé brute ni {{`, async () => {
      const { chainOf, QUESTIONS } = await import('./DecimalComma');
      const L = await import('../logic/decimalComma');
      const lab = L.init(props);
      lab.tasks.forEach((_, i) => {
        const chain = chainOf(lab, i);
        expect(chain.length, `${i}`).toBeGreaterThanOrEqual(2);
        if (i === lab.tasks.length - 1) expect(chain.at(-1)).toBe('rule');
        for (const qid of chain) {
          if (qid === 'rule') continue;   // la découverte : couverte par « découverte et règle »
          const q = QUESTIONS[qid](lab, i, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${i}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${i}.${qid}`).toBeTruthy();
        }
      });
    });
  }
  it('les nombres viennent des tâches : 235 centièmes, 30, le 0 de 0,05, 3 chiffres pour 3125/1000, 2,50 = 2,5, 0,035', async () => {
    const { chainOf, QUESTIONS } = await import('./DecimalComma');
    const L = await import('../logic/decimalComma');
    const b = L.init(cases['mosaic beginner']);
    expect(chainOf(b, 0)).toEqual(['count', 'tenth']);
    expect(QUESTIONS.tenth(b, 0, k).expected).toBe('30');
    expect(chainOf(b, 2)).toEqual(['count', 'zero', 'rule']);
    const a = L.init(cases['mosaic advanced']);
    expect(chainOf(a, 0)).toEqual(['places', 'count']);
    expect(QUESTIONS.places(a, 0, k).expected).toBe('3');
    expect(chainOf(a, 2)).toEqual(['trailing', 'count', 'rule']);
    const m = L.init(cases['machine beginner']);
    expect(QUESTIONS.result(m, 3, k).expected).toBe('0,035');
    expect(chainOf(m, 3)).toEqual(['result', 'moved', 'zeros', 'rule']);
  });
});

describe('decimal-comma — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('questions actives : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = html(cases['mosaic beginner']);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    const off = html({ ...cases['mosaic beginner'], checkpoints: false });
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
