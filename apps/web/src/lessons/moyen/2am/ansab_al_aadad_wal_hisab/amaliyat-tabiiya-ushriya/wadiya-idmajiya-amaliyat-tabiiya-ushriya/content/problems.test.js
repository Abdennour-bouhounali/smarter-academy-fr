import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt (entiers et décimaux), évaluateur de chaînes à priorités (+ − × ÷) et à parenthèses. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const D = (s) => { const [i, f = ''] = String(s).split('.'); return Q(BigInt(i + f), 10n ** BigInt(f.length)); };
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const div = (a, b) => Q(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;

/** Évalue une chaîne ASCII « 6 * 340 / 1000 » (parenthèses, priorités), en rationnels exacts. */
function ev(s) {
  const t = s.match(/\d+(?:\.\d+)?|[()+\-*/]/g); let i = 0;
  const factor = () => { const v = t[i++]; if (v === '(') { const e = chain(); i++; return e; } return D(v); };
  const chain = () => {
    const o = [factor()], p = [];
    while ('+-*/'.includes(t[i] ?? '#')) { p.push(t[i++]); o.push(factor()); }
    while (p.length) {
      let k = p.findIndex((c) => c === '*' || c === '/'); if (k < 0) k = 0;
      const [a, b, c] = [o[k], o[k + 1], p[k]];
      o.splice(k, 2, c === '*' ? mul(a, b) : c === '/' ? div(a, b) : c === '+' ? add(a, b) : sub(a, b)); p.splice(k, 1);
    }
    return o[0];
  };
  return chain();
}
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');

describe('les وضعيات تدريبية de « أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — le programme : 6 s → 2,04 km ; 1,7 km → 5 s (réciproque) ; 9 s → 3,06 > 3', () => {
    expect(eq(ev('6 * 340 / 1000'), D('2.04'))).toBe(true);
    expect(eq(ev('6 * (340 / 1000)'), ev('6 * 340 / 1000'))).toBe(true);
    expect(nums('wadiya-1', 0)).toEqual([2.04]);
    expect(eq(ev('5 * 340 / 1000'), D('1.7'))).toBe(true);
    expect(eq(div(mul(D('1.7'), Q(1000)), Q(340)), Q(5))).toBe(true);
    expect(nums('wadiya-1', 3)).toEqual([5]);
    expect(eq(ev('9 * 340 / 1000'), D('3.06'))).toBe(true);
    expect(nums('wadiya-1', 4)).toEqual([3.06]);
    expect(lt(D('3'), D('3.06'))).toBe(true);
  });

  it('situation 2 — 500 − (3 × 80 + 2 × 60) = 140 ; la lecture sans parenthèses donne 380 ; sans parenthèses juste : 500 − 240 − 120 ; 2 × 65 = 130 < 140', () => {
    expect(eq(ev('500 - (3 * 80 + 2 * 60)'), Q(140))).toBe(true);
    expect(eq(ev('500 - 3 * 80 + 2 * 60'), Q(380))).toBe(true);
    expect(eq(ev('(500 - 3) * 80 + 2 * 60'), Q(140))).toBe(false);
    expect(eq(ev('500 - 3 * 80 - 2 * 60'), Q(140))).toBe(true);
    expect(eq(ev('500 - 3 - 80 - 2 - 60'), Q(140))).toBe(false);
    expect(nums('wadiya-2', 1)).toEqual([360, 140]);
    expect(eq(ev('2 * 65'), Q(130)) && lt(Q(130), Q(140))).toBe(true);
    expect(nums('wadiya-2', 3)).toEqual([130]);
  });

  it('situation 3 — (13 + 15,5 + 12) ÷ 3 = 13,5 ; la saisie de Samir 13 + 15,5 + 12 ÷ 3 = 32,5 ; (57,5) ÷ 4 = 14,375 > 13,5', () => {
    expect(eq(ev('(13 + 15.5 + 12) / 3'), D('13.5'))).toBe(true);
    expect(eq(ev('13 + 15.5 + 12 / 3'), D('32.5'))).toBe(true);
    expect(eq(ev('13 + 15.5 + (12 / 3)'), D('32.5'))).toBe(true);
    expect(eq(ev('13 + 15.5 + 12 - 3'), D('13.5'))).toBe(false);
    expect(nums('wadiya-3', 0)).toEqual([13.5]);
    expect(nums('wadiya-3', 1)).toEqual([4, 32.5]);
    expect(eq(ev('(13 + 15.5 + 12 + 17) / 4'), D('14.375'))).toBe(true);
    expect(nums('wadiya-3', 3)).toEqual([14.375]);
    expect(lt(D('13.5'), D('14.375'))).toBe(true);
  });

  it('situation 4 — 800 + 450 × 3 = 2150 ; (800 + 450) × 3 = 3750 ; 1200 + 350 × 3 = 2250 ; 5 h : 3050 et 2950, le second moins cher', () => {
    expect(eq(ev('800 + 450 * 3'), Q(2150))).toBe(true);
    expect(eq(ev('(800 + 450) * 3'), Q(3750))).toBe(true);
    expect(nums('wadiya-4', 0)).toEqual([2150]);
    expect(eq(ev('1200 + 350 * 3'), Q(2250))).toBe(true);
    expect(nums('wadiya-4', 2)).toEqual([2250]);
    expect(eq(ev('800 + 450 * 5'), Q(3050)) && eq(ev('1200 + 350 * 5'), Q(2950))).toBe(true);
    expect(nums('wadiya-4', 3)).toEqual([3050, 2950]);
    expect(lt(Q(2950), Q(3050))).toBe(true);
    expect(lt(Q(800), Q(1200))).toBe(true); // le premier a le déplacement le plus bas, et pourtant il est plus cher
  });

  it('situation 5 — 25 × 98 = 2450 ; 12,5 × 7 + 12,5 × 3 = 12,5 × 10 = 125 ; total 2575 ; 25 × 100 − 2 est faux', () => {
    expect(eq(ev('25 * (100 - 2)'), ev('25 * 98'))).toBe(true);
    expect(eq(ev('25 * 100 - 25 * 2'), Q(2450))).toBe(true);
    expect(eq(ev('25 * 100 - 2'), Q(2450))).toBe(false);
    expect(eq(ev('25 * (100 + 2)'), Q(2450))).toBe(false);
    expect(nums('wadiya-5', 0)).toEqual([2500, 50, 2450]);
    expect(eq(ev('12.5 * 7'), D('87.5')) && eq(ev('12.5 * 3'), D('37.5'))).toBe(true);
    expect(eq(ev('12.5 * 7 + 12.5 * 3'), Q(125)) && eq(ev('12.5 * (7 + 3)'), Q(125))).toBe(true);
    expect(eq(ev('12.5 * 7 + 3'), Q(125))).toBe(false);
    expect(eq(ev('12.5 + 7 * 3'), Q(125))).toBe(false);
    expect(nums('wadiya-5', 1)).toEqual([87.5, 37.5, 125]);
    expect(eq(ev('25 * 98 + 12.5 * (7 + 3)'), Q(2575))).toBe(true);
    expect(nums('wadiya-5', 2)).toEqual([2575]);
  });

  it('situation 6 — 18 − 6 + 2 = 14 (pas 10) ; 4 + 6 × 5 = 34 ; (30 + 6) ÷ (10 − 4) = 6 ; 7 × (8 + 2) = 70 (pas 58) ; le jeu des quatre 3', () => {
    expect(eq(ev('18 - 6 + 2'), Q(14)) && eq(ev('18 - (6 + 2)'), Q(10))).toBe(true);
    expect(eq(ev('4 + 6 * 5'), Q(34))).toBe(true);
    expect(eq(ev('(30 + 6) / (10 - 4)'), Q(6))).toBe(true);
    expect(eq(ev('7 * (8 + 2)'), Q(70)) && eq(ev('7 * 8 + 2'), Q(58))).toBe(true);
    const judged = [eq(ev('18 - 6 + 2'), Q(10)), eq(ev('4 + 6 * 5'), Q(34)), eq(ev('(30 + 6) / (10 - 4)'), Q(6)), eq(ev('7 * 8 + 2'), Q(70)), true];
    expect(judged).toEqual([false, true, true, false, true]);
    const rows = PROBLEM['wadiya-6'].parts[0].steps.find((s) => s.kind === 'batch').rows;
    expect(rows.map((r) => r.correct)).toEqual(judged.map((j) => (j ? 0 : 1)));
    expect(nums('wadiya-6', 1)).toEqual([14, 70]);
    expect(nums('wadiya-6', 2)).toEqual([3]);
    expect(judged.filter(Boolean).length).toBe(3);
    // les quatre 3 : exactement UNE option vraie par question
    const [c1, c10] = choices('wadiya-6', 3);
    const chains = (c) => c.options.map((o) => o.replace(/\$|\\times/g, (m) => (m === '$' ? '' : '*')).replace(/\\div/g, '/'));
    expect(chains(c1).map((e) => ev(e)).filter((v) => eq(v, Q(1))).length).toBe(1);
    expect(eq(ev(chains(c1)[c1.correct]), Q(1))).toBe(true);
    expect(chains(c10).map((e) => ev(e)).filter((v) => eq(v, Q(10))).length).toBe(1);
    expect(eq(ev(chains(c10)[c10.correct]), Q(10))).toBe(true);
  });

  it('chaque question à choix a des options distinctes, la bonne en tête, et chaque situation a ses données utiles et inutiles', () => {
    for (const pb of PROBLEMS) {
      expect(pb.data.some((d) => d.useful) && pb.data.some((d) => !d.useful)).toBe(true);
      pb.parts.forEach((_, i) => { for (const c of choices(pb.id, i)) { expect(new Set(c.options).size).toBe(c.options.length); expect(c.correct).toBe(0); } });
    }
  });

  it('aucune ligne ne renvoie au manuel ni à un sujet exclu', () => {
    const text = JSON.stringify(PROBLEMS.map(({ source, ...rest }) => rest));
    expect(text).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+|خنزير|خمر|قمار|نرد|(^|[^ء-ي])ربا([^ء-ي]|$)|ساحر|يانصيب|فهرنهايت/);
  });
});
