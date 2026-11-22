import { describe, it, expect } from 'vitest';
import { EXERCISES, EX, FINAL, LP } from './exercises';
import { LAB, PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import * as RT from '../../../../../../common/manipulations/logic/robotTrack';
import itqan from '../modules/Module08Itqan.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';

/* Arithmétique de contrôle INDÉPENDANTE du cœur : fractions en BigInt, lues depuis le LaTeX de l'énoncé. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const fr = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
const mulF = ([a, b], [c, d]) => fr(a * c, b * d);
const addF = ([a, b], [c, d]) => fr(a * d + c * b, b * d);
const subF = (x, y) => addF(x, [-y[0], y[1]]);
const eqF = (x, y) => x[0] === y[0] && x[1] === y[1];
const negF = (x) => [-x[0], x[1]];
/** « -2{,}5 », « (-8) », « −0,3 » → fraction. */
function num(text) {
  const s = text.replace(/[()\s$]/g, '').replace(/−/g, '-').replace(/\{,\}|,/g, '.');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m) throw new Error(`nombre illisible : ${text}`);
  const dec = m[3] ?? '';
  return fr(BigInt(`${m[1]}${m[2]}${dec}`), 10n ** BigInt(dec.length));
}
/** « (-8) \times 5 » → produit. */
const product = (tex) => tex.replace(/\$/g, '').split('\\times').map(num).reduce(mulF, [1n, 1n]);
const optValue = (o) => num(o.replace(/\$/g, ''));
const negCount = (tex) => tex.replace(/\$/g, '').split('\\times').filter((t) => num(t)[0] < 0n).length;

