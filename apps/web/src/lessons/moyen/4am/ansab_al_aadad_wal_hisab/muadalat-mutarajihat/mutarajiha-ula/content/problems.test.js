import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : des rationnels { n, d } (entiers, d > 0). ──
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const Q = (n, d = 1) => { if (d === 0) throw new Error('division by 0'); const s = d < 0 ? -1 : 1; const g = gcd(n, d) || 1; return { n: (s * n) / g, d: (s * d) / g }; };
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const dvd = (a, b) => Q(a.n * b.d, a.d * b.n);
const cmp = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
const val = (q) => q.n / q.d;

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };

/**
 * Résout a·x + b REL c (a ≠ 0) avec les trois règles du درس : on retranche b (le sens
 * reste), on divise par a (le sens CHANGE si a < 0). Rend { rel, bound } exacts.
 */
const FLIP = { '<': '>', '>': '<', '\\leq': '\\geq', '\\geq': '\\leq' };
const solve = (a, b, rel, c) => ({ rel: a.n < 0 ? FLIP[rel] : rel, bound: dvd(sub(c, b), a) });
const holds = (l, rel, r) => ({ '<': cmp(l, r) < 0, '>': cmp(l, r) > 0, '\\leq': cmp(l, r) <= 0, '\\geq': cmp(l, r) >= 0 })[rel];
const tex = (q) => (q.d === 1 ? String(q.n) : `${q.n < 0 ? '-' : ''}\\frac{${Math.abs(q.n)}}{${q.d}}`);
/** La lecture du dessin, mot pour mot comme la leçon (components/GraphChoice › describe). */
const drawing = ({ rel, bound }) => {
  const at = bound.d === 1 ? String(bound.n) : `$${tex(bound)}$`;
  const side = rel === '<' || rel === '\\leq' ? 'يسار' : 'يمين';
  const closed = rel === '\\leq' || rel === '\\geq';
  return `الجزء الملوّن بالأحمر على ${side} ${at}، والرمز ${closed ? 'موجّه نحوه' : 'غير موجّه نحوه'}`;
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, lines, question, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \leq \geq \neq ; chaque membre purement
// numérique (entiers, décimaux 2{,}5, ×, +, −, parenthèses, \frac{a}{b}) est évalué en
// rationnels EXACTS, et chaque relation entre deux membres numériques VOISINS est vérifiée.
// Les membres contenant x ou \ldots sont ignorés. Une formule suivie de « خاطئة »
// (« $195 \geq 200$ متباينة خاطئة ») doit être FAUSSE.
function evalExpr(src) {
  const s = src
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, '.')
    .replace(/\\times/g, '*')
    .replace(/\s+/g, '');
  if (s === '' || !/^[\d.+\-*/()]+$/.test(s)) return null;
  let i = 0;
  const num = () => {
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    const t = s.slice(j, i);
    if (!t) throw new Error(`bad number in ${src}`);
    const [ip, fp = ''] = t.split('.');
    return Q(Number(ip + fp), 10 ** fp.length);
  };
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i++] !== ')') throw new Error(`bad parens in ${src}`); return v; }
    if (s[i] === '-') { i++; return mul(Q(-1), atom()); }
    return num();
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : dvd(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const REL = { '=': (c) => c === 0, '<': (c) => c < 0, '>': (c) => c > 0, '\\leq': (c) => c <= 0, '\\geq': (c) => c >= 0, '\\neq': (c) => c !== 0 };
function checkText(text, where) {
  let checked = 0;
  for (const m of text.matchAll(/\$([^$]+)\$/g)) {
    const f = m[1];
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 16);
    const claimedFalse = /^\s*(متباينة\s+)?خاطئة/.test(after);
    const parts = f.split(/(\\leq|\\geq|\\neq|=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      expect(REL[op](cmp(x, y)), `${where}: ${f}${claimedFalse ? ' (annoncée خاطئة)' : ''}`).toBe(!claimedFalse);
      checked++;
    }
  }
  return checked;
}
const textsOf = (step) => [step.prompt, step.explain, ...(step.lines ?? []), ...(step.kind === 'choice' ? [step.options[step.correct]] : [])].filter(Boolean);

describe('les مسائل du درس 3 (unité 4) « المتراجحات من الدرجة الأولى بمجهول واحد »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (6, 7, 8 — track problem, practice_lab, before the test 9)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [6, '06', 'masala-1', 'practice_lab', 8], [7, '07', 'masala-2', 'practice_lab', 8], [8, '08', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '09', number: 9, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(84);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(6);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 6], ['masala-2', 7], ['masala-3', 8]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('« حلّ » and « مثّل » are demands too: declared in asks', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      const verbs = (part.question.match(/(^|\.\s|ثم\s)(حلّ|مثّل)\s/g) ?? []).length;
      const marks = (part.question.match(/؟/g) ?? []).length;
      expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(verbs + marks);
    }
  });

  it('data: 4+ useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare x, < > ≤ ≥, a/b or DA in the Arabic text — every formula is a $…$ island', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/[<>≤≥√]|\\|\d\s*\/\s*\d|\b[xX]\b|DA/);
      expect((t.match(/\$/g) ?? []).length % 2, `${p.id}: unbalanced $ in ${t}`).toBe(0);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options, questions) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => {
      checked += checkText(part.question, `${p.id} ${part.label} question`);
      part.steps.forEach((s, si) => { for (const t of textsOf(s)) checked += checkText(t, `${p.id} ${part.label} step ${si + 1}`); });
    });
    expect(checked).toBeGreaterThan(60);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$600 - 120 - 3 \\times 90 = 211$', 'mutant')).toThrow();
    expect(() => checkText('$\\frac{-1200}{-150} = -8$', 'mutant')).toThrow();
    expect(() => checkText('$94 \\leq \\frac{280}{3}$', 'mutant')).toThrow();
    expect(() => checkText('$210 \\geq 200$ متباينة خاطئة', 'mutant')).toThrow(); // vraie, annoncée fausse
    expect(checkText('$195 \\geq 200$ متباينة خاطئة و $93 < \\frac{280}{3} < 94$ و $2{,}5 \\times 16 + 100 = 140$', 'ok')).toBe(4);
  });

  it('مسألة 1 — Riyad’s credit: values tested, the sign flip, the drawing and the largest integer are computed', () => {
    const credit = Q(600), pack = Q(120), sms = Q(3), keep = Q(200);
    const left = (n) => sub(sub(credit, pack), mul(sms, Q(n)));
    // 1) 90 et 95 testés dans 600 − 120 − 3x ≥ 200
    expect(expectedOf('masala-1', 0)).toEqual([val(left(90)), val(left(95))]);
    expect(holds(left(90), '\\geq', keep)).toBe(true);
    expect(holds(left(95), '\\geq', keep)).toBe(false);
    expect(correctOf('masala-1', 0, 1)).toBe('$600 - 120 - 3x \\geq 200$');
    // 2) 480 − 3x ≥ 200 → −3x ≥ −280 → x ≤ 280/3 (le sens CHANGE : −3 < 0)
    const b = sub(credit, pack);
    const sol = solve(mul(Q(-1), sms), b, '\\geq', keep);
    expect(expectedOf('masala-1', 1)).toEqual([val(b), val(sub(keep, b))]);
    expect(sol).toEqual({ rel: '\\leq', bound: Q(280, 3) });
    expect(correctOf('masala-1', 1, 1)).toBe(`$x ${sol.rel} ${tex(sol.bound)}$`);
    expect(choicesOf('masala-1', 1)[1].options).toContain(`$x ${FLIP[sol.rel]} ${tex(sol.bound)}$`); // le distracteur « sens oublié »
    expect(correctOf('masala-1', 1, 2)).toBe(drawing(sol));
    expect(holds(left(0), '\\geq', keep) && cmp(sub(sub(credit, pack), mul(sms, sol.bound)), keep) === 0).toBe(true); // la borne est solution
    // 3) le plus grand entier naturel solution, et le رصيد qui reste
    let max = 0; while (holds(left(max + 1), '\\geq', keep)) max++;
    expect(max).toBe(Math.floor(val(sol.bound)));
    expect(expectedOf('masala-1', 2)).toEqual([Math.floor(280 / 3), max, val(left(max))]);
    expect([280 % 3, max, val(left(max)), val(left(max + 1))]).toEqual([1, 93, 201, 198]);
  });

  it('مسألة 2 — the fitness club: 6 sessions, the threshold 8 (sign flip), 12 sessions — computed', () => {
    const perA = Q(250), card = Q(1200), perB = Q(100);
    const costA = (n) => mul(perA, Q(n));
    const costB = (n) => add(card, mul(perB, Q(n)));
    // 1) 6 حصص
    expect(expectedOf('masala-2', 0)).toEqual([val(costA(6)), val(costB(6))]);
    expect(cmp(costA(6), costB(6))).toBe(-1); // (أ) moins chère
    expect(correctOf('masala-2', 0, 1)).toBe(`الصيغة (أ): $${val(costA(6))} < ${val(costB(6))}$`);
    // 2) 1200 + 100x < 250x → −150x < −1200 → x > 8 ; 8 lui-même : égalité
    const a = sub(perB, perA);
    expect(expectedOf('masala-2', 1)).toEqual([val(a), 9]);
    const sol = solve(a, card, '<', Q(0));
    expect(sol).toEqual({ rel: '>', bound: Q(8) });
    expect(correctOf('masala-2', 1, 1)).toBe(`$x ${sol.rel} ${tex(sol.bound)}$`);
    expect(choicesOf('masala-2', 1)[1].options).toContain(`$x < ${tex(sol.bound)}$`); // sens oublié
    expect(cmp(costA(8), costB(8))).toBe(0);
    expect(val(costA(8))).toBe(2000);
    let first = 0; while (!(cmp(costB(first), costA(first)) < 0)) first++;
    expect(first).toBe(9);
    // 3) 12 حصة
    expect(holds(Q(12), sol.rel, sol.bound)).toBe(true);
    expect(expectedOf('masala-2', 2)).toEqual([val(costA(12)), val(costB(12)), val(sub(costA(12), costB(12)))]);
    expect([val(costA(12)), val(costB(12))]).toEqual([3000, 2400]);
  });

  it('مسألة 3 — car rental: 140 km, the bound 125 (no flip), 90 km and the two days — computed', () => {
    const flat = Q(4000), base = Q(2500), perKm = Q(12);
    const second = (km) => add(base, mul(perKm, Q(km)));
    // 1) 140 km : 4180 > 4000, 140 n'est pas solution
    expect(expectedOf('masala-3', 0)).toEqual([val(second(140))]);
    expect(holds(second(140), '\\leq', flat)).toBe(false);
    // 2) 2500 + 12x ≤ 4000 → 12x ≤ 1500 → x ≤ 125 (12 > 0 : le sens reste)
    const sol = solve(perKm, base, '\\leq', flat);
    expect(sol).toEqual({ rel: '\\leq', bound: Q(125) });
    expect(expectedOf('masala-3', 1)).toEqual([val(sub(flat, base)), val(sol.bound)]);
    expect(correctOf('masala-3', 1, 1)).toBe(`$x ${sol.rel} ${tex(sol.bound)}$`);
    expect(correctOf('masala-3', 1, 2)).toBe(drawing(sol));
    expect(cmp(second(125), flat)).toBe(0); // la borne est solution : le رمز موجّه نحوه
    // 3) 90 km : la seconde formule ; total des deux jours
    expect(holds(Q(90), sol.rel, sol.bound)).toBe(true);
    const saturday = second(90), friday = flat; // vendredi : 140 km → la première formule
    expect(cmp(saturday, flat)).toBe(-1);
    expect(expectedOf('masala-3', 2)).toEqual([val(saturday), val(add(friday, saturday))]);
    expect([val(saturday), val(add(friday, saturday))]).toEqual([3580, 7580]);
  });
});
