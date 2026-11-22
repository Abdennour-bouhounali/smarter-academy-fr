import { describe, it, expect } from 'vitest';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_3am_2026_2027.json';
import { LESSON_CONFIG } from '../lesson.config';
import { LEVELS } from '../../../../../../common/manipulations/levels';
import { PRESETS } from '../../../../../../common/manipulations/logic/differenceMeter';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { LAB, KNOWLEDGE, METHOD_DIFF, PREP_ITEMS, GUIDE, RECALL_FRACTIONS } from './textbook';
import { EXERCISES, FINAL, FIGURE_E1, FIGURE_E8, ROWS_E1, ROWS_E2, ROWS_E3, ROWS_E4, ROWS_E5, ROWS_E6, ROWS_E7, ROWS_E8, PAIRS_E1, PAIRS_E4, LP } from './exercises';
import itqan from '../modules/Module08Itqan.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import knowledgeSrc from '../knowledge.jsx?raw';

/* ═════ Une arithmétique de rationnels BigInt écrite À PART (jamais le cœur de la plateforme) ═════ */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
const F = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const sgn = (a) => (a.n > 0n ? 1 : a.n < 0n ? -1 : 0);
const num = (s) => { const t = String(s).replace(/[−]/g, '-').replace(',', '.'); const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(t); if (!m) throw new Error(`nombre: ${s}`); const frac = m[3] ?? ''; return F(BigInt(`${m[1]}${m[2]}${frac}`), 10n ** BigInt(frac.length)); };
const fr = (s) => { const [a, b] = String(s).split('/'); return b ? F(num(a).n * num(b).d * (num(b).n < 0n ? -1n : 1n), num(a).d * (num(b).n < 0n ? -num(b).n : num(b).n)) : num(a); };
const ratOf = (s) => { const t = String(s); const m = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t); if (!m) return num(t); const a = num(m[1]); const b = num(m[2]); return F(a.n * b.d, a.d * b.n); };
const ord = (d) => (d.n > 0n ? '>' : d.n < 0n ? '<' : '=');
const txt = (f) => (f.d === 1n ? `${f.n}` : `${f.n}/${f.d}`);
/** « \frac{p}{q} », « -\frac{p}{q} », « 12 », « 0{,}04 » (LaTeX d'une option) → rationnel. */
const texNum = (s) => {
  const t = String(s).trim().replace(/\\left|\\right/g, '').replace(/\{,\}/g, '.').replace(/−/g, '-');
  const m = /^(-?)\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  return m ? F(BigInt(`${m[1]}${m[2]}`), BigInt(m[3])) : num(t);
};

/** Polynômes en x à coefficients entiers : { p: c } ; analyseur de + − × ( ) ^2 et produit implicite. */
function poly(src) {
  const t = [...String(src).replace(/\s+/g, '').replace(/−/g, '-').replace(/\*/g, '')];
  let p = 0;
  const P = (o) => Object.fromEntries(Object.entries(o).filter(([, c]) => c !== 0));
  const addP = (a, b, k = 1) => { const r = { ...a }; for (const [e, c] of Object.entries(b)) r[e] = (r[e] ?? 0) + k * c; return P(r); };
  const mulP = (a, b) => { const r = {}; for (const [e, c] of Object.entries(a)) for (const [f, d] of Object.entries(b)) r[+e + +f] = (r[+e + +f] ?? 0) + c * d; return P(r); };
  const peek = () => t[p];
  function expr() { let a = term(); while (peek() === '+' || peek() === '-') { const op = t[p++]; a = addP(a, term(), op === '+' ? 1 : -1); } return a; }
  function term() { let a = factor(); while (peek() === '(' || peek() === 'x' || /\d/.test(peek() ?? '')) a = mulP(a, factor()); return a; }
  function factor() { let a = atom(); while (peek() === '^') { p += 1; const k = +t[p++]; let r = { 0: 1 }; for (let i = 0; i < k; i += 1) r = mulP(r, a); a = r; } return a; }
  function atom() {
    if (peek() === '-') { p += 1; return addP({}, factor(), -1); }
    if (peek() === '(') { p += 1; const e = expr(); p += 1; return e; }
    if (peek() === 'x') { p += 1; return { 1: 1 }; }
    let s = ''; while (/\d/.test(peek() ?? '')) s += t[p++]; return { 0: +s };
  }
  const r = expr();
  if (p !== t.length) throw new Error(`reste: ${src}`);
  return r;
}
const polyKey = (o) => JSON.stringify(Object.entries(o).filter(([, c]) => c !== 0).sort((a, b) => a[0] - b[0]));
const polyAt = (o, x) => Object.entries(o).reduce((s, [e, c]) => add(s, mul(F(BigInt(c)), (() => { let r = F(1n); for (let i = 0; i < +e; i += 1) r = mul(r, x); return r; })())), F(0n));
/** « x^2+6x+5 » (texte d'une option) → polynôme. */
const texPoly = (s) => poly(String(s).replace(/\$/g, '').replace(/\^2/g, '^2'));