describe('جداء عدة أعداد نسبية — les exercices (clés recalculées en BigInt)', () => {
  it('chaque exercice est dans le catalogue de la leçon, avec une compétence de la leçon', () => {
    expect(EXERCISES.length).toBe(10);
    for (const e of EXERCISES) expect(Object.values(LP)).toContain(e.learningPointId);
    expect(Object.keys(EX).length).toBe(EXERCISES.length);
  });

  it('deep-51 : la clé est le MOT « معاكس » du nombre (−1 × a), chaque distracteur est FAUX', () => {
    const rows = EX['deep-51'].question.rows;
    expect(rows.length).toBe(5);
    for (const r of rows) {
      const a = num(r.label.replace(/\\times/g, ' ').replace('(-1)', '').trim());
      const key = negF(a);
      r.options.forEach((o, i) => expect(eqF(optValue(o), key), `${r.label} ${o}`).toBe(i === r.correct));
    }
  });

  it('ex-5 : chaque clé est le produit de l’énoncé, chaque distracteur est faux', () => {
    for (const r of EX['ex-5'].question.rows) {
      const key = product(r.label);
      r.options.forEach((o, i) => expect(eqF(optValue(o), key), `${r.label} ${o}`).toBe(i === r.correct));
    }
    expect(EX['ex-5'].question.rows.map((r) => [negCount(r.label), eqF(product(r.label), fr(0n))])).toEqual([[2, false], [3, false], [3, false]]);
    expect(EX['ex-5'].question.rows.map((r) => optValue(r.options[r.correct])[0])).toEqual([30n, -6n, -60n]);
  });

  it('now-11 : le nombre de facteurs négatifs décide de la clé (40 facteurs → pair, 7 → impair, 4 négatifs → pair)', () => {
    const rows = EX['now-11'].question.rows;
    const pos = (r) => r.options[r.correct] === 'موجب';
    expect(rows.map(pos)).toEqual([true, false, true]);
    expect(40 % 2).toBe(0);
    expect(7 % 2).toBe(1);
    expect(negCount('2 \\times (-1) \\times 7 \\times (-4) \\times (-3) \\times 5 \\times (-6)')).toBe(4);
    expect(product('2 \\times (-1) \\times 7 \\times (-4) \\times (-3) \\times 5 \\times (-6)')[0] > 0n).toBe(true);
    for (const r of rows) expect(r.options.length).toBe(2);
  });

  it('ex-13 : (−1) × … × (−13) a treize facteurs négatifs, impair, donc négatif', () => {
    let p = [1n, 1n];
    for (let i = 1n; i <= 13n; i += 1n) p = mulF(p, fr(-i));
    expect(p[0] < 0n).toBe(true);
    const q = EX['ex-13'].question;
    expect(q.options[q.correct]).toContain('سالب');
    expect(q.options.filter((o) => o.startsWith('سالب')).length).toBe(2);
    expect(q.options.filter((o) => o.startsWith('سالب') && /آخر/.test(o)).length).toBe(1); // une option fausse « سالب » : justification fausse
  });

  it('deep-44 : retourner les 3 puis 4 signes (−1)³ = −1, (−1)⁴ = 1', () => {
    const rows = EX['deep-44'].question.rows;
    expect(eqF(optValue(rows[0].options[rows[0].correct]), mulF(fr(12n), fr(-1n)))).toBe(true);
    expect(eqF(optValue(rows[1].options[rows[1].correct]), fr(30n))).toBe(true);
    // contrôle sur un exemple : 2 × 3 × 2 = 12 ; (−2)(−3)(−2) = −12 ; 2 × 3 × 5 × 1 = 30 ; (−2)(−3)(−5)(−1) = 30
    expect(eqF(product('(-2) \\times (-3) \\times (-2)'), fr(-12n))).toBe(true);
    expect(eqF(product('(-2) \\times (-3) \\times (-5) \\times (-1)'), fr(30n))).toBe(true);
    rows.forEach((r) => r.options.forEach((o, i) => { if (i !== r.correct) expect(eqF(optValue(o), optValue(r.options[r.correct])), o).toBe(false); }));
  });

  it('deep-42 : les programmes A et B donnent la même valeur ; les distracteurs sont faux', () => {
    const rows = EX['deep-42'].question.rows;
    const A = (x) => subF(negF(x), fr(5n));
    const B = (x) => addF(mulF(x, fr(-1n)), fr(-5n));
    expect(eqF(A(num('6,4')), B(num('6,4')))).toBe(true);
    expect(eqF(A(num('-2,5')), B(num('-2,5')))).toBe(true);
    expect(eqF(optValue(rows[0].options[rows[0].correct]), A(num('6,4')))).toBe(true);
    expect(eqF(optValue(rows[1].options[rows[1].correct]), B(num('-2,5')))).toBe(true);
    rows.forEach((r) => r.options.forEach((o, i) => { if (i !== r.correct) expect(eqF(optValue(o), optValue(r.options[r.correct])), o).toBe(false); }));
    expect(EX['deep-42b'].question.correct).toBe(0);
  });

  it('deep-39 : n négatifs = 2 × p positifs est toujours pair → positif (essai exhaustif)', () => {
    for (let p = 0; p <= 10; p += 1) expect((2 * p) % 2).toBe(0);
    const q = EX['deep-39'].question;
    expect(q.options[q.correct]).toBe('موجب');
  });

  it('deep-49 : (−4) × (6 − 9) = 12 et (−7 − 3) × (−0,5) = 5, par les deux directions', () => {
    const a = mulF(fr(-4n), subF(fr(6n), fr(9n)));
    const a2 = subF(mulF(fr(-4n), fr(6n)), mulF(fr(-4n), fr(9n)));
    expect(eqF(a, a2)).toBe(true);
    const b = mulF(subF(fr(-7n), fr(3n)), num('-0,5'));
    const b2 = subF(mulF(fr(-7n), num('-0,5')), mulF(fr(3n), num('-0,5')));
    expect(eqF(b, b2)).toBe(true);
    const rows = EX['deep-49'].question.rows;
    expect(eqF(optValue(rows[0].options[rows[0].correct]), a)).toBe(true);
    expect(eqF(optValue(rows[1].options[rows[1].correct]), b)).toBe(true);
    rows.forEach((r) => r.options.forEach((o, i) => { if (i !== r.correct) expect(eqF(optValue(o), optValue(r.options[r.correct])), o).toBe(false); }));
  });
});

