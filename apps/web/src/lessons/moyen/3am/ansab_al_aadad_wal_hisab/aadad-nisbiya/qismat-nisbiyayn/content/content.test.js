import { describe, it, expect } from 'vitest';
import { EXERCISES, EX, FINAL, LP, DATA, BRACKETS } from './exercises';
import { LAB, PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD, GUIDE } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import * as CL from '../../../../../../common/manipulations/logic/codeLockers';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import itqan from '../modules/Module08Itqan.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';

/* Arithmétique de contrôle INDÉPENDANTE du cœur : fractions en BigInt, lues depuis le LaTeX de l'énoncé. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const fr = (n, d = 1n) => { if (d === 0n) throw new Error('division par 0'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
const mulF = ([a, b], [c, d]) => fr(a * c, b * d);
const divF = ([a, b], [c, d]) => fr(a * d, b * c);
const addF = ([a, b], [c, d]) => fr(a * d + c * b, b * d);
const subF = (x, y) => addF(x, [-y[0], y[1]]);
const negF = (x) => [-x[0], x[1]];
const eqF = (x, y) => x[0] === y[0] && x[1] === y[1];
/** « -2{,}5 », « (-8) », « −0,3 », « \frac{-2}{3} » → fraction. */
function num(text) {
  let s = text.replace(/[\s$]/g, '').replace(/−/g, '-').replace(/\{,\}|,/g, '.');
  const f = /^\\frac\{(.+)\}\{(.+)\}$/.exec(s);
  if (f) return divF(num(f[1]), num(f[2]));
  s = s.replace(/[()]/g, '');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m) throw new Error(`nombre illisible : ${text}`);
  const dec = m[3] ?? '';
  return fr(BigInt(`${m[1]}${m[2]}${dec}`), 10n ** BigInt(dec.length));
}
/** Un évaluateur d'expressions (+ − × ÷ et parenthèses, priorités), écrit ICI : le test ne dépend pas de relativeOps. */
function evalExpr(tex) {
  const src = tex.replace(/\$/g, '').replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\{,\}/g, '.').replace(/,/g, '.').replace(/−/g, '-').replace(/\s+/g, '');
  let i = 0;
  const peek = () => src[i];
  const number = () => { const m = /^\d+(?:\.\d+)?/.exec(src.slice(i)); if (!m) throw new Error(`nombre attendu en ${i} : ${src}`); i += m[0].length; return num(m[0]); };
  const atom = () => {
    if (peek() === '(') { i += 1; const v = sum(); if (peek() !== ')') throw new Error('« ) » attendue'); i += 1; return v; }
    if (peek() === '-') { i += 1; return negF(atom()); }
    return number();
  };
  const prod = () => { let v = atom(); while (peek() === '*' || peek() === '/') { const o = peek(); i += 1; const w = atom(); v = o === '*' ? mulF(v, w) : divF(v, w); } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const o = peek(); i += 1; const w = prod(); v = o === '+' ? addF(v, w) : subF(v, w); } return v; };
  const v = sum();
  if (i !== src.length) throw new Error(`reste « ${src.slice(i)} »`);
  return v;
}
const optValue = (o) => num(o.replace(/\$/g, ''));
const flip = (x) => negF(x);

