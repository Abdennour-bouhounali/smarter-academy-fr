import { describe, it, expect } from 'vitest';
import { endless, LEVELS } from './endless';

const seeded = (s) => () => {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const num = (o) => Number(o.t);
const frac = (o) => o.tex.match(/\d+/g).map(Number);

/** An independent judge of a gate, by the words of the order. */
function holds(r, o) {
  const n = (re) => r.ask.match(re)?.slice(1).map(Number);
  if (r.ask === 'عدد زوجي') return num(o) % 2 === 0;
  if (r.ask === 'عدد فردي') return num(o) % 2 === 1;
  if (r.ask.startsWith('مضاعف للعدد')) return num(o) % n(/(\d+)/)[0] === 0;
  if (r.ask === 'حاصل الجداء')
    return (
      num(o) ===
      r.tex
        .match(/\d+/g)
        .map(Number)
        .reduce((a, b) => a * b, 1)
    );
  if (r.ask.startsWith('قاسم للعدد')) return n(/(\d+)/)[0] % num(o) === 0;
  if (r.ask.startsWith('قاسم مشترك للعددين')) return n(/(\d+) و (\d+)/).every((x) => x % num(o) === 0);
  if (r.ask === 'القاسم المشترك الأكبر') return num(o) === gcd(...r.tex.match(/\d+/g).map(Number));
  if (r.ask.startsWith('عدد أوّلي مع')) return gcd(n(/(\d+)/)[0], num(o)) === 1;
  if (r.ask.startsWith('الشكل غير القابل للاختزال')) {
    const [a, b] = frac({ tex: r.tex });
    const [p, q] = frac(o);
    return a * q === b * p && gcd(p, q) === 1;
  }
  throw new Error(`unknown order: ${r.ask}`);
}

describe('« سباق الأعداد » — the endless game of unit 1', () => {
  it("starts with 1AM content and ends on the unit's last lesson", () => {
    expect(LEVELS.slice(0, 3).every((l) => l.from === '1 متوسط')).toBe(true);
    expect(LEVELS[LEVELS.length - 1].from).toBe('الدرس 8');
    expect(endless.levels).toHaveLength(LEVELS.length);
  });
  it.each(LEVELS.map((l, i) => [i + 1, l.name]))(
    'level %i (%s): every round has exactly ONE right gate, and a fact for each wrong one',
    (level) => {
      const rand = seeded(level * 977);
      for (let k = 0; k < 300; k += 1) {
        const r = endless.round(level, rand);
        expect(r.options).toHaveLength(3);
        expect(new Set(r.options.map((o) => o.t ?? o.tex)).size, JSON.stringify(r)).toBe(3);
        r.options.forEach((o, i) => {
          expect(holds(r, o), `${r.ask} ${r.tex ?? ''} → ${o.t ?? o.tex}`).toBe(i === r.right);
          if (i === r.right) expect(r.why[i]).toBeNull();
          else expect(r.why[i].length).toBeGreaterThan(12);
        });
      }
    },
  );
  it('past the last level the game keeps serving the last one', () => {
    expect(endless.round(99, seeded(5)).options).toHaveLength(3);
  });
  it('no forbidden word, no « DA »', () => {
    const text = JSON.stringify(Array.from({ length: 200 }, (_, k) => endless.round(1 + (k % 8), seeded(k + 1))));
    expect(text).not.toMatch(/DA|خطأ|حظّ|نرد/);
  });
});
