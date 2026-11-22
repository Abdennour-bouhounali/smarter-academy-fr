import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildOrder } from '../../../../scripts/generate-lab-order.mjs';
import ORDER from './lessonOrder.generated.json';
import { placeOf, GRADES } from './order';
import { TOOLS, toolsFor, hasLab, clampFor } from './registry';
import {
  rowsLayout,
  jumpsOf,
  sentences,
  digitRules,
  rollDigit,
  euclidSquares,
  euclidLines,
  divisorPairs,
  divisorsOf,
  gcd,
  plankRows,
  bracketOf,
  twoLists,
  pairLists,
  probeOf,
  stripOf,
  courtOf,
  courtSettled,
  pieceOf,
  closerPiece,
  decText,
  hundredths,
  QUESTS,
  observe,
  luckyPair,
} from './logic';

describe('مختبري — the order of the lessons', () => {
  it('is the catalogue order of the four grades (run `npm run generate:lab-order` when this fails)', () => {
    expect(ORDER).toEqual(buildOrder());
    expect(Object.keys(ORDER).filter((k) => !k.startsWith('$'))).toEqual(GRADES);
  });
});

describe('مختبري — the instruments a lesson may show', () => {
  it('tags every instrument with the lesson that introduces it (none before the French lessons), a module and quests', () => {
    for (const t of TOOLS) {
      // re-keyed on the French catalogue in a later stage: until then an instrument is listed nowhere
      expect(t.lesson, t.id).toBeNull();
      expect(typeof t.load).toBe('function');
      expect(QUESTS[t.id].length).toBeGreaterThanOrEqual(2);
      expect(t.range.a[0]).toBeLessThan(t.range.a[1]);
    }
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    expect(toolsFor('lecon-inconnue')).toEqual({ mine: [], cabinet: [], all: [] });
  });

  it('opened BEFORE the lesson (« عُدّة الانطلاق », `earlierOnly`): only the instruments of the lessons before it', () => {
    for (const g of GRADES)
      for (const code of ORDER[g])
        for (const t of toolsFor(code, { earlierOnly: true }).all)
          expect(t.lesson, `${t.id} in ${code}`).not.toBe(code);
  });

  it('never shows an instrument of the future, for ANY lesson of the cycle', () => {
    for (const g of GRADES)
      for (const code of ORDER[g]) {
        const lab = toolsFor(code);
        for (const t of lab.all)
          expect(placeOf(t.lesson).rank, `${t.id} in ${code}`).toBeLessThanOrEqual(placeOf(code).rank);
        expect(lab.cabinet.flatMap((x) => x.lessons).every((l) => l.code !== code)).toBe(true);
      }
    expect(hasLab('lecon-inconnue')).toBe(false);
    expect(toolsFor('nope')).toEqual({ mine: [], cabinet: [], all: [] });
  });

  it('brings the shared numbers inside the ranges of the instrument', () => {
    const rows = TOOLS.find((t) => t.id === 'rows');
    expect(clampFor(rows, 756, 36)).toEqual({ a: 144, b: 24 });
    expect(
      clampFor(
        TOOLS.find((t) => t.id === 'paper'),
        756,
        1,
      ),
    ).toEqual({ a: 756, b: 2 });
  });
});