describe('حاصل قسمة عددين نسبيين — les exercices (clés recalculées en BigInt)', () => {
  it('neuf exercices, chacun dans le catalogue de la leçon avec une compétence de la leçon ; chaque compétence est exercée', () => {
    expect(EXERCISES.length).toBe(9);
    for (const e of EXERCISES) expect(Object.values(LP)).toContain(e.learningPointId);
    expect(new Set(EXERCISES.map((e) => e.learningPointId)).size).toBe(4);
    expect(Object.keys(EX).length).toBe(EXERCISES.length);
  });

  it('act-4 (E1) : la clé est a ÷ b ; b × clé = a ; chaque distracteur est FAUX et porte son erreur nommée', () => {
    const rows = EX['act-4'].question.rows;
    expect(rows.length).toBe(4);
    rows.forEach((r, k) => {
      const { a, b, first } = DATA.MISSING[k];
      const key = divF(num(a), num(b));
      expect(eqF(mulF(num(b), key), num(a)), r.label).toBe(true);
      expect(eqF(optValue(r.options[r.correct]), key), r.label).toBe(true);
      r.options.forEach((o, i) => { if (i !== r.correct) expect(eqF(mulF(num(b), optValue(o)), num(a)), `${r.label} ${o}`).toBe(false); });
      // les erreurs nommées : l'opposé (SIGN), le quotient à l'envers (ORDER)
      expect(r.options.some((o) => eqF(optValue(o), flip(key)) || eqF(optValue(o), divF(num(b), num(a))) || eqF(optValue(o), mulF(num(a), num(b))))).toBe(true);
      expect(r.label.includes('\\square')).toBe(true);
      expect(first ? r.label.startsWith('$\\square') : !r.label.startsWith('$\\square')).toBe(true);
    });
    expect(rows.map((r) => optValue(r.options[r.correct]).join('/'))).toEqual(['-7/1', '1/4', '-15/2', '4/1']);
  });

  it('ex-22 (E2) : la clé est le signe de a ÷ b (équal = positif, différent = négatif)', () => {
    const rows = EX['ex-22'].question.rows;
    DATA.SIGNS.forEach((s, k) => {
      const q = divF(num(s.a), num(s.b));
      expect(rows[k].options[rows[k].correct]).toBe(q[0] > 0n ? 'موجب' : 'سالب');
      expect((num(s.a)[0] > 0n) === (num(s.b)[0] > 0n)).toBe(q[0] > 0n);
    });
    expect(rows.map((r) => r.options[r.correct])).toEqual(['موجب', 'سالب', 'سالب']);
  });

  it('ex-24 (E3) et now-13b (E5) : la clé est le quotient exact, les distracteurs sont faux, les décalages de virgule sont justes', () => {
    for (const [id, list] of [['ex-24', DATA.COMPUTE], ['now-13b', DATA.SHIFTS]]) {
      const rows = EX[id].question.rows;
      list.forEach((c, k) => {
        const key = divF(num(c.a), num(c.b));
        expect(eqF(optValue(rows[k].options[rows[k].correct]), key), `${id} ${k}`).toBe(true);
        expect(eqF(mulF(num(c.b), key), num(c.a))).toBe(true);
        rows[k].options.forEach((o, i) => expect(eqF(optValue(o), key), `${id} ${k} ${o}`).toBe(i === rows[k].correct));
      });
    }
    expect(EX['ex-24'].question.rows.map((r) => optValue(r.options[r.correct]).join('/'))).toEqual(['-12/1', '4/1', '-90/1', '7/20']);
    expect(EX['now-13b'].question.rows.map((r) => optValue(r.options[r.correct]).join('/'))).toEqual(['-13/2500', '-520/1']);
  });

  it('now-13a (E4) : 7/4, −7/4, 7/−4, −7/−4 valent 1,75, −1,75, −1,75, 1,75', () => {
    const rows = EX['now-13a'].question.rows;
    expect(rows.map((r) => optValue(r.options[r.correct]).join('/'))).toEqual(['7/4', '-7/4', '-7/4', '7/4']);
    DATA.WRITINGS.forEach((w, k) => {
      const m = /\\frac\{(.+)\}\{(.+)\}/.exec(w.tex);
      expect(eqF(divF(num(m[1]), num(m[2])), num(w.value))).toBe(true);
      expect(eqF(optValue(rows[k].options[rows[k].correct]), num(w.value))).toBe(true);
    });
  });

  it('ex-33 (E6) : (6 − 14) ÷ (10 − (2 + 3 × 4)) = 2 et la priorité fautive donne 0,8', () => {
    expect(eqF(evalExpr('(6-14)\\div(10-(2+3\\times4))'), fr(2n))).toBe(true);
    expect(eqF(evalExpr('(6-14)\\div(10-((2+3)\\times4))'), num('0,8'))).toBe(true);
    const q = EX['ex-33'].question;
    q.options.forEach((o, i) => expect(eqF(optValue(o), fr(2n)), o).toBe(i === q.correct));
  });

  it('deep-40 (E7) : exactement une des options rend la égalité 30 vraie', () => {
    const q = EX['deep-40'].question;
    expect(BRACKETS.options.length).toBe(4);
    q.options.forEach((o, i) => expect(eqF(evalExpr(o), fr(30n)), o).toBe(i === q.correct));
    BRACKETS.options.forEach((b) => expect(eqF(evalExpr(b.expr), num(b.value)), b.expr).toBe(true));
    expect(eqF(evalExpr('20-5\\times4-2'), fr(-2n))).toBe(true);
  });

  it('deep-41 (E8) : 7 négatifs → a < 0 ; 5 négatifs → b < 0 ; a×b > 0, a÷b > 0, a+b < 0 (essai exhaustif sur des valeurs)', () => {
    const prodOf = (negs, total) => { let p = 1n; for (let i = 0; i < total; i += 1) p *= i < negs ? -2n : 3n; return p; };
    const a = prodOf(7, 9);
    const b = prodOf(5, 6);
    expect(a < 0n && b < 0n).toBe(true);
    expect(a * b > 0n).toBe(true);
    expect((a < 0n) === (b < 0n)).toBe(true);
    expect(a + b < 0n).toBe(true);
    expect(EX['deep-41'].question.rows.map((r) => r.options[r.correct])).toEqual(['موجب', 'موجب', 'سالب']);
  });

  it('deep-45 (E9) : 360 ÷ (−5) = −72, −72 ÷ (−4) = 18, 18 ÷ (−3) = −6, −6 ÷ (−2) = 3, 3 ÷ (−1) = −3', () => {
    let t = fr(360n);
    const seq = [t];
    for (const d of [-5n, -4n, -3n, -2n, -1n]) { t = divF(t, fr(d)); seq.push(t); }
    expect(seq.map((x) => x[0])).toEqual([360n, -72n, 18n, -6n, 3n, -3n]);
    expect(EX['deep-45'].question.expected).toBe(Number(seq[2][0]));
  });
});

