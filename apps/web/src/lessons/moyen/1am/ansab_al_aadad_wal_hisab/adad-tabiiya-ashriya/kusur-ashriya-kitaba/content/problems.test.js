import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/** Arithmétique décimale EXACTE : « 4,075 » → { n: 4075n, k: 3 } ; produit par une puissance de 10 ; égalité. */
const dec = (s) => { const [i, f = ''] = String(s).replace(',', '.').split('.'); return { n: BigInt(i + f), k: f.length }; };
const times10 = (x, e) => (e >= 0 ? { n: x.n * 10n ** BigInt(e), k: x.k } : { n: x.n, k: x.k - e });
const same = (a, b) => { const k = Math.max(a.k, b.k); return a.n * 10n ** BigInt(k - a.k) === b.n * 10n ** BigInt(k - b.k); };
const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);

describe('les مسائل du درس « الكسور العشرية والكتابة العشرية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([[6, 'masala-1'], [7, 'masala-2'], [8, 'masala-3']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 9, stage: 'evaluation' });
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    expect(LESSON_CONFIG.lessonProblem.questions.map((q) => q.text)).toEqual(PROBLEM['masala-1'].parts.map((p) => p.question));
  });
  it('مسألة 1 — 4,075 = 4075/1000 = 4 + 7/100 + 5/1000 ; × 10 = 40,75', () => {
    const v = dec('4,075');
    expect(v).toEqual({ n: 4075n, k: 3 });
    expect(4075n * 1n).toBe(v.n); // le numérateur est le nombre sans virgule ; trois chiffres, trois zéros
    // 4 + 7/100 + 5/1000 = (4000 + 70 + 5) / 1000
    expect(4000n + 70n + 5n).toBe(4075n);
    // les distracteurs : 4,75 et 4,12 ne valent pas 4,075
    expect(same(dec('4,75'), v)).toBe(false);
    expect(expectedOf('masala-1', 1)).toEqual([7]); // رقم الأجزاء من مائة
    expect(expectedOf('masala-1', 2)).toEqual([40.75]);
    expect(same(times10(v, 1), dec('40,75'))).toBe(true);
  });
  it('مسألة 2 — 0,25 = 250/1000 ; 1,5 = 1500/1000 ; 0,075 = 75/1000 ; somme 1825/1000 = 1,825 ; × 100 = 7,5', () => {
    expect([dec('0,25'), dec('1,5'), dec('0,075')].map((x) => x.n * 10n ** BigInt(3 - x.k))).toEqual([250n, 1500n, 75n]);
    expect(250n + 1500n).toBe(1750n);
    expect(1750n + 75n).toBe(1825n);
    expect(expectedOf('masala-2', 1)).toEqual([1750, 1825]);
    expect(same({ n: 1825n, k: 3 }, dec('1,825'))).toBe(true);
    expect(same({ n: 1825n, k: 3 }, dec('18,25'))).toBe(false);
    expect(expectedOf('masala-2', 2)).toEqual([7.5]);
    expect(same(times10(dec('0,075'), 2), dec('7,5'))).toBe(true);
    // les rangées du batch : la clé est la bonne fraction, et chaque distracteur est faux
    const rows = PROBLEM['masala-2'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    const vals = ['0,25', '1,5', '0,075'];
    rows.forEach((r, i) => r.options.forEach((o, j) => {
      const top = BigInt(o.match(/frac\{(\d+)\}/)[1]);
      expect(same({ n: top, k: 3 }, dec(vals[i])), `ligne ${i} option ${j}`).toBe(j === r.correct);
    }));
  });
  it('مسألة 3 — 0,235 × 1000 = 235 < 300 ; × 100 = 23,5 ; 0,235 kg = 235 g', () => {
    expect(expectedOf('masala-3', 0)).toEqual([235]);
    expect(same(times10(dec('0,235'), 3), { n: 235n, k: 0 })).toBe(true);
    expect(235n < 300n).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([23.5]);
    expect(same(times10(dec('0,235'), 2), dec('23,5'))).toBe(true);
    expect(same(times10(dec('0,235'), 3), { n: 235n, k: 0 })).toBe(true); // 235 g
    expect(same(dec('2350'), { n: 235n, k: 0 })).toBe(false);
    expect(same(dec('23,5'), { n: 235n, k: 0 })).toBe(false);
  });
});
