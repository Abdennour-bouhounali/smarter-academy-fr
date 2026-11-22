import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt (les décimaux aussi). */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const le = (a, b) => !lt(b, a);
const I = (n) => F(n);
/** « 25,05 » ou « -39,6 » → rationnel exact. */
const dec = (s) => { const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split(','); const r = F(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? mul(r, I(-1)) : r; };
/** Résout a x + b = c x + d (formes affines [a, b]) : x = (d − b) / (a − c). */
const solve = ([a, b], [c, d]) => div(sub(d, b), sub(a, c));
/** Arrondi demi supérieur au pas p (rationnel positif). */
const roundTo = (x, p) => { const q = div(x, p); const fl = q.n / q.d; const frac = sub(q, F(fl)); return mul(F(le(dec('0,5'), frac) ? fl + 1n : fl), p); };
const answers = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);
const nums = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choices = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const right = (c) => c.options[c.correct];
const text = (id) => JSON.stringify(PROBLEM[id]);

describe('les وضعيات تدريبية de « أدمج تعلّماتي — المساويات – المتباينات – المعادلات »', () => {
  it('respect the GuidedProblem contract and the module layout', () => {
    expect(PROBLEMS.length).toBe(6);
    for (const pb of PROBLEMS) expect(validateProblem(pb)).toEqual([]);
    expect(LESSON_CONFIG.modules.filter((m) => m.track === 'problem').map((m) => [m.number, m.slug])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `wadiya-${n}`]));
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ number: 8, stage: 'evaluation' });
  });

  it('situation 1 — 1 + 1/4 + 3/10 = 1,55 ; T = 24 800 / 1,55 = 16 000 ; 4 000 et 4 800 ; somme 24 800', () => {
    const coef = add(add(I(1), F(1, 4)), F(3, 10));
    expect(eq(coef, dec('1,55'))).toBe(true);
    expect(nums('wadiya-1', 1)).toEqual([1.55]);
    const T = div(I(24800), coef);
    expect(eq(T, I(16000))).toBe(true);
    const low = div(T, I(4)); const third = div(mul(I(3), T), I(10));
    expect(eq(low, I(4000)) && eq(third, I(4800))).toBe(true);
    expect(answers('wadiya-1', 2)).toEqual([16000, 4000, 4800]);
    expect(eq(add(add(T, low), third), I(24800))).toBe(true);
    expect(answers('wadiya-1', 3)).toEqual([24800]);
    // le Σ des parts « sans la part de l'aîné » n'est pas le total
    expect(eq(add(low, third), I(24800))).toBe(false);
    expect(right(choices('wadiya-1', 0)[0])).toBe('$\\frac{T}{4}$');
    expect(right(choices('wadiya-1', 0)[1])).toBe('$\\frac{3T}{10}$');
    expect(right(choices('wadiya-1', 1)[0])).toBe('$T + \\frac{T}{4} + \\frac{3T}{10} = 24\\,800$');
  });

  it('situation 1 (5) — 25 000 / 1,55 = 16 129,03… : arrondi 16 129 ; 16 129 < T < 16 130', () => {
    const T = div(I(25000), dec('1,55'));
    const r = roundTo(T, I(1));
    expect(eq(r, I(16129))).toBe(true);
    expect(answers('wadiya-1', 4)).toEqual([16129]);
    expect(lt(I(16129), T) && lt(T, I(16130))).toBe(true);
    expect(lt(I(16128), T) && lt(T, I(16129))).toBe(false); // option fausse
    expect(lt(I(16129), T) && lt(T, I(16131)) && !eq(I(16131), I(16130))).toBe(true); // vrai mais pas « consécutifs »
    expect(right(choices('wadiya-1', 4)[0])).toBe('$16\\,129 < T < 16\\,130$');
  });

  it('situation 2 — 4x + 32 = 200 ⟹ 4x = 168 ; 8x = 336 ; x = 42 ; 4 × 42 + 32 = 200', () => {
    expect(eq(sub(I(200), I(32)), I(168))).toBe(true);
    expect(right(choices('wadiya-2', 0)[0])).toBe('$4x = 168$');
    expect(eq(add(I(200), I(32)), I(232))).toBe(true); // 4x = 232 : l'erreur « ajouter »
    expect(eq(mul(I(2), I(168)), I(336))).toBe(true);
    expect(answers('wadiya-2', 1)).toEqual([336]);
    expect(right(choices('wadiya-2', 1)[0])).toBe('$2$');
    const x = solve([I(4), I(32)], [I(0), I(200)]);
    expect(eq(x, I(42))).toBe(true);
    expect(answers('wadiya-2', 2)).toEqual([42]);
    expect(eq(add(mul(I(4), x), I(32)), I(200))).toBe(true);
    expect(answers('wadiya-2', 3)).toEqual([200]);
  });

  it('situation 3 — 0,8 à 0,1 près : 0,75 ≤ m < 0,85 ; 9 ≤ 12m < 10,2 ; 9,75 ≤ 13m < 11,05 ; décision', () => {
    const lo = sub(dec('0,8'), dec('0,05')); const hi = add(dec('0,8'), dec('0,05'));
    expect(eq(lo, dec('0,75')) && eq(hi, dec('0,85'))).toBe(true);
    // le bord bas est bien dans l'ensemble : l'arrondi de 0,75 est 0,8 ; celui de 0,85 est 0,9 (le bord haut est exclu)
    expect(eq(roundTo(lo, dec('0,1')), dec('0,8'))).toBe(true); expect(eq(roundTo(hi, dec('0,1')), dec('0,9'))).toBe(true);
    expect(roundTo(sub(hi, dec('0,0001')), dec('0,1'))).toEqual(dec('0,8'));
    expect(right(choices('wadiya-3', 0)[0])).toBe('$0{,}75 \\le m < 0{,}85$');
    expect(eq(mul(I(12), lo), I(9)) && eq(mul(I(12), hi), dec('10,2'))).toBe(true);
    expect(answers('wadiya-3', 1)).toEqual([9, 10.2]);
    expect(lt(mul(I(12), hi), dec('10,5'))).toBe(true); // 12 boîtes : sûr
    expect(eq(mul(I(13), lo), dec('9,75')) && eq(mul(I(13), hi), dec('11,05'))).toBe(true);
    expect(answers('wadiya-3', 3)).toEqual([9.75, 11.05]);
    expect(lt(mul(I(13), lo), dec('10,5')) && lt(dec('10,5'), mul(I(13), hi))).toBe(true); // 10,5 DANS le bracket : on ne peut pas conclure
    expect(right(choices('wadiya-3', 3)[0])).toContain('9{,}75 < 10{,}5 < 11{,}05');
  });

  it('situation 4 — 50 + 30 × 7 = 260 ; 50 + 30d = 410 ⟹ d = 12 ; d ≤ 15 ; 16 km → 530 DA', () => {
    expect(eq(add(I(50), mul(I(30), I(7))), I(260))).toBe(true);
    expect(answers('wadiya-4', 0)).toEqual([260]);
    expect(nums('wadiya-4', 1)).toEqual([360, 12]);
    expect(eq(solve([I(30), I(50)], [I(0), I(410)]), I(12))).toBe(true);
    expect(eq(sub(I(410), I(50)), I(360))).toBe(true);
    expect(nums('wadiya-4', 2)).toEqual([450, 15]);
    expect(eq(div(sub(I(500), I(50)), I(30)), I(15))).toBe(true);
    expect(eq(add(I(50), mul(I(30), I(15))), I(500))).toBe(true); // d = 15 coûte exactement 500
    expect(answers('wadiya-4', 3)).toEqual([530]);
    expect(eq(add(I(50), mul(I(30), I(16))), I(530))).toBe(true);
    expect(lt(I(500), I(530))).toBe(true);
    expect(right(choices('wadiya-4', 1)[0])).toBe('$50 + 30d = 410$');
    expect(right(choices('wadiya-4', 2)[0])).toBe('$50 + 30d \\le 500$');
  });

  it('situation 5 — −22 ≤ T ≤ −18 : −39,6 ≤ 1,8T ≤ −32,4 ; −7,6 ≤ F ≤ −0,4 ; 46 ≤ I ≤ 54 ; I décroît quand T croît', () => {
    const a = mul(dec('1,8'), I(-22)); const b = mul(dec('1,8'), I(-18));
    expect(eq(a, dec('-39,6')) && eq(b, dec('-32,4')) && lt(a, b)).toBe(true);
    expect(right(choices('wadiya-5', 0)[0])).toBe('$-39{,}6 \\le 1{,}8T \\le -32{,}4$');
    expect(eq(add(a, I(32)), dec('-7,6')) && eq(add(b, I(32)), dec('-0,4'))).toBe(true);
    expect(right(choices('wadiya-5', 0)[1])).toBe('$-7{,}6 \\le F \\le -0{,}4$');
    expect(eq(sub(a, I(32)), dec('-71,6'))).toBe(true); // option fausse : soustraire 32
    const lo = mul(I(-2), I(-18)); const hi = mul(I(-2), I(-22));
    expect(eq(lo, I(36)) && eq(hi, I(44)) && lt(lo, hi)).toBe(true);
    expect(right(choices('wadiya-5', 1)[0])).toBe('$36 \\le -2T \\le 44$');
    expect(eq(add(lo, I(10)), I(46)) && eq(add(hi, I(10)), I(54))).toBe(true);
    expect(answers('wadiya-5', 1)).toEqual([46, 54]);
    const iAt = (T) => add(mul(I(-2), I(T)), I(10));
    expect(lt(iAt(-18), iAt(-22))).toBe(true); // T plus basse ⟹ I plus grand
    expect(eq(iAt(-22), I(54)) && eq(iAt(-18), I(46))).toBe(true);
    expect(right(choices('wadiya-5', 2)[0])).toContain('خطأ');
  });

  it('situation 6 — 41 + n = 3(9 + n) ⟹ n = 7 ; 48 = 3 × 16 ; 41 + n < 2(9 + n) ⟺ n > 23 ; n = 23 : 64 = 64', () => {
    const n = solve([I(1), I(41)], [I(3), I(27)]);
    expect(eq(n, I(7))).toBe(true);
    expect(eq(add(I(41), n), mul(I(3), add(I(9), n)))).toBe(true);
    expect(eq(add(I(41), I(7)), I(48)) && eq(add(I(9), I(7)), I(16)) && eq(mul(I(3), I(16)), I(48))).toBe(true);
    expect(nums('wadiya-6', 0)).toEqual([14, 7]);
    expect(eq(sub(I(41), I(27)), I(14))).toBe(true);
    expect(answers('wadiya-6', 1)).toEqual([48, 16]);
    // la distribution oubliée donne un autre n
    expect(eq(solve([I(1), I(41)], [I(1), I(27)]), I(7))).toBe(false);
    // l'inéquation, testée sur 0…60 : vraie exactement pour n ≥ 24
    for (let k = 0; k <= 60; k++) {
      const holds = lt(add(I(41), I(k)), mul(I(2), add(I(9), I(k))));
      expect(holds).toBe(k > 23);
    }
    expect(answers('wadiya-6', 2)).toEqual([24]);
    expect(right(choices('wadiya-6', 2)[0])).toBe('$41 + n < 2(9 + n)$');
    expect(right(choices('wadiya-6', 2)[1])).toBe('$23 < n$');
    expect(answers('wadiya-6', 3)).toEqual([64, 64]);
    expect(eq(add(I(41), I(23)), mul(I(2), add(I(9), I(23))))).toBe(true);
    expect(right(choices('wadiya-6', 0)[0])).toBe('$41 + n = 3(9 + n)$');
  });

  it('aucune donnée ni étiquette ne contient « $ », aucune ligne ne renvoie au manuel, les nombres de l\'énoncé sont ceux des corrigés', () => {
    for (const pb of PROBLEMS) {
      for (const d of pb.data) expect(d.text).not.toContain('$');
      expect(text(pb.id)).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
      expect(pb.source.type === 'platform_addition' || pb.source.type === 'textbook').toBe(true);
    }
    expect(text('wadiya-1')).toContain('24\\\\,800');
    expect(text('wadiya-6')).toContain('41');
  });
});
