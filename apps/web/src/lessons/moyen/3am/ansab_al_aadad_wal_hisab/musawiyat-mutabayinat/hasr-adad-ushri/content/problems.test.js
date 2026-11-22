import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Arithmétique de contrôle en BigInt (indépendante de decimals.js) : un rationnel {n, d}. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const R = (n, d = 1n) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const cmp = (p, q) => { const l = p.n * q.d; const r = q.n * p.d; return l < r ? -1 : l > r ? 1 : 0; };
const P10 = (k) => 10n ** BigInt(k);
const dec = (txt) => { const [a, b = ''] = String(txt).replace('{,}', ',').replace(',', '.').split('.'); return R(BigInt(a + b), P10(b.length)); };
const fl = (a, b) => { const q = a / b; return a % b !== 0n && (a < 0n) !== (b < 0n) ? q - 1n : q; };
const roundAt = (x, k) => R(fl(2n * x.n * P10(k) + x.d, 2n * x.d), P10(k));
const same = (p, q) => cmp(p, q) === 0;
const choiceOf = (id, part) => PROBLEM[id].parts[part].steps.find((s) => s.kind === 'choice');
const right = (id, part) => { const c = choiceOf(id, part); return c.options[c.correct]; };
const holds = (a, rel, b) => (rel === '<' ? cmp(a, b) < 0 : cmp(a, b) <= 0);
function chain(tex, name, x) {
  const parts = String(tex).replace(/\$/g, '').replace(/\\leq\s?/g, '≤').split(/(≤|<)/);
  if (parts.length !== 5 || parts[2] !== name) throw new Error(`illisible : ${tex}`);
  const v = (t) => dec(t.replace(/\\ /g, '').trim());
  const lo = v(parts[0]); const hi = v(parts[4]);
  return holds(lo, parts[1], x) && holds(x, parts[3], hi);
}
/** Le mot d'un mudawwar r au centième / dixième : x = i / 10^(rank+2) autour de r. */
function word(r, rank) {
  const g = rank + 2; const c = r.n * P10(g) / r.d; const xs = [];
  for (let i = c - 100n; i <= c + 100n; i += 1n) { const x = R(i, P10(g)); if (same(roundAt(x, rank), r)) xs.push(x); }
  return xs;
}

describe('les مسائل du درس « حصر عدد عشري موجب »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[5, 'masala-1'], [6, 'masala-2'], [7, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((pt) => pt.question));
  });

  it('مسألة 1 — 24,9 au dixième : 24,85 ≤ m < 24,95 ; 24,96 impossible ; m < 25 ; 994 ≤ 40m < 998', () => {
    const S = word(dec('24,9'), 1);
    expect(S.length).toBeGreaterThan(5);
    const c0 = choiceOf('masala-1', 0);
    expect(right('masala-1', 0)).toBe('$24{,}85\\leq m<24{,}95$');
    c0.options.forEach((o, i) => {
      const exact = [dec('23'), ...S, dec('25'), dec('24,95'), dec('24,849'), dec('24,951')].every((x) => chain(o, 'm', x) === S.some((s) => same(s, x)));
      expect(exact, `1) ${o}`).toBe(i === c0.correct);
    });
    expect(same(roundAt(dec('24,96'), 1), dec('25'))).toBe(true);
    expect(S.every((m) => cmp(m, dec('25')) < 0)).toBe(true);
    const c3 = choiceOf('masala-1', 3);
    expect(right('masala-1', 3)).toBe('$994\\leq 40m<998$');
    const forty = S.map((m) => R(40n * m.n, m.d));
    c3.options.forEach((o, i) => {
      const all = forty.every((v) => chain(o, '40m', v));
      const exact = all && [R(993n), R(997n), R(998n)].every((v) => chain(o, '40m', v) === forty.some((f) => same(f, v)));
      expect(i === c3.correct ? exact : !all || !exact, `4) ${o}`).toBe(true);
    });
    expect(same(R(40n * dec('24,85').n, dec('24,85').d), R(994n)) && same(R(40n * dec('24,95').n, dec('24,95').d), R(998n))).toBe(true);
    expect(c3.options.filter((_, i) => i !== c3.correct).every((o) => !forty.every((v) => chain(o, '40m', v)) || o.includes('<40m') || o.includes('994<'))).toBe(true);
  });

  it('مسألة 2 — 3100 ÷ 437 = 7,0938… et 437 ÷ 31 = 14,0967… (écrans arrondis)', () => {
    const c = R(3100n, 437n); const d = R(437n, 31n);
    expect(same(roundAt(c, 9), dec('7.093821510'))).toBe(true);
    expect(same(roundAt(d, 8), dec('14.09677419'))).toBe(true);
    expect(PROBLEM['masala-2'].parts[0].question).toContain('7.093821510');
    expect(PROBLEM['masala-2'].parts[2].question).toContain('14.09677419');
    const c0 = choiceOf('masala-2', 0);
    expect(right('masala-2', 0)).toBe('$7{,}09<c<7{,}10$');
    c0.options.forEach((o, i) => expect(chain(o, 'c', c), `2.1 ${o}`).toBe(i === c0.correct));
    const c1 = choiceOf('masala-2', 1);
    c1.options.forEach((o, i) => expect(same(dec(o.replace(/\$/g, '')), roundAt(c, 1)), `2.2 ${o}`).toBe(i === c1.correct));
    const batch = PROBLEM['masala-2'].parts[2].steps.find((s) => s.kind === 'batch');
    batch.rows.forEach((row, i) => row.options.forEach((o, j) => expect(same(dec(o.replace(/\$/g, '')), roundAt(d, i)), `2.3 ${i} ${o}`).toBe(j === row.correct)));
    // le tour de 31 L pour 437 km : 31 × 100 / 437
    expect(same(R(3100n, 437n), c)).toBe(true);
  });

  it('مسألة 3 — 12,47 et 12,48 au centième : [12,465 ; 12,475[ et [12,475 ; 12,485[ ; Maryam est sûrement plus rapide', () => {
    const SM = word(dec('12,47'), 2); const SS = word(dec('12,48'), 2);
    for (const [part, name, S, other] of [[0, 't_M', SM, []], [1, 't_S', SS, []]]) {
      const c = choiceOf('masala-3', part);
      c.options.forEach((o, i) => {
        const exact = [...S, dec('12,46'), dec('12,5'), dec('12,4749'), dec('12,4651'), dec('12,475'), dec('12,485'), dec('12,465')].every((x) => chain(o, name, x) === S.some((s) => same(s, x)));
        expect(exact, `3.${part + 1} ${o}`).toBe(i === c.correct);
      });
      void other;
    }
    expect(SM.every((t) => cmp(t, dec('12,475')) < 0)).toBe(true);
    expect(SS.every((t) => cmp(t, dec('12,475')) >= 0)).toBe(true);
    expect(SM.every((a) => SS.every((b) => cmp(a, b) < 0))).toBe(true);
    // 12,47 pour les deux : mêmes mots, des ordres possibles dans les deux sens
    expect(SM.some((a) => SM.some((b) => cmp(a, b) < 0)) && SM.some((a) => SM.some((b) => cmp(a, b) > 0))).toBe(true);
    expect(right('masala-3', 2)).toContain('12{,}475');
    expect(right('masala-3', 3)).toContain('لا يمكن');
  });
});