describe('مختبري — the mathematics the instruments draw', () => {
  it('lays a counters in rows of b: q full rows, r counters left', () => {
    for (let a = 1; a <= 144; a += 5)
      for (let b = 1; b <= 24; b += 1) {
        const L = rowsLayout(a, b);
        expect(L.cells.length).toBe(a);
        expect(L.cells.filter((c) => c.rest).length).toBe(a % b);
        expect(L.q * b + L.r).toBe(a);
        expect(Math.max(...L.cells.map((c) => c.col))).toBeLessThan(b);
      }
  });
  it('jumps of b from 0: lands on the flag exactly when b divides a', () => {
    expect(jumpsOf(42, 6)).toEqual({ q: 7, r: 0, landings: [6, 12, 18, 24, 30, 36, 42], hit: true, over: null });
    expect(jumpsOf(42, 5).landings.at(-1)).toBe(40);
    expect(jumpsOf(42, 5).over).toBe(45);
    expect(jumpsOf(3, 5).landings).toEqual([]);
  });
  it('the four sentences are true together or false together, with a proof that is true', () => {
    expect(sentences(42, 6).ok).toBe(true);
    expect(sentences(42, 6).proof).toBe('$42 = 6 \\times 7$');
    expect(sentences(42, 5).ok).toBe(false);
    expect(sentences(42, 5).proof).toContain('42 = 5 \\times 8 + 2');
    expect(sentences(6, 42).proof).toContain('6 < 42');
    expect(sentences(42, 6).list).toHaveLength(4);
  });
  it('reads the rules of divisibility on the digits, never against the truth', () => {
    for (let n = 0; n <= 9999; n += 7)
      for (const r of digitRules(n)) expect(r.ok, `${n} by ${r.by}`).toBe(n % r.by === 0);
    expect(digitRules(756).find((r) => r.by === 9).reads).toBe('مجموع الأرقام 18: مضاعف للعدد 9');
    expect(digitRules(756).find((r) => r.by === 4).digits).toEqual([1, 2]);
    expect(rollDigit(756, 0, 1, 3)).toBe(856);
    expect(rollDigit(756, 2, -1, 3)).toBe(755);
    expect(rollDigit(900, 0, 1, 3)).toBe(0);
    expect(rollDigit(7, 0, -1, 2)).toBe(97);
  });
  it('Euclid by squares: the squares tile the rectangle exactly and the last side is the PGCD', () => {
    for (let a = 1; a <= 60; a += 3)
      for (let b = 1; b <= 60; b += 4) {
        const e = euclidSquares(a, b);
        expect(
          e.squares.reduce((t, s) => t + s.side * s.side, 0),
          `${a}×${b}`,
        ).toBe(a * b);
        expect(e.pgcd).toBe(gcd(a, b));
        const lines = euclidLines(a, b);
        expect(lines.at(-1).r).toBe(0);
        expect(lines.at(-1).b).toBe(gcd(a, b));
        for (const l of lines) expect(l.b * l.q + l.r).toBe(l.a);
      }
    expect(euclidSquares(48, 18).squares.map((s) => s.side)).toEqual([18, 18, 12, 6, 6]);
  });
  it('lays one plank along the six lengths: what it fills is computed, and a plank that fills both numbers fills them all', () => {
    const bad = [];
    for (let a = 1; a <= 60; a += 1)
      for (let b = 1; b <= 60; b += 1)
        for (let d = 1; d <= 60; d += 1) {
          const rows = plankRows(a, b, d);
          const [big, small] = [Math.max(a, b), Math.min(a, b)];
          const want = [a, b, a + b, big - small, big % small, 3 * a];
          const ok =
            rows.map((r) => r.id).join() === 'a,b,sum,diff,rest,triple' &&
            rows.every(
              (r, i) => r.n === want[i] && r.planks * d + r.left === r.n && r.left < d && r.fits === (r.n % d === 0),
            ) &&
            (!(rows[0].fits && rows[1].fits) || rows.every((r) => r.fits)) &&
            (!rows[0].fits || rows[5].fits);
          if (!ok) bad.push(`${a} ${b} ${d}`);
        }
    expect(bad).toEqual([]);
    expect(plankRows(22, 20, 7).map((r) => r.fits)).toEqual([false, false, true, false, false, false]); // the sum alone
    expect(plankRows(35, 21, 7)[4].label).toBe('35 = 21 × 1 + 14');
    expect(plankRows(21, 35, 7)[3].label).toBe('35 − 21 = 14');
  });
  it('lays n planks of b along a: what is left or what passes, the full planks and the planks needed — for every pair', () => {
    const bad = [];
    for (let a = 1; a <= 200; a += 1)
      for (let b = 1; b <= 60; b += 1) {
        const q = Math.floor(a / b);
        for (let n = -2; n <= q + 3; n += 1) {
          const x = bracketOf(a, b, n);
          const k = Math.max(0, Math.min(q + 1, n));
          const ok =
            x.q === q &&
            x.r === a - q * b &&
            x.top === q + 1 &&
            x.n === k &&
            x.laid === k * b &&
            (k * b <= a ? x.left === a - k * b && x.over === 0 : x.left === null && x.over === k * b - a) &&
            x.exact === (k * b === a) &&
            // the full planks do not pass a, one more does; the planks needed cover a, one fewer does not
            q * b <= a &&
            (q + 1) * b > a &&
            x.need * b >= a &&
            (x.need - 1) * b < a &&
            (x.r === 0 ? x.need === q : x.need === q + 1);
          if (!ok) bad.push(`${a} ${b} ${n}`);
        }
      }
    expect(bad).toEqual([]);
    expect(bracketOf(438, 16, 27)).toMatchObject({ q: 27, r: 6, left: 6, over: 0, need: 28 });
    expect(bracketOf(438, 16, 28)).toMatchObject({ left: null, over: 10 });
    expect(bracketOf(438, 16, 99).n).toBe(28); // never more than one plank past the full ones
    expect(bracketOf(9, 14, 5)).toMatchObject({ q: 0, top: 1, n: 1, over: 5, need: 1 }); // a shorter than one plank
    expect(bracketOf(9999, 2, 4999).left).toBe(1);
  });
  it('the two lists: written by pairs up to the last number to try, then what is in both and the greatest', () => {
    const open = twoLists(40, 56, 0);
    expect([open.A.all, open.B.all, open.done, open.step]).toEqual([[], [], false, null]);
    expect(open.steps).toBe(7); // 7 × 7 = 49 ≤ 56; 8 × 8 = 64 > 56
    const four = twoLists(40, 56, 4);
    expect(four.A.smalls).toEqual([1, 2, 4]);
    expect(four.A.partners).toEqual([40, 20, 10]);
    expect(four.A.all).toEqual([1, 2, 4, 10, 20, 40]);
    expect(four.step).toEqual({ d: 4, a: { d: 4, q: 10, r: 0 }, b: { d: 4, q: 14, r: 0 } });
    expect(four.common).toEqual([]); // nothing is read before both lists are closed
    const six = twoLists(40, 56, 6);
    expect(six.A.done).toBe(true); // 7 × 7 > 40
    expect(six.B.done).toBe(false);
    const seven = twoLists(40, 56, 7);
    expect(seven.step).toEqual({ d: 7, a: null, b: { d: 7, q: 8, r: 0 } }); // 40 is no longer tried
    expect(seven.done).toBe(true);
    expect(seven.A.all).toEqual([1, 2, 4, 5, 8, 10, 20, 40]);
    expect(seven.B.all).toEqual([1, 2, 4, 7, 8, 14, 28, 56]);
    expect([seven.common, seven.g]).toEqual([[1, 2, 4, 8], 8]);
    // a square root is its own partner: written once
    expect(twoLists(36, 36, 6).A.all).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(twoLists(1, 1, 1)).toMatchObject({ done: true, common: [1], g: 1 });
    // for every pair the instrument can show: closed lists ARE the divisors, the greatest in both IS the PGCD, and the
    // lists close at the last number whose square does not pass the greater
    for (let a = 1; a <= 120; a += 1)
      for (let b = 1; b <= 120; b += 7) {
        const L = twoLists(a, b, Math.floor(Math.sqrt(Math.max(a, b))));
        expect(L.done).toBe(true);
        expect(L.A.all).toEqual(divisorsOf(a));
        expect(L.B.all).toEqual(divisorsOf(b));
        expect(L.g).toBe(gcd(a, b));
        expect(L.A.all.length).toBeLessThanOrEqual(16); // 16 slots in the drawing
        expect(twoLists(a, b, L.steps - 1).done).toBe(false); // one number fewer: a list is still open
      }
  });

  it('« مِجهر العددين »: the lists, what is in both, one number tried on both — for every pair it can show, and 14 divisions at most', () => {
    let most = 0;
    for (let a = 1; a <= 999; a += 13)
      for (let b = 1; b <= 999; b += 17) {
        const L = pairLists(a, b);
        expect(L.A).toEqual(divisorsOf(a));
        expect(L.common.at(-1)).toBe(gcd(a, b));
        expect(L.common.every((d) => a % d === 0 && b % d === 0)).toBe(true);
        expect(L.A.length).toBeLessThanOrEqual(32); // two lines of 16 slots
        for (const d of [2, 3, 5, 7, 10, 11]) {
          const P = probeOf(a, b, d);
          expect(P.a.q * d + P.a.r).toBe(a);
          expect(P.b.q * d + P.b.r).toBe(b);
          const want = a % d === 0 && b % d === 0 ? 'both' : a % d === 0 ? 'a' : b % d === 0 ? 'b' : 'none';
          expect(P.verdict).toBe(want);
        }
      }
    for (let a = 1; a <= 999; a += 1)
      for (let b = 1; b <= a; b += 1 + (a % 7)) most = Math.max(most, euclidLines(a, b).length);
    expect(euclidLines(987, 610)).toHaveLength(14); // the longest chain up to 999: the two columns of 7 lines hold it
    expect(most).toBeLessThanOrEqual(14);
    expect(divisorsOf(840)).toHaveLength(32);
  });

  it('« شريط الكسر »: the two divisions, where the light ends, what is left, and the fraction in pieces only when k divides both', () => {
    for (let a = 1; a <= 999; a += 11)
      for (let b = 1; b <= 999; b += 13)
        for (const k of [2, 3, 4, 5, 7, 12, 25]) {
          const S = stripOf(a, b, k);
          expect(S.lit.q * k + S.lit.r).toBe(a);
          expect(S.whole.q * k + S.whole.r).toBe(b);
          expect(S.left).toBe(b % k);
          expect(S.pieces).toBe(Math.ceil(Math.max(a, b) / k));
          if (a % k === 0) expect(S.cut).toBe(null);
          else {
            // the light ends strictly inside the piece the drawing outlines
            expect(S.cut.from).toBeLessThan(a);
            expect(S.cut.to).toBeGreaterThan(a);
            expect(S.cut.to - S.cut.from).toBe(k);
            expect(S.cut.from % k).toBe(0);
          }
          if (a % k === 0 && b % k === 0) {
            expect(S.verdict).toBe('both');
            expect(S.rewrite[0] * b).toBe(S.rewrite[1] * a); // the same fraction
            expect(S.rewrite).toEqual([a / k, b / k]);
          } else expect(S.rewrite).toBe(null);
        }
    expect(stripOf(60, 96, 8)).toMatchObject({ verdict: 'b', cut: { from: 56, to: 64 }, left: 0, rewrite: null });
    expect(stripOf(60, 96, 12)).toMatchObject({ verdict: 'both', cut: null, left: 0, rewrite: [5, 8] });
    expect(stripOf(60, 96, 7)).toMatchObject({ verdict: 'none', left: 5 });
  });

  it('« ساحة العدد »: the greatest whole square, what is left and the side to 0,01, in integers — for every court it can show', () => {
    for (let a = 1; a <= 400; a += 1) {
      // the greatest whole side, found apart by trying every side
      let k = 0;
      while ((k + 1) * (k + 1) <= a) k += 1;
      for (const s of [1, k, k + 1, 21]) {
        const C = courtOf(a, s);
        expect([C.k, C.left, C.perfect]).toEqual([k, a - k * k, k * k === a]);
        expect(C.inside + C.out).toBe(a);
        expect(C.inside + C.holes).toBe(s * s);
        expect(C.verdict).toBe(s * s === a ? 'fits' : s * s < a ? 'out' : 'holes');
      }
      const { lo, hi, perfect } = courtOf(a, 1);
      // to 0,01 from below and from above, judged by squaring the hundredths (no float, no root)
      expect(lo * lo).toBeLessThanOrEqual(a * 10000);
      expect((lo + 1) * (lo + 1)).toBeGreaterThan(a * 10000);
      if (perfect) expect([lo, hi]).toEqual([100 * k, 100 * k]);
      else {
        expect(hi).toBe(lo + 1);
        expect(hi * hi).toBeGreaterThan(a * 10000);
        expect(Math.floor(lo / 100)).toBe(k);
      }
      // settled only by trying k, and k + 1 when the court is not a perfect square
      expect(courtSettled(a, [k])).toBe(perfect);
      expect(courtSettled(a, [k, k + 1])).toBe(true);
      expect(courtSettled(a, [k + 1])).toBe(false);
    }
    expect([hundredths(547), hundredths(550), hundredths(1998)]).toEqual(['5,47', '5,50', '19,98']);
    expect([decText(299209, 4), decText(302500, 4), decText(90000, 4)]).toEqual(['29,9209', '30,25', '9']);
    expect(courtOf(30, 5)).toMatchObject({ k: 5, left: 5, lo: 547, hi: 548, out: 5 });
  });

  it('« ساحة العدد » is drawn in code and keeps the measuring word of the world', () => {
    const tile = TOOLS.find((t) => t.id === 'court');
    expect(tile.needs).toBe('a');
    expect(tile.range.a).toEqual([1, 400]); // every whole square up to 20 × 20
    // drawn in code, its Arabic in DOM text, the measuring word of the world kept (« المقياس », never « القضيب »)
    const src = readFileSync(new URL('./tools/NumberCourt.jsx', import.meta.url), 'utf8');
    expect(src).not.toMatch(/قضيب|<img|\.png|\.jpg|خطأ|خاطئ|غلط/);
    for (const q of QUESTS.court) expect(q.text).not.toMatch(/قضيب|خطأ|خاطئ|غلط/);
  });

  it('« منصّة الكسر »: the pieces of the platform and of the court counted in integers, and the nearest rod kept', () => {
    for (let a = 1; a <= 50; a += 1)
      for (let q = 1; q <= 12; q += 1) {
        const { pMax } = pieceOf(a, q, 1);
        // one tile beyond the side of the court: the rod (pMax − q − 1)/q is not longer than the side, pMax/q is
        expect((pMax - q - 1) ** 2).toBeLessThanOrEqual(a * q * q);
        expect(pMax ** 2).toBeGreaterThan(a * q * q);
        let fits = 0;
        for (let p = 1; p <= pMax; p += 1) {
          const P = pieceOf(a, q, p);
          expect([P.court, P.plat, P.diff, P.far]).toEqual([
            a * q * q,
            p * p,
            p * p - a * q * q,
            Math.abs(p * p - a * q * q),
          ]);
          expect(P.verdict).toBe(p * p === a * q * q ? 'fits' : p * p < a * q * q ? 'band' : 'jam');
          if (P.verdict === 'fits') fits += 1;
        }
        // a rod of p/q covers the court exactly for a perfect square only — and then once, at p = k × q
        const k = Math.round(Math.sqrt(a));
        expect(fits).toBe(k * k === a ? 1 : 0);
      }
    // 7/5 on 2: 49 against 50; 17/12: 289 against 288 — one piece apart, never zero
    expect(pieceOf(2, 5, 7)).toMatchObject({ court: 50, plat: 49, far: 1, verdict: 'band' });
    expect(pieceOf(2, 12, 17)).toMatchObject({ court: 288, plat: 289, far: 1, verdict: 'jam' });
    // the nearest rod, by its difference in TILES (far ÷ q²): 1/144 is nearer than 1/25, 1/25 nearer than 2/49
    expect(closerPiece({ q: 12, far: 1 }, { q: 5, far: 1 })).toBe(true);
    expect(closerPiece({ q: 5, far: 1 }, { q: 12, far: 1 })).toBe(false);
    expect(closerPiece({ q: 5, far: 1 }, { q: 7, far: 2 })).toBe(true);
    expect(closerPiece({ q: 5, far: 1 }, null)).toBe(true);
    expect(closerPiece({ q: 3, far: 1 }, { q: 3, far: 1 })).toBe(false); // the same distance keeps the first
  });

  it('« منصّة الكسر » names no key of the lesson it serves', () => {
    const tile = TOOLS.find((t) => t.id === 'piece');
    expect(tile.needs).toBe('ab');
    expect(tile.range).toEqual({ a: [1, 50], b: [1, 12] });
    // the words of the lesson's three keys never stand on the tile, its quests or the instrument's own strings — nor a
    // root, nor the refused name of the rod, nor a verdict of error
    const src = readFileSync(new URL('./tools/FractionPlatform.jsx', import.meta.url), 'utf8');
    const said = [tile.name, tile.hint, ...QUESTS.piece.map((q) => q.text), src].join(' ');
    expect(said).not.toMatch(/ناطق|مدو|مقرّب|مقرب|جذر|√|\\sqrt|قضيب|خطأ|خاطئ|غلط/); // Math.sqrt draws, never writes
    expect(src).not.toMatch(/<img|\.png|\.jpg/);
  });

  it('pairs every divisor with its partner', () => {
    expect(divisorPairs(36)).toEqual([
      [1, 36],
      [2, 18],
      [3, 12],
      [4, 9],
      [6, 6],
    ]);
    expect(divisorsOf(13)).toEqual([1, 13]);
  });
});

