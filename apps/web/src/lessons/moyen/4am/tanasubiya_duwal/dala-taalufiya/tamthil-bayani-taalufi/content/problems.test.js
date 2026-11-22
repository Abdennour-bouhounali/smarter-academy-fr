import { describe, it, expect } from 'vitest';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE des droites : a = p/q en fractions d'entiers, jamais en flottants. ──
const gcd = (x, y) => (y === 0 ? Math.abs(x) : gcd(y, x % y));
const frac = (p, q) => { const s = q < 0 ? -1 : 1; const g = gcd(p, q) || 1; return [(s * p) / g, (s * q) / g]; };
/** f(x) = (p/q)·x + b, renvoyé en fraction [num, den] (x rationnel n/d). */
const affine = ([p, q], b) => (n, d = 1) => frac(p * n + b * q * d, q * d);
const asNum = ([n, d]) => n / d;
/** La pente lue sur deux nœuds de la grille (le geste de qiraa-ab : avancer, mesurer, diviser). */
const slope = ([x1, y1], [x2, y2]) => frac(y2 - y1, x2 - x1);

const expectedOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => PROBLEM[id].parts[part].steps.filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };
/** « $\dfrac{2}{3}$ » / « $-400$ » → [num, den]. */
const parseFrac = (t) => {
  const m = /^\$(-?)\\dfrac\{(\d+)\}\{(\d+)\}\$$/.exec(t);
  if (m) return frac((m[1] ? -1 : 1) * Number(m[2]), Number(m[3]));
  const n = /^\$(-?\d+)\$$/.exec(t);
  return n ? [Number(n[1]), 1] : null;
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, options, lines) ──
// Chaque formule $…$ est découpée sur = \neq < > ; chaque membre purement numérique (entiers, décimaux
// 1{,}5, \dfrac{a}{b}, ×, +, −, parenthèses ; unités \,\mathrm{…} retirées) est évalué, et chaque relation
// entre deux membres numériques VOISINS est vérifiée. Les membres qui contiennent une lettre sont ignorés.
function evalExpr(src) {
  const s = src
    .replace(/\\,\\mathrm\{[^}]*\}/g, '')
    .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    .replace(/\{,\}/g, '.')
    .replace(/\\times/g, '*')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || s === '') return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '-') { i++; return -atom(); }
    if (s[i] === '(') { i++; const v = sum(); if (s[i++] !== ')') throw new Error(`bad parens in ${src}`); return v; }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return Number(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? v * w : v / w; } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? v + w : v - w; } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const close = (x, y) => Math.abs(x - y) < 1e-9;
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': close(x, y), '<': x < y, '>': x > y, '\\neq': !close(x, y) }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** Les lectures écrites « $f(9) = 10$ » / « $A(1{,}5) = 1600$ » : recalculées par la fonction de la مسألة. */
function checkReadings(text, name, fn, where) {
  let checked = 0;
  for (const [, x, y] of String(text).matchAll(new RegExp(`\\$${name}\\((-?[\\d{},]+)\\) = (-?[\\d{},]+)\\$`, 'g'))) {
    const num = (t) => Number(t.replace('{,}', '.'));
    expect(close(fn(num(x)), num(y)), `${where}: ${name}(${x}) = ${y}`).toBe(true);
    checked++;
  }
  return checked;
}
/** Les points « $(x ; y)$ » écrits dans le texte sont sur la droite. */
function checkPoints(text, fn, where) {
  let checked = 0;
  for (const [, x, y] of String(text).matchAll(/\$\((-?\d+) ; (-?\d+)\)\$/g)) {
    expect(close(fn(Number(x)), Number(y)), `${where}: (${x} ; ${y})`).toBe(true);
    checked++;
  }
  return checked;
}
const textsOf = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);

// ── Les trois droites, et leurs nombres lus sur la grille ──
const RAMP = { a: [2, 3], b: 4, domain: [0, 9] };      // مسألة 1 : f(x) = 2/3 x + 4 (dm, m)
const CANDLE = { a: [-3, 2], b: 15, domain: [0, 10] }; // مسألة 2 : g(t) = −3/2 t + 15 (cm, h)
const HIKE = { a: [-400, 1], b: 2200, domain: [0, 3] }; // مسألة 3 : A(t) = −400 t + 2200 (m, h)
const f = affine(RAMP.a, RAMP.b);
const g = affine(CANDLE.a, CANDLE.b);
const A = affine(HIKE.a, HIKE.b);
const fx = (x) => asNum(f(Math.round(x * 2), 2));
const gx = (t) => asNum(g(Math.round(t * 2), 2));
const Ax = (t) => asNum(A(Math.round(t * 2), 2));
/** L'antécédent exact (b ≠ 0) : (y − b)/a. */
const antecedent = ({ a: [p, q], b }, y) => frac((y - b) * q, p);

