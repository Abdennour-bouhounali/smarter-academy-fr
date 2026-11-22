import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXERCISES, EX, FINAL } from './exercises';
import { PREP_PLATFORM_ITEMS, LAB } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Les clés du درس « جمع وطرح عددين نسبيين » recalculées avec un code INDÉPENDANT de `relative.js` : un lecteur de décimaux (texte LaTeX → centièmes, BigInt) et les règles écrites à la main.
 * Chaque bonne réponse est vérifiée vraie, chaque distracteur FAUX, chaque affirmation de « أستعدّ » a la vérité qu'elle annonce.
 */
const num = (s) => {
  const t = String(s).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/[()]/g, '').replace(/\+/g, '').replace(/\s/g, '');
  const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) throw new Error(`illisible : ${s}`);
  const v = BigInt(m[2]) * 100n + BigInt((m[3] ?? '').padEnd(2, '0').slice(0, 2) || '0');
  return m[1] === '-' ? -v : v;
};
const abs = (x) => (x < 0n ? -x : x);
/** La règle écrite à la main : même signe → somme des distances ; signes différents → différence des distances, signe de la plus grande. */
const addRule = (a, b) => {
  if (a === 0n || b === 0n) return a + b;
  if ((a < 0n) === (b < 0n)) return a < 0n ? -(abs(a) + abs(b)) : abs(a) + abs(b);
  const big = abs(a) >= abs(b) ? a : b;
  const d = abs(a) >= abs(b) ? abs(a) - abs(b) : abs(b) - abs(a);
  return big < 0n ? -d : d;
};
const subRule = (a, b) => addRule(a, -b);
const rows = (id) => EX[id].question.rows;
const checkNumeric = (id, wants) => {
  rows(id).slice(0, wants.length).forEach((r, i) => {
    r.options.forEach((o, k) => expect(num(o) === wants[i], `${id} ligne ${i} option ${o}`).toBe(k === r.correct));
  });
};
const n = (x) => num(String(x));

