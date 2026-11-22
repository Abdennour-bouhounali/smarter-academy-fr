import { describe, it, expect } from 'vitest';
import { nestOf } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { dealOf, dealsThatWork, mostLots } from '../../../../../../common/gameworld/divisorIsles/deal';
import { DEAL_INQUIRY, NEST_INQUIRY, inVases } from './inquiries';
import { FORGES } from './forges';
import { KEYS } from './journey';
import { NUMBERS, STORY } from './story';

const said = (x) => expect(String(x)).not.toMatch(/undefined|NaN|null|\[object/);
/** Every sentence of an experiment is said, and none states the rule it leads to. */
const noRule = (lines, words) => {
  for (const line of lines) {
    said(line);
    expect(line, line).not.toMatch(words);
  }
};
/** A label drawn as plain text (SVG, a shelf, a column head): no formula. */
const plain = (x) => {
  said(x);
  expect(x, x).not.toMatch(/\$|\\/);
};
/** The words of each key's rule — none may be said by its experiment (the question it opens may name what it seeks). */
const RULE_WORDS = {
  // the islands A–B say what the planks did on the two gaps: the NAME of what is found comes with the tablet
  'qawasim-mushtaraka': /مشترك|قاسم|قواسم|PGCD|أطول|الأكبر|دائمًا/,
  // the islands C–D: the purse and what each plank costs — neither the name nor « the longest »
  'al-akbar': /PGCD|القاسم المشترك الأكبر|الأكبر|مشترك|أطول|يكفي|لا داعي|لا حاجة|نتوقّف|توقّف|دائمًا/,
  // the vases: not a word of divisors
  'baqat-mutamathila': /قاسم|قواسم|مشترك|يقسم|PGCD|الأكبر|دائمًا/,
  // the planks of the longest: never « divisors », never « the same », never « exactly »
  'qawasim-al-pgcd': /قاسم|قواسم|مشترك|بالضبط|نفسها|هي نفس|تساوي|دائمًا/,
};
/** The (kind, mode) of an experiment: two keys of the lesson never share one. */
const kindOf = (spec) =>
  `${spec.kind}:${spec.mode ?? spec.rounds?.[0]?.mode ?? ''}:${spec.crown === false ? 'nocrown' : ''}`;

describe('the four experiments of « القاسم المشترك الأكبر » — each rule found by an experiment of its own', () => {
  it('keys 1 and 2 are found ON THE ISLANDS (two convoys of their own); keys 3 and 4 on experiments of their own kind', () => {
    const [k1, k2, ...rest] = KEYS;
    // no « استكشف » screen for the first two: the forge opens on predictions, then tiles (owner, 2026-11-19)
    for (const k of [k1, k2]) expect(FORGES[k].inquiry, k).toBeUndefined();
    const specs = rest.map((k) => FORGES[k].inquiry);
    expect(specs.map((s) => s.kind)).toEqual(['deal', 'nest']);
    expect(new Set(specs.map(kindOf)).size).toBe(rest.length);
    expect([DEAL_INQUIRY, NEST_INQUIRY]).toEqual(specs);
    for (const s of specs) expect(s.writes, s.kind).toBeUndefined();
    // the two convoys are not the same experiment: the first has no purse and its planks differ on the gaps; the
    // second has a purse and every plank of its island fills both gaps
    const convoy = (id) => STORY.segments.filter((s) => s.convoy === id);
    const [t1, t2] = convoy('twins');
    const [c1, c2] = convoy('crown');
    expect(STORY.convoys.twins).toBeUndefined();
    expect(STORY.convoys.crown.purse).toBe(NUMBERS.second.purse);
    const shape = (d) => `${t1.a % d === 0}:${t2.a % d === 0}`;
    expect(new Set(t1.moulds.map(shape)).size).toBe(4); // neither, the first only, the second only, both
    for (const d of c1.moulds) expect(c1.a % d === 0 && c2.a % d === 0, `${d}`).toBe(true);
  });

  it('the islands of keys 1 and 2: every sentence says what the planks did, and none states the rule nor names it', () => {
    const { say: S, objective: O, recall: R } = STORY.text;
    const [W1, W2] = NUMBERS.twin.gaps;
    const [S1, S2] = NUMBERS.second.gaps;
    const twins = [S.hello, S.b234, O.twins, R.ahead(W2)];
    for (const b of NUMBERS.twin.moulds) {
      twins.push(O.tail(W2, b));
      // what is said of a bridge that holds: only with a plank that fills it
      if (W1 % b === 0) twins.push(S.first(b), R.first(W1, b));
      if (W2 % b === 0) twins.push(S.twinOk(b));
      twins.push(R.twin(b, [{ a: W1, fills: W1 % b === 0 }]));
      twins.push(
        R.twin(
          b,
          [W1, W2].map((a) => ({ a, fills: a % b === 0 })),
        ),
      );
    }
    noRule(twins, RULE_WORDS['qawasim-mushtaraka']);
    const crown = [S.pairs, S.d322, O.crown];
    for (const b of NUMBERS.second.moulds)
      crown.push(S.secondFirst(b), S.secondOk(b), O.tailPurse(S2, b), R.first(S1, b), R.crown(b, (S1 + S2) / b));
    crown.push(R.paid(38, 4), R.paid(19, 23));
    noRule(crown, RULE_WORDS['al-akbar']);
  });

  it('DEAL: 40 roses and 56 lilies — numbers of vases that leave roses only, lilies only, both, and 8 among them', () => {
    const { a, b, choices, minTries } = DEAL_INQUIRY;
    expect([a.n, b.n]).toEqual([NUMBERS.bouquets.roses, NUMBERS.bouquets.lilies]);
    expect(dealsThatWork(a.n, b.n)).toEqual([1, 2, 4, 8]);
    expect(mostLots(a.n, b.n)).toEqual({ k: 8, x: 5, y: 7 });
    expect(choices).toContain(8);
    expect(Math.max(...choices)).toBeLessThanOrEqual(12);
    const deals = choices.map((k) => dealOf(a.n, b.n, k));
    expect(deals.some((d) => d.rA > 0 && d.rB === 0)).toBe(true); // roses left only (7)
    expect(deals.some((d) => d.rA === 0 && d.rB > 0)).toBe(true); // lilies left only (5, 10)
    expect(deals.some((d) => d.rA > 0 && d.rB > 0)).toBe(true); // both left (3, 6, 12)
    expect(deals.filter((d) => d.ok).map((d) => d.k)).toEqual([2, 4, 8]);
    expect(minTries).toBe(4);
  });

  it('DEAL: every sentence says what the vases hold and what is left — never a word of divisors', () => {
    const T = DEAL_INQUIRY.text;
    const { a, b } = DEAL_INQUIRY;
    const lines = [
      T.lead(a, b),
      T.goal(a, b),
      T.toAnswer,
      T.back,
      T.check,
      T.answerLead({ a, b }),
      T.yes,
      T.no,
      T.done,
    ];
    lines.push(T.lotsUnit, T.unitA, T.unitB, ...Object.values(T.cols), T.bound({ max: 12 }));
    for (const tried of [0, 3]) lines.push(T.choose({ a, b, tried }));
    for (const k of [1, ...DEAL_INQUIRY.choices]) {
      const d = dealOf(a.n, b.n, k);
      const row = { k, qA: d.qA, qB: d.qB, restA: d.rA, restB: d.rB, ok: d.ok };
      lines.push(T.ask({ a, b, k }));
      for (const guess of [true, false, null]) lines.push(T.dealt({ a, b, ...row, guess }));
      lines.push(T.again({ a, b, ...row }));
      lines.push(T.miss({ a, b, kind: 'deal', said: { k, x: 3, y: 3 }, row }));
    }
    const row8 = { k: 8, qA: 5, qB: 7, restA: 0, restB: 0, ok: true };
    lines.push(T.miss({ a, b, kind: 'bigger', said: { k: 4, x: 10, y: 14 }, row: row8 }));
    lines.push(T.miss({ a, b, kind: 'open', said: { k: 4, x: 10, y: 14 }, row: null }));
    lines.push(T.ok({ a, b, said: { k: 8, x: 5, y: 7 } }));
    noRule(lines, RULE_WORDS['baqat-mutamathila']);
    for (const x of [T.goal(a, b), T.lotsUnit, T.unitA, T.unitB, ...Object.values(T.cols)]) plain(x);
    // the open miss never gives the answer; a deal says what is left, agreed
    expect(T.miss({ a, b, kind: 'open', said: { k: 4, x: 10, y: 14 }, row: null })).not.toMatch(/\d/);
    expect(T.dealt({ a, b, k: 6, qA: 6, qB: 9, restA: 4, restB: 2, ok: false, guess: false })).toContain(
      'وبقي على الطاولة 4 ورود و زنبقتان',
    );
    expect(T.dealt({ a, b, k: 2, qA: 20, qB: 28, restA: 0, restB: 0, ok: true, guess: true })).toMatch(
      /^مزهريتان: في كلّ واحدة 20 وردة و 28 زنبقة، ولم تبقَ أيّ زهرة\. كما توقّعت!$/,
    );
    expect(inVases(2)).toBe('مزهريتين');
    expect(inVases(12)).toBe('12 مزهرية');
  });

  it('NEST: 228 and 276, their longest common plank 12 given — planks of 12, of one gap only, longer, and 8', () => {
    const [round] = NEST_INQUIRY.rounds;
    expect([round.a, round.b]).toEqual([NUMBERS.baskets.dates, NUMBERS.baskets.figs]);
    const n = nestOf(round.a, round.b, round.probes);
    expect(n.g).toBe(NUMBERS.baskets.plank);
    expect(n.equal).toBe(true);
    const kinds = n.rows.map((r) => ({
      ...r,
      a: round.a % r.p === 0,
      b: round.b % r.p === 0,
    }));
    expect(kinds.filter((r) => r.inG).length).toBeGreaterThanOrEqual(3); // planks of 12
    expect(kinds.some((r) => r.a !== r.b)).toBe(true); // a plank of one gap only
    expect(kinds.some((r) => r.p > n.g && !r.a && !r.b)).toBe(true); // longer than 12, of neither
    expect(kinds.some((r) => r.p < n.g && !r.inG)).toBe(true); // under 12, not a plank of it
    for (const r of kinds) expect(r.inG).toBe(r.both); // the fact the experiment shows, probe by probe
    // the first probe is a plank of both, the second is not: the first answer does not give the pattern away
    expect([kinds[0].both, kinds[1].both]).toEqual([true, false]);
    // the stone's question came first: its baskets that work are planks of 12
    for (const k of STORY.text.quiz.baskets.answer) expect(n.g % k).toBe(0);
  });

  it('NEST: every sentence says what the planks did on the three gaps — never « divisors » nor « the same »', () => {
    const T = NEST_INQUIRY.text;
    const lines = [T.yes, T.no, T.next, T.done];
    for (const { a, b, probes } of NEST_INQUIRY.rounds) {
      const n = nestOf(a, b, probes);
      lines.push(T.lead(a, b), T.goal(a, b), T.divisorsLabel(n.g), T.commonLabel(a, b), T.compare({ a, b, ...n }));
      for (const r of n.rows) {
        const f = { a, b, g: n.g, ...r, holdsA: a % r.p === 0, holdsB: b % r.p === 0 };
        lines.push(T.ask(f));
        for (const guess of [true, false]) lines.push(T.seen({ ...f, guess }, guess), T.foundLine({ ...f, guess }));
      }
    }
    noRule(lines, RULE_WORDS['qawasim-al-pgcd']);
    for (const x of [T.goal(228, 276), T.divisorsLabel(12), T.commonLabel(228, 276)]) plain(x);
    // the notation, which 👑 has given, names the longest plank
    expect(T.given({ a: 228, b: 276, g: 12 })).toBe('$\\mathrm{PGCD}(228 ; 276) = 12$');
  });
});
