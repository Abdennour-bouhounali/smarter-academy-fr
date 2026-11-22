import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, TRUCKS, OPENER_STORY, REMARKS } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';

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
const dec = (s) => { const neg = s.startsWith('-'); const [i, f = ''] = s.replace('-', '').split(','); const r = F(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? mul(r, I(-1)) : r; };
/** a x + b = c x + d → x = (d − b) / (a − c). */
const solve = ([a, b], [c, d]) => div(sub(d, b), sub(a, c));
/** Arrondi demi supérieur au pas p. */
const roundTo = (x, p) => { const q = div(x, p); const fl = q.n / q.d; return mul(F(le(dec('0,5'), sub(q, F(fl))) ? fl + 1n : fl), p); };
/** Ensemble { x : arrondi(x, p) = r } : [r − p/2 ; r + p/2[, reconstruit par balayage d'une grille fine. */
const roundSet = (r, p) => {
  const step = div(p, I(1000)); const pts = [];
  for (let k = -700n; k <= 700n; k++) { const x = add(r, mul(F(k), step)); if (eq(roundTo(x, p), r)) pts.push(x); }
  return { lo: pts[0], hiExcluded: add(pts.at(-1), step) };
};

// Les données de la situation du module 8, retapées.
const XBOX = solve([I(12), I(40)], [I(8), I(140)]);
const LOAD = add(mul(I(12), XBOX), I(40));

describe('« أدمج تعلّماتي — المساويات – المتباينات – المعادلات » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);

  it('E1 — 12x + 40 = 8x + 140 ; seule cette équation a pour solution 25 (une autre : 4x = 180, 9, 22…) et les trois autres sont fausses', () => {
    expect(eq(XBOX, I(25))).toBe(true);
    expect(get('E1').options[0]).toBe('$12x + 40 = 8x + 140$');
    // chaque distracteur, résolu, ne donne pas la même charge sur les deux camions pour x = 25
    expect(eq(add(mul(I(12), I(25)), mul(I(8), I(25))), add(I(40), I(140)))).toBe(false); // 12x + 8x = 40 + 140
    expect(eq(add(mul(I(12), I(25)), I(140)), add(mul(I(8), I(25)), I(40)))).toBe(false); // charges échangées
    expect(eq(add(I(12), mul(I(40), I(25))), add(I(8), mul(I(140), I(25))))).toBe(false); // 12 + 40x = 8 + 140x
    expect(eq(add(mul(I(12), I(25)), I(40)), add(mul(I(8), I(25)), I(140)))).toBe(true);
  });

  it('E2 — x = 25 ; 45 (4x = 180), 22,5 (180 ÷ 8) et −25 sont faux', () => {
    expect(eq(solve([I(12), I(40)], [I(8), I(140)]), I(25))).toBe(true);
    expect(get('E2').options[0]).toBe('$x = 25$');
    expect(eq(solve([I(12), I(-40)], [I(8), I(140)]), I(45))).toBe(true); // signe gardé : 4x = 180
    expect(eq(div(I(180), I(8)), dec('22,5'))).toBe(true);
    for (const w of [I(45), dec('22,5'), I(-25)]) expect(eq(w, XBOX)).toBe(false);
    expect(get('E2').options).toEqual(['$x = 25$', '$x = 45$', '$x = 22{,}5$', '$x = -25$']);
  });

  it('E3 — la charge commune 340 kg ; 300, 380 et 440 sont faux', () => {
    expect(eq(LOAD, I(340))).toBe(true);
    expect(eq(add(mul(I(8), XBOX), I(140)), I(340))).toBe(true);
    expect(eq(mul(I(12), XBOX), I(300))).toBe(true);
    expect(eq(add(mul(I(12), XBOX), I(80)), I(380))).toBe(true);
    expect(eq(add(mul(I(12), XBOX), I(140)), I(440))).toBe(true);
    for (const w of [300, 380, 440]) expect(eq(I(w), LOAD)).toBe(false);
    expect(get('E3').options[0]).toBe('$340$');
  });

  it('E4 — 340 + 25k ≤ 500 ⟹ k ≤ 6,4 ; le plus grand entier est 6 ; 7 dépasse, 6,4 n\'est pas entier, 20 oublie la charge', () => {
    const kmax = div(sub(I(500), LOAD), XBOX);
    expect(eq(kmax, dec('6,4'))).toBe(true);
    let best = 0; while (le(add(LOAD, mul(I(25), I(best + 1))), I(500))) best++;
    expect(best).toBe(6);
    expect(lt(I(500), add(LOAD, mul(I(25), I(7))))).toBe(true);
    expect(eq(div(I(500), I(25)), I(20))).toBe(true);
    expect(lt(I(500), add(LOAD, mul(I(25), I(20))))).toBe(true);
    expect(get('E4').options[0]).toBe('$6$');
  });

  it('E5 — lecture 25,0 à 0,1 : 24,95 ≤ x < 25,05 ; 339,4 ≤ L < 340,6 ; les trois autres sont faux', () => {
    const { lo, hiExcluded } = roundSet(dec('25,0'), dec('0,1'));
    expect(eq(lo, dec('24,95')) && eq(hiExcluded, dec('25,05'))).toBe(true);
    const L = (x) => add(mul(I(12), x), I(40));
    expect(eq(L(lo), dec('339,4')) && eq(L(hiExcluded), dec('340,6'))).toBe(true);
    expect(get('E5').options[0]).toBe('$339{,}4 \\le L < 340{,}6$');
    // troncature : 25 ≤ x < 25,1 donnerait 340 ≤ L < 341,2 ; borne haute incluse ; 40 kg oubliés
    expect(eq(L(I(25)), I(340)) && eq(L(dec('25,1')), dec('341,2'))).toBe(true);
    expect(eq(mul(I(12), lo), dec('299,4')) && eq(mul(I(12), hiExcluded), dec('300,6'))).toBe(true);
    expect(eq(roundTo(hiExcluded, dec('0,1')), dec('25,1'))).toBe(true); // 25,05 s'arrondit à 25,1 : la borne haute est EXCLUE
  });

  it('chaque épreuve : une seule bonne option en tête, quatre options, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    // une seule الكفاءة principale par épreuve : E1–E3 P2, E4–E5 P1
    expect((ahill.match(/_P2'\] \}/g) ?? []).length).toBe(3);
    expect((ahill.match(/_P1'\] \}/g) ?? []).length).toBe(2);
  });

  it('la poursuite de Tipaza : 40t = 36t + 2 ⟹ t = 1/2 h = 30 min ; 20 km ; 13 km ; d ≤ 1,5 ; trois données utiles, deux inutiles ; aucune ligne ne renvoie au manuel', () => {
    const t = solve([I(40), I(0)], [I(36), I(2)]);
    expect(eq(t, F(1, 2))).toBe(true);
    expect(eq(mul(t, I(60)), I(30))).toBe(true);
    expect(eq(mul(I(40), t), I(20)) && eq(add(mul(I(36), t), I(2)), I(20))).toBe(true);
    expect(lt(I(15), I(20))).toBe(true); // 20 km > 15 km : pas avant la ligne
    // écart 1,3 : 4t = 1,3, t = 0,325 h = 19,5 min → 20 min (demi supérieur), 13 km < 15
    const t2 = solve([I(40), I(0)], [I(36), dec('1,3')]);
    expect(eq(t2, dec('0,325'))).toBe(true);
    expect(eq(mul(t2, I(60)), dec('19,5'))).toBe(true);
    expect(eq(roundTo(mul(t2, I(60)), I(1)), I(20))).toBe(true);
    expect(eq(mul(I(40), t2), I(13))).toBe(true);
    expect(lt(I(13), I(15))).toBe(true);
    // pas de la 3e et 4e option : 76 t = 1,3
    expect(lt(div(dec('1,3'), I(76)), dec('0,02'))).toBe(true);
    // borne de l'écart : 10 d ≤ 15 ⟺ d ≤ 1,5, testé sur 0…30 dixièmes
    for (let k = 0; k <= 30; k++) { const d = F(k, 10); expect(le(mul(I(10), d), I(15))).toBe(le(d, dec('1,5'))); }
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(3);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(5);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, OPENER_STORY, TRUCKS, REMARKS]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    expect(tahlil).toContain('KnowledgeSnapshot moduleNumber={7} variant="memo"');
    // le module 8 est une AUTRE situation : ses valeurs (25, 340, 6,4) ne sont pas dans le module 7
    for (const v of ['340', '6{,}4', '339{,}4']) expect(JSON.stringify(SITUATION) + tahlil).not.toContain(v);
    expect(TRUCKS.text).toContain('12') && expect(TRUCKS.text).toContain('140');
  });

  it('أستعدّ — sept affirmations, les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(7);
    expect(all.map((i) => i.answer)).toEqual([true, false, true, false, true, true, false]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(7);
    expect(eq(add(sub(mul(I(2), I(7)), I(5)), I(5)), I(14))).toBe(true); // 2x − 5 = 9 ⟹ 2x = 14 (x = 7)
    expect(eq(roundTo(dec('3,465'), dec('0,01')), dec('3,47'))).toBe(true);
    const { lo, hiExcluded } = roundSet(dec('2,3'), dec('0,1'));
    expect(eq(lo, dec('2,25')) && eq(hiExcluded, dec('2,35'))).toBe(true);
    expect(eq(sub(mul(I(5), I(3)), I(4)), add(mul(I(2), I(3)), I(5)))).toBe(true);
    expect(eq(solve([I(3), I(7)], [I(1), I(-1)]), I(-4))).toBe(true);
    // x ≤ 4 ⟹ x − 6 ≤ −2 et a < b ⟹ −2a > −2b, vérifiés sur une grille
    for (let a = -6; a <= 6; a++) for (let b = a + 1; b <= 7; b++) expect(lt(mul(I(-2), I(b)), mul(I(-2), I(a)))).toBe(true);
    for (let x = -10; x <= 4; x++) expect(le(sub(I(x), I(6)), I(-2))).toBe(true);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, deux LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'musawiyat-mutabayinat', grade: '3am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-musawiyat-mutabayinat');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(2);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['musawiyat-amaliyat', 'mutabayinat-amaliyat', 'hasr-adad-ushri', 'muadalat-darajat-ula']);
  });
});
