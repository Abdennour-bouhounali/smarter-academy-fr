import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Inquiry from '../../../../../../common/gameworld/divisorIsles/Inquiry';
import { ladderOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { bothOf, foldRuns } from '../../../../../../common/gameworld/divisorIsles/gcdModes';
import { FOLD_INQUIRY, IQLIDIS_BENCH, SIBAQ_BENCH, TARH_BENCH } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS } from './math';

// the screens expose their state to the walks on `window` (dev only): give the server render one
globalThis.window = globalThis.window ?? {};

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|null|\[object/);
/** A plain string (a label, a button) is drawn as it is: no formula in it. */
const plainText = (x) => {
  said(x);
  expect(x, x).not.toMatch(/\$|\\/);
};
/** The experiment of each key — where he meets it before its mirror (➖ has none: the islands are its experiment). */
const OF_KEY = {
  'khawarizmiyat-al-tarh': TARH_BENCH,
  'baqi-yabqi': FOLD_INQUIRY,
  iqlidis: IQLIDIS_BENCH,
  'aqall-khutuwat': SIBAQ_BENCH,
};
/**
 * The words no experiment says: the names of the keys and of what they state, and anything that would point at the
 * plank to make. Each experiment also keeps silent the words of ITS key's rule (the tiles of its forge).
 */
const NEVER = /PGCD|قاسم|مشترك|يحفظ|خوارزمي|إقليدس|غير معدوم|أسرع|اصنع|أطول لوح|آخر فرق|آخر باق|آخر سطر|الأخير/;
const OWN = {
  // the next pair, the stop, the plank of the subtractions
  'khawarizmiyat-al-tarh': /الأقصر والفرق|الأصغر والفرق|حتّى يصير|الفرق 0/,
  // the remainder as a gap that keeps something
  'baqi-yabqi': /الباقي|هوّة الباقي/,
  // the next pair, the stop, the plank of the divisions
  iqlidis: /الأصغر والباقي|القاسم والباقي|حتّى يصير|الباقي 0/,
  // what a division gathers, which notebook to choose
  'aqall-khutuwat': /حاصل|دائمًا|أختار/,
};

/** Every sentence a one-mode notebook can say on its own numbers (subtract or divide), row by row. */
function notebookLines(spec) {
  const T = spec.text;
  const { mode } = spec;
  const { a, b } = spec.rounds[0];
  const L = ladderOf(a, b, mode);
  const lines = [T.lead(a, b, mode), T.goal(a, b, mode), T.write, T.planks, T.countLabel, T.finish, T.next, T.done];
  for (const k of [1, 2, 3, 11]) lines.push(T.folded(k));
  for (let w = 0; w <= L.steps; w += 1) lines.push(T.countAsk({ a, b, mode, written: w }));
  for (const row of L.rows) {
    lines.push(T.ask({ a: row.a, b: row.b, mode, row: 1 }));
    for (const hit of [true, false])
      lines.push(T.seen({ ...row, mode, said: hit ? (row.next ?? [0, 0]) : [1, 1], hit: hit && Boolean(row.next) }));
  }
  for (const guessed of [L.steps, L.steps + 2]) {
    const end = { a, b, mode, steps: L.steps, guessed, gcd: L.gcd };
    lines.push(T.end(end), T.foundLine(end));
  }
  return lines;
}
function foldLines() {
  const T = FOLD_INQUIRY.text;
  const { a, b } = FOLD_INQUIRY.rounds[0];
  const f = foldRuns(a, b);
  const lines = [T.lead(a, b, 'fold'), T.goal(a, b, 'fold'), T.planks, T.fold, T.next, T.done];
  for (const k of [1, 2, 3, 11]) lines.push(T.folded(k));
  for (const run of f.runs) {
    lines.push(T.foldAsk({ a: run.a, b: run.b, rows: run.q }));
    lines.push(T.foldMiss({ ...run, said: { q: run.q - 1, r: run.r + run.b } }));
    lines.push(T.foldSeen({ rows: [run.from + 1, run.to + 1], a: run.a, b: run.b, q: run.q, r: run.r, said: run }));
  }
  const end = { a, b, gcd: f.gcd, steps: f.steps, lines: f.runs.length, folds: [] };
  lines.push(T.end(end), T.foundLine(end));
  return lines;
}
function bothLines() {
  const T = SIBAQ_BENCH.text;
  const { a, b } = SIBAQ_BENCH.rounds[0];
  const f = bothOf(a, b);
  const lines = [
    T.lead(a, b, 'both'),
    T.goal(a, b, 'both'),
    T.ladderLabel('subtract'),
    T.ladderLabel('divide'),
    T.ask({ a, b }),
    ...Object.values(T.shorter),
    T.byLabel,
    T.byUnit,
    T.run,
    T.next,
    T.done,
  ];
  for (const n of [1, 2, 3, 11, 31]) lines.push(T.countLine('subtract', n), T.countLine('divide', n));
  for (const s of [
    { shorter: 'divide', by: 29 },
    { shorter: 'subtract', by: 3 },
    { shorter: 'same', by: 0 },
  ]) {
    const r = { a, b, said: s, steps: f.steps, shorter: f.shorter, by: f.by, gcd: f.gcd };
    lines.push(T.end(r), T.foundLine(r));
  }
  return lines;
}
const LINES = {
  'khawarizmiyat-al-tarh': notebookLines(TARH_BENCH),
  'baqi-yabqi': foldLines(),
  iqlidis: notebookLines(IQLIDIS_BENCH),
  'aqall-khutuwat': bothLines(),
};

