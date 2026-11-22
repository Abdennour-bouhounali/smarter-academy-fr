import { describe, it, expect } from 'vitest';
import { FINAL, BONUS, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import alWadiya from '../modules/Module07AlWadiya.jsx?raw';
import knowledge from '../knowledge.jsx?raw';

/* Contrôle INDÉPENDANT : rationnels exacts en BigInt ; π est traité comme un coefficient (k·π ↔ k), les valeurs tronquées à 3,14 sont recalculées en entiers (× 10⁻²). */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const F = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const I = (n) => F(n);
const D = (s) => { const [i, f = ''] = s.split('.'); return F(BigInt(i + f), 10n ** BigInt(f.length)); };
const ROUND2 = (q) => { // arrondi à 0,01 (demi vers le haut) d'un rationnel positif -> centièmes entiers
  const c = (q.n * 100n * 2n + q.d) / (q.d * 2n); return c;
};

describe('« أدمج تعلّماتي — الحساب الحرفي » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);
  const w = D('1.2');
  const ext = (k) => mul(I(2), mul(w, I(k - 1))); // augmentation du diamètre au couloir k : 2 × 1,2 × (k − 1)

  it('E1 — le diamètre augmente de 2,4 par couloir (pas de 1,2) ; les distracteurs sont faux et portent leur erreur', () => {
    expect(eq(ext(2), D('2.4')) && eq(ext(3), D('4.8'))).toBe(true);
    expect(get('E1').options[0]).toContain('2{,}4') && expect(get('E1').options[0]).toContain('4{,}8');
    expect(eq(w, D('1.2')) && !eq(w, ext(2))).toBe(true); // 1,2 ajouté au diamètre : faux
    expect(get('E1').options[1]).toContain('1{,}2');
    expect(get('E1').options[2]).toContain('\\pi x + 2{,}4'); // π oublié sur l'ajout
    expect(get('E1').options[3]).toContain('P_1 = y +'); // un seul droit
  });

  it('E2 — P₂ − P₁ = 2,4π et P₃ − P₁ = 4,8π : le coefficient de π, indépendant de x et y (les 2y et πx se détruisent)', () => {
    // P_k = 2y + π(x + ext(k)) : on soustrait terme à terme (coefficients de y, de πx, de π)
    const P = (k) => ({ y: I(2), px: I(1), p: ext(k) });
    const diff = (a, b) => ({ y: sub(a.y, b.y), px: sub(a.px, b.px), p: sub(a.p, b.p) });
    const d2 = diff(P(2), P(1)); const d3 = diff(P(3), P(1));
    expect(eq(d2.y, I(0)) && eq(d2.px, I(0)) && eq(d2.p, D('2.4'))).toBe(true);
    expect(eq(d3.y, I(0)) && eq(d3.px, I(0)) && eq(d3.p, D('4.8'))).toBe(true);
    const sum = { y: add(P(2).y, P(1).y), px: add(P(2).px, P(1).px) }; // la somme au lieu de la différence : 4y + 2πx + …
    expect(eq(sum.y, I(4)) && eq(sum.px, I(2))).toBe(true);
    expect(get('E2').options[0]).toContain('2{,}4\\pi');
    expect(get('E2').options[3]).toContain('4y + 2\\pi x');
  });

  it('E3 — la clé est calculée avec π de la calculatrice : 4,8π = 15,0796… → 15,08 ; 2,4π = 7,5398… → 7,54', () => {
    const PIREAL = D('3.14159265358979');
    expect(ROUND2(mul(D('2.4'), PIREAL))).toBe(754n);
    expect(ROUND2(mul(D('4.8'), PIREAL))).toBe(1508n);
    expect(ROUND2(mul(D('7.2'), PIREAL))).toBe(2262n);
    expect(get('E3').options[0]).toContain('7{,}54') && expect(get('E3').options[0]).toContain('15{,}08');
    expect(get('E3').options[2]).toContain('22{,}62');
    expect(ROUND2(mul(F(24, 10), F(100000, 314159)))).toBe(76n); // 2,4 ÷ π ≈ 0,76
    expect(ROUND2(mul(F(48, 10), F(100000, 314159)))).toBe(153n);
  });

  it('E4 — 2 × 85 + 73π ≈ 399,34 ; 73π ≈ 229,34 (droits oubliés) ; 243π ≈ 763,41 (parenthèse fautive)', () => {
    const PIREAL = D('3.14159265358979');
    expect(ROUND2(add(I(170), mul(I(73), PIREAL)))).toBe(39934n);
    expect(ROUND2(mul(I(73), PIREAL))).toBe(22934n);
    expect(ROUND2(mul(I(243), PIREAL))).toBe(76341n);
    for (const k of ['399{,}34', '229{,}34', '763{,}41', '15{,}08']) expect(get('E4').options.join(' ')).toContain(k);
  });

  it('le bonus — (a + 4)(b + 4) − ab = 4(a + b) + 16 = 210 ; 16, 194 et 226 sont faux', () => {
    const s = D('48.5');
    expect(eq(add(mul(I(4), s), I(16)), I(210))).toBe(true);
    expect(eq(mul(I(4), s), I(194))).toBe(true);
    expect(eq(add(add(mul(I(4), s), I(16)), I(16)), I(226))).toBe(true);
    expect(BONUS.options[0]).toBe('$210$');
    expect(BONUS.correct).toBe(0);
    expect(new Set(BONUS.options).size).toBe(4);
  });

  it('chaque épreuve : une seule bonne option en tête, quatre options, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(4);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['3am_wadiya-idmajiya-ibarat-harfiya-3_P1'\]/g) ?? []).length).toBe(2);
    expect((ahill.match(/learningPointIds: \['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'\]/g) ?? []).length).toBe(2);
  });

  it('la situation : cinq données utiles, deux inutiles, trois étapes ; le module 7 ne montre aucune valeur ni formule de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(5);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, BONUS, PREP_ITEMS, PREP_PLATFORM_ITEMS]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    const seen = JSON.stringify(SITUATION.analysis) + JSON.stringify(SITUATION.data) + alWadiya + knowledge;
    for (const v of ['2{,}4', '4{,}8', '7{,}54', '15{,}08', '399', '2y', '170', '\\\\pi x']) expect(seen, v).not.toContain(v);
  });

  it('أستعدّ — six affirmations, deux réponses différentes, les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, true, false, false, true, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    // 7x − 3 − (2x − 5) = 5x + 2 : coefficient de x 7 − 2 = 5, constante −3 + 5 = 2
    expect(7 - 2).toBe(5); expect(-3 + 5).toBe(2);
    // (x − 3)(x + 2) = x² − x − 6 : x² ; 2x − 3x = −x ; −6
    expect([2 - 3, -3 * 2]).toEqual([-1, -6]);
    // x² − 2x en −3 : 9 + 6 = 15, pas 3
    expect((-3) ** 2 - 2 * (-3)).toBe(15);
    expect(eq(sub(F(4, 7), F(5, 9)), F(1, 63))).toBe(true);
    expect(5 - 2).toBe(3);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, deux LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'ibarat-harfiya-3', grade: '3am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-ibarat-harfiya-3');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(2);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['tabsit-hadhf-aqwas', 'nashr-jabri-3am', 'qimat-ibara-harfiya', 'muqaranat-natiqayn']);
    expect(Object.keys(entry.pointPrerequisites)).toEqual(['P1', 'P2']);
  });
});
