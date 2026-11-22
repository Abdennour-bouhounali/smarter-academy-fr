import { describe, it, expect } from 'vitest';
import {
  joinOf,
  stackOf,
  peelOf,
  fitsRow,
  judgePeelClaim,
  checkProofOrder,
  refuteCard,
} from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { JOIN_INQUIRY, STACK_INQUIRY, PEEL_INQUIRY, LETTERS_INQUIRY } from './inquiries';
import { FORGES } from './forges';
import { NUMBERS, STORY, TABLETS } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** Every sentence of an investigation is said, and none states the rule it leads to. */
const noRule = (lines, words) => {
  for (const line of lines) {
    said(line);
    expect(line, line).not.toMatch(words);
  }
};

describe('the four investigations of « خواص قواسم عدد طبيعي » — each rule found by an experiment of its own', () => {
  it('EVERY key opens on an investigation of its own kind — no two keys share a kind', () => {
    const kinds = Object.values(FORGES).map((F) => F.inquiry?.kind);
    expect(kinds).toEqual(['join', 'stack', 'peel', 'letters']);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it('JOIN starts on the two gaps of island A, and shows both filled, one filled, and neither filled yet held', () => {
    const { rounds, d } = JOIN_INQUIRY;
    expect(d).toBe(NUMBERS.join.plank);
    expect([rounds[0].a, rounds[0].b]).toEqual(NUMBERS.join.gaps);
    const facts = rounds.map((r) => ({ ...r, ...joinOf(r.d ?? d, r.a, r.b, r.op) }));
    for (const r of rounds) if (r.op === 'diff') expect(r.a).toBeGreaterThan(r.b);
    const both = facts.filter((f) => f.fillsA && f.fillsB);
    expect(both.some((f) => f.op === 'sum') && both.some((f) => f.op === 'diff')).toBe(true);
    for (const f of both) expect(f.holds).toBe(true);
    const one = facts.filter((f) => f.fillsA !== f.fillsB);
    expect(one.some((f) => f.op === 'sum') && one.some((f) => f.op === 'diff')).toBe(true);
    for (const f of one) expect(f.holds).toBe(false);
    // the converse is false in front of him: 22 + 20 = 42, filled by 7, which fills neither
    const foil = facts.find((f) => !f.fillsA && !f.fillsB);
    expect([foil.a, foil.b, foil.value, foil.holds]).toEqual([...NUMBERS.join.foil, 42, true]);
    expect(facts.some((f) => (f.d ?? d) !== d)).toBe(true); // another plank: not a fact about 7 only
    for (const f of facts) expect(f.value).toBeLessThanOrEqual(126);
  });

  it('JOIN: every sentence says what the strips did, and none states the rule', () => {
    const T = JOIN_INQUIRY.text;
    const lines = [T.yes, T.no, T.next, T.done];
    for (const r of JOIN_INQUIRY.rounds) {
      const d = r.d ?? JOIN_INQUIRY.d;
      const j = joinOf(d, r.a, r.b, r.op);
      const f = { op: r.op, a: r.a, b: r.b, d, ...j };
      lines.push(T.lead(d), T.goal(d), T.ask(f), T.seen(f, true), T.seen(f, false), T.seen(f, null));
      lines.push(T.foundLine({ ...f, guess: true }));
      lines.push(T.label(r.a, d, { planks: j.planksA, rest: r.a % d }), T.label(j.value, d, j));
    }
    noRule(lines, /كلتيهما|معًا|يقسم|قاسم|دائمًا/);
  });

  it('STACK repeats the bridge of island B up to 100 copies, then a gap the plank does not fill', () => {
    const { d, base, times, free } = STACK_INQUIRY;
    expect([base, d]).toEqual([NUMBERS.stack.bridge, NUMBERS.stack.plank]);
    expect(times).toContain(NUMBERS.stack.copies);
    for (const k of times) expect(stackOf(d, base, k)).toMatchObject({ fillsBase: true, holds: true });
    expect([free.d, free.base]).toEqual([14, 21]);
    const outs = free.times.map((k) => stackOf(free.d, free.base, k));
    expect(outs.every((s) => !s.fillsBase)).toBe(true);
    // some copies are filled anyway, some are not: a fact, never a verdict
    expect(outs.some((s) => s.holds) && outs.some((s) => !s.holds)).toBe(true);
  });

  it('STACK: every sentence says what the copies did, and none states the rule', () => {
    const T = STACK_INQUIRY.text;
    const lines = [T.yes, T.no, T.next, T.done];
    for (const r of [STACK_INQUIRY, STACK_INQUIRY.free])
      for (const k of r.times) {
        const s = stackOf(r.d, r.base, k);
        const f = { d: r.d, base: r.base, k, ...s };
        lines.push(T.lead(r.d, r.base), T.goal(r.d), T.ask(f), T.seen(f, true), T.seen(f, false));
        lines.push(T.foundLine({ ...f, guess: false }), T.label(s.total, r.d, s));
        lines.push(T.label(r.base, r.d, { planks: Math.floor(r.base / r.d), rest: r.base % r.d }));
      }
    noRule(lines, /أيّ عدد|كلّ عدد|مهما|يقسم|مضاعف/);
  });

  it('PEEL starts on the island’s gap: 735 = 280 × 2 + 175; each round holds a plank of the gap alone, of the bridge alone, of both', () => {
    const [first] = PEEL_INQUIRY.rounds;
    expect([first.a, first.b]).toEqual([NUMBERS.peel.long, NUMBERS.peel.short]);
    expect(peelOf(first.a, first.b)).toMatchObject({ q: 2, r: 175 });
    expect(first.candidates).toContain(NUMBERS.peel.plank);
    for (const { a, b, candidates } of PEEL_INQUIRY.rounds) {
      expect(a > b && a % b > 0).toBe(true);
      const f = candidates.map((d) => fitsRow(a, b, d));
      expect(
        f.some((x) => x.a && !x.b && !x.r),
        `${a} ${b}`,
      ).toBe(true);
      expect(
        f.some((x) => !x.a && x.b && !x.r),
        `${a} ${b}`,
      ).toBe(true);
      expect(f.some((x) => x.a && x.b)).toBe(true);
      // the first plank asked does not give the answer away: it fills both, and the second fills one only
      expect(f[0].a && f[0].b).toBe(true);
      expect(f[1].a && f[1].b).toBe(false);
    }
  });

  it('PEEL: of the five claims his table allows, exactly ONE holds — and it is the rule the forge expects', () => {
    const claims = [
      { cols: [], link: 'and' },
      { cols: ['a'], link: 'and' },
      { cols: ['b'], link: 'and' },
      { cols: ['a', 'b'], link: 'or' },
      { cols: ['a', 'b'], link: 'and' },
    ];
    const ok = claims.filter((c) => judgePeelClaim(PEEL_INQUIRY.rounds, c).ok);
    expect(ok).toEqual([{ cols: ['a', 'b'], link: 'and' }]);
    for (const c of claims.slice(1, 4))
      expect(judgePeelClaim(PEEL_INQUIRY.rounds, c).intruders.length).toBeGreaterThan(0);
    const F = FORGES['baqi-qisma'];
    // the accepted claim — the only one the screen lets him seal — is the rule the forge writes on his tablet
    const { rule } = F.fromInquiry({ rounds: [], claim: ok[0] });
    expect(F.isTheRule(rule)).toBe(true);
    expect(F.ruleText(rule)).toContain('الهوّة والجسر معًا');
    expect(F.ruleText(rule)).toContain(PEEL_INQUIRY.text.claimThen.replace('.', ''));
  });

  it('PEEL and STACK: a count is agreed with what it counts — one, two, three to ten, eleven and more', () => {
    const T = PEEL_INQUIRY.text;
    const judgeOf = (n, list = 'intruders') => ({
      intruders: [],
      taken: [],
      [list]: Array.from({ length: n }, (_, i) => ({ d: i + 2 })),
    });
    expect(T.claimFact(judgeOf(1))).toMatch(/^لوح أخذته جملتك لا يملأ القطعة/);
    expect(T.claimFact(judgeOf(2))).toMatch(/^لوحان أخذتهما جملتك لا يملآن القطعة/);
    expect(T.claimFact(judgeOf(3))).toMatch(/^3 ألواح أخذتها جملتك لا تملأ القطعة/);
    expect(T.claimFact(judgeOf(11))).toMatch(/^11 لوحًا أخذتها جملتك لا تملأ القطعة/);
    expect(T.claimOk(judgeOf(2, 'taken'))).toMatch(/^لوحان أخذتهما جملتك، وكلاهما/);
    expect(T.claimOk(judgeOf(4, 'taken'))).toMatch(/^4 ألواح أخذتها جملتك، وكلّها/);
    // the claim « the gap alone » of THIS table takes in exactly two planks that leave the piece: the dual is said
    const alone = judgePeelClaim(PEEL_INQUIRY.rounds, { cols: ['a'], link: 'and' });
    expect(alone.intruders.map((f) => f.d)).toEqual([21, 5]);
    expect(T.claimFact(alone)).toContain('لوحان أخذتهما جملتك لا يملآن القطعة الباقية: 21 و 5');
    expect(JSON.stringify([1, 2, 3, 11].map((n) => T.claimFact(judgeOf(n))))).not.toMatch(/\b2 ألواح/);
    // the copies he glues are the object of « نلصق »: « نسختين », never « نسختان »
    const S = STACK_INQUIRY.text;
    expect(S.ask({ d: 6, base: 18, k: 2 })).toContain('نلصق نسختين من الهوّة 18');
    expect(S.ask({ d: 6, base: 18, k: 3 })).toContain('نلصق 3 نسخ من');
    expect(S.ask({ d: 6, base: 18, k: 100 })).toContain('نلصق 100 نسخة من');
    // two planks are « لوحان طولهما », and the cells left agree too
    const J = JOIN_INQUIRY.text;
    const cut = { op: 'diff', a: 35, b: 21, d: 7, ...joinOf(7, 35, 21, 'diff') };
    expect(J.seen(cut, null)).toContain('لوحان طولهما 7، ولا خانة باقية');
    const short = { op: 'diff', a: 40, b: 21, d: 7, ...joinOf(7, 40, 21, 'diff') };
    expect(J.seen(short, null)).toContain('لوحان طولهما 7، وبقيت 5 خانات');
    const two = { op: 'sum', a: 21, b: 30, d: 7, ...joinOf(7, 21, 30, 'sum') };
    expect(J.seen(two, null)).toContain('7 ألواح طولها 7، وبقيت خانتان');
  });

  it('PEEL: every sentence says what the table did, and none states the rule', () => {
    const T = PEEL_INQUIRY.text;
    const lines = [T.goal, T.yes, T.no, T.next, T.nextRound, T.toClaim, T.claimLead, T.claimAsk, T.seal];
    PEEL_INQUIRY.rounds.forEach(({ a, b, candidates }, ri) => {
      const { q, r } = peelOf(a, b);
      lines.push(T.lead(a, b, ri), T.peelBtn(b), T.peeling(a, b), T.piece(r));
      for (const d of candidates) {
        const f = fitsRow(a, b, d);
        const row = { a, b, d, q, r, fitsA: f.a, fitsB: f.b, fitsR: f.r };
        lines.push(T.ask(row), T.shown(row, true), T.shown(row, false));
      }
    });
    for (const claim of [
      { cols: ['a'], link: 'and' },
      { cols: ['b'], link: 'and' },
      { cols: ['a', 'b'], link: 'or' },
    ])
      lines.push(T.claimFact(judgePeelClaim(PEEL_INQUIRY.rounds, claim)));
    lines.push(T.claimOk(judgePeelClaim(PEEL_INQUIRY.rounds, { cols: ['a', 'b'], link: 'and' })));
    noRule(lines, /معًا|يقسم|قاسم|دائمًا/);
    for (const x of [
      T.claimIf,
      T.claimThen,
      T.colLabel.a,
      T.colLabel.b,
      T.link.and,
      T.link.or,
      ...Object.values(T.cols),
    ])
      expect(typeof x).toBe('string');
  });

  it('LETTERS: every true line holds on every number, every false card is refuted by a sample the world shows', () => {
    const { cards, samples, order, statement, numbers } = LETTERS_INQUIRY;
    const many = [];
    for (let d = 1; d <= 12; d += 1)
      for (let x = 1; x <= 9; x += 1) for (let y = 1; y <= 9; y += 1) many.push({ d, a: d * x, b: d * y });
    for (const c of cards.filter((x) => x.ok)) {
      expect(refuteCard(c, many), c.id).toBe(null);
      expect(refuteCard(c, samples), c.id).toBe(null);
    }
    for (const c of cards.filter((x) => !x.ok)) {
      const s = refuteCard(c, samples);
      expect(s, c.id).not.toBe(null);
      expect(s.hide, `${c.id}: refuted by numbers he can see`).toBeUndefined();
      said(c.why(s));
      said(c.tex);
    }
    expect(cards.filter((x) => !x.ok).length).toBeGreaterThanOrEqual(3);
    expect([...order].sort()).toEqual(
      cards
        .filter((x) => x.ok)
        .map((x) => x.id)
        .sort(),
    );
    expect(checkProofOrder(cards, order, statement.gives).ok).toBe(true);
    // a line placed too early is stopped by what it uses
    expect(checkProofOrder(cards, ['ka', 'sum'], statement.gives)).toMatchObject({ ok: false, missing: ["k'"] });
    // the numbers: d divides a and b in every sample; the pressed number is on the chips
    for (const s of samples) {
      expect(s.a % s.d === 0 && s.b % s.d === 0).toBe(true);
      const q = numbers.value(s) / numbers.by(s);
      expect(Number.isInteger(q) && q >= 1 && q <= numbers.max).toBe(true);
    }
    expect(samples.at(-1).hide).toBe('b');
    expect(samples.slice(0, -1).every((s) => !s.hide)).toBe(true);
    expect(samples[0]).toEqual({ d: NUMBERS.join.plank, a: NUMBERS.join.gaps[0], b: NUMBERS.join.gaps[1] });
  });

  it('LETTERS: every sentence is said, and none states how to prove', () => {
    const T = LETTERS_INQUIRY.text;
    const { samples } = LETTERS_INQUIRY;
    const lines = [T.lead, T.goal, T.nextSample, T.toCards, T.cardsLead, T.cardsAsk, T.givenLabel, T.goalLabel];
    lines.push(T.proved, T.done);
    samples.forEach((v, i) => {
      const q = (v.a + v.b) / v.d;
      lines.push(T.numbersAsk(v), T.numbersOk(v, q), T.numbersMiss(v, q + 1), T.line(v, q));
      if (i > 0) lines.push(T.carry(v, samples[i - 1], (samples[i - 1].a + samples[i - 1].b) / samples[i - 1].d));
    });
    lines.push(T.hidden(samples[2], samples[1], 12), T.hidden(samples[2], null, null));
    // …nor does what stands around the experiment: the name of its island, the title and the words of its mirror
    const island = STORY.islands.find((i) => i.feature === 'stone');
    const M = FORGES.burhan.text;
    lines.push(island.name, M.title, M.sub, M.log, STORY.text.say.h, STORY.text.quiz.harbour.prompt);
    expect(M.title).toContain(island.name);
    noRule(lines, /حروف|حرف|بالحروف|تبرهن|برهان|يكفي|عدد طبيعي/);
    // the word comes with the tablet, once he has assembled the proof
    expect(TABLETS.burhan.lines.join(' ')).toContain('بحروف');
    // ONE pair of letters, from the cards to the tablet: k and k′ — and q stays the quotient of the tablet before
    const cardsText = LETTERS_INQUIRY.cards.map((c) => c.tex).join(' ');
    expect(cardsText).toContain("k'");
    expect(cardsText).not.toMatch(/[pq]/);
    expect(TABLETS.burhan.math.join(' ')).toContain("a = d \\times k \\qquad b = d \\times k'");
    expect(TABLETS.burhan.math.join(' ')).not.toMatch(/[pq](?![a-z])/);
    expect(TABLETS['baqi-qisma'].lines.join(' ')).toContain('b \\times q');
    expect(FORGES.burhan.text.tryKey({ d: 5, k: 8, k2: 11 })).toContain("$k' = 11$");
    said(T.needs(LETTERS_INQUIRY.cards[2], ["k'"]));
    expect(T.needs(LETTERS_INQUIRY.cards[3], ['dk+dk'])).toContain('\\times');
  });
});