describe('the experiments of « البحث عن القاسم المشترك الأكبر » — the ladder, one mode per key', () => {
  it('three benches on the convoys’ gaps and the fold in 🧮’s mirror; no two keys share a (kind, mode)', () => {
    expect(TARH_BENCH).toMatchObject({ kind: 'ladder', mode: 'subtract', rounds: [{ a: 259, b: 185 }] });
    expect(IQLIDIS_BENCH).toMatchObject({ kind: 'ladder', mode: 'divide', rounds: [{ a: 1833, b: 546 }] });
    expect(SIBAQ_BENCH).toMatchObject({ kind: 'ladder', mode: 'both', rounds: [{ a: 1003, b: 34 }] });
    expect(FOLD_INQUIRY).toMatchObject({ kind: 'ladder', mode: 'fold', rounds: [{ a: 962, b: 296 }] });
    expect([TARH_BENCH, IQLIDIS_BENCH, SIBAQ_BENCH].map((s) => s.rounds)).toEqual(
      ['tarh', 'iqlidis', 'sibaq'].map((id) => [{ a: NUMBERS[id].gaps[0], b: NUMBERS[id].gaps[1] }]),
    );
    expect(FOLD_INQUIRY.rounds).toEqual([{ a: NUMBERS.fold.gaps[0], b: NUMBERS.fold.gaps[1] }]);
    const pairs = Object.values(OF_KEY).map((s) => `${s.kind}/${s.mode}`);
    expect(new Set(pairs).size).toBe(pairs.length);
    // the only experiment a forge keeps is 🧮's
    expect(Object.values(FORGES).filter((F) => F.inquiry)).toEqual([FORGES['baqi-yabqi']]);
  });

  it('the numbers: 5 rows of subtractions, 4 of divisions, the fold 3 rows into one, 31 rows against 2', () => {
    expect(ladderOf(259, 185, 'subtract').steps).toBe(5);
    expect(ladderOf(1833, 546, 'divide').steps).toBe(4);
    const f = foldRuns(962, 296);
    expect(f.runs.map((r) => [r.a, r.b, r.q, r.r])).toEqual([
      [962, 296, 3, 74],
      [296, 74, 4, 0],
    ]);
    expect(bothOf(1003, 34)).toMatchObject({ steps: { subtract: 31, divide: 2 }, shorter: 'divide', by: 29 });
  });

  it('a BENCH shows the rows only: no column of the planks that fill both, no value lit gold — the fold keeps its column', () => {
    expect(TARH_BENCH.plain).toBe(true);
    expect(IQLIDIS_BENCH.plain).toBe(true);
    for (const spec of [TARH_BENCH, IQLIDIS_BENCH]) {
      const html = renderToString(createElement(Inquiry, { spec, onDone: () => {} }));
      expect(html).toContain('data-iq-plain');
      expect(html).toContain('data-iq-row="1"');
      expect(html).not.toContain('data-iq-ticks');
      expect(html).not.toContain(spec.text.planks);
      // finished (kept on the bench): every row written, nothing lit
      const steps = ladderOf(spec.rounds[0].a, spec.rounds[0].b, spec.mode).steps;
      const from = { ri: 0, written: steps, stage: 'seen', guesses: [], last: null, guessed: steps, found: [] };
      const done = renderToString(createElement(Inquiry, { spec: { ...spec, from }, onDone: () => {} }));
      expect(done).toContain(`data-iq-row="${steps}"`);
      expect(done).not.toContain('fbbf24');
      expect(done).not.toContain('data-iq-ticks');
    }
    // the fold, in the mirror: its column is the fact the rule is written from
    const fold = renderToString(createElement(Inquiry, { spec: FOLD_INQUIRY, onDone: () => {} }));
    expect(fold).toContain(FOLD_INQUIRY.text.planks);
  });

  for (const [key, lines] of Object.entries(LINES))
    it(`${key}: every sentence of its experiment is a FACT — no word of a key, nor of its own rule`, () => {
      expect(lines.length).toBeGreaterThan(10);
      for (const line of lines) {
        said(line);
        expect(line, line).not.toMatch(NEVER);
        expect(line, line).not.toMatch(OWN[key]);
      }
    });

  it('the plain strings (labels, buttons, the goal) carry no formula; the counts agree in Arabic', () => {
    for (const spec of [TARH_BENCH, IQLIDIS_BENCH]) {
      const T = spec.text;
      const { a, b } = spec.rounds[0];
      for (const x of [T.goal(a, b, spec.mode), T.planks, T.write, T.finish, T.countLabel, T.folded(3), T.next, T.done])
        plainText(x);
    }
    const B = SIBAQ_BENCH.text;
    for (const x of [B.goal(), B.ladderLabel('subtract'), B.byLabel, B.byUnit, B.run, ...Object.values(B.shorter)])
      plainText(x);
    for (const x of [FOLD_INQUIRY.text.goal(), FOLD_INQUIRY.text.planks, FOLD_INQUIRY.text.fold]) plainText(x);
    // the counts, with their agreement
    const T = TARH_BENCH.text;
    expect(T.end({ a: 259, b: 185, steps: 5, guessed: 5 })).toBe('كتب الدفتر 5 أسطر للهوّتين 259 و 185، كما قلتَ.');
    expect(T.end({ a: 259, b: 185, steps: 5, guessed: 7 })).toBe('كتب الدفتر 5 أسطر للهوّتين 259 و 185، وقلتَ 7.');
    expect(T.countAsk({ a: 259, b: 185, written: 2 })).toContain('كتب الدفتر سطرين.');
    expect(T.countAsk({ a: 259, b: 185, written: 1 })).toContain('كتب الدفتر سطرًا واحدًا.');
    expect(T.folded(1)).toBe('سطر واحد مطويّ');
    expect(T.folded(2)).toBe('سطران مطويّان');
    expect(T.folded(11)).toBe('11 سطرًا مطويًّا');
    expect(
      B.end({ steps: { subtract: 31, divide: 2 }, shorter: 'divide', by: 29, said: { shorter: 'divide', by: 29 } }),
    ).toBe('كتب دفتر الطرح 31 سطرًا، ودفتر القسمة سطرين، كما قلتَ.');
    expect(B.countLine('divide', 2)).toBe('سطران');
    const F = FOLD_INQUIRY.text;
    expect(F.foldAsk({ a: 962, b: 296, rows: 3 })).toMatch(/^3 أسطر تطرح 296 من 962/);
    expect(F.foldAsk({ a: 90, b: 40, rows: 2 })).toMatch(/^سطران يطرحان 40 من 90/);
    expect(F.end({ steps: 7, lines: 2 })).toBe('دفتر الطرح: 7 أسطر. بعد الطيّ: سطران.');
    expect(F.foundLine({ a: 962, b: 296, steps: 7, lines: 2 })).toBe('962 و 296: 7 أسطر صارت سطرين');
    // a row written: the row, the pair that follows, and what he wrote
    const [first] = ladderOf(259, 185, 'subtract').rows;
    expect(T.seen({ ...first, mode: 'subtract', said: [185, 74], hit: true })).toBe(
      '$259 - 185 = 74$، والسطر التالي $(185 ; 74)$، كما كتبتَ.',
    );
    const [div] = ladderOf(1833, 546, 'divide').rows;
    expect(IQLIDIS_BENCH.text.seen({ ...div, mode: 'divide', said: [546, 3], hit: false })).toBe(
      '$1833 = 546 \\times 3 + 195$، والسطر التالي $(546 ; 195)$، وكتبتَ $(546 ; 3)$.',
    );
  });
});
