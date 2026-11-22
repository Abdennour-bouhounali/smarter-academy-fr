import { describe, it, expect } from 'vitest';
import moduleEight from '../modules/Module08Itqan.jsx?raw';
import { PREP_ITEMS, LAB, KNOWLEDGE, METHOD_COMPARE, GUIDE } from './textbook';
import { EX, EXERCISES, FINAL, LP } from './exercises';
import { LEVELS } from '../../../../../../common/manipulations/levels.js';

/* ── Arithmétique EXACTE (BigInt) : un décimal « 4{,}35 » ou une fraction décimale « \frac{63}{100} » → { n, k } ─────────────────────── */
const dec = (s) => { const [i, f = ''] = String(s).replace(/\{,\}/g, '.').replace(',', '.').split('.'); return { n: BigInt(i + f), k: f.length }; };
const cmp = (a, b) => {
  const k = Math.max(a.k, b.k);
  const p = a.n * 10n ** BigInt(k - a.k); const q = b.n * 10n ** BigInt(k - b.k);
  return p < q ? -1 : p > q ? 1 : 0;
};
/** « $4{,}6\ \ldots\ 4{,}35$ » → les deux opérandes (décimaux, naturels ou fractions décimales). */
function operand(text) {
  const frac = /\\frac\{(\d+)\}\{(\d+)\}/.exec(text);
  if (frac) return { n: BigInt(frac[1]), k: frac[2].length - 1 };
  return dec(text.replace(/\$/g, '').replace(/\\,/g, '').trim());
}
const operands = (label) => {
  const body = label.replace(/\$/g, '');
  const [l, r] = body.split('\\ \\ldots\\ ');
  return [operand(l), operand(r)];
};
const SYM = { '<': -1, '>': 1, '=': 0 };
/** Une chaîne « a < b < c » (ou « > ») → { values, sym }. */
function parseChain(opt) {
  const body = opt.replace(/\$/g, '').replace(/\\,/g, '');
  const sym = body.includes('>') ? '>' : '<';
  return { sym, values: body.split(sym).map((v) => dec(v.trim())) };
}
const isSorted = ({ sym, values }) => values.every((v, i) => i === 0 || cmp(values[i - 1], v) === SYM[sym]);
const key = (r) => r.options[r.correct];
/** Une ligne de relation : la clé est la relation exacte, aucun autre symbole ne l'est. */
function expectRelation(row, where) {
  const [a, b] = operands(row.label);
  const truth = cmp(a, b);
  row.options.forEach((o, j) => {
    const sym = o.replace(/\$/g, '').trim();
    expect(SYM[sym] === truth, `${where}: « ${sym} » (${j})`).toBe(j === row.correct);
  });
}

