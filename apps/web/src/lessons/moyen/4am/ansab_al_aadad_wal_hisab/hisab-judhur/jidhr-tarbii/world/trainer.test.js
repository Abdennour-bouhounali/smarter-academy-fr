import { describe, it, expect } from 'vitest';
import { describeTrainer, plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { answerLabel, AVOID, check, PLAN_OF, POOLS, solution, trainer } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { calculator, read, rootOf, sq, wholeBelow, write } from './math';
import { USE1, USE2, USE3 } from './forges';
import { COURTS } from './story';

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM_KINDS = ['bila', 'of', 'dil', 'hasr', 'muqarraba', 'ihsib', 'ihsibFrac'];

describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['tap', 'tf', ...EXAM_KINDS],
});

/** Every question of every card, a few sessions each. */
const all = (seeds = 30) =>
  CARDS.flatMap((card) =>
    Array.from({ length: seeds }, (_, s) => trainer.makeSession(rng((s + 1) * 7907 + card.length), card)).flat(),
  );
const isBox = (t) => Boolean(t && typeof t === 'object' && (t.num || t.choice));
const isFrac = (t) => Boolean(t?.frac && typeof t.frac === 'object');
const arabic = (t) => typeof t === 'string' && /[؀-ۿ]/.test(t);

/** The bank's headline numbers: every radicand under √ and every area of its sheets, as the world writes numbers. */
function bankNumbers() {
  const out = new Set();
  for (const { text } of readBank('jidhr-tarbii').sheets) {
    for (const [, x] of text.matchAll(/sqrt\{(\d+(?:\{,\}\d+)?)\}/g)) out.add(write(x.replace('{,}', ',')));
    for (const [, p, q] of text.matchAll(/sqrt\{\\\\dfrac\{(\d+)\}\{(\d+)\}\}/g)) out.add(write(`${p}/${q}`));
    for (const [, x] of text.matchAll(/(\d+)\s*(?:m|cm)\^2/g)) out.add(write(x));
  }
  return out;
}

