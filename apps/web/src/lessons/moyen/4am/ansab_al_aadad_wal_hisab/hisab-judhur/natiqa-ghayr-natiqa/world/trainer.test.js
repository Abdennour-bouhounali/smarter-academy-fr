import { describe, it, expect } from 'vitest';
import { describeTrainer, plain, said } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { answerLabel, AVOID, check, PLAN_OF, POOLS, solution, trainer } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { above, calculator, cut, read, rootOf, rounded, sq, write } from './math';
import { COURTS, MISSION } from './story';

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM_KINDS = ['jidhr', 'dil', 'murabbaQima', 'tadwir', 'qiyam'];

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

const all = (seeds = 30) =>
  CARDS.flatMap((card) =>
    Array.from({ length: seeds }, (_, s) => trainer.makeSession(rng((s + 1) * 7907 + card.length), card)).flat(),
  );
const isBox = (t) => Boolean(t && typeof t === 'object' && (t.num || t.choice));
const isFrac = (t) => Boolean(t?.frac && typeof t.frac === 'object');
const arabic = (t) => typeof t === 'string' && /[؀-ۿ]/.test(t);

/** The bank's radicands, as the world writes numbers. */
function bankRadicands() {
  const out = new Set();
  for (const { text } of readBank('natiqa-ghayr-natiqa').sheets) {
    for (const [, x] of text.matchAll(/sqrt\{(\d+(?:\{,\}\d+)?)\}/g)) out.add(write(x.replace('{,}', ',')));
    for (const [, p, q] of text.matchAll(/sqrt\{\\\\dfrac\{(\d+)\}\{(\d+)\}\}/g)) out.add(write(`${p}/${q}`));
  }
  return out;
}