describe('مختبري — « جرّب »', () => {
  it('ticks a quest only when the student has MADE the thing', () => {
    const seen = new Set();
    expect(observe('rows', { a: 42, b: 5 }, seen)).toEqual([]);
    expect(observe('rows', { a: 42, b: 6 }, seen)).toEqual(['zero']);
    expect(observe('rows', { a: 42, b: 6 }, seen)).toEqual([]); // once
    expect(observe('rows', { a: 42, b: 7 }, seen)).toEqual(['two']);
    expect(observe('rows', { a: 41, b: 6 }, seen)).toEqual(['max']);
    expect(observe('rows', { a: 42, b: 1 }, new Set())).toEqual([]); // rows of one counter prove nothing
    expect(observe('jumps', { a: 41, b: 5 }, new Set())).toEqual(['miss1']); // lands on 40, one step before the flag
    expect(observe('jumps', { a: 44, b: 5 }, new Set())).toEqual([]);
    expect(observe('sentences', { a: 12, b: 12, swapped: true }, new Set())).toEqual(['swap']);
    expect(observe('divisors', { a: 36, found: [1, 2, 3, 4, 6, 9, 12, 18, 36] }, new Set())).toEqual(['all', 'odd']);
    expect(observe('divisors', { a: 36, found: [1, 2, 3] }, new Set())).toEqual([]);
    expect(observe('euclid', { a: 48, b: 18, cut: 5 }, new Set())).toEqual(['one', 'three']);
    expect(observe('euclid', { a: 48, b: 18, cut: 4 }, new Set())).toEqual([]);
    expect(observe('rules', { a: 180 }, new Set())).toEqual(['three', 'nine', 'all']);
    expect(observe('paper', { a: 612, b: 6, done: true }, new Set())).toEqual(['end', 'zero', 'exact']);
    expect(observe('common', { a: 18, b: 12 }, new Set())).toEqual(['six']);
    expect(observe('lists', { a: 60, b: 90 }, new Set())).toEqual([]); // the lists were not written: nothing reported
    expect(observe('lists', { a: 60, b: 90, done: false }, new Set())).toEqual([]);
    expect(observe('lists', { a: 60, b: 90, done: true }, new Set())).toEqual(['full', 'six']); // 1, 2, 3, 5, 6, 10, 15, 30
    expect(observe('lists', { a: 14, b: 70, done: true }, new Set())).toEqual(['inside']);
    expect(observe('lists', { a: 1, b: 70, done: true }, new Set())).toEqual([]); // 1 is in every list: proves nothing
    expect(observe('lists', { a: 35, b: 35, done: true }, new Set())).toEqual([]); // the same number twice
    expect(observe('duo', { a: 120, b: 180 }, new Set())).toEqual([]); // nothing reported: the hand did nothing yet
    expect(observe('duo', { a: 120, b: 180, face: 'lists', looked: true }, new Set())).toEqual(['lists']); // 12 in both
    expect(observe('duo', { a: 120, b: 121, face: 'lists', looked: true }, new Set())).toEqual([]);
    expect(observe('duo', { a: 987, b: 610, face: 'divisions', done: false }, new Set())).toEqual([]);
    expect(observe('duo', { a: 987, b: 610, face: 'divisions', done: true }, new Set())).toEqual(['chain']);
    expect(observe('duo', { a: 60, b: 48, face: 'divisions', done: true }, new Set())).toEqual([]); // 2 divisions
    expect(observe('duo', { a: 84, b: 126, face: 'probe', d: 14, moved: true }, new Set())).toEqual(['probe']);
    expect(observe('duo', { a: 84, b: 126, face: 'probe', d: 14, moved: false }, new Set())).toEqual([]);
    expect(observe('duo', { a: 84, b: 126, face: 'probe', d: 7, moved: true }, new Set())).toEqual([]); // not above 10
    // « شريط الكسر »: nothing before the hand moved the piece; a piece above 10 in both; a strip above 500 written under 50;
    // a piece of the denominator only, above 100
    expect(observe('strip', { a: 84, b: 126, k: 14 }, new Set())).toEqual([]);
    expect(observe('strip', { a: 84, b: 126, k: 14, moved: true }, new Set())).toEqual(['both']);
    expect(observe('strip', { a: 84, b: 126, k: 7, moved: true }, new Set())).toEqual([]); // not above 10
    expect(observe('strip', { a: 300, b: 720, k: 20, moved: true }, new Set())).toEqual(['both', 'big']); // 15/36
    expect(observe('strip', { a: 300, b: 720, k: 12, moved: true }, new Set())).toEqual(['both']); // 60 is not under 50
    expect(observe('strip', { a: 35, b: 120, k: 4, moved: true }, new Set())).toEqual(['split']);
    expect(observe('strip', { a: 35, b: 90, k: 3, moved: true }, new Set())).toEqual([]); // the denominator under 100
    // « ساحة العدد »: nothing before the hand moved the side; a perfect square above 100 filled; a court above 150
    // settled between two sides tried; 20 tiles or more left beside the greatest whole square, once its side was tried
    expect(observe('court', { a: 144, b: 1, s: 12 }, new Set())).toEqual([]);
    expect(observe('court', { a: 144, b: 1, s: 12, moved: true, tried: [12] }, new Set())).toEqual(['exact']);
    expect(observe('court', { a: 100, b: 1, s: 10, moved: true, tried: [10] }, new Set())).toEqual([]); // not above 100
    expect(observe('court', { a: 160, b: 1, s: 13, moved: true, tried: [12, 13] }, new Set())).toEqual(['bracket']);
    expect(observe('court', { a: 160, b: 1, s: 12, moved: true, tried: [12] }, new Set())).toEqual([]); // 13 not tried
    expect(observe('court', { a: 120, b: 1, s: 10, moved: true, tried: [10] }, new Set())).toEqual(['most']); // 120 − 100
    expect(observe('court', { a: 119, b: 1, s: 10, moved: true, tried: [10, 11] }, new Set())).toEqual([]); // 19 left
    // « منصّة الكسر »: nothing before the hand moved the rod; a court above 10 covered exactly by a rod of denominator
    // above 1; one piece apart with a denominator above 4; a difference under a hundredth of a tile, not zero
    expect(observe('piece', { a: 16, b: 2, p: 8 }, new Set())).toEqual([]);
    expect(observe('piece', { a: 16, b: 2, p: 8, moved: true }, new Set())).toEqual(['exact']);
    expect(observe('piece', { a: 9, b: 2, p: 6, moved: true }, new Set())).toEqual([]); // 9 is not above 10
    expect(observe('piece', { a: 16, b: 1, p: 4, moved: true }, new Set())).toEqual([]); // a whole rod
    expect(observe('piece', { a: 2, b: 5, p: 7, moved: true }, new Set())).toEqual(['one']); // 49 against 50
    expect(observe('piece', { a: 2, b: 2, p: 3, moved: true }, new Set())).toEqual([]); // 9 against 8: q not above 4
    expect(observe('piece', { a: 2, b: 12, p: 17, moved: true }, new Set())).toEqual(['one', 'close']); // 1/144
    expect(observe('piece', { a: 3, b: 11, p: 19, moved: true }, new Set())).toEqual([]); // 361 − 363: 2/121
    expect(observe('piece', { a: 3, b: 12, p: 21, moved: true }, new Set())).toEqual([]); // 441 − 432: 9/144
    expect(observe('court', { a: 399, b: 1, s: 20, moved: true, tried: [19, 20] }, new Set())).toEqual([
      'bracket',
      'most',
    ]);
    expect(observe('planks', { a: 21, b: 35, d: 7 }, new Set())).toEqual(['both', 'rest']);
    expect(observe('planks', { a: 22, b: 20, d: 7 }, new Set())).toEqual(['sum']);
    expect(observe('planks', { a: 24, b: 12, d: 6 }, new Set())).toEqual(['both']); // 24 = 12 × 2: no remainder
    expect(observe('planks', { a: 21, b: 35, d: 1 }, new Set())).toEqual([]); // a plank of 1 fills anything
    expect(observe('planks', { a: 21, b: 35 }, new Set())).toEqual([]); // the plank was never moved: nothing reported
    expect(observe('bracket', { a: 100, b: 7 }, new Set())).toEqual([]); // no plank laid by the hand: nothing reported
    expect(observe('bracket', { a: 100, b: 7, n: 14 }, new Set())).toEqual([]); // 98: the full planks, still inside
    expect(observe('bracket', { a: 100, b: 7, n: 15 }, new Set())).toEqual(['over']); // 105: the last plank alone passes
    expect(observe('bracket', { a: 100, b: 7, n: 16 }, new Set())).toEqual(['over']); // brought back to 15: never two past
    expect(observe('bracket', { a: 120, b: 8, n: 15 }, new Set())).toEqual(['exact']);
    expect(observe('bracket', { a: 120, b: 12, n: 10 }, new Set())).toEqual([]); // exactly 10 planks: not more than 10
    expect(observe('bracket', { a: 120, b: 8, n: 16 }, new Set())).toEqual([]); // 128 > 120 but 120 = 8 × 15: nothing to pass
    expect(observe('bracket', { a: 2615, b: 42, n: 63, lo: true, hi: true }, new Set())).toEqual(['over', 'big']);
    expect(observe('bracket', { a: 2615, b: 42, n: 62, lo: true, hi: false }, new Set())).toEqual([]);
    expect(observe('bracket', { a: 2615, b: 7, n: 373, lo: true, hi: true }, new Set())).toEqual([]); // a one-digit plank
  });
  it('the dice always gives numbers the instrument can show', () => {
    let s = 7;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (const t of TOOLS)
      for (let i = 0; i < 200; i += 1) {
        const p = luckyPair(t, rand);
        expect(clampFor(t, p.a, p.b), t.id).toEqual(p);
      }
  });
});

