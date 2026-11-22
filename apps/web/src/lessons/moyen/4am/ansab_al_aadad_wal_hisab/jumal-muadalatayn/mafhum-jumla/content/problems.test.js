import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Une جملة = deux équations ax + by = c, données par leurs coefficients. ──
/** Les deux équations sont-elles vérifiées par (x ; y) ? Renvoie [ok1, ok2]. */
const check = (sys, [x, y]) => sys.map(([a, b, c]) => a * x + b * y === c);
const isSolution = (sys, pair) => check(sys, pair).every(Boolean);
/** Cas particulier : proportionnalité des coefficients (a b c) et (a' b' c'). */
const kind = ([[a, b, c], [d, e, f]]) => {
  if (a * e - b * d !== 0) return 'unique';
  return a * f - c * d === 0 && b * f - c * e === 0 ? 'infinite' : 'none';
};

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
const parsePair = (t) => { const m = /\((-?\d+) ; (-?\d+)\)/.exec(t); return m && [Number(m[1]), Number(m[2])]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, lines, bonne option) ──
// Chaque formule $…$ est découpée sur = \neq < > ; chaque membre purement numérique
// (entiers, ×, \div, +, −, parenthèses, produit implicite 2(8 + 4)) est évalué, et chaque
// relation entre deux membres numériques VOISINS est vérifiée. Les membres qui contiennent une
// lettre (x, y, m, n, a') ou \ldots sont ignorés.
function evalExpr(src) {
  const s = src.replace(/\\times/g, '*').replace(/\\div/g, '/').replace(/\\left|\\right/g, '').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    let v;
    if (s[i] === '(') { i++; v = sum(); if (s[i++] !== ')') throw new Error(`bad parens in ${src}`); } else {
      const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
      if (i === j) throw new Error(`bad number in ${src}`);
      v = Number(s.slice(j, i));
    }
    if (s[i] === '(') v *= atom(); // 2(8 + 4)
    return v;
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    if (f.includes('\\begin')) continue; // les جمل sont vérifiées par substitution plus bas
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': x === y, '<': x < y, '>': x > y, '\\neq': x !== y }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 1 (unité 5) « مفهوم جملة معادلتين »', () => {
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
    // rollout 2026-11-12 : « أستعدّ » dix affirmations (6 min), module 1 trois manches (17 min, G2), module 2 + deux manches (16 min, OQ1)
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(80);
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

  it('no bare letter, pair or formula in the Arabic prose — every formula is a $…$ island; « دج », never « DA »', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\b[xymnabc]\b|\(\s*\d+\s*;|[=×÷<>]|\d\s*\/\s*\d|DA/);
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
    expect(() => checkText('$30 - 3 \\times 12 = -8$', 'mutant')).toThrow();
    expect(() => checkText('$2 \\times (8 + 4) = 26$', 'mutant')).toThrow();
    expect(() => checkText('$42000 \\div 150 = 290$', 'mutant')).toThrow();
    expect(() => checkText('$160 \\neq 160$', 'mutant')).toThrow();
    expect(checkText('$2(8 + 6) = 2 \\times 14 = 28$ و $x - 3y = -6$', 'ok')).toBe(2);
  });

  it('مسألة 1 — the system, the three answers and the hiring are computed, not typed', () => {
    const total = 42, outMen = 6, outWomen = 4, hired = 10;
    // x + y = 42 ; x − 6 = 3(y − 4) ⇔ x − 3y = 6 − 12
    const sys = [[1, 1, total], [1, -3, outMen - 3 * outWomen]];
    expect(sys[1][2]).toBe(-6);
    expect(correctOf('masala-1', 0, 2)).toBe('$x - 3y = -6$');
    expect(correctOf('masala-1', 0, 1)).toContain(`x + y = ${total}`);
    // 2) les trois ثنائيات vérifient (1) ; une seule vérifie (2)
    const candidates = [[32, 10], [30, 12], [12, 30]];
    for (const c of candidates) expect(check(sys, c)[0]).toBe(true);
    expect(candidates.map((c) => isSolution(sys, c))).toEqual([false, true, false]);
    expect(PROBLEM['masala-1'].parts[1].question).toContain('$(32 ; 10)$ و $(30 ; 12)$ و $(12 ; 30)$');
    const [men, women] = candidates.find((c) => isSolution(sys, c));
    expect(expectedOf('masala-1', 1)).toEqual([...candidates.map(([x, y]) => x - 3 * y), men, women]);
    expect(parsePair(correctOf('masala-1', 1, 1))).toEqual([men, women]);
    expect(men - outMen).toBe(3 * (women - outWomen)); // le texte : trois fois après le تقاعد
    // 3) m + n = 10 ; 24 + m = 2(8 + n) ⇔ m − 2n = 2·8 − 24
    const leftMen = men - outMen, leftWomen = women - outWomen;
    expect([leftMen, leftWomen]).toEqual([24, 8]);
    const hire = [[1, 1, hired], [1, -2, 2 * leftWomen - leftMen]];
    const boss = [6, 4], deputy = [4, 6];
    expect(check(hire, boss)).toEqual([true, false]);
    expect(isSolution(hire, deputy)).toBe(true);
    expect(expectedOf('masala-1', 2)).toEqual([
      leftMen + boss[0], 2 * (leftWomen + boss[1]), leftMen + deputy[0], 2 * (leftWomen + deputy[1]),
      leftMen + deputy[0], leftWomen + deputy[1],
    ]);
    expect(leftMen + deputy[0]).toBe(2 * (leftWomen + deputy[1]));
    expect(correctOf('masala-1', 2, 1)).toMatch(/^اقتراح النائب: 4 رجال و 6 نساء/);
  });

  it('مسألة 2 — Sunday’s two notes and Monday’s impossible declaration are computed, not typed', () => {
    const sold = 180, adult = 300, child = 150, income = 42000;
    const sys = [[1, 1, sold], [adult, child, income]];
    expect(income % child).toBe(0);
    const simplified = [[1, 1, sold], [adult / child, 1, income / child]];
    expect(simplified[1]).toEqual([2, 1, 280]);
    const cashier = [120, 60], colleague = [100, 80];
    expect(check(sys, cashier)).toEqual([true, false]);
    expect(isSolution(sys, colleague)).toBe(true);
    expect(isSolution(simplified, colleague)).toBe(true);
    expect(isSolution(sys, [60, 120])).toBe(false); // l'ordre inversé
    expect(parsePair(correctOf('masala-2', 1, 0))).toEqual(cashier);
    expect(expectedOf('masala-2', 1)).toEqual([2 * cashier[0] + cashier[1], 2 * colleague[0] + colleague[1], ...colleague]);
    expect(adult * cashier[0] + child * cashier[1]).toBe(45000);
    // 3) le samedi : un seul prix, 200 billets
    const sat = 200, price = 150, declared = 31500;
    const declaredSys = [[1, 1, sat], [price, price, declared]];
    expect(declared % price).toBe(0);
    expect(kind(declaredSys)).toBe('none');
    const right = sat * price;
    expect(expectedOf('masala-2', 2)).toEqual([declared / price, right]);
    expect(kind([[1, 1, sat], [price, price, right]])).toBe('infinite');
    for (const pair of [[120, 80], [50, 150]]) expect(isSolution([[1, 1, sat], [price, price, right]], pair)).toBe(true);
    expect(kind(sys)).toBe('unique');
  });

  it('مسألة 3 — the heads, the legs, the trials and the sale are computed, not typed', () => {
    const heads = 50, legs = 140, hen = 900, rabbit = 1500;
    const sys = [[1, 1, heads], [2, 4, legs]];
    const son = [20, 30];
    expect(check(sys, son)).toEqual([true, false]);
    expect(expectedOf('masala-3', 0)).toEqual([2 * son[0] + 4 * son[1]]);
    // 2) l'essai : 10 puis 15 lapins
    const legsWith = (r) => 2 * (heads - r) + 4 * r;
    expect(expectedOf('masala-3', 1).slice(0, 3)).toEqual([heads - 10, legsWith(10), legsWith(15)]);
    expect(legsWith(16) - legsWith(15)).toBe(2); // un lapin à la place d'une poule : +2 pattes
    const rabbits = 10 + (legs - legsWith(10)) / 2;
    const answer = [heads - rabbits, rabbits];
    expect(answer).toEqual([30, 20]);
    expect(isSolution(sys, answer)).toBe(true);
    expect(parsePair(correctOf('masala-3', 1, 1))).toEqual(answer);
    for (const wrong of [[20, 30], [35, 15], [25, 25]]) expect(isSolution(sys, wrong)).toBe(false);
    expect(expectedOf('masala-3', 1).slice(3)).toEqual(answer);
    expect(kind(sys)).toBe('unique');
    // 3) la vente, et l'erreur de l'ordre inversé
    const real = answer[0] * hen + answer[1] * rabbit, wrongSum = son[0] * hen + son[1] * rabbit;
    expect(expectedOf('masala-3', 2)).toEqual([answer[0] * hen, answer[1] * rabbit, real, wrongSum, wrongSum - real]);
    expect([real, wrongSum, wrongSum - real]).toEqual([57000, 63000, 6000]);
  });

  it('every pair written in a correct option or a solution line is checked against its system', () => {
    // les ثنائيات déclarées « حلّ » dans les rédactions sont des solutions de leur جملة
    const systems = { 'masala-1': [[[1, 1, 42], [1, -3, -6]], [[1, 1, 42], [1, -3, -6]], [[1, 1, 10], [1, -2, -8]]],
      'masala-2': [[[1, 1, 180], [2, 1, 280]], [[1, 1, 180], [2, 1, 280]], null],
      'masala-3': [[[1, 1, 50], [2, 4, 140]], [[1, 1, 50], [2, 4, 140]], null] };
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part, k) => {
      const sys = systems[p.id][k];
      if (!sys) return;
      for (const line of part.steps.at(-1).lines) {
        for (const m of line.matchAll(/\$\((-?\d+) ; (-?\d+)\)\$ (حلّ|ليست)/g)) {
          expect(isSolution(sys, [Number(m[1]), Number(m[2])]), `${p.id} ${part.label}: ${line}`).toBe(m[3] === 'حلّ');
          checked++;
        }
      }
    });
    expect(checked).toBe(4); // (30 ; 12), (4 ; 6), (20 ; 30) ليست, (30 ; 20) — les notes de la مكتبة sont vérifiées plus haut
  });
});
