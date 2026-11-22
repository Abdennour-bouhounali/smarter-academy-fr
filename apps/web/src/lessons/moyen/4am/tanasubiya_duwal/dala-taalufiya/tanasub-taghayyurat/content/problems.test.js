import { describe, it, expect } from 'vitest';
import * as Aff from '@smarter-academy/core/arithmetic/affine.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE (fractions de linear.js) : chaque fonction est RETROUVÉE à partir de deux
//    nombres et de leurs images de l'énoncé (affine.fromTwoPoints), jamais tapée. ──
const N = (p) => Lin.toNumber(p);
const fr = (n, d = 1) => Lin.frac(n, d);
const rate = (x1, y1, x2, y2) => Lin.div(Lin.sub(fr(y2), fr(y1)), Lin.sub(fr(x2), fr(x1)));

const partOf = (id, part) => PROBLEM[id].parts[part];
const expectedOf = (id, part) => partOf(id, part).steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => partOf(id, part).steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const wrongOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options.filter((_, i) => i !== s.correct); };

/** « $f(x) = 300x + 2300$ » → la fonction exacte. */
const fnOf = (option) => {
  const m = option.match(/^\$[a-z]\(x\) = (.*)\$$/);
  if (!m) throw new Error(`not an expression: ${option}`);
  return Aff.affine(m[1].replace(/\{,\}/g, '.').replace(/\s+/g, ''));
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre est évalué — nombres (4{,}5),
// ×, +, −, parenthèses, \dfrac{a}{b}, produit implicite (6a, 1{,}5x, 300(11 − 6)) — avec les VALEURS
// des inconnues de la partie (`env`) ; une relation entre deux membres évaluables VOISINS est
// vérifiée. Un membre qui contient \ldots, une lettre hors `env` (f, g, h…) ou un \begin est ignoré.
const EPS = 1e-9;
function evalExpr(src, env = {}) {
  const s = src
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '*')
    .replace(/\{,\}/g, '.')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()a-z]+$/.test(s)) return null;
  if ([...s.matchAll(/[a-z]/g)].some(([v]) => !(v in env))) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i] !== ')') throw new Error(`) in ${src}`); i++; } else if (/[a-z]/.test(s[i])) { v = env[s[i]]; i++; } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    while (s[i] === '(' || /[a-z]/.test(s[i] ?? '')) v *= atom(); // produit implicite
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where, env) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\begin')) continue;
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1], env), parts[k], evalExpr(parts[k + 1], env)];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

// ── Les trois fonctions, CALCULÉES à partir de l'énoncé ──
const f = Aff.fromTwoPoints(6, 4100, 15, 6800); // l'abonnement : Karim (6 ; 4100), Walid (15 ; 6800)
const tableOf = PROBLEM['masala-2'].table;
const weeks = tableOf.head.slice(1).map(Number);
const heights = tableOf.rows[0].slice(1).map(Number);
const h = Aff.fromTwoPoints(weeks[0], heights[0], weeks[1], heights[1]); // la شتلة : (2 ; 13), (6 ; 31)
const g = Aff.fromTwoPoints(6, 17, 20, 38); // la batterie : (6 ; 17 %), (20 ; 38 %)
const ab = (fn) => ({ a: N(fn.a), b: N(fn.b) });
const ENV = {
  'masala-1': [ab(f), ab(f), ab(f)],
  'masala-2': [ab(h), ab(h), ab(h)],
  'masala-3': [ab(g), ab(g), { ...ab(g), x: N(Aff.antecedentOf(g, 80).x) }],
};

