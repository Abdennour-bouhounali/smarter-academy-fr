import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';

/* Contrôle INDÉPENDANT en BigInt (décimaux à un chiffre). */
const q = (n, d = 1n) => ({ n: d < 0n ? -n : n, d: d < 0n ? -d : d });
const mul = (a, b) => q(a.n * b.n, a.d * b.d);
const add = (a, b) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => add(a, q(-b.n, b.d));
const div = (a, b) => q(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n * b.d === b.n * a.d;
const I = (n) => q(BigInt(n));
const D = (s) => { const [i, f = ''] = String(s).split('.'); return q(BigInt(i + f), 10n ** BigInt(f.length)); };
const K = D('1.8');
const toF = (c) => add(mul(K, c), I(32));
const toC = (f) => div(sub(f, I(32)), K);
const approx = (x, v) => Math.abs(Number(x.n) / Number(x.d) - v) < 0.006;

describe('« أدمج تعلّماتي — الأعداد النسبية » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);

  it('E1 — Sétif : 1,8 × (−3) + 32 = 26,6 ; chaque distracteur est faux et porte son erreur', () => {
    const key = toF(I(-3));
    expect(eq(key, D('26.6'))).toBe(true);
    expect(get('E1').options[0]).toContain('26{,}6');
    expect(eq(sub(mul(K, I(-3)), I(32)), D('-37.4'))).toBe(true); // 32 retranché au lieu d'ajouté
    expect(eq(add(mul(K, I(3)), I(32)), D('37.4'))).toBe(true); // signe perdu
    expect(eq(mul(K, add(I(-3), I(32))), D('52.2'))).toBe(true); // somme avant le produit
    for (const v of ['-37.4', '37.4', '52.2']) expect(eq(D(v), key)).toBe(false);
  });

  it('E2 — Montréal : (−13 − 32) ÷ 1,8 = −25 ; vérifié par la conversion inverse', () => {
    const key = toC(I(-13));
    expect(eq(key, I(-25))).toBe(true);
    expect(eq(toF(key), I(-13))).toBe(true);
    expect(approx(div(add(I(-13), I(32)), K), 10.56)).toBe(true);
    expect(approx(sub(I(-13), div(I(32), K)), -30.78)).toBe(true);
    expect(eq(mul(sub(I(-13), I(32)), K), I(-81))).toBe(true);
  });

  it('E3, E4 — la comparaison se fait dans un même سلّم ; le fossé vaut 22', () => {
    const sif = I(-3); const mon = toC(I(-13));
    expect(mon.n * sif.d < sif.n * mon.d).toBe(true); // −25 < −3
    expect(toF(sif).n * I(-13).d > I(-13).n * toF(sif).d).toBe(true); // 26,6 > −13
    expect(eq(sub(sif, mon), I(22))).toBe(true);
    expect(eq(add(sif, mon), I(-28))).toBe(true);
    expect(get('E4').options[0]).toContain('22');
  });

  it('E5 — −40 est le même nombre en °C et en °F', () => {
    expect(eq(toF(I(-40)), I(-40))).toBe(true);
    expect(eq(mul(K, I(-40)), I(-72))).toBe(true);
    expect(eq(mul(K, add(I(-40), I(32))), D('-14.4'))).toBe(true);
    expect(eq(add(mul(K, I(40)), I(32)), I(104))).toBe(true);
  });

  it('chaque épreuve : une seule bonne option en tête, quatre options, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['3am_wadiya-idmajiya-aadad-nisbiya_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : trois données utiles, deux inutiles, trois étapes d\'analyse ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(3);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS]);
    expect(visible).not.toMatch(/الكتاب|ص\s*\d+/);
  });

  it('أستعدّ — six affirmations, deux réponses différentes, la clé recalculée', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, false, true, false, true, false]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(eq(mul(I(-4), D('-2.5')), I(10))).toBe(true);
    expect(eq(mul(mul(mul(I(-1), I(2)), I(-3)), I(-5)), I(-30))).toBe(true);
    expect(eq(mul(D('-0.7'), D('-0.7')), D('0.49'))).toBe(true);
    expect(eq(div(I(-45), I(9)), I(-5))).toBe(true);
    expect(eq(sub(I(8), mul(I(2), I(-3))), I(14))).toBe(true);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'aadad-nisbiya', grade: '3am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-aadad-nisbiya');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['jidaa-adadayn-nisbiyayn', 'jidaa-ida-nisbiya', 'qismat-nisbiyayn']);
  });
});