describe('les exemples des encadrés et des méthodes sont justes', () => {
  it('know-8, know-9, know-10, method-5, method-6, act-4 ③', () => {
    expect(eqF(evalExpr('(-35)\\div(-5)'), fr(7n))).toBe(true);
    expect(eqF(evalExpr('42\\div(-6)'), fr(-7n))).toBe(true);
    expect(eqF(evalExpr('(-1{,}2)\\div4'), num('-0,3'))).toBe(true);
    expect(eqF(evalExpr('30\\div(-5)'), fr(-6n))).toBe(true);
    expect(eqF(evalExpr('(-5)\\times(-6)'), fr(30n))).toBe(true);
    expect(eqF(evalExpr('(-28)\\div4'), fr(-7n))).toBe(true);
    expect(eqF(evalExpr('4\\times(-7)'), fr(-28n))).toBe(true);
    expect(eqF(evalExpr('5-(3\\times(-4)+7)'), fr(10n))).toBe(true);
    expect(eqF(evalExpr('(-56)\\div7'), fr(BigInt(METHOD.compute.numbers.A)))).toBe(true);
    expect(eqF(evalExpr('(-45)\\div(-9)'), fr(BigInt(METHOD.compute.numbers.B)))).toBe(true);
    expect(eqF(evalExpr('8-(2\\times(-3)+4)\\div(-2)'), fr(BigInt(METHOD.series.numbers.C)))).toBe(true);
    expect(eqF(evalExpr('20-4\\times3'), fr(8n))).toBe(true);
    expect(eqF(evalExpr('5+(12-2)\\div2'), fr(10n))).toBe(true);
    // la fraction du encadré : −3/5 = 3/−5 = −(3/5), et −3/−5 = 3/5
    const w = [divF(fr(-3n), fr(5n)), divF(fr(3n), fr(-5n)), negF(divF(fr(3n), fr(5n)))];
    expect(w.every((x) => eqF(x, w[0]))).toBe(true);
    expect(eqF(divF(fr(-3n), fr(-5n)), divF(fr(3n), fr(5n)))).toBe(true);
    // act-4 ③ : le quotient de produits du module 3 — (−2)(−5)3(−1) = −30 ; (−1)·4·5·(−6) = 120 ; Q = −1/4
    const top = evalExpr('(-2)\\times(-5)\\times3\\times(-1)');
    const bottom = evalExpr('(-1)\\times4\\times5\\times(-6)');
    expect([top[0], bottom[0]]).toEqual([-30n, 120n]);
    expect(eqF(divF(top, bottom), num('-0,25'))).toBe(true);
    // la remarque : (−2)·3·(−1) / (4·(−5)) → 6 / −20, négatif
    expect(evalExpr('(-2)\\times3\\times(-1)')[0] > 0n && evalExpr('4\\times(-5)')[0] < 0n).toBe(true);
  });
  it('les phrases de correction de la carte disent des choses vraies', () => {
    expect(eqF(evalExpr('(-12)\\times(-5)'), fr(60n))).toBe(true);
    expect(eqF(evalExpr('(-60)\\div(-12)'), fr(5n))).toBe(true);
    expect(eqF(evalExpr('(-12)\\div(1-4)+2'), fr(6n))).toBe(true);
    expect(eqF(evalExpr('7-3\\times(-2)'), fr(13n))).toBe(true);
    expect(eqF(evalExpr('7-(-6)'), fr(13n))).toBe(true);
    expect(GUIDE.zero.length).toBeGreaterThan(10);
    expect(KNOWLEDGE.fraction.lines.length).toBe(2);
  });
});

