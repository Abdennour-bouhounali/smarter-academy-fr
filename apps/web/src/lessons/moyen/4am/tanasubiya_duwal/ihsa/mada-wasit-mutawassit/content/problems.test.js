import { describe, it, expect } from 'vitest';
import * as ST from '@smarter-academy/core/arithmetic/statistics.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Arithmétique EXACTE : statistics.js (fractions { n, d }) ; `num` ne sert qu'à comparer à un `expected`. ──
const num = (f) => f.n / f.d;
const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choiceOf = (id, part, k) => stepsOf(id, part).filter((st) => st.kind === 'choice')[k];
const correctOf = (id, part, k) => { const s = choiceOf(id, part, k); return s.options[s.correct]; };
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
/** Le tableau `{ head, rows }` d'une مسألة, relu en nombres (première colonne = en-têtes). */
const tableOf = (id) => { const { head, rows } = PROBLEM[id].table; return [head.slice(1).map(Number), ...rows.map((r) => r.slice(1).map(Number))]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, lignes de solution, bonne option) ──
// Chaque formule $…$ est découpée sur = < > ; chaque membre purement numérique (entiers, décimaux « 44{,}1 »,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué et chaque relation entre deux membres numériques VOISINS
// est vérifiée. Les membres contenant une lettre (m, Med, N, P) ou du texte sont ignorés.
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

// ── Les séries des trois مسائل, telles que le test les connaît (et le tableau de chaque مسألة doit les dire) ──
const OUED = [43, 45, 41, 47, 44, 39, 46, 48, 42, 46];
const SAND = 32;
const AC_FROM = 44, AC_COST = 120;
const MARKS = [4, 6, 7, 8, 9, 10, 12, 14, 17];
const PUPILS = [1, 2, 4, 4, 4, 3, 5, 4, 3];
const GROUP = 4, SESSIONS = 6, PAY = 1500;
const TAM = [-2, -1, 0, 1, 2, 3, 4, 6];
const NIGHTS = [3, 4, 9, 4, 4, 3, 2, 2];
const JULY = [21, 27];
const LITRES = 12, FUEL = 29;

