import { describe, it, expect } from 'vitest';
import * as ST from '@smarter-academy/core/arithmetic/statistics.js';
import { validateProblem, demandsOf } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : statistics.js (fractions { n, d }) ; `num` ne sert qu'à comparer à un `expected`. ──
const num = (f) => f.n / f.d;
const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const answersOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric' && s.role === 'answer').map((s) => s.expected);
const computesOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric' && s.role === 'compute').map((s) => s.expected);
const choiceOf = (id, part, k) => stepsOf(id, part).filter((st) => st.kind === 'choice')[k];
/** Le tableau `{ head, rows }` d'une مسألة, relu en nombres (première colonne = en-têtes ; « ؟ » = NaN). */
const rowOf = (id, r = 0) => PROBLEM[id].table.rows[r].slice(1).map(Number);
const headOf = (id) => PROBLEM[id].table.head.slice(1).map(Number);

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes de solution, bonne option) ──
// Chaque formule $…$ est découpée sur = < > ; chaque membre purement numérique (entiers, décimaux « 2{,}2 »,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué et chaque relation entre deux membres numériques VOISINS
// est vérifiée. Les membres contenant une lettre (m, Med, N, x, a) ou du texte sont ignorés.
const EPS = 1e-9;
function evalExpr(src) {
  const s = src
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
    .replace(/(\d)\{,\}(\d)/g, '$1.$2')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(s) || !/\d/.test(s)) return null;
  let i = 0;
  const atom = () => {
    if (s[i] === '(') { i++; const v = sum(); if (s[i] !== ')') throw new Error(`bad parens in ${src}`); i++; return v; }
    if (s[i] === '-') { i++; return -atom(); }
    const j = i; while (/[\d.]/.test(s[i] ?? '')) i++;
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
  for (const [, f] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const parts = f.split(/(=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = { '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)), '<': x < y - EPS, '>': x > y + EPS }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}

// ── Les séries des six وضعيات, telles que le test les connaît (le support de chaque وضعية doit les dire) ──
const BOOKS = [0, 1, 2, 3, 4, 5], BOOK_F = [2, 4, 6, 5, 2, 1], GIFT = 150;
const DELAY = [0, 5, 10, 15, 20], DELAY_F = [3, 4, 5, 2, 1], PAY = 500;
const PIE = [25, 20, 15, 40], NOTEBOOKS = 480, SECOND = 90;
const PAPER = [18, 22, 26, 30, 20], PAPER_MEAN = 25, PRICE = 12, TREES = 40;
const CHAIRS = [2, 3, 4, 5, 6], CHAIR_F = [2, null, 6, 4, 3], DAYS = 20, BONUS = 300;
const EDGES = [0, 2, 4, 6, 8], HOURS_F = [12, 18, 6, 4], TRIP = 200;

describe('les six وضعيات d\'entraînement de أدمج تعلّماتي (wadiya-idmajiya-ihsa)', () => {
  it('respect the GuidedProblem contract', () => {
    for (const p of PROBLEMS) expect(validateProblem(p)).toEqual([]);
  });

  it('match their modules (1 to 6, practice_lab), then the analysis (7) and the test (8), total ≤ 90 min', () => {
    const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
    expect(problemModules.map((m) => [m.number, m.id, m.slug, m.stage])).toEqual(
      [1, 2, 3, 4, 5, 6].map((k) => [k, `0${k}`, `wadiya-${k}`, 'practice_lab']),
    );
    expect(LESSON_CONFIG.modules.map((m) => m.number)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(LESSON_CONFIG.modules.slice(7).map((m) => [m.number, m.id, m.slug])).toEqual([[7, '07', 'al-wadiya'], [8, '08', 'itqan']]);
    expect(LESSON_CONFIG.modules.at(-1)).toMatchObject({ stage: 'evaluation', title: 'إختبار أولي' });
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBeLessThanOrEqual(90);
    expect(PROBLEMS.map((p) => p.id)).toEqual(problemModules.map((m) => m.slug));
    const situations = LESSON_CONFIG.resources.filter((r) => r.code.startsWith('wadiya-'));
    expect(situations.map((r) => [r.code, r.module])).toEqual([1, 2, 3, 4, 5, 6].map((k) => [`wadiya-${k}`, k]));
    expect(LESSON_CONFIG.lessonProblem).toBeUndefined();
  });

  it('every training module is titled « الوضعية التدريبية N », is a platform addition, has its own tone and a drawn support', () => {
    LESSON_CONFIG.modules.filter((m) => m.track === 'problem').forEach((m, i) => expect(m.title.startsWith(`الوضعية التدريبية ${i + 1} —`), m.title).toBe(true));
    PROBLEMS.forEach((p, i) => {
      expect(p.title.startsWith(`الوضعية التدريبية ${i + 1} —`), p.title).toBe(true);
      expect(p.source.type, p.id).toBe('platform_addition');
      expect(Boolean(p.table || p.figure || p.illustration), p.id).toBe(true);
    });
    expect(new Set(PROBLEMS.map((p) => p.tone)).size).toBe(6);
    // the textbook situation (module 7: medals 30 / 69 %) and the test (module 8: 20 / 64 %) stay unseen
    for (const p of PROBLEMS) expect(JSON.stringify(p), p.id).not.toMatch(/ميدالي|69|64%|البطولة/);
  });

  it('no sub-step is an assessment: mastery comes from the final test only', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) expect(s.assessment, p.id).toBeUndefined();
  });

  it('every demand has its own answer (owner rule 2026-10-06), and 2 to 4 parts each', () => {
    for (const p of PROBLEMS) {
      expect(p.parts.length, p.id).toBeGreaterThanOrEqual(2);
      expect(p.parts.length, p.id).toBeLessThanOrEqual(4);
      for (const part of p.parts) {
        expect(part.asks.length, `${p.id} ${part.label}`).toBeGreaterThanOrEqual(demandsOf(part.question));
        part.asks.forEach((_, k) => {
          expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
        });
      }
    }
  });

  it('knowledge ids used by `requires` are the lesson\'s priorKnowledge (nothing taught later)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) for (const s of part.steps) {
      for (const r of s.requires ?? []) expect(LESSON_CONFIG.priorKnowledge, `${p.id}: ${r}`).toContain(r);
    }
  });

  it('no bare formula, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج; « الكفاءة » vocabulary', () => {
    const texts = (p) => [p.statement, ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b(Med|m|N)\b|\bDA\b|نقاط التعلّم|نقطة التعلّم/);
    }
  });

  it('each support is the series the test recomputes (the table / chart shows exactly these numbers)', () => {
    expect(headOf('wadiya-1')).toEqual(BOOKS);
    expect(rowOf('wadiya-1')).toEqual(BOOK_F);
    expect(PROBLEM['wadiya-2'].figure.bars.map((b) => Number(b.label))).toEqual(DELAY);
    expect(PROBLEM['wadiya-2'].figure.bars.map((b) => b.value)).toEqual(DELAY_F);
    expect(PROBLEM['wadiya-3'].figure.parts.map((q) => q.value)).toEqual(PIE);
    expect(PIE.reduce((s, v) => s + v, 0)).toBe(100);
    expect(rowOf('wadiya-4').slice(0, 5)).toEqual(PAPER);
    expect(Number.isNaN(rowOf('wadiya-4')[5])).toBe(true);
    expect(headOf('wadiya-5')).toEqual(CHAIRS);
    expect(rowOf('wadiya-5').map((v) => (Number.isNaN(v) ? null : v))).toEqual(CHAIR_F);
    expect(PROBLEM['wadiya-6'].figure.edges).toEqual(EDGES);
    expect(PROBLEM['wadiya-6'].figure.values).toEqual(HOURS_F);
    const has = (id, ...nums) => nums.forEach((n) => expect(PROBLEM[id].statement, `${id} ${n}`).toContain(String(n)));
    has('wadiya-1', 20, GIFT); has('wadiya-2', PAY, 15); has('wadiya-3', NOTEBOOKS, SECOND, 25);
    has('wadiya-4', PAPER_MEAN, PRICE, TREES); has('wadiya-5', DAYS, BONUS); has('wadiya-6', 40, TRIP);
  });

  // ── Chaque nombre attendu, recalculé ─────────────────────────────────────
  it('وضعية 1 — library: at most / at least, mean, median', () => {
    const N = ST.total(BOOK_F);
    expect(N).toBe(20);
    const atMost2 = ST.cumulativeUp(BOOK_F)[2];
    expect(answersOf('wadiya-1', 0)).toEqual([atMost2, (100 * atMost2) / N]);
    expect(atMost2).toBe(12);
    const sum = num(ST.weightedSum(BOOKS, BOOK_F));
    expect(computesOf('wadiya-1', 1)).toEqual([sum]);
    expect(answersOf('wadiya-1', 1)).toEqual([num(ST.mean(BOOKS, BOOK_F)), num(ST.median(BOOKS, BOOK_F))]);
    const T = ST.table(BOOKS, BOOK_F);
    const atLeast3 = ST.countAtLeast(T, 3);
    expect(answersOf('wadiya-1', 2)).toEqual([atLeast3, atLeast3 * GIFT]);
    expect(ST.cumulativeDown(BOOK_F)[3]).toBe(atLeast3);
    // the trap of the choice: « على الأكثر 3 » is 17, not 8
    expect(ST.cumulativeUp(BOOK_F)[3]).toBe(17);
    expect(ST.medianRanks(N).ranks).toEqual([10, 11]);
  });

  it('وضعية 2 — bus delays: N odd, range, mean, median, ≥ 15', () => {
    const N = ST.total(DELAY_F);
    expect(N).toBe(15);
    expect(computesOf('wadiya-2', 0)).toEqual([DELAY_F[2]]);
    expect(answersOf('wadiya-2', 0)).toEqual([N, num(ST.range(DELAY, DELAY_F))]);
    expect(computesOf('wadiya-2', 1)).toEqual([num(ST.weightedSum(DELAY, DELAY_F))]);
    expect(answersOf('wadiya-2', 1)).toEqual([num(ST.mean(DELAY, DELAY_F)), num(ST.median(DELAY, DELAY_F))]);
    expect(ST.medianRanks(N)).toEqual({ odd: true, ranks: [8] });
    const atLeast15 = ST.countAtLeast(ST.table(DELAY, DELAY_F), 15);
    expect(answersOf('wadiya-2', 2)).toEqual([atLeast15, atLeast15 * PAY]);
    // the trap of the choice: « 15 على الأكثر » is 14 days
    expect(ST.cumulativeUp(DELAY_F)[3]).toBe(14);
    // the range is NOT the gap of the heights (5 - 1)
    expect(Math.max(...DELAY_F) - Math.min(...DELAY_F)).not.toBe(num(ST.range(DELAY, DELAY_F)));
  });

  it('وضعية 3 — pie: shares of 480, the whole from 25 % = 90, the 15 % sector', () => {
    expect(answersOf('wadiya-3', 0)).toEqual([(PIE[0] * NOTEBOOKS) / 100, (PIE[3] * NOTEBOOKS) / 100]);
    expect(answersOf('wadiya-3', 1)).toEqual([(SECOND * 100) / PIE[0]]);
    expect((PIE[0] / 100) * ((SECOND * 100) / PIE[0])).toBe(SECOND);
    expect(answersOf('wadiya-3', 2)).toEqual([num(ST.pieAngles(PIE)[2])]);
    expect(answersOf('wadiya-3', 2)).toEqual([54]);
    // the wrong whole of the choice: 25 % × 90 is smaller than 90
    expect(0.25 * SECOND).toBeLessThan(SECOND);
  });

  it('وضعية 4 — paper club: hidden value by the mean, range, even median, 40 % of the price', () => {
    const known = PAPER.reduce((s, v) => s + v, 0);
    const x = num(ST.solveValueForMean([...PAPER, 0], [1, 1, 1, 1, 1, 1], PAPER_MEAN, 5));
    expect(computesOf('wadiya-4', 0)).toEqual([PAPER_MEAN * 6, known]);
    expect(answersOf('wadiya-4', 0)).toEqual([x]);
    expect(x).toBe(34);
    const all = [...PAPER, x];
    expect(num(ST.mean(all))).toBe(PAPER_MEAN);
    expect(answersOf('wadiya-4', 1)).toEqual([num(ST.range(all)), num(ST.median(all))]);
    expect(all.length % 2).toBe(0);
    // the trap of the choice: the two middle days of the TABLE give 28, not the median
    expect((PAPER[2] + PAPER[3]) / 2).toBe(28);
    expect(num(ST.median(all))).not.toBe(28);
    const price = PAPER_MEAN * 6 * PRICE;
    expect(answersOf('wadiya-4', 2)).toEqual([price, (TREES * price) / 100]);
  });

  it('وضعية 5 — carpentry: hidden frequency by N, mean, median, ≥ 5 chairs', () => {
    const known = CHAIR_F.filter((f) => f != null).reduce((s, f) => s + f, 0);
    const a = DAYS - known;
    expect(computesOf('wadiya-5', 0)).toEqual([known]);
    expect(answersOf('wadiya-5', 0)).toEqual([a]);
    const F = CHAIR_F.map((f) => (f == null ? a : f));
    expect(ST.total(F)).toBe(DAYS);
    expect(computesOf('wadiya-5', 1)).toEqual([num(ST.weightedSum(CHAIRS, F))]);
    expect(answersOf('wadiya-5', 1)).toEqual([num(ST.mean(CHAIRS, F)), num(ST.median(CHAIRS, F))]);
    const atLeast5 = ST.countAtLeast(ST.table(CHAIRS, F), 5);
    expect(answersOf('wadiya-5', 2)).toEqual([atLeast5, (100 * atLeast5) / DAYS, atLeast5 * BONUS]);
    expect(ST.cumulativeUp(F)[3]).toBe(17);
  });

  it('وضعية 6 — histogram: < 4 h, centres mean, median class, ≥ 4 h', () => {
    const N = ST.total(HOURS_F);
    expect(N).toBe(40);
    const classes = ST.classesFrom(0, 2, 4);
    const centres = classes.map((c) => num(ST.center(c)));
    expect(centres).toEqual([1, 3, 5, 7]);
    expect(EDGES.slice(0, 4)).toEqual(classes.map((c) => num(c.lo)));
    const below4 = HOURS_F[0] + HOURS_F[1];
    expect(answersOf('wadiya-6', 0)).toEqual([below4, (100 * below4) / N]);
    expect(computesOf('wadiya-6', 1)).toEqual([num(ST.weightedSum(centres, HOURS_F)), 20]);
    expect(answersOf('wadiya-6', 1)).toEqual([num(ST.groupedMean(classes, HOURS_F))]);
    expect(ST.medianClass(HOURS_F)).toBe(1);
    expect(choiceOf('wadiya-6', 1, 1).options[0]).toBe('$[2 ; 4[$');
    expect(choiceOf('wadiya-6', 1, 1).correct).toBe(0);
    expect(ST.medianRanks(N).ranks[0]).toBe(20);
    const atLeast4 = HOURS_F[2] + HOURS_F[3];
    expect(answersOf('wadiya-6', 2)).toEqual([atLeast4, atLeast4 * TRIP]);
    expect(ST.cumulativeDown(HOURS_F)[2]).toBe(atLeast4);
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
    expect(() => checkText('$m = \\dfrac{44}{20} = 2{,}3$', 'mutant')).toThrow();
    expect(() => checkText('$5 + 2 + 1 = 9$', 'mutant')).toThrow();
    expect(checkText('$\\dfrac{22 + 26}{2} = 24$ و $0{,}25 \\times 360 = 90$', 'ok')).toBe(2);
  });
});
