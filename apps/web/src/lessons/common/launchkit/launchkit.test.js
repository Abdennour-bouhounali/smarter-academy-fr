import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { toolsForLesson, getItem, homeLessonOf } from '@smarter-academy/core/curriculum/dz/net/learningNet.js';
import { bankPairs, readBank } from '../gameworld/kit/authoring/test/bank.js';
import { TOOLS, toolById, toolsFor } from '../lessonlab/registry';
import { GRADES, isReached } from '../lessonlab/order';
import ORDER from '../lessonlab/lessonOrder.generated.json';
import {
  FAMILIES,
  LIST_SEP,
  MISTAKES,
  familyFor,
  makeQuestion,
  pickForm,
  nextForm,
  complete,
  grade,
  slotsOf,
} from './families';
// the lesson's world, read to keep its squares off the kit of « حساب قوة عدد نسبي » (a test may name a lesson)
import { COURTS, YARD } from '../../moyen/4am/ansab_al_aadad_wal_hisab/hisab-judhur/jidhr-tarbii/world/story';
import {
  planTools,
  nextStep,
  kitOf,
  scoreOf,
  honesty,
  priorities,
  flowOf,
  mergeKit,
  workshopTool,
  gateOf,
  CAP,
  BANDS,
} from './engine';

const rng = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
/** Is a sort card to be accepted? Computed here from the card's own numbers — never read from its `bin`. */
/** « $7 \\times 8 + 3 = 59$ » → is it true? Computed here (the product before the sum), or null for another shape. */
const arithmetic = (text) => {
  const m = String(text).match(/^\$(\d+(?: (?:\\times|[+-]) \d+)+) = (\d+)\$$/);
  if (!m) return null;
  const value = (t) => t.split(' \\times ').reduce((p, x) => p * Number(x), 1);
  const lhs = m[1]
    .split(' + ')
    .reduce((sum, term) => sum + term.split(' - ').reduce((v, x, i) => (i === 0 ? value(x) : v - value(x)), 0), 0);
  return lhs === Number(m[2]);
};
/** Every divisor of n, computed here. */
const divisorsApart = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
/** A number written in LaTeX — « 8 », « (-8) », « (0{,}3) », « \left(\frac{2}{3}\right) », « -8 », « 0{,}09 » — as an exact fraction. */
const ratApart = (t) => {
  let x = t
    .replace(/^\\left\(/, '')
    .replace(/\\right\)$/, '')
    .replace(/^\((.*)\)$/, '$1');
  const f = x.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
  if (f) return [BigInt(f[1]), BigInt(f[2])];
  const neg = x.startsWith('-');
  if (neg) x = x.slice(1);
  const [w, dec = ''] = x.split('{,}');
  return [BigInt(w + dec) * (neg ? -1n : 1n), 10n ** BigInt(dec.length)];
};
/** « (0{,}3)^{2} = 0{,}09 », « (-2)^{3} = -8 » → true or false, computed here by repeated products, exactly; null for another shape. */
const powerTrue = (text) => {
  const m = String(text).match(/^\$(.+)\^\{(\d+)\} = (.+)\$$/);
  if (!m) return null;
  const [bn, bd] = ratApart(m[1]);
  let [pn, pd] = [1n, 1n];
  for (let i = 0; i < Number(m[2]); i += 1) [pn, pd] = [pn * bn, pd * bd];
  const [vn, vd] = ratApart(m[3]);
  return pn * vd === vn * pd;
};
const accepts = (q, c) => {
  if (powerTrue(c.text) !== null) return powerTrue(c.text); // « 3am.m3.r06 »: a power and its value
  // « n/d = x/y » (1am.m5.r02): two fractions of the same value, judged by the cross products computed here
  const fr = String(c.text).match(/^\$\\frac\{(\d+)\}\{(\d+)\} = \\frac\{(\d+)\}\{(\d+)\}\$/);
  if (fr) return Number(fr[1]) * Number(fr[4]) === Number(fr[2]) * Number(fr[3]);
  if (c.list) return c.list.join() === divisorsApart(c.n).join(); // « قواسم 12: 1 ، 2 ، … »: the whole list, nothing else
  if (arithmetic(c.text) !== null) return arithmetic(c.text);
  const pg = String(c.text).match(/^\$\\mathrm\{PGCD\}\((\d+) ; (\d+)\) = (\d+)\$$/); // « PGCD(x ; y) = v »
  if (pg) return pgcdApart(Number(pg[1]), Number(pg[2])) === Number(pg[3]);
  if (q.pair) return q.pair.every((n) => n % Number(c.text) === 0); // a common divisor of the two numbers of the question
  if (c.say) return c.verb === 'divisor' ? Number.isInteger(c.y / c.x) : Number.isInteger(c.x / c.y); // « x قاسم لـ y » / « x مضاعف لـ y », « x يقبل القسمة على y »
  if (q.of) return Number.isInteger(q.of / c.n);
  const m = c.text.match(/^\$(\d+) = (\d+) \\times (\d+) ([+-]) (\d+)\$$/);
  if (!m) return c.n % q.k === 0;
  const [a, b, k, sign, r] = [Number(m[1]), Number(m[2]), Number(m[3]), m[4], Number(m[5])];
  return sign === '+' && b * k + r === a && r < b;
};
/** The full-mark answer of a question, computed here — never read from the question. */
/** The value of a question that carries its operation, computed here from its operands: « x × y », « x − y », « x × y + z ». */
/** The greatest number that divides x and y, found by trying every number — never Euclid, never the family's helper. */
const pgcdApart = (x, y) => Math.max(...divisorsApart(Math.min(x, y)).filter((d) => x % d === 0 && y % d === 0));
/** The missing term of « n/d = m/▢ » (or « ▢/m »), found by trying every whole number — never the family's formula. */
const termApart = ({ n, d, m, side }) => {
  for (let t = 1; t <= 1000; t += 1) if (side === 'bottom' ? n * t === d * m : t * d === n * m) return t;
  return NaN;
};
/** xᵉ by repeated products (a fraction base has no single value: NaN). */
const powApart = ({ x, e }) => (x == null ? NaN : Array.from({ length: e }).reduce((p) => p * x, 1));
const calcApart = (c) => {
  const { op, x, y, z } = c;
  if (op === 'pow') return powApart(c);
  if (op === 'frac') return termApart(c);
  return op === 'pgcd' ? pgcdApart(x, y) : op === 'times' ? x * y : op === 'minus' ? x - y : x * y + z;
};
const right = (q) =>
  q.calc
    ? q.gesture === 'write'
      ? q.calc.op === 'pow' && q.calc.n != null
        ? { n: String(powApart({ x: q.calc.n, e: q.calc.e })), d: String(powApart({ x: q.calc.d, e: q.calc.e })) }
        : { v: String(calcApart(q.calc)) }
      : { x: calcApart(q.calc), moved: true }
    : q.gesture === 'write'
      ? { q: String(Math.floor(q.a / q.b)), r: String(q.a % q.b) }
      : q.gesture === 'place'
        ? { x: q.b * Math.floor(q.a / q.b), moved: true }
        : Object.fromEntries(q.cards.map((c) => [c.id, accepts(q, c) ? 'yes' : 'no']));
const withRest = (q) => q.tokens.some((t) => t.slot === 'r');
const each = (fn) => {
  for (const f of Object.values(FAMILIES))
    for (const level of [1, 2])
      for (const form of f.forms[level])
        for (let seed = 1; seed <= 150; seed += 1)
          fn(f, level, form, makeQuestion(rng(seed * 7 + level), f.item, level, form, { first: seed % 5 === 0 }), seed);
};

