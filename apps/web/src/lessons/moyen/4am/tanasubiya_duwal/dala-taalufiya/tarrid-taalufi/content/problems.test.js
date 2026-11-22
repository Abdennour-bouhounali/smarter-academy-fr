import { describe, it, expect } from 'vitest';
import { validateProblem } from '../../../../../../common/problems/guidedProblem';
import { PROBLEMS, PROBLEM } from './problems';
import { LESSON_CONFIG } from '../lesson.config';

// ── Les fonctions affines de la leçon, exactes (entiers) ──
const affine = (a, b) => (x) => a * x + b;
/** Solution de a1 x + b1 = a2 x + b2 (exacte : doit être un entier ici). */
const crossing = ([a1, b1], [a2, b2]) => {
  expect(a1).not.toBe(a2);
  expect(Math.abs((b2 - b1) % (a1 - a2))).toBe(0);
  return (b2 - b1) / (a1 - a2);
};

const stepsOf = (id, part) => PROBLEM[id].parts[part].steps;
const expectedOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'numeric').map((s) => s.expected);
const choicesOf = (id, part) => stepsOf(id, part).filter((s) => s.kind === 'choice');
const correctOf = (id, part, k) => { const s = choicesOf(id, part)[k]; return s.options[s.correct]; };

// ── Vérificateur des RELATIONS écrites (explain, prompt, solution lines, bonne option) ──
// Chaque formule $…$ est découpée sur = < > \leq \geq \neq ; chaque membre purement numérique (entiers,
// ×, ÷, +, −, parenthèses, \dfrac{n}{m}) est évalué, et chaque relation entre deux membres numériques
// VOISINS est vérifiée. Les membres contenant une lettre (x, b, f(…)) sont ignorés.
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
    const parts = f.split(/(\\leq|\\geq|\\neq|=|<|>)/);
    for (let k = 1; k + 1 < parts.length; k += 2) {
      const [x, op, y] = [evalExpr(parts[k - 1]), parts[k], evalExpr(parts[k + 1])];
      if (x == null || y == null) continue;
      const ok = {
        '=': Math.abs(x - y) < EPS * Math.max(1, Math.abs(x)),
        '<': x < y - EPS, '>': x > y + EPS, '\\leq': x <= y + EPS, '\\geq': x >= y - EPS, '\\neq': Math.abs(x - y) > EPS,
      }[op];
      expect(ok, `${where}: ${f}`).toBe(true);
      checked++;
    }
  }
  return checked;
}
/** a et b d'une écriture « f(x) = ax + b » (ou « −7x + 62 », « 350x »). */
function affineOf(tex) {
  const rhs = tex.replace(/\$/g, '').split('=').at(-1).replace(/\s+/g, '');
  const m = rhs.match(/^(-?\d*)x([+-]\d+)?$/);
  if (!m) return null;
  const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  return [a, m[2] ? Number(m[2]) : 0];
}

