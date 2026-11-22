import { describe, it, expect } from 'vitest';
import { NUMBERS, STONE, STORY, TABLETS } from './story';

const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** The value of « 438 \div 16 », « 16 \times 27 + 6 »: + − × ÷ between whole numbers, × and ÷ first. */
const value = (s) =>
  s
    .replace(/\s/g, '')
    .split(/(?=[+-])/)
    .reduce((t, term) => {
      const sign = term.startsWith('-') ? -1 : 1;
      const [first, ...rest] = term.replace(/^[+-]/, '').split(/(?=[*/])/);
      const product = rest.reduce(
        (p, f) => (f[0] === '*' ? p * Number(f.slice(1)) : p / Number(f.slice(1))),
        Number(first),
      );
      return t + sign * product;
    }, 0);
/** Is a chain « x = y », « x < y < z », « x \leq y » between numbers true? (« \frac{a}{b} » is the quotient a ÷ b.) */
function holds(tex) {
  const flat = tex
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\leq/g, '≤');
  const parts = flat.split(/(=|<|≤)/);
  for (let i = 1; i < parts.length; i += 2) {
    const [x, op, y] = [value(parts[i - 1]), parts[i], value(parts[i + 1])];
    if (op === '=' && x !== y) return false;
    if (op === '<' && !(x < y)) return false;
    if (op === '≤' && !(x <= y)) return false;
  }
  return parts.length >= 3;
}