describe('« مقارنة الأعداد العشرية وترتيبها » — chaque clé recalculée en arithmétique exacte', () => {
  it('أستعدّ : la vérité de chaque affirmation', () => {
    const truth = [
      462 < 624, // vrai
      987 > 1203, // faux
      '17.48'.split('.')[1][0] === '4', // vrai
      '6.305'.split('.')[1][1] === '3', // faux (c'est 0)
      cmp(dec('6.50'), dec('6.5')) === 0, // vrai
      cmp(dec('0.05'), dec('0.5')) === 0, // faux
    ];
    expect(PREP_ITEMS.map((it) => it.answer)).toEqual(truth);
    expect(new Set(PREP_ITEMS.map((it) => it.answer)).size).toBe(2);
    expect(PREP_ITEMS.every((it) => ['tabii', 'maratib', 'asfar'].includes(it.skill))).toBe(true);
  });

  it('les nombres du labo sont ceux des préréglages de levels.js et chaque tâche a la solution documentée', () => {
    const pair = LEVELS['ruler-compare'];
    expect(pair.beginner.numbers.tasks).toEqual(LAB.beginner);
    expect(pair.advanced.numbers.tasks).toEqual(LAB.advanced);
    // les quatre comparaisons : 4,6 > 4,35 ; 8,05 < 8,5 ; 12,70 = 12,7 ; 9,87 < 10,2
    expect(LAB.beginner.map((t) => cmp(dec(t.a), dec(t.b)))).toEqual([1, -1, 0, -1]);
    // les suites à ranger : l'ordre croissant et l'ordre décroissant sont uniques à égalité près
    const sorted = (t) => [...t.values].sort((x, y) => (t.dir === 'asc' ? cmp(dec(x), dec(y)) : cmp(dec(y), dec(x))));
    expect(sorted(LAB.advanced[0])).toEqual(['6,98', '7,04', '7,4', '7,405', '7,45']);
    expect(sorted(LAB.advanced[1]).map(String)).toEqual(['3', '2,5', '2,500', '2,05', '0,75']);
    expect(sorted(LAB.method[0])).toEqual(['9,105', '9,15', '15,04', '15,309', '15,39', '15,4']);
    // le piège de la première tâche : lus comme des entiers, 35 > 6 (le contraire du vrai ordre)
    expect(Number('35') > Number('6') && cmp(dec('4,35'), dec('4,6')) < 0).toBe(true);
    // chaque suite a au moins 5 nombres, un égal ou un entier (les cas d'achoppement du labo)
    expect(LAB.advanced[1].values.some((v) => !v.includes(','))).toBe(true);
    expect(cmp(dec('2,5'), dec('2,500'))).toBe(0);
  });

  it('act-5 : la vérité de chaque affirmation des quatre amis', () => {
    // 5,12 > 5,3 ? faux (lina) ; 5,12 < 5,3 par les parts de cent (yusuf) vrai ; rayan 5,3 > 5,12 vrai ; sayf 5,3 < 5,12 faux
    const truth = [cmp(dec('5,12'), dec('5,3')) > 0, cmp(dec('5,12'), dec('5,3')) < 0, cmp(dec('5,3'), dec('5,12')) > 0, cmp(dec('5,3'), dec('5,12')) < 0];
    expect(EX['act-5'].question.rows.map((r) => r.answer)).toEqual(truth);
    expect(cmp(dec('5,3'), dec('5,30'))).toBe(0);
    expect(30 > 12).toBe(true); // 30 parts de cent contre 12
  });

  it('ex-17 et ex-18 : la clé est la relation exacte, aucun autre symbole ne l\'est', () => {
    EX['ex-17'].question.rows.forEach((r, i) => expectRelation(r, `ex-17[${i}]`));
    EX['ex-18'].question.rows.forEach((r, i) => expectRelation(r, `ex-18[${i}]`));
    expect(EX['ex-17'].question.rows.map((r) => r.correct)).toEqual([0, 1, 1, 2, 0, 2]);
    expect(EX['ex-18'].question.rows.map((r) => r.correct)).toEqual([1, 0, 0, 1, 2, 0]);
  });

  it('ex-19 et ex-20 : une seule chaîne est dans le bon ordre, et elle contient exactement les nombres de l\'énoncé', () => {
    const asc = EX['ex-19'].question.rows; const desc = EX['ex-20'].question.rows;
    const sameNumbers = (row, sym) => {
      const stated = row.label.replace(/\$/g, '').split('\\ ;\\ ').map((x) => dec(x.trim()));
      row.options.forEach((o, j) => {
        const c = parseChain(o);
        expect(c.values, `${row.label} option ${j}`).toHaveLength(stated.length);
        stated.forEach((s) => expect(c.values.some((v) => cmp(v, s) === 0), `${o} contient ${s.n}/${s.k}`).toBe(true));
        expect(isSorted(c) && c.sym === sym, `${row.label} option ${j}`).toBe(j === row.correct);
      });
    };
    asc.forEach((r) => sameNumbers(r, '<'));
    desc.forEach((r) => sameNumbers(r, '>'));
    expect(asc.length + desc.length).toBe(5);
  });

  it('deep-3 : le plus petit et le plus grand décimal formés avec 5, 0, 8, 3 et une virgule, sans zéro inutile', () => {
    // toutes les écritures : une permutation des quatre chiffres et une position de virgule (0..3 chiffres après)
    const digits = ['5', '0', '8', '3'];
    const perms = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((d, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [d, ...p])));
    const valid = [];
    for (const p of perms(digits)) {
      for (let after = 1; after <= 3; after += 1) {
        const s = `${p.slice(0, 4 - after).join('')},${p.slice(4 - after).join('')}`;
        const [intPart, fracPart] = s.split(',');
        if (intPart.length > 1 && intPart.startsWith('0')) continue; // 05,38 : zéro de tête inutile
        if (fracPart.endsWith('0')) continue; // zéro final inutile
        valid.push(s);
      }
    }
    const sorted = [...new Set(valid)].sort((a, b) => cmp(dec(a), dec(b)));
    const [smallRow, largeRow] = EX['deep-3'].question.rows;
    expect(`$${sorted[0].replace(',', '{,}')}$`).toBe(key(smallRow));
    expect(`$${sorted.at(-1).replace(',', '{,}')}$`).toBe(key(largeRow));
    // chaque distracteur est un nombre formé avec les mêmes chiffres, mais ce n'est ni le plus petit ni le plus grand
    smallRow.options.forEach((o, j) => { if (j !== smallRow.correct) expect(cmp(dec(o.replace(/\$/g, '')), dec(sorted[0]))).toBe(1); });
    largeRow.options.forEach((o, j) => { if (j !== largeRow.correct) expect(cmp(dec(o.replace(/\$/g, '')), dec(sorted.at(-1)))).toBe(-1); });
  });

  it('ict : le tableau de notes', () => {
    const marks = { ريم: '14,5', ياسين: '14,25', سلمى: '9,75', أيمن: '14,05', لينا: '16', كريم: '9,5' };
    const names = Object.keys(marks);
    const byMark = [...names].sort((a, b) => cmp(dec(marks[a]), dec(marks[b])));
    const [highest, lowest, three] = EX.ict.question.rows;
    expect(key(highest)).toBe(byMark.at(-1));
    expect(key(lowest)).toBe(byMark[0]);
    expect(key(three)).toBe('ريم ثم ياسين ثم أيمن');
    expect(['ريم', 'ياسين', 'أيمن'].sort((a, b) => cmp(dec(marks[b]), dec(marks[a])))).toEqual(['ريم', 'ياسين', 'أيمن']);
    for (const r of [highest, lowest]) r.options.forEach((o, j) => { if (j !== r.correct) expect(o).not.toBe(key(r)); });
    // aucun distracteur de « lowest » n'est le minimum, aucun de « highest » le maximum
    expect(lowest.options.filter((o) => o === byMark[0])).toHaveLength(1);
    expect(highest.options.filter((o) => o === byMark.at(-1))).toHaveLength(1);
  });

  it('chaque exercice déclare une des trois الكفاءات, et chacune est travaillée', () => {
    const lps = new Set(Object.values(LP));
    for (const e of EXERCISES) expect(lps.has(e.learningPointId), e.id).toBe(true);
    expect(new Set(EXERCISES.map((e) => e.learningPointId)).size).toBe(3);
    for (const e of EXERCISES.filter((x) => x.interaction === 'batch')) {
      for (const r of e.question.rows) { expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length); }
    }
  });

  it('إختبار أولي : chaque clé est recalculée, chaque distracteur est faux ; le module porte les mêmes littéraux', () => {
    const relation = (o) => {
      const body = o.replace(/\$/g, '');
      const m = /^(.+?)([<>=])(.+)$/.exec(body);
      return SYM[m[2]] === cmp(dec(m[1]), dec(m[3]));
    };
    for (const f of FINAL) {
      if (f.kind === 'trueStatement') f.options.forEach((o, k) => expect(relation(o), `${f.id} option ${k}`).toBe(k === f.correct));
      if (f.kind === 'larger') {
        const [a, b] = f.pair; const bigger = cmp(dec(a), dec(b)) > 0 ? a : b;
        expect(f.options[f.correct].replace(/\$/g, '')).toBe(bigger.replace(',', '{,}'));
        expect(f.options.filter((o) => o.replace(/\$/g, '') === bigger.replace(',', '{,}'))).toHaveLength(1);
      }
      if (f.kind === 'ascending') f.options.forEach((o, k) => expect(isSorted(parseChain(o)) && parseChain(o).sym === '<', `${f.id} option ${k}`).toBe(k === f.correct));
      if (f.kind === 'max') {
        const top = [...f.set].sort((a, b) => cmp(dec(b), dec(a)))[0];
        f.options.forEach((o, k) => expect(cmp(dec(o.replace(/\$/g, '')), dec(top)) === 0, `${f.id} option ${k}`).toBe(k === f.correct));
        expect(f.options.length).toBe(f.set.length);
      }
      // le module affiche exactement ces options et cette clé
      expect(moduleEight, f.id).toContain(`id: '${f.id}'`);
      for (const o of f.options) expect(moduleEight.replace(/\\\\/g, '\\'), `${f.id} ${o}`).toContain(o);
      expect(moduleEight).toContain(`correct: ${f.correct}`);
      expect(moduleEight).toContain(f.lp);
    }
    expect(FINAL.map((f) => f.lp)).toEqual([LP.P1, LP.P2, LP.P2, LP.P3, LP.P3]);
  });

  it('معارف et طريقة : les exemples du texte sont justes', () => {
    expect(cmp(dec('4,35'), dec('4,6'))).toBe(-1);
    expect(cmp(dec('4,6'), dec('4,60'))).toBe(0);
    expect(cmp(dec('9,87'), dec('10,2'))).toBe(-1);
    expect(cmp(dec('8,05'), dec('8,5'))).toBe(-1);
    expect(cmp(dec('2,105'), dec('2,3'))).toBe(-1); // le plus long n'est pas le plus grand
    expect(cmp(dec('4,70'), dec('4,7'))).toBe(0);
    expect(cmp(dec('5,37'), dec('5,359'))).toBe(1);
    // معارف : 0,7 < 1,07 < 1,5 < 2,25 < 3
    ['0,7', '1,07', '1,5', '2,25', '3'].forEach((v, i, a) => { if (i) expect(cmp(dec(a[i - 1]), dec(v))).toBe(-1); });
    // طريقة 3 : 23,48 < 23,5 ; 19,9 < 23,05 < 23,48 < 23,5
    expect(cmp(dec('23,48'), dec('23,5'))).toBe(-1);
    ['19,9', '23,05', '23,48', '23,5'].forEach((v, i, a) => { if (i) expect(cmp(dec(a[i - 1]), dec(v))).toBe(-1); });
    expect(METHOD_COMPARE.solution.join(' ')).toContain('19{,}9<23{,}05<23{,}48<23{,}5');
    expect(KNOWLEDGE.wholeParts.text).toContain('9{,}87<10{,}2');
    // les trois erreurs courantes sont des erreurs
    expect(cmp(dec('4,35'), dec('4,6')) > 0).toBe(false);
    expect(cmp(dec('2,105'), dec('2,3')) > 0).toBe(false);
    expect(cmp(dec('4,70'), dec('4,7')) > 0).toBe(false);
    expect(GUIDE.digitsAsNatural.right).toContain('4{,}35<4{,}6');
  });
});