describe('les مسائل du درس 5 (unité 7) « حل مشكلات وترييض وضعيات بتوظيف الدالة التآلفية »', () => {
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
    expect(PROBLEMS.map((p) => p.id)).toEqual(['masala-1', 'masala-2', 'masala-3']);
  });

  it('every demand has its own answer (owner rule 2026-10-06)', () => {
    for (const p of PROBLEMS) for (const part of p.parts) {
      part.asks.forEach((_, k) => {
        expect(part.steps.some((s) => s.ask === k && s.kind !== 'solution'), `${p.id} ${part.label} ask ${k + 1}`).toBe(true);
      });
    }
  });

  it('data: 4–5 useful items, and at least one useless item that is a number', () => {
    for (const p of PROBLEMS) {
      const useful = p.data.filter((d) => d.useful).length;
      expect(useful).toBeGreaterThanOrEqual(4);
      expect(useful).toBeLessThanOrEqual(5);
      expect(p.data.some((d) => !d.useful && /\d/.test(d.text)), p.id).toBe(true);
      for (const d of p.data) expect(d.text.includes('$'), `${p.id} ${d.id}`).toBe(false);
    }
  });

  it('no bare letter, « DA » or a/b in the Arabic text — every formula is a $…$ island; money in دج', () => {
    const texts = (p) => [p.statement, ...p.data.map((d) => d.text), ...p.parts.flatMap((part) => [part.question, ...part.asks, ...part.steps.flatMap((s) => [s.prompt, s.explain, ...(s.options ?? []), ...(s.lines ?? []), ...(s.rows ?? []).flatMap((r) => [r.label, r.correction, ...r.options])])])].filter(Boolean);
    for (const p of PROBLEMS) for (const t of texts(p)) {
      const prose = t.replace(/\$[^$]*\$/g, '');
      expect(prose, `${p.id}: ${t}`).not.toMatch(/\\|\^|\d\s*\/\s*\d|\b[xyabhfgv]\b|\bDA\b|نقاط التعلّم/);
    }
  });

  it('every written relation (explain, prompt, solution lines, correct options) is exact', () => {
    let checked = 0;
    for (const p of PROBLEMS) p.parts.forEach((part) => part.steps.forEach((s, si) => {
      const where = `${p.id} ${part.label} step ${si + 1}`;
      for (const t of [s.explain, s.prompt, ...(s.lines ?? [])].filter(Boolean)) checked += checkText(t, where);
      if (s.kind === 'choice') checked += checkText(s.options[s.correct], `${where} (correct option)`);
    }));
    expect(checked).toBeGreaterThan(45);
  });

  it('the relation checker fails on a mutated number (self-test)', () => {
    expect(() => checkText('$150 \\times 12 + 1800 = 3700$', 'mutant')).toThrow();
    expect(() => checkText('$-7 \\times 3 + 62 = 40$', 'mutant')).toThrow();
    expect(() => checkText('$4550 > 4600$', 'mutant')).toThrow();
    expect(() => checkText('$350 \\times 13 \\leq 4500$', 'mutant')).toThrow();
    expect(checkText('$\\dfrac{4500}{350} = \\dfrac{90}{7}$ و $-4 \\times 6 + 47 = 23$ و $23 > 20$', 'ok')).toBe(3);
  });

  it('مسألة 1 — le stade : f(x) = 150x + 1800, g(x) = 350x, égalité à 9 matchs, budget 4500 دج', () => {
    const fixed = 1800, perA = 150, perB = 350, budget = 4500;
    const f = affine(perA, fixed), g = affine(perB, 0);
    expect(affineOf(correctOf('masala-1', 0, 0))).toEqual([perA, fixed]);
    // 1) f(12) ; l'antécédent de 4200
    const x4200 = crossing([perA, fixed], [0, 4200]);
    expect(expectedOf('masala-1', 0)).toEqual([f(12), 4200 - fixed, x4200]);
    expect([f(12), x4200]).toEqual([3600, 16]);
    expect(f(x4200)).toBe(4200);
    // 2) g, l'égalité, l'inéquation
    expect(affineOf(correctOf('masala-1', 1, 0))).toEqual([perB, 0]);
    const eq = crossing([perA, fixed], [perB, 0]);
    expect(expectedOf('masala-1', 1)).toEqual([fixed, eq]);
    expect([eq, f(eq), g(eq)]).toEqual([9, 3150, 3150]);
    expect(f(eq + 1)).toBeLessThan(g(eq + 1)); // A moins chère après 9
    expect(f(eq - 1)).toBeGreaterThan(g(eq - 1)); // B moins chère avant
    expect(choicesOf('masala-1', 1)[2].correct).toBe(0);
    // 3) budget : le plus grand entier x tel que f(x) ≤ 4500, et g(x) ≤ 4500
    const maxN = (h) => { let n = 0; while (h(n + 1) <= budget) n++; return n; };
    const nA = maxN(f), nB = maxN(g);
    expect([nA, nB]).toEqual([18, 12]);
    expect(f(nA)).toBe(budget); // pile 4500
    expect(g(nB + 1)).toBeGreaterThan(budget); // la 13e dépasse : 4550
    expect(expectedOf('masala-1', 2)).toEqual([budget - fixed, nA, nB, nA - nB]);
    expect(correctOf('masala-1', 2, 2)).toMatch(/^الصيغة A/);
    expect(Math.round(budget / perB)).toBe(13); // le distracteur « arrondir au plus proche »
  });

  it('مسألة 2 — l’école de musique : le graphique, l’intersection (12 ; 6000), l’économie d’Anas', () => {
    const join = 2400, perA = 300, perB = 500;
    const f = affine(perA, join), g = affine(perB, 0);
    // le `visual` trace exactement f et g, et le croisement est un nœud de la grille dans le cadre
    const v = PROBLEM['masala-2'].visual;
    expect(v.functions.map((fn) => [fn.a, fn.b])).toEqual([[perA, join], [perB, 0]]);
    const eq = crossing([perA, join], [perB, 0]);
    expect([eq, f(eq), g(eq)]).toEqual([12, 6000, 6000]);
    expect(eq % v.xStep).toBe(0);
    expect(f(eq) % v.yStep).toBe(0);
    expect(eq).toBeLessThanOrEqual(v.range.xMax);
    expect(g(v.range.xMax)).toBeLessThanOrEqual(v.range.yMax);
    expect((v.range.xMax - v.range.xMin) * v.unit).toBeLessThanOrEqual(460);
    expect((v.range.yMax - v.range.yMin) * v.unitY).toBeLessThanOrEqual(460);
    // 1) les deux fonctions ; 300 = prix de la séance, 2400 = adhésion
    expect(affineOf(correctOf('masala-2', 0, 0))).toEqual([perA, join]);
    expect(affineOf(correctOf('masala-2', 0, 1))).toEqual([perB, 0]);
    const batch = stepsOf('masala-2', 0).find((s) => s.kind === 'batch');
    expect(batch.rows.map((r) => r.options[r.correct])).toEqual(['ثمن الحصة الواحدة، يُدفع عن كل حصة', 'الانخراط، يُدفع مرّة واحدة']);
    expect(f(0)).toBe(join);
    // 2) lecture, vérification, 8 séances
    expect(expectedOf('masala-2', 1)).toEqual([eq, join, f(eq)]);
    expect(g(8)).toBeLessThan(f(8));
    expect([g(8), f(8)]).toEqual([4000, 4800]);
    // 3) Anas a payé 7500 دج avec A
    const n = crossing([perA, join], [0, 7500]);
    expect(expectedOf('masala-2', 2)).toEqual([7500 - join, n, g(n), g(n) - 7500]);
    expect([n, g(n), g(n) - 7500]).toEqual([17, 8500, 1000]);
    expect(n).toBeGreaterThan(eq);
  });

  it('مسألة 3 — les réservoirs : f(x) = −7x + 62, g(x) = −4x + 47, égaux à 5 h, voyant à 6 L', () => {
    const f = affine(-7, 62), g = affine(-4, 47), reserve = 6, trip = 7;
    expect(affineOf(correctOf('masala-3', 0, 0))).toEqual([-7, 62]);
    expect(affineOf(correctOf('masala-3', 0, 1))).toEqual([-4, 47]);
    expect(expectedOf('masala-3', 0)).toEqual([f(3)]);
    expect(f(3)).toBe(41);
    // le modèle reste valable pendant tout le voyage (jamais sous la réserve à l'aller)
    expect(f(trip)).toBeGreaterThan(reserve);
    expect(g(trip)).toBeGreaterThan(reserve);
    // 2) égalité et inéquation
    const eq = crossing([-7, 62], [-4, 47]);
    expect(expectedOf('masala-3', 1)).toEqual([62 - 47, eq, f(eq)]);
    expect([eq, f(eq), g(eq)]).toEqual([5, 27, 27]);
    expect(g(eq + 1)).toBeGreaterThan(f(eq + 1));
    expect(g(eq - 1)).toBeLessThan(f(eq - 1));
    // 3) retour avec 34 L : voyant quand h(x) = 6 ; réservoir minimal b tel que −7 × 7 + b ≥ 6
    const back = 34, h = affine(-7, back);
    expect(affineOf(correctOf('masala-3', 2, 0))).toEqual([-7, back]);
    const light = crossing([-7, back], [0, reserve]);
    expect(light).toBe(4);
    expect(light).toBeLessThan(trip);
    expect(h(light)).toBe(reserve);
    const minStart = reserve + 7 * trip;
    expect(affine(-7, minStart)(trip)).toBe(reserve);
    expect(expectedOf('masala-3', 2)).toEqual([light, minStart, minStart - back]);
    expect([minStart, minStart - back]).toEqual([55, 21]);
    // les réponses diffèrent des seuils de l'énoncé (pas de confusion 6 h / 6 L, 5 h / 5 h)
    expect(light).not.toBe(reserve);
    expect(light).not.toBe(eq);
  });
});