describe('les exemples des encadrés sont justes', () => {
  it('know-3, know-5, know-6, know-7, method-1/2/4', () => {
    expect(eqF(product('(-1) \\times 8{,}4'), num('-8,4'))).toBe(true);
    expect(eqF(product('(-1) \\times (-3)'), fr(3n))).toBe(true);
    expect(eqF(product('2 \\times (-5) \\times (-1) \\times (-3)'), fr(-30n))).toBe(true);
    expect(eqF(product('(-2) \\times (-2) \\times (-5) \\times (-0{,}5)'), fr(10n))).toBe(true);
    expect(eqF(product('(-1{,}5) \\times (-1{,}5)'), num('2,25'))).toBe(true);
    expect(eqF(product('(1{,}5) \\times (1{,}5)'), num('2,25'))).toBe(true);
    expect(eqF(product('(-3{,}2) \\times 10'), fr(-32n))).toBe(true);
    expect(eqF(addF(mulF(num('-3,2'), fr(7n)), mulF(num('-3,2'), fr(3n))), fr(-32n))).toBe(true);
    expect(eqF(subF(mulF(fr(-25n), fr(4n)), mulF(fr(-25n), num('0,4'))), fr(-90n))).toBe(true);
    expect(eqF(mulF(fr(-25n), subF(fr(4n), num('0,4'))), fr(-90n))).toBe(true);
    expect(eqF(product('2 \\times (-5) \\times (-1{,}5) \\times (-4)'), fr(BigInt(METHOD.steps.numbers.A)))).toBe(true);
    expect(eqF(product('11 \\times (-2) \\times (-1) \\times (-3) \\times (-5)'), fr(BigInt(METHOD.steps.numbers.B)))).toBe(true);
    expect(eqF(product('(-2) \\times 0{,}5 \\times (-8) \\times 3 \\times (-1)'), fr(-24n))).toBe(true);
    expect(eqF(product('(-4) \\times 0{,}07 \\times (-25) \\times (-3)'), fr(-21n))).toBe(true);
    expect(eqF(product('4 \\times 25 \\times 0{,}07 \\times 3'), fr(21n))).toBe(true);
    expect(eqF(product('(-1) \\times (-1) \\times 5 \\times (-2) \\times 0'), fr(0n))).toBe(true);
    expect(KNOWLEDGE.parity.lines.length).toBe(2);
  });
});

