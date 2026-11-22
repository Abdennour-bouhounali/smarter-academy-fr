import { describe, it, expect } from 'vitest';
import { SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, STONE, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, fills, FORMS } from '../../../../../../../features/classSession/lessonScripts';

/** « حصّة القسم » of `qisma-iqlidiya-hasr`: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** What the class reads of a step (its plain sentences and its formulas). */
const read = (s) => [s.title, s.text, s.question, s.after, ...(s.items ?? []).map((x) => x.text)].join(' ');

/** An arithmetic side (digits, + − × ÷ and parentheses) evaluated by a small parser; null when it holds anything else. */
function value(side) {
  // « \frac{a}{b} » is the quotient a ÷ b, written as the exercise bank writes it
  const s = side
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '($1 / $2)')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/');
  if (!/^[\d\s+\-*/()]+$/.test(s)) return null;
  const t = s.match(/\d+|[-+*/()]/g);
  let i = 0;
  const factor = () => {
    if (t[i] !== '(') return Number(t[i++]);
    i += 1;
    const v = sum(); // eslint-disable-line no-use-before-define
    i += 1;
    return v;
  };
  const product = () => {
    let v = factor();
    while (t[i] === '*' || t[i] === '/') {
      const op = t[i];
      i += 1;
      const w = factor();
      v = op === '*' ? v * w : v / w;
    }
    return v;
  };
  function sum() {
    let v = product();
    while (t[i] === '+' || t[i] === '-') {
      const op = t[i];
      i += 1;
      const w = product();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  }
  const v = sum();
  expect(i, side).toBe(t.length); // the whole side was read
  return v;
}
/**
 * The truth of a formula written in LaTeX: « x = y = z » (all sides equal) and « x < y < z » (strictly increasing).
 * Sides holding a letter are skipped (the letter statements are checked apart). Returns how many relations were checked.
 */
function checkFormula(f) {
  let n = 0;
  if (f.includes('=')) {
    const v = f
      .split('=')
      .map((x) => value(x.trim()))
      .filter((x) => x !== null);
    if (v.length >= 2) {
      for (const x of v) expect(x, f).toBe(v[0]);
      n += 1;
    }
  }
  if (f.includes('<')) {
    const v = f.split('<').map((x) => value(x.trim()));
    if (v.every((x) => x !== null)) {
      for (let k = 1; k < v.length; k += 1) expect(v[k] > v[k - 1], f).toBe(true);
      n += 1;
    }
  }
  return n;
}
/** « 7 ألواح », « 22 لوحًا », « لوحان »: the word that counts planks agrees with its number. */
function planksAgree(text) {
  for (const m of text.matchAll(/(\d+) (ألواح|لوحًا)/g)) {
    const n = Number(m[1]);
    expect(m[2] === 'ألواح' ? n >= 3 && n <= 10 : n >= 11, m[0]).toBe(true);
  }
  for (const m of text.matchAll(/(\d+) (خانات|خانة)/g)) {
    const n = Number(m[1]);
    expect(m[2] === 'خانات' ? n >= 3 && n <= 10 : n >= 11, m[0]).toBe(true);
  }
}

const { intro: I, recall: C, long: L, bracket: H, after: F, exact: X, trips: T, boss: B } = NUMBERS;

