import { describe, it, expect } from 'vitest';
import extraction from '../../../../../../../../../../docs/sources/1am/unit1/extraction.json';
import { ACTIVITY, LAB, KNOWLEDGE, RANKS, PREP_ITEMS, PREP_PLATFORM_ITEMS } from './textbook';
import { EX } from './exercises';

/**
 * « كتابة الأعداد الطبيعية ودلالة الأرقام » — chaque clé est relue contre les réponses CALCULÉES de l'extraction
 * (build-extraction.py, `words()` compris) ou recalculée ici par des entiers.
 */
const el = (id) => extraction.elements.find((e) => e.id === id);
const choice = (rows) => rows.map((r) => r.options[r.correct]);
const count = (n, k) => Math.floor(n / 10 ** k);
const plain = (s) => s.replace(/\\,/g, ' ').replace(/\$/g, '').replace(/\s+/g, ' ').trim();
const valueOfCounts = (c) => Object.entries(c).reduce((a, [k, v]) => a + v * 10 ** Number(k), 0);

describe('« كتابة الأعداد الطبيعية » — les clés du manuel', () => {
  it('نشاط 1 : 0, 1, 3, 8 → 8310 / 1038 ; 999 → 1000 / 998', () => {
    const a = el('act-1').answer;
    expect([ACTIVITY.answers.largest, ACTIVITY.answers.smallest]).toEqual([a.largest, a.smallest]);
    expect([ACTIVITY.answers.next, ACTIVITY.answers.previous]).toEqual([a.next.digits, a.previous.digits]);
    // posé en application au module 4 (EX['act-1'])
    const k = choice(EX['act-1'].question.rows);
    expect([Number(k[0]), Number(k[1]), parseInt(k[3], 10), parseInt(k[4], 10)]).toEqual([a.largest, a.smallest, a.next.digits, a.previous.digits]);
    expect(k[2]).toContain('20 في 25');
  });

  it('les nombres du labo', () => {
    // module 1 : les deux 7 de 2577 (unités et dizaines), le 0 des centaines de 2017
    expect([LAB.packValue % 10, count(LAB.packValue, 1) % 10]).toEqual([7, 7]);
    expect(count(LAB.unpack.n, 2) % 10).toBe(0);
    expect(valueOfCounts(LAB.pack)).toBe(LAB.packValue);
    expect(count(LAB.unpack.n, LAB.unpack.rank)).toBe(LAB.unpack.count);
    expect([count(LAB.money.n, LAB.money.rank), LAB.money.n % 100]).toEqual([LAB.money.notes, LAB.money.left]);
    expect(LAB.dictation).toEqual([7065, 4908732]);
  });

  it('معارف 1 et 4 : les lectures et les rangs', () => {
    const k = el('know-1').answer;
    expect(KNOWLEDGE.readingExamples.map((e) => e.words)).toEqual([k['45671'].words, k['4908732'].words]);
    expect(KNOWLEDGE.readingExamples.map((e) => plain(e.spaced))).toEqual([k['45671'].spaced, k['4908732'].spaced]);
    expect([...RANKS.integerDigits.filter((d) => d != null), ...RANKS.decimalDigits].join('')).toBe('6392459');
  });

  it('exercice 1, 2, 12 ①, أقوّم 1', () => {
    const ex1 = el('ex-1').answer;
    expect(choice(EX['ex-1'].question.rows)).toEqual(ex1.map((r) => `${r.digit} ، ${r.count}`));
    expect(EX['ex-2'].question.expected).toBe(el('ex-2').answer.notes);
    expect(EX['ex-12'].question.expected).toBe(Number(el('ex-12').answer[0]));
    const s1 = el('self-1').answer;
    expect(choice(EX['self-1'].question.rows)).toEqual([String(s1.a), String(s1.b)]);
  });

  it('exercice 3 : classes et lecture', () => {
    const ans = el('ex-3').answer;
    EX['ex-3'].question.rows.forEach((r, i) => {
      const [spaced, words] = plain(r.options[r.correct]).split(' : ');
      expect(Number(r.label)).toBe(ans[i].n);
      expect(spaced).toBe(ans[i].spaced);
      expect(words).toBe(ans[i].words);
    });
  });

  it('أتعمّق 1, 2, 3, 5', () => {
    const d1 = el('deep-1').answer;
    expect(choice(EX['deep-1'].question.rows).map(plain)).toEqual([d1.smallestSpaced, d1.largestSpaced]);
    const d2 = el('deep-2').answer;
    const rows = choice(EX['deep-2'].question.rows).map(plain);
    expect(rows[0]).toBe(d2.million);
    expect(rows[1]).toBe(d2.billion);
    expect(rows[2]).toBe(d2['9999999999']);
    expect(rows[3]).toBe(`${d2.next.digits} : ${d2.next.words}`);
    expect(choice(EX['deep-2-planets'].question.rows)).toEqual([d2.words['الأرض'], d2.words['زحل'], d2.words['نبتون']]);
    const d3 = el('deep-3').answer;
    expect(choice(EX['deep-3'].question.rows).map(Number)).toEqual([d3['1'], d3['2']]);
    const d5 = el('deep-5').answer;
    expect(choice(EX['deep-5'].question.rows)).toEqual([String(d5.XVIII), String(d5.MMDCCXVI), d5['235']]);
  });

  it('« أستعدّ » : chaque affirmation du manuel suit son item p. 8', () => {
    const prep = el('prep').items;
    for (const it of PREP_ITEMS) expect(prep.some((p) => p.n === it.n)).toBe(true);
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual([false, true, false, true, true]);
    expect(count(2017, 1)).toBe(201);
    expect(PREP_PLATFORM_ITEMS).toHaveLength(1);
  });
});

describe('the إختبار أولي (module 9) keys', () => {
  it('every literal key is recomputed', async () => {
    const raw = (await import('../modules/Module09Itqan.jsx?raw')).default;
    const correctOf = (id) => {
      const block = raw.slice(raw.indexOf(`id: '${id}'`));
      const opts = block.slice(block.indexOf('options: [') + 10, block.indexOf('], correct'));
      const list = opts.match(/'(?:[^'\\]|\\.)*'/g).map((s) => s.slice(1, -1).replace(/\\\\/g, '\\'));
      return plain(list[Number(block.match(/correct: (\d)/)[1])]);
    };
    expect(correctOf('E1')).toBe('ثلاثون مليونا وأربعمائة وخمسة آلاف واثنا عشر');
    expect(Number(correctOf('E2').replace(/\s/g, ''))).toBe(6 * 1e6 + 8 * 1000 + 40);
    expect(Number(correctOf('E3'))).toBe(Number('52318.47'.split('.')[1][1]));
    expect(Number(correctOf('E4'))).toBe(count(52318, 1));
    expect(Number(correctOf('E5').replace(/\s/g, ''))).toBe(7 * 10000 + 4 * 100 + 9);
  });
});
