import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { PRODUCTS, SUMS, QUOTIENTS, SUMS2, MIXED, COMPOUND, AB, PAIRS, ORDERS, MISSING, EXERCISES, EX, FINAL, LP } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD, GUIDE, LAB, RECALL } from './textbook';
import * as L from '../../../../../../common/manipulations/logic/mergeBoard';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/* Arithmétique de contrôle en BigInt, INDÉPENDANTE de fractions3.js / powers.js : un rationnel est { n, d } réduit, d > 0. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); if (d === 0n) throw new Error('d = 0'); const g = gcd(n, d); return d < 0n ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }; };
const eq = (x, y) => x.n === y.n && x.d === y.d;
const cmp = (x, y) => { const l = x.n * y.d; const r = y.n * x.d; return l > r ? 1 : l === r ? 0 : -1; };
const add = (x, y) => R(x.n * y.d + y.n * x.d, x.d * y.d);
const mul = (x, y) => R(x.n * y.n, x.d * y.d);
const div = (x, y) => { if (y.n === 0n) throw new Error('division par 0'); return R(x.n * y.d, x.d * y.n); };
const neg = (x) => R(-x.n, x.d);
const dec = (s) => { const m = /^(\d+)(?:\.(\d+))?$/.exec(s); const f = m[2] ?? ''; return R(BigInt(m[1] + f), 10n ** BigInt(f.length)); };

/** Un évaluateur d'expressions : nombres décimaux, `/` (fraction, le plus serré), `* ÷`, `+ -`, parenthèses, signe moins unaire. */
function evaluate(src) {
  const toks = String(src).replace(/\s+/g, '').replace(/,/g, '.').replace(/×/g, '*').replace(/−/g, '-').match(/\d+(?:\.\d+)?|[-+*÷/()]/g);
  if (toks.join('') !== String(src).replace(/\s+/g, '').replace(/,/g, '.').replace(/×/g, '*').replace(/−/g, '-')) throw new Error(`illisible : ${src}`);
  let p = 0;
  const peek = () => toks[p];
  const primary = () => {
    const t = toks[p++];
    if (t === '(') { const v = expr(); if (toks[p++] !== ')') throw new Error('parenthèse'); return v; }
    if (t === '-') return neg(unary());
    return dec(t);
  };
  const unary = () => (peek() === '-' ? (p++, neg(unary())) : primary());
  const frac = () => { let v = unary(); while (peek() === '/') { p++; v = div(v, unary()); } return v; };
  const term = () => { let v = frac(); while (peek() === '*' || peek() === '÷') { const o = toks[p++]; const w = frac(); v = o === '*' ? mul(v, w) : div(v, w); } return v; };
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') { const o = toks[p++]; const w = term(); v = o === '+' ? add(v, w) : add(v, neg(w)); } return v; };
  const v = expr();
  if (p !== toks.length) throw new Error(`reste : ${src}`);
  return v;
}
const val = (s) => evaluate(s);
const irreducible = (s) => { const [a, b] = String(s).split('/'); return b === undefined ? /^-?\d+$/.test(a) : /^-?\d+$/.test(a) && /^\d+$/.test(b) && gcd(BigInt(a), BigInt(b)) === 1n && BigInt(b) > 1n; };
/** Lit un nombre LaTeX « -\frac{3}{4} », « 4 » (sans $). */
const tex = (s) => {
  let t = String(s).replace(/\$/g, '').trim();
  let sign = 1n;
  if (t.startsWith('-')) { sign = -1n; t = t.slice(1); }
  const m = /^\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
  const v = m ? R(BigInt(m[1]), BigInt(m[2])) : R(BigInt(t));
  return R(sign * v.n, v.d);
};

const ROWSETS = { PRODUCTS, SUMS, QUOTIENTS, SUMS2, MIXED, COMPOUND, AB, MISSING };