describe('القسمة الإقليدية وحصر حاصل القسمة — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and a short oral question for each', () => {
    expect(SCRIPT.steps.length).toBeGreaterThanOrEqual(11);
    expect(SCRIPT.steps.length).toBeLessThanOrEqual(13);
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // the pilot's mirror, not this lesson's
    // a long cue is cut in the footer at 1024 px (CLASS_SESSION.md §5ter)
    for (const s of SCRIPT.steps) expect(s.cue.length, `${s.id}: ${s.cue}`).toBeLessThanOrEqual(70);
    // what the board draws as plain text holds no formula (the cue, the question, the title, a sentence to judge)
    for (const s of SCRIPT.steps)
      for (const t of [s.cue, s.question, s.title, ...(s.items ?? []).map((x) => x.text)])
        expect(t ?? '', s.id).not.toContain('$');
    // nothing sends the class to a book, and money is « دج »
    const all = JSON.stringify(SCRIPT);
    expect(all).not.toMatch(/الكتاب المدرسي|الكتاب|صفحة|DA\b/);
  });

  it('never names a key before the class has acted on it: every name follows an « ask », no title said before', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(SCRIPT.steps[i - 1].kind, s.id).toBe('ask');
    });
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      const said = before.map(read).join(' ');
      expect(said, n.tablet).not.toContain(TABLETS[n.tablet].title);
    }
    // the words the tablets give the class (the estimate, approximations, « zero remainder ») are not said before their key
    const beforeName = (id) =>
      SCRIPT.steps
        .slice(
          0,
          SCRIPT.steps.findIndex((s) => s.tablet === id),
        )
        .map(read)
        .join(' ');
    for (const w of ['نقدّر', 'تقريب', 'مقرّب']) expect(beforeName('qisma-ay-adad')).not.toContain(w);
    for (const w of ['بالنقصان', 'بالزيادة', 'قيمة مقرّبة', 'حصر']) expect(beforeName('hasr-hasil')).not.toContain(w);
    for (const w of ['الباقي معدوم', 'انعدام']) expect(beforeName('inidam-baqi')).not.toContain(w);
  });

  it('opens on the world’s first, short gap: the bridge holds and every cell is drawn readable', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: I.gap, b: I.plank });
    expect(bridge.a % bridge.b).toBe(0);
    expect(bridge.a).toBeLessThanOrEqual(100); // the board draws one slot per cell: a short gap only
  });

  it('the first year’s division is only RECALLED — one station, no name — before the long planks', () => {
    const ids = SCRIPT.steps.map((s) => s.id);
    expect(ids.slice(0, 4)).toEqual(['situation', 'recall', 'long', 'name-1']);
    const recall = step('recall');
    expect(recall.kind).toBe('ask');
    for (const b of recall.options) expect(String(b)).toHaveLength(2);
    // the station of the first key: every plank has three digits, and a digit is tried too big before the right one
    const long = step('long');
    for (const b of long.options) expect(String(b)).toHaveLength(3);
    expect(long.after).toContain('نجرّب 9: $248 \\times 9 = 2232$ يتجاوز 2096؛ إذن 8');
    expect([4576 - 248 * 10, 248 * 9, 248 * 8 + 112]).toEqual([2096, 2232, 2096]);
    expect(long.cue).toContain('2096');
    expect(step('name-1').cue).toContain('926 مع اللوح 365');
    expect(4576 - 365 * 10).toBe(926);
  });

  it('every answer of an « ask » is exactly the planks that fill its gap, and its options are the world’s moulds', () => {
    expect(ask.map((s) => s.id)).toEqual(['recall', 'long', 'bracket', 'need', 'exact', 'port']);
    for (const s of ask) {
      expect(
        s.options.filter((o) => fills(s, o)),
        s.id,
      ).toEqual(s.answer);
      expect(askRight(s, [...s.answer].reverse()), s.id).toBe(true);
      expect(askRight(s, s.options), s.id).toBe(false); // picking every plank is not the answer
      expect(s.options.length, s.id).toBeLessThanOrEqual(6); // one row on the board
      expect(new Set(s.options).size, s.id).toBe(s.options.length);
      expect(s.text + s.after, s.id).toContain('$'); // its proof is written
      // the bar of each choice draws its full planks: never so many that a plank is thinner than a few pixels
      for (const o of s.options) expect(Math.floor(s.a / o), `${s.id}:${o}`).toBeLessThanOrEqual(60);
    }
    const gaps = Object.fromEntries(ask.map((s) => [s.id, [s.a, s.options, s.answer]]));
    expect(gaps.recall).toEqual([C.gap, C.moulds, [C.plank]]);
    expect(gaps.long).toEqual([L.gap, L.moulds, [L.plank]]);
    expect(gaps.bracket).toEqual([H.gap, H.moulds, [H.plank]]);
    expect(gaps.need).toEqual([F.gap, F.moulds, [F.plank]]);
    expect(gaps.exact).toEqual([X.gap, X.moulds, [X.plank]]);
    expect(gaps.port).toEqual([B.gap, B.options, [B.plank]]);
    // the numbers, by hand: 912 = 24 × 38; 4576 = 208 × 22 = 248 × 18 + 112 = 365 × 12 + 196; 5475 = 208 × 26 + 67 = 365 × 15
    expect([C.gap / 24, C.gap - 24 * 30, (C.gap - 24 * 30) / 24, C.gap % 17, C.gap % 35]).toEqual([38, 192, 8, 11, 2]);
    expect([L.gap / 208, Math.floor(L.gap / 248), L.gap % 248, Math.floor(L.gap / 365), L.gap % 365]).toEqual([
      22, 18, 112, 12, 196,
    ]);
    expect(L.moulds.every((m) => L.gap % m < m)).toBe(true); // every remainder smaller than its plank
    expect([Math.floor(H.gap / 208), H.gap % 208, 208 * 26, 208 * 27, H.gap / 365]).toEqual([26, 67, 5408, 5616, 15]);
    expect([F.gap / 28, Math.floor(F.gap / 30), F.gap % 30, Math.floor(F.gap / 45), F.gap % 45]).toEqual([
      23, 21, 14, 14, 14,
    ]);
    expect([X.gap / 45, Math.floor(X.gap / 50), X.gap % 50]).toEqual([24, 21, 30]);
    expect([B.gap / 156, Math.floor(B.gap / 130), B.gap % 130, (B.gap / 156) * B.price]).toEqual([12, 14, 52, 1440]);
    expect(step('port').after).toContain('1440 دج');
  });

  it('judges five sentences on one equality, their truths computed by the board’s own forms', () => {
    const s = step('sentences');
    expect(s.kind).toBe('statements');
    expect([s.a, s.b]).toEqual([X.gap, X.plank]);
    expect(s.items.map((x) => FORMS[x.form](s.a, s.b))).toEqual([true, false, true, false, true]);
    // each sentence says what its form says, with the two numbers in the right places
    const said = {
      b_divides_a: `${s.b} يقسم ${s.a}`,
      a_divides_b: `${s.a} يقسم ${s.b}`,
      a_multiple_of_b: `${s.a} مضاعف للعدد ${s.b}`,
      b_multiple_of_a: `${s.b} مضاعف للعدد ${s.a}`,
      a_divisible_by_b: `${s.a} يقبل القسمة على ${s.b}`,
    };
    for (const it of s.items) expect(it.text).toBe(said[it.form]);
    // the true ones are the four sentences of the tablet, with these very numbers
    const truths = s.items.filter((x) => FORMS[x.form](s.a, s.b)).map((x) => x.text);
    expect([...truths].sort()).toEqual([...TABLETS['inidam-baqi'].list.slice(1)].sort());
  });

  it('writes only true equalities and brackets in what the class reads, and its words agree with its numbers', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean)) for (const f of formulas(t)) n += checkFormula(f);
    expect(n).toBeGreaterThanOrEqual(15);
    // the formulas are LaTeX: « \\times », never a raw « × » or « * »
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*÷]/);
    for (const s of SCRIPT.steps) planksAgree(read(s).replace(/\$[^$]+\$/g, ' '));
    // the planks counted in words, against the gaps
    expect(step('bracket').after).toContain(`${Math.floor(H.gap / 208)} لوحًا تترك ${H.gap % 208} خانة`);
    expect(step('bracket').after).toContain(`${Math.floor(H.gap / 208) + 1} لوحًا تتجاوز`);
    expect(step('need').after).toContain('21 لوحًا كاملًا، ويلزم 22 لوحًا');
    expect(step('exact').after).toContain('24 لوحًا كاملًا');
    expect(step('exact').after).toContain('21 لوحًا كاملًا ويلزم 22 لوحًا');
  });

  it('asks oral questions whose numbers are true — and its own: none is a sheet of the exercise bank', () => {
    // recall: 24 × 10 = 240, 24 × 30 = 720 ≤ 912 < 24 × 40 = 960
    expect(24 * 30 <= C.gap && C.gap < 24 * 40).toBe(true);
    // long: in 2096 with 248 — 248 × 9 passes, 248 × 8 leaves 112
    expect([248 * 9 > 2096, 2096 - 248 * 8 < 248]).toEqual([true, true]);
    // name-1: 926 with 365 — 365 × 2 = 730, 196 left; 365 × 3 passes
    expect([365 * 2, 926 - 730, 365 * 3 > 926]).toEqual([730, 196, true]);
    // bracket: 26 < 5475 ÷ 208 < 27
    expect(26 < H.gap / 208 && H.gap / 208 < 27).toBe(true);
    // need: 45 in 644 — 14 full, 15 needed
    expect([Math.floor(F.gap / 45), Math.ceil(F.gap / 45)]).toEqual([14, 15]);
    // name-2: the stone's boat — 26 full trips, 27 needed
    expect([STONE.full, STONE.needed, STONE.left]).toEqual([
      Math.floor(T.boxes / T.boat),
      Math.ceil(T.boxes / T.boat),
      2,
    ]);
    expect(step('name-2').cue).toContain(`${T.boxes} صندوقًا`);
    // exact: 1080 ÷ 45 = 24 exactly
    expect(Number.isInteger(X.gap / X.plank)).toBe(true);
    // port: 130 does not fill 1872 — 15 planks needed
    expect([B.gap % 130, Math.ceil(B.gap / 130)]).toEqual([52, 15]);
    // name-3: the remainder of 72 by 8 is 0
    expect(72 % 8).toBe(0);
    // « 500 on 23 starting with 23 × 20 » is sheet l1-007 of the bank: neither the board nor the memo says it
    const all = JSON.stringify(SCRIPT) + JSON.stringify(MEMO);
    expect(all).not.toMatch(/(^|\D)500(\D|$)/);
    expect(all).not.toMatch(/(^|\D)23 في/);
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the three keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(['qisma-ay-adad', 'hasr-hasil', 'inidam-baqi']);
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
      expect(t.math.length, s.tablet).toBeLessThanOrEqual(2); // a tablet's row stays in its card
      for (const f of t.math) expect(checkFormula(f), f).toBe(1);
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the three keys, in order
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace').every((s) => s.tablets.length <= 2)).toBe(true);
  });

  it('calls b « المقسوم عليه » on the board and in the memo: « قاسم » only beside « مضاعف », for « b يقسم a »', () => {
    const all = JSON.stringify(SCRIPT) + JSON.stringify(MEMO);
    expect(all).not.toContain('القاسم');
    expect(JSON.stringify(MEMO)).toContain('المقسوم عليه');
    for (const m of all.matchAll(/.{0,30}قاسم.{0,30}/g)) expect(m[0], m[0]).toMatch(/مضاعف/);
  });
});

