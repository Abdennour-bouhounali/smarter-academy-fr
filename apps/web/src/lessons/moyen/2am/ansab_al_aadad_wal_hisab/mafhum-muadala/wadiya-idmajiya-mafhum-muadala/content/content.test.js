import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, DID_YOU_KNOW } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_2am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const le = (a, b) => a.n * b.d <= b.n * a.d;
const I = (n) => F(n);
const cost = (x) => add(I(12000), mul(I(200), I(x)));

describe('« أدمج تعلّماتي — مفهوم معادلة » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);

  it('E1 — 12000 + 200x ; 12200x, 200 + 12000x et 12000 × 200x sont faux (testés en x = 2)', () => {
    const t = cost(2);
    expect(eq(t, I(12400))).toBe(true);
    expect(eq(mul(I(12200), I(2)), t)).toBe(false);
    expect(eq(add(I(200), mul(I(12000), I(2))), t)).toBe(false);
    expect(eq(mul(mul(I(12000), I(200)), I(2)), t)).toBe(false);
    expect(get('E1').options[0]).toBe('$12000+200x$');
  });

  it('E2 — 19200 ; 7200 (car oublié), 439200 et 432200 sont faux', () => {
    expect(eq(cost(36), I(19200))).toBe(true);
    expect(eq(mul(I(200), I(36)), I(7200))).toBe(true);
    expect(eq(mul(I(12200), I(36)), I(439200))).toBe(true);
    expect(eq(add(I(200), mul(I(12000), I(36))), I(432200))).toBe(true);
    for (const w of [7200, 439200, 432200]) expect(eq(I(w), cost(36))).toBe(false);
  });

  it('E3 — 25 et 30 vérifient 12000 + 200x ≤ 18000, 32 non (≤ accepte l\'égalité)', () => {
    expect([25, 30, 32].filter((x) => le(cost(x), I(18000)))).toEqual([25, 30]);
    expect(eq(cost(30), I(18000))).toBe(true);
    expect(eq(cost(32), I(18400))).toBe(true);
  });

  it('E4 — x = 40 ; 100, 160 et 60 sont faux et portent leur erreur', () => {
    expect(eq(cost(40), I(20000))).toBe(true);
    expect(eq(div(sub(I(20000), I(12000)), I(200)), I(40))).toBe(true);
    expect(eq(div(I(20000), I(200)), I(100))).toBe(true); // car oublié
    expect(eq(div(add(I(20000), I(12000)), I(200)), I(160))).toBe(true); // + 12000 annulé par une addition
    expect(eq(div(I(12000), I(200)), I(60))).toBe(true);
    for (const w of [100, 160, 60]) expect(eq(cost(w), I(20000))).toBe(false);
  });

  it('E5 — 20000 / 40 = 500 ; 10 000 000, 0,025 et 19500 ne vérifient pas la relation', () => {
    expect(eq(div(I(20000), I(40)), I(500))).toBe(true);
    const q = (x) => div(I(20000), x);
    expect(eq(mul(I(20000), I(500)), I(10000000))).toBe(true);
    expect(eq(div(I(500), I(20000)), F(25, 1000))).toBe(true);
    expect(eq(sub(I(20000), I(500)), I(19500))).toBe(true);
    for (const w of [I(10000000), F(25, 1000), I(19500)]) expect(eq(q(w), I(500))).toBe(false);
  });

  it('chaque épreuve : quatre options, la bonne en tête, toutes distinctes, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['2am_wadiya-idmajiya-mafhum-muadala_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : cinq données utiles, deux inutiles, trois étapes ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(5);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, DID_YOU_KNOW]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    const seen = JSON.stringify(SITUATION) + tahlil;
    for (const v of ['19200', '12000+200x', '7200', 'x=40', '=40', '500']) expect(seen, v).not.toContain(v);
  });

  it('أستعدّ — six affirmations, les réponses [✗ ✓ ✗ ✓ ✗ ✓], les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([false, true, false, true, false, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(5n * 2n + 1n).toBe(11n); // 5n + 1 : 11 et non 12 pour n = 2
    expect(3n * 2n * 2n).toBe(12n);
    expect((3n * 2n) ** 2n).toBe(36n);
    expect(4n * 3n + 1n === 13n && 2n * 3n + 7n === 13n).toBe(true);
    expect(eq(div(I(9), F(6, 10)), I(15))).toBe(true);
    expect(eq(mul(I(9), F(6, 10)), F(54, 10))).toBe(true);
    expect(3n * 6n + 12n).toBe(30n);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'mafhum-muadala', grade: '2am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-mafhum-muadala');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.pointsToLearn[0].length).toBeLessThanOrEqual(255);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['ibara-harfiya-intaj', 'ikhtibar-musawat-mutabayina', 'hall-mushkil-muadala']);
    expect(entry.pointPrerequisites.P1).toEqual(['2am_ibara-harfiya-intaj_P2', '2am_hall-mushkil-muadala_P3', '2am_ikhtibar-musawat-mutabayina_P1', '2am_ikhtibar-musawat-mutabayina_P3']);
  });
});