describe('العمليات على الأعداد الناطقة — le contenu en arithmétique exacte', () => {
  it('chaque ligne à choix : le calcul donne la valeur attendue, UNE option est juste (la clé), chaque distracteur est faux, la clé est irréductible', () => {
    for (const [name, rowsOf] of Object.entries(ROWSETS)) {
      rowsOf.forEach((r, i) => {
        const target = val(r.target);
        expect(eq(val(r.calc), target), `${name}[${i}] ${r.calc}`).toBe(true);
        expect(irreducible(r.target), `${name}[${i}] ${r.target}`).toBe(true);
        r.options.forEach((o, j) => {
          expect(eq(val(o.calc), target), `${name}[${i}] option ${o.calc}`).toBe(j === r.correct);
          expect(eq(tex(o.t), val(o.calc)), `${name}[${i}] écriture ${o.t}`).toBe(true);
        });
        expect(r.options).toHaveLength(3);
      });
    }
    expect(PRODUCTS.map((r) => r.target)).toEqual(['5/12', '5/12', '-14/11', '15/4', '6']);
    expect(SUMS.map((r) => r.target)).toEqual(['-11/24', '1/3', '2/15']);
    expect(QUOTIENTS.map((r) => r.target)).toEqual(['1/6', '-3/2', '-1/14', '1/6']);
    expect(AB.map((r) => r.target)).toEqual(['-1/30', '-17/30', '2/25', '9/8', '8/9']);
    expect(MISSING.map((r) => r.target)).toEqual(['4/3', '-3/10', '-4/7']);
  });

  it('deep-60 : une seule proposition atteint le résultat demandé', () => {
    for (const p of PAIRS) {
      const target = val(p.target);
      p.options.forEach((o, j) => expect(eq(val(o.calc), target), `${p.label} ${o.calc}`).toBe(j === p.correct));
    }
  });

  it('deep-63 : la clé est rangée, les autres non ; les مقلوبات sont les inverses des nombres', () => {
    const asc = (ws) => ws.every((w, i) => i === 0 || cmp(val(ws[i - 1]), val(w)) < 0);
    for (const o of ORDERS) {
      expect(asc(o.key), o.id).toBe(true);
      o.wrongs.forEach((w) => expect(asc(w), `${o.id} ${w.join(' ')}`).toBe(false));
      expect(o.wrongs.every((w) => [...w].sort().join() === [...o.key].sort().join())).toBe(true);
    }
    const orig = ['5/2', '-4/3', '-1', '3/5', '-2/7'];
    const rec = ['2/5', '-3/4', '-1', '5/3', '-7/2'];
    orig.forEach((w, i) => expect(eq(mul(val(w), val(rec[i])), R(1)), w).toBe(true));
    expect([...orig].sort((a, b) => cmp(val(a), val(b)))).toEqual(ORDERS[0].key);
    expect([...rec].sort((a, b) => cmp(val(a), val(b)))).toEqual(ORDERS[1].key);
  });

  it('ex-37 : la valeur est 3/7', () => {
    const e = EX['ex-37'];
    expect(eq(val('3/4-2/5+1/4-3/5+5/7-2/7'), R(3, 7))).toBe(true);
    expect(e.question.expected).toBe('3/7');
  });

  it('les طرائق et les معارف : chaque valeur écrite est recalculée', () => {
    expect(eq(val('-4/9+1.5/6'), R(-7, 36))).toBe(true);
    expect(eq(val('-2.5/14-3.1/21'), R(-137, 420))).toBe(true);
    expect(eq(val('5/2-9/14÷3/7'), R(1))).toBe(true);
    expect(eq(val('5/2-9/14'), R(13, 7)) && eq(div(R(13, 7), R(3, 7)), R(13, 3))).toBe(true);          // le piège « de gauche à droite »
    expect(METHOD.sumDec.solution.join(' ')).toContain('-\\frac{7}{36}');
    expect(METHOD.diffDec.solution.join(' ')).toContain('-\\frac{137}{420}');
    expect(METHOD.chain.solution.join(' ')).toContain('=1');
    expect(eq(val('-2.4/5+6.9/5'), R(9, 10)) && eq(val('-5/8-(-13/8)'), R(1)) && eq(val('5/6+(-7/4)'), R(-11, 12))).toBe(true);
    expect(eq(val('9/4*(-1.6/3)'), R(-6, 5)) && eq(val('6*(-5/9)'), R(-10, 3))).toBe(true);
    expect(eq(val('-6/7÷(-3)'), R(2, 7)) && eq(val('5/9÷(-10/3)'), R(-1, 6))).toBe(true);
    expect(eq(mul(R(-5), R(-1, 5)), R(1)) && eq(mul(R(-8, 11), R(-11, 8)), R(1))).toBe(true);
    expect(KNOWLEDGE.sum.examples).toContain('\\frac{9}{10}');
    expect(KNOWLEDGE.recip.text).toContain('-\\frac{11}{8}');
    expect(GUIDE.sumsign.right).toContain('\\frac{7}{12}');
    expect(eq(val('7/3-8/15÷11/20'), R(15, 11)) && eq(val('8/15÷11/20'), R(32, 33))).toBe(true);
    expect(eq(val('(1/2-3/4)*2/3'), R(-1, 6))).toBe(true);
    expect(Object.keys(RECALL)).toEqual(['sign', 'div', 'sum', 'rational']);
    expect(Object.values(RECALL).map((r) => r.lesson)).toEqual(['jidaa-adadayn-nisbiyayn', 'maqlub-qismat-kasrayn', 'jam-tarh-kasrayn', 'adad-natiq']);
    // les deux erreurs d'impression du manuel ne sont JAMAIS écrites
    expect(JSON.stringify(METHOD)).not.toContain('23}{33');
    expect(val('7/3-32/33')).not.toEqual(R(23, 33));
  });

  it('أستعدّ : chaque affirmation est recalculée', () => {
    const truth = [eq(val('(-3)*(-7)'), R(21)), eq(val('(-2)*5*(-1)*(-3)'), R(-30)), eq(val('5/6÷2/3'), R(5, 4)), eq(val('3/4+1/6'), R(4, 10)), eq(val('6/-8'), R(-3, 4))];
    expect(PREP_PLATFORM_ITEMS.map((i) => i.answer)).toEqual(truth);
    expect(PREP_ITEMS.map((i) => i.answer)).toEqual([eq(val('(-9)+(-6)'), R(-15)), eq(val('13+(-20)'), R(-7)), eq(val('(-15)-(-9)'), R(-6))]);
    expect(PREP_ITEMS.map((i) => i.n)).toEqual([9, 10, 11]);
  });

  it('le labo : chaque chaîne du plan vaut le résultat du plan ; chaque pavé de signe du monde `signs`', () => {
    const own = (chain) => val(chain.replace('@', '/'));
    const expected = { c1: R(7, 12), c2: R(-56, 65), c3: R(3, 2), c4: R(15, 11), a1: R(1), a2: R(-3, 2), a3: R(-10), a4: R(-8, 15) };
    for (const lv of ['beginner', 'advanced']) {
      for (const t of LEVELS['merge-board'][lv].numbers.tasks) expect(eq(own(t.chain), expected[t.id]), t.id).toBe(true);
    }
    expect(LEVELS['merge-board'].beginner.numbers.tasks.map((t) => t.id)).toEqual(['c1', 'c2', 'c3', 'c4']);
    expect(LEVELS['merge-board'].advanced.numbers.tasks.map((t) => t.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
    expect(LAB.signs.tasks.map((t) => Math.sign(Number(own(t.chain).n)))).toEqual([-1, -1, 1, -1, -1, 1]);
    expect(L.PRESETS.signs.tasks.map((t) => t.chain)).toEqual(LAB.signs.tasks.map((t) => t.chain));
  });

  it('إختبار أولي : chaque clé est recalculée, chaque distracteur est faux, et le module contient chaque option', async () => {
    const modules = import.meta.glob('../modules/Module08Itqan.jsx', { query: '?raw', import: 'default', eager: true });
    const source = Object.values(modules)[0];
    for (const e of FINAL) {
      const target = val(e.target);
      expect(eq(val(e.calc), target), e.id).toBe(true);
      e.options.forEach((o, i) => {
        expect(eq(val(o.calc), target), `${e.id} ${o.t}`).toBe(i === e.correct);
        expect(eq(tex(o.t), val(o.calc))).toBe(true);
        expect(source.includes(o.t.replace('$', '').replace(/\$$/, '').replace(/\\/g, '\\\\')), `${e.id} : ${o.t}`).toBe(true);
      });
    }
    expect(FINAL.map((e) => e.lp)).toEqual([LP.P1, LP.P2, LP.P3, LP.P4, LP.P4]);
  });

  it('chaque exercice porte un LP de la leçon, une source de manuel, et la liste est celle du module', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source.type).toBe('textbook');
    }
    expect(EXERCISES.map((e) => e.id)).toEqual(['act-6-prod', 'act-6-sum', 'act-6-quot', 'ex-34', 'ex-37', 'ex-42', 'ex-48', 'ex-53', 'deep-60', 'deep-63-orig', 'deep-63-recip', 'ex-54']);
    expect(new Set(EXERCISES.map((e) => e.learningPointId))).toEqual(new Set(Object.values(LP)));
  });

  it('la config : quatre الكفاءات, ordre des modules, un seul objective par paire de niveaux, aucune adresse au manuel', async () => {
    const levelled = LESSON_CONFIG.resources.filter((r) => r.type === 'merge-board' && r.level);
    expect(levelled).toHaveLength(2);
    expect(levelled[0].objective).toBe(levelled[1].objective);
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.skills).toHaveLength(4);
    expect(LESSON_CONFIG.modules.reduce((s, m) => s + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    const raws = import.meta.glob(['../modules/*.jsx', './textbook.js', './exercises.js', './problems.js', '../knowledge.jsx', '../knowledgeGraph.js'], { query: '?raw', import: 'default', eager: true });
    for (const [file, text] of Object.entries(raws)) {
      const shown = String(text).split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
      expect(shown, file).not.toMatch(/الكتاب|ص\s?\d|في الكتاب|اقرأ ما يقوله/);
    }
  });
});