describe('le إختبار أولي — FINAL recalculé, options littérales dans le module', () => {
  const byId = (id) => FINAL.find((x) => x.id === id);
  const val = (o) => (o.startsWith('\\frac') ? num(o) : num(o));
  it('E1 : (−42) ÷ (−6) = 7 ; −7 (signe), −36 et −48 (soustraction, addition) sont faux', () => {
    const f = byId('E1');
    const key = evalExpr(f.tex);
    expect(eqF(key, fr(7n))).toBe(true);
    f.options.forEach((o, i) => expect(eqF(val(o), key), o).toBe(i === f.correct));
    expect(eqF(val(f.options[1]), negF(key))).toBe(true);
    expect(eqF(val(f.options[2]), evalExpr('(-42)-(-6)'))).toBe(true);
    expect(eqF(val(f.options[3]), evalExpr('(-42)+(-6)'))).toBe(true);
  });
  it('E2 : □ × (−4) = 10 → −2,5 ; 2,5 (signe), −40 (produit), −0,4 (division à l’envers)', () => {
    const f = byId('E2');
    const key = divF(fr(10n), fr(-4n));
    expect(eqF(key, num('-2,5'))).toBe(true);
    f.options.forEach((o, i) => expect(eqF(mulF(val(o), fr(-4n)), fr(10n)), o).toBe(i === f.correct));
    expect(eqF(val(f.options[1]), negF(key))).toBe(true);
    expect(eqF(val(f.options[2]), mulF(fr(10n), fr(-4n)))).toBe(true);
    expect(eqF(val(f.options[3]), divF(fr(-4n), fr(10n)))).toBe(true);
  });
  it('E3 : −5/8 = 5/−8 ; −5/−8 = 5/8 ; 8/−5 est le quotient à l’envers', () => {
    const f = byId('E3');
    const key = divF(fr(-5n), fr(8n));
    f.options.forEach((o, i) => expect(eqF(val(o), key), o).toBe(i === f.correct));
    expect(eqF(val(f.options[1]), negF(key))).toBe(true);
    expect(eqF(val(f.options[3]), negF(key))).toBe(true);
  });
  it('E4 : 7 − 3 × (−2) = 13 ; −8 = (7 − 3) × (−2) ; 1 = 7 − 6 ; −13 = opposé', () => {
    const f = byId('E4');
    const key = evalExpr(f.tex);
    expect(eqF(key, fr(13n))).toBe(true);
    f.options.forEach((o, i) => expect(eqF(val(o), key), o).toBe(i === f.correct));
    expect(eqF(val(f.options[1]), evalExpr('(7-3)\\times(-2)'))).toBe(true);
    expect(eqF(val(f.options[2]), evalExpr('7-6'))).toBe(true);
  });
  it('E5 : (−12) ÷ (1 − 4) + 2 = 6 ; −2 (signe de la division), −14 (priorité), 4 (le +2 oublié)', () => {
    const f = byId('E5');
    const key = evalExpr(f.tex);
    expect(eqF(key, fr(6n))).toBe(true);
    f.options.forEach((o, i) => expect(eqF(val(o), key), o).toBe(i === f.correct));
    expect(eqF(val(f.options[1]), addF(fr(-4n), fr(2n)))).toBe(true);
    expect(eqF(val(f.options[2]), evalExpr('(-12)\\div1-4+2'))).toBe(true);
    expect(eqF(val(f.options[3]), evalExpr('(-12)\\div(1-4)'))).toBe(true);
  });
  it('le module contient chaque option littérale, sa bonne réponse est en tête, et chaque الكفاءة a une épreuve', () => {
    for (const f of FINAL) {
      for (const o of f.options) expect(itqan.includes(`'$${o.replace(/\\/g, '\\\\')}$'`), `${f.id} ${o}`).toBe(true);
      expect(itqan.includes(f.tex.replace(/\\/g, '\\\\')), f.id).toBe(true);
      expect(f.correct).toBe(0);
    }
    for (const p of ['P1', 'P2', 'P3', 'P4']) expect(itqan).toContain(`3am_qismat-nisbiyayn_${p}`);
  });
});