describe('عُدّة الانطلاق — the question families', () => {
  it('every family is an item of the learning net, with its home lesson, its instrument and its revision card', () => {
    for (const f of Object.values(FAMILIES)) {
      expect(getItem(f.item), f.item).toBeTruthy();
      expect(f.memo.length).toBeGreaterThanOrEqual(3);
      expect(f.forms[1].length).toBeGreaterThanOrEqual(1);
      expect(f.forms[2].length).toBeGreaterThanOrEqual(2);
      // the instrument (if any) belongs to a lesson already studied when the kit is shown: the home lesson of the item, or
      // one before it — never the tool the lesson being prepared introduces itself
      if (f.labTool === null) continue;
      const tool = TOOLS.find((t) => t.id === f.labTool);
      expect(tool, `${f.item}: ${f.labTool}`).toBeTruthy();
      expect(isReached(tool.lesson, homeLessonOf(f.item).code), `${f.item}: ${f.labTool} (${tool.lesson})`).toBe(true);
    }
    // « الجمع والطرح والضرب » is shown before « القسمة الإقليدية »: « القسمة على الورقة » is that lesson's own tool
    expect(FAMILIES['1am.m1.r01'].labTool).toBe(null);
    // « تعيين مجموعة قواسم عدد » (2026-11-19, for lesson 4): its instrument is the one of its home lesson
    expect(familyFor('4am.m1.r02').labTool).toBe('divisors');
  });

  it('the capsule’s lab never opens on an instrument of the lesson being prepared — for EVERY lesson of the cycle', () => {
    // the kit is played BEFORE the lesson: its lab is `earlierOnly` (LESSON_LAB.md §2), so a family's instrument must be
    // one of a lesson strictly before every lesson whose kit shows that family, or the capsule would open on nothing
    let seen = 0;
    for (const g of GRADES)
      for (const code of ORDER[g])
        for (const t of planTools(toolsForLesson(code), (id) => Boolean(familyFor(id)))) {
          const tool = familyFor(t.item).labTool;
          if (tool === null) continue;
          seen += 1;
          expect(toolById(tool).lesson, `${code}: ${t.item} → ${tool}`).not.toBe(code);
          expect(
            toolsFor(code, { earlierOnly: true }).all.map((x) => x.id),
            `${code}: ${t.item} → ${tool}`,
          ).toContain(tool);
        }
    expect(seen).toBeGreaterThan(0);
  });

  it('every generated question is true: the answer computed apart is graded right, and it can be handed in', () => {
    let n = 0;
    each((f, level, form, q) => {
      n += 1;
      const a = right(q);
      expect(complete(q, a), `${f.item} ${form}`).toBe(true);
      expect(grade(q, a), `${f.item} L${level} ${form}: ${JSON.stringify(q).slice(0, 200)}`).toEqual({
        correct: true,
        mistake: null,
      });
      expect(q.prompt).not.toMatch(/undefined|NaN/);
    });
    expect(n).toBeGreaterThan(1300);
  });

  it('keeps the numbers of each level where they belong', () => {
    each((f, level, form, q, seed) => {
      if (f.item === '2am.m1.r04') return; // the 2AM division has its own ranges (a two-digit divisor), checked below
      if (f.item === '1am.m1.r01') return; // the operations are not a division: their own ranges, checked below
      if (f.item === '4am.m1.r03') return; // a PGCD, not a division: its own ranges, checked below
      if (f.item === '1am.m5.r02') return; // a fraction, not a division: its own ranges, checked below
      if (f.item === '3am.m3.r06') return; // a power, not a division: its own ranges, checked below
      if (q.gesture === 'write' && level === 1) {
        expect(q.b).toBeLessThanOrEqual(9);
        expect(Math.floor(q.a / q.b)).toBeLessThanOrEqual(9);
        if (withRest(q)) expect(q.a % q.b).toBeGreaterThan(0);
        else expect(q.a % q.b).toBe(0);
      }
      if (q.gesture === 'write' && level === 1 && seed % 5 === 0) expect(q.a).toBeLessThanOrEqual(29); // the very first question of a launch: a near-certain win
      if (q.gesture === 'write' && level === 2) {
        expect(q.b).toBeGreaterThanOrEqual(11);
        expect(q.a).toBeLessThanOrEqual(250);
      }
      if (q.gesture === 'place') {
        expect(q.a).toBeLessThan(q.max);
        expect(q.target).toBe(q.b * Math.floor(q.a / q.b));
        expect(q.a % q.b).toBeGreaterThan(0);
      }
      if (q.gesture === 'sort') {
        expect(q.cards).toHaveLength(3);
        expect(new Set(q.cards.map((c) => c.text)).size).toBe(3);
        expect(q.cards.some((c) => c.bin === 'yes')).toBe(true);
        expect(q.cards.some((c) => c.bin === 'no')).toBe(true);
      }
    });
  });

  it('a wrong answer names its mistake when it shows one', () => {
    const w = { gesture: 'write', a: 47, b: 6 };
    expect(grade(w, { q: '6', r: '11' })).toEqual({ correct: false, mistake: 'rest-too-big' });
    expect(grade(w, { q: '5', r: '7' })).toEqual({ correct: false, mistake: 'swapped' });
    expect(grade(w, { q: '7', r: '4' })).toEqual({ correct: false, mistake: 'equality-false' });
    const p = { gesture: 'place', a: 47, b: 6, target: 42 };
    expect([48, 36, 45].map((x) => grade(p, { x }).mistake)).toEqual(['overshoot', 'not-greatest', 'not-multiple']);
    each((f, level, form, q) => {
      if (q.gesture !== 'sort') return;
      for (const c of q.cards) {
        if (c.trap) {
          expect(MISTAKES[c.trap], c.trap).toBeTruthy();
          expect(c.bin).toBe('no');
          const a = { ...right(q), [c.id]: 'yes' };
          expect(grade(q, a)).toEqual({ correct: false, mistake: grade(q, a).mistake });
          expect(grade(q, a).mistake).toBeTruthy();
        }
      }
    });
    expect(complete({ gesture: 'place' }, { x: 12 })).toBe(false);
    expect(complete(makeQuestion(rng(3), '1am.m3.r01', 1, 'write'), { q: '7', r: '' })).toBe(false);
  });

  it('the workshop example is a true worked example, on the rule that was missed', () => {
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2]) {
        const d = FAMILIES['1am.m3.r01'].example(rng(seed), level);
        const m = d.steps.at(-1).match(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/);
        expect(Number(m[2]) * Number(m[3]) + Number(m[4])).toBe(Number(m[1]));
        expect(Number(m[4])).toBeLessThan(Number(m[2]));
        for (const k of [2, 3, 4, 5, 9]) {
          const e = FAMILIES['1am.m3.r02'].example(rng(seed), level, { k });
          const n = Number(e.title.match(/\d+/)[0]);
          expect(e.steps.at(-1)).toContain(n % k === 0 ? `${n} يقبل` : `${n} لا يقبل`);
          expect(e.steps.join(' ')).not.toMatch(/undefined|NaN/);
        }
      }
  });

  it('« القسمة الإقليدية على أيّ عدد » (2AM): a two-digit divisor, a quotient of two digits at level 2, the quotient 0 accepted', () => {
    const item = '2am.m1.r04';
    const seen = new Set();
    each((f, level, form, q, seed) => {
      if (f.item !== item) return;
      if (q.gesture === 'write') {
        expect(q.b).toBeGreaterThanOrEqual(10);
        expect(q.b).toBeLessThanOrEqual(25);
        expect(withRest(q)).toBe(true);
        if (level === 1) expect(Math.floor(q.a / q.b)).toBeLessThanOrEqual(5);
        if (level === 1 && seed % 5 === 0) expect(q.a).toBeLessThanOrEqual(29); // the very first question: a near-certain win
        if (level === 2) {
          expect(Math.floor(q.a / q.b)).toBeGreaterThanOrEqual(10);
          expect(q.a).toBeLessThan(1000);
        }
      }
      if (q.gesture === 'place') {
        expect(q.b).toBeGreaterThanOrEqual(11);
        expect(q.a).toBeLessThan(q.max);
        expect(q.target).toBe(q.b * Math.floor(q.a / q.b));
        expect(q.a % q.b).toBeGreaterThan(0);
      }
    });
    // the sort, also on spread seeds (the first draw of a small seed is near 0 and always picks the first shape)
    for (let seed = 1; seed <= 200; seed += 1) {
      const q = makeQuestion(rng(seed * 104729 + 17), item, 2, 'sort');
      expect(new Set(q.cards.map((c) => c.text)).size).toBe(3);
      expect(q.cards.some((c) => c.bin === 'yes') && q.cards.some((c) => c.bin === 'no')).toBe(true);
      for (const c of q.cards) {
        const m = c.text.match(/^\$(\d+) = (\d+) \\times (\d+) ([+-]) (\d+)\$$/);
        expect(Number(m[2]), c.text).toBeGreaterThanOrEqual(12);
        expect(c.bin, c.text).toBe(accepts(q, c) ? 'yes' : 'no');
        if (m[3] === '0') {
          expect(c.miss).toBe('quotient-zero');
          expect(grade(q, { ...right(q), [c.id]: 'no' })).toEqual({ correct: false, mistake: 'quotient-zero' });
        }
        if (c.trap) seen.add(c.trap);
        if (c.miss) seen.add(c.miss);
      }
    }
    expect([...seen].sort()).toEqual(['equality-false', 'quotient-zero', 'rest-negative', 'rest-too-big']);
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, 'quotient-zero', 'rest-too-big']) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          const [a, b] = e.title.match(/\d+/g).map(Number);
          const m = e.steps.at(-1).match(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/);
          expect([Number(m[1]), Number(m[2])]).toEqual([a, b]);
          expect(Number(m[3])).toBe(Math.floor(a / b));
          expect(Number(m[4])).toBe(a % b);
          if (mistake === 'quotient-zero') expect(Number(m[3])).toBe(0);
          if (level === 2 && !mistake) expect(e.steps).toHaveLength(4); // the quotient estimated by tens first
          expect(e.steps.join(' ')).not.toMatch(/undefined|NaN/);
        }
    expect(MISTAKES['quotient-zero']).toBeTruthy();
  });

  it('« التعرّف على قاسم »: its questions, its traps and its worked example say the truth', () => {
    const item = '4am.m1.r01';
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      const w = makeQuestion(rng(seed), item, seed % 2 ? 1 : 2, 'write');
      expect(w.tokens.filter((t) => typeof t === 'object').map((t) => t.slot)).toEqual(['q']); // no box for a remainder
      expect(grade(w, { q: String(w.a / w.b) })).toEqual({ correct: true, mistake: null }); // what the student really hands in
      expect(grade(w, { q: String(w.a / w.b + 1) })).toEqual({ correct: false, mistake: 'product-false' });
      for (const level of [1, 2]) {
        const p = makeQuestion(rng(seed * 13), item, level, 'pick', { first: seed % 5 === 0 });
        expect(p.prompt).toContain(String(p.of));
        for (const c of p.cards) {
          if (c.n > p.of) expect(c.trap).toBe('multiple-for-divisor');
          else if (!accepts(p, c)) expect(c.trap).toBe('rest-not-zero');
          else expect(c.trap).toBe(null);
          if (c.miss) seen.add(c.n === 1 ? 'one' : 'itself');
        }
        if (level === 2) {
          const edge = p.cards.find((c) => c.miss);
          expect(edge, 'level 2 shows 1 or the number itself').toBeTruthy();
          expect(grade(p, { ...right(p), [edge.id]: 'no' })).toEqual({ correct: false, mistake: 'one-and-itself' });
        }
      }
      const s = makeQuestion(rng(seed * 31), item, 2, 'sentences');
      for (const c of s.cards) {
        expect(c.text).toContain(String(c.x));
        expect(c.text).toContain(String(c.y));
        expect(c.text).toContain({ divisor: 'قاسم', multiple: 'مضاعف', divisible: 'يقبل القسمة' }[c.verb]);
        expect(c.bin, c.text).toBe(accepts(s, c) ? 'yes' : 'no');
        if (c.trap === 'sentence-reversed') expect(c.verb === 'divisor' ? c.x > c.y : c.x < c.y, c.text).toBe(true);
        if (c.trap) seen.add(c.trap);
      }
      for (const level of [1, 2]) {
        const e = FAMILIES[item].example(rng(seed), level);
        const [b, a] = e.title.match(/\d+/g).map(Number);
        expect(e.steps.at(-1)).toContain(a % b === 0 ? `${b} قاسم للعدد ${a}` : `${b} ليس قاسمًا للعدد ${a}`);
        const m = e.steps[0].match(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/);
        expect(Number(m[2]) * Number(m[3]) + Number(m[4] ?? 0)).toBe(Number(m[1]));
        expect(Number(m[4] ?? 0)).toBeLessThan(b);
      }
    }
    expect([...seen].sort()).toEqual(['itself', 'one', 'rest-not-zero', 'sentence-reversed']);
    // the worked example answers the mistake shown: three steps, a true equality, the conclusion that mistake needs
    for (let seed = 1; seed <= 60; seed += 1)
      for (const mistake of ['sentence-reversed', 'multiple-for-divisor', 'one-and-itself']) {
        const e = FAMILIES[item].example(rng(seed), 1 + (seed % 2), { mistake });
        const m = e.steps[0].match(/\$(\d+) = (\d+) \\times (\d+)\$/);
        expect(Number(m[2]) * Number(m[3]), mistake).toBe(Number(m[1]));
        expect(e.steps).toHaveLength(3);
        expect(e.steps.at(-1)).toContain(mistake === 'one-and-itself' ? 'قاسمان' : `${m[1]} ليس قاسمًا للعدد ${m[2]}`);
        expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
      }
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
  });

  it('« تعيين مجموعة قواسم عدد »: its pairs, its lists, their traps and its worked example say the truth', () => {
    const item = '4am.m1.r02';
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      // write: the partner of a divisor, never a remainder box
      for (const level of [1, 2]) {
        const w = makeQuestion(rng(seed), item, level, 'write', { first: seed % 5 === 0 });
        expect(w.tokens.filter((t) => typeof t === 'object').map((t) => t.slot)).toEqual(['q']);
        expect(w.a % w.b).toBe(0);
        expect(grade(w, { q: String(w.a / w.b) })).toEqual({ correct: true, mistake: null });
        expect(grade(w, { q: String(w.a / w.b + 1) }).correct).toBe(false);
        expect(w.prompt).toContain(String(w.a));
        expect(w.prompt).toContain(String(w.b));
      }
      // sort: three lists of three different numbers, each judged from its own numbers
      for (const level of [1, 2]) {
        const s = makeQuestion(rng(seed * 104729 + level), item, level, 'sort');
        expect(new Set(s.cards.map((c) => c.n)).size).toBe(3);
        for (const c of s.cards) {
          const all = divisorsApart(c.n);
          expect(c.text).toBe(`قواسم ${c.n}: ${c.list.join('\u00a0، ')}`); // the card shows the list it is judged on
          // a line of the list breaks only AFTER a comma: a no-break space before each one, never an ordinary one
          expect(c.text).not.toMatch(/ ،/);
          expect(c.say).toBe(true); // a sentence in Arabic: drawn right to left
          expect(all.length).toBeGreaterThanOrEqual(6);
          expect(all.length).toBeLessThanOrEqual(8); // a card stays short
          expect(Number.isInteger(Math.sqrt(c.n))).toBe(false);
          expect(c.n).toBeLessThanOrEqual(level === 1 ? 32 : 99);
          expect(c.bin, c.text).toBe(accepts(s, c) ? 'yes' : 'no');
          const missing = all.filter((d) => !c.list.includes(d));
          const extra = c.list.filter((d) => !all.includes(d));
          if (c.trap === 'partner-forgot') {
            expect(missing).toHaveLength(1);
            expect(missing[0] * missing[0]).toBeGreaterThan(c.n); // the big half of a pair
            expect(c.list).toContain(c.n / missing[0]); // its partner is there
            expect(missing[0]).not.toBe(c.n);
          }
          if (c.trap === 'stop-early') {
            // the last pair tried is missing, both halves: d is the greatest divisor whose square does not pass n
            expect(missing).toHaveLength(2);
            const [d, k] = missing;
            expect(d * k).toBe(c.n);
            expect(d).toBe(Math.max(...all.filter((x) => x * x <= c.n)));
            expect(level).toBe(2);
          }
          if (c.trap === 'one-and-itself') expect(missing.length === 1 && [1, c.n].includes(missing[0])).toBe(true);
          if (c.trap === 'rest-not-zero') {
            expect(missing).toEqual([]);
            expect(extra).toHaveLength(1);
            expect(c.n % extra[0]).not.toBe(0);
            expect(c.list).toEqual([...c.list].sort((x, y) => x - y)); // the intruder hides in its place
          }
          if (c.bin === 'yes') expect(c.trap).toBe(null);
          else {
            expect(MISTAKES[c.trap], c.trap).toBeTruthy();
            expect(grade(s, { ...right(s), [c.id]: 'yes' })).toEqual({ correct: false, mistake: c.trap });
          }
          if (c.trap) seen.add(c.trap);
        }
      }
    }
    expect([...seen].sort()).toEqual(['one-and-itself', 'partner-forgot', 'rest-not-zero', 'stop-early']);
    // the worked example: a true pair for every number tried, the whole list at the end, a first step on the mistake shown
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, ...FAMILIES[item].mistakes]) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          const n = Number(e.title.match(/\d+/)[0]);
          expect(e.steps).toHaveLength(3);
          const pairs = [...e.steps[1].matchAll(/\$(\d+) = (\d+) \\times (\d+)\$/g)].map((m) => m.slice(1).map(Number));
          expect(pairs.map(([, d]) => d)).toEqual(divisorsApart(n).filter((d) => d * d <= n));
          for (const [a, d, k] of pairs) expect(d * k, `${a} = ${d} × ${k}`).toBe(a);
          expect(e.steps[2]).toBe(`قواسم ${n}: ${divisorsApart(n).join(LIST_SEP)}.`);
          const s = Math.floor(Math.sqrt(n));
          if (mistake === 'one-and-itself') expect(e.steps[0]).toContain(`${n} = 1 \\times ${n}`);
          else if (mistake === 'rest-not-zero') {
            const m = e.steps[0]
              .match(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/)
              .slice(1)
              .map(Number);
            expect(m[1] * m[2] + m[3]).toBe(n);
            expect(m[3]).toBeGreaterThan(0);
            expect(m[3]).toBeLessThan(m[1]);
          } else {
            expect(e.steps[0]).toContain(`${s} \\times ${s} = ${s * s}`);
            expect(s * s).toBeLessThanOrEqual(n);
            expect((s + 1) * (s + 1)).toBeGreaterThan(n);
          }
          expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
        }
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // its rules and memo: every list they write is a true list of divisors
    const lists = [...FAMILIES[item].rules.map((r) => r.example), ...FAMILIES[item].memo].flatMap((t) =>
      [...t.matchAll(/قواسم (\d+)(?: هي)?: ([\d \u00a0،]+\d)/g)].map((m) => [Number(m[1]), m[2]]),
    );
    expect(lists.length).toBeGreaterThanOrEqual(1);
    for (const [n, l] of lists) expect(l.split('،').map((x) => Number(x.trim()))).toEqual(divisorsApart(n));
    expect(FAMILIES[item].memo.at(-1)).toContain('قواسم 45 هي 1\u00a0، 3\u00a0، 5\u00a0، 9\u00a0، 15\u00a0، 45');
  });

  it('takes the tools of « القاسم المشترك الأكبر » from the learning net: the divisor lists of lesson 2, then the 2AM division', () => {
    const links = toolsForLesson('qasim-mushtarak-akbar');
    const tools = planTools(links, (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([
      ['4am.m1.r02', 'qawasim-adad-tabii', 'core'],
      ['2am.m1.r04', 'qisma-iqlidiya-hasr', 'core'],
    ]);
    // every CORE link of the net has a family: the launch of lesson 4 is never an empty kit (LAUNCH_KIT.md §4)
    for (const t of links.filter((l) => l.weight !== 'support')) expect(familyFor(t.id), t.id).toBeTruthy();
  });

  it('« القاسم المشترك الأكبر لعددين » (4am.m1.r03): every PGCD computed apart, its traps named, never a pair of the banks, never a PGCD of 1', () => {
    const item = '4am.m1.r03';
    const banks = ['qasim-mushtarak-akbar', 'awwaliyan-fima-baynahuma', 'ikhtizal-kasr'].map((id) =>
      bankPairs(readBank(id)),
    );
    const own = (x, y) => {
      const k = x < y ? `${x};${y}` : `${y};${x}`;
      for (const b of banks) expect(b.has(k), `the bank names ${k}`).toBe(false);
      expect(pgcdApart(x, y), `${x} ; ${y}`).toBeGreaterThan(1); // never a pair whose only common divisor is 1
      expect(x % y !== 0 && y % x !== 0, `${x} ; ${y}`).toBe(true); // neither divides the other
    };
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      for (const level of [1, 2]) {
        const w = makeQuestion(rng(seed * 31 + level), item, level, 'write', { first: seed % 5 === 0 });
        const { x, y } = w.calc;
        own(x, y);
        const g = pgcdApart(x, y);
        expect(w.tokens.filter((t) => typeof t === 'string')).toEqual(['PGCD(', String(x), ';', String(y), ')', '=']);
        expect(grade(w, { v: String(g) })).toEqual({ correct: true, mistake: null });
        expect(Math.max(x, y)).toBeLessThanOrEqual(level === 1 ? (seed % 5 === 0 ? 15 : 45) : 99); // the very first: a near-certain win
        if (level === 2) expect(Math.min(x, y)).toBeGreaterThanOrEqual(30);
        // the slips, judged from the numbers: the smaller number, a smaller common divisor, a divisor of one only
        const lo = Math.min(x, y);
        expect(grade(w, { v: String(lo) }).mistake).toBe('smaller-not-divisor');
        const smaller = divisorsApart(g).filter((d) => d < g);
        expect(grade(w, { v: String(smaller.at(-1)) })).toEqual({ correct: false, mistake: 'common-not-greatest' });
        const one = divisorsApart(x).find((d) => y % d !== 0 && d !== lo);
        if (one) expect(grade(w, { v: String(one) }).mistake).toBe('divisor-of-one');
        expect(grade(w, { v: String(x * y) })).toEqual({ correct: false, mistake: null });
      }
      // level 1: three numbers, each a common divisor of the pair or not
      const c = makeQuestion(rng(seed * 104729), item, 1, 'common');
      own(...c.pair);
      expect(c.prompt).toContain(`${c.pair[0]} و ${c.pair[1]}`);
      expect(new Set(c.cards.map((k) => k.n)).size).toBe(3);
      for (const k of c.cards) {
        const yes = c.pair.every((n) => n % k.n === 0);
        expect(k.bin, `${k.n} for ${c.pair}`).toBe(yes ? 'yes' : 'no');
        expect(k.n).toBeGreaterThan(1); // 1 is never a card: it divides everything
        if (!yes) {
          expect(c.pair.some((n) => n % k.n === 0)).toBe(true); // a divisor of ONE of the two numbers
          expect(k.trap).toBe('divisor-of-one');
        }
      }
      // level 2: three equalities « PGCD(x ; y) = v », each on its own pair
      const s = makeQuestion(rng(seed * 7919 + 2), item, 2, 'sort');
      expect(new Set(s.cards.map((k) => `${k.x};${k.y}`)).size).toBe(3);
      for (const k of s.cards) {
        own(k.x, k.y);
        expect(k.text).toBe(`$\\mathrm{PGCD}(${k.x} ; ${k.y}) = ${k.v}$`);
        const g = pgcdApart(k.x, k.y);
        expect(k.bin).toBe(k.v === g ? 'yes' : 'no');
        if (k.trap === 'common-not-greatest')
          expect(k.x % k.v === 0 && k.y % k.v === 0 && k.v > 1 && k.v < g).toBe(true);
        if (k.trap === 'smaller-not-divisor') expect(k.v).toBe(Math.min(k.x, k.y));
        if (k.trap) {
          seen.add(k.trap);
          expect(grade(s, { ...right(s), [k.id]: 'yes' })).toEqual({ correct: false, mistake: k.trap });
        }
      }
      for (const k of c.cards) if (k.trap) seen.add(k.trap);
    }
    expect([...seen].sort()).toEqual(['common-not-greatest', 'divisor-of-one', 'smaller-not-divisor']);
    // the worked example: both lists true and whole, what is in both, the greatest; its first step on the mistake shown
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, ...FAMILIES[item].mistakes]) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          const [x, y] = e.title.match(/\d+/g).map(Number);
          own(x, y);
          expect(e.steps).toHaveLength(4);
          expect(e.steps[1]).toBe(`قواسم ${x}: ${divisorsApart(x).join(LIST_SEP)}.`);
          expect(e.steps[2]).toBe(`قواسم ${y}: ${divisorsApart(y).join(LIST_SEP)}.`);
          const both = divisorsApart(x).filter((d) => y % d === 0);
          expect(e.steps[3]).toBe(
            `القواسم المشتركة: ${both.join(LIST_SEP)}، أكبرها ${pgcdApart(x, y)}: $\\mathrm{PGCD}(${x} ; ${y}) = ${pgcdApart(x, y)}$.`,
          );
          for (const m of e.steps[0].matchAll(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/g)) {
            const [a, b, q, r] = m.slice(1).map(Number);
            expect(b * q + r).toBe(a);
            expect(r).toBeGreaterThan(0);
            expect(r).toBeLessThan(b);
          }
          if (mistake === 'common-not-greatest') {
            const d = Number(e.steps[0].match(/\d+/)[0]);
            expect(both).toContain(d);
            expect(d).toBeLessThan(pgcdApart(x, y));
          }
          expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
        }
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // its rules and memo: every list a true list of divisors, every PGCD true
    const texts = [...FAMILIES[item].rules.flatMap((r) => [r.text, r.example]), ...FAMILIES[item].memo];
    const lists = texts.flatMap((t) => [...t.matchAll(/قواسم (\d+): ([\d  ،]+\d)/g)].map((m) => [Number(m[1]), m[2]]));
    expect(lists.length).toBeGreaterThanOrEqual(2);
    for (const [n, l] of lists) expect(l.split('،').map((v) => Number(v.trim()))).toEqual(divisorsApart(n));
    for (const t of texts)
      for (const m of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = (\d+)/g)) expect(pgcdApart(+m[1], +m[2])).toBe(+m[3]);
    // the kit is played BEFORE « العددان الأوّليّان فيما بينهما »: nothing of it names that lesson's keys
    const all = JSON.stringify({ ...FAMILIES[item], make: null, example: null }) + MISTAKES['divisor-of-one'];
    expect(all).not.toMatch(/أوّلي|أولي|فيما بينهما|الوحيد/);
    expect(FAMILIES[item].icon).not.toBe('🤝'); // the icon of that lesson's first key
  });

  it('takes the tools of « العددان الأوّليّان فيما بينهما » from the learning net: the PGCD of lesson 4, with its family and its instrument', () => {
    const links = toolsForLesson('awwaliyan-fima-baynahuma');
    const tools = planTools(links, (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([
      ['4am.m1.r03', 'qasim-mushtarak-akbar', 'core'],
    ]);
    for (const t of links.filter((l) => l.weight !== 'support')) expect(familyFor(t.id), t.id).toBeTruthy();
    expect(familyFor('4am.m1.r03').labTool).toBe('common');
    expect(toolsFor('awwaliyan-fima-baynahuma', { earlierOnly: true }).all.map((t) => t.id)).toContain('common');
  });

  it('« الكسور المتساوية » (1am.m5.r02): every missing term computed apart, its traps named, never a fraction of the banks', () => {
    const item = '1am.m5.r02';
    /** Every fraction the two banks that use this family write (« \frac{n}{d} » and « "n/d" »). */
    const bankFractions = new Set(
      ['ikhtizal-kasr', 'ikhtizal-kitaba-kasriya'].flatMap((id) =>
        readBank(id).sheets.flatMap((s) => {
          const t = s.text;
          return [
            ...[...t.matchAll(/frac\{(\d+)\}\{(\d+)\}/g)].map((m) => `${m[1]}/${m[2]}`),
            ...[...t.matchAll(/(?<![\d.])(\d+)\/(\d+)(?![\d.])/g)].map((m) => `${m[1]}/${m[2]}`),
          ];
        }),
      ),
    );
    expect(bankFractions.size).toBeGreaterThan(100); // both banks were read
    const own = (n, d) => {
      expect(bankFractions.has(`${n}/${d}`), `the bank writes ${n}/${d}`).toBe(false);
      expect(n).toBeLessThan(d);
      expect(pgcdApart(n, d), `${n}/${d} can be divided`).toBeGreaterThan(1);
    };
    const fr = (t) => t.match(/\\frac\{(\d+)\}\{(\d+)\}/g).map((x) => x.match(/\d+/g).map(Number));
    const seen = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      for (const level of [1, 2]) {
        const w = makeQuestion(rng(seed * 37 + level), item, level, 'write', { first: seed % 5 === 0 });
        const { n, d, m, side } = w.calc;
        own(n, d);
        // the shape: two fractions with a real bar, ONE box in the second
        expect(w.tokens).toHaveLength(3);
        expect(w.tokens[0]).toEqual({ frac: [String(n), String(d)] });
        expect(w.tokens[1]).toBe('=');
        const second = w.tokens[2].frac;
        expect(second.filter((x) => typeof x === 'object')).toHaveLength(1);
        expect(second[side === 'bottom' ? 0 : 1]).toBe(String(m));
        const t = termApart(w.calc);
        expect(Number.isInteger(t), `${n}/${d}`).toBe(true);
        expect(side === 'bottom' ? t : m).toBeLessThan(side === 'bottom' ? d : d); // a smaller fraction
        expect(grade(w, { v: String(t) })).toEqual({ correct: true, mistake: null });
        expect(Math.max(n, d)).toBeLessThanOrEqual(level === 1 ? (seed % 5 === 0 ? 10 : 45) : 180);
        if (level === 2) expect(d).toBeGreaterThanOrEqual(30);
        // the slips, judged from the numbers: the same number subtracted, one term left as it was
        const [given, other] = side === 'bottom' ? [d, n] : [n, d];
        const sub = given - (other - m);
        if (sub > 0 && sub !== t) expect(grade(w, { v: String(sub) }).mistake).toBe('subtract-not-divide');
        expect(grade(w, { v: String(given) })).toEqual({ correct: false, mistake: 'one-term-only' });
        expect(grade(w, { v: String(t + 1) }).correct).toBe(false);
      }
      // three equalities « n/d = x/y », each on its own fraction
      for (const [level, form] of [
        [1, 'equal'],
        [2, 'sort'],
      ]) {
        const s = makeQuestion(rng(seed * 7919 + level), item, level, form);
        expect(new Set(s.cards.map((k) => `${k.n}/${k.d}`)).size).toBe(3);
        for (const k of s.cards) {
          own(k.n, k.d);
          const [[n, d], [x, y]] = fr(k.text);
          expect([n, d, x, y]).toEqual([k.n, k.d, k.x, k.y]);
          expect(k.bin).toBe(n * y === d * x ? 'yes' : 'no');
          if (k.trap === 'subtract-not-divide') expect(n - x).toBe(d - y); // the same number taken from both terms
          if (k.trap === 'one-term-only') expect([d === y, n % x === 0 && n !== x]).toEqual([true, true]);
          if (k.trap) {
            seen.add(k.trap);
            expect(k.bin).toBe('no');
            expect(grade(s, { ...right(s), [k.id]: 'yes' })).toEqual({ correct: false, mistake: k.trap });
          }
        }
      }
    }
    expect([...seen].sort()).toEqual(['one-term-only', 'subtract-not-divide']);
    // the worked example: true divisions, an equal fraction; its first step on the mistake shown, with an UNEQUAL fraction
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, ...FAMILIES[item].mistakes]) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          const [n, d] = e.title.match(/\d+/g).map(Number);
          own(n, d);
          expect(e.steps).toHaveLength(4);
          const [k] = e.steps[1].match(/\d+/).map(Number);
          expect([n % k, d % k]).toEqual([0, 0]);
          expect(e.steps[2]).toContain(
            `\\frac{${n}}{${d}} = \\frac{${n} \\div ${k}}{${d} \\div ${k}} = \\frac{${n / k}}{${d / k}}`,
          );
          if (mistake) {
            const [[x, y], [p, q]] = fr(e.steps[0]);
            expect([p, q]).toEqual([n, d]);
            expect(x * d === y * n, `${x}/${y} is not ${n}/${d}`).toBe(false);
          }
          expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
        }
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // its rules and memo: every equality of fractions true, every « لا يساويه » false
    const texts = [...FAMILIES[item].rules.flatMap((r) => [r.text, r.example]), ...FAMILIES[item].memo];
    const value = (side) =>
      // eslint-disable-next-line no-new-func
      Function(
        `return ${side
          .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
          .replace(/\\times/g, '*')
          .replace(/\\div/g, '/')};`,
      )();
    let n = 0;
    for (const t of texts)
      for (const [, f] of t.matchAll(/\$([^$]+)\$/g)) {
        if (!f.includes('=')) continue;
        const sides = f.split('=').map(value);
        for (const v of sides) expect(Math.abs(v - sides[0]) < 1e-9, f).toBe(true);
        n += 1;
      }
    expect(n).toBeGreaterThanOrEqual(3);
    expect(9 * 9).not.toBe(15 * 3); // the rule's « 3/9 is not 9/15 » (6 taken from both terms)
    expect(FAMILIES[item].rules[1].example).toContain('$\\frac{3}{9}$، وهو لا يساويه');
    // the kit is played BEFORE « اختزال كسر »: nothing of it names that lesson's keys (world/story.js › TABLETS)
    const all =
      JSON.stringify({ ...FAMILIES[item], make: null, example: null }) +
      MISTAKES['subtract-not-divide'] +
      MISTAKES['one-term-only'];
    expect(all).not.toMatch(/اختزال|نختزل|مختزل|مراحل|غير قابل|المشترك الأكبر|PGCD|أوّلي/);
  });

  it('« حساب قوة عدد نسبي » (3am.m3.r06): every power computed apart, a typed value never negative, its slips named, no word of the lesson', () => {
    const item = '3am.m3.r06';
    // the squares the lesson's world builds are never written by the kit (its courts and its yard, and 9 × 9 of tablet 🔁)
    const areas = new Set(
      [...Object.values(COURTS), ...YARD].map(Number).filter((a) => Number.isInteger(Math.sqrt(a))),
    );
    areas.add(81);
    expect(areas.size).toBeGreaterThanOrEqual(6);
    const seen = new Set();
    const shapes = new Set();
    for (let seed = 1; seed <= 300; seed += 1) {
      for (const level of [1, 2]) {
        const w = makeQuestion(rng(seed * 104729 + level), item, level, 'write', { first: seed % 5 === 0 });
        const c = w.calc;
        shapes.add(c.n != null ? 'fraction' : `${c.x < 0 ? '-' : '+'}${c.e}`);
        expect(c.op).toBe('pow');
        expect(w.tokens[0].pow[1]).toBe(String(c.e)); // the exponent is drawn as itself
        expect(w.tokens[1]).toBe('=');
        if (c.n != null) {
          // « (p/q)² = ▢/▢ »: a fraction that cannot be divided, both terms boxed under a real bar
          expect(level).toBe(2);
          expect(pgcdApart(c.n, c.d)).toBe(1);
          expect(w.tokens[0].pow[0]).toEqual({ frac: [String(c.n), String(c.d)] });
          expect(slotsOf(w.tokens).map((t) => t.slot)).toEqual(['n', 'd']);
          const [N, D] = [c.n * c.n, c.d * c.d];
          expect(grade(w, { n: String(N), d: String(D) })).toEqual({ correct: true, mistake: null });
          expect(grade(w, { n: String(2 * N), d: String(2 * D) }).correct).toBe(true); // an equal fraction is the same value
          expect(grade(w, { n: String(N), d: String(c.d) })).toEqual({ correct: false, mistake: 'fraction-one-term' });
          expect(grade(w, { n: String(2 * c.n), d: String(2 * c.d) })).toEqual({
            correct: false,
            mistake: 'power-times',
          });
          expect(grade(w, { n: String(N + 1), d: String(D) }).correct).toBe(false);
          expect(String(D).length).toBeLessThanOrEqual(3); // the keypad writes three characters a box
        } else {
          const v = powApart(c);
          expect(v).toBeGreaterThan(0); // a typed value is never negative: the keypad has no minus sign
          expect(String(v).length).toBeLessThanOrEqual(3);
          expect(w.tokens[0].pow[0]).toBe(c.x < 0 ? `(−${-c.x})` : String(c.x));
          expect(slotsOf(w.tokens).map((t) => t.slot)).toEqual(['v']);
          expect(grade(w, { v: String(v) })).toEqual({ correct: true, mistake: null });
          if (Math.abs(c.x) * c.e !== v)
            expect(grade(w, { v: String(Math.abs(c.x) * c.e) })).toEqual({ correct: false, mistake: 'power-times' });
          expect(grade(w, { v: String(v + 1) }).correct).toBe(false);
          if (level === 1) {
            expect(c.e).toBe(2);
            expect(areas.has(v), `${c.x}² = ${v}`).toBe(false);
            if (seed % 5 === 0) expect([2, 8]).toContain(c.x); // the very first question: a near-certain win
          } else expect(c.e).toBe(3);
        }
        expect(w.prompt).not.toMatch(/\$/);
      }
      // the sorts: three equalities of powers, each judged here from its own text, three different bases
      for (const [level, form] of [
        [1, 'squares'],
        [2, 'sort'],
      ]) {
        const s = makeQuestion(rng(seed * 7919 + level), item, level, form);
        expect(s.cards).toHaveLength(3);
        expect(new Set(s.cards.map((k) => Math.abs(k.base.n))).size, JSON.stringify(s.cards)).toBe(3);
        expect(s.cards.some((k) => k.bin === 'yes') && s.cards.some((k) => k.bin === 'no')).toBe(true);
        for (const k of s.cards) {
          expect(k.bin, k.text).toBe(powerTrue(k.text) ? 'yes' : 'no');
          if (level === 1) expect(k.e).toBe(2);
          if (level === 1 && k.bin === 'yes')
            expect(areas.has(Number(k.text.match(/= (\d+)\$/)[1])), k.text).toBe(false);
          if (k.bin === 'yes') expect(k.trap).toBe(null);
          else {
            expect(MISTAKES[k.trap], k.text).toBeTruthy();
            expect(grade(s, { ...right(s), [k.id]: 'yes' })).toEqual({ correct: false, mistake: k.trap });
            seen.add(k.trap);
          }
          if (k.trap === 'square-sign') expect(k.text).toMatch(/^\$\(-\d+\)\^\{2\} = -\d+\$$/);
          if (k.trap === 'odd-sign') expect(k.text).toMatch(/^\$\(-\d+\)\^\{3\} = \d+\$$/);
          if (k.trap === 'decimal-places') expect(k.text).toMatch(/= \d+\{,\}\d\$$/); // one decimal where two belong
          if (k.trap === 'fraction-one-term') {
            const [[p, q], [x, y]] = [...k.text.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)].map((m) => [+m[1], +m[2]]);
            expect([x, y]).toEqual([p * p, q]);
          }
        }
      }
    }
    expect([...seen].sort()).toEqual(['decimal-places', 'fraction-one-term', 'odd-sign', 'power-times', 'square-sign']);
    expect([...shapes].sort()).toEqual(['+2', '+3', '-2', 'fraction']); // every shape of a typed answer was dealt
    // every equality the worked examples, the rules and the memo write is TRUE (evaluated here; letters are skipped)
    const value = (t) =>
      // eslint-disable-next-line no-new-func
      Function(
        `return ${t
          .replace(/\\left\(|\\right\)/g, (m) => (m.includes('left') ? '(' : ')'))
          .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
          .replace(/\\times/g, '*')
          .replace(/\{,\}/g, '.')
          .replace(/\^\{(\d+)\}/g, '**$1')};`,
      )();
    const checkTexts = (texts) => {
      let n = 0;
      for (const t of texts)
        for (const [, f] of t.matchAll(/\$([^$]+)\$/g)) {
          if (!f.includes('=') || /[a-z]/.test(f.replace(/\\(frac|times|left|right)/g, ''))) continue;
          const sides = f.split('=').map(value);
          for (const v of sides) expect(Math.abs(v - sides[0]) < 1e-9, f).toBe(true);
          n += 1;
        }
      return n;
    };
    let shown = 0;
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, ...FAMILIES[item].mistakes]) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          expect(e.steps.length).toBeGreaterThanOrEqual(3);
          shown += checkTexts(e.steps);
          expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
          if (mistake === 'odd-sign') expect(e.steps.at(-1)).toMatch(/= -\d+\$/);
          if (mistake === 'decimal-places') expect(e.steps.at(-1)).toMatch(/= 0\{,\}\d\d\$/);
          if (mistake === 'fraction-one-term') expect(e.steps.at(-1)).toContain('\\frac');
        }
    expect(shown).toBeGreaterThan(500);
    const texts = [...FAMILIES[item].rules.flatMap((r) => [r.text, r.example]), ...FAMILIES[item].memo];
    expect(checkTexts(texts)).toBeGreaterThanOrEqual(8);
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // the kit is played BEFORE « الجذر التربيعي »: no root sign, no name of the lesson's keys, no word of its world
    const examples = Array.from({ length: 20 }, (_, i) =>
      FAMILIES[item].mistakes.map((m) =>
        JSON.stringify(FAMILIES[item].example(rng(i + 1), 1 + (i % 2), { mistake: m })),
      ),
    ).flat();
    const all = [
      JSON.stringify({ ...FAMILIES[item], make: null, example: null }),
      ...FAMILIES[item].mistakes.map((m) => MISTAKES[m]),
      ...examples,
    ].join(' ');
    expect(all).not.toMatch(/√|sqrt|جذر|الجذر|مضبوط|مقرّب|مقرب|ذهاب|إياب|ضلع|ساحة|بلاط|مقياس|منصّة|شريط/);
    expect(['🔑', '✍️', '🔁']).not.toContain(FAMILIES[item].icon);
    expect(FAMILIES[item].labTool).toBe(null); // no instrument of 3AM exists in « مختبري »
  });

  it('takes the tool of « الجذر التربيعي لعدد موجب » from the learning net: the powers of 3AM, its one core tool', () => {
    const links = toolsForLesson('jidhr-tarbii');
    const tools = planTools(links, (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([['3am.m3.r06', 'quwat-adad-nisbi', 'core']]);
    for (const t of links.filter((l) => l.weight !== 'support')) expect(familyFor(t.id), t.id).toBeTruthy();
  });

  it('takes the tools of « اختزال كسر » from the learning net: the PGCD of lesson 4 and the equal fractions of 1AM, each with its family', () => {
    const links = toolsForLesson('ikhtizal-kasr');
    const tools = planTools(links, (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([
      ['4am.m1.r03', 'qasim-mushtarak-akbar', 'core'],
      ['1am.m5.r02', 'ikhtizal-kitaba-kasriya', 'core'],
    ]);
    for (const t of links.filter((l) => l.weight !== 'support')) expect(familyFor(t.id), t.id).toBeTruthy();
    const before = toolsFor('ikhtizal-kasr', { earlierOnly: true }).all.map((t) => t.id);
    expect(before).toEqual(expect.arrayContaining(['common', 'rules']));
    expect(before).not.toContain('strip'); // the lesson's own instrument is never in its launch
  });

  it('« الجمع والطرح والضرب » (1AM): its operations are true, in their ranges, and a slip is named', () => {
    const item = '1am.m1.r01';
    const seen = new Set();
    each((f, level, form, q, seed) => {
      if (f.item !== item) return;
      if (q.gesture === 'write') {
        const { op, x, y, z } = q.calc;
        expect(q.tokens.filter((t) => typeof t === 'object').map((t) => t.slot)).toEqual(['v']);
        expect(q.tokens.slice(0, 3)).toEqual([String(x), { times: '×', minus: '−', timesPlus: '×' }[op], String(y)]);
        if (op === 'timesPlus') expect(z).toBeLessThan(x); // the shape of « b × q + r »: what is left is smaller
        if (op === 'minus') expect(x - y).toBeGreaterThan(0);
        if (level === 1) {
          expect(op).not.toBe('timesPlus');
          if (op === 'times') expect(Math.max(x, y)).toBeLessThanOrEqual(9);
          if (op === 'minus') expect(x).toBeLessThan(70);
        }
        if (level === 1 && seed % 5 === 0) expect(x * y).toBeLessThanOrEqual(25); // the very first question: a near-certain win
        if (level === 2 && op === 'times') expect(x).toBeGreaterThanOrEqual(12);
        if (level === 2 && op === 'minus') expect(x % 10).toBeLessThan(y % 10); // a borrow is needed
        if (op === 'minus') expect(q.prompt).toContain('دج');
        expect(q.prompt).not.toMatch(/DA|\\times/);
      }
      if (q.gesture === 'place') {
        expect(q.target).toBe(q.calc.x - q.calc.y);
        expect(q.a).toBe(q.calc.x);
        expect(q.a).toBeLessThan(q.max);
        expect(q.target).toBeGreaterThan(0);
        expect(grade(q, { x: q.calc.x + q.calc.y, moved: true }).mistake).toBe('add-for-sub');
      }
    });
    // the sort on spread seeds (the first draw of a small seed is near 0 and always picks the first shape)
    for (let seed = 1; seed <= 200; seed += 1) {
      const q = makeQuestion(rng(seed * 104729 + 17), item, 2, 'sort');
      for (const c of q.cards) {
        expect(c.bin, c.text).toBe(arithmetic(c.text) ? 'yes' : 'no');
        if (c.trap) seen.add(c.trap);
      }
    }
    expect([...seen].sort()).toEqual(['borrow-forgot', 'order-ops', 'table-slip']);
    // a slip is named by grade, from the operation alone
    const w = (op, x, y, z) => ({ gesture: 'write', calc: { op, x, y, z }, tokens: [{ slot: 'v' }] });
    expect(grade(w('times', 7, 8), { v: '56' })).toEqual({ correct: true, mistake: null });
    expect(grade(w('times', 7, 8), { v: '63' })).toEqual({ correct: false, mistake: 'table-slip' });
    expect(grade(w('times', 7, 8), { v: '50' })).toEqual({ correct: false, mistake: null });
    expect(grade(w('timesPlus', 6, 9, 5), { v: '84' })).toEqual({ correct: false, mistake: 'order-ops' });
    expect(grade(w('timesPlus', 6, 9, 5), { v: '59' })).toEqual({ correct: true, mistake: null });
    expect(grade(w('minus', 72, 47), { v: '35' })).toEqual({ correct: false, mistake: 'borrow-forgot' });
    expect(grade(w('minus', 72, 47), { v: '119' })).toEqual({ correct: false, mistake: 'add-for-sub' });
    expect(grade(w('minus', 72, 47), { v: '25' })).toEqual({ correct: true, mistake: null });
    // every worked example: each equality it writes is true, and it answers the mistake it was opened on
    const eqs = (steps) =>
      steps
        .flatMap((s) => [...s.matchAll(/\$([^$]*=[^$]*)\$/g)].map((m) => m[1]))
        .filter((e) => !/[a-z]/.test(e.replaceAll('\\times', '')));
    for (let seed = 1; seed <= 80; seed += 1)
      for (const level of [1, 2])
        for (const mistake of [null, 'table-slip', 'borrow-forgot', 'order-ops', 'add-for-sub']) {
          const e = FAMILIES[item].example(rng(seed), level, { mistake });
          const all = eqs(e.steps);
          expect(all.length, mistake).toBeGreaterThanOrEqual(2);
          for (const x of all) {
            const [l, r] = x.split(' = ');
            expect(arithmetic(`$${x}$`) ?? arithmetic(`$${r} = ${l}$`), `${mistake}: ${x}`).toBe(true); // « 23 = 20 + 3 » too
          }
          if (mistake === 'order-ops') expect(e.steps.at(-1)).toMatch(/\\times \d+ \+ \d+ =/);
          if (mistake === 'borrow-forgot' || mistake === 'add-for-sub') expect(e.title).toContain('الاستلاف');
          expect(`${e.title} ${e.steps.join(' ')}`).not.toMatch(/undefined|NaN/);
        }
    for (const m of FAMILIES[item].mistakes) expect(MISTAKES[m], m).toBeTruthy();
    // every mistake its grading names is one of the family's: the borrow example opens on 'add-for-sub' too
    expect(FAMILIES[item].mistakes).toContain('add-for-sub');
  });

  it('the three lessons of the division road take their tools from the net, each with its family', () => {
    const plan = (code) =>
      planTools(toolsForLesson(code), (id) => Boolean(familyFor(id))).map((t) => [t.item, t.lesson.code]);
    // « القسمة الإقليدية » (1AM) stands on the operations of « معنى الجمع والطرح »
    expect(plan('qisma-iqlidiya-baqi')).toEqual([['1am.m1.r01', 'mana-jam-tarh']]);
    // « قواعد قابلية القسمة » stands on the Euclidean division
    expect(plan('qawaid-qabiliyat-qisma')).toEqual([['1am.m3.r01', 'qisma-iqlidiya-baqi']]);
    // « القسمة الإقليدية وحصر حاصل القسمة » (2AM): the 1AM division — never 2am.m1.r05, the الكفاءة of the lesson AFTER it
    expect(plan('qisma-iqlidiya-hasr')).toEqual([['1am.m3.r01', 'qisma-iqlidiya-baqi']]);
    for (const code of ['qisma-iqlidiya-baqi', 'qawaid-qabiliyat-qisma', 'qisma-iqlidiya-hasr'])
      for (const t of toolsForLesson(code).filter((l) => l.weight !== 'support'))
        expect(familyFor(t.id), `${code}: ${t.id}`).toBeTruthy();
  });

  it('takes the tools of « قواسم عدد طبيعي » from the learning net: the الكفاءة of the lesson before it, then the 2AM division', () => {
    const tools = planTools(toolsForLesson('qawasim-adad-tabii'), (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([
      ['4am.m1.r01', 'qasim-adad-tabii', 'core'],
      ['2am.m1.r04', 'qisma-iqlidiya-hasr', 'core'], // the Euclidean division (2AM), core since 2026-11-18
    ]);
  });

  it('takes the tools of « خواص قواسم عدد طبيعي » from the learning net: the same two core الكفاءات, each with its family', () => {
    const links = toolsForLesson('khawass-qawasim');
    const tools = planTools(links, (id) => Boolean(familyFor(id)));
    expect(tools.map((t) => [t.item, t.lesson.code, t.weight])).toEqual([
      ['4am.m1.r01', 'qasim-adad-tabii', 'core'],
      ['2am.m1.r04', 'qisma-iqlidiya-hasr', 'core'], // its third property (a common divisor divides the remainder) needs it
    ]);
    // every CORE link of the net has a family: the launch of lesson 3 is never an empty kit (LAUNCH_KIT.md §4)
    for (const t of links.filter((l) => l.weight !== 'support')) expect(familyFor(t.id), t.id).toBeTruthy();
  });

  it('changes the form of the question inside a launch', () => {
    expect(pickForm('1am.m3.r01', 1, [])).toBe('write');
    expect(pickForm('1am.m3.r01', 1, ['1:write'])).toBe('place');
    expect(pickForm('1am.m3.r01', 2, ['1:write'])).toBe('sort'); // level 2 opens on the family's sort (2026-11-18)
    expect(pickForm('1am.m3.r01', 2, ['1:write', '2:sort'])).toBe('write');
    expect(pickForm('1am.m3.r02', 2, ['2:three', '2:nine'])).toBe('four');
  });

  it('asks the level-2 forms of every family in a known order: a family with a level-2 sort opens on it', () => {
    const order = (item, level) => {
      const used = [];
      for (let i = 0; i < FAMILIES[item].forms[level].length; i += 1)
        used.push(`${level}:${pickForm(item, level, used)}`);
      return used.map((u) => u.slice(2));
    };
    expect(Object.fromEntries(Object.keys(FAMILIES).map((item) => [item, order(item, 2)]))).toEqual({
      '1am.m1.r01': ['sort', 'write'],
      '1am.m3.r01': ['sort', 'write'],
      '2am.m1.r04': ['sort', 'write'],
      '1am.m3.r02': ['three', 'nine', 'four'], // no form named `sort`: its own order
      '4am.m1.r01': ['sentences', 'pick'], // no form named `sort`: its own order
      '4am.m1.r02': ['sort', 'write'],
      '4am.m1.r03': ['sort', 'write'],
      '1am.m5.r02': ['sort', 'write'],
      '3am.m3.r06': ['sort', 'write'],
    });
    for (const item of Object.keys(FAMILIES)) {
      expect(order(item, 1), item).toEqual(FAMILIES[item].forms[1]); // level 1 is never reordered
      expect(new Set(order(item, 2)), item).toEqual(new Set(FAMILIES[item].forms[2])); // every form is still asked
      if (FAMILIES[item].forms[2].includes('sort')) expect(pickForm(item, 2, ['1:write']), item).toBe('sort');
    }
  });
});

/**
 * A whole launch played by the PURE pieces the component chains (`nextStep` → `nextForm` → `makeQuestion` → `grade`), with
 * a seeded draw: `wants(q, i, phase)` says whether the i-th answer is right, or returns the answer itself. A worked example is
 * « seen » at once, as the student's « جرّب » does. `recheck` replays « أعد فحص الأداة » on the answers of a launch.
 */
function playLaunch(tools, wants, { seed = 1, answers = [], skipWorkshop = false } = {}) {
  const rand = rng(seed);
  const list = [...answers];
  const used = {};
  let exampleSeen = skipWorkshop;
  for (let i = 0; i < 30; i += 1) {
    const step = nextStep({ tools, answers: list, elapsed: 30, exampleSeen, skipWorkshop });
    if (step.type === 'result') return list;
    if (step.type === 'example') {
      exampleSeen = true;
      continue;
    }
    const u = (used[step.item] ??= []);
    const form = nextForm(step, list, u);
    u.push(`${step.level}:${form}`);
    const q = makeQuestion(rand, step.item, step.level, form, { first: step.first });
    const w = wants(q, list.length - answers.length, step.phase);
    const answer = w === true ? rightOf(q) : w === false ? wrongOf(q) : w;
    const g = grade(q, answer);
    list.push({ item: q.item, level: q.level, form, k: q.k ?? null, ...g, unsure: false, phase: step.phase, q });
  }
  throw new Error('a launch never ends');
}
const rightOf = (q) =>
  q.calc
    ? right(q)
    : q.gesture === 'write'
      ? { q: String(Math.floor(q.a / q.b)), r: String(q.a % q.b) }
      : q.gesture === 'place'
        ? { x: q.b * Math.floor(q.a / q.b), moved: true }
        : Object.fromEntries(q.cards.map((c) => [c.id, c.bin]));
const wrongOf = (q) =>
  q.calc
    ? q.gesture === 'write'
      ? { v: String(calcApart(q.calc) + 1) }
      : { x: q.target + 1, moved: true }
    : q.gesture === 'write'
      ? { q: String(Math.floor(q.a / q.b) + 1), r: String(q.a % q.b) }
      : q.gesture === 'place'
        ? { x: q.a + 1, moved: true }
        : Object.fromEntries(q.cards.map((c) => [c.id, c.bin === 'yes' ? 'no' : 'yes']));
const trail = (list) =>
  list.map(
    (a) =>
      `${a.item === list[0].item ? 'A' : 'B'}${a.level}:${a.form}${a.phase === 'station' ? '' : `/${a.phase}`}${a.correct ? '+' : '-'}`,
  );

describe('عُدّة الانطلاق — whole launches (the documented students)', () => {
  const has = (id) => Boolean(familyFor(id));
  const two = planTools(toolsForLesson('qawasim-adad-tabii'), has); // lessons 2 and 3: A = 4am.m1.r01, B = 2am.m1.r04
  const pilot = planTools(toolsForLesson('qasim-adad-tabii'), has); // A = 1am.m3.r01, B = 1am.m3.r02
  const seq = (n) => (q, i) => !n.includes(i);

  it('lessons 2 and 3: the four students of the walk — same bands and scores, the level-2 sort of the division asked', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const knows = playLaunch(two, () => true, { seed });
      expect(trail(knows)).toEqual(['A1:write+', 'A2:sentences+', 'B1:write+', 'B2:sort+']); // was B2:write before 2026-11-18
      expect(scoreOf(kitOf(two, knows))).toEqual({ lit: 4, total: 4, percent: 100 });

      const slips = playLaunch(two, seq([1, 2]), { seed });
      expect(trail(slips)).toEqual([
        'A1:write+',
        'A2:sentences-',
        'B1:write-',
        'B1:place+',
        'B2:sort+', // was B2:write
        'A2:sentences/workshop+',
        'A2:sentences/workshop+',
      ]);
      expect(kitOf(two, slips).map((t) => [t.band, t.repaired])).toEqual([
        [BANDS.CONSOLIDATE, true],
        [BANDS.CONSOLIDATE, false],
      ]);
      expect(scoreOf(kitOf(two, slips)).percent).toBe(50);

      const misses = playLaunch(two, () => false, { seed });
      expect(trail(misses)).toEqual([
        'A1:write-',
        'A1:pick-',
        'B1:write-',
        'B1:place-',
        'A1:pick/workshop-',
        'A1:pick/workshop-',
      ]);
      expect(scoreOf(kitOf(two, misses)).percent).toBe(0);
      expect(gateOf(kitOf(two, misses)).item).toBe(two[0].item);

      const missesB = playLaunch(two, (q) => q.item === two[0].item, { seed });
      expect(trail(missesB)).toEqual([
        'A1:write+',
        'A2:sentences+',
        'B1:write-',
        'B1:place-',
        'B1:place/workshop-',
        'B1:place/workshop-',
      ]);
      expect(gateOf(kitOf(two, missesB)).item).toBe(two[1].item);
    }
  });

  it('the pilot: the student of the walk — the workshop on the flag, then a re-check that now reaches the 1AM sort', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const first = playLaunch(pilot, (q, i, phase) => q.item === pilot[1].item || phase === 'workshop', { seed });
      expect(trail(first).map((s) => s.replace(/B2:(three|nine|four)/, 'B2:rule'))).toEqual([
        'A1:write-',
        'A1:place-',
        'B1:two+',
        'B2:rule+',
        'A1:place/workshop+',
        'A1:place/workshop+',
      ]);
      expect(scoreOf(kitOf(pilot, first)).percent).toBe(75);
      const kept = first.filter((a) => a.item !== pilot[0].item || a.phase === 'capsule');
      const again = playLaunch(pilot, () => true, { seed: seed + 1, answers: kept, skipWorkshop: true });
      expect(trail(again.slice(kept.length))).toEqual(['A1:write+', 'A2:sort+']); // was A2:write: the 1AM sort is reachable
      expect(scoreOf(kitOf(pilot, again)).percent).toBe(100);
    }
  });

  it('« القسمة الإقليدية » (1AM): a student who knows takes off, one who misses everything gets the capsule', () => {
    const one = planTools(toolsForLesson('qisma-iqlidiya-baqi'), has);
    for (let seed = 1; seed <= 40; seed += 1) {
      const knows = playLaunch(one, () => true, { seed });
      expect(trail(knows)).toEqual(['A1:write+', 'A2:sort+']);
      expect(scoreOf(kitOf(one, knows)).percent).toBe(100);
      expect(gateOf(kitOf(one, knows))).toBe(null);
      const misses = playLaunch(one, () => false, { seed });
      expect(trail(misses)).toEqual(['A1:write-', 'A1:place-', 'A1:place/workshop-', 'A1:place/workshop-']);
      expect(gateOf(kitOf(one, misses)).item).toBe('1am.m1.r01');
    }
  });

  it('a launch can now produce `quotient-zero`: refusing « $s = b \\times 0 + s$ » names it, and the workshop opens on it', () => {
    let produced = 0;
    for (let seed = 1; seed <= 60; seed += 1) {
      const B = two[1].item;
      const list = playLaunch(
        two,
        (q, i, phase) => {
          if (q.item !== B || q.level !== 2 || phase === 'workshop') return true;
          // right on every card but the one of the quotient 0, refused
          return Object.fromEntries(q.cards.map((c) => [c.id, c.miss === 'quotient-zero' ? 'no' : c.bin]));
        },
        { seed: seed * 104729 + 17 },
      );
      const asked = list.find((a) => a.item === B && a.level === 2 && a.phase === 'station');
      expect(asked.form).toBe('sort');
      if (!asked.q.cards.some((c) => c.miss === 'quotient-zero')) continue; // one shape in five has no quotient-0 card
      produced += 1;
      expect(asked).toMatchObject({ correct: false, mistake: 'quotient-zero' });
      const kit = kitOf(two, list);
      expect(kit[1]).toMatchObject({ band: BANDS.CONSOLIDATE, mistakes: ['quotient-zero'] });
      expect(workshopTool(two, list)).toEqual({ item: B, level: 2 }); // A is « ثابتة »: the workshop is B's, on its sort
      expect(list.filter((a) => a.phase === 'workshop').map((a) => a.form)).toEqual(['sort', 'sort']);
      const ex = FAMILIES[B].example(rng(seed), 2, { mistake: asked.mistake });
      expect(ex.steps.at(-1)).toMatch(/\\times 0 \+/); // the worked example of the workshop answers that mistake
    }
    expect(produced).toBeGreaterThan(30);
  });
});

