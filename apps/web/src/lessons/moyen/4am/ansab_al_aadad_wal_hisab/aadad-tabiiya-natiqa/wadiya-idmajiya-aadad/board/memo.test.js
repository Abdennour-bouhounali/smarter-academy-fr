import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MEMO } from './memo';
import { BEM_2022 } from '../missions/bem2022';
import { BEM_2020 } from '../missions/bem2020';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { bankPairs, collisions, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';

/**
 * « مذكّرة الدرس » of « أدمج تعلّماتي » (unit 1) and its default class test: every number the memo writes is computed
 * here, never trusted — the two missions it describes, its own openings, exit ticket, support and extension.
 */
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/** The value of an arithmetic side in LaTeX (digits, + − × ÷, brackets, a percent sign); null for anything else. */
function value(side) {
  const js = side
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\%/g, '');
  if (!/^[\d\s+\-*/().]+$/.test(js)) return null;
  return new Function(`return ${js};`)(); // eslint-disable-line no-new-func
}
const pgcdOf = (x) => {
  const m = x.match(/^\\mathrm\{PGCD\}\((\d+) ; (\d+)\)$/);
  return m ? gcd(Number(m[1]), Number(m[2])) : null;
};
/** « x = y = z »: every side computed, all equal. */
function checkEquality(f) {
  const sides = f.split('=').map((x) => x.trim());
  const v = sides.map((x) => pgcdOf(x) ?? value(x));
  for (const [k, x] of v.entries()) expect(x, `${f}: « ${sides[k]} »`).not.toBe(null);
  for (const x of v) expect(Math.abs(x - v[0]) < 1e-9, f).toBe(true);
}
const numbersIn = (text) => [...String(text).matchAll(/\d+/g)].map((m) => Number(m[0]));

// the two missions, as their own files hold them (the memo must keep saying these numbers)
const { a: A, b: B } = BEM_2022.stock;
const { L, W } = BEM_2020.scene;
const G1 = gcd(A, B);
const D = gcd(L, W);
const P = 2 * (L + W);
const N = P / D;