describe('القسمة الإقليدية وحصر حاصل القسمة — the written memo', () => {
  it('has every part of a good lesson plan and runs the four moments in a 45-minute hour', () => {
    expect(partKeys()).toHaveLength(9);
    for (const k of [
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'support',
      'extend',
      'next',
      'connect',
      'stands',
    ])
      expect(MEMO[k], k).toBeTruthy();
    expect(MEMO.title).toBe(SCRIPT.title);
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    expect(JSON.stringify(MEMO)).not.toContain('وضع القسم');
    expect(JSON.stringify(MEMO)).not.toMatch(/الكتاب المدرسي|صفحة|DA\b/);
  });

  it('says what the first year really covered — divisors of one digit OR two — and what this lesson adds', () => {
    expect(MEMO.stands).toContain('عدد من رقم أو رقمين');
    expect(MEMO.stands).not.toContain('رقم واحد');
    expect(MEMO.phases[0].watch).toContain('رقمين');
    expect(MEMO.glance.goal).toContain('ثلاثة أرقام');
    expect(MEMO.criteria[0].can).toContain('ثلاثة أرقام');
    // « كلّ لوح يقسم كلّ هوّة » would say every plank DIVIDES every gap — the word of the third key, and false
    expect(MEMO.glance.idea).not.toMatch(/يقسم/);
  });

  it('writes no formula where the memo page draws plain text', () => {
    const plain = [
      MEMO.glance.goal,
      MEMO.glance.idea,
      MEMO.glance.trap,
      MEMO.stands,
      MEMO.next,
      ...MEMO.sequence,
      ...MEMO.criteria.map((c) => c.can),
      ...MEMO.openings.flatMap((o) => [o.title, o.story, o.ask, o.why, o.expect]),
      ...MEMO.phases.flatMap((p) => [p.name, p.aim, p.teacher, p.class, p.watch]),
    ];
    for (const t of plain) expect(t, t).not.toContain('$');
  });

  it('proposes four openings with a different drawing each, the board’s one among them, numbers true', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(MEMO.openings.filter((o) => o.board).map((o) => o.id)).toEqual(['bridge']);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    expect(MEMO.openings[0]).toMatchObject({ a: step('situation').bridge.a, b: step('situation').bridge.b }); // the memo's board opening IS the script's
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(String(o.a));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    // bridge: 84 = 12 × 7, « 7 ألواح »
    expect(f.bridge.first).toMatchObject({ q: 7, r: 0, exact: true });
    expect(MEMO.openings[0].expect).toContain('7 ألواح');
    // teams: 38 players in 5 teams — 7 each, 3 outside; « 6 each, 8 outside » is the trap (8 is not smaller than 5)
    expect(f.teams.first).toMatchObject({ b: 5, q: 7, r: 3, exact: false });
    expect(5 * 6 + 8).toBe(38);
    // shelves: 150 = 12 × 12 + 6 (13 shelves needed), 150 = 10 × 15
    expect(f.shelves.first).toMatchObject({ b: 12, q: 12, r: 6, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 10, q: 15, r: 0, exact: true });
    expect(MEMO.openings[2].expect).toContain('الرفّ الثالث عشر'); // 12 + 1
    // tiles: 90 = 20 × 4 + 10, 90 = 15 × 6
    expect(f.tiles.first).toMatchObject({ b: 20, q: 4, r: 10, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 15, q: 6, r: 0, exact: true });
    expect(MEMO.openings[3].expect).toContain('فراغ 10 cm');
    expect(MEMO.openings[3].expect).toContain('6 بلاطات');
    // the drawings write « N ألواح / بلاطات », « N في كلّ فريق » and « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(f.bridge.first.r).toBe(0);
    expect(f.teams.first.q).toBeLessThanOrEqual(8); // the dots of a team stand in one ring
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misconceptions are really false
    expect(365 * 11 + 561).toBe(L.gap); // a true sum …
    expect(561).toBeGreaterThanOrEqual(365); // … whose remainder is not smaller than the plank
    expect(T.boxes % T.boat).toBe(2); // « the two boxes left »: the trips needed are not the full trips
    expect(X.plank % X.gap).not.toBe(0); // 1080 does not divide 45
    // « 365 is close to 400, and 400 × 11 = 4400: the quotient is 11 » — the rounded plank says 11, the plank itself 12
    expect([Math.floor(L.gap / 400), Math.floor(L.gap / 365), 400 * 11]).toEqual([11, 12, 4400]);
    expect(MEMO.anticipated.map((a) => a.says).join(' ')).toContain('$400 \\times 11 = 4400$');
    // the right answer of the long plank: 9 tried in 2096 passes it, 8 is kept
    expect(MEMO.anticipated[0].says).toContain('جرّبت 9');
    expect(MEMO.anticipated[0].advance).toContain('312 في 5475'); // the lesson's own numbers
  });

  it('writes only true equalities and brackets: the glance, the criteria, the answers, the exit ticket', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.map((a) => a.says),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      ...MEMO.support,
    ];
    let n = 0;
    for (const t of texts) for (const f of formulas(t)) n += checkFormula(f);
    expect(n).toBeGreaterThanOrEqual(12);
    for (const t of [...texts, ...MEMO.written, MEMO.connect])
      for (const f of formulas(t)) expect(f, t).not.toMatch(/[×*÷]/);
    // the criteria's check is the equality they show
    expect(MEMO.criteria[0].see).toContain('4576 = 248 \\times 18 + 112');
    expect(MEMO.criteria[0].see).toContain('248 \\times 9 = 2232');
    expect(MEMO.criteria[2].see).toContain('26 < 5475 \\div 208 < 27');
    expect(MEMO.criteria[3].see).toContain('1080 \\div 45 = 24');
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: a divisor of three digits, the memo's own — 6000 = 245 × 24 + 120
    expect([245 * 24 + 120, 120 < 245]).toEqual([6000, true]);
    expect(String(MEMO.exit[0].check.b)).toHaveLength(3);
    // what is written holds on the edges: the bracket needs 0 < r < b, and « ≤ » on the left takes r = 0 in
    expect(MEMO.written[1]).toContain('$0 < r < b$');
    expect(MEMO.written[1]).toContain('\\frac{a}{b}');
    expect(MEMO.connect).toContain('$q \\leq a \\div b < q + 1$');
    // exit 2: 5 full buses, 6 needed
    expect([Math.floor(300 / 52), Math.ceil(300 / 52)]).toEqual([5, 6]);
    expect(MEMO.exit[1].a).toContain('5 حافلات مملوءة، وتلزم 6');
    // exit 3: 1176 = 24 × 49
    expect(1176 % 24).toBe(0);
    // the support: 50 = 12 × 4 + 2, 60 = 12 × 5
    expect([50 % 12, 60 % 12]).toEqual([2, 0]);
  });

  it('computes the answers of the extension', () => {
    const { quotient: Q, bracket: K, double: D } = MEMO.extendCheck;
    expect(MEMO.extend[0]).toContain(String(Q.b));
    expect(MEMO.extend[0]).toContain(String(Q.q));
    // the numbers whose quotient by 13 is 7: from 91 to 103 (thirteen of them)
    const byQ = Array.from({ length: 200 }, (_, a) => a).filter((a) => Math.floor(a / Q.b) === Q.q);
    expect([byQ[0], byQ.at(-1), byQ.length]).toEqual([91, 103, 13]);
    // 15 < a ÷ 8 < 16: from 121 to 127
    const byK = Array.from({ length: 200 }, (_, a) => a).filter((a) => a / K.b > K.q && a / K.b < K.q + 1);
    expect([byK[0], byK.at(-1)]).toEqual([121, 127]);
    expect(MEMO.extend[1]).toContain(`${K.q} < a \\div ${K.b} < ${K.q + 1}`);
    // the double of a number that leaves 5 by 9 leaves 1, whatever the number
    for (let k = 0; k < 50; k += 1) expect((2 * (D.b * k + D.r)) % D.b).toBe(1);
  });

  it('checks the letter statements on many numbers, as a sanity net', () => {
    for (let b = 1; b <= 30; b += 1)
      for (let a = 0; a <= 400; a += 1) {
        const qq = Math.floor(a / b);
        const r = a % b;
        expect(a).toBe(b * qq + r);
        expect(r < b).toBe(true);
        if (r) expect(qq < a / b && a / b < qq + 1).toBe(true);
        else expect(a / b).toBe(qq);
      }
  });
});