describe('le درس « جمع وطرح عددين نسبيين » — clés recalculées', () => {
  it('la règle écrite à la main = l’addition exacte, sur tout un balayage', () => {
    for (let a = -1200; a <= 1200; a += 25) for (let b = -1200; b <= 1200; b += 25) {
      expect(addRule(BigInt(a), BigInt(b))).toBe(BigInt(a + b));
      expect(subRule(BigInt(a), BigInt(b))).toBe(BigInt(a - b));
    }
  });

  it('act-3 : quatre sommes de deux manches', () => {
    checkNumeric('act-3', [addRule(n(8), n(-3)), addRule(n(-6), n(6)), addRule(n(-5), n(-4)), addRule(n(7), n(-12))]);
  });

  it('act-4 : (−3)+(−6) et (−8)−(+4) par (+4)+(−4)', () => {
    // ligne 1 : des égalités écrites, chacune VRAIE ; seule celle dont le second membre est −9 est la bonne (l'abaissement de 6 degrés)
    rows('act-4')[0].options.forEach((o, k) => {
      const m = /\(([+-]?\d+)\)([+-])\(([+-]?\d+)\)=\(([+-]?\d+)\)/.exec(o.replace(/\$/g, ''));
      const left = m[2] === '+' ? addRule(n(m[1]), n(m[3])) : subRule(n(m[1]), n(m[3]));
      expect(left, o).toBe(n(m[4]));
      expect(n(m[4]) === n(-9), o).toBe(k === rows('act-4')[0].correct);
    });
    checkNumeric('act-4', [], 0);
    rows('act-4')[1].options.forEach((o, k) => expect(num(o) === subRule(n(-8), n(4)), o).toBe(k === rows('act-4')[1].correct));
    expect(n(-8) + n(4) + n(-4) - (n(-8) + n(4) + n(-4))).toBe(0n);
    expect(addRule(n(4), n(-4))).toBe(0n);
  });

  it('ex-25 : six sommes', () => {
    checkNumeric('ex-25', [addRule(n(9), n(-4)), addRule(n(-7), n(2)), addRule(n(-6), n(-8)), addRule(n(-4.6), n(4.6)), addRule(n(3.75), n(-5.25)), addRule(n(-2.8), n(-6.2))]);
  });

  it('ex-28 : le terme manquant rend la mise en équation vraie, aucune autre option ne la rend vraie', () => {
    const eq = [(x) => x + n(4) === n(-9), (x) => n(-6) + x === n(2), (x) => n(3) - x === n(10)];
    rows('ex-28').forEach((r, i) => r.options.forEach((o, k) => expect(eq[i](num(o)), `${i} ${o}`).toBe(k === r.correct)));
  });

  it('ex-30 : le pyramide', () => {
    const base = [-5, 8, -2, -6].map(n);
    const l2 = [addRule(base[0], base[1]), addRule(base[1], base[2]), addRule(base[2], base[3])];
    const l3 = [addRule(l2[0], l2[1]), addRule(l2[1], l2[2])];
    const top = addRule(l3[0], l3[1]);
    checkNumeric('ex-30', [l2[0], l2[1], l2[2], top]);
    expect(l2).toEqual([n(3), n(6), n(-8)]);
    expect(top).toBe(n(7));
  });

  it('ex-32 : cinq différences', () => {
    checkNumeric('ex-32', [subRule(n(-11), n(-4)), subRule(n(7), n(15)), subRule(n(9), n(-9)), subRule(n(-2.5), n(7.5)), subRule(n(1.6), n(4.25))]);
  });

  it('ex-33 : chaque différence est égale à la somme choisie, et à elle seule', () => {
    const pairs = [[3, -8], [-3, 8], [-3, -8]];
    rows('ex-33').forEach((r, i) => {
      const want = subRule(n(pairs[i][0]), n(pairs[i][1]));
      r.options.forEach((o, k) => {
        const m = /\(([+-]\d+)\)\+\(([+-]\d+)\)/.exec(o.replace(/\$/g, ''));
        expect(addRule(n(m[1]), n(m[2])) === want, o).toBe(k === r.correct);
      });
    });
  });

  it('deep-38 : le contre-exemple (+3)+(+4)=7 > 4', () => {
    expect(addRule(n(3), n(4))).toBe(n(7));
    expect(n(7) > n(4)).toBe(true);
    expect(addRule(n(-3), n(-4)) < n(-4)).toBe(true);
    expect(EX['deep-38'].question.correct).toBe(0);
  });

  it('le إختبار أولي : chaque clé recalculée, chaque distracteur faux', () => {
    const e = Object.fromEntries(FINAL.map((f) => [f.id, f]));
    const want = { E1: addRule(n(-7), n(-9)), E2: addRule(n(-13), n(8)), E3: subRule(n(6), n(-4)), E4: subRule(n(-3.5), n(1.5)), E5: subRule(n(3), n(-4)) };
    for (const id of Object.keys(want)) e[id].options.forEach((o, k) => expect(n(o) === want[id], `${id} ${o}`).toBe(k === e[id].correct));
    // les distracteurs nommés de la fiche
    expect(addRule(n(-13), n(8)) === -n(5)).toBe(true);
    expect(n(-7) + n(-9)).not.toBe(n(16)); // SIGNLOST
    expect(abs(n(-7)) - abs(n(-9))).not.toBe(n(-16)); // SUBDIST
    expect(subRule(n(6), n(-4))).not.toBe(addRule(n(6), n(-4))); // SUBNOFLIP : 6 − 4 = 2
    expect(addRule(n(6), n(-4))).toBe(n(2));
    expect(addRule(n(-3.5), n(1.5))).toBe(n(-2));
    expect(addRule(n(-4), n(3))).toBe(n(-1)); // ADDINSTEAD
    expect(FINAL.map((f) => f.options.length)).toEqual([4, 4, 4, 4, 4]);
  });

  it('le إختبار أولي dans le module : chaque option du fichier, la clé à la bonne place', () => {
    const src = readFileSync(new URL('../modules/Module08Itqan.jsx', import.meta.url), 'utf8');
    for (const f of FINAL) for (const o of f.options) expect(src.includes(`'$${o.replace(',', '{,}')}$'`), `${f.id} ${o}`).toBe(true);
    expect(src.match(/correct: 0/g)).toHaveLength(5);
  });

  it('« أستعدّ » : la vérité annoncée', () => {
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual([true, false, true, true, true, false]);
    expect(abs(n(-6.5))).toBe(n(6.5));
    expect(-n(3.2)).not.toBe(n(-2.3));
    expect(abs(n(-9)) > abs(n(5))).toBe(true);
    expect(n(8.4) + n(5.2)).toBe(n(13.6));
    expect(n(5.2) - n(3.7)).toBe(n(1.5));
    expect(n(9) - n(2)).toBe(n(7));
    expect(n(-4) < n(-1)).toBe(true);
  });

  it('le labo : les deux cartes de معارف', () => {
    const [m1, m2] = LAB.maarif.tasks;
    expect(addRule(n(m1.a), n(m1.b))).toBe(n(-5));
    expect(subRule(n(m2.a), n(m2.b))).toBe(n(10));
    expect(m2.predict).toBe(true);
  });

  it('les modules de la configuration', () => {
    expect(LESSON_CONFIG.modules).toHaveLength(9);
    expect(EXERCISES).toHaveLength(8);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
  });
});