describe('muqaranat-natiqayn — le labo et le catalogue', () => {
  it('LAB mirrors levels.js and the logic presets', () => {
    const lv = LEVELS['difference-meter'];
    const strip = ({ id, a, b, write, curtain, mustSwap }) => ({ id, a, b, write: !!write, curtain: !!curtain, mustSwap: !!mustSwap });
    expect(lv.beginner.numbers.tasks.map(strip)).toEqual(LAB.rail.beginner.map(({ id, a, b }) => ({ ...strip({ id, a, b }), mustSwap: id === 'd2' })));
    expect(lv.advanced.numbers.tasks.map(strip)).toEqual(LAB.rail.advanced.map(({ id, a, b }) => ({ ...strip({ id, a, b }), write: id !== 'd6', curtain: id === 'd6' })));
    expect(PRESETS.race.tasks.map(({ id, A, B }) => ({ id, A, B }))).toEqual(LAB.race.map(({ id, A, B }) => ({ id, A, B })));
    expect(lv.beginner.numbers.tasks).toEqual(PRESETS.beginner.tasks);
    expect(lv.advanced.numbers.tasks).toEqual(PRESETS.advanced.tasks);
  });
  it('every rail task: difference, order and the overlapping pair (0,85 px at 150 px / unit) are recomputed', () => {
    for (const tk of [...LAB.rail.beginner, ...LAB.rail.advanced]) {
      const d = sub(ratOf(tk.a), ratOf(tk.b));
      expect(txt(d), tk.id).toBe(tk.diff);
      expect(ord(d), tk.id).toBe(tk.order);
    }
    const d3 = sub(ratOf('9/11'), ratOf('13/16'));
    expect(Math.abs(Number(d3.n) / Number(d3.d)) * 150).toBeCloseTo(0.852, 2);
    const known = LAB.rail.advanced[2];
    expect(eq(ratOf(known.known), ratOf(known.diff))).toBe(true);
    // d2 : −3/2 est plus loin de 0 que −1/2 mais plus petit ; d3 : le plus grand numérateur n'est pas le plus grand nombre
    expect(ord(sub(ratOf('-3/2'), ratOf('-1/2')))).toBe('<');
    expect(ord(sub(ratOf('9/11'), ratOf('13/16')))).toBe('>');
  });
  it('every race task: A − B simplified, regions and sample points (own polynomial code)', () => {
    for (const tk of LAB.race) {
      const d = addDiff(tk.A, tk.B);
      expect(polyKey(d), tk.id).toBe(polyKey(poly(tk.diff)));
      const f = (x) => sgn(sub(polyAt(poly(tk.A.replace('²', '^2')), F(BigInt(x))), polyAt(poly(tk.B.replace('²', '^2')), F(BigInt(x)))));
      if (tk.all) expect([0, 3, 7, 10].map(f).every((s) => s === (tk.all === 'gt' ? 1 : -1)), tk.id).toBe(true);
      else {
        const c = Number(tk.c);
        expect([c - 3, c - 1].filter((x) => x >= 0).map(f).every((s) => s === (tk.below === 'gt' ? 1 : -1)), tk.id).toBe(true);
        expect(f(c), tk.id).toBe(0);
        expect([c + 1, c + 5].map(f).every((s) => s === (tk.above === 'gt' ? 1 : -1)), tk.id).toBe(true);
      }
    }
    // e1 aux valeurs annoncées : (0 : 5 / 9), (4 : 17 / 17), (6 : 23 / 21) ; e3 : (2 : 7 / 6), (4 : 19 / 20) ; e2 : (0 : 6 / 1), (8 : 22 / 17)
    const v = (e, x) => Number(polyAt(poly(e.replace('²', '^2')), F(BigInt(x))).n);
    expect([[0, 5, 9], [4, 17, 17], [6, 23, 21]].every(([x, a, b]) => v('3x+5', x) === a && v('2x+9', x) === b)).toBe(true);
    expect([[2, 7, 6], [4, 19, 20]].every(([x, a, b]) => v('x²+3', x) === a && v('x²+x', x) === b)).toBe(true);
    expect([[0, 6, 1], [8, 22, 17]].every(([x, a, b]) => v('2(x+3)', x) === a && v('2x+1', x) === b)).toBe(true);
  });
  it('the manual\'s unit of the lesson: 13 cited elements in the catalogue', () => {
    const entry = catalogue.lessons.find((l) => l.code === 'muqaranat-natiqayn');
    expect(entry.programmeItems).toEqual(['3am.m5.r04']);
    expect(entry.pointsToLearn).toEqual(LESSON_CONFIG.skills);
    expect(entry.unitId).toBe(LESSON_CONFIG.unit);
  });
});
const addDiff = (A, B) => { const a = poly(A.replace('²', '^2')); const b = poly(B.replace('²', '^2')); const r = { ...a }; for (const [e, c] of Object.entries(b)) r[e] = (r[e] ?? 0) - c; return Object.fromEntries(Object.entries(r).filter(([, c]) => c !== 0)); };

