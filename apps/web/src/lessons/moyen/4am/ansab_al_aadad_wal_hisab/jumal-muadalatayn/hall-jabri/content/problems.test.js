import { describe, it, expect } from 'vitest';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : chaque jumla est résolue en fractions (linearSystem.classify). ──
const solveTex = (tex, vars = ['x', 'y']) => {
  const m = tex.match(/\\begin\{cases\}(.*)\\\\(.*)\\end\{cases\}/);
  if (!m) throw new Error(`not a jumla: ${tex}`);
  return LS.classify(LS.system(m[1].trim(), m[2].trim(), vars));
};
const pairOf = (tex, vars) => { const r = solveTex(tex, vars); return r.kind === 'unique' ? [Lin.toNumber(r.x), Lin.toNumber(r.y)] : r.kind; };

const partOf = (id, part) => PROBLEM[id].parts[part];
const expectedOf = (id, part) => partOf(id, part).steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => partOf(id, part).steps.filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const wrongOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options.filter((_, i) => i !== s.correct); };

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq ; chaque membre est évalué — nombres,
// ×, +, −, parenthèses, \dfrac{a}{b}, produit implicite (3x, 400(9 − a)) — avec les VALEURS
// des inconnues de la partie (`env`) ; une relation entre deux membres évaluables VOISINS est
// vérifiée. Un membre qui contient \ldots, « ; », une lettre hors `env` ou un \begin est ignoré.
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

/** Les inconnues de chaque partie, CALCULÉES (jamais tapées) — null : partie où l'on écrit exprès une valeur fausse. */
const sol1 = pairOf('\\begin{cases} 3x + y = 115 \\\\ 4x - 3y = 45 \\end{cases}');
const sol2 = pairOf('\\begin{cases} 4x + 3y = 310 \\\\ 5x + 2y = 300 \\end{cases}');
const sol3 = pairOf('\\begin{cases} 12x + 8y = 10400 \\\\ 5x + 10y = 7000 \\end{cases}');
const sol3b = pairOf(`\\begin{cases} a + b = 9 \\\\ ${sol3[0]}a + ${sol3[1]}b = 4600 \\end{cases}`, ['a', 'b']);
const ENV = {
  'masala-1': [{ x: sol1[0], y: sol1[1] }, { x: sol1[0], y: sol1[1] }, {}],
  'masala-2': [{ x: sol2[0], y: sol2[1] }, {}, {}], // 2) : le سطر du serveur est FAUX exprès (x = −1520/7)
  'masala-3': [{ x: sol3[0], y: sol3[1] }, { a: sol3b[0], b: sol3b[1] }, {}],
};

