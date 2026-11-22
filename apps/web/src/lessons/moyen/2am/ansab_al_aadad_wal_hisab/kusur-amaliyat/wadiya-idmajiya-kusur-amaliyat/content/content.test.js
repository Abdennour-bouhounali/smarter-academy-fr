import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, DID_YOU_KNOW } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_2am_2026_2027.json';
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
const lt = (a, b) => a.n * b.d < b.n * a.d;
const I = (n) => F(n);
const ONE = I(1);
const W = F(3, 8); const P = F(1, 4); const O = F(1, 8); const A = F(2, 3);

describe('« أدمج تعلّماتي — الكسور والعمليات عليها » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);
  const planted = add(add(W, P), O);
  const orchard = sub(ONE, planted);
  const apple = mul(A, orchard);
  const land = mul(I(120), I(80));
  const wheatArea = mul(W, land);

  it('E1 — 3/8 + 1/4 + 1/8 = 3/4 ; 5/20, 5/8 et 6/24 sont faux et portent leur erreur', () => {
    expect(eq(planted, F(3, 4))).toBe(true);
    expect(eq(F(3 + 1 + 1, 8 + 4 + 8), F(1, 4))).toBe(true); // 5/20 = 1/4 ≠ 3/4 : ACROSS
    expect(eq(F(3 + 1 + 1, 8 + 4 + 8), planted)).toBe(false);
    expect(eq(add(add(W, O), O), F(5, 8))).toBe(true); // 1/4 lu 1/8
    expect(eq(F(3 + 2 + 1, 8 + 8 + 8), F(1, 4))).toBe(true); // 6/24 : numérateurs réécrits, dénominateurs ajoutés
    for (const wrong of [F(5, 20), F(5, 8), F(6, 24)]) expect(eq(wrong, planted)).toBe(false);
    expect(get('E1').options[0]).toContain('\\frac{3}{4}');
  });

  it('E2 — le verger 1/4 ; le plus grand est le blé (3/8 > 1/4 > 1/8) ; 3/4, le plus grand dénominateur (8) et 5/8 sont faux', () => {
    expect(eq(orchard, F(1, 4))).toBe(true);
    expect(lt(O, P) && lt(P, W)).toBe(true);
    expect(eq(sub(ONE, W), F(5, 8))).toBe(true);
    expect(eq(F(3, 4), orchard)).toBe(false);
    expect(eq(sub(ONE, W), orchard)).toBe(false);
    expect(8 > 4 && lt(O, P)).toBe(true); // le plus grand dénominateur est le plus PETIT des trois
  });

  it('E3 — les deux tiers du verger valent 2/3 × 1/4 = 1/6 de la terre ; 2/3, 11/12 et 8/3 sont faux', () => {
    expect(eq(apple, F(1, 6))).toBe(true);
    expect(eq(add(A, orchard), F(11, 12))).toBe(true);
    expect(eq(F(2 * 4, 3 * 1), F(8, 3))).toBe(true);
    for (const wrong of [A, F(11, 12), F(8, 3)]) expect(eq(wrong, apple)).toBe(false);
  });

  it('E4 — 120 × 80 = 9600 ; le pommier 1600 ; 400 (périmètre), 6400 (2/3 de la terre) et 2400 (tout le verger) sont faux', () => {
    expect(eq(land, I(9600))).toBe(true);
    expect(eq(mul(apple, land), I(1600))).toBe(true);
    expect(eq(mul(I(2), add(I(120), I(80))), I(400))).toBe(true);
    expect(eq(mul(F(1, 6), I(400)), F(200, 3))).toBe(true);
    expect(eq(mul(A, land), I(6400))).toBe(true);
    expect(eq(mul(orchard, land), I(2400))).toBe(true);
    expect(eq(mul(orchard, land), mul(apple, land))).toBe(false);
  });

  it('E5 — 3600 m² de blé ; 0,48 < 1750/3600 < 0,49 ; les trois autres encadrements sont FAUX', () => {
    expect(eq(wheatArea, I(3600))).toBe(true);
    const q = F(1750, 3600);
    const between = (x, lo, hi) => lt(lo, x) && lt(x, hi);
    expect(between(q, F(48, 100), F(49, 100))).toBe(true);
    expect(3600n * 48n <= 1750n * 100n && 1750n * 100n < 3600n * 49n).toBe(true);
    expect(between(q, F(49, 100), F(50, 100))).toBe(false);
    expect(between(div(I(3600), I(1750)), F(205, 100), F(206, 100))).toBe(true); // quotient retourné : 2,057…
    expect(between(q, F(205, 100), F(206, 100))).toBe(false);
    expect(between(F(1750, 2400), F(72, 100), F(73, 100))).toBe(true); // aire du blé remplacée par celle des pommes de terre (1/4)
    expect(eq(mul(P, land), I(2400))).toBe(true);
    expect(between(q, F(72, 100), F(73, 100))).toBe(false);
  });

  it('chaque épreuve : quatre options, la bonne en tête, toutes distinctes, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['2am_wadiya-idmajiya-kusur-amaliyat_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : six données utiles, deux inutiles, trois étapes ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(6);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, DID_YOU_KNOW]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    const seen = JSON.stringify(SITUATION) + tahlil;
    for (const v of ['frac{3}{4}', 'frac{1}{6}', '9600', '1600', '3600', '0{,}48']) expect(seen).not.toContain(v);
  });

  it('أستعدّ — six affirmations, les réponses [✓ ✗ ✓ ✓ ✗ ✓], les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, false, true, true, false, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(12n * 13n + 2n === 158n && 2n < 12n).toBe(true);
    // 10/3 = 3,333… : 3,33 par défaut, 3,34 par excès
    expect(333n * 3n < 1000n && 1000n < 334n * 3n).toBe(true);
    expect(eq(sub(F(5, 6), F(1, 3)), F(1, 2))).toBe(true);
    expect(eq(mul(F(3, 4), F(2, 9)), F(1, 6))).toBe(true);
    expect(lt(F(5, 12), F(1, 2))).toBe(true);
    expect(eq(add(add(add(F(1, 2), F(1, 4)), F(1, 6)), F(1, 12)), ONE)).toBe(true);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'kusur-amaliyat', grade: '2am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-kusur-amaliyat');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['qisma-iqlidiya-hasr', 'kasr-hasil-qisma', 'jam-tarh-kusur', 'jida-kasrayn', 'muqarana-kasrayn']);
    expect(entry.pointPrerequisites.P1).toEqual(['2am_qisma-iqlidiya-hasr_P2', '2am_kasr-hasil-qisma_P4', '2am_jam-tarh-kusur_P3', '2am_jida-kasrayn_P3', '2am_muqarana-kasrayn_P3']);
  });
});
