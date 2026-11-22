import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, DID_YOU_KNOW } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';

/* Contrôle INDÉPENDANT : fractions exactes en BigInt. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const I = (n) => F(n);
const ONE = I(1);
const T = F(1, 3); const B = F(1, 4); const G = F(3, 5);

describe('« أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);
  const spent = add(T, B);
  const rest = sub(ONE, spent);
  const gift = mul(G, rest);
  const left = sub(rest, gift);

  it('E1 — 1/3 + 1/4 = 7/12 ; les distracteurs sont faux et portent leur erreur', () => {
    expect(eq(spent, F(7, 12))).toBe(true);
    expect(get('E1').options[0]).toContain('\\frac{7}{12}');
    expect(eq(F(1 + 1, 3 + 4), F(2, 7))).toBe(true); // ACROSS
    expect(eq(mul(T, B), F(1, 12))).toBe(true); // produit
    expect(eq(rest, F(5, 12))).toBe(true); // le reste donné pour la somme
    for (const wrong of [F(2, 7), F(1, 12), F(5, 12)]) expect(eq(wrong, spent)).toBe(false);
  });

  it('E2 — le reste 5/12 ; 7/12, 5/7 et 11/12 sont faux', () => {
    expect(eq(rest, F(5, 12))).toBe(true);
    expect(eq(sub(ONE, F(2, 7)), F(5, 7))).toBe(true);
    expect(eq(sub(ONE, mul(T, B)), F(11, 12))).toBe(true);
    for (const wrong of [F(7, 12), F(5, 7), F(11, 12)]) expect(eq(wrong, rest)).toBe(false);
  });

  it('E3 — la remise vaut 3/5 × 5/12 = 1/4 ; 3/5 (du tout), 7/20, 2/3 sont faux', () => {
    expect(eq(gift, F(1, 4))).toBe(true);
    expect(eq(mul(G, spent), F(7, 20))).toBe(true);
    expect(eq(add(F(3, 12), F(5, 12)), F(2, 3))).toBe(true);
    for (const wrong of [G, F(7, 20), F(2, 3)]) expect(eq(wrong, gift)).toBe(false);
  });

  it('E4 — ce qui reste : 5/12 − 1/4 = 1/6 ; −11/60 (3/5 du tout), 1/4, 1/3 sont faux', () => {
    expect(eq(left, F(1, 6))).toBe(true);
    const wholeTrap = sub(sub(sub(ONE, T), B), G);
    expect(eq(wholeTrap, F(-11, 60))).toBe(true);
    expect(eq(add(add(T, B), G), F(71, 60))).toBe(true);
    expect(eq(sub(spent, gift), F(1, 3))).toBe(true);
    for (const wrong of [F(-11, 60), F(1, 4), F(1, 3)]) expect(eq(wrong, left)).toBe(false);
  });

  it('E5 — 1500 ÷ 1/6 = 9000 ; le sac 3000, les livres 2250, le don 2250 ; 250 et 6000 sont faux', () => {
    const total = div(I(1500), left);
    expect(eq(total, I(9000))).toBe(true);
    expect(eq(mul(T, total), I(3000)) && eq(mul(B, total), I(2250)) && eq(mul(gift, total), I(2250))).toBe(true);
    expect(eq(add(add(mul(T, total), mul(B, total)), add(mul(gift, total), I(1500))), total)).toBe(true);
    expect(eq(mul(I(1500), left), I(250))).toBe(true); // ÷ lu ×
    expect(eq(div(I(1500), gift), I(6000))).toBe(true); // le don pris pour le reste
    expect(eq(mul(T, I(6000)), I(2000))).toBe(true);
  });

  it('chaque épreuve : une seule bonne option en tête, quatre options, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['3am_wadiya-idmajiya-kusur-natiqa_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : quatre données utiles, deux inutiles, trois étapes d\'analyse ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(4);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, DID_YOU_KNOW]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    const seen = JSON.stringify(SITUATION) + tahlil;
    for (const v of ['frac{7}{12}', 'frac{5}{12}', 'frac{1}{6}', '9000']) expect(seen).not.toContain(v);
  });

  it('أستعدّ — six affirmations, deux réponses différentes, les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, true, true, false, true, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(eq(add(F(1, 4), F(2, 3)), F(11, 12)) && eq(div(ONE, F(11, 12)), F(12, 11))).toBe(true);
    expect(5n * 5n > 3n * 8n).toBe(true); // 5/8 > 3/5 : 25 > 24
    expect(eq(sub(F(5, 6), F(1, 4)), F(7, 12))).toBe(true);
    expect(eq(F(9, -12), F(-3, 4))).toBe(true); expect(eq(F(9, -12), F(3, 4))).toBe(false);
    expect(eq(div(F(-2, 3), F(4, 9)), F(-3, 2))).toBe(true);
    expect(eq(mul(F(3, 4), F(2, 5)), F(3, 10))).toBe(true);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'kusur-natiqa', grade: '3am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-kusur-natiqa');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['maqlub-qismat-kasrayn', 'tasawi-muqaranat-kasrayn', 'jam-tarh-kasrayn', 'adad-natiq', 'amaliyat-natiqa']);
  });
});