describe('مختبري — the sounds', () => {
  const read = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
  const FILES = [
    './LessonLab.jsx',
    './kit.jsx',
    ...[
      'Rows',
      'Jumps',
      'Sentences',
      'Divisors',
      'Planks',
      'Common',
      'Lists',
      'Euclid',
      'PaperDivision',
      'Rules',
      'Bracket',
      'Duo',
      'Strip',
      'NumberCourt',
      'FractionPlatform',
    ].map((n) => `./tools/${n}.jsx`),
  ];
  /** Every sound name written in the lab's code: play('x'…), useChime(play, 'x'…), and the two names of a « a ? 'x' : 'y' ». */
  const namesIn = (src) =>
    [...src.matchAll(/(?:play|playRef\.current\??\.?|useChime)\((?:play, )?([^)]*?)[,)]/g)].flatMap((m) =>
      [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map((x) => x[1]),
    );

  it('every sound an instrument plays exists in the palette, and every sound of the palette is played', async () => {
    const { SOUND_NAMES } = await import('./sound');
    const used = new Set(FILES.flatMap((f) => namesIn(read(f))));
    for (const name of used) expect(SOUND_NAMES, `« ${name} » is played but not in sound.js`).toContain(name);
    for (const name of SOUND_NAMES) expect([...used], `« ${name} » is in sound.js but never played`).toContain(name);
    expect(used.size).toBeGreaterThanOrEqual(25);
  });

  it('every instrument has its sounds, and none borrows the game world’s', () => {
    for (const f of FILES.slice(2)) expect(namesIn(read(f)).length, f).toBeGreaterThanOrEqual(1);
    expect(read('./LessonLab.jsx')).not.toMatch(/gameworld\/engine\/audio/);
  });

  it('a number has a note: neighbours differ, the notes stay in a singable range', async () => {
    const { pitchOf, noteOf, GAP, SOUNDS } = await import('./sound');
    for (let n = 0; n < 200; n += 1) {
      expect(pitchOf(n)).not.toBe(pitchOf(n + 1));
      expect(pitchOf(n)).toBeGreaterThanOrEqual(261);
      expect(pitchOf(n)).toBeLessThanOrEqual(1761);
    }
    expect(noteOf(0)).toBe(0);
    expect(noteOf(5)).toBe(12);
    expect(noteOf(15)).toBe(0);
    expect(noteOf(-3)).toBe(0);
    expect(pitchOf('7')).toBe(pitchOf(7));
    for (const k of Object.keys(GAP)) expect(Object.keys(SOUNDS)).toContain(k);
  });

  it('a sound is made of short, quiet notes — and the same sound does not rattle', async () => {
    const { LabSound, SOUNDS } = await import('./sound');
    const s = new LabSound();
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
      expect(s.play(name, 12, 3), name).toBe(true);
      expect(made.length, name).toBeGreaterThan(0);
      for (const o of made) {
        expect((o.t ?? 0) + (o.d ?? 0.2), name).toBeLessThanOrEqual(1.3);
        expect(o.g ?? 0.2, name).toBeLessThanOrEqual(0.3);
        if (o.kind === 'tone') expect(Number.isFinite(o.f) && o.f >= 80 && o.f <= 4200, `${name}: ${o.f}`).toBe(true);
      }
    }
    now += 5;
    expect(s.play('tick', 4)).toBe(true);
    now += 0.01;
    expect(s.play('tick', 5)).toBe(false);
    now += 0.04;
    expect(s.play('tick', 6)).toBe(true);
    expect(s.play('nothing')).toBe(false);
  });
});