describe('le إختبار أولي — FINAL recalculé, options littérales dans le module', () => {
  const byId = (id) => FINAL.find((x) => x.id === id);
  it('E1 : trois facteurs négatifs → négatif', () => {
    expect(negCount(byId('E1').tex)).toBe(3);
    expect(product(byId('E1').tex)[0] < 0n).toBe(true);
    expect(byId('E1').options[byId('E1').correct]).toBe('سالب');
  });
  it('E2 … E5 : la première option est la valeur, les autres sont fausses', () => {
    for (const id of ['E2', 'E4']) {
      const f = byId(id);
      f.options.forEach((o, i) => expect(eqF(num(o), product(f.tex)), `${id} ${o}`).toBe(i === f.correct));
    }
    const sq = byId('E3');
    const key = mulF(num('-0,3'), num('-0,3'));
    expect(eqF(key, num('0,09'))).toBe(true);
    sq.options.forEach((o, i) => expect(eqF(num(o), key), o).toBe(i === sq.correct));
    const d = byId('E5');
    const dkey = addF(mulF(fr(-6n), fr(17n)), mulF(fr(-6n), fr(3n)));
    d.options.forEach((o, i) => expect(eqF(num(o), dkey), o).toBe(i === d.correct));
    expect(eqF(dkey, fr(-120n))).toBe(true);
    // −99 = (−6) × 17 + 3 (le second produit oublié), 120 = signe oublié, −20 = somme des facteurs −6 + ... faux
    expect(eqF(addF(mulF(fr(-6n), fr(17n)), fr(3n)), fr(-99n))).toBe(true);
  });
  it('le module contient chaque option littérale et ses bonnes réponses sont en tête', () => {
    for (const f of FINAL) {
      for (const o of f.options) {
        const lit = f.kind === 'sign' ? `'${o}'` : `'$${o.replace(/\\/g, '\\\\')}$'`;
        expect(itqan.includes(lit), `${f.id} ${o}`).toBe(true);
      }
      expect(itqan.includes(f.tex.replace(/\\/g, '\\\\')), f.id).toBe(true);
      expect(f.correct).toBe(0);
    }
    // chaque الكفاءة a une épreuve
    for (const p of ['P1', 'P2', 'P3', 'P4']) expect(itqan).toContain(`3am_jidaa-ida-nisbiya_${p}`);
  });
});

describe('« أستعدّ » : sept affirmations, vraies et fausses, avec leur justification', () => {
  it('les valeurs des affirmations', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.length).toBe(7);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    expect(eqF(product('(-6) \\times (-5)'), fr(30n))).toBe(true);
    expect(eqF(product('(-0{,}5) \\times 8'), fr(-4n))).toBe(true);
    expect(-8 + 3).toBe(-5);
    expect(17 % 2).toBe(1);
    expect(-7 + 7).toBe(0);
    const L = [-4.5, -3, -3.5, -4, -3.2];
    expect(Math.max(...L)).toBe(-3);
    expect(astaidd).toContain("requires: ['zawjiya']");
  });
});

describe('le labo : les nombres de la leçon sont ceux du preset, atteignables, et la logique les accepte', () => {
  it('LAB = preset de levels.js', () => {
    expect(LAB.beginner).toEqual(LEVELS['robot-track'].beginner.numbers);
    expect(LAB.advanced).toEqual(LEVELS['robot-track'].advanced.numbers);
    expect(() => RT.init(LAB.beginner)).not.toThrow();
    expect(() => RT.init(LAB.advanced)).not.toThrow();
    expect(() => RT.init(LAB.square)).not.toThrow();
  });
  it('les missions du preset : m3 (−24), m4 (24, deux négatives), a1 (−12), a2 (−2 après deux cartes, arrêt final 20), a3 (−3 puis 3)', () => {
    const p = (...v) => v.map((x) => num(x)).reduce(mulF, [1n, 1n]);
    expect(eqF(p('2', '-3', '4'), fr(-24n))).toBe(true);
    expect(eqF(p('-2', '-3', '4'), fr(24n))).toBe(true);
    expect(eqF(p('-2', '3', '-1', '-4', '0,5'), fr(-12n))).toBe(true);
    expect(eqF(p('4', '-0,5'), fr(-2n))).toBe(true);
    expect(eqF(p('-5', '4', '-0,5', '2'), fr(20n))).toBe(true);
    expect(eqF(p('3', '-1', '-1', '-1'), fr(-3n))).toBe(true);
    expect(eqF(p('3', '-1', '-1'), fr(3n))).toBe(true);
  });
  it('la durée : 64 minutes sans les مسائل, 88 avec (≤ 90)', () => {
    const sum = (ms) => ms.reduce((a, m) => a + m.estimatedMin, 0);
    const all = LESSON_CONFIG.modules;
    expect(sum(all.filter((m) => m.track !== 'problem'))).toBe(64);
    expect(sum(all)).toBe(88);
    expect(LESSON_CONFIG.estimatedDurationMin).toBe(88);
  });
});
