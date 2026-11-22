import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : fractions de BigInt (aucun flottant : 0,75 × 1,2 = 0,9 exactement). ──
const gcd = (a, b) => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const F = (n, d = 1n) => {
  if (d === 0n) throw new Error('division by zero');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
};
/** Un décimal écrit « 2,5 » ou « 2.5 » → fraction exacte. */
const dec = (s) => {
  const [i, f = ''] = String(s).replace(',', '.').split('.');
  return F(BigInt(i + f), 10n ** BigInt(f.length));
};
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const quo = (a, b) => F(a.n * b.d, a.d * b.n);
const eq = (a, b) => a.n === b.n && a.d === b.d;
const lt = (a, b) => a.n * b.d < b.n * a.d;
const pct = (t) => quo(dec(t), F(100n)); // t % → t / 100
const up = (t) => add(F(1n), pct(t)); // زيادة بـ t % : × (1 + t/100)
const down = (t) => sub(F(1n), pct(t)); // تخفيض بـ t % : × (1 − t/100)
/** Le `expected` (nombre JS) d'une saisie, en fraction exacte. */
const ex = (x) => dec(String(x));

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const numericOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric');
const expectSameValues = (id, part, values) => {
  const got = numericOf(id, part).map((s) => ex(s.expected));
  expect(got.length, `${id} ${part}`).toBe(values.length);
  got.forEach((g, k) => expect(eq(g, values[k]), `${id} part ${part + 1} numeric ${k + 1}: ${numericOf(id, part)[k].expected}`).toBe(true));
};

// ── Vérificateur des RELATIONS écrites (explain, prompt, solution lines, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \neq \simeq ; chaque membre purement numérique
// (décimaux « 0{,}75 », milliers « 7\,380\,000 », ×, ÷, +, −, parenthèses, \left( \right),
// \dfrac{n}{m}) est évalué EXACTEMENT, et chaque relation entre deux membres numériques VOISINS
// est vérifiée (« ≃ » : à 0,01 près). Les membres avec une lettre ou une unité (x, V, m^3, %)
// sont ignorés.
function toFrac(src) {
  const s = src
    .replace(/\{,\}/g, '.')
    .replace(/\\,/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; const v = atom(); return F(-v.n, v.d); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
    if (i === j) throw new Error(`bad number in ${src}`);
    return dec(s.slice(j, i));
  };
  const prod = () => { let v = atom(); while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const w = atom(); v = op === '*' ? mul(v, w) : quo(v, w); } return v; };
  const sum = () => { let v = prod(); while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w); } return v; };
  const v = sum();
  return i === s.length ? v : null;
}
const CENT = F(1n, 100n);
function checkText(text, where) {
  let checked = 0;
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>|\\neq|\\simeq)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [toFrac(parts[k - 1]), parts[k], toFrac(parts[k + 1])];
      if (x == null || y == null) continue;
      const gap = lt(x, y) ? sub(y, x) : sub(x, y);
      const ok = { '=': eq(x, y), '<': lt(x, y), '>': lt(y, x), '\\neq': !eq(x, y), '\\simeq': lt(gap, CENT) }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