describe('muqaranat-natiqayn — « أستعدّ » et les mots de la leçon', () => {
  it('each « أستعدّ » affirmation is recomputed and has the stated truth value', () => {
    const t = PREP_ITEMS.map((i) => i.answer);
    expect(t).toEqual([true, false, true, true, true, false]);
    expect(ord(sub(fr('5/8'), fr('2/3')))).toBe('<');                                    // 5/8 < 2/3
    expect(ord(sub(fr('-3/4'), fr('-3/5')))).toBe('<');                                  // −3/4 < −3/5 : l'affirmation > est fausse
    expect(eq(sub(fr('5/6'), fr('3/4')), fr('1/12'))).toBe(true);
    expect(eq(sub(fr('2/5'), fr('3/7')), fr('-1/35'))).toBe(true);
    expect(-7 < -2).toBe(true);
    const lhs = addDiff('5x-2', '3x+4');                                                // 5x − 2 − (3x + 4) = 2x − 6 ≠ 2x + 2
    expect(polyKey(lhs)).toBe(polyKey(poly('2x-6')));
    expect(polyKey(lhs)).not.toBe(polyKey(poly('2x+2')));
  });
  it('« أستعدّ » uses the declared skills and every priorKnowledge id', () => {
    for (const s of new Set(PREP_ITEMS.map((i) => i.skill))) expect(astaidd).toContain(`${s}: { label:`);
    for (const id of LESSON_CONFIG.priorKnowledge) expect(astaidd, id).toContain(`requires: ['${id}']`);
    expect(new Set(PREP_ITEMS.map((i) => i.answer)).size).toBe(2);
  });
  it('the worked numbers of the lesson are exact', () => {
    expect(eq(sub(fr('7/4'), fr('5/3')), fr('1/12'))).toBe(true);
    expect(eq(sub(fr('-11/8'), fr('-4/3')), fr('-1/24'))).toBe(true);
    expect(eq(sub(fr('11/8'), fr('15/11')), fr('1/88'))).toBe(true);
    expect(eq(sub(fr('-5/9'), ratOf('4/-7')), fr('1/63'))).toBe(true);
    expect(eq(sub(fr('5/7'), fr('8/11')), fr('-1/77'))).toBe(true);
    expect(METHOD_DIFF.solution.join(' ')).toContain('\\frac1{88}');
    expect(METHOD_DIFF.solution.join(' ')).toContain('\\frac1{63}');
    expect(KNOWLEDGE.example1.text).toContain('\\frac1{12}');
    expect(KNOWLEDGE.example2.text).toContain('-\\frac1{24}');
    expect(eq(sub(fr('5/6'), fr('7/9')), fr('1/18'))).toBe(true);                       // GUIDE.subTerms
    expect(GUIDE.subTerms.why).toContain('\\frac1{18}');
    expect(eq(sub(fr('-3/2'), fr('-1/2')), fr('-1'))).toBe(true);                       // GUIDE.absFarther
    expect(eq(sub(fr('5/8'), fr('2/3')), fr('-1/24'))).toBe(true);                      // RECALL : 15/24 contre 16/24
    expect(RECALL_FRACTIONS.text).toContain('\\frac{15}{24}');
  });
  it('no student-visible line points to the textbook, nor uses the 4AM notation A(-3)', () => {
    const all = JSON.stringify([KNOWLEDGE, METHOD_DIFF, RECALL_FRACTIONS, GUIDE, PREP_ITEMS, EXERCISES.map((e) => [e.statement, e.question]), FINAL]);
    expect(all).not.toMatch(/الكتاب|ص\s?\d|الصفحة/);
    expect(all).not.toMatch(/[AB]\(\s*-?\d/);
    expect(LESSON_CONFIG.description).not.toMatch(/الكتاب/);
  });
});

/** Lit une option « $a-b=\frac1{20}$ إذن $a>b$ » → { diff, order }. */
const claim = (o) => { const m = /\$[ab]-[ab]=(.+?)\$ إذن \$[ab]([><])[ab]\$/.exec(o); return { diff: texNum(m[1].replace(/\\frac(\d)(\d)/g, '\\frac{$1}{$2}')), order: m[2] }; };

describe('muqaranat-natiqayn — les exercices', () => {
  it('E1 and E4: the key and the order are recomputed; the only true option is the right one', () => {
    for (const [name, list, pairs] of [['E1', ROWS_E1, PAIRS_E1], ['E4', ROWS_E4, PAIRS_E4]]) {
      list.forEach((row, i) => {
        const [a, b] = pairs[i].map(ratOf);
        const d = sub(a, b);
        expect(row.data.key, `${name}${i}`).toBe(txt(d));
        expect(row.data.order).toBe(ord(d));
        row.options.forEach((o, k) => {
          const c = claim(o);
          const isTrue = eq(c.diff, d) && c.order === ord(d);
          expect(isTrue, `${name}${i} option ${k}: ${o}`).toBe(k === row.correct);
          // un distracteur reste cohérent avec lui-même sur l'ordre : l'erreur est dans la différence ou dans la lecture
          if (k !== row.correct) expect(!eq(c.diff, d) || c.order !== ord(d)).toBe(true);
        });
        // la différence faite en soustrayant les termes est l'un des distracteurs (jamais la bonne)
        const A = pairs[i][0].split('/').map(BigInt); const B = pairs[i][1].split('/').map(BigInt);
        const terms = F(A[0] - B[0], A[1] - B[1]);
        expect(eq(terms, d), `${name}${i} terms`).toBe(false);
        expect(row.options.some((o) => eq(claim(o).diff, terms)), `${name}${i} has the terms distractor`).toBe(true);
      });
    }
    // les cinq paires de E1 annoncées : 1/20, −1/24, −71/36, 17/45, −23/24 ; E4 : 1/143, −1/90, 31/30, 1/18
    expect(ROWS_E1.map((r) => r.data.key)).toEqual(['1/20', '-1/24', '-71/36', '17/45', '-23/24']);
    expect(ROWS_E4.map((r) => r.data.key)).toEqual(['1/143', '-1/90', '31/30', '1/18']);
  });
  it('E2: the order read from the difference ALONE', () => {
    const read = (row) => { const d = row.data; let s; if (d.value !== undefined) s = sgn(ratOf(d.value)); else s = sgn(ratOf(d.bound)); const o = d.left === 'a' ? s : -s; return o > 0 ? '>' : o < 0 ? '<' : '='; };
    ROWS_E2.forEach((row, i) => { expect(read(row), `E2 ${i}`).toBe(row.data.key); expect(row.options[row.correct], `E2 ${i}`).toBe({ '>': '$a>b$', '<': '$a<b$', '=': '$a=b$' }[row.data.key]); });
    expect(ROWS_E2.map((r) => r.data.key)).toEqual(['>', '<', '<', '>', '=', '>']);
  });
  it('E3: signs and values of x − y', () => {
    ROWS_E3.forEach((row, i) => {
      if (row.data.kind === 'sign') {
        const d = Number(row.data.x) - Number(row.data.y);
        expect(['موجبة', 'سالبة', 'معدومة'][row.correct], `E3 ${i}`).toBe(d > 0 ? 'موجبة' : d < 0 ? 'سالبة' : 'معدومة');
      } else {
        const [x, y] = row.label.match(/-?\d+/g).map(Number);
        const key = x - y;
        expect(texNum(row.options[row.correct].replace(/\$/g, '')), `E3 ${i}`).toEqual(F(BigInt(key)));
        row.options.forEach((o, k) => expect(eq(texNum(o.replace(/\$/g, '')), F(BigInt(key))), `E3 ${i} ${o}`).toBe(k === row.correct));
      }
    });
    expect(ROWS_E3.filter((r) => r.data.kind === 'num').map((r) => r.data.key)).toEqual(['9', '6', '-15', '12']);
  });
  it('E5: the calculator exercise — exact difference and the decimals shown', () => {
    const a = ratOf('47.3/6.98'); const b = ratOf('20.85/3.08');
    const d = sub(a, b);
    expect(txt(d)).toBe('755/107492');
    expect(ROWS_E5[0].data.key).toBe('755/107492');
    expect(Number(d.n) / Number(d.d)).toBeCloseTo(0.0070, 4);
    expect((Number(a.n) / Number(a.d)).toFixed(4)).toBe('6.7765');
    expect(Math.floor((Number(b.n) / Number(b.d)) * 10000) / 10000).toBe(6.7694);
    expect(ord(d)).toBe('>');
    expect(ROWS_E5[0].options[ROWS_E5[0].correct]).toBe('$0{,}0070$');
    // « 1,28 / 7 et 0,441 / 2,4 » (ex-29) et le couple d'ex-31 : seulement cités par la banque ; ici on garde les valeurs exactes de l'élément
    expect(txt(sub(ratOf('1.28/7'), ratOf('0.441/2.4')))).toBe('-1/1120');
  });
  it('E6: π/4 − π/5 = π/20 (coefficient of π) and 5/17 against 0,88/3', () => {
    expect(txt(sub(fr('1/4'), fr('1/5')))).toBe('1/20');
    expect(ROWS_E6[0].data.key).toBe('1/20');
    expect(ROWS_E6[0].options[ROWS_E6[0].correct]).toBe('$\\frac{\\pi}{20}$');
    const d = sub(fr('5/17'), ratOf('0.88/3'));
    expect(txt(d)).toBe('1/1275');
    expect(ROWS_E6[2].options[ROWS_E6[2].correct]).toBe('$\\frac1{1275}$');
    expect(ord(d)).toBe('>');
  });
  it('E7: the values at 0, 6, 8; A − B = x − 6; A > B exactly for x > 6', () => {
    const A = poly('6x-5'); const B = poly('5x+1');
    const vals = ROWS_E7.filter((r) => r.data.kind === 'exprvalue');
    vals.forEach((r, i) => {
      const p = r.data.expr === '6x-5' ? A : B;
      const key = polyAt(p, F(BigInt(r.data.x)));
      expect(txt(key), `E7 ${i}`).toBe(r.data.key);
      r.options.forEach((o, k) => expect(eq(texNum(o.replace(/\$/g, '')), key), `E7 ${i} ${o}`).toBe(k === r.correct));
    });
    expect(vals.map((r) => r.data.key)).toEqual(['-5', '1', '31', '31', '43', '41']);
    expect(polyKey(addDiff('6x-5', '5x+1'))).toBe(polyKey(poly('x-6')));
    for (const x of [-3, 0, 2, 5, 7, 9, 12]) expect(sgn(sub(polyAt(A, F(BigInt(x))), polyAt(B, F(BigInt(x))))), `x=${x}`).toBe(Math.sign(x - 6));
    // les distracteurs de A − B sont faux : (6x − 5) + (5x + 1) = 11x − 4 ; x + 6
    expect(polyKey(poly('(6x-5)+(5x+1)'))).toBe(polyKey(poly('11x-4')));
    const diffRow = ROWS_E7.find((r) => r.data.kind === 'poly');
    diffRow.options.forEach((o, k) => expect(polyKey(texPoly(o)) === polyKey(poly('x-6')), o).toBe(k === diffRow.correct));
  });
  it('E8: perimeters equal, areas differ by 4, for every x; the figure is measured at x = 2', () => {
    for (const row of ROWS_E8.filter((r) => r.data.kind === 'poly')) {
      const key = poly(row.data.expr);
      expect(polyKey(key), row.data.expr).toBe(polyKey(texPoly(row.data.key)));
      row.options.forEach((o, k) => expect(polyKey(texPoly(o)) === polyKey(key), `${row.data.expr} ${o}`).toBe(k === row.correct));
    }
    expect(polyKey(poly('2((x+5)+(x+1))'))).toBe(polyKey(poly('4(x+3)')));
    expect(polyKey(poly('(x+5)(x+1)-(x+3)(x+3)'))).toBe(polyKey(poly('-4')));
    for (const x of [1, 2, 7, 20]) {
      expect(2 * ((x + 5) + (x + 1))).toBe(4 * (x + 3));
      expect((x + 3) ** 2 - (x + 5) * (x + 1)).toBe(4);
    }
    const P = FIGURE_E8.points;
    const dist = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
    expect([dist('R1', 'R2'), dist('R2', 'R3'), dist('S1', 'S2'), dist('S2', 'S3')]).toEqual([2 + 5, 2 + 1, 2 + 3, 2 + 3]);
    const labels = Object.fromEntries(FIGURE_E8.segments.filter((s) => !Array.isArray(s) && s.label).map((s) => [`${s.from}${s.to}`, s.label]));
    expect(labels).toEqual({ R1R2: 'x + 5', R2R3: 'x + 1', S1S2: 'x + 3' });
    expect(validateGeoFigure(FIGURE_E8)).toEqual([]);
  });
  it('E1 figure: the two points are under one pixel at the figure scale and the figure is valid', () => {
    expect(validateGeoFigure(FIGURE_E1)).toEqual([]);
    expect(Math.abs(FIGURE_E1.points.a[0] - FIGURE_E1.points.b[0])).toBeCloseTo(0.05, 6);
    expect(eq(ratOf('4/5'), F(4n, 5n))).toBe(true);
  });
  it('each exercise has one primary الكفاءة, a source, and the expected ids (all 13 manual elements are cited)', () => {
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-5', 'ex-27', 'ex-28', 'ex-30', 'ex-29', 'self-9', 'ex-32', 'deep-38']);
    for (const e of EXERCISES) { expect(Object.values(LP)).toContain(e.learningPointId); expect(e.source.elementId).toBe(e.id); }
    const cited = new Set(EXERCISES.flatMap((e) => [e.source.elementId, ...(e.cites ?? []).map((c) => c.elementId)]));
    for (const id of ['act-5', 'ex-27', 'ex-28', 'ex-29', 'ex-30', 'ex-31', 'ex-32', 'now-61', 'self-9', 'self-10', 'deep-38']) expect(cited.has(id), id).toBe(true);
    expect(new Set(EXERCISES.map((e) => e.learningPointId)).size).toBe(3);
    expect(LESSON_CONFIG.resources.filter((r) => r.sourceElementIds).flatMap((r) => r.sourceElementIds).sort()).toEqual(['act-5', 'ex-27', 'method-5']);
    expect(KNOWLEDGE.rule.source.elementId).toBe('know-5');
    expect(METHOD_DIFF.source.elementId).toBe('method-5');
  });
  it('every row has exactly one correct option and distinct options', () => {
    for (const rows of [ROWS_E1, ROWS_E2, ROWS_E3, ROWS_E4, ROWS_E5, ROWS_E6, ROWS_E7, ROWS_E8]) {
      for (const r of rows) { expect(new Set(r.options).size).toBe(r.options.length); expect(r.correct).toBeGreaterThanOrEqual(0); expect(r.correct).toBeLessThan(r.options.length); expect(r.correction.length).toBeGreaterThan(5); }
    }
  });
});

describe('muqaranat-natiqayn — le إختبار أولي', () => {
  it('every key is recomputed and every distractor is FALSE and distinct', () => {
    expect(FINAL).toHaveLength(5);
    for (const f of FINAL) expect(new Set(f.options).size, f.id).toBe(f.options.length);
    // E1 : a − b = −0,2 → a < b
    expect(ord(F(sgn(ratOf('-0.2')) === -1 ? -1n : 1n))).toBe('<');
    expect(FINAL[0].options[FINAL[0].correct]).toBe('$a<b$');
    // E2, E3 : les différences et les ordres annoncés
    for (const f of FINAL.filter((x) => x.kind === 'cmp')) {
      const d = sub(ratOf(f.a), ratOf(f.b));
      f.claims.forEach((c, k) => {
        const isTrue = (c.diff === null ? false : eq(ratOf(c.diff), d)) && c.order === ord(d);
        expect(isTrue, `${f.id} option ${k}`).toBe(k === f.correct);
        if (c.diff !== null && !/x/.test(c.diff)) {
          const m = /(?:=|الفرق|^)\s*\$?(-?)\\frac(?:\{(-?\d+)\}|(\d))\{(-?\d+)\}/.exec(f.options[k]);
          expect(m, `${f.id} ${k} ${f.options[k]}`).not.toBeNull();
          expect(eq(F(BigInt(`${m[1]}${m[2] ?? m[3]}`), BigInt(m[4])), ratOf(c.diff)), `${f.id} ${k} text`).toBe(true);
        }
      });
      expect(txt(d)).toBe(f.id === 'E2' ? '1/18' : '-1/28');
    }
    // E2 : la différence « (5 − 7)/(6 − 9) » donne 2/3, jamais 1/18 ; E3 : le numérateur ou la valeur absolue ne décident pas
    expect(eq(F(5n - 7n, 6n - 9n), fr('2/3'))).toBe(true);
    expect(ord(sub(ratOf('3/4'), ratOf('5/7')))).toBe('>');          // 3/4 > 5/7 mais −3/4 < −5/7
    expect(ord(sub(ratOf('-3/4'), ratOf('-5/7')))).toBe('<');
    // E4 : A − B = x − 3 > 0 pour x > 3 ; la fausse différence 3x + 17 est (2x + 7) + (x + 10)
    expect(polyKey(addDiff('2x+7', 'x+10'))).toBe(polyKey(poly('x-3')));
    expect(polyKey(poly('(2x+7)+(x+10)'))).toBe(polyKey(poly('3x+17')));
    for (const x of [4, 5, 9, 20]) expect(sgn(sub(polyAt(poly('2x+7'), F(BigInt(x))), polyAt(poly('x+10'), F(BigInt(x)))))).toBe(1);
    // E5 : b − a > 0 ⟺ a < b
    expect(FINAL[4].options[FINAL[4].correct]).toBe('$a<b$');
  });
  it('the module source holds the options verbatim and every assessment is literal', () => {
    for (const f of FINAL) for (const o of f.options) expect(itqan, `${f.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
    expect((itqan.match(/learningPointIds: \['3am_muqaranat-natiqayn_P[123]'\]/g) ?? []).length).toBe(5);
    expect(new Set(FINAL.map((f) => f.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
    expect(FINAL.filter((f) => f.lp === LP.P1)).toHaveLength(2);
  });
  it('every brick used by a module exists in knowledge.jsx', () => {
    for (const id of ['ishara-farq', 'ibdal-mujassayn', 'farq-wahdahu', 'maana-farq', 'hisab-farq', 'farq-ibaratayn']) expect(knowledgeSrc, id).toContain(`id: '${id}'`);
  });
});