describe('عُدّة الانطلاق — the engine of a launch', () => {
  const links = toolsForLesson('qasim-adad-tabii');
  const has = (id) => Boolean(familyFor(id));
  const tools = planTools(links, has);
  const [A, B] = tools.map((t) => t.item);
  const ans = (item, level, correct, extra = {}) => ({
    item,
    level,
    correct,
    unsure: false,
    phase: 'station',
    mistake: null,
    ...extra,
  });
  const play = (answers, extra = {}) => nextStep({ tools, answers, elapsed: 30, ...extra });

  it('takes its tools from the learning net: the two earlier الكفاءات of the pilot lesson, each with its home lesson', () => {
    expect(tools.map((t) => [t.item, t.lesson.code, t.grade, t.weight])).toEqual([
      ['1am.m3.r01', 'qisma-iqlidiya-baqi', '1am', 'core'],
      ['1am.m3.r02', 'qawaid-qabiliyat-qisma', '1am', 'support'],
    ]); // the core tool is measured first
    expect(planTools(links, () => false)).toEqual([]);
  });

  it('asks an easy question then a harder one, and stops as soon as it knows', () => {
    expect(play([])).toEqual({ type: 'question', item: A, level: 1, phase: 'station', first: true });
    expect(play([ans(A, 1, true)])).toMatchObject({ item: A, level: 2, first: false });
    expect(play([ans(A, 1, true), ans(A, 2, true)])).toMatchObject({ item: B, level: 1 });
    expect(play([ans(A, 1, true), ans(A, 2, true), ans(B, 1, true), ans(B, 2, true)])).toEqual({ type: 'result' }); // four answers, no workshop
  });

  it('never judges a tool on one answer, and a doubt is not a success', () => {
    expect(play([ans(A, 1, false)])).toMatchObject({ item: A, level: 1 }); // a second easy one
    expect(play([ans(A, 1, false), ans(A, 1, true)])).toMatchObject({ item: A, level: 2 });
    expect(play([ans(A, 1, true, { unsure: true })])).toMatchObject({ item: A, level: 1 });
    const kit = kitOf(tools, [ans(A, 1, false), ans(A, 1, false), ans(B, 1, true), ans(B, 2, false)]);
    expect(kit.map((t) => [t.band, t.segments])).toEqual([
      [BANDS.START, 0],
      [BANDS.CONSOLIDATE, 1],
    ]);
    expect(scoreOf(kit)).toEqual({ lit: 1, total: 4, percent: 25 });
  });

  it('repairs the weakest tool on the spot: an example, two questions — and a repaired tool is not « ثابتة » yet', () => {
    const base = [ans(A, 1, false, { mistake: 'rest-too-big' }), ans(A, 1, false), ans(B, 1, true), ans(B, 2, false)];
    expect(workshopTool(tools, base)).toEqual({ item: A, level: 1 });
    expect(play(base)).toEqual({ type: 'example', item: A, level: 1 });
    expect(play(base, { exampleSeen: true })).toMatchObject({ type: 'question', item: A, level: 1, phase: 'workshop' });
    const shop = (c1, c2) => [...base, ans(A, 1, c1, { phase: 'workshop' }), ans(A, 1, c2, { phase: 'workshop' })];
    expect(play(shop(true, true), { exampleSeen: true })).toEqual({ type: 'result' }); // ONE workshop: B is not repaired in the same launch
    expect(kitOf(tools, shop(true, true))[0]).toMatchObject({
      band: BANDS.CONSOLIDATE,
      repaired: true,
      segments: 1,
      mistakes: ['rest-too-big'],
    });
    expect(kitOf(tools, shop(true, false))[0]).toMatchObject({ band: BANDS.START, repaired: false });
    expect(priorities(kitOf(tools, shop(true, false))).first.item).toBe(A);
    expect(priorities(kitOf(tools, shop(true, true))).first.item).toBe(B); // not repaired comes before repaired
    expect(play(base, { skipWorkshop: true })).toEqual({ type: 'result' });
  });

  it('respects the five minutes and the twelve questions: what was not asked stays « لم نفحصها بعد » and does not cost points', () => {
    expect(nextStep({ tools, answers: [ans(A, 1, true), ans(A, 2, true)], elapsed: CAP.seconds })).toEqual({
      type: 'result',
    });
    const kit = kitOf(tools, [ans(A, 1, true), ans(A, 2, true)]);
    expect(kit[1].band).toBe(BANDS.UNSEEN);
    expect(scoreOf(kit)).toEqual({ lit: 2, total: 2, percent: 100 });
    expect(
      nextStep({
        tools,
        answers: [ans(A, 1, false), ans(A, 1, false), ans(B, 1, true), ans(B, 2, true)],
        elapsed: CAP.seconds - 10,
      }),
    ).toEqual({ type: 'result' }); // no time left for a workshop
    expect(scoreOf(kitOf(tools, [])).percent).toBe(null);
  });

  it('a tool measured « ثابتة » in the last three weeks arrives charged and is not asked again', () => {
    const now = 1e12;
    const store = mergeKit(
      {},
      'qasim-adad-tabii',
      kitOf(tools, [ans(A, 1, true), ans(A, 2, true), ans(B, 1, true), ans(B, 2, false)]),
      now,
    );
    expect(store.items[A]).toEqual({ band: BANDS.SOLID, repaired: false, at: now });
    expect(store.lessons['qasim-adad-tabii']).toMatchObject({
      tries: 1,
      last: { percent: 75 },
      first: { percent: 75 },
    });
    const again = planTools(links, has, store.items, now + 5 * 86400000);
    expect(again.map((t) => t.known)).toEqual([true, false]);
    expect(nextStep({ tools: again, answers: [] })).toMatchObject({ item: B, level: 1, first: true });
    expect(planTools(links, has, store.items, now + 30 * 86400000).map((t) => t.known)).toEqual([false, false]); // three weeks later it is asked again
    const second = mergeKit(store, 'qasim-adad-tabii', kitOf(again, [ans(B, 1, true), ans(B, 2, true)]), now + 9);
    expect(second.lessons['qasim-adad-tabii']).toMatchObject({
      tries: 2,
      first: { percent: 75 },
      last: { percent: 100 },
    });
    expect(second.items[A].at).toBe(now); // a tool that was not asked keeps its date
  });

  it('the gate: ONE capsule for a CORE tool left empty — it opens by doing, whatever the answers say', () => {
    const miss = (item) => [ans(item, 1, false), ans(item, 1, false)];
    const solid = (item) => [ans(item, 1, true), ans(item, 2, true)];
    const cap = (item, c1, c2) => [ans(item, 1, c1, { phase: 'capsule' }), ans(item, 1, c2, { phase: 'capsule' })];
    expect(gateOf(kitOf(tools, [...solid(A), ...solid(B)]))).toBe(null);
    expect(gateOf(kitOf(tools, [...miss(A), ...solid(B)])).item).toBe(A); // the division is core: the lesson cannot be passed without it
    expect(gateOf(kitOf(tools, [...solid(A), ...miss(B)]))).toBe(null); // the rules are a support: they never close the door
    expect(gateOf(kitOf(tools, [ans(A, 1, true), ans(A, 2, false), ...miss(B)]))).toBe(null); // « تحتاج تثبيتًا » is enough to go
    expect(gateOf(kitOf(tools, [ans(A, 1, false)]))).toBe(null); // a tool the clock did not let finish is not « نبدأ منها »
    const failed = kitOf(tools, [...miss(A), ...solid(B), ...cap(A, false, true)]);
    expect(failed[0]).toMatchObject({ band: BANDS.START, capsule: true, repaired: false });
    expect(gateOf(failed)).toBe(null); // done, not passed: he goes in, the tool stays flagged
    const passed = kitOf(tools, [...miss(A), ...solid(B), ...cap(A, true, true)]);
    expect(passed[0]).toMatchObject({ band: BANDS.CONSOLIDATE, capsule: true, repaired: true });
    expect(gateOf(kitOf(tools, [...miss(A), ...solid(B), ans(A, 1, true, { phase: 'capsule' })])).item).toBe(A); // one answer is not the capsule
    expect(mergeKit({}, 'qasim-adad-tabii', failed, 5).items[A]).toEqual({
      band: BANDS.START,
      repaired: false,
      capsule: true,
      at: 5,
    });
    const unclassified = tools.map((t) => ({ ...t, weight: null }));
    expect(gateOf(kitOf(unclassified, [...solid(A), ...miss(B)])).item).toBe(B); // not classified yet counts as core
  });

  it('gives the honesty star to a student who knows what he knows', () => {
    const a = (correct, unsure) => ({ correct, unsure });
    expect(honesty([a(true, false), a(true, false), a(false, true), a(true, false)])).toMatchObject({
      star: true,
      matched: 4,
    });
    expect(honesty([a(true, false), a(false, false), a(false, false), a(true, false)]).star).toBe(false); // sure and wrong twice
    expect(honesty([a(true, true), a(true, true), a(true, true)]).star).toBe(false); // doubting everything is not knowing
    expect(honesty([a(true, false), a(true, false)]).star).toBe(false); // too few answers to say
    expect([
      flowOf([]),
      flowOf([ans(A, 1, true), ans(A, 2, true)]),
      flowOf([ans(A, 1, true), ans(A, 2, false)]),
      flowOf(Array(6).fill(ans(A, 1, true))),
    ]).toEqual([0, 2, 0, 3]);
  });
});

