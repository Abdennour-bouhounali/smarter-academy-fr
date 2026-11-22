import { describe, it, expect } from 'vitest';
import { ACTIVITY, NOW_56, PREP_ITEMS, PREP_PLATFORM_ITEMS } from './textbook';
import { EX, SELF } from './exercises';

/** Fractions EXACTES : une fraction « a/b » ou un décimal « 3,6 » → [n, d] irréductible ; l'égalité par produit en croix. */
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const red = ([n, d]) => { const g = gcd(n, d); return [n / g, d / g]; };
const parse = (s) => {
  const t = String(s).replace(/\$|\\frac\{(\d+)\}\{(\d+)\}/g, (m, a, b) => (a ? `${a}/${b}` : '')).replace(/[{}\\]/g, '').trim();
  if (t.includes('/')) { const [a, b] = t.split('/').map(Number); return red([a, b]); }
  const [i, f = ''] = t.replace(',', '.').split('.');
  return red([Number(i + f), 10 ** f.length]);
};
const same = (a, b) => { const [x, y] = parse(a); const [u, v] = parse(b); return x * v === u * y; };
const simplest = (s) => { const [n, d] = parse(s); const raw = String(s).match(/\\frac\{(\d+)\}\{(\d+)\}|(\d+)\/(\d+)/); return !raw || gcd(n, d) === 1 && (raw[1] ? Number(raw[1]) === n : raw[3] ? Number(raw[3]) === n : true); };
const key = (r) => r.options[r.correct];
const fracOf = (label) => { const m = label.match(/\\frac\{([\d{},]+)\}\{([\d{},]+)\}/); return [m[1].replace(/[{}]/g, ''), m[2].replace(/[{}]/g, '')]; };

describe('« الكتابات الكسرية لحاصل قسمة واختزال كسر » — chaque clé recalculée en fractions exactes', () => {
  it('نشاط 4 : 3/5 = 6/10 = 12/20 = 27/45', () => {
    const [p, q] = ACTIVITY.numbers.share;
    for (const [a, b] of [...ACTIVITY.numbers.targets, ACTIVITY.numbers.gift]) expect(a * q).toBe(b * p);
    expect(ACTIVITY.numbers.amount * p / q).toBe(2100);
  });

  it('أستعدّ : the truth of every statement', () => {
    const truth = [8225 / 1000 === 8.225 && 8 + 0.2 + 0.025 === 8.225, Math.round((9.23 - 4.6) * 100) === 463, false, 307 / 10 === 3.07, 135 % 9 === 0, 74 % 4 === 0];
    expect([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((it) => it.answer)).toEqual(truth);
  });

  it('ex-15 : the missing terms', () => {
    const k = EX['ex-15'].question.rows.map(key).map(Number);
    expect([18 * 16 / 32, 20 * 7 / 28, 8 * 24 / 3, 3 * 35 / 7]).toEqual(k);
  });

  it('ex-16, ex-17 : equal or not', () => {
    const cmp = (ex, target) => EX[ex].question.rows.map((r) => [r.correct === 0, same(r.label.replace(/\\div /g, '/').replace(/ /g, ''), target)]);
    for (const [said, truth] of cmp('ex-16', '4/5')) expect(said).toBe(truth);
    for (const [said, truth] of cmp('ex-17', '8/12')) expect(said).toBe(truth);
  });

  it('ex-18 : the odd one out', () => {
    const q = EX['ex-18'].question;
    const others = ['6/10', '9/15', '24/40', '12/20', '27/35'].filter((f) => !same(f, '3/5'));
    expect(others).toEqual(['27/35']);
    expect(same(key(q), '27/35')).toBe(true);
  });

  it('ex-19, ex-20, ex-21, ex-22, ex-25, now-56 : equal AND (where asked) simplest; every distractor false', () => {
    for (const r of EX['ex-19'].question.rows) { expect(same(key(r), '3/5')).toBe(true); r.options.filter((o) => o !== key(r) && !o.includes('{,}')).forEach((o) => expect(same(o, '3/5')).toBe(false)); }
    for (const r of EX['ex-20'].question.rows) { expect(same(key(r), r.label)).toBe(true); expect(simplest(key(r))).toBe(true); r.options.filter((o) => o !== key(r)).forEach((o) => expect(same(o, r.label)).toBe(false)); }
    for (const id of ['ex-21', 'ex-22', 'ex-25']) {
      for (const r of EX[id].question.rows) {
        const [n, d] = fracOf(r.label);
        expect(same(key(r), `${n}/${d}`)).toBe(true);
        expect(simplest(key(r))).toBe(true);
        r.options.filter((o) => o !== key(r)).forEach((o) => expect(same(o, `${n}/${d}`) && simplest(o)).toBe(false));
      }
    }
    const rows = EX['now-56'].question.rows;
    expect(rows.slice(0, 2).map(key).map(Number)).toEqual(NOW_56.complete.map((c) => c.to[1]));
    NOW_56.reduce.forEach(([n, d], i) => { expect(same(key(rows[i + 2]), `${n}/${d}`)).toBe(true); expect(simplest(key(rows[i + 2]))).toBe(true); });
  });

  it('ex-23 : quotients of decimals', () => {
    for (const r of EX['ex-23'].question.rows) {
      const [a, b] = fracOf(r.label).map((s) => s.replace(',', '.'));
      const [n, d] = red([Math.round(Number(a) * 10), Math.round(Number(b) * 10)]);
      expect(same(key(r), `${n}/${d}`)).toBe(true);
    }
  });

  it('ex-24, ex-26, ex-27 : by n % d', () => {
    const cls = (n) => (n % 9 === 0 ? 'على 3 وعلى 9' : n % 3 === 0 ? 'على 3 فقط' : 'لا على 3 ولا على 9');
    for (const r of EX['ex-24'].question.rows) expect(key(r)).toBe(cls(Number(r.label)));
    expect([414 / Number(key(EX['ex-26'].question)), 391 / Number(key(EX['ex-26'].question))]).toEqual([18, 17]);
    expect([2, 3, 4, 5, 6, 7, 8, 9, 10].filter((k) => 91 % k === 0)).toEqual([7]);
    expect(key(EX['ex-27'].question)).toContain('فاطمة');
  });
});

describe('the إختبار أولي (module 9) keys', () => {
  it('every literal key is an exact fraction fact', async () => {
    const raw = (await import('../modules/Module09Itqan.jsx?raw')).default;
    const epreuve = (id) => {
      const block = raw.slice(raw.indexOf(`id: '${id}'`));
      const options = JSON.parse(block.match(/options: (\[[^\]]*\])/)[1].replace(/'/g, '"'));
      return { options, key: options[Number(block.match(/correct: (\d)/)[1])] };
    };
    const [n4, d4] = SELF[4].fraction;
    const e1 = epreuve('E1');
    expect(e1.options.filter((o) => !same(o, `${n4}/${d4}`))).toEqual([e1.key]);
    const e2 = epreuve('E2');
    expect(same(e2.key, '44/24') && simplest(e2.key)).toBe(true);
    e2.options.filter((o) => o !== e2.key).forEach((o) => expect(same(o, '44/24') && simplest(o)).toBe(false));
    expect(same(epreuve('E3').key, `${n4}/${d4}`)).toBe(true);
    expect(same(epreuve('E4').key, '2,45')).toBe(true);
    const e5 = epreuve('E5');
    expect(same(e5.key, '36/60') && simplest(e5.key)).toBe(true);
    e5.options.filter((o) => o !== e5.key).forEach((o) => expect(simplest(o)).toBe(false));
  });
});