describe('the numbers of « القسمة الإقليدية وحصر حاصل القسمة » — every fact of the story is computed', () => {
  it('the first gap: 84 = 12 × 7', () => {
    const { gap, plank } = NUMBERS.intro;
    expect([gap, plank, gap / plank, gap % plank]).toEqual([84, 12, 7, 0]);
  });

  it('the recall — ONE bridge, planks of two digits: 912 = 24 × 38 (17 leaves 11, 35 leaves 2), by tens then units', () => {
    const { gap, plank, moulds } = NUMBERS.recall;
    expect([plank * 30, gap - plank * 30, (gap - plank * 30) / plank, gap / plank]).toEqual([720, 192, 8, 38]);
    expect(moulds.map((b) => gap % b)).toEqual([11, 0, 2]);
    for (const b of moulds) expect(String(b)).toHaveLength(2); // the first year's division: no plank of three digits
    // it is the second bridge, and no forge opens on the island it leads to
    expect(STORY.segments[1].id).toBe(`g${gap}`);
    const opened = [];
    STORY.onArrive({ T: STORY.text, say: () => {}, openForge: (k) => opened.push(k) }, 2);
    expect(opened).toEqual([]);
  });

  it('what is NEW — planks of three digits: 4576 = 208 × 22; 248 leaves 112 and 365 leaves 196', () => {
    const { gap, moulds, plank } = NUMBERS.long;
    expect(moulds.map((b) => div(gap, b))).toEqual([
      { q: 22, r: 0 },
      { q: 18, r: 112 },
      { q: 12, r: 196 },
    ]);
    for (const b of moulds) expect(String(b)).toHaveLength(3);
    expect(String(gap)).toHaveLength(4);
    expect(plank).toBe(208);
    // the digit that the rounded plank gets wrong, worked on the example card: in 2096 with 248, 9 passes and 8 fits
    expect([gap - 248 * 10, 248 * 9 > 2096, 2096 - 248 * 8]).toEqual([2096, true, 112]);
  });

  it('5475: 26 planks of 208 fall short, 27 overflow (26 < 5475 ÷ 208 < 27); planks of 312 need 18; 365 fills it', () => {
    const { gap, moulds } = NUMBERS.bracket;
    const [b208, b312, b365] = moulds;
    expect(div(gap, b208)).toEqual({ q: 26, r: 67 });
    expect([b208 * 26 <= gap, gap < b208 * 27]).toEqual([true, true]);
    expect([div(gap, b312), Math.ceil(gap / b312)]).toEqual([{ q: 17, r: 171 }, 18]);
    expect(gap / b365).toBe(15);
    for (const b of moulds) expect(String(b)).toHaveLength(3);
  });

  it('644 = 28 × 23 (30 and 45 leave 14); 1080 = 45 × 24 (50 leaves 30, 64 leaves 56)', () => {
    expect(NUMBERS.after.moulds.map((b) => div(NUMBERS.after.gap, b))).toEqual([
      { q: 23, r: 0 },
      { q: 21, r: 14 },
      { q: 14, r: 14 },
    ]);
    expect(NUMBERS.exact.moulds.map((b) => div(NUMBERS.exact.gap, b))).toEqual([
      { q: 24, r: 0 },
      { q: 21, r: 30 },
      { q: 16, r: 56 },
    ]);
  });

  it('the stone: 1250 = 48 × 26 + 2 — 26 full trips, 27 trips needed, and no sentence carries boxes that do not exist', () => {
    const { boxes, boat } = NUMBERS.trips;
    expect(div(boxes, boat)).toEqual({ q: 26, r: 2 });
    expect(STONE).toEqual({ full: 26, needed: 27, left: 2, fewer: 25, more: 28 });
    expect([boat * STONE.full <= boxes, boxes <= boat * STONE.needed]).toEqual([true, true]);
    const quiz = STORY.text.quiz.trips;
    expect([...quiz.answer].sort()).toEqual([STONE.full, STONE.needed]);
    const values = quiz.options.map((o) => o.v);
    expect(new Set(values).size).toBe(values.length);
    expect(values).toEqual(expect.arrayContaining(quiz.answer));
    for (const v of Object.keys(quiz.wrong)) expect(quiz.answer).not.toContain(Number(v));
    // each wrong line says what that number really does
    expect(quiz.wrong[STONE.fewer]).toContain(`${boxes - boat * STONE.fewer} صندوقًا`);
    // 27 trips have ROOM for 1296 boxes; only 1250 wait on the quay — nothing « carries 1296 »
    expect(quiz.wrong[STONE.more]).toContain(`تتّسع لـ ${boat * STONE.needed} صندوقًا`);
    expect(quiz.wrong[STONE.more]).toContain(`${boxes} فقط`);
    expect(quiz.wrong[STONE.more]).not.toMatch(/تنقل/);
    said(quiz.prompt);
  });

  it('every bridge holds with ONE of its moulds, the store has ONE right kind of plank, its price is in دج', () => {
    for (const seg of STORY.segments.filter((x) => x.kind === 'bridge')) {
      expect(seg.a % seg.holdsWith, seg.id).toBe(0);
      const offered = seg.boss ? seg.boss.options : seg.moulds;
      expect(
        offered.filter((b) => seg.a % b === 0),
        seg.id,
      ).toEqual([seg.holdsWith]);
      expect(seg.id).toBe(`g${seg.a}`);
    }
    expect(STORY.segments.map((s) => s.id)).toEqual([
      'g84',
      'g912',
      'g4576',
      'g5475',
      'g644',
      'dash',
      'g1080',
      'g1872',
    ]);
    const boss = STORY.segments.find((x) => x.boss);
    expect([boss.a, boss.holdsWith, boss.a / boss.holdsWith]).toEqual([1872, 156, 12]);
    // the other plank: 14 full planks, 15 needed — both kinds are LONG planks
    expect(div(boss.a, 130)).toEqual({ q: 14, r: 52 });
    for (const b of boss.boss.options) expect(String(b)).toHaveLength(3);
    expect((boss.a / boss.holdsWith) * boss.boss.price).toBe(1440);
    const fail = STORY.text.say.bossFail(130, boss.a % 130);
    for (const n of ['52', '14', '15']) expect(fail).toContain(n);
    const T = STORY.text.boss;
    for (const line of [T.price, T.costAsk(156, 12), T.err.cost(4000)]) {
      expect(line).toContain('دج');
      expect(line).not.toMatch(/DA|\d \d{3}/);
    }
    expect(T.costAsk(156, 12)).toContain('12 لوحًا');
    expect(T.err.long(130, 15)).toContain('1950');
    expect(T.err.long(130, 15)).toContain('(1872)');
    expect(T.err.big(130, 182)).toContain('أصغر من 130');
  });

  it('every wave of the gate dash has exactly one gate that holds, and long planks are in it', () => {
    expect(STORY.dashWaves).toHaveLength(8);
    for (const w of STORY.dashWaves) {
      expect(w.gates.filter(w.test), w.say).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      said(w.say);
    }
    // the right gates, computed
    expect(STORY.dashWaves.map((w) => w.gates.find(w.test))).toEqual([38, 12, 112, 26, 18, 196, 14, 5475]);
    expect(STORY.dashWaves.filter((w) => /(^|\D)(208|248|312|365)(\D|$)/.test(w.say)).length).toBeGreaterThanOrEqual(4);
  });

  it('the tablets say the story’s own numbers, at most two short formulas, and every one of them is true', () => {
    let checked = 0;
    for (const t of Object.values(TABLETS)) {
      expect(t.math.length).toBeLessThanOrEqual(2);
      for (const m of t.math) {
        expect(m.length, m).toBeLessThanOrEqual(40);
        expect(holds(m), m).toBe(true);
        checked += 1;
      }
      for (const n of t.notes) expect(n, n).not.toMatch(/\$|\\/);
      for (const line of [...t.lines, ...t.math, ...t.notes, ...(t.list ?? [])]) said(line);
    }
    expect(checked).toBe(6);
    expect(holds('26 < \\frac{5475}{208} < 27')).toBe(true);
    expect(holds('27 < \\frac{5475}{208} < 28')).toBe(false);
    // a tablet that lists its sentences says its rule in ONE line (the board's naming card holds it at 1024 px), and the
    // last note — what the exam sitting shows — is the world's own fact
    const zero = TABLETS['inidam-baqi'];
    expect(zero.lines).toHaveLength(1);
    expect(zero.list).toHaveLength(4);
    expect(zero.notes).toHaveLength(zero.math.length); // each equality above its own note
    expect(zero.notes.at(-1)).toContain('الألواح اللازمة');
  });

  it('the first tablet names what the lesson ADDS: a divisor of three digits, a digit tried then judged', () => {
    const t = TABLETS['qisma-ay-adad'];
    const text = t.lines.join(' ');
    for (const w of ['ثلاثة أرقام', 'المقسوم عليه', 'نقدّر', 'نضربه', 'ننقص', 'نزيده']) expect(text).toContain(w);
    expect(text).not.toContain('القاسم');
    // 4576 = 365 × 12 + 196, and one plank more passes the gap
    expect(t.math).toEqual(['4576 = 365 \\times 12 + 196', '365 \\times 13 = 4745']);
    expect(365 * 13).toBeGreaterThan(4576);
    expect(t.notes[0]).toContain('400');
  });

  it('the rules of the tablets are true on the edges: r = 0, r ≥ b, a < b, a = b', () => {
    // tablet 2 says « a = b × q + r and 0 < r < b ⇒ q < a ÷ b < q + 1 »: with its two conditions it never fails …
    expect(TABLETS['hasr-hasil'].lines[0]).toContain('$0 < r < b$');
    let traps = 0;
    for (let b = 1; b <= 40; b += 1)
      for (let a = 0; a <= 300; a += 1)
        for (let q = 0; b * q <= a; q += 1) {
          const r = a - b * q; // EVERY writing a = b × q + r, Euclidean or not
          if (r > 0 && r < b) expect(q < a / b && a / b < q + 1, `${a} = ${b} × ${q} + ${r}`).toBe(true);
          // … while « r ≠ 0 » alone is refuted (250 = 11 × 21 + 19, and 250 ÷ 11 is past 22)
          if (r >= b && !(a / b < q + 1)) traps += 1;
          // tablet 3: r = 0 ⇒ a = b × q and a ÷ b = q, a natural number
          if (r === 0) expect([b * q, a / b]).toEqual([a, q]);
          // tablet 1: the Euclidean division is the writing with r < b — it exists once
          if (r < b) expect([q, r]).toEqual([Math.floor(a / b), a % b]);
        }
    expect(traps).toBeGreaterThan(1000);
    expect([11 * 21 + 19, 250 / 11 > 22]).toEqual([250, true]);
    // the four sentences of tablet 3 are true together of its own numbers
    const { gap, plank } = NUMBERS.exact;
    expect(gap % plank).toBe(0);
    // « full planks = planks needed » exactly when nothing is left
    for (let b = 1; b <= 30; b += 1)
      for (let a = 0; a <= 200; a += 1) expect(Math.floor(a / b) === Math.ceil(a / b)).toBe(a % b === 0);
  });

  it('the notation of the exercise bank is shown once, with a real fraction bar', () => {
    const t = TABLETS['hasr-hasil'];
    expect(t.lines.join(' ')).toContain('\\frac{a}{b}');
    expect(t.math.join(' ')).toContain('\\frac{5475}{208}');
  });

  it('the title screen: the world’s name and a short name of the lesson’s own, two lines at most like every lesson', () => {
    const [world, own] = STORY.text.title.split(': ');
    expect(world).toBe('أرخبيل القواسم');
    expect(own.length).toBeLessThanOrEqual(14); // a longer name takes a third line and pushes the key hints out of 768 px
  });

  it('nothing of another lesson: not the pilot’s, not lesson 2’s or 3’s, not the textbook activity’s or a bank sheet’s numbers', () => {
    const words = JSON.stringify(STORY.text) + JSON.stringify(TABLETS) + STORY.dashWaves.map((w) => w.say).join(' ');
    expect(words).not.toMatch(/\b(756|1850|1015|735|280|2145|4750)\b|بلّورة|المنارة|بيض/);
    // « 500 on 23 » is sheet l1-007 of the exercise bank, « 250 on 11 » was the old first key
    expect(words).not.toMatch(/(^|\D)(500|250)(\D|$)/);
    const boss = STORY.text.boss;
    const lines = [
      boss.mission,
      boss.choose,
      boss.price,
      boss.divide(130),
      boss.costAsk(156, 12),
      boss.err.long(130, 15),
    ];
    for (const line of lines) expect(line, line).toMatch(/\b(1872|120|130|156)\b/);
  });
});