describe('أدمج تعلّماتي — the written memo', () => {
  it('has every part of the model and runs the four moments in a 45-minute hour', () => {
    expect(partKeys()).toEqual([
      'glance',
      'criteria',
      'openings',
      'phases',
      'anticipated',
      'sequence',
      'written',
      'exit',
      'tiers',
    ]);
    for (const k of partKeys()) {
      if (k === 'tiers') {
        expect(MEMO.support.length, 'support').toBeGreaterThanOrEqual(2);
        expect(MEMO.extend.length, 'extend').toBeGreaterThanOrEqual(2);
      } else expect(MEMO[k], k).toBeTruthy();
    }
    for (const k of ['title', 'stands', 'connect', 'next']) expect(MEMO[k], k).toBeTruthy();
    expect(MEMO.title).toBe('أدمج تعلّماتي');
    expect(MEMO.next).toContain('الحساب على الجذور');
    for (const k of ['goal', 'idea', 'trap']) expect(MEMO.glance[k], k).toBeTruthy();
    expect(MEMO.glance.three).toHaveLength(3);
    expect(MEMO.phases.map((p) => p.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.map((m) => m.moment)).toEqual([...MOMENTS]);
    expect(MEMO.glance.minutes.reduce((s, m) => s + m.min, 0)).toBe(45);
    expect(MEMO.phases.map((p) => p.min)).toEqual(MEMO.glance.minutes.map((m) => m.min));
    for (const p of MEMO.phases)
      for (const k of ['name', 'aim', 'teacher', 'class', 'watch']) expect(p[k]).toBeTruthy();
    for (const c of MEMO.criteria) for (const k of ['can', 'see', 'check']) expect(c[k]).toBeTruthy();
    expect(MEMO.criteria).toHaveLength(4); // the method's four visible steps (one الكفاءة: P1)
    expect(MEMO.exit).toHaveLength(3);
    // the hour of the lesson names both hours, each with its mission
    const lesson = MEMO.phases.find((p) => p.moment === 'lesson');
    expect(lesson.aim).toMatch(/الحصّة الأولى المهمّة 1/);
    expect(lesson.aim).toMatch(/الحصّة الثانية المهمّة 2/);
    expect(MEMO.sequence.some((s) => s.startsWith('الحصّة الأولى، المهمّة 1'))).toBe(true);
    expect(MEMO.sequence.some((s) => s.startsWith('الحصّة الثانية، المهمّة 2'))).toBe(true);
  });

  it('says « دج », never DA; no textbook, no « نقطة التعلّم », no « وضع القسم »', () => {
    const all = JSON.stringify(MEMO);
    expect(all).not.toMatch(/\bDA\b/);
    expect(all).not.toMatch(/الكتاب المدرسي|صفحة|نقطة التعلّم|وضع القسم/);
    expect(all).toContain('دج');
    // money keeps no thousands space
    for (const m of all.matchAll(/(\d[\d\s  ]*\d)\s*دج/g)) expect(m[1], m[0]).toMatch(/^\d+$/);
  });

  it('writes no formula and no equality where the memo page draws plain text', () => {
    const plain = [
      MEMO.glance.goal,
      MEMO.glance.idea,
      MEMO.glance.trap,
      MEMO.stands,
      MEMO.next,
      ...MEMO.glance.minutes.map((m) => m.label),
      ...MEMO.sequence,
      ...MEMO.criteria.map((c) => c.can),
      ...MEMO.openings.flatMap((o) => [o.title, o.story, o.ask, o.why, o.expect]),
      ...MEMO.phases.flatMap((p) => [p.name, p.aim, p.teacher, p.class, p.watch]),
      ...MEMO.anticipated.flatMap((a) => [a.assess, a.advance]),
      ...MEMO.support,
      ...MEMO.extend,
    ];
    for (const t of plain) {
      expect(t, t).not.toContain('$');
      expect(t, t).not.toContain('=');
    }
  });

  it('never imports the board script (another session writes it): its numbers are its own', () => {
    const src = readFileSync(new URL('./memo.js', import.meta.url), 'utf8');
    expect(src).not.toMatch(/from '\.\/script'/);
  });

  it('describes the two missions with their own numbers, every result computed', () => {
    expect([A, B]).toEqual([1188, 528]);
    expect([L, W]).toEqual([60, 42]);
    // mission 1: 1188 = 528 × 2 + 132, 528 = 132 × 4 + 0 → 132 lots of 9 and 4
    expect([A % B, B % (A % B)]).toEqual([132, 0]);
    expect([G1, A / G1, B / G1]).toEqual([132, 9, 4]);
    // mission 2: PGCD 6, perimeter 204, 34 trees; 32000 − 1400 = 30600, ÷ 34 = 900; 100 % + 125 % = 225 %; 400 دج
    expect([D, P, N]).toEqual([6, 204, 34]);
    expect([(32000 - 1400) / N, 100 + 125, ((32000 - 1400) / N) * (100 / 225)]).toEqual([900, 225, 400]);
    // the model copy of mission 2 says the same
    const model = JSON.stringify(BEM_2020.model);
    for (const s of ['PGCD}(60 ; 42) = 6', '204 \\\\div 6 = 34', '30600 \\\\div 34 = 900', '= 400'])
      expect(model).toContain(s);
    // the memo writes them where it describes the missions
    expect(MEMO.criteria[2].see).toContain('$1188 = 528 \\times 2 + 132$');
    expect(MEMO.criteria[2].see).toContain('$528 = 132 \\times 4 + 0$');
    expect(MEMO.criteria[3].see).toContain('9 صناديق بطاطا و 4 صناديق جزر');
    expect(MEMO.criteria[3].see).toContain('400 دج');
    expect(MEMO.sequence.at(-1)).toContain('30600 دج');
    expect(MEMO.sequence.at(-1)).toContain('225%');
    expect(MEMO.sequence.at(-2)).toContain('204 m');
    expect(MEMO.sequence.at(-2)).toContain('34 شجرة');
    // the four conditions carried by words, in what is written
    for (const w of ['كلّ الصناديق', 'متماثلة', 'أكبر ما يمكن', 'في كلّ ركن شجرة'])
      expect(MEMO.written.join(' ')).toContain(w);
  });

  it('writes only true equalities (the glance, the criteria, what is anticipated, the exit ticket, the link)', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.map((a) => a.says),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
      MEMO.connect,
      ...MEMO.written,
    ];
    let n = 0;
    for (const t of texts)
      for (const f of formulas(t)) {
        if (/[a-z]/.test(f.replace(/\\[a-zA-Z]+/g, ''))) continue; // a rule with letters
        if (!f.includes('=')) continue;
        checkEquality(f);
        n += 1;
      }
    expect(n).toBeGreaterThanOrEqual(25);
    // a formula never breaks: nothing long is drawn on one line
    for (const t of texts)
      for (const f of formulas(t)) expect(f.replace(/\\[a-zA-Z]+/g, 'x').length, f).toBeLessThanOrEqual(46);
    // two formulas side by side keep a no-break space before their comma
    for (const t of texts) expect(t, t).not.toMatch(/\$ ،/);
  });

  it('anticipates the real mistakes of an integration situation, each refuted by a fact', () => {
    const miss = MEMO.anticipated.filter((a) => a.kind === 'miss');
    expect(miss.length).toBeGreaterThanOrEqual(6);
    expect(MEMO.anticipated.filter((a) => a.kind === 'right')).toHaveLength(1);
    expect(MEMO.anticipated.every((a) => ['right', 'miss'].includes(a.kind))).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess && a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    const says = (w) => MEMO.anticipated.find((a) => a.says.includes(w));
    // a condition carried by words forgotten: 5 lots leave 3 crates of each kind on the quay
    expect([A % 5, B % 5]).toEqual([3, 3]);
    expect(says('«5 تشكيلات»')).toBeTruthy();
    // a common divisor that is not the greatest: 12 divides both, 132 is greater
    expect([A % 12, B % 12, G1 > 12, G1 % 12]).toEqual([0, 0, true, 0]);
    expect(says('«12 تشكيلة»')).toBeTruthy();
    // the PGCD given as the answer of (ب)
    expect(says(`«في كلّ تشكيلة ${G1} صندوقًا»`)).toBeTruthy();
    // the corners counted twice: (11 + 8) × 2 = 38, not 34; one tree added on a closed path: 35
    expect([L / D + 1, W / D + 1, 2 * (L / D + 1 + W / D + 1)]).toEqual([11, 8, 38]);
    expect(38 - N).toBe(4); // the four corners, each counted twice
    expect(says('= 38$')).toBeTruthy();
    expect(says('+ 1 = 35$')).toBeTruthy();
    // 125 % taken as the whole cost: 720 دج, and then the planted tree costs 720 + 900 = 1620 دج, more than 900
    expect((900 * 100) / 125).toBe(720);
    expect(720 + (720 * 125) / 100).toBeGreaterThan(900);
    expect(says('= 720$ دج')).toBeTruthy();
    // a number without its sentence and unit
    expect(says('«400»')).toBeTruthy();
    // the right one's push forward: twice the crates of each kind gives twice the lots, the same content
    expect([gcd(2 * A, 2 * B), (2 * A) / gcd(2 * A, 2 * B), (2 * B) / gcd(2 * A, 2 * B)]).toEqual([264, 9, 4]);
  });

  it('proposes four openings, each drawn by a drawing the page knows, with true numbers', () => {
    expect(MEMO.openings).toHaveLength(4);
    expect(new Set(MEMO.openings.map((o) => o.kind)).size).toBe(4);
    for (const o of MEMO.openings) expect(['bridge', 'teams', 'shelves', 'tiles']).toContain(o.kind);
    // the board's situation is the mission itself: it has no drawing of its own, so no opening claims it
    expect(MEMO.openings.filter((o) => o.board)).toHaveLength(0);
    for (const o of MEMO.openings) expect(o.story, o.id).toContain(String(o.a));
    const f = Object.fromEntries(MEMO.openings.map((o) => [o.id, openingFacts(o)]));
    const o = Object.fromEntries(MEMO.openings.map((x) => [x.id, x]));
    // teams: 64 players (40 + 24); 6 teams leave 4; 4 teams work; 8 is the PGCD (5 + 3 a team); 16 divides 64 only
    expect(40 + 24).toBe(64);
    expect(f.teams.first).toMatchObject({ b: 6, q: 10, r: 4, exact: false });
    expect([40 % 4, 24 % 4, gcd(40, 24), 40 / 8, 24 / 8]).toEqual([0, 0, 8, 5, 3]);
    expect([64 % 16, 40 % 16 === 0]).toEqual([0, false]);
    expect(o.teams.why).toContain('يبقى 4 لاعبين');
    expect(o.teams.expect).toContain('16 فريقًا');
    // bridges: 28 and 20 cells; planks of 6 leave 4 of the first; the longest plank for both is 4: 7 + 5 = 12 planks
    expect(f.bridges.first).toMatchObject({ b: 6, q: 4, r: 4, exact: false });
    expect([gcd(28, 20), 28 / 4, 20 / 4, 28 / 4 + 20 / 4]).toEqual([4, 7, 5, 12]);
    expect(o.bridges.why).toContain('7 ألواح للأوّل و 5 للثاني، أي 12 لوحًا');
    // shelves: 168 books (98 + 70); shelves of 10 leave 8 stories; of 7: 24 shelves; of 14 (the PGCD): 7 + 5 = 12
    expect(98 + 70).toBe(168);
    expect(f.shelves.first).toMatchObject({ b: 10, q: 16, r: 8, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 14, q: 12, r: 0, exact: true });
    expect([98 % 10, 70 % 10, 98 / 7 + 70 / 7, gcd(98, 70), 98 / 14, 70 / 14]).toEqual([8, 0, 24, 14, 7, 5]);
    // tiles: a wall of 80 cm by 48 cm; tiles of 12 cm fill the width and leave 8 cm of the length; 16 cm: 5 × 3 = 15
    expect(f.tiles.first).toMatchObject({ b: 12, q: 6, r: 8, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 16, q: 5, r: 0, exact: true });
    expect([48 % 12, gcd(80, 48), 48 / 16, (80 / 16) * (48 / 16)]).toEqual([0, 16, 3, 15]);
    // the words the drawings write agree with their counts (« N ألواح », « N فِرق », « N رفًّا », « N بلاطات »)
    expect(f.bridges.first.q).toBeGreaterThanOrEqual(3);
    expect(f.bridges.first.q).toBeLessThanOrEqual(10);
    expect(f.bridges.first.r).toBeGreaterThanOrEqual(3);
    expect(f.teams.first.b).toBeGreaterThanOrEqual(3);
    expect(f.teams.first.b).toBeLessThanOrEqual(10);
    expect(f.teams.first.q).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(f.tiles.first.r).toBeGreaterThanOrEqual(3);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
  });

  it('gives an exit ticket, a support and an extension whose numbers are true', () => {
    // 1: 261 and 145 → 29 baskets of 9 and 5
    expect([261 % 145, 145 % 116, 116 % 29, gcd(261, 145), 261 / 29, 145 / 29]).toEqual([116, 29, 0, 29, 9, 5]);
    expect(MEMO.exit[0].a).toContain('29 سلّة، في كلّ سلّة 9 علب تمر و 5 علب حليب');
    // 2: 66 m by 44 m → spacing 22, perimeter 220, 10 trees
    expect([gcd(66, 44), 2 * (66 + 44), (2 * (66 + 44)) / 22]).toEqual([22, 220, 10]);
    expect(MEMO.exit[1].a).toContain('نغرس 10 أشجار، بين كلّ شجرتين 22 m');
    // 3: planting 45 % → 145 %; 464 دج a planted tree → 320 دج at most (and 320 + 45 % of it is 464)
    expect([(464 * 100) / 145, 320 + (320 * 45) / 100]).toEqual([320, 464]);
    expect(MEMO.exit[2].a).toContain('320 دج');
    // support: 16 and 12 crates — 2 and 4 lots take every crate, 3 leaves some
    expect([16 % 2, 12 % 2, 16 % 3, 16 % 4, 12 % 4, gcd(16, 12)]).toEqual([0, 0, 1, 0, 0, 4]);
    // extension: mission 2 with a spacing of 3 m — 68 trees, 450 دج a planted tree, a price of 200 دج, still sold
    const { spacing, price, pgcd } = MEMO.extendCheck;
    expect([L % spacing, W % spacing]).toEqual([0, 0]);
    const trees = P / spacing;
    expect([trees, (32000 - 1400) / trees, (((32000 - 1400) / trees) * 100) / 225]).toEqual([68, 450, price]);
    expect(price >= 200 && price <= 1000).toBe(true);
    expect(MEMO.extend[0]).toContain(`${spacing} m`);
    // a situation of his own whose first answer is 14 exists (e.g. 42 and 28)
    expect(gcd(42, 28)).toBe(pgcd);
    expect(MEMO.extend[1]).toContain(String(pgcd));
    // on an open road of length ℓ with a tree every d, there are ℓ ÷ d + 1 trees: around a closed plot, P ÷ d
    expect(60 / 6 + 1).toBe(11);
  });

  it('uses only its own numbers: no pair of the bank, none of another lesson’s story', () => {
    const bank = readBank('wadiya-idmajiya-aadad');
    const pairs = bankPairs(bank);
    expect(bank.sheets.length).toBe(50);
    const ours = [
      [64, 6],
      [40, 24],
      [28, 20],
      [28, 6],
      [168, 10],
      [168, 14],
      [98, 70],
      [80, 48],
      [80, 12],
      [261, 145],
      [66, 44],
      [220, 22],
      [464, 145],
      [464, 320],
      [16, 12],
    ];
    for (const g of ours) expect(collisions(bank, g, { pairs }).clear, g.join(' ; ')).toBe(true);
    // every number of 100 and more the memo writes (its checks aside) is one of the missions' or one of these
    // 237 and 105: the lines of 5 lots (1188 = 5 × 237 + 3, 528 = 5 × 105 + 3)
    const mission = new Set([
      A,
      B,
      G1,
      P,
      237,
      105,
      32000,
      1400,
      30600,
      900,
      225,
      125,
      400,
      720,
      200,
      1000,
      100,
      1620,
      264,
      450,
    ]);
    const own = new Set([...ours.flat(), 116]); // 116: the first remainder of 261 by 145
    const shown = JSON.stringify(MEMO, (k, v) => (k === 'check' || k === 'extendCheck' ? undefined : v)); // what is read
    for (const n of numbersIn(shown).filter((x) => x >= 100)) expect(mission.has(n) || own.has(n), `${n}`).toBe(true);
  });
});

