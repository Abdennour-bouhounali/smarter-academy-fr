import { describe, it, expect } from 'vitest';
import { LESSON_CONFIG } from '../lesson.config';
import { CALC1, CALC2, LCMS, MENTAL, SIMPLEST, MISSING, MISSING2, EXERCISES, EX, FINAL, LP } from './exercises';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS, KNOWLEDGE, METHOD, GUIDE, LAB, RECALL } from './textbook';
import * as L from '../../../../../../common/manipulations/logic/seedRake';
import { LEVELS } from '../../../../../../common/manipulations/levels';

/* Arithmétique de contrôle en BigInt, INDÉPENDANTE de fractions3.js / powers.js : un rationnel est { n, d } réduit. */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a || 1n; };
const R = (n, d = 1n) => { n = BigInt(n); d = BigInt(d); const g = gcd(n, d); return d < 0n ? { n: -n / g, d: -d / g } : { n: n / g, d: d / g }; };
const add = (x, y) => R(x.n * y.d + y.n * x.d, x.d * y.d);
const sub = (x, y) => R(x.n * y.d - y.n * x.d, x.d * y.d);
const eq = (x, y) => x.n === y.n && x.d === y.d;
const lcm2 = (a, b) => (a * b) / gcd(a, b);
const frac = (s) => { const [a, b] = String(s).split('/'); return R(a, b ?? 1); };
/** Évalue une expression LaTeX faite de \frac{a}{b}, d'entiers, de + et de −, de gauche à droite. */
function evalTex(tex) {
  const tokens = [...String(tex).replace(/\$/g, '').matchAll(/\\frac\{(\d+)\}\{(\d+)\}|(\d+)|([+\-−])/g)];
  let acc = null; let op = '+';
  for (const m of tokens) {
    if (m[4]) { op = m[4] === '+' ? '+' : '-'; continue; }
    const v = m[1] !== undefined ? R(m[1], m[2]) : R(m[3]);
    acc = acc == null ? v : op === '+' ? add(acc, v) : sub(acc, v);
  }
  return acc;
}
const termsValue = (terms) => { let acc = null; let op = '+'; for (const t of terms) { if (t === '+' || t === '-') { op = t; continue; } const v = frac(t); acc = acc == null ? v : op === '+' ? add(acc, v) : sub(acc, v); } return acc; };
const optValue = (o) => evalTex(o.replace(/م/g, ''));
const reduced = (r) => gcd(r.n, r.d) === 1n;

const checkRow = (r, simplest = false) => {
  const key = frac(r.key);
  expect(eq(termsValue(r.terms), key), r.label).toBe(true);
  expect(r.options.length).toBe(3);
  expect(eq(optValue(r.options[r.correct]), key), r.label).toBe(true);
  r.options.forEach((o, i) => {
    if (i === r.correct) return;
    const v = optValue(o);
    // faux : une autre valeur, ou (écriture « sur le plus simple ») la même valeur écrite NON réduite
    if (!eq(v, key)) return;
    const m = /\\frac\{(\d+)\}\{(\d+)\}/.exec(o);
    expect(simplest && m && gcd(BigInt(m[1]), BigInt(m[2])) > 1n, `${r.label} : ${o}`).toBe(true);
  });
  if (simplest) expect(reduced(key), r.label).toBe(true);
};