describe('les مسائل du درس 2 (unité 7) « التمثيل البياني لدالة تآلفية وقراءته »', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (5, 6, 7 — track problem, practice_lab, before the test 8)', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage, m.estimatedMin])).toEqual([
      [5, '05', 'masala-1', 'practice_lab', 8], [6, '06', 'masala-2', 'practice_lab', 8], [7, '07', 'masala-3', 'practice_lab', 8],
    ]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ id: '08', number: 8, slug: 'itqan', stage: 'evaluation' });
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(74);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      expect(part.asks.length).toBeGreaterThanOrEqual(demandsOf(part.question));
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('every statement that cites « التمثيل البياني » shows it, and the drawn line is the one of the problem', () => {
    const lines = { 'masala-1': RAMP, 'masala-2': CANDLE, 'masala-3': HIKE };
    for (const p of PROBLEMS) {
      expect(p.statement).toContain('التمثيل البياني');
      const [fn] = p.visual.functions;
      const { a: [num, den], b, domain } = lines[p.id];
      expect(fn.a).toBeCloseTo(num / den, 12);
      expect(fn.b).toBe(b);
      expect([p.visual.range.xMin, p.visual.range.xMax]).toEqual(domain);
    }
  });

  it('every reading falls on a node of the grid (exact readings)', () => {
    const onGrid = (p, x, y) => close(x / p.visual.xStep, Math.round(x / p.visual.xStep)) && close(y / p.visual.yStep, Math.round(y / p.visual.yStep));
    const reads = {
      'masala-1': [[0, 4], [3, 6], [9, 10], [6, 8]].map(([x, y]) => [x, y, fx(x)]),
      'masala-2': [[4, 9], [8, 3], [0, 15], [2, 12], [10, 0]].map(([x, y]) => [x, y, gx(x)]),
      'masala-3': [[0, 2200], [1, 1800], [1.5, 1600], [2.5, 1200], [3, 1000]].map(([x, y]) => [x, y, Ax(x)]),
    };
    for (const p of PROBLEMS) for (const [x, y, image] of reads[p.id]) {
      expect(image, `${p.id} (${x} ; ${y})`).toBe(y);
      expect(onGrid(p, x, y), `${p.id} (${x} ; ${y}) on a node`).toBe(true);
    }
  });

  it('مسألة 1 — the numbers are computed, not typed', () => {
    const rise = 6 - 4; // de (0 ; 4) à (3 ; 6)
    expect(slope([0, 4], [3, 6])).toEqual(RAMP.a);
    expect(expectedOf('masala-1', 0)).toEqual([asNum(f(0)), rise]);
    expect(parseFrac(correctOf('masala-1', 0, 1))).toEqual(RAMP.a);
    expect(correctOf('masala-1', 0, 2)).toBe('$f(x) = \\dfrac{2}{3}x + 4$');
    const end = asNum(f(9));
    expect(expectedOf('masala-1', 1)).toEqual([end, asNum(antecedent(RAMP, 8))]);
    const extra = 14 - end;                          // le ارتفاع à gagner
    const added = asNum(antecedent(RAMP, 14)) - 9;   // la longueur à ajouter
    expect(added).toBe((extra / RAMP.a[0]) * RAMP.a[1]);
    expect(expectedOf('masala-1', 2)).toEqual([extra, added, added * 4500]);
  });

  it('مسألة 2 — the numbers are computed, not typed', () => {
    expect(expectedOf('masala-2', 0)).toEqual([asNum(g(4)), asNum(antecedent(CANDLE, 3))]);
    expect(slope([0, 15], [2, 12])).toEqual(CANDLE.a);
    expect(expectedOf('masala-2', 1)).toEqual([asNum(g(0)), 15 - 12]);
    expect(parseFrac(correctOf('masala-2', 1, 0))).toEqual(CANDLE.a);
    expect(correctOf('masala-2', 1, 1)).toBe('$g(t) = -\\dfrac{3}{2}t + 15$');
    const burn = asNum(antecedent(CANDLE, 0));
    const out = (19 + burn) % 24;                    // ساعة انطفاء الأولى
    expect(correctOf('masala-2', 2, 1)).toBe(`${String(out).padStart(2, '0')}:00 صباحًا`);
    const second = 7 - out;                          // مدّة احتراق الثانية على الساعة 07:00
    expect(second).toBeLessThan(burn);               // elle brûle encore
    expect(expectedOf('masala-2', 2)).toEqual([burn, second, asNum(g(second))]);
  });

  it('مسألة 3 — the numbers are computed, not typed', () => {
    expect(slope([0, 2200], [1, 1800])).toEqual(HIKE.a);
    expect(expectedOf('masala-3', 0)).toEqual([asNum(A(0)), 2200 - 1800]);
    expect(parseFrac(correctOf('masala-3', 0, 1))).toEqual(HIKE.a);
    expect(correctOf('masala-3', 1, 0)).toBe('$A(t) = -400t + 2200$');
    const t = 12.5 - 10;                             // 12:30 − 10:00
    expect(expectedOf('masala-3', 1)).toEqual([asNum(antecedent(HIKE, 1600)), t, Ax(t)]);
    const descent = asNum(antecedent(HIKE, 1000));
    const arrival = 10 + descent;                    // 13:00
    expect(correctOf('masala-3', 2, 1)).toBe(`${arrival}:00`);
    const bus = 13.5;
    expect(arrival).toBeLessThan(bus);
    expect(correctOf('masala-3', 2, 2)).toBe('نعم، يصل قبل موعدها');
    expect(expectedOf('masala-3', 2)).toEqual([descent, (bus - arrival) * 60]);
  });

  it('every equality, reading and point written in the problems is true', () => {
    const fns = { 'masala-1': ['f', fx], 'masala-2': ['g', gx], 'masala-3': ['A', Ax] };
    let equalities = 0; let readings = 0; let points = 0;
    for (const p of PROBLEMS) {
      const [name, fn] = fns[p.id];
      for (const t of textsOf(p)) {
        equalities += checkText(t, p.id);
        readings += checkReadings(t, name, fn, p.id);
        points += checkPoints(t, fn, p.id);
      }
    }
    expect(equalities).toBeGreaterThan(20);
    expect(readings).toBeGreaterThan(15);
    expect(points).toBeGreaterThan(15);
  });

  it('the decoys are useless numbers', () => {
    for (const p of PROBLEMS) {
      const useless = p.data.filter((d) => !d.useful);
      expect(useless.some((d) => /\d/.test(d.text)), p.id).toBe(true);
      expect(p.data.filter((d) => d.useful).length).toBeGreaterThanOrEqual(4);
    }
  });
});