describe('عُدّة الانطلاق — the sounds', () => {
  const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
  const namesIn = (src) =>
    [...src.matchAll(/(?:play|playRef\.current)\(([^)]*?)[,)]/g)].flatMap((m) =>
      [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1]),
    );

  it('every sound the launch plays exists in its palette, and every sound of the palette is played', async () => {
    const { SOUND_NAMES, GAP, SOUNDS } = await import('./sound');
    const used = new Set(['./LaunchKit.jsx', './gestures.jsx'].flatMap((f) => namesIn(read(f))));
    for (const name of used) expect(SOUND_NAMES, `« ${name} » is played but not in sound.js`).toContain(name);
    for (const name of SOUND_NAMES) expect([...used], `« ${name} » is in sound.js but never played`).toContain(name);
    for (const k of Object.keys(GAP)) expect(Object.keys(SOUNDS)).toContain(k);
  });

  it('a sound is short and quiet; the two boxes of a sort have each their note, whatever the card', async () => {
    const { LaunchSound, SOUNDS } = await import('./sound');
    const s = new LaunchSound();
    const made = [];
    let now = 0;
    s.wake = () => {
      s.ctx = {
        get currentTime() {
          return now;
        },
        state: 'running',
      };
    };
    s.tone = (o) => made.push({ kind: 'tone', ...o });
    s.noise = (o) => made.push({ kind: 'noise', ...o });
    for (const name of Object.keys(SOUNDS)) {
      made.length = 0;
      now += 5;
      expect(s.play(name, 2), name).toBe(true);
      expect(made.length, name).toBeGreaterThan(0);
      for (const o of made) {
        expect((o.t ?? 0) + (o.d ?? 0.2), name).toBeLessThanOrEqual(name === 'liftoff' ? 1.7 : 1.3);
        /* only the take-off lasts */ expect(o.g ?? 0.2, name).toBeLessThanOrEqual(0.3);
      }
    }
    const notes = (yes) => {
      made.length = 0;
      now += 5;
      s.play('drop', yes);
      return made
        .filter((o) => o.kind === 'tone')
        .map((o) => Math.round(o.f))
        .join();
    };
    expect(notes(1)).not.toBe(notes(0)); // a box is recognised by its note — which says nothing about right or wrong
  });

  it('the bed of music gains a layer with the flow, and is silent about the answers', async () => {
    const { LaunchSound } = await import('./sound');
    const count = (flow) =>
      Array.from({ length: 32 }, (_, beat) => LaunchSound.layers(flow, beat).length).reduce((a, b) => a + b, 0);
    expect(count(0)).toBeGreaterThan(0);
    expect(count(1)).toBeGreaterThan(count(0));
    expect(count(2)).toBeGreaterThan(count(1));
    expect(count(3)).toBeGreaterThan(count(2));
    for (let beat = 0; beat < 64; beat += 1)
      for (const o of LaunchSound.layers(3, beat)) expect(o.g).toBeLessThanOrEqual(0.06);
  });
});
