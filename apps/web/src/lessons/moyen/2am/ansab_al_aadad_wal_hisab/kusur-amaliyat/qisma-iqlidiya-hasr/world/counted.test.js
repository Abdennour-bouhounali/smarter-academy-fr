import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { BOX, CELL, PLANK, TRIP, agree, cells, count, noun, planks, planksOf, tamyiz } from './counted';
import { FORGES } from './forges';
import { ESTIMATE_INQUIRY, BRACKET_INQUIRY } from './inquiries';
import { KNOWLEDGE } from './knowledge';
import { ladder } from './practice';
import { STORY, TABLETS } from './story';
import { check, solution, trainer } from './trainer';
import { SCRIPT } from '../board/script';
import { MEMO } from '../board/memo';

describe('counted nouns — the number written in digits agrees with what it counts', () => {
  it('1 and 2 take no digit: the noun says them, in its case and its gender', () => {
    expect(count(1, PLANK)).toBe('لوح واحد');
    expect(count(1, PLANK, 'acc')).toBe('لوحًا واحدًا');
    expect(count(1, PLANK, 'gen')).toBe('لوح واحد');
    expect(count(1, CELL)).toBe('خانة واحدة');
    expect(count(1, CELL, 'acc')).toBe('خانة واحدة');
    expect(count(2, PLANK)).toBe('لوحان');
    expect(count(2, PLANK, 'acc')).toBe('لوحين');
    expect(count(2, PLANK, 'gen')).toBe('لوحين');
    expect(count(2, CELL)).toBe('خانتان');
    expect(count(2, CELL, 'gen')).toBe('خانتين');
    expect(count(2, BOX)).toBe('صندوقان');
    expect(count(2, TRIP, 'acc')).toBe('رحلتين');
    expect(count(0, PLANK)).toBe('لا لوح');
  });

  it('3 … 10 take the plural, 11 … 99 the accusative singular', () => {
    for (let n = 3; n <= 10; n += 1) {
      expect(count(n, PLANK)).toBe(`${n} ألواح`);
      expect(count(n, CELL)).toBe(`${n} خانات`);
      expect(count(n, BOX)).toBe(`${n} صناديق`);
    }
    for (let n = 11; n <= 99; n += 1) {
      expect(count(n, PLANK)).toBe(`${n} لوحًا`);
      expect(count(n, CELL)).toBe(`${n} خانة`);
      expect(count(n, BOX)).toBe(`${n} صندوقًا`);
      expect(count(n, TRIP)).toBe(`${n} رحلة`);
    }
  });

  it('from 100 on, the last two digits decide: 100 لوح, 106 ألواح, 112 لوحًا, 4576 خانة, 1250 صندوقًا', () => {
    expect(count(100, PLANK)).toBe('100 لوح');
    expect(count(200, CELL)).toBe('200 خانة');
    expect(count(1000, BOX)).toBe('1000 صندوق');
    expect(count(101, PLANK)).toBe('101 لوح');
    expect(count(102, PLANK)).toBe('102 لوح');
    expect(count(103, PLANK)).toBe('103 ألواح');
    expect(count(106, PLANK)).toBe('106 ألواح');
    expect(count(110, BOX)).toBe('110 صناديق');
    expect(count(111, PLANK)).toBe('111 لوحًا');
    expect(count(112, PLANK)).toBe('112 لوحًا');
    expect(count(4576, CELL)).toBe('4576 خانة');
    expect(count(1250, BOX)).toBe('1250 صندوقًا');
    expect(count(1296, BOX)).toBe('1296 صندوقًا');
    expect(count(5408, CELL)).toBe('5408 خانات');
    for (let n = 100; n <= 3000; n += 1) {
      const m = n % 100;
      const word = count(n, PLANK).split(' ')[1];
      expect(word, String(n)).toBe(m <= 2 ? 'لوح' : m <= 10 ? 'ألواح' : 'لوحًا');
    }
  });

  it('a noun in « ة » keeps its writing after 11 … 99 and after « كم »; another takes its tanwin', () => {
    expect(tamyiz(TRIP)).toBe('رحلة');
    expect(tamyiz(BOX)).toBe('صندوقًا');
    expect(tamyiz(noun('كتاب', 'كتب'))).toBe('كتابًا');
    expect(count(25, noun('كتاب', 'كتب'))).toBe('25 كتابًا');
    expect(count(2, noun('برتقالة', 'برتقالات', 'f'))).toBe('برتقالتان');
  });

  it('what stands beside a count agrees with it: one, two, more', () => {
    expect(planksOf(1, 40)).toBe('لوح واحد طوله 40');
    expect(planksOf(2, 40)).toBe('لوحان طولهما 40');
    expect(planksOf(2, 40, 'acc')).toBe('لوحين طولهما 40');
    expect(planksOf(7, 365)).toBe('7 ألواح طولها 365');
    expect(planksOf(26, 208)).toBe('26 لوحًا طولها 208');
    expect(agree(1, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])).toBe('يتجاوز');
    expect(agree(2, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])).toBe('يتجاوزان');
    expect(agree(26, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])).toBe('تتجاوز');
    expect(planks(22)).toBe(count(22, PLANK));
    expect(cells(8)).toBe(count(8, CELL));
    expect(() => count(-1, PLANK)).toThrow();
    expect(() => count(2.5, PLANK)).toThrow();
  });
});