describe('« أستعدّ » : sept affirmations, vraies et fausses, avec leur justification', () => {
  it('les valeurs des affirmations', () => {
    const items = [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS];
    expect(items.length).toBe(7);
    expect(new Set(items.map((i) => i.answer)).size).toBe(2);
    const truth = [
      eqF(evalExpr('-7+10-5'), fr(-2n)),
      eqF(evalExpr('(-4)+(-6)'), fr(-10n)),
      eqF(evalExpr('(-8)\\times(-0{,}5)'), fr(4n)),
      eqF(evalExpr('(-3)\\times4\\times(-1)\\times(-2)'), fr(24n)),
      eqF(evalExpr('7\\times(-6)'), fr(-42n)),
      eqF(evalExpr('20-4\\times3'), fr(48n)),
      eqF(evalExpr('5+(12-2)\\div2'), fr(10n)),
    ];
    expect(truth).toEqual(items.map((i) => i.answer));
    expect(astaidd).toContain("requires: ['awlawiya-amaliyat']");
  });
});

describe('le labo : les nombres de la leçon sont ceux du preset, atteignables, et la logique les accepte', () => {
  it('LAB = preset de levels.js ; le monde fraction = FRACTION_TASKS', () => {
    expect(LAB.beginner).toEqual(LEVELS['code-lockers'].beginner.numbers);
    expect(LAB.advanced).toEqual(LEVELS['code-lockers'].advanced.numbers);
    expect(LAB.fraction.tasks).toEqual(CL.FRACTION_TASKS.map((t) => ({ ...t })));
    for (const n of [LAB.beginner, LAB.advanced, LAB.fraction]) expect(() => CL.init(n)).not.toThrow();
  });
  it('les missions : chaque cadenas se résout par la division exacte, et la définition b × q = a est vérifiée', () => {
    for (const n of [LAB.beginner, LAB.advanced, LAB.fraction]) {
      for (const t of n.tasks) expect(eqF(mulF(num(t.b), divF(num(t.a), num(t.b))), num(t.a)), t.id).toBe(true);
    }
    expect(LAB.beginner.tasks.map((t) => divF(num(t.a), num(t.b)).join('/'))).toEqual(['-8/1', '-6/1', '9/1', '5/1']);
    expect(LAB.advanced.tasks.map((t) => (t.a === '0' ? '0' : divF(num(t.a), num(t.b)).join('/')))).toEqual(['1/4', '-3/1', '-3/1', '0']);
    expect(divF(num('4'), num('-6')).join('/')).toBe('-2/3');
    expect(divF(num('-6'), num('-9')).join('/')).toBe('2/3');
  });
  it('la durée : 64 minutes sans les مسائل, 88 avec (≤ 90) ; le catalogue est publié avec les mêmes الكفاءات', () => {
    const sum = (ms) => ms.reduce((a, m) => a + m.estimatedMin, 0);
    const all = LESSON_CONFIG.modules;
    expect(sum(all.filter((m) => m.track !== 'problem'))).toBe(64);
    expect(sum(all)).toBe(88);
    const entry = catalogue.lessons.find((l) => l.code === 'qismat-nisbiyayn');
    expect(entry).toMatchObject({ status: 'available', durationMinutes: 64, programmeItems: ['3am.m1.r02'], order: 2 });
    expect(entry.pointsToLearn).toEqual(LESSON_CONFIG.skills);
    expect(Object.keys(entry.pointPrerequisites).sort()).toEqual(['P1', 'P2', 'P3', 'P4']);
  });
});