describe('les مسائل du درس 4 (unité 6) « تطبيقات التناسبية »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(83);
    expect(LESSON_CONFIG.lessonProblem.module).toBe(5);
    expect(PROBLEM['masala-1'].statement).toBe(LESSON_CONFIG.lessonProblem.statement);
    const situations = LESSON_CONFIG.resources.filter((r) => r.kind === 'situation');
    expect(situations.map((r) => [r.code, r.module])).toEqual([['masala-1', 5], ['masala-2', 6], ['masala-3', 7]]);
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
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyabpntVEP]\b|\bDA\b|√|نقاط التعلّم|نقطة التعلّم/);
    }
  });

  it('مسألة 1 (صهريج السقي) — the numbers are computed, not typed', () => {
    const cap = F(40n);
    const afterDraw = mul(cap, down(25)); // 30
    const evening = mul(afterDraw, up(20)); // 36
    const k = mul(down(25), up(20)); // 0,9
    const naive = mul(cap, down(25 - 20)); // le « 5 % » du fermier : 38
    expectSameValues('masala-1', 0, [afterDraw, evening]);
    expect(eq(evening, F(36n))).toBe(true);
    // le piège : 20 % de la capacité au lieu de « ممّا بقي »
    expect(eq(add(afterDraw, mul(cap, pct(20))), F(38n))).toBe(true);
    const lossPct = mul(sub(F(1n), k), F(100n)); // 10
    expectSameValues('masala-1', 1, [k, naive, lossPct]);
    expect(eq(mul(cap, k), evening)).toBe(true);
    expect(eq(naive, evening)).toBe(false);
    const missingL = mul(sub(cap, evening), F(1000n)); // 4000 L
    const hours = quo(missingL, F(800n)); // 5 h
    const energy = mul(dec('1,5'), hours); // 7,5 kWh
    expectSameValues('masala-1', 2, [missingL, hours, energy]);
  });

  it('مسألة 2 (ألبسة العيد) — the numbers are computed, not typed', () => {
    const suit = F(4500n), shoes = F(2500n);
    const raised = mul(suit, up(20)); // 5400
    const sale = mul(raised, down(20)); // 4320
    expectSameValues('masala-2', 0, [raised, sale]);
    const k = mul(up(20), down(20)); // 0,96
    expect(eq(k, F(1n))).toBe(false); // +20 % puis −20 % ne revient pas
    expectSameValues('masala-2', 1, [k, mul(sub(F(1n), k), F(100n))]);
    expect(eq(mul(suit, k), sale)).toBe(true);
    const before = add(mul(F(3n), suit), mul(F(2n), shoes)); // 18500
    const paid = mul(before, k); // 17760
    // linéarité : pièce par pièce = sur le total
    expect(eq(add(mul(F(3n), sale), mul(F(2n), mul(shoes, k))), paid)).toBe(true);
    expect(lt(paid, before)).toBe(true);
    expectSameValues('masala-2', 2, [before, paid, sub(before, paid)]);
  });

  it('مسألة 3 (سكان البلدية) — the numbers are computed, not typed', () => {
    const pop = F(48000n), area = F(160n), need = F(150n), station = F(7500n);
    const pop26 = mul(pop, up('2,5')); // 49200
    expectSameValues('masala-3', 0, [pop26]);
    const d25 = quo(pop, area), d26 = quo(pop26, area); // 300 ; 307,5
    expectSameValues('masala-3', 1, [d25, d26]);
    expect(eq(mul(d25, up('2,5')), d26)).toBe(true); // le président a raison : l'aire est fixe
    const litres = mul(need, pop26); // 7 380 000
    const m3 = quo(litres, F(1000n)); // 7380
    expect(lt(m3, station)).toBe(true);
    expectSameValues('masala-3', 2, [litres, m3, mul(quo(m3, station), F(100n))]);
  });

  it('every correct choice is the right translation; the trap options are the misconceptions', () => {
    const correctOf = (id, part, k) => { const s = stepsOf(id, part).filter((st) => st.kind === 'choice')[k]; return s.options[s.correct]; };
    expect(toFrac(correctOf('masala-1', 0, 0).replace(/\$/g, ''))).toEqual(down(25));
    expect(toFrac(correctOf('masala-1', 1, 0).replace(/\$/g, ''))).toEqual(mul(down(25), up(20)));
    expect(toFrac(correctOf('masala-2', 0, 0).replace(/\$/g, ''))).toEqual(up(20));
    expect(toFrac(correctOf('masala-3', 0, 0).replace(/\$/g, ''))).toEqual(up('2,5'));
    expect(correctOf('masala-2', 1, 0)).toBe('$y = 0{,}96x$');
    expect(correctOf('masala-3', 0, 1)).toBe('$y = 1{,}025x$');
    // le distracteur « طرح النسبتين » de masala-1 2) vaut bien le 0,95 du fermier
    const wrong = stepsOf('masala-1', 1)[0].options[2].replace(/\$/g, '');
    expect(toFrac(wrong)).toEqual(down(5));
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(50);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$40 \\times 0{,}75 = 31$', 'mutant')).toThrow();
    expect(() => checkText('$0{,}75 \\times 1{,}2 = 0{,}91$', 'mutant')).toThrow();
    expect(() => checkText('$\\dfrac{49200}{160} = 307$', 'mutant')).toThrow();
    expect(() => checkText('$7380 > 7500$', 'mutant')).toThrow();
    expect(checkText('$1 + \\dfrac{2{,}5}{100} = 1{,}025$ و $7\\,380\\,000 \\div 1000 = 7380$ و $\\dfrac{0{,}6}{6{,}7} \\times 100 \\simeq 8{,}96$', 'ok')).toBe(3);
  });
});