describe('أدمج تعلّماتي — the default class test', () => {
  const test = JSON.parse(
    readFileSync(
      new URL('../../../../../../../../../../content/class-tests/4am/wadiya-idmajiya-aadad.json', import.meta.url),
      'utf8',
    ),
  );
  const all = [...test.start, ...test.end, ...test.pool];
  const q = (id) => all.find((x) => x.id === id);

  it('is the file of this lesson, in its grade, says « دج » and no textbook', () => {
    expect([test.lesson, test.grade]).toEqual(['wadiya-idmajiya-aadad', '4am']);
    const txt = JSON.stringify(all);
    expect(txt).not.toMatch(/\bDA\b|الكتاب|صفحة|نقطة التعلّم/);
  });

  it('counts the trees from the sides it shows: a closed rectangle, one tree at each corner', () => {
    for (const id of ['s8', 'e2']) {
      const { a, b, sides } = q(id).check;
      const [x, y] = sides;
      expect(2 * (x + y), id).toBe(a);
      expect([x % b, y % b], id).toEqual([0, 0]);
      expect(gcd(x, y), `${id}: the spacing is the greatest one`).toBe(b);
      for (const n of [x, y, b]) expect(q(id).text).toContain(`${n} m`);
      expect(q(id).text).toContain('في كلّ ركن شجرة');
    }
  });

  it('writes a true first division beside the next one it asks', () => {
    const e7 = q('e7');
    const m = e7.text.match(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/);
    const [a, b, k, r] = m.slice(1).map(Number);
    expect(b * k + r === a && r < b).toBe(true);
    expect([b, r]).toEqual([e7.check.a, e7.check.b]); // the next division is the divisor by the remainder
  });

  it('uses only its own numbers: no pair of the bank, none of another lesson’s story', () => {
    const bank = readBank('wadiya-idmajiya-aadad');
    const pairs = bankPairs(bank);
    const groups = all
      .map((x) => x.check)
      .filter((c) => c.a && c.b)
      .map((c) => [c.a, c.b]);
    expect(groups.length).toBeGreaterThanOrEqual(15);
    for (const g of groups) expect(collisions(bank, g, { pairs }).clear, g.join(' ; ')).toBe(true);
    // a lot or a basket counted with its two stocks (the one-digit counts sit on many lines of every story: skipped)
    for (const x of all.filter((y) => y.check.d >= 10 || y.check.lots >= 10)) {
      const k = x.check.d ?? x.check.lots;
      for (const n of [x.check.a, x.check.b])
        expect(collisions(bank, [n, k], { pairs }).clear, `${x.id}: ${n} ; ${k}`).toBe(true);
    }
  });
});