describe('« تدرّب » of « الأعداد الناطقة والأعداد غير الناطقة » — the lesson’s own', () => {
  it('no headline number of an exam question is a radicand of the bank, a court of the story or of the mission', () => {
    const bank = bankRadicands();
    expect(bank.size).toBeGreaterThan(40);
    const story = new Set([...Object.values(COURTS), MISSION.exact, MISSION.none].map((x) => write(x)));
    const ours = [
      ...POOLS.jidhr.dec.map(sq),
      ...POOLS.jidhr.frac.map(([p, q]) => write(`${p * p}/${q * q}`)),
      ...POOLS.dil.flatMap((c) => c.roots.map(sq)),
    ];
    for (const x of ours) expect(bank.has(write(x)), x).toBe(false);
    for (const q of all(10)) {
      if (['murabbaQima', 'tadwir', 'qiyam'].includes(q.kind)) {
        expect(bank.has(String(q.a)), `${q.kind} ${q.a}`).toBe(false);
        expect(story.has(String(q.a)), `${q.kind} ${q.a}`).toBe(false);
        expect(AVOID.has(q.a)).toBe(false);
      }
    }
  });

  it('every answer of every exam question is computed here, from the numbers the question shows', () => {
    const seen = new Set();
    const dec = (i, d) => write(read(`${i},${d}`));
    for (const q of all()) {
      if (q.format !== 'exam' || q.kind === 'tf') continue;
      seen.add(q.kind);
      const v = solution(q);
      switch (q.kind) {
        case 'jidhr':
        case 'dil': {
          const typed = q.shape === 'frac' ? `${v.n}/${v.d}` : dec(v.i, v.d);
          expect(write(sq(typed)), q.prompt).toBe(write(q.a));
          if (q.shape === 'frac') expect(write(`${q.shown[0]}/${q.shown[1]}`)).toBe(write(q.a));
          break;
        }
        case 'murabbaQima':
          expect(q.shows).toBe(calculator(String(q.a)));
          expect(q.shows.startsWith(q.x), `${q.shows} ${q.x}`).toBe(true);
          expect(dec(v.i, v.d)).toBe(sq(q.x));
          break;
        case 'tadwir': {
          const [lo, r] = [dec(v.i1, v.d1), dec(v.i2, v.d2)];
          expect(lo).toBe(cut(String(q.a), 1));
          expect(r).toBe(rounded(String(q.a), 1));
          expect(q.prompt).toContain(`$${q.n} < \\sqrt{${q.a}} < ${q.n + 1}$`);
          expect(q.n ** 2 < q.a && q.a < (q.n + 1) ** 2).toBe(true);
          break;
        }
        case 'qiyam': {
          const a = String(q.a);
          expect(q.shows.startsWith(cut(a, 2))).toBe(true);
          expect([dec(v.i1, v.d1), dec(v.i2, v.d2), dec(v.i3, v.d3)]).toEqual([cut(a, 2), above(a, 2), rounded(a, 2)]);
          expect(q.a * 40000).toBeLessThanOrEqual(1000000); // the claim of the rounded value stays in the server's range
          break;
        }
        default:
      }
    }
    expect([...seen].sort()).toEqual([...EXAM_KINDS].sort());
  });

  it('both roundings are met: the rounded value is sometimes the lower mark, sometimes the upper one', () => {
    const qs = all(10).filter((q) => q.kind === 'tadwir' || q.kind === 'qiyam');
    const k = (q) => (q.kind === 'tadwir' ? 1 : 2);
    const up = qs.filter((q) => rounded(String(q.a), k(q)) !== cut(String(q.a), k(q)));
    expect(up.length).toBeGreaterThan(5);
    expect(qs.length - up.length).toBeGreaterThan(5);
  });

  it('each box is named by the words beside it; a typed decimal reads whole part, comma, decimals; words right of every box', () => {
    let decimals = 0;
    for (const q of all(10))
      for (const l of q.form?.lines ?? []) {
        for (const t of l.tokens) {
          if (typeof t === 'string') plain(t);
          if (isBox(t)) expect(t.label, q.kind).toBeTruthy();
        }
        expect(
          l.tokens.some((t) => arabic(t)),
          `${q.kind} ${JSON.stringify(l)}`,
        ).toBe(true);
        if (!l.ltr) {
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
        expect(firstWord, `${q.kind} ${JSON.stringify(v)}`).toBeGreaterThan(lastBox);
      }
    expect(decimals).toBeGreaterThan(50);
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
    }
    // what students really write, and what the hint says back
    const jidhr = { kind: 'jidhr', shape: 'dec', a: '3,24', r: '1,8' };
    expect(check(jidhr, { i: 0, d: '18' })).toMatchObject({
      ok: false,
      hint: '$0{,}18 \\times 0{,}18 = 0{,}0324$، وليس $3{,}24$.',
    });
    const frac = { kind: 'jidhr', shape: 'frac', a: '16/81', r: '4/9', shown: [32, 162] };
    expect(check(frac, { n: 32, d: 162 }).hint).toContain('وليس');
    expect(check(frac, { n: 8, d: 18 }).ok).toBe(true);
    const mq = { kind: 'murabbaQima', a: 21, x: cut('21', 2), shows: calculator('21') };
    expect(check(mq, { i: 21, d: '0' }).hint).toContain('الجذر نفسه');
    const td = { kind: 'tadwir', a: 23, n: 4 };
    expect(rounded('23', 1)).toBe('4,8');
    expect(check(td, { i1: 4, d1: '7', i2: 4, d2: '7' }).hint).toContain('منتصف');
    expect(check(td, { i1: 4, d1: '8', i2: 4, d2: '8' }).hint).toContain('لا تتجاوز');
    expect(check(td, { i1: 4, d1: '7', i2: 4, d2: '9' }).hint).toContain('المتجاورين');
  });

  it('true / false: the statement’s truth is computed; the right reason is the only one that proves it', () => {
    for (const q of all(10).filter((x) => x.kind === 'tf')) {
      const s = q.statement;
      const m1 = /^\$\\sqrt\{([\d{},]+)\} = ([\d{},]+)\$$/.exec(s);
      if (m1) {
        const [a, r] = [m1[1], m1[2]].map((x) => x.replace('{,}', ','));
        expect(write(sq(r)) === write(a), s).toBe(q.truth);
      }
      const m2 = /^العدد \$\\sqrt\{([\d{},]+)\}\$ عدد ناطق$/.exec(s);
      if (m2) expect(rootOf(m2[1].replace('{,}', ',')) !== null, s).toBe(q.truth);
      const m3 = /^مدوَّر \$\\sqrt\{(\d+)\}\$ إلى \$0\{,\}1\$ هو \$([\d{},]+)\$$/.exec(s);
      if (m3) expect(rounded(m3[1], 1) === m3[2].replace('{,}', ','), s).toBe(q.truth);
      if (/\\sqrt\{\d+\} = \d+\{,\}\d{6,}/.test(s)) expect(q.truth, s).toBe(false);
      if (q.reasons) expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      plain(q.why.replace(/\$[^$]*\$/g, ''));
    }
  });
});