describe('les مسائل du درس 2 (unité 5) « حل جملة معادلتين جبريًا »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(78);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(4);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 4], ['masala-2', 5], ['masala-3', 6]]);
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

  it('no bare letter, a/b or « DA » in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyab]\b|\bDA\b/);
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
    expect(checked).toBeGreaterThan(80);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$85 \\times 40 + 60 \\times 50 = 3400 + 3000 = 6500$', 'mutant')).toThrow();
    expect(() => checkText('$x = \\dfrac{390}{13} = 31$', 'mutant', { x: 30 })).toThrow();
    expect(() => checkText('$4x - 3(115 - 3x) = 46$', 'mutant', { x: 30 })).toThrow();
    expect(() => checkText('$600a + 400(9 - a) = 4600$', 'mutant', { a: 4 })).toThrow();
    expect(checkText('$600a + 400(9 - a) = 4600$ و $x = \\dfrac{-280}{-7} = 40$', 'ok', { a: 5, x: 40 })).toBe(3);
  });

  it('مسألة 1 — the kiosk cards: jumla, substitution, check, Yacine and Anis are computed, not typed', () => {
    const tex = correctOf('masala-1', 0, 0);
    expect(pairOf(tex)).toEqual([30, 25]);
    const [x, y] = sol1;
    // les distracteurs de traduction ne donnent PAS les mêmes prix
    for (const w of wrongOf('masala-1', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    // 1) y = 115 − 3x ; 4x − 3(115 − 3x) = 45 ⇔ 13x = 390 (exact, par isolate / substitute)
    const [e1, e2] = LS.system('3x+y=115', '4x-3y=45');
    const iso = LS.isolate(e1, 'y');
    expect([Lin.toNumber(iso.k), Lin.toNumber(iso.m)]).toEqual([-3, 115]);
    const one = LS.substitute(e2, 'y', iso);
    expect([Lin.toNumber(one.a), Lin.toNumber(one.c)]).toEqual([13, 390]);
    expect(expectedOf('masala-1', 0)).toEqual([Lin.toNumber(one.c), x, y]);
    expect(LS.isSolution([e1, e2], x, y)).toBe(true);
    // 2) (35 ; 10) vérifie (1) seulement ; (20 ; 55) aussi : une seule carte ne suffit pas
    expect(expectedOf('masala-1', 1)).toEqual([3 * 35 + 10, 4 * 35 - 3 * 10]);
    expect(LS.pairHolds([e1, e2], 35, 10)).toEqual([true, false]);
    expect(LS.holdsAt(e1, 20, 55)).toBe(true);
    // 3) 250 − 2 × 25 = 200 = 30 × 6 + 20
    const left = 250 - 2 * y;
    const [q, r] = [Math.floor(left / x), left % x];
    expect(expectedOf('masala-1', 2)).toEqual([2 * y, left, q, r]);
    expect([q, r]).toEqual([6, 20]);
  });

  it('مسألة 2 — the café: multipliers, the sign error and the revenue are computed, not typed', () => {
    const tex = correctOf('masala-2', 0, 0);
    expect(pairOf(tex)).toEqual([40, 50]);
    const [x, y] = sol2;
    for (const w of wrongOf('masala-2', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    const [e1, e2] = LS.system('4x+3y=310', '5x+2y=300');
    // 1) × 2 et × (−3) : y disparaît, −7x = −280 ; × 3 : 6y et 6y, rien ne disparaît
    expect(LS.eliminationFactors(e1, e2, 'y')).toEqual([2, -3]);
    expect(correctOf('masala-2', 0, 1)).toBe('$-3$');
    const sum = LS.addEqs(LS.scale(e1, 2), LS.scale(e2, -3));
    expect(LS.eliminated(sum)).toBe('y');
    expect([Lin.toNumber(sum.a), Lin.toNumber(sum.c)]).toEqual([-7, -280]);
    expect(LS.eliminated(LS.addEqs(LS.scale(e1, 2), LS.scale(e2, 3)))).toBe(null);
    expect(correctOf('masala-2', 0, 2)).toBe(`$${Lin.toNumber(sum.a)}x = ${Lin.toNumber(sum.c)}$`);
    expect(expectedOf('masala-2', 0)).toEqual([x, y]);
    // 2) le serveur : (×2) − (×3) est juste, mais 620 + 900 au lieu de 620 − 900
    const diff = LS.subEqs(LS.scale(e1, 2), LS.scale(e2, 3));
    expect([Lin.toNumber(diff.a), Lin.toNumber(diff.b), Lin.toNumber(diff.c)]).toEqual([-7, 0, -280]);
    const wrongC = 2 * 310 + 3 * 300;
    expect(expectedOf('masala-2', 1)).toEqual([wrongC]);
    const waiter = Lin.div(Lin.frac(wrongC), Lin.frac(-7));
    expect(Lin.fracLatex(waiter)).toBe('-\\dfrac{1520}{7}');
    expect(Lin.toNumber(waiter)).toBeLessThan(0);
    // 3) 85 × 40 + 60 × 50 = 6400 ; 7000 − 6400 = 600 = 50 × 12
    const revenue = 85 * x + 60 * y;
    expect(expectedOf('masala-2', 2)).toEqual([revenue, 7000 - revenue, (7000 - revenue) / y]);
    expect((7000 - revenue) % y).toBe(0);
  });

  it('مسألة 3 — the bus station: simplification, subtraction, ticket counts and the return trip are computed, not typed', () => {
    const tex = correctOf('masala-3', 0, 0);
    const [x, y] = sol3;
    expect([x, y]).toEqual([600, 400]);
    expect(pairOf(tex)).toEqual([x, y]);
    for (const w of wrongOf('masala-3', 0, 0)) expect(pairOf(w)).not.toEqual([x, y]);
    // 1) ÷ 4 et ÷ 5 : même solution ; les distracteurs (un seul membre divisé…) ont une autre solution
    const simple = correctOf('masala-3', 0, 1);
    expect(pairOf(simple)).toEqual([x, y]);
    for (const w of wrongOf('masala-3', 0, 1)) expect(pairOf(w)).not.toEqual([x, y]);
    const [s1, s2] = LS.system('3x+2y=2600', 'x+2y=1400');
    const [o1, o2] = LS.system('12x+8y=10400', '5x+10y=7000');
    expect(LS.scale(o1, Lin.frac(1, 4))).toEqual(s1);
    expect(LS.scale(o2, Lin.frac(1, 5))).toEqual(s2);
    const d = LS.subEqs(s1, s2);
    expect(LS.eliminated(d)).toBe('y');
    expect(correctOf('masala-3', 0, 2)).toBe(`$${Lin.toNumber(d.a)}x = ${Lin.toNumber(d.c)}$`);
    expect(expectedOf('masala-3', 0)).toEqual([x, y]);
    // 2) a + b = 9 ; 600a + 400b = 4600 → (5 ; 4), entiers naturels
    expect(sol3b).toEqual([5, 4]);
    expect(pairOf(correctOf('masala-3', 1, 0), ['a', 'b'])).toEqual(sol3b);
    for (const w of wrongOf('masala-3', 1, 0)) expect(pairOf(w, ['a', 'b'])).not.toEqual(sol3b);
    expect(expectedOf('masala-3', 1)).toEqual(sol3b);
    // 3) retour : 15 normaux, 5 réduits
    const [n, r] = [12 + 3, 8 - 3];
    const back = n * x + r * y;
    expect(back).toBe(12 * x + 8 * y + 3 * (x - y));
    expect(expectedOf('masala-3', 2)).toEqual([n, r, back, 12 * x + 8 * y + back]);
    expect([back, 12 * x + 8 * y + back]).toEqual([11000, 21400]);
  });
});