/**
 * Every counted word a lesson writes after a number in digits, read back: « N ألواح » only for 3 … 10 (or …03 … 10),
 * « N لوحًا » only for 11 … 99 (or …11 … 99), « N لوح » only for the hundreds — and the same for each noun of the lesson.
 */
const NOUNS = [
  ['لوح', 'ألواح', 'لوحًا'],
  ['خانة', 'خانات', 'خانة'],
  ['صندوق', 'صناديق', 'صندوقًا'],
  ['رحلة', 'رحلات', 'رحلة'],
  ['علبة', 'علب', 'علبة'],
  ['كتاب', 'كتب', 'كتابًا'],
  ['قارورة', 'قارورات', 'قارورة'],
  ['برتقالة', 'برتقالات', 'برتقالة'],
  ['كرتونة', 'كراتين', 'كرتونة'],
  ['علامة', 'علامات', 'علامة'],
];
const END = '(?![\\u0621-\\u064A\\u064B-\\u0652])';
function disagreements(text) {
  const bad = [];
  // the formulas are read apart: a number inside « $…$ » is not followed by a counted noun
  const plain = String(text).replace(/\$[^$]*\$/g, ' § ');
  for (const [one, many, acc] of NOUNS) {
    const forms = [...new Set([one, many, acc])].sort((x, y) => y.length - x.length).join('|');
    for (const m of plain.matchAll(new RegExp(`(\\d+) (${forms})${END}`, 'g'))) {
      const n = Number(m[1]);
      const k = n % 100;
      const want = n >= 100 && k <= 2 ? one : k >= 3 && k <= 10 ? many : acc;
      // 1 and 2 are never written in digits before their noun
      if (n < 3 || m[2] !== want) bad.push(`« ${m[0]} » (${want})`);
    }
  }
  return bad;
}
const strings = (x, out = []) => {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => strings(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => strings(y, out));
  return out;
};
const agreed = (text, where) => expect(disagreements(text), `${where}: ${text}`).toEqual([]);

