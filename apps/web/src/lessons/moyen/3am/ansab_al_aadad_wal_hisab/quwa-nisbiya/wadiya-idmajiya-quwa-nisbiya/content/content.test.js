import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, DID_YOU_KNOW } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt, puissances de 10 comprises. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
const dec = (s) => { const [i, f = ''] = s.split(','); return F(BigInt(i + f), 10n ** BigInt(f.length)); };
const T = (k) => (k >= 0 ? F(10n ** BigInt(k)) : F(1n, 10n ** BigInt(-k)));
const pw = (a, k) => { let r = I(1); const base = k >= 0 ? a : F(a.d, a.n); for (let i = 0; i < Math.abs(k); i++) r = mul(r, base); return r; };
const sci = (x) => { for (let n = -40; n <= 40; n++) { const a = div(x, T(n)); if (!lt(a, I(1)) && lt(a, I(10))) return { a, n }; } throw new Error('sci'); };
const order = (x) => { const { a, n } = sci(x); const r = (2n * a.n + a.d) / (2n * a.d); return r === 10n ? { a: 1n, n: n + 1 } : { a: r, n }; };

// Les données de la situation, retapées.
const ATOM = mul(I(288), T(-12));          // 288 pm en mètres
const LEAF = mul(dec('0,1'), T(-6));       // 0,1 µm en mètres
const LAYERS = div(LEAF, ATOM);
const ROW = div(T(-3), ATOM);              // atomes sur 1 mm

describe('« أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);

  it('E1 — 288 pm = 2,88 × 10^-10 m ; les distracteurs sont faux et portent leur erreur', () => {
    expect(sci(ATOM)).toEqual({ a: dec('2,88'), n: -10 });
    expect(get('E1').options[0]).toContain('2{,}88 \\times 10^{-10}');
    const wrong = [mul(dec('2,88'), T(-12)), mul(I(288), T(-10)), mul(dec('2,88'), T(-9))];
    for (const w of wrong) expect(eq(w, ATOM)).toBe(false);
    expect(eq(mul(I(288), T(-9)), mul(dec('288'), T(-9)))).toBe(true); // nm : 288 nm = 2,88 × 10^-7 m, jamais le diamètre
  });

  it('E2 — 0,1 µm = 10^-7 m ; 10^-5, 10^-6 et 10^-8 sont faux', () => {
    expect(eq(LEAF, T(-7))).toBe(true);
    expect(get('E2').options[0]).toContain('10^{-7}');
    for (const w of [T(-5), T(-6), T(-8)]) expect(eq(w, LEAF)).toBe(false);
    expect(eq(mul(dec('0,1'), T(-6)), T(-6))).toBe(false); // le facteur 0,1 oublié
  });

  it('E3 — 10^-7 / (2,88 × 10^-10) ≈ 3,47 × 10^2 ; les trois autres sont faux', () => {
    const { a, n } = sci(LAYERS);
    expect(n).toBe(2);
    expect(Number(a.n * 100n / a.d)).toBe(347); // 3,47…
    expect(get('E3').options[0]).toContain('3{,}47 \\times 10^{2}');
    expect(order(LAYERS)).toEqual({ a: 3n, n: 2 });
    // exposants additionnés : -7 + (-10) = -17
    expect(-7 + -10).toBe(-17);
    expect(lt(mul(dec('3,47'), T(-17)), LAYERS)).toBe(true);
    expect(eq(mul(dec('3,47'), T(3)), mul(dec('3,47'), T(2)))).toBe(false);
    // quotient inversé : 2,88 × 10^-3
    const inverted = div(ATOM, LEAF);
    expect(sci(inverted)).toEqual({ a: dec('2,88'), n: -3 });
    expect(get('E3').options[3]).toContain('2{,}88 \\times 10^{-3}');
  });

  it('E4 — rang de grandeur 3 × 10^2 ; 4 × 10^2, 1 × 10^2, 3 × 10^3 sont faux', () => {
    expect(order(LAYERS)).toEqual({ a: 3n, n: 2 });
    for (const w of [{ a: 4n, n: 2 }, { a: 1n, n: 2 }, { a: 3n, n: 3 }]) expect(w).not.toEqual(order(LAYERS));
    expect(get('E4').options[0]).toBe('$3 \\times 10^{2}$');
  });

  it('E5 — 1 mm / 288 pm ≈ 3,47 × 10^6 : encadré par 10^6 et 10^7 ; les autres encadrements sont faux', () => {
    expect(sci(ROW).n).toBe(6);
    expect(!lt(ROW, T(6)) && lt(ROW, T(7))).toBe(true);
    for (const [lo, hi] of [[5, 6], [7, 8], [-7, -6]]) expect(!lt(ROW, T(lo)) && lt(ROW, T(hi))).toBe(false);
    expect(get('E5').options[0]).toBe('$10^{6}$ و $10^{7}$');
  });

  it('chaque épreuve : une seule bonne option en tête, quatre options, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['3am_wadiya-idmajiya-quwa-nisbiya_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : trois données utiles, deux inutiles, trois étapes d\'analyse ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(3);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, DID_YOU_KNOW]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    const seen = JSON.stringify(SITUATION) + tahlil;
    for (const v of ['2{,}88', '3{,}47', '10^{-7}', '3 \\\\times 10^{2}']) expect(seen).not.toContain(v);
    // les préfixes rappelés dans l'énoncé sont les valeurs justes
    expect(eq(T(-3), div(I(1), I(1000))) && eq(T(-6), div(I(1), I(1000000)))).toBe(true);
    expect(SITUATION.text).toContain('10^{-3}'); expect(SITUATION.text).toContain('10^{-6}'); expect(SITUATION.text).toContain('10^{-9}'); expect(SITUATION.text).toContain('10^{-12}');
  });

  it('أستعدّ — six affirmations, deux réponses différentes, les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, false, false, true, false, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(eq(pw(I(10), -4), dec('0,0001'))).toBe(true);
    expect(eq(mul(T(6), T(-2)), T(4))).toBe(true); expect(eq(mul(T(6), T(-2)), T(-12))).toBe(false);
    expect(sci(I(45000))).toEqual({ a: dec('4,5'), n: 4 });
    expect(order(mul(dec('6,7'), T(5)))).toEqual({ a: 7n, n: 5 });
    expect(eq(pw(I(-2), 4), I(16))).toBe(true);
    expect(eq(F(5n - 2n * 3n ** 2n), I(-13))).toBe(true);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'quwa-nisbiya', grade: '3am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-quwa-nisbiya');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['quwa-adad-ashara', 'qawaid-quwa-ashara', 'kitaba-ilmiya-rutba', 'quwat-adad-nisbi']);
  });
});