describe('les مسائل du درس 3 (unité 7) « تعيين دالة تآلفية انطلاقًا من عددين وصورتيهما »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (4, 5, 6 — track problem, practice_lab, before the test 7)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [4, '04', 'masala-1', 'practice_lab', 8], [5, '05', 'masala-2', 'practice_lab', 8], [6, '06', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '07', number: 7, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(69);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare letter, a/b or « DA » in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.title, p.statement, ...p.data.map((d) => d.text), ...(p.table ? [...p.table.head, ...p.table.rows.flat()] : []), ...p.parts.flatMap((part) => [part.title, part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[a-z]\b|\bDA\b/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part, pi) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      const env = ENV[p.id][pi];
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where, env);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`, env);
    }));
    expect(checked).toBeGreaterThan(60);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$\\dfrac{2700}{9} = 301$', 'mutant')).toThrow();
    expect(() => checkText('$b = 4100 - 300 \\times 6 = 2400$', 'mutant', { b: 2300 })).toThrow();
    expect(() => checkText('$13 - 4{,}5 \\times 2 = 5$', 'mutant')).toThrow();
    expect(() => checkText('$1{,}5x + 8 = 80$', 'mutant', { x: 47 })).toThrow();
    expect(() => checkText('$5900 \\neq 5900$', 'mutant')).toThrow();
    expect(checkText('$(20a + b) - (6a + b) = 14a$ و $\\dfrac{53 - 38}{30 - 20} = 1{,}5$', 'ok', { a: 1.5, b: 8 })).toBe(2);
  });

  it('مسألة 1 — the subscription: a, b, the receipts and the budget are computed, not typed', () => {
    // 1) a = (6800 − 4100) / (15 − 6) = 2700 / 9 = 300 ; b = 4100 − 300 × 6 = 2300
    expect(Lin.eq(rate(6, 4100, 15, 6800), f.a)).toBe(true);
    expect([N(f.a), N(f.b)]).toEqual([300, 2300]);
    expect(Lin.isInteger(f.a) && Lin.isInteger(f.b)).toBe(true);
    expect(expectedOf('masala-1', 0)).toEqual([6800 - 4100, N(f.a), N(Aff.interceptFrom(f.a, 6, 4100))]);
    const expr = fnOf(correctOf('masala-1', 0, 1));
    expect(Lin.eq(expr.a, f.a) && Lin.eq(expr.b, f.b)).toBe(true);
    expect(Aff.onLine(expr, 15, 6800)).toBe(true); // la vérification par l'autre nombre
    // chaque distracteur trahit Karim ou Walid
    for (const w of wrongOf('masala-1', 0, 1)) { const d = fnOf(w); expect(Aff.onLine(d, 6, 4100) && Aff.onLine(d, 15, 6800), w).toBe(false); }
    // 2) Anis (11 ; 5600) : quotient avec Karim = a ; Riad (12 ; 6000) : f(12) = 5900 ≠ 6000
    expect(Lin.eq(rate(6, 4100, 11, 5600), f.a)).toBe(true);
    expect(Aff.onLine(f, 11, 5600)).toBe(true);
    expect(Aff.onLine(f, 12, 6000)).toBe(false);
    expect(Lin.eq(rate(6, 4100, 12, 6000), f.a)).toBe(false);
    expect(Lin.eq(rate(6, 4100, 12, 6000), fr(1900, 6))).toBe(true);
    expect(expectedOf('masala-1', 1)).toEqual([N(rate(6, 4100, 11, 5600)), N(Aff.imageOf(f, 12))]);
    expect(6000 - N(Aff.imageOf(f, 12))).toBe(100);
    // 3) budget 8250 : 8250 − 2300 = 5950 = 300 × 19 + 250 → 19 matchs, f(19) = 8000, reste 250
    const budget = 8250;
    const pre = Aff.antecedentOf(f, budget);
    expect(Lin.isInteger(pre.x)).toBe(false); // l'antécédent n'est pas entier : 119/6
    expect(Lin.eq(pre.x, fr(119, 6))).toBe(true);
    const left = budget - N(f.b);
    const most = Math.floor(N(pre.x));
    expect(N(Aff.imageOf(f, most))).toBeLessThanOrEqual(budget);
    expect(N(Aff.imageOf(f, most + 1))).toBeGreaterThan(budget);
    expect(left).toBe(N(f.a) * most + (left % N(f.a)));
    expect(expectedOf('masala-1', 2)).toEqual([left, most, budget - N(Aff.imageOf(f, most))]);
    expect(expectedOf('masala-1', 2)).toEqual([5950, 19, 250]);
  });

  it('مسألة 2 — the sunflower: the table, a = 9/2, b, Amine\'s wrong measure and the net are computed, not typed', () => {
    expect(weeks).toEqual([2, 6, 10]);
    expect(heights).toEqual([13, 31, 50]);
    // 1) a = 18/4 = 9/2 exactement, b = 13 − 9 = 4
    expect(Lin.eq(h.a, fr(9, 2))).toBe(true);
    expect(Lin.eq(h.b, fr(4))).toBe(true);
    expect(expectedOf('masala-2', 0)).toEqual([N(h.a), N(Aff.interceptFrom(h.a, 2, 13))]);
    expect(PROBLEM['masala-2'].parts[0].steps.find((s) => s.expected === N(h.a)).display).toBe('4,5');
    expect(Aff.onLine(h, 6, 31)).toBe(true);
    expect(Lin.eq(Aff.imageOf(h, 0), h.b)).toBe(true); // b = طول الغرس
    // 2) h(10) = 31 + 9/2 × 4 = 49 ≠ 50 ; le quotient de la mesure d'Amine vaut 19/4
    const grow = Lin.mul(h.a, fr(10 - 6));
    expect(Lin.eq(grow, fr(18))).toBe(true);
    expect(expectedOf('masala-2', 1)).toEqual([N(grow), N(Aff.imageOf(h, 10))]);
    expect(N(Aff.imageOf(h, 10))).toBe(49);
    expect(Aff.onLine(h, weeks[2], heights[2])).toBe(false);
    expect(Lin.eq(rate(6, 31, 10, 50), fr(19, 4))).toBe(true);
    // 3) filet de 67 cm : 36 cm de plus, 36 ÷ 9/2 = 8 semaines après la 6e, semaine 14
    const more = 67 - N(Aff.imageOf(h, 6));
    const after = Lin.div(fr(more), h.a);
    expect(Lin.isInteger(after)).toBe(true);
    const week = Aff.antecedentOf(h, 67);
    expect(week.kind).toBe('unique');
    expect(N(week.x)).toBe(6 + N(after));
    expect(expectedOf('masala-2', 2)).toEqual([more, N(after), N(week.x)]);
    expect(correctOf('masala-2', 2, 0)).toBe('$\\dfrac{36}{4{,}5}$');
  });

  it('مسألة 3 — the battery: the jumla, a = 3/2, b, the third reading and the stop time are computed, not typed', () => {
    // 1) la jumla en a et b : sa solution EST la fonction des deux lectures ; les distracteurs non
    const solveAB = (tex) => {
      const m = tex.match(/\\begin\{cases\}(.*)\\\\(.*)\\end\{cases\}/);
      const r = LS.classify(LS.system(m[1].trim(), m[2].trim(), ['a', 'b']));
      return r.kind === 'unique' ? [N(r.x), N(r.y)] : r.kind;
    };
    expect(solveAB(correctOf('masala-3', 0, 0))).toEqual([N(g.a), N(g.b)]);
    for (const w of wrongOf('masala-3', 0, 0)) expect(solveAB(w), w).not.toEqual([N(g.a), N(g.b)]);
    // la soustraction : (20a + b) − (6a + b) = 14a = 38 − 17 = 21
    const [e1, e2] = LS.system('6a+b=17', '20a+b=38', ['a', 'b']);
    const d = LS.subEqs(e2, e1);
    expect(LS.eliminated(d)).toBe('y'); // la 2e inconnue (b) disparaît
    expect(correctOf('masala-3', 0, 1)).toBe(`$${N(d.a)}a = ${N(d.c)}$`);
    expect(Lin.eq(g.a, fr(3, 2))).toBe(true);
    expect(Lin.eq(g.a, rate(6, 17, 20, 38))).toBe(true); // la même par تناسب التغيّرات
    expect(expectedOf('masala-3', 0)).toEqual([N(g.a), N(g.b)]);
    const expr = fnOf(correctOf('masala-3', 0, 2));
    expect(Lin.eq(expr.a, g.a) && Lin.eq(expr.b, g.b)).toBe(true);
    for (const w of wrongOf('masala-3', 0, 2)) { const dd = fnOf(w); expect(Aff.onLine(dd, 6, 17) && Aff.onLine(dd, 20, 38), w).toBe(false); }
    // 2) la lecture (30 ; 53) : quotient (53 − 38)/(30 − 20) = 3/2 = a, et g(30) = 53 ; b = g(0) = 8
    expect(Lin.eq(rate(20, 38, 30, 53), g.a)).toBe(true);
    expect(Aff.onLine(g, 30, 53)).toBe(true);
    expect(expectedOf('masala-3', 1)).toEqual([N(rate(20, 38, 30, 53))]);
    expect(N(Aff.imageOf(g, 0))).toBe(8);
    // 3) 1,5x + 8 = 80 → 1,5x = 72 → x = 48 min ; 21 h 40 + 48 min = 22 h 28
    const stop = Aff.antecedentOf(g, 80);
    expect(Lin.isInteger(stop.x)).toBe(true);
    expect(expectedOf('masala-3', 2)).toEqual([80 - N(g.b), N(stop.x)]);
    const minutes = 21 * 60 + 40 + N(stop.x);
    expect([Math.floor(minutes / 60), minutes % 60]).toEqual([22, 28]);
    expect(correctOf('masala-3', 2, 1)).toBe(`على الساعة ${Math.floor(minutes / 60)} و ${minutes % 60} دقيقة`);
    // les heures fausses : durées comptées depuis une lecture (42 et 28 min) ou 48 lues comme minutes
    const from = (x0, y0) => N(Lin.div(Lin.sub(fr(80), fr(y0)), g.a));
    expect([from(6, 17), from(20, 38)]).toEqual([42, 28]);
    expect(wrongOf('masala-3', 2, 1)).toEqual(['على الساعة 22 و 22 دقيقة', 'على الساعة 22 و 8 دقائق', 'على الساعة 22 و 48 دقيقة']);
  });
});