describe('les مسائل du درس 2 (unité 8) « مدى ووسيط ومتوسط سلسلة إحصائية »', () => {
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
    expect(LESSON_CONFIG.modules.reduce((t, m) => t + m.estimatedMin, 0)).toBe(79);
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

  it('no bare formula, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? [])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b(Med|m|N)\b|\bDA\b|نقاط التعلّم|نقطة التعلّم/);
    }
  });

  it('each table is the series the test recomputes (the statement shows exactly these numbers)', () => {
    expect(tableOf('masala-1')).toEqual([OUED.map((_, i) => i + 1), OUED]);
    expect(LESSON_CONFIG.lessonProblem.statement).toContain(OUED.map((v) => `$${v}$`).join(' ، '));
    expect(tableOf('masala-2')).toEqual([MARKS, PUPILS]);
    expect(tableOf('masala-3')).toEqual([TAM, NIGHTS]);
    expect(ST.total(PUPILS)).toBe(30);
    expect(ST.total(NIGHTS)).toBe(31);
    expect(PROBLEM['masala-2'].statement).toContain('30 تلميذًا');
    expect(PROBLEM['masala-3'].statement).toContain('31 ليلة');
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
    expect(() => checkText('$m = \\dfrac{441}{10} = 44{,}2$', 'mutant')).toThrow();
    expect(() => checkText('$6 - (-2) = 4$', 'mutant')).toThrow();
    expect(() => checkText('$7 > \\dfrac{31}{2}$', 'mutant')).toThrow();
    expect(checkText('$\\dfrac{44 + 45}{2} = 44{,}5$ و $-6 - 4 + 0 + 4 + 8 + 9 + 8 + 12 = 31$ و $10{,}3 > 10$', 'ok')).toBe(3);
  });

  it('مسألة 1 — El Oued : range, mean, median (even, the unsorted-middle trap), the sand day, the air conditioner', () => {
    // 1) dix jours
    const range = num(ST.range(OUED)), mean = ST.mean(OUED), med = ST.median(OUED);
    expect([range, num(mean), num(med)]).toEqual([9, 44.1, 44.5]);
    expect(Math.max(...OUED) - Math.min(...OUED)).toBe(range);
    expect(OUED.reduce((a, b) => a + b, 0)).toBe(441);
    expect(expectedOf('masala-1', 0)).toEqual([range, 441, num(mean), num(med)]);
    // le piège : le milieu de la liste ÉCRITE (jours 5 et 6) n'est pas la médiane
    const unsortedMiddle = (OUED[4] + OUED[5]) / 2;
    expect(unsortedMiddle).toBe(41.5);
    expect(unsortedMiddle).not.toBe(num(med));
    expect(ST.medianRanks(OUED.length)).toEqual({ odd: false, ranks: [5, 6] });
    expect(correctOf('masala-1', 0, 0)).toBe(`$${Math.max(...OUED)} - ${Math.min(...OUED)}$`);
    // 2) le 11e jour, 32 : la moyenne bouge plus que la médiane
    const all = [...OUED, SAND];
    const mean2 = ST.mean(all), med2 = ST.median(all);
    expect([num(mean2), num(med2)]).toEqual([43, 44]);
    expect(ST.medianRanks(all.length)).toEqual({ odd: true, ranks: [6] });
    expect(expectedOf('masala-1', 1)).toEqual([441 + SAND, num(mean2), num(med2)]);
    expect(num(LIN.sub(mean, mean2))).toBeCloseTo(1.1, 12);
    expect(num(LIN.sub(med, med2))).toBe(0.5);
    expect(num(LIN.sub(mean, mean2))).toBeGreaterThan(num(LIN.sub(med, med2)));
    expect(num(ST.range(all))).toBe(16);
    // 3) « 44 درجة أو أكثر » : la médiane 44 (rang 6 sur 11) garantit la moitié au moins
    const T = ST.tableOf(all);
    const acDays = ST.countAtLeast(T, AC_FROM);
    expect(acDays).toBe(all.length - 6 + 1);
    expect(acDays).toBeGreaterThan(all.length / 2);
    expect(ST.countWhere(T, '>', AC_FROM)).toBe(5); // le distracteur « تفوق 44 فقط »
    expect(expectedOf('masala-1', 2)).toEqual([acDays, acDays * AC_COST]);
    expect(acDays * AC_COST).toBe(720);
  });

  it('مسألة 2 — the BEM mock : weighted mean 10,3 > 10 but median 9,5 ; the support groups', () => {
    const mean = ST.mean(MARKS, PUPILS), med = ST.median(MARKS, PUPILS), range = num(ST.range(MARKS, PUPILS));
    expect(num(ST.weightedSum(MARKS, PUPILS))).toBe(309);
    expect([num(mean), range]).toEqual([10.3, 13]);
    expect(expectedOf('masala-2', 0)).toEqual([309, num(mean), range]);
    // les distracteurs de la traduction : sans effectifs, ou divisé par le nombre de notes
    expect(num(ST.mean(MARKS))).toBeCloseTo(87 / 9, 12);
    expect(MARKS.reduce((a, b) => a + b, 0)).toBe(87);
    // 2) N = 30 pair : rangs 15 et 16
    expect(ST.medianRanks(30)).toEqual({ odd: false, ranks: [15, 16] });
    const cum = ST.cumulativeUp(PUPILS);
    expect(cum[MARKS.indexOf(9)]).toBe(15);
    expect(num(ST.valueAtRank(MARKS, PUPILS, 15))).toBe(9);
    expect(num(ST.valueAtRank(MARKS, PUPILS, 16))).toBe(10);
    expect(num(med)).toBe(9.5);
    expect(expectedOf('masala-2', 1)).toEqual([15, num(med)]);
    // « le milieu du tableau » (5e note sur 9) n'est pas la médiane ; le directeur a tort
    expect(MARKS[(MARKS.length - 1) / 2]).toBe(9);
    const T = ST.table(MARKS, PUPILS);
    expect(ST.countAtLeast(T, 10)).toBe(15);
    expect(ST.countAtLeast(T, 10)).not.toBeGreaterThan(30 / 2);
    expect(num(mean)).toBeGreaterThan(10);
    // 3) les groupes de soutien (au plus 4) et la paie
    const weak = ST.countWhere(T, '<', 10);
    const d = div(weak, GROUP);
    expect([weak, d.q, d.r]).toEqual([15, 3, 3]);
    const groups = d.r ? d.q + 1 : d.q;
    expect(expectedOf('masala-2', 2)).toEqual([weak, d.q, groups, groups * SESSIONS * PAY]);
    expect(groups * SESSIONS * PAY).toBe(36000);
  });

  it('مسألة 3 — Tamanrasset : negative values, N = 31 odd, Med = 0, « < 0 » is not « ≤ 0 »', () => {
    const range = num(ST.range(TAM, NIGHTS)), mean = num(ST.mean(TAM, NIGHTS)), med = num(ST.median(TAM, NIGHTS));
    expect([range, mean, med]).toEqual([8, 1, 0]);
    expect(num(ST.weightedSum(TAM, NIGHTS))).toBe(31);
    expect(expectedOf('masala-3', 0)).toEqual([range, 31, mean]);
    // les distracteurs : 6 − 2 (le signe oublié) ; les signes oubliés dans la somme (51)
    expect(6 - 2).not.toBe(range);
    expect(TAM.reduce((s, v, i) => s + Math.abs(v) * NIGHTS[i], 0)).toBe(51);
    // 2) rang 16 ; cumuls 3, 7, 16
    expect(ST.medianRanks(31)).toEqual({ odd: true, ranks: [16] });
    expect(ST.cumulativeUp(NIGHTS).slice(0, 3)).toEqual([3, 7, 16]);
    const julyRange = JULY[1] - JULY[0];
    expect(expectedOf('masala-3', 1)).toEqual([16, med, julyRange]);
    expect(range).toBeGreaterThan(julyRange);
    // « le milieu du tableau » : (1 + 2)/2 ≠ Med
    expect((TAM[3] + TAM[4]) / 2).not.toBe(med);
    // 3) le chauffage : < 0 seulement
    const T = ST.table(TAM, NIGHTS);
    const below = ST.countWhere(T, '<', 0);
    expect([below, ST.countAtMost(T, 0)]).toEqual([7, 16]);
    expect(below).toBeLessThan(31 / 2);
    expect(expectedOf('masala-3', 2)).toEqual([below, below * LITRES, below * LITRES * FUEL]);
    expect(below * LITRES * FUEL).toBe(2436);
  });
});
