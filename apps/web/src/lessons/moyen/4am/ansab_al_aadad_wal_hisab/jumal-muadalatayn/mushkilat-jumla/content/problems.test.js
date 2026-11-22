import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Résolution EXACTE d'une جملة { a1 x + b1 y = c1 ; a2 x + b2 y = c2 } (Cramer, en fractions entières). ──
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const frac = (n, d) => { const g = gcd(n, d) * Math.sign(d); return [n / g, d / g]; };
function solveSystem([a1, b1, c1], [a2, b2, c2]) {
  const det = a1 * b2 - a2 * b1;
  expect(det).not.toBe(0);
  return { x: frac(c1 * b2 - c2 * b1, det), y: frac(a1 * c2 - a2 * c1, det) };
}
/** La solution, si elle est faite d'entiers ; sinon null. */
const integerSolution = (e1, e2) => {
  const { x, y } = solveSystem(e1, e2);
  return x[1] === 1 && y[1] === 1 ? { x: x[0], y: y[0] } : null;
};
/** Vérification PAR SUBSTITUTION dans les deux équations. */
const satisfies = ([a1, b1, c1], [a2, b2, c2], x, y) => a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2;

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => stepsOf(id, part).filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, solution lines, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre purement numérique (entiers,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué, et chaque relation entre deux membres
// numériques VOISINS est vérifiée. Les membres contenant une lettre (x, y, a, b, p) sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  const s = src
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/\d/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of text.matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\begin')) continue; // une جملة : vérifiée par substitution ailleurs
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS, '\\neq': Math.abs(x - y) > EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** Les coefficients d'une équation « αx + βy = γ » écrite en LaTeX (lettres quelconques). */
function coeffs(eq, [u, v]) {
  const [lhs, rhs] = eq.split('=').map((t) => t.replace(/\s+/g, ''));
  const coef = (L) => { const m = lhs.match(new RegExp(`(^|[+-])(\\d*)${L}`)); if (!m) return 0; const n = m[2] === '' ? 1 : Number(m[2]); return m[1] === '-' ? -n : n; };
  return [coef(u), coef(v), evalExpr(rhs)];
}
/** Les deux équations d'une option `\begin{cases} … \\ … \end{cases}`. */
const casesOf = (tex, letters) => tex.match(/\\begin\{cases\}(.*)\\end\{cases\}/)[1].split('\\\\').map((e) => coeffs(e.trim(), letters));

describe('les مسائل du درس 3 (unité 5) « حل مشكلات بتوظيف جمل معادلتين »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(81);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
    expect(PROBLEMS.map((p) => p.id)).toEqual(['masala-1', 'masala-2', 'masala-3']);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
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

  it('no bare letter, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyabp]\b|\bDA\b|نقاط التعلّم/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(60);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$250 \\times 100 + 100 \\times 80 = 33100$', 'mutant')).toThrow();
    expect(() => checkText('$x = \\dfrac{19000}{150} = \\dfrac{381}{3}$', 'mutant')).toThrow();
    expect(() => checkText('$1900 > 2000$', 'mutant')).toThrow();
    expect(checkText('$210 - \\dfrac{380}{3} = \\dfrac{250}{3}$ و $20000 \\div 500 = 40$ و $40 > 30$', 'ok')).toBe(3);
  });

  it('every correct system option is the one whose solution is the answer; each wrong one is a real mis-translation', () => {
    // masala-1 1) : la bonne جملة donne (100 ; 80), celle aux prix inversés donne (80 ; 100) — le piège.
    const m1 = choiceOf('masala-1', 0, 2);
    const sols = m1.options.map((o) => { const [e1, e2] = casesOf(o, ['x', 'y']); return integerSolution(e1, e2); });
    expect(sols[0]).toEqual({ x: 100, y: 80 });
    expect(sols[1]).toEqual({ x: 80, y: 100 });
    // masala-2 1) et 2), masala-3 1) et 2) : la bonne option est la جملة du test
    expect(casesOf(correctOf('masala-2', 0, 2), ['x', 'y'])).toEqual([[4, 3, 290], [2, 5, 250]]);
    expect(casesOf(correctOf('masala-2', 1, 0), ['a', 'b'])).toEqual([[1, 1, 300], [50, 30, 12600]]);
    expect(casesOf(correctOf('masala-1', 1, 0), ['x', 'y'])).toEqual([[1, 1, 210], [250, 100, 40000]]);
    expect(casesOf(correctOf('masala-3', 1, 0), ['x', 'y'])).toEqual([[1, 1, 50], [900, 400, 40000]]);
    for (const [id, part, k] of [['masala-1', 0, 2], ['masala-1', 1, 0], ['masala-2', 0, 2], ['masala-2', 1, 0], ['masala-3', 1, 0]]) {
      expect(choiceOf(id, part, k).correct, `${id} ${part}`).toBe(0);
    }
  });

  it('مسألة 1 — le musée : la جملة résolue, vérifiée par substitution, le relevé impossible, l’entrée gratuite', () => {
    const adult = 250, child = 100, visitors = 180, income = 33000;
    const e1 = [1, 1, visitors], e2 = [adult, child, income];
    const s = integerSolution(e1, e2);
    expect(s).toEqual({ x: 100, y: 80 });
    expect(satisfies(e1, e2, s.x, s.y)).toBe(true);
    // la ثنائية inversée vérifie « 180 زائرًا » mais pas les recettes
    expect(s.y + s.x).toBe(visitors);
    expect(adult * s.y + child * s.x).toBe(30000);
    // 1) étape de substitution : (250 − 100) x = 33000 − 100 × 180
    expect((adult - child)).toBe(150);
    expect(expectedOf('masala-1', 0)).toEqual([income - child * visitors, s.x, s.y]);
    // 2) « 210 زائر ، 40000 دج » : x = 380/3 — pas un nombre naturel
    const r = solveSystem([1, 1, 210], [adult, child, 40000]);
    expect(r).toEqual({ x: [380, 3], y: [250, 3] });
    expect(380 % 3).not.toBe(0);
    expect(expectedOf('masala-1', 1)).toEqual([40000 - child * 210]);
    expect(correctOf('masala-1', 1, 1)).toBe('$x = \\dfrac{380}{3}$ و $y = \\dfrac{250}{3}$');
    for (const [x, y] of [[126, 84], [127, 83]]) expect(satisfies([1, 1, 210], [adult, child, 40000], x, y)).toBe(false);
    // 3) les صغار entrent gratuitement : perte = 100 × 80 ; nouveau prix p tel que 100 p = 33000
    const loss = child * s.y;
    const p = income / s.x;
    expect(Number.isInteger(p)).toBe(true);
    expect(expectedOf('masala-1', 2)).toEqual([loss, p]);
    expect([loss, p]).toEqual([8000, 330]);
  });

  it('مسألة 2 — la coopérative : les deux prix, les ventes, le stock et le bénéfice', () => {
    const e1 = [4, 3, 290], e2 = [2, 5, 250];
    const pr = integerSolution(e1, e2);
    expect(pr).toEqual({ x: 50, y: 30 });
    expect(satisfies(e1, e2, pr.x, pr.y)).toBe(true);
    expect(satisfies(e1, e2, pr.y, pr.x)).toBe(false); // prix inversés
    // 1) combinaison : 2 × (2)  −  (1) → (2·5 − 3) y = 2·250 − 290
    expect([2 * 5 - 3, 2 * 250 - 290]).toEqual([7, 210]);
    expect(expectedOf('masala-2', 0)).toEqual([2 * 250 - 290, pr.y, 290 - 3 * pr.y, pr.x]);
    // 2) 300 unités, 12600 دج
    const cakesMade = 250, bottlesMade = 160, sold = 300, revenue = 12600;
    const s = integerSolution([1, 1, sold], [pr.x, pr.y, revenue]);
    expect(s).toEqual({ x: 180, y: 120 });
    expect(s.x <= cakesMade && s.y <= bottlesMade).toBe(true);
    expect(expectedOf('masala-2', 1)).toEqual([revenue - pr.y * sold, s.x, s.y]);
    expect(correctOf('masala-2', 1, 2)).toBe(`${cakesMade - s.x} قطعة حلوى و ${bottlesMade - s.y} قارورة عصير`);
    // 3) coût de TOUT ce qui a été préparé, bénéfice, objectif 2000 دج
    const cost = cakesMade * 30 + bottlesMade * 20;
    const profit = revenue - cost;
    expect(expectedOf('masala-2', 2)).toEqual([cost, profit]);
    expect([cost, profit, 2000 - profit]).toEqual([10700, 1900, 100]);
    expect(profit).toBeLessThan(2000);
    expect(revenue - (s.x * 30 + s.y * 20)).toBe(4800); // le distracteur « ما بيع فقط »
  });

  it('مسألة 3 — les dattes : le mélange, la commande que le stock refuse, le bénéfice', () => {
    const deglet = 900, ghars = 400, mass = 50, price = 600;
    const e1 = [1, 1, mass], e2 = [deglet, ghars, price * mass];
    const s = integerSolution(e1, e2);
    expect(s).toEqual({ x: 20, y: 30 });
    expect(satisfies(e1, e2, s.x, s.y)).toBe(true);
    expect(expectedOf('masala-3', 0)).toEqual([price * mass, price * mass - ghars * mass, s.x, s.y]);
    expect(deglet - ghars).toBe(500);
    // le distracteur « = 600 » : une masse négative → pas de mélange
    const bad = solveSystem(e1, [deglet, ghars, price]);
    expect(bad.x[0] / bad.x[1]).toBeLessThan(0);
    // 2) commande à 800 دج, stock de 30 kg de دقلة نور
    const stock = 30;
    const c = integerSolution(e1, [deglet, ghars, 800 * mass]);
    expect(c).toEqual({ x: 40, y: 10 });
    expect(c.x).toBeGreaterThan(stock);
    expect(expectedOf('masala-3', 1)).toEqual([800 * mass - ghars * mass, c.x, c.y]);
    expect((deglet * 30 + ghars * 20) / mass).toBe(700); // le distracteur 30 kg / 20 kg
    // 3) achat 700 et 250 دج/kg
    const cost = s.x * 700 + s.y * 250;
    const separate = deglet * s.x + ghars * s.y;
    expect(expectedOf('masala-3', 2)).toEqual([cost, price * mass - cost, separate]);
    expect([cost, price * mass - cost, separate]).toEqual([21500, 8500, 30000]);
    expect(separate).toBe(price * mass); // c'est l'équation 2 elle-même
  });
});