describe('« تدرّب » of « الجذر التربيعي لعدد موجب » — the lesson’s own', () => {
  it('the bank is read, and no headline number of an exam question is one of its radicands or areas', () => {
    const bank = bankNumbers();
    expect(bank.size).toBeGreaterThan(30);
    expect(bank.has('576')).toBe(true); // a plot of the bank: the reading works
    const ours = [
      ...POOLS.bila.whole.map((r) => sq(String(r))),
      ...POOLS.bila.dec.map(sq),
      ...POOLS.bila.frac.map(sq),
      ...POOLS.of.map((k) => sq(String(k))),
      ...POOLS.dil.flatMap((c) => c.roots.map((r) => sq(String(r)))),
      ...POOLS.ihsib.map((b) => sq(String(b))),
      ...POOLS.ihsib.map(String), // √((−b)²) shows b itself
      ...POOLS.ihsibFrac.dec,
      ...POOLS.ihsibFrac.frac.map(sq),
    ];
    for (const x of ours) expect(bank.has(write(x)), x).toBe(false);
    // the courts drawn at random: never a radicand of the bank, nor a number of the story or of the forges' last steps
    for (const q of all(10)) {
      for (const a of [q.a, q.x].filter(
        (v) => v != null && ['hasr', 'muqarraba', 'ihsib', 'ihsibFrac'].includes(q.kind),
      ))
        expect(bank.has(write(String(a))), `${q.kind} ${a}`).toBe(false);
      if (['hasr', 'muqarraba', 'ihsib'].includes(q.kind)) expect(AVOID.has(q.a), `${q.kind} ${q.a}`).toBe(false);
    }
    const forges = [...USE1, ...USE2.flat(), ...USE3.flatMap((u) => [u.wall, u.rod, u.walk])];
    for (const x of ours) expect(forges.map(String), x).not.toContain(write(x));
    for (const x of Object.values(COURTS)) expect(ours, x).not.toContain(x);
  });

  it('every answer of every exam question is computed here, from the numbers the question shows', () => {
    const seen = new Set();
    for (const q of all()) {
      if (q.format !== 'exam' || q.kind === 'tf') continue;
      seen.add(q.kind);
      const v = solution(q);
      switch (q.kind) {
        case 'bila': {
          const typed = q.shape === 'whole' ? String(v.r) : q.shape === 'dec' ? `${v.i},${v.d}` : `${v.n}/${v.d}`;
          expect(write(sq(typed)), q.prompt).toBe(write(q.a));
          expect(read(typed).n > 0n).toBe(true);
          expect(q.prompt).toContain(`\\sqrt{`);
          break;
        }
        case 'of':
          expect(v.a).toBe(q.k * q.k);
          expect(q.prompt).toContain(`$${q.k}$`);
          break;
        case 'dil':
          expect(v.s * v.s).toBe(q.a);
          expect(q.prompt).toContain(`$${q.a}$`);
          break;
        case 'hasr':
          expect(v.lo * v.lo < q.a && q.a < v.hi * v.hi && v.hi === v.lo + 1, q.prompt).toBe(true);
          break;
        case 'muqarraba': {
          const lo = read(`${v.i1},${v.d1}`);
          const hi = read(`${v.i2},${v.d2}`);
          // lo² < a < hi², hi = lo + 0,01, and the calculator's display lies between them
          expect(lo.n * lo.n * 1n < BigInt(q.a) * lo.d * lo.d, q.prompt).toBe(true);
          expect(hi.n * hi.n > BigInt(q.a) * hi.d * hi.d, q.prompt).toBe(true);
          expect(write({ n: hi.n * lo.d - lo.n * hi.d, d: hi.d * lo.d })).toBe('0,01');
          expect(q.shows).toBe(calculator(String(q.a)));
          expect(q.shows.startsWith(`${v.i1},${v.d1}`), `${q.shows} ${v.i1},${v.d1}`).toBe(true);
          expect(q.a).toBeLessThanOrEqual(100); // a × 10^4 ≤ 10^6: the claim's limit
          break;
        }
        case 'ihsib':
          expect(rootOf(String(q.a))).toBe(null);
          expect([v.A, v.B]).toEqual([q.a, q.b]);
          expect(q.prompt).toContain(q.neg ? `(-${q.b})^2` : `${q.b}^2`);
          break;
        case 'ihsibFrac':
          expect(`${v.i},${v.d}`).toBe(q.x);
          expect(write(`${v.n}/${v.dn}`)).toBe(write(q.f));
          break;
        default:
      }
    }
    expect([...seen].sort()).toEqual([...EXAM_KINDS].sort());
  });

  it('each box is named by the words beside it; a typed decimal reads whole part, comma, decimals; no word between boxes of a LTR line', () => {
    let decimals = 0;
    for (const q of all(10))
      for (const l of q.form?.lines ?? []) {
        for (const t of l.tokens) {
          if (typeof t === 'string') plain(t);
          if (isBox(t)) expect(t.label, q.kind).toBeTruthy();
        }
        // the words of a line name its boxes (or it is « A = » / « B = », named by the statement)
        expect(
          l.tokens.some((t) => arabic(t)) || l.tokens.some((t) => t === 'A' || t === 'B'),
          `${q.kind} ${JSON.stringify(l)}`,
        ).toBe(true);
        if (!l.ltr) {
          // a right-to-left line has no decimal typed in it (the kit lays no left-to-right island inside one)
          expect(l.tokens.includes(','), q.kind).toBe(false);
          continue;
        }
        const v = l.tokens;
        v.forEach((t, k) => {
          if (t !== ',' || !isBox(v[k - 1]) || !isBox(v[k + 1])) return;
          decimals += 1;
          expect([v[k - 1].label, v[k + 1].label], q.kind).toEqual(['الوحدات', 'الجزء العشري']);
        });
        const lastBox = v.reduce((at, t, k) => (isBox(t) || isFrac(t) ? k : at), -1);
        const firstWord = v.findIndex(arabic);
        if (firstWord >= 0) expect(firstWord, `${q.kind} ${JSON.stringify(v)}`).toBeGreaterThan(lastBox);
      }
    expect(decimals).toBeGreaterThan(50);
  });

  it('a typed fraction is the kit’s template (numerator over a real bar), named البسط / المقام; a given one is printed whole', () => {
    let typed = 0;
    for (const q of all(10))
      for (const l of q.form?.lines ?? [])
        for (const t of l.tokens.filter(isFrac)) {
          if (isBox(t.frac.n)) {
            typed += 1;
            expect([t.frac.n.label, t.frac.d.label]).toEqual(['البسط', 'المقام']);
          } else expect(Number.isInteger(t.frac.n) && Number.isInteger(t.frac.d)).toBe(true);
        }
    expect(typed).toBeGreaterThan(20);
  });

  it('a hint says what HIS answer gives, never the answer; no sentence says « wrong »', () => {
    for (const q of all(8)) {
      const right = solution(q);
      const res = check(q, right);
      for (const s of [q.prompt, res.fix, answerLabel(q, right)]) {
        said(s);
        expect(s).not.toMatch(/خطأ|خاطئ|غلط/);
      }
      if (q.kind === 'tap' || q.kind === 'tf') continue;
      const bad = check(q, {});
      expect(bad.ok).toBe(false);
      expect(bad.hint).not.toMatch(/خطأ|خاطئ|غلط/);
      // a one-box answer off by one: the hint never writes the answer itself
      const one = { of: 'a', dil: 's', bila: q.shape === 'whole' ? 'r' : null }[q.kind];
      if (one) {
        const near = check(q, { [one]: right[one] + 1 });
        expect(near.ok).toBe(false);
        expect(near.hint, q.prompt).not.toContain(`$${right[one]}$`);
      }
    }
    // three answers students really write, and what the hint says back
    const bila = { kind: 'bila', shape: 'whole', a: '324', r: '18' };
    expect(check(bila, { r: 162 })).toMatchObject({ ok: false, hint: '$162 \\times 162 = 26244$، وليس $324$.' });
    const of = { kind: 'of', k: 19 };
    expect(check(of, { a: 38 }).hint).toContain('ضعف');
    expect(check(of, { a: 38 }).hint).not.toContain('361');
    const hasr = { kind: 'hasr', a: 140, n: wholeBelow('140') };
    expect(hasr.n).toBe(11);
    expect(check(hasr, { lo: 12, hi: 13 }).hint).toContain('أكبر من $140$');
    expect(check(hasr, { lo: 10, hi: 11 }).hint).toContain('ما زال أصغر من $140$');
    expect(check(hasr, { lo: 11, hi: 13 }).hint).toContain('متتاليان');
  });

  it('« القيمتان المقرّبتان »: by default is the display cut to 0,01, by excess the next hundredth — never the rounding', () => {
    const q = trainer.makeSession(rng(4), 'hasr').find((x) => x.kind === 'muqarraba') ?? {
      kind: 'muqarraba',
      a: 85,
      shows: calculator('85'),
      lo: wholeBelow('850000'),
    };
    const v = solution(q);
    expect(check(q, v).ok).toBe(true);
    // 85: the display 9,219544457 — 9,21 by default, 9,22 by excess (rounding would give 9,22 for both)
    const r = { kind: 'muqarraba', a: 85, shows: calculator('85'), lo: wholeBelow('850000') };
    expect(r.shows).toBe('9,219544457');
    expect(solution(r)).toEqual({ i1: 9, d1: '21', i2: 9, d2: '22' });
    expect(check(r, { i1: 9, d1: '22', i2: 9, d2: '23' }).ok).toBe(false);
    expect(check(r, { i1: 9, d1: '219', i2: 9, d2: '22' }).hint).toContain('بمنزلتين');
    expect(check(r, { i1: 9, d1: '210', i2: 9, d2: '220' }).ok).toBe(true); // 9,210 is 9,21
  });

  it('true / false: the statement’s truth is computed; the right reason is the only one that proves it', () => {
    for (const q of all(10).filter((x) => x.kind === 'tf')) {
      const s = q.statement;
      const m1 = /^\$\\sqrt\{(\d+)\} = (\d+)\$$/.exec(s);
      if (m1) expect(Number(m1[2]) ** 2 === Number(m1[1]), s).toBe(q.truth);
      const m2 = /^\$(\d+) < \\sqrt\{(\d+)\} < (\d+)\$$/.exec(s);
      if (m2) expect(Number(m2[1]) ** 2 < Number(m2[2]) && Number(m2[2]) < Number(m2[3]) ** 2, s).toBe(q.truth);
      const m3 = /^\$\(\\sqrt\{(\d+)\}\)\^2 = (\d+)\$$/.exec(s);
      if (m3) expect(m3[1] === m3[2], s).toBe(q.truth);
      if (/\\sqrt\{\(-\d+\)\^2\} = -\d+/.test(s) || /^العدد \$-\d+\$/.test(s) || /\{,\}/.test(s))
        expect(q.truth, s).toBe(false);
      expect(Boolean(m1 || m2 || m3) || q.truth === false, s).toBe(true);
      if (q.reasons) expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      plain(q.why.replace(/\$[^$]*\$/g, ''));
    }
  });
});