describe('جمع وطرح كسرين — le contenu en arithmétique exacte', () => {
  it('act-4 : chaque clé est la somme ou la différence, chaque distracteur est faux', () => { CALC1.forEach((r) => checkRow(r)); expect(CALC1.map((r) => r.key)).toEqual(['17/24', '13/12', '17/12', '41/20']); });
  it('now-2 : trois termes et un naturel', () => { CALC2.forEach((r) => checkRow(r)); expect(CALC2.map((r) => r.key)).toEqual(['5/4', '73/24']); });
  it('ex-18 : le calcul mental', () => { MENTAL.forEach((r) => checkRow(r)); expect(MENTAL.map((r) => r.key)).toEqual(['3/4', '1/2', '7/5', '13/4']); });
  it('ex-20 : la forme la plus simple (clé irréductible ; un distracteur peut être égal mais non réduit)', () => {
    SIMPLEST.forEach((r) => checkRow(r, true));
    expect(SIMPLEST.map((r) => r.key)).toEqual(['23/18', '23/24', '13/30', '31/30']);
  });
  it('ex-11 : chaque clé est le PLUS PETIT multiple commun (brute force), aucun distracteur ne l\'est', () => {
    for (const r of LCMS) {
      const [a, b] = r.pair.map(BigInt);
      let m = 1n; while (!(m % a === 0n && m % b === 0n)) m += 1n;
      expect(BigInt(r.key)).toBe(m);
      expect(m).toBe(lcm2(a, b));
      expect(BigInt(r.options[r.correct].replace(/\D/g, ''))).toBe(m);
      r.wrongs.forEach((w) => expect(BigInt(w)).not.toBe(m));
    }
    expect(LCMS.map((r) => r.key)).toEqual([18, 24, 30, 42, 36]);
  });
  it('deep-62 et deep-65 : les termes manquants', () => {
    const rest = sub(frac(MISSING.lhs), MISSING.parts.map(frac).reduce(add));
    expect(eq(rest, R(1, MISSING.x))).toBe(true);
    const r2 = sub(sub(R(MISSING2.whole), frac(MISSING2.minus[0])), frac(MISSING2.lhs));   // 1/x = 2 − 3/4 − 5/6
    const x = frac(MISSING2.options[MISSING2.correct]);
    expect(eq(R(x.d, x.n), r2)).toBe(true);
    MISSING2.options.forEach((o, i) => { if (i !== MISSING2.correct) expect(eq(R(frac(o).d, frac(o).n), r2)).toBe(false); });
  });
  it('« أستعدّ » : la vérité de chaque affirmation est recalculée', () => {
    for (const it of [...PREP_ITEMS, ...PREP_PLATFORM_ITEMS]) {
      if (it.skill === 'tawhid') continue;
      const [lhs, rhs] = it.text.split('=');
      expect(eq(evalTex(lhs), evalTex(rhs.replace(/\./g, ''))), it.text).toBe(it.answer);
    }
    const tawhid = PREP_PLATFORM_ITEMS.find((i) => i.skill === 'tawhid');
    expect(eq(R(3 * 3, 12), R(9, 12))).toBe(true);
    expect(tawhid.answer).toBe(true);
    expect(new Set([...PREP_ITEMS, ...PREP_PLATFORM_ITEMS].map((i) => i.answer))).toEqual(new Set([true, false]));
  });
  it('les exemples et les méthodes de la leçon sont justes', () => {
    expect(eq(add(R(2, 9), R(5, 6)), R(19, 18))).toBe(true);
    expect(eq(sub(R(11, 12), R(5, 8)), R(7, 24))).toBe(true);
    expect(KNOWLEDGE.examples.text).toContain('\\frac{19}{18}');
    expect(KNOWLEDGE.examples.text).toContain('\\frac{7}{24}');
    expect(eq(add(R(7, 18), R(5, 12)), R(29, 36))).toBe(true);
    expect(lcm2(18n, 12n)).toBe(36n);
    expect(eq(sub(R(13, 20), R(4, 15)), R(23, 60))).toBe(true);
    expect(lcm2(20n, 15n)).toBe(60n);
    expect(eq(sub(add(R(2), R(1, 6)), R(3, 4)), R(17, 12))).toBe(true);
    expect(METHOD.smallest.solution.join(' ')).toContain('\\frac{29}{36}');
    expect(GUIDE.across.right).toContain('\\frac{5}{12}');
    expect(eq(sub(R(3), R(5, 8)), R(19, 8))).toBe(true);
    expect(RECALL.text).toContain('\\frac{7}{9}');
    expect(eq(add(R(5, 9), R(2, 9)), R(7, 9))).toBe(true);
  });
  it('إختبار أولي : chaque clé est recalculée, chaque distracteur est faux, et le module contient chaque option', async () => {
    const modules = import.meta.glob('../modules/Module08Itqan.jsx', { query: '?raw', import: 'default', eager: true });
    const source = Object.values(modules)[0];
    for (const e of FINAL) {
      const key = e.options[e.correct];
      let truth;
      if (e.truth.kind === 'calc') truth = termsValue(e.truth.terms);
      if (e.truth.kind === 'rest') truth = sub(R(1), e.truth.parts.map(frac).reduce(add));
      if (e.truth.kind === 'lcm') {
        const m = e.truth.dens.map(BigInt).reduce(lcm2);
        expect(BigInt(key.replace(/\D/g, ''))).toBe(m);
        e.options.forEach((o, i) => { if (i !== e.correct) expect(BigInt(o.replace(/\D/g, ''))).not.toBe(m); });
      } else {
        expect(eq(evalTex(key.replace(/\$/g, '')), truth), e.id).toBe(true);
        e.options.forEach((o, i) => { if (i !== e.correct) expect(eq(evalTex(o.replace(/\\frac/g, '\\frac').replace(/^\$-/, '$0-')), truth) && !o.includes('-'), `${e.id} ${o}`).toBe(false); });
      }
      for (const o of e.options) expect(source.includes(o.replace(/\\/g, '\\\\')), `${e.id} : ${o}`).toBe(true);
      expect(e.lp).toMatch(/^3am_jam-tarh-kasrayn_P[123]$/);
    }
    expect(new Set(FINAL.map((e) => e.lp))).toEqual(new Set([LP.P1, LP.P2, LP.P3]));
  });
  it('chaque exercice porte un LP de la leçon, une source de manuel, et ne cite que des éléments de la leçon', () => {
    for (const e of EXERCISES) {
      expect(Object.values(LP)).toContain(e.learningPointId);
      expect(e.source.type).toBe('textbook');
    }
    expect(Object.keys(EX)).toEqual(['act-4', 'now-2', 'ex-11', 'ex-18', 'ex-20', 'deep-62', 'deep-65']);
  });
  it('le labo : les tâches du niveau sont celles de la leçon, le monde `fewest` de معارف est 3/4 + 5/6 en 12 (9 + 10 = 19)', () => {
    expect(LEVELS['seed-rake'].beginner.numbers.tasks.map((t) => t.id)).toEqual(['g1', 'g2', 'g3']);
    const t = L.buildTask(LAB.fewest.tasks[0]);
    expect(t.widestN).toBe(12);
    expect(L.resultAt(L.setN(L.init(LAB.fewest), 12)).counts).toEqual([9, 10]);
    expect(L.resultAt(L.setN(L.init(LAB.fewest), 12)).totalText).toBe('19/12');
  });
  it('la config : LP du catalogue, ordre des modules, un seul objective par paire de niveaux', () => {
    const levelled = LESSON_CONFIG.resources.filter((r) => r.type === 'seed-rake' && r.level);
    expect(levelled).toHaveLength(2);
    expect(levelled[0].objective).toBe(levelled[1].objective);
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.skills).toHaveLength(3);
  });
});