describe('every generated sentence of the lesson writes its counts through the helper', () => {
  it('the reader finds a disagreement when there is one', () => {
    expect(disagreements('يكفي 7 صندوقًا')).toHaveLength(1);
    expect(disagreements('تبقى 4 علبة')).toHaveLength(1);
    expect(disagreements('2 من الصناديق، و 2 صندوقًا')).toHaveLength(1);
    expect(disagreements('100 لوحًا')).toHaveLength(1);
    expect(disagreements('7 صناديق، 4 علب، 26 رحلة، 100 لوح، $7 \\times 4$ علبة')).toEqual([]);
  });

  it('the story, its tablets, its dash and its store', () => {
    const T = STORY.text;
    const lines = [...strings(TABLETS), ...STORY.dashWaves.map((w) => w.say)];
    lines.push(
      ...strings({ ...T, say: null, boss: null }),
      ...Object.values(T.say).filter((s) => typeof s === 'string'),
    );
    for (const seg of STORY.segments.filter((s) => s.boss))
      for (const b of seg.boss.options) {
        const q = Math.floor(seg.a / b);
        lines.push(T.say.bossFail(b, seg.a % b), T.boss.mould(b), T.boss.divide(b), T.boss.costAsk(b, q));
        for (const n of [1, 2, 3, q, q + 1, 100, 101]) lines.push(T.boss.err.long(b, n), T.boss.costAsk(b, n));
        for (const r of [1, 2, 3, 12, b, 100, 105]) lines.push(T.boss.err.big(b, r), T.boss.err.sum(b, q, r));
      }
    lines.push(...strings(T.boss).filter((s) => typeof s === 'string'));
    for (const line of lines) agreed(line, 'story');
  });

  it('the two investigations, for every count they may say', () => {
    const E = ESTIMATE_INQUIRY.text;
    const B = BRACKET_INQUIRY.text;
    for (const n of [0, 1, 2, 3, 7, 10, 11, 20, 99, 100, 101, 106, 112, 900]) {
      const m = { a: 22152, b: 208, place: 0, unit: 208, from: 1352, k: n, count: n, value: 208 * n, left: n, next: 1 };
      for (const line of [E.passes(m), E.short(m), E.laid(m), E.left(n), E.sum({ a: 9, b: 2, q: n, r: n })])
        agreed(line, `estimate ${n}`);
      agreed(E.foundLine({ a: 9, b: 2, q: n, r: n }), `estimate ${n}`);
      for (const place of [0, 1, 2]) agreed(E.ask({ a: 9, b: 208, place, unit: 208 * 10 ** place, from: n }), 'ask');
      const f = { a: 5475, b: 208, lo: n, hi: n + 1, r: n, said: 'on' };
      for (const exact of [true, false]) agreed(B.seen({ ...f, exact }), `bracket ${n}`);
      for (const hi of [n - 2, n, n + 1, n + 2, n + 3, n + 4, n + 12, n + 101])
        agreed(
          B.miss({ a: 5475, b: 208, lo: n, hi, loValue: 208 * n, hiValue: 208 * hi, consecutive: false }),
          `miss ${n}`,
        );
    }
    for (const { a, b } of [...ESTIMATE_INQUIRY.rounds, ...BRACKET_INQUIRY.rounds]) {
      agreed(E.lead(a, b), 'lead');
      agreed(B.lead(a, b), 'lead');
    }
  });

  it('the three forges: every case, every sentence about a case, for small counts too', () => {
    const rand = rng(77);
    for (const F of Object.values(FORGES)) {
      const cases = [...F.predictCases([], rand), ...[1, 2, 3].flatMap((n) => F.nudge(n, []).cases)];
      const rules = F.slots.reduce((rs, s) => rs.flatMap((r) => s.options.map((o) => ({ ...r, [s.id]: o.id }))), [{}]);
      for (const rule of rules) cases.push(...F.attacks(rule, []));
      for (const c of cases) {
        for (const line of [c.text ?? '', c.tag ?? '', F.text.ask(c), F.text.attack(c), F.text.fact(c)])
          agreed(line, F.key);
        for (const says of [true, false]) agreed(F.text.refuted({ ...c, says }), F.key);
      }
      for (let i = 0; i < 20; i += 1) agreed(F.text.tryKey(F.use.make(rand)), F.key);
    }
    // the brackets he may type on the line with one plank, two planks
    const br = FORGES['hasr-hasil'].fromInquiry({
      rounds: [
        {
          a: 5475,
          b: 208,
          lo: 26,
          hi: 27,
          guesses: [
            { lo: 1, hi: 2 },
            { lo: 2, hi: 3 },
            { lo: 0, hi: 1 },
          ],
        },
      ],
    }).rows;
    expect(br.map((c) => c.n)).toEqual([1, 2, 26]); // « 0 planks » is not a sentence the mirror keeps
    expect(br[0].text).toBe('لوح واحد طوله 208 لا يتجاوز 5475 خانة، و لوحان يتجاوزانها');
    expect(br[1].text).toBe('لوحان طولهما 208 لا يتجاوزان 5475 خانة، و 3 ألواح تتجاوزها');
    for (const c of br) agreed(c.text, 'bracket');
    // the trials of the first forge with one plank, two planks, none
    const tr = FORGES['qisma-ay-adad'].fromInquiry({
      rounds: [{ a: 2241, b: 365, guesses: [0, 1, 2].map((count) => ({ place: 0, count, ok: false })) }],
    }).rows;
    expect(tr.map((c) => c.text)).toEqual([
      'لا لوح طوله 365 في 2241 خانة باقية',
      'لوح واحد طوله 365 في 2241 خانة باقية',
      'لوحان طولهما 365 في 2241 خانة باقية',
      '6 ألواح طولها 365 في 2241 خانة باقية',
    ]);
  });

  it('the trainer and the practice ladder: every prompt, hint and correction, for many draws', () => {
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 60; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 977 + 5), card)) {
          const s = solution(q);
          const lines = [q.prompt, q.statement ?? '', q.why ?? '', ...(q.reasons ?? []).map((r) => r.t)];
          lines.push(check(q, s).fix);
          if (q.kind === 'needed')
            for (const need of [s.need - 1, s.need + 1, 0, 1]) lines.push(check(q, { ...s, need }).hint ?? '');
          for (const line of lines) agreed(line, `${card} ${q.kind}`);
        }
    for (const { node, level } of ladder.LEVEL_ORDER)
      for (let seed = 1; seed <= 20; seed += 1)
        for (const w of ladder.makeRun(rng(seed * 7919 + level * 31 + node), node, level))
          for (const line of [w.say ?? '', w.why?.right ?? '', ...Object.values(w.why?.wrong ?? {})])
            agreed(line, 'ladder');
  });

  it('the knowledge map, the board script and the memo', () => {
    for (const line of strings(KNOWLEDGE)) agreed(line, 'knowledge');
    for (const line of strings(SCRIPT)) agreed(line, 'script');
    for (const line of strings(MEMO)) agreed(line, 'memo');
  });
});
