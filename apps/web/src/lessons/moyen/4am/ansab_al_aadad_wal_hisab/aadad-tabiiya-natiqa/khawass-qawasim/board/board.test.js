import { describe, it, expect } from 'vitest';
import { SCRIPT } from './script';
import { MEMO } from './memo';
import { lesson } from '../world';
import { NUMBERS, TABLETS } from '../world/story';
import { MOMENTS } from '../../../../../../../features/classSession/boardLessons';
import { openingFacts, partKeys } from '../../../../../../../features/classSession/lessonMemos';
import { askRight, fills } from '../../../../../../../features/classSession/lessonScripts';

/** « حصّة القسم » of lesson 3: every number the board says is computed here, never trusted. */
const KINDS = ['situation', 'bridges', 'forge', 'name', 'ask', 'statements', 'trace'];
const holds = (c) => c.b * c.q + c.r === c.a && c.r < c.b;
const ask = SCRIPT.steps.filter((s) => s.kind === 'ask');
const names = SCRIPT.steps.filter((s) => s.kind === 'name');
const step = (id) => SCRIPT.steps.find((s) => s.id === id);
/** Every « $…$ » of a text, without its dollars. */
const formulas = (text) => [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
/**
 * The truth of an equality written in LaTeX: every side of « x = y = z » evaluated (× → *, \\times, parentheses, + and −),
 * all sides equal. Sides holding a letter are skipped (the proof is checked apart).
 */
const sides = (f) =>
  f
    .replace(/\\times/g, '*')
    .replace(/\\qquad/g, '=')
    .split('=')
    .map((x) => x.trim());
/** An arithmetic side (digits, + − × and parentheses) evaluated by a small parser; null when it holds anything else. */
function value(side) {
  if (!/^[\d\s+\-*()]+$/.test(side)) return null;
  const t = side.match(/\d+|[-+*()]/g);
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
    while (t[i] === '*') {
      i += 1;
      v *= factor();
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
function checkEquality(f) {
  if (!f.includes('=')) return;
  // « a = b \\qquad c = d » is two equalities side by side
  const parts = f.split('\\qquad').map((x) => x.trim());
  for (const p of parts) {
    const v = sides(p)
      .map(value)
      .filter((x) => x !== null);
    if (v.length < 2) continue;
    for (const x of v) expect(x, p).toBe(v[0]);
  }
}

const { join: J, stack: K, peel: P, boss: B } = NUMBERS;

describe('خواص قواسم عدد طبيعي — the script of the lesson on the board', () => {
  it('uses only the kinds of step the board draws, with unique ids, a chapter and an oral question for each', () => {
    expect(SCRIPT.steps.every((s) => KINDS.includes(s.kind))).toBe(true);
    expect(new Set(SCRIPT.steps.map((s) => s.id)).size).toBe(SCRIPT.steps.length);
    expect(SCRIPT.steps.every((s) => s.chapter && s.cue)).toBe(true);
    expect(SCRIPT.steps[0].kind).toBe('situation');
    expect(SCRIPT.steps.at(-1).kind).toBe('trace');
    expect(SCRIPT.steps.filter((s) => s.kind === 'trace')).toHaveLength(2); // two copybook pages of two keys
    expect(SCRIPT.steps.some((s) => s.kind === 'forge' || s.kind === 'bridges')).toBe(false); // the pilot's mirror, not this lesson's
    // what the board draws as plain text holds no formula (the cue, the question, the title)
    for (const s of SCRIPT.steps)
      for (const k of ['cue', 'question', 'title']) expect(s[k] ?? '', `${s.id}.${k}`).not.toContain('$');
  });

  it('never names a key before the class has acted on it: every name follows an « ask »', () => {
    SCRIPT.steps.forEach((s, i) => {
      if (s.kind === 'name') expect(['ask', 'statements', 'forge'], s.id).toContain(SCRIPT.steps[i - 1].kind);
    });
    // and no sentence the class reads BEFORE a name holds the name of its key
    for (const n of names) {
      const before = SCRIPT.steps.slice(0, SCRIPT.steps.indexOf(n));
      const said = before.map((s) => [s.title, s.text, s.question, s.after].join(' ')).join(' ');
      expect(said, n.tablet).not.toContain(TABLETS[n.tablet].title);
    }
  });

  it('opens on the glued gap of the story, and the bridge holds', () => {
    const { bridge } = step('situation');
    expect(bridge).toEqual({ a: J.gaps[0] + J.gaps[1], b: J.plank });
    expect(bridge.a).toBe(56);
    expect(bridge.a % bridge.b).toBe(0);
    expect(J.gaps.every((g) => g % J.plank === 0)).toBe(true);
  });

  it('every answer of an « ask » is exactly the planks that fill its gap — and the planks the KEY predicts', () => {
    expect(ask.map((s) => s.id)).toEqual(['cut', 'foil', 'stack', 'peel', 'harbour', 'other']);
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
    }
    const [g1, g2] = J.gaps;
    const [f1, f2] = J.foil;
    // the cut: 35 − 21 = 14, and only the plank of both gaps fills it
    expect(step('cut').a).toBe(g2 - g1);
    expect(step('cut').a).toBe(14);
    expect(step('cut').answer).toEqual([J.plank]);
    // the converse: 7 fills 22 + 20 = 42 while it fills neither 22 nor 20
    expect(step('foil').a).toBe(42);
    expect(f1 % J.plank).not.toBe(0);
    expect(f2 % J.plank).not.toBe(0);
    expect(((f1 % J.plank) + (f2 % J.plank)) % J.plank).toBe(0);
    expect(step('foil').answer).toEqual([J.plank]);
    // the multiples: 18 × 100 copies; the planks that fill 18 are those the board predicts
    expect(step('stack').a).toBe(K.bridge * K.copies);
    expect(step('stack').a).toBe(1800);
    expect(step('stack').answer).toEqual(step('stack').options.filter((o) => K.bridge % o === 0));
    // the remainder: 735 = 2 × 280 + 175; the planks that fill 175 are EXACTLY those that fill 735 and 280
    const peel = step('peel');
    expect(P.long).toBe(P.short * 2 + 175);
    expect(peel.a).toBe(P.long % P.short);
    expect(peel.options).toEqual(P.planks);
    expect(peel.answer).toEqual(P.planks.filter((o) => P.long % o === 0 && P.short % o === 0));
    expect(peel.answer).toEqual([5, 7, 35]);
    expect(peel.options.filter((o) => P.short % o === 0 && P.long % o !== 0)).toEqual([10, 14, 70]); // they fill 280 only
    // the harbour: 735 + 280 = 1015 = 35 × (21 + 8), and only the story's plank of the store fills it
    const h = step('harbour');
    expect(h.a).toBe(B.long + B.short);
    expect(h.a).toBe(1015);
    expect(B.options.filter((o) => h.a % o === 0)).toEqual([B.plank]);
    expect(B.plank * (B.long / B.plank + B.short / B.plank)).toBe(h.a);
    // other numbers: 13 × 20 + 13 × 21 = 13 × 41
    expect(step('other').a).toBe(13 * 20 + 13 * 21);
    expect(step('other').a).toBe(13 * 41);
  });

  it('writes only true equalities in what the class reads (situation, questions, what comes after)', () => {
    let n = 0;
    for (const s of SCRIPT.steps)
      for (const t of [s.text, s.after].filter(Boolean))
        for (const f of formulas(t)) {
          checkEquality(f);
          n += 1;
        }
    expect(n).toBeGreaterThanOrEqual(15);
    // the formulas are LaTeX: « \\times », never a raw « × » or « * »
    for (const s of SCRIPT.steps)
      for (const f of formulas([s.text, s.after].join(' '))) expect(f, s.id).not.toMatch(/[×*]/);
    // the words that count planks agree with the numbers they count
    expect(J.gaps.map((g) => g / J.plank)).toEqual([3, 5]); // « 3 ألواح » « 5 ألواح »
    expect((J.gaps[1] - J.gaps[0]) / J.plank).toBe(2); // « لوحان »
    expect(step('cut').after).toContain('لوحان');
    expect(K.bridge / K.plank).toBe(3); // « 3 ألواح » in each copy
    expect((B.long + B.short) / B.plank).toBe(29); // « 29 لوحًا »
    expect(step('harbour').after).toContain('29 لوحًا');
    expect(step('stack').after).toContain('7 و 11'); // the planks the key says nothing of: the bridges judge them
    expect([7, 11].every((o) => K.bridge % o !== 0 && (K.bridge * K.copies) % o !== 0)).toBe(true);
  });

  it('never leans on the CONVERSE the lesson refutes: a plank the key does not speak of is left to the bridges', () => {
    // a plank may fill what is made without filling the parts — the facts that forbid the two old sentences
    expect((K.bridge * K.copies) % 25 === 0 && K.bridge % 25 !== 0).toBe(true); // 25 fills 1800, not 18
    const rest = P.long % P.short;
    expect(rest % 25 === 0 && P.short % 25 !== 0 && P.long % 25 !== 0).toBe(true); // 25 fills 175, not 280 nor 735
    // « 7 and 11 do not fill 18 » is not given as the reason they fail on 1800
    expect(step('stack').after).not.toMatch(/لا يملآن|لا يملأ/);
    expect(step('stack').after).toContain('البناء وحده يحكم');
    // « the planks of both ARE the planks of the remainder » (an equivalence) is not said: only « so they fill it »
    expect(step('peel').after).not.toMatch(/نفسها|هي التي|فقط|وحدها/);
    expect(step('peel').after).toContain('فتملأ الباقي');
    // no sentence of the board states an « only if » about a key
    const all = SCRIPT.steps.map((s) => [s.text, s.question, s.after, s.cue].join(' ')).join(' ');
    expect(all).not.toMatch(/إلّا إذا|فقط إذا|هي نفسها/);
  });

  it('keeps every oral question inside its footer and every tablet inside its card (CLASS_SESSION.md §5ter)', () => {
    // a cue longer than about 70 characters is cut in the footer at 1024 px
    for (const s of SCRIPT.steps)
      expect(s.cue.length, `${s.id}: « ${s.cue} » (${s.cue.length})`).toBeLessThanOrEqual(70);
    // a tablet's `math` holds at most two rows, and a row at most two SHORT equalities, or it leaves the card
    const drawn = (tex) =>
      tex
        .replace(/\\times/g, '×')
        .replace(/\\(geq|leq)/g, '≥')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    for (const [key, t] of Object.entries(TABLETS)) {
      expect(t.math.length, key).toBeGreaterThanOrEqual(1);
      expect(t.math.length, key).toBeLessThanOrEqual(2);
      for (const row of t.math) {
        const parts = row.split('\\qquad');
        expect(parts.length, `${key}: ${row}`).toBeLessThanOrEqual(2);
        for (const eq of parts) {
          expect(eq, `${key}: ${eq}`).toContain('=');
          expect(drawn(eq).length, `${key}: « ${drawn(eq)} »`).toBeLessThanOrEqual(parts.length === 2 ? 12 : 28);
        }
        expect(drawn(row.replace('\\qquad', '  ')).length, `${key}: ${row}`).toBeLessThanOrEqual(28);
      }
    }
  });

  it('writes the proof with the letters of the student’s proof cards: k and k′, never the quotient’s q', () => {
    const texts = [
      ...MEMO.criteria.map((c) => c.see),
      MEMO.connect,
      ...MEMO.written,
      ...MEMO.exit.map((e) => e.a),
      ...MEMO.support,
      ...MEMO.extend,
      ...TABLETS.burhan.math.map((m) => `$${m}$`),
    ];
    const letters = texts.flatMap(formulas).map((f) => f.replace(/\\[a-zA-Z]+/g, ' '));
    expect(letters.join(' ')).not.toMatch(/p/);
    // q appears only as the quotient: beside b, in « a − b × q »
    for (const f of letters.filter((x) => /q/.test(x))) expect(f, f).toMatch(/b\s+q/);
    expect(MEMO.written[3]).toContain("a + b = d \\times (k + k')");
    expect(MEMO.connect).toContain('a - b \\times q');
    expect(TABLETS.burhan.math[1]).toBe("a + b = d \\times (k + k')");
    // the multiplier of the second key is n, in the tablet and in the memo
    expect(TABLETS.madaaf.lines[0]).toContain('a \\times n');
    expect(MEMO.written[1]).toContain('a \\times n');
  });

  it('asks oral questions whose numbers are true', () => {
    // name-1: 15 fills 30 and 45 → 75 and 15
    expect([30, 45, 30 + 45, 45 - 30].every((x) => x % 15 === 0)).toBe(true);
    // name-2: 4 fills 12 → 1200; not 1201
    expect(12 % 4 === 0 && 1200 % 12 === 0 && 1200 % 4 === 0 && 1201 % 4 !== 0).toBe(true);
    // name-3: 3 fills 45 and 12; the remainder of 45 by 12 is 9, filled by 3
    expect(45 % 3 === 0 && 12 % 3 === 0 && 45 % 12 === 9 && 9 % 3 === 0).toBe(true);
    // peel's cue: 10 fills 280, not 175
    expect(P.short % 10 === 0 && (P.long % P.short) % 10 !== 0).toBe(true);
  });

  it('names each key with the tablet of the STUDENT’S world: one wording, the four keys in order, each recall word in its text', () => {
    expect(names.map((s) => s.tablet)).toEqual(['jam-wal-farq', 'madaaf', 'baqi-qisma', 'burhan']);
    expect(names.map((s) => s.tablet)).toEqual(lesson.keys);
    for (const s of names) {
      const t = lesson.rules[s.tablet];
      expect(t, s.tablet).toBe(TABLETS[s.tablet]);
      const text = [...t.lines, ...(t.list ?? [])].join(' ').replace(/\$[^$]+\$/g, ' ');
      for (const w of s.recall) expect(text, `${s.tablet}: « ${w} »`).toContain(w); // a hidden word is never inside a formula
    }
    const traced = SCRIPT.steps.filter((s) => s.kind === 'trace').flatMap((s) => s.tablets);
    expect(traced).toEqual(names.map((s) => s.tablet)); // the copybook holds the four keys, in order
    expect(traced.every((id) => lesson.rules[id].math.length > 0)).toBe(true);
  });
});

describe('خواص قواسم عدد طبيعي — the written memo', () => {
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
    expect(f.bridge.first).toMatchObject({ q: 8, r: 0, exact: true });
    // teams: 15 + 20 = 35 players, 5 teams of 3 + 4 = 7
    expect(15 + 20).toBe(35);
    expect(15 % 5 === 0 && 20 % 5 === 0).toBe(true);
    expect(f.teams.first).toMatchObject({ q: 15 / 5 + 20 / 5, r: 0, exact: true });
    // shelves: 180 = 15 × 12 books, 48 = 4 shelves of 12 lent, 132 left
    expect(180 % 12 === 0 && 48 === 4 * 12 && 180 - 48 === 132).toBe(true);
    expect(f.shelves.first).toMatchObject({ b: 10, q: 13, r: 2, exact: false });
    expect(f.shelves.second).toMatchObject({ b: 12, q: 11, r: 0, exact: true });
    // tiles: 24 = 3 × 8, a strip three times longer: 72
    expect(24 % 8 === 0 && 3 * 24 === 72).toBe(true);
    expect(f.tiles.first).toMatchObject({ b: 10, q: 7, r: 2, exact: false });
    expect(f.tiles.second).toMatchObject({ b: 8, q: 9, r: 0, exact: true });
    // the drawings write « N ألواح / بلاطات » and « N رفًّا »: the counts stay where those words agree
    expect(f.bridge.first.q).toBeLessThanOrEqual(10);
    expect(f.tiles.second.q).toBeLessThanOrEqual(10);
    expect(f.shelves.first.q).toBeGreaterThanOrEqual(11);
    expect(f.shelves.second.q).toBeGreaterThanOrEqual(11);
    expect(MEMO.openings[0].expect).toContain(`${J.gaps[0] / J.plank} في الأولى و ${J.gaps[1] / J.plank} في الثانية`);
  });

  it('anticipates answers (right and wrong) with a question to check and one to push forward', () => {
    expect(MEMO.anticipated.filter((a) => a.kind === 'miss').length).toBeGreaterThanOrEqual(3);
    expect(MEMO.anticipated.some((a) => a.kind === 'right')).toBe(true);
    for (const a of MEMO.anticipated) {
      expect(a.assess, a.says).toBeTruthy();
      expect(a.advance, a.says).toBeTruthy();
      expect(a.assess).not.toBe(a.advance);
    }
    // the misconceptions are really false: 7 fills 42 but not 22; 10 fills 280 but not 735 nor 175
    expect(42 % 7 === 0 && 22 % 7 !== 0).toBe(true);
    expect(280 % 10 === 0 && 735 % 10 !== 0 && 175 % 10 !== 0).toBe(true);
    expect(1800 / 18).toBe(100);
  });

  it('writes only true equalities: the criteria, the glance, the exit ticket, the extension', () => {
    for (const c of [...MEMO.criteria, ...MEMO.exit].map((x) => x.check).filter(Boolean))
      expect(holds(c), JSON.stringify(c)).toBe(true);
    const texts = [
      ...MEMO.glance.three,
      ...MEMO.criteria.map((c) => c.see),
      ...MEMO.anticipated.map((a) => a.says),
      ...MEMO.exit.flatMap((e) => [e.q, e.a]),
    ];
    for (const t of texts) for (const f of formulas(t)) checkEquality(f);
    expect(MEMO.glance.three[0]).toContain('56 = 21 + 35');
    expect(MEMO.glance.three[2]).toContain('735 = 280 \\times 2 + 175');
    expect(MEMO.criteria[0].see).toContain('7 يقسم 56 و 14');
    expect(MEMO.exit).toHaveLength(3);
    // exit 1: 9 fills 54 and 81 → 135 and 27
    expect([54, 81, 54 + 81, 81 - 54].every((x) => x % 9 === 0)).toBe(true);
    expect(MEMO.exit[0].a).toContain('135 = 54 + 81');
    // exit 2: 6 fills 60, not 4, so not 64
    expect(MEMO.exit[1].a).toContain('لا');
    expect(60 % 6 === 0 && 4 % 6 !== 0 && 64 - 60 === 4 && 64 % 6 !== 0).toBe(true);
    // the extension: 21 fills 840 and 189, so it fills the remainder 84
    const { d, a, b } = MEMO.extendCheck;
    expect(a % d === 0 && b % d === 0).toBe(true);
    expect(a % b).toBe(84);
    expect((a % b) % d).toBe(0);
    // the support: 3 fills 6 and 9, so 15 and 3
    expect([6, 9, 15, 3].every((x) => x % 3 === 0)).toBe(true);
  });

  it('checks the letter proofs: a + b = d(p + q), 3a = d(3p) — on many numbers, as a sanity net', () => {
    for (let d = 1; d <= 12; d += 1)
      for (let p = 0; p <= 12; p += 1)
        for (let q = 0; q <= 12; q += 1) {
          expect(d * p + d * q).toBe(d * (p + q));
          expect(3 * (d * p)).toBe(d * (3 * p));
        }
  });
});
