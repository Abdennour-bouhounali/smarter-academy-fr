import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { estimateSteps, bracketOf, bracketSays } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { FORGES } from './forges';
import { ESTIMATE_INQUIRY, BRACKET_INQUIRY } from './inquiries';
import { KNOWLEDGE } from './knowledge';
import { STORY, TABLETS } from './story';
import { check, solution, trainer } from './trainer';
import { SCRIPT } from '../board/script';
import { MEMO } from '../board/memo';

/**
 * Every formula the lesson writes COMPILES (KaTeX strict, as the screen renders it) and is written in LaTeX: a string of
 * the lesson takes two backslashes in its source, so a lost one (« \times » read as a tab and « imes ») is caught here.
 */
const compiles = (tex, where) =>
  expect(() => katex.renderToString(tex, { throwOnError: true, strict: 'error' }), `${where}: ${tex}`).not.toThrow();
const inline = (text) => [...String(text).matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const strings = (x, out = []) => {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => strings(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => strings(y, out));
  return out;
};
/** A text that goes through MathText: its dollars pair up, each formula compiles, no control character slipped in. */
function wellWritten(text, where) {
  const s = String(text);
  // « \t », « \f » … : a command that lost one of its two backslashes became a control character
  // eslint-disable-next-line no-control-regex
  expect(s, where).not.toMatch(/[\u0000-\u0009\u000b-\u001f]/);
  expect((s.match(/\$/g) ?? []).length % 2, `${where}: ${s}`).toBe(0);
  for (const f of inline(s)) {
    compiles(f, where);
    // … or plain letters that KaTeX would draw in italics without complaining (« div », « leq », « dfrac »)
    expect(f, `${where}: ${f}`).not.toMatch(
      /(^|[^\\a-zA-Z])(div|leq|neq|d?frac|dots|square|times|textcolor|[LR]\w*arrow)/,
    );
  }
}

describe('the formulas of « القسمة الإقليدية وحصر حاصل القسمة » compile, wherever they are written', () => {
  it('the tablets, the story and its dash', () => {
    for (const t of Object.values(TABLETS)) {
      for (const m of t.math) compiles(m, t.title);
      for (const line of [...t.lines, ...(t.list ?? [])]) wellWritten(line, t.title);
    }
    for (const w of STORY.dashWaves) wellWritten(w.say, 'dash');
    for (const s of strings(STORY.text)) wellWritten(s, 'story');
    // the fraction bar of the bank's notation is a real KaTeX fraction
    const html = katex.renderToString(TABLETS['hasr-hasil'].math[1]);
    expect(html).toContain('frac-line');
  });

  it('the knowledge map and its memo sheets', () => {
    for (const n of KNOWLEDGE.graph.nodes)
      for (const s of strings([n.title, n.subtitle, n.context])) wellWritten(s, n.id);
    for (const it of Object.values(KNOWLEDGE.modules).flat()) {
      for (const f of ['rule', 'example', 'chip']) compiles(it.memo[f], `${it.id}.${f}`);
      for (const f of ['hook', 'trap', 'exam']) wellWritten(it.memo[f], `${it.id}.${f}`);
      for (const q of it.memo.quiz) for (const s of [q.q, ...q.options]) wellWritten(s, it.id);
      expect(new Set(it.memo.quiz[0].options).size).toBe(3);
    }
    expect(
      katex.renderToString(KNOWLEDGE.graph.nodes.find((n) => n.id === 'muqarraba').context.formula.slice(1, -1)),
    ).toContain('frac-line');
  });

  it('the investigations and the forges, on every case they may show', () => {
    const E = ESTIMATE_INQUIRY.text;
    for (const { a, b } of ESTIMATE_INQUIRY.rounds) {
      for (const s of estimateSteps(a, b)) {
        const m = (k) => ({
          a,
          b,
          place: s.place,
          unit: s.unit,
          from: s.from,
          k,
          count: k * 10 ** s.place,
          value: k * s.unit,
          left: s.from - k * s.unit,
        });
        for (const line of [
          E.ask(m(0)),
          E.laid(m(s.q)),
          E.passes(m(s.q + 1)),
          E.short({ ...m(Math.max(0, s.q - 1)), next: s.q * s.unit }),
        ])
          wellWritten(line, 'estimate');
      }
      wellWritten(E.sum({ a, b, q: Math.floor(a / b), r: a % b }), 'estimate');
      wellWritten(E.foundLine({ a, b, q: Math.floor(a / b), r: a % b }), 'estimate');
    }
    const B = BRACKET_INQUIRY.text;
    for (const { a, b } of BRACKET_INQUIRY.rounds) {
      const x = bracketOf(a, b);
      for (const [lo, hi] of [
        [x.lo + 1, x.hi + 1],
        [x.lo - 3, x.hi],
        [x.lo, x.lo],
      ])
        wellWritten(
          B.miss({ a, b, lo, hi, loValue: b * lo, hiValue: b * hi, ...bracketSays(a, b, lo, hi) }),
          'bracket',
        );
      for (const said of ['on', 'between']) {
        wellWritten(B.ok({ a, b, ...x, said }), 'bracket');
        wellWritten(B.seen({ a, b, ...x, said }), 'bracket');
        wellWritten(B.foundLine({ a, b, ...x, said }), 'bracket');
      }
    }
    const rand = rng(5);
    for (const F of Object.values(FORGES)) {
      const rules = F.slots.reduce((rs, s) => rs.flatMap((r) => s.options.map((o) => ({ ...r, [s.id]: o.id }))), [{}]);
      const cases = [...F.predictCases([], rand), ...[1, 2, 3].flatMap((n) => F.nudge(n, []).cases)];
      for (const rule of rules) cases.push(...F.attacks(rule, []));
      for (const c of cases) {
        for (const line of [F.text.ask(c), F.text.attack(c), F.text.fact(c), F.text.eq(c)]) wellWritten(line, F.key);
        for (const rule of rules) wellWritten(F.explain(rule, c), F.key);
      }
      wellWritten(F.text.tryKey(F.use.make(rand)), F.key);
    }
  });

  it('the trainer: every prompt, statement, reason, hint and correction', () => {
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 20; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 331 + 1), card)) {
          const s = solution(q);
          const lines = [
            q.prompt,
            q.statement ?? '',
            q.why ?? '',
            ...(q.reasons ?? []).map((r) => r.t),
            check(q, s).fix,
          ];
          lines.push(check(q, q.kind === 'tap' ? q.wave.gates.find((n) => n !== s) : {}).hint ?? '');
          for (const line of lines) wellWritten(line, `${card} ${q.kind}`);
        }
  });

  it('the board script and the memo', () => {
    for (const s of SCRIPT.steps) for (const t of [s.text, s.after].filter(Boolean)) wellWritten(t, s.id);
    const memo = [...MEMO.glance.three, ...MEMO.criteria.map((c) => c.see), ...MEMO.anticipated.map((a) => a.says)];
    memo.push(...MEMO.exit.flatMap((e) => [e.q, e.a]), ...MEMO.support, ...MEMO.written, ...MEMO.extend, MEMO.connect);
    for (const t of memo) wellWritten(t, 'memo');
  });
});
