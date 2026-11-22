import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de fractions3.js) : des rationnels { n, d }. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (x, y) => R(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => R(x.n * y.d - y.n * x.d, x.d * y.d);
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l > r ? 1 : l === r ? 0 : -1; };
const eq = (x, y) => cmp(x, y) === 0;
const tex = (s) => { const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(s); return R(m[1], m[2]); };
const answerOf = (id, part, ask) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'numeric' && s.ask === ask).expected;
const concl = (id, part, ask = 0) => { const st = PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice' && s.role === 'conclude' && s.ask === ask); return { st, key: st.options[st.correct], others: st.options.filter((_, i) => i !== st.correct) }; };

describe('les مسائل du درس « جمع وطرح كسرين »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 1/4 + 2/5 = 13/20 ؛ الباقي 7/20 ؛ 1/3 = 20/60 < 21/60 = 7/20 فيبقى 1/60 ؛ الفخّان خاطئان', () => {
    const done = add(R(1, 4), R(2, 5));
    expect(eq(done, R(13, 20))).toBe(true);
    expect(eq(tex(concl('masala-1', 0).key), done)).toBe(true);
    concl('masala-1', 0).others.forEach((o) => expect(eq(tex(o), done)).toBe(false));
    const rest = sub(R(1), done);
    expect(eq(rest, R(7, 20))).toBe(true);
    expect(eq(tex(concl('masala-1', 1).key), rest)).toBe(true);
    concl('masala-1', 1).others.forEach((o) => expect(eq(tex(o), rest)).toBe(false));
    expect(cmp(R(1, 3), rest)).toBe(-1);
    expect(eq(sub(rest, R(1, 3)), R(1, 60))).toBe(true);
    expect(concl('masala-1', 2).key).toContain('\\frac{1}{60}');
    expect(20n * 3n).toBe(60n);   // 60 est un multiple de 20 et de 3
  });

  it('مسألة 2 — 3/8 + 2/5 = 31/40 ؛ + 1/10 = 35/40 = 7/8 ؛ الباقي 1/8', () => {
    const two = add(R(3, 8), R(2, 5));
    expect(eq(two, R(31, 40))).toBe(true);
    expect(eq(tex(concl('masala-2', 0).key), two)).toBe(true);
    concl('masala-2', 0).others.forEach((o) => expect(eq(tex(o), two)).toBe(false));
    const all = add(two, R(1, 10));
    expect(eq(all, R(7, 8))).toBe(true);
    expect(eq(tex(concl('masala-2', 1).key), all)).toBe(true);
    concl('masala-2', 1).others.forEach((o) => expect(eq(tex(o), all)).toBe(false));
    const zak = sub(R(1), all);
    expect(eq(zak, R(1, 8))).toBe(true);
    expect(eq(tex(concl('masala-2', 2).key), zak)).toBe(true);
    concl('masala-2', 2).others.forEach((o) => expect(eq(tex(o), zak)).toBe(false));
  });

  it('مسألة 3 — 3/4 + 5/6 = 19/12 h ؛ 19/12 × 60 = 95 min ؛ 5/6 − 3/4 = 1/12 h = 5 min', () => {
    const sum = add(R(3, 4), R(5, 6));
    expect(eq(sum, R(19, 12))).toBe(true);
    expect(eq(tex(concl('masala-3', 0).key), sum)).toBe(true);
    concl('masala-3', 0).others.forEach((o) => expect(eq(tex(o), sum)).toBe(false));
    expect((sum.n * 60n) / sum.d).toBe(95n);
    expect((sum.n * 60n) % sum.d).toBe(0n);
    expect(answerOf('masala-3', 1, 0)).toBe(95);
    const diff = sub(R(5, 6), R(3, 4));
    expect(eq(diff, R(1, 12))).toBe(true);
    expect((diff.n * 60n) / diff.d).toBe(5n);
    expect(eq(tex(concl('masala-3', 2).key), diff)).toBe(true);
    concl('masala-3', 2).others.forEach((o) => expect(eq(tex(o), diff)).toBe(false));
  });

  it('aucun `$` dans les `data` ni dans les cartes `tags` (texte brut), et aucune « نسبة مئوية »', () => {
    for (const pb of PROBLEMS) {
      pb.data.forEach((d) => expect(d.text).not.toContain('$'));
      expect(JSON.stringify(pb)).not.toMatch(/نسبة مئوية|%/);
    }
  });
});
